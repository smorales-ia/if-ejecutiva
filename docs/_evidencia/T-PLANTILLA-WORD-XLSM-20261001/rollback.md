# Rollback — T-PLANTILLA-WORD-XLSM-20261001

## Respaldos
- **v3 intacta**: `docs/_artefactos/carbone/PLANTILLA_MET_v3.docx` (línea base, no modificada).
- **Backup explícito**: `docs/_evidencia/T-PLANTILLA-WORD-XLSM-20261001/rollback/PLANTILLA_MET_v3_BACKUP.docx`.
- **v4 nueva**: `docs/_artefactos/carbone/PLANTILLA_MET_v4.docx`.

## Carbone / entorno
- `.env.local` NO modificado. `CARBONE_TEMPLATE_ID` sigue apuntando al v3 en producción.
- El upload de v4 crea templateId nuevo (`v4-templateid.txt`); NO sobrescribe v3. E2 NO se re-apuntó
  (lo hace Sergio tras OK). Airtable/Make/Dropbox sin tocar.
- Render fue DIRECTO contra Carbone (`render-carbone.mjs`), sin pasar por E2/E3.

## Cambios en v4
1. **Hoja 1 (Word COM)**: logo 252→281×165pt; marco rowH 216→300pt + space-before +42pt; etiquetas
   col1 LeftIndent +40pt.
2. **Bandas de sección (XML targeteado)**: 209 celdas de encabezado/etiqueta `#D4D4D4`→`#095085` con
   texto blanco. Confinado a celdas con texto-literal (no bindings, no vacías).

## Revertir
- Descartar `PLANTILLA_MET_v4.docx` → v3 vuelve a ser la fuente. Nada más que revertir (sin cambios
  en env/Make/Airtable). El templateId v4 huérfano caduca solo.
- Bindings 528/528 verificados tras cada paso; backup disponible para revertir una edición puntual.
