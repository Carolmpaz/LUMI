/**
 * Serviço responsável pelo cálculo e agregação de métricas
 */

import { TIPO_ESTIMULO } from './adaptacoesService';
import { carregarMetricasPorTipo, salvarMetricasPorTipo } from './storageService';

/**
 * Registra uma nova resposta nas métricas
 * @param {string} tipoEstimulo - Tipo do estímulo
 * @param {string} resultado - Resultado da resposta
 * @param {number} tempoResposta - Tempo de resposta em ms
 * @param {number} tentativas - Número de tentativas
 * @param {string} userId - ID do usuário
 */
export const registrarMetrica = (tipoEstimulo, resultado, tempoResposta, tentativas, userId) => {
  try {
    const metricas = carregarMetricasPorTipo(userId);
    
    // Inicializar métricas do tipo se não existir
    if (!metricas[tipoEstimulo]) {
      metricas[tipoEstimulo] = criarMetricaVazia();
    }
    
    const metrica = metricas[tipoEstimulo];
    
    // Atualizar contadores
    metrica.total += 1;
    if (resultado === 'acerto') {
      metrica.acertos += 1;
    }
    
    // Atualizar tempos
    metrica.tempoTotal += tempoResposta;
    metrica.tempos.push(tempoResposta);
    
    // Manter apenas últimos 100 tempos para cálculos
    if (metrica.tempos.length > 100) {
      metrica.tempos = metrica.tempos.slice(-100);
    }
    
    // Atualizar tentativas
    metrica.tentativasTotal += tentativas;
    metrica.tentativas.push(tentativas);
    
    // Manter apenas últimas 100 tentativas
    if (metrica.tentativas.length > 100) {
      metrica.tentativas = metrica.tentativas.slice(-100);
    }
    
    // Atualizar timestamp
    metrica.ultimaAtualizacao = new Date().toISOString();
    
    // Recalcular métricas derivadas
    metrica.taxaAcerto = (metrica.acertos / metrica.total) * 100;
    metrica.tempoMedio = metrica.tempoTotal / metrica.total;
    metrica.tentativasMedias = metrica.tentativasTotal / metrica.total;
    
    // Calcular métricas avançadas
    metrica.tempoMediano = calcularMediano(metrica.tempos);
    metrica.tempoDesvio = calcularDesvioPadrao(metrica.tempos);
    metrica.tendencia = calcularTendencia(metrica.tempos.slice(-10)); // Últimas 10 respostas
    
    // Salvar métricas atualizadas
    salvarMetricasPorTipo(metricas, userId);
    
    console.log(`📊 Métrica registrada para ${tipoEstimulo}:`, {
      taxaAcerto: metrica.taxaAcerto.toFixed(1) + '%',
      tempoMedio: (metrica.tempoMedio / 1000).toFixed(1) + 's',
      total: metrica.total
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar métrica:', error);
  }
};

/**
 * Cria estrutura vazia de métrica
 * @returns {Object} Métrica vazia
 */
const criarMetricaVazia = () => ({
  total: 0,
  acertos: 0,
  tempoTotal: 0,
  tentativasTotal: 0,
  taxaAcerto: 0,
  tempoMedio: 0,
  tempoMediano: 0,
  tempoDesvio: 0,
  tentativasMedias: 0,
  tendencia: 'estavel',
  tempos: [],
  tentativas: [],
  criadoEm: new Date().toISOString(),
  ultimaAtualizacao: new Date().toISOString()
});

/**
 * Obtém métricas consolidadas por tipo
 * @param {string} userId - ID do usuário
 * @returns {Object} Métricas por tipo de estímulo
 */
export const obterMetricasPorTipo = (userId) => {
  try {
    const metricas = carregarMetricasPorTipo(userId);
    const resultado = {};
    
    // Garantir que todos os tipos existam
    Object.values(TIPO_ESTIMULO).forEach(tipo => {
      resultado[tipo] = metricas[tipo] || criarMetricaVazia();
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error);
    return {};
  }
};

/**
 * Obtém métricas gerais (agregadas de todos os tipos)
 * @param {string} userId - ID do usuário
 * @returns {Object} Métricas gerais
 */
export const obterMetricasGerais = (userId) => {
  try {
    const metricasPorTipo = obterMetricasPorTipo(userId);
    
    let totalGeral = 0;
    let acertosGeral = 0;
    let tempoTotalGeral = 0;
    let tentativasTotalGeral = 0;
    
    const temposGerais = [];
    const tentativasGerais = [];
    
    Object.values(metricasPorTipo).forEach(metrica => {
      totalGeral += metrica.total;
      acertosGeral += metrica.acertos;
      tempoTotalGeral += metrica.tempoTotal;
      tentativasTotalGeral += metrica.tentativasTotal;
      
      temposGerais.push(...metrica.tempos);
      tentativasGerais.push(...metrica.tentativas);
    });
    
    const taxaAcertoGeral = totalGeral > 0 ? (acertosGeral / totalGeral) * 100 : 0;
    const tempoMedioGeral = totalGeral > 0 ? tempoTotalGeral / totalGeral : 0;
    const tentativasMediasGeral = totalGeral > 0 ? tentativasTotalGeral / totalGeral : 0;
    
    return {
      total: totalGeral,
      acertos: acertosGeral,
      taxaAcerto: taxaAcertoGeral,
      tempoMedio: tempoMedioGeral,
      tempoMediano: calcularMediano(temposGerais),
      tentativasMedias: tentativasMediasGeral,
      melhorTipo: identificarMelhorTipo(metricasPorTipo),
      piorTipo: identificarPiorTipo(metricasPorTipo),
      tendenciaGeral: calcularTendenciaGeral(metricasPorTipo)
    };
  } catch (error) {
    console.error('❌ Erro ao calcular métricas gerais:', error);
    return {};
  }
};

/**
 * Calcula a mediana de um array de números
 * @param {Array} numeros - Array de números
 * @returns {number} Mediana
 */
const calcularMediano = (numeros) => {
  if (numeros.length === 0) return 0;
  
  const sorted = [...numeros].sort((a, b) => a - b);
  const meio = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[meio - 1] + sorted[meio]) / 2;
  }
  return sorted[meio];
};

/**
 * Calcula o desvio padrão de um array de números
 * @param {Array} numeros - Array de números
 * @returns {number} Desvio padrão
 */
const calcularDesvioPadrao = (numeros) => {
  if (numeros.length === 0) return 0;
  
  const media = numeros.reduce((acc, num) => acc + num, 0) / numeros.length;
  const variancia = numeros.reduce((acc, num) => acc + Math.pow(num - media, 2), 0) / numeros.length;
  
  return Math.sqrt(variancia);
};

/**
 * Calcula a tendência baseada nas últimas respostas
 * @param {Array} ultimosTempos - Últimos tempos de resposta
 * @returns {string} Tendência: 'melhorando', 'piorando', 'estavel'
 */
const calcularTendencia = (ultimosTempos) => {
  if (ultimosTempos.length < 5) return 'estavel';
  
  const metade = Math.floor(ultimosTempos.length / 2);
  const primeiraMetade = ultimosTempos.slice(0, metade);
  const segundaMetade = ultimosTempos.slice(metade);
  
  const mediaPrimeira = primeiraMetade.reduce((acc, t) => acc + t, 0) / primeiraMetade.length;
  const mediaSegunda = segundaMetade.reduce((acc, t) => acc + t, 0) / segundaMetade.length;
  
  const diferenca = mediaSegunda - mediaPrimeira;
  const threshold = mediaPrimeira * 0.1; // 10% de diferença
  
  if (diferenca < -threshold) return 'melhorando'; // Tempos menores = melhor
  if (diferenca > threshold) return 'piorando';
  return 'estavel';
};

/**
 * Identifica o tipo de estímulo com melhor performance
 * @param {Object} metricasPorTipo - Métricas por tipo
 * @returns {Object} Informações do melhor tipo
 */
const identificarMelhorTipo = (metricasPorTipo) => {
  let melhorTipo = null;
  let melhorTaxa = -1;
  
  Object.entries(metricasPorTipo).forEach(([tipo, metrica]) => {
    if (metrica.total >= 3 && metrica.taxaAcerto > melhorTaxa) {
      melhorTaxa = metrica.taxaAcerto;
      melhorTipo = tipo;
    }
  });
  
  return melhorTipo ? {
    tipo: melhorTipo,
    taxaAcerto: melhorTaxa,
    tempoMedio: metricasPorTipo[melhorTipo].tempoMedio
  } : null;
};

/**
 * Identifica o tipo de estímulo com pior performance
 * @param {Object} metricasPorTipo - Métricas por tipo
 * @returns {Object} Informações do pior tipo
 */
const identificarPiorTipo = (metricasPorTipo) => {
  let piorTipo = null;
  let piorTaxa = 101;
  
  Object.entries(metricasPorTipo).forEach(([tipo, metrica]) => {
    if (metrica.total >= 3 && metrica.taxaAcerto < piorTaxa) {
      piorTaxa = metrica.taxaAcerto;
      piorTipo = tipo;
    }
  });
  
  return piorTipo ? {
    tipo: piorTipo,
    taxaAcerto: piorTaxa,
    tempoMedio: metricasPorTipo[piorTipo].tempoMedio
  } : null;
};

/**
 * Calcula tendência geral baseada em todos os tipos
 * @param {Object} metricasPorTipo - Métricas por tipo
 * @returns {string} Tendência geral
 */
const calcularTendenciaGeral = (metricasPorTipo) => {
  const tendencias = Object.values(metricasPorTipo)
    .filter(metrica => metrica.total >= 5)
    .map(metrica => metrica.tendencia);
  
  if (tendencias.length === 0) return 'estavel';
  
  const melhorando = tendencias.filter(t => t === 'melhorando').length;
  const piorando = tendencias.filter(t => t === 'piorando').length;
  
  if (melhorando > piorando) return 'melhorando';
  if (piorando > melhorando) return 'piorando';
  return 'estavel';
};

/**
 * Gera relatório detalhado de métricas
 * @returns {Object} Relatório completo
 */
export const gerarRelatorioMetricas = () => {
  try {
    const metricasPorTipo = obterMetricasPorTipo();
    const metricasGerais = obterMetricasGerais();
    
    return {
      timestamp: new Date().toISOString(),
      resumo: metricasGerais,
      detalhePorTipo: metricasPorTipo,
      insights: gerarInsights(metricasPorTipo, metricasGerais),
      recomendacoes: gerarRecomendacoes(metricasPorTipo, metricasGerais)
    };
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return null;
  }
};

/**
 * Gera insights baseados nas métricas
 * @param {Object} metricasPorTipo - Métricas por tipo
 * @param {Object} metricasGerais - Métricas gerais
 * @returns {Array} Lista de insights
 */
const gerarInsights = (metricasPorTipo, metricasGerais) => {
  const insights = [];
  
  // Insight sobre performance geral
  if (metricasGerais.taxaAcerto >= 80) {
    insights.push('🎉 Excelente performance geral! Taxa de acerto acima de 80%');
  } else if (metricasGerais.taxaAcerto >= 60) {
    insights.push('👍 Boa performance geral. Continue praticando!');
  } else {
    insights.push('💪 Há espaço para melhoria. Foque nos exercícios mais desafiadores');
  }
  
  // Insight sobre melhor tipo
  if (metricasGerais.melhorTipo) {
    insights.push(`🌟 Melhor performance em estímulos ${metricasGerais.melhorTipo.tipo}`);
  }
  
  // Insight sobre tendência
  if (metricasGerais.tendenciaGeral === 'melhorando') {
    insights.push('📈 Tendência de melhoria detectada! Continue assim!');
  } else if (metricasGerais.tendenciaGeral === 'piorando') {
    insights.push('📉 Considere fazer uma pausa ou revisar estratégias de estudo');
  }
  
  return insights;
};

/**
 * Gera recomendações baseadas nas métricas
 * @param {Object} metricasPorTipo - Métricas por tipo
 * @param {Object} metricasGerais - Métricas gerais
 * @returns {Array} Lista de recomendações
 */
const gerarRecomendacoes = (metricasPorTipo, metricasGerais) => {
  const recomendacoes = [];
  
  // Recomendação baseada no pior tipo
  if (metricasGerais.piorTipo) {
    recomendacoes.push(`🎯 Foque mais em exercícios ${metricasGerais.piorTipo.tipo} para equilibrar o aprendizado`);
  }
  
  // Recomendação baseada no tempo médio
  if (metricasGerais.tempoMedio > 8000) {
    recomendacoes.push('⏱️ Tente responder mais rapidamente para melhorar a fluência');
  } else if (metricasGerais.tempoMedio < 2000) {
    recomendacoes.push('🤔 Considere pensar um pouco mais antes de responder');
  }
  
  return recomendacoes;
};
