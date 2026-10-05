# ROLLBACK · CASO 5 (HEV-3183) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

> Creado ANTES de cualquier escritura. El estado vivo de IDs creados está en
> `rollback-caso5.json` (se actualiza con cada batch). Para revertir TODO lo
> creado por este carril: `node docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/rollback-caso5.mjs`
> (borra los record IDs del JSON tabla por tabla, más las filas TX_Calculos
> que escribió AT03 para el código sandbox).

## Alcance de escrituras previsto

| Tabla | TABLE_ID | Acción | Reversión |
|---|---|---|---|
| TX_Solicitudes | tblaHTyMHYfmy7Fg6 | CREATE 1 solicitud nueva (sandbox HEV-3183) | DELETE del record creado |
| TX_DatosTasacion | tblMoK3mFuwN8Yr1A | CREATE 1 fila (incl. RN-37: avaluo_no_registra + avaluo_total_raw) | DELETE |
| TX_ItemsCuadroValoracion | tblCxnMtOETK2ulD0 | CREATE 3 filas de entrada (Depto, Terraza, Estacionamiento) | DELETE |
| TX_Comparables | tbllbTuhb0waWIbRo | CREATE 6 filas (5 ofertas + 1 CBR) | DELETE |
| TX_HabitacionesPorNivel | tblBITpPb8WuqsatM | CREATE 6 filas Hoja 3 | DELETE |
| TX_DocumentosLegales | tbl7qIg5x4Y0tOiLk | CREATE 1 fila | DELETE |
| TX_Adjuntos | tblur71x1oItbmKZc | CREATE 16 fotos (subido_por=Tasador) | DELETE |
| H_PreciosUF | tblWPRuIYfzdlveHM | fecha 2026-05-12: CREATE SOLO si no existe; si existe NO se toca (el Caso 2 ya la creó con 40290.47/894.25 — mismos valores que HEV) | DELETE solo si la creó ESTE carril (ver JSON `preciosUf.accion`) |
| TX_Calculos | tblFz37KSvn5pLKDR | NO se siembra — las filas las escribe AT03 al transicionar a `visitada` | DELETE de las filas con `solicitud_codigo` = código sandbox |
| A_Eventos | tblMKmDg2KrO5fMn8 | Escritas por AT01/AT03 (no por este carril) | opcional: DELETE de eventos con el código sandbox (inocuos) |

## Guard de idempotencia

`seed-caso5.mjs` aborta (exit 2) si ya existe una solicitud con
`numero_solicitud = "HEV -3183"` — mismo formato del Nº interno del oráculo
(Portada!BH2 = `HEV -3183`, igual convención que `AGH -1548` del Caso 2).

## Prohibido tocar (invariantes)

- M_Clientes — NO se modifica: ni el canónico `recPDwixzybwHlJaQ` (Hipotecaria
  Evoluciona) ni el duplicado legacy `rec8QDoxN3LGvYLcm` (EVOLUCIONA).
- Solicitud vieja VP-2026-0006 (`reci06q1kySVg43KG`) — solo lectura.
- Solicitud del Caso 2 (`recconVQfAc8LSGJf`) y su H_PreciosUF.
- VP-0067 (`recmMzeu3eWGxyXsf`), oráculos en `docs/_referencias/`,
  escenarios Make (E1/E2/E3 incluidos), plantilla Carbone v5, C_Formulas.

## Estado FINAL (actualizado al cierre · 2026-10-05)

Todo lo creado quedó registrado en `rollback-caso5.json`:

- TX_Solicitudes: **recoZcwmgCBVKQMxF** (`VP-2026-0077` · `HEV -3183` · estado
  **`calculada`**, transicionado por AT03, no a mano).
- TX_DatosTasacion 1 (`recQaqsQEtCkizgnb` — con un PATCH posterior de ENTRADA:
  `sup_construida_piso1=47.61`, ver overrides-caso5.md §4) ·
  TX_ItemsCuadroValoracion 3 · TX_Comparables 6 · TX_HabitacionesPorNivel 6 ·
  TX_DocumentosLegales 1 · TX_Adjuntos 16 (IDs en el JSON).
- H_PreciosUF 2026-05-12: **PREEXISTENTE** (`reczzhTrUvmFf9xUM`, la creó el
  Caso 2 con los mismos valores 40290.47/894.25) → este carril NO la tocó y el
  rollback NO la borra (`preciosUf.accion='preexistente'`).
- TX_Calculos: **17 filas escritas por AT03** con `solicitud_codigo="VP-2026-0077"`
  — rollback-caso5.mjs las localiza por código y las borra.
- A_Eventos: `at03_dag_completo` 17/17 OK con COD=VP-2026-0077 (no se borra por
  defecto; inocuo).
- No se tocó: M_Clientes (ni canónico ni duplicado legacy), M_Comunas,
  VP-2026-0006, Caso 2 (recconVQfAc8LSGJf), VP-0067, oráculos, escenarios Make,
  plantilla Carbone, C_Formulas.
