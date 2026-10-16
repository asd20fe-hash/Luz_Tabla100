'use strict';
var assert = require('assert'), C = require('./comun.js'), V = C.V, JG = C.JG, RP = C.RP, SA = C.SA;
prueba('salidas: frases del café, del restaurante y del cine', function () {
  assert.strictEqual(SA.pideCafe(V.por('JUICE')), 'I want a juice!');
  assert.strictEqual(SA.pideCafe(V.por('POPCORN')), 'I want some popcorn!');
  assert.strictEqual(SA.pideResto(V.por('SOUP')), 'Can I have some soup, please?');
  assert.strictEqual(SA.pideResto(V.por('HAMBURGER')), 'Can I have a hamburger, please?');
  assert.strictEqual(SA.pideEntradas(1), 'One ticket, please!'); assert.strictEqual(SA.pideEntradas(3), 'Three tickets, please!');
  assert.strictEqual(SA.cuenta(1), "That's one coin!"); assert.strictEqual(SA.cuenta(4), "That's four coins!");
  assert.strictEqual(JG.get('mochila').orden(V.por('PENCIL')), 'Put the pencil in the bag!');
  assert.strictEqual(JG.get('mochila').orden(V.por('SCISSORS')), 'Put the scissors in the bag!');
  assert.strictEqual(JG.get('mochila').orden(V.por('CHAIR')), 'Where is the chair?');
  assert.strictEqual(JG.get('cafe').orden(V.por('DONUT'), 'Mimi'), 'Give Mimi a donut!');
});
prueba('salidas: café y restaurante siempre alcanzan con las monedas (1000 por nivel y plata)', function () {
  var az = C.AZ.crear(21);
  [1, 2, 3].forEach(function (nv) {
    [0, 1, 2, 3, 5, 20].forEach(function (plata) {
      for (var i = 0; i < 1000; i++) {
        var c = SA.cafe({ nivel: nv, az: az, rep: RP.vacio(), monedas: plata }), r = SA.resto({ nivel: nv, az: az, monedas: plata });
        [c, r].forEach(function (x) { assert.ok(x.total <= plata, x.total + ' > ' + plata); assert.strictEqual(x.total, SA.suma(x.items)); x.items.forEach(function (w) { assert.ok(w.nivel <= nv); }); });
        c.items.forEach(function (w) { assert.strictEqual(w.tema, 'cafe'); });
        if (r.items.length) assert.strictEqual(r.items[0].tema, 'platos');
        if (r.items[1]) { assert.strictEqual(r.items[1].tema, 'comida'); assert.ok(SA.POSTRES.indexOf(r.items[1].en) >= 0); }
        if (plata >= 20) { assert.strictEqual(c.items.length, nv > 1 ? 2 : 1); assert.strictEqual(r.items.length, nv > 1 ? 2 : 1); }
        if (plata === 0) { assert.strictEqual(c.items.length, 0); assert.strictEqual(r.items.length, 0); }
        if (plata >= 1) assert.ok(c.items.length >= 1, 'con 1 ⭐ alcanza para algo del café');
      }
    });
  });
});
prueba('salidas: cine (entradas, snack y escenas de sentimientos)', function () {
  var az = C.AZ.crear(5);
  [1, 2, 3].forEach(function (nv) {
    [0, 1, 2, 3, 30].forEach(function (plata) {
      for (var i = 0; i < 1000; i++) {
        var c = SA.cine({ nivel: nv, az: az, monedas: plata });
        if (plata < 2) { assert.strictEqual(c, null); continue; }
        assert.ok(c, 'con ' + plata + ' ⭐ alcanza'); assert.ok(c.total <= plata); assert.strictEqual(c.total, c.entradas * SA.ENTRADA + SA.precio(c.snack));
        assert.ok(c.entradas >= 1 && c.entradas <= Math.min(3, nv + 1)); assert.ok(SA.SNACKS.indexOf(c.snack.en) >= 0);
        assert.strictEqual(c.escenas.length, nv > 1 ? 3 : 2); assert.strictEqual(new Set(c.escenas).size, c.escenas.length);
        c.escenas.forEach(function (w) { assert.strictEqual(w.tema, 'sentimientos'); assert.ok(w.nivel <= nv); });
      }
    });
  });
});
prueba('salidas: el cine tiene una escena para cada sentimiento', function () {
  var fs = require('fs'), path = require('path'), src = fs.readFileSync(path.join(__dirname, C.R, '_comun-ingles/escenas-salidas.js'), 'utf8');
  V.palabras({ temas: ['sentimientos'] }).forEach(function (w) { assert.ok(new RegExp('\\b' + w.sentir + ': function').test(src), 'sin escena: ' + w.sentir); });
});
prueba('salidas: pizarrón (cuántos hasta 5 o 10, colores sin negro) y la respuesta en las opciones', function () {
  var az = C.AZ.crear(9);
  [1, 2, 3].forEach(function (nv) {
    for (var i = 0; i < 1000; i++) {
      var q = SA.pizarra(nv, az, i);
      assert.ok(SA.FORMAS.indexOf(q.forma) >= 0); assert.ok(SA.NOMBRE_FORMA[q.forma]); assert.notStrictEqual(q.color, 'BLACK'); assert.ok(V.por(q.color).nivel <= nv);
      if (i % 2 === 0) { assert.strictEqual(q.tipo, 'cuantos'); assert.strictEqual(q.w.n, q.n); assert.ok(q.n >= 1 && q.n <= (nv > 1 ? 10 : 5)); assert.ok(JG.get('contar').opciones(q.w, nv, az).indexOf(q.w) >= 0); }
      else { assert.strictEqual(q.tipo, 'color'); assert.strictEqual(q.w.en, q.color); assert.ok(q.n >= 2 && q.n <= 4); }
    }
  });
});
