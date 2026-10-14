# PRD · Orden de fotos y documentos, y fechas dd/mm/yyyy («Temas 1»)

> **Documento de trabajo, no normativo.** Preparado con la skill `/write-spec`
> (product-management) a partir de la solicitud `Temas 1.docx` (14-oct-2026) y del
> diagnóstico de un panel de tres especialistas en solo lectura: **fotos e informe**,
> **checklist de documentos** y **fechas**. La fuente normativa sigue siendo
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_18.md`. Lo que se apruebe aquí se
> integra en la spec con **bump a v1.9.18**, porque dos puntos la contradicen
> (§1.5.1.1 exige orden alfabético de documentos; §2.6 fija el catálogo de fotos).
>
> **Estado al 14-oct-2026:** F1–F4 aplicadas en código (sin commit al cierre de la
> sesión) e integradas en la spec v1.9.18 (§1.5.1.1, §2.6, §4.2.1 y RNF-23). F5 (R6)
> descartada por Q1. Pendiente: verificación en casos reales (§8).

| Campo | Valor |
|---|---|
| Origen | `Temas 1.docx` (Sergio, 14-oct-2026) + requisito de fechas del mismo mensaje |
| Pantallas | `/tasaciones/[id]/fotos` (tasador) · checklist «Documentos y adjuntos» (tasador y consola) · todas las fechas de `/consola` y `/tasaciones/**` |
| Fuera de alcance | PDF de Carbone y escenarios Make (ver §3) |
| Regla rectora | **No romper lo ya probado:** recuadros y grilla del PDF, RF-09, borrado en cascada, VP-2026-0067 (golden) y la réplica VP-2026-0079 |

---

## 1 · Problema

El tasador carga las fotos y los documentos en un orden que no sigue su recorrido real de
la visita, y las fotos de referencias (mapa y comparables) se mezclan con las de la
propiedad. Hoy la pantalla de fotos parte por «Ofertas / Comparables», y el checklist de
documentos está en orden alfabético (parte por «Certificado de Avalúo Fiscal», después
«Deuda de Contribuciones», «Gastos Comunes»…). Eso obliga a buscar cada categoría y hace
fácil saltarse una.

Además, las fechas aparecen en **seis formatos distintos** según la pantalla («5 ago 2026»,
«05-08-2026», «21 ago 14:30», «10 de agosto de 2025», ISO crudo…), y los campos de fecha
nativos muestran el formato del idioma del navegador (en un navegador en inglés,
`04/13/2026`). El riesgo es leer o ingresar mal una fecha de visita, que fija la UF del
cálculo.

## 2 · Objetivos

1. **Fotos en el orden de la visita:** fachada, sector, casa, living, comedor, cocina, baños,
   dormitorios, terraza, quincho y después el resto, en 100 % de las solicitudes.
2. **Referencias separadas:** mapa de ubicación y fotos de las 3 primeras referencias en una
   sección propia, sin alterar ni un recuadro del PDF ni la lectura automática de
   comparables (RF-09).
3. **Documentos en el orden de trabajo:** foto fuente SII, certificado de avalúo,
   contribuciones, permiso de edificación, recepción, plano y después el resto, igual en
   consola y tasador.
4. **Una sola forma de fecha:** el 100 % de las fechas visibles e ingresadas en las UI en
   `dd/mm/yyyy` (y `dd/mm/yyyy HH:mm` cuando lleva hora), independiente del idioma del
   navegador.
5. **Cero regresiones:** VP-2026-0067 produce los mismos recuadros e imágenes de anexos que
   hoy, y una foto subida a referencias sigue disparando RF-09.

## 3 · No objetivos

- **No se cambian claves internas** de categorías de foto ni `codigo` de tipos de documento.
  Son la llave de RF-09, de los recuadros del PDF y del borrado en cascada; cambiarlas
  rompe esas piezas sin dar error.
- **No se toca el PDF de Carbone ni los escenarios Make.** El ensamblador entrega fechas ISO
  y la plantilla las formatea; el golden MET-6283 («13 de abril de 2026») no cambia. El
  «abr-26» de la tabla de ofertas copia el informe impreso y se mantiene.
- **No se cambia el formato de almacenamiento:** Airtable, Make, payloads, filtros y la URL
  siguen en ISO (`YYYY-MM-DD`).
- **No se migran fotos ya subidas.** Las de `living_comedor` (16 filas en
  VP-2026-0067/0073–0077) quedan como categoría heredada.
- **No se corrigen divergencias previas** detectadas de paso (van a sus propios CI):
  mínimo de «Ofertas / Comparables» en 1 (código) vs 3 (spec §2.6); la consola no filtra el
  checklist por propiedad nueva/usada (spec §1.5.1.1).
- **No se agregan dependencias** (`react-day-picker`, `date-fns`): el campo de fecha se hace
  con los componentes existentes.

## 4 · Historias de usuario

**Tasador**
- Como tasador, quiero que las categorías de fotos sigan el orden en que recorro la
  propiedad, para cargar sin buscar y sin saltarme ninguna.
- Como tasador, quiero que el mapa y las fotos de las referencias estén en una sección
  aparte, para no confundirlas con las fotos de la propiedad.
- Como tasador, quiero que el checklist de documentos empiece por los que reviso primero
  (SII, avalúo, contribuciones, permiso, recepción, plano), para completar lo esencial antes.
- Como tasador, quiero escribir la fecha de visita como `dd/mm/yyyy` aunque mi navegador
  esté en otro idioma, para no ingresar mes por día.

**Ejecutiva Comercial**
- Como Ejecutiva, quiero ver todas las fechas de la consola en `dd/mm/yyyy`, para leer
  plazos y fechas de visita sin interpretar formatos distintos.
- Como Ejecutiva, quiero el mismo orden de documentos que ve el tasador, para hablar de la
  misma lista.

**Casos límite**
- Como tasador, si escribo una fecha imposible (31/02/2026), quiero un aviso en el campo y
  que no se guarde.
- Como tasador de una propiedad **nueva**, el checklist no muestra «Foto fuente SII» ni
  «Contribuciones» (solo aplican a usada), así que la lista parte en «Certificado de avalúo».
- Como tasador de una solicitud antigua con fotos «Living / Comedor», quiero seguir
  viéndolas en la pantalla, aunque esa categoría ya no se ofrezca para fotos nuevas.

## 5 · Requisitos

### P0 · Imprescindibles

**R1 · Nuevo orden de categorías de fotos, sin cambiar claves.**
En `CATEGORIAS_FOTO` (`lib/tasador/tasaciones.ts:912-922`), que es la única fuente del
catálogo, el orden y los mínimos:

| # | Clave | Rótulo en pantalla | Estado |
|---|---|---|---|
| 1 | `fachada_exterior` | Fachada | existente (rótulo nuevo) |
| 2 | `sector` | Sector | **nueva** |
| 3 | `casa` | Casa | **nueva** |
| 4 | `living` | Living | **nueva** |
| 5 | `comedor` | Comedor | **nueva** |
| 6 | `cocina` | Cocina | existente |
| 7 | `banos` | Baños | existente |
| 8 | `habitaciones` | Dormitorios | existente (rótulo nuevo; conserva mínimo por dormitorios) |
| 9 | `terraza` | Terraza | **nueva** |
| 10 | `quincho` | Quincho | **nueva** |
| 11 | `estacionamientos` | Estacionamientos | existente |
| — | `living_comedor` | Living / Comedor | **heredada:** solo se muestra si ya tiene fotos; mínimo 0 |
| — | categorías personalizadas | (nombre libre) | después de las fijas, como hoy |

Criterios:
- Dado una solicitud nueva, cuando el tasador abre `/fotos`, entonces ve las categorías en
  el orden de la tabla, y las personalizadas al final.
- Dado VP-2026-0067, cuando se abre `/fotos`, entonces sus fotos `living_comedor` siguen
  visibles bajo «Living / Comedor» y no aparecen como categoría personalizada.
- Las categorías nuevas tienen mínimo 0 salvo que el negocio diga otra cosa (Q3).
- La insignia de cada miniatura usa un rótulo corto propio (`labelCorto`), no la primera
  palabra del rótulo.
- Si el tasador crea una categoría personalizada con el nombre de una nueva fija (p.ej.
  «Quincho»), se le avisa y se usa la fija.

**R2 · Sección «FOTOS O DOCUMENTOS DE LAS REFERENCIAS».**
Encabezado de sección (no categoría: el test de RF-TAS-06 prohíbe la palabra «documento» en
una categoría) que agrupa, en este orden:

| Clave | Rótulo nuevo |
|---|---|
| `mapa_ubicacion` | Mapa ubicaciones propiedad |
| `ofertas_comparables` | Fotos de las 3 primeras referencias |
| `mapa_referencias` | Mapa de referencias |

Criterios:
- La sección va **después** de las categorías de la propiedad.
- Subir una foto a «Fotos de las 3 primeras referencias» sigue creando el adjunto con
  `clave_adjunto = foto_ofertas_comparables` y dispara `AT-RF09-Trigger`
  (`lib/tasador/tipo-documento-foto.ts:27-29`, sin cambios).
- Los recuadros del PDF (`lib/informe/imagenes.ts:50-56`: mapa de ubicación, fachada, mapa de
  referencias y referencias 1–3) salen idénticos para VP-2026-0067.
- Se agrega `seccion: 'propiedad' | 'referencias'` al catálogo y `fotos-categorizadas.tsx`
  pinta un encabezado por sección.

**R3 · Orden de negocio del checklist de documentos.**
- Crear en `D_TipoDocumento` un campo `orden` (número entero). **Requiere aprobación** antes
  de crearlo (`CLAUDE.md`) y registrarlo en `docs/schema-airtable.md` §18.
- Cargar: `foto_fuente_sii` 10 · `certificado_avaluo_fiscal` 20 · `certificado_deuda_tgr` 30 ·
  `permiso_edificacion` 40 · `certificado_recepcion_final` 50 ·
  `foto_plano_cuadro_superficies` 60. El resto queda vacío.
- Un comparador único `compararTiposDocumento` en `lib/tipos-documento.ts`: `orden`
  ascendente, vacíos al final y desempate alfabético. Reemplaza los dos ordenamientos
  alfabéticos actuales (`lib/tipos-documento.ts:145` y
  `components/console/document-checklist.tsx:714-722`).
- Criterios: el checklist muestra los seis primeros en ese orden en consola (modo edición y
  consulta) y en tasador; los demás siguen alfabéticos; un tipo nuevo sin `orden` cae al
  final sin tocar código; los anexos del PDF no cambian (usan `RANURAS_ANEXO`, propio).
- Nota operativa: el catálogo se cachea 5 minutos por proceso; el orden nuevo puede tardar
  ese tiempo en verse.

**R4 · Fechas visibles en `dd/mm/yyyy`.**
- Nuevo `lib/fechas.ts` con `formatearFecha` y `formatearFechaHora`. Para valores
  `YYYY-MM-DD` se parte el texto (nunca `new Date`, que en Santiago corre un día). Para
  instantes, hora de Santiago (`America/Santiago`) en 24 horas, armando las partes con
  `formatToParts` (el separador por defecto de es-CL es «-»).
- Reemplaza las rutinas actuales: `formatDisplay` (`lib/solicitudes.ts:433`),
  `fechaVisible` (`lib/tasador/lectura-tasacion.ts:265`), `formatoFecha`
  (`lib/sii-legales.ts:102`), `fechaCalendarioVisible` (`lib/coordinacion.ts:169`), las dos
  copias de `formatearInstante` (`lib/decision-motor.ts:178`, `lib/documentos-generados.ts:60`),
  la cronología SLA (`lib/sla-cronologia.ts:160-217`), la fecha de asignación sin formatear
  (`lib/solicitudes.ts:817`) y la optimista (`solicitud-detail.tsx:384`), y el ISO crudo de
  `informe-preview.tsx:527`.
- Criterios: `2026-04-13` → `13/04/2026`; `2026-08-25T03:30:00Z` → `24/08/2026 23:30`
  (Santiago); probado con `TZ=UTC` en fechas de 23:00 y 00:30 y en los cambios de horario de
  Chile. Las fechas relativas («hace 2 horas») se mantienen donde ya existen.

**R5 · Campos de fecha que se escriben en `dd/mm/yyyy`.**
- Componente `components/ui/fecha-input.tsx`: `Input` de texto con `inputMode="numeric"`,
  `placeholder="dd/mm/aaaa"`, máscara que inserta las barras y validación de calendario real.
  **Hacia afuera recibe y entrega ISO**, así que formularios, zod (`fechaIso` en
  `lib/tasador/validators/index.ts:37`), Route Handlers y payloads a Make no cambian.
- Reemplaza los 9 campos nativos: filtros desde/hasta (`solicitud-list.tsx:363,370`), inicio
  del SLA (`editar-solicitud-form.tsx:375`, pasa a fecha + hora 24 h), coordinar visita
  (`coordinar-visita.tsx:490`), sección A (`tasacion-form.tsx:423,433`), edificación
  (`seccion-edificacion.tsx:183`) y documentos (`seccion-documentos.tsx:48,53,60`).
- Criterios: con el navegador en inglés se escribe `13/04/2026` y viaja `2026-04-13`; `31/02`
  muestra error y no guarda; el campo anuncia el formato con `aria-describedby`; durante el
  guardado se respeta la Regla D (`disabled` + spinner).
- Se pierde el calendario desplegable nativo (ver Q8).

### P1 · Deseables

- **R6 · Grilla de 16 fotos del PDF ordenada por catálogo.** Hoy la grilla toma las fotos en
  orden de subida e incluye mapas y referencias (hasta 5 de los 16 cupos). Propuesta: excluir
  la sección referencias y ordenar por posición en el catálogo y luego por subida. **Cambia
  el PDF**, por eso depende de Q1/Q2 y va después de R1–R2.
- **R7 · Helper de fechas reutilizado** también por la vista previa del informe (salvo los
  formatos que imitan al PDF impreso, según Q7).

### P2 · Futuro

- Llevar el orden de categorías de fotos a Airtable si el negocio quiere cambiarlo sin
  despliegue (hoy es código, y está bien así).
- Filtro nueva/usada del checklist también en la consola (divergencia previa con §1.5.1.1).
- Calendario desplegable propio si se aprueba `react-day-picker`.

## 6 · Métricas de éxito

| Indicador | Tipo | Meta | Medición |
|---|---|---|---|
| Recuadros del PDF de VP-2026-0067 idénticos a hoy | adelantado | 6/6 iguales | Comparar el payload de imágenes antes y después |
| RF-09 dispara con foto de referencias | adelantado | 1 corrida OK de `AT-RF09-Trigger-Update` en VP-2026-0079 | `list_automation_runs` |
| Fechas fuera de `dd/mm/yyyy` en las UI | adelantado | 0 (grep de `toLocaleDateString` y helpers retirados + revisión visual) | Grep y recorrido de pantallas |
| Fechas mal ingresadas (mes por día) | rezagado | 0 reportes en el mes siguiente | Retroalimentación de tasadores |
| Solicitudes con fotos sin categoría propia de propiedad | rezagado | Bajar respecto del uso de personalizadas «Living», «Comedor», «Terraza», «Quincho» | Conteo de `descripcion` en `TX_Adjuntos` |

## 7.0 · Decisiones de Sergio (14-oct-2026)

| Pregunta | Decisión | Efecto |
|---|---|---|
| Q1 | «Orden de carga» cambia **solo la pantalla** | **R6 se descarta** (y Q2 deja de aplicar): la grilla del PDF no cambia |
| Q3 | Mínimo **0** para las categorías nuevas | R1 tal cual |
| Q4 | «Casa» es categoría propia y **aplica también a departamento** | `casa` se muestra en todo tipo de propiedad |
| Q5 | «Plano» = Plano y Cuadro de Superficies · «Recepción» = Recepción Definitiva | Mapeo de R3 confirmado |
| Campo `orden` en `D_TipoDocumento` | **Aprobado** | R3 se ejecuta |
| Q6–Q9 | Sin respuesta: se aplican las propuestas por defecto | Estacionamientos al final de la propiedad; vista previa sigue la regla de UI salvo «abr-26»; sin calendario desplegable; año siempre visible |

## 7 · Preguntas abiertas

**Bloqueantes (negocio · Héctor/Sergio)**
- **Q1** «Orden de carga» ¿es solo el orden en pantalla, o también el orden de las fotos en
  la grilla del informe? (decide R6)
- **Q2** ¿La grilla de 16 fotos debe excluir mapas y referencias?
- **Q3** Mínimos de Sector, Casa, Living, Comedor, Terraza y Quincho: ¿0, o 1 cuando se
  declara terraza/quincho? Propuesta por defecto: 0.
- **Q4** «Foto casa» ¿es distinta de «Fachada»? ¿Aplica a departamentos? (en depto quizás
  debe ocultarse)
- **Q5** «Plano» ¿es «Plano y Cuadro de Superficies» (propuesta), o también suben Cuadro de
  superficies, Esquema y Planta de emplazamiento? «Recepción» ¿es la Recepción Definitiva?

**No bloqueantes**
- **Q6** ¿Estacionamientos va antes o después de Terraza/Quincho? (propuesta: al final de la
  propiedad).
- **Q7** ¿La vista previa del informe imita al PDF (sus formatos propios) o sigue la regla
  de UI? Propuesta: regla de UI, salvo «abr-26» de la tabla de ofertas.
- **Q8** ¿Se acepta perder el calendario desplegable, o se aprueba `react-day-picker`?
- **Q9** ¿Se muestra siempre el año, también cuando es el año en curso? Propuesta: sí
  (`dd/mm/yyyy` sin excepciones).

## 8 · Plazos, fases y verificación

Cada fase es una tanda independiente, con `tsc`, tests afectados y `next build` limpios, y
sin correr la suite de `docs/_evidencia/**` (regenera evidencia; ver
`docs/aprendizajes.md` 2026-10-14).

| Fase | Contenido | Riesgo | Depende de |
|---|---|---|---|
| F1 | R4 · fechas visibles (`lib/fechas.ts`) | bajo | — |
| F2 | R3 · orden de documentos | bajo | aprobación del campo `orden` + Q5 |
| F3 | R1 + R2 · fotos y sección referencias | medio (PDF/RF-09) | Q3, Q4 |
| F4 | R5 · campos de fecha | medio (formularios) | Q8 |
| F5 | R6 · grilla del PDF | medio (cambia el PDF) | Q1, Q2 |

**Tests que hoy fijan formato u orden y se actualizan en su fase:**
- Fechas: `sii-legales.test.ts:99`, `lectura-tasacion.test.ts:190-198`,
  `coordinacion.test.ts:55,161,174`, `historial-airtable.test.ts:89`,
  `sla-cronologia.test.ts:97-123`.
- Fotos: `fotos-categorizadas.test.ts:55-61`, `reparto-fotos.test.ts:23`,
  `minimos-fotos.test.ts:41-45,65-84`, `imagenes.test.ts:85-135,192-225`,
  `informe-preview.test.ts:67,77`, `ensamblador.test.ts:443,451`,
  `lectura-informe.test.ts:458`, `fotos/route.test.ts:201-258`,
  `tipo-documento-foto.test.ts`.
- Documentos: test nuevo `lib/tipos-documento.test.ts` (ningún test fija hoy el orden).

**Verificación en casos reales:** VP-2026-0067 (recuadros y anexos idénticos; fotos
`living_comedor` visibles) y VP-2026-0079 (foto en referencias → `foto_ofertas_comparables`,
`estado_extraccion=idle`, corrida de RF-09; fecha de visita ingresada con navegador en inglés).

**Spec:** al aprobarse, bump a v1.9.18 con `git mv`: §1.5.1.1 (orden de documentos), §2.6
(catálogo y sección de fotos), §4.2.1 (campo `D_TipoDocumento.orden`) y una regla general de
formato de fecha en UI.
