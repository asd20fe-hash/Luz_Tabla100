/* Inglés — juego "Feed Pip" (comida). Versión 1.0.0 (2026-10-15).
   La profe dice "Give Pip an apple": Luz arrastra la comida hasta la boca de la mascota (o la toca y vuela sola).
   Si es otra, la mascota niega con la cabeza y la comida vuelve a su lugar. Cada acierto le llena la panza. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'comer', tema: 'comida', nombre: 'Feed Pip', icono: '🍎', accion: '🍽️',
    orden: function (w, nombre) { return 'Give ' + nombre + ' ' + (w.art ? w.art + ' ' : '') + w.en.toLowerCase() + '!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, pos = J.posiciones(paso.opciones.length), fichas = [], hecho = false, aura = null;
      paso.opciones.forEach(function (w, i) {
        var f = O.ficha(M, w, 0.8); f.position.copy(pos[i]); f.scale.setScalar(0.01); f.userData.casa = pos[i].clone(); M.scene.add(f); fichas.push(f);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.arrastrable(f, {
          tap: function () { elegir(f); },
          inicio: function () { if (!hecho && !f.userData.fuera) { f.scale.setScalar(1.15); ING_VOZ.sfx('tick'); } },
          mover: function (p) { if (hecho || f.userData.fuera) return; f.position.set(p.x, Math.max(0, p.y - 0.5), f.userData.casa.z); J.pip.mirarA(f.position); },
          soltar: function () {
            if (hecho || f.userData.fuera) return; f.scale.setScalar(1);
            var a = M.aPantalla(f.position.clone().setY(f.position.y + 0.5)), b = M.aPantalla(J.pip.posBoca()), lado = Math.min(innerWidth, innerHeight);
            if (Math.hypot(a.x - b.x, a.y - b.y) < lado * 0.2) elegir(f); else volver(f);
          }
        });
      });
      J.opciones(fichas.map(function (f) { return { w: f.userData.w, elegir: function () { elegir(f); } }; }));
      function volver(f) { var d = f.position.clone(); M.tween(350, function (k) { f.position.lerpVectors(d, f.userData.casa, k); }, null, 'sale'); }
      function elegir(f) {
        if (hecho || f.userData.fuera) return;
        var r = J.responder(f.userData.w); if (r.ignorar) { volver(f); return; }
        if (r.ok) {
          hecho = true; if (aura) aura.quitar();
          fichas.forEach(function (x) { if (x !== f) M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); });
          // vuela solo la comida; el platito se achica y desaparece
          var comida = f.userData.sprite; M.scene.attach(comida); M.quitarToque(f);
          M.tween(300, function (k) { f.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([f]); });
          J.pip.comer(comida, function () { J.alimentar(15); fin(); });
          return;
        }
        f.userData.fuera = true; volver(f); O.temblar(M, f); O.apagar(f, true); J.pip.no();
        if (r.mostrar) { var c = fichas.filter(function (x) { return x.userData.w === paso.w; })[0]; aura = M.aura(c, 1.5); O.rebotar(M, c, 0.35); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
