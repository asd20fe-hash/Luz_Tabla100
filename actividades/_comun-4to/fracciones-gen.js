/* Fracciones de 4to — generadores de ítems, validadores y pistas (lógica pura, sin DOM).
   Patrón UMD sin módulos: window.REF4_FRGEN. Versión 1.0.0 (2026-10-13). Depende de REF4_FR y REF4_FIG.
   Este archivo: piezas comunes + Repartos (A1), Partes iguales (A2) y Muro (A3).
   fracciones-gen-2.js agrega ¿Cuál es más? (A4), ¿Cuánto falta? (A5), Potes y vasos (A6) y el Repaso (A7).
   Cada actividad expone {tipos(nivel), ronda(nivel), generar(nivel, tipo, az, ses), armar[tipo](params, nivel, az)} y sus validadores. */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var req = typeof module !== 'undefined' && module.exports;
  var FR = req ? require('./fracciones-lib.js') : root.REF4_FR, FIG = req ? require('./fracciones-figuras.js') : root.REF4_FIG;
  var fr = FR.fr, T = FR.deTexto, fmt = FR.formatear;

  /* ==================== comunes ==================== */
  var NOMBRES = ['Sofi', 'Tomi', 'Juli', 'Mateo', 'Valen', 'Lucas', 'Cami', 'Benja', 'Martina', 'Santi', 'Lola', 'Joaco', 'Mía', 'Thiago', 'Emma', 'Bauti'];
  function nombres(az, k) { return az.mezclar(NOMBRES).slice(0, k); }
  function txt(f) { return fmt(f); }
  function mix(f) { return fmt(f, { mixto: true }); }
  function rellenar(plantilla, datos) { return plantilla.replace(/\{(\w+)\}/g, function (_, k) { return datos[k] === undefined ? '{' + k + '}' : datos[k]; }); }
  // Opciones de opción múltiple: [{valor (fracción), codigo|null}] con valores distintos; la correcta primero, después se mezcla.
  function opcionesDistintas(correcta, distractores, az, cuantas) {
    var out = [{ f: correcta, codigo: null }];
    distractores.forEach(function (d) {
      if (!d || !d.f || out.length >= cuantas) return;
      if (d.f.n < 0 || d.f.d <= 0) return;
      if (out.some(function (o) { return FR.iguales(o.f, d.f); })) return;
      out.push(d);
    });
    return out.length === cuantas ? az.mezclar(out) : null;
  }
  // "¿Qué aprendiste?" (Anexo B). La primera opción es la correcta.
  var APRENDISTE = {
    repartos: [{ frase: 'Para repartir lo que sobra, tengo que…', opciones: ['cortar cada uno de los que sobran en tantas partes como personas', 'dárselo al primero', 'sumarlo a los enteros'] },
               { frase: '7/4 es lo mismo que…', opciones: ['1 entero y 3/4', '7 enteros y 4', '4/7'] }],
    partes: [{ frase: 'Para saber qué fracción está pintada, tengo que…', opciones: ['ver en cuántas partes iguales está partido el entero y cuántas están pintadas', 'contar los pedazos, aunque sean distintos', 'contar solo los pintados'] },
             { frase: 'Si conozco 3/4 de una figura, para dibujarla entera…', opciones: ['la parto en 3, cada parte es 1/4, y le agrego una más', 'la repito 4 veces', 'le agrego 3 partes más'] }],
    muro: [{ frase: 'Para buscar una fracción equivalente, tengo que…', opciones: ['partir cada parte en 2 o en más, o sea, multiplicar arriba y abajo por el mismo número', 'sumar 1 arriba y abajo', 'multiplicar solo el de abajo'] }],
    comparar: [{ frase: 'Para comparar fracciones de distinto denominador, tengo que…', opciones: ['pasarlas a partes del mismo tamaño y ver cuál tiene más', 'ver cuál tiene el número de abajo más grande', 'sumar el de arriba y el de abajo'] },
               { frase: 'Si dos fracciones tienen el mismo numerador, es mayor…', opciones: ['la de denominador más chico', 'la de denominador más grande', 'ninguna, porque son iguales'] },
               { frase: 'Una fracción es mayor que un entero cuando…', opciones: ['el numerador es mayor que el denominador', 'el denominador es mayor que el numerador', 'tiene números grandes'] }],
    'cuanto-falta': [{ frase: 'Para sumar o restar fracciones de distinto denominador, tengo que…', opciones: ['pasarlas a fracciones equivalentes con el mismo denominador', 'sumar los de arriba y los de abajo', 'sumar solo los de arriba'] },
                     { frase: 'Para saber cuánto falta para el entero, tengo que…', opciones: ['ver cuántas partes faltan para tenerlas todas', 'sumar la fracción dos veces', 'restarle 1 al numerador'] }],
    'potes-vasos': [{ frase: 'Dos potes de 1/4 kg pesan lo mismo que…', opciones: ['uno de 1/2 kg', 'uno de 1 kg', 'uno de 1/8 kg'] }]
  };

  /* ==================== A1. Repartos ==================== */
  var CTX = {
    chocolates: { cosa: 'chocolate', cosas: 'chocolates', fem: false, parte: true, forma: 'barra' },
    pizzas: { cosa: 'pizza', cosas: 'pizzas', fem: true, parte: true, forma: 'redondo' },
    alfajores: { cosa: 'alfajor', cosas: 'alfajores', fem: false, parte: true, forma: 'redondo' },
    muffins: { cosa: 'muffin', cosas: 'muffins', fem: false, parte: true, forma: 'redondo' },
    turrones: { cosa: 'turrón', cosas: 'turrones', fem: false, parte: true, forma: 'barra' },
    tortas: { cosa: 'torta', cosas: 'tortas', fem: true, parte: true, forma: 'redondo' },
    helado: { cosa: 'kilo de helado', cosas: 'kilos de helado', fem: false, parte: true, forma: 'pote', unidad: 'kg', reciben: 'potes', recibe: 'pote' },
    jugo: { cosa: 'litro de jugo', cosas: 'litros de jugo', fem: false, parte: true, forma: 'botella', unidad: 'l', reciben: 'botellas', recibe: 'botella' },
    figuritas: { cosa: 'figurita', cosas: 'figuritas', fem: true, parte: false, forma: 'figurita' },
    pelotas: { cosa: 'pelota', cosas: 'pelotas', fem: true, parte: false, forma: 'pelota' },
    lapices: { cosa: 'lápiz', cosas: 'lápices', fem: false, parte: false, forma: 'lapiz' }
  };
  var COMIDA = ['chocolates', 'pizzas', 'alfajores', 'muffins', 'turrones', 'tortas'], MEDIDA = ['helado', 'jugo'], ENTEROS = ['figuritas', 'pelotas', 'lapices'];

  function enunciadoReparto(it) {
    var c = it.ctx, N = it.N, M = it.M;
    if (c.unidad) return 'Hay ' + N + ' ' + c.unidad + ' de ' + (c.unidad === 'kg' ? 'helado' : 'jugo') + ' para repartir en partes iguales en ' + M + ' ' + c.reciben + '. ¿Cuánto va en cada ' + c.recibe + '?';
    return 'Hay ' + N + ' ' + (N === 1 ? c.cosa : c.cosas) + ' para repartir en partes iguales entre ' + M + ' chicos: ' + it.nombres.join(', ') + '. ¿Cuánto le toca a cada uno?';
  }
  function armarReparto(tipo, p, nivel, az) {
    var ctxId = p.ctx || 'chocolates', c = CTX[ctxId], N = p.N, M = p.M, q = Math.floor(N / M), r = N - q * M;
    var it = { tipo: tipo, tema: c.unidad ? 'medidas' : 'reparto', N: N, M: M, q: q, r: r, ctxId: ctxId, ctx: c,
      nombres: c.reciben ? Array.apply(null, Array(M)).map(function (_, i) { return (c.recibe === 'pote' ? 'Pote ' : 'Botella ') + (i + 1); }) : nombres(az, M),
      info: { N: N, M: M, q: q, r: r, contexto: ctxId, parte: c.parte } };
    it.texto = enunciadoReparto(it);
    it.esperado = c.parte ? FR.simplificar(fr(N, M)) : fr(q, 1);
    it.cortesValidos = []; for (var k = 2; k <= 8; k++) if (r > 0 && (r * k) % M === 0) it.cortesValidos.push(k);
    if (tipo === 'R1') {
      it.modoEnteros = nivel === 1 ? 'vuelta' : 'escribir';
      it.otraForma = nivel >= 2 && c.parte && q > 0 && r > 0 && (p.otraForma !== undefined ? p.otraForma : az.prob(0.4));
      it.frase = nivel >= 3 && c.parte && r > 0;
      it.verDibujo = nivel < 3;
    }
    if (tipo === 'R3') { it.forma = p.forma || (az.prob(0.5) ? 'dibujo' : 'cuenta'); it.problemas = opcionesProblema(it, az); it.opciones = opcionesReparto(it, az, p.opciones); }
    if (tipo === 'R4') it.opciones = opcionesReparto(it, az, p.opciones);
    if (it.frase) it.frases = frasesUnidad(it, az);
    return it;
  }
  // Opciones de R3/R4: N/M (o su mixto), M/N (INVERTIDA), el cociente (RESTO_IGNORADO), cociente + r/N (RESTO_MAL_PARTIDO).
  function opcionesReparto(it, az, dadas) {
    var N = it.N, M = it.M, q = it.q, r = it.r;
    if (dadas) return az.mezclar(dadas.map(function (s) { var f = T(s); return { f: f, codigo: FR.clasificar('reparto', { N: N, M: M }, f), texto: s }; }));
    var ok = fr(N, M), mostrarMixto = az.prob(0.5) && q > 0;
    var o = opcionesDistintas(ok, [{ f: fr(M, N), codigo: 'INVERTIDA' }, { f: fr(q, 1), codigo: 'RESTO_IGNORADO' }, { f: FR.deMixto(q, r, N), codigo: 'RESTO_MAL_PARTIDO' }], az, 4);
    return o && o.map(function (x) { return { f: x.f, codigo: x.codigo, texto: (x.codigo === null && mostrarMixto) || x.codigo === 'RESTO_MAL_PARTIDO' ? mix(x.f) : txt(x.f) }; });
  }
  function opcionesProblema(it, az) {
    var c = it.ctx, N = it.N, M = it.M, otroN = N + az.elegir([1, 2, -1].filter(function (x) { return N + x > 0 && N + x !== M; }));
    function t(n, m) { return c.unidad ? n + ' ' + c.unidad + ' de ' + (c.unidad === 'kg' ? 'helado' : 'jugo') + ' en ' + m + ' ' + c.reciben : n + ' ' + (n === 1 ? c.cosa : c.cosas) + ' entre ' + m + ' chicos'; }
    return az.mezclar([{ texto: 'Se reparten ' + t(N, M) + '.', ok: true, codigo: null }, { texto: 'Se reparten ' + t(M, N) + '.', ok: false, codigo: 'INVERTIDA' },
      { texto: 'Se reparten ' + t(otroN, M) + '.', ok: false, codigo: 'OTRO' }]);
  }
  function frasesUnidad(it, az) {
    var c = it.ctx, v = mix(it.esperado), u = c.unidad || '';
    var bien = 'A cada uno le toca ' + v + (u ? ' ' + u : ' ' + (FR.comparar(it.esperado, fr(1, 1)) > 0 ? c.cosas : c.cosa)) + '.';
    var malU = 'A cada uno le toca ' + v + (u ? (u === 'kg' ? ' l' : ' kg') : ' chicos') + '.';
    var malI = 'A cada uno le toca ' + txt(fr(it.M, it.N)) + (u ? ' ' + u : ' ' + c.cosa) + '.';
    return az.mezclar([{ texto: bien, codigo: null }, { texto: malU, codigo: 'UNIDAD' }, { texto: malI, codigo: 'INVERTIDA' }]);
  }
  var REPARTOS = {
    tipos: function (n) { return n === 1 ? ['R1'] : (n === 2 ? ['R1', 'R2', 'R4'] : ['R1', 'R2', 'R3', 'R4']); },
    ronda: function (n) { return n >= 3 ? 4 : 3; },
    CTX: CTX,
    generar: function (nivel, tipo, az, ses) {
      ses = ses || {}; ses.usados = ses.usados || {};
      for (var intento = 0; intento < 200; intento++) {
        var M, q, r, ctxId;
        if (nivel === 1) M = az.elegir([2, 4]); else if (nivel === 2) M = az.elegir([2, 4, 8]); else M = az.prob(0.2) ? 3 : az.elegir([2, 4, 8]);
        if (M === ses.ultimoM && intento < 150) continue;
        var indivisible = nivel === 3 && (tipo === 'R1' || tipo === 'R2') && az.prob(0.25);
        if (nivel === 1) { r = az.prob(0.8) ? az.entero(1, M - 1) : 0; q = az.entero(1, Math.floor((12 - r) / M)); }
        else if (nivel === 2) { if (az.prob(0.2) && tipo !== 'R4') { q = 0; r = az.entero(2, M - 1); } else { r = az.entero(0, M - 1); q = az.entero(1, Math.floor((20 - r) / M)); } }
        else { r = az.entero(indivisible ? 1 : 0, M - 1); q = az.entero(1, Math.min(5, Math.floor((30 - r) / M))); }
        if (tipo === 'R4' || tipo === 'R3') { if (r === 0) r = 1; if (q === 0) q = 1; if (r >= M) continue; }
        var N = q * M + r;
        if (N < 2 || (nivel === 1 && (N < 3 || N > 12)) || (nivel === 2 && N > 20) || N > 30 || ses.usados[N + '/' + M]) continue;
        if (indivisible) ctxId = az.elegir(ENTEROS);
        else if (nivel >= 2 && az.prob(0.35)) ctxId = az.elegir(MEDIDA);
        else ctxId = az.elegir(COMIDA);
        var it = armarReparto(tipo, { N: N, M: M, ctx: ctxId }, nivel, az);
        if ((tipo === 'R4' || tipo === 'R3') && !it.opciones) continue;
        ses.usados[N + '/' + M] = true; ses.ultimoM = M;
        return it;
      }
      return armarReparto(tipo, { N: 9, M: 2, ctx: 'chocolates' }, nivel, az);
    },
    armar: { R1: function (p, n, az) { return armarReparto('R1', p, n, az); }, R2: function (p, n, az) { return armarReparto('R2', p, n, az); },
             R3: function (p, n, az) { return armarReparto('R3', p, n, az); }, R4: function (p, n, az) { return armarReparto('R4', p, n, az); } },
    // Paso a: cuántos enteros recibe cada uno.
    validarEnteros: function (it, x) { return x === it.q ? { ok: true } : { ok: false, codigo: x > it.q ? 'VUELTA_DE_MAS' : 'RESTO_MAYOR' }; },
    validarSobra: function (it, x) { return x === it.r ? { ok: true } : { ok: false, codigo: 'OTRO' }; },
    cortaParejo: function (it, k) { return k >= 2 && k <= 8 && (it.r * k) % it.M === 0; },
    validarRespuesta: function (it, f) {
      if (!it.ctx.parte) return FR.iguales(f, fr(it.q, 1)) ? { ok: true } : { ok: false, codigo: FR.iguales(f, fr(it.N, it.M)) ? 'PARTIR_INDIVISIBLE' : (FR.iguales(f, fr(it.M, it.N)) ? 'INVERTIDA' : 'OTRO') };
      var c = FR.clasificar('reparto', { N: it.N, M: it.M }, f); return c ? { ok: false, codigo: c } : { ok: true };
    },
    // "¿Y escrito como una sola fracción?" (o como entero y fracción): mismo valor y la forma pedida.
    validarOtraForma: function (it, f, forma, pedida) { return FR.iguales(f, it.esperado) && forma === pedida ? { ok: true } : { ok: false, codigo: 'MIXTO' }; },
    pista: function (codigo, it, extra) {
      extra = extra || {};
      var d = { r: extra.quedan !== undefined ? extra.quedan : it.r, M: it.M, q: it.q, k: extra.k || it.M, rk: (it.r * (extra.k || it.M)), qM: it.q * it.M, x: extra.x || '', cosa: it.ctx.cosa, cosas: it.ctx.cosas };
      var P = {
        VUELTA_DE_MAS: 'Quedan {r} y son {M}: no alcanza para darle uno más a cada uno.', RESTO_MAYOR: 'Quedan {r} y son {M}. ¡Alcanza para otra vuelta!',
        CORTE_INVALIDO: 'Cortando en {k} salen {rk} pedacitos. ¿Se reparten parejo entre {M}? Probá cortar en {M}.', RESTO_IGNORADO: '¿Y lo que sobró? Si se puede partir, también se reparte.',
        RESTO_MAL_PARTIDO: 'Cada pedacito es 1/{k}, porque cortaste en {k}. ¿Cuántos pedacitos le tocaron a cada uno?', INVERTIDA: 'Abajo va en cuántas partes cortaste cada uno; arriba, cuántos pedacitos recibe cada uno.',
        PARTIR_INDIVISIBLE: '¿Media {cosa} sirve? Hay cosas que no se parten.', MIXTO: '1 entero son {M}/{M}. {q} enteros son {qM}/{M}. Sumale {r}/{M}.', UNIDAD: '¿{x} qué? ¿Pizzas, kilos, litros?',
        SOBRA: 'Repartiste {qM}. ¿Cuántos quedan en la mesa?'
      };
      return rellenar(P[codigo] || 'Mirá el dibujo y probá otra vez.', d);
    }
  };

  /* ==================== A2. Partes iguales ==================== */
  // Figuras de partes iguales con d partes (para pintar k).
  function figIguales(d, az, evitar) {
    var op = { 2: ['tiras', 'circulo', 'cuadricula21'], 3: ['tiras', 'circulo', 'cuadricula31'], 4: ['tiras', 'circulo', 'cuadricula22', 'cuadrado4', 'triangulo4', 'L4', 'T4'],
      6: ['tiras', 'circulo', 'cuadricula32', 'escalera6'], 8: ['tiras', 'circulo', 'cuadricula42', 'cuadrado8', 'L8', 'cruz8'], 9: ['triangulo9', 'cuadricula33'] }[d] || ['tiras'];
    var cand = op.filter(function (x) { return x !== evitar; }), t = az.elegir(cand.length ? cand : op);
    var f = { tiras: function () { return FIG.tiras(d, { horizontal: az.prob(0.3) }); }, circulo: function () { return FIG.circulo(d); }, cuadricula21: function () { return FIG.cuadricula(2, 1); },
      cuadricula31: function () { return FIG.cuadricula(3, 1); }, cuadricula22: function () { return FIG.cuadricula(2, 2); }, cuadricula32: function () { return FIG.cuadricula(3, 2); },
      cuadricula42: function () { return FIG.cuadricula(4, 2); }, cuadricula33: function () { return FIG.cuadricula(3, 3); }, cuadrado4: function () { return FIG.cuadradoDiagonales(4); },
      cuadrado8: function () { return FIG.cuadradoDiagonales(8); }, triangulo4: function () { return FIG.triangulo(4); }, triangulo9: function () { return FIG.triangulo(9); },
      L4: function () { return FIG.poliomino('L4'); }, T4: function () { return FIG.poliomino('T4'); }, escalera6: function () { return FIG.poliomino('escalera6'); },
      L8: function () { return FIG.poliomino('L8'); }, cruz8: function () { return FIG.poliomino('cruz8'); } }[t]();
    f.clave = t;
    return f;
  }
  // Figuras del módulo por nombre: 'cuarto_escondido', 'cuadricula_4_1' (4 cuadrados, 1 pintado), 'triangulo_9_3', 'tiras_4_2', 'cuadricula_8_4'.
  function figDeSpec(s) {
    var m = /^(\w+?)_(\d+)_(\d+)$/.exec(s);
    if (s === 'cuarto_escondido') return FIG.cuartoEscondido();
    var base = { cuadricula: function (n) { return n === 4 ? FIG.cuadricula(2, 2) : FIG.cuadricula(4, 2); }, triangulo: function (n) { return FIG.triangulo(n); }, tiras: function (n) { return FIG.tiras(n); } }[m[1]](+m[2]);
    return FIG.pintar(base, base.regiones.slice(0, +m[3]).map(function (r) { return r.id; }));
  }
  function itemP1(fig, nivel) {
    var f = FIG.fraccionPintada(fig), parts = f.n * fig.partes / f.d;
    return { tipo: 'P1', tema: 'partes', fig: fig, esperado: f, p: parts, n: fig.partes, piezas: fig.regiones.length, piezasPintadas: fig.pintadas.length,
      info: { fig: fig.tipo, piezas: fig.regiones.length, iguales: fig.iguales, esperado: txt(f) } };
  }
  // Trampas: 1 de n pintada con partes desiguales (parece 1/n y no es).
  function trampaDesigual(d, az) {
    var t = { 2: [function () { return FIG.pintar(FIG.tiras([1, 2]), ['r0']); }, function () { return FIG.pintar(FIG.circulo(0, [135, 225]), ['r0']); }],
      3: [function () { return FIG.pintar(FIG.tiras([1, 1, 2]), ['r0']); }, function () { return FIG.pintar(FIG.circulo(0, [90, 90, 180]), ['r0']); }],
      4: [function () { return FIG.pintar(FIG.tiras([1, 1, 1, 3]), ['r0']); }, function () { return FIG.pintar(FIG.circulo(0, [45, 45, 90, 180]), ['r0']); }, function () { return FIG.pintar(FIG.tiras([2, 1, 1, 2], { horizontal: true }), ['r1']); }] }[d];
    return az.elegir(t)();
  }
  // Correctas "raras" para un objetivo (no se ven como 1 de n iguales).
  function correctaRara(obj, az) {
    var o = txt(obj), lista = {
      '1/4': [FIG.cuartoEscondido, function () { return FIG.pintar(FIG.igualArea(), ['r1']); }, function () { return FIG.pintar(FIG.circulo(0, [90, 90, 180]), ['r1']); }],
      '1/2': [function () { return FIG.pintar(FIG.rombo(), ['r0']); }, function () { return FIG.pintar(FIG.tiras([2, 1, 1]), ['r0']); }, function () { return FIG.pintar(FIG.circulo(0, [90, 90, 180]), ['r2']); }],
      '1/3': [function () { return FIG.pintar(FIG.triangulo(9), ['r0', 'r1', 'r2']); }, function () { return FIG.pintar(FIG.cuadricula(3, 2), ['r0', 'r3']); }]
    }[o];
    return lista ? az.elegir(lista)() : null;
  }
  function armarP3(obj, nivel, az, figsDadas) {
    var figs;
    if (figsDadas) figs = figsDadas.map(function (s) { var g = figDeSpec(s), v = FIG.fraccionPintada(g); return { fig: g, correcta: FR.iguales(v, obj), trampa: s === 'cuarto_escondido' ? 'escondido' : (g.iguales ? (FR.iguales(v, obj) ? null : 'otra') : 'desigual') }; });
    else {
      var nOk = az.entero(1, 3), out = [], usados = {};
      for (var i = 0; i < nOk; i++) {
        var g = null;
        if (nivel >= 2 && i === 0 && az.prob(0.6)) g = correctaRara(obj, az);
        if (!g) { var k = az.elegir([1, 2, obj.d === 4 ? 2 : 1]); var base = figIguales(obj.d * k, az, null); if (usados[base.clave]) { base = figIguales(obj.d * k, az, base.clave); } usados[base.clave] = true; g = FIG.pintarFraccion(base, obj, az); }
        out.push({ fig: g, correcta: true, trampa: g.tipo === 'cuarto_escondido' ? 'escondido' : null });
      }
      out.push({ fig: trampaDesigual(obj.d, az), correcta: false, trampa: 'desigual' });
      while (out.length < 4) {
        var otra = az.elegir([fr(1, 2), fr(1, 3), fr(1, 4), fr(3, 4), fr(2, 3)].filter(function (x) { return !FR.iguales(x, obj); }));
        var b2 = figIguales(otra.d * (otra.d <= 3 ? 2 : 1), az, null), p2 = FIG.pintarFraccion(b2, otra, az);
        if (p2) out.push({ fig: p2, correcta: false, trampa: 'otra' });
      }
      figs = az.mezclar(out);
    }
    return { tipo: 'P3', tema: 'partes', objetivo: obj, figs: figs, info: { objetivo: txt(obj), figs: figs.map(function (x) { return x.fig.tipo + (x.correcta ? '+' : '-'); }) } };
  }
  function armarP4(p, nivel, az) {
    var a = p.a, b = p.b, u = p.u, L = a * u, E = b * u;
    var it = { tipo: 'P4', tema: 'entero', a: a, b: b, u: u, L: L, entero: E, parte: fr(a, b), modo: p.modo || (nivel === 1 ? 'elegir' : 'estirar'),
      info: { a: a, b: b, u: u, largo: L, entero: E } };
    if (it.modo === 'elegir' || it.modo === 'figura') {
      var cand = [E, b * L, L + u, E + u, E - u, 2 * L].filter(function (x, i, arr) { return x > L && x <= 16 && arr.indexOf(x) === i; });
      var ops = [E].concat(cand.filter(function (x) { return x !== E; }).slice(0, 2));
      it.opciones = az.mezclar(ops.map(function (x) { return { largo: x, codigo: x === E ? null : (x === b * L && a > 1 ? 'ENTERO_IGNORA_NUMERADOR' : 'ENTERO_OTRO') }; }));
      if (it.opciones.length < 3) return null;
    }
    return it;
  }
  var PARTES = {
    tipos: function (n) { return ['P1', 'P2', 'P3', 'P4']; },
    ronda: function () { return 6; },
    figIguales: figIguales, figDeSpec: figDeSpec, trampaDesigual: trampaDesigual,
    generar: function (nivel, tipo, az, ses) {
      ses = ses || {}; var pe = ses.pesosErr || {};
      for (var intento = 0; intento < 60; intento++) {
        var it = null;
        if (tipo === 'P1') {
          var g;
          if (nivel === 3 && az.prob(pe.CUENTA_PARTES ? 0.75 : 0.55)) {
            g = az.elegir([FIG.cuartoEscondido, function () { return FIG.pintar(FIG.igualArea(), az.elegir([['r0'], ['r1', 'r3'], ['r0', 'r1', 'r2']])); },
              function () { return FIG.pintar(FIG.rombo(), az.elegir([['r0'], ['r1', 'r2'], ['r0', 'r3']])); }, function () { return FIG.pintar(FIG.circulo(0, [90, 90, 180]), az.elegir([['r0'], ['r2'], ['r0', 'r2']])); },
              function () { return FIG.pintar(FIG.tiras([2, 1, 1]), az.elegir([['r0'], ['r1'], ['r0', 'r2']])); }, function () { return FIG.pintar(FIG.circulo(0, [45, 45, 90, 180]), az.elegir([['r0', 'r1'], ['r2'], ['r3']])); }])();
          } else {
            var d = az.elegir(nivel === 1 ? [2, 4, 8] : [2, 3, 4, 6, 8]), base = figIguales(d, az, ses.ultimoFig);
            var k = az.entero(1, d - 1); g = FIG.pintar(base, az.mezclar(base.regiones.map(function (r) { return r.id; })).slice(0, k)); g.clave = base.clave;
          }
          if (g.clave && g.clave === ses.ultimoFig) continue;
          ses.ultimoFig = g.clave || g.tipo; it = itemP1(g, nivel);
        } else if (tipo === 'P2') {
          var obj, fig;
          if (nivel === 1) { obj = az.elegir([fr(1, 2), fr(1, 4)]); fig = figIguales(az.elegir(obj.d === 2 ? [2, 4, 8] : [4, 8]), az, ses.ultimoFig); }
          else if (nivel === 2) { obj = az.elegir([fr(1, 2), fr(1, 4), fr(3, 4), fr(1, 3), fr(2, 3), fr(3, 8), fr(5, 8)]); fig = figIguales(obj.d * (obj.d === 8 ? 1 : az.elegir([1, 2])), az, ses.ultimoFig); }
          else { var cas = az.elegir([[FIG.rombo, fr(1, 2)], [FIG.igualArea, fr(1, 2)], [FIG.igualArea, fr(3, 4)], [function () { return FIG.circulo(0, [90, 90, 180]); }, fr(3, 4)], [function () { return FIG.tiras([2, 1, 1]); }, fr(1, 4)], [function () { return FIG.cuadradoDiagonales(8); }, fr(3, 4)]]); fig = cas[0](); obj = cas[1]; }
          if (fig.clave && fig.clave === ses.ultimoFig) continue;
          if (!FIG.pintarFraccion(fig, obj, az)) continue;
          ses.ultimoFig = fig.clave || fig.tipo;
          it = { tipo: 'P2', tema: 'partes', fig: fig, objetivo: obj, palabras: nivel === 1 ? (obj.d === 2 ? 'la mitad' : 'la mitad de la mitad') : null,
            info: { fig: fig.tipo, piezas: fig.regiones.length, iguales: fig.iguales, objetivo: txt(obj) } };
        } else if (tipo === 'P3') {
          it = armarP3(az.elegir(nivel === 1 ? [fr(1, 2), fr(1, 4)] : [fr(1, 2), fr(1, 3), fr(1, 4)]), nivel, az);
        } else {
          var ab = nivel === 1 ? az.elegir([[1, 2], [1, 4]]) : (nivel === 2 ? az.elegir([[1, 2], [1, 3], [1, 4]]) : az.elegir([[3, 4], [2, 3], [3, 4], [1, 3]]));
          var u = az.entero(1, Math.floor(12 / ab[1])); if (ab[0] * u < 1) continue;
          it = armarP4({ a: ab[0], b: ab[1], u: u, modo: nivel === 3 && az.prob(0.35) ? 'figura' : null }, nivel, az);
        }
        if (it) return it;
      }
      return itemP1(FIG.pintar(FIG.tiras(4), ['r0']), nivel);
    },
    armar: {
      P1: function (p) { return itemP1(figDeSpec(p.fig), 2); },
      P3: function (p, n, az) { return armarP3(T(p.objetivo), n, az, p.figs); },
      P4: function (p, n, az) { return armarP4({ a: p.a, b: p.b, u: p.u }, n, az); }
    },
    validarP1: function (it, f) { var c = FR.clasificar('parte', { p: it.p, n: it.n, piezas: it.piezas, piezasPintadas: it.piezasPintadas }, f); return c ? { ok: false, codigo: c } : { ok: true }; },
    validarP2: function (it, ids) { var g = FIG.pintar(it.fig, ids), v = FIG.fraccionPintada(g); return FR.iguales(v, it.objetivo) ? { ok: true } : { ok: false, codigo: 'PINTADO', pintadas: v.n * it.fig.partes / v.d }; },
    // Gana el más específico: PARTES_DESIGUALES (marcó una trampa desigual) > CUENTA_PARTES (no marcó un cuarto escondido) > OTRO.
    validarP3: function (it, marcadas) {
      var desig = false, esc = false, otro = false;
      it.figs.forEach(function (x, i) {
        var m = marcadas.indexOf(i) >= 0;
        if (m === x.correcta) return;
        if (m && x.trampa === 'desigual') desig = true; else if (!m && x.trampa === 'escondido') esc = true; else otro = true;
      });
      var c = desig ? 'PARTES_DESIGUALES' : (esc ? 'CUENTA_PARTES' : (otro ? 'OTRO' : null));
      return c ? { ok: false, codigo: c } : { ok: true };
    },
    validarP4: function (it, largo) { return largo === it.entero ? { ok: true } : { ok: false, codigo: largo === it.b * it.L && it.a > 1 ? 'ENTERO_IGNORA_NUMERADOR' : 'ENTERO_OTRO' }; },
    pista: function (codigo, it, extra) {
      extra = extra || {};
      var d = { b: it.b, a: it.a, total: it.fig ? it.fig.partes : '', x: extra.pintadas, fraccion: it.objetivo ? txt(it.objetivo) : '', esperado: it.objetivo && it.fig ? it.objetivo.n * it.fig.partes / it.objetivo.d : '' };
      var P = {
        CUENTA_PARTES: 'Contaste pedazos, pero ¿son todos del mismo tamaño? Tocá "Ver cuadrícula" y contá cuadraditos.',
        PARTE_PARTE: 'Abajo va en cuántas partes iguales está partido todo el entero: las pintadas y las sin pintar.', INVERTIDA: 'Arriba van las partes pintadas; abajo, todas las partes.',
        PARTES_DESIGUALES: 'Para que sea esa fracción, la parte pintada tiene que entrar justo esa cantidad de veces en la figura. ¿Entra?',
        PINTADO: 'Pintaste {x} de {total} partes. {fraccion} de {total} partes son {esperado} partes.',
        ENTERO_IGNORA_NUMERADOR: 'Esta cinta no es 1/{b}: son {a} partes de 1/{b}. Partila en {a}, mirá cuánto mide una y armá las {b}.',
        ENTERO_OTRO: 'Si esta cinta es {a}/{b}, partila en {a}: cada pedazo es 1/{b}. El entero son {b} pedazos así.', OTRO: 'Mirá bien el tamaño de cada parte. ¿Probás de nuevo?'
      };
      if (codigo === 'ENTERO_OTRO' && it.a === 1) return rellenar('Si esta cinta es 1/{b}, el entero son {b} cintas como esta.', d);
      return rellenar(P[codigo] || P.OTRO, d);
    }
  };

  /* ==================== A3. Muro de fracciones ==================== */
  var VALORES_MURO = { 1: ['1/2', '1/4', '3/4', '1'], 2: ['1/2', '1/4', '3/4', '1', '3/2', '5/4', '1/8', '3/8', '5/8'], 3: ['1/2', '1/4', '3/4', '3/2', '5/4', '7/4', '3/8', '5/8', '7/8', '1/8', '2'] };
  function denesMuro(n) { return n === 3 ? [2, 4, 8, 16] : [2, 4, 8]; }
  function equivalenteDe(f, dMax, az) { // otra escritura con denominador mayor (multiplicando arriba y abajo)
    var ks = [2, 4, 8].filter(function (k) { return f.d * k <= dMax; });
    if (!ks.length) return null; var k = az.elegir(ks); return fr(f.n * k, f.d * k);
  }
  function armarE3(f, fichasDadas, nivel, az) {
    var fichas;
    if (fichasDadas) fichas = fichasDadas.map(function (s) { var g = T(s); return { f: g, codigo: FR.clasificar('equivalente', { f: f }, g) }; });
    else {
      var dMax = nivel === 3 ? 16 : 8, eq = [], d1 = equivalenteDe(f, dMax, az); if (d1) eq.push({ f: d1, codigo: null });
      var d2 = equivalenteDe(f, dMax, az); if (d2 && !eq.some(function (e) { return FR.identicas(e.f, d2); })) eq.push({ f: d2, codigo: null });
      if (!eq.length || az.prob(0.3)) { var s = FR.simplificar(f); if (!FR.identicas(s, f)) eq.push({ f: s, codigo: null }); }
      var k = az.elegir([2, 4]), j = k === 2 ? 4 : 2;
      var dis = [{ f: fr(f.d, f.n), codigo: 'INVERTIDA' }, { f: fr(f.n + 1, f.d + 1), codigo: 'EQUIV_SUMA' }, { f: fr(f.n * k, f.d * j), codigo: 'EQUIV_MAL_ESCALADA' },
        { f: fr(f.n, f.d * 2), codigo: 'OTRO' }, { f: fr(f.n + 1, f.d), codigo: 'OTRO' }, { f: fr(f.n + 2, f.d + 2), codigo: 'EQUIV_SUMA' }];
      dis = dis.filter(function (x) { return x.f.d <= 16 && x.f.n > 0 && !FR.iguales(x.f, f) && !(x.codigo === 'INVERTIDA' && FR.iguales(x.f, f)); });
      var total = az.entero(4, 6); fichas = eq.slice(0, 2);
      az.mezclar(dis).forEach(function (x) { if (fichas.length < total && !fichas.some(function (y) { return FR.identicas(y.f, x.f); })) fichas.push(x); });
      fichas = az.mezclar(fichas);
    }
    return { tipo: 'E3', tema: 'equivalencias', f: f, fichas: fichas, info: { f: txt(f), fichas: fichas.map(function (x) { return txt(x.f); }) } };
  }
  function armarE4(p, nivel, az) {
    var nom = nombres(az, 2), pl = p.plantilla, it = { tipo: 'E4', tema: 'equivalencias', plantilla: pl, quienes: nom };
    if (pl === 'uno_solo') {
      var f = T(p.f), bien = T(p.bien), mal = T(p.mal), primero = az.prob(0.5);
      it.dichos = primero ? [bien, mal] : [mal, bien];
      it.textos = it.dichos.map(function (x) { return '"' + txt(x) + ' es equivalente a ' + txt(f) + '."'; });
      it.correcta = primero ? 0 : 1;
      var kb = bien.d / f.d;
      it.razones = az.mezclar([{ texto: 'Si partís cada parte de ' + txt(f) + ' en ' + kb + ', quedan ' + txt(bien) + ': arriba y abajo por ' + kb + '.', ok: true },
        { texto: 'Porque ' + txt(mal) + ' tiene el número de abajo más grande.', ok: false }, { texto: 'Porque las dos tienen el mismo número de arriba.', ok: false }]);
      it.info = { plantilla: pl, f: txt(f), bien: txt(bien), mal: txt(mal) };
    } else if (pl === 'los_dos') {
      var a = T(p.a), b = T(p.b);
      it.textos = ['"La parte pintada es ' + txt(a) + ' de la figura."', '"La parte pintada es ' + txt(b) + ' de la figura."']; it.correcta = 2;
      it.fig = FIG.pintar(FIG.tiras(b.d), ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'].slice(0, b.n));
      it.razones = az.mezclar([{ texto: txt(a) + ' y ' + txt(b) + ' nombran la misma cantidad: son equivalentes.', ok: true }, { texto: 'Porque ' + txt(b) + ' tiene más partes, entonces es más.', ok: false },
        { texto: 'Porque ' + txt(a) + ' tiene números más chicos.', ok: false }]);
      it.info = { plantilla: pl, a: txt(a), b: txt(b) };
    } else { // budín: 1 porción de 2 contra 2 de 4 (o los mismos números escalados)
      var x = T(p.a), y = T(p.b);
      it.contexto = 'A ' + nom[0] + ' le dieron ' + x.n + ' ' + (x.n === 1 ? 'porción' : 'porciones') + ' de un budín cortado en ' + x.d + ' partes iguales. A ' + nom[1] + ', ' + y.n + ' porciones de un budín igual cortado en ' + y.d + '.';
      it.textos = ['"Me tocó más a mí, porque mis porciones son más grandes."', '"Nos tocó lo mismo."']; it.correcta = 1;
      it.razones = az.mezclar([{ texto: txt(x) + ' y ' + txt(y) + ' son equivalentes: es la misma cantidad de budín.', ok: true }, { texto: 'Porque ' + nom[1] + ' tiene más porciones.', ok: false },
        { texto: 'Porque las porciones de ' + nom[0] + ' son más grandes.', ok: false }]);
      it.info = { plantilla: pl, a: txt(x), b: txt(y) };
    }
    return it;
  }
  var MURO = {
    tipos: function (n) { return n === 1 ? ['E1', 'E2'] : ['E1', 'E2', 'E3', 'E4', 'E5']; },
    tipoFinal: function () { return 'E6'; },
    ronda: function () { return 6; },
    VALORES: VALORES_MURO, denes: denesMuro,
    generar: function (nivel, tipo, az, ses) {
      ses = ses || {}; var pe = ses.pesosErr || {};
      var vals = VALORES_MURO[nivel].map(T), dMax = nivel === 3 ? 16 : 8;
      for (var intento = 0; intento < 60; intento++) {
        if (tipo === 'E1') {
          var f = az.elegir(vals.filter(function (v) { return FR.comparar(v, fr(1, 1)) <= 0 && v.d < dMax; }));
          var ds = denesMuro(nivel).filter(function (d) { return d > f.d && d % f.d === 0; }); if (!ds.length) continue;
          var pieza = az.elegir(ds);
          return { tipo: 'E1', tema: 'equivalencias', f: f, pieza: pieza, esperado: fr(f.n * pieza / f.d, pieza), guiado: nivel === 1, info: { f: txt(f), pieza: '1/' + pieza } };
        }
        if (tipo === 'E2') {
          var g = az.elegir(vals.filter(function (v) { return v.d < dMax && !FR.esEntero(v); })), dd = [2, 4, 8, 16].filter(function (x) { return x > g.d && x <= dMax && x % g.d === 0; });
          if (!dd.length) continue;
          var D = az.elegir(dd), eqv = fr(g.n * D / g.d, D), hueco = az.elegir(nivel === 1 ? ['num'] : ['num', 'den', 'izq']);
          return { tipo: 'E2', tema: 'equivalencias', f: g, g: eqv, hueco: hueco, verTiras: nivel === 1, esperado: hueco === 'izq' ? g.n : (hueco === 'num' ? eqv.n : eqv.d),
            info: { f: txt(g), g: txt(eqv), hueco: hueco } };
        }
        if (tipo === 'E3') {
          var h = az.elegir(vals.filter(function (v) { return !FR.esEntero(v) && v.d <= 8; })), e3 = armarE3(h, null, nivel, az);
          if (e3.fichas.length < 4 || !e3.fichas.some(function (x) { return !x.codigo; })) continue; // sin equivalente posible con esos denominadores
          return e3;
        }
        if (tipo === 'E4') {
          var pl = az.elegir(pe.JUSTIFICACION ? ['uno_solo', 'uno_solo', 'los_dos', 'budin'] : ['uno_solo', 'los_dos', 'budin']), base = az.elegir([fr(1, 2), fr(1, 4), fr(3, 4)].filter(function (v) { return v.d * 4 <= dMax || v.d * 2 <= dMax; }));
          if (pl === 'uno_solo') { var kk = base.d * 4 <= dMax ? az.elegir([2, 4]) : 2; return armarE4({ plantilla: pl, f: txt(base), bien: txt(fr(base.n * kk, base.d * kk)), mal: txt(fr(base.n * kk, base.d * kk * 2)) }, nivel, az); }
          if (pl === 'los_dos') { var k2 = az.elegir([2, 4].filter(function (k) { return base.d * k <= 8; })); return armarE4({ plantilla: pl, a: txt(base), b: txt(fr(base.n * k2, base.d * k2)) }, nivel, az); }
          var bd = az.elegir([2, 3, 4]), kb = 2; return armarE4({ plantilla: 'budin', a: '1/' + bd, b: kb + '/' + (bd * kb) }, nivel, az);
        }
        if (tipo === 'E5') {
          var b = az.elegir([2, 4, 8].filter(function (x) { return x < dMax; })), c = az.elegir([2, 4, 8, 16].filter(function (x) { return x !== b && x <= dMax; })), k = az.entero(1, Math.min(10, b * 2));
          var verdad = az.prob(0.5), j = (k * c) % b === 0 ? k * c / b : null;
          if (j === null || j > 16 || j < 1) continue;
          if (!verdad) j = j + az.elegir([-1, 1, j]);
          if (j < 1) continue;
          return { tipo: 'E5', tema: 'equivalencias', k: k, b: b, j: j, c: c, verdad: FR.iguales(fr(k, b), fr(j, c)), info: { k: k, b: b, j: j, c: c } };
        }
        if (tipo === 'E6') {
          var usados = [], pares = [];
          az.mezclar(vals.filter(function (v) { return v.d <= 8 && FR.comparar(v, fr(2, 1)) < 0; })).forEach(function (v) {
            if (pares.length >= 4 || usados.some(function (u) { return FR.iguales(u, v); })) return;
            var otra = equivalenteDe(v, 8, az) || FR.simplificar(v); usados.push(v);
            var reps = az.mezclar(['numero', 'tira', 'palabras']);
            pares.push([{ f: v, rep: reps[0] }, { f: FR.identicas(otra, v) ? v : otra, rep: reps[1] }]);
          });
          if (pares.length < 4) continue;
          var cartas = []; pares.forEach(function (p, i) { p.forEach(function (c) { cartas.push({ f: c.f, rep: c.rep, par: i }); }); });
          return { tipo: 'E6', tema: 'equivalencias', cartas: az.mezclar(cartas), info: { pares: pares.map(function (p) { return txt(p[0].f) + '=' + txt(p[1].f); }) } };
        }
      }
      return { tipo: 'E2', tema: 'equivalencias', f: fr(1, 2), g: fr(2, 4), hueco: 'num', verTiras: true, esperado: 2, info: {} };
    },
    armar: {
      E3: function (p, n, az) { return armarE3(T(p.f), p.fichas, n, az); },
      E4: function (p, n, az) { return armarE4(p, n, az); },
      E5: function (p) { return { tipo: 'E5', tema: 'equivalencias', k: p.k, b: p.b, j: p.j, c: p.c, verdad: FR.iguales(fr(p.k, p.b), fr(p.j, p.c)), info: p }; }
    },
    // E2: arma la fracción completa con lo que escribió y la valida (se exige la forma pedida).
    validarE2: function (it, x) {
      var f = it.f, g = it.g, r;
      if (it.hueco === 'num') r = fr(x, g.d); else if (it.hueco === 'den') { if (!x) return { ok: false, codigo: 'OTRO' }; r = fr(g.n, x); } else r = fr(x, f.d);
      if (it.hueco === 'izq') return x === f.n ? { ok: true } : { ok: false, codigo: FR.clasificar('equivalente', { f: g }, r) || 'OTRO' };
      return FR.iguales(r, f) ? { ok: true } : { ok: false, codigo: FR.clasificar('equivalente', { f: f }, r) || 'OTRO' };
    },
    validarE3: function (it, marcadas) {
      var codigo = null;
      it.fichas.forEach(function (x, i) { var m = marcadas.indexOf(i) >= 0; if (m && x.codigo) codigo = codigo || x.codigo; });
      if (!codigo) it.fichas.forEach(function (x, i) { if (!x.codigo && marcadas.indexOf(i) < 0) codigo = codigo || 'IGUALDAD_NO_DETECTADA'; });
      return codigo ? { ok: false, codigo: codigo } : { ok: true };
    },
    validarE5: function (it, dice) { return dice === it.verdad ? { ok: true } : { ok: false, codigo: it.verdad ? 'IGUALDAD_NO_DETECTADA' : 'EQUIV_MAL_ESCALADA' }; },
    pista: function (codigo, it) {
      var d = {};
      if (it.tipo === 'E5') return 'Pensá con las tiras: ' + it.k + ' partes de 1/' + it.b + ' son ' + it.k + '/' + it.b + '. ¿Cuántos 1/' + it.c + ' son lo mismo?';
      var P = {
        EQUIV_MAL_ESCALADA: 'Si partís cada parte en 2, ¿cuántas partes pintadas tenés? Arriba y abajo cambian igual.', EQUIV_SUMA: 'Sumar lo mismo arriba y abajo cambia la cantidad. Probá partir cada parte en 2.',
        INVERTIDA: 'Fijate cuál va arriba: si el de arriba es más grande que el de abajo, ¡es más que un entero!', JUSTIFICACION: 'Elegiste bien, pero fijate el porqué. ¿Qué pasa si las dibujás?',
        IGUALDAD_NO_DETECTADA: 'Hay otra que vale lo mismo. Mirá las tiras: ¿llegan hasta el mismo lugar?', E2: 'Para pasar a partes más chicas, cada parte se parte en 2: el doble de partes y el doble de pintadas.'
      };
      return rellenar(P[codigo] || P.E2, d);
    }
  };

  var api = { VERSION: VERSION, NOMBRES: NOMBRES, nombres: nombres, rellenar: rellenar, opcionesDistintas: opcionesDistintas, APRENDISTE: APRENDISTE,
    repartos: REPARTOS, partes: PARTES, muro: MURO };
  if (req) { module.exports = api; }
  else { root.REF4_FRGEN = api; }
})(typeof window !== 'undefined' ? window : this);
