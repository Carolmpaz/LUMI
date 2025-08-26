import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen({ onAuthSuccess }) {
  const [modo, setModo] = useState('login'); // 'login' ou 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [idade, setIdade] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      if (modo === 'login') {
        await login(email, senha);
      } else {
        // Validações do cadastro
        if (senha !== confirmarSenha) {
          setErro('As senhas não coincidem');
          return;
        }
        if (!nome || !email || !senha || !idade) {
          setErro('Todos os campos são obrigatórios');
          return;
        }
        
        await register({
          nome,
          email,
          senha,
          idade: parseInt(idade),
          tipo: 'crianca'
        });
      }
      onAuthSuccess && onAuthSuccess();
    } catch (error) {
      setErro(error.message || (modo === 'login' ? 'Erro ao fazer login' : 'Erro ao criar conta'));
    } finally {
      setCarregando(false);
    }
  };

  const estiloContainer = {
    minHeight: '100vh',
    background: '#916ee3ff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    gap: '80px',
    margin: 0
  };

  const estiloLogo = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1',
    maxWidth: '400px'
  };

  const estiloMascote = {
    width: '1500px',
    height: '600px',
    marginBottom: '20px',
    display: 'block',
    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
    objectFit: 'contain'
  };

  const estiloTitulo = {
    fontSize: '60px',
    fontWeight: 'bold',
    color: '#FFD700',
    margin: '0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    letterSpacing: '3px',
    fontFamily: ' bold, bold 700, sans-serif'
  };

  const estiloFormContainer = {
    background: '#FFF9E6',
    borderRadius: '60px',
    padding: '50px 45px 60px 45px',
    width: '100%',
    maxWidth: '520px',
    textAlign: 'center',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)',
    flex: '1',
    border: 'none'
  };

  const estiloTextoEntrar = {
    fontSize: '16px',
    color: '#3B3B3B',
    marginBottom: '35px',
    fontWeight: '500'
  };

  const estiloInputContainer = {
    position: 'relative',
    marginBottom: '18px'
  };

  const estiloInput = {
    width: '100%',
    padding: '16px 20px 16px 50px',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    backgroundColor: 'white',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  };

  const estiloIcone = {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#aaa'
  };

  const estiloIconeOlho = {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  };

  const estiloBotao = {
    width: '220px',
    padding: '16px',
    backgroundColor: '#916ee3',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '25px',
    marginBottom: '25px',
    boxShadow: '0 6px 20px rgba(145,110,227,0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const estiloLink = {
    color: '#916ee3',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  };

  const estiloErro = {
    color: '#ff4444',
    fontSize: '14px',
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255,68,68,0.2)'
  };

  // Estilos específicos para cadastro
  const estiloContainerCadastro = {
    minHeight: '100vh',
    background: '#916ee3ff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    margin: 0
  };


  const estiloIconeUsuario = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'white',
    border: '4px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '60px',
    color: '#333',
    margin: '0 auto 30px auto',
    position: 'relative',
    zIndex: 1
  };

  const estiloTituloCadastro = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 40px 0',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  };

  const estiloFormContainerCadastro = {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 1
  };

  const estiloInputCadastro = {
    width: '100%',
    padding: '15px 20px 15px 45px',
    border: '2px solid #E0E0E0',
    borderRadius: '10px',
    fontSize: '16px',
    backgroundColor: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    marginBottom: '15px'
  };

  const estiloBotaoCadastro = {
    width: '200px',
    padding: '15px',
    backgroundColor: '#916ee3',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(145,110,227,0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase'
  };

  const estiloLinkCadastro = {
    display: 'inline-block',
    padding: '12px 30px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    color: '#916ee3',
    textDecoration: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0,0,0,0.1)'
  };

  const estiloMascoteCadastro = {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    width: '300px',
    height: '150px',
    objectFit: 'contain',
    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
    zIndex: 10
  };

  if (modo === 'cadastro') {
    return (
      <div style={estiloContainerCadastro}>
        <img src="/lumi-mascote.png" alt="LUMI Mascote" style={estiloMascoteCadastro} />
        <h1 style={estiloTituloCadastro}>Cadastro</h1>
        

        <div style={estiloFormContainerCadastro}>
          {erro && <div style={estiloErro}>{erro}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={estiloInputContainer}>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{...estiloInputCadastro, paddingLeft: '20px'}}
                required
              />
            </div>

            <div style={estiloInputContainer}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{...estiloInputCadastro, paddingLeft: '20px'}}
                required
              />
            </div>

            <div style={estiloInputContainer}>
              <input
                type="number"
                placeholder="Idade"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                style={{...estiloInputCadastro, paddingLeft: '20px'}}
                required
                min="3"
                max="18"
              />
            </div>

            <div style={estiloInputContainer}>
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{...estiloInputCadastro, paddingLeft: '20px'}}
                required
              />
            </div>

            <div style={estiloInputContainer}>
              <input
                type="password"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                style={{...estiloInputCadastro, paddingLeft: '20px'}}
                required
              />
            </div>

            <button 
              type="submit" 
              style={estiloBotaoCadastro}
              disabled={carregando}
              onMouseOver={(e) => {
                if (!carregando) {
                  e.target.style.backgroundColor = '#7A5FE6';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (!carregando) {
                  e.target.style.backgroundColor = '#916ee3';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {carregando ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </form>

          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setModo('login');
              setErro('');
            }}
            style={estiloLinkCadastro}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#7A5FE6';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.8)';
              e.target.style.color = '#916ee3';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Já tem conta? Faça login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={estiloContainer}>
      <div style={estiloLogo}>
        <img src="/lumi-mascote.png" alt="LUMI Mascote" style={estiloMascote} />
      </div>

      <div style={estiloFormContainer}>
        <p style={estiloTextoEntrar}>
          {modo === 'login' ? 'Entre para acessar a plataforma' : 'Cadastro'}
        </p>
        
        {erro && <div style={estiloErro}>{erro}</div>}
        
        <form onSubmit={handleSubmit}>
          {modo === 'cadastro' && (
            <div style={estiloInputContainer}>
              <span style={estiloIcone}>👤</span>
              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={estiloInput}
                required
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          )}

          <div style={estiloInputContainer}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{...estiloInput, paddingLeft: '20px'}}
              required
              onFocus={(e) => {
                e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          {modo === 'cadastro' && (
            <div style={estiloInputContainer}>
              <span style={estiloIcone}>#</span>
              <input
                type="number"
                placeholder="Idade"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                style={estiloInput}
                required
                min="3"
                max="18"
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          )}

          <div style={estiloInputContainer}>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{...estiloInput, paddingLeft: '20px'}}
              required
              onFocus={(e) => {
                e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
            <span 
              style={estiloIconeOlho}
              onClick={() => setMostrarSenha(!mostrarSenha)}
              onMouseOver={(e) => e.target.style.color = '#666'}
              onMouseOut={(e) => e.target.style.color = '#aaa'}
            >
              {mostrarSenha ? '●' : '○'}
            </span>
          </div>

          {modo === 'cadastro' && (
            <div style={estiloInputContainer}>
              <span style={estiloIcone}>🔑</span>
              <input
                type="password"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                style={estiloInput}
                required
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...estiloBotao,
              opacity: carregando ? 0.7 : 1,
              transform: carregando ? 'scale(0.98)' : 'scale(1)'
            }}
            disabled={carregando}
            onMouseOver={(e) => {
              if (!carregando) {
                e.target.style.backgroundColor = '#7A5FE6';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(122,95,230,0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!carregando) {
                e.target.style.backgroundColor = '#916ee3';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(145,110,227,0.4)';
              }
            }}
          >
            {carregando ? 
              (modo === 'login' ? 'Entrando...' : 'Criando conta...') : 
              (modo === 'login' ? 'Entrar' : 'Cadastrar')
            }
          </button>
        </form>

        {modo === 'login' ? (
          <div>
            <a 
              href="#" 
              style={estiloLink}
              onMouseOver={(e) => {
                e.target.style.color = '#7A5FE6';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#916ee3';
                e.target.style.textDecoration = 'none';
              }}
            >
              Esqueceu sua senha?
            </a>
            <br /><br />
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setModo('cadastro');
                setErro('');
              }}
              style={{...estiloLink, fontWeight: 'bold'}}
              onMouseOver={(e) => {
                e.target.style.color = '#7A5FE6';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#916ee3';
                e.target.style.textDecoration = 'none';
              }}
            >
              Não tem conta? Cadastre-se
            </a>
          </div>
        ) : (
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setModo('login');
              setErro('');
            }}
            style={estiloLink}
            onMouseOver={(e) => {
              e.target.style.color = '#5A9BD4';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#6FA8DC';
              e.target.style.textDecoration = 'none';
            }}
          >
            Já tem conta? Faça login
          </a>
        )}
      </div>
    </div>
  );
}
