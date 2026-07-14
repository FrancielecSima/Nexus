/* ============================================================
   SEED DATA (fictícia, usada apenas para demonstrar o funcionamento)
============================================================ */
const initialClientes = [
  { id:'cli-1', nome:'Ana Souza', empresa:'Souza Tecnologia', cnpj:'12.345.678/0001-90', email:'ana@souzatecnologia.com', endereco:'Rua das Flores, 123 — São Paulo/SP', servico:'Manutenção de Rede', valorMensal:600, periodicidade:'mensal', primary:'#FF6A2B', secondary:'#1E1F24', initial:'S' },
  { id:'cli-2', nome:'Bruno Lima', empresa:'Lima Sistemas', cnpj:'23.456.789/0001-01', email:'bruno@limasistemas.com', endereco:'Av. Paulista, 900 — São Paulo/SP', servico:'Instalação de Sistema', valorMensal:450, periodicidade:'mensal', primary:'#2E86DE', secondary:'#1E1F24', initial:'L' },
  { id:'cli-3', nome:'Carla Dias', empresa:'Dias Consultoria', cnpj:'34.567.890/0001-12', email:'carla@diasconsultoria.com', endereco:'Rua XV de Novembro, 45 — Curitiba/PR', servico:'Consultoria TI', valorMensal:2700, periodicidade:'trimestral', primary:'#27AE60', secondary:'#1E1F24', initial:'D' },
  { id:'cli-4', nome:'Diego Ramos', empresa:'Ramos Suporte', cnpj:'45.678.901/0001-23', email:'diego@ramossuporte.com', endereco:'Rua Sete de Setembro, 88 — Porto Alegre/RS', servico:'Suporte N2', valorMensal:4200, periodicidade:'anual', primary:'#9B59B6', secondary:'#1E1F24', initial:'R' },
];

const initialServicos = [
  { id:'srv-1', nome:'Manutenção de Rede', valor:600, comissaoPercent:20 },
  { id:'srv-2', nome:'Instalação de Sistema', valor:450, comissaoPercent:20 },
  { id:'srv-3', nome:'Consultoria TI', valor:900, comissaoPercent:20 },
  { id:'srv-4', nome:'Suporte N2', valor:350, comissaoPercent:20 },
  { id:'srv-5', nome:'Licença Pro', valor:1600, comissaoPercent:20 },
  { id:'srv-6', nome:'Auditoria de Segurança', valor:1200, comissaoPercent:20 },
];

const initialContas = [
  { id:'acc-1', nome:'Ana Souza', empresa:'Souza Tecnologia', email:'ana@souzatecnologia.com', senha:'123456', primeiroAcesso:true },
  { id:'acc-2', nome:'Bruno Lima', empresa:'Lima Sistemas', email:'bruno@limasistemas.com', senha:'123456', primeiroAcesso:false },
  { id:'acc-3', nome:'Carla Dias', empresa:'Dias Consultoria', email:'carla@diasconsultoria.com', senha:'123456', primeiroAcesso:false },
];

// Equipe interna — cada pessoa tem login próprio (substitui o "Carla Silva" fixo)
const initialEquipe = [
  { id:'eq-1', nome:'Carla Silva', cargo:'Suporte Técnico', avatar:'CS' },
  { id:'eq-2', nome:'Marcos Vieira', cargo:'Financeiro', avatar:'MV' },
  { id:'eq-3', nome:'Paula Nogueira', cargo:'Suporte Técnico', avatar:'PN' },
];

// Chamados com timestamps reais (para SLA calculado, não mais ilustrativo)
const initialTickets = [
  { id:'#1042', cliente:'Ana Souza', title:'Lentidão no sistema', status:'em_atendimento', priority:'Alta', categoria:'Suporte técnico', descricao:'O sistema está muito lento durante o horário comercial, principalmente ao gerar relatórios.', history:[], responsavelId:'eq-1', criadoEm:isoDateTime(0,-3,-40), primeiraRespostaEm:null, encerradoEm:null, avaliacao:null },
  { id:'#1039', cliente:'Ana Souza', title:'Erro ao emitir relatório', status:'aguardando_retorno', priority:'Média', categoria:'Financeiro', descricao:'O relatório mensal não está sendo gerado corretamente, aparece um erro 500.', history:[{ text:'Suporte solicitou o print do erro para análise.', time:'ontem, 17:40' }], responsavelId:'eq-2', criadoEm:isoDateTime(-1,-6,-55), primeiraRespostaEm:isoDateTime(-1,-6,-15), encerradoEm:null, avaliacao:null },
  { id:'#1035', cliente:'Ana Souza', title:'Solicitação de acesso', status:'em_atendimento', priority:'Baixa', categoria:'Solicitação de acesso', descricao:'Preciso de acesso ao sistema para um novo colaborador da equipe financeira.', history:[], responsavelId:'eq-1', criadoEm:isoDateTime(-22,0,0), primeiraRespostaEm:isoDateTime(-21,-22,0), encerradoEm:null, avaliacao:null },
  { id:'#1028', cliente:'Ana Souza', title:'Configuração de e-mail', status:'encerrado', priority:'—', categoria:'Suporte técnico', descricao:'Configuração de e-mail corporativo no novo notebook.', history:[], responsavelId:'eq-3', criadoEm:isoDateTime(-26,-1,0), primeiraRespostaEm:isoDateTime(-26,-3,0), encerradoEm:isoDateTime(-25,-20,0), avaliacao:5 },
  { id:'#1022', cliente:'Ana Souza', title:'Troca de licença', status:'encerrado', priority:'—', categoria:'Financeiro', descricao:'Troca do plano de licença para o plano Premium.', history:[], responsavelId:'eq-2', criadoEm:isoDateTime(-34,-2,0), primeiraRespostaEm:isoDateTime(-34,-4,0), encerradoEm:isoDateTime(-33,-1,0), avaliacao:4 },
  { id:'#1015', cliente:'Ana Souza', title:'Atualização de sistema', status:'encerrado', priority:'—', categoria:'Suporte técnico', descricao:'Atualização da versão do sistema para a mais recente.', history:[], responsavelId:'eq-1', criadoEm:isoDateTime(-42,-1,0), primeiraRespostaEm:isoDateTime(-42,-2,30), encerradoEm:isoDateTime(-41,-5,0), avaliacao:null },
  { id:'#1051', cliente:'Bruno Lima', title:'Erro ao instalar sistema', status:'em_atendimento', priority:'Alta', categoria:'Suporte técnico', descricao:'A instalação trava em 60% e não avança.', history:[], responsavelId:'eq-3', criadoEm:isoDateTime(0,-4,-10), primeiraRespostaEm:null, encerradoEm:null, avaliacao:null },
  { id:'#1048', cliente:'Carla Dias', title:'Dúvida sobre orçamento', status:'aguardando_retorno', priority:'Baixa', categoria:'Financeiro', descricao:'Gostaria de entender melhor os valores detalhados da proposta enviada.', history:[], responsavelId:'eq-2', criadoEm:isoDateTime(-1,-9,0), primeiraRespostaEm:isoDateTime(-1,-2,0), encerradoEm:null, avaliacao:null },
];

// Caixa com status de pagamento real + lançamentos retroativos (últimos ~14 meses,
// já dá pra montar comparativo de ano inteiro no gráfico)
const initialCaixa = [
  // mês atual / próximo — o que ainda está em aberto
  { id:'cx-1', cliente:'Ana Souza', valor:600, vencimento:isoDate(6), status:'pendente', dataPagamento:null, anexos:{ boleto:'boleto-ana-07.pdf', nota:'nf-5521.pdf' } },
  { id:'cx-2', cliente:'Bruno Lima', valor:450, vencimento:isoDate(38), status:'pendente', dataPagamento:null, anexos:{ boleto:'boleto-bruno-08.pdf', nota:'nf-5522.pdf' } },
  { id:'cx-3', cliente:'Carla Dias', valor:2700, vencimento:isoDate(16), status:'pendente', dataPagamento:null, anexos:{ boleto:'boleto-carla-07.pdf', nota:'nf-5523.pdf' } },
  { id:'cx-4', cliente:'Diego Ramos', valor:4200, vencimento:isoDate(-5), status:'pendente', dataPagamento:null, anexos:{ boleto:'boleto-diego-06.pdf', nota:'nf-5524.pdf' } },
  // histórico dos últimos meses — já pagos (alimenta o comparativo por ano)
  ...gerarHistoricoCaixaDemo(),
];

const initialOrcamentos = [
  { id:'orc-1', cliente:'Ana Souza', item:'Licença Pro', valor:1600, comissao:320, status:'Aprovado' },
  { id:'orc-2', cliente:'Bruno Lima', item:'Suporte+', valor:900, comissao:180, status:'Em análise' },
  { id:'orc-3', cliente:'Carla Dias', item:'Upgrade de Infraestrutura', valor:2050, comissao:410, status:'Em execução' },
  { id:'orc-4', cliente:'Diego Ramos', item:'Consultoria Mensal', valor:1300, comissao:260, status:'Concluído' },
];

const initialGastos = [
  { id:'gs-1', desc:'Aluguel do escritório', valor:6200, vencimento:isoDate(3), categoria:'Fixo', recorrente:true },
  { id:'gs-2', desc:'Ferramentas e licenças internas', valor:1450, vencimento:isoDate(9), categoria:'Fixo', recorrente:true },
  { id:'gs-3', desc:'Folha de pagamento', valor:9800, vencimento:isoDate(-2), categoria:'Fixo', recorrente:true },
  { id:'gs-4', desc:'Marketing e anúncios', valor:980, vencimento:isoDate(35), categoria:'Variável', recorrente:false },
];

const initialTerceirizados = [
  { id:'tc-1', parceiro:'TechFix', servico:'Rede', custo:540 },
  { id:'tc-2', parceiro:'InfraPlus', servico:'Servidor', custo:890 },
  { id:'tc-3', parceiro:'NetSec', servico:'Segurança', custo:610 },
  { id:'tc-4', parceiro:'CloudBr', servico:'Backup', custo:320 },
];

const initialEmpresaNotifs = [
  { id:uid('en'), text:'Novo chamado aberto por Ana Souza — "Lentidão no sistema"', time:'há 10 min', lido:false },
  { id:uid('en'), text:'Chamado #1039 aguardando resposta há mais de 24h', time:'há 2h', lido:false },
  { id:uid('en'), text:'Bruno Lima enviou uma nova solicitação de suporte', time:'há 5h', lido:false },
  { id:uid('en'), text:'Meta mensal de recebimentos atingida', time:'ontem', lido:true },
];
const initialClienteNotifs = [
  { id:uid('cn'), text:'Seu chamado #1042 foi respondido pelo suporte', time:'há 10 min', lido:false },
  { id:uid('cn'), text:'Chamado #1035 mudou de status para "Em atendimento"', time:'há 1 dia', lido:true },
];

const initialAuditLog = [];
