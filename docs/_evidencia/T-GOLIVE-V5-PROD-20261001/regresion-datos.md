# Regresión datos · VP-0067 (go-live v5)

Verificación de datos sobre el PDF vivo de producción (`PDF_PROD_VP0067_v5-live.pdf`).

| Chequeo (regresión T-PDF-IDENTICO-20260927) | Esperado | Medido | Resultado |
|---|---|---|---|
| Dólar observado | `890,33` | presente (`1US$ = $ 890,33`) | ✅ |
| CI-057 variación | `-3%` | presente | ✅ |
| CI-057 segundo valor | `36%` | presente | ✅ |
| UF | `39.894,61` | presente (`1UF = $ 39.894,61`) | ✅ |
| Propietario | VERGARA UNDURRAGA | presente | ✅ |
| Cliente/producto | METLIFE | presente | ✅ |
| Marcadores sin resolver | 0 | 0 (`{d.}`/`{c.}`/`{#}`) | ✅ |
| Páginas | 8 | 8 | ✅ |

Datos intactos: el re-apunte a v5 sólo cambió la plantilla de render, no los datos del
contexto. **Sin regresión.**
