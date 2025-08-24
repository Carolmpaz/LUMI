module.exports = (sequelize, DataTypes) => {
  const Resposta = sequelize.define('Resposta', {
    resultado: { type: DataTypes.STRING, allowNull: false },
    tempo_segundos: { type: DataTypes.FLOAT, allowNull: true },
    meta: { type: DataTypes.TEXT, allowNull: true }
  });
  return Resposta;
};
