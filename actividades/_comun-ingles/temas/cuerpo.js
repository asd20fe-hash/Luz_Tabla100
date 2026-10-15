/* Inglés — tema "cuerpo" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra] */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  // parte: nombre de la parte del modelo 3D de la mascota (mascota3d.js) que hay que tocar.
  V.tema({ id: 'cuerpo', nombre: 'Cuerpo', icono: '👃', sinArticulo: true, palabras: [
    ['NOSE', 'NARIZ', '👃', 1, { parte: 'nose' }], ['EYES', 'OJOS', '👀', 1, { parte: 'eyes' }], ['EARS', 'OREJAS', '👂', 1, { parte: 'ears' }], ['MOUTH', 'BOCA', '👄', 1, { parte: 'mouth' }],
    ['HEAD', 'CABEZA', '🙂', 2, { parte: 'head' }], ['HANDS', 'MANOS', '👐', 2, { parte: 'hands' }], ['FEET', 'PIES', '🦶', 2, { parte: 'feet' }], ['TUMMY', 'PANCITA', '🫃', 3, { parte: 'tummy' }]
  ] });
})(typeof window !== 'undefined' ? window : this);
