/* Inglés — álbum de figuritas de las palabras (parte pura). window.ING_ALBUM / require. Versión 1.0.0 (2026-10-15).
   Una página por tema de ING_VOCAB, con todas sus palabras (también las de niveles que todavía no juega: se ven como sombra).
   Cada figurita está en uno de tres estados:
     'falta'  todavía no la jugó (no está en el repaso, REPASO1)
     'nueva'  ya la jugó y la ganó, pero falta pegarla (se ve el sobre 🎁 y se abre tocándolo)
     'pegada' ya está en el álbum (pet.album = [palabras pegadas]); se toca para oírla
   y es de oro (oro: true) si la sabe bien: caja ≥ 3 del repaso y sin errores pendientes. */
(function (root) {
  'use strict';
  var EnNode = typeof module !== 'undefined' && module.exports;
  var V = EnNode ? require('./vocab.js') : root.ING_VOCAB, RP = EnNode ? require('../_comun-1ro/repaso.js') : root.REPASO1;
  var ORO = 3;

  function carta(w, rep, pet) {
    var it = rep.items[w.en], e = RP.estado(it);
    var estado = !it ? 'falta' : ((pet.album || []).indexOf(w.en) >= 0 ? 'pegada' : 'nueva');
    return { w: w, estado: estado, oro: !!it && it.caja >= ORO && (e === 'bien' || e === 'aprendido') };
  }
  // paginas(rep, pet) → [{id, nombre, icono, cartas, tiene, nuevas, total, completa}] en el orden de los temas.
  function paginas(rep, pet) {
    return V.temas().map(function (t) {
      var cs = V.palabras({ temas: [t.id] }).map(function (w) { return carta(w, rep, pet); });
      var n = function (st) { return cs.filter(function (c) { return c.estado === st; }).length; };
      return { id: t.id, nombre: t.nombre, icono: t.icono, cartas: cs, tiene: cs.length - n('falta'), nuevas: n('nueva'), total: cs.length, completa: n('pegada') === cs.length };
    });
  }
  // cuenta(rep, pet) → {pegadas, nuevas, oro, total}
  function cuenta(rep, pet) {
    var r = { pegadas: 0, nuevas: 0, oro: 0, total: 0 };
    V.palabras().forEach(function (w) { var c = carta(w, rep, pet); r.total++; if (c.estado === 'pegada') r.pegadas++; if (c.estado === 'nueva') r.nuevas++; if (c.oro && c.estado === 'pegada') r.oro++; });
    return r;
  }
  // pegar(pet, en): la pega (una vez); devuelve true si era nueva.
  function pegar(pet, en) { pet.album = pet.album || []; if (pet.album.indexOf(en) >= 0 || !V.por(en)) return false; pet.album.push(en); return true; }

  var api = { VERSION: '1.0.0', ORO: ORO, carta: carta, paginas: paginas, cuenta: cuenta, pegar: pegar };
  if (EnNode) module.exports = api;
  else root.ING_ALBUM = api;
})(typeof window !== 'undefined' ? window : this);
