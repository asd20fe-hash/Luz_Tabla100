/* Escritura de 1ro — banco de palabras con su dibujo (emoji). window.PALABRAS1.
   p: la palabra (con tilde si lleva; se acepta sin tilde). alt: otras respuestas válidas para el mismo dibujo.
   nivel 1: sílabas simples; 2: RR, LL, CH, QU, GU, trabadas y letras que suenan igual; 3: largas, H, GÜ. */
(function (root) {
  'use strict';
  var P = [
    // nivel 1
    ['☀️', 'SOL', 1], ['🌙', 'LUNA', 1], ['🐱', 'GATO', 1, ['GATITO']], ['🦆', 'PATO', 1], ['🏠', 'CASA', 1], ['🎲', 'DADO', 1], ['🐻', 'OSO', 1], ['🍇', 'UVA', 1, ['UVAS']],
    ['🦜', 'LORO', 1], ['🍅', 'TOMATE', 1], ['🐄', 'VACA', 1], ['🐒', 'MONO', 1], ['🐸', 'SAPO', 1, ['RANA']], ['🦭', 'FOCA', 1], ['✋', 'MANO', 1], ['🍞', 'PAN', 1],
    ['🐭', 'RATÓN', 1], ['🐝', 'ABEJA', 1], ['🎁', 'REGALO', 1], ['📦', 'CAJA', 1], ['🍋', 'LIMÓN', 1], ['⚽', 'PELOTA', 1], ['👑', 'CORONA', 1], ['🐑', 'OVEJA', 1],
    ['🐰', 'CONEJO', 1], ['🐺', 'LOBO', 1], ['🦁', 'LEÓN', 1], ['🍉', 'SANDÍA', 1], ['👁️', 'OJO', 1], ['🦶', 'PIE', 1], ['🐦', 'PÁJARO', 1], ['🥑', 'PALTA', 1],
    // nivel 2
    ['🐶', 'PERRO', 2, ['PERRITO']], ['🔑', 'LLAVE', 2], ['🐤', 'POLLITO', 2, ['POLLO']], ['🐷', 'CHANCHO', 2, ['CERDO']], ['🧀', 'QUESO', 2], ['🎸', 'GUITARRA', 2],
    ['⭐', 'ESTRELLA', 2], ['🌸', 'FLOR', 2], ['🚂', 'TREN', 2], ['🍽️', 'PLATO', 2], ['🎈', 'GLOBO', 2], ['📖', 'LIBRO', 2], ['🍓', 'FRUTILLA', 2], ['🚲', 'BICI', 2, ['BICICLETA']],
    ['⛵', 'BARCO', 2, ['VELERO']], ['✈️', 'AVIÓN', 2], ['🚚', 'CAMIÓN', 2], ['❤️', 'CORAZÓN', 2], ['🦒', 'JIRAFA', 2], ['🐍', 'VÍBORA', 2, ['SERPIENTE']], ['🪑', 'SILLA', 2],
    ['🌳', 'ÁRBOL', 2], ['🐟', 'PEZ', 2, ['PESCADO']], ['🦓', 'CEBRA', 2], ['🍒', 'CEREZA', 2, ['CEREZAS']], ['🐴', 'CABALLO', 2], ['🦊', 'ZORRO', 2], ['🐯', 'TIGRE', 2],
    ['🐬', 'DELFÍN', 2], ['✏️', 'LÁPIZ', 2], ['🎂', 'TORTA', 2], ['🍎', 'MANZANA', 2], ['🎺', 'TROMPETA', 2], ['🐉', 'DRAGÓN', 2],
    // nivel 3
    ['🦋', 'MARIPOSA', 3], ['🐘', 'ELEFANTE', 3], ['🐢', 'TORTUGA', 3], ['🥕', 'ZANAHORIA', 3], ['🍦', 'HELADO', 3], ['🥚', 'HUEVO', 3], ['🧅', 'CEBOLLA', 3],
    ['🚀', 'COHETE', 3], ['🐧', 'PINGÜINO', 3], ['🐊', 'COCODRILO', 3], ['🌈', 'ARCOÍRIS', 3], ['🐌', 'CARACOL', 3], ['🦉', 'BÚHO', 3, ['LECHUZA']], ['🦀', 'CANGREJO', 3],
    ['🐙', 'PULPO', 3], ['🦕', 'DINOSAURIO', 3], ['🍄', 'HONGO', 3], ['🦷', 'DIENTE', 3], ['🦈', 'TIBURÓN', 3], ['🏫', 'ESCUELA', 3], ['🧤', 'GUANTE', 3, ['GUANTES']],
    ['🍪', 'GALLETITA', 3, ['GALLETA']], ['🌻', 'GIRASOL', 3], ['🦔', 'ERIZO', 3], ['🍌', 'BANANA', 3]
  ].map(function (x) { return { img: x[0], p: x[1], nivel: x[2], alt: x[3] || [] }; });
  root.PALABRAS1 = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? window : this);
