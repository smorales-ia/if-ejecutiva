# ROLLBACK · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · FASE 2

**Fecha snapshot:** 2026-10-05 (ver `capturado` en `rollback-fix.json`) · **Escrito ANTES de aplicar cualquier cambio.**

## Qué se revierte

1. **Las 2 expresiones de `C_Formulas`** (`tblNFa454fBbqRB3t`), campo `expresion` (`fldyPzdE1wyXlXPjU`):
   - `reckDXGPbkDVjzPjY` · F_ValorReposicionUF → texto original (sin el condicional `sup_terreno_items_m2`/×0,8).
   - `recZTfJX0MJ0r1tHP` · F_SeguroIncendioUF → texto original (rama con cuadro sin `* factor_seguro`).
2. **Los campos tocados de las 4 solicitudes sandbox** (`TX_Solicitudes` `tblaHTyMHYfmy7Fg6`): `estado`, `valor_reposicion_override`, `valor_seguro_override`, `tasa_cap_rate_override`, `vida_util_override`, `override_motivo`, `override_autor` — restaurados al valor del snapshot (campo ausente en snapshot ⇒ se escribe `null`).
   - recconVQfAc8LSGJf · VP-2026-0074 (piloto)
   - recE1LwwH2xbcCHti · VP-2026-0075
   - rectnGOaHvEioXZw3 · VP-2026-0076
   - recoZcwmgCBVKQMxF · VP-2026-0077

## Cómo (un paso)

```bash
node docs/_evidencia/T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005/rollback-fix.mjs
```

Lee `AIRTABLE_TOKEN` de `.env.local` (sin `source`) y restaura todo desde `rollback-fix.json`. Verifica cada PATCH con el status HTTP y re-lee el campo restaurado.

## Notas

- **TX_Calculos:** AT03 borra y reescribe las 17 filas en cada corrida. Si tras el rollback se quiere que las filas TX_Calculos de una sandbox vuelvan a reflejar la fórmula vieja, basta re-disparar (`estado='visitada'`) DESPUÉS de restaurar las expresiones — opcional, no lo hace el script. Los valores pre-fix de las sandbox salían por la rama override, que el rollback restaura, así que un re-disparo post-rollback reproduce los valores previos.
- **M_Clientes no se toca** ni en el fix ni en el rollback.
- Estado original de las 4 sandbox: `calculada` (las 4), con los overrides listados en `rollback-fix.json` (VP-2026-0074: `valor_reposicion_override=1115.2`, `vida_util_override=40`, sin `valor_seguro_override`).
