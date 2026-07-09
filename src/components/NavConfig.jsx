/* ============================================================
   NAV_EMPRESA / NAV_CLIENTE — estrutura de navegação da sidebar
   Depende de: ícones (components/Icons.jsx)
============================================================ */
const NAV_EMPRESA = [
  { id:'financeiro', label:'Painel Financeiro', icon:IconWallet, submenu:[
      { id:'fin-clientes', label:'Clientes' },
      { id:'fin-caixa', label:'Caixa' },
      { id:'fin-orcamentos', label:'Orçamentos' },
      { id:'fin-servicos', label:'Serviços' },
      { id:'fin-chamados', label:'Chamados' },
    ] },
  { id:'clientes', label:'Dashboard Clientes', icon:IconGrid, submenu:[
      { id:'personalizacao', label:'Personalização' },
      { id:'cli-acessos', label:'Acessos de Clientes' },
    ] },
];
const NAV_CLIENTE = [
  { id:'inicio', label:'Início', icon:IconHome },
  { id:'chamados', label:'Meus Chamados', icon:IconTicket },
  { id:'nova', label:'Nova Solicitação', icon:IconPlus },
  { id:'perfil', label:'Perfil', icon:IconUser },
];
