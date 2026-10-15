/* Inglés — tema "sentimientos" (se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo o color, nivel, extra]
   sentir: la animación de la mascota para esa palabra (mascota3d.js, P.sentir). */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'sentimientos', nombre: 'Cómo está', icono: '😊', sinArticulo: true, palabras: [
    ['HAPPY', 'CONTENTO', '😊', 1, { sentir: 'happy' }], ['SAD', 'TRISTE', '😢', 1, { sentir: 'sad' }], ['HUNGRY', 'CON HAMBRE', '😋', 1, { sentir: 'hungry' }], ['SLEEPY', 'CON SUEÑO', '😴', 1, { sentir: 'sleepy' }],
    ['ANGRY', 'ENOJADO', '😠', 2, { sentir: 'angry' }], ['SCARED', 'ASUSTADO', '😨', 2, { sentir: 'scared' }], ['SURPRISED', 'SORPRENDIDO', '😮', 2, { sentir: 'surprised' }],
    ['COLD', 'CON FRÍO', '🥶', 3, { sentir: 'cold' }], ['HOT', 'CON CALOR', '🥵', 3, { sentir: 'hot' }]
  ] });
})(typeof window !== 'undefined' ? window : this);
