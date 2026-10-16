/* Inglés — juego "Pack the bag!" (tema escuela). Versión 1.0.0 (2026-10-15).
   "Put the pencil in the bag!": los útiles están desparramados (como en "Find it!", buscar.js) y el que se toca vuela a la
   mochila. Si el juego no tiene destino (J.destino, la mochila del aula), pone una mochila al costado.
   Lo que no entra en la mochila (noEntra: la silla, el reloj, la mochila misma) se busca: "Where is the chair?". */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'mochila', tema: 'escuela', nombre: 'Pack the bag!', icono: '🎒', accion: '🎒',
    orden: function (w) { var x = 'the ' + w.en.toLowerCase(); return w.noEntra ? 'Where is ' + x + '?' : 'Put ' + x + ' in the bag!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel) + 1, nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, J2 = Object.create(J), bolso = null;
      if (!J.destino && !paso.w.noEntra) {
        bolso = J.O.mochila(M); bolso.position.set(M.vertical() ? 1.3 : 2.1, 0, M.vertical() ? 0.2 : 0.1); bolso.rotation.y = -0.4; bolso.scale.setScalar(0.01); M.scene.add(bolso);
        M.tween(450, function (k) { bolso.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote');
        J2.destino = function () { return bolso.userData.boca(); };
      }
      if (paso.w.noEntra) J2.destino = null;
      return JG.get('buscar').jugar(J2, paso, function () { if (bolso || J.destino) { var b = bolso || J.mochila; if (b) J.O.rebotar(M, b, 0.25); } fin(); });
    }
  });
})(typeof window !== 'undefined' ? window : this);
