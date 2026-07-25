# 00 · Inventario del repositorio — Fase 0

**Fecha de ejecución** — 25-jul-2026
**Rama** — `main`
**HEAD** — `d4180c0` (*actualizacion doc y sc de edicion y crear solicitud*)
**Insumo autoritativo** — `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` §2 (líneas 1574–1953)
**Alcance de esta fase** — sólo lectura. Ningún archivo del repo fue modificado.

---

## 0.1 Corrección de ruta del insumo

El prompt de sincronización indica `docs/spec/VProperty_Especificacion_Proyecto_v1_9_3.md`.
Ese directorio **no existe**. La ruta real es:

```
docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md   (4977 líneas · untracked)
```

Toda la documentación canónica del proyecto vive bajo `docs/_md/`.

---

## 0.2 Estado git de partida

```
 D docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md      ← borrado en working tree, recuperable desde HEAD (5001 líneas)
 D docs/make/SC01_crear_solicitud.blueprint.json
 D docs/make/modificado/SC-Edicion_-_Edicion_de_solicitud_blueprint.json
 D docs/make/modificado/SC01_-_Crear_solicitud_blueprint.json
 D docs/make/originales/SC-Edicion_-_Edicion_de_solicitud_blueprint.json
 D docs/make/originales/SC01_-_Crear_solicitud_blueprint.json
?? docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md
?? docs/make/SC01_-_Crear_solicitud_blueprint.json
```

Últimos 20 commits:

```
d4180c0 actualizacion doc y sc de edicion y crear  solicitud
59d86e0 schema v1.9: resolución de 5 conflictos (tanda schema Consola Ejecutiva)
03e8053 Sync: TX_Comparables (crear 7 campos faltantes) y Blueprint RF-44 (tablas D_ deprecadas)
a0dd566 Sync docs con schema real Airtable: D_TipoDocumento y TX_Comparables
f73bda2 feat(p9): deploy y validación P9 — código listo, acciones externas pendientes
be2737b P8: Sheet Documentos y Adjuntos verificado + fix RN-59 (readOnly desde detalle)
a0740fc P7: Diálogo asignación cableado a endpoint real + estado optimista + toast §6
2ebe709 P6: Panel detalle verificado + fix RN-48 (avaluoTotal = suma de unidades)
8d383d6 P5: Panel lista URL-driven + enum Vista reconciliado + filtros/búsqueda/orden server-side
6aa1f76 P4: REGLA B + scroll al resumen + wording canónico + mensajes §6 restaurados
a4ad1e1 P3: Wizard 3 fases + AlertDialogs "sin documentos" y "descartar en curso"
690a5a4 P2: 4 rutas API + PATCH + validador REGLA B
7e05667 P1: Types v1.9 en lib/console-data.ts
22f1b74 P0: Inventario IF-02 alineado al Plan v1.9
7934646 docs: agrega plan maestro de ejecución IF-02 v1.3
c379b98 docs: alineamiento v1.9 con reglas implementadas IF-02 y nuevas versiones _md
c99f5ab docs: alineamiento v1.9 + plan IF-02 + tipos base y validadores
1b9435e actualiza archivos automatizaciones lectura doc al 18-07-2026
ad90d42 actualizar consistencia en doc al 18-07-2026
dc20c7e SC-RF09 blueprint al 14-07-2026
```

---

## 0.3 Inventario documental completo

40 archivos `.md` · 0 `.mdx` · 0 `.html` · 0 `.docx`.

```
./CLAUDE.md
./README.md
./docs/_archivo/aprendizajes-20260722-1934-P0.md
./docs/_archivo/aprendizajes-20260722-1946-P1.md
./docs/_archivo/aprendizajes-20260722-2013-P2.md
./docs/_archivo/aprendizajes-20260722-2052-P3.md
./docs/_archivo/aprendizajes-20260722-2119-P4.md
./docs/_archivo/aprendizajes-20260722-2159-P5.md
./docs/_archivo/aprendizajes-20260722-2208-P6.md
./docs/_archivo/aprendizajes-20260722-2223-P7.md
./docs/_archivo/aprendizajes-20260722-2232-P8.md
./docs/_archivo/aprendizajes-20260722-2308-P9.md
./docs/_archivo/aprendizajes_20260714.md
./docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md
./docs/_md/VProperty_Blueprint_Interfaces_v2_9.md
./docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md
./docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md
./docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md
./docs/_md/VProperty_Origen_Datos_Informe_v1.1.md
./docs/_notas/checklist-P9-manual.md
./docs/_notas/inventario-if02.md
./docs/_notas/plan-ejecucion-if02-v1_9.md
./docs/_notas/snapshot-P1.md … snapshot-P9.md            (9 archivos)
./docs/_notas/snapshot_20260724_1639.md
./docs/_notas/snapshot_20260724_1649.md
./docs/_notas/snapshot_20260724_1704.md
./docs/_notas/snapshot_20260724_1710.md
./docs/aprendizajes.md
./docs/construccion.md
./docs/diseno.md
./docs/make/SC-RF09-ExtraccionClaude_import_instrucciones.md
./docs/schema-airtable.md
```

---

## 0.4 Hallazgo crítico A — §2 ya está reescrita dentro del propio v1.9.3

El bloque `# 2. Interfaz Tasador` del archivo v1.9.3 (líneas 1574–1953) **ya contiene**
la versión nueva: RF-TAS-01..10, `TX_CoordinacionVisita`, máquina de estados oficial,
botón "Calcular Tasación", organizador de fotos sin categoría "Documentos", tabla de
automatizaciones con SC08/SC09 y la tabla §2.14.

Consecuencia para el plan: **la Fase 3 no reescribe §2**. El trabajo real es propagar
§2 hacia (a) el resto del propio archivo v1.9.3 y (b) los cinco documentos canónicos
hermanos y los documentos operativos.

## 0.5 Hallazgo crítico B — las ediciones §2.14 que apuntan a §1 y §4 del spec NO están aplicadas

La tabla §2.14 lista once filas. Tres de ellas apuntan a secciones del **mismo archivo**
fuera de §2, y ninguna está aplicada:

| Fila §2.14 | Estado verificado en v1.9.3 |
|---|---|
| §1.3.2 / §1.3.3 — lectura de `TX_CoordinacionVisita` en Datos e Historial de IF-02 | ❌ `TX_CoordinacionVisita` **no aparece ni una vez** fuera del rango 1564–1953 |
| §1.9.1 / §1.4 / RN-59 — excepción acotada | ❌ la ficha RN-59 (línea 635) y §1.4 (líneas 611, 631) enuncian la regla **sin** excepción; el índice §13 (línea 4409) tampoco la refleja |
| §4.2.1 — campo `tipo_propiedad` en `D_TipoDocumento` | ❌ no existe mención de `tipo_propiedad` fuera de §2 (líneas 1683, 1874, 1917) |

Además, **dentro del propio v1.9.3** sobrevive vocabulario retirado:

- Línea **2974** — tabla de automatizaciones: `AT03  AT03_ejecutar_dag_formulas  estado=capturada` → debe ser `estado=visitada` (§2.11).

## 0.6 Hallazgo crítico C — tres fuentes citadas por §2 no existen en el repositorio

§2 declara fuentes que no están versionadas aquí:

| Documento citado | Rol declarado en §2 | Presencia |
|---|---|---|
| `VProperty_Maquina_Estados.html` | **"fuente única de la máquina de estados"** (§2.11, línea 1800) | ❌ ausente |
| `VProperty_ADR_IF_Tasador_v3_v2.md` | fuente de todas las decisiones (C-1..C-3, S-1..S-8, §8) | ❌ ausente |
| `Imagenes_IF_Tasador_v3.docx` | origen de las siete pantallas | ❌ ausente |

Impacto directo sobre el prompt de sincronización: la familia **B (ADR de IF-Tasador)** y la
familia **G (Máquina de estados)** quedan **vacías**. La regla de oro §1.3 (cero pérdida) y el
requisito de "marcar ADRs previos como SUPERSEDED" no tienen objeto sobre el que operar.

## 0.7 Hallazgo crítico D — deriva de versiones respecto del prompt

El prompt asume versiones que el repositorio ya superó:

| Familia | Versión asumida por el prompt | Versión real en `docs/_md/` |
|---|---|---|
| C · Arquitectura Enterprise | v2.6 | **v2.8** |
| D · Capa de Datos | v2.6.3 | **v2.6.4** |
| E · Blueprint de Interfaces | v2.8 | **v2.9** |
| F · Motor de Cálculo | v2.5 | **v2.6** |
| — · Origen de Datos del Informe | v1.0 | **v1.1** |

## 0.8 Hallazgo crítico E — el predecesor v1.9.2 está borrado del working tree

`docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` figura como ` D` (borrado, sin
stage). Sigue recuperable desde HEAD (`03e8053`, 5001 líneas). La regla de oro §1.3
(cero pérdida) y la convención §4.2 (predecesor marcado SUPERSEDED) exigen
**restaurarlo** y ponerle el bloque `[SUPERSEDED]`, no dejarlo borrado.

---

## 0.9 Grep 1 · vocabulario de estados y botones

Patrón: `capturada|devuelta|Capturar|Enviar captura|WhatsApp|3 intentos|tres intentos|franja roja|AlertDialog dual`
Conteo de líneas con match, por archivo:

| Archivo | Hits |
|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | 26 |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | 15 |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | 12 |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | 10 |
| `lib/console-data.ts` | 8 *(código — fuera de alcance)* |
| `docs/make/SC01_-_Crear_solicitud_blueprint.json` | 4 |
| `docs/diseno.md` | 3 |
| `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | 3 |
| `docs/schema-airtable.md` | 2 |
| `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` | 2 |
| `lib/adjuntos-uploader.ts` | 1 *(código — fuera de alcance)* |
| `docs/make/AT-RF09-Trigger_script.js` | 1 *(código — fuera de alcance)* |
| `docs/aprendizajes.md` | 1 |
| `docs/_notas/plan-ejecucion-if02-v1_9.md` | 1 |
| `README.md` | 1 |
| `CLAUDE.md` | 1 |

**Nota de lectura obligatoria.** Buena parte de estos hits son **falsos positivos** que
deben preservarse tal cual:

- `WhatsApp` como **canal de origen de solicitud** (`origen_canal`, `canal_contacto_original`)
  es vocabulario vigente de IF-02 y no tiene relación con la notificación por WhatsApp
  al tasador que sí está fuera de alcance. Afecta a `CLAUDE.md:56`, `README.md:16`,
  `docs/schema-airtable.md:162,190`, `Origen_Datos_Informe:461,467`, y el spec en
  §1 (líneas 365, 682, 817).
- `3 intentos` en `docs/diseno.md:207,227` y `lib/adjuntos-uploader.ts:170` es el
  **backoff de reintento de upload (D-14.2)**, no el ciclo de re-visitas retirado.
- `devuelta`/`capturada` dentro de bloques ya marcados como históricos.

La clasificación fina de cada hit se hará en la ficha de brecha por documento (Fase 1).

## 0.10 Grep 2 · lenguaje de IA en UI

Patrón: `IA extrayendo|Claude leyendo|modelo procesando|AI processing|AI extracting`

| Archivo | Observación |
|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | Único match, línea 1698 — es la **prohibición** correctamente enunciada ("el tasador ve 'Lectura de datos' y no 'IA extrayendo…'"), no una violación. |

Resultado: **cero violaciones reales** de la regla de oro §1.6 en documentación.

## 0.11 Grep 3 · RN-16bis y escenarios Make retirados

Patrón: `RN-16bis|SC02|SC04|SC05|SC15`

| Archivo | Hits |
|---|---|
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | 17 |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | 11 |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | 7 |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | 7 |
| `CLAUDE.md` | 7 |
| `docs/diseno.md` | 6 |
| `docs/schema-airtable.md` | 4 |
| `docs/construccion.md` | 3 |
| `README.md` | 2 |
| `docs/aprendizajes.md` | 1 |
| `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` | 1 |

`RN-16bis`: **cero ocurrencias en todo el repo**. Ya está limpio.

Los escenarios retirados aparecen **como vivos** en documentación canónica y operativa:
- **SC05** (renombrado a SC08) — 22 ocurrencias repartidas en Blueprint v2.9, Capa de Datos v2.6.4,
  Arquitectura v2.8, `CLAUDE.md`, `README.md`, `docs/diseno.md`, `docs/construccion.md`,
  `docs/schema-airtable.md`. **Es el hallazgo de mayor superficie de todo el sync.**
- **SC04** (retirado) — Capa de Datos:1998,5707,5944,7006 · Arquitectura:3158,3749,3807.
- **SC02** (fusionado en SC01) — Capa de Datos:3619,4820.
- **SC15** (retirado, pasa a AT08) — Capa de Datos:3490,5982,6022,6048,6235,6964,7240,7340 ·
  Arquitectura:3122,3307 · Blueprint:3585 · Origen_Datos:1034.

## 0.12 Grep 4 · entidades de coordinación

Patrón: `TX_ContactosVisita|TX_CoordinacionVisita|coordinacion_vigente|observacion_rechazo_tasador`

| Archivo | Hits | Nota |
|---|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | 25 | **todas dentro de §2** (1564–1953). Cero fuera. |
| `docs/_notas/snapshot_20260724_1639.md` | 9 | sólo `TX_ContactosVisita` |
| `docs/schema-airtable.md` | 4 | sólo `TX_ContactosVisita` |
| `docs/construccion.md` | 3 | sólo `TX_ContactosVisita` |
| `docs/_notas/plan-ejecucion-if02-v1_9.md` | 3 | sólo `TX_ContactosVisita` |
| `docs/aprendizajes.md` | 2 | sólo `TX_ContactosVisita` |
| `docs/_notas/snapshot_20260724_1710.md` | 2 | sólo `TX_ContactosVisita` |
| `docs/_notas/snapshot_20260724_1704.md` | 2 | sólo `TX_ContactosVisita` |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | 2 | sólo `TX_ContactosVisita` |

**`TX_CoordinacionVisita` no existe fuera de §2 en ningún documento del repositorio.**
Igual para `coordinacion_vigente`, `observacion_rechazo_tasador` y `horas_restantes`.
Ese es el delta de schema completo pendiente de propagar a la Capa de Datos v2.6.4.

## 0.13 Hits en código (fuera de alcance · van a CODE_INCONSISTENCIES.md)

```
lib/console-data.ts:8     | "devuelta"                                   ← unión de tipos de estado
lib/console-data.ts:168   devuelta: "Devuelta",                          ← label UI
lib/console-data.ts:184   devuelta: "bg-orange-50 …"                     ← color de badge
lib/adjuntos-uploader.ts:170  /** 3 intentos con backoff … (D-14.2) */   ← FALSO POSITIVO, preservar
docs/make/AT-RF09-Trigger_script.js                                      ← blacklist de estados
docs/make/SC01_-_Crear_solicitud_blueprint.json                          ← blueprint Make (4 hits)
```

Ningún archivo `.ts/.tsx/.js/.json` se modificará (§7 del prompt).
