/* Lengua de 1ro — parte pura (sin DOM): sílabas, comparación de palabras y clasificación de errores de escritura.
   Patrón UMD: window.LENGUA1 en el navegador, require en node. Versión 1.0.0 (2026-10-14). */
(function (root) {
  'use strict';
  var VOCALES = 'AEIOUÁÉÍÓÚÜ', FUERTES = 'AEOÁÉÓÍÚ';   // la débil con tilde (Í, Ú) hace hiato: cuenta como fuerte
  var TRABADAS = ['PR', 'BR', 'TR', 'DR', 'CR', 'GR', 'FR', 'PL', 'BL', 'CL', 'GL', 'FL', 'KR', 'KL'];
  var esVocal = function (c) { return !!c && VOCALES.indexOf(c) >= 0; };

  function mayus(s) { return String(s === undefined || s === null ? '' : s).toUpperCase(); }
  // Sin tildes ni diéresis (la Ñ queda). Para comparar sin castigar las tildes.
  function sinTildes(s) {
    return mayus(s).replace(/[ÁÀ]/g, 'A').replace(/[ÉÈ]/g, 'E').replace(/[ÍÌ]/g, 'I').replace(/[ÓÒ]/g, 'O').replace(/[ÚÙÜ]/g, 'U');
  }
  function limpiar(s) { return sinTildes(s).replace(/[^A-ZÑ0-9]/g, ''); }

  /* ---------- sílabas ---------- */
  // Unidades: CH, LL, RR, QU y GU (antes de E/I) son una consonante; la Y final o antes de consonante es vocal.
  function unidades(U) {
    var u = [], i = 0;
    while (i < U.length) {
      var c = U[i], d = U.substr(i, 2);
      if (d === 'CH' || d === 'LL' || d === 'RR') { u.push({ t: 'C', i: i, n: 2, s: d }); i += 2; continue; }
      if (c === 'Q' && U[i + 1] === 'U') { u.push({ t: 'C', i: i, n: 2, s: 'QU' }); i += 2; continue; }
      if (c === 'G' && U[i + 1] === 'U' && 'EIÉÍ'.indexOf(U[i + 2] || '-') >= 0) { u.push({ t: 'C', i: i, n: 2, s: 'GU' }); i += 2; continue; }
      if (c === 'Y' && i > 0 && !esVocal(U[i + 1])) { u.push({ t: 'V', i: i, n: 1, s: 'I' }); i++; continue; }
      u.push({ t: esVocal(c) ? 'V' : 'C', i: i, n: 1, s: c }); i++;
    }
    return u;
  }
  // silabas('PERRO') → ['PE','RRO'] (respeta mayúsculas/minúsculas del texto original).
  function silabas(palabra) {
    var orig = String(palabra || ''), U = mayus(orig);
    if (!U) return [];
    var u = unidades(U), grupos = [];   // grupos: núcleos (vocales juntas) y consonantes
    u.forEach(function (x, k) {
      var prev = grupos[grupos.length - 1];
      if (x.t === 'V' && prev && prev.t === 'N') {
        var ant = u[k - 1];
        if (!(FUERTES.indexOf(ant.s) >= 0 && FUERTES.indexOf(x.s) >= 0)) { prev.fin = x.i + x.n; return; }   // diptongo
      }
      grupos.push(x.t === 'V' ? { t: 'N', ini: x.i, fin: x.i + x.n } : { t: 'C', ini: x.i, fin: x.i + x.n, s: x.s });
    });
    var nucleos = []; grupos.forEach(function (g, k) { if (g.t === 'N') nucleos.push(k); });
    if (!nucleos.length) return [orig];
    var cortes = [];   // posición del texto donde empieza cada sílaba (menos la primera)
    for (var k = 0; k < nucleos.length - 1; k++) {
      var cs = grupos.slice(nucleos[k] + 1, nucleos[k + 1]), n = cs.length, va;   // va: cuántas consonantes pasan a la sílaba siguiente
      var insep = function (a, b) { return a && b && a.s.length === 1 && b.s.length === 1 && TRABADAS.indexOf(a.s + b.s) >= 0; };
      if (n === 0) va = 0;
      else if (n === 1) va = 1;
      else if (n === 2) va = insep(cs[0], cs[1]) ? 2 : 1;
      else if (n === 3) va = insep(cs[1], cs[2]) ? 2 : 1;
      else va = 2;
      cortes.push(n === 0 ? grupos[nucleos[k + 1]].ini : cs[n - va].ini);
    }
    var out = [], ini = 0;
    cortes.forEach(function (c) { out.push(orig.slice(ini, c)); ini = c; });
    out.push(orig.slice(ini));
    return out.filter(function (s) { return s.length; });
  }

  /* ---------- cómo suena ---------- */
  // fonetica('QUESO') === fonetica('KESO'): misma pronunciación (rioplatense: LL = Y, S = Z = C(E,I), B = V, H muda).
  function fonetica(s) {
    var t = limpiar(s);
    t = t.replace(/CH/g, '1').replace(/H/g, '').replace(/LL/g, 'Y').replace(/RR/g, 'R')
      .replace(/QU([EI])/g, 'K$1').replace(/GU([EI])/g, '2$1').replace(/G([EI])/g, 'J$1').replace(/2/g, 'G')
      .replace(/C([EI])/g, 'S$1').replace(/C/g, 'K').replace(/Z/g, 'S').replace(/V/g, 'B').replace(/W/g, 'B').replace(/X/g, 'KS').replace(/Y$/, 'I');
    return t;
  }
  // Reglas de ortografía: si al aplicarla a las dos palabras quedan más parecidas, ese error está.
  var REGLAS = [
    ['B_V', function (t) { return t.replace(/V/g, 'B'); }],
    ['C_S_Z', function (t) { return t.replace(/C([EI])/g, 'S$1').replace(/Z/g, 'S'); }],
    ['C_K_Q', function (t) { return t.replace(/QU([EI])/g, 'K$1').replace(/C([AOU]|$|[^EIH])/g, 'K$1').replace(/Q/g, 'K'); }],
    ['G_J', function (t) { return t.replace(/G([EI])/g, 'J$1'); }],
    ['LL_Y', function (t) { return t.replace(/LL/g, 'Y'); }],
    ['H_MUDA', function (t) { return t.replace(/CH/g, '1').replace(/H/g, '').replace(/1/g, 'CH'); }],
    ['R_RR', function (t) { return t.replace(/RR/g, 'R'); }]
  ];

  /* ---------- alineación (Damerau-Levenshtein con camino) ---------- */
  function alinear(a, b) {
    var n = a.length, m = b.length, D = [], i, j;
    for (i = 0; i <= n; i++) { D[i] = []; for (j = 0; j <= m; j++) D[i][j] = i === 0 ? j : (j === 0 ? i : 0); }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var c = a[i - 1] === b[j - 1] ? 0 : 1;
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) D[i][j] = Math.min(D[i][j], D[i - 2][j - 2] + 1);
    }
    var ops = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && D[i][j] === D[i - 1][j - 1]) { ops.unshift({ op: 'ok', i: i - 1, j: j - 1 }); i--; j--; }
      else if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && D[i][j] === D[i - 2][j - 2] + 1) { ops.unshift({ op: 'inv', i: i - 2, j: j - 2 }); i -= 2; j -= 2; }
      else if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { ops.unshift({ op: 'cambia', i: i - 1, j: j - 1, a: a[i - 1], b: b[j - 1] }); i--; j--; }
      else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { ops.unshift({ op: 'falta', i: i - 1, j: j, a: a[i - 1] }); i--; }
      else { ops.unshift({ op: 'sobra', i: i, j: j - 1, b: b[j - 1] }); j--; }
    }
    return { dist: D[n][m], ops: ops };
  }

  var PRIORIDAD = ['VACIA', 'OTRA_PALABRA', 'INCOMPLETA', 'INVIERTE', 'ESPEJO', 'OMITE_TRABADA', 'R_RR', 'LL_Y', 'H_MUDA', 'B_V', 'C_S_Z', 'C_K_Q', 'G_J',
    'OMITE_VOCAL', 'OMITE_LETRA', 'AGREGA_LETRA', 'CAMBIA_LETRA'];
  var ERRORES = {
    VACIA: 'No escribió nada', OTRA_PALABRA: 'Escribió otra palabra (muy distinta)', INCOMPLETA: 'Dejó la palabra sin terminar',
    INVIERTE: 'Invirtió el orden de dos letras (LA ↔ AL)', ESPEJO: 'Confundió letras espejo (b/d, p/q)', OMITE_TRABADA: 'Se comió una letra de una trabada (FOR por FLOR)',
    R_RR: 'Confundió R y RR', LL_Y: 'Confundió LL e Y', H_MUDA: 'Le faltó o le sobró la H', B_V: 'Confundió B y V', C_S_Z: 'Confundió C, S y Z', C_K_Q: 'Confundió C, K y QU',
    G_J: 'Confundió G y J', OMITE_VOCAL: 'Se comió una vocal', OMITE_LETRA: 'Se comió una consonante', AGREGA_LETRA: 'Agregó una letra de más', CAMBIA_LETRA: 'Cambió una letra por otra'
  };
  var ESPEJOS = ['BD', 'DB', 'PQ', 'QP'];

  /* clasificar('FLOR', 'FOR', {minus}) → {ok, codigos:[...], primario, dist, marcasEsperado:[ok|mal], marcasRespuesta:[ok|mal]}
     Compara sin tildes. Con varias formas válidas, usar elegirMejor. */
  function clasificar(esperado, respuesta, op) {
    op = op || {};
    var E = limpiar(esperado), R = limpiar(respuesta), al = alinear(E, R);
    var mE = E.split('').map(function () { return 'mal'; }), mR = R.split('').map(function () { return 'mal'; });
    al.ops.forEach(function (o) { if (o.op === 'ok') { mE[o.i] = 'ok'; mR[o.j] = 'ok'; } });
    var res = { ok: E === R, codigos: [], primario: null, dist: al.dist, marcasEsperado: mE, marcasRespuesta: mR };
    if (res.ok) return res;
    var cod = {};
    if (!R) cod.VACIA = 1;
    else if (al.dist > Math.max(2, Math.ceil(E.length * 0.6))) cod.OTRA_PALABRA = 1;
    else {
      REGLAS.forEach(function (r) { if (alinear(r[1](E), r[1](R)).dist < al.dist) cod[r[0]] = 1; });
      var orto = fonetica(E) === fonetica(R);
      if (!orto) {
        if (E.indexOf(R) === 0 && E.length - R.length >= 2) cod.INCOMPLETA = 1;
        al.ops.forEach(function (o) {
          if (o.op === 'inv') cod.INVIERTE = 1;
          else if (o.op === 'cambia') {
            if (op.minus && ESPEJOS.indexOf(o.a + o.b) >= 0) cod.ESPEJO = 1;
            else if (!REGLAS.some(function (r) { return cod[r[0]] && r[1](o.a + 'A') === r[1](o.b + 'A'); })) cod.CAMBIA_LETRA = 1;
          } else if (o.op === 'falta') {
            if (o.a === 'H' && cod.H_MUDA) return;
            if (o.a === 'R' && (E[o.i - 1] === 'R' || E[o.i + 1] === 'R')) { cod.R_RR = 1; return; }
            if (o.a === 'L' && (E[o.i - 1] === 'L' || E[o.i + 1] === 'L') && cod.LL_Y) return;
            var tr = TRABADAS.indexOf((E[o.i - 1] || '') + o.a) >= 0 || TRABADAS.indexOf(o.a + (E[o.i + 1] || '')) >= 0;
            if (tr && !esVocal(o.a)) cod.OMITE_TRABADA = 1;
            else if (!cod.INCOMPLETA) cod[esVocal(o.a) ? 'OMITE_VOCAL' : 'OMITE_LETRA'] = 1;
          } else if (o.op === 'sobra') {
            if (o.b === 'R' && (R[o.j - 1] === 'R' || R[o.j + 1] === 'R')) { cod.R_RR = 1; return; }
            if (o.b === 'H' && cod.H_MUDA) return;
            cod.AGREGA_LETRA = 1;
          }
        });
      }
      if (!Object.keys(cod).length) cod.CAMBIA_LETRA = 1;
    }
    res.codigos = PRIORIDAD.filter(function (c) { return cod[c]; });
    res.primario = res.codigos[0] || null;
    return res;
  }
  // Con varias respuestas válidas: la que más se parece.
  function elegirMejor(validas, respuesta, op) {
    var mejor = null, forma = null;
    validas.forEach(function (v) { var c = clasificar(v, respuesta, op); if (!mejor || (c.ok && !mejor.ok) || (!mejor.ok && c.dist < mejor.dist)) { mejor = c; forma = v; } });
    mejor.forma = forma;
    return mejor;
  }

  var api = { VERSION: '1.0.0', sinTildes: sinTildes, limpiar: limpiar, silabas: silabas, fonetica: fonetica, alinear: alinear, clasificar: clasificar,
    elegirMejor: elegirMejor, ERRORES: ERRORES, PRIORIDAD: PRIORIDAD };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LENGUA1 = api;
})(typeof window !== 'undefined' ? window : this);
