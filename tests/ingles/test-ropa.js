'use strict';
var assert = require('assert'), C = require('./comun.js'), V = C.V, JG = C.JG, ROPA = C.ROPA, PET = C.PET;
prueba('ropa: cada prenda tiene su lugar y su precio; frases con y sin artículo', function () {
  V.palabras({ temas: ['ropa'] }).forEach(function (w) { assert.ok(ROPA.SLOT[w.en], w.en + ' sin lugar'); assert.ok(ROPA.precio({ en: w.en }) >= 2); });
  assert.strictEqual(ROPA.frase({ en: 'HAT', color: 'RED' }), 'a red hat');
  assert.strictEqual(ROPA.frase({ en: 'CAP', color: 'ORANGE' }), 'an orange cap');
  assert.strictEqual(ROPA.frase({ en: 'GLASSES', color: 'BLUE' }), 'blue glasses');
  assert.strictEqual(ROPA.frase({ en: 'SHOES' }), 'shoes');
});
prueba('ropa: regalo, comprar, poner y sacar (una prenda por lugar)', function () {
  var pet = PET.nuevo(0); pet.monedas = 5;
  var r = ROPA.regalo(pet); assert.deepStrictEqual(r, { en: 'HAT', color: 'RED' }); assert.ok(ROPA.puesta(pet, r)); assert.strictEqual(ROPA.regalo(pet), null, 'una sola vez');
  assert.ok(!ROPA.comprar(pet, { en: 'HAT', color: 'RED' }), 'ya lo tiene');
  assert.ok(ROPA.comprar(pet, { en: 'CAP', color: 'RED' })); assert.strictEqual(pet.monedas, 2);
  assert.ok(!ROPA.comprar(pet, { en: 'CROWN', color: 'RED' }), 'no le alcanza'); assert.strictEqual(pet.monedas, 2);
  ROPA.poner(pet, { en: 'CAP', color: 'RED' }); assert.ok(!ROPA.puesta(pet, r), 'la gorra reemplaza al sombrero'); assert.strictEqual(Object.keys(pet.puesto).length, 1);
  ROPA.sacar(pet, 'cabeza'); assert.deepStrictEqual(pet.puesto, {});
  assert.deepStrictEqual(PET.normalizar({ nacido: true }, 0).ropa, [], 'estados viejos reciben ropa vacía');
});
prueba('ropa: ofertas sin lo que ya tiene, de nivel ≤ nivel, un tipo por vez', function () {
  var az = C.AZ.crear(4);
  [1, 2, 3].forEach(function (nv) {
    for (var i = 0; i < 300; i++) {
      var pet = PET.nuevo(0); ROPA.regalo(pet);
      var of = ROPA.ofertas(pet, nv, az, 3), tipos = of.map(function (x) { return x.en; });
      assert.strictEqual(of.length, 3); assert.strictEqual(new Set(tipos).size, 3);
      of.forEach(function (x) { assert.ok(!ROPA.tiene(pet, x)); assert.ok(V.por(x.en).nivel <= nv); assert.ok(V.por(x.color).nivel <= nv); });
      if (nv === 1) assert.ok(tipos.indexOf('HAT') < 0 || tipos.length === 3, 'primero lo que no tiene');
    }
  });
});
prueba('Dress up!: orden, colores por opción y COLOR_MAL', function () {
  var j = JG.get('vestir'), az = C.AZ.crear(8);
  assert.strictEqual(j.orden(V.por('HAT'), 'Mimi', {}), 'Put the hat on Mimi!');
  assert.strictEqual(j.orden(V.por('HAT'), 'Mimi', { color: 'RED' }), 'Put a red hat on Mimi!');
  assert.strictEqual(j.orden(V.por('SHOES'), 'Bo', { color: 'BLUE' }), 'Put blue shoes on Bo!');
  [1, 2, 3].forEach(function (nv) {
    V.palabras({ temas: ['ropa'], nivel: nv }).forEach(function (w) {
      for (var i = 0; i < 200; i++) {
        var p = { w: w, opciones: j.opciones(w, nv, az) }; j.preparar(p, nv, az);
        assert.strictEqual(p.colores.length, p.opciones.length);
        var buenas = p.opciones.filter(function (x, k) { return x === w && (!p.color || p.colores[k] === p.color); });
        assert.strictEqual(buenas.length, 1, 'una sola correcta');
        if (nv < 2) assert.ok(!p.color); else assert.ok(p.color);
        p.opciones.forEach(function (x, k) {
          var err = j.error(w, x, p, { color: p.colores[k] }), ok = x === w && (!p.color || p.colores[k] === p.color);
          assert.strictEqual(!err, ok); if (x === w && !ok) assert.strictEqual(err, 'COLOR_MAL');
        });
      }
    });
  });
});
