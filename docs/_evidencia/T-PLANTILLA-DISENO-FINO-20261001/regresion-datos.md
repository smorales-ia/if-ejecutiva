# Regresión de datos — T-PLANTILLA-DISENO-FINO-20261001

Confirma que la edición de plantilla (Ola 1, página 1) NO rompió ningún dato del informe.
Fuente: `PDF_generado_VP0067_v3.pdf` (render directo Carbone, `lang=es-cl`), extracción pymupdf.

## Resultado: 14/14 terminales OK · 0 placeholders huérfanos · 8 páginas

| Terminal | Presente |
|---|---|
| 20.125,86 (valor tasación UF) | ✅ |
| 802.913.431 (valor CLP) | ✅ |
| 39.894,61 (UF) | ✅ |
| 16.610.203-0 (RUT) | ✅ |
| METLIFE -6283 | ✅ |
| FRANCISCO JOSE VERGARA UNDURRAGA | ✅ |
| Colina · Metropolitana de Santiago | ✅ |
| 890,33 (dólar) | ✅ |
| 33,64 · 24,08 (promedios) | ✅ |
| 3.300.000 (arriendo) | ✅ |
| 8 A 10 MESES | ✅ |
| LOS EUCALIPTUS, Casa: N°2100 | ✅ |

- `{d.` huérfanos: **0** (todos los bindings resolvieron).
- `161%` (CI-057): **ausente** → la corrección de la tanda previa sigue intacta.
- Páginas: **8**.

## Hallazgo de harness (no es regresión)
El render DIRECTO contra Carbone requiere `lang: "es-cl"` (igual que E2) o los números salen en
formato inglés (`802,913,431`). Sin el locale, 7 terminales "faltaban" tanto en v2 como en v3
por igual — artefacto del harness, no de la edición. Corregido en `render-carbone.mjs`.
