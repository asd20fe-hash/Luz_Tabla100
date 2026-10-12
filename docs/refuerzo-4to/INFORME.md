# Informe — refuerzo de división y multiplicación (4to)

Rama: `refuerzo-4to` (sin push ni merge). Fecha: 2026-10-11. Todas las actividades están en la versión `1.0.0`.

## Qué se hizo y dónde está cada cosa

| Pieza | Dónde |
|---|---|
| Base común (azar con semilla, simulador y generador de división, inyector de errores, clasificadores, eventos y estadísticas, interfaz, cuaderno cuadriculado) | [actividades/_comun-4to/](../../actividades/_comun-4to/) |
| 1. División paso a paso | [actividades/4to-division-paso-a-paso/](../../actividades/4to-division-paso-a-paso/) |
| 2. ¿Cuántas veces entra? | [actividades/4to-cuantas-veces-entra/](../../actividades/4to-cuantas-veces-entra/) |
| 3. Detective de problemas (33 plantillas en 11 categorías) | [actividades/4to-detective-problemas/](../../actividades/4to-detective-problemas/) |
| 4. ¿Tiene sentido? | [actividades/4to-tiene-sentido/](../../actividades/4to-tiene-sentido/) |
| 5. Cálculo con ceros | [actividades/4to-calculo-con-ceros/](../../actividades/4to-calculo-con-ceros/) |
| Panel de estadísticas (Ajustes de padres) | [actividades/_comun-4to/panel-estadisticas.js](../../actividades/_comun-4to/panel-estadisticas.js) + cambios en [index.html](../../index.html) (shell v2.1) |
| Alta en el menú | [actividades/registro.js](../../actividades/registro.js) (las cinco, solo para el perfil `ian`) |
| Pruebas | [tests/refuerzo-4to/](../../tests/refuerzo-4to/) |
| Decisiones | [DECISIONES.md](DECISIONES.md) |

Cada actividad tiene `index.html`, su CSS y JS clásicos (sin módulos, sin CDN salvo la fuente que ya usa el repo). La lógica pura va aparte en archivos UMD (`division-logica.js`, `entra-logica.js`, `problemas.js` + `detective-logica.js`, `sentido-logica.js`, `ceros-logica.js`) y se prueba con node. El changelog de cada actividad está al principio de su JS principal; la versión se ve arriba a la derecha y viaja en cada evento.

Commits de la rama, uno por bloque: base común → división → cuántas veces entra → detective → tiene sentido → cálculo con ceros → estadísticas → decisiones → informe.

## Cómo probar cada actividad

Servir la carpeta (`python -m http.server 8000`) y abrir con el perfil de Ian. Parámetros útiles: `?p=ian` (perfil), `debug=1` (panel con versión, semilla, paso y respuesta esperada, y los últimos eventos), `seed=N` (ejercicios reproducibles), `nivel=N` (solo con `debug=1`).

| Actividad | URL de ejemplo | Qué mirar |
|---|---|---|
| División paso a paso | `actividades/4to-division-paso-a-paso/index.html?p=ian&debug=1&seed=5&nivel=2` | Cuaderno con galera, casita, restas escritas y flechas de bajada; tabla del divisor con 3 filas en blanco; en la 2ª vuelta de 300 : 8 elegir 4 y contestar "sí" al control muestra el resto mayor y vuelve al factor. Nivel 4: `nivel=4` y tocar "Revisar mi cuenta". |
| ¿Cuántas veces entra? | `actividades/4to-cuantas-veces-entra/index.html?p=ian&debug=1&seed=3&nivel=1` | Escalera visible en el nivel 1 con la marca de n; ítems A (cuántas veces y cuánto sobra), B (4 productos vecinos) y C (verdadero o falso). Nivel 4: récord de tiempo al terminar. |
| Detective de problemas | `actividades/4to-detective-problemas/index.html?p=ian&debug=1&seed=42&nivel=3` | Los siete mini-pasos; datos tocables en el texto; plan con listas desplegables; calculadora en los niveles 3 y 4; botón de voz si el navegador tiene voz en español. |
| ¿Tiene sentido? | `actividades/4to-tiene-sentido/index.html?p=ian&debug=1&seed=61&nivel=1` | T2 muestra una cuenta de la carpeta con un error plantado (30 % sin error): "Algo está mal" → tocar la zona → elegir el motivo. |
| Cálculo con ceros | `actividades/4to-calculo-con-ceros/index.html?p=ian&debug=1&seed=71&nivel=1` | M4 en columnas con casillas de reserva; con `nivel=2` aparecen M1, M2 (con guía) y M3 con autocomprobación; con `nivel=4` estimación previa y solo la respuesta. |
| Panel de padres | `index.html?p=ian` → 🔒 → PIN `1234` | Después de jugar un rato: rondas y minutos, % al primer intento, errores frecuentes con ejemplo, hechos errados y lentos; fijar nivel, reiniciar una actividad y exportar JSON. |

Con `?debug=1` queda expuesto `window.__ref4` (estado y respuesta esperada) para automatizar pruebas.

## Qué se verificó

- `node tests/refuerzo-4to/run.js`: **59 pruebas, todas pasan.** Cubren el simulador (los cinco casos del cuaderno), 1000 cuentas por nivel con todas las restricciones, reproducibilidad por semilla, el motor de pasos de la Actividad 1 (los validadores `REGISTRO_COCIENTE` y `RESTO_MAYOR`, el nivel 4 con revisión), los generadores de las Actividades 2 a 5, 200 instancias de cada una de las 33 plantillas de problemas (datos en rango, plan que da el resultado, resto mayor que 0 en C4 a C6), los clasificadores (199×8, 4×39, 120:5, 12.000:3, la suma de tres números), la compactación de eventos y la progresión de niveles.
- Navegador headless (Chrome, 375 px y 1024 px, claro y oscuro): las cinco actividades cargan sin errores de consola, sin scroll horizontal, con la versión visible y `?debug=1` funcionando. Un bot jugó rondas completas con clics reales (teclado en pantalla, cifras del cuaderno, listas desplegables) en todos los niveles de las cinco actividades. El menú de Ian muestra las cinco; el de Luz sigue mostrando solo la Tabla del 100, que carga sin cambios. Sin perfil, las actividades vuelven al menú. El panel de padres se probó con datos reales: fijar nivel, reiniciar (con confirmación) y exportar.
- `grep`: ningún archivo usa `import`/`export` ni `type="module"`; los colores están en variables CSS (con tokens nuevos `--sobre-acento` y `--velo`).

## Supuestos y desvíos respecto del prompt

Los detalles están en [DECISIONES.md](DECISIONES.md). Los principales:

- **Carpetas con prefijo de grado** (`4to-…`), por la convención del repo; claves de almacenamiento `mate.<perfil>.<act>.…` en vez de `ref4:…`.
- **No existe el entrenador de tablas** en este repo, así que no hubo formato de hechos para reutilizar; los hechos (d × q) de las Actividades 1, 2 y 5 se guardan con la clave `item.hecho` y alimentan el ranking del panel.
- **`tipo` y `item.hecho` en los eventos**, además de los campos del prompt.
- **Nivel 4 de la Actividad 1:** agrega el paso "Revisar mi cuenta" para marcar y corregir.
- **Tabla del divisor en niveles 3 y 4:** el ×1 viene escrito.
- **T2 con 30 % de cuentas sanas** en todos los niveles.
- **Récord del nivel 4 de la Actividad 2:** solo cuenta con 80 % o más al primer intento.
- **Shell v2.1** y un campo `nivelMax` en las entradas del registro.

## Pendiente o no probado

- **Firefox y Safari:** solo se probó con Chrome. Con `file://` Firefox aísla el almacenamiento por archivo, así que el panel de padres no vería los datos de las actividades (hay que usar `http://localhost`).
- **Tablet y celular reales:** se probó con la emulación de pantalla a 375 px y 1024 px, no con dedos. Conviene mirar el tamaño de las cifras del cuaderno a 375 px con cuentas de 4 cifras.
- **Voz (Web Speech API):** el botón "Escuchar" depende de las voces del dispositivo; solo se comprobó que aparece cuando hay voz. No se escuchó el audio.
- **Sonido:** no se escuchó; solo se comprobó que no da errores.
- **Contraste:** se revisó a ojo en las capturas de los dos temas, sin medirlo con una herramienta.
- **Progresión de niveles con uso real:** está probada en las pruebas de node y con rondas automáticas, pero no con rondas largas de una persona.
- **Adaptación por hechos lentos o errados:** la lógica y su peso doble están probados en node; el efecto con datos reales de varios días no.
- **No se tocó** `CLAUDE.md` de la raíz (el prompt limitaba los archivos que se podían modificar). Convendría agregarle una sección sobre `_comun-4to/` y el esquema de eventos.

## Sugerencias para la versión 1.1

1. Con una semana de datos reales, ajustar los pesos de los generadores y los umbrales de nivel (80 % y 50 %) mirando el panel.
2. Un "modo rápido" opcional para la Actividad 2 con un temporizador visible para quien lo pida.
3. Mostrar al chico, en el resumen de ronda, el error más frecuente de la ronda en una frase amable.
4. Más plantillas de problemas (hoy 3 por categoría) y problemas con división por dos cifras.
5. Pasar la progresión de nivel a una función compartida con el entrenador de tablas cuando exista, y unificar el formato de hechos.
6. Agregar a `CLAUDE.md` la guía de `_comun-4to/` y el esquema de eventos, y un `CLAUDE.md` por actividad nueva.
7. Probar con el chico y anotar dónde se traba: lo más probable es que haya que ajustar los textos de las pistas.
