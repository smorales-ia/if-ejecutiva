# PLAN — T-VP0067-CONSISTENTE-PROD-20260929

> Dejar VP-2026-0067 (recmMzeu3eWGxyXsf) 100% consistente en PRODUCCIÓN como espejo de
> MET-6283 y probada punta a punta (6 vistas del tasador). Fase 1 ejecutada por 6 agentes
> en paralelo (solo lectura) el 29-sep-2026. Sergio autorizó ejecutar sobre esta solicitud.

## §1 · Resumen

El espejo ya está **~95% logrado** por las tandas previas (T-PDF-IDENTICO, T-CIERRE-FINAL,
T-E2-REAPUNTE): los 8 adjuntos reales cargados y extraídos, TX_DatosTasacion con 40 campos,
7 comparables exactos, cuadro de valoración dígito a dígito (20.125,8624 UF), 15 terminales,
12 habitaciones, legales completos, H_PreciosUF (UF 39.894,61 · US$ 890,33), PDF renderizado
hoy con plantilla v4. La cadena E2→E3 está ACTIVA con runs exitosos hoy (16:18 y 22:18 UTC).

Falta para el 100%: (1) metadatos de los 8 TX_Adjuntos vacíos (`nombre_archivo`, `tipo`,
`tamanio_kb`, `orden`) — sin ellos V1/V5 muestran listas vacías o "sin nombre"; (2) un
adjunto colgado en `extrayendo` desde el 22-sep (V2 nunca llega a 8/8); (3) 2 filas stale
de TX_Calculos con la aritmética CI-057 vieja (30,9123 y 160,52 en vez de 33,6434 y -2,98);
(4) dos TX_DocumentosGenerados con `es_vigente=true` a la vez; (5) `pdf_final_url` es URL
interna de Dropbox (`/home?preview=`) que exige login — el share-link público está BLOQUEADO
por scope `sharing.write` ausente (manual de Sergio); (6) estética: `ingreso_liquido_anual`
y permiso/recepción duplicados vacíos en TX_DatosTasacion.

## §2 · Alcance

**SÍ**: patches Airtable SOLO sobre VP-2026-0067 y sus records hijos (TX_Adjuntos ×8,
TX_Calculos ×2, TX_DatosTasacion ×1, TX_DocumentosGenerados vigencia); disparo real de
E2/E3 vía webhook; verificación punta a punta en producción; evidencia y rollback.
**NO**: reasignar tasador (queda nutricionsaludketo — ver §7); editar C_Formulas (ya
corregida el 29-sep 15:17); tocar AT03 (está OFF y no hace falta); editar escenarios Make
(E3 v2.2 con share-link es propuesta pendiente de Sergio); tocar otras solicitudes, el
oráculo (`docs/_referencias/`), credenciales o conexiones OAuth; commit/push (Sergio).

## §3 · Mapa VISTA → ESTADO → URL

Base de producción: **https://if-ejecutiva-production.up.railway.app** (docs/construccion.md:69).
Login: `/sign-in` (Clerk). Guard de `/tasaciones/[id]/**`: SOLO pertenencia (tasador
asignado), nunca estado (lib/tasador/auth-guard.ts:52-103). Estado actual `pdf_listo`:
**las 6 vistas renderizan por URL directa sin tocar el estado** (Opción A recomendada por
el arquitecto). En `pdf_listo` la solicitud NO aparece en la bandeja /tasaciones
(ESTADOS_EN_COLA = asignada·visitada·calculada — lectura-tasacion.ts:70).

| Vista | Estado habilitante | URL (relativa a la base) | Gate/notas |
|---|---|---|---|
| V1 Adjuntos | cualquiera (pertenencia) | `/tasaciones/recmMzeu3eWGxyXsf/coordinar` (tarjeta "Adjuntos", scroll) | coordinar-visita.tsx:400-426; filtra filas sin `nombre_archivo` |
| V2 Datos extraídos | cualquiera | `/tasaciones/recmMzeu3eWGxyXsf/lectura` | estado-procesando.tsx; polling GET /api/tasaciones/[id]/lectura; ✓/spinner por documento |
| V3 Datos tasación | `pdf_listo` → usar `?modo=consulta` | `/tasaciones/recmMzeu3eWGxyXsf?modo=consulta` | sin el flag el form queda EDITABLE en pdf_listo (anomalía tasacion-form.tsx:153-155) |
| V4 UI Informe | calculada·pdf_listo (`informeDisponible`, estado/route.ts:40) | `/tasaciones/recmMzeu3eWGxyXsf/informe` | 8 bloques; NO pulsar Confirmar (re-emite PDF) |
| V5 Expediente | ídem V4 | misma URL → botón **"Ver expediente"** (footer fijo) | expediente-sheet.tsx; usa `adjuntosDropbox` hidratado |
| V6 Descargar PDF | `pdf_listo` (único con PDF real) | misma URL → botón **"Descargar PDF"** (footer fijo) | abre `pdf_final_url`; sin URL cae a window.print() silencioso |

Secuencia de estados: NINGUNA — recorrer todo en `pdf_listo` por URL directa.
Estados exactos del dominio (lib/tasador/tasaciones.ts:66-77): creada → asignada → visitada
→ calculada → pdf_listo → aprobada → pendiente_final → entregada → cerrada (+cancelada,
requiere_atencion; `devuelta` deprecado).

## §4 · Tabla oráculo (síntesis; detalle completo en el reporte del Agente 2)

Fuente consolidada: `docs/_evidencia/T-PDF-IDENTICO-20260927/contexto-real-v2.json` +
`docs/_artefactos/carbone/overrides_met6283.json` + batería T-CIERRE (127/128 PASS).
Verificado en vivo 29-sep: identificación (FRANCISCO JOSÉ VERGARA UNDURRAGA, RUT
16.610.203-0, METLIFE -6283, op 900159638, dirección, rol N°882-40), superficies
(5.024,86 / 249,91 m²), año 2024, vida útil 70, cuadro 6 ítems (total 20.125,8624 UF,
factor 0,96), 7 comparables homologados, terminales (UF/m² 32,64; US$ ÷ 890,33), Hoja 3
completa vía overrides, 12 habitaciones, legales (permiso N°319 09/09/2020 · recepción
N°210 18/07/2024 · CBR fojas 13291 N°21565 año 2006) — **todo YA espejo dígito a dígito**.

CI-057 esperado: promedio ofertas **33,6434 UF/m²** → desviación **-2,98% (≈-3%)**;
promedio CBR 24,0845 → +35,52% (≈36%). Guardarraíl: 161% y 30,91 AUSENTES.

**Diffs pendientes** (únicos):
| # | Record.campo | Actual | Esperado |
|---|---|---|---|
| D1 | TX_Adjuntos ×8 · nombre_archivo/tipo/tamanio_kb/orden | vacíos | poblados (nombres reales de docs/_referencias/Met_6283/) |
| D2 | TX_Adjuntos rec7t6MPxKu10WniF · estado_extraccion | `extrayendo` (colgado 22-sep) | `listo` + atributos_obtenidos (terna dominio ya en TX_DocumentosLegales) |
| D3 | TX_Calculos recJBJQdcuodR7Kxd · F_UFm2_promedio | 30,9123 | 33,6434 |
| D4 | TX_Calculos recOQzPNt1uZEmSls · F_DesviacionVsPromedio | 160,52 | -2,98 |
| D5 | TX_DocumentosGenerados doc_id 7 y 8 · es_vigente | ambos true | solo el más nuevo true |
| D6 | TX_DatosTasacion recy8q3Tq9omjdNUf · ingreso_liquido_anual / permiso_edif_num / recepcion_final | 0 / vacío / vacío | 36.300.000 / N°319 09/09/2020 / N°210 18/07/2024 (estético) |
| D7 | TX_Solicitudes.pdf_final_url | URL /home (login) | share-link público — BLOQUEADO (scope Dropbox, manual Sergio) |

Tasador: queda `recTJcV3BIvdcG4em` (nutricionsaludketo@gmail.com, clerk_user_id válido).
El nombre impreso "Maria Eugenia Soto" sale de overrides_met6283.json → el PDF es espejo.
Huecos estructurales sin columna (19 rutas) ya puenteados por overrides con candado
`codigo === VP-2026-0067`; no son diffs de esta tanda.

## §5 · Plan de ejecución (olas)

- **BLOQUE 0** (secuencial): snapshot de estado original → rollback.md. Rama feat.
- **OLA 1** (PARALELA — tablas distintas, sin colisión):
  - **Agente A** — TX_DatosTasacion (D6) — 1 patch.
  - **Agente B** — TX_Adjuntos (D1+D2) — patches por record, una sola tabla, un solo agente.
  - **Agente C** — CI-057 offline: validar 33,6434/-2,98 con el harness local contra el XLSM (sin tocar producción).
  - **Agente D** — código/repo: NO NECESARIO (ninguna vista exige cambio de UI; preferencia datos>código cumplida).
- **GATE S1**: A y B OK → aplicar D3+D4 (TX_Calculos, valores validados por C) con rollback. AT03 está OFF → no hay colisión motor; C_Formulas NO se toca (ya corregida).
- **OLA 2** (tras S1): **Agente E** — disparar E2→E3 real (webhook, payload según evidencia T-E2-REAPUNTE), verificar run status 1, luego consolidar vigencia (D5: dejar UN es_vigente=true, el más nuevo).
- **BLOQUE 2**: recorrido de verificación en producción + checks dato-por-dato → evidencia.
- **BLOQUE 3**: auditor ciego (solo estado final). **BLOQUE 4**: rollback condicional por FAIL.

## §6 · Batería de tests

1. Regresión dato-por-dato vs oráculo (tabla §4) — incl. CI-057 = -2,98%/+35,52% y US$=CLP÷890,33.
2. Presencia de cada adjunto: 8/8 con archivo + nombre_archivo + tipo + tamaño + orden.
3. Extracción: 8/8 estado_extraccion=listo, atributos_obtenidos poblados (o justificado).
4. Informe completo: 8 bloques con datos (valorDestacado 20.125,8624 UF; cap rate 4,5%).
5. Expediente: sheet con los 8 adjuntos nombrados y links Dropbox.
6. PDF: fila vigente ÚNICA en TX_DocumentosGenerados + pdf_final_url poblado; descarga real (con la reserva D7: URL exige login Dropbox hasta el paso manual de Sergio).
7. App de producción viva (HTTP 200) y rutas V1..V6 existentes (redirect a /sign-in sin sesión = OK esperado).

## §7 · Riesgos y pasos manuales

- **Manual Sergio #1 (D7)**: scope Dropbox `sharing.write` — Reauthorize/conexión nueva en Make + autorizar E3 v2.2 con módulo share-link (propuesta en verificacion-sharelink-e3.md §1.5). Hasta entonces "Descargar PDF" abre Dropbox con login (o el tasador ve el preview vía print).
- **Manual Sergio #2**: commit/push de la rama feat (solo docs/evidencia; no hay código).
- Riesgo re-render: E2/E3 crean una fila DocGen nueva y Make puede reprocesar bundles al (re)encender escenarios — E2/E3 ya están ON, no se togglean; snapshot de DocGen ANTES del disparo.
- Riesgo UI: no pulsar "Confirmar" ni "Calcular" durante la verificación (re-emiten/409).
- AT03 OFF: los patches a TX_Calculos no serán pisados por el motor; si Sergio lo reenciende luego, el recálculo reproducirá los mismos valores (fórmula ya corregida).

## §8 · Rollback por paso

Todo cambio se registra ANTES en `docs/_evidencia/T-VP0067-CONSISTENTE-PROD-20260929/rollback.md`
(formato tabla|record|campo|antes→después). D1/D2/D6: PATCH inverso con los valores
originales (vacíos/`extrayendo`). D3/D4: PATCH inverso a 30,9123/160,52. D5: restaurar
es_vigente=true en la fila que lo tenía. Disparo E2/E3: la fila DocGen nueva se puede
desmarcar/eliminar y pdf_final_url restaurar al valor snapshot. Sin cambios de código →
sin rollback de repo.

## §9 · GATES

- **G1 credenciales**: PASÓ — todas presentes en .env.local (Dropbox refresh inválido es
  conocido y NO bloquea: la vía viva es la conexión OAuth de Make).
- **G2 oráculo sin ambigüedad**: PASÓ — valores exactos consolidados de evidencia validada
  (127/128) + verificación en vivo; diffs enumerados D1–D7.
- **G3 mapa completo**: PASÓ — 6/6 vistas con estado+URL+componente (§3).
- **G4 cadena PDF + Clerk**: PASÓ — E2/E3 activos con runs status 1 hoy; template v4
  31f3bfab…8e32 vigente; Clerk operativo con nutricionsaludketo vinculada al tasador asignado.

**GATE INTERNO: PASÓ (G1–G4). Se continúa a Fase 2 (autorización previa de Sergio).**
