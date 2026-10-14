/* Lectura de 1ro — parte pura: escenas (patitos y juguetes), preguntas con trampas, errores y ronda.
   window.LECT1 / require. Necesita REPASO1 (en node se pasa en armarRonda). Versión 1.0.0 (2026-10-14).
   Trampas para que lea y no adivine: con el mismo dibujo se pregunta primero algo y más adelante otra cosa
   (todos los patitos → los que tienen un ala levantada; juguetes rojos → juguetes azules). */
(function (root) {
  'use strict';
  var COLORES = {
    rojo: { m: 'ROJO', f: 'ROJA', mp: 'ROJOS', fp: 'ROJAS', hex: '#e63946' }, azul: { m: 'AZUL', f: 'AZUL', mp: 'AZULES', fp: 'AZULES', hex: '#1f6fe5' },
    verde: { m: 'VERDE', f: 'VERDE', mp: 'VERDES', fp: 'VERDES', hex: '#22a04b' }, amarillo: { m: 'AMARILLO', f: 'AMARILLA', mp: 'AMARILLOS', fp: 'AMARILLAS', hex: '#f6c40f' }
  };
  var TIPOS = { pelota: { s: 'PELOTA', p: 'PELOTAS', f: true }, auto: { s: 'AUTO', p: 'AUTOS', f: false }, cubo: { s: 'CUBO', p: 'CUBOS', f: false } };
  var MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  var DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  var NUM = ['CERO', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ'];
  var cuantos = function (esc, f) { return esc.objs.filter(f).length; };
  var adj = function (c, t, plural) { var x = COLORES[c]; return t && TIPOS[t].f ? (plural ? x.fp : x.f) : (plural ? x.mp : x.m); };

  /* ---------- escenas ---------- */
  function escenaPatos(nivel, az) {
    for (var k = 0; k < 200; k++) {
      var n = az.entero(nivel === 1 ? 3 : 4, nivel === 1 ? 6 : (nivel === 2 ? 8 : 9)), objs = [];
      for (var i = 0; i < n; i++) objs.push({ ala: az.prob(0.4) ? 'arriba' : 'abajo', gorro: az.prob(0.4), lugar: az.prob(0.5) ? 'agua' : 'pasto', dir: az.prob(0.5) ? 1 : -1 });
      var e = { tipo: 'patos', objs: objs }, ala = cuantos(e, function (o) { return o.ala === 'arriba'; }), go = cuantos(e, function (o) { return o.gorro; }), ag = cuantos(e, function (o) { return o.lugar === 'agua'; });
      if (ala >= 1 && ala < n && go >= 1 && go < n && ag >= 1 && ag < n && ag <= 6 && n - ag <= 6) return e;
    }
    return e;
  }
  function escenaJuguetes(nivel, az) {
    var cols = nivel === 1 ? ['rojo', 'azul', 'amarillo'] : ['rojo', 'azul', 'verde', 'amarillo'], tipos = Object.keys(TIPOS);
    for (var k = 0; k < 200; k++) {
      var n = az.entero(nivel === 1 ? 4 : 6, nivel === 1 ? 7 : (nivel === 2 ? 9 : 10)), objs = [];
      for (var i = 0; i < n; i++) objs.push({ tipo: az.elegir(tipos), color: az.elegir(cols) });
      var e = { tipo: 'juguetes', objs: objs };
      var cs = cols.filter(function (c) { return cuantos(e, function (o) { return o.color === c; }) > 0; }), ts = tipos.filter(function (t) { return cuantos(e, function (o) { return o.tipo === t; }) > 0; });
      if (cs.length >= 2 && ts.length >= 2) return e;
    }
    return e;
  }

  /* ---------- preguntas sobre un dibujo ---------- */
  // Cada filtro: [clave del parámetro, texto, función]. Sirven para la pregunta y para detectar "contó otra cosa".
  function filtrosPatos(nivel) {
    var f = [['total', '¿CUÁNTOS PATITOS HAY?', function () { return true; }],
      ['ala', '¿CUÁNTOS PATITOS TIENEN UN ALA LEVANTADA?', function (o) { return o.ala === 'arriba'; }],
      ['gorro', '¿CUÁNTOS PATITOS TIENEN GORRO?', function (o) { return o.gorro; }],
      ['agua', '¿CUÁNTOS PATITOS ESTÁN EN EL AGUA?', function (o) { return o.lugar === 'agua'; }],
      ['pasto', '¿CUÁNTOS PATITOS ESTÁN EN EL PASTO?', function (o) { return o.lugar === 'pasto'; }]];
    if (nivel >= 2) f.push(['singorro', '¿CUÁNTOS PATITOS NO TIENEN GORRO?', function (o) { return !o.gorro; }], ['alaabajo', '¿CUÁNTOS PATITOS TIENEN LAS ALAS ABAJO?', function (o) { return o.ala === 'abajo'; }]);
    if (nivel >= 3) f.push(['gorroagua', '¿CUÁNTOS PATITOS CON GORRO ESTÁN EN EL AGUA?', function (o) { return o.gorro && o.lugar === 'agua'; }]);
    return f;
  }
  function filtrosJuguetes(esc, nivel) {
    var f = [['total', '¿CUÁNTOS JUGUETES HAY?', function () { return true; }]];
    Object.keys(COLORES).forEach(function (c) { f.push(['color:' + c, '¿CUÁNTOS JUGUETES ' + COLORES[c].mp + ' HAY?', function (o) { return o.color === c; }]); });
    Object.keys(TIPOS).forEach(function (t) { f.push(['tipo:' + t, '¿' + (TIPOS[t].f ? 'CUÁNTAS ' : 'CUÁNTOS ') + TIPOS[t].p + ' HAY?', function (o) { return o.tipo === t; }]); });
    if (nivel >= 2) Object.keys(TIPOS).forEach(function (t) { Object.keys(COLORES).forEach(function (c) {
      f.push(['tc:' + t + ':' + c, '¿' + (TIPOS[t].f ? 'CUÁNTAS ' : 'CUÁNTOS ') + TIPOS[t].p + ' ' + adj(c, t, true) + ' HAY?', function (o) { return o.tipo === t && o.color === c; }]); }); });
    return f;
  }
  // Plantillas (la clave es lo que se repasa). armar devuelve la pregunta o null si con ese dibujo no se puede.
  var PLANTILLAS = {
    'patos:total': { escena: 'patos', nivel: 1, armar: function (e, nv) { return contar(e, nv, 'total'); } },
    'patos:ala': { escena: 'patos', nivel: 1, armar: function (e, nv) { return contar(e, nv, 'ala'); } },
    'patos:gorro': { escena: 'patos', nivel: 1, armar: function (e, nv, az) { return contar(e, nv, nv >= 2 && az.prob(0.4) ? 'singorro' : 'gorro'); } },
    'patos:lugar': { escena: 'patos', nivel: 1, armar: function (e, nv, az) { return contar(e, nv, az.prob(0.5) ? 'agua' : 'pasto'); } },
    'patos:combinada': { escena: 'patos', nivel: 3, armar: function (e, nv) { return contar(e, nv, 'gorroagua'); } },
    'patos:toca': { escena: 'patos', nivel: 1, armar: function (e, nv, az) {
      var ops = [['gorro', 'TOCÁ UN PATITO QUE TENGA GORRO.', function (o) { return o.gorro; }], ['ala', 'TOCÁ UN PATITO CON UN ALA LEVANTADA.', function (o) { return o.ala === 'arriba'; }],
        ['agua', 'TOCÁ UN PATITO QUE ESTÉ EN EL AGUA.', function (o) { return o.lugar === 'agua'; }], ['singorro', 'TOCÁ UN PATITO SIN GORRO.', function (o) { return !o.gorro; }]].filter(function (x) { return cuantos(e, x[2]) > 0; });
      var x = az.elegir(ops); return { tipo: 'toca', texto: x[1], param: x[0], vale: x[2] }; } },
    'patos:sino': { escena: 'patos', nivel: 2, armar: function (e, nv, az) {
      var ops = [['gorroagua', '¿HAY ALGÚN PATITO CON GORRO EN EL AGUA?', function (o) { return o.gorro && o.lugar === 'agua'; }], ['alapasto', '¿HAY ALGÚN PATITO CON UN ALA LEVANTADA EN EL PASTO?', function (o) { return o.ala === 'arriba' && o.lugar === 'pasto'; }],
        ['gorroala', '¿HAY ALGÚN PATITO CON GORRO Y UN ALA LEVANTADA?', function (o) { return o.gorro && o.ala === 'arriba'; }]];
      var x = az.elegir(ops); return { tipo: 'sino', texto: x[1], param: x[0], esperado: cuantos(e, x[2]) > 0, vale: x[2] }; } },
    'jug:total': { escena: 'juguetes', nivel: 1, armar: function (e, nv) { return contar(e, nv, 'total'); } },
    'jug:color': { escena: 'juguetes', nivel: 1, armar: function (e, nv, az, usados) {
      var cs = Object.keys(COLORES).filter(function (c) { return usados.indexOf('color:' + c) < 0 && cuantos(e, function (o) { return o.color === c; }) > 0; });
      if (!cs.length) return null; return contar(e, nv, 'color:' + az.elegir(cs)); } },
    'jug:tipo': { escena: 'juguetes', nivel: 1, armar: function (e, nv, az, usados) {
      var ts = Object.keys(TIPOS).filter(function (t) { return usados.indexOf('tipo:' + t) < 0; }); if (!ts.length) return null; return contar(e, nv, 'tipo:' + az.elegir(ts)); } },
    'jug:tipocolor': { escena: 'juguetes', nivel: 2, armar: function (e, nv, az, usados) {
      var ps = []; e.objs.forEach(function (o) { var k = 'tc:' + o.tipo + ':' + o.color; if (ps.indexOf(k) < 0 && usados.indexOf(k) < 0) ps.push(k); });
      if (!ps.length) return null; return contar(e, nv, az.elegir(ps)); } },
    'jug:toca': { escena: 'juguetes', nivel: 1, armar: function (e, nv, az) {
      var o = az.elegir(e.objs), t = TIPOS[o.tipo];
      if (nv === 1 && az.prob(0.5)) return { tipo: 'toca', texto: 'TOCÁ ' + (t.f ? 'UNA ' : 'UN ') + t.s + '.', param: 'tipo:' + o.tipo, tipoObj: o.tipo, vale: function (x) { return x.tipo === o.tipo; } };
      return { tipo: 'toca', texto: 'TOCÁ ' + (t.f ? 'UNA ' : 'UN ') + t.s + ' ' + adj(o.color, o.tipo) + '.', param: 'tc:' + o.tipo + ':' + o.color, tipoObj: o.tipo, colorObj: o.color, vale: function (x) { return x.tipo === o.tipo && x.color === o.color; } }; } },
    'jug:sino': { escena: 'juguetes', nivel: 2, armar: function (e, nv, az) {
      var t = az.elegir(Object.keys(TIPOS)), c = az.elegir(Object.keys(COLORES));
      if (az.prob(0.5)) { var o = az.elegir(e.objs); t = o.tipo; c = o.color; }
      var f = function (x) { return x.tipo === t && x.color === c; };
      return { tipo: 'sino', texto: '¿HAY ' + (TIPOS[t].f ? 'ALGUNA ' : 'ALGÚN ') + TIPOS[t].s + ' ' + adj(c, t) + '?', param: 'tc:' + t + ':' + c, esperado: cuantos(e, f) > 0, vale: f }; } }
  };
  function contar(e, nivel, clave) {
    var fs = e.tipo === 'patos' ? filtrosPatos(Math.max(nivel, 3)) : filtrosJuguetes(e, Math.max(nivel, 2));
    var f = fs.filter(function (x) { return x[0] === clave; })[0];
    if (!f) return null;
    var total = e.objs.length, esp = cuantos(e, f[2]);
    var otras = []; fs.forEach(function (x) { if (x[0] !== clave && x[0] !== 'total') { var v = cuantos(e, x[2]); if (otras.indexOf(v) < 0) otras.push(v); } });
    return { tipo: 'contar', texto: f[1], param: clave, esperado: esp, total: total, otras: otras, vale: f[2] };
  }

  /* ---------- preguntas para escribir ---------- */
  // grupo: preguntas parecidas (para saber si contestó la de al lado: GUAU en vez de MIAU).
  var ESCRIBIR = {
    'escribir:mes': { nivel: 1, grupo: 'fecha', texto: '¿EN QUÉ MES ESTAMOS?', validos: function (c) { return [MESES[c.fecha.getMonth()]].concat(c.fecha.getMonth() === 8 ? ['SETIEMBRE'] : []); } },
    'escribir:dia': { nivel: 1, grupo: 'fecha', texto: '¿QUÉ DÍA ES HOY?', validos: function (c) { return [DIAS[c.fecha.getDay()]]; } },
    'escribir:manana': { nivel: 2, grupo: 'fecha', texto: '¿QUÉ DÍA VA A SER MAÑANA?', validos: function (c) { return [DIAS[(c.fecha.getDay() + 1) % 7]]; } },
    'escribir:nombre': { nivel: 1, grupo: 'nombre', texto: '¿CÓMO TE LLAMÁS?', validos: function (c) { return [c.nombre.toUpperCase()]; } },
    'escribir:miau': { nivel: 1, grupo: 'animal', texto: '¿QUÉ ANIMAL HACE MIAU?', validos: function () { return ['GATO', 'GATITO', 'GATA']; } },
    'escribir:guau': { nivel: 1, grupo: 'animal', texto: '¿QUÉ ANIMAL HACE GUAU?', validos: function () { return ['PERRO', 'PERRITO', 'PERRA']; } },
    'escribir:muu': { nivel: 1, grupo: 'animal', texto: '¿QUÉ ANIMAL HACE MUU?', validos: function () { return ['VACA', 'VAQUITA', 'TORO']; } },
    'escribir:cuac': { nivel: 1, grupo: 'animal', texto: '¿QUÉ ANIMAL HACE CUAC?', validos: function () { return ['PATO', 'PATITO']; } },
    'escribir:cielo': { nivel: 1, grupo: 'color', texto: '¿DE QUÉ COLOR ES EL CIELO DE DÍA?', validos: function () { return ['CELESTE', 'AZUL']; } },
    'escribir:pasto': { nivel: 1, grupo: 'color', texto: '¿DE QUÉ COLOR ES EL PASTO?', validos: function () { return ['VERDE']; } },
    'escribir:nieve': { nivel: 1, grupo: 'color', texto: '¿DE QUÉ COLOR ES LA NIEVE?', validos: function () { return ['BLANCA', 'BLANCO']; } },
    'escribir:frutilla': { nivel: 1, grupo: 'color', texto: '¿DE QUÉ COLOR ES UNA FRUTILLA?', validos: function () { return ['ROJA', 'ROJO']; } },
    'escribir:noche': { nivel: 1, grupo: 'cielo', texto: '¿QUÉ SALE DE NOCHE: EL SOL O LA LUNA?', validos: function () { return ['LUNA', 'LA LUNA']; } },
    'escribir:dia_sol': { nivel: 1, grupo: 'cielo', texto: '¿QUÉ SALE DE DÍA: EL SOL O LA LUNA?', validos: function () { return ['SOL', 'EL SOL']; } },
    'escribir:patas': { nivel: 2, grupo: 'numero', texto: '¿CUÁNTAS PATAS TIENE UN PERRO?', validos: function () { return ['CUATRO', '4']; } },
    'escribir:manos': { nivel: 1, grupo: 'numero', texto: '¿CUÁNTAS MANOS TENÉS?', validos: function () { return ['DOS', '2']; } },
    'escribir:gallina': { nivel: 2, grupo: 'numero', texto: '¿CUÁNTAS PATAS TIENE UNA GALLINA?', validos: function () { return ['DOS', '2']; } }
  };

  /* ---------- errores ---------- */
  // Conteo: el más específico primero. anterior: lo que contestó la pregunta anterior con el mismo dibujo.
  function errorConteo(p, resp, anterior) {
    if (resp === p.esperado) return null;
    if (resp === p.total) return 'CUENTA_TODOS';
    if (anterior !== undefined && anterior !== null && resp === anterior) return 'REPITE_ANTERIOR';
    if (p.otras.indexOf(resp) >= 0) return 'LEE_OTRO';
    if (Math.abs(resp - p.esperado) === 1) return 'CUENTA_POR_UNO';
    return 'CUENTA_MAL';
  }
  function errorToca(p, obj) {
    if (p.vale(obj)) return null;
    if (p.tipoObj && p.colorObj) return obj.tipo === p.tipoObj ? 'NO_LEE_COLOR' : (obj.color === p.colorObj ? 'NO_LEE_OBJETO' : 'TOCA_MAL');
    if (p.tipoObj) return 'NO_LEE_OBJETO';
    return 'NO_LEE_ATRIBUTO';
  }
  /* Respuesta escrita: lo que importa es si entendió la pregunta. Si la palabra está bien pensada pero mal escrita, cuenta
     como bien (comprensión) y se anota el error de escritura. L: LENGUA1. */
  function corregirEscrita(L, clave, resp, c) {
    var q = ESCRIBIR[clave], val = q.validos(c), m = L.elegirMejor(val, resp);
    var limite = Math.max(1, Math.floor(L.limpiar(m.forma).length / 4));
    if (m.ok) return { ok: true, forma: m.forma, ortografia: [] };
    if (m.primario !== 'OTRA_PALABRA' && m.primario !== 'VACIA' && m.dist <= limite) return { ok: true, forma: m.forma, ortografia: m.codigos };
    var r = L.limpiar(resp), deOtra = Object.keys(ESCRIBIR).some(function (k) {
      return k !== clave && ESCRIBIR[k].grupo === q.grupo && ESCRIBIR[k].validos(c).some(function (v) { return L.limpiar(v) === r; }); });
    return { ok: false, forma: m.forma, error: deOtra ? 'NO_LEE_PREGUNTA' : 'NO_COMPRENDE', ortografia: [] };
  }
  var ERRORES = {
    CUENTA_TODOS: 'Contó todos: no leyó la condición de la pregunta', REPITE_ANTERIOR: 'Repitió la respuesta anterior del mismo dibujo (no leyó la pregunta nueva)',
    LEE_OTRO: 'Contó otra cosa (otro color, otro juguete u otra condición)', CUENTA_POR_UNO: 'Contó uno de más o de menos', CUENTA_MAL: 'Contó mal',
    NO_LEE_COLOR: 'Tocó el juguete pedido pero de otro color', NO_LEE_OBJETO: 'Tocó el color pedido pero otro juguete', NO_LEE_ATRIBUTO: 'Tocó un patito que no cumple lo pedido',
    TOCA_MAL: 'Tocó otra cosa', SI_NO_MAL: 'Contestó mal sí o no', NO_LEE_PREGUNTA: 'Contestó una pregunta parecida (GUAU en vez de MIAU)', NO_COMPRENDE: 'La respuesta no tiene que ver con la pregunta'
  };

  /* ---------- ronda ----------
     8 preguntas: 2 dibujos (patitos y juguetes) con 3 preguntas cada uno (2 en el nivel 1) y el resto para escribir.
     Las del mismo dibujo se reparten a lo largo de la ronda, para que vuelva a leer. Pesos del repaso (REPASO1). */
  function armarRonda(nivel, az, rep, RP, c) {
    var porEsc = nivel === 1 ? 2 : 3, total = 8, dibujos = [escenaPatos(nivel, az), escenaJuguetes(nivel, az)];
    if (az.prob(0.5)) dibujos.reverse();
    var grupos = dibujos.map(function (e, d) {
      var claves = Object.keys(PLANTILLAS).filter(function (k) { return PLANTILLAS[k].escena === e.tipo && PLANTILLAS[k].nivel <= nivel; });
      var elegidas = RP.elegir(rep, claves, porEsc, az, { minRepaso: 1 });
      // la trampa: si hay "contar todos", va primero; y a veces se pregunta dos veces por color con el mismo dibujo
      elegidas.sort(function (a, b) { return (b.slice(-6) === ':total') - (a.slice(-6) === ':total'); });
      if (e.tipo === 'juguetes' && elegidas.indexOf('jug:color') >= 0 && az.prob(0.6)) { var i = elegidas.length - 1; if (elegidas[i] !== 'jug:color') elegidas[i] = 'jug:color'; else elegidas.push('jug:color'); }
      var usados = [], out = [];
      elegidas.forEach(function (k) { var p = PLANTILLAS[k].armar(e, nivel, az, usados); if (p) { usados.push(p.param); p.clave = k; p.dibujo = d; out.push(p); } });
      return out;
    });
    var nEsc = total - grupos[0].length - grupos[1].length;
    var clavesE = Object.keys(ESCRIBIR).filter(function (k) { return ESCRIBIR[k].nivel <= nivel; });
    var escr = RP.elegir(rep, clavesE, nEsc, az, { minRepaso: 1 }).map(function (k) { return { tipo: 'escribir', clave: k, texto: ESCRIBIR[k].texto, validos: ESCRIBIR[k].validos(c) }; });
    var orden = [], a = grupos[0], b = grupos[1];
    for (var r = 0; orden.length < total && (a.length || b.length || escr.length); r++) {
      if (a.length) orden.push(a.shift());
      if (b.length) orden.push(b.shift());
      if (escr.length) orden.push(escr.shift());
    }
    return { dibujos: dibujos, preguntas: orden };
  }

  var api = { VERSION: '1.0.0', COLORES: COLORES, TIPOS: TIPOS, MESES: MESES, DIAS: DIAS, NUM: NUM, PLANTILLAS: PLANTILLAS, ESCRIBIR: ESCRIBIR, ERRORES: ERRORES,
    escenaPatos: escenaPatos, escenaJuguetes: escenaJuguetes, contar: contar, errorConteo: errorConteo, errorToca: errorToca, corregirEscrita: corregirEscrita, armarRonda: armarRonda };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LECT1 = api;
})(typeof window !== 'undefined' ? window : this);
