/* Fracciones de 4to — generadores (segunda parte): ¿Cuál es más? (A4), ¿Cuánto falta? (A5), Potes y vasos (A6) y Repaso (A7).
   Lógica pura, sin DOM. Agrega comparar, falta, potes y repaso a window.REF4_FRGEN (en node: require devuelve REF4_FRGEN completo).
   Versión 1.0.0 (2026-10-13). Se carga después de fracciones-gen.js. */
(function (root) {
  'use strict';
  var req = typeof module !== 'undefined' && module.exports;
  var FR = req ? require('./fracciones-lib.js') : root.REF4_FR, FIG = req ? require('./fracciones-figuras.js') : root.REF4_FIG;
  var GEN = req ? require('./fracciones-gen.js') : root.REF4_FRGEN;
  var fr = FR.fr, T = FR.deTexto, txt = function (f) { return FR.formatear(f); }, mix = function (f) { return FR.formatear(f, { mixto: true }); };
  var UNO = fr(1, 1), DOS = fr(2, 1);

  function fracAzar(az, dens, min, max) { // fracción al azar con esos denominadores, min < f < max (sin enteros)
    for (var i = 0; i < 100; i++) {
      var d = az.elegir(dens), n = az.entero(1, Math.floor(max.n * d / max.d));
      var f = fr(n, d);
      if (FR.comparar(f, min) > 0 && FR.comparar(f, max) < 0 && !FR.esEntero(f)) return f;
    }
    return fr(1, 2);
  }
  function sinTresSeguidos(lista, az) {
    for (var i = 0; i < 50; i++) {
      var s = az.mezclar(lista), ok = true;
      for (var j = 2; j < s.length; j++) if (s[j] === s[j - 1] && s[j] === s[j - 2]) ok = false;
      if (ok) return s;
    }
    return lista;
  }
  var PARTES_NOMBRE = { 2: 'medios', 4: 'cuartos', 8: 'octavos', 16: 'dieciseisavos', 3: 'tercios' };

  /* ==================== A4. ¿Cuál es más? ==================== */
  function par(nivel, az) {
    for (var i = 0; i < 100; i++) {
      var a, b, modo;
      if (nivel === 1) {
        if (az.prob(0.5)) { var d = az.elegir([4, 8]), x = az.entero(1, d - 1), y = az.entero(1, d - 1); if (x === y) continue; a = fr(x, d); b = fr(y, d); modo = 'mismo_den'; }
        else { var n = az.elegir([1, 1, 2, 3]), ds = az.mezclar([2, 4, 8].filter(function (z) { return z > n; })); if (ds.length < 2) continue; a = fr(n, ds[0]); b = fr(n, ds[1]); modo = 'mismo_num'; }
      } else if (nivel === 2) {
        var pr = az.elegir([[2, 4], [2, 8], [4, 8]]), da = pr[az.entero(0, 1)], db = pr[0] === da ? pr[1] : pr[0];
        a = fr(az.entero(1, 2 * da - 1), da);
        if (az.prob(0.2)) { var k = db / da; if (k !== Math.floor(k)) { k = da / db; if ((a.n % k) !== 0) continue; b = fr(a.n / k, db); } else b = fr(a.n * k, db); modo = 'iguales'; }
        else { b = fr(az.entero(1, 2 * db - 1), db); modo = 'distinto'; }
        if (FR.esEntero(a) || FR.esEntero(b)) continue;
        if (modo !== 'iguales' && FR.iguales(a, b)) modo = 'iguales';
      } else {
        if (az.prob(0.5)) { var dm = az.elegir([2, 4, 8]), e = 1, nm = az.entero(1, dm - 1); a = FR.deMixto(e, nm, dm); var dv = az.elegir([dm, dm * 2].filter(function (z) { return z <= 16; })); b = fr(az.entero(dv + 1, 2 * dv - 1), dv); modo = 'mixto'; }
        else { var dd = az.elegir([[8, 16], [4, 16], [2, 16], [4, 8]]); a = fr(az.entero(1, 2 * dd[0] - 1), dd[0]); b = fr(az.entero(1, 2 * dd[1] - 1), dd[1]); modo = FR.iguales(a, b) ? 'iguales' : 'distinto'; }
        if (FR.esEntero(a) || FR.esEntero(b)) continue;
      }
      if (az.prob(0.5) && modo !== 'mixto') { var t = a; a = b; b = t; }
      return { a: a, b: b, modo: modo };
    }
    return { a: fr(1, 4), b: fr(1, 8), modo: 'mismo_num' };
  }
  function relacion(a, b) { return ['<', '=', '>'][FR.comparar(a, b) + 1]; }
  var VERBOS = [{ v: 'leyó', de: 'del libro', mas: '¿Quién leyó más?', menos: '¿Quién leyó menos?', falta: '¿A quién le falta más para terminar el libro?' },
    { v: 'comió', de: 'de una pizza', mas: '¿Quién comió más pizza?', menos: '¿Quién comió menos pizza?', falta: '¿A quién le falta más para terminar su pizza?' },
    { v: 'recorrió', de: 'del camino', mas: '¿Quién recorrió más?', menos: '¿Quién recorrió menos?', falta: '¿A quién le falta más para llegar?' },
    { v: 'pintó', de: 'de su mural', mas: '¿Quién pintó más?', menos: '¿Quién pintó menos?', falta: '¿A quién le falta más para terminar?' }];
  function razonesC3(a, b, modo, az) {
    var r;
    if (modo === 'mismo_den') r = { texto: 'Las partes son del mismo tamaño: es más la que tiene más partes.', ok: true };
    else if (modo === 'mismo_num') r = { texto: 'Tienen las mismas partes, pero las de 1/' + Math.min(a.d, b.d) + ' son más grandes.', ok: true };
    else if (modo === 'iguales') r = { texto: 'Son equivalentes: es la misma cantidad.', ok: true };
    else { var D = FR.mcm(a.d, b.d); r = { texto: 'Las pasé a ' + (PARTES_NOMBRE[D] || 'partes iguales') + ' y comparé.', ok: true }; }
    return az.mezclar([r, { texto: 'Porque ' + Math.max(a.d, b.d) + ' es más grande que ' + Math.min(a.d, b.d) + '.', ok: false, codigo: 'DENOM_MAYOR_ES_MAYOR' },
      { texto: 'Porque el número de arriba es más grande.', ok: false, codigo: 'COMPARACION' }]);
  }
  function armarC3(p, nivel, az) {
    var a = p.a.n === undefined ? T(p.a) : p.a, b = p.b.n === undefined ? T(p.b) : p.b, q = p.pregunta || 'mas', nom = GEN.nombres(az, 2), vb = az.elegir(VERBOS);
    var modo = p.modo || (FR.iguales(a, b) ? 'iguales' : (a.d === b.d ? 'mismo_den' : (a.n === b.n ? 'mismo_num' : 'distinto')));
    var cmp = FR.comparar(a, b), correcta = cmp === 0 ? 2 : (q === 'mas' ? (cmp > 0 ? 0 : 1) : (cmp > 0 ? 1 : 0)); // "falta más" = el que hizo menos
    return { tipo: 'C3', tema: 'comparacion', a: a, b: b, nombres: nom, pregunta: q, modo: modo, correcta: correcta,
      texto: nom[0] + ' ' + vb.v + ' ' + txt(a) + ' ' + vb.de + ' y ' + nom[1] + ', ' + txt(b) + '. ' + vb[q],
      razones: razonesC3(a, b, modo, az), info: { a: txt(a), b: txt(b), pregunta: q, modo: modo } };
  }
  function armarC5(ref, opciones, az, sentido) {
    sentido = sentido || 'mayor';
    var ops = opciones.map(function (f) { var c = FR.comparar(f, ref), ok = sentido === 'mayor' ? c > 0 : c < 0; return { f: f, codigo: ok ? null : (c === 0 ? 'IGUALDAD_NO_DETECTADA' : (f.n === ref.n && f.d !== ref.d ? 'DENOM_MAYOR_ES_MAYOR' : ((FR.comparar(f, UNO) > 0) !== (FR.comparar(ref, UNO) > 0) ? 'MAS_DE_UN_ENTERO' : 'COMPARACION'))) }; });
    return { tipo: 'C5', tema: FR.comparar(ref, UNO) > 0 ? 'mayor_que_uno' : 'comparacion', ref: ref, sentido: sentido, opciones: az.mezclar(ops), info: { ref: txt(ref), sentido: sentido, opciones: opciones.map(txt) } };
  }
  var COMPARAR = {
    tipos: function (n) { return n === 1 ? ['C1', 'C2', 'C3'] : (n === 2 ? ['C1', 'C2', 'C3', 'C5'] : ['C1', 'C2', 'C3', 'C4', 'C5']); },
    ronda: function () { return 8; },
    relacion: relacion,
    generar: function (nivel, tipo, az, ses) {
      ses = ses || {}; var pe = ses.pesosErr || {};
      if (tipo === 'C1') { var p = par(nivel, az); if (pe.DENOM_MAYOR_ES_MAYOR && nivel === 1 && az.prob(0.5)) p = { a: fr(1, az.elegir([4, 8])), b: fr(1, 2), modo: 'mismo_num' };
        return { tipo: 'C1', tema: FR.comparar(p.a, UNO) > 0 || FR.comparar(p.b, UNO) > 0 ? 'mayor_que_uno' : 'comparacion', a: p.a, b: p.b, modo: p.modo, mixtoA: p.modo === 'mixto', rel: relacion(p.a, p.b), verTiras: nivel === 1, info: { a: txt(p.a), b: txt(p.b), modo: p.modo } }; }
      if (tipo === 'C2') {
        var dens = nivel === 3 ? [2, 4, 8, 16] : [2, 4, 8], fichas = [], cuantas = az.entero(6, 7), conJusto = nivel > 1;
        for (var i = 0; i < 200 && fichas.length < cuantas; i++) {
          var d = az.elegir(dens), n = az.entero(1, 2 * d), f = fr(n, d), c = FR.comparar(f, UNO);
          if (!conJusto && c === 0) continue;
          if (fichas.some(function (x) { return FR.identicas(x.f, f); })) continue;
          fichas.push({ f: f, canasta: c < 0 ? 'menos' : (c === 0 ? 'justo' : 'mas') });
        }
        if (!fichas.some(function (x) { return x.canasta === 'mas'; })) fichas[0] = { f: fr(5, 4), canasta: 'mas' };
        if (!fichas.some(function (x) { return x.canasta === 'menos'; })) fichas[1] = { f: fr(3, 8), canasta: 'menos' };
        return { tipo: 'C2', tema: 'mayor_que_uno', fichas: az.mezclar(fichas), conJusto: conJusto, info: { fichas: fichas.map(function (x) { return txt(x.f); }) } };
      }
      if (tipo === 'C3') {
        // En los problemas (leer un libro, comer una pizza) nadie hace más que el entero: las dos fracciones, menores que 1.
        var pp = par(nivel === 3 ? 2 : nivel, az);
        for (var q3 = 0; q3 < 100 && (FR.comparar(pp.a, UNO) >= 0 || FR.comparar(pp.b, UNO) >= 0); q3++) pp = par(nivel === 3 ? 2 : nivel, az);
        if (FR.comparar(pp.a, UNO) >= 0 || FR.comparar(pp.b, UNO) >= 0) pp = { a: fr(3, 4), b: fr(5, 8), modo: 'distinto' };
        return armarC3({ a: pp.a, b: pp.b, modo: pp.modo, pregunta: nivel === 1 ? 'mas' : az.elegir(['mas', 'menos', 'falta']) }, nivel, az); }
      if (tipo === 'C4') {
        for (var j = 0; j < 100; j++) {
          var k = az.entero(3, 4), vals = [];
          for (var m = 0; m < 50 && vals.length < k; m++) { var g = fracAzar(az, [2, 4, 8, 16], fr(0, 1), fr(2, 1)); if (!vals.some(function (v) { return FR.iguales(v, g); })) vals.push(g); }
          if (vals.length === k) return { tipo: 'C4', tema: 'comparacion', fichas: az.mezclar(vals), orden: vals.slice().sort(FR.comparar), info: { fichas: vals.map(txt) } };
        }
      }
      // C5: "¿Cuál de estas es mayor que {ref}?"
      for (var t = 0; t < 100; t++) {
        var ref = fracAzar(az, [2, 4, 8], fr(1, 4), fr(7, 4)), sentido = az.prob(0.7) ? 'mayor' : 'menor';
        var bien = sentido === 'mayor' ? fracAzar(az, [2, 4, 8], ref, fr(2, 1)) : fracAzar(az, [2, 4, 8], fr(0, 1), ref);
        var dis = [], igual = FR.aDenominador(ref, ref.d * 2);
        if (igual) dis.push(igual);
        if (ref.n < 8) dis.push(fr(ref.n, ref.d * 2 <= 16 ? (sentido === 'mayor' ? ref.d * 2 : Math.max(1, ref.d / 2)) : ref.d));
        dis.push(sentido === 'mayor' ? fracAzar(az, [2, 4, 8], fr(0, 1), ref) : fracAzar(az, [2, 4, 8], ref, fr(2, 1)));
        dis.push(sentido === 'mayor' ? fracAzar(az, [2, 4, 8], fr(0, 1), ref) : fracAzar(az, [2, 4, 8], ref, fr(2, 1)));
        var ops = [bien];
        dis.forEach(function (x) { var c = FR.comparar(x, ref), malo = sentido === 'mayor' ? c <= 0 : c >= 0; if (malo && ops.length < 4 && !ops.some(function (o) { return FR.iguales(o, x) && FR.identicas(o, x); }) && !ops.some(function (o) { return FR.iguales(o, x); })) ops.push(x); });
        if (ops.length === 4) return armarC5(ref, ops, az, sentido);
      }
      return armarC5(fr(5, 4), [fr(3, 2), fr(5, 8), fr(9, 8), fr(3, 4)], az, 'mayor');
    },
    armar: {
      C1: function (p) { var a = T(p.a), b = T(p.b); return { tipo: 'C1', tema: 'comparacion', a: a, b: b, modo: 'modulo', rel: relacion(a, b), verTiras: false, info: { a: p.a, b: p.b } }; },
      C2: function (p, n, az) { var f = p.fichas.map(function (s) { var g = T(s), c = FR.comparar(g, UNO); return { f: g, canasta: c < 0 ? 'menos' : (c === 0 ? 'justo' : 'mas') }; }); return { tipo: 'C2', tema: 'mayor_que_uno', fichas: az.mezclar(f), conJusto: true, info: { fichas: p.fichas } }; },
      C3: function (p, n, az) { return armarC3(p, n, az); },
      C5: function (p, n, az) { return armarC5(T(p.ref), p.opciones.map(T), az, 'mayor'); }
    },
    validarC1: function (it, r) { var c = FR.clasificar('comparar', { a: it.a, b: it.b }, r); return c ? { ok: false, codigo: c } : { ok: true }; },
    validarC2: function (ficha, canasta) { return ficha.canasta === canasta ? { ok: true } : { ok: false, codigo: 'MAS_DE_UN_ENTERO' }; },
    // C3: elige 0 (primero), 1 (segundo) o 2 (los dos igual).
    validarC3: function (it, i) {
      if (i === it.correcta) return { ok: true };
      if (it.correcta === 2) return { ok: false, codigo: 'IGUALDAD_NO_DETECTADA' };
      var elegida = i === 0 ? it.a : it.b, otra = i === 0 ? it.b : it.a;
      if (i !== 2 && elegida.d !== otra.d) {
        var creeMayor = elegida.d > otra.d; // con la idea "más partes es más", la elegida parece mayor
        if ((it.pregunta === 'mas' && creeMayor) || (it.pregunta !== 'mas' && !creeMayor)) return { ok: false, codigo: 'DENOM_MAYOR_ES_MAYOR' };
      }
      if (i !== 2 && it.pregunta !== 'mas') return { ok: false, codigo: 'PREGUNTA' };
      return { ok: false, codigo: 'COMPARACION' };
    },
    validarC4: function (it, f, restantes) { var min = restantes.slice().sort(FR.comparar)[0]; if (FR.iguales(f, min)) return { ok: true }; return { ok: false, codigo: FR.clasificar('comparar', { a: f, b: min }, '<') || 'COMPARACION' }; },
    pista: function (codigo, it) {
      var a = it.a, b = it.b, D = a && b ? FR.mcm(a.d, b.d) : 8;
      var P = {
        DENOM_MAYOR_ES_MAYOR: 'Ojo: si la pizza se corta en más partes, cada parte es más chica. 1/8 es menos que 1/4.',
        IGUALDAD_NO_DETECTADA: 'Mirá las tiras: ¿llegan hasta el mismo lugar?', MAS_DE_UN_ENTERO: 'Un entero son tantas partes como dice el de abajo. Si arriba hay más que abajo, ya pasaste el entero.',
        PREGUNTA: 'Leé la pregunta de nuevo: ¿preguntan quién hizo más o quién hizo menos?', JUSTIFICACION: 'Elegiste bien, pero fijate el porqué. ¿Qué pasa si las dibujás?'
      };
      if (P[codigo]) return P[codigo];
      if (a && b && a.d === b.d) return 'Las partes son del mismo tamaño: es más la que tiene más partes.';
      if (a && b && it.pregunta === 'falta') return 'Si leyeron lo mismo, les falta lo mismo. Si no, le falta más al que hizo menos.';
      if (a && b) return 'Pasalas a ' + (PARTES_NOMBRE[D] || 'partes iguales') + ': ' + txt(a) + ' = ' + txt(FR.aDenominador(a, D) || a) + ' y ' + txt(b) + ' = ' + txt(FR.aDenominador(b, D) || b) + '. Ahora compará.';
      return 'Mirá las tiras y compará hasta dónde llegan.';
    }
  };

  /* ==================== A5. ¿Cuánto falta? ==================== */
  var CTX_P = {
    pared: { verbo: 'pintó', de: 'de la pared', falta: 'pintar', unidad: 'de la pared', todo: 'Toda la pared' }, libro: { verbo: 'leyó', de: 'del libro', falta: 'leer', unidad: 'del libro', todo: 'Todo el libro' },
    tarea: { verbo: 'hizo', de: 'de la tarea', falta: 'hacer', unidad: 'de la tarea', todo: 'Toda la tarea' }, caminata: { verbo: 'caminó', de: 'del recorrido', falta: 'caminar', unidad: 'del recorrido', todo: 'Todo el recorrido' },
    datos: { verbo: 'usó', de: 'de los datos del celular', falta: 'usar', unidad: 'de los datos', todo: 'Todo el paquete de datos' }
  };
  function armarProblema(p, nivel, az) {
    var cat = p.cat, nom = GEN.nombres(az, 1)[0], a = p.a.n === undefined ? T(p.a) : p.a, b = p.b ? (p.b.n === undefined ? T(p.b) : p.b) : null, it = { tipo: 'S4', tema: 'problemas', cat: cat, nombre: nom };
    var cx = CTX_P[p.ctx] || CTX_P.pared;
    if (cat === 'P1') {
      if (p.ctx === 'datos') { it.texto = nom + ' usó ' + txt(a) + ' de los datos del celular. ¿Cuánto le queda?'; it.preguntas = ['Cuánto le queda de los datos.', 'Cuánto usó de los datos.', 'Cuánto le falta para tener 2 veces los datos.']; }
      else { it.texto = nom + ' ' + cx.verbo + ' ' + txt(a) + ' ' + cx.de + '. ¿Cuánto le falta ' + cx.falta + '?'; it.preguntas = ['Cuánto le falta ' + cx.falta + '.', 'Cuánto ' + cx.verbo + '.', 'Cuánto le falta para hacerlo 2 veces.']; }
      it.T = UNO; it.unidad = cx.unidad; it.datos = [a]; it.esperado = FR.restar(UNO, a); it.opuesta = FR.sumar(UNO, a);
      it.planes = ['A todo (1 entero) le resto lo que ' + (p.ctx === 'datos' ? 'usó' : cx.verbo) + '.', 'Sumo 1 más lo que ' + (p.ctx === 'datos' ? 'usó' : cx.verbo) + '.', 'Ya está en el problema: es ' + txt(a) + '.'];
      it.enteros = [cx.todo + ' (1 entero)', '2 enteros', txt(a)]; it.todo = cx.todo;
    } else if (cat === 'P2') {
      var u2 = p.ctx === 'jugo' ? 'l' : 'kg';
      it.texto = 'Compraron ' + mix(p.T ? T(p.T) : DOS) + ' ' + u2 + ' de ' + (u2 === 'kg' ? 'pan' : 'jugo') + ' y ya ' + (u2 === 'kg' ? 'comieron' : 'tomaron') + ' ' + mix(a) + ' ' + u2 + '. ¿Cuánto queda?';
      it.T = p.T ? T(p.T) : DOS; it.unidad = u2; it.datos = [a, it.T]; it.esperado = FR.restar(it.T, a); it.opuesta = FR.sumar(it.T, a);
      it.enteroMal = FR.comparar(a, UNO) < 0 ? FR.restar(UNO, a) : null;
      it.preguntas = ['Cuánto ' + (u2 === 'kg' ? 'pan' : 'jugo') + ' queda.', 'Cuánto ' + (u2 === 'kg' ? 'comieron' : 'tomaron') + '.', 'Cuánto queda de 1 ' + u2 + '.'];
      it.planes = ['A los ' + mix(it.T) + ' ' + u2 + ' les resto lo que ' + (u2 === 'kg' ? 'comieron' : 'tomaron') + '.', 'Sumo ' + mix(it.T) + ' más lo que ' + (u2 === 'kg' ? 'comieron' : 'tomaron') + '.', 'Ya está en el problema: es ' + mix(a) + ' ' + u2 + '.'];
      it.enteros = [mix(it.T) + ' ' + u2, '1 ' + u2, mix(a) + ' ' + u2];
    } else if (cat === 'P3') {
      it.texto = nom + ' tenía ' + mix(p.T ? T(p.T) : DOS) + ' l de jugo y ahora tiene ' + txt(a) + ' l. ¿Cuánto tomó?';
      it.T = p.T ? T(p.T) : DOS; it.unidad = 'l'; it.datos = [a, it.T]; it.esperado = FR.restar(it.T, a); it.opuesta = FR.sumar(it.T, a); it.enteroMal = FR.restar(UNO, a); it.trampa = 'entero';
      it.preguntas = ['Cuánto jugo tomó.', 'Cuánto jugo le queda.', 'Cuánto le falta para tener 1 l.'];
      it.planes = ['A lo que tenía (' + mix(it.T) + ' l) le resto lo que le queda.', 'Sumo lo que tenía más lo que le queda.', 'Ya está en el problema: es ' + txt(a) + ' l.'];
      it.enteros = [mix(it.T) + ' l', '1 l', txt(a) + ' l'];
    } else if (cat === 'P4') {
      it.texto = nom + ' tomó ' + txt(a) + ' l de leche a la mañana y ' + txt(b) + ' l a la tarde. ¿Cuánto tomó en total?';
      it.T = null; it.unidad = 'l'; it.datos = [a, b]; it.esperado = FR.sumar(a, b); it.opuesta = FR.comparar(a, b) > 0 ? FR.restar(a, b) : FR.restar(b, a); it.cuenta = { a: a, b: b, op: 'suma' };
      it.preguntas = ['Cuánta leche tomó en todo el día.', 'Cuánta leche tomó a la tarde.', 'Cuánta más tomó a la mañana.'];
      it.planes = ['Sumo lo de la mañana y lo de la tarde.', 'Resto lo de la tarde a lo de la mañana.', 'Ya está en el problema: es ' + txt(b) + ' l.'];
    } else if (cat === 'P5') {
      it.texto = 'El lunes ' + nom + ' leyó ' + txt(a) + ' del libro y el martes, ' + txt(b) + '. ¿Cuánto le falta para terminarlo?';
      it.T = UNO; it.unidad = 'del libro'; it.datos = [a, b]; it.incompleto = FR.sumar(a, b); it.esperado = FR.restar(UNO, it.incompleto); it.opuesta = FR.sumar(UNO, it.incompleto); it.trampa = 'ultimo_paso';
      it.preguntas = ['Cuánto le falta leer.', 'Cuánto leyó entre los dos días.', 'Cuánto leyó el martes.'];
      it.planes = ['Sumo lo que leyó los dos días y se lo resto al libro entero.', 'Sumo lo que leyó los dos días y listo.', 'Ya está en el problema: es ' + txt(b) + '.'];
      it.enteros = ['Todo el libro (1 entero)', '2 libros', txt(a)]; it.todo = 'Todo el libro';
    } else { // P6: palabra clave engañosa ("le quedan… ¿cuánto usó?")
      it.texto = 'A ' + nom + ' le quedan ' + txt(a) + ' de los datos del celular. ¿Cuánto usó?';
      it.T = UNO; it.unidad = 'de los datos'; it.datos = [a]; it.esperado = FR.restar(UNO, a); it.opuesta = FR.sumar(UNO, a); it.trampa = 'palabra';
      it.preguntas = ['Cuánto usó de los datos.', 'Cuánto le queda de los datos.', 'Cuánto le falta para usar 2 paquetes.'];
      it.planes = ['A todo el paquete (1 entero) le resto lo que le queda.', 'Sumo 1 más lo que le queda.', 'Ya está en el problema: es ' + txt(a) + '.'];
      it.enteros = ['Todo el paquete de datos (1 entero)', '2 paquetes', txt(a)]; it.todo = 'Todo el paquete de datos';
    }
    it.info = { cat: cat, a: txt(a), b: b ? txt(b) : null, T: it.T ? txt(it.T) : null, trampa: it.trampa || null };
    it.sentido = nivel >= 2 && it.T && az.prob(0.5);
    if (it.sentido) { it.absurdo = az.prob(0.5); it.otroResp = it.absurdo ? FR.sumar(it.T, az.elegir([fr(1, 4), fr(1, 2), fr(3, 4)])) : it.esperado; }
    it.escribeUnidad = nivel >= 3;
    it.frases = az.mezclar([{ texto: frase(it, it.esperado, it.unidad), codigo: null }, { texto: frase(it, it.esperado, otraUnidad(it.unidad)), codigo: 'UNIDAD' }, { texto: frase(it, it.datos[0], it.unidad), codigo: 'RESPONDE_EL_DATO' }]);
    return it;
  }
  function otraUnidad(u) { return u === 'kg' ? 'l' : (u === 'l' ? 'kg' : 'kg'); }
  function frase(it, f, u) { var v = mix(f); return (u === 'kg' || u === 'l' ? 'Son ' + v + ' ' + u : 'Es ' + v + ' ' + u) + '.'; }
  function armarS3(a, b, op, nivel) {
    var res = op === '+' ? FR.sumar(a, b) : FR.restar(a, b), D = Math.max(a.d, b.d), conv = a.d === b.d ? null : (a.d < b.d ? 'a' : 'b');
    return { tipo: 'S3', tema: 'sumas_restas', a: a, b: b, op: op, esperado: res, mismo: a.d === b.d, conv: conv, D: D, pasos: nivel < 3, mixtoA: FR.comparar(a, UNO) > 0 && nivel === 3,
      verTiras: nivel === 1, info: { a: txt(a), op: op, b: txt(b), esperado: txt(res) } };
  }
  function opcionesS5(a, b, op, az, dadas) {
    var s = op === '+' ? 1 : -1, bien = s > 0 ? FR.sumar(a, b) : FR.restar(a, b);
    if (dadas) return az.mezclar(dadas.map(function (x) { var f = T(x); return { f: f, codigo: FR.clasificar(s > 0 ? 'suma' : 'resta', { a: a, b: b }, f) }; }));
    var nn = a.n + s * b.n, dis = [];
    if (a.d + s * b.d > 0 && nn > 0) dis.push({ f: fr(nn, a.d + s * b.d), codigo: 'OPERA_DENOMINADORES' });
    if (a.d !== b.d && nn > 0) dis.push({ f: fr(nn, Math.max(a.d, b.d)), codigo: 'DENOMINADOR_DISTINTO' });
    if (nn > 0) dis.push({ f: fr(nn, a.d * b.d), codigo: 'CALCULO' });
    dis.push({ f: FR.sumar(bien, fr(1, Math.max(a.d, b.d))), codigo: 'CALCULO' });
    dis.push({ f: s > 0 ? FR.restar(a, b) : FR.sumar(a, b), codigo: 'PLAN_OPERACION' });
    var o = GEN.opcionesDistintas(bien, dis.filter(function (x) { return x.f.n > 0; }), az, 4);
    return o;
  }
  var FALTA = {
    tipos: function (n) { return n === 1 ? ['S1', 'S2', 'S3', 'S4'] : (n === 2 ? ['S1', 'S2', 'S3', 'S4', 'S5'] : ['S2', 'S3', 'S4', 'S5']); },
    ronda: function () { return 6; },
    // Ronda: 6 ítems, 2 problemas (en el nivel 1, 5 cuentas y 1 problema).
    secuencia: function (nivel, az) {
      var cuentas = nivel === 1 ? ['S1', 'S2', 'S3'] : (nivel === 2 ? ['S1', 'S2', 'S3', 'S5'] : ['S2', 'S3', 'S5']), np = nivel === 1 ? 1 : 2, out = [];
      for (var i = 0; i < 6 - np; i++) out.push(az.elegir(cuentas));
      for (i = 0; i < np; i++) out.push('S4');
      return sinTresSeguidos(out, az);
    },
    PARTES_NOMBRE: PARTES_NOMBRE, armarProblema: armarProblema, opcionesS5: opcionesS5,
    generar: function (nivel, tipo, az, ses) {
      ses = ses || {}; var dens = [2, 4, 8];
      for (var intento = 0; intento < 100; intento++) {
        if (tipo === 'S1' || tipo === 'S2') {
          var Tt = nivel >= 2 && az.prob(0.4) ? DOS : UNO, a = fracAzar(az, dens, fr(0, 1), Tt);
          if (Tt === DOS && FR.comparar(a, UNO) <= 0 && az.prob(0.6)) continue;
          return { tipo: tipo, tema: 'cuanto_falta', T: Tt, a: a, esperado: FR.restar(Tt, a), verTiras: tipo === 'S1' || nivel === 1, enteroMal: Tt === DOS && FR.comparar(a, UNO) < 0 ? FR.restar(UNO, a) : null,
            info: { T: txt(Tt), a: txt(a) } };
        }
        if (tipo === 'S3' || tipo === 'S5') {
          var op = az.prob(0.5) ? '+' : '-', x, y;
          if (nivel === 1) { var d = az.elegir([4, 8]); x = fr(az.entero(1, d - 1), d); y = fr(az.entero(1, d - 1), d); }
          else { var pr = az.mezclar(az.elegir([[2, 4], [2, 8], [4, 8]])); x = fracAzar(az, [pr[0]], fr(0, 1), nivel === 3 ? DOS : UNO); y = fracAzar(az, [pr[1]], fr(0, 1), UNO); }
          if (nivel === 3 && op === '-' && az.prob(0.5)) x = FR.deMixto(1, az.elegir([1, 3]), 4);
          if (op === '-' && FR.comparar(x, y) <= 0) { var t = x; x = y; y = t; }
          var res = op === '+' ? FR.sumar(x, y) : FR.restar(x, y);
          if (res.n <= 0 || FR.comparar(res, DOS) > 0) continue;
          if (nivel === 1 && FR.comparar(res, UNO) > 0) continue;
          if (nivel === 2 && FR.comparar(res, UNO) > 0 && az.prob(0.5)) continue;
          if (tipo === 'S3') return armarS3(x, y, op, nivel);
          var ops = opcionesS5(x, y, op, az); if (!ops) continue;
          return { tipo: 'S5', tema: 'sumas_restas', a: x, b: y, op: op, esperado: res, opciones: ops, info: { a: txt(x), op: op, b: txt(y) } };
        }
        if (tipo === 'S4') {
          var cats = nivel === 1 ? ['P1'] : (nivel === 2 ? ['P1', 'P2', 'P3', 'P4'] : (az.prob(0.5) ? ['P3', 'P5', 'P6'] : ['P1', 'P2', 'P4'])), cat = az.elegir(cats), p = { cat: cat };
          var dn = nivel === 1 ? az.elegir([2, 4, 8]) : null;
          if (cat === 'P1') { p.a = dn ? fr(az.entero(1, dn - 1), dn) : fracAzar(az, dens, fr(0, 1), UNO); p.ctx = az.elegir(['pared', 'libro', 'tarea', 'caminata', 'datos']); }
          else if (cat === 'P2') { p.a = fracAzar(az, [4, 8], fr(1, 2), fr(7, 4)); p.ctx = az.elegir(['pan', 'jugo']); }
          else if (cat === 'P3') { p.a = fracAzar(az, dens, fr(0, 1), UNO); }
          else if (cat === 'P4') { p.a = fracAzar(az, dens, fr(0, 1), UNO); p.b = fracAzar(az, dens, fr(0, 1), UNO); if (FR.comparar(FR.sumar(p.a, p.b), DOS) > 0) continue; }
          else if (cat === 'P5') { p.a = fracAzar(az, [4, 8], fr(0, 1), fr(1, 2)); p.b = fracAzar(az, [4, 8], fr(0, 1), fr(1, 2)); if (FR.comparar(FR.sumar(p.a, p.b), UNO) >= 0) continue; }
          else { p.a = fracAzar(az, dens, fr(0, 1), UNO); }
          return armarProblema(p, nivel, az);
        }
      }
      return armarS3(fr(1, 2), fr(1, 4), '+', nivel);
    },
    armar: {
      S2: function (p) { var Tt = T(p.T), a = T(p.a); return { tipo: 'S2', tema: 'cuanto_falta', T: Tt, a: a, esperado: FR.restar(Tt, a), verTiras: false, enteroMal: FR.comparar(Tt, UNO) > 0 && FR.comparar(a, UNO) < 0 ? FR.restar(UNO, a) : null, info: p }; },
      S3: function (p, n) { return armarS3(T(p.a), T(p.b), p.op, n); },
      S4: function (p, n, az) { return armarProblema(p, n, az); },
      S5: function (p, n, az) { var a = T(p.a), b = T(p.b); return { tipo: 'S5', tema: 'sumas_restas', a: a, b: b, op: p.op, esperado: p.op === '+' ? FR.sumar(a, b) : FR.restar(a, b), opciones: opcionesS5(a, b, p.op, az, p.opciones), info: p }; }
    },
    validarFalta: function (it, f) { var c = FR.clasificar('problema', { esperado: it.esperado, datos: [it.a], enteroMal: it.enteroMal }, f); return c ? { ok: false, codigo: c } : { ok: true }; },
    validarS3: function (it, f) { var c = FR.clasificar(it.op === '+' ? 'suma' : 'resta', { a: it.a, b: it.b }, f); return c ? { ok: false, codigo: c } : { ok: true }; },
    validarProblema: function (it, f) { var c = FR.clasificar('problema', it, f); return c ? { ok: false, codigo: c } : { ok: true }; },
    pista: function (codigo, it, extra) {
      extra = extra || {};
      var a = it.a, b = it.b, D = it.D || (a && b ? FR.mcm(a.d, b.d) : (a ? a.d : 4)), partes = PARTES_NOMBRE[D] || 'partes iguales';
      var verbo = { P1: 'falta', P2: 'queda', P3: 'tomó', P4: 'tomó', P5: 'falta', P6: 'usó' }[it.cat] || 'falta';
      var P = {
        OPERA_DENOMINADORES: 'Ojo: los de abajo no se suman. ' + (extra.resp ? extra.resp + ' es menos que ' + (a ? txt(a) : '') + ', así que no puede ser. ' : '') + 'Pasá todo a ' + partes + '.',
        DENOMINADOR_DISTINTO: 'Para sumar, las partes tienen que ser del mismo tamaño. Pasá ' + (it.conv === 'a' && a ? txt(a) : (b ? txt(b) : '')) + ' a ' + partes + '.',
        RESPONDE_EL_DATO: 'Ese número ya está en el problema. Te preguntan cuánto ' + verbo + '.',
        ENTERO_EQUIVOCADO: it.T && FR.comparar(it.T, UNO) === 0 ? 'El entero es 1: ' + (it.todo || 'todo').toLowerCase() + '.' : 'Acá el entero no es 1: ' + (it.T ? 'tenía ' + mix(it.T) + (it.unidad === 'kg' || it.unidad === 'l' ? ' ' + it.unidad : '') : 'mirá cuánto hay en total') + '.',
        PLAN_OPERACION: it.cat === 'P4' ? 'Preguntan cuánto tomó en total: ¿juntás o sacás?' : 'Preguntan cuánto ' + verbo + ': a lo que tenía, ¿le sumás o le sacás?',
        PLAN_INCOMPLETO: 'Eso es lo que ya leyó. ¿La pregunta pide eso o lo que le falta?', ABSURDO: '¿Puede quedarle más de lo que tenía?',
        UNIDAD: '¿' + (extra.x || 'Eso') + ' qué? ¿Kilos, litros, partes del libro?', MIXTO: '1 entero son ' + (a ? a.d + '/' + a.d : 'todas las partes') + '. Contá cuántas partes son en total.',
        CALCULO: it.T && a ? 'Un entero son ' + a.d + '/' + a.d + '. Si ya hay ' + txt(a) + ', ¿cuántos ' + (PARTES_NOMBRE[a.d] || 'pedazos') + ' faltan?' : 'Revisá la cuenta con las tiras.'
      };
      if (codigo === 'CALCULO' && it.tipo === 'S3') return 'Pasá todo a ' + partes + ' y contá las partes.';
      if (codigo === 'CALCULO' && it.T && FR.comparar(it.T, UNO) > 0 && a) return '2 enteros son ' + (2 * a.d) + '/' + a.d + '. Si ya hay ' + txt(a) + ', ¿cuántos ' + (PARTES_NOMBRE[a.d] || 'pedazos') + ' faltan?';
      return P[codigo] || 'Mirá las tiras y probá otra vez.';
    }
  };

  /* ==================== A6. Potes y vasos ==================== */
  var POTES = [UNO, fr(1, 2), fr(1, 4)];
  var DISPONIBLES = { ninguna: POTES, menos_potes: POTES, medios_cuartos: [fr(1, 2), fr(1, 4)], mas_medios: [fr(1, 2), fr(1, 4)], cuartos: [fr(1, 4)], medios: [fr(1, 2)] };
  var CONDICION = { ninguna: '', medios_cuartos: 'Solo hay potes de 1/2 y de 1/4 kg.', cuartos: 'Solo hay potes de 1/4 kg.', mas_medios: 'Usá la mayor cantidad posible de potes de 1/2 kg.', menos_potes: 'Usá la menor cantidad de potes.' };
  function sumaLista(l) { return l.reduce(function (s, f) { return FR.sumar(s, f); }, fr(0, 1)); }
  var VASOS = {
    medianos_litro: { texto: '¿Cuántos vasos medianos llenás con 1 l?', resp: 4 }, chicos_litro: { texto: '¿Cuántos vasos chicos llenás con 1 l?', resp: 8 },
    medianos_medio: { texto: '¿Cuántos vasos medianos llenás con 1/2 l?', resp: 2 }, chicos_medio: { texto: '¿Y cuántos vasos chicos llenás con 1/2 l?', resp: 4 },
    chicos_mediano: { texto: '¿Cuántos vasos chicos llenás con un vaso mediano?', resp: 2 }, parte_chico: { texto: '¿Qué parte del litro tiene un vaso chico?', resp: fr(1, 8), fraccion: true },
    parte_mediano: { texto: '¿Qué parte del litro tiene un vaso mediano?', resp: fr(1, 4), fraccion: true }
  };
  function armarK1(p, nivel) {
    var obj = p.objetivo.n === undefined ? T(p.objetivo) : p.objetivo, cond = p.cond || 'ninguna';
    return { tipo: 'K1', tema: 'medidas', objetivo: obj, cond: cond, disponibles: DISPONIBLES[cond], condTexto: CONDICION[cond], sePuede: !!p.sePuede, ayudaSuma: nivel === 1,
      info: { objetivo: mix(obj), cond: cond, sePuede: !!p.sePuede } };
  }
  function estadoPotes(lista, obj) { var s = sumaLista(lista), c = FR.comparar(s, obj); return { suma: s, estado: c === 0 ? 'justo' : (c < 0 ? 'falta' : 'sobra'), dif: c < 0 ? FR.restar(obj, s) : FR.restar(s, obj) }; }
  var POTESV = {
    tipos: function (n) { return n === 1 ? ['K1', 'K2', 'K5'] : ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']; },
    ronda: function () { return 4; },
    VASOS: VASOS, CONDICION: CONDICION, sumaLista: sumaLista, estadoPotes: estadoPotes,
    generar: function (nivel, tipo, az, ses) {
      var objs = nivel === 1 ? ['1', '1 1/2', '2'] : ['1', '1 1/4', '1 1/2', '1 3/4', '2', '2 1/2'];
      for (var intento = 0; intento < 100; intento++) {
        if (tipo === 'K1') {
          var obj = T(az.elegir(objs)), conds = nivel === 1 ? ['ninguna'] : (nivel === 2 ? ['ninguna', 'medios_cuartos', 'cuartos'] : ['ninguna', 'medios_cuartos', 'cuartos', 'mas_medios', 'menos_potes']);
          var cond = az.elegir(conds), impar = (obj.n * 4 / obj.d) % 2 === 1;
          if (nivel >= 2 && impar && az.prob(0.3)) return armarK1({ objetivo: obj, cond: 'mas_medios', sePuede: true }, nivel);
          if (cond === 'cuartos' && obj.n * 4 / obj.d > 8) continue;
          return armarK1({ objetivo: obj, cond: cond }, nivel);
        }
        if (tipo === 'K2') {
          var lista = []; for (var i = 0, k = az.entero(2, 5); i < k; i++) lista.push(az.elegir(POTES));
          var s = sumaLista(lista), quiere = az.elegir([s, FR.sumar(s, fr(1, 4)), FR.sumar(s, fr(1, 2)), FR.restar(s, fr(1, 4)), FR.restar(s, fr(1, 2))]);
          if (quiere.n <= 0 || FR.comparar(quiere, fr(3, 1)) > 0 || (nivel === 1 && !FR.esEntero(FR.porEntero(quiere, 2)))) continue;
          var e = estadoPotes(lista, quiere);
          return { tipo: 'K2', tema: 'medidas', lista: lista, objetivo: quiere, estado: e.estado, dif: e.dif, ayuda: nivel === 1, info: { lista: lista.map(txt), objetivo: mix(quiere), estado: e.estado } };
        }
        if (tipo === 'K3') {
          var ob = T(az.elegir(['1 1/2', '1 3/4', '2'])), filas = [], justo = false;
          for (var f = 0, nf = az.entero(3, 4); f < nf; f++) {
            var meta = az.elegir([ob, ob, FR.restar(ob, fr(1, 4)), FR.restar(ob, fr(1, 2)), FR.sumar(ob, fr(1, 4))]), fila = [], acc = fr(0, 1);
            while (FR.comparar(acc, meta) < 0) { var pot = az.elegir([fr(1, 2), fr(1, 4)]); if (FR.comparar(FR.sumar(acc, pot), meta) > 0) pot = fr(1, 4); fila.push(pot); acc = FR.sumar(acc, pot); }
            if (fila.length > 6) { f--; continue; }
            var es = estadoPotes(fila, ob); if (es.estado === 'justo') justo = true;
            filas.push({ potes: fila, estado: es.estado, dif: es.dif });
          }
          if (!justo) continue;
          return { tipo: 'K3', tema: 'medidas', objetivo: ob, filas: filas, info: { objetivo: mix(ob), filas: filas.map(function (x) { return x.potes.map(txt).join('+'); }) } };
        }
        if (tipo === 'K4') {
          var tot = T(az.elegir(['1 1/2', '1 3/4', '2', '2 1/2'])), sum = [], ac = fr(0, 1);
          for (var j = 0, ns = az.entero(2, 3); j < ns; j++) { var x = az.elegir([UNO, fr(1, 2), fr(1, 4), fr(3, 4)]); sum.push(x); ac = FR.sumar(ac, x); }
          var falta = FR.restar(tot, ac); if (falta.n <= 0 || FR.comparar(falta, UNO) > 0) continue;
          return { tipo: 'K4', tema: 'medidas', sumandos: sum, total: tot, esperado: falta, info: { sumandos: sum.map(txt), total: mix(tot) } };
        }
        if (tipo === 'K5') {
          var qs = nivel === 1 ? ['medianos_litro', 'chicos_litro', 'medianos_medio', 'chicos_medio', 'chicos_mediano'] : ['medianos_medio', 'chicos_medio', 'chicos_mediano', 'parte_chico', 'parte_mediano', 'jarra', 'jarra'];
          var qq = az.elegir(qs);
          if (qq === 'jarra') {
            var serv = [], tt = fr(0, 1); for (var v = 0, nv = az.entero(3, 5); v < nv; v++) { var vs = az.elegir([fr(1, 4), fr(1, 8)]); if (FR.comparar(FR.sumar(tt, vs), fr(11, 8)) > 0) break; serv.push(vs); tt = FR.sumar(tt, vs); }
            return { tipo: 'K5', tema: 'medidas', pregunta: 'jarra', servir: serv, capacidad: fr(3, 2), esperado: FR.restar(fr(3, 2), tt), info: { pregunta: 'jarra', servir: serv.map(txt) } };
          }
          return { tipo: 'K5', tema: 'medidas', pregunta: qq, texto: VASOS[qq].texto, esperado: VASOS[qq].resp, fraccion: !!VASOS[qq].fraccion, info: { pregunta: qq } };
        }
        if (tipo === 'K6') return { tipo: 'K6', tema: 'medidas', modo: nivel === 3 ? 'ajustar' : 'elegir', opciones: az.mezclar([{ alto: 0.5, ok: true }, { alto: 1, ok: false }, { alto: 0.25, ok: false }]), info: { modo: nivel === 3 ? 'ajustar' : 'elegir' } };
      }
      return armarK1({ objetivo: UNO, cond: 'ninguna' }, nivel);
    },
    armar: {
      K1: function (p, n) { return armarK1(p, n); },
      K2: function (p) { var l = p.lista.map(T), o = T(p.objetivo), e = estadoPotes(l, o); return { tipo: 'K2', tema: 'medidas', lista: l, objetivo: o, estado: e.estado, dif: e.dif, ayuda: false, info: p }; },
      K3: function (p) { var o = T(p.objetivo); return { tipo: 'K3', tema: 'medidas', objetivo: o, filas: p.filas.map(function (f) { var l = f.map(T), e = estadoPotes(l, o); return { potes: l, estado: e.estado, dif: e.dif }; }), info: p }; },
      K4: function (p) { var s = p.sumandos.map(T), t = T(p.total); return { tipo: 'K4', tema: 'medidas', sumandos: s, total: t, esperado: FR.restar(t, sumaLista(s)), info: p }; },
      K5: function (p) {
        if (p.pregunta === 'jarra') { var sv = p.servir.map(T); return { tipo: 'K5', tema: 'medidas', pregunta: 'jarra', servir: sv, capacidad: fr(3, 2), esperado: FR.restar(fr(3, 2), sumaLista(sv)), info: p }; }
        return { tipo: 'K5', tema: 'medidas', pregunta: p.pregunta, texto: VASOS[p.pregunta].texto, esperado: VASOS[p.pregunta].resp, fraccion: !!VASOS[p.pregunta].fraccion, info: p };
      }
    },
    validarK1: function (it, lista) { var c = FR.clasificar('potes', { objetivo: it.objetivo, cond: it.cond === 'ninguna' ? null : it.cond }, lista); return c ? { ok: false, codigo: c } : { ok: true }; },
    pista: function (codigo, it, extra) {
      extra = extra || {};
      var P = {
        SE_PASA: 'Te pasaste de la banderita. Sacá un pote.', NO_LLEGA: it.ayudaSuma && extra.falta ? 'Todavía te falta ' + mix(extra.falta) + ' kg.' : 'Todavía no llegás.',
        RESTRICCION: it.cond === 'mas_medios' ? '¡Justo! Pero se pedía la mayor cantidad de potes de 1/2. ¿Podés cambiar dos de 1/4 por uno de 1/2?' : (it.cond === 'menos_potes' ? '¡Justo! Pero se puede con menos potes. ¿Podés cambiar dos chicos por uno más grande?' : 'Fijate qué potes se pueden usar.'),
        EQUIV: 'Dos potes de 1/4 kg pesan lo mismo que uno de 1/2 kg.', VASOS: '1 l llena 8 vasos chicos: cada vaso chico es 1/8 de litro.', MEDIO: 'Medio litro es la mitad del litro: la mitad de 8 vasos chicos.',
        JARRA: '1 1/2 l son 12/8 l. Restá lo que serviste, en octavos.', CALCULO: 'Sumá los potes de a uno: dos de 1/4 kg hacen 1/2 kg.', MIXTO: 'Cuatro cuartos hacen 1 kilo. ¿Cuántos kilos enteros hay y cuánto sobra?'
      };
      return P[codigo] || P.CALCULO;
    }
  };

  /* ==================== A7. Repaso ==================== */
  // 8 preguntas de opción múltiple (y un verdadero o falso), una por tema, con las opciones incorrectas salidas de errores típicos.
  function preguntasRepaso(niveles, az) {
    var N = function (act) { return (niveles && niveles[act] >= 3) ? 3 : 2; }, out = [];
    function op(f, codigo, mixto) { return { f: f, texto: mixto ? mix(f) : txt(f), codigo: codigo }; }
    function completar(correcta, dis) { var o = GEN.opcionesDistintas(correcta.f, dis.map(function (d) { return { f: d.f, codigo: d.codigo }; }), az, 4); if (!o) return null; return o.map(function (x) { return op(x.f, x.codigo, FR.comparar(x.f, UNO) > 0 && x.codigo !== 'INVERTIDA'); }); }
    var intentos = 0;
    // 1. reparto
    for (; intentos < 50; intentos++) { var r = GEN.repartos.generar(N('4to-fracciones-repartos'), 'R4', az, {}); if (r.opciones) { out.push({ tema: 'reparto', act: '4to-fracciones-repartos', pregunta: 'Se reparten ' + r.N + ' ' + (r.ctx.unidad ? r.ctx.unidad + ' de ' + (r.ctx.unidad === 'kg' ? 'helado' : 'jugo') + ' en ' + r.M + ' ' + r.ctx.reciben : r.ctx.cosas + ' entre ' + r.M + ' chicos') + ' en partes iguales. ¿Cuánto ' + (r.ctx.unidad ? 'va en cada ' + r.ctx.recibe : 'recibe cada uno') + '?',
      opciones: r.opciones.map(function (o) { return { f: o.f, texto: o.texto, codigo: o.codigo }; }), explicacion: 'Primero los enteros: a cada uno le tocan ' + r.q + ' y sobran ' + r.r + '. Lo que sobra se corta en ' + r.M + ': ' + r.N + '/' + r.M + ' = ' + mix(fr(r.N, r.M)) + '.', dibujo: { tira: fr(r.N, r.M) } }); break; } }
    // 2. parte pintada
    for (intentos = 0; intentos < 50; intentos++) {
      var p = GEN.partes.generar(N('4to-fracciones-partes'), 'P1', az, {}), e = p.esperado;
      var ops = completar(op(e, null), [{ f: fr(p.p, Math.max(1, p.n - p.p)), codigo: 'PARTE_PARTE' }, { f: fr(p.n, p.p), codigo: 'INVERTIDA' }, { f: fr(p.piezasPintadas, p.piezas), codigo: 'CUENTA_PARTES' }, { f: fr(p.p + 1, p.n), codigo: 'OTRO' }, { f: fr(Math.max(1, p.p - 1), p.n), codigo: 'OTRO' }]);
      if (ops && p.p < p.n) { out.push({ tema: 'partes', act: '4to-fracciones-partes', pregunta: '¿Qué parte de la figura está pintada?', fig: p.fig, opciones: ops, explicacion: 'Hay que ver en cuántas partes iguales está el entero: son ' + p.n + ' y hay ' + p.p + ' pintadas. Es ' + p.p + '/' + p.n + '.', dibujo: { fig: p.fig, guia: true } }); break; }
    }
    // 3. equivalencia
    for (intentos = 0; intentos < 50; intentos++) {
      var f = az.elegir([fr(1, 2), fr(1, 4), fr(3, 4), fr(3, 8), fr(5, 4)]), k = az.elegir([2, 4].filter(function (x) { return f.d * x <= 16; })), bien = fr(f.n * k, f.d * k);
      var o3 = completar(op(bien, null), [{ f: fr(f.n + 1, f.d + 1), codigo: 'EQUIV_SUMA' }, { f: fr(f.n * k, f.d * k * 2), codigo: 'EQUIV_MAL_ESCALADA' }, { f: fr(f.d, f.n), codigo: 'INVERTIDA' }, { f: fr(f.n * k, f.d), codigo: 'EQUIV_MAL_ESCALADA' }]);
      if (o3) { out.push({ tema: 'equivalencias', act: '4to-fracciones-muro', pregunta: '¿Cuál es equivalente a ' + txt(f) + '?', opciones: o3.map(function (x) { x.texto = txt(x.f); return x; }), explicacion: 'Si partís cada parte en ' + k + ', quedan ' + k + ' veces más partes y ' + k + ' veces más pintadas: ' + txt(f) + ' = ' + txt(bien) + '.', dibujo: { tira: f } }); break; }
    }
    // 4. comparación
    var c5 = COMPARAR.generar(N('4to-fracciones-comparar'), 'C5', az, {});
    out.push({ tema: c5.tema, act: '4to-fracciones-comparar', pregunta: '¿Cuál de estas es ' + c5.sentido + ' que ' + txt(c5.ref) + '?', opciones: c5.opciones.map(function (o) { return op(o.f, o.codigo); }),
      explicacion: 'Pasalas a partes del mismo tamaño y compará. Ojo: más partes no es más grande.', dibujo: { tira: c5.ref } });
    // 5. cuánto falta o queda
    for (intentos = 0; intentos < 50; intentos++) {
      var pb = armarProblema({ cat: az.elegir(['P1', 'P6']), a: fracAzar(az, [4, 8], fr(0, 1), UNO), ctx: az.elegir(['pared', 'libro', 'tarea', 'datos']) }, 2, az);
      var o5 = completar(op(pb.esperado, null), [{ f: pb.datos[0], codigo: 'RESPONDE_EL_DATO' }, { f: pb.opuesta, codigo: 'PLAN_OPERACION' }, { f: fr(Math.max(1, pb.esperado.n + 1), pb.esperado.d), codigo: 'CALCULO' }, { f: FR.simplificar(fr(pb.datos[0].d - pb.datos[0].n + 1, pb.datos[0].d)), codigo: 'CALCULO' }]);
      if (o5) { out.push({ tema: 'problemas', act: '4to-fracciones-cuanto-falta', pregunta: pb.texto, opciones: o5, explicacion: 'El entero es 1: a todo le restás lo que ' + (pb.cat === 'P6' ? 'le queda' : 'ya está hecho') + '. 1 − ' + txt(pb.datos[0]) + ' = ' + txt(pb.esperado) + '.', dibujo: { tira: pb.datos[0] } }); break; }
    }
    // 6. suma o resta
    for (intentos = 0; intentos < 50; intentos++) { var s5 = FALTA.generar(N('4to-fracciones-cuanto-falta'), 'S5', az, {}); if (s5.tipo === 'S5') { out.push({ tema: 'sumas_restas', act: '4to-fracciones-cuanto-falta', pregunta: '¿Cuánto es ' + txt(s5.a) + ' ' + (s5.op === '+' ? '+' : '−') + ' ' + txt(s5.b) + '?', opciones: s5.opciones.map(function (o) { return op(o.f, o.codigo); }), explicacion: 'Primero pasá las dos a partes del mismo tamaño; los de abajo no se suman. Da ' + txt(s5.esperado) + '.', dibujo: { tira: s5.esperado } }); break; } }
    // 7. medidas
    var o7 = null, lista, tot;
    for (intentos = 0; intentos < 50 && !o7 && az.prob(0.5); intentos++) {
      lista = az.mezclar([UNO, fr(1, 2), fr(1, 4), fr(1, 4), fr(1, 2)]).slice(0, az.entero(2, 3)); tot = sumaLista(lista);
      o7 = completar(op(tot, null), [{ f: fr(lista.length, lista.reduce(function (s, x) { return s + x.d; }, 0)), codigo: 'OPERA_DENOMINADORES' }, { f: FR.sumar(tot, fr(1, 4)), codigo: 'CALCULO' }, { f: FR.restar(tot, fr(1, 4)), codigo: 'CALCULO' }, { f: fr(lista.length, 4), codigo: 'CALCULO' }, { f: FR.sumar(tot, fr(1, 2)), codigo: 'CALCULO' }]);
    }
    if (o7) {
      out.push({ tema: 'medidas', act: '4to-fracciones-potes-vasos', pregunta: 'Juntás potes de ' + lista.map(function (x) { return txt(x) + ' kg'; }).join(', ') + '. ¿Cuánto pesan en total?', opciones: o7,
        explicacion: 'Dos potes de 1/4 kg hacen 1/2 kg y dos de 1/2 kg hacen 1 kg. En total, ' + mix(tot) + ' kg.', dibujo: { kilos: tot } });
    } else {
      var litros = az.elegir([fr(1, 2), fr(3, 4), fr(1, 4), UNO]), chicos = litros.n * 8 / litros.d;
      out.push({ tema: 'medidas', act: '4to-fracciones-potes-vasos', pregunta: 'Un vaso chico tiene 1/8 l. ¿Cuántos vasos chicos llenás con ' + txt(litros) + ' l?',
        opciones: az.mezclar([chicos].concat([chicos * 2, chicos + 2, chicos / 2, chicos + 1, chicos - 1].filter(function (x, i, a) { return x > 0 && x === Math.floor(x) && x !== chicos && a.indexOf(x) === i; }).slice(0, 3))
          .map(function (x) { return { f: fr(x, 1), texto: String(x), codigo: x === chicos ? null : 'CALCULO' }; })),
        explicacion: '1 l llena 8 vasos chicos. ' + txt(litros) + ' l llena ' + chicos + '.', dibujo: { tira: litros } });
    }
    // 8. verdadero o falso de equivalencias
    var e5 = GEN.muro.generar(N('4to-fracciones-muro'), 'E5', az, {});
    out.push({ tema: 'equivalencias', act: '4to-fracciones-muro', vf: true, pregunta: e5.k + ' partes de 1/' + e5.b + ' equivalen a ' + e5.j + ' partes de 1/' + e5.c + '.',
      opciones: [{ texto: 'Verdadero', codigo: e5.verdad ? null : 'EQUIV_MAL_ESCALADA' }, { texto: 'Falso', codigo: e5.verdad ? 'IGUALDAD_NO_DETECTADA' : null }],
      explicacion: e5.k + '/' + e5.b + (e5.verdad ? ' = ' : ' no es igual a ') + e5.j + '/' + e5.c + '. Dibujalas en tiras del mismo largo y compará.', dibujo: { tira: fr(e5.k, e5.b) } });
    return az.mezclar(out.filter(function (q) { return q && q.opciones; }));
  }

  GEN.comparar = COMPARAR; GEN.falta = FALTA; GEN.potes = POTESV; GEN.repaso = { preguntas: preguntasRepaso };
  GEN.fracAzar = fracAzar; GEN.sinTresSeguidos = sinTresSeguidos; GEN.VERSION2 = '1.0.0';
  if (req) module.exports = GEN;
})(typeof window !== 'undefined' ? window : this);
