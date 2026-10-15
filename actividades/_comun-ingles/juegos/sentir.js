/* Inglés — juego "How is Pip?" (sentimientos). Versión 1.0.0 (2026-10-15).
   La profe dice "Mimi is sad!": Luz toca la carita que corresponde y la mascota lo actúa (llora, bosteza, tiembla…).
   Si es otra, la carita tiembla y se pone gris. Usa pip.sentir(id) de mascota3d.js. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'sentir', tema: 'sentimientos', nombre: 'How is Pip?', icono: '😊', accion: '🎭',
    orden: function (w, nombre) { return nombre + ' is ' + w.en.toLowerCase() + '!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, pos = J.posiciones(paso.opciones.length), fichas = [], hecho = false, aura = null;
      paso.opciones.forEach(function (w, i) {
        var f = O.ficha(M, w, 0.8); f.position.copy(pos[i]); f.scale.setScalar(0.01); M.scene.add(f); fichas.push(f);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(f, function () { elegir(f); });
      });
      J.opciones(fichas.map(function (f) { return { w: f.userData.w, elegir: function () { elegir(f); } }; }));
      M.esperar(2600, function () { if (!hecho) J.aviso('👆', '¿Qué carita?'); });
      function elegir(f) {
        if (hecho || f.userData.fuera) return;
        var r = J.responder(f.userData.w); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; J.aviso(); if (aura) aura.quitar(); O.rebotar(M, f, 0.5);
          fichas.forEach(function (x) { M.esperar(x === f ? 700 : 0, function () { M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); }); });
          J.pip.mirar(0, 0); J.pip.sentir(paso.w.sentir, fin);
          return;
        }
        f.userData.fuera = true; O.temblar(M, f); O.apagar(f, true); J.pip.no();
        if (r.mostrar) { var c = fichas.filter(function (x) { return x.userData.w === paso.w; })[0]; aura = M.aura(c, 1.5); O.rebotar(M, c, 0.35); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
