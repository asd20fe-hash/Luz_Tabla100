/* Lectura de 1ro — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-14) Primera versión
     + Preguntas para leer (MAYÚSCULAS o minúsculas con el botón ABC/abc): contar en un dibujo, tocar en el dibujo,
       sí o no, y preguntas para contestar escribiendo ("¿EN QUÉ MES ESTAMOS?" → OCTUBRE).
     + Trampas para que lea y no memorice: con el mismo dibujo primero "¿CUÁNTOS PATITOS HAY?" y más adelante
       "¿CUÁNTOS TIENEN UN ALA LEVANTADA?"; "¿CUÁNTOS JUGUETES ROJOS?" y después "¿Y AZULES?".
     + Errores con nombre (CUENTA_TODOS = no leyó la condición, REPITE_ANTERIOR, LEE_OTRO, NO_LEE_COLOR…).
     + Repaso espaciado (REPASO1) por tipo de pregunta: lo que más erra aparece más seguido hasta que lo aprende.
     + La voz no lee la pregunta (es práctica de lectura): 🔊 aparece recién después de un error, como ayuda.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '1ro-lectura';
  var L = LENGUA1, LE = LECT1, RP = REPASO1, UI = REF4_UI, esc = UI1.esc, T = UI1.txt;
  var ctx = UI1.base({ act: ACT, version: VERSION, titulo: 'Leé y contestá', alCambiarCaso: function () { render(); } });
  if (!ctx) return;
  var app = document.getElementById('app'), $ = function (s) { return app.querySelector(s); };
  var rep = ctx.store.get('repaso', null) || RP.vacio(), R = null;
  var C = { fecha: new Date(), nombre: MATE.perfil().nombre };
  // Pregunta: en minúsculas, con mayúscula al principio (como en los libros).
  var TP = UI1.frase;

  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(3, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda() {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    var r = LE.armarRonda(nivel, ctx.az, rep, RP, C);
    r.dibujos.forEach(posiciones);
    R = { nivel: nivel, dibujos: r.dibujos, lista: r.preguntas, res: r.preguntas.map(function () { return null; }), idx: 0, anterior: {}, t0r: Date.now(), aprendio: [], repasar: [] };
    nuevaPregunta();
  }
  function nuevaPregunta() {
    R.p = R.lista[R.idx]; R.intento = 0; R.fase = 'responde'; R.msg = ''; R.tipoMsg = ''; R.t0 = Date.now(); R.ayuda = 'ninguna'; R.buf = ''; R.malos = []; R.resaltar = null; R.ortografia = null;
    ctx.log('pregunta', R.p.clave, R.p.texto, 'esperado', R.p.esperado === undefined ? R.p.validos : R.p.esperado);
    render();
  }

  /* ---------- dibujos (SVG) ---------- */
  // Lugar de cada objeto: patitos en el agua (izquierda) o en el pasto (derecha); juguetes en dos estantes.
  function posiciones(e) {
    if (e.tipo === 'patos') {
      var libres = { agua: [], pasto: [] };
      ['agua', 'pasto'].forEach(function (l, li) { for (var r = 0; r < 2; r++) for (var c = 0; c < 3; c++) libres[l].push([li * 210 + 42 + c * 64, 100 + r * 92]); libres[l] = ctx.az.mezclar(libres[l]); });
      e.objs.forEach(function (o) { o.pos = libres[o.lugar].shift(); });
    } else {
      var slots = []; for (var r2 = 0; r2 < 2; r2++) for (var c2 = 0; c2 < 5; c2++) slots.push([46 + c2 * 82, 96 + r2 * 108]);
      slots = ctx.az.mezclar(slots); e.objs.forEach(function (o) { o.pos = slots.shift(); });
    }
  }
  function pato(o) {
    var h = o.lugar === 'agua' ? '<path d="M-36 20 Q-18 13 0 20 T36 20" class="lec-onda"/>' : '<path d="M-6 19 v9 M6 19 v9" stroke="#ff8c1a" stroke-width="3.5" stroke-linecap="round"/>';
    h += '<path d="M-24 -2 L-39 -15 L-30 8 Z" fill="#f2c200" stroke="#b88a00" stroke-width="1.5"/><ellipse cx="0" cy="4" rx="28" ry="17" fill="#ffd23f" stroke="#b88a00" stroke-width="2"/>';
    h += o.ala === 'arriba' ? '<path d="M-14 -4 C-30 -34 -8 -44 6 -10 Z" fill="#f5c000" stroke="#b88a00" stroke-width="2"/>' : '<ellipse cx="-5" cy="7" rx="14" ry="8" fill="#f5c000" stroke="#b88a00" stroke-width="1.5"/>';
    h += '<circle cx="22" cy="-16" r="12" fill="#ffd23f" stroke="#b88a00" stroke-width="2"/><circle cx="26" cy="-19" r="2.5" fill="#222"/><path d="M33 -17 L46 -13 L33 -9 Z" fill="#ff8c1a" stroke="#c45f00" stroke-width="1"/>';
    if (o.gorro) h += '<path d="M13 -26 L22 -50 L31 -26 Z" fill="#e63946" stroke="#9b1c26" stroke-width="1.5"/><circle cx="22" cy="-51" r="4" fill="#fff" stroke="#9b1c26" stroke-width="1"/>';
    return '<g transform="scale(' + (o.dir * 0.72) + ',0.72)">' + h + '</g>';
  }
  function juguete(o) {
    var c = LE.COLORES[o.color].hex, h;
    if (o.tipo === 'pelota') h = '<circle r="21" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M-19 -5 Q0 -16 19 -5 M-15 12 Q0 2 15 12" stroke="#fff" stroke-width="3.5" fill="none" opacity=".85"/>';
    else if (o.tipo === 'auto') h = '<path d="M-17 -6 L-10 -21 L11 -21 L19 -6 Z" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="2"/><rect x="-30" y="-7" width="60" height="19" rx="6" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="2"/>' +
      '<rect x="-8" y="-18" width="8" height="9" fill="#cfe8ff"/><rect x="3" y="-18" width="8" height="9" fill="#cfe8ff"/><circle cx="-17" cy="14" r="7.5" fill="#222"/><circle cx="17" cy="14" r="7.5" fill="#222"/>';
    else h = '<path d="M-18 -14 L-9 -23 L27 -23 L18 -14 Z" fill="' + c + '" opacity=".75" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/><path d="M18 -14 L27 -23 L27 11 L18 20 Z" fill="' + c + '" opacity=".55" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>' +
      '<rect x="-18" y="-14" width="36" height="34" rx="2" fill="' + c + '" stroke="rgba(0,0,0,.35)" stroke-width="2"/>';
    return '<g transform="scale(1.05)">' + h + '</g>';
  }
  function dibujo(e, op) {
    var h = '<svg class="lec-svg" viewBox="0 0 420 260" role="img" aria-label="' + (e.tipo === 'patos' ? 'patitos en el agua y en el pasto' : 'juguetes en dos estantes') + '"><rect width="420" height="260" rx="18" class="lec-fondo"/>';
    if (e.tipo === 'patos') h += '<rect x="8" y="44" width="200" height="208" rx="40" class="lec-agua"/><rect x="214" y="44" width="198" height="208" rx="20" class="lec-pasto"/>';
    else h += '<rect x="10" y="128" width="400" height="8" rx="4" class="lec-estante"/><rect x="10" y="236" width="400" height="8" rx="4" class="lec-estante"/>';
    e.objs.forEach(function (o, i) {
      var cls = 'obj' + (op.tocable ? ' tocable' : '') + (op.resaltar && op.resaltar(o) ? ' resalta' : '') + (op.malos.indexOf(i) >= 0 ? ' malo' : '');
      h += '<g class="' + cls + '" data-o="' + i + '" transform="translate(' + o.pos[0] + ',' + o.pos[1] + ')"><rect x="-34" y="-46" width="68" height="80" fill="transparent"/>' + (e.tipo === 'patos' ? pato(o) : juguete(o)) + '</g>';
    });
    return h + '</svg>';
  }

  /* ---------- pantalla ---------- */
  function render() {
    if (!R) return;
    var p = R.p, d = p.dibujo !== undefined ? R.dibujos[p.dibujo] : null, h = UI1.progreso(R.res, R.idx);
    h += '<div class="l1-panel"><div class="l1-preg lec-preg">' + esc(TP(p.texto)) + '</div>';
    if (d) h += dibujo(d, { tocable: p.tipo === 'toca' && R.fase === 'responde', resaltar: R.resaltar, malos: R.malos });
    if (R.fase === 'responde') {
      if (p.tipo === 'contar') { h += '<div class="lec-nums">'; for (var n = 0; n <= 10; n++) h += '<button class="l1-tecla" data-n="' + n + '"' + (R.malos.indexOf('n' + n) >= 0 ? ' disabled' : '') + '>' + n + '</button>'; h += '</div>'; }
      else if (p.tipo === 'sino') h += '<div class="l1-fila"><button class="l1-btn lec-sino" data-sino="1"' + (R.malos.indexOf('s1') >= 0 ? ' disabled' : '') + '>' + esc(T('Sí')) + '</button><button class="l1-btn lec-sino" data-sino="0"' + (R.malos.indexOf('s0') >= 0 ? ' disabled' : '') + '>' + esc(T('No')) + '</button></div>';
      else if (p.tipo === 'escribir') {
        h += '<div class="l1-cajas l1-linea">' + R.buf.split('').map(function (c) { return '<span class="l1-caja l1-letra" style="min-width:0">' + esc(T(c)) + '</span>'; }).join('') + '<span class="l1-caja cursor vacia" style="min-width:24px">·</span></div>';
      }
    }
    if (R.fase !== 'responde' && p.tipo === 'escribir') h += '<div class="esc-modelo">' + UI1.silabasHTML(R.forma || p.validos[0]) + '</div>';
    h += '<div class="l1-msg ' + R.tipoMsg + '" role="status">' + esc(UI1.frase(R.msg)) + '</div>';
    if (R.intento > 0 && R.fase === 'responde' && UI1.hayVoz()) h += '<div class="l1-fila"><button class="l1-btn" id="oir">🔊 ' + esc(UI1.frase('Escuchar la pregunta')) + '</button></div>';
    if (R.fase !== 'responde') h += '<div class="l1-fila"><button class="l1-btn main" id="sig">' + esc(UI1.frase(R.idx + 1 < R.lista.length ? 'Siguiente ▶' : 'Terminar ▶')) + '</button></div>';
    else if (p.tipo === 'escribir') h += '<div id="teclado"></div>';
    h += '</div>';
    app.innerHTML = h;
    var oir = $('#oir'); if (oir) oir.onclick = function () { if (UI1.hablar(p.texto)) R.ayuda = 'voz'; };
    if (R.fase !== 'responde') { $('#sig').onclick = siguiente; $('#sig').focus(); return; }
    if (p.tipo === 'contar') app.querySelectorAll('[data-n]').forEach(function (b) { b.onclick = function () { responder(+b.dataset.n); }; });
    if (p.tipo === 'sino') app.querySelectorAll('[data-sino]').forEach(function (b) { b.onclick = function () { responder(b.dataset.sino === '1'); }; });
    if (p.tipo === 'toca') app.querySelectorAll('.obj').forEach(function (g) { g.addEventListener('click', function () { responder(+g.dataset.o); }); });
    if (p.tipo === 'escribir') UI1.teclado($('#teclado'), {
      letra: function (k) { if (R.buf.length < 14) { R.buf += k; R.msg = ''; render(); } }, borrar: function () { R.buf = R.buf.slice(0, -1); render(); },
      listo: function () { if (!R.buf) { R.msg = 'Escribí la respuesta.'; render(); return; } responder(R.buf); } }, { numeros: true });
    if (ctx.debug) window.__lec = { R: R, responder: responder, rep: rep };
  }
  document.addEventListener('keydown', function (e) {
    if (!R || R.fase !== 'responde' || document.querySelector('.l1-modal')) return;
    if (R.p.tipo === 'contar' && /^[0-9]$/.test(e.key)) responder(+e.key);
    if (R.p.tipo === 'sino' && /^[sn]$/i.test(e.key)) responder(e.key.toLowerCase() === 's');
  });

  var MSG = {
    CUENTA_TODOS: 'Esos son todos. Leé bien la pregunta: ¿cuáles hay que contar?', REPITE_ANTERIOR: 'Esa era la pregunta de antes. ¡Leé la nueva!',
    LEE_OTRO: 'Contaste otra cosa. Leé despacio qué hay que contar.', CUENTA_POR_UNO: 'Casi. Contá otra vez, tocando cada uno con el dedo.', CUENTA_MAL: 'Mirá otra vez y leé la pregunta.',
    NO_LEE_COLOR: 'Ese es de otro color. Leé otra vez.', NO_LEE_OBJETO: 'Ese no es el juguete que dice. Leé otra vez.', NO_LEE_ATRIBUTO: 'Ese patito no es. Leé otra vez qué tiene que tener.',
    TOCA_MAL: 'Ese no es. Leé otra vez.', SI_NO_MAL: 'Leé otra vez y mirá bien el dibujo.', NO_LEE_PREGUNTA: 'Esa es la respuesta de otra pregunta. Leé bien.', NO_COMPRENDE: 'Leé otra vez la pregunta, despacio.'
  };
  function responder(v) {
    var p = R.p, err = null, esperado, resp, extra = {};
    if (p.tipo === 'contar') { if (R.malos.indexOf('n' + v) >= 0) return; err = LE.errorConteo(p, v, R.intento === 0 ? R.anterior[p.dibujo] : undefined); esperado = String(p.esperado); resp = String(v); }
    else if (p.tipo === 'sino') { err = v === p.esperado ? null : 'SI_NO_MAL'; esperado = p.esperado ? 'SÍ' : 'NO'; resp = v ? 'SÍ' : 'NO'; }
    else if (p.tipo === 'toca') { var o = R.dibujos[p.dibujo].objs[v]; if (R.malos.indexOf(v) >= 0) return; err = LE.errorToca(p, o); esperado = p.param; resp = o.tipo ? o.tipo + ' ' + o.color : (o.gorro ? 'gorro ' : '') + 'ala ' + o.ala + ' ' + o.lugar; }
    else { var c = LE.corregirEscrita(L, p.clave, R.buf, C); err = c.ok ? null : c.error; esperado = c.forma; resp = R.buf; R.forma = c.forma; R.ortografia = c.ortografia; if (c.ortografia.length) extra.ortografia = c.ortografia; }
    R.intento++;
    var d = p.dibujo !== undefined ? R.dibujos[p.dibujo] : null;
    ctx.reg.evento(Object.assign({ tipo: 'paso', tema: 'lectura', paso: p.tipo, intento: R.intento, item: { clave: p.clave, texto: p.texto, param: p.param, dibujo: d ? d.tipo : null, cantidad: d ? d.objs.length : null },
      esperado: esperado, respuesta: resp, ok: !err, error: err, forma: UI1.caso(), ms: Date.now() - R.t0, ayuda: R.ayuda }, extra));
    R.t0 = Date.now();
    if (R.intento === 1) {
      if (p.tipo === 'contar') R.anterior[p.dibujo] = v;
      var cb = RP.registrar(rep, p.clave, !err);
      if (cb.despues === 'aprendido' && cb.antes !== 'aprendido') R.aprendio.push(p.clave);
      R.res[R.idx] = err ? 'mal' : 'ok'; try { ctx.store.set('repaso', rep); } catch (e2) { /* sin espacio */ }
    }
    if (!err) {
      UI.sonar('ok'); R.fase = 'ok'; R.tipoMsg = 'ok'; R.resaltar = p.vale || null;
      R.msg = p.tipo === 'contar' ? '¡Sí! Hay ' + p.esperado + '.' : (p.tipo === 'toca' ? '¡Ese es!' : (p.tipo === 'sino' ? '¡Sí, muy bien!' : (R.ortografia && R.ortografia.length ? '¡Bien! Se escribe así:' : '¡Muy bien!')));
    } else if (R.intento === 1) {
      UI.sonar('mal'); R.tipoMsg = 'mal'; R.msg = MSG[err] || 'Leé otra vez.';
      if (p.tipo === 'contar') R.malos.push('n' + v); else if (p.tipo === 'sino') R.malos.push(v ? 's1' : 's0'); else if (p.tipo === 'toca') R.malos.push(v); else R.buf = '';
      if (R.repasar.indexOf(p.clave) < 0) R.repasar.push(p.clave);
    } else {
      UI.sonar('mal'); R.fase = 'muestra'; R.tipoMsg = 'mal'; R.resaltar = p.vale || null;
      R.msg = p.tipo === 'contar' ? 'Mirá los que brillan: eran ' + p.esperado + '.' : (p.tipo === 'toca' ? 'Eran los que brillan.' : (p.tipo === 'sino' ? 'Era ' + (p.esperado ? 'sí' : 'no') + '.' : 'Era así:'));
    }
    render();
  }
  function siguiente() {
    if (R.idx + 1 < R.lista.length) { R.idx++; nuevaPregunta(); return; }
    var ok1 = R.res.filter(function (r) { return r === 'ok'; }).length, pct = Math.round(100 * ok1 / R.lista.length);
    var r = ctx.reg.cerrarRonda(pct, Date.now() - R.t0r, false, 3);
    var extra = '<p class="l1-letra" style="font-size:20px">' + esc(T(ok1 + ' de ' + R.lista.length + ' bien a la primera')) + '</p>' +
      (r.cambio === 1 ? '<p class="l1-letra" style="font-size:20px">' + esc(T('¡Subiste al nivel ' + r.nivel + '!')) + '</p>' : '');
    UI1.resumen({ estrellas: r.estrellas, extra: extra }, nuevaRonda);
  }

  UI1.conectarSilabas(app);
  nuevaRonda();
})();
