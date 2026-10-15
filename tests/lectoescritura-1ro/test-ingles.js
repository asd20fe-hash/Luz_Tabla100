'use strict';
var assert = require('assert'), IN = require('../../actividades/1ro-ingles/ingles-logica.js'), L = require('../../actividades/_comun-1ro/lengua.js');
var RP = require('../../actividades/_comun-1ro/repaso.js'), AZ = require('../../actividades/_comun-4to/azar.js');
prueba('inglés: vocabulario', function () {
  var vistos = {};
  IN.VOCAB.forEach(function (w) {
    assert.ok(!vistos[w.en], 'repetida ' + w.en); vistos[w.en] = 1;
    assert.ok(w.img || w.color, 'sin dibujo ' + w.en); assert.ok(IN.TEMAS[w.tema], w.tema); assert.ok(w.es);
  });
  [1, 2, 3].forEach(function (nv) { Object.keys(IN.TEMAS).forEach(function (t) {
    var n = IN.VOCAB.filter(function (w) { return w.tema === t && w.nivel <= Math.max(nv, 2); }).length; assert.ok(n >= 4, t + ' nivel ' + nv + ': ' + n); }); });
  IN.PARECIDAS.forEach(function (p) { assert.ok(IN.POR[p[0]] && IN.POR[p[1]]); });
});
prueba('inglés: 1000 rondas por nivel, con semilla', function () {
  [1, 2, 3].forEach(function (nv) {
    var az = AZ.crear(200 + nv), rep = RP.vacio(), tipos = {};
    for (var k = 0; k < 1000; k++) {
      var r = IN.armarRonda(nv, az, rep, RP);
      assert.strictEqual(r.length, 8);
      assert.strictEqual(new Set(r.map(function (it) { return it.w.en; })).size, 8);
      r.forEach(function (it) {
        tipos[it.tipo] = 1; assert.ok(it.w.nivel <= nv);
        if (it.opciones) { assert.strictEqual(it.opciones.length, nv === 1 ? 3 : 4, it.w.en); assert.ok(it.opciones.indexOf(it.w) >= 0); assert.strictEqual(new Set(it.opciones).size, it.opciones.length); }
        if (it.tipo === 'sino') assert.ok(it.dice);
        if (it.tipo === 'escribe') assert.ok(it.w.en.length <= 5 && it.w.en.indexOf(' ') < 0);
      });
    }
    if (nv === 1) assert.deepStrictEqual(Object.keys(tipos), ['escucha']);
    if (nv === 3) assert.deepStrictEqual(Object.keys(tipos).sort(), ['escribe', 'escucha', 'lee', 'sino']);
  });
});
prueba('inglés: errores', function () {
  var P = IN.POR;
  assert.strictEqual(IN.errorEleccion(P.CAT, P.CAT), null);
  assert.strictEqual(IN.errorEleccion(P.CAT, P.DOG), 'CONFUNDE_TEMA');
  assert.strictEqual(IN.errorEleccion(P.THREE, P.TREE), 'CONFUNDE_PARECIDA');
  assert.strictEqual(IN.errorEleccion(P.CAT, P.SUN), 'CONFUNDE_OTRA');
  assert.strictEqual(L.clasificar('BUS', 'BAS', { idioma: 'en' }).primario, 'CAMBIA_LETRA');
  assert.strictEqual(L.clasificar('BUS', 'VUS', { idioma: 'en' }).primario, 'CAMBIA_LETRA');
  assert.strictEqual(L.clasificar('BUS', 'VUS').primario, 'B_V');
});
