/* ============================================================
   HELPERS — funções puras usadas em toda a aplicação
============================================================ */
function notificacaoFromRow(row){
  return { id: row.id, text: row.texto, time: fmtDataHora(row.created_at), lido: row.lida };
}
function auditFromRow(row, equipeById){
  const staff = equipeById ? equipeById[row.usuario_id] : null;
  return { id: row.id, quando: row.criado_em, usuario: staff ? staff.nome : 'Equipe', acao: row.acao, detalhe: row.detalhe };
}

function servicoFromRow(r){
  return { id: r.id, nome: r.nome, valor: Number(r.valor), comissaoPercent: Number(r.comissao_percent) };
}
function servicoToRow(data){
  const row = {};
  if('nome' in data) row.nome = data.nome;
  if('valor' in data) row.valor = data.valor;
  if('comissaoPercent' in data) row.comissao_percent = data.comissaoPercent;
  return row;
}
function gastoFromRow(r){
  return { id: r.id, desc: r.descricao, valor: Number(r.valor), vencimento: r.vencimento, categoria: r.categoria, recorrente: r.recorrente };
}
function gastoToRow(data){
  const row = {};
  if('desc' in data) row.descricao = data.desc;
  if('valor' in data) row.valor = data.valor;
  if('vencimento' in data) row.vencimento = data.vencimento;
  if('categoria' in data) row.categoria = data.categoria;
  if('recorrente' in data) row.recorrente = data.recorrente;
  return row;
}
function orcamentoFromRow(row){
  return {
    id: row.id,
    clienteId: row.cliente_id,
    cliente: row.clientes ? row.clientes.nome : '',
    servicoId: row.servico_id,
    item: row.item,
    valor: Number(row.valor),
    comissao: Number(row.comissao),
    status: row.status,
  };
}
function orcamentoToRow(data){
  const row = {};
  if('clienteId' in data) row.cliente_id = data.clienteId;
  if('servicoId' in data) row.servico_id = data.servicoId;
  if('item' in data) row.item = data.item;
  if('valor' in data) row.valor = data.valor;
  if('comissao' in data) row.comissao = data.comissao;
  if('status' in data) row.status = data.status;
  return row;
}

// Converte uma linha de `caixa_lancamentos` do Supabase (com clientes
// embutido via join) para o formato que as telas do app já esperam.
function caixaFromRow(row){
  return {
    id: row.id,
    clienteId: row.cliente_id,
    cliente: row.clientes ? row.clientes.nome : '',
    valor: Number(row.valor),
    vencimento: row.vencimento,
    status: row.status,
    dataPagamento: row.data_pagamento,
    anexos: { boleto: row.anexo_boleto_url, nota: row.anexo_nota_url },
  };
}
// Converte os dados do formulário (já com clienteId resolvido) para as
// colunas reais da tabela `caixa_lancamentos`, prontas para insert/update.
function caixaToRow(data){
  const row = {};
  if('clienteId' in data) row.cliente_id = data.clienteId;
  if('valor' in data) row.valor = data.valor;
  if('vencimento' in data) row.vencimento = data.vencimento;
  if('status' in data) row.status = data.status;
  if('dataPagamento' in data) row.data_pagamento = data.dataPagamento;
  if('anexos' in data){
    row.anexo_boleto_url = data.anexos ? data.anexos.boleto : null;
    row.anexo_nota_url = data.anexos ? data.anexos.nota : null;
  }
  return row;
}

// Converte uma linha de `tickets` do Supabase (com clientes e ticket_historico
// embutidos via join) para o formato que as telas do app já esperam.
function ticketFromRow(row){
  const historico = (row.ticket_historico || [])
    .slice()
    .sort((a,b)=> new Date(a.created_at) - new Date(b.created_at))
    .map(h=>({ text: h.texto, time: fmtDataHora(h.created_at) }));
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id,
    cliente: row.clientes ? row.clientes.nome : '',
    title: row.titulo,
    status: row.status,
    priority: row.prioridade,
    categoria: row.categoria,
    descricao: row.descricao,
    history: historico,
    responsavelId: row.responsavel_id,
    criadoEm: row.criado_em,
    primeiraRespostaEm: row.primeira_resposta_em,
    encerradoEm: row.encerrado_em,
    avaliacao: row.avaliacao,
  };
}

// Converte uma linha da tabela `clientes` (Supabase, snake_case) para o
// formato que as telas do app já esperam (camelCase, nomes antigos).
function clienteFromRow(r){
  return {
    id: r.id,
    authUserId: r.auth_user_id,
    nome: r.nome,
    empresa: r.empresa,
    cnpj: r.cnpj,
    email: r.email,
    endereco: r.endereco,
    servico: r.servico,
    valorMensal: Number(r.valor_cobranca),
    periodicidade: r.periodicidade,
    primary: r.cor_primaria,
    secondary: r.cor_secundaria,
    initial: r.sigla,
  };
}
// Converte os dados do formulário (camelCase) para as colunas reais da
// tabela `clientes` no Supabase, prontas para insert/update.
function clienteToRow(data){
  const row = {};
  if('nome' in data) row.nome = data.nome;
  if('empresa' in data) row.empresa = data.empresa;
  if('cnpj' in data) row.cnpj = data.cnpj;
  if('email' in data) row.email = data.email;
  if('endereco' in data) row.endereco = data.endereco;
  if('servico' in data) row.servico = data.servico;
  if('valorMensal' in data) row.valor_cobranca = data.valorMensal;
  if('periodicidade' in data) row.periodicidade = data.periodicidade;
  if('primary' in data) row.cor_primaria = data.primary;
  if('secondary' in data) row.cor_secundaria = data.secondary;
  if('initial' in data) row.sigla = data.initial;
  return row;
}

let _uidCounter = 1000;
function uid(prefix){ return prefix + '-' + (_uidCounter++); }

function isoDate(offsetDays){
  const d = new Date();
  d.setDate(d.getDate()+offsetDays);
  return d.toISOString().slice(0,10);
}
// Timestamp completo (data + hora), usado nos chamados para SLA real.
function isoDateTime(offsetDays, offsetHours, offsetMinutes){
  const d = new Date();
  d.setDate(d.getDate()+(offsetDays||0));
  d.setHours(d.getHours()+(offsetHours||0));
  d.setMinutes(d.getMinutes()+(offsetMinutes||0));
  return d.toISOString();
}
// Traduz as mensagens de erro mais comuns do Supabase Auth ao trocar senha,
// pra a pessoa entender o motivo real em vez de um erro técnico em inglês.
function traduzErroSenha(msg){
  const m = (msg || '').toLowerCase();
  if(m.includes('different from the old password')) return 'A nova senha precisa ser diferente da senha atual.';
  if(m.includes('at least') && m.includes('character')) return 'A senha não atende aos requisitos mínimos definidos no Supabase (verifique Authentication → Policies).';
  if(m.includes('should contain')) return 'A senha precisa conter letras maiúsculas, minúsculas, números e símbolo, conforme exigido no seu projeto Supabase.';
  if(m.includes('weak') || m.includes('pwned') || m.includes('leaked')) return 'Essa senha é considerada fraca ou já vazada publicamente — escolha outra.';
  return 'Erro ao definir senha: ' + msg;
}

function fmtBRL(n){
  return 'R$ ' + (Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtDataHora(iso){
  if(!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
}
// Formata uma duração em ms como "Xh Ym" (ou "Xd Yh" se passar de 48h).
function fmtDuracao(ms){
  if(ms==null || ms<0) return '—';
  const min = Math.round(ms/60000);
  if(min < 60) return min+'min';
  const horas = Math.floor(min/60);
  const minRest = min%60;
  if(horas < 48) return horas+'h '+minRest+'min';
  const dias = Math.floor(horas/24);
  const horasRest = horas%24;
  return dias+'d '+horasRest+'h';
}

function mesReferencia(dateStr){
  const d = new Date(dateStr+'T00:00:00');
  const now = new Date();
  const dIdx = d.getFullYear()*12 + d.getMonth();
  const nIdx = now.getFullYear()*12 + now.getMonth();
  if(dIdx===nIdx) return { label:'Mês Atual', cls:'b-laranja', group:'atual' };
  if(dIdx===nIdx+1) return { label:'Próximo Mês', cls:'b-rosa', group:'proximo' };
  if(dIdx<nIdx) return { label:'Atrasado', cls:'b-carvao', group:'atrasado' };
  return { label:d.toLocaleDateString('pt-BR',{month:'short',year:'numeric'}), cls:'b-carvao', group:'outro' };
}

// Status "efetivo" de um lançamento de caixa: se já foi marcado como pago/cancelado,
// usa isso; senão deriva "atrasado" automaticamente comparando o vencimento com hoje.
function statusEfetivoCaixa(entry){
  if(entry.status==='pago') return 'pago';
  if(entry.status==='cancelado') return 'cancelado';
  const hoje = new Date().toISOString().slice(0,10);
  if(entry.vencimento < hoje) return 'atrasado';
  return 'pendente';
}

function shade(hex){
  const c = hex.replace('#','');
  const num = parseInt(c,16);
  let r=(num>>16)-30, g=((num>>8)&0xff)-30, b=(num&0xff)-30;
  r=Math.max(0,r); g=Math.max(0,g); b=Math.max(0,b);
  return '#'+(r<<16|g<<8|b).toString(16).padStart(6,'0');
}

// Série mensal (últimos N meses, terminando no mês atual) — usada no modo "Últimos 6 meses".
function monthlySeries(caixaList, months){
  const now = new Date();
  const arr = [];
  for(let i=months-1;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    arr.push(monthBucket(caixaList, d.getFullYear(), d.getMonth()));
  }
  return arr;
}
// Série de um ano inteiro (Jan–Dez) — usada no modo "Ano".
function yearSeries(caixaList, year){
  const arr = [];
  for(let m=0; m<12; m++){
    arr.push(monthBucket(caixaList, year, m));
  }
  return arr;
}
// Série entre duas datas (inclusive), agrupada por mês — usada no modo "Personalizado".
function rangeSeries(caixaList, fromISO, toISO){
  const from = new Date(fromISO+'T00:00:00');
  const to = new Date(toISO+'T00:00:00');
  const arr = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  let guard = 0;
  while(cursor <= end && guard < 240){
    arr.push(monthBucket(caixaList, cursor.getFullYear(), cursor.getMonth()));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1);
    guard++;
  }
  return arr;
}
function monthBucket(caixaList, year, month){
  let label = new Date(year, month, 1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','');
  label = label.charAt(0).toUpperCase()+label.slice(1);
  const doMes = caixaList.filter(e=>{
    const ed = new Date(e.vencimento+'T00:00:00');
    return ed.getFullYear()===year && ed.getMonth()===month;
  });
  const recebido = doMes.filter(e=>statusEfetivoCaixa(e)==='pago').reduce((s,e)=>s+e.valor,0);
  const previsto = doMes.reduce((s,e)=>s+e.valor,0);
  return { label:label+'/'+String(year).slice(2), year, month, total:previsto, recebido };
}

function gradientFromSegments(segments){
  let acc = 0;
  const parts = segments.map(s=>{ const start=acc; acc+=s.pct; return `${s.color} ${start}% ${acc}%`; });
  return `conic-gradient(${parts.join(', ')})`;
}

// Gera lançamentos de caixa retroativos (demonstração) para os últimos ~14 meses,
// já marcados como pagos, respeitando a periodicidade de cada cliente — assim o
// gráfico "por Ano" já nasce com dado real pra comparar.
function gerarHistoricoCaixaDemo(){
  const entries = [];
  const clientesDemo = [
    { nome:'Ana Souza', valor:600, periodicidade:'mensal' },
    { nome:'Bruno Lima', valor:450, periodicidade:'mensal' },
    { nome:'Carla Dias', valor:2700, periodicidade:'trimestral' },
    { nome:'Diego Ramos', valor:4200, periodicidade:'anual' },
  ];
  const passoMeses = { mensal:1, trimestral:3, anual:12 };
  const now = new Date();
  clientesDemo.forEach(c=>{
    const passo = passoMeses[c.periodicidade];
    for(let i=passo; i<=14; i+=passo){
      const d = new Date(now.getFullYear(), now.getMonth()-i, Math.min(10, 28));
      const venc = d.toISOString().slice(0,10);
      const pago = new Date(d); pago.setDate(pago.getDate()+2);
      entries.push({
        id: uid('cx'),
        cliente: c.nome,
        valor: c.valor,
        vencimento: venc,
        status: 'pago',
        dataPagamento: pago.toISOString().slice(0,10),
        anexos: { boleto:null, nota:null },
      });
    }
  });
  return entries;
}

// Exporta uma lista de objetos como CSV e dispara o download no navegador.
function exportarCSV(nomeArquivo, linhas, colunas){
  const header = colunas.map(c=>c.label).join(';');
  const body = linhas.map(row => colunas.map(c=>{
    const v = row[c.key];
    const s = (v==null ? '' : String(v)).replace(/;/g,',').replace(/\n/g,' ');
    return s;
  }).join(';')).join('\n');
  const csv = '\uFEFF' + header + '\n' + body;
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
