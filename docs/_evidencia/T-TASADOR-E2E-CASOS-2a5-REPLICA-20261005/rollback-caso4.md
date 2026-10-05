# ROLLBACK · CASO 4 (HIPOTECARIA SECURITY -6073) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

> Creado ANTES de cualquier escritura. El estado vivo de IDs creados está en
> `rollback-caso4.json` (se actualiza con cada batch). Para revertir TODO lo
> creado por esta tanda: borrar los record IDs listados en el JSON, tabla por
> tabla (DELETE a `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{tabla}/{id}`).

## Alcance de escrituras previsto

| Tabla | TABLE_ID | Acción | Reversión |
|---|---|---|---|
| TX_Solicitudes | tblaHTyMHYfmy7Fg6 | CREATE 1 solicitud nueva (sandbox HIPOTECARIA SECURITY -6073) | DELETE del record creado |
| TX_DatosTasacion | tblMoK3mFuwN8Yr1A | CREATE 1 fila | DELETE |
| TX_ItemsCuadroValoracion | tblCxnMtOETK2ulD0 | CREATE 2 filas de entrada (Depto + Terraza, solo inputs) | DELETE |
| TX_Comparables | tbllbTuhb0waWIbRo | CREATE 6 filas (5 ofertas + 1 CBR) | DELETE |
| TX_Habitaciones | tblBITpPb8WuqsatM | CREATE 6 filas Hoja 3 | DELETE |
| TX_DocumentosLegales | tbl7qIg5x4Y0tOiLk | CREATE 1 fila | DELETE |
| TX_Adjuntos | tblur71x1oItbmKZc | CREATE 16 fotos (subido_por=Tasador) | DELETE |
| H_PreciosUF | tblWPRuIYfzdlveHM | CREATE fecha 2026-03-13 SOLO si no existe (verificado 2026-10-05: NO existe); si existiera con otros valores NO se toca | DELETE solo si la creó esta tanda (ver JSON `preciosUf.accion`) |
| TX_Calculos | tblFz37KSvn5pLKDR | NO se siembra — las filas las escribe AT03 al transicionar a `visitada` | DELETE de las filas con `solicitud_codigo` = código de la solicitud sandbox |
| A_Eventos | tblMKmDg2KrO5fMn8 | Escritas por AT01/AT03 (no por esta tanda) | opcional: DELETE de eventos con el código sandbox |

## Guard de idempotencia

Antes de crear, el seed consulta `{numero_solicitud}="HIPOTECARIA SECURITY -6073"`
y aborta si ya existe (verificado 2026-10-05 antes del seed: 0 coincidencias con
"SECURITY" en `numero_solicitud` de TX_Solicitudes).

## Prohibido tocar (invariantes)

- M_Clientes (recVTKsZLNSDNInky Hipotecaria Security S.A. y sus duplicados
  recXVtuMT2wjIVzz2 / recSi2XsxHtByImuI) — NO se modifica ninguno.
- Solicitud vieja cancelada VP-2026-0007 (reclC1CE5VHLTisKD) — solo lectura.
- Solicitud del Caso 2 (recconVQfAc8LSGJf) y VP-0067 (recmMzeu3eWGxyXsf) — no se tocan.
- Oráculos en docs/_referencias/, escenarios Make, plantilla Carbone, C_Formulas.

## Procedimiento de reversión (un paso)

```bash
node docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/rollback-caso4.mjs
```

(El script lee rollback-caso4.json y borra todo lo creado, incl. TX_Calculos
escritas por AT03 para el código sandbox, respetando H_PreciosUF preexistente.)

## Estado FINAL (actualizado al cierre · 2026-10-05)

Todo lo creado quedó registrado en `rollback-caso4.json`:

- TX_Solicitudes: **rectnGOaHvEioXZw3** (`VP-2026-0076` · `HIPOTECARIA SECURITY -6073`
  · estado `calculada`)
- TX_DatosTasacion 1 (recBudYOKVXICjewg) · TX_ItemsCuadroValoracion 2 ·
  TX_Comparables 6 · TX_Habitaciones 6 · TX_DocumentosLegales 1 · TX_Adjuntos 16
  (IDs en el JSON)
- H_PreciosUF 2026-03-13: **CREADO por esta tanda** (`rec7I9BGQMsNzsRBe` ·
  39841.72 / 909.94) → sí se borra en rollback (accion='creado').
- TX_Calculos: **17 filas escritas por AT03** con `solicitud_codigo="VP-2026-0076"`
  — el rollback-caso4.mjs las localiza por código y las borra.
- A_Eventos: eventos de AT01/AT03 con COD=VP-2026-0076 (no se borran por defecto;
  inocuos).
- No se tocó: M_Clientes (ninguno de los 3 records Security), M_Comunas,
  VP-2026-0007, VP-0067, la solicitud del Caso 2 (recconVQfAc8LSGJf), oráculos,
  escenarios Make, plantilla Carbone, C_Formulas.
