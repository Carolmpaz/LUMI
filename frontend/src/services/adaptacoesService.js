/**
 * Serviço responsável pelos cálculos de adaptação da IA
 */

// Enums para evitar strings mágicas
export const NIVEL_DIFICULDADE = {
  FACIL: 'facil',
  MEDIO: 'medio',
  DIFICIL: 'dificil'
};

export const TIPO_ESTIMULO = {
  VISUAL: 'visual',
  AUDITIVO: 'auditivo',
  TATIL: 'tatil'
};

// Configurações de thresholds
const THRESHOLDS = {
  TAXA_ACERTO_ALTA: 0.8,
  TAXA_ACERTO_BAIXA: 0.4,
  PREFERENCIA_BAIXA: 0.5,
  PREFERENCIA_ALTA: 0.8,
  MIN_RESPOSTAS_ADAPTACAO: 3,
  MIN_RESPOSTAS_TIPO: 2,
  JANELA_ANALISE: 5, // Últimas N respostas para análise
  FATOR_CONFIANCA_MIN: 5 // Mínimo de respostas para alta confiança
};

/**
 * Calcula adaptações baseadas no histórico de respostas
 * @param {Array} historico - Array de respostas do usuário
 * @param {string} ultimoTipo - Tipo do último estímulo
 * @param {string} ultimoResultado - Resultado da última resposta
 * @param {Object} perfilAtual - Perfil atual do usuário
 * @returns {Object} Novas adaptações calculadas
 */
export const calcularAdaptacoes = (historico, ultimoTipo, ultimoResultado, perfilAtual) => {
  if (historico.length < THRESHOLDS.MIN_RESPOSTAS_ADAPTACAO) {
    return {}; // Dados insuficientes
  }

  const ultimasRespostas = historico.slice(-THRESHOLDS.JANELA_ANALISE);
  const fatorConfianca = Math.min(1, historico.length / THRESHOLDS.FATOR_CONFIANCA_MIN);
  
  // Calcular métricas básicas
  const metricas = calcularMetricasBasicas(ultimasRespostas);
  
  // Adaptar dificuldade com fator de confiança
  const novaDificuldade = adaptarDificuldade(
    metricas.taxaAcerto, 
    perfilAtual.nivelDificuldade, 
    fatorConfianca
  );
  
  // Adaptar preferências de estímulo
  const novasPreferencias = adaptarPreferenciasEstimulo(
    ultimasRespostas, 
    ultimoTipo, 
    perfilAtual.preferenciasEstimulo
  );
  
  // Adaptar configurações de tempo e tentativas
  const novasConfiguracoes = adaptarConfiguracoes(
    ultimasRespostas, 
    metricas.taxaAcerto, 
    perfilAtual.adaptacoes
  );

  return {
    nivelDificuldade: novaDificuldade,
    preferenciasEstimulo: novasPreferencias,
    adaptacoes: novasConfiguracoes,
    metricas: {
      ...metricas,
      fatorConfianca,
      totalRespostas: historico.length
    }
  };
};

/**
 * Calcula métricas básicas das respostas
 */
const calcularMetricasBasicas = (respostas) => {
  const totalRespostas = respostas.length;
  const acertos = respostas.filter(r => r.resultado === 'acerto').length;
  const taxaAcerto = totalRespostas > 0 ? acertos / totalRespostas : 0;
  
  const tempos = respostas.map(r => r.tempoResposta);
  const tempoMedio = tempos.reduce((acc, t) => acc + t, 0) / tempos.length;
  const tempoMediano = calcularMediano(tempos);
  
  const tentativas = respostas.map(r => r.tentativas);
  const tentativasMedias = tentativas.reduce((acc, t) => acc + t, 0) / tentativas.length;

  return {
    taxaAcerto,
    tempoMedio,
    tempoMediano,
    tentativasMedias,
    totalRespostas
  };
};

/**
 * Adapta o nível de dificuldade baseado na performance
 */
const adaptarDificuldade = (taxaAcerto, dificuldadeAtual, fatorConfianca) => {
  // Aplicar fator de confiança aos thresholds
  const thresholdAlto = THRESHOLDS.TAXA_ACERTO_ALTA + (0.1 * (1 - fatorConfianca));
  const thresholdBaixo = THRESHOLDS.TAXA_ACERTO_BAIXA - (0.1 * (1 - fatorConfianca));
  
  if (taxaAcerto >= thresholdAlto) {
    // Performance alta - aumentar dificuldade
    if (dificuldadeAtual === NIVEL_DIFICULDADE.FACIL) {
      return NIVEL_DIFICULDADE.MEDIO;
    } else if (dificuldadeAtual === NIVEL_DIFICULDADE.MEDIO) {
      return NIVEL_DIFICULDADE.DIFICIL;
    }
  } else if (taxaAcerto <= thresholdBaixo) {
    // Performance baixa - diminuir dificuldade
    if (dificuldadeAtual === NIVEL_DIFICULDADE.DIFICIL) {
      return NIVEL_DIFICULDADE.MEDIO;
    } else if (dificuldadeAtual === NIVEL_DIFICULDADE.MEDIO) {
      return NIVEL_DIFICULDADE.FACIL;
    }
  }
  
  return dificuldadeAtual; // Manter nível atual
};

/**
 * Adapta preferências por tipo de estímulo
 */
const adaptarPreferenciasEstimulo = (respostas, ultimoTipo, preferenciasAtuais) => {
  const novasPreferencias = { ...preferenciasAtuais };
  
  // Analisar performance por tipo
  Object.values(TIPO_ESTIMULO).forEach(tipo => {
    const respostasTipo = respostas.filter(r => r.tipoEstimulo === tipo);
    
    if (respostasTipo.length >= THRESHOLDS.MIN_RESPOSTAS_TIPO) {
      const taxaAcertoTipo = respostasTipo.filter(r => r.resultado === 'acerto').length / respostasTipo.length;
      const ajuste = calcularAjustePreferencia(taxaAcertoTipo);
      
      novasPreferencias[tipo] = Math.max(0.3, Math.min(2.0, 
        novasPreferencias[tipo] + ajuste
      ));
    }
  });
  
  return novasPreferencias;
};

/**
 * Calcula ajuste na preferência baseado na taxa de acerto
 */
const calcularAjustePreferencia = (taxaAcerto) => {
  if (taxaAcerto < THRESHOLDS.PREFERENCIA_BAIXA) {
    return -0.1; // Reduzir preferência
  } else if (taxaAcerto > THRESHOLDS.PREFERENCIA_ALTA) {
    return 0.1; // Aumentar preferência
  }
  return 0; // Manter
};

/**
 * Adapta configurações de tempo e tentativas
 */
const adaptarConfiguracoes = (respostas, taxaAcerto, configuracoesAtuais) => {
  const metricas = calcularMetricasBasicas(respostas);
  
  // Adaptar tempo de resposta baseado na mediana (mais robusta que média)
  const novoTempoResposta = Math.max(3000, Math.min(15000, 
    metricas.tempoMediano * 1.3
  ));
  
  // Adaptar tentativas máximas
  const novasTentativasMaximas = Math.max(2, Math.min(6, 
    Math.ceil(metricas.tentativasMedias * 1.1)
  ));
  
  return {
    ...configuracoesAtuais,
    tempoResposta: novoTempoResposta,
    tentativasMaximas: novasTentativasMaximas,
    ajudaVisual: taxaAcerto < 0.6,
    feedbackDetalhado: taxaAcerto < 0.7,
    adaptacaoAtiva: true
  };
};

/**
 * Calcula a mediana de um array de números
 */
const calcularMediano = (numeros) => {
  const sorted = [...numeros].sort((a, b) => a - b);
  const meio = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[meio - 1] + sorted[meio]) / 2;
  }
  return sorted[meio];
};

/**
 * Gera relatório de adaptação para debug/logs
 */
export const gerarRelatorioAdaptacao = (adaptacoes, perfilAnterior) => {
  const mudancas = [];
  
  if (adaptacoes.nivelDificuldade !== perfilAnterior.nivelDificuldade) {
    mudancas.push(`Dificuldade: ${perfilAnterior.nivelDificuldade} → ${adaptacoes.nivelDificuldade}`);
  }
  
  Object.keys(adaptacoes.preferenciasEstimulo || {}).forEach(tipo => {
    const anterior = perfilAnterior.preferenciasEstimulo[tipo];
    const nova = adaptacoes.preferenciasEstimulo[tipo];
    if (Math.abs(anterior - nova) > 0.05) {
      mudancas.push(`${tipo}: ${anterior.toFixed(2)} → ${nova.toFixed(2)}`);
    }
  });
  
  return {
    timestamp: new Date().toISOString(),
    mudancas,
    metricas: adaptacoes.metricas,
    temMudancas: mudancas.length > 0
  };
};
