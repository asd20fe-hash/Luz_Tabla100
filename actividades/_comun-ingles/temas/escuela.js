/* Inglés — tema "escuela" (útiles y el aula; se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo, nivel, extra]
   plural: se dice sin artículo ("the scissors"). noEntra: no va en la mochila (juego "Pack the bag!": "Where is the chair?"). */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'escuela', nombre: 'Escuela', icono: '🏫', palabras: [
    ['PENCIL', 'LÁPIZ', '✏️', 1], ['CRAYON', 'CRAYÓN', '🖍️', 1], ['SCISSORS', 'TIJERA', '✂️', 1, { art: '', plural: true }], ['BAG', 'MOCHILA', '🎒', 1, { noEntra: true }],
    ['RULER', 'REGLA', '📏', 2], ['NOTEBOOK', 'CUADERNO', '📓', 2], ['PAINTBRUSH', 'PINCEL', '🖌️', 2], ['PAPER', 'PAPEL', '📄', 2, { art: 'some' }],
    ['CHAIR', 'SILLA', '🪑', 3, { noEntra: true }], ['CLOCK', 'RELOJ', '🕐', 3, { noEntra: true }]
  ] });
})(typeof window !== 'undefined' ? window : this);
