# AUDITORÍA — Inputs del motor DAG v11.1.1 vs. RF-09 y UI del tasador (MET-6283)

> Fecha: 2026-09-22 · Solo lectura · sandbox VP-2026-0067 (`recmMzeu3eWGxyXsf`) vs. referencia VP-2026-0066 (`recNiwM4s1ibr3sbO`).
> Producida por 3 agentes de auditoría (motor / fuentes / UI). Sin writes en Airtable, Make, código ni sandbox.
> Evidencia motor: `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (líneas citadas abajo) + `C_Formulas` (`tblNFa454fBbqRB3t`) + `TX_Calculos` (`tblFz37KSvn5pLKDR`, 13 filas 0066).
> Evidencia fuentes: blueprint `docs/_artefactos/make/SC-RF09-ExtraccionClaude*.json` + `D_TipoDocumentoAtributo` + registros reales 0066/0067.
> Evidencia UI: `components/tasador/**` + `app/api/tasaciones/[id]/datos/route.ts` + `lib/tasador/**`.

---

## § 1 — Resumen ejecutivo

La regla `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`) ejecuta 13 fórmulas terminales. Con `hay_cuadro>0`
(como en 0066), el `valor_comercial_uf` y todos sus derivados salen del **cuadro de valoración**
(`TX_ItemsCuadroValoracion`), no del fallback por superficie. Por eso los 16 gaps son reales: sin ellos
el motor calcula con `hay_cuadro=0` y produce otro número (o 0).

Clasificación de los **16 gaps** por disponibilidad de UI del tasador:

| Categoría | Nº | Detalle |
|---|---|---|
| **GAP-B con UI plena del tasador** | 8 | estado_conservacion, material_predominante, anio_construccion, sup_construccion_m2, sup_terreno_m2, arriendo_bruto_mensual_clp, gasto_anual_clp, velocidad_venta_estimada |
| **GAP-B sin UI (hueco / sistema)** | 2 | `tasa_cap_rate` (base, sin input; cubierto por default de cliente 0.045) · `uf_dia_visita` (debe venir de sistema "UF diaria", no del tasador) |
| **GAP-A cuadro — UI parcial** | 6 ítems | La grilla de ítems existe (sección C) y captura sup_m2/descripción/subtipo, **pero `uf_m2_unitario` y `factor` NO tienen input** → los dos campos económicos del cuadro son HUECO_UI |

Conteo por fuente real (cruce de los 3 agentes):

- Inputs que **vienen de RF-09** (docs): comparables completos (TX_Comparables), campos SII de TX_DatosTasacion (avaluo_total, destino_sii, ubicacion_urbano_rural, rol_sii, cod_sii_*), y TX_DocumentosLegales (permiso/recepción). **Ninguno de los 16 gaps viene de RF-09.**
- Inputs del **tasador con UI**: 8 (GAP-B) + parte del cuadro (sup_m2/descr/subtipo).
- Inputs **sin UI (HUECO_UI de producto)**: 4 → `uf_m2_unitario` (cuadro), `factor` (cuadro), `tasa_cap_rate` base, `uf_dia_visita`.
- Inputs de **sistema**: `uf_dia_visita` (UF diaria) y defaults de `M_Clientes` / `M_Comunas` / `C_*`.

**Veredicto:** de los 16 gaps, **ninguno es poblable por RF-09**. 8 tienen UI de tasador; el cuadro (6 ítems)
tiene UI sólo parcial (faltan los 2 campos que el motor necesita); y hay 2 huecos adicionales (tasa_cap_rate
base, uf_dia_visita). Ver § 4 para los huecos de producto.

---

## § 2 — Tabla completa (16 gaps)

Fuente: (a) RF-09 · (b) tasador-UI · (c) sistema · (d) xlsm sin UI · (e) desconocido.

| # | Input | Tabla origen | Fuente real | UI Sección | Componente / label | HUECO_UI | Cómo llegó en 0066 |
|---|---|---|---|---|---|---|---|
| B-1 | estado_conservacion | TX_DatosTasacion | (b) tasador | B · Datos propiedad | `seccion-propiedad.tsx:71` "Estado conservación" | no | `origen_dato="tipeado"` (visita no ocurrió en sandbox) |
| B-2 | material_predominante | TX_DatosTasacion | (b) tasador | B | `seccion-propiedad.tsx:85` "Material predominante" | no | tipeado. (RF-09 extrae `tipo_material` pero lo escribe a TX_Unidades, no a DatosTasacion) |
| B-3 | anio_construccion | TX_DatosTasacion | (b) tasador | B | `seccion-propiedad.tsx:64` "Año construcción" | no | tipeado. (RF-09 lo escribe a TX_Unidades) |
| B-4 | sup_construccion_m2 | TX_DatosTasacion | (b) tasador | B | `seccion-propiedad.tsx:48` "Sup. construida (m²)" | no | tipeado |
| B-5 | sup_terreno_m2 | TX_DatosTasacion | (b) tasador | B | `seccion-propiedad.tsx:43` "Sup. terreno (m²)" | no | tipeado. (RF-09 lo escribe a TX_Unidades) |
| B-6 | arriendo_bruto_mensual_clp | TX_DatosTasacion | (b) tasador | H · Rentabilidad | `tasacion-form.tsx:514` "Arriendo bruto mensual (CLP)" | no | tipeado |
| B-7 | gasto_anual_clp | TX_DatosTasacion | (b) tasador | H | `tasacion-form.tsx:520` "Gasto anual (CLP)" | no | tipeado |
| B-8 | tasa_cap_rate (base) | TX_DatosTasacion | (b/c) | — (sólo `tasa_cap_rate_override` en G) | HUECO en campo base | **sí** | tipeado; el motor igual lo cubre con default de cliente 0.045 (`tasa_cap_rate_efectivo`) |
| B-9 | uf_dia_visita | TX_DatosTasacion | (c) sistema | — | HUECO; se espera escenario "UF diaria" | **sí** | valor 39894.61 (UF del 17-sep, fecha 0066); sin escritor confirmado, probable carga directa |
| B-10 | velocidad_venta_estimada | TX_DatosTasacion | (b) tasador | B | `seccion-propiedad.tsx:218` "Velocidad de venta estimada" (select) | no | tipeado |
| A-1 | Ítem "Piso 1" (Edificacion 249.91 m²; **uf/m² 34; factor 0.96**) | TX_ItemsCuadroValoracion | (d) xlsm | C · Cuadro valoración | grilla `seccion-valoracion.tsx:185` (sup_m2/descr/subtipo sí; **uf_m2_unitario/factor NO**) | **parcial** | carga manual/xlsm (tabla sin `origen_dato`; sin mapeo en D_TipoDocumentoAtributo) |
| A-2 | Ítem "Terreno" (1402.35 m²; uf/m² 8) | TX_ItemsCuadroValoracion | (d) xlsm | C | ídem A-1 | **parcial** | ídem |
| A-3 | Ítem "Servidumbre" (Terreno 3622.51 m²; uf/m² 0) | TX_ItemsCuadroValoracion | (d) xlsm | C | ídem | **parcial** | ídem |
| A-4 | Ítem "Piscina" (1×350 UF) | TX_ItemsCuadroValoracion | (d) xlsm | C | ídem | **parcial** | ídem |
| A-5 | Ítem "Quincho, terrazas, bodega" (OO.CC. 1×250) | TX_ItemsCuadroValoracion | (d) xlsm | C | ídem | **parcial** | ídem |
| A-6 | Ítem "Cierros, pavimento exterior" (OO.CC. 1×150) | TX_ItemsCuadroValoracion | (d) xlsm | C | ídem | **parcial** | ídem |

Nota clave del motor: `TX_ItemsCuadroValoracion.valor_total_uf` (`fld1F3u5J5NlnJUjY`) y `valor_seguro_base`
(`fldxzIzT0kakMUbss`) son **fórmulas de Airtable** que dependen de `sup_m2 * uf_m2_unitario * factor`. Sin
`uf_m2_unitario`/`factor`, esos totales dan 0 y el motor recibe cuadro vacío aunque existan filas.

---

## § 3 — GAPS reales para 0067 y cómo cubrirlos

1. **GAP-B con UI (8 campos):** en una tasación real los llena el tasador (secciones B y H). En el
   sandbox 0067 no hubo visita → **mirror desde 0066** reproduce exactamente B-0b. Válido.
2. **GAP-B-8 `tasa_cap_rate`:** el motor usa `tasa_cap_rate_efectivo = max(override, datos, cliente)`.
   El cliente MetLife aporta default 0.045 = mismo valor de 0066. **Mirror opcional** (o dejar que
   el default de cliente lo cubra). No bloquea.
3. **GAP-B-9 `uf_dia_visita`:** default del motor = 38 500 si falta. 0066 usó 39894.61 (UF del día).
   Como los 4 outputs CLP escalan por este factor, para replicar 0066 hay que **mirror el 39894.61**.
   En producción debe venir del escenario "UF diaria".
4. **GAP-A (6 ítems del cuadro):** **no hay otra vía que mirror o carga manual en Airtable** — los
   campos `uf_m2_unitario` y `factor` no tienen UI y RF-09 no los puebla. **Mirror desde 0066** es la
   única forma viable hoy de reproducir el cálculo de B-0b.

---

## § 4 — HUECOS DE PRODUCTO (issues para tanda futura)

Inputs que el motor necesita y que **ningún flujo del sistema puede capturar hoy** (no RF-09, no UI):

| Hueco | Campo | Tabla | Impacto | Propuesta |
|---|---|---|---|---|
| **HP-1** | `uf_m2_unitario` (por ítem) | TX_ItemsCuadroValoracion | Sin él, `valor_total_uf`=0 → el cuadro no valora. Bloquea el método por cuadro (el principal). | Añadir input UF/m² por ítem en la grilla sección C (`seccion-valoracion.tsx`) + escribirlo en el PATCH `route.ts`. |
| **HP-2** | `factor` (por ítem) | TX_ItemsCuadroValoracion | Corrige el valor del ítem; sin él no hay homogeneización. | Añadir input factor por ítem en sección C + PATCH. |
| **HP-3** | `tasa_cap_rate` (base) | TX_DatosTasacion | Menor: el default de cliente (0.045) lo cubre; sólo falta si el tasador quiere fijar uno distinto sin usar el override de sección G. | Evaluar si basta con `tasa_cap_rate_override` (G) o si se necesita el campo base en UI. |
| **HP-4** | `uf_dia_visita` | TX_DatosTasacion / TX_Solicitudes | Todos los outputs CLP dependen de él; sin escritor confirmado quedó vacío en 0067. | Confirmar/activar el escenario "UF diaria" que lo escriba automáticamente al programar/ejecutar la visita. |

Hallazgos adicionales (no gaps, pero relevantes):

- **HP-5 (documentación):** `AT03-Ext` — la automatización que enruta `TX_Adjuntos.atributos_obtenidos`
  hacia TX_DatosTasacion/Comparables/Unidades/DocumentosLegales — **corre en producción pero no tiene
  blueprint en `docs/_artefactos/make/`**. El blueprint SC-RF09 sólo escribe a TX_Adjuntos y loguea
  "Enrutamiento por cardinalidad delegado a AT03-Ext". Deuda de artefacto.
- **TX_Unidades vacío en 0067** pese a que `foto_fuente_sii` mapea 4 atributos unit-level a esa tabla
  (`tipo_material`, `anio_construccion`, `sup_terreno_m2`, `sup_m2`). AT03-Ext no creó la unidad. No
  bloquea las 13 fórmulas de REGLA_REFI_CASA_V32 (ninguna referencia TX_Unidades directamente), pero
  es una discrepancia a revisar.

---

## § 5 — Recomendación consolidada

**Mirror-desde-0066 SIGUE SIENDO VÁLIDO** para desbloquear el cálculo del sandbox VP-2026-0067 y
reproducir el 13/13 ±1% de B-0b, porque:

- Los 8 campos GAP-B con UI: mirror = lo que habría tecleado el tasador. Fiel.
- El cuadro (GAP-A): mirror es la **única** vía (no hay UI para uf_m2_unitario/factor); replica exacta.
- `uf_dia_visita`: mirror del 39894.61 necesario para reproducir los outputs CLP de 0066.

**Salvedad — no confundir sandbox con producto:** el mirror resuelve *este* sandbox, pero **HP-1 y HP-2
son huecos de producto reales**: en una tasación real y no-MetLife, el tasador NO puede ingresar los
precios unitarios ni los factores del cuadro por la UI actual. Hasta cerrar HP-1/HP-2, cualquier
tasación cuyo método sea "por cuadro" depende de carga manual en Airtable. HP-4 (uf_dia_visita) debe
resolverse con el escenario de UF diaria antes de operar en producción.

**Decisión que corresponde a Sergio:**
- (i) **Mirror completo desde 0066** de los 6 ítems del cuadro + los 10 campos DatosTasacion (recomendado para cerrar el sandbox).
- (ii) Sembrado manual por Sergio.
- (iii) Omitir gaps y disparar /calcular con lo que hay (resultado esperado: `hay_cuadro=0` → método por superficie con defaults → NO reproduce B-0b).

Recomendación: **(i)**, dejando abiertos HP-1..HP-4 como issues de tanda futura.
