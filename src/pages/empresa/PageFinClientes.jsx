/* ============================================================
   EMPRESA > FINANCEIRO > CLIENTES (lista + subpágina + editar/excluir)
============================================================ */
function FinClientesList({ clientes, onNew, onEdit, onDelete }){
  return (
    <div className="card">
      <div className="card-head" style={{justifyContent:'space-between', display:'flex'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}><div className="bar"></div><h3>Clientes Cadastrados ({clientes.length})</h3></div>
        <button className="btn-mini solid" onClick={onNew}>+ Novo Cliente</button>
      </div>
      <table><thead><tr><th>Cliente</th><th>CNPJ</th><th>E-mail</th><th>Serviço Prestado</th><th>Valor Mensal</th><th></th></tr></thead>
        <tbody>
          {clientes.map(c=>(
            <tr key={c.id}>
              <td><b>{c.nome}</b><br/><span style={{fontSize:11,color:'var(--gray)'}}>{c.endereco}</span></td>
              <td>{c.cnpj}</td>
              <td>{c.email}</td>
              <td>{c.servico}</td>
              <td><b>{fmtBRL(c.valorMensal||0)}</b>/mês</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn-sm ghost" onClick={()=>onEdit(c.id)}>Editar</button>
                  <button className="icon-btn-sm danger" onClick={()=>onDelete(c.id)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
          {clientes.length===0 && <tr><td colSpan="6" className="empty-note-sm">Nenhum cliente cadastrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function FinClientesForm({ editingClient, onSave, onCancel }){
  const [nome,setNome]=useState(editingClient?.nome||'');
  const [cnpj,setCnpj]=useState(editingClient?.cnpj||'');
  const [email,setEmail]=useState(editingClient?.email||'');
  const [endereco,setEndereco]=useState(editingClient?.endereco||'');
  const [servico,setServico]=useState(editingClient?.servico||'');
  const [valorMensal,setValorMensal]=useState(editingClient? String(editingClient.valorMensal) : '');

  function submit(e){
    e.preventDefault();
    if(!nome||!cnpj||!email||!endereco||!servico||valorMensal==='') return;
    onSave({ nome, cnpj, email, endereco, servico, valorMensal:parseFloat(valorMensal) });
  }
  return (
    <div className="card" style={{maxWidth:640}}>
      <div className="card-head"><div className="bar"></div><h3>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3></div>
      <form onSubmit={submit}>
        <div className="field-l" style={{marginBottom:14}}>
          <label>Nome / Empresa</label>
          <input className="text-input" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Ana Souza — Souza Tecnologia" required/>
        </div>
        <div className="form-grid" style={{marginBottom:14}}>
          <div className="field-l"><label>CNPJ</label><input className="text-input" value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="00.000.000/0001-00" required/></div>
          <div className="field-l"><label>E-mail</label><input type="email" className="text-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="contato@empresa.com" required/></div>
        </div>
        <div className="field-l" style={{marginBottom:14}}>
          <label>Endereço</label>
          <input className="text-input" value={endereco} onChange={e=>setEndereco(e.target.value)} placeholder="Rua, número — Cidade/UF" required/>
        </div>
        <div className="form-grid" style={{marginBottom:20}}>
          <div className="field-l"><label>Serviço Prestado</label><input className="text-input" value={servico} onChange={e=>setServico(e.target.value)} placeholder="Ex: Suporte N2, Consultoria..." required/></div>
          <div className="field-l"><label>Valor Mensal (R$)</label><input type="number" step="0.01" min="0" className="text-input" value={valorMensal} onChange={e=>setValorMensal(e.target.value)} placeholder="0,00" required/></div>
        </div>
        <div className="form-actions">
          <button className="btn-mini solid" type="submit">{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
          <button className="btn-mini ghost" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
function PageFinClientes({ clientes, onSave, onDelete }){
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const editingClient = editing ? clientes.find(c=>c.id===editing) : null;
  return view==='form'
    ? <FinClientesForm editingClient={editingClient} onSave={(data)=>{ onSave(data, editing); setView('list'); setEditing(null); }} onCancel={()=>{setView('list'); setEditing(null);}}/>
    : <FinClientesList clientes={clientes} onNew={()=>{setEditing(null); setView('form');}} onEdit={(id)=>{setEditing(id); setView('form');}} onDelete={onDelete}/>;
}

