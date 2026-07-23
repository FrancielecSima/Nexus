/* ============================================================
   CLIENTE > Perfil
============================================================ */
function PagePerfil({ clientName, branding, clienteEmail }){
  return (
    <div className="card" style={{maxWidth:520}}>
      <div className="card-head"><div className="bar" style={{background:branding.primary}}></div><h3>Meus Dados</h3></div>
      <div className="field-l" style={{marginBottom:14}}><label>Nome</label><input className="text-input" value={clientName} disabled/></div>
      <div className="field-l" style={{marginBottom:14}}><label>Empresa</label><input className="text-input" value={branding.name} disabled/></div>
      <div className="field-l" style={{marginBottom:14}}><label>E-mail</label><input className="text-input" value={clienteEmail||''} disabled/></div>
      <div className="field-l"><label>Plano de Suporte</label><input className="text-input" value="Premium" disabled/></div>
    </div>
  );
}
