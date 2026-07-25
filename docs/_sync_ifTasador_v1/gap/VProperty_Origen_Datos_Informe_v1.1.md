# Ficha de brecha — `VProperty_Origen_Datos_Informe_v1.1.md`

- **Familia** — J → reclasificado como fuente canónica (§6.3 del prompt la trata como documento hermano)
- **Ruta** — `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md`
- **Última modificación** — 2026-07-23 · `03e8053` · 1126 líneas
- **Versión declarada** — v1.1 *(el prompt asumía v1.0 — ver C-2)*
- **Decisión** — **ACTUALIZAR** (alcance mínimo) + **VERIFICAR** las 8 secciones canónicas
- **Prioridad** — **P2**

---

## Corrección de clasificación

En `01_clasificacion.md` este archivo quedó sin familia asignada (aparecía sólo en el top-10).
Se corrige aquí: §6.3 del prompt lo lista explícitamente entre los documentos hermanos cuya
coherencia debe verificarse (*"Origen de Datos del Informe v1.0 — 8 secciones canónicas del
informe (orden móvil §2.10)"*).

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `SC15` | 1 | 1034 | ❌ marcar retirado |
| `WhatsApp` | 2 | 461, 467 | ✅ **falso positivo** — canal de origen |
| `capturada` / `devuelta` / `Enviar visita` | 0 | — | ✅ |

## Verificación requerida — las 8 secciones canónicas

§2.10 del spec (1761–1772) fija el **orden canónico para lectura móvil** del preview del
informe (Decisión §8.2 del ADR):

1. Cabecera · 2. Valor de tasación destacado · 3. Antecedentes de la propiedad ·
4. Datos SII / avalúo · 5. Cuadro de valoración · 6. Comparables · 7. Registro fotográfico ·
8. Observaciones y overrides

§2.8 (1707) declara además que las siete secciones colapsables de la Pantalla 5 están
*"alineadas con Origen de Datos del Informe v1.0 §3.3"* — **cita a v1.0, no a v1.1**.

### Resultado de la verificación — **EJECUTADA 25-jul-2026 · el contrato se mantiene** ✅

Decisión del Checkpoint #2: verificar antes de Fase 3. Hecho.

**§3.3 de v1.1 (línea 482) contiene exactamente siete secciones**, tal como afirma §2.8 del spec:

| # | Sección de §3.3 v1.1 | Línea |
|---|---|---|
| 1 | Datos de la propiedad | 489 |
| 2 | Fotos obligatorias | 544 |
| 3 | Cuadro de valoración granular E1 (`TX_ItemsCuadroValoracion`) | 557 |
| 4 | Comparables E2 (`TX_Comparables`) | 597 |
| 5 | Ampliaciones / Programa por nivel / Terminaciones por recinto | 639 |
| 6 | Documentos legales (`TX_DocumentosLegales`) | 672 |
| 7 | Overrides (CU-007) | 677 |

*(más un bloque "Notas libres del tasador" en 684, que no cuenta como sección de captura)*

**Tres confirmaciones cruzadas adicionales:**

1. **RF-TAS-06 · separación fotos ↔ documentos.** La Sección 2 (Fotos obligatorias, 544–555)
   enumera 22 categorías —Fachada, Ubicación, Sector, Living, Comedor, Cocina, Baño,
   Dormitorios, Pasillo, Logia, Puerta de acceso, Bodega, Terraza, Espacio lavadora y áreas
   comunes— y **ninguna es "Documentos"**. Los documentos legales viven en la Sección 6,
   descrita como *"captura manual de respaldo"*. **v1.1 ya es consistente con §2.6 del spec**;
   la categoría "Documentos" que §2.14 manda eliminar no existe aquí.
2. **§2.8 · grilla de comparables.** Los nombres de campo de la Sección 4 coinciden con las
   columnas de §2.8: `direccion`, `anio`, `precio_uf`, `sup_terreno_m2`, `sup_construccion_m2`,
   `oo_cc_uf`, `tipo_referencia` (Oferta · CBR), `fecha_publicacion`. También coincide el
   rango **mínimo 3, hasta 10** con RF-12. §2.8 añade columnas de UI (`uf_m2`, `factor_sup`,
   `factor_edad`, `factor_distancia`, `foja`, `numero`, `telefono_contacto`) — mayor
   granularidad de la grilla, no divergencia de contrato.
3. **§2.10 · las 8 secciones del informe** son un artefacto distinto de las 7 de captura:
   el preview antepone *Cabecera* y *Valor de tasación destacado*, que no son campos que el
   tasador ingrese. No hay conflicto entre "7 secciones de captura" y "8 secciones del informe".

**Conclusión.** La única corrección necesaria es la **cita de versión: v1.0 → v1.1**.
El contrato de §3.3 está intacto. Se agrega como **quinta edición interna de v1.9.4**,
ahora sí como corrección firme y no como pendiente de verificación.

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| 1034 | *"(**SC15**) junto con la UF"* → marcar **retirado**; el cruce Mindicador → valor UF se resuelve como automatización Airtable AT08 o similar | §2.11 (1838) | INT |
| §3.3 · secciones del informe | **Verificar** correspondencia con el orden móvil de §2.10 y con las 7 secciones de captura de §2.8. Documentar el resultado; si divergen, el spec v1.9.4 debe citar v1.1 §3.3 con el mapeo correcto | §2.8 (1707) · §2.10 (1761–1772) | PM + UX + EA |
| 461, 467 | **No tocar.** `WhatsApp` como canal de origen (`WhatsApp/Email/Teléfono/Presencial/Otro`) | — (falso positivo C-6) | — |

## Riesgo detectado — **resuelto**

El spec v1.9.3 cita **"Origen de Datos del Informe v1.0"** cuando el repo tiene **v1.1**
(§2.8 línea 1707 y §6.3 del prompt). Es la misma clase de deriva de versión que C-2, pero
**dentro del spec**, no del prompt.

Verificado el 25-jul-2026: v1.1 §3.3 conserva las siete secciones y el contrato de campos.
**Corrección firme para v1.9.4** — actualizar la cita de `v1.0 §3.3` a `v1.1 §3.3` en la
línea 1707. Sin cambios de contenido asociados.
