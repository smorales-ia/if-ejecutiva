# PLAN — T-VP0067-IMAGENES-UI-20260930

> Fase 1 consolidada (6 agentes en paralelo, solo lectura). Rama plan: `plan/T-VP0067-IMAGENES-UI-20260930`.
> Objetivo: imagen → UI (con categoría) → PDF desde UN origen único y genérico; VP-2026-0067 espejo de MET-6283 en vista y PDF.

## §1 · Resumen del diagnóstico

Hoy hay **tres orígenes divergentes** y por eso la vista cuenta 0 mientras el PDF sale completo:

| Consumidor | Origen efectivo hoy | Estado |
|---|---|---|
| Vista /informe (REGISTRO FOTOGRÁFICO) | `TX_Adjuntos` con `subido_por="Tasador"`, categoría = `descripcion` (id de `CATEGORIAS_FOTO`) — `lib/tasador/lectura-fotos.ts:177`, conteo en `components/tasador/informe-preview.tsx:271-273,581` | **0 filas** para VP-0067 (el seed del espejo es todo `subido_por="Sistema"`) → 0 fotografías. Binding sano: faltan datos, no código, para los contadores. **Miniaturas: falta código** (la sección 7 solo pinta números) |
| Bloque 7 canónico (informe-data) | `TX_Adjuntos` con `tipo_adjunto` prefijo `foto` — `lib/tasador/lectura-informe.ts:397` | también 0 filas |
| PDF (Carbone) | **Bypass local**: `ASSETS_POR_CODIGO['VP-2026-0067'] → docs/_artefactos/carbone/assets_met6283/`, data-URI base64 — `lib/informe/imagenes.ts:33-85` | 36/36 ranuras pobladas, pero 100% hardcode MET-6283. Bug latente: la grilla matchea por caption del gold master (`'Cocina'`) contra ids de la UI (`cocina`) — un adjunto real jamás calza (`imagenes.ts:158`) |

Plantilla `PLANTILLA_MET_v2.docx`: **36 tags de imagen** = 20 fijas `{d.imagenes.*}` + grilla 16 `{d.fotos.fotos[i=0..15].url}` con caption `.categoria`. Assets: 37 archivos mapeados 1:1 (ver §3). Cadena Make: **E2 ACTIVO y sano; E3 DETENIDO** (409 `Share link already exists` al re-render del mismo path + cola pendiente — paso manual de Sergio). El binario de fotos entra por `POST /api/adjuntos/upload` → SC-Adjuntos-Upload (Make, conexión Dropbox 7553318 **vigente**) — la credencial Dropbox rota de `.env.local` NO interviene en la siembra, pero **sí impide leer** esos binarios desde el server (por eso la fuente renderizable debe viajar con la fila, ver §4). Tasador de VP-0067: **nutricionsaludketo@gmail.com** (Clerk verificado).

## §2 · Alcance

**SÍ**: (P1) miniaturas + conteos reales en la sección 7 leyendo del origen único · (P2) verificar/cablear la carga por categoría existente (`/tasaciones/[id]/fotos`) para que escriba la fuente renderizable · (P3) grilla de 16 fotos del PDF poblada desde el MISMO origen (categoría→caption por label de `CATEGORIAS_FOTO`, orden por `orden`), matando el match por caption · siembra de las 16 fotos de grilla de VP-0067 en el origen (upload real vía webhook SC-Adjuntos + categorización) · resolución genérica "adjunto-primero" también para las 20 ranuras fijas (código listo), con fallback espejo documentado.

**NO**: crear códigos nuevos en `D_TipoDocumento`, campos nuevos en Airtable, tablas o escenarios (requieren aprobación) · tocar E1/E2/E3 (prohibido por CLAUDE.md; el 409 de E3 es paso manual de Sergio) · logo/firma por-entidad (deuda: `M_Clientes`/`M_Tasadores`, propuesto en §4) · re-render que escriba `pdf_final_url` (E3 caído: la validación del PDF va por Carbone API directa, sin tocar producción) · tocar oráculo/assets/otras solicitudes/terna.

## §3 · Tabla clave (resumen del mapeo 1:1 — detalle completo en el reporte A4)

**Grilla REGISTRO FOTOGRÁFICO (16 fotos, Hojas 4-5)** — categoría entre las 8 de `CATEGORIAS_FOTO` (`lib/tasador/tasaciones.ts:903-912`):

| i | Asset (render/) | Categoría (id) | Caption gold master |
|---|---|---|---|
| 0 | h4_01_ubicacion.png | mapa_ubicacion | Ubicación |
| 1 | anexo1_plano.jpg | (custom: Planificación) | Planificación |
| 2 | h4_03_fachada.jpg | fachada_exterior | Fachada |
| 3 | h4_04_sector.jpg | fachada_exterior | Sector |
| 4 | h4_05_living.jpg | living_comedor | Living |
| 5 | h4_06_comedor.jpg | living_comedor | Comedor |
| 6 | h4_07_cocina.jpg | cocina | Cocina |
| 7 | h4_08_bano_visitas.jpg | banos | Baño visitas |
| 8 | h5_01_dormitorio_principal.jpg | habitaciones | Dormitorio principal |
| 9 | h5_02_bano_principal.jpg | banos | Baño principal |
| 10 | h5_03_dormitorio_a.jpg | habitaciones | Dormitorio |
| 11 | h5_04_dormitorio_b.jpg | habitaciones | Dormitorio |
| 12 | h5_05_sala_estar.jpg | living_comedor | Sala de estar |
| 13 | h5_06_piscina.jpg | fachada_exterior | Piscina |
| 14 | h5_07_terraza_quincho.jpg | fachada_exterior | Terraza + Quincho |
| 15 | h5_08_fachada_posterior_patio.jpg | fachada_exterior | Fachada posterior |

Conteo esperado post-siembra: mapa_ubicacion 1 · fachada_exterior 5 · living_comedor 3 · cocina 1 · banos 2 · habitaciones 3 · **estacionamientos 0 y ofertas_comparables 0 (honestos: el gold master no tiene fotos ahí — las comparables ocupan ranuras propias de Hoja 2)** · 1 categoría custom "Planificación" (la UI ya soporta custom: `FotoCategoriaCreator`). Total: **16 fotografías**.

**Fuera del registro (20 ranuras fijas `{d.imagenes.*}`)**: H1 mapa+fachada, firma, H2 mapa refs+ref1-3, Anexo 1 ×7, Anexo 2 ×6 — siguen resolviendo del fallback espejo para VP-0067 (sin códigos `D_TipoDocumento` nuevos ni lectura Dropbox no hay fuente por-solicitud); el resolutor queda "adjunto-primero" para cuando exista. `p1_logo.png` estático en el DOCX (intencional) y `h2_mapa_referencias.png` superseded.

## §4 · Contrato de origen único (genérico)

**Origen = `TX_Adjuntos`, una fila por imagen.** Para el REGISTRO FOTOGRÁFICO (lo que este contrato deja 100% genérico):
- `subido_por='Tasador'` · `tipo_adjunto='foto_interior'` · `descripcion` = **id** de `CATEGORIAS_FOTO` (o nombre custom) · `orden` = posición en la grilla · `url_dropbox` = binario real (pipeline SC-Adjuntos) · **`thumbnail_url` = fuente renderizable que viaja con la fila (data-URI JPEG, calidad render, ≤95k caracteres)**.
- La decisión clave: mientras el server no pueda leer Dropbox (credencial rota, memoria 29-sep), la imagen renderizable se escribe EN la fila al momento de la carga — el mismo dato alimenta miniatura de la UI y ranura del PDF. Una sola fuente (RO-05); `url_dropbox` conserva el original para el futuro.
- Consumidores: vista /informe (conteos ya cablados + miniaturas nuevas) · UI de carga (PATCH `/fotos` ya escribe categoría; se asegura que `thumbnail_url` se genere y persista al subir) · ensamblador (`resolverImagenes`): grilla desde las fotos canónicas ordenadas por `orden`, caption = label de la categoría, `url` = thumbnail data-URI (o URL http si existiera).
- Las 8 categorías salen SIEMPRE de `CATEGORIAS_FOTO` (una sola definición, `lib/tasador/tasaciones.ts`) — ni la vista ni el PDF hardcodean labels.
- Deuda propuesta (aprobación Sergio): códigos `D_TipoDocumento` para las 20 ranuras fijas; logo en `M_Clientes`/`C_VariablesCliente`; firma en `M_Tasadores`; lectura Dropbox server-side.

## §5 · Ejecución en olas

- **BLOQUE 0** (secuencial): snapshot → rollback.md (estado TX_Adjuntos VP-0067, conteo actual, archivos de código a tocar, tipo del campo `thumbnail_url`).
- **OLA 1 (paralela)**: A) `informe-preview.tsx` — miniaturas sección 7 · B) `lib/informe/imagenes.ts` (+`ensamblador.ts` si hace falta) — grilla desde origen, captions por label, adjunto-primero · C) flujo de carga — thumbnail data-URI al subir/categorizar (`fotos-categorizadas.tsx` / pantalla fotos / PATCH) · D) siembra VP-0067 — 16 uploads reales vía webhook SC-Adjuntos-Upload + categorización (estado terminal para no romper /lectura). Archivos disjuntos A/B/C; D solo datos.
- **GATE S1**: A+B+C con typecheck/tests verdes y build limpio; D con 16 filas verificadas por relectura.
- **OLA 2**: corrida real — payload ensamblado con el build nuevo contra los datos sembrados; PDF por Carbone API directa (token TEST/PROD, sin Make E2/E3, sin escribir producción); captura de la vista.
- **BLOQUE 2** tests → **BLOQUE 3** auditor ciego → **BLOQUE 4** rollback condicional.

## §6 · Batería de tests

1. REGISTRO FOTOGRÁFICO: total "16 fotografías"; contadores 1/2/1/0/1/5/0/3 según §3 + custom Planificación 1 → screenshot `vista-informe.png` (si Clerk headless lo permite; si no, evidencia data-driven del server + verificación visual de Sergio).
2. UI: 16 miniaturas visibles con su categoría.
3. PDF: 36/36 ranuras con imagen → `pdf-imagenes-check.md`.
4. Correlación 1:1 grilla: la foto i de la UI (categoría X) = foto i del payload/PDF con caption = label de X → `correlacion.md`.
5. Espejo: mismas imágenes que MET-6283 (grilla desde origen = mismos bytes sembrados desde `render/`).
6. GENÉRICO: grep — cero referencias a nombres de archivo MET/`assets_met6283` en el camino de la grilla; categorías solo desde `CATEGORIAS_FOTO`; test unitario del reparto/captions.
7. Regresión: suite completa + /lectura de VP-0067 sigue completo/verde (fotos sembradas en estado terminal, sin naranjos nuevos), REF. C.B.R. y overrides intactos, botones Descargar PDF/Ver expediente.

## §7 · Riesgos y pasos manuales

- **E3 detenido** (409 share-link + cola): paso manual Sergio en Make (limpiar cola, reactivar; decidir manejo del 409 antes del próximo re-render). El PDF de esta tanda se valida por Carbone directo, así que no bloquea.
- Payload E2 hoy 4,7 MB (límite webhook 5 MB): la grilla desde data-URIs reemplaza (no suma) a los assets del fallback → tamaño similar; verificar en OLA 2.
- `thumbnail_url` con data-URI: verificar tipo/capacidad del campo en Bloque 0; recomprimir a ≤95k chars si hace falta (leve pérdida vs gold master, aceptable y documentada).
- Fotos sembradas ≠ romper /lectura: estado terminal (`listo`) sin `no_extraidos` y sin `clave_adjunto` (no dispara RF-09).
- Clerk headless para screenshot: puede no haber navegador; fallback documentado (test 1).

## §8 · Rollback por paso

- Código: git (rama feat; original = punta de main `4959cc2`).
- Siembra: lista de record IDs creados → borrar esas filas (y solo esas) restaura el estado; snapshot completo previo en rollback.md. Los archivos en Dropbox quedan huérfanos inofensivos (no se borran: la conexión es de Make).
- PDF/producción: no se toca (`pdf_final_url` intacto — sin E3).

## §9 · Gates

- **G1 credenciales**: ✅ AIRTABLE/MAKE/CARBONE/CLERK presentes; Dropbox directo roto pero NO requerido (siembra vía Make).
- **G2 flujo y punto del 0**: ✅ (§1, archivo:línea).
- **G3 contrato sin ambigüedad**: ✅ (§4).
- **G4 assets mapeados 1:1**: ✅ (§3 + reporte A4: 36/36 tags, 0 huérfanos).
- **G5 cadena accesible**: ✅ con salvedad — E2 activo y Carbone accesible por API; E3 detenido = paso manual documentado, no bloquea la validación de esta tanda.

**GATE: PASA** (con la salvedad E3 registrada). Sigue Fase 2.
