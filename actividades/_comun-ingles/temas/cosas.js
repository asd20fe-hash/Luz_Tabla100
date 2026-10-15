/* Inglés — tema "cosas" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'cosas', nombre: 'Cosas', icono: '⚽', palabras: [
    ['BALL', 'PELOTA', '⚽', 1], ['CAR', 'AUTO', '🚗', 1], ['BOOK', 'LIBRO', '📖', 1], ['STAR', 'ESTRELLA', '⭐', 1], ['SUN', 'SOL', '☀️', 1],
    ['MOON', 'LUNA', '🌙', 2], ['TREE', 'ÁRBOL', '🌳', 2], ['FLOWER', 'FLOR', '🌸', 2], ['BIKE', 'BICI', '🚲', 2], ['HOUSE', 'CASA', '🏠', 2],
    ['TEDDY BEAR', 'OSITO', '🧸', 3], ['KITE', 'BARRILETE', '🪁', 3], ['BUS', 'COLECTIVO', '🚌', 3], ['UMBRELLA', 'PARAGUAS', '☂️', 3]
  ] });
})(typeof window !== 'undefined' ? window : this);
