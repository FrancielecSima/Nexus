/* ============================================================
   CLIENTE > Nova Solicitação
============================================================ */
function PageNova({ branding, onSubmit }){
  const [assunto,setAssunto]=useState('');
  const [prioridade,setPrioridade]=useState('Média');
  const [categoria,setCategoria]=useState('Suporte técnico');
  const [descricao,setDescricao]=useState('');

  function submit(e){
    e.preventDefault();
    if(!assunto || !descricao) return;
    onSubmit({ assunto, prioridade, categoria, descricao });
    setAssunto(''); setDescricao('');
  }

  return (
    <div className="card wide-form">
      <div className="card-head"><div className="bar" style={{background:branding.primary}}></div><h3>Descreva sua solicitação</h3></div>
      <form onSubmit={submit}>
        <div className="form-grid" style={{marginBottom:16}}>
          <div className="field-l">
            <label>Assunto</label>
            <input className="text-input" value={assunto} onChange={e=>setAssunto(e.target.value)} placeholder="Ex: Erro ao acessar o sistema" required/>
          </div>
          <div className="field-l">
            <label>Prioridade</label>
            <select className="select-input" value={prioridade} onChange={e=>setPrioridade(e.target.value)}>
              <option>Baixa</option><option>Média</option><option>Alta</option>
            </select>
          </div>
        </div>
        <div className="field-l" style={{marginBottom:16}}>
          <label>Categoria</label>
          <select className="select-input" value={categoria} onChange={e=>setCategoria(e.target.value)}>
            <option>Suporte técnico</option><option>Financeiro</option><option>Dúvida geral</option><option>Solicitação de acesso</option>
          </select>
        </div>
        <div className="field-l" style={{marginBottom:22}}>
          <label>Descrição do problema</label>
          <textarea className="text-input wide" value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Conte com detalhes o que está acontecendo..." required></textarea>
        </div>
        <button className="btn-mini solid" type="submit" style={{background:branding.primary}}>Enviar Solicitação</button>
      </form>
    </div>
  );
}
