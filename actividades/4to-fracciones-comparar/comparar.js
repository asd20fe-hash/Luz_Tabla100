/* ¿Cuál es más? (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.1  (2026-10-13) Teclado y correcciones
     + Teclado: Tab y Enter pasan a la casilla siguiente de la fracción (Enter en la última es OK).
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.0  (2026-10-13) Primera versión
     + Comparar con criterios: mismo denominador, mismo numerador (partes más grandes) o pasando a equivalentes.
     + C1 "Poné >, < o =", C2 "¿Más o menos que un entero?" (canastas), C3 problemas de comparar con "¿Cómo te diste cuenta?",
       C4 "Ordená de menor a mayor" y C5 "Elegí".
     + Tiras del mismo largo, siempre visibles en el nivel 1 y a pedido después.
     + 3 niveles, rondas de 8 ítems, registro de eventos, ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.1', ACT = '4to-fracciones-comparar';
  var FRUI = REF4_FRUI, FR = REF4_FR, G = REF4_FRGEN, A = G.comparar, cf = FRUI.conFracciones, esc = FRUI.esc;
  var fr = FR.fr, txt = function (f) { return FR.formatear(f); };
  var CANASTAS = { menos: 'Menos de 1', justo: 'Justo 1', mas: 'Más de 1' };
  var TEXTO_PASO = { C1: 'elegir >, < o =', C2: 'llevar cada ficha a su canasta', quien: 'elegir quién', como: 'elegir cómo te diste cuenta', C4: 'tocar de la más chica a la más grande', C5: 'elegir la respuesta' };

  // Tiras del mismo largo total (tantos enteros como haga falta para la más grande).
  function tiras(lista) {
    var W = Math.max.apply(null, lista.map(function (f) { return Math.max(1, Math.ceil(f.n / f.d)); }));
    return '<div class="fr-tiras">' + lista.map(function (f) {
      return '<div class="fila"><span>' + FRUI.fraccionHTML(f) + '</span>' + FRUI.tiraSVG(f.d * W, { pintadas: f.n, alto: 28, etiqueta: FR.leer(f) }) + '</div>';
    }).join('') + (W > 1 ? '<div class="fr-msg">Cada tira mide ' + W + ' enteros.</div>' : '') + '</div>';
  }

  function pintar(it, api) {
    var est = api.est, nivel = api.nivel, verTiras = est.tiras || it.verTiras, h = '';
    if (!est.iniciado) { est.iniciado = true; est.sel = null; est.ubicadas = {}; est.orden = []; est.paso = it.tipo === 'C3' ? 'quien' : it.tipo; api.nuevoPaso(est.paso); }
    if (it.tipo === 'C1') {
      h += '<div class="fr-preg">¿Cuál es más? Poné el signo.</div><div class="cmp-par">' + FRUI.fraccionHTML(it.a, { mixto: it.mixtoA }) + '<span class="cmp-signo" aria-label="signo">?</span>' + FRUI.fraccionHTML(it.b) + '</div>';
      if (verTiras) h += tiras([it.a, it.b]);
      h += '<div class="fr-opciones cmp-signos" id="ops"></div>';
    } else if (it.tipo === 'C2') {
      h += '<div class="fr-preg">¿Más o menos que un entero?<small>Tocá una ficha y después su canasta.</small></div><div class="fr-paleta" id="fichas">' +
        it.fichas.map(function (x, i) { return '<button class="fr-ficha' + (est.sel === i ? ' sel' : '') + (est.ubicadas[i] ? ' fuera' : '') + '" data-i="' + i + '">' + FRUI.fraccionHTML(x.f) + '</button>'; }).join('') + '</div>' +
        '<div class="fr-canastas" id="canastas">' + ['menos', 'justo', 'mas'].filter(function (k) { return k !== 'justo' || it.conJusto; }).map(function (k) {
          var dentro = it.fichas.map(function (x, i) { return est.ubicadas[i] === k ? FRUI.fraccionHTML(x.f) : ''; }).join(' ');
          return '<button class="fr-canasta" data-c="' + k + '"><b>' + CANASTAS[k] + '</b><span class="dentro">' + dentro + '</span></button>'; }).join('') + '</div>';
      if (verTiras && est.sel !== null) h += tiras([it.fichas[est.sel].f]);
    } else if (it.tipo === 'C3') {
      h += '<div class="fr-enun">' + cf(it.texto) + '</div>';
      if (verTiras) h += tiras([it.a, it.b]);
      h += '<div class="fr-preg">' + (est.paso === 'quien' ? 'Elegí la respuesta.' : '¿Cómo te diste cuenta?') + '</div><div id="ops"></div>';
    } else if (it.tipo === 'C4') {
      h += '<div class="fr-preg">Ordená de menor a mayor.<small>Tocá primero la más chica.</small></div><div class="cmp-orden" aria-label="tu orden">' +
        est.orden.map(function (i) { return '<span class="fr-ficha ok">' + FRUI.fraccionHTML(it.fichas[i]) + '</span>'; }).join('') + '</div>' +
        '<div class="fr-paleta" id="fichas">' + it.fichas.map(function (f, i) { return '<button class="fr-ficha' + (est.orden.indexOf(i) >= 0 ? ' fuera' : '') + '" data-i="' + i + '">' + FRUI.fraccionHTML(f) + '</button>'; }).join('') + '</div>';
      if (verTiras) h += tiras(it.fichas);
    } else {
      h += '<div class="fr-preg">' + cf('¿Cuál de estas es ' + it.sentido + ' que ' + txt(it.ref) + '?') + '</div>';
      if (verTiras) h += tiras([it.ref].concat(it.opciones.map(function (o) { return o.f; })));
      h += '<div id="ops"></div>';
    }
    api.cont.innerHTML = h;
    eventos(it, api);
    if (it.tipo === 'C3') api.botonVoz(it.texto);
    if (!verTiras && nivel >= 2) api.boton('📏 Ver tiras', function () { api.ayuda('tiras'); est.tiras = true; api.render(); });
  }

  function eventos(it, api) {
    var est = api.est, $ = function (s) { return document.querySelector(s); };
    function ir(p) { est.paso = p; api.nuevoPaso(p); api.render(); }
    if (it.tipo === 'C1') {
      FRUI.opciones($('#ops'), [{ html: '&gt;', valor: '>' }, { html: '&lt;', valor: '<' }, { html: '=', valor: '=' }], function (r, b) {
        var v = A.validarC1(it, r);
        api.responder({ paso: 'C1', ok: v.ok, error: v.codigo, esperado: it.rel, respuesta: r, forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it), tema: it.tema });
        if (v.ok) { $('.cmp-signo').textContent = r; api.fin(800); } else { b.classList.add('mal'); b.disabled = true; }
      });
      return;
    }
    if (it.tipo === 'C2') {
      $('#fichas').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; est.sel = +b.dataset.i; REF4_UI.sonar('tecla'); api.render(); };
      $('#canastas').onclick = function (e) {
        var b = e.target.closest('[data-c]'); if (!b) return;
        if (est.sel === null) { api.pista('Primero tocá una ficha.'); return; }
        var ficha = it.fichas[est.sel], v = A.validarC2(ficha, b.dataset.c);
        api.responder({ paso: 'C2', ok: v.ok, error: v.codigo, esperado: ficha.canasta, respuesta: b.dataset.c, forma: 'opcion', item: { tipo: 'C2', f: txt(ficha.f) },
          pista: v.ok ? null : 'Un entero son ' + ficha.f.d + '/' + ficha.f.d + '. ' + (ficha.f.n > ficha.f.d ? 'Arriba hay más que abajo: ya pasaste el entero.' : (ficha.f.n === ficha.f.d ? 'Arriba y abajo iguales: es justo un entero.' : 'Arriba hay menos que abajo: no llega al entero.')) });
        if (v.ok) { est.ubicadas[est.sel] = b.dataset.c; est.sel = null; api.intentos.C2 = 0; api.render(); if (Object.keys(est.ubicadas).length === it.fichas.length) api.fin(700); }
      };
      return;
    }
    if (it.tipo === 'C3') {
      if (est.paso === 'quien') {
        var ops = [{ html: esc(it.nombres[0]), valor: 0 }, { html: esc(it.nombres[1]), valor: 1 }, { html: 'Los dos igual', valor: 2 }];
        FRUI.opciones($('#ops'), ops, function (i, b) {
          var v = A.validarC3(it, i);
          api.responder({ paso: 'quien', ok: v.ok, error: v.codigo, esperado: ops[it.correcta].html, respuesta: ops[i].html, forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it) });
          if (v.ok) ir('como'); else { b.classList.add('mal'); b.disabled = true; }
        });
      } else {
        FRUI.opciones($('#ops'), it.razones.map(function (r) { return { texto: r.texto, valor: r }; }), function (r, b) {
          api.responder({ paso: 'como', ok: r.ok, error: r.ok ? null : 'JUSTIFICACION', esperado: it.razones.filter(function (x) { return x.ok; })[0].texto, respuesta: r.texto, forma: 'opcion', pista: r.ok ? null : A.pista('JUSTIFICACION', it) });
          if (r.ok) api.fin(800); else { b.classList.add('mal'); b.disabled = true; }
        }, 'texto');
      }
      return;
    }
    if (it.tipo === 'C4') {
      $('#fichas').onclick = function (e) {
        var b = e.target.closest('[data-i]'); if (!b) return;
        var i = +b.dataset.i, restantes = it.fichas.filter(function (f, j) { return est.orden.indexOf(j) < 0; }), v = A.validarC4(it, it.fichas[i], restantes);
        var min = restantes.slice().sort(FR.comparar)[0];
        api.responder({ paso: 'C4', ok: v.ok, error: v.codigo, esperado: txt(min), respuesta: txt(it.fichas[i]), forma: 'opcion',
          pista: v.ok ? null : (v.codigo === 'DENOM_MAYOR_ES_MAYOR' ? A.pista(v.codigo, it) : 'Hay una más chica que ' + txt(it.fichas[i]) + '. Pasalas a partes del mismo tamaño.') });
        if (v.ok) { est.orden.push(i); api.intentos.C4 = 0; api.render(); if (est.orden.length === it.fichas.length) api.fin(700); }
      };
      return;
    }
    FRUI.opciones($('#ops'), it.opciones.map(function (o) { return { html: FRUI.fraccionHTML(o.f), valor: o }; }), function (o, b) {
      api.responder({ paso: 'C5', ok: !o.codigo, error: o.codigo, esperado: it.opciones.filter(function (x) { return !x.codigo; }).map(function (x) { return txt(x.f); })[0], respuesta: txt(o.f), forma: 'opcion', pista: o.codigo ? A.pista(o.codigo, { a: o.f, b: it.ref }) : null });
      if (!o.codigo) api.fin(800); else { b.classList.add('mal'); b.disabled = true; }
    });
  }

  FRUI.actividad({
    act: ACT, titulo: '¿Cuál es más?', version: VERSION, nivelMax: 3, moduloAct: 'comparar',
    tamRonda: A.ronda, tipos: A.tipos, generar: A.generar,
    deModulo: function (e, az, nivel) { var f = A.armar[e.tipo]; if (!f) return null; var it = f(e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) {
      api.est.tiras = true; api.render();
      var a = it.a, b = it.b;
      api.pista(a && b ? (a.d === b.d ? 'Las partes son del mismo tamaño: es más la que tiene más partes.' : (a.n === b.n ? 'Mismo número arriba: es más la de partes más grandes, o sea, la del número de abajo más chico.' : 'Pasalas a partes del mismo tamaño y compará.')) : 'Mirá las tiras: todas miden lo mismo.');
    },
    textoPaso: function (it, api) { return TEXTO_PASO[api.est.paso] || 'seguir'; },
    esperado: function (it) { return it.tipo === 'C1' ? it.rel : (it.tipo === 'C3' ? ['primero', 'segundo', 'los dos igual'][it.correcta] : (it.tipo === 'C4' ? it.orden.map(txt).join(' < ') : (it.tipo === 'C5' ? it.opciones.filter(function (o) { return !o.codigo; })[0].f : 'canastas'))); },
    aprendiste: G.APRENDISTE.comparar
  });
})();
