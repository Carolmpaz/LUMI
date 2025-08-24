const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mock para teste
const mockSession = { id: 1, userId: 1 };
const mockEstimulos = [
  {
    id: 1,
    tipo: 'visual',
    palavra: 'CASA',
    letra: 'C',
    conteudo: 'C - Casa',
    imagem: '/images/casa.jpg'
  },
  {
    id: 2,
    tipo: 'auditivo', 
    palavra: 'CASA',
    letra: 'A',
    conteudo: 'Som da letra A',
    audio: '/audio/letra-a.mp3'
  }
];

// Rotas básicas para teste
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/start-session', (req, res) => {
  console.log('🚀 Iniciando sessão');
  res.json({
    sessionId: mockSession.id,
    estimuloInicial: mockEstimulos[0],
    message: 'Sessão iniciada com sucesso'
  });
});

app.post('/api/submit-response', (req, res) => {
  console.log('📝 Registrando resposta:', req.body);
  res.json({
    ok: true,
    proximoEstimulo: mockEstimulos[1],
    message: 'Resposta registrada com sucesso'
  });
});

app.get('/api/next-stimulus', (req, res) => {
  console.log('➡️ Próximo estímulo solicitado');
  res.json({
    proximoEstimulo: mockEstimulos[0]
  });
});

app.post('/api/next-stimulus', (req, res) => {
  console.log('➡️ Próximo estímulo (POST):', req.body);
  res.json({
    proximoEstimulo: mockEstimulos[0]
  });
});

app.get('/api/trilha-aprendizado', (req, res) => {
  console.log('🎯 Trilha de aprendizado solicitada');
  const trilhaPadrao = [
    { id: 1, palavra: 'CASA', nivel: 1, emoji: '🏠', desbloqueada: true, completa: false, estrelas: 0 },
    { id: 2, palavra: 'BOLA', nivel: 1, emoji: '⚽', desbloqueada: false, completa: false, estrelas: 0 },
    { id: 3, palavra: 'GATO', nivel: 1, emoji: '🐱', desbloqueada: false, completa: false, estrelas: 0 }
  ];

  res.json({
    trilha: trilhaPadrao,
    progresso: {
      totalFases: trilhaPadrao.length,
      fasesCompletas: 0,
      estrelasTotais: 0
    }
  });
});

app.post('/api/concluir-fase', (req, res) => {
  console.log('✅ Fase concluída:', req.body);
  res.json({
    success: true,
    message: 'Fase concluída!',
    pontuacao: 100,
    estrelas: 3
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando em http://localhost:${PORT}`);
  console.log('📋 Rotas disponíveis:');
  console.log('  GET  /api/health');
  console.log('  POST /api/start-session');
  console.log('  POST /api/submit-response');
  console.log('  GET  /api/next-stimulus');
  console.log('  POST /api/next-stimulus');
  console.log('  GET  /api/trilha-aprendizado');
  console.log('  POST /api/concluir-fase');
});
