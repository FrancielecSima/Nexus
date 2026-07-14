/* ============================================================
   ErrorBoundary — evita tela em branco quando algo quebra.
   Sem isso, qualquer erro de render deixa a aplicação inteira muda.
============================================================ */
class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }
  componentDidCatch(error, info){
    console.error('Erro capturado pelo ErrorBoundary:', error, info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{
          minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:14, padding:40, textAlign:'center', fontFamily:'inherit',
          background:'#F4F3F6'
        }}>
          <div style={{width:52, height:52, borderRadius:14, background:'#F03C96', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22}}>!</div>
          <h2 style={{margin:0, color:'#1E1F24'}}>Algo deu errado nesta tela</h2>
          <p style={{color:'#5B5D66', maxWidth:420, margin:0}}>
            Um erro inesperado interrompeu esta parte do sistema. Seus dados não foram
            perdidos — tente recarregar a página. Se o problema continuar, avise a equipe
            técnica.
          </p>
          <button
            onClick={()=>window.location.reload()}
            style={{marginTop:8, padding:'10px 22px', borderRadius:10, border:'none',
              background:'#FF6A2B', color:'#fff', fontWeight:700, cursor:'pointer'}}>
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
