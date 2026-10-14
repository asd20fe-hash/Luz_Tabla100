'use strict';
var assert = require('assert'), LE = require('../../actividades/1ro-lectura/lectura-logica.js'), L = require('../../actividades/_comun-1ro/lengua.js');
var RP = require('../../actividades/_comun-1ro/repaso.js'), AZ = require('../../actividades/_comun-4to/azar.js');
var C = { fecha: new Date(2026, 9, 14), nombre: 'Luz' };
prueba('lectura: 1000 rondas por nivel, con semilla', function () {
  [1, 2, 3].forEach(function (nv) {
    var az = AZ.crear(100 + nv), rep = RP.vacio();
    for (var k = 0; k < 1000; k++) {
      var r = LE.armarRonda(nv, az, rep, RP, C);
      assert.strictEqual(r.preguntas.length, 8, 'nivel ' + nv);
      r.dibujos.forEach(function (d) { assert.ok(d.objs.length >= 3 && d.objs.length <= 10); });
      var vistos = {};
      r.preguntas.forEach(function (p, i) {
        if (p.tipo === 'escribir') { assert.ok(p.validos.length && p.validos[0]); return; }
        var d = r.dibujos[p.dibujo], key = p.dibujo + p.tipo + p.param;
        assert.ok(!vistos[key], 'pregunta repetida en el mismo dibujo: ' + p.texto); vistos[key] = 1;
        if (p.tipo === 'contar') { assert.ok(p.esperado >= 0 && p.esperado <= 10); assert.strictEqual(p.total, d.objs.length); assert.strictEqual(d.objs.filter(p.vale).length, p.esperado); }
        if (p.tipo === 'toca') assert.ok(d.objs.some(p.vale), 'toca sin opción: ' + p.texto);
        if (p.tipo === 'sino') assert.strictEqual(typeof p.esperado, 'boolean');
        assert.ok(/^[¿A-ZÁÉÍÓÚÑ ,.:?]+$/.test(p.texto), p.texto);
        if (p.param === 'total') assert.ok(!r.preguntas.slice(0, i).some(function (q) { return q.dibujo === p.dibujo; }), 'contar todos va primero');
      });
    }
  });
});
prueba('lectura: errores de conteo y de tocar', function () {
  var p = { esperado: 2, total: 6, otras: [4, 3] };
  assert.strictEqual(LE.errorConteo(p, 2), null);
  assert.strictEqual(LE.errorConteo(p, 6), 'CUENTA_TODOS');
  assert.strictEqual(LE.errorConteo(p, 5, 5), 'REPITE_ANTERIOR');
  assert.strictEqual(LE.errorConteo(p, 4), 'LEE_OTRO');
  assert.strictEqual(LE.errorConteo(p, 1), 'CUENTA_POR_UNO');
  assert.strictEqual(LE.errorConteo(p, 9), 'CUENTA_MAL');
  var t = { tipoObj: 'auto', colorObj: 'azul', vale: function (o) { return o.tipo === 'auto' && o.color === 'azul'; } };
  assert.strictEqual(LE.errorToca(t, { tipo: 'auto', color: 'rojo' }), 'NO_LEE_COLOR');
  assert.strictEqual(LE.errorToca(t, { tipo: 'cubo', color: 'azul' }), 'NO_LEE_OBJETO');
  assert.strictEqual(LE.errorToca(t, { tipo: 'auto', color: 'azul' }), null);
});
prueba('lectura: respuestas escritas', function () {
  assert.deepStrictEqual(LE.corregirEscrita(L, 'escribir:mes', 'OCTUBRE', C).ok, true);
  var m = LE.corregirEscrita(L, 'escribir:mes', 'OTUBRE', C); assert.strictEqual(m.ok, true); assert.ok(m.ortografia.length);
  assert.strictEqual(LE.corregirEscrita(L, 'escribir:miau', 'PERRO', C).error, 'NO_LEE_PREGUNTA');
  assert.strictEqual(LE.corregirEscrita(L, 'escribir:miau', 'MESA', C).error, 'NO_COMPRENDE');
  assert.strictEqual(LE.corregirEscrita(L, 'escribir:manos', '2', C).ok, true);
  assert.strictEqual(LE.corregirEscrita(L, 'escribir:nombre', 'LUZ', C).ok, true);
  assert.strictEqual(LE.corregirEscrita(L, 'escribir:dia', 'MIERCOLES', C).ok, true);
});
