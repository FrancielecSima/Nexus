/* ============================================================
   EMPRESA > FINANCEIRO > AUDITORIA
   Trilha de quem fez o quê no sistema (edições/exclusões sensíveis).
============================================================ */
function PageAuditoria({ auditLog }){
  const [busca, setBusca] = useState('');
  const filtrado = auditLog.filter(l=>{
    if(!busca) return true;
    const q = busca.toLowerCase();
    return l.usuario.toLowerCase().includes(q) || l.acao.toLowerCase().includes(q) || (l.detalhe||'').toLowerCase().includes(q);
  });

  return (
    <div className="card">
      <div className="card-head" style={{justifyContent:'space-between', display:'flex', flexWrap:'wrap', gap:10}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}><div className="bar"></div><h3>Histórico de Alterações ({filtrado.length})</h3></div>
        <input className="text-input" style={{width:220}} placeholder="Buscar por usuário ou ação..." value={busca} onChange={e=>setBusca(e.target.value)}/>
      </div>
      <table><thead><tr><th>Quando</th><th>Usuário</th><th>Ação</th><th>Detalhe</th></tr></thead>
        <tbody>
          {filtrado.map(l=>(
            <tr key={l.id}>
              <td style={{fontSize:11.5, whiteSpace:'nowrap'}}>{fmtDataHora(l.quando)}</td>
              <td><b>{l.usuario}</b></td>
              <td>{l.acao}</td>
              <td style={{fontSize:12}}>{l.detalhe}</td>
            </tr>
          ))}
          {filtrado.length===0 && <tr><td colSpan="4" className="empty-note-sm">Nenhum registro ainda — ações como editar/excluir cliente, lançamento de caixa ou gasto aparecem aqui automaticamente.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
