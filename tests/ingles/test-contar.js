'use strict';
var assert = require('assert'), C = require('./comun.js'), V = C.V, JG = C.JG, LC = C.LC, RP = C.RP;
prueba('How many?: orden con la comida del paso, en singular o plural', function () {
  var j = JG.get('contar');
  assert.strictEqual(j.orden(V.por('THREE'), 'Mimi', { cosa: 'APPLE' }), 'Give Mimi three apples!');
  assert.strictEqual(j.orden(V.por('ONE'), 'Bo', { cosa: 'BANANA' }), 'Give Bo one banana!');
  assert.strictEqual(j.orden(V.por('TWO'), 'Bo', { cosa: 'STRAWBERRY' }), 'Give Bo two strawberries!');
  j.contables(3).forEach(function (c) { assert.notStrictEqual(c.art, 'some', c.en); assert.ok(c.nivel <= 2); });
  assert.strictEqual(j.error(V.por('THREE'), V.por('FOUR')), 'CANTIDAD_MAL'); assert.strictEqual(j.error(V.por('THREE'), V.por('THREE')), null);
});
prueba('How many?: opciones (hasta 5 en el nivel 1; separadas por 2 desde el nivel 2) y paso preparado', function () {
  var j = JG.get('contar'), az = C.AZ.crear(11);
  [1, 2, 3].forEach(function (nv) {
    V.palabras({ temas: ['numeros'], nivel: nv }).forEach(function (w) {
      for (var i = 0; i < 300; i++) {
        var op = j.opciones(w, nv, az), ns = op.map(function (x) { return x.n; });
        assert.strictEqual(op.length, JG.cuantas(nv)); assert.ok(op.indexOf(w) >= 0); assert.strictEqual(new Set(ns).size, ns.length);
        op.forEach(function (x) { assert.strictEqual(x.tema, 'numeros'); if (nv === 1) assert.ok(x.n <= 5); });
        if (nv > 1) ns.forEach(function (a, ia) { ns.forEach(function (b, ib) { if (ia !== ib) assert.ok(Math.abs(a - b) >= 2, ns.join(',')); }); });
      }
    });
  });
  var r = LC.rondaJuego({ juego: 'contar', nivel: 1, rep: RP.vacio(), az: az, n: 6 });
  r.forEach(function (p) { assert.ok(V.por(p.cosa), 'sin comida'); assert.ok(p.w.n <= 5); });
});
prueba('How is Pip?: sentimientos con su animación y la orden', function () {
  var j = JG.get('sentir'), ANIM = ['happy', 'sad', 'hungry', 'sleepy', 'angry', 'scared', 'surprised', 'cold', 'hot'];
  V.palabras({ temas: ['sentimientos'] }).forEach(function (w) { assert.ok(ANIM.indexOf(w.sentir) >= 0, w.en); assert.ok(w.img); });
  assert.strictEqual(j.orden(V.por('SAD'), 'Mimi'), 'Mimi is sad!');
  assert.ok(V.palabras({ temas: ['sentimientos'], nivel: 1 }).length >= 3, 'la casa pregunta con 3 caritas de nivel 1');
});
