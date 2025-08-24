import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProgressoContext = createContext();

export const useProgresso = () => {
  const context = useContext(ProgressoContext);
  if (!context) {
    throw new Error('useProgresso deve ser usado dentro de um ProgressoProvider');
  }
  return context;
};

export const ProgressoProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [progressoUsuario, setProgressoUsuario] = useState({});
  const [fasesCompletas, setFasesCompletas] = useState(new Set());

  // Carregar progresso do localStorage ao inicializar
  useEffect(() => {
    if (!usuario?.id) return;

    const chaveProgresso = `progressoAlfabetizacao_${usuario.id}`;
    const progressoSalvo = localStorage.getItem(chaveProgresso);
    if (progressoSalvo) {
      try {
        const dados = JSON.parse(progressoSalvo);
        setProgressoUsuario(dados.progresso || {});
        setFasesCompletas(new Set(dados.fasesCompletas || []));
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
  }, [usuario?.id]);

  // Salvar progresso no localStorage sempre que mudar
  useEffect(() => {
    if (!usuario?.id) return;

    const chaveProgresso = `progressoAlfabetizacao_${usuario.id}`;
    const dados = {
      progresso: progressoUsuario,
      fasesCompletas: Array.from(fasesCompletas),
      ultimaAtualizacao: new Date().toISOString()
    };
    localStorage.setItem(chaveProgresso, JSON.stringify(dados));
  }, [progressoUsuario, fasesCompletas, usuario?.id]);

  const marcarFaseCompleta = (palavra, resultado) => {
    console.log('Marcando fase como completa:', palavra, resultado);
    
    // Adicionar à lista de fases completas
    setFasesCompletas(prev => new Set([...prev, palavra]));
    
    // Atualizar progresso detalhado
    setProgressoUsuario(prev => ({
      ...prev,
      [palavra]: {
        completa: true,
        estrelas: resultado.estrelas || 3,
        pontuacao: resultado.pontuacao || 0,
        tentativas: resultado.tentativas || 0,
        dataCompleta: new Date().toISOString()
      }
    }));
  };

  const isFaseCompleta = (palavra) => {
    return fasesCompletas.has(palavra);
  };

  const getProgressoFase = (palavra) => {
    return progressoUsuario[palavra] || null;
  };

  const resetarProgresso = () => {
    setProgressoUsuario({});
    setFasesCompletas(new Set());
    localStorage.removeItem('progressoAlfabetizacao');
  };

  const value = {
    progressoUsuario,
    fasesCompletas,
    marcarFaseCompleta,
    isFaseCompleta,
    getProgressoFase,
    resetarProgresso
  };

  return (
    <ProgressoContext.Provider value={value}>
      {children}
    </ProgressoContext.Provider>
  );
};
