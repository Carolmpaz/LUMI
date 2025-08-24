// controllers/responseController.js

// Simulação de banco de dados em memória
let responses = [
  { id: 1, stimulusId: 1, resposta: "A", correta: true },
  { id: 2, stimulusId: 2, resposta: "B", correta: false }
];

module.exports = {
  getAll: (req, res) => {
    res.json(responses);
  },

  getById: (req, res) => {
    const id = parseInt(req.params.id);
    const resp = responses.find(r => r.id === id);
    if (!resp) {
      return res.status(404).json({ message: "Resposta não encontrada" });
    }
    res.json(resp);
  },

  create: (req, res) => {
    const nova = {
      id: responses.length + 1,
      stimulusId: req.body.stimulusId,
      resposta: req.body.resposta,
      correta: req.body.correta
    };
    responses.push(nova);
    res.status(201).json(nova);
  },

  update: (req, res) => {
    const id = parseInt(req.params.id);
    const index = responses.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Resposta não encontrada" });
    }
    responses[index] = { ...responses[index], ...req.body };
    res.json(responses[index]);
  },

  remove: (req, res) => {
    const id = parseInt(req.params.id);
    const index = responses.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Resposta não encontrada" });
    }
    const removida = responses.splice(index, 1);
    res.json(removida[0]);
  },

  submit: (req, res) => {
    const nova = {
      id: responses.length + 1,
      stimulusId: req.body.stimulusId,
      resposta: req.body.resposta,
      correta: req.body.correta
    };
    responses.push(nova);
    res.status(201).json({ message: "Resposta registrada", data: nova });
  }
};
