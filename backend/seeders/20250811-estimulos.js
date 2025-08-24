'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Estimulos', [
      { tipo: 'visual', conteudo: 'A - Abelha', createdAt: new Date(), updatedAt: new Date() },
      { tipo: 'auditivo', conteudo: 'Som - A', createdAt: new Date(), updatedAt: new Date() },
      { tipo: 'tatil', conteudo: 'Touch A', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Estimulos', null, {});
  }
};
