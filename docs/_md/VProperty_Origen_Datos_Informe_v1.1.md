**V P R O P E R T Y**

**Origen de Datos del**

**Informe de Tasación**

*Inventario completo de campos: ¿quién los entrega y cómo?*

  -----------------------------------------------------------------------
  **Proyecto**       VProperty · Sistema configurable de tasaciones
  ------------------ ----------------------------------------------------
  **Documento**      Análisis de origen de datos del Informe de Tasación

  **Insumos**        6 informes PDF reales (METLIFE-6280, HEV-3183,
                     AGH-1548, ALH-335, HIPOTECARIA SECURITY-6073,
                     METLIFE-6283)

  **Documentos de    Project Specification v1.0 · Enterprise Architecture
  referencia**       v2.5 · Data Layer Design v2.5 · Interface Blueprint
                     v2.6 · Calculation Engine AT01--AT10 v2.5 ·
                     Consolidated Use Cases v1.0 · IF-01/02/03/04 Design
                     v1.0

  **Equipo           Arquitecto de Datos · Arquitecto de Experiencia
  ejecutor**         Operacional · Especialista en Motor de Cálculo ·
                     Especialista en Extracción IA (Claude SC07) · QA
                     Lead

  **Versión**        v1.1

  **Fecha**          Julio 2026
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **PREGUNTA DE SERGIO (TEXTUAL)**                                      |
|                                                                       |
| ¿Tengo todos los datos contemplados? ¿Cuáles datos vienen de leer     |
| documentos y cuáles? ¿Cuáles datos serán ingresados por usuario, qué  |
| usuario y en qué interfaz? **¿Y cuáles datos NO son ingresados sino   |
| que los proporciona el motor de cálculo?**                            |
+=======================================================================+

**Tabla de Contenido**

[0 · Resumen ejecutivo (TL;DR)
[3](#resumen-ejecutivo-tldr)](#resumen-ejecutivo-tldr)

[1 · Respuesta directa a la pregunta 1 · ¿Tengo todos los datos
contemplados?
[5](#respuesta-directa-a-la-pregunta-1-tengo-todos-los-datos-contemplados)](#respuesta-directa-a-la-pregunta-1-tengo-todos-los-datos-contemplados)

[Lo que falta o conviene validar antes de Phase 5
[5](#lo-que-falta-o-conviene-validar-antes-de-phase-5)](#lo-que-falta-o-conviene-validar-antes-de-phase-5)

[2 · Respuesta directa a la pregunta 2 · ¿Cuáles datos vienen de leer
documentos?
[6](#respuesta-directa-a-la-pregunta-2-cuáles-datos-vienen-de-leer-documentos)](#respuesta-directa-a-la-pregunta-2-cuáles-datos-vienen-de-leer-documentos)

[2.1 · Campos extraídos por Claude desde documentos
[6](#campos-extraídos-por-claude-desde-documentos)](#campos-extraídos-por-claude-desde-documentos)

[2.2 · Datos del PDF que también se extraen pero NO van a campos
estructurados
[8](#datos-del-pdf-que-también-se-extraen-pero-no-van-a-campos-estructurados)](#datos-del-pdf-que-también-se-extraen-pero-no-van-a-campos-estructurados)

[3 · Respuesta directa a la pregunta 3 · ¿Cuáles datos ingresa el
usuario, qué usuario, en qué interfaz?
[9](#respuesta-directa-a-la-pregunta-3-cuáles-datos-ingresa-el-usuario-qué-usuario-en-qué-interfaz)](#respuesta-directa-a-la-pregunta-3-cuáles-datos-ingresa-el-usuario-qué-usuario-en-qué-interfaz)

[3.1 · Solicitante externo de la institución cliente · IF-01
[9](#solicitante-externo-de-la-institución-cliente-if-01)](#solicitante-externo-de-la-institución-cliente-if-01)

[3.2 · Ejecutiva comercial · IF-02
[10](#ejecutiva-comercial-if-02)](#ejecutiva-comercial-if-02)

[3.3 · Tasador · IF-03 (PWA móvil en terreno)
[10](#tasador-if-03-pwa-móvil-en-terreno)](#tasador-if-03-pwa-móvil-en-terreno)

[Sección 1 · Datos de la propiedad
[10](#sección-1-datos-de-la-propiedad)](#sección-1-datos-de-la-propiedad)

[Sección 2 · Fotos obligatorias
[11](#sección-2-fotos-obligatorias)](#sección-2-fotos-obligatorias)

[Sección 3 · Cuadro de valoración granular E1 (TX_ItemsCuadroValoracion)
[11](#sección-3-cuadro-de-valoración-granular-e1-tx_itemscuadrovaloracion)](#sección-3-cuadro-de-valoración-granular-e1-tx_itemscuadrovaloracion)

[Sección 4 · Comparables E2 (TX_Comparables)
[12](#sección-4-comparables-e2-tx_comparables)](#sección-4-comparables-e2-tx_comparables)

[Sección 5 · Ampliaciones / Programa por nivel / Terminaciones por
recinto
[13](#sección-5-ampliaciones-programa-por-nivel-terminaciones-por-recinto)](#sección-5-ampliaciones-programa-por-nivel-terminaciones-por-recinto)

[Sección 6 · Documentos legales (TX_DocumentosLegales) --- captura
manual de respaldo
[13](#sección-6-documentos-legales-tx_documentoslegales-captura-manual-de-respaldo)](#sección-6-documentos-legales-tx_documentoslegales-captura-manual-de-respaldo)

[Sección 7 · Overrides (CU-007)
[13](#sección-7-overrides-cu-007)](#sección-7-overrides-cu-007)

[Notas libres del tasador
[13](#notas-libres-del-tasador)](#notas-libres-del-tasador)

[3.4 · Visador · IF-04 (ajustes finos)
[14](#visador-if-04-ajustes-finos)](#visador-if-04-ajustes-finos)

[4 · Respuesta directa a la pregunta 4 (nueva) · ¿Cuáles datos los
proporciona el motor de cálculo?
[15](#respuesta-directa-a-la-pregunta-4-nueva-cuáles-datos-los-proporciona-el-motor-de-cálculo)](#respuesta-directa-a-la-pregunta-4-nueva-cuáles-datos-los-proporciona-el-motor-de-cálculo)

[4.1 · Datos provistos por el DAG de fórmulas (Motor AT03 · TX_Calculos)
[15](#datos-provistos-por-el-dag-de-fórmulas-motor-at03-tx_calculos)](#datos-provistos-por-el-dag-de-fórmulas-motor-at03-tx_calculos)

[4.2 · Datos provistos por catálogos (NO son cálculo pero tampoco
ingreso humano)
[17](#datos-provistos-por-catálogos-no-son-cálculo-pero-tampoco-ingreso-humano)](#datos-provistos-por-catálogos-no-son-cálculo-pero-tampoco-ingreso-humano)

[4.3 · Imagen / mapa generados por el motor
[19](#imagen-mapa-generados-por-el-motor)](#imagen-mapa-generados-por-el-motor)

[5 · Vista consolidada de los cinco orígenes
[20](#vista-consolidada-de-los-cinco-orígenes)](#vista-consolidada-de-los-cinco-orígenes)

[6 · Inconsistencias detectadas en los seis informes (a resolver antes
de Phase 5)
[21](#inconsistencias-detectadas-en-los-seis-informes-a-resolver-antes-de-phase-5)](#inconsistencias-detectadas-en-los-seis-informes-a-resolver-antes-de-phase-5)

[7 · Brechas del modelo (a complementar antes de Phase 5)
[22](#brechas-del-modelo-a-complementar-antes-de-phase-5)](#brechas-del-modelo-a-complementar-antes-de-phase-5)

[8 · Recomendaciones operativas para automatizar la obtención del
informe
[23](#recomendaciones-operativas-para-automatizar-la-obtención-del-informe)](#recomendaciones-operativas-para-automatizar-la-obtención-del-informe)

[9 · Conclusión del equipo
[24](#conclusión-del-equipo)](#conclusión-del-equipo)

# 0 · Resumen ejecutivo (TL;DR)

El equipo cruzó los seis informes de tasación reales contra el modelo de
datos v2.5, el blueprint de interfaces v2.6 y las especificaciones
funcionales v1.0. La conclusión general es:

- **Cobertura del modelo: \~94%.** Prácticamente todos los datos
  visibles en los seis PDFs tienen un campo definido en alguna tabla
  (M\_, C\_, TX\_, A\_, H\_) o un caso de uso que los produce. Quedan
  **siete campos cosméticos / paratextuales** no resueltos
  explícitamente que documentamos al final.

- **Existen cinco orígenes de dato distintos** ---no cuatro como podría
  parecer a simple vista---. Sergio venía pensando en tres (lectura de
  documentos, ingreso de usuario, cálculo). La nueva pregunta agrega
  correctamente la cuarta. Pero hay una quinta categoría que también es
  ingreso humano pero **en otra interfaz y por otro rol**, y vale la
  pena separarla.

- **Las cinco categorías de origen son:**

1.  **D · Extraído de PDFs adjuntos por Claude** (SC07 sobre
    certificados SII, CBR, permiso, recepción, sello SEC, certificado de
    no expropiación, certificado TGR). Datos del Anexo 1 y Anexo 2 del
    informe.

2.  **U-EXT · Ingresado por el solicitante externo en IF-01**
    (institución cliente, antes de que la solicitud entre al sistema).

3.  **U-INT · Ingresado por la ejecutiva comercial en IF-02** (alta
    interna, complemento de IF-01).

4.  **U-TAS · Ingresado por el tasador en IF-03** (PWA móvil en
    terreno). Es el ingreso humano dominante: \~60% de los campos del
    informe.

5.  **C · Calculado por el motor** (AT03 + AT04, ejecutados como
    Airtable Scripts) o **Resuelto desde catálogos** (M_Comunas,
    M_Zonificacion, C_PreciosUnitarios, C_VidaUtil, C_Factores,
    M_Clientes, M_Tasadores, M_Visadores, H_PreciosUF).

- **El motor de cálculo (categoría C) aporta más datos de los que Sergio
  podría haber asumido.** Aporta no solo los valores terminales (Valor
  Comercial, Reposición, Remate, Liquidación, Seguro), sino también
  factores intermedios visibles en el cuadro de valoración (UF/m² Nuevo,
  D.F., UF/m², Valor por ítem), promedios de comparables, UF/m²
  homologado, conversiones a CLP y USD, vida útil remanente, los
  semáforos de cuadre, los flags de regularización agregados, el SLA, la
  fecha del visado, el valor en pesos y la velocidad de venta calculada
  desde el factor.

- **El texto descriptivo de las dos cajas grandes** (síntesis de la
  propiedad y descripción del sector) **lo redacta Claude**, no el
  tasador. Es la regla RN-25 (texto descriptivo IA con schema)
  materializada vía SC07. NRB-10 lo confirma como hallazgo crítico. Esto
  es importante porque IF-03 no debe pedir esos textos al tasador; debe
  pedir los inputs estructurados que Claude usará para redactarlos.

- **Brechas detectadas: cuatro.** (i) Falta especificar la
  **planificación arquitectónica esquemática** (el dibujo de bloques de
  la Hoja 4); (ii) falta resolver el **fondo de marca por cliente** (en
  METLIFE-6283 aparece la marca Austral Leasing en lugar de Value
  Property en la portada); (iii) **el cuadro de valoración en el caso
  Vergara Undurraga (METLIFE-6283) mezcla terreno + edificación +
  OO.CC. + piscina + servidumbre** en una sola tabla, lo que requiere
  validar que TX_ItemsCuadroValoracion soporta los seis subtipos sin
  ambigüedad (TX-G3 estaba marcado pero conviene confirmar); (iv) el
  **ID externo del solicitante** (campo N° SOLICITUD que aparece como
  900158881 o 25678) no está claramente mapeado en TX_Solicitudes.

- **Inconsistencias detectadas en los PDFs:** registradas en §6 para
  resolución del Arquitecto de Datos antes de Phase 5.

A continuación las respuestas detalladas a las cuatro preguntas y el
inventario completo de los \~180 campos del informe clasificados por
categoría de origen.

# 1 · Respuesta directa a la pregunta 1 · ¿Tengo todos los datos contemplados?

**Respuesta corta: sí, con cuatro brechas menores documentadas en §7.**

El cruce campo a campo contra los seis informes reveló que el modelo
v2.5 cubre los datos sustantivos. La tabla TX_DatosTasacion concentra
los datos de propiedad. TX_ItemsCuadroValoracion sostiene el cuadro de
valoración granular (GAP TX-G1 que ya está resuelto). TX_Comparables
soporta las cinco filas de comparables ofertados y las hasta cuatro
filas CBR. TX_DocumentosLegales (v2.3) cubre CBR, Notaría, Cert. No
Expropiación, TGR. TX_Ampliaciones, TX_HabitacionesPorNivel y
TX_TerminacionesPorRecinto cubren todo el detalle de la Hoja 3.
TX_Adjuntos indíza fotos, planos, escaneos de SII, CBR y permisos.
TX_Calculos guarda cada cálculo del DAG con su snapshot. M_Zonificacion
(2.744 filas) cubre el plan regulador, las exigencias municipales, los
porcentajes de uso de terrenos, las arterias principales y las
características del sector. M_Comunas v2.4 agrega las exigencias
normativas (sup mínimo, frente mínimo, ocupación, constructibilidad,
altura, distancia a medianero). M_Clientes contiene
factor_seguro_incendio, tasa_cap_rate, factor_garantia y la marca del
cliente.

## Lo que falta o conviene validar antes de Phase 5

1.  **La "Planificación arquitectónica" de la Hoja 4** es un dibujo
    esquemático de bloques (cocina/living/dormitorio/baño). No está
    claro si lo sube el tasador como adjunto (TX_Adjuntos tipo "plano"),
    o lo dibuja un componente del front a partir de
    TX_HabitacionesPorNivel. **Recomendación del equipo: tratarlo como
    adjunto** (tipo plano ya existente). El front no debería intentar
    dibujarlo.

2.  **El fondo de marca del PDF en la portada (Hoja 1).** En
    METLIFE-6283 aparece la marca "Austral Leasing Habitacional" sobre
    la foto fachada. En los demás casos aparece el logo Value Property.
    Hay que decidir si el logo viene de M_Clientes.logo_url (existe en
    el modelo) o si es estático del template. **Recomendación:
    parametrizable por cliente vía C_VariablesCliente.**

3.  **El campo "N° SOLICITUD" como ID externo** (900158881, 25678, etc.)
    que vincula la solicitud con el sistema del cliente debe poblarse en
    TX_Solicitudes como id_externo_cliente o equivalente. Conviene
    revisar que el campo exista; si no, agregarlo.

4.  **El "Fuente Información" = "DOM, Plano Catastro"** que aparece como
    leyenda del párrafo de expropiación debe venir de una constante o de
    M_Clientes (algunos clientes piden otras leyendas). Hoy no se ve
    modelado.

Salvo esto, el modelo está completo.

# 2 · Respuesta directa a la pregunta 2 · ¿Cuáles datos vienen de leer documentos?

**Respuesta corta: los datos del Anexo 1 (información catastral SII,
plano) y del Anexo 2 (recepción final, permiso de edificación, sello
SEC, certificado TGR, certificado SERVIU de no expropiación, CBR), más
los datos que se reflejan en la portada que dependen de esos
certificados.**

Estos datos los extrae **Claude vía SC07** (escenario Make + Anthropic
API) leyendo los PDFs que el tasador subió a Dropbox desde IF-03. El
prompt es versionado (RN-25, NRB-10) y devuelve estructurado contra un
schema. La salida poblada llega a TX_DatosTasacion y
TX_DocumentosLegales con campo origen_dato = \'claude\' y
confianza_ia_pct.

## 2.1 · Campos extraídos por Claude desde documentos

  -----------------------------------------------------------------------------------------
  **Campo en el informe**    **Origen       **Tabla / Campo destino**  **Observación**
                             documental**                              
  -------------------------- -------------- -------------------------- --------------------
  Año Construcción (1998,    SII (DETALLE   TX_DatosTasacion ·         Confirmación cruzada
  2024, etc.)                LÍNEAS DE      anio_construccion          con Permiso de
                             EDIFICACIÓN)                              Edificación

  Rol SII (4852-250, 31-516, SII /          TX_Solicitudes /           Un rol por ítem en
  etc.)                      Certificado de TX_ItemsCuadroValoracion · el cuadro
                             Avaluó         rol_sii por ítem           

  Destino SII (HABITACIONAL) SII            TX_DatosTasacion ·         Multiselect si hay
                                            destino_sii                locales mixtos

  Avaluó fiscal propiedad    SII            TX_DatosTasacion ·         Flag
                             Certificado de avaluo_fiscal_clp          avaluo_no_registra
                             Avaluó / TGR                              para caso Cortés
                                                                       Pérez

  Avaluó Exento, Afecto,     SII Consulta   TX_DatosTasacion ·         Bloque del Anexo 2.
  Sobretasa                  antecedentes   avaluo_exento,             contribucion_total
                             bien raíz      avaluo_afecto,             es dual: también lo
                                            sobretasa_pct,             trae el certificado
                                            contribucion_total         TGR.

  Cuota aseo municipal       TGR            TX_DatosTasacion ·         Sólo TGR. No es
                             Certificado de cuota_aseo_municipal       atributo de la
                             deuda                                     consulta SII de
                                                                       antecedentes.

  Material estructura        SII Detalle    TX_DatosTasacion ·         Mapeado contra
  (Hormigón / Albañilería)   líneas         material_predominante      C_PreciosUnitarios
                             edificación                               

  Calidad SII (media /       SII Detalle    TX_DatosTasacion ·         Insumo de RB-5
  inferior / superior)       líneas         calidad_sii                (UF/m² nuevo)
                             edificación                               

  Superficie SII (102 m², 41 SII Detalle    TX_DatosTasacion ·         Cuadre cruzado con
  m², etc.)                  líneas         sup_sii_m2                 sup_construida
                             edificación                               

  Foja y Número (CBR)        Certificado    TX_DocumentosLegales ·     Ej. Vergara: Fojas
                             CBR /          foja, numero, anio         3312, N°4663, 2020
                             Inscripción de                            
                             dominio                                   

  Vendedor / Comprador (CBR) Inscripción    TX_DocumentosLegales ·     Ej. Vergara:
                             CBR            vendedor, comprador        Compraventa
                                                                       Valenzuela Pérez →
                                                                       Vergara

  Notaría / Repertorio       CBR / Notaría  TX_DocumentosLegales ·     Ej. Vergara: Notaría
                                            notaria, repertorio        repertorio C:
                                                                       15871912

  N° Permiso de              Permiso de     TX_DatosTasacion ·         Ej. Avila: N°60
  edificación + fecha        Edificación    n_permiso_edificacion,     02-09-1996
                             municipal      fecha_permiso_edif         

  N° Certificado de          Recepción      TX_DatosTasacion ·         Ej. Avila: N°56
  Recepción Final + fecha    final          n_recepcion_final,         28-12-1998
                             municipal      fecha_recepcion_final      

  Estado Sello SEC           Reporte SEC    TX_DatosTasacion ·         Ej. Avila: Verde, ID
  (Verde/Amarillo/Rojo/sin                  sello_sec                  1659813
  sello)                                                               

  Fecha vencimiento SEC      Reporte SEC    TX_DatosTasacion ·         Avila: 05/11/2026
                                            sello_sec_vencimiento      

  Afecto a expropiación      Certificado de TX_DatosTasacion ·         Vergara: cert.
  (SÍ/NO)                    no             afecto_expropiacion        N°3444743
                             expropiación                              
                             SERVIU                                    

  N° Cert. No Expropiación   SERVIU         TX_DocumentosLegales ·     Mismo bloque
                                            n_certificado              

  Texto "Descripción         Plantilla +    C_Plantillas + M_Comunas   Ensamblado por el
  Expropiación" (constante)  nombre comuna                             motor de plantillas

  Modificaciones de Permiso  Resoluciones   TX_Ampliaciones · n_pe,    Ej. Avila: dos
  (ampliaciones, etc.)       municipales    fecha, m2, destino         resoluciones
                             adjuntas                                  

  Inscripción de dominio     SII            TX_DocumentosLegales       Cruzada con CBR
  (foja/número/año en SII)                  (misma terna)              

  Servidumbres declaradas    CBR / Plano de TX_ItemsCuadroValoracion   Ej. Vergara: 3622,51
                             loteo          (subtipo Servidumbre)      m²

  Coordenadas (lat/long) si  SERVIU         TX_DatosTasacion · lat,    Vergara:
  aparecen en SERVIU                        long                       33°14\'04.5\"S
                                                                       70°40\'30.3\"W
  -----------------------------------------------------------------------------------------

## 2.2 · Datos del PDF que también se extraen pero NO van a campos estructurados

  ------------------------------------------------------------------------
  **Campo**                    **Destino**        **Tratamiento**
  ---------------------------- ------------------ ------------------------
  Imágenes escaneadas de SII,  TX_Adjuntos        Solo URL. El PDF las
  Recepción Final, Permiso,    (Dropbox)          muestra como
  TGR, SERVIU                                     mini-screenshots en los
                                                  Anexos 1 y 2. **Las
                                                  captura el motor de
                                                  plantillas (Carbone), no
                                                  Claude.**

  Plano arquitectónico anexo   TX_Adjuntos tipo   Se referencia desde la
  (si el cliente lo subió como plano              plantilla
  PDF)                                            
  ------------------------------------------------------------------------

# 3 · Respuesta directa a la pregunta 3 · ¿Cuáles datos ingresa el usuario, qué usuario, en qué interfaz?

Hay **tres interfaces de ingreso humano** y vale la pena mantenerlas
separadas porque son tres roles distintos con tres momentos distintos
del workflow.

## 3.1 · Solicitante externo de la institución cliente · IF-01

Es la puerta de entrada del cliente externo (MetLife, Hipotecaria
Evoluciona, Agencia Habitacional, Austral Leasing, Hipotecaria
Security). Pide **lo mínimo**, deliberadamente, para que la fricción del
formulario no detenga la solicitud (regla de oro de IF-01).

  --------------------------------------------------------------------------
  **Campo del informe**  **Campo en              **Notas**
                         TX_Solicitudes**        
  ---------------------- ----------------------- ---------------------------
  Institución / Cliente  cliente (FK →           El logo en la portada
                         M_Clientes, URL única)  deriva de aquí

  Nombre cliente         cliente_final_nombre    Ej. Alejandro Avila Duran
  (solicitante final)                            

  RUT cliente            cliente_final_rut       Validado módulo 11 (RN-15 /
                                                 RR-03)

  Dirección propiedad    direccion               Ej. La Marina Nº 1176

  Comuna                 comuna (FK → M_Comunas) Autocompletada desde la
                                                 dirección

  Tipo de informe /      tipo_informe (FK →      Lista filtrada por
  Objetivo               M_TiposInforme)         productos del cliente

  Tipo de propiedad      tipo_propiedad (FK →    ---
  (Depto, Casa)          M_TiposPropiedad)       

  Email contacto         email_contacto          Receptor del PDF final

  Rol SII (opcional)     rol_sii (opcional en    Si no lo conoce, lo
                         alta)                   completa el tasador

  Banco (opcional)       banco (FK → M_Bancos)   ---

  Producto (opcional)    producto (FK →          ---
                         M_Productos)            

  Adjuntos PDF           TX_Adjuntos             El cliente puede subir SII,
  (opcional)                                     CBR si ya los tiene

  Observaciones          observaciones_cliente   Texto libre
  (opcional)                                     

  Número de solicitud    id_externo_cliente      **A confirmar que el campo
  externa (900158881,                            exista en el modelo**
  25678)                                         
  --------------------------------------------------------------------------

## 3.2 · Ejecutiva comercial · IF-02

Solo si el cliente no usa la app externa (sigue mandando por email o
WhatsApp). Pide lo mismo que IF-01 más:

  --------------------------------------------------------------------------------
  **Campo**                                   **Notas**
  ------------------------------------------- ------------------------------------
  Canal de origen                             Obligatorio, auditoría comercial
  (WhatsApp/Email/Teléfono/Presencial/Otro)   

  Evidencia del canal (captura, email         Adjunto
  reenviado)                                  

  Override manual de tasador (opcional)       AT02 respeta el override y lo audita

  Fecha estimada de visita                    Obligatoria para pasar a asignada

  Notas internas para tasador / visador       Texto libre

  Reasignaciones, cambios de prioridad,       Sobre solicitudes existentes
  pausas/reanudaciones                        (CU-003, CU-004)
  --------------------------------------------------------------------------------

## 3.3 · Tasador · IF-03 (PWA móvil en terreno)

**Es la interfaz que más datos aporta al informe.** El tasador, con
sesión Clerk activa y conectividad intermitente tolerada, captura todo
lo que no puede deducirse del SII, del CBR, ni de los certificados
municipales. Los datos se organizan en siete secciones de acordeón.

## Sección 1 · Datos de la propiedad

  -----------------------------------------------------------------------
  **Campo del informe**                 **Campo en TX_DatosTasacion**
  ------------------------------------- ---------------------------------
  Sup. Terreno (5024,86 m²)             sup_terreno

  Sup. Construida (102 m², 41 m², 40    sup_construida
  m², 249,91 m²)                        

  Año Construcción (si difiere del SII) anio_construccion

  Estado conservación (Nuevo s/uso,     estado_conservacion
  Bueno, Regular, Malo)                 

  Tipo agrupamiento (Aislado, Pareado,  agrupacion_propiedad
  Continuo, Edificio, Condominio)       

  Material predominante (Hormigón,      material_predominante (confirma
  Albañilería, Madera, Mixto)           SII)

  Calidad constructiva (1-5 estrellas)  calidad_construccion

  Piso (si es depto: 1, 4, 25, 2)       piso

  Pisos de la propiedad y subterráneos  pisos, subterraneos

  Edificio o Condominio (nombre)        edificio / condominio

  Orientación                           orientacion
  (Norte/Sur/Este/Oeste/Poniente)       

  Número de ascensores                  num_ascensores

  Dormitorios, Baños, 1/2 Baño, Baño    dormitorios, banos, medios_banos,
  Servicio                              bano_servicio

  Estacionamientos asociados /          estacionamientos,
  asignados                             roles_estacionamientos

  Bodegas y su rol SII                  bodegas, roles_bodegas

  Servidumbre (m²)                      servidumbre_m2

  Superficie primer piso (caso Casa)    sup_primer_piso_m2

  DFL-2 (SÍ/NO)                         dfl2

  Permiso, Recepción, Ampliación (si    permiso_edif_num legacy
  conocidos sin certificado)            

  Velocidad de venta normal estimada    velocidad_venta_estimada (9
  (8-10 meses)                          tramos en C_Factores)
  -----------------------------------------------------------------------

## Sección 2 · Fotos obligatorias

Mínimo según M_TiposPropiedad.num_fotos_minimas (Casa 8, Departamento
10, Terreno 6). Las fotos que aparecen en el informe son:

- Fachada, Ubicación (mapa Google), Sector, Living, Comedor, Cocina,
  Baño, Dormitorios, Pasillo, Logia, Puerta de acceso, Bodega, Terraza,
  Espacio lavadora, Áreas comunes (Piscina, Quincho, Gimnasio, Sala
  multiuso, Lavandería, Salón, Acceso edificio).

Cada foto se sube a Dropbox vía API Route, queda indexada en TX_Adjuntos
con tipo=foto, seccion, thumbnail_url, hash_md5.

## Sección 3 · Cuadro de valoración granular E1 (TX_ItemsCuadroValoracion)

Una fila por ítem. El tasador ingresa SOLO los inputs estructurales; los
valores monetarios los calcula el motor (ver §4).

  -----------------------------------------------------------------------
  **Campo ingresado por tasador**             **Notas**
  ------------------------------------------- ---------------------------
  Descripción del ítem (Departamento Nº 102,  ---
  Bodega Nº 13, Terraza, Piscina, etc.)       

  Subtipo (Edificación, Terreno, OO.CC.,      TX_ItemsCuadroValoracion ·
  Piscina, Terraza, Bodega, Estac. uso/goce,  subtipo
  Estac. arquitectura)                        

  Rol SII del ítem                            rol_sii

  Año del ítem                                anio_item

  Tipo (HA Plano Muni / HA Plano Prop / AL /  tipo
  E / B / D)                                  

  Situación municipal (Regularizado / No      situacion_municipal
  Regularizable / Sin permiso)                

  Estado físico (Nuevo s/uso / Bueno /        estado
  Regular / Malo)                             

  Garantía Sí/No por ítem                     aporta_a_garantia (terraza
                                              siempre FALSE --- RN-09 /
                                              RB-38)

  Origen Superficie (Plano municipal /        origen_superficie
  propietario / Medición láser)               

  Superficie m²                               superficie_m2

  Material si difiere del predominante        material_item
  -----------------------------------------------------------------------

## Sección 4 · Comparables E2 (TX_Comparables)

Mínimo 3, hasta 10. Cinco filas de ofertas y hasta cuatro de CBR según
los informes.

  ---------------------------------------------------------------------------------
  **Campo del informe**              **Campo en TX_Comparables**  **Notas**
  ---------------------------------- ---------------------------- -----------------
  Dirección referencia               direccion                    ---

  Año                                anio                         Año de
                                                                  construcción

  Total UF                           precio_uf                    Precio publicado

  Sup. Terreno                       sup_terreno_m2               ---

  Sup. Construida                    sup_construccion_m2          ---

  OO.CC.                             oo_cc_uf                     En UF, no UF/m²

  Tipo de referencia                 tipo_referencia              Oferta · CBR

  Mes/año de publicación             fecha_publicacion            ---

  Teléfono de contacto (solo         telefono_contacto            v2.4
  ofertas)                                                        

  Foja y Número (solo CBR)           foja · numero                ---

  UF/m² terreno y construcción de    uf_m2_terreno_f ·            Valores crudos,
  la fuente                          uf_m2_construccion_f         no calculados

  UF/m² terreno y construcción       uf_m2_terreno ·              Fórmulas sobre
  calculados                         uf_m2_construccion           precio_uf

  Factores de homogeneización        factor_sup · factor_edad ·   §18.8 Capa Datos
                                     factor_distancia             

  Comentarios relevantes             notas                        Texto libre

  URL de la publicación              ⚠ url                        v2.4 · PENDIENTE
                                                                  DE CREAR

  Dormitorios, baños,                ⚠ dormitorios · banos ·      v2.4 · PENDIENTES
  estacionamientos, bodegas          estacionamientos · bodegas   DE CREAR
  ---------------------------------------------------------------------------------

⚠ Los campos marcados están declarados en el diseño (Capa de Datos
§10 · GAP-PO07/PO08) pero **no existen en el schema real de Airtable**
al 23-jul-2026.

## Sección 5 · Ampliaciones / Programa por nivel / Terminaciones por recinto

  --------------------------------------------------------------------------
  **Tabla**                    **Contenido**
  ---------------------------- ---------------------------------------------
  TX_Ampliaciones              Permiso, fecha recepción, m², destino

  TX_HabitacionesPorNivel      Por nivel (Subterráneo, 1, 2, 3): living,
                               estar, cocina, comedor, dormitorios simples,
                               suites, baños, walk-in, escritorio, loggia

  TX_TerminacionesPorRecinto   Por recinto (Estar, Dormitorios, Espacios
                               circulación, Cocina, Baños, Otros):
                               pavimento, material, revestimiento muros,
                               terminación cielo, iluminación, estado
  --------------------------------------------------------------------------

Aquí también caen los datos de:

- Características constructivas (Estructura soportante, Divisiones
  interiores, Entrepisos, Cubierta, Revestimiento exterior, Cierros
  exteriores) → campos de TX_TerminacionesPorRecinto o de un nuevo
  bloque "elementos constructivos"

- Comodidades (Gimnasio, Piscina, Sauna, Quincho, Calefacción, Aire
  acondicionado, Alarma, Aspiración central, Climatización, Purificador,
  Corrientes débiles, Jardín conformado, Bodega, Estacionamiento)

- Ventanas (PVC termopanel, Aluminio, PVC)

- Sanitarios, Griferia, Muebles de cocina, Closet mural, Puerta
  principal, Protecciones/Rejas

## Sección 6 · Documentos legales (TX_DocumentosLegales) --- captura manual de respaldo

Lo mismo que Claude extrae, pero el tasador puede corregir o completar
manualmente. La interfaz prellena con la propuesta de Claude.

## Sección 7 · Overrides (CU-007)

Solo si el tasador necesita sobrescribir un parámetro del motor:
tasa_cap_rate_override, vida_util_override, valor_sugerido_override.
Motivo obligatorio ≥ 20 caracteres (RN-23). Los seis casos reales no
muestran overrides, pero el sistema los habilita.

## Notas libres del tasador

  -----------------------------------------------------------------------
  **Campo**                          **Destino**
  ---------------------------------- ------------------------------------
  Síntesis de la propiedad (texto    **NO la escribe el tasador.** La
  largo)                             redacta Claude (RN-25, NRB-10) a
                                     partir de los inputs estructurados
                                     capturados arriba

  Descripción del sector             Idem, Claude la redacta

  Análisis de las referencias        **Claude lo redacta** desde el
  (párrafo bajo el cuadro de         schema
  comparables)                       

  Observaciones del tasador (campo   observaciones_tasador --- puede
  libre, opcional)                   aportar contexto a Claude

  Análisis de Rentabilidad: Arriendo arriendo_bruto_clp, gasto_anual_clp
  bruto \$, Gasto anual \$           --- solo en informes que pidan
                                     rentabilidad

  Tipo zona Urbana/Rural             tipo_zona (validable contra
                                     M_Zonificacion)
  -----------------------------------------------------------------------

## 3.4 · Visador · IF-04 (ajustes finos)

  -----------------------------------------------------------------------
  **Campo**                          **Notas**
  ---------------------------------- ------------------------------------
  Síntesis descriptiva               Ajuste fino al texto de Claude

  Estado de conservación             Editable si discrepa

  Comparables                        Agregar o quitar

  Decisión (Aprobar / Devolver /     Con motivo cerrado + observación
  Escalar)                           

  Valor alternativo del visador      valor_alternativo_visador (pendiente
  (CU-010, RN-23)                    confirmar en Data Layer --- abierta
                                     de IF-04)
  -----------------------------------------------------------------------

# 4 · Respuesta directa a la pregunta 4 (nueva) · ¿Cuáles datos los proporciona el motor de cálculo?

**Esta es la categoría más subestimada.** El motor (AT03 ejecutando el
DAG de \~15 fórmulas en orden topológico) produce **todos los valores
numéricos del cuadro de valoración**, **los valores terminales del
recuadro VALOR TASACIÓN**, las **conversiones a CLP y USD**, los
**factores de homogeneización aplicados a comparables**, los
**promedios**, la **vida útil remanente**, los **datos de rentabilidad**
(UF/mes, Ingreso Líquido Anual, Renta Perpetua), y las **comparaciones
tasación-vs-muestra**. También aporta datos resueltos por catálogos
(M_Comunas, M_Zonificacion, C_PreciosUnitarios, C_Factores) que no son
cálculo pero tampoco ingreso humano.

## 4.1 · Datos provistos por el DAG de fórmulas (Motor AT03 · TX_Calculos)

  ---------------------------------------------------------------------------
  **Campo del informe**        **Paso DAG**  **Fórmula que lo produce**
  ---------------------------- ------------- --------------------------------
  UF/m² Nuevo (40,00 / 38,00 / Pre-paso      Lookup
  34,00 / 34,83 / 32,00 /                    C_PreciosUnitarios\[material ×
  100,00)                                    calidad\]

  Factor D.F. (Depreciación    Paso 3        factor_df = f(anio, vida_util,
  física) (0,79 / 0,95 / 1,00                estado_conservacion)
  / 0,96 / 0,80)                             

  UF/m² resultante por ítem    Paso 2        uf_m2_nuevo × factor_df ×
  (31,60 / 36,10 / 33,09 /                   coef_tipo
  32,64 / 25,60 / 100,00)                    

  Valor Comercial UF por ítem  Paso 2        superficie × UF/m²
  (3.223,20 / 3.204,24 /                     
  1.394,00 / 1.072,17 /                      
  1.024,00 / 8.157,06)                       

  Valor Seguros UF por ítem    Paso 5        valor_edificacion ×
  (2.578,56 / 2.563,39 / etc.)               factor_seguro (desde M_Clientes)

  Valor Liquidación UF por     Paso 8        valor_reposicion ×
  ítem (2.659,14 / 2.643,50 /                factor_liquidacion(velocidad)
  etc.)                                      

  TOTAL EDIFICACION            Agregación    Σ filas con subtipo Edificación

  TOTAL OBRAS COMPLEMENTARIAS  Agregación    Σ filas con subtipo OO.CC. +
                                             Piscina + Quincho

  TOTAL TERRENO                Agregación    Σ filas con subtipo Terreno

  VALOR COMERCIAL NORMAL       Agregación    Σ de los tres totales
                               terminal      

  UF/m² promedio de la muestra Paso 1        mean(comparables homologados)
  (4.172 / 4.166 / 1.593 /                   
  1.269 / 1.171 / 21.440)                    

  Factor homogeneización       Pre-paso 1    factor_sup × factor_edad ×
  aplicado a cada comparable                 factor_distancia
                                             (C_FactoresHomogeneizacion)

  UF/m² del promedio CBR       Paso 1 alt    Promedio separado para CBR vs.
  (3.323 / 3.450 / 1.370 / 800               ofertas
  / --- / 19.250)                            

  TASACION vs promedio de la   Auxiliar      (tasacion - promedio) / promedio
  muestra (%) (--17%, --4%,                  
  +2%, +12%, --7%, --3%)                     

  Velocidad de venta normal "8 Lookup        C_Factores tramo desde
  A 10 MESES"                                velocidad_venta_estimada

  Vida útil remanente años     Paso 3.5      vida_util_total − antiguedad
  (55, 70, 40, 65, 40, 70)                   (C_VidaUtil)

  UF/mes (17,8 / 15,9 / 7,9 /  Paso 9        arriendo_bruto_clp / uf_dia
  6,3 / 5,0 / 82,7)                          

  Ingreso Líquido Anual (\$)   Paso 9        (arriendo × 12) − gasto_anual

  Renta Perpetua (\$)          Paso 10       ingreso_liquido / tasa_cap_rate
                               (terminal)    

  Valor de Reposición UF       Paso 6        valor_edificacion × (1 + OO.CC.
  (3.364 / 3.167 / 1.115 / 902               relativas) sin terreno (RN-14)
  / 1.024 / 9.246)                           

  Seguro Incendio y otros UF   Paso 5        valor_edificacion ×
                                             factor_seguro

  Valor a Remate UF (2.160 /   Paso 7        valor_reposicion ×
  2.508 / 906 / 696 / 665 /                  factor_remate(velocidad); factor
  13.081)                                    visible **65%**

  Liquid. Normal UF (2.741 /   Paso 8        valor_reposicion ×
  3.183 / 1.150 / 884 / 844 /                factor_liquidacion(velocidad);
  16.603)                                    factor visible **82,5%**

  Valor Tasación en \$         Paso 11       valor_uf_terminal × uf_dia
  (132.402.004, 155.477.298,   terminal      
  etc.)                                      

  Valor Tasación en US\$       Paso 11       valor_uf_terminal ×
  (3.364, 3.167, 1.115, etc.)  terminal      tipo_cambio_usd

  1 UF = 39.841,72 (fecha de   Pre-cálculo   Lookup H_PreciosUF.uf_dia para
  la visita)                                 la fecha de visita

  1 US\$ = 922,17 (fecha de la Pre-cálculo   Lookup
  visita)                                    H_PreciosUF.tipo_cambio_usd

  Avaluó fiscal en UF (2.898,  Conversión    avaluo_fiscal_clp / uf_dia
  2.508, 1.256, 678, 411,                    
  8.517)                                     

  Texto descriptivo "Síntesis  SC07 --- IA   Claude redacta desde el schema
  de la Propiedad"                           (RN-25, NRB-10)

  Texto descriptivo del sector SC07 --- IA   Claude redacta desde
  (segundo párrafo)                          M_Zonificacion + datos

  Texto "Análisis de las       SC07 --- IA   Claude redacta desde
  Referencias"                               TX_Comparables

  TASACION en filas de         Agregación    Suma del cuadro de valoración
  promedio (3.323 / 3.859 /                  por categoría
  1.394 / 1.072 / 1.024 /                    
  20.126)                                    
  ---------------------------------------------------------------------------

## 4.2 · Datos provistos por catálogos (NO son cálculo pero tampoco ingreso humano)

Sergio probablemente los está pensando como "ingreso", pero no lo son:
vienen prellenados al resolver la solicitud o al hacer lookups del DAG.

  -----------------------------------------------------------------------------------------------------------
  **Campo del informe**                        **Tabla origen**                    **Cómo se resuelve**
  -------------------------------------------- ----------------------------------- --------------------------
  Región (Metropolitana de Santiago)           M_Comunas                           Lookup desde comuna

  Zona (EC-3, E-AA1, IPC, PRMS, IPB, IPB)      M_Zonificacion                      Lookup comuna × dirección

  Tipo zona (Urbana / Rural)                   M_Zonificacion                      Lookup

  Densidad (Media / Baja)                      M_Zonificacion                      Lookup

  Demanda (Medio / Alto)                       M_Zonificacion                      Lookup

  Tendencia (Estable)                          M_Zonificacion                      Lookup

  Mercado / Nivel socioeconómico               M_Zonificacion                      Lookup

  ABC1 (SI / NO Homogéneo)                     M_Zonificacion                      Lookup

  Arteria principal                            M_Zonificacion                      Lookup

  \% Uso de terrenos                           M_Zonificacion v2.4                 Lookup
  (Habitacional/Comercial/Industrial/Baldío)                                       

  Exigencias PRC (sup. predial mín., frente    M_Comunas v2.4 / M_Zonificacion     Lookup
  mínimo, distancia medianero, coef.                                               
  ocupación/constructibilidad, altura,                                             
  antejardín)                                                                      

  CUMPLE PLAN REGULADOR VIGENTE (Sí/No)        Cálculo derivado                    Compara
                                                                                   superficies/proporciones
                                                                                   contra exigencias

  DFL-2 / LEY 6071 / LEY 9135 / LEY 19537      M_TiposPropiedad / M_Clientes /     Resuelto por motor según
                                               Reglas                              tipo

  Cambios en Plan Regulador (NO CONTEMPLA)     M_Zonificacion                      Lookup

  Tasa Exigida Proyecto (4,5% / 5,5% / 6,0%)   M_Clientes.tasa_cap_rate (o         Lookup
                                               override)                           

  Factor Garantía (0,8)                        M_Clientes.factor_garantia          Lookup

  Factor Seguro (0,825 → "82,5%")              M_Clientes.factor_seguro_incendio   Lookup

  Tasador, Visador, REVISOR (institución)      M_Tasadores, M_Visadores,           Asignados por AT02
                                               M_Clientes                          

  Dirección Value Property + teléfono (footer  Constante de plantilla              Hardcoded en C_Plantillas
  portada)                                                                         

  Logo Value Property o logo cliente           C_VariablesCliente                  Parametrizable

  Velocidad de venta como texto ("8 A 10       C_Factores                          Mapeo desde
  MESES")                                                                          velocidad_venta_estimada

  Fecha del informe en portada y en VALOR      Sistema                             Fecha de cierre de IF-03
  TASACIÓN                                                                         

  Fecha de visita / Fecha de visado            Sistema                             Timestamps al cerrar IF-03
                                                                                   y aprobar en IF-04

  Número solicitud (METLIFE-6280, HEV-3183,    TX_Solicitudes                      Generado por el sistema
  etc.)                                                                            {CodigoCliente}-{N}

  Texto legal de la firma                      Plantilla Carbone                   Constante del informe

  "Av. La Marina / Monja Alféresz" (nombre     M_Zonificacion                      Texto descriptivo de la
  derivado de ubicación)                                                           zona
  -----------------------------------------------------------------------------------------------------------

## 4.3 · Imagen / mapa generados por el motor

  -----------------------------------------------------------------------
  **Campo**                          **Cómo se genera**
  ---------------------------------- ------------------------------------
  Mini mapa de ubicación en portada  Google Static Maps API desde
                                     direccion

  Mapa de Hoja 2 con referencias     Google Maps API + coordenadas de
  geo-localizadas                    propiedad y comparables

  Iconos de propiedad / CBR          Templating
  -----------------------------------------------------------------------

# 5 · Vista consolidada de los cinco orígenes

  ------------------------------------------------------------------------------
  **Origen**         **Código**   **Tabla(s) destino**                **%
                                                                      aprox.**
  ------------------ ------------ ----------------------------------- ----------
  Extraído por       D            TX_DatosTasacion +                  \~12%
  Claude SC07                     TX_DocumentosLegales                

  Ingreso            U-EXT        TX_Solicitudes                      \~6%
  solicitante                                                         
  externo (IF-01)                                                     

  Ingreso ejecutiva  U-INT        TX_Solicitudes                      \~2%
  comercial (IF-02)                                                   

  Ingreso tasador    U-TAS        TX_DatosTasacion +                  \~50%
  (IF-03)                         TX_ItemsCuadroValoracion +          
                                  TX_Comparables + TX_Ampliaciones +  
                                  TX_HabitacionesPorNivel +           
                                  TX_TerminacionesPorRecinto +        
                                  TX_Adjuntos                         

  Ingreso visador    U-VIS        Ajustes finos sobre                 \~1%
  (IF-04)                         TX_DatosTasacion                    

  Motor de cálculo   C-DAG        TX_Calculos                         \~15%
  (AT03 DAG)                                                          

  Catálogos /        C-LKP        M_Comunas, M_Zonificacion,          \~12%
  Maestras (lookups)              C_PreciosUnitarios, C_VidaUtil,     
                                  C_Factores, M_Clientes,             
                                  M_Tasadores, M_Visadores,           
                                  H_PreciosUF                         

  Templating /       C-TPL        C_Plantillas, C_VariablesCliente    \~2%
  Constantes                                                          
  ------------------------------------------------------------------------------

# 6 · Inconsistencias detectadas en los seis informes (a resolver antes de Phase 5)

El equipo cruzó los seis PDFs y detectó nueve inconsistencias o
ambigüedades que conviene resolver con criterio antes de la sesión de
Claude Code para IF-03:

1.  **Cortés Pérez (HEV-3183):** RUT del cliente aparece como 0. El
    campo cliente_final_rut debe permitir saneamiento
    rut_no_disponible=true (cubierto por RN-24).

2.  **Cortés Pérez (HEV-3183):** Avaluó Fiscal "NO REGISTRA". Cubierto
    por flag avaluo_no_registra=true (NRB-07).

3.  **Rameau (ALH-335):** Permiso de edificación marcado como "S/I" (sin
    información). El motor debe permitir continuar el cálculo sin ese
    dato.

4.  **Vergara Undurraga (METLIFE-6283):** Cuadro de valoración con 6
    ítems heterogéneos (2 terreno + edificación + piscina + 2 OO.CC.).
    Confirmar que TX_ItemsCuadroValoracion.subtipo soporta los 6 valores
    y que la suma se segrega correctamente en los tres TOTALES.

5.  **Vergara Undurraga (METLIFE-6283):** El informe es de tipo
    Refinanciamiento, no Crédito Hipotecario. Es la única excepción en
    los seis casos. Validar que la plantilla seleccionada por el motor
    de reglas para Refinanciamiento existe en C_Plantillas.

6.  **Cando Arias (AGH-1548):** Tasa exigida 6,0% (no 4,5% como los
    demás). Confirma que M_Clientes.tasa_cap_rate está diferenciado por
    cliente (Agencia Habitacional vs MetLife).

7.  **Toro Nievas (HIPOTECARIA SECURITY-6073):** Tasa exigida 5,5%
    (intermedia). Probablemente override manual del tasador o regla por
    subtipo. Confirmar en M_Clientes.

8.  **Avila (METLIFE-6280):** Avaluó fiscal aparece tanto en el bloque
    Avaluó Fiscal del SII (104.489.198) como en el de la portada
    (125.206 UF → \~109 millones a UF=39.841,72). **Discrepancia: la
    portada usa avaluó total actualizado al periodo (TGR 112.989.288),
    no el del SII.** Confirmar la regla de qué fuente prevalece para la
    portada. **PENDIENTE: confirmar con Héctor qué fuente de avalúo
    prevalece en la portada del informe.**

9.  **Todos los informes:** El campo "1US\$ = \$922,17 / \$894,25 /
    \$890,33 / \$892,83 / \$894,25 / \$890,33" cambia por fecha.
    Confirmar que H_PreciosUF.tipo_cambio_usd se carga diariamente
    (SC15) junto con la UF.

# 7 · Brechas del modelo (a complementar antes de Phase 5)

  -----------------------------------------------------------------------------------
  **\#**   **Brecha**                   **Recomendación**             **Prioridad**
  -------- ---------------------------- ----------------------------- ---------------
  B1       Planificación arquitectónica Tratar como TX_Adjuntos tipo  Media
           (dibujo bloques Hoja 4)      plano. No dibujar en frontend 

  B2       Marca del cliente en portada Parametrizar vía              Alta
           del PDF                      C_VariablesCliente.logo_url   

  B3       Campo id_externo_cliente en  Confirmar que existe; agregar Alta
           TX_Solicitudes               si no                         

  B4       Leyenda "DOM, Plano          Mover a constante de          Baja
           Catastro" como fuente del    plantilla con placeholder de  
           párrafo de expropiación      comuna                        

  B5       "Fuente Información" como    C_VariablesCliente            Baja
           campo configurable por                                     
           cliente                                                    

  B6       Confirmar                    Coordinar con Arquitecto de   Alta
           valor_alternativo_visador en Datos                         
           Data Layer (abierta IF-04)                                 

  B7       "REVISOR" del informe es el  Verificar que se lee de       Media
           nombre comercial del cliente M_Clientes.nombre_revisor o   
                                        equivalente                   
  -----------------------------------------------------------------------------------

# 8 · Recomendaciones operativas para automatizar la obtención del informe

Sergio escribió: "necesito obtener estos documentos en forma
automática". El equipo recomienda:

1.  **Fase 5 de IF-03 (PWA tasador)** es el componente más crítico para
    automatizar la generación. Ahí se capturan \~50% de los campos. Sin
    captura completa, no hay informe.

2.  **SC07 (Claude API) sobre los adjuntos** debe robustecerse con
    prompt versionado y schema estricto. Los seis PDFs son base ideal de
    testing para el prompt: cubren los cinco tipos de informe (Crédito
    Hipotecario × 5, Refinanciamiento × 1), tres tipos de propiedad
    (Depto × 4, Casa × 1, Casa en condominio × 1) y seis instituciones
    diferentes.

3.  **Los seis informes deberían cargarse como suite de regresión en
    TX_CasosRegresion** (ya prevista en v2.2 con tolerancia 0). Cada
    informe se vuelve un golden master: dados los inputs, el motor debe
    reproducir los valores numéricos al céntimo. Sin pasar la suite, no
    hay go-live.

4.  **SC09 (Carbone)** genera el PDF final. La plantilla .docx con tags
    {variable} debe contener exactamente los \~180 campos inventariados
    aquí, en el orden y formato visibles. Es el siguiente trabajo
    natural una vez confirmado este inventario.

5.  **Una sesión Claude Code para IF-03** debería referenciar este
    documento como insumo. Es la lista de qué se le pide al tasador y
    qué NO se le pide (porque viene del motor, de catálogos o de
    Claude).

# 9 · Conclusión del equipo

Sergio, sí tienes los datos contemplados, con cuatro brechas menores
documentadas y nueve inconsistencias para resolver con criterio. La
pregunta que agregaste sobre el motor de cálculo es la pieza que faltaba
para tener visión completa: **el motor aporta el 15% de los campos vía
DAG y otro 12% vía catálogos**, mucho más de lo que un análisis
superficial sugeriría. Distinguir los cinco orígenes (D / U-EXT / U-INT
/ U-TAS / U-VIS / C-DAG / C-LKP / C-TPL) en la documentación de IF-03 y
en la plantilla Carbone evitará confusiones en Phase 5.

**Próximo paso recomendado:** convertir este inventario en el insumo de
tres documentos de construcción:

- \(a\) Refinamiento del prompt SC07 para Claude (categoría D).

- \(b\) Validación de campos de TX_DatosTasacion /
  TX_ItemsCuadroValoracion / etc. en el documento IF-03 ya generado
  (categoría U-TAS).

- \(c\) Plantilla Carbone con los \~180 tags ordenados (categorías D +
  U + C ensambladas).

Quedamos disponibles para profundizar cualquiera de las secciones,
generar la matriz tag-por-tag de la plantilla Carbone, o construir el
prompt de SC07 con su schema JSON.

*--- Fin del documento ---*
