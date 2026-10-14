'use strict';
var assert = require('assert'), L = require('../../actividades/_comun-1ro/lengua.js');
prueba('lengua: sílabas', function () {
  var casos = { PERRO: 'PE-RRO', MARIPOSA: 'MA-RI-PO-SA', ESTRELLA: 'ES-TRE-LLA', FLOR: 'FLOR', CHANCHO: 'CHAN-CHO', QUESO: 'QUE-SO', GUITARRA: 'GUI-TA-RRA',
    'AVIÓN': 'A-VIÓN', 'PAÍS': 'PA-ÍS', HUEVO: 'HUE-VO', ZANAHORIA: 'ZA-NA-HO-RIA', INSTRUMENTO: 'INS-TRU-MEN-TO', 'PINGÜINO': 'PIN-GÜI-NO',
    'LEÓN': 'LE-ÓN', REY: 'REY', PATO: 'PA-TO', LIBRO: 'LI-BRO', ELEFANTE: 'E-LE-FAN-TE', TORTUGA: 'TOR-TU-GA', perro: 'pe-rro', PRRO: 'PRRO', A: 'A' };
  Object.keys(casos).forEach(function (p) { assert.strictEqual(L.silabas(p).join('-'), casos[p], p); });
  assert.deepStrictEqual(L.silabas(''), []);
});
prueba('lengua: suena igual', function () {
  assert.strictEqual(L.fonetica('QUESO'), L.fonetica('KESO'));
  assert.strictEqual(L.fonetica('LLAVE'), L.fonetica('YABE'));
  assert.strictEqual(L.fonetica('HUEVO'), L.fonetica('UEBO'));
  assert.notStrictEqual(L.fonetica('GATO'), L.fonetica('PATO'));
});
prueba('lengua: clasificar errores de escritura', function () {
  var c = function (e, r, op) { return L.clasificar(e, r, op).primario; };
  assert.strictEqual(L.clasificar('AVIÓN', 'avion').ok, true);
  assert.strictEqual(c('FLOR', 'FOR'), 'OMITE_TRABADA');
  assert.strictEqual(c('PERRO', 'PERO'), 'R_RR');
  assert.strictEqual(c('LLAVE', 'YAVE'), 'LL_Y');
  assert.strictEqual(c('HUEVO', 'UEVO'), 'H_MUDA');
  assert.strictEqual(c('VACA', 'BACA'), 'B_V');
  assert.strictEqual(c('QUESO', 'KESO'), 'C_K_Q');
  assert.strictEqual(c('CEBOLLA', 'SEBOLLA'), 'C_S_Z');
  assert.strictEqual(c('JIRAFA', 'GIRAFA'), 'G_J');
  assert.strictEqual(c('GATO', 'GTO'), 'OMITE_VOCAL');
  assert.strictEqual(c('MESA', 'MEA'), 'OMITE_LETRA');
  assert.strictEqual(c('SOL', 'SOOL'), 'AGREGA_LETRA');
  assert.strictEqual(c('PATO', 'PTAO'), 'INVIERTE');
  assert.strictEqual(c('MARIPOSA', 'MARI'), 'INCOMPLETA');
  assert.strictEqual(c('GATO', 'PERRO'), 'OTRA_PALABRA');
  assert.strictEqual(c('DADO', 'BADO', { minus: true }), 'ESPEJO');
  assert.strictEqual(c('DADO', 'BADO'), 'CAMBIA_LETRA');
  assert.strictEqual(c('GATO', ''), 'VACIA');
  var m = L.clasificar('FLOR', 'FOR'); assert.deepStrictEqual(m.marcasEsperado, ['ok', 'mal', 'ok', 'ok']);
  assert.strictEqual(L.elegirMejor(['RANA', 'SAPO'], 'SAPO').ok, true);
  assert.strictEqual(L.elegirMejor(['RANA', 'SAPO'], 'SAPPO').forma, 'SAPO');
});
