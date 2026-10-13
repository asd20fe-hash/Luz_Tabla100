/* Partes iguales (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-13) Primera versión
     + La fracción como parte de un entero partido en partes iguales: cuenta el tamaño, no los pedazos.
     + P1 "¿Qué parte está pintada?", P2 "Pintá…", P3 "Marcá las que tienen exactamente 1/4" y P4 "Armá el entero".
     + Figuras del catálogo con trampas (cuarto escondido, partes desiguales) y "Ver cuadrícula" a pedido.
     + 3 niveles, rondas de 6 ítems, registro de eventos, ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '4to-fracciones-partes';
  var FRUI = REF4_FRUI, FR = REF4_FR, FIG = REF4_FIG, G = REF4_FRGEN, A = G.partes, cf = FRUI.conFracciones;
  var txt = function (f) { return FR.formatear(f); };
  var TEXTO_PASO = { P1: 'escribir qué parte está pintada', P2: 'pintar y tocar Listo', P3: 'marcar las figuras y tocar Listo', P4: 'armar el entero' };

  function anchoFig(nivel) { var w = Math.min(document.getElementById('app').clientWidth - 60, nivel === 1 ? 320 : 280); return Math.max(180, w); }
  // Cinta de `largo` unidades; partes: líneas de corte cada `largo/partes`.
  function cintaSVG(largo, op) {
    op = op || {};
    var u = op.u || 22, A_ = op.alto || 34, W = largo * u, h = '<svg class="par-cinta" viewBox="-2 -2 ' + (W + 4) + ' ' + (A_ + 4) + '" width="' + (W + 4) + '" height="' + (A_ + 4) + '" role="img" aria-label="' + (op.etiqueta || 'cinta de ' + largo) + '">';
    h += '<rect x="0" y="0" width="' + W + '" height="' + A_ + '" rx="4" class="' + (op.clase || 'dada') + '"/>';
    if (op.partes > 1) for (var i = 1; i < op.partes; i++) { var x = W * i / op.partes; h += '<path d="M' + x + ' 0 L' + x + ' ' + A_ + '" class="corte"/>'; }
    return h + '</svg>';
  }
  // Tamaño de la unidad según la cinta más larga que se va a dibujar (las opciones o el máximo al estirar).
  function unidadPx(it) {
    var disp = Math.min(document.getElementById('app').clientWidth - 60, 600), max = it.modo === 'estirar' ? 16 : Math.max.apply(null, it.opciones.map(function (o) { return o.largo; }));
    return Math.max(12, Math.min(44, Math.floor(disp / max)));
  }

  function pintar(it, api) {
    var est = api.est, nivel = api.nivel, h = '';
    if (!est.iniciado) { est.iniciado = true; est.sel = []; est.largo = 1; api.nuevoPaso(it.tipo); }
    var guiaDisponible = nivel >= 2 && it.tipo !== 'P4';
    if (it.tipo === 'P1') {
      h += '<div class="fr-preg">¿Qué parte de la figura está pintada?</div><div class="par-fig">' + FRUI.figuraSVG(it.fig, { px: anchoFig(nivel), guia: est.guia, etiqueta: 'figura con partes pintadas' }) + '</div><div id="ing"></div>';
    } else if (it.tipo === 'P2') {
      var o = txt(it.objetivo);
      h += '<div class="fr-preg">' + cf(it.palabras ? 'Pintá ' + it.palabras + ' (' + o + ') de la figura.' : 'Pintá ' + o + ' de la figura.') + '<small>Tocá las partes para pintarlas o despintarlas.</small></div>' +
        '<div class="par-fig">' + FRUI.figuraSVG(it.fig, { px: anchoFig(nivel), tocable: true, sel: est.sel, guia: est.guia, etiqueta: 'figura para pintar' }) + '</div>' +
        '<div class="fr-fila"><button class="ref-btn main" id="listo">✔ Listo</button></div>';
    } else if (it.tipo === 'P3') {
      h += '<div class="fr-preg">' + cf('Marcá las que tienen pintado exactamente ' + txt(it.objetivo) + '.') + '<small>Pueden ser una, dos o tres.</small></div><div class="fr-figs">' +
        it.figs.map(function (x, i) { return '<button class="fr-carta' + (est.sel.indexOf(i) >= 0 ? ' sel' : '') + '" data-i="' + i + '" aria-pressed="' + (est.sel.indexOf(i) >= 0) + '">' + FRUI.figuraSVG(x.fig, { px: 130, guia: est.guia, etiqueta: 'figura ' + (i + 1) }) + '</button>'; }).join('') +
        '</div><div class="fr-fila"><button class="ref-btn main" id="listo">✔ Listo</button></div>';
    } else {
      var u = unidadPx(it), fraseParte = it.modo === 'figura' ? 'Este rectángulo es ' + txt(it.parte) + ' de la figura entera.' : 'Esta cinta es ' + txt(it.parte) + ' de la cinta entera.';
      h += '<div class="fr-preg">' + cf(fraseParte) + '</div>' + cintaSVG(it.L, { u: u, partes: est.partir ? it.a : 0, alto: it.modo === 'figura' ? 60 : 34, etiqueta: 'la parte que se ve' });
      if (it.modo === 'estirar') {
        h += '<div class="fr-preg">Armá la cinta entera: estirala con − y +.</div>' + cintaSVG(est.largo, { u: u, clase: 'nueva', etiqueta: 'tu cinta de ' + est.largo + ' unidades' }) +
          '<div class="par-estirar"><button class="ref-btn" id="menos" aria-label="Achicar">−</button><button class="ref-btn" id="mas" aria-label="Estirar">+</button><button class="ref-btn main" id="listo">✔ Listo</button></div>';
      } else {
        h += '<div class="fr-preg">' + (it.modo === 'figura' ? '¿Cuál es la figura entera?' : '¿Cuál es la cinta entera?') + '</div><div class="fr-opciones texto" id="ops">' +
          it.opciones.map(function (op, i) { return '<button class="ref-opcion par-opcion" data-i="' + i + '">' + cintaSVG(op.largo, { u: u, clase: 'nueva', alto: it.modo === 'figura' ? 60 : 30, etiqueta: 'opción ' + (i + 1) }) + '</button>'; }).join('') + '</div>';
      }
    }
    api.cont.innerHTML = h;
    eventos(it, api);
    if (guiaDisponible && !est.guia) api.boton('▦ Ver cuadrícula', function () { api.ayuda('cuadricula'); est.guia = true; api.render(); });
    if (it.tipo === 'P4' && !est.partir && nivel >= 2) api.boton('✂️ Partir', function () { api.ayuda('dibujo'); est.partir = true; api.render(); });
  }

  function eventos(it, api) {
    var est = api.est, $ = function (s) { return document.querySelector(s); };
    if (it.tipo === 'P1') {
      FRUI.ingreso($('#ing'), { modo: 'fraccion', onOk: function (f, forma) {
        var v = A.validarP1(it, f), otra = v.ok && !FR.identicas(FR.simplificar(f), f) ? '¡Bien! ' + txt(f) + ' es lo mismo que ' + txt(FR.simplificar(f)) + '.' : null;
        api.responder({ paso: 'P1', ok: v.ok, error: v.codigo, esperado: txt(it.esperado), respuesta: txt(f), forma: forma, pista: v.ok ? null : A.pista(v.codigo, it), mensaje: otra });
        if (v.ok) api.fin(otra ? 1500 : 700);
      } });
      return;
    }
    if (it.tipo === 'P2') {
      var svg = $('.fr-fig.tocable');
      var tocar = function (id) { var i = est.sel.indexOf(id); if (i >= 0) est.sel.splice(i, 1); else est.sel.push(id); REF4_UI.sonar('tecla'); api.render(); var r = document.querySelector('[data-r="' + id + '"]'); if (r) r.focus(); };
      svg.addEventListener('click', function (e) { var r = e.target.closest('[data-r]'); if (r) tocar(r.dataset.r); });
      svg.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.r) { e.preventDefault(); tocar(e.target.dataset.r); } });
      $('#listo').onclick = function () {
        var v = A.validarP2(it, est.sel), g = FIG.pintar(it.fig, est.sel), pin = FIG.fraccionPintada(g);
        api.responder({ paso: 'P2', ok: v.ok, error: v.codigo, esperado: txt(it.objetivo), respuesta: txt(pin), forma: 'opcion', pista: v.ok ? null : A.pista('PINTADO', it, { pintadas: v.pintadas }),
          mensaje: v.ok && it.palabras && it.objetivo.d === 4 ? 'La mitad de la mitad es 1/4.' : null });
        if (v.ok) api.fin(it.palabras ? 1500 : 700);
      };
      return;
    }
    if (it.tipo === 'P3') {
      document.querySelector('.fr-figs').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; var i = +b.dataset.i, k = est.sel.indexOf(i); if (k >= 0) est.sel.splice(k, 1); else est.sel.push(i); REF4_UI.sonar('tecla'); api.render(); };
      $('#listo').onclick = function () {
        var v = A.validarP3(it, est.sel), bien = it.figs.map(function (x, i) { return x.correcta ? i + 1 : 0; }).filter(Boolean);
        api.responder({ paso: 'P3', ok: v.ok, error: v.codigo, esperado: bien.join(','), respuesta: est.sel.map(function (i) { return i + 1; }).sort().join(','), forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it) });
        if (v.ok) { document.querySelectorAll('.fr-carta').forEach(function (b, i) { b.classList.add(it.figs[i].correcta ? 'ok' : ''); }); api.fin(900); }
      };
      return;
    }
    if (it.modo === 'estirar') {
      $('#menos').onclick = function () { if (est.largo > 1) { est.largo--; REF4_UI.sonar('tecla'); api.render(); } };
      $('#mas').onclick = function () { if (est.largo < 16) { est.largo++; REF4_UI.sonar('tecla'); api.render(); } };
      $('#listo').onclick = function () {
        var v = A.validarP4(it, est.largo);
        api.responder({ paso: 'P4', ok: v.ok, error: v.codigo, esperado: it.entero, respuesta: est.largo, forma: 'entero', pista: v.ok ? null : A.pista(v.codigo, it) });
        if (v.ok) api.fin(800);
      };
      return;
    }
    $('#ops').onclick = function (e) {
      var b = e.target.closest('[data-i]'); if (!b || b.disabled) return;
      var o = it.opciones[+b.dataset.i], v = A.validarP4(it, o.largo);
      api.responder({ paso: 'P4', ok: v.ok, error: v.codigo, esperado: it.entero, respuesta: o.largo, forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it) });
      if (v.ok) { b.classList.add('ok'); api.fin(800); } else { b.classList.add('mal'); b.disabled = true; }
    };
  }

  FRUI.actividad({
    act: ACT, titulo: 'Partes iguales', version: VERSION, nivelMax: 3, moduloAct: 'partes',
    tamRonda: A.ronda, tipos: A.tipos, generar: A.generar,
    deModulo: function (e, az, nivel) { var f = A.armar[e.tipo]; if (!f) return null; var it = f(e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) {
      if (it.tipo === 'P4') { api.est.partir = true; api.render(); api.pista(it.a === 1 ? 'Si esta cinta es 1/' + it.b + ', el entero son ' + it.b + ' cintas como esta.' : 'Partí la cinta en ' + it.a + ': cada pedazo es 1/' + it.b + '. El entero son ' + it.b + ' pedazos.'); return; }
      api.est.guia = true; api.render(); api.pista('Contá las partes iguales de la cuadrícula: ¿cuántas hay en todo el entero y cuántas están pintadas?');
    },
    textoPaso: function (it) { return TEXTO_PASO[it.tipo]; },
    esperado: function (it) { return it.tipo === 'P1' ? it.esperado : (it.tipo === 'P2' ? it.objetivo : (it.tipo === 'P3' ? it.figs.map(function (x, i) { return x.correcta ? i + 1 : 0; }).filter(Boolean).join(',') : it.entero + ' unidades')); },
    aprendiste: G.APRENDISTE.partes
  });
})();
