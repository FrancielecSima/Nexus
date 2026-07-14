/* ============================================================
   PAGE_META — título e subtítulo exibidos no topo de cada página
============================================================ */
function PAGE_META(clientName){
  return {
    financeiro: { title:'Painel Financeiro & Suporte', sub:'Visão geral financeira e de atendimento · uso interno' },
    'fin-clientes': { title:'Clientes', sub:'Cadastro de clientes — dados cadastrais, serviço, valor e periodicidade' },
    'fin-caixa': { title:'Caixa', sub:'Boletos e notas fiscais — status de pagamento e cobranças recorrentes' },
    'fin-orcamentos': { title:'Orçamentos', sub:'Orçamentos e andamento das propostas' },
    'fin-servicos': { title:'Serviços', sub:'Cadastro de serviços oferecidos — usados nos orçamentos' },
    'fin-gastos': { title:'Gastos', sub:'Gastos fixos e variáveis da operação' },
    'fin-chamados': { title:'Chamados', sub:'Chamados solicitados pelos clientes — atendimento e status' },
    'fin-auditoria': { title:'Auditoria', sub:'Histórico de alterações feitas pela equipe no sistema' },
    clientes: { title:'Dashboard de Clientes', sub:'Serviços prestados e suporte técnico · uso interno' },
    personalizacao: { title:'Personalização do Dashboard', sub:'Configure a identidade visual do portal de cada cliente' },
    'cli-acessos': { title:'Acessos de Clientes', sub:'Crie e edite o acesso do cliente ao portal' },
    inicio: { title:'Olá, ' + clientName.split(' ')[0], sub:'Acompanhe seus chamados e solicite suporte' },
    chamados: { title:'Meus Chamados', sub:'Tudo o que está em aberto e o que já foi encerrado' },
    nova: { title:'Nova Solicitação', sub:'Conte pra gente o que você precisa' },
    perfil: { title:'Meu Perfil', sub:'Suas informações de acesso' },
  };
}
