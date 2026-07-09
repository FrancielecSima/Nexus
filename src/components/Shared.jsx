/* ============================================================
   SMALL SHARED COMPONENTS
============================================================ */
function Kpi({ label, value, delta, dir, tone }){
  const arrow = dir==='up' ? '▲ ' : dir==='down' ? '▼ ' : '';
  return (
    <div className={"card kpi " + (tone==='pink'?'pink':'')}>
      <label>{label}</label>
      <div className="val">{value}</div>
      <div className={"delta " + dir}>{arrow}{delta}</div>
    </div>
  );
}
function BarCol({ h, color, label }){
  return (<div className="col"><div className="b" style={{height:h+'px', background:color}}></div><span>{label}</span></div>);
}
function PrioBar({ label, val, max, color }){
  return (
    <div className="priobar">
      <div className="lbl"><span>{label}</span><span>{val}</span></div>
      <div className="track"><div className="fill" style={{width:(val/max*100)+'%', background:color}}></div></div>
    </div>
  );
}
function TicketRow({ t }){
  const isEncerrado = t.status==='encerrado';
  const pColor = t.priority==='Alta' ? 'b-rosa' : t.priority==='Média' ? 'b-laranja' : t.priority==='Baixa' ? 'b-carvao' : 'b-green';
  const pText = isEncerrado ? 'Concluído' : t.priority;
  return (
    <div className="ticket-card">
      <div>
        <div className="t-title">{t.id} · {t.title}</div>
        <div className="t-meta">{t.date}</div>
        {!isEncerrado && <div className="t-meta" style={{marginTop:2}}>{STATUS_LABELS[t.status]}</div>}
      </div>
      <span className={"badge " + (isEncerrado?'b-green':pColor)}>{pText}</span>
    </div>
  );
}
function Toast({ msg }){
  return (
    <div className={"toast " + (msg?'show':'')}>
      <span className="tdot"></span><span>{msg || ''}</span>
    </div>
  );
}

