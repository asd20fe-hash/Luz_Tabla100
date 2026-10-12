'use strict';
var assert = require('assert');
var AZ = require('../../actividades/_comun-4to/azar.js'), CE = require('../../actividades/4to-calculo-con-ceros/ceros-logica.js');

prueba('ceros: 1000 ítems por nivel cumplen las restricciones y sus pasos son coherentes', function () {
  for (var nivel = 1; nivel <= 4; nivel++) {
    var az = AZ.crear(90 + nivel), vistos = {};
    for (var i = 0; i < 1000; i++) {
      var it = CE.generar(nivel, az); vistos[it.tipo] = true;
      assert.ok(CE.TIPOS[nivel].some(function (t) { return t[0] === it.tipo; }), 'tipo del nivel ' + nivel + ': ' + it.tipo);
      if (it.tipo === 'M1') {
        assert.ok(it.a >= 10 && it.a <= 999 && it.d >= 2 && it.d <= 9);
        assert.strictEqual(it.filas.length, String(it.a).length);
        assert.strictEqual(it.filas.reduce(function (s, f) { return s + f.parcial; }, 0), it.a * it.d);
        it.filas.forEach(function (f) { assert.strictEqual(f.parcial, it.d * f.mult); });
      }
      if (it.tipo === 'M2') { assert.ok(CE.COMP.some(function (c) { return c[0] === it.a; })); assert.strictEqual(it.d * it.redondo + it.delta * it.d, it.total); assert.strictEqual(it.total, it.a * it.d); }
      if (it.tipo === 'M3') { assert.strictEqual(it.D % it.d, 0); assert.strictEqual(it.q * it.d, it.D); }
      if (it.tipo === 'M4') {
        assert.ok(it.nums.every(function (n) { return n >= 1000 && n <= 9999; }));
        assert.ok(it.cols.some(function (c, k) { return k < 3 && c.s >= 20; }), 'al menos una columna da 20 o más');
        assert.strictEqual(it.total, it.nums[0] + it.nums[1] + it.nums[2]);
        var tot = it.cols[3].s * 1000 + it.cols[2].anota * 100 + it.cols[1].anota * 10 + it.cols[0].anota; assert.strictEqual(tot, it.total, 'las columnas arman el total');
      }
      var pasos = CE.pasosDe(it, nivel);
      assert.ok(pasos.length >= 1);
      pasos.forEach(function (p) {
        if (p.kind === 'num') { assert.ok(p.validar(p.esp).ok, it.tipo + ' ' + p.id + ' acepta su respuesta'); assert.ok(!p.validar(p.esp + 1).ok, p.id + ' rechaza esp + 1'); }
        if (p.kind === 'mm') { assert.ok(p.validar(p.esp).ok); assert.ok(!p.validar(p.esp === 'mas' ? 'menos' : 'mas').ok); }
        if (p.kind === 'cuantas') { assert.ok(p.validar(p.esp).ok); assert.ok(p.opciones.indexOf(p.esp) >= 0); }
      });
      if (nivel === 4) assert.strictEqual(pasos[0].id, 'estimar', 'estimación previa obligatoria en el nivel 4');
      if (nivel === 2 && it.tipo === 'M3') assert.strictEqual(pasos[pasos.length - 1].id, 'comprobar', 'autocomprobación');
    }
    CE.TIPOS[nivel].forEach(function (t) { assert.ok(vistos[t[0]], 'aparece ' + t[0] + ' en el nivel ' + nivel); });
  }
});
prueba('ceros: familia trampa 12, 120, 1.200 y 12.000', function () {
  var az = AZ.crear(4), fam = 0, mitad = 0;
  for (var i = 0; i < 500; i++) { var it = CE.itemM3(az, 2); if (it.familia) { fam++; assert.ok([12, 120, 1200, 12000].indexOf(it.D) >= 0); } }
  assert.ok(fam > 150, 'la familia aparece seguido: ' + fam);
});
prueba('ceros: errores típicos con sus códigos y pistas', function () {
  var m3 = { tipo: 'M3', D: 120, d: 5, q: 24 }, p = CE.pasosDe(m3, 2)[0], v = p.validar(60);
  assert.strictEqual(v.codigo, 'MITAD_AUTOMATICA'); assert.ok(/dividís por 5, no por 2/.test(v.pista) && /60 × 5/.test(v.pista));
  assert.strictEqual(CE.pasosDe({ tipo: 'M3', D: 12000, d: 3, q: 4000 }, 3)[0].validar(6000).codigo, 'MITAD_AUTOMATICA');
  var m2 = { tipo: 'M2', a: 39, d: 4, redondo: 40, delta: -1, p1: 160, p2: 4, total: 156 }, d = CE.pasosDe(m2, 3)[0];
  assert.ok(d.validar(156).ok); var e = d.validar(196); assert.strictEqual(e.codigo, 'MEZCLA_ESTRATEGIA'); assert.ok(/39 está cerca de 40/.test(e.pista) && /sacá lo que pusiste de más/.test(e.pista));
  var m1 = { tipo: 'M1', a: 199, d: 8, total: 1592, filas: [{ k: 0, dig: 9, mult: 9, parcial: 72 }, { k: 1, dig: 9, mult: 90, parcial: 720 }, { k: 2, dig: 1, mult: 100, parcial: 800 }] };
  var f = CE.pasosDe(m1, 1)[1].validar(72); assert.strictEqual(f.codigo, 'CERO_PERDIDO'); assert.ok(/8 × 90 es 720, no 72/.test(f.pista));
  var dir = CE.pasosDe(m1, 4)[1].validar(944); assert.strictEqual(dir.codigo, 'CERO_PERDIDO'); assert.ok(/Ojo con los ceros: 8 × 90 es 720, no 72\./.test(dir.pista));
  var m4 = CE.itemM4(AZ.crear(1)), pasos = CE.pasosDe(m4, 1), lleva = pasos.filter(function (x) { return x.fase === 'lleva'; })[0], r = lleva.validar(lleva.esp + 1);
  assert.strictEqual(r.codigo, 'RESERVA'); assert.ok(/te dio \d+: anotás \d+ y te llevás \d+/.test(r.pista));
  var suma = [1328, 1872, 3933]; assert.strictEqual(CE.pasosDe({ tipo: 'M4', nums: suma, cols: CE.columnas(suma), total: 7133 }, 4)[1].validar(6133).codigo, 'RESERVA');
});
prueba('ceros: umbral de la estimación nunca coincide con el resultado', function () {
  for (var c = 1; c < 40000; c += 7) { var t = CE.umbral(c); assert.notStrictEqual(t, c); assert.ok(t > 0); }
});
prueba('ceros: misma semilla, misma secuencia', function () {
  function seq(s) { var az = AZ.crear(s), o = []; for (var i = 0; i < 40; i++) o.push(JSON.stringify(CE.generar(4, az))); return o.join('|'); }
  assert.strictEqual(seq(5), seq(5)); assert.notStrictEqual(seq(5), seq(6));
});
