/* ============================================================
   APP
============================================================ */
function App(){
  const [loggedIn,setLoggedIn] = useState(false);
  const [role,setRole] = useState('empresa');
  const [page,setPage] = useState('financeiro');
  const [expandedGroups,setExpandedGroups] = useState({financeiro:true, clientes:true});
  const clientName = 'Ana Souza';
  const [branding,setBranding] = useState({ name:'Souza Tecnologia', initial:'S', primary:'#FF6A2B', secondary:'#1E1F24' });

  const [clientes,setClientes] = useState(initialClientes);
  const [servicos,setServicos] = useState(initialServicos);
  const [contas,setContas] = useState(initialContas);
  const [tickets,setTickets] = useState(initialTickets);
  const [caixa,setCaixa] = useState(initialCaixa);
  const [orcamentos,setOrcamentos] = useState(initialOrcamentos);
  const [gastos] = useState(initialGastos);
  const [terceirizados] = useState(initialTerceirizados);
  const [empresaNotifs,setEmpresaNotifs] = useState(initialEmpresaNotifs);
  const [clienteNotifs,setClienteNotifs] = useState(initialClienteNotifs);

  const [notifOpen,setNotifOpen] = useState(false);
  const [modalTicketId,setModalTicketId] = useState(null);
  const [toastMsg,setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const [personalizacaoSelectedId,setPersonalizacaoSelectedId] = useState(initialClientes[0].id);
  const [pendingAccount,setPendingAccount] = useState(null);

  useEffect(()=>{
    function handler(e){ if(!e.target.closest('.bell-wrap')) setNotifOpen(false); }
    document.addEventListener('click', handler);
    return ()=>document.removeEventListener('click', handler);
  },[]);

  function showToast(msg){
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToastMsg(null), 3200);
  }

  function toggleGroup(id){
    setExpandedGroups(prev=>({...prev,[id]:!prev[id]}));
    setPage(id);
  }
  function goPage(id){
    setPage(id);
    if(id.startsWith('fin-')) setExpandedGroups(prev=>({...prev, financeiro:true}));
    if(id==='personalizacao'||id==='cli-acessos') setExpandedGroups(prev=>({...prev, clientes:true}));
  }

  function handleBellClick(){
    const opening = !notifOpen;
    setNotifOpen(opening);
    if(opening){
      if(role==='empresa') setEmpresaNotifs(prev=>prev.map(n=>({...n,lido:true})));
      else setClienteNotifs(prev=>prev.map(n=>({...n,lido:true})));
    }
  }

  function attemptLogin(chosenRole){
    if(chosenRole==='empresa'){
      setLoggedIn(true); setRole('empresa'); setPage('financeiro');
      return;
    }
    const acc = contas.find(a=>a.nome===clientName);
    if(acc && acc.primeiroAcesso){ setPendingAccount(acc); }
    else { loginAsCliente(); }
  }
  function loginAsCliente(){
    const c = clientes.find(x=>x.nome===clientName) || clientes[0];
    if(c) setBranding({ name:c.empresa, initial:c.initial, primary:c.primary, secondary:c.secondary });
    setLoggedIn(true); setRole('cliente'); setPage('inicio');
  }
  function confirmNewPassword(newPass){
    setContas(prev=>prev.map(a=>a.id===pendingAccount.id?{...a, senha:newPass, primeiroAcesso:false}:a));
    setPendingAccount(null);
    loginAsCliente();
    showToast('Senha definida com sucesso!');
  }
  function logout(){
    setLoggedIn(false);
    setNotifOpen(false);
  }

  function addClienteNotif(text){ setClienteNotifs(prev=>[{id:uid('cn'), text, time:'agora mesmo', lido:false}, ...prev]); }
  function addEmpresaNotif(text){ setEmpresaNotifs(prev=>[{id:uid('en'), text, time:'agora mesmo', lido:false}, ...prev]); }

  function updateTicketStatus(id, status){
    setTickets(prev=>prev.map(t=>t.id===id?{...t,status}:t));
    addClienteNotif(`Atualização no chamado ${id}: status alterado para "${STATUS_LABELS[status]}"`);
    showToast('Status do chamado ' + id + ' atualizado');
  }
  function sendInfo(id, msg){
    setTickets(prev=>prev.map(t=>t.id===id?{...t, status:'aguardando_retorno', history:[...t.history, {text:`Equipe solicitou: "${msg}"`, time:'agora mesmo'}]}:t));
    addClienteNotif(`O suporte pediu mais informações no chamado ${id}`);
    showToast('Solicitação enviada ao cliente');
    setModalTicketId(null);
  }
  function submitNovaSolicitacao(data){
    const id = '#' + (1053 + tickets.length + Math.floor(Math.random()*89));
    setTickets(prev=>[{ id, cliente:clientName, title:data.assunto, status:'em_atendimento', priority:data.prioridade, date:'Agora mesmo', categoria:data.categoria, descricao:data.descricao, history:[] }, ...prev]);
    addEmpresaNotif(`Novo chamado aberto por ${clientName} — "${data.assunto}"`);
    showToast('Solicitação enviada com sucesso!');
    setPage('chamados');
  }

  function saveClient(data, editingId){
    if(editingId){
      setClientes(prev=>prev.map(c=>c.id===editingId?{...c, ...data}:c));
      showToast('Cliente atualizado com sucesso!');
    } else {
      const color = PALETTE[clientes.length % PALETTE.length];
      setClientes(prev=>[...prev, { id:uid('cli'), ...data, empresa:data.nome, primary:color, secondary:'#1E1F24', initial:data.nome.charAt(0).toUpperCase() }]);
      showToast('Cliente cadastrado com sucesso!');
    }
  }
  function deleteClient(id){
    if(!window.confirm('Excluir este cliente? Essa ação não pode ser desfeita.')) return;
    setClientes(prev=>prev.filter(c=>c.id!==id));
    showToast('Cliente excluído.');
  }

  function saveCaixa(data, editingId){
    if(editingId){
      setCaixa(prev=>prev.map(e=>e.id===editingId?{...e, ...data}:e));
      showToast('Lançamento atualizado com sucesso!');
    } else {
      setCaixa(prev=>[...prev, { id:uid('cx'), ...data }]);
      const ref = mesReferencia(data.vencimento);
      showToast('Lançamento adicionado — somado ao total de "' + ref.label + '"');
    }
  }
  function deleteCaixa(id){
    if(!window.confirm('Excluir este lançamento?')) return;
    setCaixa(prev=>prev.filter(e=>e.id!==id));
    showToast('Lançamento excluído.');
  }

  function addOrcamento(data){
    setOrcamentos(prev=>[{ id:uid('orc'), ...data, status:'Em análise' }, ...prev]);
    showToast('Orçamento cadastrado!');
  }
  function updateOrcamentoStatus(id, status){
    setOrcamentos(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    showToast('Andamento atualizado para "' + status + '"');
  }

  if(pendingAccount){
    return <FirstAccessScreen account={pendingAccount} onDone={confirmNewPassword}/>;
  }
  if(!loggedIn){
    const stats = { clientes: clientes.length, encerrados: tickets.filter(t=>t.status==='encerrado').length, sla:'3h40m' };
    return <LoginScreen onSubmitLogin={attemptLogin} stats={stats}/>;
  }

  const meta = PAGE_META(clientName)[page] || { title:'', sub:'' };
  const notifs = role==='empresa' ? empresaNotifs : clienteNotifs;
  const avatarInitials = role==='empresa' ? 'CS' : branding.initial;
  const modalTicket = modalTicketId ? tickets.find(t=>t.id===modalTicketId) : null;

  return (
    <div id="app" style={{display:'block'}}>
      <div className="shell">
        <Sidebar role={role} page={page} expandedGroups={expandedGroups} toggleGroup={toggleGroup} goPage={goPage} branding={branding} clientName={clientName} onLogout={logout}/>
        <main className="main">
          <Topbar title={meta.title} sub={meta.sub} notifs={notifs} notifOpen={notifOpen} onBellClick={handleBellClick} role={role} branding={branding} avatarInitials={avatarInitials}/>
          <div id="page-content">
            {role==='empresa' && page==='financeiro' && <PageFinanceiro tickets={tickets} caixa={caixa} orcamentos={orcamentos} gastos={gastos} terceirizados={terceirizados} clientes={clientes}/>}
            {role==='empresa' && page==='fin-clientes' && <PageFinClientes clientes={clientes} onSave={saveClient} onDelete={deleteClient}/>}
            {role==='empresa' && page==='fin-caixa' && <PageFinCaixa caixa={caixa} clientes={clientes} onSave={saveCaixa} onDelete={deleteCaixa}/>}
            {role==='empresa' && page==='fin-orcamentos' && <PageFinOrcamentos orcamentos={orcamentos} clientes={clientes} servicos={servicos} onAdd={addOrcamento} onStatusChange={updateOrcamentoStatus} goPage={goPage}/>}
            {role==='empresa' && page==='fin-servicos' && <PageFinServicos servicos={servicos} setServicos={setServicos} showToast={showToast}/>}
            {role==='empresa' && page==='fin-chamados' && <PageFinChamados tickets={tickets} onOpenModal={setModalTicketId} onStatusChange={updateTicketStatus}/>}
            {role==='empresa' && page==='clientes' && <PageDashboardClientes clientes={clientes} tickets={tickets} onPersonalizar={(id)=>{ setPersonalizacaoSelectedId(id); goPage('personalizacao'); }}/>}
            {role==='empresa' && page==='personalizacao' && <PagePersonalizacao clientes={clientes} setClientes={setClientes} selectedId={personalizacaoSelectedId} setSelectedId={setPersonalizacaoSelectedId} clientName={clientName} setBranding={setBranding} showToast={showToast}/>}
            {role==='empresa' && page==='cli-acessos' && <PageCliAcessos contas={contas} setContas={setContas} showToast={showToast}/>}

            {role==='cliente' && page==='inicio' && <PageInicio tickets={tickets} clientName={clientName} branding={branding} clienteNotifs={clienteNotifs} onGoNova={()=>setPage('nova')}/>}
            {role==='cliente' && page==='chamados' && <PageChamados tickets={tickets} clientName={clientName}/>}
            {role==='cliente' && page==='nova' && <PageNova branding={branding} onSubmit={submitNovaSolicitacao}/>}
            {role==='cliente' && page==='perfil' && <PagePerfil clientName={clientName} branding={branding} contas={contas}/>}
          </div>
        </main>
      </div>
      <TicketModal ticket={modalTicket} onClose={()=>setModalTicketId(null)} onSendInfo={sendInfo}/>
      <Toast msg={toastMsg}/>
    </div>
  );
}

