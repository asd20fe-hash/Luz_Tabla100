/* Registro de actividades. Cargar después de core.js y perfiles.js.
   ruta: relativa a la raíz del proyecto. stats (opcional): función que devuelve estadísticas. */
(function(){
'use strict';
MATE.actividades=[
  {id:'tabla100',titulo:'Saltos en la Tabla del 100',descripcion:'Sumá y restá saltando en la tabla.',icono:'🔢',perfiles:['luz'],ruta:'actividades/1ro-tabla100/index.html',version:'1.6'},
  {id:'4to-division-paso-a-paso',nivelMax:4,titulo:'División paso a paso',descripcion:'Dividí como en la carpeta y controlá cada paso.',icono:'➗',perfiles:['ian'],ruta:'actividades/4to-division-paso-a-paso/index.html',version:'1.0.3'},
  {id:'4to-cuantas-veces-entra',nivelMax:4,titulo:'¿Cuántas veces entra?',descripcion:'Las tablas al revés: ¿cuántas veces entra y cuánto sobra?',icono:'🪜',perfiles:['ian'],ruta:'actividades/4to-cuantas-veces-entra/index.html',version:'1.0.2'},
  {id:'4to-detective-problemas',nivelMax:4,titulo:'Detective de problemas',descripcion:'Leé, marcá los datos, armá el plan y respondé.',icono:'🔎',perfiles:['ian'],ruta:'actividades/4to-detective-problemas/index.html',version:'1.0.2'},
  {id:'4to-tiene-sentido',nivelMax:3,titulo:'¿Tiene sentido?',descripcion:'Estimá, verificá y descubrí resultados imposibles.',icono:'🤔',perfiles:['ian'],ruta:'actividades/4to-tiene-sentido/index.html',version:'1.0.3'},
  {id:'4to-calculo-con-ceros',nivelMax:4,titulo:'Cálculo con ceros',descripcion:'Multiplicá, dividí y sumá sin perder ni un cero.',icono:'🧮',perfiles:['ian'],ruta:'actividades/4to-calculo-con-ceros/index.html',version:'1.0.2'},
  // Fracciones de 4to (las siete juntas)
  {id:'4to-fracciones-repartos',nivelMax:3,titulo:'Repartos',descripcion:'Repartí en partes iguales: primero los enteros, después lo que sobra.',icono:'🍕',perfiles:['ian'],ruta:'actividades/4to-fracciones-repartos/index.html',version:'1.0.0'},
  {id:'4to-fracciones-partes',nivelMax:3,titulo:'Partes iguales',descripcion:'Leé, pintá y armá fracciones: cuenta el tamaño, no los pedazos.',icono:'🍫',perfiles:['ian'],ruta:'actividades/4to-fracciones-partes/index.html',version:'1.0.0'},
  {id:'4to-fracciones-muro',nivelMax:3,titulo:'Muro de fracciones',descripcion:'Fracciones equivalentes: la misma cantidad escrita de otra forma.',icono:'🧱',perfiles:['ian'],ruta:'actividades/4to-fracciones-muro/index.html',version:'1.0.0'},
  {id:'4to-fracciones-comparar',nivelMax:3,titulo:'¿Cuál es más?',descripcion:'Compará fracciones con criterios, sin adivinar.',icono:'⚖️',perfiles:['ian'],ruta:'actividades/4to-fracciones-comparar/index.html',version:'1.0.0'},
  {id:'4to-fracciones-cuanto-falta',nivelMax:3,titulo:'¿Cuánto falta?',descripcion:'Cuánto falta, sumas y restas, y problemas para leer con lupa.',icono:'🧩',perfiles:['ian'],ruta:'actividades/4to-fracciones-cuanto-falta/index.html',version:'1.0.0'},
  {id:'4to-fracciones-potes-vasos',nivelMax:3,titulo:'Potes y vasos',descripcion:'Kilos y litros con fracciones: ¿alcanza, falta o sobra?',icono:'🍯',perfiles:['ian'],ruta:'actividades/4to-fracciones-potes-vasos/index.html',version:'1.0.0'},
  {id:'4to-fracciones-repaso',nivelMax:1,titulo:'Repaso de fracciones',descripcion:'Un repaso tipo prueba con todo mezclado.',icono:'📝',perfiles:['ian'],ruta:'actividades/4to-fracciones-repaso/index.html',version:'1.0.0'}
];
})();
