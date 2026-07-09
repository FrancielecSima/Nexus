/* ============================================================
   EMPRESA > DASHBOARD CLIENTES > ACESSOS DE CLIENTES
============================================================ */
function PageCliAcessos({ contas, setContas, showToast }){
  const [editing, setEditing] = useState(null);
  const editingObj = editing ? contas.find(a=>a.id===editing) : null;
  const [nome,setNome]=useState(''); const [empresa,setEmpresa]=useState('');
  const [email,setEmail]=useState(''); const [senha,setSenha]=useState('');
  const [forcarNovoAcesso,setForcar]=useState(false);

  useEffect(()=>{
    if(editingObj){ setNome(editingObj.nome); setEmpresa(editingObj.empresa); setEmail(editingObj.email); setSenha(''); setForcar(false); }
    else { setNome(''); setEmpresa(''); setEmail(''); setSenha(''); setForcar(false); }
  }, [editing]);

  function submit(e){
    e.preventDefault();
    if(!nome||!empresa||!email) return;
    if(editing){
      setContas(prev=>prev.map(a=>a.id===editing?{...a, nome, empresa, email, senha: senha?senha:a.senha, primeiroAcesso: forcarNovoAcesso ? true : a.primeiroAcesso }:a));
      showToast('Acesso atualizado com sucesso!');
    } else {
      if(!senha) return;
      setContas(prev=>[...prev, { id:uid('acc'), nome, empresa, email, senha, primeiroAcesso:true }]);
      showToast('Acesso criado! O cliente vai definir a senha no primeiro login.');
    }
    setEditing(null);
  }
  function remove(id){
    if(!window.confirm('Excluir este acesso?')) return;
    setContas(prev=>prev.filter(a=>a.id!==id));
    if(editing===id) setEditing(null);
    showToast('Acesso excluído.');
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1.4fr', gap:18, alignItems:'start'}}>
      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>{editing?'Editar Acesso':'Novo Acesso de Cliente'}</h3></div>
        <form onSubmit={submit}>
          <div className="field-l" style={{marginBottom:14}}><label>Nome</label><input className="text-input" value={nome} onChange={e=>setNome(e.target.value)} required/></div>
          <div className="field-l" style={{marginBottom:14}}><label>Empresa</label><input className="text-input" value={empresa} onChange={e=>setEmpresa(e.target.value)} required/></div>
          <div className="field-l" style={{marginBottom:14}}><label>E-mail</label><input type="email" className="text-input" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="field-l" style={{marginBottom:14}}>
            <label>{editing? 'Nova Senha (opcional)':'Senha Temporária'}</label>
            <input type="password" className="text-input" value={senha} onChange={e=>setSenha(e.target.value)} placeholder={editing?'Deixe em branco para manter':''} required={!editing}/>
          </div>
          {editing && (
            <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--text-2)', marginBottom:20, fontWeight:600}}>
              <input type="checkbox" checked={forcarNovoAcesso} onChange={e=>setForcar(e.target.checked)} />
              Solicitar definição de nova senha no próximo login
            </label>
          )}
          <div className="form-actions">
            <button className="btn-mini solid" type="submit">{editing?'Salvar Alterações':'Criar Acesso'}</button>
            {editing && <button className="btn-mini ghost" type="button" onClick={()=>setEditing(null)}>Cancelar</button>}
          </div>
        </form>
        <p style={{fontSize:11.5,color:'var(--gray)',marginTop:14}}>No primeiro login, o cliente será solicitado a definir uma nova senha antes de entrar no portal.</p>
      </div>
      <div className="card">
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Acessos Criados ({contas.length})</h3></div>
        <table><thead><tr><th>Nome</th><th>Empresa</th><th>E-mail</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {contas.map(a=>(
              <tr key={a.id}>
                <td><b>{a.nome}</b></td><td>{a.empresa}</td><td>{a.email}</td>
                <td><span className={"badge "+(a.primeiroAcesso?'b-laranja':'b-green')}>{a.primeiroAcesso?'Primeiro acesso pendente':'Ativo'}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn-sm ghost" onClick={()=>setEditing(a.id)}>Editar</button>
                    <button className="icon-btn-sm danger" onClick={()=>remove(a.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

