'use strict';
var assert = require('assert'), PET = require('./comun.js').PET, H = 3600000;
prueba('mascota: nace con valores iniciales y se completa si falta algo', function () {
  var e = PET.nuevo(0); assert.strictEqual(e.nacido, false); assert.strictEqual(e.monedas, 0);
  PET.NECESIDADES.forEach(function (n) { assert.strictEqual(e[n.id], n.inicial); });
  var n = PET.normalizar({ nacido: true, nombre: 'PIP', monedas: 9 }, 0);
  assert.strictEqual(n.monedas, 9); assert.strictEqual(n.alegria, 80); assert.deepStrictEqual(n.accesorios, []);
  assert.strictEqual(PET.normalizar(null, 5).creado, 5);
});
prueba('mascota: baja con el tiempo pero nunca del piso', function () {
  var e = PET.nuevo(0); PET.avanzar(e, 2 * H);
  assert.strictEqual(e.panza, 50); assert.strictEqual(e.alegria, 74);
  PET.avanzar(e, 30 * 24 * H);                           // un mes sin jugar
  PET.NECESIDADES.forEach(function (n) { assert.strictEqual(e[n.id], PET.PISO); });
  e.panza = 10; PET.avanzar(e, 40 * 24 * H); assert.strictEqual(e.panza, 10);   // si ya estaba más abajo, no sigue bajando
  PET.avanzar(e, 39 * 24 * H); assert.strictEqual(e.panza, 10);                 // reloj para atrás: no cambia nada
});
prueba('mascota: premios, ánimo y crecimiento', function () {
  var e = PET.nuevo(0);
  PET.premiar(e, true); PET.premiar(e, false); assert.strictEqual(e.monedas, 3); assert.strictEqual(e.aciertos, 2);
  PET.sumar(e, 'panza', 500); assert.strictEqual(e.panza, 100);
  e.alegria = 90; assert.strictEqual(PET.animo(e), 'feliz');
  e.panza = 30; assert.strictEqual(PET.animo(e), 'hambre');
  e.panza = 90; e.alegria = 50; assert.strictEqual(PET.animo(e), 'contento');
  assert.strictEqual(PET.etapa(e).id, 'bebe'); e.aciertos = 40; assert.strictEqual(PET.etapa(e).id, 'chico'); e.aciertos = 500; assert.strictEqual(PET.etapa(e).id, 'grande');
});
prueba('mascota: limpieza y energía, con su ánimo', function () {
  var e = PET.nuevo(0); assert.strictEqual(e.limpieza, 80); assert.strictEqual(e.energia, 80);
  e.limpieza = 30; assert.strictEqual(PET.animo(e), 'sucio');
  e.limpieza = 90; e.energia = 25; assert.strictEqual(PET.animo(e), 'sueno');
  var viejo = PET.normalizar({ nacido: true, alegria: 50, panza: 50 }, 0); assert.strictEqual(viejo.energia, 80, 'los estados viejos reciben las necesidades nuevas');
});
