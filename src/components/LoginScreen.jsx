/* ============================================================
   LOGIN & FIRST ACCESS
============================================================ */
function LoginScreen({ onSubmitLogin, stats }){
  const [roleChoice, setRoleChoice] = useState('empresa');
  const [email, setEmail] = useState('ana@souzatecnologia.com');
  const [senha, setSenha] = useState('12345678');
  const [error, setError] = useState(false);

  function submit(e){
    e.preventDefault();
    if(!email || !senha){ setError(true); return; }
    setError(false);
    onSubmitLogin(roleChoice);
  }

  return (
    <div id="login-screen">
      <div className="login-visual">
        <div className="brand-mark"><div className="logo-box">N</div><span>NEXUS</span></div>
        <div className="login-copy">
          <div className="eyebrow">● Gestão financeira &amp; suporte</div>
          <h1>Um único sistema para <em>operar</em> e <em>atender</em>.</h1>
          <p>Controle financeiro completo para a equipe e um portal dedicado para cada cliente acompanhar seus chamados — tudo com a identidade da sua marca.</p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form">
          <h2>Bem-vindo de volta</h2>
          <p className="sub">Entre com suas credenciais para acessar o painel.</p>

          <div className="role-toggle">
            <button type="button" className={roleChoice==='empresa'?'active':''} onClick={()=>setRoleChoice('empresa')}>Sou da Empresa</button>
            <button type="button" className={roleChoice==='cliente'?'active':''} onClick={()=>setRoleChoice('cliente')}>Sou Cliente</button>
          </div>

          {error && <div className="login-error" style={{display:'block'}}>Informe e-mail e senha para continuar.</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Entrar</button>
          </form>

          <p className="login-foot">NEXUS © 2026 - Desenvolvido por Growp Brasil</p>
        </div>
      </div>
    </div>
  );
}
