import { useState, useEffect } from 'react';
import { useAdaptabilidade } from '../hooks/useAdaptabilidade';
import EstimuloVisualPalavra from './EstimuloVisualPalavra';
import EstimuloAuditivoPalavra from './EstimuloAuditivoPalavra';
import EstimuloTatilPalavra from './EstimuloTatilPalavra';

export default function FaseAprendizado({ palavra, onConcluirFase, onVoltarTrilha }) {
  const { registrarResposta, obterConfiguracao } = useAdaptabilidade();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [tentativas, setTentativas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [estimuloAtual, setEstimuloAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inicioResposta, setInicioResposta] = useState(Date.now());

  const etapas = [
    { tipo: 'visual', nome: 'Reconhecimento Visual', emoji: '👁️', cor: '#4CAF50' },
    { tipo: 'auditivo', nome: 'Escuta Ativa', emoji: '👂', cor: '#2196F3' },
    { tipo: 'tatil', nome: 'Escrita Tátil', emoji: '✏️', cor: '#FF9800' }
  ];

  useEffect(() => {
    carregarEstimulo();
  }, [etapaAtual]);

  const carregarEstimulo = async () => {
    setLoading(true);
    try {
      // Comentado temporariamente para evitar erros de API
      // const response = await fetch('/api/next-stimulus', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     sessionId: Date.now(), // Sessão única para esta fase
      //     tipoPreferido: etapas[etapaAtual].tipo,
      //     palavraEspecifica: palavra.palavra
      //   })
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   setEstimuloAtual(data.proximoEstimulo);
      // } else {
        // Fallback: criar estímulo básico se a API falhar
        setEstimuloAtual({
          palavra: palavra.palavra,
          categoria: 'geral',
          contexto: `Esta é a palavra ${palavra.palavra}`,
          silabas: palavra.palavra.match(/.{1,2}/g) || [palavra.palavra],
          letras: palavra.palavra.split(''),
          visual: {
            cores: ['#4CAF50', '#2196F3', '#FF9800']
          }
        });
      // }
    } catch (error) {
      console.error('Erro ao carregar estímulo:', error);
      // Fallback em caso de erro
      setEstimuloAtual({
        palavra: palavra.palavra,
        categoria: 'geral',
        contexto: `Esta é a palavra ${palavra.palavra}`,
        silabas: palavra.palavra.match(/.{1,2}/g) || [palavra.palavra],
        letras: palavra.palavra.split(''),
        visual: {
          cores: ['#4CAF50', '#2196F3', '#FF9800']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResposta = async (resultado) => {
    const novasTentativas = tentativas + 1;
    const novosAcertos = resultado === 'acerto' ? acertos + 1 : acertos;
    const tempoResposta = Date.now() - inicioResposta;

    setTentativas(novasTentativas);
    setAcertos(novosAcertos);

    // Registrar resposta no sistema de adaptabilidade
    const tipoEstimulo = etapas[etapaAtual].tipo;
    registrarResposta(tipoEstimulo, resultado, tempoResposta, novasTentativas);

    // Resetar timer para próxima resposta
    setInicioResposta(Date.now());

    // Registrar resposta no backend (comentado temporariamente)
    try {
      console.log('📝 Resposta registrada:', {
        tipo: tipoEstimulo,
        resultado,
        tempo: tempoResposta,
        tentativas: novasTentativas,
        adaptabilidade: 'ativa'
      });
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
    }

    // Calcular pontuação
    if (resultado === 'acerto') {
      setPontuacao(prev => prev + 100);
    }

    // Verificar se deve avançar para próxima etapa
    if (novosAcertos >= 2) { // 2 acertos para passar de etapa
      if (etapaAtual < etapas.length - 1) {
        // Próxima etapa
        setEtapaAtual(prev => prev + 1);
        setTentativas(0);
        setAcertos(0);
      } else {
        // Fase concluída
        const estrelas = calcularEstrelas(pontuacao, tentativas);
        onConcluirFase({
          palavra: palavra.palavra,
          pontuacao,
          estrelas,
          tentativas: novasTentativas,
          acertos: novosAcertos
        });
      }
    } else if (resultado === 'erro') {
      // Só recarregar estímulo em caso de erro
      carregarEstimulo();
    }
    // Se foi acerto mas ainda não tem 2 acertos, continuar com o mesmo estímulo
  };

  const calcularEstrelas = (pontos, tentativasTotal) => {
    const eficiencia = pontos / (tentativasTotal * 100);
    if (eficiencia >= 0.8) return 3;
    if (eficiencia >= 0.6) return 2;
    return 1;
  };

  const renderEstimulo = () => {
    if (!estimuloAtual) return null;

    const props = {
      palavra: estimuloAtual,
      onResposta: handleResposta
    };

    switch (etapas[etapaAtual]?.tipo) {
      case 'visual':
        return <EstimuloVisualPalavra {...props} />;
      case 'auditivo':
        return <EstimuloAuditivoPalavra {...props} />;
      case 'tatil':
        return <EstimuloTatilPalavra {...props} />;
      default:
        return null;
    }
  };

  const estiloContainer = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${etapas[etapaAtual]?.cor || '#4CAF50'}dd, ${etapas[etapaAtual]?.cor || '#4CAF50'}aa)`,
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    color: 'white'
  };

  const estiloProgresso = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  const estiloEtapa = (index) => ({
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    backgroundColor: index <= etapaAtual ? 'white' : 'rgba(255,255,255,0.3)',
    transition: 'all 0.3s ease'
  });

  const estiloInfoEtapa = {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'white'
  };

  const estiloStats = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '20px'
  };

  const estiloStat = {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '10px 20px',
    borderRadius: '15px',
    color: 'white',
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  };

  if (loading) {
    return (
      <div style={{...estiloContainer, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: 'white', fontSize: '24px', textAlign: 'center'}}>
          <div style={{fontSize: '48px', marginBottom: '20px'}}>🔄</div>
          <div>Preparando atividade...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={estiloContainer}>
      {/* Header */}
      <div style={estiloHeader}>
        <button
          onClick={onVoltarTrilha}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Voltar à Trilha
        </button>
        
        <div style={{textAlign: 'center'}}>
          <h1 style={{margin: 0, fontSize: '32px'}}>
            {palavra.emoji || '📝'} {palavra.palavra}
          </h1>
        </div>
        
        <div style={{fontSize: '24px', fontWeight: 'bold'}}>
          {pontuacao} pts
        </div>
      </div>

      {/* Barra de Progresso */}
      <div style={estiloProgresso}>
        {etapas.map((_, index) => (
          <div key={index} style={estiloEtapa(index)}></div>
        ))}
      </div>

      {/* Info da Etapa Atual */}
      <div style={estiloInfoEtapa}>
        <div style={{fontSize: '48px', marginBottom: '10px'}}>
          {etapas[etapaAtual]?.emoji || '🎯'}
        </div>
        <h2 style={{margin: '0 0 10px 0', fontSize: '28px'}}>
          {etapas[etapaAtual]?.nome || 'Carregando...'}
        </h2>
        <p style={{margin: 0, fontSize: '16px', opacity: 0.9}}>
          Etapa {etapaAtual + 1} de {etapas.length}
        </p>
      </div>

      {/* Stats */}
      <div style={estiloStats}>
        <div style={estiloStat}>
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>{acertos}</div>
          <div style={{fontSize: '12px', opacity: 0.8}}>Acertos</div>
        </div>
        <div style={estiloStat}>
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>{tentativas}</div>
          <div style={{fontSize: '12px', opacity: 0.8}}>Tentativas</div>
        </div>
        <div style={estiloStat}>
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>
            {tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0}%
          </div>
          <div style={{fontSize: '12px', opacity: 0.8}}>Precisão</div>
        </div>
      </div>

      {/* Estímulo */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        {renderEstimulo()}
      </div>
    </div>
  );
}
