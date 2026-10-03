# Correlación UI↔PDF / regresión fotos v4 — T-PLANTILLA-WORD-XLSM-20261001

Verifica que las ediciones de esta tanda (Hoja 1 + bandas de sección) NO regresaron el trabajo de
fotos de la tanda previa (Hojas 5-6).

- Grilla de fotos (Hojas 5-6): leyendas azul `#095085` + texto blanco y medianiles azules **intactos**
  (auditor ciego v4: Hoja 5 ~96%, Hoja 6 ~96%).
- Bindings de fotos `d.fotos.fotos[i=0..15].{url,categoria}`: 16 pares presentes, sin huérfanos.
- El flip de bandas gris→azul se confinó a celdas con texto-etiqueta; las celdas de fotos ya eran
  azules (no se re-tocaron).
- Registro Fotográfico de VP-0067: no se tocó Airtable en esta tanda (render directo contra Carbone
  con el payload existente); no hay riesgo de "volver a cero".
