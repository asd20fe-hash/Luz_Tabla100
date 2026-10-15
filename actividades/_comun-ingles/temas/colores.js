/* Inglés — tema "colores" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'colores', nombre: 'Colores', icono: '🎨', sinArticulo: true, palabras: [
    ['RED', 'ROJO', '#e63946', 1], ['BLUE', 'AZUL', '#1f6fe5', 1], ['GREEN', 'VERDE', '#22a04b', 1], ['YELLOW', 'AMARILLO', '#f6c40f', 1],
    ['PINK', 'ROSA', '#f472b6', 2], ['PURPLE', 'VIOLETA', '#8b3fd9', 2], ['ORANGE', 'NARANJA', '#f97316', 2], ['WHITE', 'BLANCO', '#f4f4f6', 2],
    ['BROWN', 'MARRÓN', '#8b5a2b', 3], ['BLACK', 'NEGRO', '#2a2a30', 3], ['GRAY', 'GRIS', '#9aa0a8', 3]
  ] });
})(typeof window !== 'undefined' ? window : this);
