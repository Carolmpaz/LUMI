const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// models
const Usuario = require('./usuario')(sequelize, DataTypes);
const Estimulo = require('./estimulo')(sequelize, DataTypes);
const Resposta = require('./resposta')(sequelize, DataTypes);

// associations (simple)
Usuario.hasMany(Resposta);
Resposta.belongsTo(Usuario);



const Session = require('./session')(sequelize, DataTypes);
const Evento = require('./evento')(sequelize, DataTypes);

// Definir associações
Usuario.hasMany(Session, { foreignKey: 'UsuarioId', as: 'sessoes' });
Session.belongsTo(Usuario, { foreignKey: 'UsuarioId', as: 'usuario' });

Session.hasMany(Evento, { foreignKey: 'SessionId', as: 'eventos' });
Evento.belongsTo(Session, { foreignKey: 'SessionId', as: 'sessao' });

module.exports = { sequelize, Sequelize, Usuario, Estimulo, Resposta, Session, Evento };