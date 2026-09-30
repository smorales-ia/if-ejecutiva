# CIERRE — T-VP0067-PDFPUBLICO-20260929

> Objetivo: link PÚBLICO del PDF de VP-2026-0067 + carga del dato pendiente (D6c).
> Resultado: **D6c cerrado → espejo de DATOS al 100% (238/238, auditor ciego)**;
> pieza del link público **DETENIDA en el Gate** por causa externa verificada.

## Qué se ejecutó

- **D6c (dato bloqueado de la tanda anterior)**: PATCH autorizado a
  `TX_DatosTasacion.recy8q3Tq9omjdNUf` — `arriendo_mensual=3.300.000` ·
  `gasto_anual=3.300.000` → la fórmula `ingreso_liquido_anual` pasó sola a
  **36.300.000**, exacto contra el oráculo (XLSM Portada!BJ38/BJ40/BJ43; renta
  perpetua 806.666.667 ya cuadraba en TX_Calculos). Sin efectos colaterales: el PDF
  no cambia (lee `*_clp` y TX_Calculos); la sección H del formulario tasador pasa de
  vacía al espejo. Rollback: PATCH con ambos campos null.
- **Auditoría ciega**: espejo de datos 100%; vigencia única sana (doc_id 9);
  residuales solo de presentación UI (cap rate `toFixed`, header v0/CI-024, promedio
  simple CI-057-UI, fotos del preview) y seeds no consumidos — sin cambios.

## Qué quedó detenido y por qué (pieza E3 / link público)

El mandato asumía la conexión Dropbox "reautorizada con scope de compartir". La
verificación por API (doble, 29-sep, posterior al Reauthorize) muestra la conexión
7553318 con los mismos **4 scopes de siempre — sin `sharing.write`**: el botón
**Reauthorize de Make NO re-negocia scopes** de un grant OAuth existente. Aplicar
E3 v2.2 hoy fallaría con `missing_scope`, así que NO se tocó el escenario
(sigue v2.1 activo, blueprint pre respaldado).

**Todo lo demás quedó preparado y validado** (plan §1): diff v2.2 exacto (módulo
`dropbox:createShareLink` v5 verificado contra el catálogo vivo de Make, remapeos de
`pdf_final_url`/`url_pdf` a `{{9.url}}`, name bump, PATCH por API con curl, el
escenario queda activo tras el PATCH), campos destino confirmados y URL dl=0
recomendada.

## Único paso que falta (manual de Sergio, OAuth interactivo — no automatizable)

En Make → **Connections → Add → Dropbox**: crear una conexión **NUEVA** con la
cuenta nutricionsaludketo@gmail.com (el flujo OAuth nuevo pide el set completo de
scopes, incluido `sharing.write`). El Reauthorize de la conexión vieja NO sirve.
Con el ID de la conexión nueva, la tanda de cierre aplica §1 + corrida E2→E3 +
validación del link en limpio: ~15 minutos.

## Paralelismo

Fase 1: 3 auditores simultáneos (~4 min vs ~10 secuenciales). Fase 2 fue mínima
(1 PATCH + auditor ciego) por el bloqueo del Gate. Total 4 agentes + orquestador.

## Evidencia

`docs/_planes/PLAN_T-VP0067-PDFPUBLICO-20260929.md` ·
`docs/_evidencia/T-VP0067-PDFPUBLICO-20260929/`: rollback.md,
snap-pre-datostasacion.json, blueprint-e3-v21-pre.json (tokens redactados),
tests.md, auditor.md.

## Estado

**TANDA DETENIDA EN GATE (pieza link público) · pieza D6c EJECUTADA y verificada.**
Cambios de repo: solo docs, rama `feat/T-VP0067-PDFPUBLICO-20260929`. Commit/push: Sergio.
