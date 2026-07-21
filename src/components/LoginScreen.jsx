/* ============================================================
   LOGIN & FIRST ACCESS
============================================================ */
function LoginScreen({ onSubmitLogin, stats }){
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(!email || !senha){ setError('Preencha e-mail e senha.'); return; }
    setError('');
    setLoading(true);
    const result = await onSubmitLogin(email, senha);
    setLoading(false);
    if(result && result.error){ setError(result.error); }
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

          {error && <div className="login-error" style={{display:'block'}}>{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off" name="nexus-login-email" />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} autoComplete="new-password" name="nexus-login-senha" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>

          <p className="login-foot">NEXUS © 2026 - Desenvolvido por Growp Brasil</p>
        </div>
      </div>
    </div>
  );
}
