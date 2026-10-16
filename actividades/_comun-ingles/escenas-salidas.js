/* Inglés — salidas (three.js r128): café, restaurante, escuela y cine. window.ING_SALIDAS3D. Versión 1.0.0 (2026-10-15).
   crear(M) → { cafe, resto, escuela, cine }. Cada uno tiene grupo y mostrar(on) (esconde la habitación de siempre, M.cuarto)
   y lugarProfe() (dónde se para Miss Hoot: de moza, de maestra, de boletera).
   - cafe: mostrador con vitrina y cafetera, pizarra del menú, mesitas.
   - resto: mesa con mantel a cuadros y vela, sillas, cuadros, puerta de la cocina.
   - escuela: pizarrón (pizarra.formas(n, color, forma), pizarra.escribir(texto), pizarra.limpiar()), escritorio de la maestra,
     bancos, reloj con la hora de verdad y una mochila en el piso (mochila, boca()).
   - cine: pantalla (pelicula(id, ms, fin): una escena animada por sentimiento; cartel(texto)), telón, butacas,
     boletería y máquina de pochoclos; lugarPip() para mirar la película sin tapar la pantalla.
   Todo con formas y texturas de canvas (sin modelos ni archivos), con colores para claro y oscuro. */
(function (root) {
  'use strict';
  var EMOJI = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  function crear(M) {
    var T = M.T, L = {};
    function mostrarCon(g, extra) { return function (on) { g.visible = on; M.cuarto.visible = !on; if (extra) extra(on); }; }
    function caja(w, h, d, color, x, y, z, padre, borde) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), typeof color === 'string' ? M.toon(color) : color); m.position.set(x, y, z); padre.add(m); if (borde !== false) M.contorno(m, borde || 0.02); return m;
    }
    function cil(rt, rb, h, color, x, y, z, padre, borde, seg) {
      var m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 20), typeof color === 'string' ? M.toon(color) : color); m.position.set(x, y, z); padre.add(m); if (borde) M.contorno(m, borde); return m;
    }
    function emoji(e, tam, x, y, z, padre) { var s = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji(e), transparent: true })); s.scale.setScalar(tam); s.position.set(x, y, z); s.raycast = function () {}; padre.add(s); return s; }
    // Cartel de texto plano (pegado a la pared).
    function cartel(texto, o, w, h, x, y, z, padre) {
      var c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); var g = c.getContext('2d');
      g.fillStyle = o.fondo || '#ffffff'; g.beginPath(); if (g.roundRect) g.roundRect(6, 6, c.width - 12, c.height - 12, 36); else g.rect(6, 6, c.width - 12, c.height - 12); g.fill();
      g.lineWidth = 8; g.strokeStyle = o.borde || '#2b2340'; g.stroke();
      g.fillStyle = o.tinta || '#2b2340'; g.font = 'bold ' + (o.letra || 80) + 'px Fredoka, ' + EMOJI; g.textAlign = 'center'; g.textBaseline = 'middle';
      String(texto).split('\n').forEach(function (l, i, a) { g.fillText(l, c.width / 2, c.height / 2 + (i - (a.length - 1) / 2) * (o.letra || 80) * 1.15 + 4); });
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); m.position.set(x, y, z); padre.add(m); return m;
    }
    // Banda de color arriba de la pared curva (como el toldo del súper).
    function franjas(g, a, b, y, alto) {
      for (var k = 0; k < 14; k++) {
        var a0 = Math.PI * 0.62 + k * Math.PI * 0.76 / 14, t = new T.Mesh(new T.CylinderGeometry(4.62, 4.62, alto || 0.5, 4, 1, true, a0, Math.PI * 0.76 / 14), k % 2 ? b : a);
        t.material.side = T.DoubleSide; t.position.y = y || 3.55; g.add(t);
      }
    }
    var enPared = function (ang, alto, r) { r = r || 4.4; return new T.Vector3(Math.sin(ang) * r, alto, Math.cos(ang) * r); };   // ang = π: el fondo

    /* ================= café ================= */
    (function () {
      var tex = M.texPiso('#fff4e6', '#f3c99a', 6), s = M.sala({ piso: '#ffffff', bordePiso: '#b07a4a', pared: '#ffd6e0', texPiso: tex }), g = s.grupo;
      var rosa = M.toon('#ff8fb8'), blanco = M.toon('#ffffff'); franjas(g, rosa, blanco);
      cartel('☕ CAFÉ', { fondo: '#fff6cf', tinta: '#b0451c', letra: 110 }, 2.2, 0.62, 0, 3.0, -4.15, g);
      // menú en la pared
      var menu = cartel('MENU\n🧃 🍩 🧁\n🍵 🥪 🥐', { fondo: '#2f3b33', tinta: '#ffffff', borde: '#b07a4a', letra: 64 }, 1.4, 1.2, 2.3, 2.15, -3.55, g); menu.rotation.y = -0.55;
      // mostrador con vitrina
      var mos = new T.Group(); mos.position.set(-0.7, 0, -2.2); g.add(mos);
      var matMos = M.toon('#c98f52'); caja(3.0, 0.9, 0.8, matMos, 0, 0.45, 0, mos, 0.02); caja(3.1, 0.08, 0.9, '#f7f3ea', 0, 0.94, 0, mos, 0.015);
      for (var i = 0; i < 6; i++) caja(0.04, 0.7, 0.02, '#a86f3c', -1.25 + i * 0.5, 0.45, 0.41, mos, false);
      var vidrio = new T.Mesh(new T.BoxGeometry(1.5, 0.45, 0.6), M.toon('#dff6ff', { transparente: true, opacidad: 0.35 })); vidrio.position.set(-0.6, 1.21, 0); mos.add(vidrio); M.contorno(vidrio, 0.02);
      ['🍰', '🧁', '🍩', '🥐'].forEach(function (e, k) { emoji(e, 0.3, -1.1 + k * 0.33, 1.15, 0.02, mos); });
      var maq = caja(0.5, 0.55, 0.4, '#5b6b7a', 0.85, 1.25, -0.05, mos, 0.03); caja(0.22, 0.05, 0.22, '#2b2340', 0.85, 1.0, 0.18, mos, false);
      emoji('☕', 0.22, 0.85, 1.12, 0.2, mos);
      // lámparas colgantes
      [-1.6, 0.2].forEach(function (x) {
        cil(0.01, 0.01, 0.8, '#2b2340', x, 3.2, -2.2, g); var p = cil(0.05, 0.25, 0.22, '#ffcf3f', x, 2.75, -2.2, g, 0.05);
        var luz = new T.Sprite(new T.SpriteMaterial({ map: M.texBrillo, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color('#ffe9a0') })); luz.scale.setScalar(1.1); luz.position.set(x, 2.6, -2.2); luz.raycast = function () {}; g.add(luz);
      });
      // mesitas
      [[2.6, -0.9], [-2.9, 0.2]].forEach(function (p) {
        var m = new T.Group(); m.position.set(p[0], 0, p[1]); g.add(m);
        cil(0.5, 0.5, 0.06, '#ffffff', 0, 0.8, 0, m, 0.03); cil(0.05, 0.05, 0.8, '#5b6b7a', 0, 0.4, 0, m); cil(0.25, 0.3, 0.04, '#5b6b7a', 0, 0.02, 0, m);
        emoji(p[0] > 0 ? '🌷' : '🧋', 0.3, 0, 1.0, 0, m); m.add(M.sombra(0.6));
        [-1, 1].forEach(function (sx) { var b = new T.Group(); b.position.set(sx * 0.75, 0, 0.1); m.add(b); cil(0.2, 0.2, 0.08, '#ff8fb8', 0, 0.55, 0, b, 0.04); cil(0.03, 0.03, 0.55, '#5b6b7a', 0, 0.27, 0, b); });
      });
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#7a3d5a' : '#ffd6e0'); tex.pintar(osc ? '#8a7060' : '#fff4e6', osc ? '#6a5040' : '#f3c99a'); matMos.color.set(osc ? '#8a5a32' : '#c98f52'); });
      L.cafe = { grupo: g, mostrar: mostrarCon(g),
        lugarProfe: function () { return M.vertical() ? { x: -1.55, y: 0, z: -2.5, giro: 0.35, escala: 0.8 } : { x: -2.8, y: 0, z: -1.5, giro: 0.5, escala: 1 }; } };
    })();

    /* ================= restaurante ================= */
    (function () {
      var tex = M.texPiso('#c98f52', '#b67d43', 8, true), s = M.sala({ piso: '#ffffff', bordePiso: '#7a4a22', pared: '#ffe8b0', texPiso: tex }), g = s.grupo;
      var rojo = M.toon('#e8590c'), crema = M.toon('#fff3d6'); franjas(g, rojo, crema, 3.6, 0.4);
      cartel('🍽️ RESTAURANT', { fondo: '#ffffff', tinta: '#c92a2a', letra: 64 }, 2.6, 0.55, 0, 3.0, -4.15, g);
      // cuadros
      [['🍕', 2.55, 0.62], ['🍝', 3.55, 0.75], ['🌻', 2.85, 0.52]].forEach(function (q) {
        var p = enPared(q[1], 2.1), mar = new T.Group(); mar.position.copy(p); mar.lookAt(0, 2.1, 0); g.add(mar);
        caja(0.75, 0.75, 0.05, '#a86f3c', 0, 0, 0, mar, 0.03); var fondo = caja(0.62, 0.62, 0.02, '#fffaf0', 0, 0, 0.03, mar, false); emoji(q[0], q[2], 0, 0, 0.08, mar);
      });
      // puerta de la cocina con ojo de buey
      var pu = new T.Group(); pu.position.copy(enPared(Math.PI * 1.13, 0)); pu.lookAt(0, 0, 0); g.add(pu);
      caja(1.0, 2.1, 0.06, '#d9d2c3', 0, 1.05, 0.05, pu, 0.02); var ojo = new T.Mesh(new T.CircleGeometry(0.2, 24), M.toon('#bfe6ff', { emisivo: '#3a6a8a' })); ojo.position.set(0, 1.5, 0.1); pu.add(ojo);
      cartel('KITCHEN', { fondo: '#ffffff', letra: 90 }, 0.8, 0.22, 0, 2.3, 0.1, pu);
      // mesa con mantel a cuadros, vela y plato
      var cv = document.createElement('canvas'); cv.width = cv.height = 64; var cx = cv.getContext('2d');
      cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 64, 64); cx.fillStyle = 'rgba(230,57,70,.85)'; cx.fillRect(0, 0, 32, 64); cx.fillRect(0, 0, 64, 32); cx.fillStyle = '#e63946'; cx.fillRect(0, 0, 32, 32);
      var tm = new T.CanvasTexture(cv); tm.wrapS = tm.wrapT = T.RepeatWrapping; tm.repeat.set(4, 4); var matMantel = M.toon('#ffffff'); matMantel.map = tm;
      var mesa = new T.Group(); mesa.position.set(0, 0, -1.55); g.add(mesa);
      cil(1.0, 1.0, 0.06, matMantel, 0, 0.82, 0, mesa, 0.025, 36); cil(1.03, 1.08, 0.22, matMantel, 0, 0.7, 0, mesa, false, 36); cil(0.07, 0.07, 0.8, '#7a4a22', 0, 0.4, 0, mesa); cil(0.35, 0.4, 0.05, '#7a4a22', 0, 0.025, 0, mesa);
      var plato = cil(0.28, 0.24, 0.04, '#ffffff', 0, 0.87, 0.45, mesa, 0.03, 28);
      cil(0.04, 0.04, 0.2, '#fff3d6', 0.45, 0.95, -0.2, mesa, 0.04); var llama = emoji('🔥', 0.14, 0.45, 1.11, -0.2, mesa);
      var brillo = new T.Sprite(new T.SpriteMaterial({ map: M.texBrillo, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color('#ffcf7a') })); brillo.scale.setScalar(0.7); brillo.position.set(0.45, 1.12, -0.2); brillo.raycast = function () {}; mesa.add(brillo);
      var tLl = 0; M.cuadro(function (dt) { if (!g.visible) return; tLl += dt; llama.scale.setScalar(0.14 + Math.sin(tLl * 13) * 0.012); brillo.material.opacity = 0.75 + Math.sin(tLl * 9) * 0.2; });
      emoji('🌹', 0.24, -0.45, 1.0, -0.25, mesa); mesa.add(M.sombra(1.3));
      [-1, 1].forEach(function (sx) { var si = new T.Group(); si.position.set(sx * 1.35, 0, -1.55); si.rotation.y = -sx * Math.PI / 2; g.add(si);
        caja(0.6, 0.08, 0.6, '#a86f3c', 0, 0.5, 0, si, 0.03); caja(0.6, 0.75, 0.08, '#a86f3c', 0, 0.9, -0.28, si, 0.03); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { caja(0.06, 0.5, 0.06, '#7a4a22', q[0] * 0.25, 0.25, q[1] * 0.25, si, false); }); });
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#6b4f2a' : '#ffe8b0'); tex.pintar(osc ? '#8a5a32' : '#c98f52', osc ? '#7a4a22' : '#b67d43'); });
      L.resto = { grupo: g, mostrar: mostrarCon(g), plato: function () { return plato.getWorldPosition(new T.Vector3()); },
        lugarProfe: function () { return M.vertical() ? { x: 1.45, y: 0, z: -2.6, giro: -0.35, escala: 0.8 } : { x: 2.7, y: 0, z: -1.2, giro: -0.6, escala: 1 }; } };
    })();

    /* ================= escuela ================= */
    (function () {
      var tex = M.texPiso('#dbe9f5', '#bcd3e8', 7), s = M.sala({ piso: '#ffffff', bordePiso: '#5b7a99', pared: '#c9ead1', texPiso: tex }), g = s.grupo;
      cartel('A B C   1 2 3', { fondo: '#fff6cf', tinta: '#4263eb', letra: 96 }, 2.6, 0.45, 0, 3.35, -4.2, g);
      // pizarrón con textura de canvas
      var cv = document.createElement('canvas'); cv.width = 768; cv.height = 384; var cx = cv.getContext('2d'), tp = new T.CanvasTexture(cv);
      var piz = new T.Group(); piz.position.set(0.3, 1.35, -4.15); g.add(piz);          // bajo: arriba lo tapa el cartel de la orden
      caja(3.5, 1.85, 0.08, '#a86f3c', 0, 0, -0.03, piz, 0.03);
      var tabla = new T.Mesh(new T.PlaneGeometry(3.3, 1.65), new T.MeshBasicMaterial({ map: tp })); tabla.position.z = 0.02; piz.add(tabla);
      caja(3.3, 0.06, 0.16, '#a86f3c', 0, -0.88, 0.08, piz, 0.02); [[-1.2, '#ffffff'], [-1.0, '#ffd43b'], [-0.85, '#ff8fb8']].forEach(function (t) { caja(0.14, 0.035, 0.035, t[1], t[0], -0.83, 0.1, piz, false); });
      function fondoPiz() {
        cx.fillStyle = '#2f5a45'; cx.fillRect(0, 0, 768, 384);
        cx.fillStyle = 'rgba(255,255,255,.05)'; for (var k = 0; k < 40; k++) cx.fillRect((k * 97) % 768, (k * 53) % 384, 60, 3);
      }
      var pizarra = {
        limpiar: function () { fondoPiz(); tp.needsUpdate = true; },
        escribir: function (t) { fondoPiz(); cx.fillStyle = '#f8f9fa'; cx.font = 'bold 96px Fredoka, ' + EMOJI; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(t, 384, 240); tp.needsUpdate = true; },
        // n formas de tiza de un color, en filas de a 5, que aparecen de a una (ms entre una y otra).
        formas: function (n, hex, forma, ms, fin) {
          fondoPiz(); tp.needsUpdate = true; var filas = Math.ceil(n / 5), k = 0;
          (function una() {
            if (k >= n) { if (fin) fin(); return; }
            var fila = Math.floor(k / 5), enFila = Math.min(5, n - fila * 5), col = k % 5, x = 384 + (col - (enFila - 1) / 2) * 135, y = 245 + (fila - (filas - 1) / 2) * 140;
            cx.fillStyle = hex; cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = 5; cx.font = 'bold 128px Arial, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
            cx.fillText(forma, x, y + 6); cx.strokeText(forma, x, y + 6); tp.needsUpdate = true; k++;
            if (root.ING_VOZ) ING_VOZ.sfx('click');
            M.esperar(ms || 120, una);
          })();
        }
      };
      pizarra.limpiar();
      // escritorio de la maestra
      var esc = new T.Group(); esc.position.set(-2.35, 0, -2.0); esc.rotation.y = 0.45; g.add(esc);
      caja(1.5, 0.08, 0.75, '#c98f52', 0, 0.8, 0, esc, 0.02); caja(1.4, 0.72, 0.06, '#a86f3c', 0, 0.4, -0.33, esc, 0.02); [[-0.68, -0.33], [0.68, -0.33], [-0.68, 0.33], [0.68, 0.33]].forEach(function (q) { caja(0.07, 0.8, 0.07, '#7a4a22', q[0], 0.4, q[1], esc, false); });
      emoji('🍎', 0.28, 0.45, 1.0, 0.1, esc); caja(0.35, 0.1, 0.25, '#4dabf7', -0.45, 0.89, 0, esc, 0.03); caja(0.33, 0.08, 0.24, '#ff6b6b', -0.45, 0.98, 0, esc, 0.03);
      esc.add(M.sombra(1));
      // bancos de los chicos
      function banco(x, z) {
        var b = new T.Group(); b.position.set(x, 0, z); b.rotation.y = -0.3; g.add(b);
        caja(0.9, 0.06, 0.55, '#ffd43b', 0, 0.62, 0, b, 0.02); [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]].forEach(function (q) { caja(0.05, 0.62, 0.05, '#5b6b7a', q[0], 0.31, q[1], b, false); });
        caja(0.45, 0.05, 0.42, '#4dabf7', 0, 0.38, 0.5, b, 0.02); caja(0.45, 0.42, 0.05, '#4dabf7', 0, 0.6, 0.72, b, 0.02);
        emoji('📓', 0.2, -0.15, 0.7, 0, b); emoji('✏️', 0.16, 0.2, 0.69, 0.05, b); b.add(M.sombra(0.6));
      }
      banco(2.3, -2.1); banco(3.0, -0.6);
      // reloj con la hora de verdad
      var rel = new T.Group(); rel.position.copy(enPared(Math.PI * 0.8, 2.75, 4.38)); rel.lookAt(0, 2.75, 0); g.add(rel);
      var cara = new T.Mesh(new T.CircleGeometry(0.33, 32), M.toon('#ffffff')); rel.add(cara); var aro = new T.Mesh(new T.TorusGeometry(0.33, 0.035, 8, 32), M.toon('#e8590c')); rel.add(aro);
      var hora = caja(0.04, 0.18, 0.02, '#2b2340', 0, 0.09, 0.02, rel, false), min = caja(0.03, 0.26, 0.02, '#2b2340', 0, 0.13, 0.03, rel, false);
      var hG = new T.Group(), mG = new T.Group(); rel.add(hG); rel.add(mG); hG.add(hora); mG.add(min);
      M.cuadro(function () { if (!g.visible) return; var d = new Date(); mG.rotation.z = -d.getMinutes() / 60 * Math.PI * 2; hG.rotation.z = -((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2; });
      // mochila en el piso
      var moch = root.ING_OBJ3D.mochila(M, '#ff6b6b'); g.add(moch);
      function acomodar() { if (M.vertical()) { moch.position.set(1.25, 0, 0.5); moch.rotation.y = -0.5; } else { moch.position.set(1.9, 0, 0.3); moch.rotation.y = -0.45; } }
      acomodar(); root.addEventListener('resize', acomodar);
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#2f5a45' : '#c9ead1'); tex.pintar(osc ? '#6f7f8f' : '#dbe9f5', osc ? '#5a6a7a' : '#bcd3e8'); });
      L.escuela = { grupo: g, mostrar: mostrarCon(g), pizarra: pizarra, mochila: moch, boca: function () { return moch.userData.boca(); },
        lugarProfe: function () { return M.vertical() ? { x: -1.6, y: 0, z: -2.9, giro: 0.35, escala: 0.8 } : { x: -2.6, y: 0, z: -2.9, giro: 0.45, escala: 1 }; } };
    })();

    /* ================= cine ================= */
    (function () {
      var tex = M.texPiso('#7a2a4a', '#6a2040', 6), s = M.sala({ piso: '#ffffff', bordePiso: '#3d0f1e', pared: '#7a1f3a', texPiso: tex }), g = s.grupo;
      // pantalla
      var W = 640, H = 340, cv = document.createElement('canvas'); cv.width = W; cv.height = H; var cx = cv.getContext('2d'), tp = new T.CanvasTexture(cv);
      var pant = new T.Group(); pant.position.set(0, 2.25, -4.1); g.add(pant);
      caja(4.4, 2.4, 0.06, '#1a1020', 0, 0, -0.04, pant, false);
      var tela = new T.Mesh(new T.PlaneGeometry(4.2, 2.23), new T.MeshBasicMaterial({ map: tp })); pant.add(tela);
      // telón a los costados (pliegues) y arriba
      var matTelon = M.toon('#c92a2a');
      [-1, 1].forEach(function (sx) { for (var k = 0; k < 5; k++) { var p = cil(0.12, 0.14, 3.4, matTelon, sx * (2.3 + k * 0.17), 1.7, -3.95 + k * 0.03, g, k === 0 ? 0.04 : false, 10); } });
      caja(5.4, 0.45, 0.2, matTelon, 0, 3.55, -3.95, g, 0.03);
      // butacas: dos filas
      var matBut = M.toon('#d6336c');
      [[-2.6, 6], [-1.9, 5]].forEach(function (f, fi) {
        for (var k = 0; k < f[1]; k++) {
          var x = (k - (f[1] - 1) / 2) * 0.85, b = new T.Group(); b.position.set(x, 0, f[0]); g.add(b);
          caja(0.66, 0.16, 0.55, matBut, 0, 0.42, 0, b, 0.03); caja(0.66, 0.6, 0.12, matBut, 0, 0.72, -0.25, b, 0.03); caja(0.08, 0.5, 0.5, '#3a2a40', -0.37, 0.4, 0, b, false); caja(0.08, 0.5, 0.5, '#3a2a40', 0.37, 0.4, 0, b, false);
        }
      });
      // boletería (derecha) y pochoclos (izquierda)
      var bol = new T.Group(); g.add(bol);
      caja(1.2, 1.0, 0.8, '#ffd43b', 0, 0.5, 0, bol, 0.02); caja(1.3, 0.08, 0.9, '#fff3d6', 0, 1.02, 0, bol, 0.015);
      var vidrio = new T.Mesh(new T.BoxGeometry(1.1, 0.7, 0.04), M.toon('#dff6ff', { transparente: true, opacidad: 0.25 })); vidrio.position.set(0, 1.4, 0.3); bol.add(vidrio);
      var sign = cartel('🎟️ TICKETS', { fondo: '#ffffff', tinta: '#c92a2a', letra: 84 }, 1.3, 0.34, 0, 1.95, 0.32, bol);
      var poch = new T.Group(); g.add(poch);
      caja(0.8, 0.9, 0.6, '#e03131', 0, 0.45, 0, poch, 0.02); var vit = new T.Mesh(new T.BoxGeometry(0.75, 0.6, 0.55), M.toon('#fff9db', { transparente: true, opacidad: 0.45 })); vit.position.y = 1.2; poch.add(vit); M.contorno(vit, 0.02);
      caja(0.85, 0.12, 0.65, '#e03131', 0, 1.56, 0, poch, 0.02); for (var k = 0; k < 7; k++) emoji('🍿', 0.18, -0.25 + (k % 4) * 0.17, 1.0 + Math.floor(k / 4) * 0.12, 0.05, poch);
      cartel('POPCORN', { fondo: '#ffd43b', tinta: '#c92a2a', letra: 90 }, 0.9, 0.24, 0, 1.82, 0.0, poch);
      function acomodar() {
        var v = M.vertical();
        bol.position.set(v ? 1.55 : 2.75, 0, v ? -0.9 : 0.1); bol.rotation.y = v ? -0.3 : -0.55; bol.scale.setScalar(v ? 0.8 : 1);
        poch.position.set(v ? -1.6 : -2.9, 0, v ? -0.9 : 0.2); poch.rotation.y = v ? 0.3 : 0.55; poch.scale.setScalar(v ? 0.8 : 1);
      }
      acomodar(); root.addEventListener('resize', acomodar);

      /* ---------- la película: una escena por sentimiento, dibujada en la pantalla ---------- */
      function emo(e, x, y, tam, rot) { cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot); cx.font = Math.round(tam) + 'px ' + EMOJI; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(e, 0, 0); cx.restore(); }
      function fondo(a, b) { var gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); cx.fillStyle = gr; cx.fillRect(0, 0, W, H); }
      function texto(t, y, tam, color) { cx.fillStyle = color || '#ffffff'; cx.strokeStyle = '#2b2340'; cx.lineWidth = 8; cx.font = 'bold ' + (tam || 70) + 'px Fredoka, ' + EMOJI; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.strokeText(t, W / 2, y); cx.fillText(t, W / 2, y); }
      var pseudo = function (i) { var x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
      var ESCENA = {
        happy: function (t) {
          fondo('#ffe08a', '#ffb3c7'); for (var i = 0; i < 40; i++) { cx.fillStyle = ['#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8'][i % 5]; cx.fillRect(pseudo(i) * W, ((pseudo(i + 9) + t * 0.9) % 1) * H, 10, 16); }
          emo('🎂', W / 2, 250 - Math.abs(Math.sin(t * 12)) * 18, 150); [0, 1, 2].forEach(function (k) { emo('🎈', 110 + k * 210, H + 60 - ((t * 1.3 + k * 0.3) % 1.4) * (H + 120), 80); });
          if (t > 0.5) texto('Party!', 60, 60);
        },
        sad: function (t) {
          fondo('#9fb4d0', '#6c7f9c'); var k = Math.min(1, t / 0.45), y = t < 0.45 ? 150 : 150 + Math.min(1, (t - 0.45) / 0.2) * 130;
          emo('🧒', 200, 230, 130); emo('🍦', t < 0.45 ? 270 : 300, y, 90, t < 0.45 ? 0 : Math.min(Math.PI, (t - 0.45) * 12));
          if (t > 0.6) { cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 3; for (var i = 0; i < 30; i++) { var x = pseudo(i) * W, yy = ((pseudo(i + 3) + t * 3) % 1) * H; cx.beginPath(); cx.moveTo(x, yy); cx.lineTo(x - 6, yy + 22); cx.stroke(); } emo('🌧️', 480, 70, 100); }
        },
        scared: function (t) {
          fondo(t > 0.3 && Math.sin(t * 60) > 0.6 ? '#3a2f60' : '#120d24', '#05030c'); emo('🌙', 560, 60, 60);
          emo('👻', W / 2 + Math.sin(t * 20) * 20, 190, 60 + t * 190, Math.sin(t * 14) * 0.15); if (t > 0.6) texto('BOO!', 60, 80, '#ffd43b');
        },
        surprised: function (t) {
          fondo('#c9b8ff', '#9b87f5');
          if (t < 0.55) emo('🎁', W / 2, 210, 150, Math.sin(t * 70) * 0.12 * (t / 0.55));
          else { var k = Math.min(1, (t - 0.55) / 0.2); for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; emo('✨', W / 2 + Math.cos(a) * 200 * k, 190 + Math.sin(a) * 120 * k, 40); } emo('🐶', W / 2, 220 - Math.sin(k * Math.PI / 2) * 60, 90 + 70 * k); texto('Wow!', 50, 60); }
        },
        sleepy: function (t) {
          fondo('#1d2a5a', '#3a2a7a'); for (var i = 0; i < 30; i++) { cx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.6 * Math.abs(Math.sin(t * 6 + i))) + ')'; cx.fillRect(pseudo(i) * W, pseudo(i + 5) * 200, 4, 4); }
          emo('🌙', 520, 80, 100); emo('🛌', W / 2, 250, 150); [0, 1, 2].forEach(function (k) { var u = (t * 1.2 + k * 0.33) % 1; emo('💤', W / 2 + 60 + u * 80, 200 - u * 160, 40 + u * 30); });
        },
        hungry: function (t) {
          fondo('#ffd0a8', '#ffa07a'); emo('🍕', W / 2, 180, 150, t * Math.PI * 2);
          ['🍔', '🍟', '🌭', '🍩'].forEach(function (e, k) { var a = t * Math.PI * 3 + k * Math.PI / 2; emo(e, W / 2 + Math.cos(a) * 240, 180 + Math.sin(a) * 110, 70); }); if (t > 0.5) texto('Yum!', 300, 54);
        },
        angry: function (t) {
          fondo('#ffb3a0', '#ff8787'); var k = t < 0.45 ? 0 : Math.min(1, (t - 0.45) / 0.4);
          [0, 1, 2].forEach(function (i) { emo('🧱', 420 + k * (i - 1) * 140, 280 - i * 70 - (k ? Math.sin(k * Math.PI) * 120 * (i + 1) / 2 : 0), 80, k * (i - 1) * 2); });
          emo('⚽', t < 0.45 ? 40 + t / 0.45 * 340 : 380 - k * 200, 270, 60, t * 20); if (k > 0) { emo('💥', 420, 200, 60 + k * 80); emo('🧒', 130, 240, 120); }
        },
        cold: function (t) {
          fondo('#d6f0ff', '#a5d8ff'); for (var i = 0; i < 35; i++) emo('❄️', pseudo(i) * W, ((pseudo(i + 7) + t * 0.8) % 1) * H, 22 + pseudo(i + 2) * 22, t * 4 + i);
          emo('⛄', W / 2, 240, 150); emo('🌨️', 120, 70, 90);
        },
        hot: function (t) {
          fondo('#ffcf6e', '#ff922b'); emo('☀️', W / 2, 110, 140 + Math.sin(t * 20) * 10);
          cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 5; for (var i = 0; i < 5; i++) { cx.beginPath(); for (var x = 0; x <= W; x += 20) cx.lineTo(x, 230 + i * 22 + Math.sin(x / 40 + t * 12 + i) * 8); cx.stroke(); }
          cx.save(); cx.translate(500, 290); cx.scale(1, Math.max(0.35, 1 - t * 0.8)); emo('🍦', 0, -30, 90); cx.restore(); emo('🏖️', 130, 280, 90);
        }
      };
      function cartelPant(t) { fondo('#2b2340', '#120d24'); texto(t, H / 2, 74, '#ffd43b'); tp.needsUpdate = true; }
      cartelPant('🎬');
      var peli = null;
      function pelicula(id, ms, fin) {
        var f = ESCENA[id] || ESCENA.happy, t0 = 0, mio = {}; peli = mio;
        var quitar = M.cuadro(function (dt) {
          if (peli !== mio) { quitar(); return; }
          t0 += dt * 1000; var t = Math.min(1, t0 / ms); f(t); tp.needsUpdate = true;
          if (t >= 1) { quitar(); peli = null; if (fin) fin(); }
        });
      }
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#3d0f1e' : '#7a1f3a'); });
      L.cine = { grupo: g, mostrar: mostrarCon(g, function (on) { if (!on) { peli = null; cartelPant('🎬'); } }), pelicula: pelicula, cartel: cartelPant, ESCENAS: Object.keys(ESCENA),
        lugarProfe: function () { var p = bol.localToWorld(new T.Vector3(0, 0, -0.75)); return { x: p.x, y: 0.55 * bol.scale.x, z: p.z, giro: bol.rotation.y, escala: bol.scale.x * 0.9 }; },
        lugarPip: function () { return M.vertical() ? [-0.9, 0.9] : [-1.6, 0.7]; },
        lugarSnack: function () { return poch.localToWorld(new T.Vector3(0, 1.3, 0.3)); } };
    })();
    return L;
  }
  root.ING_SALIDAS3D = { VERSION: '1.0.0', crear: crear };
})(window);
