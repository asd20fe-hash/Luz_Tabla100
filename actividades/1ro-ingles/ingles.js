/* Inglés de 1ro — interfaz.
   ------------------------------------------------------------
   Historial de cambios
   v1.0.0  (2026-10-14) Primera versión
     + Vocabulario con dibujos (animales, colores, números, comida, cuerpo y cosas) con voz en inglés.
     + Nivel 1: escuchá y tocá el dibujo (3 opciones). Nivel 2: 4 opciones y "Is it a …?" (sí o no).
       Nivel 3: además leer la palabra y escribir palabras cortas. Sube con 2 rondas ≥ 80 % al primer intento.
     + Trampas de oído desde el nivel 2: palabras que suenan parecido (THREE/TREE, BEAR/PEAR).
     + Si se equivoca, escucha la palabra que tocó y otra vez la pedida; al acertar ve la traducción y hay fuegos.
     + Registro de cada intento (CONFUNDE_TEMA, CONFUNDE_PARECIDA…) y repaso espaciado de las palabras que erra.
   ------------------------------------------------------------ */
(function () {
  'use strict';
  var VERSION = '1.0.0', ACT = '1ro-ingles';
  var IN = INGLES1, RP = REPASO1, L = LENGUA1, UI = REF4_UI, esc = UI1.esc, T = UI1.txt, F = UI1.frase;
  var ctx = UI1.base({ act: ACT, version: VERSION, titulo: 'English', alCambiarCaso: function () { render(); } });
  if (!ctx) return;
  var app = document.getElementById('app'), $ = function (s) { return app.querySelector(s); };
  var rep = ctx.store.get('repaso', null) || RP.vacio(), R = null;

  /* ---------- voz en inglés ---------- */
  var voz = null;
  function elegirVoz() {
    if (!window.speechSynthesis) return null;
    var mejor = null, pm = -1;
    speechSynthesis.getVoices().forEach(function (v) {
      var l = String(v.lang).replace('_', '-').toLowerCase(); if (!/^en(-|$)/.test(l)) return;
      var p = /^en-us/.test(l) ? 30 : (/^en-gb/.test(l) ? 25 : 10);
      if (/natural|online|google|samantha|aria|jenny/i.test(v.name)) p += 5;
      if (p > pm) { pm = p; mejor = v; }
    });
    return mejor;
  }
  if (window.speechSynthesis) { voz = elegirVoz(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', function () { voz = elegirVoz(); if (R && R.inicio) render(); }); }
  var hayVoz = function () { return !!voz && UI.sonidoOn(); };
  function decir(texto, despues) {
    if (!hayVoz()) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(texto).toLowerCase()); u.voice = voz; u.lang = voz.lang; u.rate = 0.8;
    if (despues) u.onend = despues;
    speechSynthesis.speak(u); return true;
  }
  var articulo = function (w) { return w.tema === 'colores' || w.tema === 'numeros' ? '' : (/^[AEIOU]/.test(w.en) ? 'an ' : 'a '); };
  var pregunta = function (w) { return w.tema === 'numeros' ? 'Is it number ' + w.en + '?' : 'Is it ' + articulo(w) + w.en + '?'; };

  /* ---------- ronda ---------- */
  function nivelActual() {
    var n = ctx.reg.estado().nivel;
    if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(3, parseInt(ctx.params.get('nivel'), 10) || n));
    return n;
  }
  function nuevaRonda(conGesto) {
    ctx.reg.iniciarRonda();
    var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
    var lista = IN.armarRonda(nivel, ctx.az, rep, RP);
    R = { nivel: nivel, lista: lista, res: lista.map(function () { return null; }), idx: 0, t0r: Date.now(), inicio: !conGesto };
    if (R.inicio) render(); else nuevoItem();
  }
  function nuevoItem() {
    UI.fuegos.parar();
    R.it = R.lista[R.idx]; R.intento = 0; R.fase = 'responde'; R.msg = ''; R.tipoMsg = ''; R.malos = []; R.buf = ''; R.marcas = null; R.t0 = Date.now(); R.repite = 0;
    ctx.log('ítem', R.it.tipo, R.it.w.en, R.it.dice ? 'dice ' + R.it.dice.en : '');
    render(); sonarItem();
  }
  // Lo que se oye al empezar cada ítem (lee no tiene audio: es para leer).
  function sonarItem() { var it = R.it; if (it.tipo === 'escucha' || it.tipo === 'escribe') decir(it.w.en); else if (it.tipo === 'sino') decir(pregunta(it.dice)); }

  /* ---------- pantalla ---------- */
  function dibujo(w, grande) {
    var cls = 'ing-dib' + (grande ? ' grande' : '');
    if (w.color) return '<span class="' + cls + ' color" style="background:' + w.color + '" aria-label="color"></span>';
    if (w.tema === 'numeros') return '<span class="' + cls + ' num">' + esc(w.img) + '</span>';
    return '<span class="' + cls + '" role="img">' + w.img + '</span>';
  }
  var INSTR = { escucha: '👂 Escuchá y tocá', sino: '👂 ¿Sí o no?', lee: '👀 Leé y tocá', escribe: '✏️ Escribí en inglés' };
  function render() {
    if (!R) return;
    if (R.inicio) {
      app.innerHTML = '<div class="l1-panel ing-inicio"><div class="ing-bandera">🇬🇧 🇺🇸</div><h2 class="l1-letra">English!</h2>' +
        (!voz ? '<p class="l1-msg mal">' + esc(F('Este dispositivo no tiene voz en inglés.')) + '</p>' : (!UI.sonidoOn() ? '<p class="l1-msg mal">' + esc(F('Prendé el sonido 🔊 para escuchar.')) + '</p>' : '')) +
        '<div class="l1-fila"><button class="l1-btn main ing-play" id="empezar">▶ ' + esc(F('¡A jugar!')) + '</button></div></div>';
      $('#empezar').onclick = function () { R.inicio = false; nuevoItem(); };
      return;
    }
    var it = R.it, w = it.w, h = UI1.progreso(R.res, R.idx), fin = R.fase !== 'responde';
    h += '<div class="l1-panel"><div class="ing-instr l1-letra">' + esc(F(INSTR[it.tipo])) + '</div>';
    if (it.tipo !== 'lee' || R.intento > 0 || fin) h += '<div class="l1-fila"><button class="l1-btn ing-oir" id="oir">🔊 ' + esc(F('Otra vez')) + '</button></div>';
    if (it.tipo === 'escucha') {
      h += '<div class="ing-ops n' + it.opciones.length + '">' + it.opciones.map(function (o, i) {
        var c = R.malos.indexOf(i) >= 0 ? ' mal' : (fin && o === w ? ' bien' : '');
        return '<button class="ing-op' + c + '" data-i="' + i + '"' + (fin || R.malos.indexOf(i) >= 0 ? ' disabled' : '') + ' aria-label="opción ' + (i + 1) + '">' + dibujo(o) + '</button>'; }).join('') + '</div>';
    } else {
      h += '<div class="ing-centro">' + dibujo(it.tipo === 'sino' ? it.dice : w, true) + '</div>';
      if (it.tipo === 'sino' && !fin) h += '<div class="l1-fila"><button class="l1-btn ing-sino" data-s="1"' + (R.malos.indexOf('s1') >= 0 ? ' disabled' : '') + '>👍 YES</button><button class="l1-btn ing-sino" data-s="0"' + (R.malos.indexOf('s0') >= 0 ? ' disabled' : '') + '>👎 NO</button></div>';
      if (it.tipo === 'lee') h += '<div class="ing-palabras">' + it.opciones.map(function (o, i) {
        var c = R.malos.indexOf(i) >= 0 ? ' mal' : (fin && o === w ? ' bien' : '');
        return '<button class="l1-btn ing-pal l1-letra' + c + '" data-i="' + i + '"' + (fin || R.malos.indexOf(i) >= 0 ? ' disabled' : '') + '>' + esc(T(o.en)) + '</button>'; }).join('') + '</div>';
      if (it.tipo === 'escribe' && !fin) h += '<div class="l1-cajas">' + L.limpiar(w.en).split('').map(function (_, i) { var c = R.buf[i]; return '<span class="l1-caja l1-letra' + (c ? (R.marcas ? ' ' + (R.marcas[i] || '') : '') : ' vacia') + (i === R.buf.length ? ' cursor' : '') + '">' + (c ? esc(T(c)) : '·') + '</span>'; }).join('') +
        (R.buf.length > w.en.length ? R.buf.slice(w.en.length).split('').map(function (c) { return '<span class="l1-caja l1-letra mal">' + esc(T(c)) + '</span>'; }).join('') : '') + '</div>';
    }
    if (fin) h += '<div class="ing-trad l1-letra">' + dibujo(w) + ' <b>' + esc(T(w.en)) + '</b> = ' + esc(T(w.es)) + '</div>';
    h += '<div class="l1-msg ' + R.tipoMsg + '" role="status">' + esc(F(R.msg)) + '</div>';
    h += fin ? '<div class="l1-fila"><button class="l1-btn main" id="sig">' + esc(F(R.idx + 1 < R.lista.length ? 'Siguiente ▶' : 'Terminar ▶')) + '</button></div>' : (it.tipo === 'escribe' ? '<div id="teclado"></div>' : '');
    h += '</div>';
    app.innerHTML = h;
    var oir = $('#oir'); if (oir) oir.onclick = function () { R.repite++; if (fin) decir(w.en); else if (it.tipo === 'sino') decir(pregunta(it.dice)); else decir(w.en); };
    if (fin) { $('#sig').onclick = siguiente; $('#sig').focus(); return; }
    app.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { elegir(it.opciones[+b.dataset.i], +b.dataset.i); }; });
    app.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { sino(b.dataset.s === '1'); }; });
    if (it.tipo === 'escribe') UI1.teclado($('#teclado'), { letra: function (k) { if (R.buf.length < 10) { R.buf += k; R.marcas = null; R.msg = ''; render(); } },
      borrar: function () { R.buf = R.buf.slice(0, -1); R.marcas = null; render(); }, listo: escribir });
    if (ctx.debug) window.__ing = { R: R, elegir: elegir, sino: sino, escribir: function (s) { R.buf = L.limpiar(s); escribir(); } };
  }

  /* ---------- respuestas ---------- */
  function registrar(ok, error, esperado, respuesta, extra) {
    var it = R.it, w = it.w;
    R.intento++;
    ctx.reg.evento(Object.assign({ tipo: 'paso', tema: 'ingles', paso: it.tipo, intento: R.intento, item: { palabra: w.en, img: w.img || (w.color ? '🎨' : ''), tema: w.tema, es: w.es },
      esperado: esperado, respuesta: respuesta, ok: ok, error: error, forma: UI1.caso(), ms: Date.now() - R.t0, ayuda: R.repite ? 'repitio ' + R.repite : 'ninguna' }, extra || {}));
    R.t0 = Date.now();
    if (R.intento === 1) { RP.registrar(rep, w.en, ok); R.res[R.idx] = ok ? 'ok' : 'mal'; try { ctx.store.set('repaso', rep); } catch (e) { /* sin espacio */ } }
  }
  function bien(msg) { UI.sonar('ok'); UI.fuegos.iniciar(); R.fase = 'ok'; R.tipoMsg = 'ok'; R.msg = msg || '¡Muy bien!'; render(); decir(R.it.w.en); }
  function mostrar(msg) { UI.sonar('mal'); R.fase = 'muestra'; R.tipoMsg = 'mal'; R.msg = msg; render(); decir(R.it.w.en); }
  function elegir(o, i) {
    var it = R.it, w = it.w, err = IN.errorEleccion(w, o);
    if (it.tipo === 'lee' && err) err = err === 'CONFUNDE_PARECIDA' ? err : 'LEE_MAL';
    registrar(!err, err, w.en, o.en);
    if (!err) return bien(R.intento === 1 ? '¡Muy bien!' : '¡Bien!');
    if (R.intento >= 2) return mostrar('Era esta. Escuchala otra vez.');
    UI.sonar('mal'); R.malos.push(i); R.tipoMsg = 'mal';
    R.msg = 'Eso es ' + o.en + ' (' + o.es + '). ' + (it.tipo === 'lee' ? 'Leé otra vez.' : 'Escuchá otra vez.');
    render();
    decir(o.en, function () { if (it.tipo !== 'lee' && R.it === it && R.fase === 'responde') setTimeout(function () { decir(w.en); }, 500); });
  }
  function sino(si) {
    var it = R.it, verdad = it.dice === it.w, ok = si === verdad;
    registrar(ok, ok ? null : 'SI_NO_MAL', verdad ? 'YES' : 'NO', si ? 'YES' : 'NO', { dice: it.dice.en });
    if (ok) return bien(verdad ? '¡Sí! Es ' + it.w.en + '.' : '¡Bien! No es ' + it.dice.en + ', es ' + it.w.en + '.');
    if (R.intento >= 2) return mostrar(verdad ? 'Sí, era ' + it.w.en + '.' : 'No era ' + it.dice.en + ': es ' + it.w.en + '.');
    UI.sonar('mal'); R.malos.push(si ? 's1' : 's0'); R.tipoMsg = 'mal'; R.msg = 'Escuchá otra vez y mirá el dibujo.'; render(); decir(pregunta(it.dice));
  }
  function escribir() {
    var w = R.it.w; if (!R.buf) { R.msg = 'Escribí la palabra.'; render(); return; }
    var c = L.clasificar(w.en, R.buf, { idioma: 'en', minus: UI1.caso() === 'minus' });
    registrar(c.ok, c.ok ? null : c.primario, w.en, R.buf, c.ok ? null : { errores: c.codigos });
    if (c.ok) return bien('¡Muy bien!');
    if (R.intento >= 2) return mostrar('Se escribe así.');
    UI.sonar('mal'); R.marcas = c.marcasRespuesta; R.tipoMsg = 'mal'; R.msg = 'Casi. Mirá las letras rojas y escuchá otra vez.'; render(); decir(w.en);
  }
  function siguiente() {
    if (R.idx + 1 < R.lista.length) { R.idx++; nuevoItem(); return; }
    var ok1 = R.res.filter(function (r) { return r === 'ok'; }).length, pct = Math.round(100 * ok1 / R.lista.length);
    var r = ctx.reg.cerrarRonda(pct, Date.now() - R.t0r, false, 3);
    var extra = '<p class="l1-letra" style="font-size:20px">' + esc(F(ok1 + ' de ' + R.lista.length + ' bien a la primera')) + '</p>' +
      (r.cambio === 1 ? '<p class="l1-letra" style="font-size:20px">' + esc(F('¡Subiste al nivel ' + r.nivel + '!')) + '</p>' : '');
    UI1.resumen({ estrellas: r.estrellas, extra: extra }, function () { nuevaRonda(true); });
  }

  nuevaRonda(false);
})();
