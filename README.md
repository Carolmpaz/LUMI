# 🎓 IA Alfabetização Adaptativa

Sistema inteligente para ensino de alfabetização que adapta os estímulos de aprendizagem baseado no desempenho da criança.

## 📋 Status do Projeto

### ✅ Semana 1 - Protótipo Inicial (CONCLUÍDA)
- [x] Configuração do ambiente (Backend Node.js + Frontend React)
- [x] Sistema de estímulos visuais (letras coloridas + imagens)
- [x] Sistema de estímulos auditivos (reprodução de áudio simulada)
- [x] Sistema de estímulos táteis (animações e feedback visual)
- [x] Backend completo para sessões e coleta de dados
- [x] Interface funcional para teste dos estímulos

### ✅ Sistema de Autenticação (CONCLUÍDO)
- [x] Login e cadastro com JWT
- [x] Três tipos de usuário (criança, educador, admin)
- [x] Middleware de proteção de rotas
- [x] Interface responsiva de autenticação
- [x] Integração completa com sistema existente
- [x] Usuários de demonstração

### ✅ Semana 2 - IA Adaptativa Avançada (CONCLUÍDA)
- [x] Algoritmo heurístico inteligente para seleção de estímulos
- [x] Sistema completo de analytics e métricas
- [x] Dashboard interativo para todos os tipos de usuário
- [x] Relatórios detalhados com exportação CSV
- [x] Configurações personalizáveis do algoritmo
- [x] Recomendações automáticas baseadas em padrões

### 🔄 Próximas Etapas
- [ ] Semana 3: Testes com dados reais e ajustes
- [ ] Semana 4+: Evolução para IA com machine learning

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou usar Supabase como configurado)

### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed  # Criar usuários de demonstração
npm run dev
```
O backend estará rodando em `http://localhost:3002`

### Frontend
```bash
cd frontend
npm install
npm start
```
O frontend estará rodando em `http://localhost:3000`

## 🎮 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- **Login/Cadastro**: Interface completa com validações
- **Tipos de Usuário**: Criança, Educador, Administrador
- **Segurança**: JWT + bcrypt para proteção de dados
- **Proteção**: Middleware automático para rotas sensíveis

### 👥 Usuários de Demonstração
- **Criança**: joao@teste.com / 123456
- **Educador**: maria@escola.com / educadora123
- **Admin**: admin@alfabetizacao.com / admin123

### 🎯 Tipos de Estímulos
1. **Visual**: Letras coloridas com imagens associadas (ex: A - Abelha 🐝)
2. **Auditivo**: Reprodução de áudio da letra (simulado)
3. **Tátil**: Interação por toque com animações e feedback

### 📊 Sistema de Sessões
- Criação de sessões por usuário autenticado
- Registro de todas as interações (acertos, erros, tempo)
- Histórico completo de respostas
- Vinculação automática ao usuário logado

### 🤖 IA Adaptativa Avançada
- **Algoritmo Inteligente**: Análise de padrões de aprendizagem
- **Decisões Contextuais**: Baseadas em histórico + sessão atual
- **Personalização**: Adaptação ao perfil individual do usuário
- **Configurável**: Parâmetros ajustáveis por educadores
- **Preditiva**: Recomendações automáticas de melhoria

### 📊 Sistema de Analytics
- **Métricas Detalhadas**: Taxa de acerto, tempo de resposta, progresso
- **Análise por Tipo**: Desempenho em estímulos visuais, auditivos e táteis
- **Padrões de Aprendizagem**: Identificação automática de tendências
- **Relatórios Exportáveis**: Dados em formato CSV para análise externa

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **Usuarios**: Dados das crianças
- **Sessions**: Sessões de treino
- **Eventos**: Registro de cada interação
- **Estimulos**: Catálogo de estímulos disponíveis

## 🎨 Interface

A interface foi projetada para ser:
- **Intuitiva**: Botões grandes e coloridos
- **Responsiva**: Funciona em diferentes tamanhos de tela
- **Acessível**: Cores contrastantes e feedback visual claro
- **Engajante**: Animações e emojis para manter a atenção

## 📊 Coleta de Dados

O sistema coleta automaticamente:
- Tipo de estímulo apresentado
- Letra sendo ensinada
- Resultado da resposta (acerto/erro/pular)
- Tempo de resposta
- Dados contextuais (payload JSON)

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js + Express
- Sequelize ORM
- PostgreSQL
- CORS habilitado

### Frontend
- React 18
- Axios para requisições
- CSS-in-JS para estilização
- Componentes funcionais com hooks

## 📈 Próximos Desenvolvimentos

### Semana 2 - IA Adaptativa
- Algoritmo heurístico mais sofisticado
- Dashboard para visualização de métricas
- Análise de padrões de aprendizagem

### Semana 3 - Validação
- Testes com grupo de crianças
- Coleta de feedback dos educadores
- Ajustes baseados em dados reais

### Semana 4+ - Machine Learning
- Implementação de Q-learning ou bandit algorithms
- Sistema que aprende automaticamente
- Personalização por perfil de criança
