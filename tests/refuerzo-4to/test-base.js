'use strict';
var assert = require('assert');
var com = '../../actividades/_comun-4to/';
var DIV = require(com + 'division-lib.js'), AZ = require(com + 'azar.js'), CL = require(com + 'clasificadores.js'), EV = require(com + 'eventos.js');

function vs(sim) { return sim.vueltas.map(function (v) { return [v.parcialTxt, v.factor, v.producto, v.resta]; }); }

prueba('simulador: 976 : 7 = 139 resto 3 (vueltas del cuaderno)', function () {
  var s = DIV.simular(976, 7);
  assert.strictEqual(s.cociente, 139); assert.strictEqual(s.resto, 3);
  assert.deepStrictEqual(vs(s), [['9', 1, 7, 2], ['27', 3, 21, 6], ['66', 9, 63, 3]]);
});
prueba('simulador: 1426 : 8 = 178 resto 2', function () { var s = DIV.simular(1426, 8); assert.strictEqual(s.cociente, 178); assert.strictEqual(s.resto, 2); });
prueba('simulador: 300 : 8 = 37 resto 4 (toma dos cifras)', function () {
  var s = DIV.simular(300, 8); assert.strictEqual(s.cociente, 37); assert.strictEqual(s.resto, 4); assert.strictEqual(s.vueltas[0].parcialTxt, '30');
});
prueba('simulador: 1387 : 6 = 231 resto 1 (aparece "07")', function () {
  var s = DIV.simular(1387, 6); assert.strictEqual(s.cociente, 231); assert.strictEqual(s.resto, 1);
  assert.deepStrictEqual(s.vueltas.map(function (v) { return v.parcialTxt; }), ['13', '18', '07']);
});
prueba('simulador: 1640 : 8 = 205 resto 0, con una vuelta "04 − 0"', function () {
  var s = DIV.simular(1640, 8); assert.strictEqual(s.cociente, 205); assert.strictEqual(s.resto, 0);
  assert.deepStrictEqual(vs(s), [['16', 2, 16, 0], ['04', 0, 0, 4], ['40', 5, 40, 0]]);
});
prueba('simulador: columnas de cada vuelta', function () {
  var s = DIV.simular(1387, 6);
  assert.deepStrictEqual(s.vueltas.map(function (v) { return [v.colInicio, v.colFin]; }), [[0, 1], [1, 2], [2, 3]]);
});

prueba('generador: 1000 cuentas por nivel cumplen las restricciones', function () {
  for (var nivel = 1; nivel <= 4; nivel++) {
    var az = AZ.crear(100 + nivel), ses = { usados: {}, cuadernoUsado: false }, cfg = DIV.NIVELES[nivel], relajadas = 0;
    for (var i = 0; i < 1000; i++) {
      var g = DIV.generar(nivel, az, ses), s = g.sim, n = g.dividendo, d = g.divisor;
      assert.ok(d >= 2 && d <= 9, 'divisor una cifra y no 1');
      assert.ok(d >= cfg.d[0] && d <= cfg.d[1], 'divisor del nivel ' + nivel + ': ' + d);
      assert.ok(String(n).length >= cfg.L[0] && String(n).length <= cfg.L[1], 'cifras del dividendo ' + n);
      assert.strictEqual(s.cociente * d + s.resto, n, 'cociente × divisor + resto');
      assert.ok(s.resto < d);
      if (nivel < 3) assert.ok(!DIV.tieneCeroCociente(s), 'sin ceros en nivel ' + nivel + ': ' + n + ':' + d);
      if (nivel === 1) assert.strictEqual(DIV.tipoParcial(s), '1');
      if (g.relajado.length) relajadas++;
      else assert.ok(DIV.fraccion69(s) >= 0.3, 'factores 6-9 ≥ 30 % en ' + n + ':' + d);
    }
    assert.ok(relajadas < 50, 'pocas restricciones relajadas (nivel ' + nivel + '): ' + relajadas);
  }
});
prueba('generador: no repite el par dividendo/divisor en la sesión', function () {
  var az = AZ.crear(7), ses = { usados: {}, cuadernoUsado: false }, vistos = {};
  for (var i = 0; i < 300; i++) { var g = DIV.generar(2, az, ses), k = g.dividendo + ':' + g.divisor; assert.ok(!vistos[k], 'repetido ' + k); vistos[k] = true; }
});
prueba('generador: misma semilla, misma secuencia', function () {
  function seq(sem) { var az = AZ.crear(sem), ses = { usados: {}, cuadernoUsado: false }, o = []; for (var i = 0; i < 50; i++) { var g = DIV.generar(3, az, ses); o.push(g.dividendo + ':' + g.divisor); } return o.join(); }
  assert.strictEqual(seq(42), seq(42)); assert.notStrictEqual(seq(42), seq(43));
});
prueba('generador: ejercicios del cuaderno, como máximo uno por sesión', function () {
  var az = AZ.crear(3), ses = { usados: {}, cuadernoUsado: false }, usados = 0;
  var reales = DIV.SEMILLA_CUADERNO.map(function (p) { return p.join(':'); });
  for (var i = 0; i < 400; i++) { var g = DIV.generar(3, az, ses); if (reales.indexOf(g.dividendo + ':' + g.divisor) >= 0) usados++; }
  assert.ok(usados <= 1 + 2, 'pocos ejercicios del cuaderno: ' + usados); // los demás serían coincidencia del azar
});

prueba('inyector de errores: cada tipo deja una cuenta distinta de la correcta', function () {
  var az = AZ.crear(9), tipos = ['REGISTRO_COCIENTE', 'RESTO_MAYOR', 'PASO_EXTRA', 'CERO_OMITIDO', 'TABLA'], hechos = {};
  for (var i = 0; i < 400; i++) {
    var g = DIV.generar(3, az, { usados: {}, cuadernoUsado: false });
    tipos.forEach(function (t) {
      var r = DIV.inyectarError(g.sim, t, az); if (!r) return; hechos[t] = true;
      var ok = DIV.vistaDe(g.sim);
      assert.ok(JSON.stringify(r.vista) !== JSON.stringify(ok), t + ' cambia la vista');
      if (t === 'RESTO_MAYOR') assert.ok(r.vista.resto >= g.divisor);
    });
  }
  tipos.forEach(function (t) { assert.ok(hechos[t], 'se pudo inyectar ' + t); });
});

prueba('clasificadores: 199 × 8 = 944 → CERO_PERDIDO', function () { assert.strictEqual(CL.clasificarMultiplicacion(199, 8, 944), 'CERO_PERDIDO'); });
prueba('clasificadores: 4 × 39 = 196 → MEZCLA_ESTRATEGIA', function () { assert.strictEqual(CL.clasificarMultiplicacion(39, 4, 196), 'MEZCLA_ESTRATEGIA'); });
prueba('clasificadores: 120 : 5 = 60 → MITAD_AUTOMATICA', function () { assert.strictEqual(CL.clasificarDivision(120, 5, 60), 'MITAD_AUTOMATICA'); });
prueba('clasificadores: 12.000 : 3 = 6.000 → MITAD_AUTOMATICA', function () { assert.strictEqual(CL.clasificarDivision(12000, 3, 6000), 'MITAD_AUTOMATICA'); });
prueba('clasificadores: 1328 + 1872 + 3933 = 6133 → RESERVA', function () { assert.strictEqual(CL.clasificarSuma([1328, 1872, 3933], 6133), 'RESERVA'); });
prueba('clasificadores: respuestas correctas dan null', function () {
  assert.strictEqual(CL.clasificarMultiplicacion(199, 8, 1592), null); assert.strictEqual(CL.clasificarDivision(120, 5, 24), null);
  assert.strictEqual(CL.clasificarSuma([1328, 1872, 3933], 7133), null);
});

prueba('eventos: ajustarNivel sube con 2 rondas buenas y baja con 2 malas', function () {
  var e = { nivel: 1, buenas: 0, malas: 0 }, r = EV.ajustarNivel(e, 90, false, 4); assert.strictEqual(r.cambio, 0);
  r = EV.ajustarNivel(r.est, 85, false, 4); assert.strictEqual(r.cambio, 1); assert.strictEqual(r.est.nivel, 2);
  r = EV.ajustarNivel(r.est, 40, false, 4); r = EV.ajustarNivel(r.est, 30, false, 4); assert.strictEqual(r.cambio, -1); assert.strictEqual(r.est.nivel, 1);
  var s = EV.ajustarNivel({ nivel: 1, buenas: 1, malas: 0 }, 95, true, 4); assert.strictEqual(s.cambio, 0, 'un error de control frena la subida');
  var t = EV.ajustarNivel({ nivel: 4, buenas: 1, malas: 0 }, 95, false, 4); assert.strictEqual(t.est.nivel, 4, 'no pasa del máximo');
});
prueba('eventos: el registro compacta al superar el máximo y no pierde estadísticas', function () {
  var mem = {}, store = { get: function (k, d) { return k in mem ? JSON.parse(mem[k]) : d; }, set: function (k, v) { mem[k] = JSON.stringify(v); } };
  var reg = EV.crearRegistro({ store: store, act: 'x', version: '1.0.0', perfil: 'ian' });
  for (var i = 0; i < EV.MAX_EVENTOS + 500; i++) reg.evento({ tipo: 'paso', paso: 'factor', intento: 1, ok: i % 2 === 0, error: i % 2 ? 'TABLA' : null, item: { hecho: '7x8' }, ms: 3000 });
  assert.ok(reg.eventos().length <= EV.MAX_EVENTOS, 'compactó');
  var ag = EV.combinar(reg.eventos(), reg.agregados());
  assert.strictEqual(ag.hechos['7x8'].n, EV.MAX_EVENTOS + 500);
  assert.strictEqual(ag.errores.TABLA.n, Math.floor((EV.MAX_EVENTOS + 500) / 2));
  assert.ok(reg.flush()); assert.ok(JSON.parse(mem.eventos).length <= EV.MAX_EVENTOS);
});
prueba('eventos: si el almacenamiento está lleno compacta y reintenta', function () {
  var mem = {}, lleno = true, store = { get: function (k, d) { return k in mem ? JSON.parse(mem[k]) : d; },
    set: function (k, v) { var s = JSON.stringify(v); if (lleno && s.length > 20000) throw new Error('cuota'); mem[k] = s; } };
  var reg = EV.crearRegistro({ store: store, act: 'x', version: '1.0.0', perfil: 'ian' });
  for (var i = 0; i < 300; i++) reg.evento({ tipo: 'paso', paso: 'factor', intento: 1, ok: true, item: { hecho: '6x7' }, ms: 100 });
  assert.ok(reg.flush(), 'guardó tras compactar'); assert.ok(reg.agregados().compactados > 0);
});
prueba('eventos: resumen cuenta rondas, % al primer intento y errores frecuentes', function () {
  var ahora = Date.now(), evs = [];
  for (var i = 0; i < 10; i++) evs.push({ tipo: 'paso', ts: ahora, intento: 1, ok: i < 7, error: i < 7 ? null : (i < 9 ? 'TABLA' : 'RESTA'), item: {} });
  evs.push({ tipo: 'ronda_fin', ts: ahora, durMs: 180000 }, { tipo: 'inactividad', ts: ahora, ms: 20000 });
  var r = EV.resumir(evs, null, ahora);
  assert.strictEqual(r.pct1, 70); assert.strictEqual(r.rondas7, 1); assert.strictEqual(r.min7, 3);
  assert.strictEqual(r.errores[0].codigo, 'TABLA'); assert.strictEqual(r.desconexionesPorRonda, 1);
});
prueba('eventos: ranking de hechos y pesos adaptativos', function () {
  var ag = EV.agregadosVacios(); ag.hechos['7x8'] = { n: 4, ok: 1, ms: [6000, 7000], ultimoError: 'TABLA' }; ag.hechos['2x3'] = { n: 4, ok: 4, ms: [900, 1000] };
  var r = EV.rankingHechos([ag]); assert.strictEqual(r.errados[0].hecho, '7x8'); assert.strictEqual(r.lentos[0].hecho, '7x8');
  var w = EV.pesosHechos([{ tipo: 'paso', ts: Date.now(), ok: false, item: { hecho: '6x7' }, ms: 100 }, { tipo: 'paso', ts: Date.now(), ok: true, item: { hecho: '2x3' }, ms: 100 }], Date.now());
  assert.strictEqual(w['6x7'], 2); assert.strictEqual(w['2x3'], undefined);
});
