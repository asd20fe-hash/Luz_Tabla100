/* Inglés — supermercado y despensa (parte pura). window.ING_TIENDA / require. Versión 1.0.0 (2026-10-15).
   La mascota pide comida ("I want two bananas!"), Luz la busca en el estante, paga con sus monedas ⭐ contando en inglés
   y lo comprado queda en la despensa (pet.despensa = {APPLE: 2, …}) para darle de comer en la casa.
   - precio(w): 1, 2 o 3 monedas según el nivel de la palabra · total(lista)
   - lista({nivel, az, rep, monedas}) → [{w, n}] lo que hay que comprar, que siempre alcanza con las monedas (vacía si no alcanza para nada)
   - estante(lista, nivel, az) → las palabras del estante (lo de la lista y otras de comida, sin repetir), mezcladas
   - pedido(w, n) → "an apple", "two bananas", "some milk" (lo incontable va siempre de a uno) · numero(n) → "two"
   - guardar(pet, en, n) · sacar(pet, en) → bool · despensa(pet) → [{w, n}] · pagar(pet, cuanto) → bool */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('./vocab.js') : root.ING_VOCAB, RP = EnNode ? require('../_comun-1ro/repaso.js') : root.REPASO1;
  var TEMA = 'comida', ESTANTE = 6, TOPE = 10;      // el total nunca pasa de TEN (los números que sabe decir)
  // Cuántas cosas distintas y hasta cuántas de cada una, por nivel.
  var POR_NIVEL = { 1: { cosas: 2, max: 1 }, 2: { cosas: 3, max: 2 }, 3: { cosas: 3, max: 3 } };

  function precio(w) { return Math.max(1, Math.min(3, w.nivel || 1)); }
  function total(lista) { return lista.reduce(function (s, x) { return s + precio(x.w) * x.n; }, 0); }
  function conf(nivel) { return POR_NIVEL[Math.max(1, Math.min(3, nivel || 1))]; }

  function lista(o) {
    var nivel = o.nivel || 1, az = o.az, c = conf(nivel), plata = o.monedas === undefined ? 99 : o.monedas;
    var claves = V.palabras({ temas: [TEMA], nivel: nivel }).map(function (w) { return w.en; });
    var ws = (o.rep ? RP.elegir(o.rep, claves, c.cosas, az, { minRepaso: 2 }) : az.mezclar(claves).slice(0, c.cosas)).map(V.por);
    var out = ws.map(function (w) { return { w: w, n: w.art === 'some' || c.max < 2 ? 1 : az.entero(1, c.max) }; });
    // Que alcance: primero se bajan las cantidades, después se sacan cosas (las más caras).
    while (out.length && total(out) > Math.min(plata, TOPE)) {
      var mas = out.filter(function (x) { return x.n > 1; })[0];
      if (mas) mas.n--; else { out.sort(function (a, b) { return precio(a.w) - precio(b.w); }); out.pop(); }
    }
    // Si no alcanzó para nada de lo elegido pero hay monedas, algo barato.
    if (!out.length) { var baratas = V.palabras({ temas: [TEMA], nivel: nivel }).filter(function (w) { return precio(w) <= plata; }); if (baratas.length) out.push({ w: az.elegir(baratas), n: 1 }); }
    return out;
  }
  function estante(l, nivel, az) {
    var ya = l.map(function (x) { return x.w; });
    var otras = az.mezclar(V.palabras({ temas: [TEMA], nivel: Math.max(nivel || 1, 2) }).filter(function (w) { return ya.indexOf(w) < 0; }));
    return az.mezclar(ya.concat(otras.slice(0, Math.max(0, ESTANTE - ya.length))));
  }

  var NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function numero(n) { return NUM[n] || String(n); }
  function plural(w) { var e = w.en.toLowerCase(); return /[^aeiou]y$/.test(e) ? e.slice(0, -1) + 'ies' : e + 's'; }
  function pedido(w, n) { return n > 1 && w.art !== 'some' ? numero(n) + ' ' + plural(w) : (w.art ? w.art + ' ' : '') + w.en.toLowerCase(); }

  function guardar(pet, en, n) { pet.despensa = pet.despensa || {}; pet.despensa[en] = (pet.despensa[en] || 0) + (n || 1); return pet; }
  function sacar(pet, en) { var d = pet.despensa || {}; if (!d[en]) return false; if (--d[en] <= 0) delete d[en]; return true; }
  function despensa(pet) { var d = pet.despensa || {}; return Object.keys(d).filter(function (k) { return d[k] > 0 && V.por(k); }).map(function (k) { return { w: V.por(k), n: d[k] }; }); }
  function cuantas(pet) { return despensa(pet).reduce(function (s, x) { return s + x.n; }, 0); }
  function pagar(pet, cuanto) { if (pet.monedas < cuanto) return false; pet.monedas -= cuanto; return true; }

  var api = { VERSION: '1.0.0', TEMA: TEMA, ESTANTE: ESTANTE, POR_NIVEL: POR_NIVEL, TOPE: TOPE, precio: precio, total: total, numero: numero, plural: plural, pedido: pedido, lista: lista, estante: estante,
    guardar: guardar, sacar: sacar, despensa: despensa, cuantas: cuantas, pagar: pagar };
  if (EnNode) module.exports = api;
  else root.ING_TIENDA = api;
})(typeof window !== 'undefined' ? window : this);
