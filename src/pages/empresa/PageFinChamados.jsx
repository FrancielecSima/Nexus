/* ============================================================
   EMPRESA > FINANCEIRO > CHAMADOS
============================================================ */
function PageFinChamados({ tickets, onOpenModal, onStatusChange }){
  return (
    <div className="card">
      <div className="card-head"><div className="bar"></div><h3>Chamados Solicitados ({tickets.length})</h3></div>
      <table><thead><tr><th>Cliente</th><th>Assunto</th><th>Prioridade</th><th>Status</th><th>Data</th><th></th></tr></thead>
        <tbody>
          {tickets.map(t=>(
            <tr key={t.id}>
              <td><b>{t.cliente}</b></td>
              <td>{t.id} · {t.title}</td>
              <td><span className={"badge "+(t.priority==='Alta'?'b-rosa':t.priority==='Média'?'b-laranja':'b-carvao')}>{t.priority}</span></td>
              <td>
                <select className="status-select" value={t.status} onChange={e=>onStatusChange(t.id, e.target.value)}>
                  {Object.keys(STATUS_LABELS).map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </td>
              <td>{t.date}</td>
              <td><button className="btn-mini ghost" onClick={()=>onOpenModal(t.id)}>Detalhes</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

