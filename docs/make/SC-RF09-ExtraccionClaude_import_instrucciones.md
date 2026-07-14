# SC-RF09-ExtraccionClaude · Instructivo de importación — CHECKPOINT EXTERNO 1

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

Archivo: `docs/make-blueprints/SC-RF09-ExtraccionClaude.blueprint.json`

⚠ **Más riesgoso que el import de `SC-Adjuntos-Upload`** porque incluye 3
módulos sin verificar contra un blueprint real de tu organización Make:

- Módulo 9 (`dropbox:downloadFile`) — antes de importar, exporta el
  blueprint de `E3_Carbone_Download_Dropbox` (o cualquier escenario activo
  que descargue de Dropbox) y confirma el module id/version real, igual que
  se hizo para `dropbox:uploadLargeFile` v5 en Fase Adjuntos 1 (ver
  `docs/aprendizajes.md` E-026). Reemplaza el módulo 9 si el nombre real es
  distinto.
- Módulo 10 (`http:ActionSendData`, llamada a Claude API) — confirma en la
  UI de Make que el nombre del módulo "HTTP → Make a request" coincide.
- Módulo 11 (`json:ParseJSON`) — si Claude devuelve texto envolviendo el
  JSON pese a la instrucción del prompt, este módulo falla; en ese caso
  agrega un paso de limpieza (regex `\[.*\]` con flag `s`) antes de parsear.

Pasos:

1. Make → **Create a new scenario** → **Import Blueprint** → sube el JSON.
2. Reemplaza `__REEMPLAZAR_CONEXION_AIRTABLE__` por tu conexión Airtable
   existente (la misma que usa `SC-Adjuntos-Upload`).
3. Agrega una conexión Dropbox (`__REEMPLAZAR_CONEXION_DROPBOX__`) — reusa
   "My Dropbox connection" ya configurada.
4. Configura `ANTHROPIC_API_KEY` como variable de entorno del escenario
   (Make → Scenario settings → Variables), no hardcodeada en el módulo 10.
5. **Verifica campo por campo** cada módulo `airtable:Action*` contra el
   picker de variables de Make antes de guardar — mismo checklist que
   `SC-Adjuntos-Upload_import_instrucciones.md` "Diagnóstico 11-jul-2026": un
   import parcial deja campos sin enlazar a los tokens del módulo anterior,
   y todo sale vacío sin error visible.
6. Deja el escenario en **modo manual (no programado)** hasta completar §6.

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
