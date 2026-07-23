/* ============================================================
   EMPRESA > FINANCEIRO > SERVIÇOS (editar/excluir)
============================================================ */
function PageFinServicos({ servicos, onSave, onDelete, showToast }){
  const [editing, setEditing] = useState(null);
  const editingObj = editing ? servicos.find(s=>s.id===editing) : null;
  const [nome,setNome] = useState('');
  const [valor,setValor] = useState('');
  const [comissao,setComissao] = useState('');

  useEffect(()=>{
    if(editingObj){ setNome(editingObj.nome); setValor(String(editingObj.valor)); setComissao(String(editingObj.comissaoPercent)); }
    else { setNome(''); setValor(''); setComissao(''); }
  }, [editing]);

  function submit(e){
    e.preventDefault();
    if(!nome || valor==='' || comissao==='') return;
    onSave({ nome, valor:parseFloat(valor), comissaoPercent:parseFloat(comissao) }, editing);
    setEditing(null);
  }
  function remove(id){
    onDelete(id);
    if(editing===id) setEditing(null);
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1.4fr', gap:18, alignItems:'start'}}>
      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>{editing?'Editar Serviço':'Novo Serviço'}</h3></div>
        <form onSubmit={submit}>
          <div className="field-l" style={{marginBottom:14}}>
            <label>Nome do Serviço</label>
            <input className="text-input" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Suporte N3" required/>
          </div>
          <div className="form-grid" style={{marginBottom:20}}>
            <div className="field-l"><label>Valor Padrão (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00" required/></div>
            <div className="field-l"><label>Comissão (%)</label><input type="number" step="1" min="0" max="100" className="text-input" value={comissao} onChange={e=>setComissao(e.target.value)} placeholder="20" required/></div>
          </div>
          <div className="form-actions">
            <button className="btn-mini solid" type="submit">{editing?'Salvar Alterações':'Cadastrar Serviço'}</button>
            {editing && <button className="btn-mini ghost" type="button" onClick={()=>setEditing(null)}>Cancelar</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Serviços Cadastrados ({servicos.length})</h3></div>
        <table><thead><tr><th>Serviço</th><th>Valor Padrão</th><th>Comissão</th><th></th></tr></thead>
          <tbody>
            {servicos.map(s=>(
              <tr key={s.id}>
                <td><b>{s.nome}</b></td><td>{fmtBRL(s.valor)}</td><td>{s.comissaoPercent}%</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn-sm ghost" onClick={()=>setEditing(s.id)}>Editar</button>
                    <button className="icon-btn-sm danger" onClick={()=>remove(s.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{fontSize:11.5,color:'var(--gray)',marginTop:14}}>Estes serviços ficam disponíveis para seleção rápida na aba <b>Orçamentos</b>.</p>
      </div>
    </div>
  );
}

