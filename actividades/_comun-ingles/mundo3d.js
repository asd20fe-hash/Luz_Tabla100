/* Inglés — mundo 3D (three.js r128). window.ING_MUNDO. Versión 1.1.0 (2026-10-15).
   v1.1.0 + M.atenuar(k) (apagar la luz al dormir), M.sala({piso, bordePiso, pared, texPiso, sinPared}) para armar otras habitaciones.
   crear(canvas) → M: una habitación tipo maqueta (plataforma redonda, pared curva con ventana, alfombra) con fondo transparente
   (se ve el fondo global de la app), luces toon, cámara que se acomoda a la pantalla y una ventana de día o de noche según la hora.
   Herramientas para los demás módulos:
     M.toon(color) material toon · M.contorno(mesh) borde de dibujito · M.sombra(r) mancha de sombra
     M.tween(dur, fn(k), fin, ease) · M.esperar(ms, fn) · M.cuadro(fn(dt,t)) · M.fx({update(dt)})
     M.particulas(tipo, pos, n, {color}) tipos: corazon, estrella, brillo, gota, miga, nota
     M.tocable(obj, fn(hit)) · M.arrastrable(obj, {tap, inicio, mover, soltar}) · M.alMover(fn(info)) · M.aPantalla(v3)
     M.anchoVisible(z) medio ancho visible a esa profundidad · M.limpiar(objs) saca objetos y sus toques
   Lanza un error si no hay WebGL (la actividad muestra el aviso). Se pausa cuando la pestaña no se ve. */
(function (root) {
  'use strict';
  var EASE = {
    lineal: function (k) { return k; },
    sale: function (k) { return 1 - Math.pow(1 - k, 3); },
    entraSale: function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    rebote: function (k) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    elastico: function (k) { return k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1; }
  };

  function crear(canvas, op) {
    op = op || {};
    var T = root.THREE; if (!T) throw new Error('three.js no cargó');
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    if (!renderer.getContext()) throw new Error('WebGL no disponible');
    renderer.setPixelRatio(Math.min(1.5, root.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    var scene = new T.Scene(), camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
    var M = { T: T, scene: scene, camera: camera, renderer: renderer, EASE: EASE, fps: 0 };

    /* ---------- materiales ---------- */
    var grad = (function () { var d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), t = new T.DataTexture(d, 3, 1, T.RGBAFormat);
      t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
    M.toon = function (color, o) { o = o || {}; var m = new T.MeshToonMaterial({ color: new T.Color(color), gradientMap: grad, transparent: !!o.transparente, opacity: o.opacidad === undefined ? 1 : o.opacidad });
      if (o.emisivo) m.emissive = new T.Color(o.emisivo); return m; };
    var matBorde = new T.MeshBasicMaterial({ color: 0x2b2340, side: T.BackSide });
    var sinRayo = function () { /* el borde no se toca */ };
    M.contorno = function (mesh, grosor) {
      var b = new T.Mesh(mesh.geometry, matBorde); b.scale.setScalar(1 + (grosor || 0.06)); b.raycast = sinRayo; b.userData.borde = true;
      mesh.add(b); return b;
    };
    M.matBorde = matBorde;
    var texSombra = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 2, 32, 32, 31);
      r.addColorStop(0, 'rgba(30,20,60,.45)'); r.addColorStop(1, 'rgba(30,20,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
    M.sombra = function (radio) {
      var s = new T.Mesh(new T.PlaneGeometry(radio * 2, radio * 2), new T.MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false }));
      s.rotation.x = -Math.PI / 2; s.position.y = 0.012; s.raycast = sinRayo; return s;
    };
    // Textura de un círculo blanco (para gotas, migas y brillos que se tiñen con el color del material).
    M.texCirculo = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 31);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,.95)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
    M.texBrillo = (function () { var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 63);
      r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(0.3, 'rgba(255,240,180,.45)'); r.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
    // Emoji como textura (se guardan para no dibujarlos dos veces).
    var cacheEmoji = {};
    M.texEmoji = function (e) {
      if (cacheEmoji[e]) return cacheEmoji[e];
      var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d');
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '200px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
      g.fillText(e, 128, 140);
      var t = new T.CanvasTexture(c); cacheEmoji[e] = t; return t;
    };

    /* ---------- habitación ---------- */
    var hemi = new T.HemisphereLight(0xffffff, 0xb59ad8, 0.75), sol = new T.DirectionalLight(0xffffff, 0.75);
    sol.position.set(3, 6, 5); scene.add(hemi, sol);
    var amb = new T.AmbientLight(0xffffff, 0.25); scene.add(amb);
    var cuarto = new T.Group(); scene.add(cuarto); M.cuarto = cuarto;
    var matPiso = M.toon('#f1c27d'), matBordePiso = M.toon('#c98f52'), matPared = M.toon('#cdb8ff'), matAlfombra = M.toon('#ff9ec7');
    matPared.side = T.DoubleSide;
    var piso = new T.Mesh(new T.CylinderGeometry(4.6, 4.4, 0.5, 64), [matBordePiso, matPiso, matBordePiso]);
    piso.position.y = -0.25; cuarto.add(piso); M.contorno(piso, 0.012);
    var alf = new T.Mesh(new T.CircleGeometry(1.9, 48), matAlfombra); alf.rotation.x = -Math.PI / 2; alf.position.set(0, 0.006, 0.3); cuarto.add(alf);
    var alf2 = new T.Mesh(new T.RingGeometry(1.55, 1.68, 48), M.toon('#fff3a8')); alf2.rotation.x = -Math.PI / 2; alf2.position.set(0, 0.009, 0.3); cuarto.add(alf2);
    var pared = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 3.8, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), matPared);
    pared.position.y = 1.9; cuarto.add(pared);
    var zocalo = new T.Mesh(new T.CylinderGeometry(4.52, 4.52, 0.25, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), M.toon('#ffffff')); zocalo.material.side = T.DoubleSide;
    zocalo.position.y = 0.125; cuarto.add(zocalo);
    // Ventana: cielo pintado en un canvas (día o noche) y marco.
    var cvVentana = document.createElement('canvas'); cvVentana.width = 256; cvVentana.height = 200;
    var texVentana = new T.CanvasTexture(cvVentana);
    var ventana = new T.Group(); ventana.position.set(0.9, 2.1, -4.35); ventana.rotation.y = -0.2; cuarto.add(ventana);
    var vidrio = new T.Mesh(new T.PlaneGeometry(1.7, 1.33), new T.MeshBasicMaterial({ map: texVentana })); ventana.add(vidrio);
    var matMarco = M.toon('#ffffff');
    [[0, 0.7, 1.9, 0.12], [0, -0.7, 1.9, 0.12], [-0.9, 0, 0.12, 1.5], [0.9, 0, 0.12, 1.5], [0, 0, 0.06, 1.4], [0, 0, 1.8, 0.06]].forEach(function (m) {
      var b = new T.Mesh(new T.BoxGeometry(m[2], m[3], 0.08), matMarco); b.position.set(m[0], m[1], 0.04); ventana.add(b); });
    function pintarVentana(noche) {
      var g = cvVentana.getContext('2d'), w = 256, h = 200, gr = g.createLinearGradient(0, 0, 0, h);
      if (noche) { gr.addColorStop(0, '#0b1240'); gr.addColorStop(1, '#3a2a7a'); } else { gr.addColorStop(0, '#5ec8ff'); gr.addColorStop(1, '#c9f0ff'); }
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      if (noche) {
        g.fillStyle = '#fff'; for (var i = 0; i < 40; i++) { g.globalAlpha = 0.4 + Math.random() * 0.6; g.fillRect(Math.random() * w, Math.random() * h * 0.8, 2, 2); }
        g.globalAlpha = 1; g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(190, 50, 26, 0, 7); g.fill(); g.fillStyle = '#0b1240'; g.beginPath(); g.arc(178, 42, 24, 0, 7); g.fill();
      } else {
        g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(200, 48, 28, 0, 7); g.fill();
        g.fillStyle = '#fff'; [[60, 60], [120, 110], [40, 140]].forEach(function (n) { g.beginPath(); g.arc(n[0], n[1], 18, 0, 7); g.arc(n[0] + 20, n[1] - 8, 22, 0, 7); g.arc(n[0] + 42, n[1], 17, 0, 7); g.fill(); });
        g.fillStyle = '#6fcf5a'; g.beginPath(); g.ellipse(70, h + 30, 140, 70, 0, 0, 7); g.ellipse(220, h + 40, 120, 70, 0, 0, 7); g.fill();
      }
      texVentana.needsUpdate = true;
    }
    // Planta y repisa (decoración).
    var maceta = new T.Group(); maceta.position.set(3.1, 0, -1.9); cuarto.add(maceta);
    var mac = new T.Mesh(new T.CylinderGeometry(0.32, 0.24, 0.5, 20), M.toon('#e2725b')); mac.position.y = 0.25; maceta.add(mac); M.contorno(mac, 0.05);
    [[0, 0.75, 0, 0.36], [-0.22, 0.62, 0.05, 0.26], [0.22, 0.66, -0.05, 0.28], [0.05, 1.02, 0, 0.24]].forEach(function (h) {
      var s = new T.Mesh(new T.SphereGeometry(h[3], 16, 12), M.toon('#4fbf6a')); s.position.set(h[0], h[1], h[2]); maceta.add(s); M.contorno(s, 0.05); });
    maceta.add(M.sombra(0.5));
    var repisa = new T.Mesh(new T.BoxGeometry(1.4, 0.08, 0.35), M.toon('#c98f52')); repisa.position.set(-1.5, 2.55, -3.9); repisa.rotation.y = 0.33; cuarto.add(repisa);
    var libros = [['#ff6b6b', 0.26], ['#4dabf7', 0.32], ['#ffd43b', 0.22]];
    libros.forEach(function (l, i) { var b = new T.Mesh(new T.BoxGeometry(0.14, l[1], 0.24), M.toon(l[0])); b.position.set(-0.4 + i * 0.17, 0.04 + l[1] / 2, 0); repisa.add(b); });
    var pel = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), M.toon('#ffffff')); pel.position.set(0.35, 0.19, 0); repisa.add(pel);

    // Otra habitación con la misma forma (plataforma redonda y pared curva). Devuelve {grupo, mats}; empieza oculta.
    M.sala = function (o) {
      var g = new T.Group(); g.visible = false; scene.add(g);
      var mats = { piso: M.toon(o.piso || '#ffffff'), borde: M.toon(o.bordePiso || '#c08048'), pared: M.toon(o.pared || '#cdb8ff') };
      mats.pared.side = T.DoubleSide; if (o.texPiso) mats.piso.map = o.texPiso;
      var pi = new T.Mesh(new T.CylinderGeometry(4.6, 4.4, 0.5, 64), [mats.borde, mats.piso, mats.borde]); pi.position.y = -0.25; g.add(pi); M.contorno(pi, 0.012);
      if (!o.sinPared) { var pa = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, o.altoPared || 3.8, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), mats.pared); pa.position.y = (o.altoPared || 3.8) / 2; g.add(pa); }
      return { grupo: g, mats: mats };
    };
    // Textura a cuadros o a rayas para pisos (a, b: colores; rayas: true para rayas).
    M.texPiso = function (a, b, rep, rayas) {
      var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
      x.fillStyle = a; x.fillRect(0, 0, 128, 128); x.fillStyle = b;
      if (rayas) x.fillRect(0, 0, 64, 128); else { x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64); }
      var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep || 5, rep || 5); t.userData = { cv: c, rayas: rayas };
      t.pintar = function (a2, b2) { x.fillStyle = a2; x.fillRect(0, 0, 128, 128); x.fillStyle = b2; if (rayas) x.fillRect(0, 0, 64, 128); else { x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64); } t.needsUpdate = true; };
      return t;
    };
    M.alTema = function (fn) { temas.push(fn); fn(M.oscuro()); };
    var temas = [];

    /* ---------- tema y hora ---------- */
    M.noche = function () { var h = new Date().getHours(); return h >= 20 || h < 7; };
    M.oscuro = function () { return MATE.tema.oscuro(); };
    var atenua = 1;
    function aplicarTema() {
      var osc = M.oscuro();
      // Con más luz el toon se quema a blanco: en claro se aclaran los colores, no las luces.
      hemi.intensity = (osc ? 0.55 : 0.6) * atenua; sol.intensity = (osc ? 0.55 : 0.6) * atenua; amb.intensity = (osc ? 0.2 : 0.16) * Math.max(0.6, atenua);
      hemi.color.set(osc ? '#c8c4ff' : '#ffffff'); hemi.groundColor.set(osc ? '#4a3a7a' : '#b59ad8');
      matPared.color.set(osc ? '#5b4b9a' : '#b9a3f5'); matPiso.color.set(osc ? '#b98a5a' : '#e8b06a'); matAlfombra.color.set(osc ? '#b0558a' : '#f27bb3');
      matBordePiso.color.set(osc ? '#8a5a32' : '#c08048');
      matBorde.color.set(osc ? '#120c26' : '#2b2340');
      pintarVentana(M.noche());
      if (typeof temas !== 'undefined') temas.forEach(function (f) { f(osc); });
    }
    // k: 1 luz normal, menos para oscurecer (al dormir); con dur, de a poco.
    M.atenuar = function (k, dur) {
      var a0 = atenua; if (!dur) { atenua = k; aplicarTema(); return; }
      M.tween(dur, function (t) { atenua = a0 + (k - a0) * t; aplicarTema(); }, null, 'entraSale');
    };
    aplicarTema();
    if (root.MutationObserver) new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-bg'] });
    if (root.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', aplicarTema); }

    /* ---------- cámara ---------- */
    var mira = new T.Vector3(0, 1.0, 0), parallax = { x: 0, y: 0 }, W = 1, H = 1;
    M.vertical = function () { return W / H < 0.85; };
    function acomodar() {
      W = canvas.clientWidth || root.innerWidth; H = canvas.clientHeight || root.innerHeight;
      renderer.setSize(W, H, false); camera.aspect = W / H;
      var tan = Math.tan(camera.fov * Math.PI / 360), medio = M.vertical() ? 2.5 : 4.4;
      M.dist = Math.max(5.6, medio / (camera.aspect * tan));
      camera.updateProjectionMatrix(); ubicarCamara();
    }
    function ubicarCamara() {
      camera.position.set(parallax.x * 0.35, 3.0 + (M.vertical() ? 0.6 : 0) + parallax.y * 0.15, M.dist);
      camera.lookAt(mira.x, mira.y + (M.vertical() ? 0.25 : 0), mira.z);
    }
    M.anchoVisible = function (z) { var d = M.dist - (z || 0); return d * Math.tan(camera.fov * Math.PI / 360) * camera.aspect; };
    root.addEventListener('resize', acomodar);

    /* ---------- tiempo: tweens, efectos y cuadros ---------- */
    var tweens = [], fxs = [], cuadros = [];
    M.tween = function (dur, fn, fin, ease) {
      var tw = { t: 0, dur: Math.max(1, dur), fn: fn, fin: fin, ease: EASE[ease] || ease || EASE.sale, vivo: true };
      tweens.push(tw); fn(0); return { cancelar: function () { tw.vivo = false; } };
    };
    M.esperar = function (ms, fn) { return M.tween(ms, function () {}, fn, 'lineal'); };
    M.fx = function (f) { fxs.push(f); return f; };
    M.cuadro = function (fn) { cuadros.push(fn); return function () { var i = cuadros.indexOf(fn); if (i >= 0) cuadros.splice(i, 1); }; };

    /* ---------- partículas ---------- */
    var EMO = { corazon: '❤️', estrella: '⭐', nota: '🎵', zzz: '💤' };
    M.particulas = function (tipo, pos, n, o) {
      o = o || {};
      for (var i = 0; i < (n || 8); i++) (function () {
        var map = EMO[tipo] ? M.texEmoji(EMO[tipo]) : (tipo === 'brillo' ? M.texBrillo : M.texCirculo);
        var mat = new T.SpriteMaterial({ map: map, transparent: true, depthWrite: false, color: new T.Color(o.color || '#ffffff') });
        if (tipo === 'brillo') mat.blending = T.AdditiveBlending;
        var s = new T.Sprite(mat), tam = (o.tam || (EMO[tipo] ? 0.32 : (tipo === 'brillo' ? 0.5 : 0.14))) * (0.7 + Math.random() * 0.6);
        s.scale.setScalar(tam); s.position.copy(pos); scene.add(s);
        var a = Math.random() * Math.PI * 2, f = o.fuerza || (tipo === 'corazon' || tipo === 'nota' || tipo === 'zzz' ? 1.2 : 2.4);
        var v = new T.Vector3(Math.cos(a) * f * (0.4 + Math.random()), (o.arriba === undefined ? 2.2 : o.arriba) * (0.6 + Math.random() * 0.8), Math.sin(a) * f * 0.5);
        var flota = tipo === 'corazon' || tipo === 'nota' || tipo === 'zzz', g = flota || tipo === 'brillo' ? -0.4 : (o.gravedad === undefined ? 6 : o.gravedad), vida = o.vida || (flota ? 1.4 : 0.9), t = 0, giro = (Math.random() - 0.5) * 4;
        M.fx({ update: function (dt) {
          t += dt; v.y -= g * dt; s.position.addScaledVector(v, dt); mat.rotation += giro * dt;
          if (tipo === 'gota' && s.position.y < 0.02) { s.position.y = 0.02; v.set(0, 0, 0); }
          mat.opacity = Math.min(1, 2.5 * (1 - t / vida));
          if (t >= vida) { scene.remove(s); mat.dispose(); return false; }
          return true;
        } });
      })();
    };
    // Brillo falso (sprite aditivo) que late detrás de un objeto; devuelve {quitar}.
    M.aura = function (obj, tam, color) {
      var mat = new T.SpriteMaterial({ map: M.texBrillo, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(color || '#fff2a8') });
      var s = new T.Sprite(mat); s.scale.setScalar(tam || 1.2); s.position.z = -0.05; s.raycast = sinRayo; obj.add(s);
      var vivo = true, t = 0;
      M.fx({ update: function (dt) { t += dt; s.scale.setScalar((tam || 1.2) * (1 + 0.12 * Math.sin(t * 5))); if (!vivo) { obj.remove(s); mat.dispose(); } return vivo; } });
      return { quitar: function () { vivo = false; } };
    };

    /* ---------- toques ---------- */
    var rayo = new T.Raycaster(), ndc = new T.Vector2(), tocables = [], arrastres = [], movidas = [], arr = null, abajo = null;
    M.tocable = function (obj, fn) { obj.userData.tocar = fn; if (tocables.indexOf(obj) < 0) tocables.push(obj); return obj; };
    M.arrastrable = function (obj, cb) { obj.userData.arrastre = cb; if (tocables.indexOf(obj) < 0) tocables.push(obj); return obj; };
    M.alMover = function (fn) { movidas.push(fn); return function () { var i = movidas.indexOf(fn); if (i >= 0) movidas.splice(i, 1); }; };
    M.quitarToque = function (obj) { var i = tocables.indexOf(obj); if (i >= 0) tocables.splice(i, 1); delete obj.userData.tocar; delete obj.userData.arrastre; };
    M.limpiar = function (objs) { (objs || []).forEach(function (o) { if (!o) return; M.quitarToque(o); if (o.parent) o.parent.remove(o); }); };
    function aNDC(e) { var r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); return ndc; }
    // Lo invisible no se toca (el raycaster de three no mira si un padre está oculto).
    function seVe(o) { while (o) { if (o.visible === false) return false; o = o.parent; } return true; }
    function dueno(o) { while (o) { if (tocables.indexOf(o) >= 0 && (o.userData.tocar || o.userData.arrastre)) return o; o = o.parent; } return null; }
    M.golpe = function (e, lista) {
      rayo.setFromCamera(aNDC(e), camera);
      var hits = rayo.intersectObjects(lista || tocables, true);
      for (var i = 0; i < hits.length; i++) { var d = dueno(hits[i].object); if (d && seVe(hits[i].object)) return { obj: d, hit: hits[i] }; }
      return null;
    };
    // Punto del rayo sobre un plano vertical a la profundidad z (para arrastrar).
    var plano = new T.Plane(new T.Vector3(0, 0, 1), 0), tmp = new T.Vector3();
    M.enPlano = function (e, z) { rayo.setFromCamera(aNDC(e), camera); plano.constant = -z; return rayo.ray.intersectPlane(plano, tmp) ? tmp.clone() : null; };
    M.aPantalla = function (v) { var p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H }; };
    canvas.addEventListener('pointerdown', function (e) {
      var g = M.golpe(e); abajo = { x: e.clientX, y: e.clientY, t: Date.now(), g: g };
      if (g && g.obj.userData.arrastre) { arr = { obj: g.obj, cb: g.obj.userData.arrastre, z: g.obj.getWorldPosition(new T.Vector3()).z, movio: false }; if (arr.cb.inicio) arr.cb.inicio(e); }
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    });
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); parallax.x = ((e.clientX - r.left) / r.width) * 2 - 1; parallax.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      var info = { e: e, abajo: !!abajo, x: parallax.x, y: -parallax.y };
      movidas.slice().forEach(function (f) { f(info); });
      if (arr && abajo) {
        if (Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 12) arr.movio = true;
        if (arr.movio) { var p = M.enPlano(e, arr.z); if (p && arr.cb.mover) arr.cb.mover(p, e); }
      }
    });
    function soltar(e) {
      if (!abajo) return;
      var corto = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) < 12 && Date.now() - abajo.t < 600;
      if (arr) { var a = arr; arr = null; if (!a.movio && corto) { if (a.cb.tap) a.cb.tap(e); else if (a.obj.userData.tocar) a.obj.userData.tocar(abajo.g.hit, e); } else if (a.cb.soltar) a.cb.soltar(e); }
      else if (corto && abajo.g && abajo.g.obj.userData.tocar) abajo.g.obj.userData.tocar(abajo.g.hit, e);
      abajo = null;
    }
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', function () { if (arr && arr.cb.soltar) arr.cb.soltar(null); arr = null; abajo = null; });
    canvas.style.touchAction = 'none';

    /* ---------- bucle ---------- */
    var raf = 0, ultimo = 0, t = 0, cuentaFps = 0, tFps = 0, pausado = false;
    function bucle(ts) {
      raf = requestAnimationFrame(bucle);
      var dt = Math.min(0.05, ultimo ? (ts - ultimo) / 1000 : 0.016); ultimo = ts; t += dt;
      cuentaFps++; tFps += dt; if (tFps >= 1) { M.fps = cuentaFps; cuentaFps = 0; tFps = 0; }
      for (var i = tweens.length - 1; i >= 0; i--) {
        var tw = tweens[i]; if (!tw.vivo) { tweens.splice(i, 1); continue; }
        tw.t += dt * 1000; var k = Math.min(1, tw.t / tw.dur); tw.fn(tw.ease(k));
        if (k >= 1) { tweens.splice(i, 1); if (tw.fin) tw.fin(); }
      }
      fxs = fxs.filter(function (f) { return f.update(dt) !== false; });
      cuadros.slice().forEach(function (f) { f(dt, t); });
      ubicarCamara();
      renderer.render(scene, camera);
    }
    M.iniciar = function () { if (!raf && !pausado) { ultimo = 0; raf = requestAnimationFrame(bucle); } };
    M.parar = function () { cancelAnimationFrame(raf); raf = 0; };
    document.addEventListener('visibilitychange', function () { pausado = document.hidden; if (pausado) M.parar(); else M.iniciar(); });
    acomodar(); M.iniciar();
    return M;
  }

  root.ING_MUNDO = { VERSION: '1.1.0', crear: crear, EASE: EASE };
})(window);
