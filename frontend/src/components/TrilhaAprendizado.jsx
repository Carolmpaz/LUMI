import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgresso } from '../contexts/ProgressoContext';

export default function TrilhaAprendizado({ onIniciarFase, onAbrirDashboard }) {
  const { user } = useAuth();
  const { isFaseCompleta, getProgressoFase } = useProgresso();
  const [trilha, setTrilha] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTrilha();
  }, []);

  // Recarregar trilha quando o progresso mudar
  useEffect(() => {
    if (!loading) {
      carregarTrilha();
    }
  }, [isFaseCompleta, getProgressoFase]);

  const carregarTrilha = async () => {
    try {
      // Trilha padrão com progresso baseado no contexto
      const trilhaBase = [
        { id: 1, palavra: 'CASA', nivel: 1 },
        { id: 2, palavra: 'BOLA', nivel: 1 },
        { id: 3, palavra: 'GATO', nivel: 1 },
        { id: 4, palavra: 'ESCOLA', nivel: 2 },
        { id: 5, palavra: 'FAMÍLIA', nivel: 2 },
      ];

      // Aplicar progresso do contexto
      const trilhaComProgresso = trilhaBase.map((fase, index) => {
        const completa = isFaseCompleta(fase.palavra);
        const progresso = getProgressoFase(fase.palavra);

        // Primeira fase sempre desbloqueada
        let desbloqueada = index === 0;

        // Desbloquear se a fase anterior foi completa
        if (index > 0) {
          desbloqueada = isFaseCompleta(trilhaBase[index - 1].palavra);
        }

        return {
          ...fase,
          desbloqueada,
          completa,
          estrelas: progresso?.estrelas || 0
        };
      });

      setTrilha(trilhaComProgresso);
    } catch (error) {
      console.error('Erro ao carregar trilha:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarFase = (palavra) => {
    onIniciarFase(palavra);
  };

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

  const getCorNivel = (nivel) => {
    const cores = {
      1: '#4CAF50', // Verde
      2: '#FF9800', // Laranja
      3: '#9C27B0'  // Roxo
    };
    return cores[nivel] || '#757575';
  };

  const estiloContainer = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloHeader = {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'white'
  };

  const estiloTrilha = {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative'
  };

  const estiloLinha = {
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    height: '4px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    zIndex: 1
  };

  const estiloFase = (fase, index) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '80px',
    zIndex: 2,
    transform: index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)'
  });

  const estiloBotaoFase = (fase) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '40px',
    cursor: fase.desbloqueada ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    background: fase.desbloqueada 
      ? (fase.completa 
          ? `linear-gradient(135deg, ${getCorNivel(fase.nivel)}, ${getCorNivel(fase.nivel)}dd)`
          : 'linear-gradient(135deg, #fff, #f0f0f0)')
      : 'linear-gradient(135deg, #ccc, #999)',
    color: fase.desbloqueada ? (fase.completa ? 'white' : '#333') : '#666',
    transform: 'scale(1)',
    position: 'relative',
    overflow: 'hidden'
  });

  const estiloEstrelas = {
    display: 'flex',
    gap: '2px',
    marginTop: '8px'
  };

  const estiloInfoFase = {
    textAlign: 'center',
    marginTop: '10px',
    color: 'white'
  };

  const estiloBotaoDashboard = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 24px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  };

  if (loading) {
    return (
      <div style={{...estiloContainer, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: 'white', fontSize: '24px'}}>🔄 Carregando trilha...</div>
      </div>
    );
  }

  return (
    <div style={estiloContainer}>
      <style>
        {`
          .fase-hover:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 12px 30px rgba(0,0,0,0.4) !important;
          }
          .dashboard-hover:hover {
            background-color: rgba(255,255,255,0.3) !important;
            transform: translateY(-2px);
          }
          .estrela {
            font-size: 16px;
            color: #FFD700;
          }
          .estrela-vazia {
            font-size: 16px;
            color: rgba(255,255,255,0.3);
          }
        `}
      </style>

      {/* Botão Dashboard */}
      <button 
        className="dashboard-hover"
        style={estiloBotaoDashboard}
        onClick={onAbrirDashboard}
      >
        📊 Dashboard
      </button>

      {/* Header */}
<div style={estiloHeader}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '300px' }}>
    <img 
      src="public/logo.png" // <-- coloque aqui o caminho da sua logo
      alt="Logo" 
      style={{ width: '60px', height: '60px' }}
    />
    <h1 style={{ fontSize: '48px', margin: '10' }}>
      Trilha de Alfabetização
    </h1>
  </div>
  
  <p style={{ fontSize: '20px', margin: 0, opacity: 0.9 }}>
    Olá, {user?.nome || 'Pequeno Aprendiz'}! Complete cada fase para desbloquear a próxima
  </p>
</div>


      {/* Trilha */}
      <div style={estiloTrilha}>
        <div style={estiloLinha}></div>
        
        {trilha.map((fase, index) => (
          <div key={fase.id} style={estiloFase(fase, index)}>
            <button
              className={fase.desbloqueada ? "fase-hover" : ""}
              style={estiloBotaoFase(fase)}
              onClick={() => fase.desbloqueada && iniciarFase(fase)}
              disabled={!fase.desbloqueada}
            >
              {fase.desbloqueada ? getEmojiPalavra(fase.palavra) : '🔒'}
              
              {/* Efeito de brilho para fases completas */}
              {fase.completa && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#FFD700',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  ✓
                </div>
              )}
            </button>

            {/* Estrelas */}
            <div style={estiloEstrelas}>
              {[1, 2, 3].map(estrela => (
                <span 
                  key={estrela}
                  className={estrela <= (fase.estrelas || 0) ? "estrela" : "estrela-vazia"}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Info da fase */}
            <div style={estiloInfoFase}>
              <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '4px'}}>
                {fase.palavra}
              </div>
              <div style={{fontSize: '14px', opacity: 0.8}}>
                Nível {fase.nivel}
              </div>
              {!fase.desbloqueada && (
                <div style={{fontSize: '12px', opacity: 0.6, marginTop: '4px'}}>
                  Complete a fase anterior
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Mensagem de conclusão */}
        {trilha.every(fase => fase.completa) && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            marginTop: '40px'
          }}>
            <div style={{fontSize: '60px', marginBottom: '20px'}}>🎉</div>
            <h2 style={{color: 'white', margin: '0 0 10px 0'}}>Parabéns!</h2>
            <p style={{color: 'white', opacity: 0.9, margin: 0}}>
              Você completou toda a trilha de alfabetização!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
