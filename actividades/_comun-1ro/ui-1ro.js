/* Lectura y escritura de 1ro — interfaz común (con DOM). window.UI1. Versión 1.0.0 (2026-10-14).
   Depende de: MATE, REF4_AZAR, REF4_EV (registro de eventos, que también manda a la nube) y REF4_UI (sonidos, fuegos y voz).
   - base(cfg): perfil, cabecera (menú, tema, fondo, sonido, MAYÚS/minús), registro y semilla.
   - caso: mayúsculas o minúsculas, por perfil (mate.<perfil>.1ro-lengua.caso), compartido entre actividades.
   - hablar(texto): voz en español (Argentina primero), solo si el sonido está prendido.
   - teclado(cont, {letra, borrar, listo}, {numeros}): teclado en pantalla y físico.
   - silabasHTML / conectarSilabas: sílabas que suenan al tocarlas. */
(function (root) {
  'use strict';
  var UI = root.REF4_UI, U1 = {}, $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  U1.esc = esc;
  var cajaCaso = function () { return MATE.store('1ro-lengua'); };
  U1.caso = function () { return cajaCaso().get('caso', 'mayus') === 'minus' ? 'minus' : 'mayus'; };
  U1.txt = function (s) { return U1.caso() === 'minus' ? String(s).toLowerCase() : String(s).toUpperCase(); };
  // Frases en minúsculas: con mayúscula al principio de cada oración (como en los libros).
  U1.frase = function (s) { if (U1.caso() !== 'minus') return String(s).toUpperCase(); return String(s).toLowerCase().replace(/(^|[.!?]\s+)([¿¡]?)(\S)/g, function (_, a, b, c) { return a + b + c.toUpperCase(); }); };

  U1.base = function (cfg) {
    var tag = '[' + cfg.act + ' v' + cfg.version + ']';
    var log = function () { var a = [tag]; for (var i = 0; i < arguments.length; i++) a.push(arguments[i]); console.log.apply(console, a); };
    if (!MATE.perfil()) { console.warn(tag, 'sin perfil: vuelvo al menú'); MATE.irMenu(); return null; }
    var params = new URLSearchParams(location.search), debug = params.get('debug') === '1';
    var seed = REF4_AZAR.semillaDeURL(location.search); if (seed === null) seed = REF4_AZAR.semillaNueva();
    var store = MATE.store(cfg.act), perfil = MATE.perfil().id;
    var reg = REF4_EV.crearRegistro({ store: store, act: cfg.act, version: cfg.version, perfil: perfil, log: debug ? function (e) { log('evento', e.tipo, e.paso || '', e.ok === undefined ? '' : (e.ok ? 'ok' : 'mal ' + (e.error || ''))); } : null });
    document.title = cfg.titulo;
    var t = $('#titulo'); if (t) t.textContent = cfg.titulo;
    var v = $('#ver'); if (v) v.textContent = 'v' + cfg.version;
    var vb = $('#volver'); if (vb) vb.onclick = function () { reg.flush(); MATE.irMenu(); };
    var tb = $('#tema'); if (tb) { var pt = function () { tb.textContent = MATE.tema.oscuro() ? '☀️' : '🌙'; }; tb.onclick = function () { MATE.tema.alternar(); pt(); }; pt(); }
    var fb = $('#fondo'); if (fb) fb.onclick = function () { MATE.fondo.menu(fb); };
    var sb = $('#sonido'); if (sb) { var ps = function () { sb.textContent = UI.sonidoOn() ? '🔊' : '🔇'; sb.setAttribute('aria-pressed', UI.sonidoOn()); }; sb.onclick = function () { MATE.global.set('sonido', !UI.sonidoOn()); if (!UI.sonidoOn() && root.speechSynthesis) speechSynthesis.cancel(); ps(); }; ps(); }
    var cb = $('#caso');
    if (cb) { var pc = function () { cb.textContent = U1.caso() === 'minus' ? 'abc' : 'ABC'; cb.title = U1.caso() === 'minus' ? 'Ahora en minúsculas (tocá para MAYÚSCULAS)' : 'Ahora en MAYÚSCULAS (tocá para minúsculas)'; };
      cb.onclick = function () { cajaCaso().set('caso', U1.caso() === 'minus' ? 'mayus' : 'minus'); pc(); if (cfg.alCambiarCaso) cfg.alCambiarCaso(); }; pc(); }
    root.addEventListener('pagehide', function () { reg.flush(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) reg.flush(); });
    log('listo', 'semilla', seed, 'nivel', reg.estado().nivel, 'caso', U1.caso());
    return { act: cfg.act, version: cfg.version, perfil: perfil, reg: reg, store: store, az: REF4_AZAR.crear(seed), seed: seed, debug: debug, params: params, log: log };
  };

  /* ---------- voz ---------- */
  var voz = null;
  if (root.speechSynthesis) { voz = UI.elegirVoz(); speechSynthesis.onvoiceschanged = function () { voz = UI.elegirVoz(); }; }
  U1.hayVoz = function () { return !!voz && UI.sonidoOn(); };
  // En minúsculas: en mayúsculas algunas voces deletrean ("SOL" → ese, o, ele).
  U1.hablar = function (texto, lento) {
    if (!U1.hayVoz()) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(texto).toLowerCase()); u.voice = voz; u.lang = voz.lang; u.rate = lento ? 0.7 : 0.85; speechSynthesis.speak(u);
    return true;
  };

  /* ---------- teclado ---------- */
  var LETRAS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', fisico = null;
  U1.teclado = function (cont, cb, op) {
    op = op || {};
    var h = '';
    if (op.numeros) h += '<div class="l1-teclado num">' + '1234567890'.split('').map(function (d) { return '<button type="button" class="l1-tecla" data-k="' + d + '">' + d + '</button>'; }).join('') + '</div>';
    h += '<div class="l1-teclado">' + LETRAS.split('').map(function (l) { return '<button type="button" class="l1-tecla" data-k="' + l + '" aria-label="' + l + '">' + esc(U1.txt(l)) + '</button>'; }).join('') +
      '<button type="button" class="l1-tecla borrar" data-k="del" aria-label="Borrar">⌫</button><button type="button" class="l1-tecla listo" data-k="ok">✔ ' + esc(U1.frase('Listo')) + '</button></div>';
    cont.innerHTML = h;
    function pulsar(k) { if (k === 'del') { UI.sonar('tecla'); cb.borrar(); } else if (k === 'ok') cb.listo(); else { UI.sonar('tecla'); cb.letra(k); } }
    cont.onclick = function (e) { var b = e.target.closest('[data-k]'); if (b) pulsar(b.dataset.k); };
    if (fisico) document.removeEventListener('keydown', fisico);
    fisico = function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey || !document.body.contains(cont) || document.querySelector('.l1-modal')) return;
      var k = e.key;
      if (k === 'Backspace') { e.preventDefault(); pulsar('del'); }
      else if (k === 'Enter') { e.preventDefault(); pulsar('ok'); }
      else if (/^[a-zñA-ZÑ]$/.test(k)) { e.preventDefault(); pulsar(k.toUpperCase()); }
      else if (op.numeros && /^[0-9]$/.test(k)) { e.preventDefault(); pulsar(k); }
    };
    document.addEventListener('keydown', fisico);
  };

  /* ---------- sílabas que suenan ---------- */
  U1.silabasHTML = function (texto, etiqueta) {
    var s = LENGUA1.silabas(texto);
    if (!s.length) return '<div class="l1-sils"></div>';
    return '<div class="l1-sils">' + (etiqueta ? '<small>' + esc(etiqueta) + '</small>' : '') + s.map(function (x) { return '<button type="button" class="l1-sil" data-sil="' + esc(x) + '" title="Tocá para escuchar">' + esc(U1.txt(x)) + '</button>'; }).join('') + '</div>';
  };
  U1.conectarSilabas = function (cont, alHablar) {
    cont.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sil]'); if (!b) return;
      if (U1.hablar(b.dataset.sil, true)) { b.classList.add('habla'); setTimeout(function () { b.classList.remove('habla'); }, 600); if (alHablar) alHablar(b.dataset.sil); }
    });
  };

  U1.progreso = function (lista, actual) {
    return '<div class="l1-prog">' + lista.map(function (r, i) { return '<i class="' + (i === actual ? 'actual' : (r === 'ok' ? 'hecho' : (r === 'mal' ? 'mal' : ''))) + '"></i>'; }).join('') + '</div>';
  };
  // Resumen de la ronda con estrellas; fuegos hasta "Otra ronda" o "Salir".
  U1.resumen = function (cfg, onOtra) {
    var m = document.createElement('div'); m.className = 'l1-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    var e = ''; for (var i = 1; i <= 3; i++) e += '<span class="' + (i <= cfg.estrellas ? '' : 'off') + '">⭐</span>';
    m.innerHTML = '<div class="l1-panel"><h2 class="l1-letra">' + esc(U1.frase(cfg.estrellas === 3 ? '¡Excelente!' : (cfg.estrellas === 2 ? '¡Muy bien!' : '¡Buen trabajo!'))) + '</h2><div class="l1-estrellas">' + e + '</div>' +
      (cfg.extra || '') + '<div class="l1-fila"><button class="l1-btn" id="r-salir">' + esc(U1.frase('Salir')) + '</button><button class="l1-btn main" id="r-otra">' + esc(U1.frase('Otra ronda')) + '</button></div></div>';
    document.body.appendChild(m); UI.fuegos.iniciar(); UI.sonar('sube');
    $('#r-otra', m).onclick = function () { UI.fuegos.parar(); m.remove(); onOtra(); };
    $('#r-salir', m).onclick = function () { UI.fuegos.parar(); m.remove(); MATE.irMenu(); };
    $('#r-otra', m).focus();
  };

  root.UI1 = U1;
})(window);
