# REGRESIÓN · CASO 3 (ALH -335) · espejo VÍA MOTOR · 2026-10-05

**Solicitud sandbox:** `recE1LwwH2xbcCHti` · `VP-2026-0075` · `numero_solicitud="ALH -335"` ·
estado final **`calculada`** (transicionado por AT03, no a mano) · regla aplicada por AT01:
`rec2QYP8yjMW1Smsm` (REGLA_REFI_DEPTO_V32, set de 13 terminales v32 + promedios).
**TX_Calculos: 17 filas escritas por el motor** (evento `at03_dag_completo`
"[COD=VP-2026-0075] AT03_v31 EJECUTOR 17/17 OK" en A_Eventos; cero aborts H3/H5/H6/H7;
calculada + 17 filas ya en el **primer poll** a los 10 s).

Se sembraron solo ENTRADAS (1 solicitud + 1 datosTasacion + 1 item del cuadro +
**5 comparables (5 Ofertas + 0 CBR — REF.CBR vacía en el oráculo, hueco ⚠ del PLAN §5)** +
5 habitaciones + 1 doc legal + 16 fotos + H_PreciosUF 2026-05-07) y el motor produjo las salidas.

## Auditoría dato-por-dato (contexto in-process `construirInformeContexto` vs oráculo XLSM/PDF)

Resultado: **37/37 PASS = 100% igualdad** (`caso3-audit.json`). Terminales leídos de las filas
que escribió AT03.

| Check | Esperado (oráculo) | Obtenido (motor/ensamblador) | Delta | OK |
|---|---|---|---|---|
| Nº interno | ALH -335 (FICHA F8+H8 · Portada BH2) | ALH -335 | 0 | ✅ |
| Cliente | Austral Leasing Habitacional | Austral Leasing Habitacional | 0 | ✅ |
| Nombre Cliente (portada) · RUT | Miguenson Rameau · 9.588.043-6 | idem | 0 | ✅ (propietario real Víctor L. González Moreno queda en TX_DatosTasacion — ver overrides §4) |
| Comuna / Tipo | Quilicura / Departamento | idem | 0 | ✅ |
| Rol SII | 658-128 | 658-128 | 0 | ✅ |
| Sup. construcción | 40 m² | 40 | 0 | ✅ |
| Año construcción | 1994 (AE8/T51) | 1994 | 0 | ✅ |
| Vida útil | 40 (BJ37) | 40 | 0 | ✅ |
| Valor comercial UF (Portada AP69) | 1.024 | 1024 | 0 | ✅ |
| Valor comercial CLP (AY69) | 41.178.572,8 | 41178572.8 | 0 | ✅ |
| Valor reposición UF (BG72) | 1.024 | 1024 | 0 | ✅ (vía `valor_reposicion_override` — mismo gap del Caso 2, ver overrides-caso3.md) |
| Valor reposición CLP (BL72) | 41.178.572,8 | 41178572.8 | 0 | ✅ |
| Seguro incendio UF (BG73 · DB51=1.0) | 1.024 | 1024 | 0 | ✅ (SIN override: sale de `valor_seguro_item_uf` del cuadro) |
| Seguro incendio CLP (BL73) | 41.178.572,8 | 41178572.8 | 0 | ✅ |
| Avalúo fiscal UF (BG74) | 411,5816 | 411.5815728319754 | 0 | ✅ |
| Valor remate UF (BG77 · 0.65) | 665,6 | 665.6 | 0 | ✅ |
| Valor remate CLP (BL77) | 26.766.072,32 | 26766072.32 | 0 | ✅ |
| Liquidación UF (BG78 · 0.825) | 844,8 | 844.8 | 0 | ✅ |
| Liquidación CLP (BL78) | 33.972.322,56 | 33972322.559999995 | 0 | ✅ |
| UF día (AQ71) | 40.213,45 | 40213.45 | 0 | ✅ |
| Dólar día (BO71) | 892,83 | 892.83 | 0 | ✅ |
| Cuadro total UF | 1.024 | 1024 | 0 | ✅ (40 m² × 32 UF/m² nuevo × D.F. 0.8 = 25,6 aplicado) |
| Renta perpetua (BJ44 · tasa 4,5%) | 48.888.888,89 | 48888888.88888889 | 0 | ✅ (tasa 0.045 del canónico M_Clientes = oráculo, sin override) |
| Ingreso líquido anual (BJ43) | 2.200.000 | 2200000 | 0 | ✅ |
| Promedio UF/m² ofertas (AX34) | 27,5435 | 27.543461538461543 | 0 | ✅ |
| Ajuste ofertas (AX36) | −7,06% | −7.0560 | ~0 | ✅ |
| Promedio UF/m² CBR (AX42) | 0 (REF.CBR vacía) | 0 | 0 | ✅ |
| Ajuste CBR (AX44) | 0 (REF.CBR vacía) | 0 | 0 | ✅ |
| Filas CBR | 0 | 0 | 0 | ✅ |
| Nº comparables | 5 (5 Of + 0 CBR) | 5 | 0 | ✅ |
| Fotos grilla / ranuras | 16 · fachada/ref1/mapaUbicacion | 16 · set | 0 | ✅ |

## PDF (render directo Carbone v5, patrón probado de los Casos 1-2)

- `pdf-caso3.pdf` · **10 páginas** · 709 KB · **0 marcadores `{d.}` sin resolver**.
- Valores clave presentes en el texto: ALH -335, Austral Leasing Habitacional, Miguenson
  Rameau, 9.588.043-6, Caspana, Quilicura, 658-128, 1.024 / 41.178.573 (redondeo CLP del
  propio informe; PLAN §5 también dice $41.178.573) / 844,8 / 665,6 / 48.888.889 /
  2.200.000, UF 40.213,45, US$ 892,83, las 5 ofertas (Toconce 551, Socoroma 580, M.A.
  Matta, Las Violetas, San Enrique), **"TASACION V/S PROMEDIO −7%"** (idéntico al PDF
  oráculo) y **bloque CBR vacío** (como el oráculo: AX42/AX44=0).
- ⚠ **10 pp vs 8 pp del oráculo**: mismo spill de layout de la sección de fotos ya
  documentado en Casos 1 (18 fotos → 11 pp) y 2 (16 → 11 pp); aquí 16 fotos → 10 pp.
  Es la plantilla v5, no el contenido: sistémico, no se arregla en esta tanda.
- Hallazgo menor sistémico: la celda **"Zona"** de Hoja 1 sale vacía aunque
  `tipo_zona_descripcion="PRMS (Quilicura)"` viaja en el contexto
  (`propiedad.tipoZonaDescripcion`) — igual en el Caso 2 (su "IPC (Estación Central)"
  tampoco se imprimió). La plantilla v5 no mapea ese tag; no se toca la plantilla.
- Cadena E2→E3: E2 aceptó el payload (webhook 200) pero E3 no escribió `pdf_final_url`
  en la ventana de 3 min — **igual que Casos 1-2**. No bloqueante: el render directo es
  el espejo. No se tocaron escenarios Make.

## Visibilidad UI (paso 9)

- Asignada a **nutricionsaludketo** (`recTJcV3BIvdcG4em`) desde el alta; visador Héctor
  Martínez C.; estado `calculada` → `informeDisponible` ✓ (V4/V5/V6 sin `pdfUrl` → V6 cae
  a `window.print()`, hueco conocido PLAN §4).
- URL informe (producción): `https://if-ejecutiva-production.up.railway.app/tasaciones/recE1LwwH2xbcCHti/informe`
  (sin sesión responde 404 — mismo comportamiento que la URL del Caso 2 ya validado:
  guard Clerk/ownership; con la cuenta nutricionsaludketo es visible).
