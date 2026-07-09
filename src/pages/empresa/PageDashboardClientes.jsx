/* ============================================================
   EMPRESA > DASHBOARD DE CLIENTES (dinâmico)
============================================================ */
function PageDashboardClientes({ clientes, tickets, onPersonalizar }){
  const totalClientes = clientes.length;
  const abertos = tickets.filter(t=>t.status!=='encerrado').length;
  const encerrados = tickets.filter(t=>t.status==='encerrado').length;
  const emAtendimento = tickets.filter(t=>t.status==='em_atendimento').length;
  const aguardando = tickets.filter(t=>t.status==='aguardando_retorno').length;

  function clienteStatus(nome){
    const cts = tickets.filter(t=>t.cliente===nome);
    const open = cts.filter(t=>t.status!=='encerrado').length;
    if(cts.some(t=>t.status==='em_atendimento')) return { label:'Ativo', cls:'b-laranja', open };
    if(cts.some(t=>t.status==='aguardando_retorno')) return { label:'Em atendimento', cls:'b-rosa', open };
    return { label:'Concluído', cls:'b-green', open };
  }

  const totalT = Math.max(1, tickets.length);
  const donutParts = [
    { label:'Ativos', val:emAtendimento, color:'var(--rosa)' },
    { label:'Aguardando', val:aguardando, color:'var(--laranja)' },
    { label:'Encerrados', val:encerrados, color:'var(--carvao-3)' },
  ];
  const donutSegs = donutParts.map(p=>({ pct: Math.round(p.val/totalT*100), color:p.color }));

  const prioCount = { Alta:0, 'Média':0, Baixa:0 };
  tickets.filter(t=>t.status!=='encerrado').forEach(t=>{ if(prioCount[t.priority]!==undefined) prioCount[t.priority]++; });
  const maxPrio = Math.max(1, ...Object.values(prioCount));

  return (
    <React.Fragment>
      <div className="grid g4" style={{marginBottom:18}}>
        <Kpi label="Total de Clientes" value={String(totalClientes)} delta="cadastrados" dir="up"/>
        <Kpi label="Chamados Abertos" value={String(abertos)} delta="em andamento" dir="down" tone="pink"/>
        <Kpi label="Chamados Encerrados" value={String(encerrados)} delta="total" dir="up"/>
        <Kpi label="SLA Médio de Atendimento" value="3h 40m" delta="ilustrativo" dir="up" tone="pink"/>
      </div>
      <div className="grid g2">
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>Clientes — Serviço Prestado &amp; Suporte Técnico</h3></div>
          <table><thead><tr><th>Cliente</th><th>Serviço Prestado</th><th>Suporte</th><th>Chamados</th></tr></thead>
            <tbody>
              {clientes.map(c=>{ const st=clienteStatus(c.nome); return (
                <tr key={c.id}><td><b>{c.nome}</b></td><td>{c.servico}</td><td><span className={"badge "+st.cls}>{st.label}</span></td><td>{st.open} aberto(s)</td></tr>
              );})}
              {clientes.length===0 && <tr><td colSpan="4" className="empty-note-sm">Nenhum cliente cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <div className="card" style={{marginBottom:18}}>
            <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Status dos Chamados</h3></div>
            <div className="donut" style={{background:gradientFromSegments(donutSegs)}}><div className="hole">{tickets.length}</div></div>
            <div className="legend">
              {donutParts.map(p=>(<div key={p.label}><span className="sq" style={{background:p.color}}></span>{p.label} — {p.val}</div>))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="bar"></div><h3>Suporte — Prioridade</h3></div>
            {Object.keys(prioCount).map(k=>(
              <PrioBar key={k} label={k} val={prioCount[k]} max={maxPrio} color={k==='Alta'?'var(--rosa)':k==='Média'?'var(--laranja)':'var(--carvao-3)'}/>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{marginTop:18}}>
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Todos os Clientes com Sistema — Personalização</h3></div>
        {clientes.map(c=>(
          <div className="client-row" key={c.id}>
            <div className="c-logo" style={{background:c.primary}}>{c.initial}</div>
            <div className="c-info"><b>{c.empresa}</b><span>{c.nome} · {c.servico}</span></div>
            <div style={{display:'flex', gap:6}} title="Cor primária / secundária">
              <span className="swatch-mini" style={{background:c.primary}}></span>
              <span className="swatch-mini" style={{background:c.secondary}}></span>
            </div>
            <button className="btn-mini ghost" onClick={()=>onPersonalizar(c.id)}>Personalizar</button>
          </div>
        ))}
        {clientes.length===0 && <p className="empty-note-sm">Nenhum cliente cadastrado.</p>}
      </div>
    </React.Fragment>
  );
}

