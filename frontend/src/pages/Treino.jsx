import { useState } from 'react';
import axios from 'axios';
import EstimuloVisual from '../components/EstimuloVisual';
import EstimuloAuditivo from '../components/EstimuloAuditivo';
import EstimuloTatil from '../components/EstimuloTatil';
import EstimuloVisualPalavra from '../components/EstimuloVisualPalavra';
import EstimuloAuditivoPalavra from '../components/EstimuloAuditivoPalavra';
import EstimuloTatilPalavra from '../components/EstimuloTatilPalavra';

export default function Treino() {
  const [sessaoId, setSessaoId] = useState(null);
  const [estimulo, setEstimulo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function iniciarSessao() {
    try {
      setCarregando(true);
      const res = await axios.post('http://localhost:3002/api/start-session');
      setSessaoId(res.data.sessionId);
      setEstimulo(res.data.estimuloInicial);
      setHistorico([]);
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err);
      alert('Erro ao iniciar sessão. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  async function responder(resultado) {
    try {
      setCarregando(true);
      const res = await axios.post('http://localhost:3002/api/submit-response', {
        sessionId: sessaoId,
        stimulusId: estimulo.id,
        stimulusType: estimulo.tipo,
        letter: estimulo.letra || estimulo.palavra, // Usar palavra se disponível
        result: resultado,
        timeSeconds: null, // TODO: implementar cronômetro
        payload: estimulo.palavra ? {
          palavra: estimulo.palavra,
          silabas: estimulo.silabas,
          categoria: estimulo.categoria
        } : null
      });

      // Adicionar ao histórico
      setHistorico(h => [...h, { ...estimulo, resultado }]);

      // Definir próximo estímulo
      setEstimulo(res.data.proximoEstimulo);
    } catch (err) {
      console.error('Erro ao responder:', err);
      alert('Erro ao registrar resposta.');
    } finally {
      setCarregando(false);
    }
  }

  // Função para renderizar o componente correto baseado no tipo de estímulo
  const renderizarEstimulo = () => {
    if (!estimulo) return <p style={{ textAlign: 'center', fontSize: '24px' }}>Treino finalizado! 🎉</p>;

    // Verificar se é um estímulo baseado em palavra (novo sistema)
    if (estimulo.palavra) {
      switch (estimulo.tipo) {
        case 'visual':
          return <EstimuloVisualPalavra palavra={estimulo} onResposta={responder} />;
        case 'auditivo':
          return <EstimuloAuditivoPalavra palavra={estimulo} onResposta={responder} />;
        case 'tatil':
          return <EstimuloTatilPalavra palavra={estimulo} onResposta={responder} />;
        default:
          return <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Tipo de estímulo não reconhecido</p>;
      }
    }

    // Fallback para estímulos antigos (sistema de letras)
    switch (estimulo.tipo) {
      case 'visual':
        return <EstimuloVisual estimulo={estimulo} onResposta={responder} />;
      case 'auditivo':
        return <EstimuloAuditivo estimulo={estimulo} onResposta={responder} />;
      case 'tatil':
        return <EstimuloTatil estimulo={estimulo} onResposta={responder} />;
      default:
        return <p>Tipo de estímulo não reconhecido: {estimulo.tipo}</p>;
    }
  };

  const estiloContainer = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloBotaoIniciar = {
    padding: '20px 40px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease'
  };

  const estiloHistorico = {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  return (
    <div style={estiloContainer}>
      {!sessaoId ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            🚀 Vamos Começar o Treino!
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Clique no botão abaixo para iniciar uma nova sessão de aprendizagem
          </p>
          <button
            style={estiloBotaoIniciar}
            onClick={iniciarSessao}
            disabled={carregando}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {carregando ? '⏳ Carregando...' : '🚀 Iniciar Sessão'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>
              📚 Sessão #{sessaoId}
            </h3>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              Progresso: {historico.length} respostas registradas
            </p>
          </div>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p style={{ fontSize: '20px', color: '#666' }}>Carregando próximo estímulo...</p>
            </div>
          ) : (
            renderizarEstimulo()
          )}

          {historico.length > 0 && (
            <div style={estiloHistorico}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>📊 Histórico da Sessão</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {historico.map((h, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    margin: '5px 0',
                    backgroundColor: h.resultado === 'acerto' ? '#d4edda' :
                                   h.resultado === 'erro' ? '#f8d7da' : '#e2e3e5',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${h.resultado === 'acerto' ? '#28a745' :
                                              h.resultado === 'erro' ? '#dc3545' : '#6c757d'}`
                  }}>
                    <strong>{h.tipo}</strong> - {h.letra}: {h.conteudo} →
                    <span style={{
                      fontWeight: 'bold',
                      color: h.resultado === 'acerto' ? '#155724' :
                             h.resultado === 'erro' ? '#721c24' : '#383d41'
                    }}>
                      {h.resultado === 'acerto' ? ' ✓ Acertou' :
                       h.resultado === 'erro' ? ' ✗ Errou' : ' ⏭ Pulou'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
