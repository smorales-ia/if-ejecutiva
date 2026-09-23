# DEPLOY — CRON "UF diaria" (`CRON_UF_Diaria.js`)

> T-AUDIT-CLOSE-20260923 · paso M4. **Artefacto listo, NO desplegado** —
> activación manual de Sergio. Prerequisito operativo del guard H3: mientras
> este cron no corra, toda tasación cuya `fecha_visita` no tenga fila en
> `H_PreciosUF` aborta fail-ruidoso al publicar el AT03 con guards.

## Pasos de creación (UI Airtable · base `app9G7lLkIV3CpeLa`)

1. **Automations → Create automation**. Nombre sugerido: `CRON_UF_Diaria`.
2. **Trigger**: *At a scheduled time* → cada día, **08:00 America/Santiago**.
   (El script asume que la fecha local y la UTC coinciden a esa hora — no
   programarlo entre 21:00 y 00:00 hora chilena.)
3. **Action**: *Run a script* → pegar el contenido íntegro de
   `docs/_artefactos/airtable/CRON_UF_Diaria.js`.
4. **Test run** (botón *Test*): verificar en el log
   `UF-diaria: fin · nuevas=N · fallidas=0` y que `H_PreciosUF` tenga fila de
   hoy con `valor_clp` plausible (~39.900 en sep-2026).
5. **Activar** la automation.

## Backfill inicial (una sola vez, si hace falta)

El cron cubre hoy + 7 días hacia atrás. Si existen solicitudes con
`fecha_visita` anterior sin fila en `H_PreciosUF`, antes de publicar el AT03
con guards: subir `LOOKBACK_DIAS` (línea ~34) al rango necesario (p. ej. 60),
correr **Test** una vez, y devolverlo a 7. Es idempotente: no duplica fechas
ya cargadas.

## Semántica de fallo (decidida en plan §12-Q3, opción recomendada)

Fetch fallido o API sin dato → **no se escribe nada**, se loguea y queda
evento `uf_fetch_fallido <fechas>` en `A_Eventos`. Consecuencia: H3 aborta
las tasaciones de esa fecha hasta que la UF exista. Es el diseño — nunca un
default silencioso. El día siguiente el propio cron repone el hueco
(self-healing con lookback).

## Rollback (plan §9 · M4)

- Desactivar (o borrar) la automation en la UI.
- `H_PreciosUF` es aditiva: borrar a mano las filas de fechas erróneas.

## Contrato verificado contra el motor

- `H_PreciosUF.fecha` (date) — AT03 casa por string `yyyy-mm-dd` exacto
  (`AT03_Calculos_DAG.js:1056-1064`).
- `H_PreciosUF.valor_clp` (number) — debe ser `> 0` para que H3 lo acepte.
- Fuente: `https://mindicador.cl/api/uf/dd-mm-yyyy` (pública, sin key).
  Fila de regresión existente: `recbnHFtlFHQnyEM9` (2026-04-13 · 39894.61).
