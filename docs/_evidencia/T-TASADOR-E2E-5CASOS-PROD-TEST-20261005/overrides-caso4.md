# OVERRIDES · Caso 4 · VP-2026-0076

Heredados: `vida_util_override=65` (legítimo) · `tasa_cap_rate_override=0.055` (legítimo NRB-01) · `valor_seguro_override=857.736` (sandbox-G-7, errata RB-53: fs=0,825). Sin overrides nuevos.

**Hallazgo que sigue vivo (no es de esta tanda, se reporta para Héctor/Sergio):** los `valor_seguro_override`
de C2/C3/C4 existen SOLO porque M_Clientes trae el factor de seguro equivocado (G-7/errata RB-53). Al sanear el
maestro se retiran y el motor cuadra solo (probado en C5).
