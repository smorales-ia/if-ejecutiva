# Genericidad del pipeline PDF — T-CIERRE-FINAL-20260929 · Agente B

> Auditoría 29-sep-2026. Pregunta: ¿puede otra solicitud (≠ VP-2026-0067) salir con
> fotos o datos de MET-6283? Piezas auditadas: plantilla v2, generador .py, overrides,
> assets, ensamblador (`lib/informe/**`), rutas `informe-data`/`generar-pdf`,
> blueprints E2/E3, harness de la tanda previa.

## Veredicto: **GENÉRICO CON GATES**

Nada de MET-6283 puede filtrarse a otra solicitud: todo el material del espejo está
gateado por `codigo === "VP-2026-0067"` en dos puntos únicos y verificados
(`lib/informe/overrides.ts` y `lib/informe/imagenes.ts`). La plantilla `.docx` no
contiene ni un dato ni una imagen de la propiedad. **No se aplicó ninguna edición**
(los gates ya existían); por eso no hay `rollback-B.md`.

## Cadena productiva verificada

`POST /api/tasaciones/[id]/generar-pdf` → `lecturaInformeContexto()` (ensamblador,
in-process) → webhook E2 (`MAKE_WEBHOOK_E2`) con `{solicitud_id, solicitud_codigo,
contexto}` → Carbone render (templateId fijo = la plantilla v2) → E3 descarga →
Dropbox `/VProperty/Tasaciones/{{nombre_cliente}}_{{numero_solicitud}}.pdf` →
PATCH `TX_Solicitudes` + insert `TX_DocumentosGenerados`. Todo el dato variable
viaja en el payload por solicitud.

## Tabla por ranura

| Ranura | Fuente del dato | ¿Genérico? | Hallazgo | Acción |
|---|---|---|---|---|
| **Portada** (propietario, RUT, dirección, valores, fecha) | Payload por solicitud (`{d.partes.*}`, `{d.propiedad.*}`, `{d.valores.*}`) — ensamblador desde Airtable | **Sí** | La plantilla solo trae tags; los únicos textos fijos con números son la dirección/fono de la oficina VProperty y los nombres de leyes (6071/9135/19537) — corporativos, legítimos | Ninguna |
| **Logo VProperty** | Embebido en `.docx` (`word/media/image1.png`, md5 = `_logo_extraido.png`) | **Sí** (fijo legítimo) | OK — es lo declarado como fijo | Ninguna |
| **Firma del tasador** | Payload: `{d.imagenes.firma}` (NO embebida). Para VP-0067 sale de `assets_met6283/firma.jpg` vía gate; para otras, `null` (ranura vacía) | **Sí, con gate** | Mejor que embebida: nunca se imprime la firma de M.E. Soto en otra solicitud. Falta mecanismo vivo (columna firma en `M_Tasadores`) | Pendiente flujo vivo (ver abajo) |
| **Fotos propiedad** (fachada H1, grillas H4/H5 2×4) | `resolverImagenes(codigo, fotosCanonicas)` en `lib/informe/imagenes.ts`: adjuntos con URL `http(s)` primero; fallback assets **solo si** `ASSETS_POR_CODIGO[codigo]` existe (única entrada: `VP-2026-0067`) | **Sí, con gate** | Otra solicitud recibe `null`/solo sus adjuntos públicos — «ranura vacía honesta, nunca la foto de otra propiedad» (comentario y código coinciden) | Ninguna |
| **Mapas/planos** (ubicación H1, referencias H2, plano/emplazamiento/aérea/SII Anexo 1) | Mismo resolutor gateado (`ARCHIVO_POR_RANURA` → data-URI solo con gate activo) | **Sí, con gate** | Ídem | Ninguna |
| **Anexos/certificados** (rol avalúo, permiso, escritura, no-expropiación, recepción, TGR) | Mismo resolutor gateado + `anexos.documentos` desde `TX_Adjuntos` de la solicitud | **Sí, con gate** | Ídem | Ninguna |
| **Comparables** | Payload: `{d.comparablesInforme.ofertas.filas[i].*}` — motor/ensamblador por solicitud | **Sí** | Sin hardcodes; promedios calculados en `lib/informe` (CI-057) | Ninguna |
| **Datos numéricos** (UF, superficies, valores, rentabilidad) | Payload por solicitud (TX_Calculos/H_PreciosUF/RF-09) | **Sí** | `tiempoRentaAnios: 65` está en el override pero solo aplica bajo gate | Ninguna |
| **Textos** (síntesis, sector, expropiación) | `textosIA.*` del payload; `textoExpropiacion` sin columna → `null` en ensamblador, texto de Colina solo vía override gateado | **Sí, con gate** | El texto «…Municipalidad de Colina…» vive únicamente en `overrides_met6283.json` | Ninguna |
| **Cualitativa Hoja 3** (normativa/sector/constructivas/comodidades…) | `overrides_met6283.json` bajo gate; sin columnas Airtable aún | **Sí, con gate** | Otra solicitud imprime ranuras vacías, no los datos de MET-6283 | Pendiente flujo vivo |

## Detalle por pieza auditada

1. **`overrides_met6283.json`** — lo consume exclusivamente
   `lib/informe/overrides.ts::aplicarOverridesLocales()`, llamado como último paso de
   `lecturaInformeContexto` (`ensamblador.ts:665`). El merge solo se aplica si
   `json.codigo === contexto.meta.codigo` (`overrides.ts:70`); el archivo declara
   `"codigo": "VP-2026-0067"`. Sin archivo o JSON roto → ensambla sin overrides
   (fail-safe, nunca 500). Candado de regresión en `lib/informe/overrides.test.ts`.
2. **`assets_met6283/`** — las imágenes **no** están embebidas en la plantilla:
   viajan como data-URI en el payload, y solo cuando `ASSETS_POR_CODIGO[codigo]`
   resuelve (única clave: `VP-2026-0067`, `imagenes.ts:33-35`). Inspección del zip
   `PLANTILLA_MET_v2.docx`: únicos binarios `word/media/image1.png` (29 KB, md5
   `6b0ebae4…` = `_logo_extraido.png`, logo) y `word/media/image2.png` (255 B, md5
   `b681166a…` = `_placeholder_gris.png`, ancla de Carbone para sustitución). Cero
   fotos/mapas/anexos de la propiedad dentro del `.docx`.
3. **`generar_plantilla_met_v2.py`** (solo lectura) — sin rutas a `assets_met6283`,
   sin textos de la propiedad (Eucaliptus/Colina/VERGARA/RUTs/6283 solo aparecen en
   comentarios de cabecera y en el comentario del excluido `{d.meta.codigo}`,
   líneas 4 y 50-52). 492 tags `{d.*}` en el `document.xml` generado; textos fijos =
   boilerplate corporativo. **Sin hallazgo crítico — no requiere cambios.**
4. **Código de la app** — `generar-pdf/route.ts` e `informe-data/route.ts` sin
   hardcodes (las apariciones de VP-2026-0067/MET-6283 en `lib/` y `app/` fuera de
   los dos gates son tests y fixtures: `*.test.ts`, `golden-met6283.ts` — este
   último solo lo importa `ensamblador.test.ts`, nunca código productivo).
5. **Blueprints E2 (5750023) y E3 (5791413)** — totalmente dinámicos:
   `{{1.contexto}}`, `{{1.solicitud_id}}`, `{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf`.
   Único valor fijo: el templateId Carbone `517ddc62…c14434d` en la URL de render de
   E2 = la plantilla v2 subida — fijo legítimo por tipo de informe, no por propiedad.
6. **Harness de la tanda previa** (`docs/_evidencia/T-PDF-IDENTICO-20260927/
   build-payload-prueba-v2.py`, `contexto-real-v2.json`) — **solo harness de prueba**:
   viven en `docs/_evidencia/`, no los referencia ningún módulo de `app/`, `lib/` ni
   `package.json`. No forman parte del camino productivo.

## Correcciones

- **Aplicadas:** ninguna necesaria — los gates ya estaban implementados y probados.
- **Pendientes (flujo vivo, NO son ataduras — para ORQUESTADOR / tanda posterior):**
  1. Para toda solicitud ≠ VP-2026-0067 las ranuras de imagen salen vacías salvo
     adjuntos con URL `http(s)` pública (`url_dropbox` es path interno y la conexión
     Dropbox de `.env.local` está vencida): falta el mecanismo de captura/URL pública
     para fotos, mapas, escaneados de anexos y firma (columna en `M_Tasadores`).
  2. Cada clave de `overrides_met6283.json` es una columna Airtable pendiente
     (cualitativa Hoja 3, terminaciones por recinto, `textoExpropiacion`,
     `fechaVisado`, `tiempoRentaAnios`, nombre impreso del tasador) — ya declarado
     en el propio JSON y en `overrides.ts`.
  3. Menor (`imagenes.ts:158`): en la grilla del espejo, dos categorías repetidas
     («Dormitorio») matchean el mismo primer adjunto si conviven adjuntos públicos
     con el fallback — solo afecta al caso espejo, sin impacto de genericidad.
- **PARA AGENTE A:** nada — `generar_plantilla_met_v2.py` está limpio.
