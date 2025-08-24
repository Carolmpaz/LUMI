const { Usuario, Session, Evento } = require('../models');
const { Op } = require('sequelize');

class AnalyticsService {
  
  // Calcular métricas de desempenho de um usuário
  async calcularMetricasUsuario(usuarioId, periodo = 30) {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodo);

      // Buscar sessões do período
      const sessoes = await Session.findAll({
        where: {
          UsuarioId: usuarioId,
          createdAt: { [Op.gte]: dataInicio }
        },
        include: [{
          model: Evento,
          as: 'eventos'
        }]
      });

      if (sessoes.length === 0) {
        return this.getMetricasVazias();
      }

      // Calcular métricas
      const eventos = sessoes.flatMap(s => s.eventos || []);
      const totalEventos = eventos.length;
      const acertos = eventos.filter(e => e.result === 'correct').length;
      const erros = eventos.filter(e => e.result === 'wrong').length;
      const pulos = eventos.filter(e => e.result === 'no_response').length;

      // Métricas por tipo de estímulo
      const metricasPorTipo = this.calcularMetricasPorTipo(eventos);
      
      // Métricas por letra
      const metricasPorLetra = this.calcularMetricasPorLetra(eventos);
      
      // Padrões de aprendizagem
      const padroes = this.identificarPadroes(eventos);
      
      // Tempo médio de resposta
      const tempoMedio = this.calcularTempoMedio(eventos);

      return {
        periodo,
        totalSessoes: sessoes.length,
        totalEventos,
        taxaAcerto: totalEventos > 0 ? (acertos / totalEventos) * 100 : 0,
        taxaErro: totalEventos > 0 ? (erros / totalEventos) * 100 : 0,
        taxaPulo: totalEventos > 0 ? (pulos / totalEventos) * 100 : 0,
        tempoMedioResposta: tempoMedio,
        metricasPorTipo,
        metricasPorLetra,
        padroes,
        recomendacoes: this.gerarRecomendacoes(metricasPorTipo, padroes)
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      throw error;
    }
  }

  // Calcular métricas por tipo de estímulo
  calcularMetricasPorTipo(eventos) {
    const tipos = ['visual', 'auditivo', 'tatil'];
    const metricas = {};

    tipos.forEach(tipo => {
      const eventosTipo = eventos.filter(e => e.stimulusType === tipo);
      const total = eventosTipo.length;
      const acertos = eventosTipo.filter(e => e.result === 'correct').length;
      
      metricas[tipo] = {
        total,
        acertos,
        taxaAcerto: total > 0 ? (acertos / total) * 100 : 0,
        tempoMedio: this.calcularTempoMedio(eventosTipo)
      };
    });

    return metricas;
  }

  // Calcular métricas por letra
  calcularMetricasPorLetra(eventos) {
    const letras = [...new Set(eventos.map(e => e.letter))];
    const metricas = {};

    letras.forEach(letra => {
      const eventosLetra = eventos.filter(e => e.letter === letra);
      const total = eventosLetra.length;
      const acertos = eventosLetra.filter(e => e.result === 'correct').length;
      
      metricas[letra] = {
        total,
        acertos,
        taxaAcerto: total > 0 ? (acertos / total) * 100 : 0,
        tempoMedio: this.calcularTempoMedio(eventosLetra),
        tipoMaisEficaz: this.encontrarTipoMaisEficaz(eventosLetra)
      };
    });

    return metricas;
  }

  // Identificar padrões de aprendizagem
  identificarPadroes(eventos) {
    const padroes = {
      sequenciasAcerto: this.encontrarSequenciasAcerto(eventos),
      sequenciasErro: this.encontrarSequenciasErro(eventos),
      melhorHorario: this.encontrarMelhorHorario(eventos),
      evolucaoTempo: this.analisarEvolucaoTempo(eventos),
      dificuldadesPorTipo: this.identificarDificuldadesPorTipo(eventos)
    };

    return padroes;
  }

  // Encontrar sequências de acertos
  encontrarSequenciasAcerto(eventos) {
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let sequencias = [];

    eventos.forEach(evento => {
      if (evento.result === 'correct') {
        sequenciaAtual++;
        maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
      } else {
        if (sequenciaAtual > 0) {
          sequencias.push(sequenciaAtual);
        }
        sequenciaAtual = 0;
      }
    });

    return {
      maior: maiorSequencia,
      media: sequencias.length > 0 ? sequencias.reduce((a, b) => a + b, 0) / sequencias.length : 0,
      total: sequencias.length
    };
  }

  // Encontrar sequências de erros
  encontrarSequenciasErro(eventos) {
    let sequenciaAtual = 0;
    let maiorSequencia = 0;
    let sequencias = [];

    eventos.forEach(evento => {
      if (evento.result === 'wrong') {
        sequenciaAtual++;
        maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
      } else {
        if (sequenciaAtual > 0) {
          sequencias.push(sequenciaAtual);
        }
        sequenciaAtual = 0;
      }
    });

    return {
      maior: maiorSequencia,
      media: sequencias.length > 0 ? sequencias.reduce((a, b) => a + b, 0) / sequencias.length : 0,
      total: sequencias.length
    };
  }

  // Encontrar melhor horário de estudo
  encontrarMelhorHorario(eventos) {
    const horarios = {};
    
    eventos.forEach(evento => {
      const hora = new Date(evento.createdAt).getHours();
      if (!horarios[hora]) {
        horarios[hora] = { total: 0, acertos: 0 };
      }
      horarios[hora].total++;
      if (evento.result === 'correct') {
        horarios[hora].acertos++;
      }
    });

    let melhorHora = 0;
    let melhorTaxa = 0;

    Object.keys(horarios).forEach(hora => {
      const taxa = horarios[hora].acertos / horarios[hora].total;
      if (taxa > melhorTaxa) {
        melhorTaxa = taxa;
        melhorHora = parseInt(hora);
      }
    });

    return {
      hora: melhorHora,
      taxaAcerto: melhorTaxa * 100,
      distribuicao: horarios
    };
  }

  // Analisar evolução do tempo de resposta
  analisarEvolucaoTempo(eventos) {
    const eventosComTempo = eventos.filter(e => e.timeSeconds && e.timeSeconds > 0);
    
    if (eventosComTempo.length < 2) {
      return { tendencia: 'insuficiente', melhoria: 0 };
    }

    const metade = Math.floor(eventosComTempo.length / 2);
    const primeiraParte = eventosComTempo.slice(0, metade);
    const segundaParte = eventosComTempo.slice(metade);

    const tempoMedioPrimeiro = this.calcularTempoMedio(primeiraParte);
    const tempoMedioSegundo = this.calcularTempoMedio(segundaParte);

    const melhoria = ((tempoMedioPrimeiro - tempoMedioSegundo) / tempoMedioPrimeiro) * 100;

    return {
      tendencia: melhoria > 5 ? 'melhorando' : melhoria < -5 ? 'piorando' : 'estavel',
      melhoria: Math.round(melhoria),
      tempoInicial: tempoMedioPrimeiro,
      tempoAtual: tempoMedioSegundo
    };
  }

  // Identificar dificuldades por tipo
  identificarDificuldadesPorTipo(eventos) {
    const tipos = ['visual', 'auditivo', 'tatil'];
    const dificuldades = {};

    tipos.forEach(tipo => {
      const eventosTipo = eventos.filter(e => e.stimulusType === tipo);
      const taxaErro = eventosTipo.length > 0 ? 
        (eventosTipo.filter(e => e.result === 'wrong').length / eventosTipo.length) * 100 : 0;
      
      dificuldades[tipo] = {
        taxaErro,
        nivel: taxaErro > 50 ? 'alta' : taxaErro > 25 ? 'media' : 'baixa'
      };
    });

    return dificuldades;
  }

  // Calcular tempo médio de resposta
  calcularTempoMedio(eventos) {
    const eventosComTempo = eventos.filter(e => e.timeSeconds && e.timeSeconds > 0);
    if (eventosComTempo.length === 0) return 0;
    
    const soma = eventosComTempo.reduce((acc, e) => acc + e.timeSeconds, 0);
    return Math.round((soma / eventosComTempo.length) * 100) / 100;
  }

  // Encontrar tipo de estímulo mais eficaz para uma letra
  encontrarTipoMaisEficaz(eventosLetra) {
    const tipos = ['visual', 'auditivo', 'tatil'];
    let melhorTipo = 'visual';
    let melhorTaxa = 0;

    tipos.forEach(tipo => {
      const eventosTipo = eventosLetra.filter(e => e.stimulusType === tipo);
      if (eventosTipo.length > 0) {
        const taxa = eventosTipo.filter(e => e.result === 'correct').length / eventosTipo.length;
        if (taxa > melhorTaxa) {
          melhorTaxa = taxa;
          melhorTipo = tipo;
        }
      }
    });

    return { tipo: melhorTipo, taxaAcerto: melhorTaxa * 100 };
  }

  // Gerar recomendações baseadas nas métricas
  gerarRecomendacoes(metricasPorTipo, padroes) {
    const recomendacoes = [];

    // Recomendação por tipo de estímulo
    const tipoMaisEficaz = Object.keys(metricasPorTipo).reduce((a, b) => 
      metricasPorTipo[a].taxaAcerto > metricasPorTipo[b].taxaAcerto ? a : b
    );

    recomendacoes.push({
      tipo: 'estimulo_preferido',
      titulo: 'Tipo de Estímulo Mais Eficaz',
      descricao: `O usuário responde melhor a estímulos ${tipoMaisEficaz}`,
      acao: `Priorizar estímulos ${tipoMaisEficaz} nas próximas sessões`
    });

    // Recomendação por horário
    if (padroes.melhorHorario.taxaAcerto > 70) {
      recomendacoes.push({
        tipo: 'horario_otimo',
        titulo: 'Horário Ideal de Estudo',
        descricao: `Melhor desempenho às ${padroes.melhorHorario.hora}h`,
        acao: 'Agendar sessões de estudo neste horário'
      });
    }

    // Recomendação por evolução
    if (padroes.evolucaoTempo.tendencia === 'piorando') {
      recomendacoes.push({
        tipo: 'atencao_tempo',
        titulo: 'Tempo de Resposta Aumentando',
        descricao: 'O tempo de resposta está aumentando',
        acao: 'Considerar pausas mais frequentes ou sessões mais curtas'
      });
    }

    return recomendacoes;
  }

  // Métricas vazias para usuários sem dados
  getMetricasVazias() {
    return {
      periodo: 30,
      totalSessoes: 0,
      totalEventos: 0,
      taxaAcerto: 0,
      taxaErro: 0,
      taxaPulo: 0,
      tempoMedioResposta: 0,
      metricasPorTipo: {
        visual: { total: 0, acertos: 0, taxaAcerto: 0, tempoMedio: 0 },
        auditivo: { total: 0, acertos: 0, taxaAcerto: 0, tempoMedio: 0 },
        tatil: { total: 0, acertos: 0, taxaAcerto: 0, tempoMedio: 0 }
      },
      metricasPorLetra: {},
      padroes: {},
      recomendacoes: []
    };
  }
}

module.exports = new AnalyticsService();
