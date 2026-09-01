# Snapshot P12-TAS — Deploy verification IF-03 (tasador) en Railway

**Fecha:** 2026-09-01 · **Prod:** https://if-ejecutiva-production.up.railway.app
**Identidad de prueba:** login Clerk nutricionsaludketo@gmail.com (user_3GBF4JpAzPfJsJJWTRGp8sRi7gv), vinculado temporalmente a la ficha de Nelcy (recJPSCLckxLuf9nV, clerk_user_id repuntado; original user_3I3t9D91ZYPIOQzuNcRuDVsQvnb guardado en comentario comXWI5dNA6ykcW95). Cola poblada con VP-2026-0060 (asignada).
Contrato: pausa-total · R12 (sin commit/push).

## Resultado de smokes (visuales confirmados por Sergio 2026-09-01)

| # | Estado | Detalle |
|---|---|---|
| 1 | ✅ OK | Login → cola muestra sólo VP-2026-0060 (ninguna ajena). |
| 2 | ✅ OK | Cola /tasaciones: tres chips, "Hoy" deshabilitado, badge SLA en horas hábiles, un botón por card. |
| 3 | ✅ OK (nueva baseline) | URL: /tasaciones/rec75VXoWvRImjd0f/coordinar. La pantalla "Coordinar visita" RENDERIZA. La premisa antigua ("404 por flag apagado · CI-012") quedó obsoleta: CI-012 cerró positivo + CI-047 confirma que TASADOR_COORDINACION_ENABLED nunca existió. Baseline re-fijada a "renderiza OK". |
| 4 | ⛔ No ejecutado | Política deploy verification (no mutar: subida a Dropbox). Endpoint alcanzable + guard correcto. |
| 5 | ✅ OK c/salvedad | Verificación visual de la lectura de datos y stepper OK; el cálculo queda bloqueado por CI-071 antes de completar campos. |
| 6 | ✅ OK c/salvedad | Verificación visual del formulario (8 secciones, autosave, alerta de faltantes) OK; sin fecha real / sin comparables no deja calcular (CI-071). |
| 7 | ⛔ No ejecutado | Política deploy verification (transición asignada→visitada + AT03). Endpoint alcanzable + guard correcto. |
| 8 | 🚫 Bloqueado | No ejecutado: bloqueado por CI-071 (sin comparables no hay cálculo → no hay avance de cálculo que observar). |
| 9 | 🚫 Bloqueado | No ejecutado: bloqueado por CI-071 (sin cálculo no hay preview). |
| 10 | ⛔ No ejecutado | Política deploy verification (rechazo persistido). Endpoint alcanzable + guard correcto. |
| 11 | ⛔ No ejecutado | Política deploy verification (confirmar → transición + sale de cola). Endpoint alcanzable + guard correcto. |

## Deuda abierta que IF-03 deja al cerrar

- **CI-071** (nuevo) — subida de fotos «Ofertas/Comparables» no escribe clave_adjunto → RF-09 skip → sin comparables → bloquea calcular/preview.
- **CI-002** — webhook RF-09 desde AT-RF09-Trigger (disparo aguas abajo).
- **CI-060** — mínimo de fotos de «Ofertas/Comparables» (decisión: bajar a 1, implementación pendiente).
- **CI-061** — categorización de fotos autoNumber vs record ID (puente aplicado; pendiente import v1.4 en Make).
- **A-44** — divergencia nombre de campo oo_cc vs oo_cc_uf (fórmula directa del informe).
- **A-45** — purga de comparables huérfanos (decisión pendiente de Héctor).
- **SLA etapas 4-7 sin escritor** (CI-037).
- **Rotación de la Anthropic API key.**
- **4 hits AT04 en IF-02** (R5 · territorio IF-02).

## Reversión

Al terminar los smokes, restaurar la identidad de prueba de Nelcy:
`M_Tasadores.recJPSCLckxLuf9nV.clerk_user_id` (fldIu5izeAtkFXMJO) = `user_3I3t9D91ZYPIOQzuNcRuDVsQvnb`
(valor original guardado en el comentario `comXWI5dNA6ykcW95`). Ejecutada en esta misma tanda — ver aprendizajes-20260901-1658-P12-TAS.md y claude-out.txt.
