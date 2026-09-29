# Check de imágenes — PDF v2 vs referencia MET-6283

> 28-sep-2026 · fuente: `verificar.py` T2 (10/10 PASS) + revisión ocular de
> `comparacion-p*.png`. Las 35 ranuras del contrato §3.3 del plan van pobladas
> (0 rutas null en el contexto — cruce de 456 tags del docx, B-RECON).

Nota técnica: pymupdf reporta 36 objetos de imagen por página porque Carbone comparte el
diccionario de recursos entre páginas; la asignación por ranura se verificó ocularmente
página a página.

| Hoja (pág.) | Ranura | Presente |
|---|---|---|
| Portada (1) | Logo Value Property (embebido en plantilla) | ✅ |
| Hoja 1 (2) | Mapa "Ubicación/Empresa" (arriba-derecha) | ✅ |
| Hoja 1 (2) | Foto fachada | ✅ |
| Hoja 1 (2) | Firma María Eugenia Soto | ✅ |
| Hoja 2 (3) | Mapa de referencias (full-width, con marcadores) | ✅ |
| Hoja 2 (3) | Fotos referencias 1, 2 y 3 | ✅ ✅ ✅ |
| Hoja 3 (4) | — (sin imágenes por diseño) | ✅ (0) |
| Hoja 4 (5) | Grilla 2×4: Ubicación · Planificación (=plano) · Fachada · Sector · Living · Comedor · Cocina · Baño de visitas | ✅ ×8 con captions |
| Hoja 5 (6) | Grilla 2×4: Dormitorio Principal · Baño Principal · Dormitorio · Dormitorio · Sala de estar · Piscina · Terraza+Quincho · Fachada posterior (captions idénticos a la referencia, incluida la repetición "Dormitorio") | ✅ ×8 con captions |
| Anexo 1 (7) | Plano · Esquema superficies · Cuadro superficie · Planta emplazamiento · Foto aérea · Mapa SII · Info SII | ✅ ×7 |
| Anexo 2 (8) | Rol-avalúo · Permiso edificación · Escritura (Fojas 3312) · No expropiación · Recepción final · TGR | ✅ ×6 |

**Total: 35/35 ranuras con imagen** (33 desde el payload como data-URI pre-recortado al
aspecto de su ranura — `assets_met6283/render/`, dict CROPS — + logo embebido + plano
reutilizado en Hoja 4 "Planificación"). Sin placeholders `{d.` residuales.

Origen de los assets: extracción del PDF de referencia (34 embebidas + 1 render compuesto
del mapa de referencias), inventario en `docs/_artefactos/carbone/assets_met6283/MANIFEST.md`.
Para el flujo vivo (otras solicitudes), estas ranuras requieren columna/adjunto en Airtable —
lista en el cierre (el resolutor ya prioriza un adjunto Airtable con URL http(s) si existe).
