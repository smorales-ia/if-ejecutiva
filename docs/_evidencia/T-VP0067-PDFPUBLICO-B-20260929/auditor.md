# Auditoría ciega — T-VP0067-PDFPUBLICO-B-20260929 · BLOQUE 4

**Auditor independiente** · 2026-09-29 (hora local WSL ~22:00) · Solo lectura.
No se leyó ningún reporte previo de la tanda. Todas las llamadas son propias
(REST Airtable con `AIRTABLE_TOKEN` de `.env.local`, curl sin cookies, grep/Read del repo).

Solicitud: **VP-2026-0067** = `recmMzeu3eWGxyXsf` · Base `app9G7lLkIV3CpeLa`.

---

## 1. Link público — **OK**

`TX_Solicitudes` (`tblaHTyMHYfmy7Fg6/recmMzeu3eWGxyXsf`), campo `pdf_final_url`:

```
https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=mgl40k4f98jz24knnzdr43osj&dl=0
```

- Formato: share-link Dropbox **`scl/fi`** con `rlkey` ✔ (no es un `/home?preview=` privado).
- `curl -sIL` en limpio (sin cookies, sin sesión):
  `302 → dl.dropboxusercontent.com/cd/0/inline/... → 302 → /cd/0/inline2/... → HTTP/2 200`.
  **Ningún hop pasa por `/login`.** ✔
- Con `dl=0→dl=1`: descarga real de **3.396.967 bytes** (3,4 MB > 1 MB ✔), magic bytes
  `25 50 44 46 2d 31 2e 36` = `%PDF-1.6` ✔, **8 páginas** (igual que el gold master
  `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`, también 8 páginas).
- `estado` de la solicitud: `pdf_listo`.

## 2. Botón "Descargar PDF" del tasador — **OK**

- `lib/tasador/lectura-tasacion.ts:462`:
  `pdfUrl: typeof f['pdf_final_url'] === 'string' ? f['pdf_final_url'] : undefined` — lee exactamente ese campo.
- `components/tasador/informe-preview.tsx:276-282`: `handleDescargarPDF()` hace
  `window.open(tasacion.pdfUrl, "_blank", "noopener,noreferrer")` con fallback `window.print()`;
  cableado al botón "Descargar PDF" en la línea 672-676.
- Fila **vigente** de `TX_DocumentosGenerados` (`tbl5sYnGPZXgYCBSY`): `rec2jNFZBEVTqSFHJ`
  (`doc_id=10`, `es_vigente=true`, `generado_en=2026-09-30T00:59:51Z`,
  `plantilla_version=PLANTILLA_MET_v2`). Su `url_pdf` es **idéntico** al share-link de
  `pdf_final_url` (mismo `scl/fi/5nqngrsjdfelbtuic7s9b`, mismo `rlkey`, `dl=0`). ✔

## 3. Vigencia única — **OK**

6 filas de `TX_DocumentosGenerados` linkeadas a VP-2026-0067
(`doc_id` 4, 6, 7, 8, 9, 10). **Exactamente 1** tiene `es_vigente=true`:
`rec2jNFZBEVTqSFHJ` (doc_id 10). Las otras 5 no tienen el flag. ✔

## 4. Datos intactos — **OK**

`TX_DatosTasacion` `recy8q3Tq9omjdNUf` (link a `recmMzeu3eWGxyXsf` verificado):

| Campo | Esperado | Leído |
|---|---|---|
| `arriendo_mensual` | 3.300.000 | **3300000** ✔ |
| `gasto_anual` | 3.300.000 | **3300000** ✔ |
| `ingreso_liquido_anual` | 36.300.000 | **36300000** ✔ |

Espejo `TX_Calculos` (`tblFz37KSvn5pLKDR`, 15 filas para la solicitud, motor `AT03_v11.2.0_v32b1`):

| Fila | Fórmula | Esperado | Leído |
|---|---|---|---|
| `recJBJQdcuodR7Kxd` | `F_UFm2_promedio` (`promedio_uf_m2_muestra`) | 33.643447932388284 | **33.643447932388284** ✔ |
| `rec2BVb0aDWPQ5Csl` | `F_ValorComercialUF` (`valor_comercial_uf`) | 20125.8624 | **20125.862399999998** ✔ (mismo float IEEE-754) |

Coherencia extra observada: `F_IngresoLiquidoAnualCLP = 36300000` (consistente con los
insumos de TX_DatosTasacion).

## 5. Dictamen espejo vs MET-6283

**Datos: 100%** — insumos y espejo de cálculo coinciden con los valores de referencia
sin desviación (el delta de `valor_comercial_uf` es representación de coma flotante,
no diferencia de valor).

**Entrega: 100%** — el PDF vigente es alcanzable por link público Dropbox `scl/fi`
sin autenticación, descarga un PDF real de 3,4 MB / 8 páginas (mismo paginado que el
gold master MET-6283), y el botón del tasador apunta exactamente a ese campo/URL.
La cadena campo → código → fila vigente es consistente extremo a extremo.

**Residuales detectados (no bloqueantes, fuera del alcance de datos/entrega):**

1. **Filas históricas con `url_pdf` privado**: las 5 filas no vigentes (doc_id 4-9)
   conservan links `dropbox.com/home?preview=` que exigen sesión. No afectan la entrega
   (solo la vigente alimenta el botón), pero son basura histórica.
2. **`clave_natural` duplicada**: las 6 filas comparten `VP-2026-0067-PDF-v1` y
   `version=1`/`version_doc=1` — el versionado documental no se incrementó entre
   regeneraciones; la unicidad la sostiene únicamente `es_vigente`.
3. **Nombre de archivo del share-link degradado**: `FRANCISCO-JOS-VERGARA-...`
   (la "É" de JOSÉ se pierde en el slug de Dropbox). Cosmético.
4. **Presentación/pixel-parity del PDF vs gold master**: no auditada aquí (mismo
   conteo de páginas y tamaño plausible, pero la comparación visual página a página
   excede una auditoría ciega por API). Cualquier residual de presentación UI/plantilla
   queda en esa categoría.

**Veredicto global: 5/5 OK.**
