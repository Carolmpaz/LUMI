const { Usuario, Session, Evento } = require('../models');
const adaptiveService = require('../services/adaptiveService');
const analyticsService = require('../services/analyticsService');

// Dados de estímulos para o protótipo
const ESTIMULOS = [
  {
    id: 1,
    tipo: 'visual',
    letra: 'A',
    conteudo: 'A - Abelha',
    imagem: '/images/abelha.png',
    cor: '#FF6B6B'
  },
  {
    id: 2,
    tipo: 'auditivo',
    letra: 'A',
    conteudo: 'Som da letra A',
    audio: '/audio/letra-a.mp3'
  },
  {
    id: 3,
    tipo: 'tatil',
    letra: 'A',
    conteudo: 'Toque na letra A',
    animacao: 'pulse'
  },
  {
    id: 4,
    tipo: 'visual',
    letra: 'B',
    conteudo: 'B - Bola',
    imagem: '/images/bola.png',
    cor: '#4ECDC4'
  },
  {
    id: 5,
    tipo: 'auditivo',
    letra: 'B',
    conteudo: 'Som da letra B',
    audio: '/audio/letra-b.mp3'
  },
  {
    id: 6,
    tipo: 'tatil',
    letra: 'B',
    conteudo: 'Toque na letra B',
    animacao: 'bounce'
  }
];

module.exports = {
  // Iniciar uma nova sessão
  async startSession(req, res) {
    try {
      // Usar o usuário autenticado
      const userId = req.usuario.id;

      // Criar nova sessão
      const session = await Session.create({
        UsuarioId: userId,
        startedAt: new Date()
      });

      // Escolher primeiro estímulo (visual por padrão)
      const estimuloInicial = ESTIMULOS[0];

      return res.json({
        sessionId: session.id,
        estimuloInicial,
        message: 'Sessão iniciada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      return res.status(500).json({
        error: 'Erro ao iniciar sessão',
        details: error.message
      });
    }
  },

  // Registrar resposta e obter próximo estímulo
  async submitResponse(req, res) {
    try {
      const { sessionId, stimulusId, stimulusType, letter, result, timeSeconds, payload } = req.body;

      if (!sessionId || !result) {
        return res.status(400).json({
          error: 'Campos obrigatórios: sessionId, result'
        });
      }

      // Verificar se a sessão existe
      const session = await Session.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      // Registrar o evento
      // Detectar se é uma palavra (mais de 1 caractere e não é apenas uma letra)
      const isPalavra = letter && letter.length > 1;

      await Evento.create({
        SessionId: sessionId,
        stimulusId: stimulusId || null,
        stimulusType: stimulusType || 'unknown',
        letter: letter || 'A',
        palavra: isPalavra ? letter : (payload?.palavra || null), // Registrar palavra completa
        result: result === 'acerto' ? 'correct' : result === 'erro' ? 'wrong' : 'no_response',
        timeSeconds: timeSeconds || null,
        payload: payload ? JSON.stringify(payload) : null
      });

      // Escolher próximo estímulo usando algoritmo adaptativo avançado
      const proximoEstimulo = await adaptiveService.escolherProximoEstimulo(sessionId, result);

      return res.json({
        ok: true,
        proximoEstimulo,
        message: 'Resposta registrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
      return res.status(500).json({
        error: 'Erro ao registrar resposta',
        details: error.message
      });
    }
  },

  // Obter próximo estímulo
  async nextStimulus(req, res) {
    try {
      const sessionId = req.query.sessionId || req.body.sessionId;
      const { tipoPreferido, palavraEspecifica } = req.body || {};

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId é obrigatório' });
      }

      let proximoEstimulo;

      // Se uma palavra específica foi solicitada (para a trilha)
      if (palavraEspecifica) {
        proximoEstimulo = await adaptiveService.obterEstimuloPalavra(palavraEspecifica, tipoPreferido);
      } else {
        proximoEstimulo = await adaptiveService.escolherProximoEstimulo(sessionId);
      }

      return res.json({ proximoEstimulo });
    } catch (error) {
      console.error('Erro ao obter próximo estímulo:', error);
      return res.status(500).json({
        error: 'Erro ao selecionar estímulo',
        details: error.message
      });
    }
  },

  // Obter métricas de analytics do usuário
  async getUserAnalytics(req, res) {
    try {
      const userId = req.usuario.id;
      const { periodo = 30 } = req.query;

      const metricas = await analyticsService.calcularMetricasUsuario(userId, parseInt(periodo));

      return res.json({
        success: true,
        metricas
      });
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      return res.status(500).json({
        error: 'Erro ao obter métricas',
        details: error.message
      });
    }
  },

  // Obter trilha de aprendizado
  async getTrilhaAprendizado(req, res) {
    try {
      console.log('🎯 Iniciando getTrilhaAprendizado');

      // Por enquanto, vamos retornar uma trilha padrão simples
      const trilhaPadrao = [
        { id: 1, palavra: 'CASA', nivel: 1, emoji: '🏠', desbloqueada: true, completa: false, estrelas: 0 },
        { id: 2, palavra: 'BOLA', nivel: 1, emoji: '⚽', desbloqueada: false, completa: false, estrelas: 0 },
        { id: 3, palavra: 'GATO', nivel: 1, emoji: '🐱', desbloqueada: false, completa: false, estrelas: 0 },
        { id: 4, palavra: 'ESCOLA', nivel: 2, emoji: '🏫', desbloqueada: false, completa: false, estrelas: 0 },
        { id: 5, palavra: 'FAMÍLIA', nivel: 2, emoji: '👨‍👩‍👧‍👦', desbloqueada: false, completa: false, estrelas: 0 },
        { id: 6, palavra: 'BORBOLETA', nivel: 3, emoji: '🦋', desbloqueada: false, completa: false, estrelas: 0 }
      ];

      res.json({
        trilha: trilhaPadrao,
        progresso: {
          totalFases: trilhaPadrao.length,
          fasesCompletas: 0,
          estrelasTotais: 0
        }
      });
    } catch (error) {
      console.error('❌ Erro ao buscar trilha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Concluir fase
  async concluirFase(req, res) {
    try {
      const { palavra, pontuacao, estrelas, tentativas, acertos } = req.body;
      const userId = req.user.id;

      // Registrar conclusão da fase
      // Aqui você pode salvar estatísticas específicas da fase
      // Por enquanto, vamos apenas retornar sucesso

      res.json({
        success: true,
        message: `Fase ${palavra} concluída!`,
        pontuacao,
        estrelas,
        estatisticas: {
          tentativas,
          acertos,
          precisao: Math.round((acertos / tentativas) * 100)
        }
      });
    } catch (error) {
      console.error('Erro ao concluir fase:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Obter configurações do algoritmo adaptativo
  async getAdaptiveConfig(req, res) {
    try {
      const config = adaptiveService.obterConfig();

      return res.json({
        success: true,
        config
      });
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return res.status(500).json({
        error: 'Erro ao obter configurações',
        details: error.message
      });
    }
  },

  // Atualizar configurações do algoritmo (apenas para educadores/admins)
  async updateAdaptiveConfig(req, res) {
    try {
      const novaConfig = req.body;

      adaptiveService.atualizarConfig(novaConfig);

      return res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        config: adaptiveService.obterConfig()
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar configurações',
        details: error.message
      });
    }
  },

  // Gerar relatório detalhado
  async generateReport(req, res) {
    try {
      const { userId, periodo = 30, formato = 'json' } = req.query;
      const targetUserId = userId || req.usuario.id;

      // Verificar permissões
      if (req.usuario.tipo !== 'admin' && req.usuario.tipo !== 'educador' && req.usuario.id !== parseInt(targetUserId)) {
        return res.status(403).json({
          error: 'Acesso negado'
        });
      }

      // Buscar dados do usuário
      const usuario = await Usuario.findByPk(targetUserId);
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Obter métricas detalhadas
      const metricas = await analyticsService.calcularMetricasUsuario(targetUserId, parseInt(periodo));

      // Buscar sessões detalhadas
      const sessoes = await Session.findAll({
        where: { UsuarioId: targetUserId },
        include: [{ model: Evento, as: 'eventos' }],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      const relatorio = {
        usuario: usuario.toSafeObject(),
        periodo: parseInt(periodo),
        dataGeracao: new Date().toISOString(),
        metricas,
        sessoes: sessoes.map(s => ({
          id: s.id,
          data: s.createdAt,
          duracao: s.finishedAt ?
            Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 1000 / 60) : null,
          totalEventos: s.eventos?.length || 0,
          acertos: s.eventos?.filter(e => e.result === 'correct').length || 0,
          erros: s.eventos?.filter(e => e.result === 'wrong').length || 0,
          taxaAcerto: s.eventos?.length > 0 ?
            ((s.eventos.filter(e => e.result === 'correct').length / s.eventos.length) * 100).toFixed(1) : 0
        })),
        resumo: {
          totalSessoes: sessoes.length,
          sessaoMaisLonga: sessoes.reduce((max, s) => {
            const duracao = s.finishedAt ?
              Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 1000 / 60) : 0;
            return duracao > max ? duracao : max;
          }, 0),
          melhorSessao: sessoes.reduce((melhor, s) => {
            const taxa = s.eventos?.length > 0 ?
              (s.eventos.filter(e => e.result === 'correct').length / s.eventos.length) * 100 : 0;
            return taxa > (melhor.taxa || 0) ? { sessao: s.id, taxa } : melhor;
          }, {})
        }
      };

      if (formato === 'csv') {
        // Gerar CSV simples
        const csv = this.gerarCSV(relatorio);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-${usuario.nome}-${new Date().toISOString().split('T')[0]}.csv"`);
        return res.send(csv);
      }

      return res.json({
        success: true,
        relatorio
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return res.status(500).json({
        error: 'Erro ao gerar relatório',
        details: error.message
      });
    }
  },

  // Gerar CSV do relatório
  gerarCSV(relatorio) {
    const linhas = [
      'Data,Sessao,Duracao(min),Total Eventos,Acertos,Erros,Taxa Acerto(%)'
    ];

    relatorio.sessoes.forEach(s => {
      linhas.push([
        new Date(s.data).toLocaleDateString('pt-BR'),
        s.id,
        s.duracao || 0,
        s.totalEventos,
        s.acertos,
        s.erros,
        s.taxaAcerto
      ].join(','));
    });

    return linhas.join('\n');
  }
};

// Lógica para escolher próximo estímulo
async function escolherProximoEstimulo(sessionId, ultimoResultado = null) {
  try {
    // Buscar histórico da sessão
    const eventos = await Evento.findAll({
      where: { SessionId: sessionId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Lógica simples para protótipo
    if (eventos.length === 0) {
      // Primeiro estímulo - visual
      return ESTIMULOS[0];
    }

    const ultimoEvento = eventos[0];
    const errosRecentes = eventos.filter(e => e.result === 'wrong').length;
    const acertosConsecutivos = contarAcertosConsecutivos(eventos);

    // Se muitos erros, trocar tipo de estímulo
    if (errosRecentes >= 2) {
      const tipoAtual = ultimoEvento.stimulusType;
      const novoTipo = trocarTipoEstimulo(tipoAtual);
      return ESTIMULOS.find(e => e.tipo === novoTipo && e.letra === ultimoEvento.letter) || ESTIMULOS[0];
    }

    // Se 3 acertos consecutivos, avançar para próxima letra
    if (acertosConsecutivos >= 3) {
      const proximaLetra = ultimoEvento.letter === 'A' ? 'B' : 'C';
      return ESTIMULOS.find(e => e.letra === proximaLetra && e.tipo === 'visual') || null;
    }

    // Continuar com a mesma letra, mas pode variar o tipo
    const letraAtual = ultimoEvento.letter;
    const estimulosLetra = ESTIMULOS.filter(e => e.letra === letraAtual);
    const indiceAtual = estimulosLetra.findIndex(e => e.id === ultimoEvento.stimulusId);
    const proximoIndice = (indiceAtual + 1) % estimulosLetra.length;

    return estimulosLetra[proximoIndice];
  } catch (error) {
    console.error('Erro ao escolher próximo estímulo:', error);
    return ESTIMULOS[0]; // Fallback
  }
}

// Contar acertos consecutivos
function contarAcertosConsecutivos(eventos) {
  let count = 0;
  for (const evento of eventos) {
    if (evento.result === 'correct') {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Trocar tipo de estímulo
function trocarTipoEstimulo(tipoAtual) {
  const tipos = ['visual', 'auditivo', 'tatil'];
  const indiceAtual = tipos.indexOf(tipoAtual);
  return tipos[(indiceAtual + 1) % tipos.length];
}