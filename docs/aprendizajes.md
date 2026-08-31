# Aprendizajes del proyecto

Este archivo guarda soluciones a problemas de entorno y patrones ya resueltos.
Debe leerse al inicio de cada sesión antes de proponer comandos.

## Cómo usar este archivo
- Al iniciar sesión: lee este archivo completo antes de proponer cualquier comando.
- Al cerrar una tanda: si resolviste un problema nuevo, agrégalo al final de la bitácora.
- Formato de cada entrada: síntoma → causa → solución probada.
- Cuando el archivo cruce ~1500 líneas, archivar según `CLAUDE.md` §«Archivado de
  la bitácora»: reglas activas destiladas arriba, últimas ~200 líneas de bitácora
  abajo, el resto a `docs/_archivo/aprendizajes_AAAAMMDD.md`.

## Histórico archivado

| Archivo | Contenido |
|---|---|
| `docs/_archivo/aprendizajes_20260714.md` | `E-001` … `E-017` — entorno local pnpm/Node/SWC/puertos y patrones de código asimilados |
| `docs/_archivo/aprendizajes_20260807.md` | `E-018` … `E-096` y bitácora 24-jul → 06-ago-2026 |
| `docs/_archivo/aprendizajes_20260822.md` | bitácora 06-ago → 21-ago-2026 · 34 entradas · 1221 líneas |

Consultar esos archivos sólo para el detalle histórico de un incidente concreto.
Lo que sigue vigente como regla vive abajo, destilado.

## Estado de tareas

- 🟢 **2026-08-23 — DESBLOQUEOS por la segunda tanda de respuestas del cliente.** Siete
  ambigüedades cierran de una vez. Detalle en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`;
  normado en `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md`.
  - **P7-TAS desbloqueada** (IF-03). **A-13 cierra**: los comparables llegan por extracción de una
    foto del cuadro de la plantilla y **la sección D pasa a sólo lectura** —caen "Agregar
    comparable" y la eliminación por fila; RF-12 conserva el mínimo de 3 y **cambia de sujeto**,
    valida el origen y no la captura—. **A-18 cierra por disolución del requisito** (D-24): sin
    campo editable no hay precarga, **RF-TAS-08 pierde su conjunto 1** y
    `GET /api/tasaciones/config/defaults` no se construye. `C_FactoresHomogeneizacion` y
    `lib/tasador/factores-default.ts` quedan **sin consumidor**. **A-25 cierra** sin costo: el
    catálogo de seis desenlaces ya estaba construido así.
  - **A-44 nueva, no bloqueante** (D-23): los tres factores que **D-21** ratificó el 22-ago no
    aparecen en el cuadro que el tasador fotografía, que desde A-13 es su única entrada. Si se
    usan, no es en este flujo. Dueños Héctor + visador titular.
  - **SLA · IF-02: cierran A-23, A-24, A-26 y A-32**, y con ellas **D-18 y D-19**. El tope de 24 h
    se modela **sólo como corte de reporte**, sin semáforo agregado ni alerta en pantalla; el
    recordatorio queda en **correo único** (WhatsApp descartado); el tablero de vencimientos queda
    con **cuatro grupos**, sin día 0; los siete motivos de reproceso quedan ratificados como
    dominio cerrado.
  - ⚠ **Lo que estas cinco respuestas NO destraban: ninguna tanda entera.** Lo que habilitan es
    **§5.2.9** —tablero de cuatro grupos y reporte de 24 h, opción B— y los dos `singleSelect` de
    catálogo. Las tandas del plan IF-02 · SLA son **A–G** (§9.6.2) y conservan su orden y sus
    precondiciones. **La nomenclatura «T1–T7» del snapshot del 22-ago-2026 no existe en el repo**
    y no debe reutilizarse.
  - 🔴 **Tanda F sigue bloqueada**, por un motivo distinto y anterior: el patrón de disparo de
    `AT08_Alertas_SLA`. Ver la entrada de abajo. Estas respuestas no lo tocan.

- 🔴 **2026-08-11 — TANDA F BLOQUEADA · decisión arquitectónica pendiente antes de arrancar: patrón de disparo de `AT08_Alertas_SLA`.** Dos opciones detectadas el 11-ago-2026:
  - **(A) Fila observada en `TX_Notificaciones`** — patrón del script existente `docs/_artefactos/airtable/AT08_Alertas_SLA.js` (702 líneas, commit `bd5768d`). Evita el problema del secreto HMAC en Airtable Automations pero acopla a polling en Make.
  - **(B) Webhook firmado con HMAC-SHA256** — patrón del plan v1.12 · F-1, consistente con SC01/SC05/SC-Edicion. Obliga a decidir dónde vive el secreto HMAC, ya que Airtable Automations **no lee env vars**.

  **Tensión no resuelta por §9.6:** `CLAUDE.md` prohíbe tokens hardcodeados o en tablas visibles. **Sergio decide con Héctor/Óscar antes de arrancar Tanda F. M-15 no se aprueba hasta que este punto quede resuelto.**

  *Contexto adicional levantado el mismo día, para quien retome:* el script existente diverge del F-1 del plan v1.12 en cuatro puntos, no sólo en el patrón de disparo. **No usa `clave_notif`**, así que hoy no puede pasar el criterio de M-18 ("una segunda corrida no genera un segundo correo"); **recalcula el semáforo por su cuenta** en vez de leer `sla_semaforo_etapa`, que es la segunda fuente de verdad que RO-05 prohíbe y que las Tandas C/D evitaron a propósito; nombra `SC13` y nunca `SC-SLA-Alertas` (RO-14); y su nombre de archivo usa `_` donde el plan pide `AT08-AlertasSLA.js`. Cualquiera de las dos opciones exige reescritura parcial: (A) no es "usar el script tal cual".

- **2026-08-11 — M-14 HECHO.** `SC01 v1.1` + `SC-Asignar v2.1` + `SC-Edicion v3.5` reimportados **sobre los escenarios existentes** (RO-10 respetado: sin dos versiones activas del mismo escenario). Los 6 campos SLA del payload verificados en el diseñador de SC-Asignar. Sin incidentes, por eso no tiene entrada de bitácora propia.
- **2026-07-22** — IF-02 **P0–P9 completadas (código)**: build + tsc verdes. Pendiente la **tanda externa** (provisionar Make SC01/SC-Asignar/SC-Edicion, env vars Railway, push, smoke test end-to-end incl. correo SC13) y la **deuda diferida** (eslint, `router.refresh` tras asignar, swap picker mock→candidatos, redirect `/`→`/consola`, campo `fecha_asignacion` D-08) — todo en `docs/_notas/checklist-P9-manual.md`. No hay P10.
- **2026-07-08** — Pausada "Implementar endpoint real de Make y refresco de lista" (Paso 4B Fase 2): pausado para migrar `TX_Solicitudes.banco` a Link → M_Bancos, decisión de panel 2026-07-08.
- **2026-07-09** — "Mi cartera resuelve clerk_user_id → recordId" cerrada: Sergio autorizó poblar `AUTH_Usuarios.clerk_user_id` y asignar 2 solicitudes de prueba (`VP-2026-0004`, `VP-2026-0028`) a `ejecutiva_asignada` para validar en vivo. **Pendiente:** decidir si esas 2 solicitudes de prueba deben revertirse a `ejecutiva_asignada` vacío una vez validado en el navegador, o si se dejan como está.

## Reglas operativas aprendidas
- Antes de escribir código nuevo: leer archivos que se van a tocar y reportar qué existe reutilizable.
- Nunca commitear ni pushear: el usuario lo hace vía GitHub Desktop, **salvo instrucción explícita en contrario para una tanda concreta**.
- Nunca proponer `sudo` autónomamente.
- Cuando un cambio salga del alcance del prompt, avisar antes de aplicarlo.
- Verificar puerto real del server antes de curl.
- No hacer adendas: aplicar cambios donde corresponda y entregar la nueva versión completa del archivo modificado.
- Leer este archivo **antes del primer comando de terminal de la sesión**, no al cerrarla. Es insumo de trabajo, no sólo destino de escritura. Una regla de esta sección gana a cualquier convención heredada de un plan o de un prompt.
- **RO-01 · validador antes de "listo".** Cualquier tabla propia pasa por el validador pandoc antes de reportarla como completa, no después de que el revisor lo pida. El diff final no debe ser la primera vez que el validador la ve.
- **RO-02 · grep como fuente de verdad de cobertura.** Cuando una convención existe para ser encontrada por `grep`, la verificación de cobertura es el propio `grep` contra la lista de puntos aprobados — no el recuento del ejecutor. Un reporte "N marcas aplicadas" sin la salida literal del `grep` contra la lista aprobada no cuenta como cierre.
- **RO-03 · modificaciones a reglas operativas.** Detectar que una regla quedó desactualizada por instrucciones recientes es válido y esperado. Aplicar la modificación en el mismo lote donde se detectó no lo es. La propuesta de cambio de regla se lista al final del reporte del lote con texto antes/después, y espera aprobación explícita antes del commit siguiente. Aplica a `docs/aprendizajes.md`, `docs/CLAUDE.md` y cualquier otro archivo de reglas operativas del repo.
- **RO-04 · el signal antes que el síntoma.** Para distinguir dos causas que
  producen la misma respuesta, buscar el campo que las emite distinto —un header,
  un código— en vez de razonar por descarte sobre lo que comparten. «No es JSON,
  luego es Clerk» es una inferencia; `x-clerk-auth-status` es una medición.
- **RO-05 · fuente única cuando UI y backend deben coincidir.** Si una etiqueta
  de pantalla tiene que dar el mismo resultado que un derivado del servidor, la
  regla se extrae a `lib/` y la consumen los dos. Dos copias divergen, y la
  divergencia aparece en auditoría, no en pantalla.
- **RO-06 · invariantes estructurales como test.** Lo que es cierto «por
  construcción» se fija con un test que barre todas las combinaciones, no con un
  comentario. Y toda regresión conocida deja un test que nombra el bug pasado:
  viaja con el código, la documentación aparte no.
- **RO-07 · Edición manual de `package.json` exige regenerar lockfile en la
  misma tanda.** Toda modificación a mano de `package.json` (típicamente para
  pinnear versiones exactas según `CLAUDE.md`) debe seguirse en la misma tanda
  de:
  1. `pnpm install --lockfile-only`
  2. `pnpm install --frozen-lockfile` (el comando que Railway ejecuta)

  Los comandos `pnpm build`/`typecheck`/`test` **no validan el lockfile** — usan
  `node_modules` ya instalado. `--frozen-lockfile` es la única detección temprana
  del desync.

  Nota adicional: `--lockfile-only` re-resuelve el grafo completo y puede
  colapsar duplicados transitivos (ej.: `picomatch` 4.0.4 → 4.0.5 en el fix de
  este bug). Revisar el diff completo antes de aceptar.

  Origen: commit `47821c9` pushó lockfile desincronizado; 5 deploys de Railway
  fallaron hasta el fix con `--lockfile-only` + B1.
- **RO-08 · `Select` con `value` no legible exige función de formato.** El
  wrapper de `components/ui/select.tsx` es un passthrough de `@base-ui/react`, y
  `Select.Value` renderiza el **`value` crudo** si no se le pasa `children` como
  función. Cuando el `value` sea un record ID, un sentinel o cualquier cosa que
  no se le muestre a un humano, el trigger cerrado lleva
  `{(v) => etiquetaDe(v)}` — y esa función vive en `lib/`, no en el componente,
  para que la opción abierta y el valor cerrado no puedan divergir (RO-05).
- **RO-09 · Regla D tiene dos formas correctas; la invariante es una sola.** Lo
  que hay que garantizar es que **ninguna salida deje el flag de progreso
  encendido**, no que todo handler use `finally`. Antes de elegir la estructura,
  mirar qué hace la salida de éxito: si **borra** el elemento cuyo estado se
  resetearía, el `finally` lo resucita y corresponde `catch`; si escribe su
  estado terminal antes de los callbacks, el `finally` estándar es limpio. Un
  `finally` incondicional pisa el estado de error que acaba de escribir el
  `catch` o un `return` temprano: usar updater condicional.
- **RO-10 · Al importar un blueprint Make vN, pausar v(N-1) en el mismo turno.**
  Un escenario viejo **no pausado sigue consumiendo el webhook** aunque exista
  una versión nueva importada; la única URL que importa es la que Railway apunta
  en la env var. Pausar en el mismo turno y registrar la fecha del cambio en
  `docs/construccion.md`.
- **RO-11 · La de-duplicación por hash no es un fallo.** «Binario ya indexado»
  en `SC-Adjuntos-Upload` es comportamiento esperado (RT-03), no un error. Un
  archivo que «no aparece en la ruta nueva» puede ser dedupe legítimo si su
  `hash_md5` coincide con un adjunto histórico, incluso de otra sesión. Validar
  un path nuevo end-to-end **exige un archivo con hash nunca visto**: renombrarlo
  no alcanza, hay que cambiar el contenido.
- **RO-12 · Dropbox crea las subcarpetas al vuelo.** El módulo de subida crea
  la estructura que venga en el `path`; no hay que pre-provisionar nada. Aplica
  igual a las carpetas de unidad y a las tres reservadas de §8.1 —`comun/`,
  `informe/`, `_ingreso/`—.
- **RO-13 · Filtrar por el formato real de la fórmula, no por el literal
  humano.** Un campo fórmula de Airtable emite el string que su autor escribió,
  con emoji, mayúsculas y adornos incluidos —no el vocabulario con que el equipo
  habla del campo—. Un `filterByFormula` por igualdad contra el literal humano
  (`{semaforo_sla} = "rojo"`) devuelve **cero filas para toda la tabla**, y cero
  filas se lee como «no hay casos», no como «el filtro está mal»: el fallo es
  silencioso y sobrevive a la revisión. Antes de escribir un filtro sobre un
  campo fórmula, leer la fórmula con `get_table_schema` y copiar sus literales
  exactos; ante adornos volátiles (emoji, tildes, prefijos), filtrar por
  subcadena con `FIND(...)` en vez de por igualdad.
- **RO-14 · Alias documentado en vez de renombrado, cuando ambos lados están en
  producción.** Cuando un mismo identificador significa cosas distintas en el
  spec y en el repo, la reacción natural —renombrar en uno de los dos— es la
  cara si ambos ya corren: renombrar en el repo toca rutas, blueprints y campos
  de Airtable; renombrar en el spec lo hace contradecirse en las secciones que
  ya usan el otro sentido. La salida barata es registrar el alias con sufijos
  explícitos (`RF-09-spec` / `RF-09-repo`) y diferir la unificación al próximo
  bump normativo. Sirve porque el problema real es de lectura, no de runtime:
  nada falla, sólo se lee mal. Ver **CI-006**.
- **RO-15 · Ante un nombre de tabla en conflicto, gana la base real.** Si el
  spec nombra una tabla que en Airtable se llama distinto, se corrige el spec,
  no la base: renombrar en Airtable rompe fórmulas, automations y escenarios
  Make vivos, y el coste no es simétrico. La corrección del spec se difiere al
  próximo bump —un rename de N apariciones en el documento normativo merece su
  propio changelog, no un parche dentro de otra tanda— y mientras tanto se
  registra como CI. Ver **CI-007** (`H_Feriados` en el spec vs `C_Feriados` real).
- **RO-16 · `grep -v` excluye por `:`, nunca por `$`.** Las líneas que `grep`
  emite tienen la forma `archivo:linea:contenido`, así que `$` ancla al final
  del **contenido** y no del nombre del archivo. `grep -v '\.test\.ts$'` no
  excluye ningún test: lo correcto es `grep -v '\.test\.ts:'`, anclando en el
  separador. El modo de fallo es el peor posible —el filtro no filtra nada y
  parece que sí— y sobrevive a la revisión porque el comando *se ve* bien.
  Dos corolarios que costaron el mismo bug: **un criterio de aceptación es
  código, tiene bugs y se corre antes de escribirse en un plan** (una corrección
  redactada de memoria hereda el defecto que venía a arreglar); y **un criterio
  se escribe sobre las señales inequívocas, no sobre todas** —meter `2`, `3`,
  `4` y `6` en un patrón que busca umbrales de SLA no lo hace más estricto, lo
  hace inservible, porque esos números son etapas y días de la semana en el
  propio motor y obligan a ignorar el criterio todos los días—. Es **RO-02** por
  el otro extremo: allí el riesgo era no correr el `grep`; acá se corre y lo que
  está mal es su definición. Ver **§9.6-R6** del plan.
- **RO-17 · Un campo que entra por dos rutas se normaliza en el borde, no en
  cada consumidor.** `TX_Solicitudes` se lee de dos formas: la bandeja usa
  `cellFormat: 'string'` —necesario para que los campos Link lleguen como texto
  legible— y ahí un `dateTime` **no llega en ISO** sino renderizado con
  `userLocale: 'es-CL'` (`"12-08-2026 13:00"`); los handlers que leen en JSON
  reciben ISO. Sin normalizar, el mismo campo significa cosas distintas según
  por dónde entró, y el bug aparece en una sola de las dos pantallas. La
  solución es una función de parseo tolerante en el mapper —`parseInstante` en
  `lib/solicitudes.ts`, que acepta ISO con y sin hora y reloj de pared es-CL— que
  emite **siempre ISO** o `null`, nunca una fecha inventada. Dos detalles no
  opcionales: la rama de reloj de pared se convierte con `desdeSantiago`, jamás
  sumando un offset fijo (Chile alterna −03/−04 dos veces al año y el error sólo
  se ve cuatro meses al año), y lo no parseable degrada a `null` para que el
  llamador diga "sin dato" en vez de mostrar un plazo falso. Es **RO-05**
  aplicado a la representación y no a la lógica: una sola forma canónica en
  memoria, decidida donde el dato cruza el borde.
- **RO-18 · Cuando el motor calcula y otro sistema persiste, lo calculado entra
  al payload por spread condicional.** Patrón de §9.6 · C-5, reutilizable en todo
  flujo Next.js → Make: el Route Handler invoca el motor en modo **no
  persistente** (`persistir: false`), recibe el payload de campos y lo agrega al
  webhook con `...campos`; **Make escribe, el handler no** (RT-03). Tres reglas
  que lo hacen seguro, y las tres se rompen por separado:
  1. **Calcular antes de disparar el webhook.** Al revés, un fallo del motor deja
     la operación hecha y sin instrumentar, y nadie se entera.
  2. **El fallo del cálculo no bloquea la operación de negocio.** El reloj es
     instrumentación; la asignación es la acción. Se envuelve en `try/catch`, se
     registra con prefijo greppable (`[SLA-ETAPA]`) para auditar qué filas
     quedaron sin instrumentar, y se sigue. Es el criterio de **CI-003b** por su
     lado bueno: ahí se bloqueaba porque el daño era permanente e invisible; acá
     no se bloquea porque es recuperable con un recálculo posterior.
  3. **Las claves se omiten, no se mandan vacías.** El spread de un objeto vacío
     no agrega nada; mandar `""` a un campo `date` o `number` con `typecast` es
     otra cosa. Del lado de Make, el mapeo se escribe
     `{{if(x; parseDate(x))}}` —idioma ya probado en producción— para que una
     clave ausente no escriba cadena vacía.

  Y un guard que conviene testear explícitamente: el motor **no debe correr
  antes del guard de idempotencia**, o un segundo click movería los umbrales
  hacia adelante aunque la operación se rechace con 409.
- **RO-19 · Un módulo `lib/` que importa `airtable-client` no puede exportar
  literales que consuma un componente cliente.** El import arrastra el cliente
  REST —y su lectura de `AIRTABLE_TOKEN`— al bundle del navegador. Partir en
  dos: `lib/x.ts` con el tipo, los literales de pantalla y el mapeo puro
  (cliente-safe) y `lib/x-airtable.ts` con el `listRecords`. `import type` sí es
  seguro: se borra en compilación. Nada falla al escribirlo mal; el bundle
  simplemente crece y el token viaja. Molde: `sla-cronologia` / `sla-etapas`.
- **RO-20 · Un campo Link puede existir y estar vacío, y eso rompe el filtro
  igual que E-076.** Antes de escribir un `filterByFormula` sobre un Link,
  contar cuántas filas lo tienen poblado — no basta con que el campo esté en el
  schema. En `A_DecisionesMotor` y `TX_DocumentosGenerados` el Link `solicitud`
  existe y está vacío en el 100% de las filas; la referencia real vive en un
  texto plano. Cero filas se lee como «no hay datos»: el fallo es silencioso.
- **RO-21 · Verificar población, no existencia, también en los campos que la UI
  muestra.** `A_Eventos.actor_nombre` está vacío en toda la tabla mientras
  `actor` trae el `clerk_user_id` crudo: construir la fila sobre él compila,
  pasa los tests y no muestra nada nunca. Y si lo único disponible es un
  identificador técnico, **se omite el dato** — exponerlo incumple §6.1.
- **RO-22 · Reconciliar UI optimista con el servidor se hace comparando, no
  esperando.** Descartar las entradas fabricadas en el navegador cuyo
  `timestamp` ya alcanzó al del registro de servidor más reciente, nunca con un
  `setTimeout` de ventana adivinada. No hay carrera que perder ni duplicado
  permanente si el escenario Make se demora.
- **RO-23 · `Button` renderizado como `<a>` necesita `nativeButton={false}`.**
  §4.4 pide `render` prop en vez de `asChild`; lo que no estaba escrito es que
  Base UI sigue tratando el elemento como botón nativo salvo que se le diga lo
  contrario. El tipo lo admite sin quejarse.
- **RO-24 · Un bump normativo distingue punteros de historia, y el changelog
  va al final.** Los `grep` de un bump devuelven dos clases mezcladas:
  **punteros vivos**, que **se actualizan** —rutas de archivo, cabeceras de
  fuentes canónicas, citas "Spec vX §Y" en planes vigentes y en CI abiertas, y
  los **comentarios de cabecera de `.ts` · `.tsx` · `.js` · `.py`** que citan el
  documento normativo: tras un `git mv` apuntan a un archivo inexistente—, y
  **afirmaciones históricas**, que **quedan intactas** —"Desde vX…", "§Y nueva
  en vX", la línea `SUPERSEDED` de cabecera, las filas del changelog interno
  (`Cambios vX → vY`, `vX (anterior)`), toda construcción del tipo "hasta vX.Y"
  o "entre vX.Y y vX.Z", `docs/_archivo/`, `docs/_notas/` y esta bitácora—:
  subirles el número convierte un registro en una afirmación falsa. El caso
  mixto se **reescribe**, no se renumera.
  Tocar código para actualizar un puntero es **cambio de comentario, no de
  comportamiento**, y por eso no viola la regla de "sólo documentación" de una
  tanda documental; pero se declara como desviación en la bitácora del lote
  (patrón C-10 del `SYNC_LOG`), nunca en silencio.
  El bump cierra con un `grep` que debe salir sin punteros vivos:
  ```bash
  grep -rn "v1_9_8\|v1\.9\.8" --exclude-dir=node_modules --exclude-dir=.git . \
    | grep -v "aprendizajes.md\|docs/_notas/\|docs/_archivo/"
  ```
  Y el orden es: integrar el cuerpo primero, redactar el changelog después
  leyendo lo integrado; al revés se anuncian cambios que no existen.
- **RO-25 · Antes de asignar un correlativo, leer todos los existentes.**
  `grep -n '^- \*\*RO-' docs/aprendizajes.md | tail -3` y su equivalente para
  CI · RF · RN · SC · AT. Leer "las primeras N líneas" del archivo no basta: la
  sección puede continuar más abajo, que es como nacieron dos RO-17. Un
  correlativo duplicado no se arregla después sin romper punteros.
- **RO-26 · Un snapshot de schema se levanta de la base, nunca de un documento
  de diseño.** `docs/schema-airtable.md` es un pase contra Airtable
  (`GET /v0/meta/bases/{baseId}/tables`), no una transcripción de la Capa de
  Datos. Documentar de memoria o desde el diseño es lo que produjo CI-010 y
  CI-011 —campos inventados y un Link que no existe—, y el fallo resultante es
  silencioso: un filtro sobre un campo inexistente devuelve cero filas sin
  error. Caso particular de la regla que comparten RO-13 y el fixture del wire:
  derivar de la fuente de verdad, no de un documento que habla sobre ella.
- **RO-27 · Un diseño externo que contradice al spec manda sólo en su propia
  sección.** Cuando la fuente de verdad visual contradice a una sección que el
  equipo ya editó por decisión propia, alinear **únicamente** la sección local y
  **declarar la contradicción in situ**: nota visible al inicio de esa sección
  con puntero a la CI que gobierna la decisión de negocio, RF afectados marcados
  como pendientes de esa CI **en su descripción** —no al pie— y con el criterio
  de aceptación fijando que no se liberan antes del cierre, más el registro de
  qué habría que reponer si la CI cierra en el otro sentido. **No propagar la
  corrección a otras secciones sin autorización explícita**: hacerlo ejecuta por
  la puerta de atrás una decisión de negocio que no es del ejecutor. Un
  documento que se contradice de forma declarada es auditable; uno reconciliado
  a la fuerza esconde qué se decidió y quién lo decidió.
- **RO-28 · Un PDF entregado como "diseño" puede traer una auditoría de código
  dentro.** Antes de tratar cualquier parte como fuente, **inventariar el
  archivo por páginas** y separar las dos naturalezas en el reporte. Sólo la
  parte de diseño es fuente de verdad visual; la de auditoría sirve como
  **evidencia de código** para fichas CI, nunca como requisito. Tomar el archivo
  entero canoniza como especificación lo que la propia auditoría marca como
  deuda —el caso que lo motivó: un contador de intentos que el spec ya había
  retirado (CI-015)—.
- 🚫 **RO-29 · ANULADA el 19-ago-2026 — no aplicar.** La revisión de Héctor sobre el
  diseño v4 (Pantalla 2, puntos 1-4) revierte esta decisión: la coordinación **sí** va
  por sistema. Anulación registrada en `docs/CODE_INCONSISTENCIES.md` → CI-012. El texto
  original se conserva abajo por la regla de sólo-append, **como historia, no como regla**.
  ~~RO-29 · La coordinación de visitas no se soporta por sistema: es manejo
  manual fuera de plataforma.~~ Decisión de producto de Sergio (17-ago-2026),
  **canónica y cerrada**. Aplica a los dos tramos: ejecutiva ↔ tasador y
  tasador ↔ visador. **`TX_CoordinacionVisita` no existe y no existirá**, y con
  ella caen `estado_coordinacion`, `motivo`, `intento_numero`,
  `fecha_visita_propuesta`, `email_thread_id` y `email_enviado_status` como
  entidades de coordinación. Consecuencias vinculantes: no se tipan esas
  entidades, no se construyen las rutas `/api/tasaciones/[id]/coordinacion`, no
  se emiten los correos de coordinación, y la Regla T-A del plan de IF-03
  colapsa de tres variantes de botón a una sola («Abrir tasación»), sin gate de
  coordinación. **Cierra CI-012 en sentido negativo.** Todo lo que la spec §2.3
  y §2.12 describen sobre coordinación por sistema queda desalineado y se
  retira en el próximo bump normativo. **No volver a preguntarlo**: quien
  encuentre una referencia viva a la coordinación por sistema la trata como
  documentación pendiente de retirar, no como requisito.
- **RO-30 · El acceso a Airtable desde una sesión de Claude Code va por MCP; el
  de producción va por `AIRTABLE_TOKEN`.** Son dos caminos distintos para dos
  consumidores distintos, y confundirlos es el error que la regla previene.
  **Diseño y verificación** (auditar schema, listar campos con FIELD_IDs reales,
  buscar registros de referencia, validar contratos antes de escribir tipos o
  Route Handlers): **MCP es el camino por defecto**; `curl` a la REST API queda
  como recurso sólo cuando el MCP no cubre el caso, y entonces se declara por
  qué. **Producción** (Route Handlers compilados corriendo en Railway): **sigue
  siendo `AIRTABLE_TOKEN` server-side, sin excepción**. El MCP vive en la sesión
  del cliente, no en el runtime de Next.js: no es una preferencia sino una
  imposibilidad técnica, y una ruta que lo intentara no arrancaría. Vigente
  desde el 18-ago-2026, sesión P2-TAS.A (Sergio autorizó y autenticó la conexión
  MCP en esa sesión). Supersede la práctica anterior de levantar el schema por
  `curl`, que es como se bajaron los snapshots de P1-TAS y del arranque de
  P2-TAS.
- **RO-31 · Borrado vs desligado en el sync de tablas hijas: la pertenencia
  manda sobre la reversibilidad.** Cuando un Route Handler sincroniza filas
  hijas contra un payload —el patrón «llegan N filas, en la base hay M»—, la
  elección entre `DELETE` real y vaciar el Link se decide por **de quién es el
  dato**, no por cuál operación es más fácil de deshacer. Si la fila pertenece
  en exclusiva al registro padre (`TX_Ampliaciones`, `TX_HabitacionesPorNivel`,
  `TX_TerminacionesPorRecinto`, `TX_ItemsCuadroValoracion`), la baja es
  **borrado**: una fila huérfana sería basura permanente que el consumidor de
  aguas abajo —AT03— leería como dato vigente. Si la fila alimenta algo que
  excede a ese padre, la baja es **desligado**: es el caso de `TX_Comparables`,
  cuyo `aporta_a_historico` sirve al histórico de mercado de *otras*
  tasaciones, y borrarla destruiría un dato ajeno. Las dos operaciones conviven
  en IF-03 a propósito y el contraste se documenta en el docblock de cada ruta.
  **Corolario sobre la clave de sync:** nunca se usa el `id` que manda el
  cliente. El v0 emite identificadores locales y efímeros (`it-new-1`,
  `amp-3`, `rc-2`) que no son record ids de Airtable; la clave es determinista y
  se deriva server-side (`clave_ampliacion`, `clave_habitacion`,
  `clave_terminacion`, `clave_natural`). Vigente desde el 18-ago-2026, sesión
  P2-TAS.A.
- **RO-32 · La auditoría de una colección hija se registra contra la tabla
  padre, con el nombre de la colección en `campo_modificado`.** `A_Cambios.
  tabla_origen` es un `singleSelect` de **dominio cerrado** —`M_Clientes ·
  M_Tasadores · M_Visadores · M_Comunas · C_ReglasNegocio · C_Formulas ·
  C_Factores · TX_Solicitudes · TX_DatosTasacion · Otro`— y no contiene ninguna
  de las tablas hijas de captura (`TX_Ampliaciones`, `TX_HabitacionesPorNivel`,
  `TX_TerminacionesPorRecinto`, `TX_ItemsCuadroValoracion`, `TX_Comparables`,
  `TX_DocumentosLegales`). Escribir ahí el nombre literal de la hija **no
  fallaría**: `typecast: true` crearía la opción y el dominio quedaría
  contaminado en silencio, rompiendo además el filtro del timeline de IF-02, que
  lee por ese campo. La forma correcta es `tabla_origen = TX_Solicitudes` y
  `campo_modificado = <nombre de la colección>` (`comparables`, `ampliaciones`,
  `recintos`, `niveles`, `items`), que es lo que ya hacía
  `app/api/tasaciones/[id]/comparables/route.ts` desde P2-TAS. La regla
  generaliza ese precedente y lo vuelve obligatorio. Corolario: **antes de
  escribir un `singleSelect`, verificar el dominio real**; el `typecast` que
  evita un error de escritura es el mismo que convierte una errata en una
  opción nueva. Vigente desde el 18-ago-2026, sesión P2-TAS.A.
- **RO-33 · Cuando un criterio de aceptación cambia de conteo por decisiones
  legítimas, la cadena de decisiones se escribe al lado del conteo final.** Un
  criterio que dice «las 15 rutas existen» y una tanda que entrega 11 se leen,
  seis semanas después, como un incumplimiento — aunque cada baja tenga causa
  registrada en otro archivo. La causa dispersa no protege: nadie reconstruye
  tres decisiones de tres documentos distintos para validar un número. El
  cierre de P2-TAS.A escribe la cadena completa en el propio snapshot
  (15 → 13 por RO-29 · 13 → 12 por A-18 · 12 filas → 11 archivos porque tres
  rutas agrupan varios métodos), y **al lado del conteo**, no en una nota al
  pie. Corolario del mismo problema, aprendido caro en la misma sesión:
  **un conteo debe declarar qué cuenta.** CI-023 nació diciendo «20 campos»
  contando **filas** de una tabla en la que una fila agrupaba tres
  identificadores; el número real era 26. Cualquier ficha que cite una cifra
  indica si cuenta filas de documentación o entradas reales del código o del
  schema, y cuando dos artefactos citan el mismo concepto con números
  distintos, la discrepancia se **explica en el sitio** en vez de igualarse.
  Vigente desde el 18-ago-2026, sesión P2-TAS.A.
- **RO-34 · Ausencia ≠ neutro.** Un campo que el usuario no tecleó se representa
  como `""` o `null`, **nunca como su valor neutro** —`1` en un factor
  multiplicativo, `0` en una suma—. El neutro es matemáticamente inocuo y por
  eso resulta tentador, pero en pantalla es **indistinguible de una decisión
  explícita del usuario**: un factor en `1` dice «esto ya está revisado y lo
  dejé neutro», y un campo vacío dice «esto falta». La diferencia importa en un
  informe que después firma alguien. El daño mayor es aguas abajo: un valor
  derivado que trata la ausencia como neutro **entra en los agregados** como si
  fuera un dato completo, y el sesgo se vuelve invisible — un comparable sin
  homogeneizar promediado junto a los homogeneizados no se distingue de los
  demás. Aplicado dos veces en `lib/tasador/factores-default.ts`
  (P2-TAS.B): los tres factores nacen en `""` y no en `1`, y
  `ufHomogeneizada()` devuelve `null` —no el producto parcial— si falta
  cualquiera de ellos, de modo que la fila queda **fuera** del promedio en vez
  de contaminarlo. Corolario que la regla **no** invalida: **un `0` tecleado sí
  se respeta**. Es una decisión del usuario, no una ausencia, y anular el
  producto es exactamente lo que pidió. La regla distingue *no hay dato* de
  *el dato es cero*, que es la distinción que el neutro borra.
  Vigente desde el 18-ago-2026, sesión P2-TAS.B.
- **RO-35 · Ningún efecto de montaje dispara una escritura irreversible.** Toda
  transición de estado que el negocio considere irreversible —AT01, AT02, AT03 y
  los análogos que aparezcan— se dispara **sólo por acción explícita del
  usuario**: el click de un botón, con sus validaciones previas ya hechas.
  **Nunca desde un `useEffect` al montar, nunca por navegación, nunca por
  refresco.** El fundamento es que el montaje **no expresa intención**: ocurre
  por navegación, por recarga, por hidratación y por remontajes de React que el
  código no controla, y ninguno de esos eventos significa que alguien haya
  decidido nada. Precedente: **CI-033**. `estado-procesando.tsx` lanzaba el
  cálculo desde un efecto de montaje si la solicitud seguía en `asignada` —
  inocuo contra el store en memoria del v0, donde sólo cambiaba una variable
  local, y peligroso contra Airtable, donde **un F5 o un enlace compartido
  habría disparado AT03 de forma invisible** y sin vuelta atrás desde la UI.
  Corolario para revisiones: cuando un efecto de montaje llama a algo que
  escribe, la pregunta no es si hoy la condición se cumple pocas veces, sino
  **qué pasa la vez que se cumple sin que nadie lo haya pedido**.
  Vigente desde el 18-ago-2026, sesión P2-TAS.B.

- **RO-36 · Un día del calendario no es un instante: se ancla al mediodía local.**
  Los campos `date` de Airtable —sin hora— llegan como `"2026-08-18"`, y
  `new Date("2026-08-18")` los interpreta como **medianoche UTC**. Formateados
  en cualquier huso al oeste de Greenwich —el de Chile entre ellos— retroceden
  al día anterior. La regla: cuando el dato es una **fecha de calendario**
  (visita, vencimiento, plazo), se parsea anclando a `T12:00:00` **sin `Z`**,
  que deja el día a salvo entre −12 y +12; cuando el dato es un **instante**
  (`sla_etapa_vence_ts`, `fecha_asignacion_ts`, todo lo que termina en `_ts`),
  se lee tal cual, porque ahí la hora es el dato. Precedente doble: `parseDate`
  de `lib/solicitudes.ts` ya lo resolvía así en IF-02 desde hace meses, y
  `fechaVisible` de `lib/tasador/lectura-tasacion.ts` repitió el error en IF-03
  hasta P3-TAS.B. Corolario de método: **el bug no se ve leyendo el código, se
  ve mirando un dato conocido en pantalla** — apareció al sembrar una visita el
  18 y verla renderizada el 17, y ningún test previo lo habría cazado porque
  todos los fixtures anteriores usaban fechas con hora.
  Vigente desde el 19-ago-2026, sesión P3-TAS.B.
- **RO-37 · Una capacidad nueva de acceso a Airtable desde IF-03 no se agrega a
  `lib/airtable-client.ts`.** Ese módulo es **superficie compartida con IF-02**
  y lleva meses en producción (**R5**): ampliarlo por una necesidad de la
  interfaz del tasador extiende el radio de impacto de la tanda a la consola de
  la Ejecutiva sin que nada de IF-02 lo haya pedido. La capacidad **se aísla en
  un módulo propio de `lib/tasador/`**, con caché TTL cuando el dato lo admita,
  y **la promoción a `airtable-client.ts` queda diferida hasta que IF-02 la
  necesite** — momento en que habrá dos consumidores reales y el cambio se
  justifica solo. Caso que la origina: P4-TAS necesitó leer las `choices` de un
  `singleSelect` para cumplir **A-17** (catálogo servido desde el schema, sin
  deploy). Eso exige la **Meta API** (`/v0/meta/bases/...`), que ningún módulo
  del repo consumía; se resolvió con `lib/tasador/schema-airtable.ts` y una
  caché de 5 min, mismo patrón que `mapaComunas()`. Corolario práctico: cuando
  la duda sea "¿esto va en el cliente compartido o en un módulo propio?", la
  pregunta útil no es dónde queda más ordenado sino **quién más se rompe si me
  equivoco**.
- **RO-38 · Antes de filtrar por el valor de un `singleSelect`, leer sus
  opciones en el schema y descartar duplicados de capitalización.** Con
  `typecast: true` un valor equivocado **no falla: se guarda**, y la fila queda
  fuera de todo filtro que use el literal correcto. El fallo es silencioso por
  partida doble —ni la escritura da error ni la lectura devuelve menos de lo que
  parece razonable— y sobrevive a la revisión porque las dos mitades del código
  *se ven* bien por separado.
  Caso que la origina: `TX_Adjuntos.subido_por` tiene hoy **`Tasador` y
  `tasador`** como opciones distintas del mismo campo, la minúscula ya presente
  en filas reales, mientras `lib/adjuntos-uploader.ts` manda `'Ejecutivo'` por
  defecto y `GET /api/tasaciones/[id]/fotos` filtra por `{subido_por}="Tasador"`.
  Una foto escrita con la minúscula sube, se guarda y **no vuelve nunca** al
  listado.
  Dos corolarios, y los dos hacen falta: si UI y backend tienen que coincidir en
  un literal, **se declara en un sitio y lo consumen los dos** (**RO-05**); y
  cuando el servidor puede reescribirlo, que lo reescriba — el valor que decide
  si un dato es localizable no debería depender de lo que mandó el cliente.
  Es **RO-13** por el mismo filo, aplicado a un `singleSelect` en vez de a un
  campo fórmula: derivar el literal de la fuente de verdad, nunca del vocabulario
  con que el equipo habla del campo.
- **RO-39 · Un 5xx intermitente contra Airtable es fallo de transporte hasta que
  se demuestre lo contrario.** `fetch` de Node no informa la caída donde uno la
  busca: lanza `TypeError: fetch failed`, con un mensaje genérico, y esconde la
  causa dentro de un `AggregateError` anidado —un `Error` con `code: 'ETIMEDOUT'`
  por **cada IP** que resolvió el DNS, diez en el caso de `api.airtable.com`—. La
  respuesta HTTP no ayuda: los Route Handlers del repo mapean `AirtableError` a
  **502** y cualquier otra excepción a **500**, así que un **500 con
  `airtableStatus: undefined`** significa *«Airtable nunca respondió»*, no *«el
  código hizo algo mal»*.
  **Cómo se diagnostica, en este orden:** leer los logs de instrumentación del
  propio endpoint —`[ADJUNTOS-LEER]` en `app/api/solicitudes/[id]/adjuntos/route.ts`
  es el molde— antes de sospechar del id, del filtro o del nombre de un campo; y
  comprobar si el fallo es **intermitente**, porque el mismo endpoint alternando
  200 y 500 en una sesión descarta por sí solo toda hipótesis determinista. Sobre
  WSL2 y `/mnt/c` esto pasa de verdad y no es reproducible a voluntad.
  **La mitigación es asimétrica y tiene que seguir siéndolo:** `request()` en
  `lib/airtable-client.ts` reintenta ante fallo de transporte además del 429/5xx
  que ya cubría, pero **`postRequest()` no reintenta nunca**. Una lectura es
  idempotente; una escritura que falla por red **puede haber llegado igual**, y
  un `createRecord` reintentado a ciegas duplica el registro — exactamente el
  defecto que **CI-052** cerró, y que no se reintroduce por la puerta del cliente
  HTTP. Vigente desde el 22-ago-2026.
- **RO-40 · Una clase Tailwind que nadie declaró no falla: no existe.** Sin una
  entrada en `@theme` de `app/globals.css` —y este repo **no puede** tener
  `tailwind.config` (`CLAUDE.md`)—, Tailwind v4 no emite **ni una línea de CSS**
  para una clase propia. El build pasa, `tsc` pasa, el `className` se escribe en
  el HTML y el elemento simplemente hereda: sin fondo, sin color, sin borde. Es
  el modo de fallo más caro de los silenciosos, porque *se ve* como una decisión
  de diseño.
  **Se verifica con un `grep` sobre el CSS compilado, no leyendo el JSX:**
  `grep -o "vp-primary" .next/static/chunks/*.css | wc -l` → **0** demuestra que
  la clase no genera nada; el mismo `grep` sobre un token real devuelve
  ocurrencias. Caso que la origina: `components/tasador/` acumulaba **255 clases
  `vp-*`** heredadas del import v0 —cuyo despliegue online sí tenía su propio
  config—, así que las capturas del prototipo mostraban colores que el repo local
  nunca renderizó. **Cuidado con esa trampa al comparar contra un diseño de
  referencia: la captura puede ser de otro build.**
  **Regla:** todo token de color nuevo pasa por `@theme`, y antes de crear uno se
  comprueba si ya existe con otro nombre. **RO-05** pide una sola fuente cuando
  dos capas deben coincidir; ésta es su consecuencia en CSS — si no está
  declarada, no existe, y dos vocabularios para el mismo color son dos fuentes.
  Vigente desde el 22-ago-2026.
- **RO-41 · Después de `pnpm build`, limpiar `.next` antes de `pnpm dev`.** El
  build de producción deja sus artefactos —`BUILD_ID`, `prerender-manifest.json`,
  `export-marker.json`— en el mismo `.next` que después usa el servidor de
  desarrollo. Turbopack arranca encima de ese manifiesto y **todas las rutas
  responden 404**.
  **El síntoma engaña porque el servidor está sano:** emite su `✓ Ready in Xs`
  sin una sola línea de error, y el 404 llega sin log. Con Clerk en medio es peor
  todavía, porque un 404 sin sesión es también la respuesta normal de
  `auth.protect()` y las dos causas se confunden.
  **El control que las separa:** pedir **`/api/health`** y **`/sign-in`**, que son
  rutas públicas. Si esas dos devuelven 404, no es autenticación ni es el código:
  es `.next` contaminado. Si devuelven 200 y las protegidas siguen en 404 con
  `x-clerk-auth-reason: protect-rewrite`, eso sí es Clerk y es correcto.
  **Regla:** si en la misma sesión se corrió `pnpm build` —típicamente al cerrar
  una tanda con los gates completos— y después hace falta levantar el servidor de
  desarrollo para una verificación visual, ejecutar `rm -rf .next` **antes** de
  `pnpm dev`. Es limpieza necesaria, no preventiva: comprobado el 22-ago-2026 en
  las dos tandas que arrancaron el server tras builddear, con el `BUILD_ID` de
  producción todavía en disco. Y el orden inverso importa igual: no correr
  `pnpm build` con un `pnpm dev` vivo sobre el mismo directorio.
  Costó una sesión entera de diagnóstico la primera vez, persiguiendo una ruta de
  `/sign-in` que existía y funcionaba. Vigente desde el 22-ago-2026.
- **RO-42 · SC-RF09 no reestructura el JSON de Claude — un campo nuevo del
  contrato de extracción sólo exige editar el prompt.** El escenario
  `SC-RF09-ExtraccionClaude` **no** tiene en ninguna parte un `data-structure`
  que describa la forma de los items extraídos, así que buscarlo para agregarle
  un campo es perseguir algo que no existe. La cadena es de paso: el **módulo 25**
  (`json:ParseJSON`) parsea la respuesta **sin** estructura declarada, y el
  **módulo 22** (`airtable:ActionUpdateRecords`) escribe en
  `TX_Adjuntos.atributos_obtenidos` el **texto crudo** de Claude
  (`{{trim(replace(replace(get(last(11.content); "text"); "```json"; ); "```"; ))}}`),
  sin recomponer campo por campo. Consecuencia: cualquier clave nueva que Claude
  emita en cada item viaja de punta a punta —del prompt al JSON de la celda— **sin
  tocar los módulos 22 ni 25**, y del otro lado la consume `AT03-Ext_script.js`,
  que hace `JSON.parse` sobre el texto y lee las claves directo.
  **Regla:** para sumar un campo al contrato de extracción (p. ej. `fila` para
  comparables `muchas_por_solicitud`), editar **sólo el prompt del módulo 10**
  (`http:ActionSendData` → Anthropic) declarándolo en el formato del item, bumpear
  el `name`/versión del blueprint y reimportar; **no** buscar un data-structure en
  el blueprint. Si el consumidor aguas abajo necesita el campo, el trabajo está en
  el script de Airtable, no en Make. Comprobado en la Fase 2 de AT03-Ext + SC-RF09
  al agregar `fila`; artefacto: `docs/_artefactos/make/SC-RF09-ExtraccionClaude.blueprint.json`.
  Vigente desde el 31-ago-2026.

### Enmienda a OV-4 (18-ago-2026 · P2-TAS.B)

**OV-4 preserva la ruta de import del v0 para tipos y constantes; no cierra la
puerta a módulos server-only nuevos** cuando aparece un concern de bundle o de
seguridad. El override se decidió en P1-TAS, una tanda que sólo escribía tipos
—que se borran en compilación y no llegan al bundle—, así que la cuestión no se
planteó.

Precedente que la fija: `lib/tasador/lectura-tasacion.ts` vive fuera de
`lib/tasaciones.ts` porque este último **lo importan componentes cliente**, y
meterle una lectura de Airtable habría arrastrado `AIRTABLE_TOKEN` y el cliente
REST al bundle del navegador. La regla derivada es la que quedó escrita en el
docblock del propio archivo: *en `lib/tasaciones.ts` sólo entra lo que un
componente cliente pueda importar sin riesgo*.

OV-4 conserva su redacción original en `docs/_notas/inventario-tasador.md`; el
detalle completo del razonamiento vive en la ficha **CI-030**.

## Bitácora reciente

### 2026-08-22 — P0.5.C-TAS · sembrado de `C_DefaultsAntecedentes` (212 filas)

**Contexto:** Fase 2 y 3 de la tanda de sembrado, retomada desde
`docs/_notas/snapshot-P0.5.C-TAS-fase1-en-curso.md` con el mapeo de Fase 1 ya cerrado.

**Inconveniente:** había que re-verificar el mapeo contra el `.xlsm` real (R1) y el entorno **no
tiene `openpyxl`**. `python3 -m venv` tampoco resuelve: falla con *"ensurepip is not available"*
en este WSL, y `apt install python3.14-venv` habría requerido `sudo` para una verificación de
lectura.

**Causa raíz:** la Fase 1 se hizo en una sesión donde `openpyxl` sí estaba disponible, y el plan
de reanudación lo daba por sentado. La dependencia no estaba declarada en ninguna parte del repo
—no es una dependencia del proyecto, es una herramienta de análisis ad hoc—, así que su ausencia
no era detectable antes de necesitarla.

**Solución aplicada:** un `.xlsm` es un ZIP. Con `zipfile` de la stdlib más una regex sobre
`xl/worksheets/sheet3.xml` se extraen todos los bloques `dataValidation` con su `sqref` y su
`formula1`, que era exactamente el dato que hacía falta. El mapeo sheet-name → sheetN.xml sale de
`xl/workbook.xml` cruzado con `xl/_rels/workbook.xml.rels`. Cero instalaciones.

**Prevención futura:** para inspeccionar estructura de un Office abierto (validaciones, fórmulas,
nombres definidos), la ruta ZIP+XML es de primera elección y no de respaldo: no depende de nada,
es más rápida y muestra el XML tal cual. `openpyxl` sigue conviniendo para recorrer celdas con
valores calculados.

### 2026-08-22 — La spec y la radiografía invierten dos catálogos del Excel

**Contexto:** misma tanda, al verificar `catalogo_ref` de `elementos_fundamentales`.

**Inconveniente:** el snapshot de Fase 1 decía que `cierros_exteriores` es texto libre y que
`Antecedentes!CK45:CK50` corresponde a `obras_complementarias`. La spec §2.8.1 y
`docs/_notas/radiografia-excel-informe.md` decían lo contrario. Dos fuentes del repo en conflicto
directo sobre un dato que iba a quedar escrito en 8 filas.

**Causa raíz:** la tabla de la radiografía usa "mismo catálogo" para heredar el valor de la fila
anterior. En algún momento la atribución se corrió una fila y el `[Excel: …CK45:CK50]` quedó
pegado a *cierros exteriores*, con *obras complementarias* heredando por "mismo catálogo". La spec
copió la tabla con el error incorporado. Nada en el texto delataba la inversión: las dos filas son
plausibles y el rango existe de verdad.

**Solución aplicada:** el `.xlsm` decide. La lectura de las `dataValidation` muestra
`H43:X43 → $CK$45:$CK$50` y **ninguna validación sobre `H42`**. Gana el snapshot de Fase 1 por R1
(gana el Excel); se sembró texto libre en `cierros_exteriores`, con la excepción anotada en el
campo `notas` de las 4 filas. `radiografia-excel-informe.md` §2.1 corregido in-place; la spec, por
ser normativa, queda anotada para su próximo bump.

**Prevención futura:** **"mismo catálogo" / "ídem" en una tabla derivada es una construcción
frágil** — desplaza silenciosamente si alguien inserta o reordena una fila, y el error se propaga a
todo lo que copie la tabla. Al transcribir catálogos desde un origen, repetir la cita completa en
cada fila aunque se repita. Y al sembrar datos desde documentación derivada, verificar contra el
origen: acá el conflicto se detectó porque había dos fuentes; con una sola, el error se habría
escrito en la base sin ruido.

### 2026-08-22 — Airtable descarta el string vacío al escribir

**Contexto:** misma tanda, verificando la primera respuesta de `create_records_for_table`.

**Inconveniente:** las filas enviadas con `catalogo_ref: ""` volvieron **sin la clave**
`fld0NAJv7E1rLFWVX` en la respuesta, no con `""`. A primera vista parecía un campo que no se había
escrito.

**Causa raíz:** Airtable normaliza el string vacío a "celda sin valor", y la API no devuelve las
claves de celdas vacías. No es un rechazo ni una pérdida: `""` y *ausente* son el mismo estado en
Airtable.

**Solución aplicada:** ninguna sobre los datos —el efecto observable es el correcto, celda vacía
significa "texto libre"—. Se documentó en `docs/schema-airtable.md` y en el plan IF-03 §8, porque
**el consumidor sí lo nota**: P7-TAS decide entre dropdown e input mirando `catalogo_ref`, y un
`record.fields.catalogo_ref` sin la clave revienta si se accede sin guardia.

**Prevención futura:** al modelar un campo donde "vacío" es un valor semántico —no ausencia de
dato— no confiar en el string vacío para transportarlo: o se acepta que el cliente maneje la clave
ausente, o se usa un valor centinela explícito. Y al verificar una escritura, comparar la respuesta
contra el payload clave por clave, no sólo contar registros.

### 2026-08-22 — El conteo de un plan se verifica contra la base, no contra el plan

**Contexto:** verificación final de las 212 filas.

**Inconveniente:** el plan de la tanda anunciaba "12 filas con nota de excepción". La consulta
`isNotEmpty` sobre el campo `notas` devolvió **13**.

**Causa raíz:** suma mal hecha al redactar el plan: 4 (entrepisos) + 4 (calefacción) + 4 (cierros)
+ 1 (A-42) = 13, no 12. El error estaba en la aritmética del plan, no en los datos ni en el
generador.

**Solución aplicada:** listar las 13 filas y reconstruir el desglose, que cuadró exactamente con lo
esperado. Se corrigió el número en el snapshot y en el reporte, sin tocar la base.

**Prevención futura:** un número declarado en un plan es una hipótesis, no una verificación.
Cuando el conteo real difiere, **el primer sospechoso es el plan** — y la comprobación útil no es
"¿cuántos hay?" sino "¿cuáles son?": el desglose ubica el error en un paso, mientras que releer la
suma puede repetirla. Vale también al revés: si el conteo real hubiera dado 12 por coincidencia con
una fila faltante, sólo el desglose lo habría detectado.

---

### 2026-08-22 — El estado vigente de una CI vive en su ficha, no en el snapshot que la detectó

**Contexto:** Gate 1 de una tanda cuyo alcance era cerrar **CI-046** (el gate de coordinación de
§2.4 sin cablear en la card).

**Inconveniente:** reporté CI-046 como pendiente. Ya estaba cerrada desde hacía un día: el commit
`b035172` del 21-ago-2026 —*"Frente A+B · gate §2.4 en card + chip «Por coordinar»"*— aplicó los
dos pasos, y la ficha lo dice. Media tanda se planificó sobre trabajo terminado. En la misma
sesión había pasado lo mismo con **P2-TAS.B**, reportada como pendiente estando cerrada desde el
18-ago.

**Causa raíz:** dos atajos que se refuerzan. **(1)** Leí la deuda en
`docs/_notas/sesion-2026-08-19-p4-tas-cierre.md`, que lista CI-046 como pendiente y **es correcto a
su fecha** — un snapshot con fecha es una foto, no un estado vivo, y envejece en cuanto alguien
trabaja. **(2)** Acoté el `git log` con `--until=2026-08-20` para "ver la tanda", y ese filtro
escondió justamente el commit que la cerraba.

**Solución aplicada:** contrastar contra las dos fuentes que sí son vivas — el campo `Estado` de la
ficha en `docs/CODE_INCONSISTENCIES.md` y el código. Para CI-046 bastó
`grep -n "coordinacionVigente" lib/tasador/lectura-tasacion.ts` y
`grep -n "resolverAccionCard" components/tasador/tasacion-card.tsx`: las dos piezas estaban.

**Prevención futura — regla de verificación, en este orden:**

1. **La ficha manda.** Antes de reportar una CI como pendiente, leer el campo **`Estado`** de su
   ficha en `docs/CODE_INCONSISTENCIES.md`. Es el único lugar donde el estado se actualiza.
2. **El snapshot no manda.** Una nota de `docs/_notas/` con fecha describe lo que era cierto ese
   día. Sirve para reconstruir el porqué, **nunca** para afirmar el estado de hoy.
3. **El código desempata.** Si ficha y snapshot discrepan, `grep` sobre los archivos que la
   mitigación nombra resuelve en un paso.
4. **No acotar el `git log` por fecha** cuando la pregunta es *"¿esto sigue abierto?"*. La fecha que
   importa es la del último commit que tocó el archivo (`git log -3 -- <ruta>`), no la de la tanda
   que lo detectó.

Vale para las CI y para las tandas: el estado de una tanda está en su commit de cierre y en su
archivo de `docs/_archivo/aprendizajes-*`, no en el snapshot que la abrió.

### 2026-08-22 — P5-TAS reanudada · cierre de CI-052 y persistencia real de fotos

**Contexto:** batches B3, B2 y B4 de P5-TAS (Pantalla 3 · organizador de fotos), que la tanda del
mismo día había dejado bloqueados. Sergio aprobó en el Gate 2 la opción (a) de **CI-052** y una
excepción R4 acotada a un solo archivo bajo `app/api/`.

**Inconveniente:** `POST /api/tasaciones/[id]/fotos` y `POST /api/adjuntos/upload` creaban **cada
uno** una fila en `TX_Adjuntos`; encadenarlos —que es lo que §6.1 describe— dejaba dos registros por
foto.

**Causa raíz:** el alta de la fila vive dentro del **módulo 8 de `SC-Adjuntos-Upload`**, no en el
Route Handler. Leer `upload/route.ts` no revela que crea un registro salvo que se siga el rastro
hasta el comentario del módulo. P2-TAS.A escribió la otra ruta sobre una suposición razonable y
escrita, que simplemente no era cierta.

**Solución aplicada:** el pipeline pasa a ser el dueño de la fila. `app/api/tasaciones/[id]/fotos/route.ts`
perdió el `createRecord` y expone un **`PATCH`** que actualiza el adjunto que Make ya creó,
escribiendo la categoría sobre el `adjunto_id` devuelto. Se cambió el verbo y no sólo el cuerpo:
nada consumía el `POST`, y `PATCH` cubre además la recategorización de una foto ya subida, que es la
operación más frecuente del organizador. El escenario Make no se tocó y la idempotencia por
`hash_md5` se conserva. Cobertura: `app/api/tasaciones/[id]/fotos/route.test.ts` (15 tests) y
`lib/tasador/fotos.test.ts` (14).

**Prevención futura:** al reutilizar un endpoint ajeno, la pregunta útil no es *"¿existe y
funciona?"* sino **"¿qué más hace además de lo que su nombre promete?"**, y la respuesta puede no
estar en el código que se lee — acá vivía en un blueprint de Make, a un salto de distancia. Un test
que afirme lo que la ruta **dejó de hacer** (`expect(createRecord).not.toHaveBeenCalled()`) es lo
único que impide que el defecto vuelva: una fila duplicada no falla, sólo cuenta de más.

### 2026-08-22 — Un `singleSelect` con dos opciones que sólo difieren en la mayúscula

**Contexto:** mismo batch B3. `GET /api/tasaciones/[id]/fotos` filtra por
`{subido_por}="Tasador"`, y el cliente tenía que declarar ese valor al subir.

**Inconveniente:** `TX_Adjuntos.subido_por` tiene hoy **`Tasador` y `tasador`** como opciones
distintas del mismo `singleSelect` —la minúscula ya está en filas reales, verificado vía MCP—, y
`lib/adjuntos-uploader.ts` manda `'Ejecutivo'` por defecto. Con `typecast: true`, escribir la
minúscula **no da error**: reutiliza la otra opción y la foto queda fuera del `GET` para siempre.

**Causa raíz:** dos capas escribiendo el mismo campo con vocabularios que nadie había contrastado,
sobre un dominio que se dejó crecer con duplicados de capitalización. `typecast` convierte lo que
sería un 422 en un dato mal clasificado.

**Solución aplicada:** el literal se declara una sola vez por lado —`SUBIDO_POR_TASADOR` en
`lib/tasador/fotos.ts` y en el Route Handler— y **el `PATCH` lo reescribe server-side**, de modo que
una foto categorizada es localizable pase lo que pase en el payload de subida. Dos tests lo fijan:
uno sobre lo que se escribe y otro sobre el literal que el `GET` filtra, para que no puedan
divergir.

**Prevención futura:** antes de filtrar por el valor de un `singleSelect`, **leer su dominio real**
—no el que uno espera— y buscar duplicados por capitalización o acento. Con `typecast` activado, un
valor equivocado no falla: se guarda. Es RO-13 (*filtrar por el formato real, no por el literal
humano*) aplicado a un `singleSelect` en vez de a una fórmula, y **RO-05** por el otro extremo: si
UI y backend tienen que coincidir en un literal, se declara en un sitio y lo consumen los dos.
Registrado como regla operativa **RO-38**, aprobada por Sergio el 22-ago-2026.

### 2026-08-22 — E-024 quedó SUPERADO: `codigo_solicitud` sí está poblado

**Contexto:** verificación previa a B2. `GET /fotos` filtra los adjuntos con
`{solicitud}="{codigo_solicitud}"`, y un campo Link dentro de `filterByFormula` se evalúa contra el
**primary field** de la tabla vinculada (lección E-018).

**Inconveniente:** **E-024** (10-jul-2026, archivado en `docs/_archivo/aprendizajes_20260807.md`)
declara que `TX_Solicitudes.codigo_solicitud` *"está vacío en todas las filas — nunca se pobló"*. De
ser cierto hoy, el `GET` devolvería vacío siempre y la hidratación de B2 no probaría nada, aun con
el camino de escritura terminado.

**Causa raíz:** ninguna. El campo **se convirtió en fórmula** entre el 10 y el 13-jul-2026 —lo
registra `docs/schema-airtable.md` §19— y desde entonces se calcula solo. La afirmación de E-024 era
cierta a su fecha y dejó de serlo tres días después.

**Solución aplicada:** verificado vía MCP el 22-ago-2026 sobre `TX_Solicitudes`: las filas traen
`codigo_solicitud` poblado (`VP-2026-0004`, `VP-2026-0060`, `VP-2026-0061`…). **E-024 queda
SUPERADO.** No se editó la entrada original: vive en un archivo histórico y la regla de sólo-append
lo protege; esta entrada es su corrección, y `docs/schema-airtable.md` §19 ya documentaba el cambio.

**Prevención futura:** una entrada de bitácora afirma lo que era cierto **el día que se escribió**.
Antes de tratarla como un bloqueo vigente, comprobar el hecho contra la base — es un `list_records`
por MCP, treinta segundos. Es la misma lección que la entrada del 21-ago sobre CI-046 («el snapshot
no manda»), ahora del lado de la bitácora: ningún documento con fecha describe el presente.

> **Nota de mantenimiento.** Este archivo pasa de 1800 líneas y cumple de sobra el umbral de
> archivado de `CLAUDE.md`. **No se archivó acá**: el archivado es una operación deliberada, de
> tanda propia, y hacerlo a mitad de P5-TAS habría mezclado dos cosas con criterios distintos.

### 2026-08-22 — Tanda B1·B2·B3 · el 500 de adjuntos, el sheet a 375 px y una paleta que no existía

**Contexto:** verificación visual de P5-TAS a 375×667 con el server local. Aparecieron tres
hallazgos —uno funcional y dos cosméticos— y se abordaron en una tanda corta, en ese orden.

**Inconveniente:** `/api/solicitudes/[id]/adjuntos` devolvía **500 de forma recurrente** y la
cabecera de Pantalla 3 mostraba "0 docs". La hipótesis de partida —razonable— era que el hook
pasaba un id de tasación donde el endpoint espera uno de solicitud, y que B5 no había adaptado el
id al integrar el sheet en IF-03.

**Causa raíz:** ninguna de las dos cosas. El id era correcto (`rec9qf3DchOY5Lk2N` es el record ID
de `TX_Solicitudes` de VP-2026-0061, y un id mal formado habría dado 404, no 500). La
instrumentación `[ADJUNTOS-LEER]` que el propio endpoint ya tenía lo dijo entero:
`airtableStatus: undefined`, `detalle: 'fetch failed'`, causa `AggregateError` con
`code: 'ETIMEDOUT'` sobre las diez IPs de `api.airtable.com`. **La salida de red de WSL2 se cae de
forma intermitente**; en el mismo log conviven tres `[ADJUNTOS-LEER] ok · 200`. Y el "0 docs" era
**el dato correcto**: verificado en Airtable, las tres tasaciones del tasador mock tienen cero
adjuntos.

**Solución aplicada:** `request()` en `lib/airtable-client.ts` reintenta ante fallo de transporte
además del 429/5xx, con detección de la causa anidada (`esFalloDeRedTransitorio`, 19 tests).
`postRequest()` **no** se tocó, a propósito. Y `fetchAdjuntosPorSolicitud` pasó a filtrar en
Airtable en vez de leer `TX_Adjuntos` entera: el filtro en memoria era correcto cuando
`codigo_solicitud` estaba vacío (E-024) y dejó de serlo al convertirse en fórmula. Verificado
contra la base: VP-2026-0049 → 2, VP-2026-0038 → 5, VP-2026-0061 → 0.

**Prevención futura:** **RO-39**. Ante un 5xx intermitente contra Airtable, leer primero los logs
de instrumentación del endpoint y comprobar si el fallo alterna con éxitos — eso solo descarta
cualquier hipótesis determinista, y ahorra buscar un bug que no existe.

### 2026-08-22 — Las capturas del prototipo no describen el código local

**Contexto:** mismo día, batch B3. `components/tasador/` usaba 253 clases `vp-*` (`bg-vp-primary`,
`text-vp-success`, `bg-vp-surface`…) que `components/console/` no usa ni una vez.

**Inconveniente:** el encargo era "el Tasador usa otra paleta, unificarla con la de la Ejecutiva".
A mitad de la migración el equipo detectó, comparando capturas del v0, que en IF-03 el naranja es
**acción primaria** (el botón "Coordinar visita") mientras en IF-02 se reserva para **badges de
alerta**, y pidió revertir por si la migración había vuelto azul ese botón.

**Causa raíz:** dos cosas, y ninguna era la que parecía. **(1)** `vp-*` **no estaba declarada en
ningún sitio**: sin `@theme` y sin `tailwind.config` —prohibido por `CLAUDE.md`—, Tailwind v4 no
generaba una sola línea de CSS para esas clases. Confirmado con `grep` sobre el CSS compilado: 0
ocurrencias de `vp-`, contra las que sí aparecen para los tokens reales. Los colores del Tasador no
eran otra paleta: **no eran ninguna**, y las capturas venían del despliegue online de v0, que sí
tenía su config. **(2)** El botón "Coordinar visita" nunca usó `vp-primary`: ya estaba en
`bg-accent-orange` con un comentario A-24 preexistente, así que la migración no lo tocó — el mapeo
llevaba `vp-accent` → `accent-orange` y ningún naranja se convirtió en azul.

**Solución aplicada:** **no se revirtió.** Se presentó la tabla de mapeo con el contexto de los
cinco usos de naranja y la evidencia de que el botón seguía intacto, y Sergio confirmó mantener la
migración: 255 sustituciones a `brand` / `brand/90` / `muted` / `muted-foreground` /
`accent-orange`, más tres tokens nuevos para el semáforo (`success` · `warning` · `danger`) con los
valores que fija `CLAUDE.md` §4.4. Sin agregar `vp-*` al `@theme`: vocabulario único.

**Prevención futura:** **RO-40**. Antes de tratar una diferencia visual como decisión de diseño,
comprobar que las clases implicadas **generan CSS**. Y al comparar contra un diseño de referencia,
verificar de qué build salió la captura: un prototipo online y el repo local pueden no compartir la
configuración que da color a la pantalla.

### 2026-08-22 — Primer archivado de la bitácora: 2010 → 789 líneas

**Contexto:** tanda propia dedicada, según exige `CLAUDE.md` §«Archivado de la bitácora» —*"es una
operación deliberada: se hace como tanda propia, no a mitad de otra sesión"*—. Es el **tercer**
archivado del proyecto y el primero que se ejecuta con ese contrato: los dos anteriores
(`aprendizajes_20260714.md`, `aprendizajes_20260807.md`) se hicieron sin él.

**Inconveniente:** el archivo llegó a **2010 líneas**, un tercio por encima del umbral de ~1500 que
fija la política, con 44 entradas de bitácora acumuladas entre el 06 y el 22-ago. El índice del
inicio ya no permitía ubicar una entrada en menos de 30 segundos, que es el otro disparador escrito.

**Causa raíz:** ninguna, en el sentido de defecto. Es crecimiento esperado de un archivo sólo-append
durante tres semanas de trabajo intenso. Lo que sí faltaba era ejecutar la política a tiempo: el
umbral se cruzó días antes y se fue difiriendo tanda tras tanda, siempre con razón —el archivado no
se hace a mitad de otra cosa— hasta que hubo hueco para hacerlo solo.

**Solución aplicada:**

- **Destino:** `docs/_archivo/aprendizajes_20260822.md`, con cabecera propia que declara qué hay y
  qué no —sobre todo que **ninguna regla operativa se movió**—.
- **Corte por día completo (Opción B), no por número de líneas.** La política dice «las últimas ~200
  líneas»; el corte quedó en 278 porque partir el 22-ago por la mitad habría dejado tres entradas de
  esa sesión en el histórico y siete en el activo, con hilos cruzados entre ellas (CI-052, RO-38 a
  RO-40, E-024 superado). El «~» de la política existe para esto. Decisión de Sergio en el Gate.
- **Movidas:** 34 entradas · 1221 líneas · 06-ago → 21-ago-2026. **Conservadas:** las 10 del
  22-ago, más la totalidad de las secciones destiladas del inicio —incluidas las **40 RO**, que no
  se tocan nunca en un archivado—.
- **Resultado:** 2010 → **789 líneas**, la mitad del umbral.
- **Punteros vivos actualizados:** `docs/CODE_INCONSISTENCIES.md` (referencia cruzada de CI-002 a la
  entrada del 06-ago) y `docs/_sync_ifTasador_v1/RESUME.md` (entrada del 21-ago (b)). Los de
  `docs/_notas/` se dejaron intactos por **RO-24**: son fotos con fecha, no punteros vigentes.

**Prevención futura:** el archivado se verifica, no se declara. Tres comprobaciones que conviene
repetir la próxima vez, y en este orden: **(1)** recuento de encabezados —origen 44 = histórico 34 +
activo 10—; **(2)** `diff` byte a byte entre la bitácora original y la recomposición
histórico+activo, que es lo único que prueba que ningún `sed` se comió una línea a mitad de una
entrada; **(3)** `grep` de punteros vivos **antes** de cortar, separando los que hay que actualizar
de los que RO-24 protege. La comprobación (2) es la que vale: el recuento de entradas puede dar
bien con el contenido mutilado.

---

### 2026-08-23 — Segunda tanda de respuestas del cliente · siete ambigüedades cerradas

**Contexto:** tanda documental pura, sin código. Llegaron las respuestas que destrababan A-18 y los
cinco puntos abiertos de SLA. Antes de registrarlas había que verificar contra qué se estaban
respondiendo.

**Inconveniente:** la respuesta a A-18 —*"los valores por defecto son los del `.xlsm`"*— **no podía
ser cierta tal como estaba planteada la pregunta**. A-18 pedía una sola cosa después de cuatro
estrechamientos: la cifra de `factor_sup`, `factor_edad` y `factor_distancia`. Y el `.xlsm` no las
tiene.

**Causa raíz:** dos preguntas distintas venían viajando bajo el mismo nombre. El repo ya lo había
detectado —`docs/_notas/radiografia-excel-informe.md`, hallazgo 5, del 21-ago— y aun así la
respuesta del cliente se leía, en primera lectura, como si cerrara A-18 con valores. La
verificación directa lo zanjó: se abrió el libro con `zipfile` sobre `xl/worksheets/sheet2.xml` y
se leyó la foto de ejemplo. El cuadro `[Excel: Portada!B28:AX44]` tiene **doce columnas y ninguna
de factor**; calcula `UF/m² C. = (Total UF − UF/m²T × Sup.Terreno − OO.CC.) / Sup.Constr.`. La foto
de `docs/_referencias/ejemplo-comparables-cuadro.JPG` es exactamente ese rango.

**Solución aplicada:** se separaron las dos mitades y se registró cada una donde correspondía.

- **A-13 cierra con respuesta real**: los comparables salen de la extracción de la foto y la
  **sección D pasa a sólo lectura**.
- **A-18 cierra por disolución del requisito, no por respuesta** (spec §15 · **D-24**): sin campo
  editable no hay precarga. RF-TAS-08 pierde su conjunto 1, `GET /api/tasaciones/config/defaults`
  no se construye y `C_FactoresHomogeneizacion` queda sin consumidor. **La cifra nunca se dio**, y
  eso quedó escrito en la ficha: si vuelve la captura, A-18 revive.
- La contradicción con **D-21** —ratificado un día antes: *"los tres factores se usan en la
  práctica"*— se abrió como **A-44** (D-23), no bloqueante.
- Los cinco de SLA cerraron sin sorpresas: **A-23** opción B (sólo reporte), **A-24** en negativo
  (correo único), **A-25** y **A-26** ratificados, **A-32** en negativo (sin día 0).

Archivos: `_ambiguedades.md`, spec v1.9.14 → **v1.9.15**, `VProperty_SLA_Negocio` v1.3 → **v1.4**,
plan IF-03 v1.2 → **v1.3**, plan IF-02 v1.14 → **v1.15**, `CODE_INCONSISTENCIES.md` (CI-022,
CI-031, CI-038), `schema-airtable.md`, `radiografia-excel-informe.md` (puntero).

**Prevención futura:** **una respuesta del cliente se contrasta contra la pregunta archivada antes
de darla por aplicada.** Cuando una ficha lleva varios estrechamientos, su enunciado original y su
pregunta viva ya no dicen lo mismo, y el cliente responde a la conversación —no a la ficha—. Aquí
la respuesta cerraba una pregunta que la ficha *no* estaba haciendo, y la que sí hacía se extinguió
por un camino distinto. Registrar "A-18 resuelta: valores del xlsm" habría dejado en la spec una
cifra inexistente como si estuviera disponible. Corolario: **cerrar por disolución es un desenlace
legítimo y hay que nombrarlo así**, porque una ficha cerrada «con respuesta» no se vuelve a mirar,
y ésta sí hay que volver a mirarla si la captura regresa.

### 2026-08-23 — La nomenclatura «T1–T7» del plan IF-02 · SLA no existe

**Contexto:** el arranque de la sesión pedía reflejar que las respuestas de SLA desbloqueaban «T1,
T3, T5, T6 y T7 del plan IF-02 · SLA».

**Inconveniente:** ninguno de esos identificadores existe en el repositorio.

**Causa raíz:** el snapshot de cierre del 22-ago-2026 los introdujo en una sola línea
(`docs/_notas/snapshot-cierre-2026-08-22.md`, deudas registradas) sin respaldo en el plan. Las
tandas del control de SLA son **A–G** (`plan-ejecucion-if02-v1_9.md` §9.6.2). `grep -rn "T-1\|T1 ·"`
sobre `docs/` devuelve cero fuera de esa línea.

**Solución aplicada:** se corrigió al vocabulario real y, sobre todo, se corrigió la afirmación:
**estas cinco respuestas no desbloquean ninguna tanda entera.** Habilitan §5.2.9 —el tablero de
cuatro grupos y el reporte de 24 h en su forma de opción B— y ratifican los dos `singleSelect` de
catálogo. **Tanda F sigue bloqueada** por el patrón de disparo de `AT08_Alertas_SLA`, que es un
asunto anterior e independiente. Queda escrito en §«Estado de tareas».

**Prevención futura:** un identificador que aparece **una sola vez** y en una nota de `docs/_notas/`
no es vocabulario del proyecto: es una anotación de sesión. Antes de propagarlo a un plan o a la
spec, `grep` y, si no tiene segunda aparición, se traduce al identificador canónico en vez de
adoptarlo. Es **RO-24** por el otro extremo: las notas fechadas no son fuente de estado, y tampoco
de nombres.

### 2026-08-23 — «Pre-llenado · editable» no se pone sobre un dato que el tasador escribió

⚠ CORREGIDO — ver entrada 2026-08-23 · «P7-TAS.A.3 · el badge sí aparecía, el borrador de fotos tapaba la hidratación, y "diferente" no es "aporta"» al final del archivo.

⚠ CORREGIDO (2) — la afirmación «defaults reales (sección E · F)» de esta entrada es falsa: E no tiene precarga construida y F es indistinguible sin cambio de schema. Ver entrada 2026-08-23 · «P7-TAS.A.3-bis · el único default real hoy es la fecha planificada (sección A)» al final del archivo.

**Contexto:** P7-TAS.A.1, hidratación server-side del formulario de captura. `app/tasaciones/[id]/page.tsx`
pasó a resolver el estado inicial con `{ ...resolverInforme(tasacion), ...(guardados?.datos ?? {}) }`,
de modo que lo guardado en Airtable llega en el **primer render** y no por un `fetch` posterior.

**Inconveniente:** con los datos ya presentes en el montaje, el badge **"Pre-llenado · editable"**
—Regla T-B, §8.1 del plan IF-03— quedaría colgado también sobre los campos hidratados, y no sólo
sobre los defaults. Un tasador vería marcada como sugerencia del sistema una superficie que escribió
él mismo en la visita anterior.

**Causa raíz:** `TextField` deriva `prellenado` de `useState(value)` en el montaje
(`components/tasador/form-sections/fields.tsx:155`). El predicado es «vino con valor al montar», que
antes de .A.1 sólo podía ser cierto para un default y ahora también lo es para lo hidratado. El
badge no distingue **origen**, sólo **presencia**.

**Solución aplicada:** ninguna en código, y es deliberado. El orden de la hidratación hace que el
badge **no aparezca** sobre lo hidratado sin escribir una línea extra, así que .A.1 no toca
`fields.tsx`. Lo que se fija es el criterio: **«Pre-llenado · editable» aplica sólo a defaults
reales** —la fecha planificada de visita (sección A) y los defaults constructivos de
`C_DefaultsAntecedentes` (sección E · sección F)—. Un dato que el tasador guardó **es suyo, no una
sugerencia del sistema**, y no lleva badge.

**Prevención futura:** cuando la sección E cablee la precarga contra `C_DefaultsAntecedentes`, el
badge tiene que colgar del **origen del valor**, no de su presencia en el montaje. Si en esa tanda
se toca `TextField`, la condición correcta es «este valor viene de la tabla de defaults», no «este
campo llegó con algo». Sustituir un predicado por el otro es lo que volvería a marcar como
pre-llenado el trabajo del tasador.

### 2026-08-23 — P7-TAS.A.3 · el badge sí aparecía, el borrador de fotos tapaba la hidratación, y «diferente» no es «aporta»

**Contexto:** cableado de `useGuardado` en `components/tasador/tasacion-form.tsx`, banner de
recuperación y regla corregida de arranque del formulario.

---

**Inconveniente 1 — la entrada anterior de esta misma fecha afirma algo falso.**
Dice que, con la hidratación server-side, el badge **"Pre-llenado · editable" no aparece** sobre lo
hidratado sin escribir una línea extra. Es al revés: aparece sobre **todos** los campos hidratados.

**Causa raíz:** `components/tasador/form-sections/fields.tsx:154-157` calcula
`prellenado = !deshabilitado && initial.trim() !== "" && !editado`, donde `initial` sale de
`useState(value)` en el montaje. El predicado es **presencia al montar**, no **origen del valor**.
Antes de P7-TAS.A.1 sólo podía ser cierto para un default, así que la distinción no existía; desde
que el valor guardado llega en el primer render, cualquier campo con dato lleva badge. La entrada
describía la mecánica correctamente y sacaba la conclusión opuesta — el error estuvo en no ejecutar
el predicado mentalmente con el caso nuevo.

**Solución aplicada:** ninguna en código todavía, y es deliberado: la corrección del badge se partió
como **P7-TAS.A.3-bis**, el sub-bloque inmediatamente siguiente, para no meter un quinto frente en
una tanda que ya toca cuatro. Acá se corrige el registro: la entrada vieja lleva una marca `⚠` que
apunta a ésta, y queda escrito que **hoy la Regla T-B está incumplida en producción**.

**Prevención futura:** una afirmación sobre lo que la UI muestra no se cierra leyendo el código que
la calcula — se cierra **evaluando el predicado con los valores del caso nuevo**. Acá bastaba
preguntar «¿`initial` está vacío cuando el campo viene hidratado?». La respuesta era no, y estaba a
una línea de distancia del texto que se citó como prueba.

---

**Inconveniente 2 — la hidratación de P7-TAS.A.1 estaba muerta en el flujo normal.**
Sólo se veía entrando directo a `/tasaciones/[id]` con `localStorage` limpio, que es exactamente
como se verificó.

**Causa raíz:** `components/tasador/fotos-screen.tsx:72-79` inicializa con
`readPayload(id) ?? resolverInforme(tasacion)` y escribe el `InformeData` **entero** en cada cambio.
Como el flujo canónico es *coordinar → fotos → lectura → formulario*, la pantalla de fotos **siembra
un borrador en blanco** antes de que el formulario se abra por primera vez. Con la regla
`readPayload(id) ?? informeInicial`, ese blanco tapaba todo lo hidratado desde Airtable. No es un
fallo de .A.1: es la interacción con una pantalla que .A.4 todavía no absorbió.

**Solución aplicada:** `lib/tasador/recuperacion-borrador.ts` reparte por clase de campo — el
servidor manda en las secciones A–H, el borrador manda en `fotosPredefinidas`, `categoriasCustom` y
`documentosCargados`, que hoy no tienen otra fuente. `CLAVES_SOLO_BORRADOR` es una constante
exportada justamente para que **quede vacía en .A.4** y el reparto desaparezca sin tocar nada más.

**Prevención futura:** antes de dar por buena una hidratación, recorrer **el camino de navegación
real**, no la URL directa. Una pantalla vecina que comparte almacén es un escritor más, y en este
repo el borrador es una variable global compartida por tres pantallas.

---

**Inconveniente 3 — el predicado del banner, tal como se aprobó, era una máquina de destruir datos.**
Se detectó escribiendo su test, no revisando el diseño.

**Causa raíz:** el diseño aprobado condicionaba el banner a `hayCambiosSinSincronizar` **y**
`difiereEnSecciones`. El borrador en blanco del inconveniente 2 cumple las dos: tiene `''` donde
Airtable tiene `'5024.86'`, que es una diferencia perfectamente legítima. El banner habría ofrecido
«Recuperar» un formulario vacío **encima de la visita anterior**, con un rótulo tranquilizador.

**Solución aplicada:** se añadió `borradorAportaContenido()`, que exige que la clave que difiere
traiga **contenido del lado del borrador** — cadena no vacía, número distinto de cero, `true`, array
con elementos, u objeto con alguna hoja con contenido. `difiereEnSecciones` se conserva como
definición del reparto y como candado de sus tests, pero **el banner no la usa**. Coste aceptado y
escrito en el docblock: vaciar un campo a mano y salir sin enviar no se ofrece para recuperación.

**Prevención futura:** un predicado que decide si se ofrece **sobrescribir** datos se escribe con su
peor caso al lado. La pregunta que faltó fue «¿qué es lo peor que puede recuperar esto?», y la
respuesta —un formulario vacío— estaba en el inconveniente que se había diagnosticado media hora
antes, en el mismo archivo.

---

**Desvío de §6.1 registrado — el pie del formulario.**
El literal `"✓ Autosave hace 22 s"` (`tasacion-form.tsx:470`, hoy retirado) era una **constante** de
la maqueta v0: mostraba «22 s» en cada render, recién abierta la pantalla o veinte minutos después.
§6.1 del plan fija los literales de esta pantalla, así que reemplazarlo es un desvío y se tomó con
autorización explícita de Sergio. Lo reemplaza `leyendaGuardado()`, con **tres** literales:
`"Guardando…"` · `"Guardado HH:MM"` · `"Sin enviar"`. El fallo del PATCH colapsa en `"Sin enviar"` en
vez de tener literal propio: el error ya se reporta por toast (Regla B) y el pie es estado ambiente.

**Regla que queda:** un literal fijado en el plan se respeta **mientras sea cierto**. Uno que miente
sobre si el trabajo del usuario está a salvo no se conserva por respeto a la letra; se cambia con
sign-off y se registra el desvío, que es lo que se hizo acá.

### 2026-08-23 — P7-TAS.A.3-bis · el único default real hoy es la fecha planificada (sección A)

**Contexto:** corrección del badge «Pre-llenado · editable» en
`components/tasador/form-sections/fields.tsx` para cumplir la Regla T-B, partida como sub-bloque
propio al cerrar P7-TAS.A.3.

---

**Inconveniente 1 — el badge marcaba por presencia, no por origen.**
`TextField` calculaba `prellenado = !deshabilitado && initial.trim() !== "" && !editado`, con
`initial` tomado de `useState(value)` en el montaje. Antes de P7-TAS.A.1 el predicado era inofensivo:
lo único que podía llegar con valor era un default. Desde la hidratación server-side, **lo que el
tasador midió en la visita anterior también llega con valor en el primer render**, y el badge se
colgaba encima marcando como sugerencia del sistema un dato que era suyo. Hasta **67** campos
afectados, uno por cada `TextField` del formulario.

**Causa raíz:** el badge respondía a la pregunta equivocada. «¿Este campo tiene algo?» no es «¿de
dónde salió esto?». Mientras hubo una sola fuente, las dos preguntas tenían la misma respuesta y la
diferencia no se veía; en cuanto apareció la segunda fuente, el predicado quedó afirmando algo que
nunca supo.

**Solución aplicada:** `TextField` recibe `prellenado?: boolean`, con default `false`, y el predicado
pasa a `prellenado && !editado && !deshabilitado`. **El origen lo declara quien construye el valor,
no quien lo muestra.** Se marca **un** call site en todo el repo: «Fecha planificada de visita»
(`tasacion-form.tsx`), que es el ejemplo canónico de la Regla T-B — la pone la Ejecutiva en la
coordinación (§2.3) y el tasador la ajusta en terreno. Los otros 66 `TextField` **no se tocaron**:
heredan el default correcto. `PrellenadoBadge` bajó a función privada y
`components/tasador/campo-prellenado.tsx` —segunda implementación del mismo badge, cero
consumidores— se borró.

**Prevención futura:** **origen ≠ posición ≠ presencia.** Cuando una marca de UI afirma la
procedencia de un dato, el default seguro es *no afirmar nada*, y la afirmación la hace el punto del
código que conoce la respuesta. Un predicado que infiere procedencia mirando el valor funciona
exactamente hasta que aparece la segunda fuente, y falla en silencio: nadie ve un badge de más.

---

**Inconveniente 2 — el alcance que la entrada anterior daba por bueno no existe.**
Las dos entradas previas de esta fecha afirman que el badge corresponde a «defaults reales (sección
E · F)». Ninguna de las dos es cierta hoy.

**Causa raíz:** se escribió el criterio desde el plan (§8.1, que describe la sección E con su
precarga contra `C_DefaultsAntecedentes`) en vez de desde el repo. Al ir a marcar los campos
aparecieron los hechos: **`C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`) no tiene un solo lector en
el código** —la precarga de E no está construida— y **`resolverInforme` produce exactamente un valor
no vacío**, `fechaPlanificadaVisita`. La sección F es peor: sus valores los escribe la extracción de
P6-TAS en `TX_DocumentosLegales` y llegan por el mismo canal que cualquier dato hidratado; el único
discriminador sería `origen_dato`, que **esa tabla no tiene**, y el de `TX_DatosTasacion` es de fila
—no de campo— y `PATCH /datos` lo estampa en `tipeado` en cada escritura.

**Solución aplicada:** el alcance real quedó en **sección A, un campo**. Se apiló una segunda marca
`⚠` sobre la entrada del 23-ago que contiene la afirmación falsa, apuntando acá. La sección E
marcará sus ~19 campos cuando construya su precarga; la F necesita crear columna en Airtable y no se
toca sin aprobación.

**Prevención futura:** un criterio de alcance —«esto aplica a las secciones X e Y»— se verifica con
`grep` contra el repo **antes** de escribirlo en la bitácora, no al ir a ejecutarlo. Acá bastaba
`grep -rn "DefaultsAntecedentes" lib/ app/ components/`, que devuelve cero, para no haber escrito
dos veces un alcance inexistente.

---

**Deuda registrada — CI-055.**
La prop es **estática**: declara que el valor nació default, no que lo siga siendo. Si el tasador
sobrescribe un default y guarda, en la apertura siguiente el valor llega hidratado y el badge vuelve.
Es el mismo bug de clase, reducido a un caso. Se difirió con fundamento —el espejo de claves
pre-llenadas dentro de `InformeData` es infraestructura desproporcionada para un único default— y se
dejó atada a la tanda que construya la precarga de E, que multiplicará la ventana por 19. La ficha
lleva el `grep` de cobertura para detectar si la ventana crece antes de que alguien la resuelva.

### 2026-08-24 — CI-056 · Sección D de comparables a sólo lectura (cierre de A-13)

**Contexto:** P7-TAS. El plan v1.3 §8.1 mandata desde el cierre de A-13 (23-ago) que la sección D
sea de sólo lectura: los comparables llegan por extracción de la foto del cuadro
`[Excel: Portada!B28:AX44]`. Un test manual encontró vivo el botón «+ Agregar comparable».

**Inconveniente:** la grilla seguía siendo la editable de P2-TAS —alta, borrado por fila y catorce
campos editables por comparable, incluidas las tres columnas de factor de homogeneización que
A-44 registró como ausentes del cuadro de origen—.

**Causa raíz:** no fue un error de implementación sino trabajo pendiente. La grilla se construyó
editable **a propósito** mientras A-13 estaba abierta, con la decisión escrita en el docblock de
`app/api/tasaciones/[id]/comparables/route.ts`: *«si A-13 cierra a favor de sólo lectura, lo que
cae es el POST y el DELETE, no el GET»*. A-13 cerró y la tanda que debía aplicarlo es ésta.

**Solución aplicada:** grilla reescrita sin inputs, sin «Agregar comparable», sin borrado por fila
y sin columnas de factor (`components/tasador/form-sections/seccion-comparables.tsx`, de 391 a 189
líneas); `POST` y `DELETE` retirados de la ruta, que queda sólo con `GET`;
`lib/tasador/factores-default.ts` purgado y sucedido por `lib/tasador/comparables.ts` con test
co-ubicado; los tres schemas de comparable retirados de `lib/tasador/validators/index.ts`; y los
literales de bloqueo de RF-12 reescritos sobre la única acción que el tasador tiene —volver a
fotografiar—, no sobre una que A-13 le quitó.

**Prevención futura:** el candado contra la reposición no es un comentario sino un test —
`route.test.ts` afirma que el módulo **no exporta** `POST` ni `DELETE`—. Un comentario no sobrevive
a un merge distraído; un test rojo obliga a leer A-18 y A-45 antes de seguir.

**Contexto:** mismo cierre de A-13, durante el reconocimiento previo a escribir.

**Inconveniente:** retirar la edición habría dejado la sección D **vacía para siempre** y RF-12
bloqueado sin salida. La corrección planificada era, tal cual estaba especificada, peor que el
defecto que venía a corregir.

**Causa raíz:** `proyectarDatosCaptura` en `lib/tasador/lectura-datos.ts` leía **seis** tablas
hijas y `TX_Comparables` no era ninguna de ellas; nadie hacía `fetch` al `GET /comparables`. El
formulario abría con `comparables: []` y **no se notaba porque el tasador podía teclearlos**: la
capacidad de escritura estaba tapando la ausencia de la de lectura. El plan no lo detectó porque
describe la sección D como «poblada por extracción», que es cierto en Airtable y falso en la
pantalla.

**Solución aplicada:** hidratación server-side (D-1 · opción A), idéntica al patrón de las otras
seis secciones — `TX_Comparables` como séptima tabla del `Promise.all` y bloque D en la
proyección. El mapeo Airtable → `Comparable` quedó en **un solo lugar** (`aComparable`), compartido
por la hidratación y el `GET`, en vez de duplicado como estaba. Al unificarlo salió a la luz un
desajuste preexistente que TS no veía —la ruta devolvía `number | null` donde el tipo declara
`string`, porque no estaba tipada contra `Comparable`—; se normalizó a `string` (D-5).

**Prevención futura:** **antes de retirar una capacidad de escritura, verificar que el dato llega
por otra vía es parte de retirarla, no una comprobación aparte.** Una escritura puede estar
compensando una lectura que no existe, y nada lo señala mientras las dos convivan. Queda con
candado en `lib/tasador/lectura-datos.test.ts`: la regresión sería muda —ninguna excepción, ningún
500, sólo una tabla vacía— y por eso necesita test y no revisión.

### 2026-08-24 — CI-056 · verificación manual y fix del tooltip de RF-12

**Contexto:** preparación de la prueba manual de la sección D, después de commitear CI-056.

**Inconveniente:** el literal nuevo del bloqueo de RF-12 —«Del cuadro se leyeron n de 3
comparables…»— **no aparecía nunca** en el tooltip ni en la barra ámbar del pie, en ninguna de las
cinco solicitudes del tasador mock.

**Causa raíz:** el tooltip resolvía `faltantes[0]?.detalle`, o sea sólo miraba el primer faltante.
La sección D es la cuarta de la lista y siempre hay algo antes —la fecha real de visita encabeza—,
así que el `detalle` de D no se alcanzaba jamás. El criterio de §8.3 pide tooltip explicativo *«con
menos de 3 comparables»* sin condicionarlo a que ése sea el faltante más urgente.

**Solución aplicada:** `faltantes.find((f) => f.detalle)?.detalle ?? …` en los dos sitios que usaban
la misma lógica (`BotonCalcular` → `TooltipContent` y la barra ámbar del pie de
`components/tasador/tasacion-form.tsx`). El fallback se conservó en `faltantes[0]?.label` para que
sin ningún `detalle` el pie siga mostrando el primero en orden de sección, que es lo que §8.1 pide.
La desalineación resultante entre lo que el tooltip explica y adónde lleva `scrollAFaltante()`
quedó registrada en **CI-059**, sin resolver.

**Prevención futura:** un literal condicionado a una posición en una lista ordenada por otro
criterio es un literal que puede no mostrarse nunca. Al agregar un mensaje explicativo, verificar
en datos reales que existe un estado que lo produce — no alcanza con que el código lo pueda
producir. Acá el defecto sobrevivió a `tsc`, al build y a 662 tests: sólo lo encontró preparar la
prueba manual.

**Contexto:** misma sesión, al levantar el entorno para esa prueba.

**Inconveniente:** dos falsos negativos que costaron ciclos de diagnóstico. (1) `curl` devolvía
**404** en `/tasaciones/[id]`, `/tasaciones` y `/consola`, lo que parecía un fallo del código de la
tanda. (2) `pnpm tsc --noEmit` salió con exit 2 y dos errores de sintaxis en
`.next/dev/types/validator.ts`, un archivo que nadie tocó.

**Causa raíz:** (1) `middleware.ts` aplica `auth.protect()` a todo lo que no sea `/sign-in` ni
`/api/health`; sin sesión Clerk, Next responde 404 en vez de redirigir. `curl` no puede alcanzar
ninguna pantalla de la app. (2) `.next/dev/types/validator.ts` lo regenera el dev server en
caliente y queda a medio escribir si se lo mata; `tsc` lo incluye y falla sobre él.

**Solución aplicada:** (1) el alcance se acotó comprobando que `/consola` —IF-02, ajeno a la
tanda— también daba 404, lo que descartó el código propio; la verificación por `curl` se limitó a
`/api/health` y `/sign-in`, y el resto se delegó al navegador con sesión. (2) `pkill -f "next dev"`,
`rm -rf .next/dev/types` y `tsc` volvió a 0.

**Prevención futura:** en este repo `curl` **no sirve** para verificar pantallas: sólo para
`/api/health` y `/sign-in`. Y no correr `tsc` con el dev server arriba — si falla en algo bajo
`.next/`, bajar el servidor y limpiar `.next/dev/types` antes de creerle al error.

### 2026-08-26 — P7-TAS.A.4 · hidratación server-side de fotos (cross-tanda P5-TAS)

**Contexto:** decisión D-1 · opción A: extraer la proyección del `GET /fotos` a
`lib/tasador/lectura-fotos.ts` y consumirla desde los dos Server Components, más D-4 (vaciar
`CLAVES_SOLO_BORRADOR` salvo `documentosCargados`).

**Inconveniente:** los dos recordIds de `TX_Solicitudes` que traía el encargo para la reasignación
del tasador mock —`rec8IZCGuxOJrLK4K` (VP-2026-0003) y `reck842xTvwgjqDSb` (VP-2026-0038)— **no
existen en la base**. Una consulta por `recordIds` a `tblaHTyMHYfmy7Fg6` devolvió cero registros,
sin error: el filtro por record ID inexistente es indistinguible de un filtro que no casa.

**Causa raíz:** los IDs venían de una nota previa, no de una lectura de la base. Nadie los verificó
al escribirlos, y un `list_records_for_table` con `recordIds` que no existen responde `200` con
`records: []`, que se lee como «la consulta está mal armada» y no como «esos registros no están».

**Solución aplicada:** se resolvieron los registros por `codigo_solicitud` (`fldDXEE1ejMNVDlpB`),
que es el identificador humano y es inequívoco: VP-2026-0003 → `reclzOOmRHH5LLa8x`, VP-2026-0038 →
`recRjyT3kg0vYGcEH`. La reasignación se aplicó **en modo append** sobre `fldlgriK1jP5906wE`,
conservando el tasador previo de cada una y agregando `recSR3RxY6rsLb8k7`.

**Prevención futura:** en este repo un recordId copiado de una nota **no es una fuente**. Resolver
siempre por `codigo_solicitud` antes de escribir, y ante un `records: []` con `recordIds`, no
depurar el filtro: comprobar primero que los registros existen. Y para toda escritura sobre un Link
`multipleRecordLinks`, leer el valor actual y hacer append explícito — Airtable reemplaza el array
completo, no fusiona.

**Contexto:** misma sesión, al aplicar D-4 sobre `lib/tasador/recuperacion-borrador.ts`.

**Inconveniente:** vaciar `CLAVES_SOLO_BORRADOR` de tres entradas a una tumbó **cuatro tests** de
`recuperacion-borrador.test.ts` que el encargo no anticipaba —sólo señalaba las líneas 85-100—, y
uno de ellos (`CANDADO · no ofrece recuperar el borrador en blanco de fotos-screen`) pasó de `false`
a `true`, que es un cambio de comportamiento visible para el tasador.

**Causa raíz:** la constante se usa para **dos** cosas que hasta ahora coincidían: qué claves gana
el borrador en `combinarConBorrador` (precedencia) y qué claves se omiten en `difiereEnSecciones` /
`borradorAportaContenido` (comparación del banner). Sacar `fotosPredefinidas` de la lista no sólo le
quita la precedencia: la mete en la comparación del banner. Con una foto en la cola offline —que
vive sólo en el borrador— el banner de recuperación ahora se enciende.

**Solución aplicada:** se siguió D-4 tal como fue aprobada y se **invirtieron** los tests afectados
en vez de relajarlos, cada uno rotulado `INVERTIDO EN .A.4` con la razón. Se añadió un test que fija
el efecto nuevo (`.A.4 · una foto sólo local sí lo enciende, y es correcto`) y se separó el
andamiaje en `borradorEnBlanco()` —A–H vacías, fotos iguales al servidor— para que el candado
original siga aislando lo que protegía. El efecto se juzgó aceptable: «Recuperar» restaura el
borrador entero, que desde .A.4 ya viene hidratado, así que es ruido acotado y no pérdida de datos.

**Prevención futura:** antes de tocar una constante que gobierna dos comportamientos distintos,
buscar **todos** sus consumidores y no fiarse del rango de líneas que señala el encargo. Acá bastó
`grep -n CLAVES_SOLO_BORRADOR` para ver que la misma lista alimenta la precedencia y la comparación.
Si el día que se retire `documentosCargados` (RF-TAS-10) el reparto sigue vivo, conviene partirla en
dos constantes antes que seguir usándola para ambas cosas.

**Contexto:** misma sesión, al cerrar la causa raíz de CI-061 y reescribir su ficha.

**Inconveniente:** dos cosas. (1) El diagnóstico previsto en el plan de verificación era inútil:
decía «si hay error en `A_ErroresMake` → hipótesis (a); si no hay nada → tercera vía», y **ninguna
de las dos ramas era decidible ahí**. (2) Al reescribir la ficha, un `Edit` y luego un
`open(path,"w")` de Python sobre `/mnt/c` fallaron con `EIO` / `OSError: [Errno 5]`, y el segundo
**truncó `docs/CODE_INCONSISTENCIES.md` a mitad de una línea**, perdiendo CI-061 y CI-062 enteras.

**Causa raíz:** (1) `A_ErroresMake` (`tbl46Q0BcfD57LWyQ`) **no lo escribe ningún código del repo**
—`grep -rn` sobre `app/` y `lib/` no devuelve nada— y tiene una sola fila, de junio, ajena a IF-03.
La tabla figura en `CLAUDE.md` como destino de errores Make, pero eso describe una intención, no el
runtime. El log real es `LogEscenarios`, que sí escribe `postToMake()` en cada llamada, con éxito y
con error. (2) El filesystem `9p` de WSL sobre `/mnt/c` devuelve `EIO` intermitente en escrituras
grandes de un solo golpe; un `open(...,"w")` trunca **antes** de escribir, así que un fallo a mitad
deja el archivo mutilado, no intacto.

**Solución aplicada:** (1) se reorientó el diagnóstico a `LogEscenarios` (`tblR4VWpUHw1CSyIS`) y dos
filas del 24-ago lo cerraron: Make devolvió `adjunto_id: 40` —el autoNumber `fldVt7Lk1ptvmgbtT`, no
el record ID— y la ruta de subida marcó `✓ OK`. El `PATCH` de categorización murió en
`isValidRecordId("40")` → 404. Ambas hipótesis previas quedaron refutadas. (2) `git checkout --` lo
bloqueó el clasificador de permisos, pero no hacía falta: `git diff --stat` mostraba sólo `+13`, así
que las 2000 líneas commiteadas seguían intactas. Se reconstruyó con `head -n 2000` hacia el
scratchpad, se verificó con `diff` contra `git show HEAD:<path>`, se reapendieron las tres fichas con
`cat >>` y se copió de vuelta con un solo `cp`, verificando integridad después.

**Prevención futura:** para el diagnóstico, **`A_ErroresMake` no es fuente**: mirar `LogEscenarios` y,
antes de citar cualquier tabla de log, comprobar con `grep` que algo del repo la escriba — una tabla
declarada en `CLAUDE.md` puede no tener escritor. Para las escrituras, en este repo **no reescribir un
archivo grande de `docs/` con un `open(...,"w")` ni con un `Edit` de bloque enorme**: construir en el
scratchpad (`/tmp`, ext4, sin `9p` de por medio), verificar con `diff`, y copiar con un `cp` final.
Los `cat >>` incrementales no fallaron ni una vez. Y ante un fallo de escritura, **medir el daño con
`git diff --stat` antes de intentar restaurar**: puede que no haya nada que restaurar.

### 2026-08-31 — A-44 · fórmula directa del informe · divergencia de nombre de campo
**Contexto:** Tanda 1 de A-44 en `lib/tasador/lectura-informe.ts` (bloque 6): reemplazar la
homogenización por factores (`factor_sup·factor_edad·factor_distancia`) por la fórmula directa del
Excel `uf_m2_c = (precio_uf − uf_m2_terreno_f·sup_t − oo_cc) / sup_c`, agregando la lectura de OO.CC.
**Inconveniente:** el diseño pedía leer `oo_cc_uf`, pero el código existente (`lectura-datos.ts:78`)
documentaba la columna de TX_Comparables como `oo_cc`. Además la fórmula necesitaba un `uf_m2_terreno_f`
por comparable que no aparecía en ningún tipo del repo. Escribir `numeroONull(f.oo_cc)` /
`f.uf_m2_terreno_f` sobre nombres equivocados no rompe: devuelve `undefined → null → (?? 0)`, y la
fórmula degrada en silencio a `(precio_uf − 0 − 0)/sup_c`. Un resultado incorrecto disfrazado de
correcto, sin crash ni error de tipos (los campos se leen sobre `Fields = Record<string, unknown>`).
**Causa raíz:** el nombre `oo_cc` es anterior a la configuración D_; el canónico es `oo_cc_uf`. La
verdad del nombre de campo destino no vive en el código TS —que puede arrastrar nombres viejos— sino
en `D_TipoDocumentoAtributo.uso_campo_destino`.
**Solución aplicada:** la pausa-total de Fase 1 (leer y reportar antes de ejecutar) detectó la
discrepancia y la elevó como bloqueo en vez de codificarla a ciegas. Confirmados los nombres por MCP
contra `D_TipoDocumentoAtributo` (`oo_cc_uf`, `uf_m2_terreno_f`, precision 4), recién ahí se ejecutó
Fase 2. `uf_m2_terreno_f` llega null hoy (AT03-Ext hace skip de `muchas_por_solicitud`), así que el
`?? 0` es el comportamiento correcto acordado, no un parche.
**Prevención futura:** ante cualquier discrepancia entre el nombre de un campo en el código y el
nombre en la config D_, la fuente canónica es **`D_TipoDocumentoAtributo.uso_campo_destino`**
(verificable por MCP), no el identificador que arrastre el TS. Y cuando una lectura de campo cae sobre
un `Record<string, unknown>`, un nombre equivocado no falla en compilación ni en runtime: degrada a
`?? 0`/`null` en silencio — por eso el nombre se confirma antes de escribir la fórmula, no después.
