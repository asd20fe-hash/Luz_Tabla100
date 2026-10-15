/* Inglés — tema "comida" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'comida', nombre: 'Comida', icono: '🍎', palabras: [
    ['APPLE', 'MANZANA', '🍎', 1], ['BANANA', 'BANANA', '🍌', 1], ['MILK', 'LECHE', '🥛', 1, { art: 'some' }], ['CAKE', 'TORTA', '🎂', 1, { art: 'some' }],
    ['BREAD', 'PAN', '🍞', 2, { art: 'some' }], ['EGG', 'HUEVO', '🥚', 2], ['CHEESE', 'QUESO', '🧀', 2, { art: 'some' }], ['COOKIE', 'GALLETITA', '🍪', 2], ['CARROT', 'ZANAHORIA', '🥕', 2],
    ['STRAWBERRY', 'FRUTILLA', '🍓', 3], ['PEAR', 'PERA', '🍐', 3], ['GRAPES', 'UVAS', '🍇', 3, { art: 'some' }], ['PIZZA', 'PIZZA', '🍕', 3, { art: 'some' }], ['ICE CREAM', 'HELADO', '🍦', 3, { art: 'some' }]
  ] });
})(typeof window !== 'undefined' ? window : this);
