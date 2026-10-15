# T-SUPERFICIES-CONSOLIDADAS-20261014 · evidencia, pegado y rollback

> Nota operativa con fecha, no spec. La regla vive en la spec §4.3.4 y en `docs/schema-airtable.md` §28.3.

Pedido de Sergio (14-oct-2026, réplica MET-6283 · VP-2026-0079): «Sup. construida (m²)» y «Sup. primer
piso (m²)» se obtienen solas de todo documento del checklist que las traiga, con idempotencia y el mismo
valor en todo lugar. Diseño aprobado por Sergio el 14-oct-2026: AT03-Ext consolida · precedencia cuadro >
plano > recepción > permiso > antecedentes · la consola lee la fuente única y la unidad no se toca.

## Hallazgos (lectura REST GET · motivo RO-30: MCP Airtable sin autenticar en la sesión)

- Ningún atributo `superficie_construida_m2` / `superficie_primer_piso_m2` tenía destino. El 249.91 de
  `TX_Unidades.sup_m2` en 0079 lo puso **el alta** (`origen_superficie=plano`), no la lectura.
- `cuadro_superficies` (`rec4uCCVtUpAz2Yeb`) tenía 0 filas en `D_TipoDocumentoAtributo`. Igual se leía:
  SC-RF09 módulo 4 busca con `FIND("cuadro_superficies", ARRAYJOIN({tipo_documento}))` y hereda por
  subcadena los 19 atributos de `foto_plano_cuadro_superficies`. AT03-Ext compara exacto → «no declarado».
- Valores leídos en 0079: cuadro 249.91 (primer piso 249.91) · permiso 249.91 · **recepción final 249.31**
  · plano no trae · SII sitio eriazo.

## Cambios aplicados en Airtable (14-oct-2026, REST, `apply-log.txt`)

| Qué | ID |
|---|---|
| Campo nuevo `D_TipoDocumentoAtributo.prioridad_destino` (number, precisión 0) | `fldZQerXw4OlV49gE` |
| Fila nueva `cuadro_superficies__superficie_construida_m2` → sup_construccion_m2 · 10 | `reckCXKExv9eFTtSC` |
| Fila nueva `cuadro_superficies__superficie_primer_piso_m2` → sup_primer_piso_m2 · 10 | `recBNVQScWGDlceTt` |
| `recCVWjNUqzmTR18p` plano · construida → sup_construccion_m2 · 20 | (antes sin destino) |
| `rec6Jnf60VOTu5A1v` plano · primer piso → sup_primer_piso_m2 · 20 | (antes sin destino) |
| `rec0ynQAxHSnHTgxf` recepción final · construida → sup_construccion_m2 · 30 | (antes sin destino) |
| `recMQUmmXhGO8yRLN` permiso · construida → sup_construccion_m2 · 40 | (antes sin destino) |
| `recttREVvVZKHTcfL` antecedentes · construida → sup_construccion_m2 · 50 | (antes sin destino) |

**Ampliación servidumbre (mismo día, aprobada por Sergio):** filas nuevas `reccfpdVuFKoq7TMS`
(`cuadro_superficies__superficie_servidumbre_m2`, 10) y `recRW7cZY3rSvKtLt`
(`plano_cuadro_superficies__superficie_servidumbre_m2`, 20); `recW3GHYmCMx6w0h4` (CBR) → `servidumbre_m2`
· 30 (estado previo en `backup-tda-cbr-servidumbre-pre.json`). Rollback: borrar las dos filas y vaciar
destino/prioridad de la del CBR.

Las 5 filas modificadas se definen en `uso_tabla_destino=TX_DatosTasacion`, `uso_campo_destino`,
`uso_cardinalidad_destino=una_por_solicitud` y `prioridad_destino`. Estado previo en `backup-tda-pre.json`.

## Paso manual pendiente: pegar AT03-Ext v5

El nodo `customScript` no se puede escribir por API. En Airtable → Automations → la automation de
AT03-Ext (trigger «When record updated» · TX_Adjuntos · `atributos_obtenidos`) → acción «Run a script»:
reemplazar todo el código por `docs/_artefactos/airtable/AT03-Ext_script.js` (v5) y guardar. La
configuración de entrada (`adjuntoId`) no cambia.

⚠ Mientras siga pegada la v4, una lectura de cuadro/plano/recepción/permiso/antecedentes escribe la
superficie con «el primero que llega gana» (sólo si está vacía). La v5 lo corrige en la siguiente lectura
porque ese valor queda con `origen_dato=extraido_rf09`.

## Rollback

1. Script: volver a pegar la v4 (`git show HEAD:docs/_artefactos/airtable/AT03-Ext_script.js`).
2. Filas: en las 5 filas de la tabla de arriba, vaciar `uso_tabla_destino`, `uso_campo_destino`,
   `uso_cardinalidad_destino` y `prioridad_destino` (estado de `backup-tda-pre.json`).
3. Borrar las filas `reckCXKExv9eFTtSC` y `recBNVQScWGDlceTt`.
4. Borrar el campo `prioridad_destino` desde la UI (la API no borra campos). Con la v4 pegada, el campo
   es inocuo: la v4 no lo lee.
5. Si la v5 ya escribió `sup_construccion_m2` / `sup_primer_piso_m2` en alguna fila con
   `origen_dato=extraido_rf09`, decidir si se conserva (es el valor de los documentos) o se vacía.
