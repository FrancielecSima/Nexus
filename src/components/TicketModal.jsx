/* ============================================================
   MODAL (detalhes do chamado)
============================================================ */
function TicketModal({ ticket, onClose, onSendInfo }){
  const [msg, setMsg] = useState('');
  if(!ticket) return null;
  return (
    <div className="modal-overlay open" onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><IconClose/></button>
        <h3>{ticket.id} · {ticket.title}</h3>
        <div className="m-sub">Solicitado por {ticket.cliente} · {ticket.date}</div>
        <div className="kv-row"><span>Categoria</span><span>{ticket.categoria}</span></div>
        <div className="kv-row"><span>Prioridade</span><span>{ticket.priority}</span></div>
        <div className="kv-row"><span>Status</span><span>{STATUS_LABELS[ticket.status]}</span></div>
        <p style={{fontSize:'13px', color:'var(--text-2)', lineHeight:1.6, margin:'16px 0'}}>{ticket.descricao}</p>
        {ticket.history.length>0 && (
          <div style={{marginBottom:16}}>
            <b style={{fontSize:'12.5px'}}>Histórico</b>
            <div style={{marginTop:8}}>
              {ticket.history.map((h,i)=>(<div className="history-item" key={i}>{h.text}<br/><span style={{color:'var(--gray)'}}>{h.time}</span></div>))}
            </div>
          </div>
        )}
        <div className="field-l" style={{marginBottom:12}}>
          <label>Solicitar mais informações ao cliente</label>
          <textarea className="text-input wide" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ex: Poderia enviar um print do erro?"></textarea>
        </div>
        <div className="form-actions">
          <button className="btn-mini solid" onClick={()=>{ if(msg.trim()){ onSendInfo(ticket.id, msg.trim()); setMsg(''); } }}>Enviar Solicitação</button>
          <button className="btn-mini ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

