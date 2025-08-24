const { Estimulo, Evento } = require('../models');

// Heurística simples baseada nos últimos 5 eventos da sessão
async function escolherEstimulo(sessionId){
  const recentes = await Evento.findAll({ where: { SessionId: sessionId }, order: [['createdAt','DESC']], limit: 5 });
  // contagem de desempenho por tipo
  const score = { visual: 0, auditivo: 0, tatil: 0 };
  for(const ev of recentes){
    const delta = ev.result === 'correct' ? 1 : ev.result === 'wrong' ? -1 : -0.5;
    score[ev.stimulusType] = (score[ev.stimulusType] || 0) + delta;
  }
  // escolha: se um tipo estiver indo mal, troque; senão, mantenha variedade
  const tipos = ['visual','auditivo','tatil'];
  let proximo = 'visual';
  if(recentes.length){
    const ultimo = recentes[0].stimulusType;
    const pior = Object.entries(score).sort((a,b)=>a[1]-b[1])[0][0];
    proximo = (score[ultimo] < 0) ? (pior !== ultimo ? pior : tipos.find(t=>t!==ultimo)) : tipos.find(t=>t!==ultimo) || 'visual';
  }
  // pega um estímulo do tipo escolhido
  const est = await Estimulo.findOne({ where: { tipo: proximo }, order: [['id','ASC']] });
  if(!est){
    // fallback se não houver seed correspondente
    return { tipo: 'visual', conteudo: 'A - Abelha', id: null, letter: 'A' };
  }
  // tentar inferir letter a partir do conteúdo ("A - Abelha")
  const letter = (est.conteudo && est.conteudo[0]) || 'A';
  return { id: est.id, tipo: est.tipo, conteudo: est.conteudo, letter };
}

module.exports = { escolherEstimulo };
