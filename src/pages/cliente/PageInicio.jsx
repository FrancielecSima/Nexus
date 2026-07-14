/* ============================================================
   CLIENTE > Início
   Depende de: Kpi, TicketRow (components/Shared.jsx), shade() (utils/helpers.js)
============================================================ */
function PageInicio({ tickets, clientName, branding, clienteNotifs, onGoNova, onAvaliar }){
  const meus = tickets.filter(t=>t.cliente===clientName);
  const abertos = meus.filter(t=>t.status!=='encerrado');
  const encerrados = meus.filter(t=>t.status==='encerrado');
  const lastNotif = clienteNotifs[0];
  const comResposta = meus.filter(t=>t.primeiraRespostaEm);
  const tempoMedioMs = comResposta.length ? comResposta.reduce((s,t)=>s+(new Date(t.primeiraRespostaEm)-new Date(t.criadoEm)),0)/comResposta.length : null;
  return (
    <React.Fragment>
      <div className="hero-cta" style={{background:`linear-gradient(135deg, ${branding.primary}, ${shade(branding.primary)})`}}>
        <div><h2>Precisa de suporte?</h2><p>Abra uma nova solicitação e nossa equipe entrará em contato.</p></div>
        <button onClick={onGoNova}>+ Nova Solicitação</button>
      </div>
      <div className="update-strip">🔔 {lastNotif ? lastNotif.text : 'Nenhuma atualização recente.'}</div>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="Chamados Abertos" value={String(abertos.length)} delta={abertos.length+' em andamento'} dir="down" tone="pink"/>
        <Kpi label="Chamados Encerrados" value={String(encerrados.length)} delta="total" dir="up"/>
        <Kpi label="Tempo Médio de Resposta" value={tempoMedioMs!=null?fmtDuracao(tempoMedioMs):'—'} delta="calculado em tempo real" dir="up"/>
      </div>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="card">
          <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Chamados em Aberto</h3></div>
          {abertos.length ? abertos.map(t=><TicketRow t={t} key={t.id} onAvaliar={onAvaliar}/>) : <p className="empty-note">Nenhum chamado em aberto.</p>}
        </div>
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>Chamados Encerrados</h3></div>
          {encerrados.length ? encerrados.slice(0,4).map(t=><TicketRow t={t} key={t.id} onAvaliar={onAvaliar}/>) : <p className="empty-note">Nenhum chamado encerrado ainda.</p>}
        </div>
      </div>
    </React.Fragment>
  );
}
