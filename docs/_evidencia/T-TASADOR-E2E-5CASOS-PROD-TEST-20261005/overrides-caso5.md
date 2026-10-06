# OVERRIDES · Caso 5 · VP-2026-0077

Heredados: `vida_util_override=70` (legítimo). Reposición y seguro los calcula la FÓRMULA v3.3 (fix probado punta a punta). Sin overrides nuevos.

**Hallazgo que sigue vivo (no es de esta tanda, se reporta para Héctor/Sergio):** los `valor_seguro_override`
de C2/C3/C4 existen SOLO porque M_Clientes trae el factor de seguro equivocado (G-7/errata RB-53). Al sanear el
maestro se retiran y el motor cuadra solo (probado en C5).
