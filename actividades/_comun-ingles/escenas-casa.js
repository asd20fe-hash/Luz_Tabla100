/* Inglés — más lugares de la casa (three.js r128): baño, dormitorio y patio. window.ING_LUGARES. Versión 1.0.0 (2026-10-15).
   crear(M) → { bano, dormitorio, patio }. Cada uno tiene grupo y mostrar(on) (esconde la habitación de siempre, M.cuarto).
   - bano: bañera donde la mascota se baña (en el lugar donde queda cuando se acerca a la cámara), patito, canilla.
     zonaBurbujas() → {x, y, z, ancho} para soltar burbujas.
   - dormitorio: cama, mesa de luz con lámpara (lampara, prender(on)), caja de juguetes (posCaja()), ventana.
     acostar(pip) / levantar(pip) ponen a la mascota en la cama o la sacan.
   - patio: pasto, cerca, árbol y un arco. futbol({alPatear, alTerminar}) arma la pelota: se arrastra desde la pelota hacia
     abajo (como una gomera) y aparece una flecha con la dirección y la fuerza; al soltar, patea. alTerminar(resultado)
     con 'gol', 'palo', 'afuera' o 'corto'. Devuelve {parar(), pelota}. */
(function (root) {
  'use strict';
  function crear(M) {
    var T = M.T, O = root.ING_OBJ3D, L = {};
    function mostrarCon(g) { return function (on) { g.visible = on; M.cuarto.visible = !on; }; }
    function caja(w, h, d, color, x, y, z, padre, borde) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), typeof color === 'string' ? M.toon(color) : color); m.position.set(x, y, z); padre.add(m); if (borde !== false) M.contorno(m, borde || 0.02); return m;
    }
    function bola(r, color, x, y, z, padre, borde) {
      var m = new T.Mesh(new T.SphereGeometry(r, 18, 14), typeof color === 'string' ? M.toon(color) : color); m.position.set(x, y, z); padre.add(m); if (borde) M.contorno(m, borde); return m;
    }

    /* ================= baño ================= */
    (function () {
      var tex = M.texPiso('#ffffff', '#bfe6ff', 6), s = M.sala({ piso: '#ffffff', bordePiso: '#6aa8d0', pared: '#a8dcf0', texPiso: tex }), g = s.grupo;
      // azulejos en la pared: una franja de cuadraditos
      var franja = new T.Mesh(new T.CylinderGeometry(4.45, 4.45, 0.3, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), M.toon('#ffffff')); franja.material.side = T.DoubleSide; franja.position.y = 1.4; g.add(franja);
      // bañera ovalada, abierta arriba, en (0, 0.9)
      var tina = new T.Group(); tina.position.set(0, 0, 0.9); g.add(tina);
      var matTina = M.toon('#ffffff'); matTina.side = T.DoubleSide;
      var pared = new T.Mesh(new T.CylinderGeometry(1, 0.92, 0.62, 40, 1, true), matTina); pared.scale.set(1.25, 1, 0.9); pared.position.y = 0.36; tina.add(pared);
      var borde = new T.Mesh(new T.TorusGeometry(1, 0.07, 10, 40), M.toon('#f1f3f8')); borde.rotation.x = Math.PI / 2; borde.scale.set(1.25, 0.9, 1); borde.position.y = 0.67; tina.add(borde); M.contorno(borde, 0.04);
      var agua = new T.Mesh(new T.CircleGeometry(0.98, 40), M.toon('#7fd3ff', { transparente: true, opacidad: 0.75 })); agua.rotation.x = -Math.PI / 2; agua.scale.set(1.25, 0.9, 1); agua.position.y = 0.52; tina.add(agua);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { bola(0.09, '#ffcf3f', p[0] * 0.95, 0.06, p[1] * 0.55, tina, 0.08); });
      for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI * 2; bola(0.1 + (i % 3) * 0.03, '#ffffff', Math.cos(a) * 1.1, 0.62, Math.sin(a) * 0.78, tina); }
      tina.add(M.sombra(1.4));
      // canilla y patito
      var canilla = new T.Group(); canilla.position.set(0, 0, -0.05); tina.add(canilla);
      var cano = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.5, 10), M.toon('#b8c2d1')); cano.position.set(0, 0.85, 0); canilla.add(cano);
      var pico = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.3, 10), M.toon('#b8c2d1')); pico.rotation.x = Math.PI / 2; pico.position.set(0, 1.08, 0.13); canilla.add(pico);
      var pato = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji('🦆'), transparent: true })); pato.scale.setScalar(0.45); pato.position.set(0.85, 0.75, 0.45); tina.add(pato); pato.raycast = function () {};
      var tPato = 0; M.cuadro(function (dt) { if (!g.visible) return; tPato += dt; pato.position.y = 0.75 + Math.sin(tPato * 2) * 0.03; pato.material.rotation = Math.sin(tPato * 1.4) * 0.12; });
      // toallero y espejo
      caja(1.0, 0.06, 0.06, '#c98f52', -2.4, 1.6, -3.4, g); caja(0.5, 0.8, 0.04, '#ff9ec7', -2.4, 1.2, -3.36, g, 0.03);
      var espejo = new T.Mesh(new T.CircleGeometry(0.55, 32), new T.MeshBasicMaterial({ color: 0xdff6ff })); espejo.position.set(1.8, 2.2, -3.9); espejo.rotation.y = -0.4; g.add(espejo);
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#2f6f8a' : '#a8dcf0'); tex.pintar(osc ? '#6f8fa8' : '#ffffff', osc ? '#4a6a85' : '#9fd4f2'); });
      L.bano = { grupo: g, mostrar: mostrarCon(g), zonaBurbujas: function () { return { x: 0, y: 0.75, z: 1.0, ancho: 1.2 }; } };
    })();

    /* ================= dormitorio ================= */
    (function () {
      var tex = M.texPiso('#d9a46a', '#c99358', 8, true), s = M.sala({ piso: '#ffffff', bordePiso: '#8a5a32', pared: '#7b6cc4', texPiso: tex }), g = s.grupo;
      // estrellitas pegadas en la pared
      for (var i = 0; i < 12; i++) {
        var a = Math.PI * 0.66 + i * Math.PI * 0.68 / 12, e = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji(i % 3 ? '⭐' : '🌙'), transparent: true }));
        e.scale.setScalar(0.25 + (i % 2) * 0.1); e.position.set(Math.sin(a) * 4.3, 2.4 + (i % 3) * 0.45, Math.cos(a) * 4.3); e.raycast = function () {}; g.add(e);
      }
      // ventana (de noche o de día)
      var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; var tx = new T.CanvasTexture(cv);
      var vent = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ map: tx })); vent.position.set(-1.0, 2.1, -4.3); vent.rotation.y = 0.2; g.add(vent);
      [[0, 0.58, 1.25, 0.08], [0, -0.58, 1.25, 0.08], [-0.6, 0, 0.08, 1.2], [0.6, 0, 0.08, 1.2], [0, 0, 0.05, 1.1]].forEach(function (m) { caja(m[2], m[3], 0.06, '#ffffff', m[0], m[1], 0.03, vent, false); });
      function pintarVentana() {
        var c = cv.getContext('2d'), n = M.noche(), gr = c.createLinearGradient(0, 0, 0, 128);
        gr.addColorStop(0, n ? '#0b1240' : '#5ec8ff'); gr.addColorStop(1, n ? '#3a2a7a' : '#c9f0ff'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
        c.fillStyle = n ? '#fff6c8' : '#ffd84a'; c.beginPath(); c.arc(90, 36, 18, 0, 7); c.fill();
        if (n) { c.fillStyle = '#fff'; for (var k = 0; k < 18; k++) c.fillRect((k * 37) % 128, (k * 53) % 100, 2, 2); }
        tx.needsUpdate = true;
      }
      // cama
      var cama = new T.Group(); cama.position.set(1.45, 0, -1.5); cama.rotation.y = -0.35; g.add(cama);
      caja(1.5, 0.35, 2.3, '#c98f52', 0, 0.2, 0, cama);
      caja(1.6, 1.1, 0.12, '#a86f3c', 0, 0.55, -1.15, cama);
      caja(1.4, 0.2, 2.15, '#ffffff', 0, 0.47, 0, cama, 0.015);
      var almohada = bola(0.3, '#ffffff', 0, 0.64, -0.82, cama, 0.04); almohada.scale.set(1.8, 0.55, 0.9);
      var manta = caja(1.46, 0.12, 1.3, '#ff8fb8', 0, 0.62, 0.42, cama, 0.015);
      for (var j = 0; j < 4; j++) bola(0.08, '#fff3a8', -0.5 + j * 0.33, 0.07, -0.2 + (j % 2) * 0.35, manta);
      cama.add(M.sombra(1.4));
      // mesa de luz y lámpara
      var mesa = new T.Group(); mesa.position.set(2.85, 0, -2.45); mesa.rotation.y = -0.35; g.add(mesa);
      caja(0.6, 0.6, 0.5, '#e2a05b', 0, 0.3, 0, mesa);
      var lamp = new T.Group(); lamp.position.set(0, 0.6, 0); mesa.add(lamp);
      var pie = new T.Mesh(new T.CylinderGeometry(0.03, 0.12, 0.45, 12), M.toon('#5b4b9a')); pie.position.y = 0.22; lamp.add(pie);
      var matPantalla = M.toon('#ffe066', { emisivo: '#7a6200' });
      var pantalla = new T.Mesh(new T.CylinderGeometry(0.14, 0.28, 0.3, 20, 1, true), matPantalla); pantalla.material.side = T.DoubleSide; pantalla.position.y = 0.55; lamp.add(pantalla); M.contorno(pantalla, 0.05);
      var zona = new T.Mesh(new T.SphereGeometry(0.45, 8, 6), new T.MeshBasicMaterial({ visible: false })); zona.position.y = 0.4; lamp.add(zona);
      var luz = new T.Sprite(new T.SpriteMaterial({ map: M.texBrillo, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color('#ffe9a0') }));
      luz.scale.setScalar(1.6); luz.position.y = 0.5; luz.raycast = function () {}; lamp.add(luz);
      function prender(on) { luz.visible = on; matPantalla.emissive.set(on ? '#7a6200' : '#000000'); matPantalla.color.set(on ? '#ffe066' : '#b9a24a'); }
      // caja de juguetes
      var cj = new T.Group(); cj.position.set(-2.0, 0, 0.5); cj.rotation.y = 0.4; g.add(cj);
      caja(0.9, 0.55, 0.65, '#4dabf7', 0, 0.28, 0, cj); caja(0.95, 0.06, 0.7, '#ffd43b', 0, 0.58, -0.32, cj).rotation.x = -1.1;
      var cartel = O.etiqueta(M, '🧸 TOYS', { fondo: '#ffffff', alto: 0.22 }); cartel.position.set(0, 0.32, 0.36); cj.add(cartel);
      cj.add(M.sombra(0.7));
      var alf = new T.Mesh(new T.CircleGeometry(1.5, 40), M.toon('#9be3c5')); alf.rotation.x = -Math.PI / 2; alf.position.set(-0.3, 0.008, 0.9); g.add(alf);
      M.alTema(function (osc) { s.mats.pared.color.set(osc ? '#3d3478' : '#7b6cc4'); tex.pintar(osc ? '#9a7048' : '#d9a46a', osc ? '#8a6038' : '#c99358'); pintarVentana(); });
      var tmp = new T.Vector3();
      L.dormitorio = {
        grupo: g, lampara: lamp, prender: prender, mostrar: function (on) { mostrarCon(g)(on); if (on) { pintarVentana(); prender(true); } },
        posCaja: function () { return cj.localToWorld(new T.Vector3(0, 0.7, 0)); },
        // Acostada boca arriba con la cabeza en la almohada.
        acostar: function (pip) {
          var r = pip.grupo; cama.localToWorld(tmp.set(0, 0, 0.55));
          r.rotation.order = 'YXZ'; r.rotation.set(-1.25, cama.rotation.y, 0); r.position.set(tmp.x, 0.78, tmp.z);
          manta.position.set(0, 0.86, 0.55); manta.scale.set(1, 1, 0.85);
        },
        levantar: function (pip) { var r = pip.grupo; r.rotation.set(0, 0, 0); r.position.y = 0; manta.position.set(0, 0.62, 0.42); manta.scale.set(1, 1, 1); },
        posCama: function () { return cama.localToWorld(new T.Vector3(-0.95, 0, 0.9)); }
      };
    })();

    /* ================= patio ================= */
    (function () {
      var tex = M.texPiso('#7ccf5c', '#6cbf4c', 7, true), s = M.sala({ piso: '#ffffff', bordePiso: '#a0703c', sinPared: true, texPiso: tex }), g = s.grupo;
      // cerca blanca al fondo
      var matCerca = M.toon('#ffffff');
      for (var i = 0; i <= 26; i++) {
        var a = Math.PI * 0.62 + i * Math.PI * 0.76 / 26;          // misma curva que las paredes (x = r·sen, z = r·cos)
        var tabla = new T.Mesh(new T.BoxGeometry(0.16, 0.8, 0.05), matCerca); tabla.position.set(Math.sin(a) * 4.25, 0.4, Math.cos(a) * 4.25); tabla.lookAt(0, 0.4, 0); g.add(tabla); M.contorno(tabla, 0.04);
      }
      [0.25, 0.6].forEach(function (y) { var riel = new T.Mesh(new T.CylinderGeometry(4.2, 4.2, 0.07, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), matCerca); riel.material.side = T.DoubleSide; riel.position.y = y; g.add(riel); });
      // árbol y arbustos
      var arbol = new T.Group(); arbol.position.set(-3.0, 0, -1.9); g.add(arbol);
      var tronco = new T.Mesh(new T.CylinderGeometry(0.15, 0.22, 1.4, 10), M.toon('#8a5a32')); tronco.position.y = 0.7; arbol.add(tronco); M.contorno(tronco, 0.05);
      [[0, 1.8, 0, 0.7], [-0.45, 1.5, 0.1, 0.5], [0.45, 1.55, -0.1, 0.5], [0, 2.3, 0, 0.45]].forEach(function (h) { bola(h[3], '#3fb35a', h[0], h[1], h[2], arbol, 0.04); });
      arbol.add(M.sombra(1));
      [[3.0, -1.6], [2.4, -2.6], [-2.2, -2.9]].forEach(function (p) { bola(0.38, '#4fbf6a', p[0], 0.3, p[1], g, 0.05); });
      [[2.8, 0.6], [-3.3, 0.4], [1.9, -3.2], [-1.5, 1.5]].forEach(function (p) { var f = new T.Sprite(new T.SpriteMaterial({ map: M.texEmoji('🌼'), transparent: true })); f.scale.setScalar(0.3); f.position.set(p[0], 0.18, p[1]); f.raycast = function () {}; g.add(f); });
      // arco
      var A = { z: -2.6, mitad: 1.6, alto: 1.6, palo: 0.07 }, arco = new T.Group(); arco.position.z = A.z; g.add(arco);
      var matPalo = M.toon('#ffffff');
      [-1, 1].forEach(function (s2) { var p = new T.Mesh(new T.CylinderGeometry(A.palo, A.palo, A.alto, 12), matPalo); p.position.set(s2 * A.mitad, A.alto / 2, 0); arco.add(p); M.contorno(p, 0.08); });
      var trav = new T.Mesh(new T.CylinderGeometry(A.palo, A.palo, A.mitad * 2 + A.palo * 2, 12), matPalo); trav.rotation.z = Math.PI / 2; trav.position.y = A.alto; arco.add(trav); M.contorno(trav, 0.08);
      var cvRed = document.createElement('canvas'); cvRed.width = cvRed.height = 64; var cr = cvRed.getContext('2d'); cr.strokeStyle = 'rgba(255,255,255,.9)'; cr.lineWidth = 3;
      for (var k = 0; k <= 64; k += 16) { cr.beginPath(); cr.moveTo(k, 0); cr.lineTo(k, 64); cr.stroke(); cr.beginPath(); cr.moveTo(0, k); cr.lineTo(64, k); cr.stroke(); }
      var texRed = new T.CanvasTexture(cvRed); texRed.wrapS = texRed.wrapT = T.RepeatWrapping; texRed.repeat.set(8, 4);
      var matRed = new T.MeshBasicMaterial({ map: texRed, transparent: true, side: T.DoubleSide, depthWrite: false });
      var red = new T.Group(); arco.add(red);
      var fondoRed = new T.Mesh(new T.PlaneGeometry(A.mitad * 2, A.alto), matRed); fondoRed.position.set(0, A.alto / 2, -0.7); red.add(fondoRed);
      var techo = new T.Mesh(new T.PlaneGeometry(A.mitad * 2, 0.7), matRed); techo.rotation.x = Math.PI / 2; techo.position.set(0, A.alto, -0.35); red.add(techo);
      [-1, 1].forEach(function (s2) { var lado = new T.Mesh(new T.PlaneGeometry(0.7, A.alto), matRed); lado.rotation.y = Math.PI / 2; lado.position.set(s2 * A.mitad, A.alto / 2, -0.35); red.add(lado); });
      M.alTema(function (osc) { tex.pintar(osc ? '#4f9a3c' : '#7ccf5c', osc ? '#438a32' : '#6cbf4c'); });

      function futbol(cb) {
        cb = cb || {};
        var pel = O.pelota(M, 0.22), bolaM = pel.userData.bola, r = pel.userData.r, sombra = pel.userData.sombra;
        var flecha = O.flecha(M); flecha.visible = false; g.add(flecha); g.add(pel);
        var v = new T.Vector3(), estado = 'quieta', res = null, tVuelo = 0, apunta = null, vivo = true;
        function inicio() { return new T.Vector3(0, 0, M.vertical() ? 1.2 : 1.5); }
        function ponerla() {
          pel.position.copy(inicio()); v.set(0, 0, 0); estado = 'quieta'; res = null; bolaM.rotation.set(0, 0, 0); sombra.position.y = 0.012;
          pel.scale.setScalar(0.01); M.tween(350, function (k) { pel.scale.setScalar(Math.max(0.01, k)); }, null, 'rebote');
        }
        ponerla();
        var lado = function () { return Math.min(innerWidth, innerHeight) * 0.22; };
        M.arrastrable(pel, {
          inicio: function (e) { if (!vivo || estado !== 'quieta' || !e) return; apunta = { k: 0 }; },
          mover: function (p, e) {
            if (!apunta || !e) return;
            var b = M.aPantalla(pel.position.clone().setY(r)), dx = e.clientX - b.x, dy = e.clientY - b.y, len = Math.hypot(dx, dy);
            if (dy < 8 || len < 14) { flecha.visible = false; apunta.k = 0; return; }        // hay que tirar hacia abajo
            var k = Math.min(1, len / lado()), x = -dx / len, z = -dy / len;
            apunta = { k: k, x: x, z: z };
            flecha.visible = true; flecha.position.set(pel.position.x, 0.03, pel.position.z); flecha.rotation.y = Math.atan2(-x, -z);
            flecha.userData.largo(0.4 + 1.8 * k); flecha.userData.color(k < 0.45 ? '#40c057' : (k < 0.8 ? '#fab005' : '#fa5252'));
            pel.scale.set(1 + 0.12 * k, 1 - 0.12 * k, 1 + 0.12 * k);
          },
          soltar: function () {
            flecha.visible = false; pel.scale.setScalar(1);
            var a = apunta; apunta = null;
            if (!a || !a.k || a.k < 0.08 || estado !== 'quieta') return;
            var vel = 5 + 9 * a.k; v.set(a.x * vel, 1.0 + 2.8 * a.k, a.z * vel); estado = 'vuela'; tVuelo = 0;
            if (root.ING_VOZ) ING_VOZ.sfx('patada');
            if (cb.alPatear) cb.alPatear(a.k);
          },
          tap: function () { if (cb.alTocar) cb.alTocar(); }
        });
        function terminar(r2) { estado = 'fin'; if (cb.alTerminar) cb.alTerminar(r2); M.esperar(900, function () { if (vivo) ponerla(); }); }
        var sacudir = 0;
        var quitar = M.cuadro(function (dt) {
          if (sacudir > 0) { sacudir -= dt; red.position.z = -Math.sin(sacudir * 30) * 0.08 * sacudir; }
          if (!vivo || estado !== 'vuela') return;
          tVuelo += dt;
          for (var n = 0; n < 2; n++) {
            var h = dt / 2, z0 = pel.position.z;
            v.y -= 9.8 * h; pel.position.addScaledVector(v, h);
            if (pel.position.y < 0) { pel.position.y = 0; if (v.y < -0.8) { v.y = -v.y * 0.45; if (root.ING_VOZ) ING_VOZ.sfx('pique'); } else v.y = 0; v.x *= 0.82; v.z *= 0.82; }
            if (pel.position.y === 0) { v.x *= 1 - 1.4 * h; v.z *= 1 - 1.4 * h; }
            var x = pel.position.x, y = pel.position.y;
            // palos y travesaño
            if (z0 > A.z && pel.position.z <= A.z + r) {
              var dPalo = Math.abs(Math.abs(x) - A.mitad), dTrav = Math.abs(y + r - A.alto);
              if ((dPalo < r + A.palo && y < A.alto) || (dTrav < r && Math.abs(x) < A.mitad)) {
                v.z = Math.abs(v.z) * 0.5; pel.position.z = A.z + r + 0.02; if (dTrav < r) v.y = -Math.abs(v.y) * 0.3; else v.x += (x > 0 ? 1 : -1) * (Math.abs(x) > A.mitad ? 1 : -1) * 0.8;
                if (!res) res = 'palo'; if (root.ING_VOZ) ING_VOZ.sfx('palo'); continue;
              }
            }
            // ¿cruzó la línea?
            if (z0 > A.z && pel.position.z <= A.z && !res) {
              if (Math.abs(x) < A.mitad - r * 0.5 && y + r < A.alto + 0.05) { res = 'gol'; sacudir = 0.6; if (cb.alGol) cb.alGol(); } else res = 'afuera';
            }
            // la red frena la pelota
            if (res === 'gol' && pel.position.z < A.z - 0.6) { pel.position.z = A.z - 0.6; v.z = Math.abs(v.z) * 0.1; v.x *= 0.3; v.y *= 0.5; pel.position.x = Math.max(-A.mitad + r, Math.min(A.mitad - r, pel.position.x)); }
          }
          bolaM.rotation.x -= v.z * dt / r; bolaM.rotation.z += v.x * dt / r;
          sombra.position.y = 0.012 - pel.position.y; sombra.scale.setScalar(Math.max(0.4, 1 - pel.position.y * 0.3));
          var lejos = Math.hypot(pel.position.x, pel.position.z) > 4.3, quieta = Math.hypot(v.x, v.z) < 0.25 && pel.position.y === 0;
          if (lejos || quieta || tVuelo > 4) terminar(res || (pel.position.z > A.z ? 'corto' : 'afuera'));
          if (lejos) M.tween(250, function (k) { pel.scale.setScalar(Math.max(0.01, 1 - k)); });
        });
        return { pelota: pel, parar: function () { vivo = false; quitar(); M.limpiar([pel, flecha]); }, estado: function () { return estado; },
          patear: function (k, x) { if (estado !== 'quieta') return; var len = Math.hypot(x || 0, 1); v.set((x || 0) / len * (5 + 9 * k), 1.0 + 2.8 * k, -1 / len * (5 + 9 * k)); estado = 'vuela'; tVuelo = 0; } };
      }
      L.patio = { grupo: g, mostrar: mostrarCon(g), futbol: futbol, arco: A };
    })();
    return L;
  }
  root.ING_LUGARES = { VERSION: '1.0.0', crear: crear };
})(window);
