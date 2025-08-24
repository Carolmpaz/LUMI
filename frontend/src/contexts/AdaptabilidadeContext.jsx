import { createContext, useState, useEffect, useCallback } from 'react';
import { calcularAdaptacoes, gerarRelatorioAdaptacao } from '../services/adaptacoesService';
import { carregarPerfil, salvarPerfil } from '../services/storageService';
import { registrarMetrica } from '../services/metricsService';
import { useAuth } from './AuthContext';

export const AdaptabilidadeContext = createContext();

export const AdaptabilidadeProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [logs, setLogs] = useState([]);

  // Carregar perfil do storage com validação
  useEffect(() => {
    const carregarPerfilInicial = async () => {
      try {
        setCarregando(true);

        // Só carregar se há usuário logado
        if (!usuario?.id) {
          setCarregando(false);
          return;
        }

        const perfil = carregarPerfil(usuario.id);
        setPerfilUsuario(perfil);

        console.log('✅ Perfil de adaptabilidade carregado para usuário', usuario.id, ':', {
          nivel: perfil.nivelDificuldade,
          totalRespostas: perfil.historico.length,
          version: perfil.version
        });
      } catch (error) {
        console.error('❌ Erro ao carregar perfil inicial:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfilInicial();
  }, [usuario?.id]); // Recarregar quando usuário mudar

  // Salvar perfil com debounce para performance
  useEffect(() => {
    if (!perfilUsuario || carregando || !usuario?.id) return;

    const timeoutId = setTimeout(() => {
      const sucesso = salvarPerfil(perfilUsuario, usuario.id);
      if (!sucesso) {
        console.warn('⚠️ Falha ao salvar perfil de adaptabilidade para usuário', usuario.id);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [perfilUsuario, carregando, usuario?.id]);

  const registrarResposta = useCallback((tipoEstimulo, resultado, tempoResposta, tentativas) => {
    if (!perfilUsuario) {
      console.warn('⚠️ Tentativa de registrar resposta sem perfil carregado');
      return;
    }

    try {
      const novaResposta = {
        timestamp: new Date().toISOString(),
        tipoEstimulo,
        resultado,
        tempoResposta,
        tentativas,
        dificuldade: perfilUsuario.nivelDificuldade
      };

      // Registrar métrica no serviço especializado
      registrarMetrica(tipoEstimulo, resultado, tempoResposta, tentativas, usuario?.id);

      setPerfilUsuario(prev => {
        const novoHistorico = [...prev.historico, novaResposta].slice(-100); // Manter últimas 100

        // Calcular adaptações usando o serviço
        const adaptacoesCalculadas = calcularAdaptacoes(novoHistorico, tipoEstimulo, resultado, prev);

        // Gerar relatório de mudanças
        const relatorio = gerarRelatorioAdaptacao(adaptacoesCalculadas, prev);

        if (relatorio.temMudancas) {
          console.log('🧠 Adaptação aplicada:', relatorio.mudancas);

          // Adicionar log de adaptação
          setLogs(prevLogs => [...prevLogs.slice(-20), relatorio]); // Manter últimos 20 logs
        }

        return {
          ...prev,
          historico: novoHistorico,
          ...adaptacoesCalculadas,
          estatisticas: {
            ...prev.estatisticas,
            totalRespostas: prev.estatisticas.totalRespostas + 1,
            totalAcertos: prev.estatisticas.totalAcertos + (resultado === 'acerto' ? 1 : 0),
            dataUltimaAtividade: new Date().toISOString()
          }
        };
      });

      console.log(`📝 Resposta registrada: ${tipoEstimulo} → ${resultado} (${tempoResposta}ms)`);

    } catch (error) {
      console.error('❌ Erro ao registrar resposta:', error);
    }
  }, [perfilUsuario]);

  const obterConfiguracao = useCallback((tipoEstimulo) => {
    if (!perfilUsuario) {
      return {
        dificuldade: 'medio',
        tempoResposta: 5000,
        tentativasMaximas: 3,
        ajudaVisual: true,
        feedbackDetalhado: true,
        preferencia: 1.0
      };
    }

    const configuracao = {
      dificuldade: perfilUsuario.nivelDificuldade,
      tempoResposta: perfilUsuario.adaptacoes.tempoResposta,
      tentativasMaximas: perfilUsuario.adaptacoes.tentativasMaximas,
      ajudaVisual: perfilUsuario.adaptacoes.ajudaVisual,
      feedbackDetalhado: perfilUsuario.adaptacoes.feedbackDetalhado,
      preferencia: perfilUsuario.preferenciasEstimulo[tipoEstimulo] || 1.0,
      adaptacaoAtiva: perfilUsuario.adaptacoes.adaptacaoAtiva || false
    };

    console.log(`⚙️ Configuração para ${tipoEstimulo}:`, configuracao);
    return configuracao;
  }, [perfilUsuario]);

  const resetarPerfil = useCallback(() => {
    try {
      const perfilPadrao = carregarPerfil(); // Carrega perfil padrão limpo
      setPerfilUsuario(perfilPadrao);
      setLogs([]);

      // Limpar storage
      localStorage.removeItem('perfilAdaptabilidade');
      localStorage.removeItem('metricasPorTipo');

      console.log('🔄 Perfil resetado para padrão');
    } catch (error) {
      console.error('❌ Erro ao resetar perfil:', error);
    }
  }, []);

  // Mostrar loading enquanto carrega
  if (carregando) {
    return (
      <AdaptabilidadeContext.Provider value={null}>
        {children}
      </AdaptabilidadeContext.Provider>
    );
  }

  const value = {
    perfilUsuario,
    registrarResposta,
    obterConfiguracao,
    resetarPerfil,
    logs,
    carregando
  };

  return (
    <AdaptabilidadeContext.Provider value={value}>
      {children}
    </AdaptabilidadeContext.Provider>
  );
};
