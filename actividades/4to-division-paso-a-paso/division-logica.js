/* División paso a paso: motor de pasos y validadores (lógica pura, sin DOM).
   El estado se reconstruye siempre a partir de la lista de respuestas aceptadas (resp), así que
   "volver al factor" es simplemente cortar esa lista. Patrón UMD sin módulos: window.REF4_DIVMOTOR. */
(function (root) {
  'use strict';
  var DIV = (typeof module !== 'undefined' && module.exports) ? require('../_comun-4to/division-lib.js') : root.REF4_DIV;
  var FIN = {}; // centinela para cortar la reconstrucción en el paso actual

  var PISTAS = {
    PARCIAL_CHICO: '{c} es menor que {d}: no alcanza. Tomá una cifra más.',
    PARCIAL_GRANDE: 'Con {c} ya alcanza para {d}. Tomá solo esa cifra.',
    FACTOR_GRANDE: '{d} × {q} = {p}, y eso es más que {n}. Se pasa: probá con uno menos.',
    RESTO_MAYOR: 'Te quedaron {r}, y {r} es más que {d}. ¡Entra una vez más! Volvé a elegir.',
    BIEN_VISTO: '¡Bien visto! {r} es más que {d}: entra una vez más. Volvé a elegir.',
    REGISTRO_COCIENTE: 'En el casillero va por cuánto multiplicaste, no el resultado. ¿{d} por cuánto da {p}?',
    OTRO_CASITA: 'En el casillero va cuántas veces entra {d}: el número que elegiste.',
    TABLA_PRODUCTO: 'Mirá la tabla: {d} × {q}.',
    TABLA: 'Armalo desde el anterior: {d} × {q1} = {prev}, y le sumás {d}.',
    RESTA: 'Revisá la resta: {n} − {p}.',
    BAJAR: 'Bajá la cifra que sigue, la que está justo después: el {x}.',
    PASO_EXTRA: 'Antes de volver a restar, bajá la cifra que sigue.',
    CERO_OMITIDO: '{n} es menor que {d}: entra 0 veces. Anotá 0 en el casillero y restá 0.',
    ESTIMACION: '{d} × 100 = {a}. ¿{dividendo} es más o menos que {a}? ¿Y que {d} × 10?',
    VERIFICACION: 'Fijate: {q} × {d} + {r} tiene que darte {dividendo}.',
    CONTROL: 'Compará {r} con {d}: {r} es menor, así que ya no entra otra vez.',
    OTRO: 'Revisalo con calma y probá de nuevo.'
  };
  function fmt(t, c) { return t.replace(/\{(\w+)\}/g, function (m, k) { return c[k] !== undefined ? c[k] : m; }); }

  function crear(cfg) {
    var d = cfg.divisor, nivel = cfg.nivel, sim = DIV.simular(cfg.dividendo, d);
    var M = { d: d, dividendo: cfg.dividendo, nivel: nivel, sim: sim, dif: nivel === 4, resp: [], intentos: {}, revisado: false, tabla0: [], blancos: [] };
    // tabla del divisor: qué filas vienen dadas y cuáles hay que completar
    var blancos = [];
    if (nivel >= 3) for (var q = 2; q <= 9; q++) blancos.push(q);
    else if (nivel === 2) {
      var usados = sim.vueltas.map(function (v) { return v.factor; }).filter(function (f) { return f > 0; });
      var elegidos = [], u68 = usados.filter(function (f) { return f >= 6 && f <= 8; }), uAny = usados.filter(function (f) { return f >= 2; });
      var pre = (u68.length ? u68 : uAny);
      if (pre.length) elegidos.push(pre[0]);
      var resto = (cfg.az ? cfg.az.mezclar([2, 3, 4, 5, 6, 7, 8, 9]) : [2, 3, 4, 5, 6, 7, 8, 9]);
      for (var i = 0; i < resto.length && elegidos.length < 3; i++) if (elegidos.indexOf(resto[i]) < 0) elegidos.push(resto[i]);
      blancos = elegidos.sort(function (a, b) { return a - b; });
    }
    M.blancos = blancos;
    for (var r = 1; r <= 9; r++) M.tabla0.push({ q: r, p: d * r, dada: blancos.indexOf(r) < 0 });
    return M;
  }

  /* ---------- reconstrucción del estado ---------- */
  function derivar(M) {
    var R = M.resp, i = 0, d = M.d, sim = M.sim, nv = sim.vueltas.length;
    var out = { tabla: M.tabla0.map(function (t) { return { q: t.q, p: t.p, dada: t.dada, hecho: t.dada }; }),
                estim: null, parcial: null, vueltas: [], actual: null, terminada: false, verif: null, finTocado: false };
    function tomar(tipo, vuelta, extra) {
      if (i < R.length) return R[i++];
      out.actual = { tipo: tipo, vuelta: vuelta }; for (var k in extra) out.actual[k] = extra[k];
      throw FIN;
    }
    try {
      M.blancos.forEach(function (q) { var r = tomar('tabla', null, { q: q }); out.tabla[q - 1].p = r.valor; out.tabla[q - 1].hecho = true; });
      if (M.nivel >= 3) out.estim = tomar('estimacion', null).valor;
      out.parcial = tomar('parcial', null).valor;
      for (var v = 0; v < nv; v++) {
        var T = sim.vueltas[v];
        var V = { i: v, parcial: T.parcial, parcialTxt: T.parcialTxt, colInicio: T.colInicio, colFin: T.colFin,
                  factor: null, casita: null, producto: null, resta: null, bajada: null, cod: null, final: false };
        out.vueltas.push(V);
        var rf = tomar('factor', v, { V: V }); V.factor = rf.valor; V.cod = rf.cod || null;
        V.casita = tomar('casita', v, { V: V }).valor;
        V.producto = tomar('producto', v, { V: V }).valor;
        V.resta = tomar('resta', v, { V: V }).valor;
        if (M.nivel <= 2) tomar('control', v, { V: V });
        if (v < nv - 1) { tomar('bajar', v, { V: V }); V.bajada = T.bajada; }
        else { tomar('fin', v, { V: V }); V.final = true; out.finTocado = true; }
      }
      if (M.nivel >= 3) out.verif = tomar('verificacion', null).valor;
      if (M.dif && !M.revisado) { out.actual = { tipo: 'revision', vuelta: null }; throw FIN; }
      out.terminada = true;
    } catch (e) { if (e !== FIN) throw e; }
    return out;
  }

  function baseFactor(M, V, T) { return M.dif ? T.factor : V.factor; }       // factor sobre el que se espera casita/producto/resta
  function esperadoDe(M, out, a) {
    var T = a.vuelta !== null ? M.sim.vueltas[a.vuelta] : null, V = a.V;
    switch (a.tipo) {
      case 'tabla': return M.d * a.q;
      case 'estimacion': return DIV.nCifras(M.sim.cociente);
      case 'parcial': return M.sim.vueltas[0].parcialTxt.length;
      case 'factor': return T.factor;
      case 'casita': return baseFactor(M, V, T);
      case 'producto': return M.d * baseFactor(M, V, T);
      case 'resta': return M.dif ? T.resta : V.parcial - V.producto;
      case 'control': return (V.resta < M.d) ? 'si' : 'no';
      case 'bajar': return T.colFin + 1;
      case 'fin': return 'terminar';
      case 'verificacion': return M.dividendo;
      default: return '';
    }
  }

  function ctxPista(M, out, a, valor) {
    var d = M.d, c = { d: d, dividendo: M.dividendo, a: d * 100 }, T = a.vuelta !== null ? M.sim.vueltas[a.vuelta] : null, V = a.V;
    c.c = String(M.dividendo)[0];
    if (V) { c.n = V.parcial; var bf = baseFactor(M, V, T); c.q = bf; c.p = d * bf; c.r = V.parcial - d * bf; c.x = T.bajada; }
    if (a.tipo === 'tabla') { c.q = a.q; c.q1 = a.q - 1; c.prev = d * (a.q - 1); }
    if (a.tipo === 'verificacion') { c.q = M.sim.cociente; c.r = M.sim.resto; }
    return c;
  }

  // Clasifica una respuesta incorrecta del paso y devuelve {codigo, pista}.
  function clasificar(M, out, a, valor) {
    var d = M.d, c = ctxPista(M, out, a, valor), T = a.vuelta !== null ? M.sim.vueltas[a.vuelta] : null, V = a.V;
    switch (a.tipo) {
      case 'tabla': return { codigo: 'TABLA', pista: fmt(PISTAS.TABLA, c) };
      case 'estimacion': return { codigo: 'ESTIMACION', pista: fmt(PISTAS.ESTIMACION, c) };
      case 'verificacion': return { codigo: 'VERIFICACION', pista: fmt(PISTAS.VERIFICACION, c) };
      case 'parcial':
        return valor < M.sim.vueltas[0].parcialTxt.length ? { codigo: 'PARCIAL_CHICO', pista: fmt(PISTAS.PARCIAL_CHICO, c) }
                                                         : { codigo: 'OTRO', pista: fmt(PISTAS.PARCIAL_GRANDE, c) };
      case 'factor':
        if (T.factor === 0 && valor > 0) return { codigo: 'CERO_OMITIDO', pista: fmt(PISTAS.CERO_OMITIDO, { n: V.parcial, d: d }) };
        if (valor < T.factor) return { codigo: 'FACTOR_CHICO', pista: fmt(PISTAS.RESTO_MAYOR, { r: V.parcial - d * valor, d: d }) };
        return { codigo: 'FACTOR_GRANDE', pista: fmt(PISTAS.FACTOR_GRANDE, { d: d, q: valor, p: d * valor, n: V.parcial }) };
      case 'casita': {
        var p = d * c.q;
        if (valor === p && p !== c.q) return { codigo: 'REGISTRO_COCIENTE', pista: fmt(PISTAS.REGISTRO_COCIENTE, c) };
        return { codigo: 'OTRO', pista: fmt(PISTAS.OTRO_CASITA, c) };
      }
      case 'producto': return { codigo: 'TABLA', pista: fmt(PISTAS.TABLA_PRODUCTO, c) };
      case 'resta': return { codigo: 'RESTA', pista: fmt(PISTAS.RESTA, c) };
      case 'control': return { codigo: valor === 'si' ? 'RESTO_MAYOR' : 'CONTROL', pista: fmt(valor === 'si' ? PISTAS.RESTO_MAYOR : PISTAS.CONTROL, c) };
      case 'bajar':
        if (typeof valor === 'object' && valor.num !== undefined) return { codigo: 'PASO_EXTRA', pista: fmt(PISTAS.PASO_EXTRA, c) };
        return { codigo: 'BAJAR', pista: fmt(PISTAS.BAJAR, c) };
      default: return { codigo: 'OTRO', pista: PISTAS.OTRO };
    }
  }

  function esperadoTexto(M, a) { var e = esperadoDe(M, null, a); return String(e); }
  function hechoDe(M, a) { // hecho (d × q) que se practica en este paso, si corresponde
    if (a.tipo === 'tabla') return M.d + 'x' + a.q;
    var bf = a.V ? baseFactor(M, a.V, M.sim.vueltas[a.vuelta]) : null;
    if ((a.tipo === 'factor' || a.tipo === 'producto') && bf > 0) return M.d + 'x' + (a.tipo === 'factor' ? M.sim.vueltas[a.vuelta].factor : bf);
    return null;
  }
  function eventoPaso(M, a, intento, valor, esperado, ok, codigo) {
    var v = (valor !== null && typeof valor === 'object') ? (valor.col !== undefined ? 'col' + valor.col : 'num' + valor.num) : String(valor);
    var item = { dividendo: M.dividendo, divisor: M.d }, h = hechoDe(M, a); if (h) item.hecho = h;
    return { tipo: 'paso', paso: a.tipo, vuelta: a.vuelta, intento: intento, item: item, esperado: String(esperado), respuesta: v, ok: ok, error: codigo || null };
  }
  function cortarVuelta(M, v) { // vuelve al factor de la vuelta v
    for (var k = 0; k < M.resp.length; k++) if (M.resp[k].tipo === 'factor' && M.resp[k].vuelta === v) { M.resp.length = k; return; }
  }

  /* responder(M, valor) → {ok, silencioso, codigo, pista, rebobinado, eventos:[...], terminada}
     valor: número | 'si'/'no' | {col} (tocar una cifra) | {num} (tecleó en el paso de bajar) | 'terminar'. */
  function responder(M, valor) {
    var out = derivar(M), a = out.actual;
    if (!a || a.tipo === 'revision') return { ok: false, eventos: [], pista: null };
    var key = a.tipo + (a.vuelta === null ? '' : '@' + a.vuelta) + (a.tipo === 'tabla' ? '@' + a.q : '');
    var intento = (M.intentos[key] || 0) + 1; M.intentos[key] = intento;
    var esp = esperadoDe(M, out, a), V = a.V, d = M.d;
    var ok, cod = null, pista = null, eventos = [], rebobinado = false, extra = null;
    var normal = function (okx, codx) { return eventoPaso(M, a, intento, valor, esp, okx, codx); };

    // 1) ¿es correcta la respuesta tal cual?
    if (a.tipo === 'bajar') ok = (typeof valor === 'object' && valor.col === esp);
    else if (a.tipo === 'control') ok = (valor === esp);
    else if (a.tipo === 'fin') ok = true;
    else ok = (valor === esp);
    var info = ok ? null : clasificar(M, out, a, valor);
    if (info) { cod = info.codigo; pista = info.pista; }

    // 2) modo carpeta (nivel 4): se acepta todo y se corrige al final
    if (M.dif) {
      M.resp.push({ tipo: a.tipo, vuelta: a.vuelta, q: a.q, valor: valor, ok: ok, codigo: cod, pista: pista, esp: esp });
      return { ok: true, silencioso: true, eventos: [normal(ok, cod)], terminada: false };
    }

    // 3) factor: en los niveles 2 y 3 no se corrige al instante; se descubre más adelante
    if (a.tipo === 'factor' && !ok && M.nivel >= 2) {
      M.resp.push({ tipo: 'factor', vuelta: a.vuelta, valor: valor, cod: cod, pista: pista });
      return { ok: true, silencioso: true, eventos: [], terminada: false, pendiente: cod };
    }

    // 4) pasos que detectan un factor equivocado (casos con rebobinado)
    var factorEv = function (codx) { return eventoPaso(M, { tipo: 'factor', vuelta: a.vuelta, V: V }, (M.intentos['factor@' + a.vuelta] || 1), V.factor, M.sim.vueltas[a.vuelta].factor, false, codx); };
    if (a.tipo === 'producto' && ok && V.factor !== M.sim.vueltas[a.vuelta].factor && esp > V.parcial) {
      var cf = V.cod || 'FACTOR_GRANDE';
      var texto = cf === 'CERO_OMITIDO' ? fmt(PISTAS.CERO_OMITIDO, { n: V.parcial, d: d }) : fmt(PISTAS.FACTOR_GRANDE, { d: d, q: V.factor, p: esp, n: V.parcial });
      eventos.push(normal(true, null), factorEv(cf)); cortarVuelta(M, a.vuelta);
      return { ok: false, rebobinado: true, codigo: cf, pista: texto, eventos: eventos, terminada: false };
    }
    var rest = (a.tipo === 'control' || a.tipo === 'bajar' || a.tipo === 'fin') ? V.resta : null;
    var restoGrande = rest !== null && rest >= d;
    if (a.tipo === 'control') {
      var lt = !restoGrande;
      if (valor === 'si' && lt) { M.resp.push({ tipo: 'control', vuelta: a.vuelta, valor: valor }); return { ok: true, eventos: [normal(true, null)], terminada: false }; }
      if (valor === 'no' && lt) return { ok: false, codigo: 'CONTROL', pista: info.pista, eventos: [normal(false, 'CONTROL')], terminada: false };
      // el resto es mayor o igual que el divisor: había que elegir un factor más grande
      var okc = (valor === 'no');
      eventos.push(normal(okc, okc ? null : 'RESTO_MAYOR'), factorEv('FACTOR_CHICO')); cortarVuelta(M, a.vuelta);
      return { ok: okc, rebobinado: true, codigo: okc ? null : 'RESTO_MAYOR',
               pista: fmt(okc ? PISTAS.BIEN_VISTO : PISTAS.RESTO_MAYOR, { r: rest, d: d }), eventos: eventos, terminada: false };
    }
    if ((a.tipo === 'bajar' || a.tipo === 'fin') && M.nivel === 3 && restoGrande) {
      eventos.push({ tipo: 'paso', paso: 'control', vuelta: a.vuelta, intento: 1, item: { dividendo: M.dividendo, divisor: d }, esperado: 'resto menor que el divisor', respuesta: a.tipo, ok: false, error: 'RESTO_MAYOR' }, factorEv('FACTOR_CHICO'));
      cortarVuelta(M, a.vuelta);
      return { ok: false, rebobinado: true, codigo: 'RESTO_MAYOR', pista: fmt(PISTAS.RESTO_MAYOR, { r: rest, d: d }), eventos: eventos, terminada: false };
    }

    // 5) respuesta común
    if (!ok) return { ok: false, codigo: cod, pista: pista, eventos: [normal(false, cod)], terminada: false, resaltar: (a.tipo === 'producto' && M.nivel <= 2) ? V.factor : null };
    M.resp.push({ tipo: a.tipo, vuelta: a.vuelta, q: a.q, valor: valor });
    return { ok: true, eventos: [normal(true, null)], terminada: derivar(M).terminada };
  }

  /* ---------- revisión del nivel 4 ----------
     revisar() marca el primer paso erróneo (sin tocar nada); corregir() corta las respuestas desde ahí. */
  function revisar(M) {
    var out = derivar(M);
    if (!out.actual || out.actual.tipo !== 'revision') return { ok: false };
    for (var k = 0; k < M.resp.length; k++) {
      if (!M.resp[k].ok) {
        var r = M.resp[k];
        return { ok: false, error: { indice: k, tipo: r.tipo, vuelta: r.vuelta, q: r.q, codigo: r.codigo, pista: r.pista } };
      }
    }
    M.revisado = true;
    return { ok: true, terminada: true };
  }
  function corregir(M, indice) { M.resp.length = indice; }

  /* ---------- ayudas ---------- */
  function ayuda(M, explicita) {
    var out = derivar(M), a = out.actual; if (!a) return '';
    var c = ctxPista(M, out, a, null), d = M.d, V = a.V, T = a.vuelta !== null ? M.sim.vueltas[a.vuelta] : null;
    switch (a.tipo) {
      case 'tabla': return fmt(PISTAS.TABLA, c) + (explicita ? ' Da ' + (d * a.q) + '.' : '');
      case 'estimacion': return fmt(PISTAS.ESTIMACION, c);
      case 'parcial': return explicita ? ('Tomá ' + M.sim.vueltas[0].parcialTxt.length + (M.sim.vueltas[0].parcialTxt.length === 1 ? ' cifra' : ' cifras') + ': ' + M.sim.vueltas[0].parcialTxt + '.')
                                       : 'Mirá la primera cifra: ¿alcanza para ' + d + '? Si no, tomá dos cifras.';
      case 'factor': return explicita ? (d + ' × ' + T.factor + ' = ' + d * T.factor + ' es el más grande que no pasa de ' + V.parcial + ': entra ' + T.factor + (T.factor === 1 ? ' vez.' : ' veces.'))
                                     : '¿Cuántas veces entra ' + d + ' en ' + V.parcial + '? Buscá en la tabla el producto más grande que no pase.';
      case 'casita': return explicita ? 'Anotá ' + c.q + ' en el casillero.' : 'En el casillero va cuántas veces entra, no el resultado.';
      case 'producto': return explicita ? d + ' × ' + c.q + ' = ' + c.p + '.' : 'Multiplicá ' + d + ' × ' + c.q + '.';
      case 'resta': return explicita ? c.n + ' − ' + (M.dif ? d * T.factor : V.producto) + ' = ' + esperadoDe(M, out, a) + '.' : 'Restá ' + c.n + ' − ' + (M.dif ? d * T.factor : V.producto) + '.';
      case 'control': return explicita ? (V.resta + (V.resta < d ? ' es menor que ' : ' no es menor que ') + d + '.') : 'Compará el resto con ' + d + '.';
      case 'bajar': return explicita ? 'Tocá el ' + T.bajada + ' del dividendo.' : 'Bajá la cifra que sigue del dividendo.';
      case 'fin': return 'No quedan cifras para bajar. Tocá "Terminé".';
      case 'verificacion': return fmt(PISTAS.VERIFICACION, c);
      case 'revision': return 'Tocá "Revisar" para ver cómo te fue.';
    }
    return '';
  }

  var BARRA = { factor: 0, casita: 1, producto: 2, resta: 3, control: 4, bajar: 5, fin: 5 };
  var BARRA_NOMBRES = ['Entra', 'Anoto', 'Multiplico', 'Resto', 'Comparo', 'Bajo'];

  /* Pregunta que se muestra para el paso actual. */
  function pregunta(M, out) {
    var a = out.actual; if (!a) return '¡Cuenta terminada!';
    var d = M.d, V = a.V;
    switch (a.tipo) {
      case 'tabla': return 'Completá la tabla del ' + d + ': ' + d + ' × ' + a.q + ' = ?';
      case 'estimacion': return '¿Cuántas cifras va a tener el cociente?';
      case 'parcial': return 'Tocá las cifras del dividendo que tomás para empezar.';
      case 'factor': return '¿Cuántas veces entra ' + d + ' en ' + V.parcial + '?';
      case 'casita': return 'Anotá en el casillero cuántas veces entra.';
      case 'producto': return '¿Cuánto da ' + d + ' × ' + (M.dif ? M.sim.vueltas[a.vuelta].factor : V.factor) + '? Escribilo debajo.';
      case 'resta': return '¿Cuánto da ' + V.parcial + ' − ' + V.producto + '?';
      case 'control': return '¿' + V.resta + ' es menor que ' + d + '?';
      case 'bajar': return 'Tocá la cifra que bajás.';
      case 'fin': return 'No quedan cifras para bajar.';
      case 'verificacion': return 'Verificá: ¿cuánto da ' + M.sim.cociente + ' × ' + d + ' + ' + M.sim.resto + '?';
      case 'revision': return 'Revisemos tu cuenta.';
    }
    return '';
  }

  /* Vista para dibujar el cuaderno (ver cuaderno.js). buf = lo que el chico está tecleando. */
  function vista(M, buf, marcaError) {
    var out = derivar(M), a = out.actual, d = M.d, nv = M.sim.vueltas.length;
    var vi = a && a.vuelta !== null ? a.vuelta : nv;
    var vista = { dividendo: String(M.dividendo), divisor: d, cocienteLen: nv, totalVueltas: nv, igual: out.terminada ? String(M.sim.cociente) : null };
    vista.cociente = out.vueltas.map(function (V) { return V.casita === null ? '' : String(V.casita); }).join('');
    vista.vueltas = out.vueltas.map(function (V, k) {
      return { colInicio: V.colInicio, colFin: V.colFin, producto: V.producto === null ? null : String(V.producto), resta: V.resta === null ? null : String(V.resta),
               bajada: V.bajada, final: V.final, vieja: k < vi, errProducto: marcaError && marcaError.tipo === 'producto' && marcaError.vuelta === k,
               errResta: marcaError && marcaError.tipo === 'resta' && marcaError.vuelta === k };
    });
    // para el espacio del paso actual hace falta la vuelta aunque todavía no tenga datos
    if (a && a.V && out.vueltas.indexOf(a.V) < 0) out.vueltas.push(a.V);
    vista.tabla = out.tabla.map(function (t) {
      var activa = a && a.tipo === 'tabla' && a.q === t.q;
      var est = activa ? 'activa' : (!t.hecho ? 'hueco' : (marcaError && marcaError.tipo === 'tabla' && marcaError.q === t.q ? 'error' : 'normal'));
      return { q: t.q, p: t.hecho ? String(t.p) : null, estado: est };
    });
    if (a) {
      var z = { tabla: 'tabla', casita: 'casita', producto: 'producto', resta: 'resta', parcial: 'parcial', bajar: 'bajar' }[a.tipo];
      if (z) {
        var len = 1;
        if (a.tipo === 'producto' || a.tipo === 'resta') len = String(esperadoDe(M, out, a)).length;
        var cols = a.tipo === 'parcial' ? [0, 1] : (a.tipo === 'bajar' ? [M.sim.vueltas[a.vuelta].colFin + 1] : []);
        vista.activo = { zona: z, vuelta: a.vuelta, buf: buf || '', len: len, cols: cols };
        if (a.tipo === 'casita') vista.cociente = vista.cociente.slice(0, a.vuelta);
      }
    }
    return vista;
  }

  function estado(M) { return derivar(M); }
  function descripcion(M) { // resumen para el panel de debug
    var out = derivar(M), a = out.actual;
    return a ? { paso: a.tipo, vuelta: a.vuelta, esperado: esperadoTexto(M, a) } : { paso: 'fin' };
  }

  var api = { crear: crear, derivar: derivar, responder: responder, revisar: revisar, corregir: corregir, ayuda: ayuda, pregunta: pregunta, vista: vista, estado: estado,
              descripcion: descripcion, esperadoTexto: esperadoTexto, PISTAS: PISTAS, BARRA: BARRA, BARRA_NOMBRES: BARRA_NOMBRES, fmt: fmt };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_DIVMOTOR = api; }
})(typeof window !== 'undefined' ? window : this);
