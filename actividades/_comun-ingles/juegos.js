/* Inglés — registro de minijuegos. window.ING_JUEGOS / require. Versión 1.1.0 (2026-10-15): + preparar y error (opcionales; los usa "How many?").
   Cada juego es un archivo en juegos/ que llama a ING_JUEGOS.registrar(def):
     id, tema (de ING_VOCAB), nombre ("Paint Pip!"), icono, accion (emoji de lo que se hace)
     orden(w, nombre, paso) → frase en inglés que dice la profe ("Paint Pip blue")   ← parte pura (se prueba en node)
     opciones(w, nivel, az) → palabras para elegir (incluye w)                 ← parte pura
     preparar(paso, nivel, az) (opcional) → agrega datos al paso (la comida que se cuenta en paso.cosa)
     error(w, elegida) (opcional) → código de error propio (si no, el de ING_VOCAB.errorEleccion)
     jugar(J, paso, fin)   → la parte 3D (solo navegador; J es el entorno que arma la actividad, ver juego.js) */
(function (root) {
  'use strict';
  var JUEGOS = {}, ORDEN = [];
  function registrar(def) { if (!JUEGOS[def.id]) ORDEN.push(def.id); JUEGOS[def.id] = def; return def; }
  var api = {
    VERSION: '1.1.0', registrar: registrar,
    get: function (id) { return JUEGOS[id] || null; },
    lista: function () { return ORDEN.map(function (k) { return JUEGOS[k]; }); },
    // El juego que practica un tema (el primero registrado).
    deTema: function (tema) { for (var i = 0; i < ORDEN.length; i++) if (JUEGOS[ORDEN[i]].tema === tema) return JUEGOS[ORDEN[i]]; return null; },
    cuantas: function (nivel) { return nivel <= 1 ? 3 : 4; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ING_JUEGOS = api;
})(typeof window !== 'undefined' ? window : this);
