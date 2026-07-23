/**
 * ============================================================================
 * AT01 — Resolver Motor de Reglas
 * ESTADO: DIFERIDO A CU SIGUIENTE — NO aplica al alcance de CU-002 (IF-02).
 * ============================================================================
 *
 * Por qué está diferido:
 * - Los 3 escenarios de IF-02 que se provisionan en P9 (SC01, SC-Asignar,
 *   SC-Edicion) se disparan por WEBHOOK desde Next.js, no por una Airtable
 *   Automation. Por lo tanto NO requieren ningún AT trigger script.
 * - AT01 es el motor de cálculo de reglas de negocio (C_ReglasNegocio →
 *   A_DecisionesMotor), parte de la Capa de Motor AT01–AT10. Su alcance es la
 *   decisión automática del motor (p. ej. asignación sugerida, SLA, priorización),
 *   que en IF-02/CU-002 NO se ejecuta: "la UI muestra y captura; nunca decide"
 *   y AT02 (transición creada→asignada) está explícitamente FUERA de alcance de
 *   IF-02 (ver plan §0.4: "cero llamadas a AT02 desde código Next.js").
 * - La asignación en IF-02 la ejecuta la Ejecutiva manualmente vía SC-Asignar
 *   (Make), no el motor. No hay dependencia de AT01 para SC01/SC-Asignar/SC-Edicion.
 *
 * Cuándo retomarlo:
 * - En el CU que materialice el motor de cálculo (roadmap AT01–AT10). Ahí se
 *   define: tabla trigger, condiciones, Input variables y outputs. Referencia:
 *   docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md.
 *
 * Scripts Airtable Automation existentes como referencia de estructura (para
 * cuando se implemente): docs/make/AT-RF09-Trigger_script.js y
 * docs/make/AT03-Ext_script.js (cabecera con tabla/trigger/inputs/outputs).
 *
 * Conclusión P9: no se pega ningún script AT para SC01/SC-Asignar/SC-Edicion.
 * Este archivo queda como marcador de la deuda, no como código a ejecutar.
 */

throw new Error(
  "AT01 diferido a CU siguiente — no aplica a CU-002/IF-02. No pegar en Airtable Automations."
)
