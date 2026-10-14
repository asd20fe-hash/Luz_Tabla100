/* Perfiles de la familia. Cargar después de core.js.
   Los perfiles creados desde el menú (amigos, etc.) viven en mate.global.perfiles y se suman acá. */
(function(){
'use strict';
MATE.perfiles=[
  {id:'luz',nombre:'Luz',grado:'1ro',avatar:'🦄',color:'#ec4899'},
  {id:'ian',nombre:'Ian',grado:'4to',avatar:'🦊',color:'#0e9fbf'}
].concat(MATE.perfilesNuevos?MATE.perfilesNuevos.lista():[]);
})();
