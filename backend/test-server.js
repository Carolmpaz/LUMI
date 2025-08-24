const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

console.log('🚀 Iniciando servidor de teste...');

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

app.post('/api/submit-response', (req, res) => {
  console.log('📝 Resposta recebida:', req.body);
  res.json({ ok: true, message: 'Resposta registrada' });
});

app.get('/api/next-stimulus', (req, res) => {
  console.log('➡️ Próximo estímulo solicitado');
  res.json({ proximoEstimulo: { id: 1, tipo: 'visual' } });
});

app.post('/api/next-stimulus', (req, res) => {
  console.log('➡️ Próximo estímulo (POST)');
  res.json({ proximoEstimulo: { id: 1, tipo: 'visual' } });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
