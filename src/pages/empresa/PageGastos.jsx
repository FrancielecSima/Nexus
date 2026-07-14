/* ============================================================
   EMPRESA > FINANCEIRO > GASTOS (categoria + recorrência)
============================================================ */
function PageGastos({ gastos, onSave, onDelete, onGerarRecorrentes }){
  const [editing, setEditing] = useState(null);
  const editingObj = editing ? gastos.find(g=>g.id===editing) : null;
  const [desc,setDesc] = useState('');
  const [valor,setValor] = useState('');
  const [vencimento,setVencimento] = useState('');
  const [categoria,setCategoria] = useState('Fixo');
  const [recorrente,setRecorrente] = useState(false);

  useEffect(()=>{
    if(editingObj){ setDesc(editingObj.desc); setValor(String(editingObj.valor)); setVencimento(editingObj.vencimento); setCategoria(editingObj.categoria||'Fixo'); setRecorrente(!!editingObj.recorrente); }
    else { setDesc(''); setValor(''); setVencimento(''); setCategoria('Fixo'); setRecorrente(false); }
  }, [editing]);

  function submit(e){
    e.preventDefault();
    if(!desc || valor==='' || !vencimento) return;
    onSave({ desc, valor:parseFloat(valor), vencimento, categoria, recorrente }, editing);
    setEditing(null);
  }

  const totalFixo = gastos.filter(g=>g.categoria==='Fixo').reduce((s,g)=>s+g.valor,0);
  const totalVariavel = gastos.filter(g=>g.categoria==='Variável').reduce((s,g)=>s+g.valor,0);

  return (
    <React.Fragment>
      <div className="grid g3" style={{marginBottom:18}}>
        <Kpi label="Gastos Fixos" value={fmtBRL(totalFixo)} delta="recorrentes" dir="down"/>
        <Kpi label="Gastos Variáveis" value={fmtBRL(totalVariavel)} delta="pontuais" dir="down" tone="pink"/>
        <Kpi label="Total Cadastrado" value={fmtBRL(totalFixo+totalVariavel)} delta={gastos.length+' lançamento(s)'} dir="up"/>
      </div>
      <div className="grid" style={{gridTemplateColumns:'1fr 1.4fr', gap:18, alignItems:'start'}}>
        <div className="card">
          <div className="card-head"><div className="bar"></div><h3>{editing?'Editar Gasto':'Novo Gasto'}</h3></div>
          <form onSubmit={submit}>
            <div className="field-l" style={{marginBottom:14}}>
              <label>Descrição</label>
              <input className="text-input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ex: Aluguel do escritório" required/>
            </div>
            <div className="form-grid" style={{marginBottom:14}}>
              <div className="field-l"><label>Valor (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00" required/></div>
              <div className="field-l"><label>Vencimento</label><input type="date" className="text-input" value={vencimento} onChange={e=>setVencimento(e.target.value)} required/></div>
            </div>
            <div className="field-l" style={{marginBottom:14}}>
              <label>Categoria</label>
              <select className="select-input" value={categoria} onChange={e=>setCategoria(e.target.value)}>
                <option value="Fixo">Fixo</option>
                <option value="Variável">Variável</option>
              </select>
            </div>
            <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--text-2)', marginBottom:20, fontWeight:600}}>
              <input type="checkbox" checked={recorrente} onChange={e=>setRecorrente(e.target.checked)} disabled={categoria!=='Fixo'}/>
              Repetir todo mês automaticamente
            </label>
            <div className="form-actions">
              <button className="btn-mini solid" type="submit">{editing?'Salvar Alterações':'Cadastrar Gasto'}</button>
              {editing && <button className="btn-mini ghost" type="button" onClick={()=>setEditing(null)}>Cancelar</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <div className="card-head" style={{justifyContent:'space-between', display:'flex'}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Gastos Cadastrados ({gastos.length})</h3></div>
            <button className="btn-mini ghost" onClick={onGerarRecorrentes} title="Duplica os gastos fixos marcados como recorrentes para o mês atual, se ainda não existirem">↻ Gerar Recorrentes do Mês</button>
          </div>
          <table><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Categoria</th><th></th></tr></thead>
            <tbody>
              {[...gastos].sort((a,b)=>b.vencimento.localeCompare(a.vencimento)).map(g=>(
                <tr key={g.id}>
                  <td><b>{g.desc}</b>{g.recorrente && <span className="badge b-carvao" style={{marginLeft:6, fontSize:9.5}}>recorrente</span>}</td>
                  <td>{fmtBRL(g.valor)}</td>
                  <td>{new Date(g.vencimento+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td><span className={"badge "+(g.categoria==='Fixo'?'b-laranja':'b-rosa')}>{g.categoria}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn-sm ghost" onClick={()=>setEditing(g.id)}>Editar</button>
                      <button className="icon-btn-sm danger" onClick={()=>onDelete(g.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {gastos.length===0 && <tr><td colSpan="5" className="empty-note-sm">Nenhum gasto cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
}
