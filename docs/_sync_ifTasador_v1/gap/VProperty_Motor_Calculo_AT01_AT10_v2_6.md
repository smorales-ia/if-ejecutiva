# Ficha de brecha — `VProperty_Motor_Calculo_AT01_AT10_v2_6.md`

- **Familia** — F · Motor de Cálculo
- **Ruta** — `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md`
- **Última modificación** — 2026-07-22 · `c379b98` · 1169 líneas
- **Versión declarada** — v2.6 *(el prompt asumía v2.5 — ver C-2)*
- **Decisión** — **ACTUALIZAR** (alcance mínimo)
- **Prioridad** — **P2** · el documento ya está mayoritariamente alineado

---

## Verificación del criterio crítico de la DoD

**El trigger de AT03 ya es `estado = visitada`.** Confirmado en cuatro lugares independientes:

| Línea | Evidencia |
|---|---|
| 36 | `AT03  AT03_ejecutar_dag_formulas  Script  estado=visitada  C_Formulas → TX_Calculos` |
| 157 | `visitada → AT03_ejecutar_dag_formulas` |
| 678 | `Trigger · TX_Solicitudes.estado = visitada` |
| 688 | `IF-03 (estado = visitada)` |

Cero ocurrencias de `capturada` en todo el archivo. **La fila §2.14 "AT03 trigger `visitada`"
está cumplida de origen en este documento** — la violación que queda vive en §6.2 del propio
spec (línea 2974), no aquí.

**Sin lenguaje de LLM.** El grep de IA (`IA extrayendo|Claude leyendo|modelo procesando`)
devuelve cero. El documento describe AT03 como DAG determinista. ✅ Regla de oro §1.6 cumplida.

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `devuelta` | 2 | 303, 361 | ❌ a marcar DEPRECATED |
| `WhatsApp` | 1 | 578 | ❌ contradice canal único |
| `capturada` | 0 | — | ✅ |

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Diagrama de decisión del visador (303) | `├──▶ Si devuelve: TX_Solicitudes.estado = devuelta` → `estado = asignada`, con nota DEPRECATED apuntando a §2.11 | §2.11 (1806) · RF-17 (1793) | EA + DE |
| Estados de excepción (361) | `requiere_atencion revision devuelta` → revisar el contexto; conservar `requiere_atencion` (sigue vigente como estado de excepción), marcar `devuelta` DEPRECATED | §2.11 (1806) | EA |
| AT02 · Siguiente paso (578) | *"Make SC03 notifica al tasador (email/WhatsApp)"* → **canal único correo**. El aviso por WhatsApp al tasador está fuera de alcance (FUT-EJ-10) y su campo soporte es `M_Tasadores.notificar_whatsapp` | §2 (1589) · spec §1 (1284–1286) | INT + UX |
| Tabla de automatizaciones | Verificar si corresponde agregar **SC08** (motor) y **SC09** (PDF Carbone). El documento cubre AT01–AT10; SC08/SC09 son escenarios Make, no Airtable Automations — decidir si entran o se dejan al Blueprint | §2.11 (1825, 1828) | EA + INT |

## Nota sobre el alcance

Este es el documento con menor brecha de las cinco fuentes canónicas: 3 hits, ninguno
estructural. **No requiere versión nueva**; se edita en sitio con changelog al pie, según
la convención §4.2 del prompt para documentos ya versionados en el nombre que no cambian
de contenido sustantivo.

Decisión a confirmar en Checkpoint #3: `v2.6` editado en sitio **o** `v2.7`. Recomendación
del EA: **en sitio**, porque ninguno de los cuatro cambios altera el contrato del motor.
