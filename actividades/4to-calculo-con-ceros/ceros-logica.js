/* Cálculo con ceros — generador de ítems, pasos y validadores (lógica pura, sin DOM).
   Patrón UMD sin módulos: window.REF4_CEROS. */
(function (root) {
  'use strict';
  var req = (typeof module !== 'undefined' && module.exports);
  var CL = req ? require('../_comun-4to/clasificadores.js') : root.REF4_CLASIF;

  var TIPOS = { 1: [['M1', 0.6], ['M4', 0.4]], 2: [['M1', 0.3], ['M2', 0.4], ['M3', 0.3]], 3: [['M2', 0.5], ['M3', 0.5]], 4: [['M1', 0.25], ['M2', 0.25], ['M3', 0.25], ['M4', 0.25]] };
  var RONDA = 6, MAX_NIVEL = 4;
  var CONTROLES = ['ESTIMACION'];
  var MITADES = { 12: [3, 4, 6], 120: [3, 4, 5, 6, 30], 1200: [3, 4, 5, 6, 30, 50, 300], 12000: [3, 4, 5, 6, 30, 50, 300] };
  var OTRAS = [[280, 7], [320, 8], [450, 9], [1200, 50], [560, 7], [630, 9], [810, 9], [480, 6], [720, 8], [4200, 7], [3200, 8], [4500, 9], [350, 5], [240, 8]];
  var COMP = [[9, 10, -1], [19, 20, -1], [29, 30, -1], [39, 40, -1], [49, 50, -1], [99, 100, -1], [101, 100, 1], [199, 200, -1], [201, 200, 1]];
  var LUGARES = ['unidades', 'decenas', 'centenas', 'unidades de mil'];

  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pd(az, nivel) { var ds = [2, 3, 4, 5, 6, 7, 8, 9]; return az.pesado(ds, ds.map(function (x) { return x >= 6 && x <= 8 ? 3 : 1; })); }

  /* ---------- generadores ---------- */
  function itemM1(az, nivel) {
    var cifras = nivel === 1 ? (az.prob(0.7) ? 2 : 3) : az.elegir([2, 3, 3]), a = 0, i;
    for (i = 0; i < cifras; i++) a = a * 10 + az.entero(1, 9);
    var d = pd(az, nivel), s = String(a), filas = [];
    for (i = 0; i < s.length; i++) {
      var dig = +s[s.length - 1 - i], mult = dig * Math.pow(10, i);
      filas.push({ k: i, dig: dig, mult: mult, parcial: d * mult });
    }
    return { tipo: 'M1', a: a, d: d, filas: filas, total: a * d };
  }
  function itemM2(az, nivel) { var c = az.elegir(COMP), d = az.entero(3, 9); return { tipo: 'M2', a: c[0], d: d, redondo: c[1], delta: c[2], p1: d * c[1], p2: d, total: c[0] * d }; }
  function itemM3(az, nivel) {
    var D, d;
    if (az.prob(0.5)) { D = az.elegir([12, 120, 1200, 12000]); d = az.elegir(MITADES[D]); } else { var p = az.elegir(OTRAS); D = p[0]; d = p[1]; }
    return { tipo: 'M3', D: D, d: d, q: D / d, familia: D === 12 || D === 120 || D === 1200 || D === 12000 };
  }
  function columnas(nums) { // suma en columna: s[c], carry-in y carry-out por columna (unidades primero)
    var cols = [], carry = 0;
    for (var c = 0; c < 4; c++) {
      var digs = nums.map(function (n) { return Math.floor(n / Math.pow(10, c)) % 10; });
      var s = digs.reduce(function (x, y) { return x + y; }, 0) + carry;
      cols.push({ digs: digs, entra: carry, s: s, anota: c < 3 ? s % 10 : s, lleva: c < 3 ? Math.floor(s / 10) : 0 });
      carry = Math.floor(s / 10);
    }
    return cols;
  }
  function itemM4(az) {
    for (var i = 0; i < 200; i++) {
      var nums = [az.entero(1000, 9999), az.entero(1000, 9999), az.entero(1000, 9999)], cols = columnas(nums);
      if (cols.some(function (c, k) { return k < 3 && c.s >= 20; })) return { tipo: 'M4', nums: nums, cols: cols, total: nums[0] + nums[1] + nums[2] };
    }
    var f = [1328, 1872, 3933]; return { tipo: 'M4', nums: f, cols: columnas(f), total: 7133 };
  }
  function generar(nivel, az) {
    var t = az.pesado(TIPOS[nivel].map(function (x) { return x[0]; }), TIPOS[nivel].map(function (x) { return x[1]; }));
    return t === 'M1' ? itemM1(az, nivel) : (t === 'M2' ? itemM2(az, nivel) : (t === 'M3' ? itemM3(az, nivel) : itemM4(az)));
  }

  /* ---------- pistas y clasificación ---------- */
  var OK = { ok: true, codigo: null, pista: null };
  function mal(codigo, pista) { return { ok: false, codigo: codigo, pista: pista }; }

  // Ceros: busca el producto parcial al que le falta (o le sobra) un cero.
  function explicarCero(a, d, resp) {
    var partes = CL.descomponer(a), vals = partes.map(function (x) { return x * d; });
    for (var i = 0; i < vals.length; i++) {
      var tot = 0; vals.forEach(function (v, j) { if (j !== i) tot += v; });
      if (vals[i] % 10 === 0 && tot + vals[i] / 10 === resp) return { v: partes[i], x: vals[i], y: vals[i] / 10 };
      if (tot + vals[i] * 10 === resp) return { v: partes[i], x: vals[i], y: vals[i] * 10 };
    }
    var c = a * d; return { v: a, x: c, y: resp };
  }
  function pistaMult(it, codigo, resp) {
    if (codigo === 'CERO_PERDIDO') { var e = explicarCero(it.a, it.d, resp); return 'Ojo con los ceros: ' + it.d + ' × ' + e.v + ' es ' + e.x + ', no ' + e.y + '.'; }
    if (codigo === 'MEZCLA_ESTRATEGIA') return it.a + ' está cerca de ' + it.redondo + '. Hacé ' + it.d + ' × ' + it.redondo + ' y después ' + (it.delta < 0 ? 'sacá lo que pusiste de más.' : 'sumá lo que te falta.');
    if (codigo === 'TABLA') return 'Revisá la tabla del ' + it.d + ' en cada parte.';
    if (codigo === 'RESERVA') return 'Mirá lo que te llevás al multiplicar: sumalo en la columna que sigue.';
    return 'Revisá la cuenta paso por paso.';
  }
  function validarMult(it, resp) { var cod = CL.clasificarMultiplicacion(it.a, it.d, resp); return cod ? mal(cod, pistaMult(it, cod, resp)) : OK; }
  function validarDiv(it, resp) {
    var cod = CL.clasificarDivision(it.D, it.d, resp);
    if (!cod) return OK;
    if (cod === 'MITAD_AUTOMATICA') return mal(cod, 'Leé el divisor: dividís por ' + miles(it.d) + ', no por 2. Comprobalo: ' + miles(resp) + ' × ' + miles(it.d) + ' = ?');
    if (cod === 'CERO_PERDIDO') return mal(cod, 'Ojo con los ceros. Comprobalo: ' + miles(resp) + ' × ' + miles(it.d) + ' = ?');
    return mal(cod, 'Comprobalo: ' + miles(resp) + ' × ' + miles(it.d) + ' = ?');
  }
  function validarSuma(nums, resp) { var cod = CL.clasificarSuma(nums, resp); return cod ? mal(cod, 'Revisá lo que te llevás al sumar cada columna.') : OK; }

  // Estimación previa (nivel 4): ¿más o menos que un número redondo cercano?
  function umbral(c) {
    var p = Math.pow(10, String(c).length - 1), t = Math.round(c / p) * p;
    if (t === c) t = c + p;
    return t;
  }
  function pasoEstimar(correcto) {
    var t = umbral(correcto), esp = correcto > t ? 'mas' : 'menos';
    return { id: 'estimar', kind: 'mm', label: '¿El resultado es más o menos que ' + miles(t) + '?', esp: esp, umbral: t,
      validar: function (v) { return v === esp ? OK : mal('ESTIMACION', 'Pensá en números redondos: ¿pasa de ' + miles(t) + ' o se queda corto?'); } };
  }
  function pasoDirecto(it, valFn, label, extra) {
    var esp = it.tipo === 'M3' ? it.q : it.total, p = { id: 'directo', kind: 'num', label: label, esp: esp, validar: function (v) { return valFn(it, v); } };
    if (extra) for (var k in extra) p[k] = extra[k];
    return p;
  }

  /* ---------- pasos de cada ítem según el nivel ---------- */
  function pasosDe(it, nivel) {
    var pasos = [], i;
    if (nivel === 4) {
      if (it.tipo === 'M1') { pasos.push(pasoEstimar(it.total)); pasos.push(pasoDirecto(it, validarMult, it.a + ' × ' + it.d + ' = ?')); }
      else if (it.tipo === 'M2') { pasos.push(pasoEstimar(it.total)); pasos.push(pasoDirecto(it, validarMult, it.a + ' × ' + it.d + ' = ?')); }
      else if (it.tipo === 'M3') { pasos.push(pasoEstimar(it.q)); pasos.push(pasoDirecto(it, validarDiv, miles(it.D) + ' : ' + miles(it.d) + ' = ?')); }
      else { pasos.push(pasoEstimar(it.total)); pasos.push({ id: 'directo', kind: 'num', label: 'Sumá los tres números.', esp: it.total, validar: function (v) { return validarSuma(it.nums, v); } }); }
      return pasos;
    }
    if (it.tipo === 'M1') {
      if (nivel === 2) pasos.push({ id: 'cuantas', kind: 'cuantas', label: '¿Cuántas filas necesitás para multiplicar ' + it.a + ' × ' + it.d + '?', esp: it.filas.length, opciones: [2, 3, 4],
        validar: function (v) { return v === it.filas.length ? OK : mal('OTRO', 'Una fila por cada cifra de ' + it.a + ': unidades, decenas…'); } });
      it.filas.forEach(function (f, i) {
        pasos.push({ id: 'fila' + i, kind: 'num', fila: i, hecho: it.d + 'x' + f.dig,
          label: nivel === 1 ? it.d + ' × ' + f.mult + ' = ?' : 'Multiplicá ' + it.d + ' por las ' + LUGARES[f.k] + ' de ' + it.a + '.', esp: f.parcial,
          validar: function (v) {
            if (v === f.parcial) return OK;
            if (f.parcial % 10 === 0 && (v === f.parcial / 10 || v === f.parcial * 10)) return mal('CERO_PERDIDO', 'Ojo con los ceros: ' + it.d + ' × ' + f.mult + ' es ' + f.parcial + ', no ' + v + '.');
            if (v === f.parcial * 10 || v === f.parcial / 10) return mal('CERO_PERDIDO', 'Ojo con los ceros: ' + it.d + ' × ' + f.mult + ' es ' + f.parcial + '.');
            if (Math.abs(v - f.parcial) === it.d * Math.pow(10, f.k)) return mal('TABLA', 'Revisá la tabla del ' + it.d + ': ' + it.d + ' × ' + f.dig + '.');
            return mal('OTRO', 'Revisá la cuenta: ' + it.d + ' × ' + f.mult + '.');
          } });
      });
      pasos.push({ id: 'suma', kind: 'num', label: 'Sumá todos los productos.', esp: it.total, validar: function (v) { return validarSuma(it.filas.map(function (f) { return f.parcial; }), v); } });
    } else if (it.tipo === 'M2') {
      var signo = it.delta < 0 ? '−' : '+';
      if (nivel === 2) {
        pasos.push({ id: 'p1', kind: 'num', hecho: null, label: it.a + ' es casi ' + it.redondo + '. ¿Cuánto da ' + it.d + ' × ' + it.redondo + '?', esp: it.p1,
          validar: function (v) { return v === it.p1 ? OK : mal(Math.abs(v * 10 - it.p1) < 1 || v === it.p1 / 10 || v === it.p1 * 10 ? 'CERO_PERDIDO' : 'OTRO', 'Ojo con los ceros: ' + it.d + ' × ' + it.redondo + '.'); } });
        pasos.push({ id: 'p2', kind: 'num', label: 'Te pasaste (o te faltó) ' + Math.abs(it.delta) + ' de ' + it.d + '. ¿Cuánto da ' + it.d + ' × ' + Math.abs(it.delta) + '?', esp: it.p2,
          validar: function (v) { return v === it.p2 ? OK : mal('OTRO', it.d + ' × 1 es ' + it.d + '.'); } });
        pasos.push(pasoDirecto(it, validarMult, 'Ahora ' + (it.delta < 0 ? 'sacá' : 'sumá') + ': ' + it.p1 + ' ' + signo + ' ' + it.p2 + ' = ?'));
      } else {
        pasos.push(pasoDirecto(it, validarMult, it.a + ' × ' + it.d + ' = ?', { opcional: { label: 'Paso del medio (opcional): ' + it.d + ' × ' + it.redondo + ' = ?', esp: it.p1 } }));
      }
    } else if (it.tipo === 'M3') {
      pasos.push(pasoDirecto(it, validarDiv, miles(it.D) + ' : ' + miles(it.d) + ' = ?'));
      if (nivel <= 2) pasos.push({ id: 'comprobar', kind: 'num', label: 'Comprobalo: ' + miles(it.q) + ' × ' + miles(it.d) + ' = ?', esp: it.D,
        validar: function (v) { return v === it.D ? OK : mal('OTRO', 'Tiene que dar ' + miles(it.D) + '. Si no da, revisá tu respuesta.'); } });
    } else { // M4: suma en columna
      it.cols.forEach(function (c, k) {
        var lug = ['unidades', 'decenas', 'centenas', 'unidades de mil'][k];
        var det = c.digs.join(' + ') + (c.entra ? ' + ' + c.entra + ' (lo que te llevaste)' : '');
        pasos.push({ id: 'col' + k, kind: 'num', col: k, fase: 'suma', label: 'Columna de las ' + lug + ': ' + det + ' = ?', esp: c.s,
          validar: function (v) { return v === c.s ? OK : mal(Math.abs(v - c.s) <= 2 ? 'RESERVA' : 'OTRO', c.entra ? 'No te olvides de sumar lo que te llevaste: ' + c.entra + '.' : 'Sumá con calma los tres números de la columna.'); } });
        if (k < 3) {
          var hint = 'En esa columna te dio ' + c.s + ': anotás ' + c.anota + ' y te llevás ' + c.lleva + '.';
          pasos.push({ id: 'anoto' + k, kind: 'num', col: k, fase: 'anoto', label: '¿Qué número anotás abajo?', esp: c.anota, validar: function (v) { return v === c.anota ? OK : mal('RESERVA', hint); } });
          pasos.push({ id: 'lleva' + k, kind: 'num', col: k, fase: 'lleva', label: '¿Cuánto te llevás?', esp: c.lleva, validar: function (v) { return v === c.lleva ? OK : mal('RESERVA', hint); } });
        }
      });
    }
    return pasos;
  }

  var api = { TIPOS: TIPOS, RONDA: RONDA, MAX_NIVEL: MAX_NIVEL, CONTROLES: CONTROLES, LUGARES: LUGARES, COMP: COMP, generar: generar, pasosDe: pasosDe, columnas: columnas, umbral: umbral, miles: miles,
              itemM1: itemM1, itemM2: itemM2, itemM3: itemM3, itemM4: itemM4 };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_CEROS = api; }
})(typeof window !== 'undefined' ? window : this);
