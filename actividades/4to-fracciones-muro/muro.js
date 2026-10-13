/* Muro de fracciones (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-13) Primera versión
     + Fracciones equivalentes: partir cada parte en 2 (o en 4) es multiplicar arriba y abajo por el mismo número.
     + E1 "Cubrí con piezas", E2 "Completá", E3 "Rodeá las equivalentes", E4 "¿Quién tiene razón?",
       E5 "¿Verdadero o falso?" y E6 "Parejas" (al final de la ronda).
     + Tiras siempre visibles en el nivel 1 y a pedido después ("Ver tiras").
     + 3 niveles (16avos y valores hasta 2 en el nivel 3), rondas de 6 ítems, registro de eventos, ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '4to-fracciones-muro';
  var FRUI = REF4_FRUI, FR = REF4_FR, G = REF4_FRGEN, A = G.muro, cf = FRUI.conFracciones, esc = FRUI.esc;
  var fr = FR.fr, txt = function (f) { return FR.formatear(f); };
  var TEXTO_PASO = { E1: 'cubrir el tramo con piezas', cuantos: 'contar las piezas', E2: 'completar la fracción', E3: 'tocar las equivalentes y Listo', quien: 'elegir quién tiene razón',
    porque: 'elegir por qué', E5: 'decidir si es verdadero o falso', E6: 'juntar las parejas' };

  // Tiras de una fracción (si pasa del entero, una tira por cada entero, todas del mismo largo).
  function tiras(f, op) {
    op = op || {};
    var enteros = Math.max(1, Math.ceil(f.n / f.d)), h = '<div class="mur-dos">';
    for (var e = 0; e < enteros; e++) { var pint = Math.max(0, Math.min(f.d, f.n - e * f.d)); h += FRUI.tiraSVG(f.d, { pintadas: pint, alto: op.alto || 28, etiqueta: FR.leer(f) }); }
    return h + '</div>';
  }
  function filaTiras(lista) { return '<div class="fr-tiras">' + lista.map(function (f) { return '<div class="fila"><span>' + FRUI.fraccionHTML(f) + '</span>' + tiras(f) + '</div>'; }).join('') + '</div>'; }
  function ap(n, d) { return '<span class="mur-ap"><span class="n">' + n + '</span><span class="d">' + d + '</span></span>'; }
  var HUECO = '<span class="mur-hueco" aria-label="casillero vacío">?</span>';

  function pintar(it, api) {
    var est = api.est, nivel = api.nivel, h = '', verTiras = est.tiras || nivel === 1;
    if (!est.iniciado) { est.iniciado = true; est.sel = []; est.piezas = 0; est.fuera = []; est.paso = it.tipo === 'E4' ? 'quien' : it.tipo; api.nuevoPaso(est.paso); }
    if (it.tipo === 'E1') {
      var filas = nivel === 3 ? [1, 2, 4, 8, 16] : [1, 2, 4, 8], sobre = FR.comparar(it.f, fr(1, 1)) <= 0;
      h += '<div class="fr-preg">' + cf('Cubrí ' + txt(it.f) + ' del muro con piezas de 1/' + it.pieza + '.') + '<small>Tocá la pieza para ponerla. ¡Que no se pase!</small></div>';
      h += FRUI.muroSVG(filas, { hasta: sobre ? it.f : null });
      var w = 100 / it.pieza, tot = est.piezas;
      h += '<div class="fr-trabajo" aria-label="tu fila: ' + tot + ' piezas"><div class="meta" style="left:0;width:' + (100 * it.f.n / it.f.d) + '%"></div>';
      for (var i = 0; i < tot; i++) h += '<div class="fr-pieza" style="width:' + w + '%">' + (it.pieza <= 8 ? '1/' + it.pieza : '') + '</div>';
      if (est.rebota) h += '<div class="fr-pieza rebota" style="width:' + w + '%"></div>';
      h += '</div>';
      if (it.guiado || est.guia) h += '<div class="mur-cuenta">Llevás ' + tot + ' ' + (tot === 1 ? 'pieza' : 'piezas') + ' de ' + FRUI.fraccionHTML(fr(1, it.pieza)) + '.</div>';
      if (est.paso === 'E1') h += '<div class="fr-paleta"><button class="fr-ficha fr-activo" id="pieza">' + FRUI.fraccionHTML(fr(1, it.pieza)) + '</button><button class="ref-btn" id="sacar">↩ Sacar una</button></div>';
      else if (est.paso === 'cuantos') h += '<div class="fr-preg">' + cf('¿Cuántas piezas de 1/' + it.pieza + ' usaste?') + '</div><div id="ing"></div>';
      else h += '<div class="mur-igual">' + FRUI.fraccionHTML(it.f) + ' = ' + FRUI.fraccionHTML(it.esperado) + '</div>';
    } else if (it.tipo === 'E2') {
      var izq = it.hueco === 'izq' ? ap(HUECO, it.f.d) : ap(it.f.n, it.f.d), der = it.hueco === 'num' ? ap(HUECO, it.g.d) : (it.hueco === 'den' ? ap(it.g.n, HUECO) : ap(it.g.n, it.g.d));
      h += '<div class="fr-preg">Completá para que valgan lo mismo.</div><div class="mur-ecuacion" aria-label="completá la fracción">' + izq + '<span>=</span>' + der + '</div>';
      // la tira de la fracción dada y, debajo, una tira vacía partida en las partes nuevas (si se conocen)
      if (verTiras || it.verTiras) h += filaTiras([it.hueco === 'izq' ? it.g : it.f]) + (it.hueco === 'num' ? '<div class="fr-tiras"><div class="fila"><span>' + FRUI.fraccionHTML(fr(1, it.g.d)) + '</span>' + FRUI.tiraSVG(it.g.d, { pintadas: 0, alto: 28 }) + '</div></div>' : '');
      h += '<div id="ing"></div>';
    } else if (it.tipo === 'E3') {
      h += '<div class="fr-preg">' + cf('Tocá todas las que son equivalentes a ' + txt(it.f) + '.') + '</div>' + (verTiras ? filaTiras([it.f]) : '') +
        '<div class="fr-paleta" id="fichas">' + it.fichas.map(function (x, i) { return '<button class="fr-ficha' + (est.sel.indexOf(i) >= 0 ? ' sel' : '') + '" data-i="' + i + '" aria-pressed="' + (est.sel.indexOf(i) >= 0) + '">' + FRUI.fraccionHTML(x.f) + '</button>'; }).join('') +
        '</div><div class="fr-fila"><button class="ref-btn main" id="listo">✔ Listo</button></div>';
    } else if (it.tipo === 'E4') {
      if (it.contexto) h += '<div class="fr-enun">' + cf(it.contexto) + '</div>';
      if (it.fig) h += '<div class="par-fig fr-centro">' + FRUI.figuraSVG(it.fig, { px: 220, etiqueta: 'la figura' }) + '</div>';
      h += '<div class="fr-globos">' + it.textos.map(function (t, i) { return '<div class="fr-dice"><b>' + esc(it.quienes[i]) + ' dice:</b>' + cf(t) + '</div>'; }).join('') + '</div>';
      h += '<div class="fr-preg">' + (est.paso === 'quien' ? '¿Quién tiene razón?' : '¿Por qué?') + '</div><div id="ops"></div>';
      if (verTiras && it.dichos) h += filaTiras(it.dichos);
    } else if (it.tipo === 'E5') {
      h += '<div class="fr-preg">¿Verdadero o falso?</div><div class="fr-enun">' + esc(it.k + ' partes de ') + FRUI.fraccionHTML(fr(1, it.b)) + esc(' equivalen a ' + it.j + ' partes de ') + FRUI.fraccionHTML(fr(1, it.c)) + '.</div>' +
        (est.tiras ? filaTiras([fr(it.k, it.b), fr(it.j, it.c)]) : '') + '<div id="ops"></div>';
    } else if (it.tipo === 'E6') {
      h += '<div class="fr-preg">Juntá las parejas que valen lo mismo.<small>Tocá dos fichas.</small></div><div class="fr-parejas" id="cartas">' + it.cartas.map(function (c, i) {
        var cont = c.rep === 'numero' ? FRUI.fraccionHTML(c.f) : (c.rep === 'tira' ? tiras(c.f, { alto: 20 }) : esc(FR.leer(c.f, { mixto: true })));
        return '<button class="fr-carta' + (est.fuera.indexOf(i) >= 0 ? ' fuera' : '') + (est.sel.indexOf(i) >= 0 ? ' sel' : '') + '" data-i="' + i + '" aria-label="' + esc(FR.leer(c.f, { mixto: true })) + '">' + cont + '</button>'; }).join('') + '</div>';
    }
    api.cont.innerHTML = h;
    eventos(it, api);
    if (nivel >= 2 && !est.tiras && it.tipo !== 'E1' && it.tipo !== 'E6') api.boton('📏 Ver tiras', function () { api.ayuda('tiras'); est.tiras = true; api.render(); });
  }

  function eventos(it, api) {
    var est = api.est, $ = function (s) { return document.querySelector(s); };
    function ir(p) { est.paso = p; api.nuevoPaso(p); api.render(); }
    if (it.tipo === 'E1') {
      if (est.paso === 'E1') {
        $('#pieza').onclick = function () {
          var nuevo = fr(est.piezas + 1, it.pieza), c = FR.comparar(nuevo, it.f);
          if (c > 0) { est.rebota = true; REF4_UI.sonar('mal'); api.pista('Esa pieza no entra: te pasarías. ¿Cuántas te faltan?'); api.render(); setTimeout(function () { est.rebota = false; if (est.paso === 'E1') api.render(); }, 380); return; }
          est.piezas++; REF4_UI.sonar('tecla');
          if (c === 0) { api.responder({ paso: 'cubrir', ok: true, esperado: txt(it.esperado), respuesta: est.piezas + '/' + it.pieza, forma: 'opcion' }); ir('cuantos'); return; }
          api.render();
        };
        $('#sacar').onclick = function () { if (est.piezas > 0) { est.piezas--; api.render(); } };
      } else if (est.paso === 'cuantos') {
        FRUI.ingreso($('#ing'), { modo: 'entero', onOk: function (f) {
          var x = f.n / f.d, ok = x === it.esperado.n;
          api.responder({ paso: 'cuantos', ok: ok, error: ok ? null : 'OTRO', esperado: it.esperado.n, respuesta: x, forma: 'entero', pista: ok ? null : 'Contá las piezas de la fila: cada una es 1/' + it.pieza + '.',
            mensaje: ok ? txt(it.f) + ' = ' + txt(it.esperado) : null });
          if (ok) { est.paso = 'fin'; api.render(); api.fin(1500); }
        } });
      }
      return;
    }
    if (it.tipo === 'E2') {
      FRUI.ingreso($('#ing'), { modo: 'entero', etiqueta: 'el número que falta', onOk: function (f) {
        var x = f.n / f.d, v = A.validarE2(it, x);
        api.responder({ paso: 'E2', ok: v.ok, error: v.codigo, esperado: it.esperado, respuesta: x, forma: 'entero', pista: v.ok ? null : A.pista(v.codigo === 'OTRO' ? 'E2' : v.codigo, it),
          mensaje: v.ok ? txt(it.f) + ' = ' + txt(it.g) : null });
        if (v.ok) api.fin(1200);
      } });
      return;
    }
    if (it.tipo === 'E3') {
      $('#fichas').onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; var i = +b.dataset.i, k = est.sel.indexOf(i); if (k >= 0) est.sel.splice(k, 1); else est.sel.push(i); REF4_UI.sonar('tecla'); api.render(); };
      $('#listo').onclick = function () {
        var v = A.validarE3(it, est.sel), bien = it.fichas.filter(function (x) { return !x.codigo; }).map(function (x) { return txt(x.f); });
        api.responder({ paso: 'E3', ok: v.ok, error: v.codigo, esperado: bien.join(' '), respuesta: est.sel.map(function (i) { return txt(it.fichas[i].f); }).join(' '), forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it) });
        if (v.ok) api.fin(800);
      };
      return;
    }
    if (it.tipo === 'E4') {
      if (est.paso === 'quien') {
        var ops = [{ html: esc(it.quienes[0]), valor: 0 }, { html: esc(it.quienes[1]), valor: 1 }, { html: 'Los dos', valor: 2 }, { html: 'Ninguno', valor: 3 }];
        FRUI.opciones($('#ops'), ops, function (i, b) {
          var ok = i === it.correcta, cod = ok ? null : (it.plantilla === 'uno_solo' && i !== 3 && i !== it.correcta ? 'EQUIV_MAL_ESCALADA' : (it.correcta === 2 || it.plantilla === 'budin' ? 'IGUALDAD_NO_DETECTADA' : 'OTRO'));
          api.responder({ paso: 'quien', ok: ok, error: cod, esperado: ops[it.correcta].html, respuesta: ops[i].html, forma: 'opcion', pista: ok ? null : A.pista(cod === 'OTRO' ? 'IGUALDAD_NO_DETECTADA' : cod, it) });
          if (ok) ir('porque'); else { b.classList.add('mal'); b.disabled = true; }
        });
      } else {
        FRUI.opciones($('#ops'), it.razones.map(function (r) { return { texto: r.texto, valor: r }; }), function (r, b) {
          api.responder({ paso: 'porque', ok: r.ok, error: r.ok ? null : 'JUSTIFICACION', esperado: it.razones.filter(function (x) { return x.ok; })[0].texto, respuesta: r.texto, forma: 'opcion', pista: r.ok ? null : A.pista('JUSTIFICACION', it) });
          if (r.ok) api.fin(800); else { b.classList.add('mal'); b.disabled = true; }
        }, 'texto');
      }
      return;
    }
    if (it.tipo === 'E5') {
      FRUI.opciones($('#ops'), [{ html: 'Verdadero', valor: true }, { html: 'Falso', valor: false }], function (d, b) {
        var v = A.validarE5(it, d);
        api.responder({ paso: 'E5', ok: v.ok, error: v.codigo, esperado: it.verdad ? 'V' : 'F', respuesta: d ? 'V' : 'F', forma: 'opcion', pista: v.ok ? null : A.pista(v.codigo, it) });
        if (v.ok) api.fin(800); else { b.classList.add('mal'); b.disabled = true; }
      });
      return;
    }
    if (it.tipo === 'E6') {
      $('#cartas').onclick = function (e) {
        var b = e.target.closest('[data-i]'); if (!b) return;
        var i = +b.dataset.i; if (est.fuera.indexOf(i) >= 0) return;
        if (est.sel.indexOf(i) >= 0) { est.sel = []; api.render(); return; }
        est.sel.push(i); REF4_UI.sonar('tecla');
        if (est.sel.length < 2) { api.render(); return; }
        var a = it.cartas[est.sel[0]], c = it.cartas[est.sel[1]], ok = a.par === c.par;
        api.responder({ paso: 'pareja', ok: ok, error: ok ? null : 'IGUALDAD_NO_DETECTADA', esperado: 'par', respuesta: txt(a.f) + ' y ' + txt(c.f), forma: 'opcion',
          pista: ok ? null : txt(a.f) + ' y ' + txt(c.f) + ' no valen lo mismo. Pensá en las tiras: ¿llegan hasta el mismo lugar?' });
        if (ok) est.fuera = est.fuera.concat(est.sel);
        est.sel = []; api.intentos.pareja = ok ? 0 : api.intentos.pareja; api.render();
        if (est.fuera.length === it.cartas.length) api.fin(700);
      };
    }
  }

  FRUI.actividad({
    act: ACT, titulo: 'Muro de fracciones', version: VERSION, nivelMax: 3, moduloAct: 'muro',
    tamRonda: A.ronda, tipos: A.tipos, tipoFinal: A.tipoFinal, generar: A.generar,
    deModulo: function (e, az, nivel) { var f = A.armar[e.tipo]; if (!f) return null; var it = f(e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) {
      api.est.tiras = true; api.est.guia = true; api.render();
      api.pista('Si partís cada parte en 2, tenés el doble de partes y el doble de pintadas: arriba y abajo por 2.');
    },
    textoPaso: function (it, api) { return TEXTO_PASO[api.est.paso] || TEXTO_PASO[it.tipo]; },
    esperado: function (it, api) { return it.tipo === 'E1' ? it.esperado : (it.tipo === 'E2' ? it.esperado : (it.tipo === 'E3' ? it.fichas.filter(function (x) { return !x.codigo; }).map(function (x) { return txt(x.f); }).join(' ') : (it.tipo === 'E5' ? (it.verdad ? 'V' : 'F') : (it.tipo === 'E4' ? it.correcta : 'parejas')))); },
    aprendiste: G.APRENDISTE.muro
  });
})();
