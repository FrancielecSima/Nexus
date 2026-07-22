/* ============================================================
   EMPRESA > PAINEL FINANCEIRO (dinâmico)
   Agora com: status de pagamento real, SLA calculado a partir de
   timestamps reais, filtro de período no gráfico (últimos 6 meses /
   ano / intervalo personalizado) e exportação em CSV.
============================================================ */
function PageFinanceiro({ tickets, caixa, orcamentos, gastos, terceirizados, clientes, equipe }){
  const emAtendimento = tickets.filter(t=>t.status==='em_atendimento').length;
  const aguardando = tickets.filter(t=>t.status==='aguardando_retorno').length;
  const encerrados = tickets.filter(t=>t.status==='encerrado').length;
  const recentes = tickets.slice(0,4);

  const comSla = tickets.filter(t=>t.primeiraRespostaEm);
  const slaMedioMs = comSla.length ? comSla.reduce((s,t)=>s+(new Date(t.primeiraRespostaEm)-new Date(t.criadoEm)),0)/comSla.length : null;

  const withStatus = caixa.map(e=>({ ...e, statusEfetivo:statusEfetivoCaixa(e), ref:mesReferencia(e.vencimento) }));
  const recebidoMes = withStatus.filter(e=>e.statusEfetivo==='pago' && e.ref.group==='atual').reduce((s,e)=>s+e.valor,0);
  const comissoesAtivas = orcamentos.filter(o=>o.status!=='Reprovado').reduce((s,o)=>s+o.comissao,0);
  const recebimentosTotal = recebidoMes + comissoesAtivas;
  const gastosMes = gastos.filter(g=>mesReferencia(g.vencimento).group==='atual').reduce((s,g)=>s+g.valor,0);
  const gastosFuturos = gastos.filter(g=>mesReferencia(g.vencimento).group==='proximo').reduce((s,g)=>s+g.valor,0);
  const saldoAtual = recebimentosTotal - gastosMes;
  const aReceberMes = withStatus.filter(e=>e.statusEfetivo==='pendente' && e.ref.group==='atual').reduce((s,e)=>s+e.valor,0);
  const atrasadoTotal = withStatus.filter(e=>e.statusEfetivo==='atrasado').reduce((s,e)=>s+e.valor,0);

  // ---------- Filtro de período do gráfico ----------
  const anosDisponiveis = Array.from(new Set(caixa.map(e=>e.vencimento.slice(0,4)))).sort();
  const anoAtual = String(new Date().getFullYear());
  const [modoPeriodo, setModoPeriodo] = useState('recentes'); // 'recentes' | 'ano' | 'intervalo'
  const [anoSelecionado, setAnoSelecionado] = useState(anosDisponiveis.includes(anoAtual) ? anoAtual : (anosDisponiveis[anosDisponiveis.length-1]||anoAtual));
  const [dataDe, setDataDe] = useState(isoDate(-180));
  const [dataAte, setDataAte] = useState(isoDate(0));

  let series;
  if(modoPeriodo==='ano') series = yearSeries(caixa, parseInt(anoSelecionado,10));
  else if(modoPeriodo==='intervalo') series = rangeSeries(caixa, dataDe, dataAte);
  else series = monthlySeries(caixa, 6);
  const maxV = Math.max(1, ...series.map(s=>s.total));

  function exportarPeriodo(){
    const linhas = withStatus
      .filter(e=>{
        if(modoPeriodo==='ano') return e.vencimento.slice(0,4)===anoSelecionado;
        if(modoPeriodo==='intervalo') return e.vencimento>=dataDe && e.vencimento<=dataAte;
        return true;
      })
      .map(e=>({ cliente:e.cliente, valor:e.valor.toFixed(2), vencimento:e.vencimento, status:STATUS_PAGAMENTO_LABELS[e.statusEfetivo], dataPagamento:e.dataPagamento||'' }));
    exportarCSV('financeiro_periodo.csv', linhas, [
      { key:'cliente', label:'Cliente' }, { key:'valor', label:'Valor' },
      { key:'vencimento', label:'Vencimento' }, { key:'status', label:'Status' },
      { key:'dataPagamento', label:'Data de Pagamento' },
    ]);
  }

  const seg = { Premium:0, 'Padrão':0, 'Básico':0 };
  clientes.forEach(c=>{
    const meses = PERIODICIDADE_MESES[c.periodicidade] || 1;
    const vMensalEquivalente = (c.valorMensal||0) / meses;
    if(vMensalEquivalente>=800) seg.Premium++; else if(vMensalEquivalente>=400) seg['Padrão']++; else seg['Básico']++;
  });
  const totalClientes = Math.max(1, clientes.length);
  const segArr = [
    { label:'Premium', pct: Math.round(seg.Premium/totalClientes*100), color:'var(--laranja)' },
    { label:'Padrão', pct: Math.round(seg['Padrão']/totalClientes*100), color:'var(--rosa)' },
    { label:'Básico', pct: Math.round(seg['Básico']/totalClientes*100), color:'var(--carvao-3)' },
  ];

  function servicoStatus(clienteNome){
    const cts = tickets.filter(t=>t.cliente===clienteNome);
    if(cts.some(t=>t.status==='em_atendimento')) return {label:'Em curso', cls:'b-laranja'};
    if(cts.some(t=>t.status==='aguardando_retorno')) return {label:'Pendente', cls:'b-rosa'};
    return {label:'Concluído', cls:'b-green'};
  }

  return (
    <React.Fragment>
      <div className="card" style={{marginBottom:18}}>
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Suporte — Visão Geral</h3></div>
        <div className="grid g4" style={{marginBottom:16}}>
          <Kpi label="Em Atendimento" value={String(emAtendimento)} delta="chamados ativos" dir="up"/>
          <Kpi label="Aguardando Retorno" value={String(aguardando)} delta="do cliente" dir="down" tone="pink"/>
          <Kpi label="Encerrados" value={String(encerrados)} delta="total" dir="up"/>
          <Kpi label="SLA Médio (1ª resposta)" value={slaMedioMs!=null?fmtDuracao(slaMedioMs):'—'} delta="calculado em tempo real" dir="up" tone="pink"/>
        </div>
        <table><thead><tr><th>Cliente</th><th>Chamado</th><th>Status</th><th>Aberto em</th></tr></thead>
          <tbody>
            {recentes.map(t=>(
              <tr key={t.id}><td><b>{t.cliente}</b></td><td>#{t.numero} · {t.title}</td><td><span className={"badge "+STATUS_BADGE[t.status]}>{STATUS_LABELS[t.status]}</span></td><td>{fmtDataHora(t.criadoEm)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid g4" style={{marginBottom:18}}>
        <Kpi label="Recebido no mês" value={fmtBRL(recebimentosTotal)} delta="pago + comissões" dir="up" tone="pink"/>
        <Kpi label="A Receber no mês" value={fmtBRL(aReceberMes)} delta="ainda pendente" dir="down"/>
        <Kpi label="Saldo Atual" value={fmtBRL(saldoAtual)} delta={saldoAtual>=0?'positivo':'negativo'} dir={saldoAtual>=0?'up':'down'}/>
        <Kpi label="Em Atraso" value={fmtBRL(atrasadoTotal)} delta="cobrar com prioridade" dir={atrasadoTotal>0?'down':'up'} tone="pink"/>
      </div>

      <div className="grid g2" style={{marginBottom:18}}>
        <div className="card">
          <div className="card-head" style={{justifyContent:'space-between', display:'flex', flexWrap:'wrap', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}><div className="bar"></div><h3>Gráfico Financeiro</h3></div>
            <button className="btn-mini ghost" onClick={exportarPeriodo}>⬇ Exportar CSV</button>
          </div>
          <div className="ticket-tabs" style={{marginBottom:14}}>
            <button className={"ticket-tab "+(modoPeriodo==='recentes'?'active':'')} onClick={()=>setModoPeriodo('recentes')}>Últimos 6 meses</button>
            <button className={"ticket-tab "+(modoPeriodo==='ano'?'active':'')} onClick={()=>setModoPeriodo('ano')}>Ano</button>
            <button className={"ticket-tab "+(modoPeriodo==='intervalo'?'active':'')} onClick={()=>setModoPeriodo('intervalo')}>Personalizado</button>
          </div>
          {modoPeriodo==='ano' && (
            <div className="field-l" style={{marginBottom:14, maxWidth:160}}>
              <select className="select-input" value={anoSelecionado} onChange={e=>setAnoSelecionado(e.target.value)}>
                {(anosDisponiveis.length?anosDisponiveis:[anoAtual]).map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}
          {modoPeriodo==='intervalo' && (
            <div className="form-grid" style={{marginBottom:14}}>
              <div className="field-l"><label>De</label><input type="date" className="text-input" value={dataDe} onChange={e=>setDataDe(e.target.value)}/></div>
              <div className="field-l"><label>Até</label><input type="date" className="text-input" value={dataAte} onChange={e=>setDataAte(e.target.value)}/></div>
            </div>
          )}
          <div className="bars">
            {series.map((s,i)=>(<BarCol key={i} h={Math.max(6,(s.total/maxV)*140)} color={i%2===0?'var(--laranja)':'var(--rosa)'} label={s.label}/>))}
            {series.length===0 && <p className="empty-note-sm">Nenhum lançamento nesse período.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Clientes por Segmento</h3></div>
          <div className="donut" style={{background:gradientFromSegments(segArr)}}><div className="hole">{clientes.length}</div></div>
          <div className="legend">
            {segArr.map(s=>(<div key={s.label}><span className="sq" style={{background:s.color}}></span>{s.label} — {s.pct}%</div>))}
          </div>
        </div>
      </div>

      <div className="grid g3">
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>Orçamentos (Produtos e Comissões)</h3></div>
          <table><thead><tr><th>Cliente</th><th>Produto</th><th>Comissão</th></tr></thead>
            <tbody>{orcamentos.slice(0,4).map(o=>(<tr key={o.id}><td><b>{o.cliente}</b></td><td>{o.item}</td><td>{fmtBRL(o.comissao)}</td></tr>))}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Serviços Prestados</h3></div>
          <table><thead><tr><th>Serviço</th><th>Cliente</th><th>Status</th></tr></thead>
            <tbody>{clientes.slice(0,4).map(c=>{ const st=servicoStatus(c.nome); return (
              <tr key={c.id}><td><b>{c.servico}</b></td><td>{c.nome}</td><td><span className={"badge "+st.cls}>{st.label}</span></td></tr>
            );})}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><div className="bar" style={{background:'var(--carvao-3)'}}></div><h3>Serviços Terceirizados</h3></div>
          <table><thead><tr><th>Parceiro</th><th>Serviço</th><th>Custo</th></tr></thead>
            <tbody>{terceirizados.map(t=>(<tr key={t.id}><td><b>{t.parceiro}</b></td><td>{t.servico}</td><td>{fmtBRL(t.custo)}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
}
