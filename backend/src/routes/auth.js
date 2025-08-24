const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireOwnerOrAdmin } = require('../middleware/auth');

// Rotas públicas (não requerem autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas protegidas (requerem autenticação)
router.get('/me', authenticateToken, authController.me);
router.post('/logout', authenticateToken, authController.logout);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
