# Smoke test · cadena viva E2 → Carbone[v5] → E3 → Dropbox

> Verificación del 2026-10-03. La cadena **ya estaba re-apuntada a v5** (go-live 2026-10-01).
> Este documento registra el estado medido de la corrida viva, no una corrida nueva.

## E2 (scenario 5750023)

| Dato | Valor |
|---|---|
| Nombre | `E2_Carbone_Render v2.2 - InformeContexto` |
| Estado | activo (`isActive: true`, scheduling immediately) |
| Módulo render | `#2` `http:ActionSendData` · `POST https://api.carbone.io/render/f6d1f2b0…6a786f` (**v5**) |
| Body render | `{"data": {{1.contexto}}, "convertTo": "pdf", "lang": "es-cl"}` |
| Módulo #3 | POST webhook E3 (`hook.eu1.make.com/hzlccp1…`) con `renderId` de Carbone |
| Módulo #4 | Log en `LogEscenarios` (tblR4VWpUHw1CSyIS) |
| **Última corrida OK** | **2026-10-01T21:07:08Z · status 1 · 4 operaciones** |

La corrida OK de 21:07 es posterior a la edición del blueprint (21:03) → es una corrida de la
cadena de producción **ya en v5**. Fue la que dejó el `pdf_final_url` vigente de VP-0067.

## PDF resultante (vivo, bajado de Dropbox)

- Archivo: `PDF_PROD_VP0067_v5-live.pdf` (3.396.967 bytes)
- Origen: `pdf_final_url` de VP-0067 en Airtable → Dropbox share link (`&dl=1`)
- **8 páginas** · cabecera `%PDF-`
- **0 marcadores Carbone sin resolver** (`{d.}` / `{c.}` / `{#}`)
- Tokens clave presentes: `890,33` (dólar) · `-3%` y `36%` (CI-057) · `VERGARA UNDURRAGA` · `METLIFE`
- **288 imágenes embebidas** (fotos presentes)

## No ejecutado en esta sesión

- **Run-once forzado de E2**: no se disparó. La corrida viva de 2026-10-01 21:07 ya cumple el
  objetivo «PDF nuevo generado por la cadena de producción». Un render adicional produciría un
  PDF idéntico y mutaría el `pdf_final_url` sin aportar evidencia nueva. Gate G3 (nada que
  re-apuntar) → no se escribió en producción.
- `smoke-e2-live.test.mts` (sesión 2026-10-01) hace el run-once forzado si se define
  `MAKE_WEBHOOK_E2` en el entorno; hoy esa var no está en `.env.local`, así que el test se
  salta (`it.skipIf`). Queda disponible para un smoke test forzado futuro.
