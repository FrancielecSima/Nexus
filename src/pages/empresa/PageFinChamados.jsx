/* ============================================================
   EMPRESA > FINANCEIRO > CHAMADOS
   Busca + filtros (status/prioridade/responsável) e SLA calculado.
============================================================ */
function PageFinChamados({ tickets, equipe, onOpenModal, onStatusChange, onAssign }){
  const [busca, setBusca] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPrioridade, setFPrioridade] = useState('');
  const [fResponsavel, setFResponsavel] = useState('');

  const filtrados = tickets.filter(t=>{
    if(fStatus && t.status!==fStatus) return false;
    if(fPrioridade && t.priority!==fPrioridade) return false;
    if(fResponsavel==='none' && t.responsavelId) return false;
    if(fResponsavel && fResponsavel!=='none' && t.responsavelId!==fResponsavel) return false;
    if(busca){
      const q = busca.toLowerCase();
      if(!(t.cliente.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const abertosNaoAtendidos = tickets.filter(t=>t.status!=='encerrado' && !t.primeiraRespostaEm);
  const comSlaCalculavel = tickets.filter(t=>t.primeiraRespostaEm);
  const slaMedioMs = comSlaCalculavel.length
    ? comSlaCalculavel.reduce((s,t)=>s+(new Date(t.primeiraRespostaEm)-new Date(t.criadoEm)),0) / comSlaCalculavel.length
    : null;

  return (
    <React.Fragment>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="Chamados Filtrados" value={String(filtrados.length)} delta={'de '+tickets.length+' no total'} dir="up"/>
        <Kpi label="Sem 1ª resposta ainda" value={String(abertosNaoAtendidos.length)} delta="precisam de atenção" dir={abertosNaoAtendidos.length>0?'down':'up'} tone="pink"/>
        <Kpi label="SLA médio (1ª resposta)" value={slaMedioMs!=null?fmtDuracao(slaMedioMs):'—'} delta="calculado a partir dos chamados" dir="up"/>
      </div>

      <div className="card" style={{marginBottom:18}}>
        <div className="card-head"><div className="bar"></div><h3>Buscar e Filtrar</h3></div>
        <div className="form-grid" style={{marginBottom:0}}>
          <div className="field-l"><label>Buscar</label><input className="text-input" placeholder="Cliente, assunto ou número..." value={busca} onChange={e=>setBusca(e.target.value)}/></div>
          <div className="field-l"><label>Status</label>
            <select className="select-input" value={fStatus} onChange={e=>setFStatus(e.target.value)}>
              <option value="">Todos</option>
              {Object.keys(STATUS_LABELS).map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="field-l"><label>Prioridade</label>
            <select className="select-input" value={fPrioridade} onChange={e=>setFPrioridade(e.target.value)}>
              <option value="">Todas</option>
              <option>Alta</option><option>Média</option><option>Baixa</option>
            </select>
          </div>
          <div className="field-l"><label>Responsável</label>
            <select className="select-input" value={fResponsavel} onChange={e=>setFResponsavel(e.target.value)}>
              <option value="">Todos</option>
              <option value="none">Não atribuído</option>
              {equipe.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>Chamados Solicitados ({filtrados.length})</h3></div>
        <table><thead><tr><th>Cliente</th><th>Assunto</th><th>Prioridade</th><th>Responsável</th><th>Status</th><th>Aberto em</th><th>1ª resposta</th><th></th></tr></thead>
          <tbody>
            {filtrados.map(t=>{
              const resp = equipe.find(e=>e.id===t.responsavelId);
              const tempoResposta = t.primeiraRespostaEm ? (new Date(t.primeiraRespostaEm)-new Date(t.criadoEm)) : null;
              return (
                <tr key={t.id}>
                  <td><b>{t.cliente}</b></td>
                  <td>{t.id} · {t.title}</td>
                  <td><span className={"badge "+(t.priority==='Alta'?'b-rosa':t.priority==='Média'?'b-laranja':'b-carvao')}>{t.priority}</span></td>
                  <td>
                    <select className="status-select" value={t.responsavelId||''} onChange={e=>onAssign(t.id, e.target.value)}>
                      <option value="">— Ninguém —</option>
                      {equipe.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="status-select" value={t.status} onChange={e=>onStatusChange(t.id, e.target.value)}>
                      {Object.keys(STATUS_LABELS).map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td style={{fontSize:11.5}}>{fmtDataHora(t.criadoEm)}</td>
                  <td style={{fontSize:11.5}}>{tempoResposta!=null ? fmtDuracao(tempoResposta) : <span style={{color:'var(--rosa)'}}>Pendente</span>}</td>
                  <td><button className="btn-mini ghost" onClick={()=>onOpenModal(t.id)}>Detalhes</button></td>
                </tr>
              );
            })}
            {filtrados.length===0 && <tr><td colSpan="8" className="empty-note-sm">Nenhum chamado encontrado com esses filtros.</td></tr>}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
}
