import { useState, useEffect, useRef } from 'react';

export default function EstimuloTatilPalavra({ palavra, onResposta }) {
  const [etapaAtual, setEtapaAtual] = useState('contorno'); // traco, contorno, escrita
  const [letraAtual, setLetraAtual] = useState(0);
  const [desenhando, setDesenhando] = useState(false);
  const [pontos, setPontos] = useState([]);
  const [progresso, setProgresso] = useState(0);
  const [animacao, setAnimacao] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [caminhoCorreto, setCaminhoCorreto] = useState([]);
  const [desenhoUsuario, setDesenhoUsuario] = useState([]);
  const [pontoAtual, setPontoAtual] = useState(0);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    setAnimacao('fadeIn');
    setTentativas(0);
    setAcertos(0);
    setLetraAtual(0);
    setEtapaAtual('contorno'); // Iniciar direto no contorno
    setPontos([]);
    setProgresso(0);
    setDesenhoUsuario([]);
    setPontoAtual(0);

    // Inicializar caminho imediatamente
    if (palavra.letras?.[0]) {
      console.log('Inicializando caminho na montagem do componente para letra:', palavra.letras[0]);
      const novoCaminho = gerarCaminhoLetra(palavra.letras[0]);
      setCaminhoCorreto(novoCaminho);
    }

    const timer = setTimeout(() => setAnimacao(''), 500);
    return () => clearTimeout(timer);
  }, [palavra]);

  // Função para desenhar no canvas
  const desenharNoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas não encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log('Desenhando no canvas. Caminho correto:', caminhoCorreto.length, 'pontos');

    // Desenhar o contorno da letra (caminho correto) em cinza claro
    if (caminhoCorreto.length > 0) {
      // Desenhar linha do contorno
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(caminhoCorreto[0].x, caminhoCorreto[0].y);
      for (let i = 1; i < caminhoCorreto.length; i++) {
        ctx.lineTo(caminhoCorreto[i].x, caminhoCorreto[i].y);
      }
      ctx.stroke();

      // Desenhar pontos de guia - MELHORADO
      caminhoCorreto.forEach((ponto, index) => {
        // Ponto verde para início, azul para os outros
        ctx.fillStyle = index === 0 ? '#28a745' : '#007bff';
        ctx.beginPath();
        ctx.arc(ponto.x, ponto.y, index === 0 ? 12 : 6, 0, 2 * Math.PI);
        ctx.fill();

        // Adicionar borda branca para melhor visibilidade
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ponto.x, ponto.y, index === 0 ? 12 : 6, 0, 2 * Math.PI);
        ctx.stroke();
      });

      console.log('Pontos desenhados:', caminhoCorreto.length);
    } else {
      console.log('Nenhum caminho correto definido');
    }

    // Desenhar o desenho do usuário
    if (desenhoUsuario.length > 1) {
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(desenhoUsuario[0].x, desenhoUsuario[0].y);
      for (let i = 1; i < desenhoUsuario.length; i++) {
        ctx.lineTo(desenhoUsuario[i].x, desenhoUsuario[i].y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    // Atualizar caminho quando letra muda
    if (palavra.letras?.[letraAtual]) {
      const novoCaminho = gerarCaminhoLetra(palavra.letras[letraAtual]);
      console.log('Gerando caminho para letra:', palavra.letras[letraAtual], 'Pontos:', novoCaminho.length);
      setCaminhoCorreto(novoCaminho);
      setDesenhoUsuario([]);
      setPontoAtual(0);
      setProgresso(0);
    }
  }, [letraAtual]);

  useEffect(() => {
    // Desenhar no canvas quando o caminho correto muda
    if (etapaAtual === 'contorno') {
      // Desenhar imediatamente
      desenharNoCanvas();
    }
  }, [caminhoCorreto, desenhoUsuario, etapaAtual]);

  useEffect(() => {
    // Inicializar canvas quando entrar na etapa de contorno
    if (etapaAtual === 'contorno' && canvasRef.current) {
      desenharNoCanvas();
    }
  }, [etapaAtual]);

  // Forçar inicialização do caminho quando o componente carrega
  useEffect(() => {
    if (etapaAtual === 'contorno' && palavra.letras?.[letraAtual]) {
      console.log('Forçando inicialização do caminho');
      const novoCaminho = gerarCaminhoLetra(palavra.letras[letraAtual]);
      console.log('Novo caminho gerado:', novoCaminho);
      setCaminhoCorreto(novoCaminho);

      // Aguardar o canvas ser renderizado
      setTimeout(() => {
        if (canvasRef.current) {
          console.log('Canvas encontrado, desenhando...');
          desenharNoCanvas();
        } else {
          console.log('Canvas ainda não encontrado');
        }
      }, 200);
    }
  }, [etapaAtual, palavra, letraAtual]);

  // Redesenhar quando o caminho correto muda
  useEffect(() => {
    if (caminhoCorreto.length > 0) {
      console.log('Caminho correto definido com', caminhoCorreto.length, 'pontos');

      // Tentar desenhar várias vezes até o canvas estar pronto
      const tentarDesenhar = (tentativas = 0) => {
        if (canvasRef.current) {
          console.log('Canvas encontrado na tentativa', tentativas + 1, '- desenhando...');
          desenharNoCanvas();
        } else if (tentativas < 10) {
          console.log('Canvas não encontrado, tentativa', tentativas + 1);
          setTimeout(() => tentarDesenhar(tentativas + 1), 100);
        } else {
          console.log('Canvas não encontrado após 10 tentativas');
        }
      };

      tentarDesenhar();
    }
  }, [caminhoCorreto]);

  // Função para gerar o caminho de uma letra
  const gerarCaminhoLetra = (letra) => {
    const caminhos = {
      'A': [
        // Letra A - perna esquerda subindo
        {x: 80, y: 170}, {x: 90, y: 140}, {x: 100, y: 110}, {x: 110, y: 80},
        {x: 120, y: 50}, {x: 130, y: 30}, {x: 140, y: 20}, {x: 150, y: 20},
        // Perna direita descendo
        {x: 160, y: 30}, {x: 170, y: 50}, {x: 180, y: 80}, {x: 190, y: 110},
        {x: 200, y: 140}, {x: 210, y: 170},
        // Barra horizontal do meio (sem levantar o "lápis")
        {x: 190, y: 110}, {x: 170, y: 110}, {x: 150, y: 110}, {x: 130, y: 110}, {x: 110, y: 110}
      ],
      'B': [
        // Letra B - linha vertical + duas curvas
        {x: 80, y: 170}, {x: 80, y: 150}, {x: 80, y: 130}, {x: 80, y: 110},
        {x: 80, y: 90}, {x: 80, y: 70}, {x: 80, y: 50}, {x: 80, y: 30},
        {x: 80, y: 20},
        // Primeira curva (superior)
        {x: 100, y: 20}, {x: 120, y: 20}, {x: 140, y: 25}, {x: 155, y: 35},
        {x: 165, y: 50}, {x: 160, y: 65}, {x: 150, y: 75}, {x: 130, y: 80},
        {x: 110, y: 85}, {x: 80, y: 90},
        // Segunda curva (inferior)
        {x: 110, y: 90}, {x: 130, y: 90}, {x: 150, y: 95}, {x: 170, y: 105},
        {x: 180, y: 120}, {x: 175, y: 135}, {x: 165, y: 150}, {x: 150, y: 160},
        {x: 130, y: 165}, {x: 110, y: 170}, {x: 80, y: 170}
      ],
      'C': [
        // Letra C - arco aberto para a direita
        {x: 190, y: 50}, {x: 175, y: 35}, {x: 155, y: 25}, {x: 135, y: 20},
        {x: 115, y: 20}, {x: 95, y: 25}, {x: 80, y: 35}, {x: 70, y: 50},
        {x: 65, y: 70}, {x: 65, y: 90}, {x: 65, y: 110}, {x: 70, y: 130},
        {x: 80, y: 145}, {x: 95, y: 155}, {x: 115, y: 160}, {x: 135, y: 160},
        {x: 155, y: 155}, {x: 175, y: 145}, {x: 190, y: 130}
      ],
      'O': [
        // Letra O - círculo completo
        {x: 150, y: 20}, {x: 125, y: 20}, {x: 105, y: 25}, {x: 90, y: 35},
        {x: 75, y: 50}, {x: 65, y: 70}, {x: 60, y: 90}, {x: 65, y: 110},
        {x: 75, y: 130}, {x: 90, y: 145}, {x: 105, y: 155}, {x: 125, y: 160},
        {x: 150, y: 160}, {x: 175, y: 155}, {x: 195, y: 145}, {x: 210, y: 130},
        {x: 220, y: 110}, {x: 225, y: 90}, {x: 220, y: 70}, {x: 210, y: 50},
        {x: 195, y: 35}, {x: 175, y: 25}, {x: 150, y: 20}
      ],
      'L': [
        // Letra L - linha vertical + linha horizontal
        {x: 80, y: 20}, {x: 80, y: 40}, {x: 80, y: 60}, {x: 80, y: 80},
        {x: 80, y: 100}, {x: 80, y: 120}, {x: 80, y: 140}, {x: 80, y: 160},
        {x: 80, y: 170}, {x: 100, y: 170}, {x: 120, y: 170}, {x: 140, y: 170},
        {x: 160, y: 170}, {x: 180, y: 170}, {x: 200, y: 170}
      ],
      'S': [
        // Letra S - curva em S
        {x: 190, y: 50}, {x: 170, y: 35}, {x: 145, y: 25}, {x: 120, y: 25},
        {x: 95, y: 30}, {x: 80, y: 45}, {x: 85, y: 60}, {x: 100, y: 70},
        {x: 120, y: 80}, {x: 140, y: 90}, {x: 155, y: 100}, {x: 165, y: 115},
        {x: 160, y: 130}, {x: 145, y: 145}, {x: 125, y: 155}, {x: 100, y: 160},
        {x: 75, y: 155}, {x: 55, y: 140}, {x: 45, y: 120}
      ],
      'G': [
        // Letra G - C com barra horizontal
        {x: 190, y: 50}, {x: 175, y: 35}, {x: 155, y: 25}, {x: 135, y: 20},
        {x: 115, y: 20}, {x: 95, y: 25}, {x: 80, y: 35}, {x: 70, y: 50},
        {x: 65, y: 70}, {x: 65, y: 90}, {x: 65, y: 110}, {x: 70, y: 130},
        {x: 80, y: 145}, {x: 95, y: 155}, {x: 115, y: 160}, {x: 135, y: 160},
        {x: 155, y: 155}, {x: 175, y: 145}, {x: 190, y: 130}, {x: 190, y: 110},
        {x: 170, y: 110}, {x: 150, y: 110}
      ],
      'T': [
        // Letra T - linha horizontal + linha vertical
        {x: 60, y: 30}, {x: 80, y: 30}, {x: 100, y: 30}, {x: 120, y: 30},
        {x: 140, y: 30}, {x: 160, y: 30}, {x: 180, y: 30}, {x: 200, y: 30},
        {x: 220, y: 30}, {x: 130, y: 30}, {x: 130, y: 50}, {x: 130, y: 70},
        {x: 130, y: 90}, {x: 130, y: 110}, {x: 130, y: 130}, {x: 130, y: 150},
        {x: 130, y: 170}
      ],
      'E': [
        // Letra E - linha vertical + três horizontais
        {x: 80, y: 20}, {x: 80, y: 40}, {x: 80, y: 60}, {x: 80, y: 80},
        {x: 80, y: 100}, {x: 80, y: 120}, {x: 80, y: 140}, {x: 80, y: 160},
        {x: 80, y: 170}, {x: 100, y: 170}, {x: 120, y: 170}, {x: 140, y: 170},
        {x: 160, y: 170}, {x: 180, y: 170}, {x: 80, y: 95}, {x: 100, y: 95},
        {x: 120, y: 95}, {x: 140, y: 95}, {x: 80, y: 20}, {x: 100, y: 20},
        {x: 120, y: 20}, {x: 140, y: 20}, {x: 160, y: 20}, {x: 180, y: 20}
      ],
      'U': [
        // Letra U - curva em U
        {x: 80, y: 20}, {x: 80, y: 40}, {x: 80, y: 60}, {x: 80, y: 80},
        {x: 80, y: 100}, {x: 80, y: 120}, {x: 80, y: 140}, {x: 85, y: 155},
        {x: 95, y: 165}, {x: 110, y: 170}, {x: 130, y: 170}, {x: 150, y: 170},
        {x: 170, y: 165}, {x: 185, y: 155}, {x: 190, y: 140}, {x: 190, y: 120},
        {x: 190, y: 100}, {x: 190, y: 80}, {x: 190, y: 60}, {x: 190, y: 40},
        {x: 190, y: 20}
      ],
      'F': [
        // Letra F - linha vertical + duas horizontais
        {x: 80, y: 170}, {x: 80, y: 150}, {x: 80, y: 130}, {x: 80, y: 110},
        {x: 80, y: 90}, {x: 80, y: 70}, {x: 80, y: 50}, {x: 80, y: 30},
        {x: 80, y: 20}, {x: 100, y: 20}, {x: 120, y: 20}, {x: 140, y: 20},
        {x: 160, y: 20}, {x: 180, y: 20}, {x: 80, y: 95}, {x: 100, y: 95},
        {x: 120, y: 95}, {x: 140, y: 95}, {x: 160, y: 95}
      ],
      'M': [
        // Letra M - duas linhas verticais + V no meio
        {x: 70, y: 170}, {x: 70, y: 150}, {x: 70, y: 130}, {x: 70, y: 110},
        {x: 70, y: 90}, {x: 70, y: 70}, {x: 70, y: 50}, {x: 70, y: 30},
        {x: 70, y: 20}, {x: 85, y: 35}, {x: 100, y: 50}, {x: 115, y: 65},
        {x: 130, y: 80}, {x: 145, y: 65}, {x: 160, y: 50}, {x: 175, y: 35},
        {x: 190, y: 20}, {x: 190, y: 30}, {x: 190, y: 50}, {x: 190, y: 70},
        {x: 190, y: 90}, {x: 190, y: 110}, {x: 190, y: 130}, {x: 190, y: 150},
        {x: 190, y: 170}
      ],
      'Í': [
        // Letra Í - linha vertical + acento
        {x: 130, y: 170}, {x: 130, y: 150}, {x: 130, y: 130}, {x: 130, y: 110},
        {x: 130, y: 90}, {x: 130, y: 70}, {x: 130, y: 50}, {x: 130, y: 30},
        {x: 130, y: 20}, {x: 125, y: 10}, {x: 135, y: 10}
      ],
      'R': [
        // Letra R - linha vertical + P + diagonal
        {x: 80, y: 170}, {x: 80, y: 150}, {x: 80, y: 130}, {x: 80, y: 110},
        {x: 80, y: 90}, {x: 80, y: 70}, {x: 80, y: 50}, {x: 80, y: 30},
        {x: 80, y: 20}, {x: 100, y: 20}, {x: 120, y: 20}, {x: 140, y: 25},
        {x: 155, y: 35}, {x: 165, y: 50}, {x: 160, y: 65}, {x: 150, y: 75},
        {x: 130, y: 80}, {x: 110, y: 85}, {x: 80, y: 90}, {x: 110, y: 90},
        {x: 130, y: 105}, {x: 150, y: 125}, {x: 170, y: 145}, {x: 190, y: 170}
      ],
      'N': [
        // Letra N - duas verticais + diagonal
        {x: 80, y: 170}, {x: 80, y: 150}, {x: 80, y: 130}, {x: 80, y: 110},
        {x: 80, y: 90}, {x: 80, y: 70}, {x: 80, y: 50}, {x: 80, y: 30},
        {x: 80, y: 20}, {x: 95, y: 35}, {x: 110, y: 50}, {x: 125, y: 65},
        {x: 140, y: 80}, {x: 155, y: 95}, {x: 170, y: 110}, {x: 185, y: 125},
        {x: 200, y: 140}, {x: 200, y: 120}, {x: 200, y: 100}, {x: 200, y: 80},
        {x: 200, y: 60}, {x: 200, y: 40}, {x: 200, y: 20}
      ]
    };

    return caminhos[letra.toUpperCase()] || [
      {x: 150, y: 50}, {x: 150, y: 70}, {x: 150, y: 90}, {x: 150, y: 110}, {x: 150, y: 130}
    ];
  };

  const iniciarContorno = (indiceLetra) => {
    setLetraAtual(indiceLetra);
    setEtapaAtual('contorno');
    setDesenhando(false);
    setPontos([]);
    setProgresso(0);
    setDesenhoUsuario([]);
    setPontoAtual(0);

    // Desenhar imediatamente
    if (palavra.letras?.[indiceLetra]) {
      setCaminhoCorreto(gerarCaminhoLetra(palavra.letras[indiceLetra]));
    }
  };

  const completarLetra = () => {
    setTentativas(prev => prev + 1);
    setAcertos(prev => prev + 1);
    setDesenhando(false);
    setAnimacao('success');

    if (letraAtual < palavra.letras.length - 1) {
      setLetraAtual(prev => prev + 1);
      setPontos([]);
      setProgresso(0);
    } else {
      // Todas as letras completadas
      if (etapaAtual === 'traco') {
        setEtapaAtual('contorno');
        setLetraAtual(0);
      } else if (etapaAtual === 'contorno') {
        setEtapaAtual('escrita');
        setLetraAtual(0);
      } else {
        handleResposta('acerto');
      }
    }
    setAnimacao('');
  };

  // Função para calcular distância entre dois pontos
  const calcularDistancia = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Função para verificar se o ponto está próximo do caminho correto
  const verificarCaminhoCorreto = (pontoUsuario) => {
    if (caminhoCorreto.length === 0) return false;

    const tolerancia = 30; // pixels de tolerância
    const pontoEsperado = caminhoCorreto[pontoAtual];

    if (pontoEsperado) {
      const distancia = calcularDistancia(pontoUsuario, pontoEsperado);
      return distancia <= tolerancia;
    }
    return false;
  };



  const handleMouseDown = (e) => {
    if (etapaAtual !== 'contorno') return;

    setDesenhando(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const novoPonto = { x, y };
    setDesenhoUsuario([novoPonto]);

    // Verificar se começou próximo ao primeiro ponto do caminho
    if (caminhoCorreto.length > 0) {
      const distanciaInicio = calcularDistancia(novoPonto, caminhoCorreto[0]);
      if (distanciaInicio <= 40) {
        setPontoAtual(1);
        setProgresso(5);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!desenhando || etapaAtual !== 'contorno') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const novoPonto = { x, y };

    setDesenhoUsuario(prev => [...prev, novoPonto]);

    // Verificar se está seguindo o caminho correto
    if (verificarCaminhoCorreto(novoPonto)) {
      setPontoAtual(prev => {
        const novoValor = Math.min(prev + 1, caminhoCorreto.length - 1);
        const novoProgresso = (novoValor / caminhoCorreto.length) * 100;
        setProgresso(novoProgresso);
        return novoValor;
      });
    }

    // Desenhar no canvas
    desenharNoCanvas();
  };

  const handleMouseUp = () => {
    setDesenhando(false);

    if (progresso >= 80) {
      setAnimacao('success');
      if (letraAtual < palavra.letras.length - 1) {
        setLetraAtual(prev => prev + 1);
        setDesenhoUsuario([]);
        setPontoAtual(0);
        setProgresso(0);
      } else {
        // Todas as letras completadas - avançar para próxima etapa
        if (etapaAtual === 'contorno') {
          setEtapaAtual('escrita');
          setLetraAtual(0);
        } else {
          handleResposta('acerto');
        }
      }
      setAnimacao('');
    }
  };



  const handleResposta = (resultado) => {
    setAnimacao('fadeOut');
    onResposta(resultado);
  };

  const renderEtapaTraco = () => (
    <>
      <div style={estiloTitulo}>✏️ Trace as Letras</div>
      <div style={estiloInstrucao}>
        Trace por cima das letras pontilhadas da palavra: <strong>{palavra.palavra}</strong>
      </div>

      <div style={estiloLetraGrande}>
        {palavra.letras?.[letraAtual]}
      </div>

      <div style={estiloAreaTraco}>
        <svg
          ref={svgRef}
          width="300"
          height="200"
          style={{ border: '2px dashed #ff9800', borderRadius: '10px', backgroundColor: '#fff' }}
        >
          {/* Letra pontilhada para traçar */}
          <text
            x="150"
            y="120"
            fontSize="120"
            textAnchor="middle"
            fill="none"
            stroke="#ff9800"
            strokeWidth="3"
            strokeDasharray="10,5"
            opacity="0.5"
          >
            {palavra.letras?.[letraAtual]}
          </text>

          {/* Traço do usuário */}
          {pontos.length > 1 && (
            <polyline
              points={pontos.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#007bff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>

      <div style={estiloProgresso}>
        <div style={{
          width: `${progresso}%`,
          height: '100%',
          backgroundColor: '#28a745',
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      <div style={estiloInfoLetra}>
        Letra {letraAtual + 1} de {palavra.letras?.length} - {Math.round(progresso)}% completo
      </div>

      <button
        onClick={completarLetra}
        disabled={progresso < 50}
        style={{
          ...estiloBotaoContinuar,
          opacity: progresso < 50 ? 0.5 : 1,
          cursor: progresso < 50 ? 'not-allowed' : 'pointer'
        }}
      >
        ✓ Próxima Letra
      </button>
    </>
  );

  const renderEtapaContorno = () => (
    <>
      <div style={estiloTitulo}>🖊️ Contorne as Letras</div>
      <div style={estiloInstrucao}>
        Siga o caminho cinza com seu dedo ou mouse. Comece pelo ponto verde! 🟢
      </div>

      <div style={estiloLetraGrande}>
        {palavra.letras?.[letraAtual]}
      </div>

      <canvas
        ref={canvasRef}
        width="300"
        height="200"
        style={{
          border: '3px solid #007bff',
          borderRadius: '15px',
          backgroundColor: '#f8f9ff',
          cursor: desenhando ? 'crosshair' : 'pointer',
          marginBottom: '20px',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          handleMouseDown(mouseEvent);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          handleMouseMove(mouseEvent);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleMouseUp();
        }}
      />

      <div style={estiloProgresso}>
        <div style={{
          width: `${progresso}%`,
          height: '100%',
          backgroundColor: '#007bff',
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      <div style={estiloInfoLetra}>
        Letra {letraAtual + 1} de {palavra.letras?.length} - {Math.round(progresso)}% completo
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={() => {
            setDesenhoUsuario([]);
            setPontoAtual(0);
            setProgresso(0);
            desenharNoCanvas();
          }}
          style={estiloBotaoSecundario}
        >
          🗑️ Limpar
        </button>
        <button
          onClick={completarLetra}
          disabled={progresso < 80}
          style={{
            ...estiloBotaoContinuar,
            opacity: progresso < 80 ? 0.5 : 1,
            cursor: progresso < 80 ? 'not-allowed' : 'pointer'
          }}
        >
          ✓ Próxima Letra
        </button>
      </div>
    </>
  );

  const renderEtapaEscrita = () => (
    <>
      <div style={estiloTitulo}>📝 Escreva a Palavra</div>
      <div style={estiloInstrucao}>
        Escreva a palavra completa: <strong>{palavra.palavra}</strong>
      </div>

      <div style={estiloAreaEscrita}>
        <input
          type="text"
          placeholder="Digite a palavra aqui..."
          style={estiloInputEscrita}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.toUpperCase() === palavra.palavra) {
              handleResposta('acerto');
            }
          }}
        />
      </div>

      <div style={estiloSilabas}>
        {palavra.silabas?.map((silaba, index) => (
          <div key={index} style={estiloDicaSilaba}>
            {silaba}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '16px', color: '#666' }}>
          💡 Dica: {palavra.contexto}
        </p>
      </div>

      <button
        onClick={() => handleResposta('acerto')}
        style={estiloBotaoConcluir}
      >
        ✓ Concluir Atividade
      </button>
    </>
  );

  const estiloContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    backgroundColor: '#fff3e0',
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

  const estiloLetraGrande = {
    fontSize: '80px',
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const estiloAreaTraco = {
    marginBottom: '20px'
  };

  const estiloInfoLetra = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const estiloProgresso = {
    width: '300px',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    marginBottom: '15px',
    overflow: 'hidden'
  };

  const estiloBotaoContinuar = {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const estiloBotaoSecundario = {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const estiloAreaEscrita = {
    marginBottom: '30px'
  };

  const estiloInputEscrita = {
    width: '300px',
    padding: '15px',
    fontSize: '24px',
    textAlign: 'center',
    border: '3px solid #ff9800',
    borderRadius: '10px',
    outline: 'none',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  const estiloSilabas = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  };

  const estiloDicaSilaba = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '2px solid #ff9800'
  };

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



  const estiloPalavra = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const estiloAreaContorno = {
    width: '400px',
    height: '300px',
    border: '3px dashed #ff9800',
    borderRadius: '15px',
    position: 'relative',
    backgroundColor: 'white',
    cursor: desenhando ? 'crosshair' : 'pointer',
    marginBottom: '20px'
  };

  const estiloCanvas = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
  };

  const estiloLetraGuia = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '120px',
    fontWeight: 'bold',
    color: '#ffcc80',
    opacity: 0.3,
    pointerEvents: 'none',
    fontFamily: 'Arial, sans-serif'
  };



  const estiloBarraProgresso = {
    height: '100%',
    backgroundColor: progresso >= 80 ? '#4caf50' : '#ff9800',
    width: `${progresso}%`,
    transition: 'all 0.3s ease',
    borderRadius: '5px'
  };

  const estiloLetrasLista = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  const estiloLetraItem = (index, ativo) => ({
    fontSize: '24px',
    fontWeight: 'bold',
    color: ativo ? 'white' : '#ff9800',
    backgroundColor: ativo ? '#ff9800' : '#fff3e0',
    padding: '10px 15px',
    borderRadius: '10px',
    border: '2px solid #ff9800',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: index < letraAtual ? 0.5 : 1
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
            0% { background-color: #fff3e0; }
            50% { background-color: #d4edda; }
            100% { background-color: #fff3e0; }
          }
          @keyframes error {
            0% { background-color: #fff3e0; }
            25% { background-color: #f8d7da; }
            50% { background-color: #fff3e0; }
            75% { background-color: #f8d7da; }
            100% { background-color: #fff3e0; }
          }
        `}
      </style>

      {/* Renderizar etapa atual */}
      {etapaAtual === 'traco' && renderEtapaTraco()}
      {etapaAtual === 'contorno' && renderEtapaContorno()}
      {etapaAtual === 'escrita' && renderEtapaEscrita()}

      {/* Botões de controle */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button
          onClick={() => handleResposta('acerto')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✓ Concluir
        </button>

      </div>
    </div>
  );
}
