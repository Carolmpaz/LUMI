import { useState, useEffect } from 'react';
import { useProgresso } from '../contexts/ProgressoContext';

export default function MetricasUsuario({ usuario }) {
  const { progressoUsuario, fasesCompletas } = useProgresso();
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    carregarMetricas();
  }, [progressoUsuario, fasesCompletas]);

  const calcularMetricasPorTipo = () => {
    const metricasSalvas = JSON.parse(localStorage.getItem('metricasPorTipo') || '{}');
    const tipos = ['visual', 'auditivo', 'tatil'];
    const resultado = {};

    tipos.forEach(tipo => {
      const dados = metricasSalvas[tipo] || { total: 0, acertos: 0, tempoTotal: 0 };
      resultado[tipo] = {
        total: dados.total,
        acertos: dados.acertos,
        taxaAcerto: dados.total > 0 ? (dados.acertos / dados.total) * 100 : 0,
        tempoMedio: dados.total > 0 ? (dados.tempoTotal / dados.total) / 1000 : 0
      };
    });

    return resultado;
  };

  const carregarMetricas = async () => {
    try {
      setCarregando(true);

      // Gerar métricas baseadas no progresso local
      const fasesCompletasArray = Array.from(fasesCompletas);
      const totalFases = fasesCompletasArray.length;

      let totalPontuacao = 0;
      let totalTentativas = 0;
      let totalEstrelas = 0;

      fasesCompletasArray.forEach(palavra => {
        const progresso = progressoUsuario[palavra];
        if (progresso) {
          totalPontuacao += progresso.pontuacao || 0;
          totalTentativas += progresso.tentativas || 0;
          totalEstrelas += progresso.estrelas || 0;
        }
      });

      const metricasCalculadas = {
        totalEventos: totalFases,
        fasesCompletas: totalFases,
        pontuacaoTotal: totalPontuacao,
        tentativasTotal: totalTentativas,
        estrelasTotal: totalEstrelas,
        mediaEstrelas: totalFases > 0 ? (totalEstrelas / totalFases) : 0,
        taxaAcerto: totalTentativas > 0 ? ((totalFases * 2 / totalTentativas) * 100) : 0,
        progressoGeral: (totalFases / 6 * 100), // 6 fases total
        ultimaAtividade: fasesCompletasArray.length > 0 ? 'Hoje' : 'Nunca',
        metricasPorTipo: calcularMetricasPorTipo(),
        metricasPorLetra: {}
      };

      setMetricas(metricasCalculadas);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <p>Carregando métricas...</p>
      </div>
    );
  }

  if (!metricas || metricas.totalEventos === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
        <h3>Ainda não há dados suficientes</h3>
        <p>Complete algumas sessões de treino para ver suas métricas!</p>
      </div>
    );
  }

  const estiloContainer = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const estiloSelect = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px'
  };

  const estiloGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const estiloCard = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  const estiloMetrica = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px'
  };

  const estiloLabel = {
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const getCorPorcentagem = (valor) => {
    if (valor >= 80) return '#28a745';
    if (valor >= 60) return '#ffc107';
    return '#dc3545';
  };

  const formatarTempo = (segundos) => {
    const seg = Number(segundos) || 0;
    if (seg < 60) return `${seg.toFixed(1)}s`;
    const minutos = Math.floor(seg / 60);
    const restoSegundos = seg % 60;
    return `${minutos}m ${restoSegundos.toFixed(0)}s`;
  };

  return (
    <div style={estiloContainer}>
      <div style={estiloHeader}>
        <h2 style={{ margin: 0, color: '#333' }}>📊 Suas Métricas de Aprendizagem</h2>
        <select 
          value={periodo} 
          onChange={(e) => setPeriodo(parseInt(e.target.value))}
          style={estiloSelect}
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {/* Métricas Gerais */}
      <div style={estiloGrid}>
        <div style={estiloCard}>
          <div style={{ ...estiloMetrica, color: '#007bff' }}>
            {metricas.totalSessoes}
          </div>
          <div style={estiloLabel}>Sessões Realizadas</div>
        </div>

        <div style={estiloCard}>
          <div style={{ ...estiloMetrica, color: '#007bff' }}>
            {metricas.totalEventos}
          </div>
          <div style={estiloLabel}>Total de Respostas</div>
        </div>

        <div style={estiloCard}>
          <div style={{ ...estiloMetrica, color: getCorPorcentagem(metricas.taxaAcerto) }}>
            {(metricas.taxaAcerto || 0).toFixed(1)}%
          </div>
          <div style={estiloLabel}>Taxa de Acerto</div>
        </div>

        <div style={estiloCard}>
          <div style={{ ...estiloMetrica, color: '#6c757d' }}>
            {formatarTempo(metricas.tempoMedioResposta)}
          </div>
          <div style={estiloLabel}>Tempo Médio</div>
        </div>
      </div>

      {/* Métricas por Tipo de Estímulo */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>🎯 Desempenho por Tipo de Estímulo</h3>
        <div style={estiloGrid}>
          {Object.entries(metricas.metricasPorTipo || {}).map(([tipo, dados]) => (
            <div key={tipo} style={estiloCard}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                {tipo === 'visual' ? '👁️' : tipo === 'auditivo' ? '👂' : '👆'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'capitalize' }}>
                {tipo}
              </div>
              <div style={{ ...estiloMetrica, color: getCorPorcentagem(dados.taxaAcerto), fontSize: '24px' }}>
                {(dados.taxaAcerto || 0).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {dados.total} respostas • {formatarTempo(dados.tempoMedio)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas por Letra */}
      {Object.keys(metricas.metricasPorLetra || {}).length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>🔤 Progresso por Letra</h3>
          <div style={estiloGrid}>
            {Object.entries(metricas.metricasPorLetra || {}).map(([letra, dados]) => (
              <div key={letra} style={estiloCard}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {letra}
                </div>
                <div style={{ ...estiloMetrica, color: getCorPorcentagem(dados.taxaAcerto), fontSize: '24px' }}>
                  {(dados.taxaAcerto || 0).toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {dados.total} tentativas
                </div>
                {dados.tipoMaisEficaz && (
                  <div style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                    Melhor: {dados.tipoMaisEficaz.tipo} ({(dados.tipoMaisEficaz.taxaAcerto || 0).toFixed(1)}%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      {metricas.recomendacoes && metricas.recomendacoes.length > 0 && (
        <div>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>💡 Recomendações Personalizadas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {metricas.recomendacoes.map((rec, index) => (
              <div key={index} style={{
                backgroundColor: '#e8f4fd',
                padding: '15px',
                borderRadius: '10px',
                borderLeft: '4px solid #007bff'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                  {rec.titulo}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {rec.descricao}
                </div>
                <div style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold' }}>
                  💡 {rec.acao}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
