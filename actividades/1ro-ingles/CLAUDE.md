# English (1ro) — v1.0.1

Inglés oral con dibujos para Luz: escucha una palabra en inglés y toca el dibujo. Es la actividad simple, en 2D; la versión con mascota 3D es `1ro-ingles-mascota` (que tiene su propio vocabulario en `_comun-ingles/`: los dos no comparten listas).

## Archivos
- `index.html`: la página (mismos scripts que Escritura y Lectura: `_comun-4to/` y `_comun-1ro/`).
- `ingles-logica.js` (`INGLES1`, parte pura, se prueba en node): vocabulario `[en, es, dibujo o #color, tema, nivel]` (animales, colores, números, comida, cuerpo, cosas), `opciones()`, `armarRonda()` (8 ítems con `REPASO1`), `errorEleccion()` y `ERRORES`.
- `ingles.js`: la interfaz (voz en inglés propia: elige en-US, después en-GB, y prefiere voces "natural/google/samantha"), registro y resumen.

## Tipos de ítem por nivel
- **Nivel 1:** `escucha` (oye y toca entre 3 dibujos).
- **Nivel 2:** 4 dibujos y `sino` ("Is it a …?", sí o no). Desde acá aparecen las trampas de oído (THREE/TREE, BEAR/PEAR).
- **Nivel 3:** además `lee` (toca la palabra escrita) y `escribe` (solo palabras de hasta 5 letras, sin espacios ni números).
- Sube y baja como las demás de 1ro (`cerrarRonda`, nivelMax 3).

## Registro y errores
`tipo:'paso'` con `item`, `esperado`, `respuesta`, `forma` y `ayuda`. Errores de elección: `CONFUNDE_TEMA`, `CONFUNDE_PARECIDA`, `CONFUNDE_OTRA`; `SI_NO_MAL` y `LEE_MAL`. Al escribir usa `LENGUA1.clasificar(w, buf, {idioma:'en'})` (sin reglas del castellano) y manda `errores` con todos los códigos. Guarda el repaso en `mate.<perfil>.1ro-ingles.repaso`.

## Pruebas
`node tests/lectoescritura-1ro/run.js` (`test-ingles.js`: vocabulario, rondas por nivel con semilla y errores).

En Windows el ícono 🇺🇸 del menú se ve como "US" (Windows no dibuja banderas); en Android y iPad se ve bien.
