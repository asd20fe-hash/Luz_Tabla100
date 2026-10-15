/* Escritura de 1ro — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.2  (2026-10-14) Fuegos encima de la pantalla
     + Los fuegos artificiales quedaban debajo del contenido (faltaba su estilo en 1ro); ahora se ven encima.
   v1.0.1  (2026-10-14) Fuegos artificiales
     + Cada palabra terminada (bien, corregida o copiada) tiene fuegos artificiales hasta tocar Siguiente.
   v1.0.0  (2026-10-14) Primera versión
     + Muestra un dibujo y Luz escribe la palabra con el teclado en pantalla (o el de la compu). MAYÚSCULAS o minúsculas
       con el botón ABC/abc (se guarda por perfil y queda en cada registro).
     + Al tocar una sílaba de lo que escribió, la voz dice cómo suena (si el sonido está prendido): así compara lo que
       escribió con lo que quería escribir. 🔊 dice la palabra entera.
     + Si se equivoca: marca las letras que no van y deja probar otra vez; al segundo error muestra el modelo para copiarlo.
     + Cada intento se registra con el tipo de error (R_RR, OMITE_TRABADA, B_V, H_MUDA…; ver _comun-1ro/lengua.js).
     + Repaso espaciado (REPASO1): las palabras que escribió mal vuelven seguido hasta que las aprende y después cada
       tanto, para ver si el error vuelve. 3 niveles (sube con 2 rondas ≥ 80 % al primer intento).
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.2', ACT = '1ro-escritura', TAM = 6;
  var L = LENGUA1, RP = REPASO1, UI = REF4_UI, esc = UI1.esc, T = UI1.txt;
  var ctx = UI1.base({ act: ACT, version: VERSION, titulo: 'Escribí lo que ves', alCambiarCaso: function () { render(); } });
  if (!ctx) return;
  var app = document.getElementById('app'), $ = function (s) { return app.querySelector(s); };
  var rep = ctx.store.get('repaso', null) || RP.vacio(), R = null;
  var porPalabra = {}; PALABRAS1.forEach(function (w) { porPalabra[w.p] = w; });

  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(3, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  // Ronda: palabras del nivel (y de los anteriores) con peso según el repaso; al menos 2 para repasar si hay.
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    var claves = PALABRAS1.filter(function (w) { return w.nivel === nivel || (w.nivel < nivel && RP.estado(rep.items[w.p]) !== 'bien'); }).map(function (w) { return w.p; });
    var pend = Object.keys(rep.items).filter(function (k) { var e = RP.estado(rep.items[k]); return porPalabra[k] && porPalabra[k].nivel <= nivel && (e === 'repaso' || e === 'persiste'); });
    pend.forEach(function (k) { if (claves.indexOf(k) < 0) claves.push(k); });
    if (ctx.debug && ctx.params.get('palabra')) claves = [ctx.params.get('palabra').toUpperCase()].concat(claves);
    var lista = RP.elegir(rep, claves, TAM, ctx.az, { minRepaso: 2 }).map(function (k) { return porPalabra[k]; }).filter(Boolean);
    R = { nivel: nivel, lista: lista, res: lista.map(function () { return null; }), idx: 0, t0r: Date.now(), aprendio: [], repasar: [] };
    nuevaPalabra();
  }
  function nuevaPalabra() {
    UI.fuegos.parar();
    var w = R.lista[R.idx];
    R.w = w; R.buf = ''; R.intento = 0; R.fase = 'escribe'; R.marcas = null; R.msg = ''; R.tipoMsg = ''; R.t0 = Date.now(); R.ayuda = {};
    ctx.log('palabra', w.p, 'nivel', w.nivel, 'repaso', RP.estado(rep.items[w.p]));
    render();
  }

  /* ---------- dibujo ---------- */
  function cajas() {
    var p = L.limpiar(R.w.p), b = R.buf, h = '', i, marcas = R.marcas;
    if (R.nivel === 1 || R.fase === 'copia') {
      var n = Math.max(p.length, b.length + (b.length < p.length ? 0 : 1));
      for (i = 0; i < n; i++) {
        var c = b[i], cls = c ? (marcas ? ' ' + (marcas[i] || '') : '') : ' vacia';
        if (i === b.length && R.fase !== 'ok') cls += ' cursor';
        h += '<span class="l1-caja l1-letra' + cls + '">' + (c ? esc(T(c)) : '·') + '</span>';
      }
      return '<div class="l1-cajas" aria-label="lo que escribiste: ' + esc(b) + '">' + h + '</div>';
    }
    for (i = 0; i < b.length; i++) h += '<span class="l1-caja l1-letra' + (marcas ? ' ' + (marcas[i] || '') : '') + '" style="min-width:0">' + esc(T(b[i])) + '</span>';
    return '<div class="l1-cajas l1-linea" aria-label="lo que escribiste: ' + esc(b) + '">' + h + (R.fase !== 'ok' ? '<span class="l1-caja cursor vacia" style="min-width:24px">·</span>' : '') + '</div>';
  }
  function render() {
    if (!R) return;
    var w = R.w, h = UI1.progreso(R.res, R.idx);
    h += '<div class="l1-panel"><div class="esc-dibujo" role="img" aria-label="dibujo">' + w.img + '</div>';
    h += '<div class="l1-fila">' + (UI1.hayVoz() ? '<button class="l1-btn" id="oir">🔊 ' + esc(UI1.frase('Escuchar')) + '</button>' : '') + '</div>';
    if (R.fase === 'copia' || (R.fase === 'ok' && R.intento > 0)) h += '<div class="esc-modelo">' + (R.fase === 'copia' ? '<small>' + esc(UI1.frase('Se escribe así:')) + '</small>' : '') + UI1.silabasHTML(w.p) + '</div>';
    h += cajas();
    if (R.buf && R.fase !== 'ok') h += UI1.silabasHTML(R.buf, UI1.frase('Tocá y escuchá lo que escribiste:'));
    h += '<div class="l1-msg ' + R.tipoMsg + '" role="status">' + esc(UI1.frase(R.msg)) + '</div>';
    h += R.fase === 'ok' ? '<div class="l1-fila"><button class="l1-btn main" id="sig">' + esc(UI1.frase(R.idx + 1 < R.lista.length ? 'Siguiente ▶' : 'Terminar ▶')) + '</button></div>' : '<div id="teclado"></div>';
    h += '</div>';
    app.innerHTML = h;
    var oir = $('#oir'); if (oir) oir.onclick = function () { if (UI1.hablar(w.p)) R.ayuda.voz = 1; };
    if (R.fase === 'ok') { $('#sig').onclick = siguiente; $('#sig').focus(); }
    else UI1.teclado($('#teclado'), { letra: letra, borrar: borrar, listo: listo });
    if (ctx.debug) { window.__esc = { R: R, rep: rep, listo: listo, escribir: function (s) { R.buf = L.limpiar(s); render(); } }; }
  }
  function letra(k) { if (R.buf.length >= 14) return; R.buf += k; R.marcas = null; R.msg = ''; render(); }
  function borrar() { R.buf = R.buf.slice(0, -1); R.marcas = null; R.msg = ''; render(); }

  /* ---------- corregir ---------- */
  function listo() {
    var w = R.w;
    if (!R.buf) { R.msg = 'Escribí la palabra con las letras.'; R.tipoMsg = ''; render(); return; }
    var c = L.elegirMejor([w.p].concat(w.alt), R.buf, { minus: UI1.caso() === 'minus' }), copia = R.fase === 'copia';
    if (!copia) R.intento++;
    var ayuda = Object.keys(R.ayuda).join('+') || 'ninguna';
    ctx.reg.evento({ tipo: 'paso', tema: 'escritura', paso: copia ? 'copia' : 'palabra', intento: copia ? 0 : R.intento, item: { palabra: w.p, img: w.img, nivel: w.nivel },
      esperado: c.forma, respuesta: R.buf, ok: c.ok, error: c.ok ? null : c.primario, errores: c.codigos, forma: UI1.caso(), ms: Date.now() - R.t0, ayuda: ayuda });
    R.t0 = Date.now();
    if (!copia && R.intento === 1) {
      var cambio = RP.registrar(rep, w.p, c.ok);
      if (cambio.despues === 'aprendido' && cambio.antes !== 'aprendido') R.aprendio.push(w.p);
      R.res[R.idx] = c.ok ? 'ok' : 'mal'; guardar();
    }
    if (c.ok) {
      UI.sonar('ok'); UI.fuegos.iniciar(); R.fase = 'ok'; R.marcas = null; R.tipoMsg = 'ok';
      R.msg = copia ? '¡Eso! Ahora ya la conocés.' : (R.intento === 1 ? '¡Muy bien! 🎉' : '¡Bien! La corregiste.');
    } else {
      UI.sonar('mal'); R.tipoMsg = 'mal';
      if (copia) { R.marcas = c.marcasRespuesta; R.msg = 'Mirá bien el modelo, letra por letra.'; }
      else if (R.intento === 1) {
        R.marcas = c.marcasRespuesta;
        var falta = /^(OMITE_|INCOMPLETA|H_MUDA|R_RR)/.test(c.primario) && L.limpiar(R.buf).length < L.limpiar(c.forma).length, sobra = c.primario === 'AGREGA_LETRA';
        R.msg = (c.primario === 'OTRA_PALABRA' ? 'Mirá bien el dibujo y escuchá la palabra.' : (falta ? 'Casi. Te falta alguna letra.' : (sobra ? 'Casi. Te sobra alguna letra.' : 'Casi. Las letras rojas no van así.'))) + ' Escuchá tus sílabas y probá otra vez.'; if (R.repasar.indexOf(w.p) < 0) R.repasar.push(w.p); }
      else { R.fase = 'copia'; R.buf = ''; R.marcas = null; R.msg = 'Se escribe así. Copiala.'; }
    }
    render();
  }
  function guardar() { try { ctx.store.set('repaso', rep); } catch (e) { ctx.log('no se pudo guardar el repaso'); } }
  function siguiente() {
    if (R.idx + 1 < R.lista.length) { R.idx++; nuevaPalabra(); return; }
    var ok1 = R.res.filter(function (r) { return r === 'ok'; }).length, pct = Math.round(100 * ok1 / R.lista.length);
    var r = ctx.reg.cerrarRonda(pct, Date.now() - R.t0r, false, 3);
    var lst = function (a) { return a.map(function (p) { return (porPalabra[p] ? porPalabra[p].img + ' ' : '') + esc(T(p)); }).join(', '); };
    var extra = '<p class="l1-letra" style="font-size:20px">' + esc(T(ok1 + ' de ' + R.lista.length + ' bien a la primera')) + '</p>' +
      (R.aprendio.length ? '<p class="l1-letra" style="font-size:20px">' + esc(T('¡Aprendiste! ')) + lst(R.aprendio) + '</p>' : '') +
      (R.repasar.length ? '<p class="l1-letra" style="font-size:20px">' + esc(T('Vamos a repasar: ')) + lst(R.repasar) + '</p>' : '') +
      (r.cambio === 1 ? '<p class="l1-letra" style="font-size:20px">' + esc(T('¡Subiste al nivel ' + r.nivel + '!')) + '</p>' : '');
    UI1.resumen({ estrellas: r.estrellas, extra: extra }, nuevaRonda);
  }

  UI1.conectarSilabas(app, function () { if (R) R.ayuda.silabas = 1; });
  nuevaRonda();
})();
