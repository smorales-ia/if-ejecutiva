# Checkpoint Externo 1 · RF-09 — Instructivo de ejecución manual

> Generado 13-jul-2026. Estas son las 5 tareas manuales que Sergio debe ejecutar
> ANTES de que Claude Code retome RF-09 (Tanda C · UI). Nada de esto lo puede
> hacer el MCP ni un Route Handler: son acciones en las UIs de Airtable y Make.
>
> **Al terminar las 5, responde `listo checkpoint 1`** para continuar con Tanda C
> (componentes UI Next.js) y Tanda D (blueprint `SC-Adjuntos-Reemplazar`).
>
> Complementa (no reemplaza) `docs/make/SC-RF09-ExtraccionClaude_import_instrucciones.md`.
> Aquí está la versión con clics exactos, valores literales y qué esperar en cada paso.

## Mapa de las 5 tareas

| # | Tarea | Dónde | Bloqueante | Estado verificado 13-jul |
|---|---|---|---|---|
| 1 | Ampliar 2 campos `singleSelect` | Airtable UI | **Sí** — sin esto los scripts fallan al escribir | ❌ pendiente (verificado vía MCP: siguen con opciones viejas) |
| 2 | Crear automation `AT-RF09-Trigger` | Airtable Automations | Sí | ❌ pendiente |
| 3 | Crear automation `AT03-Ext` | Airtable Automations | Sí | ❌ pendiente |
| 4 | Importar blueprint `SC-RF09-ExtraccionClaude` | Make | Sí | ❌ pendiente |
| 5 | Probar end-to-end + activar | Airtable + Make | Sí | ❌ pendiente |

Orden obligatorio: **1 → 2 → 3 → 4 → 5**. La tarea 1 debe ir primero porque los
scripts de 2/3 escriben opciones que aún no existen. La 5 (activar) va al final,
tras un ciclo de prueba manual exitoso.

---

## Tarea 1 · Ampliar los 2 campos `singleSelect` (Airtable UI)

El MCP no puede agregar opciones a un `singleSelect` existente (solo acepta
`options.formula`). Hay que hacerlo a mano en dos tablas.

### 1.1 · `TX_Adjuntos.estado_extraccion`

**Estado actual verificado (MCP 13-jul):** 4 opciones — `idle · extrayendo · listo · error`.
Faltan 3.

1. Abre la base **VProperty** (`app9G7lLkIV3CpeLa`) en Airtable.
2. Ve a la tabla **`TX_Adjuntos`** (TABLE_ID `tblur71x1oItbmKZc`).
3. Localiza la columna **`estado_extraccion`** (FIELD_ID `fld54epvDJ7YdJIYD`).
4. Clic en el encabezado de la columna → **Edit field** (o doble clic en el nombre
   de la columna → ícono de lápiz).
5. En el panel de configuración del campo verás la lista "Options" con las 4
   opciones existentes. Clic en **`+ Add option`** (abajo de la lista) y agrega,
   una por una, **exactamente** (minúsculas, sin espacios, sin acentos):
   - `skipped`
   - `no_corresponde`
   - `delegado_visador`
6. **No borres ni renombres** las 4 existentes. El color de las nuevas es
   indistinto.
7. Clic **Save**.

**Resultado esperado:** 7 opciones totales:
`idle · extrayendo · listo · error · skipped · no_corresponde · delegado_visador`.

> ⚠ Copia-pega los nombres para evitar typos: un solo carácter distinto
> (`delegado-visador` con guion, `Skipped` con mayúscula) hace que
> `updateRecordAsync({ estado_extraccion: 'skipped' })` lance error en runtime y
> el adjunto quede colgado.

### 1.2 · `LogEscenarios.Escenario`

**Estado actual verificado (MCP 13-jul):** 12 opciones, NINGUNA de IF-02
(`Email tasador · Email cliente visita · Alerta SLA 2d · Alerta SLA 3d · Email
informe PDF · UF diaria · Solicitud repetida · Informe visado · E1_Airtable_Make ·
E2_Carbone_Render · E3_Carbone_Download_Dropbox · E4_Notificacion_Email`).

1. Ve a la tabla **`LogEscenarios`** (TABLE_ID `tblR4VWpUHw1CSyIS`).
2. Localiza la columna **`Escenario`** (FIELD_ID `fldPktGeTzNCRQ319`).
3. Encabezado → **Edit field**.
4. **`+ Add option`** → agrega **exactamente**:
   - `SC-RF09-ExtraccionClaude`
5. **No toques** las 12 existentes. Clic **Save**.

**Resultado esperado:** 13 opciones; la nueva es `SC-RF09-ExtraccionClaude`.

> El escenario activo `SC-Adjuntos-Upload` loguea con nombres de campo viejos que
> no existen (hallazgo §13.5 de `schema-airtable.md`) — eso es deuda separada, NO
> lo arregles en este checkpoint. Aquí solo agregas la opción para RF-09.

---

## Tarea 2 · Automation `AT-RF09-Trigger` (Airtable)

Dispara el webhook de Make cuando un adjunto queda listo para extracción.
Script fuente: **`docs/make/AT-RF09-Trigger_script.js`** (pégalo íntegro).

### 2.1 · Crear la automation

1. En la base, arriba a la derecha: **Automations** → **+ Create automation**.
2. Renómbrala **`AT-RF09-Trigger`** (clic sobre "Untitled automation").

### 2.2 · Trigger

3. **Choose a trigger** → **When a record is created**.
4. Table: **`TX_Adjuntos`**.
5. (Segundo disparo para el 2º intento — Tanda D) Airtable no combina 2 triggers
   distintos en una automation. **Duplica esta automation** al final (§2.6) con el
   mismo script pero trigger **When a record matches conditions** /
   **When record updated** observando `estado_extraccion`. Por ahora deja solo el
   "record created" para el flujo principal.

### 2.3 · Action: Run a script

6. **+ Add action** → **Run a script**.
7. En el editor de script, **borra el código de ejemplo** y **pega el contenido
   completo** de `docs/make/AT-RF09-Trigger_script.js`.

### 2.4 · Input variable `adjuntoId`

8. En el editor de script, panel izquierdo **Input variables** → **+ Add input
   variable**.
9. Name: **`adjuntoId`** (exacto, minúscula la a).
10. Value: **Dynamic** → selecciona **Record (from step 1: trigger)** →
    **Airtable record ID** (el id del record disparador).

### 2.5 · Secrets del webhook

El script lee `input_.MAKE_WEBHOOK_URL_RF09` y `input_.MAKE_RF09_HMAC_SECRET`.

11. Si tu UI de Airtable expone **Secrets** en el editor de script (ícono ⚙ /
    "Manage secrets"): agrega ahí `MAKE_WEBHOOK_URL_RF09` y `MAKE_RF09_HMAC_SECRET`.
12. Si tu versión **no** muestra Secrets, agrégalos como **input variables de
    texto** adicionales (mismo panel del paso 8), con estos nombres exactos y su
    valor pegado como **Static / fixed value**:
    - `MAKE_WEBHOOK_URL_RF09` = la URL del webhook de Make (la obtienes en la
      Tarea 4, módulo 1 — **vuelve aquí a pegarla después de crear el escenario**).
    - `MAKE_RF09_HMAC_SECRET` = un secreto que tú inventas (ej. 32 chars aleatorios).
      Debe ser **idéntico** al que configures en el módulo de verificación de firma
      de Make. Guárdalo en un lugar seguro; se usa en ambos lados.
13. **Avísame si tuviste que usar la opción 12** (input vars en vez de secrets)
    para documentarlo — es menos seguro pero funcional.

### 2.6 · No activar aún

14. Guarda pero **deja la automation en OFF** (toggle arriba a la derecha). Se
    activa en la Tarea 5 tras la prueba.
15. (Opcional 2º trigger) Duplica la automation → **`AT-RF09-Trigger-Reintento`**,
    cambia solo el trigger a **When record updated** watching `estado_extraccion`,
    mismo script y misma input var. Déjala OFF también.

**Resultado esperado:** automation `AT-RF09-Trigger` creada, con script pegado,
input var `adjuntoId` mapeada, secrets/inputs de webhook configurados, en OFF.

---

## Tarea 3 · Automation `AT03-Ext` (Airtable)

Hace el fan-out EAV (`D_Documento` + `D_DocumentoValorAtributo`) y la propagación
data-driven a tablas destino. Script fuente: **`docs/make/AT03-Ext_script.js`**.

### 3.1 · Crear

1. **Automations** → **+ Create automation** → nombre **`AT03-Ext`**.

### 3.2 · Trigger

2. **When a record is updated**.
3. Table: **`TX_Adjuntos`**.
4. **Fields to watch** → selecciona **solo** el campo **`atributos_obtenidos`**
   (`fldeCH15RrL8f4TZk`). Esto es lo que escribe el blueprint de Make (módulo 22,
   rama Éxito) y lo que debe disparar este script.

### 3.3 · Action: Run a script

5. **+ Add action** → **Run a script**.
6. Borra el ejemplo, **pega íntegro** `docs/make/AT03-Ext_script.js`.

### 3.4 · Input variable

7. **Input variables** → **+ Add** → name **`adjuntoId`** → Dynamic →
   **Record (trigger)** → **Airtable record ID**.

### 3.5 · Sin secrets

8. Este script **no** llama a Make ni necesita secrets (solo lee/escribe Airtable).
   No agregues nada más.

### 3.6 · Verificación de dependencias del script (importante)

Antes de guardar, confirma que el script encontrará lo que espera (ya verificado
vía MCP el 13-jul, pero revísalo si editaste algo):
- `D_Atributo.uso_tabla_destino` (singleLineText), `uso_campo_destino`
  (singleLineText), `uso_cardinalidad_destino` (singleSelect:
  `directo_solicitud · una_por_solicitud · muchas_por_solicitud ·
  PENDIENTE_VALIDACION`), `uso_campo_link_solicitud` (singleLineText) — **los 4
  existen** ✅.
- `TX_Solicitudes.origen_dato` (singleSelect: `tipeado · extraido_rf09 ·
  consolidado_visador`) — **existe** ✅. La propagación setea `extraido_rf09`
  cuando la tabla destino tiene ese campo.
- Para que la propagación **haga algo**, los atributos de cada `tipo_documento`
  deben tener `uso_tabla_destino` / `uso_campo_destino` / `uso_cardinalidad_destino`
  poblados en `D_Atributo` con valor real (**no** `PENDIENTE_VALIDACION`). Si están
  en `PENDIENTE_VALIDACION` o vacíos, el script guarda el EAV en `D_` pero **omite**
  la propagación (decisión de diseño, no es error). Eso es esperable en la primera
  prueba si aún no cargaste esa metadata.

### 3.7 · No activar aún

9. Guarda, **deja en OFF**.

**Resultado esperado:** automation `AT03-Ext` creada, script pegado, watching
`atributos_obtenidos`, input `adjuntoId` mapeada, en OFF.

---

## Tarea 4 · Importar blueprint `SC-RF09-ExtraccionClaude` en Make

Archivo: **`docs/make-blueprints/SC-RF09-ExtraccionClaude.blueprint.json`**.
⚠ Más riesgoso que `SC-Adjuntos-Upload`: 3 módulos (Dropbox download, HTTP→Claude,
ParseJSON) no fueron exportados de un escenario real tuyo. Trátalo como punto de
partida, no como import garantizado.

### 4.1 · Preparar (recomendado antes de importar)

1. En Make, abre un escenario ACTIVO que descargue de Dropbox (ej.
   **`E3_Carbone_Download_Dropbox`**) → menú **···** → **Export Blueprint**.
2. Anota el **module id/version real** del módulo Dropbox download (igual que se
   hizo con `dropbox:uploadLargeFile` v5 en Fase Adjuntos 1, ver E-026). Lo usarás
   para corregir el módulo 9 si el nombre no coincide.

### 4.2 · Importar

3. Make → **Create a new scenario** → ícono **···** (arriba) → **Import Blueprint**
   → sube el JSON.
4. Al abrir, Make marcará conexiones/variables sin resolver. Resuélvelas:
   - Sustituye **`__REEMPLAZAR_CONEXION_AIRTABLE__`** por tu conexión Airtable
     existente (la misma de `SC-Adjuntos-Upload`).
   - Sustituye **`__REEMPLAZAR_CONEXION_DROPBOX__`** por **"My Dropbox connection"**.

### 4.3 · Configurar módulo por módulo

Recorre los módulos en orden y verifica:

- **Módulo 1 · Webhook (Custom webhook):** copia la **URL del webhook** que Make
  genera aquí → **pégala en `MAKE_WEBHOOK_URL_RF09`** de la Tarea 2 (§2.5). Sin
  esto el trigger de Airtable no sabe a dónde llamar.
- **Verificación de firma HMAC (si el blueprint la trae como módulo/filtro):**
  usa el mismo `MAKE_RF09_HMAC_SECRET` que pusiste en Airtable (§2.5). El header
  entrante es `X-VP-Signature` (HMAC-SHA256 del body crudo).
- **Módulos `airtable:*` (buscar el adjunto, poblar `atributos_esperados`,
  escribir `atributos_obtenidos`, marcar `estado_extraccion`):** abre **cada uno**
  y confirma **campo por campo** que cada valor está enlazado al token del módulo
  anterior (picker de variables), no vacío. Este es el error que dejó filas vacías
  en Fase Adjuntos 1 ("Diagnóstico 11-jul"): un import parcial deja campos sin
  enlazar y **todo sale vacío sin error visible**.
- **Módulo 9 · Dropbox download:** si el nombre/version no coincide con lo que
  anotaste en §4.1, reemplaza el módulo por el correcto y re-mapea `path`
  (viene de `url_dropbox`).
- **Módulo 10 · HTTP → Make a request (llamada a Claude API):**
  - URL: `https://api.anthropic.com/v1/messages`.
  - Headers: `x-api-key: {{ANTHROPIC_API_KEY}}`, `anthropic-version: 2023-06-01`,
    `content-type: application/json`.
  - Usa `ANTHROPIC_API_KEY` como **variable de entorno del escenario** (§4.4), NO
    hardcodeada en el módulo.
  - Modelo: el blueprint trae uno por defecto; si quieres el más capaz usa
    `claude-opus-4-8` (o el que definas). Confirma que el body pide **JSON puro**
    en la respuesta.
- **Módulo 11 · Parse JSON:** si Claude envuelve el JSON en texto pese al prompt,
  este módulo falla. Solución: inserta antes un módulo de texto que extraiga con
  regex `\[.*\]` (flag `s`) o `\{.*\}` y parsea eso.
- **Router (rama Éxito / rama Mismatch):** la rama Éxito escribe
  `TX_Adjuntos.atributos_obtenidos` (esto dispara `AT03-Ext`). La rama Mismatch
  marca `no_corresponde` / `delegado_visador`. Verifica que ambas ramas escriban
  el `estado_extraccion` correcto.
- **Módulos `LogEscenarios` (Create Record):** deben usar los **nombres reales**
  (`Titulo Log`, `Escenario` = `SC-RF09-ExtraccionClaude`, `Estado` con valores
  `✓ OK · ✗ Error · ⚠ Parcial · ⏭ Omitido`, `Solicitud`, `Detalle`). El blueprint
  nuevo ya los trae correctos — solo confirma que el picker los enlazó.

### 4.4 · Variable de entorno del escenario

5. Make → **Scenario settings** (⚙) → **Variables** → agrega `ANTHROPIC_API_KEY`
   con tu API key de Anthropic.

### 4.5 · Dejar en manual

6. **No programes** el escenario (déjalo sin schedule / en modo manual). Se prueba
   en la Tarea 5.

**Resultado esperado:** escenario `SC-RF09-ExtraccionClaude` importado, conexiones
resueltas, URL del webhook copiada a Airtable, `ANTHROPIC_API_KEY` como variable,
cada módulo Airtable verificado campo por campo, en modo manual.

---

## Tarea 5 · Prueba end-to-end + activación

**No actives ninguna automation ni programes el escenario hasta completar un ciclo
manual exitoso.**

### 5.1 · Preparar un adjunto de prueba

1. En `TX_Adjuntos`, elige (o crea) una fila con:
   - `clave_adjunto` poblado con un código real de `D_TipoDocumento` (ej.
     `permiso_edificacion`).
   - `solicitud` enlazada a una solicitud en estado **`creada`** o **`asignada`**
     (no terminal).
   - `url_dropbox` apuntando a un archivo real subido (de una prueba de
     `SC-Adjuntos-Upload`).
2. Pon manualmente **`estado_extraccion = idle`**.

### 5.2 · Disparar el trigger de Airtable en modo Test

3. Abre `AT-RF09-Trigger` → botón **Test** (no la actives) → elige esa fila como
   input de prueba → **Run test**.
4. **Esperado:** en `LogEscenarios` aparece una fila `SC-RF09-ExtraccionClaude`
   con `Estado = ✓ OK` y detalle `webhook disparado`. En Make, el escenario recibe
   el webhook (revisa **History**).
   - Si `Estado = ⏭ Omitido` → el adjunto no cumplía precondición (sin
     `clave_adjunto`, o solicitud terminal). Revisa el `Detalle`.
   - Si `Estado = ✗ Error` "faltan secrets" → vuelve a §2.5.
   - Si `Estado = ✗ Error` "tipo no reconocido" → `clave_adjunto` no existe en
     `D_TipoDocumento`.

### 5.3 · Seguir el escenario Make módulo por módulo

5. En Make → **Run once** (o revisa el History de la ejecución disparada por el
   webhook). Sigue cada módulo:
   - Dropbox download trae el archivo.
   - HTTP→Claude responde (código 200; revisa el output).
   - Parse JSON no falla.
   - Rama Éxito escribe `TX_Adjuntos.atributos_obtenidos` (JSON array
     `[{atributo_id, valor}, ...]`).
6. **Esperado:** `TX_Adjuntos.atributos_obtenidos` queda poblado con JSON válido y
   `estado_extraccion` cambia según la rama. Si algún módulo Airtable escribe
   vacío → vuelve a §4.3 (campo sin enlazar).

### 5.4 · Probar `AT03-Ext` en modo Test

7. Abre `AT03-Ext` → **Test** → usa la misma fila (que ya tiene
   `atributos_obtenidos` poblado) → **Run test**.
8. **Esperado:**
   - Se crea **1 fila** en `D_Documento` (con `extraccion_incompleta` = TRUE solo
     si hubo atributos en null).
   - Se crean **N filas** en `D_DocumentoValorAtributo`, cada una con **exactamente
     una** columna de valor poblada (`valor_texto` / `valor_numero` / `valor_fecha`
     / `valor_booleano` / `catalogo_valor`) según el `tipo_dato` del atributo
     (RN-32).
   - `TX_Adjuntos.estado_extraccion = listo`.
   - En `LogEscenarios`, fila `AT03-Ext · propagación (X ok · Y skip · Z err)`.
   - **Propagación:** si los atributos tienen `uso_tabla_destino` /
     `uso_campo_destino` / `uso_cardinalidad_destino` reales, los campos destino se
     poblan (solo si estaban vacíos — decisión A) y `origen_dato = extraido_rf09`.
     Si la metadata está en `PENDIENTE_VALIDACION` o vacía, verás `skip` con motivo
     "sin destino declarado" — **eso es correcto**, no es un error.
9. Verifica en `D_DocumentoValorAtributo` que ninguna fila tenga 2 columnas de
   valor pobladas (violaría RN-32).

### 5.5 · Activar

10. Solo tras un ciclo completo exitoso (5.2 → 5.4):
    - Activa `AT-RF09-Trigger` (toggle ON).
    - Activa `AT03-Ext` (toggle ON).
    - (Si creaste el 2º trigger de reintento, actívalo también.)
    - Deja el escenario Make **activado** (ON) para que escuche el webhook.

**Resultado esperado final:** subir un adjunto real por la app → en < 30 s
`estado_extraccion` pasa a `listo`, `D_Documento` + `D_DocumentoValorAtributo`
pobladas, propagación aplicada donde hay metadata, y `LogEscenarios` con el rastro
completo.

---

## Al terminar

Responde en el chat: **`listo checkpoint 1`**.

Indica también, si aplica:
- Si tuviste que usar **input variables en vez de secrets** en `AT-RF09-Trigger`
  (§2.5 opción 12) — para documentarlo.
- Si el **módulo 9 (Dropbox)** tenía un nombre/version distinto — para corregir el
  blueprint fuente.
- Si **Claude devolvió texto envolviendo el JSON** y hubo que agregar limpieza
  regex (§4.3 módulo 11).

Con eso Claude Code retoma **Tanda C** (componentes UI: `ExtraccionStatusBadge` +
wiring en `tab-adjuntos.tsx`) y **Tanda D** (blueprint `SC-Adjuntos-Reemplazar`
para el 2º intento de carga).
