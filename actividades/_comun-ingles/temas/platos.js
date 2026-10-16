/* Inglés — tema "platos" (comidas del restaurante; se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'platos', nombre: 'Restaurante', icono: '🍽️', palabras: [
    ['SOUP', 'SOPA', '🍲', 1, { art: 'some' }], ['PASTA', 'FIDEOS', '🍝', 1, { art: 'some' }], ['CHICKEN', 'POLLO', '🍗', 1, { art: 'some' }], ['FRIES', 'PAPAS FRITAS', '🍟', 1, { art: 'some' }],
    ['SALAD', 'ENSALADA', '🥗', 2], ['HAMBURGER', 'HAMBURGUESA', '🍔', 2], ['RICE', 'ARROZ', '🍚', 2, { art: 'some' }], ['FISH', 'PESCADO', '🐟', 2, { art: 'some' }],
    ['TACO', 'TACO', '🌮', 3], ['SUSHI', 'SUSHI', '🍣', 3, { art: 'some' }]
  ] });
})(typeof window !== 'undefined' ? window : this);
