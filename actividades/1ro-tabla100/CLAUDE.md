# CLAUDE.md — Saltos en la Tabla del 100

Actividad de Luz (1ro): práctica de matemática alrededor de una tabla del 100 en 3D. Es un único `index.html` (HTML + CSS + un script inline). Las reglas generales del proyecto están en `../../CLAUDE.md`.

- **Depurar:** todo se registra en la consola con el prefijo `[Tabla100 vX.Y]`. `window.__tabla100` expone `state` (el objeto `S`) y `cellXY(n)` (posición en pantalla del casillero `n`).
- **Three.js r128 desde cdnjs.** No cambiar de versión ni de CDN; `THREE.Geometry` no existe y lo posterior a r128 no está disponible. Si no carga, se muestra `#fallback`.
- **Versión:** `APP_VERSION` en el script + historial al principio del archivo (`vX.Y`, viñetas con `+`) + línea `Versión:`. Se muestra en los `.ver`. Actualizar también `version` en `actividades/registro.js`.
- **Modo oscuro:** tokens CSS en `:root` con overrides por `[data-theme]`; `applySceneTheme()` recolorea la escena 3D. El tema es global (`MATE.tema`).
- **Textos:** español rioplatense con voseo, frases cortas para chicos de 6 o 7 años; se muestran en MAYÚSCULAS de imprenta (CSS `text-transform`). Signo menos visible: constante `MINUS` (U+2212). Comentarios y logs en español.
- Estilo compacto: nombres cortos, varias sentencias por línea, sin frameworks.

## Integración con MATE

- `store` es `MATE.store('tabla100')` (guarda en `mate.<perfil>.tabla100.*`). Sin perfil activo, la actividad vuelve al menú (`MATE.irMenu()`).
- `migrar()` copia una sola vez las claves viejas `tabla100.*` al perfil Luz y marca `mate.global.migrado.tabla100`. No borra las claves viejas.
- El botón 🏠 (`#menuBtn`) vuelve al menú. El botón de tema usa `MATE.tema.alternar()`.

## Arquitectura del script

IIFE en `'use strict'`, con secciones `/* ==== SECCIÓN ==== */` en este orden: TABLERO, FICHA, ARCOS DE SALTOS, EFECTOS, SONIDO, CÁMARA, CUBO DE VISTA, INTERACCIÓN CON EL TABLERO, los dos modos de práctica, PANEL, MODOS/AJUSTES/BARRA, BUCLE DE ANIMACIÓN, INICIO.

- **Estado global `S`:** `mode` (`'libre' | 'saltos' | 'suma' | 'resta'`), `layout` (1 → 1 al 100, 0 → 0 al 99), `jumpStyle` (`'diez' | 'uno'`), `sound`, `stars`, `skin`, `ficha`, `target`, `hintCol`. Los helpers de casilleros (`inRange`, `colOf`, `cellXZ`, `topPos`) dependen de `S.layout`; `cells[i]` se indexa con `n - S.layout`.
- **Animación:** solo three.js. `tween(dur, update, done, ease)` agrega a `tweens`; los efectos sueltos van a `fx` como `{update(dt)}` (se quitan cuando devuelve false). `loop()` actualiza todo y dibuja la escena principal y el cubo de vista (segunda escena con viewport recortado).
- **Flujo ficha → casillero:** `setFicha(n)` / `setTarget(n)` → `rebuildArcs()` (`computeJumps(from, to)`: de 10 y después de 1, o de a 1, según `jumpStyle`) → `updateArcs` → `onArcsDone()` ejecuta `afterArcs`. `refreshEquation()` mantiene la cuenta de arriba (p. ej. `37 + 20 + 2 = 59`).
- **Modos:** `setMode(m)` reinicia el estado y delega. `libre` → tablero libre. `saltos` → objeto `SAL`, rondas de 10 preguntas de ±10/20/30 (`makeSalto`, `saltosClick`). `suma`/`resta` → objeto `ST`, ejercicios de 3 pasos: `makeSuma`/`makeResta` devuelven `{a, b, result, sym, steps[]}`; cada paso tiene `tpl` con huecos `[]`, `ans`, `help`, `hint(vals)`, `done(vals)`, y opcionalmente `start` y `pairs`. Respuestas con el teclado en pantalla (`keyDigit`, `keyDel`, `moveFocus`, `checkStep`).
- **Invariante pedagógica:** `makeSuma` genera sumas **sin llevarse** (dieces y unos suman ≤ 9 cada uno) y `makeResta` restas **sin pedir prestado** (`b0 ≤ a0`, `b1 < a1`). Las pistas suponen eso; si se cambian los generadores, revisar las pistas.
- **Panel:** `renderPanel()` reconstruye el `innerHTML` según el estado (`panelLibre` / `panelSaltos` / `panelSteps`) y maneja clicks por `data-*`. Mensajes por el global `FB = {text, type}` (`'ok' | 'bad' | 'tip'`). En Suma/Resta la cuenta arranca maximizada (`panelMax`, clase `.max` en el panel y `cuenta-max` en el body, que oculta tablero, cuenta de arriba, herramientas y cubo); "Ver la tabla" la achica. Cada `startSteps` vuelve a maximizar; `relayout()` reencuadra al cambiar.
- **Skins de la ficha:** `SKINS` asocia nombres con `{crear()}` que devuelven un `THREE.Group`; la activa se monta en `fichaRoot` con `setSkin(k)`. Helpers: `skinMat`, `pedestal`, `part`.
- **Fondos:** son globales (`MATE.fondo`, ver `../../CLAUDE.md`); el CSS y la capa `#mate-fondo` están en `core/`. Los botones del ajuste "Fondo" se generan desde `MATE.fondo.lista`; `applySetting('bg', v)` llama a `MATE.fondo.set(v)`. La clave vieja `store.bg` solo se usa una vez para adoptar el fondo de Luz como global si no había uno.
- **Ajustes:** cada `.seg[data-set=k]` del popup pasa por `applySetting(k, v)` y `currentSetting(k)`; un ajuste nuevo va en las dos.
- **Sonido:** Web Audio sintetizado (`tone`, `noise`, `sfx.*`). `ensureAudio()` se llama en un gesto del usuario.
- **Cámara:** coordenadas esféricas en `CAM` (`theta`, `phi`, `radius`, `target`), aplicadas con `applyCam()`. `homeView()` calcula el encuadre según pantalla y panel (`updateLayout()`).
