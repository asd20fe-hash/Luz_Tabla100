/* Interfaz compartida de las actividades de refuerzo de 4to (con DOM).
   Depende de: MATE (core), REF4_AZAR y REF4_EV. Sin módulos: window.REF4_UI. */
(function (root) {
  'use strict';
  var UI = {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  UI.$ = $;
  UI.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  UI.miles = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }; // 1500 → 1.500 (solo en textos)

  /* ---------- arranque común ----------
     cfg: {act, titulo, version, nivelMax, tag}. Devuelve el contexto de la actividad. */
  UI.base = function (cfg) {
    var tag = '[' + cfg.act + ' v' + cfg.version + ']';
    var log = function () { var a = [tag]; for (var i = 0; i < arguments.length; i++) a.push(arguments[i]); console.log.apply(console, a); };
    if (!root.MATE || !MATE.perfil()) {
      console.warn(tag, 'sin perfil: vuelvo al menú');
      if (root.MATE) MATE.irMenu(); else location.href = '../../index.html';
      return null;
    }
    var perfil = MATE.perfil().id, params = new URLSearchParams(location.search);
    var debug = params.get('debug') === '1';
    var seed = REF4_AZAR.semillaDeURL(location.search);
    if (seed === null) seed = REF4_AZAR.semillaNueva();
    var az = REF4_AZAR.crear(seed);

    // Almacén con el esquema del store de MATE (mate.<perfil>.<act>.<clave>), pero que avisa si está lleno.
    var store = {
      get: function (k, d) { try { var v = localStorage.getItem(REF4_EV.claveAlmacen(perfil, cfg.act, k)); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { localStorage.setItem(REF4_EV.claveAlmacen(perfil, cfg.act, k), JSON.stringify(v)); }
    };
    var reg = REF4_EV.crearRegistro({ store: store, act: cfg.act, version: cfg.version, perfil: perfil,
      log: debug ? function (e) { log('evento', e.tipo, e.paso || '', e.ok === undefined ? '' : (e.ok ? 'ok' : 'mal ' + (e.error || ''))); } : null });
    var ctx = { act: cfg.act, version: cfg.version, perfil: perfil, az: az, seed: seed, reg: reg, store: store, debug: debug,
                params: params, log: log, nivelMax: cfg.nivelMax || 4, cfg: cfg };

    // cabecera
    document.title = cfg.titulo;
    var t = $('#titulo'); if (t) t.textContent = cfg.titulo;
    var v = $('#ver'); if (v) v.textContent = 'v' + cfg.version;
    var vb = $('#volver'); if (vb) vb.onclick = function () { reg.flush(); MATE.irMenu(); };
    var tb = $('#tema');
    if (tb) { var pt = function () { tb.textContent = MATE.tema.oscuro() ? '☀️' : '🌙'; }; tb.onclick = function () { MATE.tema.alternar(); pt(); }; pt(); }
    var sb = $('#sonido');
    if (sb) { var ps = function () { sb.textContent = UI.sonidoOn() ? '🔊' : '🔇'; sb.setAttribute('aria-pressed', UI.sonidoOn()); }; sb.onclick = function () { MATE.global.set('sonido', !UI.sonidoOn()); ps(); }; ps(); }
    root.addEventListener('pagehide', function () { reg.flush(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) reg.flush(); });
    if (debug) { var d = document.createElement('pre'); d.id = 'debug'; document.body.appendChild(d); }
    UI._ctx = ctx;
    log('listo', 'semilla', seed, 'nivel', reg.estado().nivel);
    return ctx;
  };

  UI.debugSet = function (obj) {
    var d = $('#debug'); if (!d) return;
    var c = UI._ctx, ult = c.reg.ultimos().slice(-5).map(function (e) { return e.tipo + ' ' + (e.paso || '') + ' ' + (e.ok === undefined ? '' : e.ok ? 'ok' : 'mal:' + e.error); });
    d.textContent = 'v' + c.version + ' semilla ' + c.seed + '\n' + Object.keys(obj).map(function (k) { return k + ': ' + JSON.stringify(obj[k]); }).join('\n') + '\n--\n' + ult.join('\n');
  };

  /* ---------- sonido (Web Audio; se crea con el primer gesto) ---------- */
  var audio = null;
  UI.sonidoOn = function () { return MATE.global.get('sonido', true) !== false; };
  function tono(f, dur, t0, tipo, vol) {
    var o = audio.createOscillator(), g = audio.createGain();
    o.type = tipo || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, audio.currentTime + t0); g.gain.linearRampToValueAtTime(vol || 0.08, audio.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t0 + dur);
    o.connect(g); g.connect(audio.destination); o.start(audio.currentTime + t0); o.stop(audio.currentTime + t0 + dur + 0.05);
  }
  UI.sonar = function (que) {
    if (!UI.sonidoOn()) return;
    try {
      if (!audio) audio = new (root.AudioContext || root.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      if (que === 'ok') { tono(660, 0.12, 0, 'sine'); tono(880, 0.16, 0.1, 'sine'); }
      else if (que === 'mal') tono(220, 0.2, 0, 'triangle', 0.06);
      else if (que === 'sube') { tono(523, 0.12, 0, 'sine'); tono(659, 0.12, 0.12, 'sine'); tono(784, 0.2, 0.24, 'sine'); }
      else tono(500, 0.05, 0, 'sine', 0.04);
    } catch (e) { /* sin audio: no pasa nada */ }
  };

  /* ---------- globo de pistas (aria-live) y celebraciones ---------- */
  UI.globo = function (texto, tipo) {
    var g = $('#globo'); if (!g) return;
    if (!texto) { g.className = ''; g.textContent = ''; return; }
    g.className = 'ver' + (tipo ? ' ' + tipo : ''); g.textContent = texto;
  };
  var FRASES = ['¡Bien ahí!', '¡Eso!', '¡Perfecto!', '¡Muy bien!', '¡Así se hace!'];
  UI.celebrar = function (texto) {
    var d = document.createElement('div'); d.className = 'ref-celebra'; d.setAttribute('role', 'status');
    d.textContent = texto || FRASES[Math.floor(Math.random() * FRASES.length)];
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1300);
  };

  /* ---------- entrada numérica (buffer) + teclado en pantalla ---------- */
  UI.entrada = function (max) {
    var buf = '';
    return {
      valor: function () { return buf; }, num: function () { return buf === '' ? null : parseInt(buf, 10); },
      push: function (d) { if (buf.length < (max || 6)) buf += d; return buf; },
      pop: function () { buf = buf.slice(0, -1); return buf; }, limpiar: function () { buf = ''; }
    };
  };

  // cb: {digito(d), borrar(), ok()}; también responde al teclado físico.
  UI.teclado = function (cont, cb) {
    var h = '';
    for (var i = 1; i <= 9; i++) h += '<button type="button" data-k="' + i + '" aria-label="' + i + '">' + i + '</button>';
    h += '<button type="button" data-k="del" aria-label="Borrar">⌫</button><button type="button" data-k="0">0</button><button type="button" class="ok" data-k="ok">OK</button>';
    cont.innerHTML = h; cont.className = 'ref-teclado';
    var activo = true;
    function pulsar(k) {
      if (!activo) return;
      UI.sonar('tecla');
      if (k === 'del') cb.borrar(); else if (k === 'ok') cb.ok(); else cb.digito(k);
    }
    cont.onclick = function (e) { var b = e.target.closest('button'); if (b) pulsar(b.dataset.k); };
    var kd = function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) pulsar(e.key); else if (e.key === 'Backspace') pulsar('del'); else if (e.key === 'Enter') { var f = document.activeElement; if (f && f.tagName === 'BUTTON') return; pulsar('ok'); }
    };
    if (UI._kd) document.removeEventListener('keydown', UI._kd);
    UI._kd = kd; document.addEventListener('keydown', kd);
    return { habilitar: function (b) { activo = b; cont.querySelectorAll('button').forEach(function (x) { x.disabled = !b; }); } };
  };

  /* ---------- inactividad: 15 s → pista suave; 45 s → pausa ----------
     cfg: {texto(): string, elemento(): HTMLElement|null} */
  UI.vigilar = function (ctx, cfg) {
    var ultimo = Date.now(), nivel = 0, inicioInact = 0, pausa = null;
    function actividad() {
      if (pausa) return;
      if (nivel > 0) {
        ctx.reg.evento({ tipo: 'inactividad', ms: Date.now() - inicioInact });
        quitar(); nivel = 0;
      }
      ultimo = Date.now();
    }
    function quitar() { document.querySelectorAll('.ref-inactivo').forEach(function (e) { e.classList.remove('ref-inactivo'); }); }
    ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, actividad, true); });
    var iv = setInterval(function () {
      if (pausa || document.hidden) return;
      var t = Date.now() - ultimo;
      if (t >= 15000 && nivel === 0) {
        nivel = 1; inicioInact = ultimo;
        var el = cfg.elemento && cfg.elemento(); if (el) el.classList.add('ref-inactivo');
        UI.globo('¿Seguimos? Te toca: ' + (cfg.texto ? cfg.texto() : 'seguir'), null);
      }
      if (t >= 45000 && nivel === 1) {
        nivel = 2;
        pausa = document.createElement('div'); pausa.className = 'ref-modal'; pausa.setAttribute('role', 'dialog');
        pausa.innerHTML = '<div class="ref-panel"><h2>Pausa</h2><p>Cuando quieras, seguimos.</p><button class="ref-btn main" id="sigo">Sigo</button></div>';
        document.body.appendChild(pausa);
        $('#sigo', pausa).onclick = function () {
          ctx.reg.evento({ tipo: 'inactividad', ms: Date.now() - inicioInact });
          pausa.remove(); pausa = null; nivel = 0; ultimo = Date.now(); quitar(); UI.globo(null);
        };
        $('#sigo', pausa).focus();
      }
    }, 1000);
    return { detener: function () { clearInterval(iv); }, reiniciar: function () { ultimo = Date.now(); } };
  };

  /* ---------- resumen de ronda ---------- */
  UI.resumen = function (cfg, onOtra, onSalir) {
    var m = document.createElement('div'); m.className = 'ref-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    var e = ''; for (var i = 1; i <= 3; i++) e += '<span class="' + (i <= cfg.estrellas ? '' : 'off') + '">⭐</span>';
    var msg = cfg.estrellas === 3 ? '¡Impecable!' : (cfg.estrellas === 2 ? '¡Muy bien!' : '¡Buen trabajo, seguimos!');
    m.innerHTML = '<div class="ref-panel"><h2>' + msg + '</h2><div class="ref-estrellas" aria-label="' + cfg.estrellas + ' estrellas">' + e + '</div>' +
      '<p>' + cfg.pct + '% bien al primer intento</p>' + (cfg.extra ? '<p>' + cfg.extra + '</p>' : '') +
      '<div class="ref-fila"><button class="ref-btn" id="r-salir">Salir</button><button class="ref-btn main" id="r-otra">Otra ronda</button></div></div>';
    document.body.appendChild(m);
    $('#r-otra', m).onclick = function () { m.remove(); onOtra(); };
    $('#r-salir', m).onclick = function () { m.remove(); onSalir(); };
    $('#r-otra', m).focus();
  };

  // Mensaje de logro cuando sube de nivel.
  UI.logroNivel = function (nivel) { UI.sonar('sube'); UI.celebrar('¡Subiste al nivel ' + nivel + '!'); };

  /* ---------- barra de progreso de la ronda ---------- */
  UI.progreso = function (total, actual) {
    var h = ''; for (var i = 0; i < total; i++) h += '<i class="' + (i < actual ? 'hecho' : (i === actual ? 'actual' : '')) + '"></i>';
    return '<div class="ref-prog" aria-label="Ejercicio ' + (actual + 1) + ' de ' + total + '">' + h + '</div>';
  };

  // Cuenta cuántos pasos salieron bien al primer intento. Lleva el control de la ronda.
  UI.contador = function () {
    var c = { pasos: 0, ok1: 0, errorControl: false, t0: Date.now() };
    c.paso = function (intento, ok, error, controles) {
      if (intento === 1) { c.pasos++; if (ok) c.ok1++; }
      if (error && controles && controles.indexOf(error) >= 0) c.errorControl = true;
    };
    c.pct = function () { return c.pasos ? Math.round(100 * c.ok1 / c.pasos) : 0; };
    return c;
  };

  root.REF4_UI = UI;
})(window);
