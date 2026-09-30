# REGRESIÓN · T-VP0067-IMAGENES-UI-20260930

- **Suite completa**: `pnpm test` → **1054 passed | 3 skipped** (antes de la tanda: 1028 — los
  +26 son los tests nuevos de A/B/C; cero rotos). `pnpm build` limpio (el warning NFT de
  `readFileSync` es preexistente del fallback de T-PDF-IDENTICO). `pnpm typecheck` limpio.
- **/lectura de VP-0067**: 24 adjuntos (8 documentos + 16 fotos), **todos en estado terminal**
  (`listo`), fotos sin `no_extraidos` y sin `clave_adjunto` → `completo: true`, cero naranjos
  nuevos, no se dispara RF-09. Los naranjos honestos de la tanda LECTURA-FIX quedan igual.
- **Datos del informe**: ningún campo de las 8 filas preexistentes ni de `TX_Solicitudes` fue
  tocado (la siembra solo CREÓ filas). REF. C.B.R., overrides y terna 13291/21565/2006
  intactos — el contexto de la OLA 2 los trae correctos (mismo `canonico`, ahora sin peso de
  thumbnails pero con la MISMA forma: clave `thumbnailUrl` presente en null).
- **PDF/produccion**: `pdf_final_url` y `TX_DocumentosGenerados` sin cambios (el render de
  validación fue por Carbone API directa). E3 sigue como estaba (detenido — preexistente).
- **Botones Descargar PDF / Ver expediente**: sin cambios de código en sus rutas; el guard y
  `generar-pdf` intactos salvo el peso del contexto (menor que antes: 3,62 MB vs 4,71 MB).
- **Screenshot vista-informe.png**: NO producible headless (Clerk sin usuario de prueba
  automatizable y sin navegador en el entorno WSL). Sustituto: réplica exacta del cálculo de
  la vista sobre los datos reales (correlacion.md) — verificación visual queda para Sergio
  (login nutricionsaludketo@gmail.com).
