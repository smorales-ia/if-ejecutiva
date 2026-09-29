# Regresión dato-por-dato — PDF v2 vs oráculo MET-6283

> Corrida real 28-sep-2026 · `PDF_generado_VP0067_v2.pdf` (3.396.964 bytes) ·
> batería `verificar.py` → `tests-output.txt` · **127/128 PASS** (el único FAIL es el
> guardarraíl heurístico de pixel-diff en p2, ver `diseno-checklist.md`).

## T1 — Datos exactos: 55/55 PASS

Todos los literales del oráculo presentes con formato chileno exacto, entre ellos:

- **Los 4 corregidos de esta tanda**: Año Construcción `2024` (era 2020) · Vida útil `70`
  (estaba vacío) · Tasador `Maria Eugenia Soto` (era "Nelcy Jaimes", vía overrides — el Link
  de Airtable no se tocó para no romper el guard RF-09) · N° interno `METLIFE -6283` y
  dirección completa `LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO`
  (estaban abreviados) · Rol `N°882-40` · Permiso `N°319 09/09/2020` · Recepción
  `N°210 18/07/2024` (formato exacto del XLSM).
- **13 terminales**: 20.125,86 · 802.913.431 · 9.246,94 · 8.907,06 · 8.517,68 · 13.081,81 ·
  16.603,84 · 36.300.000 · 806.666.667 · 39.894,61 · 5.024,86 · 249,91 · 16.610.203-0.
- **7 comparables** con UF/m²C homologados (34,05 · 35,19 · 35,71 · 31,45 · 31,82 · 25,18 ·
  22,99), totales UF, fechas `abr-26` y foja-número CBR `40132-55521`.
- **Cuadro de valoración** en orden XLSM (Terreno · Servidumbre · Piso 1 · Piscina · Quincho ·
  Cierros): 11.218,80 · 8.157,06 · 350,00 · 32,64 · factor 0,96.
- **Rentabilidad**: 3.300.000 · 4,5% · 8 A 10 MESES · 82,5% · 65 años.

## T4 — CI-057 + dólar: 12/12 PASS

| Check | Resultado |
|---|---|
| `-3%` (TASACIÓN V/S PROMEDIO ofertas; real −2,98%) | presente ✅ |
| `36%` (V/S CBR; real +35,52%) | presente ✅ |
| `161%` (bug viejo) | AUSENTE ✅ |
| Promedio ofertas `33,64` / CBR `24,08` | presentes ✅ |
| `30,91` (promedio combinado viejo) | AUSENTE ✅ |
| Dólar `890,33` | presente ✅ |
| Columna US$: 414.344 · 399.115 · 381.667 · 586.180 · 743.998 | presentes ✅ |

Raíz del bug (medida en Bloque 0): el ensamblador promediaba los 7 comparables juntos
(30,91) y usaba valor total ÷ sup. construcción (80,53 → 161%). El XLSM promedia POR BLOQUE
excluyendo ceros y usa UF/m² nuevo × depreciación (34,00 × 0,96 = 32,64). Fix aplicado en
`lib/informe/ensamblador.ts` + `lib/informe/fila-tasacion.ts` (`promedioSinCeros`), validado
además con las columnas independientes UF/m² Terreno (input manual 2,2 · 3,1 · 2,0 · 3,0 ·
2,0 · 2,7 · 1,8) vs UF/m² Construcción. El espejo del fix en el MOTOR (C_Formulas) quedó
**preparado y validado en seco, sin aplicar** — ver `fix-motor-preparado.md` (requiere
confirmación de Sergio de AT03 OFF).

## T3 — Hoja 3: 40/40 PASS

Exigencias (PRMS/OGUC) · Leyes (19537 SI) · Sector completo con % de uso de terrenos
(10/45/35) y arteria `Caletera Oriente Gral San Martín` · Terreno (5.024,86 · REGULAR ·
PLANO · NORTE · 29,95) · Emplazamiento · Características constructivas · Terminaciones ·
Servicios · Comodidades · Habitaciones (16 recintos · 4 dorm · 4 baños · 249,91 m²).

## T6 — Cadena real: 5/5 PASS

- E2 (5750023) aceptó el payload (HTTP 200) → render Carbone plantilla v2 (`517ddc62…`).
- E3 (5791413) descargó el render, subió a Dropbox y escribió Airtable:
  `pdf_final_url = https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO…pdf`,
  `estado = pdf_listo`, fila nueva `rec2iw3c9ft5d1TXR` en TX_DocumentosGenerados
  (`es_vigente = true`, `render_id_carbone` nuevo vs snapshot pre-corrida, `plantilla_version
  = PLANTILLA_MET_v2` tras el saneo de metadata).
- Saneo documentado en `rollback.md`: duplicado por reproceso de bundle viejo eliminado y
  vigencia única garantizada.
- Nota evidencia: Carbone borra cada render tras su primera descarga (la hizo E3 → GET
  posterior 404); `PDF_generado_VP0067_v2.pdf` es re-render del MISMO contexto
  (`contexto-corrida-v2.json`) contra la MISMA plantilla — el binario de la cadena vive en
  Dropbox.
