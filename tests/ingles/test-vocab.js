'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path'), C = require('./comun.js'), V = C.V;
prueba('vocabulario: temas, palabras únicas y con dibujo', function () {
  assert.deepStrictEqual(V.temas().map(function (t) { return t.id; }), ['colores', 'comida', 'numeros', 'cosas', 'cuerpo']);
  var vistas = {};
  V.palabras().forEach(function (w) {
    assert.ok(!vistas[w.en], 'repetida ' + w.en); vistas[w.en] = 1;
    assert.ok(w.img || /^#[0-9a-f]{6}$/i.test(w.color), 'sin dibujo ' + w.en); assert.ok(w.es); assert.ok(w.nivel >= 1 && w.nivel <= 3);
    assert.strictEqual(w.en, w.en.toUpperCase());
  });
  V.temas().forEach(function (t) { assert.ok(V.palabras({ temas: [t.id], nivel: 1 }).length >= 4, t.id + ' tiene menos de 4 palabras de nivel 1'); });
  assert.throws(function () { V.tema({ id: 'otro', palabras: [['RED', 'ROJO', '#ff0000', 1]] }); }, /repetida/);
});
prueba('vocabulario: artículos para las frases', function () {
  assert.strictEqual(V.por('APPLE').art, 'an'); assert.strictEqual(V.por('BANANA').art, 'a'); assert.strictEqual(V.por('MILK').art, 'some');
  assert.strictEqual(V.por('RED').art, ''); assert.strictEqual(V.por('THREE').art, '');
});
prueba('vocabulario: las partes del cuerpo existen en el modelo 3D', function () {
  var src = fs.readFileSync(path.join(__dirname, C.R, '_comun-ingles/mascota3d.js'), 'utf8'), partes = {};
  src.replace(/parte\('(\w+)'/g, function (_, p) { partes[p] = 1; });
  V.palabras({ temas: ['cuerpo'] }).forEach(function (w) { assert.ok(w.parte && partes[w.parte], w.en + ' → ' + w.parte); });
});
prueba('vocabulario: opciones y errores', function () {
  var az = C.AZ.crear(7);
  V.palabras().forEach(function (w) {
    [1, 2, 3].forEach(function (nv) {
      var o = V.opciones(w, nv === 1 ? 3 : 4, nv, az);
      assert.ok(o.indexOf(w) >= 0); assert.strictEqual(new Set(o).size, o.length);
      o.forEach(function (x) { assert.strictEqual(x.tema, w.tema, 'otro tema en ' + w.en); });
    });
  });
  assert.strictEqual(V.errorEleccion(V.por('RED'), V.por('RED')), null);
  assert.strictEqual(V.errorEleccion(V.por('RED'), V.por('BLUE')), 'CONFUNDE_TEMA');
  assert.strictEqual(V.errorEleccion(V.por('CAR'), V.por('STAR')), 'CONFUNDE_PARECIDA');
  assert.strictEqual(V.errorEleccion(V.por('RED'), V.por('APPLE')), 'CONFUNDE_OTRA');
  assert.strictEqual(V.parecida('BEAR'), null);        // PEAR existe pero BEAR no: no hay trampa
});
