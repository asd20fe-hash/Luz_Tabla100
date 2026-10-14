/* Detective de problemas — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.5  (2026-10-14) Fuegos artificiales
     + Al terminar la ronda hay fuegos artificiales en el resumen, que siguen hasta tocar "Otra ronda" o "Salir".
   v1.0.4  (2026-10-13) Voz argentina
     + El 🔊 prefiere voz de Argentina, después Uruguay/Chile/resto de Latinoamérica; la de España queda última.
   v1.0.3  (2026-10-13) Teclado y correcciones
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.2  (2026-10-13) Fondos
     + Botón 🎨 para elegir el fondo (Aurora, Océano, Bosque, Atardecer, Espacio), el mismo de la Tabla del 100.
       Es global: se guarda en mate.global.fondo y lo comparten todas las actividades.
   v1.0.1  (2026-10-12) Teclado
     + Enter con una tecla del teclado en pantalla enfocada aprieta OK, no repite el número.
   v1.0.0  (2026-10-11) Primera versión
     + Problemas en mini-pasos: leer, ¿qué te pregunta?, datos, plan, cálculo, resto y respuesta.
     + 33 plantillas en 11 categorías (con trampas: palabra clave, dato implícito, dato de más, último paso).
     + Lectura en voz alta (Web Speech API, voz es-AR si hay), calculadora en pantalla en los niveles 3 y 4.
     + 4 niveles, rondas de 3 problemas (4 en el nivel 4), registro de eventos, ?debug=1 y ?seed=N.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.5', ACT = '4to-detective-problemas', TITULO = 'Detective de problemas';
  var UI = REF4_UI, DE = REF4_DETECTIVE, PR = REF4_PROBLEMAS, $ = UI.$, esc = UI.esc, miles = PR.miles;
  var ctx = UI.base({ act: ACT, titulo: TITULO, version: VERSION, nivelMax: 4 });
  if (!ctx) return;
  var app = $('#app'), vigia = null, R = null, voz = null;

  var NOMBRE = { leer: 'leer el problema', pregunta: 'elegir la pregunta', datos: 'marcar los datos', plan: 'armar el plan', calculo: 'calcular', resto: 'decidir qué hacer con lo que sobra', respuesta: 'responder' };
  var GENERAL = { pregunta: 'Leé la última oración otra vez. ¿Qué quieren saber?', datos: 'Pensá qué datos necesitás para contestar. Algunos no están escritos como número.',
    plan: '¿Se junta, se saca, se reparte o se repite? Fijate en lo que preguntan.', calculo: 'Podés usar la calculadora.', resto: 'Mirá la pregunta: ¿qué hacés con lo que sobra?',
    respuesta: 'La respuesta lleva el número y lo que cuenta (pesos, chicos, bolsitas…).' };

  /* ---------- voz ---------- */
  function elegirVoz() { return UI.elegirVoz(); } // Argentina primero, España al final
  if (window.speechSynthesis) { voz = elegirVoz(); speechSynthesis.onvoiceschanged = function () { voz = elegirVoz(); var b = $('#b-voz'); if (b) b.hidden = !voz; }; }
  function leerEnVoz() {
    if (!voz) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(DE.textoPlano(R.p)); u.voice = voz; u.lang = voz.lang; u.rate = 0.95; speechSynthesis.speak(u);
    ctx.reg.evento({ tipo: 'paso', paso: 'audio', intento: 0, ok: true, item: itemInfo(), ayuda: 'audio' });
  }

  /* ---------- ronda ---------- */
  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(4, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    R = { nivel: nivel, total: DE.RONDA[nivel], idx: 0, cont: UI.contador(), usadas: {}, termino: false };
    nuevoProblema();
  }
  function nuevoProblema() {
    R.p = DE.generar(R.nivel, ctx.az, R.usadas);
    R.paso = 'leer'; R.intento = 0; R.ayuda = 'ninguna'; R.tPaso = Date.now(); R.t0 = Date.now(); R.primerToque = true;
    R.marcados = []; R.plan = [{ op: '', args: ['', ''] }]; R.subrayar = R.nivel === 1; R.buf = UI.entrada(7); R.ultimaPista = null;
    R.opPregunta = DE.opcionesPregunta(R.p, ctx.az); R.opResto = R.p.resto ? DE.opcionesResto(ctx.az) : null;
    R.opResp = R.nivel < 4 ? DE.opcionesRespuesta(R.p, ctx.az) : null; R.unidades = DE.unidadesAbiertas(R.p, ctx.az); R.unidadSel = null; R.calc = false;
    UI.globo(null); render();
  }
  function pasosDe() { var s = ['leer', 'pregunta', 'datos', 'plan', 'calculo']; if (R.p.resto) s.push('resto'); s.push('respuesta'); return s; }
  function itemInfo() { return { plantilla: R.p.id, cat: R.p.cat, trampa: R.p.trampa }; }

  /* ---------- texto con datos tocables ---------- */
  function textoHTML() {
    var p = R.p, enDatos = R.paso === 'datos';
    function parte(x) {
      if (typeof x === 'string') return esc(x);
      var t = esc(p.datos[x.k].t), cls = 'tok';
      if (enDatos) { cls += ' tocable' + (R.marcados.indexOf(x.k) >= 0 ? ' sel' : ''); return '<span class="' + cls + '" role="button" tabindex="0" aria-pressed="' + (R.marcados.indexOf(x.k) >= 0) + '" data-k="' + x.k + '">' + t + '</span>'; }
      if (R.pasoIdx > 2) cls += p.datos[x.k].nec ? ' usado' : ' suelto';
      return '<span class="' + cls + '">' + t + '</span>';
    }
    var preg = p.pregunta.map(parte).join('');
    return p.partes.map(parte).join('') + (R.subrayar ? '<u>' + preg + '</u>' : preg);
  }

  function render() {
    var p = R.p, pasos = pasosDe(); R.pasoIdx = pasos.indexOf(R.paso);
    var h = UI.progreso(R.total, R.idx) + '<div class="ref-panel"><div class="det-cab"><span>Nivel ' + R.nivel + ' · Problema ' + (R.idx + 1) + ' de ' + R.total + '</span><span>Paso ' + (R.pasoIdx + 1) + ' de ' + pasos.length + ': ' + NOMBRE[R.paso] + '</span></div>';
    h += '<div class="det-texto" id="texto" aria-label="Enunciado">' + textoHTML() + '</div>';
    h += '<div class="det-paso" id="paso"></div>';
    h += '<div class="det-acc"><button class="ref-btn" id="b-voz"' + (voz ? '' : ' hidden') + '>🔊 Escuchar</button><button class="ref-btn" id="b-pista">💡 Pista</button><button class="ref-btn" id="b-perdi">Me perdí</button>' +
         ((R.nivel >= 3 && (R.paso === 'calculo' || R.paso === 'respuesta')) ? '<button class="ref-btn" id="b-calc">🧮 Calculadora</button>' : '') + '</div></div>';
    app.innerHTML = h;
    $('#b-voz').onclick = leerEnVoz;
    $('#b-pista').onclick = pedirPista; $('#b-perdi').onclick = meperdi;
    var bc = $('#b-calc'); if (bc) bc.onclick = function () { R.calc = !R.calc; render(); };
    $('#texto').onclick = function (e) { var t = e.target.closest('.tok.tocable'); if (t) alternarDato(t.dataset.k); };
    $('#texto').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { var t = e.target.closest('.tok.tocable'); if (t) { e.preventDefault(); alternarDato(t.dataset.k); } } };
    pintarPaso();
    if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { return NOMBRE[R.paso] || 'seguir'; }, elemento: function () { return document.querySelector('#paso button, #paso .ref-opcion, .tok.tocable'); } });
    if (ctx.debug) UI.debugSet({ plantilla: p.id, paso: R.paso, esperado: esperado(), plan: p.planes[0].map(function (s) { return s.op + '(' + s.args.join(',') + ')'; }) });
  }

  function esperado() {
    var p = R.p;
    switch (R.paso) {
      case 'pregunta': return p.op.ok;
      case 'datos': return Object.keys(p.datos).filter(function (k) { return p.datos[k].nec; });
      case 'plan': return p.planes[0];
      case 'calculo': return p.resultado;
      case 'resto': return p.resto && p.resto.tipo;
      case 'respuesta': return p.final.num + ' ' + p.final.unidad;
    }
    return '';
  }

  /* ---------- pasos ---------- */
  function pintarPaso() {
    var c = $('#paso'), p = R.p;
    if (R.paso === 'leer') {
      c.innerHTML = '<div class="ref-pregunta">Leé con calma todo el problema. <small>Después seguimos con las preguntas.</small></div><div class="ref-fila"><button class="ref-btn main chico" id="b-leido">Ya lo leí</button></div>';
      $('#b-leido').onclick = leido;
    } else if (R.paso === 'pregunta') {
      c.innerHTML = '<div class="ref-pregunta">¿Qué te pregunta?</div><div class="det-opciones">' + R.opPregunta.map(function (o, i) { return '<button class="ref-opcion texto" data-i="' + i + '">' + esc(o.t) + '</button>'; }).join('') + '</div>';
      c.onclick = function (e) { var b = e.target.closest('[data-i]'); if (b) elegirPregunta(+b.dataset.i, b); };
    } else if (R.paso === 'datos') {
      c.innerHTML = '<div class="ref-pregunta">Tocá los datos que vas a usar.<small>Marcá todos los que necesitás y ninguno de más.</small></div><div class="ref-fila"><button class="ref-btn main chico" id="b-datos">Listo, estos son</button></div>';
      c.onclick = null; $('#b-datos').onclick = confirmarDatos;
    } else if (R.paso === 'plan') pintarPlan(c);
    else if (R.paso === 'calculo') pintarCalculo(c);
    else if (R.paso === 'resto') {
      c.innerHTML = '<div class="ref-pregunta">¿Qué hacés con lo que sobra?</div><div class="det-opciones">' + R.opResto.map(function (o) { return '<button class="ref-opcion texto" data-id="' + o.id + '">' + o.t + '</button>'; }).join('') + '</div>';
      c.onclick = function (e) { var b = e.target.closest('[data-id]'); if (b) responderResto(b.dataset.id, b); };
    } else if (R.paso === 'respuesta') pintarRespuesta(c);
  }

  function leido() {
    var ms = Date.now() - R.tPaso, pal = DE.palabras(R.p);
    var e = { tipo: 'paso', paso: 'leer', intento: 0, ok: true, item: itemInfo(), lecturaMs: ms, ms: ms, ayuda: R.ayuda };
    if (ms < 4000 && pal > 25) e.lectura_rapida = true;
    ctx.reg.evento(e);
    avanzar();
  }
  function avanzar() {
    var pasos = pasosDe(), i = pasos.indexOf(R.paso);
    if (i + 1 >= pasos.length) return terminarProblema();
    R.paso = pasos[i + 1]; R.intento = 0; R.tPaso = Date.now(); R.ayuda = 'ninguna'; R.ultimaPista = null; R.buf.limpiar(); UI.globo(null); render();
  }

  // Registra un intento de un mini-paso; devuelve true si salió bien.
  function validar(v, respuesta, esp) {
    R.intento++;
    ctx.reg.evento({ tipo: 'paso', paso: R.paso, intento: R.intento, item: itemInfo(), esperado: typeof esp === 'string' ? esp : JSON.stringify(esp), respuesta: typeof respuesta === 'string' ? respuesta : JSON.stringify(respuesta),
      ok: v.ok, error: v.codigo, ms: Date.now() - R.tPaso, ayuda: R.ayuda });
    R.cont.paso(R.intento, v.ok, v.codigo, []);
    if (v.ok) { UI.sonar('ok'); UI.globo(null); return true; }
    UI.sonar('mal'); R.ultimaPista = v.pista;
    UI.globo(R.nivel === 4 ? 'Todavía no. Revisalo con calma (podés pedir una pista).' : v.pista, 'mal');
    return false;
  }

  function elegirPregunta(i, boton) {
    var o = R.opPregunta[i], v = DE.validarPregunta(R.p, o);
    if (validar(v, o.t, R.p.op.ok)) avanzar(); else { boton.classList.add('mal'); boton.disabled = true; }
  }
  function alternarDato(k) {
    var i = R.marcados.indexOf(k); if (i >= 0) R.marcados.splice(i, 1); else R.marcados.push(k);
    $('#texto').innerHTML = textoHTML();
  }
  function confirmarDatos() {
    var v = DE.validarDatos(R.p, R.marcados);
    if (validar(v, R.marcados.slice(), esperado())) avanzar();
  }

  /* plan */
  function etiqueta(k) { var d = R.p.datos[k]; return d.etq || d.t; }
  function opcionesOperando(fila) {
    var o = R.marcados.map(function (k) { return { v: k, t: etiqueta(k) }; });
    for (var i = 0; i < fila; i++) o.push({ v: 's' + (i + 1), t: 'lo que dio el paso ' + (i + 1) });
    return o;
  }
  function pintarPlan(c) {
    var h = '<div class="ref-pregunta">Armá el plan.<small>Cada paso es una cuenta con los datos que marcaste.</small></div><div class="det-plan" id="plan">';
    R.plan.forEach(function (st, i) {
      var ops = opcionesOperando(i);
      h += '<div class="fila" data-f="' + i + '"><b>Paso ' + (i + 1) + '</b>';
      st.args.forEach(function (a, j) {
        if (j === 1) h += '<select class="ref-sel" data-op="1" aria-label="operación del paso ' + (i + 1) + '"><option value="">?</option>' + DE.OPS.map(function (o) { return '<option value="' + o + '"' + (st.op === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>';
        else if (j > 1) h += '<b style="min-width:0">' + esc(st.op || '?') + '</b>';
        h += '<select class="ref-sel" data-a="' + j + '" aria-label="número ' + (j + 1) + ' del paso ' + (i + 1) + '"><option value="">…</option>' + ops.map(function (o) { return '<option value="' + o.v + '"' + (a === o.v ? ' selected' : '') + '>' + esc(o.t) + '</option>'; }).join('') + '</select>';
      });
      if ((st.op === '+' || st.op === '×') && st.args.length < 3) h += '<button class="ref-btn chico" data-mas="1">+ otro número</button>';
      h += '</div>';
    });
    h += '</div><div class="ref-fila">' + (R.plan.length < 3 ? '<button class="ref-btn" id="b-addp">+ Agregar paso</button>' : '') + (R.plan.length > 1 ? '<button class="ref-btn" id="b-delp">Quitar paso</button>' : '') + '<button class="ref-btn main chico" id="b-plan">Listo, este es mi plan</button></div>';
    c.innerHTML = h; c.onclick = null;
    c.onchange = function (e) {
      var f = e.target.closest('.fila'); if (!f) return; var st = R.plan[+f.dataset.f];
      if (e.target.dataset.op) { st.op = e.target.value; if ((st.op === '−' || st.op === ':') && st.args.length > 2) st.args.length = 2; pintarPlan(c); }
      else if (e.target.dataset.a !== undefined) st.args[+e.target.dataset.a] = e.target.value;
    };
    c.querySelectorAll('[data-mas]').forEach(function (b) { b.onclick = function () { R.plan[+b.closest('.fila').dataset.f].args.push(''); pintarPlan(c); }; });
    var a = $('#b-addp'); if (a) a.onclick = function () { R.plan.push({ op: '', args: ['', ''] }); pintarPlan(c); };
    var d = $('#b-delp'); if (d) d.onclick = function () { R.plan.pop(); pintarPlan(c); };
    $('#b-plan').onclick = function () {
      var v = DE.validarPlan(R.p, R.plan);
      if (validar(v, JSON.parse(JSON.stringify(R.plan)), R.p.planes[0])) avanzar();
    };
  }

  /* cálculo */
  function valDe(ref, vals) { return /^s\d$/.test(ref) ? vals[+ref.slice(1) - 1] : R.p.datos[ref].v; }
  function cuentasPlan() {
    var vals = [], restos = [], p = R.p, plan = p.planes[0];
    return plan.map(function (st, i) {
      var a = st.args.map(function (r) { return valDe(r, p.vals); });
      var res = p.vals[i]; vals.push(res);
      return a.map(miles).join(' ' + st.op + ' ') + ' = ' + miles(res) + (st.op === ':' && p.restos[i] ? ' <small>(sobran ' + miles(p.restos[i]) + ')</small>' : '');
    });
  }
  function pintarCalculo(c) {
    if (R.nivel <= 2) {
      c.innerHTML = '<div class="ref-pregunta">Hacemos las cuentas del plan.</div><div class="det-cuentas">' + cuentasPlan().join('<br>') + '</div><div class="ref-fila"><button class="ref-btn main chico" id="b-sigue">Seguir</button></div>';
      c.onclick = null; $('#b-sigue').onclick = function () { ctx.reg.evento({ tipo: 'paso', paso: 'calculo', intento: 0, ok: true, item: itemInfo(), ms: Date.now() - R.tPaso, ayuda: R.ayuda }); avanzar(); };
      return;
    }
    c.innerHTML = '<div class="ref-pregunta">Hacé las cuentas de tu plan.<small>¿Cuánto da el último paso?</small></div><div style="text-align:center"><span class="ref-entrada" id="entrada">' + (R.buf.valor() || ' ') + '</span></div><div class="ref-teclado" id="teclado"></div>' + (R.calc ? calcHTML() : '');
    c.onclick = null; tecladoNum(function (n) {
      var v = DE.validarCalculo(R.p, n);
      if (validar(v, String(n), String(R.p.resultado))) {
        if (R.p.resto && R.p.restos[R.p.restos.length - 1]) UI.globo('Da ' + miles(R.p.resultado) + ' y sobran ' + miles(R.p.restos[R.p.restos.length - 1]) + '.', 'ok');
        avanzar();
      } else { R.buf.limpiar(); $('#entrada').textContent = ' '; }
    });
    if (R.calc) activarCalc();
  }
  function tecladoNum(alOk) {
    UI.teclado($('#teclado'), { digito: function (d) { R.buf.push(d); $('#entrada').textContent = R.buf.valor(); }, borrar: function () { R.buf.pop(); $('#entrada').textContent = R.buf.valor() || ' '; },
      ok: function () { var n = R.buf.num(); if (n !== null) alOk(n); } });
  }

  /* resto y respuesta */
  function responderResto(id, boton) {
    var v = DE.validarResto(R.p, id);
    if (validar(v, id, R.p.resto.tipo)) avanzar(); else { boton.classList.add('mal'); boton.disabled = true; }
  }
  function pintarRespuesta(c) {
    if (R.nivel < 4) {
      c.innerHTML = '<div class="ref-pregunta">¿Cuál es la respuesta?</div><div class="det-opciones">' + R.opResp.map(function (o, i) { return '<button class="ref-opcion texto" data-i="' + i + '">' + esc(o.t) + '</button>'; }).join('') + '</div>';
      c.onclick = function (e) {
        var b = e.target.closest('[data-i]'); if (!b) return; var o = R.opResp[+b.dataset.i];
        var v = o.ok ? { ok: true } : { ok: false, codigo: o.codigo, pista: DE.pistaRespuesta(R.p, o) };
        if (validar(v, o.t, R.p.final.num + ' ' + R.p.final.unidad)) avanzar(); else { b.classList.add('mal'); b.disabled = true; }
      };
    } else {
      c.innerHTML = '<div class="ref-pregunta">Escribí la respuesta: el número y qué es.</div><div style="text-align:center"><span class="ref-entrada" id="entrada">' + (R.buf.valor() || ' ') + '</span>' +
        '<div class="det-unidades" id="unidades">' + R.unidades.map(function (u) { return '<button class="ref-opcion' + (R.unidadSel === u ? ' sel' : '') + '" data-u="' + esc(u) + '">' + esc(u) + '</button>'; }).join('') + '</div></div><div class="ref-teclado" id="teclado"></div>' + (R.calc ? calcHTML() : '');
      c.onclick = function (e) { var b = e.target.closest('[data-u]'); if (b) { R.unidadSel = b.dataset.u; c.querySelectorAll('[data-u]').forEach(function (x) { x.classList.toggle('sel', x === b); }); } };
      tecladoNum(function (n) {
        if (!R.unidadSel) { UI.globo('Elegí también qué es: ¿pesos, chicos, bolsitas…?', 'tip'); return; }
        var v = DE.validarRespuestaAbierta(R.p, n, R.unidadSel);
        if (validar(v, n + ' ' + R.unidadSel, R.p.final.num + ' ' + R.p.final.unidad)) avanzar(); else { R.buf.limpiar(); $('#entrada').textContent = ' '; }
      });
      if (R.calc) activarCalc();
    }
  }

  /* calculadora en pantalla (niveles 3 y 4) */
  function calcHTML() {
    var t = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', 'C', '=', '+'];
    return '<div class="calc" id="calc"><div class="pant" id="cpant">0</div><div class="teclas">' + t.map(function (x) { return '<button data-c="' + x + '">' + x + '</button>'; }).join('') + '</div></div>';
  }
  function activarCalc() {
    var acc = null, op = null, cur = '', pant = $('#cpant');
    function fmtv(x) { return String(Math.round(x * 1000) / 1000); }
    function aplicar() { var b = parseFloat(cur || '0'); if (acc === null) acc = b; else if (op === '+') acc += b; else if (op === '−') acc -= b; else if (op === '×') acc *= b; else if (op === '÷') acc = b ? acc / b : 0; }
    $('#calc').onclick = function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return; var k = b.dataset.c;
      if (/\d/.test(k)) { cur += k; pant.textContent = cur; }
      else if (k === 'C') { acc = null; op = null; cur = ''; pant.textContent = '0'; }
      else if (k === '=') { if (op || cur) { aplicar(); pant.textContent = fmtv(acc); cur = ''; op = null; } }
      else { if (cur || acc !== null) { if (cur) aplicar(); op = k; cur = ''; pant.textContent = fmtv(acc); } }
    };
  }

  /* ---------- ayudas ---------- */
  function pedirPista() {
    if (R.ayuda === 'ninguna') R.ayuda = 'pista';
    UI.globo(R.ultimaPista || GENERAL[R.paso] || 'Leé de nuevo con calma, de a una oración.', 'tip');
  }
  function meperdi() {
    R.ayuda = 'me_perdi';
    if (!R.subrayar) { R.subrayar = true; $('#texto').innerHTML = textoHTML(); }
    UI.globo((GENERAL[R.paso] || 'Leé de nuevo con calma.') + ' (Te subrayé la pregunta.)', 'tip');
  }

  /* ---------- fin ---------- */
  function terminarProblema() {
    UI.celebrar();
    if (R.idx + 1 < R.total) { R.idx++; nuevoProblema(); return; }
    R.termino = true;
    var pct = R.cont.pct(), r = ctx.reg.cerrarRonda(pct, Date.now() - R.cont.t0, R.cont.errorControl, ctx.nivelMax);
    UI.resumen({ estrellas: r.estrellas, pct: pct, extra: r.cambio === 1 ? '¡Subiste al nivel ' + r.nivel + '!' : '' }, nuevaRonda, function () { MATE.irMenu(); });
    if (r.cambio === 1) UI.sonar('sube');
  }

  if (ctx.debug) window.__ref4 = { act: ACT, version: VERSION, estado: function () { return { nivel: R.nivel, plantilla: R.p.id, paso: R.paso, esperado: esperado() }; }, problema: function () { return R.p; },
    leido: leido, datos: function (ks) { R.marcados = ks; confirmarDatos(); }, plan: function (pl) { R.plan = pl; pintarPlan($('#paso')); $('#b-plan').click(); } };
  nuevaRonda();
})();
