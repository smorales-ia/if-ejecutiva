# OVERRIDES · Caso 3 · VP-2026-0075

Heredados: `vida_util_override=40` (legítimo) · `valor_seguro_override=1024` (sandbox-G-7, fs=0,8 vs 1,0 whitelist). Sin overrides nuevos.

**Hallazgo que sigue vivo (no es de esta tanda, se reporta para Héctor/Sergio):** los `valor_seguro_override`
de C2/C3/C4 existen SOLO porque M_Clientes trae el factor de seguro equivocado (G-7/errata RB-53). Al sanear el
maestro se retiran y el motor cuadra solo (probado en C5).
