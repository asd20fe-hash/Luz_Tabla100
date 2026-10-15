/* Inglés — tema "acciones" (verbos; se registra solo en ING_VOCAB). Versión 1.0.0 (2026-10-15). [inglés, castellano, dibujo, nivel, extra]
   accion: la animación de la mascota (mascota3d.js, P.hacer); ing: la forma para "Mimi is jumping!" (juego "Mimi says"). */
(function (root) {
  'use strict';
  var V = typeof module !== 'undefined' && module.exports ? require('../vocab.js') : root.ING_VOCAB;
  V.tema({ id: 'acciones', nombre: 'Acciones', icono: '🤸', sinArticulo: true, palabras: [
    ['JUMP', 'SALTAR', '🦘', 1, { accion: 'jump', ing: 'JUMPING' }], ['DANCE', 'BAILAR', '💃', 1, { accion: 'dance', ing: 'DANCING' }],
    ['CLAP', 'APLAUDIR', '👏', 1, { accion: 'clap', ing: 'CLAPPING' }], ['WAVE', 'SALUDAR CON LA MANO', '👋', 1, { accion: 'wave', ing: 'WAVING' }],
    ['SPIN', 'GIRAR', '🌀', 2, { accion: 'spin', ing: 'SPINNING' }], ['RUN', 'CORRER', '🏃', 2, { accion: 'run', ing: 'RUNNING' }],
    ['SLEEP', 'DORMIR', '🛌', 2, { accion: 'sleep', ing: 'SLEEPING' }], ['SING', 'CANTAR', '🎤', 2, { accion: 'sing', ing: 'SINGING' }],
    ['LAUGH', 'REÍRSE', '😂', 3, { accion: 'laugh', ing: 'LAUGHING' }], ['SNEEZE', 'ESTORNUDAR', '🤧', 3, { accion: 'sneeze', ing: 'SNEEZING' }]
  ] });
})(typeof window !== 'undefined' ? window : this);
