/* Inglés — juego "Dress up!" (ropa). Versión 1.0.0 (2026-10-15).
   La profe dice "Put the hat on Mimi!" (nivel 1) o "Put a red hat on Mimi!" (desde el nivel 2, color + prenda): las prendas
   están en 3D sobre platos, girando, y Luz toca la que se nombra; vuela a la mascota y se la pone (solo mientras dura el paso).
   Desde el nivel 2 suele haber la misma prenda en otro color: elegirla es COLOR_MAL. preparar() pone paso.colores (uno por
   opción, en paralelo a paso.opciones, que entonces puede repetir la palabra) y paso.color (el pedido). */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  var R = function () { return EnNode ? require('../ropa.js') : root.ING_ROPA; };
  JG.registrar({
    id: 'vestir', tema: 'ropa', nombre: 'Dress up!', icono: '👗', accion: '👕',
    preparar: function (paso, nivel, az) {
      var cols = R().colores(Math.min(2, nivel)).map(function (c) { return c.en; }), i = paso.opciones.indexOf(paso.w);
      paso.colores = paso.opciones.map(function () { return az.elegir(cols); });
      if (nivel < 2) return;
      paso.color = az.elegir(cols); paso.colores[i] = paso.color;
      if (az.prob(0.6)) {                // la misma prenda en otro color, en lugar de un distractor
        var j = i === 0 ? 1 : 0;
        paso.opciones[j] = paso.w; paso.colores[j] = az.elegir(cols.filter(function (c) { return c !== paso.color; }));
      }
    },
    orden: function (w, nombre, paso) {
      return 'Put ' + (paso && paso.color ? R().frase({ en: w.en, color: paso.color }) : 'the ' + w.en.toLowerCase()) + ' on ' + nombre + '!';
    },
    opciones: function (w, nivel, az) { return V.opciones(w, JG.cuantas(nivel), nivel, az); },
    // det: {color} de lo que tocó.
    error: function (w, elegida, paso, det) {
      if (!elegida) return null;
      if (elegida.en !== w.en) return V.errorEleccion(w, elegida);
      return paso && paso.color && det && det.color && det.color !== paso.color ? 'COLOR_MAL' : null;
    },
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, T = M.T, R3 = root.ING_ROPA3D, pos = J.posiciones(paso.opciones.length), items = [], hecho = false, aura = null;
      paso.opciones.forEach(function (w, i) {
        var col = paso.colores[i], g = new T.Group();
        var plato = new T.Mesh(new T.CylinderGeometry(0.5, 0.4, 0.08, 28), M.toon('#ffffff')); plato.position.y = 0.04; g.add(plato); M.contorno(plato, 0.04);
        var m = R3.vitrina(M, w.en, V.por(col).color); m.position.y = 0.12; g.add(m); g.add(M.sombra(0.6));
        var t = i * 1.3; M.fx({ update: function (dt) { if (!m.parent) return false; t += dt; m.rotation.y = Math.sin(t * 0.9) * 0.6; return true; } });
        g.userData = { w: w, color: col, mats: [plato.material].concat(m.userData.mats), modelo: m };
        g.position.copy(pos[i]); g.scale.setScalar(0.01); M.scene.add(g); items.push(g);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { g.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote'); });
        M.tocable(g, function () { elegir(g); });
      });
      J.opciones(items.map(function (g) { return { w: g.userData.w, color: g.userData.color, elegir: function () { elegir(g); } }; }));
      function elegir(g) {
        if (hecho || g.userData.fuera) return;
        var r = J.responder(g.userData.w, { color: g.userData.color }); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; if (aura) aura.quitar();
          items.forEach(function (x) { if (x !== g) M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, 1 - k)); }, function () { M.limpiar([x]); }); });
          var m = g.userData.modelo, desde = m.getWorldPosition(new T.Vector3()), hasta = J.pip.cabeza.getWorldPosition(new T.Vector3()), e0 = m.scale.x;
          M.scene.attach(m); m.position.copy(desde);
          M.tween(650, function (k) { m.position.lerpVectors(desde, hasta, k); m.position.y += Math.sin(k * Math.PI) * 0.8; m.scale.setScalar(Math.max(0.01, e0 * (1 - 0.6 * k))); }, function () {
            M.limpiar([m, g]); J.vestir(g.userData.w.en, g.userData.color); ING_VOZ.sfx('brillo'); M.particulas('estrella', hasta, 8); J.pip.feliz(fin);
          }, 'entraSale');
          return;
        }
        g.userData.fuera = true; O.temblar(M, g); O.apagar(g, true); J.pip.no();
        if (r.mostrar) {
          var c = items.filter(function (x) { return x.userData.w === paso.w && (!paso.color || x.userData.color === paso.color); })[0];
          aura = M.aura(c, 1.5); O.rebotar(M, c, 0.35);
        }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
