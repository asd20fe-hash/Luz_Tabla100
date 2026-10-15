/* Inglés — escena del supermercado (three.js r128). window.ING_SUPER3D. Versión 1.0.0 (2026-10-15).
   crear(M) → S con: mostrar(on) (esconde la habitación de la casa y muestra el súper), huecos() (dónde va cada cosa del estante),
   lugarPip() y lugarCarrito() (según la pantalla), carrito {grupo, meter(obj) → lo pone adentro, vaciar()}, caja {grupo, pantalla(texto), cajon()},
   bandeja(n) → n posiciones para las monedas sobre el mostrador.
   Todo hecho con formas y colores (sin modelos), con colores para claro y oscuro. */
(function (root) {
  'use strict';
  function crear(M) {
    var T = M.T, S = {}, g = new T.Group(); g.visible = false; M.scene.add(g);
    var mats = {
      piso: M.toon('#ffffff'), bordePiso: M.toon('#7fb7d9'), pared: M.toon('#bfeee0'), estante: M.toon('#f7f3ea'), lateral: M.toon('#ff8a65'),
      franja: M.toon('#ffd54f'), caja: M.toon('#4dabf7'), tapa: M.toon('#e9eef5'), metal: M.toon('#b8c2d1'), negro: M.toon('#3a3550'), toldo1: M.toon('#ff6b6b'), toldo2: M.toon('#ffffff')
    };
    mats.pared.side = T.DoubleSide;
    // piso a cuadros
    var cvPiso = document.createElement('canvas'); cvPiso.width = cvPiso.height = 256;
    var texPiso = new T.CanvasTexture(cvPiso); texPiso.wrapS = texPiso.wrapT = T.RepeatWrapping; texPiso.repeat.set(5, 5); mats.piso.map = texPiso;
    function pintarPiso(osc) {
      var c = cvPiso.getContext('2d'), a = osc ? '#6f7f9f' : '#ffffff', b = osc ? '#3c4862' : '#a9d3ee';
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? b : a; c.fillRect(i * 128, j * 128, 128, 128); }
      texPiso.needsUpdate = true;
    }
    var piso = new T.Mesh(new T.CylinderGeometry(4.6, 4.4, 0.5, 64), [mats.bordePiso, mats.piso, mats.bordePiso]); piso.position.y = -0.25; g.add(piso); M.contorno(piso, 0.012);
    var pared = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 3.8, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), mats.pared); pared.position.y = 1.9; g.add(pared);
    // toldo a rayas arriba de la pared
    for (var k = 0; k < 14; k++) {
      var a0 = Math.PI * 0.62 + k * Math.PI * 0.76 / 14;
      var t = new T.Mesh(new T.CylinderGeometry(4.62, 4.62, 0.5, 4, 1, true, a0, Math.PI * 0.76 / 14), k % 2 ? mats.toldo2 : mats.toldo1);
      t.material.side = T.DoubleSide; t.position.y = 3.55; g.add(t);
    }
    // cartel SHOP
    var cvCartel = document.createElement('canvas'); cvCartel.width = 512; cvCartel.height = 128;
    (function () { var c = cvCartel.getContext('2d'); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect ? c.roundRect(6, 6, 500, 116, 40) : c.rect(6, 6, 500, 116); c.fill();
      c.lineWidth = 8; c.strokeStyle = '#2b2340'; c.stroke(); c.fillStyle = '#e8590c'; c.font = 'bold 84px Fredoka, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🛒 SHOP', 256, 70); })();
    var cartel = new T.Mesh(new T.PlaneGeometry(2.4, 0.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cvCartel), transparent: true }));
    cartel.position.set(0, 2.95, -4.1); g.add(cartel);

    /* ---------- estante (góndola) ---------- */
    var gondola = new T.Group(); g.add(gondola);
    var ALTOS = [0.95, 0.06];                         // estante de arriba y de abajo
    var huecos = [];
    function armarGondola(medio) {
      while (gondola.children.length) gondola.remove(gondola.children[0]);
      var ancho = medio * 2 + 1.3;
      [0.06, 0.95, 1.84].forEach(function (y) {
        var tabla = new T.Mesh(new T.BoxGeometry(ancho, 0.1, 0.8), mats.estante); tabla.position.y = y - 0.05; gondola.add(tabla); M.contorno(tabla, 0.015);
        if (y < 1.8) { var fr = new T.Mesh(new T.BoxGeometry(ancho, 0.12, 0.04), mats.franja); fr.position.set(0, y - 0.07, 0.42); gondola.add(fr); }
      });
      [-1, 1].forEach(function (s) { var lado = new T.Mesh(new T.BoxGeometry(0.14, 1.95, 0.84), mats.lateral); lado.position.set(s * ancho / 2, 0.92, 0); gondola.add(lado); M.contorno(lado, 0.02); });
      var fondo = new T.Mesh(new T.BoxGeometry(ancho, 1.9, 0.05), mats.estante); fondo.position.set(0, 0.92, -0.4); gondola.add(fondo);
      huecos = [];
      ALTOS.forEach(function (y) { [-1, 0, 1].forEach(function (c) { huecos.push(new T.Vector3(c * medio, y, 0.05)); }); });
    }

    /* ---------- carrito ---------- */
    var carro = new T.Group(); g.add(carro);
    var cesta = new T.Mesh(new T.BoxGeometry(0.9, 0.5, 0.6, 1, 1, 1), M.toon('#dfe8f2', { transparente: true, opacidad: 0.7 })); cesta.position.y = 0.72; carro.add(cesta); M.contorno(cesta, 0.03);
    var borde = new T.Mesh(new T.BoxGeometry(0.96, 0.06, 0.66), mats.caja); borde.position.y = 0.98; carro.add(borde);
    var manija = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.9, 8), mats.toldo1); manija.rotation.z = Math.PI / 2; manija.position.set(0, 1.12, -0.4); carro.add(manija);
    [-0.38, 0.38].forEach(function (x) { var palo = new T.Mesh(new T.BoxGeometry(0.04, 0.16, 0.04), mats.metal); palo.position.set(x, 1.04, -0.36); carro.add(palo); });
    var chasis = new T.Mesh(new T.BoxGeometry(0.8, 0.05, 0.5), mats.metal); chasis.position.y = 0.4; carro.add(chasis);
    var ruedas = [];
    [[-0.32, -0.22], [0.32, -0.22], [-0.32, 0.22], [0.32, 0.22]].forEach(function (p) {
      var pata = new T.Mesh(new T.BoxGeometry(0.04, 0.3, 0.04), mats.metal); pata.position.set(p[0], 0.25, p[1]); carro.add(pata);
      var r = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.05, 14), mats.negro); r.rotation.x = Math.PI / 2; r.position.set(p[0], 0.08, p[1]); carro.add(r); ruedas.push(r);
    });
    carro.add(M.sombra(0.7));
    var adentro = [];
    var carrito = {
      grupo: carro,
      // Lugar (en el mundo) para la próxima cosa que entra; meter(obj) la deja adentro (hija del carrito).
      proximo: function () { var i = adentro.length, v = new T.Vector3(-0.28 + (i % 3) * 0.28, 1.05 + Math.floor(i / 3) * 0.12, (i % 2 ? -0.08 : 0.08)); return carro.localToWorld(v); },
      meter: function (obj) { carro.attach(obj); adentro.push(obj); },
      vaciar: function () { adentro.forEach(function (o) { if (o.parent) o.parent.remove(o); }); adentro = []; },
      cuantos: function () { return adentro.length; },
      rodar: function (x, z, fin) {
        var x0 = carro.position.x, z0 = carro.position.z; if (root.ING_VOZ) ING_VOZ.sfx('rueda');
        M.tween(800, function (k) { carro.position.x = x0 + (x - x0) * k; carro.position.z = z0 + (z - z0) * k; ruedas.forEach(function (r) { r.rotation.y = k * 12; }); }, fin, 'entraSale');
      }
    };

    /* ---------- caja registradora ---------- */
    var caja = new T.Group(); g.add(caja);
    var mostrador = new T.Mesh(new T.BoxGeometry(1.5, 0.85, 0.8), mats.caja); mostrador.position.y = 0.425; caja.add(mostrador); M.contorno(mostrador, 0.02);
    var tapa = new T.Mesh(new T.BoxGeometry(1.6, 0.08, 0.9), mats.tapa); tapa.position.y = 0.89; caja.add(tapa);
    var maquina = new T.Mesh(new T.BoxGeometry(0.6, 0.42, 0.5), mats.lateral); maquina.position.set(0.4, 1.14, -0.1); caja.add(maquina); M.contorno(maquina, 0.03);
    var cvPant = document.createElement('canvas'); cvPant.width = 256; cvPant.height = 128; var texPant = new T.CanvasTexture(cvPant);
    var pant = new T.Mesh(new T.PlaneGeometry(0.62, 0.31), new T.MeshBasicMaterial({ map: texPant })); pant.position.set(0.4, 1.55, 0.0); pant.rotation.x = -0.2; caja.add(pant);
    var soporte = new T.Mesh(new T.BoxGeometry(0.08, 0.2, 0.08), mats.negro); soporte.position.set(0.4, 1.38, -0.05); caja.add(soporte);
    var cajon = new T.Mesh(new T.BoxGeometry(0.5, 0.1, 0.12), mats.franja); cajon.position.set(0.4, 0.98, 0.18); caja.add(cajon);
    caja.add(M.sombra(1));
    function pantalla(texto) {
      var c = cvPant.getContext('2d'); c.fillStyle = '#183a2a'; c.fillRect(0, 0, 256, 128);
      c.fillStyle = '#7dffb2'; c.font = 'bold 72px Fredoka, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(texto, 128, 68);
      texPant.needsUpdate = true;
    }
    pantalla('');

    /* ---------- lugares según la pantalla ---------- */
    var L = {};
    function acomodar() {
      var v = M.vertical();
      if (v) {
        gondola.position.set(-0.25, 0, -2.3); armarGondola(Math.min(1.1, M.anchoVisible(-2.3) * 0.36));
        L.pip = [-0.95, 3.0]; L.carro = [0.45, 3.1]; L.caja = [1.5, 1.0]; L.carroCaja = [0.2, 2.0]; caja.scale.setScalar(0.8); carro.scale.setScalar(0.8); L.escalaPip = 0.72;
      } else {
        gondola.position.set(0.5, 0, -1.7); armarGondola(Math.min(1.5, M.anchoVisible(-1.7) * 0.3));
        L.pip = [-1.9, 1.1]; L.carro = [-0.4, 1.5]; carro.scale.setScalar(1); L.escalaPip = 1; L.caja = [2.55, 0.9]; L.carroCaja = [1.35, 1.0]; caja.scale.setScalar(1);
      }
      caja.position.set(L.caja[0], 0, L.caja[1]); caja.rotation.y = v ? -0.75 : -0.35;
    }
    acomodar(); root.addEventListener('resize', acomodar);
    function aplicarTema() {
      var osc = M.oscuro();
      mats.pared.color.set(osc ? '#2f6b62' : '#a8e6d4'); mats.bordePiso.color.set(osc ? '#3c5f80' : '#6aa8d0'); mats.estante.color.set(osc ? '#d9d2c3' : '#f7f3ea');
      mats.lateral.color.set(osc ? '#d9694a' : '#ff8a65'); mats.caja.color.set(osc ? '#2f7fc4' : '#4dabf7');
      pintarPiso(osc);
    }
    aplicarTema();
    if (root.MutationObserver) new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    S.grupo = g; S.carrito = carrito; S.caja = { grupo: caja, pantalla: pantalla, cajon: function () { return cajon.getWorldPosition(new T.Vector3()); } };
    S.mostrar = function (on) { g.visible = on; M.cuarto.visible = !on; if (on) { acomodar(); carro.position.set(L.carro[0], 0, L.carro[1]); carro.rotation.y = 0; carrito.vaciar(); pantalla(''); } };
    S.huecos = function () { return huecos.map(function (h) { return gondola.localToWorld(h.clone()); }); };
    S.lugarPip = function () { return L.pip.slice(); };
    S.escalaPip = function () { return L.escalaPip; };      // en vertical la mascota se achica para no tapar la góndola
    S.lugarCarroCaja = function () { return L.carroCaja.slice(); };
    // Dónde se para la profe (detrás del mostrador, de cajera): la percha sube para que se vea por encima.
    S.lugarProfe = function () { var v = caja.localToWorld(new T.Vector3(-0.3, 0, -0.75)); return { x: v.x, y: 0.42, z: v.z, giro: caja.rotation.y, escala: caja.scale.x * 0.95 }; };
    // n lugares para las monedas: filas de a 5 adelante de todo (grandes y cerca, para tocarlas fácil).
    S.bandeja = function (n) {
      var v = M.vertical(), out = [], x0 = v ? 0 : 0.4, paso = v ? 0.42 : 0.48, y0 = v ? 1.2 : 0.3, z0 = v ? 2.2 : 2.2;
      for (var i = 0; i < n; i++) { var fila = Math.floor(i / 5), enFila = Math.min(5, n - fila * 5), col = i % 5;
        out.push(new T.Vector3(x0 + (col - (enFila - 1) / 2) * paso, y0 + fila * 0.42, z0 - fila * 0.1)); }
      return out;
    };
    return S;
  }
  root.ING_SUPER3D = { VERSION: '1.0.0', crear: crear };
})(window);
