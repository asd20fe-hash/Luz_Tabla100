# Decisiones — fracciones de 4to

Registro de decisiones tomadas sin consultar, siguiendo la regla "manda el repo". Cada una dice qué se decidió, por qué y qué alternativa se descartó.

## 0. Rama de partida

La rama `refuerzo-4to` ya no existe: se mergeó en `main` (commit `9067a30`) y se borró. Por eso `fracciones-4to` parte de `main` (`856abb3`), que ya tiene toda la base común de 4to. El árbol tenía un solo archivo sin seguir (este masterprompt), que quedó en el commit `wip: estado previo`.

## 1. API real del repo (reconocimiento)

| Tema | API real |
|---|---|
| Alta de una actividad | Entrada en `MATE.actividades` (`actividades/registro.js`): `{id, nivelMax, titulo, descripcion, icono, perfiles:['ian'], ruta, version}`. El menú del shell filtra por `perfiles` y respeta el orden del arreglo: las siete de fracciones van juntas, al final. |
| Store por perfil | `MATE.store(act)` → `{get, set}` en `mate.<perfil>.<act>.<clave>`. Las actividades de 4to usan un almacén con el mismo esquema que avisa si `localStorage` está lleno (`REF4_UI.base`). |
| Tema y versión | `MATE.tema` (atributo `data-theme`; tokens en `:root` con media query y `[data-theme]`). Cada actividad muestra su versión en `#ver` (`REF4_UI.base`). |
| PIN y configuración | `MATE.pin.check/set`; "Ajustes de padres" está en `index.html` (`verPin`/`verAjustes`) y dibuja `REF4_PANEL.render` para todas las actividades cuyo id empieza con `4to-`. |
| Navegación | `MATE.irMenu()`, `MATE.abrir(id)` (conservan `?p=&t=&f=`). |
| Piezas comunes que ya existían (`_comun-4to/`) | `REF4_UI.teclado` (teclado numérico), `REF4_UI.globo` (pistas, `aria-live`), `REF4_UI.vigilar` (inactividad 15 s / 45 s), `REF4_UI.resumen` (estrellas, "Otra ronda"/"Salir"), `REF4_UI.contador`, `REF4_UI.celebrar`, `REF4_UI.sonar` (preferencia global `mate.global.sonido`), `REF4_UI.debugSet`; `REF4_EV` (eventos, agregados, 3000 eventos con compactación, `ajustarNivel`: sube con 2 rondas ≥ 80 %, baja con 2 < 50 %); `REF4_AZAR` (PRNG mulberry32 con semilla, `?seed=N`); `REF4_PANEL` (panel de estadísticas); `REF4_CUADERNO` + `REF4_DIV` (la cuenta de dividir dibujada como en la carpeta). El botón "Me perdí" no era una pieza común: cada actividad lo arma. |

## 2. Decisiones de adaptación

**Nombres de carpeta e ids.** La convención del repo es `actividades/<grado>-<nombre>`. Se usan `4to-fracciones-repartos`, `4to-fracciones-partes`, `4to-fracciones-muro`, `4to-fracciones-comparar`, `4to-fracciones-cuanto-falta`, `4to-fracciones-potes-vasos` y `4to-fracciones-repaso` (carpeta = id). Con el prefijo `4to-` el panel de padres existente las muestra sin tocarlo. Alternativa descartada: los nombres sin prefijo del documento (rompen la convención y quedarían fuera del panel).

**Claves de almacenamiento.** El documento pide `ref4:<act>:eventos|estado|agregados` y `ref4:fracciones:config`. Como en el refuerzo de 4to, el store real ya antepone perfil y actividad: se guardan como `mate.<perfil>.<act>.eventos|estado|agregados`, y la configuración en `mate.<perfil>.4to-fracciones.config` (`{incluirModulo:false}` por defecto). Alternativa descartada: claves `ref4:` a mano (esquivaría el store por perfil).

**Campo `tipo` del evento.** En los eventos existentes `tipo` ya es la clase de evento (`paso`, `ronda_inicio`, `ronda_fin`, `inactividad`, `nivel_cambio`) y `plegar` depende de eso. El tipo de ítem del documento (`R1`, `P3`…) va en `tipoItem` y además en `item.tipo`. Se agregan `tema`, `forma` y `modulo` como pide el documento. Alternativa descartada: pisar `tipo` (rompería las estadísticas existentes).

**Versión en eventos y logs.** `REF4_EV.crearRegistro` ya pone `v` en cada evento y `REF4_UI.base` el prefijo `[<act> vX.Y.Z]` en los logs.

**Archivos comunes nuevos.** Además de los cinco del documento se agregaron `fracciones-gen-2.js` (segunda mitad de los generadores: comparar, cuánto falta, potes y repaso; el archivo único superaba las 700 líneas) y `fracciones.css` (estilos comunes de fracciones con las variables `--fr-*`). Todos los archivos comunes nuevos tienen versión `1.0.0` en su comentario de cabecera (y `VERSION` en el código).

**Marco común de actividad (`REF4_FRUI.actividad`).** Las siete actividades comparten la mecánica de ronda: mezcla de tipos con pesos sin repetir un tipo más de 2 veces seguidas, ítem del módulo (15 %, máximo uno por ronda, solo con el interruptor), "Me perdí", 🔊, "¿Qué aprendiste?", resumen, nivel, debug (`?debug=1`, `?nivel=N`, `?tipo=X`) y registro de eventos. Se implementó una sola vez en `fracciones-ui.js`; cada actividad aporta `generar` y `pintar`. Alternativa descartada: copiar el ciclo de ronda en cada actividad, como en el refuerzo (siete copias).

**Unidad de la figura.** El documento dice "la partición más fina en partes iguales en la que cada región ocupa una cantidad entera de partes"; tomada al pie de la letra no tiene mínimo (siempre se puede partir más). Se usa la más gruesa que cumple la condición: el MCD de las áreas de las regiones. "Ver cuadrícula" dibuja las líneas de esa partición (o la cuadrícula de cuadraditos cuando ayuda más, como en la figura de igual área y distinta forma).

**Áreas exactas.** Los polígonos tienen coordenadas enteras y el área sale de la fórmula del zapato como fracción. En los círculos el área de cada sector es ángulo/360. Las coordenadas de los arcos solo se usan para dibujar.

**Orden de los clasificadores** (`REF4_FR.clasificar`, gana el más específico):
- `reparto`: `INVERTIDA` > `RESTO_IGNORADO` > `RESTO_MAL_PARTIDO` > `MIXTO` > `OTRO`.
- `parte`: `CUENTA_PARTES` (solo si los pedazos visibles no son las partes iguales) > `PARTE_PARTE` > `INVERTIDA` > `OTRO`.
- `equivalente`: `INVERTIDA` > `EQUIV_SUMA` > `EQUIV_MAL_ESCALADA` > `OTRO`.
- `comparar`: `IGUALDAD_NO_DETECTADA` > `MAS_DE_UN_ENTERO` (una pasa el entero y la otra no) > `DENOM_MAYOR_ES_MAYOR` (denominadores distintos y respondió "más partes es más") > `COMPARACION`.
- `suma`/`resta`: `OPERA_DENOMINADORES` > `DENOMINADOR_DISTINTO` > `CALCULO`.
- `problema`: `RESPONDE_EL_DATO` (vale también simplificado) > `PLAN_INCOMPLETO` > `PLAN_OPERACION` > `ENTERO_EQUIVOCADO` > `OPERA_DENOMINADORES`/`DENOMINADOR_DISTINTO` (si el problema tiene una cuenta) > `CALCULO`.
- `potes`: `SE_PASA` > `NO_LLEGA` > `RESTRICCION`.
- P3 (marcar las que son exactamente 1/4): `PARTES_DESIGUALES` > `CUENTA_PARTES` > `OTRO`.
- E3 (rodear equivalentes): el código de la primera ficha trampa marcada; si no marcó ninguna trampa pero le faltó una equivalente, `IGUALDAD_NO_DETECTADA`.

**"¿Qué aprendiste?"** Se registra con `paso: 'aprendiste'`, `tema: 'estrategia'` e `intento: 0` (como el audio en el Detective) para que no cuente en el porcentaje de la ronda ni en el de los paneles existentes; `primero: true` marca el primer intento, que es lo que usa el Mapa de fracciones.

**Adaptación.** Los pesos por tipo se calculan con los eventos de los últimos 14 días: peso 2 para los tipos con algún error o con un paso de más de 30 s. Los errores más frecuentes (`ses.pesosErr`) inclinan algunos generadores hacia sus trampas (por ejemplo, más "cuartos escondidos" en P1 si hay `CUENTA_PARTES`, más E4 "uno solo" si hay `JUSTIFICACION`, más pares de igual numerador en C1 si hay `DENOM_MAYOR_ES_MAYOR`).

## 3. Decisiones tomadas durante la implementación

(Se completa en cada actividad.)
