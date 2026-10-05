# FIX APLICADO · C_Formulas · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

Tabla `C_Formulas` (`tblNFa454fBbqRB3t`), campo `expresion` (`fldyPzdE1wyXlXPjU`). PATCH verificado con read-back idéntico. Rollback previo en `rollback-fix.json` + `rollback-fix.mjs`.

## G-1 · F_ValorReposicionUF · `reckDXGPbkDVjzPjY`

**PATCH timestamp:** 2026-10-05T20:23:38.454Z

**ANTES:**
```
valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? valor_edificacion_nuevo_items_uf : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

**DESPUÉS:**
```
valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

Cambio: en la rama con cuadro, la edificación a-nuevo se castiga ×0,8 SOLO cuando `sup_terreno_items_m2 = 0` (espejo literal de `Portada!BG72 = IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)`, idéntica 5/5 XLSM). OO.CC. (`valor_occ_items_uf`) queda a valor pleno. Ramas override y sin-cuadro intactas. El 0,8 es constante de plantilla, NO `factor_garantia` (R2).

## G-2 · F_SeguroIncendioUF · `recZTfJX0MJ0r1tHP`

**PATCH timestamp:** 2026-10-05T20:23:38.800Z

**ANTES:**
```
valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf : (valor_comercial_uf * factor_seguro))
```

**DESPUÉS:**
```
valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))
```

Cambio: la rama con cuadro multiplica la base por `factor_seguro` (Motor v2.7:761 · RB-35 · RN-11). Ramas override y sin-cuadro intactas. **No se tocó** la fórmula de campo `valor_seguro_item_uf` (`fldxzIzT0kakMUbss` de `TX_ItemsCuadroValoracion`) ni sus exclusiones (R6).
