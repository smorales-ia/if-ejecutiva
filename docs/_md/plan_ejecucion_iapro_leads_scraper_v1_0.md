# Plan de Ejecución · IApro Leads Scraper v1.0

> **Versión del plan: v1.0** (11-sep-2026). Base normativa: `docs/_md/SPEC-iapro-leads-scraper-v4.md`
> (SPEC v4.0 — Make.com). Gobierna **una sola automatización Make**, no una app. Estilo tomado de
> `plan_ejecucion_UItasador_v1.5.md` §0/§2 (rigor y accionabilidad), sin replicar su volumen.
> Entregables: este plan + `docs/_artefactos/make/SC-IApro-LeadsScraper.blueprint.json`.

---

## §0 · Preflight

**Leer antes de tocar nada:**

1. `docs/_md/SPEC-iapro-leads-scraper-v4.md` — fuente normativa completa (flujo A–I, catálogo, criterios).
2. `docs/aprendizajes.md` §"Make blueprint management" (RO-10 y entradas de reimport 2026-09-04):
   - RO-10: al importar vN, **pausar v(N-1)** en el mismo turno.
   - "Module Not Found" al importar = un `module` cuyo tipo no existe en la app instalada. **No derivar
     nombres de módulo por analogía**; copiar literal de un blueprint que YA importó en Make.
   - Módulos script-created sin `restore.expect` devuelven **null bundles** en runtime.
3. Al menos 2 blueprints reales de `docs/_artefactos/make/` para la forma exacta de `modules`,
   `metadata`, `restore.expect` y `connection: {"__IMTCONN__": N}` (referencia: `SC-Edicion`,
   `SC-RF09-ExtraccionClaude`, `SC-Asignar`).

**Reglas duras (innegociables):**

- **R1 — Blueprint versionado en repo.** La fuente de verdad es el `.json` del repo; Make sólo refleja
  el último import. Al tocarlo, bumpear el `name` (`SC-IApro-LeadsScraper vX.Y - …`) y reimportar.
- **R2 — Sin credenciales en el JSON.** Ni API keys, ni tokens, ni OAuth. Sólo `{"__IMTCONN__": N}`,
  `SERPAPI_KEY` como variable global referenciada, y placeholders `__SPREADSHEET_ID_*__`.
- **R3 — Reimport siempre, nunca editar en la UI de Make.** Cambios en el repo → reimport. Nada de
  ediciones a mano en el canvas que luego no queden en el `.json` (deriva silenciosa).
- **R4 — Dedupe por `url_linkedin`.** Un `Search Rows` en la pestaña destino precede a cada `Add a Row`.
- **R5 — Filtro por correo obligatorio.** Perfil sin correo → se descarta. `correo` es la única columna
  que filtra el registro (SPEC §Catálogo).

**Precondiciones cumplidas (insumos del usuario — no gestionar):**

- Google Sheet input `iapro-busquedas` (hoja `Busquedas`) creada.
- Google Sheet output `iapro-leads` creada (pestañas se autocrean por búsqueda).
- API Key de SerpAPI emitida.
- Personal API Token de Apify emitido.

---

## §1 · Diseño

### §1.1 · Arquitectura (bloques A–I del SPEC)

```
A. Preparación
   ├─ SetVariables (6 params: max_pages, results_per_page, start_offset,
   │                 sleep_paginacion_s, sleep_perfil_s, dedupe_activo)
   ├─ GSheets Search Rows  ← hoja `Busquedas` WHERE activa = TRUE
   └─ SetVariable total_busquedas + estimado; Data Store: guarda estimado
        │
B. Loop por búsqueda
   ├─ Iterator (1 bundle = 1 búsqueda)
   └─ SetVariable query = site:linkedin.com/in "{dominio}" "{keyword}" "{ciudad}"
        │
C. Loop de paginación
   ├─ Repeater 1..max_pages
   ├─ SetVariable start = start_offset + (i-1) × results_per_page
   ├─ HTTP GET serpapi.com/search.json   [onerror → Break 429/5xx]
   ├─ Iterator organic_results[]
   └─ Filter: link empieza con https://www.linkedin.com/in/  (o https://{pais}.linkedin.com/in/)
        │
D. Scraping por perfil
   ├─ Sleep sleep_perfil_s
   ├─ Apify Run an Actor (dev_fusion/linkedin-profile-scraper, sync)  [onerror → Break 429/5xx]
   └─ Apify Get Dataset Items
        │
E. Extracción y filtro de correo
   ├─ SetVariable correo = match(summary, regex)
   └─ Filter: correo ≠ vacío
        │
F. Deduplicación
   ├─ GSheets Search Rows  ← pestaña {nombre_hoja} WHERE url_linkedin = {link}
   └─ Filter: cero filas
        │
G. Escritura
   ├─ GSheets Add a Sheet (si la pestaña no existe → headers en fila 1)
   └─ GSheets Add a Row (9 columnas del catálogo)
        │
H. Sleep entre paginaciones
   └─ Sleep sleep_paginacion_s (fin del Repeater)
        │
I. Reporte final
   ├─ Data Store Set (procesados, con_correo, duplicados, errores por pestaña)
   └─ Notification (reporte consolidado)
```

### §1.2 · Contratos

**Hoja `Busquedas` (input) — 6 columnas, fila 1 = encabezados:**

| A: keyword | B: ciudad | C: pais (ISO-2) | D: dominio | E: nombre_hoja (≤31, sin `/ \ ? * [ ]`) | F: activa (TRUE/FALSE) |

**Hoja de salida (`iapro-leads`) — catálogo CERRADO de 9 columnas, en este orden fijo:**

| # | Columna | Origen |
|---|---|---|
| 1 | `nombre` | Apify `fullName` |
| 2 | `cargo_actual` | Apify `experience[0].title` |
| 3 | `empresa_actual` | Apify `experience[0].companyName` |
| 4 | `ubicacion` | Apify `location` |
| 5 | `correo` | regex sobre Apify `summary`/`about` |
| 6 | `url_linkedin` | URL del resultado SerpAPI |
| 7 | `headline` | Apify `headline` |
| 8 | `resumen_about` | Apify `summary`/`about` |
| 9 | `fecha_extraccion` | timestamp ISO 8601 al escribir |

**Parámetros del escenario (módulo `Set multiple variables`):**

| Variable | Default | | Variable | Default |
|---|---|---|---|---|
| `max_pages` | `3` | | `sleep_paginacion_s` | `2` |
| `results_per_page` | `15` | | `sleep_perfil_s` | `10` |
| `start_offset` | `0` | | `dedupe_activo` | `TRUE` |

### §1.3 · Decisiones clave

- **D-1 · SerpAPI vía HTTP, sin connection nativa.** No existe app SerpAPI en Make. Se usa
  `http:ActionSendData` GET a `https://serpapi.com/search.json`; `api_key` = **variable global
  `SERPAPI_KEY`** del escenario, nunca embebida (R2).
- **D-2 · Apify módulo nativo síncrono.** `apify:runActor` con *Wait for finish* + `apify:getDatasetItems`.
  Nada de HTTP crudo contra la API de Apify.
- **D-3 · Dedupe por `Search Rows` previo al `Add a Row`.** Se consulta la pestaña destino por
  `url_linkedin = {link}`; sólo se escribe si vuelven cero filas (R4).
- **D-4 · Correo por regex sobre `summary`.** `match(summary; "[\w.+-]+@[\w-]+\.[\w.-]+"; "g")`, primer
  match; vacío ⇒ descarte (R5).
- **D-5 · Filtros = filtros de enlace, no módulos.** En Make un "Filter" del SPEC se representa como
  objeto `filter` sobre el módulo destino, no como módulo propio. Por eso el conteo de módulos del
  blueprint difiere del conteo de pasos del SPEC (los 3 Filter viven embebidos). Fidelidad de flujo
  intacta.

### §1.4 · Riesgos

- **RG-1 · "Module Not Found" al importar.** ⚠ **CRÍTICO.** Los blueprints del repo son de otro dominio
  (Airtable/Dropbox/Anthropic): **no hay un solo módulo Google Sheets, Apify, Iterator, Repeater, Sleep,
  Data Store ni Email para copiar literal**. Sus `module`, `version` y specs se escribieron con la
  nomenclatura pública de Make, **sin verificación contra un import previo del repo**. Verificación
  obligatoria en P0/P1 (importar y confirmar que ningún módulo aparece en rojo). Módulos verificados
  contra el repo: sólo `http:ActionSendData` (v3) y `util:SetVariable` (v1).
- **RG-2 · Cuota SerpAPI.** `total_busquedas × max_pages` requests. Con 12 búsquedas × 3 páginas = 36.
  El estimado se imprime al iniciar (Data Store) y el consumo real al terminar. Cuota agotada ⇒ `Break`
  con `Rollback = false` (reporte parcial + abortar).
- **RG-3 · Rate limit Apify.** `Sleep sleep_perfil_s` entre perfiles; `onerror → Break` (429/5xx) con
  reintentos; perfil que agota reintentos ⇒ `Resume` bundle vacío + contador `errores`.
- **RG-4 · Pestañas ausentes en primera corrida.** `Add a Sheet` antes del primer `Add a Row` cuando
  `nombre_hoja` no existe; crear con encabezados en fila 1.
- **RG-5 · Módulos script-created sin `restore.expect`.** Devuelven null bundles en runtime. Cada módulo
  del blueprint lleva `restore.expect`; verificar tras import que ninguno perdió mapeo.
- **RG-6 · Backoff exponencial no nativo.** El `Break` de Make expone `count`/`interval`, no una curva
  1s→3s→9s. Se fija `count=3`; la progresión exacta se ajusta a mano en el canvas si Make no la respeta.
- **RG-7 · Conteo de filas activas.** `total_busquedas` requiere agregar los bundles del `Search Rows`;
  si el módulo emite un bundle por fila, contar con la longitud del array de la operación, no con `+1`.

---

## §2 · Plan de construcción (tandas atómicas)

> Cada tanda: **qué construye · entregable · criterio de aceptación**. Orden estricto; no saltar.

**P0 · Connections en Make.**
Qué: crear 3 conexiones — Google Sheets (OAuth con acceso a `iapro-busquedas` **y** `iapro-leads`),
Apify (token), y variable global `SERPAPI_KEY` del escenario. · Entregable: 3 connections + 1 variable
global configuradas. · Aceptación: las tres resuelven sin error; `SERPAPI_KEY` visible en el escenario.

**P1 · Bloque A–B.**
Qué: importar blueprint; cablear `Set multiple variables` (6 defaults) + `Search Rows` (Busquedas,
`activa = TRUE`) + `SetVariable` total/estimado + `Iterator` por búsqueda. · Entregable: import limpio,
ningún módulo en rojo. · Aceptación: ningún "Module Not Found" (RG-1); el Iterator emite un bundle por
fila activa.

**P2 · Bloque C.**
Qué: query builder (`SetVariable` con comillas literales) + `Repeater` 1..max_pages + `SetVariable start`
+ HTTP GET SerpAPI + `Iterator` sobre `organic_results[]` + filtro `linkedin.com/in`. · Entregable:
bloque C funcional. · Aceptación: con `max_pages=1` devuelve `organic_results` y sólo pasan URLs
`https://…linkedin.com/in/`.

**P3 · Bloque D–E.**
Qué: `Sleep sleep_perfil_s` + Apify `Run an Actor` (sync) + `Get Dataset Items` + `SetVariable correo`
(regex) + filtro `correo ≠ vacío`. · Entregable: bloque D–E funcional. · Aceptación: un perfil real
devuelve `fullName`/`summary` y el filtro descarta los sin correo.

**P4 · Bloque F–G.**
Qué: `Search Rows` dedupe en `{nombre_hoja}` + filtro cero filas + `Add a Sheet` (si falta, headers) +
`Add a Row` (9 columnas). · Entregable: escritura con dedupe. · Aceptación: primera corrida crea pestaña
+ encabezados y escribe fila; segunda corrida no duplica (R4).

**P5 · Bloque H–I.**
Qué: `Sleep sleep_paginacion_s` (fin Repeater) + Data Store contadores
(`procesados`/`con_correo`/`duplicados`/`errores`) + `Notification` final. · Entregable: reporte
consolidado. · Aceptación: al terminar, la notificación trae el estimado inicial y el consumo real.

**P6 · Smoke test.**
Qué: `Run once` con **1 fila activa** en `iapro-busquedas` y `max_pages=1`. · Entregable: 1 corrida
verde. · Aceptación: escenario de principio a fin sin intervención; ≥1 fila con correo en la pestaña.

**P7 · Corrida real.**
Qué: activar las **12 búsquedas semilla** (`busquedas.txt`) y `Run once`. · Entregable: `iapro-leads`
con una pestaña por búsqueda activa. · Aceptación: todos los criterios §3; sin duplicados al repetir.

---

## §3 · Criterios de aceptación globales (literales del SPEC §Criterios de aceptación)

- El escenario corre de principio a fin con `Run once` sin intervención.
- El archivo de Salida tiene una pestaña por cada búsqueda con `activa = TRUE`, con los encabezados del
  catálogo en fila 1 y los datos abajo.
- Correr el escenario dos veces no duplica filas (dedupe por `url_linkedin`).
- Si una fila de `Busquedas` está malformada (falta ciudad o país), se salta con warning; no aborta el
  escenario completo.
- El escenario imprime el consumo estimado de SerpAPI al iniciar y el consumo real al terminar (en el
  Data Store y en la notificación final).
- El blueprint JSON exportado no contiene credenciales — solo referencias a `connections[N]`.
- La columna `activa` de la Sheet de Búsquedas funciona como filtro real.

---

## §4 · Fuera de alcance (v1) — literal del SPEC

- UI web para editar búsquedas (se usa directamente la Google Sheet).
- Almacenamiento en Supabase o base de datos.
- Envío automático de correos a los leads.
- Enriquecimiento con datos fuera del catálogo (teléfono, RUT, giro).
- Columnas distintas por pestaña en la misma corrida.
- Paginación distinta por búsqueda.
- Ejecución programada (v1 solo manual, con `Run once`).

---

## §5 · Convenciones de repo

- Rama destino: **`feature/iapro-leads-scraper`**.
- **SIEMPRE indicar la rama explícita** en cualquier `git commit` / `git push`
  (`git push origin feature/iapro-leads-scraper`). Nunca `git push` a secas.
- Commits los ejecuta Sergio desde GitHub Desktop; el push dispara redeploy en Railway — no afecta a
  este escenario Make, pero verificar antes de push.
- Blueprint vive en `docs/_artefactos/make/SC-IApro-LeadsScraper.blueprint.json` (R1). Cada cambio:
  bumpear `name` y reimportar (R3).
