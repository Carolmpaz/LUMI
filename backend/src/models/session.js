module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    finishedAt: { type: DataTypes.DATE, allowNull: true }
  });



  return Session;
};
