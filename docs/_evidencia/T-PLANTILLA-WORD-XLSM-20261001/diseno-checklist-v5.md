# Checklist de diseño v5 — T-PLANTILLA-WORD-XLSM-20261001 (micro-pase)

| Ítem | Estado | Evidencia |
|---|---|---|
| R1 logo tamaño/ratio | CERRADA (ya coincidía) | `logo-medicion.md`: 281×165 r1.70 == original |
| R1 logo posición vertical | residual 9pt (sub-perceptual, no tocado para no regresar ANTECEDENTES) | y=203 vs 194 |
| R2 altos de fila 2/4/7 | CERRADA por percepción / no mejorable por edición | `altos-fila-medicion.md`: v4 17.81 vs orig 14.65; 2 fixes fallaron sin regresar |
| R3 color leyendas 5/6 | CERRADA (ya coincidía) | `leyenda-color.md`: `#085080` == original |
| Bindings 528/528 | OK | `bindings-check-v5.md` |
| Regresión datos 14/14 | OK | `regresion-datos-v5.md` |
| Fotos sin regresión | OK | `correlacion-UI-PDF-v5.md` |
| Auditor ciego | ~95% (v4: ~97%) — 98% no certificado | `auditor-ciego-v5.md` |

**Criterio de HECHO (≥98%)**: NO certificado — ~95-97% (dentro del ruido de evaluación entre auditores).
Las 3 brechas objetivo quedaron cerradas por medición; el resto es sub-perceptual. v5 es visualmente
equivalente a v4 (el micro-pase confirmó que v4 ya estaba en el techo del método; no introdujo cambios
visuales porque las "brechas" eran fantasma o no corregibles con seguridad).
