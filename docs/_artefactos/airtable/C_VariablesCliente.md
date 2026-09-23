# C_VariablesCliente — dato maestro EAV (H9)

> Confirmado en vivo el 2026-09-23 (TANDA T-AUDIT-CLOSE). **La tabla YA EXISTE** —
> divergencia con OK-GATE#4/plan A3 que asumían "crear tabla". Scope real: confirmar
> estructura + añadir SOLO la fila del cliente sintético. **No se pobló ningún cliente real.**

- **TABLE_ID**: `tblgrY8j4ugFzS7v9`
- **Forma**: EAV (clave/valor) por cliente, no columnar. El pipeline Carbone/IF-04 lee
  las variables por `cliente` + `clave`. `logo_url` y `nombre_revisor` (H9) son **filas**,
  no columnas.

## Campos

| FIELD_ID | Nombre | Tipo | Notas |
|---|---|---|---|
| `fldAF23Q8UBQy0pSl` | `clave` | singleLineText | clave EAV (p.ej. `logo_url`, `nombre_revisor`) |
| `fldgxSaxWfMVLM6aL` | `valor` | multilineText | valor de la variable |
| `fldajarV6bDNxlgTP` | `tipo` | singleSelect | `texto` · `numero` · `url` · `json` · `booleano` |
| `fldIYwn7YfJXlQGmI` | `activa` | checkbox | |
| `fldokbmHzawVgIgG9` | `cliente` | multipleRecordLinks → `M_Clientes` (`tblpK7AcYBMH93apK`) | inverse `flddgmUBXT5gs4kej` |
| `fldgCSxTNQfcHPclA` | `valor_defecto` | singleLineText | |
| `fldN8tHbsM9phsoE6` | `descripcion` | multilineText | |

## Filas añadidas en esta tanda (SOLO sintético · borrables)

| rec | clave | valor | tipo | cliente |
|---|---|---|---|---|
| `rec5vZU9BYj8ezbhz` | `logo_url` | `https://sandbox.vproperty.local/logos/SANDBOX_T-AUDIT-CLOSE.png` | url | `recLVk6eAbYMmS3xW` (SANDBOX_SinFactores_T-AUDIT-CLOSE) |
| `recIVTUqcMpnoxZvt` | `nombre_revisor` | `Revisor Sintético QA` | texto | `recLVk6eAbYMmS3xW` |

## Handoff H9
El cambio de plantilla de portada (consumir `logo_url` + `nombre_revisor` por cliente)
es **IF-04 / editor Carbone**, fuera de este repo Next.js. Esta tanda solo deja el dato
maestro confirmado + la fila sintética de prueba. S-H9 queda INFERIDO hasta que exista
el consumo en el pipeline PDF.
