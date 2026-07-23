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
  const [servicos,setServicos] = useState([]);
  const [clienteEmail,setClienteEmail] = useState('');
  const [equipe,setEquipe] = useState([]);
  const [currentStaffId,setCurrentStaffId] = useState(null);
  const [currentClienteId,setCurrentClienteId] = useState(null);
  const [tickets,setTickets] = useState([]);
  const [caixa,setCaixa] = useState([]);
  const [orcamentos,setOrcamentos] = useState([]);
  const [gastos,setGastos] = useState([]);
  const [terceirizados,setTerceirizados] = useState([]);
  const [notifs,setNotifs] = useState([]);
  const [auditLog,setAuditLog] = useState([]);

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
        setCurrentClienteId(cliente.id);
        setClienteEmail(cliente.email);
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
    if(error){ return { error: traduzErroSenha(error.message) }; }
    const { error: profileUpdateErr } = await supabaseClient.from('profiles').update({ must_change_password: false }).eq('id', pendingAccount.id);
    if(profileUpdateErr){ return { error: 'Senha alterada, mas houve um erro ao liberar o acesso: ' + profileUpdateErr.message }; }
    const { data } = await supabaseClient.auth.getSession();
    setPendingAccount(null);
    await handleAuthChange(data.session);
    showToast('Senha definida com sucesso!');
    return {};
  }

  async function logout(){
    await supabaseClient.auth.signOut();
    setLoggedIn(false);
    setAuthUser(null);
    setNotifOpen(false);
  }

  // ---------- Clientes / Equipe / Chamados (dados reais do Supabase) ----------
  useEffect(()=>{
    if(!loggedIn || role!=='empresa') return;
    loadClientes();
    loadTickets();
    loadCaixa();
    loadServicos();
    loadOrcamentos();
    loadGastos();
    loadTerceirizados();
    loadEquipe().then(eq=>loadAuditLog(eq));
  }, [loggedIn, role]);

  useEffect(()=>{
    if(!loggedIn || !authUser) return;
    loadNotifs();
  }, [loggedIn, authUser && authUser.id]);

  useEffect(()=>{
    if(!loggedIn || role!=='cliente' || !currentClienteId) return;
    loadTickets();
  }, [loggedIn, role, currentClienteId]);

  // ---------- Tempo real (Supabase Realtime) ----------
  // Assim que algo muda no banco (novo chamado, resposta, notificação, pagamento),
  // o app atualiza sozinho — sem precisar recarregar a página.
  useEffect(()=>{
    if(!loggedIn || !authUser) return;
    const channel = supabaseClient
      .channel('nexus-realtime-' + authUser.id)
      .on('postgres_changes', { event:'*', schema:'public', table:'tickets' }, ()=>{ loadTickets(); })
      .on('postgres_changes', { event:'*', schema:'public', table:'ticket_historico' }, ()=>{ loadTickets(); })
      .on('postgres_changes', { event:'*', schema:'public', table:'notificacoes', filter:`user_id=eq.${authUser.id}` }, ()=>{ loadNotifs(); })
      .on('postgres_changes', { event:'*', schema:'public', table:'caixa_lancamentos' }, ()=>{ if(role==='empresa') loadCaixa(); })
      .subscribe();
    return ()=>{ supabaseClient.removeChannel(channel); };
  }, [loggedIn, authUser && authUser.id, role]);

  async function loadClientes(){
    const { data, error } = await supabaseClient.from('clientes').select('*').order('created_at', {ascending:true});
    if(error){ showToast('Erro ao carregar clientes: ' + error.message); return; }
    const lista = data.map(clienteFromRow);
    setClientes(lista);
    if(lista.length>0 && !personalizacaoSelectedId) setPersonalizacaoSelectedId(lista[0].id);
  }

  async function loadEquipe(){
    const { data, error } = await supabaseClient.from('equipe').select('*').eq('ativo', true).order('nome');
    if(error){ showToast('Erro ao carregar equipe: ' + error.message); return []; }
    const lista = data.map(r=>({
      id: r.id, nome: r.nome, cargo: r.cargo,
      avatar: r.nome.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()
    }));
    setEquipe(lista);
    return lista;
  }

  async function loadTickets(){
    const { data, error } = await supabaseClient
      .from('tickets')
      .select('*, clientes(nome), ticket_historico(id, texto, created_at)')
      .order('criado_em', {ascending:false});
    if(error){ showToast('Erro ao carregar chamados: ' + error.message); return; }
    setTickets(data.map(ticketFromRow));
  }

  async function loadCaixa(){
    const { data, error } = await supabaseClient
      .from('caixa_lancamentos')
      .select('*, clientes(nome)')
      .order('vencimento', {ascending:false});
    if(error){ showToast('Erro ao carregar caixa: ' + error.message); return; }
    setCaixa(data.map(caixaFromRow));
  }

  async function loadServicos(){
    const { data, error } = await supabaseClient.from('servicos').select('*').order('nome');
    if(error){ showToast('Erro ao carregar serviços: ' + error.message); return; }
    setServicos(data.map(servicoFromRow));
  }

  async function loadOrcamentos(){
    const { data, error } = await supabaseClient
      .from('orcamentos')
      .select('*, clientes(nome)')
      .order('created_at', {ascending:false});
    if(error){ showToast('Erro ao carregar orçamentos: ' + error.message); return; }
    setOrcamentos(data.map(orcamentoFromRow));
  }

  async function loadGastos(){
    const { data, error } = await supabaseClient.from('gastos').select('*').order('vencimento', {ascending:false});
    if(error){ showToast('Erro ao carregar gastos: ' + error.message); return; }
    setGastos(data.map(gastoFromRow));
  }

  async function loadTerceirizados(){
    const { data, error } = await supabaseClient.from('terceirizados').select('*').order('parceiro');
    if(error){ showToast('Erro ao carregar terceirizados: ' + error.message); return; }
    setTerceirizados(data.map(terceirizadoFromRow));
  }

  async function loadAuditLog(equipeList){
    const lista = equipeList || equipe;
    const equipeById = {};
    lista.forEach(e=>{ equipeById[e.id] = e; });
    const { data, error } = await supabaseClient.from('audit_log').select('*').order('criado_em', {ascending:false}).limit(500);
    if(error){ showToast('Erro ao carregar auditoria: ' + error.message); return; }
    setAuditLog(data.map(r=>auditFromRow(r, equipeById)));
  }

  async function loadNotifs(){
    const { data, error } = await supabaseClient.from('notificacoes').select('*').eq('user_id', authUser.id).order('created_at', {ascending:false}).limit(50);
    if(error){ showToast('Erro ao carregar notificações: ' + error.message); return; }
    setNotifs(data.map(notificacaoFromRow));
  }

  // ---------- (bloco de persistência local removido — não há mais dados fictícios
  // sobrando no navegador; tudo relevante já vem do Supabase) ----------

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
  async function logAudit(acao, detalhe){
    if(!authUser) return;
    const { error } = await supabaseClient.from('audit_log').insert({ usuario_id: authUser.id, acao, detalhe });
    if(!error) loadAuditLog();
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

  async function handleBellClick(){
    const opening = !notifOpen;
    setNotifOpen(opening);
    if(opening && authUser){
      const temNaoLida = notifs.some(n=>!n.lido);
      if(temNaoLida){
        setNotifs(prev=>prev.map(n=>({...n,lido:true})));
        await supabaseClient.from('notificacoes').update({ lida:true }).eq('user_id', authUser.id).eq('lida', false);
      }
    }
  }

  async function notifyCliente(clienteAuthUserId, text){
    if(!clienteAuthUserId) return;
    await supabaseClient.from('notificacoes').insert({ user_id: clienteAuthUserId, texto: text });
  }
  async function notifyEmpresa(text){
    await supabaseClient.rpc('notify_empresa', { texto: text });
  }

  // ---------- Chamados ----------
  async function updateTicketStatus(id, status){
    const t = tickets.find(x=>x.id===id);
    if(!t) return;
    const patch = { status };
    if(!t.primeiraRespostaEm) patch.primeira_resposta_em = new Date().toISOString();
    if(status==='encerrado' && !t.encerradoEm) patch.encerrado_em = new Date().toISOString();
    if(status!=='encerrado') patch.encerrado_em = null;
    const { error } = await supabaseClient.from('tickets').update(patch).eq('id', id);
    if(error){ showToast('Erro ao atualizar status: ' + error.message); return; }
    await loadTickets();
    const cli = clientes.find(c=>c.id===t.clienteId);
    notifyCliente(cli?.authUserId, `Atualização no chamado #${t.numero}: status alterado para "${STATUS_LABELS[status]}"`);
    logAudit('Alterou status de chamado', `#${t.numero} → ${STATUS_LABELS[status]}`);
    showToast('Status do chamado #' + t.numero + ' atualizado');
  }
  async function sendInfo(id, msg){
    const t = tickets.find(x=>x.id===id);
    if(!t) return;
    const { error: histErr } = await supabaseClient.from('ticket_historico').insert({ ticket_id: id, texto: `Equipe solicitou: "${msg}"` });
    if(histErr){ showToast('Erro ao enviar solicitação: ' + histErr.message); return; }
    const patch = { status:'aguardando_retorno' };
    if(!t.primeiraRespostaEm) patch.primeira_resposta_em = new Date().toISOString();
    const { error } = await supabaseClient.from('tickets').update(patch).eq('id', id);
    if(error){ showToast('Erro ao atualizar chamado: ' + error.message); return; }
    await loadTickets();
    const cli = clientes.find(c=>c.id===t.clienteId);
    notifyCliente(cli?.authUserId, `O suporte pediu mais informações no chamado #${t.numero}`);
    showToast('Solicitação enviada ao cliente');
    setModalTicketId(null);
  }
  async function addNotaInterna(id, texto){
    const { error } = await supabaseClient.from('ticket_historico').insert({ ticket_id: id, texto, interno: true });
    if(error){ showToast('Erro ao salvar nota interna: ' + error.message); return; }
    await loadTickets();
    showToast('Nota interna adicionada.');
  }
  async function assignResponsavel(id, responsavelId){
    const { error } = await supabaseClient.from('tickets').update({ responsavel_id: responsavelId || null }).eq('id', id);
    if(error){ showToast('Erro ao atribuir responsável: ' + error.message); return; }
    await loadTickets();
    const nome = equipe.find(e=>e.id===responsavelId);
    showToast('Chamado atribuído a ' + (nome?nome.nome:'—'));
  }
  async function submitNovaSolicitacao(data){
    if(!currentClienteId){ showToast('Não foi possível identificar seu cadastro de cliente.'); return false; }
    const payload = {
      cliente_id: currentClienteId,
      titulo: data.assunto,
      status: 'em_atendimento',
      prioridade: data.prioridade,
      categoria: data.categoria,
      descricao: data.descricao,
    };
    const { error } = await supabaseClient.from('tickets').insert(payload);
    if(error){ showToast('Erro ao enviar solicitação: ' + error.message); return false; }
    await loadTickets();
    notifyEmpresa(`Novo chamado aberto por ${clientName} — "${data.assunto}"`);
    showToast('Solicitação enviada com sucesso!');
    setPage('chamados');
    return true;
  }
  async function avaliarChamado(id, nota){
    const t = tickets.find(x=>x.id===id);
    const { error } = await supabaseClient.from('tickets').update({ avaliacao: nota }).eq('id', id);
    if(error){ showToast('Erro ao enviar avaliação: ' + error.message); return; }
    await loadTickets();
    notifyEmpresa(`${clientName} avaliou o chamado #${t?t.numero:''} com nota ${nota}`);
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

  // ---------- Acessos de Clientes (via Edge Function — precisa da service_role no servidor) ----------
  async function criarAcessoCliente(clienteId, nome, email, senha){
    const { data, error } = await supabaseClient.functions.invoke('manage-cliente-access', {
      body: { action:'create', clienteId, nome, email, senha }
    });
    if(error || (data && data.error)){ showToast('Erro ao criar acesso: ' + (data?.error || error.message)); return; }
    await loadClientes();
    logAudit('Criou acesso de cliente', `${nome} — ${email}`);
    showToast('Acesso criado! O cliente vai definir uma nova senha no primeiro login.');
  }
  async function resetarSenhaCliente(authUserId, nome, senha){
    const { data, error } = await supabaseClient.functions.invoke('manage-cliente-access', {
      body: { action:'reset_password', authUserId, senha }
    });
    if(error || (data && data.error)){ showToast('Erro ao redefinir senha: ' + (data?.error || error.message)); return; }
    logAudit('Redefiniu senha de cliente', nome);
    showToast('Senha redefinida! O cliente vai definir uma nova senha no próximo login.');
  }
  async function revogarAcessoCliente(authUserId, clienteId, nome){
    if(!window.confirm('Remover o acesso deste cliente? Ele não vai mais conseguir fazer login.')) return;
    const { data, error } = await supabaseClient.functions.invoke('manage-cliente-access', {
      body: { action:'revoke', authUserId, clienteId }
    });
    if(error || (data && data.error)){ showToast('Erro ao remover acesso: ' + (data?.error || error.message)); return; }
    await loadClientes();
    logAudit('Removeu acesso de cliente', nome);
    showToast('Acesso removido.');
  }

  // ---------- Caixa ----------
  async function uploadAnexoCaixa(caixaId, tipo, file){
    const path = `caixa/${caixaId}/${tipo}-${Date.now()}-${file.name}`;
    const { error } = await supabaseClient.storage.from('anexos').upload(path, file, { upsert:true });
    if(error){ showToast(`Erro ao enviar ${tipo}: ` + error.message); return null; }
    return path;
  }
  async function baixarAnexoCaixa(path){
    if(!path) return;
    const { data, error } = await supabaseClient.storage.from('anexos').createSignedUrl(path, 60);
    if(error){ showToast('Erro ao abrir anexo: ' + error.message); return; }
    window.open(data.signedUrl, '_blank');
  }
  async function saveCaixa(data, editingId){
    const cli = clientes.find(c=>c.id===data.clienteId);
    if(!cli){ showToast('Cliente não encontrado.'); return; }
    const { boletoFile, notaFile, anexosAtuais, ...campos } = data;
    if(editingId){
      const anexos = { boleto: anexosAtuais?.boleto || null, nota: anexosAtuais?.nota || null };
      if(boletoFile){ const p = await uploadAnexoCaixa(editingId, 'boleto', boletoFile); if(p) anexos.boleto = p; }
      if(notaFile){ const p = await uploadAnexoCaixa(editingId, 'nota', notaFile); if(p) anexos.nota = p; }
      const { error } = await supabaseClient.from('caixa_lancamentos').update(caixaToRow({ ...campos, anexos })).eq('id', editingId);
      if(error){ showToast('Erro ao salvar lançamento: ' + error.message); return; }
      await loadCaixa();
      logAudit('Editou lançamento de caixa', `${cli.nome} — ${fmtBRL(campos.valor)} (venc. ${campos.vencimento})`);
      showToast('Lançamento atualizado com sucesso!');
    } else {
      const { data: row, error } = await supabaseClient.from('caixa_lancamentos').insert(caixaToRow({ ...campos, anexos:{boleto:null,nota:null} })).select().single();
      if(error){ showToast('Erro ao adicionar lançamento: ' + error.message); return; }
      const anexos = { boleto:null, nota:null };
      if(boletoFile){ const p = await uploadAnexoCaixa(row.id, 'boleto', boletoFile); if(p) anexos.boleto = p; }
      if(notaFile){ const p = await uploadAnexoCaixa(row.id, 'nota', notaFile); if(p) anexos.nota = p; }
      if(anexos.boleto || anexos.nota){
        await supabaseClient.from('caixa_lancamentos').update(caixaToRow({ anexos })).eq('id', row.id);
      }
      await loadCaixa();
      const ref = mesReferencia(campos.vencimento);
      logAudit('Criou lançamento de caixa', `${cli.nome} — ${fmtBRL(campos.valor)} (venc. ${campos.vencimento})`);
      showToast('Lançamento adicionado — somado ao total de "' + ref.label + '"');
    }
  }
  async function deleteCaixa(id){
    if(!window.confirm('Excluir este lançamento?')) return;
    const e = caixa.find(x=>x.id===id);
    const { error } = await supabaseClient.from('caixa_lancamentos').delete().eq('id', id);
    if(error){ showToast('Erro ao excluir lançamento: ' + error.message); return; }
    setCaixa(prev=>prev.filter(x=>x.id!==id));
    logAudit('Excluiu lançamento de caixa', e ? `${e.cliente} — ${fmtBRL(e.valor)}` : id);
    showToast('Lançamento excluído.');
  }
  async function marcarPago(id, dataPagamento){
    const dataFinal = dataPagamento || new Date().toISOString().slice(0,10);
    const { error } = await supabaseClient.from('caixa_lancamentos').update({ status:'pago', data_pagamento: dataFinal }).eq('id', id);
    if(error){ showToast('Erro ao marcar como pago: ' + error.message); return; }
    await loadCaixa();
    const e = caixa.find(x=>x.id===id);
    logAudit('Marcou lançamento como pago', e ? `${e.cliente} — ${fmtBRL(e.valor)}` : id);
    showToast('Lançamento marcado como pago!');
  }
  // Gera lançamentos futuros com base na periodicidade de cada cliente (mensal/
  // trimestral/anual), evitando duplicar um mesmo período. Cobre os próximos 12 meses.
  async function gerarCobrancasFuturas(){
    const hoje = new Date();
    const novos = [];
    clientes.forEach(c=>{
      const passo = PERIODICIDADE_MESES[c.periodicidade] || 1;
      for(let i=0; i<12; i+=passo){
        const d = new Date(hoje.getFullYear(), hoje.getMonth()+i, Math.min(10,28));
        const venc = d.toISOString().slice(0,10);
        const jaExiste = caixa.some(e=>e.clienteId===c.id && e.vencimento.slice(0,7)===venc.slice(0,7));
        if(!jaExiste){
          novos.push({ cliente_id:c.id, valor:c.valorMensal, vencimento:venc, status:'pendente', data_pagamento:null });
        }
      }
    });
    if(novos.length===0){ showToast('Nenhuma cobrança nova — já estava tudo gerado.'); return; }
    const { error } = await supabaseClient.from('caixa_lancamentos').insert(novos);
    if(error){ showToast('Erro ao gerar cobranças: ' + error.message); return; }
    await loadCaixa();
    logAudit('Gerou cobranças futuras', `${novos.length} lançamento(s) criado(s) para os próximos 12 meses`);
    showToast(`${novos.length} cobrança(s) futura(s) gerada(s)!`);
  }

  // ---------- Orçamentos ----------
  async function addOrcamento(data){
    const cli = clientes.find(c=>c.id===data.clienteId);
    if(!cli){ showToast('Cliente não encontrado.'); return; }
    const srv = servicos.find(s=>s.nome===data.item);
    const payload = orcamentoToRow({ clienteId: cli.id, servicoId: srv?srv.id:null, item:data.item, valor:data.valor, comissao:data.comissao, status:'Em análise' });
    const { error } = await supabaseClient.from('orcamentos').insert(payload);
    if(error){ showToast('Erro ao cadastrar orçamento: ' + error.message); return; }
    await loadOrcamentos();
    showToast('Orçamento cadastrado!');
  }
  async function updateOrcamentoStatus(id, status){
    const { error } = await supabaseClient.from('orcamentos').update({ status }).eq('id', id);
    if(error){ showToast('Erro ao atualizar orçamento: ' + error.message); return; }
    setOrcamentos(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    showToast('Andamento atualizado para "' + status + '"');
  }

  // ---------- Gastos ----------
  async function saveGasto(data, editingId){
    if(editingId){
      const { error } = await supabaseClient.from('gastos').update(gastoToRow(data)).eq('id', editingId);
      if(error){ showToast('Erro ao salvar gasto: ' + error.message); return; }
      await loadGastos();
      logAudit('Editou gasto', data.desc);
      showToast('Gasto atualizado!');
    } else {
      const { error } = await supabaseClient.from('gastos').insert(gastoToRow(data));
      if(error){ showToast('Erro ao cadastrar gasto: ' + error.message); return; }
      await loadGastos();
      logAudit('Cadastrou gasto', data.desc);
      showToast('Gasto cadastrado!');
    }
  }
  async function deleteGasto(id){
    if(!window.confirm('Excluir este gasto?')) return;
    const g = gastos.find(x=>x.id===id);
    const { error } = await supabaseClient.from('gastos').delete().eq('id', id);
    if(error){ showToast('Erro ao excluir gasto: ' + error.message); return; }
    setGastos(prev=>prev.filter(x=>x.id!==id));
    logAudit('Excluiu gasto', g?g.desc:id);
    showToast('Gasto excluído.');
  }
  async function gerarGastosRecorrentes(){
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0,7);
    const fixos = gastos.filter(g=>g.recorrente);
    const novos = [];
    fixos.forEach(g=>{
      const jaExiste = gastos.some(x=>x.desc===g.desc && x.vencimento.slice(0,7)===mesAtual);
      if(!jaExiste){
        const d = new Date(hoje.getFullYear(), hoje.getMonth(), new Date(g.vencimento+'T00:00:00').getDate());
        novos.push(gastoToRow({ desc:g.desc, valor:g.valor, vencimento:d.toISOString().slice(0,10), categoria:g.categoria, recorrente:true }));
      }
    });
    if(novos.length===0){ showToast('Gastos fixos deste mês já estavam gerados.'); return; }
    const { error } = await supabaseClient.from('gastos').insert(novos);
    if(error){ showToast('Erro ao gerar gastos recorrentes: ' + error.message); return; }
    await loadGastos();
    logAudit('Gerou gastos recorrentes do mês', `${novos.length} gasto(s) criado(s)`);
    showToast(`${novos.length} gasto(s) fixo(s) gerado(s) para este mês!`);
  }

  // ---------- Serviços ----------
  async function saveServico(data, editingId){
    if(editingId){
      const { error } = await supabaseClient.from('servicos').update(servicoToRow(data)).eq('id', editingId);
      if(error){ showToast('Erro ao salvar serviço: ' + error.message); return; }
      await loadServicos();
      showToast('Serviço atualizado com sucesso!');
    } else {
      const { error } = await supabaseClient.from('servicos').insert(servicoToRow(data));
      if(error){ showToast('Erro ao cadastrar serviço: ' + error.message); return; }
      await loadServicos();
      showToast('Serviço cadastrado com sucesso!');
    }
  }
  async function deleteServico(id){
    if(!window.confirm('Excluir este serviço?')) return;
    const { error } = await supabaseClient.from('servicos').delete().eq('id', id);
    if(error){ showToast('Erro ao excluir serviço: ' + error.message); return; }
    setServicos(prev=>prev.filter(x=>x.id!==id));
    showToast('Serviço excluído.');
  }

  // ---------- Terceirizados ----------
  async function saveTerceirizado(data){
    const { error } = await supabaseClient.from('terceirizados').insert(terceirizadoToRow(data));
    if(error){ showToast('Erro ao cadastrar terceirizado: ' + error.message); return; }
    await loadTerceirizados();
    logAudit('Cadastrou terceirizado', `${data.parceiro} — ${data.servico}`);
    showToast('Terceirizado cadastrado!');
  }
  async function deleteTerceirizado(id){
    if(!window.confirm('Excluir este terceirizado?')) return;
    const t = terceirizados.find(x=>x.id===id);
    const { error } = await supabaseClient.from('terceirizados').delete().eq('id', id);
    if(error){ showToast('Erro ao excluir terceirizado: ' + error.message); return; }
    setTerceirizados(prev=>prev.filter(x=>x.id!==id));
    logAudit('Excluiu terceirizado', t?t.parceiro:id);
    showToast('Terceirizado excluído.');
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
  const avatarInitials = role==='empresa' ? (equipe.find(e=>e.id===currentStaffId)||{}).avatar || 'EQ' : branding.initial;
  const modalTicket = modalTicketId ? tickets.find(t=>t.id===modalTicketId) : null;

  return (
    <div id="app" style={{display:'block'}}>
      <div className="shell">
        <Sidebar role={role} page={page} expandedGroups={expandedGroups} toggleGroup={toggleGroup} goPage={goPage} branding={branding} clientName={clientName} onLogout={logout} staffName={currentStaffName()} staffCargo={(equipe.find(e=>e.id===currentStaffId)||{}).cargo}/>
        <main className="main">
          <Topbar title={meta.title} sub={meta.sub} notifs={notifs} notifOpen={notifOpen} onBellClick={handleBellClick} role={role} branding={branding} avatarInitials={avatarInitials}/>
          <div id="page-content">
            {role==='empresa' && page==='financeiro' && <PageFinanceiro tickets={tickets} caixa={caixa} orcamentos={orcamentos} gastos={gastos} terceirizados={terceirizados} onSaveTerceirizado={saveTerceirizado} onDeleteTerceirizado={deleteTerceirizado} clientes={clientes} equipe={equipe}/>}
            {role==='empresa' && page==='fin-clientes' && <PageFinClientes clientes={clientes} onSave={saveClient} onDelete={deleteClient}/>}
            {role==='empresa' && page==='fin-caixa' && <PageFinCaixa caixa={caixa} clientes={clientes} onSave={saveCaixa} onDelete={deleteCaixa} onMarcarPago={marcarPago} onGerarCobrancas={gerarCobrancasFuturas} onDownloadAnexo={baixarAnexoCaixa}/>}
            {role==='empresa' && page==='fin-orcamentos' && <PageFinOrcamentos orcamentos={orcamentos} clientes={clientes} servicos={servicos} onAdd={addOrcamento} onStatusChange={updateOrcamentoStatus} goPage={goPage}/>}
            {role==='empresa' && page==='fin-servicos' && <PageFinServicos servicos={servicos} onSave={saveServico} onDelete={deleteServico} showToast={showToast}/>}
            {role==='empresa' && page==='fin-gastos' && <PageGastos gastos={gastos} onSave={saveGasto} onDelete={deleteGasto} onGerarRecorrentes={gerarGastosRecorrentes}/>}
            {role==='empresa' && page==='fin-chamados' && <PageFinChamados tickets={tickets} equipe={equipe} onOpenModal={setModalTicketId} onStatusChange={updateTicketStatus} onAssign={assignResponsavel}/>}
            {role==='empresa' && page==='fin-auditoria' && <PageAuditoria auditLog={auditLog}/>}
            {role==='empresa' && page==='clientes' && <PageDashboardClientes clientes={clientes} tickets={tickets} onPersonalizar={(id)=>{ setPersonalizacaoSelectedId(id); goPage('personalizacao'); }}/>}
            {role==='empresa' && page==='personalizacao' && <PagePersonalizacao clientes={clientes} onSave={savePersonalizacao} selectedId={personalizacaoSelectedId} setSelectedId={setPersonalizacaoSelectedId} clientName={clientName} showToast={showToast}/>}
            {role==='empresa' && page==='cli-acessos' && <PageCliAcessos clientes={clientes} onCreate={criarAcessoCliente} onReset={resetarSenhaCliente} onRevoke={revogarAcessoCliente}/>}

            {role==='cliente' && page==='inicio' && <PageInicio tickets={tickets} clientName={clientName} branding={branding} clienteNotifs={notifs} onGoNova={()=>setPage('nova')} onAvaliar={avaliarChamado}/>}
            {role==='cliente' && page==='chamados' && <PageChamados tickets={tickets} clientName={clientName} onAvaliar={avaliarChamado}/>}
            {role==='cliente' && page==='nova' && <PageNova branding={branding} onSubmit={submitNovaSolicitacao}/>}
            {role==='cliente' && page==='perfil' && <PagePerfil clientName={clientName} branding={branding} clienteEmail={clienteEmail}/>}
          </div>
        </main>
      </div>
      <TicketModal ticket={modalTicket} equipe={equipe} onClose={()=>setModalTicketId(null)} onSendInfo={sendInfo} onAssign={assignResponsavel} onAddNotaInterna={addNotaInterna}/>
      <Toast msg={toastMsg}/>
    </div>
  );
}
