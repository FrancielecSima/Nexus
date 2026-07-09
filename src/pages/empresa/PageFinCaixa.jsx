/* ============================================================
   EMPRESA > FINANCEIRO > CAIXA (guias + editar/excluir)
============================================================ */
function FinCaixaList({ entries, onEdit, onDelete }){
  const withRef = entries.map(e=>({ ...e, ref:mesReferencia(e.vencimento) }));
  const sorted = [...withRef].sort((a,b)=>a.vencimento.localeCompare(b.vencimento));
  return (
    <div className="card">
      <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Boletos &amp; Notas Fiscais Lançados</h3></div>
      <table><thead><tr><th>Cliente</th><th>Valor</th><th>Vencimento</th><th>Anexos</th><th>Referência</th><th></th></tr></thead>
        <tbody>
          {sorted.map(e=>(
            <tr key={e.id}>
              <td><b>{e.cliente}</b></td>
              <td>{fmtBRL(e.valor)}</td>
              <td>{new Date(e.vencimento+'T00:00:00').toLocaleDateString('pt-BR')}</td>
              <td style={{fontSize:11.5,color:'var(--gray)'}}>📎 {e.anexos && (e.anexos.boleto||e.anexos.nota) ? [e.anexos.boleto&&'Boleto', e.anexos.nota&&'Nota Fiscal'].filter(Boolean).join(' · ') : '—'}</td>
              <td><span className={"badge "+e.ref.cls}>{e.ref.label}</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn-sm ghost" onClick={()=>onEdit(e.id)}>Editar</button>
                  <button className="icon-btn-sm danger" onClick={()=>onDelete(e.id)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
          {sorted.length===0 && <tr><td colSpan="6" className="empty-note-sm">Nenhum lançamento ainda.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function FinCaixaForm({ editingEntry, clientes, onSave, onCancel }){
  const [cliente,setCliente]=useState(editingEntry?.cliente || (clientes[0]&&clientes[0].nome) || '');
  const [valor,setValor]=useState(editingEntry? String(editingEntry.valor) : '');
  const [vencimento,setVencimento]=useState(editingEntry?.vencimento || '');
  const boletoRef = useRef(); const nfRef = useRef();

  function submit(e){
    e.preventDefault();
    if(!valor || !vencimento) return;
    const boletoFile = boletoRef.current.files[0];
    const nfFile = nfRef.current.files[0];
    onSave({
      cliente, valor:parseFloat(valor), vencimento,
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
          <select className="select-input" value={cliente} onChange={e=>setCliente(e.target.value)}>
            {clientes.map(c=><option key={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="form-grid" style={{marginBottom:14}}>
          <div className="field-l"><label>Valor (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00" required/></div>
          <div className="field-l"><label>Data de Vencimento</label><input type="date" className="text-input" value={vencimento} onChange={e=>setVencimento(e.target.value)} required/></div>
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
      <p style={{fontSize:11.5,color:'var(--gray)',marginTop:14}}>A <b>data de vencimento</b> determina automaticamente se o valor entra no total do <b>mês atual</b> ou do <b>próximo mês</b>.</p>
    </div>
  );
}
function PageFinCaixa({ caixa, clientes, onSave, onDelete }){
  const [view, setView] = useState('lista');
  const [editing, setEditing] = useState(null);
  const editingEntry = editing ? caixa.find(e=>e.id===editing) : null;

  const withRef = caixa.map(e=>({ ...e, ref:mesReferencia(e.vencimento) }));
  const totalAtual = withRef.filter(e=>e.ref.group==='atual').reduce((s,e)=>s+e.valor,0);
  const totalProximo = withRef.filter(e=>e.ref.group==='proximo').reduce((s,e)=>s+e.valor,0);
  const totalAtrasado = withRef.filter(e=>e.ref.group==='atrasado').reduce((s,e)=>s+e.valor,0);

  return (
    <React.Fragment>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="A Receber — Mês Atual" value={fmtBRL(totalAtual)} delta={withRef.filter(e=>e.ref.group==='atual').length+' lançamento(s)'} dir="up"/>
        <Kpi label="A Receber — Próximo Mês" value={fmtBRL(totalProximo)} delta={withRef.filter(e=>e.ref.group==='proximo').length+' lançamento(s)'} dir="up" tone="pink"/>
        <Kpi label="Em Atraso" value={fmtBRL(totalAtrasado)} delta={withRef.filter(e=>e.ref.group==='atrasado').length+' lançamento(s)'} dir={totalAtrasado>0?'down':'up'}/>
      </div>
      <div className="ticket-tabs" style={{marginBottom:18}}>
        <button className={"ticket-tab "+(view==='lista'?'active':'')} onClick={()=>{setView('lista'); setEditing(null);}}>Lançamentos ({caixa.length})</button>
        <button className={"ticket-tab "+(view==='lancamento'?'active':'')} onClick={()=>{ if(view!=='lancamento'){ setEditing(null);} setView('lancamento');}}>{editing?'Editar Lançamento':'+ Novo Lançamento'}</button>
      </div>
      {view==='lancamento'
        ? <FinCaixaForm editingEntry={editingEntry} clientes={clientes} onSave={(data)=>{ onSave(data, editing); setView('lista'); setEditing(null); }} onCancel={()=>{setView('lista'); setEditing(null);}}/>
        : <FinCaixaList entries={caixa} onEdit={(id)=>{setEditing(id); setView('lancamento');}} onDelete={onDelete}/>
      }
    </React.Fragment>
  );
}

