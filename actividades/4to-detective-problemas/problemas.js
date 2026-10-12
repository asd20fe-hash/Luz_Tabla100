/* Detective de problemas: plantillas de problemas (datos puros, sin DOM). 11 categorías × 3 plantillas.
   Cada plantilla genera un problema con números al azar. Patrón UMD sin módulos: window.REF4_PROBLEMAS.
   Una plantilla.gen(az) devuelve:
     partes / pregunta : texto, con huecos {k:'clave'} que se muestran con datos[clave].t (y se pueden tocar)
     datos             : {clave: {v, t, nec (1 = necesario), imp (1 = implícito), expr, unidadImp}}
     op                : las tres paráfrasis de "¿qué te pregunta?" {ok, paso, clave}
     planes            : planes aceptables; cada paso es {op, args}; un arg es una clave de dato o 's1', 's2' (resultado de un paso)
     resto             : null | {tipo:'sobran'|'uno_mas'|'falta', q, r, k}
     unidad, unidadMal : unidad correcta y unidades equivocadas; fin(vals) → {num, unidad, frase?}  */
(function (root) {
  'use strict';

  var NOMBRES = ['Mateo', 'Lucía', 'Tomás', 'Valentina', 'Joaquín', 'Camila', 'Santi', 'Delfina', 'Bruno', 'Julieta'];
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pesos(n) { return '$' + miles(n); }
  function nom(az) { return az.elegir(NOMBRES); }
  function s(op, a, b, c) { var args = [a, b]; if (c) args.push(c); return { op: op, args: args }; }
  function d(v, t, nec, extra) { var o = { v: v, t: t, nec: nec ? 1 : 0 }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function fin1(unidad) { return function (v) { return { num: v[v.length - 1], unidad: unidad }; }; }

  var P = [];
  function T(id, cat, trampa, gen) { P.push({ id: id, cat: cat, trampa: trampa, gen: gen }); }

  /* ---------- C1: precio × cantidad ---------- */
  T('c1-alfajor', 1, 'ninguna', function (az) {
    var N = nom(az), p = az.entero(5, 18) * 50, n = az.entero(3, 12);
    return { partes: ['Cada alfajor cuesta ', { k: 'p' }, '. ' + N + ' compra ', { k: 'n' }, '. '], pregunta: ['¿Cuánto paga ' + N + ' en total?'],
      datos: { p: d(p, pesos(p), 1), n: d(n, n + ' alfajores', 1) },
      op: { ok: '¿Cuánto paga ' + N + ' por todos los alfajores?', paso: '¿Cuánto cuesta un alfajor?', clave: '¿Cuántos alfajores compra ' + N + '?' },
      planes: [[s('×', 'p', 'n')]], resto: null, unidad: 'pesos', unidadMal: ['alfajores', 'chicos'], fin: fin1('pesos') };
  });
  T('c1-cine', 1, 'ninguna', function (az) {
    var p = az.entero(6, 20) * 100, n = az.entero(3, 9);
    return { partes: ['Una entrada al cine cuesta ', { k: 'p' }, '. Van ', { k: 'n' }, ' al cine. '], pregunta: ['¿Cuánto pagan en total?'],
      datos: { p: d(p, pesos(p), 1), n: d(n, n + ' chicos', 1) },
      op: { ok: '¿Cuánto pagan entre todos?', paso: '¿Cuánto cuesta una entrada?', clave: '¿Cuántos chicos van al cine?' },
      planes: [[s('×', 'p', 'n')]], resto: null, unidad: 'pesos', unidadMal: ['entradas', 'chicos'], fin: fin1('pesos') };
  });
  T('c1-figus', 1, 'ninguna', function (az) {
    var N = nom(az), f = az.entero(4, 12), n = az.entero(3, 15);
    return { partes: ['Cada paquete trae ', { k: 'f' }, '. ' + N + ' compra ', { k: 'n' }, '. '], pregunta: ['¿Cuántas figuritas tiene en total?'],
      datos: { f: d(f, f + ' figuritas', 1), n: d(n, n + ' paquetes', 1) },
      op: { ok: '¿Cuántas figuritas tiene ' + N + ' en total?', paso: '¿Cuántas figuritas trae un paquete?', clave: '¿Cuántos paquetes compra ' + N + '?' },
      planes: [[s('×', 'f', 'n')]], resto: null, unidad: 'figuritas', unidadMal: ['paquetes', 'chicos'], fin: fin1('figuritas') };
  });

  /* ---------- C2: reparto exacto ---------- */
  T('c2-figus', 2, 'ninguna', function (az) {
    var k = az.entero(3, 9), q = az.entero(12, 95), n = k * q;
    return { partes: [{ k: 'n' }, ' se reparten en partes iguales entre ', { k: 'k' }, '. '], pregunta: ['¿Cuántas le tocan a cada uno?'],
      datos: { n: d(n, miles(n) + ' figuritas', 1), k: d(k, k + ' chicos', 1) },
      op: { ok: '¿Cuántas figuritas le tocan a cada chico?', paso: '¿Cuántas figuritas hay en total?', clave: '¿Cuántos chicos reciben figuritas?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'figuritas', unidadMal: ['chicos', 'grupos'], fin: fin1('figuritas') };
  });
  T('c2-pesos', 2, 'ninguna', function (az) {
    var k = az.entero(3, 8), q = az.entero(4, 40) * 50, n = k * q;
    return { partes: ['Entre ', { k: 'k' }, ' se reparten en partes iguales ', { k: 'n' }, '. '], pregunta: ['¿Cuánto le toca a cada uno?'],
      datos: { k: d(k, k + ' hermanos', 1), n: d(n, pesos(n), 1) },
      op: { ok: '¿Cuánto dinero le toca a cada hermano?', paso: '¿Cuánto dinero se reparte en total?', clave: '¿Cuántos hermanos hay?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'pesos', unidadMal: ['hermanos', 'monedas'], fin: fin1('pesos') };
  });
  T('c2-caramelos', 2, 'ninguna', function (az) {
    var k = az.entero(4, 9), q = az.entero(10, 60), n = k * q;
    return { partes: ['La seño tiene ', { k: 'n' }, ' y los reparte, en partes iguales, en ', { k: 'k' }, '. '], pregunta: ['¿Cuántos caramelos le tocan a cada grupo?'],
      datos: { n: d(n, miles(n) + ' caramelos', 1), k: d(k, k + ' grupos', 1) },
      op: { ok: '¿Cuántos caramelos le tocan a cada grupo?', paso: '¿Cuántos caramelos hay en total?', clave: '¿Cuántos grupos hay?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'caramelos', unidadMal: ['grupos', 'bolsitas'], fin: fin1('caramelos') };
  });

  /* ---------- C3: partición exacta ---------- */
  T('c3-equipos', 3, 'ninguna', function (az) {
    var k = az.entero(5, 11), q = az.entero(3, 20), n = k * q;
    return { partes: ['Hay ', { k: 'n' }, ' y se arman equipos de ', { k: 'k' }, '. '], pregunta: ['¿Cuántos equipos se arman?'],
      datos: { n: d(n, n + ' jugadores', 1), k: d(k, k + ' jugadores', 1) },
      op: { ok: '¿Cuántos equipos se arman?', paso: '¿Cuántos jugadores hay en total?', clave: '¿Cuántos jugadores tiene cada equipo?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'equipos', unidadMal: ['jugadores', 'partidos'], fin: fin1('equipos') };
  });
  T('c3-sillas', 3, 'ninguna', function (az) {
    var k = az.entero(6, 12), q = az.entero(4, 30), n = k * q;
    return { partes: ['En el patio hay ', { k: 'n' }, ' y se ponen ', { k: 'k' }, ' en cada fila. '], pregunta: ['¿Cuántas filas se forman?'],
      datos: { n: d(n, miles(n) + ' sillas', 1), k: d(k, k + ' sillas', 1) },
      op: { ok: '¿Cuántas filas se forman?', paso: '¿Cuántas sillas hay en el patio?', clave: '¿Cuántas sillas van en cada fila?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'filas', unidadMal: ['sillas', 'patios'], fin: fin1('filas') };
  });
  T('c3-lapices', 3, 'ninguna', function (az) {
    var k = az.entero(6, 12), q = az.entero(5, 60), n = k * q;
    return { partes: ['Una librería tiene ', { k: 'n' }, ' y los guarda en cajas de ', { k: 'k' }, '. '], pregunta: ['¿Cuántas cajas usa?'],
      datos: { n: d(n, miles(n) + ' lápices', 1), k: d(k, k + ' lápices', 1) },
      op: { ok: '¿Cuántas cajas usa la librería?', paso: '¿Cuántos lápices tiene la librería?', clave: '¿Cuántos lápices entran en cada caja?' },
      planes: [[s(':', 'n', 'k')]], resto: null, unidad: 'cajas', unidadMal: ['lápices', 'librerías'], fin: fin1('cajas') };
  });

  /* ---------- C4: sobran ---------- */
  function conResto(az, kmin, kmax, qmin, qmax) {
    var k = az.entero(kmin, kmax), q = az.entero(qmin, qmax), r = az.entero(1, k - 1);
    return { k: k, q: q, r: r, n: k * q + r };
  }
  T('c4-caramelos', 4, 'resto', function (az) {
    var x = conResto(az, 5, 9, 20, 90);
    return { partes: ['Tenés ', { k: 'n' }, ' y armás bolsitas de ', { k: 'k' }, '. '], pregunta: ['¿Cuántos caramelos sobran?'],
      datos: { n: d(x.n, miles(x.n) + ' caramelos', 1), k: d(x.k, x.k + ' caramelos', 1) },
      op: { ok: '¿Cuántos caramelos sobran?', paso: '¿Cuántas bolsitas se arman?', clave: '¿Cuántos caramelos entran en cada bolsita?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'sobran', q: x.q, r: x.r, k: x.k }, unidad: 'caramelos', unidadMal: ['bolsitas', 'chicos'],
      fin: function () { return { num: x.r, unidad: 'caramelos' }; } };
  });
  T('c4-figus', 4, 'resto', function (az) {
    var x = conResto(az, 5, 9, 15, 80);
    return { partes: ['Lola tiene ', { k: 'n' }, ' y las guarda en sobres de ', { k: 'k' }, '. '], pregunta: ['¿Cuántas figuritas quedan sueltas?'],
      datos: { n: d(x.n, miles(x.n) + ' figuritas', 1), k: d(x.k, x.k + ' figuritas', 1) },
      op: { ok: '¿Cuántas figuritas quedan sin sobre?', paso: '¿Cuántos sobres llena Lola?', clave: '¿Cuántas figuritas entran en cada sobre?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'sobran', q: x.q, r: x.r, k: x.k }, unidad: 'figuritas', unidadMal: ['sobres', 'chicos'],
      fin: function () { return { num: x.r, unidad: 'figuritas' }; } };
  });
  T('c4-flores', 4, 'resto', function (az) {
    var x = conResto(az, 6, 9, 12, 70);
    return { partes: ['En la florería hay ', { k: 'n' }, ' y se arman ramos de ', { k: 'k' }, '. '], pregunta: ['¿Cuántas flores sobran?'],
      datos: { n: d(x.n, x.n + ' flores', 1), k: d(x.k, x.k + ' flores', 1) },
      op: { ok: '¿Cuántas flores sobran?', paso: '¿Cuántos ramos se arman?', clave: '¿Cuántas flores tiene cada ramo?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'sobran', q: x.q, r: x.r, k: x.k }, unidad: 'flores', unidadMal: ['ramos', 'floreros'],
      fin: function () { return { num: x.r, unidad: 'flores' }; } };
  });

  /* ---------- C5: necesito uno más ---------- */
  T('c5-combis', 5, 'resto', function (az) {
    var x = conResto(az, 8, 12, 5, 30);
    return { partes: [{ k: 'n' }, ' van de excursión en combis de ', { k: 'k' }, '. '], pregunta: ['¿Cuántas combis hacen falta?'],
      datos: { n: d(x.n, x.n + ' chicos', 1), k: d(x.k, x.k + ' asientos', 1) },
      op: { ok: '¿Cuántas combis se necesitan para llevar a todos?', paso: '¿Cuántas combis se llenan?', clave: '¿Cuántos chicos sobran?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'uno_mas', q: x.q, r: x.r, k: x.k }, unidad: 'combis', unidadMal: ['chicos', 'asientos'],
      fin: function () { return { num: x.q + 1, unidad: 'combis' }; } };
  });
  T('c5-mesas', 5, 'resto', function (az) {
    var x = conResto(az, 4, 8, 6, 40);
    return { partes: ['A la fiesta van ', { k: 'n' }, ' y en cada mesa se sientan ', { k: 'k' }, '. '], pregunta: ['¿Cuántas mesas hay que armar?'],
      datos: { n: d(x.n, x.n + ' invitados', 1), k: d(x.k, x.k + ' invitados', 1) },
      op: { ok: '¿Cuántas mesas hay que armar para que todos se sienten?', paso: '¿Cuántas mesas quedan completas?', clave: '¿Cuántos invitados se sientan en cada mesa?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'uno_mas', q: x.q, r: x.r, k: x.k }, unidad: 'mesas', unidadMal: ['invitados', 'sillas'],
      fin: function () { return { num: x.q + 1, unidad: 'mesas' }; } };
  });
  T('c5-cajas', 5, 'resto', function (az) {
    var x = conResto(az, 6, 9, 10, 60);
    return { partes: ['Hay que guardar ', { k: 'n' }, ' en cajas, y en cada caja entran ', { k: 'k' }, '. '], pregunta: ['¿Cuántas cajas se necesitan?'],
      datos: { n: d(x.n, x.n + ' libros', 1), k: d(x.k, x.k + ' libros', 1) },
      op: { ok: '¿Cuántas cajas se necesitan para guardar todos los libros?', paso: '¿Cuántas cajas se llenan?', clave: '¿Cuántos libros sobran?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'uno_mas', q: x.q, r: x.r, k: x.k }, unidad: 'cajas', unidadMal: ['libros', 'estantes'],
      fin: function () { return { num: x.q + 1, unidad: 'cajas' }; } };
  });

  /* ---------- C6: cuánto falta para completar ---------- */
  T('c6-album', 6, 'resto', function (az) {
    var x = conResto(az, 6, 10, 8, 30);
    return { partes: ['Pega ', { k: 'n' }, ' en un álbum que tiene ', { k: 'k' }, ' por página. '], pregunta: ['¿Cuántas figuritas le faltan para completar otra página?'],
      datos: { n: d(x.n, x.n + ' figuritas', 1), k: d(x.k, x.k + ' lugares', 1) },
      op: { ok: '¿Cuántas figuritas le faltan para completar la página que sigue?', paso: '¿Cuántas páginas llenó?', clave: '¿Cuántas figuritas le sobran?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'falta', q: x.q, r: x.r, k: x.k }, unidad: 'figuritas', unidadMal: ['páginas', 'álbumes'],
      fin: function () { return { num: x.k - x.r, unidad: 'figuritas' }; } };
  });
  T('c6-bombones', 6, 'resto', function (az) {
    var x = conResto(az, 6, 12, 5, 25);
    return { partes: ['Tiene ', { k: 'n' }, ' y arma cajas de ', { k: 'k' }, '. '], pregunta: ['¿Cuántos bombones le faltan para completar otra caja?'],
      datos: { n: d(x.n, x.n + ' bombones', 1), k: d(x.k, x.k + ' bombones', 1) },
      op: { ok: '¿Cuántos bombones le faltan para llenar una caja más?', paso: '¿Cuántas cajas llena?', clave: '¿Cuántos bombones le sobran?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'falta', q: x.q, r: x.r, k: x.k }, unidad: 'bombones', unidadMal: ['cajas', 'chicos'],
      fin: function () { return { num: x.k - x.r, unidad: 'bombones' }; } };
  });
  T('c6-equipos', 6, 'resto', function (az) {
    var x = conResto(az, 5, 11, 3, 15);
    return { partes: ['Hay ', { k: 'n' }, ' y se arman equipos de ', { k: 'k' }, '. '], pregunta: ['¿Cuántos alumnos faltan para completar un equipo más?'],
      datos: { n: d(x.n, x.n + ' alumnos', 1), k: d(x.k, x.k + ' alumnos', 1) },
      op: { ok: '¿Cuántos alumnos faltan para completar un equipo más?', paso: '¿Cuántos equipos completos se arman?', clave: '¿Cuántos alumnos sobran?' },
      planes: [[s(':', 'n', 'k')]], resto: { tipo: 'falta', q: x.q, r: x.r, k: x.k }, unidad: 'alumnos', unidadMal: ['equipos', 'clases'],
      fin: function () { return { num: x.k - x.r, unidad: 'alumnos' }; } };
  });

  /* ---------- C7: dos compras y el total (último paso) ---------- */
  function dosCompras(az, a1, p1m, a2, p2m, n1, n2, verbo, plural1, plural2, unid) {
    var a = az.entero(2, 8), b = az.entero(2, 8), p1 = az.entero(p1m[0], p1m[1]) * 50, p2 = az.entero(p2m[0], p2m[1]) * 50;
    return { partes: [verbo + ' ', { k: 'a' }, ' a ', { k: 'p1' }, ' y ', { k: 'b' }, ' a ', { k: 'p2' }, '. '], pregunta: ['¿Cuánto gastan en total?'],
      datos: { a: d(a, a + ' ' + plural1, 1), p1: d(p1, pesos(p1), 1), b: d(b, b + ' ' + plural2, 1), p2: d(p2, pesos(p2), 1) },
      op: { ok: '¿Cuánto gastan entre las dos compras?', paso: '¿Cuánto gastan en ' + plural1 + '?', clave: '¿Cuántas cosas compran en total?' },
      planes: [[s('×', 'a', 'p1'), s('×', 'b', 'p2'), s('+', 's1', 's2')]], resto: null, unidad: 'pesos', unidadMal: [plural1, 'chicos'], fin: fin1('pesos') };
  }
  T('c7-ropa', 7, 'ultimo_paso', function (az) { return dosCompras(az, 0, [10, 30], 0, [4, 16], 0, 0, 'Compran', 'remeras', 'gorras'); });
  T('c7-libreria', 7, 'ultimo_paso', function (az) { return dosCompras(az, 0, [3, 12], 0, [2, 8], 0, 0, 'En la librería compran', 'cuadernos', 'lapiceras'); });
  T('c7-kiosco', 7, 'ultimo_paso', function (az) { return dosCompras(az, 0, [4, 10], 0, [2, 9], 0, 0, 'En el kiosco compran', 'gaseosas', 'alfajores'); });

  /* ---------- C8: ¿alcanza? ¿sobra? ¿cuánto? ---------- */
  function alcanza(az, cosa, plural, unidadMal, pmin, pmax) {
    var p = az.entero(pmin, pmax) * 50, n = az.entero(3, 9), total = p * n, alc = az.prob(0.5), dif = az.entero(1, 8) * 50;
    var m = alc ? total + dif : Math.max(50, total - dif); dif = Math.abs(m - total);
    var plan1 = [s('×', 'n', 'p'), s('−', 'm', 's1')], plan2 = [s('×', 'n', 'p'), s('−', 's1', 'm')];
    return { partes: ['Con ', { k: 'm' }, ', ¿te alcanza para comprar ', { k: 'n' }, ' si cada ' + cosa + ' cuesta ', { k: 'p' }, '? '], pregunta: ['¿Te sobra o te falta? ¿Cuánto?'],
      datos: { m: d(m, pesos(m), 1), n: d(n, n + ' ' + plural, 1), p: d(p, pesos(p), 1) },
      op: { ok: '¿Alcanza la plata? ¿Cuánto sobra o cuánto falta?', paso: '¿Cuánto cuestan en total?', clave: '¿Cuántas ' + plural + ' se pueden comprar?' },
      planes: [plan1, plan2], resto: null, unidad: 'pesos', unidadMal: [unidadMal, 'chicos'],
      fin: function () { return { num: dif, unidad: 'pesos', frase: (alc ? 'Alcanza y sobran ' : 'No alcanza y faltan ') + pesos(dif),
        malas: [(alc ? 'No alcanza y faltan ' : 'Alcanza y sobran ') + pesos(dif), (alc ? 'Alcanza y sobran ' : 'No alcanza y faltan ') + pesos(total)] }; } };
  }
  T('c8-pelotas', 8, 'ninguna', function (az) { return alcanza(az, 'pelota', 'pelotas', 'pelotas', 6, 24); });
  T('c8-mochilas', 8, 'ninguna', function (az) { return alcanza(az, 'mochila', 'mochilas', 'mochilas', 10, 40); });
  T('c8-libros', 8, 'ninguna', function (az) { return alcanza(az, 'libro', 'libros', 'libros', 8, 30); });

  /* ---------- C9: estado inicial desconocido (palabra clave engañosa) ---------- */
  T('c9-figus', 9, 'palabra_clave', function (az) {
    var a = az.entero(8, 60), t = a + az.entero(10, 120);
    return { partes: ['Después de que le regalaron ', { k: 'a' }, ', Tomi tiene ', { k: 't' }, '. '], pregunta: ['¿Cuántas figuritas tenía antes?'],
      datos: { a: d(a, a + ' figuritas', 1), t: d(t, t + ' figuritas', 1) }, palabra: 'regalaron',
      op: { ok: '¿Cuántas figuritas tenía Tomi antes del regalo?', paso: '¿Cuántas figuritas le regalaron?', clave: '¿Cuántas figuritas tiene Tomi después del regalo?' },
      planes: [[s('−', 't', 'a')]], resto: null, unidad: 'figuritas', unidadMal: ['regalos', 'chicos'], fin: fin1('figuritas') };
  });
  T('c9-monedas', 9, 'palabra_clave', function (az) {
    var a = az.entero(5, 40), t = a + az.entero(8, 90);
    return { partes: ['Ana juntó ', { k: 'a' }, ' más y ahora tiene ', { k: 't' }, '. '], pregunta: ['¿Cuántas monedas tenía antes de juntar?'],
      datos: { a: d(a, a + ' monedas', 1), t: d(t, t + ' monedas', 1) }, palabra: 'más',
      op: { ok: '¿Cuántas monedas tenía Ana antes de juntar?', paso: '¿Cuántas monedas juntó Ana?', clave: '¿Cuántas monedas tiene Ana ahora, con las que juntó?' },
      planes: [[s('−', 't', 'a')]], resto: null, unidad: 'monedas', unidadMal: ['juntadas', 'chicos'], fin: fin1('monedas') };
  });
  T('c9-micro', 9, 'palabra_clave', function (az) {
    var a = az.entero(5, 25), t = a + az.entero(10, 40);
    return { partes: ['Al subir ', { k: 'a' }, ', el micro quedó con ', { k: 't' }, '. '], pregunta: ['¿Cuántos pasajeros había antes de que subieran?'],
      datos: { a: d(a, a + ' pasajeros', 1), t: d(t, t + ' pasajeros', 1) }, palabra: 'subir',
      op: { ok: '¿Cuántos pasajeros había antes de que subieran los nuevos?', paso: '¿Cuántos pasajeros subieron?', clave: '¿Cuántos pasajeros hay después de subir?' },
      planes: [[s('−', 't', 'a')]], resto: null, unidad: 'pasajeros', unidadMal: ['micros', 'paradas'], fin: fin1('pasajeros') };
  });

  /* ---------- C10: dato implícito ---------- */
  T('c10-club', 10, 'dato_implicito', function (az) {
    var p = az.entero(8, 40) * 100;
    return { partes: ['El club cobra ', { k: 'p' }, ' por mes. '], pregunta: ['¿Cuánto paga en ', { k: 'x' }, '?'],
      datos: { p: d(p, pesos(p), 1), x: d(6, 'medio año', 1, { imp: 1, expr: 'medio año', unidadImp: 'meses', etq: '6 (meses de medio año)' }) },
      op: { ok: '¿Cuánto paga el club en medio año?', paso: '¿Cuánto paga el club en un mes?', clave: '¿Cuántos meses tiene medio año?' },
      planes: [[s('×', 'p', 'x')]], resto: null, unidad: 'pesos', unidadMal: ['meses', 'años'], fin: fin1('pesos') };
  });
  T('c10-huevos', 10, 'dato_implicito', function (az) {
    var p = az.entero(4, 25) * 50;
    return { partes: ['Cada huevo cuesta ', { k: 'p' }, '. '], pregunta: ['¿Cuánto cuesta ', { k: 'x' }, '?'],
      datos: { p: d(p, pesos(p), 1), x: d(12, 'una docena de huevos', 1, { imp: 1, expr: 'una docena', unidadImp: 'huevos', etq: '12 (huevos de una docena)' }) },
      op: { ok: '¿Cuánto cuesta una docena de huevos?', paso: '¿Cuánto cuesta un huevo?', clave: '¿Cuántos huevos hay en una docena?' },
      planes: [[s('×', 'p', 'x')]], resto: null, unidad: 'pesos', unidadMal: ['huevos', 'docenas'], fin: fin1('pesos') };
  });
  T('c10-semana', 10, 'dato_implicito', function (az) {
    var p = az.entero(6, 40), N = nom(az);
    return { partes: [N + ' lee ', { k: 'p' }, ' por día. '], pregunta: ['¿Cuántas páginas lee en ', { k: 'x' }, '?'],
      datos: { p: d(p, p + ' páginas', 1), x: d(7, 'una semana', 1, { imp: 1, expr: 'una semana', unidadImp: 'días', etq: '7 (días de una semana)' }) },
      op: { ok: '¿Cuántas páginas lee ' + N + ' en una semana?', paso: '¿Cuántas páginas lee ' + N + ' en un día?', clave: '¿Cuántos días tiene una semana?' },
      planes: [[s('×', 'p', 'x')]], resto: null, unidad: 'páginas', unidadMal: ['días', 'semanas'], fin: fin1('páginas') };
  });

  /* ---------- C11: dato de más ---------- */
  T('c11-micro', 11, 'dato_de_mas', function (az) {
    var n = az.entero(12, 45), p = az.entero(6, 20) * 50, h = az.elegir(['las 8', 'las 10', 'las 14', 'las 18']);
    return { partes: ['Un micro sale a ', { k: 'h' }, ', lleva ', { k: 'n' }, ' y cada pasaje cuesta ', { k: 'p' }, '. '], pregunta: ['¿Cuánto recaudan?'],
      datos: { h: d(0, h, 0), n: d(n, n + ' pasajeros', 1), p: d(p, pesos(p), 1) },
      op: { ok: '¿Cuánto dinero recaudan con los pasajes?', paso: '¿Cuánto cuesta un pasaje?', clave: '¿A qué hora sale el micro?' },
      planes: [[s('×', 'n', 'p')]], resto: null, unidad: 'pesos', unidadMal: ['pasajeros', 'horas'], fin: fin1('pesos') };
  });
  T('c11-torneo', 11, 'dato_de_mas', function (az) {
    var n = az.entero(6, 24), p = az.entero(8, 30) * 100, anio = az.entero(2018, 2025);
    return { partes: ['El torneo empezó en ', { k: 'h' }, '. Se anotaron ', { k: 'n' }, ' y cada uno paga ', { k: 'p' }, ' de inscripción. '], pregunta: ['¿Cuánto se junta?'],
      datos: { h: d(0, 'el año ' + anio, 0), n: d(n, n + ' equipos', 1), p: d(p, pesos(p), 1) },
      op: { ok: '¿Cuánto dinero se junta con las inscripciones?', paso: '¿Cuánto paga cada equipo?', clave: '¿En qué año empezó el torneo?' },
      planes: [[s('×', 'n', 'p')]], resto: null, unidad: 'pesos', unidadMal: ['equipos', 'años'], fin: fin1('pesos') };
  });
  T('c11-figus', 11, 'dato_de_mas', function (az) {
    var N = nom(az), e = az.entero(8, 12), n = az.entero(3, 12), p = az.entero(4, 16) * 50;
    return { partes: [N + ' tiene ', { k: 'h' }, ' y compra ', { k: 'n' }, ' de figuritas a ', { k: 'p' }, ' cada uno. '], pregunta: ['¿Cuánto gasta?'],
      datos: { h: d(0, e + ' años', 0), n: d(n, n + ' paquetes', 1), p: d(p, pesos(p), 1) },
      op: { ok: '¿Cuánto gasta ' + N + ' en los paquetes?', paso: '¿Cuánto cuesta un paquete?', clave: '¿Cuántos años tiene ' + N + '?' },
      planes: [[s('×', 'n', 'p')]], resto: null, unidad: 'pesos', unidadMal: ['paquetes', 'años'], fin: fin1('pesos') };
  });

  var api = { plantillas: P, miles: miles, pesos: pesos };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_PROBLEMAS = api; }
})(typeof window !== 'undefined' ? window : this);
