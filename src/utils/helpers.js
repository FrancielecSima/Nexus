/* ============================================================
   HELPERS — funções puras usadas em toda a aplicação
============================================================ */
let _uidCounter = 1000;
function uid(prefix){ return prefix + '-' + (_uidCounter++); }

function isoDate(offsetDays){
  const d = new Date();
  d.setDate(d.getDate()+offsetDays);
  return d.toISOString().slice(0,10);
}
function fmtBRL(n){
  return 'R$ ' + (Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
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
function shade(hex){
  const c = hex.replace('#','');
  const num = parseInt(c,16);
  let r=(num>>16)-30, g=((num>>8)&0xff)-30, b=(num&0xff)-30;
  r=Math.max(0,r); g=Math.max(0,g); b=Math.max(0,b);
  return '#'+(r<<16|g<<8|b).toString(16).padStart(6,'0');
}
function monthlySeries(caixaList, months){
  const now = new Date();
  const arr = [];
  for(let i=months-1;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    let label = d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','');
    label = label.charAt(0).toUpperCase()+label.slice(1);
    const total = caixaList.filter(e=>{
      const ed = new Date(e.vencimento+'T00:00:00');
      return ed.getFullYear()===d.getFullYear() && ed.getMonth()===d.getMonth();
    }).reduce((s,e)=>s+e.valor,0);
    arr.push({ label, total });
  }
  return arr;
}
function gradientFromSegments(segments){
  let acc = 0;
  const parts = segments.map(s=>{ const start=acc; acc+=s.pct; return `${s.color} ${start}% ${acc}%`; });
  return `conic-gradient(${parts.join(', ')})`;
}
