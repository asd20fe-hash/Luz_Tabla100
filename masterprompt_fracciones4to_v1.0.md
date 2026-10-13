# Masterprompt: fracciones (4to grado)

> Versión del prompt: 1.0 (12/10/2026).
> Basado en el módulo de refuerzo de fracciones que mandó la escuela: repartos, partes de un entero, equivalencias, comparación, sumas y restas, kilos y litros, actividades de repaso y un test.
> No necesitás el PDF: todo lo relevante está acá, incluidas las respuestas (Anexo A).

---

## 0. Cómo trabajar (leer antes que nada)

Vas a implementar **siete actividades nuevas de fracciones** en esta app, de punta a punta, **sin hacer preguntas ni pedir confirmaciones**. Todo lo que necesitás está en este documento y en el código del repo.

### Reglas de autonomía

1. **Ambigüedades.** Si algo es ambiguo, elegí la opción más coherente con el código existente y con este documento, y seguí. Anotá la decisión en `docs/fracciones-4to/DECISIONES.md`: qué decidiste, por qué y qué alternativa descartaste.
2. **Choques con el repo.** Si algo de este documento choca con la arquitectura real, manda el repo. Adaptá la idea, no la arquitectura, y documentalo.
3. **Rama y commits.**
   - Trabajá en una rama nueva, `fracciones-4to`.
   - Si existe la rama `refuerzo-4to` y no está mergeada en la rama actual, creá `fracciones-4to` a partir de ella, para reutilizar su base común. Si no, a partir de la rama actual. Anotá de dónde partiste.
   - Si el árbol no está limpio al empezar, hacé primero un commit `wip: estado previo` en tu rama.
   - Hacé un commit por cada bloque terminado (ver sección 16).
   - **No hagas push ni merge.**
4. **Qué podés tocar.**
   - No modifiques actividades existentes.
   - Fuera de tus carpetas solo podés tocar:
     - `registro.js`, para dar de alta las actividades;
     - la sección de configuración, para el panel de estadísticas y el interruptor de la sección 4;
     - el `CLAUDE.md` raíz, para agregar una sección (ver sección 16);
     - `actividades/_comun-4to/`, donde solo **agregás** archivos o funciones retrocompatibles.
   - Si te falta algo del core `MATE`, escribí un adaptador en tu código compartido. Solo si es inevitable, hacé un cambio mínimo y retrocompatible en el core, y documentalo.
5. **Restricciones técnicas.**
   - Sin dependencias nuevas, sin CDN y sin paso de build.
   - **Sin ES modules**: está prohibido `import`/`export` y `<script type="module">`.
   - Nada de `fetch` a archivos locales.
   - Todo tiene que andar con doble clic en `index.html` (file://) y offline, igual que las actividades actuales.
6. **Orden.** Hacé las actividades en orden de prioridad (1 → 7). Cada actividad se da de alta en `registro.js` recién cuando funciona y pasa sus pruebas. Si el trabajo se corta, todo lo commiteado tiene que andar.
7. **Cierre.** Al terminar, escribí `docs/fracciones-4to/INFORME.md` (ver sección 16).

---

## 1. Reconocimiento del repo (antes de escribir código)

1. Leé completos estos archivos:
   - `registro.js` y el `CLAUDE.md` raíz;
   - el archivo donde se define el global `MATE`;
   - si existen, todo `actividades/_comun-4to/` y `docs/refuerzo-4to/DECISIONES.md`, que son la base común de las actividades de refuerzo de 4to (división, tablas y problemas);
   - al menos una actividad existente; si hay alguna de refuerzo de 4to, esa.
2. Anotá en `DECISIONES.md` la API real que vas a usar:
   - cómo se da de alta una actividad (campos, orden, ícono, y perfil o grado);
   - cómo se leen y escriben datos en el store por perfil;
   - cómo se aplica el tema claro/oscuro y cómo se expone la versión;
   - cómo funcionan el PIN y la sección de configuración;
   - qué piezas comunes ya existen y cómo se llaman: teclado numérico, globo de pistas, inactividad, resumen de ronda, botón "Me perdí", eventos, PRNG con semilla, niveles y panel de estadísticas.
3. **Reutilizá todo lo que exista**, sin duplicarlo. Si `_comun-4to/` no existe, creá ahí solo las piezas comunes que necesites. Seguí las secciones 2, 4 y 7, y pensalas para que las usen también otras actividades de 4to.
4. Los nombres de este documento son ilustrativos (por ejemplo `MATE.store`). Si la API real se llama distinto, usá la real.
5. Copiá la estructura y el estilo visual de las actividades existentes: encabezado, botón de volver, tipografía, tamaños y transiciones.

---

## 2. Convenciones obligatorias

### Carpetas

Respetá la convención de nombres del repo; si no hay una, usá kebab-case.

| Carpeta | Contenido |
|---|---|
| `actividades/fracciones-repartos/` | Actividad 1 |
| `actividades/fracciones-partes/` | Actividad 2 |
| `actividades/fracciones-muro/` | Actividad 3 |
| `actividades/fracciones-comparar/` | Actividad 4 |
| `actividades/fracciones-cuanto-falta/` | Actividad 5 |
| `actividades/fracciones-potes-vasos/` | Actividad 6 |
| `actividades/fracciones-repaso/` | Actividad 7 |
| `actividades/_comun-4to/` | Código compartido; acá se agregan los archivos de fracciones |
| `tests/fracciones-4to/` | Pruebas con node |
| `docs/fracciones-4to/` | `DECISIONES.md` e `INFORME.md` |

### Archivos y lógica

- Cada actividad tiene `index.html`, su CSS y sus JS clásicos cargados con `<script>`.
- La lógica pura va en archivos separados con patrón UMD sin módulos, para poder testearla con node sin build. Incluye aritmética, generadores, modelos de figuras, validadores, clasificadores de error y plantillas.

```js
(function (root) {
  var api = { /* funciones puras */ };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.REF4_FR = api; }
})(typeof window !== 'undefined' ? window : this);
```

Archivos nuevos en `_comun-4to/` (si alguno crece demasiado, partilo y documentalo):

| Archivo | Contenido | Global |
|---|---|---|
| `fracciones-lib.js` | Aritmética exacta, formato, lectura en palabras, parser del ingreso y clasificadores de error | `REF4_FR` |
| `fracciones-figuras.js` | Modelos de figuras con áreas exactas, catálogo y trampas | `REF4_FIG` |
| `fracciones-gen.js` | Generadores de ítems y plantillas de problemas | `REF4_FRGEN` |
| `fracciones-modulo.js` | El Anexo A como datos estructurados (tipo, datos y respuesta) | `REF4_FRMOD` |
| `fracciones-ui.js` | Widgets de interfaz (sección 6) | `REF4_FRUI` |

### Versionado

- Cada actividad tiene una constante `VERSION = "1.0.0"`; cada archivo común nuevo tiene la suya.
- El JS principal de cada actividad empieza con un comentario de changelog: versión, fecha y mejoras/correcciones.
- La versión se ve en pantalla, en un rincón discreto.
- La versión va en cada evento registrado y en cada log.
- **Los nombres de archivo no llevan versión**, y las referencias internas tampoco.

### Modo oscuro, debug, táctil y accesibilidad

**Modo oscuro (obligatorio).**
- Respetá el tema de `MATE`.
- Todos los colores van en variables CSS. Eso incluye los rellenos de las figuras, las tiras, los potes, la jarra, los colores de cada persona en los repartos, los resaltados y los globos.
- Verificá el contraste en los dos temas.
- Pintado y sin pintar se tienen que distinguir también sin color: relleno contra vacío, con borde.

**Debug.**
- Con `?debug=1` se muestra un panel con:
  - versión, semilla y nivel;
  - tipo de ítem y sus datos;
  - respuesta esperada, como fracción y como número mixto;
  - los últimos eventos.
- Con `?seed=N` los ejercicios son reproducibles.
- Con `?debug=1`, además, `?nivel=N` y `?tipo=X` fuerzan el nivel y el tipo de ítem.
- Los logs de consola llevan el prefijo `[<actividad> vX.Y.Z]`.

**Táctil primero.**
- Todo se hace **tocando**. Tocar un pote lo pone en la balanza y tocarlo ahí lo saca; tocar una ficha y después una canasta la mueve. Arrastrar, si lo agregás, es un extra y nunca la única forma.
- Teclado numérico propio en pantalla, sin depender del teclado del sistema.
- Botones de 48 px o más, sin interacciones que dependan del hover.
- Tiene que andar en celular vertical (375 px) y en tablet. Las figuras y las tiras se escalan al ancho disponible.
- Animaciones cortas (400 ms o menos), reducidas si `prefers-reduced-motion` está activo.

**Accesibilidad.**
- `aria-live` en las pistas.
- Foco visible.
- Textos de interfaz de 18 px o más.
- Cada fracción lleva un `aria-label` con su lectura en palabras ("tres cuartos").

### Código

Comentarios en español y archivos completos y prolijos. No dejes TODO sin resolver en código dado de alta.

---

## 3. Contexto: para quién y qué tema

### El chico

Tiene 10 años y está en 4to grado, en Argentina. Le va bien en los exámenes, pero se distrae y desconecta rápido.

En los problemas lee rápido y corta antes: sigue palabras clave, ignora datos implícitos y se saltea el último paso. Casi nunca controla si el resultado tiene sentido.

Hay otras actividades de 4to para división, tablas y problemas, ya hechas o en desarrollo: **no las dupliques**.

### El tema, según el módulo de la escuela

| Bloque del módulo | Qué trabaja | Act. |
|---|---|---|
| Repartos y medida (ej. 1 a 3) | Repartir en partes iguales cuando sobra: primero los enteros, después se parte lo que sobra (9 chocolates entre 2 → 4 y 1/2). Dos estrategias: dibujar, o hacer la división y partir el resto (5 : 4 = 1, resto 1 → 1/4) | 1 |
| Partes de un entero (ej. 4 a 7) | Mitad = 1/2 y mitad de la mitad = 1/4. Pintar 1/2. Reconocer cuáles tienen **exactamente** 1/4: cuenta el tamaño, no la cantidad de pedazos. Decir qué fracción está pintada. Dibujar la cinta entera sabiendo que una cinta es 1/4, 1/2 o 3/4 | 2 |
| Equivalencias (ej. 8 a 12) | 1/2 = 2/4 = 4/8, 1/4 = 2/8, 3/4 = 6/8. "¿Quién tiene razón?" (2/4 sí, 2/8 no). Rodear equivalentes | 3 |
| Otras relaciones (ej. 13 a 16) | Quién leyó más; > y <; mismo denominador y mismo numerador; fracciones mayores que un entero | 4 |
| Cuánto falta, sumas y restas (ej. 17 a 19) | Cuánto falta para 1 o para 2; completar sumas; sumas y restas con medios, cuartos y octavos | 5 |
| Cantidades fraccionarias y litros | Potes de 1, 1/2 y 1/4 kg; ¿alcanza?; 1 1/2 kg y 1 3/4 kg; 1 l = 8 vasos chicos = 4 medianos; jarra de 1 1/2 l | 6 |
| Repaso y test | Todo lo anterior mezclado, con un test de opción múltiple de 4 opciones | 7 |

**Denominadores.** El núcleo es 2, 4 y 8. Aparecen tercios en las figuras y 16avos una vez (8/16). Hay fracciones mayores que 1 y números mixtos (7/4, 10/8, 1 1/2, 1 3/4).

### Hilo conductor

- **Partes iguales y tamaño.** La mayoría de los errores de fracciones vienen de contar pedazos o de tratar la fracción como dos números naturales: 1/8 > 1/4 "porque 8 es más que 4", o 1/2 + 1/4 = 2/6. Cada actividad tiene ítems trampa armados con esos errores.
- **Leer la pregunta.** Distinguir falta, queda, consumió y "quién menos", y cuál es el entero (1 casa o 2 litros).
- **Controlar.** No puede quedar más de lo que había, y una suma no puede dar menos que uno de los sumandos.

---

## 4. Principios de diseño comunes

Son los mismos que en las actividades de refuerzo de 4to. Si ya están implementados en `_comun-4to/`, usá esa implementación tal cual.

### Rondas, feedback y ayuda

- **Rondas cortas**, de 2 a 4 minutos; cada actividad define su tamaño. Al terminar, se muestra un resumen con 1 a 3 estrellas según los aciertos al primer intento, y los botones "Otra ronda" y "Salir".
- **Mezcla dentro de la ronda.** Los tipos de ítem del nivel se mezclan al azar, con los pesos de la adaptación y sin repetir un tipo más de 2 veces seguidas.
- **Feedback inmediato** en cada paso, y **una sola cosa resaltada a la vez**.
- **Pistas.** Van en voseo rioplatense, son cortas (2 renglones como máximo) y aparecen en un globo cerca del elemento activo. Nunca retan.
- **Botón "Me perdí".** Muestra, para el ítem actual, la ayuda del nivel anterior: el dibujo, los pasos o la cuadrícula. Se registra como ayuda.

### Atención y tiempo

- **Inactividad.**
  - A los 15 s sin interacción: animación suave en el elemento activo y el texto "¿Seguimos? Te toca: {paso}".
  - A los 45 s: pantalla de pausa con el botón "Sigo".
  - Se registra un evento `inactividad`, sin penalización.
- **Tiempo.** Se registra siempre, por paso, y nunca se muestra.
- **Celebraciones** breves y variadas.
- **Sonido** suave y con interruptor. Si ya existe una preferencia de sonido, usá esa.

### Niveles y adaptación

- **Progresión por actividad.**
  - Sube de nivel con 2 rondas seguidas con 80 % o más al primer intento. Al subir aparece un mensaje de logro.
  - Baja con 2 rondas seguidas por debajo del 50 %.
  - El nivel también se puede fijar a mano desde la configuración, detrás del PIN.
- **Adaptación.** Los generadores dan peso doble a los tipos de ítem y a los errores con más fallas, o más lentos, de los últimos 14 días.

### Específico de fracciones

- **Primero ver, después el número.** En los niveles bajos cada fracción viene con su dibujo. Con los niveles el dibujo se retira y queda como ayuda a pedido ("Ver dibujo", "Ver tiras", "Ver cuadrícula"), que se registra.
- **Respuestas equivalentes.**
  - Se acepta cualquier fracción equivalente, salvo que la consigna pida una forma (por ejemplo "□/8").
  - Nunca se exige simplificar.
  - Si responde una forma no simplificada, se acepta y se muestra la otra: "¡Bien! 4/8 es lo mismo que 1/2".
- **Mixto y fracción valen lo mismo.** 1 3/4 y 7/4 se aceptan las dos, salvo que se pida una forma.
- **"¿Qué aprendiste?"**
  - Desde el nivel 2, cada ronda cierra con una frase para completar con 3 opciones (Anexo B), como las de "Un giro más" del módulo.
  - Se registra con el tema `estrategia` y no cuenta para las estrellas.
- **Ítems del módulo.**
  - Las respuestas del Anexo A sirven para las pruebas y como banco de ítems, pero por defecto **no aparecen** en las rondas. Los ejercicios usan números parecidos pero distintos, para que la app no le resuelva la tarea en papel.
  - En la configuración, detrás del PIN, el interruptor "Incluir ejercicios del módulo de la escuela" los habilita.
  - Habilitados, aparecen con 15 % de probabilidad, como máximo uno por ronda.

---

## 5. Notación y vocabulario de la escuela

- **Fracción apilada**: numerador arriba, raya horizontal y denominador abajo. Lo que ve el chico nunca usa barra inclinada; los textos internos y los logs, sí ("3/4").
- **Número mixto**: el entero y, al lado, la fracción apilada (1 ¾).
- **Lectura sin unidad**:
  - un medio, un cuarto, tres cuartos, un octavo, cinco octavos, un tercio, dos tercios, un dieciseisavo;
  - mixtos: "un entero y tres cuartos", "dos enteros y medio".
- **Lectura con unidad**:
  - medio kilo, un cuarto de kilo, tres cuartos de kilo, cinco cuartos de kilo;
  - un kilo y medio, un kilo y cuarto, un kilo y tres cuartos, dos kilos y medio;
  - medio litro, un cuarto de litro, un octavo de litro, un litro y medio.
- **Palabras**: entero, partes iguales, mitad, mitad de la mitad, numerador, denominador, fracciones equivalentes, repartir en partes iguales, lo que sobra.
- **Unidades y símbolos**: kg y l (1 litro se abrevia 1 l); >, < y =.
- **Plantillas.** En los textos, las fracciones se escriben "3/4" y "1 3/4".
  - `REF4_FRUI.conFracciones(texto)` las convierte en fracciones apiladas.
  - `REF4_FR.paraVoz(texto)` las convierte en palabras, junto con "kg" y "l".
- **Botón 🔊.**
  - Usa Web Speech API con voz es-AR; si no hay, cualquier es-*. Velocidad 0,95.
  - Si no hay ninguna voz disponible, el botón se oculta.
  - Nunca lee una barra: siempre pasa el texto por `paraVoz`.

---

## 6. Base común de fracciones

### `fracciones-lib.js` (lógica pura)

- **Fracción**: `{n, d}`, con enteros y `d > 0`. **Nunca uses decimales** para comparar o validar: usá productos cruzados.
- **Funciones**:
  - `fr`, `simplificar`, `sumar`, `restar`, `iguales`;
  - `comparar` → −1, 0 o 1;
  - `aDenominador(f, d)` → la fracción con ese denominador, o null si no se puede;
  - `aMixto(f)` → `{entero, n, d}` y `deMixto(e, n, d)`;
  - `formatear(f, {mixto})` → "7/4" o "1 3/4";
  - `leer(f, {mixto, unidad})` y `paraVoz(texto)`.
- **`parsear({entero, num, den})`** → una fracción, o `{error: "VACIO" | "DEN_CERO"}`. Con `DEN_CERO` aparece la pista: "El de abajo no puede ser 0: es en cuántas partes se corta".
- **`clasificar(tipo, item, respuesta)`** → código de error (sección 7). Si una respuesta coincide con más de un patrón, gana el más específico. Documentá el orden en `DECISIONES.md`.

### `fracciones-figuras.js` (lógica pura)

**Modelo de figura**, en unidades de cuadrícula:

```
{ tipo, ancho, alto, regiones: [{ id, path, area }], pintadas: [ids], unidad }
```

- Las áreas son fracciones exactas: los triángulos van en medios de unidad y los sectores de círculo, por ángulo/360.
- `unidad` es la partición más fina en partes iguales en la que cada región ocupa una cantidad entera de partes. Es lo que muestra "Ver cuadrícula".
- `fraccionPintada(fig)` = área pintada / área total.
- `partesIguales(fig)` → booleano.

**Catálogo** (cada tipo es parametrizable):
- tiras verticales u horizontales, iguales o desiguales;
- cuadrícula de a × b;
- círculo en n sectores, iguales o desiguales (ángulos múltiplos de 45°);
- cuadrado con las dos diagonales (4 triángulos), y con diagonales y medianas (8 triángulos);
- rombo inscripto en un cuadrado, con vértices en los puntos medios de los lados: el rombo es 1/2;
- triángulo partido en 4 o en 9 triángulos iguales;
- figuras de cuadraditos (L, T, cruz, escalera), de 4 a 8 cuadraditos;
- partes de igual área y distinta forma: un rectángulo de 4 × 2 con dos tiras laterales de 1 × 2 y el centro partido en dos rectángulos de 2 × 1, o sea 4 partes de 1/4;
- **"cuarto escondido"**: un rectángulo de 4 × 2 con una línea horizontal al medio y un rectángulo de 2 × 1 pintado en una esquina. Se ven 3 pedazos, pero lo pintado es 1/4.

**Trampas**, para "¿Qué parte está pintada?" y "¿Es exactamente 1/4?":
- la cantidad de pedazos no coincide con el denominador de lo pintado, como en el "cuarto escondido";
- las partes son desiguales y hay 1 de n pintada. Por ejemplo, tiras de anchos 1, 1, 1 y 3 con una angosta pintada: es 1/6, no 1/4.

### `fracciones-ui.js`

- **Mostrar fracciones**: `fraccionHTML(f, {mixto})` y `conFracciones(texto)` dibujan fracciones apiladas, con `aria-label` en palabras.
- **Ingreso de fracciones**:
  - casillas [entero] [numerador / denominador], con la activa resaltada;
  - se toca una casilla para elegirla y se completa con el teclado numérico común;
  - botones "Borrar" y "OK";
  - modos `fraccion`, `mixto` y `entero`;
  - hasta 2 cifras por casilla.
- **Dibujos SVG**:
  - figuras con regiones tocables;
  - tiras, alineadas al mismo largo para comparar;
  - muro de fracciones;
  - potes y barra de kilos;
  - jarra con marcas cada 1/8 l, y vasos chico y mediano.
- **Variables CSS**: `--fr-pintado`, `--fr-vacio`, `--fr-borde`, `--fr-resalte` y `--fr-p1` a `--fr-p8` (las personas en los repartos), cada una con su valor para el tema oscuro.

---

## 7. Datos, errores y estadísticas

### Evento

Mismo formato que las actividades de refuerzo de 4to, más los campos `tema`, `tipo`, `forma` y `modulo`:

```js
{
  v: "1.0.0", act: "fracciones-repartos", perfil: "<id>", ts: 1760000000000,
  sesion: "<id>", ronda: 2, nivel: 2,
  tema: "reparto",                       // ver la lista de temas
  tipo: "R1",                            // tipo de ítem
  item: { N: 7, M: 4, contexto: "turrones" },
  paso: "respuesta", intento: 1,
  esperado: "7/4", respuesta: "4/7",
  forma: "fraccion",                     // fraccion | mixto | entero | opcion
  ok: false, error: "INVERTIDA",
  ms: 5100,
  ayuda: "ninguna",                      // ninguna | pista | me_perdi | dibujo | tiras | cuadricula | cuenta | audio
  modulo: null                           // id del Anexo A, si es un ítem del módulo
}
```

**Temas**: `reparto`, `partes`, `entero`, `equivalencias`, `comparacion`, `mayor_que_uno`, `cuanto_falta`, `sumas_restas`, `problemas`, `medidas`, `estrategia`.

**Otros eventos**:
- `ronda_inicio`;
- `ronda_fin`, con duración, porcentaje al primer intento y estrellas;
- `inactividad`, con su duración en ms;
- `nivel_cambio`.

**Almacenamiento**:
- Va en el store por perfil de `MATE`, con las mismas claves y límites que las actividades de refuerzo de 4to: `ref4:<act>:eventos`, `ref4:<act>:estado` y `ref4:<act>:agregados`, hasta 3000 eventos y compactando los más viejos.
- La configuración de fracciones va en `ref4:fracciones:config`, que arranca como `{incluirModulo: false}`.
- Toda escritura va con try/catch.

### Códigos de error

| Código | Significa | Act. |
|---|---|---|
| `VUELTA_DE_MAS` | Quiso dar otra vuelta de enteros sin que alcanzara | 1 |
| `RESTO_MAYOR` | Dejó de repartir enteros cuando todavía alcanzaba (mismo código que en división) | 1 |
| `CORTE_INVALIDO` | Eligió un corte que no se reparte parejo | 1 |
| `RESTO_IGNORADO` | Respondió solo los enteros, sin repartir lo que sobra | 1, 7 |
| `RESTO_MAL_PARTIDO` | Armó mal la fracción de lo que sobra (por ejemplo, resto sobre la cantidad de objetos) | 1, 7 |
| `PARTIR_INDIVISIBLE` | Partió algo que no se puede partir | 1 |
| `INVERTIDA` | Puso numerador y denominador al revés | 1, 2, 3, 7 |
| `MIXTO` | Pasó mal de fracción a entero y fracción, o al revés | 1, 5, 6 |
| `CUENTA_PARTES` | Contó pedazos sin mirar si son del mismo tamaño | 2, 7 |
| `PARTE_PARTE` | Puso las pintadas sobre las no pintadas, en vez de sobre el total | 2, 7 |
| `PARTES_DESIGUALES` | Aceptó como 1/n una figura con partes desiguales | 2 |
| `PINTADO` | Pintó de más o de menos | 2 |
| `ENTERO_IGNORA_NUMERADOR` | Armó el entero repitiendo la parte b veces sin mirar el numerador (con 3/4, la repitió 4 veces) | 2 |
| `ENTERO_OTRO` | Otro error al reconstruir el entero | 2 |
| `EQUIV_MAL_ESCALADA` | Multiplicó arriba y abajo por números distintos (1/2 → 2/8) | 3, 7 |
| `EQUIV_SUMA` | Sumó o restó lo mismo arriba y abajo (1/2 → 2/3) | 3, 7 |
| `JUSTIFICACION` | Eligió bien, pero con un porqué equivocado | 3, 4 |
| `DENOM_MAYOR_ES_MAYOR` | Comparó los denominadores como números naturales (1/8 > 1/4) | 4, 7 |
| `IGUALDAD_NO_DETECTADA` | No vio que las fracciones eran iguales | 3, 4 |
| `MAS_DE_UN_ENTERO` | Ubicó mal una fracción respecto del entero | 4 |
| `COMPARACION` | Otro error al comparar | 4 |
| `OPERA_DENOMINADORES` | Sumó o restó también los denominadores (1/2 + 1/4 = 2/6) | 5, 7 |
| `DENOMINADOR_DISTINTO` | Operó los numeradores sin igualar el tamaño de las partes (3/8 + 1/4 = 4/8) | 5, 7 |
| `CALCULO` | Error de cuenta sin un patrón reconocible | 5, 6 |
| `RESPONDE_EL_DATO` | Respondió con un dato del enunciado, aunque sea simplificado | 5, 7 |
| `ENTERO_EQUIVOCADO` | Tomó como entero 1 cuando era 2, o al revés | 5, 6 |
| `PLAN_OPERACION` | Eligió mal la operación: sumó en vez de restar, o al revés | 5 |
| `PLAN_INCOMPLETO` | Hizo un paso y le faltó el último | 5 |
| `PREGUNTA` | No identificó qué se pregunta | 4, 5 |
| `ABSURDO` | No vio que el resultado era imposible | 5 |
| `UNIDAD` | Respondió sin unidad o con la unidad equivocada | 1, 5, 6 |
| `SE_PASA` / `NO_LLEGA` | Se pasó del objetivo / no llegó al objetivo | 6 |
| `RESTRICCION` | Llegó al objetivo sin cumplir la condición | 6 |
| `OTRO` | Cualquier otro caso | Todas |

### Panel de estadísticas (en la configuración, detrás del PIN)

Si el panel de las actividades de refuerzo ya existe, sumale las de fracciones; si no, crealo.

- **Por actividad**:
  - nivel actual;
  - rondas y minutos de los últimos 7 y 30 días;
  - porcentaje al primer intento;
  - los 5 errores más frecuentes, con un ejemplo real de cada uno;
  - desconexiones por ronda.
- **Mapa de fracciones**, por tema:
  - porcentaje al primer intento en los últimos 14 días;
  - cantidad de ítems;
  - tendencia (↑, ↓ o =) contra los 14 días anteriores;
  - el último puntaje del Repaso.
- **Interruptor** "Incluir ejercicios del módulo de la escuela".
- **Acciones**:
  - exportar todo en JSON;
  - reiniciar las estadísticas de una actividad, con confirmación;
  - fijar el nivel a mano.

---

## 8. Actividad 1: Repartos (PRIORIDAD 1)

**Carpeta:** `fracciones-repartos`. **Título visible:** "Repartos". **Ícono:** 🍕.

### Objetivo

Repartir en partes iguales cuando sobra: primero los enteros, después se parte lo que sobra. Escribir cuánto recibe cada uno como entero y fracción (4 y 1/2) o como fracción (9/2).

Conectar con la división: los enteros son el cociente, lo que sobra es el resto, y cada uno recibe resto/divisor. Decidir, además, si lo que sobra se puede partir.

### Pantalla

- Enunciado grande, con 🔊.
- **La mesa**, con los N objetos en SVG simple:
  - que se parten: pizza, chocolate, alfajor, muffin, turrón, torta, pote de helado de 1 kg, botella de 1 l;
  - que no se parten: figurita, pelota, lápiz.
- **Los que reciben**, abajo: M personas, potes o botellas, cada uno con su nombre y su color. Lo que recibe cada uno se pinta de su color, como en el dibujo de la escuela.
- Barra de pasos: Enteros → Sobra → Corto → Respuesta.

### Tipos de ítem

**R1. Reparto guiado.**

| Paso | Qué hace el chico |
|---|---|
| a. Enteros | En el nivel 1 toca "Dar una vuelta": cada toque le da un objeto a cada uno, animado. Cuando cree que no alcanza para otra vuelta, toca "No alcanza". En los niveles 2 y 3 escribe cuántos enteros recibe cada uno |
| b. Sobra | Responde "¿Cuántos sobran?". Si no sobra nada, aparece "¡No sobra nada! A cada uno le toca justo {q}" y se pasa al paso d |
| c. Corto | Si se puede partir: "¿En cuántas partes iguales cortás cada uno de los que sobran?" (de 2 a 8). Si no se puede partir: "¿Se puede partir una {cosa}?" (Sí / No); con "No", aparece "Sobran {r} {cosas}" |
| d. Respuesta | "¿Cuánto le toca a cada uno?", con ingreso mixto. Vale cualquier forma igual a N/M: 4 y 1/2, 9/2, 4 y 2/4 |

**Paso a.**
- Si toca "Dar una vuelta" cuando quedan menos de M, no se reparte y se registra `VUELTA_DE_MAS`.
- Si toca "No alcanza" cuando quedan M o más, se registra `RESTO_MAYOR`.

**Paso c.**
- Un corte k es válido si r × k es múltiplo de M. Entonces la app corta y reparte los pedacitos con los colores de cada uno.
- Un corte inválido registra `CORTE_INVALIDO`, y la app muestra los pedacitos que no se pueden repartir parejo.

**Paso d.**
- Desde el nivel 2, en el 40 % de los ítems sigue "¿Y escrito como una sola fracción?", o al revés.
- En el nivel 3 se elige la frase con la unidad: "A cada uno le toca 1 1/2 l".

**Botón "Ver la cuenta"** (a pedido en el nivel 2; cuenta como ayuda `cuenta`).
- Muestra N : M con el formato de la escuela: galera, cociente en la casita, la resta y el resto con barrita.
- Si las actividades de división tienen un componente de solo lectura, reusalo; si no, dibujá una versión simple.

**R2. Con la cuenta** (niveles 2 y 3). Sin dibujo, aparece N : M. El chico completa el cociente y el resto, y después escribe cuánto recibe cada uno.

**R3. ¿Qué reparto es?** (nivel 3). Se muestra un reparto ya resuelto, de una de estas dos formas:
- un dibujo con los objetos pintados por persona y uno partido;
- una cuenta con su resto y un círculo partido en M, con un pedazo pintado.

Primero se pregunta "¿Qué problema resolvió?", con 3 enunciados: el correcto, uno con N y M cambiados y uno con otro N. Después, "¿Qué respuesta escribió?", con 4 opciones.

**R4. Elegí** (niveles 2 y 3, como el test del módulo). "Se reparten {N} {cosas} entre {M} personas. ¿Cuánto recibe cada una?" Las opciones son:
- N/M o su mixto (la correcta);
- M/N (`INVERTIDA`);
- solo el cociente (`RESTO_IGNORADO`);
- cociente + r/N (`RESTO_MAL_PARTIDO`).

### Niveles

| Nivel | M | N y restos | Tipos | Ayudas |
|---|---|---|---|---|
| 1 | 2 y 4 | N de 3 a 12; resto distinto de 0 en el 80 % | R1 con "Dar una vuelta" | Dibujo y pasos siempre visibles |
| 2 | 2, 4 y 8 | N de 2 a 20; N < M en el 20 % (6 kg en 8 potes → 6/8); contextos de kg y l | R1 escribiendo, R2 y R4 | "Ver la cuenta" a pedido |
| 3 | 2, 3, 4 y 8 (3 en el 20 %) | N hasta 30, cociente hasta 5; un 25 % no se puede partir | R1 a R4, con forma pedida | Dibujo solo a pedido |

### Generador

- Elegir M, el cociente q y el resto r (0 ≤ r < M), y calcular N = q × M + r.
- Contextos:
  - que se parten: comida, kilos de helado en potes, litros en botellas;
  - que no se parten: figuritas, pelotas, lápices.
- No repetir el par (N, M) en la sesión, ni el mismo M dos veces seguidas.
- Nombres argentinos comunes; colores fijos por posición.
- **Ronda:** 3 repartos en los niveles 1 y 2; 4 ítems en el nivel 3.

### Pistas

| Situación | Texto |
|---|---|
| `VUELTA_DE_MAS` | "Quedan {r} y son {M}: no alcanza para darle uno más a cada uno." |
| `RESTO_MAYOR` | "Quedan {r} y son {M}. ¡Alcanza para otra vuelta!" |
| `CORTE_INVALIDO` | "Cortando en {k} salen {r·k} pedacitos. ¿Se reparten parejo entre {M}? Probá cortar en {M}." |
| `RESTO_IGNORADO` | "¿Y lo que sobró? Si se puede partir, también se reparte." |
| `RESTO_MAL_PARTIDO` | "Cada pedacito es 1/{k}, porque cortaste en {k}. ¿Cuántos pedacitos le tocaron a cada uno?" |
| `INVERTIDA` | "Abajo va en cuántas partes cortaste cada uno; arriba, cuántos pedacitos recibe cada uno." |
| `PARTIR_INDIVISIBLE` | "¿Media figurita sirve para el álbum? Hay cosas que no se parten." |
| `MIXTO` | "1 entero son {M}/{M}. {q} enteros son {q·M}/{M}. Sumale {r}/{M}." |
| `UNIDAD` | "¿{x} qué? ¿Pizzas, kilos, litros?" |

### Datos

Por ítem se registran:
- N, M, q, r y el contexto;
- si se puede partir y qué corte eligió;
- respuesta, forma y si fue correcta;
- error, ms y ayuda.

---

## 9. Actividad 2: Partes iguales (PRIORIDAD 2)

**Carpeta:** `fracciones-partes`. **Título visible:** "Partes iguales". **Ícono:** 🍫.

### Objetivo

La fracción como parte de un entero partido en partes **iguales**: cuenta el tamaño de las partes, no cuántos pedazos se ven. Leer, pintar y reconocer fracciones, y reconstruir el entero a partir de una parte.

### Tipos de ítem

**P1. ¿Qué parte está pintada?**
- Se responde con el ingreso de fracción. Vale cualquier equivalente de la fracción del área.
- Ayuda "Ver cuadrícula": superpone la `unidad` de la figura.

**P2. Pintá…**
- El chico toca regiones para pintarlas o despintarlas, y después "Listo".
- Se valida por área, así que vale cualquier combinación correcta.
- En el nivel 1 la consigna va en palabras y en número: "Pintá la mitad (1/2)", "Pintá la mitad de la mitad (1/4)". Al terminar: "La mitad de la mitad es 1/4".

**P3. Marcá las que tienen pintado exactamente 1/4** (o 1/2, o 1/3).
- Se muestran 4 figuras, con 1 a 3 correctas; las demás son trampas.
- Marcar una de partes desiguales registra `PARTES_DESIGUALES`.
- No marcar un "cuarto escondido" registra `CUENTA_PARTES`.

**P4. Armá el entero.** Se muestra una cinta que es a/b de la cinta entera.
- **Nivel 1:** elegir entre 3 cintas.
- **Niveles 2 y 3:** estirar una cinta nueva, con botones − y + de a una unidad o arrastrando el extremo, y tocar "Listo".
- **Ayuda "Partir":** marca la cinta dada en a partes iguales, cada una de 1/b.
- **Nivel 3:** también hay figuras: "Este rectángulo es 3/4 de la figura entera. ¿Cuál es la entera?" (3 opciones).

### Niveles

| Nivel | Figuras y fracciones | Tipos | Ayudas |
|---|---|---|---|
| 1 | Partes iguales; denominadores 2, 4 y 8 | P1, P2 en palabras, P4 eligiendo (1/2 y 1/4) | Dibujo grande |
| 2 | Denominadores 2, 3, 4, 6 y 8; pintar con partes múltiplo (3/4 en una figura de 8 partes) | P1 a P4; P4 estirando (1/2, 1/3 y 1/4) | "Ver cuadrícula" a pedido |
| 3 | Partes desiguales, igual área con formas distintas y trampas | P1 a P4; P4 con 3/4, 2/3 y figuras | Sin ayudas automáticas |

### Generador

- Figuras del catálogo de `fracciones-figuras.js`, sin repetir el mismo tipo dos veces seguidas.
- En P3, al menos una trampa por ítem, y las correctas de tipos distintos.
- En P4, el entero mide como máximo 12 unidades, para que entre en 375 px.
- **Ronda:** 6 ítems.

### Pistas

| Situación | Texto |
|---|---|
| `CUENTA_PARTES` | "Contaste pedazos, pero ¿son todos del mismo tamaño? Tocá 'Ver cuadrícula' y contá cuadraditos." |
| `PARTE_PARTE` | "Abajo va en cuántas partes iguales está partido todo el entero: las pintadas y las sin pintar." |
| `INVERTIDA` | "Arriba van las partes pintadas; abajo, todas las partes." |
| `PARTES_DESIGUALES` | "Para que sea 1/4, esa parte tiene que entrar justo 4 veces en la figura. ¿Entra?" |
| `PINTADO` | "Pintaste {x} de {total} partes. {fraccion} de {total} partes son {esperado} partes." |
| `ENTERO_IGNORA_NUMERADOR` | "Esta cinta no es 1/{b}: son {a} partes de 1/{b}. Partila en {a}, mirá cuánto mide una y armá las {b}." |
| Entero, con fracción 1/b | "Si esta cinta es 1/{b}, el entero son {b} cintas como esta." |

### Datos

Por ítem se registran:
- tipo de figura, pedazos visibles y si las partes son iguales;
- fracción esperada, respuesta y si fue correcta;
- error, ms y ayuda.

---

## 10. Actividad 3: Muro de fracciones (PRIORIDAD 3)

**Carpeta:** `fracciones-muro`. **Título visible:** "Muro de fracciones". **Ícono:** 🧱.

### Objetivo

Fracciones equivalentes: la misma cantidad escrita de otra forma. La estrategia de la escuela es partir cada parte en 2 (o en 4): quedan el doble de partes y el doble de partes pintadas. O sea, numerador y denominador se multiplican por el mismo número.

### Tipos de ítem

**E1. Cubrí con piezas.**
- El muro tiene filas de 1, 1/2, 1/4 y 1/8; en el nivel 3, también de 1/16.
- Se resalta un tramo, por ejemplo 3/4.
- El chico toca piezas de la paleta, que a veces tiene un solo tamaño ("solo octavos"). Las piezas se acomodan solas en la fila de trabajo; si se pasa, la última rebota.
- Al cubrirlo se pregunta "¿Cuántos octavos usaste?", y queda escrito "3/4 = 6/8".

**E2. Completá.** Por ejemplo 1/2 = □/8, 3/4 = 6/□ o □/4 = 2/8. Acá se exige la forma pedida.

**E3. Rodeá las equivalentes.**
- Se muestran una fracción y de 4 a 6 fichas; el chico toca las equivalentes y después "Listo".
- Los distractores salen de errores típicos y llevan su código:
  - invertida (4/2 para 1/2);
  - suma lo mismo arriba y abajo (`EQUIV_SUMA`);
  - multiplica distinto arriba y abajo (`EQUIV_MAL_ESCALADA`, como 2/8 para 1/2);
  - mismo numerador o mismo denominador.

**E4. ¿Quién tiene razón?**
- Dos chicos opinan en globos. Opciones: uno, el otro, los dos o ninguno.
- Después, "¿Por qué?", con 3 razones. Si elige bien con un porqué equivocado, `JUSTIFICACION`.
- Plantillas, con distintos números:
  - uno dice que 2/4 es equivalente a 1/2 y otro, que lo es 2/8: tiene razón uno solo;
  - "la segunda figura es 1/2 de la primera" contra "es 2/4": los dos;
  - del mismo budín, una da 1 porción de 2 y otro 2 porciones de 4: reciben lo mismo.

**E5. ¿Verdadero o falso?** "{k} partes de 1/{b} equivalen a {j} partes de 1/{c}." Tiene la ayuda "Ver tiras".

**E6. Parejas.**
- 8 fichas boca arriba forman 4 parejas que valen lo mismo; se tocan de a dos y las parejas se van.
- Las fichas mezclan número (3/4), dibujo (una tira con 6 de 8 pintadas) y palabras ("tres cuartos").
- Va siempre al final de la ronda, como máximo una vez.

### Niveles

| Nivel | Fracciones | Tipos | Ayudas |
|---|---|---|---|
| 1 | 1/2, 1/4, 3/4 y 1, con 2, 4 y 8 | E1 guiado, E2 con tiras, E6 | Tiras siempre |
| 2 | Se suman 3/2 = 6/4, 5/4 = 10/8 y 1 = 8/8 | E1 a E6 | Tiras a pedido |
| 3 | Se suman los 16avos; valores hasta 2 | E1 a E6; E4 siempre con porqué | Sin ayudas automáticas |

**Ronda:** 6 ítems.

### Pistas

| Situación | Texto |
|---|---|
| `EQUIV_MAL_ESCALADA` | "Si partís cada medio en 4, ¿cuántas partes pintadas tenés? Arriba y abajo cambian igual." |
| `EQUIV_SUMA` | "Sumar lo mismo arriba y abajo cambia la cantidad. Probá partir cada parte en 2." |
| `INVERTIDA` | "4/2 son 4 medios: ¡eso es más que un entero!" |
| E2 | "Para pasar de cuartos a octavos, cada cuarto se parte en 2: el doble de partes y el doble de pintadas." |
| E5 | "Tres partes de 1/2 son 3/2. Cada medio son 2/4: ¿cuántos cuartos son?" |
| `JUSTIFICACION` | "Elegiste bien, pero fijate el porqué. ¿Qué pasa si las dibujás?" |

### Datos

Por ítem se registran:
- tipo y fracción dada;
- opciones, con sus códigos;
- respuesta y si fue correcta;
- error, ms y ayuda.

---

## 11. Actividad 4: ¿Cuál es más? (PRIORIDAD 4)

**Carpeta:** `fracciones-comparar`. **Título visible:** "¿Cuál es más?". **Ícono:** ⚖️.

### Objetivo

Comparar con criterios, no adivinando:
- con el mismo denominador, es mayor la de mayor numerador;
- con el mismo numerador, es mayor la de **menor** denominador, porque sus partes son más grandes;
- con denominadores distintos, se pasan a equivalentes.

Usar 1/2 y 1 como referencias, y reconocer las fracciones mayores que un entero: las que tienen el numerador mayor que el denominador.

### Tipos de ítem

**C1. Poné >, < o =.**
- Tres botones grandes.
- Ayuda "Ver tiras": dos tiras del mismo largo, una debajo de la otra.

**C2. ¿Más o menos que un entero?**
- De 6 a 7 fichas y tres canastas: "menos de 1", "justo 1" y "más de 1".
- Se toca la ficha y después la canasta.

**C3. Problemas de comparar.**
- Por ejemplo: "{A} leyó 3/4 del libro y {B}, 5/8. ¿Quién leyó más?"
- Variantes: "¿Quién comió menos?" y "¿A quién le falta más?". Si leyeron lo mismo, les falta lo mismo.
- Se responde con un nombre o con "Los dos igual". Después, "¿Cómo te diste cuenta?", con 3 opciones.

**C4. Ordená de menor a mayor** (nivel 3). 3 o 4 fracciones que se tocan en orden.

**C5. Elegí** (como el test). Por ejemplo: "¿Cuál de estas es mayor que 5/4?", con 4 opciones.

### Niveles

| Nivel | Pares | Tipos | Ayudas |
|---|---|---|---|
| 1 | Mismo denominador o mismo numerador; 2, 4 y 8 | C1, C2 sin "justo 1", C3 con "más" | Tiras siempre |
| 2 | Denominadores distintos (uno múltiplo del otro); 20 % de pares iguales; mayores que 1 | C1, C2, C3 con "menos" y "falta", C5 | Tiras a pedido |
| 3 | Mixtos contra fracciones (1 1/4 y 5/4) y 16avos | C1 a C5 | Sin ayudas automáticas |

**Ronda:** 8 ítems.

### Pistas

| Situación | Texto |
|---|---|
| `DENOM_MAYOR_ES_MAYOR` | "Ojo: si la pizza se corta en más partes, cada parte es más chica. 1/8 es menos que 1/4." |
| Mismo denominador | "Las partes son del mismo tamaño: es más la que tiene más partes." |
| Denominadores distintos | "Pasalas a octavos: {a}/{b} = {x}/8. Ahora compará." |
| `IGUALDAD_NO_DETECTADA` | "Mirá las tiras: ¿llegan hasta el mismo lugar?" |
| `MAS_DE_UN_ENTERO` | "Un entero son {d}/{d}. Si arriba hay más que abajo, ya pasaste el entero." |
| `PREGUNTA` | "Leé la pregunta de nuevo: ¿preguntan quién comió más o quién comió menos?" |
| Cuánto falta | "Si leyeron lo mismo, les falta lo mismo." |

### Datos

Por ítem se registran:
- tipo, fracciones y relación esperada;
- respuesta, si fue correcta y justificación elegida;
- error, ms y ayuda.

---

## 12. Actividad 5: ¿Cuánto falta? (PRIORIDAD 5)

**Carpeta:** `fracciones-cuanto-falta`. **Título visible:** "¿Cuánto falta?". **Ícono:** 🧩.

### Objetivo

- Calcular cuánto falta para 1 o para 2, y completar sumas.
- Sumar y restar con medios, cuartos y octavos, pasando a partes del mismo tamaño.
- Resolver problemas de falta, queda y consumió: leer bien la pregunta, identificar cuál es el entero y controlar el resultado.

### Tipos de ítem

**S1. ¿Cuánto falta para el entero?**
- Se muestra una tira o un vaso lleno hasta a/b, y el chico ingresa la fracción que falta.
- Variante: "para llegar a 2".

**S2. Completá.** a/b + □ = 1 (o 2). Vale cualquier equivalente.

**S3. Sumá o restá** a/b ± c/d.
- En los niveles 1 y 2 se resuelve por pasos:
  1. "¿Las partes son del mismo tamaño?" (Sí / No, mirando las tiras).
  2. Si no lo son: "Pasá {c/d} a {partes}" (□/8). {partes} es medios, cuartos u octavos, según el denominador.
  3. El resultado.
- En el nivel 3, respuesta directa.
- Las tiras muestran las piezas de cada sumando en dos colores; en la resta, las que se sacan aparecen tachadas.

**S4. Problemas, como detective.**
1. **Leer**, con 🔊.
2. **"¿Qué te preguntan?"** Hay 3 paráfrasis: la correcta, una que pregunta el dato que ya está y una con el entero equivocado.
3. **"¿Cuál es el entero?"** Por ejemplo: toda la casa (1), 2 kg o 2 l.
4. **"¿Qué hacés?"** Hay 3 planes en palabras, definidos en cada plantilla: el correcto, uno incompleto o con la operación al revés, y "Ya está en el problema".
5. **Calcular**, con la tira o la jarra a pedido.
6. **"¿Tiene sentido?"** (niveles 2 y 3, en 1 de cada 2 problemas).
   - Pregunta: "¿Puede quedarle {resp} si tenía {T}?" (Sí / No).
   - Si la respuesta era absurda y no lo ve, se registra `ABSURDO`.
   - Aparece también cuando la respuesta está bien, para que la pregunta no delate el error.
7. **Respuesta con unidad**: se elige la frase en los niveles 1 y 2, y se escribe en el 3.

**S5. Elegí el resultado** (como el test). Por ejemplo, para 3/4 + 1/8 las opciones son 1/2, 6/8, 4/12 (`OPERA_DENOMINADORES`) y 7/8.

### Problemas (S4)

Las plantillas usan contextos cercanos: pintar, leer un libro, la tarea, pan, jugo, datos del celular, una caminata.

| Cat. | Tipo | Ejemplo |
|---|---|---|
| P1 | Falta para el entero | "Pintó 5/8 de la pared. ¿Cuánto le falta?" |
| P2 | Queda, con entero 2 | "Compró 2 kg de pan y ya comieron 5/4 kg. ¿Cuánto queda?" |
| P3 | Consumió, con entero 2 (trampa del entero) | "Tenía 2 l de jugo y ahora tiene 1/4 l. ¿Cuánto tomó?" |
| P4 | Juntar | "Tomó 1/4 l a la mañana y 1/2 l a la tarde. ¿Cuánto tomó en total?" |
| P5 | Dos pasos (trampa del último paso) | "El lunes leyó 1/4 del libro y el martes 3/8. ¿Cuánto le falta?" |
| P6 | Palabra clave engañosa | "Le quedan 3/8 de los datos del celular. ¿Cuánto usó?" |

### Niveles

| Nivel | Cuentas | Tipos | Ayudas |
|---|---|---|---|
| 1 | Mismo denominador; entero 1 | S1, S2, S3 y S4 (P1) | Tiras siempre |
| 2 | Un denominador múltiplo del otro (2 y 4, 2 y 8, 4 y 8); entero 1 o 2 | S1 a S5; S4 con P1 a P4 | Tiras a pedido |
| 3 | Resultados mayores que 1; restas desde mixtos (1 1/4 − 1/2) | S2 a S5; S4 con todas las categorías y 50 % con trampa | Sin ayudas automáticas |

### Generador

- Denominadores 2, 4 y 8.
- Resultados entre 0 y 2, nunca negativos ni triviales (nada de sumar 0).
- **Ronda:** 6 ítems, 2 de ellos problemas. En el nivel 1, 5 cuentas y 1 problema.

### Pistas

| Situación | Texto |
|---|---|
| `OPERA_DENOMINADORES` | "Ojo: los de abajo no se suman. {resp} es menos que {a/b}, así que no puede ser. Pasá todo a {partes}." |
| `DENOMINADOR_DISTINTO` | "Para sumar, las partes tienen que ser del mismo tamaño. Pasá {c/d} a {partes}." |
| `RESPONDE_EL_DATO` | "Ese número ya está en el problema. Te preguntan cuánto {falta / queda / tomó}." |
| `ENTERO_EQUIVOCADO` | "Acá el entero no es 1: tenía {T} {unidad}." |
| Complemento | "Un entero son {d}/{d}. Si ya hay {a}/{d}, ¿cuántos {partes} faltan?" |
| `PLAN_OPERACION` | "Preguntan cuánto queda: a lo que tenía, ¿le sumás o le sacás lo que tomó?" |
| `PLAN_INCOMPLETO` | "Eso es lo que ya leyó. ¿La pregunta pide eso o lo que le falta?" |
| `ABSURDO` | "¿Puede quedarle más de lo que tenía?" |
| `UNIDAD` | "¿{x} qué? ¿Kilos, litros, partes del libro?" |

### Datos

- **Por ítem:** tipo, operación y fracciones; respuesta y si fue correcta; error, ms y ayuda.
- **Por problema:** categoría y trampa; resultado de cada mini-paso al primer intento; si escuchó el audio.

---

## 13. Actividad 6: Potes y vasos (PRIORIDAD 6)

**Carpeta:** `fracciones-potes-vasos`. **Título visible:** "Potes y vasos". **Ícono:** 🍯.

### Objetivo

Usar fracciones en medidas:
- armar y comparar cantidades en kilos con potes de 1, 1/2 y 1/4 kg, y en litros con vasos de 1/4 y 1/8 l;
- trabajar con números mixtos (1 1/2, 1 3/4);
- decidir si alcanza, falta o sobra, y cuánto.

### Pantalla

- **Estante** con los potes disponibles: 1 kg, 1/2 kg y 1/4 kg. El tamaño del dibujo acompaña al peso.
- **Balanza**:
  - una barra horizontal de 0 a 3 kg, con marcas cada 1/4 kg y una banderita en el objetivo;
  - se llena a medida que se agregan potes;
  - en el nivel 1, debajo se ve la suma ("1/2 + 1/4 + 1/4 = 1").
- **Para litros**:
  - una jarra con marcas cada 1/8 l, hasta 1 1/2 l;
  - un vaso mediano (1/4 l) y uno chico (1/8 l), con la misma base; el chico mide la mitad de alto.

### Tipos de ítem

**K1. Llená la balanza.**
- Se da un objetivo (1, 1 1/4, 1 1/2, 1 3/4, 2 o 2 1/2 kg) y los potes disponibles.
- Condiciones posibles:
  - ninguna;
  - "solo hay potes de 1/2 y de 1/4";
  - "solo de 1/4";
  - "con la mayor cantidad posible de potes de 1/2";
  - "con la menor cantidad de potes".
- Tocar un pote lo agrega; tocarlo en la balanza lo saca.
- "Listo" valida que la suma sea el objetivo y que se cumpla la condición.
- Variante "¿Se puede?": primero se pregunta "¿Puede llevar justo 1 3/4 kg solo con potes de 1/2?" (No), y después lo arma con la mayor cantidad posible de potes de 1/2.

**K2. ¿Alcanza?**
- "Tiene estos potes y necesita {X} kg."
- Opciones: "Alcanza justo", "Falta" y "Sobra". Si no es justo, sigue "¿Cuánto?".

**K3. ¿Es justo 1 1/2 kg?** Como la tabla del módulo.
- 3 o 4 filas, cada una con una suma de potes (por ejemplo 1/2 + 1/2 + 1/2 + 1/4).
- Por fila: Sí o No y, si no, si falta o sobra y cuánto.

**K4. Completá la suma.**
- Por ejemplo: 1/2 + 3/4 + □ = 1 3/4.
- Vale cualquier equivalente. Si escribe 2/4: "¡Bien! 2/4 es lo mismo que 1/2".

**K5. Vasos.** 1 l llena 8 vasos chicos o 4 medianos.
- Preguntas:
  - "¿Cuántos medianos llenás con 1/2 l?" y "¿Y chicos?";
  - "¿Cuántos chicos llenás con un mediano?";
  - "¿Qué parte del litro tiene un vaso chico?".
- Con la jarra: "Con una jarra de 1 1/2 l servís estos vasos. ¿Cuánto sobra?". El chico los sirve tocándolos y la jarra baja.

**K6. ¿Cuál es el vaso chico?**
- Se dibuja el mediano y 3 vasos con la misma base: de la mitad de alto (el correcto), del mismo alto y de un cuarto de alto.
- En el nivel 3 el chico ajusta la altura con − y +.

### Niveles

| Nivel | Cantidades | Tipos | Ayudas |
|---|---|---|---|
| 1 | Objetivos de 1, 1 1/2 y 2 kg; sin condiciones | K1, K2 y K5 (cuántos vasos) | Suma y "falta / justo / sobra" visibles |
| 2 | Se suman 1 1/4, 1 3/4 y 2 1/2; condiciones; litros | K1 a K6 | Solo la barra |
| 3 | Mezcla; "mayor cantidad" y "menor cantidad"; respuestas mixtas | K1 a K6 | Nada hasta "Listo" |

**Ronda:** 4 ítems.

### Validaciones

- **Mayor cantidad de potes de 1/2** (con potes de 1/2 y 1/4): se ponen todos los medios que entran sin pasarse y el resto se completa con cuartos. Para 1 3/4: 3 de 1/2 y 1 de 1/4.
- **Menor cantidad de potes** (con 1, 1/2 y 1/4): se toman primero los más grandes. Para 2 1/2: 2 de 1 kg y 1 de 1/2.

### Pistas

| Situación | Texto |
|---|---|
| `SE_PASA` | "Te pasaste de la banderita. Sacá un pote." |
| `NO_LLEGA` | Nivel 1: "Todavía te falta {x}." Niveles 2 y 3: "Todavía no llegás." |
| `RESTRICCION`, mayor cantidad | "¡Justo! Pero se pedía la mayor cantidad de potes de 1/2. ¿Podés cambiar dos de 1/4 por uno de 1/2?" |
| `RESTRICCION`, menor cantidad | "¡Justo! Pero se puede con menos potes. ¿Podés cambiar dos chicos por uno más grande?" |
| Equivalencia | "Dos potes de 1/4 kg pesan lo mismo que uno de 1/2 kg." |
| Vasos | "1 l llena 8 vasos chicos: cada vaso chico es 1/8 de litro." |
| Medio litro | "Medio litro es la mitad del litro: la mitad de 8 vasos chicos." |
| Jarra | "1 1/2 l son 12/8 l. Restá lo que serviste, en octavos." |

### Datos

Por ítem se registran:
- objetivo y condición;
- potes elegidos y total;
- respuesta y si fue correcta;
- error, ms y ayuda.

---

## 14. Actividad 7: Repaso de fracciones (PRIORIDAD 7)

**Carpeta:** `fracciones-repaso`. **Título visible:** "Repaso de fracciones". **Ícono:** 📝.

### Objetivo

Un repaso tipo prueba, como el test del módulo: opción múltiple con 4 opciones y temas mezclados. Sirve para afianzar y para que el papá vea qué está firme.

### Mecánica

- **Preguntas.** Son 8, en orden al azar:
  - un reparto;
  - una parte pintada, con figura;
  - una equivalencia;
  - una comparación;
  - una de cuánto falta o queda;
  - una suma o resta;
  - una de medidas (kg o l);
  - un verdadero o falso de equivalencias.
- **Dificultad.** Se usa el nivel 2 de cada generador, o el 3 si el chico ya está en el nivel 3 de esa actividad.
- **Ayudas.** Durante el repaso no hay pistas ni "Me perdí"; el botón 🔊 sí está.
- **Opciones.** Cada opción incorrecta sale de un error típico y lleva su código. Las 4 opciones tienen valores distintos.
- **Al final.**
  - Estrellas y resultado por tema.
  - Revisión de cada error, con su explicación y un dibujo.
  - Botón "Practicar esto", que abre la actividad del tema (usá la navegación de `MATE` si existe).
- **Registro.** No tiene niveles. Guarda el puntaje por tema, que alimenta el Mapa de fracciones.

---

## 15. Pruebas

### Pruebas con node

Van en `tests/fracciones-4to/run.js`, se corren con `node tests/fracciones-4to/run.js` y no usan dependencias, solo `assert`.

**Aritmética y lectura.**
- Cuentas:
  - 1/2 + 1/4 = 3/4;
  - 3/4 − 1/8 = 5/8;
  - 3/4 > 5/8;
  - 10/8 = 5/4;
  - 7/4 = 1 3/4, y 1 3/4 = 7/4.
- Parsear con denominador 0 da `DEN_CERO`.
- `leer`:
  - 1/2 → "un medio"; 3/4 → "tres cuartos"; 5/8 → "cinco octavos";
  - 7/4 como mixto → "un entero y tres cuartos";
  - 1/2 kg → "medio kilo"; 1 1/2 kg → "un kilo y medio"; 1 3/4 kg → "un kilo y tres cuartos".
- `paraVoz("Necesita 1 3/4 kg de cacao")` contiene "un kilo y tres cuartos" y no contiene "/".

**Anexo A completo.** Cada respuesta del Anexo A se verifica con la biblioteca. Los ítems que no son numéricos (estrategias, "¿qué reparto es?") se cargan como ítems de opción múltiple.

**Clasificadores.**

| Caso | Respuesta | Código |
|---|---|---|
| 7 turrones entre 4 | 4/7 | `INVERTIDA` |
| 7 turrones entre 4 | 1 | `RESTO_IGNORADO` |
| 7 turrones entre 4 | 1 3/7 | `RESTO_MAL_PARTIDO` |
| 1/2 + 1/4 | 2/6 | `OPERA_DENOMINADORES` |
| 3/4 + 1/8 | 4/12 | `OPERA_DENOMINADORES` |
| 3/8 + 1/4 | 4/8 | `DENOMINADOR_DISTINTO` |
| Hizo 5/8 de la tarea. ¿Cuánto le falta? | 5/8 | `RESPONDE_EL_DATO` |
| Usó 6/8 de los datos. ¿Cuánto le queda? | 3/4 | `RESPONDE_EL_DATO` (es el dato simplificado) |
| Tenía 2 l y ahora tiene 1/4 l. ¿Cuánto tomó? | 3/4 | `ENTERO_EQUIVOCADO` |
| Tenía 2 l y ahora tiene 1/4 l. ¿Cuánto tomó? | 9/4 | `PLAN_OPERACION` |
| Leyó 1/4 y después 3/8. ¿Cuánto le falta? | 5/8 | `PLAN_INCOMPLETO` |
| Equivalente a 1/2 | 2/8 | `EQUIV_MAL_ESCALADA` |
| Equivalente a 1/2 | 2/3 | `EQUIV_SUMA` |
| Comparar 1/8 y 1/4 | > | `DENOM_MAYOR_ES_MAYOR` |
| Comparar 1/2 y 4/8 | < | `IGUALDAD_NO_DETECTADA` |
| 3 de 8 partes iguales pintadas | 3/5 | `PARTE_PARTE` |
| "Cuarto escondido" (3 pedazos) | 1/3 | `CUENTA_PARTES` |

**Figuras.**
- En todo el catálogo, la suma de las áreas da el total.
- `fraccionPintada` es exacta en las figuras del Anexo A.
- En las trampas, la cantidad de pedazos no coincide con el denominador de lo pintado, o las partes son desiguales.

**Generadores.**
- 1000 ítems por actividad, nivel y tipo cumplen sus restricciones.
- Con la misma semilla dan la misma secuencia.
- **Repartos:** siempre N = q × M + r, y un corte k es válido si y solo si r × k es múltiplo de M.
- **Potes:**
  - 1 3/4 kg con la mayor cantidad de 1/2 → 3 de 1/2 y 1 de 1/4;
  - 2 1/2 kg con la menor cantidad → 2 de 1 kg y 1 de 1/2.
- **Opción múltiple** (Repaso y tipos "Elegí"): exactamente una opción correcta, y los 4 valores distintos.
- Con el interruptor del módulo apagado, nunca sale un ítem del Anexo A.

### Verificación sin pruebas automáticas

- Ningún archivo usa `import`/`export`. Verificalo con un grep.
- Todos los colores son variables CSS. Verificalo con un grep de colores hex fuera de `:root` y de los bloques de tema.
- Si tenés un navegador headless, abrí cada actividad en tema claro y oscuro, a 375 px y a 1024 px de ancho, y revisá la consola.
- Si no lo tenés, hacé una revisión estática y anotá en el informe lo que no pudiste probar.

---

## 16. Orden de ejecución y definición de terminado

| Paso | Qué hacer | Commit |
|---|---|---|
| 1 | Reconocimiento del repo y `DECISIONES.md` | — |
| 2 | `fracciones-lib.js`, `fracciones-figuras.js`, `fracciones-ui.js`, `fracciones-modulo.js` y el esqueleto de `fracciones-gen.js`, con sus pruebas (más las piezas comunes que falten) | `feat(fracciones): base común` |
| 3 | Actividad 1, con sus generadores y pruebas, y su alta en `registro.js` | `feat(fracciones): repartos v1.0.0` |
| 4 | Actividad 2 | `feat(fracciones): partes v1.0.0` |
| 5 | Actividad 3 | `feat(fracciones): muro v1.0.0` |
| 6 | Actividad 4 | `feat(fracciones): comparar v1.0.0` |
| 7 | Actividad 5 | `feat(fracciones): cuanto-falta v1.0.0` |
| 8 | Actividad 6 | `feat(fracciones): potes-vasos v1.0.0` |
| 9 | Actividad 7 | `feat(fracciones): repaso v1.0.0` |
| 10 | Estadísticas: panel, Mapa de fracciones e interruptor del módulo | `feat(fracciones): estadísticas` |
| 11 | Sección en el `CLAUDE.md` raíz e `INFORME.md` | `docs(fracciones): convenciones e informe` |

### Una actividad está terminada cuando:

- funciona en tema claro y oscuro, en celular y en tablet, solo con toques;
- acepta respuestas equivalentes donde corresponde;
- registra eventos con la versión;
- respeta la progresión de niveles;
- pasa sus pruebas;
- está dada de alta en `registro.js` para el perfil del chico de 4to, siguiendo la convención del repo (si el menú permite agrupar u ordenar, las siete quedan juntas);
- muestra la versión en pantalla;
- funciona `?debug=1`;
- no rompe ninguna actividad existente: abrí el menú y las actividades previas y comprobá que cargan.

### Sección en el `CLAUDE.md` raíz

Agregá una sección "Actividades de 4to: convenciones", o completala si ya existe, de 40 líneas como máximo. Tiene que cubrir:
- dónde está el código común;
- el formato de eventos y los códigos de error;
- niveles y adaptación;
- pistas;
- debug;
- pruebas;
- los pasos para sumar un tema nuevo.

Así, los próximos pedidos pueden describir solo las actividades nuevas.

### `INFORME.md` incluye:

- qué se hizo y dónde está cada cosa;
- una tabla con los ejercicios del módulo que cubre cada actividad;
- cómo probar cada actividad: URLs con `?debug=1&seed=…&nivel=…&tipo=…`, y qué mirar;
- supuestos y desvíos respecto de este documento;
- lo que quedó pendiente o no se pudo probar;
- sugerencias para la versión 1.1.

---

## Anexo A. Respuestas del módulo

Sirven para las pruebas y, con el interruptor prendido, como banco de ítems del módulo. Los ids van en el campo `modulo` de los eventos.

### Repartos y partes

| Id | Ítem | Respuesta |
|---|---|---|
| `mod-1a` | 9 chocolates entre 2 | 4 1/2 (9/2) |
| `mod-1b` | 5 pizzas entre 4 | 1 1/4 (5/4) |
| `mod-1c` | ¿Qué se hace con lo que sobra en 1a y 1b? | El chocolate que sobra se parte en 2; la pizza, en 4 |
| `mod-2` | Un dibujo de 9 chocolates pintados con 2 colores, uno partido; y la cuenta 5 : 4 = 1, resto 1, con un círculo en 4 | El dibujo resuelve los chocolates (4 1/2 cada uno); la cuenta, las pizzas (1 1/4 cada uno) |
| `mod-3a` | 7 muffins entre 2 | 3 1/2 |
| `mod-3b` | 2 kg de helado en 4 potes | 1/2 kg |
| `mod-5` | ¿Cuáles tienen pintado exactamente 1/4? | Sí: el "cuarto escondido" y la figura de 4 cuadrados con 1 pintado. No: el triángulo de 9 con 3 pintados (1/3) y las 4 tiras con 2 pintadas (1/2) |
| `mod-7` | Una cinta es 1/4, o 1/2, de la entera | La entera mide 4 cintas, o 2. Si es 3/4, se parte en 3 y se agrega una parte más |

### Equivalencias

| Id | Ítem | Respuesta |
|---|---|---|
| `mod-8` | Un budín entre 2: 1 de 2 porciones, o 2 de 4 | 1/2 y 2/4: les toca lo mismo |
| `mod-9` | ¿Es equivalente a 1/2: 2/4 o 2/8? | 2/4 sí; 2/8 no (es 1/4). Un equivalente a 1/4: 2/8 |
| `mod-10` | Pintadas: 1 de 2, 3 de 4 y 4 de 8 | 1/2, 3/4 y 4/8; son equivalentes 1/2 y 4/8 |
| `mod-11` | La mitad de una figura, ¿es 1/2 o 2/4? | Las dos |
| `mod-12` | Equivalentes a 1/2 entre 1/4, 3/2, 2/4, 4/8; a 3/4 entre 2/8, 3/2, 6/8, 1/2; a 2/8 entre 1/4, 1/2, 2/4, 3/2 | 2/4 y 4/8; 6/8; 1/4 |

### Comparación

| Id | Ítem | Respuesta |
|---|---|---|
| `mod-13` | Leyeron 1/4 y 1/2; leyeron 3/4 y 5/8 | Leyó más el de 1/2; leyó más el de 3/4 (= 6/8) |
| `mod-14` | 2/4 ? 5/4; 1/2 ? 3/8; 1/8 ? 1/4; 5/4 ? 6/8 | <; >; <; > |
| `mod-15` | Con el mismo denominador, ¿cuál es mayor? ¿Y con el mismo numerador? | La de mayor numerador; la de menor denominador |
| `mod-16` | Mayores que 1 entre 3/2, 2/8, 7/4, 1/4, 5/2, 9/8, 7/8 | 3/2, 7/4, 5/2 y 9/8 |

### Cuánto falta, sumas y restas

| Id | Ítem | Respuesta |
|---|---|---|
| `mod-17` | Pintó 1/2; hizo 5/8; de 2 kg comió 5/4; tenía 2 l y quedan 1/4 l | Falta 1/2; falta 3/8; quedan 3/4 kg; consumió 1 3/4 l |
| `mod-18` | Completar 1/2, 3/4 y 7/8 hasta 1; completar 3/2, 7/4 y 10/8 hasta 2 | 1/2, 1/4, 1/8; 1/2, 1/4, 6/8 |
| `mod-19` | 1/2 + 3/2; 1/2 + 1/4; 3/8 + 1/4; 3/4 − 1/4; 1/2 − 1/4; 3/4 − 1/8 | 2; 3/4; 5/8; 1/2; 1/4; 5/8 |

### Actividades de repaso

| Id | Ítem | Respuesta |
|---|---|---|
| `rep-1` | 5 alfajores entre 2; 6 l en 4 botellas; 6 kg en 8 potes | 2 1/2; 1 1/2 l; 3/4 kg |
| `rep-4` | Recorrieron 1/2 y 4/8: ¿a quién le falta más? Comieron 2/4 y 3/8: ¿quién comió menos? | A los dos les falta lo mismo; el de 3/8 |
| `rep-5` | Seis de 1/4 y tres de 1/2; ocho de 1/4 y tres de 1/2; diez de 1/8 y cinco de 1/4; seis de 1/8 y dos de 1/2 | V; F; V; F |
| `rep-6` | Equivalentes a 1/2 entre 3/4, 4/2, 5/8, 2/4, 8/16, 12/8 | 2/4 y 8/16 |
| `rep-7` | 4/8 + 1/4; 3/8 + 1/2; 5/4 − 1/2; 10/8 − 1/2 | 3/4; 7/8; 3/4; 3/4 |
| `rep-8` | Leyó 3/4: ¿cuánto le falta? Consumió 3/8: ¿cuánto queda? | 1/4; 5/8 |

### Test (opciones entre paréntesis)

| Id | Ítem | Respuesta |
|---|---|---|
| `test-a` | 7 turrones entre 4 (4/7, 7/2, 7/4, 7/8) | 7/4 |
| `test-b` | 4 de 8 cuadrados pintados (8/4, 4/8, 1/4, 3/2) | 4/8 |
| `test-c` | Equivalente a 3/4 (3/8, 6/7, 2/3, 6/8) | 6/8 |
| `test-d` | Mayor que 5/4 (3/2, 5/8, 9/8, 3/4) | 3/2 |
| `test-e` | Usó 6/8 de los datos: ¿cuánto queda? (1/8, 1/4, 3/4, 3/8) | 1/4 |
| `test-f` | 3/4 + 1/8 (1/2, 6/8, 4/12, 7/8) | 7/8 |

### Kilos y litros

| Id | Ítem | Respuesta |
|---|---|---|
| `kg-1` | ¿Alcanzan potes de 1, 1/2, 1/4 y 1/4 kg para 2 kg? ¿Cómo se arma 1 kg con potes de 1/2 y 1/4? ¿Y solo con potes de 1/4? | Alcanza justo. 2 de 1/2, o 1 de 1/2 y 2 de 1/4, o 4 de 1/4. 4 potes |
| `kg-2` | ¿Es justo 1 1/2 kg? 1/4+1/4+1/2; 1/4+1/4+1/2+1/4; 1/2+1/2+1/2+1/4; 1/2+1/4+1/2+1/4 | Falta 1/2; falta 1/4; sobra 1/4; justo |
| `kg-3` | 1 3/4 kg solo con potes de 1/2; con la mayor cantidad de 1/2; solo con potes de 1/4 | No se puede; 3 de 1/2 y 1 de 1/4; 7 potes |
| `kg-4` | Completar hasta 1 3/4: 1/2 + 3/4 + □; 1 + 1/2 + □; 1/2 + 1/2 + 1/4 + □; cinco de 1/4 + □. ¿A 1 + 1/4 le falta 2/4 o 1/2? | 1/2; 1/4; 1/2; 1/2 (o 2/4). Las dos respuestas son correctas |
| `l-5` | 1 l = 8 chicos = 4 medianos. Con 1/2 l, ¿cuántos medianos? ¿Y chicos? Con un mediano, ¿cuántos chicos? | 2; 4; 2. El chico tiene 1/8 l y el mediano, 1/4 l. El chico tiene la misma base y la mitad de alto |
| `l-5f` | Jarra de 1 1/2 l: 1/4+1/4+1/8+1/8; 1/8+1/8+2/4+1/8 | Sobran 3/4 l (3 medianos o 6 chicos); sobran 5/8 l (5 chicos, o 2 medianos y 1 chico) |

---

## Anexo B. "¿Qué aprendiste?"

Frases para cerrar las rondas desde el nivel 2. La primera opción es la correcta; mezclalas al mostrarlas.

| Act. | Frase | Opciones |
|---|---|---|
| 1 | "Para repartir lo que sobra, tengo que…" | cortar cada uno de los que sobran en tantas partes como personas / dárselo al primero / sumarlo a los enteros |
| 1 | "7/4 es lo mismo que…" | 1 entero y 3/4 / 7 enteros y 4 / 4/7 |
| 2 | "Para saber qué fracción está pintada, tengo que…" | ver en cuántas partes iguales está partido el entero y cuántas están pintadas / contar los pedazos, aunque sean distintos / contar solo los pintados |
| 2 | "Si conozco 3/4 de una figura, para dibujarla entera…" | la parto en 3, cada parte es 1/4, y le agrego una más / la repito 4 veces / le agrego 3 partes más |
| 3 | "Para buscar una fracción equivalente, tengo que…" | partir cada parte en 2 o en más, o sea, multiplicar arriba y abajo por el mismo número / sumar 1 arriba y abajo / multiplicar solo el de abajo |
| 4 | "Para comparar fracciones de distinto denominador, tengo que…" | pasarlas a partes del mismo tamaño y ver cuál tiene más / ver cuál tiene el número de abajo más grande / sumar el de arriba y el de abajo |
| 4 | "Si dos fracciones tienen el mismo numerador, es mayor…" | la de denominador más chico / la de denominador más grande / ninguna, porque son iguales |
| 4 | "Una fracción es mayor que un entero cuando…" | el numerador es mayor que el denominador / el denominador es mayor que el numerador / tiene números grandes |
| 5 | "Para sumar o restar fracciones de distinto denominador, tengo que…" | pasarlas a fracciones equivalentes con el mismo denominador / sumar los de arriba y los de abajo / sumar solo los de arriba |
| 5 | "Para saber cuánto falta para el entero, tengo que…" | ver cuántas partes faltan para tenerlas todas / sumar la fracción dos veces / restarle 1 al numerador |
| 6 | "Dos potes de 1/4 kg pesan lo mismo que…" | uno de 1/2 kg / uno de 1 kg / uno de 1/8 kg |
