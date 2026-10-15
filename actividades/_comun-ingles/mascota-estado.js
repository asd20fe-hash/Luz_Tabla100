/* Inglés — estado de la mascota virtual (parte pura). window.ING_PET / require. Versión 1.3.0 (2026-10-15): + ropa (lo que tiene) y puesto (lo que tiene puesto), ver ropa.js; v1.2.0 + limpieza y energía (baño y dormitorio); v1.1.0 + despensa (lo comprado en el supermercado).
   Necesidades de 0 a 100 que bajan despacio con el tiempo real y nunca por debajo de PISO: la mascota no se enferma ni se muere,
   y si pasan días sin jugar solo está con hambre o con sueño y contenta de volver a verla.
   Para sumar una necesidad (energía, limpieza…) basta agregarla a NECESIDADES; los estados viejos la reciben con su valor inicial. */
(function (root) {
  'use strict';
  var HORA = 3600000, PISO = 20;
  // id, emoji para la interfaz, cuánto baja por hora, valor inicial.
  var NECESIDADES = [
    { id: 'alegria', icono: '❤️', baja: 3, inicial: 80 },
    { id: 'panza', icono: '🍎', baja: 5, inicial: 60 },
    { id: 'limpieza', icono: '🫧', baja: 3, inicial: 80 },
    { id: 'energia', icono: '⚡', baja: 3, inicial: 80 }
  ];
  var NOMBRES = ['PIP', 'BO', 'MIMI', 'LUNA'];
  var ETAPAS = [{ id: 'bebe', desde: 0, escala: 0.8 }, { id: 'chico', desde: 40, escala: 0.92 }, { id: 'grande', desde: 120, escala: 1.05 }];

  function nuevo(ahora) {
    var e = { v: 1, nacido: false, nombre: null, color: null, accesorios: [], ropa: [], puesto: {}, despensa: {}, monedas: 0, aciertos: 0, lecciones: 0, creado: ahora, ts: ahora };
    NECESIDADES.forEach(function (n) { e[n.id] = n.inicial; });
    return e;
  }
  // Completa un estado guardado con lo que le falte (necesidades nuevas, campos nuevos).
  function normalizar(e, ahora) {
    if (!e || typeof e !== 'object') return nuevo(ahora);
    var base = nuevo(ahora);
    for (var k in base) if (e[k] === undefined) e[k] = base[k];
    return e;
  }
  var lim = function (x) { return Math.max(0, Math.min(100, x)); };
  // Baja las necesidades por el tiempo que pasó desde e.ts (sin pasar del piso; si ya estaba debajo, no sigue bajando).
  function avanzar(e, ahora) {
    var h = Math.max(0, (ahora - (e.ts == null ? ahora : e.ts)) / HORA);
    NECESIDADES.forEach(function (n) { var v = e[n.id]; if (v > PISO) e[n.id] = Math.max(PISO, v - n.baja * h); });
    e.ts = ahora;
    return e;
  }
  function sumar(e, id, cuanto) { if (e[id] !== undefined) e[id] = lim(e[id] + cuanto); return e; }
  // Premio por un acierto: monedas (2 al primer intento, 1 después) y alegría.
  function premiar(e, primerIntento) { e.monedas += primerIntento ? 2 : 1; e.aciertos++; sumar(e, 'alegria', primerIntento ? 4 : 2); return e; }
  // Ánimo para la cara y lo que dice la profe: la necesidad más baja manda si está por debajo de 40.
  function animo(e) {
    var peor = null;
    NECESIDADES.forEach(function (n) { if (e[n.id] < 40 && (!peor || e[n.id] < e[peor])) peor = n.id; });
    if (peor === 'panza') return 'hambre';
    if (peor === 'alegria') return 'aburrido';
    if (peor === 'limpieza') return 'sucio';
    if (peor === 'energia') return 'sueno';
    if (peor) return peor;
    return e.alegria >= 75 ? 'feliz' : 'contento';
  }
  function etapa(e) { var r = ETAPAS[0]; ETAPAS.forEach(function (x) { if (e.aciertos >= x.desde) r = x; }); return r; }

  var api = { VERSION: '1.3.0', PISO: PISO, NECESIDADES: NECESIDADES, NOMBRES: NOMBRES, ETAPAS: ETAPAS, nuevo: nuevo, normalizar: normalizar, avanzar: avanzar, sumar: sumar, premiar: premiar, animo: animo, etapa: etapa };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ING_PET = api;
})(typeof window !== 'undefined' ? window : this);
