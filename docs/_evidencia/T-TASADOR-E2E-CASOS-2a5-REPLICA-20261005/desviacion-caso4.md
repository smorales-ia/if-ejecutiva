# DESVIACIÓN vs PROMEDIO DE LA MUESTRA · CASO 4 (HIPOTECARIA SECURITY -6073) · 2026-10-05

Tasación: **33,0917 UF/m²** (BD59 del cuadro: 1.072,17 UF / 32,4 m²).

| Bloque | Promedio muestra UF/m² | Tasación vs promedio | Oráculo (celda) | Motor/ensamblador | OK |
|---|---|---|---|---|---|
| REF. OFERTAS (5) | 38,86906053021876 | **−14,86%** | Portada AX34 / AX36 = −0.148637… | −14.863734252235028 (ensamblador por bloque) | ✅ idéntico |
| REF. C.B.R. (1) | 29,62962962962963 | **+11,68%** | Portada AX42 / AX44 = +0.116844… | +11.684375000000014 (ensamblador por bloque) | ✅ idéntico |

El PDF renderizado imprime **−15% / +12%** — los mismos redondeos que el PDF oráculo.

Nota (repetida del Caso 2): las filas `desviacion_vs_promedio_*` que escribe el AT03
**desplegado** valen 0 y su `promedio_uf_m2_muestra` es el combinado (37,3292 sobre
los 6 comparables) — el desplegado es pre-v32-b1 (CI-057). El dato correcto por
bloque lo produce el ensamblador desde TX_Comparables y es el que llega al PDF.

## Hallazgo de modelo: Cliente ≠ Propietaria no cabe en el contexto del informe

Único punto donde el espejo NO puede ser perfecto por diseño actual:

- El oráculo distingue **Cliente/solicitante** (PATRICIO ADRIAN TORO NIEVAS ·
  13.918.055-0, FICHA K17/K18) de **Propietaria** (IRMA ELENA ALZAMORA RIVEROS ·
  7.922.771-4, FICHA K21/K22), y su PDF imprime ambos en la Hoja 1 (filas
  "Cliente" y "Propietario").
- El `InformeContexto` tiene **un solo slot** (`partes.propietario` ←
  `TX_Solicitudes.cliente_final_nombre`; `construirInformeContexto` nunca lee
  `TX_DatosTasacion.propietario_nombre`). Los Casos 1–2 no lo expusieron porque
  cliente = propietario en ambos.
- Decisión tomada: `cliente_final_nombre/rut` = el solicitante (lo que el PDF
  oráculo imprime en portada y en la fila Cliente), y la propietaria real quedó
  almacenada en `TX_DatosTasacion.propietario_nombre/propietario_rut`
  (recBudYOKVXICjewg) para no perder el dato.
- Consecuencia en el PDF espejo: la fila Propietario muestra al solicitante en vez
  de IRMA ELENA ALZAMORA RIVEROS. **Gap de modelo/plantilla** (candidato: segundo
  slot `partes.solicitante` + lectura de `propietario_nombre` en el ensamblador +
  campo en plantilla v5). No se tocó código ni plantilla (prohibido en esta tanda).
