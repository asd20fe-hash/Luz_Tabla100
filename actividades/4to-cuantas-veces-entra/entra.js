/* ¿Cuántas veces entra? — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.2  (2026-10-13) Fondos
     + Botón 🎨 para elegir el fondo (Aurora, Océano, Bosque, Atardecer, Espacio), el mismo de la Tabla del 100.
       Es global: se guarda en mate.global.fondo y lo comparten todas las actividades.
   v1.0.1  (2026-10-12) Teclado
     + Enter con una tecla del teclado en pantalla enfocada aprieta OK, no repite el número.
   v1.0.0  (2026-10-11) Primera versión
     + Tablas al revés: dados d y n, hallar cuántas veces entra y cuánto sobra.
     + Tres tipos de ítem: A (escribir), B (elegir el producto vecino) y C (verdadero o falso).
     + 4 niveles: escalera visible → sin tabla → récord personal de tiempo (sin penalizar).
     + Los hechos con más fallas o más lentos aparecen más seguido (últimos 14 días).
     + Registro de eventos con la dirección del error, ?debug=1 y ?seed=N.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.2', ACT = '4to-cuantas-veces-entra', TITULO = '¿Cuántas veces entra?';
  var UI = REF4_UI, EN = REF4_ENTRA, $ = UI.$;
  var ctx = UI.base({ act: ACT, titulo: TITULO, version: VERSION, nivelMax: 4 });
  if (!ctx) return;
  var app = $('#app'), vigia = null, R = null;

  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(4, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    R = { nivel: nivel, total: EN.RONDA[nivel], idx: 0, cont: UI.contador(), pesos: REF4_EV.pesosHechos(ctx.reg.eventos(), Date.now()),
          ultimo: null, it: null, paso: null, intento: 0, buf: UI.entrada(2), ayuda: 'ninguna', tPaso: 0, verTabla: nivel === 1, termino: false };
    siguienteItem();
  }
  function siguienteItem() {
    R.it = EN.generar(R.nivel, ctx.az, R.pesos, R.ultimo); R.ultimo = R.it.hecho;
    R.pasos = EN.pasosDe(R.it); R.pi = 0; R.paso = R.pasos[0]; R.intento = 0;
    R.verTabla = R.nivel === 1; R.ayuda = 'ninguna'; R.buf.limpiar(); R.tPaso = Date.now();
    UI.globo(null); render();
  }

  function esc(it) {
    var h = '', marcado = false;
    EN.escalera(it).forEach(function (e) {
      if (it.n !== undefined && !marcado && e.p > it.n) { h += '<span class="esc-n" aria-label="el número ' + it.n + '">' + it.n + ' ▸</span>'; marcado = true; }
      h += '<button class="esc' + (it.tipo === 'A' && R.paso === 'q' ? ' tap' : '') + '" data-k="' + e.k + '" aria-label="' + it.d + ' por ' + e.k + ' igual ' + e.p + '"><small>×' + e.k + '</small><b>' + e.p + '</b></button>';
    });
    if (it.n !== undefined && !marcado) h += '<span class="esc-n">' + it.n + ' ▸</span>';
    return '<div class="escalera" id="escalera" role="group" aria-label="Tabla del ' + it.d + '">' + h + '</div>';
  }

  function render() {
    var it = R.it, record = ctx.store.get('record', null);
    var h = UI.progreso(R.total, R.idx) + '<div class="ref-panel"><div class="ent-cab"><span>Nivel ' + R.nivel + ' · Ejercicio ' + (R.idx + 1) + ' de ' + R.total + '</span>' +
      (R.nivel === 4 && record ? '<span class="ent-record">Récord: ' + fmtTiempo(record) + '</span>' : '') + '</div>';
    if (R.verTabla) h += esc(it);
    h += '<div class="ref-pregunta" id="pregunta" aria-live="polite">' + UI.esc(EN.pregunta(it, R.paso)) + '</div><div class="ent-ctrl" id="ctrl"></div>';
    h += '<div class="ref-teclado" id="teclado" hidden></div>';
    h += '<div class="ent-acciones"><button class="ref-btn" id="b-pista">💡 Pista</button>' +
         (R.nivel === 1 ? '' : '<button class="ref-btn" id="b-perdi">' + (R.nivel === 2 ? 'Ver tabla' : 'Me perdí') + '</button>') + '</div></div>';
    app.innerHTML = h;
    var c = $('#ctrl');
    if (it.tipo === 'B') {
      c.innerHTML = '<div class="ref-fila">' + it.opciones.map(function (o) { return '<button class="ref-opcion" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(+b.dataset.v, b); };
    } else if (it.tipo === 'C') {
      c.innerHTML = '<div class="ref-fila"><button class="ref-opcion" data-v="1">Verdadero</button><button class="ref-opcion" data-v="0">Falso</button></div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(b.dataset.v === '1', b); };
    } else {
      c.innerHTML = '<span class="ref-entrada" id="entrada" aria-live="polite"> </span>';
      $('#teclado').hidden = false;
      UI.teclado($('#teclado'), { digito: function (d) { R.buf.push(d); $('#entrada').textContent = R.buf.valor(); }, borrar: function () { R.buf.pop(); $('#entrada').textContent = R.buf.valor() || ' '; },
        ok: function () { var n = R.buf.num(); if (n !== null) enviar(n); } });
    }
    var e = $('#escalera'); if (e) e.onclick = function (ev) { var b = ev.target.closest('.esc.tap'); if (b) enviar(+b.dataset.k); };
    $('#b-pista').onclick = function () { if (R.ayuda === 'ninguna') R.ayuda = 'pista'; UI.globo(EN.bloqueo(it), 'tip'); };
    var bp = $('#b-perdi'); if (bp) bp.onclick = function () { R.ayuda = R.nivel === 2 ? 'tabla' : 'me_perdi'; if (!R.verTabla) { R.verTabla = true; render(); } UI.globo(EN.bloqueo(it), 'tip'); };
    if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { return R.it ? EN.pregunta(R.it, R.paso).replace(/\s+/g, ' ') : 'seguir'; }, elemento: function () { return document.querySelector('#entrada, #ctrl .ref-opcion'); } });
    if (ctx.debug) UI.debugSet({ item: R.it, paso: R.paso, esperado: esperado() });
  }

  function esperado() {
    var it = R.it;
    if (R.paso === 'q') return it.q; if (R.paso === 'r') return it.r; if (it.tipo === 'B') return it.correcta; return it.verdadero;
  }
  function fmtTiempo(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  function enviar(valor, boton) {
    if (R.termino) return;
    var it = R.it, paso = R.paso, ms = Date.now() - R.tPaso, v = EN.validar(it, paso, valor);
    R.intento++;
    var item = { tipo: it.tipo, d: it.d, hecho: it.hecho };
    if (it.tipo === 'C') { item.k = it.k; item.p = it.p; } else { item.q = it.q; item.r = it.r; item.n = it.n; }
    var e = ctx.reg.evento({ tipo: 'paso', paso: paso, intento: R.intento, item: item, esperado: String(esperado()), respuesta: String(valor), ok: v.ok, error: v.codigo, dir: v.dir, ms: ms, ayuda: R.ayuda });
    R.cont.paso(R.intento, v.ok, v.codigo, []);
    if (v.ok) {
      UI.sonar('ok'); UI.globo(null);
      if (R.pi + 1 < R.pasos.length) { R.pi++; R.paso = R.pasos[R.pi]; R.intento = 0; R.tPaso = Date.now(); R.buf.limpiar(); R.ayuda = 'ninguna'; render(); return; }
      if (R.idx % 3 === 2) UI.celebrar();
      if (R.idx + 1 < R.total) { R.idx++; siguienteItem(); } else fin();
    } else {
      UI.sonar('mal'); UI.globo(v.pista, 'mal'); R.buf.limpiar();
      var en = $('#entrada'); if (en) en.textContent = ' ';
      if (boton) { boton.classList.add('mal'); boton.disabled = true; }
    }
  }

  function fin() {
    R.termino = true;
    var pct = R.cont.pct(), dur = Date.now() - R.cont.t0, extra = '';
    if (R.nivel === 4) {
      var rec = ctx.store.get('record', null);
      extra = 'Tu tiempo: ' + fmtTiempo(dur);
      if (pct >= 80 && (!rec || dur < rec)) { try { ctx.store.set('record', dur); } catch (e) { /* sin espacio */ } extra += rec ? ' · ¡Nuevo récord!' : ' · ¡Primer récord!'; }
      else if (rec) extra += ' · Récord: ' + fmtTiempo(rec);
    }
    var r = ctx.reg.cerrarRonda(pct, dur, R.cont.errorControl, ctx.nivelMax);
    if (r.cambio === 1) extra += (extra ? '<br>' : '') + '¡Subiste al nivel ' + r.nivel + '!';
    UI.resumen({ estrellas: r.estrellas, pct: pct, extra: extra }, nuevaRonda, function () { MATE.irMenu(); });
    if (r.cambio === 1) UI.sonar('sube');
  }

  if (ctx.debug) window.__ref4 = { act: ACT, version: VERSION, estado: function () { return { nivel: R.nivel, item: R.it, paso: R.paso, esperado: esperado() }; }, responder: enviar };
  nuevaRonda();
})();
