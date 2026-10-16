/* Inglés — objetos 3D para los juegos. window.ING_OBJ3D. Versión 1.3.0 (2026-10-15).
   v1.3.0 + mochila (juego "Pack the bag!" y el aula): userData.boca() es adonde vuelan los útiles.
   v1.2.0 + pelota (de fútbol, con gajos pintados) y flecha (para apuntar al patear), burbuja.
   v1.1.0 + moneda (para pagar en el súper) y etiqueta (cartelito de texto: precios, cantidades).
   El truco para no modelar: cada palabra con emoji se ve como una "ficha" (el emoji en un sprite que siempre mira a la cámara,
   con un platito y su sombra), así cualquier palabra nueva existe en 3D sin hacer nada.
   - ficha(M, w, tam): para comida y cosas · balde(M, color): balde de pintura · mancha(M, color): gota grande de pintura (presentar colores)
   - palabra(M, w, tam): ficha o mancha según la palabra · huevo(M): el huevo de la mascota, con rajarse(n) · mano(M): manito que señala
   - moneda(M): moneda dorada con estrella, parada mirando a la cámara · etiqueta(M, texto, {fondo, tinta, alto}): cartelito que siempre mira a la cámara
   - flotar(M, obj): sube y baja suave · temblar(M, obj) · apagar(obj, on): la pone gris y transparente (opción descartada) */
(function (root) {
  'use strict';
  var O = {};
  O.ficha = function (M, w, tam) {
    var T = M.T, g = new T.Group(); tam = tam || 0.8;
    var plato = new T.Mesh(new T.CylinderGeometry(tam * 0.55, tam * 0.45, 0.08, 28), M.toon('#ffffff')); plato.position.y = 0.04; g.add(plato); M.contorno(plato, 0.04);
    var mat = new T.SpriteMaterial({ map: M.texEmoji(w.img), transparent: true }), s = new T.Sprite(mat);
    s.scale.setScalar(tam); s.position.y = tam * 0.55 + 0.06; g.add(s);
    g.add(M.sombra(tam * 0.7));
    g.userData = { w: w, sprite: s, plato: plato, mats: [mat, plato.material] };
    return g;
  };
  O.balde = function (M, color, tam) {
    var T = M.T, g = new T.Group(); tam = tam || 1;
    var cuerpo = new T.Mesh(new T.CylinderGeometry(0.34 * tam, 0.27 * tam, 0.46 * tam, 24, 1, true), M.toon('#e9eef5')); cuerpo.material.side = T.DoubleSide;
    cuerpo.position.y = 0.23 * tam; g.add(cuerpo); M.contorno(cuerpo, 0.05);
    var fondo = new T.Mesh(new T.CircleGeometry(0.27 * tam, 24), M.toon('#cfd6e0')); fondo.rotation.x = -Math.PI / 2; fondo.position.y = 0.01; g.add(fondo);
    var matPintura = M.toon(color);
    var pintura = new T.Mesh(new T.CircleGeometry(0.32 * tam, 24), matPintura); pintura.rotation.x = -Math.PI / 2; pintura.position.y = 0.4 * tam; g.add(pintura);
    var franja = new T.Mesh(new T.CylinderGeometry(0.343 * tam, 0.32 * tam, 0.12 * tam, 24, 1, true), matPintura); franja.position.y = 0.36 * tam; g.add(franja);
    var chorro = new T.Mesh(new T.SphereGeometry(0.06 * tam, 10, 8), matPintura); chorro.scale.set(1, 2.2, 0.6); chorro.position.set(0.12 * tam, 0.3 * tam, 0.31 * tam); g.add(chorro);
    var asa = new T.Mesh(new T.TorusGeometry(0.3 * tam, 0.018 * tam, 6, 20, Math.PI), M.toon('#8a94a6')); asa.position.y = 0.46 * tam; asa.rotation.y = 0.3; g.add(asa);
    g.add(M.sombra(0.5 * tam));
    g.userData = { color: color, mats: [cuerpo.material, matPintura, fondo.material, asa.material] };
    return g;
  };
  O.mancha = function (M, color, tam) {
    var T = M.T, g = new T.Group(); tam = tam || 0.6;
    var m = new T.Mesh(new T.SphereGeometry(tam, 28, 20), M.toon(color)); m.scale.set(1, 0.85, 0.85); m.position.y = tam * 0.85; g.add(m); M.contorno(m, 0.05);
    var brillo = new T.Mesh(new T.SphereGeometry(tam * 0.18, 10, 8), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); brillo.position.set(-tam * 0.35, tam * 1.2, tam * 0.6); g.add(brillo);
    g.add(M.sombra(tam * 1.1));
    g.userData = { color: color, mats: [m.material] };
    return g;
  };
  O.palabra = function (M, w, tam) { return w.color ? O.mancha(M, w.color, (tam || 0.8) * 0.65) : O.ficha(M, w, tam); };
  O.huevo = function (M) {
    var T = M.T, g = new T.Group();
    var cascara = new T.Mesh(new T.SphereGeometry(0.62, 32, 24), M.toon('#fff4dc')); cascara.scale.set(0.82, 1, 0.82); cascara.position.y = 0.62; g.add(cascara); M.contorno(cascara, 0.04);
    var manchas = ['#ff9ec7', '#8ecbff', '#ffd43b', '#a3e3a1'];
    for (var i = 0; i < 9; i++) {
      var a = i * 2.4 + 0.5, y = 0.3 + (i % 3) * 0.3, r = 0.62 * 0.82 * Math.sqrt(1 - Math.pow((y - 0.62) / 0.62, 2)) - 0.01;   // radio del huevo a esa altura
      var p = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), M.toon(manchas[i % 4])); p.scale.set(1, 1, 0.35);
      p.position.set(Math.cos(a) * r, y, Math.sin(a) * r); p.lookAt(0, y, 0); g.add(p);
    }
    g.add(M.sombra(0.6));
    var rajas = new T.Group(); g.add(rajas);
    var matRaja = new T.MeshBasicMaterial({ color: 0x3a2a1a });
    // n: cuántas rajas (1 a 3): zigzag sobre el frente del huevo.
    g.userData.rajarse = function (n) {
      var y0 = 0.75 - (n - 1) * 0.12, x = -0.28 + (n - 1) * 0.06;
      for (var k = 0; k < 5; k++) {
        var seg = new T.Mesh(new T.BoxGeometry(0.14, 0.02, 0.02), matRaja), y = y0 + (k % 2 ? 0.05 : -0.05);
        seg.position.set(x + k * 0.12, y, Math.sqrt(Math.max(0, Math.pow(0.51 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 0.62) / 0.62, 2))), 2) - Math.pow(x + k * 0.12, 2))) + 0.012);
        seg.rotation.z = k % 2 ? -0.7 : 0.7; rajas.add(seg);
      }
    };
    g.userData.cascara = cascara;
    return g;
  };
  O.mano = function (M) {
    var T = M.T, s = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji('👆'), transparent: true, depthTest: false }));
    s.scale.setScalar(0.6); s.renderOrder = 10; s.raycast = function () {};
    var t = 0; M.fx({ update: function (dt) { if (!s.parent) return s.userData.vivo !== false; t += dt; s.center.set(0.5, 1 - 0.12 * Math.abs(Math.sin(t * 5))); return s.userData.vivo !== false; } });
    s.userData.quitar = function () { s.userData.vivo = false; if (s.parent) s.parent.remove(s); };
    return s;
  };
  O.moneda = function (M, tam) {
    var T = M.T, g = new T.Group(); tam = tam || 1;
    var cara = M.toon('#ffe58a'); cara.map = M.texEmoji('⭐');
    var m = new T.Mesh(new T.CylinderGeometry(0.15 * tam, 0.15 * tam, 0.045 * tam, 28), [M.toon('#f2a20c'), cara, M.toon('#f2a20c')]);
    m.rotation.x = Math.PI / 2; g.add(m); M.contorno(m, 0.06);
    g.userData = { mats: m.material };
    return g;
  };
  var cacheEtq = {};
  O.etiqueta = function (M, texto, o) {
    o = o || {}; var T = M.T, clave = texto + '|' + (o.fondo || '') + '|' + (o.tinta || ''), tex = cacheEtq[clave];
    if (!tex) {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128; var g = c.getContext('2d');
      g.fillStyle = o.fondo || '#ffffff'; g.strokeStyle = '#2b2340'; g.lineWidth = 8; g.beginPath();
      if (g.roundRect) g.roundRect(8, 8, 240, 112, 40); else g.rect(8, 8, 240, 112); g.fill(); g.stroke();
      g.fillStyle = o.tinta || '#2b2340'; g.font = 'bold 70px Fredoka, "Segoe UI Emoji", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, 128, 70);
      tex = cacheEtq[clave] = new T.CanvasTexture(c);
    }
    var s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true })), h = o.alto || 0.26;
    s.scale.set(h * 2, h, 1); s.raycast = function () {};
    return s;
  };
  // Mochila escolar: cuerpo con tapa redonda, bolsillo, manija y tiras atrás.
  O.mochila = function (M, color) {
    var T = M.T, g = new T.Group(), mat = M.toon(color || '#4dabf7'), mat2 = M.toon('#ffd43b'), osc = M.toon('#2b2340');
    var cuerpo = new T.Mesh(new T.BoxGeometry(0.56, 0.5, 0.3), mat); cuerpo.position.y = 0.29; g.add(cuerpo); M.contorno(cuerpo, 0.03);
    var tapa = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.3, 20, 1, false, 0, Math.PI), mat); tapa.rotation.z = Math.PI / 2; tapa.rotation.y = Math.PI / 2; tapa.position.y = 0.54; g.add(tapa); M.contorno(tapa, 0.03);
    var bolsillo = new T.Mesh(new T.BoxGeometry(0.4, 0.22, 0.08), mat2); bolsillo.position.set(0, 0.2, 0.18); g.add(bolsillo); M.contorno(bolsillo, 0.04);
    var cierre = new T.Mesh(new T.BoxGeometry(0.3, 0.025, 0.02), osc); cierre.position.set(0, 0.29, 0.225); g.add(cierre);
    var manija = new T.Mesh(new T.TorusGeometry(0.08, 0.02, 6, 14, Math.PI), osc); manija.position.set(0, 0.8, 0); g.add(manija);
    [-1, 1].forEach(function (s2) { var tira = new T.Mesh(new T.BoxGeometry(0.06, 0.5, 0.03), mat2); tira.position.set(s2 * 0.16, 0.36, -0.17); g.add(tira); });
    g.add(M.sombra(0.45));
    g.userData = { boca: function () { return g.localToWorld(new T.Vector3(0, 0.75, 0)); }, mats: [mat, mat2] };
    return g;
  };
  var texPelota = null;
  O.pelota = function (M, r) {
    var T = M.T; r = r || 0.22;
    if (!texPelota) {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128; var g = c.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#222033';
      for (var i = 0; i < 8; i++) for (var j = 0; j < 3; j++) { var x = i * 32 + (j % 2) * 16 + 8, y = 20 + j * 44; g.beginPath();
        for (var k = 0; k < 5; k++) { var a = k * Math.PI * 2 / 5 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10 * (j === 1 ? 1 : 0.7)); } g.fill(); }
      texPelota = new T.CanvasTexture(c);
    }
    var mat = M.toon('#ffffff'); mat.map = texPelota;
    var m = new T.Mesh(new T.SphereGeometry(r, 24, 18), mat); M.contorno(m, 0.05);
    var g2 = new T.Group(); g2.add(m); m.position.y = r; var sombra = M.sombra(r * 1.3); g2.add(sombra);
    g2.userData = { bola: m, sombra: sombra, r: r };
    return g2;
  };
  // Flecha sobre el piso, apuntando hacia -z (se gira con rotation.y); largo(l) la estira; color(c).
  O.flecha = function (M) {
    var T = M.T, g = new T.Group(), mat = new T.MeshBasicMaterial({ color: 0x40c057, transparent: true, opacity: 0.9, depthTest: false });
    var palo = new T.Mesh(new T.BoxGeometry(0.12, 0.03, 1), mat); palo.position.z = -0.5; g.add(palo);
    var punta = new T.Mesh(new T.ConeGeometry(0.2, 0.36, 3), mat); punta.rotation.x = -Math.PI / 2; punta.rotation.y = Math.PI; g.add(punta);
    palo.renderOrder = punta.renderOrder = 8; palo.raycast = punta.raycast = function () {};
    g.userData.largo = function (l) { palo.scale.z = l; palo.position.z = -l / 2; punta.position.z = -l - 0.15; };
    g.userData.color = function (c) { mat.color.set(c); };
    g.userData.largo(1);
    return g;
  };
  // Burbuja de jabón (sprite con brillo) para reventar.
  O.burbuja = function (M, tam) {
    var T = M.T, c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
    var gr = g.createRadialGradient(54, 50, 6, 64, 64, 60); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.35, 'rgba(190,230,255,.25)'); gr.addColorStop(0.85, 'rgba(160,120,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,.9)');
    g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3; g.stroke();
    var s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.setScalar(tam || 0.45);
    return s;
  };
  O.flotar = function (M, obj, amp) {
    var y0 = obj.position.y, t = Math.random() * 6, vivo = true;
    M.fx({ update: function (dt) { if (!vivo || !obj.parent) return false; t += dt; obj.position.y = y0 + Math.sin(t * 2.2) * (amp || 0.06); obj.rotation.y = Math.sin(t * 1.3) * 0.15; return true; } });
    return { parar: function () { vivo = false; obj.position.y = y0; } };
  };
  O.temblar = function (M, obj) {
    var x0 = obj.position.x;
    M.tween(450, function (k) { obj.position.x = x0 + Math.sin(k * Math.PI * 6) * 0.08 * (1 - k); }, function () { obj.position.x = x0; }, 'lineal');
  };
  O.apagar = function (obj, on) {
    (obj.userData.mats || []).forEach(function (m) { m.transparent = true; m.opacity = on ? 0.3 : 1; });
  };
  O.rebotar = function (M, obj, alto) {
    var y0 = obj.position.y;
    M.tween(420, function (k) { obj.position.y = y0 + Math.sin(k * Math.PI) * (alto || 0.4); }, function () { obj.position.y = y0; }, 'lineal');
  };
  root.ING_OBJ3D = O;
})(window);
