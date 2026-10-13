/* Fracciones de 4to — widgets de interfaz y marco común de las actividades (con DOM).
   Depende de: MATE, REF4_UI, REF4_EV, REF4_AZAR, REF4_FR. Sin módulos: window.REF4_FRUI. Versión 1.0.0 (2026-10-13).
   - Mostrar fracciones apiladas (fraccionHTML, conFracciones) con aria-label en palabras.
   - Ingreso de fracciones: casillas [entero] [numerador / denominador] + teclado numérico común.
   - Dibujos SVG: figuras tocables, tiras, muro, potes, barra de kilos, jarra y vasos, objetos de los repartos.
   - actividad(cfg): rondas, mezcla de tipos, módulo de la escuela, "Me perdí", 🔊, "¿Qué aprendiste?", debug y eventos. */
(function (root) {
  'use strict';
  var VERSION = '1.0.0';
  var UI = root.REF4_UI, FR = root.REF4_FR, EV = root.REF4_EV;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var FRUI = { VERSION: VERSION, esc: esc };

  /* ==================== fracciones en pantalla ==================== */
  // fraccionHTML(f, {mixto, unidad}) → fracción apilada (nunca barra inclinada), con su lectura en aria-label.
  FRUI.fraccionHTML = function (f, op) {
    op = op || {};
    var lect = esc(FR.leer(f, { mixto: op.mixto, unidad: op.unidad })), u = op.unidad ? '<span class="fr-u">' + esc(op.unidad) + '</span>' : '';
    if (FR.esEntero(f)) return '<span class="fr-num" role="img" aria-label="' + lect + '">' + (f.n / f.d) + u + '</span>';
    var m = op.mixto ? FR.aMixto(f) : { entero: 0, n: f.n, d: f.d };
    return '<span class="fr-num" role="img" aria-label="' + lect + '">' + (m.entero ? '<span class="fr-e">' + m.entero + '</span>' : '') +
      '<span class="fr-ap"><span class="fr-n">' + m.n + '</span><span class="fr-d">' + m.d + '</span></span>' + u + '</span>';
  };
  // conFracciones("Tenía 1 3/4 kg") → texto escapado con las fracciones apiladas.
  FRUI.conFracciones = function (texto) {
    var t = esc(texto);
    t = t.replace(/(\d+)\s(\d+)\/(\d+)/g, function (_, e, n, d) { return FRUI.fraccionHTML(FR.deMixto(+e, +n, +d), { mixto: true }); });
    t = t.replace(/(\d+)\/(\d+)/g, function (_, n, d) { return +d === 0 ? n + ' sobre ' + d : FRUI.fraccionHTML(FR.fr(+n, +d)); });
    return t;
  };
  FRUI.globo = function (texto, tipo) {
    var g = $('#globo'); if (!g) return;
    if (!texto) { g.className = ''; g.innerHTML = ''; return; }
    g.className = 'ver' + (tipo ? ' ' + tipo : ''); g.innerHTML = FRUI.conFracciones(texto);
    g.onclick = function () { FRUI.globo(null); };
  };

  /* ==================== voz (🔊) ==================== */
  var voz = null;
  function elegirVoz() {
    if (!root.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices();
    return vs.filter(function (v) { return /^es[-_]AR/i.test(v.lang); })[0] || vs.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
  }
  if (root.speechSynthesis) { voz = elegirVoz(); speechSynthesis.onvoiceschanged = function () { voz = elegirVoz(); document.querySelectorAll('.fr-voz').forEach(function (b) { b.hidden = !voz; }); }; }
  FRUI.hayVoz = function () { return !!voz; };
  FRUI.hablar = function (texto) {
    if (!voz) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(FR.paraVoz(texto)); u.voice = voz; u.lang = voz.lang; u.rate = 0.95; speechSynthesis.speak(u);
    return true;
  };

  /* ==================== opciones ==================== */
  // lista: [{html | texto, valor}], onElegir(valor, boton, i). clase: 'texto' para frases largas.
  FRUI.opciones = function (cont, lista, onElegir, clase) {
    cont.innerHTML = '<div class="fr-opciones' + (clase ? ' ' + clase : '') + '">' + lista.map(function (o, i) {
      return '<button type="button" class="ref-opcion' + (clase === 'texto' ? ' texto' : '') + '" data-i="' + i + '">' + (o.html !== undefined ? o.html : FRUI.conFracciones(o.texto)) + '</button>';
    }).join('') + '</div>';
    cont.onclick = function (e) { var b = e.target.closest('[data-i]'); if (b && !b.disabled) onElegir(lista[+b.dataset.i].valor, b, +b.dataset.i); };
  };

  /* ==================== ingreso de fracciones ==================== */
  /* ingreso(cont, {modo:'fraccion'|'mixto'|'entero', onOk(f, forma, campos), etiqueta})
     Casillas [entero] [num / den]: se toca una para elegirla y se completa con el teclado; hasta 2 cifras por casilla. */
  FRUI.ingreso = function (cont, op) {
    var modo = op.modo || 'fraccion', campos = { entero: '', num: '', den: '' };
    var orden = modo === 'entero' ? ['entero'] : (modo === 'mixto' ? ['entero', 'num', 'den'] : ['num', 'den']), activo = orden[0];
    function casilla(k, aria) { return '<button type="button" class="fr-casilla' + (k === activo ? ' on' : '') + '" data-c="' + k + '" aria-label="' + aria + '">' + (campos[k] || '') + '</button>'; }
    function pintar() {
      var h = '<div class="fr-ingreso" role="group" aria-label="' + esc(op.etiqueta || 'Tu respuesta') + '">';
      if (modo !== 'fraccion') h += casilla('entero', 'enteros');
      if (modo !== 'entero') h += '<span class="fr-ap fr-ap-in">' + casilla('num', 'numerador, arriba') + casilla('den', 'denominador, abajo') + '</span>';
      h += (op.sufijo ? '<span class="fr-sufijo">' + esc(op.sufijo) + '</span>' : '') + '</div><div class="ref-teclado fr-teclado"></div>';
      cont.innerHTML = h;
      cont.querySelector('.fr-ingreso').onclick = function (e) { var b = e.target.closest('[data-c]'); if (b) { activo = b.dataset.c; refrescar(); } };
      var tk = cont.querySelector('.fr-teclado');
      UI.teclado(tk, {
        digito: function (d) { if (campos[activo].length < 2) campos[activo] += d; refrescar(); },
        borrar: function () { if (campos[activo]) campos[activo] = campos[activo].slice(0, -1); else { var i = orden.indexOf(activo); if (i > 0) { activo = orden[i - 1]; campos[activo] = campos[activo].slice(0, -1); } } refrescar(); },
        ok: function () {
          var f = FR.parsear(campos);
          if (f.error) { FRUI.globo(f.error === 'DEN_CERO' ? FR.PISTA_DEN_CERO : 'Completá las casillas: tocá una y escribí el número.', 'tip'); UI.sonar('mal'); return; }
          op.onOk(f, FR.forma(campos), { entero: campos.entero, num: campos.num, den: campos.den });
        }
      });
      tk.classList.add('fr-teclado'); // REF4_UI.teclado pisa la clase
    }
    function refrescar() { cont.querySelectorAll('.fr-casilla').forEach(function (b) { var k = b.dataset.c; b.textContent = campos[k]; b.classList.toggle('on', k === activo); }); }
    // Teclado físico: "/" o flechas cambian de casilla.
    var kd = function (e) { if (!cont.isConnected) { document.removeEventListener('keydown', kd); return; }
      var i = orden.indexOf(activo);
      if ((e.key === '/' || e.key === 'ArrowRight' || e.key === ' ') && i < orden.length - 1) { e.preventDefault(); activo = orden[i + 1]; refrescar(); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); activo = orden[i - 1]; refrescar(); } };
    document.addEventListener('keydown', kd);
    pintar();
    return { limpiar: function () { campos = { entero: '', num: '', den: '' }; activo = orden[0]; refrescar(); }, campos: function () { return campos; } };
  };

  /* ==================== dibujos SVG ==================== */
  // Figura con regiones tocables. op: {px (ancho máx.), tocable, guia, sel:[ids] (marcadas por el chico), etiqueta}
  FRUI.figuraSVG = function (fig, op) {
    op = op || {};
    var W = fig.ancho, H = fig.alto, pad = 0.12, px = op.px || 220, alto = Math.round(px * H / W);
    var pint = op.sel || fig.pintadas;
    var h = '<svg class="fr-fig' + (op.tocable ? ' tocable' : '') + '" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (W + 2 * pad) + ' ' + (H + 2 * pad) + '" width="' + px + '" height="' + alto + '" role="img" aria-label="' + esc(op.etiqueta || 'figura') + '">';
    fig.regiones.forEach(function (r) {
      h += '<path d="' + r.path + '" class="fr-reg' + (pint.indexOf(r.id) >= 0 ? ' pint' : '') + '" data-r="' + r.id + '"' + (op.tocable ? ' tabindex="0" role="button" aria-pressed="' + (pint.indexOf(r.id) >= 0) + '" aria-label="parte"' : '') + '/>';
    });
    if (op.guia) fig.guia.concat(op.guiaExtra || []).forEach(function (g) { h += '<path d="' + g + '" class="fr-guia"/>'; });
    return h + '</svg>';
  };
  // Tira partida en d partes iguales. op: {pintadas, pintadas2 (segundo color, a continuación), tachadas:[i], ancho (0-1 del largo), alto, etiqueta, borde}
  FRUI.tiraSVG = function (d, op) {
    op = op || {};
    var L = 300, A = op.alto || 34, w = L * (op.ancho || 1), h = '<svg class="fr-tira" viewBox="-2 -2 ' + (L + 4) + ' ' + (A + 4) + '" preserveAspectRatio="xMinYMid meet" role="img" aria-label="' + esc(op.etiqueta || 'tira') + '">';
    var p1 = op.pintadas || 0, p2 = op.pintadas2 || 0, tach = op.tachadas || [];
    for (var i = 0; i < d; i++) {
      var x = w * i / d, cls = i < p1 ? 'pint' : (i < p1 + p2 ? 'pint2' : '');
      h += '<rect x="' + x + '" y="0" width="' + (w / d) + '" height="' + A + '" class="fr-reg ' + cls + '"/>';
      if (tach.indexOf(i) >= 0) h += '<path d="M' + (x + 4) + ' 4 L' + (x + w / d - 4) + ' ' + (A - 4) + '" class="fr-tacha"/>';
    }
    return h + '</svg>';
  };
  // Muro de fracciones: filas de 1, 1/2, 1/4, 1/8 (y 1/16). op: {hasta: fracción resaltada, filas: [1,2,4,8]}
  FRUI.muroSVG = function (filas, op) {
    op = op || {};
    var L = 320, A = 30, gap = 4, h = '<svg class="fr-muro" viewBox="-2 -2 ' + (L + 4) + ' ' + (filas.length * (A + gap) + 2) + '" role="img" aria-label="muro de fracciones">';
    filas.forEach(function (d, f) {
      for (var i = 0; i < d; i++) {
        var x = L * i / d, y = f * (A + gap);
        h += '<rect x="' + x + '" y="' + y + '" width="' + (L / d) + '" height="' + A + '" class="fr-ladrillo f' + f + '"/>';
        if (d <= 8) h += '<text x="' + (x + L / d / 2) + '" y="' + (y + A / 2 + 6) + '" class="fr-ltxt" text-anchor="middle">' + (d === 1 ? '1' : '1/' + d) + '</text>';
      }
    });
    if (op.hasta) { var xh = L * op.hasta.n / op.hasta.d; h += '<rect x="0" y="-2" width="' + xh + '" height="' + (filas.length * (A + gap)) + '" class="fr-resalte"/>'; }
    return h + '</svg>';
  };
  // Pote de kilos (tamaño según el peso).
  FRUI.poteSVG = function (peso) {
    var s = FR.comparar(peso, FR.fr(1, 1)) >= 0 ? 1 : (FR.comparar(peso, FR.fr(1, 2)) >= 0 ? 0.78 : 0.6), W = 60 * s, H = 66 * s;
    return '<svg class="fr-pote" viewBox="0 0 64 72" width="' + Math.round(64 * s) + '" height="' + Math.round(72 * s) + '" aria-hidden="true"><rect x="' + (32 - W / 2 + 4) + '" y="' + (72 - H + 8) + '" width="' + (W - 8) + '" height="' + (H - 10) + '" rx="8" class="fr-pote-cuerpo"/>' +
      '<rect x="' + (32 - W / 2 + 1) + '" y="' + (72 - H + 2) + '" width="' + (W - 2) + '" height="9" rx="3" class="fr-pote-tapa"/></svg>';
  };
  // Barra de la balanza de 0 a max kg, marcas cada 1/4, banderita en el objetivo.
  FRUI.barraKilosSVG = function (op) {
    var max = op.max || 3, L = 320, x0 = 10, A = 26, esc4 = (L - 20) / (max * 4), tot = op.total, obj = op.objetivo;
    var h = '<svg class="fr-barra" viewBox="0 0 ' + L + ' 70" role="img" aria-label="balanza">';
    h += '<rect x="' + x0 + '" y="20" width="' + (L - 20) + '" height="' + A + '" rx="6" class="fr-reg"/>';
    if (tot) { var w = Math.min(L - 20, esc4 * 4 * tot.n / tot.d); h += '<rect x="' + x0 + '" y="20" width="' + w + '" height="' + A + '" rx="6" class="fr-reg pint' + (FR.comparar(tot, obj || tot) > 0 ? ' pasa' : '') + '"/>'; }
    for (var i = 0; i <= max * 4; i++) { var x = x0 + i * esc4; h += '<path d="M' + x + ' ' + (i % 4 ? 38 : 30) + ' L' + x + ' 46" class="fr-marca"/>'; if (i % 4 === 0) h += '<text x="' + x + '" y="62" text-anchor="middle" class="fr-ltxt">' + (i / 4) + ' kg</text>'; }
    if (obj) { var xo = x0 + esc4 * 4 * obj.n / obj.d; h += '<path d="M' + xo + ' 48 L' + xo + ' 4" class="fr-asta"/><path d="M' + xo + ' 4 L' + (xo + 16) + ' 9 L' + xo + ' 14 Z" class="fr-bandera"/>'; }
    return h + '</svg>';
  };
  // Jarra con marcas cada 1/8 l hasta la capacidad (1 1/2 l por defecto).
  FRUI.jarraSVG = function (op) {
    var cap = op.capacidad || FR.fr(3, 2), oct = cap.n * 8 / cap.d, H = 150, top = 10, alto = H - top - 6, nivel = op.nivel || FR.fr(0, 1);
    var hn = alto * (nivel.n * 8 / nivel.d) / oct;
    var h = '<svg class="fr-jarra" viewBox="0 0 120 ' + H + '" width="120" height="' + H + '" role="img" aria-label="jarra con ' + esc(FR.leer(nivel, { unidad: 'l', mixto: true })) + '">';
    h += '<rect x="20" y="' + (top + alto - hn) + '" width="70" height="' + hn + '" class="fr-agua"/>';
    h += '<path d="M20 ' + top + ' L20 ' + (top + alto) + ' L90 ' + (top + alto) + ' L90 ' + top + '" class="fr-vidrio"/><path d="M90 30 Q112 40 90 80" class="fr-vidrio"/>';
    for (var i = 1; i <= oct; i++) { var y = top + alto - alto * i / oct; h += '<path d="M20 ' + y + ' L' + (i % 4 === 0 ? 40 : 30) + ' ' + y + '" class="fr-marca"/>'; if (i % 4 === 0) h += '<text x="44" y="' + (y + 4) + '" class="fr-ltxt">' + (i / 8 === 1 ? '1' : (i % 8 === 0 ? i / 8 : (Math.floor(i / 8) ? Math.floor(i / 8) + ' ' : '') + '1/2')) + ' l</text>'; }
    return h + '</svg>';
  };
  // Vaso: misma base; alto relativo (1 = mediano).
  FRUI.vasoSVG = function (alto, op) {
    op = op || {};
    var H = Math.round(70 * alto), Y = 90 - H;
    return '<svg class="fr-vaso' + (op.servido ? ' servido' : '') + '" viewBox="0 0 50 94" width="50" height="94" aria-hidden="true"><path d="M8 ' + Y + ' L12 90 L38 90 L42 ' + Y + ' Z" class="' + (op.lleno === false ? 'fr-vidrio-v' : 'fr-agua-v') + '"/><path d="M8 ' + Y + ' L12 90 L38 90 L42 ' + Y + '" class="fr-vidrio"/></svg>';
  };
  /* Objeto de un reparto. tipo: 'redondo' | 'barra' | 'pote' | 'botella' | 'figurita' | 'pelota' | 'lapiz'.
     op: {partes: k, colores: [clase por parte] (p1..p8 o ''), color: clase si está entero} */
  FRUI.objetoSVG = function (tipo, op) {
    op = op || {};
    var k = op.partes || 1, cols = op.colores || [], c0 = op.color || '', h = '<svg class="fr-obj" viewBox="0 0 60 60" width="56" height="56" aria-hidden="true">';
    function cls(i) { var c = k > 1 ? (cols[i] || '') : c0; return 'fr-objp' + (c ? ' ' + c : ''); }
    if (tipo === 'redondo' || tipo === 'pelota') {
      if (k === 1) h += '<circle cx="30" cy="30" r="24" class="' + cls(0) + '"/>';
      else for (var i = 0; i < k; i++) {
        var a0 = (-90 + 360 * i / k) * Math.PI / 180, a1 = (-90 + 360 * (i + 1) / k) * Math.PI / 180;
        h += '<path d="M30 30 L' + (30 + 24 * Math.cos(a0)) + ' ' + (30 + 24 * Math.sin(a0)) + ' A24 24 0 ' + (k === 1 ? 1 : 0) + ' 1 ' + (30 + 24 * Math.cos(a1)) + ' ' + (30 + 24 * Math.sin(a1)) + ' Z" class="' + cls(i) + '"/>';
      }
      if (tipo === 'pelota') h += '<path d="M8 30 Q30 18 52 30" class="fr-linea"/>';
    } else {
      var R = { barra: [6, 16, 48, 28], pote: [12, 10, 36, 44], botella: [20, 6, 20, 50], figurita: [14, 8, 32, 44], lapiz: [4, 25, 52, 10] }[tipo] || [6, 16, 48, 28];
      var vertical = tipo === 'pote' || tipo === 'botella';
      for (var j = 0; j < k; j++) {
        var x = vertical ? R[0] : R[0] + R[2] * j / k, y = vertical ? R[1] + R[3] * j / k : R[1], w = vertical ? R[2] : R[2] / k, hh = vertical ? R[3] / k : R[3];
        h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" class="' + cls(j) + '"/>';
      }
      h += '<rect x="' + R[0] + '" y="' + R[1] + '" width="' + R[2] + '" height="' + R[3] + '" rx="3" class="fr-contorno"/>';
      if (tipo === 'pote') h += '<rect x="9" y="5" width="42" height="7" rx="2" class="fr-pote-tapa"/>';
      if (tipo === 'botella') h += '<rect x="25" y="1" width="10" height="7" class="fr-pote-tapa"/>';
    }
    return h + '</svg>';
  };

  /* ==================== configuración de fracciones ==================== */
  // mate.<perfil>.4to-fracciones.config = {incluirModulo:false}
  FRUI.CONFIG_ACT = '4to-fracciones';
  FRUI.config = function (perfil) {
    try { var v = localStorage.getItem(EV.claveAlmacen(perfil, FRUI.CONFIG_ACT, 'config')); return v ? JSON.parse(v) : { incluirModulo: false }; }
    catch (e) { return { incluirModulo: false }; }
  };

  /* ==================== marco común de las actividades ==================== */
  /* cfg = {act, titulo, version, nivelMax, tamRonda(nivel), tipos(nivel) → ['R1',…], tipoFinal(nivel) → tipo|null,
           generar(nivel, tipo, az, ses) → ítem {tipo, tema, …}, deModulo(entrada, az) → ítem|null, moduloAct: 'repartos',
           pintar(item, api), meperdi(item, api), textoPaso(item, api), esperado(item, api) → fracción|texto,
           aprendiste: [{frase, opciones}], sinNiveles, sinAyudas, alTerminar(resumen) }  */
  FRUI.actividad = function (cfg) {
    var ctx = UI.base({ act: cfg.act, titulo: cfg.titulo, version: cfg.version, nivelMax: cfg.nivelMax || 3 });
    if (!ctx) return null;
    var app = $('#app'), R = null, vigia = null, ses = { usados: {}, ultimoM: null, ultimoTipoFig: null };
    var conf = FRUI.config(ctx.perfil), MOD = root.REF4_FRMOD, AZ = ctx.az;

    function nivelActual() {
      if (cfg.sinNiveles) return 1;
      var n = ctx.reg.estado().nivel || 1;
      if (ctx.debug && ctx.params.get('nivel')) n = Math.max(1, Math.min(cfg.nivelMax || 3, parseInt(ctx.params.get('nivel'), 10) || n));
      return n;
    }
    // Adaptación: peso doble a los tipos y errores con fallas o lentos en los últimos 14 días.
    function pesos() {
      var w = {}, err = {}, ahora = Date.now();
      ctx.reg.eventos().forEach(function (e) {
        if (e.tipo !== 'paso' || !e.tipoItem || ahora - e.ts > 14 * 86400000) return;
        if (!e.ok || e.ms > 30000) w[e.tipoItem] = 2;
        if (e.error) err[e.error] = (err[e.error] || 0) + 1;
      });
      return { tipos: w, errores: err };
    }
    // Secuencia de tipos de la ronda: al azar con pesos, sin repetir un tipo más de 2 veces seguidas.
    function secuencia(nivel, n, pw) {
      var forzado = ctx.debug && ctx.params.get('tipo'), tipos = cfg.tipos(nivel), out = [];
      if (cfg.secuencia && !forzado) return cfg.secuencia(nivel, AZ);
      for (var i = 0; i < n; i++) {
        if (forzado) { out.push(forzado); continue; }
        var cand = tipos.filter(function (t) { return !(out.length >= 2 && out[out.length - 1] === t && out[out.length - 2] === t); });
        out.push(AZ.pesado(cand, cand.map(function (t) { return pw.tipos[t] || 1; })));
      }
      var fin = !forzado && cfg.tipoFinal ? cfg.tipoFinal(nivel) : null;
      if (fin) out[n - 1] = fin;
      return out;
    }

    function nuevaRonda() {
      ctx.reg.iniciarRonda();
      var nivel = nivelActual(); ctx.reg.ctx.nivel = nivel;
      var pw = pesos(); ses.pesosErr = pw.errores;
      var n = cfg.tamRonda(nivel);
      R = { nivel: nivel, total: n, idx: 0, cont: UI.contador(), tipos: secuencia(nivel, n, pw), moduloUsado: false, termino: false, item: null };
      siguienteItem();
    }
    function siguienteItem() {
      var tipo = R.tipos[R.idx], it = null;
      // Ítems del módulo de la escuela: solo con el interruptor, 15 % de probabilidad, máximo uno por ronda.
      if (conf.incluirModulo && MOD && cfg.deModulo && !R.moduloUsado && AZ.prob(0.15)) {
        var lista = MOD.deActividad(cfg.moduloAct || cfg.act);
        if (lista.length) { it = cfg.deModulo(AZ.elegir(lista), AZ, R.nivel); if (it) R.moduloUsado = true; }
      }
      if (!it) it = cfg.generar(R.nivel, tipo, AZ, ses);
      it.modulo = it.modulo || null;
      R.item = it; api.item = it; api.est = {}; api.intentos = {}; api.ayudaActual = 'ninguna'; api.paso = null; api.tPaso = Date.now(); api.vioAudio = false;
      FRUI.globo(null); render();
    }
    function render() {
      if (UI._kd) { document.removeEventListener('keydown', UI._kd); UI._kd = null; }
      var it = R.item;
      app.innerHTML = UI.progreso(R.total, R.idx) + '<div class="ref-panel fr-panel"><div class="fr-cab"><span>' + (cfg.sinNiveles ? 'Pregunta ' + (R.idx + 1) + ' de ' + R.total : 'Nivel ' + R.nivel + ' · Ejercicio ' + (R.idx + 1) + ' de ' + R.total) +
        (it.modulo ? ' · <span class="fr-mod">de la escuela</span>' : '') + '</span></div><div id="fr-item"></div><div class="fr-acc" id="fr-acc"></div></div>';
      api.cont = $('#fr-item'); api.acc = $('#fr-acc');
      cfg.pintar(it, api);
      if (cfg.meperdi && R.nivel > 1 && !cfg.sinAyudas && !api.est.sinMeperdi) api.boton('🧭 Me perdí', function () { api.ayuda('me_perdi'); cfg.meperdi(it, api); }, 'b-perdi');
      if (!vigia) vigia = UI.vigilar(ctx, { texto: function () { return cfg.textoPaso ? cfg.textoPaso(R.item, api) : 'seguir'; },
        elemento: function () { return document.querySelector('#fr-item .fr-casilla.on, #fr-item .fr-activo, #fr-item .ref-opcion:not([disabled])'); } });
      depurar();
    }
    function depurar() {
      if (!ctx.debug) return;
      var e = cfg.esperado ? cfg.esperado(R.item, api) : null, info = {};
      if (e && e.n !== undefined) info.esperado = FR.formatear(e) + (e.n > e.d ? ' = ' + FR.formatear(e, { mixto: true }) : '');
      else if (e !== null && e !== undefined) info.esperado = e;
      var compacto = {}; Object.keys(R.item).forEach(function (k) { if (k !== 'fig' && k !== 'figs' && typeof R.item[k] !== 'function') compacto[k] = R.item[k]; });
      UI.debugSet({ nivel: R.nivel, tipo: R.item.tipo, paso: api.paso, esperado: info.esperado, item: compacto, modulo: R.item.modulo });
    }

    var api = {
      ctx: ctx, az: AZ, ses: ses, est: {}, intentos: {}, ayudaActual: 'ninguna',
      get nivel() { return R.nivel; },
      render: function () { render(); },
      // Cambia de paso (reinicia el tiempo y la ayuda del paso).
      nuevoPaso: function (p) { api.paso = p; api.tPaso = Date.now(); api.ayudaActual = 'ninguna'; depurar(); },
      ayuda: function (tipo) { api.ayudaActual = tipo; },
      pista: function (texto, tipo) { FRUI.globo(texto, tipo || 'tip'); },
      /* responder({paso, ok, error, esperado, respuesta, forma, tema, item}) → registra el evento del paso; devuelve el número de intento. */
      responder: function (o) {
        var paso = o.paso || api.paso || 'respuesta'; api.intentos[paso] = (api.intentos[paso] || 0) + 1;
        var it = R.item, intento = api.intentos[paso];
        var info = o.item || it.info || {}; info.tipo = it.tipo;
        ctx.reg.evento({ tipo: 'paso', paso: paso, intento: intento, item: info, tema: o.tema || it.tema, tipoItem: it.tipo,
          esperado: o.esperado === undefined ? '' : String(o.esperado), respuesta: o.respuesta === undefined ? '' : String(o.respuesta), forma: o.forma || 'opcion',
          ok: !!o.ok, error: o.ok ? null : (o.error || 'OTRO'), ms: Date.now() - api.tPaso, ayuda: api.ayudaActual, modulo: it.modulo || null });
        if (!o.noCuenta) R.cont.paso(intento, !!o.ok, o.error, []);
        UI.sonar(o.ok ? 'ok' : 'mal');
        if (o.ok) FRUI.globo(o.mensaje || null, 'ok'); else if (o.pista) FRUI.globo(o.pista, 'mal');
        depurar();
        return intento;
      },
      // Registra el uso de 🔊 (no cuenta para las estrellas).
      audio: function (texto) {
        if (!FRUI.hablar(texto)) return;
        api.vioAudio = true;
        ctx.reg.evento({ tipo: 'paso', paso: 'audio', intento: 0, item: R.item.info || {}, tema: R.item.tema, tipoItem: R.item.tipo, ok: true, ayuda: 'audio', modulo: R.item.modulo || null });
      },
      botonVoz: function (texto) {
        api.boton('🔊 Escuchar', function () { api.audio(typeof texto === 'function' ? texto() : texto); }, 'b-voz', 'fr-voz');
        var b = $('#b-voz'); if (b) b.hidden = !FRUI.hayVoz();
      },
      boton: function (html, fn, id, clase) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ref-btn' + (clase ? ' ' + clase : ''); b.innerHTML = html; if (id) b.id = id;
        b.onclick = fn; api.acc.appendChild(b); return b;
      },
      celebrar: function (t) { UI.celebrar(t); },
      // Termina el ítem: siguiente o fin de la ronda.
      fin: function (demora) {
        if (R.termino) return;
        var avanzar = function () { if (R.idx % 3 === 2) UI.celebrar(); if (R.idx + 1 < R.total) { R.idx++; siguienteItem(); } else finRonda(); };
        if (demora) setTimeout(avanzar, demora); else avanzar();
      },
      pct: function () { return R.cont.pct(); }
    };

    // "¿Qué aprendiste?" desde el nivel 2: una frase con 3 opciones (no cuenta para las estrellas).
    function aprendiste(seguir) {
      if (!cfg.aprendiste || !cfg.aprendiste.length || R.nivel < 2) return seguir();
      var a = AZ.elegir(cfg.aprendiste), ops = AZ.mezclar(a.opciones.map(function (t, i) { return { t: t, ok: i === 0 }; })), t0 = Date.now(), intento = 0;
      var m = document.createElement('div'); m.className = 'ref-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
      m.innerHTML = '<div class="ref-panel"><h2>¿Qué aprendiste?</h2><p class="fr-frase">' + FRUI.conFracciones(a.frase) + '</p><div class="fr-opciones texto">' +
        ops.map(function (o, i) { return '<button class="ref-opcion texto" data-i="' + i + '">' + FRUI.conFracciones(o.t) + '</button>'; }).join('') + '</div></div>';
      document.body.appendChild(m);
      m.onclick = function (e) {
        var b = e.target.closest('[data-i]'); if (!b || b.disabled) return;
        var o = ops[+b.dataset.i]; intento++;
        ctx.reg.evento({ tipo: 'paso', paso: 'aprendiste', intento: 0, primero: intento === 1, item: { frase: a.frase }, tema: 'estrategia', tipoItem: 'aprendiste',
          esperado: a.opciones[0], respuesta: o.t, forma: 'opcion', ok: o.ok, error: o.ok ? null : 'OTRO', ms: Date.now() - t0, ayuda: 'ninguna', modulo: null });
        if (o.ok) { b.classList.add('ok'); UI.sonar('ok'); setTimeout(function () { m.remove(); seguir(); }, 700); }
        else { b.classList.add('mal'); b.disabled = true; UI.sonar('mal'); }
      };
      var p = m.querySelector('[data-i]'); if (p) p.focus();
    }
    function finRonda() {
      R.termino = true; FRUI.globo(null);
      aprendiste(function () {
        var pct = R.cont.pct(), dur = Date.now() - R.cont.t0;
        var r = ctx.reg.cerrarRonda(pct, dur, false, cfg.sinNiveles ? 1 : (cfg.nivelMax || 3));
        var extra = cfg.alTerminar ? cfg.alTerminar({ pct: pct, dur: dur, estrellas: r.estrellas }) : '';
        if (r.cambio === 1) { extra = (extra ? extra + '<br>' : '') + '¡Subiste al nivel ' + r.nivel + '!'; UI.sonar('sube'); }
        if (cfg.resumen) cfg.resumen({ pct: pct, estrellas: r.estrellas, extra: extra }, nuevaRonda);
        else UI.resumen({ estrellas: r.estrellas, pct: pct, extra: extra }, nuevaRonda, function () { MATE.irMenu(); });
      });
    }

    if (ctx.debug) root.__fr = { act: cfg.act, version: cfg.version, api: api, ronda: function () { return R; }, fin: function () { api.fin(); } };
    nuevaRonda();
    return api;
  };

  root.REF4_FRUI = FRUI;
})(window);
