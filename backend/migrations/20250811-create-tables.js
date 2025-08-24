'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Usuarios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      senha: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.STRING, allowNull: false, defaultValue: 'crianca' },
      ativo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ultimoLogin: { type: Sequelize.DATE, allowNull: true },
      perfil: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.createTable('Estimulos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tipo: { type: Sequelize.STRING, allowNull: false },
      conteudo: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.createTable('Respostas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      resultado: { type: Sequelize.STRING, allowNull: false },
      tempo_segundos: { type: Sequelize.FLOAT },
      UsuarioId: { type: Sequelize.INTEGER, references: { model: 'Usuarios', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Respostas');
    await queryInterface.dropTable('Estimulos');
    await queryInterface.dropTable('Usuarios');
  }
};
