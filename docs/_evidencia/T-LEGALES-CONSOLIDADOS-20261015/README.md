# T-LEGALES-CONSOLIDADOS-20261015 · evidencia, pegado y rollback

> Nota operativa con fecha, no spec. La regla vive en la spec §2.8.3 y en `docs/schema-airtable.md` §28.4.
> Diseño y diagnóstico: `DISENO.md`. Commit sugerido: `COMMIT.md`.

## Aplicado en Airtable (15-oct-2026)

Aprobación de Sergio en el chat de la sesión que escribió («Sí, aplica»). Script `aplicar.mjs`
(idempotente), log `apply-log.txt`, respaldos `backup-tda-pre.json` y `backup-documentos-legales-pre.json`,
verificación `verificacion-tda-post.json` y `verificacion-legales-0079-post.json`.

- 2 campos en `D_TipoDocumentoAtributo` + 4 en `TX_DocumentosLegales` (IDs en schema §28.4).
- 21 filas actualizadas (grupo · prioridad · vigencia; sello verde con destino; `obligatorio=false` en
  notaría y comprador del CBR) y 8 filas nuevas.
- Backfill: `origen_dato = extraido_rf09` sólo en la fila de VP-2026-0079 (`rec4zGgDXFD4Ry7oH`).

## Paso manual: pegar AT03-Ext v6

En Airtable → **Automations** → la automation de **AT03-Ext** (trigger «When record updated» ·
`TX_Adjuntos` · campo `atributos_obtenidos`) → acción **«Run a script»**: reemplazar todo el código por
el contenido de `docs/_artefactos/airtable/AT03-Ext_script.js` (v6) y guardar. La configuración de
entrada (`adjuntoId`) no cambia. Es la misma automation y el mismo paso donde se pegó la v5.

⚠ Mientras siga pegada la v5, una lectura de esos documentos omite los campos de texto y fecha
consolidables («sólo se consolidan campos numéricos») y consolida el año por separado. La v6 lo corrige
en la siguiente lectura, porque esos valores quedan con `origen_dato=extraido_rf09`.

## Después del paste · VP-2026-0079 (requiere aprobación aparte)

1. Releer la escritura `rec2p6QpeesQ0w2SW` con `estado_extraccion = idle` (la gemela
   AT-RF09-Trigger-Update la toma en ~5 s): ahora se le piden foja/número/año de la inscripción.
2. Re-disparar AT03-Ext del mapa SII `recyCKnUjft9WilnL` reescribiendo su `atributos_obtenidos` igual.
3. Verificar por REST: `TX_DocumentosLegales` = 3312 / 4663 / 2020 y `TX_DatosTasacion.lat/long` =
   -33.23458 / -70.675087; una segunda corrida debe dar 0 escrituras («sin_cambios»).

## Rollback

1. Script: volver a pegar la v5 (`git show HEAD:docs/_artefactos/airtable/AT03-Ext_script.js`).
2. Borrar las 8 filas nuevas (IDs en schema §28.4).
3. En las 21 filas actualizadas, restaurar `prioridad_destino`, `uso_*` y `obligatorio` desde
   `backup-tda-pre.json`, y vaciar `grupo_destino` / `vigencia_destino`.
4. Los 6 campos nuevos se borran desde la UI (la API no borra campos). Con la v5 pegada son inocuos.
