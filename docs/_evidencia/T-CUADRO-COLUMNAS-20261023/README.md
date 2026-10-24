# T-CUADRO-COLUMNAS-20261023 · columnas por fila y totales del cuadro de valoración

Réplica MET-6283 sobre VP-2026-0079 (`rec6XubOR92X6gnOH`). Plantilla nueva
`docs/_artefactos/carbone/PLANTILLA_MET_v6.docx` (v5 + columnas por fila + 3 renglones de totales).

| Archivo | Qué es |
|---|---|
| `rollback/PLANTILLA_MET_v5_BACKUP.docx` | v5 intacta (SHA-256 `f6d1f2b0…786f` = templateId vigente en E2) |
| `word-crear-v6.ps1` · `word-fuente-v6.ps1` | Edición en Word de escritorio (COM) que produjo la v6 |
| `contexto-0079.test.mts` | Genera el contexto real (sólo lee Airtable); apagado salvo `GENERAR_CONTEXTO_0079=1` |
| `cuadro-0079.json` | El bloque `cuadro` de ese contexto |
| `carbone-render.mjs` | Render directo (`test` o `prod`; sube o renderiza) |
| `PDF_render_TEST_v6_VP0079.pdf` | Render de la v6 con la clave TEST (marca de agua) |
| `comparacion-cuadro-original-vs-v6.png` | Original MET-6283 (arriba) y v6 (abajo) |

- templateId v6 = SHA-256 del .docx = `3ff585903d921bded8f7b35f1f4d52391d04b26a8d067b363298fddfd5b13adb`.
  Ya visible con la clave PROD (plantillas compartidas entre claves).
- Etiquetas `{d.`: 528 (v5) → 664 (v6). XML válido. Fuera del cuadro, el texto de las 12 páginas
  es idéntico al render de la v5 con el mismo contexto.
- **No hecho (requiere OK de Sergio):** re-apuntar E2 (Make 5750023) a la v6, actualizar
  `CARBONE_TEMPLATE_ID` en `.env.local` y reemitir el PDF desde la app (nunca «Replay run» en E3).
- Rollback: volver a apuntar E2 a `f6d1f2b0…786f` (la v5 sigue en Carbone).

## v7 (23-oct-2026, sesión principal)

`docs/_artefactos/carbone/PLANTILLA_MET_v7.docx`, generada desde la v6 con `construir_v7.py`
(sin Word): cada casilla de imagen con marcador propio + `:imageFit(contain)`, y en la Hoja 1
`{d.propiedad.calle}` y `{d.propiedad.rolImpreso}`. Con el código de esa misma sesión
(`imagenUnica`, grilla sin comparables ni mapa de referencias, pies «Ubicación»/«Fachada») el
render de VP-2026-0079 tiene 8 páginas, como el original.

- templateId v7 = `3f1082cd0eb02f23b45cfe7fed6604f273317e82e4e3e6f2fab44ba65ab47442` (subida con la
  clave TEST; las plantillas se comparten con la PROD).
- La v7 **necesita el código desplegado** (`propiedad.calle`, `propiedad.rolImpreso`): re-apuntar
  E2 a la v7 recién después del deploy, o la Hoja 1 imprime dirección y rol vacíos.
- Rollback: re-apuntar E2 a la v5 (`f6d1f2b0…786f`).
