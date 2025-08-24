import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Register({ onToggleMode, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'crianca',
    idade: '',
    responsavel: ''
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { register } = useAuth();

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

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    // Preparar dados para envio
    const dadosUsuario = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      tipo: formData.tipo,
      perfil: {}
    };

    // Adicionar dados específicos do perfil
    if (formData.tipo === 'crianca') {
      dadosUsuario.perfil = {
        idade: parseInt(formData.idade) || null,
        responsavel: formData.responsavel || null,
        nivel: 'iniciante',
        preferencias: ['visual']
      };
    }

    const resultado = await register(dadosUsuario);
    
    if (resultado.sucesso) {
      onSuccess && onSuccess(resultado.usuario);
    } else {
      setErro(resultado.erro);
    }
    
    setCarregando(false);
  };

  const estiloContainer = {
    maxWidth: '450px',
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
    gap: '15px'
  };

  const estiloInput = {
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'Arial, sans-serif'
  };

  const estiloSelect = {
    ...estiloInput,
    backgroundColor: 'white'
  };

  const estiloInputFocus = {
    borderColor: '#28a745'
  };

  const estiloBotao = {
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: carregando ? '#ccc' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: carregando ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    marginTop: '10px'
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
    color: '#28a745',
    textDecoration: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const estiloLabel = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px'
  };

  return (
    <div style={estiloContainer}>
      <h2 style={estiloTitulo}>📝 Criar Conta</h2>
      
      <form onSubmit={handleSubmit} style={estiloForm}>
        <div>
          <label style={estiloLabel}>Nome Completo</label>
          <input
            type="text"
            name="nome"
            placeholder="Digite seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            style={estiloInput}
            onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
        <div>
          <label style={estiloLabel}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={handleChange}
            required
            style={estiloInput}
            onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div>
          <label style={estiloLabel}>Tipo de Usuário</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            style={estiloSelect}
            onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            <option value="crianca">👶 Criança</option>
            <option value="educador">👩‍🏫 Educador</option>
          </select>
        </div>

        {formData.tipo === 'crianca' && (
          <>
            <div>
              <label style={estiloLabel}>Idade</label>
              <input
                type="number"
                name="idade"
                placeholder="Idade da criança"
                value={formData.idade}
                onChange={handleChange}
                min="3"
                max="12"
                style={estiloInput}
                onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            
            <div>
              <label style={estiloLabel}>Nome do Responsável</label>
              <input
                type="text"
                name="responsavel"
                placeholder="Nome do pai/mãe/responsável"
                value={formData.responsavel}
                onChange={handleChange}
                style={estiloInput}
                onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </>
        )}
        
        <div>
          <label style={estiloLabel}>Senha</label>
          <input
            type="password"
            name="senha"
            placeholder="Mínimo 6 caracteres"
            value={formData.senha}
            onChange={handleChange}
            required
            style={estiloInput}
            onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
        <div>
          <label style={estiloLabel}>Confirmar Senha</label>
          <input
            type="password"
            name="confirmarSenha"
            placeholder="Digite a senha novamente"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            style={estiloInput}
            onFocus={(e) => e.target.style.borderColor = estiloInputFocus.borderColor}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
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
              e.target.style.backgroundColor = '#1e7e34';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!carregando) {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {carregando ? '⏳ Criando conta...' : '✨ Criar Conta'}
        </button>
      </form>
      
      <div style={estiloLink}>
        Já tem uma conta?{' '}
        <span style={estiloLinkButton} onClick={onToggleMode}>
          Fazer login
        </span>
      </div>
    </div>
  );
}
