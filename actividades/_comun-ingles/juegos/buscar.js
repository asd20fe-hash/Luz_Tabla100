/* Inglés — juego "Find it!" (cosas). Versión 1.0.0 (2026-10-15).
   La profe pregunta "Where is the ball?": las cosas están desparramadas por el piso y Luz toca la que se nombra.
   Si es otra, tiembla y se pone gris. Al acertar, la cosa salta y vuela hasta J.destino() (la caja de juguetes del
   dormitorio) o hasta la mascota, que la abraza. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  JG.registrar({
    id: 'buscar', tema: 'cosas', nombre: 'Find it!', icono: '🧸', accion: '🔎',
    orden: function (w) { return 'Where is the ' + w.en.toLowerCase() + '?'; },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel) + 1, nivel, az); },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, T = M.T, fichas = [], hecho = false, aura = null;
      // desparramadas: la fila de siempre, con saltos de profundidad y un poco de giro
      var pos = J.posiciones(paso.opciones.length);
      paso.opciones.forEach(function (w, i) {
        var f = O.ficha(M, w, 0.7), p = pos[i].clone(); p.z += (i % 2 ? -0.55 : 0.15) + (J.az.siguiente() - 0.5) * 0.2; p.x += (J.az.siguiente() - 0.5) * 0.25;
        f.position.copy(p); f.rotation.y = (J.az.siguiente() - 0.5) * 0.8; f.scale.setScalar(0.01); M.scene.add(f); fichas.push(f);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { f.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(f, function () { elegir(f); });
      });
      J.opciones(fichas.map(function (f) { return { w: f.userData.w, elegir: function () { elegir(f); } }; }));
      function elegir(f) {
        if (hecho || f.userData.fuera) return;
        var r = J.responder(f.userData.w); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; if (aura) aura.quitar();
          var desde = f.position.clone(), hasta = J.destino ? J.destino() : J.pip.cabeza.getWorldPosition(new T.Vector3()).add(new T.Vector3(0, -0.5, 0.5));
          O.rebotar(M, f, 0.5); M.particulas('estrella', desde.clone().setY(0.8), 8);
          M.esperar(450, function () {
            M.tween(600, function (k) { f.position.lerpVectors(desde, hasta, k); f.position.y += Math.sin(k * Math.PI) * 1.2; f.scale.setScalar(Math.max(0.01, 1 - 0.6 * k)); }, function () {
              M.limpiar([f]); ING_VOZ.sfx('pop'); M.particulas('brillo', hasta, 3); J.pip.feliz(fin);
            }, 'entraSale');
          });
          fichas.forEach(function (x) { if (x !== f) M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); });
          return;
        }
        f.userData.fuera = true; O.temblar(M, f); O.apagar(f, true); J.pip.no();
        if (r.mostrar) { var c = fichas.filter(function (x) { return x.userData.w === paso.w; })[0]; aura = M.aura(c, 1.5); O.rebotar(M, c, 0.35); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
