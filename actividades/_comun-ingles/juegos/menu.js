/* Inglés — juegos "Snack time!" (tema cafe) y "Dinner time!" (tema platos). Versión 1.0.0 (2026-10-15).
   Usan lo mismo que "Feed Pip" (comer.js): "Give Mimi a donut!" y Luz le lleva la comida a la boca. En el café y en el
   restaurante (salidas) la actividad cambia la orden por la de la mascota ("I want a juice!", "Can I have some soup, please?"). */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  [['cafe', 'cafe', 'Snack time!', '☕', '🥤'], ['resto', 'platos', 'Dinner time!', '🍽️', '🍴']].forEach(function (d) {
    JG.registrar({
      id: d[0], tema: d[1], nombre: d[2], icono: d[3], accion: d[4],
      orden: function (w, nombre) { return 'Give ' + nombre + ' ' + (w.art ? w.art + ' ' : '') + w.en.toLowerCase() + '!'; },
      opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
      jugar: function (J, paso, fin) { return JG.get('comer').jugar(J, paso, fin); }
    });
  });
})(typeof window !== 'undefined' ? window : this);
