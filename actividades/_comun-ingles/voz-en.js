/* Inglés — voz y sonidos. window.ING_VOZ. Versión 1.2.0 (2026-10-15): + sonidos patada, pique, palo, gol, burbuja, click; v1.1.0 + achis, caja, moneda, rueda.
   - decir(texto, {quien:'profe'|'pip', despues, lento}): voz en inglés (en-US primero, después en-GB). La profe habla normal y
     la mascota con tono alto. Siempre llama a despues (aunque no haya voz o el navegador no avise que terminó).
   - sfx(nombre): efectos con WebAudio (pop, nam, splash, risa, pio, crack, brillo, woosh, mal, ok, monedas, boing, achis, caja, moneda, rueda, patada, pique, palo, gol, burbuja, click).
   - balbuceo(n): la "voz" de la mascota cuando no habla en inglés (piquitos, estilo dibujito).
   Respeta el sonido global (MATE.global 'sonido'). */
(function (root) {
  'use strict';
  var V = {}, voz = null, audio = null, turno = 0, ocupado = false;
  V.sonidoOn = function () { return MATE.global.get('sonido', true) !== false; };

  function elegirVoz() {
    if (!root.speechSynthesis) return null;
    var mejor = null, pm = -1;
    speechSynthesis.getVoices().forEach(function (v) {
      var l = String(v.lang).replace('_', '-').toLowerCase(); if (!/^en(-|$)/.test(l)) return;
      var p = /^en-us/.test(l) ? 30 : (/^en-gb/.test(l) ? 25 : 10);
      if (/natural|online|google|samantha|aria|jenny|zira|karen/i.test(v.name)) p += 5;
      if (p > pm) { pm = p; mejor = v; }
    });
    return mejor;
  }
  var avisos = [];
  if (root.speechSynthesis) {
    voz = elegirVoz();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', function () { voz = elegirVoz(); avisos.forEach(function (f) { f(); }); });
  }
  V.alCambiarVoces = function (f) { avisos.push(f); };
  V.hayVoz = function () { return !!voz; };
  V.puedeHablar = function () { return !!voz && V.sonidoOn(); };
  V.callar = function () { turno++; ocupado = false; if (root.speechSynthesis) speechSynthesis.cancel(); };
  V.hablando = function () { return ocupado; };

  // Duración estimada (para el plan B si onend no llega, y para animar la boca sin voz).
  var estimar = function (t, lento) { return Math.max(700, String(t).length * (lento ? 95 : 75)); };
  V.decir = function (texto, op) {
    op = op || {};
    var mio = ++turno, listo = false, t0 = Date.now();
    function fin() { if (listo) return; listo = true; if (mio === turno) ocupado = false; if (op.alTerminar) op.alTerminar(); if (op.despues && mio === turno) op.despues(); }
    ocupado = true; if (op.alEmpezar) op.alEmpezar();
    if (!V.puedeHablar()) { setTimeout(fin, op.sinVoz === 0 ? 0 : estimar(texto, op.lento) * 0.6); return false; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(String(texto).toLowerCase());   // en mayúsculas algunas voces deletrean
    u.voice = voz; u.lang = voz.lang;
    u.rate = op.quien === 'pip' ? 1.05 : (op.lento ? 0.7 : 0.85); u.pitch = op.quien === 'pip' ? 1.9 : 1.15;
    u.onend = u.onerror = function () { setTimeout(fin, 120); };
    speechSynthesis.speak(u);
    setTimeout(fin, estimar(texto, op.lento) + 2500);                   // plan B
    return true;
  };
  // Varias frases seguidas: [{t, quien}], y al final despues().
  V.secuencia = function (lista, despues, entre) {
    var i = 0;
    (function sig() {
      if (i >= lista.length) { if (despues) despues(); return; }
      var x = lista[i++];
      V.decir(x.t, { quien: x.quien, lento: x.lento, alEmpezar: x.alEmpezar, alTerminar: x.alTerminar, despues: function () { setTimeout(sig, entre === undefined ? 250 : entre); } });
    })();
  };

  /* ---------- efectos ---------- */
  function ctx() {
    if (!V.sonidoOn()) return null;
    try { if (!audio) audio = new (root.AudioContext || root.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; } catch (e) { return null; }
  }
  function tono(a, f0, f1, dur, t0, tipo, vol) {
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.08, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function ruido(a, dur, t0, frec, vol, q) {
    var n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = frec || 1200; f.Q.value = q || 1; g.gain.value = vol || 0.15;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  V.sfx = function (que) {
    var a = ctx(); if (!a) return;
    try {
      if (que === 'pop') tono(a, 400, 900, 0.09, 0, 'sine', 0.12);
      else if (que === 'nam') { for (var i = 0; i < 3; i++) ruido(a, 0.07, i * 0.18, 700, 0.18, 2); }
      else if (que === 'splash') { ruido(a, 0.35, 0, 1800, 0.2, 0.7); tono(a, 300, 120, 0.25, 0, 'sine', 0.06); }
      else if (que === 'risa') { for (var j = 0; j < 5; j++) tono(a, 700 + j * 40, 1000 + j * 40, 0.07, j * 0.09, 'triangle', 0.07); }
      else if (que === 'pio') tono(a, 900, 1500, 0.08, 0, 'sine', 0.08);
      else if (que === 'crack') { ruido(a, 0.08, 0, 2500, 0.25, 3); ruido(a, 0.05, 0.06, 1800, 0.2, 3); }
      else if (que === 'brillo') { [1046, 1318, 1568, 2093].forEach(function (f, k) { tono(a, f, 0, 0.18, k * 0.06, 'sine', 0.05); }); }
      else if (que === 'woosh') ruido(a, 0.3, 0, 600, 0.12, 0.5);
      else if (que === 'mal') { tono(a, 330, 220, 0.18, 0, 'triangle', 0.07); }
      else if (que === 'ok') { tono(a, 660, 0, 0.12, 0, 'sine', 0.09); tono(a, 880, 0, 0.18, 0.1, 'sine', 0.09); }
      else if (que === 'monedas') { for (var m = 0; m < 3; m++) tono(a, 1200 + m * 200, 1800 + m * 200, 0.08, m * 0.07, 'square', 0.025); }
      else if (que === 'achis') { ruido(a, 0.12, 0, 900, 0.12, 1); ruido(a, 0.25, 0.14, 3000, 0.22, 0.8); }
      else if (que === 'caja') { tono(a, 1500, 0, 0.08, 0, 'square', 0.03); tono(a, 2200, 0, 0.35, 0.09, 'sine', 0.08); }
      else if (que === 'moneda') tono(a, 1400, 2100, 0.07, 0, 'square', 0.025);
      else if (que === 'rueda') ruido(a, 0.5, 0, 300, 0.08, 0.6);
      else if (que === 'patada') { ruido(a, 0.08, 0, 400, 0.3, 1); tono(a, 160, 60, 0.12, 0, 'sine', 0.15); }
      else if (que === 'pique') tono(a, 220, 120, 0.08, 0, 'sine', 0.08);
      else if (que === 'palo') { tono(a, 900, 880, 0.35, 0, 'triangle', 0.08); tono(a, 1350, 1320, 0.3, 0, 'sine', 0.04); }
      else if (que === 'gol') { [523, 659, 784, 1046].forEach(function (f, k) { tono(a, f, 0, 0.22, k * 0.1, 'triangle', 0.08); }); ruido(a, 0.9, 0.1, 1500, 0.06, 0.4); }
      else if (que === 'burbuja') tono(a, 600 + Math.random() * 400, 1600, 0.06, 0, 'sine', 0.1);
      else if (que === 'click') tono(a, 1800, 0, 0.03, 0, 'square', 0.04);
      else if (que === 'boing') tono(a, 180, 520, 0.22, 0, 'sine', 0.12);
      else tono(a, 500, 0, 0.05, 0, 'sine', 0.04);
    } catch (e) { /* sin audio */ }
  };
  V.balbuceo = function (n, alegre) {
    var a = ctx(); if (!a) return;
    try { for (var i = 0; i < (n || 3); i++) { var f = (alegre ? 650 : 480) + Math.random() * 300; tono(a, f, f * (alegre ? 1.5 : 0.8), 0.09, i * 0.13, 'triangle', 0.06); } } catch (e) { /* sin audio */ }
  };
  // Vibración corta (Android); en el resto no hace nada.
  V.vibrar = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 30); } catch (e) { /* nada */ } };

  root.ING_VOZ = V;
})(window);
