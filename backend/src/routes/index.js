// Express routes
const express = require('express');
const router = express.Router();
const stimulusController = require('../controllers/stimulusController');
const authRoutes = require('./auth');
const { authenticateToken, optionalAuth, requireEducator } = require('../middleware/auth');

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de estímulos (protegidas por autenticação)
router.post('/start-session', authenticateToken, stimulusController.startSession);
router.post('/submit-response', authenticateToken, stimulusController.submitResponse);
router.get('/next-stimulus', authenticateToken, stimulusController.nextStimulus);
router.post('/next-stimulus', authenticateToken, stimulusController.nextStimulus);

// Rotas da trilha de aprendizado
router.get('/trilha-aprendizado', authenticateToken, stimulusController.getTrilhaAprendizado);
router.post('/concluir-fase', authenticateToken, stimulusController.concluirFase);

// Rotas de analytics e métricas
router.get('/analytics', authenticateToken, stimulusController.getUserAnalytics);
router.get('/adaptive-config', authenticateToken, stimulusController.getAdaptiveConfig);
router.put('/adaptive-config', requireEducator, stimulusController.updateAdaptiveConfig);
router.get('/report', authenticateToken, stimulusController.generateReport);

// Rota de teste (pública)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
