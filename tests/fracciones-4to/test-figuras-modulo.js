'use strict';
var assert = require('assert');
var com = '../../actividades/_comun-4to/';
var FR = require(com + 'fracciones-lib.js'), FIG = require(com + 'fracciones-figuras.js'), MOD = require(com + 'fracciones-modulo.js'), GEN = require(com + 'fracciones-gen-2.js');
var fr = FR.fr, T = FR.deTexto;

prueba('figuras: en todo el catálogo la suma de las áreas da el total y las partes son enteras', function () {
  FIG.catalogo().forEach(function (f) {
    var t = FIG.areaTotal(f);
    var esperado = f.tipo === 'circulo' ? fr(1, 1) : fr(f.ancho * f.alto, 1);
    if (f.tipo === 'triangulo_4' || f.tipo === 'triangulo_9') esperado = fr(f.ancho * f.alto, 2);
    if (f.tipo.indexOf('poliomino') === 0) esperado = fr(f.cuadraditos, 1);
    assert.ok(FR.iguales(t, esperado), f.tipo + ': ' + FR.formatear(t));
    f.regiones.forEach(function (r) { var k = FIG.partesDe(f, r.id); assert.strictEqual(k, Math.floor(k), f.tipo + ' región en partes enteras'); });
    assert.strictEqual(f.partes, Math.floor(f.partes));
  });
});
prueba('figuras: fraccionPintada exacta en las figuras del Anexo A', function () {
  var G = GEN.partes;
  assert.deepStrictEqual(FIG.fraccionPintada(FIG.cuartoEscondido()), { n: 1, d: 4 });
  assert.deepStrictEqual(FIG.fraccionPintada(G.figDeSpec('cuadricula_4_1')), { n: 1, d: 4 });
  assert.deepStrictEqual(FIG.fraccionPintada(G.figDeSpec('triangulo_9_3')), { n: 1, d: 3 });
  assert.deepStrictEqual(FIG.fraccionPintada(G.figDeSpec('tiras_4_2')), { n: 1, d: 2 });
  assert.deepStrictEqual(FIG.fraccionPintada(G.figDeSpec('cuadricula_8_4')), { n: 1, d: 2 });
  assert.deepStrictEqual(FIG.fraccionPintada(FIG.pintar(FIG.rombo(), ['r0'])), { n: 1, d: 2 });
  assert.deepStrictEqual(FIG.fraccionPintada(FIG.pintar(FIG.tiras([1, 1, 1, 3]), ['r0'])), { n: 1, d: 6 });
  assert.deepStrictEqual(FIG.fraccionPintada(FIG.pintar(FIG.igualArea(), ['r0'])), { n: 1, d: 4 });
});
prueba('figuras: en las trampas los pedazos no coinciden con el denominador o las partes son desiguales', function () {
  var ce = FIG.cuartoEscondido(), v = FIG.fraccionPintada(ce);
  assert.notStrictEqual(ce.regiones.length, v.d);
  assert.strictEqual(FIG.partesIguales(ce), false);
  var AZ = require(com + 'azar.js'), az = AZ.crear(3);
  [2, 3, 4].forEach(function (d) {
    for (var i = 0; i < 30; i++) {
      var t = GEN.partes.trampaDesigual(d, az), f = FIG.fraccionPintada(t);
      assert.strictEqual(t.regiones.length, d, 'parece 1/' + d);
      assert.strictEqual(t.pintadas.length, 1);
      assert.ok(!FR.iguales(f, fr(1, d)), 'no es 1/' + d);
      assert.strictEqual(FIG.partesIguales(t), false);
    }
  });
});

// El Anexo A completo, verificado con la biblioteca.
function verificar(c, id) {
  var m = id + ' ' + c.tipo;
  switch (c.tipo) {
    case 'reparto': assert.ok(FR.iguales(fr(c.N, c.M), T(c.resp)), m); assert.strictEqual(FR.clasificar('reparto', c, T(c.resp)), null, m); break;
    case 'corte': var r = c.N % c.M; assert.ok((r * c.k) % c.M === 0, m); break;
    case 'pintada': assert.ok(FR.iguales(fr(c.p, c.n), T(c.resp)), m); break;
    case 'exacto': var g = GEN.partes.figDeSpec(c.fig); assert.strictEqual(FR.iguales(FIG.fraccionPintada(g), T(c.objetivo)), c.es, m + ' ' + c.fig); if (c.vale) assert.ok(FR.iguales(FIG.fraccionPintada(g), T(c.vale)), m); break;
    case 'entero': var p = T(c.parte), cint = typeof c.cintas === 'number' ? fr(c.cintas, 1) : T(c.cintas); assert.ok(FR.iguales(FR.simplificar(fr(p.n * cint.n, p.d * cint.d)), fr(1, 1)), m); break;
    case 'equiv': assert.strictEqual(FR.iguales(T(c.a), T(c.b)), c.es, m + ' ' + c.a + ' ' + c.b); break;
    case 'rodear': var eq = c.fichas.filter(function (s) { return FR.iguales(T(s), T(c.f)); }); assert.deepStrictEqual(eq, c.resp, m); break;
    case 'comparar': assert.strictEqual(['<', '=', '>'][FR.comparar(T(c.a), T(c.b)) + 1], c.rel, m + ' ' + c.a + ' ' + c.b); break;
    case 'mayores': assert.deepStrictEqual(c.fichas.filter(function (s) { return FR.comparar(T(s), fr(1, 1)) > 0; }), c.resp, m); break;
    case 'op': var a = T(c.a), b = T(c.b), res = c.op === '+' ? FR.sumar(a, b) : FR.restar(a, b); assert.ok(FR.iguales(res, T(c.resp)), m + ' ' + c.a + c.op + c.b); break;
    case 'vf': assert.strictEqual(FR.iguales(fr(c.k, c.b), fr(c.j, c.c)), c.es, m); break;
    case 'opcion': assert.ok(c.correcta >= 0 && c.correcta < c.opciones.length, m); if (/\d\/\d/.test(c.opciones[c.correcta])) {
      var vals = c.opciones.map(T); assert.strictEqual(vals.filter(function (v, i) { return vals.some(function (w, j) { return j !== i && FR.iguales(v, w); }); }).length, 0, m + ' valores distintos'); } break;
    case 'potes': var s = c.lista.map(T).reduce(FR.sumar, fr(0, 1)), o = T(c.objetivo), d = FR.comparar(s, o);
      var esp = d === 0 ? 'justo' : (d < 0 ? 'falta ' + FR.formatear(FR.restar(o, s)) : 'sobra ' + FR.formatear(FR.restar(s, o))); assert.strictEqual(esp, c.resultado, m); break;
    case 'sepuede': var ob = T(c.objetivo), pt = T(c.pote); assert.strictEqual((ob.n * pt.d) % (ob.d * pt.n) === 0, c.es, m); break;
    case 'masMedios': assert.deepStrictEqual(FR.mayorCantidadMedios(T(c.objetivo)), { medios: c.medios, cuartos: c.cuartos }, m); break;
    case 'cuantos': var o2 = T(c.objetivo), p2 = T(c.pote); assert.strictEqual(o2.n * p2.d / (o2.d * p2.n), c.resp, m); break;
    case 'completar': var su = c.sumandos.map(T).reduce(FR.sumar, fr(0, 1)); assert.ok(FR.iguales(FR.restar(T(c.total), su), T(c.resp)), m); break;
    case 'vasos': var l = T(c.litros), v = T(c.vaso); assert.strictEqual(l.n * v.d / (l.d * v.n), c.resp, m); break;
    case 'jarra': var sv = c.servidos.map(T).reduce(FR.sumar, fr(0, 1)); assert.ok(FR.iguales(FR.restar(T(c.cap), sv), T(c.resp)), m); break;
    default: assert.fail('caso sin verificar: ' + m);
  }
}
prueba('Anexo A: cada respuesta del módulo se verifica con la biblioteca', function () {
  var n = 0;
  MOD.ENTRADAS.forEach(function (e) { e.casos.forEach(function (c) { verificar(c, e.id); n++; }); });
  assert.ok(n >= 80, 'casos verificados: ' + n);
  ['mod-1a', 'mod-1b', 'mod-1c', 'mod-2', 'mod-3a', 'mod-3b', 'mod-5', 'mod-7', 'mod-8', 'mod-9', 'mod-10', 'mod-11', 'mod-12', 'mod-13', 'mod-14', 'mod-15', 'mod-16', 'mod-17', 'mod-18', 'mod-19',
    'rep-1', 'rep-4', 'rep-5', 'rep-6', 'rep-7', 'rep-8', 'test-a', 'test-b', 'test-c', 'test-d', 'test-e', 'test-f', 'kg-1', 'kg-2', 'kg-3', 'kg-4', 'l-5', 'l-5f'].forEach(function (id) { assert.ok(MOD.porId(id), 'falta ' + id); });
});
prueba('Anexo A: los ítems jugables del módulo se arman con los generadores', function () {
  var AZ = require(com + 'azar.js'), az = AZ.crear(9), G = { repartos: GEN.repartos, partes: GEN.partes, muro: GEN.muro, comparar: GEN.comparar, 'cuanto-falta': GEN.falta, 'potes-vasos': GEN.potes };
  Object.keys(G).forEach(function (act) {
    MOD.deActividad(act).forEach(function (j) {
      var arm = G[act].armar[j.tipo]; assert.ok(arm, act + ' sin armar ' + j.tipo);
      var it = arm(j.params, 2, az); assert.ok(it && it.tipo === j.tipo, j.id + ' ' + j.tipo);
    });
  });
  var t = GEN.repartos.armar.R4({ N: 7, M: 4, ctx: 'turrones', opciones: ['4/7', '7/2', '7/4', '7/8'] }, 2, az);
  assert.deepStrictEqual(t.opciones.filter(function (o) { return o.codigo === null; }).map(function (o) { return o.texto; }), ['7/4']);
  assert.strictEqual(t.opciones.filter(function (o) { return o.texto === '4/7'; })[0].codigo, 'INVERTIDA');
});
