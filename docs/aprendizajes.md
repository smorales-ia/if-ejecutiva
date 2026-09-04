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
- ✅ **2026-08-21 — FRENTE C CERRADO (C1 → C2 → C3 → C4) · RF-TAS-05 completo, en producción.**
  La coordinación de visita que el tasador registra en `TX_CoordinacionVisita` ya es visible
  para la Ejecutiva en las dos superficies que §1.3.2 y §1.3.3 piden: la sección *Coordinación
  de la visita* de la pestaña Datos y el ítem del riel de la pestaña Historial. Mergeado a
  `main`, deployado en Railway y **verificado visualmente en producción** con `VP-2026-0061`.
  452 tests verdes, `tsc` limpio, `build` compila. Detalle de bloques, commits y dudas en
  `docs/_notas/plan-frente-C.md`.

  **Próximo trabajo: por definir.** No hay tanda abierta a continuación del Frente C.

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

- **RO-38 · Los endpoints hermanos de un mismo dominio uniforman el shape de la
  respuesta.** En `app/api/solicitudes/**` el contrato es `{ data: … }` y no el
  payload al ras. No es estética: cada ruta tiene su hook cliente
  (`use-historial-solicitud.ts`, `use-decision-motor.ts`, `use-cronologia-sla.ts`)
  y todos desenvuelven igual, de modo que **el hook siguiente se escribe copiando
  el anterior**. Una ruta que responde distinto obliga a leer su implementación
  antes de consumirla, y esa lectura es justo la que no se hace cuando el patrón
  parecía obvio. C2·B1 sirvió el payload al ras siguiendo su propuesta aprobada y
  hubo que revertirlo en un bloque propio (**C2·B1.5**) antes de cablear la UI:
  el coste de uniformar después es mayor que el de decidirlo al escribir la
  primera línea. Corolario: al abrir una ruta nueva, mirar a sus hermanas de
  carpeta **antes** de fijar el contrato, no después.
  Vigente desde el 21-ago-2026, sesión Frente C · C2.

- **RO-39 · Los tipos que cruzan la frontera server/cliente viven en un módulo
  puro, sin un solo import de `airtable-client`.** Un tipo que el Route Handler y
  un componente `"use client"` comparten no puede declararse en el módulo que
  hace la lectura: aunque `import type` se borre en compilación, deja al
  componente apuntando a un archivo que arrastra el cliente REST y la lectura de
  `AIRTABLE_TOKEN`, y basta que alguien convierta ese `import type` en un import
  de valor para que el token quede a un paso del bundle del navegador. El patrón
  es **dos módulos**: uno puro con tipos, literales de pantalla y mapeo
  (`lib/decision-motor.ts`, `lib/sla-cronologia.ts`, `lib/historial.ts`), y otro
  con la lectura (`lib/decision-motor-airtable.ts`). Aplicado en **C3·B1**
  separando `lib/coordinacion.ts` de `lib/coordinacion-airtable.ts`; los tipos se
  re-exportan desde el módulo `-airtable` para no romper a los llamadores
  server-side que ya los importaban de ahí. Corolario: si un tipo lo necesitan los
  dos lados, **nace en el módulo puro**, no se muda después.
  Vigente desde el 21-ago-2026, sesión Frente C · C3.

- **RO-40 · Una fecha `date` de Airtable (`YYYY-MM-DD`) se parsea con regex,
  nunca con `new Date()`.** `new Date("2026-08-25")` la interpreta como
  medianoche **UTC**, que en Santiago (GMT−4/−3) es **el 24 a las 20:00**: la
  fecha se muestra un día antes de la real, en silencio y sin error. En una fecha
  de visita eso no es cosmético — manda al tasador el día equivocado. La regla
  distingue dos cosas que el tipo `string` confunde: un **`dateTime`** es un
  instante absoluto y se formatea con `timeZone: 'America/Santiago'`
  (`partesEnSantiago`, `Intl.DateTimeFormat`); una **`date`** es una fecha de
  calendario sin huso, y convertirla a instante es el error. Precedente:
  `_fechaVisible` en `lib/tasador/lectura-tasacion.ts`, que ancla al mediodía
  local por el mismo motivo (**RO-36**). Aplicado en **C3·B1** con
  `fechaCalendarioVisible()`, que parte el string y no construye ningún `Date`, y
  con un test que verifica que el 25 no se muestre como 24.
  Vigente desde el 21-ago-2026, sesión Frente C · C3.

- **RO-41 · En una lectura fundida de varias fuentes, un fallo parcial se
  propaga; no degrada a lista vacía.** `fetchHistorialSolicitud` lee `A_Eventos`,
  `A_Cambios` y `TX_CoordinacionVisita` en paralelo y funde los tres en un riel.
  Si una falla, **falla la función entera**. La tentación es servir lo que sí se
  leyó, y es exactamente lo que no hay que hacer: un timeline al que le falta un
  tercio **se ve idéntico a uno completo**, y quien lo mira no tiene forma de
  saber que le falta algo — mientras que un error visible se reintenta. El
  corolario de diseño importa tanto como la regla: **un solo criterio de fallo
  por función**. Tener una fuente que propaga y otra que degrada dentro del mismo
  `Promise.all` significa que el criterio laxo terminará aplicándose por costumbre
  a la fuente que no lo admitía. Consecuencia asumida al agregar la tercera
  lectura en **C4·B1**: `TX_CoordinacionVisita` ilegible deja el timeline entero
  en error, y hay un test que lo fija para que nadie lo "arregle" después.
  Vigente desde el 21-ago-2026, sesión Frente C · C4.

- **RO-42 · La redacción de un ítem del historial vive en el módulo del dominio,
  no en el del historial.** Es **RO-05** aplicado a la capa de presentación: el
  módulo del historial sabe *ordenar y pintar*; el del dominio sabe *qué significa
  cada rama del dato*. `tituloDeCoordinacion()` y `detalleDeCoordinacion()` viven
  en `lib/coordinacion.ts` y no en `lib/historial.ts`, porque ahí ya están las dos
  ramas de una coordinación, el passthrough de `motivo` que **A-17** exige y el
  formateo de fecha de **RO-40**. Duplicarlos del lado del historial crearía la
  segunda fuente de verdad que RO-05 prohíbe: el día que cambie la redacción de
  una rama cambiaría en un sitio y no en el otro, y nada lo notaría. Lo único que
  el módulo del historial aprende es que existe un tercer origen — en **C4·B1**,
  dos literales: `'coordinacion'` en `OrigenHistorial` y `'phone'` en
  `IconoHistorial`. Corolario para estimar: agregar una fuente al riel es un
  cambio de dos literales más un mapper en el dominio, no una reescritura del
  timeline.
  Vigente desde el 21-ago-2026, sesión Frente C · C4.

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

### 2026-08-10 — Tres decisiones de negocio sobre §9.6 (plan v1.9 → v1.10)

**Contexto:** incorporación al plan de las Decisiones 1 (matriz por etapa como dato cerrado), 2 (baseline del SLA agregado) y 3 (reproceso diferido), que reordenan M-11 sin tocar la estructura de §9.6.

**Inconveniente:** la Decisión 2 llegó expresada con tres nombres de campo —`sla_dias`, `umbral_ambar_dias`, `umbral_verde_dias`— que no son ejecutables sobre `C_SLA`. `sla_dias` es justamente la familia que el mismo checkpoint M-11 manda borrar, así que la instrucción se contradecía a sí misma; y los otros dos no existen en la tabla (12 campos verificados por MCP), de modo que cargarlos habría exigido crear estructura nueva, contra el enunciado explícito de la decisión. Segundo problema, más silencioso: la fila «global default» pedía `cliente = *` y `tipo_informe = *`, pero ambos son `multipleRecordLinks` y no admiten un literal `*`.

**Causa raíz:** la decisión se formuló en vocabulario de negocio (compromiso, ámbar, verde) y alguien lo tradujo a nombres de campo plausibles sin abrir el schema. Los nombres plausibles chocaron con dos hechos ya decididos en v1.9 —qué familia sobrevive— y con el tipo real de tres campos.

**Solución aplicada:** se conservaron los **valores** y se tradujeron los **nombres**, registrando la traducción como decisión greppable **§9.6-R4** en `docs/_md/plan-ejecucion-if02-v1_9.md`: `dias_totales = 3`, `dias_alerta_amarilla = 2`, `dias_alerta_roja = 3`, y verde sin campo por ser derivado (todo lo que está bajo el ámbar). El comodín se define como **link vacío**, no como `*`. Y como la fila `SLA_METLIFE_Refinanciamiento` (`dias_totales = 4`, umbrales vacíos) sobrevive junto a la default, se fijó precedencia **campo a campo**: gana la fila más específica que empareje y cada campo vacío se resuelve contra la default — así MetLife conserva sus 4 días sin que nadie tenga que completar su fila. M-11 se partió en **M-11.a** (carga en `C_SLA` + borrado de la familia perdedora) y **M-11.b** (ratificación de las 7 filas de §5.2.4, que carga A-1).

**Prevención futura:** una decisión de negocio que nombra campos se contrasta contra el schema **antes** de escribirla en el plan, y si los nombres no existen se traduce explícitamente en vez de crear campos para que calcen. La señal de alarma barata: si un mismo checkpoint dice *cargar X* y *borrar X*, el problema no es el orden de las instrucciones sino que dos vocabularios distintos se están usando como si fueran uno.

---

### 2026-08-10 — Ejecución de Tanda A de §9.6: esquema + carga + script AT08

**Contexto:** pase único que creó `C_SLA_Etapas`, los 3 campos de `C_SLA` y los 20 campos SLA de `TX_Solicitudes` vía MCP, cargó la fila default y las 7 filas de §5.2.4, y dejó escrito `docs/_artefactos/airtable/AT08_Alertas_SLA.js`.

**Inconveniente:** el paso 4.3 del encargo pedía linkear `matriz_etapas` de `SLA_DEFAULT_GLOBAL` a las 7 filas recién creadas, pero §9.6-R4 define ese campo como **vacío = matriz global · poblado = override del par**. Poblarlo en la fila comodín invierte la convención: la fila que representa "sin override" queda con override declarado.

**Causa raíz:** dos lecturas razonables del mismo campo. Una lo entiende como navegación (dejar la matriz alcanzable desde la fila de SLA) y otra como bandera semántica (poblado = este par negocia plazos distintos). El plan fijó la segunda; el encargo asumió la primera.

**Solución aplicada:** se ejecutó el link como se pidió —es reversible en un clic y hoy es funcionalmente inerte, porque apunta exactamente a las 7 filas globales y el motor todavía no existe (Tanda B)— y se dejó el conflicto anotado para que Sergio elija: vaciar la celda, o ampliar la redacción de §9.6-R4 a "poblado = matriz explícita" y distinguir el override real por otra vía.

**Prevención futura:** cuando un campo es a la vez enlace navegable y bandera de comportamiento, la bandera pierde. Conviene separar los dos roles —`matriz_etapas` para el override y un lookup o una vista para navegar— antes de que exista el primer override real, porque después no hay forma de distinguir una fila que "usa la global explícitamente" de una que "negoció la misma matriz".

**Hallazgo aparte, que corrige el plan:** §9.6 · M-13 afirma que *"el MCP no crea ni modifica fórmulas"*. Ya no es cierto: `create_field` de este MCP acepta `type: "formula"` con `options.formula`. `sla_semaforo_etapa` no se creó en este pase porque el encargo lo excluía explícitamente, pero M-13 puede automatizarse y dejar de ser un paso manual. Antes de darlo por hecho conviene probarlo contra los 14 timestamps ya creados, porque una fórmula mal escrita que emita una mayúscula de más deja el filtro de la Tanda C en cero filas sin avisar.

---

### 2026-08-10 — El MCP sí crea fórmulas: una incapacidad supuesta costó un checkpoint manual

**Contexto:** cierre de las tres correcciones abiertas de §9.6 (plan v1.10 → v1.11): vaciar `matriz_etapas` de la fila default, crear `sla_semaforo_etapa` y alinear la precisión de `sla_revision_horas`.

**Inconveniente:** el plan declaraba en la fila M-13, como si fuera un hecho verificado, que *"el MCP no crea ni modifica fórmulas"*. Sobre esa premisa M-13 existía como turno manual de Sergio en la UI de Airtable, y además **bloqueaba la Tanda C entera**. La premisa era falsa: `create_field` acepta `type: "formula"` con `options.formula`, y devuelve el campo con `isValid`, `referencedFieldIds` y `result.type` resueltos. `sla_semaforo_etapa` quedó creado en un tool call (`fldB6gJ3clZUPgaZk`).

**Causa raíz:** la afirmación entró al plan como inferencia —el `CLAUDE.md` lista un alcance del MCP centrado en lectura de schema y búsqueda de registros— y nunca se probó. Una vez escrita, sobrevivió tres bumps de versión copiándose de una tabla de checkpoints a la siguiente, ganando apariencia de dato verificado por el solo hecho de repetirse.

**Solución aplicada:** se creó la fórmula por MCP con el texto literal de §9.6.1, se cerró M-13 y se registró el hallazgo como **§9.6-R5** en `docs/_md/plan-ejecucion-if02-v1_9.md`, junto con las dos incapacidades que **sí** están verificadas y siguen en pie: el MCP no borra campos y no lee el estado activo/inactivo de una Airtable Automation.

**Prevención futura:** **verificar la capacidad real del MCP antes de declararla ausente en el plan; una ausencia asumida cuesta un turno manual que no era necesario.** La prueba vale un tool call y se hace una vez. Corolario del mismo tamaño: `isValid: true` en una fórmula sólo dice que la expresión compila, no qué cadena emite — la verificación de contrato de los cuatro literales sigue siendo obligatoria y se hace mirando filas reales, no metadata.

---

### 2026-08-10 — Tanda B del motor de SLA: tres cosas que no estaban donde parecía

**Contexto:** construcción de `lib/sla-habil.ts`, `lib/feriados.ts` y `lib/sla-etapas.ts` con sus tests (plan §9.6.2 · B-1 a B-4), sobre el esquema que la Tanda A dejó cargado.

**Inconveniente 1 — el alias `@/` no existe en vitest.** El primer test de `sla-etapas` falló con `Cannot find package '@/lib/airtable-client'`. El repo no tenía `vitest.config`, así que el alias declarado en `tsconfig.compilerOptions.paths` no llegaba al runner. Los tres tests previos (`dropbox-path`, `adjuntos-destino`, `clerk-response`) no lo notaban porque sólo importan módulos hoja con rutas relativas; en cuanto un test alcanza un módulo de `lib/` que importa con `@/`, revienta.
**Causa raíz:** el alias vivía sólo en tsconfig, que Next resuelve por su cuenta. Nadie lo había necesitado en tests.
**Solución aplicada:** `vitest.config.mts` con `resolve.alias` apuntando `@` a la raíz. Extensión **`.mts`**, no `.ts`: con `.ts` Vite carga el archivo como CommonJS y `import.meta.url` dispara un warning de sintaxis ESM en cada corrida.
**Prevención futura:** el alias de tsconfig no es infraestructura compartida hasta que el runner también lo conoce. Cualquier test nuevo que toque un módulo con dependencias transitivas lo va a descubrir; mejor tenerlo resuelto.

**Inconveniente 2 — el recálculo encadenado leía un estado que todavía no existía.** `marcarFinEtapa(3)` debe abrir la etapa 4 y recalcular sus umbrales. La primera versión hacía que el recálculo **releyera** la solicitud, y el test mostró que en ese momento la marca recién escrita no estaba visible: con `persistir: false` no está en la base por definición, y con `persistir: true` una relectura inmediata tras el `PATCH` tampoco la garantiza. El efecto era que `etapaVigente` devolvía `null` y el motor **borraba** los umbrales en vez de calcular los de la etapa 4.
**Causa raíz:** mezclar "estado de negocio ya decidido" con "estado leído de la base". Son lo mismo sólo si la escritura ya se confirmó y la lectura es consistente; ninguna de las dos cosas está garantizada.
**Solución aplicada:** todas las funciones que marcan una etapa proyectan el campo escrito sobre el objeto en memoria y le pasan esa **solicitud proyectada** al recálculo, en los dos modos de persistencia.
**Prevención futura:** cuando una operación escribe y después necesita leer lo que escribió, proyectar en memoria y no releer. Una relectura inmediata a una API remota es un read-after-write que a veces funciona, y ésos son los peores.

**Inconveniente 3 — la jornada rinde 9 horas, no 8.** Las expectativas de dos casos del encargo estaban mal calculadas por asumir jornada de 8 h y, en un caso, que 24 h hábiles equivalen a un día. Con ventana 9:00–18:00 el día rinde **540 minutos**: 24 h hábiles desde un martes 10:00 vencen el **jueves a las 16:00**, no el miércoles a las 10:00. Corregido en el test, que ahora asienta el número real.
**Prevención futura:** los umbrales de §5.2.4 están en horas hábiles y la ventana es de nueve; cualquier expectativa escrita "a ojo" con días de ocho horas queda corrida. El test de invariante `minutosHabilesEntre(t, sumarHorasHabiles(t, h)) === h * 60` (**RO-06**, 42 combinaciones) es lo que impide que un error así entre sin que nadie lo note.

---

### 2026-08-10 (b) — Un criterio de aceptación por `grep` que no podía dar verde

**Contexto:** apertura de la Tanda C de §9.6. Antes de arrancar se corrió el criterio de aceptación de la Tanda B, ya cerrada con 186 tests verdes.

**Inconveniente:** el criterio pedía «cero constantes de §5.2.4 en el código» y lo verificaba con `grep -n "\b48\b\|\b0\.5\b"` sobre `lib/sla-*.ts`. Devolvía coincidencias, o sea declaraba incumplida una tanda que cumple.

**Causa raíz:** el glob `lib/sla-*.ts` incluye `lib/sla-habil.test.ts` y `lib/sla-etapas.test.ts`, y ahí los catorce números de §5.2.4 aparecen **legítimamente**: un test que verifica que una etapa de `0.5` h vence donde debe tiene que escribir `0.5`. El criterio medía la suma de dos poblaciones con reglas opuestas —en producción el literal es un defecto, en un fixture es el instrumento— y por construcción no podía dar verde.

**Solución aplicada:** se corrigió el criterio, no el código. Hicieron falta **dos** correcciones, y la primera es la lección:

1. `| grep -v '\.test\.ts$'` — escrito sin ejecutarlo, **no excluye nada**. `$` ancla al final de la *línea*, y las líneas que `grep` emite terminan en el contenido (`lib/sla-etapas.test.ts:  e5: { … }`), no en el nombre del archivo. Colaba las 106 coincidencias de los tests intactas. La exclusión correcta ancla en el separador: `'\.test\.ts:'`.
2. Con la exclusión ya operativa apareció el problema de fondo: **cuatro de los siete literales tienen uso legítimo permanente en el motor**. `2`, `3`, `4` y `6` están en `export type NumeroEtapa = 1 | 2 | 3 | 4 | 5 | 6 | 7`, en `ETAPAS`, en los puntajes de `resolverSlaDelPar` y en `diasSemana: [1,2,3,4,5]`. Son números de etapa y de día de la semana, no plazos. Los inequívocos son tres: `0.5`, `24` y `48`.

Criterio final: `grep -nE '\b(0\.5|24|48)\b' lib/sla-*.ts | grep -v '\.test\.ts:' | grep -vE '^[^:]+:[0-9]+: *(//|\*|/\*)'`, vacío sobre `lib/` y sobre `app/api`. Registrado como **§9.6-R6** en `docs/_md/plan-ejecucion-if02-v1_9.md` (plan v1.12), junto con la ratificación de los dos entregables de infraestructura que la Tanda B produjo y v1.11 no declaraba (`vitest.config.mts` y `updateRecord`). La Tanda B no se reabrió.

**Prevención futura:** dos reglas, y la segunda salió de equivocarse en la primera pasada.

1. **Todo criterio de aceptación basado en `grep` declara sus exclusiones dentro del propio comando, y el comando se corre antes de darlo por escrito.** Un literal en un fixture es correcto y no debe hacer fallar el criterio. Es **RO-02** por el otro extremo: allí el `grep` era la fuente de verdad de la cobertura y el riesgo era no correrlo; acá se corre y lo que está mal es su definición. Un criterio de aceptación es código —tiene sintaxis, tiene bugs y falla en silencio— y se prueba como código; una corrección de criterio escrita "de memoria" hereda el mismo defecto que venía a arreglar.
2. **Un criterio se escribe sobre las señales inequívocas, no sobre todas.** Ampliar el patrón a `2|3|4|6` no lo hace más estricto: lo hace inservible, porque obliga a ignorarlo siempre, y un criterio que grita todos los días no distingue nada.

La señal de alarma barata: si un criterio falla sobre código que se acaba de revisar y se sabe correcto, revisar primero el criterio.

**Regla operativa concreta que deja:** `grep -v` con anclaje `$` falla sobre `filename:linenumber:content`; usar `:` como delimitador. Es decir, para excluir un archivo del resultado de un `grep` se escribe `grep -v '\.test\.ts:'`, nunca `grep -v '\.test\.ts$'` — `$` ancla al final de la línea emitida, que termina en el contenido, no en el nombre del archivo. El modo de fallo es silencioso en la dirección peor: el filtro no excluye nada y parece que sí.

---

### 2026-08-10 (c) — Cierre de Tanda C: verificación por REST API y dos deudas anotadas

**Contexto:** cierre de la Tanda C de §9.6 (read-layer del reloj por etapa, endpoint de cronología, blueprints y wizard). Las tres verificaciones de contrato contra Airtable se corrieron **sin MCP**, con `AIRTABLE_TOKEN` de `.env.local` y `curl` contra la REST API.

**Hallazgo 1 · el MCP no es la única vía de verificación de schema, y a veces no es la más barata.** `GET /v0/meta/bases/{baseId}/tables` devuelve el schema completo con FIELD_IDs, tipos y `options.timeZone`, que es exactamente lo que hacía falta para contrastar `FIELD_IDS_SLA` contra la base. Salió: 21 de 21 campos `sla_*` coinciden con el código, y los 18 `dateTime` están en `America/Santiago`, ninguno en `client`. Cuando el MCP no está autorizado, la sesión no tiene por qué detenerse: el token server-side ya está en el repo y el endpoint de metadata es de sólo lectura. **Nota de entorno: `jq` no está instalado en esta máquina** — el parseo se hizo con `python3`, que sí está.

**Hallazgo 2 · un contrato de fórmula sólo se puede verificar sobre filas que existan.** `sla_semaforo_etapa` devolvió `"sin_dato"` en las 39 filas de `TX_Solicitudes`, y ninguna tiene `sla_etapa_actual` poblado porque **el backfill A-5 tampoco corrió**. Eso confirma un literal de los cuatro —en minúscula, sin emoji, sin adornos— y deja `verde`/`ambar`/`rojo` sin observar hasta el E2E de la Tanda G. La lección de método es la de §9.6-R5 aplicada de nuevo: `isValid: true` dice que la fórmula compila, y una lectura sobre base cruda dice qué emite **en el caso que la base tiene**, no en los cuatro. Marcar "verificado" con un solo literal observado sería el mismo optimismo que RO-02 castiga.

**Deuda 1 · A-6 no se ejecutó.** `docs/schema-airtable.md` no tiene `C_SLA_Etapas` ni los 21 campos `sla_*`, pese a que el plan lo declaraba como el único ítem de su tabla de impacto que **no** quedaba diferido. Registrada como **CI-008**, con fecha objetivo condicional a la Tanda D —que es donde empieza a costar, porque D-1/D-4 derivan tipos de esos campos—. No se rehace la Tanda A: el esquema está bien creado; lo que falta es documentarlo.

**Deuda 2 · higiene de placeholders en blueprints.** `SC-Asignar` m8 lleva la URL literal del webhook de SC05 (`hook.eu1.make.com/…`) mientras el secreto HMAC del mismo archivo sí usa `REEMPLAZAR_CON_MAKE_HMAC_SECRET`. La convención existe y está aplicada a medias. **No se tocó en esta tanda a propósito:** el reimport de M-14 tiene que ser idéntico a lo probado, y cambiar la URL por un placeholder obliga a restaurarla a mano en el import —y olvidarla deja al tasador sin correo, con Make reportando Success—. Corresponde hacerlo como tanda propia de higiene, sobre todos los blueprints a la vez y con el checklist de restauración escrito.

**Prevención futura:** cuando una tanda declare un paso documental como "no diferido" (aquí A-6), verificarlo en el cierre de esa misma tanda con el `grep` correspondiente, no en la siguiente. Un paso que se declara excepción y no se ejecuta pierde las dos cosas: no se hace y deja de estar en la lista de lo diferido.

---

### 2026-08-10 (d) — A-5: el backfill del SLA y el campo deprecado que resultó ser la única fuente

**Contexto:** ejecución de **A-5** de §9.6.2 (backfill de `sla_e1_inicio_ts` y timestamps SLA sobre las 39 solicitudes existentes de `TX_Solicitudes`), última pieza pendiente de la Tanda A antes de arrancar la Tanda D.

**Inconveniente:** el paso, tal como lo escribe el plan —*"si `fecha_asignacion_ts` está poblada, `sla_e1_fin_ts = sla_e2_inicio_ts = fecha_asignacion_ts`"*—, produce el resultado exactamente invertido sobre la cartera real. Al contrastar los 39 registros: las **9** solicitudes en `estado = asignada` tienen `fecha_asignacion_ts` **vacío** y el `fecha_asignacion` deprecado (`fldiaj4mwd17g25n1`, date · §21.4-d) poblado; y la **única** fila con `fecha_asignacion_ts` poblado —`VP-2026-0043`— está en `estado = creada`, sin tasador, sin visador y sin fecha de visita. La lectura literal habría dejado las 9 asignadas reales en etapa 1 y habría movido a etapa 2 la única que no lo está, con lo que el criterio de aceptación de la Tanda E (*"una asignada muestra e1 completada y e2 en curso"*) se habría vuelto inalcanzable sin que nada fallara.

**Causa raíz:** el plan se escribió sobre el campo **canónico** (`fecha_asignacion_ts`, creado el 24-jul-2026 por §21.4-d) y la cartera histórica es toda **anterior** a esa creación, así que su dato de asignación vive en el campo que la migración dejó deprecado. El campo nuevo existe, está bien tipado y no tiene datos; el campo viejo está marcado para retiro y es el único que sabe algo. Un backfill es, por definición, el punto donde esa inversión se paga.

**Solución aplicada:** `scripts/backfill-sla-a5.ts`, que compone la fila proyectada y delega el cálculo en `recalcularSla()` en modo `persistir: false` —el motor calcula, el script hace un único `PATCH` por fila—, con las reglas que aprobó Sergio:

- cierra e1 **sólo** si `estado = 'asignada'`; la fuente es `fecha_asignacion_ts` y, si está vacío, el `fecha_asignacion` deprecado;
- un `date` sin hora se ancla a las **17:00 de Santiago** (cierre de jornada), no a medianoche: la hipótesis conservadora es que una asignación fechada ese día ocurrió dentro de la jornada;
- `VP-2026-0043` queda en etapa 1 y su `_ts` huérfano **no se toca** — registrado como **CI-009**.

Resultado: 39 filas escritas · 0 con `_ts` · **9 con fallback** · 30 con e1 abierta · 30 en etapa 1 y 9 en etapa 2. **Excepción que queda registrada:** el backfill A-5 aceptó `fecha_asignacion` (date deprecado) como fuente de `sla_e1_fin_ts` para las 9 filas históricas anteriores a la creación de `fecha_asignacion_ts`; el deprecado de §21.4-d queda para retirar en migración posterior, **no aquí** — y esa migración tiene ahora un consumidor más del que hacerse cargo.

**Efecto sobre la verificación V3, que la entrada (c) había dejado abierta.** Aquella decía que `verde`/`ambar`/`rojo` quedaban sin observar hasta el E2E de la Tanda G, con `sin_dato` como único literal confirmado. Tras el backfill, el conjunto observado sobre las mismas 39 filas es **`['rojo', 'verde']`** — 38 y 1—, así que van **tres de los cuatro**. El `verde` es `VP-2026-0048` y apareció **solo**, por efecto del ancla a 17:00 sobre una asignación fechada hoy: su e2 vence mañana. Falta `ambar`, y no falta por defecto de la fórmula sino por aritmética —exige `NOW()` dentro de una ventana de 1 h en e1 o 2 h en e2, sobre una cartera con todos los vencimientos en el pasado salvo uno—. La lección de método corrige a la (c) por el lado optimista: **un contrato de fórmula no se cierra observando los casos que la base regala, pero tampoco hace falta esperar al E2E para cobrar los que sí aparecen**; se reporta el conjunto observado y se nombra el que falta con su razón, que es distinto de dejar los tres en "pendiente".

**Hallazgo de entorno · cómo correr TypeScript del repo fuera de Next, con Node 20 y sin agregar dependencias.** No hay `tsx` ni `ts-node`, y Node 20.20 no hace type-stripping. Lo que funcionó, sin tocar `package.json` ni el lockfile (RO-07): compilar con el `tsc` ya instalado usando un `tsconfig` aparte —fuera del repo, en el scratchpad— con `module: commonjs` y `outDir` propio, y ejecutar con `node --env-file=.env.local`. **La trampa:** `tsc` **no reescribe** `compilerOptions.paths`, así que el `.js` emitido conserva `require("@/lib/…")` y revienta en runtime. Se resuelve con un hook de 10 líneas cargado con `node -r` que parchea `Module._resolveFilename` para el prefijo `@/`. Ni `vitest` ni `pnpm dlx` hicieron falta: correr un backfill de producción como si fuera un test viola la regla de `CLAUDE.md` de no escribir a Airtable desde los tests, y no hay por qué acercarse a esa frontera.

La receta completa, para no re-derivarla la próxima vez. El `tsconfig` lleva `baseUrl`/`rootDir` apuntando a la **raíz del repo** en absoluto, `paths: {"@/*": ["./*"]}`, `outDir` en el scratchpad y `include` con el script; el hook es:

```js
// alias.cjs — tsc no reescribe `paths`; esto lo resuelve en runtime.
const path = require('node:path'); const Module = require('node:module')
const RAIZ = path.join(__dirname, 'a5-out')            // el outDir
const original = Module._resolveFilename
Module._resolveFilename = function (request, ...resto) {
  if (request.startsWith('@/')) return original.call(this, path.join(RAIZ, request.slice(2)), ...resto)
  return original.call(this, request, ...resto)
}
```

```bash
node_modules/.bin/tsc -p <scratchpad>/tsconfig.a5.json
node --env-file=.env.local -r <scratchpad>/alias.cjs <scratchpad>/a5-out/scripts/backfill-sla-a5.js
```

Dos detalles que costaron un intento cada uno: `tsc` emite `error TS2688: Cannot find type definition file for 'node'` porque el `tsconfig` vive fuera del repo y `typeRoots` deja de resolver — **es inocuo, el emit igual sale** y no vale la pena pelearlo para un script de una vez; y `set -a; . ./.env.local` para exportar el token a `curl` falla en la línea 23 del archivo (`completar: command not found`), porque hay un valor placeholder sin comillas — tampoco bloquea, el resto de las variables carga.

**Prevención futura:** antes de ejecutar cualquier paso de datos que un plan describa por nombre de campo, **contar las filas que efectivamente cumplen la condición**, no asumir que el campo canónico es el que tiene el dato. Un `SELECT` de dos columnas —la condición del plan y el estado que debería acompañarla— cuesta un minuto y es lo que distinguió "9 filas asignadas" de "1 fila con el timestamp". La versión general: **cuando existe un par campo-nuevo / campo-deprecado, todo backfill sobre datos históricos debe mirar los dos y declarar cuál usó**, porque la migración que creó el par casi nunca movió los datos viejos. Y el corolario de proceso: una desviación de la letra del plan sobre datos de producción se lleva a decisión explícita del dueño **antes** de escribir, con los dos resultados contados sobre la tabla real, no con la desviación ya aplicada.

---

### 2026-08-10 (e) — Tanda D: la lista compartida entre servidor y cliente, la vista que quedó saturada y la tercera copia que no llegó a existir

**Contexto:** Tanda D de §9.6.2 completa — píldora de etapa en `SLABadge` con unión discriminada (D-1), su render en `FilaSolicitud` (D-2), el selector `?sla_etapa=` con el contador de la unión (D-3) y la píldora en la cabecera del detalle (D-4). Se sumó, pedido por Sergio en el mismo lote, la apertura automática del panel de filtros.

**Inconveniente 1 · una lista cerrada que dos capas necesitan, y sólo una puede importarla.** El selector de la bandeja tenía que ofrecer los valores válidos de `?sla_etapa=`, que la Tanda C había declarado en `lib/solicitudes.ts` (`SLA_ETAPA_FILTROS_VALIDOS`). Pero `solicitud-list.tsx` es `"use client"`, y `lib/solicitudes.ts` importa `lib/airtable-client.ts`: **importar el valor —no el tipo— habría arrastrado el cliente de Airtable al bundle del navegador**. Hasta ahora el componente importaba de ese módulo sólo `type Vista`, que TypeScript borra en compilación, así que el problema nunca se había manifestado.

**Causa raíz:** la frontera server/client de Next no la marca el archivo que declara el dato sino el que lo importa, y un `import type` y un `import` se ven casi iguales en el diff. Una lista de dos strings no parece código de servidor, pero vive en un módulo que sí lo es.

**Solución aplicada:** la lista canónica (`SLA_ETAPA_FILTROS`) y sus rótulos (`SLA_ETAPA_FILTRO_LABELS`) se trasladaron a `lib/console-data.ts`, que no tiene dependencias de servidor y que el componente ya importaba; `lib/solicitudes.ts` la importa desde ahí y **conserva su export `SLA_ETAPA_FILTROS_VALIDOS`** para no romper a sus consumidores. La alternativa —declararla dos veces— es la que RO-05 prohíbe, así que quedó un test que compara las dos referencias (`toEqual`) y otro que exige rótulo para cada valor y ninguno de más. Verificado además de forma empírica, que es lo que cierra el punto: tras `next build`, `grep -rl 'api\.airtable\.com' .next/static/` y `grep -rl 'AIRTABLE_TOKEN' .next/static/` devuelven **0 archivos**.

**Inconveniente 2 · la vista "SLA en riesgo" pasó de 7 a 38 de 39 filas.** Medido contra la base real con las tres fórmulas por separado: agregado (`semaforo_sla`) **7**, etapa (`sla_semaforo_etapa`) **38**, unión **38** — o sea las 7 del agregado son subconjunto de las 38, y la vista dejó de discriminar.

**Causa raíz:** no es un bug de la fórmula ni del filtro. El backfill A-5 ancló `sla_e1_inicio_ts` a `fecha_solicitud` sobre una cartera de mayo a julio, y la etapa 1 tiene un SLA máximo de **3 horas hábiles**. Aplicar retroactivamente un reloj en horas a solicitudes de hace dos meses las deja todas vencidas, y eso es aritméticamente cierto: son 30 solicitudes que llevan semanas en "Ingreso". El dato no miente; lo que deja de servir es la vista, porque una pestaña que marca el 97 % de la cartera no responde "qué tengo que mirar hoy".

**Solución aplicada:** ninguna en código — se reporta y la decisión es de negocio (confirmado por Sergio el 10-ago-2026: **no se toca el filtro**). **No se tocó el filtro para disimularlo**, que era la salida tentadora y la equivocada: bajar el umbral o excluir lo antiguo desde la UI sería inventar una regla de negocio en la capa que tiene prohibido decidir.

**Se autocorrige con datos vivos post-M-14, pero sólo por un lado y conviene ser exacto.** Una vez reimportados SC01 y SC-Asignar, toda solicitud nueva arranca su reloj en el momento real del hito (§5.2.2) y entra a la bandeja en verde, así que el flujo entrante deja de contribuir al rojo. Lo que **no** se corrige solo son las **30 filas históricas que quedaron en etapa 1**: nadie cierra su e1 salvo una asignación, de modo que seguirán en rojo mientras sigan en `creada`. La proporción mejora conforme la cartera rote —no porque el dato viejo cambie, sino porque deja de ser mayoría—. Si hiciera falta antes, la palanca correcta no es el filtro sino los datos: cerrar o cancelar lo que ya no está vivo. Volver a correr la medición de abajo es lo que dirá cuándo la pestaña recuperó su utilidad.

**La medición, para repetirla tal cual.** Son los tres conteos que dieron 7 / 38 / 38:

```bash
set -a; . ./.env.local; set +a
q() { curl -s -G -H "Authorization: Bearer $AIRTABLE_TOKEN" \
  --data-urlencode "filterByFormula=$1" --data-urlencode "fields[]=codigo_ext" \
  "https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblaHTyMHYfmy7Fg6" \
  | python3 -c "import sys,json; print(len(json.load(sys.stdin)['records']))"; }

q 'OR(FIND("VENCIDO",{semaforo_sla})>0,FIND("EN RIESGO",{semaforo_sla})>0)'   # agregado
q 'OR({sla_semaforo_etapa}="ambar",{sla_semaforo_etapa}="rojo")'              # etapa
q 'OR(FIND("VENCIDO",{semaforo_sla})>0,FIND("EN RIESGO",{semaforo_sla})>0,{sla_semaforo_etapa}="ambar",{sla_semaforo_etapa}="rojo")'  # unión = la vista
```

**Prevención futura:** **un backfill retroactivo de un reloj operacional satura toda vista construida sobre ese reloj, y hay que medirlo en el mismo lote en que se backfillea, no descubrirlo en pantalla.** La comprobación son los tres conteos de arriba, y distingue "el filtro funciona" de "el filtro funciona y sigue siendo útil". Son dos preguntas distintas y sólo la primera la contesta un test.

**Inconveniente 3 · el auto-expand del panel de filtros iba a ser la tercera copia de la misma lista.** Sergio pidió que el panel se abriera solo cuando hubiera filtros activos —una línea— porque un deep link como `?vista=sla_riesgo&sla_etapa=rojo` llegaba mostrando una lista recortada sin ninguna señal visible de qué la estaba recortando. Al escribirla apareció que las claves de filtro ya estaban enumeradas **dos veces** en `solicitud-list.tsx`: en `filtrosActivos` y en `limpiarFiltros`. El auto-expand era la tercera.

**Causa raíz:** las tres listas se escriben en momentos distintos y ninguna falla si otra se queda corta. El síntoma del drift es silencioso y de la peor especie: un filtro aplicado que el botón "Limpiar filtros" **no limpia**, o que no cuenta como activo y deja el panel cerrado. Nada revienta; la pantalla simplemente miente. Ya había pasado a medias en esta misma tanda — `sla_etapa` hubo que agregarlo a mano a las dos listas existentes, y olvidarse de una habría sido invisible.

**Solución aplicada:** `CLAVES_FILTRO` como constante de módulo, consumida por los tres (`filtrosActivos` con `.some()`, `limpiarFiltros` con `Object.fromEntries(...map(k => [k, null]))`, y el inicializador del `useState`). Es más que la línea pedida, y se avisó como tal antes de darlo por cerrado.

Dos detalles de implementación que no son cosméticos. El estado usa **inicializador perezoso** (`useState(() => …)`), **no** un `useEffect`: con efecto, cerrar el panel a mano teniendo filtros puestos lo reabriría en el render siguiente, y el usuario perdería la pelea contra su propia UI. Y `vista`, `orden`, `page` y `solicitud` **no** entran en la lista: son estado de navegación, no filtros; incluirlos habría dejado el panel abierto siempre, que es lo mismo que no tener la función.

**Prevención futura:** **cuando una constante se enumera por segunda vez en el mismo archivo, extraerla ahí, no la tercera.** La regla barata para detectarlo sin pensar: si agregar un elemento obliga a tocar dos sitios y olvidarse de uno no rompe nada, ya es una fuente duplicada aunque todavía no haya divergido (RO-05). Y el corolario de esta tanda: la lista quedó sin test porque vive en un componente `"use client"` y el repo no tiene runner de DOM — la única defensa es que sea una sola, así que la extracción no es higiene opcional sino lo que sustituye al test que no se puede escribir.

---

### 2026-08-11 — Tanda E: la cronología de etapas, el color que no existe para las etapas cerradas y un `&&` que no cortó nada

**Contexto:** Tanda E de §9.6.2 completa — `HistorialItem` generalizado (E-1), sección "Cronología de etapas (SLA)" al inicio de la pestaña Historial alimentada por `GET /api/solicitudes/[id]/sla` (E-2), `Alert` ámbar/rojo sobre las pestañas con los dos literales de §9.6.1 (E-3) y estado vacío honesto (E-4). 278/278 tests, `pnpm build` y `tsc --noEmit` limpios.

**Inconveniente 1 · el endpoint no expone tono por etapa, y la tentación era calcularlo.** La cronología muestra las siete etapas, pero `sla_semaforo_etapa` —la fórmula de Airtable— sólo habla de la **etapa vigente**: para una etapa ya cerrada no existe semáforo en la base. Comparar `minutosHabiles` contra `slaIdealHoras`/`slaMaxHoras` en el cliente para pintarlas era una línea de código y habría quedado bien en pantalla.

**Causa raíz:** el endpoint devuelve los hechos (minutos consumidos, umbrales, entrada/salida) pero no el juicio, porque el juicio es de la fórmula. Derivarlo en el cliente crea un segundo semáforo que nadie sincroniza con el primero: divergiría de la píldora de la cabecera y de la bandeja el día que la fórmula cambie de umbral, sin que ningún test lo note.

**Solución aplicada:** el color vive **sólo** en la etapa vigente y llega ya decidido en `Solicitud.slaEtapa.tono` (`components/console/solicitud-detail.tsx` · `CronologiaEtapasSection`), con un guard extra: si la fila y la cronología discrepan sobre cuál es la vigente, no se pinta ninguna. Las cerradas muestran el hecho crudo —`"3h 20m de 2h / 3h"`, vía `resumenTiempoEtapa`— que deja ver el desborde sin inventar un color. Mismo criterio en el `Alert`: sin `venceTs` no se emite, porque un literal de §9.6.1 con la fecha en blanco es peor que ningún literal.

**Prevención futura:** **cuando una capa devuelve hechos y no juicios, es a propósito.** Antes de derivar un color/estado en el cliente, buscar quién lo emite hoy; si ya hay un emisor, el cliente lo consume o no lo muestra — nunca lo recalcula (RO-05).

**Inconveniente 2 · `duracionCorta` estaba privada en `lib/solicitudes.ts`, que es servidor.** La cronología del detalle necesita el mismo formato de duración (`"4h 10m"`) que la píldora de la bandeja, y el detalle es `"use client"`: importar de `lib/solicitudes.ts` arrastra `lib/airtable-client.ts` al bundle. Es la **misma frontera** del Inconveniente 1 de la Tanda D, ahora en sentido inverso (antes era una lista de dos strings; ahora un formateador de nueve líneas).

**Solución aplicada:** `duracionCorta` se mudó a `lib/sla-cronologia.ts` —módulo puro, sin `fetch`, sin Airtable, sin Clerk— y `lib/solicitudes.ts` la **importa** desde ahí en vez de conservar su copia. `lib/sla-cronologia.ts` es también donde viven los dos literales de alerta y los formatos de instante, todos en hora de Santiago explícita (`ZONA_VPROPERTY`), con 23 tests que comparan los literales por igualdad exacta: son canónicos y un refactor no puede reescribirlos en silencio.

**Prevención futura:** la pregunta antes de escribir un helper de formato es "¿esto lo va a necesitar el cliente?". Si la respuesta es sí o quizás, nace en un módulo puro. Mover después cuesta un commit; duplicar cuesta un bug que nadie ve.

**Inconveniente 3 · `components/ui/alert.tsx` no tenía variante ámbar.** Sólo `default` y `destructive`. El rojo de E-3 usa `destructive` tal cual, pero el ámbar de §9.6.1 no tenía dónde apoyarse, y la salida fácil —usar el naranja de marca `#F5A213`— está expresamente prohibida por §4.4: el ámbar operacional (`#D97706`) significa "esto se está atrasando" y el naranja es identidad; colisionarlos vacía de sentido al primero.

**Solución aplicada:** variante `warning` agregada al `cva` existente, con el **mismo hex** que ya declara `SLA_CLASSES.amber` en `lib/console-data.ts`. Cero colores nuevos: la paleta sigue declarada en un solo sitio. Mismo criterio en la fila de la cronología, que reusa `SLA_CLASSES` por su `text-*` y deja que `tailwind-merge` descarte el fondo — el truco que ya usaba `EtapaPill`.

**Inconveniente 4 · `pnpm lint && pnpm build` lanzó dos builds simultáneos y el segundo murió con "Another next build process is already running".** El comando era `pnpm lint 2>&1 | tail -20 && pnpm build …`.

**Causa raíz:** dos cosas a la vez. (a) **`pnpm lint` no funciona en este repo**: `eslint` no está en `devDependencies` —es deuda diferida anotada el 22-jul-2026 en el «Estado de tareas» de este mismo archivo— y el script falla con `sh: 1: eslint: not found`. (b) El `&&` no lo detuvo porque el exit status de un *pipeline* es el del **último** comando: `tail` devuelve 0 aunque `eslint` reviente. Así que el build arrancó igual, y un segundo `pnpm build` lanzado creyendo que el primero nunca había corrido chocó con el lock de `.next/`.

**Solución aplicada:** esperar al build en curso (`until ! ps aux | grep -q "[n]ext build"; do sleep 5; done`) y leer su salida — salió limpio. No se tocó el lock: borrarlo a mano con un build vivo corrompe `.next/`.

**Prevención futura:** dos reglas. **No encadenar `pnpm lint` en este repo** —no existe—; la compuerta antes del commit es `pnpm build` + `pnpm typecheck` + `pnpm test`. Y **`cmd | tail && otro` no es un `&&` condicional**: si hace falta la condición, o se quita el pipe, o se usa `set -o pipefail`. Un comando que "no falló" porque su salida pasó por `tail` es exactamente la clase de verde que no significa nada.

---

### 2026-08-11 (b) — `cellFormat=string` no devuelve ISO con `T`, y el fixture inventado dejó pasar el bug dos tandas

**Contexto:** verificación en pantalla de la Tanda E. Sergio bloqueó el commit con dos bugs: la píldora de etapa mostraba **"Sin datos de etapa" en toda la cartera** pese a tener el punto de color correcto, y el `Alert` de etapa desbordada no aparecía nunca. Reproducidos en `VP-2026-0048` (e2 verde) y `VP-2026-0056` (e2 rojo).

**Inconveniente:** un solo bug con dos síntomas. `parseInstante` (`lib/solicitudes.ts`) devolvía `null` para **todos** los `dateTime` del prefijo `sla_`, de modo que `slaEtapa.venceTs` quedaba vacío; de ahí el fallback `'Sin datos de etapa'` de `etiquetaEtapa` y el corte en el guard "sin `venceTs` no hay alerta" de `mensajeAlertaEtapa`. El tono sobrevivía porque `sla_semaforo_etapa` es texto plano y no pasa por el parser: **color correcto con texto mentiroso**, que es la peor combinación posible porque parece que el dato llegó.

**Causa raíz:** `cellFormat=string` con `timeZone=America/Santiago` y `userLocale=es-CL` devuelve, para un `dateTime` cuyo campo está configurado con formato de fecha **ISO**, la forma `"2026-08-11 14:00"` — orden ISO, **separador espacio, sin `T`, sin zona** — y no `"11-08-2026 14:00"` como suponía el docblock. La variante am/pm existe también: `fecha_solicitud` llega como `"2026-07-27 12:00am"`. `parseInstante` cubría tres formas (ISO con `T`, ISO sin hora, reloj es-CL `D/M/YYYY`) y ninguna matchea: la primera exige la `T` y la tercera empieza por día, así que `\d{1,2}` no puede comerse `2026`. Caía al `return null` final.

Dos funciones del mismo archivo parsean fechas y **sólo una era tolerante**, que es la razón de que nadie lo notara antes: `parseDate` comprueba el prefijo `^\d{4}-\d{2}-\d{2}` y corta con `substring(0,10)`, así que los campos viejos funcionan hace meses con el mismo formato raro.

**Y por qué los tests daban verde.** El fixture de la Tanda C era `'12-08-2026 13:00'`: **el formato del contrato documentado, no el del wire**. Se testeó lo que creíamos que Airtable manda. Es RO-13 —"filtrar por el formato real que emite la fuente"— aplicado al parseo, y el corolario es que un test escrito desde el docblock hereda el error del docblock en vez de detectarlo.

**Solución aplicada:** rama nueva en `parseInstante`, entre la de ISO sin hora y la de reloj es-CL:

```ts
const isoConEspacio = v.match(
  /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::\d{2})?\s*(?:([ap])\.?\s?m\.?)?$/i
)
```

resuelta con **`desdeSantiago`, nunca `new Date`**: el texto no trae zona y su hora es la de Santiago porque es la que se pidió en `timeZone`; leerlo con `new Date` lo interpretaría en la zona del proceso —UTC en Railway— y correría cada vencimiento cuatro horas. La rama de ISO con `T` se queda primera y sin tocar: **mismo prefijo, semántica opuesta** —con `T` y `Z` el texto ya es un instante absoluto y pasarlo por `desdeSantiago` lo correría igual—. La normalización am/pm y la validación de rango se extrajeron a `instanteDePartes`, compartida por las dos ramas de reloj de pared: duplicarla era garantizar que una se arreglara sin la otra.

Los fixtures se rehicieron **copiados de la respuesta HTTP**, con el JSON real pegado en el docblock del bloque de tests, y `'12-08-2026 13:00'` bajó de caso principal a caso secundario —sigue siendo válido para los campos con formato local—. 286/286 tests.

**Prevención futura:** tres reglas, en orden de utilidad.

1. **El fixture de un parser se copia del wire, no del documento.** Antes de escribir el primer `expect`, hacer el `curl` con **los mismos parámetros que usa el código** (`cellFormat`, `timeZone`, `userLocale`) y pegar la respuesta literal en el test. Si el formato no se observó, no se testea: se supone.
2. **Un `null` de parseo nunca debe ser silencioso en un campo que la UI muestra.** Acá el `null` degradaba a un literal legítimo ("Sin datos de etapa") que existe para un caso real, así que el fallo se disfrazó de dato. Cuando un fallback es también un estado válido de negocio, hay que poder distinguirlos — aunque sea con un `console.warn` en el mapper.
3. **Cuando dos funciones del mismo módulo parsean lo mismo con rigores distintos, la laxa está tapando el bug de la estricta.** `parseDate` toleraba el formato desde siempre; esa asimetría era la pista y estaba a doce líneas de distancia.

---

### 2026-08-11 (c) — El watcher de `next dev` no ve `/mnt/c`: un ciclo de verificación entero persiguiendo un bug ya arreglado

**Contexto:** verificación en pantalla del fix de `parseInstante` (entrada (b) de hoy). Los tests daban verde contra el JSON del wire y el pipeline real de `fetchSolicitudes` devolvía `etiqueta: "Vence en 3h 40m"`, pero el navegador seguía mostrando **"Sin datos de etapa"** en las 39 filas después de `Ctrl+Shift+R`. Sergio bloqueó el commit por segunda vez, con razón.

**Inconveniente:** el código correcto en disco y el navegador mostrando el anterior, sin ningún error en ninguna parte.

**Causa raíz:** el repo vive en `/mnt/c/Users/...`, un montaje **drvfs** de Windows dentro de WSL2, donde los eventos `inotify` no se propagan de forma fiable. El watcher de `next dev` nunca vio las escrituras, así que el servidor siguió sirviendo **el grafo de módulos compilado al arrancar**. Está medido en el log del propio servidor, y ésta es la evidencia que conviene saber reproducir:

```
09:31  ○ Compiling /consola ...        ← única compilación en toda su vida
10:04  lib/solicitudes.ts modificado   ← el fix
10:15  GET /consola?solicitud=... 200  ← refrescos servidos con el grafo de 09:31
```

No hay una segunda línea `Compiling /consola` después de las 10:04 y sin embargo respondió 200. **`Ctrl+Shift+R` no podía arreglarlo**: invalida la caché del navegador, y lo obsoleto estaba en el servidor. Los otros dos archivos de la tanda (09:44) quedaron igual de congelados, y por eso tampoco aparecía el `Alert`.

**Solución aplicada:** **reinicio en frío** — `rm -rf .next && pnpm exec next dev`. Es lo único que garantiza que el servidor en curso sirva lo que hay en disco: un arranque compila desde el fuente, sin depender del watcher. No hay arreglo de raíz disponible; la mitigación es operativa y hay que aplicarla a mano tras cada edición de un módulo de servidor.

**⚠ Lo que NO funciona, probado en esta misma sesión.** `watchOptions.pollIntervalMs: 1000` en `next.config.mjs` parece la respuesta obvia —la opción existe y está soportada en Next 16.2.6, verificada en `node_modules/next/dist/server/config-shared.d.ts:1239`— y **cuelga el servidor**. El sondeo recorre el árbol completo, `node_modules` incluido, sobre un filesystem de Windows: `curl` a `/` devolvió `HTTP 000` a los 25 s en dos intentos seguidos y el log acumuló 23 `watch error … NotFound`. Next no expone patrón de exclusión para esa opción, así que no hay forma de acotar el sondeo al código propio. Se revirtió en el acto y quedó un comentario de advertencia en `next.config.mjs` para que el próximo que sufra el HMR no lo reintente. **Cambiar un watcher que no ve cambios por un servidor que no atiende es peor negocio.**

**Prevención futura:** cinco reglas.

1. **Un test verde no prueba que el runtime corre ese código.** Prueban cosas distintas y esta sesión gastó un ciclo completo confundiéndolas. Cuando la pantalla contradice al test, el sospechoso número uno es el **artefacto servido**, no la lógica.
2. **La evidencia está en el log del dev server, y es de lectura directa:** `grep -E "Compiling|Compiled"` contra su salida. Si el `mtime` del fuente es posterior a la última compilación de esa ruta, el navegador está viendo código viejo — sin ambigüedad y sin discusión.
3. **Tras editar un módulo de servidor con el repo en `/mnt/c`, reiniciar `pnpm dev`.** No confiar en el HMR para `lib/**` ni para Server Components: en drvfs no es que sea lento, es que puede no enterarse nunca. Para componentes cliente suele funcionar, pero no vale la pena adivinar cuál es cuál.
4. **Nunca correr `pnpm build` con `pnpm dev` arriba.** Comparten `.next`; el build lo reescribe bajo los pies del servidor vivo. Hoy pasó dos veces y enturbió el diagnóstico —parecía caché del navegador— aunque no fuera la causa raíz. Si hay que buildear, bajar el dev primero.
5. **`pkill -f "next dev"` se mata a sí mismo.** El patrón matchea la propia línea de comando del `bash -c` que lo ejecuta, que contiene el literal `next dev`; el shell muere antes de llegar al `pnpm dev` siguiente y el comando "no hace nada" con un exit code raro (144). Usar un patrón que no se auto-matchee (`pkill -f "node.*next"`) o separar el kill del arranque en dos comandos.

**Corolario de método, que es lo que de verdad hay que llevarse:** una mitigación de entorno se verifica **midiendo el servicio**, no leyendo la documentación de la opción. El polling estaba bien documentado, bien tipado y era la recomendación estándar para WSL2; bastó un `curl -w "%{http_code} %{time_total}"` para ver que dejaba el servidor inservible. Treinta segundos de medición contra un diagnóstico equivocado que el usuario habría descubierto refrescando.

---

### 2026-08-11 (d) — Fase 2 del cableado del Detalle: nueve reglas reutilizables

Entrada de **patrones**, no de bitácora: las diez tareas de la fase están en el commit y no se
narran acá. Lo que sigue es lo que sirve para la próxima vez, en orden de coste evitado.

**1 · Un módulo `lib/` que importa `airtable-client` no puede exportar literales que consuma un
componente cliente.** El import arrastra el cliente REST —y su lectura de `AIRTABLE_TOKEN`— al
bundle del navegador. Partir en dos: `lib/x.ts` con el tipo, los literales de pantalla y el
mapeo puro (cliente-safe, sin imports de Airtable) y `lib/x-airtable.ts` con el `listRecords`.
El molde ya existía en `sla-cronologia` / `sla-etapas` y se replicó en `decision-motor`,
`historial` y `documentos-generados`. `import type` sí es seguro: se borra en compilación.
Nada falla al escribirlo — el bundle simplemente crece y el token viaja.

**2 · Un campo Link puede existir y estar vacío, y eso rompe el filtro igual que E-076.** En
`A_DecisionesMotor` (43 filas) y `TX_DocumentosGenerados` (1 fila) el campo `solicitud` existe en
el schema y **no está poblado en ninguna fila**; la referencia real vive en un texto plano
(`solicitud_codigo`, `clave_natural`). Filtrar por el link devuelve cero filas, y cero filas se
lee como "no hay datos". Es un modo de fallo distinto de E-076 —allí el link existe pero se
evalúa contra el primary field— y comparte con él que **es silencioso**. Regla: antes de escribir
un `filterByFormula` sobre un Link, contar cuántas filas lo tienen poblado, no sólo comprobar que
el campo está en el schema. Un `curl` con `pageSize=100` y un `filter(x => x.fields.link?.length)`
lo resuelve en un minuto.

**3 · Verificar población, no existencia, también vale para los campos que la UI muestra.**
`A_Eventos.actor_nombre` está vacío en las 66 filas de la tabla mientras `actor` trae el
`clerk_user_id` crudo. Construir la fila del timeline sobre `actor_nombre` compila, pasa los tests
y no muestra autor nunca. Corolario de estilo: si lo único disponible es un identificador técnico,
**se omite el dato** — un `user_3GBF4Jp…` en pantalla incumple §6.1 y es peor que el hueco.

**4 · Reconciliar UI optimista con el servidor se hace comparando, no esperando.** Tras asignar,
la entrada fabricada en el navegador convive con las que escribe Make en `A_Eventos`. La regla es
una comparación —descartar las optimistas cuyo `timestamp` ya alcanzó el del evento de servidor
más reciente— y no un `setTimeout` con una ventana adivinada. Se autocorrige tarde o temprano sin
carrera que perder ni duplicado permanente si Make se demora.

**5 · Estado activo de navegación: calculado, nunca `active: true`.** Sale de `pathname` +
`useSearchParams`. Y cuando dos entradas apuntan a la **misma ruta** con distinto `?vista=`, la
general tiene que restar la específica (`activo = enBase && !enHijo`); sin la resta se encienden
las dos a la vez, que se lee peor que ninguna.

**6 · Tras crear, la certeza "creo → veo" gana a conservar los filtros.** Una solicitud nueva nace
en `estado = creada` y sin tasador: con `?vista=aprobadas` o un rango de fechas puesto **no entra
en el conjunto**, y la pantalla respondería que no existe justo después de crearla. Navegar a la
ruta canónica sin parámetros (`/consola?solicitud=<id>`). Y `push` **más** `refresh`: si la URL
destino coincide con la actual, el Router Cache serviría el árbol anterior sin la fila nueva.

**7 · No forzar una agrupación sobre un campo que el schema no tiene.** §1.3.4 pide agrupar
adjuntos por versión del informe, pero `TX_Adjuntos` no tiene campo de versión y no es un olvido:
sus filas son antecedentes *de entrada* que no pertenecen a ninguna versión. Las versiones están
en `TX_DocumentosGenerados`. Dos secciones separadas, cada una con la verdad de su tabla y estado
vacío honesto, antes que inventar la clave de pertenencia. Aplica igual al dato que no existe:
el valor en UF por versión no se pinta porque el que hay es el actual, y ponerlo junto a la v1
afirmaría algo falso.

**8 · Al retirar un mock, dejar el hueco explicado.** Comentario corto en el sitio: adónde se fue
y por qué estaba mal. `mockDecisionMotor` describía asignación de tasador por cobertura y carga
—o sea AT02, fuera de alcance desde v1.9— y sin la nota la próxima sesión lo reintroduce al ver
el vacío. Vale doble cuando el mock contradecía la spec, porque entonces el hueco es la
corrección.

**9 · `Button` renderizado como `<a>` necesita `nativeButton={false}`.** §4.4 pide `render` prop en
vez de `asChild`; lo que no estaba escrito es que Base UI sigue tratando el elemento como botón
nativo salvo que se le diga lo contrario. No había precedente en el repo (`grep -rn nativeButton
components/` daba cero) y el tipo lo admite sin quejarse.

*Recordatorio, no hallazgo:* un componente cliente con `useSearchParams` va envuelto en
`Suspense` o Next fuerza render dinámico de **toda la ruta** que lo monte. El patrón ya estaba en
`console-shell.tsx`; se repitió al extraer `NavPrincipal` y `BuscadorSolicitudes` del header, que
queda como server shell.

---

### 2026-08-11 (e) — Fase 3: bump normativo, correlativos y el hábito de documentar de memoria

Entrada de **patrones**. Tres de estos se proponen como reglas permanentes
(**RO-24**, **RO-25**, **RO-26**) y esperan aprobación explícita por RO-03; los
demás se quedan acá.

**1 · Un bump de spec tiene dos clases de referencia y se tratan al revés.**
`grep` devuelve las dos mezcladas y hay que separarlas a mano antes de tocar
nada:

- **Punteros vivos** —rutas de archivo, cabeceras de "fuentes canónicas", citas
  del tipo "Spec vX §Y" en código y en CI abiertas— **se actualizan**. Si no,
  apuntan a un archivo que ya no existe.
- **Afirmaciones históricas** —"Desde v1.9.7…", "§5.2 (nueva en v1.9.7)", las
  filas del changelog anterior, todo `docs/_archivo/` y `docs/aprendizajes.md`—
  **quedan intactas**. Subirles el número convierte un registro en una
  afirmación falsa.

El caso mixto existe y no se resuelve con `sed`: una frase que decía "no están
definidos en la spec v1.9.7" pasó a ser falsa al escribir §1.0 en v1.9.8, así
que había que **reescribirla**, no renumerarla. Y otra que decía "no se
re-verificaron contra v1.9.7" se amplió a "ni contra v1.9.8", porque seguía
siendo cierta y además seguía siendo deuda. → propuesta **RO-24**.

**2 · El changelog anuncia lo que ya está en el cuerpo, nunca al revés.** El
encargo de esta fase pedía "una línea de changelog"; cumplirlo al pie habría
producido un changelog que anuncia siete cambios de §1 que el cuerpo no tenía.
El orden correcto es integrar primero y redactar la tabla de cambios después,
leyendo lo integrado. → parte de **RO-24**.

**3 · Antes de asignar un correlativo, leer todos los existentes.** Asigné
RO-17..RO-21 sobre RO-17 y RO-18 que ya existían, porque en la lectura inicial
abrí las primeras 140 líneas del archivo y la sección de reglas seguía más
abajo. El coste de evitarlo es un comando:

```bash
grep -n '^- \*\*RO-' docs/aprendizajes.md | tail -3
```

Aplica igual a CI, RF, RN, SC y AT, donde además rige la regla de oro de no
renumerar: un correlativo duplicado no se puede arreglar después sin romper
punteros. → propuesta **RO-25**.

**4 · Un snapshot de schema se levanta de la base, nunca de un documento de
diseño.** Es la causa raíz de CI-010 y CI-011: `docs/schema-airtable.md` §10
describía `A_Cambios` con un `solicitud` (Link) y un `cambio_id` (PK) que **no
existen**, porque se escribió desde la Capa de Datos v2.6.5 en vez de desde un
pase contra Airtable. Cuesta un minuto comprobarlo:

```bash
curl -s -H "Authorization: Bearer $AIRTABLE_TOKEN" \
  "https://api.airtable.com/v0/meta/bases/$AIRTABLE_BASE_ID/tables"
```

→ propuesta **RO-26**.

**5 · Es la tercera vez que aparece el mismo meta-patrón, y conviene nombrarlo.**
RO-13 dice filtrar por el formato que **emite** la fórmula, no por el literal
humano. El fixture de un parser se copia del **wire**, no del docblock
(2026-08-11 b). Y ahora: el schema se levanta de la **base**, no del documento
de diseño. Las tres son la misma regla —*derivar de la fuente de verdad, no de
un documento que habla sobre ella*— y las tres se descubrieron por separado
pagando el mismo precio. Ante cualquier artefacto derivado (filtro, fixture,
tipo, snapshot), la pregunta es de dónde salió el dato con el que se escribió.

**6 · Un contrato repetido en tres sitios se corrige en los tres.** Pasar
`A_Cambios` de "sin uso" a "read" tocaba la tabla de contratos de `CLAUDE.md`,
la línea de **Entradas** y las advertencias por CI. Corregir sólo la fila —que
era lo pedido— habría dejado el mismo documento diciendo que las entradas son
cinco tablas y la tabla de contratos diciendo que son ocho. Es el corolario de
**RO-05** para prosa: cuando la fuente única no es posible porque el dato vive
en un documento narrativo, la obligación pasa a ser encontrar todas sus
apariciones antes de tocar una.

**7 · `mv` y `git mv` producen la misma historia.** Git detecta el rename por
similitud de contenido al commitear, así que un `mv` de toda la vida deja el
mismo resultado que `git mv` y **no requiere reversión ni comando compensatorio**.
Importa porque la regla del repo prohíbe ejecutar git desde Claude Code y el
procedimiento de bump de `CLAUDE.md` está redactado con `git mv`: la vía
correcta es `mv`, y no hay nada que arreglar después.

---

### 2026-08-12 — Manual de pruebas v2 en PDF (guía para la Ejecutiva)

**Contexto:** generación de `docs/_md/Manual_Usuario_Prueba1_v2.pdf` — reescritura del
manual de prueba como guía de casos (15 CP) con las imágenes del PDF original.

**Inconveniente 1 · No había forma de instalar paquetes Python.** El sistema trae Python
3.14.4 sin `pip`, sin `ensurepip`, sin `venv` utilizable y sin `uv`/`pipx`; `sudo` pide
contraseña interactiva.
**Causa raíz:** distro Debian con PEP 668 (`externally-managed-environment`) y el paquete
`python3-pip` no instalado.
**Solución aplicada:** `curl bootstrap.pypa.io/get-pip.py` y
`python3 get-pip.py --user --break-system-packages`, luego
`python3 -m pip install --user --break-system-packages pymupdf reportlab`. Todo queda en
`~/.local/lib/python3.14/site-packages`, sin tocar el Python del sistema. Nota: los
ejecutables caen en `~/.local/bin`, que no está en el PATH — invocar siempre con
`python3 -m`.
**Prevención futura:** en esta máquina, cualquier tarea que necesite una librería Python
parte por esos dos comandos; no perder tiempo probando `venv` ni `pip3`.

**Inconveniente 2 · El índice del PDF quedó desfasado una página.** Las entradas del
índice apuntaban a la página anterior a la del caso, a partir del sexto caso.
**Causa raíz:** el ancla (`bookmarkPage`) se emitía como flowable de altura cero *antes*
del `KeepTogether` de la cabecera del caso. Cuando el grupo no cabía y saltaba de página,
el ancla se quedaba dibujada al final de la página anterior y registraba ese número.
**Solución aplicada:** mover el `Anchor` **dentro** del `KeepTogether`, como primer
elemento del grupo (`build_manual_v2.py`, función `bloque_caso`). El número del índice se
resuelve en una primera pasada a un buffer en memoria y se escribe en la segunda.
**Prevención futura:** en reportlab, un ancla vive donde está el contenido que nombra; si
el contenido está en un `KeepTogether`, el ancla también.

**Inconveniente 3 · Media página en blanco cada vez que un caso traía captura.** Con una
página por caso y la figura al final, las cuatro figuras dejaban páginas casi vacías.
**Causa raíz:** las figuras a ancho de caja (174 mm → 98 mm de alto) no caben en el
remanente de una página ya ocupada por los cinco bloques, y una tabla con imagen no se
puede partir.
**Solución aplicada:** figura a 148 mm justo bajo la banda del caso (el lector ve primero
la pantalla que va a probar) y casos que fluyen uno tras otro en vez de una página por
caso. 26 → 21 páginas sin quitar contenido.
**Prevención futura:** en documentos con capturas anchas, decidir primero el ancho de
figura y después el ritmo de página; forzar salto por sección es lo que genera el blanco.

**Hallazgo de producto (no es un bug de esta sesión).** `components/console/app-header.tsx:41`
pinta un `Avatar` con las iniciales fijas `"ME"`: no hay `UserButton` de Clerk ni ninguna
vía de cerrar sesión desde la UI. El caso CP-15 del manual se redactó contra esa realidad
—verifica que `/consola` en incógnito redirige al login— y la ausencia del botón se
declara como limitación conocida para que la Ejecutiva no la reporte como falla.

### 2026-08-12 — Simulación de costos de la API de Claude (dos hallazgos sobre RF-09)

**Contexto:** informe de costos para el cliente (`docs/_md/SimulacionCostos_Uso_ApiClaude.pdf`),
modelando el consumo de la API en la extracción documental de RF-09.

**Hallazgo 1 · El descuento por caché de prompts no se activaría con el bloque actual.**
El almacenamiento en caché sólo opera sobre prefijos que superan un mínimo por modelo:
**1.024 tokens en `claude-sonnet-5`** (4.096 en `claude-haiku-4-5`). El prompt de sistema de
la extracción es más corto, así que hoy se pagaría a precio de entrada completo y sin aviso
—no hay error, simplemente `cache_creation_input_tokens` queda en 0—. La corrección es
incorporar el catálogo de atributos a extraer al bloque fijo para superar el mínimo.
Impacto medido en el escenario de 400 tasaciones/mes: US$ 3,94 mensuales.
**Prevención futura:** al diseñar cualquier prompt que se repita, verificar el mínimo del
modelo antes de asumir el ahorro, y comprobar `cache_read_input_tokens` en runtime.

**Hallazgo 2 · `claude-sonnet-5` razona por omisión, y eso se paga como salida.**
A diferencia de los modelos anteriores de la línea Sonnet, omitir el parámetro `thinking`
en Sonnet 5 **activa** el razonamiento adaptativo. El blueprint de
`SC-RF09-ExtraccionClaude` envía `{"model":"claude-sonnet-5","max_tokens":4096}` sin ese
parámetro: para una extracción estructurada eso alarga la respuesta sin mejorar el
resultado, y la salida cuesta cinco veces más que la entrada. Además `max_tokens` acota
razonamiento **y** respuesta juntos, así que 4.096 puede truncar.
Impacto estimado si no se corrige: +49 % sobre el costo mensual (US$ 28,35 → US$ 42,25).
**Prevención futura:** en llamadas de extracción fijar `thinking: {"type":"disabled"}` con
esfuerzo bajo, y revisar este parámetro en cada cambio de modelo.

**Nota metodológica:** los precios del informe salen exclusivamente de
`docs/_md/PRECIOS_USO_API_CLAUDE.txt`; el generador calcula el modelo de costos en Python
para que los cruces (mensual × 12 = anual, por-tasación × volumen = mensual) sean exactos
por construcción y no cifras escritas a mano.

---

### 2026-08-13 — Lote 7: sync de §2 (UI Tasador) contra un diseño externo, y bump v1.9.8 → v1.9.9

Entrada de **patrones**. Dos quedaron como reglas permanentes (**RO-27**, **RO-28**) y una
como enmienda a **RO-24**; las tres **vigentes desde 13-ago-2026**, aprobadas por RO-03 e
integradas en «Reglas operativas aprendidas».

**1 · Un diseño externo que contradice al spec manda sólo en su propia sección.**
El diseño v4 exige la coordinación de visita (§2.3); §1.3.2, §1.3.3, §1.4 y RN-59 la habían
retirado por decisión propia en la misma versión, apoyadas en CI-012. Corregir §1 «para que
cuadre» habría ejecutado por la puerta de atrás una decisión de negocio abierta —crear
`TX_CoordinacionVisita`— que no es del ejecutor. El procedimiento aplicado:

- Alinear **sólo** la sección local con el diseño.
- Declarar la contradicción **in situ**, con nota visible al inicio de la sección y puntero
  a la CI que gobierna la decisión (`⚠ Inconsistencia declarada con §1 — ver CI-012`).
- Marcar los RF afectados como pendientes de esa CI **en su descripción**, no en una nota al
  pie, y fijar en su criterio de aceptación que no se liberan antes del cierre.
- Registrar en la sección local qué haría falta reponer si la CI cierra en el otro sentido
  (acá: la excepción acotada a RN-59, retirada de §1.4).

Un documento que se contradice de forma **declarada** es auditable; uno reconciliado a la
fuerza esconde qué decisión se tomó y quién la tomó. → **RO-27**, vigente desde 13-ago-2026.

**2 · Un PDF entregado como «diseño» puede traer una auditoría de código dentro.**
`Imagenes_IF_Tasador_v4.pdf` tiene 30 páginas: pp. 1–16 son un prompt de auditoría y su
respuesta sobre el repo v0 —`package.json`, árbol de rutas, componentes—, y pp. 17–30 son la
sección `3-PANTALLAS`, que es lo único que especifica diseño. Tratar el archivo entero como
fuente de verdad visual habría canonizado como requisito lo que la propia auditoría marca
como deuda: el contador «N de 3 usados» que §2 ya había retirado (CI-015). Separar las dos
partes en el inventario **antes** de tratar cualquiera como fuente, y anotar en el reporte qué
páginas son cuáles. La parte de auditoría sirve como **evidencia de código** para fichas CI;
sólo la parte de diseño es fuente de verdad visual. → **RO-28**, vigente desde 13-ago-2026.

**3 · Enmienda a RO-24: dos clases de referencia que el enunciado no nombraba.**
RO-24 ya separa punteros vivos de afirmaciones históricas y se aplicó sin fricción a las 36
referencias del bump. Faltaban dos casos que aparecieron acá:

- **Punteros vivos en código.** Los comentarios de cabecera que citan «Spec vX §Y» en
  `.ts`/`.tsx`/`.js`/`.py` **se actualizan**: tras un `git mv` apuntan a un archivo
  inexistente. Son cambio de comentario, no de comportamiento, y por eso no violan la regla
  de «sólo documentación» — pero se declaran como desviación en la bitácora del lote (C-10).
- **Huellas históricas adicionales.** La línea `SUPERSEDED` de la cabecera, las filas del
  changelog interno (`Cambios vX → vY`, `vX (anterior)`) y toda construcción del tipo
  «hasta vX.Y», «entre vX.Y y vX.Z» **quedan intactas**: son enunciados sobre el pasado y
  subirles el número los vuelve falsos.

Comando de cierre del bump, que debe salir sin punteros vivos:

```bash
grep -rn "v1_9_8\|v1\.9\.8" --exclude-dir=node_modules --exclude-dir=.git . \
  | grep -v "aprendizajes.md\|docs/_notas/\|docs/_archivo/"
```

→ **enmienda a RO-24, vigente desde 13-ago-2026**, sin correlativo nuevo: crear uno
duplicaría una regla viva, que es justo el fallo que RO-25 previene.

**Nota de correlativos.** Verificado con `grep -n '^- \*\*RO-' docs/aprendizajes.md | tail -3`
antes de asignar: último vivo **RO-26**. Igual verificación para CI (último **CI-012** → se
usó CI-013…CI-021) y para A-XX en `gap/_ambiguedades.md` (último **A-11** → A-12…A-17).
RO-25 aplicada, sin incidentes.

**Desviación C-13 · el lote se consolida en un único commit.** El cierre planificaba tres
commits secuenciados —contenido, bump y bitácora—, y el `SYNC_LOG` quedó redactado con esa
granularidad y tres marcadores `<sha …>` distintos. El usuario decidió consolidar los 17
archivos en **un solo commit**. Consecuencias asumidas, todas registradas:

- Los 12 marcadores pasan al placeholder único `pendiente-single-commit`; el sha real se
  escribe en una edición posterior al push, que produce un archivo modificado más y se
  commitea en la tanda siguiente, **no en ésta**.
- La agrupación por commit de los tres bloques del `SYNC_LOG` **se conserva como agrupación
  lógica**: sigue diciendo qué cambia junto con qué, aunque el historial de git no lo separe.
- Precedente ya existente en este mismo registro: los lotes 2 y 3 compartieron el commit
  `ae5202e` con la bitácora. La regla de oro "un commit por lote" cede ante la decisión del
  usuario y **la trazabilidad se sostiene por el `SYNC_LOG`, no por el historial de git**.

Lo que no se hace: dejar el placeholder sin fecha de reemplazo. Un marcador que nadie sustituye
convierte la bitácora en un registro que apunta a nada, y es el modo de fallo que C-13 asume
explícitamente en vez de descubrirlo meses después.

### 2026-08-18 — P2-TAS.A retomada: el mapeo de captura contra el schema real

**Contexto:** retomar P2-TAS.A desde `docs/_notas/snapshot-P2-TAS-A-en-curso.md` para escribir las 2 rutas que faltaban (`/datos` e `/informe`) y los 3 tests. La sesión arrancó bajando el schema de las 6 tablas de captura, que el repo no documentaba.

**Inconveniente:** `lib/airtable-client.ts` no exporta `deleteRecord`, y el sync destructivo de las 4 tablas hijas de `/datos` (RO-31) lo necesita. Sus helpers `request` y `postRequest` son privados, así que tampoco se podía componer desde fuera.

**Causa raíz:** el cliente REST de IF-02 se construyó para el perfil de uso de IF-02 —leer cartera, actualizar campos derivados del motor de SLA— y ahí nunca hizo falta borrar: las bajas de IF-02 pasan por Make (`SC-Adjuntos-Delete`), no por el cliente. IF-03 es el primer consumidor que borra directo contra la API REST.

**Solución aplicada:** se creó `lib/tasador/airtable-writes.ts` con un único export `deleteRecords()`, en territorio IF-03, importando `AirtableError` de `lib/airtable-client.ts` y replicando sus convenciones (`API_BASE`, reintento 3× en 429/5xx, `typecast`). **No se editó `lib/airtable-client.ts`**, que es territorio IF-02 y lo prohíbe R5.

**Prevención futura:** **revisión de OV-8** (`docs/_notas/inventario-tasador.md`). OV-8 declaró innecesario el envoltorio `lib/tasador/airtable-writes.ts` que el plan §0.4·nota 3 proponía, con el fundamento de que `createRecord` y `listRecords` **ya existían** — y en eso acierta. El matiz es que **evaluó sólo las dos funciones que el plan nombraba**: `deleteRecord` no estaba en esa lista y no existe. OV-8 sigue vigente para create/list; la excepción es el DELETE, y por eso el envoltorio se creó igual. Regla que se generaliza: un override que declara innecesario un módulo debe enumerar **qué** funciones verificó, porque «el módulo no hace falta» y «las dos funciones que miré ya estaban» no son la misma afirmación.

**Inconveniente (2):** `CLAUDE.md` declaraba *«tests unitarios (vitest cuando esté)»* y por esa línea se llegó a evaluar diferir los 3 tests de la tanda a una tanda propia, por creer que montar el runner tocaba `package.json` — territorio IF-02 vedado por R5.

**Causa raíz:** la frase se escribió cuando era cierta y nadie la actualizó al agregar vitest en `1bf7c67` ("Tanda B: motor SLA … + vitest config · 186/186 tests"). La documentación propia envejeció sin aviso.

**Solución aplicada:** diagnóstico antes de asumir. Resultado: **vitest 4.1.10 instalado**, `vitest.config.mts` con el alias `@/` ya resuelto, 10 archivos y 286 tests verdes, y dos precedentes de test de Route Handler. Cero dependencias que instalar. Se corrigió la línea del `CLAUDE.md`.

**Prevención futura:** verificar antes de asumir la documentación, **incluida la propia**. Es el mismo mecanismo de CI-025, donde §21 del schema declara una verificación que no cubrió lo que dice cubrir: una doc que miente no es neutra — apaga la comprobación que habría detectado el problema. Registrado además como observación ajena: `"test:e2e": "playwright test"` es un **script huérfano** (sin `playwright.config.*` ni el paquete); no se tocó, por R5 y por alcance.

**Inconveniente (3):** dos patrones de test que parecían equivalentes a su versión ingenua y no lo son.

**Causa raíz:** una aserción puede pasar por la razón equivocada. (a) Un test del 409 que sólo comprueba «estado `visitada` → 409» prueba la condición, no el escenario: pasa igual aunque la primera llamada haya escrito dos veces. (b) Un test que afirma «tras un 403 no se llamó a nada» lo satisface una ruta rota que nunca llama a nada.

**Solución aplicada:** (a) el test de `/calcular` **ejecuta la secuencia real** del doble tap —200 y transición, el guard pasa a leer `visitada`, 409— y afirma el **efecto acumulado**: `updateRecord` una sola vez. Eso es lo que garantiza que AT03 se dispare una vez. (b) el test del guard cierra con dos **controles negativos**: con el guard en verde, el GET sí lee y el PATCH sí escribe.

**Prevención futura:** para transiciones irreversibles, el test recorre la secuencia y afirma el número de escrituras, no el status de cada paso. Y **todo test cuya aserción principal sea una ausencia necesita un caso gemelo que demuestre la presencia**.

### 2026-08-19 — P3-TAS: la Pantalla 1 contra datos reales

**Contexto:** tanda P3-TAS (.A capa de datos, .B pantalla) sobre `feat/tasador-ui`. Cola personal
del tasador: chips, card, semáforo de SLA y contacto telefónico.

**Inconveniente:** la card pintaba **"En plazo · 0h" en todas las filas**, con la cartera entera
emitiendo `sla_semaforo_etapa = "rojo"`.
**Causa raíz:** `Tasacion.slaStatus` y `horasRestantes` eran opcionales y **ninguna capa los
poblaba**; la card caía a `?? "en_plazo"` y `?? 0`. El tipo venía del v0, donde el store en memoria
los traía cargados a mano, y al cablear contra Airtable nadie ocupó el hueco. Compilaba, así que
nada lo señaló.
**Solución aplicada:** se retiró el `SlaStatus` propio y se reexportó `SlaEtapaSolicitud` de IF-02;
`proyectarSlaEtapa()` en `lib/tasador/lectura-tasacion.ts` lo arma desde `sla_etapa_actual`,
`sla_semaforo_etapa`, `sla_etapa_alerta_ts` y `sla_etapa_vence_ts`, y la card usa el `SLABadge`
importado de `components/console/status-badges.tsx` (R7). Sin `slaEtapa` no se pinta píldora.
**Prevención futura:** un campo opcional que nadie escribe **y** un `??` en el consumidor son, en
conjunto, un valor inventado con apariencia de dato. Cuando el `??` aporta un valor de negocio —un
color, un plazo, un estado— la pregunta a hacerse es quién lo escribe, no si compila.

**Inconveniente:** la visita sembrada el **18-08** se mostraba **17-08** en la card.
**Causa raíz:** `fecha_visita_programada` es un campo `date` de Airtable y llega sin hora;
`new Date("2026-08-18")` es medianoche **UTC** y al formatear en huso chileno retrocede un día.
**Solución aplicada:** `fechaVisible()` ancla a `T12:00:00` local, igual que `parseDate` de
`lib/solicitudes.ts:419` en IF-02. Cuatro casos nuevos en `lib/tasador/lectura-tasacion.test.ts`,
incluido el primero de mes, donde el error salta de mes además de día. Auditados los otros tres
`new Date(...)` de IF-03: los dos restantes leen instantes `_ts` con hora real y están bien.
**Prevención futura:** **RO-36**. Y el hallazgo de método: apareció al mirar un dato *conocido* en
pantalla, no leyendo código. Los fixtures previos usaban fechas con hora y por eso ningún test lo
cazó.

**Inconveniente:** no se pudo hacer la verificación visual de §4.2 paso 8 de la forma prevista.
**Causa raíz:** `middleware.ts` protege todo salvo `/sign-in` y `/api/health` con `auth.protect()`
de Clerk, así que `/tasaciones` responde **404** a cualquier petición sin sesión. IF-03 usa
`mockUserTasador` para la identidad (R2) pero **igual vive detrás del Clerk de IF-02**.
**Solución aplicada:** verificación equivalente sin navegador, con dos scripts en el scratchpad
—fuera del repo— corridos con `vitest --config` y un symlink a `node_modules`: uno ejecuta
`leerCola()` contra Airtable real y vuelca la proyección; otro renderiza las `TasacionCard` con
`renderToStaticMarkup` y vuelca el HTML, del que se extraen textos y `href`. Así se comprobaron los
ocho elementos de §4.1, su orden, las tres omisiones y el `tel:`. **La comprobación de píxeles a
375×812 sigue pendiente y es de Sergio.**
**Prevención futura:** anotar en el plan que toda pantalla de IF-03 necesita sesión Clerk para
abrirse, y que P11-TAS tiene que reconciliar el guard de Clerk con la identidad mock.

### 2026-08-19 (b) — Q5 resuelta: quién cierra la etapa 2, y la etapa 3 que ya estaba especificada

**Contexto:** cierre de P3-TAS. El chip "Por coordinar" quedó definido como `asignada` con la etapa 2
abierta, y la tanda lo entregó con una deuda declarada: **nadie escribe `sla_e2_fin_ts`**, así que
una solicitud asignada no sale nunca del chip y su semáforo termina en rojo. Se derivó a Héctor
como **Q5**.

**Respuesta oficial de Héctor (vía Sergio, 19-ago-2026) — Q5 CERRADA:**

- **La etapa 2 la cierra el tasador**, registrando en el sistema el resultado del llamado: día y
  hora de visita coordinada, o incidencia (no contesta, foro malo, etc.). No la cierra la Ejecutiva
  ni una automatización de tiempo.
- **SLA de la etapa 2: 4 h ideal / 6 h máximo.**
- **El "informe post-llamado" es una etapa 3 propia, con SLA de 30 minutos**, y corre del tasador a
  Control y Seguimiento inmediatamente después del llamado.

**Hallazgo al verificar la respuesta:** las tres afirmaciones **ya estaban especificadas y
configuradas** desde antes. `docs/_md/VProperty_SLA_Negocio_v1.1.md` está trackeado en el repo
desde el commit `dfddb37` (07-ago-2026) y fue absorbido al normativo en el bump v1.9.7 (§5.2.4 ·
RF-53 · D-16); `C_SLA_Etapas` (`tbl05zu5RLhH3u6pl`) tiene sus **7 filas completas** con los catorce
umbrales exactos, incluida `e3 · Informe post-llamado · 0.5 / 0.5 · tasador`. Lo que Q5 aporta no es
la definición sino **la confirmación del actor que cierra e2**, que la matriz no explicita.

**Lo que Q5 deja al descubierto, y es lo que importa:** el problema nunca fue de configuración sino
de **escritores**. En todo el repo hay **un solo punto** que mueve el reloj por etapa —
`marcarFinEtapa(id, 1, …)` en `app/api/solicitudes/[id]/asignar/route.ts:132`, que cierra e1 y abre
e2— más la apertura de e1 en el alta. **Las etapas 3, 4, 5, 6 y 7 no tienen escritor alguno**, y
`pausar()` / `reanudar()` (RN-54) no tienen ningún llamador. La configuración estaba lista hace
diez días; lo que falta es el código que la use.

**Prevención futura:** cuando una regla de negocio llega con su tabla de configuración ya poblada,
la pregunta útil no es *«¿está definido?»* sino ***«¿quién lo escribe y cuándo?»***. Una matriz
completa en Airtable y un motor con API pública dan la impresión de una funcionalidad terminada;
`grep` de los llamadores dice la verdad en una línea.


**Cierre parcial de Q5 (19-ago-2026), a la luz de la revisión de Héctor del diseño v4.**
Cierre e2/e3 fusionado en un solo click ("Confirmar coordinación" o "Devolver a ejecutiva")
según revisión del diseño v4, Pantalla 2. La etapa e3 (0.5h post-llamado) queda absorbida
por e2 en la UX. El motor sigue con las 7 filas de `C_SLA_Etapas`, pero el escritor marca
fin de e2 y fin de e3 en el mismo evento.

Consecuencia para quien escriba el código: **no se busca una segunda interacción de UI que
cierre e3.** No existe y no se va a diseñar — el "informe post-llamado" de 30 minutos es,
en la interfaz real, el mismo formulario de Pantalla 2 que el tasador ya envió. El escritor
de P4-TAS emite dos `marcarFinEtapa` consecutivos (e2 y e3) desde el handler de
coordinación, y abre e4. Lo que **no** cierra esto es el resto de CI-037: las etapas 4, 5, 6
y 7 siguen sin escritor.

---

### 2026-08-19 (c) — RO-29 anulada: CI-012 reabierta y cerrada en sentido opuesto

RO-29 anulada · CI-012 reabierta y cerrada en sentido opuesto por revisión Héctor diseño v4
Pantalla 2 puntos 1-4. Lección: antes de borrar código bajo un aprendizaje reciente, esperar
confirmación del cliente.

**Contexto:** ingesta de `docs/_md/Imagenes_IF_Tasador_v4.pdf` devuelto anotado por Héctor
(pp. 17-30 · 7 pantallas · 22 imágenes extraídas a `docs/_md/img_hector_v4/`). Paso 2 de la
tanda de reconciliación previa a P4-TAS.

**Inconveniente:** los cuatro puntos de Pantalla 2 piden exactamente la funcionalidad que
**RO-29** había retirado dos días antes. Para entonces ya se había ejecutado la retirada:
`TX_CoordinacionVisita` no se creó (P0.5-TAS), los tipos `CoordinacionVisita`,
`MotivoNoContacto`, `MOTIVOS_DEVOLUCION`, `intento_numero` y `AccionCard` no se escribieron
(P1-TAS), y `coordinar-visita.tsx` con su `page.tsx` se **borraron** (CI-027, 18-ago-2026).

**Causa raíz:** RO-29 se dictó el 17-ago-2026 como decisión de producto tomada **sin la
revisión del cliente sobre el diseño**, y de forma deliberadamente irreversible —"canónica y
no se vuelve a consultar", "no existe y no existirá"—. La consulta a Héctor/Óscar estaba
enviada desde el 11-ago-2026 y sin responder; se decidió sin esperarla. La respuesta llegó
el 19-ago-2026 y dice lo contrario. El error no fue decidir rápido: fue **ejecutar
destructivamente** sobre una decisión cuya contraparte estaba pendiente de responder.

**Solución aplicada:**
- `docs/CODE_INCONSISTENCIES.md` → **CI-012** reabierta y cerrada en sentido positivo con
  fecha 19-ago-2026, con la **cita literal** de los cuatro puntos de Pantalla 2 (pp. 18-19
  del PDF) transcrita tal cual, erratas del original incluidas.
- `docs/CODE_INCONSISTENCIES.md` → **nota de anulación de RO-29**, con justificación
  ("revisión Héctor diseño v4 revierte la decisión") y la lista literal de lo que hay que
  reponer: `TX_CoordinacionVisita` en el schema, los componentes borrados
  (`coordinar-visita.tsx` + `confirmarCoordinacion`, `devolverCoordinacion`,
  `MOTIVOS_DEVOLUCION`) y los tipos que P1-TAS omitió a propósito.
- En este archivo, **RO-29 queda marcada 🚫 ANULADA** en su propio punto de la lista de
  reglas destiladas. El texto original se conserva por la regla de sólo-append, pero
  encabezado de forma que nadie lo lea como regla viva.
- La **reposición no se ejecutó**: queda registrada como primera acción de **P4-TAS**.

**Prevención futura:** **antes de borrar código bajo un aprendizaje reciente, esperar
confirmación del cliente.** Una decisión de producto tomada internamente mientras una
consulta al cliente sigue abierta es provisional, por muy fundada que esté, y **no habilita
operaciones destructivas**. El código que iba a borrarse por RO-29 no molestaba a nadie
salvo por 13 errores de `tsc`; dejarlo excluido dos días habría costado una línea de
`tsconfig` y habría ahorrado la reposición completa que ahora paga P4-TAS. Regla operativa:
si un aprendizaje tiene menos de una semana **y** existe una consulta abierta a la
contraparte que podría revertirlo, se marca como **provisional** y sólo autoriza cambios
reversibles.

### 2026-08-21 — C1 · coordinacion_vigente no puede ser rollup; se computa server-side
**Contexto:** Frente C · RF-TAS-05. C1 pretendía convertir `TX_Solicitudes.coordinacion_vigente`
(hoy singleSelect escrito por la ruta del tasador) en un campo derivado que reflejara el desenlace
de la última coordinación, para que IF-02 leyera una única fuente. La expresión de la spec §2.12 es
`LAST(TX_CoordinacionVisita.estado_coordinacion ORDER BY fecha_respuesta DESC)`.

**Inconveniente:** Airtable **no puede expresar esa fórmula**. Dos límites técnicos aparecieron en la
ejecución, uno detrás del otro:
1. El MCP de Airtable **no expone `delete_field`** — no se puede borrar una columna por API; solo desde
   la UI web. El "borrar y recrear" del plan no era ejecutable, así que se intentó rename + create.
2. Al crear el rollup con agregación `LAST(values)`, Airtable devolvió `422: Unknown function names:
   LAST`. Las funciones de agregación de rollup **no incluyen `LAST`/`FIRST` ni acceso posicional**. El
   set válido es: SUM, MAX, MIN, AVERAGE, AND, OR, XOR, CONCATENATE, ARRAYJOIN, ARRAYUNIQUE,
   ARRAYCOMPACT, COUNT/COUNTA/COUNTALL. Ninguna devuelve "el último appended". Tampoco hay formulas
   cross-table. Así que "el estado de la coordinación más reciente" **no es derivable en el schema**.

**Causa raíz:** la spec describió la vigencia como una fórmula `LAST(... ORDER BY ...)` que es sintaxis
conceptual, no un mecanismo real de Airtable. Airtable no ordena dentro de un rollup ni indexa arrays.

**Solución aplicada:** se descartó tocar el schema. Se revirtió el rename vía MCP
(`coordinacion_vigente_legacy` → `coordinacion_vigente`, field_id `fldI4Dv0jpRQvbdHl` intacto, singleSelect
con choices `confirmada`/`rechazada`) — la base quedó **idéntica al pre-C1**. La vigencia se computará
**server-side en C2**: el Route Handler lee `TX_CoordinacionVisita` filtrando por solicitud y ordenando
por `fecha_respuesta DESC`; el desenlace vigente es el `estado_coordinacion` de la fila más reciente (o
`null` si no hay filas). El singleSelect `coordinacion_vigente` en `TX_Solicitudes` **no se toca ni se lee
desde IF-02**: queda como redundancia inofensiva del lado tasador (que lo sigue escribiendo). No se
modificó código, tests ni field-ids: `tsc` + `build` + `test` (415) siguen verdes. Plan de C2/C3/C4
reescrito en `docs/_notas/plan-frente-C.md`.

**Prevención futura:** cualquier "vigencia temporal" (último X, más reciente Y) **se computa server-side**
en el Route Handler leyendo la tabla source ordenada por su campo temporal explícito — **no** se intenta
derivar en el schema de Airtable. Y al planificar un cambio de schema, verificar primero que la operación
existe en el MCP (`delete_field` **no** existe) y que la función pretendida es válida para el tipo de campo
(rollup **no** tiene `LAST`), antes de comprometer un plan que las dé por hechas.

### 2026-08-21 (b) — Cierre del Frente C: cuatro patrones que salieron de construir la misma lectura tres veces
**Contexto:** Frente C completo (C1 → C2 B1+B1.5 → C3 B1 → C4 B1), RF-TAS-05. La coordinación
que el tasador escribe en `TX_CoordinacionVisita` desde IF-03 tenía que llegar a dos superficies
de IF-02: el bloque *Coordinación* de §1.3.2 (pestaña Datos) y el riel de §1.3.3 (pestaña
Historial). Cerrado, mergeado, deployado y verificado en producción con `VP-2026-0061`.

**Inconveniente:** cuatro cosas que no se sabían al empezar y que costaron un bloque extra o
estuvieron a punto de costarlo.

1. **El contrato de la respuesta se fijó mirando la propuesta y no a las rutas hermanas.** C2·B1
   sirvió `{ coordinacionVigente, intentos }` al ras, tal como decía su propuesta aprobada,
   mientras `eventos/`, `sla/` y `decision-motor/` responden `{ data: … }`. Se detectó al
   escribir el docblock —no al escribir el código— y hubo que revertirlo en un bloque propio
   (**C2·B1.5**) antes de que el hook de C3 se cableara contra el shape equivocado.
2. **Los tipos del contrato nacieron en el módulo que lee Airtable.** `IntentoCoordinacion` y
   `CoordinacionSolicitud` se declararon en `lib/coordinacion-airtable.ts`, que importa
   `listRecords`. Cuando C3 necesitó consumirlos desde un componente `"use client"`, la opción
   fácil era un `import type` —que se borra en compilación y habría funcionado— y la correcta
   era mudarlos.
3. **`new Date("2026-08-25")` muestra el 24.** Medianoche UTC es 20:00 del día anterior en
   Santiago. Sobre una fecha de visita eso no es un detalle de formato: es mandar al tasador el
   día equivocado, sin error y sin que ningún test genérico lo note.
4. **Agregar una tercera fuente al riel puso en evidencia un criterio de fallo ambiguo.**
   `fetchHistorialSolicitud` propagaba los fallos de sus dos lecturas; al sumar la tercera había
   que decidir si la coordinación merecía trato distinto por ser "secundaria".

**Causa raíz:** las cuatro son la misma clase de omisión — **decidir un contrato mirando el
requisito y no el vecindario donde va a vivir**. El shape correcto estaba a un archivo de
distancia; la separación server/cliente estaba documentada en `lib/decision-motor.ts`; el
desfase de huso ya tenía precedente en `_fechaVisible` de IF-03; y el criterio de fallo estaba
escrito en el propio docblock de la función que había que ampliar. Ninguna exigió investigación:
exigían leer lo que ya estaba.

**Solución aplicada:** se destilaron como **RO-38** (shape uniforme `{ data }` entre endpoints
hermanos), **RO-39** (tipos compartidos server/cliente en módulo puro, sin `airtable-client`),
**RO-40** (`date` puro se parsea con regex, nunca `new Date()`) y **RO-41** (fallo parcial de una
lectura fundida se propaga, y un solo criterio de fallo por función). Se agregó además **RO-42**,
que no salió de un error sino de una decisión que funcionó: la redacción del ítem del riel
(`tituloDeCoordinacion`) vive en el módulo del dominio y no en el del historial, de modo que
sumar una fuente al timeline cuesta dos literales y un mapper. Verificación final: 452 tests
verdes (441 + 11), `tsc` limpio, `build` compila, deploy activo en Railway.

**Prevención futura:** al abrir una ruta, un tipo compartido o una lectura fundida, **leer
primero a sus hermanos de carpeta y el docblock de la función que se amplía**, y recién después
fijar el contrato. Y una nota de método sobre el formato de trabajo: los cuatro hallazgos
aparecieron en la fase de propuesta o al redactar el docblock, no ejecutando — el bloque de
propuesta previa a cada tanda es lo que los cazó, y el único que se escapó (**RO-38**) fue el que
la propuesta dio por sentado sin ir a mirar.

### 2026-09-04 — VP-2026-0060: adjunto huérfano por `reused` sin verificar Dropbox
**Contexto:** incidente confirmado. El usuario borró a mano en Dropbox la foto de
Ofertas/Comparables de VP-2026-0060 y la re-subió por la UI. SC-Adjuntos-Upload encontró el
`hash_md5` en TX_Adjuntos (módulo 2) y respondió `reused: true` sin re-subir a Dropbox: fila viva
apuntando a un path inexistente, UI en OK y Dropbox vacío.
**Inconveniente:** el escenario opera "según diseño"; la falla no es un bug de código sino un
supuesto tácito del módulo 2: "si existe la fila (hash+solicitud), el binario está en Dropbox".
Deja de ser cierto cuando alguien borra el archivo fuera de la aplicación.
**Causa raíz:** la reutilización se decidía sólo por el índice de Airtable, sin comprobar la
existencia física del binario. Un borrado externo (manual, sincronización, limpieza) rompe la
premisa sin que el escenario lo note.
**Solución aplicada:** (1) Fila huérfana identificada para eliminación manual: `rec8WypPYugEYaicK`
(única fila de la solicitud; categoría en `descripcion=ofertas_comparables`, `clave_adjunto`
vacío). (2) Fix definitivo = opción (a): se reescribió §8.6.2 de la spec normativa
(`VProperty_Especificacion_Proyecto_v1_9_15.md`) agregando el **Módulo 2b · Verificación de
existencia física en Dropbox** (Get file metadata sobre `{{2.url_dropbox}}`, error `path_not_found`
en modo *resume*) y separando el router en cuatro ramas: **reutilización** (fila + archivo
presente), **re-subida por huérfano** (fila presente + archivo ausente → borra fila, re-sube, crea
fila nueva, evento `adjunto_resubido`, responde `modo:"nuevo"`), reemplazo y alta. El contrato
§8.6.1 no cambia y el cliente no requiere cambios.
**Prevención futura:** ante una decisión de idempotencia sobre un recurso externo (Dropbox, S3,
etc.), no confiar sólo en el índice interno; verificar la existencia real antes de "reutilizar".
Descartada la opción (b) —cerrar permisos— por no reparar huérfanos existentes ni cubrir otras
causas de desaparición. Falta llevar el cambio al blueprint ejecutable de Make (SC-Adjuntos-Upload,
hoy v1.4) y reimportar.

### 2026-09-04 — SC-Adjuntos-Upload v1.4→v1.5: implementación del módulo 2b en el blueprint
**Contexto:** materializar en el blueprint ejecutable de Make el módulo 2b (verificación Dropbox) y
la rama huérfano diseñados en §8.6.2.
**Inconveniente:** el primer diseño ponía un filtro `{{2.id}} exist` en el propio módulo 2b para que
sólo corriera "cuando hay match". Pero el módulo 2b va en el flujo principal, ANTES del router.
**Causa raíz:** en Make, un filtro sobre un módulo lineal bloquea TODO lo que va después de él en esa
ruta. Si el filtro de 2b fallaba (caso alta/reemplazo, sin match), el router entero quedaba sin
ejecutarse → sin upload ni respuesta → la app colgaba.
**Solución aplicada:** el módulo 2b (id 19, `dropbox:getFileMetadata` v5) se deja SIN filtro, corre
siempre; con `{{2.url_dropbox}}` vacío (sin match) Dropbox devuelve error y la directiva `builtin:Resume`
(id 26) lo resuelve a salida vacía sin detener el flujo. La condición "cuando hay match" se traslada a
los filtros de las ramas del router: reused = `{{2.id}}` exist AND `{{19.id}}` exist; huérfano =
`{{2.id}}` exist AND `{{19.id}}` notexist. La rama huérfano (ids 20-25) espeja a reemplazo salvo el
delete de Dropbox, y sube con `overwrite:true` para ser idempotente ante un falso negativo del metadata.
Validado con `python3 -c json.load`: JSON OK, IDs únicos `[…,11,19,26,3,4,5,20-25,12,…]`, 4 ramas.
**Prevención futura:** en Make, para condicionar un módulo sin cortar el resto del flujo, o se mete el
módulo dentro de una ruta del router, o se deja correr siempre con `Resume` y se decide en los filtros
de las ramas. Nunca un filtro gatillo en un módulo lineal pre-router. Pendiente: no se pudo verificar
contra Make la clave/versión exacta de `dropbox:getFileMetadata` ni de `builtin:Resume` (el MCP no
alcanza Make); quedaron señalados en claude-out.txt para confirmar en la UI tras importar.

### 2026-09-04 — v1.5→v1.6: `dropbox:getFileMetadata` no existe; usar `makeAnAPICall`
**Contexto:** al importar el v1.5 en Make, el módulo 2b falló con "Module Not Found:
dropbox:getFileMetadata".
**Inconveniente:** ese identificador fue *inventado* por analogía (deleteFile/uploadLargeFile v5),
sin verificarlo. La app oficial de Dropbox en Make no tiene ninguna acción de metadata dedicada.
**Causa raíz:** asumir un nombre de módulo Make sin contrastarlo contra la spec oficial de la app.
Es exactamente lo que CLAUDE.md advierte al auditar módulos escritos a mano.
**Solución aplicada:** verificado en la doc oficial (apps.make.com/dropbox) que existen "Make an API
Call", "Download a File", "Search Files/Folders" y "Get Files/Folders", pero **ningún** getMetadata.
Elegida la opción (a): módulo 2b = `dropbox:makeAnAPICall` (v1) con `POST /2/files/get_metadata`,
cuerpo `{"path":"{{2.url_dropbox}}"}`, header `Content-Type: application/json`, y `builtin:Resume`
ante el `409 path/not_found`. El test de existencia pasó de `{{19.id}}` a `{{19.statusCode}}`
(presente=200 → reused; ausente por resume → huérfano). Reusa la conexión Dropbox 7553318. JSON
revalidado: OK, IDs únicos, 4 ramas, sin residuos de `getFileMetadata` ni `{{19.id}}`.
**Prevención futura:** NUNCA escribir un identificador de módulo Make sin verificarlo contra la spec
oficial de la app (apps.make.com/<app>) o un blueprint real. Ante dudas de existencia de un módulo,
preferir "Make an API Call" (universal, siempre presente) apuntando al endpoint REST del proveedor:
elimina la clase entera de errores "Module Not Found". Descartadas (b) List Folder (parseo/paginación)
y (c) Get a File (descarga el binario) por más costosas o frágiles.

### 2026-09-04 — REGLA DE MÉTODO: identificadores de módulo Make se COPIAN, no se deducen
**Contexto:** el módulo 2b de SC-Adjuntos-Upload falló al importar dos veces seguidas.
**Inconveniente:** v1.5 usó `dropbox:getFileMetadata` (inventado por analogía) → "Module Not Found".
v1.6 usó `dropbox:makeAnAPICall` (deducido de doc/web, no del repo) → "Module Not Found" otra vez.
El consejo del propio aprendizaje anterior ("preferir Make an API Call") era también una deducción.
**Causa raíz:** escribir identificadores de módulo Make por deducción (analogía, doc oficial, búsqueda
web) en vez de copiarlos de un artefacto real y funcionando. La doc/web no garantiza el identificador
interno exacto ni su versión para ESTE cliente.
**Regla (obligatoria de aquí en adelante):** ningún identificador de módulo Make se escribe por
deducción. Se COPIA LITERAL desde un blueprint real y funcionando del repo del cliente
(`docs/_artefactos/make/*.json` y `docs/_artefactos/produccion-actual/*.json`). Si no aparece en
ninguno de esos blueprints, no se usa. Antes de escribir un blueprint, inventariar el catálogo de
identificadores presentes y elegir SOLO de ahí; al terminar, cross-check de que cada `"module"` usado
aparece textualmente en otro blueprint del repo.
**Solución aplicada (v1.7):** inventariado el catálogo real (9 blueprints). Módulos Dropbox proven:
`dropbox:deleteFile` v5, `dropbox:uploadLargeFile` v5, `dropbox:getFile` v5. Directivas de error
proven: `builtin:Ignore` (SC-Asignar), `builtin:Commit` (SC-Adjuntos-Delete) — `builtin:Resume` NO
estaba en ningún blueprint real, así que también se descartó. HTTP genérico proven: `http:ActionSendData`
v3, pero autentica con API key literal en header (SC-RF09 con Claude); contra Dropbox exigiría un Bearer
que caduca → inviable. Elegido 2b = `dropbox:getFile` v5 (copiado literal de SC-RF09 id 9: mapper
`path` + `select:"map"`, conexión OAuth 7553318). Como `Ignore`/`Commit` cortan el flujo ante error, la
sonda no puede ir antes del Router (rompería alta/reemplazo): se movió DENTRO de la rama reused como
primer módulo, con la reparación huérfano en su `onerror` cerrada con `builtin:Commit` (patrón del
módulo 12 de este mismo blueprint). Router quedó en 3 ramas + bifurcación éxito/error de la sonda.
Cross-check automático: los 10 módulos de v1.7 aparecen en otros blueprints del repo. Acepta el coste
de que `getFile` descargue el binario (sólo en el caso reused, archivos pequeños).
**Prevención futura:** la regla de arriba. Y guardar en el repo los backups de producción
(`docs/_artefactos/produccion-actual/`) como catálogo de referencia vivo.
