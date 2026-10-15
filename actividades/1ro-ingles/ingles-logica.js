/* Inglés de 1ro — vocabulario y parte pura (ronda, distractores y errores). window.INGLES1 / require. Versión 1.0.0 (2026-10-14).
   Oral y con dibujos: lo principal es escuchar la palabra en inglés y tocar el dibujo.
   Tipos: escucha (oye → toca el dibujo), sino (ve un dibujo y oye "Is it a …?"), lee (ve el dibujo → toca la palabra escrita)
   y escribe (palabras cortas). Nivel 1: escucha con 3 dibujos; 2: 4 dibujos y sí/no; 3: además lee y escribe. */
(function (root) {
  'use strict';
  // [inglés, castellano, dibujo, tema, nivel]; los colores llevan el color en vez de dibujo.
  var V = [
    ['CAT', 'GATO', '🐱', 'animales', 1], ['DOG', 'PERRO', '🐶', 'animales', 1], ['FISH', 'PEZ', '🐟', 'animales', 1], ['BIRD', 'PÁJARO', '🐦', 'animales', 1],
    ['COW', 'VACA', '🐄', 'animales', 1], ['PIG', 'CHANCHO', '🐷', 'animales', 1], ['DUCK', 'PATO', '🦆', 'animales', 1], ['HORSE', 'CABALLO', '🐴', 'animales', 2],
    ['FROG', 'RANA', '🐸', 'animales', 2], ['LION', 'LEÓN', '🦁', 'animales', 2], ['MONKEY', 'MONO', '🐒', 'animales', 2], ['RABBIT', 'CONEJO', '🐰', 'animales', 2],
    ['BEAR', 'OSO', '🐻', 'animales', 2], ['ELEPHANT', 'ELEFANTE', '🐘', 'animales', 3], ['SHEEP', 'OVEJA', '🐑', 'animales', 3], ['MOUSE', 'RATÓN', '🐭', 'animales', 3],
    ['RED', 'ROJO', '#e63946', 'colores', 1], ['BLUE', 'AZUL', '#1f6fe5', 'colores', 1], ['GREEN', 'VERDE', '#22a04b', 'colores', 1], ['YELLOW', 'AMARILLO', '#f6c40f', 'colores', 1],
    ['PINK', 'ROSA', '#f472b6', 'colores', 2], ['PURPLE', 'VIOLETA', '#8b3fd9', 'colores', 2], ['BLACK', 'NEGRO', '#1b1b1f', 'colores', 2], ['WHITE', 'BLANCO', '#ffffff', 'colores', 2],
    ['BROWN', 'MARRÓN', '#8b5a2b', 'colores', 3], ['ORANGE', 'NARANJA', '#f97316', 'colores', 3],
    ['ONE', 'UNO', '1', 'numeros', 1], ['TWO', 'DOS', '2', 'numeros', 1], ['THREE', 'TRES', '3', 'numeros', 1], ['FOUR', 'CUATRO', '4', 'numeros', 1], ['FIVE', 'CINCO', '5', 'numeros', 1],
    ['SIX', 'SEIS', '6', 'numeros', 2], ['SEVEN', 'SIETE', '7', 'numeros', 2], ['EIGHT', 'OCHO', '8', 'numeros', 2], ['NINE', 'NUEVE', '9', 'numeros', 2], ['TEN', 'DIEZ', '10', 'numeros', 2],
    ['APPLE', 'MANZANA', '🍎', 'comida', 1], ['BANANA', 'BANANA', '🍌', 'comida', 1], ['MILK', 'LECHE', '🥛', 'comida', 1], ['BREAD', 'PAN', '🍞', 'comida', 2],
    ['CAKE', 'TORTA', '🎂', 'comida', 2], ['EGG', 'HUEVO', '🥚', 'comida', 2], ['STRAWBERRY', 'FRUTILLA', '🍓', 'comida', 3], ['PEAR', 'PERA', '🍐', 'comida', 3], ['ICE CREAM', 'HELADO', '🍦', 'comida', 3],
    ['HAND', 'MANO', '✋', 'cuerpo', 2], ['FOOT', 'PIE', '🦶', 'cuerpo', 2], ['EYE', 'OJO', '👁️', 'cuerpo', 2], ['EAR', 'OREJA', '👂', 'cuerpo', 2], ['NOSE', 'NARIZ', '👃', 'cuerpo', 2], ['MOUTH', 'BOCA', '👄', 'cuerpo', 3],
    ['BALL', 'PELOTA', '⚽', 'cosas', 1], ['CAR', 'AUTO', '🚗', 'cosas', 1], ['BOOK', 'LIBRO', '📖', 'cosas', 1], ['HOUSE', 'CASA', '🏠', 'cosas', 1], ['SUN', 'SOL', '☀️', 'cosas', 1],
    ['MOON', 'LUNA', '🌙', 'cosas', 2], ['STAR', 'ESTRELLA', '⭐', 'cosas', 2], ['TREE', 'ÁRBOL', '🌳', 'cosas', 2], ['FLOWER', 'FLOR', '🌸', 'cosas', 2], ['BIKE', 'BICI', '🚲', 'cosas', 2],
    ['TEDDY BEAR', 'OSITO', '🧸', 'cosas', 3], ['KITE', 'BARRILETE', '🪁', 'cosas', 3], ['BUS', 'COLECTIVO', '🚌', 'cosas', 3]
  ].map(function (x) { var color = x[2][0] === '#'; return { en: x[0], es: x[1], img: color ? null : x[2], color: color ? x[2] : null, tema: x[3], nivel: x[4] }; });
  var POR = {}; V.forEach(function (w) { POR[w.en] = w; });
  // Palabras que suenan parecido (de distintos temas): trampas de oído desde el nivel 2.
  var PARECIDAS = [['BEAR', 'PEAR'], ['THREE', 'TREE'], ['RED', 'BREAD'], ['CAT', 'CAKE'], ['CAR', 'STAR'], ['FOUR', 'FOOT'], ['MOUSE', 'MOUTH'], ['EAR', 'PEAR'], ['TEN', 'HEN']]
    .filter(function (p) { return POR[p[0]] && POR[p[1]]; });
  function parecida(en) { for (var i = 0; i < PARECIDAS.length; i++) { var p = PARECIDAS[i]; if (p[0] === en) return p[1]; if (p[1] === en) return p[0]; } return null; }
  var TEMAS = { animales: 'Animales', colores: 'Colores', numeros: 'Números', comida: 'Comida', cuerpo: 'Cuerpo', cosas: 'Cosas' };
  var TIPOS_NIVEL = { 1: [['escucha', 1]], 2: [['escucha', 3], ['sino', 1]], 3: [['escucha', 2], ['sino', 1], ['lee', 1], ['escribe', 1]] };

  function opciones(w, n, nivel, az) {
    var mismas = az.mezclar(V.filter(function (x) { return x.tema === w.tema && x.en !== w.en && x.nivel <= Math.max(nivel, 2); })), out = [w];
    var par = nivel >= 2 ? parecida(w.en) : null;
    if (par && az.prob(0.5)) out.push(POR[par]);
    for (var i = 0; out.length < n && i < mismas.length; i++) if (out.indexOf(mismas[i]) < 0) out.push(mismas[i]);
    return az.mezclar(out);
  }
  /* armarRonda(nivel, az, rep, RP) → [{tipo, w, opciones?, dice?}] (8 ítems). La clave del repaso es la palabra en inglés. */
  function armarRonda(nivel, az, rep, RP, n) {
    n = n || 8;
    var claves = V.filter(function (w) { return w.nivel <= nivel; }).map(function (w) { return w.en; });
    return RP.elegir(rep, claves, n, az, { minRepaso: 2 }).map(function (k) {
      var w = POR[k], ts = TIPOS_NIVEL[Math.min(3, nivel)], tipo = az.pesado(ts.map(function (t) { return t[0]; }), ts.map(function (t) { return t[1]; }));
      if (tipo === 'escribe' && (w.en.length > 5 || w.en.indexOf(' ') >= 0 || w.tema === 'numeros')) tipo = 'lee';
      var it = { tipo: tipo, w: w };
      if (tipo === 'escucha' || tipo === 'lee') it.opciones = opciones(w, nivel === 1 ? 3 : 4, nivel, az);
      if (tipo === 'sino') { var otras = opciones(w, 3, nivel, az).filter(function (x) { return x !== w; }); it.dice = az.prob(0.5) ? w : otras[0]; }
      return it;
    });
  }
  // Error al elegir otra palabra: suena parecido, es del mismo tema u otra cosa.
  function errorEleccion(w, elegida) {
    if (elegida === w) return null;
    if (parecida(w.en) === elegida.en) return 'CONFUNDE_PARECIDA';
    if (elegida.tema === w.tema) return 'CONFUNDE_TEMA';
    return 'CONFUNDE_OTRA';
  }
  var ERRORES = {
    CONFUNDE_TEMA: 'Confundió con otra palabra del mismo tema (DOG por CAT)', CONFUNDE_PARECIDA: 'Confundió con una palabra que suena parecido (TREE por THREE)',
    CONFUNDE_OTRA: 'Eligió otra palabra', SI_NO_MAL: 'Contestó mal "¿es esto un…?"', LEE_MAL: 'Leyó mal la palabra en inglés'
  };

  var api = { VERSION: '1.0.0', VOCAB: V, POR: POR, PARECIDAS: PARECIDAS, TEMAS: TEMAS, parecida: parecida, opciones: opciones, armarRonda: armarRonda, errorEleccion: errorEleccion, ERRORES: ERRORES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.INGLES1 = api;
})(typeof window !== 'undefined' ? window : this);
