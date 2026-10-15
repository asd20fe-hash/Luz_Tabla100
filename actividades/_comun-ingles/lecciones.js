/* Inglés — armado de lecciones (parte pura). window.ING_LECC / require. Versión 1.1.0 (2026-10-15): + el juego puede completar el paso (preparar).
   Una lección es una lista de pasos (datos), que la actividad ejecuta en orden:
     {tipo:'hola'}                      la profe saluda
     {tipo:'presenta', w}               la profe muestra una palabra nueva (sin error posible)
     {tipo:'juego', juego, w, opciones} un minijuego con esa palabra (cuenta para el registro y el repaso)
     {tipo:'chau'}                      cierre y premio
   Cada palabra nueva se presenta y se practica enseguida; después se mezcla con repaso de las ya vistas (REPASO1),
   sin la misma palabra dos veces seguidas. Como máximo NUEVAS palabras nuevas por lección. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('./vocab.js') : root.ING_VOCAB, JG = EnNode ? require('./juegos.js') : root.ING_JUEGOS;
  var RP = EnNode ? require('../_comun-1ro/repaso.js') : root.REPASO1;
  var NUEVAS = 3, PRACTICA = 8;

  function pasoJuego(w, nivel, az) {
    var j = JG.deTema(w.tema);
    var p = { tipo: 'juego', juego: j.id, w: w, opciones: j.opciones(w, nivel, az) };
    if (j.preparar) j.preparar(p, nivel, az);
    return p;
  }
  // Ordena para que no queden dos iguales seguidas (si se puede): cada vez toma, de las distintas a la anterior,
  // la que más veces falta poner (a igualdad, al azar). prev: la última palabra ya puesta.
  function sinSeguidas(lista, az, prev) {
    var resto = az.mezclar(lista), out = [];
    while (resto.length) {
      var ult = out.length ? out[out.length - 1] : prev, cuenta = function (x) { return resto.filter(function (y) { return y === x; }).length; }, mejor = -1, mc = -1;
      for (var i = 0; i < resto.length; i++) if (resto[i] !== ult) { var c = cuenta(resto[i]); if (c > mc) { mc = c; mejor = i; } }
      out.push(resto.splice(mejor < 0 ? 0 : mejor, 1)[0]);
    }
    return out;
  }
  // Palabras de los temas que tienen juego, hasta el nivel dado.
  function pool(nivel, temas) {
    var conJuego = JG.lista().map(function (j) { return j.tema; });
    return V.palabras({ nivel: nivel, temas: (temas || conJuego).filter(function (t) { return conJuego.indexOf(t) >= 0; }) });
  }

  /* armar({nivel, rep, az, temas?, nuevas?, practica?}) → pasos de la lección del día. */
  function armar(o) {
    var nivel = o.nivel || 1, az = o.az, rep = o.rep, nMax = o.nuevas === undefined ? NUEVAS : o.nuevas, nPr = o.practica || PRACTICA;
    var todas = pool(nivel, o.temas);
    var nuevas = todas.filter(function (w) { return !rep.items[w.en]; }), vistas = todas.filter(function (w) { return !!rep.items[w.en]; });
    // Nuevas: primero las de nivel más bajo, alternando temas.
    nuevas = az.mezclar(nuevas).sort(function (a, b) { return a.nivel - b.nivel; });
    var elegidas = [], temasUsados = {};
    nuevas.forEach(function (w) { if (elegidas.length < nMax && !temasUsados[w.tema]) { elegidas.push(w); temasUsados[w.tema] = 1; } });
    nuevas.forEach(function (w) { if (elegidas.length < nMax && elegidas.indexOf(w) < 0) elegidas.push(w); });
    if (!vistas.length && elegidas.length < 2) elegidas = elegidas.concat(az.mezclar(todas.filter(function (w) { return elegidas.indexOf(w) < 0; })).slice(0, 2 - elegidas.length));

    var pasos = [{ tipo: 'hola' }], practica = [];
    elegidas.forEach(function (w) { pasos.push({ tipo: 'presenta', w: w }); pasos.push(pasoJuego(w, nivel, az)); });
    // Lo que falta: repaso de las vistas (con las erradas primero) y otra vuelta de las nuevas.
    var faltan = nPr - elegidas.length;
    var rep2 = RP.elegir(rep, vistas.map(function (w) { return w.en; }), Math.max(0, faltan - elegidas.length), az, { minRepaso: 2 }).map(V.por);
    practica = rep2.concat(elegidas);
    var extra = elegidas.length ? elegidas : todas;
    for (var i = 0; practica.length < faltan && extra.length; i++) practica.push(extra[i % extra.length]);
    var prev = pasos[pasos.length - 1].w;
    sinSeguidas(practica.slice(0, faltan), az, prev).forEach(function (w) { pasos.push(pasoJuego(w, nivel, az)); });
    pasos.push({ tipo: 'chau' });
    return pasos;
  }

  /* rondaJuego({juego, nivel, rep, az, n}) → pasos para jugar solo un minijuego (juego libre desde la casa). */
  function rondaJuego(o) {
    var j = JG.get(o.juego), nivel = o.nivel || 1, n = o.n || 6;
    var claves = V.palabras({ nivel: nivel, temas: [j.tema] }).map(function (w) { return w.en; });
    var ws = RP.elegir(o.rep, claves, Math.min(n, claves.length), o.az, { minRepaso: 2 }).map(V.por);
    while (ws.length < n) ws.push(V.por(o.az.elegir(claves)));
    return sinSeguidas(ws, o.az).map(function (w) { return pasoJuego(w, nivel, o.az); });
  }

  var api = { VERSION: '1.1.0', NUEVAS: NUEVAS, PRACTICA: PRACTICA, armar: armar, rondaJuego: rondaJuego, pool: pool, sinSeguidas: sinSeguidas };
  if (EnNode) module.exports = api;
  else root.ING_LECC = api;
})(typeof window !== 'undefined' ? window : this);
