const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'alfabetizacao_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

module.exports = {
  // Registrar novo usuário
  async register(req, res) {
    try {
      const { nome, email, senha, tipo = 'crianca', perfil = {} } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({
          error: 'Nome, email e senha são obrigatórios'
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          error: 'Senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }

      // Criar usuário
      const usuario = await Usuario.create({
        nome,
        email,
        senha,
        tipo,
        perfil,
        ativo: true
      });

      // Gerar token
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Retornar dados seguros
      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        usuario: usuario.toSafeObject()
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Tratar erros de validação do Sequelize
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors
        });
      }

      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  },

  // Login de usuário
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        return res.status(401).json({
          error: 'Usuário desativado. Entre em contato com o administrador.'
        });
      }

      // Verificar senha
      const senhaValida = await usuario.verificarSenha(senha);
      if (!senhaValida) {
        return res.status(401).json({
          error: 'Email ou senha incorretos'
        });
      }

      // Atualizar último login
      await usuario.update({ ultimoLogin: new Date() });

      // Gerar token
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: usuario.toSafeObject()
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  },

  // Verificar token e retornar dados do usuário
  async me(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id);
      
      if (!usuario || !usuario.ativo) {
        return res.status(401).json({
          error: 'Usuário não encontrado ou desativado'
        });
      }

      return res.json({
        usuario: usuario.toSafeObject()
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  },

  // Logout (invalidar token - implementação básica)
  async logout(req, res) {
    try {
      // Em uma implementação mais robusta, você manteria uma blacklist de tokens
      // Por enquanto, apenas retornamos sucesso
      return res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(req, res) {
    try {
      const { nome, perfil } = req.body;
      const usuario = await Usuario.findByPk(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Atualizar dados
      const dadosAtualizacao = {};
      if (nome) dadosAtualizacao.nome = nome;
      if (perfil) dadosAtualizacao.perfil = perfil;

      await usuario.update(dadosAtualizacao);

      return res.json({
        message: 'Perfil atualizado com sucesso',
        usuario: usuario.toSafeObject()
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  },

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          error: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const usuario = await Usuario.findByPk(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      // Verificar senha atual
      const senhaValida = await usuario.verificarSenha(senhaAtual);
      if (!senhaValida) {
        return res.status(401).json({
          error: 'Senha atual incorreta'
        });
      }

      // Atualizar senha
      await usuario.update({ senha: novaSenha });

      return res.json({
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
};
