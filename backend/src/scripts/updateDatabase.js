const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configuração do banco
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: console.log
});

async function updateDatabase() {
  try {
    console.log('🔄 Iniciando atualização do banco de dados...');
    
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso.');
    
    // Verificar se a coluna 'palavra' já existe
    const [results] = await sequelize.query(`
      PRAGMA table_info(Eventos);
    `);
    
    const colunaExiste = results.some(col => col.name === 'palavra');
    
    if (colunaExiste) {
      console.log('✅ Coluna "palavra" já existe na tabela Eventos.');
    } else {
      console.log('🔧 Adicionando coluna "palavra" à tabela Eventos...');
      
      // Adicionar coluna palavra
      await sequelize.query(`
        ALTER TABLE Eventos ADD COLUMN palavra TEXT;
      `);
      
      console.log('✅ Coluna "palavra" adicionada com sucesso!');
    }
    
    // Verificar estrutura final
    const [finalResults] = await sequelize.query(`
      PRAGMA table_info(Eventos);
    `);
    
    console.log('\n📋 Estrutura atual da tabela Eventos:');
    finalResults.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n🎉 Atualização do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateDatabase();
}

module.exports = updateDatabase;
