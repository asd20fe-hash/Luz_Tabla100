'use strict';
var assert = require('assert');
var FR = require('../../actividades/_comun-4to/fracciones-lib.js'), fr = FR.fr, T = FR.deTexto;

function igual(a, b, msg) { assert.ok(FR.iguales(a, b), (msg || '') + ': ' + FR.formatear(a) + ' ≠ ' + FR.formatear(b)); }

prueba('aritmética: 1/2 + 1/4 = 3/4, 3/4 − 1/8 = 5/8, 3/4 > 5/8, 10/8 = 5/4', function () {
  igual(FR.sumar(fr(1, 2), fr(1, 4)), fr(3, 4), 'suma');
  igual(FR.restar(fr(3, 4), fr(1, 8)), fr(5, 8), 'resta');
  assert.strictEqual(FR.comparar(fr(3, 4), fr(5, 8)), 1);
  assert.strictEqual(FR.comparar(fr(1, 8), fr(1, 4)), -1);
  assert.strictEqual(FR.comparar(fr(10, 8), fr(5, 4)), 0);
  assert.deepStrictEqual(FR.simplificar(fr(10, 8)), { n: 5, d: 4 });
});
prueba('mixtos: 7/4 = 1 3/4 y 1 3/4 = 7/4', function () {
  assert.deepStrictEqual(FR.aMixto(fr(7, 4)), { entero: 1, n: 3, d: 4 });
  assert.deepStrictEqual(FR.deMixto(1, 3, 4), { n: 7, d: 4 });
  assert.strictEqual(FR.formatear(fr(7, 4), { mixto: true }), '1 3/4');
  assert.strictEqual(FR.formatear(fr(7, 4)), '7/4');
  assert.strictEqual(FR.formatear(fr(8, 4)), '2');
});
prueba('aDenominador: 3/4 → 6/8; 1/3 → null en octavos', function () {
  assert.deepStrictEqual(FR.aDenominador(fr(3, 4), 8), { n: 6, d: 8 });
  assert.strictEqual(FR.aDenominador(fr(1, 3), 8), null);
});
prueba('parsear: denominador 0 da DEN_CERO; vacío da VACIO; mixto y entero', function () {
  assert.deepStrictEqual(FR.parsear({ entero: '', num: '3', den: '0' }), { error: 'DEN_CERO' });
  assert.deepStrictEqual(FR.parsear({ entero: '', num: '', den: '' }), { error: 'VACIO' });
  assert.deepStrictEqual(FR.parsear({ entero: '', num: '3', den: '' }), { error: 'VACIO' });
  assert.deepStrictEqual(FR.parsear({ entero: '1', num: '3', den: '4' }), { n: 7, d: 4 });
  assert.deepStrictEqual(FR.parsear({ entero: '2', num: '', den: '' }), { n: 2, d: 1 });
  assert.strictEqual(FR.forma({ entero: '1', num: '3', den: '4' }), 'mixto');
  assert.strictEqual(FR.forma({ entero: '', num: '3', den: '4' }), 'fraccion');
  assert.strictEqual(FR.forma({ entero: '3', num: '', den: '' }), 'entero');
});
prueba('leer: sin unidad y con unidad', function () {
  assert.strictEqual(FR.leer(fr(1, 2)), 'un medio');
  assert.strictEqual(FR.leer(fr(3, 4)), 'tres cuartos');
  assert.strictEqual(FR.leer(fr(5, 8)), 'cinco octavos');
  assert.strictEqual(FR.leer(fr(1, 3)), 'un tercio');
  assert.strictEqual(FR.leer(fr(2, 3)), 'dos tercios');
  assert.strictEqual(FR.leer(fr(1, 16)), 'un dieciseisavo');
  assert.strictEqual(FR.leer(fr(7, 4), { mixto: true }), 'un entero y tres cuartos');
  assert.strictEqual(FR.leer(fr(5, 2), { mixto: true }), 'dos enteros y medio');
  assert.strictEqual(FR.leer(fr(1, 2), { unidad: 'kg' }), 'medio kilo');
  assert.strictEqual(FR.leer(fr(1, 4), { unidad: 'kg' }), 'un cuarto de kilo');
  assert.strictEqual(FR.leer(fr(3, 4), { unidad: 'kg' }), 'tres cuartos de kilo');
  assert.strictEqual(FR.leer(fr(5, 4), { unidad: 'kg', mixto: false }), 'cinco cuartos de kilo');
  assert.strictEqual(FR.leer(fr(3, 2), { unidad: 'kg', mixto: true }), 'un kilo y medio');
  assert.strictEqual(FR.leer(fr(5, 4), { unidad: 'kg', mixto: true }), 'un kilo y cuarto');
  assert.strictEqual(FR.leer(fr(7, 4), { unidad: 'kg', mixto: true }), 'un kilo y tres cuartos');
  assert.strictEqual(FR.leer(fr(5, 2), { unidad: 'kg', mixto: true }), 'dos kilos y medio');
  assert.strictEqual(FR.leer(fr(1, 2), { unidad: 'l' }), 'medio litro');
  assert.strictEqual(FR.leer(fr(1, 8), { unidad: 'l' }), 'un octavo de litro');
  assert.strictEqual(FR.leer(fr(3, 2), { unidad: 'l', mixto: true }), 'un litro y medio');
});
prueba('paraVoz: "Necesita 1 3/4 kg de cacao" sin barras', function () {
  var v = FR.paraVoz('Necesita 1 3/4 kg de cacao');
  assert.ok(v.indexOf('un kilo y tres cuartos') >= 0, v);
  assert.ok(v.indexOf('/') < 0, v);
  var w = FR.paraVoz('Tomó 1/4 l a la mañana y 1/2 l a la tarde. 3/8 + 1/4 = □');
  assert.ok(w.indexOf('/') < 0 && w.indexOf('un cuarto de litro') >= 0 && w.indexOf('medio litro') >= 0, w);
});

// Tabla de clasificadores de la sección 15.
var CASOS = [
  ['7 turrones entre 4 → 4/7', 'reparto', { N: 7, M: 4 }, '4/7', 'INVERTIDA'],
  ['7 turrones entre 4 → 1', 'reparto', { N: 7, M: 4 }, '1', 'RESTO_IGNORADO'],
  ['7 turrones entre 4 → 1 3/7', 'reparto', { N: 7, M: 4 }, '1 3/7', 'RESTO_MAL_PARTIDO'],
  ['1/2 + 1/4 → 2/6', 'suma', { a: fr(1, 2), b: fr(1, 4) }, '2/6', 'OPERA_DENOMINADORES'],
  ['3/4 + 1/8 → 4/12', 'suma', { a: fr(3, 4), b: fr(1, 8) }, '4/12', 'OPERA_DENOMINADORES'],
  ['3/8 + 1/4 → 4/8', 'suma', { a: fr(3, 8), b: fr(1, 4) }, '4/8', 'DENOMINADOR_DISTINTO'],
  ['Hizo 5/8 de la tarea, ¿cuánto falta? → 5/8', 'problema', { esperado: fr(3, 8), datos: [fr(5, 8)], T: fr(1, 1), opuesta: fr(13, 8) }, '5/8', 'RESPONDE_EL_DATO'],
  ['Usó 6/8 de los datos, ¿cuánto queda? → 3/4', 'problema', { esperado: fr(1, 4), datos: [fr(6, 8)], T: fr(1, 1), opuesta: fr(14, 8) }, '3/4', 'RESPONDE_EL_DATO'],
  ['Tenía 2 l y tiene 1/4 l, ¿cuánto tomó? → 3/4', 'problema', { esperado: fr(7, 4), datos: [fr(1, 4), fr(2, 1)], T: fr(2, 1), opuesta: fr(9, 4), enteroMal: fr(3, 4) }, '3/4', 'ENTERO_EQUIVOCADO'],
  ['Tenía 2 l y tiene 1/4 l, ¿cuánto tomó? → 9/4', 'problema', { esperado: fr(7, 4), datos: [fr(1, 4), fr(2, 1)], T: fr(2, 1), opuesta: fr(9, 4), enteroMal: fr(3, 4) }, '9/4', 'PLAN_OPERACION'],
  ['Leyó 1/4 y 3/8, ¿cuánto falta? → 5/8', 'problema', { esperado: fr(3, 8), datos: [fr(1, 4), fr(3, 8)], T: fr(1, 1), incompleto: fr(5, 8), opuesta: fr(13, 8) }, '5/8', 'PLAN_INCOMPLETO'],
  ['Equivalente a 1/2 → 2/8', 'equivalente', { f: fr(1, 2) }, '2/8', 'EQUIV_MAL_ESCALADA'],
  ['Equivalente a 1/2 → 2/3', 'equivalente', { f: fr(1, 2) }, '2/3', 'EQUIV_SUMA'],
  ['3 de 8 partes iguales pintadas → 3/5', 'parte', { p: 3, n: 8 }, '3/5', 'PARTE_PARTE'],
  ['"Cuarto escondido" (3 pedazos) → 1/3', 'parte', { p: 1, n: 4, piezas: 3, piezasPintadas: 1 }, '1/3', 'CUENTA_PARTES']
];
CASOS.forEach(function (c) {
  prueba('clasificador: ' + c[0] + ' = ' + c[4], function () { assert.strictEqual(FR.clasificar(c[1], c[2], T(c[3])), c[4]); });
});
prueba('clasificador: comparar 1/8 y 1/4 con ">" = DENOM_MAYOR_ES_MAYOR; 1/2 y 4/8 con "<" = IGUALDAD_NO_DETECTADA', function () {
  assert.strictEqual(FR.clasificar('comparar', { a: fr(1, 8), b: fr(1, 4) }, '>'), 'DENOM_MAYOR_ES_MAYOR');
  assert.strictEqual(FR.clasificar('comparar', { a: fr(1, 2), b: fr(4, 8) }, '<'), 'IGUALDAD_NO_DETECTADA');
  assert.strictEqual(FR.clasificar('comparar', { a: fr(5, 4), b: fr(6, 8) }, '<'), 'MAS_DE_UN_ENTERO');
  assert.strictEqual(FR.clasificar('comparar', { a: fr(1, 2), b: fr(1, 4) }, '>'), null);
});
prueba('clasificador: las respuestas correctas (y sus equivalentes) dan null', function () {
  assert.strictEqual(FR.clasificar('reparto', { N: 7, M: 4 }, T('1 3/4')), null);
  assert.strictEqual(FR.clasificar('reparto', { N: 9, M: 2 }, T('4 2/4')), null);
  assert.strictEqual(FR.clasificar('suma', { a: fr(3, 4), b: fr(1, 8) }, fr(14, 16)), null);
  assert.strictEqual(FR.clasificar('parte', { p: 4, n: 8 }, fr(1, 2)), null);
});
prueba('potes: mayor cantidad de 1/2 y menor cantidad de potes', function () {
  assert.deepStrictEqual(FR.mayorCantidadMedios(T('1 3/4')), { medios: 3, cuartos: 1 });
  assert.deepStrictEqual(FR.menorCantidad(T('2 1/2')), { unos: 2, medios: 1, cuartos: 0 });
  var obj = T('1 3/4');
  assert.strictEqual(FR.clasificar('potes', { objetivo: obj, cond: 'mas_medios' }, [fr(1, 2), fr(1, 2), fr(1, 2), fr(1, 4)]), null);
  assert.strictEqual(FR.clasificar('potes', { objetivo: obj, cond: 'mas_medios' }, [fr(1, 2), fr(1, 2), fr(1, 4), fr(1, 4), fr(1, 4)]), 'RESTRICCION');
  assert.strictEqual(FR.clasificar('potes', { objetivo: obj }, [fr(1, 1), fr(1, 1)]), 'SE_PASA');
  assert.strictEqual(FR.clasificar('potes', { objetivo: obj }, [fr(1, 1)]), 'NO_LLEGA');
  assert.strictEqual(FR.clasificar('potes', { objetivo: T('2 1/2'), cond: 'menos_potes' }, [fr(1, 1), fr(1, 1), fr(1, 2)]), null);
  assert.strictEqual(FR.clasificar('potes', { objetivo: T('2 1/2'), cond: 'menos_potes' }, [fr(1, 1), fr(1, 2), fr(1, 2), fr(1, 2)]), 'RESTRICCION');
});
