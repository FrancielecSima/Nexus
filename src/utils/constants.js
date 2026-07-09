/* ============================================================
   CONSTANTES — paleta de cores, status e estágios de orçamento
============================================================ */
const PALETTE = ['#FF6A2B','#F03C96','#2E86DE','#27AE60','#9B59B6','#1E1F24'];
const STATUS_LABELS = { em_atendimento:'Em atendimento', aguardando_retorno:'Aguardando retorno', encerrado:'Encerrado' };
const STATUS_BADGE  = { em_atendimento:'b-laranja', aguardando_retorno:'b-rosa', encerrado:'b-green' };
const ORC_STAGES = { 'Em análise':25, 'Aprovado':50, 'Em execução':75, 'Concluído':100, 'Reprovado':100 };
const ORC_COLOR  = { 'Em análise':'var(--carvao-3)', 'Aprovado':'var(--laranja)', 'Em execução':'var(--rosa)', 'Concluído':'var(--green)', 'Reprovado':'#C0392B' };
