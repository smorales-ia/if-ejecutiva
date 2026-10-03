# Auditor ciego · go-live v5 producción

> Verificación desde el estado final en producción, sin asumir los logs de ejecución.
> Fecha: 2026-10-03.

| # | Criterio | Evidencia | Veredicto |
|---|---|---|---|
| 1 | E2 corre con el templateId de v5 | `GET /scenarios/5750023/blueprint` → módulo #2 URL `POST api.carbone.io/render/f6d1f2b0…6a786f`; E2 activo | **OK** |
| 2 | El PDF linkeado en Airtable es v5 | `pdf_final_url` de VP-0067 bajado de Dropbox → 8 págs, 0 marcadores, fotos (288 imgs), tokens correctos | **OK** |
| 3 | Las 6 vistas funcionan | Requieren sesión Clerk interactiva; **no verificables headless** | **PENDIENTE (manual)** |
| 4 | Nada se rompió (datos/fotos/cálculos) | `regresion-datos.md` ✅ + `regresion-fotos.md` ✅ sobre el PDF vivo | **OK** |

## Conclusión del auditor

Producción **ya usa la plantilla v5** y el PDF vigente de VP-0067 es un render v5 válido con
datos, cálculos y fotos intactos. Criterios 1, 2 y 4: **OK**. Criterio 3 (las 6 vistas web):
**pendiente de test manual** por requerir login Clerk — no es un FAIL, es no verificable de
forma automática. **No se detecta ninguna regresión. No procede rollback.**
