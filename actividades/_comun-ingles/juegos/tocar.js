/* Inglés — juego "Touch Pip!" (partes del cuerpo). Versión 1.0.0 (2026-10-15).
   La profe dice "Touch Pip's nose!": Luz toca esa parte en la mascota 3D. Si toca otra, la mascota dice cuál tocó
   y la profe repite; al segundo error, la parte pedida brilla. Al acertar, la mascota reacciona según la parte
   (estornuda, mueve las orejas, guiña…). Usa J.tocarPip(fn) para enterarse de qué parte se tocó y J.acercarPip(true) para verla grande. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'tocar', tema: 'cuerpo', nombre: 'Touch Pip!', icono: '👃', accion: '👆',
    orden: function (w, nombre) { return 'Touch ' + nombre + "'s " + w.en.toLowerCase() + '!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, T = M.T, hecho = false, aura = null, mano = null;
      // Todas las partes con nombre se pueden tocar (no solo las opciones); las opciones sirven para el modo debug.
      var partes = V.palabras({ temas: ['cuerpo'] });
      J.opciones(paso.opciones.map(function (w) { return { w: w, elegir: function () { elegir(w); } }; }));
      J.tocarPip(function (parte) {
        var w = partes.filter(function (x) { return x.parte === parte; })[0];
        if (w) elegir(w);
      });
      J.pip.mirar(0, 0.2); J.acercarPip(true);
      function elegir(w) {
        if (hecho) return;
        var r = J.responder(w); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; if (aura) aura.quitar(); if (mano) mano.userData.quitar(); J.tocarPip(null);
          reaccion(w.parte, fin); return;
        }
        J.pip.no(); ING_VOZ.sfx('boing');
        if (r.mostrar) {
          var obj = (J.pip.partes[paso.w.parte] || [])[0]; if (!obj) return;
          aura = M.aura(obj, 0.9);
          mano = J.O.mano(M); var p = obj.getWorldPosition(new T.Vector3()); mano.position.set(p.x + 0.2, p.y + 0.05, p.z + 0.5); M.scene.add(mano);
        }
      }
      function reaccion(parte, fin) {
        var P = J.pip, cab = P.cabeza.getWorldPosition(new T.Vector3());
        if (parte === 'nose') { P.estornudar(fin); return; }
        if (parte === 'ears') { P.orejear(); M.particulas('nota', cab.clone().add(new T.Vector3(0, 0.7, 0.2)), 3); M.esperar(900, function () { P.feliz(fin); }); return; }
        if (parte === 'eyes') { P.guinar(); M.particulas('brillo', cab.clone().add(new T.Vector3(0, 0.1, 0.6)), 3); M.esperar(700, function () { P.feliz(fin); }); return; }
        if (parte === 'tummy') { P.reir(function () { P.feliz(fin); }); return; }
        if (parte === 'feet') { P.saltar(0.5, function () { P.saltar(0.5, fin); }); return; }
        P.feliz(fin);
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
