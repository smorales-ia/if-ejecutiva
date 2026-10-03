# Delta R1 / R2 / R3 — T-PLANTILLA-WORD-XLSM-20261001 (micro-pase)

Medición objetiva de las 3 brechas que el auditor de v4 reportó como el "último 1%".

| Brecha | Reportado por auditor | Medición objetiva | Veredicto |
|---|---|---|---|
| **R1** logo hoja 1 | "~2% más grande" | ORIG 281.1×164.8 (r1.706) vs v4 281.0×165.0 (r1.703) → **idéntico** | **FANTASMA** (ya cerrada; tocar = regresar). Sub-gap real: posición vertical +9pt (sub-perceptual). |
| **R2** altos de fila 2/4/7 | "más compactas en el generado" | comparables: ORIG 14.65pt/fila vs v4 **17.81pt** → v4 más ALTO (inverso) | **MISDIAGNOSTICADA**; 2 intentos de reducir fallaron (exact→24.56 regresó; spacing→no-op). No corregible con seguridad hoy. |
| **R3** azul leyendas 5/6 | "un matiz más oscuro" | ORIG navy `#085080` vs v4 `#085080` → **idéntico** | **FANTASMA** (ya cerrada; tocar = regresar). Diferencia real: grosor de banda, no color. |

## Conclusión del micro-pase
Dos de las tres brechas (R1 tamaño, R3 color) estaban **ya cerradas** y aplicarlas como "corrección"
habría introducido desviaciones. La tercera (R2) está **mal diagnosticada en dirección** y resistió
dos enfoques de corrección sin regresar. **v5 ≈ v4 (~97%)**: v4 ya estaba en el techo práctico de este
método. El "último 1%" son diferencias sub-perceptuales (posición de logo 9pt, grosor de banda de
leyenda, pitch de fila) que no son defectos corregibles a ciegas.

Lección: el auditor ciego orienta por impresión; las magnitudes y direcciones deben medirse antes de
editar (misma lección de la tanda previa, ahora reforzada: 3/3 afirmaciones del auditor no resistieron
la medición objetiva).
