# Mi mascota en inglés (1ro) — v1.1.0

Luz cuida a una mascota virtual en una casa 3D y aprende inglés con Miss Hoot, la profe búho: la profe da órdenes ("Paint Mimi blue!", "Give Mimi an apple!", "Touch Mimi's nose!") y Luz las cumple con la mascota. Con las ⭐ que gana va al supermercado: la mascota pide ("I want two bananas!"), Luz lo busca en la góndola, paga en la caja contando monedas en inglés y después le da de comer lo comprado (despensa).

## Archivos
- `index.html`: canvas `#escena` a pantalla completa (fondo transparente: se ve el fondo global) y la capa `.ing-hud` encima (cabecera, `#estado`, `#banner`, `#chip`, `#aviso`, `#abajo`) más `#velo` para las pantallas (inicio, nombre, resumen). Carga three.js r128 de cdnjs y todo `_comun-ingles/`.
- `juego.js`: la actividad. Pantallas: `inicio` (hace falta un toque para la voz) → `huevo` → `color` → `nombre` → `casa` → `leccion`/`libre` → `resumen`; desde la casa también `super` (fases `responde` → `contando` → `pagar` → `fin`) y `despensa`.

## Código común (`actividades/_comun-ingles/`, scripts clásicos UMD)
| Archivo | Global | Qué hace |
|---|---|---|
| `vocab.js` + `temas/*.js` | `ING_VOCAB` | Temas que se registran solos (`[en, es, emoji o #color, nivel, extra]`); `opciones`, `errorEleccion`, `parecida`, artículo `art` para las frases |
| `juegos.js` + `juegos/*.js` | `ING_JUEGOS` | Minijuegos: `{id, tema, nombre, icono, accion, orden(w,nombre), opciones(w,nivel,az), jugar(J,paso,fin)}` |
| `lecciones.js` | `ING_LECC` | `armar()` la lección del día (hola, presenta + juego por palabra nueva, repaso sin repetir seguidas, chau) y `rondaJuego()` |
| `mascota-estado.js` | `ING_PET` | Necesidades con piso (nunca se enferma), monedas, etapas de crecimiento |
| `voz-en.js` | `ING_VOZ` | Voz en inglés (profe normal, mascota aguda), `secuencia`, `hablando()`, efectos WebAudio, `balbuceo`, `vibrar` |
| `mundo3d.js` | `ING_MUNDO` | Renderer, habitación, toon + contorno, tweens, partículas, aura, toques/arrastre (raycast), cámara que se acomoda |
| `mascota3d.js` | `ING_MASCOTA3D` | La mascota con partes con nombre (head, eyes, ears, nose, mouth, hands, feet, tummy) y animaciones |
| `profe3d.js` | `ING_PROFE3D` | Miss Hoot en su banquito |
| `objetos3d.js` | `ING_OBJ3D` | Emoji como ficha 3D, balde, mancha, huevo, manito |
| `tienda.js` | `ING_TIENDA` | Súper (parte pura): `lista()` de compras que siempre alcanza con las monedas (total ≤ 10), `estante()`, precios 1–3 ⭐ por nivel de la palabra, `pedido(w,n)` ("two bananas"), despensa en `pet.despensa` |
| `escena-super.js` | `ING_SUPER3D` | El supermercado 3D: góndola, carrito, caja registradora; `mostrar(on)` esconde la habitación (`M.cuarto`); lugares distintos en vertical |
| `ingles.css` | | Capa de interfaz (tokens claro/oscuro) |

- **Sumar un tema:** un archivo en `temas/` y un juego en `juegos/` que lo use, y agregar los dos `<script>` en `index.html` (y en `tests/ingles/comun.js`). La lección y la casa los toman solos (botón por juego).
- **Juegos:** `pintar` (colores), `comer` (comida; también lo usa la despensa con la orden de la mascota) y `tocar` (cuerpo: toca la parte en el modelo; la mascota se acerca a la cámara mientras dura).
- **Entorno `J` de los juegos** (`entorno()` en juego.js): `M, O, pip, hoot, az, nivel, nombre, debug, posiciones(n), responder(w) → {ok, mostrar, ignorar}, opciones(lista), aviso(icono, texto), pintado(color), alimentar(n), tocarPip(fn(parte)), acercarPip(on)`. El juego anima; la actividad registra, premia y habla. Al segundo error `mostrar` pide resaltar la correcta; tocarla no se registra.
- Si se sale a la casa en medio de un paso, `S.token` cambia y lo que llegue tarde no hace nada.

## Súper y despensa
- La lista sale de `ING_TIENDA.lista` (nivel 1: 2 cosas de a una; nivel 2: 3 cosas hasta 2 de cada una; nivel 3: hasta 3), con repaso (`REPASO1`). Lo incontable ("some milk") va de a uno. Abajo se ve la lista con ❔ hasta que se compra cada cosa.
- Cada cosa pedida es un paso registrado (`paso:'super'`, `cantidad`); al acertar no se ganan monedas (se gastan). Si son varias, se tocan de nuevo y la profe cuenta. En la caja se tocan las monedas de a una ("One! Two!…"), sin registro; lo comprado y el pago se guardan recién al terminar de pagar.
- Despensa: si hay 2 o más comidas distintas, la mascota pide una (paso `comer`, `modo:'despensa'`); con una sola no se registra. Come hasta 3 o hasta llenarse; no da monedas.

## Registro
`ctx.reg.evento({tipo:'paso', tema, paso:<juego>, intento, item:{palabra,img,tema,es}, esperado, respuesta, ok, error, forma, ms, ayuda, modo})` (lo reenvía a la nube). Errores: `CONFUNDE_TEMA`, `CONFUNDE_PARECIDA`, `CONFUNDE_OTRA`. Ronda = lección o juego libre; niveles con `cerrarRonda` (nivelMax 3: más palabras y 4 opciones desde el nivel 2). Guarda `pet` y `repaso` en `mate.<perfil>.1ro-ingles-mascota.*`.

## Depurar
`?debug=1`: FPS, modo y palabra abajo a la derecha, y `window.__pip` (`inicio()`, `elegir(en)`, `correcta()`, `incorrecta()`, `super()`, `despensa()`, `pagar()`, `tocar(parte)`, `S`, `M`, `pip`, `pet`, `rep`). `?seed=N`, `?nivel=N`. Logs `[1ro-ingles-mascota v1.1.0]`.
En Chrome headless (SwiftShader) aparecen "Context Lost/Restored" al arrancar; pasa también en la Tabla del 100 y no es un error de la actividad.

## Pruebas
`node tests/ingles/run.js` (vocabulario, partes del cuerpo contra el modelo, mascota, 1000 lecciones por nivel con semilla, 1000 listas del súper por nivel, despensa).
