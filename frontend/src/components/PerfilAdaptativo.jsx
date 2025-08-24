import { useAdaptabilidade } from '../hooks/useAdaptabilidade';

export default function PerfilAdaptativo() {
  const { perfilUsuario } = useAdaptabilidade();

  const estiloContainer = {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #e9ecef'
  };

  const estiloHeader = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#495057'
  };

  const estiloMetrica = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e9ecef'
  };

  const estiloValor = {
    fontWeight: 'bold',
    color: '#007bff'
  };

  const estiloNivel = {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  const getNivelCor = (nivel) => {
    switch (nivel) {
      case 'facil':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'medio':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'dificil':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#e2e3e5', color: '#495057' };
    }
  };

  const getPreferenciaIcon = (valor) => {
    if (valor >= 1.2) return '🔥'; // Alta preferência
    if (valor >= 0.8) return '✅'; // Normal
    return '⚠️'; // Dificuldade
  };

  const formatarTempo = (ms) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div style={estiloContainer}>
      <div style={estiloHeader}>
        🧠 Perfil Adaptativo
      </div>

      <div style={estiloMetrica}>
        <span>Nível de Dificuldade:</span>
        <span style={{ ...estiloNivel, ...getNivelCor(perfilUsuario.nivelDificuldade) }}>
          {perfilUsuario.nivelDificuldade}
        </span>
      </div>

      <div style={estiloMetrica}>
        <span>Tempo de Resposta:</span>
        <span style={estiloValor}>
          {formatarTempo(perfilUsuario.adaptacoes.tempoResposta)}
        </span>
      </div>

      <div style={estiloMetrica}>
        <span>Tentativas Máximas:</span>
        <span style={estiloValor}>
          {perfilUsuario.adaptacoes.tentativasMaximas}
        </span>
      </div>

      <div style={{ marginTop: '15px', marginBottom: '10px', fontWeight: 'bold', color: '#495057' }}>
        Preferências de Estímulo:
      </div>

      <div style={estiloMetrica}>
        <span>👁️ Visual:</span>
        <span style={estiloValor}>
          {getPreferenciaIcon(perfilUsuario.preferenciasEstimulo.visual)} 
          {(perfilUsuario.preferenciasEstimulo.visual * 100).toFixed(0)}%
        </span>
      </div>

      <div style={estiloMetrica}>
        <span>🔊 Auditivo:</span>
        <span style={estiloValor}>
          {getPreferenciaIcon(perfilUsuario.preferenciasEstimulo.auditivo)} 
          {(perfilUsuario.preferenciasEstimulo.auditivo * 100).toFixed(0)}%
        </span>
      </div>

      <div style={estiloMetrica}>
        <span>✋ Tátil:</span>
        <span style={estiloValor}>
          {getPreferenciaIcon(perfilUsuario.preferenciasEstimulo.tatil)} 
          {(perfilUsuario.preferenciasEstimulo.tatil * 100).toFixed(0)}%
        </span>
      </div>

      <div style={{ marginTop: '15px', marginBottom: '10px', fontWeight: 'bold', color: '#495057' }}>
        Adaptações Ativas:
      </div>

      <div style={estiloMetrica}>
        <span>Ajuda Visual:</span>
        <span style={estiloValor}>
          {perfilUsuario.adaptacoes.ajudaVisual ? '✅ Ativa' : '❌ Inativa'}
        </span>
      </div>

      <div style={estiloMetrica}>
        <span>Feedback Detalhado:</span>
        <span style={estiloValor}>
          {perfilUsuario.adaptacoes.feedbackDetalhado ? '✅ Ativo' : '❌ Inativo'}
        </span>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
        📊 Histórico: {perfilUsuario.historico.length} respostas registradas
      </div>
    </div>
  );
}
