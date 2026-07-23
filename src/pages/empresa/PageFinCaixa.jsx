/* ============================================================
   EMPRESA > FINANCEIRO > CAIXA (guias + editar/excluir)
   Agora com status de pagamento real, lançamentos retroativos e
   geração automática de cobranças futuras conforme periodicidade.
============================================================ */
function FinCaixaList({ entries, onEdit, onDelete, onMarcarPago }){
  const [filtroAno, setFiltroAno] = useState('todos');
  const [busca, setBusca] = useState('');

  const anos = Array.from(new Set(entries.map(e=>e.vencimento.slice(0,4)))).sort().reverse();
  const withRef = entries.map(e=>({ ...e, ref:mesReferencia(e.vencimento), statusEfetivo:statusEfetivoCaixa(e) }));
  let filtrados = withRef;
  if(filtroAno!=='todos') filtrados = filtrados.filter(e=>e.vencimento.slice(0,4)===filtroAno);
  if(busca) filtrados = filtrados.filter(e=>e.cliente.toLowerCase().includes(busca.toLowerCase()));
  const sorted = [...filtrados].sort((a,b)=>b.vencimento.localeCompare(a.vencimento));

  return (
    <div className="card">
      <div className="card-head" style={{justifyContent:'space-between', display:'flex', flexWrap:'wrap', gap:10}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Boletos &amp; Notas Fiscais Lançados</h3></div>
        <div style={{display:'flex', gap:8}}>
          <input className="text-input" style={{width:170}} placeholder="Buscar cliente..." value={busca} onChange={e=>setBusca(e.target.value)}/>
          <select className="select-input" style={{width:120}} value={filtroAno} onChange={e=>setFiltroAno(e.target.value)}>
            <option value="todos">Todos os anos</option>
            {anos.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <table><thead><tr><th>Cliente</th><th>Valor</th><th>Vencimento</th><th>Anexos</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {sorted.map(e=>(
            <tr key={e.id}>
              <td><b>{e.cliente}</b></td>
              <td>{fmtBRL(e.valor)}</td>
              <td>{new Date(e.vencimento+'T00:00:00').toLocaleDateString('pt-BR')}</td>
              <td style={{fontSize:11.5,color:'var(--gray)'}}>📎 {e.anexos && (e.anexos.boleto||e.anexos.nota) ? [e.anexos.boleto&&'Boleto', e.anexos.nota&&'Nota Fiscal'].filter(Boolean).join(' · ') : '—'}</td>
              <td>
                <span className={"badge "+STATUS_PAGAMENTO_BADGE[e.statusEfetivo]}>{STATUS_PAGAMENTO_LABELS[e.statusEfetivo]}</span>
                {e.status==='pago' && <div style={{fontSize:10.5,color:'var(--gray)',marginTop:3}}>em {new Date(e.dataPagamento+'T00:00:00').toLocaleDateString('pt-BR')}</div>}
              </td>
              <td>
                <div className="row-actions">
                  {e.statusEfetivo!=='pago' && <button className="icon-btn-sm ghost" onClick={()=>onMarcarPago(e.id)}>Marcar Pago</button>}
                  <button className="icon-btn-sm ghost" onClick={()=>onEdit(e.id)}>Editar</button>
                  <button className="icon-btn-sm danger" onClick={()=>onDelete(e.id)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
          {sorted.length===0 && <tr><td colSpan="6" className="empty-note-sm">Nenhum lançamento encontrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function FinCaixaForm({ editingEntry, clientes, onSave, onCancel }){
  const [clienteId,setClienteId]=useState(editingEntry?.clienteId || (clientes[0]&&clientes[0].id) || '');
  const [valor,setValor]=useState(editingEntry? String(editingEntry.valor) : '');
  const [vencimento,setVencimento]=useState(editingEntry?.vencimento || '');
  const [status,setStatus]=useState(editingEntry?.status || 'pendente');
  const [dataPagamento,setDataPagamento]=useState(editingEntry?.dataPagamento || new Date().toISOString().slice(0,10));
  const boletoRef = useRef(); const nfRef = useRef();

  function submit(e){
    e.preventDefault();
    if(!valor || !vencimento) return;
    const boletoFile = boletoRef.current.files[0];
    const nfFile = nfRef.current.files[0];
    onSave({
      clienteId, valor:parseFloat(valor), vencimento,
      status, dataPagamento: status==='pago' ? dataPagamento : null,
      anexos:{
        boleto: boletoFile ? boletoFile.name : (editingEntry?.anexos?.boleto || null),
        nota: nfFile ? nfFile.name : (editingEntry?.anexos?.nota || null),
      }
    });
  }
  return (
    <div className="card wide-form">
      <div className="card-head"><div className="bar"></div><h3>{editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}</h3></div>
      <form onSubmit={submit}>
        <div className="field-l" style={{marginBottom:14}}>
          <label>Cliente</label>
          <select className="select-input" value={clienteId} onChange={e=>setClienteId(e.target.value)}>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="form-grid" style={{marginBottom:14}}>
          <div className="field-l"><label>Valor (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00" required/></div>
          <div className="field-l"><label>Data de Vencimento</label><input type="date" className="text-input" value={vencimento} onChange={e=>setVencimento(e.target.value)} required/></div>
        </div>
        <p style={{fontSize:11.5,color:'var(--gray)',marginTop:-8,marginBottom:14}}>
          Pode lançar datas de meses anteriores normalmente — útil para completar o histórico e gerar comparativos do ano.
        </p>
        <div className="form-grid" style={{marginBottom:14}}>
          <div className="field-l">
            <label>Status do Pagamento</label>
            <select className="select-input" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          {status==='pago' && (
            <div className="field-l"><label>Data do Pagamento</label><input type="date" className="text-input" value={dataPagamento} onChange={e=>setDataPagamento(e.target.value)} required/></div>
          )}
        </div>
        <div className="form-grid" style={{marginBottom:20}}>
          <div className="field-l"><label>Anexar Boleto {editingEntry?.anexos?.boleto ? '(atual: '+editingEntry.anexos.boleto+')' : ''}</label><input type="file" className="text-input" ref={boletoRef}/></div>
          <div className="field-l"><label>Anexar Nota Fiscal {editingEntry?.anexos?.nota ? '(atual: '+editingEntry.anexos.nota+')' : ''}</label><input type="file" className="text-input" ref={nfRef}/></div>
        </div>
        <div className="form-actions">
          <button className="btn-mini solid" type="submit">{editingEntry ? 'Salvar Alterações' : 'Adicionar ao Caixa'}</button>
          <button className="btn-mini ghost" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
function PageFinCaixa({ caixa, clientes, onSave, onDelete, onMarcarPago, onGerarCobrancas }){
  const [view, setView] = useState('lista');
  const [editing, setEditing] = useState(null);
  const editingEntry = editing ? caixa.find(e=>e.id===editing) : null;

  const withStatus = caixa.map(e=>({ ...e, statusEfetivo:statusEfetivoCaixa(e), ref:mesReferencia(e.vencimento) }));
  const recebidoMes = withStatus.filter(e=>e.statusEfetivo==='pago' && e.ref.group==='atual').reduce((s,e)=>s+e.valor,0);
  const aReceberMes = withStatus.filter(e=>(e.statusEfetivo==='pendente') && e.ref.group==='atual').reduce((s,e)=>s+e.valor,0);
  const atrasado = withStatus.filter(e=>e.statusEfetivo==='atrasado').reduce((s,e)=>s+e.valor,0);

  return (
    <React.Fragment>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="Recebido — Mês Atual" value={fmtBRL(recebidoMes)} delta="já confirmado" dir="up"/>
        <Kpi label="A Receber — Mês Atual" value={fmtBRL(aReceberMes)} delta="ainda pendente" dir="down" tone="pink"/>
        <Kpi label="Em Atraso" value={fmtBRL(atrasado)} delta={withStatus.filter(e=>e.statusEfetivo==='atrasado').length+' lançamento(s)'} dir={atrasado>0?'down':'up'}/>
      </div>
      <div className="ticket-tabs" style={{marginBottom:18, justifyContent:'space-between', display:'flex'}}>
        <div style={{display:'flex'}}>
          <button className={"ticket-tab "+(view==='lista'?'active':'')} onClick={()=>{setView('lista'); setEditing(null);}}>Lançamentos ({caixa.length})</button>
          <button className={"ticket-tab "+(view==='lancamento'?'active':'')} onClick={()=>{ if(view!=='lancamento'){ setEditing(null);} setView('lancamento');}}>{editing?'Editar Lançamento':'+ Novo Lançamento'}</button>
        </div>
        <button className="btn-mini ghost" onClick={onGerarCobrancas} title="Cria os lançamentos dos próximos 12 meses com base na periodicidade de cada cliente">↻ Gerar Cobranças Futuras</button>
      </div>
      {view==='lancamento'
        ? <FinCaixaForm editingEntry={editingEntry} clientes={clientes} onSave={(data)=>{ onSave(data, editing); setView('lista'); setEditing(null); }} onCancel={()=>{setView('lista'); setEditing(null);}}/>
        : <FinCaixaList entries={caixa} onEdit={(id)=>{setEditing(id); setView('lancamento');}} onDelete={onDelete} onMarcarPago={onMarcarPago}/>
      }
    </React.Fragment>
  );
}
