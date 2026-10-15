/* Inglés — registro de vocabulario por temas (parte pura). window.ING_VOCAB / require. Versión 1.0.0 (2026-10-15).
   Cada tema es un archivo en temas/ que llama a ING_VOCAB.tema({id, nombre, icono, palabras:[[en, es, dibujo, nivel, extra?]]}).
   El dibujo es un emoji, o un color "#rrggbb" para los colores. extra: {parte} (cuerpo, para tocar el modelo 3D) u otros datos.
   Para sumar un tema: un archivo nuevo en temas/ (y un juego en juegos/ que lo use); no se toca este archivo. */
(function (root) {
  'use strict';
  var TEMAS = {}, ORDEN = [], POR = {}, TODAS = [];

  function tema(def) {
    if (TEMAS[def.id]) return TEMAS[def.id];
    var t = { id: def.id, nombre: def.nombre, icono: def.icono || '', palabras: [] };
    def.palabras.forEach(function (x) {
      var color = typeof x[2] === 'string' && x[2][0] === '#';
      var w = { en: x[0], es: x[1], img: color ? null : x[2], color: color ? x[2] : null, nivel: x[3] || 1, tema: def.id };
      w.art = def.sinArticulo ? '' : (/^[AEIOU]/.test(w.en) ? 'an' : 'a');   // artículo para las frases ("an apple"); extra.art lo cambia ("some milk")
      if (x[4]) for (var k in x[4]) w[k] = x[4][k];
      if (POR[w.en]) throw new Error('Palabra repetida: ' + w.en);
      POR[w.en] = w; t.palabras.push(w); TODAS.push(w);
    });
    TEMAS[def.id] = t; ORDEN.push(def.id);
    return t;
  }
  // palabras({temas:[...], nivel}) → lista filtrada (sin filtro: todas).
  function palabras(f) {
    f = f || {};
    return TODAS.filter(function (w) { return (!f.temas || f.temas.indexOf(w.tema) >= 0) && (!f.nivel || w.nivel <= f.nivel); });
  }

  // Palabras que suenan parecido. Solo se usan como trampa si las dos existen.
  var PARECIDAS = [['BEAR', 'PEAR'], ['THREE', 'TREE'], ['RED', 'BREAD'], ['CAT', 'CAKE'], ['CAR', 'STAR'], ['FOUR', 'FOOT'], ['MOUSE', 'MOUTH'], ['EAR', 'PEAR'], ['TEN', 'HEN']];
  function parecida(en) { if (!POR[en]) return null; for (var i = 0; i < PARECIDAS.length; i++) { var p = PARECIDAS[i]; if (p[0] === en && POR[p[1]]) return p[1]; if (p[1] === en && POR[p[0]]) return p[0]; } return null; }

  /* opciones(w, n, nivel, az, {mismoTema}) → n palabras mezcladas con w. Distractores del mismo tema (de nivel ≤ max(nivel,2));
     desde el nivel 2, la mitad de las veces suma una que suena parecido (si es del mismo tema o mismoTema es false). */
  function opciones(w, n, nivel, az, op) {
    op = op || {};
    var mismas = az.mezclar(TODAS.filter(function (x) { return x.tema === w.tema && x.en !== w.en && x.nivel <= Math.max(nivel, 2); })), out = [w];
    var par = nivel >= 2 ? parecida(w.en) : null;
    if (par && (op.mismoTema === false || POR[par].tema === w.tema) && az.prob(0.5)) out.push(POR[par]);
    for (var i = 0; out.length < n && i < mismas.length; i++) if (out.indexOf(mismas[i]) < 0) out.push(mismas[i]);
    return az.mezclar(out);
  }
  function errorEleccion(w, elegida) {
    if (!elegida || elegida === w || elegida.en === w.en) return null;
    if (parecida(w.en) === elegida.en) return 'CONFUNDE_PARECIDA';
    if (elegida.tema === w.tema) return 'CONFUNDE_TEMA';
    return 'CONFUNDE_OTRA';
  }
  var ERRORES = {
    CONFUNDE_TEMA: 'Confundió con otra palabra del mismo tema (BLUE por RED)', CONFUNDE_PARECIDA: 'Confundió con una palabra que suena parecido (TREE por THREE)',
    CONFUNDE_OTRA: 'Eligió otra palabra'
  };

  var api = { VERSION: '1.0.0', tema: tema, temas: function () { return ORDEN.map(function (k) { return TEMAS[k]; }); }, getTema: function (id) { return TEMAS[id] || null; },
    palabras: palabras, por: function (en) { return POR[en] || null; }, PARECIDAS: PARECIDAS, parecida: parecida, opciones: opciones, errorEleccion: errorEleccion, ERRORES: ERRORES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ING_VOCAB = api;
})(typeof window !== 'undefined' ? window : this);
