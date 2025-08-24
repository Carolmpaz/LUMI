import { useState, useEffect } from 'react';

export default function EstimuloTatil({ estimulo, onResposta }) {
  const [tocado, setTocado] = useState(false);
  const [animacao, setAnimacao] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Animação de entrada
    setAnimacao('fadeIn');
    const timer = setTimeout(() => setAnimacao(''), 500);
    return () => clearTimeout(timer);
  }, [estimulo]);

  const handleTocar = () => {
    if (tocado) return;
    
    setTocado(true);
    setAnimacao(estimulo.animacao || 'bounce');
    setFeedback('✨ Você tocou na letra!');
    
    // Vibração simulada (se suportado)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    setTimeout(() => {
      setAnimacao('');
    }, 1000);
  };

  const handleResposta = (resultado) => {
    setAnimacao('fadeOut');
    setTimeout(() => onResposta(resultado), 300);
  };

  const estiloContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#fff3cd',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    margin: '20px',
    minHeight: '400px',
    justifyContent: 'center',
    animation: animacao === 'fadeIn' ? 'fadeIn 0.5s ease-in' : 
               animacao === 'fadeOut' ? 'fadeOut 0.3s ease-out' : 'none'
  };

  const estiloAreaToque = {
    width: '200px',
    height: '200px',
    backgroundColor: tocado ? '#ffc107' : '#fff',
    border: '4px dashed #ffc107',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '20px',
    boxShadow: tocado ? '0 0 20px rgba(255, 193, 7, 0.5)' : 'none',
    animation: animacao === 'bounce' ? 'bounce 0.6s ease' :
               animacao === 'pulse' ? 'pulse 0.8s ease' : 'none'
  };

  const estiloLetra = {
    fontSize: '100px',
    fontWeight: 'bold',
    color: tocado ? '#fff' : '#ffc107',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontFamily: 'Arial, sans-serif',
    userSelect: 'none'
  };

  const estiloConteudo = {
    fontSize: '24px',
    color: '#555',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const estiloInstrucao = {
    fontSize: '18px',
    color: '#856404',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  };

  const estiloFeedback = {
    fontSize: '20px',
    color: '#28a745',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: 'bold',
    minHeight: '30px'
  };

  const estiloBotao = {
    padding: '15px 30px',
    margin: '0 10px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  };

  const estiloBotaoAcerto = {
    ...estiloBotao,
    backgroundColor: '#28a745',
    color: 'white'
  };

  const estiloBotaoErro = {
    ...estiloBotao,
    backgroundColor: '#dc3545',
    color: 'white'
  };

  const estiloBotaoPular = {
    ...estiloBotao,
    backgroundColor: '#6c757d',
    color: 'white'
  };

  return (
    <div style={estiloContainer}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
          }
          @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            80% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .botao-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
          .area-toque:hover {
            transform: scale(1.05);
            border-color: #e0a800;
          }
        `}
      </style>
      
      <div style={estiloConteudo}>
        {estimulo.conteudo}
      </div>
      
      <div style={estiloInstrucao}>
        👆 Toque na letra abaixo
      </div>
      
      <div 
        className="area-toque"
        style={estiloAreaToque}
        onClick={handleTocar}
      >
        <div style={estiloLetra}>
          {estimulo.letra}
        </div>
      </div>
      
      <div style={estiloFeedback}>
        {feedback}
      </div>
      
      <div style={{ display: 'flex', gap: '15px' }}>
        <button 
          className="botao-hover"
          style={estiloBotaoAcerto}
          onClick={() => handleResposta('acerto')}
        >
          ✓ Acertei
        </button>
        <button 
          className="botao-hover"
          style={estiloBotaoErro}
          onClick={() => handleResposta('erro')}
        >
          ✗ Errei
        </button>
        <button 
          className="botao-hover"
          style={estiloBotaoPular}
          onClick={() => handleResposta('pular')}
        >
          ⏭ Pular
        </button>
      </div>
    </div>
  );
}
