'use strict';
var assert = require('assert'), R = require('../../actividades/_comun-1ro/repaso.js'), AZ = require('../../actividades/_comun-4to/azar.js');
prueba('repaso: cajas y estados', function () {
  var e = R.vacio();
  assert.strictEqual(R.estado(e.items.GATO), 'nuevo');
  R.registrar(e, 'GATO', true); assert.strictEqual(R.estado(e.items.GATO), 'bien'); assert.strictEqual(e.items.GATO.caja, 2);
  R.registrar(e, 'FLOR', false); assert.strictEqual(R.estado(e.items.FLOR), 'repaso'); assert.strictEqual(e.items.FLOR.caja, 0);
  R.registrar(e, 'FLOR', false); assert.strictEqual(R.estado(e.items.FLOR), 'persiste');
  R.registrar(e, 'FLOR', true); R.registrar(e, 'FLOR', true); assert.strictEqual(R.estado(e.items.FLOR), 'repaso');
  var r = R.registrar(e, 'FLOR', true); assert.strictEqual(r.despues, 'aprendido'); assert.strictEqual(r.antes, 'repaso');
});
prueba('repaso: lo errado sale más seguido y se garantiza el repaso', function () {
  var e = R.vacio(), claves = []; for (var i = 0; i < 30; i++) claves.push('P' + i);
  claves.slice(0, 20).forEach(function (k) { for (var j = 0; j < 4; j++) R.registrar(e, k, true); });
  R.registrar(e, 'P25', false);
  var az = AZ.crear(7), veces = 0;
  for (var n = 0; n < 1000; n++) { var sel = R.elegir(e, claves, 6, az); assert.strictEqual(new Set(sel).size, 6); if (sel.indexOf('P25') >= 0) veces++; }
  assert.ok(veces > 500, 'la errada aparece seguido: ' + veces);
  for (n = 0; n < 200; n++) assert.ok(R.elegir(e, claves, 6, az, { minRepaso: 1 }).indexOf('P25') >= 0);
  assert.deepStrictEqual(R.resumen(e).repaso, ['P25']);
});
