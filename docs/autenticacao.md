# 🔐 Sistema de Autenticação

## Visão Geral

O sistema de autenticação foi implementado usando JWT (JSON Web Tokens) e bcrypt para hash de senhas, proporcionando segurança e facilidade de uso.

## 🏗️ Arquitetura

### Backend
- **JWT**: Tokens seguros para autenticação
- **bcrypt**: Hash seguro de senhas
- **Middleware**: Proteção automática de rotas
- **Validações**: Verificação de dados e permissões

### Frontend
- **Context API**: Gerenciamento global de estado de autenticação
- **Componentes**: Telas de login e cadastro responsivas
- **Interceptors**: Inclusão automática de tokens nas requisições

## 👥 Tipos de Usuário

### 1. Criança (`crianca`)
- **Acesso**: Sistema de treino e jogos
- **Perfil**: Idade, responsável, nível, preferências
- **Funcionalidades**: Sessões de aprendizagem personalizadas

### 2. Educador (`educador`)
- **Acesso**: Dashboard de alunos, relatórios
- **Perfil**: Escola, turmas, especialidade
- **Funcionalidades**: Acompanhamento de progresso, configurações

### 3. Administrador (`admin`)
- **Acesso**: Gerenciamento completo do sistema
- **Perfil**: Permissões administrativas
- **Funcionalidades**: Gestão de usuários, configurações globais

## 🔑 Endpoints da API

### Autenticação Pública
```
POST /api/auth/register - Criar nova conta
POST /api/auth/login    - Fazer login
```

### Autenticação Protegida
```
GET  /api/auth/me              - Dados do usuário atual
POST /api/auth/logout          - Fazer logout
PUT  /api/auth/profile         - Atualizar perfil
PUT  /api/auth/change-password - Alterar senha
```

### Rotas do Sistema (Protegidas)
```
POST /api/start-session    - Iniciar sessão de treino
POST /api/submit-response  - Registrar resposta
GET  /api/next-stimulus    - Obter próximo estímulo
```

## 🛡️ Segurança

### Senhas
- **Hash**: bcrypt com salt rounds = 10
- **Validação**: Mínimo 6 caracteres
- **Verificação**: Comparação segura com hash

### Tokens JWT
- **Expiração**: 7 dias por padrão
- **Payload**: ID, email, tipo de usuário
- **Verificação**: Middleware automático

### Middleware de Proteção
- `authenticateToken`: Verificação obrigatória de token
- `requireRole`: Verificação de tipo de usuário específico
- `requireAdmin`: Acesso apenas para administradores
- `requireEducator`: Acesso para educadores e admins
- `requireOwnerOrAdmin`: Acesso aos próprios dados ou admin

## 📱 Interface do Usuário

### Tela de Login
- **Campos**: Email e senha
- **Validação**: Formato de email, campos obrigatórios
- **Feedback**: Mensagens de erro claras
- **Demo**: Usuários de demonstração pré-cadastrados

### Tela de Cadastro
- **Campos**: Nome, email, senha, tipo, dados específicos
- **Validação**: Confirmação de senha, dados obrigatórios
- **Tipos**: Seleção entre criança e educador
- **Perfil**: Campos específicos por tipo de usuário

### Header Autenticado
- **Informações**: Nome do usuário, tipo, dados do perfil
- **Ações**: Logout fácil e rápido
- **Visual**: Badge colorido por tipo de usuário

## 🔄 Fluxo de Autenticação

### 1. Registro/Login
```
Usuário → Formulário → API → Validação → Token → Context → Interface
```

### 2. Requisições Protegidas
```
Context → Token → Headers → API → Middleware → Controller → Response
```

### 3. Logout
```
Usuário → Logout → API → Context → LocalStorage → Redirect
```

## 🧪 Usuários de Demonstração

### Criança
- **Email**: joao@teste.com
- **Senha**: 123456
- **Perfil**: 6 anos, nível iniciante

### Educador
- **Email**: maria@escola.com
- **Senha**: educadora123
- **Perfil**: Escola Municipal ABC

### Administrador
- **Email**: admin@alfabetizacao.com
- **Senha**: admin123
- **Perfil**: Acesso completo

## 🚀 Como Usar

### 1. Acesse a aplicação
```
http://localhost:3000
```

### 2. Faça login ou crie uma conta
- Use os usuários de demonstração
- Ou crie uma nova conta

### 3. Explore o sistema
- Crianças: Acesso direto ao treino
- Educadores: Dashboard e relatórios
- Admins: Gerenciamento completo

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
```env
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
PORT=3002
```

### Configuração do Frontend
```javascript
// src/contexts/AuthContext.jsx
const API_BASE_URL = 'http://localhost:3002/api';
```

## 🛠️ Desenvolvimento

### Adicionar Nova Rota Protegida
```javascript
// Backend
router.get('/nova-rota', authenticateToken, controller.metodo);

// Frontend - Token incluído automaticamente
const response = await axios.get('/api/nova-rota');
```

### Verificar Permissões
```javascript
// Backend
router.get('/admin-only', requireAdmin, controller.metodo);

// Frontend
const { usuario } = useAuth();
if (usuario.tipo === 'admin') {
  // Mostrar conteúdo admin
}
```

## ✅ Status

- [x] Sistema de registro e login
- [x] Autenticação JWT
- [x] Middleware de proteção
- [x] Interface responsiva
- [x] Gerenciamento de estado
- [x] Integração com sistema existente
- [x] Usuários de demonstração
- [x] Documentação completa
