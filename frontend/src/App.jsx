import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgressoProvider, useProgresso } from './contexts/ProgressoContext';
import { AdaptabilidadeProvider } from './contexts/AdaptabilidadeContext';
import AuthScreen from './components/AuthScreen';
import Treino from './pages/Treino';
import Dashboard from './pages/Dashboard';
import TrilhaAprendizado from './components/TrilhaAprendizado';
import FaseAprendizado from './components/FaseAprendizado';

function AppContent() {
  const { usuario, carregando, logout } = useAuth();
  const { marcarFaseCompleta } = useProgresso();
  const [paginaAtual, setPaginaAtual] = useState('trilha');
  const [faseAtual, setFaseAtual] = useState(null);

  // Limpar localStorage de progresso antigo ao inicializar
  useEffect(() => {
    // Limpar dados antigos que podem estar causando problemas
    localStorage.removeItem('ultimaFaseIniciada');

    // FORÇAR LOGOUT PARA MOSTRAR TELA DE LOGIN
    localStorage.removeItem('token');
  }, []);

  if (carregando) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <AuthScreen />;
  }

  const handleIniciarFase = (palavra) => {
    setFaseAtual(palavra);
    setPaginaAtual('fase');
  };

  const handleConcluirFase = (resultado) => {
    console.log('Fase concluída:', resultado);

    // Marcar fase como completa usando o contexto
    marcarFaseCompleta(resultado.palavra, resultado);

    setFaseAtual(null);
    setPaginaAtual('trilha');
  };

  const handleVoltarTrilha = () => {
    setFaseAtual(null);
    setPaginaAtual('trilha');
  };

  // Se estiver em uma fase, não mostrar header
  if (paginaAtual === 'fase' && faseAtual) {
    return (
      <FaseAprendizado
        palavra={faseAtual}
        onConcluirFase={handleConcluirFase}
        onVoltarTrilha={handleVoltarTrilha}
      />
    );
  }

  // Se estiver na trilha, não mostrar header
  if (paginaAtual === 'trilha') {
    return (
      <TrilhaAprendizado
        onIniciarFase={handleIniciarFase}
        onAbrirDashboard={() => setPaginaAtual('dashboard')}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0
    }}>
      {/* Header com informações do usuário */}
      <header style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            🎓 Alfabetização IA
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Olá, {usuario.nome}!
            {usuario.tipo === 'crianca' && usuario.perfil?.idade && ` (${usuario.perfil.idade} anos)`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Navegação */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setPaginaAtual('trilha')}
              style={{
                padding: '8px 16px',
                backgroundColor: paginaAtual === 'trilha' ? '#9C27B0' : 'transparent',
                color: paginaAtual === 'trilha' ? 'white' : '#9C27B0',
                border: '2px solid #9C27B0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🎯 Trilha
            </button>

            <button
              onClick={() => setPaginaAtual('dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: paginaAtual === 'dashboard' ? '#007bff' : 'transparent',
                color: paginaAtual === 'dashboard' ? 'white' : '#007bff',
                border: '2px solid #007bff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📊 Dashboard
            </button>

          </div>

    

          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main>
        {paginaAtual === 'dashboard' && <Dashboard />}
        {paginaAtual === 'treino' && <Treino />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressoProvider>
        <AdaptabilidadeProvider>
          <AppContent />
        </AdaptabilidadeProvider>
      </ProgressoProvider>
    </AuthProvider>
  );
}
