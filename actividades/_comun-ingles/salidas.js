/* Inglés — salidas: café, restaurante, escuela y cine (parte pura). window.ING_SALIDAS / require. Versión 1.0.0 (2026-10-15).
   - cafe({nivel, az, rep, monedas}) → {items:[w], total}: la mascota pide 1 cosa (2 desde el nivel 2) del tema cafe ("I want a juice!").
   - resto(o) → {items:[plato, postre?], total}: un plato (tema platos) y, desde el nivel 2, un postre del tema comida ("Can I have some soup, please?").
   - cine(o) → {entradas, snack, escenas:[w de sentimientos], total}: entradas a 1 ⭐ ("Two tickets, please!"), algo para comer y las
     escenas de la película (una por sentimiento: la mascota lo siente y Luz dice cómo está).
   - pizarra(nivel, az, i) → lo que dibuja la profe en el pizarrón: {tipo:'cuantos'|'color', w (la respuesta), n, color (palabra), forma}.
   Todo lo que se paga alcanza con las monedas (si no alcanza para nada, items vacío o cine null). Precios como en el súper (1–3 ⭐). */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('./vocab.js') : root.ING_VOCAB, RP = EnNode ? require('../_comun-1ro/repaso.js') : root.REPASO1;
  var LUGARES = [{ id: 'cafe', icono: '☕', nombre: 'Café', en: 'Café' }, { id: 'resto', icono: '🍽️', nombre: 'Restaurante', en: 'Restaurant' },
    { id: 'escuela', icono: '🏫', nombre: 'Escuela', en: 'School' }, { id: 'cine', icono: '🎬', nombre: 'Cine', en: 'Cinema' }];
  var POSTRES = ['CAKE', 'ICE CREAM', 'COOKIE', 'STRAWBERRY', 'APPLE', 'BANANA', 'GRAPES', 'PEAR'];
  var SNACKS = ['POPCORN', 'JUICE', 'WATER', 'HOT DOG', 'MILKSHAKE'];
  var ENTRADA = 1, FORMAS = ['★', '●', '♥', '▲'];
  var NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  var precio = function (w) { return Math.max(1, Math.min(3, w.nivel || 1)); };
  var suma = function (ws) { return ws.reduce(function (s, w) { return s + precio(w); }, 0); };
  var numero = function (n) { return NUM[n] || String(n); };
  var frase = function (w) { return (w.art ? w.art + ' ' : '') + w.en.toLowerCase(); };
  // n palabras con repaso (las erradas vuelven), de las claves dadas.
  function elegir(o, claves, n) {
    var ks = o.rep ? RP.elegir(o.rep, claves, n, o.az, { minRepaso: 1 }) : o.az.mezclar(claves).slice(0, n);
    return ks.map(V.por);
  }
  var de = function (tema, nivel, filtro) { return V.palabras({ temas: [tema], nivel: nivel || 1 }).filter(function (w) { return !filtro || filtro.indexOf(w.en) >= 0; }).map(function (w) { return w.en; }); };
  // Que alcance: se sacan las más caras; si no queda nada, la más barata que se pueda pagar.
  function alcanza(items, plata, todas) {
    items = items.slice();
    while (items.length && suma(items) > plata) { var mx = 0; items.forEach(function (w, i) { if (precio(w) > precio(items[mx])) mx = i; }); items.splice(mx, 1); }   // sin desordenar (el plato antes que el postre)
    if (!items.length) { var b = todas.map(V.por).filter(function (w) { return precio(w) <= plata; }); if (b.length) items.push(b.sort(function (a, c) { return precio(a) - precio(c); })[0]); }
    return items;
  }
  function cafe(o) {
    var nv = o.nivel || 1, claves = de('cafe', nv), items = alcanza(elegir(o, claves, nv > 1 ? 2 : 1), o.monedas === undefined ? 99 : o.monedas, claves);
    return { items: items, total: suma(items) };
  }
  function resto(o) {
    var nv = o.nivel || 1, plata = o.monedas === undefined ? 99 : o.monedas, platos = de('platos', nv), postres = de('comida', nv, POSTRES);
    var items = elegir(o, platos, 1); if (nv > 1) items = items.concat(elegir(o, postres, 1));
    if (items.length > 1 && suma(items) > plata) items.pop();            // si no alcanza, primero se saca el postre
    items = alcanza(items, plata, platos);
    return { items: items, total: suma(items) };
  }
  function cine(o) {
    var nv = o.nivel || 1, plata = o.monedas === undefined ? 99 : o.monedas, snacks = de('cafe', nv, SNACKS);
    var entradas = o.az.entero(1, Math.min(3, nv + 1)), snack = elegir(o, snacks, 1)[0];
    while (entradas > 1 && entradas * ENTRADA + precio(snack) > plata) entradas--;
    if (entradas * ENTRADA + precio(snack) > plata) { var bar = snacks.map(V.por).filter(function (w) { return precio(w) === 1; }); snack = bar.length ? o.az.elegir(bar) : snack; }
    if (entradas * ENTRADA + precio(snack) > plata) return null;
    var escenas = o.az.mezclar(V.palabras({ temas: ['sentimientos'], nivel: nv })).slice(0, nv > 1 ? 3 : 2);
    return { entradas: entradas, snack: snack, escenas: escenas, total: entradas * ENTRADA + precio(snack) };
  }
  // Frases de la mascota y de la profe.
  var pideCafe = function (w) { return 'I want ' + frase(w) + '!'; };
  var pideResto = function (w) { return 'Can I have ' + frase(w) + ', please?'; };
  var pideEntradas = function (n) { var t = numero(n); return t.charAt(0).toUpperCase() + t.slice(1) + (n === 1 ? ' ticket' : ' tickets') + ', please!'; };
  var cuenta = function (total) { return "That's " + numero(total) + (total === 1 ? ' coin!' : ' coins!'); };
  // El pizarrón: i par → "How many stars?" (números hasta 5, o hasta 10 desde el nivel 2); i impar → "What color?".
  function pizarra(nivel, az, i) {
    var nv = nivel || 1, cols = V.palabras({ temas: ['colores'], nivel: nv }).filter(function (c) { return c.en !== 'BLACK'; }), color = az.elegir(cols), forma = az.elegir(FORMAS);
    if (i % 2 === 0) { var n = az.entero(1, nv > 1 ? 10 : 5); return { tipo: 'cuantos', w: V.palabras({ temas: ['numeros'] }).filter(function (x) { return x.n === n; })[0], n: n, color: color.en, forma: forma }; }
    return { tipo: 'color', w: color, n: az.entero(2, 4), color: color.en, forma: forma };
  }
  var NOMBRE_FORMA = { '★': 'stars', '●': 'circles', '♥': 'hearts', '▲': 'triangles' };

  var api = { VERSION: '1.0.0', LUGARES: LUGARES, POSTRES: POSTRES, SNACKS: SNACKS, ENTRADA: ENTRADA, FORMAS: FORMAS, NOMBRE_FORMA: NOMBRE_FORMA, precio: precio, suma: suma, numero: numero, frase: frase,
    cafe: cafe, resto: resto, cine: cine, pideCafe: pideCafe, pideResto: pideResto, pideEntradas: pideEntradas, cuenta: cuenta, pizarra: pizarra };
  if (EnNode) module.exports = api;
  else root.ING_SALIDAS = api;
})(typeof window !== 'undefined' ? window : this);
