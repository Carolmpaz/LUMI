import { useState, useEffect, useRef } from 'react';

export default function EstimuloAuditivo({ estimulo, onResposta }) {
  const [tocando, setTocando] = useState(false);
  const [animacao, setAnimacao] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    // Animação de entrada
    setAnimacao('fadeIn');
    const timer = setTimeout(() => setAnimacao(''), 500);
    
    // Auto-play do áudio (simulado)
    setTimeout(() => {
      reproduzirAudio();
    }, 800);

    return () => clearTimeout(timer);
  }, [estimulo]);

  const reproduzirAudio = () => {
    setTocando(true);
    setAnimacao('pulse');
    
    // Simular reprodução de áudio (3 segundos)
    setTimeout(() => {
      setTocando(false);
      setAnimacao('');
    }, 3000);
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
    backgroundColor: '#e8f4fd',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    margin: '20px',
    minHeight: '400px',
    justifyContent: 'center',
    animation: animacao === 'fadeIn' ? 'fadeIn 0.5s ease-in' : 
               animacao === 'fadeOut' ? 'fadeOut 0.3s ease-out' :
               animacao === 'pulse' ? 'pulse 1s infinite' : 'none'
  };

  const estiloIconeAudio = {
    fontSize: '120px',
    color: tocando ? '#007bff' : '#6c757d',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const estiloLetra = {
    fontSize: '80px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloConteudo = {
    fontSize: '24px',
    color: '#555',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const estiloStatus = {
    fontSize: '18px',
    color: tocando ? '#007bff' : '#6c757d',
    marginBottom: '30px',
    fontWeight: 'bold'
  };

  const estiloBotaoReproducir = {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    marginBottom: '30px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
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
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .botao-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
        `}
      </style>
      
      <div 
        style={estiloIconeAudio}
        onClick={reproduzirAudio}
      >
        {tocando ? '🔊' : '🔈'}
      </div>
      
      <div style={estiloLetra}>
        {estimulo.letra}
      </div>
      
      <div style={estiloConteudo}>
        {estimulo.conteudo}
      </div>
      
      <div style={estiloStatus}>
        {tocando ? '🎵 Reproduzindo...' : '🎵 Clique no alto-falante para ouvir'}
      </div>
      
      <button 
        className="botao-hover"
        style={estiloBotaoReproducir}
        onClick={reproduzirAudio}
        disabled={tocando}
      >
        {tocando ? '⏸ Reproduzindo...' : '▶ Reproduzir Novamente'}
      </button>
      
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
