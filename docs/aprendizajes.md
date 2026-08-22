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

Consultar esos archivos sólo para el detalle histórico de un incidente concreto.
Lo que sigue vigente como regla vive abajo, destilado.

## Estado de tareas

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

### 2026-08-06 — Cierre de Tanda 3: cuatro patrones validados end-to-end en producción

**Contexto:** paso 5 del checkpoint de Tanda 3. Casos (a) —borrado real— y (e).1/(e).2 —modo consulta RN-59— ejecutados contra la base productiva `app9G7lLkIV3CpeLa` y Dropbox real. Los cuatro bloques siguientes no son incidentes resueltos sino patrones confirmados con evidencia, anotados para reutilización.

**Patrón 1 · Relectura confirmatoria en mutaciones destructivas sobre listas visibles.**
`components/console/document-checklist.tsx:250-252` desmarca el tipo del checklist **sólo** después de que la relectura confirmó que el adjunto desapareció, nunca por optimismo del estado local. La evidencia de (a) está en el log del dev server: `[ADJUNTOS-LEER] ok · encontrados: 2 · claves: ['certificado_numero','foto_ofertas_comparables']` antes del borrado, y `encontrados: 1 · claves: ['foto_ofertas_comparables']` después. Por eso el checklist se refrescó sin recargar la página y sin quedar nunca en un estado que la base no respaldara. La alternativa —marcar vacío al recibir el 200— habría dejado la fila desmarcada si el borrado hubiera fallado parcialmente en Make, y el usuario habría visto un checklist que miente. Aplicable a cualquier mutación destructiva sobre una lista visible: el estado local se actualiza desde la fuente de verdad, no desde la expectativa.

**Patrón 2 · Regla D en confirmaciones irreversibles: deshabilitar los dos botones.**
El `AlertDialog` de eliminación (`document-checklist.tsx:411-432`) deshabilita durante el fetch **tanto** `AlertDialogAction` como `AlertDialogCancel` (`disabled={eliminando}` en las líneas 421 y 424), y el botón principal muestra `<Loader2 data-icon="inline-start" className="animate-spin" />` **más** el texto «Eliminando…» — no sólo el spinner. Verificado en pantalla durante (a). Deshabilitar Cancelar importa tanto como deshabilitar Aceptar: con el borrado ya en vuelo hacia Make, un Cancelar que cierra el diálogo comunica que no pasó nada cuando sí está pasando. Y el texto en gerundio junto al spinner evita la ambigüedad de un botón que gira sin decir qué hace. Aplicable a toda confirmación de acción irreversible.

**Patrón 3 · Auditoría de rama cuando la operación toca dos sistemas.**
El borrado atraviesa Airtable **y** Dropbox, y las ramas de fallo parcial son indistinguibles desde el resultado HTTP: un 200 puede significar «se borraron ambos» o «la fila se borró pero el binario ya no estaba». Se resuelve en dos niveles complementarios:
- `SC-Adjuntos-Delete` escribe `detalle_json` en `A_Eventos` con `dropbox_borrado: true|false`, que distingue la rama limpia (módulo 8) de la rama `path_not_found` (módulo 32).
- `app/api/adjuntos/[id]/route.ts:215-220` sólo emite `[ADJUNTOS-DELETE]` ante `aviso: "huerfano_dropbox"`, y el `switch` de `data.reason` (líneas 233-278) mapea `mismatch → 409`, `dropbox_failed → 502` y `airtable_orphan → 500` con el prefijo grep-eable `[ADJUNTOS-DELETE-ORPHAN]`. **El silencio en el log es, por diseño, evidencia positiva de rama limpia.**

Evidencia de (a): cero líneas `[ADJUNTOS-DELETE]` en el log, y en `A_Eventos` (`recR3suWL7jirwm3G`) `detalle_json = {"adjunto_id": "recacm1FMINZmg8Gg", "tipo_documento": "certificado_numero", "subido_por": "Ejecutivo", "dropbox_borrado": true}` con `descripcion = «Adjunto eliminado del checklist: prueba-descartable.pdf (tipo certificado_numero) por Ejecutivo.»` — no la redacción alternativa «El binario ya no estaba en Dropbox», que habría delatado la rama 32. En `LogEscenarios`, fila `rec157yR3fZPz6GjY` con `Escenario = ADJUNTOS_DELETE`, `Estado = ✓ OK`, `Duracion ms = 3835`. Aplicable a cualquier operación que cruce dos sistemas: la respuesta HTTP no alcanza para auditar, hace falta un campo que nombre la rama tomada.

**Patrón 4 · RN-59 modo consulta validado en las dos capas, no en una.**
`lib/rn59.ts:26-34` sostiene que «deshabilitar un botón es feedback, no control de acceso» (§8.6.5) y por eso la regla vive en servidor y en interfaz. Ambas quedaron probadas por separado contra producción:
- **(e).1 · capa servidor.** `DELETE /api/adjuntos/{id}` con `solicitud_id` de VP-2026-0055 (`asignada` + tasador) devolvió **409** con `{"ok":false,"error":"conflicto_negocio","motivo":"La solicitud está en modo consulta: no se pueden eliminar documentos."}`. La petición no vino de la UI sino de un `fetch` directo desde la consola del browser — exactamente el vector que la capa de interfaz no puede cubrir.
- **(e).2 · capa interfaz.** El sheet de VP-2026-0038 (`asignada` + tasador Sergio Gajardo), **con sus 5 adjuntos efectivamente cargados**, mostró el banner ámbar «Solicitud asignada · modo consulta. Los documentos no pueden editarse mientras exista un tasador asignado.» y cero controles de escritura: ni Reemplazar, ni papelera, ni subir, ni checkbox marcable. Lo único accionable es **Descargar** (`documentos-adjuntos-sheet.tsx:341-355`, con badge «Sin archivo» cuando no hay binario). Los controles están **ocultos, no deshabilitados** (`document-checklist.tsx:102`, `:471`).

El matiz metodológico vale más que el resultado: las dos primeras verificaciones de (e).2 fueron **inválidas sin que se notara**, porque la lectura de adjuntos estaba fallando y un sheet sin filas no renderiza botones de todos modos — la ausencia de controles no probaba nada. Sólo la tercera pasada, con los adjuntos visibles, distingue «oculto por RN-59» de «ausente por falta de datos». Al verificar que un control **no** aparece, hay que confirmar antes que aparecería de no existir la regla.

**Prevención futura:** los cuatro patrones comparten una misma idea — no confiar en la señal cómoda. El estado local no confirma el borrado (1), el spinner no confirma que la acción esté bloqueada (2), el 200 no confirma qué rama corrió (3), y la ausencia de un botón no confirma que una regla lo ocultó (4). En cada caso hay una segunda señal, más barata de lo que parece, que sí lo confirma.

### 2026-08-06 — Cierre del paso 5 de Tanda 3: ruta 0, silencio deliberado, diálogos locales y una medición truncada

**Contexto:** casos (a) a (e) de RF-52 ejecutados contra la base productiva y Dropbox real. Los cinco cerraron en verde. Lo que sigue son los patrones y el error de método que dejó el recorrido.

**Patrón 1 · La ruta 0 (`reused`) es una no-operación real, no un update idempotente.**
Subir a un tipo ya ocupado un binario con **el mismo** `hash_md5` hace que `SC-Adjuntos-Upload v1.2` responda `modo: "reused"` sin tocar nada. «Sin tocar nada» quedó medido, no supuesto, con tres señales independientes:
- `TX_Adjuntos.ultima_modificacion` de la fila afectada (`reclS1NggjitW1JqM`) siguió en `2026-08-06T21:24:55.000Z`, idéntico antes y después. Airtable mueve ese campo ante **cualquier** escritura, incluso una que reescriba los mismos valores; si Make hubiera hecho un update idempotente, el timestamp lo habría delatado.
- Dropbox conservó el timestamp de modificación original del binario (`6/8/2026 17:24`), o sea que tampoco hubo resubida.
- Cero líneas `[ADJUNTOS-UPLOAD]` en el log del server: ese log sólo se emite con `modo === 'reemplazo'` (`app/api/adjuntos/upload/route.ts:170-178`).

El contraste con el caso (b) es la parte instructiva: **el payload fue byte a byte el mismo** —mismo `hash_md5`, mismo `contenido_base64`, las mismas nueve claves snake_case de `lib/adjuntos-uploader.ts:160-175`— y el desenlace cambió de `reemplazo` a `reused`. La única variable fue el estado previo del tipo en Airtable. Confirma que la decisión `nuevo`/`reused`/`reemplazo` vive entera en el escenario Make y que el cliente ni la pide ni la influye: no existe flag de reemplazo en el payload. Aplicable a cualquier escenario donde haga falta garantizar ausencia de efectos secundarios en una llamada aparentemente mutante — el `lastModifiedTime` de Airtable es el detector más barato y más fino disponible, más que comparar valores campo a campo.

**Patrón 2 · El silencio como mensaje correcto: sin toast en `reused`.**
`components/console/document-checklist.tsx:202-205` emite `toast.success("Documento reemplazado")` **sólo** si `resultado.modo === "reemplazo"`. Con `reused` no se emite nada, y el comentario del código lo razona citando §8.6.4: la confirmación que el usuario acaba de aceptar «habrá sido innecesaria pero nunca engañosa». Anunciar «Documento reemplazado» cuando no se reemplazó nada sería precisamente el mensaje falso que la spec quiere evitar. **No es un olvido y no se toca en esta tanda.** La regla general: no anunciar una acción que no ocurrió. Queda como candidato de producto —no de corrección— un aviso informativo del tipo «Este archivo ya estaba cargado», porque desde fuera «no pasó nada» se parece a «falló en silencio».

**Patrón 3 · Los `AlertDialog` destructivos son puramente locales hasta la confirmación.**
Caso (c): cancelar el diálogo de reemplazo y el de eliminación no produjo **ninguna** escritura. Contra línea base tomada a las 21:31:07Z, `TX_Adjuntos` 13→13, `LogEscenarios` sin filas nuevas, `A_Eventos` 58→58, y los `ultima_modificacion` de las dos filas de la solicitud inmóviles. En el log del server, cero `POST /api/adjuntos/upload` y cero `DELETE /api/adjuntos/[id]`; la única petición fue un `GET .../adjuntos` que corresponde a abrir el sheet, no a las cancelaciones — el efecto de `lib/use-adjuntos-solicitud.ts:150-192` depende de `[solicitudId, activo, version]`, y el estado de los diálogos vive en otro componente sin tocar ninguna de esas tres. No hay pre-flight, ni lock optimista, ni aviso al servidor de que el usuario está por hacer algo. **Cancelar es gratis y no deja rastro en ningún sistema** — es justamente la propiedad que hace seguro anteponer una confirmación a una acción irreversible.

Se verificó además que la secuencia de §8.6.4 se respeta también en el camino de rechazo: el selector de archivo **nunca** se abrió al cancelar el diálogo de reemplazo. `pedirArchivo()` (`document-checklist.tsx:229-235`) sale con `return` cuando hay adjunto persistido y sólo `confirmarReemplazar()` (`:237-240`) llama al `inputRef`.

**Error de método · `maxRecords=100` sobre una tabla de 208 filas.**
Todas las verificaciones de `LogEscenarios` de la sesión se hicieron con `maxRecords=100`. La tabla tiene **208 filas**. El «100 → 100 filas, sin cambios» que se reportó en el caso (d) no medía la tabla: medía el tope de página. Rehecha la consulta paginando con `offset`, aparecieron las dos filas nuevas esperadas.

Los diffs de (a) y (b) resultaron correctos **por suerte** —las filas nuevas cayeron dentro de las primeras 100 devueltas—, pero una conclusión sí fue falsa: en (b) se afirmó que «RF-09 no se disparó esta vez», y sí se había disparado; la fila `SC-RF09-ExtraccionClaude · ✗ Error` de las 21:24:55 estaba fuera de la ventana. `A_Eventos` (58) y `TX_Adjuntos` (13) no estaban afectadas por estar bajo el tope.

**Prevención futura:** `maxRecords` es un límite, no un total, y un conteo que coincide exactamente con él es señal de truncamiento, no de estabilidad. Para contar o diffear una tabla hay que paginar con `offset` hasta que la respuesta no lo devuelva, u ordenar explícitamente por fecha de creación descendente y comparar por record ID. **Nunca inferir «no pasó nada» de un conteo que da justo el tope de página.**

Es el segundo error de la misma familia en la sesión, después de `esRespuestaDeClerk` (ver entrada anterior de hoy): en ambos casos una medición incompleta —un `content-type` que no distinguía, un conteo truncado— produjo una conclusión falsa con apariencia de evidencia. El patrón a vigilar es la señal barata que parece concluyente y no lo es.

**Patrón 4 · Payload idéntico, desenlaces distintos: la decisión vive en el backend.**
En los casos (b) y (d) el payload snake_case enviado a Make fue **byte a byte el mismo**: mismo `solicitud_id` (`recIEvKCbe7J8TDaB`), mismo `tipo_documento` (`certificado_numero`), mismo `hash_md5` (`76c1cdc24450ec4fac76d0d57b24be6e`) y mismo `contenido_base64`. Comparados sobre el campo `Detalle` de las dos filas `ADJUNTOS_UPLOAD` de `LogEscenarios`, donde `postToMake` persiste el payload literal. Y sin embargo (b) devolvió `modo: "reemplazo"` y (d) devolvió `modo: "reused"`.

La decisión `nuevo` / `reused` / `reemplazo` vive **entera** en `SC-Adjuntos-Upload v1.2`, que compara el `hash_md5` del payload contra el estado previo de `TX_Adjuntos` filtrado por la pareja (solicitud, `tipo_documento`). La única variable entre ambos casos fue ese estado previo: en (b) el tipo tenía `prueba-A.pdf` con otro hash, en (d) tenía `prueba-B.pdf` con el mismo.

El cliente no puede tomar esa decisión ni influirla, y no por convención sino por imposibilidad: **no conoce el hash previo**. Cuando el usuario elige el archivo, el checklist ya renderizó lo que había, pero el hash del binario existente no viaja en la lectura de adjuntos; el hash del archivo nuevo se calcula recién al leerlo del disco (`lib/adjuntos-uploader.ts:114`). Por eso el payload **no lleva ningún flag de reemplazo**: el cliente sólo envía el archivo y su hash, y el backend resuelve qué operación real ejecutar. Es también la razón de que el diálogo de confirmación se dispare por *tener adjunto previo* y no por *saber que el hash difiere* (`components/console/document-checklist.tsx:223-227`).

Aplicable a cualquier flujo donde el cliente delegue al backend la decisión de qué operación ejecutar y esa decisión dependa de estado que sólo el backend conoce. El corolario de diseño es que la respuesta debe **nombrar** la operación efectivamente ejecutada —aquí el campo `modo`—, porque es el único modo que tiene el cliente de saber qué pasó y de ajustar su feedback en consecuencia (ver Patrón 2: el toast se decide leyendo `modo`, no anticipando el resultado).

**Pendiente abierto · RF-09 falla sistemáticamente al dispararse.**
`AT-RF09-Trigger` (automation de Airtable, `deployed`, trigger `recordCreated` sobre `TX_Adjuntos` `tblur71x1oItbmKZc`) reacciona a cada adjunto nuevo, pero el webhook falla al ejecutarse. Dos ocurrencias registradas en `LogEscenarios` el 06-ago-2026, ambas con `Escenario = SC-RF09-ExtraccionClaude`, `Estado = ✗ Error`, `Trigger = AT-RF09-Trigger`, `Titulo Log = «error al disparar webhook»`: a las 19:09:09 (alta de `prueba-descartable.pdf`) y a las 21:24:55 (reemplazo por `prueba-B.pdf` del caso (b)). Consecuencia: `TX_Adjuntos.estado_extraccion` (`fld54epvDJ7YdJIYD`) queda sin poblar. **No se tocó en Tanda 3** — no afecta a ninguno de los 5 casos, los adjuntos se crean correctamente. Va como tarea independiente posterior.

Nota lateral del mismo hallazgo: cada **reemplazo** relanza la extracción, porque `SC-Adjuntos-Upload v1.2` borra la fila previa y crea una nueva (delete + insert, no update — verificado en (b): `recHCYsJOXpT21uUW` → `reclS1NggjitW1JqM`). Reemplazar tiene coste de API de Claude, no sólo de almacenamiento.

---

### 2026-08-06 — Tanda v1.9.6 · Reestructura del path Dropbox

**Contexto:** tanda 100% documental. Se reemplazó la estructura de carpetas Dropbox de §8 del spec —`/VProperty/{ClienteSlug}/{AAAA}/{codigo_solicitud}/{subcarpeta}/`— por una jerarquía nueva que introduce el nivel Unidad: `/Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/`. Bump `v1_9_5` → `v1_9_6` con `git mv`, más CI-003 y CI-004 en `docs/CODE_INCONSISTENCIES.md`. No se tocó código ni blueprints Make.

**Lecciones activas (patrones repetibles):**

**1 · Verificar el schema Airtable antes de tocar el spec.** §8.1 y §8.5 citaban `M_Clientes.slug_url` y `TX_Solicitudes.cliente_slug` como fuentes del segmento de cliente. Ninguno de los dos campos existe: son fantasmas que vivieron en la norma sin que nadie los verificara, y §8.5 los declaraba dependencias formales de la Sección 8. Regla nueva: **todo campo Airtable citado en el spec se valida contra MCP en la misma tanda que lo introduce o lo modifica**. Cuando el spec describe un campo y el schema no lo tiene, el error es del spec, no del schema. La fuente real resultó ser `M_Clientes.nombre` (`fldDGR9WLhOtIbikW`), alcanzada desde `TX_Solicitudes.cliente` (`fldttL5myzLohDwHv`).

**2 · El spec puede describir un target que la implementación todavía no produce.** Es válido cuando la migración se difiere a propósito. Lo que no es válido es dejarlo implícito: la brecha se declara como entrada `CI-xxx` en `docs/CODE_INCONSISTENCIES.md` (aquí CI-003), y la auditoría del RF afectado se acota con **cláusula de corte por fecha** para no dar 100% de incumplimiento el día 1 sobre archivos que estaban bien guardados según la norma vigente cuando se subieron. RF-51 quedó acotado a `fecha_solicitud >= 2026-08-06`, con el histórico *grandfathered* en `/VProperty/Tasaciones/…`.

**3 · Diagnóstico-antes-de-código también aplica a cambios de documentación.** El diagnóstico previo evitó reescribir §8 arrastrando los mismos errores que ya tenía. Cuatro hallazgos que **no estaban en el prompt inicial** salieron sólo de mirar: los campos inexistentes de §8.5, el conflicto del PDF de RF-39 con un árbol por unidad, la colisión entre dos unidades del mismo subtipo, y los adjuntos que se cargan antes de que existan unidades. La regla de una RF por sesión tiene su equivalente documental: una sección por tanda, diagnosticada antes de escribirse.

**4 · `TX_Adjuntos.dropbox_path` es un snapshot inmutable.** El nivel Unidad es el primer segmento del path que deriva de un campo **editable** (`TX_Unidades.subtipo`, singleSelect, modificable en estado `creada` por RN-59); hasta ahora todos derivaban de datos fijos. Si el subtipo se corrige después de subir, el binario no se mueve y el path envejece en silencio. Divergencia aceptada y documentada (CI-004). La alternativa —reubicar el binario— invalida el `url_dropbox` ya persistido y ya entregado en UI y correos, y exige un módulo Dropbox de movimiento no probado en la instancia: exactamente la clase de apuesta que causó E-026 y el `dropbox:deleteAFile` de Tanda 3.

**5 · La idempotencia por `hash_md5` manda sobre la estructura de carpetas.** Un documento que cubre varias unidades —una escritura de depto + estacionamiento + bodega— **no se puede duplicar por unidad**: `SC-Adjuntos-Upload` compara por (`hash_md5`, solicitud) y ante el mismo hash responde `reused: true` sin volver a subir, así que las copias sencillamente no se producirían. La estructura tuvo que adaptarse al escenario y no al revés: carpeta `comun/` al nivel de la solicitud, un binario, N links en `TX_Adjuntos.unidad`. Antes de diseñar una jerarquía de almacenamiento, comprobar qué invariantes ya impone el escenario que escribe.

**6 · La normalización de nombres para Dropbox se escribe en pseudocódigo, no en prosa.** `M_Clientes.nombre` es texto libre con mayúsculas inconsistentes (`AFIANZA` y `Afianza` como registros distintos), acentos (`VALÓN`), espacios (`Banco Estado`) y símbolos (`M&V`). Una descripción textual del tipo «uppercase sin acentos» deja fuera el orden de los pasos y produce dos árboles distintos según quién la implemente. §8.5 lleva ahora los seis pasos en pseudocódigo —diacríticos, mayúsculas, `&`→`_Y_`, puntos eliminados, espacios→`_`, colapso de dobles, recorte de bordes— más seis casos resueltos contra datos reales. Aplica a cualquier valor que viaje de un campo de texto libre a un identificador de sistema de archivos.

**7 · Toda derivación de año/mes/día en el spec declara zona horaria.** `INFORMES_{AAAA}` sale de `TX_Solicitudes.fecha_solicitud`, que es `dateTime` almacenado en **UTC**. Sin declarar zona, cada solicitud creada entre las 21:00 del 31 de diciembre y la medianoche de Santiago cae en la carpeta del año siguiente: un bug que aparece una vez al año, en pocas horas, y que nadie reproduce cuando lo reportan. La zona queda fijada en `America/Santiago` en §8.1 y §8.5, y el mismo criterio se aplicó al corte de RF-51.

**Pendientes abiertos por esta tanda (no bloquean el cierre):**

- `lib/tipos-documento.ts:53` cita `VProperty_Especificacion_Proyecto_v1_9_5.md`, archivo que ya no existe tras el `git mv`. Fix trivial, próxima tanda de código.
- §5.4 (IF-11) sigue citando el fantasma `M_Clientes.slug_url`. No se corrigió en esta tanda porque decidir qué campo real cumple la función que `slug_url` tenía en IF-11 es una decisión de producto, no una corrección de redacción.
- **CI-003**: migrar el path implementado (`/VProperty/Tasaciones/{codigo_ext}/…`) al del spec v1.9.6. Toca `SC-Adjuntos-Upload`, `lib/adjuntos.ts` y probablemente un helper de composición de path. Nota de diseño ya registrada en la ficha: el payload actual del webhook no alcanza —`{Cliente}` exige leer y normalizar `M_Clientes.nombre`, `{AAAA}` exige convertir a Santiago y `{Unidad}` exige contar unidades hermanas para decidir el sufijo—, así que conviene componer el path en el Route Handler y dejar Make como transporte. Tanda futura, sin fecha.

---

### 2026-08-06 (b) — Tanda plan-ejecucion-if02 v1.5 → v1.6

**Contexto:** realineamiento del plan de ejecución IF-02 con la reestructura del §8 (path Dropbox) de spec v1.9.6, hecha en la tanda anterior del mismo día. Incluyó el move `docs/_notas/` → `docs/_md/` —el plan pasa a ser normativo— y 11 ediciones puntuales, +33 líneas. Cero secciones nuevas, cero renumeración, cero cambios de formato.

**Lecciones activas (patrones repetibles):**

**1 · La normativa que habla en abstracto envejece mejor.** El diagnóstico anticipaba paths literales `/VProperty/…` regados por el plan; el grep devolvió **cero**. Ni `{ClienteSlug}`, ni `slug_url`, ni `/captura/fotos/`, ni `/informe_final/`. El plan menciona Dropbox una docena de veces y siempre en abstracto —«sube archivos a Dropbox», «enlace Dropbox»—, y por eso una reestructura completa de §8 apenas lo rozó. Regla: **en documentos normativos que no son el spec, no embeber paths, FIELD_IDs ni estructuras concretas**; referir por § o por RF y dejar que sólo el spec los materialice. Cada dato concreto duplicado fuera del spec es una unidad de arrastre en el próximo bump. Contraejemplo del mismo archivo: §9.5 sí lleva FIELD_IDs (`fldEccoUrOjV7oKZ5`, `fldZTVpXDRtXXPjyv`) porque son el contrato del correo al tasador, y ahí la concreción se paga sola.

**2 · Un diagnóstico puede revelar que el trabajo previsto no existe.** El prompt de la tanda anticipaba grep exhaustivo, arrastres múltiples y «checkpoints repetidos *verificar path /VProperty/…*» que había que enumerar. Ninguno existía. El resultado real fueron 8 ediciones puntuales, de ellas **una sola sustantiva**. Sin el paso de diagnóstico se habría reescrito de más, con el coste añadido de que reescribir un plan de 1.845 líneas para nada tiene un riesgo de regresión que el trabajo evitado no compensa. Refuerza la lección 3 de la entrada anterior de hoy —diagnóstico-antes-de-código también aplica a documentación—, con un matiz nuevo: **el diagnóstico vale especialmente cuando el prompt hace supuestos sobre la magnitud del trabajo**, porque esos supuestos son la parte que nadie verifica.

**3 · La app y la norma divergen en las dos direcciones.** §9.1 del plan describía que desmarcar un tipo del checklist «desvincula el archivo, que queda en Dropbox», mientras `document-checklist.tsx` ejecuta desde Tanda 3 el borrado duro de fila y binario vía `SC-Adjuntos-Delete` (RF-52 · §8.6). Lo habitual es que la norma vaya adelante y el código atrás; aquí era al revés, y el reflejo de «corregir el código para que cumpla el documento» habría revertido una funcionalidad probada en producción hace un día. Regla: **ante una contradicción entre documento y código, determinar cuál representa la verdad vigente antes de decidir qué se corrige**. El default «manda el documento» falla tantas veces como el opuesto; lo que decide es la fecha y la evidencia de ejecución, no la jerarquía del artefacto.

**Deuda registrada en §13 del plan v1.6:**

- **CI-003** · path Dropbox v1.9.6: `SC-Adjuntos-Upload` y `lib/adjuntos.ts` siguen produciendo `/VProperty/Tasaciones/{codigo}/…`, el path pre-v1.9.6. No bloquea P8.
- **CI-004** · `TX_Adjuntos.dropbox_path` como snapshot inmutable.
- Captura del nivel Unidad en el sheet P8, bloqueada por CI-003. El comportamiento previsto —auto-derivar con una unidad, selector con dos o más, `comun/` para multi-unidad— quedó como nota de diseño en §9.1 sin tocar el layout del sheet.

**Divergencia menor descubierta al paso (no bloquea):** `SC-Adjuntos-Upload` declara `v1.2` en `docs/_artefactos/make/` y `v1.1` en el export de `docs/_artefactos/produccion-actual/`. Es la **Deuda #3** ya registrada el 05-ago-2026; §10.4.1 del plan ahora la deja explícita en vez de dejar el número sin marcar. Etiquetar la lista de artefactos-a-importar con la versión del repo y anotar aparte la de producción es lo que hace visible la brecha: un solo número habría escondido cuál de los dos se estaba nombrando.

---

### 2026-08-07 — CI-003b · Los tres fallbacks silenciosos que el panel revirtió

**Contexto:** tanda de ajuste sobre CI-003, ya commiteada como `47821c9` (composición del path Dropbox v1.9.6 en Next.js, `SC-Adjuntos-Upload` v1.2 → v1.3). La implementación cerró la brecha con la norma, pero resolvió con fallbacks silenciosos tres bordes que §8.1 no cubre. El panel los revisó uno a uno antes de dar el commit por bueno y revirtió los tres. CI-003b es esa reversión.

**Inconveniente:** los tres bordes producían una subida "exitosa" que dejaba el archivo en la carpeta equivocada, de forma permanente y sin que nadie se enterara:

| Borde | Fallback inicial | Resolución CI-003b |
|---|---|---|
| Solicitud sin `cliente` vinculado (existe: VP-2026-0044) | carpeta `SIN_CLIENTE/` + `console.warn` | **422 `cliente_sin_vincular`** |
| Solicitud con 2+ unidades y sin selector en el checklist | carpeta `comun/` + `console.warn` | **422 `unidad_no_especificada`** |
| Dos unidades del mismo subtipo sin `numero_unidad` | ordinal directo | cascada `numero_unidad` → `rol_sii` → ordinal **con warning** |

**Causa raíz:** el criterio con el que se eligieron los tres fue "no bloquear a la Ejecutiva por un defecto de datos que ella no causó". Es un buen criterio para operaciones reversibles y uno malo para ésta, por una razón que estaba escrita a dos secciones de distancia: §8 declara `TX_Adjuntos.dropbox_path` **snapshot inmutable** (CI-004). Un archivo mal archivado no se recalcula ni se mueve, y a los seis meses es indistinguible de uno bien archivado. El fallback no aplazaba el problema: lo convertía en permanente y lo volvía invisible.

**Solución aplicada:**

- `lib/dropbox-path-contexto.ts` — clase `ErrorPathIrresoluble` con `code` discriminado (`cliente_sin_vincular · unidad_no_especificada · unidad_no_pertenece · solicitud_irresoluble`). Se eliminó la constante `CLIENTE_SIN_DECLARAR`.
- `app/api/adjuntos/upload/route.ts` — mapa `MENSAJE_POR_MOTIVO`, respuesta **422** con `code` y `reintentable: false` para los motivos accionables; **502 reintentable** para `solicitud_irresoluble`, que no es un dato que la Ejecutiva pueda aportar.
- `lib/dropbox-path.ts` — cascada en `sufijoDesambiguacion()`, con `rol_sii` (`fldC5yUYC2wTTLJBV`) leído en la misma consulta a `TX_Unidades` que ya se hacía.
- `lib/adjuntos-uploader.ts` — `code` propagado a `UploadResult`, para que la interfaz pueda reaccionar y no sólo informar.
- 43 tests (antes 39), `pnpm typecheck` y `pnpm build` limpios.

**Lecciones activas (patrones repetibles):**

**1 · Los fallbacks silenciosos ocultan dos cosas distintas, y las dos hay que verlas.** `SIN_CLIENTE/` ocultaba un **error de datos maestros** —corregible, con dueño—; `comun/` ocultaba una **decisión de UX pendiente**, el selector de unidad del checklist (§9.1 caso b). Ninguna de las dos es una condición de error del sistema: son trabajo que alguien tiene que hacer, y el fallback lo borra de la vista justo cuando sería barato hacerlo. Regla: **cuando falta una señal que un operador puede aportar, el backend falla ruidoso y con `code` discriminador**. El silencio se reserva para lo que no tiene ni remedio ni consecuencia. El `console.warn` no cuenta como ruido: nadie lee los logs de Railway a tiempo.

**2 · El criterio de "no bloquear al usuario" se evalúa contra la reversibilidad, no contra la comodidad.** Bloquear una subida cuesta un mensaje y un clic; el archivo no se pierde, se sube después. Guardarlo en la carpeta equivocada cuesta un dato falso permanente en un path que la norma declara inmutable. Antes de elegir un fallback conviene preguntar **qué cuesta deshacerlo**, no qué cuesta el bloqueo. Aquí la asimetría era de tres órdenes de magnitud y no se vio porque las dos mitades del razonamiento vivían en secciones distintas del spec.

**3 · Cascada de identificadores para desambiguar unidades hermanas: `numero_unidad` → `rol_sii` → ordinal + warning.** Aplicable a cualquier path futuro que tenga que distinguir dos unidades del mismo subtipo. El orden no es arbitrario: los dos primeros son **intrínsecos** a la unidad —sobreviven a que se agregue o borre una hermana— y `rol_sii` además es verificable contra el SII; el ordinal es **posicional** y se corre solo, desalineando paths ya escritos, que es CI-004 por una segunda vía. La versión inicial saltaba de (1) a (3) ignorando `rol_sii`, que ya venía en la misma lectura de `TX_Unidades` y no costaba una query extra. Al escribir un desempate, recorrer los campos disponibles y ordenarlos por estabilidad antes de elegir.

**4 · Una excepción a la spec se revisa una a una antes del commit, no en bloque.** Toda implementación que topa con un borde no cubierto por la norma produce excepciones; el reporte de cierre las lista explícitamente —fue lo que permitió esta revisión— y el panel decide cada una por separado: las que se aceptan se documentan en spec o en aprendizajes, las que no generan **tanda de ajuste inmediata**, antes de que el comportamiento se asiente y aparezcan datos que dependan de él. Aquí las tres se rechazaron, y el coste de revertirlas fue de una tanda porque no había todavía ningún archivo guardado bajo esas reglas. Con una semana de producción encima, la reversión habría requerido migración.

**5 · Aplicar el principio a los casos hermanos que nadie listó.** Al implementar CI-003b apareció un cuarto fallback silencioso de la misma familia que no estaba en la lista del panel: un `unidad_id` que no pertenece a la solicitud degradaba a `comun/`. Se convirtió también en 422 (`unidad_no_pertenece`), porque dejarlo habría sido mantener el anti-patrón con otra causa. Cuando una revisión establece un principio, barrer el módulo entero buscando sus otras instancias en la misma tanda.

**Efecto colateral que hay que asumir:** con el checklist actual, **no se puede subir ningún documento a una solicitud multi-unidad**. Es deliberado: la limitación es visible, tiene dueño y tiene fecha —la tanda del selector de unidad, §9.1 caso b— en vez de ser un montón de archivos en `comun/` que nadie sabe que están mal. `document-checklist.tsx` sigue sin tocarse.

---

### 2026-08-07 (b) — Umbral de archivado de la bitácora: 300 → 1500 líneas

**Contexto:** cierre de CI-003b. La tanda traía la instrucción de archivar `docs/aprendizajes.md` si superaba ~300 líneas después de la entrada nueva.

**Inconveniente:** el archivo tenía **1452 líneas** —casi 5× el umbral— y las excedía desde mucho antes de esa sesión. Aplicar la regla al pie de la letra habría significado mover ~1000 líneas y decidir sobre la marcha qué de un año de memoria institucional está "asimilado", como paso final de una tanda que iba de otra cosa.

**Causa raíz:** el umbral de 300 nunca estuvo en `CLAUDE.md`. Vivía sólo en los prompts de tanda, sin haber sido calibrado nunca contra el tamaño real del archivo. Un número que ningún documento del repo sostiene no es una regla: es una cifra que se arrastra de prompt en prompt, que nadie verifica y que en la práctica se ignora porque cumplirla sale carísimo.

**Solución aplicada:** se agregó a `CLAUDE.md` una subsección «Archivado de la bitácora» dentro de «Aprendizajes de sesión», con el umbral recalibrado a **~1500 líneas** más dos disparadores cualitativos —que el índice deje de permitir ubicar una entrada en menos de 30 segundos, o el cierre de un RF grande—. El destino es `docs/_archivo/aprendizajes_YYYYMMDD.md` y en el archivo vivo quedan las reglas activas destiladas al inicio más las últimas ~200 líneas. Queda explícito que el archivado es la única excepción a la regla de sólo-append y que se ejecuta como tanda propia.

**Prevención futura:** dos reglas.

**1 · Un umbral cuantitativo que choca con la realidad se ignora, no se cumple.** El resultado de fijar 300 sobre un archivo de 1452 no fue que se archivara: fue que la regla quedó muerta. Cuando se detecta el desajuste, lo que corresponde es **recalibrar el número**, no forzar una limpieza masiva a mitad de sesión para salvar la regla. Un umbral es un instrumento; si mide mal, se ajusta el instrumento.

**2 · Toda regla operativa vive en `CLAUDE.md`, no en el prompt de la tanda.** Una restricción que sólo existe en el enunciado de una sesión no sobrevive a esa sesión, nadie la puede verificar y —como aquí— puede llevar años desalineada de la realidad sin que se note. Si una restricción de un prompt merece aplicarse a la próxima tanda, su lugar es el documento; si no lo merece, no debería estar bloqueando el cierre de ésta.

**Nota:** el archivado sigue **sin ejecutarse**. Con el umbral nuevo el archivo (1452 líneas) está justo por debajo, así que la próxima tanda que lo empuje sobre 1500 dispara la operación, y se hará como tanda propia.

---

### 2026-08-07 (c) — Sesión de dos tandas: header de Clerk y helpers compartidos UI↔backend

**Contexto:** dos tandas cerradas y pusheadas el mismo día — `fix(auth)` sobre la detección de sesión Clerk y `feat(adjuntos)` sobre el selector de unidad de `FileUploadZone`, que arrastró la extracción de helpers compartidos.

**1 · El content-type no distingue a Clerk de un 404 de Next.js.**

`esRespuestaDeClerk` decidía por negación sobre el `content-type`: «si no es JSON, no lo emitió la app, luego es Clerk». La segunda inferencia no se sigue de la primera. Los 404 de routing y los 500 de Next.js también responden HTML, así que la heurística confundía «sesión expirada» con «error de datos» justo en el caso que pretendía distinguir, y mandaba a la Ejecutiva a recargar la página para arreglar un fallo del servidor.

El signal fiable es **`x-clerk-auth-status`**, que `clerkMiddleware` agrega a toda respuesta que pasa por él y que un 404 de routing puro no lleva. Valores documentados: `signed-in`, `signed-out`, `handshake`. Discrimina en las dos direcciones, que es lo que el `content-type` no hacía: sin sesión da `signed-out` y el handler nunca corrió; con sesión y ruta inexistente da `signed-in` y el 404 es real.

Tres detalles de implementación que valen para cualquier detección por header:

- **Condición por negación** —header presente y distinto de `signed-in`—, no una lista de valores malos. Cubre `handshake` y cualquier estado futuro sin enumerarlos, y deja el código dependiendo de un solo literal, el mejor establecido de los tres.
- **`trim().toLowerCase()` antes de comparar.** Un `Signed-In` con otra capitalización se leería como sesión inválida.
- **La lectura funciona porque las peticiones son same-origin.** Cross-origin, `res.headers.get()` devolvería `null` aunque el servidor emita el header —CORS sólo expone una lista blanca— y haría falta `Access-Control-Expose-Headers` en el middleware. El modo de fallo es el peor posible: silencioso y en la dirección de «no es Clerk».

**Coste del anti-patrón: seis turnos de debugging por el lado equivocado**, repartidos en dos sesiones. Se revisó el regex de `isValidRecordId`, la existencia del archivo de ruta y su registro en el manifiesto, mientras el Route Handler simplemente no llegaba a ejecutarse. Lo que cerró el diagnóstico no fue mirar más código, sino notar que **un mensaje de error de la propia app no es evidencia de su causa**.

**2 · Cuando una etiqueta de UI debe coincidir con un derivado del backend, hay una sola copia.**

`etiquetaUnidad` (pantalla) y `sufijoDesambiguacion` (path Dropbox) aplican la misma cascada `numero_unidad → rol_sii → ordinal`. Si divergen, la Ejecutiva elige «Estacionamiento 2», el archivo aterriza en `estacionamiento_3` y nadie lo nota hasta la auditoría de RF-51 — el bug no tiene síntoma en pantalla. Dos copias de una regla que *debe* coincidir divergen tarde o temprano; el argumento no es la duplicación en abstracto, es que el error resultante es invisible.

El corte natural resultó ser **lógica pura en `lib/`, UI en `components/`**, con el beneficio lateral de que lo extraído queda testeable sin DOM ni testing-library (que no están instalados). Aplicado dos veces en la sesión: `lib/adjuntos-destino.ts` —destino común/unidad, consumido por el checklist y por la zona de adjuntos libres— y `lib/clerk-response.ts`.

**3 · Lo que es cierto «por construcción» se fija con un test, no con un comentario.**

Dos casos de la sesión:

- **Campos mutuamente excluyentes.** `unidad_id` y `carpeta` salen de una única función y no pueden coexistir. El test barre las cinco combinaciones posibles y afirma la invariante, en vez de confiar en que nadie escriba una segunda vía de construcción.
- **Defaults protegidos por decisión de producto.** `destinoInicial(multi-unidad)` **no puede** devolver la primera unidad: sería el default silencioso que CI-003b revirtió, congelado en un path inmutable. El test lo dice con un `not.toBe('rec1')` explícito.

Un test llamado «regresión de X», con un comentario que nombre el bug pasado, vale más que la documentación aparte: **viaja con el código**. El de `content-type` es el ejemplo — describe la heurística vieja y por qué fallaba, justo donde alguien que la reintroduzca lo va a ver.

**Prevención futura:** las tres lecciones quedaron destiladas como **RO-04**, **RO-05** y **RO-06** en las reglas operativas de este archivo, que es lo que se lee al abrir sesión. Esta entrada conserva el contexto; las reglas son lo operativo.

---

### 2026-08-07 (d) — Cierre del día: lockfile, selector legible y validación end-to-end del path v1.9.6

**Contexto:** segunda mitad de la sesión del 07-ago. Dos tandas de código —`fix(deps)` sobre `pnpm-lock.yaml` y `fix(adjuntos)` sobre los dos bugs del selector de destino— más la validación en producción del camino completo UI → Next.js → Make v1.3 → Dropbox con la ruta de spec v1.9.6.

**1 · El wrapper de `Select` era un passthrough, y nadie lo sabía.**

`components/ui/select.tsx` no formatea nada: reenvía a `Select.Value` de `@base-ui/react`, que renderiza el `value` **crudo** salvo que reciba `children` como función. El trigger cerrado mostraba `recTzdOaalt8Doa5L` y `__comun__` mientras la lista abierta mostraba las etiquetas correctas.

Lo interesante no es el bug sino **por qué tardó tanto en aparecer**: todos los `Select` anteriores del repo usan `value` **igual a la etiqueta** —`"si"`/`"no"`, los tipos de cliente, el `TODOS` de la lista—, así que el defecto del wrapper era invisible por construcción. `SelectorDestinoUnidad` fue el primero con `value ≠ label`, y lo destapó. Un defecto latente en un componente compartido no se manifiesta hasta que llega el primer consumidor que usa el eje que nadie había usado.

El fix es una función pura, `etiquetaDestino`, en `lib/adjuntos-destino.ts` —no en el componente— para que el trigger cerrado y la opción abierta lean del mismo sitio. Destilado como **RO-08**.

**2 · Regla D admite dos estructuras, y elegir la equivocada rompe otra cosa.**

Los dos handlers de subida dejaban el flag de progreso encendido ante cualquier excepción: sin `try/catch`, un throw entre el `setEstado("uploading")` y las salidas dejaba el selector muerto hasta recargar la página. Es literalmente el bug que la Regla D de `CLAUDE.md` describe.

Lo que no estaba en la regla es que **la estructura correcta depende de qué hace la salida de éxito**:

- `file-upload-zone.tsx` → **`catch`**. Su camino de éxito *elimina el item de la lista*; un `finally` que escribiera `status: "error"` resucitaría una fila recién borrada.
- `document-checklist.tsx` → **`try/catch/finally`**, con el reset como updater condicional (`actual === "uploading" ? "idle" : actual`). Un `setEstado("idle")` seco pisaría el `"error"` que acaban de escribir el `return` temprano o el `catch`, y la fila perdería su mensaje justo después de mostrarlo.

La invariante es «ninguna salida deja el flag encendido», no «todo handler usa `finally`». Destilado como **RO-09**.

**3 · Cuando un componente tiene dos renders del mismo dato, el test fija que coincidan.**

Un `Select` pinta el mismo valor dos veces —como opción en la lista abierta y como texto del trigger cerrado— por caminos de código distintos. El caso #6 de `lib/adjuntos-destino.test.ts` afirma que `etiquetaDestino(u.id, us) === etiquetaUnidad(u, us)` para toda unidad. Sin él, basta con que alguien toque una de las dos funciones para que el bug vuelva por otra puerta, y ningún test lo notaría porque las dos seguirían pasando sus casos propios.

Es **RO-06** aplicada a un caso nuevo: la invariante estructural no es aquí «dos campos excluyentes» sino «dos renders convergentes». Vale la pena reconocer la forma —*el mismo dato pintado por dos caminos*— porque se repite en toda UI con estado seleccionado.

**4 · Un escenario Make viejo sin pausar sigue atendiendo el webhook.**

Importar `v1.3` no desactiva `v1.2`. Mientras la env var de Railway apunte a esa URL, lo que responde es el escenario que esté activo, no el más nuevo del repo. `v1.2` quedó pausado como respaldo, pero el orden correcto es pausarlo en el mismo turno de la importación: si no, la pregunta «¿qué versión está corriendo?» se responde mirando Make en vez de mirando el repo, y esa es exactamente la deuda cognitiva que causó E-090. Destilado como **RO-10**.

**5 · «El archivo no llegó a la ruta nueva» puede ser dedupe correcto.**

Durante la validación end-to-end, la Ruta 1 de `v1.3` respondió «Binario ya indexado» y el archivo no apareció bajo la estructura nueva. No era un fallo del path: el `hash_md5` coincidía con un adjunto histórico de la misma solicitud, así que el escenario respondió `reused` sin subir nada —comportamiento esperado de RT-03—.

La lección operativa es de **método de prueba**: validar un path nuevo exige un archivo con hash nunca visto, y **renombrarlo no alcanza** porque el hash es del contenido. Un falso negativo de este tipo cuesta caro precisamente porque el sistema está funcionando bien. Destilado como **RO-11**.

**6 · Dropbox crea las subcarpetas al vuelo.**

Confirmado en producción: al subir con destino «Departamento», Dropbox creó `/…/VP-2026-0053/departamento/` desde cero. No hay que pre-provisionar la estructura, y lo mismo aplica a `comun/`, `informe/` y `_ingreso/`. Elimina un paso de setup que el diseño de §8.1 podía sugerir. Destilado como **RO-12**.

**Estado al cierre:** camino completo validado en producción —común, unidad específica (departamento) y de-duplicación por hash—, con `SC-Adjuntos-Upload v1.3` activo y `v1.2` pausado como respaldo.

---

### 2026-08-08 — Auditoría documental contra spec v1.9.7: tres divergencias que no eran de redacción

**Contexto:** tanda 100% documental. Tras incorporar el insumo `VProperty_SLA_Negocio_v1.1` al spec (bump v1.9.6 → v1.9.7, §5.2 nueva con RF-53 y D-16), se auditaron los 81 archivos de documentación del repo contra la spec. Siete archivos modificados, tres fichas nuevas en `docs/CODE_INCONSISTENCIES.md`. No se tocó código.

**1 · Un filtro por igualdad contra un literal humano devuelve cero filas, y cero filas no se lee como error.**

`docs/construccion.md` documentaba la vista «SLA en riesgo» como `OR({semaforo_sla} = "rojo", {semaforo_sla} = "ambar")`. La fórmula viva nunca emitió esos strings: emite `VENCIDO`, `EN RIESGO`, `OK` y `Entregado`, además con los emoji mangleados a `?`. El filtro documentado devolvía **cero filas para toda la tabla**.

Lo que hace peligroso a este fallo no es la equivocación —copiar el vocabulario con que el equipo habla del campo en vez del que la fórmula escribe es un desliz de un minuto— sino que **su síntoma es indistinguible del éxito**. Una bandeja vacía se lee como «no hay solicitudes en riesgo», que es una respuesta plausible y hasta deseable. El código de producción ya buscaba por subcadena desde la Tanda D-01, así que el defecto sobrevivió meses sólo en la documentación, esperando a que alguien construyera la vista siguiendo lo escrito.

La regla es leer la fórmula con `get_table_schema` antes de escribir cualquier filtro sobre un campo calculado, y preferir `FIND(...)` a la igualdad cuando el literal traiga adornos volátiles. Destilado como **RO-13**.

**2 · Cuando renombrar rompe algo en los dos lados, el alias documentado es la salida barata.**

`RF-09` significa dos cosas: en el spec es «Acceso autenticado a sus solicitudes» (IF-03), y el escenario de extracción con Claude API se llama `SC07` (§4). En el repo, `RF-09` **es** la extracción —está en `CLAUDE.md`, en `app/api/extraccion/`, en `TX_Adjuntos.estado_extraccion` y en el nombre del blueprint—. `CLAUDE.md` llega a prohibir explícitamente el nombre que el spec afirma.

El reflejo es elegir un ganador y renombrar. Con ambos lados en producción, las dos direcciones son caras: renombrar en el repo toca rutas, un campo de Airtable y un blueprint; renombrar en el spec lo pone a contradecirse en §4 y en la definición de RF-09. Se eligió la tercera vía —alias con sufijos `RF-09-spec` / `RF-09-repo`, unificación diferida al próximo bump—, y la clave para justificarla fue reconocer que **nada falla en runtime**: el daño es que alguien busque «RF-09», encuentre la definición equivocada y construya sobre ella. Un problema de lectura se paga con documentación, no con una migración.

Detalle en **CI-006**. Destilado como **RO-14**.

**3 · Entre el spec y la base real, la base gana.**

El spec nombra `H_Feriados` en ocho lugares; la tabla real es `C_Feriados` (`tblJVh2kPd4uMgxpb`), poblada y funcional. El nombre viejo viene del diseño de la Capa de Datos, que la ubicaba en el dominio histórico `H_`; al crearse quedó en el de configuración `C_`, que además es el correcto por naturaleza —es un catálogo paramétrico, no un histórico—.

El coste no es simétrico y por eso la regla no es «gana el documento normativo»: renombrar en Airtable rompería fórmulas, automations y escenarios Make vivos, mientras que corregir el spec es reemplazar ocho strings. La corrección se difiere al próximo bump en vez de parcharla dentro de esta tanda, porque un rename de ocho apariciones en el documento normativo merece su propio changelog.

Esta entrada **subió de prioridad con v1.9.7**: mientras los feriados sólo aparecían de pasada en RN-04 era una molestia de lectura; §5.2.1 los convierte en dependencia del cómputo hábil de todo el SLA operacional, y §5.2 afirma que «H_Feriados sigue siendo la fuente única de feriados para ambos cómputos» apuntando a una tabla que no existe. Detalle en **CI-007**. Destilado como **RO-15**.

**4 · Una política de higiene documental bien escrita evita el trabajo equivocado.**

`diseno.md`, `construccion.md` y `schema-airtable.md` llevan desde el 30-jul una nota que prohíbe renumerar citas del cuerpo sin diffear el spec, *«porque cambiarles el número sin diffear el spec convertiría un puntero viejo en una afirmación falsa»*. El encargo de esta tanda pedía alinear referencias de versión; sin esa nota, el camino obvio era un reemplazo masivo `v1.9.4 → v1.9.7` sobre ~8 citas de cuerpo cuyo contenido nadie verificó contra el spec nuevo. Se movieron sólo los punteros de cabecera —que apuntaban a un archivo inexistente— y cada nota de higiene quedó registrando qué tocó esta tanda.

Refuerza la lección del 06-ago sobre no embeber datos concretos fuera del spec, por el otro extremo: **cuando la deuda no se puede saldar en el momento, dejarla anotada con su razón vale más que dejarla anotada a secas**. La razón es lo que impide que la próxima tanda la «resuelva» mal.

**5 · Verificar cada hallazgo antes de reportarlo descartó dos de dieciocho.**

El borrador del informe incluía que la vista «Por reasignar» contradecía la REGLA A. Al abrir §1.1 apareció listada como vista pre-construida en RF-05: lo que el spec difiere (FUT-EJ-05) es la *reasignación automática por inactividad*, no la vista. Dos de dieciocho hallazgos candidatos se cayeron así. En auditorías documentales la tentación es reportar por coincidencia de término —«dice reasignar, y reasignar está prohibido»—, y el término casi nunca alcanza: **hay que abrir la sección citada**.

**Estado al cierre:** 8 archivos modificados en el working tree, sin commitear. Tres CI abiertas (CI-005 reloj del SLA, CI-006 alias RF-09, CI-007 tabla de feriados), ninguna bloqueante para la construcción en curso.

---

### 2026-08-08 (b) — Logo corporativo en el pie del correo SC05: CID sobre URL, y dónde vivía realmente la plantilla

**Contexto:** encargo de agregar el logo de la empresa bajo la línea `www.valueproperty.cl` en el correo que SC05 envía al tasador asignado, eligiendo la solución técnica óptima para el stack Make eu1 + módulo Gmail m19.

**1 · El artefacto que había que editar no era el que el encargo nombraba.**

El encargo pedía actualizar «el HTML del footer» en `SC05-EmailTasador.blueprint.json`, dando por supuesto un `SetVariable` con `plantilla_cuerpo` dentro del escenario. **Ese módulo no existe.** El blueprint no contiene una sola línea de HTML: m13 hace `Search Records` sobre `C_NotificacionesConfig` y m19 aplica 21 `replace()` anidados sobre el `plantilla_cuerpo` que trae esa fila. La plantilla completa —cabecera, seis secciones, pie— vive en Airtable, en `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`), registro `rec5t6dBeYQkGsw4F`, campo `plantilla_cuerpo` (`fldQro7jvi3RlxDs0`). Está decidido así desde §9.5.1 del plan de ejecución, bajo el título literal *«Plantilla — vive en Airtable, no en el blueprint»*.

La consecuencia práctica es que **el cambio se reparte en dos sistemas que no se versionan juntos**: el `<img>` va a un campo de Airtable, el adjunto va al blueprint del repo, y ninguno de los dos funciona sin el otro. La regla que queda: **antes de editar un artefacto, verificar que el contenido que se va a tocar está efectivamente en él**. Un `grep` de `www.valueproperty.cl` sobre el repo entero devuelve cero coincidencias — treinta segundos que evitan editar el archivo equivocado y reportarlo como hecho.

**2 · Entre URL y CID, lo que decide no es la compatibilidad sino dónde queda el riesgo.**

Las tres alternativas evaluadas para la imagen se ordenan solas en compatibilidad: el `data:` URI se descarta de entrada porque **Gmail lo bloquea sin excepción**, web y móvil. Entre las otras dos, Gmail muestra ambas —su proxy de imágenes carga las remotas por defecto desde 2013—, así que la comparación por «¿se ve?» empata y no resuelve nada.

Lo que las separa es el **tipo** de riesgo, no su tamaño:

- **URL pública:** riesgo de *runtime*, recurrente y ajeno. Cada apertura de cada correo, hoy y en tres años, depende de que un host responda. Si el dominio cae o el link de Dropbox rota, se rompen también todos los correos ya enviados —un correo es un archivo histórico, no una página que se redespliega—. Y Outlook de escritorio bloquea imágenes externas por defecto en remitentes no confiables.
- **CID con el binario embebido en base64:** riesgo de *configuración*, único y verificable. El `data` del adjunto es una constante: si el primer envío de prueba sale bien, salen todos los siguientes, porque no hay variable que cambie entre corridas.

Elegido CID. El criterio general —**preferir el riesgo que se agota en la primera prueba sobre el que se repite en cada ejecución**— vale más allá de este caso; es el mismo con que §9.5 separó SC05 de SC-Asignar.

**3 · La variante «cómoda» del CID reintroduce exactamente el riesgo que el CID venía a eliminar.**

El camino natural para conseguir el `buffer` que pide `attachments[].data` es anteponer un `http:ActionGetFile` o un módulo de Dropbox que descargue el logo. Ese diseño **conserva la etiqueta CID y pierde su beneficio**: vuelve a haber un fetch de red en cada envío. Y es peor que la URL, no mejor — con `maxErrors: 1` y sin auto-retry, un logo que no descarga aborta el escenario y **el tasador no recibe la notificación**. Un elemento decorativo con poder de veto sobre el mensaje.

La salida es embeber el base64 en el propio `mapper` y convertirlo con `toBinary(valor; 'base64')`. El blueprint carga ~30 KB de texto opaco; a cambio, el envío no depende de nada externo. Regla: **al elegir una alternativa por una propiedad concreta, verificar que la implementación que se está escribiendo conserva esa propiedad**. La etiqueta de la técnica no la garantiza.

**4 · El módulo Gmail sí soporta CID, y el `expect` lo dice — pero eso no cierra la verificación.**

`google-email:ActionSendEmail` v2 declara en su `attachments` tres campos: `fileName` (`filename`), `data` (`buffer`) y **`cid` (`text`)**. Suficiente para descartar la duda de si el módulo soporta imágenes inline, que era la pregunta abierta del encargo.

Lo que el `expect` **no** prueba es que `toBinary` produzca un buffer que el módulo acepte, ni que Gmail arme el `multipart/related` que hace que la imagen se vea inline en vez de colgar como adjunto descargable. Es la lección de F-1 aplicada a un caso nuevo: el `expect` describe la forma del contrato, no el comportamiento en runtime. Por eso el cambio entra con dos checkpoints —M-7 (reemplazo del base64 antes de importar) y M-8 (envío de prueba en *Run once*)— y con un plan B escrito: si `toBinary` falla, se cae a URL pública y se registra la degradación, **nunca** a un módulo de descarga previo.

**5 · Los dos lados de un CID se mueven juntos o no se mueve ninguno.**

`cid:logo-vproperty` es una referencia cruzada entre dos artefactos con ciclos de despliegue independientes: el `<img>` en Airtable (efecto inmediato, sin import) y el adjunto en Make (requiere reimportar el blueprint). Cualquier orden parcial produce correos rotos en producción: la plantilla primero deja la imagen sin destino; el blueprint primero deja un adjunto que nadie referencia —y que Gmail entonces sí muestra como archivo descargable—. Peor todavía, importar el blueprint con el marcador `__LOGO_BASE64__` sin reemplazar no rompe la imagen: **rompe el envío completo**, porque el módulo Gmail falla al construir el adjunto.

Vale como forma general para toda referencia cruzada entre sistemas que no comparten despliegue —CID, claves de i18n, IDs de plantilla—: la ventana entre los dos cambios es un estado inválido, y el orden de los pasos manuales es parte del diseño, no del instructivo.

**Solución aplicada:** `docs/_artefactos/make/SC05-EmailTasador.blueprint.json` — `name` a `SC05 v1.1`, `attachments` de m19 con `{cid, data: toBinary('__LOGO_BASE64__'; 'base64'), fileName}` y `restore.expect.attachments` con un `item`. `docs/_md/plan-ejecucion-if02-v1_9.md` v1.7 — subsección *Logo corporativo del pie* en §9.5.1 con la tabla comparativa, el bloque `<img>` literal y el plan B; checkpoints M-7 y M-8; caso E2E-9. La edición de `plantilla_cuerpo` en Airtable **no se ejecutó**: P8.5 es pausa-total por emitir comunicación real hacia fuera, y escribirla antes de reimportar el blueprint dejaría correos con la imagen rota.

**Prevención futura:** el detalle de renderizado que cierra el caso es el atributo `width` en el `<img>` **además** del `style`. El motor de Outlook de escritorio es Word y sólo respeta el atributo HTML; con CSS a secas la imagen sale a tamaño nativo. Junto con `display:block` (elimina la franja de espaciado bajo imágenes inline) y un `alt` con el nombre de la empresa (degradación legible), son las tres líneas que separan un pie que se ve bien en los tres clientes de uno que sólo se probó en Gmail.

---

### 2026-08-08 (c) — Ejecución del logo CID: orden de los dos lados y verificación byte a byte

**Contexto:** ejecución de la recomendación de la entrada anterior. Sin decisiones de diseño nuevas: sólo materializar el CID en los dos artefactos que lo componen.

**Acción ejecutada, en este orden:**

1. **Ventana segura.** Se pidió a Sergio apagar SC05 en Make (switch OFF) y se **paró hasta su confirmación** antes de tocar Airtable. Con SC05 activo, cualquier asignación ocurrida entre la escritura de la plantilla y la reimportación del blueprint habría enviado un correo real, a un destinatario externo, con la imagen rota.
2. **Blueprint primero** (`docs/_artefactos/make/SC05-EmailTasador.blueprint.json`). `__LOGO_BASE64__` reemplazado por los 53.076 caracteres del base64 de `docs/_artefactos/assets/logo-vproperty.png` (PNG 320×208 RGB, 39.807 bytes). Archivo 141.728 → 195.284 bytes.
3. **Airtable después** (`C_NotificacionesConfig` · `rec5t6dBeYQkGsw4F` · `plantilla_cuerpo`). Bloque `<p><img src="cid:logo-vproperty" …></p>` insertado tras el `</p>` que cierra `www.valueproperty.cl`. 7.391 → 7.615 caracteres.

**Criterio del orden.** El blueprint va primero porque es un archivo local: editarlo no cambia nada en producción y deja el repo listo mientras se coordina la ventana. La plantilla va última porque es el único de los dos cuyo efecto es **inmediato y sin import** — en cuanto se guarda, el próximo correo la usa. Y por eso el escenario tiene que estar OFF: el estado intermedio *plantilla nueva + escenario viejo* es el único que produce daño visible, y es precisamente el que la secuencia atraviesa. La regla operativa: **cuando dos artefactos con ciclos de despliegue distintos componen una referencia cruzada, el que despliega solo va último y el sistema se apaga durante la ventana.**

**Verificación — dos round-trips, no dos inspecciones.**

- *Blueprint*: se decodificó el base64 ya embebido en el `mapper` y se comparó contra el PNG de origen. SHA-256 idéntico (`e6dc9cc7…dd0924`). No basta con mirar que la cadena «empieza con `iVBORw0KGgo`»: eso sólo prueba que es un PNG, no que sea **este** PNG completo y sin truncar.
- *Airtable*: el texto destino se calculó localmente con una sola sustitución sobre el original leído por API, y tras el `update` se releyó el campo y se comparó **byte a byte** contra ese destino. SHA-256 idéntico (`aa352e60…c7b2b`), delta de exactamente 224 caracteres —el largo del bloque—, 21 placeholders `[[…]]`, 6 `<h3>` y 5 `<table>` intactos, y el resto del cuerpo idéntico al original tras remover el bloque insertado.

Lo que hace falta subrayar es **por qué** la comparación byte a byte era obligatoria acá y no paranoia: escribir el campo exige reenviar los 7.615 caracteres completos, o sea que una operación conceptualmente aditiva —«agregar cuatro líneas»— se implementa como un reemplazo total del contenido. Cualquier carácter perdido en el camino no toca el bloque nuevo sino alguna parte del cuerpo que nadie está mirando, y el síntoma aparecería semanas después en un correo a un tasador. **Cuando una API sólo ofrece reemplazo total para un cambio aditivo, la verificación tiene que cubrir lo que no se quiso cambiar, no lo que se quiso cambiar.**

**Resultado en runtime (08-ago-2026, mismo día):** blueprint reimportado en Make eu1 y *Run once* ejecutado — **correo recibido con el logo en el pie, OK**. Cierra las dos incógnitas que el `expect` del módulo no cubría: `toBinary(valor; 'base64')` **sí** produce un buffer que `google-email:ActionSendEmail` v2 acepta en `attachments[].data`, y el módulo **sí** arma el `multipart/related` que hace que la imagen se renderice inline en vez de colgar como adjunto descargable. Queda como patrón reutilizable para cualquier imagen embebida en correos de Make: base64 en el `mapper` + `cid`, sin módulo de descarga previo.

---

### 2026-08-10 — Reconciliación de §9.6 con la base real (plan v1.8 → v1.9)

**Contexto:** cierre de §9.6 (P8.6 · control de SLA) antes de arrancar M-9. Había tres divergencias declaradas entre el plan y Airtable: `H_Feriados` vs `C_Feriados`, AT08 inexistente, y `sla_revision` ausente de `C_SLA`.

**Inconveniente:** la tabla «Estado real verificado (MCP · 10-ago-2026)» de §9.6.1 llevaba tres afirmaciones falsas pese a estar rotulada como verificada: decía **8** filas de 2026 sin `anno` en `C_Feriados` (son **5**), daba AT08 por inexistente **sin matices** (la *Automation* no existe, pero su fila de inventario en `C_AutomationsAirtable` sí, en `estado = Inventariado` desde el 03-jun-2026), y declaraba AT02/AT04 «sin desplegar» cuando el registro las marca `Activo`. El caso E2E-12 además describía el 18 y 19 de septiembre de 2026 como «dos feriados consecutivos»: el 19 cae **sábado**.

**Causa raíz:** un rótulo de verificación no es una verificación. La tabla se escribió en la misma sesión que el diseño y arrastró números de memoria en vez de la salida literal de la consulta — el fallo que **RO-02** describe para cobertura, aplicado a estado de datos. Lo del calendario es la misma familia: nadie miró qué día de la semana caía una fecha que el propio caso de prueba convierte en la variable independiente.

**Solución aplicada:** relectura campo por campo de `C_Feriados`, `C_SLA`, `C_AutomationsAirtable`, `TX_Solicitudes`, `LogEscenarios` y `C_NotificacionesConfig` contra `app9G7lLkIV3CpeLa`, y reescritura de §9.6.1/§9.6.2 con IDs de registro concretos. Las tres divergencias quedan como decisiones greppables **§9.6-R1** (gana `C_Feriados`; se corrige la spec, no la tabla), **§9.6-R2** (`AT08_Alertas_SLA` se crea; su fila de inventario se actualiza, no se duplica — paso F-5 nuevo) y **§9.6-R3** (`sla_revision_horas`, definido como *override del umbral de la etapa 7* para que `C_SLA_Etapas` y `C_SLA` no sean dos fuentes del mismo número, RO-05). Ampliados M-9, M-11, M-12, M-16, M-17 y M-18. E2E-12 conservado con el calendario corregido y los dos instantes esperados calculados a mano (alerta: mié 23-sep 13:00; vencimiento: lun 28-sep 10:00).

**Prevención futura:** una fila de tabla que afirme «estado real verificado» lleva el identificador del registro (`rec…`, `fld…`) que la respalda, o no lleva el rótulo. Un `rec…` no se puede escribir de memoria, y por eso funciona como prueba barata de que la consulta se corrió — es **RO-02** aplicado a estado de datos y no sólo a cobertura de `grep`. Corolario aparte: **una tabla de inventario mantenida a mano no es una constatación de runtime.** `C_AutomationsAirtable` dice qué se diseñó, no qué está encendido, y ni el MCP ni la API de metadata pueden leer el estado real de una Airtable Automation; por eso lo de AT02 quedó como verificación manual de Sergio en M-9 y no como un supuesto del plan en ninguna dirección.

---

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

### 2026-08-21 — Audios del cliente + plantilla Excel: un bloqueo que no era de datos

**Contexto:** integración de la segunda tanda de audios de Héctor (`docs/_md/audios/`) y de la
plantilla operativa `Formato Informe VProperty Enero2026.xlsm` en los cuatro documentos de SLA y
UI Tasador. Frente documental, sin tocar código.

**Inconveniente:** **A-14** llevaba abierta desde el 13-ago-2026 bloqueando la sección E completa
del formulario del tasador (P7-TAS), con el diagnóstico *"ninguna tabla actual los alberga"*
para los defaults constructivos. El diagnóstico era correcto y la ambigüedad se había redactado
como una decisión de negocio pendiente: crear tabla, elegir clave, esperar a Héctor.

**Causa raíz:** la pregunta estaba mal planteada. A-14 preguntaba **dónde viven** los defaults
dando por supuesto que **no existían**, y esa suposición nunca se verificó fuera del schema. Los
valores existían completos y llevaban años en producción, en la planilla que el cliente usa a
diario — que está en el repositorio desde siempre como archivo de ejemplo, sin que nadie la
hubiera abierto. El audio `p8` los describe literalmente: *"esa parte siempre el tasador la
recibe completa… nunca lo mandamos en blanco"*.

**Solución aplicada:** radiografía del libro con `openpyxl` (`docs/_notas/radiografia-excel-informe.md`)
y especificación de los valores en spec §2.8.1 (RF-TAS-23), citando cada uno por su celda de
origen. A-14 pasa de bloqueante a **reducida**: lo único que sigue abierto es la tabla destino,
renumerado como **A-27**. La sección E deja de esperar y se construye con sus campos y catálogos;
sólo la precarga queda condicionada.

**Prevención futura:** antes de declarar que un dato de negocio no existe, **revisar los
artefactos operativos con que el cliente trabaja a diario** —planillas, formularios, plantillas de
correo—, no sólo el schema y los documentos. El schema dice qué guarda el sistema; no dice qué
sabe el negocio. Una ambigüedad que pide una decisión de negocio y otra que pide abrir un archivo
cuestan lo mismo de escribir y órdenes de magnitud distintos de resolver.

### 2026-08-21 (b) — `data_only=True` habría producido un catálogo de defaults falso

**Contexto:** misma sesión, extracción de los valores por defecto de la hoja `Antecedentes`.

**Inconveniente:** los defaults de la plantilla **parecen constantes** al mirarlos en Excel —la
celda muestra `HORMIGON ARMADO`, `PISO FLOTANTE`, `CERAMICO`— y no lo son: son fórmulas
ramificadas por dos interruptores, el tipo de propiedad (`'FICHA SOLIC'!K35`) y el estado de uso
(`'FICHA SOLIC'!K36`). Leer el libro con `openpyxl(data_only=True)` habría devuelto el **valor
cacheado de la última propiedad tasada sobre esa plantilla**, no la regla.

**Causa raíz:** `data_only=True` no lee el libro, lee el resultado que Excel guardó la última vez
que lo calculó. Sobre una plantilla en uso, ese resultado es un caso particular disfrazado de
regla general.

**Solución aplicada:** todo el barrido se hizo con `data_only=False`, que conserva la fórmula. Así
apareció que `Cubierta` vale `FE GALVANIZADO` en departamento y `PLANCHA METALICA` en el resto, o
que `Entrepisos` va vacío en casa de un piso — comportamiento que el valor cacheado habría
ocultado por completo. Los defaults quedaron especificados **con su ramificación**, no como lista
plana.

**Prevención futura:** es el mismo patrón que ya dejó la lección de los módulos Airtable v3 en
Make (`metadata.expect` descriptivo no es contrato) y el de los literales de `semaforo_sla`
(RO-13): **lo que un artefacto muestra no es lo que un artefacto declara.** Al extraer reglas de
una planilla, leer siempre las fórmulas; el valor visible es evidencia de un caso, no de la regla.
Corolario menor de la misma sesión: un literal sin ramificación entre veinte que sí ramifican es
sospechoso de residuo, no de regla — `Antecedentes!Z17 = NOROESTE` se descartó como default por
eso, y quedó anotado en §2.8.1 para que nadie lo reponga.
