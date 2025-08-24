import { useState, useEffect } from 'react';
import { useAdaptabilidade } from '../hooks/useAdaptabilidade';

export default function EstimuloVisualPalavra({ palavra, onResposta }) {
  const { obterConfiguracao } = useAdaptabilidade();
  const [animacao, setAnimacao] = useState('');
  const [etapaAtual, setEtapaAtual] = useState('selecao'); // selecao -> associacao -> construcao
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState([]);
  const [tentativas, setTentativas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [configuracao, setConfiguracao] = useState(null);

  // Emoji baseado na categoria
  const getEmojiCategoria = (categoria) => {
    const emojis = {
      'moradia': '🏠',
      'brinquedos': '🎾',
      'animais': '🐱',
      'educação': '🏫',
      'família': '👨‍👩‍👧‍👦',
      'natureza': '🦋',
      'geral': '📝'
    };
    return emojis[categoria] || '📝';
  };

  useEffect(() => {
    // Carregar configuração adaptativa
    const config = obterConfiguracao('visual');
    setConfiguracao(config);
    console.log('🎯 Configuração adaptativa visual:', config);

    setAnimacao('fadeIn');
    setOpcoesSelecionadas([]);
    setTentativas(0);
    setAcertos(0);
    const timer = setTimeout(() => setAnimacao(''), 500);
    return () => clearTimeout(timer);
  }, [palavra, obterConfiguracao]);

  // Gerar opções de imagens para seleção (palavra correta + distrações)
  const gerarOpcoes = () => {
    const opcoes = [
      {
        id: 1,
        palavra: palavra.palavra,
        categoria: palavra.categoria,
        emoji: getEmojiCategoria(palavra.categoria),
        correta: true
      }
    ];

    // Adicionar opções incorretas (distrações) baseadas na palavra atual
    const todasDistracoes = [
      { palavra: 'LIVRO', categoria: 'educação', emoji: '📚' },
      { palavra: 'CARRO', categoria: 'transporte', emoji: '🚗' },
      { palavra: 'FLOR', categoria: 'natureza', emoji: '🌸' },
      { palavra: 'PEIXE', categoria: 'animais', emoji: '🐟' },
      { palavra: 'MESA', categoria: 'móveis', emoji: '🪑' },
      { palavra: 'SOL', categoria: 'natureza', emoji: '☀️' },
      { palavra: 'ÁGUA', categoria: 'natureza', emoji: '💧' },
      { palavra: 'PÁSSARO', categoria: 'animais', emoji: '🐦' }
    ].filter(d => d.palavra !== palavra.palavra);

    // Ajustar número de distrações baseado na configuração adaptativa
    const config = configuracao || { dificuldade: 'medio' };
    let numDistracoes = 3;

    if (config.dificuldade === 'facil') numDistracoes = 2;
    if (config.dificuldade === 'dificil') numDistracoes = 5;

    console.log(`🎯 Atividade visual adaptada: ${numDistracoes + 1} opções (dificuldade: ${config.dificuldade})`);

    // Embaralhar e pegar distrações baseado na dificuldade
    const distracoesSelecionadas = todasDistracoes
      .sort(() => Math.random() - 0.5)
      .slice(0, numDistracoes);

    distracoesSelecionadas.forEach((distracao, index) => {
      opcoes.push({
        id: index + 2,
        ...distracao,
        correta: false
      });
    });

    // Embaralhar opções finais
    return opcoes.sort(() => Math.random() - 0.5);
  };

  const opcoes = gerarOpcoes();

  const selecionarOpcao = (opcao) => {
    setTentativas(prev => prev + 1);

    if (opcao.correta) {
      setAcertos(prev => prev + 1);
      setOpcoesSelecionadas([opcao]);
      setAnimacao('success');

      setTimeout(() => {
        if (etapaAtual === 'selecao') {
          setEtapaAtual('associacao');
        } else if (etapaAtual === 'associacao') {
          setEtapaAtual('construcao');
        } else {
          handleResposta('acerto');
        }
        setAnimacao('');
      }, 1500);
    } else {
      setAnimacao('error');
      setTimeout(() => setAnimacao(''), 800);
    }
  };

  const handleResposta = (resultado) => {
    setAnimacao('fadeOut');
    setTimeout(() => onResposta(resultado), 300);
  };

  const estiloContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    margin: '20px',
    minHeight: '600px',
    justifyContent: 'center',
    animation: animacao === 'fadeIn' ? 'fadeIn 0.5s ease-in' :
               animacao === 'fadeOut' ? 'fadeOut 0.3s ease-out' :
               animacao === 'success' ? 'success 0.5s ease' :
               animacao === 'error' ? 'error 0.5s ease' : 'none'
  };

  const estiloOpcao = (opcao, selecionada = false) => ({
    width: '150px',
    height: '150px',
    backgroundColor: selecionada ? '#e8f5e8' : '#ffffff',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px',
    border: selecionada ? '3px solid #28a745' : '3px solid #dee2e6',
    fontSize: '60px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: selecionada ? '0 4px 15px rgba(40,167,69,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
    transform: selecionada ? 'scale(1.05)' : 'scale(1)'
  });

  const estiloGridOpcoes = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px',
    maxWidth: '400px'
  };

  const estiloTitulo = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center'
  };

  const estiloInstrucao = {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center',
    maxWidth: '500px',
    lineHeight: '1.4'
  };

  const estiloProgresso = {
    fontSize: '16px',
    color: '#007bff',
    marginBottom: '20px',
    fontWeight: 'bold'
  };

  const estiloSilabas = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  };

  const estiloSilaba = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    padding: '10px 20px',
    borderRadius: '12px',
    border: '2px solid #2196f3'
  };

  const estiloLetras = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    justifyContent: 'center'
  };

  const estiloLetra = (index) => ({
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: palavra.visual?.cores?.[index % palavra.visual.cores.length] || '#6c757d',
    padding: '8px 12px',
    borderRadius: '8px',
    minWidth: '35px',
    textAlign: 'center'
  });

  const renderEtapaSelecao = () => (
    <>
      <div style={estiloTitulo}>🎯 Encontre a palavra</div>
      <div style={estiloInstrucao}>
        Clique na imagem que representa a palavra: <strong>{palavra.palavra}</strong>
      </div>
      <div style={estiloProgresso}>
        Tentativas: {tentativas} | Acertos: {acertos}
      </div>

      <div style={estiloGridOpcoes}>
        {opcoes.map(opcao => (
          <div
            key={opcao.id}
            style={estiloOpcao(opcao, opcoesSelecionadas.includes(opcao))}
            onClick={() => selecionarOpcao(opcao)}
          >
            <div style={{ fontSize: '60px', marginBottom: '8px' }}>
              {opcao.emoji}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {opcao.palavra}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderEtapaAssociacao = () => (
    <>
      <div style={estiloTitulo}>🔤 Decomposição da Palavra</div>
      <div style={estiloInstrucao}>
        Veja como a palavra <strong>{palavra.palavra}</strong> é formada:
      </div>

      {/* Palavra completa */}
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
        {palavra.palavra}
      </div>

      {/* Sílabas */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Sílabas:</div>
        <div style={estiloSilabas}>
          {palavra.silabas?.map((silaba, index) => (
            <div key={index} style={estiloSilaba}>
              {silaba}
            </div>
          ))}
        </div>
      </div>

      {/* Letras */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Letras:</div>
        <div style={estiloLetras}>
          {palavra.letras?.map((letra, index) => (
            <div key={index} style={estiloLetra(index)}>
              {letra}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setEtapaAtual('construcao')}
        style={{
          padding: '15px 30px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Continuar →
      </button>
    </>
  );

  const renderEtapaConstrucao = () => (
    <>
      <div style={estiloTitulo}>🏗️ Monte a Palavra</div>
      <div style={estiloInstrucao}>
        Clique nas sílabas na ordem correta para formar: <strong>{palavra.palavra}</strong>
      </div>

      {/* Área de construção */}
      <div style={{
        minHeight: '80px',
        border: '3px dashed #007bff',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f8f9ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#007bff'
      }}>
        {opcoesSelecionadas.length > 0 ?
          opcoesSelecionadas.map(s => s.palavra).join('') :
          'Clique nas sílabas abaixo'
        }
      </div>

      {/* Sílabas para seleção */}
      <div style={estiloSilabas}>
        {palavra.silabas?.map((silaba, index) => (
          <div
            key={index}
            style={{
              ...estiloSilaba,
              cursor: 'pointer',
              transform: 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => {
              // Lógica simples de construção
              if (opcoesSelecionadas.length < palavra.silabas.length) {
                setOpcoesSelecionadas([...opcoesSelecionadas, { palavra: silaba }]);
              }
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {silaba}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => setOpcoesSelecionadas([])}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Limpar
        </button>

        <button
          onClick={() => {
            const palavraConstruida = opcoesSelecionadas.map(s => s.palavra).join('');
            if (palavraConstruida === palavra.palavra) {
              handleResposta('acerto');
            } else {
              setAnimacao('error');
              setTimeout(() => setAnimacao(''), 800);
            }
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ✓ Verificar
        </button>
      </div>
    </>
  );

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
          @keyframes success {
            0% { background-color: #f8f9fa; }
            50% { background-color: #d4edda; }
            100% { background-color: #f8f9fa; }
          }
          @keyframes error {
            0% { background-color: #f8f9fa; }
            25% { background-color: #f8d7da; }
            50% { background-color: #f8f9fa; }
            75% { background-color: #f8d7da; }
            100% { background-color: #f8f9fa; }
          }
          .opcao-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
        `}
      </style>

      {/* Renderizar etapa atual */}
      {etapaAtual === 'selecao' && renderEtapaSelecao()}
      {etapaAtual === 'associacao' && renderEtapaAssociacao()}
      {etapaAtual === 'construcao' && renderEtapaConstrucao()}

      {/* Contexto da palavra */}
      <div style={{
        fontSize: '16px',
        color: '#666',
        marginTop: '20px',
        textAlign: 'center',
        fontStyle: 'italic',
        maxWidth: '400px'
      }}>
        💡 {palavra.contexto}
      </div>

      {/* Botões de controle */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button
          onClick={() => handleResposta('erro')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          😕 Muito difícil
        </button>

      </div>
    </div>
  );
}
