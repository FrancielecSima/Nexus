/* ============================================================
   EMPRESA > FINANCEIRO > ORÇAMENTOS (usa catálogo de serviços)
============================================================ */
function PageFinOrcamentos({ orcamentos, clientes, servicos, onAdd, onStatusChange, goPage }){
  const [cliente,setCliente] = useState(clientes[0]?.nome || '');
  const [itemName,setItemName] = useState(servicos[0]?.nome || '');
  const [valor,setValor] = useState(servicos[0] ? String(servicos[0].valor) : '');
  const [comissao,setComissao] = useState(servicos[0] ? (servicos[0].valor*servicos[0].comissaoPercent/100).toFixed(2) : '');

  function onServicoChange(nome){
    setItemName(nome);
    const s = servicos.find(x=>x.nome===nome);
    if(s){ setValor(String(s.valor)); setComissao((s.valor*s.comissaoPercent/100).toFixed(2)); }
  }
  function onValorChange(v){
    setValor(v);
    setComissao(((parseFloat(v)||0)*0.2).toFixed(2));
  }
  function submit(e){
    e.preventDefault();
    if(!itemName || !valor) return;
    onAdd({ cliente, item:itemName, valor:parseFloat(valor), comissao:parseFloat(comissao)||0 });
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr 1.5fr', gap:18, alignItems:'start'}}>
      <div className="card">
        <div className="card-head"><div className="bar"></div><h3>Novo Orçamento</h3></div>
        <form onSubmit={submit}>
          <div className="field-l" style={{marginBottom:14}}>
            <label>Cliente</label>
            <select className="select-input" value={cliente} onChange={e=>setCliente(e.target.value)}>
              {clientes.map(c=><option key={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="field-l" style={{marginBottom:14}}>
            <label>Produto / Serviço</label>
            <select className="select-input" value={itemName} onChange={e=>onServicoChange(e.target.value)}>
              {servicos.map(s=><option key={s.id} value={s.nome}>{s.nome} — {fmtBRL(s.valor)}</option>)}
            </select>
          </div>
          <div className="form-grid" style={{marginBottom:20}}>
            <div className="field-l"><label>Valor (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valor} onChange={e=>onValorChange(e.target.value)} required/></div>
            <div className="field-l"><label>Comissão (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={comissao} onChange={e=>setComissao(e.target.value)} required/></div>
          </div>
          <button className="btn-mini solid" type="submit">Salvar Orçamento</button>
        </form>
        <p style={{fontSize:11.5,color:'var(--gray)',marginTop:14}}>Não encontrou o serviço? Cadastre em <a href="#" onClick={(e)=>{e.preventDefault(); goPage('fin-servicos');}} style={{color:'var(--laranja)', fontWeight:700}}>Financeiro → Serviços</a>.</p>
      </div>
      <div className="card">
        <div className="card-head"><div className="bar" style={{background:'var(--rosa)'}}></div><h3>Orçamentos e Andamento</h3></div>
        <table><thead><tr><th>Cliente</th><th>Item</th><th>Valor</th><th>Comissão</th><th>Andamento</th></tr></thead>
          <tbody>
            {orcamentos.map(o=>(
              <tr key={o.id}>
                <td><b>{o.cliente}</b></td><td>{o.item}</td><td>{fmtBRL(o.valor)}</td><td>{fmtBRL(o.comissao)}</td>
                <td>
                  <select className="status-select" value={o.status} onChange={e=>onStatusChange(o.id, e.target.value)}>
                    {Object.keys(ORC_STAGES).map(s=><option key={s}>{s}</option>)}
                  </select>
                  <div className="stage-track"><div className="stage-fill" style={{width:ORC_STAGES[o.status]+'%', background:ORC_COLOR[o.status]}}></div></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

