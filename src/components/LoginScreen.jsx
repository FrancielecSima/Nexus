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
          <div className="eyebrow">● Gestão financeira &amp; suporte</div>
          <h1>Um único sistema para <em>operar</em> e <em>atender</em>.</h1>
          <p>Controle financeiro completo para a equipe e um portal dedicado para cada cliente acompanhar seus chamados — tudo com a identidade da sua marca.</p>
        </div>
        <div className="login-stats">
          <div><b>{stats.clientes}</b><span>clientes ativos</span></div>
          <div><b>{stats.encerrados}</b><span>chamados encerrados</span></div>
          <div><b>{stats.sla}</b><span>SLA</span></div>
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

          {roleChoice==='empresa' && (
            <div className="field" style={{marginBottom:16}}>
              <label>Quem é você?</label>
              <select className="select-input" value={staffId} onChange={e=>setStaffId(e.target.value)}>
                {equipe.map(p=><option key={p.id} value={p.id}>{p.nome} — {p.cargo}</option>)}
              </select>
            </div>
          )}

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

          <div className="divider-text">acesso rápido de demonstração</div>
          <div className="quick-row">
            <button type="button" className="btn-quick" onClick={()=>{ setRoleChoice('empresa'); onSubmitLogin('empresa', staffId); }}>🏢 Entrar como Equipe</button>
            <button type="button" className="btn-quick" onClick={()=>{ setRoleChoice('cliente'); onSubmitLogin('cliente'); }}>👤 Entrar como Cliente</button>
          </div>

          <p className="login-foot">NEXUS © 2026 - Desenvolvido por Growp Brasil</p>
        </div>
      </div>
    </div>
  );
}
