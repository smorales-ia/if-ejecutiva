# Constancia del auditor — tanda sin escrituras

**Tanda:** T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · 2026-10-05

## El auditor ciego NO aplica

La tanda quedó **detenida en Gate**: la fuente autorizada
(`docs/_referencias/NUEVA_VERSION_PLANILLA MARZO 2026.xlsm`) resultó no contener parámetros
por cliente (evidencia: `descubrimiento-planilla.md` §1 — barrido de rótulos en 33 hojas,
celdas numéricas de Variables, 25 nombres definidos y strings del VBA, todos sin factores).
**No hubo escrituras en `M_Clientes` que verificar**; la verificación de esta tanda es el
propio Gate.

## Verificación de que nada se escribió (solo lectura)

Spot-check del 2026-10-05: GET de 3 records de muestra contra
`https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblpK7AcYBMH93apK/{recordId}` (token server-side
de `.env.local`, no expuesto) comparado campo a campo contra `backup-mclientes.json`
(snapshot previo, 92 records):

| record_id | nombre | fg · fs · cap · rd (API en vivo) | ¿= backup? |
|---|---|---|---|
| recIg8NtVhptXkEUJ | MetLife | 0.8 · 1 · 0.045 · — | ✅ idéntico |
| recX80z73mCtC4BBo | Agencia Habitacional | 0.8 · 0.8 · 0.06 · — | ✅ idéntico |
| recwxQlPhJTXgig93 | MetLife Chile S.A. | 0.8 · 0.825 · 0.045 · 2 | ✅ idéntico |

**3/3 idénticos → M_Clientes está tal como lo dejó el snapshot: cero escrituras de esta
tanda.** `rollback-restaurar.mjs` queda sin uso (no hay nada que revertir).

## Qué sigue

La decisión es de Sergio y Héctor con los tres entregables de esta consolidación:
`mapeo.md` (43 clientes, actual vs propuesto, todos OMITIDO), `LISTA_FALTANTES.md`
(preguntas concretas a Héctor) y `LISTA_DUPLICADOS.md` (depuración propuesta, no ejecutada).
Si se autoriza el template `Formato-Informe-VProperty-Enero2026.xlsm` como fuente, la tanda
de escritura se re-lanza con `extraccion-planilla.json` como insumo y nuevo backup previo.
