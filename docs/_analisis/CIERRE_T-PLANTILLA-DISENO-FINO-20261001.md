# CIERRE — T-PLANTILLA-DISENO-FINO-20261001

**Estado: DETENIDA en el gate de HECHO (Bloque 4).** Identidad visual ~82-85% < 98%. Olas 1-2
ejecutadas y verificadas por render real; Ola 3 planificada y pendiente de autorización de Sergio.

## Qué se hizo
- **Fase 1 (plan)** completa y medida: `docs/_planes/PLAN_T-PLANTILLA-DISENO-FINO-20261001.md`.
  Diagnóstico corrigió dos supuestos que habrían EMPEORADO la fidelidad (la fuente ya es Calibri
  como el original; el celeste de las filas PROMEDIO es correcto).
- **Motor de ejecución probado**: `render-carbone.mjs` renderiza directo contra Carbone
  (`POST /template` + `POST/GET /render`, `lang=es-cl`) **sin tocar E2/E3** — así se valida la
  plantilla respetando el veto del clasificador sobre los escenarios Make.
- **Ola 1 (pág 1)**: logo enmarcado + reducido 10%; etiquetas de antecedentes en negrita y `"X:"`.
- **Ola 2 (págs 5-6, grilla de fotos)**: leyendas gris→azul `#095085` con texto blanco; medianiles
  gris→azul. Confinado a tablas con `d.fotos.fotos`. Recuperó la "firma visual" (auditor: 62%→88-90%).
- **PLANTILLA_MET_v3.docx** entregada (versión completa). Bindings `{d.*}` 528→528; imagen rId9
  preservada; XML validado. v2 intacta.

## Gates
- G1 credenciales · G2 línea base · G3 diff hoja×hoja · G4 layout XLSM · G5 reglas Carbone → **PASS**.
- Gate de HECHO (≥98%) → **NO alcanzado** → DETENER (así lo exige el Bloque 4).

## Verificación
- **Regresión de datos**: 14/14 terminales con formato chileno; 0 placeholders huérfanos; 8 páginas;
  `161%` ausente (CI-057 intacto).
- **Bindings**: 528→528, rId9 OK.
- **Auditor ciego ×2** (independientes): global ~82-85%; ambos coinciden en que no se alcanza 98% y
  en que la grilla de fotos (Ola 2) quedó bien. El 2º reportó un defecto falso ("faltan bandas
  laterales"): se verificó que están presentes — descartado.

## Residuales reales para Ola 3 (prioridad)
1. Marco/proporción del logo y reparto vertical de la página 1.
2. Densidad de tablas y caja VALOR TASACION (página 2).
3. Maqueta de documentos legales/firma (página 8).
4. Peso de bordes/cabeceras y anchos de tabla (transversal, afinar densidad).

## Pasos manuales para Sergio
1. Mirar `PDF_generado_VP0067_v3.pdf` vs el original y las comparaciones `comparacion-hoja1..8.png`;
   dar OK o pedir Ola 3.
2. Para llevar v3 a producción: re-apuntar E2 al nuevo `CARBONE_TEMPLATE_ID` y actualizar
   `.env.local` (lo hace Sergio — E2/E3 vetados para Claude). El templateId v3 de la última corrida
   está en `docs/_evidencia/T-PLANTILLA-DISENO-FINO-20261001/v3-templateid.txt`.
3. commit+push de la rama `feat/T-PLANTILLA-DISENO-FINO-20261001`.

## Reversibilidad
v2 intacta; `.env.local`/Make/Airtable sin tocar; render fue directo a Carbone. Ver `rollback.md`.
