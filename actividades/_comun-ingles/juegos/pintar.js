/* Inglés — juego "Paint Pip!" (colores). Versión 1.0.0 (2026-10-15).
   La profe dice "Paint Pip blue": Luz toca el balde de ese color y después frota a la mascota con el dedo para pintarla
   (si no frota, se pinta sola a los pocos segundos). La mascota se queda de ese color. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'pintar', tema: 'colores', nombre: 'Paint Pip!', icono: '🎨', accion: '🖌️',
    orden: function (w, nombre) { return 'Paint ' + nombre + ' ' + w.en.toLowerCase() + '!'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, T = M.T, pos = J.posiciones(paso.opciones.length), baldes = [], hecho = false, aura = null;
      paso.opciones.forEach(function (w, i) {
        var b = O.balde(M, w.color); b.position.copy(pos[i]); b.scale.setScalar(0.01); b.userData.w = w; M.scene.add(b); baldes.push(b);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { b.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(b, function () { elegir(b); });
      });
      J.opciones(baldes.map(function (b) { return { w: b.userData.w, elegir: function () { elegir(b); } }; }));
      function elegir(b) {
        if (hecho || b.userData.fuera) return;
        var r = J.responder(b.userData.w); if (r.ignorar) return;
        if (r.ok) { hecho = true; if (aura) aura.quitar(); pintar(b); return; }
        b.userData.fuera = true; O.temblar(M, b); O.apagar(b, true); J.pip.no();
        if (r.mostrar) { var c = baldes.filter(function (x) { return x.userData.w === paso.w; })[0]; aura = M.aura(c, 1.6); O.rebotar(M, c, 0.35); }
      }
      function pintar(b) {
        var color = b.userData.w.color, d0 = J.pip.color(), prog = 0, listo = false, quieto = 0;
        O.rebotar(M, b, 0.5); ING_VOZ.sfx('splash');
        var desde = b.position.clone().add(new T.Vector3(0, 0.5, 0));
        M.particulas('gota', desde, 14, { color: color, arriba: 3.2, fuerza: 1.2 });
        baldes.forEach(function (x) { if (x !== b) M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); });
        J.aviso('🖐️', 'Frotá a ' + J.nombre + ' para pintarlo');
        var quitar = M.alMover(function (info) {
          if (listo || !info.abajo) return;
          var g = M.golpe(info.e); if (!g || !J.pip.esMio(g)) return;
          prog += 0.035; quieto = 0; J.pip.mezclar(d0, color, Math.min(1, prog));
          if (Math.random() < 0.4) M.particulas('gota', g.hit.point, 1, { color: color, arriba: 1, fuerza: 0.8 });
          if (Math.random() < 0.15) ING_VOZ.sfx('tick');
          if (prog >= 1) terminar();
        });
        var reloj = M.cuadro(function (dt) { quieto += dt; if (!listo && quieto > (J.debug ? 0.5 : 4.5)) { quieto = -99; auto(); } });
        function auto() { var p0 = prog; M.tween(900, function (k) { prog = p0 + (1 - p0) * k; J.pip.mezclar(d0, color, prog); }, terminar); M.particulas('gota', J.pip.cabeza.getWorldPosition(new T.Vector3()), 10, { color: color, arriba: 1.5 }); }
        function terminar() {
          if (listo) return; listo = true; quitar(); reloj(); J.aviso(null);
          J.pip.ponerColor(color); J.pintado(color);
          M.particulas('estrella', J.pip.cabeza.getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 0.4, 0.4)), 8);
          M.tween(300, function (k) { b.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([b]); });
          J.pip.feliz(fin);
        }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
