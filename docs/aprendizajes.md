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
