/**
 * Hook personalizado para adaptabilidade com métodos derivados
 */

import { useContext, useMemo } from 'react';
import { AdaptabilidadeContext } from '../contexts/AdaptabilidadeContext';
import { obterMetricasPorTipo, obterMetricasGerais } from '../services/metricsService';
import { TIPO_ESTIMULO } from '../services/adaptacoesService';
import { useAuth } from '../contexts/AuthContext';

export const useAdaptabilidade = () => {
  const context = useContext(AdaptabilidadeContext);
  const { usuario } = useAuth();

  if (!context) {
    throw new Error('useAdaptabilidade deve ser usado dentro de um AdaptabilidadeProvider');
  }

  const { perfilUsuario, registrarResposta, obterConfiguracao, resetarPerfil } = context;

  // Métricas calculadas em tempo real
  const metricas = useMemo(() => {
    if (!usuario?.id) {
      return { porTipo: {}, gerais: {} };
    }

    return {
      porTipo: obterMetricasPorTipo(usuario.id),
      gerais: obterMetricasGerais(usuario.id)
    };
  }, [perfilUsuario?.historico, usuario?.id]);

  // Métodos derivados para facilitar uso nos componentes
  const metodosDerivados = useMemo(() => ({
    
    /**
     * Obtém taxa de acerto por tipo de estímulo
     * @param {string} tipo - Tipo do estímulo
     * @returns {number} Taxa de acerto (0-100)
     */
    getTaxaDeAcerto: (tipo) => {
      if (!Object.values(TIPO_ESTIMULO).includes(tipo)) {
        console.warn(`Tipo de estímulo inválido: ${tipo}`);
        return 0;
      }
      return metricas.porTipo[tipo]?.taxaAcerto || 0;
    },

    /**
     * Obtém tempo médio de resposta por tipo
     * @param {string} tipo - Tipo do estímulo
     * @returns {number} Tempo médio em segundos
     */
    getTempoMedio: (tipo) => {
      if (!Object.values(TIPO_ESTIMULO).includes(tipo)) {
        console.warn(`Tipo de estímulo inválido: ${tipo}`);
        return 0;
      }
      const tempo = metricas.porTipo[tipo]?.tempoMedio || 0;
      return tempo / 1000; // Converter para segundos
    },

    /**
     * Obtém estatísticas gerais do usuário
     * @returns {Object} Estatísticas consolidadas
     */
    getEstatisticasGerais: () => ({
      totalRespostas: metricas.gerais.total || 0,
      taxaAcertoGeral: metricas.gerais.taxaAcerto || 0,
      tempoMedioGeral: (metricas.gerais.tempoMedio || 0) / 1000,
      melhorTipo: metricas.gerais.melhorTipo,
      piorTipo: metricas.gerais.piorTipo,
      tendencia: metricas.gerais.tendenciaGeral || 'estavel',
      nivelAtual: perfilUsuario.nivelDificuldade,
      adaptacaoAtiva: perfilUsuario.adaptacoes?.adaptacaoAtiva || false
    }),

    /**
     * Verifica se o usuário tem dificuldade com um tipo específico
     * @param {string} tipo - Tipo do estímulo
     * @returns {boolean} Se tem dificuldade
     */
    temDificuldadeCom: (tipo) => {
      const taxa = metodosDerivados.getTaxaDeAcerto(tipo);
      const total = metricas.porTipo[tipo]?.total || 0;
      return total >= 3 && taxa < 50; // Pelo menos 3 tentativas e menos de 50% de acerto
    },

    /**
     * Verifica se o usuário é proficiente com um tipo específico
     * @param {string} tipo - Tipo do estímulo
     * @returns {boolean} Se é proficiente
     */
    ehProficienteEm: (tipo) => {
      const taxa = metodosDerivados.getTaxaDeAcerto(tipo);
      const total = metricas.porTipo[tipo]?.total || 0;
      return total >= 5 && taxa >= 80; // Pelo menos 5 tentativas e mais de 80% de acerto
    },

    /**
     * Obtém recomendação de próximo tipo de atividade
     * @returns {string} Tipo recomendado
     */
    getProximoTipoRecomendado: () => {
      const tipos = Object.values(TIPO_ESTIMULO);
      
      // Priorizar tipo com menos tentativas (balanceamento)
      const tipoMenosTentativas = tipos.reduce((menor, tipo) => {
        const totalAtual = metricas.porTipo[tipo]?.total || 0;
        const totalMenor = metricas.porTipo[menor]?.total || 0;
        return totalAtual < totalMenor ? tipo : menor;
      });
      
      // Se há desequilíbrio significativo, retornar o menos praticado
      const maxTentativas = Math.max(...tipos.map(t => metricas.porTipo[t]?.total || 0));
      const minTentativas = metricas.porTipo[tipoMenosTentativas]?.total || 0;
      
      if (maxTentativas - minTentativas > 3) {
        return tipoMenosTentativas;
      }
      
      // Caso contrário, priorizar tipo com pior performance
      if (metricas.gerais.piorTipo) {
        return metricas.gerais.piorTipo.tipo;
      }
      
      // Fallback: tipo aleatório
      return tipos[Math.floor(Math.random() * tipos.length)];
    },

    /**
     * Verifica se deve aumentar dificuldade
     * @returns {boolean} Se deve aumentar
     */
    deveAumentarDificuldade: () => {
      const estatisticas = metodosDerivados.getEstatisticasGerais();
      return (
        estatisticas.totalRespostas >= 10 &&
        estatisticas.taxaAcertoGeral >= 85 &&
        estatisticas.tendencia === 'melhorando' &&
        perfilUsuario.nivelDificuldade !== 'dificil'
      );
    },

    /**
     * Verifica se deve diminuir dificuldade
     * @returns {boolean} Se deve diminuir
     */
    deveDiminuirDificuldade: () => {
      const estatisticas = metodosDerivados.getEstatisticasGerais();
      return (
        estatisticas.totalRespostas >= 10 &&
        estatisticas.taxaAcertoGeral <= 40 &&
        estatisticas.tendencia === 'piorando' &&
        perfilUsuario.nivelDificuldade !== 'facil'
      );
    },

    /**
     * Obtém configuração otimizada para um tipo específico
     * @param {string} tipo - Tipo do estímulo
     * @returns {Object} Configuração otimizada
     */
    getConfiguracaoOtimizada: (tipo) => {
      const configBase = obterConfiguracao(tipo);
      const metricaTipo = metricas.porTipo[tipo];
      
      if (!metricaTipo || metricaTipo.total < 3) {
        return configBase; // Dados insuficientes, usar configuração padrão
      }
      
      // Otimizar baseado na performance específica do tipo
      const otimizacoes = {};
      
      // Ajustar tempo baseado na mediana (mais robusta)
      if (metricaTipo.tempoMediano > 0) {
        otimizacoes.tempoResposta = Math.max(3000, Math.min(15000, metricaTipo.tempoMediano * 1.2));
      }
      
      // Ajustar ajudas baseado na taxa de acerto específica
      otimizacoes.ajudaVisual = metricaTipo.taxaAcerto < 60;
      otimizacoes.feedbackDetalhado = metricaTipo.taxaAcerto < 70;
      
      // Ajustar tentativas baseado na média específica
      if (metricaTipo.tentativasMedias > 0) {
        otimizacoes.tentativasMaximas = Math.max(2, Math.min(6, Math.ceil(metricaTipo.tentativasMedias * 1.1)));
      }
      
      return {
        ...configBase,
        ...otimizacoes,
        otimizado: true,
        baseDados: metricaTipo.total
      };
    },

    /**
     * Obtém insights personalizados para o usuário
     * @returns {Array} Lista de insights
     */
    getInsightsPersonalizados: () => {
      const insights = [];
      const estatisticas = metodosDerivados.getEstatisticasGerais();
      
      // Insight sobre progresso geral
      if (estatisticas.totalRespostas === 0) {
        insights.push({
          tipo: 'boas-vindas',
          icone: '👋',
          titulo: 'Bem-vindo!',
          descricao: 'Comece respondendo algumas atividades para que eu possa me adaptar ao seu estilo de aprendizado.'
        });
      } else if (estatisticas.totalRespostas < 10) {
        insights.push({
          tipo: 'coleta-dados',
          icone: '📊',
          titulo: 'Aprendendo sobre você',
          descricao: `Já coletei ${estatisticas.totalRespostas} respostas. Continue praticando para adaptações mais precisas!`
        });
      }
      
      // Insight sobre melhor tipo
      if (estatisticas.melhorTipo) {
        insights.push({
          tipo: 'ponto-forte',
          icone: '🌟',
          titulo: 'Seu ponto forte',
          descricao: `Você se destaca em atividades ${estatisticas.melhorTipo.tipo} com ${estatisticas.melhorTipo.taxaAcerto.toFixed(1)}% de acerto!`
        });
      }
      
      // Insight sobre área de melhoria
      if (estatisticas.piorTipo && estatisticas.piorTipo.taxaAcerto < 60) {
        insights.push({
          tipo: 'area-melhoria',
          icone: '🎯',
          titulo: 'Área para desenvolver',
          descricao: `Pratique mais atividades ${estatisticas.piorTipo.tipo} para equilibrar seu aprendizado.`
        });
      }
      
      // Insight sobre tendência
      if (estatisticas.tendencia === 'melhorando') {
        insights.push({
          tipo: 'progresso',
          icone: '📈',
          titulo: 'Progresso detectado!',
          descricao: 'Suas respostas estão ficando mais rápidas e precisas. Continue assim!'
        });
      }
      
      return insights;
    }

  }), [metricas, perfilUsuario]);

  // Retornar contexto original + métodos derivados
  return {
    // Contexto original
    perfilUsuario,
    registrarResposta,
    obterConfiguracao,
    resetarPerfil,
    
    // Métricas calculadas
    metricas,
    
    // Métodos derivados
    ...metodosDerivados
  };
};
