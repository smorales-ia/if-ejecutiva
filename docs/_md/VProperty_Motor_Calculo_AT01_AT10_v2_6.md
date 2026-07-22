**VProperty**

Motor de Cálculo Parametrizado

AT01 · AT02 · AT03 · AT04\
Flujos operacionales · Arquitectura · Automations AT08--AT10

**Sistema:** VProperty v2.5 · Airtable (Team)

**Versión:** 1.2 · Julio 2026 (aclara que AT02 no se invoca desde IF-02
en v1.9 — asignación manual, sin reasignación formal; ver §3.2)

**Clasificación:** Confidencial · Uso interno

**Generado por:** VProperty Data Engineering

**1. Arquitectura General del Sistema**

VProperty v2.5 implementa el principio Make = transportista puro: toda
la lógica de negocio migra completamente a Airtable (AT01--AT10). Make
opera únicamente como transporte hacia servicios externos (webhooks de
la app Next.js, Claude API, Carbone, Dropbox, Gmail, Mindicador).
Ninguna lógica de negocio vive en Make.

**Catálogo completo de Automations AT01--AT10**

  ----------------------------------------------------------------------------------------------------------------------------------
  **ID**   **Nombre**                       **Tipo**           **Trigger**        **Lee**                  **Escribe**
  -------- -------------------------------- ------------------ ------------------ ------------------------ -------------------------
  AT01     AT01_resolver_motor_reglas       Script             estado=creada      C_ReglasNegocio,         TX_Solicitudes,
                                                                                  M_Clientes               A_DecisionesMotor

  AT02     AT02_asignar_tasador             Script             estado=creada      M_Tasadores, M_Comunas   TX_Solicitudes, A_Eventos
                                                               (post AT01)                                 

  AT03     AT03_ejecutar_dag_formulas       Script             estado=visitada    C_Formulas,              TX_Calculos,
                                                                                  TX_DatosTasacion         TX_Solicitudes

  AT04     AT04_validar_rangos_valor        Formula+Auto       TX_Calculos insert TX_Calculos, M_Comunas   TX_Solicitudes (flag)

  AT05     AT05_notificar_visador           Automation         estado=pdf_listo   C_NotificacionesConfig   TX_Notificaciones / Make
                                                                                                           SC09→SC13

  AT06     AT06_procesar_decision_visador   Automation         decision_visador   TX_Solicitudes           TX_Solicitudes, A_Eventos
                                                               cambia                                      

  AT07     AT07_chequear_aprobacion_final   Automation         estado=aprobada    C_ReglasNegocio          TX_Solicitudes / Make
                                                                                                           SC13

  AT08     AT08_alertas_sla                 Scheduled          cron 08:00 diario  TX_Solicitudes, C_SLA    TX_Notificaciones / Make
                                                                                                           SC13

  AT09     AT09_reintentos_cola             Scheduled+Script   cron 15 min        Z_ColaPendientes         Z_ColaPendientes

  AT10     AT10_archivado_nocturno          Scheduled          cron nocturno      TX_Solicitudes           H_Solicitudes_Cerradas,
                                                                                                           A_Eventos
  ----------------------------------------------------------------------------------------------------------------------------------

**Anti-patrones explícitamente prohibidos (v2.4)**

  -----------------------------------------------------------------------
  **Anti-patrón**         **Por qué está prohibido**
  ----------------------- -----------------------------------------------
  IFs de negocio dentro   La lógica de negocio vive en Airtable como dato
  de Make                 consultable

  Fórmulas hardcodeadas   Las fórmulas viven en C_Formulas como filas
  en Make scripts         editables

  Emails hardcodeados en  Los destinatarios viven en
  automations             C_NotificacionesConfig

  Borrar filas en lugar   Los datos se conservan; los flags filtran
  de marcar activa=false  

  Datos duplicados entre  Si aparece en dos lugares, uno debe ser lookup
  tablas                  
  -----------------------------------------------------------------------

**2. Dominios de Datos y Convenciones**

**Dominios del sistema**

  -----------------------------------------------------------------------------------
  **Prefijo**   **Dominio**        **Propósito**                   **Orden de carga**
  ------------- ------------------ ------------------------------- ------------------
  M\_           Maestros           Entidades estables: clientes,   Primero (sin FK)
                                   bancos, tasadores, comunas      

  C\_           Configuración      Comportamiento del sistema:     Segundo (FK a M\_)
                                   reglas, plantillas, fórmulas    

  TX\_          Transacciones      Eventos operacionales:          Tercero (FK a M\_
                                   solicitudes, cálculos,          y C\_)
                                   documentos                      

  A\_           Auditoría          Trazabilidad append-only:       Cuarto (FK a
                                   eventos, decisiones, cambios    todos)

  H\_           Históricos         Memoria larga: versiones        Paralelo a A\_
                                   anteriores, solicitudes         
                                   cerradas                        

  Z\_           Automatizaciones   Metadatos del sistema:          Paralelo a A\_
                                   escenarios Make, schedulers     
  -----------------------------------------------------------------------------------

**Claves de campos**

  -----------------------------------------------------------------------
  **Clave**      **Significado**
  -------------- --------------------------------------------------------
  PK             Primary key

  FK             Foreign key (link record)

  LK             Lookup

  RU             Rollup

  ƒ              Fórmula Airtable

  UQ             Único

  IDX            Índice lógico (vista filtrada)
  -----------------------------------------------------------------------

**Tipos de automation**

  ------------------------------------------------------------------------
  **Tipo**          **Descripción**                      **Ejemplos**
  ----------------- ------------------------------------ -----------------
  Script            JavaScript nativo Airtable Scripting AT01, AT02, AT03

  Formula +         Fórmula nativa Airtable + Automation AT04
  Automation        reactiva                             

  Automation        Airtable Automation sin código       AT05, AT06, AT07
                    custom                               

  Scheduled         Cron job programado                  AT08, AT09, AT10
  ------------------------------------------------------------------------

**3. Flujo Completo de una Tasación**

**3.1 Triggers por estado de solicitud**

La siguiente tabla resume qué automations se activan según el estado que
alcanza TX_Solicitudes:

  -----------------------------------------------------------------------
  **Estado**             **Automation disparada**
  ---------------------- ------------------------------------------------
  creada                 AT01_resolver_motor_reglas ·
                         AT02_asignar_tasador

  visitada               AT03_ejecutar_dag_formulas

  TX_Calculos generado   AT04_validar_rangos_valor

  pdf_listo              AT05_notificar_visador

  decision_visador       AT06_procesar_decision_visador
  cambia                 

  aprobada               AT07_chequear_aprobacion_final
  -----------------------------------------------------------------------

**3.2 Flujo detallado --- Parte 1: Creación a visita en terreno**

El flujo comienza cuando el formulario Next.js IF-01 (externo, app
pública en Railway) crea una nueva solicitud. En el estado creada se
ejecutan en paralelo AT01 (motor de reglas) y AT02 (asignación de
tasador). ⚠ v1.9: cuando la solicitud se crea desde IF-02 (interno,
consola Next.js de la ejecutiva), AT02 **no** se invoca — la asignación
de tasador queda fuera del alcance de IF-02 y se hace manualmente desde
la UI (botón "Asignar Tasador", sin flujo de reasignación formal; ver
`docs/diseno.md` REGLA A). AT01 sí sigue corriendo igual para ambos
orígenes. El tasador
realiza la visita con el formulario Next.js IF-03 (PWA móvil con Clerk)
y registra datos en TX_DatosTasacion.

> Nueva solicitud (Next.js IF-01)
>
> │
>
> ▼
>
> TX_Solicitudes.estado = creada
>
> │
>
> ├──▶ AT01_resolver_motor_reglas (resuelve regla de negocio)
>
> │
>
> └──▶ AT02_asignar_tasador (asigna tasador según zona y carga)
>
> │
>
> ▼
>
> TX_Solicitudes.estado = asignada
>
> │
>
> ▼
>
> Visita en terreno (Next.js IF-03)
>
> Captura de datos + adjuntos
>
> │
>
> ▼
>
> TX_Solicitudes.estado = visitada
>
> │
>
> ▼
>
> AT03_ejecutar_dag_formulas
>
> (lee C_Formulas y TX_DatosTasacion, genera TX_Calculos)

**3.3 Flujo detallado --- Parte 2: Cálculo y generación de PDF**

Una vez registrada la visita (estado = visitada), AT03 ejecuta el DAG
completo de fórmulas. AT04 valida los rangos del valor calculado. Si
todo está dentro del rango, SC07+SC09 generan el PDF y AT05 notifica al
visador.

> AT03_ejecutar_dag_formulas
>
> (lee C_Formulas y TX_DatosTasacion, genera TX_Calculos)
>
> │
>
> ▼
>
> TX_Solicitudes.estado = calculada
>
> │
>
> ▼
>
> AT04_validar_rangos_valor (valida resultados de TX_Calculos)
>
> │
>
> ├──▶ Si OK → continúa flujo documental
>
> │
>
> └──▶ Si fuera de rango → TX_Solicitudes.flag_revision = TRUE
>
> (requiere revisión)
>
> │
>
> ▼
>
> Generación PDF (SC07 + SC09)
>
> │
>
> ▼
>
> TX_Solicitudes.estado = pdf_listo
>
> │
>
> ▼
>
> AT05_notificar_visador (crea TX_Notificaciones y dispara envío)

**3.4 Flujo detallado --- Parte 3: Visado y cierre**

El visador responde vía la app Next.js IF-04 (consola de revisión +
Clerk). AT06 procesa la decisión: si devuelve, la solicitud vuelve a
revisión; si aprueba, AT07 verifica condiciones finales y la solicitud
avanza a entregada y luego cerrada.

> AT05_notificar_visador
>
> (crea TX_Notificaciones y dispara envío)
>
> │
>
> ▼
>
> Visador responde mediante Next.js IF-04 --- decision_visador cambia
>
> │
>
> ▼
>
> AT06_procesar_decision_visador
>
> │
>
> ├──▶ Si devuelve: TX_Solicitudes.estado = devuelta
>
> │
>
> └──▶ Si aprueba: TX_Solicitudes.estado = aprobada
>
> │
>
> ▼
>
> AT07_chequear_aprobacion_final (verifica condiciones finales)
>
> │
>
> ▼
>
> TX_Solicitudes.estado = entregada
>
> │
>
> ▼
>
> TX_Solicitudes.estado = cerrada

**4. Resumen del Motor de Cálculo (Vista Rápida)**

Los cuatro pasos críticos que transforman una solicitud en un valor
tasado:

  ---------------------------------------------------------------------------------------
  **Paso**   **Automation**               **Rol**          **Trigger**   **Salida**
  ---------- ---------------------------- ---------------- ------------- ----------------
  1          AT01_resolver_motor_reglas   EL CEREBRO ---   estado =      regla_aplicada
                                          decide           creada        en
                                          plantilla +                    TX_Solicitudes
                                          fórmulas +                     
                                          workflow                       

  2          AT02_asignar_tasador         EL ASIGNADOR --- estado =      tasador asignado
                                          decide quién va  creada (post  · Make SC03
                                          a terreno        AT01)         notifica

  3          AT03_ejecutar_dag_formulas   EL CALCULADOR    estado =      TX_Calculos
                                          --- ejecuta DAG  visitada      escrito fila por
                                          de \~15 fórmulas               fórmula

  4          AT04_validar_rangos_valor    EL VALIDADOR --- TX_Calculos   flag revisión
                                          verifica rangos  INSERT        (si aplica) ·
                                          de M_Comunas                   Make SC07+SC09
  ---------------------------------------------------------------------------------------

**State machine de TX_Solicitudes:**

> creada → asignada → visitada → calculada → pdf_listo → aprobada →
> entregada → cerrada
>
> ↑ ↑ ↑
>
> requiere_atencion revision devuelta

**5. AT01 · Resolver Motor de Reglas**

![](media/image1.png){width="6.3in" height="5.832638888888889in"}

![](media/image2.png){width="6.3in" height="7.542361111111111in"}

**Especificación**

  -----------------------------------------------------------------------
  **Atributo**        **Valor**
  ------------------- ---------------------------------------------------
  Nombre              AT01_resolver_motor_reglas

  Tipo                Script (JavaScript Airtable Scripting)

  Trigger             TX_Solicitudes.estado = creada

  Lee                 C_ReglasNegocio, M_Clientes (+ TX_Solicitudes como
                      contexto)

  Escribe             TX_Solicitudes (campo regla_aplicada),
                      A_DecisionesMotor

  Prerequisito        Ninguno --- es el primer eslabón de la cadena

  Siguiente paso      AT02 se dispara automáticamente (hereda
                      regla_aplicada)
  -----------------------------------------------------------------------

**Qué hace AT01**

AT01 es el primer motor que se ejecuta en el ciclo de vida de una
solicitud. Lee el contexto de la solicitud recién creada y determina,
consultando C_ReglasNegocio, cuál es la combinación correcta de
plantilla + fórmulas + workflow que debe aplicarse.

**Tabla crítica: C_ReglasNegocio**

**EL CEREBRO. Es la tabla más importante de la arquitectura. Cada fila
mapea un contexto de solicitud a una configuración aplicable.**

**Campos de C_ReglasNegocio**

  -------------------------------------------------------------------------------------
  **Campo**                   **Tipo**           **Sección**   **Descripción**
  --------------------------- ------------------ ------------- ------------------------
  nombre                      Single line        Metadato      Nombre descriptivo de la
                                                               regla

  cliente_filter              Link → M_Clientes  FILTRO        Vacío = matchea todos
                                                               los clientes

  tipo_informe_filter         Link →             FILTRO        Vacío = matchea todos
                              M_TiposInforme                   los tipos

  tipo_prop_filter            Link →             FILTRO        Vacío = matchea todos
                              M_TiposPropiedad                 los tipos

  comuna_filter               Link → M_Comunas   FILTRO        Vacío = matchea todas
                              (multi)                          las comunas

  banco_filter                Link → M_Bancos    FILTRO        Vacío = matchea todos
                                                               los bancos

  monto_min_uf                Number             FILTRO        Monto mínimo (0 = sin
                                                               límite inferior)

  monto_max_uf                Number             FILTRO        Monto máximo (0 = sin
                                                               límite superior)

  plantilla_resultado         Link →             RESULTADO     Plantilla Carbone a usar
                              C_Plantillas                     

  formulas_resultado          Link → C_Formulas  RESULTADO     Fórmulas a ejecutar por
                              (multi)                          AT03

  workflow_resultado          Link → C_Workflows RESULTADO     Flujo de aprobación a
                                                               seguir

  factores_aplicables         Link → C_Factores  RESULTADO     Coeficientes aplicables
                              (multi)                          

  requiere_aprobacion_final   Checkbox           RESULTADO     Si true, AT07 verifica
                                                               condiciones extra

  prioridad                   Number             METADATO      Desempate entre reglas
                                                               de igual especificidad

  especificidad               ƒ (fórmula)        METADATO      COUNT(filtros no vacíos)
                                                               --- calculado
                                                               automáticamente

  vigente_desde               Date               METADATO      Fecha de activación
                                                               (vacío = siempre activa)

  vigente_hasta               Date               METADATO      Fecha de expiración
                                                               (vacío = nunca expira)

  activa                      Checkbox           METADATO      False = deshabilitar sin
                                                               borrar
  -------------------------------------------------------------------------------------

**Algoritmo de resolución (6 pasos)**

> PASO 1 · Recoger contexto
>
> TX_Solicitudes → cliente_id + tipo_informe_id + tipo_propiedad_id
>
> \+ banco_id + comuna_id + monto_estimado_uf
>
> PASO 2 · Filtrar candidatas
>
> C_ReglasNegocio → para cada filtro de la regla:
>
> \- vacío = matchea cualquier valor del contexto
>
> \- con valor = debe coincidir exactamente
>
> Resultado: N reglas candidatas (siempre incluye la wildcard)
>
> PASO 3 · Filtrar vigencia
>
> Descartar activa=false, vigente_desde \> hoy, vigente_hasta \< hoy
>
> PASO 4 · Ordenar por especificidad
>
> especificidad = COUNT(filtros no vacíos)
>
> Gana la de mayor especificidad (más restrictiva)
>
> PASO 5 · Desempatar por prioridad
>
> Si dos reglas tienen igual especificidad → gana la de mayor prioridad
>
> prioridad ≥ 900 = excepción temporal (debe tener vigente_hasta
> definido)
>
> PASO 6 · Devolver y auditar
>
> Escribe A_DecisionesMotor: reglas_candidatas, regla_ganadora,
>
> regla_ganadora_snapshot (JSON inmutable), razon_ganadora
>
> Actualiza TX_Solicitudes.regla_aplicada (FK → C_ReglasNegocio)

**Ejemplo de evaluación**

Solicitud: cliente=MetLife, tipo=Hipotecario, propiedad=Departamento,
comuna=Vitacura, monto=12.000 UF.

  -----------------------------------------------------------------------------
  **Regla**          **Filtros      **Especificidad**   **¿Gana?**
                     activos**                          
  ------------------ -------------- ------------------- -----------------------
  #45 MetLife        1              1                   No
  Genérica                                              

  #46 MetLife        2              2                   No
  Hipotecario                                           

  #47 MetLife        4              4                   Sí ★
  Hipotec Depto Las                                     
  Condes                                                

  #48 Sector premium 2              2                   No
  \>10K UF                                              
  -----------------------------------------------------------------------------

**Casos límite de AT01**

  -----------------------------------------------------------------------
  **Caso**                   **Comportamiento**
  -------------------------- --------------------------------------------
  Ninguna regla matchea (sin estado → requiere_atencion · evento
  wildcard)                  severidad=critical · notif al admin

  Múltiples reglas con misma Gana la más reciente · conflicto registrado
  especificidad y prioridad  en A_DecisionesMotor

  Regla marcada activa=false Nunca se considera (deshabilitar sin borrar)

  Regla con vigente_desde    No se considera hasta su fecha de activación
  futuro                     

  Plantilla referenciada no  Flujo se detiene en SC09; A_ErroresMake
  existe                     severidad=critical
  -----------------------------------------------------------------------

> *⚠️ Sin wildcard, una solicitud sin match deja el sistema en
> requiere_atencion con alerta crítica al admin.*

**6. AT02 · Asignar Tasador**

![](media/image3.png){width="6.3in" height="4.279861111111111in"}

![](media/image4.png){width="6.3in" height="6.825in"}

**Especificación**

  -----------------------------------------------------------------------
  **Atributo**        **Valor**
  ------------------- ---------------------------------------------------
  Nombre              AT02_asignar_tasador

  Tipo                Script (JavaScript Airtable Scripting)

  Trigger             TX_Solicitudes.estado = creada (post AT01)

  Lee                 M_Tasadores, M_Comunas, TX_Solicitudes

  Escribe             TX_Solicitudes (tasador, fecha_asignacion, estado),
                      A_Eventos

  Prerequisito        AT01 debe completar regla_aplicada

  Siguiente paso      Make SC03 notifica al tasador (email/WhatsApp)
  -----------------------------------------------------------------------

**Tabla crítica: M_Tasadores**

Tabla maestra que concentra disponibilidad, zona de cobertura y carga de
trabajo de cada tasador.

**Algoritmo de asignación (6 pasos)**

> PASO 1 · Leer contexto
>
> TX_Solicitudes → comuna_id + tipo_informe_id
>
> PASO 2 · Filtrar por zona
>
> M_Tasadores WHERE zonas_cobertura ∋ comuna_id
>
> (RB-27: solo puede recibir solicitudes en su territorio)
>
> PASO 3 · Filtrar por disponibilidad
>
> WHERE disponible = TRUE
>
> (disponible = casos_en_curso \< capacidad_activa)
>
> PASO 4 · Ordenar por carga y rating
>
> ORDER BY casos_en_curso ASC, rating DESC
>
> → el primero es el candidato
>
> PASO 5 · Verificar override manual
>
> IF TX_Solicitudes.tasador ya está poblado (asignación manual desde
> Next.js IF-02)
>
> → respetar + registrar como \'asignacion_manual\'
>
> ELSE
>
> → asignar el candidato del paso 4
>
> PASO 6 · Escribir
>
> TX_Solicitudes.tasador = tasador_id
>
> TX_Solicitudes.fecha_asignacion = NOW()
>
> TX_Solicitudes.estado = \'asignada\'
>
> A_Eventos INSERT: evento=\'tasador_asignado\' · append-only

**Reglas de negocio vinculadas**

  ------------------------------------------------------------------------
  **Regla**   **Descripción**
  ----------- ------------------------------------------------------------
  RB-27       Cada tasador tiene comunas asignadas; solo puede recibir
              solicitudes en su territorio

  RB-34       COUNTIF valida que la comuna esté en las comunas asignadas
              antes de permitir la asignación
  ------------------------------------------------------------------------

**Diferencias clave AT01 vs AT02**

  -----------------------------------------------------------------------
  **Aspecto**        **AT01**                   **AT02**
  ------------------ -------------------------- -------------------------
  Tabla crítica      C_ReglasNegocio (dominio   M_Tasadores (dominio M\_)
                     C\_)                       

  Escritura A\_      A_DecisionesMotor          A_Eventos

  Prerequisito       Ninguno                    AT01 debe completar
  secuencia                                     regla_aplicada

  Tablas no          ---                        C_Formulas, C_Factores
  necesarias                                    (no los usa directamente)
  -----------------------------------------------------------------------

> *⚠️ Si ningún tasador pasa los filtros, la solicitud queda en estado =
> requiere_atencion y se genera notificación al administrador.*

**7. AT03 · Ejecutar DAG de Fórmulas**

![](media/image5.png){width="6.3in" height="4.097222222222222in"}

![](media/image6.png){width="6.3in" height="6.3in"}

**Especificación**

  -----------------------------------------------------------------------
  **Atributo**        **Valor**
  ------------------- ---------------------------------------------------
  Nombre              AT03_ejecutar_dag_formulas

  Tipo                Script (JavaScript Airtable Scripting)

  Trigger             TX_Solicitudes.estado = visitada

  Lee                 C_Formulas (el DAG), TX_DatosTasacion,
                      TX_Solicitudes, TX_ItemsCuadroValoracion,
                      C_PreciosUnitarios, C_Factores, H_PreciosUF

  Escribe             TX_Calculos (fila por fórmula), TX_Solicitudes
                      (estado → calculada)

  Prerequisito        AT01 y AT02 completados · Tasador completó Next.js
                      IF-03 (estado = visitada)

  Siguiente paso      AT04 se dispara por TX_Calculos INSERT
  -----------------------------------------------------------------------

**Qué es un DAG y por qué se usa Kahn**

Un DAG (Directed Acyclic Graph) es un grafo de nodos con relaciones de
dependencia y sin ciclos. Cada fórmula es un nodo y depende_de son las
aristas. El algoritmo de Kahn garantiza que ninguna fórmula se ejecute
antes de que sus dependencias estén resueltas.

**Tabla crítica: C_Formulas**

  -------------------------------------------------------------------------
  **Campo**          **Tipo**            **Uso en AT03**
  ------------------ ------------------- ----------------------------------
  expresion          Long text           La expresión a evaluar

  depende_de         Link → C_Formulas   Construye el DAG para sort
                     (FK self)           topológico

  variable_output    Single line text    Nombre con que se guarda en
                                         TX_Calculos

  orden_topologico   Number              Posición resultante del sort de
                                         Kahn

  es_terminal        Checkbox            True si es la fórmula final de una
                                         cadena

  grupo_calculo      Single line         Bloque lógico al que pertenece

  activa             Checkbox            AT03 solo ejecuta fórmulas activas
  -------------------------------------------------------------------------

**Cadena de cálculo (\~15 fórmulas en secuencia)**

> PASO FÓRMULA (variable_output) DEPENDE_DE
>
> ──── ──────────────────────────────────
> ────────────────────────────────────
>
> 1 uf_m2_promedio (homologado) (5 comparables + factores homolog.)
>
> 2 valor_edificacion_uf uf_m2_nuevo · factor_df · coef_tipo
>
> 3 factor_df (depreciación D.F.) anio · vida_util · estado_conserv.
>
> 4 valor_garantia_uf valor_edificacion · factor_garantia
>
> 5 valor_seguro_uf valor_edificacion · factor_seguro
>
> 6 valor_reposicion_uf valor_edificacion · OO.CC. · terreno
>
> 7 valor_remate_uf reposicion · factor_remate(velocidad)
>
> 8 valor_liquidacion_uf reposicion · factor_liquidacion
>
> 9 ingreso_liquido_uf arriendo · gasto_anual
>
> 10 renta_perpetua_uf ◄ terminal ingreso_liquido · tasa_cap_rate
>
> 11 valor_clp / valor_usd ◄ terminal valor_uf · uf_dia ·
> tipo_cambio_usd

**Overrides aplicados desde TX_Solicitudes**

  ---------------------------------------------------------------------------------
  **Override**   **Campo**                **Descripción**
  -------------- ------------------------ -----------------------------------------
  NRB-01         tasa_cap_rate_override   Reemplaza el cap rate automático por
                                          cliente. Permite ajuste manual (ej. Las
                                          Rejas: 5,5% en lugar de 4,5%). Auditado
                                          en A_Cambios.

  NRB-05         vida_util_override       Reemplaza el tramo automático de
                                          C_VidaUtil. Permite corregir por estado
                                          real del inmueble. Requiere justificación
                                          documentada.
  ---------------------------------------------------------------------------------

**Algoritmo de ejecución DAG (5 pasos)**

> PASO 1 · Leer contexto
>
> TX_Solicitudes → solicitud_id + regla_aplicada.formulas_resultado
>
> PASO 2 · Leer DAG
>
> C_Formulas WHERE formula_id IN formulas_resultado
>
> Lee campo depende_de para construir el grafo
>
> PASO 3 · Sort topológico (algoritmo de Kahn, JavaScript nativo)
>
> Ordenar fórmulas de modo que cada una se ejecuta
>
> después de todas sus dependencias
>
> PASO 4 · Ejecutar cadena
>
> Para cada fórmula en orden topológico:
>
> \- Leer variables de TX_DatosTasacion + C_Factores + M_Comunas
>
> \- Aplicar overrides NRB-01 / NRB-05 si existen
>
> \- Pre-agregar TX_ItemsCuadroValoracion por aporta_a_garantia
>
> \- Evaluar expresión
>
> \- Escribir TX_Calculos (fila) con:
>
> resultado · formula_version (snapshot) · formula_expresion_snapshot
>
> inputs_json · calculado_en
>
> PASO 5 · Actualizar estado
>
> TX_Solicitudes.estado = \'calculada\'
>
> (esto dispara AT04 via TX_Calculos INSERT)

**Reglas de negocio vinculadas a ítems**

  ------------------------------------------------------------------------
  **Regla**   **Descripción**
  ----------- ------------------------------------------------------------
  RB-38       Terraza vale 50% del piso anterior; aporta al comercial pero
              NO a garantía

  RB-39       Ítem marcado \"No Garantía\" si Y51=S/Reg No Regularizable,
              estado=Malo o garantía=Denegada

  RB-54       aporta_a_garantia es un flag por ítem; la terraza siempre es
              false en garantía

  RB-35       Factor seguro (0.8 o 1.0) depende del cliente_n y el tipo de
              propiedad

  RB-53       Factor garantía (0.8) y factor seguro (0.825) son campos
              independientes en M_Clientes
  ------------------------------------------------------------------------

**8. AT04 · Validar Rangos de Valor**

![](media/image7.png){width="6.3in" height="5.507638888888889in"}

![](media/image8.png){width="6.3in" height="7.525in"}

**Especificación**

  -----------------------------------------------------------------------
  **Atributo**        **Valor**
  ------------------- ---------------------------------------------------
  Nombre              AT04_validar_rangos_valor

  Tipo                Formula + Automation (híbrido --- NO es Script)

  Trigger             TX_Calculos INSERT (cada fila que AT03 inserta)

  Lee                 TX_Calculos, M_Comunas, TX_Solicitudes

  Escribe             TX_Solicitudes (flag de revisión obligatoria)

  Prerequisito        AT03 debe haber completado TX_Calculos

  Siguiente paso      Make SC07+SC09 genera PDF preliminar
  -----------------------------------------------------------------------

**Naturaleza híbrida: Formula + Automation**

**AT04 opera en dos capas:**

Capa 1 --- Fórmula Airtable nativa: Compara TX_Calculos.resultado vs
M_Comunas.rango_min_uf_m2 y rango_max_uf_m2. También cruza con
M_Clientes.monto_umbral_uf. Output: campo booleano fuera_de_rango
calculado en tiempo real.

Capa 2 --- Automation Airtable (reactiva, sin código JavaScript): Se
dispara cuando TX_Calculos recibe una INSERT. Lee el campo booleano
fuera_de_rango. Si TRUE: escribe flag en TX_Solicitudes. Si FALSE: flujo
normal sin bloqueo.

**Lógica de comparación de rangos**

> COMPARACIÓN PRINCIPAL:
>
> TX_Calculos.valor_calculado_uf
>
> vs
>
> M_Comunas.rango_min_uf_m2 (límite inferior del rango para la zona)
>
> M_Comunas.rango_max_uf_m2 (límite superior del rango para la zona)
>
> → fuera_de_rango = TRUE si la desviación supera el umbral configurable
>
> COMPARACIÓN SECUNDARIA (alto valor):
>
> TX_Solicitudes.monto_estimado_uf
>
> vs
>
> M_Clientes.monto_umbral_uf
>
> → requiere_aprobacion_final = TRUE si supera el umbral del cliente

**Campos críticos en M_Comunas**

  ----------------------------------------------------------------------------
  **Campo**                    **Tipo**    **Descripción**
  ---------------------------- ----------- -----------------------------------
  rango_min_uf_m2              Number      Piso de valor UF/m² para la zona

  rango_max_uf_m2              Number      Techo de valor UF/m² para la zona

  uf_m2_promedio_residencial   Number      Referencia residencial de mercado

  uf_m2_promedio_comercial     Number      Referencia comercial de mercado

  plusvalía                    Number      Factor de tendencia de la zona

  zonificacion                 Single line Clasificación regulatoria de uso de
                                           suelo
  ----------------------------------------------------------------------------

**Dos caminos posibles (paths post AT04)**

  --------------------------------------------------------------------------
  **Resultado**   **Condición**     **Siguiente paso**
  --------------- ----------------- ----------------------------------------
  Aprobado        fuera_de_rango =  SC07+SC09 genera PDF · estado →
                  FALSE             pdf_listo · AT05 notifica al visador

  Revisión        fuera_de_rango =  flag_revision = TRUE · estado → revision
  requerida       TRUE              · Visador recibe alerta en Next.js IF-04
  --------------------------------------------------------------------------

**Diferencias clave AT04 vs AT01/AT02/AT03**

  -------------------------------------------------------------------------------------
  **Aspecto**    **AT01**            **AT02**        **AT03**          **AT04**
  -------------- ------------------- --------------- ----------------- ----------------
  Tipo           Script              Script          Script            Formula + Auto

  Trigger        estado=creada       estado=creada   estado=visitada   TX_Calculos
                                     (post AT01)                       INSERT

  Tabla crítica  C_ReglasNegocio     M_Tasadores     C_Formulas        M_Comunas

  Escribe en A\_ A_DecisionesMotor   A_Eventos       No directamente   No

  Prerequisito   Ninguno             AT01            AT01+AT02+F3      AT03

  Siguiente      AT02                Make SC03       AT04              Make SC07+SC09
  -------------------------------------------------------------------------------------

**9. Conceptos Clave Transversales**

**Cap Rate**

Tasa de capitalización usada para estimar el valor de un inmueble que
genera renta.

> Cap rate = Ingreso neto anual ÷ Valor del inmueble
>
> Valor = Ingreso neto anual ÷ Cap rate (renta perpetua)

VProperty usa el cap rate a la inversa: dado un arriendo conocido y una
tasa exigida por el cliente, estima el valor del inmueble. La tasa varía
por cliente (RB-52):

- Clientes estándar: 4,5%

- Agencia Habitacional: 6,0%

- Override manual posible vía NRB-01 (campo tasa_cap_rate_override en
  TX_Solicitudes)

**Snapshot vs Referencia**

Cada decisión del sistema guarda un snapshot (copia del estado en el
momento), no una referencia. Si la regla, fórmula o plantilla cambia
mañana, el historial sigue siendo reproducible bit a bit.

  -----------------------------------------------------------------------------
  **Registro**                                **Snapshot guardado**
  ------------------------------------------- ---------------------------------
  A_DecisionesMotor.regla_ganadora_snapshot   JSON inmutable de la regla usada
                                              en el momento

  TX_Calculos.formula_expresion_snapshot      Texto exacto de la expresión
                                              evaluada

  TX_DocumentosGenerados.plantilla_snapshot   Versión de la plantilla Carbone
  -----------------------------------------------------------------------------

**Idempotencia**

Todos los AT y escenarios Make son idempotentes: ejecutarlos dos veces
produce el mismo resultado que ejecutarlos una vez. Antes de actuar,
cada automatización verifica el estado actual. Esto permite reintentos
seguros sin duplicar PDFs, emails ni registros.

**10. Orden de Carga de CSVs Consolidado**

Este es el orden maestro para todos los AT01--AT04. Cada capa puede
cargarse en paralelo entre sus tablas; el orden entre capas es estricto.

**Capa 1 · M\_ Maestros**

  -----------------------------------------------------------------------------
  **Orden**   **Tabla**          **Motivo**
  ----------- ------------------ ----------------------------------------------
  1           M_TiposPropiedad   Sin FKs

  2           M_TiposInforme     Sin FKs

  3           M_Productos        Sin FKs

  4           M_Bancos           Sin FKs

  5           M_Comunas          Sin FKs · crítica para AT02, AT03, AT04

  6           M_Clientes         Sin FKs · crítica para AT01, AT04

  7           M_Visadores        Sin FKs

  8           M_Tasadores        FK → M_Comunas (zonas_cobertura) · crítica
                                 para AT02
  -----------------------------------------------------------------------------

> *⚠️ M_Tasadores va siempre después de M_Comunas. El campo disponible
> es una fórmula calculada por Airtable --- no cargarlo manualmente.*

**Capa 2 · C\_ Configuración**

  ----------------------------------------------------------------------------------
  **Orden**   **Tabla**                **Motivo**
  ----------- ------------------------ ---------------------------------------------
  9           C_Plantillas             FK → M_Clientes, M_TiposInforme

  10          C_Formulas               FK → M_TiposInforme, M_TiposPropiedad ·
                                       crítica para AT03 · incluye campo depende_de

  11          C_Workflows              Sin FKs externos

  12          C_WorkflowPasos          FK → C_Workflows

  13          C_Factores               Sin FKs externos · crítica para AT03

  14          C_PreciosUnitarios       FK → M_TiposPropiedad

  15          C_VidaUtil               Sin FKs

  16          C_VariablesCliente       FK → M_Clientes

  17          C_SLA                    FK → M_Clientes, M_TiposInforme

  18          C_NotificacionesConfig   FK → C_Workflows, M_Clientes

  19          C_ReglasNegocio          FK a TODO lo anterior --- cargar siempre
                                       última
  ----------------------------------------------------------------------------------

> *⚠️ C_ReglasNegocio siempre va última del dominio C\_. Es la única
> tabla con FK a C_Plantillas, C_Formulas, C_Workflows y C_Factores
> simultáneamente.*

**Capa 3 · TX\_ Transacciones**

  ----------------------------------------------------------------------------------
  **Orden**   **Tabla**                  **Motivo**
  ----------- -------------------------- -------------------------------------------
  20          TX_Solicitudes             Tabla padre · FK a M\_ y C\_

  21          TX_DatosTasacion           1:1 con TX_Solicitudes

  22          TX_ItemsCuadroValoracion   Hija de TX_Solicitudes

  23          TX_Calculos                Hija de TX_Solicitudes + FK a C_Formulas

  24          TX_Comparables             Hija de TX_Solicitudes

  25          TX_Ampliaciones            Hija de TX_Solicitudes
  ----------------------------------------------------------------------------------

> *⚠️ TX_Calculos no necesita CSV con datos --- AT03 la puebla en
> runtime. Lo que sí debe existir es la tabla con su esquema correcto y
> los FK resueltos.*

**Capa 4 · A\_ Auditoría (todas vacías al cargar)**

  -----------------------------------------------------------------------------
  **Orden**   **Tabla**           **Quién escribe**
  ----------- ------------------- ---------------------------------------------
  26          A_DecisionesMotor   AT01 escribe aquí

  27          A_Eventos           AT02 escribe aquí · AT01 en error crítico

  28          A_Cambios           Registro de modificaciones sensibles
  -----------------------------------------------------------------------------

**11. Comparativa de los Cuatro AT**

  -------------------------------------------------------------------------------------
  **Atributo**    **AT01**            **AT02**        **AT03**          **AT04**
  --------------- ------------------- --------------- ----------------- ---------------
  Tipo            Script              Script          Script            Formula+Auto

  Dominio tabla   C\_                 M\_             C\_               M\_
  crítica                                                               

  Tabla crítica   C_ReglasNegocio     M_Tasadores     C_Formulas        M_Comunas

  Trigger         estado=creada       estado=creada   estado=visitada   TX_Calculos
                                      (post AT01)                       INSERT

  Escribe A\_     A_DecisionesMotor   A_Eventos       No                No

  Prerequisito    Ninguno             AT01            AT01+AT02+F3      AT03
  secuencia                                                             

  Complejidad     Alta (C_RN          Media           Alta (DAG de      Baja
  grafo           referencia todo)                    Kahn)             

  Siguiente paso  AT02                Make SC03       AT04              Make SC07+SC09
  -------------------------------------------------------------------------------------

**12. Automations Independientes de Estado (AT08--AT10)**

Estas automations no dependen de un estado específico de TX_Solicitudes.
Se ejecutan por cron y actúan transversalmente sobre todo el sistema.

  ------------------------------------------------------------------------------
  **AT**                    **Trigger**    **Función**
  ------------------------- -------------- -------------------------------------
  AT08 --- AT08_alertas_sla Cron diario    Revisa vencimientos SLA en
                            08:00          TX_Solicitudes. Genera alertas en
                                           TX_Notificaciones y dispara Make SC13

  AT09 ---                  Cron cada 15   Reprocesa registros en
  AT09_reintentos_cola      min            Z_ColaPendientes que tienen
                                           reactivar_en ≤ ahora

  AT10 ---                  Cron nocturno  Mueve solicitudes cerradas con más de
  AT10_archivado_nocturno                  30 días a H_Solicitudes_Cerradas.
                                           Registra en A_Eventos
  ------------------------------------------------------------------------------

**Flujo de Automations Programadas**

> Cron diario 08:00
>
> │
>
> ▼
>
> AT08_alertas_sla (revisa vencimientos SLA)
>
> Cron cada 15 minutos
>
> │
>
> ▼
>
> AT09_reintentos_cola (reprocesa Z_ColaPendientes)
>
> Cron nocturno
>
> │
>
> ▼
>
> AT10_archivado_nocturno (mueve solicitudes cerradas \>30 días al
> histórico)

*Documento generado por VProperty Data Engineering · Junio 2026\
Fusión de: Grafos_AT01_AT04.md + Esquemas_AT01_AT04.md + flujos de
Guia_Implementacion_General.docx*
