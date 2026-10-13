/* Fracciones de 4to — modelos de figuras con áreas exactas, catálogo y trampas. Lógica pura, sin DOM.
   Patrón UMD sin módulos: window.REF4_FIG. Versión 1.0.0 (2026-10-13). Depende de REF4_FR.
   Figura = {tipo, ancho, alto, regiones:[{id, path, area, cx, cy}], pintadas:[ids], unidad, partes, guia:[paths], iguales}
   - Coordenadas en unidades de cuadrícula (enteras en los polígonos, así el área sale exacta con la fórmula del zapato).
   - En los círculos el área de cada sector es ángulo/360 (fracción del círculo).
   - unidad: el área de la parte igual más grande en la que cada región entra una cantidad entera de veces
     (el MCD de las áreas). partes = área total / unidad. guia: las líneas que muestra "Ver cuadrícula". */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var FR = (typeof module !== 'undefined' && module.exports) ? require('./fracciones-lib.js') : root.REF4_FR;
  var fr = FR.fr;

  /* ---------- geometría ---------- */
  function areaPoligono(pts) { // área exacta (fracción) con coordenadas enteras
    var s = 0; for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return FR.simplificar(fr(Math.abs(s), 2));
  }
  function pathPoligono(pts) { return 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + ' Z'; }
  function centro(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
  function poli(id, pts) { var c = centro(pts); return { id: id, path: pathPoligono(pts), area: areaPoligono(pts), cx: c[0], cy: c[1], pts: pts }; }
  function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  function linea(x1, y1, x2, y2) { return 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2; }
  function redondo(v) { return Math.round(v * 1000) / 1000; }

  // Arma la figura: calcula unidad, partes e igualdad de partes.
  function figura(tipo, ancho, alto, regiones, guia, extra) {
    var L = regiones.reduce(function (m, r) { return FR.mcm(m, r.area.d); }, 1);
    var nums = regiones.map(function (r) { return r.area.n * L / r.area.d; });
    var g = nums.reduce(function (a, b) { return FR.mcd(a, b); });
    var total = nums.reduce(function (a, b) { return a + b; }, 0);
    var f = { tipo: tipo, ancho: ancho, alto: alto, regiones: regiones, pintadas: [], unidad: FR.simplificar(fr(g, L)), partes: total / g,
      guia: guia || [], iguales: nums.every(function (n) { return n === nums[0]; }) };
    if (extra) for (var k in extra) f[k] = extra[k];
    return f;
  }
  function areaTotal(fig) { return fig.regiones.reduce(function (s, r) { return FR.sumar(s, r.area); }, fr(0, 1)); }
  function fraccionPintada(fig) {
    var p = fig.regiones.filter(function (r) { return fig.pintadas.indexOf(r.id) >= 0; }).reduce(function (s, r) { return FR.sumar(s, r.area); }, fr(0, 1));
    var t = areaTotal(fig); return FR.simplificar(fr(p.n * t.d, p.d * t.n));
  }
  function partesIguales(fig) { return fig.iguales; }
  function pintar(fig, ids) { var c = JSON.parse(JSON.stringify(fig)); c.pintadas = ids.slice(); return c; }
  // Partes iguales (en unidades) que ocupa cada región.
  function partesDe(fig, id) { var r = fig.regiones.filter(function (x) { return x.id === id; })[0]; var u = fig.unidad; return (r.area.n * u.d) / (r.area.d * u.n); }

  /* ---------- catálogo ---------- */
  // Tiras verticales (una al lado de la otra) o, con horizontal, una arriba de la otra. anchos: [1,1,1,3] (desiguales) o n iguales.
  function tiras(anchos, op) {
    op = op || {};
    if (typeof anchos === 'number') { var a = []; for (var i = 0; i < anchos; i++) a.push(op.ancho || 1); anchos = a; }
    var W = anchos.reduce(function (s, x) { return s + x; }, 0), H = op.alto || Math.max(2, Math.min(4, Math.round(W * 0.5))), x = 0, reg = [], guia = [];
    anchos.forEach(function (w, i) { reg.push(poli('r' + i, rectPts(x, 0, w, H))); x += w; });
    for (var k = 1; k < W; k++) guia.push(linea(k, 0, k, H));
    var f = figura(op.horizontal ? 'tiras_h' : 'tiras_v', W, H, reg, guia, { anchos: anchos });
    if (op.horizontal) girar(f);
    return f;
  }
  function girar(f) { // intercambia x e y (tiras horizontales)
    f.regiones.forEach(function (r) { r.pts = r.pts.map(function (p) { return [p[1], p[0]]; }); r.path = pathPoligono(r.pts); var c = centro(r.pts); r.cx = c[0]; r.cy = c[1]; });
    f.guia = f.guia.map(function (g) { var m = /M(\S+) (\S+) L(\S+) (\S+)/.exec(g); return linea(+m[2], +m[1], +m[4], +m[3]); });
    var t = f.ancho; f.ancho = f.alto; f.alto = t;
  }
  function cuadricula(a, b) {
    var reg = [], guia = [];
    for (var y = 0; y < b; y++) for (var x = 0; x < a; x++) reg.push(poli('r' + reg.length, rectPts(x, y, 1, 1)));
    return figura('cuadricula', a, b, reg, guia, { cols: a, filas: b });
  }
  // Círculo en sectores: n iguales o una lista de ángulos (múltiplos de 45°) que suman 360.
  function circulo(n, angulos) {
    angulos = angulos || (function () { var a = []; for (var i = 0; i < n; i++) a.push(360 / n); return a; })();
    var R = 4, C = 4, ang = -90, reg = [], guia = [];
    angulos.forEach(function (g, i) {
      var a0 = ang * Math.PI / 180, a1 = (ang + g) * Math.PI / 180, am = (ang + g / 2) * Math.PI / 180;
      var x0 = redondo(C + R * Math.cos(a0)), y0 = redondo(C + R * Math.sin(a0)), x1 = redondo(C + R * Math.cos(a1)), y1 = redondo(C + R * Math.sin(a1));
      var path = g === 360 ? 'M' + C + ' ' + (C - R) + ' A' + R + ' ' + R + ' 0 1 1 ' + (C - 0.001) + ' ' + (C - R) + ' Z'
        : 'M' + C + ' ' + C + ' L' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + (g > 180 ? 1 : 0) + ' 1 ' + x1 + ' ' + y1 + ' Z';
      reg.push({ id: 'r' + i, path: path, area: FR.simplificar(fr(g, 360)), cx: redondo(C + R * 0.55 * Math.cos(am)), cy: redondo(C + R * 0.55 * Math.sin(am)), grados: g });
      ang += g;
    });
    var f = figura('circulo', 8, 8, reg, [], { angulos: angulos });
    var paso = f.unidad.n * 360 / f.unidad.d; // ángulo de la unidad
    for (var t = -90; t < 270; t += paso) { var r = t * Math.PI / 180; f.guia.push(linea(C, C, redondo(C + R * Math.cos(r)), redondo(C + R * Math.sin(r)))); }
    return f;
  }
  // Cuadrado con las dos diagonales (4 triángulos) o con diagonales y medianas (8 triángulos).
  function cuadradoDiagonales(n) {
    var S = 4, c = [2, 2], reg = [];
    var bordes = n === 8 ? [[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 4], [0, 4], [0, 2]] : [[0, 0], [4, 0], [4, 4], [0, 4]];
    for (var i = 0; i < bordes.length; i++) reg.push(poli('r' + i, [c, bordes[i], bordes[(i + 1) % bordes.length]]));
    return figura(n === 8 ? 'cuadrado_8' : 'cuadrado_4', S, S, reg, []);
  }
  // Rombo inscripto: vértices en los puntos medios de los lados. El rombo es 1/2.
  function rombo() {
    var reg = [poli('r0', [[2, 0], [4, 2], [2, 4], [0, 2]]), poli('r1', [[0, 0], [2, 0], [0, 2]]), poli('r2', [[2, 0], [4, 0], [4, 2]]), poli('r3', [[4, 2], [4, 4], [2, 4]]), poli('r4', [[0, 2], [2, 4], [0, 4]])];
    return figura('rombo', 4, 4, reg, [linea(2, 0, 2, 4), linea(0, 2, 4, 2)]);
  }
  // Triángulo partido en 4 o en 9 triángulos iguales.
  function triangulo(n) {
    var reg = [];
    if (n === 4) {
      reg = [poli('r0', [[2, 0], [1, 2], [3, 2]]), poli('r1', [[1, 2], [0, 4], [2, 4]]), poli('r2', [[1, 2], [3, 2], [2, 4]]), poli('r3', [[3, 2], [2, 4], [4, 4]])];
      return figura('triangulo_4', 4, 4, reg, []);
    }
    var P = function (f, k) { return [3 - f + 2 * k, f * 2]; }; // fila f (0..3), posición k: puntos de la malla
    var id = 0;
    for (var f = 0; f < 3; f++) {
      for (var k = 0; k <= f; k++) reg.push(poli('r' + id++, [P(f, k), P(f + 1, k), P(f + 1, k + 1)]));        // hacia arriba
      for (k = 0; k < f; k++) reg.push(poli('r' + id++, [P(f, k), P(f, k + 1), P(f + 1, k + 1)]));             // hacia abajo
    }
    return figura('triangulo_9', 6, 6, reg, []);
  }
  // Figuras de cuadraditos: lista de celdas [x, y].
  var POLIOMINOS = {
    L4: [[0, 0], [0, 1], [0, 2], [1, 2]], T4: [[0, 0], [1, 0], [2, 0], [1, 1]], escalera4: [[0, 0], [0, 1], [1, 1], [1, 2]],
    L6: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]], cruz5: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], T5: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
    escalera6: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]], L8: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [1, 2]], cruz8: [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2]]
  };
  function poliomino(nombre) {
    var celdas = POLIOMINOS[nombre], W = 0, H = 0;
    var reg = celdas.map(function (c, i) { W = Math.max(W, c[0] + 1); H = Math.max(H, c[1] + 1); return poli('r' + i, rectPts(c[0], c[1], 1, 1)); });
    return figura('poliomino_' + nombre, W, H, reg, [], { cuadraditos: celdas.length });
  }
  // Partes de igual área y distinta forma: 4 × 2 con dos tiras laterales 1 × 2 y el centro en dos 2 × 1 → 4 partes de 1/4.
  function igualArea() {
    var reg = [poli('r0', rectPts(0, 0, 1, 2)), poli('r1', rectPts(1, 0, 2, 1)), poli('r2', rectPts(1, 1, 2, 1)), poli('r3', rectPts(3, 0, 1, 2))];
    var guia = [linea(1, 0, 1, 2), linea(2, 0, 2, 2), linea(3, 0, 3, 2), linea(0, 1, 4, 1)];
    return figura('igual_area', 4, 2, reg, guia);
  }
  // "Cuarto escondido": 4 × 2 con una línea horizontal al medio; abajo, un 2 × 1 en una esquina. Se ven 3 pedazos; lo pintado es 1/4.
  function cuartoEscondido() {
    var reg = [poli('r0', rectPts(0, 0, 4, 1)), poli('r1', rectPts(0, 1, 2, 1)), poli('r2', rectPts(2, 1, 2, 1))];
    var f = figura('cuarto_escondido', 4, 2, reg, [linea(2, 0, 2, 1)]);
    f.pintadas = ['r1'];
    return f;
  }

  /* ---------- helpers para los generadores ---------- */
  // Elige regiones para pintar justo `objetivo` del área (solo figuras de partes iguales o casi). null si no se puede.
  function pintarFraccion(fig, objetivo, az) {
    var ids = fig.regiones.map(function (r) { return r.id; }), orden = az ? az.mezclar(ids) : ids, total = areaTotal(fig), elegidas = [], acum = fr(0, 1);
    var meta = FR.simplificar(fr(objetivo.n * total.n, objetivo.d * total.d));
    for (var i = 0; i < orden.length && FR.comparar(acum, meta) < 0; i++) {
      var r = fig.regiones.filter(function (x) { return x.id === orden[i]; })[0], prueba = FR.sumar(acum, r.area);
      if (FR.comparar(prueba, meta) <= 0) { acum = prueba; elegidas.push(r.id); }
    }
    return FR.iguales(acum, meta) ? pintar(fig, elegidas) : null;
  }
  // Una muestra de cada tipo del catálogo (para las pruebas y para elegir al azar).
  function catalogo() {
    return [tiras(4), tiras(8, { horizontal: true }), tiras([1, 1, 1, 3]), tiras([2, 1, 1]), cuadricula(4, 2), cuadricula(3, 3), circulo(4), circulo(8), circulo(0, [90, 90, 180]),
      circulo(0, [45, 45, 90, 180]), cuadradoDiagonales(4), cuadradoDiagonales(8), rombo(), triangulo(4), triangulo(9),
      poliomino('L4'), poliomino('T4'), poliomino('cruz5'), poliomino('escalera6'), poliomino('L8'), igualArea(), cuartoEscondido()];
  }

  var api = {
    VERSION: VERSION, areaPoligono: areaPoligono, figura: figura, areaTotal: areaTotal, fraccionPintada: fraccionPintada, partesIguales: partesIguales,
    pintar: pintar, partesDe: partesDe, tiras: tiras, cuadricula: cuadricula, circulo: circulo, cuadradoDiagonales: cuadradoDiagonales, rombo: rombo,
    triangulo: triangulo, poliomino: poliomino, POLIOMINOS: POLIOMINOS, igualArea: igualArea, cuartoEscondido: cuartoEscondido,
    pintarFraccion: pintarFraccion, catalogo: catalogo
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_FIG = api; }
})(typeof window !== 'undefined' ? window : this);
