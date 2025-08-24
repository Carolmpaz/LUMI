const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'alfabetizacao_secret_key_2024';

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        error: 'Token inválido ou usuário desativado'
      });
    }

    // Adicionar dados do usuário à requisição
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar tipos de usuário específicos
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.usuario.tipo)) {
      return res.status(403).json({
        error: 'Acesso negado. Permissão insuficiente.',
        required: roles,
        current: req.usuario.tipo
      });
    }

    next();
  };
};

// Middleware para verificar se é admin
const requireAdmin = requireRole('admin');

// Middleware para verificar se é educador ou admin
const requireEducator = requireRole('educador', 'admin');

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnerOrAdmin = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.userId || req.params.id);
    
    if (req.usuario.tipo === 'admin' || req.usuario.id === targetUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id);
      
      if (usuario && usuario.ativo) {
        req.usuario = {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          tipo: usuario.tipo
        };
      }
    }

    next();
  } catch (error) {
    // Ignorar erros de token em auth opcional
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireEducator,
  requireOwnerOrAdmin,
  optionalAuth
};
