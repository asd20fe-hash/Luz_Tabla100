/* Fracciones de 4to — biblioteca pura: aritmética exacta, formato, lectura en palabras, parser y clasificadores.
   Sin DOM. Patrón UMD sin módulos (navegador: window.REF4_FR; node: require).
   Versión 1.0.0 (2026-10-13). Nunca usa decimales para comparar o validar: productos cruzados. */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';

  /* ---------- aritmética ---------- */
  function mcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function mcm(a, b) { return Math.abs(a * b) / mcd(a, b); }
  function fr(n, d) {
    if (d === undefined) d = 1;
    if (!isFinite(n) || !isFinite(d) || d === 0 || Math.floor(n) !== n || Math.floor(d) !== d) throw new Error('fracción inválida ' + n + '/' + d);
    if (d < 0) { n = -n; d = -d; }
    return { n: n, d: d };
  }
  function simplificar(f) { var g = mcd(f.n, f.d); return fr(f.n / g, f.d / g); }
  function sumar(a, b) { return simplificar(fr(a.n * b.d + b.n * a.d, a.d * b.d)); }
  function restar(a, b) { return simplificar(fr(a.n * b.d - b.n * a.d, a.d * b.d)); }
  function porEntero(f, k) { return simplificar(fr(f.n * k, f.d)); }
  function iguales(a, b) { return !!a && !!b && a.n * b.d === b.n * a.d; }
  function comparar(a, b) { var x = a.n * b.d, y = b.n * a.d; return x < y ? -1 : (x > y ? 1 : 0); }
  function identicas(a, b) { return !!a && !!b && a.n === b.n && a.d === b.d; }   // misma escritura
  // La fracción con ese denominador (3/4 → 6/8), o null si no se puede.
  function aDenominador(f, d) { return (f.n * d) % f.d === 0 ? fr(f.n * d / f.d, d) : null; }
  function aMixto(f) { var e = Math.floor(f.n / f.d); return { entero: e, n: f.n - e * f.d, d: f.d }; }
  function deMixto(e, n, d) { return fr(e * d + n, d); }
  function esEntero(f) { return f.n % f.d === 0; }

  /* ---------- formato ("7/4", "1 3/4", "2") ---------- */
  function formatear(f, op) {
    op = op || {};
    if (esEntero(f)) return String(f.n / f.d);
    if (op.mixto && f.n > f.d) { var m = aMixto(f); return m.entero + ' ' + m.n + '/' + m.d; }
    return f.n + '/' + f.d;
  }
  // "7/4" | "1 3/4" | "2" → fracción (para datos y pruebas). Devuelve null si no entiende.
  function deTexto(s) {
    s = String(s).trim();
    var m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s); if (m) return deMixto(+m[1], +m[2], +m[3]);
    m = /^(\d+)\/(\d+)$/.exec(s); if (m) return fr(+m[1], +m[2]);
    m = /^(\d+)$/.exec(s); if (m) return fr(+m[1], 1);
    return null;
  }

  /* ---------- lectura en palabras ---------- */
  var NUM = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
    'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
    'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta'];
  var DEN = { 2: ['medio', 'medios'], 3: ['tercio', 'tercios'], 4: ['cuarto', 'cuartos'], 5: ['quinto', 'quintos'], 6: ['sexto', 'sextos'],
    7: ['séptimo', 'séptimos'], 8: ['octavo', 'octavos'], 9: ['noveno', 'novenos'], 10: ['décimo', 'décimos'], 12: ['doceavo', 'doceavos'], 16: ['dieciseisavo', 'dieciseisavos'] };
  var UNIDADES = { kg: ['kilo', 'kilos'], l: ['litro', 'litros'] };
  function numero(n) { return n <= 30 ? NUM[n] : String(n); }
  function nombreDen(d, plural) { var x = DEN[d]; return x ? x[plural ? 1 : 0] : (plural ? 'partes de ' + d : 'parte de ' + d); }
  // "un medio", "tres cuartos" (sin unidad, fracción propia o impropia)
  function leerSimple(n, d) {
    if (d === 1) return numero(n);
    return numero(n) + ' ' + nombreDen(d, n !== 1);
  }
  /* leer(f, {mixto, unidad:'kg'|'l'}) → texto en palabras.
     Sin unidad: "tres cuartos", "un entero y tres cuartos", "dos enteros y medio".
     Con unidad: "medio kilo", "un cuarto de kilo", "un kilo y medio", "un kilo y cuarto", "dos kilos y medio". */
  function leer(f, op) {
    op = op || {};
    var u = op.unidad && UNIDADES[op.unidad];
    if (f.n === 0) return u ? 'cero ' + u[1] : 'cero';
    if (op.literal && !op.mixto && !u && f.d !== 1) return leerSimple(f.n, f.d);   // tal como está escrita: 12/4 → "doce cuartos"
    if (esEntero(f)) { var e = f.n / f.d; return u ? numero(e) + ' ' + u[e === 1 ? 0 : 1] : (op.mixto || op.entero ? numero(e) + (e === 1 ? ' entero' : ' enteros') : numero(e)); }
    var m = aMixto(f);
    if (u) {
      if (m.entero > 0 && (op.mixto || op.mixto === undefined)) {
        var resto = (m.n === 1 && m.d === 2) ? 'medio' : ((m.n === 1 && m.d === 4) ? 'cuarto' : leerSimple(m.n, m.d));
        return numero(m.entero) + ' ' + u[m.entero === 1 ? 0 : 1] + ' y ' + resto;
      }
      if (f.n === 1 && f.d === 2) return 'medio ' + u[0];
      return leerSimple(f.n, f.d) + ' de ' + u[0];
    }
    if (op.mixto && m.entero > 0) {
      var r = (m.n === 1 && m.d === 2) ? 'medio' : leerSimple(m.n, m.d);
      return numero(m.entero) + (m.entero === 1 ? ' entero' : ' enteros') + ' y ' + r;
    }
    return leerSimple(f.n, f.d);
  }

  /* paraVoz(texto): pasa a palabras las fracciones ("3/4", "1 3/4"), los kg y los l, y algunos símbolos.
     Nunca deja una barra. */
  function paraVoz(t) {
    t = String(t);
    t = t.replace(/(\d+)\s+(\d+)\/(\d+)(\s*(kg|l)\b)?/g, function (_, e, n, d, s, u) { return leer(deMixto(+e, +n, +d), { mixto: true, unidad: u }); });
    t = t.replace(/(\d+)\/(\d+)(\s*(kg|l)\b)?/g, function (_, n, d, s, u) { return leer(fr(+n, +d), { unidad: u }); });
    t = t.replace(/(\d+)\s*(kg|l)\b/g, function (_, n, u) { return leer(fr(+n, 1), { unidad: u }); });
    t = t.replace(/\s:\s/g, ' dividido ').replace(/\s[−-]\s/g, ' menos ').replace(/\s\+\s/g, ' más ').replace(/\s=\s/g, ' es igual a ')
      .replace(/\s>\s/g, ' es mayor que ').replace(/\s<\s/g, ' es menor que ').replace(/□/g, 'cuánto').replace(/\//g, ' ');
    return t;
  }

  /* ---------- parser del ingreso ----------
     parsear({entero, num, den}) (strings, pueden venir vacíos) → fracción, o {error:'VACIO'|'DEN_CERO'}. */
  var PISTA_DEN_CERO = 'El de abajo no puede ser 0: es en cuántas partes se corta.';
  function parsear(c) {
    var e = c.entero === undefined || c.entero === null ? '' : String(c.entero), n = c.num ? String(c.num) : '', d = c.den ? String(c.den) : '';
    if (n === '' && d === '') { if (e === '') return { error: 'VACIO' }; return fr(+e, 1); }
    if (n === '' || d === '') return { error: 'VACIO' };
    if (+d === 0) return { error: 'DEN_CERO' };
    return deMixto(e === '' ? 0 : +e, +n, +d);
  }
  function forma(c) { var e = c.entero !== undefined && c.entero !== null && String(c.entero) !== '', n = !!(c.num && String(c.num) !== ''); return e && n ? 'mixto' : (n ? 'fraccion' : 'entero'); }

  /* ---------- clasificadores de error ----------
     clasificar(tipo, item, resp) → código de error, o null si está bien. resp: fracción (o '<','>','=' en 'comparar').
     Si una respuesta coincide con más de un patrón gana el más específico (orden documentado en DECISIONES.md). */
  function q(N, M) { return Math.floor(N / M); }
  function clasificar(tipo, it, r) {
    var F = fr;
    switch (tipo) {
      case 'reparto': { // it: {N, M}
        var N = it.N, M = it.M, ok = F(N, M), co = q(N, M), re = N - co * M;
        if (iguales(r, ok)) return null;
        if (iguales(r, F(M, N))) return 'INVERTIDA';
        if (re > 0 && iguales(r, F(co, 1))) return 'RESTO_IGNORADO';
        if (re > 0 && iguales(r, deMixto(co, re, N))) return 'RESTO_MAL_PARTIDO';
        if (re > 0 && (iguales(r, deMixto(re, co, M)) || iguales(r, F(co + re, M)))) return 'MIXTO';
        return 'OTRO';
      }
      case 'parte': { // it: {p, n} partes iguales pintadas / total; opcional {piezas, piezasPintadas} visibles
        var esp = F(it.p, it.n);
        if (iguales(r, esp)) return null;
        if (it.piezas && it.piezas !== it.n && iguales(r, F(it.piezasPintadas, it.piezas))) return 'CUENTA_PARTES';
        if (it.n - it.p > 0 && iguales(r, F(it.p, it.n - it.p))) return 'PARTE_PARTE';
        if (r.n !== 0 && iguales(r, F(it.n, it.p))) return 'INVERTIDA';
        return 'OTRO';
      }
      case 'equivalente': { // it: {f} y la respuesta es otra escritura que debería valer lo mismo
        var f = it.f;
        if (iguales(r, f)) return null;
        if (identicas(r, F(f.d, f.n)) || (r.n === f.d && r.d === f.n)) return 'INVERTIDA';
        if (r.n - f.n === r.d - f.d && r.n !== f.n) return 'EQUIV_SUMA';
        if (r.n % f.n === 0 && r.d % f.d === 0 && r.n / f.n !== r.d / f.d) return 'EQUIV_MAL_ESCALADA';
        return 'OTRO';
      }
      case 'comparar': { // it: {a, b}; r: '<' | '>' | '='
        var rel = ['<', '=', '>'][comparar(it.a, it.b) + 1];
        if (r === rel) return null;
        if (rel === '=') return 'IGUALDAD_NO_DETECTADA';
        var a = it.a, b = it.b, uno = F(1, 1), ca = comparar(a, uno), cb = comparar(b, uno);
        if (ca !== cb && (ca > 0 || cb > 0)) return 'MAS_DE_UN_ENTERO';           // una pasa el entero y la otra no
        if (a.d !== b.d && r === (a.d > b.d ? '>' : '<')) return 'DENOM_MAYOR_ES_MAYOR'; // "más partes es más"
        return 'COMPARACION';
      }
      case 'suma': case 'resta': { // it: {a, b}
        var s = tipo === 'suma' ? 1 : -1, x = it.a, y = it.b, bien = s > 0 ? sumar(x, y) : restar(x, y);
        if (iguales(r, bien)) return null;
        var dn = x.d + s * y.d, nn = x.n + s * y.n;
        if (dn > 0 && nn >= 0 && iguales(r, F(nn, dn))) return 'OPERA_DENOMINADORES';      // 1/2 + 1/4 = 2/6
        if (x.d !== y.d && nn >= 0 && (iguales(r, F(nn, Math.max(x.d, y.d))) || iguales(r, F(nn, Math.min(x.d, y.d))))) return 'DENOMINADOR_DISTINTO'; // 3/8 + 1/4 = 4/8
        return 'CALCULO';
      }
      case 'problema': { // it: {esperado, datos:[fr], T (entero, fr), opuesta?, incompleto?, cuenta?:{a,b,op}}
        if (iguales(r, it.esperado)) return null;
        if ((it.datos || []).some(function (z) { return iguales(r, z); })) return 'RESPONDE_EL_DATO';
        if (it.incompleto && iguales(r, it.incompleto)) return 'PLAN_INCOMPLETO';
        if (it.opuesta && iguales(r, it.opuesta)) return 'PLAN_OPERACION';
        if (it.enteroMal && iguales(r, it.enteroMal)) return 'ENTERO_EQUIVOCADO';
        if (it.cuenta) { var c = clasificar(it.cuenta.op, it.cuenta, r); if (c === 'OPERA_DENOMINADORES' || c === 'DENOMINADOR_DISTINTO') return c; }
        return 'CALCULO';
      }
      case 'potes': { // it: {objetivo, cond}; r: lista de pesos (fracciones)
        var tot = r.reduce(function (acc, z) { return sumar(acc, z); }, F(0, 1)), cmp = comparar(tot, it.objetivo);
        if (cmp > 0) return 'SE_PASA';
        if (cmp < 0) return 'NO_LLEGA';
        if (it.cond && !cumpleCondicion(it.cond, r, it.objetivo)) return 'RESTRICCION';
        return null;
      }
    }
    return 'OTRO';
  }

  /* ---------- potes ---------- */
  var MEDIO = fr(1, 2), CUARTO = fr(1, 4), UNO = fr(1, 1);
  function contar(lista, p) { return lista.filter(function (z) { return identicas(simplificar(z), p); }).length; }
  // Con potes de 1/2 y 1/4: todos los medios que entran sin pasarse, el resto en cuartos.
  function mayorCantidadMedios(objetivo) { var cuartos = objetivo.n * 4 / objetivo.d; return { medios: Math.floor(cuartos / 2), cuartos: cuartos % 2 }; }
  // Con potes de 1, 1/2 y 1/4: primero los más grandes.
  function menorCantidad(objetivo) { var c = objetivo.n * 4 / objetivo.d, unos = Math.floor(c / 4); c -= unos * 4; return { unos: unos, medios: Math.floor(c / 2), cuartos: c % 2 }; }
  function cumpleCondicion(cond, lista, objetivo) {
    var permitido = { medios_cuartos: [MEDIO, CUARTO], cuartos: [CUARTO], medios: [MEDIO] }[cond];
    if (permitido && !lista.every(function (z) { return permitido.some(function (p) { return iguales(z, p); }); })) return false;
    if (cond === 'mas_medios') { var m = mayorCantidadMedios(objetivo); return contar(lista, MEDIO) === m.medios && contar(lista, CUARTO) === m.cuartos && lista.length === m.medios + m.cuartos; }
    if (cond === 'menos_potes') { var k = menorCantidad(objetivo); return lista.length === k.unos + k.medios + k.cuartos; }
    return true;
  }

  /* ---------- nombres de los errores (para el panel y los informes) ---------- */
  var ERRORES = {
    VUELTA_DE_MAS: 'Otra vuelta de enteros sin que alcanzara', CORTE_INVALIDO: 'Corte que no se reparte parejo', RESTO_IGNORADO: 'No repartió lo que sobra',
    RESTO_MAL_PARTIDO: 'Armó mal la fracción de lo que sobra', PARTIR_INDIVISIBLE: 'Partió algo que no se parte', INVERTIDA: 'Numerador y denominador al revés',
    MIXTO: 'Pasó mal entre fracción y número mixto', CUENTA_PARTES: 'Contó pedazos sin mirar el tamaño', PARTE_PARTE: 'Pintadas sobre no pintadas',
    PARTES_DESIGUALES: 'Aceptó partes desiguales', PINTADO: 'Pintó de más o de menos', ENTERO_IGNORA_NUMERADOR: 'Armó el entero sin mirar el numerador',
    ENTERO_OTRO: 'Otro error al armar el entero', EQUIV_MAL_ESCALADA: 'Multiplicó distinto arriba y abajo', EQUIV_SUMA: 'Sumó lo mismo arriba y abajo',
    JUSTIFICACION: 'Eligió bien con un porqué equivocado', DENOM_MAYOR_ES_MAYOR: 'Comparó los denominadores como números', IGUALDAD_NO_DETECTADA: 'No vio que eran iguales',
    MAS_DE_UN_ENTERO: 'Ubicó mal respecto del entero', COMPARACION: 'Otro error al comparar', OPERA_DENOMINADORES: 'Sumó o restó los denominadores',
    DENOMINADOR_DISTINTO: 'Operó sin igualar las partes', CALCULO: 'Error de cuenta', RESPONDE_EL_DATO: 'Respondió con un dato', ENTERO_EQUIVOCADO: 'Tomó mal el entero',
    ABSURDO: 'No vio un resultado imposible', SE_PASA: 'Se pasó del objetivo', NO_LLEGA: 'No llegó al objetivo', RESTRICCION: 'No cumplió la condición'
  };
  var TEMAS = { reparto: 'Repartos', partes: 'Partes de un entero', entero: 'Armar el entero', equivalencias: 'Equivalencias', comparacion: 'Comparación',
    mayor_que_uno: 'Mayores que un entero', cuanto_falta: 'Cuánto falta', sumas_restas: 'Sumas y restas', problemas: 'Problemas', medidas: 'Kilos y litros', estrategia: '¿Qué aprendiste?' };

  var api = {
    VERSION: VERSION, mcd: mcd, mcm: mcm, fr: fr, simplificar: simplificar, sumar: sumar, restar: restar, porEntero: porEntero, iguales: iguales, identicas: identicas,
    comparar: comparar, aDenominador: aDenominador, aMixto: aMixto, deMixto: deMixto, esEntero: esEntero, formatear: formatear, deTexto: deTexto,
    leer: leer, paraVoz: paraVoz, nombreDen: nombreDen, numero: numero, parsear: parsear, forma: forma, PISTA_DEN_CERO: PISTA_DEN_CERO, clasificar: clasificar,
    mayorCantidadMedios: mayorCantidadMedios, menorCantidad: menorCantidad, cumpleCondicion: cumpleCondicion, ERRORES: ERRORES, TEMAS: TEMAS
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_FR = api; }
})(typeof window !== 'undefined' ? window : this);
