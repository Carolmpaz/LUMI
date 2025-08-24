const { sequelize } = require('../models');

module.exports = {
  async userMetrics(req, res){
    try{
      const { userId } = req.query;
      if(!userId) return res.status(400).json({ error: 'userId é obrigatório' });
      const [rows] = await sequelize.query(`
        SELECT u.id as userId,
               COUNT(e.id) as tentativas,
               SUM(CASE WHEN e.result = 'correct' THEN 1 ELSE 0 END) as acertos,
               AVG(e."timeSeconds") as tempo_medio
        FROM "Usuarios" u
        LEFT JOIN "Sessions" s ON s."UsuarioId" = u.id
        LEFT JOIN "Eventos" e ON e."SessionId" = s.id
        WHERE u.id = :userId
        GROUP BY u.id;
      `, { replacements: { userId } });
      return res.json(rows && rows[0] ? rows[0] : { userId, tentativas: 0, acertos: 0, tempo_medio: null });
    }catch(e){
      return res.status(500).json({ error: 'Erro ao obter métricas', details: e.message });
    }
  }
};
