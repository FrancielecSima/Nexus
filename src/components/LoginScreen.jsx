/* ============================================================
   LOGIN & FIRST ACCESS
============================================================ */
function LoginScreen({ onSubmitLogin, stats, equipe }){
  const [roleChoice, setRoleChoice] = useState('empresa');
  const [staffId, setStaffId] = useState(equipe[0].id);
  const [email, setEmail] = useState('ana@souzatecnologia.com');
  const [senha, setSenha] = useState('12345678');
  const [error, setError] = useState(false);

  function submit(e){
    e.preventDefault();
    if(!email || !senha){ setError(true); return; }
    setError(false);
    onSubmitLogin(roleChoice, staffId);
  }

  return (
    <div id="login-screen">
      <div className="login-visual">
        <div className="brand-mark"><div className="logo-box">N</div><span>NEXUS</span></div>
        <div className="login-copy">
          <div className="eyebrow">● Suporte Técnico</div>
          <h1>Sistema personalizado para <em>operar</em> e <em>atender você</em>.</h1>
          <p>Portal dedicado para atender você com agilidade e precisão em cada etapa da sua jornada.</p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form">
          <h2>Bem-vindo de volta</h2>
          <p className="sub">Entre com suas credenciais para acessar o painel.</p>

          <div className="role-toggle">
            <button type="button" className={roleChoice==='empresa'?'active':''} onClick={()=>setRoleChoice('empresa')}>Sou da Equipe</button>
            <button type="button" className={roleChoice==='cliente'?'active':''} onClick={()=>setRoleChoice('cliente')}>Sou Cliente</button>
          </div>


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
