'use strict';
var assert = require('assert');
var AZ = require('../../actividades/_comun-4to/azar.js'), EN = require('../../actividades/4to-cuantas-veces-entra/entra-logica.js');

prueba('entra: 1000 ítems por nivel cumplen las restricciones', function () {
  for (var nivel = 1; nivel <= 4; nivel++) {
    var az = AZ.crear(30 + nivel), ultimo = null, A = 0, qAlto = 0, cero = 0, exacto = 0;
    for (var i = 0; i < 1000; i++) {
      var it = EN.generar(nivel, az, {}, ultimo);
      assert.ok(EN.TIPOS[nivel].indexOf(it.tipo) >= 0, 'tipo permitido en nivel ' + nivel);
      assert.notStrictEqual(it.hecho, ultimo, 'no repite el hecho seguido');
      ultimo = it.hecho;
      if (nivel === 4) assert.ok(it.d >= 6 && it.d <= 9, 'solo 6 a 9 en el nivel 4');
      if (it.tipo === 'C') { assert.strictEqual(it.verdadero, it.p === it.d * it.k); assert.ok(it.p >= 0); continue; }
      assert.ok(it.n >= 0 && it.n <= 10 * it.d - 1, 'n en [0, 10d−1]');
      assert.strictEqual(Math.floor(it.n / it.d), it.q); assert.strictEqual(it.n % it.d, it.r);
      if (it.tipo === 'B') {
        assert.strictEqual(it.opciones.length, 4); assert.strictEqual(new Set(it.opciones).size, 4, 'opciones distintas');
        assert.ok(it.opciones.indexOf(it.correcta) >= 0); assert.ok(it.opciones.some(function (o) { return o > it.n; }), 'una se pasa');
        assert.ok(it.opciones.every(function (o) { return o % it.d === 0 && o >= 0; }));
      }
      if (it.tipo === 'A') { A++; if (it.q >= 4) qAlto++; if (it.q === 0) cero++; if (it.r === 0 && it.q > 0) exacto++; }
    }
    assert.ok(qAlto / A > 0.6 || nivel === 3 && qAlto / A > 0.5, 'q sesgado a 4–9 (nivel ' + nivel + '): ' + qAlto / A);
    if (nivel >= 3) { assert.ok(cero / A > 0.01 && cero / A < 0.12, 'q = 0 cerca del 5 %: ' + cero / A); assert.ok(exacto / A > 0.12 && exacto / A < 0.32, 'exactos cerca del 20 %: ' + exacto / A); }
    else assert.strictEqual(cero, 0);
  }
});
prueba('entra: los divisores 6, 7 y 8 pesan más en los niveles 1 y 2', function () {
  var az = AZ.crear(5), c = { alto: 0, bajo: 0 };
  for (var i = 0; i < 4000; i++) { var d = EN.generar(1, az, {}, null).d; if (d >= 6 && d <= 8) c.alto++; else c.bajo++; }
  assert.ok(c.alto / 3 > c.bajo / 5 * 2, '6-8 más frecuentes: ' + JSON.stringify(c));
});
prueba('entra: los hechos con fallas pesan el doble', function () {
  var az = AZ.crear(8), n = 0, tot = 4000, pesos = { '7x8': 2 };
  for (var i = 0; i < tot; i++) { var it = EN.generar(2, az, pesos, null); if (it.hecho === '7x8') n++; }
  var az2 = AZ.crear(8), m = 0;
  for (i = 0; i < tot; i++) { if (EN.generar(2, az2, {}, null).hecho === '7x8') m++; }
  assert.ok(n > m * 1.4, 'más seguido con peso: ' + n + ' vs ' + m);
});
prueba('entra: misma semilla, misma secuencia', function () {
  function seq(s) { var az = AZ.crear(s), o = [], u = null; for (var i = 0; i < 40; i++) { var it = EN.generar(2, az, {}, u); u = it.hecho; o.push(JSON.stringify(it)); } return o.join('|'); }
  assert.strictEqual(seq(9), seq(9)); assert.notStrictEqual(seq(9), seq(10));
});
prueba('entra: validar da uno menos (-1) y se pasa (+1), con sus pistas', function () {
  var it = { tipo: 'A', d: 8, q: 9, r: 0, n: 72 };
  var a = EN.validar(it, 'q', 8); assert.strictEqual(a.ok, false); assert.strictEqual(a.codigo, 'FACTOR_CHICO'); assert.strictEqual(a.dir, -1);
  assert.ok(/8 × 8 = 64/.test(a.pista) && /Sobran 8/.test(a.pista) && /entra otra vez/.test(a.pista));
  var b = EN.validar(it, 'q', 10); assert.strictEqual(b.codigo, 'FACTOR_GRANDE'); assert.strictEqual(b.dir, 1); assert.ok(/se pasa de 72/.test(b.pista));
  assert.strictEqual(EN.validar(it, 'q', 9).ok, true);
  assert.strictEqual(EN.validar(it, 'r', 3).codigo, 'RESTA'); assert.strictEqual(EN.validar(it, 'r', 0).ok, true);
});
prueba('entra: ítem B y C', function () {
  var b = { tipo: 'B', d: 6, q: 7, r: 4, n: 46, correcta: 42, opciones: [36, 42, 48, 54] };
  assert.strictEqual(EN.validar(b, 'B', 42).ok, true); assert.strictEqual(EN.validar(b, 'B', 48).codigo, 'FACTOR_GRANDE'); assert.strictEqual(EN.validar(b, 'B', 36).codigo, 'FACTOR_CHICO');
  var c = { tipo: 'C', d: 8, k: 8, p: 62, verdadero: false };
  assert.strictEqual(EN.validar(c, 'C', false).ok, true); var m = EN.validar(c, 'C', true); assert.strictEqual(m.codigo, 'TABLA'); assert.ok(/8 × 7 = 56/.test(m.pista));
});
