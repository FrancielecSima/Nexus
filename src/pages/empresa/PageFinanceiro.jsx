/* ============================================================
   EMPRESA > PAINEL FINANCEIRO (dinâmico)
============================================================ */
function PageFinanceiro({ tickets, caixa, orcamentos, gastos, terceirizados, clientes }){
  const emAtendimento = tickets.filter(t=>t.status==='em_atendimento').length;
  const aguardando = tickets.filter(t=>t.status==='aguardando_retorno').length;
  const encerrados = tickets.filter(t=>t.status==='encerrado').length;
  const recentes = tickets.slice(0,4);

  const recebimentosMes = caixa.filter(e=>mesReferencia(e.vencimento).group==='atual').reduce((s,e)=>s+e.valor,0);
  const comissoesAtivas = orcamentos.filter(o=>o.status!=='Reprovado').reduce((s,o)=>s+o.comissao,0);
  const recebimentosTotal = recebimentosMes + comissoesAtivas;
  const gastosMes = gastos.filter(g=>mesReferencia(g.vencimento).group==='atual').reduce((s,g)=>s+g.valor,0);
  const gastosFuturos = gastos.filter(g=>mesReferencia(g.vencimento).group==='proximo').reduce((s,g)=>s+g.valor,0);
  const saldoAtual = recebimentosTotal - gastosMes;

  const series = monthlySeries(caixa, 6);
  const maxV = Math.max(1, ...series.map(s=>s.total));

  const seg = { Premium:0, 'Padrão':0, 'Básico':0 };
  clientes.forEach(c=>{
    const v = c.valorMensal||0;
    if(v>=800) seg.Premium++; else if(v>=400) seg['Padrão']++; else seg['Básico']++;
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
          <Kpi label="SLA Médio" value="3h 40m" delta="ilustrativo" dir="up" tone="pink"/>
        </div>
        <table><thead><tr><th>Cliente</th><th>Chamado</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>
            {recentes.map(t=>(
              <tr key={t.id}><td><b>{t.cliente}</b></td><td>{t.id} · {t.title}</td><td><span className={"badge "+STATUS_BADGE[t.status]}>{STATUS_LABELS[t.status]}</span></td><td>{t.date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid g4" style={{marginBottom:18}}>
        <Kpi label="Gastos do mês" value={fmtBRL(gastosMes)} delta="mês atual" dir="down"/>
        <Kpi label="Recebimentos + Comissões" value={fmtBRL(recebimentosTotal)} delta="mês atual" dir="up" tone="pink"/>
        <Kpi label="Saldo Atual" value={fmtBRL(saldoAtual)} delta={saldoAtual>=0?'positivo':'negativo'} dir={saldoAtual>=0?'up':'down'}/>
        <Kpi label="Gastos Futuros Previstos" value={fmtBRL(gastosFuturos)} delta="próximo mês" dir="down" tone="pink"/>
      </div>

      <div className="grid g2" style={{marginBottom:18}}>
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>Gráfico Financeiro — Últimos 6 meses</h3></div>
          <div className="bars">
            {series.map((s,i)=>(<BarCol key={i} h={Math.max(6,(s.total/maxV)*140)} color={i%2===0?'var(--laranja)':'var(--rosa)'} label={s.label}/>))}
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

