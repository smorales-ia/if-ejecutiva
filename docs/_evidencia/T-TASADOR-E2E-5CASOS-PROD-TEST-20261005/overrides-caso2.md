# OVERRIDES · Caso 2 · VP-2026-0074

Heredados (réplica+fix): `vida_util_override=40` (legítimo) · `valor_seguro_override=1394` con motivo sandbox-G-7 (dato maestro M_Clientes fs=0,8 vs 1,0 whitelist — pendiente saneo con Héctor). Reposición ya la calcula la FÓRMULA v3.3. Sin overrides nuevos.

**Hallazgo que sigue vivo (no es de esta tanda, se reporta para Héctor/Sergio):** los `valor_seguro_override`
de C2/C3/C4 existen SOLO porque M_Clientes trae el factor de seguro equivocado (G-7/errata RB-53). Al sanear el
maestro se retiran y el motor cuadra solo (probado en C5).
