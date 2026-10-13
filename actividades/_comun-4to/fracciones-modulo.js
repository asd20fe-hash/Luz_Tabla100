/* Fracciones de 4to — el Anexo A (respuestas del módulo de la escuela) como datos estructurados.
   Lógica pura, sin DOM. Patrón UMD sin módulos: window.REF4_FRMOD. Versión 1.0.0 (2026-10-13).
   Cada entrada: {id, act, tema, texto, casos:[…]} — los casos se verifican con REF4_FR en las pruebas.
   jugar: [{tipo, params}] → ítems que la actividad puede armar con esos mismos números (solo con el interruptor del módulo).
   Las fracciones van como texto ("9/2", "1 3/4") y se leen con REF4_FR.deTexto. */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var M = [
    /* ---------- repartos y partes ---------- */
    { id: 'mod-1a', act: 'repartos', tema: 'reparto', texto: '9 chocolates entre 2', casos: [{ tipo: 'reparto', N: 9, M: 2, resp: '4 1/2' }],
      jugar: [{ tipo: 'R1', params: { N: 9, M: 2, ctx: 'chocolates' } }] },
    { id: 'mod-1b', act: 'repartos', tema: 'reparto', texto: '5 pizzas entre 4', casos: [{ tipo: 'reparto', N: 5, M: 4, resp: '1 1/4' }],
      jugar: [{ tipo: 'R1', params: { N: 5, M: 4, ctx: 'pizzas' } }] },
    { id: 'mod-1c', act: 'repartos', tema: 'reparto', texto: '¿Qué se hace con lo que sobra en 1a y 1b?', casos: [{ tipo: 'corte', N: 9, M: 2, k: 2 }, { tipo: 'corte', N: 5, M: 4, k: 4 }] },
    { id: 'mod-2', act: 'repartos', tema: 'reparto', texto: 'El dibujo de 9 chocolates y la cuenta 5 : 4 = 1, resto 1', casos: [{ tipo: 'reparto', N: 9, M: 2, resp: '4 1/2' }, { tipo: 'reparto', N: 5, M: 4, resp: '1 1/4' }],
      jugar: [{ tipo: 'R3', params: { N: 5, M: 4, ctx: 'pizzas', forma: 'cuenta' } }, { tipo: 'R3', params: { N: 9, M: 2, ctx: 'chocolates', forma: 'dibujo' } }] },
    { id: 'mod-3a', act: 'repartos', tema: 'reparto', texto: '7 muffins entre 2', casos: [{ tipo: 'reparto', N: 7, M: 2, resp: '3 1/2' }],
      jugar: [{ tipo: 'R1', params: { N: 7, M: 2, ctx: 'muffins' } }] },
    { id: 'mod-3b', act: 'repartos', tema: 'medidas', texto: '2 kg de helado en 4 potes', casos: [{ tipo: 'reparto', N: 2, M: 4, resp: '1/2' }],
      jugar: [{ tipo: 'R1', params: { N: 2, M: 4, ctx: 'helado' } }] },
    { id: 'mod-5', act: 'partes', tema: 'partes', texto: '¿Cuáles tienen pintado exactamente 1/4?',
      casos: [{ tipo: 'exacto', fig: 'cuarto_escondido', objetivo: '1/4', es: true }, { tipo: 'exacto', fig: 'cuadricula_4_1', objetivo: '1/4', es: true },
              { tipo: 'exacto', fig: 'triangulo_9_3', objetivo: '1/4', es: false, vale: '1/3' }, { tipo: 'exacto', fig: 'tiras_4_2', objetivo: '1/4', es: false, vale: '1/2' }],
      jugar: [{ tipo: 'P3', params: { objetivo: '1/4', figs: ['cuarto_escondido', 'cuadricula_4_1', 'triangulo_9_3', 'tiras_4_2'] } }] },
    { id: 'mod-7', act: 'partes', tema: 'entero', texto: 'Una cinta es 1/4 (o 1/2, o 3/4) de la entera', casos: [{ tipo: 'entero', parte: '1/4', cintas: 4 }, { tipo: 'entero', parte: '1/2', cintas: 2 }, { tipo: 'entero', parte: '3/4', cintas: '4/3' }],
      jugar: [{ tipo: 'P4', params: { a: 1, b: 4, u: 2 } }, { tipo: 'P4', params: { a: 1, b: 2, u: 3 } }, { tipo: 'P4', params: { a: 3, b: 4, u: 2 } }] },
    /* ---------- equivalencias ---------- */
    { id: 'mod-8', act: 'muro', tema: 'equivalencias', texto: 'Un budín entre 2: 1 de 2 porciones, o 2 de 4', casos: [{ tipo: 'equiv', a: '1/2', b: '2/4', es: true }],
      jugar: [{ tipo: 'E4', params: { plantilla: 'budin', a: '1/2', b: '2/4' } }] },
    { id: 'mod-9', act: 'muro', tema: 'equivalencias', texto: '¿Es equivalente a 1/2: 2/4 o 2/8?', casos: [{ tipo: 'equiv', a: '1/2', b: '2/4', es: true }, { tipo: 'equiv', a: '1/2', b: '2/8', es: false }, { tipo: 'equiv', a: '1/4', b: '2/8', es: true }],
      jugar: [{ tipo: 'E4', params: { plantilla: 'uno_solo', f: '1/2', bien: '2/4', mal: '2/8' } }] },
    { id: 'mod-10', act: 'muro', tema: 'equivalencias', texto: 'Pintadas: 1 de 2, 3 de 4 y 4 de 8', casos: [{ tipo: 'pintada', p: 1, n: 2, resp: '1/2' }, { tipo: 'pintada', p: 3, n: 4, resp: '3/4' }, { tipo: 'pintada', p: 4, n: 8, resp: '4/8' }, { tipo: 'equiv', a: '1/2', b: '4/8', es: true }, { tipo: 'equiv', a: '3/4', b: '1/2', es: false }] },
    { id: 'mod-11', act: 'muro', tema: 'equivalencias', texto: 'La mitad de una figura, ¿es 1/2 o 2/4?', casos: [{ tipo: 'equiv', a: '1/2', b: '2/4', es: true }],
      jugar: [{ tipo: 'E4', params: { plantilla: 'los_dos', a: '1/2', b: '2/4' } }] },
    { id: 'mod-12', act: 'muro', tema: 'equivalencias', texto: 'Rodear equivalentes',
      casos: [{ tipo: 'rodear', f: '1/2', fichas: ['1/4', '3/2', '2/4', '4/8'], resp: ['2/4', '4/8'] }, { tipo: 'rodear', f: '3/4', fichas: ['2/8', '3/2', '6/8', '1/2'], resp: ['6/8'] },
              { tipo: 'rodear', f: '2/8', fichas: ['1/4', '1/2', '2/4', '3/2'], resp: ['1/4'] }],
      jugar: [{ tipo: 'E3', params: { f: '1/2', fichas: ['1/4', '3/2', '2/4', '4/8'] } }, { tipo: 'E3', params: { f: '3/4', fichas: ['2/8', '3/2', '6/8', '1/2'] } }, { tipo: 'E3', params: { f: '2/8', fichas: ['1/4', '1/2', '2/4', '3/2'] } }] },
    /* ---------- comparación ---------- */
    { id: 'mod-13', act: 'comparar', tema: 'comparacion', texto: 'Leyeron 1/4 y 1/2; leyeron 3/4 y 5/8', casos: [{ tipo: 'comparar', a: '1/4', b: '1/2', rel: '<' }, { tipo: 'comparar', a: '3/4', b: '5/8', rel: '>' }, { tipo: 'equiv', a: '3/4', b: '6/8', es: true }],
      jugar: [{ tipo: 'C3', params: { a: '1/4', b: '1/2', pregunta: 'mas' } }, { tipo: 'C3', params: { a: '3/4', b: '5/8', pregunta: 'mas' } }] },
    { id: 'mod-14', act: 'comparar', tema: 'comparacion', texto: '2/4 ? 5/4; 1/2 ? 3/8; 1/8 ? 1/4; 5/4 ? 6/8',
      casos: [{ tipo: 'comparar', a: '2/4', b: '5/4', rel: '<' }, { tipo: 'comparar', a: '1/2', b: '3/8', rel: '>' }, { tipo: 'comparar', a: '1/8', b: '1/4', rel: '<' }, { tipo: 'comparar', a: '5/4', b: '6/8', rel: '>' }],
      jugar: [{ tipo: 'C1', params: { a: '2/4', b: '5/4' } }, { tipo: 'C1', params: { a: '1/2', b: '3/8' } }, { tipo: 'C1', params: { a: '1/8', b: '1/4' } }, { tipo: 'C1', params: { a: '5/4', b: '6/8' } }] },
    { id: 'mod-15', act: 'comparar', tema: 'comparacion', texto: 'Con el mismo denominador, ¿cuál es mayor? ¿Y con el mismo numerador?',
      casos: [{ tipo: 'comparar', a: '3/8', b: '5/8', rel: '<' }, { tipo: 'comparar', a: '3/4', b: '3/8', rel: '>' },
              { tipo: 'opcion', pregunta: 'Si dos fracciones tienen el mismo numerador, es mayor…', opciones: ['la de menor denominador', 'la de mayor denominador', 'ninguna'], correcta: 0 }] },
    { id: 'mod-16', act: 'comparar', tema: 'mayor_que_uno', texto: 'Mayores que 1 entre 3/2, 2/8, 7/4, 1/4, 5/2, 9/8, 7/8',
      casos: [{ tipo: 'mayores', fichas: ['3/2', '2/8', '7/4', '1/4', '5/2', '9/8', '7/8'], resp: ['3/2', '7/4', '5/2', '9/8'] }],
      jugar: [{ tipo: 'C2', params: { fichas: ['3/2', '2/8', '7/4', '1/4', '5/2', '9/8', '7/8'] } }] },
    /* ---------- cuánto falta, sumas y restas ---------- */
    { id: 'mod-17', act: 'cuanto-falta', tema: 'problemas', texto: 'Pintó 1/2; hizo 5/8; de 2 kg comió 5/4; tenía 2 l y quedan 1/4 l',
      casos: [{ tipo: 'op', a: '1', op: '-', b: '1/2', resp: '1/2' }, { tipo: 'op', a: '1', op: '-', b: '5/8', resp: '3/8' }, { tipo: 'op', a: '2', op: '-', b: '5/4', resp: '3/4' }, { tipo: 'op', a: '2', op: '-', b: '1/4', resp: '1 3/4' }],
      jugar: [{ tipo: 'S4', params: { cat: 'P1', a: '5/8', ctx: 'pared' } }, { tipo: 'S4', params: { cat: 'P2', T: '2', a: '5/4', ctx: 'pan' } }, { tipo: 'S4', params: { cat: 'P3', T: '2', a: '1/4', ctx: 'jugo' } }] },
    { id: 'mod-18', act: 'cuanto-falta', tema: 'cuanto_falta', texto: 'Completar 1/2, 3/4 y 7/8 hasta 1; 3/2, 7/4 y 10/8 hasta 2',
      casos: [{ tipo: 'op', a: '1', op: '-', b: '1/2', resp: '1/2' }, { tipo: 'op', a: '1', op: '-', b: '3/4', resp: '1/4' }, { tipo: 'op', a: '1', op: '-', b: '7/8', resp: '1/8' },
              { tipo: 'op', a: '2', op: '-', b: '3/2', resp: '1/2' }, { tipo: 'op', a: '2', op: '-', b: '7/4', resp: '1/4' }, { tipo: 'op', a: '2', op: '-', b: '10/8', resp: '6/8' }],
      jugar: [{ tipo: 'S2', params: { a: '3/4', T: '1' } }, { tipo: 'S2', params: { a: '7/8', T: '1' } }, { tipo: 'S2', params: { a: '7/4', T: '2' } }, { tipo: 'S2', params: { a: '10/8', T: '2' } }] },
    { id: 'mod-19', act: 'cuanto-falta', tema: 'sumas_restas', texto: '1/2 + 3/2; 1/2 + 1/4; 3/8 + 1/4; 3/4 − 1/4; 1/2 − 1/4; 3/4 − 1/8',
      casos: [{ tipo: 'op', a: '1/2', op: '+', b: '3/2', resp: '2' }, { tipo: 'op', a: '1/2', op: '+', b: '1/4', resp: '3/4' }, { tipo: 'op', a: '3/8', op: '+', b: '1/4', resp: '5/8' },
              { tipo: 'op', a: '3/4', op: '-', b: '1/4', resp: '1/2' }, { tipo: 'op', a: '1/2', op: '-', b: '1/4', resp: '1/4' }, { tipo: 'op', a: '3/4', op: '-', b: '1/8', resp: '5/8' }],
      jugar: [{ tipo: 'S3', params: { a: '1/2', op: '+', b: '1/4' } }, { tipo: 'S3', params: { a: '3/8', op: '+', b: '1/4' } }, { tipo: 'S3', params: { a: '3/4', op: '-', b: '1/8' } }] },
    /* ---------- actividades de repaso ---------- */
    { id: 'rep-1', act: 'repartos', tema: 'reparto', texto: '5 alfajores entre 2; 6 l en 4 botellas; 6 kg en 8 potes',
      casos: [{ tipo: 'reparto', N: 5, M: 2, resp: '2 1/2' }, { tipo: 'reparto', N: 6, M: 4, resp: '1 1/2' }, { tipo: 'reparto', N: 6, M: 8, resp: '3/4' }],
      jugar: [{ tipo: 'R1', params: { N: 5, M: 2, ctx: 'alfajores' } }, { tipo: 'R1', params: { N: 6, M: 4, ctx: 'jugo' } }, { tipo: 'R1', params: { N: 6, M: 8, ctx: 'helado' } }] },
    { id: 'rep-4', act: 'comparar', tema: 'comparacion', texto: 'Recorrieron 1/2 y 4/8: ¿a quién le falta más? Comieron 2/4 y 3/8: ¿quién comió menos?',
      casos: [{ tipo: 'comparar', a: '1/2', b: '4/8', rel: '=' }, { tipo: 'comparar', a: '2/4', b: '3/8', rel: '>' }],
      jugar: [{ tipo: 'C3', params: { a: '1/2', b: '4/8', pregunta: 'falta' } }, { tipo: 'C3', params: { a: '2/4', b: '3/8', pregunta: 'menos' } }] },
    { id: 'rep-5', act: 'muro', tema: 'equivalencias', texto: 'Seis de 1/4 y tres de 1/2; ocho de 1/4 y tres de 1/2; diez de 1/8 y cinco de 1/4; seis de 1/8 y dos de 1/2',
      casos: [{ tipo: 'vf', k: 6, b: 4, j: 3, c: 2, es: true }, { tipo: 'vf', k: 8, b: 4, j: 3, c: 2, es: false }, { tipo: 'vf', k: 10, b: 8, j: 5, c: 4, es: true }, { tipo: 'vf', k: 6, b: 8, j: 2, c: 2, es: false }],
      jugar: [{ tipo: 'E5', params: { k: 6, b: 4, j: 3, c: 2 } }, { tipo: 'E5', params: { k: 8, b: 4, j: 3, c: 2 } }, { tipo: 'E5', params: { k: 10, b: 8, j: 5, c: 4 } }, { tipo: 'E5', params: { k: 6, b: 8, j: 2, c: 2 } }] },
    { id: 'rep-6', act: 'muro', tema: 'equivalencias', texto: 'Equivalentes a 1/2 entre 3/4, 4/2, 5/8, 2/4, 8/16, 12/8',
      casos: [{ tipo: 'rodear', f: '1/2', fichas: ['3/4', '4/2', '5/8', '2/4', '8/16', '12/8'], resp: ['2/4', '8/16'] }],
      jugar: [{ tipo: 'E3', params: { f: '1/2', fichas: ['3/4', '4/2', '5/8', '2/4', '8/16', '12/8'] } }] },
    { id: 'rep-7', act: 'cuanto-falta', tema: 'sumas_restas', texto: '4/8 + 1/4; 3/8 + 1/2; 5/4 − 1/2; 10/8 − 1/2',
      casos: [{ tipo: 'op', a: '4/8', op: '+', b: '1/4', resp: '3/4' }, { tipo: 'op', a: '3/8', op: '+', b: '1/2', resp: '7/8' }, { tipo: 'op', a: '5/4', op: '-', b: '1/2', resp: '3/4' }, { tipo: 'op', a: '10/8', op: '-', b: '1/2', resp: '3/4' }],
      jugar: [{ tipo: 'S3', params: { a: '4/8', op: '+', b: '1/4' } }, { tipo: 'S3', params: { a: '3/8', op: '+', b: '1/2' } }, { tipo: 'S3', params: { a: '5/4', op: '-', b: '1/2' } }] },
    { id: 'rep-8', act: 'cuanto-falta', tema: 'problemas', texto: 'Leyó 3/4: ¿cuánto le falta? Consumió 3/8: ¿cuánto queda?',
      casos: [{ tipo: 'op', a: '1', op: '-', b: '3/4', resp: '1/4' }, { tipo: 'op', a: '1', op: '-', b: '3/8', resp: '5/8' }],
      jugar: [{ tipo: 'S4', params: { cat: 'P1', a: '3/4', ctx: 'libro' } }] },
    /* ---------- test (opción múltiple) ---------- */
    { id: 'test-a', act: 'repartos', tema: 'reparto', texto: '7 turrones entre 4', casos: [{ tipo: 'opcion', pregunta: 'Se reparten 7 turrones entre 4 personas. ¿Cuánto recibe cada una?', opciones: ['4/7', '7/2', '7/4', '7/8'], correcta: 2 }],
      jugar: [{ tipo: 'R4', params: { N: 7, M: 4, ctx: 'turrones', opciones: ['4/7', '7/2', '7/4', '7/8'] } }] },
    { id: 'test-b', act: 'partes', tema: 'partes', texto: '4 de 8 cuadrados pintados', casos: [{ tipo: 'opcion', pregunta: '¿Qué parte está pintada?', opciones: ['8/4', '4/8', '1/4', '3/2'], correcta: 1 }, { tipo: 'pintada', p: 4, n: 8, resp: '4/8' }],
      jugar: [{ tipo: 'P1', params: { fig: 'cuadricula_8_4' } }] },
    { id: 'test-c', act: 'muro', tema: 'equivalencias', texto: 'Equivalente a 3/4', casos: [{ tipo: 'opcion', pregunta: '¿Cuál es equivalente a 3/4?', opciones: ['3/8', '6/7', '2/3', '6/8'], correcta: 3 }, { tipo: 'equiv', a: '3/4', b: '6/8', es: true }],
      jugar: [{ tipo: 'E3', params: { f: '3/4', fichas: ['3/8', '6/7', '2/3', '6/8'] } }] },
    { id: 'test-d', act: 'comparar', tema: 'comparacion', texto: 'Mayor que 5/4', casos: [{ tipo: 'opcion', pregunta: '¿Cuál es mayor que 5/4?', opciones: ['3/2', '5/8', '9/8', '3/4'], correcta: 0 }, { tipo: 'comparar', a: '3/2', b: '5/4', rel: '>' }],
      jugar: [{ tipo: 'C5', params: { ref: '5/4', opciones: ['3/2', '5/8', '9/8', '3/4'] } }] },
    { id: 'test-e', act: 'cuanto-falta', tema: 'problemas', texto: 'Usó 6/8 de los datos: ¿cuánto queda?', casos: [{ tipo: 'opcion', pregunta: 'Usó 6/8 de los datos del celular. ¿Cuánto le queda?', opciones: ['1/8', '1/4', '3/4', '3/8'], correcta: 1 }, { tipo: 'op', a: '1', op: '-', b: '6/8', resp: '1/4' }],
      jugar: [{ tipo: 'S4', params: { cat: 'P1', a: '6/8', ctx: 'datos' } }] },
    { id: 'test-f', act: 'cuanto-falta', tema: 'sumas_restas', texto: '3/4 + 1/8', casos: [{ tipo: 'opcion', pregunta: '¿Cuánto es 3/4 + 1/8?', opciones: ['1/2', '6/8', '4/12', '7/8'], correcta: 3 }, { tipo: 'op', a: '3/4', op: '+', b: '1/8', resp: '7/8' }],
      jugar: [{ tipo: 'S5', params: { a: '3/4', op: '+', b: '1/8', opciones: ['1/2', '6/8', '4/12', '7/8'] } }] },
    /* ---------- kilos y litros ---------- */
    { id: 'kg-1', act: 'potes-vasos', tema: 'medidas', texto: '¿Alcanzan potes de 1, 1/2, 1/4 y 1/4 kg para 2 kg? Armar 1 kg',
      casos: [{ tipo: 'potes', lista: ['1', '1/2', '1/4', '1/4'], objetivo: '2', resultado: 'justo' }, { tipo: 'potes', lista: ['1/2', '1/2'], objetivo: '1', resultado: 'justo' },
              { tipo: 'potes', lista: ['1/2', '1/4', '1/4'], objetivo: '1', resultado: 'justo' }, { tipo: 'potes', lista: ['1/4', '1/4', '1/4', '1/4'], objetivo: '1', resultado: 'justo' }],
      jugar: [{ tipo: 'K2', params: { lista: ['1', '1/2', '1/4', '1/4'], objetivo: '2' } }, { tipo: 'K1', params: { objetivo: '1', cond: 'cuartos' } }] },
    { id: 'kg-2', act: 'potes-vasos', tema: 'medidas', texto: '¿Es justo 1 1/2 kg?',
      casos: [{ tipo: 'potes', lista: ['1/4', '1/4', '1/2'], objetivo: '1 1/2', resultado: 'falta 1/2' }, { tipo: 'potes', lista: ['1/4', '1/4', '1/2', '1/4'], objetivo: '1 1/2', resultado: 'falta 1/4' },
              { tipo: 'potes', lista: ['1/2', '1/2', '1/2', '1/4'], objetivo: '1 1/2', resultado: 'sobra 1/4' }, { tipo: 'potes', lista: ['1/2', '1/4', '1/2', '1/4'], objetivo: '1 1/2', resultado: 'justo' }],
      jugar: [{ tipo: 'K3', params: { objetivo: '1 1/2', filas: [['1/4', '1/4', '1/2'], ['1/4', '1/4', '1/2', '1/4'], ['1/2', '1/2', '1/2', '1/4'], ['1/2', '1/4', '1/2', '1/4']] } }] },
    { id: 'kg-3', act: 'potes-vasos', tema: 'medidas', texto: '1 3/4 kg solo con potes de 1/2; con la mayor cantidad de 1/2; solo con potes de 1/4',
      casos: [{ tipo: 'sepuede', objetivo: '1 3/4', pote: '1/2', es: false }, { tipo: 'masMedios', objetivo: '1 3/4', medios: 3, cuartos: 1 }, { tipo: 'cuantos', objetivo: '1 3/4', pote: '1/4', resp: 7 }],
      jugar: [{ tipo: 'K1', params: { objetivo: '1 3/4', cond: 'mas_medios', sePuede: true } }] },
    { id: 'kg-4', act: 'potes-vasos', tema: 'medidas', texto: 'Completar hasta 1 3/4',
      casos: [{ tipo: 'completar', sumandos: ['1/2', '3/4'], total: '1 3/4', resp: '1/2' }, { tipo: 'completar', sumandos: ['1', '1/2'], total: '1 3/4', resp: '1/4' },
              { tipo: 'completar', sumandos: ['1/2', '1/2', '1/4'], total: '1 3/4', resp: '1/2' }, { tipo: 'completar', sumandos: ['1/4', '1/4', '1/4', '1/4', '1/4'], total: '1 3/4', resp: '2/4' },
              { tipo: 'equiv', a: '2/4', b: '1/2', es: true }],
      jugar: [{ tipo: 'K4', params: { sumandos: ['1/2', '3/4'], total: '1 3/4' } }, { tipo: 'K4', params: { sumandos: ['1', '1/2'], total: '1 3/4' } }] },
    { id: 'l-5', act: 'potes-vasos', tema: 'medidas', texto: '1 l = 8 chicos = 4 medianos',
      casos: [{ tipo: 'vasos', litros: '1/2', vaso: '1/4', resp: 2 }, { tipo: 'vasos', litros: '1/2', vaso: '1/8', resp: 4 }, { tipo: 'vasos', litros: '1/4', vaso: '1/8', resp: 2 }],
      jugar: [{ tipo: 'K5', params: { pregunta: 'medianos_medio' } }, { tipo: 'K5', params: { pregunta: 'chicos_medio' } }, { tipo: 'K5', params: { pregunta: 'chicos_mediano' } }] },
    { id: 'l-5f', act: 'potes-vasos', tema: 'medidas', texto: 'Jarra de 1 1/2 l',
      casos: [{ tipo: 'jarra', cap: '1 1/2', servidos: ['1/4', '1/4', '1/8', '1/8'], resp: '3/4' }, { tipo: 'jarra', cap: '1 1/2', servidos: ['1/8', '1/8', '2/4', '1/8'], resp: '5/8' }],
      jugar: [{ tipo: 'K5', params: { pregunta: 'jarra', servir: ['1/4', '1/4', '1/8', '1/8'] } }, { tipo: 'K5', params: { pregunta: 'jarra', servir: ['1/8', '1/8', '1/4', '1/4', '1/8'] } }] }
  ];

  function deActividad(act) {
    var out = [];
    M.forEach(function (e) { (e.jugar || []).forEach(function (j) { if (e.act === act) out.push({ id: e.id, tema: e.tema, tipo: j.tipo, params: j.params }); }); });
    return out;
  }
  function porId(id) { return M.filter(function (e) { return e.id === id; })[0] || null; }

  var api = { VERSION: VERSION, ENTRADAS: M, deActividad: deActividad, porId: porId };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_FRMOD = api; }
})(typeof window !== 'undefined' ? window : this);
