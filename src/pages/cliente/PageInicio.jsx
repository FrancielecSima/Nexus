/* ============================================================
   CLIENTE > Início
   Depende de: Kpi, TicketRow (components/Shared.jsx), shade() (utils/helpers.js)
============================================================ */
function PageInicio({ tickets, clientName, branding, clienteNotifs, onGoNova }){
  const meus = tickets.filter(t=>t.cliente===clientName);
  const abertos = meus.filter(t=>t.status!=='encerrado');
  const encerrados = meus.filter(t=>t.status==='encerrado');
  const lastNotif = clienteNotifs[0];
  return (
    <React.Fragment>
      <div className="hero-cta" style={{background:`linear-gradient(135deg, ${branding.primary}, ${shade(branding.primary)})`}}>
        <div><h2>Precisa de suporte?</h2><p>Abra uma nova solicitação e nossa equipe entrará em contato.</p></div>
        <button onClick={onGoNova}>+ Nova Solicitação</button>
      </div>
      <div className="update-strip">🔔 {lastNotif ? lastNotif.text : 'Nenhuma atualização recente.'}</div>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="Chamados Abertos" value={String(abertos.length)} delta={abertos.length+' em andamento'} dir="down" tone="pink"/>
        <Kpi label="Chamados Encerrados" value={String(encerrados.length)} delta="este mês" dir="up"/>
        <Kpi label="Tempo Médio de Resposta" value="2h 10m" delta="ilustrativo" dir="up"/>
      </div>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="card">
          <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Chamados em Aberto</h3></div>
          {abertos.length ? abertos.map(t=><TicketRow t={t} key={t.id}/>) : <p className="empty-note">Nenhum chamado em aberto.</p>}
        </div>
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>Chamados Encerrados</h3></div>
          {encerrados.length ? encerrados.slice(0,4).map(t=><TicketRow t={t} key={t.id}/>) : <p className="empty-note">Nenhum chamado encerrado ainda.</p>}
        </div>
      </div>
    </React.Fragment>
  );
}
