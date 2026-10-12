'use strict';
var assert = require('assert');
var AZ = require('../../actividades/_comun-4to/azar.js'), DIV = require('../../actividades/_comun-4to/division-lib.js');
var SE = require('../../actividades/4to-tiene-sentido/sentido-logica.js');

prueba('sentido: 1000 ítems por nivel cumplen las restricciones', function () {
  for (var nivel = 1; nivel <= 3; nivel++) {
    var az = AZ.crear(50 + nivel), ses = { div: { usados: {}, cuadernoUsado: false } }, conError = 0, t2 = 0, bien = 0, total = 0;
    for (var i = 0; i < 1000; i++) {
      var it = SE.generar(nivel, az, ses); total++;
      assert.ok(SE.TIPOS[nivel].indexOf(it.tipo) >= 0, 'tipo del nivel ' + nivel + ': ' + it.tipo);
      if (it.tipo === 'T1') { assert.strictEqual(String(Math.floor(it.D / it.d)).length, it.correcta); assert.ok(it.correcta >= 1 && it.correcta <= 4); assert.deepStrictEqual(it.escalera, [it.d, it.d * 10, it.d * 100, it.d * 1000]); }
      if (it.tipo === 'T2') {
        t2++;
        if (it.error) {
          conError++; assert.ok(SE.ERRORES_NIVEL[nivel].indexOf(it.error.tipo) >= 0 || it.error.tipo === 'PASO_EXTRA', 'error permitido: ' + it.error.tipo);
          assert.strictEqual(it.motivos.length, 3); assert.strictEqual(it.motivos.filter(function (m) { return m.ok; }).length, 1);
          assert.strictEqual(new Set(it.motivos.map(function (m) { return m.t; })).size, 3);
          if (nivel === 1) assert.strictEqual(it.error.tipo, 'PASO_EXTRA', 'nivel 1: errores evidentes');
        } else assert.ok(JSON.stringify(it.vista) === JSON.stringify(DIV.vistaDe(DIV.simular(it.D, it.d))), 'sin error: la cuenta es la correcta');
      }
      if (it.tipo === 'T3') { assert.strictEqual(it.correcto, it.q * it.d + it.r === it.D); if (it.correcto) bien++; }
      if (it.tipo === 'T5') { assert.strictEqual(it.correcta, it.resp * it.d === it.D); assert.ok(Number.isInteger(it.resp)); }
      if (it.tipo === 'T4') assert.ok(typeof it.razonable === 'boolean' && it.texto.length > 10);
    }
    var frac = 1 - conError / t2;
    assert.ok(frac > 0.2 && frac < 0.4, 'cerca del 30 % de cuentas bien en T2 (nivel ' + nivel + '): ' + frac);
  }
});
prueba('sentido: el nivel 3 incluye ítems T5 con mitad trampa y T3 correctos e incorrectos', function () {
  var az = AZ.crear(8), ses = null, mitad = 0, t5 = 0, t3 = [0, 0];
  for (var i = 0; i < 800; i++) { var it = SE.generar(3, az, ses); ses = ses || { div: { usados: {}, cuadernoUsado: false } }; if (it.tipo === 'T5') { t5++; if (it.esMitad) mitad++; } if (it.tipo === 'T3') t3[it.correcto ? 0 : 1]++; }
  assert.ok(t5 > 50 && mitad / t5 > 0.4, 'mitad trampa frecuente: ' + mitad + '/' + t5); assert.ok(t3[0] > 20 && t3[1] > 20);
});
prueba('sentido: validadores de T1 y T2 con sus pistas', function () {
  var it = { tipo: 'T1', D: 976, d: 7, correcta: 3 };
  assert.strictEqual(SE.validarT1(it, 3).ok, true); var m = SE.validarT1(it, 4);
  assert.strictEqual(m.codigo, 'ESTIMACION'); assert.ok(/7 × 100 = 700/.test(m.pista) && /7 × 1000/.test(m.pista));
  var az = AZ.crear(1), g = DIV.generar(2, az, { usados: {}, cuadernoUsado: false }), r = DIV.inyectarError(g.sim, 'PASO_EXTRA', az);
  var t2 = { tipo: 'T2', D: g.dividendo, d: g.divisor, q: g.sim.cociente, r: g.sim.resto, vista: r.vista, error: r.error };
  assert.strictEqual(SE.validarVeredicto(t2, 'bien').codigo, 'DETECCION_OMITIDA'); assert.ok(SE.validarVeredicto(t2, 'mal').ok);
  assert.strictEqual(SE.validarDonde(t2, 'tabla').codigo, 'DETECCION_OMITIDA'); assert.ok(SE.validarDonde(t2, 'cociente').ok);
  assert.ok(/cuántas cifras bajaste/.test(SE.pistaMotivo(t2)));
  var sano = { tipo: 'T2', D: g.dividendo, d: g.divisor, q: g.sim.cociente, r: g.sim.resto, vista: DIV.vistaDe(g.sim), error: null };
  assert.strictEqual(SE.validarVeredicto(sano, 'mal').codigo, 'FALSA_ALARMA'); assert.ok(SE.validarVeredicto(sano, 'bien').ok);
});
prueba('sentido: 976 : 7 = 729 se detecta como error de registro del cociente', function () {
  var sim = DIV.simular(976, 7), r = DIV.inyectarError(sim, 'REGISTRO_COCIENTE', AZ.crear(1));
  assert.ok(r, 'se puede plantar'); assert.strictEqual(r.error.campo, 'cociente'); assert.notStrictEqual(r.vista.cociente, '139'); assert.strictEqual(r.vista.cociente[0], '7');
});
prueba('sentido: T3, T4 y T5', function () {
  var t3 = { tipo: 'T3', D: 976, d: 7, q: 139, r: 3, correcto: true, esperadoCalculo: 976 };
  assert.ok(SE.validarCalculo(t3, 976).ok); assert.strictEqual(SE.validarCalculo(t3, 900).codigo, 'VERIFICACION'); assert.ok(/139 × 7 y sumale 3/.test(SE.validarCalculo(t3, 1).pista));
  assert.ok(SE.validarSiNo(t3, true).ok); assert.strictEqual(SE.validarSiNo(t3, false).codigo, 'FALSA_ALARMA');
  var t4 = { tipo: 'T4', razonable: false, nota: '¿Pueden salir más bolsitas que jabones?' };
  var e = SE.validarSiNo(t4, true); assert.strictEqual(e.codigo, 'DETECCION_OMITIDA'); assert.ok(/más bolsitas que jabones/.test(e.pista));
  var t5 = { tipo: 'T5', D: 120, d: 5, resp: 60, esMitad: true, correcta: false, comprobar: 300 };
  assert.strictEqual(SE.validarSiNo(t5, true).codigo, 'MITAD_AUTOMATICA'); assert.ok(SE.validarSiNo(t5, false).ok); assert.ok(SE.validarCalculo(t5, 300).ok);
});
prueba('sentido: los pasos de cada ítem', function () {
  assert.deepStrictEqual(SE.pasosDe({ tipo: 'T1' }), ['estimar']); assert.deepStrictEqual(SE.pasosDe({ tipo: 'T2', error: {} }), ['veredicto', 'donde', 'motivo']);
  assert.deepStrictEqual(SE.pasosDe({ tipo: 'T2', error: null }), ['veredicto']); assert.deepStrictEqual(SE.pasosDe({ tipo: 'T4' }), ['sino']);
});
