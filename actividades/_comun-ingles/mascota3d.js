/* Inglés — la mascota en 3D, hecha con formas (sin modelos). window.ING_MASCOTA3D. Versión 1.1.0 (2026-10-15).
   v1.1.0 + estornudar, orejear, guinar (juego "Touch Pip!") e irA (va saltando hasta otro lugar: supermercado).
   crear(M, {color}) → P. Cabezona tipo juguete de vinilo, con contorno de dibujito.
   Partes con nombre para tocarlas (las del tema cuerpo): head, eyes, ears, nose, mouth, hands, feet, tummy (y body, el resto).
   Animaciones: respira, parpadea, mira el dedo, saltar, feliz, no (niega con la cabeza), reir, comer, hablar, nacer, colorA.
   P.alTocar(fn(parte, hit)) avisa qué parte se tocó. */
(function (root) {
  'use strict';
  function crear(M, op) {
    op = op || {};
    var T = M.T, P = {};
    var raiz = new T.Group(), cuerpo = new T.Group(), cabeza = new T.Group();
    raiz.position.set(0, 0, -0.2); raiz.add(cuerpo); cuerpo.add(cabeza); cabeza.position.y = 1.28; M.scene.add(raiz);
    var colorBase = new T.Color(op.color || '#ffb3d1');
    var matC = M.toon(colorBase), matPanza = M.toon('#ffffff'), matRosa = M.toon('#ff8fb8'), matCachete = M.toon('#ff7aa8', { transparente: true, opacidad: 0.55 });
    var matOjo = new T.MeshBasicMaterial({ color: 0xffffff }), matPupila = new T.MeshBasicMaterial({ color: 0x1d1530 }), matBoca = new T.MeshBasicMaterial({ color: 0x5a1f3a });
    function tonoPanza() { matPanza.color.copy(matC.color).lerp(new T.Color('#ffffff'), 0.6); matRosa.color.copy(matC.color).lerp(new T.Color('#ff7aa8'), 0.6); }
    tonoPanza();
    var partes = {}, piezas = [];
    function parte(nombre, obj) { (partes[nombre] = partes[nombre] || []).push(obj); obj.userData.parte = nombre; piezas.push(obj); return obj; }
    function esfera(r, mat, x, y, z, sx, sy, sz, padre, borde) {
      var m = new T.Mesh(new T.SphereGeometry(r, 28, 20), mat); m.position.set(x, y, z); m.scale.set(sx || 1, sy || sx || 1, sz || sx || 1);
      (padre || cuerpo).add(m); if (borde) M.contorno(m, borde); return m;
    }
    // cuerpo
    parte('body', esfera(0.52, matC, 0, 0.6, 0, 1, 0.95, 0.92, cuerpo, 0.05));
    parte('tummy', esfera(0.36, matPanza, 0, 0.55, 0.37, 1, 1.05, 0.45));
    [-1, 1].forEach(function (s) {
      parte('hands', esfera(0.15, matC, s * 0.5, 0.62, 0.18, 1, 1, 1, cuerpo, 0.08));
      parte('feet', esfera(0.18, matC, s * 0.24, 0.09, 0.14, 1.05, 0.62, 1.3, cuerpo, 0.08));
    });
    esfera(0.12, matC, 0, 0.45, -0.5, 1, 1, 1, cuerpo, 0.08);                   // cola
    // cabeza
    parte('head', esfera(0.62, matC, 0, 0, 0, 1.08, 0.95, 0.95, cabeza, 0.04));
    var orejas = [];
    [-1, 1].forEach(function (s) {
      var g = new T.Group(); g.position.set(s * 0.36, 0.42, -0.02); g.rotation.z = -s * 0.35; cabeza.add(g);
      esfera(0.19, matC, 0, 0.16, 0, 0.75, 1.45, 0.5, g, 0.07); esfera(0.11, matRosa, 0, 0.17, 0.07, 0.7, 1.35, 0.3, g);
      parte('ears', g); orejas.push(g);
    });
    var ojos = [], pupilas = [];
    [-1, 1].forEach(function (s) {
      var g = new T.Group(); g.position.set(s * 0.23, 0.07, 0.5); cabeza.add(g);
      esfera(0.15, matOjo, 0, 0, 0, 1, 1.15, 0.6, g, 0.1);
      var p = new T.Group(); p.position.z = 0.07; g.add(p);
      esfera(0.095, matPupila, 0, 0, 0, 1, 1.1, 0.6, p); esfera(0.034, matOjo, 0.035, 0.05, 0.05, 1, 1, 1, p);
      parte('eyes', g); ojos.push(g); pupilas.push(p);
    });
    parte('nose', esfera(0.055, matRosa, 0, -0.07, 0.6, 1.3, 1, 1));
    [-1, 1].forEach(function (s) { esfera(0.1, matCachete, s * 0.4, -0.13, 0.42, 1.2, 0.7, 0.4, cabeza); });
    var boca = new T.Group(); boca.position.set(0, -0.22, 0.54); cabeza.add(boca); parte('mouth', boca);
    var sonrisa = new T.Mesh(new T.TorusGeometry(0.08, 0.022, 8, 18, Math.PI), matBoca); sonrisa.rotation.z = Math.PI; boca.add(sonrisa);
    var abierta = esfera(0.1, matBoca, 0, -0.02, 0, 1.2, 1, 0.5, boca); abierta.visible = false;
    // zona invisible más grande para tocar la boca (es chiquita para un dedo)
    var zonaBoca = new T.Mesh(new T.SphereGeometry(0.14, 8, 6), new T.MeshBasicMaterial({ visible: false })); boca.add(zonaBoca);
    var sombra = M.sombra(0.85); raiz.add(sombra);

    /* ---------- estado de la animación ---------- */
    var A = { sx: 1, sy: 1, alto: 0, mira: new T.Vector2(), miraObj: new T.Vector2(), giroY: 0, giroX: 0, ladeo: 0, abre: 0, hablando: false, parpadeo: 2 + Math.random() * 2, orejas: 0, escala: op.escala || 1, durmiendo: false };
    raiz.scale.setScalar(A.escala);
    M.cuadro(function (dt, t) {
      var resp = 1 + 0.025 * Math.sin(t * 2.4);
      cuerpo.scale.set(A.sx / Math.sqrt(resp), A.sy * resp, A.sx / Math.sqrt(resp));
      cuerpo.position.y = A.alto;
      sombra.scale.setScalar(Math.max(0.4, 1 - A.alto * 0.35));
      // parpadeo
      A.parpadeo -= dt;
      var cierre = A.durmiendo ? 0.08 : (A.parpadeo < 0.13 ? 0.1 : 1);
      if (A.parpadeo < 0) A.parpadeo = 1.8 + Math.random() * 3.5;
      ojos.forEach(function (o, i) { if (A.guino && i === 1) return; o.scale.y += (cierre - o.scale.y) * Math.min(1, dt * 30); });
      // mirada
      A.mira.lerp(A.miraObj, Math.min(1, dt * 6));
      pupilas.forEach(function (p) { p.position.x = A.mira.x * 0.045; p.position.y = A.mira.y * 0.04; });
      cabeza.rotation.y = A.mira.x * 0.35 + A.giroY; cabeza.rotation.x = -A.mira.y * 0.18 + A.giroX; cabeza.rotation.z = A.ladeo + Math.sin(t * 1.3) * 0.03;
      // orejas: se mueven solas de vez en cuando y caen cuando está triste
      var mov = Math.sin(t * 7) * Math.max(0, Math.sin(t * 0.7) - 0.85) * 2;
      orejas.forEach(function (o, i) { var s = i ? 1 : -1; o.rotation.z = -s * (0.35 + A.orejas) + s * mov * 0.4; });
      // boca
      var abre = A.hablando ? Math.abs(Math.sin(t * 16)) * 0.9 : A.abre;
      abierta.visible = abre > 0.12; sonrisa.visible = !abierta.visible;
      abierta.scale.y = 0.3 + abre;
    });
    P.mirar = function (x, y) { A.miraObj.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))); };
    var tmp = new T.Vector3();
    P.mirarA = function (v) { cabeza.getWorldPosition(tmp); P.mirar((v.x - tmp.x) / 2.2, (v.y - tmp.y) / 1.6); };

    /* ---------- animaciones ---------- */
    P.saltar = function (alto, fin) {
      alto = alto || 0.6;
      M.tween(110, function (k) { A.sy = 1 - 0.22 * k; A.sx = 1 + 0.14 * k; }, function () {
        M.tween(260, function (k) { A.alto = alto * k; A.sy = 0.78 + 0.37 * Math.sin(k * Math.PI / 2); A.sx = 1.14 - 0.24 * k; }, function () {
          M.tween(240, function (k) { A.alto = alto * (1 - k * k); A.sy = 1.15 - 0.1 * k; A.sx = 0.9 + 0.08 * k; }, function () {
            M.tween(100, function (k) { A.alto = 0; A.sy = 1.05 - 0.27 * k; A.sx = 0.98 + 0.18 * k; }, function () {
              M.tween(380, function (k) { A.sy = 0.78 + 0.22 * k; A.sx = 1.16 - 0.16 * k; }, fin, 'elastico');
            }, 'sale');
          }, 'lineal');
        }, 'sale');
      }, 'sale');
    };
    P.feliz = function (fin) {
      A.orejas = -0.2; ING_VOZ.balbuceo(3, true);
      P.saltar(0.7, function () { A.orejas = 0; if (fin) fin(); });
      cabeza.getWorldPosition(tmp); M.particulas('corazon', tmp.clone().add(new T.Vector3(0, 0.5, 0.3)), 6);
    };
    P.no = function (fin) {
      A.orejas = 0.45; ING_VOZ.balbuceo(2, false);
      M.tween(700, function (k) { A.giroY = Math.sin(k * Math.PI * 4) * 0.4 * (1 - k); }, function () { A.giroY = 0; M.esperar(400, function () { A.orejas = 0; if (fin) fin(); }); }, 'lineal');
    };
    P.reir = function (fin) {
      ING_VOZ.sfx('risa'); A.abre = 0.8;
      M.tween(900, function (k) { cuerpo.rotation.z = Math.sin(k * Math.PI * 8) * 0.12 * (1 - k); A.ladeo = Math.sin(k * Math.PI * 4) * 0.1; },
        function () { cuerpo.rotation.z = 0; A.ladeo = 0; A.abre = 0; if (fin) fin(); }, 'lineal');
      cabeza.getWorldPosition(tmp); M.particulas('nota', tmp.clone().add(new T.Vector3(0, 0.6, 0.3)), 3);
    };
    P.hablar = function (on) { A.hablando = !!on; };
    P.posBoca = function () { return boca.getWorldPosition(new T.Vector3()); };
    // comer: lleva el objeto a la boca, lo achica, mastica y queda feliz.
    P.comer = function (obj, fin) {
      var desde = obj.position.clone(), esc = obj.scale.clone(), hasta = P.posBoca();
      if (obj.parent !== M.scene) { obj.getWorldPosition(desde); M.scene.attach(obj); }
      A.abre = 1; P.mirarA(desde);
      M.tween(420, function (k) { obj.position.lerpVectors(desde, hasta, k); obj.position.y += Math.sin(k * Math.PI) * 0.5; obj.scale.copy(esc).multiplyScalar(1 - 0.75 * k); }, function () {
        if (obj.parent) obj.parent.remove(obj);
        ING_VOZ.sfx('nam'); P.mirar(0, 0);
        M.tween(560, function (k) { A.abre = Math.abs(Math.sin(k * Math.PI * 3)) * 0.8; A.sx = 1 + Math.abs(Math.sin(k * Math.PI * 3)) * 0.05; }, function () {
          A.abre = 0; A.sx = 1; M.particulas('miga', P.posBoca(), 8, { color: '#e9b872', arriba: 1.5, fuerza: 1.4 });
          P.feliz(fin);
        }, 'lineal');
      }, 'entraSale');
    };
    P.estornudar = function (fin) {
      A.abre = 0.3;
      M.tween(500, function (k) { A.giroX = -0.35 * k; A.sy = 1 + 0.08 * k; }, function () {
        ING_VOZ.sfx('achis'); A.abre = 1;
        M.tween(260, function (k) { A.giroX = -0.35 + 0.75 * k; A.sy = 1.08 - 0.2 * k; }, function () {
          cabeza.getWorldPosition(tmp); M.particulas('gota', tmp.clone().add(new T.Vector3(0, -0.1, 0.7)), 6, { color: '#cfefff', arriba: 1, fuerza: 1.6 });
          M.tween(400, function (k) { A.giroX = 0.4 * (1 - k); A.sy = 0.88 + 0.12 * k; }, function () { A.abre = 0; A.giroX = 0; A.sy = 1; P.reir(fin); }, 'elastico');
        }, 'sale');
      }, 'entraSale');
    };
    P.orejear = function () { M.tween(900, function (k) { A.orejas = Math.sin(k * Math.PI * 6) * 0.35 * (1 - k); }, function () { A.orejas = 0; }, 'lineal'); ING_VOZ.sfx('pio'); };
    P.guinar = function () { var o = ojos[1]; A.guino = true; M.tween(600, function (k) { o.scale.y = 0.1; }, function () { A.guino = false; }, 'lineal'); };
    // irA(x, z, fin): va dando saltitos hasta (x, z) y mira al frente.
    var camino = 0, andando = false;            // ponerEn corta una caminata a medias
    P.irA = function (x, z, fin) {
      var x0 = raiz.position.x, z0 = raiz.position.z, d = Math.hypot(x - x0, z - z0), n = Math.max(1, Math.round(d / 0.7)), i = 0, mio = ++camino;
      if (d < 0.05) { if (fin) fin(); return; }
      andando = true;
      P.mirar((x - x0) / Math.max(0.01, d), 0);
      (function paso() {
        if (mio !== camino) return;
        if (i >= n) { andando = false; P.mirar(0, 0); if (fin) fin(); return; }
        var a = i / n, b = (i + 1) / n; i++;
        M.tween(300, function (k) { if (mio !== camino) return; var t = a + (b - a) * k; raiz.position.x = x0 + (x - x0) * t; raiz.position.z = z0 + (z - z0) * t; A.alto = Math.sin(k * Math.PI) * 0.25; }, function () { A.alto = 0; paso(); }, 'lineal');
      })();
    };
    P.ponerEn = function (x, z) { if (andando) { andando = false; A.alto = 0; } camino++; raiz.position.x = x; raiz.position.z = z; };
    P.nacer = function (fin) {
      raiz.scale.setScalar(0.01);
      M.tween(900, function (k) { raiz.scale.setScalar(Math.max(0.01, A.escala * k)); }, function () { P.feliz(fin); }, 'elastico');
    };
    P.color = function () { return '#' + matC.color.getHexString(); };
    P.ponerColor = function (hex) { matC.color.set(hex); tonoPanza(); };
    P.mezclar = function (desde, hasta, k) { matC.color.set(desde).lerp(new T.Color(hasta), k); tonoPanza(); };
    P.colorA = function (hex, dur, fin) { var d = P.color(); M.tween(dur || 600, function (k) { P.mezclar(d, hex, k); }, fin); };
    P.destello = function (hex, ms, fin) { var d = P.color(); P.colorA(hex, 250, function () { M.esperar(ms || 900, function () { P.colorA(d, 350, fin); }); }); };
    P.escala = function (e) { A.escala = e; raiz.scale.setScalar(e); };
    P.dormir = function (on) { A.durmiendo = !!on; };
    P.visible = function (v) { raiz.visible = v; };
    P.grupo = raiz; P.cabeza = cabeza; P.partes = partes;
    P.alTocar = function (fn) { piezas.forEach(function (o) { M.tocable(o, function (hit) { fn(o.userData.parte, hit); }); }); };
    P.esMio = function (hit) { var o = hit && hit.obj; while (o) { if (o === raiz) return true; o = o.parent; } return false; };
    return P;
  }
  root.ING_MASCOTA3D = { VERSION: '1.1.0', crear: crear };
})(window);
