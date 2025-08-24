const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nome é obrigatório' },
        len: { args: [2, 100], msg: 'Nome deve ter entre 2 e 100 caracteres' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Email deve ter um formato válido' },
        notEmpty: { msg: 'Email é obrigatório' }
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Senha é obrigatória' },
        len: { args: [6, 100], msg: 'Senha deve ter pelo menos 6 caracteres' }
      }
    },
    tipo: {
      type: DataTypes.ENUM('crianca', 'educador', 'admin'),
      allowNull: false,
      defaultValue: 'crianca'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ultimoLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    perfil: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('perfil');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('perfil', value ? JSON.stringify(value) : null);
      }
    }
  }, {
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha')) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      }
    }
  });

  // Método para verificar senha
  Usuario.prototype.verificarSenha = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  // Método para obter dados seguros (sem senha)
  Usuario.prototype.toSafeObject = function() {
    const { senha, ...dadosSeguro } = this.toJSON();
    return dadosSeguro;
  };

  return Usuario;
};
