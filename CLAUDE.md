# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

"Saltos en la Tabla del 100": una app de práctica de matemática para chicos de primer grado (Argentina), armada alrededor de una tabla del 100 en 3D. La app entera es un único archivo, `index.html` (HTML + CSS + un script inline). No hay compilación, ni gestor de paquetes, ni tests, ni linter.

- **Ejecutar:** abrir `index.html` en el navegador, o servir la carpeta (por ejemplo `python -m http.server`) y abrirla. Necesita internet para three.js r128 (cdnjs) y la fuente Fredoka (Google Fonts). Si three.js no carga, se muestra el mensaje `#fallback`.
- **Depurar:** todo se registra en la consola con el prefijo `[Tabla100 vX.Y]`. `window.__tabla100` expone `state` (el objeto `S`) y `cellXY(n)` (posición en pantalla del casillero `n`), útil para manejar la app desde automatización de navegador.

## Reglas del proyecto

- **Todo en un solo archivo, sin compilar.** Todo va dentro de `index.html`: nada de archivos aparte, bundlers, npm ni pasos de build. Lo único externo es three.js y la fuente de Google Fonts.
- **three.js r128 desde cdnjs** (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`). No cambiar de versión ni de CDN. Usar solo APIs de r128: `THREE.Geometry` ya no existe en esa versión, y lo que se agregó después de r128 no está disponible.
- **Versión y cambios, en el encabezado y en pantalla.** Cada cambio sube `APP_VERSION` en el script y agrega una entrada al historial del comentario al principio del archivo (formato `vX.Y  descripción`, seguido de viñetas con `+`), además de actualizar la línea `Versión: vX.Y (fecha)`. La versión se muestra en pantalla a través de los elementos `.ver`; mantener eso funcionando.
- **Modo oscuro.** La app tiene modo claro y oscuro (sigue al sistema y se puede cambiar con un botón). Los colores son tokens CSS en `:root` con overrides por `[data-theme]`, y `applySceneTheme()` recolorea la escena 3D. Todo color o elemento nuevo tiene que verse bien en los dos modos.
- **Textos en español para chicos.** Todo texto visible está en español rioplatense con voseo ("Desarmá", "Probá", "Fijate"), con frases cortas, simples y alentadoras, pensadas para chicos de 6 o 7 años. Los comentarios y los logs también van en español. Para el signo menos visible usar la constante `MINUS` (U+2212).
- El estilo del código es compacto: nombres cortos, varias sentencias por línea, sin frameworks. Respetarlo.

## Arquitectura del script (`index.html`)

El script es una única IIFE en `'use strict'`, dividida en secciones con banners `/* ==== SECCIÓN ==== */`, en este orden: TABLERO, FICHA, ARCOS DE SALTOS, EFECTOS, SONIDO, CÁMARA, CUBO DE VISTA, INTERACCIÓN CON EL TABLERO, los dos modos de práctica, PANEL, MODOS/AJUSTES/BARRA, BUCLE DE ANIMACIÓN, INICIO.

Piezas clave que conectan varias secciones:

- **Estado global `S`:** `mode` (`'libre' | 'saltos' | 'suma' | 'resta'`), `layout` (primer número del tablero: 1 → 1 al 100, 0 → 0 al 99), `jumpStyle` (`'diez' | 'uno'`), `sound`, `stars`, `ficha` (número donde está la ficha), `target` (casillero elegido), `hintCol` (columna que brilla). Los helpers de casilleros (`inRange`, `colOf`, `cellXZ`, `topPos`) dependen de `S.layout`; `cells[i]` se indexa con `n - S.layout`.
- **Guardado:** `store.get/set` envuelve `localStorage` con el prefijo `tabla100.` y try/catch. Solo se guardan preferencias por dispositivo y la cantidad de estrellas.
- **Animación:** no hay librerías aparte de three.js. `tween(dur, update, done, ease)` agrega a `tweens`; los efectos sueltos se agregan a `fx` como objetos `{update(dt)}` (se quitan cuando `update` devuelve false). `loop()` actualiza todo en cada cuadro y después dibuja la escena principal y el cubo de vista (una segunda escena dibujada con viewport recortado).
- **Flujo ficha → casillero:** `setFicha(n)` / `setTarget(n)` → `rebuildArcs()` (saltos calculados por `computeJumps(from, to)`: de 10 y después de 1, o de a 1, según `jumpStyle`) → arcos animados en `updateArcs` → `onArcsDone()` ejecuta el callback `afterArcs`. `refreshEquation()` mantiene sincronizada la cuenta de arriba (por ejemplo `37 + 20 + 2 = 59`).
- **Modos:** `setMode(m)` reinicia el estado y delega. `libre` → tablero libre. `saltos` → objeto `SAL`, rondas de 10 preguntas de ±10/20/30 (`makeSalto`, `saltosClick`). `suma`/`resta` → objeto `ST`, ejercicios de 3 pasos: `makeSuma`/`makeResta` devuelven `{a, b, result, sym, steps[]}`, donde cada paso tiene `tpl` con huecos `[]`, `ans`, `help`, `hint(vals)`, `done(vals)`, y opcionalmente `start` y `pairs`. Las respuestas se cargan con el teclado en pantalla (`keyDigit`, `keyDel`, `moveFocus`, `checkStep`).
- **Invariante pedagógica:** `makeSuma` genera sumas **sin llevarse** (sin "me llevo uno") (dieces y unos suman ≤ 9 cada uno) y `makeResta` genera restas **sin pedir prestado** (`b0 ≤ a0`, `b1 < a1`). Las pistas están escritas suponiendo eso; si se cambian los generadores, hay que revisar las pistas.
- **Panel:** `renderPanel()` reconstruye el `innerHTML` del panel lateral según el estado (`panelLibre` / `panelSaltos` / `panelSteps`) y maneja los clicks por atributos `data-*`. Los mensajes van por el global `FB = {text, type}` (`'ok' | 'bad' | 'tip'`).
- **Skins de la ficha:** `SKINS` asocia nombres con funciones `{crear()}` que devuelven un `THREE.Group`; la activa se monta en `fichaRoot`.
- **Sonido:** sintetizado con Web Audio (`tone`, `noise`, `sfx.*`), sin archivos de audio. `ensureAudio()` tiene que llamarse en un gesto del usuario.
- **Cámara:** coordenadas esféricas en `CAM` (`theta`, `phi`, `radius`, `target`), aplicadas con `applyCam()`. `homeView()` calcula el encuadre según el tamaño de la pantalla y la posición del panel (`updateLayout()`).
