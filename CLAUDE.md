# CLAUDE.md

Guía para Claude Code (claude.ai/code) en este repositorio.

## Qué es

"Matemática": app de práctica de matemática para Luz (1ro, 6 años) e Ian (4to, 10 años). Un shell con perfiles y menú abre actividades independientes. Luz tiene la Tabla del 100 (`actividades/1ro-tabla100/`); Ian, las actividades de refuerzo de 4to y las de fracciones (`actividades/4to-*`). El diseño de la estructura está en `PLAN.md`.

- **Ejecutar:** abrir `index.html` en el navegador, o servir la carpeta (`python -m http.server`). Con `file://` Chrome comparte localStorage entre archivos y Firefox lo aísla por archivo; con `http://localhost` todo se comparte. El perfil, el tema y el fondo viajan también por la URL (`?p=luz&t=dark&f=oceano`). Hace falta internet para three.js r128 (cdnjs) y la fuente Fredoka.
- **Depurar:** logs con prefijo `[Mate vX.Y]` (core y shell) y `[Tabla100 vX.Y]` (actividad).

## Estructura

```
index.html              shell: perfiles, menú, ajustes de padres con PIN (v2.3)
perfiles.js             MATE.perfiles = [{id,nombre,grado,avatar,color}]
core/core.css           tokens claro/oscuro, estilos base y fondos
core/core.js            global MATE (único global)
actividades/registro.js MATE.actividades = [{id,titulo,descripcion,icono,perfiles,ruta,version,stats?}]
actividades/<id>/       cada actividad (con su propio CLAUDE.md)
```

Orden de scripts: `core.js`, `perfiles.js`, `registro.js`, y después el de la página. Todos clásicos.

## Reglas

- **Sin compilar:** sin bundlers, npm ni build. Varios archivos, scripts clásicos (sin ES modules ni `fetch` local, porque no funcionan en `file://`), todo colgado de `MATE`.
- **Versiones:** el shell tiene la suya (v2.3) y cada actividad la suya. Cada cambio sube la versión, agrega una entrada al historial del comentario del principio del archivo (`vX.Y  descripción`, viñetas con `+`) y actualiza la línea `Versión:`. Se muestra en pantalla en elementos `.ver`. Si cambia una actividad, actualizar `version` en el registro.
- **Modo claro/oscuro:** tokens CSS en `:root` con overrides por `[data-theme]` (media query y atributo). Todo color o elemento nuevo tiene que verse bien en los dos modos.
- **Textos en español rioplatense con voseo** ("Elegí", "Probá"); comentarios y logs también en español. Cada actividad decide su tono y tipografía: la de Luz usa frases cortas y MAYÚSCULAS de imprenta; eso no es regla del shell.
- Estilo compacto: nombres cortos, varias sentencias por línea, sin frameworks.

## API de MATE (core.js)

- `MATE.tema.get/set/oscuro/alternar()`: guarda `mate.global.theme` y aplica `data-theme`.
- `MATE.fondo.get/set(id)`, `MATE.fondo.lista` (`{id,nombre,muestra}`) y `MATE.fondo.menu(boton)` (menú flotante para elegir): fondo **global** (Aurora, Océano, Bosque, Atardecer, Espacio) en `mate.global.fondo`, viaja por `?f=`. Se aplica como `data-bg` en `<html>` ("aurora" sin atributo) y core.js agrega solo la capa `#mate-fondo` (z-index −1) al `<body>`; los tokens `--bg`, `--blob1..5`, `--blob-op`, `--star` están en `core.css`, en claro y oscuro. Una página que quiera el fondo tiene que dejar ver `--bg` (sin fondo opaco en contenedores de pantalla completa).
- `MATE.store(idActividad)` → `{get,set}` en `mate.<perfil>.<actividad>.<clave>` (sin perfil no guarda). `MATE.global.get/set` → `mate.global.<clave>`.
- `MATE.perfil()` (activo o null), `MATE.setPerfil(id)`, `MATE.perfiles`, `MATE.actividades`.
- `MATE.irMenu()` y `MATE.abrir(id)`: navegan conservando `?p=&t=&f=`. `MATE.raiz`: URL de la raíz del proyecto.
- `MATE.log(tag, ...)`, `MATE.ver(el)`.
- `MATE.pin.check/set`: en `mate.global.pin`, por defecto 1234 (hash simple; es un candado para chicos, no seguridad).

## Contrato de una actividad

- Incluye `core.css`, `core.js`, `perfiles.js` y `registro.js` con rutas relativas.
- Lee el perfil con MATE; sin perfil, vuelve al menú.
- Guarda solo con `MATE.store(idActividad)`; lo global, en `mate.global.<clave>`.
- Botón "Volver al menú", respeta el tema y el fondo globales (botón 🎨 con `MATE.fondo.menu`) y muestra su versión.
- Opcional: `stats()` en su entrada del registro, que devuelve un texto para Ajustes de padres.

## Cómo agregar una actividad

1. Crear `actividades/<grado>-<nombre>/index.html` (y un `CLAUDE.md` con su arquitectura) siguiendo el contrato.
2. Agregar su entrada a `actividades/registro.js` (`perfiles` = ids que la ven; `ruta` relativa a la raíz).
3. Probar con `file://` y con `http.server`, en claro y oscuro, y revisar que la consola quede limpia.

## Actividades de 4to: convenciones

- **Código común** en `actividades/_comun-4to/` (scripts clásicos con patrón UMD: `window.REF4_*` en el navegador, `require` en node). Base: `azar.js` (`REF4_AZAR`, semilla), `eventos.js` (`REF4_EV`), `ui-comun.js` (`REF4_UI`: arranque, teclado, globo, inactividad, resumen), `panel-estadisticas.js` (`REF4_PANEL`). División: `division-lib.js`, `cuaderno.js`. Fracciones: `fracciones-lib.js` (`REF4_FR`), `fracciones-figuras.js` (`REF4_FIG`), `fracciones-gen.js` + `fracciones-gen-2.js` (`REF4_FRGEN`), `fracciones-modulo.js` (`REF4_FRMOD`, Anexo A), `fracciones-ui.js` (`REF4_FRUI`), `fracciones.css`, `panel-fracciones.js` (`REF4_PANEL_FR`). Solo se agregan archivos o funciones retrocompatibles.
- **Carpetas e ids:** `actividades/4to-<nombre>/` (id = carpeta). Con el prefijo `4to-` el panel de padres las muestra solas. Lógica pura en `*-logica.js` o en los generadores comunes; la interfaz en `<nombre>.js`, con el changelog al principio y `VERSION = 'X.Y.Z'`.
- **Eventos** (`REF4_EV.crearRegistro`, guardados en `mate.<perfil>.<act>.eventos|agregados|estado`, hasta 3000 con compactación): `{v, act, perfil, ts, sesion, ronda, nivel, tipo, …}`. `tipo` es la clase de evento: `paso`, `ronda_inicio`, `ronda_fin`, `inactividad`, `nivel_cambio`. Los de `paso` llevan `paso, intento, item, esperado, respuesta, ok, error, ms, ayuda`; los de fracciones suman `tema`, `tipoItem` (R1, P3…), `forma` y `modulo`. Lo que no cuenta para las estrellas (audio, "¿Qué aprendiste?") va con `intento: 0`.
- **Códigos de error:** en MAYÚSCULAS (`RESTO_MAYOR`, `INVERTIDA`, `OPERA_DENOMINADORES`…). Nombres para el panel en `REF4_PANEL.ERRORES` y `REF4_FR.ERRORES`; los clasificadores devuelven el más específico (orden en `docs/*/DECISIONES.md`).
- **Niveles y adaptación:** sube con 2 rondas seguidas ≥ 80 % al primer intento y baja con 2 < 50 % (`REF4_EV.ajustarNivel`); `nivelMax` va en la entrada de `registro.js` y el nivel se fija a mano desde Ajustes de padres. Los generadores dan peso doble a lo que falló o fue lento en los últimos 14 días.
- **Pistas:** voseo, 2 renglones como máximo, nunca retan; en el globo `#globo` (`aria-live`). En fracciones se escriben "3/4" y `REF4_FRUI.conFracciones` las apila (el chico nunca ve una barra); `REF4_FR.paraVoz` las pasa a palabras para el 🔊.
- **Debug:** `?debug=1` muestra el panel (versión, semilla, nivel, ítem, esperado, últimos eventos) y expone `window.__fr` / `window.__ref4`; `?seed=N` repite los ejercicios; con debug, `?nivel=N` y `?tipo=X` fuerzan nivel y tipo. Logs con el prefijo `[<act> vX.Y.Z]`.
- **Pruebas:** `node tests/refuerzo-4to/run.js` y `node tests/fracciones-4to/run.js` (solo `assert`, sin dependencias). Cada generador se prueba con 1000 ítems por nivel y tipo y con semilla fija.
- **Sumar un tema nuevo:**
  1. Lógica pura (generador con `tipos(nivel)`, `ronda(nivel)`, `generar(nivel, tipo, az, ses)`, validadores y pistas) en `_comun-4to/` o en la carpeta de la actividad, con sus pruebas.
  2. `index.html` copiado de una actividad de fracciones (mismos scripts y encabezado) y `<nombre>.js` con `REF4_FRUI.actividad({act, titulo, version, nivelMax, tamRonda, tipos, generar, pintar, meperdi, textoPaso, esperado, aprendiste})`: el marco hace la ronda, el registro, el resumen, el debug y la inactividad.
  3. Colores solo con variables (claro y oscuro), botones de 48 px o más, todo tocando; probar a 375 px y 1024 px en los dos temas.
  4. Alta en `actividades/registro.js` (con `nivelMax` y `perfiles:['ian']`) recién cuando funciona y pasa sus pruebas.
