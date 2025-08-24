import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ onToggleMode, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErro(''); // Limpar erro ao digitar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    const resultado = await login(formData.email, formData.senha);
    
    if (resultado.sucesso) {
      onSuccess && onSuccess(resultado.usuario);
    } else {
      setErro(resultado.erro);
    }
    
    setCarregando(false);
  };

  const estiloContainer = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloTitulo = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: 'bold'
  };

  const estiloForm = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const estiloInput = {
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloInputFocus = {
    borderColor: '#007bff'
  };

  const estiloBotao = {
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: carregando ? '#ccc' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: carregando ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  };

  const estiloErro = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    textAlign: 'center',
    fontSize: '14px'
  };

  const estiloLink = {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  };

  const estiloLinkButton = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const estiloUsuariosDemo = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#666'
  };

  return (
    <div style={estiloContainer}>
      <h2 style={estiloTitulo}>🎓 Entrar</h2>
      
      <form onSubmit={handleSubmit} style={estiloForm}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={estiloInput}
          onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
          style={estiloInput}
          onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        
        {erro && (
          <div style={estiloErro}>
            {erro}
          </div>
        )}
        
        <button
          type="submit"
          disabled={carregando}
          style={estiloBotao}
          onMouseOver={(e) => {
            if (!carregando) {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!carregando) {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {carregando ? '⏳ Entrando...' : '🚀 Entrar'}
        </button>
      </form>
      
      <div style={estiloLink}>
        Não tem uma conta?{' '}
        <span style={estiloLinkButton} onClick={onToggleMode}>
          Criar conta
        </span>
      </div>

      <div style={estiloUsuariosDemo}>
        <strong>👥 Usuários de demonstração:</strong><br/>
        <strong>Criança:</strong> joao@teste.com / 123456<br/>
        <strong>Educador:</strong> maria@escola.com / educadora123<br/>
        <strong>Admin:</strong> admin@alfabetizacao.com / admin123
      </div>
    </div>
  );
}
