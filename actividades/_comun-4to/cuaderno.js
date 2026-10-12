/* Dibuja una división "como en la carpeta": cuadrícula, galera, casillero del cociente, restas escritas,
   flechas de bajada y tabla del divisor. Se usa en la Actividad 1 (interactiva) y en la 4 (solo lectura).
   Solo dibuja; no sabe nada de pasos ni de errores. window.REF4_CUADERNO.dibujar(contenedor, vista, opts) */
(function (root) {
  'use strict';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* vista = {
       dividendo:'976', divisor:7, cocienteLen:3, cociente:'13', igual:'139'|null, totalVueltas:3,
       vueltas:[{colInicio, colFin, producto:'7'|null, resta:'2'|null, bajada:digito|null, final:bool, vieja:bool, errProducto, errResta}],
       tabla:[{q, p:'7'|null, estado:'normal'|'activa'|'res'|'error'|'hueco'}], sinTabla:bool,
       activo:{zona:'casita'|'producto'|'resta'|'parcial'|'bajar', vuelta, buf:'', len, cols:[..]},
       marcas:{sel:'cociente'|'tabla'|'resto'|'cuenta', error:'...'}, zonas:bool, parcial:{colFin}|null }
     opts = {ancho, mini, onCol(col), onFila(q), onZona(z)} */
  function calcCelda(ancho, n, cocLen, mini) {
    var cols = 1 + n + 0.3 + 2.6 + Math.max(cocLen, 1) + 0.5;
    var c = Math.floor(ancho / cols);
    return Math.max(mini ? 14 : 22, Math.min(mini ? 24 : 38, c));
  }

  function dibujar(cont, vista, opts) {
    opts = opts || {};
    var n = vista.dividendo.length, cl = Math.max(vista.cocienteLen || vista.cociente.length, 1);
    var anchoTotal = opts.ancho || cont.clientWidth || 360;
    var sinTabla = !!vista.sinTabla;
    var anchoCuenta = (!sinTabla && anchoTotal > 700) ? anchoTotal - 190 : anchoTotal;
    var c = opts.celda || calcCelda(Math.min(anchoCuenta - 4, 560), n, cl, opts.mini);
    var off = 1, xLinea = (off + n) * c + c * 0.25, xR = xLinea + c * 0.35;
    var xCasitaFin = xR + cl * c + c * 0.15;
    var nV = vista.totalVueltas || vista.vueltas.length;
    var ancho = xR + (2.6 + cl) * c, alto = (1 + 2 * nV + 0.4) * c;
    var X = function (col) { return (off + col) * c; };
    var Y = function (row) { return row * c; };
    var act = vista.activo || {}, marcas = vista.marcas || {};
    var html = '', svg = '';

    function cel(txt, x, y, cls, extra) {
      return '<div class="cel ' + (cls || '') + '" style="left:' + x + 'px;top:' + y + 'px;width:' + c + 'px;height:' + c + 'px;font-size:' + Math.round(c * 0.62) + 'px"' + (extra || '') + '>' + esc(txt) + '</div>';
    }
    // número alineado a la derecha, terminando en la columna E
    function numero(txt, E, row, cls, extra) {
      var s = '', L = String(txt).length;
      for (var i = 0; i < L; i++) s += cel(String(txt)[i], X(E - L + 1 + i), Y(row), cls, extra);
      return s;
    }
    function slot(E, row, len, buf) {
      len = Math.max(len || 1, buf.length); var s = '';
      for (var i = 0; i < len; i++) {
        var ch = buf.length - len + i >= 0 ? buf[buf.length - len + i] : '';
        s += cel(ch, X(E - len + 1 + i), Y(row), 'slot');
      }
      return s;
    }
    function raya(x1, y1, x2, y2) { return '<line class="raya" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; }

    // --- dividendo (fila 0) ---
    var clickables = (act.zona === 'parcial' || act.zona === 'bajar') && opts.onCol;
    var pulsar = act.cols || [];
    for (var i = 0; i < n; i++) {
      var cls = (clickables ? 'click ' : '') + (pulsar.indexOf(i) >= 0 ? 'pulsa' : '');
      html += cel(vista.dividendo[i], X(i), Y(0), cls, ' data-col="' + i + '"' + (clickables ? ' role="button" tabindex="0" aria-label="cifra ' + vista.dividendo[i] + '"' : ''));
    }
    // --- divisor y "= cociente" (fila 0) ---
    html += cel(String(vista.divisor), xR, Y(0), '');
    if (vista.igual) {
      html += cel('=', xR + c * 1.05, Y(0), 'ok');
      for (var q = 0; q < vista.igual.length; q++) html += cel(vista.igual[q], xR + c * (2.05 + q), Y(0), 'ok');
    }
    // --- casillero (fila 1, a la derecha de la galera) ---
    for (var k = 0; k < vista.cociente.length; k++) html += cel(vista.cociente[k], xR + k * c, Y(1), vista.errCasita === k ? 'error' : '');
    if (act.zona === 'casita') html += cel(act.buf ? act.buf.slice(-1) : '', xR + act.vuelta * c, Y(1), 'slot') +
      (act.buf && act.buf.length > 1 ? cel(act.buf.slice(0, -1), xR + (act.vuelta - 1) * c, Y(1), 'slot') : '');

    // --- vueltas ---
    svg += raya(xLinea, Y(0), xLinea, alto);                       // galera
    svg += raya(xLinea, Y(1), xCasitaFin, Y(1));                   // raya del divisor / techo del casillero
    svg += raya(xCasitaFin, Y(1), xCasitaFin, Y(2));               // pared derecha del casillero
    vista.vueltas.forEach(function (v, vi) {
      var rP = 2 * vi + 1, rR = 2 * vi + 2, vcls = v.vieja ? 'vieja' : '';
      if (v.producto !== null && v.producto !== undefined) {
        var L = String(v.producto).length, ini = v.colFin - L + 1;
        html += numero(v.producto, v.colFin, rP, vcls + (v.errProducto ? ' error' : ''));
        html += cel('−', X(ini - 1), Y(rP), 'menos ' + vcls);
        svg += raya(X(ini - 1) + c * 0.1, Y(rR), X(v.colFin + 1) - c * 0.1, Y(rR));
      } else if (act.zona === 'producto' && act.vuelta === vi) {
        var Lp = Math.max(act.len || 1, (act.buf || '').length);
        html += slot(v.colFin, rP, act.len, act.buf || '');
        html += cel('−', X(v.colFin - Lp), Y(rP), 'menos');
        svg += raya(X(v.colFin - Lp) + c * 0.1, Y(rR), X(v.colFin + 1) - c * 0.1, Y(rR));
      }
      if (v.resta !== null && v.resta !== undefined) {
        html += numero(v.resta, v.colFin, rR, vcls + (v.errResta ? ' error' : ''));
        if (v.final) html += cel('/', X(v.colFin + 1) - c * 0.1, Y(rR), 'menos ' + vcls);
        if (v.bajada !== null && v.bajada !== undefined) {
          html += cel(String(v.bajada), X(v.colFin + 1), Y(rR), vcls);
          var xf = X(v.colFin + 1) + c / 2;
          svg += '<path class="flecha" d="M' + xf + ' ' + (Y(1) - c * 0.12) + ' L' + xf + ' ' + (Y(rR) + c * 0.12) + '"/>' +
                 '<polygon class="flecha-punta" points="' + (xf - 4) + ',' + (Y(rR) + c * 0.12 - 7) + ' ' + (xf + 4) + ',' + (Y(rR) + c * 0.12 - 7) + ' ' + xf + ',' + (Y(rR) + c * 0.12 + 1) + '"/>';
        }
      } else if (act.zona === 'resta' && act.vuelta === vi) {
        html += slot(v.colFin, rR, act.len, act.buf || '');
      }
    });

    // --- zonas clickeables (Actividad 4) ---
    var zonas = '';
    if (vista.zonas && opts.onZona) {
      var ult = vista.vueltas[vista.vueltas.length - 1], nv = vista.vueltas.length;
      var z = function (nombre, x, y, w, h) {
        zonas += '<div class="zona' + (marcas.sel === nombre ? ' sel' : '') + (marcas.error === nombre ? ' error' : '') + '" role="button" tabindex="0" aria-label="' + nombre + '" data-z="' + nombre + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px"></div>';
      };
      z('cuenta', 0, Y(1), xLinea, Y(2 * nv + 1) - Y(1));
      z('cociente', xR - c * 0.1, Y(1), xCasitaFin - xR + c * 0.2, c);
      if (ult) z('resto', X(ult.colFin - 1), Y(2 * nv), c * 3, c);
    }

    var caja = '<div class="cuenta-caja" data-z-area style="width:' + ancho + 'px;height:' + alto + 'px;background-size:' + c + 'px ' + c + 'px;background-position:0 0">' +
      html + zonas + '<svg width="' + ancho + '" height="' + alto + '" viewBox="0 0 ' + ancho + ' ' + alto + '" aria-hidden="true">' + svg + '</svg></div>';

    // --- tabla del divisor ---
    var tabla = '';
    if (!sinTabla && vista.tabla) {
      tabla = '<div class="tabla-div" data-z="tabla" aria-label="Tabla del ' + vista.divisor + '">' + vista.tabla.map(function (f) {
        var clic = opts.onFila && f.p !== null && f.estado !== 'hueco' ? ' click' : '';
        var p = f.p === null ? '<span class="hueco">' + (f.estado === 'activa' ? esc((act.buf || '') || ' ') : ' ') + '</span>' : esc(f.p);
        return '<div class="fila' + clic + (f.estado === 'res' ? ' res' : '') + (f.estado === 'activa' ? ' activa' : '') + (f.estado === 'error' ? ' error' : '') + '" data-q="' + f.q + '">' +
          '<span>' + vista.divisor + ' × ' + f.q + ' =</span> ' + p + '</div>';
      }).join('') + '</div>';
    }
    cont.innerHTML = '<div class="cuaderno">' + caja + tabla + '</div>';

    cont.onclick = function (e) {
      var t = e.target.closest('[data-col],[data-q],[data-z]');
      if (!t) return;
      if (t.dataset.col !== undefined && opts.onCol && clickables) opts.onCol(+t.dataset.col);
      else if (t.dataset.q !== undefined && opts.onFila && t.classList.contains('click')) opts.onFila(+t.dataset.q);
      else if (t.dataset.z !== undefined && opts.onZona) opts.onZona(t.dataset.z);
    };
    cont.onkeydown = function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-col],[data-z]')) { e.preventDefault(); e.target.click(); } };
    return { celda: c };
  }

  root.REF4_CUADERNO = { dibujar: dibujar, calcCelda: calcCelda };
})(window);
