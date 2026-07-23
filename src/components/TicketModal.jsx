/* ============================================================
   MODAL (detalhes do chamado)
============================================================ */
function TicketModal({ ticket, equipe, onClose, onSendInfo, onAssign, onAddNotaInterna }){
  const [msg, setMsg] = useState('');
  const [nota, setNota] = useState('');
  if(!ticket) return null;

  const tempoResposta = ticket.primeiraRespostaEm ? (new Date(ticket.primeiraRespostaEm) - new Date(ticket.criadoEm)) : null;
  const tempoTotal = ticket.encerradoEm ? (new Date(ticket.encerradoEm) - new Date(ticket.criadoEm)) : null;
  const responsavel = equipe.find(e=>e.id===ticket.responsavelId);

  return (
    <div className="modal-overlay open" onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><IconClose/></button>
        <h3>#{ticket.numero} · {ticket.title} {isAtrasado(ticket) && <span className="badge b-danger" style={{marginLeft:8, verticalAlign:'middle'}}>⏰ Atrasado</span>}</h3>
        <div className="m-sub">Solicitado por {ticket.cliente} · {fmtDataHora(ticket.criadoEm)}</div>
        <div className="kv-row"><span>Categoria</span><span>{ticket.categoria}</span></div>
        <div className="kv-row"><span>Prioridade</span><span>{ticket.priority}</span></div>
        <div className="kv-row"><span>Status</span><span>{STATUS_LABELS[ticket.status]}</span></div>
        <div className="kv-row"><span>Tempo até 1ª resposta</span><span>{fmtDuracao(tempoResposta)}</span></div>
        <div className="kv-row"><span>Tempo total de atendimento</span><span>{fmtDuracao(tempoTotal)}</span></div>
        {ticket.avaliacao && <div className="kv-row"><span>Avaliação do cliente</span><span>{'★'.repeat(ticket.avaliacao)}{'☆'.repeat(5-ticket.avaliacao)}</span></div>}

        <div className="field-l" style={{margin:'14px 0'}}>
          <label>Responsável</label>
          <select className="select-input" value={ticket.responsavelId||''} onChange={e=>onAssign(ticket.id, e.target.value)}>
            <option value="">— Não atribuído —</option>
            {equipe.map(p=><option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>)}
          </select>
        </div>

        <p style={{fontSize:'13px', color:'var(--text-2)', lineHeight:1.6, margin:'16px 0'}}>{ticket.descricao}</p>
        {ticket.history.length>0 && (
          <div style={{marginBottom:16}}>
            <b style={{fontSize:'12.5px'}}>Histórico</b>
            <div style={{marginTop:8}}>
              {ticket.history.map((h,i)=>(
                <div className={"history-item" + (h.interno ? ' interno' : '')} key={i}>
                  {h.interno && <div className="interno-tag">🔒 Nota interna — só a equipe vê</div>}
                  {h.text}<br/><span style={{color:'var(--gray)'}}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="field-l" style={{marginBottom:12}}>
          <label>🔒 Nota interna (a equipe vê — o cliente nunca vê isso)</label>
          <textarea className="text-input wide" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Ex: Cliente já ligou reclamando 2x, priorizar."></textarea>
        </div>
        <div className="form-actions" style={{marginBottom:20}}>
          <button className="btn-mini ghost" onClick={()=>{ if(nota.trim()){ onAddNotaInterna(ticket.id, nota.trim()); setNota(''); } }}>Adicionar Nota Interna</button>
        </div>

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
