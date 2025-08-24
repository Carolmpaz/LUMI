module.exports = (sequelize, DataTypes) => {
  const Evento = sequelize.define('Evento', {
    stimulusType: { type: DataTypes.STRING, allowNull: false }, // visual | auditivo | tatil
    letter: { type: DataTypes.STRING, allowNull: false },
    palavra: { type: DataTypes.STRING, allowNull: true }, // Nova coluna para palavra completa
    stimulusId: { type: DataTypes.INTEGER, allowNull: true },
    result: { type: DataTypes.STRING, allowNull: false },
    timeSeconds: { type: DataTypes.FLOAT, allowNull: true },
    payload: { type: DataTypes.TEXT, allowNull: true }
  });



  return Evento;
};
