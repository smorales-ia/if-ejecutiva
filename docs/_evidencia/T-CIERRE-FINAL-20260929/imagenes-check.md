# Check de imágenes — PDF v3 (29-sep-2026)

> Fuente: `verificar.py` T2 (10/10 PASS sobre v3) + hecho medido en esta corrida:
> **páginas 2–8 de v3 son idénticas a v2 al 0,0% de pixel-diff** (solo cambió la
> portada, y solo en espaciado). Por lo tanto el inventario ranura-por-ranura de
> `docs/_evidencia/T-PDF-IDENTICO-20260927/imagenes-check.md` (35/35 verificado
> ocularmente) sigue vigente íntegro para v3.

- **35/35 ranuras con imagen**: logo embebido (portada) + 33 data-URI del payload +
  plano reutilizado en Hoja 4 "Planificación". El contexto real trae 37 data-URI
  (33 ranuras + firma + composiciones auxiliares del contrato §3.3).
- Sin placeholders `{d.` residuales en el texto del PDF (T2 PASS).
- pymupdf reporta 36 objetos de imagen por página (recursos compartidos por Carbone);
  la completitud por ranura es la verificación que vale, y es la heredada + T2.
- Genericidad de las ranuras: para una solicitud ≠ VP-2026-0067 ninguna ranura sirve
  assets de MET-6283 (gate `ASSETS_POR_CODIGO` — ver `genericidad-check.md`).
