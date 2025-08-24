import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthScreen({ onAuthSuccess }) {
  const [modo, setModo] = useState('login'); // 'login' ou 'register'

  const toggleMode = () => {
    setModo(modo === 'login' ? 'register' : 'login');
  };

  const handleAuthSuccess = (usuario) => {
    console.log('Usuário autenticado:', usuario);
    onAuthSuccess && onAuthSuccess(usuario);
  };

  const estiloContainer = {
    minHeight: '100vh',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloFundo = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    zIndex: -1
  };

  const estiloHeader = {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'white'
  };

  const estiloTituloApp = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  };

  const estiloSubtitulo = {
    fontSize: '18px',
    opacity: 0.9,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  };

  const estiloConteudo = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '500px'
  };

  return (
    <div style={estiloContainer}>
      <div style={estiloFundo}></div>
      
      <div style={estiloConteudo}>
        <div style={estiloHeader}>
          <h1 style={estiloTituloApp}>
            🎓 Alfabetização IA
          </h1>
          <p style={estiloSubtitulo}>
            Sistema inteligente de aprendizagem adaptativa
          </p>
        </div>

        {modo === 'login' ? (
          <Login 
            onToggleMode={toggleMode}
            onSuccess={handleAuthSuccess}
          />
        ) : (
          <Register 
            onToggleMode={toggleMode}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
}
