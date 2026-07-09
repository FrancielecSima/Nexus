/* ============================================================
   EMPRESA > DASHBOARD CLIENTES > PERSONALIZAÇÃO
============================================================ */
function PagePersonalizacao({ clientes, setClientes, selectedId, setSelectedId, clientName, setBranding, showToast }){
  const client = clientes.find(c=>c.id===selectedId) || clientes[0];
  const [name, setName] = useState(client ? client.empresa : '');
  const [primary, setPrimary] = useState(client ? client.primary : PALETTE[0]);
  const [secondary, setSecondary] = useState(client ? client.secondary : PALETTE[5]);

  useEffect(()=>{
    if(client){ setName(client.empresa); setPrimary(client.primary); setSecondary(client.secondary); }
  }, [selectedId]);

  if(!client) return <p className="empty-note">Nenhum cliente cadastrado ainda.</p>;

  const initial = (name.trim().charAt(0)||'C').toUpperCase();

  function save(){
    setClientes(prev=>prev.map(c=>c.id===client.id?{...c, empresa:name, primary, secondary, initial}:c));
    if(client.nome===clientName){ setBranding({ name, initial, primary, secondary }); }
    showToast('Personalização salva — o portal de ' + client.nome + ' foi atualizado');
  }

  return (
    <div className="grid g2">
      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>Configurações do Cliente</h3></div>
        <div className="field" style={{marginBottom:20}}>
          <label>Cliente</label>
          <select className="select-input" value={selectedId} onChange={e=>setSelectedId(e.target.value)}>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nome} — {c.empresa}</option>)}
          </select>
        </div>
        <div className="field" style={{marginBottom:20}}>
          <label>Logo do Cliente</label>
          <div style={{display:'flex', gap:16, alignItems:'center'}}>
            <div className="logo-upload" style={{background:primary, color:'#fff'}}>{initial}</div>
            <div>
              <button className="btn-mini solid" type="button" onClick={()=>showToast('Logo atualizado (simulação)')}>Enviar novo logo</button>
              <p style={{fontSize:11.5, color:'var(--gray)', marginTop:8}}>PNG ou SVG · fundo transparente<br/>recomendado 512×512px</p>
            </div>
          </div>
        </div>
        <div className="field" style={{marginBottom:20}}>
          <label>Nome exibido no portal</label>
          <input className="text-input" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="field" style={{marginBottom:20}}>
          <label>Cor Primária</label>
          <div className="swatches">
            {PALETTE.map(c=>(<span key={c} className={"swatch "+(c.toLowerCase()===primary.toLowerCase()?'selected':'')} style={{background:c}} onClick={()=>setPrimary(c)}></span>))}
          </div>
        </div>
        <div className="field" style={{marginBottom:26}}>
          <label>Cor Secundária</label>
          <div className="swatches">
            {PALETTE.map(c=>(<span key={c} className={"swatch "+(c.toLowerCase()===secondary.toLowerCase()?'selected':'')} style={{background:c}} onClick={()=>setSecondary(c)}></span>))}
          </div>
        </div>
        <button className="btn-mini solid" onClick={save}>Salvar Alterações</button>
      </div>

      <div className="card">
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Pré-visualização em Tempo Real</h3></div>
        <div className="preview-frame">
          <div className="preview-topbar">
            <div className="preview-side" style={{background:secondary}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:20}}>
                <div style={{width:26,height:26,borderRadius:7,background:primary,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:11}}>{initial}</div>
                <b style={{fontSize:11.5}}>{name}</b>
              </div>
              <div style={{fontSize:10.5, opacity:.55, marginBottom:8}}>Início</div>
              <div style={{fontSize:10.5, background:primary, padding:'6px 8px', borderRadius:6, marginBottom:8, fontWeight:700}}>Meus Chamados</div>
              <div style={{fontSize:10.5, opacity:.55}}>Nova Solicitação</div>
            </div>
            <div className="preview-main">
              <b style={{fontSize:13}}>Olá, {client.nome}</b>
              <div style={{background:primary, color:'#fff', borderRadius:10, padding:12, margin:'12px 0', fontSize:11.5, fontWeight:700}}>
                Precisa de suporte? Abra uma solicitação.
              </div>
              <div style={{display:'flex', gap:8}}>
                <div style={{flex:1, background:'#fff', border:'1px solid var(--line)', borderRadius:9, padding:9}}>
                  <div style={{fontSize:9.5, color:'var(--gray)', fontWeight:700}}>ABERTOS</div>
                  <div style={{fontSize:15, fontWeight:800}}>4</div>
                </div>
                <div style={{flex:1, background:'#fff', border:'1px solid var(--line)', borderRadius:9, padding:9}}>
                  <div style={{fontSize:9.5, color:'var(--gray)', fontWeight:700}}>ENCERRADOS</div>
                  <div style={{fontSize:15, fontWeight:800}}>21</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p style={{fontSize:11.5, color:'var(--gray)', textAlign:'center', marginTop:12}}>Este é o portal exatamente como o cliente selecionado vai vê-lo.</p>
      </div>
    </div>
  );
}

