/* Inglés — la ropa de la mascota: cambiador y tienda (parte pura). window.ING_ROPA / require. Versión 1.0.0 (2026-10-15).
   Una prenda es {en, color} (en: palabra del tema ropa; color: palabra del tema colores). Se guarda en el estado de la mascota:
   pet.ropa = [prendas que tiene] y pet.puesto = {slot: prenda} (lo que tiene puesto; una prenda por lugar del cuerpo).
   La tienda vende prendas que todavía no tiene (2, 3 o 4 ⭐ según el nivel de la palabra); la primera vez le regalan un sombrero rojo. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('./vocab.js') : root.ING_VOCAB;
  var SLOT = { HAT: 'cabeza', CAP: 'cabeza', CROWN: 'cabeza', BOW: 'oreja', GLASSES: 'ojos', SCARF: 'cuello', SHOES: 'pies' };
  var PRECIO = [3, 2, 3, 4];
  var REGALO = { en: 'HAT', color: 'RED' };

  var precio = function (it) { var w = V.por(it.en); return PRECIO[w ? w.nivel : 0] || 3; };
  // Colores para la ropa hasta el nivel (en el nivel 1, los 4 primeros; sin negro, que con el contorno no se ve).
  var colores = function (nivel) { return V.palabras({ temas: ['colores'], nivel: Math.max(1, Math.min(3, nivel || 1)) }).filter(function (c) { return c.en !== 'BLACK'; }); };
  // "a red hat", "an orange cap", "blue glasses" (sin color: "a hat", "glasses").
  function frase(it) {
    var w = V.por(it.en), t = (it.color ? it.color.toLowerCase() + ' ' : '') + it.en.toLowerCase();
    return w && w.plural ? t : (/^[aeiou]/.test(t) ? 'an ' : 'a ') + t;
  }
  var igual = function (a, b) { return !!a && !!b && a.en === b.en && a.color === b.color; };
  var tiene = function (pet, it) { return (pet.ropa || []).some(function (x) { return igual(x, it); }); };
  var puesta = function (pet, it) { return igual((pet.puesto || {})[SLOT[it.en]], it); };
  function poner(pet, it) { pet.puesto = pet.puesto || {}; pet.puesto[SLOT[it.en]] = { en: it.en, color: it.color }; return pet; }
  function sacar(pet, slot) { if (pet.puesto) delete pet.puesto[slot]; return pet; }
  // comprar: descuenta las ⭐ y la guarda; false si ya la tiene o no le alcanza.
  function comprar(pet, it) {
    var c = precio(it); if (tiene(pet, it) || pet.monedas < c) return false;
    pet.monedas -= c; pet.ropa = pet.ropa || []; pet.ropa.push({ en: it.en, color: it.color }); return true;
  }
  // ofertas: n prendas que no tiene (primero las de tipos que todavía no tiene), una por tipo, de nivel ≤ nivel.
  function ofertas(pet, nivel, az, n) {
    n = n || 3; var prendas = V.palabras({ temas: ['ropa'], nivel: nivel || 1 }), cols = colores(nivel), out = [];
    var tipo = function (p) { return (pet.ropa || []).some(function (x) { return x.en === p.en; }); };
    var orden = az.mezclar(prendas.filter(function (p) { return !tipo(p); })).concat(az.mezclar(prendas.filter(tipo)));
    orden.forEach(function (p) {
      if (out.length >= n) return;
      var cs = az.mezclar(cols);
      for (var i = 0; i < cs.length; i++) { var it = { en: p.en, color: cs[i].en }; if (!tiene(pet, it)) { out.push(it); break; } }
    });
    return out;
  }
  // regalo: la primera vez que abre el cambiador (sin ropa), un sombrero puesto (rojo, o azul si la mascota es roja). Devuelve la prenda o null.
  function regalo(pet) {
    if (pet.regalo || (pet.ropa && pet.ropa.length)) return null;
    var rojo = V.por('RED'), it = { en: REGALO.en, color: rojo && pet.color === rojo.color ? 'BLUE' : REGALO.color };
    pet.regalo = true; pet.ropa = [it]; poner(pet, it);
    return { en: it.en, color: it.color };
  }

  var api = { VERSION: '1.0.0', SLOT: SLOT, PRECIO: PRECIO, precio: precio, colores: colores, frase: frase, igual: igual, tiene: tiene, puesta: puesta,
    poner: poner, sacar: sacar, comprar: comprar, ofertas: ofertas, regalo: regalo };
  if (EnNode) module.exports = api;
  else root.ING_ROPA = api;
})(typeof window !== 'undefined' ? window : this);
