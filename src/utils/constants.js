/* ============================================================
   CONSTANTES — paleta de cores, status e estágios de orçamento
============================================================ */
const PALETTE = ['#FF6A2B','#F03C96','#2E86DE','#27AE60','#9B59B6','#1E1F24'];
const STATUS_LABELS = { em_atendimento:'Em atendimento', aguardando_retorno:'Aguardando retorno', encerrado:'Encerrado' };
const STATUS_BADGE  = { em_atendimento:'b-laranja', aguardando_retorno:'b-rosa', encerrado:'b-green' };
const ORC_STAGES = { 'Em análise':25, 'Aprovado':50, 'Em execução':75, 'Concluído':100, 'Reprovado':100 };
const ORC_COLOR  = { 'Em análise':'var(--carvao-3)', 'Aprovado':'var(--laranja)', 'Em execução':'var(--rosa)', 'Concluído':'var(--green)', 'Reprovado':'#C0392B' };

const STATUS_PAGAMENTO_LABELS = { pendente:'Pendente', pago:'Pago', atrasado:'Atrasado', cancelado:'Cancelado' };
const STATUS_PAGAMENTO_BADGE  = { pendente:'b-laranja', pago:'b-green', atrasado:'b-rosa', cancelado:'b-carvao' };

const PERIODICIDADE_LABELS = { mensal:'Mensal', trimestral:'Trimestral', anual:'Anual' };
const PERIODICIDADE_MESES  = { mensal:1, trimestral:3, anual:12 };

// Prazo (em horas) considerado aceitável pra um chamado seguir aberto,
// a partir da abertura, de acordo com a prioridade. Passou disso: "atrasado".
const SLA_HORAS = { 'Alta':4, 'Média':8, 'Baixa':24 };
