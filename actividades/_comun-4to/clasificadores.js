/* Clasificadores de error para el cálculo con ceros y las sumas. Lógica pura, sin DOM. */
(function (root) {
  'use strict';

  function descomponer(a) { // 199 → [9, 90, 100] (unidades primero, sin ceros)
    var s = String(a), out = [];
    for (var i = 0; i < s.length; i++) {
      var dig = +s[s.length - 1 - i];
      if (dig) out.push(dig * Math.pow(10, i));
    }
    return out;
  }

  // ¿La respuesta sale de dividir o multiplicar por 10 algún producto parcial (o el total)?
  function cerosMal(parciales, correcto, resp) {
    if (resp === correcto * 10 || (correcto % 10 === 0 && resp === correcto / 10)) return true;
    for (var i = 0; i < parciales.length; i++) {
      var tot = 0, j, p = parciales[i];
      for (j = 0; j < parciales.length; j++) if (j !== i) tot += parciales[j];
      if (p % 10 === 0 && tot + p / 10 === resp) return true;
      if (tot + p * 10 === resp) return true;
    }
    return false;
  }

  /* a × d (a de 2 o 3 cifras, d de una). Devuelve un código o null si está bien. */
  function clasificarMultiplicacion(a, d, resp) {
    var correcto = a * d;
    if (resp === correcto) return null;
    var parciales = descomponer(a).map(function (x) { return x * d; });
    if (cerosMal(parciales, correcto, resp)) return 'CERO_PERDIDO';
    var redondo = a % 10 === 0 ? a : a - (a % 10) + 10;
    if (resp === d * redondo + d * (a % 10)) return 'MEZCLA_ESTRATEGIA';
    var dif = Math.abs(resp - correcto), k;
    for (k = 0; k < String(a).length; k++) if (dif === d * Math.pow(10, k)) return 'TABLA';
    for (k = 1; k <= 4; k++) if (dif === Math.pow(10, k)) return 'RESERVA';
    return 'OTRO';
  }

  /* dividendo : divisor (cuenta exacta). */
  function clasificarDivision(dividendo, divisor, resp) {
    var correcto = Math.floor(dividendo / divisor);
    if (resp === correcto) return null;
    if (divisor !== 2 && resp * 2 === dividendo) return 'MITAD_AUTOMATICA';
    if (resp === correcto * 10 || (correcto % 10 === 0 && resp === correcto / 10)) return 'CERO_PERDIDO';
    return 'OTRO';
  }

  /* suma de varios números en columna. */
  function clasificarSuma(sumandos, resp) {
    var correcto = sumandos.reduce(function (x, y) { return x + y; }, 0);
    if (resp === correcto) return null;
    var dif = Math.abs(resp - correcto);
    for (var k = 1; k <= 4; k++) if (dif === Math.pow(10, k)) return 'RESERVA';
    return 'OTRO';
  }

  var api = { descomponer: descomponer, clasificarMultiplicacion: clasificarMultiplicacion,
              clasificarDivision: clasificarDivision, clasificarSuma: clasificarSuma };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_CLASIF = api; }
})(typeof window !== 'undefined' ? window : this);
