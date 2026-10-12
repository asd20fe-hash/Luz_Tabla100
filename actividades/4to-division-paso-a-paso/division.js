/* División paso a paso — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.1  (2026-10-12) Textos
     + "Casillero" en vez de "casita" para el lugar del cociente.
   v1.0.0  (2026-10-11) Primera versión
     + Cuaderno cuadriculado con galera, casillero, restas escritas y flechas de bajada.
     + 4 niveles (con todo a la vista → como en la carpeta), rondas de 2 cuentas (1 en el nivel 4).
     + Pasos de control: factor, casillero, resto menor que el divisor, bajar una sola cifra, cero.
     + Estimación de cifras del cociente y verificación (niveles 3 y 4).
     + Registro de eventos, progresión automática de nivel, ?debug=1 y ?seed=N.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.1', ACT = '4to-division-paso-a-paso', TITULO = 'División paso a paso';
  var CONTROLES = ['RESTO_MAYOR', 'CONTROL', 'ESTIMACION', 'VERIFICACION'];
  var MO = REF4_DIVMOTOR, DIV = REF4_DIV, UI = REF4_UI, $ = UI.$;

  var ctx = UI.base({ act: ACT, titulo: TITULO, version: VERSION, nivelMax: 4 });
  if (!ctx) return;
  var app = $('#app'), teclado = null, vigia = null;

  var R = null;            // estado de la ronda
  var sesionDiv = { usados: {}, cuadernoUsado: false };
  var NOMBRE_PASO = { tabla: 'completar la tabla', estimacion: 'estimar las cifras', parcial: 'elegir las cifras', factor: '¿cuántas veces entra?', casita: 'anotar en el casillero',
                      producto: 'multiplicar', resta: 'restar', control: 'comparar el resto', bajar: 'bajar una cifra', fin: 'terminar la cuenta', verificacion: 'verificar', revision: 'revisar' };

  /* ---------- ronda ---------- */
  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(4, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    R = { nivel: nivel, total: nivel === 4 ? 1 : 2, idx: 0, cont: UI.contador(), M: null, buf: UI.entrada(5), ayuda: 'ninguna', tPaso: Date.now(),
          marca: null, resaltar: null, barra: nivel <= 2, hecha: false };
    nuevaCuenta();
  }
  function nuevaCuenta() {
    var g = DIV.generar(R.nivel, ctx.az, sesionDiv);
    if (g.relajado.length) ctx.log('restricción relajada', g.relajado.join(', '));
    R.M = MO.crear({ dividendo: g.dividendo, divisor: g.divisor, nivel: R.nivel, az: ctx.az });
    R.hecha = false; R.marca = null; R.resaltar = null; R.buf.limpiar(); R.ayuda = 'ninguna'; R.tPaso = Date.now(); R.corregir = null;
    UI.globo(null); render();
  }

  /* ---------- dibujo ---------- */
  function render() {
    var M = R.M, out = MO.derivar(M), a = out.actual, nv = M.sim.vueltas.length;
    var vi = a && a.vuelta !== null ? a.vuelta + 1 : nv;
    app.innerHTML =
      UI.progreso(R.total, R.idx) +
      '<div class="ref-panel">' +
        '<div class="div-cabecera"><span>Nivel ' + R.nivel + ' · Cuenta ' + (R.idx + 1) + ' de ' + R.total + '</span><span>' + (a && a.vuelta !== null ? 'Vuelta ' + vi + ' de ' + nv : '') + '</span></div>' +
        '<div class="pasos-barra" id="barra"' + (R.barra ? '' : ' hidden') + '></div>' +
        '<div id="cuaderno"></div>' +
        '<div class="ref-pregunta" id="pregunta" aria-live="polite"></div>' +
        '<div class="div-zona-control" id="control"></div>' +
        '<div class="ref-teclado" id="teclado" hidden></div>' +
        '<div class="div-acciones"><button class="ref-btn" id="b-pista">💡 Pista</button><button class="ref-btn" id="b-perdi">Me perdí</button></div>' +
      '</div>';
    pintar();
    $('#b-pista').onclick = function () { pedirAyuda(false); };
    $('#b-perdi').onclick = function () { pedirAyuda(true); };
    teclado = UI.teclado($('#teclado'), { digito: tecla, borrar: function () { R.buf.pop(); pintar(); }, ok: confirmar });
    $('#teclado').hidden = !usaTeclado(a);
    if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { var a2 = MO.derivar(R.M).actual; return a2 ? NOMBRE_PASO[a2.tipo] : 'seguir'; },
                                         elemento: function () { return document.querySelector('.cel.pulsa, .cel.slot, .ref-teclado button.ok, #control button'); } });
  }

  function usaTeclado(a) { return !!a && ['tabla', 'casita', 'factor', 'producto', 'resta', 'bajar', 'verificacion'].indexOf(a.tipo) >= 0; }

  // Redibuja el cuaderno y los controles del paso actual (sin reconstruir la página).
  function pintar() {
    var M = R.M, out = MO.derivar(M), a = out.actual;
    var v = MO.vista(M, R.buf.valor(), R.marca);
    if (R.marca && R.marca.tipo === 'casita') v.errCasita = R.marca.vuelta;
    if (R.resaltar) { var f = v.tabla[R.resaltar - 1]; if (f && f.estado === 'normal') f.estado = 'res'; }
    REF4_CUADERNO.dibujar($('#cuaderno'), v, { ancho: Math.min(app.clientWidth, 900) - 30, onCol: tocarCifra, onFila: tocarFila });
    // barra de pasos
    var barra = $('#barra'), idx = a && MO.BARRA[a.tipo] !== undefined ? MO.BARRA[a.tipo] : -1;
    barra.hidden = !R.barra;
    barra.innerHTML = MO.BARRA_NOMBRES.map(function (n, i) { return '<span class="' + (i === idx ? 'on' : '') + '">' + n + '</span>'; }).join('');
    $('#pregunta').textContent = R.hecha ? '' : MO.pregunta(M, out);
    // controles
    var c = $('#control'); c.innerHTML = '';
    if (R.hecha) {
      var s = M.sim;
      c.innerHTML = '<div class="div-fin">¡Cuenta terminada! ' + M.dividendo + ' : ' + M.d + ' = ' + s.cociente + (s.resto ? ' <small>y sobran ' + s.resto + '</small>' : ' <small>sin resto</small>') + '</div>' +
        '<button class="ref-btn main" id="b-sig">' + (R.idx + 1 < R.total ? 'Siguiente cuenta' : 'Terminar ronda') + '</button>';
      $('#b-sig').onclick = siguiente;
      $('#b-pista').disabled = $('#b-perdi').disabled = true; $('#teclado').hidden = true;
      return;
    }
    if (!a) return;
    if (a.tipo === 'control') {
      c.innerHTML = '<div class="ref-fila"><button class="ref-opcion" data-v="si">Sí</button><button class="ref-opcion" data-v="no">No</button></div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(b.dataset.v); };
    } else if (a.tipo === 'estimacion') {
      c.innerHTML = '<div class="ref-fila">' + [1, 2, 3, 4].map(function (n) { return '<button class="ref-opcion" data-v="' + n + '">' + n + (n === 1 ? ' cifra' : ' cifras') + '</button>'; }).join('') + '</div>';
      c.onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) enviar(+b.dataset.v); };
    } else if (a.tipo === 'fin') {
      c.innerHTML = '<button class="ref-btn main chico" id="b-fin">Terminé</button>';
      $('#b-fin').onclick = function () { enviar('terminar'); };
    } else if (a.tipo === 'revision') {
      c.innerHTML = R.corregir ? '<button class="ref-btn main chico" id="b-corr">Corregir desde acá</button>' : '<button class="ref-btn main chico" id="b-rev">Revisar mi cuenta</button>';
      if (R.corregir) $('#b-corr').onclick = corregir; else $('#b-rev').onclick = revisar;
    } else if (a.tipo === 'verificacion') {
      c.innerHTML = '<span class="ref-entrada" aria-live="polite">' + (R.buf.valor() || ' ') + '</span>';
    } else if (a.tipo === 'parcial') {
      c.innerHTML = '<small style="color:var(--muted)">Tocá la cifra donde termina lo que tomás.</small>';
    }
    if (ctx.debug) UI.debugSet(MO.descripcion(M));
  }

  /* ---------- entrada ---------- */
  function tecla(d) {
    var a = MO.derivar(R.M).actual; if (!a || R.hecha) return;
    R.buf.push(d); pintar();
    if (a.tipo === 'factor') confirmar();    // el factor es un solo dígito: se envía enseguida
  }
  function confirmar() {
    var a = MO.derivar(R.M).actual; if (!a || R.hecha) return;
    var n = R.buf.num(); if (n === null) return;
    if (a.tipo === 'bajar') enviar({ num: n }); else enviar(n);
  }
  function tocarCifra(col) {
    var a = MO.derivar(R.M).actual; if (!a) return;
    if (a.tipo === 'parcial') enviar(col + 1); else if (a.tipo === 'bajar') enviar({ col: col });
  }
  function tocarFila(q) { var a = MO.derivar(R.M).actual; if (a && a.tipo === 'factor') enviar(q); }

  function pedirAyuda(meperdi) {
    var a = MO.derivar(R.M).actual; if (!a) return;
    if (meperdi) { R.ayuda = 'me_perdi'; R.barra = true; }
    else if (R.ayuda !== 'me_perdi') R.ayuda = 'pista';
    UI.globo(MO.ayuda(R.M, meperdi), 'tip'); pintar();
  }

  function enviar(valor) {
    var a0 = MO.derivar(R.M).actual; if (!a0 || R.hecha) return;
    var ms = Date.now() - R.tPaso, res = MO.responder(R.M, valor);
    res.eventos.forEach(function (e) { e.ms = ms; e.ayuda = R.ayuda; ctx.reg.evento(e); R.cont.paso(e.intento, e.ok, e.error, CONTROLES); });
    R.buf.limpiar(); R.resaltar = res.resaltar || null; R.marca = null;
    if (res.silencioso) { R.tPaso = Date.now(); R.ayuda = 'ninguna'; UI.globo(null); }
    else if (res.ok) {
      UI.sonar('ok'); UI.globo(res.pista || null, res.pista ? 'ok' : null);
      if (!res.pista) UI.globo(null);
      R.tPaso = Date.now(); R.ayuda = 'ninguna';
    } else {
      UI.sonar('mal'); if (R.nivel === 3) R.barra = true;
      UI.globo(res.pista, 'mal');
      if (res.rebobinado) { R.tPaso = Date.now(); }
    }
    if (R.nivel === 1 || R.nivel === 2) if (!res.ok && !res.rebobinado) R.marca = null;
    if (res.terminada) return terminarCuenta();
    render();
  }

  /* ---------- nivel 4: revisar y corregir ---------- */
  function revisar() {
    var r = MO.revisar(R.M);
    if (r.ok) return terminarCuenta();
    var e = r.error; R.corregir = e; R.marca = e; R.barra = true;
    UI.sonar('mal'); UI.globo(e.pista || 'Revisá este paso.', 'mal'); render();
    $('#cuaderno').scrollIntoView({ block: 'nearest' });
  }
  function corregir() {
    MO.corregir(R.M, R.corregir.indice); R.corregir = null; R.marca = null; R.tPaso = Date.now(); render();
  }

  /* ---------- fin de cuenta y de ronda ---------- */
  function terminarCuenta() {
    R.hecha = true; R.marca = null; R.resaltar = null;
    UI.sonar('ok'); UI.celebrar(R.cont.pct() === 100 ? '¡Impecable, sin errores!' : null);
    render();
  }
  function siguiente() {
    if (R.idx + 1 < R.total) { R.idx++; nuevaCuenta(); return; }
    var pct = R.cont.pct(), antes = ctx.reg.estado().nivel;
    var r = ctx.reg.cerrarRonda(pct, Date.now() - R.cont.t0, R.cont.errorControl, ctx.nivelMax);
    UI.resumen({ estrellas: r.estrellas, pct: pct, extra: r.cambio === 1 ? '¡Subiste al nivel ' + r.nivel + '!' : (r.cambio === -1 ? 'Vamos a practicar un poco más el nivel ' + r.nivel + '.' : '') },
      function () { nuevaRonda(); }, function () { MATE.irMenu(); });
    if (r.cambio === 1) UI.sonar('sube');
  }

  /* ---------- gancho para pruebas con ?debug=1 ---------- */
  if (ctx.debug) window.__ref4 = { act: ACT, version: VERSION, estado: function () { return { nivel: R.nivel, paso: MO.descripcion(R.M), cuenta: [R.M.dividendo, R.M.d] }; },
    responder: enviar, motor: function () { return R.M; } };

  nuevaRonda();
  window.addEventListener('resize', function () { if (R && !R.hecha) pintar(); });
})();
