'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      UsuarioId: { type: Sequelize.INTEGER, references: { model: 'Usuarios', key: 'id' } },
      startedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      finishedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('Eventos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      SessionId: { type: Sequelize.INTEGER, references: { model: 'Sessions', key: 'id' } },
      stimulusType: { type: Sequelize.STRING, allowNull: false },
      letter: { type: Sequelize.STRING, allowNull: false },
      stimulusId: { type: Sequelize.INTEGER },
      result: { type: Sequelize.STRING, allowNull: false },
      timeSeconds: { type: Sequelize.FLOAT },
      payload: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Eventos');
    await queryInterface.dropTable('Sessions');
  }
};
