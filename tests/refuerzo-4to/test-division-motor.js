'use strict';
var assert = require('assert');
var AZ = require('../../actividades/_comun-4to/azar.js'), DIV = require('../../actividades/_comun-4to/division-lib.js');
var MO = require('../../actividades/4to-division-paso-a-paso/division-logica.js');

// Responde un paso con la respuesta correcta.
function correcta(M) {
  var out = MO.derivar(M), a = out.actual;
  if (a.tipo === 'revision') return MO.revisar(M);
  var e = MO.esperadoTexto(M, a), v;
  if (a.tipo === 'bajar') v = { col: +e }; else if (a.tipo === 'control' || a.tipo === 'fin') v = e; else v = +e;
  return MO.responder(M, v);
}
function resolver(M, tope) {
  var n = 0, eventos = [];
  while (MO.derivar(M).actual && n++ < (tope || 300)) { var r = correcta(M); (r.eventos || []).forEach(function (e) { eventos.push(e); }); if (r.terminada) break; }
  return { eventos: eventos, pasos: n };
}
function hasta(M, tipo, vuelta) { // avanza con respuestas correctas hasta que el paso actual sea (tipo, vuelta)
  for (var i = 0; i < 300; i++) { var a = MO.derivar(M).actual; if (a.tipo === tipo && (vuelta === undefined || a.vuelta === vuelta)) return a; correcta(M); }
  throw new Error('no llegó a ' + tipo);
}

prueba('motor: un bot con respuestas correctas termina cada cuenta en todos los niveles', function () {
  for (var nivel = 1; nivel <= 4; nivel++) {
    var az = AZ.crear(11 + nivel), ses = { usados: {}, cuadernoUsado: false };
    for (var i = 0; i < 60; i++) {
      var g = DIV.generar(nivel, az, ses), M = MO.crear({ dividendo: g.dividendo, divisor: g.divisor, nivel: nivel, az: az });
      var r = resolver(M);
      var st = MO.derivar(M);
      assert.ok(st.terminada, 'terminó ' + g.dividendo + ':' + g.divisor + ' nivel ' + nivel);
      assert.ok(r.eventos.every(function (e) { return e.ok; }), 'sin errores con respuestas correctas');
      assert.strictEqual(MO.vista(M, '').igual, String(g.sim.cociente));
    }
  }
});
prueba('motor: tabla del divisor según el nivel', function () {
  assert.strictEqual(MO.crear({ dividendo: 976, divisor: 7, nivel: 1 }).blancos.length, 0);
  var m2 = MO.crear({ dividendo: 976, divisor: 7, nivel: 2, az: AZ.crear(1) });
  assert.strictEqual(m2.blancos.length, 3); assert.ok(m2.blancos.some(function (q) { return q >= 6 && q <= 8; }), 'al menos una de 6-8');
  assert.ok(m2.blancos.some(function (q) { return [1, 3, 9].indexOf(q) >= 0; }), 'incluye un factor que va a usar');
  assert.strictEqual(MO.crear({ dividendo: 976, divisor: 7, nivel: 3 }).blancos.length, 8);
});
prueba('motor: anotar 7 en el casillero cuando el factor es 1 en 976 : 7 → REGISTRO_COCIENTE', function () {
  var M = MO.crear({ dividendo: 976, divisor: 7, nivel: 2, az: AZ.crear(1) });
  hasta(M, 'casita', 0);
  var r = MO.responder(M, 7);
  assert.strictEqual(r.ok, false); assert.strictEqual(r.codigo, 'REGISTRO_COCIENTE'); assert.ok(/casillero/.test(r.pista));
  assert.strictEqual(MO.derivar(M).actual.tipo, 'casita', 'sigue en el casillero');
  assert.strictEqual(MO.responder(M, 1).ok, true);
});
prueba('motor: elegir 4 en 60 : 8 y confirmar el control → RESTO_MAYOR', function () {
  var M = MO.crear({ dividendo: 300, divisor: 8, nivel: 2, az: AZ.crear(1) });
  hasta(M, 'factor', 1);                       // segunda vuelta: 60 : 8
  assert.strictEqual(MO.derivar(M).actual.V.parcial, 60);
  assert.strictEqual(MO.responder(M, 4).ok, true, 'en el nivel 2 el factor no se corrige al instante');
  assert.strictEqual(MO.responder(M, 4).ok, true);   // casita
  assert.strictEqual(MO.responder(M, 32).ok, true);  // producto
  assert.strictEqual(MO.responder(M, 28).ok, true);  // resta
  var r = MO.responder(M, 'si');                     // "¿28 es menor que 8?" → sí (error)
  assert.strictEqual(r.codigo, 'RESTO_MAYOR'); assert.strictEqual(r.rebobinado, true); assert.ok(/28/.test(r.pista));
  assert.ok(r.eventos.some(function (e) { return e.paso === 'factor' && e.error === 'FACTOR_CHICO'; }));
  assert.strictEqual(MO.derivar(M).actual.tipo, 'factor', 'vuelve al factor');
});
prueba('motor: contestar "no" al control con resto grande es acierto y registra FACTOR_CHICO', function () {
  var M = MO.crear({ dividendo: 300, divisor: 8, nivel: 2, az: AZ.crear(1) });
  hasta(M, 'factor', 1); MO.responder(M, 4); MO.responder(M, 4); MO.responder(M, 32); MO.responder(M, 28);
  var r = MO.responder(M, 'no');
  assert.strictEqual(r.ok, true); assert.strictEqual(r.rebobinado, true); assert.ok(/Bien visto/.test(r.pista));
  var c = r.eventos.filter(function (e) { return e.paso === 'control'; })[0], f = r.eventos.filter(function (e) { return e.paso === 'factor'; })[0];
  assert.strictEqual(c.ok, true); assert.strictEqual(f.error, 'FACTOR_CHICO');
});
prueba('motor: factor muy grande se descubre en el producto ("se pasa") en el nivel 2', function () {
  var M = MO.crear({ dividendo: 976, divisor: 7, nivel: 2, az: AZ.crear(1) });
  hasta(M, 'factor', 0); MO.responder(M, 2); MO.responder(M, 2);
  var r = MO.responder(M, 14);
  assert.strictEqual(r.codigo, 'FACTOR_GRANDE'); assert.strictEqual(r.rebobinado, true); assert.ok(/Se pasa/.test(r.pista));
  assert.strictEqual(MO.derivar(M).actual.tipo, 'factor');
});
prueba('motor: nivel 1 corrige el factor al instante', function () {
  var M = MO.crear({ dividendo: 978, divisor: 5, nivel: 1 });
  hasta(M, 'factor', 0); var r = MO.responder(M, 0);
  assert.strictEqual(r.ok, false); assert.strictEqual(r.codigo, 'FACTOR_CHICO');
});
prueba('motor: nivel 3 detecta el resto mayor al intentar bajar', function () {
  var M = MO.crear({ dividendo: 300, divisor: 8, nivel: 3, az: AZ.crear(1) });
  hasta(M, 'factor', 1); MO.responder(M, 4); MO.responder(M, 4); MO.responder(M, 32); MO.responder(M, 28);
  assert.strictEqual(MO.derivar(M).actual.tipo, 'fin', 'es la última vuelta');
  var r = MO.responder(M, 'terminar');
  assert.strictEqual(r.codigo, 'RESTO_MAYOR'); assert.strictEqual(MO.derivar(M).actual.tipo, 'factor');
  // y en una vuelta del medio, al querer bajar
  var N = MO.crear({ dividendo: 1426, divisor: 8, nivel: 3 });
  hasta(N, 'factor', 1); var p1 = MO.derivar(N).actual.V.parcial;
  MO.responder(N, 0); MO.responder(N, 0); MO.responder(N, 0); MO.responder(N, p1);
  assert.strictEqual(MO.derivar(N).actual.tipo, 'bajar');
  assert.strictEqual(MO.responder(N, { col: N.sim.vueltas[1].colFin + 1 }).codigo, 'RESTO_MAYOR');
});
prueba('motor: parcial chico, bajar mal, paso extra, resta y cero omitido', function () {
  var M = MO.crear({ dividendo: 300, divisor: 8, nivel: 1 });
  var a = hasta(M, 'parcial'); assert.strictEqual(MO.responder(M, 1).codigo, 'PARCIAL_CHICO');
  MO.responder(M, 2); MO.responder(M, 3); MO.responder(M, 3); MO.responder(M, 24);
  assert.strictEqual(MO.responder(M, 5).codigo, 'RESTA');
  MO.responder(M, 6); MO.responder(M, 'si');
  assert.strictEqual(MO.derivar(M).actual.tipo, 'bajar');
  assert.strictEqual(MO.responder(M, { num: 3 }).codigo, 'PASO_EXTRA');
  assert.strictEqual(MO.responder(M, { col: 1 }).codigo, 'BAJAR');
  var z = MO.crear({ dividendo: 1640, divisor: 8, nivel: 1 });
  hasta(z, 'factor', 1); assert.strictEqual(z.sim.vueltas[1].factor, 0);
  assert.strictEqual(MO.responder(z, 1).codigo, 'CERO_OMITIDO');
});
prueba('motor: tabla mal → TABLA; estimación y verificación con su código', function () {
  var M = MO.crear({ dividendo: 1426, divisor: 8, nivel: 3 });
  var a = MO.derivar(M).actual; assert.strictEqual(a.tipo, 'tabla');
  var r = MO.responder(M, 62 - 8 * a.q + 8 * a.q + 1); assert.strictEqual(r.codigo, 'TABLA');
  hasta(M, 'estimacion'); assert.strictEqual(MO.responder(M, 2).codigo, 'ESTIMACION');
  hasta(M, 'verificacion'); assert.strictEqual(MO.responder(M, 1000).codigo, 'VERIFICACION');
  assert.strictEqual(MO.responder(M, 1426).ok, true);
});
prueba('motor: nivel 4 acepta todo, revisa al final y deja corregir desde el primer error', function () {
  var M = MO.crear({ dividendo: 976, divisor: 7, nivel: 4 });
  var n = 0;
  while (MO.derivar(M).actual.tipo !== 'revision' && n++ < 200) {
    var a = MO.derivar(M).actual, e = MO.esperadoTexto(M, a), v;
    if (a.tipo === 'casita' && a.vuelta === 0) v = 7;                       // error de registro del cociente
    else if (a.tipo === 'bajar') v = { col: +e }; else if (a.tipo === 'fin') v = e; else v = +e;
    var r = MO.responder(M, v); assert.strictEqual(r.ok, true, 'se acepta sin corregir'); assert.ok(r.silencioso);
  }
  var rev = MO.revisar(M);
  assert.strictEqual(rev.ok, false); assert.strictEqual(rev.error.codigo, 'REGISTRO_COCIENTE'); assert.strictEqual(rev.error.tipo, 'casita');
  assert.strictEqual(MO.derivar(M).actual.tipo, 'revision', 'revisar no toca las respuestas');
  MO.corregir(M, rev.error.indice);
  assert.strictEqual(MO.derivar(M).actual.tipo, 'casita', 'queda en el paso con error');
  var fin = resolver(M);
  assert.ok(MO.derivar(M).terminada);
});
prueba('motor: la vista dibuja el casillero y el cociente completo al terminar', function () {
  var M = MO.crear({ dividendo: 976, divisor: 7, nivel: 1 });
  resolver(M); var v = MO.vista(M, '');
  assert.strictEqual(v.cociente, '139'); assert.strictEqual(v.igual, '139'); assert.strictEqual(v.vueltas.length, 3);
  assert.strictEqual(v.vueltas[2].resta, '3'); assert.strictEqual(v.vueltas[2].final, true);
});
