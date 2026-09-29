# Rollback A — OLA 1 · Agente A (Datos) · D6

Tanda: T-VP0067-CONSISTENTE-PROD-20260929 · FASE 2
Tabla: `TX_DatosTasacion` (`tblMoK3mFuwN8Yr1A`) · Record: `recy8q3Tq9omjdNUf` (VP-2026-0067)
Fecha ejecución: 2026-09-29

## Registro de ejecución

| Campo | FIELD_ID | Antes | Después | Respuesta HTTP |
|---|---|---|---|---|
| `permiso_edif_num` | `fldOlvStur9oNVO3V` | (vacío) | `N°319  09/09/2020` (doble espacio, byte a byte igual a `permiso_edificacion_numero` de TX_DocumentosLegales `rec7t4cD2zjuJKpXq`) | 200 |
| `recepcion_final` | `fldqr8ErlVZLJH5NS` | (vacío) | `N°210  18/07/2024` (ídem, espejo de `recepcion_final_numero`) | 200 |
| `ingreso_liquido_anual` | `fldRXnym7cmurpEyL` | 0 | **0 — NO ESCRITO · BLOQUEADO** (ver abajo) | — (no se emitió PATCH sobre este campo) |

PATCH único consolidado (los 2 campos escribibles en una sola llamada), sin `typecast`.
Verificación GET post-patch: los dos literales quedaron exactos (doble espacio intacto);
`ingreso_liquido_anual` sigue en 0.

## BLOQUEO — `ingreso_liquido_anual`

- El mandato lo describía como `number: 36300000`, pero en el schema real es **formula**
  (read-only): `{arriendo_mensual} * 12 - {gasto_anual}`
  (`fldZYdbx65RphuCWk` number · `fldl7MLJVn74uRfQh` number, ambos hoy vacíos → 0).
- Única vía para que muestre 36.300.000: escribir los campos fuente. Valores del oráculo
  (PLAN_PRUEBA_PROD_MET6283_v3.md §siembra sandbox, verificados vía renta perpetua
  806.666.667): `arriendo_mensual = 3300000` y `gasto_anual = 3300000`
  → 3.300.000 × 12 − 3.300.000 = **36.300.000**.
- El intento de PATCH con esos dos campos fuente fue **denegado por el clasificador de
  permisos**: exceden los 3 campos nombrados en la autorización de la tanda. Queda
  pendiente de autorización explícita de Sergio/coordinador.

### Comando de rollback (para Gate S1)

```
PATCH https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblMoK3mFuwN8Yr1A/recy8q3Tq9omjdNUf
{"fields": {"permiso_edif_num": null, "recepcion_final": null}}
```

(Si llegara a autorizarse y aplicarse la escritura de los campos fuente, el rollback debe
agregar `"arriendo_mensual": null, "gasto_anual": null`.)

Invariantes respetadas: no se tocó ningún otro record ni tabla; la asignación de tasador
(`recTJcV3BIvdcG4em`) quedó intacta.
