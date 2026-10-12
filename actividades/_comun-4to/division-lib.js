/* Lógica pura de la división de la escuela: simulador, generador por nivel e inyector de errores.
   Sin DOM. Patrón UMD sin módulos (navegador: window.REF4_DIV; node: require). */
(function (root) {
  'use strict';

  function cifras(n) { return String(n).split('').map(Number); }
  function nCifras(n) { return String(n).length; }

  /* ---------- simulador ----------
     simular(dividendo, d) → {dividendo, divisor, cociente, resto, vueltas:[{parcial, parcialTxt, factor,
       producto, resta, bajada|null, colInicio, colFin}]}
     parcialTxt es lo que se ve escrito: las cifras del dividendo en la primera vuelta y "resto + cifra
     bajada" en las siguientes (por eso aparece "07"). */
  function simular(dividendo, d) {
    var ds = cifras(dividendo), vueltas = [], pos, parcial, txt;
    var n1 = (ds[0] >= d || ds.length === 1) ? 1 : 2;
    parcial = n1 === 1 ? ds[0] : ds[0] * 10 + ds[1];
    txt = ds.slice(0, n1).join('');
    pos = n1 - 1;
    for (;;) {
      var factor = Math.floor(parcial / d), producto = factor * d, resta = parcial - producto;
      var v = { parcial: parcial, parcialTxt: txt, factor: factor, producto: producto, resta: resta,
                bajada: null, colInicio: pos - txt.length + 1, colFin: pos };
      vueltas.push(v);
      if (pos + 1 < ds.length) {
        v.bajada = ds[pos + 1];
        parcial = resta * 10 + ds[pos + 1];
        txt = String(resta) + ds[pos + 1];
        pos++;
      } else break;
    }
    return {
      dividendo: dividendo, divisor: d,
      cociente: parseInt(vueltas.map(function (x) { return x.factor; }).join(''), 10),
      resto: vueltas[vueltas.length - 1].resta, vueltas: vueltas
    };
  }

  /* ---------- generador ---------- */
  var NIVELES = {
    1: { L: [3, 3], d: [2, 5], pesoDiv: false, cInt: 0,  cFin: 0,   parcial: '1',   resto0: 0.5 },
    2: { L: [3, 3], d: [2, 9], pesoDiv: true,  cInt: 0,  cFin: 0,   parcial: 'mix', resto0: 0.2 },
    3: { L: [3, 4], d: [3, 9], pesoDiv: true,  cInt: 0.4, cFin: 0.2, parcial: 'mix', resto0: 0.2 },
    4: { L: [4, 4], d: [6, 9], pesoDiv: false, cInt: 0.2, cFin: 0.1, parcial: 'mix', resto0: 0.5 }
  };
  // Ejercicios reales del cuaderno: aparecen de vez en cuando desde el nivel 2.
  var SEMILLA_CUADERNO = [[976, 7], [1426, 8], [300, 8], [1387, 6], [1640, 8]];

  function tieneCeroCociente(sim) { return sim.vueltas.some(function (v) { return v.factor === 0; }); }
  function ceroInterior(sim) { return sim.vueltas.some(function (v, i) { return v.factor === 0 && i > 0 && i < sim.vueltas.length - 1; }); }
  function ceroFinal(sim) { var n = sim.vueltas.length; return n > 1 && sim.vueltas[n - 1].factor === 0; }
  function fraccion69(sim) {
    var c = sim.vueltas.filter(function (v) { return v.factor >= 6 && v.factor <= 9; }).length;
    return c / sim.vueltas.length;
  }
  function tipoParcial(sim) { return sim.vueltas[0].parcialTxt.length === 1 ? '1' : '2'; }

  function cumpleNivel(div, d, nivel) {
    var cfg = NIVELES[nivel];
    var L = nCifras(div);
    if (L < cfg.L[0] || L > cfg.L[1] || d < cfg.d[0] || d > cfg.d[1]) return false;
    if (nivel < 3 && tieneCeroCociente(simular(div, d))) return false;
    return true;
  }

  // sesion: {usados:{}, cuadernoUsado:false}. Devuelve {dividendo, divisor, sim, nivel, relajado:[...]}.
  function generar(nivel, az, sesion) {
    var cfg = NIVELES[nivel] || NIVELES[1];
    sesion = sesion || { usados: {}, cuadernoUsado: false };
    var clave = function (n, d) { return n + ':' + d; };
    function listo(n, d, relajado) {
      sesion.usados[clave(n, d)] = true;
      return { dividendo: n, divisor: d, sim: simular(n, d), nivel: nivel, relajado: relajado };
    }
    // ejercicio del cuaderno (10 %, máximo uno por sesión)
    if (nivel >= 2 && !sesion.cuadernoUsado && az.prob(0.1)) {
      var cand = SEMILLA_CUADERNO.filter(function (p) { return cumpleNivel(p[0], p[1], nivel) && !sesion.usados[clave(p[0], p[1])]; });
      if (cand.length) { var p = az.elegir(cand); sesion.cuadernoUsado = true; return listo(p[0], p[1], []); }
    }
    var divs = [], pesos = [];
    for (var d = cfg.d[0]; d <= cfg.d[1]; d++) { divs.push(d); pesos.push(cfg.pesoDiv && d >= 6 && d <= 8 ? 3 : 1); }

    var mejor = null, relajado = [];
    for (var intento = 0; intento < 200; intento++) {
      var rel = { f69: intento >= 120, rep: intento >= 160, plan: intento >= 190 };
      var div = az.pesado(divs, pesos);
      var L = az.entero(cfg.L[0], cfg.L[1]);
      var objParcial = cfg.parcial === '1' ? '1' : (az.prob(0.5) ? '1' : '2');
      var k = objParcial === '1' ? L : L - 1;
      var planInt = k >= 3 && az.prob(cfg.cInt), planFin = k >= 2 && az.prob(cfg.cFin);
      var resto0 = az.prob(cfg.resto0);
      // cifras del cociente
      var qd = [];
      for (var i = 0; i < k; i++) {
        var z = (i === 0) ? false : (i === k - 1 ? planFin : false);
        qd.push(z ? 0 : (i === 0 && nivel >= 2 && intento < 100 && az.prob(0.7) ? az.entero(4, 9) : az.entero(1, 9)));
      }
      if (planInt) { var pi = az.entero(1, k - 2); qd[pi] = 0; }
      var q = parseInt(qd.join(''), 10);
      var r = resto0 ? 0 : az.entero(1, div - 1);
      var n = q * div + r;
      if (nCifras(n) < cfg.L[0] || nCifras(n) > cfg.L[1]) continue;
      var sim = simular(n, div);
      if (!rel.plan) {
        if (cfg.parcial === '1' ? tipoParcial(sim) !== '1' : tipoParcial(sim) !== objParcial) continue;
        if (nivel < 3 && tieneCeroCociente(sim)) continue;
        if (nivel >= 3 && (ceroInterior(sim) !== planInt || ceroFinal(sim) !== planFin)) continue;
        if ((sim.resto === 0) !== resto0) continue;
      } else if (nivel < 3 && tieneCeroCociente(sim)) continue;
      if (!rel.f69 && fraccion69(sim) < 0.3) continue;
      if (!rel.rep && sesion.usados[clave(n, div)]) continue;
      relajado = [];
      if (rel.f69) relajado.push('factor 6-9');
      if (rel.rep) relajado.push('repetido');
      if (rel.plan) relajado.push('plan de ceros/parcial/resto');
      mejor = { n: n, d: div, rel: relajado };
      break;
    }
    if (!mejor) { // último recurso: un ejercicio seguro del nivel
      var fijos = { 1: [378, 3], 2: [476, 7], 3: [1426, 8], 4: [1387, 6] };
      var f = fijos[nivel] || fijos[1];
      mejor = { n: f[0], d: f[1], rel: ['sin candidato: ejercicio fijo'] };
    }
    return listo(mejor.n, mejor.d, mejor.rel);
  }

  /* ---------- tabla del divisor ---------- */
  function tablaDe(d) { var t = []; for (var q = 1; q <= 9; q++) t.push({ q: q, p: d * q }); return t; }

  /* ---------- vista (lo que se dibuja en el cuaderno) ---------- */
  function vistaDe(sim) {
    return {
      dividendo: String(sim.dividendo), divisor: sim.divisor, cociente: String(sim.cociente), resto: sim.resto,
      vueltas: sim.vueltas.map(function (v) { return { colInicio: v.colInicio, colFin: v.colFin, parcialTxt: v.parcialTxt,
        factor: v.factor, producto: v.producto, resta: v.resta, bajada: v.bajada }; }),
      tabla: tablaDe(sim.divisor)
    };
  }

  /* ---------- inyector de errores (Actividad 4) ----------
     inyectarError(sim, tipo, az) → {vista, error:{tipo, campo, vuelta, motivo}} o null si no se puede. */
  var MOTIVOS = {
    REGISTRO_COCIENTE: 'En el casillero anotó el resultado de la multiplicación, no cuántas veces entra.',
    RESTO_MAYOR: 'Quedó un resto más grande que el divisor: todavía entraba otra vez.',
    PASO_EXTRA: 'El cociente tiene una cifra de más: no hay tantas vueltas.',
    CERO_OMITIDO: 'Se olvidó de anotar un 0 en el cociente cuando no entraba.',
    TABLA: 'Hay un producto mal en la tabla.'
  };
  var CAMPO = { REGISTRO_COCIENTE: 'cociente', RESTO_MAYOR: 'resto', PASO_EXTRA: 'cociente', CERO_OMITIDO: 'cociente', TABLA: 'tabla' };

  function inyectarError(sim, tipo, az) {
    var vista = vistaDe(sim), vs = vista.vueltas, n = vs.length, d = sim.divisor;
    var error = { tipo: tipo, campo: CAMPO[tipo], vuelta: null, motivo: MOTIVOS[tipo] };
    if (tipo === 'REGISTRO_COCIENTE') {
      var f0 = vs[0].factor, esc = vs[0].producto % 10;
      if (vs[0].producto === f0 || esc === f0) return null;
      vista.cociente = String(esc) + vista.cociente.slice(1); error.vuelta = 0;
    } else if (tipo === 'RESTO_MAYOR') {
      var u = vs[n - 1];
      if (u.factor < 1) return null;
      u.factor -= 1; u.producto -= d; u.resta += d;
      vista.cociente = vista.cociente.slice(0, -1) + u.factor; vista.resto = u.resta; error.vuelta = n - 1;
    } else if (tipo === 'PASO_EXTRA') {
      vista.cociente += String(az.entero(1, 9)); error.vuelta = n;
    } else if (tipo === 'CERO_OMITIDO') {
      var idx = -1;
      for (var i = 1; i < n; i++) if (vs[i].factor === 0) { idx = i; break; }
      if (idx < 0) return null;
      vista.cociente = vista.cociente.slice(0, idx) + vista.cociente.slice(idx + 1); error.vuelta = idx;
    } else if (tipo === 'TABLA') {
      var fila = az.entero(2, 9), mal = vista.tabla[fila - 1];
      mal.p += az.elegir([-2, -1, 1, 2, d, -d]);
      if (mal.p === d * fila) mal.p += 1;
      error.vuelta = fila;
    } else return null;
    return { vista: vista, error: error };
  }

  var api = {
    cifras: cifras, nCifras: nCifras, simular: simular, generar: generar, NIVELES: NIVELES, SEMILLA_CUADERNO: SEMILLA_CUADERNO,
    tablaDe: tablaDe, vistaDe: vistaDe, inyectarError: inyectarError, MOTIVOS: MOTIVOS, CAMPO: CAMPO,
    tieneCeroCociente: tieneCeroCociente, ceroInterior: ceroInterior, ceroFinal: ceroFinal, fraccion69: fraccion69, tipoParcial: tipoParcial
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_DIV = api; }
})(typeof window !== 'undefined' ? window : this);
