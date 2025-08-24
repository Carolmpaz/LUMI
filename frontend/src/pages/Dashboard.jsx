import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAdaptabilidade } from '../hooks/useAdaptabilidade';
import MetricasUsuario from '../components/MetricasUsuario';
import PerfilAdaptativo from '../components/PerfilAdaptativo';

export default function Dashboard() {
  const { usuario } = useAuth();
  const { registrarResposta } = useAdaptabilidade();
  const [activeTab, setActiveTab] = useState('metricas');

  // Função de debug para testar registro de respostas
  const testarRegistroRespostas = () => {
    console.log('🧪 Testando registro de respostas...');

    if (!registrarResposta) {
      console.error('❌ registrarResposta não está disponível!');
      alert('Erro: registrarResposta não está disponível!');
      return;
    }

    // Registrar algumas respostas de teste
    try {
      registrarResposta('visual', 'acerto', 2500, 1);
      registrarResposta('visual', 'erro', 4200, 2);
      registrarResposta('auditivo', 'acerto', 3100, 1);
      registrarResposta('auditivo', 'acerto', 2800, 1);
      registrarResposta('tatil', 'erro', 5500, 3);
      registrarResposta('tatil', 'acerto', 4100, 2);

      console.log('✅ Respostas de teste registradas!');
      alert('✅ Respostas de teste registradas! Recarregando...');

      // Recarregar a página após um tempo para ver os dados
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Erro ao registrar respostas:', error);
      alert('❌ Erro ao registrar respostas: ' + error.message);
    }
  };

  // Componente de Debug para mostrar estado atual
  const PainelDebug = () => {
    const { perfilUsuario, metricas } = useAdaptabilidade();

    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px solid #dee2e6',
        borderRadius: '8px',
        padding: '15px',
        margin: '20px 0',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔍 Debug - Estado Atual</h4>

        <div style={{ marginBottom: '10px' }}>
          <strong>Perfil Usuário:</strong>
          <pre style={{ margin: '5px 0', padding: '5px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            {JSON.stringify({
              carregado: !!perfilUsuario,
              historico: perfilUsuario?.historico?.length || 0,
              nivel: perfilUsuario?.nivelDificuldade || 'N/A',
              version: perfilUsuario?.version || 'N/A'
            }, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>Métricas:</strong>
          <pre style={{ margin: '5px 0', padding: '5px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            {JSON.stringify({
              porTipo: metricas?.porTipo ? Object.keys(metricas.porTipo) : [],
              gerais: metricas?.gerais ? 'Disponível' : 'Não disponível'
            }, null, 2)}
          </pre>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>localStorage:</strong>
          <pre style={{ margin: '5px 0', padding: '5px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            {JSON.stringify({
              perfilAdaptabilidade: !!localStorage.getItem('perfilAdaptabilidade'),
              metricasPorTipo: !!localStorage.getItem('metricasPorTipo'),
              progressoUsuario: !!localStorage.getItem('progressoUsuario')
            }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Função registrarResposta:</strong>
          <span style={{
            color: registrarResposta ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
            marginLeft: '10px'
          }}>
            {registrarResposta ? '✅ Disponível' : '❌ Não disponível'}
          </span>
        </div>
      </div>
    );
  };

  const estiloContainer = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloTabs = {
    display: 'flex',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '30px'
  };

  const estiloTab = (isActive) => ({
    padding: '15px 25px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
    color: isActive ? '#007bff' : '#666',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '16px',
    transition: 'all 0.3s ease'
  });

  const estiloWelcome = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    textAlign: 'center'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'metricas':
        return <MetricasUsuario usuario={usuario} />;

      case 'sessoes':
        return <SessoesRealizadas usuario={usuario} />;

      case 'configuracoes':
        return <ConfiguracoesAdaptativas />;

      case 'relatorios':
        return <RelatoriosDetalhados />;
      
      default:
        return (
          <div>
            <PerfilAdaptativo />
            <MetricasUsuario usuario={usuario} />
          </div>
        );
    }
  };

  // Componente para Sessões Realizadas
  const SessoesRealizadas = ({ usuario }) => {
    const { perfilUsuario, metricas, carregando: carregandoAdaptabilidade } = useAdaptabilidade();
    const [sessoes, setSessoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtro, setFiltro] = useState('todas'); // todas, hoje, semana, mes

    useEffect(() => {
      // Só carregar sessões quando o perfil estiver carregado
      if (!carregandoAdaptabilidade && perfilUsuario) {
        carregarSessoes();
      }
    }, [filtro, perfilUsuario, metricas, carregandoAdaptabilidade]);

    const carregarSessoes = () => {
      try {
        setCarregando(true);

        console.log('🔍 DEBUG - Dados do hook useAdaptabilidade:');
        console.log('🧠 perfilUsuario completo:', perfilUsuario);
        console.log('🧠 perfilUsuario.historico:', perfilUsuario?.historico);
        console.log('🧠 Tamanho do histórico:', perfilUsuario?.historico?.length);
        console.log('📊 metricas:', metricas);

        // Usar dados do hook de adaptabilidade (mais confiáveis)
        const progressoSalvo = JSON.parse(localStorage.getItem('progressoUsuario') || '{}');

        console.log('📂 Dados disponíveis:', {
          progresso: progressoSalvo,
          perfil: perfilUsuario,
          metricasPorTipo: metricas?.porTipo || {},
          metricasGerais: metricas?.gerais || {}
        });

        // Verificar se há dados reais
        const temHistorico = perfilUsuario?.historico && perfilUsuario.historico.length > 0;
        const temMetricas = metricas?.porTipo && Object.keys(metricas.porTipo).length > 0;
        const temProgresso = progressoSalvo.fasesCompletas;

        console.log('🔍 Verificação de dados:', {
          temHistorico,
          temMetricas,
          temProgresso,
          historicoLength: perfilUsuario?.historico?.length || 0,
          metricasKeys: metricas?.porTipo ? Object.keys(metricas.porTipo) : [],
          fasesCompletas: progressoSalvo.fasesCompletas
        });

        // Gerar sessões baseadas nos dados disponíveis
        const sessoesGeradas = gerarSessoesDoHistorico(progressoSalvo, perfilUsuario, metricas?.porTipo || {});

        // Aplicar filtro
        const sessoesFiltradas = aplicarFiltro(sessoesGeradas, filtro);

        console.log('📅 Sessões geradas:', sessoesGeradas);
        console.log('📅 Sessões filtradas:', sessoesFiltradas);
        setSessoes(sessoesFiltradas);
      } catch (error) {
        console.error('❌ Erro ao carregar sessões:', error);
        setSessoes([]);
      } finally {
        setCarregando(false);
      }
    };

    const gerarSessoesDoHistorico = (progresso, perfil, metricas = {}) => {
      const sessoes = [];
      const hoje = new Date();

      console.log('📊 INÍCIO - Gerando sessões do histórico');
      console.log('📊 Perfil recebido:', perfil ? 'Existe' : 'Null/Undefined');
      console.log('📊 Histórico:', perfil?.historico ? `${perfil.historico.length} respostas` : 'Vazio');
      console.log('📊 Primeira resposta:', perfil?.historico?.[0]);
      console.log('📊 Última resposta:', perfil?.historico?.[perfil.historico.length - 1]);

      // Se há histórico de adaptabilidade, usar para gerar sessões reais
      console.log('🔍 Verificando condições do histórico:');
      console.log('  - perfil existe?', !!perfil);
      console.log('  - perfil.historico existe?', !!perfil?.historico);
      console.log('  - perfil.historico.length > 0?', (perfil?.historico?.length || 0) > 0);
      console.log('  - Tamanho do histórico:', perfil?.historico?.length || 0);

      if (perfil && perfil.historico && perfil.historico.length > 0) {
        console.log('✅ CONDIÇÃO ATENDIDA - Processando histórico real!');
        console.log('📝 Usando histórico de adaptabilidade:', perfil.historico.length, 'respostas');
        console.log('📋 Primeiras 3 respostas do histórico:', perfil.historico.slice(0, 3));

        const respostasPorDia = agruparRespostasPorDia(perfil.historico);
        console.log('📅 Respostas agrupadas por dia:', respostasPorDia);

        Object.entries(respostasPorDia).forEach(([data, respostas]) => {
          const acertos = respostas.filter(r => r.resultado === 'acerto').length;
          const erros = respostas.filter(r => r.resultado === 'erro').length;
          const taxaAcerto = respostas.length > 0 ? (acertos / respostas.length) * 100 : 0;

          // Calcular tempo médio real
          const temposValidos = respostas.filter(r => r.tempoResposta && r.tempoResposta > 0);
          const tempoMedio = temposValidos.length > 0 ?
            temposValidos.reduce((acc, r) => acc + r.tempoResposta, 0) / temposValidos.length : 4000;

          const sessao = {
            id: `sessao-${data}`,
            data: data + 'T' + (respostas[0]?.timestamp?.split('T')[1] || '10:00:00.000Z'),
            duracao: calcularDuracaoSessao(respostas),
            totalEventos: respostas.length,
            acertos: acertos,
            erros: erros,
            taxaAcerto: taxaAcerto,
            tempoMedio: tempoMedio,
            tiposEstimulo: [...new Set(respostas.map(r => r.tipoEstimulo).filter(Boolean))],
            nivelDificuldade: respostas[respostas.length - 1]?.dificuldade || 'medio'
          };

          console.log('📅 Sessão gerada do histórico real:', sessao);
          sessoes.push(sessao);
        });

        console.log('📊 Total de sessões geradas do histórico:', sessoes.length);
      } else {
        console.log('❌ CONDIÇÃO NÃO ATENDIDA - Histórico não será usado');
        console.log('   Motivo: perfil=', !!perfil, 'historico=', !!perfil?.historico, 'length=', perfil?.historico?.length || 0);
      }

      // Se há métricas por tipo, usar para gerar sessões mais precisas
      if (sessoes.length === 0 && Object.keys(metricas).length > 0) {
        console.log('📊 Usando métricas por tipo:', metricas);

        // Calcular totais das métricas
        let totalEventos = 0;
        let totalAcertos = 0;
        let tempoTotalMs = 0;
        const tiposUsados = [];

        Object.entries(metricas).forEach(([tipo, metrica]) => {
          if (metrica.total > 0) {
            totalEventos += metrica.total;
            totalAcertos += metrica.acertos;
            tempoTotalMs += metrica.tempoTotal;
            tiposUsados.push(tipo);
          }
        });

        if (totalEventos > 0) {
          const taxaAcertoReal = (totalAcertos / totalEventos) * 100;
          const tempoMedioReal = tempoTotalMs / totalEventos;
          const duracaoEstimada = Math.max(1, Math.floor(tempoTotalMs / (1000 * 60))); // Converter para minutos

          sessoes.push({
            id: 'sessao-metricas',
            data: hoje.toISOString(),
            duracao: duracaoEstimada,
            totalEventos: totalEventos,
            acertos: totalAcertos,
            erros: totalEventos - totalAcertos,
            taxaAcerto: taxaAcertoReal,
            tempoMedio: tempoMedioReal,
            tiposEstimulo: tiposUsados,
            nivelDificuldade: taxaAcertoReal >= 80 ? 'dificil' : taxaAcertoReal >= 60 ? 'medio' : 'facil'
          });

          console.log('📊 Sessão baseada em métricas:', sessoes[0]);
        }
      }

      // Se há progresso mas não métricas, usar dados do progresso
      if (sessoes.length === 0 && progresso.fasesCompletas) {
        console.log('📈 Verificando dados de progresso:', progresso);

        // Converter fasesCompletas para array se for Set ou string
        let fasesArray = [];
        if (progresso.fasesCompletas) {
          if (typeof progresso.fasesCompletas === 'string') {
            try {
              const parsed = JSON.parse(progresso.fasesCompletas);
              fasesArray = Array.isArray(parsed) ? parsed : Array.from(parsed);
            } catch {
              fasesArray = [];
            }
          } else if (progresso.fasesCompletas.size !== undefined) {
            // É um Set
            fasesArray = Array.from(progresso.fasesCompletas);
          } else if (Array.isArray(progresso.fasesCompletas)) {
            fasesArray = progresso.fasesCompletas;
          } else if (typeof progresso.fasesCompletas === 'object') {
            // Pode ser um objeto com chaves
            fasesArray = Object.keys(progresso.fasesCompletas);
          }
        }

        console.log('📊 Fases convertidas:', fasesArray);

        if (fasesArray.length > 0) {
          const pontuacaoTotal = progresso.pontuacaoTotal || 0;
          const tentativasTotal = progresso.tentativasTotal || fasesArray.length;

          // Calcular taxa de acerto baseada no progresso real
          const taxaAcertoReal = tentativasTotal > 0 ?
            Math.min(100, Math.max(0, (pontuacaoTotal / (tentativasTotal * 100)) * 100)) : 0;

          // Gerar sessão baseada no progresso real
          const duracaoEstimada = Math.max(1, Math.floor(fasesArray.length * 1.5)); // Mais realista
          const totalEventosReal = fasesArray.length * 3; // 3 atividades por fase
          const acertosReais = Math.floor(totalEventosReal * (taxaAcertoReal / 100));
          const errosReais = totalEventosReal - acertosReais;

          sessoes.push({
            id: 'sessao-progresso',
            data: hoje.toISOString(),
            duracao: duracaoEstimada,
            totalEventos: totalEventosReal,
            acertos: acertosReais,
            erros: errosReais,
            taxaAcerto: taxaAcertoReal,
            tempoMedio: 4000, // Tempo médio estimado
            tiposEstimulo: ['visual', 'auditivo', 'tatil'],
            nivelDificuldade: taxaAcertoReal >= 80 ? 'dificil' : taxaAcertoReal >= 60 ? 'medio' : 'facil'
          });

          console.log('📊 Sessão baseada em progresso:', sessoes[0]);
        }
      }

      // Se não há dados suficientes, criar sessão vazia para mostrar estado inicial
      if (sessoes.length === 0) {
        console.log('📭 Nenhum dado encontrado, criando estado inicial');
        // Não criar sessão fictícia - deixar vazio para mostrar mensagem apropriada
      }

      return sessoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    };

    const agruparRespostasPorDia = (historico) => {
      const grupos = {};

      console.log('🔄 Agrupando', historico.length, 'respostas por dia...');

      historico.forEach((resposta, index) => {
        try {
          // Verificar se timestamp existe e é válido
          if (!resposta.timestamp) {
            console.warn(`⚠️ Resposta ${index} sem timestamp:`, resposta);
            return;
          }

          const data = new Date(resposta.timestamp).toISOString().split('T')[0];

          if (!grupos[data]) {
            grupos[data] = [];
          }
          grupos[data].push(resposta);
        } catch (error) {
          console.error(`❌ Erro ao processar resposta ${index}:`, error, resposta);
        }
      });

      console.log('📅 Grupos criados:', Object.keys(grupos).map(data => ({
        data,
        quantidade: grupos[data].length
      })));

      return grupos;
    };

    const calcularDuracaoSessao = (respostas) => {
      if (respostas.length < 2) {
        // Para uma única resposta, estimar baseado no tempo de resposta
        const tempoResposta = respostas[0]?.tempoResposta || 4000;
        return Math.max(1, Math.ceil(tempoResposta / (1000 * 60))); // Converter para minutos
      }

      try {
        // Ordenar respostas por timestamp para garantir ordem correta
        const respostasOrdenadas = [...respostas].sort((a, b) =>
          new Date(a.timestamp) - new Date(b.timestamp)
        );

        const inicio = new Date(respostasOrdenadas[0].timestamp);
        const fim = new Date(respostasOrdenadas[respostasOrdenadas.length - 1].timestamp);
        const duracaoMs = fim - inicio;

        // Se a duração calculada for muito pequena, usar soma dos tempos de resposta
        if (duracaoMs < 60000) { // Menos de 1 minuto
          const tempoTotalRespostas = respostas.reduce((acc, r) => acc + (r.tempoResposta || 4000), 0);
          return Math.max(1, Math.ceil(tempoTotalRespostas / (1000 * 60)));
        }

        const duracaoMinutos = Math.floor(duracaoMs / (1000 * 60));
        console.log(`⏱️ Duração calculada: ${duracaoMinutos}min (${respostas.length} respostas)`);

        return Math.max(1, duracaoMinutos);
      } catch (error) {
        console.error('❌ Erro ao calcular duração:', error);
        return Math.max(1, Math.ceil(respostas.length * 0.5)); // Fallback: 30s por resposta
      }
    };

    const aplicarFiltro = (sessoes, filtro) => {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);
      const inicioMes = new Date(hoje);
      inicioMes.setDate(hoje.getDate() - 30);

      switch (filtro) {
        case 'hoje':
          return sessoes.filter(s => {
            const dataSessao = new Date(s.data);
            return dataSessao.toDateString() === hoje.toDateString();
          });
        case 'semana':
          return sessoes.filter(s => new Date(s.data) >= inicioSemana);
        case 'mes':
          return sessoes.filter(s => new Date(s.data) >= inicioMes);
        default:
          return sessoes;
      }
    };

    const obterEstatisticasGerais = () => {
      if (sessoes.length === 0) return null;

      console.log('📊 Calculando estatísticas para', sessoes.length, 'sessões:', sessoes);

      // Calcular totais reais baseados nas sessões filtradas
      const totalEventos = sessoes.reduce((acc, s) => acc + (s.totalEventos || 0), 0);
      const totalAcertos = sessoes.reduce((acc, s) => acc + (s.acertos || 0), 0);
      const totalErros = sessoes.reduce((acc, s) => acc + (s.erros || 0), 0);
      const duracaoTotal = sessoes.reduce((acc, s) => acc + (s.duracao || 0), 0);

      // Calcular taxa de acerto geral baseada nos dados reais
      const taxaAcertoGeral = totalEventos > 0 ? (totalAcertos / totalEventos) * 100 : 0;

      // Calcular duração média
      const duracaoMedia = sessoes.length > 0 ? duracaoTotal / sessoes.length : 0;

      // Encontrar melhor sessão baseada na taxa de acerto real
      const melhorSessao = sessoes.length > 0 ?
        sessoes.reduce((melhor, atual) =>
          (atual.taxaAcerto || 0) > (melhor.taxaAcerto || 0) ? atual : melhor, sessoes[0]
        ) : null;

      // Encontrar pior sessão
      const piorSessao = sessoes.length > 0 ?
        sessoes.reduce((pior, atual) =>
          (atual.taxaAcerto || 100) < (pior.taxaAcerto || 100) ? atual : pior, sessoes[0]
        ) : null;

      // Calcular tempo médio por evento
      const tempoMedioPorEvento = totalEventos > 0 ?
        sessoes.reduce((acc, s) => acc + (s.tempoMedio || 0), 0) / sessoes.length : 0;

      // Identificar tipos de estímulo mais usados
      const tiposUsados = {};
      sessoes.forEach(sessao => {
        (sessao.tiposEstimulo || []).forEach(tipo => {
          tiposUsados[tipo] = (tiposUsados[tipo] || 0) + 1;
        });
      });

      const tipoMaisUsado = Object.keys(tiposUsados).length > 0 ?
        Object.entries(tiposUsados).reduce((a, b) => tiposUsados[a[0]] > tiposUsados[b[0]] ? a : b)[0] : null;

      const estatisticas = {
        totalSessoes: sessoes.length,
        totalEventos,
        totalAcertos,
        totalErros,
        duracaoTotal,
        taxaAcertoGeral,
        duracaoMedia,
        tempoMedioPorEvento: tempoMedioPorEvento / 1000, // Converter para segundos
        melhorSessao,
        piorSessao,
        tipoMaisUsado,
        tiposUsados,
        // Métricas adicionais
        consistencia: calcularConsistencia(sessoes),
        tendencia: calcularTendencia(sessoes)
      };

      console.log('📈 Estatísticas calculadas:', estatisticas);
      return estatisticas;
    };

    // Função para calcular consistência (desvio padrão das taxas de acerto)
    const calcularConsistencia = (sessoes) => {
      if (sessoes.length < 2) return 100; // Consistência perfeita com 1 sessão

      const taxas = sessoes.map(s => s.taxaAcerto || 0);
      const media = taxas.reduce((acc, taxa) => acc + taxa, 0) / taxas.length;
      const variancia = taxas.reduce((acc, taxa) => acc + Math.pow(taxa - media, 2), 0) / taxas.length;
      const desvioPadrao = Math.sqrt(variancia);

      // Converter para percentual de consistência (100% = sem variação)
      return Math.max(0, 100 - desvioPadrao);
    };

    // Função para calcular tendência baseada nas últimas sessões
    const calcularTendencia = (sessoes) => {
      if (sessoes.length < 2) return 'estavel';

      // Ordenar por data para análise temporal
      const sessoesOrdenadas = [...sessoes].sort((a, b) => new Date(a.data) - new Date(b.data));

      if (sessoesOrdenadas.length < 3) {
        // Com apenas 2 sessões, comparar diretamente
        const primeira = sessoesOrdenadas[0].taxaAcerto || 0;
        const ultima = sessoesOrdenadas[sessoesOrdenadas.length - 1].taxaAcerto || 0;
        const diferenca = ultima - primeira;

        if (diferenca > 10) return 'melhorando';
        if (diferenca < -10) return 'piorando';
        return 'estavel';
      }

      // Com 3+ sessões, usar regressão linear simples
      const n = sessoesOrdenadas.length;
      let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;

      sessoesOrdenadas.forEach((sessao, index) => {
        const x = index;
        const y = sessao.taxaAcerto || 0;
        somaX += x;
        somaY += y;
        somaXY += x * y;
        somaX2 += x * x;
      });

      const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);

      if (inclinacao > 2) return 'melhorando';
      if (inclinacao < -2) return 'piorando';
      return 'estavel';
    };

    const estiloContainer = {
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    };

    const estiloCard = {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '25px'
    };

    const estiloFiltro = {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    };

    const estiloBotaoFiltro = (ativo) => ({
      padding: '8px 16px',
      border: ativo ? '2px solid #007bff' : '2px solid #e0e0e0',
      borderRadius: '20px',
      backgroundColor: ativo ? '#007bff' : 'white',
      color: ativo ? 'white' : '#666',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: ativo ? 'bold' : 'normal',
      transition: 'all 0.3s ease'
    });

    const estiloTabela = {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    };

    const estiloTh = {
      padding: '12px',
      textAlign: 'left',
      borderBottom: '2px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold',
      color: '#333'
    };

    const estiloTd = {
      padding: '12px',
      borderBottom: '1px solid #e0e0e0',
      verticalAlign: 'middle'
    };

    const estatisticas = obterEstatisticasGerais();

    if (carregando || carregandoAdaptabilidade) {
      return (
        <div style={estiloContainer}>
          <div style={estiloCard}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#666' }}>
                {carregandoAdaptabilidade ? 'Carregando perfil de adaptabilidade...' : 'Carregando sessões...'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={estiloContainer}>
        {/* Filtros */}
        <div style={estiloCard}>
          
          <div style={estiloFiltro}>
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'hoje', label: 'Hoje' },
              { id: 'semana', label: 'Última Semana' },
              { id: 'mes', label: 'Último Mês' }
            ].map(opcao => (
              <button
                key={opcao.id}
                style={estiloBotaoFiltro(filtro === opcao.id)}
                onClick={() => setFiltro(opcao.id)}
              >
                {opcao.label}
              </button>
            ))}

            {/* Botão de debug - remover em produção */}
            <button
              style={{
                padding: '8px 16px',
                border: '2px solid #dc3545',
                borderRadius: '20px',
                backgroundColor: '#dc3545',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              onClick={testarRegistroRespostas}
            >
              🧪 Testar Dados
            </button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        {estatisticas && (
          <div style={estiloCard}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Resumo do Período ({filtro})</h3>

            {/* Métricas Principais */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                  {estatisticas.totalSessoes}
                </div>
       
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: estatisticas.taxaAcertoGeral >= 80 ? '#28a745' :
                         estatisticas.taxaAcertoGeral >= 60 ? '#ffc107' : '#dc3545'
                }}>
                  {estatisticas.taxaAcertoGeral.toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Taxa de Acerto</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {estatisticas.totalAcertos}✓ / {estatisticas.totalEventos} total
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                  {estatisticas.duracaoTotal}min
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Tempo Total</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {Math.floor(estatisticas.duracaoTotal / 60)}h {estatisticas.duracaoTotal % 60}min
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8' }}>
                  {estatisticas.duracaoMedia.toFixed(1)}min
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Duração Média</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  por sessão
                </div>
              </div>
            </div>

            {/* Métricas Secundárias */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              borderTop: '1px solid #e0e0e0',
              paddingTop: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {estatisticas.consistencia.toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Consistência</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {estatisticas.consistencia >= 80 ? 'Muito consistente' :
                   estatisticas.consistencia >= 60 ? 'Consistente' : 'Variável'}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
                  {estatisticas.tempoMedioPorEvento.toFixed(1)}s
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Tempo por Atividade</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {estatisticas.tempoMedioPorEvento < 3 ? 'Muito rápido' :
                   estatisticas.tempoMedioPorEvento < 6 ? 'Bom ritmo' : 'Mais devagar'}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#20c997' }}>
                  {estatisticas.tendencia === 'melhorando' ? '📈' :
                   estatisticas.tendencia === 'piorando' ? '📉' : '➡️'}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Tendência</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {estatisticas.tendencia === 'melhorando' ? 'Melhorando' :
                   estatisticas.tendencia === 'piorando' ? 'Precisa atenção' : 'Estável'}
                </div>
              </div>

              {estatisticas.tipoMaisUsado && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e83e8c' }}>
                    {estatisticas.tipoMaisUsado === 'visual' ? '👁️' :
                     estatisticas.tipoMaisUsado === 'auditivo' ? '👂' : '👆'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Tipo Preferido</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {estatisticas.tipoMaisUsado.charAt(0).toUpperCase() + estatisticas.tipoMaisUsado.slice(1)}
                  </div>
                </div>
              )}
            </div>

            {/* Melhor e Pior Sessão */}
            {estatisticas.melhorSessao && estatisticas.totalSessoes > 1 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
                  🏆 Melhor Sessão: {estatisticas.melhorSessao.taxaAcerto.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(estatisticas.melhorSessao.data).toLocaleDateString('pt-BR')} -
                  {estatisticas.melhorSessao.acertos} acertos em {estatisticas.melhorSessao.totalEventos} atividades
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Sessões */}
        <div style={estiloCard}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Detalhes das Sessões</h3>

          {sessoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>Nenhuma sessão encontrada</div>
              <div style={{ fontSize: '14px' }}>
                {filtro === 'todas'
                  ? 'Complete algumas atividades para ver suas sessões aqui!'
                  : 'Tente alterar o filtro para ver mais sessões.'
                }
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={estiloTabela}>
                <thead>
                  <tr>
                    <th style={estiloTh}>Data</th>
                    <th style={estiloTh}>Duração</th>
                    <th style={estiloTh}>Atividades</th>
                    <th style={estiloTh}>Acertos</th>
                    <th style={estiloTh}>Taxa</th>
                    <th style={estiloTh}>Tipos</th>
                    <th style={estiloTh}>Nível</th>
                  </tr>
                </thead>
                <tbody>
                  {sessoes.map((sessao, index) => (
                    <tr key={sessao.id} style={{
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                    }}>
                      <td style={estiloTd}>
                        <div style={{ fontWeight: 'bold' }}>
                          {new Date(sessao.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(sessao.data).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          fontWeight: 'bold',
                          color: sessao.duracao >= 10 ? '#28a745' : '#ffc107'
                        }}>
                          {sessao.duracao}min
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ fontWeight: 'bold' }}>{sessao.totalEventos}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {sessao.acertos}✓ {sessao.erros}✗
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          fontWeight: 'bold',
                          color: '#28a745'
                        }}>
                          {sessao.acertos}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          fontWeight: 'bold',
                          color: sessao.taxaAcerto >= 80 ? '#28a745' :
                                 sessao.taxaAcerto >= 60 ? '#ffc107' : '#dc3545'
                        }}>
                          {sessao.taxaAcerto.toFixed(1)}%
                        </span>
                      </td>
                      <td style={estiloTd}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {sessao.tiposEstimulo.map(tipo => (
                            <span key={tipo} style={{
                              fontSize: '16px',
                              title: tipo
                            }}>
                              {tipo === 'visual' ? '👁️' :
                               tipo === 'auditivo' ? '👂' : '👆'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={estiloTd}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor:
                            sessao.nivelDificuldade === 'facil' ? '#d4edda' :
                            sessao.nivelDificuldade === 'medio' ? '#fff3cd' : '#f8d7da',
                          color:
                            sessao.nivelDificuldade === 'facil' ? '#155724' :
                            sessao.nivelDificuldade === 'medio' ? '#856404' : '#721c24'
                        }}>
                          {sessao.nivelDificuldade.charAt(0).toUpperCase() + sessao.nivelDificuldade.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTabs = () => {
    const baseTabs = [
      { id: 'metricas', label: '📊 Métricas', icon: '📊' },
      { id: 'sessoes', label: '📅 Sessões Realizadas', icon: '📅' }
    ];

    if (usuario.tipo === 'educador' || usuario.tipo === 'admin') {
      baseTabs.push(
        { id: 'configuracoes', label: '⚙️ Configurações', icon: '⚙️' },
        { id: 'relatorios', label: '📋 Relatórios', icon: '📋' }
      );
    }

    return baseTabs;
  };

  return (
    <div style={estiloContainer}>
      {/* Welcome Section */}
      <div style={estiloWelcome}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>
          {usuario.tipo === 'crianca' ? '🎓' : usuario.tipo === 'educador' ? '👩‍🏫' : '👑'} 
          {' '}Olá, {usuario.nome}!
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          {usuario.tipo === 'crianca' && 'Veja seu progresso na alfabetização'}
          {usuario.tipo === 'educador' && 'Acompanhe o progresso dos seus alunos'}
          {usuario.tipo === 'admin' && 'Gerencie o sistema de alfabetização'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={estiloTabs}>
        {getTabs().map(tab => (
          <div
            key={tab.id}
            style={estiloTab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

// Componente para configurações adaptativas
function ConfiguracoesAdaptativas() {
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/adaptive-config');
      setConfig(response.data.config);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setCarregando(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setSalvando(true);
      await axios.put('http://localhost:3002/api/adaptive-config', config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Carregando configurações...</div>;
  }

  const estiloCard = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const estiloInput = {
    width: '100px',
    padding: '8px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '14px'
  };

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>⚙️ Configurações do Algoritmo Adaptativo</h2>
      
      <div style={estiloCard}>
        <h3>🎯 Limites de Decisão</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Máximo de erros consecutivos:
            </label>
            <input
              type="number"
              value={config?.maxErrosConsecutivos || 2}
              onChange={(e) => setConfig({...config, maxErrosConsecutivos: parseInt(e.target.value)})}
              style={estiloInput}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Acertos para avançar:
            </label>
            <input
              type="number"
              value={config?.maxAcertosParaAvancar || 3}
              onChange={(e) => setConfig({...config, maxAcertosParaAvancar: parseInt(e.target.value)})}
              style={estiloInput}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tempo limite (segundos):
            </label>
            <input
              type="number"
              value={config?.tempoLimiteResposta || 10}
              onChange={(e) => setConfig({...config, tempoLimiteResposta: parseInt(e.target.value)})}
              style={estiloInput}
            />
          </div>
        </div>
      </div>

      <div style={estiloCard}>
        <h3>⚖️ Pesos de Decisão</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Peso histórico usuário:
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={config?.pesoHistoricoUsuario || 0.4}
              onChange={(e) => setConfig({...config, pesoHistoricoUsuario: parseFloat(e.target.value)})}
              style={estiloInput}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Peso sessão atual:
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={config?.pesoSessaoAtual || 0.3}
              onChange={(e) => setConfig({...config, pesoSessaoAtual: parseFloat(e.target.value)})}
              style={estiloInput}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Peso tipo estímulo:
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={config?.pesoTipoEstimulo || 0.3}
              onChange={(e) => setConfig({...config, pesoTipoEstimulo: parseFloat(e.target.value)})}
              style={estiloInput}
            />
          </div>
        </div>
      </div>

      <button
        onClick={salvarConfiguracoes}
        disabled={salvando}
        style={{
          padding: '15px 30px',
          backgroundColor: salvando ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: salvando ? 'not-allowed' : 'pointer'
        }}
      >
        {salvando ? '💾 Salvando...' : '💾 Salvar Configurações'}
      </button>
    </div>
  );
}

// Componente para relatórios detalhados
function RelatoriosDetalhados() {
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [periodo, setPeriodo] = useState(30);

  const gerarRelatorio = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`http://localhost:3002/api/report?periodo=${periodo}`);
      setRelatorio(response.data.relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const baixarCSV = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/report?periodo=${periodo}&formato=csv`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar CSV:', error);
      alert('Erro ao baixar relatório');
    }
  };

  const estiloCard = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const estiloBotao = {
    padding: '12px 24px',
    margin: '0 10px 10px 0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  return (
    <div>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>📋 Relatórios Detalhados</h2>

      <div style={estiloCard}>
        <h3>Gerar Relatório</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <label>Período:</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '5px', border: '2px solid #e0e0e0' }}
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>

          <button
            onClick={gerarRelatorio}
            disabled={carregando}
            style={{
              ...estiloBotao,
              backgroundColor: carregando ? '#ccc' : '#007bff',
              color: 'white'
            }}
          >
            {carregando ? '⏳ Gerando...' : '📊 Gerar Relatório'}
          </button>

          <button
            onClick={baixarCSV}
            style={{
              ...estiloBotao,
              backgroundColor: '#28a745',
              color: 'white'
            }}
          >
            📥 Baixar CSV
          </button>
        </div>
      </div>

      {relatorio && (
        <>
          <div style={estiloCard}>
            <h3>📈 Resumo Executivo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  {relatorio.resumo.totalSessoes}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total de Sessões</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {relatorio.metricas.taxaAcerto.toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Taxa de Acerto Geral</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {relatorio.resumo.sessaoMaisLonga}min
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Sessão Mais Longa</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {relatorio.resumo.melhorSessao.taxa?.toFixed(1) || 0}%
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Melhor Sessão</div>
              </div>
            </div>
          </div>

          <div style={estiloCard}>
            <h3>📅 Histórico de Sessões</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Data</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Duração</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Respostas</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Acertos</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e0e0e0' }}>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.sessoes.map((sessao, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(sessao.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {sessao.duracao ? `${sessao.duracao}min` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {sessao.totalEventos}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {sessao.acertos}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          color: sessao.taxaAcerto >= 80 ? '#28a745' :
                                 sessao.taxaAcerto >= 60 ? '#ffc107' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {sessao.taxaAcerto}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
