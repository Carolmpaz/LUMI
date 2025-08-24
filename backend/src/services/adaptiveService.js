const { Usuario, Session, Evento } = require('../models');
const analyticsService = require('./analyticsService');
const { buscarPalavras } = require('../data/catalogoPalavras');

class AdaptiveService {
  constructor() {
    // ID fixo do usuário
    this.usuarioFixoId = 1; // Substitua pelo ID fixo desejado

    // Configurações padrão do algoritmo
    this.config = {
      // Limites para mudança de estímulo
      maxErrosConsecutivos: 2,
      maxAcertosParaAvancar: 3,
      tempoLimiteResposta: 10, // segundos
      
      // Pesos para decisão
      pesoHistoricoUsuario: 0.4,
      pesoSessaoAtual: 0.3,
      pesoTipoEstimulo: 0.3,
      
      // Configurações de dificuldade
      nivelFacil: { errosMax: 1, tempoMax: 5 },
      nivelMedio: { errosMax: 2, tempoMax: 8 },
      nivelDificil: { errosMax: 3, tempoMax: 12 }
    };

    // Usar o novo catálogo de palavras
    if (buscarPalavras && typeof buscarPalavras.todas === 'function') {
      this.palavras = buscarPalavras.todas();
    } else {
      console.error('Erro: "buscarPalavras.todas" não está definido. Verifique o módulo catalogoPalavras.');
      this.palavras = []; // Fallback para lista vazia
    }
  }

  // Escolher próximo estímulo usando algoritmo adaptativo avançado
  async escolherProximoEstimulo(sessionId, ultimoResultado = null) {
    try {
      // 1. Buscar dados da sessão atual
      const sessao = await Session.findByPk(sessionId, {
        include: [{ model: Evento, as: 'eventos' }, { model: Usuario, as: 'usuario' }]
      });

      if (!sessao) {
        throw new Error('Sessão não encontrada');
      }

      // 2. Analisar histórico do usuário (usar ID fixo)
      const metricas = await analyticsService.calcularMetricasUsuario(this.usuarioFixoId, 7); // últimos 7 dias
      
      // 3. Analisar contexto da sessão atual
      const contextoSessao = this.analisarSessaoAtual(sessao.eventos || []);
      
      // 4. Determinar próxima palavra e nível de dificuldade
      const proximaPalavra = this.determinarProximaPalavra(sessao.eventos || [], metricas);
      const nivelDificuldade = this.determinarNivelDificuldade(contextoSessao, metricas);

      // 5. Escolher tipo de estímulo mais adequado
      const tipoEstimulo = this.escolherTipoEstimulo(proximaPalavra, metricas, contextoSessao);

      // 6. Criar estímulo específico baseado na palavra
      const estimulo = this.criarEstimuloPalavra(proximaPalavra, tipoEstimulo, nivelDificuldade);
      
      // 7. Registrar decisão para análise futura
      await this.registrarDecisao(sessionId, estimulo, {
        metricas: metricas,
        contexto: contextoSessao,
        razao: this.explicarDecisao(estimulo, metricas, contextoSessao)
      });

      return estimulo;

    } catch (error) {
      console.error('Erro no algoritmo adaptativo:', error);
      // Fallback para estímulo básico
      return this.estimulos['A'][0];
    }
  }

  // Analisar contexto da sessão atual
  analisarSessaoAtual(eventos) {
    const ultimosEventos = eventos.slice(-5); // últimos 5 eventos
    
    return {
      totalEventos: eventos.length,
      ultimosResultados: ultimosEventos.map(e => e.result),
      errosConsecutivos: this.contarErrosConsecutivos(eventos),
      acertosConsecutivos: this.contarAcertosConsecutivos(eventos),
      tempoMedioSessao: this.calcularTempoMedio(eventos),
      tiposUsados: [...new Set(eventos.map(e => e.stimulusType))],
      letrasVistas: [...new Set(eventos.map(e => e.letter))],
      duracaoSessao: this.calcularDuracaoSessao(eventos)
    };
  }

  // Determinar próxima palavra baseada no progresso
  determinarProximaPalavra(eventos, metricas) {
    if (eventos.length === 0) {
      // Primeira palavra - começar com nível 1
      return buscarPalavras.porNivel(1)[0];
    }

    const ultimoEvento = eventos[eventos.length - 1];
    const palavraAtual = ultimoEvento.palavra || 'CASA';

    // Buscar dados da palavra atual
    const palavraAtualObj = this.palavras.find(p => p.palavra === palavraAtual);
    if (!palavraAtualObj) {
      return buscarPalavras.porNivel(1)[0]; // Fallback
    }

    // Verificar se deve avançar para próxima palavra
    const eventosPalavraAtual = eventos.filter(e => e.palavra === palavraAtual);
    const acertosPalavraAtual = eventosPalavraAtual.filter(e => e.result === 'correct').length;
    const taxaAcertoPalavra = eventosPalavraAtual.length > 0 ?
      (acertosPalavraAtual / eventosPalavraAtual.length) * 100 : 0;

    // Critérios para avançar
    const deveAvancar = (
      acertosPalavraAtual >= this.config.maxAcertosParaAvancar &&
      taxaAcertoPalavra >= 70 &&
      eventosPalavraAtual.length >= 3
    );

    if (deveAvancar) {
      // Avançar para próxima palavra do mesmo nível ou nível superior
      const proximasPalavras = buscarPalavras.porNivel(palavraAtualObj.dificuldade);
      const indiceAtual = proximasPalavras.findIndex(p => p.id === palavraAtualObj.id);

      if (indiceAtual < proximasPalavras.length - 1) {
        // Próxima palavra do mesmo nível
        return proximasPalavras[indiceAtual + 1];
      } else {
        // Avançar para próximo nível
        const proximoNivel = buscarPalavras.porNivel(palavraAtualObj.dificuldade + 1);
        return proximoNivel.length > 0 ? proximoNivel[0] : palavraAtualObj;
      }
    }

    return palavraAtualObj; // Continuar com a palavra atual
  }

  // Determinar nível de dificuldade
  determinarNivelDificuldade(contextoSessao, metricas) {
    let pontuacao = 0;

    // Baseado na taxa de acerto geral
    if (metricas.taxaAcerto >= 80) pontuacao += 2;
    else if (metricas.taxaAcerto >= 60) pontuacao += 1;
    else pontuacao -= 1;

    // Baseado no desempenho da sessão atual
    if (contextoSessao.acertosConsecutivos >= 3) pontuacao += 1;
    if (contextoSessao.errosConsecutivos >= 2) pontuacao -= 2;

    // Baseado no tempo de resposta
    if (contextoSessao.tempoMedioSessao <= 3) pontuacao += 1;
    else if (contextoSessao.tempoMedioSessao >= 8) pontuacao -= 1;

    // Determinar nível
    if (pontuacao >= 2) return 3; // Difícil
    else if (pontuacao >= 0) return 2; // Médio
    else return 1; // Fácil
  }

  // Escolher tipo de estímulo mais adequado
  escolherTipoEstimulo(palavra, metricas, contextoSessao) {
    const tipos = ['visual', 'auditivo', 'tatil'];
    const pontuacoes = {};

    tipos.forEach(tipo => {
      let pontuacao = 0;

      // Baseado no histórico do usuário
      if (metricas.metricasPorTipo[tipo]) {
        pontuacao += metricas.metricasPorTipo[tipo].taxaAcerto * this.config.pesoHistoricoUsuario;
      }

      // Baseado na sessão atual
      const usoRecente = contextoSessao.tiposUsados.filter(t => t === tipo).length;
      if (usoRecente === 0) pontuacao += 20; // Bonus para variedade
      else if (usoRecente >= 3) pontuacao -= 10; // Penalidade por repetição

      // Baseado na palavra específica
      if (metricas.metricasPorLetra[palavra.palavra] && metricas.metricasPorLetra[palavra.palavra].tipoMaisEficaz.tipo === tipo) {
        pontuacao += 15;
      }

      pontuacoes[tipo] = pontuacao;
    });

    // Retornar tipo com maior pontuação
    return Object.keys(pontuacoes).reduce((a, b) =>
      pontuacoes[a] > pontuacoes[b] ? a : b
    );
  }

  // Criar estímulo baseado na palavra
  criarEstimuloPalavra(palavra, tipo, dificuldade) {
    return {
      id: palavra.id,
      tipo: tipo,
      palavra: palavra.palavra,
      silabas: palavra.silabas,
      letras: palavra.letras,
      categoria: palavra.categoria,
      contexto: palavra.contexto,
      dificuldade: Math.min(dificuldade, palavra.dificuldade),
      visual: palavra.visual,
      auditivo: palavra.auditivo,
      tatil: palavra.tatil,
      frequenciaUso: palavra.frequenciaUso,
      timestamp: new Date().toISOString()
    };
  }

  // Registrar decisão para análise futura
  async registrarDecisao(sessionId, estimulo, contexto) {
    try {
      // Substituir o ID do usuário pelo ID fixo
      console.log('Decisão do algoritmo:', {
        sessionId,
        usuarioId: this.usuarioFixoId, // ID fixo
        estimuloEscolhido: estimulo,
        contexto: contexto.razao
      });
    } catch (error) {
      console.error('Erro ao registrar decisão:', error);
    }
  }

  // Explicar a decisão tomada
  explicarDecisao(estimulo, metricas, contextoSessao) {
    const razoes = [];

    razoes.push(`Palavra "${estimulo.palavra}" escolhida baseada no progresso atual`);
    razoes.push(`Categoria: ${estimulo.categoria} (${estimulo.contexto})`);
    razoes.push(`Tipo ${estimulo.tipo} selecionado (taxa de acerto: ${metricas.metricasPorTipo[estimulo.tipo]?.taxaAcerto || 0}%)`);
    razoes.push(`Dificuldade ${estimulo.dificuldade} ajustada ao desempenho`);

    if (contextoSessao.errosConsecutivos > 0) {
      razoes.push(`Ajuste por ${contextoSessao.errosConsecutivos} erros consecutivos`);
    }

    if (contextoSessao.acertosConsecutivos > 0) {
      razoes.push(`Considerando ${contextoSessao.acertosConsecutivos} acertos consecutivos`);
    }

    return razoes.join('; ');
  }

  // Métodos auxiliares
  contarErrosConsecutivos(eventos) {
    let count = 0;
    for (let i = eventos.length - 1; i >= 0; i--) {
      if (eventos[i].result === 'wrong') count++;
      else break;
    }
    return count;
  }

  contarAcertosConsecutivos(eventos) {
    let count = 0;
    for (let i = eventos.length - 1; i >= 0; i--) {
      if (eventos[i].result === 'correct') count++;
      else break;
    }
    return count;
  }

  calcularTempoMedio(eventos) {
    const eventosComTempo = eventos.filter(e => e.timeSeconds && e.timeSeconds > 0);
    if (eventosComTempo.length === 0) return 0;
    
    const soma = eventosComTempo.reduce((acc, e) => acc + e.timeSeconds, 0);
    return soma / eventosComTempo.length;
  }

  calcularDuracaoSessao(eventos) {
    if (eventos.length === 0) return 0;
    
    const primeiro = new Date(eventos[0].createdAt);
    const ultimo = new Date(eventos[eventos.length - 1].createdAt);
    
    return (ultimo - primeiro) / 1000 / 60; // em minutos
  }

  // Atualizar configurações do algoritmo
  atualizarConfig(novaConfig) {
    this.config = { ...this.config, ...novaConfig };
  }

  // Obter configurações atuais
  obterConfig() {
    return { ...this.config };
  }

  // Obter estímulo para palavra específica (para trilha)
  async obterEstimuloPalavra(palavra, tipoPreferido = 'visual') {
    try {
      const palavraData = catalogoPalavras.nivel1[palavra] ||
                         catalogoPalavras.nivel2[palavra] ||
                         catalogoPalavras.nivel3[palavra];

      if (!palavraData) {
        throw new Error(`Palavra ${palavra} não encontrada no catálogo`);
      }

      return this.criarEstimuloPalavra(palavra, palavraData, tipoPreferido);
    } catch (error) {
      console.error('Erro ao obter estímulo para palavra:', error);
      throw error;
    }
  }
}

module.exports = new AdaptiveService();
