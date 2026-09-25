# Prompts de textos IA del informe — v1 (DISEÑO)

> **Tanda**: T-INFORME-ENSAMBLADOR-20260925 · bloque 6 (§3.6 del
> `docs/_analisis/ROADMAP_paridad_informe_20260924.md`) · **P0-2 adelantado sin writes**.
> **Norma**: RF-32 (Spec v1.9.17, líneas 4927-4944) · estilo §6.1 adaptado.
> **Estado**: DISEÑO — este prompt no se ha ejecutado contra la API. El validador que lo
> respalda SÍ existe y está verde: `lib/informe/validador-cifras.ts`.

## 0 · Qué existe vs qué es diseño

| Pieza | Estado |
|---|---|
| Validador anti-cifras (`lib/informe/validador-cifras.ts` + tests con fixtures del gold master) | ✅ **EXISTE** (este bloque) |
| Prompt v1 (este documento) | 📐 DISEÑO — pendiente de prueba con casos reales (criterio RF-32: 5 casos, cero cifras inventadas) |
| Blueprint `SC-Textos` (`docs/_artefactos/make/SC-Textos.blueprint.json`) | 📐 DRAFT v0.1 — **NO IMPORTAR** |
| Campos destino `sintesis_propiedad_texto` · `descripcion_sector_texto` en `TX_DatosTasacion` | ❌ **PENDIENTES DE CREACIÓN** — decisión de Sergio (grep negativo en schema y código, hallazgo 7 §6 del roadmap) |
| Columna `comodidades` (P1-1) para enriquecer la síntesis | ❌ PENDIENTE — el prompt v1 la marca opcional |
| Patrón Claude en Make probado en producción (SC-RF09 módulo 10: `claude-sonnet-4-6`, JSON estricto) | ✅ EXISTE — es el molde del draft |

## 1 · Contrato RF-32 (literal)

- Salida: **JSON puro** con schema fijo `{"sintesis": string, "programa": string, "descripcion_sector": string}`. Sin backticks, sin markdown, sin prosa fuera del objeto; la respuesta empieza con `{` y termina con `}` (mismo contrato que SC-RF09 módulo 10, probado en producción).
- **Prohibido inventar cifras**: todo número que aparezca en los textos debe provenir del payload entregado en el prompt (que a su vez sale de `TX_DatosTasacion` y `TX_ItemsCuadroValoracion` vía el ensamblador).
- **Validación numérica posterior**: el texto devuelto se pasa por `validarTexto(texto, cifrasDePayload(payload))` (`lib/informe/validador-cifras.ts`). `valido: false` → **rechazo y reintento** (una regeneración; si reincide, la solicitud queda para redacción manual con log en `LogEscenarios`).
- Alcance del schema: **E-85** («análisis de las referencias») queda FUERA — recomendado como texto fijo de plantilla (decisión E-85 pendiente, §4 del roadmap). **E-57** (expropiación) también fuera: es plantilla con 2 variables y depende de `afecto_expropiacion` (P1-1).
- Criterio de aceptación: pruebas con cinco casos reales, cero cifras inventadas; el visador (F4) valida el texto antes de aprobar.

## 2 · Inputs por párrafo

### 2.1 Síntesis de la propiedad (`sintesis`) + programa (`programa`)

| Input | Fuente | Estado |
|---|---|---|
| Dirección (calle + numeración) y condominio | `TX_Solicitudes` (dirección) · condominio | ✅ existe |
| Comuna | `TX_Solicitudes` → `M_Comunas` | ✅ existe |
| Superficie de terreno (m²) | `TX_DatosTasacion.sup_terreno_m2` | ✅ existe |
| Superficie construida por piso (m²) | `TX_DatosTasacion` / `TX_ItemsCuadroValoracion` (detalle «Piso N») | ✅ existe |
| Cantidad de pisos | `TX_DatosTasacion` | ✅ existe |
| Materialidad predominante | `TX_DatosTasacion.material_predominante` | ✅ existe |
| Programa de recintos (recinto × nivel × cantidad) | `TX_HabitacionesPorNivel` (`tblBITpPb8WuqsatM`) | ✅ existe |
| Comodidades / exterior (antejardín, terrazas, quincho, piscina…) | columna `comodidades` | ❌ **PENDIENTE P1-1** — mientras no exista, la parte «exterior» se redacta sólo desde obras complementarias (`TX_ObrasComplementarias`) disponibles |

En el gold master el **programa está embebido dentro de la síntesis** («…cuenta con hall,
baño de visitas, …»). El schema RF-32 lo pide además como clave separada `programa`:
la plantilla decidirá si lo imprime aparte o si usa sólo `sintesis`.

### 2.2 Descripción del sector (`descripcion_sector`)

| Input | Fuente | Estado |
|---|---|---|
| Zonificación / zona normativa | `M_Zonificacion` (`tbltr5VN2NGuTtbc1`, 1.636 filas seed, Link a `TX_DatosTasacion` `fldkOAyWhqx2jC8Cr`) | ✅ existe (sucio — P1-2 es rescate) |
| Comuna | `TX_Solicitudes` → `M_Comunas` | ✅ existe |
| Tipo de zona (urbana/rural/mixta) | `M_Zonificacion.tipo_zona` / `TX_DatosTasacion.ubicacion_urbano_rural` | ✅ existe |
| Conectividad / hitos del sector | sin columna hoy — el tasador los conoce | 📐 v1: se derivan de comuna+zona; preview editable los completa |

## 3 · Reglas de estilo

- **Tercera persona, presente** («El bien es…», «El sector se compone…»). La segunda
  persona de §6.1 aplica a mensajes de UI, **no** a los textos del informe.
- Sin signos de exclamación. Sin juicios de valor no respaldados («excelente», «privilegiado»).
- Números en formato es-CL: coma decimal, `m²`, `N°` para numeración (así los reconoce
  `extraerCifras`).
- Longitudes: **síntesis 90–140 palabras** · **descripción del sector 60–100 palabras**,
  en frases cortas (patrón del gold master).
- Mayúsculas para nombres propios de condominio/calle tal como vienen en la base
  (el gold master usa MAYÚSCULAS: «LAS BRISAS DE CHICUREO», «ALBAÑILERÍA LADRILLO»).
- Si un dato no viene en el payload, **se omite la frase** — jamás se rellena con un valor
  típico.

## 4 · Prompt v1

Los `{{...}}` son placeholders de Make (numeración de módulos del draft `SC-Textos`);
en un runner del repo serían interpolación TS sobre el `InformeContexto`.

### 4.1 System (rol)

```text
Eres el redactor tecnico de informes de tasacion de VProperty (Chile). Redactas
parrafos breves, factuales y en tercera persona para informes bancarios. NUNCA
inventas datos: solo usas los valores entregados en el mensaje. Si un dato no
viene, omites la frase que lo necesitaria.
```

### 4.2 User (contrato + few-shot + payload)

```text
Redacta los textos descriptivos del informe de tasacion a partir de los DATOS
DE LA PROPIEDAD del final. Responde EXCLUSIVAMENTE con un objeto JSON valido en
texto plano, sin backticks, sin markdown, sin la palabra json antes del objeto,
sin comentarios. Tu respuesta debe empezar con el caracter { y terminar con }.
Formato exacto: {"sintesis": string, "programa": string, "descripcion_sector": string}.

REGLA CRITICA (RF-32): PROHIBIDO inventar cifras. Todo numero que escribas
(superficies, numeracion, cantidades) debe aparecer literalmente en los DATOS
DE LA PROPIEDAD. Los numeros van en formato chileno: coma decimal (249,91),
simbolo m² para superficies, N° para numeracion de calle. Si un dato viene
vacio o nulo, omite la frase correspondiente; no lo reemplaces por un valor
tipico ni aproximado. Sin signos de exclamacion, sin adjetivos de valor no
respaldados, tercera persona, tiempo presente.

- "sintesis": 90 a 140 palabras. Estructura de referencia (ejemplo real de un
informe emitido, imita tono y orden, NO copies sus datos):
"El bien es una vivienda que se encuentra en el Condominio LAS BRISAS DE
CHICUREO, ubicado en LOS EUCALIPTUS N°2100. La propiedad tiene 5024,86 m² de
terreno. La vivienda original tiene un piso construido en ALBAÑILERÍA LADRILLO.
El primer piso Tiene 249,91 m² y cuenta con hall, baño de visitas, living,
comedor, cocina, logia, dormitorio y baño de servicio, sala de estar familiar,
3 dormitorios simples, dormitorio principal en suite con walk in closet, 3
baños completos, el baño principal con jacuzzi. El exterior cuenta con
antejardín abierto al norte con estacionamiento descubierto para 4 vehículos,
patio lateral poniente de paso con bodega en construcción, patio lateral
oriente con patio de servicio descubierto, patio trasero al sur con 2 terrazas
descubiertas, quincho en una de las terrazas, áreas verdes, piscina."

- "programa": solo la enumeracion de recintos por nivel (la parte "cuenta
con..."), derivada de la lista PROGRAMA DE RECINTOS. Cantidades mayores que 1
se escriben con el numero ("3 dormitorios simples").

- "descripcion_sector": 60 a 100 palabras, frases cortas. Estructura de
referencia (ejemplo real, imita tono, NO copies sus datos):
"El sector es de carácter mixto. El cual se compone de viviendas de baja
densidad, viviendas aisladas de diseño particular, agrupadas generalmente en
condominios. Conectividad a través de Autopista Los Libertadores, Las Brisas.
Sector de parcelaciones rurales. Centros educacionales medianamente cerca.
Comercio local por Las Brisas. Los servicios en general se encuentran en el
centro de la comuna de Colina."

DATOS DE LA PROPIEDAD:
- Direccion: {{3.direccion}} N°{{3.numeracion}}
- Condominio: {{3.condominio}}
- Comuna: {{3.comuna}} · Region: {{3.region}}
- Tipo de propiedad: {{3.tipo_propiedad}}
- Superficie de terreno (m²): {{4.sup_terreno_m2}}
- Superficie construida (m²): {{4.sup_construccion_m2}}
- Cantidad de pisos: {{4.pisos}}
- Materialidad predominante: {{4.material_predominante}}
- Estado de conservacion: {{4.estado_conservacion}}
- Zona normativa: {{4.zona}} · Tipo de zona: {{4.tipo_zona}}
- Obras complementarias / exterior: {{4.obras_complementarias}}
PROGRAMA DE RECINTOS (recinto · nivel · cantidad):
[{{6.text}}]
```

> Nota sobre el few-shot: los dos párrafos de referencia son la transcripción literal del
> gold master MET-6283 (pág. 2) — los mismos fixtures de `validador-cifras.test.ts`. En el
> PDF original la «Descripción del sector» aparece **truncada por la celda** («…El
> comercio, el transporte y»); el few-shot la cierra en la frase completa anterior para no
> enseñar el defecto.

## 5 · Flujo previsto (diseño)

1. **Disparo**: pre-SC09 (antes de mandar a Carbone), con la solicitud en `estado=calculada`.
   Camino natural: Make clonando el patrón SC-RF09 (hallazgo 8: no hay cliente Anthropic en
   el código Next.js) → draft `SC-Textos.blueprint.json`.
2. **GET de contexto**: `TX_Solicitudes` + `TX_DatosTasacion` + `TX_HabitacionesPorNivel`
   por código (en T5, el endpoint `GET /api/tasaciones/[id]/informe-data` puede reemplazar
   los tres GET por uno).
3. **Claude API**: `claude-sonnet-4-6` · `max_tokens 4096` · `anthropic-version 2023-06-01`
   · timeout 180 s · respuesta JSON pura (parámetros calcados de SC-RF09 módulo 10).
4. **Validación RF-32**: `validarTexto` sobre cada texto con `cifrasDePayload(payload)`.
   Discrepancia → rechazo y UN reintento; segundo fallo → log `⚠` en `LogEscenarios` y
   redacción manual.
5. **Preview editable**: la Ejecutiva/tasador ve y ajusta los textos antes del render
   (el visador F4 valida — criterio RF-32). El texto editado re-pasa por el validador.
6. **Persistencia**: `TX_DatosTasacion.sintesis_propiedad_texto` y
   `TX_DatosTasacion.descripcion_sector_texto` — **campos PENDIENTES de creación,
   decisión de Sergio** (crear columnas una sola vez y con destino cierto, per auditoría).
   Hasta esa decisión, nada escribe: este bloque es diseño + validador.
