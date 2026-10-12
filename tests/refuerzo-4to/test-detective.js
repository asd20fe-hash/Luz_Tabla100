'use strict';
var assert = require('assert');
var AZ = require('../../actividades/_comun-4to/azar.js');
var PR = require('../../actividades/4to-detective-problemas/problemas.js'), DE = require('../../actividades/4to-detective-problemas/detective-logica.js');

function clavesUsadas(inst) {
  var u = {}; inst.planes[0].forEach(function (st) { st.args.forEach(function (a) { if (!/^s\d$/.test(a)) u[a] = 1; }); }); return u;
}
function tokens(inst) {
  var t = []; inst.partes.concat(inst.pregunta).forEach(function (p) { if (typeof p !== 'string') t.push(p.k); }); return t;
}
function plantilla(id) { return PR.plantillas.filter(function (t) { return t.id === id; })[0]; }

prueba('detective: hay 11 categorías con al menos 3 plantillas cada una (33 o más)', function () {
  var por = {}; PR.plantillas.forEach(function (t) { por[t.cat] = (por[t.cat] || 0) + 1; });
  for (var c = 1; c <= 11; c++) assert.ok(por[c] >= 3, 'categoría ' + c + ' tiene ' + por[c]);
  assert.ok(PR.plantillas.length >= 33);
  var ids = {}; PR.plantillas.forEach(function (t) { assert.ok(!ids[t.id], 'id repetido ' + t.id); ids[t.id] = 1; });
});

prueba('detective: cada plantilla instanciada 200 veces es coherente', function () {
  PR.plantillas.forEach(function (tpl) {
    var az = AZ.crear(77);
    for (var i = 0; i < 200; i++) {
      var g = DE.instanciar(tpl, az), id = tpl.id;
      Object.keys(g.datos).forEach(function (k) {
        var x = g.datos[k]; assert.ok(typeof x.t === 'string' && x.t.length, id + ' texto del dato ' + k);
        if (x.nec) assert.ok(Number.isInteger(x.v) && x.v > 0 && x.v < 100000, id + ' dato ' + k + ' en rango: ' + x.v);
      });
      assert.deepStrictEqual(tokens(g).filter(function (k, j, a) { return a.indexOf(k) === j; }).sort(), Object.keys(g.datos).sort(), id + ': todos los datos aparecen en el texto');
      var usados = clavesUsadas(g), nec = Object.keys(g.datos).filter(function (k) { return g.datos[k].nec; }).sort();
      assert.deepStrictEqual(Object.keys(usados).sort(), nec, id + ': el plan usa exactamente los datos necesarios');
      g.planes.forEach(function (p) {
        var ev = DE.evaluar(g, p), r = ev.vals[ev.vals.length - 1];
        assert.strictEqual(Math.abs(r), g.resultado, id + ': todos los planes aceptables dan el mismo resultado');
        assert.ok(Number.isInteger(r));
      });
      assert.ok(g.planes[0].length >= 1 && g.planes[0].length <= 3, 'de 1 a 3 pasos');
      assert.ok(Number.isInteger(g.final.num) && g.final.num > 0, id + ' respuesta positiva: ' + g.final.num);
      if (tpl.cat >= 4 && tpl.cat <= 6) assert.ok(g.resto && g.resto.r > 0, id + ' resto mayor que 0');
      if (tpl.cat === 2 || tpl.cat === 3) assert.strictEqual(g.restos[0], 0, id + ' división exacta');
      if (g.resto) assert.strictEqual(g.restos[0], g.resto.r);
      if (tpl.cat === 5) assert.strictEqual(g.final.num, g.resto.q + 1);
      if (tpl.cat === 6) assert.strictEqual(g.final.num, g.resto.k - g.resto.r);
      g.planes[0].forEach(function (st) { if (st.op === ':') assert.ok(g.datos[st.args[1]].v < 13, 'divisor chico'); });
    }
  });
});

prueba('detective: las opciones de respuesta tienen una sola correcta y textos distintos', function () {
  PR.plantillas.forEach(function (tpl) {
    var az = AZ.crear(5);
    for (var i = 0; i < 100; i++) {
      var g = DE.instanciar(tpl, az), op = DE.opcionesRespuesta(g, az);
      assert.strictEqual(op.filter(function (o) { return o.ok; }).length, 1, tpl.id);
      assert.strictEqual(new Set(op.map(function (o) { return o.t; })).size, op.length, tpl.id + ' sin repetidas: ' + JSON.stringify(op.map(function (o) { return o.t; })));
      var pr = DE.opcionesPregunta(g, az); assert.strictEqual(pr.filter(function (o) { return o.ok; }).length, 1);
      assert.strictEqual(new Set(pr.map(function (o) { return o.t; })).size, 3, tpl.id + ' paráfrasis distintas');
    }
  });
});

prueba('detective: validadores de plan (conmutatividad, orden de pasos, errores)', function () {
  var az = AZ.crear(3), g = DE.instanciar(plantilla('c1-alfajor'), az);
  assert.ok(DE.validarPlan(g, [{ op: '×', args: ['p', 'n'] }]).ok);
  assert.ok(DE.validarPlan(g, [{ op: '×', args: ['n', 'p'] }]).ok, 'p × n = n × p');
  assert.strictEqual(DE.validarPlan(g, [{ op: '+', args: ['p', 'n'] }]).codigo, 'PLAN_OPERACION');
  var c7 = DE.instanciar(plantilla('c7-ropa'), az);
  assert.ok(DE.validarPlan(c7, [{ op: '×', args: ['a', 'p1'] }, { op: '×', args: ['b', 'p2'] }, { op: '+', args: ['s1', 's2'] }]).ok);
  assert.ok(DE.validarPlan(c7, [{ op: '×', args: ['b', 'p2'] }, { op: '×', args: ['p1', 'a'] }, { op: '+', args: ['s2', 's1'] }]).ok, 'otro orden de pasos');
  var inc = DE.validarPlan(c7, [{ op: '×', args: ['a', 'p1'] }]);
  assert.strictEqual(inc.codigo, 'PLAN_INCOMPLETO'); assert.ok(/cada parte o el total/.test(inc.pista));
  var c9 = DE.instanciar(plantilla('c9-figus'), az);
  assert.ok(DE.validarPlan(c9, [{ op: '−', args: ['t', 'a'] }]).ok);
  assert.strictEqual(DE.validarPlan(c9, [{ op: '−', args: ['a', 't'] }]).codigo, 'PLAN_ORDEN');
  assert.strictEqual(DE.validarPlan(c9, [{ op: '+', args: ['a', 't'] }]).codigo, 'PLAN_OPERACION');
  var c8 = DE.instanciar(plantilla('c8-pelotas'), az);
  assert.ok(DE.validarPlan(c8, [{ op: '×', args: ['n', 'p'] }, { op: '−', args: ['m', 's1'] }]).ok);
  assert.ok(DE.validarPlan(c8, [{ op: '×', args: ['n', 'p'] }, { op: '−', args: ['s1', 'm'] }]).ok, 'las dos restas valen');
});

prueba('detective: la palabra clave, el dato implícito y el dato de más tienen su pista', function () {
  var az = AZ.crear(4), by = function (id) { return DE.instanciar(plantilla(id), az); };
  var c9 = by('c9-figus'), op = DE.opcionesPregunta(c9, az).filter(function (o) { return o.cual === 'clave'; })[0];
  var v = DE.validarPregunta(c9, op); assert.strictEqual(v.codigo, 'PREGUNTA'); assert.ok(/Dice 'regalaron'/.test(v.pista) && /ANTES/.test(v.pista));
  var c10 = by('c10-club'), d = DE.validarDatos(c10, ['p']);
  assert.strictEqual(d.codigo, 'DATOS_FALTAN'); assert.ok(/'medio año' también es un dato\. ¿Cuántos meses son\?/.test(d.pista));
  assert.ok(DE.validarDatos(c10, ['p', 'x']).ok);
  var c11 = by('c11-micro'), e = DE.validarDatos(c11, ['n', 'p', 'h']);
  assert.strictEqual(e.codigo, 'DATOS_DE_MAS'); assert.ok(/¿Para qué usarías/.test(e.pista));
  assert.strictEqual(DE.validarDatos(c11, ['n']).codigo, 'DATOS_FALTAN');
});

prueba('detective: resto, unidad y respuesta abierta', function () {
  var az = AZ.crear(6), by = function (id) { return DE.instanciar(plantilla(id), az); };
  var c5 = by('c5-combis'); assert.strictEqual(DE.validarResto(c5, 'uno_mas').ok, true);
  var m = DE.validarResto(c5, 'sobran'); assert.strictEqual(m.codigo, 'RESTO_INTERPRETACION'); assert.ok(/Hace falta una más/.test(m.pista));
  var c1 = by('c1-alfajor'), u = DE.validarRespuestaAbierta(c1, c1.final.num, 'alfajores');
  assert.strictEqual(u.codigo, 'UNIDAD'); assert.ok(/qué\?/.test(u.pista));
  assert.ok(DE.validarRespuestaAbierta(c1, c1.final.num, 'pesos').ok);
  assert.strictEqual(DE.validarRespuestaAbierta(c1, c1.final.num + 5, 'pesos').codigo, 'OTRO');
});

prueba('detective: el generador respeta las categorías por nivel y la trampa del nivel 3', function () {
  for (var nivel = 1; nivel <= 4; nivel++) {
    var az = AZ.crear(nivel), conT = 0, n = 300;
    for (var i = 0; i < n; i++) { var g = DE.generar(nivel, az, null); assert.ok(DE.CATS_NIVEL[nivel].indexOf(g.cat) >= 0, 'categoría del nivel ' + nivel); if ([7, 9, 10, 11].indexOf(g.cat) >= 0) conT++; }
    if (nivel === 3) assert.ok(conT / n > 0.5 && conT / n < 0.7, 'cerca del 60 % con trampa: ' + conT / n);
    if (nivel === 1) assert.strictEqual(conT, 0);
  }
});
prueba('detective: sin repetir plantilla dentro de una ronda', function () {
  var az = AZ.crear(2), usadas = {};
  for (var i = 0; i < 4; i++) { DE.generar(4, az, usadas); assert.strictEqual(Object.keys(usadas).length, i + 1); }
});
