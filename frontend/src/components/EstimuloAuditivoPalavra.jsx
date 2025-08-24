import { useState, useEffect, useRef } from 'react';

export default function EstimuloAuditivoPalavra({ palavra, onResposta }) {
  const [tocando, setTocando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState('escuta'); // escuta, identificacao, repeticao
  const [animacao, setAnimacao] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState([]);
  const [opcoes, setOpcoes] = useState([]);
  const audioRef = useRef(null);

  const getEmojiPalavra = (palavra) => {
    const emojis = {
      'CASA': '🏠',
      'BOLA': '⚽',
      'GATO': '🐱',
      'ESCOLA': '🏫',
      'FAMÍLIA': '👨‍👩‍👧‍👦',
      'BORBOLETA': '🦋'
    };
    return emojis[palavra] || '📝';
  };

  // Gerar opções para a atividade de identificação
  const gerarOpcoes = () => {
    const opcoes = [
      {
        id: 1,
        palavra: palavra.palavra,
        emoji: getEmojiPalavra(palavra.palavra),
        correta: true
      }
    ];

    // Adicionar distrações
    const distracoes = [
      { palavra: 'LIVRO', emoji: '📚' },
      { palavra: 'CARRO', emoji: '🚗' },
      { palavra: 'FLOR', emoji: '🌸' },
      { palavra: 'PEIXE', emoji: '🐟' },
      { palavra: 'MESA', emoji: '🪑' },
      { palavra: 'SOL', emoji: '☀️' }
    ].filter(d => d.palavra !== palavra.palavra);

    // Selecionar 3 distrações aleatórias
    const distracoesSelecionadas = distracoes
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    distracoesSelecionadas.forEach((distracao, index) => {
      opcoes.push({
        id: index + 2,
        ...distracao,
        correta: false
      });
    });

    return opcoes.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setAnimacao('fadeIn');
    setTentativas(0);
    setAcertos(0);
    setOpcoesSelecionadas([]);
    setOpcoes(gerarOpcoes());
    const timer = setTimeout(() => setAnimacao(''), 500);

    // Auto-play da palavra completa
    setTimeout(() => {
      reproduzirAudio('palavra');
    }, 800);

    return () => clearTimeout(timer);
  }, [palavra]);

  const reproduzirAudio = (tipo, indice = 0) => {
    setTocando(true);
    setAnimacao('pulse');

    let duracao = 3000; // duração padrão

    // Simular reprodução de áudio baseado no tipo
    console.log(`🔊 Reproduzindo ${tipo} da palavra ${palavra.palavra}`);

    setTimeout(() => {
      setTocando(false);
      setAnimacao('');
    }, duracao);
  };

  const gerarOpcoesAudio = () => {
    const opcoes = [
      {
        id: 1,
        palavra: palavra.palavra,
        emoji: getEmojiPalavra(palavra.palavra),
        correta: true
      }
    ];

    const distracoes = [
      { palavra: 'MESA', emoji: '🪑' },
      { palavra: 'LIVRO', emoji: '📚' },
      { palavra: 'FLOR', emoji: '🌸' },
      { palavra: 'PEIXE', emoji: '🐟' },
      { palavra: 'SOL', emoji: '☀️' },
      { palavra: 'ÁGUA', emoji: '💧' }
    ].filter(d => d.palavra !== palavra.palavra);

    distracoes.slice(0, 3).forEach((distracao, index) => {
      opcoes.push({
        id: index + 2,
        ...distracao,
        correta: false
      });
    });

    return opcoes.sort(() => Math.random() - 0.5);
  };

  const selecionarOpcao = (opcao) => {
    console.log('Opção selecionada:', opcao);
    setTentativas(prev => prev + 1);

    if (opcao.correta) {
      const novosAcertos = acertos + 1;
      setAcertos(novosAcertos);
      setOpcoesSelecionadas([opcao]);
      setAnimacao('success');

      console.log('Acerto! Total de acertos:', novosAcertos);

      setTimeout(() => {
        if (novosAcertos >= 2) {
          // Avançar para próxima etapa ou concluir
          if (etapaAtual === 'escuta') {
            setEtapaAtual('identificacao');
            setAcertos(0); // Reset para próxima etapa
          } else if (etapaAtual === 'identificacao') {
            setEtapaAtual('repeticao');
            setAcertos(0); // Reset para próxima etapa
          } else {
            handleResposta('acerto');
          }
        } else {
          // Gerar novas opções para continuar na mesma etapa
          setOpcoes(gerarOpcoes());
          setOpcoesSelecionadas([]);
        }
        setAnimacao('');
      }, 1500);
    } else {
      console.log('Erro na seleção');
      setOpcoesSelecionadas([opcao]);
      setAnimacao('error');
      setTimeout(() => {
        setAnimacao('');
        setOpcoesSelecionadas([]);
        // Gerar novas opções
        setOpcoes(gerarOpcoes());
      }, 1000);
    }
  };



  const handleResposta = (resultado) => {
    setAnimacao('fadeOut');
    setTimeout(() => onResposta(resultado), 300);
  };

  const renderEtapaEscuta = () => (
    <>
      <div style={estiloTitulo}>👂 Escute com Atenção</div>
      <div style={estiloInstrucao}>
        Clique no botão para ouvir a palavra: <strong>{palavra.palavra}</strong>
      </div>

      <button
        onClick={() => reproduzirAudio('palavra')}
        disabled={tocando}
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: 'none',
          fontSize: '80px',
          backgroundColor: tocando ? '#ffc107' : '#007bff',
          color: 'white',
          cursor: tocando ? 'not-allowed' : 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          marginBottom: '30px'
        }}
      >
        {tocando ? '🔊' : '🎵'}
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => reproduzirAudio('silabas')}
          style={estiloBotaoSecundario}
        >
          🔤 Ouvir Sílabas
        </button>
        <button
          onClick={() => reproduzirAudio('contexto')}
          style={estiloBotaoSecundario}
        >
          💭 Ouvir Explicação
        </button>
      </div>

      <button
        onClick={() => setEtapaAtual('identificacao')}
        style={estiloBotaoContinuar}
      >
        Continuar →
      </button>
    </>
  );

  const renderEtapaIdentificacao = () => {
    const opcoes = gerarOpcoesAudio();

    return (
      <>
        <div style={estiloTitulo}>🎯 Identifique a Palavra</div>
        <div style={estiloInstrucao}>
          Ouça novamente e clique na palavra correta
        </div>

        <button
          onClick={() => reproduzirAudio('palavra')}
          style={{
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            marginBottom: '30px',
            cursor: 'pointer'
          }}
        >
          🔊 Repetir Áudio
        </button>

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
  };

  const renderEtapaRepeticao = () => (
    <>
      <div style={estiloTitulo}>🗣️ Repita a Palavra</div>
      <div style={estiloInstrucao}>
        Ouça e tente repetir a palavra em voz alta
      </div>

      <div style={{ fontSize: '48px', marginBottom: '20px' }}>
        {getEmojiPalavra(palavra.palavra)}
      </div>

      <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px', color: '#333' }}>
        {palavra.palavra}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          onClick={() => reproduzirAudio('palavra')}
          style={estiloBotaoAudio}
        >
          🔊 Palavra
        </button>
        <button
          onClick={() => reproduzirAudio('silabas')}
          style={estiloBotaoAudio}
        >
          🔤 Sílabas
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>
          💡 {palavra.contexto}
        </p>
      </div>

      <button
        onClick={() => handleResposta('acerto')}
        style={estiloBotaoConcluir}
      >
        ✓ Consegui Repetir!
      </button>
    </>
  );

  const estiloContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#e8f4fd',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    margin: '20px',
    minHeight: '600px',
    justifyContent: 'center',
    // Animações removidas para melhor performance
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

  const estiloBotaoSecundario = {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '0 10px'
  };

  const estiloBotaoContinuar = {
    padding: '15px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const estiloGridOpcoes = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px',
    maxWidth: '400px'
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
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: selecionada ? '0 4px 15px rgba(40,167,69,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
    // Transform removido para melhor performance
  });

  const estiloBotaoConcluir = {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const estiloBotaoAudio = {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const estiloIconeAudio = {
    fontSize: '120px',
    color: tocando ? '#007bff' : '#6c757d',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textShadow: tocando ? '0 0 20px rgba(0,123,255,0.5)' : 'none'
  };

  const estiloPalavra = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '15px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  };

  const estiloAudioAtual = {
    fontSize: '18px',
    color: tocando ? '#007bff' : '#6c757d',
    marginBottom: '20px',
    fontWeight: 'bold',
    minHeight: '25px',
    textAlign: 'center'
  };

  const estiloControles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
    width: '100%',
    maxWidth: '600px'
  };



  const estiloSilabas = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const estiloSilaba = (index, ativo = false) => ({
    fontSize: '20px',
    fontWeight: 'bold',
    color: ativo ? 'white' : '#007bff',
    backgroundColor: ativo ? '#007bff' : '#e3f2fd',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '2px solid #007bff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: tocando && !ativo ? 0.5 : 1
  });

  const estiloLetras = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const estiloLetra = (index, ativo = false) => ({
    fontSize: '18px',
    fontWeight: 'bold',
    color: ativo ? 'white' : '#007bff',
    backgroundColor: ativo ? '#007bff' : '#e3f2fd',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '2px solid #007bff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '35px',
    textAlign: 'center',
    opacity: tocando && !ativo ? 0.5 : 1
  });

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
          /* Animações removidas para melhor performance */
        `}
      </style>

      {/* Renderizar etapa atual */}
      {etapaAtual === 'escuta' && renderEtapaEscuta()}
      {etapaAtual === 'identificacao' && renderEtapaIdentificacao()}
      {etapaAtual === 'repeticao' && renderEtapaRepeticao()}

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
