/* Inglés — tema "numeros" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'numeros', nombre: 'Números', icono: '🔢', sinArticulo: true, palabras: [
    ['ONE', 'UNO', '1', 1, { n: 1 }], ['TWO', 'DOS', '2', 1, { n: 2 }], ['THREE', 'TRES', '3', 1, { n: 3 }], ['FOUR', 'CUATRO', '4', 1, { n: 4 }], ['FIVE', 'CINCO', '5', 1, { n: 5 }],
    ['SIX', 'SEIS', '6', 2, { n: 6 }], ['SEVEN', 'SIETE', '7', 2, { n: 7 }], ['EIGHT', 'OCHO', '8', 2, { n: 8 }], ['NINE', 'NUEVE', '9', 2, { n: 9 }], ['TEN', 'DIEZ', '10', 2, { n: 10 }]
  ] });
})(typeof window !== 'undefined' ? window : this);
