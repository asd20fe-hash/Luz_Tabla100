'use strict';
var assert = require('assert'), C = require('./comun.js'), V = C.V, JG = C.JG, LC = C.LC, RP = C.RP;
function juegos(p) { return p.filter(function (x) { return x.tipo === 'juego'; }); }
prueba('juegos: registrados con su tema y sus frases', function () {
  assert.deepStrictEqual(JG.lista().map(function (j) { return j.id; }), ['pintar', 'comer', 'tocar', 'buscar', 'contar', 'sentir', 'vestir', 'hacer', 'cafe', 'resto', 'mochila']);
  JG.lista().forEach(function (j) { assert.ok(V.getTema(j.tema), j.id); assert.strictEqual(typeof j.jugar, 'function'); });
  assert.strictEqual(JG.get('pintar').orden(V.por('BLUE'), 'Pip'), 'Paint Pip blue!');
  assert.strictEqual(JG.get('comer').orden(V.por('APPLE'), 'Mimi'), 'Give Mimi an apple!');
  assert.strictEqual(JG.get('comer').orden(V.por('ICE CREAM'), 'Bo'), 'Give Bo some ice cream!');
});
prueba('lección: la primera presenta palabras nuevas y las practica enseguida', function () {
  var p = LC.armar({ nivel: 1, rep: RP.vacio(), az: C.AZ.crear(1) });
  assert.strictEqual(p[0].tipo, 'hola'); assert.strictEqual(p[p.length - 1].tipo, 'chau');
  var pres = p.filter(function (x) { return x.tipo === 'presenta'; });
  assert.strictEqual(pres.length, LC.NUEVAS); assert.strictEqual(juegos(p).length, LC.PRACTICA);
  var tm = pres.map(function (x) { return x.w.tema; }); assert.strictEqual(new Set(tm).size, tm.length, 'alterna temas: ' + tm);
  pres.forEach(function (x) { var i = p.indexOf(x); assert.strictEqual(p[i + 1].tipo, 'juego'); assert.strictEqual(p[i + 1].w, x.w); });
});
prueba('lección: 1000 lecciones por nivel, con semilla y repaso', function () {
  [1, 2, 3].forEach(function (nv) {
    var az = C.AZ.crear(50 + nv), rep = RP.vacio(), vistas = {};
    for (var k = 0; k < 1000; k++) {
      var p = LC.armar({ nivel: nv, rep: rep, az: az }), js = juegos(p), pres = p.filter(function (x) { return x.tipo === 'presenta'; });
      assert.ok(pres.length <= LC.NUEVAS); assert.strictEqual(js.length, LC.PRACTICA);
      pres.forEach(function (x) { assert.ok(!rep.items[x.w.en], 'presenta una ya vista: ' + x.w.en); });
      for (var i = 1; i < p.length; i++) if (p[i].tipo === 'juego' && p[i - 1].tipo === 'juego') assert.notStrictEqual(p[i].w, p[i - 1].w, 'dos seguidas');
      js.forEach(function (x) {
        assert.ok(x.w.nivel <= nv); assert.strictEqual(JG.get(x.juego).tema, x.w.tema);
        assert.strictEqual(x.opciones.length, JG.cuantas(nv) + (x.juego === 'buscar' || x.juego === 'mochila' ? 1 : 0)); assert.ok(x.opciones.indexOf(x.w) >= 0);
        RP.registrar(rep, x.w.en, az.prob(0.8)); vistas[x.w.en] = 1;
      });
    }
    assert.strictEqual(Object.keys(vistas).length, LC.pool(nv).length, 'nivel ' + nv + ': no salieron todas las palabras');
  });
});
prueba('lección: con todo visto, solo repaso; lo errado vuelve', function () {
  var rep = RP.vacio(), az = C.AZ.crear(3);
  LC.pool(1).forEach(function (w) { RP.registrar(rep, w.en, true); });
  RP.registrar(rep, 'RED', false);
  for (var k = 0; k < 200; k++) {
    var p = LC.armar({ nivel: 1, rep: rep, az: az });
    assert.strictEqual(p.filter(function (x) { return x.tipo === 'presenta'; }).length, 0);
    assert.ok(juegos(p).some(function (x) { return x.w.en === 'RED'; }), 'RED no volvió');
  }
});
prueba('juego libre: ronda de un solo juego', function () {
  var az = C.AZ.crear(9);
  for (var k = 0; k < 500; k++) {
    var r = LC.rondaJuego({ juego: 'comer', nivel: 1 + k % 3, rep: RP.vacio(), az: az, n: 6 });
    assert.strictEqual(r.length, 6);
    r.forEach(function (x, i) { assert.strictEqual(x.juego, 'comer'); assert.strictEqual(x.w.tema, 'comida'); if (i) assert.notStrictEqual(x.w, r[i - 1].w); });
  }
});
prueba('juego Find it: orden y opciones', function () {
  var j = JG.get('buscar'), w = V.por('BALL'), az = C.AZ.crear(3);
  assert.strictEqual(j.orden(w), 'Where is the ball?');
  for (var i = 0; i < 200; i++) { var op = j.opciones(w, 1, az); assert.ok(op.indexOf(w) >= 0); assert.strictEqual(op.length, JG.cuantas(1) + 1); op.forEach(function (x) { assert.strictEqual(x.tema, 'cosas'); }); }
});
