/* ============================================================
   APP
============================================================ */
function App(){
  const [loggedIn,setLoggedIn] = useState(false);
  const [authChecked,setAuthChecked] = useState(false);
  const [authUser,setAuthUser] = useState(null);
  const [role,setRole] = useState('empresa');
  const [page,setPage] = useState('financeiro');
  const [expandedGroups,setExpandedGroups] = useState({financeiro:true, clientes:true});
  const [clientName,setClientName] = useState('');
  const [branding,setBranding] = useState({ name:'Souza Tecnologia', initial:'S', primary:'#FF6A2B', secondary:'#1E1F24' });

  const [clientes,setClientes] = useState([]);
  const [servicos,setServicos] = useState(initialServicos);
  const [contas,setContas] = useState(initialContas);
  const [equipe] = useState(initialEquipe);
  const [currentStaffId,setCurrentStaffId] = useState(null);
  const [tickets,setTickets] = useState(initialTickets);
  const [caixa,setCaixa] = useState(initialCaixa);
  const [orcamentos,setOrcamentos] = useState(initialOrcamentos);
  const [gastos,setGastos] = useState(initialGastos);
  const [terceirizados] = useState(initialTerceirizados);
  const [empresaNotifs,setEmpresaNotifs] = useState(initialEmpresaNotifs);
  const [clienteNotifs,setClienteNotifs] = useState(initialClienteNotifs);
  const [auditLog,setAuditLog] = useState(initialAuditLog);

  const [notifOpen,setNotifOpen] = useState(false);
  const [modalTicketId,setModalTicketId] = useState(null);
  const [toastMsg,setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const [personalizacaoSelectedId,setPersonalizacaoSelectedId] = useState(null);
  const [pendingAccount,setPendingAccount] = useState(null);

  // ---------- Autenticação real (Supabase Auth) ----------
  // Restaura a sessão ao carregar a página e escuta mudanças de login/logout
  // (inclusive se o usuário sair em outra aba, ou o token expirar).
  useEffect(()=>{
    supabaseClient.auth.getSession().then(({ data })=>{
      handleAuthChange(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session)=>{
      handleAuthChange(session);
    });
    return ()=>{ listener.subscription.unsubscribe(); };
  },[]);

  async function handleAuthChange(session){
    if(!session){
      setAuthUser(null);
      setLoggedIn(false);
      return;
    }
    setAuthUser(session.user);

    const { data: profile, error: profileErr } = await supabaseClient
      .from('profiles').select('*').eq('id', session.user.id).single();

    if(profileErr || !profile){
      showToast('Não encontrei um perfil para este usuário. Peça para a empresa te cadastrar.');
      await supabaseClient.auth.signOut();
      return;
    }

    if(profile.must_change_password){
      setPendingAccount({ id: session.user.id, nome: profile.nome });
      return;
    }

    if(profile.role === 'empresa'){
      setRole('empresa');
      setCurrentStaffId(session.user.id);
      setLoggedIn(true);
      setPage('financeiro');
    } else {
      const { data: cliente } = await supabaseClient
        .from('clientes').select('*').eq('auth_user_id', session.user.id).single();
      if(cliente){
        setClientName(cliente.nome);
        setBranding({ name: cliente.empresa, initial: cliente.sigla, primary: cliente.cor_primaria, secondary: cliente.cor_secundaria });
      }
      setRole('cliente');
      setLoggedIn(true);
      setPage('inicio');
    }
  }

  async function attemptLogin(email, senha){
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
    if(error){ return { error: 'E-mail ou senha inválidos.' }; }
    return {};
  }

  async function confirmNewPassword(newPass){
    const { error } = await supabaseClient.auth.updateUser({ password: newPass });
    if(error){ showToast('Erro ao definir senha: ' + error.message); return; }
    await supabaseClient.from('profiles').update({ must_change_password: false }).eq('id', pendingAccount.id);
    const { data } = await supabaseClient.auth.getSession();
    setPendingAccount(null);
    await handleAuthChange(data.session);
    showToast('Senha definida com sucesso!');
  }

  async function logout(){
    await supabaseClient.auth.signOut();
    setLoggedIn(false);
    setAuthUser(null);
    setNotifOpen(false);
  }

  // ---------- Clientes (dados reais do Supabase) ----------
  useEffect(()=>{
    if(!loggedIn || role!=='empresa') return;
    loadClientes();
  }, [loggedIn, role]);

  async function loadClientes(){
    const { data, error } = await supabaseClient.from('clientes').select('*').order('created_at', {ascending:true});
    if(error){ showToast('Erro ao carregar clientes: ' + error.message); return; }
    const lista = data.map(clienteFromRow);
    setClientes(lista);
    if(lista.length>0 && !personalizacaoSelectedId) setPersonalizacaoSelectedId(lista[0].id);
  }

  // ---------- Persistência local (interina, até migrarmos cada tela para o Supabase) ----------
  // Isto ainda cobre só as LISTAS de dados (clientes, tickets, caixa...), que por enquanto
  // continuam vindo do seedData.js. O login acima já é 100% real via Supabase Auth.
  // Guarda no navegador para sobreviver a um F5, mas NÃO é um banco de verdade — é o próximo
  // pedaço a ser migrado.
  const hydrated = useRef(false);
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('nexus_data_v1');
      if(raw){
        const saved = JSON.parse(raw);
        if(saved.servicos) setServicos(saved.servicos);
        if(saved.contas) setContas(saved.contas);
        if(saved.tickets) setTickets(saved.tickets);
        if(saved.caixa) setCaixa(saved.caixa);
        if(saved.orcamentos) setOrcamentos(saved.orcamentos);
        if(saved.gastos) setGastos(saved.gastos);
        if(saved.auditLog) setAuditLog(saved.auditLog);
      }
    } catch(e){ console.error('Falha ao carregar dados salvos localmente:', e); }
    hydrated.current = true;
  },[]);
  useEffect(()=>{
    if(!hydrated.current) return;
    try {
      localStorage.setItem('nexus_data_v1', JSON.stringify({
        servicos, contas, tickets, caixa, orcamentos, gastos, auditLog
      }));
    } catch(e){ console.error('Falha ao salvar dados localmente:', e); }
  }, [servicos, contas, tickets, caixa, orcamentos, gastos, auditLog]);

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

  function currentStaffName(){
    const s = equipe.find(e=>e.id===currentStaffId);
    return s ? s.nome : 'Equipe';
  }
  function logAudit(acao, detalhe){
    setAuditLog(prev=>[{ id:uid('log'), quando:new Date().toISOString(), usuario:currentStaffName(), acao, detalhe }, ...prev].slice(0,500));
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

  function addClienteNotif(text){ setClienteNotifs(prev=>[{id:uid('cn'), text, time:'agora mesmo', lido:false}, ...prev]); }
  function addEmpresaNotif(text){ setEmpresaNotifs(prev=>[{id:uid('en'), text, time:'agora mesmo', lido:false}, ...prev]); }

  // ---------- Chamados ----------
  function updateTicketStatus(id, status){
    setTickets(prev=>prev.map(t=>{
      if(t.id!==id) return t;
      const patch = { status };
      if(!t.primeiraRespostaEm) patch.primeiraRespostaEm = new Date().toISOString();
      if(status==='encerrado' && !t.encerradoEm) patch.encerradoEm = new Date().toISOString();
      if(status!=='encerrado') patch.encerradoEm = null;
      return { ...t, ...patch };
    }));
    addClienteNotif(`Atualização no chamado ${id}: status alterado para "${STATUS_LABELS[status]}"`);
    logAudit('Alterou status de chamado', `${id} → ${STATUS_LABELS[status]}`);
    showToast('Status do chamado ' + id + ' atualizado');
  }
  function sendInfo(id, msg){
    setTickets(prev=>prev.map(t=>t.id===id?{
      ...t, status:'aguardando_retorno',
      primeiraRespostaEm: t.primeiraRespostaEm || new Date().toISOString(),
      history:[...t.history, {text:`Equipe solicitou: "${msg}"`, time:'agora mesmo'}]
    }:t));
    addClienteNotif(`O suporte pediu mais informações no chamado ${id}`);
    showToast('Solicitação enviada ao cliente');
    setModalTicketId(null);
  }
  function assignResponsavel(id, responsavelId){
    setTickets(prev=>prev.map(t=>t.id===id?{...t, responsavelId}:t));
    const nome = equipe.find(e=>e.id===responsavelId);
    showToast('Chamado atribuído a ' + (nome?nome.nome:'—'));
  }
  function submitNovaSolicitacao(data){
    const id = '#' + (1053 + tickets.length + Math.floor(Math.random()*89));
    setTickets(prev=>[{ id, cliente:clientName, title:data.assunto, status:'em_atendimento', priority:data.prioridade, categoria:data.categoria, descricao:data.descricao, history:[], responsavelId:null, criadoEm:new Date().toISOString(), primeiraRespostaEm:null, encerradoEm:null, avaliacao:null }, ...prev]);
    addEmpresaNotif(`Novo chamado aberto por ${clientName} — "${data.assunto}"`);
    showToast('Solicitação enviada com sucesso!');
    setPage('chamados');
  }
  function avaliarChamado(id, nota){
    setTickets(prev=>prev.map(t=>t.id===id?{...t, avaliacao:nota}:t));
    addEmpresaNotif(`${clientName} avaliou o chamado ${id} com nota ${nota}`);
    showToast('Obrigado pela avaliação!');
  }

  // ---------- Clientes ----------
  async function saveClient(data, editingId){
    if(editingId){
      const antes = clientes.find(c=>c.id===editingId);
      const { data: row, error } = await supabaseClient
        .from('clientes').update(clienteToRow(data)).eq('id', editingId).select().single();
      if(error){ showToast('Erro ao salvar cliente: ' + error.message); return; }
      setClientes(prev=>prev.map(c=>c.id===editingId?clienteFromRow(row):c));
      logAudit('Editou cliente', `${data.nome} — valor mensal ${fmtBRL(antes?antes.valorMensal:0)} → ${fmtBRL(data.valorMensal)}`);
      showToast('Cliente atualizado com sucesso!');
    } else {
      const color = PALETTE[clientes.length % PALETTE.length];
      const payload = clienteToRow({ ...data, empresa:data.nome, primary:color, secondary:'#1E1F24', initial:data.nome.charAt(0).toUpperCase() });
      const { data: row, error } = await supabaseClient.from('clientes').insert(payload).select().single();
      if(error){ showToast('Erro ao cadastrar cliente: ' + error.message); return; }
      setClientes(prev=>[...prev, clienteFromRow(row)]);
      logAudit('Cadastrou cliente', data.nome);
      showToast('Cliente cadastrado com sucesso!');
    }
  }
  async function deleteClient(id){
    if(!window.confirm('Excluir este cliente? Essa ação não pode ser desfeita.')) return;
    const c = clientes.find(x=>x.id===id);
    const { error } = await supabaseClient.from('clientes').delete().eq('id', id);
    if(error){ showToast('Erro ao excluir cliente: ' + error.message); return; }
    setClientes(prev=>prev.filter(c=>c.id!==id));
    logAudit('Excluiu cliente', c?c.nome:id);
    showToast('Cliente excluído.');
  }
  async function savePersonalizacao(id, patch){
    const { data: row, error } = await supabaseClient
      .from('clientes').update(clienteToRow(patch)).eq('id', id).select().single();
    if(error){ showToast('Erro ao salvar personalização: ' + error.message); return; }
    const atualizado = clienteFromRow(row);
    setClientes(prev=>prev.map(c=>c.id===id?atualizado:c));
    if(atualizado.nome===clientName){ setBranding({ name:atualizado.empresa, initial:atualizado.initial, primary:atualizado.primary, secondary:atualizado.secondary }); }
    showToast('Personalização salva — o portal de ' + atualizado.nome + ' foi atualizado');
  }

  // ---------- Caixa ----------
  function saveCaixa(data, editingId){
    if(editingId){
      setCaixa(prev=>prev.map(e=>e.id===editingId?{...e, ...data}:e));
      logAudit('Editou lançamento de caixa', `${data.cliente} — ${fmtBRL(data.valor)} (venc. ${data.vencimento})`);
      showToast('Lançamento atualizado com sucesso!');
    } else {
      setCaixa(prev=>[...prev, { id:uid('cx'), status:'pendente', dataPagamento:null, ...data }]);
      const ref = mesReferencia(data.vencimento);
      logAudit('Criou lançamento de caixa', `${data.cliente} — ${fmtBRL(data.valor)} (venc. ${data.vencimento})`);
      showToast('Lançamento adicionado — somado ao total de "' + ref.label + '"');
    }
  }
  function deleteCaixa(id){
    if(!window.confirm('Excluir este lançamento?')) return;
    const e = caixa.find(x=>x.id===id);
    setCaixa(prev=>prev.filter(e=>e.id!==id));
    logAudit('Excluiu lançamento de caixa', e ? `${e.cliente} — ${fmtBRL(e.valor)}` : id);
    showToast('Lançamento excluído.');
  }
  function marcarPago(id, dataPagamento){
    setCaixa(prev=>prev.map(e=>e.id===id?{...e, status:'pago', dataPagamento: dataPagamento || new Date().toISOString().slice(0,10)}:e));
    const e = caixa.find(x=>x.id===id);
    logAudit('Marcou lançamento como pago', e ? `${e.cliente} — ${fmtBRL(e.valor)}` : id);
    showToast('Lançamento marcado como pago!');
  }
  // Gera lançamentos futuros com base na periodicidade de cada cliente (mensal/
  // trimestral/anual), evitando duplicar um mesmo período. Cobre os próximos 12 meses.
  function gerarCobrancasFuturas(){
    const hoje = new Date();
    let criados = 0;
    setCaixa(prev=>{
      const novos = [...prev];
      clientes.forEach(c=>{
        const passo = PERIODICIDADE_MESES[c.periodicidade] || 1;
        for(let i=0; i<12; i+=passo){
          const d = new Date(hoje.getFullYear(), hoje.getMonth()+i, Math.min(10,28));
          const venc = d.toISOString().slice(0,10);
          const jaExiste = novos.some(e=>e.cliente===c.nome && e.vencimento.slice(0,7)===venc.slice(0,7));
          if(!jaExiste){
            novos.push({ id:uid('cx'), cliente:c.nome, valor:c.valorMensal, vencimento:venc, status:'pendente', dataPagamento:null, anexos:{boleto:null,nota:null} });
            criados++;
          }
        }
      });
      return novos;
    });
    logAudit('Gerou cobranças futuras', `${criados} lançamento(s) criado(s) para os próximos 12 meses`);
    showToast(criados>0 ? `${criados} cobrança(s) futura(s) gerada(s)!` : 'Nenhuma cobrança nova — já estava tudo gerado.');
  }

  // ---------- Orçamentos ----------
  function addOrcamento(data){
    setOrcamentos(prev=>[{ id:uid('orc'), ...data, status:'Em análise' }, ...prev]);
    showToast('Orçamento cadastrado!');
  }
  function updateOrcamentoStatus(id, status){
    setOrcamentos(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    showToast('Andamento atualizado para "' + status + '"');
  }

  // ---------- Gastos ----------
  function saveGasto(data, editingId){
    if(editingId){
      setGastos(prev=>prev.map(g=>g.id===editingId?{...g, ...data}:g));
      logAudit('Editou gasto', data.desc);
      showToast('Gasto atualizado!');
    } else {
      setGastos(prev=>[...prev, { id:uid('gs'), ...data }]);
      logAudit('Cadastrou gasto', data.desc);
      showToast('Gasto cadastrado!');
    }
  }
  function deleteGasto(id){
    if(!window.confirm('Excluir este gasto?')) return;
    const g = gastos.find(x=>x.id===id);
    setGastos(prev=>prev.filter(g=>g.id!==id));
    logAudit('Excluiu gasto', g?g.desc:id);
    showToast('Gasto excluído.');
  }
  function gerarGastosRecorrentes(){
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0,7);
    let criados = 0;
    setGastos(prev=>{
      const fixos = prev.filter(g=>g.recorrente);
      const novos = [...prev];
      fixos.forEach(g=>{
        const jaExiste = novos.some(x=>x.desc===g.desc && x.vencimento.slice(0,7)===mesAtual);
        if(!jaExiste){
          const d = new Date(hoje.getFullYear(), hoje.getMonth(), new Date(g.vencimento+'T00:00:00').getDate());
          novos.push({ id:uid('gs'), desc:g.desc, valor:g.valor, vencimento:d.toISOString().slice(0,10), categoria:g.categoria, recorrente:true });
          criados++;
        }
      });
      return novos;
    });
    logAudit('Gerou gastos recorrentes do mês', `${criados} gasto(s) criado(s)`);
    showToast(criados>0 ? `${criados} gasto(s) fixo(s) gerado(s) para este mês!` : 'Gastos fixos deste mês já estavam gerados.');
  }

  if(!authChecked){
    return <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#888'}}>Carregando...</div>;
  }
  if(pendingAccount){
    return <FirstAccessScreen account={pendingAccount} onDone={confirmNewPassword}/>;
  }
  if(!loggedIn){
    const stats = { clientes: clientes.length, encerrados: tickets.filter(t=>t.status==='encerrado').length, sla:'calculado em tempo real' };
    return <LoginScreen onSubmitLogin={attemptLogin} stats={stats}/>;
  }

  const meta = PAGE_META(clientName)[page] || { title:'', sub:'' };
  const notifs = role==='empresa' ? empresaNotifs : clienteNotifs;
  const avatarInitials = role==='empresa' ? (equipe.find(e=>e.id===currentStaffId)||{}).avatar || 'EQ' : branding.initial;
  const modalTicket = modalTicketId ? tickets.find(t=>t.id===modalTicketId) : null;

  return (
    <div id="app" style={{display:'block'}}>
      <div className="shell">
        <Sidebar role={role} page={page} expandedGroups={expandedGroups} toggleGroup={toggleGroup} goPage={goPage} branding={branding} clientName={clientName} onLogout={logout} staffName={currentStaffName()} staffCargo={(equipe.find(e=>e.id===currentStaffId)||{}).cargo}/>
        <main className="main">
          <Topbar title={meta.title} sub={meta.sub} notifs={notifs} notifOpen={notifOpen} onBellClick={handleBellClick} role={role} branding={branding} avatarInitials={avatarInitials}/>
          <div id="page-content">
            {role==='empresa' && page==='financeiro' && <PageFinanceiro tickets={tickets} caixa={caixa} orcamentos={orcamentos} gastos={gastos} terceirizados={terceirizados} clientes={clientes} equipe={equipe}/>}
            {role==='empresa' && page==='fin-clientes' && <PageFinClientes clientes={clientes} onSave={saveClient} onDelete={deleteClient}/>}
            {role==='empresa' && page==='fin-caixa' && <PageFinCaixa caixa={caixa} clientes={clientes} onSave={saveCaixa} onDelete={deleteCaixa} onMarcarPago={marcarPago} onGerarCobrancas={gerarCobrancasFuturas}/>}
            {role==='empresa' && page==='fin-orcamentos' && <PageFinOrcamentos orcamentos={orcamentos} clientes={clientes} servicos={servicos} onAdd={addOrcamento} onStatusChange={updateOrcamentoStatus} goPage={goPage}/>}
            {role==='empresa' && page==='fin-servicos' && <PageFinServicos servicos={servicos} setServicos={setServicos} showToast={showToast}/>}
            {role==='empresa' && page==='fin-gastos' && <PageGastos gastos={gastos} onSave={saveGasto} onDelete={deleteGasto} onGerarRecorrentes={gerarGastosRecorrentes}/>}
            {role==='empresa' && page==='fin-chamados' && <PageFinChamados tickets={tickets} equipe={equipe} onOpenModal={setModalTicketId} onStatusChange={updateTicketStatus} onAssign={assignResponsavel}/>}
            {role==='empresa' && page==='fin-auditoria' && <PageAuditoria auditLog={auditLog}/>}
            {role==='empresa' && page==='clientes' && <PageDashboardClientes clientes={clientes} tickets={tickets} onPersonalizar={(id)=>{ setPersonalizacaoSelectedId(id); goPage('personalizacao'); }}/>}
            {role==='empresa' && page==='personalizacao' && <PagePersonalizacao clientes={clientes} onSave={savePersonalizacao} selectedId={personalizacaoSelectedId} setSelectedId={setPersonalizacaoSelectedId} clientName={clientName} showToast={showToast}/>}
            {role==='empresa' && page==='cli-acessos' && <PageCliAcessos contas={contas} setContas={setContas} showToast={showToast}/>}

            {role==='cliente' && page==='inicio' && <PageInicio tickets={tickets} clientName={clientName} branding={branding} clienteNotifs={clienteNotifs} onGoNova={()=>setPage('nova')} onAvaliar={avaliarChamado}/>}
            {role==='cliente' && page==='chamados' && <PageChamados tickets={tickets} clientName={clientName} onAvaliar={avaliarChamado}/>}
            {role==='cliente' && page==='nova' && <PageNova branding={branding} onSubmit={submitNovaSolicitacao}/>}
            {role==='cliente' && page==='perfil' && <PagePerfil clientName={clientName} branding={branding} contas={contas}/>}
          </div>
        </main>
      </div>
      <TicketModal ticket={modalTicket} equipe={equipe} onClose={()=>setModalTicketId(null)} onSendInfo={sendInfo} onAssign={assignResponsavel}/>
      <Toast msg={toastMsg}/>
    </div>
  );
}
