/* ============================================================
   CLIENTE > Meus Chamados
   Depende de: TicketRow (components/Shared.jsx)
============================================================ */
function PageChamados({ tickets, clientName, onAvaliar }){
  const [tab, setTab] = useState('aberto');
  const meus = tickets.filter(t=>t.cliente===clientName);
  const abertos = meus.filter(t=>t.status!=='encerrado');
  const encerrados = meus.filter(t=>t.status==='encerrado');
  const list = tab==='aberto' ? abertos : encerrados;
  return (
    <div className="card">
      <div className="ticket-tabs">
        <button className={"ticket-tab "+(tab==='aberto'?'active':'')} onClick={()=>setTab('aberto')}>Em Aberto ({abertos.length})</button>
        <button className={"ticket-tab "+(tab==='encerrado'?'active':'')} onClick={()=>setTab('encerrado')}>Encerrados ({encerrados.length})</button>
      </div>
      <div>{list.length ? list.map(t=><TicketRow t={t} key={t.id} onAvaliar={onAvaliar}/>) : <p className="empty-note">Nada por aqui ainda.</p>}</div>
    </div>
  );
}
