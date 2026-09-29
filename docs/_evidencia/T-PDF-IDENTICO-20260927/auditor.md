# DICTAMEN DE AUDITORÍA CIEGA — T-PDF-IDENTICO-20260927

> Auditor independiente (agente sin contexto de la tanda), 29-sep-2026 (UTC).
> Re-corrió `verificar.py`, consultó Airtable REST y Make API en vivo, y
> renderizó ambos PDFs (100–200 dpi) para comparación ocular página a página.

## 1. OK/FAIL por criterio (medido por el auditor)

| Criterio | Veredicto | Evidencia numérica medida por el auditor |
|---|---|---|
| T0-PAG | **OK** | Ambos PDFs: 8 páginas, mismo tamaño carta |
| T1-DATOS | **OK** | 55/55 literales (terminales, los 4 corregidos, 7 comparables homologados, cuadro, rentabilidad) |
| T2-IMG | **OK con reserva** | 9/9 PASS, sin `{d.` residuales. Reserva: pymupdf reporta 36 objetos compartidos por página (recursos comunes) → los mínimos pasan trivialmente; la completitud la sostiene la revisión ocular: **35/35 ranuras confirmadas visualmente** (8+8 grillas, 7 Anexo 1, 6 Anexo 2 incl. escritura) |
| T3-HOJA3 | **OK** | 40/40 en pág. 4 + Comodidades 16/16 y Ampliaciones verificadas |
| T4-CI057 | **OK** | 12/12: `-3%` y `36%` presentes; `161%` y `30,91` ausentes; 33,64 · 24,08 · 890,33 · 5 US$ presentes |
| T5-VISUAL | **OK con 1 excepción** | p1 20,3% · **p2 42,0% FAIL** · p3 19,5% · p4 26,3% · p5 24,6% · p6 28,5% · p7 26,2% · p8 31,0% (el auditor midió también p5/p6, que el script omite: habrían pasado) |
| T6-CADENA | **OK** | PDF 3.396.964 bytes. Airtable en vivo: `estado=pdf_listo`, `pdf_final_url` dropbox.com, exactamente 1 fila vigente (`rec2iw3c9ft5d1TXR`, `plantilla_version=PLANTILLA_MET_v2`, render_id nuevo ≠ snapshot pre). Make: E2 y E3 **isActive:true** con ejecuciones status=1 (29-sep 02:40–02:43 UTC). `CARBONE_TEMPLATE_ID` coincide con el blueprint VIVO de E2 |

**Batería reproducida: 127/128 PASS** — idéntico a `tests-output.txt`.

## 2. Visual hoja por hoja

| Pág. | Veredicto | Detalle |
|---|---|---|
| 1 Portada | diferencia menor | compactada hacia arriba; logo sin marco fino; espacio antes de ":" |
| 2 Hoja 1 | diferencia notoria (solo densidad) | todos los bloques presentes en el mismo orden y con los mismos números (verificado por cuartos a 200 dpi); la referencia comprime más filas por cm. Datos idénticos |
| 3 Hoja 2 | diferencia menor | mapa idéntico + 3 fotos; fichas en tabla continua, no pegadas a cada foto |
| 4 Hoja 3 | diferencia menor | contenido completo; termina ~1/3 más arriba; cabeceras de Ampliaciones distintas (ambas vacías de datos) |
| 5-6 Hojas 4-5 | diferencia menor | mismas 8+8 fotos, captions textuales IDÉNTICOS (incl. "Dormitorio / Dormitorio"); solo espaciado |
| 7 Anexo 1 | diferencia menor | 7 elementos presentes; plano algo más pequeño |
| 8 Anexo 2 | diferencia menor | 6 escaneados en la misma disposición; proporciones levemente distintas |

Ninguna página tiene diferencia de datos ni de imágenes.

## 3. % DE IGUALDAD: **95%**

Datos ≈ 100% · Imágenes ≈ 98% · Diseño ≈ 85%. Diferencias residuales exactas:
1. Densidad vertical de la Hoja 1 (p2, 42% pixel-diff) — bloques desplazados, misma información.
2. Portada: logo sin marco fino; distribución compactada; espacio antes de ":".
3. Hoja 2: fichas en tabla continua.
4. Hoja 3: termina más arriba; cabeceras de Ampliaciones distintas (sin datos afectados).
5. Anexo 1: plano más pequeño.
6. Márgenes ligeramente mayores en las grillas de fotos.

## 4. Evidencia escrita vs medido

- `tests-output.txt`, `regresion.md`, `diseno-checklist.md`: EXACTOS a la re-medición.
- `imagenes-check.md` decía "Dormitorio A · Dormitorio B": impreciso a favor del PDF (los
  captions reales son "Dormitorio / Dormitorio", igual que la referencia). **Corregido.**
- `verificar.py` T5 excluye p5/p6 del guardarraíl: desviación metodológica sin ocultamiento
  (24,6% y 28,5%, habrían pasado).
- T2 es un check débil por los recursos compartidos; la completitud real descansa en lo
  ocular, confirmado por el auditor.
- El binario de evidencia es un re-render del mismo contexto/plantilla (Carbone borra el
  render tras la descarga de E3); la cadena real está probada por logs Make (status 1) y
  escrituras Airtable con render_id nuevo. Declarado honestamente en `regresion.md`.
- `pdf_final_url` exige login Dropbox (share-link público pendiente de Reauthorize).

**Conclusión**: objetivo "idéntico en datos e imágenes" cumplido; en diseño es un gemelo
claramente reconocible con drift de densidad concentrado en Hoja 1. **Igualdad global: 95%.**
