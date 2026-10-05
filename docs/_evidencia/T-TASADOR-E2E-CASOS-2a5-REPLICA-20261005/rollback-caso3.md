# ROLLBACK · CASO 3 (ALH -335) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

> Creado ANTES de cualquier escritura. El estado vivo de IDs creados está en
> `rollback-caso3.json` (se actualiza con cada batch). Para revertir TODO lo
> creado por esta tanda: borrar los record IDs listados en el JSON, tabla por
> tabla (DELETE a `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{tabla}/{id}`).

## Alcance de escrituras previsto

| Tabla | TABLE_ID | Acción | Reversión |
|---|---|---|---|
| TX_Solicitudes | tblaHTyMHYfmy7Fg6 | CREATE 1 solicitud nueva (sandbox ALH -335) | DELETE del record creado |
| TX_DatosTasacion | tblMoK3mFuwN8Yr1A | CREATE 1 fila | DELETE |
| TX_ItemsCuadroValoracion | tblCxnMtOETK2ulD0 | CREATE filas de entrada (solo inputs) | DELETE |
| TX_Comparables | tbllbTuhb0waWIbRo | CREATE filas (5 ofertas + 0 CBR — REF.CBR vacía en el oráculo) | DELETE |
| TX_Habitaciones | tblBITpPb8WuqsatM | CREATE filas Hoja 3 | DELETE |
| TX_DocumentosLegales | tbl7qIg5x4Y0tOiLk | CREATE 1 fila | DELETE |
| TX_Adjuntos | tblur71x1oItbmKZc | CREATE 16 fotos (subido_por=Tasador) | DELETE |
| H_PreciosUF | tblWPRuIYfzdlveHM | CREATE fecha 2026-05-07 SOLO si no existe (verificado: NO existe al inicio); si existiera NO se toca | DELETE solo si la creó esta tanda (ver JSON `preciosUf.accion`) |
| TX_Calculos | tblFz37KSvn5pLKDR | NO se siembra — las filas las escribe AT03 al transicionar a `visitada` | DELETE de las filas con `solicitud_codigo` = código de la solicitud sandbox |
| A_Eventos | tblMKmDg2KrO5fMn8 | Escritas por AT01/AT03 (no por esta tanda) | opcional: DELETE de eventos con el código sandbox |

## Guard de idempotencia

Antes de crear, el seed consulta `{numero_solicitud}="ALH -335"` (formato exacto del
Nº interno del oráculo: FICHA SOLIC F8="ALH -" + H8=335 → Portada BH2="ALH -335").
Verificado al inicio de la tanda: **0 solicitudes** con ese número. Si existiera, el
seed aborta sin escribir.

## Prohibido tocar (invariantes)

- M_Clientes (recU6gfHmmCWZN5Mm Austral Leasing Habitacional · recklwpIt0Cv4eqk1
  LEASING AUSTRAL legacy) — NO se modifican.
- Solicitud vieja VP-2026-0005 (recPx0yiK9k4oPG4V, cancelada) — solo lectura.
- Solicitud del Caso 2 (recconVQfAc8LSGJf) y VP-0067 (recmMzeu3eWGxyXsf) — no se tocan.
- Oráculos en docs/_referencias/, escenarios Make, plantilla Carbone, C_Formulas,
  C_ReglasNegocio.

## Procedimiento de reversión (un paso)

```bash
node docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/rollback-caso3.mjs
```

(El script lee rollback-caso3.json y borra todo lo creado, incl. TX_Calculos
escritas por AT03 para el código sandbox, respetando H_PreciosUF preexistente.)

## Estado FINAL (actualizado al cierre · 2026-10-05)

Todo lo creado quedó registrado en `rollback-caso3.json`:

- TX_Solicitudes: **recE1LwwH2xbcCHti** (`VP-2026-0075` · `ALH -335` · estado `calculada`)
- TX_DatosTasacion 1 · TX_ItemsCuadroValoracion 1 · TX_Comparables 5 · TX_Habitaciones 5 ·
  TX_DocumentosLegales 1 · TX_Adjuntos 16 (IDs en el JSON)
- H_PreciosUF 2026-05-07: **CREADO por esta tanda** (`recPimidugG1LeoYr` · 40213.45 / 892.83)
  → sí se borra en rollback (accion='creado').
- TX_Calculos: **17 filas escritas por AT03** con `solicitud_codigo="VP-2026-0075"` — el
  rollback-caso3.mjs las localiza por código y las borra.
- A_Eventos: eventos de AT01/AT03 con COD=VP-2026-0075 (no se borran por defecto; inocuos).
- No se tocó: M_Clientes, M_Comunas, C_ReglasNegocio, VP-2026-0005, Caso 2
  (recconVQfAc8LSGJf), VP-0067, oráculos, escenarios Make, plantilla Carbone, C_Formulas.
