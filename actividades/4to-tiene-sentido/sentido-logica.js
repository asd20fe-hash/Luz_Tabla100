/* ¿Tiene sentido? — generador de ítems y validadores (lógica pura, sin DOM).
   Patrón UMD sin módulos: window.REF4_SENTIDO. */
(function (root) {
  'use strict';
  var req = (typeof module !== 'undefined' && module.exports);
  var DIV = req ? require('../_comun-4to/division-lib.js') : root.REF4_DIV;

  var TIPOS = { 1: ['T1', 'T2'], 2: ['T1', 'T2', 'T3', 'T4'], 3: ['T1', 'T2', 'T3', 'T4', 'T5'] };
  var ERRORES_NIVEL = { 1: ['PASO_EXTRA'], 2: ['PASO_EXTRA', 'RESTO_MAYOR', 'TABLA', 'REGISTRO_COCIENTE'], 3: ['PASO_EXTRA', 'RESTO_MAYOR', 'TABLA', 'REGISTRO_COCIENTE', 'CERO_OMITIDO'] };
  var RONDA = 6, MAX_NIVEL = 3;
  var CONTROLES = ['DETECCION_OMITIDA', 'FALSA_ALARMA', 'MOTIVO', 'ESTIMACION', 'VERIFICACION', 'MITAD_AUTOMATICA', 'OTRO'];

  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function nCifras(n) { return String(n).length; }

  /* ---------- T1: cantidad de cifras del cociente ---------- */
  function itemT1(az) {
    var d = az.entero(2, 9), D;
    do { D = az.elegir([az.entero(20, 99), az.entero(100, 999), az.entero(100, 999), az.entero(1000, 9999), az.entero(1000, 9999)]); } while (D < d);
    return { tipo: 'T1', D: D, d: d, correcta: nCifras(Math.floor(D / d)), escalera: [d, d * 10, d * 100, d * 1000] };
  }

  /* ---------- T2: ¿puede ser? (división resuelta, con o sin error plantado) ---------- */
  function itemT2(nivel, az, ses) {
    var g = DIV.generar(nivel >= 3 ? 3 : 2, az, ses.div), error = null, vista = DIV.vistaDe(g.sim);
    if (!az.prob(0.3)) {
      var tipos = az.mezclar(ERRORES_NIVEL[nivel]);
      for (var i = 0; i < tipos.length && !error; i++) {
        var r = DIV.inyectarError(g.sim, tipos[i], az);
        if (r) { error = r.error; vista = r.vista; }
      }
      if (!error) { var r2 = DIV.inyectarError(g.sim, 'PASO_EXTRA', az); error = r2.error; vista = r2.vista; }
    }
    var motivos = null;
    if (error) {
      var otros = Object.keys(DIV.MOTIVOS).filter(function (t) { return t !== error.tipo; });
      motivos = az.mezclar([{ t: error.motivo, ok: true }].concat(az.mezclar(otros).slice(0, 2).map(function (t) { return { t: DIV.MOTIVOS[t], ok: false }; })));
    }
    return { tipo: 'T2', D: g.dividendo, d: g.divisor, q: g.sim.cociente, r: g.sim.resto, vista: vista, error: error, motivos: motivos };
  }

  /* ---------- T3: verificá con cociente × divisor + resto ---------- */
  function itemT3(az, ses) {
    var g = DIV.generar(2, az, ses.div), q = g.sim.cociente, r = g.sim.resto, d = g.divisor, correcto = az.prob(0.5), qm = q, rm = r;
    if (!correcto) {
      var v = az.elegir(['q+', 'q-', 'r']);
      if (v === 'q+') qm = q + 1; else if (v === 'q-') qm = Math.max(1, q - 1); else rm = (r + 1 < d) ? r + 1 : Math.max(0, r - 1);
      if (qm === q && rm === r) qm = q + 1;
    }
    return { tipo: 'T3', D: g.dividendo, d: d, q: qm, r: rm, correcto: qm * d + rm === g.dividendo, esperadoCalculo: qm * d + rm };
  }

  /* ---------- T4: ¿puede ser en la vida real? ---------- */
  var T4 = [
    function (az) { var k = az.entero(5, 9), n = az.entero(150, 900), q = Math.floor(n / k), ok = az.prob(0.5), qm = ok ? q : q + az.entero(150, 400);
      return { texto: 'Con ' + miles(n) + ' jabones armó ' + miles(qm) + ' bolsitas de ' + k + ' jabones.', razonable: ok, nota: '¿Pueden salir más bolsitas que jabones?', cuenta: qm + ' × ' + k + ' = ' + miles(qm * k) + ' y no pasa de ' + miles(n) }; },
    function (az) { var k = az.entero(4, 8), q = az.entero(100, 400), n = k * q + az.entero(0, k - 1), ok = az.prob(0.5), qm = ok ? q : q * 10;
      return { texto: 'Repartieron ' + miles(n) + ' figuritas entre ' + k + ' cursos y a cada curso le tocaron ' + miles(qm) + '.', razonable: ok, nota: '¿Cuánto dan ' + k + ' cursos con ' + miles(qm) + ' cada uno? ¿Es más que lo que había?' }; },
    function (az) { var k = az.entero(6, 12), n = az.entero(100, 999), q = Math.floor(n / k), ok = az.prob(0.5), qm = ok ? q : n + az.entero(2, 50);
      return { texto: 'En una caja entran ' + k + ' alfajores. Con ' + n + ' alfajores se llenaron ' + qm + ' cajas.', razonable: ok, nota: '¿Pueden llenarse más cajas que alfajores?' }; },
    function (az) { var k = az.elegir([30, 40, 45, 50]), n = az.entero(300, 2500), q = Math.ceil(n / k), ok = az.prob(0.5), qm = ok ? q : Math.max(2, Math.floor(q / 10));
      return { texto: 'Un micro lleva ' + k + ' pasajeros. Para llevar a ' + miles(n) + ' personas se necesitan ' + qm + ' micros.', razonable: ok, nota: '¿Alcanzan ' + qm + ' micros de ' + k + ' para ' + miles(n) + ' personas?' }; },
    function (az) { var k = az.entero(3, 9), q = az.entero(50, 500), n = k * q, ok = az.prob(0.5), qm = ok ? q : n + az.entero(10, 90);
      return { texto: 'Entre ' + k + ' hermanos se reparten $' + miles(n) + ' en partes iguales. A cada uno le tocan $' + miles(qm) + '.', razonable: ok, nota: '¿Le puede tocar a cada uno más plata que el total?' }; },
    function (az) { var k = az.entero(8, 12), n = az.entero(100, 999), q = Math.floor(n / k), ok = az.prob(0.5), qm = ok ? q : q * 10 + az.entero(0, 9);
      return { texto: 'Un álbum tiene ' + k + ' figuritas por página. ' + n + ' figuritas llenan ' + qm + ' páginas.', razonable: ok, nota: '¿' + qm + ' páginas de ' + k + ' figuritas son más que ' + n + '?' }; }
  ];
  function itemT4(az) { var it = az.elegir(T4)(az); it.tipo = 'T4'; return it; }

  /* ---------- T5: mitad trampa ---------- */
  function itemT5(az) {
    var D = az.elegir([80, 120, 150, 180, 240, 300, 450, 1200, 1500, 2400, 12000, 15000, 24000, 30000]);
    var ds = [3, 4, 5, 6, 10].filter(function (x) { return D % x === 0; }), d = az.elegir(ds), real = D / d, mitad = az.prob(0.6), resp = mitad ? D / 2 : real;
    if (mitad && az.prob(0.15)) { d = 2; resp = D / 2; mitad = false; }                           // con divisor 2 la mitad es correcta
    return { tipo: 'T5', D: D, d: d, resp: resp, esMitad: resp === D / 2 && d !== 2, correcta: resp * d === D, comprobar: resp * d };
  }

  /* generar(nivel, az, ses): ses = {div:{usados,cuadernoUsado}} */
  function generar(nivel, az, ses) {
    ses = ses || { div: { usados: {}, cuadernoUsado: false } }; if (!ses.div) ses.div = { usados: {}, cuadernoUsado: false };
    var t = az.elegir(TIPOS[nivel] || TIPOS[1]);
    if (t === 'T1') return itemT1(az);
    if (t === 'T2') return itemT2(nivel, az, ses);
    if (t === 'T3') return itemT3(az, ses);
    if (t === 'T4') return itemT4(az);
    return itemT5(az);
  }

  /* ---------- validadores ---------- */
  var OK = { ok: true, codigo: null, pista: null };
  function pistaT1(it) { return it.d + ' × 100 = ' + miles(it.d * 100) + '. ¿' + miles(it.D) + ' es más o menos que ' + miles(it.d * 100) + '? ¿Y que ' + it.d + ' × 1000?'; }
  function validarT1(it, n) { return n === it.correcta ? OK : { ok: false, codigo: 'ESTIMACION', pista: pistaT1(it) }; }

  function validarVeredicto(it, dice) { // dice: 'bien' | 'mal'
    var hayError = !!it.error;
    if (hayError && dice === 'bien') return { ok: false, codigo: 'DETECCION_OMITIDA', pista: 'Mirá la cuenta con calma: algo no cierra. Fijate el cociente, el resto y la tabla.' };
    if (!hayError && dice === 'mal') return { ok: false, codigo: 'FALSA_ALARMA', pista: 'Probá: ' + it.q + ' × ' + it.d + ' + ' + it.r + '. ¿Da ' + it.D + '?' };
    return OK;
  }
  function validarDonde(it, zona) {
    return zona === it.error.campo ? OK : { ok: false, codigo: 'DETECCION_OMITIDA', pista: 'Ahí está bien. Mirá otra parte de la cuenta.' };
  }
  function pistaMotivo(it) {
    var e = it.error, v = it.vista, d = it.d;
    switch (e.tipo) {
      case 'PASO_EXTRA': return 'Contá cuántas cifras bajaste. Cada vuelta da una cifra del cociente.';
      case 'RESTO_MAYOR': return 'Si sobran ' + v.resto + ' y ' + v.resto + ' es más que ' + d + ', todavía entra.';
      case 'TABLA': return 'Mirá la tabla: ¿' + d + ' × ' + e.vuelta + ' da ' + v.tabla[e.vuelta - 1].p + '?';
      case 'REGISTRO_COCIENTE': return 'En el casillero va por cuánto multiplicaste, no el resultado.';
      default: return 'Fijate si cada vuelta tiene su cifra en el casillero, aunque sea 0.';
    }
  }
  function validarMotivo(it, op) { return op.ok ? OK : { ok: false, codigo: 'MOTIVO', pista: pistaMotivo(it) }; }

  function validarCalculo(it, n) {
    var esp = it.tipo === 'T3' ? it.esperadoCalculo : it.comprobar;
    if (n === esp) return OK;
    return { ok: false, codigo: 'VERIFICACION', pista: it.tipo === 'T3' ? 'Multiplicá ' + it.q + ' × ' + it.d + ' y sumale ' + it.r + '.' : 'Multiplicá ' + miles(it.resp) + ' × ' + it.d + '.' };
  }
  // sí/no de T3, T4 y T5: puede = true significa "sí, puede ser / sí da"
  function validarSiNo(it, puede) {
    var verdad = it.tipo === 'T3' ? it.correcto : (it.tipo === 'T4' ? it.razonable : it.correcta);
    if (puede === verdad) return OK;
    if (!verdad) {
      if (it.tipo === 'T5' && it.esMitad) return { ok: false, codigo: 'MITAD_AUTOMATICA', pista: 'Leé el divisor: dividís por ' + it.d + ', no por 2. Mirá lo que te dio la comprobación: ' + miles(it.comprobar) + '.' };
      return { ok: false, codigo: 'DETECCION_OMITIDA', pista: it.tipo === 'T4' ? it.nota : 'La comprobación da ' + miles(it.tipo === 'T3' ? it.esperadoCalculo : it.comprobar) + ', y tendría que dar ' + miles(it.D) + '.' };
    }
    return { ok: false, codigo: 'FALSA_ALARMA', pista: it.tipo === 'T4' ? 'Hacé la cuenta con calma: sí puede ser.' : 'La comprobación da justo ' + miles(it.D) + ': sí cierra.' };
  }

  function pasosDe(it) {
    if (it.tipo === 'T1') return ['estimar'];
    if (it.tipo === 'T2') return it.error ? ['veredicto', 'donde', 'motivo'] : ['veredicto'];
    if (it.tipo === 'T3' || it.tipo === 'T5') return ['calculo', 'sino'];
    return ['sino'];
  }

  var api = { TIPOS: TIPOS, ERRORES_NIVEL: ERRORES_NIVEL, RONDA: RONDA, MAX_NIVEL: MAX_NIVEL, CONTROLES: CONTROLES, generar: generar, validarT1: validarT1, validarVeredicto: validarVeredicto,
              validarDonde: validarDonde, validarMotivo: validarMotivo, validarCalculo: validarCalculo, validarSiNo: validarSiNo, pasosDe: pasosDe, pistaT1: pistaT1, pistaMotivo: pistaMotivo };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_SENTIDO = api; }
})(typeof window !== 'undefined' ? window : this);
