/* ============================================================
   FirstAccessScreen — troca de senha obrigatória no primeiro login
============================================================ */
function FirstAccessScreen({ account, onDone }){
  const [p1,setP1] = useState('');
  const [p2,setP2] = useState('');
  const [err,setErr] = useState('');
  const [loading,setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(loading) return;
    if(!p1 || p1.length<6 || p1!==p2){ setErr('As senhas não coincidem ou são muito curtas (mín. 6 caracteres).'); return; }
    setErr('');
    setLoading(true);
    const result = await onDone(p1);
    setLoading(false);
    if(result && result.error){ setErr(result.error); }
  }

  return (
    <div id="first-access-screen" className="show">
      <div className="login-form" style={{background:'var(--card)', padding:'38px', borderRadius:'20px', boxShadow:'var(--shadow)', maxWidth:'400px', width:'100%'}}>
        <h2>Primeiro acesso</h2>
        <p className="sub">Olá, <b>{account.nome.split(' ')[0]}</b>! Por segurança, defina uma nova senha para continuar.</p>
        {err && <div className="login-error" style={{display:'block'}}>{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="fa-senha1">Nova senha</label><input id="fa-senha1" type="password" value={p1} onChange={e=>setP1(e.target.value)} disabled={loading}/></div>
          <div className="field"><label htmlFor="fa-senha2">Confirmar nova senha</label><input id="fa-senha2" type="password" value={p2} onChange={e=>setP2(e.target.value)} disabled={loading}/></div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Definir senha e entrar'}</button>
        </form>
      </div>
    </div>
  );
}
