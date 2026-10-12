# Plan: de Luz_Tabla100 a Matematica

App de práctica de matemática para Luz (1ro, 6 años) y Ian (4to, 10 años). La Tabla del 100 pasa a ser la primera actividad de un menú. No se agregan actividades nuevas: solo la estructura modular.

## Árbol final

```
Matematica/
├─ index.html                        shell: perfiles + menú + ajustes de padres (v2.0)
├─ perfiles.js                       MATE.perfiles = [{id,nombre,grado,avatar,color}]
├─ core/
│  ├─ core.css                       tokens claro/oscuro (:root + [data-theme]) y estilos base
│  └─ core.js                        global MATE (único global)
├─ actividades/
│  ├─ registro.js                    MATE.actividades = [{id,titulo,descripcion,icono,perfiles,ruta,version}]
│  └─ 1ro-tabla100/
│     ├─ index.html                  la app actual, movida con git mv
│     └─ CLAUDE.md                   arquitectura de la actividad
└─ CLAUDE.md                         general: qué es, cómo correr, reglas, estructura, contrato, guardado, cómo agregar una actividad
```

Orden de scripts: core.js, perfiles.js, registro.js. Todos clásicos (sin ES modules, sin fetch local).

## Perfiles
- Luz: 🦄, 1ro. Ian: 🦊, 4to. Un color por perfil.

## API de MATE (core.js)
- Tema: `MATE.tema.get/set/alternar()`, guarda `mate.global.theme`, aplica `data-theme` en `<html>`.
- Guardado: `MATE.store(idActividad)` → `{get,set}` con `mate.<perfil>.<actividad>.<clave>`; `MATE.global` → `mate.global.<clave>`.
- Perfil: `MATE.perfil()` (activo o null). Navegación: `MATE.irMenu()`, `MATE.abrir(actividad)`.
- Versión y log: `MATE.log(tag, ...)`, `MATE.ver(el)`.
- PIN: `MATE.pin.check/set`, en `mate.global.pin`, por defecto 1234 (hash simple, es un candado para chicos).
- Estadísticas: función opcional por actividad en el registro.

## Guardado entre file:// y http://
Chrome comparte localStorage entre archivos file://; Firefox lo aísla por archivo. Por eso:
- Perfil activo y tema viajan también por URL (`?p=luz&t=dark`); core.js lee primero la URL y después localStorage.
- Los datos de cada actividad (estrellas, etc.) se leen y escriben siempre desde la página de la actividad.
- En Firefox con file:// el shell puede no ver datos de las actividades (Estadísticas) ni recordar PIN/último perfil. Con http://localhost todo se comparte.

## Migración de la Tabla del 100 (sin refactorizar su interior)
- `store` delega en `MATE.store('tabla100')` con la misma interfaz.
- El tema usa `MATE.tema`; botón "Volver al menú"; sin perfil → vuelve al menú.
- `migrar()`: copia `tabla100.*` a `mate.luz.tabla100.*` una sola vez (marca `mate.global.migrado.tabla100`), sin borrar las claves viejas, con log. Solo corre si el perfil activo es Luz. `tabla100.theme` → `mate.global.theme`.
- Versión de la actividad: v1.4.

## Reglas del CLAUDE.md que cambian
- "Un solo archivo" → "Sin compilar" (varios archivos, scripts clásicos colgados de MATE).
- Versión: shell v2.0 y cada actividad con la suya.
- Se agregan: contrato de actividad, esquema de guardado, "cómo agregar una actividad".
- La arquitectura del script pasa a `actividades/1ro-tabla100/CLAUDE.md`.
- Textos para chicos de 6-7 años y mayúsculas de imprenta: regla de la actividad de Luz, no del shell. Cada actividad decide su tipografía.

## Contrato de una actividad
- Incluye core.css y core.js con rutas relativas.
- Lee el perfil con MATE; sin perfil, vuelve al menú.
- Guarda solo con `MATE.store(idActividad)`; globales en `mate.global.<clave>`.
- Botón "Volver al menú", respeta el tema global, muestra su versión.
- Opcional: expone estadísticas.

## Fases (un commit por fase; push al final, con OK)
1. Mover: git mv del index.html y placeholder.
2. Core: core.css, core.js, perfiles.js, registro.js.
3. Shell: perfiles, menú, ajustes de padres con PIN, Estadísticas vacía.
4. Migración de la Tabla del 100.
5. Docs: CLAUDE.md raíz y de la actividad.
6. Pruebas: file:// y http.server, claro/oscuro, consola limpia, estrellas de Luz tras migrar.
