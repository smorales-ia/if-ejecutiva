# Regresión fotos · VP-0067 (go-live v5)

Verificación sobre el PDF vivo de producción (`PDF_PROD_VP0067_v5-live.pdf`, bajado de Dropbox).

- **288 imágenes embebidas** detectadas en el PDF (pymupdf `page.get_images`).
- El render v5 incluye las fotos del informe → **sin regresión** respecto a
  T-VP0067-IMAGENES-UI-20260930.
- El PDF es el que produjo la cadena de producción (E2 corrida OK 2026-10-01 21:07), no el
  motor local.

Nota: el conteo del **Registro Fotográfico en la UI** (que no debe volver a 0, regresión de
T-VP0067-IMAGENES-UI-20260930) es una verificación de la vista web y requiere sesión Clerk
interactiva — queda como test manual (ver CIERRE §4).
