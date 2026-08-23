# Anotaciones de Héctor sobre el diseño IF Tasador v4 — lectura punto por punto

> **Fuente:** `docs/_md/Imagenes_IF_Tasador_v4.pdf` · 30 páginas · **pp. 17 a 30 son las
> anotaciones de Héctor** sobre siete pantallas. Las pp. 1 a 16 son la auditoría del código
> v0 y ya estaban procesadas (CI-013 a CI-021 · v1.9.9).
>
> **Imágenes extraídas:** 22 archivos en `docs/_md/img_hector_v4/`, nombrados
> `p<página>_<n>.png` con la página del PDF, no la de la pantalla.
>
> **Fecha de la lectura:** 19-ago-2026 · Paso 4 de la tanda de reconciliación previa a P4-TAS.
>
> **Qué es este documento.** El acta de lectura de las anotaciones: qué pidió Héctor, qué RF
> toca, qué inconsistencia o ambigüedad abre o cierra, y qué literales de la pantalla dejan
> de ser texto de UI para volverse dato persistido o valor de catálogo. **No es normativo**:
> lo normativo se aplicó en la spec v1.9.10 y en `docs/CODE_INCONSISTENCIES.md`.

## Cómo leer la columna "literales que se vuelven datos"

Un literal de UI que el diseño muestra puede tener tres destinos distintos, y confundirlos
es el error caro:

- **`campo`** — se persiste en Airtable. Necesita columna, tipo y FIELD_ID.
- **`catálogo`** — es un valor de un dominio cerrado. Necesita decidir si vive en el schema
  (singleSelect) o en una tabla paramétrica, porque eso determina si agregar un valor exige
  deploy.
- **`copy`** — es texto fijo de interfaz. No es dato, pero sí es literal §6 y no admite
  variación al escribirlo en el código.

---

## Pantalla 2 · "COORDINAR VISITA" — puntos 1 a 4

**Páginas 18 y 19 del PDF · imágenes `p18_1`, `p18_2`, `p19_1`, `p19_2`, `p19_3`.**

Es la pantalla que **revierte RO-29**. La transcripción literal de los cuatro puntos está en
`docs/CODE_INCONSISTENCIES.md` → CI-012 → *"Cita literal — Pantalla 2"*, y es la evidencia
que gobierna el cierre. Aquí se lee lo que cada punto implica.

| # | Qué pide Héctor | RF-TAS que impacta | CI / A que abre o cierra | Literales que se vuelven datos |
|---|---|---|---|---|
| **1** | Que la pantalla muestre **los datos que van en el correo que la ejecutiva envía al asignar tasador** | **RF-TAS-03** (pantalla resumen y registro del resultado). Confirma el contenido de los cuatro bloques colapsables contra §1.6.3 | **Cierra CI-012** en su tramo de lectura: la pantalla existe y tiene origen de datos | **Encabezado**: `Empresa` (cliente institucional) · `Fecha de solicitud` · `Código VP` (`VP-2026-0530`) con acción **"Copiar"** (`copy`). **Propiedad**: badge `Usado`/`Nuevo` (`catálogo` · `tipoPropiedadNuevoUsado`) · `Dirección` · `Comuna` · `Valor estimado` en UF · tabla **Unidades y Roles SII** con `N°`, `Dirección`, `Rol SII`, `Sup. m²` — **un Rol SII por unidad, no uno por solicitud**. **Personas**: `Vendedor` + `RUT` · **Contactos de visita** ordenados, con badge **"PRIORIDAD 1"** (`campo` · `ordenPrioridad` de `TX_ContactosVisita`), teléfono como enlace `tel:` y email · `Observaciones`. **Adjuntos**: nombre de archivo + tamaño |
| **2** | Que al **confirmar coordinación** se envíe **email a la ejecutiva con la fecha de la visita y la nota escrita**, identificando solicitud y propiedad | **RF-TAS-13** (contenido de los correos) · **RF-TAS-03** (persistencia) | **Cierra CI-012** en sentido positivo. **Repone** la plantilla `email_coordinacion_confirmada` que `docs/schema-airtable.md` §26.2 dio de baja | `Fecha planificada de visita` **obligatoria** (`campo` · `fecha_visita_propuesta`) · `Nota de la coordinación (opcional)` (`campo`) con placeholder `"Ej: Portero autoriza acceso 10-13h"` (`copy`) · botón **"Confirmar coordinación"** (`copy`) · `estado_coordinacion = confirmada` (`catálogo`) · plantilla `email_coordinacion_confirmada` |
| **3** | Que al **devolver a ejecutiva** se envíe **email con motivo y detalle** de que no se pudo contactar o coordinar | **RF-TAS-12** (catálogo de motivos y detalle mínimo) · **RF-TAS-13** | **Reabre A-17** —el catálogo de motivos vuelve a ser pregunta viva, porque ahora sí hay tabla donde tipar `motivo`—. **Abre A-20**: el texto pide "CON LA FECHA DE LA VISITA" en una rama que no captura fecha | **Motivo** (`catálogo`, cuatro valores exactos): `Teléfono no contesta` · `Teléfono equivocado` · `Cliente rechaza visita` · `Otro`. **Detalle** obligatorio, **mínimo 20 caracteres** (`campo`), con contador `"0/20 caracteres mínimos"` (`copy`) y placeholder `"Describe qué ocurrió para que la ejecutiva pueda corregir los datos con el cliente."` (`copy`) · botón **"Devolver a ejecutiva"** (`copy`) · `estado_coordinacion = rechazada` (`catálogo`) · plantilla `email_coordinacion_rechazada` |
| **4** | Que **la ejecutiva vea estas respuestas en su UI**, tanto la confirmación como la devolución | **RF-TAS-05** — este punto es el que lo **desbloquea** | **Cierra CI-012** en su tramo de IF-02. Obliga a **reponer** el bloque *Coordinación* de §1.3.2 y los eventos de coordinación de §1.3.3, retirados en v1.9.9 | Ningún literal nuevo: es **lectura**. Lo que se vuelve dato es la fila de `TX_CoordinacionVisita` proyectada en la pestaña **Datos** (último intento) y en la pestaña **Historial** (evento). La ejecutiva **lee, no edita** |

**Lo que estos cuatro puntos obligan a reponer** (alcance de P4-TAS, no de esta ronda):
`TX_CoordinacionVisita` + `coordinacion_vigente` + las dos plantillas de correo en el schema;
`coordinar-visita.tsx` y su `page.tsx` desde `git`; y los tipos `CoordinacionVisita`,
`MotivoNoContacto`, `MOTIVOS_DEVOLUCION`, `intento_numero` y `AccionCard`.

**Estado intermedio que el diseño fija y conviene no perder:** mientras no hay desenlace
elegido, el botón de envío está **deshabilitado con el rótulo "Selecciona un resultado"**
(`p18_2.png`), y el encabezado del bloque dice *"Llama al contacto de prioridad 1 (Fernanda
Torres) y registra el resultado."* — el nombre es interpolado, no literal.

---

## Pantalla 3 · "PERMITE INGRESAR FOTOS" — puntos 1 a 3

**Página 20 del PDF · imágenes `p20_1`, `p20_2`, `p20_3`.**

Los tres puntos dicen lo mismo desde tres ángulos: **no construir de nuevo lo que IF-02 ya
tiene.** Es la primera exigencia explícita de reutilización cruzada del cliente, y su
destino natural es **P10-TAS**, no P5-TAS.

| # | Qué pide Héctor | RF-TAS que impacta | CI / A que abre o cierra | Literales que se vuelven datos |
|---|---|---|---|---|
| **1** | Que la categoría **"Cargar documentos de la propiedad"** sea **la sección de documentos que usa la UI de la ejecutiva** — reutilizar esa funcionalidad | **RF-TAS-06** (organizador de fotos **sin** categoría Documentos) — lo **confirma**: los documentos no son una categoría de fotos, son el checklist de IF-02 embebido | No abre CI nueva. **Convierte en requisito** lo que hasta ahora era una opción de implementación de P10-TAS | `copy` de la sección: **"Cargar documentos de la propiedad"**. El dato vive donde ya vive: `TX_Adjuntos` + el catálogo `D_TipoDocumento`. **Componente a reutilizar: `document-checklist.tsx`** de IF-02 |
| **2** | Que la **lectura de documentos** muestre **sólo los documentos asociados a una propiedad nueva o usada, según corresponda** | **RF-TAS-06** | **No abre nada nuevo — reactiva P-5 y CI-001.** Es exactamente el filtro que hoy **no funciona**: `D_TipoDocumentoAtributo.condicionPropiedadAplicable` está en femenino (`nueva · usada · ambas`) y `TX_Solicitudes.tipoPropiedadNuevoUsado` en masculino (`nuevo · usado`); comparados nunca coinciden y el checklist sale vacío | `catálogo` en colisión: `nueva/usada/ambas` **vs** `nuevo/usado`. **P-5 pasa de deuda latente a bloqueante de este punto**: sin normalizar el dominio, el filtro que Héctor pide devuelve cero filas — y falla en silencio, que es el modo peor |
| **3** | *"ESTA ES LA SECCION QUE USA LA UI DE LA EJECUTIVA, QUE SE DEBE REUTILIZAR"* + captura de la sección real de IF-02 | **RF-TAS-06** · alcance de **P10-TAS** | No abre nada. **Elimina la ambigüedad de implementación**: Héctor adjunta la captura de qué componente exacto quiere | Ninguno nuevo. Es una instrucción de arquitectura, no de datos |

**Lo que Héctor NO respondió en esta pantalla, y sigue abierto:** **A-16** (mínimos de fotos
fijos o dinámicos). La captura `p20_3.png` muestra `Estacionamientos 0/1`, `Mapa de
Ubicación 0/1`, `Fachada / Exterior 0/1`, `Cocina 0/1`, `Living / Comedor 0/1` y una
**"Categoría personalizada"** con botón "Crear categoría" — y ninguna anotación aclara si
esas cifras son la regla dinámica en acción o mínimos fijos. **A-16 permanece abierta.**

---

## Pantalla 5 · "INGRESO DE DATOS" — puntos 6 a 13

**Páginas 22, 23 y 24 del PDF · imágenes `p22_1`, `p22_2`, `p23_1`, `p24_1`.**

Es el bloque más denso de la revisión y el que gobierna **P7-TAS**. El formulario tiene ocho
secciones (`p22_2.png`): **A. Visita · B. Datos de la propiedad · C. Cuadro de valoración ·
D. Comparables · E. Niveles · Terminaciones · Comodidades · F. Documentos legales ·
G. Overrides (CU-007) · H. Rentabilidad (opcional)**.

| # | Qué pide Héctor | RF-TAS que impacta | CI / A que abre o cierra | Literales que se vuelven datos |
|---|---|---|---|---|
| **6** + **6.1** | Sobre **D. Comparables**: *"mostrar de esta manera"* (adjunta captura) y *"esta categoría debe ser cambiado su diseño, por sólo mostrar datos, antes leídos"* | **RF-12** (mínimo de comparables antes de calcular) — su alcance queda condicionado | **A-13 sigue abierta y se agrava.** Héctor **repite** la instrucción sin decir **de dónde salen** los comparables si el tasador deja de capturarlos. Las tres opciones de A-13 (extracción documental · catálogo de ofertas · motor) siguen sin árbitro | Columnas de la grilla (`p23_1.png`): `N° · Dirección *` · `Comuna` · `Sup. terreno` · `Sup. const. *` · `Precio UF *` · `UF`. Fila de cierre **"Promedio homogeneizado UF/m²"** (`campo` calculado). Contador **`0 / 3`** y copy **"0 de mínimo 3 comparables"**. Los asteriscos marcan **obligatorio**, que es lo que el punto 7 generaliza |
| **7** | Que **todo dato que use el motor de cálculo se marque obligatorio (\*)** y se valide que esté escrito **antes de permitir ver informe** | **RF-TAS-18** (validación de obligatorios del motor) · **RF-TAS-16** (progreso y resumen de faltantes) | No abre CI. **Fija el criterio de qué es obligatorio**: no es una lista curada a mano, es *"todo dato que use el motor"* — deriva de `C_ReglasNegocio` / AT01, no de una constante del front | El marcador **`*`** deja de ser decoración y pasa a ser **derivado**: un campo es obligatorio **si y sólo si** el motor lo consume. Eso lo convierte en `catálogo` de origen backend, no en `copy` |
| **8** | Que al presionar **"ver informe"** se indiquen **los datos que faltan** y se lleve al **primero de la lista** | **RF-TAS-18** | No abre nada | Banner de faltantes: **"Faltan 7 datos obligatorios"** y su forma corta al pie, **"Fecha real de visita · +6 más"** (`copy` con conteo interpolado). El **salto al primer faltante** es comportamiento, no literal |
| **9** | Que **"Calcular Tasación" se habilite** cuando estén los **datos mínimos** y **todos los obligatorios del motor** | **RF-TAS-18** · **RF-TAS-07** (bloqueo durante cálculo en curso) · **RF-12** (el mínimo de 3 comparables es parte de "datos mínimos") | No abre nada. **Une** dos condiciones que la spec trataba por separado: mínimos de negocio y obligatorios del motor | Botón **"CALCULAR TASACIÓN"** (`copy`, en versales en el diseño) · indicador de progreso **`36%`** en la cabecera (`campo` derivado) |
| **10** | Que al presionar **"Calcular Tasación"** se indiquen los faltantes y se lleve al primero | **RF-TAS-18** | No abre nada. Es el punto 8 aplicado al segundo botón: **misma mecánica, dos disparadores** | Mismos literales del punto 8 |
| **11** | **— NO EXISTE EN EL ARCHIVO —** | indeterminado | **Abre A-19** · `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | — |
| **12** + **12.1** | Que al presionar **"Calcular Tasación"** se ejecute **el escenario que cambia el estado a `visitada`** en la base, **para que se dispare el trigger de Airtable que calcula (AT03)** | **RF-TAS-07** · **RF-TAS-19** (progreso de cálculo) · §2.11 (máquina de estados) | No abre CI. **Confirma** la cadena que §2.11 ya describía y **fija el punto exacto de la transición**: `asignada → visitada` ocurre **aquí**, no en la coordinación | `estado = visitada` (`catálogo` · `TX_Solicitudes.estado`). **Consecuencia operativa: es irreversible desde la UI** y es lo que hace de **P8-TAS** una tanda de modo `default` con pausa |
| **13** | Que **los valores de la tabla de características constructivas se muestren por defecto, donde corresponda** | **RF-TAS-08** (valores por defecto parametrizados) | **A-14 sigue abierta.** Héctor entrega **los valores**, que era la mitad que faltaba, pero **no dice en qué tabla viven** ni si son globales, por tipo de propiedad o por comuna. RF-TAS-08 prohíbe hardcodearlos en el front, así que sin tabla destino el subconjunto constructivo no se implementa | **La tabla completa está transcrita más abajo.** Alimenta la **sección E** del formulario (Niveles · Terminaciones · Comodidades) |

**Ambigüedad heredada que este bloque NO resuelve:** el punto 6.1 pide que D. Comparables
sea de sólo lectura, y los puntos 7 y 9 exigen validar `Sup. const. *` y `Precio UF *` como
obligatorios de esa misma grilla. Ambas cosas sólo son compatibles si **alguien más**
provee los comparables — que es literalmente la pregunta de **A-13**.

---

## Tabla del punto 13 — características constructivas principales (transcripción completa)

**Fuente:** `docs/_md/img_hector_v4/p24_1.png` · p. 24 del PDF. Es una **captura de Excel**,
no una tabla del sistema.

### Convención de marcado

- **`[inf]`** — el nombre de fila estaba **truncado por el ancho de columna del Excel** y se
  reconstruyó. Se marca porque es una inferencia, no una lectura: nadie debe crear un campo
  en Airtable con uno de estos nombres sin que Héctor confirme el rótulo completo.
- **`—`** — celda **vacía en el original**. No es "no aplica": está vacía, y eso es
  significativo (ver las anomalías al pie).

### Bloque 1 · Elementos Fundamentales

| Elemento | Materialidad / Tipo | Calidad | Estado |
|---|---|---|---|
| Estructura Soportante **[inf]** *(original: `Estructura Soporta`)* | ALBAÑILERÍA LADRILLO | BUENA | BUENO |
| Divisiones Interiores **[inf]** *(original: `Divisiones Interiore`)* | ACERO VOLCANITA | BUENA | BUENO |
| Entrepisos | — | BUENA | BUENO |
| Cubierta | PLANCHA METALICA | BUENA | BUENO |
| Revestimiento exterior **[inf]** *(original: `Revestimiento exte`)* | ESTUCO Y PINTURA | BUENA | BUENO |
| Cierros exteriores | REJA METALICA | BUENA | BUENO |
| O. Complementarias **[inf]** *(original: `O. Complementari`)* | TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA | BUENA | **BUENA** |
| Construcción anexa **[inf]** *(original: `Construcción anex`)* | — | — | — |

### Bloque 2 · Otros

| Elemento | Materialidad / Tipo | Calidad | Estado |
|---|---|---|---|
| Aire Acondicionado **[inf]** *(original: `Aire Acondicionad`)* | RADIADOR MURAL | BUENA | **BUENA** |
| Calefacción | NO PRESENTA | — | — |
| Closet Mural | MELAMINA | BUENA | BUENO |
| Muebles de cocina | MELAMINA Y CUARZO | BUENA | BUENO |
| Sanitarios | LOSA NACIONAL CORRIENTE | BUENA | BUENO |
| Grifería | NACIONAL CORRIENTE | BUENA | BUENO |
| Puerta Principal | MADERA | BUENA | BUENO |
| Ventanas | PVC TERMOPANEL | BUENA | BUENO |

### Bloque 3 · Terminaciones (por recinto)

| Recinto | Tipo de Pavimento | Material/Marca/Origen | Revestimiento de Muros | Terminación de Cielo | Iluminación | Estado |
|---|---|---|---|---|---|---|
| Estar | ENMADERADO | TIPO PISO DE INGENIERÍA | ESMALTE | ENLUCIDO / PINTURA | BUENA | BUENO |
| Dormitorios | ENMADERADO | TIPO PISO DE INGENIERÍA | ESMALTE | ENLUCIDO / PINTURA | BUENA | BUENO |
| Espacios de circulación **[inf]** *(original: `Espacios de circul`)* | ENMADERADO | TIPO PISO DE INGENIERÍA | ESMALTE | ENLUCIDO / PINTURA | BUENA | BUENO |
| Cocina | CERAMICO | TIPO PORCELANATO | CERAMICO | ENLUCIDO / PINTURA | BUENA | BUENO |
| Baños | CERAMICO | TIPO PORCELANATO | CERAMICO | ENLUCIDO / PINTURA | BUENA | BUENO |

### Notas de transcripción — leer antes de poblar ninguna tabla

1. **Seis nombres de fila son inferencias `[inf]`.** El Excel corta el rótulo al ancho de
   columna y el PDF conservó el corte. Las seis reconstrucciones son de riesgo bajo salvo
   dos: `O. Complementarias` podría ser *"Obras Complementarias"* escrito completo, y
   `Construcción anexa` podría ser *"Construcción anexada"* o estar en plural. **Pedir el
   Excel original resuelve las seis de una vez** y cuesta menos que verificarlas una a una.
2. **`Muebles de cocina` no se marca `[inf]`** aunque su celda toca el borde de la columna:
   la cadena visible es una frase completa y del mismo ancho que las que no se truncan. Si
   el Excel original la tuviera más larga, sería el séptimo caso.
3. **Dos celdas dicen `BUENA` donde el resto de su columna dice `BUENO`** — `O.
   Complementarias` y `Aire Acondicionado`, ambas en la columna **Estado**. En el resto de
   la tabla `Calidad` va en femenino y `Estado` en masculino. Son **erratas del Excel**, casi
   con seguridad, pero se transcriben tal cual: si estos valores van a un `singleSelect`,
   `BUENA` y `BUENO` son **dos opciones distintas** y la errata se convertiría en dominio.
4. **Tres filas con celdas vacías, y no significan lo mismo.** `Construcción anexa` está
   **entera vacía** (probable: la propiedad de ejemplo no la tiene). `Calefacción` tiene
   materialidad `NO PRESENTA` pero Calidad y Estado vacíos — **coherente**: lo que no existe
   no tiene estado. `Entrepisos` tiene **Calidad y Estado poblados con la materialidad
   vacía**, que es la única combinación que no se explica sola.
5. **El punto 4 anterior es la razón por la que A-14 no puede cerrarse leyendo esta imagen.**
   Estos son los valores de **una propiedad concreta**, exportados de un informe real. Que
   Héctor pida mostrarlos *"por defecto, donde corresponda"* admite dos lecturas
   incompatibles: (a) éstos son **los defaults del dominio** y se precargan siempre, o (b)
   son **un ejemplo** de qué campos deben venir precargados, con valores a definir. La
   diferencia decide si la tabla de configuración tiene una fila o muchas.
6. **En el margen izquierdo de la captura hay un texto rotado 90°, en rojo, parcialmente
   legible.** Se lee algo próximo a `DESEADO`. No se transcribe como dato porque no se puede
   leer con certeza; se deja anotado por si el Excel original lo aclara.

---

## Pantalla 6 · "MUESTRA AVANCE CALCULO TASACION" — puntos 1 a 3

**Página 25 del PDF · imagen `p25_1`.**

| # | Qué pide Héctor | RF-TAS que impacta | CI / A que abre o cierra | Literales que se vuelven datos |
|---|---|---|---|---|
| **1** | Que **esta pantalla muestre que está calculando la tasación** | **RF-TAS-19** (progreso de cálculo con stepper y avance a vista previa) | No abre nada. **Confirma** que la pantalla existe como paso propio y no como spinner dentro del formulario | Stepper de tres pasos (`catálogo` de estados de UI): **`Datos listos`** → **`Calculando tasación`** → **`Informe listo`**. Título de cierre **"Informe listo"** y subtítulo **"Tu informe está listo para revisión"** (`copy`) |
| **2** | **NO mostrar texto que indique que es con IA** | **RF-TAS-19** | **Cierra la mitad de CI-015.** CI-015 registraba dos trazas legacy del código v0: el contador *"N de 3 usados"* y el texto *"Prellenado por IA"*. Este punto **liquida la segunda de forma explícita y por decisión del cliente**, no por inferencia | Literal **prohibido**: cualquier mención a IA, "Prellenado por IA" incluido. Es una **restricción de `copy`**, y aplica a toda la interfaz del tasador, no sólo a esta pantalla |
| **3** | Que **los botones ofrezcan volver atrás e inviten a continuar con la vista previa o revisión de la tasación** | **RF-TAS-19** · enlaza con **RF-TAS-20** (informe en ocho bloques) | No abre nada. **Fija la jerarquía**: continuar es la acción primaria, volver la secundaria | **"Continuar a vista previa →"** (primario) y **"← Volver atrás"** (secundario) — `copy` literal. Nótese que **"Volver atrás" no cancela el cálculo en background**, en línea con lo que §2.7 ya fijó para "Volver" |

---

## Pantalla 7 · "MUESTRA TASACION" — puntos 2 a 5

**Páginas 26 a 29 del PDF · imágenes `p26_1`, `p26_2`, `p27_1`, `p28_1`, `p29_1`.**

El informe se muestra en **ocho bloques numerados** (`p26_1`, `p27_1`): **1 Cabecera ·
2 Valor de tasación · 3 Antecedentes de la propiedad · 4 Datos SII / Avalúo · 5 (no visible
en las capturas) · 6 Comparables · 7 Registro fotográfico · 8 Observaciones y overrides**,
con la versión visible en la cabecera (`VP-2026-0530 · v1`) y cuatro acciones al pie:
**Descargar PDF · Ver expediente · Rechazar · Confirmar**.

| # | Qué pide Héctor | RF-TAS que impacta | CI / A que abre o cierra | Literales que se vuelven datos |
|---|---|---|---|---|
| **2** | Que **"Descargar PDF" imprima con la plantilla asignada a esta solicitud** y sea **generada por Carbone** | **RF-TAS-21** (descarga con la plantilla Carbone asignada) | No abre CI. **Confirma** que la plantilla es **por solicitud**, no global — es decir, que hay un campo que la resuelve | `campo`: la plantilla asignada a la solicitud (resuelta por cliente/tipo de informe). Botón **"Descargar PDF"** (`copy`). **Motor de render: Carbone** — no `window.print()`, no un PDF del navegador |
| **3** | Que **"Ver expediente"** permita **sólo ver los archivos adjuntos de la solicitud y descargarlos** | **RF-TAS-10** ("Ver expediente" como modal reutilizado) | No abre nada. **Acota el alcance**: es un visor de adjuntos, no un explorador del expediente completo | Modal **"Expediente · VP-2026-0530"** con subtítulo **"1 archivos · solo lectura"** (`copy` — nótese la concordancia rota en el diseño) y sección **"Adjuntos de la solicitud (1)"**, cada fila con nombre, tamaño y acción **"Descargar"**. **Sólo lectura: no hay alta ni baja desde aquí** |
| **4** *(y sus sub-puntos 1 y 2)* | **Rechazo del informe generado**: *"guarda la observación del rechazo y le avisa que se lo hará saber al visador"* · *"y le despliega mensaje que debe comunicarse con el visador para solucionarlo"* | **RF-TAS-09** (rechazo con observación persistida y mensaje al tasador) | **A-15 sigue abierta y queda peor documentada que antes.** El sub-punto 1 promete un aviso al visador y el sub-punto 2 le dice al tasador que se comunique él. **El diseño real (`p28_1`) implementa sólo lo segundo.** Héctor no dice canal, plantilla ni si genera evento en `A_Eventos` | Diálogo **"Rechazar borrador"** · cuerpo **"Este informe quedará como borrador hasta que resuelvas con el visador. Tu observación queda registrada."** · pregunta **"¿Qué necesitas resolver?"** · placeholder **"Describe qué debes resolver con el visador (mínimo 20 caracteres)…"** · contador **"0/20 caracteres mínimos"** · botones **"Cancelar"** / **"Guardar observación"** (todo `copy`). La **observación** es `campo` persistido, con el **mismo mínimo de 20 caracteres** que la devolución de Pantalla 2 |
| **5** | **Aprueba informe generado** | **RF-TAS-22** (confirmación de envío al visador y acuse explícito) | **Confirma CI-017** en el sentido que ya tenía: diálogo previo y acuse con botón, **sin temporizador de redirección** | Diálogo **"¿Enviar este informe al visador?"** · cuerpo **"Una vez enviado, el informe pasará a revisión del visador y ya no aparecerá en tu lista de tasaciones."** · botones **"Cancelar"** / **"Enviar informe"** (`copy`). La frase *"ya no aparecerá en tu lista de tasaciones"* es **contrato de comportamiento**: la solicitud sale de la cola del tasador |

**Nota sobre el punto 1 de Pantalla 7.** No existe en el PDF: la p. 26 sólo contiene las
capturas "Parte 1" y "Parte 2". A diferencia del punto 11 de Pantalla 5, **no hay hueco
reservado a mitad de página**, por lo que se interpreta como numeración de las capturas y
**no se registra como ambigüedad**. Ver la observación al pie de A-19.

---

## Saldo de la lectura

### Cierra

| Qué | Por qué punto |
|---|---|
| **CI-012** — cerrada en **sentido positivo** el 19-ago-2026 | Pantalla 2, puntos 1 a 4 |
| **RO-29** — **anulada** | Pantalla 2, puntos 1 a 4 |
| **CI-015** (mitad "texto de IA") | Pantalla 6, punto 2 |
| **CI-017** — confirmada, no revertida | Pantalla 7, punto 5 |
| **RF-TAS-04** y **RF-TAS-05** — desbloqueados | Pantalla 2, puntos 1 a 4 |

### Abre

| Qué | Por qué punto |
|---|---|
| **A-19** · Pantalla 5 · anotación perdida entre puntos 10 y 12 | Pantalla 5, hueco del punto 11 |
| **A-20** · ¿la devolución lleva fecha de visita en el correo? *(propuesta, pendiente de confirmación)* | Pantalla 2, punto 3 |

### Sigue abierto — Héctor no lo respondió

| Qué | Estado tras esta lectura |
|---|---|
| **A-13** · origen de los comparables si D pasa a sólo lectura | **Se agrava**: el punto 6.1 repite la instrucción sin nombrar la fuente, y los puntos 7/9 exigen validar campos de esa misma grilla como obligatorios |
| **A-14** · dónde viven los defaults constructivos | **Avanza a medias**: el punto 13 entrega **los valores**; sigue sin tabla destino y sin scoping |
| **A-15** · si el rechazo avisa al visador | **Se agrava**: el punto 4.1 vuelve a prometer el aviso sin declarar canal, y contradice al 4.2 y al diseño real |
| **A-16** · mínimos de fotos fijos o dinámicos | **Sin novedad**: Pantalla 3 no lo menciona |
| **A-17** · catálogo de motivos paramétrico o fijo | **Reabierta de hecho**: con `TX_CoordinacionVisita` de vuelta, vuelve a determinar el tipo del campo `motivo`, y conviene cerrarla **antes** de crear la tabla |
| **A-12** · composición del chip "Hoy" | **Sin novedad útil**: Pantalla 1 punto 1.2 dice *"debe mostrar al tasador lo que debe hacer en dicho día"*, que es la definición circular que originó la ambigüedad |
| **P-5** · colisión `nueva/usada/ambas` vs `nuevo/usado` | **Pasa a bloqueante de Pantalla 3 punto 2** |

---

## Inventario de imágenes extraídas

Las 22 imágenes de `docs/_md/img_hector_v4/`, verificadas el 19-ago-2026.

| Archivo | Pantalla | Contenido |
|---|---|---|
| `p17_1.png` | 1 · Inicio del tasador | Cola del tasador con tabs |
| `p18_1.png` | 2 · Coordinar visita | Pantalla resumen completa: Encabezado, Propiedad, Personas, Adjuntos |
| `p18_2.png` | 2 | Bloque *Resultado del contacto* · dos desenlaces · botón "Selecciona un resultado" |
| `p19_1.png` | 2 | Rama *No pude contactar* · Motivo + Detalle con mínimo de 20 caracteres |
| `p19_2.png` | 2 | Desplegable de Motivo abierto · los cuatro valores del catálogo |
| `p19_3.png` | 2 | Rama *Contacto exitoso* · Fecha planificada + Nota + "Confirmar coordinación" |
| `p20_1.png` | 3 · Ingreso de fotos | Sección de documentos de la UI de la ejecutiva (la que se reutiliza · punto 3) |
| `p20_2.png` | 3 | Organizador de fotos · parte 1 |
| `p20_3.png` | 3 | Organizador de fotos · categorías con contadores y "Categoría personalizada" |
| `p21_1.png` · `p21_2.png` | 4 · Avance lectura de datos | Stepper de lectura · partes 1 y 2 (sin anotaciones) |
| `p22_1.png` | 5 · Ingreso de datos | Formulario · cabecera, progreso 36% y sección A. Visita |
| `p22_2.png` | 5 | Formulario · las ocho secciones colapsadas (A a H) |
| `p23_1.png` | 5 | **D. Comparables** · grilla del punto 6 |
| `p24_1.png` | 5 | **Tabla de características constructivas** · punto 13 |
| `p25_1.png` | 6 · Avance cálculo | Stepper de cálculo · "Informe listo" · dos botones |
| `p26_1.png` | 7 · Muestra tasación | Informe · bloques 1 a 4 |
| `p26_2.png` | 7 | Informe · parte 2 |
| `p27_1.png` | 7 | Informe · bloques 6 a 8 + modal **"Ver expediente"** |
| `p28_1.jpeg` | 7 | Diálogo **"Rechazar borrador"** |
| `p29_1.png` | 7 | Diálogo **"¿Enviar este informe al visador?"** |
| `p30_1.png` | 7 | Acuse posterior al envío |

---

## Nota de resolución · 23-ago-2026

> Añadida sin tocar el cuerpo del acta, que es la lectura del **19-ago-2026** y se conserva como
> tal. Sólo cierra el hilo que quedaba colgando.

**El punto 6.1 quedó resuelto, y en el sentido que este documento anticipó.** El acta cerraba su
bloque de Pantalla 5 diciendo que la instrucción de Héctor —*"sólo mostrar datos, antes leídos"*—
y las validaciones de los puntos 7 y 9 *"sólo son compatibles si **alguien más** provee los
comparables"*. Ese alguien ya tiene nombre: **la extracción documental sobre una foto del cuadro**
de la plantilla operativa. El cliente lo respondió el 23-ago-2026 y **A-13 cierra**.

Consecuencias sobre lo que este acta registraba:

- **A-13** deja de estar *"agravada"*: la sección D se construye de **sólo lectura** y RF-12
  conserva su mínimo de 3 **cambiando de sujeto** —valida el origen, no la captura—. Las
  validaciones de `Sup. const. *` y `Precio UF *` de los puntos 7 y 9 siguen vigentes y pasan a
  recaer sobre lo extraído.
- **A-18** cierra por disolución del requisito: sin campos editables no hay precarga que hacer.
- **A-14** ya había cerrado el 22-ago-2026 (puntos 13 y siguientes).

**Ambigüedad nueva que sale de aquí: A-44.** El cuadro que el tasador fotografía no contiene los
tres factores de homogeneización que **D-21** ratificó como vigentes un día antes. No bloquea.

Detalle en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` y en
`docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.8.
