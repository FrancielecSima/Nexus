/* ============================================================
   Sidebar — navegação lateral (empresa/cliente)
   Depende de: NAV_EMPRESA/NAV_CLIENTE (NavConfig.js), ícones (Icons.jsx)
============================================================ */
function Sidebar({ role, page, expandedGroups, toggleGroup, goPage, branding, clientName, onLogout, staffName, staffCargo }){
  const nav = role==='empresa' ? NAV_EMPRESA : NAV_CLIENTE;
  const who = role==='empresa'
    ? { av:(staffName||'EQ').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(), name:staffName||'Equipe', role:staffCargo||'Equipe interna' }
    : { av:branding.initial, name:clientName, role:branding.name };

  return (
    <aside className="sidebar">
      {role==='empresa'
        ? <div className="brand-mark"><div className="logo-box">N</div><span>NEXUS</span></div>
        : <div className="brand-mark"><div className="logo-box" style={{background:branding.primary}}>{branding.initial}</div><span>{branding.name}</span></div>}
      {role==='empresa'
        ? <div className="role-pill"><span className="dot"></span>Ambiente interno — Equipe</div>
        : <div className="role-pill"><span className="dot" style={{background:branding.primary}}></span>Portal do Cliente</div>}
      <nav>
        {nav.map(n => n.submenu ? (
          <div className="nav-group" key={n.id}>
            <button className={"nav-item " + (page===n.id?'active':'')} onClick={()=>toggleGroup(n.id)}>
              <n.icon/><span>{n.label}</span>
              <span className={"chev " + (expandedGroups[n.id]?'open':'')}><IconChevron/></span>
            </button>
            <div className={"nav-submenu " + (expandedGroups[n.id]?'open':'')}>
              {n.submenu.map(s=>(
                <button key={s.id} className={"nav-subitem " + (page===s.id?'active':'')} onClick={()=>goPage(s.id)}>{s.label}</button>
              ))}
            </div>
          </div>
        ) : (
          <button key={n.id} className={"nav-item " + (page===n.id?'active':'')} onClick={()=>goPage(n.id)}>
            <n.icon/><span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="nav-spacer"></div>
      <div className="sidebar-foot">
        <div className="av" style={role==='cliente'?{background:branding.primary}:{}}>{who.av}</div>
        <div className="who"><b>{who.name}</b><span>{who.role}</span></div>
        <button className="logout-btn" onClick={onLogout} title="Sair"><IconLogout/></button>
      </div>
    </aside>
  );
}
