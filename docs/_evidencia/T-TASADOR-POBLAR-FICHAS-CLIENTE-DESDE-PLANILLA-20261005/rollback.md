# Rollback M_Clientes — T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005

**Fecha del respaldo:** 2026-10-05T21:26:12Z (ANTES de cualquier escritura de la tanda · BLOQUE 0, solo GET)
**Base:** `app9G7lLkIV3CpeLa` · **Tabla:** M_Clientes `tblpK7AcYBMH93apK` · **Records:** 92/92

## Qué respalda

`backup-mclientes.json` contiene la respuesta íntegra de la REST API v0 (GET paginado,
sin `fields[]`, es decir **todas las columnas no vacías** de cada record, + `id` +
`createdTime`). Cubre en particular los 4 campos de parámetros que la tanda va a escribir:

| Campo | FIELD_ID | Estado en el respaldo |
|---|---|---|
| `factor_garantia` | `fldbv6nAdOsR9rCQQ` | 77 con valor (todos 0.8) · 15 vacíos |
| `factor_seguro` | `fldjC67OGZOfIRMEc` | 77 con valor (22×1 · 37×0.825 · 18×0.8) · 15 vacíos — **columna de seguro VIVA** |
| `tasa_cap_rate` | `fldT6zd1COvckWgqq` | 77 con valor (68×0.045 · 9×0.06) · 15 vacíos |
| `redondeo_decimales` | `fldoFQQCsBpZ7yS9L` | 1 con valor (=2, recwxQlPhJTXgig93 "MetLife Chile S.A.") · 91 vacíos |

`factor_seguro_incendio` (`fldS1GpxuH5BnCpqg`) está **vacía en los 92 records** →
columna muerta; la tanda NO la escribe y el rollback NO la toca.

## Cómo restaurar

```bash
cd docs/_evidencia/T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005
node rollback-restaurar.mjs            # dry-run: muestra qué haría, no escribe nada
node rollback-restaurar.mjs --apply    # PATCH real: restaura los 4 campos en los 92 records
```

- El script lee `AIRTABLE_TOKEN` de `.env.local` de la raíz del repo (sin `source`).
- Restaura **solo** los 4 campos de parámetros, por FIELD_ID, en batches de 10 con pausa
  anti rate-limit. Los records que estaban vacíos **vuelven a vacío** (envía `null`).
- Es idempotente: re-ejecutarlo tras un fallo parcial es seguro.
- No crea ni borra records; cualquier record creado por la tanda después del snapshot
  queda fuera del alcance de este rollback (borrarlo a mano si hiciera falta).

**Dry-run verificado 2026-10-05** (0 requests de escritura): 92 records, salida esperada.
