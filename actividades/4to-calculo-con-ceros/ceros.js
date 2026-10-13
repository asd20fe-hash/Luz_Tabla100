/* Cálculo con ceros — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.3  (2026-10-13) Teclado y correcciones
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.2  (2026-10-13) Fondos
     + Botón 🎨 para elegir el fondo (Aurora, Océano, Bosque, Atardecer, Espacio), el mismo de la Tabla del 100.
       Es global: se guarda en mate.global.fondo y lo comparten todas las actividades.
   v1.0.1  (2026-10-12) Teclado
     + Enter con una tecla del teclado en pantalla enfocada aprieta OK, no repite el número.
   v1.0.0  (2026-10-11) Primera versión
     + Cálculo mental registrando el paso del medio: descomponer y multiplicar (M1), compensación (M2),
       divisiones con ceros y la familia trampa 12 / 120 / 1.200 / 12.000 (M3) y suma en columna con reservas (M4).
     + 4 niveles: con ayuda → solo la respuesta con estimación previa; rondas de 6 ítems.
     + Clasifica los errores (ceros perdidos, mezcla de estrategias, mitad automática, reservas).
     + Registro de eventos, ?debug=1 y ?seed=N.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.3', ACT = '4to-calculo-con-ceros', TITULO = 'Cálculo con ceros';
  var UI = REF4_UI, CE = REF4_CEROS, $ = UI.$, esc = UI.esc, miles = UI.miles;
  var ctx = UI.base({ act: ACT, titulo: TITULO, version: VERSION, nivelMax: CE.MAX_NIVEL });
  if (!ctx) return;
  var app = $('#app'), vigia = null, R = null;

  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(CE.MAX_NIVEL, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    R = { nivel: nivel, total: CE.RONDA, idx: 0, cont: UI.contador(), termino: false };
    nuevoItem();
  }
  function nuevoItem() {
    R.it = CE.generar(R.nivel, ctx.az); R.pasos = CE.pasosDe(R.it, R.nivel); R.pi = 0; R.hechos = []; R.intento = 0; R.ayuda = 'ninguna';
    R.tPaso = Date.now(); R.buf = UI.entrada(7); R.medio = UI.entrada(7); R.campo = 'res'; R.ultimaPista = null; R.bloqueado = false; R.revelar = false;
    UI.globo(null); render();
  }
  function paso() { return R.pasos[R.pi]; }
  function itemInfo() {
    var it = R.it, o = { tipo: it.tipo };
    if (it.tipo === 'M3') { o.dividendo = it.D; o.divisor = it.d; } else if (it.tipo === 'M4') o.sumandos = it.nums; else { o.a = it.a; o.d = it.d; }
    var p = paso(); if (p && p.hecho) o.hecho = p.hecho;
    return o;
  }

  /* ---------- dibujo de la cuenta ---------- */
  function filaH(cls, izq, num, nota, slot) {
    return '<div class="cc-fila ' + (cls || '') + '">' + (izq ? '<span class="op">' + izq + '</span>' : '') + (slot ? '<span class="slot n">' + (slot === true ? ' ' : esc(slot)) + '</span>' : '<span class="n">' + esc(num) + '</span>') +
      (nota !== undefined ? '<span class="nota">' + nota + '</span>' : '') + '</div>';
  }
  function cuentaHTML() {
    var it = R.it, p = paso(), buf = R.buf.valor(), h = '';
    if (it.tipo === 'M1' && R.nivel <= 2) {
      h += filaH('', '', it.a) + filaH('', '×', it.d);
      h += '<div class="cc-fila linea"></div>';
      it.filas.forEach(function (f, i) {
        var hecha = R.hechos[(R.nivel === 2 ? 1 : 0) + i] !== undefined, activa = p && p.fila === i;
        var nota = (R.nivel === 1 || hecha || R.revelar) ? it.d + ' × ' + f.mult : '';
        if (R.nivel === 2 && R.pasos[0].id === 'cuantas' && R.hechos[0] === undefined) return;
        h += hecha ? filaH('ok', i ? '+' : '', f.parcial, nota) : (activa ? filaH('', i ? '+' : '', '', nota, buf || true) : filaH('', i ? '+' : '', ' ', nota));
      });
      var sumaHecha = R.hechos[R.pasos.length - 1] !== undefined;
      h += '<div class="cc-fila linea"></div>' + (sumaHecha ? filaH('ok', '', it.total) : (p && p.id === 'suma' ? filaH('', '', '', undefined, buf || true) : filaH('', '', ' ')));
    } else if (it.tipo === 'M1' || it.tipo === 'M2') {
      h += filaH('', '', it.a) + filaH('', '×', it.d) + '<div class="cc-fila linea"></div>' + filaH('', '', '?');
      if (it.tipo === 'M2' && R.nivel === 2) {
        h += '<div class="cc-fila"><span class="nota" style="border:0">' + it.a + ' = ' + it.redondo + ' ' + (it.delta < 0 ? '−' : '+') + ' 1</span></div>';
        if (R.hechos[0] !== undefined) h += '<div class="cc-fila"><span class="nota" style="border:0">' + it.d + ' × ' + it.redondo + ' = ' + it.p1 + '</span></div>';
        if (R.hechos[1] !== undefined) h += '<div class="cc-fila"><span class="nota" style="border:0">' + it.d + ' × 1 = ' + it.p2 + '</span></div>';
      }
    } else if (it.tipo === 'M3') {
      h += '<div class="cc-fila" style="justify-content:center">' + miles(it.D) + ' : ' + miles(it.d) + ' = ' + (R.hechos[0] !== undefined && R.pasos[0].id !== 'estimar' ? '<span class="n" style="color:var(--ok)">' + miles(it.q) + '</span>' : '?') + '</div>';
    } else if (it.tipo === 'M4') h = columnasHTML();
    return '<div class="cc-caja" id="cuenta" aria-label="La cuenta">' + h + '</div>';
  }
  function columnasHTML() {
    var it = R.it, p = paso(), cols = it.cols, g = '<div class="cc-col">';
    if (R.nivel > 1) { // nivel 4: solo la respuesta
      var f = function (n, op) { return '<span class="op">' + op + '</span>' + String(n).padStart(4, ' ').split('').map(function (ch) { return '<span>' + ch + '</span>'; }).join(''); };
      return '<div class="cc-fila">' + miles(it.nums[0]) + '</div><div class="cc-fila"><span class="op">+</span>' + miles(it.nums[1]) + '</div><div class="cc-fila"><span class="op">+</span>' + miles(it.nums[2]) + '</div><div class="cc-fila linea"><span class="n">?</span></div>';
    }
    var hecho = function (id) { var i = R.pasos.findIndex(function (x) { return x.id === id; }); return i >= 0 && R.hechos[i] !== undefined ? R.hechos[i] : undefined; };
    // fila de reservas (la reserva de la columna k se escribe arriba de la columna k+1)
    g += '<span></span>';
    for (var c = 3; c >= 0; c--) {
      var llev = c > 0 ? hecho('lleva' + (c - 1)) : undefined, act = p && p.fase === 'lleva' && p.col === c - 1;
      g += '<span class="carry' + (act ? ' slot' : '') + '">' + (act ? esc(R.buf.valor()) : (llev !== undefined && llev > 0 ? llev : '')) + '</span>';
    }
    for (var n = 0; n < 3; n++) {
      g += '<span class="op">' + (n ? '+' : '') + '</span>';
      for (var k = 3; k >= 0; k--) g += '<span>' + Math.floor(it.nums[n] / Math.pow(10, k)) % 10 + '</span>';
    }
    g += '<span class="raya"></span><span></span>';
    for (var c2 = 3; c2 >= 0; c2--) {
      var a = hecho('anoto' + c2), s = hecho('col' + c2), act2 = p && ((p.fase === 'anoto' && p.col === c2) || (p.fase === 'suma' && p.col === c2));
      var txt = c2 === 3 ? (s !== undefined ? String(s) : '') : (a !== undefined ? String(a) : '');
      g += '<span class="res' + (act2 ? ' slot' : '') + '">' + (act2 ? esc(R.buf.valor()) : txt) + '</span>';
    }
    return g + '</div>';
  }

  /* ---------- pantalla ---------- */
  function render() {
    var h = UI.progreso(R.total, R.idx) + '<div class="ref-panel"><div class="cc-cab"><span>Nivel ' + R.nivel + ' · Ítem ' + (R.idx + 1) + ' de ' + R.total + '</span></div>';
    h += '<div id="area"></div><div class="cc-ctrl" id="ctrl"></div><div class="ref-teclado" id="teclado" hidden></div>';
    h += '<div class="cc-acc"><button class="ref-btn" id="b-pista">💡 Pista</button><button class="ref-btn" id="b-perdi">Me perdí</button></div></div>';
    app.innerHTML = h;
    $('#b-pista').onclick = pista; $('#b-perdi').onclick = meperdi;
    pintar();
    if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { var p = paso(); return p ? p.label : 'seguir'; }, elemento: function () { return document.querySelector('#ctrl .ref-entrada, #ctrl button'); } });
    if (ctx.debug) UI.debugSet({ item: R.it.tipo, paso: paso() && paso().id, esperado: paso() && (paso().esp) });
  }

  function pintar() {
    var p = paso(), c = $('#ctrl'), tec = $('#teclado');
    $('#area').innerHTML = cuentaHTML();
    c.innerHTML = ''; c.onclick = null; tec.hidden = true;
    if (!p) return;
    var lab = '<div class="ref-pregunta" id="pregunta" aria-live="polite">' + esc(p.label) + '</div>';
    if (p.kind === 'mm') {
      c.innerHTML = lab + '<div class="ref-fila"><button class="ref-opcion" data-v="mas">Más</button><button class="ref-opcion" data-v="menos">Menos</button></div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(b.dataset.v, b); };
    } else if (p.kind === 'cuantas') {
      c.innerHTML = lab + '<div class="ref-fila">' + p.opciones.map(function (n) { return '<button class="ref-opcion" data-v="' + n + '">' + n + ' filas</button>'; }).join('') + '</div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(+b.dataset.v, b); };
    } else {
      var campos = '<span class="cc-campo" data-campo="res">' + (p.opcional ? '<small>Resultado</small>' : '') + '<span class="ref-entrada' + (R.campo === 'res' ? '' : ' off') + '" id="entrada" aria-live="polite">' + (R.buf.valor() || ' ') + '</span></span>';
      if (p.opcional) campos = '<span class="cc-campo" data-campo="medio"><small>' + esc(p.opcional.label) + '</small><span class="ref-entrada' + (R.campo === 'medio' ? '' : ' off') + '" id="entrada-medio">' + (R.medio.valor() || ' ') + '</span></span>' + campos;
      c.innerHTML = lab + '<div class="cc-campos">' + campos + '</div>';
      c.onclick = function (e) { var f = e.target.closest('[data-campo]'); if (f) { R.campo = f.dataset.campo; pintar(); } };
      tec.hidden = false;
      var cur = function () { return R.campo === 'medio' && p.opcional ? R.medio : R.buf; };
      var refrescar = function () { var a = $('#entrada'), m = $('#entrada-medio'); if (a) a.textContent = R.buf.valor() || ' '; if (m) m.textContent = R.medio.valor() || ' '; var cc = $('#cuenta'); if (cc && (R.it.tipo === 'M4' || R.it.tipo === 'M1')) cc.outerHTML = cuentaHTML(); };
      UI.teclado(tec, { digito: function (d) { cur().push(d); refrescar(); }, borrar: function () { cur().pop(); refrescar(); },
        ok: function () { var n = R.buf.num(); if (n === null) { if (p.opcional && R.campo === 'medio') { R.campo = 'res'; pintar(); } return; } enviar(n, null); } });
    }
  }

  /* ---------- respuestas ---------- */
  function enviar(valor, boton) {
    var p = paso(); if (!p || R.bloqueado || R.termino) return;
    var v = p.validar(valor); R.intento++;
    var ev = { tipo: 'paso', paso: p.id, intento: R.intento, item: itemInfo(), esperado: String(p.esp), respuesta: String(valor), ok: v.ok, error: v.codigo, ms: Date.now() - R.tPaso, ayuda: R.ayuda };
    if (p.opcional) { var m = R.medio.num(); if (m !== null) { ev.usoPasoMedio = true; ev.medioOk = (m === p.opcional.esp); } }
    ctx.reg.evento(ev);
    R.cont.paso(R.intento, v.ok, v.codigo, CE.CONTROLES);
    if (v.ok) {
      UI.sonar('ok'); UI.globo(p.opcional && ev.usoPasoMedio && !ev.medioOk ? 'La respuesta está bien, pero revisá el paso del medio: ' + p.opcional.esp + '.' : null, ev.medioOk === false ? 'tip' : null);
      R.hechos[R.pi] = valor; R.pi++; R.intento = 0; R.ayuda = 'ninguna'; R.tPaso = Date.now(); R.buf.limpiar(); R.medio.limpiar(); R.campo = 'res'; R.ultimaPista = null; R.revelar = false;
      if (R.pi >= R.pasos.length) { R.bloqueado = true; pintar(); UI.celebrar(); setTimeout(siguiente, 900); } else pintar();
    } else {
      UI.sonar('mal'); R.ultimaPista = v.pista; UI.globo(v.pista, 'mal');
      R.buf.limpiar(); if (boton) { boton.classList.add('mal'); boton.disabled = true; } else pintar();
    }
  }
  function siguiente() {
    if (R.idx + 1 < R.total) { R.idx++; nuevoItem(); return; }
    R.termino = true;
    var pct = R.cont.pct(), r = ctx.reg.cerrarRonda(pct, Date.now() - R.cont.t0, R.cont.errorControl, ctx.nivelMax);
    UI.resumen({ estrellas: r.estrellas, pct: pct, extra: r.cambio === 1 ? '¡Subiste al nivel ' + r.nivel + '!' : '' }, nuevaRonda, function () { MATE.irMenu(); });
    if (r.cambio === 1) UI.sonar('sube');
  }

  /* ---------- ayudas ---------- */
  function ayudaTexto(explicita) {
    var it = R.it, p = paso(); if (!p) return '';
    if (p.id === 'estimar') return 'Redondeá los números para estimar: ¿más o menos que ' + miles(p.umbral) + '?';
    if (it.tipo === 'M1' && p.fila !== undefined) { var f = it.filas[p.fila]; return 'Hacé ' + it.d + ' × ' + f.dig + (f.k ? ' y agregá ' + (f.k === 1 ? 'un cero' : f.k + ' ceros') + '.' : '.'); }
    if (it.tipo === 'M2') return it.a + ' está cerca de ' + it.redondo + '. Hacé ' + it.d + ' × ' + it.redondo + ' y después ' + (it.delta < 0 ? 'sacá' : 'sumá') + ' ' + it.d + '.';
    if (it.tipo === 'M3') return p.id === 'comprobar' ? 'Multiplicá el resultado por el divisor: tiene que dar el dividendo.' : 'Dividí sin los ceros y después ponelos de nuevo. Comprobalo multiplicando.';
    if (it.tipo === 'M4') return 'Sumá la columna: anotás la cifra de las unidades y el resto te lo llevás a la columna que sigue.';
    return 'Hacé la cuenta con calma, de a una parte.';
  }
  function pista() { if (R.ayuda === 'ninguna') R.ayuda = 'pista'; UI.globo(R.ultimaPista || ayudaTexto(false), 'tip'); }
  function meperdi() { R.ayuda = 'me_perdi'; R.revelar = true; pintar(); UI.globo(ayudaTexto(true), 'tip'); }

  if (ctx.debug) window.__ref4 = { act: ACT, version: VERSION, estado: function () { var p = paso(); return { nivel: R.nivel, tipo: R.it.tipo, paso: p && p.id, kind: p && p.kind, esperado: p && p.esp, opcional: p && p.opcional ? p.opcional.esp : null }; }, item: function () { return R.it; } };
  nuevaRonda();
})();
