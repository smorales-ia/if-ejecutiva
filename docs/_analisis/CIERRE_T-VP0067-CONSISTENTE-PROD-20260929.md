# CIERRE — T-VP0067-CONSISTENTE-PROD-20260929

> VP-2026-0067 consistente en PRODUCCIÓN como espejo de MET-6283, probada punta a punta.
> Gate interno G1–G4: PASÓ. Auditor ciego: **APROBADA · ~99% de igualdad** (237/238
> campos-dato espejo). Tanda ejecutada el 29-sep-2026 en dos fases con equipo de agentes.

## Resultado

- **V1 Adjuntos**: OK — 8/8 con nombre real, tipo, tamaño, orden (D1).
- **V2 Extracción**: OK — 8/8 `listo`, incl. el docx CBR desatascado con terna de dominio (D2).
- **V3 Datos tasación**: OK — todas las fuentes pobladas; recorrer con `?modo=consulta`.
- **V4 Informe**: OK — 8 bloques con datos; valor 20.125,8624 UF vía fallback CI-072;
  cuadro de valoración reparado a nivel dato (D8: pareja `descripcion`/`uf_m2_aplicado`/
  `uf_total_item` que lee la UI, antes null).
- **V5 Expediente**: OK — sheet con los 8 adjuntos nombrados y links.
- **V6 Descargar PDF**: OK con reserva — PDF real re-renderizado (corrida E2→E3 status 1/1,
  doc_id 9 vigente ÚNICO, RN-56 saneado de 3 vigentes a 1); `pdf_final_url` poblado pero
  exige login Dropbox (scope `sharing.write` — paso manual de Sergio).
- **CI-057 en producción**: 33,6434 / -2,98% escritos en TX_Calculos (validación offline
  4/4 dígito a dígito contra el motor post-fix; guardarraíl 30,91/160,52 ausentes).

## Piezas bloqueadas

1. **D6c** `ingreso_liquido_anual` (TX_DatosTasacion): fórmula read-only; el PATCH a sus
   fuentes (`arriendo_mensual`/`gasto_anual` = 3.300.000) fue denegado por el clasificador
   de permisos (campos no nombrados en la autorización). PATCH de 2 campos si Sergio quiere.
2. **D7** PDF público: E3 v2.1 construye URL `/home?preview=` (no share-link) porque la
   conexión Dropbox 7553318 no tiene `sharing.write`. Manual: Reauthorize/conexión nueva +
   autorizar E3 v2.2 (propuesta en verificacion-sharelink-e3.md de T-CIERRE-FINAL).

## Diferencias residuales (auditor + verificador 2b; ninguna introducida por la tanda)

Registro fotográfico del preview vacío (fotos del espejo solo en el PDF; cargarlas como
adjuntos rompería el 8/8 de V2) · cap rate en preview muestra "0.04%" (`toFixed(2)` sobre
la fracción, informe-preview.tsx:242 — candidato a CI de presentación) · header preview
"v0" (CI-024) · promedio comparables del preview usa promedio simple (CI-057 UI abierta;
el PDF usa el homologado) · `avaluo_fiscal_uf` duplica el CLP (seed, no consumido) ·
`sup_construida_total=0` duplicado · 1 habitación sin nombre · TX_TerminacionesPorRecinto
vacía (puenteada por overrides con candado VP-2026-0067).

## Paralelismo real logrado

- **Fase 1**: 6 agentes simultáneos (solo lectura) — ~7 min de pared vs ~25-30 min
  secuenciales estimados.
- **Ola 1**: 3 agentes simultáneos (A datos · B adjuntos · C harness) — tablas distintas,
  cero colisión; ~5 min vs ~13 secuenciales.
- **Ola 2 ∥ Bloque 2a**: 2 simultáneos (E cadena PDF · verificador regresión) — ~8 min vs ~15.
- **Bloque 2b ∥ Bloque 3**: 2 simultáneos (informe-check · auditor ciego) — ~7 min vs ~13.
- Total: **13 agentes** (+orquestador), pico de 6 concurrentes; **~30 min de pared vs
  ~1h50 secuenciales estimados (≈3,5×)**. Aislamiento de fallos verificado en vivo: el
  atasco del agente E (curl globbing) no frenó la ola — el orquestador completó sus pasos
  y el agente, reanudado, re-verificó idéntico e idempotente.

## Evidencia

`docs/_planes/PLAN_T-VP0067-CONSISTENTE-PROD-20260929.md` · `docs/_evidencia/T-VP0067-CONSISTENTE-PROD-20260929/`:
rollback.md (+A/B/E), snapshots pre (solicitud, adjuntos, calculos, docgen, datostasacion,
items, predisparo), ci057-offline.md, regresion.md (71 PASS/0 FAIL), adjuntos-check.md,
extraccion-check.md, informe-check.md (+adenda D8), pdf-check.md, auditor.md.
Nota: sin sesión Clerk automatizable no hay capturas de pantalla reales; la verificación
de vistas es a nivel de datos+código+HTTP, y el recorrido visual lo hace Sergio con la
cuenta indicada (login nutricionsaludketo@gmail.com).

## Estado

**TANDA CERRADA.** Cambios de repo: solo documentación (plan, evidencia, cierre,
bitácora) en la rama `feat/T-VP0067-CONSISTENTE-PROD-20260929`. Commit/push: Sergio.
