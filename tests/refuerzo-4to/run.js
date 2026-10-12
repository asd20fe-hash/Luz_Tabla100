/* Pruebas del refuerzo de 4to. Se corren con: node tests/refuerzo-4to/run.js
   Sin dependencias: solo assert. Cada bloque de pruebas vive en su archivo test-*.js. */
'use strict';
var fs = require('fs'), path = require('path');
var casos = [], fallos = 0;
global.prueba = function (nombre, fn) { casos.push({ nombre: nombre, fn: fn }); };

fs.readdirSync(__dirname).filter(function (f) { return /^test-.*\.js$/.test(f); }).sort().forEach(function (f) {
  require(path.join(__dirname, f));
});

casos.forEach(function (c) {
  try { c.fn(); console.log('  ok   ' + c.nombre); }
  catch (e) { fallos++; console.log('  FALLA ' + c.nombre + '\n         ' + (e && e.message)); }
});
console.log('\n' + (casos.length - fallos) + ' de ' + casos.length + ' pruebas pasaron');
process.exit(fallos ? 1 : 0);
