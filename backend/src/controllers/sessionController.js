const { Session, Usuario } = require('../models');

module.exports = {
  async start(req, res){
    try{
      const { userId, nome } = req.body || {};
      let user = null;
      if(userId){
        user = await Usuario.findByPk(userId);
      }
      if(!user){
        user = await Usuario.create({ nome: nome || 'Aluno' });
      }
      const session = await Session.create({ UsuarioId: user.id });
      return res.json({ sessionId: session.id, userId: user.id });
    }catch(e){
      return res.status(500).json({ error: 'Erro ao iniciar sessão', details: e.message });
    }
  },
  async end(req, res){
    try{
      const { sessionId } = req.body;
      const s = await Session.findByPk(sessionId);
      if(!s) return res.status(404).json({ error: 'Sessão não encontrada' });
      s.finishedAt = new Date();
      await s.save();
      return res.json({ ok: true });
    }catch(e){
      return res.status(500).json({ error: 'Erro ao finalizar sessão', details: e.message });
    }
  }
};
