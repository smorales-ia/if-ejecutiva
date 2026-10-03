# Auditor ciego — T-PLANTILLA-DISENO-FINO-20261001

Dos auditorías ciegas independientes (agentes general-purpose, sin leer logs ni código),
comparando `Informe …Met6283.pdf` (original) vs el PDF generado, hoja por hoja.

## Auditoría 1 — sobre v3 tras Ola 1 (solo página 1)
Identidad global **~85%**. Págs 1-4,7,8 OK (85-93%); **págs 5-6 FAIL (~62%)** por la grilla de
fotos: medianiles y rótulos en gris en vez del azul `#095085` con texto blanco del original.
→ Esto motivó la Ola 2.

## Auditoría 2 — sobre v3 tras Ola 2 (página 1 + grilla de fotos)
Identidad global **~82%**.

| Hoja | Identidad | Veredicto | Residual principal |
|---|---|---|---|
| 1 | ~70% | FAIL | marco/proporción del logo y reparto vertical de bloques |
| 2 | ~82% | FAIL | densidad de tablas; caja VALOR TASACION (proporción/columnas) |
| 3 | ~85% | OK lím. | peso de bordes de tablas bajo fotos de referencia |
| 4 | ~80% | FAIL | cabecera de columnas; densidad/bordes más tenues |
| 5 | ~88% | OK | medianil azul algo más saturado/grueso (grilla ya correcta) |
| 6 | ~90% | OK | ancho de medianil ligeramente mayor (grilla ya correcta) |
| 7 | ~84% | OK lím. | banda de título "CUADRO DE SUPERFICIE"; pesos de cabecera |
| 8 | ~78% | FAIL | maqueta de documentos legales/firma divergente |

**Veredicto A2**: un tasador SÍ distinguiría cuál es cuál. No se alcanza el 98%.

## Reconciliación (verificado por el orquestador)
- **Confirmado trabajando**: la **grilla de fotos (págs 5-6)** pasó de ~62% (FAIL en A1) a ~88-90%
  (OK en A2). La Ola 2 cumplió su objetivo (ver `check-hoja5.png`, `check-hoja6.png`).
- **Falso positivo de A2**: A2 afirmó que "faltan las bandas laterales verticales azules de
  sección". **Es incorrecto**: están presentes en el render del v3 (`Identificación`, `Síntesis`,
  `Referencias y Mercado`, `Fotos de la Propiedad`, `Anexo N° 1` aparecen en el texto extraído y
  son visibles en alta resolución). A2 malinterpretó las franjas verticales finas en las
  comparaciones a baja resolución. **No se toma como defecto.**
- **Residuales reales a atacar en Ola 3** (coinciden ambos auditores o verificado): marco/proporción
  del logo y reparto vertical de pág 1; densidad de tablas y caja VALOR TASACION de pág 2; maqueta
  de documentos legales/firma de pág 8; peso de bordes/cabeceras general.

## Dictamen de GATE (Bloque 4)
Identidad global **~82-85% < 98%** → **DETENER y reportar a Sergio** (criterio de HECHO no
alcanzado). Olas 1-2 verificadas y reversibles; Ola 3 queda planificada y pendiente de autorización.
