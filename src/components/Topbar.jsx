/* ============================================================
   Topbar — cabeçalho com título, sino de notificações e avatar
   Depende de: IconBell (Icons.jsx)
============================================================ */
function Topbar({ title, sub, notifs, notifOpen, onBellClick, role, branding, avatarInitials }){
  const unread = notifs.filter(n=>!n.lido).length;
  return (
    <div className="topbar">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div className="topbar-right">
        <div className="bell-wrap">
          <button className="bell-btn" onClick={onBellClick} aria-label="Notificações">
            <IconBell/>
            {unread>0 && <span className="bell-badge" style={{background: role==='empresa' ? 'var(--laranja)' : branding.primary}}>{unread}</span>}
          </button>
          <div className={"notif-panel " + (notifOpen?'open':'')}>
            <div className="np-head">Notificações</div>
            {notifs.length===0 && <p className="empty-note-sm">Nenhuma notificação.</p>}
            {notifs.map(n=>(
              <div key={n.id} className={"notif-item " + (!n.lido?'unread':'')}>
                <div className={"notif-dot " + (n.lido?'read':'')} style={!n.lido?{background: role==='empresa' ? 'var(--laranja)' : branding.primary}:{}}></div>
                <div><p>{n.text}</p><span>{n.time}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="avatar-btn" style={role==='cliente'?{background:branding.primary}:{}}>{avatarInitials}</div>
      </div>
    </div>
  );
}
