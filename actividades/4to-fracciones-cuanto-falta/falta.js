/* ¿Cuánto falta? (fracciones de 4to) — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-13) Primera versión
     + Cuánto falta para 1 o para 2, completar sumas, sumar y restar con medios, cuartos y octavos.
     + S1 "¿Cuánto falta para el entero?", S2 "Completá", S3 "Sumá o restá" por pasos (¿mismo tamaño? → pasar → resultado),
       S4 problemas como detective (leer, pregunta, entero, plan, calcular, ¿tiene sentido?, respuesta con unidad) y S5 "Elegí".
     + Rondas de 6 ítems con 2 problemas (en el nivel 1, 5 cuentas y 1 problema).
     + 3 niveles, registro de eventos (mini-pasos de los problemas y audio), ?debug=1, ?seed=N, ?nivel=N y ?tipo=X.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '4to-fracciones-cuanto-falta';
  var FRUI = REF4_FRUI, FR = REF4_FR, G = REF4_FRGEN, A = G.falta, cf = FRUI.conFracciones, esc = FRUI.esc;
  var fr = FR.fr, txt = function (f) { return FR.formatear(f); }, mix = function (f) { return FR.formatear(f, { mixto: true }); }, UNO = fr(1, 1);
  var PASOS_P = ['leer', 'pregunta', 'entero', 'plan', 'calcular', 'sentido', 'respuesta'];
  var NOMBRE_P = { leer: 'Leer', pregunta: 'Pregunta', entero: 'Entero', plan: 'Plan', calcular: 'Calcular', sentido: '¿Tiene sentido?', respuesta: 'Respuesta' };
  var TEXTO_PASO = { S1: 'escribir cuánto falta', S2: 'completar la suma', mismo: 'decidir si las partes son del mismo tamaño', pasar: 'pasar a partes del mismo tamaño', resultado: 'escribir el resultado',
    leer: 'leer el problema', pregunta: 'elegir qué te preguntan', entero: 'elegir cuál es el entero', plan: 'elegir qué hacés', calcular: 'calcular', sentido: 'pensar si tiene sentido', respuesta: 'elegir la respuesta', S5: 'elegir el resultado' };

  // Tiras de una cuenta: a en un color y b en otro (suma) o tachada (resta), todas del mismo largo.
  function tirasCuenta(a, b, op) {
    var D = FR.mcm(a.d, b.d), mayor = op === '+' ? FR.sumar(a, b) : a, W = Math.max(1, Math.ceil(mayor.n / mayor.d)), na = a.n * D / a.d, nb = b.n * D / b.d;
    var h = '<div class="fr-tiras"><div class="fila"><span>' + FRUI.fraccionHTML(a) + '</span>' + FRUI.tiraSVG(a.d * W, { pintadas: a.n, alto: 26 }) + '</div><div class="fila"><span>' + FRUI.fraccionHTML(b) + '</span>' + FRUI.tiraSVG(b.d * W, { pintadas: 0, pintadas2: b.n, alto: 26 }) + '</div>';
    if (op === '+') h += '<div class="fila"><span>juntas</span>' + FRUI.tiraSVG(D * W, { pintadas: na, pintadas2: nb, alto: 26 }) + '</div>';
    else { var tach = []; for (var i = na - nb; i < na; i++) tach.push(i); h += '<div class="fila"><span>sacás</span>' + FRUI.tiraSVG(D * W, { pintadas: na, tachadas: tach, alto: 26 }) + '</div>'; }
    return h + (W > 1 ? '<div class="fr-msg">Cada tira mide ' + W + ' enteros.</div>' : '') + '</div>';
  }
  function tirasHasta(a, T) { var W = T.n / T.d, h = '<div class="fr-tiras">'; for (var e = 0; e < W; e++) h += '<div class="fila"><span>' + (e === 0 ? FRUI.fraccionHTML(a) : '') + '</span>' + FRUI.tiraSVG(a.d, { pintadas: Math.max(0, Math.min(a.d, a.n - e * a.d)), alto: 28 }) + '</div>'; return h + '</div>'; }
  function pasosBar(it, paso) {
    var lista = PASOS_P.filter(function (p) { return (p !== 'entero' || it.enteros) && (p !== 'sentido' || it.sentido); }), i = paso === 'fin' ? lista.length : lista.indexOf(paso);
    return '<div class="fr-pasos">' + lista.map(function (p, j) { return '<span class="' + (j === i ? 'on' : (j < i ? 'hecho' : '')) + '">' + NOMBRE_P[p] + '</span>'; }).join('') + '</div>';
  }

  function pintar(it, api) {
    var est = api.est, nivel = api.nivel, verTiras = est.tiras || it.verTiras, h = '';
    if (!est.iniciado) {
      est.iniciado = true;
      est.paso = it.tipo === 'S3' ? (it.pasos ? 'mismo' : 'resultado') : (it.tipo === 'S4' ? 'leer' : it.tipo);
      if (it.tipo === 'S4') { est.ordPreg = api.az.mezclar([0, 1, 2]); est.ordEnt = api.az.mezclar([0, 1, 2]); est.ordPlan = api.az.mezclar([0, 1, 2]); }
      api.nuevoPaso(est.paso);
    }
    var p = est.paso;
    if (it.tipo === 'S1') {
      h += '<div class="fr-preg">' + cf('Está pintado ' + txt(it.a) + '. ¿Cuánto falta para llegar a ' + txt(it.T) + (FR.comparar(it.T, UNO) > 0 ? ' enteros' : ' entero') + '?') + '</div>' + tirasHasta(it.a, it.T) + '<div id="ing"></div>';
    } else if (it.tipo === 'S2') {
      h += '<div class="fr-preg">Completá.</div><div class="fal-cuenta">' + FRUI.fraccionHTML(it.a) + '<span>+</span><span class="fal-hueco">?</span><span>=</span>' + FRUI.fraccionHTML(it.T) + '</div>' + (verTiras ? tirasHasta(it.a, it.T) : '') + '<div id="ing"></div>';
    } else if (it.tipo === 'S3') {
      h += '<div class="fal-cuenta">' + FRUI.fraccionHTML(it.a, { mixto: it.mixtoA }) + '<span>' + (it.op === '+' ? '+' : '−') + '</span>' + FRUI.fraccionHTML(it.b) + '<span>=</span><span class="fal-hueco">?</span></div>';
      if (verTiras) h += tirasCuenta(it.a, it.b, it.op);
      if (p === 'mismo') h += '<div class="fr-preg">¿Las partes son del mismo tamaño?</div><div id="ops"></div>';
      else if (p === 'pasar') { var cv = it.conv === 'a' ? it.a : it.b; h += '<div class="fr-preg">' + cf('Pasá ' + txt(cv) + ' a ' + A.PARTES_NOMBRE[it.D] + '.') + '</div><div class="fal-cuenta">' + FRUI.fraccionHTML(cv) + '<span>=</span><span class="mur-ap fr-ap" style="font-size:1em"><span class="fr-n fal-hueco">?</span><span class="fr-d">' + it.D + '</span></span></div><div id="ing"></div>'; }
      else h += '<div class="fr-preg">¿Cuánto da?</div><div id="ing"></div>';
    } else if (it.tipo === 'S4') {
      h += pasosBar(it, p) + '<div class="fr-enun">' + cf(it.texto) + '</div>';
      if (est.tira && it.datos) h += tirasHasta(it.datos[0], it.T && FR.comparar(it.T, UNO) > 0 ? it.T : UNO);
      if (p === 'leer') h += '<div class="fr-fila"><button class="ref-btn main fr-activo" id="leido">Ya lo leí</button></div>';
      else if (p === 'pregunta') h += '<div class="fr-preg">¿Qué te preguntan?</div><div id="ops"></div>';
      else if (p === 'entero') h += '<div class="fr-preg">¿Cuál es el entero?</div><div id="ops"></div>';
      else if (p === 'plan') h += '<div class="fr-preg">¿Qué hacés?</div><div id="ops"></div>';
      else if (p === 'calcular') h += '<div class="fr-preg">Calculá.</div><div id="ing"></div>';
      else if (p === 'sentido') h += '<div class="fr-preg">' + cf('Otro chico respondió ' + mix(it.otroResp) + (it.unidad === 'kg' || it.unidad === 'l' ? ' ' + it.unidad : '') + '. Si al principio había ' + mix(it.T) + (it.unidad === 'kg' || it.unidad === 'l' ? ' ' + it.unidad : (FR.comparar(it.T, UNO) === 0 ? ' entero' : ' enteros')) + ', ¿puede ser?') + '</div><div id="ops"></div>';
      else if (p === 'respuesta') h += '<div class="fr-preg">' + (it.escribeUnidad ? cf('Ya calculaste ' + mix(it.esperado) + '. ¿' + mix(it.esperado) + ' qué?') : '¿Cuál es la respuesta completa?') + '</div><div id="ops"></div>';
      else h += '<div class="fr-grande">' + cf(mix(it.esperado) + ' ' + it.unidad) + '</div>';
    } else {
      h += '<div class="fr-preg">' + cf('¿Cuánto es ' + txt(it.a) + ' ' + (it.op === '+' ? '+' : '−') + ' ' + txt(it.b) + '?') + '</div>' + (verTiras ? tirasCuenta(it.a, it.b, it.op) : '') + '<div id="ops"></div>';
    }
    api.cont.innerHTML = h;
    eventos(it, api);
    if (it.tipo === 'S4') { api.botonVoz(it.texto); if (p === 'calcular' && !est.tira && it.datos) api.boton('📏 Ver tira', function () { api.ayuda('tiras'); est.tira = true; api.render(); }); }
    else if (!verTiras && nivel >= 2 && it.tipo !== 'S1') api.boton('📏 Ver tiras', function () { api.ayuda('tiras'); est.tiras = true; api.render(); });
  }

  function eventos(it, api) {
    var est = api.est, p = est.paso, $ = function (s) { return document.querySelector(s); };
    function ir(x) { est.paso = x; api.nuevoPaso(x); api.render(); }
    function ingreso(modo, onOk) { FRUI.ingreso($('#ing'), { modo: modo, onOk: onOk }); }
    function bienEquiv(f, esp) { return !FR.identicas(FR.simplificar(f), f) || (f.d !== esp.d && FR.iguales(f, esp)) ? '¡Bien! ' + mix(f) + ' es lo mismo que ' + mix(FR.simplificar(f)) + '.' : null; }
    if (it.tipo === 'S1' || it.tipo === 'S2') {
      ingreso('mixto', function (f, forma) {
        var v = A.validarFalta(it, f);
        api.responder({ paso: it.tipo, ok: v.ok, error: v.codigo, esperado: mix(it.esperado), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, pista: v.ok ? null : A.pista(v.codigo, it), mensaje: v.ok ? bienEquiv(f, it.esperado) : null });
        if (v.ok) api.fin(1200);
      });
      return;
    }
    if (it.tipo === 'S3') {
      if (p === 'mismo') {
        FRUI.opciones($('#ops'), [{ html: 'Sí', valor: true }, { html: 'No', valor: false }], function (si, b) {
          var ok = si === it.mismo;
          api.responder({ paso: 'mismo', ok: ok, error: ok ? null : (si ? 'DENOMINADOR_DISTINTO' : 'OTRO'), esperado: it.mismo ? 'si' : 'no', respuesta: si ? 'si' : 'no', forma: 'opcion',
            pista: ok ? null : (si ? 'Mirá las tiras: los ' + A.PARTES_NOMBRE[it.a.d] + ' y los ' + A.PARTES_NOMBRE[it.b.d] + ' no son del mismo tamaño.' : 'Las dos tienen el mismo número abajo: las partes son iguales.') });
          if (!ok) { b.classList.add('mal'); b.disabled = true; return; }
          ir(it.mismo ? 'resultado' : 'pasar');
        });
        return;
      }
      if (p === 'pasar') {
        var cv = it.conv === 'a' ? it.a : it.b, esp = FR.aDenominador(cv, it.D);
        ingreso('entero', function (f) {
          var x = f.n / f.d, r = fr(x, it.D), ok = x === esp.n, cod = ok ? null : (FR.clasificar('equivalente', { f: cv }, r) || 'OTRO');
          api.responder({ paso: 'pasar', ok: ok, error: cod, esperado: txt(esp), respuesta: txt(r), forma: 'entero',
            pista: ok ? null : 'Cada ' + FR.nombreDen(cv.d, false) + ' son ' + (it.D / cv.d) + ' ' + A.PARTES_NOMBRE[it.D] + '. ' + txt(cv) + ' son ' + cv.n + ' veces eso.', mensaje: ok ? txt(cv) + ' = ' + txt(esp) : null });
          if (ok) ir('resultado');
        });
        return;
      }
      ingreso('mixto', function (f, forma) {
        var v = A.validarS3(it, f);
        api.responder({ paso: 'resultado', ok: v.ok, error: v.codigo, esperado: mix(it.esperado), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, pista: v.ok ? null : A.pista(v.codigo, it, { resp: txt(f) }), mensaje: v.ok ? bienEquiv(f, it.esperado) : null });
        if (v.ok) api.fin(1200);
      });
      return;
    }
    if (it.tipo === 'S5') {
      FRUI.opciones($('#ops'), it.opciones.map(function (o) { return { html: FRUI.fraccionHTML(o.f, { mixto: FR.comparar(o.f, UNO) > 0 }), valor: o }; }), function (o, b) {
        api.responder({ paso: 'S5', ok: !o.codigo, error: o.codigo, esperado: txt(it.esperado), respuesta: txt(o.f), forma: 'opcion', pista: o.codigo ? A.pista(o.codigo, it, { resp: txt(o.f) }) : null });
        if (!o.codigo) api.fin(800); else { b.classList.add('mal'); b.disabled = true; }
      });
      return;
    }
    // S4: problemas
    var siguiente = { leer: 'pregunta', pregunta: it.enteros ? 'entero' : 'plan', entero: 'plan', plan: 'calcular', calcular: it.sentido ? 'sentido' : 'respuesta', sentido: 'respuesta' };
    if (p === 'leer') { $('#leido').onclick = function () { api.responder({ paso: 'leer', ok: true, esperado: '', respuesta: '', forma: 'opcion', noCuenta: true, item: { cat: it.cat, audio: api.vioAudio } }); ir('pregunta'); }; return; }
    function elegir(lista, orden, codigos, paso) {
      FRUI.opciones($('#ops'), orden.map(function (i) { return { texto: lista[i], valor: i }; }), function (i, b) {
        var ok = i === 0;
        api.responder({ paso: paso, ok: ok, error: ok ? null : codigos[i], esperado: lista[0], respuesta: lista[i], forma: 'opcion', item: { cat: it.cat, trampa: it.trampa || null },
          pista: ok ? null : A.pista(codigos[i], it) });
        if (ok) ir(siguiente[paso]); else { b.classList.add('mal'); b.disabled = true; }
      }, 'texto');
    }
    if (p === 'pregunta') return elegir(it.preguntas, est.ordPreg, [null, 'PREGUNTA', it.enteros ? 'ENTERO_EQUIVOCADO' : 'PREGUNTA'], 'pregunta');
    if (p === 'entero') return elegir(it.enteros, est.ordEnt, [null, 'ENTERO_EQUIVOCADO', 'RESPONDE_EL_DATO'], 'entero');
    if (p === 'plan') return elegir(it.planes, est.ordPlan, [null, it.cat === 'P5' ? 'PLAN_INCOMPLETO' : 'PLAN_OPERACION', 'RESPONDE_EL_DATO'], 'plan');
    if (p === 'calcular') {
      ingreso('mixto', function (f, forma) {
        var v = A.validarProblema(it, f);
        api.responder({ paso: 'calcular', ok: v.ok, error: v.codigo, esperado: mix(it.esperado), respuesta: FR.formatear(f, { mixto: forma === 'mixto' }), forma: forma, item: { cat: it.cat, trampa: it.trampa || null },
          pista: v.ok ? null : A.pista(v.codigo, it, { resp: txt(f) }), mensaje: v.ok ? bienEquiv(f, it.esperado) : null });
        if (v.ok) ir(siguiente.calcular);
      });
      return;
    }
    if (p === 'sentido') {
      FRUI.opciones($('#ops'), [{ html: 'Sí, puede ser', valor: true }, { html: 'No puede ser', valor: false }], function (si, b) {
        var ok = si === !it.absurdo;
        api.responder({ paso: 'sentido', ok: ok, error: ok ? null : (it.absurdo ? 'ABSURDO' : 'OTRO'), esperado: it.absurdo ? 'no' : 'si', respuesta: si ? 'si' : 'no', forma: 'opcion', item: { cat: it.cat, absurdo: it.absurdo },
          pista: ok ? null : (it.absurdo ? A.pista('ABSURDO', it) : 'Fijate: ' + mix(it.otroResp) + ' es menos que ' + mix(it.T) + ', y es lo que vos calculaste.') });
        if (ok) ir('respuesta'); else { b.classList.add('mal'); b.disabled = true; }
      });
      return;
    }
    if (p === 'respuesta') {
      if (it.escribeUnidad) {
        var us = api.az.mezclar([it.unidad, it.unidad === 'kg' ? 'l' : 'kg', it.unidad === 'l' ? 'del libro' : 'l'].filter(function (x, i, a) { return a.indexOf(x) === i; }));
        FRUI.opciones($('#ops'), us.map(function (u) { return { html: esc(u), valor: u }; }), function (u, b) {
          var ok = u === it.unidad;
          api.responder({ paso: 'respuesta', ok: ok, error: ok ? null : 'UNIDAD', esperado: it.unidad, respuesta: u, forma: 'opcion', pista: ok ? null : A.pista('UNIDAD', it, { x: mix(it.esperado) }) });
          if (ok) { est.paso = 'fin'; api.render(); api.fin(1200); } else { b.classList.add('mal'); b.disabled = true; }
        });
      } else {
        FRUI.opciones($('#ops'), it.frases.map(function (x) { return { texto: x.texto, valor: x }; }), function (x, b) {
          api.responder({ paso: 'respuesta', ok: !x.codigo, error: x.codigo, esperado: it.frases.filter(function (y) { return !y.codigo; })[0].texto, respuesta: x.texto, forma: 'opcion', pista: x.codigo ? A.pista(x.codigo, it, { x: mix(it.esperado) }) : null });
          if (!x.codigo) { est.paso = 'fin'; api.render(); api.fin(1200); } else { b.classList.add('mal'); b.disabled = true; }
        }, 'texto');
      }
    }
  }

  FRUI.actividad({
    act: ACT, titulo: '¿Cuánto falta?', version: VERSION, nivelMax: 3, moduloAct: 'cuanto-falta',
    tamRonda: A.ronda, tipos: A.tipos, secuencia: A.secuencia, generar: A.generar,
    deModulo: function (e, az, nivel) { var f = A.armar[e.tipo]; if (!f) return null; var it = f(e.params, Math.max(2, nivel), az); if (it) it.modulo = e.id; return it; },
    pintar: pintar,
    meperdi: function (it, api) {
      api.est.tiras = true; api.est.tira = true; api.render();
      api.pista(it.tipo === 'S4' ? 'Leé la pregunta otra vez: ¿qué quieren saber y cuál es el entero?' : (it.a && it.b && it.a.d !== it.b.d ? 'Pasá todo a ' + A.PARTES_NOMBRE[FR.mcm(it.a.d, it.b.d)] + ' y contá las partes.' : 'Mirá las tiras y contá las partes que faltan.'));
    },
    textoPaso: function (it, api) { return TEXTO_PASO[api.est.paso] || 'seguir'; },
    esperado: function (it, api) { return api.est.paso === 'pasar' ? FR.aDenominador(it.conv === 'a' ? it.a : it.b, it.D) : it.esperado; },
    aprendiste: G.APRENDISTE['cuanto-falta']
  });
})();
