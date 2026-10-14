/* ¿Qué son las fracciones equivalentes? (fracciones de 4to) — teoría con dibujos que se tocan.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-14) Primera versión
     + Cinco pantallas: "La misma cantidad, otros cortes" (cortar cada parte en 2, 3 o 4, en barra o en pizza),
       "¿Llegan al mismo lugar?" (dos tiras: pintás la de abajo), "El truco" (por el mismo número arriba y abajo,
       y por qué sumar o multiplicar solo arriba no sirve), "Al revés: juntar partes" (simplificar) y "¡Probá vos!" (4 desafíos).
     + Las líneas gruesas son los cortes de antes y las finas los nuevos; una línea punteada marca hasta dónde llega lo pintado.
     + 🔊 lee cada pantalla. Al terminar los desafíos hay fuegos artificiales y un botón para ir al Muro de fracciones.
     + Guarda las pantallas vistas y el resultado de los desafíos en mate.<perfil>.4to-fracciones-equivalentes.progreso.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '4to-fracciones-equivalentes';
  var UI = REF4_UI, FRUI = REF4_FRUI, FR = REF4_FR, cf = FRUI.conFracciones, F = FRUI.fraccionHTML, fr = FR.fr;
  var ctx = UI.base({ act: ACT, version: VERSION, titulo: '¿Qué son las fracciones equivalentes?' });
  if (!ctx) return;
  var app = document.getElementById('app'), $ = function (s) { return app.querySelector(s); };
  var t = function (f) { return f.n + '/' + f.d; }, val = function (f) { return f.n / f.d; };
  var igual = function (a, b) { return a.n * b.d === b.n * a.d; };

  var prog = ctx.store.get('progreso', { vistas: [], desafios: null });
  function guardar() { prog.fecha = Date.now(); try { ctx.store.set('progreso', prog); } catch (e) { /* sin espacio */ } }

  /* ==================== dibujos ==================== */
  // Una tira en y: d partes por entero, pintada hasta v (puede caer en medio de una parte). base: denominador de los cortes gruesos.
  function tiraG(x0, y, W, A, d, v, op) {
    var en = op.enteros || 1, u = W / en, h = '';
    for (var e = 0; e < en; e++) h += '<rect x="' + (x0 + e * u) + '" y="' + y + '" width="' + u + '" height="' + A + '" class="eq-fondo"/>';
    if (v > 0) h += '<rect x="' + x0 + '" y="' + y + '" width="' + (Math.min(v, en) * u) + '" height="' + A + '" class="' + (op.color || 'eq-pint') + '"/>';
    for (e = 0; e < en; e++) for (var i = 1; i < d; i++) {
      var x = x0 + e * u + u * i / d, gr = op.base && (i * op.base) % d === 0;
      h += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + A) + '" class="eq-corte' + (gr ? ' grueso' : (op.nuevo ? ' nuevo' : '')) + '"/>';
    }
    for (e = 0; e < en; e++) h += '<rect x="' + (x0 + e * u) + '" y="' + y + '" width="' + u + '" height="' + A + '" class="eq-borde"/>';
    if (op.toca) for (i = 0; i < d; i++) h += '<rect x="' + (x0 + u * i / d) + '" y="' + y + '" width="' + (u / d) + '" height="' + A + '" class="eq-toca" data-t="' + op.toca + '" data-i="' + i + '"><title>parte ' + (i + 1) + '</title></rect>';
    return h;
  }
  // Varias tiras una abajo de la otra, con la fracción a la izquierda y la línea punteada hasta donde llega guia.
  // filas: [{f, d (partes), base, color, toca}]
  function tiras(filas, op) {
    op = op || {};
    var M = 60, W = 320, A = op.alto || 42, G = 24, H = filas.length * (A + G) - G, en = op.enteros || 1;
    var h = '<svg class="eq-svg" viewBox="-4 -14 ' + (M + W + 8) + ' ' + (H + 28) + '" role="img" aria-label="' + filas.map(function (r) { return FR.leer(r.f); }).join(' y ') + '">';
    filas.forEach(function (r, k) {
      var y = k * (A + G);
      h += r.sinNombre ? '<text x="' + (M / 2) + '" y="' + (y + A / 2 + 7) + '" text-anchor="middle" class="fr-ltxt" style="font-size:20px">?</text>' : r.f.d === 1 ? '<text x="' + (M / 2) + '" y="' + (y + A / 2 + 7) + '" text-anchor="middle" class="fr-ltxt" style="font-size:20px">' + r.f.n + '</text>' : FRUI.svgFrac(M / 2 - 4, y + A / 2, r.f.n, r.f.d, 18);
      h += tiraG(M, y, W, A, r.d || r.f.d, val(r.f), { base: r.base, color: r.color, toca: r.toca, enteros: en, nuevo: r.nuevo });
    });
    if (op.guia !== undefined && op.guia > 0) { var xg = M + W * Math.min(op.guia, en) / en; h += '<line x1="' + xg + '" y1="-12" x2="' + xg + '" y2="' + (H + 12) + '" class="eq-guia"/>'; }
    return h + '</svg>';
  }
  // Pizza: d porciones, pintada hasta v; cortes gruesos según base.
  function pizza(d, v, base, nuevo) {
    var c = 100, r = 90, h = '<svg class="eq-svg pizza" viewBox="0 0 200 200" role="img" aria-label="pizza en ' + d + ' porciones"><circle cx="100" cy="100" r="90" class="eq-fondo"/>';
    if (v >= 1) h += '<circle cx="100" cy="100" r="90" class="eq-pint"/>';
    else if (v > 0) { var a = -Math.PI / 2 + 2 * Math.PI * v; h += '<path d="M100 100 L100 10 A90 90 0 ' + (v > 0.5 ? 1 : 0) + ' 1 ' + (c + r * Math.cos(a)).toFixed(2) + ' ' + (c + r * Math.sin(a)).toFixed(2) + ' Z" class="eq-pint"/>'; }
    if (d > 1) for (var i = 0; i < d; i++) {
      var b = -Math.PI / 2 + 2 * Math.PI * i / d, gr = (i * base) % d === 0;
      h += '<line x1="100" y1="100" x2="' + (c + r * Math.cos(b)).toFixed(2) + '" y2="' + (c + r * Math.sin(b)).toFixed(2) + '" class="eq-corte' + (gr ? ' grueso' : (nuevo ? ' nuevo' : '')) + '"/>';
    }
    return h + '<circle cx="100" cy="100" r="90" class="eq-borde"/></svg>';
  }
  // 1/2 = 2/4 con "×2" arriba y abajo del igual.
  function ecu(a, b, op) {
    return '<div class="eq-ecu" aria-label="' + FR.leer(a) + ' es igual a ' + FR.leer(b) + '">' + F(a) +
      (op ? '<span class="eq-op"><small>' + op + '</small><span>=</span><small>' + op + '</small></span>' : '<span>=</span>') + F(b) + '</div>';
  }
  function chips(lista, actual, attr) {
    return lista.map(function (f) { return '<button class="ref-btn' + (igual(f, actual) && f.d === actual.d ? ' eq-sel' : '') + '" data-' + attr + '="' + t(f) + '" aria-label="' + FR.leer(f) + '">' + F(f) + '</button>'; }).join('');
  }
  var deTxt = function (s) { var p = s.split('/'); return fr(+p[0], +p[1]); };
  var veredicto = function (txt, tipo) { return '<div class="eq-veredicto' + (tipo ? ' ' + tipo : '') + '" role="status">' + cf(txt) + '</div>'; };

  /* ==================== pantallas ==================== */
  var E = {
    p1: { f: fr(1, 2), k: 1, forma: 'barra', vistos: [1] },
    p2: { a: fr(1, 2), b: fr(0, 4), hallados: [] },
    p3: { f: fr(2, 3), op: null },
    p4: { f: fr(6, 8), k: null },
    p5: { i: 0, intento: 0, ok1: 0, resuelto: false, mal: [] }
  };

  var PAGS = [
    { titulo: 'La misma cantidad, otros cortes',
      texto: function () { return 'Pintamos ' + t(E.p1.f) + ' del chocolate. Cortá cada parte en pedazos más chicos y mirá qué pasa con lo pintado.'; },
      pintar: function () {
        var s = E.p1, g = fr(s.f.n * s.k, s.f.d * s.k), h = '';
        h += '<div class="eq-ctrl"><span class="lbl">Fracción:</span>' + chips([fr(1, 2), fr(1, 3), fr(2, 3), fr(3, 4), fr(2, 5)], s.f, 'f') +
          '<button class="ref-btn" id="forma">' + (s.forma === 'barra' ? '🍕 Ver en pizza' : '🍫 Ver en barra') + '</button></div>';
        h += '<div class="eq-dibujo">' + (s.forma === 'barra' ? tiras([{ f: g, base: s.f.d, nuevo: true }], { alto: 70 }) : pizza(g.d, val(g), s.f.d, true)) + '</div>';
        h += '<div class="eq-ctrl"><span class="lbl">✂️ Cortar cada parte en:</span>' + [1, 2, 3, 4].map(function (k) { return '<button class="ref-btn' + (k === s.k ? ' eq-sel' : '') + '" data-k="' + k + '">' + k + '</button>'; }).join('') + '</div>';
        if (s.k === 1) h += veredicto('Ahora hay ' + s.f.d + ' partes y ' + s.f.n + ' ' + (s.f.n === 1 ? 'pintada' : 'pintadas') + '. Tocá 2, 3 o 4 para cortar cada parte.');
        else {
          h += ecu(s.f, g, '×' + s.k);
          h += veredicto('Lo pintado no cambió: es la misma cantidad. Pero ahora hay ' + g.d + ' partes (' + s.f.d + ' × ' + s.k + ') y ' + g.n + ' pintadas (' + s.f.n + ' × ' + s.k + ').', 'ok');
        }
        var cad = s.vistos.slice().sort().map(function (k) { return F(fr(s.f.n * k, s.f.d * k)); });
        if (cad.length > 1) h += '<p class="eq-texto">Todas estas valen lo mismo, son <b>fracciones equivalentes</b>:</p><div class="eq-cadena">' + cad.join(' = ') + '</div>';
        return h;
      },
      eventos: function () {
        var s = E.p1;
        app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { s.f = deTxt(b.dataset.f); s.k = 1; s.vistos = [1]; UI.sonar('tecla'); render(); }; });
        app.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { s.k = +b.dataset.k; if (s.vistos.indexOf(s.k) < 0) s.vistos.push(s.k); UI.sonar(s.k > 1 ? 'ok' : 'tecla'); render(); }; });
        $('#forma').onclick = function () { s.forma = s.forma === 'barra' ? 'pizza' : 'barra'; UI.sonar('tecla'); render(); };
      } },

    { titulo: '¿Llegan al mismo lugar?',
      texto: function () { return 'Dos fracciones son equivalentes si, en tiras del mismo largo, lo pintado llega justo al mismo lugar. Pintá la tira de abajo tocando las partes. Con − y + la cortás en más o menos partes.'; },
      pintar: function () {
        var s = E.p2, h = '';
        h += '<div class="eq-ctrl"><span class="lbl">Arriba:</span>' + chips([fr(1, 2), fr(1, 3), fr(2, 3), fr(3, 4), fr(1, 4)], s.a, 'a') + '</div>';
        h += '<div class="eq-dibujo">' + tiras([{ f: s.a }, { f: s.b, color: 'eq-pint2', toca: 'b' }], { guia: val(s.a) }) + '</div>';
        h += '<div class="eq-ctrl"><span class="eq-paso">Abajo: <button class="ref-btn" id="menos" aria-label="menos partes">−</button><b>' + s.b.d + ' partes</b><button class="ref-btn" id="mas" aria-label="más partes">+</button></span></div>';
        var a = s.a, b = s.b;
        if (b.n === 0) h += veredicto('Tocá las partes de la tira de abajo para pintarlas.');
        else if (igual(a, b) && a.d === b.d) h += veredicto('Es la misma fracción, escrita igual. Con − y + probá con otra cantidad de partes.', 'ok');
        else if (igual(a, b)) h += veredicto('¡Llegan justo al mismo lugar! ' + t(a) + ' y ' + t(b) + ' son equivalentes: valen lo mismo.', 'ok');
        else if ((a.n * b.d) % a.d !== 0) h += veredicto('No llegan al mismo lugar. Con ' + b.d + ' partes no hay forma de llegar justo a la línea: probá con otra cantidad.', 'mal');
        else h += veredicto('No llegan al mismo lugar: abajo hay ' + (val(b) > val(a) ? 'más' : 'menos') + ' pintado que arriba.', 'mal');
        if (s.hallados.length) h += '<p class="eq-texto">Encontraste:</p><div class="eq-cadena">' + s.hallados.map(function (x) { return F(s.a) + ' = ' + F(deTxt(x)); }).join(' &nbsp; · &nbsp; ') + '</div>';
        return h;
      },
      eventos: function () {
        var s = E.p2;
        function revisar() {
          if (s.b.n > 0 && igual(s.a, s.b) && s.a.d !== s.b.d && s.hallados.indexOf(t(s.b)) < 0) { s.hallados.push(t(s.b)); UI.sonar('ok'); UI.celebrar('¡Equivalentes!'); }
          render();
        }
        app.querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { s.a = deTxt(b.dataset.a); s.b = fr(0, s.b.d); s.hallados = []; UI.sonar('tecla'); render(); }; });
        app.querySelectorAll('[data-t="b"]').forEach(function (r) { r.addEventListener('click', function () { var i = +r.dataset.i; s.b = fr(s.b.n === i + 1 ? i : i + 1, s.b.d); UI.sonar('tecla'); revisar(); }); });
        $('#menos').onclick = function () { if (s.b.d > 1) { s.b = fr(Math.min(s.b.n, s.b.d - 1), s.b.d - 1); revisar(); } };
        $('#mas').onclick = function () { if (s.b.d < 12) { s.b = fr(s.b.n, s.b.d + 1); revisar(); } };
      } },

    { titulo: 'El truco: arriba y abajo por el mismo número',
      texto: function () { return 'Cortar cada parte en 3 es tener 3 veces más partes (el número de abajo) y 3 veces más pintadas (el de arriba). Probá cada botón y mirá si sigue valiendo lo mismo.'; },
      pintar: function () {
        var s = E.p3, f = s.f, h = '';
        var OPS = { x2: { txt: '× 2 arriba y abajo', g: fr(f.n * 2, f.d * 2), base: f.d }, x3: { txt: '× 3 arriba y abajo', g: fr(f.n * 3, f.d * 3), base: f.d },
          solo: { txt: '× 2 solo arriba', g: fr(f.n * 2, f.d) }, mas: { txt: '+ 1 arriba y abajo', g: fr(f.n + 1, f.d + 1) } };
        h += '<div class="eq-ctrl"><span class="lbl">Empezamos con:</span>' + chips([fr(1, 2), fr(2, 3), fr(3, 4), fr(2, 5)], f, 'f') + '</div>';
        h += '<div class="eq-ctrl">' + Object.keys(OPS).map(function (k) { return '<button class="ref-btn' + (s.op === k ? ' eq-sel' : '') + '" data-op="' + k + '">' + OPS[k].txt + '</button>'; }).join('') + '</div>';
        if (!s.op) { h += '<div class="eq-dibujo">' + tiras([{ f: f }], { guia: val(f) }) + '</div>' + veredicto('Elegí un botón.'); return h; }
        var o = OPS[s.op], g = o.g, en = Math.max(1, Math.ceil(val(g) - 1e-9));
        h += '<div class="eq-dibujo">' + tiras([{ f: f }, { f: g, base: o.base, color: 'eq-pint2', nuevo: true }], { guia: val(f), enteros: en }) + '</div>';
        h += ecu(f, g, s.op === 'x2' || s.op === 'x3' ? (s.op === 'x2' ? '×2' : '×3') : null).replace('<span>=</span>', igual(f, g) ? '<span>=</span>' : '<span>≠</span>');
        if (igual(f, g)) h += veredicto('✔ Sigue valiendo lo mismo: lo pintado llega a la misma línea. ' + t(f) + ' y ' + t(g) + ' son equivalentes.', 'ok');
        else if (s.op === 'solo') h += veredicto('✘ Así no: hay el doble de pintadas pero las partes siguen igual de grandes. ¡Se pasa de la línea!', 'mal');
        else h += veredicto('✘ Así no: sumar no corta cada parte en pedazos iguales. Lo pintado no llega a la misma línea.', 'mal');
        return h;
      },
      eventos: function () {
        var s = E.p3;
        app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { s.f = deTxt(b.dataset.f); s.op = null; UI.sonar('tecla'); render(); }; });
        app.querySelectorAll('[data-op]').forEach(function (b) { b.onclick = function () { s.op = b.dataset.op; UI.sonar(s.op === 'x2' || s.op === 'x3' ? 'ok' : 'mal'); render(); }; });
      } },

    { titulo: 'Al revés: juntar partes',
      texto: function () { return 'Si juntás las partes de a 2, quedan la mitad de partes y la mitad de pintadas: arriba y abajo dividido 2. Eso se llama simplificar. Probá juntar de a 2, de a 3 o de a 4.'; },
      pintar: function () {
        var s = E.p4, f = s.f, h = '';
        h += '<div class="eq-ctrl"><span class="lbl">Fracción:</span>' + chips([fr(4, 8), fr(6, 8), fr(2, 6), fr(6, 9), fr(3, 6)], f, 'f') + '</div>';
        h += '<div class="eq-ctrl"><span class="lbl">Juntar de a:</span>' + [2, 3, 4].map(function (k) { return '<button class="ref-btn' + (k === s.k ? ' eq-sel' : '') + '" data-k="' + k + '">' + k + '</button>'; }).join('') + '</div>';
        if (!s.k) { h += '<div class="eq-dibujo">' + tiras([{ f: f }], { guia: val(f) }) + '</div>' + veredicto('Elegí de a cuántas partes juntar.'); return h; }
        var k = s.k;
        if (f.d % k !== 0) {
          h += '<div class="eq-dibujo">' + tiras([{ f: f }], { guia: val(f) }) + '</div>';
          h += veredicto(f.d + ' partes no se pueden juntar de a ' + k + ' sin que sobre alguna. Probá con otro número.', 'mal');
          return h;
        }
        var D = f.d / k, nueva = { f: fr(f.n, f.d), d: D, base: D, color: 'eq-pint2', sinNombre: true };
        if (f.n % k !== 0) {
          h += '<div class="eq-dibujo">' + tiras([{ f: f }, nueva], { guia: val(f) }) + '</div>';
          h += veredicto('Mirá la tira de abajo: queda una parte a medio pintar. Así no se puede escribir con ' + D + ' partes. Probá con otro número.', 'mal');
          return h;
        }
        var g = fr(f.n / k, D);
        h += '<div class="eq-dibujo">' + tiras([{ f: f }, { f: g, base: D, color: 'eq-pint2' }], { guia: val(f) }) + '</div>';
        h += ecu(f, g, '÷' + k);
        h += veredicto('¡La misma cantidad con menos partes! ' + f.d + ' ÷ ' + k + ' = ' + D + ' partes y ' + f.n + ' ÷ ' + k + ' = ' + g.n + ' pintadas.', 'ok');
        return h;
      },
      eventos: function () {
        var s = E.p4;
        app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { s.f = deTxt(b.dataset.f); s.k = null; UI.sonar('tecla'); render(); }; });
        app.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () {
          s.k = +b.dataset.k; var ok = s.f.d % s.k === 0 && s.f.n % s.k === 0; UI.sonar(ok ? 'ok' : 'mal'); render(); }; });
      } },

    { titulo: '¡Probá vos!',
      texto: function () { return E.p5.i < DES.length ? 'Desafío ' + (E.p5.i + 1) + ' de ' + DES.length + '. ' + DES[E.p5.i].voz : 'Terminaste los desafíos.'; },
      pintar: function () {
        var s = E.p5, h = '';
        if (s.i >= DES.length) {
          h += '<div class="eq-titulo">¡Lo lograste! 🎉</div><p class="eq-texto" style="text-align:center">' + s.ok1 + ' de ' + DES.length + ' al primer intento.</p>';
          h += '<div class="eq-recuerda"><b>Para recordar:</b> dos fracciones son <b>equivalentes</b> si valen lo mismo. Se consiguen multiplicando (o dividiendo) <b>arriba y abajo por el mismo número</b>. Sumar no sirve.</div>';
          h += '<div class="ref-fila"><button class="ref-btn" id="otra">🔄 Hacer los desafíos otra vez</button><button class="ref-btn main" id="muro">🧱 Practicar en el Muro</button></div>';
          return h;
        }
        var d = DES[s.i];
        h += '<div class="fr-pasos">' + DES.map(function (_, i) { return '<span class="' + (i < s.i ? 'hecho' : (i === s.i ? 'on' : '')) + '">' + (i + 1) + '</span>'; }).join('') + '</div>';
        h += '<div class="fr-preg" style="text-align:center">' + d.preg + '</div>';
        if (!s.resuelto) h += '<div id="ops"></div>';
        if (s.resuelto || s.mal.length) h += '<div class="eq-dibujo">' + tiras(d.tiras.map(function (f, i) { return { f: f, color: i ? 'eq-pint2' : 'eq-pint' }; }), { guia: val(d.tiras[0]) }) + '</div>';
        if (s.resuelto) h += veredicto(d.bien, 'ok') + '<div class="ref-fila"><button class="ref-btn main" id="sig">' + (s.i + 1 < DES.length ? 'Siguiente desafío ▶' : 'Terminar ▶') + '</button></div>';
        return h;
      },
      eventos: function () {
        var s = E.p5;
        if (s.i >= DES.length) {
          $('#otra').onclick = function () { E.p5 = { i: 0, intento: 0, ok1: 0, resuelto: false, mal: [] }; UI.fuegos.parar(); render(); };
          $('#muro').onclick = function () { UI.fuegos.parar(); MATE.abrir('4to-fracciones-muro'); };
          return;
        }
        var d = DES[s.i];
        if (s.resuelto) { $('#sig').onclick = function () { s.i++; s.intento = 0; s.resuelto = false; s.mal = []; FRUI.globo(null); if (s.i >= DES.length) terminar(); render(); }; $('#sig').focus(); return; }
        FRUI.opciones($('#ops'), d.ops.map(function (o) { return { html: o.html, valor: o }; }), function (o, b) {
          s.intento++;
          if (o.ok) { if (s.intento === 1) s.ok1++; s.resuelto = true; UI.sonar('ok'); FRUI.globo(null); render(); return; }
          UI.sonar('mal'); b.classList.add('mal'); b.disabled = true; FRUI.globo(o.pista, 'mal');
          if (!s.mal.length) { s.mal.push(1); var dib = document.createElement('div'); dib.className = 'eq-dibujo'; dib.innerHTML = tiras(d.tiras.map(function (f, i) { return { f: f, color: i ? 'eq-pint2' : 'eq-pint' }; }), { guia: val(d.tiras[0]) }); $('#ops').after(dib); }
        });
      } }
  ];

  // Desafíos: opciones con su pista (voseo, sin retar) y las tiras que lo muestran.
  var hueco = function (n, d) { return '<span class="eq-ap"><span class="n">' + n + '</span><span class="d">' + d + '</span></span>'; };
  var Q = '<span class="eq-hueco">?</span>';
  var DES = [
    { voz: '¿1/2 es igual a cuántos sextos?', preg: '¿Qué número va en el casillero?<div class="eq-ecu">' + hueco(1, 2) + '<span>=</span>' + hueco(Q, 6) + '</div>',
      ops: [{ html: '1', pista: 'Si cortás cada mitad en 3, ¿cuántas partes quedan pintadas?' }, { html: '2', pista: 'Abajo pasó de 2 a 6: por 3. Arriba también va por 3.' },
        { html: '3', ok: true }, { html: '5', pista: 'No es sumar: abajo se multiplicó por 3. Arriba, 1 × 3.' }],
      tiras: [fr(1, 2), fr(3, 6)], bien: '¡Sí! 1/2 = 3/6: abajo por 3 y arriba por 3. Mirá: llegan al mismo lugar.' },
    { voz: '¿2/3 y 4/6 son equivalentes?', preg: '¿' + F(fr(2, 3)) + ' y ' + F(fr(4, 6)) + ' son equivalentes?',
      ops: [{ html: 'Sí', ok: true }, { html: 'No', pista: 'Probá multiplicar 2/3 arriba y abajo por 2. ¿Qué te da?' }],
      tiras: [fr(2, 3), fr(4, 6)], bien: '¡Sí! 2/3 = 4/6: arriba y abajo por 2.' },
    { voz: '¿3/4 y 3/8 son equivalentes?', preg: '¿' + F(fr(3, 4)) + ' y ' + F(fr(3, 8)) + ' son equivalentes?',
      ops: [{ html: 'Sí', pista: 'Tienen el mismo número arriba, pero los octavos son más chicos que los cuartos. Mirá las tiras.' }, { html: 'No', ok: true }],
      tiras: [fr(3, 4), fr(3, 8)], bien: '¡Bien! No son equivalentes: 3/8 es la mitad de 3/4. Solo cambió el de abajo.' },
    { voz: 'Tocá la fracción que vale lo mismo que 2/5.', preg: 'Tocá la que vale lo mismo que ' + F(fr(2, 5)) + '.',
      ops: [{ html: F(fr(4, 7)), pista: 'Ahí se sumó 2 arriba y abajo. Sumar no sirve: hay que multiplicar.' }, { html: F(fr(4, 10)), ok: true },
        { html: F(fr(2, 10)), pista: 'Ahí se multiplicó solo abajo: las partes se achican pero no se pintan más.' }, { html: F(fr(3, 6)), pista: '3/6 es justo la mitad, y 2/5 es menos que la mitad.' }],
      tiras: [fr(2, 5), fr(4, 10)], bien: '¡Exacto! 2/5 = 4/10: arriba y abajo por 2.' }
  ];
  function terminar() {
    prog.desafios = { ok1: E.p5.ok1, total: DES.length, fecha: Date.now() }; guardar();
    UI.sonar('sube'); UI.fuegos.iniciar(); ctx.log('desafíos terminados', E.p5.ok1, 'de', DES.length);
  }

  /* ==================== armado de la pantalla ==================== */
  var pag = Math.max(0, Math.min(PAGS.length - 1, parseInt(ctx.params.get('pag'), 10) - 1 || 0)), ultima = -1;
  function render() {
    var P = PAGS[pag];
    if (pag !== ultima) {
      UI.fuegos.parar(); FRUI.globo(null); ultima = pag;
      if (prog.vistas.indexOf(pag) < 0) { prog.vistas.push(pag); guardar(); }
      ctx.log('pantalla', pag + 1, P.titulo);
    }
    var h = '<div class="eq-puntos" role="tablist">' + PAGS.map(function (p, i) {
      return '<button class="' + (i === pag ? 'on' : (prog.vistas.indexOf(i) >= 0 ? 'visto' : '')) + '" data-pag="' + i + '" role="tab" aria-selected="' + (i === pag) + '" title="' + p.titulo + '">' + (i + 1) + '</button>'; }).join('') + '</div>';
    h += '<div class="ref-panel fr-panel"><h2 class="eq-titulo">' + P.titulo + '</h2>';
    h += '<p class="eq-texto">' + cf(P.texto()) +  ' <button class="ref-btn chico fr-voz" id="voz" title="Escuchar" aria-label="Escuchar"' + (FRUI.hayVoz() ? '' : ' hidden') + '>🔊</button>' + '</p>';
    h += P.pintar();
    h += '<div class="eq-nav"><button class="ref-btn" id="ant"' + (pag === 0 ? ' disabled' : '') + '>◀ Anterior</button>' +
      (pag < PAGS.length - 1 ? '<button class="ref-btn main" id="sig-pag">Siguiente ▶</button>' : '<span></span>') + '</div></div>';
    app.innerHTML = h;
    app.querySelectorAll('[data-pag]').forEach(function (b) { b.onclick = function () { ir(+b.dataset.pag); }; });
    $('#ant').onclick = function () { ir(pag - 1); };
    var sp = $('#sig-pag'); if (sp) sp.onclick = function () { ir(pag + 1); };
    var vz = $('#voz'); if (vz) vz.onclick = function () { FRUI.hablar(P.titulo + '. ' + P.texto()); };
    P.eventos();
  }
  function ir(i) { if (i < 0 || i >= PAGS.length) return; pag = i; UI.sonar('tecla'); if (window.speechSynthesis) speechSynthesis.cancel(); render(); window.scrollTo(0, 0); }

  if (ctx.debug) window.__eq = { version: VERSION, estado: E, ir: ir, prog: function () { return prog; } };
  render();
})();
