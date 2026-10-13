'use strict';
var assert = require('assert');
var com = '../../actividades/_comun-4to/';
var FR = require(com + 'fracciones-lib.js'), FIG = require(com + 'fracciones-figuras.js'), AZ = require(com + 'azar.js'), GEN = require(com + 'fracciones-gen-2.js');
var fr = FR.fr, UNO = fr(1, 1);

function cadaItem(act, fn) {
  var A = GEN[act];
  for (var nivel = 1; nivel <= 3; nivel++) {
    var tipos = A.tipos(nivel).concat(A.tipoFinal ? [A.tipoFinal(nivel)] : []);
    tipos.forEach(function (tipo) {
      var az = AZ.crear(1000 + nivel * 7 + tipo.charCodeAt(1)), ses = {};
      for (var i = 0; i < 1000; i++) {
        if (i % 12 === 0) ses = {};
        var it = A.generar(nivel, tipo, az, ses);
        assert.strictEqual(it.tipo, tipo, act + ' nivel ' + nivel + ' pidió ' + tipo);
        assert.ok(!it.modulo, 'los generadores nunca dan ítems del módulo');
        fn(it, nivel, tipo);
      }
    });
  }
}
function opcionMultiple(ops, msg) {
  assert.strictEqual(ops.length, 4, msg + ': 4 opciones');
  assert.strictEqual(ops.filter(function (o) { return o.codigo === null; }).length, 1, msg + ': una sola correcta');
  ops.forEach(function (o, i) { ops.forEach(function (p, j) { if (i !== j) assert.ok(!FR.iguales(o.f, p.f), msg + ': valores distintos ' + FR.formatear(o.f) + ' ' + FR.formatear(p.f)); }); });
}

prueba('generadores: con la misma semilla dan la misma secuencia', function () {
  ['repartos', 'partes', 'muro', 'comparar', 'falta', 'potes'].forEach(function (act) {
    var A = GEN[act], a1 = AZ.crear(42), a2 = AZ.crear(42), s1 = {}, s2 = {};
    for (var i = 0; i < 30; i++) {
      var t = A.tipos(2)[i % A.tipos(2).length];
      assert.deepStrictEqual(JSON.stringify(A.generar(2, t, a1, s1)), JSON.stringify(A.generar(2, t, a2, s2)), act);
    }
  });
  var q1 = GEN.repaso.preguntas({}, AZ.crear(7)), q2 = GEN.repaso.preguntas({}, AZ.crear(7));
  assert.strictEqual(JSON.stringify(q1), JSON.stringify(q2));
});

prueba('repartos: 1000 ítems por nivel y tipo — N = q × M + r, cortes válidos si y solo si r × k es múltiplo de M', function () {
  cadaItem('repartos', function (it, nivel, tipo) {
    assert.strictEqual(it.N, it.q * it.M + it.r); assert.ok(it.r >= 0 && it.r < it.M);
    var Ms = { 1: [2, 4], 2: [2, 4, 8], 3: [2, 3, 4, 8] }[nivel]; assert.ok(Ms.indexOf(it.M) >= 0, 'M del nivel');
    if (nivel === 1) assert.ok(it.N >= 3 && it.N <= 12, 'N del nivel 1: ' + it.N);
    if (nivel === 2) assert.ok(it.N >= 2 && it.N <= 20);
    if (nivel === 3) assert.ok(it.N <= 30 && it.q <= 5);
    for (var k = 2; k <= 8; k++) assert.strictEqual(it.cortesValidos.indexOf(k) >= 0, it.r > 0 && (it.r * k) % it.M === 0);
    assert.strictEqual(GEN.repartos.cortaParejo(it, it.M), it.r > 0 || true);
    if (tipo === 'R4' || tipo === 'R3') opcionMultiple(it.opciones, 'reparto');
    if (!it.ctx.parte) assert.ok(nivel === 3 && (tipo === 'R1' || tipo === 'R2'), 'no se parte solo en el nivel 3');
    assert.ok(GEN.repartos.validarRespuesta(it, it.esperado).ok);
  });
});
prueba('repartos: no repite el mismo M dos veces seguidas en la sesión ni el par (N, M)', function () {
  var az = AZ.crear(5), ses = {}, ant = null, pares = {};
  for (var i = 0; i < 6; i++) { var it = GEN.repartos.generar(2, 'R1', az, ses); assert.notStrictEqual(it.M, ant); ant = it.M; assert.ok(!pares[it.N + '/' + it.M]); pares[it.N + '/' + it.M] = 1; }
});
prueba('partes: 1000 ítems por nivel y tipo cumplen sus restricciones', function () {
  cadaItem('partes', function (it, nivel, tipo) {
    if (tipo === 'P1') { assert.ok(FR.iguales(FIG.fraccionPintada(it.fig), it.esperado)); assert.ok(GEN.partes.validarP1(it, it.esperado).ok); if (nivel === 1) assert.ok(it.fig.iguales && [2, 4, 8].indexOf(it.fig.partes) >= 0); }
    if (tipo === 'P2') assert.ok(FIG.pintarFraccion(it.fig, it.objetivo, AZ.crear(1)), 'se puede pintar');
    if (tipo === 'P3') {
      assert.strictEqual(it.figs.length, 4);
      var ok = it.figs.filter(function (x) { return x.correcta; }).length; assert.ok(ok >= 1 && ok <= 3, 'de 1 a 3 correctas');
      assert.ok(it.figs.some(function (x) { return x.trampa === 'desigual' || x.trampa === 'escondido'; }), 'al menos una trampa');
      it.figs.forEach(function (x) { assert.strictEqual(FR.iguales(FIG.fraccionPintada(x.fig), it.objetivo), x.correcta); });
      assert.ok(GEN.partes.validarP3(it, it.figs.map(function (x, i) { return x.correcta ? i : -1; }).filter(function (i) { return i >= 0; })).ok);
    }
    if (tipo === 'P4') { assert.ok(it.entero <= 12, 'el entero entra en 375 px'); assert.strictEqual(it.entero * it.a, it.L * it.b); if (nivel === 1) assert.strictEqual(it.a, 1); }
  });
});
prueba('muro: 1000 ítems por nivel y tipo cumplen sus restricciones', function () {
  cadaItem('muro', function (it, nivel, tipo) {
    if (tipo === 'E1') assert.ok(FR.iguales(it.esperado, it.f) && it.esperado.d === it.pieza);
    if (tipo === 'E2') assert.ok(GEN.muro.validarE2(it, it.esperado).ok, JSON.stringify(it.info));
    if (tipo === 'E3') { assert.ok(it.fichas.length >= 4 && it.fichas.length <= 6); assert.ok(it.fichas.some(function (x) { return !x.codigo; }));
      it.fichas.forEach(function (x) { assert.strictEqual(!x.codigo, FR.iguales(x.f, it.f)); }); }
    if (tipo === 'E5') assert.strictEqual(it.verdad, FR.iguales(fr(it.k, it.b), fr(it.j, it.c)));
    if (tipo === 'E6') { assert.strictEqual(it.cartas.length, 8); for (var p = 0; p < 4; p++) { var c = it.cartas.filter(function (x) { return x.par === p; }); assert.ok(FR.iguales(c[0].f, c[1].f)); } }
    if (nivel < 3) ['f', 'g'].forEach(function (k) { if (it[k]) assert.ok(it[k].d <= 8, 'sin 16avos antes del nivel 3'); });
  });
});
prueba('comparar: 1000 ítems por nivel y tipo cumplen sus restricciones', function () {
  cadaItem('comparar', function (it, nivel, tipo) {
    if (tipo === 'C1') { assert.ok(GEN.comparar.validarC1(it, it.rel).ok); if (nivel === 1) assert.ok(it.a.d === it.b.d || it.a.n === it.b.n); }
    if (tipo === 'C2') { assert.ok(it.fichas.length >= 6 && it.fichas.length <= 7); if (nivel === 1) assert.ok(it.fichas.every(function (x) { return x.canasta !== 'justo'; })); }
    if (tipo === 'C3') { assert.ok(GEN.comparar.validarC3(it, it.correcta).ok); assert.ok(FR.comparar(it.a, UNO) < 0 && FR.comparar(it.b, UNO) < 0, 'en los problemas nadie pasa el entero'); if (nivel === 1) assert.strictEqual(it.pregunta, 'mas'); assert.strictEqual(it.razones.filter(function (r) { return r.ok; }).length, 1); }
    if (tipo === 'C4') { for (var i = 1; i < it.orden.length; i++) assert.strictEqual(FR.comparar(it.orden[i - 1], it.orden[i]), -1); }
    if (tipo === 'C5') opcionMultiple(it.opciones, 'C5');
  });
});
prueba('cuánto falta: 1000 ítems por nivel y tipo — resultados entre 0 y 2, sin negativos ni triviales', function () {
  cadaItem('falta', function (it, nivel, tipo) {
    var e = it.esperado; assert.ok(e.n > 0 && FR.comparar(e, fr(2, 1)) <= 0, tipo + ' ' + JSON.stringify(it.info));
    if (tipo === 'S3') { assert.ok(GEN.falta.validarS3(it, e).ok); if (nivel === 1) assert.strictEqual(it.a.d, it.b.d); if (nivel < 3) assert.ok(FR.comparar(e, fr(2, 1)) <= 0); }
    if (tipo === 'S5') opcionMultiple(it.opciones, 'S5');
    if (tipo === 'S4') { assert.ok(GEN.falta.validarProblema(it, e).ok); if (nivel === 1) assert.strictEqual(it.cat, 'P1'); assert.strictEqual(it.preguntas.length, 3); assert.strictEqual(it.planes.length, 3); }
    [it.a, it.b].forEach(function (x) { if (x) assert.ok([2, 4, 8].indexOf(x.d) >= 0, 'denominadores 2, 4 y 8'); });
  });
  var az = AZ.crear(3);
  for (var i = 0; i < 200; i++) { var s = GEN.falta.secuencia(1 + (i % 3), az); assert.strictEqual(s.length, 6); assert.strictEqual(s.filter(function (t) { return t === 'S4'; }).length, i % 3 === 0 ? 1 : 2); }
});
prueba('potes: 1 3/4 kg con la mayor cantidad de 1/2 → 3 de 1/2 y 1 de 1/4; 2 1/2 kg con la menor cantidad → 2 de 1 kg y 1 de 1/2', function () {
  var k1 = GEN.potes.armar.K1({ objetivo: '1 3/4', cond: 'mas_medios' }, 3);
  assert.ok(GEN.potes.validarK1(k1, [fr(1, 2), fr(1, 2), fr(1, 2), fr(1, 4)]).ok);
  assert.strictEqual(GEN.potes.validarK1(k1, [fr(1, 2), fr(1, 2), fr(1, 4), fr(1, 4), fr(1, 4)]).codigo, 'RESTRICCION');
  var k2 = GEN.potes.armar.K1({ objetivo: '2 1/2', cond: 'menos_potes' }, 3);
  assert.ok(GEN.potes.validarK1(k2, [UNO, UNO, fr(1, 2)]).ok);
  assert.strictEqual(GEN.potes.validarK1(k2, [UNO, fr(1, 2), fr(1, 2), fr(1, 2)]).codigo, 'RESTRICCION');
});
prueba('potes: 1000 ítems por nivel y tipo cumplen sus restricciones', function () {
  cadaItem('potes', function (it, nivel, tipo) {
    if (tipo === 'K1') { if (nivel === 1) assert.ok(it.cond === 'ninguna' && ['1', '3/2', '2'].indexOf(FR.formatear(it.objetivo)) >= 0);
      var m = FR.menorCantidad(it.objetivo), l = []; for (var i = 0; i < m.unos; i++) l.push(UNO); for (i = 0; i < m.medios; i++) l.push(fr(1, 2)); for (i = 0; i < m.cuartos; i++) l.push(fr(1, 4));
      if (it.cond === 'cuartos') { l = []; for (i = 0; i < it.objetivo.n * 4 / it.objetivo.d; i++) l.push(fr(1, 4)); }
      if (it.cond === 'medios_cuartos' || it.cond === 'mas_medios') { var mm = FR.mayorCantidadMedios(it.objetivo); l = []; for (i = 0; i < mm.medios; i++) l.push(fr(1, 2)); for (i = 0; i < mm.cuartos; i++) l.push(fr(1, 4)); }
      assert.ok(GEN.potes.validarK1(it, l).ok, 'tiene solución: ' + JSON.stringify(it.info)); }
    if (tipo === 'K2') assert.strictEqual(GEN.potes.estadoPotes(it.lista, it.objetivo).estado, it.estado);
    if (tipo === 'K3') { assert.ok(it.filas.length >= 3 && it.filas.length <= 4); assert.ok(it.filas.some(function (f) { return f.estado === 'justo'; })); }
    if (tipo === 'K4') assert.ok(FR.iguales(FR.sumar(GEN.potes.sumaLista(it.sumandos), it.esperado), it.total));
    if (tipo === 'K5' && it.pregunta === 'jarra') assert.ok(it.esperado.n > 0);
    if (tipo === 'K6') assert.strictEqual(it.opciones.filter(function (o) { return o.ok; })[0].alto, 0.5);
  });
});
prueba('repaso: 8 preguntas; opción múltiple con una sola correcta y 4 valores distintos', function () {
  var az = AZ.crear(77);
  for (var i = 0; i < 300; i++) {
    var qs = GEN.repaso.preguntas(i % 2 ? { '4to-fracciones-repartos': 3, '4to-fracciones-muro': 3 } : {}, az);
    assert.strictEqual(qs.length, 8);
    var temas = qs.map(function (q) { return q.tema; });
    ['reparto', 'partes', 'problemas', 'sumas_restas', 'medidas'].forEach(function (t) { assert.ok(temas.indexOf(t) >= 0, 'tema ' + t); });
    qs.forEach(function (q) {
      if (q.vf) { assert.strictEqual(q.opciones.length, 2); assert.strictEqual(q.opciones.filter(function (o) { return o.codigo === null; }).length, 1); return; }
      opcionMultiple(q.opciones, 'repaso ' + q.tema);
    });
  }
});
