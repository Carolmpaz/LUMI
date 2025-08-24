'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');

    // Inserir usuários de teste
    await queryInterface.bulkInsert('Usuarios', [
      {
        nome: 'Admin Sistema',
        email: 'admin@alfabetizacao.com',
        senha: await bcrypt.hash('admin123', 10),
        tipo: 'admin',
        ativo: true,
        perfil: JSON.stringify({
          nivel: 'administrador',
          permissoes: ['gerenciar_usuarios', 'visualizar_relatorios']
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Educadora Maria',
        email: 'maria@escola.com',
        senha: await bcrypt.hash('educadora123', 10),
        tipo: 'educador',
        ativo: true,
        perfil: JSON.stringify({
          escola: 'Escola Municipal ABC',
          turmas: ['1º Ano A', '1º Ano B'],
          especialidade: 'alfabetizacao'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: await bcrypt.hash('123456', 10),
        tipo: 'crianca',
        ativo: true,
        perfil: JSON.stringify({
          idade: 6,
          nivel: 'iniciante',
          preferencias: ['visual', 'auditivo'],
          responsavel: 'Maria Silva'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Ana Costa',
        email: 'ana@teste.com',
        senha: await bcrypt.hash('123456', 10),
        tipo: 'crianca',
        ativo: true,
        perfil: JSON.stringify({
          idade: 7,
          nivel: 'intermediario',
          preferencias: ['tatil', 'visual'],
          responsavel: 'Carlos Costa'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estimulos', null, {});
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};
