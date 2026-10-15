/* Carga los módulos puros de _comun-ingles como en la página (vocabulario, temas, juegos y lecciones). */
'use strict';
var R = '../../actividades/';
var V = require(R + '_comun-ingles/vocab.js');
['colores', 'comida', 'numeros', 'cosas', 'cuerpo', 'sentimientos', 'ropa', 'acciones'].forEach(function (t) { require(R + '_comun-ingles/temas/' + t + '.js'); });
var JG = require(R + '_comun-ingles/juegos.js');
require(R + '_comun-ingles/juegos/pintar.js'); require(R + '_comun-ingles/juegos/comer.js'); require(R + '_comun-ingles/juegos/tocar.js'); require(R + '_comun-ingles/juegos/buscar.js'); require(R + '_comun-ingles/juegos/contar.js'); require(R + '_comun-ingles/juegos/sentir.js'); require(R + '_comun-ingles/juegos/vestir.js'); require(R + '_comun-ingles/juegos/hacer.js');
module.exports = { V: V, JG: JG, LC: require(R + '_comun-ingles/lecciones.js'), PET: require(R + '_comun-ingles/mascota-estado.js'), TD: require(R + '_comun-ingles/tienda.js'), ROPA: require(R + '_comun-ingles/ropa.js'), AL: require(R + '_comun-ingles/album.js'),
  RP: require(R + '_comun-1ro/repaso.js'), AZ: require(R + '_comun-4to/azar.js'), R: R };
