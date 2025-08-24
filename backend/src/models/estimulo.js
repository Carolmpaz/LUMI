module.exports = (sequelize, DataTypes) => {
  const Estimulo = sequelize.define('Estimulo', {
    tipo: { type: DataTypes.STRING, allowNull: false },
    conteudo: { type: DataTypes.STRING, allowNull: false }
  });
  return Estimulo;
};
