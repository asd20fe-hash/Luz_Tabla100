/* Inglés — juego "How many?" (números). Versión 1.0.0 (2026-10-15).
   La profe dice "Give Mimi three apples!": hay platos con distinta cantidad de comida y Luz toca el que tiene esa cantidad.
   Al acertar, la profe cuenta ("One, two, three!") mientras cada cosa vuela a la boca de la mascota. Si es otro plato,
   tiembla y se pone gris (error CANTIDAD_MAL). La comida de cada paso la elige preparar() (queda en paso.cosa). */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('../vocab.js') : root.ING_VOCAB, JG = EnNode ? require('../juegos.js') : root.ING_JUEGOS;
  var NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  var plural = function (c) { var e = c.en.toLowerCase(); return /[^aeiou]y$/.test(e) ? e.slice(0, -1) + 'ies' : e + 's'; };
  // Comida que se cuenta (nada de "some milk"), de nivel 1 o 2.
  var contables = function (nivel) { return V.palabras({ temas: ['comida'], nivel: Math.min(2, nivel) }).filter(function (c) { return c.art !== 'some'; }); };
  JG.registrar({
    id: 'contar', tema: 'numeros', nombre: 'How many?', icono: '🔢', accion: '🍽️',
    preparar: function (paso, nivel, az) { paso.cosa = az.elegir(contables(nivel)).en; },
    orden: function (w, nombre, paso) {
      var c = V.por((paso && paso.cosa) || 'APPLE');
      return 'Give ' + nombre + ' ' + w.en.toLowerCase() + ' ' + (w.n === 1 ? c.en.toLowerCase() : plural(c)) + '!';
    },
    // Hasta 5 en el nivel 1 y hasta 10 después; ahí los distractores van separados por 2 o más (contar 8 contra 9 cansa).
    opciones: function (w, nivel, az) {
      var max = nivel <= 1 ? 5 : 10, n = JG.cuantas(nivel), out = [w];
      var cand = az.mezclar(V.palabras({ temas: ['numeros'] }).filter(function (x) { return x.n <= max && x !== w; }));
      var lejos = function (x) { return out.every(function (y) { return Math.abs(x.n - y.n) >= (max > 5 ? 2 : 1); }); };
      cand.forEach(function (x) { if (out.length < n && lejos(x)) out.push(x); });
      cand.forEach(function (x) { if (out.length < n && out.indexOf(x) < 0) out.push(x); });
      return az.mezclar(out);
    },
    error: function (w, elegida) { return !elegida || elegida.en === w.en ? null : 'CANTIDAD_MAL'; },
    NUM: NUM, plural: plural, contables: contables,
    jugar: function (J, paso, fin) {
      var M = J.M, O = J.O, T = M.T, c = V.por(paso.cosa || 'APPLE'), pos = J.posiciones(paso.opciones.length), platos = [], hecho = false, aura = null;
      var tex = M.texEmoji(c.img), E = Math.min(1, (pos.length > 1 ? pos[1].x - pos[0].x : 2) / 1.4);   // en vertical los platos se achican para no pisarse
      paso.opciones.forEach(function (w, i) {
        var g = new T.Group(), n = w.n, cols = n <= 3 ? n : (n <= 6 ? 3 : 4), tam = Math.min(0.42, 1.25 / cols);
        var plato = new T.Mesh(new T.CylinderGeometry(0.62, 0.5, 0.08, 28), M.toon('#ffffff')); plato.position.y = 0.04; g.add(plato); M.contorno(plato, 0.04);
        var mats = [plato.material], cosas = [];
        for (var k = 0; k < n; k++) {
          var fila = Math.floor(k / cols), enFila = Math.min(cols, n - fila * cols), col = k - fila * cols;
          var m = new T.SpriteMaterial({ map: tex, transparent: true }), s = new T.Sprite(m); mats.push(m);
          s.scale.setScalar(tam); s.position.set((col - (enFila - 1) / 2) * tam * 0.95, 0.12 + tam * 0.5 + fila * tam * 0.85, 0.05 - fila * 0.04); g.add(s); cosas.push(s);
        }
        g.add(M.sombra(0.7)); g.userData = { w: w, mats: mats, cosas: cosas, plato: plato, tam: tam };
        g.position.copy(pos[i]); g.scale.setScalar(0.01); M.scene.add(g); platos.push(g);
        M.esperar(i * 90, function () { ING_VOZ.sfx('pop'); M.tween(450, function (k) { g.scale.setScalar(Math.max(0.01, E * k)); }, null, 'rebote'); });
        M.tocable(g, function () { elegir(g); });
      });
      J.opciones(platos.map(function (g) { return { w: g.userData.w, elegir: function () { elegir(g); } }; }));
      function elegir(g) {
        if (hecho || g.userData.fuera) return;
        var r = J.responder(g.userData.w); if (r.ignorar) return;
        if (r.ok) {
          hecho = true; if (aura) aura.quitar(); O.rebotar(M, g, 0.3);
          platos.forEach(function (x) { if (x !== g) M.tween(300, function (k) { x.scale.setScalar(Math.max(0.01, E * (1 - k))); }, function () { M.limpiar([x]); }); });
          var n = g.userData.w.n, cuenta = NUM.slice(1, n + 1).join(', ') + '!';
          // la profe cuenta (cuando termina de felicitar) y, mientras, cada cosa vuela a la boca al ritmo de la cuenta
          J.decir(cuenta.charAt(0).toUpperCase() + cuenta.slice(1), function () {
            g.userData.cosas.forEach(function (s, k) {
              M.esperar(k * 480, function () {
                var desde = s.getWorldPosition(new T.Vector3()), t0 = g.userData.tam * g.scale.x; M.scene.attach(s); s.position.copy(desde);
                M.tween(380, function (t) { s.position.lerpVectors(desde, J.pip.posBoca(), t); s.position.y += Math.sin(t * Math.PI) * 0.5; s.scale.setScalar(Math.max(0.01, t0 * (1 - 0.7 * t))); },
                  function () { M.limpiar([s]); ING_VOZ.sfx('pop'); });
              });
            });
            M.esperar(n * 480 + 400, function () {
              M.tween(250, function (k) { g.scale.setScalar(Math.max(0.01, E * (1 - k))); }, function () { M.limpiar([g]); });
              M.particulas('miga', J.pip.posBoca(), 6, { color: '#e9b872', arriba: 1.5, fuerza: 1.4 }); ING_VOZ.sfx('nam');
              J.alimentar(Math.min(15, 3 + n)); J.pip.feliz(fin);
            });
          });
          return;
        }
        g.userData.fuera = true; O.temblar(M, g); O.apagar(g, true); J.pip.no();
        if (r.mostrar) { var b = platos.filter(function (x) { return x.userData.w === paso.w; })[0]; aura = M.aura(b, 1.5); O.rebotar(M, b, 0.35); }
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
