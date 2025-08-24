import { useState, useEffect } from 'react';

export default function EstimuloVisual({ estimulo, onResposta }) {
  const [animacao, setAnimacao] = useState('');

  useEffect(() => {
    // Animação de entrada
    setAnimacao('fadeIn');
    const timer = setTimeout(() => setAnimacao(''), 500);
    return () => clearTimeout(timer);
  }, [estimulo]);

  const handleResposta = (resultado) => {
    setAnimacao('fadeOut');
    setTimeout(() => onResposta(resultado), 300);
  };

  const estiloContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    margin: '20px',
    minHeight: '400px',
    justifyContent: 'center',
    animation: animacao === 'fadeIn' ? 'fadeIn 0.5s ease-in' : 
               animacao === 'fadeOut' ? 'fadeOut 0.3s ease-out' : 'none'
  };

  const estiloLetra = {
    fontSize: '120px',
    fontWeight: 'bold',
    color: estimulo.cor || '#333',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    marginBottom: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloConteudo = {
    fontSize: '24px',
    color: '#555',
    marginBottom: '30px',
    textAlign: 'center'
  };

  const estiloImagem = {
    width: '150px',
    height: '150px',
    backgroundColor: '#e9ecef',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    border: '3px solid #dee2e6',
    fontSize: '60px'
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

  // Emoji para representar a imagem (placeholder)
  const getEmoji = (letra) => {
    const emojis = {
      'A': '🐝', // Abelha
      'B': '⚽', // Bola
      'C': '🐱', // Gato
      'D': '🐶', // Cachorro
      'E': '🐘'  // Elefante
    };
    return emojis[letra] || '📝';
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
          .botao-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
        `}
      </style>
      
      <div style={estiloLetra}>
        {estimulo.letra}
      </div>
      
      <div style={estiloImagem}>
        {getEmoji(estimulo.letra)}
      </div>
      
      <div style={estiloConteudo}>
        {estimulo.conteudo}
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
