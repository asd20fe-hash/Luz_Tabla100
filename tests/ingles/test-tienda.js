'use strict';
var assert = require('assert'), C = require('./comun.js'), TD = C.TD, V = C.V, PET = C.PET, RP = C.RP, AZ = C.AZ;
prueba('súper: la lista siempre alcanza con las monedas y no pasa de diez', function () {
  [1, 2, 3].forEach(function (nivel) {
    var az = AZ.crear(7 + nivel), rep = RP.vacio();
    for (var i = 0; i < 1000; i++) {
      var plata = az.entero(0, 30), l = TD.lista({ nivel: nivel, az: az, rep: rep, monedas: plata }), cfg = TD.POR_NIVEL[nivel];
      assert.ok(TD.total(l) <= Math.min(plata, TD.TOPE), 'total ' + TD.total(l) + ' con ' + plata);
      assert.ok(l.length <= cfg.cosas);
      if (plata >= 1) assert.ok(l.length >= 1, 'con ' + plata + ' monedas tiene que poder comprar algo');
      var ens = l.map(function (x) { return x.w.en; }); assert.strictEqual(new Set(ens).size, ens.length, 'sin repetir');
      l.forEach(function (x) {
        assert.strictEqual(x.w.tema, 'comida'); assert.ok(x.w.nivel <= nivel); assert.ok(x.n >= 1 && x.n <= cfg.max);
        if (x.w.art === 'some') assert.strictEqual(x.n, 1, 'lo incontable va de a uno: ' + x.w.en);
      });
      var est = TD.estante(l, nivel, az);
      assert.strictEqual(est.length, TD.ESTANTE); assert.strictEqual(new Set(est).size, est.length);
      l.forEach(function (x) { assert.ok(est.indexOf(x.w) >= 0, 'lo de la lista está en el estante'); });
    }
  });
  assert.deepStrictEqual(TD.lista({ nivel: 1, az: AZ.crear(1), monedas: 0 }), []);
});
prueba('súper: frases del pedido', function () {
  assert.strictEqual(TD.pedido(V.por('APPLE'), 1), 'an apple');
  assert.strictEqual(TD.pedido(V.por('BANANA'), 2), 'two bananas');
  assert.strictEqual(TD.pedido(V.por('STRAWBERRY'), 3), 'three strawberries');
  assert.strictEqual(TD.pedido(V.por('MILK'), 1), 'some milk');
  assert.strictEqual(TD.numero(10), 'ten');
  V.palabras({ temas: ['comida'] }).forEach(function (w) { assert.ok([1, 2, 3].indexOf(TD.precio(w)) >= 0); });
});
prueba('despensa: guardar, sacar y pagar', function () {
  var pet = PET.normalizar({ nacido: true, monedas: 5 }, 0);
  assert.deepStrictEqual(pet.despensa, {});
  TD.guardar(pet, 'APPLE', 2); TD.guardar(pet, 'MILK'); assert.strictEqual(TD.cuantas(pet), 3);
  assert.ok(TD.sacar(pet, 'APPLE')); assert.ok(TD.sacar(pet, 'APPLE')); assert.ok(!TD.sacar(pet, 'APPLE'));
  assert.deepStrictEqual(TD.despensa(pet).map(function (x) { return x.w.en + x.n; }), ['MILK1']);
  pet.despensa.NOEXISTE = 3; assert.strictEqual(TD.cuantas(pet), 1, 'lo que ya no existe en el vocabulario se ignora');
  assert.ok(!TD.pagar(pet, 6)); assert.strictEqual(pet.monedas, 5); assert.ok(TD.pagar(pet, 5)); assert.strictEqual(pet.monedas, 0);
});
prueba('juego Touch Pip: orden y partes', function () {
  var j = C.JG.get('tocar');
  assert.strictEqual(j.orden(V.por('NOSE'), 'Mimi'), "Touch Mimi's nose!");
  assert.strictEqual(C.JG.deTema('cuerpo'), j);
});
