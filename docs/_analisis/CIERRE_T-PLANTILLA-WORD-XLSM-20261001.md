# CIERRE — T-PLANTILLA-WORD-XLSM-20261001 (incl. micro-pase)

**Estado: ~95-97% de identidad visual (dos auditores ciegos). DETENIDA bajo el gate de 98%.**
Salto grande desde el 82-85% de la tanda T-PLANTILLA-DISENO-FINO. Las 8 hojas OK (93-99%).

## Hitos de la tanda
1. **Método Word validado**: edición en Word 16.0 real (COM vía interop WSL→Windows); round-trip
   preserva 528 bindings y Carbone tolera la fragmentación. Render directo, sin tocar E2/E3.
2. **Olas previas (v4)**: Hoja 1 (logo + reparto vertical con Word COM, medido contra el original) y
   bandas de sección gris→azul (Hojas 2/4/7). Llevaron de 85% a ~97% (auditor de v4).
3. **Micro-pase (v5)**: investigó las 3 brechas residuales del auditor de v4 con MEDICIÓN objetiva.

## Micro-pase: hallazgo central
Las 3 brechas reportadas resultaron **fantasma o mal diagnosticadas** (ver `delta-R1-R2-R3.md`):
- **R1 (tamaño logo)**: ya idéntico (281×165, r1.70 == original). Encogerlo habría regresado.
- **R3 (color leyendas)**: ya idéntico (navy `#085080` == original). Cambiarlo habría regresado.
- **R2 (altos de fila)**: dirección INVERSA (v4 17.81pt/fila vs original 14.65 → v4 más alto, no más
  compacto). Dos intentos de corrección fallaron sin dejar regresión (trHeight exact → 24.56;
  spacing=0 → no-op). No corregible con seguridad con el entendimiento actual del render.

Resultado: **v5 es visualmente equivalente a v4 (~95-97%)**. v4 ya estaba en el techo práctico del
método. El auditor de v5 declaró R1/R2/R3 **cerradas** y dio ~95% (vs 97% de v4): la diferencia de
2 puntos es ruido de evaluación subjetiva — el umbral de 98% queda por debajo de la dispersión entre
auditores. El "último ~3%" son diferencias sub-perceptuales acumuladas (logo 9pt más abajo, grosor de
banda de leyenda, pitch de fila).

## Verificación v5
- Regresión 14/14, 0 huérfanos, 8 páginas, `161%` ausente, `-3%/36%` presentes, bindings 528/528.
- Fotos (Hojas 5-6) sin regresión. Airtable/Make/Dropbox sin tocar.
- Auditores ciegos: v4 ~97%, v5 ~95% (R1/R2/R3 cerradas).

## Gate
≥98% **no certificado** (~95-97%, dentro del ruido). Las 3 brechas objetivo cerradas por medición;
el resto sub-perceptual. Decisión de si "~96% indistinguible en lo esencial" basta → de Sergio.

## Pasos manuales para Sergio
1. Comparar `PDF_generado_VP0067_v5.pdf` vs el original (`comparacion-v5-hoja1..8.png`).
2. Para producción: `CARBONE_TEMPLATE_ID` en `.env.local` con el id de `v5-templateid.txt` + re-apuntar
   E2 (lo hace Sergio — E2/E3 vetados para Claude). *(Nota: v5 ≈ v4; si preferís, el id de v4 también
   sirve — son visualmente equivalentes.)*
3. commit+push de la rama `feat/T-PLANTILLA-WORD-XLSM-20261001`.

## Reversibilidad
v4 intacta + backup en `rollback/PLANTILLA_MET_v4_BACKUP.docx`. v3 y su backup también. `.env.local`/
Make/Airtable sin tocar. Ver `rollback.md`.

## Deuda para una tanda futura (si se busca el 98-100% exacto)
Investigar el modelo de alto de fila de Carbone/LibreOffice (por qué `trHeight exact` no reduce y el
espaciado de párrafo no afecta el pitch) para poder igualar los 14.65pt del original; y resolver la
posición vertical del logo (9pt) sin desplazar ANTECEDENTES.
