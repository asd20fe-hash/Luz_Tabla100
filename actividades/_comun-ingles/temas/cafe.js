/* Inglés — tema "cafe" (bebidas y cosas ricas del café y del cine; se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'cafe', nombre: 'Café', icono: '☕', palabras: [
    ['JUICE', 'JUGO', '🧃', 1], ['WATER', 'AGUA', '💧', 1, { art: 'some' }], ['DONUT', 'DONA', '🍩', 1], ['CUPCAKE', 'MUFFIN', '🧁', 1], ['POPCORN', 'POCHOCLOS', '🍿', 1, { art: 'some' }],
    ['TEA', 'TÉ', '🍵', 2, { art: 'some' }], ['SANDWICH', 'SÁNDWICH', '🥪', 2], ['HOT DOG', 'PANCHO', '🌭', 2], ['CROISSANT', 'MEDIALUNA', '🥐', 2],
    ['HOT CHOCOLATE', 'CHOCOLATADA', '☕', 3, { art: 'some' }], ['MILKSHAKE', 'LICUADO', '🥤', 3]
  ] });
})(typeof window !== 'undefined' ? window : this);
