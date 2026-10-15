/* Inglés — juego "Pip says!" (acciones: verbos). Versión 1.0.0 (2026-10-15).
   Dos formas (preparar elige con paso.alReves):
   - Orden: la profe dice "Mimi, jump!", Luz toca la carta de la acción y la mascota la hace.
   - Al revés: la mascota hace algo y la profe pregunta "What is Mimi doing?"; Luz toca la carta ("Mimi is jumping!").
   El 🔊 repite la orden y, al revés, la mascota lo vuelve a hacer (J.alOir). Usa pip.hacer(id) de mascota3d.js. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'hacer', tema: 'acciones', nombre: 'Pip says!', icono: '🤸', accion: '🗣️',
    orden: function (w, nombre, paso) { return paso && paso.alReves ? 'What is ' + nombre + ' doing?' : nombre + ', ' + w.en.toLowerCase() + '!'; },
    // "Mimi is jumping!": lo que dice la profe cuando la mascota lo hace
    dice: function (w, nombre) { return nombre + ' is ' + (w.ing || w.en).toLowerCase() + '!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    preparar: function (paso, nivel, az) { paso.alReves = az.prob(nivel <= 1 ? 0.35 : 0.5); },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, pip = J.pip, w = paso.w, pos = J.posiciones(paso.opciones.length), fichas = [], hecho = false, aura = null, actuando = false, pendiente = null;
      var actuar = function (despues) { if (actuando) return; actuando = true; pip.mirar(0, 0); pip.hacer(w.accion, function () { actuando = false; if (despues) despues(); if (pendiente) { var p = pendiente; pendiente = null; p(); } }); };
      var demora = 0;
      if (paso.alReves) { demora = 900; M.esperar(300, function () { if (!hecho) actuar(); }); J.alOir(function () { if (!hecho) actuar(); }); }
      paso.opciones.forEach(function (x, i) {
        var f = O.ficha(M, x, 0.8); f.position.copy(pos[i]); f.scale.setScalar(0.01); M.scene.add(f); fichas.push(f);
        M.esperar(demora + i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(f, function () { elegir(f); });
      });
      J.opciones(fichas.map(function (f) { return { w: f.userData.w, elegir: function () { elegir(f); } }; }));
      M.esperar(demora + 2600, function () { if (!hecho) J.aviso('👆', paso.alReves ? '¿Qué hace?' : '¿Qué tiene que hacer?'); });
      function elegir(f) {
        if (hecho || f.userData.fuera) return;
        var r = J.responder(f.userData.w); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; J.aviso(); J.alOir(null); if (aura) aura.quitar(); O.rebotar(M, f, 0.5);
          fichas.forEach(function (x) { M.esperar(x === f ? 700 : 0, function () { M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); }); });
          J.decir(JG.get('hacer').dice(w, J.nombreVoz), function () { var otra = function () { actuar(fin); }; if (actuando) pendiente = otra; else otra(); });
          return;
        }
        f.userData.fuera = true; O.temblar(M, f); O.apagar(f, true); if (!actuando) pip.no();
        if (r.mostrar) { var c = fichas.filter(function (x) { return x.userData.w === w; })[0]; aura = M.aura(c, 1.5); O.rebotar(M, c, 0.35); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
