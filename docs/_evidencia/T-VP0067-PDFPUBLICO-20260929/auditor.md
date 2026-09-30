# AUDITOR CIEGO — T-VP0067-PDFPUBLICO-20260929 · BLOQUE 3

> Auditoría independiente desde el ESTADO FINAL, 29-sep-2026. Solo lectura (GET).
> No se leyó ningún reporte .md de esta tanda (solo `blueprint-*.json` permitido y el
> cierre de la tanda ANTERIOR `docs/_analisis/CIERRE_T-VP0067-CONSISTENTE-PROD-20260929.md`).

## Criterio 1 — PDF público sin login: **FAIL**

**Estado observado (en vivo):**

- `TX_Solicitudes/recmMzeu3eWGxyXsf` → `pdf_final_url =`
  `https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO%20JOS%C3%89%20VERGARA%20UNDURRAGA_METLIFE%20-6283.pdf`
- Fila vigente de `TX_DocumentosGenerados` (`recYasPnZWAAoA3pW`, doc_id 9) → `url_pdf` idéntico
  (mismo formato `/home?preview=`, **no** es un share-link `/scl/fi/…` ni `/s/…`).

**Prueba en limpio** (`curl -sIL`, sin cookies):

```
HTTP/2 302
location: /login?cont=%2Fhome%2FVProperty%2FTasaciones%3Fpreview%3DFRANCISCO...
HTTP/2 200   ← la página final es https://www.dropbox.com/login?cont=...
```

El link redirige a la pantalla de login de Dropbox: **NO abre sin sesión**. Es una URL
interna del home del dueño de la cuenta, no un share-link público.

**Causa raíz (ambas patas verificadas):**

- (i) `GET $MB/connections/7553318` → scopes de "My Dropbox connection":
  `account_info.read · files.content.write · files.metadata.read · files.content.read`.
  **NO figura `sharing.write`** → la API de Dropbox no puede crear share-links con esta conexión.
- (ii) `GET $MB/scenarios/5791413` → name =
  `E3_Carbone_Download_Dropbox v2.1 - Dropbox+Airtable (sin share-link: scope pendiente)`,
  activo, lastEdit 2026-09-29T02:46Z. **Sigue en v2.1 "sin share-link"**: E3 nunca fue
  reapuntado a una versión que genere share-link, coherente con el scope ausente.

Conclusión causa raíz: el bloqueo D7 de la tanda anterior sigue intacto — la conexión
Dropbox no obtuvo `sharing.write` (consistente con la memoria del 29-sep: el Reauthorize
no otorgó el scope) y por lo tanto E3 sigue construyendo la URL `/home?preview=`.

## Criterio 2 — Dato bloqueado (D6c) cargado: **OK**

`GET TX_DatosTasacion tblMoK3mFuwN8Yr1A/recy8q3Tq9omjdNUf`:

| Campo | Valor en vivo | Oráculo (XLSM Portada) | Match |
|---|---|---|---|
| `arriendo_mensual` | 3.300.000 | BJ38 = 3.300.000 | ✅ |
| `gasto_anual` | 3.300.000 | BJ40 = 3.300.000 | ✅ |
| `ingreso_liquido_anual` | 36.300.000 | BJ43 = 36.300.000 | ✅ |

La fórmula `ingreso_liquido_anual` (read-only) resolvió correctamente al poblar sus fuentes.

## Criterio 3 — Espejo de DATOS vs MET-6283: **100% (238/238 campos-dato)**

El cierre anterior dictaminó ~99% (237/238) con un único campo-dato faltante: el bloque
D6c (`arriendo_mensual`/`gasto_anual` → `ingreso_liquido_anual`). Verificado en vivo
(Criterio 2): **cerrado**. Por lo tanto el espejo de datos queda en **238/238 = 100%**.

Qué queda fuera, separado por naturaleza (todo re-verificado en vivo, ninguno es
campo-dato del espejo):

**a) Entrega/link del PDF (no es dato del espejo):**
- D7 abierto: `pdf_final_url`/`url_pdf` exigen login Dropbox (Criterio 1, FAIL).
  El PDF en sí existe y es el vigente (doc_id 9); lo que falta es el acceso público.

**b) Presentación de UI (código, no dato):**
- Cap rate en preview: `valorCanonico.capRate.toFixed(2)` sigue en
  `components/tasador/informe-preview.tsx` (~línea 242) → muestra "0.04%".
- Header "v0" del preview (CI-024).
- Promedio simple de comparables en preview (CI-057 UI; el PDF usa el homologado).
- Registro fotográfico del preview vacío (fotos del espejo viven solo en el PDF;
  cargarlas como adjuntos rompería el 8/8 de extracción).

**c) Datos seed menores en Airtable, no consumidos por informe/PDF (siguen abiertos, sin cambio):**
- `avaluo_fiscal_uf = 339.809.429` — duplica el CLP (verificado en vivo; seed no consumido).
- `sup_construida_total = 0` — duplicado sin uso.
- 1 habitación sin nombre en `TX_HabitacionesPorNivel` (`rec2FJTUr70MkIhCe`; las otras 11
  filas de la solicitud tienen nombre).
- `TX_TerminacionesPorRecinto` vacía (0 filas) — puenteada por overrides con candado
  VP-2026-0067.

## Criterio 4 — Unicidad RN-56 (`es_vigente`): **OK**

`TX_DocumentosGenerados` tiene 5 filas ligadas a `recmMzeu3eWGxyXsf` (doc_id 4, 6, 7, 8, 9).
**Exactamente una** tiene `es_vigente = true`: `recYasPnZWAAoA3pW` (doc_id 9,
`fecha_creacion` 2026-09-29T23:13:13Z, PLANTILLA_MET_v2). Las otras cuatro no tienen el
campo seteado (false). Sin duplicados de vigencia.

## Veredicto final

| # | Criterio | Dictamen |
|---|---|---|
| 1 | PDF público sin login | **FAIL** — 302 → /login; causa raíz: conexión 7553318 sin `sharing.write` + E3 sigue v2.1 "sin share-link" |
| 2 | D6c cargado (3.3M / 3.3M / 36.3M) | **OK** |
| 3 | Espejo de DATOS | **100% (238/238)** — fuera del espejo solo quedan entrega del PDF (D7), presentación UI y seeds no consumidos |
| 4 | Única fila vigente | **OK** (doc_id 9) |

**La tanda logró el 100% del espejo de DATOS y mantiene RN-56 sano, pero el objetivo
que le da nombre (PDF PÚBLICO) NO se cumplió**: el link sigue exigiendo login porque el
scope `sharing.write` de la conexión Dropbox 7553318 nunca se obtuvo y E3 permanece en
v2.1 sin share-link. El desbloqueo es manual (reautorización/nueva conexión Dropbox con
`sharing.write` + subir E3 a una versión con share-link), decisión de Sergio.
