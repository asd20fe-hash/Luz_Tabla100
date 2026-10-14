/* Repaso espaciado de 1ro (cajas de Leitner) — parte pura. window.REPASO1 / require. Versión 1.0.0 (2026-10-14).
   Cada ítem (una palabra, un tipo de pregunta) tiene una caja de 0 a 4:
   - Mal al primer intento → caja 0 (aparece mucho). Bien → sube una caja (aparece cada vez menos).
   - "aprendido": lo había errado y ya subió a la caja 3 o más. "persiste": lo había errado y las dos últimas veces salió mal.
   - Los aprendidos siguen apareciendo de vez en cuando (peso chico) para ver si lo sostiene. */
(function (root) {
  'use strict';
  var PESOS = [8, 5, 3, 1.2, 0.4], PESO_NUEVO = 2, HIST = 8;

  function vacio() { return { items: {} }; }
  // ok: resultado del primer intento. Devuelve {antes, despues} (estado de texto) para saber si cambió.
  function registrar(est, clave, ok, ts) {
    var it = est.items[clave], antes = estado(it);
    if (!it) it = est.items[clave] = { caja: -1, vistos: 0, ok: 0, err: 0, hist: [], errado: false, ult: 0, primerError: 0 };
    it.vistos++; it.ult = ts || Date.now();
    it.hist.push(ok ? 1 : 0); if (it.hist.length > HIST) it.hist.shift();
    if (ok) { it.ok++; it.caja = it.caja < 0 ? 2 : Math.min(4, it.caja + 1); }   // una palabra nueva que sale bien arranca en la caja 2
    else { it.err++; if (!it.errado) it.primerError = it.ult; it.errado = true; it.caja = 0; }
    return { antes: antes, despues: estado(it) };
  }
  function estado(it) {
    if (!it) return 'nuevo';
    if (!it.errado) return 'bien';
    var h = it.hist, n = h.length;
    if (n >= 2 && !h[n - 1] && !h[n - 2]) return 'persiste';
    if (it.caja >= 3) return 'aprendido';
    return 'repaso';
  }
  function peso(it) { return !it || it.caja < 0 ? PESO_NUEVO : PESOS[it.caja]; }

  /* elegir(est, claves, n, az, {minRepaso}) → n claves distintas, al azar con pesos.
     Garantiza hasta minRepaso claves que se erraron y todavía no están aprendidas. az: REF4_AZAR.crear(semilla) o Math. */
  function elegir(est, claves, n, az, op) {
    op = op || {}; az = az || Math;
    var rnd = function () { return az.siguiente ? az.siguiente() : az.random(); };
    var libres = claves.slice(), out = [];
    function sacar(lista) {
      var tot = 0; lista.forEach(function (k) { tot += peso(est.items[k]); });
      var r = rnd() * tot;
      for (var i = 0; i < lista.length; i++) { r -= peso(est.items[lista[i]]); if (r <= 0) return lista[i]; }
      return lista[lista.length - 1];
    }
    var pend = libres.filter(function (k) { var e = estado(est.items[k]); return e === 'repaso' || e === 'persiste'; });
    while (out.length < Math.min(op.minRepaso || 0, n) && pend.length) { var k = sacar(pend); out.push(k); pend.splice(pend.indexOf(k), 1); libres.splice(libres.indexOf(k), 1); }
    while (out.length < n && libres.length) { var k2 = sacar(libres); out.push(k2); libres.splice(libres.indexOf(k2), 1); }
    return out;
  }
  // Resumen para padres: listas por estado.
  function resumen(est) {
    var r = { bien: [], repaso: [], persiste: [], aprendido: [] };
    Object.keys(est.items).forEach(function (k) { var e = estado(est.items[k]); if (r[e]) r[e].push(k); });
    return r;
  }

  var api = { VERSION: '1.0.0', vacio: vacio, registrar: registrar, estado: estado, peso: peso, elegir: elegir, resumen: resumen, PESOS: PESOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.REPASO1 = api;
})(typeof window !== 'undefined' ? window : this);
