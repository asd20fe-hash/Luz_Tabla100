/* Azar con semilla (mulberry32). Sin dependencias: sirve en el navegador y en node. */
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Crea un generador reproducible: misma semilla, misma secuencia.
  function crear(semilla) {
    var s = (semilla >>> 0) || 1;
    var f = mulberry32(s);
    return {
      semilla: s,
      siguiente: f,
      entero: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
      prob: function (p) { return f() < p; },
      elegir: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      // Elige un elemento según pesos (mayor peso, más probable).
      pesado: function (items, pesos) {
        var tot = 0, i;
        for (i = 0; i < pesos.length; i++) tot += pesos[i];
        var r = f() * tot;
        for (i = 0; i < items.length; i++) { r -= pesos[i]; if (r < 0) return items[i]; }
        return items[items.length - 1];
      },
      mezclar: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(f() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
    };
  }

  // Lee ?seed=N de una cadena de búsqueda; null si no hay.
  function semillaDeURL(search) {
    var m = /[?&]seed=(\d+)/.exec(search || '');
    return m ? parseInt(m[1], 10) : null;
  }

  function semillaNueva() {
    return (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0;
  }

  var api = { mulberry32: mulberry32, crear: crear, semillaDeURL: semillaDeURL, semillaNueva: semillaNueva };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_AZAR = api; }
})(typeof window !== 'undefined' ? window : this);
