/* ============================================================
   EMPRESA > DASHBOARD CLIENTES > ACESSOS DE CLIENTES
   Cria login real (Supabase Auth) para um cliente já cadastrado,
   via Edge Function (precisa da service_role, que não pode rodar
   no navegador). Veja a Edge Function "manage-cliente-access".
============================================================ */
function PageCliAcessos({ clientes, onCreate, onReset, onRevoke }){
  const [selectedId, setSelectedId] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const semAcesso = clientes.filter(c=>!c.authUserId);
  const comAcesso = clientes.filter(c=>c.authUserId);
  const clienteSelecionado = clientes.find(c=>c.id===selectedId);

  useEffect(()=>{
    if(clienteSelecionado){ setEmail(clienteSelecionado.email); } else { setEmail(''); }
    setSenha('');
  }, [selectedId]);

  async function submit(e){
    e.preventDefault();
    if(!selectedId || !email || !senha) return;
    setLoading(true);
    await onCreate(selectedId, clienteSelecionado.nome, email, senha);
    setLoading(false);
    setSelectedId(''); setEmail(''); setSenha('');
  }

  function reset(c){
    const nova = window.prompt('Nova senha temporária para ' + c.nome + ':');
    if(nova && nova.length>=6) onReset(c.authUserId, c.nome, nova);
    else if(nova) window.alert('A senha precisa ter pelo menos 6 caracteres.');
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1.4fr', gap:18, alignItems:'start'}}>
      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>Criar Acesso de Cliente</h3></div>
        {semAcesso.length===0 ? (
          <p className="empty-note-sm">Todos os clientes cadastrados já têm acesso ao portal.</p>
        ) : (
          <form onSubmit={submit}>
            <div className="field-l" style={{marginBottom:14}}>
              <label>Cliente</label>
              <select className="select-input" value={selectedId} onChange={e=>setSelectedId(e.target.value)} required>
                <option value="">Selecione um cliente...</option>
                {semAcesso.map(c=><option key={c.id} value={c.id}>{c.nome} — {c.empresa}</option>)}
              </select>
            </div>
            <div className="field-l" style={{marginBottom:14}}>
              <label>E-mail de Login</label>
              <input type="email" className="text-input" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </div>
            <div className="field-l" style={{marginBottom:20}}>
              <label>Senha Temporária</label>
              <input type="password" className="text-input" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="mínimo 6 caracteres" required minLength={6}/>
            </div>
            <div className="form-actions">
              <button className="btn-mini solid" type="submit" disabled={loading}>{loading?'Criando...':'Criar Acesso'}</button>
            </div>
          </form>
        )}
        <p style={{fontSize:11.5,color:'var(--gray)',marginTop:14}}>No primeiro login, o cliente será solicitado a definir uma nova senha antes de entrar no portal.</p>
      </div>
      <div className="card">
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Acessos Criados ({comAcesso.length})</h3></div>
        <table><thead><tr><th>Nome</th><th>Empresa</th><th>E-mail</th><th></th></tr></thead>
          <tbody>
            {comAcesso.map(c=>(
              <tr key={c.id}>
                <td><b>{c.nome}</b></td><td>{c.empresa}</td><td>{c.email}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn-sm ghost" onClick={()=>reset(c)}>Redefinir Senha</button>
                    <button className="icon-btn-sm danger" onClick={()=>onRevoke(c.authUserId, c.id, c.nome)}>Remover Acesso</button>
                  </div>
                </td>
              </tr>
            ))}
            {comAcesso.length===0 && <tr><td colSpan="4" className="empty-note-sm">Nenhum cliente com acesso ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
