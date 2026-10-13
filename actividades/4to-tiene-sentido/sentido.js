/* ¿Tiene sentido? — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.4  (2026-10-13) Teclado y correcciones
     + Teclado: S y N eligen Sí o No, las flechas ← → recorren las opciones y Enter elige.
   v1.0.3  (2026-10-13) Fondos
     + Botón 🎨 para elegir el fondo (Aurora, Océano, Bosque, Atardecer, Espacio), el mismo de la Tabla del 100.
       Es global: se guarda en mate.global.fondo y lo comparten todas las actividades.
   v1.0.2  (2026-10-12) Teclado
     + Enter con una tecla del teclado en pantalla enfocada aprieta OK, no repite el número.
   v1.0.1  (2026-10-12) Textos
     + "Casillero" en vez de "casita" para el lugar del cociente.
   v1.0.0  (2026-10-11) Primera versión
     + Control del resultado: estimar las cifras del cociente, detectar cuentas imposibles,
       verificar con cociente × divisor + resto y descubrir respuestas absurdas.
     + Cinco tipos de ítem (T1 a T5); T2 muestra la cuenta de la carpeta con un error plantado
       (cifra de más, resto mayor, tabla, registro del cociente, cero omitido) o sin error (30 %).
     + 3 niveles, rondas de 6 ítems, registro de eventos con el error plantado, ?debug=1 y ?seed=N.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.4', ACT = '4to-tiene-sentido', TITULO = '¿Tiene sentido?';
  var UI = REF4_UI, SE = REF4_SENTIDO, $ = UI.$, esc = UI.esc, miles = UI.miles;
  var ctx = UI.base({ act: ACT, titulo: TITULO, version: VERSION, nivelMax: SE.MAX_NIVEL });
  if (!ctx) return;
  var app = $('#app'), vigia = null, R = null, sesDiv = { usados: {}, cuadernoUsado: false };
  var NOMBRE = { estimar: 'elegir las cifras', veredicto: 'decidir si está bien', donde: 'tocar dónde está el error', motivo: 'elegir por qué', calculo: 'calcular', sino: 'decidir' };

  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(SE.MAX_NIVEL, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    R = { nivel: nivel, total: SE.RONDA, idx: 0, cont: UI.contador(), termino: false };
    nuevoItem();
  }
  function nuevoItem() {
    R.it = SE.generar(R.nivel, ctx.az, { div: sesDiv });
    R.pasos = SE.pasosDe(R.it); R.pi = 0; R.paso = R.pasos[0]; R.intento = 0; R.ayuda = 'ninguna'; R.tPaso = Date.now();
    R.buf = UI.entrada(7); R.ultimaPista = null; R.escalera = R.nivel === 1; R.errorMarcado = null; R.bloqueado = false;
    UI.globo(null); render();
  }
  function itemInfo() {
    var it = R.it, o = { tipo: it.tipo }, T = it;
    if (T.D !== undefined) { o.dividendo = T.D; o.divisor = T.d; }
    if (it.tipo === 'T2') o.errorPlantado = it.error ? it.error.tipo : null;
    return o;
  }

  function render() {
    var it = R.it;
    var h = UI.progreso(R.total, R.idx) + '<div class="ref-panel"><div class="sen-cab"><span>Nivel ' + R.nivel + ' · Ítem ' + (R.idx + 1) + ' de ' + R.total + '</span></div>';
    h += '<div id="cuerpo"></div><div class="sen-ctrl" id="ctrl"></div><div class="ref-teclado" id="teclado" hidden></div>';
    h += '<div class="sen-acc">' + (R.nivel <= 2 ? '<button class="ref-btn" id="b-pista">💡 Pista</button><button class="ref-btn" id="b-perdi">Me perdí</button>' : '') + '</div></div>';
    app.innerHTML = h;
    var bp = $('#b-pista'); if (bp) bp.onclick = pista;
    var bm = $('#b-perdi'); if (bm) bm.onclick = meperdi;
    pintar();
    if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { return NOMBRE[R.paso] || 'seguir'; }, elemento: function () { return document.querySelector('#ctrl button, #ctrl .ref-entrada, .zona'); } });
    if (ctx.debug) UI.debugSet({ item: R.it.tipo, paso: R.paso, esperado: esperado() });
  }

  function textoItem() {
    var it = R.it;
    switch (it.tipo) {
      case 'T1': return '¿Cuántas cifras va a tener el cociente de <b>' + miles(it.D) + ' : ' + it.d + '</b>?';
      case 'T2': return '¿Puede ser? Mirá esta división: <b>' + miles(it.D) + ' : ' + it.d + '</b>';
      case 'T3': return 'Un chico dice que <b>' + miles(it.D) + ' : ' + it.d + ' = ' + miles(it.q) + '</b> y sobran <b>' + it.r + '</b>. Verificalo.';
      case 'T4': return esc(it.texto) + '<br><b>¿Puede ser?</b>';
      default: return 'Un chico dice que <b>' + miles(it.D) + ' : ' + it.d + ' = ' + miles(it.resp) + '</b>. ¿Puede ser?';
    }
  }

  function pintar() {
    var it = R.it, c = $('#ctrl'), cuerpo = $('#cuerpo'), tec = $('#teclado');
    var h = '<div class="sen-texto" id="enunciado">' + textoItem() + '</div>';
    if (it.tipo === 'T1' && R.escalera) h += '<div class="sen-escalera" aria-label="Escalera">' + it.escalera.map(function (x, i) { return '<span>' + it.d + ' × ' + Math.pow(10, i) + ' = ' + miles(x) + '</span>'; }).join('') + '</div>';
    if (it.tipo === 'T2') h += '<div id="cuenta-mini"></div>';
    cuerpo.innerHTML = h; c.innerHTML = ''; tec.hidden = true; c.onclick = null;
    if (it.tipo === 'T2') dibujarCuenta();
    switch (R.paso) {
      case 'estimar':
        c.innerHTML = '<div class="ref-fila">' + [1, 2, 3, 4].map(function (n) { return '<button class="ref-opcion" data-n="' + n + '">' + n + (n === 1 ? ' cifra' : ' cifras') + '</button>'; }).join('') + '</div>';
        c.onclick = function (e) { var b = e.target.closest('[data-n]'); if (b) responder(SE.validarT1(it, +b.dataset.n), b.dataset.n, it.correcta, b); };
        break;
      case 'veredicto':
        c.innerHTML = '<div class="ref-fila"><button class="ref-opcion" data-v="bien">Está bien</button><button class="ref-opcion" data-v="mal">Algo está mal</button></div>';
        c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) responder(SE.validarVeredicto(it, b.dataset.v), b.dataset.v, it.error ? 'mal' : 'bien', b); };
        break;
      case 'donde':
        c.innerHTML = '<div class="ref-pregunta">Tocá la parte de la cuenta donde está el error.</div>';
        break;
      case 'motivo':
        c.innerHTML = '<div class="ref-pregunta">¿Por qué está mal?</div><div class="sen-opciones">' + it.motivos.map(function (m, i) { return '<button class="ref-opcion texto" data-i="' + i + '">' + esc(m.t) + '</button>'; }).join('') + '</div>';
        c.onclick = function (e) { var b = e.target.closest('[data-i]'); if (b) responder(SE.validarMotivo(it, it.motivos[+b.dataset.i]), it.motivos[+b.dataset.i].t, it.error.motivo, b); };
        break;
      case 'calculo':
        c.innerHTML = '<div class="ref-pregunta">' + (it.tipo === 'T3' ? 'Calculá ' + miles(it.q) + ' × ' + it.d + ' + ' + it.r : 'Comprobalo: ' + miles(it.resp) + ' × ' + it.d) + '</div><span class="ref-entrada" id="entrada" aria-live="polite">' + (R.buf.valor() || ' ') + '</span>';
        tec.hidden = false;
        UI.teclado(tec, { digito: function (d) { R.buf.push(d); $('#entrada').textContent = R.buf.valor(); }, borrar: function () { R.buf.pop(); $('#entrada').textContent = R.buf.valor() || ' '; },
          ok: function () { var n = R.buf.num(); if (n === null) return; var esp = it.tipo === 'T3' ? it.esperadoCalculo : it.comprobar; if (!responder(SE.validarCalculo(it, n), String(n), String(esp))) { R.buf.limpiar(); var en = $('#entrada'); if (en) en.textContent = ' '; } } });
        break;
      case 'sino': {
        var si = it.tipo === 'T3' ? ['Sí, da ' + miles(it.D), 'No da'] : ['Sí, puede ser', 'No puede ser'];
        var verdad = it.tipo === 'T3' ? it.correcto : (it.tipo === 'T4' ? it.razonable : it.correcta);
        c.innerHTML = '<div class="ref-pregunta">' + (it.tipo === 'T3' ? '¿Da el dividendo?' : '¿Puede ser?') + '</div><div class="ref-fila"><button class="ref-opcion" data-s="1">' + si[0] + '</button><button class="ref-opcion" data-s="0">' + si[1] + '</button></div>';
        c.onclick = function (e) { var b = e.target.closest('[data-s]'); if (b) responder(SE.validarSiNo(it, b.dataset.s === '1'), b.dataset.s === '1' ? 'si' : 'no', verdad ? 'si' : 'no', b); };
        break;
      }
    }
  }

  function dibujarCuenta() {
    var it = R.it, v = JSON.parse(JSON.stringify(it.vista)), nv = v.vueltas.length;
    v.vueltas[nv - 1].final = true; v.igual = v.cociente; v.cocienteLen = Math.max(v.cociente.length, nv); v.totalVueltas = nv; v.zonas = true;
    v.marcas = { error: R.errorMarcado, sel: null };
    var enDonde = R.paso === 'donde';
    REF4_CUADERNO.dibujar($('#cuenta-mini'), v, { ancho: Math.min(app.clientWidth, 760) - 30, mini: false, onZona: enDonde ? tocarZona : null });
    if (!enDonde) $('#cuenta-mini').querySelectorAll('.zona').forEach(function (z) { z.remove(); });
  }
  function tocarZona(z) {
    if (R.paso !== 'donde') return;
    var v = SE.validarDonde(R.it, z);
    if (z === 'cuenta' || z === 'cociente' || z === 'resto' || z === 'tabla') responder(v, z, R.it.error.campo, null);
  }

  function esperado() {
    var it = R.it;
    switch (R.paso) {
      case 'estimar': return it.correcta;
      case 'veredicto': return it.error ? 'mal' : 'bien';
      case 'donde': return it.error && it.error.campo;
      case 'motivo': return it.error && it.error.motivo;
      case 'calculo': return it.tipo === 'T3' ? it.esperadoCalculo : it.comprobar;
      case 'sino': return it.tipo === 'T3' ? it.correcto : (it.tipo === 'T4' ? it.razonable : it.correcta);
    }
    return '';
  }

  // Registra el intento y avanza si estuvo bien. Devuelve true/false.
  function responder(v, respuesta, esp, boton) {
    if (R.termino || R.bloqueado) return false;
    R.intento++;
    ctx.reg.evento({ tipo: 'paso', paso: R.paso, intento: R.intento, item: itemInfo(), esperado: String(esp), respuesta: String(respuesta), ok: v.ok, error: v.codigo, ms: Date.now() - R.tPaso, ayuda: R.ayuda });
    R.cont.paso(R.intento, v.ok, v.codigo, SE.CONTROLES);
    if (v.ok) {
      UI.sonar('ok'); UI.globo(null);
      if (R.pi + 1 < R.pasos.length) { R.pi++; R.paso = R.pasos[R.pi]; R.intento = 0; R.ayuda = 'ninguna'; R.tPaso = Date.now(); R.ultimaPista = null; R.buf.limpiar(); pintar(); return true; }
      if (R.it.error) { R.errorMarcado = R.it.error.campo; if (R.it.tipo === 'T2') { R.paso = 'fin'; dibujarCuenta(); } }
      R.bloqueado = true; UI.celebrar(); setTimeout(siguiente, R.it.error ? 1100 : 250);
      return true;
    }
    UI.sonar('mal'); R.ultimaPista = v.pista;
    UI.globo(R.nivel === 3 ? 'Todavía no. Probá de nuevo.' : v.pista, 'mal');
    if (boton) { boton.classList.add('mal'); boton.disabled = true; }
    return false;
  }
  function siguiente() {
    if (R.idx + 1 < R.total) { R.idx++; nuevoItem(); return; }
    R.termino = true;
    var pct = R.cont.pct(), r = ctx.reg.cerrarRonda(pct, Date.now() - R.cont.t0, R.cont.errorControl, ctx.nivelMax);
    UI.resumen({ estrellas: r.estrellas, pct: pct, extra: r.cambio === 1 ? '¡Subiste al nivel ' + r.nivel + '!' : '' }, nuevaRonda, function () { MATE.irMenu(); });
    if (r.cambio === 1) UI.sonar('sube');
  }

  /* ---------- ayudas (niveles 1 y 2) ---------- */
  function pista() {
    if (R.ayuda === 'ninguna') R.ayuda = 'pista';
    var it = R.it, t = R.ultimaPista;
    if (!t) t = it.tipo === 'T1' ? SE.pistaT1(it) : (R.paso === 'donde' ? 'Mirá el cociente, la tabla y el último resto.' : (R.paso === 'motivo' ? 'Pensá qué hizo distinto de lo que se hace en cada vuelta.' : 'Hacé la cuenta con calma y fijate si cierra.'));
    UI.globo(t, 'tip');
  }
  function meperdi() {
    R.ayuda = 'me_perdi';
    if (R.it.tipo === 'T1' && !R.escalera) { R.escalera = true; pintar(); }
    pista();
  }

  if (ctx.debug) window.__ref4 = { act: ACT, version: VERSION, estado: function () { return { nivel: R.nivel, tipo: R.it.tipo, paso: R.paso, esperado: esperado() }; }, item: function () { return R.it; } };
  nuevaRonda();
})();
