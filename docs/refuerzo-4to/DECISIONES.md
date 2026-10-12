# Decisiones — refuerzo de 4to

Registro de decisiones tomadas sin consultar, siguiendo la regla "manda el repo". Cada una dice qué se decidió, por qué y qué alternativa se descartó.

## 1. API real del repo (reconocimiento)

El prompt usa nombres ilustrativos. La API real, leída en `core/core.js`, `actividades/registro.js` y `index.html`:

| Tema | API real |
|---|---|
| Registrar una actividad | Entrada en `MATE.actividades` (`actividades/registro.js`): `{id, titulo, descripcion, icono, perfiles:[ids], ruta, version, stats?}`. `ruta` es relativa a la raíz. El menú del shell filtra por `perfiles`. |
| Perfil / grado | `MATE.perfiles` (`perfiles.js`): Ian es el de 4to (`id:'ian'`). Las actividades nuevas van con `perfiles:['ian']`. |
| Store por perfil | `MATE.store(idActividad)` → `{get(k,def), set(k,v)}`, guarda JSON en `mate.<perfil>.<actividad>.<clave>`. Sin perfil activo no guarda. Globales: `MATE.global`. |
| Tema | `MATE.tema.get/set/oscuro/alternar()`; pone `data-theme` en `<html>`. CSS: tokens en `:root` + media query `prefers-color-scheme` + `[data-theme]`. |
| Versión | Cada actividad tiene la suya; se muestra en un elemento `.ver`. `MATE.ver(el)` muestra la del shell. |
| PIN / configuración | `MATE.pin.check/set`; "Ajustes de padres" vive en `index.html` (`verPin` / `verAjustes`). |
| Navegación | `MATE.irMenu()`, `MATE.abrir(id)`; conservan `?p=&t=`. |
| Entrenador de tablas | **No existe** en este repo (solo está la Tabla del 100, que no guarda hechos). No hay formato de hechos para reutilizar. |

## 2. Decisiones de adaptación

**Nombres de carpeta.** La convención del repo es `actividades/<grado>-<nombre>` (por ejemplo `1ro-tabla100`). Se usan `4to-division-paso-a-paso`, `4to-cuantas-veces-entra`, `4to-detective-problemas`, `4to-tiene-sentido`, `4to-calculo-con-ceros` y `actividades/_comun-4to/` para lo compartido. Alternativa descartada: los nombres sin prefijo del prompt (rompen la convención).

**Claves de almacenamiento.** El prompt pide `ref4:<act>:eventos|estado|agregados`. El store real ya antepone perfil y actividad, así que se guardan como `mate.<perfil>.<act>.eventos|estado|agregados` (con `MATE.store(act)` y las claves `eventos`, `estado`, `agregados`). Alternativa descartada: claves `ref4:` a mano en `localStorage` (esquivaría el store por perfil).

**Panel de estadísticas.** El shell no tiene el perfil activo al entrar a Ajustes de padres, y `MATE.store` solo escribe para el perfil activo. El panel (`panel-estadisticas.js`) lee y escribe `localStorage` con el mismo esquema `mate.<perfil>.<act>.<clave>`. Es un adaptador en código propio; no se tocó el core. Con `file://` en Firefox el shell no ve los datos de las actividades (limitación ya anotada en `PLAN.md`).

**Versión `1.0.0`.** El repo usa `vX.Y` para el shell y la Tabla del 100, pero el prompt pide semver `X.Y.Z` para estas actividades. Se usa `1.0.0` en estas; las existentes no se tocan.

**Campo `tipo` en los eventos.** Se agrega `tipo` (`paso`, `ronda_inicio`, `ronda_fin`, `inactividad`, `nivel_cambio`) a todos los eventos para distinguirlos. Los de paso llevan además `item.hecho` (por ejemplo `"7x8"`) cuando corresponde, para el ranking de hechos.

**Sonido.** El repo guarda la preferencia de sonido por actividad (Tabla del 100). Acá se usa `MATE.global` con la clave `sonido` (compartida entre las actividades nuevas, por defecto activado).

**Tabla del divisor en blanco (A1, niveles 3 y 4).** El ×1 viene escrito (es el divisor) y se completan ×2 a ×9. Alternativa descartada: pedir también el ×1 (paso sin valor didáctico).

**Nivel 4 de A1 (modo carpeta).** El flujo sigue la cuenta correcta y las respuestas del chico se anotan sin corregir; al terminar toca "Revisar" y la app marca el primer paso erróneo y lo deja corregir desde ahí (se descartan las respuestas posteriores). Un factor equivocado no desvía la estructura de la cuenta; se detecta en la revisión.

**Máximos de nivel.** A4 tiene 3 niveles (la tabla del prompt define 3); las demás, 4.

**"Errores de control" para subir de nivel.** A1: `RESTO_MAYOR`, `CONTROL`, `ESTIMACION`, `VERIFICACION`. A4: todos. A2, A3 y A5: ninguno (solo cuenta el 80 %), salvo `ESTIMACION` en A5.

**Estrellas.** 3 con 85 % o más al primer intento, 2 con 60 % o más, 1 en otro caso.
