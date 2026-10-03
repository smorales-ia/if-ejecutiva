# Rollback — T-PLANTILLA-DISENO-FINO-20261001

Estado original registrado ANTES de cualquier cambio (Bloque 0 · snapshot real).

## Plantilla
- **v2 vigente (intacta)**: `docs/_artefactos/carbone/PLANTILLA_MET_v2.docx` (80506 bytes, 29-sep).
  No se modifica en esta tanda. v3 es un archivo nuevo.
- **v3 (nuevo)**: `docs/_artefactos/carbone/PLANTILLA_MET_v3.docx`.

## Carbone
- **CARBONE_TEMPLATE_ID vigente en producción (v2)**:
  `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d`
- El upload de v3 crea un templateId NUEVO (hash de contenido); NO sobrescribe el de v2.
  Producción sigue usando v2 hasta que Sergio re-apunte E2 (manual — veto al clasificador
  sobre E2/E3 sigue vigente; ver memoria `make-base-url-incluye-api-v2`).
- `.env.local` NO se tocó: `CARBONE_TEMPLATE_ID` sigue apuntando a v2.

## PDF línea base
- `docs/_evidencia/T-PLANTILLA-DISENO-FINO-20261001/smoke-v2.pdf` (render directo del template
  v2 vía `render-carbone.mjs`, 3.15 MB, 8 páginas) — reproduce el v2 vigente.
- Oráculo (solo lectura): `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`.

## Cómo revertir
1. Descartar `PLANTILLA_MET_v3.docx` (v2 queda como fuente de verdad).
2. No hay cambios en `.env.local`, Airtable ni Make que revertir (render fue directo a Carbone).
3. El templateId v3 subido a Carbone queda huérfano y caduca solo; no afecta producción.

## Cambios aplicados en v3

### Ola 1 · página 1
- Logo: envuelto en marco (tabla 1 celda, borde #8DB4E2) + reducido 10% (EMU 3564000→3207600).
- Etiquetas antecedentes (7): regular→negrita y `"X :"`→`"X:"`.

### Ola 2 · páginas 5-6 (grilla de fotos)
- Leyendas de foto: fondo `#D4D4D4`→`#095085` (16 leyendas bound + afines).
- Medianiles/gutters: bordes `#808080`/`#7F7F7F`→`#095085`.
- Confinado a `<w:tbl>` que contienen `d.fotos.fotos` (no toca páginas 2-3).

- Bindings `{d.*}`: 528 → 528 (sin cambio) tras ambas olas. Imagen rId9 preservada. XML validado.
- Para revertir una ola: regenerar v3 desde v2 aplicando solo las ediciones deseadas (scripts en
  el historial de la tanda). v2 permanece como fuente de verdad intacta.
