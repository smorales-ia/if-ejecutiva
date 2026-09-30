# PDF — verificación de imágenes · T-VP0067-IMAGENES-UI-20260930

> OLA 2. Render REAL vía Carbone API directa (misma plantilla `CARBONE_TEMPLATE_ID` v2 que usa
> E2, carbone-version 4, `convertTo: pdf`), con el contexto ensamblado por el **código nuevo**
> (`construirInformeContexto`) contra los **datos sembrados en producción**. Sin Make, sin
> escribir `pdf_final_url` (E3 sigue detenido — paso manual de Sergio). PDF adjunto:
> [`vp67-render-imagenes.pdf`](vp67-render-imagenes.pdf) (2.858 KB, 8 páginas).

## Contexto ensamblado (fuente del render)

- Grilla `d.fotos.fotos[]`: **16/16 desde el origen único** (las filas sembradas de
  `TX_Adjuntos`): fuente = data-URI del contrato §4, caption = label de `CATEGORIAS_FOTO`
  (+ custom "Planificación"), orden 0-15 respetado. **Cero fotos desde el fallback repo.**
- Ranuras fijas `d.imagenes.*`: **20/20 pobladas** (siguen del fallback espejo — transitorio
  documentado en plan §3: sin códigos `D_TipoDocumento` ni lectura Dropbox no hay origen
  por-solicitud para mapas/anexos/firma).
- Peso del contexto: **3,62 MB < 5 MB** (límite del webhook Make). Durante la OLA 2 se detectó
  y corrigió una triplicación del data-URI (6,19 MB): la grilla re-emitía `thumbnailUrl` junto a
  `url` y `canonico` re-embebía el bloque 7 con thumbnails — fix en `imagenes.ts` (forma
  explícita sin `...f`) y `ensamblador.ts` (`aligerarCanonico`).

## PDF resultante (pymupdf)

| Página | Imágenes colocadas | Esperado (oráculo MET-6283) |
|---|---|---|
| 1 Portada | 1 (logo estático) | 1 ✅ |
| 2 Hoja 1 | 3 (mapa, fachada, firma) | 3 ✅ |
| 3 Hoja 2 | 4 (mapa refs + 3 refs) | 4 ✅ |
| 4 Hoja 3 | 0 | 0 ✅ |
| 5 Hoja 4 | 8 (grilla 0-7) | 8 ✅ |
| 6 Hoja 5 | 8 (grilla 8-15) | 8 ✅ |
| 7 Anexo 1 | 7 | 7 ✅ |
| 8 Anexo 2 | 6 | 6 ✅ |
| **Total** | **37 (36 ranuras + logo)** | **37 ✅** |

Inspección visual de las páginas 5-6 (render a PNG): la grilla muestra mapa, plano
"Planificación", fachada, sector, living, comedor, cocina, baños, dormitorios, sala de estar,
piscina, terraza+quincho y fachada posterior — **las mismas imágenes del gold master**, ahora
salidas del origen único. Nota de espejo: los captions de la grilla ahora son los labels
genéricos de la UI ("Fachada / Exterior", "Habitaciones"…) en lugar de los textos por-foto del
gold master ("Sector", "Dormitorio principal"…) — consecuencia deliberada del contrato genérico
(las categorías salen de la definición de la UI, no de strings hardcodeados).

## Cómo re-emitir el PDF oficial (cuando Sergio reactive E3)

El botón de la UI dispara `POST /api/tasaciones/[id]/generar-pdf` → E2 (activo) → E3
(hoy detenido con cola; además el módulo share-link no tolera re-render del mismo path — 409).
Con el código nuevo desplegado, esa cadena producirá este mismo PDF.
