# Decisiones — fracciones de 4to

Registro de decisiones tomadas sin consultar, siguiendo la regla "manda el repo". Cada una dice qué se decidió, por qué y qué alternativa se descartó.

## 0. Rama de partida

La rama `refuerzo-4to` ya no existe: se mergeó en `main` (commit `9067a30`) y se borró. Por eso `fracciones-4to` parte de `main` (`856abb3`), que ya tiene toda la base común de 4to. El árbol tenía un solo archivo sin seguir (este masterprompt), que quedó en el commit `wip: estado previo`.

## 1. API real del repo (reconocimiento)

| Tema | API real |
|---|---|
| Alta de una actividad | Entrada en `MATE.actividades` (`actividades/registro.js`): `{id, nivelMax, titulo, descripcion, icono, perfiles:['ian'], ruta, version}`. El menú del shell filtra por `perfiles` y respeta el orden del arreglo: las siete de fracciones van juntas, al final. |
| Store por perfil | `MATE.store(act)` → `{get, set}` en `mate.<perfil>.<act>.<clave>`. Las actividades de 4to usan un almacén con el mismo esquema que avisa si `localStorage` está lleno (`REF4_UI.base`). |
| Tema y versión | `MATE.tema` (atributo `data-theme`; tokens en `:root` con media query y `[data-theme]`). Cada actividad muestra su versión en `#ver` (`REF4_UI.base`). |
| PIN y configuración | `MATE.pin.check/set`; "Ajustes de padres" está en `index.html` (`verPin`/`verAjustes`) y dibuja `REF4_PANEL.render` para todas las actividades cuyo id empieza con `4to-`. |
| Navegación | `MATE.irMenu()`, `MATE.abrir(id)` (conservan `?p=&t=&f=`). |
| Piezas comunes que ya existían (`_comun-4to/`) | `REF4_UI.teclado` (teclado numérico), `REF4_UI.globo` (pistas, `aria-live`), `REF4_UI.vigilar` (inactividad 15 s / 45 s), `REF4_UI.resumen` (estrellas, "Otra ronda"/"Salir"), `REF4_UI.contador`, `REF4_UI.celebrar`, `REF4_UI.sonar` (preferencia global `mate.global.sonido`), `REF4_UI.debugSet`; `REF4_EV` (eventos, agregados, 3000 eventos con compactación, `ajustarNivel`: sube con 2 rondas ≥ 80 %, baja con 2 < 50 %); `REF4_AZAR` (PRNG mulberry32 con semilla, `?seed=N`); `REF4_PANEL` (panel de estadísticas); `REF4_CUADERNO` + `REF4_DIV` (la cuenta de dividir dibujada como en la carpeta). El botón "Me perdí" no era una pieza común: cada actividad lo arma. |

## 2. Decisiones de adaptación

**Nombres de carpeta e ids.** La convención del repo es `actividades/<grado>-<nombre>`. Se usan `4to-fracciones-repartos`, `4to-fracciones-partes`, `4to-fracciones-muro`, `4to-fracciones-comparar`, `4to-fracciones-cuanto-falta`, `4to-fracciones-potes-vasos` y `4to-fracciones-repaso` (carpeta = id). Con el prefijo `4to-` el panel de padres existente las muestra sin tocarlo. Alternativa descartada: los nombres sin prefijo del documento (rompen la convención y quedarían fuera del panel).

**Claves de almacenamiento.** El documento pide `ref4:<act>:eventos|estado|agregados` y `ref4:fracciones:config`. Como en el refuerzo de 4to, el store real ya antepone perfil y actividad: se guardan como `mate.<perfil>.<act>.eventos|estado|agregados`, y la configuración en `mate.<perfil>.4to-fracciones.config` (`{incluirModulo:false}` por defecto). Alternativa descartada: claves `ref4:` a mano (esquivaría el store por perfil).

**Campo `tipo` del evento.** En los eventos existentes `tipo` ya es la clase de evento (`paso`, `ronda_inicio`, `ronda_fin`, `inactividad`, `nivel_cambio`) y `plegar` depende de eso. El tipo de ítem del documento (`R1`, `P3`…) va en `tipoItem` y además en `item.tipo`. Se agregan `tema`, `forma` y `modulo` como pide el documento. Alternativa descartada: pisar `tipo` (rompería las estadísticas existentes).

**Versión en eventos y logs.** `REF4_EV.crearRegistro` ya pone `v` en cada evento y `REF4_UI.base` el prefijo `[<act> vX.Y.Z]` en los logs.

**Archivos comunes nuevos.** Además de los cinco del documento se agregaron `fracciones-gen-2.js` (segunda mitad de los generadores: comparar, cuánto falta, potes y repaso; el archivo único superaba las 700 líneas) y `fracciones.css` (estilos comunes de fracciones con las variables `--fr-*`). Todos los archivos comunes nuevos tienen versión `1.0.0` en su comentario de cabecera (y `VERSION` en el código).

**Marco común de actividad (`REF4_FRUI.actividad`).** Las siete actividades comparten la mecánica de ronda: mezcla de tipos con pesos sin repetir un tipo más de 2 veces seguidas, ítem del módulo (15 %, máximo uno por ronda, solo con el interruptor), "Me perdí", 🔊, "¿Qué aprendiste?", resumen, nivel, debug (`?debug=1`, `?nivel=N`, `?tipo=X`) y registro de eventos. Se implementó una sola vez en `fracciones-ui.js`; cada actividad aporta `generar` y `pintar`. Alternativa descartada: copiar el ciclo de ronda en cada actividad, como en el refuerzo (siete copias).

**Unidad de la figura.** El documento dice "la partición más fina en partes iguales en la que cada región ocupa una cantidad entera de partes"; tomada al pie de la letra no tiene mínimo (siempre se puede partir más). Se usa la más gruesa que cumple la condición: el MCD de las áreas de las regiones. "Ver cuadrícula" dibuja las líneas de esa partición (o la cuadrícula de cuadraditos cuando ayuda más, como en la figura de igual área y distinta forma).

**Áreas exactas.** Los polígonos tienen coordenadas enteras y el área sale de la fórmula del zapato como fracción. En los círculos el área de cada sector es ángulo/360. Las coordenadas de los arcos solo se usan para dibujar.

**Orden de los clasificadores** (`REF4_FR.clasificar`, gana el más específico):
- `reparto`: `INVERTIDA` > `RESTO_IGNORADO` > `RESTO_MAL_PARTIDO` > `MIXTO` > `OTRO`.
- `parte`: `CUENTA_PARTES` (solo si los pedazos visibles no son las partes iguales) > `PARTE_PARTE` > `INVERTIDA` > `OTRO`.
- `equivalente`: `INVERTIDA` > `EQUIV_SUMA` > `EQUIV_MAL_ESCALADA` > `OTRO`.
- `comparar`: `IGUALDAD_NO_DETECTADA` > `MAS_DE_UN_ENTERO` (una pasa el entero y la otra no) > `DENOM_MAYOR_ES_MAYOR` (denominadores distintos y respondió "más partes es más") > `COMPARACION`.
- `suma`/`resta`: `OPERA_DENOMINADORES` > `DENOMINADOR_DISTINTO` > `CALCULO`.
- `problema`: `RESPONDE_EL_DATO` (vale también simplificado) > `PLAN_INCOMPLETO` > `PLAN_OPERACION` > `ENTERO_EQUIVOCADO` > `OPERA_DENOMINADORES`/`DENOMINADOR_DISTINTO` (si el problema tiene una cuenta) > `CALCULO`.
- `potes`: `SE_PASA` > `NO_LLEGA` > `RESTRICCION`.
- P3 (marcar las que son exactamente 1/4): `PARTES_DESIGUALES` > `CUENTA_PARTES` > `OTRO`.
- E3 (rodear equivalentes): el código de la primera ficha trampa marcada; si no marcó ninguna trampa pero le faltó una equivalente, `IGUALDAD_NO_DETECTADA`.

**"¿Qué aprendiste?"** Se registra con `paso: 'aprendiste'`, `tema: 'estrategia'` e `intento: 0` (como el audio en el Detective) para que no cuente en el porcentaje de la ronda ni en el de los paneles existentes; `primero: true` marca el primer intento, que es lo que usa el Mapa de fracciones.

**Adaptación.** Los pesos por tipo se calculan con los eventos de los últimos 14 días: peso 2 para los tipos con algún error o con un paso de más de 30 s. Los errores más frecuentes (`ses.pesosErr`) inclinan algunos generadores hacia sus trampas (por ejemplo, más "cuartos escondidos" en P1 si hay `CUENTA_PARTES`, más E4 "uno solo" si hay `JUSTIFICACION`, más pares de igual numerador en C1 si hay `DENOM_MAYOR_ES_MAYOR`).

## 3. Decisiones tomadas durante la implementación

**Comunes**
- **Barra inclinada.** `fraccionHTML` dibuja la fracción tal como está escrita (12/4 se ve como 12 sobre 4 y se lee "doce cuartos"); solo los números con denominador 1, o los mixtos calculados, se ven como enteros. Las etiquetas dentro de los SVG (muro, jarra) también van apiladas (`REF4_FRUI.svgFrac`).
- **Globo de pistas.** En pantallas de 640 px o menos va arriba, para no tapar el teclado numérico, y se cierra tocándolo. Es un estilo agregado en `fracciones.css`; las actividades de refuerzo no cambian.
- **Teclado.** `REF4_UI.teclado` reemplaza la clase del contenedor; el ingreso de fracciones la vuelve a agregar. Con el teclado físico, Tab, Enter, "/" y → pasan a la casilla siguiente (Shift+Tab y ← a la anterior) y Enter en la última es OK; si el foco llega a una casilla, esa es la que recibe los números (v1.0.1). S/N y las flechas en los botones de opción vienen de `REF4_UI.atajos`.
- **Rondas con un solo tipo.** Si el nivel tiene un solo tipo de ítem (Repartos, nivel 1), se repite aunque sean más de 2 seguidos (v1.0.1; antes el tercero salía sin tipo).
- **Respuestas equivalentes.** Si la respuesta está bien pero no simplificada, se acepta y el globo muestra "¡Bien! 4/8 es lo mismo que 1/2". Donde la consigna pide una forma (E2 "□/8", "¿Y escrito como una sola fracción?", "Pasá a octavos") se exige esa forma.
- **"Me perdí".** Muestra la ayuda del nivel anterior (dibujo, tiras, cuadrícula, la cuenta o "Partir") y una pista; se registra como `me_perdi`. No aparece en el nivel 1 (ya está todo a la vista) ni en el Repaso.

**A1 Repartos**
- "Dar una vuelta" no registra evento cuando la vuelta es válida (es parte de la animación); sí registra `VUELTA_DE_MAS` y `RESTO_MAYOR`, y el acierto final del paso.
- El corte se elige con botones del 2 al 8 (tocar es más rápido que escribir); un corte inválido queda deshabilitado.
- "Ver la cuenta" reusa `REF4_CUADERNO` en modo solo lectura (sin tabla del divisor). En R2 se escriben el cociente y el resto como enteros y después la respuesta.
- En las cosas que no se parten, la respuesta es el entero; responder N/M registra `PARTIR_INDIVISIBLE`.

**A2 Partes iguales**
- P4 "estirar" va de a una unidad, hasta 16 (así se puede probar el error de repetir la cinta b veces). "Partir" cuenta como ayuda `dibujo`. En el nivel 3, la variante con figuras usa rectángulos del mismo alto.
- La unidad de dibujo de las cintas se calcula con la cinta más larga que se va a mostrar, y todas se alinean a la izquierda para comparar largos.

**A3 Muro**
- E1 usa una paleta de un solo tamaño (más fino que el tramo) y tramos de hasta 1 entero, para que el muro (que llega a 1) sirva de referencia. Que la pieza rebote no se registra como error: es la forma de explorar.
- E4: elegir al que usa la fracción mal escalada registra `EQUIV_MAL_ESCALADA`; no ver que los dos (o ninguno) tienen razón, `IGUALDAD_NO_DETECTADA`; el porqué equivocado, `JUSTIFICACION`.
- E5: decir "falso" cuando es verdadero registra `IGUALDAD_NO_DETECTADA`; decir "verdadero" cuando es falso, `EQUIV_MAL_ESCALADA`. E6: una pareja equivocada registra `IGUALDAD_NO_DETECTADA`.
- En el nivel 1 las parejas incluyen el entero (1 = 4/4 = 8/8), porque sin él no alcanzan cuatro valores distintos.

**A4 ¿Cuál es más?**
- En los problemas (C3) las dos fracciones son menores que 1 (nadie lee más que el libro entero).
- C3: con denominadores distintos, elegir la que "parece mayor por tener más partes" registra `DENOM_MAYOR_ES_MAYOR`; elegir al revés en una pregunta de "menos" o "falta", `PREGUNTA`.
- C2 y C4 validan cada toque (una ficha por vez), así la pista llega en el momento.

**A5 ¿Cuánto falta?**
- "¿Tiene sentido?" se pregunta sobre la respuesta de otro chico ("Otro chico respondió…"), que la mitad de las veces es absurda (más que lo que había). Como el chico ya corrigió su propia cuenta, preguntar sobre ella siempre daría "sí". Alternativa descartada: preguntar antes de calcular (todavía no hay respuesta).
- En el nivel 3 la respuesta con unidad se elige entre unidades (la cantidad ya la escribió al calcular).
- P4 (juntar) no tiene el paso "¿Cuál es el entero?" porque no hay entero.

**A6 Potes y vasos**
- La variante "¿Se puede?" aparece desde el nivel 2 cuando el objetivo tiene una cantidad impar de cuartos, y sigue con "la mayor cantidad posible de potes de 1/2".
- K6 en el nivel 3 ajusta la altura de a 1/4 de la del mediano.

**A7 Repaso**
- Sin niveles (`nivelMax: 1`): cada pregunta usa el nivel 2 de su generador o el 3 si esa actividad ya está en el nivel 3.
- Una sola oportunidad por pregunta (es una prueba): se marca y sigue. El puntaje por tema se guarda en `mate.<perfil>.4to-fracciones-repaso.ultimo` y se registra un evento `repaso_fin`.
- El verdadero o falso tiene 2 opciones; las demás preguntas, 4 con valores distintos.

**Estadísticas**
- El panel existente ya muestra por actividad el nivel, rondas y minutos, el porcentaje, los errores frecuentes con ejemplo, las desconexiones, la exportación, el reinicio y el nivel a mano. `panel-fracciones.js` solo agrega el Mapa de fracciones, el interruptor y los nombres de los errores nuevos. El Mapa se calcula con los eventos guardados (los compactados en agregados no tienen tema), así que mira como máximo los últimos 3000 eventos de cada actividad.
- Shell v2.3: cambió Ajustes de padres (`index.html`); carga `fracciones-lib.js` y `panel-fracciones.js`.
