# Aprendizajes — P12-TAS (deploy verification IF-03)

> Archivo de sesión · timestamp real del sistema 2026-09-01 16:58 -0400.

### 2026-09-01 — Diagnóstico RF-09 / `clave_adjunto` en fotos de comparables
**Contexto:** P12-TAS, deploy verification en Railway. Sergio subió una foto real al cuadro "Ofertas/Comparables" de VP-2026-0060 y «D. Comparables» siguió en 0/3.
**Inconveniente:** el adjunto se creó en `TX_Adjuntos` (rec8WypPYugEYaicK) y el binario llegó a Dropbox, pero no se generó ninguna fila en `TX_Comparables` ni corrió la extracción.
**Causa raíz:** la categorización del organizador de fotos (`app/api/tasaciones/[id]/fotos/route.ts:233-234`) escribe sólo `tipo_adjunto='foto_interior'` y `descripcion=<categoria>`; **nunca escribe `clave_adjunto`** (el `codigo` de `D_TipoDocumento` que `AT-RF09-Trigger` lee para rutear a RF-09). Sin `clave_adjunto`, el trigger cae en la rama "skipped sin tipo" (`AT-RF09-Trigger_script.js:226-233`), marca `estado_extraccion=skipped` y no dispara el webhook. Sin extracción no corre AT03-Ext → sin comparables.
**Solución aplicada:** registrada como **CI-071** en `docs/CODE_INCONSISTENCIES.md` (ABIERTA, diferida a post-P12-TAS). Evidencia cerrada por MCP: adjunto con `clave_adjunto` vacío + `estado_extraccion=skipped`, sin fila RF-09 en `LogEscenarios`, 0 filas en `TX_Comparables` con `VP-2026-0060|COMP-xx`.
**Prevención futura:** ante "el adjunto llegó pero no se procesó", verificar primero `clave_adjunto` del registro, no sólo el webhook. **Arreglar CI-002 (webhook RF-09) no basta**: si el payload aguas arriba no lleva el tipo/`clave_adjunto`, el trigger hace skip antes de llegar al webhook. El fix real es que la categorización de fotos escriba un `clave_adjunto` que mapee a un `D_TipoDocumento` de comparables.

### 2026-09-01 — Re-baseline de smokes con premisas obsoletas (smoke #3)
**Contexto:** misma tanda P12-TAS, al preparar la URL del smoke #3 ("Coordinar visita").
**Inconveniente:** el smoke #3 asumía que la ruta devolvía **404** por un flag apagado (`TASADOR_COORDINACION_ENABLED`), premisa heredada del plan v1.3.
**Causa raíz:** la premisa quedó desactualizada. **CI-012 se cerró en sentido positivo** (19-ago-2026, revisión de Héctor: la coordinación se soporta por sistema) y **CI-047** confirma que el flag `TASADOR_COORDINACION_ENABLED` **nunca se creó**: la ruta `/tasaciones/[id]/coordinar` está viva y sin gate. La página sólo hace `notFound()` si la solicitud es ajena/inexistente.
**Solución aplicada:** baseline del #3 re-fijada a "renderiza OK" y validada visualmente por Sergio. Documentado en `docs/_notas/snapshot-P12-TAS.md`.
**Prevención futura:** antes de correr un smoke, **re-validar sus premisas contra los CIs cerrados**. Un smoke escrito por adelantado puede describir un comportamiento (404, flag, gate) que un cierre posterior invirtió. Cruzar la matriz de smokes con `CODE_INCONSISTENCIES.md` es más barato que diagnosticar un "falso fallo" en producción.
