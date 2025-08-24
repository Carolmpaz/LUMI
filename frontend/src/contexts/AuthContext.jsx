import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null); // Não carregar token automaticamente
  const [carregando, setCarregando] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configurar axios para incluir token automaticamente
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const verificarToken = async () => {
      // Verificar se há token salvo no localStorage
      const tokenSalvo = localStorage.getItem('token');

      if (tokenSalvo === 'mock-token') {
        // Restaurar sessão mock
        const mockUser = {
          id: 1,
          nome: 'Usuário Teste',
          email: 'teste@teste.com'
        };
        setToken(tokenSalvo);
        setUsuario(mockUser);
        setIsAuthenticated(true);
      } else {
        // Limpar qualquer token inválido
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
        setIsAuthenticated(false);
      }

      setCarregando(false);
    };

    verificarToken();
  }, []); // Executar apenas uma vez ao carregar

  const login = async (email, senha) => {
    try {
      // Validação básica
      if (!email || !senha) {
        return {
          sucesso: false,
          erro: 'Email e senha são obrigatórios'
        };
      }

      // Modo desenvolvimento - aceitar qualquer email/senha
      const mockUser = {
        id: 1,
        nome: email.split('@')[0] || 'Usuário',
        email: email
      };

      setToken('mock-token');
      setUsuario(mockUser);
      localStorage.setItem('token', 'mock-token');
      setIsAuthenticated(true);

      return { sucesso: true, usuario: mockUser };

      // Código original comentado para desenvolvimento
      // const response = await axios.post('http://localhost:3002/api/auth/login', {
      //   email,
      //   senha
      // });

      // const { token: novoToken, usuario: dadosUsuario } = response.data;

      // setToken(novoToken);
      // setUsuario(dadosUsuario);
      // localStorage.setItem('token', novoToken);

      // return { sucesso: true, usuario: dadosUsuario };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        erro: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const register = async (dadosUsuario) => {
    try {
      // Modo desenvolvimento - aceitar qualquer registro
      console.log('🔧 Modo desenvolvimento: Registro local ativado');

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // Criar usuário baseado nos dados fornecidos
      const dadosNovoUsuario = {
        id: Math.random().toString(36).substr(2, 9),
        nome: dadosUsuario.nome || 'Usuário',
        email: dadosUsuario.email,
        tipo: dadosUsuario.tipo || 'crianca',
        dataCriacao: new Date().toISOString(),
        configuracoes: {
          tema: 'claro',
          som: true,
          animacoes: true
        }
      };

      // Gerar token simulado
      const novoToken = 'dev-token-' + Math.random().toString(36).substr(2, 15);

      setToken(novoToken);
      setUsuario(dadosNovoUsuario);
      localStorage.setItem('token', novoToken);
      localStorage.setItem('usuario', JSON.stringify(dadosNovoUsuario));
      setIsAuthenticated(true);

      console.log('✅ Registro realizado com sucesso (modo desenvolvimento):', dadosNovoUsuario);

      return { sucesso: true, usuario: dadosNovoUsuario };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return {
        sucesso: false,
        erro: 'Erro ao criar conta (modo desenvolvimento)'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🔧 Modo desenvolvimento: Logout local');

      // Não tentar conectar ao backend em modo desenvolvimento
      // if (token) {
      //   await axios.post('http://localhost:3002/api/auth/logout');
      // }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('ultimaFaseIniciada');
      delete axios.defaults.headers.common['Authorization'];

      console.log('✅ Logout realizado com sucesso (modo desenvolvimento)');
    }
  };

  const atualizarPerfil = async (novosDados) => {
    try {
      console.log('🔧 Modo desenvolvimento: Atualização de perfil local');

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      // Atualizar dados localmente
      const usuarioAtualizado = {
        ...usuario,
        ...novosDados,
        dataAtualizacao: new Date().toISOString()
      };

      setUsuario(usuarioAtualizado);
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

      console.log('✅ Perfil atualizado com sucesso (modo desenvolvimento):', usuarioAtualizado);

      return { sucesso: true, usuario: usuarioAtualizado };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return {
        sucesso: false,
        erro: 'Erro ao atualizar perfil (modo desenvolvimento)'
      };
    }
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    try {
      await axios.put('http://localhost:3002/api/auth/change-password', {
        senhaAtual,
        novaSenha
      });
      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        sucesso: false,
        erro: error.response?.data?.error || 'Erro ao alterar senha'
      };
    }
  };

  const value = {
    usuario,
    token,
    carregando,
    isAuthenticated,
    estaLogado: !!usuario,
    login,
    register,
    logout,
    atualizarPerfil,
    alterarSenha
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
