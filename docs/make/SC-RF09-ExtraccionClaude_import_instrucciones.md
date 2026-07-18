# SC-RF09-ExtraccionClaude · Instructivo de importación — CHECKPOINT EXTERNO 1

> ✅ **RECONSTRUIDO contra Especificación v1.8.2 (17-jul-2026).** El
> blueprint `SC-RF09-ExtraccionClaude.blueprint.json` estaba construido
> contra el dominio D_ de 8 tablas EAV (`D_Atributo`, `D_TipoDato`, etc.),
> ya deprecadas en la base real. Se reconstruyó a 11 módulos (de 13) contra
> el modelo vigente: `D_TipoDocumentoAtributo` como fuente única (sin
> `D_Atributo`/`D_TipoDato`), prompt de Claude reconstruido para usar la
> lista dinámica de atributos esperados (antes el aggregator del módulo 7
> no se usaba en ningún lado — bug real, no solo el literal hardcodeado
> "Atributos esperados: 7"), reconocimiento del patrón "NO REGISTRA"
> (RN-37), y **todos los módulos de escritura que estaban con `record: {}`
> vacío ahora tienen los campos mapeados** (ver §4.1 más abajo para el
> detalle). El script `AT03-Ext_script.js` también se reescribió contra el
> modelo consolidado — ya no hace fan-out EAV, enruta directo a
> `TX_DatosTasacion`/`TX_Unidades` por `uso_cardinalidad_destino`.
>
> **Nada de esto se probó contra una instancia real de Make/Airtable.**
> Antes de activar, revisa el checklist de verificación en §4.1 — hay al
> menos dos supuestos de comportamiento de Make (auto-stringify de
> `{{7.array}}` a JSON al mapearlo en un campo de texto, y la sintaxis
> `map()`/`join()` del prompt del módulo 10) que sólo se pueden confirmar
> corriendo el escenario una vez con datos reales, mismo patrón de
> verificación que E-034/E-035/E-036 en `docs/aprendizajes.md`.
>
> La API key de Anthropic que traía el módulo 10 en texto plano fue
> sanitizada (reemplazada por `{{ANTHROPIC_API_KEY}}`) el 17-jul-2026 —
> si esa key no se ha rotado todavía en Anthropic Console, tratarla como
> comprometida. `{{ANTHROPIC_API_KEY}}` **no es sintaxis válida de Make**
> tal cual — reemplázala en el módulo 10 por una Connection nativa de
> Make hacia Anthropic si existe, o por la variable de escenario según
> §5, nunca pegando la key en texto plano otra vez (ver
> `docs/aprendizajes.md` E-037).
>
> RF-09 · Extracción con Claude API. Generado 13-jul-2026, sesión autónoma de
> construcción (panel de expertos). Sigue el mismo patrón de verificación
> campo-por-campo que `docs/make-blueprints/SC-Adjuntos-Upload_import_instrucciones.md`
> — este blueprint tampoco fue exportado desde una instancia real de Make,
> así que trátalo como punto de partida, no como import garantizado 100% limpio.

## 0. Orden recomendado

1. Ampliar 2 campos `singleSelect` a mano en Airtable (el MCP no puede hacerlo — ver §1).
2. Pegar y configurar los 2 scripts de Airtable Automations (§2 y §3).
3. Importar el blueprint de Make (§4).
4. Configurar variables de entorno (§5).
5. Probar end-to-end con un adjunto real (§6).

---

## 1. Ampliar opciones de 2 campos `singleSelect` (manual, Airtable UI)

El servidor MCP de Airtable no expone ningún parámetro para agregar `choices`
a un `singleSelect` existente (`update_field` sólo acepta `options.formula`,
confirmado contra el schema de la herramienta) — a diferencia de crear campos
nuevos, esto sí requiere la UI de Airtable a mano.

### 1.1 `TX_Adjuntos.estado_extraccion`

Abre la tabla `TX_Adjuntos` → columna `estado_extraccion` → editar campo →
agregar 3 opciones nuevas (dejar las 4 existentes intactas):

- `skipped`
- `no_corresponde`
- `delegado_visador`

Resultado esperado: 7 opciones totales — `idle · extrayendo · listo · error · skipped · no_corresponde · delegado_visador`.

### 1.2 `LogEscenarios.Escenario`

Abre la tabla `LogEscenarios` → columna `Escenario` → editar campo → agregar
1 opción nueva:

- `SC-RF09-ExtraccionClaude`

(Ninguna de las 12 opciones existentes corresponde a un escenario de IF-02 —
hallazgo de esta sesión, ver `docs/schema-airtable.md` §13.5. No se tocan las
opciones existentes.)

---

## 2. Script `AT03-Ext` (Airtable Automation)

Archivo: `docs/make/AT03-Ext_script.js`

1. En Airtable, ve a **Automations** → **Create automation** → nombre `AT03-Ext`.
2. **Trigger**: "When record updated" → tabla `TX_Adjuntos` → campo observado
   `atributos_obtenidos`.
3. **Action**: "Run a script".
4. Pega el contenido completo de `AT03-Ext_script.js`.
5. En el panel de "Input variables" del script, agrega una variable
   `adjuntoId` con Dynamic Reference → el record ID del trigger (Airtable te
   lo ofrece como campo dinámico del "When record updated").
6. Guarda pero **no actives todavía** — actívala después de probar el
   escenario Make completo al menos una vez en modo manual (§6).

## 3. Script `AT-RF09-Trigger` (Airtable Automation)

Archivo: `docs/make/AT-RF09-Trigger_script.js`

1. **Create automation** → nombre `AT-RF09-Trigger`.
2. **Trigger**: "When record created" en `TX_Adjuntos` — **agrega un segundo
   trigger** (o una automation separada con el mismo script) "When record
   updated" watching `estado_extraccion`, para capturar el reseteo a `idle`
   del 2do intento (Tanda D, `SC-Adjuntos-Reemplazar`). Si Airtable no te
   deja combinar 2 triggers distintos en una sola automation con follow-up
   actions idénticas, duplica la automation con el mismo script y un trigger
   distinto cada una — es más simple que intentar unificarlas.
3. **Action**: "Run a script".
4. Pega el contenido completo de `AT-RF09-Trigger_script.js`.
5. Input variable `adjuntoId` → Dynamic Reference del record ID del trigger.
6. **Secrets de la automation** (⚙ en el editor de script, NO como input
   variable de texto plano): agrega `MAKE_WEBHOOK_URL_RF09` y
   `MAKE_RF09_HMAC_SECRET`. El script los lee vía `input.config()` — confirma
   que Airtable expone los secrets de esa forma en tu versión de la UI; si
   no, ajusta el script para leerlos como input variables normales (menos
   seguro, pero funcional) y avísame para documentar el cambio.
7. Tampoco actives esta automation todavía — actívala en §6, después de
   importar el blueprint de Make.

---

## 4. Blueprint Make `SC-RF09-ExtraccionClaude`

Archivo: `docs/make-blueprints/SC-RF09-ExtraccionClaude.blueprint.json` (11
módulos top-level: 1 webhook, 2 update inicial, 3-4 búsquedas D_TipoDocumento/
D_TipoDocumentoAtributo, 7 aggregator, 8 update atributos_esperados, 9
Dropbox, 10 Claude, 11/25 parseo JSON, 12 router éxito/mismatch con 12
sub-módulos anidados 13-24).

⚠ **Más riesgoso que el import de `SC-Adjuntos-Upload`** — nada de esto se
probó contra Make real:

- Módulo 9 (`dropbox:downloadFile`) — antes de importar, exporta el
  blueprint de `E3_Carbone_Download_Dropbox` (o cualquier escenario activo
  que descargue de Dropbox) y confirma el module id/version real, igual que
  se hizo para `dropbox:uploadLargeFile` v5 en Fase Adjuntos 1 (ver
  `docs/aprendizajes.md` E-026). Reemplaza el módulo 9 si el nombre real es
  distinto.
- Módulo 10 (`http:ActionSendData`, llamada a Claude API) — el prompt ahora
  usa `{{join(map(7.array; "codigo_atributo"); ", ")}}` y
  `{{length(7.array)}}` para construir la lista de atributos dinámicamente
  (antes el aggregator del módulo 7 no se usaba en el prompt — ver banner al
  inicio de este archivo). **Verificar en el editor de fórmulas de Make que
  `map()`/`join()`/`length()` aceptan una referencia de array cruzando desde
  dentro de un router/rama distinta** (módulo 7 vive antes del router 12,
  módulo 10 también — deberían estar en el mismo nivel de flujo, pero
  confírmalo en el diseñador visual antes de guardar).
- Módulos 8 y 22 (`atributos_esperados`/`atributos_obtenidos` = `{{7.array}}`
  / `{{25.items}}`) — Make normalmente serializa un array/colección a JSON
  automáticamente cuando el campo destino es texto, pero **no está
  confirmado en esta versión de Make**. Después de la primera corrida de
  prueba, abre el record en Airtable y confirma que el campo contiene JSON
  válido (`[{"codigo_atributo":...}]`), no `[object Object]` ni vacío. Si
  sale mal, inserta un módulo `json:CreateJSON` (o similar) antes de 8/22.
- Módulo 11 (`json:ParseJSON`) — si Claude devuelve texto envolviendo el
  JSON pese a la instrucción del prompt, este módulo falla; en ese caso
  agrega un paso de limpieza (regex `\[.*\]` con flag `s`) antes de parsear.
- Contrato de datos cambiado: Claude ahora debe devolver `codigo_atributo`
  (string, ej. `"rol_sii"`) en vez de `atributo_id` (antes era un record ID
  de `D_Atributo`, tabla que ya no existe). `AT03-Ext_script.js` espera
  `codigo_atributo`.

Pasos:

1. Make → **Create a new scenario** → **Import Blueprint** → sube el JSON.
2. Reemplaza `__REEMPLAZAR_CONEXION_AIRTABLE__` por tu conexión Airtable
   existente (la misma que usa `SC-Adjuntos-Upload`).
3. Agrega una conexión Dropbox (`__REEMPLAZAR_CONEXION_DROPBOX__`) — reusa
   "My Dropbox connection" ya configurada.
4. Reemplaza `{{ANTHROPIC_API_KEY}}` en el módulo 10 por una Connection
   nativa de Anthropic si Make la ofrece, o por la variable de escenario de
   §5 — **nunca pegar la key en texto plano** (ver `docs/aprendizajes.md`
   E-037, y el hallazgo de esta sesión E-039: la key anterior quedó
   commiteada en git).
5. **Verifica campo por campo** cada módulo `airtable:Action*` contra el
   picker de variables de Make antes de guardar — mismo checklist que
   `SC-Adjuntos-Upload_import_instrucciones.md` "Diagnóstico 11-jul-2026": un
   import parcial deja campos sin enlazar a los tokens del módulo anterior,
   y todo sale vacío sin error visible.
6. Deja el escenario en **modo manual (no programado)** hasta completar §6.

### 4.1 Checklist de verificación específico de la reconstrucción (17-jul-2026)

No probado — verificar en orden antes de dar RF-09 por listo:

1. Importar y confirmar que Make no rechaza el JSON (estructura de 11
   módulos, router anidado 12→14).
2. Correr una vez con un PDF real de un tipo de documento con **un solo**
   atributo `una_por_unidad` y uno `una_por_solicitud`, y confirmar en
   Airtable que ambos llegaron a `TX_Unidades`/`TX_DatosTasacion`
   respectivamente (la automation `AT03-Ext` debe estar activa para esto).
3. Correr con un documento que declare el patrón "NO REGISTRA" (o forzarlo
   editando la respuesta simulada) y confirmar `avaluo_no_registra=TRUE` +
   `avaluo_total_raw` en `TX_DatosTasacion`.
4. Correr con dos adjuntos del mismo `tipo_documento` para la misma
   solicitud (ej. depto + estacionamiento) y confirmar que `AT03-Ext` crea
   **dos** filas distintas en `TX_Unidades`, no una sola sobrescrita.
5. Forzar 0 atributos extraídos dos veces seguidas (mismo adjunto,
   `intentos_carga=1` y luego `=2`) y confirmar que la 2ª vez marca
   `TX_Adjuntos.estado_extraccion=delegado_visador` y
   `TX_Solicitudes.tiene_pendientes_visador=TRUE`.
6. Confirmar que `LogEscenarios` recibe una fila por corrida, con
   `Escenario=SC-RF09-ExtraccionClaude` (opción agregada en §1.2).

---

## 5. Variables de entorno

### Make (scenario variables)

- `ANTHROPIC_API_KEY`

### Airtable Automations (secrets, ver §3.6)

- `MAKE_WEBHOOK_URL_RF09`
- `MAKE_RF09_HMAC_SECRET`

### `.env.local` + Railway (Next.js)

Ninguna nueva — esta sesión **no crea** `/api/extraccion/iniciar` (decisión
de diseño, ver `docs/aprendizajes.md` E-033). El único consumo desde
Next.js es de lectura (`ExtraccionStatusBadge`, `lib/adjuntos.ts`), sin
variables nuevas.

---

## 6. Prueba end-to-end (antes de activar las automations)

1. En Airtable, toma una fila existente de `TX_Adjuntos` con `clave_adjunto`
   poblado (ej. `permiso_edificacion`) y `solicitud` enlazada a una
   solicitud en estado `creada` o `asignada`.
2. Pon `estado_extraccion = idle` manualmente.
3. Ejecuta `AT-RF09-Trigger` en modo **Test** (botón de prueba de Airtable
   Automations, no lo actives todavía) usando esa fila como input.
4. Confirma en `LogEscenarios` que aparece una fila `SC-RF09-ExtraccionClaude`
   con `Estado = ✓ OK` y que el escenario Make se disparó (History de Make).
5. Sigue el escenario Make módulo por módulo en su History — confirma que
   llega hasta la llamada a Claude y que `TX_Adjuntos.atributos_obtenidos`
   queda poblado.
6. Ejecuta `AT03-Ext` en modo Test sobre la misma fila — confirma que se
   crea 1 fila en `D_Documento` y N filas en `D_DocumentoValorAtributo` con
   la columna de valor correcta según el `tipo_dato` de cada atributo.
7. Sólo después de un ciclo completo exitoso, activa ambas automations.

---

## 7. Al terminar

Responde **"listo checkpoint 1"** para que continúe con Tanda C (componentes
UI Next.js) y Tanda D (blueprint `SC-Adjuntos-Reemplazar`).
