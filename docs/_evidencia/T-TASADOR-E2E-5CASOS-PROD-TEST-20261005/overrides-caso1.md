# OVERRIDES · Caso 1 · VP-2026-0073

Heredados de la tanda original (legítimos): `vida_util_override=55` (dato del tasador). Sin overrides nuevos de esta tanda.

**Hallazgo que sigue vivo (no es de esta tanda, se reporta para Héctor/Sergio):** los `valor_seguro_override`
de C2/C3/C4 existen SOLO porque M_Clientes trae el factor de seguro equivocado (G-7/errata RB-53). Al sanear el
maestro se retiran y el motor cuadra solo (probado en C5).
