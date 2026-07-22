**IA SOLUTION**

*Consultoría de Automatización con IA*

**VPROPERTY**

**Especificación del Proyecto**

*Sistema Configurable de Tasaciones Inmobiliarias*

Fase 2 · Análisis y Diseño · Documento maestro de requisitos

  ------------------------------------------------------------------------
  **Cliente**         VProperty --- Tasaciones de Bienes Raíces
  ------------------- ----------------------------------------------------
  **Documento**       Especificación del Proyecto (Project Specification)

  **Versión**         1.9 · Julio 2026 · Rediseño funcional de la Interfaz
                      Ejecutiva (IF-02) a partir del levantamiento
                      operativo con el cliente: wizard de creación en tres
                      fases, formulario de cuatro secciones, N unidades
                      por solicitud con origen y respaldo de superficies,
                      asignación manual asistida con confirmación
                      explícita y bloqueo de edición posterior, barra de
                      acciones de dos botones, catálogo real de tipos de
                      documento y correo único de asignación al tasador.
                      Se retira AT02 del alcance de IF-02 y WhatsApp del
                      canal de notificación al tasador. Incorpora RN-44 a
                      RN-59 y regulariza el índice de reglas RN-38 a
                      RN-43. Sucede a v1.8.2, que consolidó el dominio D\_
                      en dos tablas (D_TipoDocumento y
                      D_TipoDocumentoAtributo), la persistencia de la
                      extracción en `TX_Adjuntos.atributos_obtenidos` y el
                      enrutamiento por cardinalidad a TX_Unidades /
                      TX_DatosTasacion, con el patrón "NO REGISTRA"
                      formalizado (RN-37). Alineada a Arquitectura
                      Enterprise v2.6, Capa de Datos v2.6.3, Motor de
                      Cálculo v2.5 y Blueprint de Interfaces v2.8.

  **Equipo redactor** Analista de Requerimientos Funcionales · Arquitecto
                      de Software Enterprise · Diseñador de Datos/BD ·
                      Especialista UX/Front-End · Ingeniero de
                      Integraciones (Dropbox · Carbone.io)

  **Stack             Next.js 16 (App Router · Turbopack · Railway) ·
  tecnológico**       React 19 · TypeScript 5.7 · Tailwind v4 (@theme, sin
                      tailwind.config.js) · shadcn/ui v4 sobre
                      \@base-ui/react 1.5 · lucide-react ·
                      react-hook-form + zod (Ejecutiva) · sonner (toasts)
                      · cmdk (command palette) · Clerk · v0.dev → Claude
                      Code · Airtable · Make · Claude API · Carbone.io ·
                      Dropbox · Gmail · Mindicador. Gestor de paquetes
                      pnpm.

  **Clasificación**   Confidencial --- Uso interno VProperty
  ------------------------------------------------------------------------

# **Nota metodológica y equipo redactor**

Esta Especificación del Proyecto es producto del trabajo conjunto de
cinco roles especialistas convocados por el prompt de reestructuración
v1.3. Cada decisión documentada ha pasado por los cinco filtros antes de
quedar firme. El documento toma como insumo: (a) la Especificación v1.2
(contenido base, íntegramente preservado y redistribuido); (b) los
mockups de las interfaces Ejecutiva, Tasador y Visador; (c) el Blueprint
v8.1 de poblamiento automático desde documentos; (d) el mapeo de Origen
de Datos del Informe v1.0; y (e) los documentos oficiales de
Arquitectura, Datos, Motor de Cálculo y Blueprint de Interfaces.

  -----------------------------------------------------------------------
  **Rol redactor**        **Aporte específico a esta reestructuración**
  ----------------------- -----------------------------------------------
  Analista de             Reagrupa los 50 RF por interfaz operacional
  Requerimientos          (Ejecutiva, Tasador, Visador) manteniendo
  Funcionales             identificadores originales para trazabilidad;
                          separa lo transversal (lectura, cálculo,
                          impresión, Dropbox) en secciones propias.

  Arquitecto de Software  Vela porque la nueva estructura no rompa el
  Enterprise              mapeo con la Arquitectura v2.5 en 5 capas;
                          valida que cada RF referenciado en las
                          secciones 4--8 quede rastreable a AT01--AT10,
                          SC01--SC19 y las tablas Airtable existentes.

  Diseñador de Datos/BD   Confirma que cada requerimiento apunte a tablas
                          reales del modelo (46 tablas en 7 dominios);
                          actualiza referencias al dominio D\_
                          (documentos paramétricos) y al patrón EAV
                          polimórfico tipado.

  Especialista            Traduce los mockups de las tres interfaces en
  UX/Front-End            descripción funcional (Sección 1--3),
                          respetando la regla \"la UI muestra y captura,
                          nunca decide\"; alinea con la base v0.dev
                          previa.

  Ingeniero de            Documenta la estructura de carpetas Dropbox
  Integraciones (Dropbox  (Sección 8) y el flujo Carbone.io de generación
  · Carbone.io)           e impresión del informe (Sección 7); mapea
                          persistencia en TX_Adjuntos con dropbox_url y
                          tipo_adjunto.
  -----------------------------------------------------------------------

### **Convenciones de identificación**

Se conservan sin modificación los prefijos originales para preservar
trazabilidad histórica: RF-XX requisito funcional; RNF-XX requisito no
funcional; RN-XX regla de negocio; RT-XX restricción técnica; RR-XX
restricción regulatoria; SP-XX supuesto. La reestructuración v1.3 no
re-numera ningún identificador; sólo lo reasigna a la sección temática
que le corresponde bajo la nueva organización por interfaz.

### **Cambios estructurales v1.4 → v1.6**

  -------------------------------------------------------------------------
  **Aspecto**         **v1.4 (anterior)**        **v1.6 (actual)**
  ------------------- -------------------------- --------------------------
  Dominio D\_         Ocho tablas: D_TipoDocu-   Dos tablas: D_TipoDocumento
  (lectura de         mento, D_Atributo,         y D_TipoDocumentoAtributo.
  documentos)         D_TipoDato,                Todo el modelo paramétrico
                      D_TipoDocumentoAtributo,   se resuelve con estas dos.
                      D_Catalogo, D_CatalogoVa-  Deprecadas (v8.2):
                      lor, D_Documento,          D_Atributo, D_TipoDato,
                      D_DocumentoValorAtributo.  D_Catalogo, D_CatalogoValor,
                                                 D_Documento,
                                                 D_DocumentoValorAtributo.

  D_TipoDocumento-    Relación N:M entre         Fuente única. Consolida los
  Atributo            D_TipoDocumento y          10 campos necesarios para
                      D_Atributo (con            armar el prompt y enrutar
                      obligatoriedad, etiqueta   el resultado:
                      local y valor por          codigo_atributo,
                      defecto).                  nombre_atributo, tipo_dato,
                                                 unidad_medida, obligatorio,
                                                 ejemplo_atributo,
                                                 uso_tabla_destino,
                                                 uso_campo_destino,
                                                 uso_cardinalidad_destino,
                                                 uso_campo_link_unidad.

  Persistencia del    Se guardaba una fila en    El JSON con los atributos
  resultado de        D_Documento por cada       extraídos se guarda en
  extracción          documento y filas tipadas  `TX_Adjuntos.atributos_-
                      en                         obtenidos` del mismo
                      D_DocumentoValorAtributo   adjunto que originó la
                      (patrón EAV polimórfico).  extracción. Desde ahí se
                                                 propaga por cardinalidad a
                                                 TX_DatosTasacion o
                                                 TX_Unidades. No se
                                                 mantienen filas
                                                 intermedias en D\_.

  Catálogos cerrados  D_Catalogo + D_CatalogoVa- Los valores admitidos por
                      lor administrados como     un atributo se declaran
                      tablas.                    como opciones de un campo
                                                 singleSelect de Airtable
                                                 directamente en
                                                 D_TipoDocumentoAtributo.
                                                 Activar/desactivar valores
                                                 se hace desde la propia
                                                 columna sin tablas
                                                 auxiliares.

  Enrutamiento por    No existía.                Cada atributo declara
  cardinalidad                                   `uso_cardinalidad_destino`
                                                 con dos valores:
                                                 `una_por_solicitud` (una
                                                 vez en TX_DatosTasacion) o
                                                 `una_por_unidad` (una vez
                                                 en TX_Unidades para la
                                                 unidad ligada por
                                                 `uso_campo_link_unidad`).
                                                 Ejemplo validado (certifi-
                                                 cado de avalúo fiscal):
                                                 4 atributos a TX_Unidades,
                                                 5 a TX_DatosTasacion.

  Tabla nueva         TX_ItemsCuadroValoracion   Se incorpora TX_Unidades
  TX_Unidades         cubría el detalle de       como tabla de datos por
                      valorización granular.     unidad física del inmueble
                                                 (Depto, Estac, Bodega,
                                                 Casa) con campos rol_sii,
                                                 sup_m2, sup_terreno_m2,
                                                 avaluo_uf, anio_construccion,
                                                 tipo_material,
                                                 estado_unidad y notas.
                                                 Es la tabla destino del
                                                 patrón `una_por_unidad`.
                                                 Complementa (no reemplaza)
                                                 a TX_ItemsCuadroValoracion.

  Patrón "NO          RF-29 documentaba          RF-29 se refuerza con
  REGISTRA" (RN-37    saneamiento genérico       RN-37 (nueva), validada
  nuevo)              (avalúo `NO REGISTRA` →    contra caso real HEV-3183
                      null + flag                (Inmobiliaria Exequiel
                      avaluo_no_registra).       Fernández Torre Tres SpA,
                                                 recepción final 13-01-
                                                 2026). El prompt de Claude
                                                 API reconoce el patrón sin
                                                 fallar; el texto crudo se
                                                 preserva en
                                                 `avaluo_total_raw`; el
                                                 flag `avaluo_no_registra`
                                                 se propaga a
                                                 TX_DatosTasacion.

  Identificadores     50 RF, 22 RNF, 36 RN, 11   Mismos RF/RNF/RT/RR/SP.
                      RT, 8 RR, 12 SP (v1.4).    Se agrega RN-37 (patrón
                                                 NO REGISTRA). Cero
                                                 renumeración. Cero pérdida
                                                 de contenido.
  -------------------------------------------------------------------------

Nota sobre v1.5. La v1.5 (breve, superada por esta v1.6) solo eliminó
D_Atributo y D_TipoDato del dominio D\_, dejando mencionadas
D_Documento, D_DocumentoValorAtributo, D_Catalogo y D_CatalogoValor.
v1.6 corrige esa omisión y consolida el dominio en las dos tablas que
efectivamente existen en producción.

### **Cambios v1.8.2 → v1.9**

Esta versión no altera el modelo de datos documental ni el motor de
cálculo: concentra el cambio en la Interfaz Ejecutiva (§1), con los
efectos que de ahí se derivan sobre la Interfaz Tasador (§2), la Lectura
de Documentos (§4), la parametrización de notificaciones (§5.3), el
formulario público IF-01 (§9) y el índice de reglas (§13). El detalle
del levantamiento que la origina está en el documento UI Ejecutiva
(IF-02) — Análisis de cambios v4, insumo citado en la nota metodológica.

  -------------------------------------------------------------------------
  **Aspecto**         **v1.8.2 (anterior)**      **v1.9 (actual)**
  ------------------- -------------------------- --------------------------
  Creación de la      El botón Nueva solicitud   Abre un wizard de tres
  solicitud           abre directamente el sheet fases: modo de creación
                      de seis secciones.         (documentos o manual),
                                                 tipo de propiedad
                                                 (Nuevo/Usado) con
                                                 sugerencia asistida, y
                                                 recién entonces el
                                                 formulario, ya adaptado.
                                                 §1.5.0.

  Formulario de       Seis secciones: Origen,    Cuatro secciones: Origen,
  creación            Propiedad, Solicitante,    Propiedad, Personas de la
                      Producto, Documentos,      operación, Producto y
                      Adjuntos.                  observaciones. Documentos
                                                 y Adjuntos salen de la
                                                 creación y pasan al
                                                 detalle. §1.5.1.

  Unidades del        La solicitud se trata como Una solicitud contiene N
  inmueble            una unidad única.          unidades (departamento,
                                                 terraza, estacionamientos,
                                                 bodegas, terreno, obras
                                                 complementarias), con
                                                 catálogo cerrado de ocho
                                                 tipos de bien. §1.5.1.

  Origen de las       El m² se captura sin       Toda superficie declara su
  superficies         declarar procedencia.      origen desde catálogo
                                                 cerrado y exige adjunto de
                                                 respaldo (RN-45). §1.5.1.

  Asignación de       AT02 asigna                AT02 sale del alcance de
  tasador             automáticamente al crear   IF-02. La asignación es
                      la solicitud (§1.5.5).     manual, asistida por
                                                 comuna y carga, con tres
                                                 datos mínimos obligatorios
                                                 (RN-44) y confirmación
                                                 explícita. §1.6.

  Edición y bloqueo   Los campos críticos se     Edición total hasta la
                      bloquean desde estados     asignación. Al confirmar
                      posteriores a creada /     la asignación se registra
                      requiere_atencion.         fecha_asignacion, el
                                                 estado pasa a asignada y
                                                 la solicitud queda en modo
                                                 consulta (RN-59). §1.4.

  Barra de acciones   Sólo Reasignar tasador.    Dos botones:
  del detalle                                    Asignar/Reasignar Tasador
                                                 y Documentos y Adjuntos.
                                                 §1.3.1.

  Checklist de        Vive dentro del formulario Vive en el botón
  documentos          de creación con el         Documentos y Adjuntos del
                      catálogo TIPOS_DOCUMENTO.  detalle, con el catálogo
                                                 operativo real de 15 tipos
                                                 (§4.2.1). Disponible en
                                                 cualquier momento tras
                                                 crear la solicitud.

  Notificación al     SC13 con email y WhatsApp  Canal único: correo, con
  tasador             opcional.                  la plantilla
                                                 email_asignacion_tasador y
                                                 regla de un hilo por
                                                 solicitud (RN-52).
                                                 WhatsApp queda fuera de
                                                 alcance. §1.6.4, §5.3.

  Personas de la      Sección Solicitante; el    Comprador (siempre, viene
  operación           dato se nombra             del cliente institucional)
                      propietario.               y Vendedor (persona
                                                 jurídica en Nuevo, natural
                                                 en Usado), con jerarquía
                                                 de fuentes (RN-47).
                                                 §1.5.1, §9 RF-01.

  Reglas de negocio   Índice hasta RN-37; RN-38  Se regulariza el índice
                      a RN-43 referenciadas sin  (RN-38 a RN-43) y se
                      listar.                    incorporan RN-44 a RN-59.
                                                 §13.

  Identificadores     50 RF, 22 RNF, 37 RN, 11   Mismos RF/RNF/RT/RR. Se
                      RT, 8 RR, 12 SP.           agregan RN-44 a RN-59 y
                                                 los pendientes D-10 a D-15
                                                 (§15). Cero renumeración.
                                                 Cero pérdida de contenido.
  -------------------------------------------------------------------------

Alcance diferido de v1.9. La captura estructurada de la fecha de visita,
el reporte de contacto no logrado con bloqueo de la solicitud, la
gestión de reprocesos post-entrega, el tablero diario de las tres fechas
y la notificación por WhatsApp quedan documentados como proceso real
pero fuera de implementación en esta versión. Se registran en §1.9 con
identificador propio para que no se pierdan.

### **Nivel de detalle**

Cada requisito tiene métrica o criterio de aceptación verificable; no se
admite vocabulario vago. Donde un punto aún no puede definirse, se marca
como TBD con responsable nominado y fecha límite vinculante (Sección
15). Donde una sección referencia contenido detallado en otro documento
oficial, se cita el nombre exacto del archivo en lugar de duplicar el
contenido.

# **1. Interfaz Ejecutiva**

Interfaz de trabajo diario de la Ejecutiva Comercial. Materializa la
Capacidad C-2 (gestión comercial y bandeja operativa) y absorbe parte de
la Capacidad C-1 (creación interna de solicitudes cuando el canal es
email, teléfono, WhatsApp o presencial). Corresponde a IF-02 del
Blueprint de Interfaces (Tipo A · Next.js 14 + Clerk · Railway). La
descripción funcional que sigue refleja los mockups del proyecto
(Imagenes IF Ejecutiva.pdf); no se transcriben imágenes en el cuerpo del
texto: sólo se especifica el comportamiento que reflejan.

Contexto operacional: la Ejecutiva recibe solicitudes ya estructuradas
(creadas desde IF-01 o desde ella misma), vigila SLA, asigna y reasigna
tasadores, pausa o reactiva solicitudes y mantiene la cola operativa al
día. No accede a Airtable directamente; toda operación transacciona vía
API Route con validación server-side.

Alcance funcional v1.9. El levantamiento operativo con el área de
Control y Seguimiento fija cuatro decisiones que atraviesan toda la
sección. Primera: la solicitud no se crea desde un formulario abierto,
sino desde un wizard de tres fases que resuelve el modo de creación y el
tipo de propiedad Nuevo/Usado antes de mostrar campos (§1.5.0);
Nuevo/Usado funciona como interruptor de todo el flujo. Segunda: una
solicitud contiene N unidades físicas —departamento, terraza,
estacionamientos, bodegas, terreno, obras complementarias— y no una
unidad única (§1.5.1). Tercera: la asignación del tasador es siempre
manual, asistida por comuna y carga, exige tres datos mínimos y
confirmación explícita, y deja la solicitud en modo consulta (§1.6).
Cuarta: la barra de acciones del detalle tiene exactamente dos botones,
Asignar/Reasignar Tasador y Documentos y Adjuntos (§1.3.1).

Fuera de alcance de v1.9 en IF-02: captura estructurada de la fecha de
visita, reporte de contacto no logrado con bloqueo de la solicitud,
gestión de reprocesos post-entrega, tablero diario de las tres fechas y
notificación por WhatsApp al tasador. Cada uno queda registrado con
identificador propio en §1.9, con el proceso real documentado, para que
la versión siguiente no tenga que volver a levantarlo.

## **1.1 Vista de Solicitudes**

Bandeja unificada con vistas filtradas pre-construidas: Activas, SLA en
riesgo (amarillo/rojo), Por reasignar (\>48 h sin actividad), Bloqueadas
por cliente, Aprobadas pendientes de entrega. Patrón P1 Lista filtrable
(Blueprint de Interfaces §5.2). Cada fila muestra: código VP-AAAA-NNNN,
cliente, tipo de informe, dirección, tasador asignado, semáforo SLA,
estado y última actividad.

  -------------------------------------------------------------------------
  **RF-05**         **Bandeja unificada de solicitudes**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe mostrar la totalidad de solicitudes
                    activas con vistas filtradas pre-construidas: Activas,
                    SLA en riesgo (amarillo/rojo), Por reasignar (\>48 h
                    sin actividad), Bloqueadas por cliente, Aprobadas
                    pendientes de entrega.

  **Criterio de     Cada vista se carga en menos de tres segundos sobre una
  aceptación**      base con 500 registros activos. Las cifras de cada
                    vista coinciden 1:1 con consultas equivalentes sobre
                    TX_Solicitudes.
  -------------------------------------------------------------------------

## **1.2 Vista de SLA por Solicitud**

Semáforo verde/ámbar/rojo calculado por fórmula Airtable a partir de
dias_desde_solicitud vs sla_aplicable (C_SLA). El semáforo se debe poder
ordenar y filtrar; los tres umbrales son configurables en C_SLA sin
tocar código. Regla activa RN-04 (cálculo del SLA aplicable con WORKDAY
excluyendo H_Feriados).

  -------------------------------------------------------------------------
  **RF-08**         **Visión y mando del SLA**
  ----------------- -------------------------------------------------------
  **Descripción**   Cada fila de la bandeja muestra el semáforo SLA
                    (verde/ámbar/rojo) calculado por fórmula Airtable a
                    partir de dias_desde_solicitud vs sla_aplicable
                    proveniente de C_SLA. El semáforo se debe poder ordenar
                    y filtrar.

  **Criterio de     El semáforo refleja el estado en tiempo real (latencia
  aceptación**      menor a un minuto desde el cambio de fecha). Los tres
                    umbrales son configurables en C_SLA sin tocar código.
  -------------------------------------------------------------------------

## **1.3 Detalle de Solicitud**

La consola de la Ejecutiva se organiza en dos paneles (patrón P2 Lista +
Detalle). Panel izquierdo: pestañas de vista con contadores, fila de
filtros colapsable, selector de orden y filas de solicitud que muestran
código VP-AAAA-NNNN, cliente y comuna, StateBadge del estado, semáforo
SLA verde/ámbar/rojo según días restantes, prioridad
(Normal/Urgente/Crítico), tasador asignado y fecha de vencimiento; la
fila seleccionada se resalta. Panel derecho: cabecera con badges de
estado, SLA y prioridad, barra de acciones (§1.3.1) y pestañas Datos
(§1.3.2), Historial (§1.3.3) y Adjuntos (§1.3.4).

### **1.3.1 Barra de acciones**

Exactamente dos botones, ambos disponibles desde que la solicitud se
crea. Reutilizan la ubicación del botón Reasignar de la base v0.dev.

  ---------------------------------------------------------------------------
  **Botón**               **Comportamiento**
  ----------------------- ---------------------------------------------------
  Asignar Tasador ·       Un solo botón con dos estados: sin tasador asignado
  Reasignar Tasador       muestra Asignar Tasador; con tasador asignado
                          muestra Reasignar Tasador. Abre el diálogo descrito
                          en §1.6. La primera asignación exige los tres datos
                          mínimos de RN-44 y confirmación explícita; la
                          reasignación exige además motivo obligatorio desde
                          catálogo cerrado (§1.6.3).

  Documentos y Adjuntos   Abre un sheet lateral con el checklist de
                          documentos requeridos y la zona de carga
                          (§1.5.1.1). Disponible en cualquier momento después
                          de crear la solicitud y en cualquier orden respecto
                          de la asignación del tasador. Con la solicitud ya
                          asignada queda en modo consulta: visor y descarga,
                          sin subir ni editar.
  ---------------------------------------------------------------------------

No se incorporan a la barra las acciones de registro de fecha de visita,
respuesta al cliente, solicitud de datos al cliente ni apertura de
reproceso. Los flujos que las apoyaban están documentados como proceso
real en §1.9 y quedan fuera de implementación en v1.9.

### **1.3.2 Pestaña Datos**

Consolida el registro completo de la solicitud. Los bloques son:

  ---------------------------------------------------------------------------
  **Bloque**          **Contenido**                       **Se llena desde**
  ------------------- ----------------------------------- -------------------
  Origen y cliente    Cliente institucional, N° interno,  Ejecutiva
                      N° de solicitud, fecha de
                      solicitud, código VP-AAAA-NNNN,
                      canal de origen, tipo de cliente de
                      origen, y Ejec. Comercializador y
                      Ejec. Formalizador como campos
                      separados

  Asignación          Tasador asignado, fecha y hora de   Acción manual
                      asignación, estado de la            (§1.6)
                      notificación por correo, botón Ver
                      email enviado y botón Reenviar

  Propiedad           Proyecto o condominio (sólo Nuevo), Ejecutiva · §4
                      dirección con su origen declarado,
                      región, comuna, tipo de propiedad y
                      estado de conservación

  Vendedor            Razón social y RUT de la            Ejecutiva · §4
                      inmobiliaria en Nuevo; nombre
                      completo y RUT del propietario
                      actual en Usado; contacto y origen
                      del dato

  Unidades (tabla)    Una fila por unidad: tipo de bien,  Ejecutiva · §4
                      rol SII o marca de uso y goce,
                      superficies construida, terraza y
                      terreno, año y material, m² de
                      ampliación y su marca de
                      regularizable, origen de la
                      superficie y respaldo asociado

  Personas de la      Comprador con RUT, nombre completo, Ejecutiva · §4
  operación           email y teléfono; Vendedor con RUT
                      y nombre completo

  Contactos de visita Lista ordenada por prioridad de     Ejecutiva
                      llamada, con rol, nombre, teléfono,
                      email y estado de cada contacto

  Datos SII           Destino, códigos SII (comuna,       §4 Lectura de
                      manzana, predio), ubicación urbana  Documentos (Claude
                      o rural, superficie de terreno,     API)
                      avalúo fiscal por unidad y total,
                      contribución, avalúo exento, CG,
                      OCiv, OC y G

  Antecedentes        Permiso de edificación con número y §4 Lectura de
  legales             fecha, recepción final con número y Documentos (Claude
                      fecha, fojas, número y año de       API)
                      inscripción, líneas de edificación
                      y certificado de número

  Producto y          Cliente institucional, tipo de      Ejecutiva
  financiero          informe o producto y plazo; bloque
                      Financiero colapsado, visible sólo
                      cuando el tipo de propiedad es
                      Nuevo

  Decisión del motor  Regla ganadora y candidatas         A_DecisionesMotor
                      descartadas, tasador y visador
                      asignados
  ---------------------------------------------------------------------------

Tres precisiones de negocio sobre esta pestaña. Primera: Comercializador
y Formalizador se muestran como dos campos separados, no como uno solo.
Segunda: el avalúo fiscal total de la solicitud es la suma de los
avalúos de sus unidades —el caso habitual es departamento más
estacionamiento más bodega— y no el avalúo de una sola de ellas (RN-48);
el monto que manda es el del certificado de avalúo, mientras que los m²
provienen de la base interna del SII. Tercera: el bloque Vendedor se
muestra tanto en Nuevo como en Usado; lo que cambia es el tipo de
persona, jurídica en Nuevo y natural en Usado.

### **1.3.3 Pestaña Historial**

Timeline único que renderiza los eventos cronológicos de A_Eventos y los
cambios auditados de A_Cambios, e incorpora: el email de asignación
enviado al tasador (asunto, destinatario y fecha, expandible al cuerpo
completo), el email de reasignación cuando aplica, la confirmación de
asignación con su timestamp y autor, y las cargas y descargas de
documentos registradas en TX_Adjuntos.

### **1.3.4 Pestaña Adjuntos**

Vista de sólo lectura: listado de los archivos de TX_Adjuntos vinculados
a la solicitud, con visor embebido (PDF) o miniatura (imagen) y descarga
del original. La URL apunta a Dropbox (§8). Toda alta, reemplazo o baja
de archivos se realiza desde el botón Documentos y Adjuntos (§1.3.1), no
desde esta pestaña.

Documentos legales y de origen: cuando la solicitud tiene documentos
ingresados por IF-01, por la Ejecutiva o por el tasador, se listan aquí
con el estado de la extracción realizada por Claude API (§4 Lectura de
Documentos). Si un documento fue procesado, la Ejecutiva ve una tarjeta
con los atributos extraídos y la trazabilidad al tipo D_TipoDocumento.

Agrupación por versión del informe: la operación real produce un solo
archivo Excel de cálculo y hasta tres PDF sucesivos por tasación, y el
negocio necesita comparar el valor informado entre versiones (RN-56). La
pestaña agrupa los archivos por versión y muestra, para cada una,
número, fecha de envío, valor en UF y motivo del cambio.

## **1.4 Modificación de detalles**

Ciclo de edición y bloqueo. Antes de asignar tasador, la Ejecutiva puede
modificar todos los datos de la solicitud —Origen, Propiedad, Vendedor,
Unidades, Personas de la operación, Producto, Contactos de visita y
adjuntos—: no hay campos protegidos. Al confirmar la asignación (§1.6)
la solicitud pasa a estado asignada y el formulario completo queda en
modo consulta. Desde ese punto, la única vía para corregir un dato es la
reasignación con motivo obligatorio del catálogo cerrado; v1.9 no
contempla un flujo de edición de solicitud asignada independiente de la
reasignación.

Esta regla sustituye a la de v1.8.2, que bloqueaba sólo los campos
críticos (cliente, propiedad, RUT) en estados posteriores a creada o
requiere_atencion. El motivo del cambio es operativo: la solicitud llega
incompleta y se completa por partes durante horas o días, de modo que el
hito que separa la preparación de la producción no es el estado de
creación sino la salida al tasador.

La edición es inline sobre campos no-cálculo. Toda modificación queda
auditada en A_Cambios con before/after, autor (email del ejecutivo
autenticado con Clerk) y timestamp. Los campos en modo consulta muestran
tooltip explicativo con el motivo del bloqueo y el acceso directo a
Reasignar Tasador.

  ---------------------------------------------------------------------------
  **RN-59**           **Ciclo de edición y bloqueo de la solicitud tras la
                      asignación**
  ------------------- -------------------------------------------------------
  **Precondición**    Existe una solicitud creada en IF-02, con o sin tasador
                      asignado.

  **Acción**          Mientras no exista confirmación de asignación, todos
                      los campos de la solicitud son editables por la
                      Ejecutiva y cada cambio se audita en A_Cambios. Al
                      presionar Asignar Tasador el sistema exige confirmación
                      explícita en un diálogo que enuncia las consecuencias;
                      al confirmarla ejecuta de forma atómica cuatro pasos:
                      registro de `fecha_asignacion` con hora de servidor,
                      cambio de estado a asignada, disparo de SC13 con la
                      plantilla `email_asignacion_tasador`, y transición del
                      formulario a modo consulta.

  **Postcondición**   La solicitud queda en estado asignada y en modo sólo
                      lectura para la Ejecutiva. Las únicas acciones
                      disponibles son Reasignar Tasador —con motivo
                      obligatorio del catálogo cerrado, §1.6.3— y Documentos
                      y Adjuntos en modo consulta. Si cualquiera de los
                      cuatro pasos falla, ninguno se persiste y la solicitud
                      permanece editable.

  **Trazabilidad**    Definición del cliente en el levantamiento operativo
                      v1.9. Sustituye a la regla de bloqueo por campos
                      críticos vigente hasta v1.8.2. Ver §1.3.1, §1.6 y §13.
  ---------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-07**         **Cambio de prioridad y pausa**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecutiva puede cambiar la prioridad de una
                    solicitud (Normal / Urgente / Crítico) y pausar la
                    solicitud llevándola al estado=requiere_atencion con
                    motivo obligatorio. El sistema debe permitir reanudarla
                    devolviéndola al estado previo.

  **Criterio de     El cambio de prioridad a Urgente o Crítico exige
  aceptación**      justificación. La pausa y reanudación están auditadas
                    en A_Eventos con before/after del estado y motivo.
  -------------------------------------------------------------------------

## **1.5 Creación de Solicitud**

Alta manual cuando la solicitud llega por email, teléfono, WhatsApp o
presencial (no por el formulario público IF-01). Desde v1.9 el botón
Nueva solicitud no abre directamente el formulario: abre el wizard de
tres fases descrito en §1.5.0, que resuelve el modo de creación y el
tipo de propiedad antes de mostrar campos. El primer campo obligatorio
del formulario sigue siendo el canal de origen, al que se suma el tipo
de cliente de origen.

### **1.5.0 Wizard de creación (tres fases)**

Cada fase habilita la siguiente. El wizard existe porque las dos
decisiones que condicionan todo el formulario —de dónde salen los datos
y si la propiedad es Nueva o Usada— se toman en la operación real antes
de escribir el primer campo; tomarlas después obliga a rehacer el
trabajo.

**Fase 1 · Modo de creación.** Dos opciones excluyentes (radio
button):

  ---------------------------------------------------------------------------
  **Opción**              **Efecto**
  ----------------------- ---------------------------------------------------
  En base a documentos    Habilita la zona de carga. La Ejecutiva sube los
  adjuntos                documentos; el flujo de extracción de §4 (SC07 →
                          Claude API) obtiene los datos y el formulario de la
                          Fase 3 se abre pre-llenado, para revisión y
                          edición. El texto del correo del cliente entra por
                          esta vía cuando aporta información: se guarda como
                          `.txt`, `.eml` o PDF impreso y se procesa como un
                          documento más.

  Manual                  El formulario de la Fase 3 se abre en blanco.
  ---------------------------------------------------------------------------

**Fase 2 · Tipo de propiedad.** Dos opciones excluyentes (radio
button). Es la decisión que actúa como interruptor de todo el flujo y
es lo primero que hace el área de Control y Seguimiento al recibir una
solicitud. Nuevo/Usado deja de ser un campo del formulario y pasa a ser
una decisión previa, persistida en TX_Solicitudes.

  ---------------------------------------------------------------------------
  **Aspecto**             **Nuevo**                 **Usado**
  ----------------------- ------------------------- -------------------------
  Bloque Vendedor         Persona jurídica: razón   Persona natural: nombre
                          social y RUT de la        completo y RUT del
                          inmobiliaria              propietario actual. No se
                                                    oculta

  Bloque Financiero       Se muestra                Oculto

  Proyecto / Condominio   Obligatorio               Oculto

  Modelo (por unidad)     Aplica                    No aplica

  N° de unidades          Varias: departamento,     También varias: el
                          estacionamiento y bodega  departamento usado
                                                    igualmente tiene
                                                    estacionamiento y bodega

  Rol SII                 Puede estar en trámite    Siempre asignado

  Estado de conservación  Catálogo cerrado de seis  Mismo catálogo cerrado de
                          valores                   seis valores

  Fuente de los m²        Carta oferta o ficha de   Base interna del SII por
                          la inmobiliaria, más      comuna y rol, validada en
                          plano                     terreno por el tasador

  Fuente de permiso y     Certificados originales   Escritura original de
  recepción               de la DOM, del edificio   compraventa, certificados
                          completo                  DOM y certificados
                                                    municipales, de la
                                                    vivienda particular

  Documentos habituales   Carta de la inmobiliaria, Certificado de avalúo,
                          plano con m², permiso de  captura de la base
                          edificación, recepción    interna SII, permiso y
                          final                     recepción cuando existan,
                                                    certificado de número

  Precio de referencia    Lista más descuentos y    Valor de venta directa
                          bonos
  ---------------------------------------------------------------------------

Las filas de bloques, unidades, rol y estado se reflejan en esta
interfaz. Las filas de fuentes y documentos condicionan además la
Interfaz Tasador (§2) y el motor de reglas (AT01 · §5.1 y §6).

Sugerencia asistida. Cuando la Fase 1 aportó documentos, el sistema
propone Nuevo o Usado y muestra en qué se basa. Las señales son cuatro:
presencia de nombre de proyecto, presencia de nombre de inmobiliaria,
dominio del correo de contacto (un dominio genérico no sugiere nada; el
de una inmobiliaria sí) y la dirección. La sugerencia nunca decide: la
Ejecutiva confirma o corrige, y sólo el valor confirmado se persiste.

Reutilización de antecedentes del mismo edificio. Si la dirección o el
nombre de proyecto coinciden con solicitudes anteriores, el wizard
ofrece reutilizar el permiso de edificación y la recepción final ya
cargados, para no volver a pedirlos. Dos advertencias condicionan el
diseño: la coincidencia es heurística, porque la base interna del SII no
trae identificador de edificio ni de condominio, sólo dirección y rol; y
direcciones distintas pueden corresponder al mismo edificio (dos casas
demolidas y un edificio nuevo sobre ellas). Por eso la reutilización se
ofrece siempre como sugerencia con confirmación explícita, nunca de
forma automática. El criterio de identidad de edificio queda pendiente
de confirmación (§15, D-14).

**Fase 3 · Formulario de creación.** Abre el sheet de §1.5.1 ya adaptado
a las decisiones anteriores. Si la Fase 1 fue documentos, los campos
resueltos vienen pre-llenados con marca visual "extraído" que indica el
documento de origen, y el resto queda vacío. Si la Fase 2 fue Nuevo, se
muestran los bloques Financiero, Proyecto, Modelo y Vendedor persona
jurídica. Si fue Usado, esos bloques quedan ocultos y Vendedor pasa a
persona natural.

Distinción operativa entre los dos puntos de carga de documentos. Los de
la Fase 1 son fuente de datos para la creación. Los del botón Documentos
y Adjuntos del detalle (§1.3.1) sirven para agregar y gestionar
documentos después de creada la solicitud, que es como llega la mayoría:
los antecedentes aparecen tarde, muchas veces recién en el reproceso.

### **1.5.1 Ingreso de datos**

Sheet lateral "Nueva solicitud interna" con formulario seccionado
(patrón P3 · Blueprint de Interfaces §5.4). Cuatro secciones plegables,
no seis: Documentos y Adjuntos dejan de ser secciones de la creación y
pasan al botón del detalle (§1.5.1.1). Validaciones con react-hook-form
+ zod, mensajes de error inline en español y toast de éxito/error
(sonner). Autosave cada 30 segundos. Campos dependientes: cliente →
tipos de informe/producto disponibles; región → comuna; producto → banco
financista obligatorio o no.

**Sección A · Origen.**

Banco originador (M_BANCOS), N° de operación cliente, sucursal
originadora, ejecutivo solicitante, canal (email, teléfono, WhatsApp,
presencial) y Ejec. Comercializador. Se agregan dos campos nuevos: Ejec.
Formalizador, manual y opcional, separado del Comercializador y no
fundido con él; y tipo de cliente de origen, selector cerrado de tres
valores que determina cuánta información llega y qué se puede
pre-llenar. Se registra en TX_Solicitudes para trazabilidad y para
calibrar expectativas de completitud.

  ---------------------------------------------------------------------------
  **Tipo**              **Qué trae**              **Consecuencia en la UI**
  --------------------- ------------------------- ---------------------------
  1 · Correo con texto  Nombre del comprador, con El texto del correo se
                        suerte el RUT, un         guarda como documento
                        contacto y un teléfono. A adjunto y se usa el modo en
                        veces sin dirección       base a documentos. Si no
                                                  aporta valor, se crea en
                                                  modo manual

  2 · Correo con ficha  Ficha completa: comprador Caso ideal para el modo en
  adjunta               y RUT, vendedor y RUT,    base a documentos: se
                        dirección, roles y a      cargan la ficha y los
                        veces certificados        certificados

  3 · Extranet          ID del cliente, nombre y  Similar al tipo 1: se
                        RUT. Poco más             descarga la ficha o el
                                                  volcado del portal como
                                                  documento y se procesa
                                                  igual
  ---------------------------------------------------------------------------

La sección incorpora además el bloque repetible Contactos de visita
(botón "+ Agregar contacto", al menos uno). El contacto es normalmente
un tercero que muestra la propiedad y no necesariamente el dueño. El
orden de la lista define la prioridad de llamada del tasador: el primero
es el contacto principal. Por cada contacto se captura rol o relación
(selector cerrado: propietario, corredor, arrendatario, conserje, otro),
nombre, teléfono, email y estado del contacto (válido, no contesta,
teléfono erróneo). Los contactos son editables hasta la asignación del
tasador, junto con el resto de los datos (§1.4).

**Sección B · Propiedad.**

Rediseñada para N unidades. Tres bloques.

*Datos de la propiedad*, una vez por solicitud: proyecto o condominio
(obligatorio si Nuevo), dirección, región y comuna (cascada
Región→Comuna sobre M_Comunas), tipo de propiedad (M_TiposPropiedad con
requiere_subtipo dinámico) y estado de conservación. Este último es un
catálogo cerrado de seis valores mandatado por los clientes —nuevo, sin
uso, bueno, normal, malo, deficiente— que se fija a nivel de propiedad y
se hereda a todos los recintos; el tasador lo cambia sólo por excepción
y el cambio queda auditado (RN-49). No debe confundirse con
`estado_unidad`, que es otro campo con otro propósito (§4.3.3).

Sobre la dirección rige una jerarquía de fuentes (RN-46): primero la que
viene en la ficha del cliente, que es la mandatada; si no hay ficha, la
del certificado de avalúo; y en reproceso, la del certificado de número,
que es la que exigen los abogados en el estudio de títulos y la causa
más repetida de devolución. La UI registra de cuál de las tres proviene
la dirección vigente.

*Vendedor*, una vez por solicitud, presente tanto en Nuevo como en
Usado. En Nuevo: razón social y RUT de la inmobiliaria, más correo y
teléfono de contacto. En Usado: nombre completo y RUT del propietario
actual. En ambos casos se registra el origen del dato según la jerarquía
correo → ficha → certificado de avalúo (RN-47). El bloque no se oculta
en Usado: lo que cambia es el tipo de persona.

*Unidades*, bloque repetible (botón "+ Agregar unidad"). La composición
real observada es: un departamento se compone de departamento con rol,
terraza como superficie de la propia unidad, uno o dos estacionamientos
con rol o de uso y goce, una o dos bodegas y, excepcionalmente, terreno
cuando es primer piso con polígono de uso y goce; una casa nueva, de
edificación y terreno; una casa usada, de terreno, construcción de piso
1, construcción de piso 2, construcción de ampliaciones y obras
complementarias (piscina, cierre, pavimento). Campos por unidad:

- Depto / Torre / Piso.
- Modelo --- sólo cuando el tipo de propiedad es Nuevo.
- Tipo de bien --- selector cerrado de ocho valores.
- Con rol / Uso y goce --- aplica a estacionamiento, bodega y al terreno
  de uso y goce del primer piso.
- Rol SII --- obligatorio si la unidad es \"con rol\"; admite la marca
  \"en trámite\" sólo cuando el tipo de propiedad es Nuevo.
- Superficie construida m².
- Superficie terraza m².
- Superficie terreno m² --- casas, y departamentos de primer piso con
  polígono de uso y goce.
- Año de construcción y material predominante (albañilería, madera,
  hormigón, mixto, perfiles metálicos); en Usado provienen de la base
  interna del SII.
- m² de ampliación y marca ¿regularizable? sí/no --- sólo Usado. Los
  mide el tasador en terreno y sólo se valorizan si son regularizables
  (RN-50).
- Origen de la superficie --- selector cerrado: carta o ficha de la
  inmobiliaria · plano · base interna SII · certificado de avalúo ·
  medición del tasador.
- Respaldo --- adjunto obligatorio, asociado al origen declarado
  (RN-45).
- Detalle del ítem --- texto libre; obligatorio cuando el tipo de bien
  es Obras complementarias (por ejemplo cierre o pavimento).
- Sub-ítems --- opcional; permite agregar tipos de bien adicionales a la
  misma unidad (departamento de primer piso con terreno de uso y goce;
  casa con construcción de piso 1, piso 2 y ampliaciones).

El tipo de bien es un catálogo cerrado de ocho valores, tomado del
banner de ítems del cuadro de valorización: Edificación · Terreno ·
Estacionamiento cubierto · Estacionamiento descubierto · Estacionamiento
uso y goce · Bodega · Piscina · Obras complementarias. Se materializa en
la tabla M_TiposDeBien. La terraza no es un valor del catálogo: se
captura como superficie propia de la unidad y se expresa como línea
separada en el cuadro de valorización, donde se pondera al 50% (RN-09).

La regla de fondo detrás de origen más respaldo es textual del cliente:
siempre se necesita un respaldo de esos metros cuadrados. Ningún m²
queda en el sistema sin declarar de dónde salió y sin archivo que lo
sostenga (RN-45).

**Sección C · Personas de la operación.**

Sustituye a la sección Solicitante de v1.8.2. El cambio es de fondo y no
de nombre: el cliente institucional está evaluando y financiando al
comprador, y el dato que llega identificado como "cliente" es siempre el
comprador, no el dueño de la propiedad.

  ---------------------------------------------------------------------------
  **Persona**           **Obligatoriedad y campos** **Jerarquía de fuentes**
  --------------------- --------------------------- -------------------------
  Comprador (cliente    Siempre obligatorio. RUT,   Siempre proviene del
  final evaluado)       nombre completo, email y    cliente institucional
                        teléfono

  Vendedor (propietario Obligatorio en compraventa. Correo → ficha →
  actual)               En refinanciamiento         certificado de avalúo
                        coincide con el comprador.  (RN-47)
                        RUT y nombre completo
  ---------------------------------------------------------------------------

Nombre y RUT incompletos de comprador y vendedor son la primera causa de
reproceso, de modo que ambos validan RUT con módulo 11 en vivo y
formateo automático (RN-02). La desambiguación alcanza también a IF-01,
donde el mismo dato se nombraba propietario (§9, RF-01).

**Sección D · Producto y observaciones.**

Cliente institucional y tipo de informe o producto (lookup a
M_Clientes.tipos_informe_permitidos); si el producto es Hipotecario o
Refinanciamiento, banco financista pasa a obligatorio. Observaciones
libres. Se agrega el bloque Financiero, colapsado por defecto y visible
sólo cuando el tipo de propiedad es Nuevo: valor total UF (renombra el
actual "valor estimado"), subsidio habitacional, ahorro, mutuo
hipotecario, pago contado, bono captación, bono integración y precio de
venta.

**Habilitación del botón Crear solicitud.**

Depende únicamente de los campos obligatorios de las cuatro secciones.
No depende de documentos ni de archivos adjuntos. El control de
completitud fuerte está en el botón Asignar Tasador (RN-44 · §1.6.1), no
aquí: una solicitud puede crearse incompleta; lo que no puede es salir
al tasador incompleta.

### **1.5.1.1 Documentos requeridos (checklist)**

El checklist deja de vivir en el formulario de creación y pasa al botón
Documentos y Adjuntos del panel de detalle (§1.3.1). El sheet lateral
que abre ese botón tiene dos bloques: el checklist de documentos
requeridos, alimentado por el catálogo D_TipoDocumento (§4.2.1), y la
zona de carga reutilizable (§1.5.1.2), que sube directo a Dropbox y
registra en TX_Adjuntos. Está disponible en cualquier momento después de
crear la solicitud y en cualquier orden respecto de la asignación del
tasador.

Cada fila expone el tipo de documento, la entidad emisora y la vigencia
por defecto. La lógica de marcado se conserva sin cambios: la solicitud
puede crearse sin adjuntar documentos; sólo cuando el usuario marca
explícitamente un documento del checklist, el sistema exige el archivo
correspondiente. Si el usuario desmarca un documento que ya tenía
archivo, se abre un AlertDialog de confirmación antes de descartar el
vínculo.

Lo que cambia es la consecuencia del marcado. Hasta v1.8.2, un documento
marcado sin archivo deshabilitaba el botón Crear solicitud. Desde v1.9
el checklist no condiciona la creación —que depende sólo de los campos
obligatorios de las cuatro secciones, §1.5.1— sino que expone el estado
de completitud documental de la solicitud en el panel de detalle. La
razón es operativa: la mayoría de los documentos no llega al inicio,
sino semanas después, cuando el cliente está escriturando.

Con la solicitud ya asignada, el sheet queda en modo consulta: visor y
descarga, sin subir ni editar (§1.4).

El catálogo operativo de tipos de documento con el que se alimenta este
checklist —quince tipos, con su momento de llegada, lo que aporta cada
uno y si admite extracción automática— se especifica en §4.2.1.

### **1.5.1.2 Zona de carga reutilizable (FileUploadZone)**

Componente reutilizable de carga con drag-and-drop. Desde v1.9 se usa en
tres puntos: la Fase 1 del wizard de creación (§1.5.0), el sheet del
botón Documentos y Adjuntos del detalle (§1.5.1.1) y la carga del
respaldo de superficie de cada unidad (§1.5.1, Sección B). Presenta
cuatro estados visuales explícitos: idle, subiendo (barra de progreso),
éxito y error (con acciones reintentar/descartar). Valida formato
admitido (PDF, JPG, PNG) y tamaño máximo (10 MB). Cada archivo aceptado
se sube directamente a Dropbox por el flujo definido en §1.5.3 y se
registra en TX_Adjuntos.

### **1.5.2 Lectura de documentos**

Los adjuntos cargados en la Fase 1 del wizard (§1.5.0), en el botón
Documentos y Adjuntos del detalle (§1.5.1.1) y como respaldo de
superficie de una unidad DISPARAN ASINCRÓNICAMENTE EL FLUJO DE
EXTRACCIÓN SC07 → Claude API. Los atributos extraídos se muestran a la
Ejecutiva conforme llegan (progressive UI) y, cuando el origen es la
Fase 1, pre-llenan el formulario de la Fase 3 con marca visual
"extraído" e indicación del documento de origen. El detalle del patrón
se especifica en la §4 Lectura de Documentos y se rige por la regla de
identificación mediante coincidencia con D_TipoDocumentoAtributo.

Excepción documentada. El certificado de avalúo fiscal no admite
descarga automática: el sitio del SII exige captcha. Alguien debe
descargarlo y subirlo manualmente. En consecuencia, el modo en base a
documentos del wizard no puede asumir su disponibilidad al momento de
crear la solicitud (§4.2.1).

### **1.5.3 Guardado en Dropbox**

Cada archivo cargado por la Ejecutiva (o por el solicitante externo en
IF-01) se sube directamente a Dropbox vía API Route Next.js con el rango
de bytes en streaming (nunca pasa por Airtable). La estructura de
carpetas, el naming de archivos y la persistencia de dropbox_url +
tipo_adjunto en TX_Adjuntos se especifican en la §8 Guardar
Archivos/Fotos en Dropbox.

### **1.5.4 Cambio de estado automático**

Al hacer submit válido, el sistema persiste la fila en TX_Solicitudes
con estado=creada, origen_canal=ingreso_manual, genera el código
VP-AAAA-NNNN (autogenerado server-side) y dispara los siguientes eventos
en cascada: (a) A_Eventos evento_tipo=\'solicitud_creada_interna\'; (b)
SC01 (webhook Make de validación) → AT01 (resolver motor de reglas). La
cascada termina en AT01. AT02 (asignar tasador) sale del alcance de
IF-02 en v1.9, porque la asignación es manual y ocurre más tarde, desde
el panel de detalle (§1.6). En caso de fallo de validación, el estado no
avanza y queda registrada la excepción en Z_ColaPendientes.

  -------------------------------------------------------------------------
  **RF-04**         **Disparo de la máquina de estados**
  ----------------- -------------------------------------------------------
  **Descripción**   El envío del formulario (público o interno) debe
                    insertar una fila en TX_Solicitudes con estado=creada,
                    generar el código identificador VP-AAAA-NNNN y disparar
                    el webhook Make SC01 → AT01 (resolver motor de reglas).
                    La cascada no incluye AT02: en v1.9 la asignación del
                    tasador es manual (§1.6).

  **Criterio de     100% de las solicitudes enviadas quedan persistidas
  aceptación**      (cero pérdida). La resolución del motor se completa en
                    menos de cinco segundos en el percentil 95 medido sobre
                    TX_Solicitudes.estado vs A_DecisionesMotor.timestamp.
  -------------------------------------------------------------------------

### **1.5.5 Asignación de Tasador (fuera del flujo de creación)**

v1.9 elimina la asignación automática del flujo de creación. AT02
(Airtable Script que selecciona al tasador con menor carga relativa
—casos_en_curso / capacidad_activa— entre los que tienen la comuna de la
solicitud en sus zonas_cobertura y están activos) deja de dispararse
desde IF-02. El script y la regla RN-03 se conservan en el catálogo de
automatizaciones (§6.2) para eventuales usos futuros, pero ninguna
solicitud creada desde IF-02 los invoca.

El motivo es operativo: la asignación se decide caso a caso en función
de la comuna y la región, y depende de disponibilidad real que el
sistema no conoce. Lo que el sistema sí puede hacer es asistir la
decisión sin tomarla, y eso es lo que especifica §1.6.

Consecuencia sobre la máquina de estados: una solicitud recién creada
queda en estado creada, sin tasador, y ahí permanece hasta que la
Ejecutiva confirme la asignación. No pasa a requiere_atencion por
ausencia de tasador, porque esa ausencia es ahora la situación normal
entre la creación y la asignación manual. El estado asignada, ya
existente en la máquina de estados, es el que recibe la solicitud al
confirmarse la asignación (§1.6.2).

## **1.6 Asignación y Reasignación de Tasador**

Un solo flujo, accesible desde el botón único de la barra de acciones
(§1.3.1). La asignación es siempre manual y siempre de la Ejecutiva: el
sistema ordena, informa y advierte, pero no decide.

### **1.6.1 Datos mínimos para asignar**

El tasador no puede empezar a trabajar sin tres datos. Son la condición
de habilitación del botón Asignar Tasador, no la del botón Crear
solicitud:

1. Dirección de la propiedad.
2. Al menos un contacto de visita con teléfono.
3. Rol SII --- admite la marca "en trámite" sólo cuando el tipo de
   propiedad es Nuevo.

Mientras falte cualquiera de los tres, el botón queda deshabilitado con
tooltip que enumera exactamente qué falta.

  ---------------------------------------------------------------------------
  **RN-44**           **Datos mínimos para asignar tasador**
  ------------------- -------------------------------------------------------
  **Precondición**    Una solicitud existe en IF-02 y la Ejecutiva intenta
                      asignarle tasador.

  **Acción**          El sistema verifica tres datos: dirección de la
                      propiedad, al menos un contacto de visita con teléfono,
                      y rol SII. El rol admite la marca "en trámite"
                      únicamente cuando el tipo de propiedad es Nuevo. Si
                      falta alguno, el botón Asignar Tasador permanece
                      deshabilitado con tooltip que enumera los faltantes.

  **Postcondición**   Ninguna solicitud sale al tasador sin los tres datos.
                      La regla no condiciona la creación: una solicitud puede
                      crearse incompleta y completarse después (§1.5.1).

  **Trazabilidad**    Levantamiento operativo v1.9. Ver §1.5.1 (captura) y
                      §1.6.2 (diálogo).
  ---------------------------------------------------------------------------

### **1.6.2 Diálogo de asignación y confirmación**

El botón abre un diálogo con buscador de profesionales por nombre o RUT
(cmdk command palette). Como la asignación se decide en función de la
comuna y la región, el diálogo presenta, sin decidir por la Ejecutiva:

- los tasadores cuya `zonas_cobertura` incluye la comuna de la
  solicitud, ordenados primero;
- la carga actual de cada uno (casos en curso vs capacidad activa);
- alerta visible y no bloqueante de "fuera de cobertura" si se elige a
  otro, que queda registrada como override informado.

El campo motivo es opcional en la primera asignación. Antes de guardar,
el sistema exige confirmación explícita en un diálogo que enuncia las
consecuencias: la solicitud pasará a estado asignada, se registrará la
fecha y hora de asignación y los datos quedarán en modo consulta. Dos
botones: Confirmar asignación y Cancelar.

Al confirmar se ejecutan de forma atómica los cuatro pasos de RN-59:
registro de `fecha_asignacion` con hora de servidor, cambio de estado a
asignada, disparo de SC13 con la plantilla `email_asignacion_tasador`
(§1.6.4) y transición del formulario a modo consulta. A_Eventos registra
evento_tipo=\'asignacion_manual\' con autor, tasador, motivo y
timestamp; el panel de detalle se refresca y aparece un toast de éxito.

### **1.6.3 Reasignación**

Con tasador ya asignado, el botón muestra Reasignar Tasador y abre el
mismo diálogo con dos diferencias: el motivo pasa a obligatorio y se
elige desde catálogo cerrado, y el contador de reasignaciones
incrementa. El catálogo de motivos es:

- Indisponibilidad del tasador --- vacaciones, licencia, sobrecarga.
- Contacto no logrado reiterado.
- Fuera de cobertura.
- Sin respuesta del tasador dentro de las 4 h.
- Solicitud del cliente.
- Otro --- exige texto libre.

Al confirmar: (1) TX_Solicitudes.tasador se actualiza al nuevo tasador;
(2) el contador de reasignaciones incrementa; (3) A_Eventos registra
evento_tipo=\'reasignacion_manual\' con autor, tasador_anterior,
tasador_nuevo, motivo y timestamp; (4) el panel de detalle se refresca y
aparece un toast de éxito; (5) SC13 notifica por correo al tasador
entrante.

Caso operativo de referencia: el tasador avisa dentro de las cuatro
horas que no puede tomarla; se reasigna a otro y la solicitud sigue
activa, con el mismo cliente y los mismos datos. No se anula ni se crea
una nueva. El cliente señala que por ese motivo debiera admitirse una
sola reasignación; v1.9 lo implementa como advertencia a partir de la
segunda y no como bloqueo, a la espera de confirmación formal (§15,
D-10).

La reasignación es además la única vía para corregir datos de una
solicitud ya asignada (§1.4 · RN-59).

Nota v0 · la Ejecutiva no reasigna Visador desde la barra de acciones:
el dato del visador se conserva visible en la pestaña Datos del panel de
detalle y su reasignación es responsabilidad del rol
Visador/Administrador desde su propia consola.

  -------------------------------------------------------------------------
  **RF-06**         **Asignación manual asistida y reasignación**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecutiva asigna y reasigna el tasador desde un
                    botón único con dos estados. La primera asignación
                    exige los tres datos mínimos de RN-44 y confirmación
                    explícita; el motivo es opcional. Toda reasignación
                    exige motivo obligatorio elegido desde catálogo
                    cerrado, incrementa un contador y queda registrada en
                    A_Eventos, con autor identificado y tipo de evento
                    reasignacion manual.

  **Criterio de     El sistema impide asignar si falta cualquiera de los
  aceptación**      tres datos mínimos, e impide guardar la reasignación si
                    el motivo está vacío. Cada asignación o reasignación
                    aparece en A_Eventos en menos de un segundo desde su
                    confirmación, y la notificación por correo al tasador
                    entrante sale en el mismo acto.
  -------------------------------------------------------------------------

### **1.6.4 Correo de asignación al tasador (SC13)**

El correo se arma automáticamente al confirmar la asignación, con la
plantilla `email_asignacion_tasador` registrada en C_Plantillas y
referida desde C_NotificacionesConfig (§5.3). Su contenido es:

  ---------------------------------------------------------------------------
  **Bloque**          **Contenido**
  ------------------- -------------------------------------------------------
  Cabecera            Empresa (cliente institucional), N° Interno, N°
                      Solicitud, Fecha de Solicitud y Código VP

  Propiedad           Dirección, Proyecto (sólo si Nuevo), Comuna, Valor
                      estimado, marca Nuevo/Usado y tabla de unidades con sus
                      roles

  Personas            Comprador y RUT, Vendedor y RUT, Ejec. Formalizador,
                      Ejec. Comercializador, contactos de visita ordenados
                      por prioridad —cada uno con nombre, teléfono, email y
                      rol— y Observaciones

  Reglas de trabajo   Texto fijo de la plantilla: llamar al contacto dentro
                      de 4 h · informe 2 días después de la visita · 7
                      respuestas de la llamada · verificar permiso de
                      edificación · verificar recepción final · adjuntar
                      fotos de escritura · confirmar precio de venta

  Adjuntos            Los cargados en TX_Adjuntos al momento del envío, como
                      enlace a Dropbox
  ---------------------------------------------------------------------------

El contenido exacto de las siete respuestas de la llamada está pendiente
de definición con el cliente (§15 · D-11). Hasta cerrarlo, la plantilla
las nombra sin enumerarlas.

Triggers del envío:

  ---------------------------------------------------------------------------
  **Evento**                                   **Envío**
  -------------------------------------------- ------------------------------
  La Ejecutiva confirma la asignación por      Automático
  primera vez

  La Ejecutiva reasigna tasador (RF-06)        Automático

  La Ejecutiva presiona Reenviar en el bloque  Manual; queda registrado en
  Asignación (§1.3.2)                          A_Eventos
  ---------------------------------------------------------------------------

Canal único: correo. El aviso por WhatsApp al tasador queda fuera de
alcance en v1.9, y con él la dependencia del campo
`M_Tasadores.notificar_whatsapp` (§1.9 · FUT-EJ-10).

  ---------------------------------------------------------------------------
  **RN-52**           **Una tasación, un hilo de correo**
  ------------------- -------------------------------------------------------
  **Precondición**    Se genera cualquier comunicación por correo asociada a
                      una solicitud, con el cliente o con el tasador.

  **Acción**          El sistema persiste el identificador del hilo con el
                      tasador (`email_thread_id`) y la referencia al correo
                      original del cliente en TX_Solicitudes. Todo envío
                      posterior sobre esa solicitud —reasignación, reenvío—
                      se emite dentro del mismo hilo. No se admite agrupar
                      dos o más tasaciones en un mismo correo.

  **Postcondición**   Las respuestas del tasador (fecha de visita, problemas
                      de contacto, informe) y las del cliente quedan
                      asociadas de forma inequívoca a una sola solicitud, y
                      son recuperables desde la pestaña Historial (§1.3.3).

  **Trazabilidad**    Regla operativa firme del negocio, levantamiento v1.9.
                      Ver §1.6.4 y §5.3.
  ---------------------------------------------------------------------------

## **1.7 Automatizaciones**

La Interfaz Ejecutiva es un consumidor y disparador de automatizaciones;
no las contiene. Las relevantes son:

  ---------------------------------------------------------------------------
  **ID**   **Nombre**             **Trigger desde   **Efecto observable**
                                  IF-02**
  -------- ---------------------- ----------------- -------------------------
  SC01     Webhook validación de  Submit válido de  Inserta en TX_Solicitudes
           solicitud              nueva solicitud   con estado=creada;
                                  (§1.5.4)          encadena AT01. Ya no
                                                    encadena AT02.

  AT01     Resolver motor de      estado=creada     Determina plantilla,
           reglas                                   fórmulas, workflow.
                                                    Escribe A_DecisionesMotor
                                                    con regla ganadora y
                                                    candidatas.

  AT08     Alertas SLA            Cron 08:00 diario Genera resumen de
                                                    solicitudes en SLA
                                                    ámbar/rojo; visible en la
                                                    Vista de SLA (§1.2).

  SC13     Envío de               Confirmación      Correo al destinatario
           notificaciones         manual de         correspondiente; al
                                  asignación y de   tasador con la plantilla
                                  reasignación      email_asignacion_tasador.
                                  (§1.6), reenvío   Destinatarios en
                                  manual, cambio de C_NotificacionesConfig.
                                  prioridad, pausa
  ---------------------------------------------------------------------------

AT02 (asignar tasador) ya no figura en esta tabla: sale del alcance de
IF-02 en v1.9 (§1.5.5). Permanece en el catálogo general de
automatizaciones (§6.2), sin disparador desde esta interfaz.

## **1.8 Front-end (base v0.dev)**

El diseño visual se construye sobre la base ya generada en v0.dev para
IF-02 (Consola Ejecutiva), preservando las decisiones de estilo del
sistema de diseño VProperty CU-000.A: tokens de color (azul-vp #075899,
naranja-vp #F5A213), tipografía (H1 28pt, H2 24pt, H3 22pt, cuerpo
11pt), spacing y radii. Componentes reutilizados sin regeneración:
RUTField, EmailField, AddressField con Google Places,
RegionComunaSelector con cascading, FileUploadZone (los cuatro estados
idle/subiendo/éxito/error, sube directo a Dropbox), SLABadge, StateBadge
con los 11 estados oficiales y EventTimeline renderizando A_Eventos. A
ellos se suman en v1.9, construidos con los mismos tokens y componentes
ya existentes y sin incorporar librerías nuevas: el wizard de creación
de tres fases (§1.5.0), los bloques repetibles de Contactos de visita y
de Unidades con sus sub-ítems (§1.5.1), el diálogo de confirmación de
asignación (§1.6.2) y el sheet lateral del botón Documentos y Adjuntos
(§1.5.1.1).

Stack real medido en el repositorio v0 de IF-02 (package.json): Next.js
16.2.6 (App Router · Turbopack), React 19.2.4 y React DOM 19.2.4,
TypeScript 5.7.3, gestor de paquetes pnpm (con override hono@4.12.25).
UI y estilos: Tailwind CSS v4 vía \@tailwindcss/postcss con tema en
\@theme dentro de globals.css (sin tailwind.config.js), shadcn/ui v4
sobre \@base-ui/react 1.5 (base-ui, no Radix), lucide-react para
iconografía, class-variance-authority + clsx + tailwind-merge para el
helper cn, tw-animate-css para animaciones, cmdk 1.1 para el buscador
del diálogo de reasignación, next-themes requerido por sonner.
Formularios y validación: react-hook-form 7.80 + \@hookform/resolvers
5.4 + zod 4 (sheet Nueva solicitud interna y diálogo de reasignación).
Feedback y notificaciones: sonner 2.0 para toasts de confirmación y
error. Otros: \@vercel/analytics (sólo en producción). Restricciones
técnicas transversales (recordatorio operativo): tokens Tailwind
consumidos como custom properties en :root vía arbitrary value syntax;
nunca Radix; importaciones nombradas explícitas de shadcn sin
sustitución; el sticky action bar se evita en presencia de portales
Select (usar inline). Estas restricciones ya están recogidas en el
Blueprint de Interfaces v2.8 §4.4.

## **1.9 Otras funcionalidades no cubiertas**

Funcionalidades adicionales identificadas en los mockups o solicitadas
por operación que quedan fuera del alcance de v1.9. Las cinco primeras
se elevan al comité para decisión formal; las cinco siguientes son
alcance diferido: están definidas y levantadas, pero no se implementan
en esta versión.

  -------------------------------------------------------------------------
  **ID**      **Funcionalidad**         **Estado**    **Decisión
                                                      requerida**
  ----------- ------------------------- ------------- ---------------------
  FUT-EJ-01   Vista consolidada de      Fuera de      Elevado como D-02
              honorarios por            alcance v1.4  (honorarios
              tasador/período                         gestionados en
                                                      VProperty vs
                                                      exportación contable
                                                      externa).

  FUT-EJ-02   Vista de comisiones por   Fuera de      Depende de D-02 y del
              ejecutiva                 alcance v1.4  modelo tarifario
                                                      (D-03).

  FUT-EJ-03   Cobranza/facturación al   Fuera de      Elevado como D-04
              cliente institucional     alcance v1.4  (alcance de
                                                      facturación +
                                                      integración SII).

  FUT-EJ-04   Ventana de coordinación   Resuelto      Son 4 h y es política
              de visita como SLA                      interna de VProperty,
              contractual                             no compromiso
                                                      contractual (RN-53).
                                                      Resta sólo la
                                                      confirmación formal
                                                      de D-05 (§15).

  FUT-EJ-05   Reasignación automática   Backlog       Requiere tabla
              al detectar tasador                     H_ActividadTasador o
              inactivo >48h                           cálculo sobre
                                                      A_Eventos; escalable.

  FUT-EJ-06   Captura de la fecha de    Diferido      Requiere fecha_visita
              visita y tablero de las                 y fecha_envio_informe
              tres fechas                             en TX_Solicitudes y
                                                      las vistas de bandeja
                                                      asociadas. Proceso en
                                                      §1.9.1.

  FUT-EJ-07   Reporte de contacto no    Diferido      Requiere flag y
              logrado con bloqueo de la               motivo de bloqueo,
              solicitud                               vista dedicada en la
                                                      bandeja y pausa del
                                                      reloj SLA (RN-54).

  FUT-EJ-08   Gestión de reprocesos     Diferido      Requiere
              post-entrega                            TX_Reprocesos,
                                                      catálogo cerrado de
                                                      motivos y SLA propio
                                                      (RN-55).

  FUT-EJ-09   Checklist de visita del   Diferido      Llamada en 4 h, siete
              tasador                                 respuestas y fotos de
                                                      escritura. Depende
                                                      del cierre de D-11
                                                      (§15).

  FUT-EJ-10   Aviso por WhatsApp al     Fuera de      Canal único: correo
              tasador                   alcance       (§1.6.4). Elimina la
                                                      dependencia del campo
                                                      notificar_whatsapp de
                                                      M_Tasadores.
  -------------------------------------------------------------------------

### **1.9.1 Procesos documentados y no implementados en v1.9**

Se registran aquí, con el detalle levantado con el cliente, para que la
versión que los implemente no tenga que volver a elicitarlos.

**Coordinación de la visita (FUT-EJ-06).** El tasador recibe la
solicitud y tiene 4 horas para llamar; es política interna de VProperty
y se vende como diferenciador, no es compromiso contractual (RN-53).
Llama, se presenta, valida los datos de la propiedad y fija la fecha de
visita, habitualmente a 2 o 3 días por saturación de ruta. Devuelve la
fecha por el hilo de correo y la Ejecutiva responde al correo original
del cliente informándola. En v1.9 el registro de la fecha y la respuesta
al cliente ocurren fuera del sistema, en el cliente de correo.

**Contacto no logrado (FUT-EJ-07).** Segundo desenlace posible de la
llamada: nadie contesta o el teléfono está malo. El tasador reporta el
problema por el hilo; la Ejecutiva pide al cliente validar o entregar un
teléfono nuevo y, al recibirlo, edita los contactos de la solicitud y
reenvía el correo al tasador. La edición de contactos ya está soportada
mientras la solicitud no esté asignada (§1.4); lo que se difiere es la
marca de bloqueo, su vista dedicada en la bandeja y la pausa automática
del reloj SLA (RN-54).

**Reproceso post-entrega (FUT-EJ-08).** Ocurre entre 6 y 7 veces cada
mañana y es el punto de mayor fricción con el cliente. Llega por el
mismo hilo, semanas después del envío, cuando el cliente está
escriturando y detecta que falta un antecedente. Motivos de forma: falta
nombre completo del comprador; falta nombre completo del vendedor; falta
RUT del comprador; falta RUT del vendedor; la dirección no coincide con
el certificado de número; falta permiso de edificación; falta recepción
final. Motivo de fondo: antecedente que exige reanálisis, por ejemplo un
certificado de expropiación. Tiene SLA propio y estricto: lo que llega
en la mañana se entrega al mediodía; lo que llega al mediodía, en la
tarde (RN-55). En v1.9 se gestiona fuera del sistema, en el hilo de
correo original.

**Las tres fechas y el tablero diario (FUT-EJ-06).** El seguimiento
completo se sostiene sobre tres fechas: la de solicitud, automática al
crear y única que v1.9 registra; la de visita, que informa el tasador; y
la de envío del informe al cliente, automática al generarse el PDF
final. Sobre ellas se construyen los controles que hoy se hacen a mano
en planilla y Drive: vistas pre-construidas de bandeja (sin fecha de
visita, visitadas D+1, D+2 y D+3, reprocesos abiertos), revisión diaria
a las 09:00 y gatillo del cobro sobre la fecha de envío (RN-57). Todo
ello se difiere.

Dependencias y entidades (Sección 1). Tablas escritas: TX_Solicitudes
(campos no-cálculo), TX_Unidades, TX_ContactosVisita, TX_Adjuntos,
TX_DocumentosLegales, A_Eventos, A_Cambios. Tablas leídas: M_Clientes,
M_Comunas, M_TiposInforme, M_TiposPropiedad, M_TiposDeBien, M_Tasadores,
M_Visadores, C_SLA, C_Plantillas, C_NotificacionesConfig,
D_TipoDocumento, A_DecisionesMotor. Reglas de negocio implicadas: RN-01,
RN-02, RN-04, RN-09, RN-24 (saneamiento cuando el ejecutivo captura RUT
inválido con flag), RN-44 a RN-52 y RN-59. RN-03 (asignación
territorial) deja de aplicarse en IF-02 al retirarse AT02 (§1.5.5).

Dependencias de schema. Los elementos siguientes no existen aún en el
modelo y son condición para que la interfaz muestre lo especificado. La
lista es para el equipo de datos: no forma parte del cambio de interfaz,
pero lo condiciona.

*TX_Solicitudes* --- Ejec. Formalizador; Nuevo/Usado, fijado en la Fase
2 del wizard; modo de creación (documentos, manual); tipo de cliente de
origen (correo con texto, correo con ficha, extranet); `email_thread_id`
del hilo con el tasador y referencia al correo original del cliente;
`estado_conservacion` con el catálogo de seis valores; origen de la
dirección vigente; y `fecha_asignacion` (timestamp), que se registra al
confirmar la asignación. El estado asignada ya existe en la máquina de
estados y no requiere alta.

*Tablas nuevas* --- TX_ContactosVisita (nombre, teléfono, email, rol
—propietario, corredor, arrendatario, conserje, otro—, orden de
prioridad y estado del contacto; varios por solicitud); el vendedor,
como tabla TX_Vendedor o como campos en TX_Solicitudes (razón social o
nombre, RUT, contacto, tipo de persona y origen del dato); y
M_TiposDeBien con los ocho valores del cuadro de valorización.
TX_DocumentosLegales ya está referenciada en §2 y requiere verificación
de campos: permiso de edificación con número y fecha, recepción final
con número y fecha, fojas, número y año de inscripción, líneas de
edificación y certificado de número.

*TX_Unidades, a ampliar* --- modelo, superficie de terraza y superficie
de terreno; atributo con rol / uso y goce para estacionamiento, bodega y
terreno; m² de ampliación y marca de regularizable; origen de la
superficie y vínculo al adjunto de respaldo; detalle del ítem en texto
libre; y soporte de sub-ítems, para que una unidad pueda tener más de un
tipo de bien asociado.

*TX_DatosTasacion, bloque SII completo* --- códigos SII, ubicación
urbana o rural, superficie de terreno, avalúo fiscal por unidad y total,
contribución, avalúo exento, CG, OCiv, OC y G.

*Bloque Financiero, sólo Nuevo* --- valor total UF, subsidio, ahorro,
mutuo, pago contado, bono captación, bono integración y precio de venta.

*Difieren a versiones posteriores y no se solicitan en v1.9* ---
`fecha_visita`, `fecha_envio_informe` y flag y motivo de bloqueo por
contacto no logrado en TX_Solicitudes; la tabla TX_Reprocesos;
`M_Tasadores.notificar_whatsapp`; y los plazos de primer contacto, envío
post-visita y SLA de reproceso en C_SLA.

# **2. Interfaz Tasador**

App móvil (PWA) para que el tasador documente la visita: datos
estructurados de la propiedad, cuadro de valoración detallado,
comparables, obras complementarias, ampliaciones y fotos. Materializa la
Capacidad C-3 (captura de visita en terreno) y parte de la Capacidad C-7
(overrides al motor de cálculo). Corresponde a IF-03 del Blueprint de
Interfaces (Tipo A · Next.js 14 + Clerk · mobile-first, PWA). La
descripción funcional que sigue refleja los mockups del proyecto
(Imagenes IF Tasador.pdf); no se transcriben imágenes en el cuerpo del
texto: sólo se especifica el comportamiento que reflejan.

Contexto operacional: el tasador nunca accede a Airtable directamente;
toda operación transacciona vía API Route con validación server-side.
Diseño mobile-first tolerante a conectividad intermitente.

## **2.1 Vista de sus solicitudes**

Cola personal filtrada por clerk_user_id: solicitudes asignadas al
tasador en TX_Solicitudes.tasador con estado en {asignada, en_visita,
capturada}. Header sticky con logo VPROPERTY y avatar del usuario,
filtros tipo chip horizontales por estado y cards de tasación
(TasacionCard) que muestran código VP-AAAA-NNNN, EstadoBadge con color
por estado, dirección, cliente y versión. En tasaciones devueltas para
revisión, la card muestra una franja roja con la nota del Visador
visible sin abrir el detalle. Cualquier intento de acceso a solicitudes
ajenas devuelve 403 (validación server-side, no cliente).

  -------------------------------------------------------------------------
  **RF-09**         **Acceso autenticado a sus solicitudes**
  ----------------- -------------------------------------------------------
  **Descripción**   El tasador inicia sesión con Clerk (Google o email) y
                    accede únicamente a las solicitudes asignadas a su
                    clerk_user_id en TX_Solicitudes.tasador. Cualquier
                    intento de acceso a otra solicitud devuelve 403.

  **Criterio de     Pruebas con dos tasadores distintos confirman que
  aceptación**      ninguno puede listar ni abrir solicitudes ajenas. La
                    validación se hace server-side en la API Route, no en
                    el cliente.
  -------------------------------------------------------------------------

## **2.2 Vista de SLA por Solicitud**

Mismo semáforo verde/ámbar/rojo que la Ejecutiva (RN-04, C_SLA con
feriados chilenos H_Feriados), calculado por rollup Airtable y expuesto
vía API Route. La Vista del Tasador destaca visualmente las solicitudes
en SLA rojo para acelerar su atención. La aritmética del SLA se
especifica una sola vez, en §5 Parametrización de Reglas de Negocio.

## **2.3 Detalle de Solicitud**

Pantalla resumen de la solicitud con: datos del cliente y propiedad,
decisión del motor de reglas (plantilla y workflow que corresponden),
adjuntos iniciales (visor PDF y miniaturas de imágenes desde Dropbox),
documentos legales ya procesados (con atributos extraídos por Claude
API, ver §4), agenda de visita, notas del ejecutivo. Botón principal:
Iniciar captura → abre la vista §2.5.

## **2.4 Modificación de detalles**

El tasador puede editar sólo los campos designados como suyos (siete
secciones de acordeón detalladas en §2.5). No puede modificar cliente,
propiedad, propietario, RUT ni datos financieros de la solicitud
original --- esos campos son exclusivos de la Ejecutiva o del
solicitante externo (IF-01). Cualquier edición fuera del alcance
permitido es bloqueada server-side con tooltip explicativo.

## **2.5 Ingreso de datos**

Formulario multi-sección con autosave 30 s, patrón P3 Formulario en
acordeón (Blueprint §5.4). Siete secciones colapsables alineadas con
Origen de Datos del Informe v1.0 §3.3. Los campos pre-llenados desde
SII/CBR (o desde la lectura de documentos §4) se muestran con un badge
naranja \"Pre-llenado · editable\" para hacer visible al tasador que
puede sobrescribir el valor propuesto. Múltiples campos aparecen o se
ocultan según el tipo de propiedad (lógica condicional server-side
driven). El cuadro de valoración es editable con lista de ítems y regla
RN-09 activa (terraza). Los comparables se capturan con toggle Oferta /
CBR y el sistema valida mínimo 3 antes de permitir el envío. La sección
Edificación despliega seis sub-acordeones con contadores por nivel
(Tabs) y switches de comodidades. La sección Overrides admite ajuste
manual del valor sugerido con motivo obligatorio (RN-23). La sección
Rentabilidad calcula el cap rate en tiempo real. El detalle por tabla
destino es el siguiente:

  --------------------------------------------------------------------------------------------------
  **\#**   **Sección**           **Tabla destino**             **Campos representativos**
  -------- --------------------- ----------------------------- -------------------------------------
  1        Datos de la propiedad TX_DatosTasacion              sup_terreno, sup_construida,
                                                               anio_construccion (lookup desde
                                                               TX_Unidades · unidad habitacional
                                                               principal),
                                                               estado_conservacion,
                                                               agrupacion_propiedad,
                                                               material_predominante,
                                                               calidad_construccion, orientacion,
                                                               dormitorios, banos, DFL2,
                                                               velocidad_venta_estimada.

  2        Fotos obligatorias    TX_Adjuntos (tipo=\'foto\')   Fachada, Ubicación (mapa), Sector,
                                                               Living, Comedor, Cocina, Baño,
                                                               Dormitorios, Pasillo, Logia, Terraza,
                                                               Bodega, Áreas comunes. Mínimo según
                                                               M_TiposPropiedad.num_fotos_minimas.

  3        Cuadro de valoración  TX_ItemsCuadroValoracion      Una fila por ítem con subtipo
           granular E1                                         (Edificación, Terreno, OO.CC.,
                                                               Piscina, Terraza, Bodega,
                                                               Estacionamiento), sup_m2, rol_sii,
                                                               flag_estado, flag_regularizable,
                                                               aporta_a_garantia.

  4        Comparables E2        TX_Comparables                3 a 10 comparables con dirección,
                                                               comuna, superficies, precio_uf,
                                                               fecha_transaccion, factores de
                                                               homogeneización (sup, edad,
                                                               distancia), URL publicación.

  5        Ampliaciones /        TX_Ampliaciones,              Ítems captura terreno para completar
           Niveles /             TX_HabitacionesPorNivel,      el detalle del programa.
           Terminaciones /       TX_TerminacionesPorRecinto,   
           Amenities             TX_Amenities                  

  6        Documentos legales    TX_DocumentosLegales,         Captura manual cuando faltan
           (respaldo manual)     TX_Adjuntos                   documentos originales o para
                                 (tipo=\'documento_legal\')    respaldar hallazgos en terreno.

  7        Overrides (CU-007)    TX_Solicitudes (campos        tasa_cap_rate_override,
                                 override)                     vida_util_override,
                                                               valor_sugerido_override con motivo
                                                               obligatorio (RN-23).
  --------------------------------------------------------------------------------------------------

Herencias desde IF-02 (v1.9). Tres definiciones tomadas en la Interfaz
Ejecutiva llegan al tasador y condicionan esta captura:

1. Estado de conservación heredado. Se fija a nivel de propiedad en
   IF-02 con un catálogo cerrado de seis valores —nuevo, sin uso, bueno,
   normal, malo, deficiente— y se hereda a todos los recintos. El tasador
   lo ve pre-cargado en cada recinto y sólo lo modifica por excepción, en
   torno al 1% de los casos; el cambio queda auditado (RN-49). No debe
   confundirse con `estado_unidad` de TX_Unidades, cuyo dominio es {nueva,
   usada} y cuyo propósito es otro (§4.3.3).
2. Superficies con origen y respaldo. Toda superficie que el tasador
   edite debe declarar su origen desde el catálogo cerrado —carta o ficha
   de la inmobiliaria, plano, base interna SII, certificado de avalúo,
   medición del tasador— y quedar asociada a un adjunto de respaldo
   (RN-45). Cuando el tasador corrige un m² en terreno, el origen pasa a
   medición del tasador y el respaldo es su propia captura.
3. Ampliaciones con marca de regularizable. Las ampliaciones medidas en
   terreno se registran con sus m² y con la marca ¿regularizable? sí/no.
   Sólo las regularizables según normativa se valorizan (RN-50); las no
   regularizables se registran, se informan y no suman valor.

Fuera de alcance de v1.9 en IF-03: la devolución estructurada de la
fecha de visita y el reporte de contacto no logrado. Ambos siguen
ocurriendo por el hilo de correo de la solicitud (§1.9.1 · FUT-EJ-06 y
FUT-EJ-07).

  -------------------------------------------------------------------------
  **RF-10**         **Captura del cuadro de valoración granular**
  ----------------- -------------------------------------------------------
  **Descripción**   El formulario debe permitir agregar una fila por cada
                    ítem del cuadro (TX_ItemsCuadroValoracion): edificación
                    por piso, terreno, OO.CC., piscina, terraza, bodega,
                    estacionamiento. Cada fila captura subtipo, rol_sii,
                    superficie, flags de regularización, estado y garantía.

  **Criterio de     Sin esta tabla granular, las validaciones cruzadas del
  aceptación**      XLSM (RN-21, RN-30, RN-38, RN-39, RN-42, RN-43) no son
                    reproducibles. El cuadre Σ m² edificación = sup.
                    construida emite advertencia antes del envío si
                    difiere.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-11**         **Cuadre de superficies (RN-21 / RN-42)**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe calcular en tiempo real la suma de m²
                    de los ítems edificación y compararla con la superficie
                    construida total declarada en Antecedentes. Cualquier
                    descuadre se muestra como advertencia no bloqueante.

  **Criterio de     Una solicitud con superficies inconsistentes muestra el
  aceptación**      aviso \'Σ m² edificación = X; superficie construida
                    declarada = Y\' antes del envío. La advertencia se
                    persiste como flag en TX_Solicitudes.cuadre_m2_ok.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-12**         **Captura de comparables**
  ----------------- -------------------------------------------------------
  **Descripción**   El tasador puede ingresar entre 3 y 10 comparables
                    (TX_Comparables) con dirección, comuna, superficies,
                    precio en UF, fecha de transacción, factores de
                    homogeneización (sup, edad, distancia) y URL de la
                    publicación.

  **Criterio de     El sistema exige mínimo 3 comparables antes de permitir
  aceptación**      cerrar la captura. Los factores de homogeneización se
                    aplican a uf_m2 vía fórmula y alimentan el promedio
                    usado en el cálculo.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-13**         **Carga de fotografías y mínimos por tipo**
  ----------------- -------------------------------------------------------
  **Descripción**   El formulario carga las fotos directamente a Dropbox y
                    guarda la URL en TX_Adjuntos. El mínimo de fotos
                    depende de M_TiposPropiedad.num_fotos_minimas (Casa 8,
                    Departamento 10, Terreno 6).

  **Criterio de     El sistema impide enviar la captura si no se cumple el
  aceptación**      mínimo de fotos. El mensaje muestra \'Faltan N fotos\',
                    no jerga técnica.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-14**         **Modo offline tolerante**
  ----------------- -------------------------------------------------------
  **Descripción**   El formulario debe ser usable con conectividad
                    intermitente: las fotos quedan en cola local y se
                    sincronizan al recuperar señal. Los campos de texto
                    permiten guardar borrador.

  **Criterio de     Prueba en sitio real con plan de datos limitado: no se
  aceptación**      pierde dato alguno tras pérdida y recuperación de
                    conectividad. Las fotos se reintenta subir hasta cinco
                    veces con backoff exponencial.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-28**         **Override manual del tasador**
  ----------------- -------------------------------------------------------
  **Descripción**   Tres parámetros admiten override con motivo
                    obligatorio: tasa_cap_rate, vida_util y valor sugerido.
                    Si el override está presente, gana sobre el valor por
                    defecto y queda registrado en A_Cambios.

  **Criterio de     Un override sin motivo es rechazado. El reporte de
  aceptación**      auditoría de un caso con override muestra ambos valores
                    (default y override) y la justificación textual.
  -------------------------------------------------------------------------

### **2.5.1 Lectura de documentos**

Cuando el tasador adjunta documentos capturados en terreno (fotos de
escrituras, certificados, etc.) al segmento 6 (Documentos legales),
estos disparan la lógica de extracción SC07 → Claude API descrita en la
§4 Lectura de Documentos. La regla de identificación por coincidencia
con D_TipoDocumentoAtributo aplica sin variación desde IF-02.

### **2.5.2 Guardado en Dropbox**

Cada foto y cada documento adjunto por el tasador se sube a Dropbox vía
API Route con retry offline (cola local). La estructura de carpetas es
la definida en §8; para el caso del tasador la subcarpeta es
/captura/fotos/ (mínimo por tipo) y /captura/documentos/ (respaldo).
Gestión categorizada de fotos: el sistema presenta categorías
predefinidas con límites dinámicos (mínimo/máximo) ligados a los
dormitorios, baños y estacionamientos declarados en la sección Datos de
la propiedad; la categoría \"Documentos\" aparece como primera entrada,
antes de \"Ofertas / Comparables\". El tasador puede crear categorías
personalizadas con nombre y mínimo propios, reutilizando la misma UI
(contador, botón agregar, botón eliminar). Cada categoría muestra un
contador en vivo (ej. 3/3 ✓) y el header agrega el total consolidado de
fotos capturadas.

### **2.5.3 Cambio de estado automático**

Máquina de estados local del tasador BORRADOR → EN_CALCULO →
INFORME_DISPONIBLE, persistida entre rutas mediante un store en memoria
(useSyncExternalStore) para tolerar navegación intra-app sin perder
trabajo. Antes de habilitar el envío, el sistema muestra una alerta de
validación enumerada (destructiva) que lista exactamente qué falta
capturar; el botón de envío queda gateado por la validación completa.
Control de re-visitas: la solicitud admite hasta 3 intentos de captura
devuelta por el Visador; al agotarse el tercer intento, el flujo enruta
la solicitud al Visador con la alerta \"último intento\" visible. Al
confirmar envío válido: estado pasa de asignada a capturada; se dispara
AT03 (ejecución del DAG de fórmulas) según §6 Motor de Cálculo. Al
terminar AT03 sin errores el estado pasa a calculada; AT04 valida rangos
por zona y, en caso de valor anómalo, marca flag_revision=TRUE (§6).
Todo cambio registra evento en A_Eventos.

### **2.5.4 Preview del Informe de Tasación**

Ruta /tasaciones/\[id\]/informe · preview con los datos reales
capturados renderizando las 8 secciones canónicas del informe. Mientras
el estado local es EN_CALCULO, la vista muestra skeletons con animación
pulse; en cuanto el estado transita a INFORME_DISPONIBLE, aparecen los
datos definitivos. Se destaca el valor de tasación (usa el override
manual del tasador si existe, o el valor de referencia del motor de
cálculo) y el cap rate calculado. El registro fotográfico incluye todas
las categorías con sus conteos reales. Cuando la ruta se abre sin
informe generado aún, se muestra un banner de borrador. Exportación a
PDF vía window.print() con estilos \@media print dedicados (regla
operativa aplicada por el equipo v0: no depender de Carbone en el
prototipo local del tasador; la generación oficial del PDF final se rige
por §7). Footer con dos acciones diferenciadas por color: Confirmar
(verde) y Rechazar (rojo). Rechazar despliega un collapsible con motivo
de rechazo (validación mínimo 20 caracteres) y muestra la alerta
explícita de \"último intento\" cuando aplica el control RN-16bis de 3
intentos.

## **2.6 Automatizaciones**

  ------------------------------------------------------------------------------
  **ID**   **Nombre**             **Trigger desde    **Efecto observable**
                                  IF-03**            
  -------- ---------------------- ------------------ ---------------------------
  SC07     Extracción de          Upload documento   Extrae atributos según
           documentos (Claude     en §2.5.1          D_TipoDocumentoAtributo,
           API)                                      guarda el JSON en
                                                     TX_Adjuntos.atributos_-
                                                     obtenidos y propaga por
                                                     cardinalidad a
                                                     TX_DatosTasacion o
                                                     TX_Unidades (Set A y B,
                                                     ver §4).

  AT03     Ejecutar DAG de        estado=capturada   Corre \~15 cálculos en
           fórmulas                                  orden topológico, escribe
                                                     TX_Calculos con snapshot.

  AT04     Validar rangos de      TX_Calculos insert Compara con rangos por zona
           valor                                     (M_Comunas); marca
                                                     flag_revision si sale de
                                                     rango.

  AT05     Notificar visador      estado=pdf_listo   Notificación al visador
                                                     (SC13 → email).
  ------------------------------------------------------------------------------

## **2.7 Front-end (base v0.dev)**

Stack real medido en el repositorio v0 de IF-03. Framework y lenguaje:
Next.js 16 con App Router (carpeta app/) y Turbopack como bundler por
defecto; React 19 + React DOM 19; TypeScript 5 con tipos propios del
dominio (Tasacion, InformeData, EstadoTasador, CategoriaFotoId, etc.).
Estilos y UI: Tailwind CSS v4 configurado vía \@import \"tailwindcss\" y
tokens de tema en app/globals.css con \@theme (sin tailwind.config.js),
tw-animate-css para animaciones (skeletons con pulse), shadcn/ui como
base de componentes (Card, Input, Select, Textarea, Badge, Progress,
Collapsible, RadioGroup, Switch, Tabs, Tooltip, Alert, Separator,
Label), \@base-ui/react como primitivos accesibles usados por los
componentes shadcn (con render prop y nativeButton en lugar de asChild),
lucide-react como sistema de iconos, class-variance-authority + clsx +
tailwind-merge para el helper cn. Tipografía Inter vía next/font/google.
Estado y datos: store en memoria en lib/tasador-store.ts con
useSyncExternalStore que persiste la máquina de estados y el payload del
informe entre rutas; hook use-estado-tasador que maneja el flujo
BORRADOR → EN_CALCULO → INFORME_DISPONIBLE y el control de 3 intentos;
datos mock en lib/tasaciones.ts (sin backend real en el prototipo).
Funcionalidades del navegador: window.print() con \@media print para
exportación del informe a PDF; inputMode=\"numeric\" para teclado
numérico en campos de montos y medidas. Infra: \@vercel/analytics, pnpm,
ESLint. Arquitectura de rutas: app/tasaciones/ (Lista, Pantalla 1),
app/tasaciones/\[id\]/ (Formulario de visita, Pantalla 2),
app/tasaciones/\[id\]/estado/ (Estado post-envío),
app/tasaciones/\[id\]/informe/ (Preview del informe + PDF, Pantalla 3).
Base v0.dev preservada: 7 secciones colapsables (property_data,
valuation_grid, comparables, ampliations_levels_finishes_amenities,
legal_documents, overrides, rentability). Transversales: diseño
mobile-first con targets táctiles ≥48px, paleta corporativa VProperty
vía tokens (#075899 primario, #F5A213 acento), componentes reutilizables
EstadoBadge, TasacionCard y helpers de campos. Restricciones técnicas ya
enunciadas en §1.8 aplican idénticamente.

## **2.8 Otras funcionalidades no cubiertas**

  ---------------------------------------------------------------------------
  **ID**       **Funcionalidad**         **Estado**     **Decisión
                                                        requerida**
  ------------ ------------------------- -------------- ---------------------
  FUT-TAS-01   Firma digital sobre foto  Backlog        Elevado como D-06
               (marca de agua con RUT                   (valor legal de la
               tasador + hora)                          evidencia).

  FUT-TAS-02   OCR sobre documentos      Ya cubierto    Cerrado; ver §4.
               capturados en terreno     por SC07       
               (respaldo)                               

  FUT-TAS-03   Modo offline completo     Parcialmente   RF-14 cubre las
               (todo el formulario, no   cubierto       fotos; texto en
               sólo fotos)                              borrador local con
                                                        IndexedDB queda como
                                                        mejora incremental.

  FUT-TAS-04   Geolocalización           Backlog        Requiere permisos de
               automática con validación                ubicación explícitos;
               de comuna                                escalable.
  ---------------------------------------------------------------------------

Dependencias y entidades (Sección 2). Tablas escritas: TX_DatosTasacion,
TX_ItemsCuadroValoracion, TX_Adjuntos, TX_Comparables,
TX_ObrasComplementarias, TX_Ampliaciones, TX_HabitacionesPorNivel,
TX_TerminacionesPorRecinto, TX_Amenities, TX_DocumentosLegales,
TX_Solicitudes (overrides), A_Cambios (en overrides). Tablas leídas:
TX_Solicitudes, M_TiposPropiedad, M_Comunas, M_TiposDeBien,
D_TipoDocumento, D_TipoDocumentoAtributo. Reglas de negocio implicadas:
RN-05 a RN-14 (motor de cálculo), RN-21, RN-23, RN-38, RN-39, RN-42,
RN-43, y desde v1.9 RN-45 (origen y respaldo de superficies), RN-49
(estado de conservación heredado) y RN-50 (ampliaciones regularizables).
Ver §5 y §6 para el desarrollo de las reglas.

# **3. Interfaz Visador**

Mesa de revisión para el rol Visador: valida el PDF generado y los datos
capturados por el tasador, contrasta contra el cálculo automático y los
comparables, y decide entre Aprobar, Devolver al tasador con motivo, o
Sugerir valor alternativo. Materializa la Capacidad C-4 (revisión y
visado técnico). Corresponde a IF-04 del Blueprint de Interfaces (Tipo A
· Next.js 14 + Clerk). Los mockups de referencia son Imagenes IF
Visador.pdf.

Rol diferencial: el Visador tiene permiso para ver y modificar todos los
datos de una tasación (a diferencia del Ejecutivo o el Tasador, cuya
edición está compartimentada por sección). Esto le permite hacer ajustes
finos previos a la aprobación.

## **3.1 Vista de sus solicitudes**

Columna \"Mi cola\" con la lista de solicitudes en estado {pdf_listo,
revision} asignadas al visador en TX_Solicitudes.visador (filtrado por
clerk_user_id). Cada tarjeta muestra código, cliente, tipo de propiedad,
valor calculado, regla aplicada (chip), StateBadge del estado, semáforo
SLA color-semáforo y contador de re-visitas. Sobre la lista, tres
filtros conmutables: \"SLA en riesgo\", \"Toda mi cola\" y \"Por
urgencia\"; cuando alguna solicitud entra en SLA rojo se muestra un
banner rojo persistente sobre la cola. La lista soporta paginación y
ordenamiento por SLA descendente y por antigüedad.

## **3.2 Vista de SLA por Solicitud**

El Visador consume el mismo semáforo transversal (RN-04, C_SLA).
Puntualmente para su bandeja, se destaca visualmente el sub-SLA del
visado (plazo de revisión desde estado=pdf_listo), configurable en C_SLA
como sla_revision separado del sla_aplicable global.

## **3.3 Detalle de Solicitud**

Expediente en panel de detalle con encabezado de la solicitud, pestañas
Datos, Cuadro de valoración, Comparables e Historial (todas en modo sólo
lectura), visor de PDF versionado en formato A4 (Carbone embebido, ver
§7) y barra inferior de acciones (Aprobar / Devolver / Sugerir valor
alternativo / Enviar por email). Bajo las pestañas se dispone un
checklist técnico interactivo que habilita el botón Aprobar al marcar 4
o más ítems (regla RN-16, la definición completa está en §13). Cada
apertura del PDF se registra en A_Accesos (RN-15 exige que el botón
Aprobar permanezca deshabilitado hasta que el PDF haya sido abierto al
menos una vez).

  -------------------------------------------------------------------------
  **RF-15**         **Pantalla de revisión side-by-side**
  ----------------- -------------------------------------------------------
  **Descripción**   El visador ve en una sola pantalla: PDF generado
                    (Carbone, embebido), datos capturados, cuadro de
                    valoración, comparables, decisión del motor de reglas
                    con la regla ganadora y las descartadas. Cada apertura
                    del PDF se registra en A_Accesos.

  **Criterio de     El botón Aprobar permanece deshabilitado hasta que el
  aceptación**      PDF haya sido abierto al menos una vez (registro en
                    A_Accesos). La pantalla carga en menos de dos segundos
                    con red 4G.
  -------------------------------------------------------------------------

## **3.4 Modificación de detalles (permiso ampliado)**

A diferencia de los otros roles, el Visador tiene permisos de
modificación sobre todos los campos operacionales de la tasación. La UI
presenta la Ficha del Tasador organizada en secciones A a I más una
sección \"Datos de la Ejecutiva\", con campos editables o de sólo
lectura según una matriz de permisos por estado (selector de estado en
vivo que refleja qué campos son editables en cada estado de la
solicitud). Los campos modificados por el Visador se distinguen
visualmente con borde ámbar y badge \"editado por Visador\". La pantalla
incluye un historial de cambios legible (usuario · campo · valor
anterior → nuevo · timestamp) y una barra de guardado con confirmación
explícita antes de persistir. Cada modificación queda auditada en
A_Cambios con before/after y autor (email del visador). Si el cambio
afecta inputs del motor de cálculo, AT03 se re-ejecuta con snapshot
nuevo en TX_Calculos (versionado). El PDF debe regenerarse antes de
aprobar; el sistema fuerza este flujo.

  -------------------------------------------------------------------------
  **RF-18**         **Valor sugerido alternativo**
  ----------------- -------------------------------------------------------
  **Descripción**   El visador puede sugerir un valor alternativo en UF. Si
                    difiere del valor calculado, debe justificar por
                    escrito. El sistema persiste ambos valores y el delta
                    para análisis posterior.

  **Criterio de     El campo de justificación se vuelve obligatorio cuando
  aceptación**      el valor alternativo está poblado. El delta calculado
                    se muestra junto a la sugerencia.
  -------------------------------------------------------------------------

## **3.5 Ingreso de datos (checklist y decisión)**

Antes de aprobar, el Visador debe marcar al menos 4 de 5 ítems del
checklist técnico: coherencia de comparables, razonabilidad del valor,
fotos completas, datos consistentes, ausencia de riesgos sin marcar.
Regla activa RN-16 (checklist mínimo 4/5). Al completar checklist, se
habilita la decisión: Aprobar / Devolver / Sugerir valor alternativo
(tres diálogos separados: DialogoAprobar CU-008, DialogoDevolver CU-009,
DialogoValorAlternativo CU-010). DialogoAprobar (RF-02) presenta un
resumen de la solicitud, una advertencia ámbar cuando existe un override
del tasador, una nota de aprobación de gerencia y confirmación en azul
corporativo. DialogoDevolver (RF-03) exige un motivo (Select del
catálogo de motivos técnicos) y una observación (Textarea) con contador
de mínimo 30 caracteres coloreado en rojo o verde según validez; el
botón de confirmación permanece deshabilitado hasta cumplir el mínimo.
DialogoValorAlternativo (RF-04) muestra la comparación entre valor
calculado y valor sugerido editable (campo UF) con delta reactivo en UF
y en porcentaje, exige justificación con contador y persiste ambos
valores para análisis posterior.

  -------------------------------------------------------------------------
  **RF-16**         **Checklist técnico obligatorio**
  ----------------- -------------------------------------------------------
  **Descripción**   Antes de aprobar, el visador debe marcar al menos
                    cuatro de los cinco ítems del checklist técnico:
                    coherencia comparables, razonabilidad del valor, fotos
                    completas, datos consistentes, ausencia de riesgos sin
                    marcar.

  **Criterio de     El botón Aprobar permanece inactivo hasta cumplir el
  aceptación**      mínimo. El checklist completo queda persistido en
                    TX_Solicitudes.checklist_visador para auditoría.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-17**         **Devolución con motivo**
  ----------------- -------------------------------------------------------
  **Descripción**   Si el visador devuelve la solicitud, el campo \'motivo
                    técnico\' es obligatorio. La solicitud regresa al
                    estado=asignada, se incrementa el contador de
                    re-visitas y se notifica al tasador con los comentarios
                    visibles.

  **Criterio de     No es posible enviar una devolución sin motivo. El
  aceptación**      tasador recibe la notificación en menos de cinco
                    minutos con el motivo legible al reabrir F3.
  -------------------------------------------------------------------------

### **3.5.1 Lectura de documentos**

El Visador puede subir documentos adicionales (por ejemplo, aclaraciones
legales) o forzar re-procesamiento de un documento ya cargado. Ambos
flujos usan el patrón SC07 → Claude API descrito en §4.

### **3.5.2 Guardado en Dropbox**

Cualquier archivo modificado o subido por el Visador queda en la
subcarpeta /revision/ definida en §8, preservando historial (nunca
sobrescritura destructiva). Revisión fotográfica (RF-06): la UI presenta
un grid por categoría con indicador de completitud (cumple mínimo /
faltan N), lightbox para inspección detallada y acción \"Marcar no
válida\" con motivo obligatorio (mínimo 20 caracteres). No existe
borrado de fotografías: sólo invalidación o reemplazo, para preservar la
trazabilidad histórica.

### **3.5.3 Previsualización, descarga e impresión del Informe de Tasación**

El Visador dispone de tres acciones sobre el PDF: Previsualizar (visor
embebido, no descarga), Descargar (URL firmada Dropbox de la versión
activa en TX_DocumentosGenerados) e Imprimir (envía al navegador con
dialog nativo). La lógica de generación, regeneración con snapshot
histórico y hash SHA-256 se especifica en §7 Impresión Informe de
Tasación.

### **3.5.4 Cambio de estado automático**

Aprobar: estado pasa de pdf_listo a aprobada (o a pendiente_final si
RN-18 aplica: valor \> 10.000 UF, cliente nuevo o primera versión de
plantilla). Devolver: estado pasa a asignada, contador re-visitas
incrementa, notificación SC13 al tasador. Sugerir valor alternativo: no
cambia estado; deja el valor alternativo en
TX_Solicitudes.valor_alternativo_visador y encola discusión con
aprobador final.

### **3.5.5 Envío del informe por email**

Acción disponible desde la barra de acciones del expediente.
Destinatarios TO y CC con máximo 5 direcciones cada uno; validación por
dominio con chips: verde para dominios autorizados, ámbar para externos
(que exigen checkbox de confirmación y motivo obligatorio) y rojo para
dominios bloqueados o inválidos. Asunto y mensaje llegan prellenados con
defaults parametrizables (C_VariablesCliente y plantilla). El PDF se
adjunta por defecto; el flujo transita por estados idle → loading →
success. Control de reenvío: máximo 3 reenvíos por solicitud; al
agotarse el cupo, la UI muestra un banner rojo y el botón queda
deshabilitado con tooltip \"Requiere aprobación del Administrador\".

## **3.6 Automatizaciones**

  ----------------------------------------------------------------------------
  **ID**   **Nombre**             **Trigger desde    **Efecto observable**
                                  IF-04**            
  -------- ---------------------- ------------------ -------------------------
  AT06     Procesar decisión del  decision_visador   Aplica transición de
           visador                cambia             estado según decisión;
                                                     escribe A_Eventos.

  AT07     Chequear aprobación    estado=aprobada    Verifica RN-18; si
           final                                     aplica, transiciona a
                                                     pendiente_final.

  SC09     Regenerar PDF con      Modificación de    Nuevo PDF con nueva
           Carbone                inputs por Visador versión y hash SHA-256 en
                                  (§3.4)             TX_DocumentosGenerados.

  SC13     Notificación al        Devolución con     Email al tasador con
           tasador (devolución)   motivo (§3.5)      comentarios visibles al
                                                     reabrir IF-03.
  ----------------------------------------------------------------------------

## **3.7 Front-end (base v0.dev)**

Stack real medido en el repositorio v0 de IF-04. Framework y runtime:
Next.js 16.2.6 (App Router), React 19 + React DOM 19, TypeScript 5.7.3.
UI y estilos: Tailwind CSS v4.2 vía \@tailwindcss/postcss (configuración
con \@import \"tailwindcss\" y \@theme en globals.css, sin
tailwind.config.js), shadcn/ui (CLI v4.8) con estilo base-nova montado
sobre \@base-ui/react 1.5 como librería de primitivos (no Radix),
tw-animate-css para animaciones, class-variance-authority + clsx +
tailwind-merge (función cn) para composición de clases, lucide-react
como set de iconos, tipografía Inter vía next/font/google. Componentes
shadcn instalados: Button, Card, Tabs, Checkbox, Badge, Input, Avatar,
Tooltip, Separator, Dialog, Select, Textarea. Utilitario:
\@vercel/analytics 1.6.1; gestor de paquetes pnpm. Datos: en el
prototipo v0 no hay backend ni base de datos, todo opera con mock data
en components/dashboard/mock-data.ts y estado local de React (useState);
la construcción productiva reemplaza los mocks por API Routes contra
Airtable, sin cambiar la superficie visible. Identidad visual: paleta
VProperty vía design tokens (primario #075899, acento #F5A213, semáforo
verde/ámbar/rojo) definidos en app/globals.css. Componentes específicos
del dominio ya especificados: DialogoAprobar (CU-008), DialogoDevolver
(CU-009), DialogoValorAlternativo (CU-010), con enforcement de RN-15,
RN-16, RN-17 y RN-23. Restricciones técnicas ya enunciadas en §1.8
aplican idénticamente.

## **3.8 Otras funcionalidades no cubiertas**

  ---------------------------------------------------------------------------
  **ID**       **Funcionalidad**         **Estado**     **Decisión
                                                        requerida**
  ------------ ------------------------- -------------- ---------------------
  FUT-VIS-01   Comparación side-by-side  Backlog        Requiere índice por
               con otro informe                         dirección/rol_sii;
               histórico del mismo                      escalable.
               cliente                                  

  FUT-VIS-02   Sugerencia asistida por   En análisis    Elevado como D-07
               Claude API (segunda                      (uso de IA en
               opinión)                                 decisiones humanas
                                                        críticas).

  FUT-VIS-03   Firma digital del visador Cubierto       El sello aparece;
               en el PDF de salida       parcialmente   falta certificado
                                                        avanzado (elevar como
                                                        D-08).
  ---------------------------------------------------------------------------

Dependencias y entidades (Sección 3). Tablas escritas: TX_Solicitudes
(decision_visador, valor_alternativo_visador, checklist_visador),
TX_DatosTasacion (ajustes finos), TX_Comparables, TX_DocumentosGenerados
(regeneración PDF), A_Accesos, A_Cambios, A_Eventos. Tablas leídas:
TX_Calculos, A_DecisionesMotor, TX_Comparables, C_Plantillas. Reglas de
negocio implicadas: RN-15, RN-16, RN-17, RN-18, RN-23. Ver §7 para el
flujo del PDF.

# **4. Lectura de Documentos**

Sección transversal que unifica el patrón de poblamiento automático de
datos de la solicitud a partir de documentos (escrituras, CBR,
certificados SII, recepciones municipales, planos, fotos con texto
legible). Este patrón aplica a las tres interfaces principales: IF-01
(solicitante externo), IF-02 (Ejecutiva) e IF-03 (Tasador), y se
materializa en el escenario Make SC07 que llama a Claude API y en el
Airtable Script que distribuye los resultados a las tablas destino.

Fuentes normativas para esta sección: el archivo
blueprint-v8-1-generico.html (lógica de negocio del patrón, en cuatro
paneles: Config D_Atributo --- reformulado desde v1.6 como Config
D_TipoDocumentoAtributo ---, Set A Motor de Cálculo, Set B Interfaces
del Negocio, Sistemas y Capas); VProperty_Origen_Datos_Informe v1.0
(inventario del origen de los \~180 campos del informe); el dominio D\_
(2 tablas desde v1.6 · Diseño de Capa de Datos v2.6.3).

## **4.1 Principio rector**

Un solo modelo parametriza todo el poblamiento: la tabla
D_TipoDocumentoAtributo declara qué se extrae de cada documento, con
qué ejemplo se guía a Claude, dónde se guarda el resultado y con qué
cardinalidad (una vez por solicitud, o una vez por unidad física del
inmueble). Cambiar el comportamiento del sistema equivale a editar
filas en Airtable. Sin deploy. Este principio extiende RN-27 al dominio
documental (paralelo declarado como RN-31 en la v1.2).

Consolidación v1.6 (blueprint v8.2 · SC-RF09). Todo el dominio D\_
paramétrico documental se reduce a **dos tablas**: D_TipoDocumento
(catálogo de tipos) y D_TipoDocumentoAtributo (definición de los
atributos por tipo, con 10 campos consolidados). Los tres pasos previos
---leer D_Atributo, leer D_TipoDato, cruzar con
D_TipoDocumentoAtributo--- se reemplazan por una única lectura contra
D_TipoDocumentoAtributo. Los campos que antes vivían en D_Atributo
(nombre_atributo, tipo_dato, unidad_medida, obligatorio,
ejemplo_atributo, uso_tabla_destino, uso_campo_destino) se promueven a
columnas de D_TipoDocumentoAtributo, junto con dos campos nuevos que
habilitan el enrutamiento por cardinalidad (uso_cardinalidad_destino,
uso_campo_link_unidad). Los catálogos cerrados se implementan como
columnas singleSelect de Airtable directamente en
D_TipoDocumentoAtributo, reemplazando a D_Catalogo y D_CatalogoValor.
El resultado de la extracción se guarda como JSON en
`TX_Adjuntos.atributos_obtenidos`, reemplazando a D_Documento y
D_DocumentoValorAtributo. Efecto medido en SC-RF09: el blueprint pasa
de 13 a 11 módulos, sin llamadas extra por atributo. Ver §4.5.

## **4.2 Regla de identificación por coincidencia con D_TipoDocumentoAtributo**

Todo documento o foto que ingresa al sistema (vía IF-01, IF-02 o IF-03)
es identificado por su tipo mediante coincidencia con la tabla
D_TipoDocumentoAtributo, que declara los atributos aplicables por tipo
de documento (referenciado desde D_TipoDocumento). La regla es: el
sistema no infiere el tipo, se declara. Puede declararse manualmente
por el usuario al momento del upload (dropdown filtrado por
D_TipoDocumento), o automáticamente si el flujo lo permite (por
ejemplo, escenarios de reingreso a partir de un catálogo cerrado por
cliente).

  ---------------------------------------------------------------------------
  **RN-25**           **Regla de identificación del documento/foto por
                      coincidencia con D_TipoDocumentoAtributo**
  ------------------- -------------------------------------------------------
  **Precondición**    Un archivo (documento o foto) entra al sistema con un
                      tipo declarado por el usuario o por defecto según el
                      contexto de la interfaz.

  **Acción**          El sistema consulta D_TipoDocumentoAtributo filtrando
                      por tipo_documento = el tipo declarado. Obtiene en una
                      sola lectura la lista de atributos aplicables con sus
                      10 campos consolidados (código, nombre, tipo_dato,
                      unidad_medida, obligatorio, ejemplo_atributo,
                      uso_tabla_destino, uso_campo_destino,
                      uso_cardinalidad_destino, uso_campo_link_unidad).
                      Genera el prompt versionado para Claude API
                      inyectando ejemplo_atributo por cada campo, y persiste
                      snapshot de version.

  **Postcondición**   El JSON con los atributos extraídos se persiste en
                      `TX_Adjuntos.atributos_obtenidos` del mismo adjunto
                      que originó la extracción, junto con el snapshot de
                      version. Desde ahí se enrutan a las tablas de negocio
                      según `uso_cardinalidad_destino`: los atributos
                      `una_por_solicitud` escriben en TX_DatosTasacion
                      (una fila por solicitud); los atributos
                      `una_por_unidad` escriben en TX_Unidades usando
                      `uso_campo_link_unidad` para resolver la unidad
                      destino. Si el usuario declaró un tipo incorrecto,
                      el reprocesamiento manual permite corregirlo.

  **Trazabilidad**    Blueprint v8.2 · SC-RF09 (11 módulos, fuente única
                      D_TipoDocumentoAtributo). Extendida en
                      RN-31/RN-32/RN-33 y complementada por
                      RN-34/RN-35/RN-36 (trazabilidad manual) y RN-37
                      (patrón NO REGISTRA).
  ---------------------------------------------------------------------------

### **4.2.1 Catálogo operativo de tipos de documento**

D_TipoDocumento se puebla con el catálogo real levantado con el cliente,
que sustituye a la lista TIPOS_DOCUMENTO usada hasta v1.8.2 en el
checklist de creación. El dato de negocio más relevante de esta tabla no
es la lista en sí, sino la columna cuándo: muchos documentos no llegan
al inicio, sino en el reproceso, cuando el cliente está escriturando. De
ahí que el checklist viva en el detalle y no en la creación (§1.5.1.1).

  ---------------------------------------------------------------------------
  **Documento**             **Cuándo**  **Qué aporta**    **Extracción
                                                          automática**
  ------------------------- ----------- ----------------- -------------------
  Carta oferta / ficha de   Nuevo       Comprador,        Sí
  la inmobiliaria                       unidades, roles y
                                        m²

  Plano con detalle de m²   Nuevo       m² por unidad     Sí

  Certificado de permiso de Ambos       N° y fecha        Sí
  edificación

  Certificado de recepción  Ambos       N° y fecha;       Sí
  final                                 siempre posterior
                                        al permiso

  Escritura de compraventa  Usado       Permiso y         Sí
  original                              recepción, en las
                                        cláusulas segunda
                                        y tercera

  Certificado municipal     Usado       A veces trae      Sí
  (vivienda social, número)             permiso y
                                        recepción juntos

  Certificado de número     Reproceso   Dirección         Sí
                                        oficial; la del
                                        informe debe
                                        coincidir

  Certificado de avalúo     Ambos       Monto del avalúo, Sí, pero la
  fiscal                                datos SII y el    descarga es manual:
                                        vendedor cuando   captcha
                                        no vino de otra
                                        parte

  Captura de la base        Usado       m² de terreno y   Sí; se sube como
  interna SII                           de construcción,  imagen
                                        material y año

  Certificado de deuda de   Usado       Si hay o no       Sí
  Tesorería                             deuda; se
                                        consulta por rol,
                                        sin captcha

  Sello verde               Depto con   Fuente SEC por    Parcial
                            gas         dirección, o foto
                                        del tasador en la
                                        mampara

  Solicitud de tasación del Cliente     Todos los datos   Sí
  cliente                   tipo 2      de cabecera

  Plano de tasación         ---         Lo hace el        No
                                        tasador en el 99%
                                        de los casos

  Inscripción de dominio    ---         Baja prioridad:   ---
  CBR                                   no se adjunta ni
                                        se revisa

  Informe de inspección     ---         Fuera de alcance: ---
                                        no se pide
  ---------------------------------------------------------------------------

Cinco consecuencias de diseño se derivan de este catálogo:

1. El certificado de avalúo fiscal no admite descarga automática: el
   sitio del SII exige captcha. Alguien debe descargarlo y subirlo. El modo
   en base a documentos del wizard no puede asumir su disponibilidad al
   crear la solicitud (§1.5.2).
2. La inscripción de dominio CBR es de baja prioridad: no se adjunta ni
   se revisa. La fuente automática en Usado no es escritura más CBR más
   certificado SII, sino la base interna del SII más el certificado de
   avalúo.
3. En Nuevo, el permiso de edificación y la recepción final corresponden
   al edificio completo; en Usado, a la vivienda particular (RN-51).
   También cambia el documento que los contiene: certificados originales de
   la DOM en Nuevo; escritura original de compraventa —cláusulas segunda y
   tercera— o certificados municipales en Usado. Las escrituras posteriores
   a la original pierden el dato.
4. El sello verde no aplica a casas ni a departamentos full eléctricos.
   En esos casos se registra "no aplica" y no se deja vacío, para que la
   ausencia sea una decisión y no un olvido (RN-58).
5. El certificado de consulta TCET / REI queda fuera del catálogo hasta
   aclarar con el cliente de qué se trata (§15 · D-12).

El alta de un tipo nuevo no requiere DDL ni deploy: se agrega la fila en
D_TipoDocumento y sus atributos en D_TipoDocumentoAtributo (RN-31).

## **4.3 Set A · Datos para el motor de cálculo**

D_TipoDocumentoAtributo filtra por usado_motor_calculo=true. Los
atributos extraídos por Claude API se distribuyen a TX_DatosTasacion,
TX_Unidades, TX_Solicitudes, TX_DocumentosLegales o al alias
correspondiente indicado en `uso_tabla_destino` y `uso_campo_destino`
(RN-35 · trazabilidad textual, sin FK). La decisión de tabla destino
por atributo la toma el router del script AT03-Ext según
`uso_cardinalidad_destino`.

  ---------------------------------------------------------------------------------------
  **Sub-paso**   **Componente**    **Insumo**                 **Salida**
  -------------- ----------------- -------------------------- ---------------------------
  1.1 Lectura A  Make SC07         PDF/imagen + prompt con    JSON con {atributo_id,
                 (SC-RF09.json) →  ejemplo_atributo por cada  valor_extraido, confianza}.
                 Claude API        fila filtrada por          
                                   usado_motor_calculo=true   

  1.2 Guardado A Airtable Script   JSON de 1.1 +              JSON persistido en
                 AT03-Ext          uso_tabla_destino +        TX_Adjuntos.atributos_-
                                   uso_campo_destino +        obtenidos; propagación por
                                   uso_cardinalidad_destino + cardinalidad:
                                   uso_campo_link_unidad +    una_por_solicitud →
                                   version snapshot           TX_DatosTasacion;
                                                              una_por_unidad → TX_Unidades
                                                              (unidad resuelta por
                                                              uso_campo_link_unidad).
  ---------------------------------------------------------------------------------------

### **4.3.1 Enrutamiento por cardinalidad (ejemplo validado con certificado de avalúo fiscal)**

Un certificado de avalúo fiscal declara 9 atributos en
D_TipoDocumentoAtributo. Los cuatro primeros son datos que pertenecen a
una unidad específica (rol_sii, sup_m2, avaluo_total, anio_construccion)
y por lo tanto escriben en TX_Unidades una fila por unidad ligada. Los
cinco restantes son datos que pertenecen a la solicitud (destino_sii,
material_predominante, calidad_sii, avaluo_exento, contribucion_anual)
y escriben en TX_DatosTasacion una sola vez. El campo
`uso_campo_link_unidad` (por ejemplo, TX_Unidades.rol_sii) resuelve la
unidad destino cuando un mismo tipo de documento se sube dos veces
(una por unidad: uno para el depto y otro para el estacionamiento).

Consecuencia de negocio sobre el avalúo: el avalúo fiscal total de la
solicitud es la suma de los avalúos de sus unidades (RN-48). Cuando la
propiedad se compone de departamento, estacionamiento y bodega, el total
es la suma de los tres y no el del departamento. El monto que manda es
el del certificado de avalúo; los m² provienen de la base interna del
SII.

### **4.3.2 Segundo ejemplo validado con foto_fuente_sii (propiedades usadas)**

Cuando la propiedad es usada, la fuente primaria de datos catastrales
no es el certificado de avalúo emitido por SII directamente, sino la
consulta a la base interna del SII (avalúo catastral detallado) que se
obtiene ingresando comuna + rol. El resultado se registra como una foto
del sistema y se sube al flujo como tipo de documento `foto_fuente_sii`.
Este documento declara 4 atributos en D_TipoDocumentoAtributo, los
cuatro con cardinalidad `una_por_unidad` (TX_Unidades):

- `sup_terreno_m2` → superficie de terreno en m² (por unidad ligada).
- `sup_m2` → superficie construida en m² (mismo campo que usa el
  certificado de avalúo fiscal).
- `tipo_material` → material predominante de la unidad
  (madera / albañilería / hormigón / mixto / perfiles_metalicos).
- `anio_construccion` → año de construcción de la línea habitacional
  principal.

Excepción operativa (RN-38): cuando la propiedad es nueva y aún no fue
cargada al SII (recepcionada hace menos de ~6 meses), la fuente cambia
a la ficha o carta oferta de la inmobiliaria. En ese caso el tipo de
documento aplicable es `FICHA_INMOBILIARIA_NUEVA` (a definir en
D_TipoDocumento) y no `foto_fuente_sii`. La condición nueva/usada se
resuelve por unidad mediante el campo `estado_unidad` de TX_Unidades.

### **4.3.3 Campo estado_unidad en TX_Unidades**

TX_Unidades incorpora el campo `estado_unidad` con dominio
{nueva, usada}. Se puebla al momento de crear la unidad (por la
Ejecutiva en IF-02 o por el flujo automático de reingreso). Determina
qué tipo de documento aplica para poblar los atributos catastrales de
esa unidad: si `estado_unidad = usada`, el sistema espera
`foto_fuente_sii`; si `estado_unidad = nueva`, espera
`FICHA_INMOBILIARIA_NUEVA`. La regla se formaliza en RN-38.

Distinción con `estado_conservacion` (v1.9). Son dos campos distintos
que se venían confundiendo. `estado_unidad` vive en TX_Unidades, tiene
dominio {nueva, usada} y su única función es decidir qué tipo de
documento alimenta los datos catastrales de esa unidad; no describe la
condición física de nada. `estado_conservacion` es un campo nuevo a
nivel de propiedad, con catálogo cerrado de seis valores mandatado por
los clientes —nuevo, sin uso, bueno, normal, malo, deficiente—, se
hereda a todos los recintos y sí describe la condición física (RN-49).
Los valores habitado y desocupado, que aparecían en versiones
preliminares del levantamiento, se descartan: no figuran en ninguna
fuente.

## **4.4 Set B · Datos para las interfaces del negocio**

D_TipoDocumentoAtributo filtra por uso_interfaz_negocio=true
(renombrado desde uso_interfaz_tasador para reflejar vocación
transversal · Blueprint v8.1). Un atributo puede pertenecer a Set A,
Set B, o ambos --- son independientes. El enrutamiento por cardinalidad
descrito en §4.3.1 aplica igual.

  ----------------------------------------------------------------------------------------
  **Sub-paso**   **Componente**    **Insumo**                  **Salida**
  -------------- ----------------- --------------------------- ---------------------------
  1.3 Lectura B  Make SC07         PDF/imagen + prompt con     JSON con {atributo_id,
                 (SC-RF09.json) →  ejemplo_atributo por cada   valor_extraido, confianza}.
                 Claude API        fila filtrada por           
                                   uso_interfaz_negocio=true   

  1.4 Guardado B Airtable Script   JSON de 1.3 +               JSON persistido en
                 AT03-Ext          uso_tabla_destino +         TX_Adjuntos.atributos_-
                                   uso_campo_destino +         obtenidos; propagación por
                                   uso_cardinalidad_destino +  cardinalidad
                                   uso_campo_link_unidad +     (TX_DatosTasacion o
                                   version snapshot            TX_Unidades) según §4.3.1.
  ----------------------------------------------------------------------------------------

## **4.5 Cambios v8.1 y v8.2 respecto a versiones anteriores**

Los cambios v8.1 (renombre, versionado, ejemplo real) siguen vigentes.
Los cambios v8.2 (consolidación en una sola tabla, enrutamiento por
cardinalidad) los reemplazan operativamente sin invalidarlos.

  -----------------------------------------------------------------------
  **Cambio**              **Descripción**
  ----------------------- -----------------------------------------------
  Renombre                Refleja la vocación transversal del patrón
  uso_interfaz_tasador →  (aplicable a cualquier IF que reciba
  uso_interfaz_negocio    documentos, no sólo la del tasador). Requiere
  (v8.1) — REVERTIDO en   migración de datos y actualización de scripts.
  Blueprint v3            Documentado en RN-34 revisado.
  (16-jul-2026)           NOTA v1.8.2: la base Airtable real
                          (verificada 17-jul-2026, base
                          app9G7lLkIV3CpeLa) NO tiene
                          `uso_interfaz_negocio`. En su lugar coexisten
                          tres flags separados en
                          D_TipoDocumentoAtributo:
                          `uso_interfaz_ejecutiva`,
                          `uso_interfaz_tasador`,
                          `uso_interfaz_visador`. Cualquier filtro debe
                          usar los tres (OR) para replicar la
                          semántica original de "uso_interfaz_negocio".

  Nuevo campo version     Cada ejecución guarda un snapshot con la
  (v8.1)                  version usada, permitiendo reproducir el mismo
                          prompt años después aunque el catálogo haya
                          evolucionado. Paralelo directo a RN-28.

  Ejemplo real (v8.1)     El campo ejemplo_atributo se puebla con
                          literales de los seis informes reales del
                          cliente. Regla RN-36 vigente: si no hay
                          evidencia trazable, se persiste
                          PENDIENTE_VALIDACION.

  Consolidación en dos    Todo el dominio D\_ paramétrico documental se
  tablas (v8.2)           reduce a D_TipoDocumento y
                          D_TipoDocumentoAtributo. Sus columnas
                          (nombre_atributo, tipo_dato, unidad_medida,
                          obligatorio, ejemplo_atributo,
                          uso_tabla_destino, uso_campo_destino) se
                          promueven a columnas de
                          D_TipoDocumentoAtributo. Deprecadas: D_Atributo,
                          D_TipoDato (contenido consolidado), D_Documento
                          y D_DocumentoValorAtributo (resultado
                          persistido como JSON en
                          `TX_Adjuntos.atributos_obtenidos`), D_Catalogo
                          y D_CatalogoValor (reemplazadas por
                          singleSelects de Airtable directamente sobre
                          D_TipoDocumentoAtributo). La lectura pasa de
                          tres tablas (con joins) a una sola.
                          Trazabilidad: SC-RF09 blueprint pasa de 13 a
                          11 módulos.
                          NOTA v1.8.2: la versión del blueprint
                          SC-RF09-ExtraccionClaude verificada
                          (17-jul-2026) sigue con 13 módulos y AÚN
                          referencia las tablas deprecadas
                          `D_Atributo` (tblOI0Su3ogySNeHm) y
                          `D_TipoDato` (tble0Na4Neon7Vz3z), que no
                          existen en la base real. Estado: pendiente
                          de migración. Riesgo alto: la ejecución
                          fallará al llegar al módulo 5. Además, el
                          prompt al módulo 10 tiene la cadena literal
                          "Atributos esperados: 7" en vez del
                          aggregator dinámico del módulo 7
                          (corregido en blueprint v2 entregado
                          17-jul-2026).

  Enrutamiento por        Se agregan dos campos nuevos en
  cardinalidad (v8.2)     D_TipoDocumentoAtributo:
                          `uso_cardinalidad_destino` con dominio
                          {una_por_solicitud, una_por_unidad}, y
                          `uso_campo_link_unidad` (texto libre, ej.
                          "TX_Unidades.rol_sii") para resolver la
                          unidad destino cuando aplica. El script
                          AT03-Ext usa estos dos campos para decidir
                          entre TX_DatosTasacion y TX_Unidades.

  Patrón "NO REGISTRA"    Formalizado en RN-37. Cuando un inmueble
  (v8.2)                  nuevo no tiene ingreso al SII, los
                          certificados de avalúo contienen "NO
                          REGISTRA" en los montos. El prompt debe
                          reconocer el patrón sin fallar, el texto
                          crudo se preserva en `avaluo_total_raw`, y el
                          flag `avaluo_no_registra=TRUE` se propaga a
                          TX_DatosTasacion. Validado con HEV-3183.

  Verificación contra     IDs reales confirmados en la base
  base real (v8.3 ·       app9G7lLkIV3CpeLa (17-jul-2026):
  17-jul-2026)              · D_TipoDocumento = tblkPhBnpdDmUWOl3
                            · D_TipoDocumentoAtributo = tbldI86ieVKpjpL7E
                            · TX_Adjuntos = tblur71x1oItbmKZc
                            · TX_Solicitudes = tblaHTyMHYfmy7Fg6
                            · TX_Unidades = tbl2QDLvJDyy3Rg2I
                            · TX_DatosTasacion = tblMoK3mFuwN8Yr1A
                          Campos destino en TX_Unidades usados por
                          `foto_fuente_sii` (§4.3.2):
                            · rol_sii = fldC5yUYC2wTTLJBV
                            · sup_terreno_m2 = fld6lgF0KxUh9oPCB
                            · sup_m2 = fldZLvJKuXuWhRV8P
                            · tipo_material = fldnG1nEod0V1IkKZ
                            · anio_construccion = fldM46x4ECE9B0pfM
                            · estado_unidad = fldIwZtnqbbnfF6Zx
                          Prueba end-to-end validada 17-jul-2026 con
                          rol_sii=31-516 (fila
                          recXnqSgEazCl0nwF).
  -----------------------------------------------------------------------

Requisitos funcionales asociados: RF-44 a RF-50 (dominio D\_)
especificados en §5 (parametrización) y §1 (captura por la Ejecutiva).

## **4.6 Reglas de negocio del dominio D\_ (recordatorio, definición completa en §13)**

Se listan aquí para navegación; el enunciado completo
(precondición/acción/postcondición) está en §13 Reglas de Negocio.

  ------------------------------------------------------------------------
  **ID**   **Título**
  -------- ---------------------------------------------------------------
  RN-31    Alta de tipo de documento sin DDL (paralelo a RN-27)

  RN-32    Validación EAV polimórfica tipada

  RN-33    Desacople estricto del dominio D\_ (cero FK con
           M\_/C\_/TX\_/A\_/H\_/Z\_)

  RN-34    Trazabilidad atributo ↔ Interfaz (uso_interfaz_negocio) ---
           revisada v1.3, campo ahora en D_TipoDocumentoAtributo (v1.6)

  RN-35    Trazabilidad manual atributo → TX\_/M\_ (uso_tabla_destino,
           uso_campo_destino, uso_cardinalidad_destino,
           uso_campo_link_unidad)

  RN-36    Documentación viva de ejemplo (ejemplo_atributo con cero
           fabricación)

  RN-37    Patrón "NO REGISTRA" para inmueble nuevo sin registro SII
           (nuevo v1.6)
  ------------------------------------------------------------------------

Dependencias y entidades (Sección 4). Tablas escritas:
TX_Adjuntos.atributos_obtenidos (JSON del resultado + snapshot de
version), TX_DatosTasacion (atributos `una_por_solicitud`), TX_Unidades
(atributos `una_por_unidad`) y otras tablas destino según
uso_tabla_destino. Tablas leídas: D_TipoDocumento, D_TipoDocumentoAtributo
(las dos únicas tablas del dominio D\_ desde v1.6). Tablas deprecadas
(v8.2): D_Atributo, D_TipoDato, D_Documento, D_DocumentoValorAtributo,
D_Catalogo, D_CatalogoValor (los catálogos se implementan como
singleSelects de Airtable directamente sobre D_TipoDocumentoAtributo).
Regla activa: RN-25, RN-31, RN-32, RN-33, RN-34 (revisada),
RN-35 (extendida), RN-36, RN-37 (nueva).

# **5. Parametrización de Reglas de Negocio**

Sección transversal que agrupa los requerimientos de configuración
operacional del sistema: motor de reglas de negocio (C_ReglasNegocio),
fórmulas del motor de cálculo (C_Formulas), acuerdos de nivel de
servicio (C_SLA), notificaciones (C_NotificacionesConfig), precios
unitarios (C_PreciosUnitarios), vidas útiles (C_VidaUtil), factores
(C_Factores, C_FactoresHomogeneizacion), plantillas Carbone
(C_Plantillas, C_VariablesCliente), workflows (C_Workflows), y el
dominio D\_ (paramétrico documental). El principio rector es la promesa
operacional RN-27: operación cotidiana sin programador.

## **5.1 Motor de reglas (IF-08 · AT01)**

El motor de reglas mapea las cinco dimensiones de contexto (cliente,
tipo_informe, tipo_propiedad, banco, comuna) a resultado (plantilla,
fórmulas, workflow). Regla RN-19: la resolución es por especificidad; en
empate, gana prioridad mayor; siempre hay una wildcard activa. AT01
(Airtable Script) es quien ejecuta la resolución. IF-08 es la Consola de
Reglas donde el administrador edita filas de C_ReglasNegocio (interfaz
Tipo B).

  -------------------------------------------------------------------------
  **RF-22**         **Resolución por especificidad**
  ----------------- -------------------------------------------------------
  **Descripción**   El motor evalúa todas las reglas activas de
                    C_ReglasNegocio, calcula la especificidad de cada una
                    (número de filtros no-wildcard que matchean) y
                    selecciona la de mayor especificidad. En empate, gana
                    la de mayor prioridad. El sistema persiste la regla
                    ganadora y las descartadas en A_DecisionesMotor.

  **Criterio de     Una solicitud genérica siempre resuelve a una regla
  aceptación**      (existe al menos una wildcard activa). Trazabilidad
                    completa: para cada solicitud existe una fila en
                    A_DecisionesMotor con regla_ganadora y
                    candidatas_descartadas como JSON.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-23**         **Editor visual de reglas (IF-08)**
  ----------------- -------------------------------------------------------
  **Descripción**   El administrador puede crear y modificar reglas
                    mediante un editor con chips multi-select por cada
                    dimensión, panel de competencia (otras reglas que
                    matchean los mismos contextos) y botón de \'test seco\'
                    obligatorio antes de activar.

  **Criterio de     Activar una regla sin haber pasado el test seco está
  aceptación**      bloqueado. Cada cambio queda en A_Cambios con autor,
                    before/after y razón.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-24**         **Regla wildcard como red de seguridad**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe garantizar siempre al menos una regla
                    wildcard activa (todos los filtros vacíos). Si se
                    intenta desactivar la última wildcard, el sistema lo
                    impide.

  **Criterio de     Comprobación diaria automatizada: vista \'Wildcards
  aceptación**      activas\' en C_ReglasNegocio nunca está vacía. Si se
                    detecta vacío, alerta crítica al administrador.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-25**         **Cero lógica de negocio en Make**
  ----------------- -------------------------------------------------------
  **Descripción**   Make no contiene ni un solo IF de negocio. Ningún
                    escenario decide por cliente, por tipo de informe ni
                    por monto. Toda decisión nace de consultar Airtable.

  **Criterio de     Revisión de los 20 escenarios Make activos muestra cero
  aceptación**      IF sobre cliente, banco, tipo de propiedad o monto.
                    Make solo orquesta, transporta y reintenta.
  -------------------------------------------------------------------------

## **5.2 SLA (C_SLA + H_Feriados)**

C_SLA define el plazo en días por cada par (cliente, tipo_informe),
entre 1 y 30 días. Modificar un SLA no altera las solicitudes en curso
(RN-04); aplica a nuevas solicitudes. Feriados chilenos H_Feriados (15
fechas anuales) se aplican al cálculo WORKDAY. La regla RN-04 formaliza
el cálculo.

  -------------------------------------------------------------------------
  **RF-35**         **SLA por par (cliente, tipo_informe)**
  ----------------- -------------------------------------------------------
  **Descripción**   C_SLA permite definir el plazo en días por cada
                    combinación cliente × tipo_informe, entre 1 y 30 días.
                    Solicitudes en curso conservan su SLA original; los
                    cambios aplican solo a solicitudes nuevas.

  **Criterio de     Modificar un SLA no altera las solicitudes existentes.
  aceptación**      Una solicitud nueva del par modificado adopta el nuevo
                    plazo.
  -------------------------------------------------------------------------

## **5.3 Notificaciones (C_NotificacionesConfig)**

Fuente única de destinatarios, plantillas y canales para todas las
notificaciones automáticas (SC13). Consumida por AT05, AT08 y AT06,
entre otras. El operador puede cambiar destinatario o plantilla sin
tocar código.

Canal al tasador (v1.9): correo, único. La plantilla
`email_asignacion_tasador` se registra en C_Plantillas con las variables
de cabecera, propiedad, personas, reglas de trabajo y adjuntos
detalladas en §1.6.4, y se dispara desde la confirmación manual de
asignación, desde la reasignación y desde el reenvío manual. El aviso
por WhatsApp queda fuera de alcance, y con él el campo
`M_Tasadores.notificar_whatsapp` que lo soportaría (§1.9 · FUT-EJ-10).
Rige RN-52: una tasación, un hilo de correo.

## **5.4 Clientes, variables y factores (IF-11)**

Alta y mantenimiento de clientes en M_Clientes desde IF-11. Cada cliente
define: slug_url, tipos_informe_permitidos, factor_seguro_incendio,
factor_garantia, tasa_cap_rate, variables visuales (logo, firma, pie) en
C_VariablesCliente.

  -------------------------------------------------------------------------
  **RF-34**         **Alta de cliente en menos de una hora**
  ----------------- -------------------------------------------------------
  **Descripción**   El formulario F6 / IF-11 captura RUT (único), nombre,
                    tipo, contactos, productos habilitados, SLA por tipo de
                    informe, factor_seguro_incendio, factor_garantia,
                    tasa_cap_rate y variables visuales. Tras guardar, el
                    cliente queda operativo.

  **Criterio de     Cronometrado por el administrador: alta completa en
  aceptación**      menos de 60 minutos. El KPI \'Tiempo agregar cliente
                    nuevo\' es menor a una hora reportable desde A_Cambios.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-36**         **Versionado de variables sensibles**
  ----------------- -------------------------------------------------------
  **Descripción**   Cambios en factor_seguro_incendio, factor_garantia,
                    tasa_cap_rate y plantilla activa quedan auditados en
                    A_Cambios con before/after, autor y razón. La razón es
                    obligatoria.

  **Criterio de     Un cambio sin razón es rechazado. El reporte de cambios
  aceptación**      sensibles de los últimos 30 días es accesible al
                    auditor en IF-13.
  -------------------------------------------------------------------------

## **5.5 Dominio D\_ · Documentos paramétricos (IF-14)**

Administración del catálogo paramétrico de tipos de documento y sus
atributos. Ver §4 para el patrón operativo; aquí se listan los RF de
configuración por completitud del inventario.

  -------------------------------------------------------------------------
  **RF-44**         **Administración paramétrica de tipos de documento
                    (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El administrador debe poder dar de alta, modificar y
                    desactivar tipos de documento (D_TipoDocumento) desde
                    un formulario de Airtable, definiendo código técnico,
                    nombre, entidad emisora y vigencia en días.

  **Criterio de     Agregar un tipo nuevo y ponerlo operativo en menos de
  aceptación**      cinco minutos sin tocar Make ni código.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-45**         **Definición de atributos (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El administrador debe poder definir atributos
                    directamente en D_TipoDocumentoAtributo (fuente única
                    desde v8.2): código, nombre, tipo de dato, catálogo
                    asociado (si aplica), unidad de medida, patrón de
                    validación, `ejemplo_atributo`, `uso_tabla_destino`,
                    `uso_campo_destino`, `uso_cardinalidad_destino`,
                    `uso_campo_link_unidad`, y `version` para
                    reproducibilidad histórica.

  **Criterio de     Un atributo definido para un tipo de documento se
  aceptación**      captura, se extrae y se enruta sin joins ni tablas
                    intermedias. Un mismo código de atributo (ej.
                    `rol_sii`) puede aparecer en varias filas de
                    D_TipoDocumentoAtributo si se usa en varios tipos de
                    documento, con el ejemplo y destino adecuados en cada
                    caso.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-46**         **Asociación tipo de documento ↔ atributo (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe permitir asociar atributos a tipos de
                    documento en D_TipoDocumentoAtributo marcando
                    obligatoriedad, orden de presentación, etiqueta local,
                    valor por defecto, cardinalidad de destino
                    (`una_por_solicitud` / `una_por_unidad`) y campo de
                    enlace a la unidad cuando aplica.

  **Criterio de     Cambiar la obligatoriedad, el orden o la cardinalidad
  aceptación**      de destino no requiere despliegue. Cambiar un atributo
                    de `una_por_solicitud` a `una_por_unidad` (o viceversa)
                    sólo requiere editar la fila correspondiente.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-47**         **Catálogos cerrados administrables (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   Los atributos de tipo catálogo cerrado se administran
                    como columnas singleSelect de Airtable directamente
                    sobre D_TipoDocumentoAtributo (v1.6). El administrador
                    puede agregar o desactivar opciones desde la propia
                    definición del atributo, sin tablas auxiliares
                    (D_Catalogo y D_CatalogoValor fueron deprecadas).

  **Criterio de     Un valor desactivado deja de ofrecerse en captura
  aceptación**      nueva pero sigue siendo válido en documentos
                    históricos que ya lo contenían (Airtable conserva
                    valores fuera del enum vigente).
  -------------------------------------------------------------------------

Requisitos de captura por la Ejecutiva (IF-15) especificados en §1.5.1 y
RF-48/RF-49/RF-50 en §9 (residuales / infraestructura de captura
genérica).

## **5.6 Reglas de negocio de parametrización (recordatorio, definición en §13)**

  -----------------------------------------------------------------------
  **ID**    **Título**
  --------- -------------------------------------------------------------
  RN-19     Resolución del motor de reglas por especificidad

  RN-20     Test seco obligatorio antes de activar regla

  RN-27     Operación cotidiana sin programador

  RN-28     Cambio de fórmula sin romper informes pasados (versionado)

  RN-31     Alta de tipo de documento sin DDL (paralelo a RN-27)
  -----------------------------------------------------------------------

Dependencias y entidades (Sección 5). Tablas escritas: C_ReglasNegocio,
C_Formulas, C_SLA, C_NotificacionesConfig, C_PreciosUnitarios,
C_VidaUtil, C_Factores, C_FactoresHomogeneizacion, C_TramosHonorarios,
C_TramosBienComun, C_Plantillas, C_VariablesCliente, C_Workflows,
M_Clientes, M_Tasadores, M_Visadores, M_Comunas, M_TiposInforme,
M_TiposPropiedad, M_Bancos, M_Productos, D_TipoDocumento,
D_TipoDocumentoAtributo, A_DecisionesMotor, A_Cambios. Deprecadas desde
v1.6: D_Atributo, D_TipoDato (consolidadas en D_TipoDocumentoAtributo),
D_Catalogo, D_CatalogoValor (reemplazadas por singleSelects de
Airtable), D_Documento, D_DocumentoValorAtributo (reemplazadas por
`TX_Adjuntos.atributos_obtenidos`).

# **6. Motor de Cálculo**

El Motor de Cálculo materializa la Capacidad C-7. Se especifica en
detalle en el documento oficial
VProperty_Motor_Calculo_AT01_AT10_v2_5.docx; esta sección no lo duplica,
sólo enuncia los requisitos funcionales que le competen y las reglas
activas.

## **6.1 Arquitectura de referencia**

Principio Make = transportista puro (RN-25 y RT-03): toda lógica de
negocio del motor vive en Airtable como AT01--AT10. Make sólo orquesta
llamadas a servicios externos. La cadena de \~15 fórmulas se ejecuta en
orden topológico (RN-29 · DAG sin ciclos), con resultado persistido en
TX_Calculos con snapshot inmutable de version y expresion.

## **6.2 Automations AT01--AT10 (referencia rápida)**

  ---------------------------------------------------------------------------------------------------------------
  **ID**   **Nombre**                       **Trigger**        **Lee**                  **Escribe**
  -------- -------------------------------- ------------------ ------------------------ -------------------------
  AT01     AT01_resolver_motor_reglas       estado=creada      C_ReglasNegocio,         TX_Solicitudes,
                                                               M_Clientes               A_DecisionesMotor

  AT02     AT02_asignar_tasador             Sin disparador     M_Tasadores, M_Comunas   TX_Solicitudes, A_Eventos
                                            desde IF-02 en
                                            v1.9 (§1.5.5)

  AT03     AT03_ejecutar_dag_formulas       estado=capturada   C_Formulas,              TX_Calculos,
                                                               TX_DatosTasacion         TX_Solicitudes

  AT04     AT04_validar_rangos_valor        TX_Calculos insert TX_Calculos, M_Comunas   TX_Solicitudes (flag)

  AT05     AT05_notificar_visador           estado=pdf_listo   C_NotificacionesConfig   TX_Notificaciones / SC13

  AT06     AT06_procesar_decision_visador   decision_visador   TX_Solicitudes           TX_Solicitudes, A_Eventos
                                            cambia                                      

  AT07     AT07_chequear_aprobacion_final   estado=aprobada    C_ReglasNegocio          TX_Solicitudes / SC13

  AT08     AT08_alertas_sla                 cron 08:00 diario  TX_Solicitudes, C_SLA    TX_Notificaciones / SC13

  AT09     AT09_reintentos_cola             cron 15 min        Z_ColaPendientes         Z_ColaPendientes

  AT10     AT10_archivado_nocturno          cron nocturno      TX_Solicitudes           H_Solicitudes_Cerradas,
                                                                                        A_Eventos
  ---------------------------------------------------------------------------------------------------------------

## **6.3 Requisitos funcionales del motor de cálculo**

  -------------------------------------------------------------------------
  **RF-26**         **Ejecución por orden topológico**
  ----------------- -------------------------------------------------------
  **Descripción**   AT03 lee todas las fórmulas activas que aplican a la
                    solicitud, las ordena por orden_topologico ascendente y
                    las ejecuta una a una. Cada resultado se persiste en
                    TX_Calculos con formula_version,
                    formula_expresion_snapshot, inputs_json y resultado.

  **Criterio de     La ejecución de las \~15 fórmulas de un caso completo
  aceptación**      termina en menos de cinco segundos en el percentil 95.
                    Cada cálculo es reproducible años después usando el
                    snapshot persistido.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-27**         **Validación de rangos por zona**
  ----------------- -------------------------------------------------------
  **Descripción**   AT04 compara cada valor calculado contra los rangos de
                    M_Comunas (rango_min_uf_m2, rango_max_uf_m2). Si el
                    valor cae fuera de rango, marca flag_revision=TRUE y el
                    estado pasa a revision (no a pdf_listo).

  **Criterio de     Una solicitud con valor anómalo (10% fuera del rango)
  aceptación**      dispara el flag y aparece en la cola del visador con
                    alerta visual. El umbral es configurable por cliente.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-29**         **Capa de saneamiento previo (patrón "NO REGISTRA" ·
                    RN-37)**
  ----------------- -------------------------------------------------------
  **Descripción**   Antes de ejecutar fórmulas numéricas, una capa de
                    saneamiento normaliza valores no-numéricos que
                    provienen de documentos legítimamente incompletos:
                    avalúo \'NO REGISTRA\' → null + flag
                    `avaluo_no_registra=TRUE`; RUT propietario 0 → null +
                    flag `rut_no_disponible`. El prompt de Claude API
                    (RN-25) debe reconocer explícitamente el literal "NO
                    REGISTRA" (con y sin tildes, mayúsculas o minúsculas)
                    como valor válido, no como error de extracción.

  **Criterio de     Un caso con avalúo \'NO REGISTRA\' no aborta el flujo;
  aceptación**      el cálculo procede usando null y el visador ve el flag
                    en pantalla. El campo crudo se conserva en
                    `avaluo_total_raw`. Caso de referencia validado:
                    HEV-3183 (Inmobiliaria Exequiel Fernández Torre Tres
                    SpA, recepción final N°27 del 13-01-2026), inmueble
                    nuevo sin ingreso al SII al momento de la tasación.
  -------------------------------------------------------------------------

## **6.4 Anti-patrones explícitamente prohibidos**

  -----------------------------------------------------------------------
  **Anti-patrón**             **Por qué está prohibido**
  --------------------------- -------------------------------------------
  IFs de negocio dentro de    La lógica de negocio vive en Airtable como
  Make                        dato consultable

  Fórmulas hardcodeadas en    Las fórmulas viven en C_Formulas como filas
  Make scripts                editables

  Emails hardcodeados en      Los destinatarios viven en
  automations                 C_NotificacionesConfig

  Borrar filas en lugar de    Los datos se conservan; los flags filtran
  marcar activa=false         

  Datos duplicados entre      Si aparece en dos lugares, uno debe ser
  tablas                      lookup
  -----------------------------------------------------------------------

Reglas de negocio implicadas (definición en §13): RN-05 a RN-14
(aritmética específica: valor de terreno, edificación con depreciación,
vida útil, cap rate, terraza 50%, factores de remate/seguros/garantía),
RN-22 (reproducibilidad histórica), RN-23 (override con motivo), RN-24
(saneamiento), RN-28 (versionado de fórmulas), RN-29 (DAG sin ciclos).

# **7. Impresión Informe de Tasación**

Sección transversal que consolida la generación, previsualización,
descarga e impresión del PDF final del Informe de Tasación. Materializa
la Capacidad C-8 (generación documental). Motor externo: Carbone.io.
Fuentes vinculantes: C_Plantillas (plantillas .docx versionadas por
cliente × tipo_informe × tipo_propiedad), C_VariablesCliente (logo,
firma, pie), TX_Calculos (snapshot de cálculos), TX_DatosTasacion +
tablas hijas (inputs).

## **7.1 Flujo end-to-end**

  -------------------------------------------------------------------------------------
  **\#**   **Paso**           **Responsable**          **Detalle**
  -------- ------------------ ------------------------ --------------------------------
  1        Resolución de      AT01 → C_Plantillas      Regla ganadora del motor (§5.1)
           plantilla                                   determina cliente × tipo_informe
                                                       × tipo_propiedad y la plantilla
                                                       activa asociada (RF-30).

  2        Ensamblado del     SC09 (Make)              Une TX_DatosTasacion,
           JSON de contexto                            TX_ItemsCuadroValoracion,
                                                       TX_Comparables, TX_Calculos
                                                       (snapshot vigente), M_Clientes
                                                       (variables), Claude API para
                                                       síntesis descriptiva (RN-25
                                                       contrato estricto).

  3        Llamada a          SC09                     POST con plantilla + JSON.
           Carbone.io                                  Timeout 60s, reintentos según
                                                       RNF-08 (3 × {30s, 2m, 5m}).

  4        Persistencia del   SC09 → Dropbox →         Sube a Dropbox subcarpeta
           PDF                TX_DocumentosGenerados   /informe_final/ (ver §8);
                                                       registra hash SHA-256,
                                                       url_dropbox, version, timestamp
                                                       en TX_DocumentosGenerados
                                                       (RF-39, RN-26).

  5        Notificación al    AT05 → SC13              estado pasa a pdf_listo; email
           Visador                                     al visador con el link.

  6        Previsualización / IF-04 · IF-05            Visor embebido; descarga URL
           Descarga /                                  firmada; impresión con print
           Impresión                                   dialog nativo.
  -------------------------------------------------------------------------------------

## **7.2 Requisitos funcionales**

  -------------------------------------------------------------------------
  **RF-30**         **Una plantilla activa por combinación**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema garantiza que para cada combinación
                    (cliente, tipo_informe, tipo_propiedad) exista una y
                    solo una plantilla con activa=TRUE. Cualquier nueva
                    plantilla pasa por validación de variables esperadas
                    antes de activarse.

  **Criterio de     Vista \'Plantillas duplicadas\' en C_Plantillas siempre
  aceptación**      vacía. El editor IF-09 impide activar una segunda
                    plantilla para la misma combinación.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-31**         **Versionamiento y reproducción histórica**
  ----------------- -------------------------------------------------------
  **Descripción**   Cada vez que se modifica una plantilla, la versión
                    anterior se mueve a H_PlantillasAnteriores y se
                    conserva indefinidamente. Cualquier informe pasado
                    puede regenerarse con su plantilla original.

  **Criterio de     Prueba de reproducción: regenerar el PDF de una
  aceptación**      solicitud de hace seis meses produce un documento
                    idéntico al original (mismo hash en
                    TX_DocumentosGenerados).
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-32**         **Contrato estricto de texto descriptivo IA**
  ----------------- -------------------------------------------------------
  **Descripción**   El texto descriptivo y la síntesis (hoy producidos por
                    VBA InputBox) se delegan a Claude API con un contrato
                    estricto: schema JSON fijo {sintesis, programa,
                    descripcion_sector}, prohibido inventar cifras,
                    validación numérica contra TX_DatosTasacion y
                    TX_ItemsCuadroValoracion. Cualquier discrepancia →
                    rechazo y reintento.

  **Criterio de     Pruebas con cinco casos reales: cero cifras inventadas.
  aceptación**      Toda referencia numérica del texto coincide con el
                    campo de origen. El visador (F4) valida el texto antes
                    de aprobar.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-33**         **Reintento automático ante caída de Carbone**
  ----------------- -------------------------------------------------------
  **Descripción**   Si Carbone falla, Make encola en Z_ColaPendientes con
                    reintento cada cinco minutos. Si falla tres veces
                    consecutivas, alerta crítica al administrador en tiempo
                    real. El estado de la solicitud queda en
                    requiere_atencion.

  **Criterio de     Simulacro de caída: una solicitud en curso queda
  aceptación**      encolada, reintenta y completa al volver el servicio.
                    El administrador recibe la alerta crítica desde el
                    tercer fallo.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-39**         **Hash de cada PDF generado**
  ----------------- -------------------------------------------------------
  **Descripción**   Cada PDF queda en TX_DocumentosGenerados con hash
                    SHA-256, URL Dropbox, versión y timestamp. Esto permite
                    detectar cualquier alteración posterior.

  **Criterio de     Volver a calcular el hash del PDF descargado de Dropbox
  aceptación**      debe coincidir con el almacenado. Discrepancia → alerta
                    crítica.
  -------------------------------------------------------------------------

## **7.3 Matriz de tags Carbone (referencia)**

La matriz completa de placeholders (\~180) por plantilla se mantiene
como artefacto vivo del proyecto (documento operativo del ingeniero de
plantillas). Cada tag apunta a un campo del JSON de contexto (ver §7.1
paso 2) o a un helper (formato UF, formato fecha localizada CL). La
construcción y mantenimiento de esta matriz es tarea recurrente del
Ingeniero de Integraciones Carbone.io.

## **7.4 Reglas de negocio del PDF (recordatorio, definición en §13)**

  -----------------------------------------------------------------------
  **ID**    **Título**
  --------- -------------------------------------------------------------
  RN-22     Reproducibilidad histórica de PDF

  RN-25     Generación de texto descriptivo con contrato estricto

  RN-26     Hash SHA-256 de cada PDF generado
  -----------------------------------------------------------------------

Dependencias y entidades (Sección 7). Tablas escritas:
TX_DocumentosGenerados, H_PlantillasAnteriores, A_ErroresMake, A_Accesos
(al abrir el PDF). Tablas leídas: C_Plantillas, C_VariablesCliente,
TX_Calculos, TX_DatosTasacion, TX_ItemsCuadroValoracion, TX_Comparables,
M_Clientes.

# **8. Guardar Archivos/Fotos en Dropbox**

Sección transversal que consolida el patrón operativo de almacenamiento
de archivos binarios (documentos, fotos, PDFs generados) en Dropbox y su
indexación en Airtable. Regla arquitectónica no negociable RT-06: los
binarios no viven en Airtable; sólo los índices (TX_Adjuntos,
TX_DocumentosGenerados) viven ahí, con URL apuntando a Dropbox.

## **8.1 Estructura de carpetas**

La estructura de carpetas es descriptiva, jerárquica y coherente con el
resto del proyecto: raíz por cliente institucional, año, código de
solicitud, tipo de contenido. Un único árbol para toda la operación.

  --------------------------------------------------------------------------------------------------------------------
  **Nivel**              **Path**                                              **Contenido**   **Origen del upload**
  ---------------------- ----------------------------------------------------- --------------- -----------------------
  Raíz                   /VProperty/                                           Contenedor      Cuenta corporativa
                                                                               único de todos  Dropbox del proyecto
                                                                               los archivos    

  Cliente                /VProperty/{ClienteSlug}/                             Segmentación    M_Clientes.slug_url
                                                                               por cliente     
                                                                               institucional   
                                                                               (p. ej.         
                                                                               metlife,        
                                                                               security, bch)  

  Año                    /VProperty/{ClienteSlug}/{AAAA}/                      Segmentación    Año calendario de
                                                                               anual para      fecha_solicitud
                                                                               retención y     
                                                                               archivado       

  Solicitud              /VProperty/{ClienteSlug}/{AAAA}/{codigo_solicitud}/   Carpeta por     TX_Solicitudes.codigo
                                                                               solicitud       
                                                                               (código         
                                                                               VP-AAAA-NNNN)   

  /solicitud/            .../{codigo}/solicitud/                               Adjuntos        IF-01, IF-02 (§1.5.3)
                                                                               iniciales       
                                                                               cargados en     
                                                                               IF-01 o IF-02:  
                                                                               escritura, CBR, 
                                                                               plano,          
                                                                               certificados,   
                                                                               etc.            

  /captura/fotos/        .../{codigo}/captura/fotos/                           Fotos del       IF-03 (§2.5.2)
                                                                               tasador         
                                                                               organizadas por 
                                                                               sección         
                                                                               (fachada,       
                                                                               living, cocina, 
                                                                               baños,          
                                                                               dormitorios,    
                                                                               áreas comunes,  
                                                                               etc.)           

  /captura/documentos/   .../{codigo}/captura/documentos/                      Documentos      IF-03 (§2.5.2)
                                                                               capturados en   
                                                                               terreno         
                                                                               (respaldo       
                                                                               manual)         

  /revision/             .../{codigo}/revision/                                Archivos        IF-04 (§3.5.2)
                                                                               añadidos o      
                                                                               modificados por 
                                                                               el Visador      
                                                                               durante la      
                                                                               revisión        

  /informe_final/        .../{codigo}/informe_final/                           PDF final       SC09 → Carbone (§7.1)
                                                                               generado por    
                                                                               Carbone         
                                                                               (versiones      
                                                                               sucesivas       
                                                                               nombradas por   
                                                                               hash)           
  --------------------------------------------------------------------------------------------------------------------

Convenciones de naming de archivos: prefijo con tipo_adjunto en
snake_case + timestamp UTC en formato AAAAMMDD-HHMMSS + nombre original
saneado. Ejemplo:
escritura\_\_20260702-143012\_\_doc_escritura_prop_los_leones.pdf. Esto
evita colisiones y facilita ordenamiento cronológico natural.

Retención: los archivos se conservan indefinidamente en Dropbox mientras
la solicitud esté online en Airtable (H_Solicitudes_Cerradas incluida).
Purga selectiva sólo por requerimiento legal explícito y con auditoría.
El versionado nativo de Dropbox preserva versiones anteriores de cada
archivo automáticamente (RT-06).

## **8.2 Persistencia en TX_Adjuntos**

Cada archivo subido a Dropbox se indexa como una fila en TX_Adjuntos. La
tabla es el índice único operacional; nunca se almacenan binarios en
Airtable.

  --------------------------------------------------------------------------
  **Campo**         **Tipo**         **Descripción**
  ----------------- ---------------- ---------------------------------------
  id                PK auto          Identificador único del adjunto

  solicitud_id      FK →             Solicitud a la que pertenece el adjunto
                    TX_Solicitudes   

  tipo_adjunto      Select           Enum: escritura, cbr, plano,
                                     certificado_sii, recepcion_municipal,
                                     foto_fachada, foto_interior,
                                     foto_area_comun,
                                     documento_legal_terreno,
                                     revision_visador, informe_final, otro
                                     (referencia a D_TipoDocumento cuando el
                                     tipo requiere metadata paramétrica
                                     adicional)

  seccion           Texto            Sección de origen (p. ej. \'living\',
                                     \'cocina\' para fotos;
                                     \'documentos_legales\' para escrituras)

  dropbox_url       URL              URL firmada Dropbox de la última
                                     versión

  dropbox_path      Texto            Path completo en la estructura
                                     /VProperty/\... (auditable)

  nombre_archivo    Texto            Nombre saneado (naming convention §8.1)

  mime_type         Texto            application/pdf, image/jpeg, etc.

  size_bytes        Number           Tamaño en bytes

  hash_md5          Texto            Hash MD5 del archivo para detección de
                                     duplicados

  thumbnail_url     URL (opcional)   Para imágenes, miniatura generada por
                                     SC10 (nuevo escenario Make · v1.3)

  uploaded_at       Timestamp        Momento de subida (UTC)

  uploaded_by       Texto            Email del usuario que subió (Clerk) o
                                     \'sistema\' si fue automatizado

  origen_interfaz   Select           IF-01 · IF-02 · IF-03 · IF-04 · SC09
                                     (para PDFs Carbone)

  activo            Boolean          Soft-delete flag; se preservan filas
                                     para auditoría
  --------------------------------------------------------------------------

Notas de diseño: el campo tipo_adjunto es un Select tipado con enum
acotado para agilidad operativa; cuando el tipo tiene atributos
declarados en D_TipoDocumentoAtributo, el resultado de la extracción
(RN-25 · SC07) se guarda como JSON en el propio adjunto en el campo
`atributos_obtenidos`, evitando tablas intermedias en el dominio D\_ y
preservando el desacople de RN-33 (cero FK cruzada). El hash_md5 evita
almacenar duplicados; si un mismo usuario intenta subir dos veces el
mismo binario, el sistema reconoce el hash y linkea a la fila existente.

## **8.3 Requisito funcional consolidado**

  -------------------------------------------------------------------------
  **RF-51**         **Persistencia unificada de adjuntos en Dropbox +
                    TX_Adjuntos**
  ----------------- -------------------------------------------------------
  **Descripción**   Todo archivo subido por cualquier interfaz (IF-01,
                    IF-02, IF-03, IF-04) o generado por el sistema (SC09
                    Carbone) se persiste como binario en Dropbox según la
                    estructura §8.1 y se indexa en TX_Adjuntos con los
                    campos §8.2. Los binarios nunca residen en Airtable;
                    los índices nunca residen fuera de Airtable.

  **Criterio de     Auditoría de schema: cero binarios en tablas Airtable
  aceptación**      (todas las URLs apuntan a Dropbox). Auditoría de path:
                    cero archivos en Dropbox fuera de la estructura
                    /VProperty/{cliente}/{año}/{codigo}/\... Test: subir un
                    PDF desde IF-02 crea una fila en TX_Adjuntos con
                    dropbox_url resolvible y dropbox_path conforme.
  -------------------------------------------------------------------------

## **8.4 Requisitos técnicos**

\(a\) Upload directo cliente → Dropbox vía API Route Next.js con
streaming (nunca a través de Airtable Attachments). (b) Retry automático
con backoff exponencial ante fallos de red (5 intentos,
30s/2m/5m/15m/60m). (c) Modo offline en IF-03 (RF-14): cola local
IndexedDB para fotos que se suben al recuperar señal. (d) Soft-delete:
TX_Adjuntos.activo=FALSE nunca elimina el archivo de Dropbox; el binario
se conserva por auditoría. (e) URLs firmadas con expiración de 4 horas
para los previews embebidos; renovación transparente vía API Route.

Reglas de negocio implicadas: RT-06 (persistencia exclusiva en Dropbox),
RN-26 (hash SHA-256 para PDFs Carbone, aplicable también a documentos
críticos como escrituras firmadas).

## **8.5 Automatización nueva SC10 (thumbnails)**

Escenario Make nuevo agregado en v1.3: SC10_generar_thumbnails. Trigger:
TX_Adjuntos.mime_type comienza con \'image/\'. Acción: llama a servicio
de resize (opción por definir: Cloudinary, sharp en Railway function, o
Dropbox thumbnail API). Escribe thumbnail_url en la fila de origen.
Reintento estándar según RNF-08. Idempotente: si thumbnail_url ya está
poblado, no re-genera.

Dependencias y entidades (Sección 8). Tablas escritas: TX_Adjuntos,
TX_DocumentosGenerados. Tablas leídas: TX_Solicitudes (código,
cliente_slug), M_Clientes (slug_url), D_TipoDocumento (referencia soft).
Servicio externo: Dropbox API v2 (upload, thumbnail opcional, temporary
link).

# **9. Otros Requerimientos Funcionales**

Sección que consolida los requerimientos funcionales que no forman parte
de una de las tres interfaces principales (§1--3) ni de las cinco áreas
transversales (§4--8). Incluye la interfaz de solicitud externa (IF-01),
la aprobación final (IF-05), monitoreo operacional (IF-06, IF-07),
auditoría y expediente 360° (IF-12, IF-13), y captura genérica de
documentos por la Ejecutiva (IF-15).

## **9.1 Criterio de priorización**

Los requerimientos de esta sección se priorizan según una matriz
cuatro-factor consensuada por el equipo redactor:

  ------------------------------------------------------------------------
  **Factor**              **Peso**   **Descripción operativa**
  ----------------------- ---------- -------------------------------------
  Valor de negocio        35%        Impacto sobre el flujo end-to-end de
  directo                            una tasación (más peso a IF que
                                     bloquean el pipeline productivo).

  Riesgo de no            25%        Riesgo legal, de auditoría o de
  implementar                        continuidad operativa (más peso a IF
                                     de compliance).

  Dependencia crítica de  20%        Si otras interfaces o
  otras piezas                       automatizaciones bloquean su avance
                                     (más peso a piezas puente).

  Costo/esfuerzo de       20%        Menor esfuerzo mejora prioridad
  implementación                     relativa (permite ganancias rápidas
                                     de valor).
  ------------------------------------------------------------------------

La priorización se expresa en tres niveles: Alta (implementación en el
sprint inicial), Media (segundo sprint), Baja (backlog gestionado). Se
explicita el rango en cada RF de esta sección.

## **9.2 Lista priorizada**

### **Prioridad Alta**

#### **IF-01 · Formulario de solicitud externa (Capacidad C-1)**

  -------------------------------------------------------------------------
  **RF-01**         **Formulario público de captación (IF-01)**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe exponer un formulario web público
                    responsivo de una sola columna, mobile-first, con la
                    institución preseleccionada por URL. Campos
                    obligatorios: tipo de informe (filtrado por
                    M_Clientes.tipos_informe_permitidos), tipo de
                    propiedad, dirección con sugerencia Google Places,
                    comuna autocompletada, nombre del comprador, RUT del
                    comprador validado con módulo 11 en tiempo real, email
                    de contacto.

  **Criterio de     Completitud en menos de 90 segundos en escritorio y
  aceptación**      móvil, medido en al menos 10 sesiones piloto.
                    Validación de RUT y email bloquea el envío con mensaje
                    no técnico. Tras el envío, confirmación visual
                    inmediata y email de acuse en menos de dos segundos con
                    el código VP-AAAA-NNNN.
  -------------------------------------------------------------------------

Desambiguación v1.9. Hasta v1.8.2 este dato se nombraba "propietario",
tanto aquí como en la sección Solicitante de IF-02. El nombre era
incorrecto: el cliente institucional está evaluando y financiando al
comprador, y el dato que llega identificado como cliente es siempre el
comprador, no el dueño actual de la propiedad. El vendedor —el
propietario actual— es un dato distinto, que se captura en IF-02 con su
propia jerarquía de fuentes (RN-47 · §1.5.1, Sección C). La distinción
no es semántica: nombre y RUT incompletos de comprador y de vendedor son
la primera causa de reproceso.

  -------------------------------------------------------------------------
  **RF-02**         **Campos opcionales colapsables**
  ----------------- -------------------------------------------------------
  **Descripción**   Debajo del bloque obligatorio, el formulario presenta
                    un grupo colapsable con campos opcionales: rol SII,
                    banco involucrado, producto, monto estimado en UF,
                    observaciones y adjuntos iniciales (escritura, CBR,
                    plano) que se guardan en TX_Adjuntos según §8.

  **Criterio de     El grupo opcional viene cerrado por defecto. El envío
  aceptación**      del formulario sin completar opcionales es válido. Los
                    adjuntos se cargan a Dropbox y queda únicamente la URL
                    indexada en TX_Adjuntos.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-03**         **Lógica condicional dinámica**
  ----------------- -------------------------------------------------------
  **Descripción**   El formulario debe ocultar o mostrar campos según el
                    contexto del cliente: \'Banco asociado\' aparece solo
                    si M_Clientes.tipo=\'Banco\'; \'Subtipo\' aparece solo
                    si M_TiposPropiedad.requiere_subtipo=TRUE; la lista
                    \'Comuna\' se filtra al elegir Región.

  **Criterio de     Pruebas de aceptación con tres tipologías distintas de
  aceptación**      cliente (banco, compañía de seguros, leasing) muestran
                    ramificaciones correctas sin recarga de página y sin
                    exponer campos no aplicables.
  -------------------------------------------------------------------------

#### **IF-05 · Aprobación final (Capacidad C-5)**

  -------------------------------------------------------------------------
  **RF-19**         **Cola de aprobaciones pendientes**
  ----------------- -------------------------------------------------------
  **Descripción**   El aprobador ve una cola filtrada con solicitudes en
                    estado=pendiente_final, ordenadas por antigüedad. Cada
                    fila resume cliente, valor en UF, regla aplicada y
                    motivo del escalamiento.

  **Criterio de     La cola refleja en tiempo real las solicitudes
  aceptación**      pendientes (latencia menor a 30 segundos). El orden por
                    antigüedad es estable y configurable.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-20**         **Aprobación con firma digital**
  ----------------- -------------------------------------------------------
  **Descripción**   La aprobación requiere reconfirmación mediante un
                    toggle de firma digital. Al aprobar,
                    TX_Solicitudes.aprobado_por se setea al email del
                    aprobador, el estado pasa a entregada y se dispara SC13
                    (envío al cliente).

  **Criterio de     El email final llega al cliente en menos de dos minutos
  aceptación**      desde la confirmación. La entrega queda registrada en
                    TX_Notificaciones con estado_envio=enviado.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-21**         **Rechazo definitivo y devolución a visador**
  ----------------- -------------------------------------------------------
  **Descripción**   El aprobador puede rechazar definitivamente
                    (estado=cancelada con motivo) o devolver al visador
                    (estado=pdf_listo, contador re-revisión incrementado).

  **Criterio de     Ambas decisiones quedan registradas en A_Eventos con
  aceptación**      autor, decisión, motivo y snapshot del estado previo.
  -------------------------------------------------------------------------

#### **Auditoría y trazabilidad (Capacidad C-10)**

  -------------------------------------------------------------------------
  **RF-37**         **Append-only en tablas A\_**
  ----------------- -------------------------------------------------------
  **Descripción**   Las cinco tablas A\_ (Eventos, DecisionesMotor,
                    Cambios, ErroresMake, Accesos) son inmutables: jamás se
                    editan ni se borran, solo se archivan según política de
                    retención (RNF-13).

  **Criterio de     Ningún rol tiene permiso de UPDATE o DELETE sobre las
  aceptación**      tablas A\_. Cualquier intento queda registrado en
                    A_Accesos con el rol y la operación rechazada.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-38**         **Expediente 360° en menos de dos minutos (IF-12)**
  ----------------- -------------------------------------------------------
  **Descripción**   Para cualquier solicitud, el sistema entrega un dossier
                    consolidado que une ocho tablas: cronología
                    (A_Eventos), datos de entrada (TX_Solicitudes), datos
                    extraídos (TX_DatosTasacion), cálculos (TX_Calculos),
                    comparables (TX_Comparables), regla aplicada
                    (A_DecisionesMotor), PDFs generados
                    (TX_DocumentosGenerados) y notificaciones
                    (TX_Notificaciones).

  **Criterio de     Reconstrucción manual cronometrada en menos de dos
  aceptación**      minutos. El expediente impreso muestra al menos los
                    campos enumerados en cada sección.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-40**         **Reconstrucción independiente de versiones actuales**
  ----------------- -------------------------------------------------------
  **Descripción**   Reproducir un cálculo de hace dos años usa la versión
                    de la fórmula y de la plantilla vigentes en ese momento
                    (H_FormulasAnteriores, H_PlantillasAnteriores) y la UF
                    del día en H_PreciosUF.

  **Criterio de     Prueba de reproducción anual: tomar tres solicitudes
  aceptación**      históricas, regenerar PDF y cálculo, comparar contra el
                    original. Coincidencia bit a bit en el 100% de los
                    casos.
  -------------------------------------------------------------------------

### **Prioridad Media**

#### **Monitoreo operacional (Capacidad C-11)**

  -------------------------------------------------------------------------
  **RF-41**         **Dashboard de los cinco KPIs oficiales**
  ----------------- -------------------------------------------------------
  **Descripción**   IF-06 muestra en tiempo real: (1) % de solicitudes
                    solicitud→entrega en menos de 48 h; (2) tasa de
                    devolución del visador; (3) disponibilidad del sistema;
                    (4) tiempo de alta de cliente nuevo; (5) reclamos por
                    email no recibido.

  **Criterio de     Cada KPI se calcula como rollup directo sin planilla
  aceptación**      manual. Los umbrales (80% en menos de 48h, \<10%
                    devolución, \>99.5% disponibilidad) están
                    parametrizados, no hardcodeados.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-42**         **Alertas automáticas escaladas**
  ----------------- -------------------------------------------------------
  **Descripción**   AT08 + SC13 disparan: cada hora si hay errores CRITICAL
                    sin resolver; en tiempo real si SC09 (PDF) falla 3
                    veces seguidas; diaria a las 8 AM con resumen del día
                    anterior y solicitudes en SLA rojo; semanal el lunes
                    con tiempo medio y tasa de devolución.

  **Criterio de     Las cuatro alertas se reciben a tiempo y por el canal
  aceptación**      correcto. Los destinatarios son configurables en
                    C_NotificacionesConfig sin tocar código.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-43**         **Vistas de auto-monitoreo**
  ----------------- -------------------------------------------------------
  **Descripción**   Vistas en Airtable: \'Errores recientes\'
                    (A_ErroresMake severidad=critical o estado=pendiente);
                    \'SLA en riesgo\' (TX_Solicitudes sla_estado
                    amarillo/rojo); \'Reglas en conflicto\'
                    (A_DecisionesMotor con más de una regla candidata de
                    igual especificidad); \'Documentos sin entregar\'
                    (estado=pdf_listo \> 24h).

  **Criterio de     Cada vista se construye sin datos nuevos y se carga en
  aceptación**      menos de tres segundos sobre la base de producción.
  -------------------------------------------------------------------------

#### **Captura genérica de documentos por la Ejecutiva (IF-15)**

  -------------------------------------------------------------------------
  **RF-48**         **Captura de documentos por la ejecutiva (IF-15)**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecutiva debe poder cargar instancias de documento
                    seleccionando un tipo (D_TipoDocumento) y completando
                    los atributos declarados para ese tipo en
                    D_TipoDocumentoAtributo. El adjunto se persiste en
                    TX_Adjuntos y los valores capturados quedan en
                    `TX_Adjuntos.atributos_obtenidos` (JSON) junto con los
                    valores que después extraiga Claude API. Los campos
                    obligatorios bloquean el guardado; los opcionales
                    pueden quedar vacíos.

  **Criterio de     El formulario de captura se construye dinámicamente a
  aceptación**      partir del tipo elegido, sin pantallas hard-codeadas.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-49**         **Persistencia tipada del resultado de extracción
                    (JSON en TX_Adjuntos)**
  ----------------- -------------------------------------------------------
  **Descripción**   El resultado de la captura (manual por la Ejecutiva) o
                    de la extracción (automática por Claude API) se
                    persiste como JSON en `TX_Adjuntos.atributos_obtenidos`,
                    con el `tipo_dato` declarado en D_TipoDocumentoAtributo
                    como contrato de validación. El sistema debe rechazar
                    valores cuyo tipo no corresponda al `tipo_dato`
                    esperado por el atributo.

  **Criterio de     Query de auditoría (por ejemplo, un JSON schema
  aceptación**      validator sobre el JSON) devuelve cero inconsistencias
                    entre `tipo_dato` esperado y valor guardado. Sustituye
                    al patrón EAV polimórfico de v1.2/v1.4, que requería
                    D_DocumentoValorAtributo.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-50**         **Independencia del dominio de tasaciones**
  ----------------- -------------------------------------------------------
  **Descripción**   Las 2 tablas D\_ (D_TipoDocumento y
                    D_TipoDocumentoAtributo, únicas del dominio desde
                    v1.6) no contienen ningún link record hacia M\_, C\_,
                    TX\_, A\_, H\_ o Z\_. El dominio puede operar,
                    exportarse o migrarse sin tocar el resto del sistema.

  **Criterio de     Revisión de schema demuestra cero FK cruzadas; test de
  aceptación**      borrado simulado de cualquier tabla TX\_ no afecta a
                    las tablas D\_.
  -------------------------------------------------------------------------

### **Prioridad Baja**

Los requerimientos residuales de baja prioridad se mantienen listados en
las tablas FUT-XX de las secciones §1.9, §2.8 y §3.8, y quedan bajo
revisión trimestral por el comité del proyecto.

Dependencias y entidades (Sección 9). Trazabilidad completa a los
identificadores RF-01 a RF-04 (IF-01), RF-19 a RF-21 (IF-05), RF-37 a
RF-43 (Auditoría + Monitoreo), RF-48 a RF-50 (IF-15). Reglas activas:
RN-01, RN-02, RN-13, RN-18, RN-30, RN-31, RN-32, RN-33.

# **10. Requisitos No Funcionales**

Se preservan los 22 RNF de la v1.2 con sus métricas verificables.
Agrupados en seis bloques: rendimiento (RNF-01 a RNF-05), disponibilidad
(RNF-06 a RNF-09), seguridad (RNF-10 a RNF-12, RNF-21), auditoría
(RNF-13 a RNF-15), escalabilidad (RNF-16 a RNF-18) y mantenibilidad
(RNF-19, RNF-20, RNF-22). Delta v1.3: se añade el prefijo D\_ a la
convención de naming en RNF-20 (recogiendo el séptimo dominio
incorporado en v1.2).

  -------------------------------------------------------------------------
  **RNF-01**        **Tiempo solicitud → entrega**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema procesa de extremo a extremo en menos de 48
                    horas el 80% de las solicitudes que entren completas
                    (sin devoluciones del visador).

  **Criterio de     Mensual: P80 ≤ 48 h sobre
  aceptación**      TX_Solicitudes.estado=\'entregada\'. Fuente: rollup
                    automático en IF-06.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-02**        **Latencia del motor de reglas**
  ----------------- -------------------------------------------------------
  **Descripción**   La resolución del motor (AT01) se completa en menos de
                    cinco segundos desde la recepción de la solicitud,
                    percentil 95. Desde v1.9 la métrica cubre sólo AT01: la
                    asignación del tasador dejó de ser automática y salió
                    del alcance de IF-02 (§1.5.5).

  **Criterio de     Z_EjecucionesMake.duracion_ms de AT01: P95 ≤ 5.000 ms.
  aceptación**      Medido sobre ventanas móviles de 24 h.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-03**        **Latencia del motor de cálculo**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecución de la cadena completa de fórmulas (AT03)
                    sobre una solicitud típica se completa en menos de
                    cinco segundos, percentil 95.

  **Criterio de     TX_Calculos.calculado_en del primero al último cálculo:
  aceptación**      P95 ≤ 5.000 ms.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-04**        **Tiempo de carga de interfaces**
  ----------------- -------------------------------------------------------
  **Descripción**   Las pantallas de las cuatro UIs Next.js
                    (IF-01/02/03/04) cargan en menos de dos segundos sobre
                    red 4G. Airtable Interfaces en menos de tres segundos.

  **Criterio de     Lighthouse score móvil ≥ 75 para Next.js. Test Airtable
  aceptación**      con 500 registros activos: TTI ≤ 3 s.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-05**        **Generación de PDF**
  ----------------- -------------------------------------------------------
  **Descripción**   Carbone genera el PDF final en menos de quince segundos
                    en el percentil 95 para una solicitud típica (1--3
                    propiedades, 8--10 fotos).

  **Criterio de     TX_DocumentosGenerados con
  aceptación**      timestamp_solicitud_a_carbone vs timestamp_recepcion:
                    P95 ≤ 15 s.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-06**        **Disponibilidad del sistema**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema está disponible más del 99.5% del tiempo
                    mensual, medido como ejecuciones Make exitosas sobre
                    total mensual.

  **Criterio de     Z_EjecucionesMake.resultado=\'ok\' / total mensual ≥
  aceptación**      99.5%. Reporte automático en dashboard IF-06.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-07**        **Fail-safe sobre caída de Carbone**
  ----------------- -------------------------------------------------------
  **Descripción**   Si Carbone se cae, ninguna solicitud se pierde: las
                    pendientes se encolan en Z_ColaPendientes y se
                    reintentan automáticamente al volver el servicio.

  **Criterio de     Simulacro de caída controlada: cero pérdida de
  aceptación**      solicitudes, recuperación automática. Alerta crítica al
                    admin si la caída supera 60 minutos.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-08**        **Reintentos por categoría de error**
  ----------------- -------------------------------------------------------
  **Descripción**   timeout HTTP 3 reintentos (30 s / 2 m / 5 m); rate
                    limit 5 reintentos con backoff exponencial; webhook
                    caído reintento infinito cada minuto
                    (Z_ColaPendientes); validación de datos cero reintentos
                    con estado requiere_atencion.

  **Criterio de     Verificación trimestral: las cinco categorías muestran
  aceptación**      el comportamiento esperado en A_ErroresMake.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-09**        **Idempotencia obligatoria**
  ----------------- -------------------------------------------------------
  **Descripción**   Todo escenario Make y todo Airtable Script verifica al
                    inicio si ya fue ejecutado para esa solicitud y paso.
                    Re-ejecutar es seguro: no produce duplicados ni efectos
                    secundarios.

  **Criterio de     Test de regresión: re-disparar manualmente cualquier
  aceptación**      escenario para una solicitud ya procesada no crea filas
                    duplicadas en TX\_\*.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-10**        **Autenticación por rol**
  ----------------- -------------------------------------------------------
  **Descripción**   Las cuatro UIs Next.js usan Clerk con JWT validado
                    server-side en cada API Route. Airtable Interfaces
                    respeta los roles nativos (Editor, Comentador, Solo
                    lectura).

  **Criterio de     Pruebas de penetración: ningún rol accede a tablas o
  aceptación**      registros fuera de su matriz de permisos.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-11**        **Mínimo privilegio**
  ----------------- -------------------------------------------------------
  **Descripción**   Cada rol ve y opera solo lo estrictamente necesario
                    para su etapa. Los tasadores nunca acceden a Airtable
                    directamente; los clientes nunca acceden a
                    configuración; los visadores no modifican
                    C_ReglasNegocio.

  **Criterio de     Auditoría semestral: matriz de permisos vs
  aceptación**      comportamiento real coincide. Cualquier desvío en
                    A_Accesos dispara alerta.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-12**        **Validación de RUT módulo 11**
  ----------------- -------------------------------------------------------
  **Descripción**   Todo RUT (cliente, propietario, tasador, visador) se
                    valida con dígito verificador módulo 11 (serie
                    \[2,3,4,5,6,7,2,3\]) tanto en cliente como en servidor.

  **Criterio de     Tests automatizados con set de 100 RUTs (50 válidos, 50
  aceptación**      inválidos): tasa de detección 100%.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-13**        **Política de retención por tabla**
  ----------------- -------------------------------------------------------
  **Descripción**   Retención online en Airtable: A_Eventos 12 meses;
                    A_DecisionesMotor 24 meses; A_ErroresMake 6 meses;
                    A_Accesos 12 meses; A_Cambios indefinido. Exports a
                    Dropbox antes de purga.

  **Criterio de     Vista \'Datos próximos a purga\' en cada tabla A\_
  aceptación**      muestra los registros del próximo mes. AT09 + SC16
                    ejecutan archivado nocturno verificable.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-14**        **Reproducibilidad bit-a-bit**
  ----------------- -------------------------------------------------------
  **Descripción**   Cualquier informe entregado en los últimos diez años se
                    puede reproducir bit a bit: mismo PDF, mismo hash.
                    Snapshots en TX_Calculos y versiones en
                    H_PlantillasAnteriores / H_FormulasAnteriores.

  **Criterio de     Test anual: tres solicitudes históricas (1 año, 3 años,
  aceptación**      5 años atrás) → regenerar → hash coincide.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-15**        **Trazabilidad de decisiones del motor**
  ----------------- -------------------------------------------------------
  **Descripción**   Cada solicitud tiene exactamente una fila en
                    A_DecisionesMotor con regla ganadora, lista de
                    candidatas, especificidad de cada una y snapshot
                    completo de la regla ganadora.

  **Criterio de     Vista \'Solicitudes sin decisión\' siempre vacía.
  aceptación**      Reconstrucción de la decisión disponible en menos de
                    dos minutos.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-16**        **Capacidad nominal**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema soporta 500 solicitudes por mes con holgura.
                    Airtable Team: 50.000 registros por base (100.000 con
                    Pro). 30.000 solicitudes en cinco años caben con
                    margen.

  **Criterio de     Test de carga: simular 1.000 solicitudes/mes durante un
  aceptación**      mes; monitorear A_Eventos (\~30 filas/solicitud) y
                    TX_Solicitudes. Holgura confirmada.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-17**        **Crecimiento gobernado de A_Eventos**
  ----------------- -------------------------------------------------------
  **Descripción**   A_Eventos crece \~30 filas por solicitud. A los 12
                    meses, archivado nocturno (AT10) mueve eventos cerrados
                    a Dropbox + purga online.

  **Criterio de     Vista A_Eventos.count debajo de 80.000 filas en
  aceptación**      cualquier momento. Si pasa el umbral, alerta al
                    administrador para acortar retención online.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-18**        **Camino de upgrade documentado**
  ----------------- -------------------------------------------------------
  **Descripción**   Si Airtable, Make o Carbone quedan cortos, existe un
                    upgrade documentado: Airtable Business (25
                    colaboradores, roles granulares); Make Teams; Carbone
                    plan Enterprise. Cambio aislado por capa.

  **Criterio de     Documento \'Plan de upgrade\' actualizado al cierre de
  aceptación**      cada trimestre. Costo aproximado de cada upgrade
                    reportable.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-19**        **Cero lógica de negocio en código**
  ----------------- -------------------------------------------------------
  **Descripción**   Ningún cliente, banco, tipo de informe ni umbral está
                    hardcodeado en Make, en Carbone ni en Next.js. Toda
                    decisión sale de Airtable.

  **Criterio de     Revisión de los 20 escenarios Make: cero IF sobre
  aceptación**      cliente, banco, tipo. Revisión de los componentes
                    Next.js: cero literales de negocio.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-20**        **Convención de naming inquebrantable**
  ----------------- -------------------------------------------------------
  **Descripción**   Prefijos por dominio (M\_, C\_, TX\_, A\_, H\_, Z\_,
                    D\_); plantillas \'{Cliente} {TipoInforme}
                    {TipoPropiedad} v{N.M}\'; escenarios Make \'SC{NN} ---
                    {accion_snake_case}\'. Sin excepción.

  **Criterio de     Revisión trimestral: cualquier tabla, plantilla o
  aceptación**      escenario fuera de convención se renombra antes del
                    próximo release.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-21**        **Protección de datos personales**
  ----------------- -------------------------------------------------------
  **Descripción**   Datos sensibles del propietario (nombre, RUT, email,
                    dirección) viajan cifrados en tránsito (TLS 1.2+) y se
                    almacenan en Airtable con permisos de mínimo
                    privilegio. Las APIs internas no exponen estos campos a
                    roles sin necesidad legítima.

  **Criterio de     Auditoría de tráfico: cero llamadas HTTP plain.
  aceptación**      Auditoría de permisos: roles operacionales sin acceso a
                    campos PII innecesarios.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RNF-22**        **Onboarding del equipo en 60 días**
  ----------------- -------------------------------------------------------
  **Descripción**   Cualquier ingeniero nuevo (Airtable / Make / Next.js)
                    debe poder hacer cambios cotidianos en menos de 60 días
                    desde su incorporación, leyendo los cuatro documentos
                    oficiales y el cheat sheet del parametrizador.

  **Criterio de     Onboarding monitoreado: el nuevo ingeniero ejecuta sin
  aceptación**      acompañamiento las cinco operaciones cotidianas antes
                    del día 60.
  -------------------------------------------------------------------------

# **11. Restricciones Técnicas y Regulatorias**

## **11.1 Restricciones técnicas**

Provienen del stack fijado en la Arquitectura Enterprise. Inmodificables
salvo decisión explícita del CTO. Se preservan sin cambio respecto de
v1.2, salvo aclaraciones distribuidas donde corresponde.

  ------------------------------------------------------------------------
  **ID**   **Título**              **Descripción**
  -------- ----------------------- ---------------------------------------
  RT-01    Stack fijado            Next.js 14 App Router en Railway ·
                                   Clerk · v0.dev · Claude Code · Airtable
                                   · Make · Claude API · Carbone.io ·
                                   Dropbox · Gmail · Mindicador. Softr no
                                   se utiliza.

  RT-02    Airtable como única     Toda decisión nace de consultar
           fuente de verdad        Airtable. Solo lecturas idempotentes
           operacional             desde la app pueden hacerse contra
                                   Airtable; toda escritura que
                                   transiciona estado va por Make.

  RT-03    Make como transportista Make no contiene lógica de negocio. Los
           puro                    20 escenarios activos solo orquestan.
                                   Cero IF sobre cliente, banco, tipo de
                                   informe o monto.

  RT-04    Límites de Airtable     Plan Team: 50.000 registros por base
           Team                    (100.000 con Pro); 5 colaboradores (25
                                   con Business). Tasadores y solicitantes
                                   operan vía Next.js + Clerk. Archivado a
                                   H\_\* y purga programada.

  RT-05    Idempotencia            Todo escenario Make y todo Airtable
           obligatoria             Script verifica al inicio si ya fue
                                   ejecutado. Re-ejecutar es seguro. Cero
                                   ejecuciones non-idempotent en
                                   producción.

  RT-06    Persistencia exclusiva  Fotos, PDFs y adjuntos no viven en
           en Dropbox para         Airtable. Solo los índices
           archivos                (TX_Adjuntos, TX_DocumentosGenerados)
                                   viven en Airtable; los archivos en
                                   Dropbox con URL firmada. Versionado
                                   nativo de Dropbox preserva históricos.
                                   Ver §8 para estructura de carpetas.

  RT-07    Prohibido usar          Los componentes Next.js no usan
           localStorage en         localStorage ni sessionStorage para
           componentes React       datos de negocio. Todo estado relevante
                                   se persiste vía API a Airtable.

  RT-08    Modelo de datos         Las tablas de los 7 dominios (M\_, C\_,
           congelado               TX\_, A\_, H\_, Z\_, D\_) están
                                   congeladas. Cambios estructurales
                                   requieren nueva versión del documento
                                   de Capa de Datos. Delta v1.3: se
                                   explicita el séptimo dominio D\_.

  RT-09    Mindicador como fuente  El valor diario de la UF se obtiene
           única de UF             desde Mindicador (SC15, 9 AM) y se
                                   persiste en H_PreciosUF. Todo cálculo
                                   usa la UF del día de la visita. Si
                                   Mindicador falla, reintenta cada 30 min
                                   y alerta al admin tras tres fallos.

  RT-10    Cero rediseño           Las cinco capas (Presentación,
           arquitectónico          Orquestación, Motor, Datos, Generación)
                                   son inmutables. Cualquier necesidad se
                                   cubre dentro de estas capas o se
                                   reemplaza una capa entera sin tocar las
                                   otras.

  RT-11    Bug VBA legacy no se    El bug conocido TraducirNumero
           replica                 (6→\'cinco\', 7→\'cinco\') del XLSM no
                                   se replica. Función nativa de
                                   localización chilena con set completo
                                   de tests.
  ------------------------------------------------------------------------

## **11.2 Restricciones regulatorias y legales**

Marco normativo chileno aplicable a servicios de tasación inmobiliaria y
a manejo de datos personales.

  ------------------------------------------------------------------------
  **ID**   **Título**              **Descripción**
  -------- ----------------------- ---------------------------------------
  RR-01    Tasaciones son          El informe de tasación tiene valor
           documentos legalmente   legal frente a bancos, aseguradoras y
           vinculantes             tribunales. Obliga a trazabilidad,
                                   firma identificable del visador y
                                   aprobador, y preservación del documento
                                   original con su hash (RN-26).

  RR-02    Reproducibilidad mínima Cualquier informe entregado en los
           de diez años            últimos 10 años debe poder
                                   reconstruirse bit a bit. Obliga a
                                   versionado de plantillas y fórmulas y a
                                   snapshots inmutables de cálculos en
                                   TX_Calculos.

  RR-03    Validación de RUT       Todo RUT capturado se valida con módulo
           chileno                 11 vigente. Excepción: \'RUT
                                   propietario no disponible\' se acepta
                                   con flag (RN-24).

  RR-04    Feriados oficiales de   El cálculo del SLA usa WORKDAY
           Chile en cálculo de SLA excluyendo los 15 feriados oficiales
                                   anuales de Chile. Tabla H_Feriados se
                                   actualiza anualmente antes del 1 de
                                   enero.

  RR-05    Protección de datos     Datos del propietario son datos
           personales              personales bajo la legislación chilena.
                                   Se transmiten cifrados (TLS 1.2+), se
                                   almacenan con permisos restringidos y
                                   se entregan únicamente a destinatarios
                                   legítimos.

  RR-06    Confidencialidad        Una solicitud de un cliente
           cliente-cliente         (institución X) nunca es visible para
                                   otro cliente (institución Y). Los roles
                                   operacionales tampoco ven solicitudes
                                   ajenas al cliente que les corresponde.

  RR-07    Auditoría regulatoria   Ante requerimiento de regulador,
                                   juzgado o cliente, el equipo puede
                                   presentar el expediente completo de
                                   cualquier tasación en minutos. Política
                                   append-only de las tablas A\_ y
                                   retención mínima documentada.

  RR-08    Bug catálogo cliente:   BiceHipotecaria y Banco de Chile
           código BCH duplicado    compartían código \'BCH\' en el legacy.
                                   La migración resuelve la colisión
                                   usando BICEH y BCHI. No exportar a
                                   sistemas externos sin esta corrección.
  ------------------------------------------------------------------------

# **12. Supuestos**

Sostienen el dimensionamiento, los plazos y la arquitectura. Si alguno
deja de ser cierto, la arquitectura puede seguir vigente pero los plazos
o costos podrían cambiar.

  -------------------------------------------------------------------------
  **ID**   **Título**          **Detalle**
  -------- ------------------- --------------------------------------------
  SP-01    Volumen operacional 500 tasaciones/mes con picos del 30% en mayo
                               y noviembre. Cinco años acumulado: \~30.000
                               solicitudes y \~900.000 eventos. Cabe en
                               Airtable Team / Pro.

  SP-02    Equipo VProperty al 1 administrador (Héctor + suplente), 2
           cierre              ejecutivas comerciales, 1 visador titular +
                               1 backup, 59 tasadores activos en RM y V/VI
                               regiones, 1 parametrizador.

  SP-03    Conectividad de los Planes de datos móviles regulares. El
           tasadores en        formulario IF-03 tolera conectividad
           terreno             intermitente pero asume cobertura 3G durante
                               la visita.

  SP-04    Disponibilidad de   Claude API, Carbone, Mindicador mantienen al
           servicios externos  menos 99% de disponibilidad. Diseño
                               contempla caídas de hasta 60 minutos sin
                               pérdida.

  SP-05    Carbone.io plan     10.000 documentos/mes; consumo estimado
           profesional cubre   500/mes. Margen 20×. Upgrade lineal a
           demanda             Enterprise si escala.

  SP-06    Plan Make Pro       \~30 operaciones Make por solicitud ×
           suficiente          500/mes = 15.000/mes. Pro cubre con holgura.

  SP-07    El XLSM convive     No se apaga en el go-live. Convive con el
           durante migración   sistema nuevo durante 8 semanas para
                               validación paralela. Apagado controlado en
                               semana 17.

  SP-08    Acompañamiento post IA Solution acompaña 60 días con canal
           go-live             directo (respuesta \< 4 h hábiles), reunión
                               semanal el primer mes y quincenal el
                               segundo.

  SP-09    Catálogo oficial de Numeración oficial (ClienteN 1-40) desde
           40 clientes         FICHA SOLIC columnas V:W:X del XLSM. 17
                               instituciones deprecadas se migran con flag
                               deprecated=TRUE para reproducir tasaciones
                               históricas.

  SP-10    Cobertura           RM completa más V y VI regiones. Nuevas
           geográfica inicial  regiones son alta sin programador (M_Comunas
                               y M_Zonificacion).

  SP-11    Resistencia al      IF-03 diseñado para ser más cómodo que el
           cambio mitigada     flujo actual. Aceptación tras capacitación
                               de 30 minutos y un tasador piloto antes del
                               rollout.

  SP-12    Reglas RB-48 /      RB-48 bug conocido (no se replica); RB-49
           RB-49 / RB-50 fuera (auto-imprimir) no aplica (entrega PDF);
           de scope            RB-50 (workflow BICE) se cubre con workflow
                               dedicado en C_Workflows.
  -------------------------------------------------------------------------

# **13. Índice de Reglas de Negocio**

Cumpliendo el principio de distribución lógica del contenido, cada regla
de negocio se enuncia con precondición / acción / postcondición en la
sección funcional donde primariamente aplica (interfaz o transversal).
Esta sección es un índice de navegación --- no un apéndice de contenido
--- que permite localizar cada RN en la nueva estructura. Ninguna RN de
la v1.2 fue eliminada; algunas se distribuyeron a más de una sección
cuando la regla afecta transversalmente varias interfaces.

  ------------------------------------------------------------------------
  **ID**   **Título**                              **Sección(es) donde se
                                                   enuncia**
  -------- --------------------------------------- -----------------------
  RN-01    Identificación del cliente por URL      §9 IF-01
           única                                   

  RN-02    Validación de RUT con módulo 11         §1, §9 IF-01

  RN-03    Asignación territorial del tasador      §1.5.5

  RN-04    Cálculo del SLA aplicable               §1.2, §2.2, §3.2, §5.2

  RN-05    Valor de terreno por UF/m² útil         §6

  RN-06    Valor de edificación con factor de      §6
           depreciación                            

  RN-07    Vida útil con override por estado       §6

  RN-08    Cap rate por cliente con override       §6, §2.5 (§7 override)

  RN-09    Terraza vale 50% en el cuadro de        §6, §2.5
           valoración                              

  RN-10    Factor de remate y liquidación por      §6
           velocidad de venta                      

  RN-11    Factor de seguro de incendio por        §6
           cliente y tipo de propiedad             

  RN-12    Factor de garantía independiente del    §6
           factor de seguro                        

  RN-13    Bienes no considerados como garantía    §6

  RN-14    Reposición sin terreno                  §6

  RN-15    Validación del visado: PDF abierto      §3.3, §3.5

  RN-16    Checklist técnico obligatorio del       §3.5
           visador                                 

  RN-17    Devolución con motivo obligatorio       §3.5

  RN-18    Aprobación final escalada               §9 IF-05

  RN-19    Resolución del motor de reglas por      §5.1, §6
           especificidad                           

  RN-20    Test seco obligatorio antes de activar  §5.1
           regla                                   

  RN-21    Cuadre de superficies edificación vs    §2.5
           total                                   

  RN-22    Reproducibilidad histórica de PDF       §7

  RN-23    Override manual con motivo en cálculo   §2.5, §3.4, §6

  RN-24    Saneamiento de valores no numéricos     §6

  RN-25    Regla de identificación del documento   §4.2, §7
           por coincidencia con                    
           D_TipoDocumentoAtributo (v1.3 unificada 
           con generación de texto descriptivo)    

  RN-26    Hash SHA-256 de cada PDF generado       §7, §8

  RN-27    Operación cotidiana sin programador     §5

  RN-28    Cambio de fórmula sin romper informes   §5, §6
           pasados (versionado)                    

  RN-29    DAG de fórmulas con orden topológico    §6

  RN-30    Auditoría append-only sin excepciones   §9 (Auditoría)

  RN-31    Alta de tipo de documento sin DDL       §4, §5.5

  RN-32    Validación tipada del JSON              §4, §9 IF-15
           `atributos_obtenidos` (v1.6, reemplaza  
           patrón EAV polimórfico de v1.4)         

  RN-33    Desacople estricto del dominio D\_      §4, §5.5, §9 IF-15

  RN-34    Trazabilidad atributo ↔ Interfaz ---    §4.4, §4.5
           revisada v1.3, campo en                 
           D_TipoDocumentoAtributo desde v1.6      
           (uso_interfaz_negocio)                  

  RN-35    Trazabilidad manual atributo → TX\_/M\_ §4.3, §4.4
           (uso_tabla_destino, uso_campo_destino,  
           uso_cardinalidad_destino,               
           uso_campo_link_unidad · v1.6)           

  RN-36    Documentación viva de ejemplo           §4
           (ejemplo_atributo)                      

  RN-37    Patrón "NO REGISTRA" para inmueble      §4.5, §6.3 (RF-29)
           nuevo sin registro SII (nuevo v1.6)

  RN-38    Fuente catastral por estado de la       §4.3.2, §4.3.3
           unidad (nueva / usada)

  RN-39    Validación cruzada del XLSM ---         §2.5, §15 D-15
           referenciada, enunciado pendiente

  RN-40    Identificador reservado, sin uso        ---
           asignado

  RN-41    Identificador reservado, sin uso        ---
           asignado

  RN-42    Cuadre de superficies (validación       §2.5, §15 D-15
           cruzada) --- referenciada, enunciado
           pendiente

  RN-43    Validación cruzada del XLSM ---         §2.5, §15 D-15
           referenciada, enunciado pendiente

  RN-44    Datos mínimos para asignar tasador      §1.6.1
           (nueva v1.9)

  RN-45    Origen y respaldo obligatorios de toda  §1.5.1, §2.5
           superficie (nueva v1.9)

  RN-46    Jerarquía de fuentes de la dirección    §1.5.1, §4.2.1
           (nueva v1.9)

  RN-47    Jerarquía de fuentes del vendedor; el   §1.5.1, §9 IF-01
           comprador viene del cliente
           institucional (nueva v1.9)

  RN-48    Avalúo fiscal total como suma de las    §1.3.2, §4.3.1
           unidades (nueva v1.9)

  RN-49    Estado de conservación fijado en la     §1.5.1, §2.5
           propiedad y heredado a los recintos
           (nueva v1.9)

  RN-50    Las ampliaciones sólo se valorizan si   §2.5, §6
           son regularizables (nueva v1.9)

  RN-51    Permiso y recepción: edificio completo  §4.2.1
           en Nuevo, vivienda particular en Usado
           (nueva v1.9)

  RN-52    Una tasación, un hilo de correo (nueva  §1.6.4, §5.3
           v1.9)

  RN-53    Las 4 h de primer contacto son política §1.9, §1.9.1
           interna configurable (nueva v1.9)

  RN-54    El reloj del SLA se detiene con la      §1.9.1
           solicitud bloqueada por contacto no
           logrado (nueva v1.9, diferida)

  RN-55    El reproceso tiene SLA propio: mañana → §1.9.1
           mediodía, mediodía → tarde (nueva v1.9,
           diferida)

  RN-56    Un Excel por tasación y hasta tres PDF  §1.3.4, §7
           versionados y coincidentes (nueva v1.9)

  RN-57    Honorario y comisión se gatillan con el §1.9.1
           envío del informe (nueva v1.9,
           diferida)

  RN-58    Sello verde: "no aplica" explícito en   §4.2.1
           casas y departamentos full eléctricos
           (nueva v1.9)

  RN-59    Ciclo de edición y bloqueo de la        §1.4, §1.6.2
           solicitud tras la asignación (nueva
           v1.9)
  ------------------------------------------------------------------------

Nota v1.3 sobre RN-25. La regla original de generación de texto
descriptivo con contrato estricto (v1.2) se conserva íntegramente en §7
Impresión Informe. En §4 se explicita adicionalmente la regla de
identificación por coincidencia con D_TipoDocumentoAtributo como
aplicación específica del mismo principio en el ingreso de datos. Ambos
enunciados son consistentes: contrato estricto + trazabilidad de esquema
a fuente única.

Nota v1.6 sobre RN-25. La fuente única a la que apunta la regla en
v1.2/v1.3 era D_Atributo. Desde v1.6 la fuente única es
D_TipoDocumentoAtributo, que consolida los campos de D_Atributo y
D_TipoDato en sus 10 columnas de configuración. El resultado de la
extracción, que en v1.2/v1.4 se guardaba en D_Documento +
D_DocumentoValorAtributo, ahora se persiste como JSON en
`TX_Adjuntos.atributos_obtenidos`. El contrato de la regla no cambia;
sólo cambian las tablas contra las cuales se resuelve y donde se
guarda.

Nota v1.3 sobre RN-34. El flag uso_interfaz_tasador de la v1.2 se
renombra a uso_interfaz_negocio para reflejar la vocación transversal
del patrón (aplicable a cualquier IF que reciba documentos, no sólo la
del tasador). El renombre es un cambio de datos con migración
documentada en el Diseño de Capa de Datos v2.6.3 y actualización de
scripts que consulten el campo. La semántica de la regla no cambia.

Nota v1.6 sobre RN-34. El flag uso_interfaz_negocio, en v1.3 vivía en
D_Atributo. Desde v1.6 vive en D_TipoDocumentoAtributo como una columna
más de la fila que asocia el atributo con el tipo de documento.
Consecuencia: un mismo código de atributo puede tener
uso_interfaz_negocio=TRUE para un tipo de documento y FALSE para otro,
según el criterio real de negocio.

Nota v1.6 sobre RN-37 (nueva). Cuando un inmueble es nuevo y aún no
tiene ingreso al SII, los certificados de avalúo entregan el literal
"NO REGISTRA" en los campos monetarios. Precondición: se detecta el
literal en cualquier campo numérico de un certificado tributario.
Acción: (a) el campo numérico se persiste en 0 o null (según el
comportamiento de RF-29), (b) el texto crudo se conserva en
`avaluo_total_raw`, (c) el flag `avaluo_no_registra=TRUE` se propaga a
TX_DatosTasacion, (d) el prompt de Claude API reconoce el patrón como
valor válido, no como error. Postcondición: el flujo continúa; el
visador ve el flag en pantalla y decide si aprueba con avalúo cero o
solicita reingreso posterior. Caso validado: HEV-3183.

Nota v1.9 sobre RN-38 a RN-43. El índice de v1.8.2 llegaba hasta RN-37,
pero §2.5 (RF-10 y RF-11) y §2.8 ya referenciaban RN-38, RN-39, RN-42 y
RN-43, y §4.3.2 y §4.3.3 enunciaban RN-38. v1.9 regulariza el índice
incorporando el rango completo. RN-38 queda enunciada en §4.3.2 y
§4.3.3. RN-39, RN-42 y RN-43 corresponden a validaciones cruzadas del
XLSM heredadas del cálculo legacy: están referenciadas pero no
enunciadas en ninguna sección, y su formalización queda como pendiente
D-15 (§15). Los identificadores RN-40 y RN-41 no aparecen referenciados
en ninguna sección; se reservan y no se reasignan, para no romper la
trazabilidad histórica.

Nota v1.9 sobre RN-44 a RN-59 (nuevas). Provienen del levantamiento
operativo de la Interfaz Ejecutiva con el área de Control y Seguimiento.
Se enuncian así:

- RN-44 · Enunciada con precondición, acción y postcondición en §1.6.1.
- RN-45 · Toda superficie registrada declara su origen desde catálogo
  cerrado y tiene un adjunto de respaldo asociado. Ningún m² queda en el
  sistema sin declarar de dónde salió y sin archivo que lo sostenga.
  Aplica en la captura de la Ejecutiva (§1.5.1) y en la edición del
  tasador (§2.5).
- RN-46 · La dirección sigue la jerarquía ficha del cliente →
  certificado de avalúo → certificado de número, y la interfaz registra de
  cuál proviene la vigente. Cuando existe certificado de número, la
  dirección del informe debe coincidir con él.
- RN-47 · El vendedor sigue la jerarquía correo → ficha → certificado de
  avalúo; el comprador proviene siempre del cliente institucional. Ambos
  exigen nombre completo y RUT validado.
- RN-48 · El avalúo fiscal total de la solicitud es la suma de los
  avalúos de sus unidades.
- RN-49 · El estado de conservación se fija a nivel de propiedad con
  catálogo cerrado de seis valores y se hereda a todos los recintos; el
  cambio por recinto es excepción y queda auditado.
- RN-50 · Las ampliaciones medidas en terreno sólo se valorizan si son
  regularizables según normativa; las no regularizables se registran e
  informan sin sumar valor.
- RN-51 · En Nuevo, el permiso de edificación y la recepción final
  corresponden al edificio completo; en Usado, a la vivienda particular.
- RN-52 · Enunciada con precondición, acción y postcondición en §1.6.4.
- RN-53 · El plazo de 4 h para el primer contacto del tasador es
  política interna configurable, no compromiso contractual con el cliente.
  Cierra FUT-EJ-04 y responde el pendiente D-05.
- RN-54 · El reloj del SLA se detiene mientras la solicitud está
  bloqueada por contacto no logrado.
- RN-55 · El reproceso tiene SLA propio: lo que llega en la mañana se
  entrega al mediodía; lo que llega al mediodía, en la tarde.
- RN-56 · Una tasación produce un solo archivo Excel de cálculo y hasta
  tres PDF versionados; los valores del PDF deben coincidir con los del
  Excel que lo originó.
- RN-57 · El honorario del tasador y la comisión al cliente se gatillan
  con el envío del informe al cliente, no con su recepción.
- RN-58 · El sello verde no aplica a casas ni a departamentos full
  eléctricos; en esos casos se registra "no aplica" y no se deja vacío.
- RN-59 · Enunciada con precondición, acción y postcondición en §1.4.

Tres de estas reglas —RN-54, RN-55 y RN-57— describen comportamiento que
v1.9 no implementa. Se declaran igualmente para que la versión que
implemente los flujos diferidos de §1.9.1 no tenga que volver a
definirlas.

# **14. Glosario del dominio**

Glosario unificado, en orden alfabético. Se preserva el glosario de v1.2
con adiciones marcadas v1.3, v1.6 y v1.9.

  ---------------------------------------------------------------------------------------------------
  **Término**            **Definición operativa**
  ---------------------- ----------------------------------------------------------------------------
  Airtable Interface     Aplicación visual nativa de Airtable que materializa las pantallas internas
                         (IF-05 a IF-13). Sin código, con permisos por rol.

  Append-only            Política aplicada a tablas A\_\*: una vez escrita, una fila no se edita ni
                         se borra. Solo se archiva al cierre de su periodo de retención.

  Atributo paramétrico   Campo declarado en D_TipoDocumentoAtributo (fuente única desde v1.6),
                         con tipo de dato, unidad, ejemplo, tabla y campo destino, cardinalidad y
                         campo de enlace a la unidad. Antes de v1.6 el modelo se apoyaba en un
                         dominio D\_ de ocho tablas; v1.6 lo reduce a dos (D_TipoDocumento y
                         D_TipoDocumentoAtributo) y deprecia las otras seis.

  Avalúo fiscal          Valor que el SII asigna a un inmueble. Puede aparecer como \'NO REGISTRA\'
                         cuando el inmueble es nuevo y aún no ha sido ingresado al catastro; el
                         sistema lo reconoce vía RN-37 y lo sanea vía RN-24 y RF-29 (flag
                         avaluo_no_registra + texto crudo preservado en avaluo_total_raw).

  Cardinalidad de        Atributo de la fila de D_TipoDocumentoAtributo
  destino                (`uso_cardinalidad_destino`, v8.2) con dominio {una_por_solicitud,
                         una_por_unidad}. Determina si el dato extraído se escribe una sola vez
                         por solicitud (TX_DatosTasacion) o una vez por unidad física del inmueble
                         (TX_Unidades). El campo `uso_campo_link_unidad` resuelve la unidad
                         destino cuando aplica.

  Cap rate (tasa         Tasa de capitalización usada para estimar el valor de un inmueble que genera
  exigida)               renta. V = ingreso anual neto / cap rate. Varía por cliente y admite
                         override (RN-08).

  Carbone                Carbone.io. Servicio externo que toma una plantilla .docx + un JSON
                         estructurado y produce el PDF final del informe.

  Catálogo cerrado       Lista cerrada de valores admitidos para un atributo de tipo catálogo.
  documental (v1.6)      Desde v1.6 se implementa como columna singleSelect de Airtable
                         directamente sobre D_TipoDocumentoAtributo. Administrable sin DDL desde
                         la propia definición de la columna. Reemplaza a las tablas D_Catalogo y
                         D_CatalogoValor (v1.4), que quedaron deprecadas.

  CBR                    Conservador de Bienes Raíces. Documento que acredita propiedad. Puede entrar
                         al sistema como adjunto en TX_Adjuntos con tipo_adjunto=\'cbr\'.

  Clerk                  Proveedor de autenticación usado por las cuatro UIs Next.js. Emite JWT
                         validado en cada API Route.

  Comparable             Inmueble similar usado como referencia de precio. TX_Comparables guarda
                         entre 3 y 10 por solicitud, ajustados por factores de homogeneización.

  Comprador (v1.9)       Persona natural que compra el inmueble y a quien el cliente institucional
                         evalúa y financia. Es el dato que llega identificado como "cliente" en la
                         solicitud. Hasta v1.8.2 el documento lo nombraba propietario, lo que inducía
                         a error: el propietario actual es el vendedor. Ver RN-47, §1.5.1 y §9 RF-01.

  Contacto de visita     Persona que abre la puerta al tasador. Normalmente un tercero —corredor,
  (v1.9)                 arrendatario, conserje— y no necesariamente el dueño. Una solicitud admite
                         varios, ordenados por prioridad de llamada; el primero es el principal. Al
                         menos uno con teléfono es condición para asignar tasador (RN-44).

  Cuadre m²              Validación que verifica que la suma de superficies de los ítems edificación
                         coincide con la superficie construida total declarada (RN-21).

  Cuadro de valoración   Tabla de ítems (edificación, terreno, OO.CC., piscina, terraza, bodega,
                         estacionamiento) que componen el valor comercial. Persiste en
                         TX_ItemsCuadroValoracion.

  DAG (Directed Acyclic  Grafo dirigido acíclico que describe el orden de ejecución de las \~15
  Graph)                 fórmulas del motor de cálculo (RN-29).

  DFL-2                  Decreto Ley con Fuerza de Ley N° 2. Vivienda de hasta 140 m² construidos con
                         beneficios tributarios.

  Dominio D\_            Séptimo dominio del modelo de datos. Independiente, sin FK cruzadas.
  (Documentos)           Materializa la gestión paramétrica de documentos opcionales (8 tablas,
                         patrón EAV polimórfico tipado).

  Dropbox path (v1.3)    Ruta jerárquica
                         /VProperty/{ClienteSlug}/{AAAA}/{codigo_solicitud}/{subcarpeta}/{archivo}.
                         Descrita en §8.1. Se persiste en TX_Adjuntos.dropbox_path para
                         auditabilidad.

  EAV polimórfico tipado Patrón Entity-Attribute-Value con columnas tipadas por valor primitivo
                         (texto, número, fecha, booleano, referencia a catálogo).

  Especificidad          Métrica de cuán precisa es una regla. Suma de filtros no-wildcard que
                         matchean una solicitud.

  Estado de conservación Condición física de la propiedad, con catálogo cerrado de seis valores
  (v1.9)                 mandatado por los clientes: nuevo, sin uso, bueno, normal, malo y
                         deficiente. Se fija a nivel de propiedad en IF-02 y se hereda a todos los
                         recintos; el tasador lo modifica sólo por excepción y el cambio queda
                         auditado (RN-49). No confundir con `estado_unidad` de TX_Unidades, cuyo
                         dominio es {nueva, usada} y cuya función es resolver qué documento alimenta
                         los datos catastrales (§4.3.3).

  Expediente 360°        Dossier consolidado que une 8 tablas para reconstruir una solicitud completa
                         en menos de dos minutos (IF-12).

  Factor de depreciación Coeficiente entre 0 y 1 que se aplica a la edificación según antigüedad y
  (D.F.)                 estado.

  Factor de garantía     Multiplicador (default 0.8) aplicado al valor de los ítems que sí aportan a
                         garantía. Independiente del factor de seguro (RN-12).

  Factor de              Ajuste aplicado a comparables para hacerlos equivalentes a la propiedad
  homogeneización        tasada (sup, edad, distancia).

  Factor de remate       Multiplicador (0.50--0.75) aplicado al valor comercial para obtener el valor
                         de remate. Depende de la velocidad de venta (RN-10).

  Factor de seguro       Multiplicador (1.0 o 0.8) usado en el cálculo del valor para seguro de
                         incendio (RN-11).

  Idempotencia           Ejecutar una operación N veces produce el mismo resultado que ejecutarla 1
                         vez. Obligatoria en todo escenario Make.

  Leasing habitacional   Modalidad de financiamiento donde el inmueble es propiedad de la institución
                         hasta el último pago.

  Mindicador             Servicio externo que provee el valor diario de UF y otras unidades.
                         Consumido por SC15 cada 9 AM.

  Motor de reglas        Componente que mapea contexto de solicitud a resultado (plantilla, fórmulas,
                         workflow). Vive en Airtable, lo ejecuta AT01.

  Next.js 14             Framework React usado para las cuatro UIs principales (IF-01 a IF-04). App
                         Router, desplegado en Railway.

  OO.CC.                 Obras complementarias: piscina, quincho, cierres, pavimentos. Se suman al
                         valor comercial pero no se deprecian.

  Override               Sustitución manual del valor default por un valor capturado por el tasador o
                         el visador. Tres campos lo admiten: tasa_cap_rate, vida_util, valor (RN-23).

  PDF de tasación        Documento entregable al cliente. Generado por Carbone. Hash SHA-256
                         persistido en TX_DocumentosGenerados.

  Plantilla Carbone      Archivo .docx con tags {variable} que Carbone reemplaza para producir el
                         PDF. Versionada en C_Plantillas y H_PlantillasAnteriores.

  PRC                    Plan Regulador Comunal. Cargado en M_Zonificacion.

  Regla wildcard         Regla del motor con casi todos los filtros vacíos. Garantiza que cualquier
                         solicitud resuelva al menos a una regla (RN-19, RF-24).

  Renta perpetua         V = ingreso anual neto / cap rate.

  Reproceso (v1.9)       Devolución de un informe ya entregado, solicitada por el cliente semanas
                         después del envío, cuando está escriturando y detecta que falta un
                         antecedente. Motivos de forma: nombre o RUT incompletos de comprador o
                         vendedor, dirección que no coincide con el certificado de número, permiso de
                         edificación o recepción final faltantes. Motivo de fondo: antecedente que
                         exige reanálisis. Tiene SLA propio (RN-55). Documentado en §1.9.1; su
                         gestión en el sistema se difiere (FUT-EJ-08).

  Rol SII                Identificador catastral asignado por el SII. Formato NNNNN-N.

  RUT                    Rol Único Tributario. Formato N.NNN.NNN-D. Validado con módulo 11 (RN-02).

  Saneamiento            Capa previa al cálculo que normaliza valores no-numéricos sin abortar el
                         flujo (RN-24). Conserva el valor crudo en \*\_raw.

  SLA                    Plazo acordado por cliente y tipo de informe (1 a 30 días). Excluye feriados
                         chilenos. Semáforo verde/ámbar/rojo (RN-04).

  Snapshot               Copia inmutable del estado de un registro o expresión de fórmula en un
                         momento dado. Embebido en TX_Calculos y A_DecisionesMotor.

  Test seco              Simulación de aplicar una regla nueva sobre las últimas 100 solicitudes sin
                         activarla. Obligatorio antes de marcar activa=TRUE (RN-20).

  Tipo de adjunto (v1.3) Enum de TX_Adjuntos.tipo_adjunto: escritura, cbr, plano, certificado_sii,
                         recepcion_municipal, foto_fachada, foto_interior, foto_area_comun,
                         documento_legal_terreno, revision_visador, informe_final, otro. Ver §8.2.

  Tipo de bien (v1.9)    Clasificación de cada ítem valorizable de una propiedad. Catálogo cerrado de
                         ocho valores, tomado del banner de ítems del cuadro de valorización:
                         Edificación, Terreno, Estacionamiento cubierto, Estacionamiento descubierto,
                         Estacionamiento uso y goce, Bodega, Piscina y Obras complementarias. Se
                         materializa en M_TiposDeBien. La terraza no es un tipo de bien: es
                         superficie de la unidad y se pondera al 50% (RN-09).

  Tipo de documento      Definición de un tipo de documento (D_TipoDocumento) con código, emisor y
  paramétrico            vigencia. Agregar uno nuevo requiere solo INSERTs en D\_.

  TX_Unidades (v1.6)     Tabla transaccional que persiste una fila por unidad física del inmueble
                         (Departamento, Estacionamiento, Bodega, Casa) con campos rol_sii, sup_m2,
                         sup_terreno_m2, avaluo_uf, anio_construccion, tipo_material, estado_unidad
                         y notas. Es la tabla destino de los atributos con
                         `uso_cardinalidad_destino = una_por_unidad`. Complementa (no reemplaza) a
                         TX_ItemsCuadroValoracion, que sigue siendo la fuente del cuadro de
                         valoración granular E1.

  UF                     Unidad de Fomento. Moneda indexada chilena. El sistema usa UF del día de la
                         visita, persistida en H_PreciosUF.

  ULH                    Unidad Leasing Habitacional (BICE). Workflow específico.

  uso_interfaz_negocio   Columna en D_TipoDocumentoAtributo (desde v1.6) que marca al atributo como
  (v1.3, v1.6)           consumido por interfaces de negocio (Set B). En v1.3 vivía en D_Atributo.
                         Renombrado desde uso_interfaz_tasador para reflejar vocación transversal
                         (Blueprint v8.1). Ver §4.

  uso_cardinalidad_      Columna nueva en D_TipoDocumentoAtributo (v8.2 · v1.6). Dominio
  destino (v1.6)         {una_por_solicitud, una_por_unidad}. Determina la tabla destino del
                         atributo extraído (TX_DatosTasacion vs TX_Unidades) y define el patrón de
                         escritura que aplica el script AT03-Ext.

  uso_campo_link_unidad  Columna nueva en D_TipoDocumentoAtributo (v8.2 · v1.6). Texto libre que
  (v1.6)                 declara cómo se resuelve la unidad destino cuando
                         `uso_cardinalidad_destino = una_por_unidad`. Ejemplo:
                         "TX_Unidades.rol_sii".

  Valor "NO REGISTRA"    Literal que aparece en certificados de avalúo fiscal cuando el inmueble es
  (v1.6)                 nuevo y aún no fue ingresado al catastro del SII. Reconocido
                         explícitamente por el prompt de Claude API y saneado por RF-29/RN-24.
                         Formalizado como RN-37. Caso validado: HEV-3183 (Inmobiliaria Exequiel
                         Fernández Torre Tres SpA, recepción final N°27 del 13-01-2026).

  Velocidad de venta     Categoría en 9 tramos que el tasador asigna a la propiedad. Determina factor
                         de remate (RN-10).

  Vendedor (v1.9)        Propietario actual del inmueble, que lo transfiere en la operación. En
                         propiedad Nueva es persona jurídica (razón social y RUT de la inmobiliaria);
                         en Usada, persona natural (nombre completo y RUT). El dato sigue la
                         jerarquía de fuentes correo → ficha → certificado de avalúo (RN-47). En
                         refinanciamiento coincide con el comprador.

  version del atributo   Snapshot de la versión del atributo usado en cada extracción SC07
  (v1.3, v1.6)           (blueprint SC-RF09-ExtraccionClaude). Paralelo a RN-28 del motor de
                         cálculo. Permite reproducir el mismo prompt años después. En v1.3 el
                         campo vivía en D_Atributo; desde v1.6 vive en D_TipoDocumentoAtributo.

  Vida útil              Años de vida útil de una edificación. Admite override del tasador (RN-07).

  Visador                Rol que revisa el PDF y los datos antes de aprobar. Puede devolver al
                         tasador con motivo (RN-17).

  Wildcard               Ver Regla wildcard.

  Workflow               Secuencia de pasos definida en C_Workflows + C_WorkflowPasos. Cada cliente
                         puede tener un workflow propio.
  ---------------------------------------------------------------------------------------------------

# **15. Puntos pendientes de definición (TBD)**

Los puntos siguientes no pueden definirse hoy con la información
disponible. Cada uno tiene responsable nominado y fecha límite
vinculante. Se preserva el catálogo TBD de la v1.2, los D-01 a D-09
emergentes de la reestructuración v1.3 y se añaden los D-10 a D-15
emergentes del levantamiento operativo v1.9.

  -------------------------------------------------------------------------------
  **ID**     **Punto pendiente**                 **Responsable**    **Fecha
                                                                    límite**
  ---------- ----------------------------------- ------------------ -------------
  TBD-01     Confirmar si la divergencia de vida Especialista       31-jul-2026
             útil del caso Coronel Souper (2018  Migración Legacy + 
             → 40 años en lugar de 65) obedece a Tasador titular    
             regla catalogable o override        (M. Soto)          
             puntual del tasador (RN-07).                           

  TBD-02     Política de gestión de tasaciones   Héctor Martínez    15-jul-2026
             con valor \> 10.000 UF: ¿gerencia   (aprobador final)  
             firma siempre o existe delegación?                     

  TBD-03     Política de migración para 17       Arquitecto de      31-jul-2026
             instituciones deprecadas.           Datos + Héctor     

  TBD-04     Lista exacta de clientes con        Parametrizador +   31-ago-2026
             factor_garantia ≠ 0.8 (default).    Visador titular    

  TBD-05     Workflow paralelo BICE Mutuos       Héctor + Ingeniero 30-sep-2026
             (RB-50): ¿integración Make hacia    Make               
             sistema externo BICE o BICE recibe                     
             PDF estándar?                                          

  TBD-06     Valor del PDF también en USD (tipo  Ejecutivo          31-ago-2026
             de cambio por fecha) o solo en      comercial +        
             UF/CLP.                             cliente piloto     

  TBD-07     Umbral exacto de desviación que     Visador titular +  31-oct-2026
             dispara flag_revision en AT04.      Arquitecto de      
                                                 Software           

  TBD-08     Prompt versionado y schema JSON     Especialista       31-jul-2026
             definitivo para Claude API (texto   Claude + Visador   
             descriptivo, RN-25).                titular            

  TBD-09     Nombre exacto y semántica del 6º    Negocio (Héctor) + 15-jul-2026
             campo nuevo en TX_Solicitudes con   Ejecutiva          
             valores 0.8250.                     comercial          

  D-01       Recepción de los 4 .docx base para  Sergio · IA        Julio 2026 ·
  (v1.3)     reestructuración --- CERRADA        Solution           cerrada
             (archivos recibidos).                                  

  D-02       Alcance de gestión de honorarios:   Héctor + IA        31-ago-2026
  (v1.3)     dentro de VProperty vs export       Solution           
             contable externo.                                      

  D-03       Modelo tarifario para compensación  Héctor +           30-sep-2026
  (v1.3)     de tasadores.                       Parametrizador     

  D-04       Facturación al cliente              Héctor + Ejecutiva 30-sep-2026
  (v1.3)     institucional: alcance y eventual                      
             integración SII.                                       

  D-05       Ventana de coordinación de visita:  Héctor + Cliente   31-ago-2026
  (v1.3)     respondida en el levantamiento v1.9 piloto
             --- son 4 h y es política interna,
             no SLA contractual (RN-53). Resta
             el acta de confirmación formal para
             cerrarla.

  D-06       Marca de agua en fotos del tasador  Arquitecto de      31-oct-2026
  (v1.3)     (RUT + hora): valor legal.          Software + Visador 

  D-07       Sugerencia asistida por Claude API  Héctor + IA        30-nov-2026
  (v1.3)     en revisión del Visador (segunda    Solution + Visador 
             opinión).                           titular            

  D-08       Firma digital avanzada del Visador  Arquitecto         31-oct-2026
  (v1.3)     en el PDF de salida.                Software +         
                                                 Compliance         

  D-09       Consolidación Google Drive vs       IA Solution +      31-ago-2026
  (v1.3)     Dropbox (proyecto usa Dropbox como  Héctor
             fuente única de archivos).

  D-10       Límite de reasignaciones por        Héctor + Ejecutiva 31-ago-2026
  (v1.9)     indisponibilidad del tasador:       comercial
             ¿bloqueo o advertencia a partir de
             la segunda? v1.9 implementa
             advertencia.

  D-11       Contenido exacto de las siete       Héctor + Tasador   31-ago-2026
  (v1.9)     respuestas de la llamada que nombra titular
             la plantilla del correo al tasador
             (§1.6.4).

  D-12       Certificado de consulta TCET / REI: Héctor +           30-sep-2026
  (v1.9)     qué es y si entra al catálogo       Parametrizador
             D_TipoDocumento. El cliente declara
             no conocerlo.

  D-13       Carga real de C_TramosHonorarios:   Héctor +           30-sep-2026
  (v1.9)     la tabla existe en el modelo, está  Parametrizador
             vacía y el cliente no la reconoce.

  D-14       Criterio de identidad de mismo      Arquitecto de      30-sep-2026
  (v1.9)     edificio para reutilizar permiso y  Datos + Héctor
             recepción: la base interna SII no
             trae edificio ni condominio.
             Confirmar si la coincidencia
             heurística con confirmación manual
             es aceptable (§1.5.0).

  D-15       Enunciado formal de RN-39, RN-42 y  Especialista       31-oct-2026
  (v1.9)     RN-43 (validaciones cruzadas del    Migración Legacy +
             XLSM), hoy referenciadas sin        Visador titular
             definición (§13).
  -------------------------------------------------------------------------------

# **Cierre y trazabilidad documental**

Esta Especificación del Proyecto v1.9 es el documento maestro de
requisitos de VProperty en su estructura por interfaz operacional.
Sucede a la v1.8.2 sin pérdida de contenido.

Cambios operativos v1.9, todos originados en el levantamiento con el
área de Control y Seguimiento y concentrados en la Interfaz Ejecutiva:
(1) la creación de solicitudes pasa por un wizard de tres fases que fija
modo de creación y tipo de propiedad antes del formulario (§1.5.0); (2)
el formulario se reduce de seis a cuatro secciones y admite N unidades
por solicitud, con catálogo cerrado de ocho tipos de bien y origen más
respaldo obligatorios por superficie (§1.5.1); (3) la asignación del
tasador deja de ser automática: AT02 sale del alcance de IF-02 y se
reemplaza por asignación manual asistida, con tres datos mínimos y
confirmación explícita (§1.5.5, §1.6); (4) la solicitud es editable
hasta la asignación y queda en modo consulta desde el estado asignada
(§1.4, RN-59); (5) la barra de acciones del detalle queda con dos
botones y el checklist documental se traslada al detalle (§1.3.1,
§1.5.1.1); (6) D_TipoDocumento se puebla con el catálogo operativo real
de quince tipos y se documenta la descarga manual del avalúo por captcha
(§4.2.1); (7) el canal de notificación al tasador queda en correo único,
con la plantilla `email_asignacion_tasador` y la regla de un hilo por
solicitud (§1.6.4, §5.3, RN-52).

Sin cambios respecto de v1.8.2: el dominio D\_ paramétrico documental
sigue reducido a dos tablas (D_TipoDocumento y D_TipoDocumentoAtributo);
el resultado de la extracción se persiste en
`TX_Adjuntos.atributos_obtenidos` con enrutamiento por cardinalidad a
TX_DatosTasacion y TX_Unidades; el tipo `foto_fuente_sii` y el campo
`estado_unidad` de TX_Unidades conservan su definición (RN-38). Todo
está explicitado en §4. El motor de cálculo (§6), la impresión del
informe (§7) y la estructura Dropbox (§8) no se modifican.

Alcance diferido declarado. Cinco funcionalidades quedan levantadas y
documentadas pero no implementadas: captura de la fecha de visita y
tablero de las tres fechas, reporte de contacto no logrado con bloqueo,
gestión de reprocesos post-entrega, checklist de visita del tasador y
aviso por WhatsApp. Se registran en §1.9 y §1.9.1 con identificador
propio y con las reglas que las gobiernan (RN-54, RN-55, RN-57), para
que la versión siguiente no deba volver a elicitarlas.

Toda decisión de implementación posterior se traza contra los
identificadores RF-XX, RNF-XX, RN-XX, RT-XX, RR-XX y SP-XX aquí
definidos. Cuando un requisito se modifique, se versionará este
documento y se preservará la versión anterior en H_Documentacion.

### **Fuentes oficiales alineadas a v1.9**

• Especificación del Proyecto v1.4 (contenido base de esta iteración;
v1.5 fue una versión intermedia incompleta, superada por v1.6).

• Arquitectura Enterprise VProperty v2.6 (sin cambios v1.6).

• Diseño de la Capa de Datos Enterprise v2.6.3 (sucede a v2.6.2 con la
reducción del dominio D\_ a dos tablas, la incorporación de
TX_Unidades y el uso de `TX_Adjuntos.atributos_obtenidos` como
persistencia del resultado de extracción).

• Blueprint de Interfaces v2.8 (sin cambios v1.6).

• Motor de Cálculo AT01--AT10 v2.5 (sin cambios v1.6).

• Blueprint v8.2 · SC-RF09 Extracción con Claude API (11 módulos,
fuente única D_TipoDocumentoAtributo, enrutamiento por cardinalidad ·
sucede a v8.1).

• VProperty_Origen_Datos_Informe v1.0 (mapeo de origen de datos).

• UI Ejecutiva (IF-02) --- Análisis de cambios v4 (levantamiento
operativo con el cliente: fuentes documentales de la ficha inmobiliaria,
el correo al tasador y el certificado de avalúo fiscal, más las
entrevistas de proceso end-to-end). Insumo único de los cambios v1.9 de
§1, §2.5, §4.2.1, §5.3, §9 RF-01, §13 y §15.

• Mockups Imagenes_IF_Ejecutiva.pdf · Imagenes_IF_Tasador.pdf ·
Imagenes_IF_Visador.pdf.

• Caso de referencia real HEV-3183 (Carlos Andrés Cortés Pérez /
Inmobiliaria Exequiel Fernández Torre Tres SpA · recepción final N°27
del 13-01-2026) — usado para validar el modelo de TX_Unidades, el
enrutamiento por cardinalidad, y el patrón "NO REGISTRA" (RN-37).

**Equipo redactor v1.9:** *Analista de Requerimientos Funcionales ·
Arquitecto de Software Enterprise · Diseñador de Datos/BD · Especialista
UX/Front-End · Ingeniero de Integraciones (Dropbox · Carbone.io · Claude
API). IA Solution · Julio de 2026.*
