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

  **Versión**         1.4 · Julio 2026 · Incorporación del stack
                      tecnológico real y del detalle funcional de v0 por
                      interfaz (Ejecutiva, Tasador, Visador). Sucede a
                      v1.3. Alineada a Arquitectura Enterprise v2.6, Capa
                      de Datos v2.6.2, Motor de Cálculo v2.5 y Blueprint
                      de Interfaces v2.8.

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

### **Cambios estructurales v1.3 → v1.4**

  -------------------------------------------------------------------------
  **Aspecto**         **v1.3 (anterior)**        **v1.4 (actual)**
  ------------------- -------------------------- --------------------------
  Estructura          Por Interfaz Operacional   Misma estructura por
  principal           (§1\--3) con descripción   Interfaz. Se incorpora en
                      textual del comportamiento las secciones 1--3 el
                      v0.dev.                    detalle observado en las
                                                 construcciones v0.dev
                                                 (componentes UI,
                                                 validaciones,
                                                 comportamientos concretos)
                                                 preservando los
                                                 identificadores RF
                                                 originales.

  Secciones nuevas    N/A                        Sin secciones nuevas.
                                                 §1.8, §2.7 y §3.7
                                                 (Front-end · base v0.dev)
                                                 se reescriben con el stack
                                                 real medido en los
                                                 repositorios v0 de las
                                                 tres interfaces. §1.3,
                                                 §1.5.1, §1.6, §2.5 y
                                                 §3.3\--3.5 se enriquecen
                                                 con los comportamientos
                                                 funcionales concretos
                                                 (chips, semáforos,
                                                 contadores, matrices de
                                                 permiso por estado,
                                                 checklist de documentos,
                                                 categorías de fotos,
                                                 diálogos de
                                                 aprobar/devolver/valor
                                                 alternativo, envío por
                                                 email con validación por
                                                 dominio, etc.).

  Identificadores     50 RF, 22 RNF, 36 RN, 11   Mismos identificadores.
                      RT, 8 RR, 12 SP (v1.3)     Cero renumeración. Cero
                                                 pérdida de contenido. Sólo
                                                 enriquecimiento de
                                                 descripciones y
                                                 actualización del stack.

  Trazabilidad al     Sin cambios en el dominio  Sin cambios respecto de
  dominio D\_         D\_ (RN-34 con flag        v1.3.
                      uso_interfaz_negocio ya    
                      vigente en v1.3).          

  Regla de            Explicitada en §4 (v1.3):  Sin cambios respecto de
  identificación de   coincidencia con           v1.3. La lista de
  documentos          D_TipoDocumentoAtributo.   documentos requeridos por
                                                 la Ejecutiva se rige por
                                                 el catálogo
                                                 TIPOS_DOCUMENTO (entidad
                                                 emisora + vigencia); la
                                                 solicitud puede crearse
                                                 sin adjuntar documentos y
                                                 el botón Crear solicitud
                                                 sólo se deshabilita si un
                                                 documento marcado no tiene
                                                 archivo (ver §1.5.1).

  Priorización de RF  Declarada en §9.1 (v1.3).  Sin cambios respecto de
  residuales                                     v1.3.
  -------------------------------------------------------------------------

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
(creadas desde IF-01 o desde ella misma), vigila SLA, reasigna tasadores
cuando corresponde, pausa o reactiva solicitudes y mantiene la cola
operativa al día. No accede a Airtable directamente; toda operación
transacciona vía API Route con validación server-side.

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
estado, SLA y prioridad, barra de acciones y pestañas Datos / Historial
/ Adjuntos. La pestaña Datos consolida el registro completo (cliente
solicitante, propiedad, contactos, plazo, decisión del motor de reglas
con regla ganadora y candidatas descartadas, tasador y visador
asignados). La pestaña Historial expone los eventos cronológicos
(A_Eventos) y los cambios auditados (A_Cambios). La pestaña Adjuntos
consolida los archivos vinculados a la solicitud.

Adjuntos iniciales: se muestran los archivos de TX_Adjuntos vinculados a
la solicitud con visor embebido (PDF) o miniatura (imagen). La URL
apunta a Dropbox (ver §8). La Ejecutiva puede descargar el original y
añadir nuevos adjuntos vía el flujo descrito en §1.5.3.

Documentos legales y de origen: cuando la solicitud tiene documentos
ingresados por IF-01 o por la ejecutiva (Escritura, CBR, Certificado
SII, Recepción Municipal, etc.), estos se listan aquí con el estado de
extracción realizada por Claude API (ver §4 Lectura de Documentos). Si
un documento fue procesado, la Ejecutiva ve una tarjeta con los
atributos extraídos y la trazabilidad al tipo D_TipoDocumento.

## **1.4 Modificación de detalles**

Edición inline de campos no-cálculo (canal, prioridad, contactos,
observaciones). La modificación queda auditada en A_Cambios con
before/after, autor (email del ejecutivo autenticado con Clerk) y
timestamp. Los campos críticos (cliente, propiedad, RUT) sólo son
editables mientras el estado sea creada o requiere_atencion; estados
posteriores los bloquean con tooltip explicativo.

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
presencial (no por el formulario público IF-01). El primer campo
obligatorio es Canal de origen, seguido de los mismos campos que IF-01
más la evidencia (captura, email reenviado).

### **1.5.1 Ingreso de datos**

Sheet lateral \"Nueva solicitud interna\" con formulario seccionado
(patrón P3 · Blueprint de Interfaces §5.4). Seis secciones plegables:
(1) Origen --- Banco originador (M_BANCOS), N° de operación cliente,
Sucursal originadora, Ejecutivo solicitante, canal (email, teléfono,
WhatsApp, presencial); (2) Propiedad --- dirección, región y comuna
(cascada Región→Comuna sobre M_Comunas), tipo de propiedad
(M_TiposPropiedad con requiere_subtipo dinámico); (3) Solicitante ---
RUT (validación módulo 11 en vivo con formateo automático · RN-02),
nombre, email, teléfono; (4) Producto --- cliente institucional y tipo
de informe/producto (lookup a M_Clientes.tipos_informe_permitidos); si
el producto es Hipotecario o Refinanciamiento, banco financista pasa a
obligatorio; (5) Documentos --- checklist con catálogo TIPOS_DOCUMENTO
(entidad emisora y vigencia por tipo); (6) Adjuntos --- zona de carga
reutilizable. Validaciones con react-hook-form + zod, mensajes de error
inline en español y toast de éxito/error (sonner). Autosave cada 30
segundos. Campos dependientes: cliente→tipos de informe/producto
disponibles; región→comuna; producto→banco financista obligatorio o no.

### **1.5.1.1 Documentos requeridos (checklist)**

El sistema muestra en la sección Documentos del sheet un checklist con
el catálogo TIPOS_DOCUMENTO. Cada fila expone el tipo de documento, la
entidad emisora y la vigencia por defecto. La regla operativa es: la
solicitud puede crearse sin adjuntar documentos; sólo cuando el usuario
marca explícitamente un documento del checklist, el sistema exige el
archivo correspondiente. El botón Crear solicitud se deshabilita
únicamente cuando existe al menos un documento marcado sin archivo
(tooltip explicativo con la lista de faltantes) y su habilitación ya no
depende de la validez total del formulario. Si el usuario desmarca un
documento que ya tenía archivo, el sistema abre un AlertDialog de
confirmación antes de descartar el vínculo.

### **1.5.1.2 Zona de carga reutilizable (FileUploadZone)**

Componente reutilizable de carga con drag-and-drop utilizado tanto
dentro del sheet Nueva solicitud como en la pestaña Adjuntos del panel
de detalle. Presenta cuatro estados visuales explícitos: idle, subiendo
(barra de progreso), éxito y error (con acciones reintentar/descartar).
Valida formato admitido (PDF, JPG, PNG) y tamaño máximo (10 MB). Cada
archivo aceptado se sube directamente a Dropbox por el flujo definido en
§1.5.3 y se registra en TX_Adjuntos.

  -------------------------------------------------------------------------
  **RF-06**         **Asignación manual y reasignación**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecutiva puede asignar o reasignar el tasador y el
                    visador. Toda reasignación exige una justificación
                    obligatoria (campo texto), incrementa un contador y
                    queda registrada en A_Eventos con
                    evento_tipo=\'reasignacion\' y autor identificado.

  **Criterio de     El sistema impide guardar la reasignación si el campo
  aceptación**      justificación está vacío. Cada reasignación aparece en
                    A_Eventos en menos de un segundo desde su confirmación.
  -------------------------------------------------------------------------

### **1.5.2 Lectura de documentos**

Los adjuntos cargados durante la creación (escritura, CBR, plano,
certificado SII, recepción municipal, etc.) DISPARAN ASINCRÓNICAMENTE EL
FLUJO DE EXTRACCIÓN SC07 → Claude API. Los atributos extraídos se
muestran a la Ejecutiva conforme llegan (progressive UI). El detalle del
patrón se especifica en la §4 Lectura de Documentos y se rige por la
regla de identificación mediante coincidencia con
D_TipoDocumentoAtributo.

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
SC01 (webhook Make de validación) → AT01 (resolver motor de reglas) →
AT02 (asignar tasador). En caso de fallo de validación, el estado no
avanza y queda registrada la excepción en Z_ColaPendientes.

  -------------------------------------------------------------------------
  **RF-04**         **Disparo de la máquina de estados**
  ----------------- -------------------------------------------------------
  **Descripción**   El envío del formulario (público o interno) debe
                    insertar una fila en TX_Solicitudes con estado=creada,
                    generar el código identificador VP-AAAA-NNNN y disparar
                    el webhook Make SC01 → AT01 (resolver motor de reglas)
                    → AT02 (asignar tasador).

  **Criterio de     100% de las solicitudes enviadas quedan persistidas
  aceptación**      (cero pérdida). La resolución del motor se completa en
                    menos de cinco segundos en el percentil 95 medido sobre
                    TX_Solicitudes.estado vs A_DecisionesMotor.timestamp.
  -------------------------------------------------------------------------

### **1.5.5 Asignación automática de Tasador**

AT02 (Airtable Script) selecciona al tasador con menor carga relativa
(casos_en_curso / capacidad_activa) entre los que tienen la comuna de la
solicitud en sus zonas_cobertura y están activos. Regla activa RN-03
(asignación territorial). Si el ejecutivo preasignó manualmente (paso
1.5.1 opcional), AT02 respeta el override y registra A_Eventos
evento_tipo=\'asignacion_manual\'. Si no hay tasador disponible, la
solicitud pasa a requiere_atencion con motivo \'sin tasador disponible
en la comuna X\'.

## **1.6 Reasignación de Tasador**

Acción disponible desde la barra de acciones del panel de detalle
(§1.3). Se abre un diálogo con buscador de profesionales por nombre o
RUT (cmdk command palette), ficha del tasador candidato con su carga de
trabajo actual (casos en curso vs capacidad activa) y su cobertura
territorial; si la comuna de la solicitud no está en las zonas_cobertura
del candidato, el diálogo muestra una alerta visible de \"fuera de
cobertura\" pero no bloquea la reasignación (queda como override
informado). El campo motivo es obligatorio; el campo nota es opcional.
Al confirmar: (1) TX_Solicitudes.tasador se actualiza al nuevo tasador;
(2) el contador de reasignaciones incrementa; (3) A_Eventos registra
evento_tipo=\'reasignacion_manual\' con autor, tasador_anterior,
tasador_nuevo, motivo y timestamp; (4) el panel de detalle se refresca y
aparece un toast de éxito; (5) SC13 notifica al tasador entrante (email
· WhatsApp opcional). Nota v0 · la Ejecutiva no reasigna Visador desde
la barra de acciones: el dato del visador se conserva visible en la
pestaña Datos del panel de detalle y su reasignación es responsabilidad
del rol Visador/Administrador desde su propia consola.

## **1.7 Automatizaciones**

La Interfaz Ejecutiva es un consumidor y disparador de automatizaciones;
no las contiene. Las relevantes son:

  ---------------------------------------------------------------------------
  **ID**   **Nombre**             **Trigger desde   **Efecto observable**
                                  IF-02**           
  -------- ---------------------- ----------------- -------------------------
  SC01     Webhook validación de  Submit válido de  Inserta en TX_Solicitudes
           solicitud              nueva solicitud   con estado=creada;
                                  (§1.5.4)          encadena AT01→AT02.

  AT01     Resolver motor de      estado=creada     Determina plantilla,
           reglas                                   fórmulas, workflow.
                                                    Escribe A_DecisionesMotor
                                                    con regla ganadora y
                                                    candidatas.

  AT02     Asignar tasador        post AT01         Selecciona tasador y
                                                    persiste en
                                                    TX_Solicitudes.tasador.
                                                    Notifica al tasador
                                                    entrante.

  AT08     Alertas SLA            Cron 08:00 diario Genera resumen de
                                                    solicitudes en SLA
                                                    ámbar/rojo; visible en la
                                                    Vista de SLA (§1.2).

  SC13     Envío de               Reasignación,     Email al destinatario
           notificaciones         cambio de         correspondiente.
                                  prioridad, pausa  Destinatarios en
                                                    C_NotificacionesConfig.
  ---------------------------------------------------------------------------

## **1.8 Front-end (base v0.dev)**

El diseño visual se construye sobre la base ya generada en v0.dev para
IF-02 (Consola Ejecutiva), preservando las decisiones de estilo del
sistema de diseño VProperty CU-000.A: tokens de color (azul-vp #075899,
naranja-vp #F5A213), tipografía (H1 28pt, H2 24pt, H3 22pt, cuerpo
11pt), spacing y radii. Componentes reutilizados sin regeneración:
RUTField, EmailField, AddressField con Google Places,
RegionComunaSelector con cascading, FileUploadZone (los cuatro estados
idle/subiendo/éxito/error, sube directo a Dropbox), SLABadge, StateBadge
con los 11 estados oficiales y EventTimeline renderizando A_Eventos.

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
por operación que quedan fuera del alcance actual v1.4 y se elevan al
comité para decisión formal:

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

  FUT-EJ-04   Ventana de 24 h           En análisis   Elevado como D-05
              coordinación de visita                  (SLA contractual vs
              como SLA contractual                    OLA interno).

  FUT-EJ-05   Reasignación automática   Backlog       Requiere tabla
              al detectar tasador                     H_ActividadTasador o
              inactivo \>48h                          cálculo sobre
                                                      A_Eventos; escalable.
  -------------------------------------------------------------------------

Dependencias y entidades (Sección 1). Tablas escritas: TX_Solicitudes
(campos no-cálculo), TX_Adjuntos, A_Eventos, A_Cambios. Tablas leídas:
M_Clientes, M_Comunas, M_TiposInforme, M_TiposPropiedad, M_Tasadores,
M_Visadores, C_SLA, A_DecisionesMotor. Reglas de negocio implicadas:
RN-01, RN-02, RN-03, RN-04, RN-24 (saneamiento cuando el ejecutivo
captura RUT inválido de propietario con flag).

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
                                                               anio_construccion,
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
           documentos (Claude     en §2.5.1          D_Atributo, persiste en
           API)                                      D_Documento +
                                                     D_DocumentoValorAtributo, y
                                                     opcionalmente distribuye a
                                                     TX\_/M\_ (Set A y B, ver
                                                     §4).

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
TX_Solicitudes, M_TiposPropiedad, M_Comunas, D_TipoDocumento,
D_Atributo, D_TipoDocumentoAtributo. Reglas de negocio implicadas: RN-05
a RN-14 (motor de cálculo), RN-21, RN-23, RN-38, RN-39, RN-42, RN-43.
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
paneles: Config D_Atributo, Set A Motor de Cálculo, Set B Interfaces del
Negocio, Sistemas y Capas); VProperty_Origen_Datos_Informe v1.0
(inventario del origen de los \~180 campos del informe); el dominio D\_
(7 tablas del Diseño de Capa de Datos v2.6.2).

## **4.1 Principio rector**

Un solo modelo parametriza todo el poblamiento: la tabla D_Atributo
junto con su relación con tipos de documento (D_TipoDocumentoAtributo)
declaran qué se extrae de cada documento, con qué ejemplo se guía a
Claude, y dónde se guarda el resultado. Cambiar el comportamiento del
sistema equivale a editar filas en Airtable. Sin deploy. Este principio
extiende RN-27 al dominio documental (paralelo declarado como RN-31 en
la v1.2).

## **4.2 Regla de identificación por coincidencia con D_TipoDocumentoAtributo**

Todo documento o foto que ingresa al sistema (vía IF-01, IF-02 o IF-03)
es identificado por su tipo mediante coincidencia con la tabla
D_TipoDocumentoAtributo, que asocia atributos definidos en D_Atributo
con tipos de documento en D_TipoDocumento. La regla es: el sistema no
infiere el tipo, se declara. Puede declararse manualmente por el usuario
al momento del upload (dropdown filtrado por D_TipoDocumento), o
automáticamente si el flujo lo permite (por ejemplo, escenarios de
reingreso a partir de un catálogo cerrado por cliente).

  ---------------------------------------------------------------------------
  **RN-25**           **Regla de identificación del documento/foto por
                      coincidencia con D_TipoDocumentoAtributo**
  ------------------- -------------------------------------------------------
  **Precondición**    Un archivo (documento o foto) entra al sistema con un
                      tipo declarado por el usuario o por defecto según el
                      contexto de la interfaz.

  **Acción**          El sistema consulta D_TipoDocumentoAtributo filtrando
                      por tipo_documento = el tipo declarado. Obtiene la
                      lista de atributos aplicables. Genera el prompt
                      versionado para Claude API inyectando ejemplo_atributo
                      por cada campo, y persiste snapshot de version.

  **Postcondición**   El documento tiene una fila en D_Documento con
                      codigo_documento único; los atributos extraídos quedan
                      en D_DocumentoValorAtributo con la columna tipada
                      correcta (RN-32). Si el usuario declaró un tipo
                      incorrecto, el reprocesamiento manual permite
                      corregirlo.

  **Trazabilidad**    Blueprint v8.1 · Panel Config D_Atributo. Extendida en
                      RN-31/RN-32/RN-33 y complementada por RN-34/RN-35/RN-36
                      de trazabilidad manual.
  ---------------------------------------------------------------------------

## **4.3 Set A · Datos para el motor de cálculo**

D_Atributo filtra por usado_motor_calculo=true. Los atributos extraídos
por Claude API se distribuyen a TX_DatosTasacion, TX_Solicitudes,
TX_DocumentosLegales o al alias correspondiente indicado en
uso_tabla_destino y uso_campo_destino (RN-35 · trazabilidad textual, sin
FK).

  ---------------------------------------------------------------------------------------
  **Sub-paso**   **Componente**    **Insumo**                 **Salida**
  -------------- ----------------- -------------------------- ---------------------------
  1.1 Lectura A  Make SC07 →       PDF/imagen + prompt con    JSON con {atributo_id,
                 Claude API        ejemplo_atributo por cada  valor_extraido, confianza}.
                                   fila filtrada por          
                                   usado_motor_calculo=true   

  1.2 Guardado A Airtable Script   JSON de 1.1 +              Fila en D_Documento +
                 AT03-Ext          uso_tabla_destino +        D_DocumentoValorAtributo;
                                   uso_campo_destino +        opcionalmente propagación a
                                   version snapshot           TX_DatosTasacion vía
                                                              escritura idempotente.
  ---------------------------------------------------------------------------------------

## **4.4 Set B · Datos para las interfaces del negocio**

D_Atributo filtra por uso_interfaz_negocio=true (renombrado desde
uso_interfaz_tasador para reflejar vocación transversal · Blueprint
v8.1). Un atributo puede pertenecer a Set A, Set B, o ambos --- son
independientes.

  ----------------------------------------------------------------------------------------
  **Sub-paso**   **Componente**    **Insumo**                  **Salida**
  -------------- ----------------- --------------------------- ---------------------------
  1.3 Lectura B  Make SC07 →       PDF/imagen + prompt con     JSON con {atributo_id,
                 Claude API        ejemplo_atributo por cada   valor_extraido, confianza}.
                                   fila filtrada por           
                                   uso_interfaz_negocio=true   

  1.4 Guardado B Airtable Script   JSON de 1.3 +               Fila en D_Documento +
                 AT03-Ext          uso_tabla_destino +         D_DocumentoValorAtributo;
                                   uso_campo_destino + version opcionalmente propagación a
                                   snapshot                    la tabla de negocio
                                                               indicada.
  ----------------------------------------------------------------------------------------

## **4.5 Cambios v8.1 respecto a versiones anteriores**

  -----------------------------------------------------------------------
  **Cambio**              **Descripción**
  ----------------------- -----------------------------------------------
  Renombre                Refleja la vocación transversal del patrón
  uso_interfaz_tasador →  (aplicable a cualquier IF que reciba
  uso_interfaz_negocio    documentos, no sólo la del tasador). Requiere
                          migración de datos y actualización de scripts.
                          Documentado en RN-34 revisado.

  Nuevo campo             Cada ejecución guarda un snapshot con la
  D_Atributo.version      version usada, permitiendo reproducir el mismo
                          prompt años después aunque D_Atributo haya
                          evolucionado. Paralelo directo a la regla RN-28
                          del motor de cálculo (reproducibilidad
                          histórica).

  Ejemplo real de fila    El campo ejemplo_atributo se puebla con
  D_Atributo              literales de los seis informes reales del
                          cliente. Regla RN-36 vigente: si no hay
                          evidencia trazable, se persiste
                          PENDIENTE_VALIDACION.
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

  RN-34    Trazabilidad D_Atributo ↔ Interfaz (uso_interfaz_negocio) ---
           revisada v1.3

  RN-35    Trazabilidad manual D_Atributo → TX\_/M\_ (uso_tabla_destino,
           uso_campo_destino)

  RN-36    Documentación viva de ejemplo (ejemplo_atributo con cero
           fabricación)
  ------------------------------------------------------------------------

Dependencias y entidades (Sección 4). Tablas escritas: D_Documento,
D_DocumentoValorAtributo, TX_DatosTasacion (Set A propagado), y otras
tablas destino según uso_tabla_destino. Tablas leídas: D_TipoDocumento,
D_Atributo, D_TipoDocumentoAtributo, D_Catalogo, D_CatalogoValor,
D_TipoDato. Regla activa: RN-25, RN-31, RN-32, RN-33, RN-34 (revisada),
RN-35, RN-36.

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
notificaciones automáticas (SC13). Consumida por AT05, AT08, AT06, entre
otras. El operador puede cambiar destinatario o canal (email, whatsapp
futuro) sin tocar código.

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
  **RF-45**         **Definición de atributos reutilizables (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El administrador debe poder definir atributos
                    reutilizables (D_Atributo) con tipo de dato, catálogo
                    asociado (si aplica), unidad de medida y patrón de
                    validación. Incluye version (v8.1) para
                    reproducibilidad histórica.

  **Criterio de     Un atributo se reutiliza en N tipos de documento
  aceptación**      mediante D_TipoDocumentoAtributo sin duplicación.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-46**         **Asociación tipo de documento ↔ atributo (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema debe permitir asociar atributos a tipos de
                    documento (D_TipoDocumentoAtributo) marcando
                    obligatoriedad, orden de presentación, etiqueta local y
                    valor por defecto.

  **Criterio de     Cambiar la obligatoriedad u orden no requiere
  aceptación**      despliegue.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-47**         **Catálogos cerrados administrables (IF-14)**
  ----------------- -------------------------------------------------------
  **Descripción**   El administrador debe poder mantener catálogos cerrados
                    (D_Catalogo, D_CatalogoValor) usados por atributos de
                    tipo catálogo, agregando o desactivando valores sin
                    DDL.

  **Criterio de     Un valor desactivado deja de ofrecerse en captura pero
  aceptación**      sigue siendo válido en documentos históricos.
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
M_TiposPropiedad, M_Bancos, M_Productos, D_TipoDocumento, D_Atributo,
D_TipoDocumentoAtributo, D_Catalogo, D_CatalogoValor, D_TipoDato,
A_DecisionesMotor, A_Cambios.

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

  AT02     AT02_asignar_tasador             estado=creada      M_Tasadores, M_Comunas   TX_Solicitudes, A_Eventos
                                            (post AT01)                                 

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
  **RF-29**         **Capa de saneamiento previo**
  ----------------- -------------------------------------------------------
  **Descripción**   Antes de ejecutar fórmulas numéricas, una capa de
                    saneamiento normaliza valores no-numéricos: avalúo \'NO
                    REGISTRA\' → null + flag avaluo_no_registra; RUT
                    propietario 0 → null + flag rut_no_disponible.

  **Criterio de     Un caso con avalúo \'NO REGISTRA\' no aborta el flujo;
  aceptación**      el cálculo procede usando null y el visador ve el flag
                    en pantalla. El campo crudo se conserva en
                    avaluo_total_raw.
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
acotado para agilidad operativa; cuando el tipo requiere metadata
paramétrica (por ejemplo, atributos definidos en D_Atributo), se
registra una referencia a D_Documento (por codigo_documento) sin crear
FK cruzada --- el desacople de RN-33 se preserva. El hash_md5 evita
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
                    comuna autocompletada, nombre del propietario, RUT del
                    propietario validado con módulo 11 en tiempo real,
                    email de contacto.

  **Criterio de     Completitud en menos de 90 segundos en escritorio y
  aceptación**      móvil, medido en al menos 10 sesiones piloto.
                    Validación de RUT y email bloquea el envío con mensaje
                    no técnico. Tras el envío, confirmación visual
                    inmediata y email de acuse en menos de dos segundos con
                    el código VP-AAAA-NNNN.
  -------------------------------------------------------------------------

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
                    (D_Documento) seleccionando un tipo y completando los
                    atributos definidos para ese tipo
                    (D_DocumentoValorAtributo). Los campos obligatorios
                    bloquean el guardado; los opcionales pueden quedar
                    vacíos.

  **Criterio de     El formulario de captura se construye dinámicamente a
  aceptación**      partir del tipo elegido, sin pantallas hard-codeadas.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-49**         **Patrón EAV polimórfico tipado**
  ----------------- -------------------------------------------------------
  **Descripción**   El valor de cada atributo se persiste en
                    D_DocumentoValorAtributo en una única columna según su
                    tipo de dato (valor_texto, valor_numero, valor_fecha,
                    valor_booleano o id_catalogo_valor). El sistema debe
                    rechazar valores en columnas que no correspondan al
                    tipo del atributo.

  **Criterio de     Query de auditoría devuelve cero inconsistencias entre
  aceptación**      tipo_dato esperado y columna poblada.
  -------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **RF-50**         **Independencia del dominio de tasaciones**
  ----------------- -------------------------------------------------------
  **Descripción**   Las 8 tablas D\_ no contienen ningún link record hacia
                    M\_, C\_, TX\_, A\_, H\_ o Z\_. El dominio puede
                    operar, exportarse o migrarse sin tocar el resto del
                    sistema.

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
  **Descripción**   La resolución del motor (AT01) y la asignación del
                    tasador (AT02) se completan en menos de cinco segundos
                    desde la recepción de la solicitud, percentil 95.

  **Criterio de     Z_EjecucionesMake.duracion_ms del par AT01+AT02: P95 ≤
  aceptación**      5.000 ms. Medido sobre ventanas móviles de 24 h.
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

  RN-32    Validación EAV polimórfica tipada       §4, §9 IF-15

  RN-33    Desacople estricto del dominio D\_      §4, §5.5, §9 IF-15

  RN-34    Trazabilidad D_Atributo ↔ Interfaz ---  §4.4, §4.5
           revisada v1.3 (uso_interfaz_negocio)    

  RN-35    Trazabilidad manual D_Atributo →        §4.3, §4.4
           TX\_/M\_                                

  RN-36    Documentación viva de ejemplo           §4
           (ejemplo_atributo)                      
  ------------------------------------------------------------------------

Nota v1.3 sobre RN-25. La regla original de generación de texto
descriptivo con contrato estricto (v1.2) se conserva íntegramente en §7
Impresión Informe. En §4 se explicita adicionalmente la regla de
identificación por coincidencia con D_TipoDocumentoAtributo como
aplicación específica del mismo principio en el ingreso de datos. Ambos
enunciados son consistentes: contrato estricto + trazabilidad de esquema
a fuente única (D_Atributo).

Nota v1.3 sobre RN-34. El flag uso_interfaz_tasador de la v1.2 se
renombra a uso_interfaz_negocio para reflejar la vocación transversal
del patrón (aplicable a cualquier IF que reciba documentos, no sólo la
del tasador). El renombre es un cambio de datos con migración
documentada en el Diseño de Capa de Datos v2.6.2 y actualización de
scripts que consulten el campo. La semántica de la regla no cambia.

# **14. Glosario del dominio**

Glosario unificado, en orden alfabético. Se preserva el glosario de v1.2
con adiciones marcadas v1.3.

  ---------------------------------------------------------------------------------------------------
  **Término**            **Definición operativa**
  ---------------------- ----------------------------------------------------------------------------
  Airtable Interface     Aplicación visual nativa de Airtable que materializa las pantallas internas
                         (IF-05 a IF-13). Sin código, con permisos por rol.

  Append-only            Política aplicada a tablas A\_\*: una vez escrita, una fila no se edita ni
                         se borra. Solo se archiva al cierre de su periodo de retención.

  Atributo paramétrico   Campo reutilizable definido en D_Atributo con tipo de dato, unidad y
                         validación. Se asocia a uno o varios tipos de documento mediante
                         D_TipoDocumentoAtributo sin duplicarse.

  Avalúo fiscal          Valor que el SII asigna a un inmueble. Puede aparecer como \'NO REGISTRA\';
                         el sistema lo sanea (RN-24).

  Cap rate (tasa         Tasa de capitalización usada para estimar el valor de un inmueble que genera
  exigida)               renta. V = ingreso anual neto / cap rate. Varía por cliente y admite
                         override (RN-08).

  Carbone                Carbone.io. Servicio externo que toma una plantilla .docx + un JSON
                         estructurado y produce el PDF final del informe.

  Catálogo cerrado       Lista cerrada de valores (D_Catalogo + D_CatalogoValor) que restringe los
  documental             valores admitidos para un atributo de tipo catálogo. Administrable sin DDL.

  CBR                    Conservador de Bienes Raíces. Documento que acredita propiedad. Puede entrar
                         al sistema como adjunto en TX_Adjuntos con tipo_adjunto=\'cbr\'.

  Clerk                  Proveedor de autenticación usado por las cuatro UIs Next.js. Emite JWT
                         validado en cada API Route.

  Comparable             Inmueble similar usado como referencia de precio. TX_Comparables guarda
                         entre 3 y 10 por solicitud, ajustados por factores de homogeneización.

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

  Tipo de documento      Definición de un tipo de documento (D_TipoDocumento) con código, emisor y
  paramétrico            vigencia. Agregar uno nuevo requiere solo INSERTs en D\_.

  UF                     Unidad de Fomento. Moneda indexada chilena. El sistema usa UF del día de la
                         visita, persistida en H_PreciosUF.

  ULH                    Unidad Leasing Habitacional (BICE). Workflow específico.

  uso_interfaz_negocio   Flag en D_Atributo que marca al atributo como consumido por interfaces de
  (v1.3)                 negocio (Set B). Renombrado desde uso_interfaz_tasador para reflejar
                         vocación transversal (Blueprint v8.1). Ver §4.

  Velocidad de venta     Categoría en 9 tramos que el tasador asigna a la propiedad. Determina factor
                         de remate (RN-10).

  version de D_Atributo  Snapshot de la versión del atributo usado en cada extracción SC07. Paralelo
  (v1.3)                 a RN-28 del motor de cálculo. Permite reproducir el mismo prompt años
                         después.

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
vinculante. Se preserva el catálogo TBD de la v1.2 y se añaden los D-X
emergentes de la reestructuración v1.3.

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

  D-05       Ventana de 24 h de coordinación de  Héctor + Cliente   31-ago-2026
  (v1.3)     visita: SLA contractual vs OLA      piloto             
             interno.                                               

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
  -------------------------------------------------------------------------------

# **Cierre y trazabilidad documental**

Esta Especificación del Proyecto v1.3 es el documento maestro de
requisitos de VProperty en su estructura por interfaz operacional.
Sucede a la v1.2 sin pérdida de contenido: los 50 RF, 22 RNF, 36 RN, 11
RT, 8 RR y 12 SP originales se preservan íntegros con sus
identificadores; sólo cambia su agrupación y la explicitación de los
cambios v8.1 del blueprint documental.

Toda decisión de implementación posterior se traza contra los
identificadores RF-XX, RNF-XX, RN-XX, RT-XX, RR-XX y SP-XX aquí
definidos. Cuando un requisito se modifique, se versionará este
documento y se preservará la versión anterior en H_Documentacion.

### **Fuentes oficiales alineadas a v1.3**

• Especificación del Proyecto v1.2 (contenido base de esta
reestructuración).

• Arquitectura Enterprise VProperty v2.6 (sucede a v2.5).

• Diseño de la Capa de Datos Enterprise v2.6.2 (sucede a v2.6.1).

• Blueprint de Interfaces v2.8 (sucede a v2.7).

• Motor de Cálculo AT01--AT10 v2.5 (sin cambios v1.3).

• Blueprint v8.1 · Poblamiento automático desde documentos (fuente
lógica para §4).

• VProperty_Origen_Datos_Informe v1.0 (mapeo de origen de datos).

• Mockups Imagenes_IF_Ejecutiva.pdf · Imagenes_IF_Tasador.pdf ·
Imagenes_IF_Visador.pdf.

**Equipo redactor v1.3:** *Analista de Requerimientos Funcionales ·
Arquitecto de Software Enterprise · Diseñador de Datos/BD · Especialista
UX/Front-End · Ingeniero de Integraciones (Dropbox · Carbone.io). IA
Solution · Julio de 2026.*
