const express = require('express');
const router = express.Router();

// rota de teste simples
router.get('/', (req,res)=>{
  res.json([{ id:1, tipo:'visual', conteudo:'A - Abelha' }]);
});

module.exports = router;
