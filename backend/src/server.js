const app = require('./app');
const { sequelize } = require('./models');
const PORT = process.env.PORT || 3002;

async function start(){
  try{
    await sequelize.authenticate();
    console.log('Conexão com SQLite estabelecida.');
  }catch(err){
    console.warn('Falha ao conectar no banco (verifique .env):', err.message);
  }
  app.listen(PORT, ()=>console.log(`Servidor rodando em http://localhost:${PORT}`));
}

start();
