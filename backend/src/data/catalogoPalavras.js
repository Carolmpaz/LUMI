// Catálogo de Palavras Simplificado para Alfabetização

const palavras = [
  {
    id: 1,
    palavra: 'CASA',
    dificuldade: 1,
    silabas: ['CA', 'SA'],
    letras: ['C', 'A', 'S', 'A'],
    categoria: 'objeto',
    contexto: 'moradia',
    visual: true,
    auditivo: true,
    tatil: false,
    frequenciaUso: 10,
  },
  {
    id: 2,
    palavra: 'CARRO',
    dificuldade: 2,
    silabas: ['CAR', 'RO'],
    letras: ['C', 'A', 'R', 'R', 'O'],
    categoria: 'veículo',
    contexto: 'transporte',
    visual: true,
    auditivo: true,
    tatil: false,
    frequenciaUso: 8,
  },
  {
    id: 3,
    palavra: 'BOLA',
    dificuldade: 1,
    silabas: ['BO', 'LA'],
    letras: ['B', 'O', 'L', 'A'],
    categoria: 'brinquedos',
    contexto: 'Esta é uma bola para brincar.',
    visual: true,
    auditivo: true,
    tatil: false,
    frequenciaUso: 9,
  },
  {
    id: 4,
    palavra: 'GATO',
    dificuldade: 1,
    silabas: ['GA', 'TO'],
    letras: ['G', 'A', 'T', 'O'],
    categoria: 'animais',
    contexto: 'Este é um gato, um animal de estimação.',
    visual: true,
    auditivo: true,
    tatil: false,
    frequenciaUso: 7,
  },
];

function todas() {
  return palavras;
}

function porNivel(nivel) {
  return palavras.filter((p) => p.dificuldade === nivel);
}

module.exports = {
  todas,
  porNivel,
};
