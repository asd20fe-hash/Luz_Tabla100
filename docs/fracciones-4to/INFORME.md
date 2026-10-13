# Informe — fracciones de 4to

Rama: `fracciones-4to`, que parte de `main` (`856abb3`); sin push ni merge. Fecha: 2026-10-13. Las siete actividades y los archivos comunes nuevos están en la versión `1.0.0`; el shell pasó a v2.3.

## Qué se hizo y dónde está

| Qué | Dónde |
|---|---|
| Biblioteca: aritmética exacta (sin decimales), formato, lectura en palabras, `paraVoz`, parser del ingreso y clasificadores de error | `actividades/_comun-4to/fracciones-lib.js` (`REF4_FR`) |
| Figuras con áreas exactas, catálogo (tiras, cuadrículas, círculos, diagonales, rombo, triángulos, cuadraditos, igual área, cuarto escondido) y trampas | `fracciones-figuras.js` (`REF4_FIG`) |
| Generadores, validadores y pistas de las siete actividades; "¿Qué aprendiste?" (Anexo B) | `fracciones-gen.js` (A1–A3) y `fracciones-gen-2.js` (A4–A7) (`REF4_FRGEN`) |
| Anexo A como datos, con los ítems jugables | `fracciones-modulo.js` (`REF4_FRMOD`) |
| Fracciones apiladas, ingreso [entero][num/den], SVG (figuras, tiras, muro, potes, balanza, jarra, vasos, objetos) y el marco de ronda | `fracciones-ui.js` (`REF4_FRUI`) y `fracciones.css` |
| Mapa de fracciones, interruptor del módulo y nombres de los errores | `panel-fracciones.js` (`REF4_PANEL_FR`) + `index.html` (Ajustes de padres) |
| Actividades | `actividades/4to-fracciones-{repartos,partes,muro,comparar,cuanto-falta,potes-vasos,repaso}/` |
| Pruebas | `tests/fracciones-4to/` (`node tests/fracciones-4to/run.js`: 40 pruebas) |
| Decisiones | `docs/fracciones-4to/DECISIONES.md` |

## Ejercicios del módulo que cubre cada actividad

| Actividad | Ejercicios del módulo (Anexo A) |
|---|---|
| 🍕 Repartos | 1a, 1b, 1c, 2, 3a, 3b, rep-1, test-a |
| 🍫 Partes iguales | 5, 7, 10 (pintadas), test-b |
| 🧱 Muro de fracciones | 8, 9, 10, 11, 12, rep-5, rep-6, test-c |
| ⚖️ ¿Cuál es más? | 13, 14, 15, 16, rep-4, test-d |
| 🧩 ¿Cuánto falta? | 17, 18, 19, rep-7, rep-8, test-e, test-f |
| 🍯 Potes y vasos | kg-1, kg-2, kg-3, kg-4, l-5, l-5f |
| 📝 Repaso | todos los temas, como el test (opción múltiple de 4) |

Todas las respuestas del Anexo A se verifican con la biblioteca en las pruebas. Los ítems jugables (con el interruptor prendido) están en `fracciones-modulo.js` → `jugar`.

## Cómo probar cada actividad

Abrir `index.html?p=ian` (o la URL de la actividad con `?p=ian`). Con `&debug=1` aparece el panel con la versión, la semilla, el nivel, el ítem, la respuesta esperada (como fracción y como mixto) y los últimos eventos; `&seed=N` repite los ejercicios; `&nivel=N&tipo=X` fuerza el nivel y el tipo.

| Actividad | URL de ejemplo | Qué mirar |
|---|---|---|
| Repartos | `actividades/4to-fracciones-repartos/index.html?p=ian&debug=1&seed=3&nivel=1` (7 chocolates entre 2) | "Dar una vuelta" de más → pista `VUELTA_DE_MAS`; corte en 3 → `CORTE_INVALIDO`; responder 3 2/4 → "¡Bien! 3 2/4 es lo mismo que 3 1/2". Con `&nivel=3&tipo=R3` el reparto resuelto; con `&tipo=R2` la cuenta y "Ver la cuenta". |
| Partes iguales | `actividades/4to-fracciones-partes/index.html?p=ian&debug=1&seed=21&nivel=3&tipo=P3` | Marcar una trampa de partes desiguales → `PARTES_DESIGUALES`; "Ver cuadrícula". `&tipo=P4&nivel=2` para estirar la cinta; `&tipo=P2` para pintar tocando. |
| Muro | `actividades/4to-fracciones-muro/index.html?p=ian&debug=1&seed=31&nivel=2&tipo=E1` | Las piezas se acomodan y la que se pasa rebota; al cubrir: "¿Cuántas piezas usaste?" y "3/4 = 6/8". `&tipo=E3`, `E4` (dos globos y el porqué), `E6` (parejas). |
| ¿Cuál es más? | `actividades/4to-fracciones-comparar/index.html?p=ian&debug=1&seed=41&nivel=1&tipo=C1` | Tiras del mismo largo; 1/8 > 1/4 → pista de las partes más chicas. `&tipo=C2` canastas, `&tipo=C3` problemas con "¿Cómo te diste cuenta?", `&nivel=3&tipo=C4` ordenar. |
| ¿Cuánto falta? | `actividades/4to-fracciones-cuanto-falta/index.html?p=ian&debug=1&seed=7&nivel=3&tipo=S4` | Problema completo: leer (🔊), pregunta, entero, plan, calcular, ¿tiene sentido?, respuesta. `&nivel=2&tipo=S3` suma por pasos con tiras de dos colores. |
| Potes y vasos | `actividades/4to-fracciones-potes-vasos/index.html?p=ian&debug=1&seed=5&nivel=3&tipo=K1` | Tocar potes para cargar la balanza y tocarlos ahí para sacarlos; condiciones "mayor cantidad de 1/2" y "menor cantidad". `&nivel=2&seed=2&tipo=K5` jarra. |
| Repaso | `actividades/4to-fracciones-repaso/index.html?p=ian&debug=1&seed=71` | 8 preguntas sin pistas; al final, estrellas, resultado por tema, revisión con dibujo y "Practicar esto". |
| Ajustes de padres | `index.html?p=ian` → 🔒 → PIN 1234 | Las siete actividades en el panel, el Mapa de fracciones y el interruptor del módulo. |

## Verificación hecha

- `node tests/fracciones-4to/run.js`: 40 de 40 (aritmética, lectura, `paraVoz`, la tabla de clasificadores de la sección 15, figuras, el Anexo A completo, 1000 ítems por actividad, nivel y tipo, semillas, potes, opción múltiple, Mapa). `node tests/refuerzo-4to/run.js` sigue en 59 de 59.
- Chrome headless: las siete actividades en claro y oscuro, a 375 px y a 1024 px, sin errores de consola; el menú, la Tabla del 100 y las cinco actividades de refuerzo cargan sin errores. Se jugaron con el navegador los pasos de cada tipo (aciertos, errores con su pista y "Me perdí"), problemas completos del nivel 3, la balanza con cada condición, la jarra, un Repaso completo y Ajustes de padres.
- Interruptor del módulo: apagado no salió ningún ítem del Anexo A; prendido salió como máximo uno por ronda (en 11 de 16 rondas de 6 ítems, coherente con el 15 %).
- Grep: ningún `import`/`export` ni `type="module"`; ningún color fuera de las variables `--fr-*` (y de los tokens existentes); sin TODO.

## Supuestos y desvíos respecto del documento

Están todos en `DECISIONES.md`. Los principales:
- Carpetas `4to-fracciones-*` en lugar de `fracciones-*`.
- Claves `mate.<perfil>.<act>.*` en lugar de `ref4:*`.
- Tipo de ítem en `tipoItem`, porque `tipo` ya es la clase de evento.
- Generadores partidos en dos archivos y marco de ronda común en `fracciones-ui.js`.
- "¿Tiene sentido?" sobre la respuesta de otro chico.
- E1 con piezas de un solo tamaño y tramos de hasta 1.
- Unidad de la figura = MCD de las áreas.

## Pendiente o no probado

- No se probó en una tablet ni en un celular reales: la táctil se verificó con clics simulados y viewport móvil.
- La voz (Web Speech) no se pudo escuchar: el navegador headless no tiene voces, así que el botón 🔊 queda oculto ahí. El código es el mismo del Detective de problemas.
- La inactividad (15 s / 45 s) y las celebraciones usan las piezas existentes de `REF4_UI`; no se esperó el tiempo real en las pruebas.
- No se jugaron rondas completas de punta a punta en todas las actividades; sí cada tipo de ítem y el cierre de ronda del Repaso. La subida de nivel usa `REF4_EV.ajustarNivel`, que ya tiene pruebas.
- Con `file://` en Firefox, Ajustes de padres no ve los datos de las actividades (limitación ya anotada en `PLAN.md`).

## Sugerencias para la versión 1.1

- Arrastrar como extra en el muro, la balanza y las canastas (hoy es solo tocando, como pide el documento).
- Animar el reparto ("Dar una vuelta") moviendo cada objeto hasta su persona, y los pedacitos al cortar.
- Sumar al Mapa los datos compactados guardando el tema también en los agregados.
- Un "modo carpeta" para Repartos (nivel 4): resolver en papel y cargar solo la respuesta, como en División paso a paso.
- Más contextos y plantillas de problemas (S4) y de "¿Quién tiene razón?" (E4).
- Probar con el chico y ajustar los tamaños de ronda y la proporción de trampas según los datos del panel.
