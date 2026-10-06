# VISTAS · Caso 5 · VP-2026-0077 (Hipotecaria Evoluciona · HEV-3183) — V1..V6 sobre producción

**Record:** `recoZcwmgCBVKQMxF` · **Estado actual:** `calculada` · **Cuenta:** nutricionsaludketo@gmail.com (tasador `recTJcV3BIvdcG4em`)
**URL base:** https://if-ejecutiva-production.up.railway.app · Login: https://if-ejecutiva-production.up.railway.app/sign-in

En `calculada` las 6 vistas son navegables sin cambiar el estado (V3 en solo-lectura, igual que el patrón VP-0067).
No cambiar el estado hacia atrás: re-entrar a `visitada` re-dispara AT03.

| Vista | URL | Estado requerido | Verificación (contrato de datos, GET Airtable hoy) |
|---|---|---|---|
| V1 · Archivos adjuntos | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/fotos | `asignada`+ (hoy `calculada` ✓) | 8 documentos Sistema + 16 fotos Tasador, todos con `estado_extraccion=listo`; sheet "Documentos y adjuntos" lista ambos |
| V2 · Datos extraídos | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/lectura | `asignada`+ (hoy `calculada` ✓) | 8/8 documentos fuente con `atributos_obtenidos` JSON válido (parse 8/8) y `no_extraidos=[]` → "Datos listos", sin faltantes |
| V3 · Datos del tasador | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF | editable en `asignada`; en `calculada` solo lectura ✓ | TX_DatosTasacion con 40 campos poblados (secciones A–H) |
| V4 · Informe | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/informe | `calculada`/`pdf_listo` (hoy `calculada` ✓) | terminales 13/15 = oráculo (ver regresion-caso5.md); `informeDisponible=true` |
| V5 · Expediente | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/informe → botón "Ver expediente" | ídem V4 ✓ | fotos categorizadas (16) repartidas por bucket; sección "documentos generados" vacía = deuda RF-TAS-10 (igual en VP-0067) |
| V6 · Descargar PDF | https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF/informe → botón "Descargar PDF" | `pdf_final_url` poblado | **PENDIENTE** — E3 inactivo (fix empaquetado para Sergio); hoy el botón cae a `window.print()`. Disparo listo: `disparar-e2-5casos.test.mts` |

**Captura de UI logueada:** no reproducible desde esta sesión (requiere sesión Clerk interactiva de la cuenta de
prueba); la verificación de arriba es del contrato de datos EXACTO que consume cada vista (mapeado a archivo:línea
en el reconocimiento de esta tanda) + reachability HTTP de las rutas. El recorrido visual final es el click-through
de Sergio con la cuenta de prueba.
