# CLAUDE.md

Guía para Claude Code (claude.ai/code) en este repositorio.

## Qué es

"Matemática": app de práctica de matemática para Luz (1ro, 6 años) e Ian (4to, 10 años). Un shell con perfiles y menú abre actividades independientes. Hoy hay una: la Tabla del 100 (`actividades/1ro-tabla100/`, de Luz). El diseño de la estructura está en `PLAN.md`.

- **Ejecutar:** abrir `index.html` en el navegador, o servir la carpeta (`python -m http.server`). Con `file://` Chrome comparte localStorage entre archivos y Firefox lo aísla por archivo; con `http://localhost` todo se comparte. El perfil, el tema y el fondo viajan también por la URL (`?p=luz&t=dark&f=oceano`). Hace falta internet para three.js r128 (cdnjs) y la fuente Fredoka.
- **Depurar:** logs con prefijo `[Mate vX.Y]` (core y shell) y `[Tabla100 vX.Y]` (actividad).

## Estructura

```
index.html              shell: perfiles, menú, ajustes de padres con PIN (v2.2)
perfiles.js             MATE.perfiles = [{id,nombre,grado,avatar,color}]
core/core.css           tokens claro/oscuro, estilos base y fondos
core/core.js            global MATE (único global)
actividades/registro.js MATE.actividades = [{id,titulo,descripcion,icono,perfiles,ruta,version,stats?}]
actividades/<id>/       cada actividad (con su propio CLAUDE.md)
```

Orden de scripts: `core.js`, `perfiles.js`, `registro.js`, y después el de la página. Todos clásicos.

## Reglas

- **Sin compilar:** sin bundlers, npm ni build. Varios archivos, scripts clásicos (sin ES modules ni `fetch` local, porque no funcionan en `file://`), todo colgado de `MATE`.
- **Versiones:** el shell tiene la suya (v2.2) y cada actividad la suya. Cada cambio sube la versión, agrega una entrada al historial del comentario del principio del archivo (`vX.Y  descripción`, viñetas con `+`) y actualiza la línea `Versión:`. Se muestra en pantalla en elementos `.ver`. Si cambia una actividad, actualizar `version` en el registro.
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
