/* Inglés — la profe, Miss Hoot (un búho con anteojos y birrete), en su percha. window.ING_PROFE3D. Versión 1.1.0 (2026-10-15): la percha va en la escena (no en la habitación) y ponerEn/volver la llevan a otro lugar (cajera del súper).
   crear(M) → H con hablar(on), asentir(), aplaudir(), senalar(on), alTocar(fn). Se acomoda sola si la pantalla está vertical. */
(function (root) {
  'use strict';
  function crear(M) {
    var T = M.T, H = {};
    var percha = new T.Group(); M.scene.add(percha);         // fuera de la habitación: también está en el súper
    var matPalo = M.toon('#9b6a3c');
    var palo = new T.Mesh(new T.CylinderGeometry(0.07, 0.1, 0.8, 10), matPalo); palo.position.y = 0.4; percha.add(palo); M.contorno(palo, 0.08);
    var rama = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 1.1, 10), matPalo); rama.rotation.z = Math.PI / 2; rama.position.set(0.25, 0.8, 0); percha.add(rama); M.contorno(rama, 0.08);
    var hoja = new T.Mesh(new T.SphereGeometry(0.12, 10, 8), M.toon('#4fbf6a')); hoja.scale.set(1.6, 0.5, 1); hoja.position.set(0.8, 0.86, 0); percha.add(hoja);
    var base = new T.Mesh(new T.CylinderGeometry(0.35, 0.4, 0.1, 20), matPalo); base.position.y = 0.05; percha.add(base);
    percha.add(M.sombra(0.5));
    var b = new T.Group(); b.position.set(0.2, 0.86, 0); percha.add(b);              // el búho
    var cuerpo = new T.Group(); b.add(cuerpo);
    function esfera(r, color, x, y, z, sx, sy, sz, padre, borde) {
      var m = new T.Mesh(new T.SphereGeometry(r, 24, 18), typeof color === 'string' ? M.toon(color) : color); m.position.set(x, y, z); m.scale.set(sx || 1, sy || sx || 1, sz || sx || 1);
      (padre || cuerpo).add(m); if (borde) M.contorno(m, borde); return m;
    }
    var matPluma = M.toon('#7d5ba6'), matPico = M.toon('#ffa53a');
    esfera(0.42, matPluma, 0, 0.5, 0, 1, 1.15, 0.9, cuerpo, 0.05);
    esfera(0.3, '#f6e7c8', 0, 0.4, 0.27, 1, 1.1, 0.45);
    var ojos = [], matBlanco = new T.MeshBasicMaterial({ color: 0xffffff }), matNegro = new T.MeshBasicMaterial({ color: 0x1d1530 });
    [-1, 1].forEach(function (s) {
      var g = new T.Group(); g.position.set(s * 0.165, 0.7, 0.32); cuerpo.add(g);
      esfera(0.15, matBlanco, 0, 0, 0, 1, 1, 0.5, g); esfera(0.08, matNegro, 0, 0, 0.06, 1, 1, 0.5, g); esfera(0.028, matBlanco, 0.03, 0.04, 0.09, 1, 1, 1, g);
      ojos.push(g);
      var aro = new T.Mesh(new T.TorusGeometry(0.17, 0.022, 8, 24), matNegro); aro.position.set(s * 0.165, 0.7, 0.4); cuerpo.add(aro);
      var penacho = new T.Mesh(new T.ConeGeometry(0.08, 0.24, 10), matPluma); penacho.position.set(s * 0.26, 1.0, 0.02); penacho.rotation.z = -s * 0.45; cuerpo.add(penacho);
      esfera(0.06, matPico, s * 0.12, 0.03, 0.14, 1.2, 0.6, 1.3);                  // patas
    });
    var puente = new T.Mesh(new T.BoxGeometry(0.08, 0.02, 0.02), matNegro); puente.position.set(0, 0.72, 0.42); cuerpo.add(puente);
    var pico = new T.Mesh(new T.ConeGeometry(0.06, 0.17, 10), matPico); pico.position.set(0, 0.55, 0.42); pico.rotation.x = Math.PI / 2 + 0.5; cuerpo.add(pico);
    var alas = [];
    [-1, 1].forEach(function (s) {
      var g = new T.Group(); g.position.set(s * 0.36, 0.66, 0); cuerpo.add(g);
      esfera(0.22, matPluma, 0, -0.2, 0, 0.42, 1, 0.8, g, 0.08); alas.push(g);
    });
    // birrete
    var gorro = new T.Group(); gorro.position.y = 1.0; cuerpo.add(gorro);
    var matGorro = M.toon('#2b2340');
    var copa = new T.Mesh(new T.CylinderGeometry(0.2, 0.22, 0.12, 18), matGorro); gorro.add(copa);
    var tabla = new T.Mesh(new T.BoxGeometry(0.58, 0.04, 0.58), matGorro); tabla.position.y = 0.07; tabla.rotation.y = Math.PI / 4; gorro.add(tabla);
    var borla = new T.Mesh(new T.SphereGeometry(0.04, 8, 6), M.toon('#ffd43b')); borla.position.set(0.3, -0.05, 0.1); gorro.add(borla);
    gorro.rotation.z = -0.12;

    var A = { habla: false, asiente: 0, senala: false, parpadeo: 3, aplauso: 0 };
    var fijo = null;          // {x, y, z, giro} mientras está en otro lugar
    function acomodar() {
      if (fijo) { percha.position.set(fijo.x, fijo.y || 0, fijo.z); percha.rotation.y = fijo.giro || 0; percha.scale.setScalar(fijo.escala || 1); return; }
      if (M.vertical()) { percha.position.set(-1.75, 0, -2.6); percha.rotation.y = 0.35; percha.scale.setScalar(0.85); }
      else { percha.position.set(-3.1, 0, -1.3); percha.rotation.y = 0.55; percha.scale.setScalar(1); }
    }
    acomodar(); root.addEventListener('resize', acomodar);
    M.cuadro(function (dt, t) {
      cuerpo.rotation.z = Math.sin(t * 1.1) * 0.04;
      cuerpo.rotation.x = A.habla ? Math.sin(t * 9) * 0.05 : A.asiente;
      pico.scale.y = A.habla ? 1 + Math.abs(Math.sin(t * 15)) * 0.35 : 1;
      A.parpadeo -= dt; var c = A.parpadeo < 0.12 ? 0.1 : 1; if (A.parpadeo < 0) A.parpadeo = 2.5 + Math.random() * 3;
      ojos.forEach(function (o) { o.scale.y += (c - o.scale.y) * Math.min(1, dt * 30); });
      alas[0].rotation.z = -A.aplauso;
      alas[1].rotation.z += ((A.senala ? 1.9 : A.aplauso) - alas[1].rotation.z) * Math.min(1, dt * (A.senala ? 8 : 30));
      borla.position.y = -0.05 + Math.sin(t * 2) * 0.015;
    });
    H.hablar = function (on) { A.habla = !!on; };
    H.asentir = function () { M.tween(600, function (k) { A.asiente = Math.sin(k * Math.PI * 2) * 0.25; }, function () { A.asiente = 0; }, 'lineal'); };
    H.aplaudir = function () {
      M.tween(900, function (k) { A.aplauso = Math.abs(Math.sin(k * Math.PI * 4)) * 0.9; }, function () { A.aplauso = 0; }, 'lineal');
    };
    H.senalar = function (on) { A.senala = !!on; };
    H.alTocar = function (fn) { M.tocable(b, fn); };
    H.ponerEn = function (l) { fijo = l; acomodar(); };
    H.volver = function () { fijo = null; acomodar(); };
    H.grupo = b;
    return H;
  }
  root.ING_PROFE3D = { VERSION: '1.1.0', crear: crear };
})(window);
