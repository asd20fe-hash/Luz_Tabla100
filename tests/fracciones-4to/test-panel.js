'use strict';
var assert = require('assert');
var P = require('../../actividades/_comun-4to/panel-fracciones.js');
var DIA = 86400000, ahora = Date.UTC(2026, 9, 13);

prueba('panel: mapa de fracciones por tema con tendencia contra los 14 días anteriores', function () {
  function ev(tema, ok, dias, extra) { var e = { tipo: 'paso', tema: tema, ok: ok, intento: 1, ts: ahora - dias * DIA, paso: 'respuesta' }; for (var k in extra || {}) e[k] = extra[k]; return e; }
  var eventos = [
    ev('reparto', true, 1), ev('reparto', true, 2), ev('reparto', false, 3), ev('reparto', true, 3, { intento: 2 }),   // 2 de 3 al primer intento
    ev('reparto', false, 20), ev('reparto', false, 21),                                                                   // 0 de 2 antes → sube
    ev('equivalencias', false, 1), ev('equivalencias', true, 16),                                                         // 0 de 1 contra 1 de 1 → baja
    ev('comparacion', true, 40),                                                                                          // muy viejo: no cuenta
    ev('estrategia', true, 1, { paso: 'aprendiste', intento: 0, primero: true }), ev('estrategia', false, 1, { paso: 'aprendiste', intento: 0, primero: false }),
    { tipo: 'ronda_fin', ts: ahora - DIA }
  ];
  var m = P.mapa(eventos, ahora);
  assert.deepStrictEqual([m.reparto.n, m.reparto.pct, m.reparto.tendencia], [3, 67, '↑']);
  assert.deepStrictEqual([m.equivalencias.pct, m.equivalencias.tendencia], [0, '↓']);
  assert.strictEqual(m.comparacion.n, 0); assert.strictEqual(m.comparacion.tendencia, '—');
  assert.deepStrictEqual([m.estrategia.n, m.estrategia.pct], [1, 100]);
});
