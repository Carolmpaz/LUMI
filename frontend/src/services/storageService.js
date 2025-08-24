/**
 * Serviço responsável pela persistência de dados
 */

// Versão do schema para migrações futuras
const SCHEMA_VERSION = 1;

// Função para gerar chaves específicas por usuário
const getStorageKeys = (userId) => {
  if (!userId) {
    console.warn('⚠️ userId não fornecido, usando chaves padrão');
    userId = 'default';
  }

  return {
    PERFIL_ADAPTABILIDADE: `perfilAdaptabilidade_${userId}`,
    METRICAS_POR_TIPO: `metricasPorTipo_${userId}`,
    HISTORICO_ADAPTACOES: `historicoAdaptacoes_${userId}`,
    CONFIGURACOES_APP: `configuracoesApp_${userId}`,
    PROGRESSO_USUARIO: `progressoUsuario_${userId}`
  };
};

// Perfil padrão
const PERFIL_PADRAO = {
  version: SCHEMA_VERSION,
  nivelDificuldade: 'medio',
  preferenciasEstimulo: {
    visual: 1.0,
    auditivo: 1.0,
    tatil: 1.0
  },
  historico: [],
  adaptacoes: {
    tempoResposta: 5000,
    tentativasMaximas: 3,
    ajudaVisual: true,
    feedbackDetalhado: true,
    adaptacaoAtiva: true
  },
  estatisticas: {
    totalRespostas: 0,
    totalAcertos: 0,
    tempoTotalJogo: 0,
    dataUltimaAtividade: null,
    dataCriacao: new Date().toISOString()
  }
};

/**
 * Carrega o perfil do usuário com validação
 * @param {string} userId - ID do usuário
 * @returns {Object} Perfil validado ou perfil padrão
 */
export const carregarPerfil = (userId) => {
  try {
    const STORAGE_KEYS = getStorageKeys(userId);
    const perfilSalvo = localStorage.getItem(STORAGE_KEYS.PERFIL_ADAPTABILIDADE);
    
    if (!perfilSalvo) {
      console.log('📁 Nenhum perfil encontrado, criando perfil padrão');
      return { ...PERFIL_PADRAO };
    }
    
    const perfil = JSON.parse(perfilSalvo);
    
    // Validar integridade do perfil
    const perfilValidado = validarPerfil(perfil);
    
    // Verificar se precisa de migração
    if (perfilValidado.version < SCHEMA_VERSION) {
      console.log('🔄 Migrando perfil para nova versão');
      return migrarPerfil(perfilValidado);
    }
    
    console.log('✅ Perfil carregado com sucesso');
    return perfilValidado;
    
  } catch (error) {
    console.error('❌ Erro ao carregar perfil:', error);
    console.log('🔧 Retornando perfil padrão');
    return { ...PERFIL_PADRAO };
  }
};

/**
 * Salva o perfil do usuário
 * @param {Object} perfil - Perfil a ser salvo
 * @param {string} userId - ID do usuário
 * @returns {boolean} Sucesso da operação
 */
export const salvarPerfil = (perfil, userId) => {
  try {
    const STORAGE_KEYS = getStorageKeys(userId);

    // Adicionar timestamp de última modificação
    const perfilComTimestamp = {
      ...perfil,
      version: SCHEMA_VERSION,
      ultimaModificacao: new Date().toISOString()
    };

    localStorage.setItem(
      STORAGE_KEYS.PERFIL_ADAPTABILIDADE,
      JSON.stringify(perfilComTimestamp)
    );
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar perfil:', error);
    return false;
  }
};

/**
 * Valida a integridade do perfil carregado
 * @param {Object} perfil - Perfil a ser validado
 * @returns {Object} Perfil validado
 */
const validarPerfil = (perfil) => {
  const perfilValidado = { ...PERFIL_PADRAO };
  
  // Validar campos obrigatórios
  if (perfil.nivelDificuldade && ['facil', 'medio', 'dificil'].includes(perfil.nivelDificuldade)) {
    perfilValidado.nivelDificuldade = perfil.nivelDificuldade;
  }
  
  // Validar preferências de estímulo
  if (perfil.preferenciasEstimulo && typeof perfil.preferenciasEstimulo === 'object') {
    ['visual', 'auditivo', 'tatil'].forEach(tipo => {
      const valor = perfil.preferenciasEstimulo[tipo];
      if (typeof valor === 'number' && valor >= 0.1 && valor <= 3.0) {
        perfilValidado.preferenciasEstimulo[tipo] = valor;
      }
    });
  }
  
  // Validar histórico
  if (Array.isArray(perfil.historico)) {
    perfilValidado.historico = perfil.historico
      .filter(resposta => validarResposta(resposta))
      .slice(-100); // Manter últimas 100 respostas
  }
  
  // Validar adaptações
  if (perfil.adaptacoes && typeof perfil.adaptacoes === 'object') {
    const adaptacoes = perfil.adaptacoes;
    
    if (typeof adaptacoes.tempoResposta === 'number' && adaptacoes.tempoResposta > 0) {
      perfilValidado.adaptacoes.tempoResposta = Math.max(2000, Math.min(20000, adaptacoes.tempoResposta));
    }
    
    if (typeof adaptacoes.tentativasMaximas === 'number' && adaptacoes.tentativasMaximas > 0) {
      perfilValidado.adaptacoes.tentativasMaximas = Math.max(1, Math.min(10, adaptacoes.tentativasMaximas));
    }
    
    if (typeof adaptacoes.ajudaVisual === 'boolean') {
      perfilValidado.adaptacoes.ajudaVisual = adaptacoes.ajudaVisual;
    }
    
    if (typeof adaptacoes.feedbackDetalhado === 'boolean') {
      perfilValidado.adaptacoes.feedbackDetalhado = adaptacoes.feedbackDetalhado;
    }
  }
  
  // Preservar estatísticas se existirem
  if (perfil.estatisticas && typeof perfil.estatisticas === 'object') {
    perfilValidado.estatisticas = {
      ...perfilValidado.estatisticas,
      ...perfil.estatisticas
    };
  }
  
  return perfilValidado;
};

/**
 * Valida uma resposta individual
 * @param {Object} resposta - Resposta a ser validada
 * @returns {boolean} Se a resposta é válida
 */
const validarResposta = (resposta) => {
  return (
    resposta &&
    typeof resposta.timestamp === 'string' &&
    ['visual', 'auditivo', 'tatil'].includes(resposta.tipoEstimulo) &&
    ['acerto', 'erro'].includes(resposta.resultado) &&
    typeof resposta.tempoResposta === 'number' &&
    resposta.tempoResposta > 0 &&
    typeof resposta.tentativas === 'number' &&
    resposta.tentativas > 0
  );
};

/**
 * Migra perfil para nova versão do schema
 * @param {Object} perfilAntigo - Perfil na versão anterior
 * @returns {Object} Perfil migrado
 */
const migrarPerfil = (perfilAntigo) => {
  const perfilMigrado = validarPerfil(perfilAntigo);
  
  // Adicionar novos campos que não existiam em versões anteriores
  if (!perfilMigrado.estatisticas) {
    perfilMigrado.estatisticas = PERFIL_PADRAO.estatisticas;
  }
  
  if (!perfilMigrado.adaptacoes.adaptacaoAtiva) {
    perfilMigrado.adaptacoes.adaptacaoAtiva = true;
  }
  
  perfilMigrado.version = SCHEMA_VERSION;
  
  console.log('✅ Migração de perfil concluída');
  return perfilMigrado;
};

/**
 * Carrega métricas por tipo de estímulo
 * @param {string} userId - ID do usuário
 * @returns {Object} Métricas por tipo
 */
export const carregarMetricasPorTipo = (userId) => {
  try {
    const STORAGE_KEYS = getStorageKeys(userId);
    const metricas = localStorage.getItem(STORAGE_KEYS.METRICAS_POR_TIPO);
    return metricas ? JSON.parse(metricas) : {};
  } catch (error) {
    console.error('❌ Erro ao carregar métricas:', error);
    return {};
  }
};

/**
 * Salva métricas por tipo de estímulo
 * @param {Object} metricas - Métricas a serem salvas
 * @param {string} userId - ID do usuário
 * @returns {boolean} Sucesso da operação
 */
export const salvarMetricasPorTipo = (metricas, userId) => {
  try {
    const STORAGE_KEYS = getStorageKeys(userId);
    localStorage.setItem(STORAGE_KEYS.METRICAS_POR_TIPO, JSON.stringify(metricas));
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar métricas:', error);
    return false;
  }
};

/**
 * Limpa todos os dados do usuário
 * @returns {boolean} Sucesso da operação
 */
export const limparDados = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Dados limpos com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    return false;
  }
};

/**
 * Exporta dados do usuário para backup
 * @returns {Object} Dados exportados
 */
export const exportarDados = () => {
  try {
    const dados = {};
    
    Object.entries(STORAGE_KEYS).forEach(([nome, chave]) => {
      const valor = localStorage.getItem(chave);
      if (valor) {
        dados[nome] = JSON.parse(valor);
      }
    });
    
    dados.exportadoEm = new Date().toISOString();
    dados.versao = SCHEMA_VERSION;
    
    return dados;
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    return null;
  }
};

/**
 * Importa dados do usuário de backup
 * @param {Object} dados - Dados a serem importados
 * @returns {boolean} Sucesso da operação
 */
export const importarDados = (dados) => {
  try {
    if (!dados || typeof dados !== 'object') {
      throw new Error('Dados inválidos para importação');
    }
    
    // Validar e importar cada tipo de dado
    Object.entries(STORAGE_KEYS).forEach(([nome, chave]) => {
      if (dados[nome]) {
        localStorage.setItem(chave, JSON.stringify(dados[nome]));
      }
    });
    
    console.log('📥 Dados importados com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    return false;
  }
};

/**
 * Obtém estatísticas de uso do storage
 * @returns {Object} Estatísticas de uso
 */
export const obterEstatisticasStorage = () => {
  try {
    let tamanhoTotal = 0;
    const detalhes = {};
    
    Object.entries(STORAGE_KEYS).forEach(([nome, chave]) => {
      const valor = localStorage.getItem(chave);
      const tamanho = valor ? new Blob([valor]).size : 0;
      tamanhoTotal += tamanho;
      detalhes[nome] = {
        tamanho,
        existe: !!valor
      };
    });
    
    return {
      tamanhoTotal,
      tamanhoTotalKB: (tamanhoTotal / 1024).toFixed(2),
      detalhes
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return null;
  }
};
