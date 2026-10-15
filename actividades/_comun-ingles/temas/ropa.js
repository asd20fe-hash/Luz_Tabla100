/* Inglés — tema "ropa" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra]
   plural: se dice sin artículo ("red glasses", "the shoes"). Cada prenda tiene su modelo 3D en ropa3d.js y su lugar en ropa.js (SLOT). */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'ropa', nombre: 'Ropa', icono: '👗', palabras: [
    ['HAT', 'SOMBRERO', '🎩', 1], ['GLASSES', 'ANTEOJOS', '👓', 1, { art: '', plural: true }], ['SHOES', 'ZAPATILLAS', '👟', 1, { art: '', plural: true }], ['BOW', 'MOÑO', '🎀', 1],
    ['SCARF', 'BUFANDA', '🧣', 2], ['CAP', 'GORRA', '🧢', 2],
    ['CROWN', 'CORONA', '👑', 3]
  ] });
})(typeof window !== 'undefined' ? window : this);
