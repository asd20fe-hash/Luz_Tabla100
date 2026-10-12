/* ¿Cuántas veces entra? — generador de ítems y validadores (lógica pura, sin DOM).
   Patrón UMD sin módulos: window.REF4_ENTRA. */
(function (root) {
  'use strict';

  var TIPOS = { 1: ['A', 'B'], 2: ['A', 'B', 'C'], 3: ['A', 'C'], 4: ['A', 'C'] };
  var RONDA = { 1: 8, 2: 8, 3: 8, 4: 12 };

  function divisores(nivel) {
    if (nivel === 4) return [6, 7, 8, 9];
    var a = [2, 3, 4, 5, 6, 7, 8, 9];
    return a;
  }
  function pesoDiv(nivel, d) { return (nivel <= 2 && d >= 6 && d <= 8) ? 3 : 1; }
  function pesoQ(q) { return q >= 4 ? 3 : 1; }              // sesgo a 4–9

  /* generar(nivel, az, pesos, ultimo) → ítem. pesos: {"7x8": 2} (hechos con más fallas); ultimo: hecho anterior. */
  function generar(nivel, az, pesos, ultimo) {
    pesos = pesos || {};
    var tipo = az.elegir(TIPOS[nivel] || TIPOS[1]);
    for (var intento = 0; intento < 60; intento++) {
      var ds = divisores(nivel), d = az.pesado(ds, ds.map(function (x) { return pesoDiv(nivel, x); }));
      var qs = tipo === 'C' ? [2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
      var q = az.pesado(qs, qs.map(function (x) { return pesoQ(x) * (pesos[d + 'x' + x] || 1); }));
      var hecho = d + 'x' + q;
      if (hecho === ultimo) continue;
      if (tipo === 'C') return itemC(d, q, az);
      if (tipo === 'A' && nivel >= 3 && ultimo !== d + 'x0' && az.prob(0.05)) return itemA(d, 0, az.entero(0, d - 1), az);        // n < d: entra 0 veces
      var r = nivel >= 3 ? (az.prob(0.2) ? 0 : az.entero(1, d - 1)) : az.entero(0, d - 1);                  // exacto en el 20 %
      if (tipo === 'B') return itemB(d, q, r, az);
      return itemA(d, q, r, az);
    }
    return itemA(7, 6, 3, az);
  }

  function itemA(d, q, r, az) { return { tipo: 'A', d: d, q: q, r: r, n: d * q + r, hecho: d + 'x' + q }; }
  function itemB(d, q, r, az) {
    var cand = [q - 1, q + 1, q + 2, q - 2, q + 3, q - 3].filter(function (x) { return x >= 0 && x <= 10; });
    var otros = [q + 1];                                         // siempre uno que se pasa
    cand.forEach(function (x) { if (x !== q + 1 && otros.length < 3) otros.push(x); });
    var opciones = az.mezclar([q].concat(otros)).map(function (x) { return d * x; });
    return { tipo: 'B', d: d, q: q, r: r, n: d * q + r, opciones: opciones, correcta: d * q, hecho: d + 'x' + q };
  }
  function itemC(d, k, az) {
    var real = d * k, verdadero = az.prob(0.5), p = real;
    if (!verdadero) { var dif = az.elegir([-2, -1, 1, 2, d, -d]); p = real + dif; if (p === real || p < 0) p = real + 1; }
    return { tipo: 'C', d: d, k: k, p: p, verdadero: p === real, hecho: d + 'x' + k };
  }

  /* validar(item, paso, respuesta) → {ok, codigo, dir, pista}
     paso: 'q' | 'r' (ítem A), 'B' (opción elegida: número), 'C' (true/false). dir: -1 (uno menos), +1 (se pasa), 0. */
  function validar(it, paso, resp) {
    var d = it.d;
    if (paso === 'q' || paso === 'B') {
      var esperado = paso === 'q' ? it.q : it.correcta, dado = resp, q2 = paso === 'q' ? resp : resp / d, p2 = d * q2;
      if (dado === esperado) return { ok: true, codigo: null, dir: 0, pista: null };
      if (p2 > it.n) return { ok: false, codigo: 'FACTOR_GRANDE', dir: 1, pista: d + ' × ' + q2 + ' = ' + p2 + ': se pasa de ' + it.n + '.' };
      return { ok: false, codigo: 'FACTOR_CHICO', dir: -1, pista: d + ' × ' + q2 + ' = ' + p2 + '. Sobran ' + (it.n - p2) + ', que es más que ' + d + ': ¡entra otra vez!' };
    }
    if (paso === 'r') {
      if (resp === it.r) return { ok: true, codigo: null, dir: 0, pista: null };
      return { ok: false, codigo: 'RESTA', dir: 0, pista: it.n + ' − ' + (d * it.q) + ' = ?' };
    }
    if (paso === 'C') {
      if (resp === it.verdadero) return { ok: true, codigo: null, dir: 0, pista: null };
      return { ok: false, codigo: 'TABLA', dir: it.p > d * it.k ? 1 : -1, pista: 'Mirá: ' + d + ' × ' + (it.k - 1) + ' = ' + d * (it.k - 1) + ', y le sumás ' + d + '…' };
    }
    return { ok: false, codigo: 'OTRO', dir: 0, pista: null };
  }

  function bloqueo(it) { return 'Arrancá de uno que sepas: ' + it.d + ' × 5 = ' + it.d * 5 + '. ¿Y uno más?'; }
  function pregunta(it, paso) {
    if (it.tipo === 'A') return paso === 'q' ? '¿Cuántas veces entra ' + it.d + ' en ' + it.n + '?' : '¿Cuánto sobra?';
    if (it.tipo === 'B') return '¿Cuál es el resultado más grande de la tabla del ' + it.d + ' que no pasa de ' + it.n + '?';
    return '¿Es verdadero o falso?   ' + it.d + ' × ' + it.k + ' = ' + it.p;
  }
  // Escalera de la tabla del divisor: escalones d×1..d×9 y dónde cae n.
  function escalera(it) {
    var e = []; for (var k = 1; k <= 9; k++) e.push({ k: k, p: it.d * k });
    return e;
  }
  function pasosDe(it) { return it.tipo === 'A' ? ['q', 'r'] : [it.tipo]; }

  var api = { TIPOS: TIPOS, RONDA: RONDA, generar: generar, validar: validar, bloqueo: bloqueo, pregunta: pregunta, escalera: escalera, pasosDe: pasosDe };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_ENTRA = api; }
})(typeof window !== 'undefined' ? window : this);
