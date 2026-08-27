> **Versión sincronizada con** `VProperty_Especificacion_Proyecto_v1_9_3.md` §2 · 25-jul-2026 · commit `d4180c0`
>
> **v1.9.15** — sucede a `VProperty_Especificacion_Proyecto_v1_9_14.md`, que queda marcado SUPERSEDED.
> El nombre del archivo y la versión del cuerpo coinciden siempre: al bumpear se renombra con `git mv` y se actualizan las referencias del repositorio en el mismo commit.
> **Fuente única.** Este es el único documento normativo del producto. Contratos de webhook, blueprints conceptuales de escenarios Make, RF, reglas de negocio, requisitos técnicos y decisiones arquitectónicas viven aquí, en la sección que corresponda. No se admiten archivos paralelos de especificación (`docs/_notas/spec_*.md`, `docs/*_v2_*.md` ni equivalentes); `docs/_notas/` queda para notas operativas con fecha.
> Alcance del cambio y trazabilidad por rol: `docs/_sync_ifTasador_v1/SYNC_LOG.md`
> Identificadores históricos (RF · RNF · RN · RT · RR · SP · D · SC · AT · IF) **no se renumeran**.

---

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

  **Versión**         1.9.15 · 23-ago-2026 · Baja la segunda tanda de
                      respuestas del cliente y cierra con ella siete
                      ambigüedades. §2.8 · **la sección D de comparables pasa
                      a sólo lectura**: los comparables llegan por extracción
                      de una foto del cuadro de la plantilla operativa y el
                      tasador no puede modificarlos; RF-12 conserva el mínimo
                      de 3 pero la validación pasa a recaer sobre el origen.
                      §2.8 · **RF-TAS-08 pierde su conjunto 1** —factores de
                      homogeneización y coeficientes de la tabla de
                      referencia— y queda vivo sólo el conjunto de defaults
                      constructivos de §2.8.1. §2.3 y §2.12 · el catálogo de
                      seis desenlaces de la coordinación queda **ratificado**
                      y deja de ser provisional. §5.2.5 · el catálogo de
                      siete motivos de reproceso queda **ratificado como
                      dominio cerrado**. §5.2.8 · el tope de 24 horas se
                      modela **sólo como corte de reporte**, sin semáforo
                      agregado ni alerta en pantalla; el canal WhatsApp
                      **se descarta** y el recordatorio queda en correo
                      único. §5.2.9 · el tablero de vencimientos queda con
                      **cuatro grupos**, sin día 0. §15 · **D-18, D-19 y
                      D-24 cierran**; entra **D-23**. Cierra las ambigüedades
                      A-13, A-18, A-23, A-24, A-25, A-26 y A-32, y abre A-44
                      en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`.
                      Sucede a 1.9.14, que queda SUPERSEDED.

                      1.9.14 · 22-ago-2026 · Baja las respuestas de Héctor a
                      las tres consultas bloqueantes de v1.9.13. §5.2.8 · el
                      umbral del recordatorio al tasador queda fijado en
                      **4 horas hábiles** y deja de ser provisional; se
                      documenta que coincide con el ámbar de la etapa 2 y
                      que por tanto no introduce un instante nuevo. §2.8.1 ·
                      RF-TAS-23 gana la regla de partición de los defaults
                      por tipo de propiedad × estado de uso. §2.8 ·
                      RF-TAS-08 queda ratificado con sus tres factores de
                      homogeneización; `D. F.` y `F. M.` pasan de posible
                      reemplazo a observación. §5.2.4 · precisión en la
                      etapa 2. §15 · **D-17, D-20 y D-21 cierran**; entra
                      D-22. Cierra las ambigüedades A-14, A-22, A-27 y A-28
                      y abre A-35 en
                      `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`.
                      Sucede a 1.9.13, que queda SUPERSEDED.

                      1.9.13 · 21-ago-2026 · Incorpora la segunda tanda de
                      audios del cliente y la plantilla operativa vigente
                      `Formato Informe VProperty Enero2026.xlsm` como
                      fuente de los valores por defecto del informe. §2.3 ·
                      el catálogo de desenlaces de la coordinación pasa de
                      cuatro a seis valores. §2.8 · se especifica el
                      pre-llenado de la hoja de antecedentes (RF-TAS-23),
                      con sus defaults y catálogos citados por celda.
                      §5.2.4 · precisiones de las etapas 2 y 5. §5.2.5 ·
                      catálogo de siete motivos de reproceso. §5.2.8 ·
                      recordatorios automáticos al ejecutor, distintos de
                      la escalada al responsable. §5.2.9 · los dos reportes
                      de control diario y el reporte de solicitudes sin
                      fecha de visita. Registra las ambigüedades A-22 a
                      A-29 en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`.
                      Sucede a 1.9.12, que queda SUPERSEDED.

                      1.9.12 · 19-ago-2026 · §2.12 · el campo primario de
                      `TX_CoordinacionVisita` pasa de `autoNumber` a
                      `singleLineText` escrito por el Route Handler:
                      `autoNumber` no está soportado por las tools MCP y no
                      se crean campos desde la UI de Airtable. Completa los
                      tres cambios de tipo de §2.12. Sucede a 1.9.11, que
                      queda SUPERSEDED.

                      1.9.11 · 19-ago-2026 · §2.12 · `intento_numero` y
                      `coordinacion_vigente` pasan de formula a number y
                      singleSelect escritos por el Route Handler: las
                      fórmulas declaradas no son implementables en Airtable.
                      Sucede a 1.9.10, que queda SUPERSEDED.

                      1.9.10 · 19-ago-2026 · Reversión de RO-29 por
                      revisión Héctor diseño v4. CI-012 cerrada en sentido
                      opuesto. Coordinación por sistema reinstaurada en
                      §1.3.2, §1.3.3, §1.4, RN-59. RF-TAS-04 y RF-TAS-05
                      desbloqueados. Sucede a 1.9.9, que queda SUPERSEDED.

                      1.9.9 · 13-ago-2026 · Actualiza §2 (Interfaz
                      Tasador) contra el diseño de referencia
                      `Imagenes_IF_Tasador_v4.pdf`, que pasa a ser la
                      fuente de verdad visual de IF-03 y sucede a
                      `Imagenes_IF_Tasador_v3.docx`. Agrega RF-TAS-11 a
                      RF-TAS-22 y modifica RF-TAS-01 a RF-TAS-10 y RF-12.
                      Toca §2 completa, §13 (RN-54) y §14. Registra las
                      inconsistencias CI-013 a CI-021 en
                      `docs/CODE_INCONSISTENCIES.md` y las ambigüedades
                      A-12 a A-17 en
                      `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`.
                      Deja declarada la inconsistencia entre §1 y §2
                      sobre la coordinación de visita (CI-012), que no se
                      resuelve en esta versión. Sucede a 1.9.8, que queda
                      SUPERSEDED.

                      1.9.7 · 07-ago-2026 · Incorpora los SLA
                      operacionales del negocio como sección normativa
                      transversal (§5.2, RF-53): horario hábil de
                      aplicación, definición operativa de la recepción del
                      correo, actores y responsabilidad sobre el reloj,
                      matriz de SLA del flujo principal en siete etapas,
                      flujo de reproceso con SLA propio y regla "reproceso
                      limpio", entregable por perfil de cliente, capacidad
                      de visación, métricas y alertas, y reportes de
                      cumplimiento. Fuente: VProperty_SLA_Negocio_v1.1.
                      Registra la decisión abierta D-16 (perfiles de
                      entregable vs. PDF único de §7). Toca §1.2, §1.9
                      (FUT-EJ-08), §1.9.1, §3.2, §3.5.5, §5 (intro),
                      §5.2, §13 (RN-04, RN-53, RN-54, RN-55), §14 y §15.
                      Sucede a 1.9.6, que queda SUPERSEDED.

                      1.9.6 · 06-ago-2026 · Reestructuración de la ruta
                      Dropbox para adjuntos. Introduce el nivel Unidad
                      (TX_Unidades.subtipo), renombra la raíz a
                      /Test_ValueProperty/, cambia el prefijo del año a
                      INFORMES_{AAAA} (America/Santiago) e invierte el
                      orden Año → Cliente. Incorpora carpetas hermanas
                      `informe/`, `comun/` y `_ingreso/` para los casos
                      que no encajan en el árbol por unidad. La regla de
                      normalización de {Cliente} y de {Unidad} queda
                      declarada explícitamente (§8.1, §8.5). La auditoría
                      de RF-51 queda acotada por fecha de corte. Toca §8
                      (intro, §8.1, §8.2, §8.3, §8.5), §7.1 paso 4,
                      RF-39, §1.5.3, §2.5.2, §3.5.2 y el glosario. Sucede
                      a 1.9.5, que queda SUPERSEDED.

                      1.9.5 · 02-ago-2026 · Precisión sobre invariante
                      único-por-tipo en checklist de documentos,
                      idempotencia real por hash+solicitud en
                      TX_Adjuntos, y flujo de reemplazo backend-driven
                      con confirmación UI. Toca §1.5.1.1, RF-51 y §8.4
                      (nuevos puntos f y g), y acota el soft-delete de
                      §8.4 (d) para los dos únicos flujos de borrado
                      duro del checklist. Consolidación documental del
                      mismo día: los contratos y blueprints conceptuales
                      de SC-Adjuntos-Upload v1.2 y SC-Adjuntos-Delete se
                      integran en el cuerpo oficial (§8.6 nueva, con
                      RF-52); precisión en §8.2 sobre idempotencia por
                      (hash_md5 + solicitud) y respuesta reused; se
                      corrige la env var real MAKE_WEBHOOK_URL_ADJUNTOS
                      en §8.4 (h); se registra que el campo `activo` de
                      §8.2 nunca se creó en Airtable, lo que refuerza la
                      acotación al soft-delete de §8.4 (d); y se
                      establece la regla de fuente única de
                      especificación, con coincidencia obligatoria entre
                      el nombre del archivo y la versión del cuerpo.
                      Sucede a 1.9.4, que queda
                      SUPERSEDED y que aplicó las cinco correcciones
                      internas que v1.9.3 dejó pendientes sobre sí mismo
                      (§2.14): excepción acotada a RN-59 en §1.4, §1.9.1 y
                      §13; documentación del campo tipo_propiedad de
                      D_TipoDocumento —que ya existía, contra lo que
                      dice §2.12— y corrección de la lectura de la
                      columna cuándo en §4.2.1, con la divergencia de
                      dominio registrada como P-5; trigger de AT03
                      estado=capturada →
                      estado=visitada en §6.2; lectura de
                      TX_CoordinacionVisita en §1.3.2 y §1.3.3; y la cita
                      de Origen de Datos del Informe v1.0 → v1.1 en §2.8.
                      §2 no se modifica salvo la nota al pie de §2.14.
                      Sucede a 1.9.3, que queda SUPERSEDED y que había
                      incorporado §2 (Interfaz Tasador · RF-TAS-01 a
                      RF-TAS-10 · TX_CoordinacionVisita · máquina de
                      estados oficial). Hereda de 1.9.2: sincroniza los
                      listados de campos
                      de TX_Comparables (§tabla de secciones E2 y RF-12) con
                      el schema real de Airtable leído vía MCP el
                      23-jul-2026; `uf_m2` pasa a `uf_m2_construccion`.
                      Hereda de 1.9.1:
                      alinea la Especificación con lo
                      efectivamente implementado en la maqueta (v0.dev
                      integrada a `main`, 22-jul-2026): (1) §1.3.1 --- el
                      botón "Asignar Tasador" es visible sólo sin tasador
                      y desaparece al asignar; no existe botón "Reasignar
                      Tasador" ni flujo de reasignación formal; (2) §1.4/
                      RN-59 --- editable únicamente en estado creada vía
                      "Editar solicitud" (incluye poder cambiar el
                      tasador ya fijado); modo consulta cuando estado ≠
                      creada Y hay tasador asignado, no por una sola
                      condición; (3) §1.5.1 --- validación al crear con
                      doble superficie de error (toast resumido + Alert
                      destructivo con todos los campos, incluidos bloques
                      repetibles nombrados con precisión); N° de
                      operación duplicado es conflicto de negocio, no
                      error de formulario; (4) §1.6 --- elimina
                      Reasignación (antes §1.6.3) y el correo de
                      reasignación; sólo queda el correo de primera
                      asignación (§1.6.3 renumerada); (5) RN-44/RN-59
                      reescritas con el comportamiento exacto del botón y
                      del modo consulta. D-10 queda SUPERSEDED (§15). La
                      v1.9 original (Julio 2026) rediseñó IF-02 a partir
                      del levantamiento operativo con el cliente: wizard
                      de creación en tres fases, formulario de cuatro
                      secciones, N unidades por solicitud con origen y
                      respaldo de superficies, catálogo real de tipos de
                      documento. Se retira AT02 del alcance de IF-02 y
                      WhatsApp del canal de notificación al tasador.
                      Incorpora RN-44 a RN-59 y regulariza el índice de
                      reglas RN-38 a RN-43. Sucede a v1.8.2, que consolidó
                      el dominio D\_
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

### **Cambios v1.9.6 → v1.9.7**

Esta versión no altera el modelo de datos documental, el motor de cálculo
ni ninguna interfaz: incorpora los SLA operacionales del negocio, hasta
ahora sostenidos por acuerdo verbal y planilla, como contenido normativo
de la especificación. El aporte se concentra en §5.2, que pasa de ser la
parametrización del plazo agregado a ser la sección única donde se
declara el reloj del servicio: horario de cómputo, hito que lo inicia,
plazo por etapa, reproceso, entregable, capacidad, alertas y reportes. El
insumo que la origina es `VProperty_SLA_Negocio_v1.1`, consolidado con
las respuestas del cliente (Héctor) en dos sesiones de validación.

  -------------------------------------------------------------------------
  **Aspecto**         **v1.9.6 (anterior)**      **v1.9.7 (actual)**
  ------------------- -------------------------- --------------------------
  SLA del workflow    Sólo el SLA agregado por   Matriz de siete etapas con
                      par (cliente,              SLA ideal y máximo en
                      tipo_informe), en días     horas hábiles (§5.2.4 ·
                      (C_SLA · RN-04). Sin       RF-53). El SLA agregado de
                      plazos por etapa.          C_SLA se conserva y
                                                 convive con ella.

  Horario de cómputo  No declarado. RN-04        Lunes a viernes de 9:00 a
                      excluye feriados con       18:00, con feriados
                      WORKDAY, sin ventana       excluidos; el reloj se
                      horaria.                   pausa fuera de la ventana
                                                 (§5.2.1).

  Inicio del reloj    Implícito en la fecha de   Recepción = apertura del
                      solicitud.                 correo e ingreso al
                                                 sistema por Control y
                                                 Seguimiento, con acuse
                                                 formal al ejecutivo
                                                 (§5.2.2).

  Reproceso           RN-55 enunciada en una     Matriz R1-R3 y regla
                      línea; proceso documentado "reproceso limpio"
                      en §1.9.1 y diferido       completas (§5.2.5). La
                      (FUT-EJ-08).               implementación sigue
                                                 diferida.

  Entregable final    PDF único para todos los   Tres perfiles de
                      clientes (§3.5.5, §7).     entregable: PDF; PDF +
                                                 Excel de resumen; PDF con
                                                 hoja de resumen embebida
                                                 (§5.2.6).

  Capacidad de        No parametrizada.          20 informes/día por
  visación                                       visador, como parámetro
                                                 operativo de referencia
                                                 (§5.2.7).

  Métricas y alertas  Semáforo de bandeja        Timestamp por transición,
                      (RN-04).                   semáforo por etapa,
                                                 notificación al
                                                 responsable de área en
                                                 rojo y alerta de cierre de
                                                 jornada (§5.2.8, §5.2.9).

  Identificadores     52 RF, RN hasta RN-60.     Se agrega RF-53. Cero
                                                 renumeración.

  Decisiones abiertas D-01 a D-15.               Se agrega D-16: los tres
                                                 perfiles de entregable de
                                                 §5.2.6 contra el PDF
                                                 único que especifica §7,
                                                 pendiente de definición
                                                 con Héctor (§15).
  -------------------------------------------------------------------------

Alcance de implementación de v1.9.7. La sección declara el compromiso de
servicio completo, no su implementación. Los plazos por etapa, la ventana
horaria y el SLA de reproceso exigen campos que aún no existen en C_SLA y
en TX_Solicitudes, y la tabla TX_Reprocesos sigue sin crearse (§1.9.1 ·
FUT-EJ-08). La especificación se adelanta deliberadamente al schema para
que el equipo de datos tenga el destino antes de construir el camino.

### **Cambios v1.9.7 → v1.9.8**

Esta versión no altera el modelo de datos, el motor de cálculo ni el SLA:
documenta la **Interfaz Ejecutiva tal como quedó construida** al cablear
el Detalle de Solicitud contra datos reales, y fija tres decisiones de
producto que la maqueta v0.dev tenía sin definir. Todo el cambio se
concentra en §1. No se agregan RF ni RN; no se renumera nada.

  -------------------------------------------------------------------------
  **Aspecto**         **v1.9.7 (anterior)**      **v1.9.8 (actual)**
  ------------------- -------------------------- --------------------------
  Navegación          Tres entradas en la barra  §1.0 nueva. Consola y Cola
  principal           superior sin propósito     operativa operativas;
                      definido en la spec.       Expediente deshabilitada
                                                 con motivo y condición de
                                                 reactivación.

  Buscador y estado   No especificados.          §1.1. Buscador único
  de la bandeja                                  server-side por código,
                                                 RUT o dirección, y tabla
                                                 de los 12 parámetros de
                                                 URL que hacen la bandeja
                                                 enlazable.

  Indicador de        No especificado.           §1.2. Cifras reales de la
  cartera                                        cartera propia, con la
                                                 regla de que el número y
                                                 su enlace miden la misma
                                                 consulta.

  Bloque del motor    "Decisión del motor",      §1.3.2. "Decisión del
  en Datos            declaraba mostrar          motor **de reglas**", sin
                      "tasador y visador         tasador ni visador: AT01
                      asignados".                resuelve plantilla,
                                                 fórmulas y workflow, nunca
                                                 un profesional. Corrige
                                                 una contradicción con
                                                 §1.6 y §6.2.

  Alcance del         Enumeraba coordinación,    §1.3.3. Los tres quedan
  Historial           descargas y autor sin      fuera **por falta de
                      salvedad.                  origen de datos**, cada
                                                 uno con su causa; el resto
                                                 se cablea contra A_Eventos
                                                 y A_Cambios reales.

  Agrupación de       "La pestaña agrupa los     §1.3.4. La agrupación es
  Adjuntos            archivos por versión",     de TX_DocumentosGenerados;
                      sobre TX_Adjuntos.         TX_Adjuntos va como lista
                                                 plana. El valor en UF por
                                                 versión queda pendiente de
                                                 campo y de decisión de
                                                 negocio.

  Modo "documentos    Modo plenamente            §1.5.0. Deshabilitado
  adjuntos"           especificado y             temporalmente por
                      disponible.                dependencia de RF-09
                                                 (CI-002). El modo no se
                                                 retira de la spec ni del
                                                 código.

  Identificadores     52 RF, RN hasta RN-60,     Sin cambios. Cero RF, RN o
                      D-01 a D-16.               D nuevos.
  -------------------------------------------------------------------------

Divergencias registradas, no resueltas. La construcción de esta versión
levantó tres inconsistencias entre documentación y base real, abiertas
como **CI-010** (A_DecisionesMotor sin documentar en
`docs/schema-airtable.md`), **CI-011** (A_Cambios documentada con campos
que no existen) y **CI-012** (TX_CoordinacionVisita referenciada en §1.3.2,
§1.3.3, §2.3 y §2.12 pero inexistente en la base). CI-012 requiere
decisión de negocio: crear la tabla o retirarla de la especificación.

Reglas operativas destiladas. La construcción aportó cinco reglas nuevas
al repositorio —**RO-19** a **RO-23** en `docs/aprendizajes.md`—, sobre
separación cliente/servidor en módulos que leen Airtable, verificación de
campos Link poblados antes de filtrar, y reconciliación de UI optimista.
No son normativas de producto y por eso viven allí y no acá.

### **Cambios v1.9.8 → v1.9.9**

Esta versión no altera el modelo de datos, el motor de cálculo ni el SLA:
documenta la **Interfaz Tasador tal como quedó diseñada** en el insumo
`Imagenes_IF_Tasador_v4.pdf`, que sucede a `Imagenes_IF_Tasador_v3.docx`
como fuente de verdad visual de IF-03. Todo el cambio funcional se
concentra en §2; §13 y §14 se tocan sólo para no quedar desalineados con
lo que §2 agrega.

  -------------------------------------------------------------------------
  **Aspecto**         **v1.9.8 (anterior)**      **v1.9.9 (actual)**
  ------------------- -------------------------- --------------------------
  Fuente visual de    `Imagenes_IF_Tasador_v3.-   `Imagenes_IF_Tasador_v4.-
  IF-03               docx`, ausente del repo     pdf`, presente en
                      (A-02).                     `docs/_md/`. Sustituye a
                                                  la anterior en §2 y en la
                                                  tabla de trazabilidad.

  Cola del tasador    Cuatro chips y card con     §2.1. Tres chips (Todas ·
                      "código, estado,            Hoy · Por coordinar),
                      dirección, cliente y        card con Rol SII,
                      versión".                   producto y teléfono
                                                  accionable, y CTA
                                                  contextual de tres
                                                  variantes (RF-TAS-11).

  SLA del tasador     Fórmula propia sobre el     §2.2. Se alimenta del
                      plazo agregado en días.     control de SLA del
                                                  proyecto (RF-53 · §5.2.4),
                                                  etapas 2 y 5, que son las
                                                  del tasador. Divergencia
                                                  registrada como CI-021.

  Coordinación de     Dos botones directos, sin   §2.3. Registro del
  visita              catálogo de motivos.        resultado del contacto en
                                                  dos pasos, con catálogo
                                                  cerrado de motivos y
                                                  detalle mínimo
                                                  (RF-TAS-12), y contenido
                                                  mínimo de los correos a
                                                  la ejecutiva (RF-TAS-13).

  Formulario de       Siete secciones; sin fecha  §2.8. Ocho secciones A--H
  captura             real de visita.             (RF-TAS-16) y fecha real
                                                  de visita obligatoria
                                                  frente a la planificada
                                                  pre-llenada (RF-TAS-17).

  Preview del         Prosa, con fallback         §2.10. Ocho bloques
  informe             `window.print()` para el    numerados (RF-TAS-20),
                      PDF.                        descarga siempre por
                                                  Carbone con la plantilla
                                                  asignada (RF-TAS-21) y
                                                  acuse de envío explícito
                                                  (RF-TAS-22).

  Identificadores     RF-TAS-01 a RF-TAS-10.      Se agregan RF-TAS-11 a
                                                  RF-TAS-22. Cero RF, RN o
                                                  D globales nuevos; nada se
                                                  renumera.
  -------------------------------------------------------------------------

Divergencias registradas, no resueltas. El contraste entre §2 y el diseño
v4 levantó nueve inconsistencias, abiertas como **CI-013** a **CI-021** en
`docs/CODE_INCONSISTENCIES.md`, y seis ambigüedades que exigen decisión de
negocio, abiertas como **A-12** a **A-17** en
`docs/_sync_ifTasador_v1/gap/_ambiguedades.md`. Los RF que dependen de
ellas se emiten marcados como pendientes, nunca resueltos por criterio
propio.

Inconsistencia entre §1 y §2 — resuelta en v1.9.10. Entre v1.9.9 y esta
versión, §1.3.2, §1.3.3, §1.4 y RN-59 retiraban la coordinación por
sistema mientras §2.3 la conservaba, y el documento declaraba la
contradicción en lugar de disimularla. **CI-012 se cerró el 19-ago-2026 en
sentido positivo** —revisión de Héctor sobre el diseño v4, Pantalla 2,
puntos 1 a 4— y con ella se reinstaura la coordinación por sistema en las
cuatro secciones de §1. **El documento vuelve a ser consistente**: §1 y §2
describen lo mismo, y RF-TAS-04 y RF-TAS-05 dejan de estar marcados como
pendientes.

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

## **1.0 Navegación principal**

La barra superior ofrece tres entradas de navegación. Los tres nombres
provienen de la maqueta v0.dev y **no estaban definidos en ninguna
versión anterior de esta especificación**: hasta v1.9.7 eran enlaces
decorativos sin destino. Su propósito se fija acá.

  ---------------------------------------------------------------------------
  **Entrada**         **Destino**                    **Estado en v1.9.8**
  ------------------- ------------------------------ ------------------------
  Consola             La bandeja unificada de §1.1    Operativa. Es la única
                      con el detalle de §1.3, patrón  pantalla construida
                      P2 Lista + Detalle              de IF-02

  Cola operativa      La misma bandeja filtrada a lo  Operativa. Enlace
                      que espera acción de la         directo, sin pantalla
                      Ejecutiva: sin tasador          ni consulta propias
                      asignado, ordenado por
                      urgencia de SLA

  Expediente          ---                             **Deshabilitada**:
                                                      visible, no accionable,
                                                      con tooltip "No
                                                      disponible en esta
                                                      versión"
  ---------------------------------------------------------------------------

Sobre Cola operativa. §1.1 enumeraba "Por reasignar (\>48 h sin
actividad)" entre las vistas pre-construidas, pero v1.9 retiró el flujo
de reasignación (§1.6): esa vista se quedó sin acción que ofrecer. Lo que
conserva sentido operativo es el conjunto de solicitudes que aún no
tienen tasador, que es el que esta entrada abre. No introduce ruta,
consulta ni estado nuevos.

Sobre Expediente. Una vista de expediente por solicitud no está descrita
en ninguna sección de §1, y el detalle de §1.3 ya cubre el registro
completo con sus tres pestañas. Se deja visible y deshabilitada en vez de
ocultarla, para que la barra no contradiga al diseño de referencia
mientras el alcance no esté definido. Definirlo es trabajo de una versión
posterior.

El elemento activo de la barra se **calcula** desde la ruta y los
parámetros de la URL; no se fija en el código. Como Consola y Cola
operativa comparten ruta y se distinguen sólo por `vista`, la primera se
marca activa únicamente cuando la segunda no lo está: de lo contrario se
encenderían ambas a la vez.

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

Buscador global (v1.9.8). Un único campo de búsqueda, ubicado en la barra
superior, que filtra por código VP-AAAA-NNNN, RUT del comprador o
dirección. Es **server-side**: la consulta viaja como parámetro de URL y
se resuelve contra TX_Solicitudes; el cliente no filtra en memoria. Tiene
debounce de 300 ms, y la tecla Intro dispara sin esperarlo. Existe un
solo buscador en toda la interfaz.

Filtros y estado en la URL (v1.9.8). Vista, filtros, orden, página,
búsqueda y solicitud seleccionada se reflejan en la barra de direcciones,
de modo que cualquier estado de la bandeja es enlazable y el
retroceso/avance del navegador lo restaura. Todos se resuelven
server-side:

  ---------------------------------------------------------------------------
  **Parámetro**       **Valores**                    **Significado**
  ------------------- ------------------------------ ------------------------
  vista               mi_cartera · sla_riesgo ·       Pestaña de la bandeja
                      por_asignar · aprobadas ·
                      todas

  q                   texto libre                    Código VP, RUT del
                                                     comprador o dirección

  cliente             nombre de M_Clientes           Cliente institucional

  tasador             nombre, o sin_asignar          Tasador asignado

  estado              enum de estado                 Estado de la solicitud

  prioridad           normal · urgente · crítico     Prioridad

  sla                 verde · ambar · rojo           Semáforo **agregado**
                                                     en días (RF-08 · RN-04)

  sla_etapa           ambar · rojo                   Semáforo **por etapa**
                                                     del workflow (RF-53 ·
                                                     §5.2.4)

  desde · hasta       AAAA-MM-DD                     Rango de fecha de
                                                     solicitud

  orden               fecha_solicitud_desc ·         Criterio de orden
                      sla_desc · sla_asc ·
                      prioridad

  page                entero ≥ 1                     Página (20 por página)

  solicitud           record ID                      Detalle preseleccionado
  ---------------------------------------------------------------------------

`sla` y `sla_etapa` son los dos relojes de §5.2 y **no se sustituyen**:
conviven como filtros independientes y la bandeja los ofrece por
separado.

## **1.2 Vista de SLA por Solicitud**

Semáforo verde/ámbar/rojo calculado por fórmula Airtable a partir de
dias_desde_solicitud vs sla_aplicable (C_SLA). El semáforo se debe poder
ordenar y filtrar; los tres umbrales son configurables en C_SLA sin
tocar código. Regla activa RN-04 (cálculo del SLA aplicable con WORKDAY
excluyendo H_Feriados).

Este semáforo refleja el plazo agregado de la solicitud. El plazo por
etapa del workflow —las siete etapas entre la recepción del correo y el
envío del informe visado, con su propio semáforo y sus propias alertas—
se especifica en §5.2.4 (RF-53) y se computa sobre la ventana hábil de
§5.2.1. Ambas lecturas conviven en la bandeja y son independientes.

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

Indicador de cartera (v1.9.8). La barra superior muestra de forma
permanente "En tu cartera: X activas · Y en SLA rojo", con cifras reales
de la cartera de la Ejecutiva conectada —no del total de la operación—.
El número en rojo es un enlace que abre la bandeja ya filtrada por esa
misma condición.

La regla que gobierna el indicador es que **el número y su destino miden
la misma consulta**. Y se cuenta como la cartera propia cruzada con el
semáforo agregado en rojo, y el enlace lleva exactamente a esa
combinación (`vista=mi_cartera` + `sla=rojo`). Enlazar en cambio a la
pestaña global "SLA en riesgo" —que no filtra por cartera propia y además
incluye el ámbar— haría que la Ejecutiva leyera una cifra y aterrizara en
una lista distinta, que es el modo de fallo que esta regla evita.

Con Y = 0 no se enlaza nada: el destino sería una lista vacía. El cero se
muestra sin acción, que además es la lectura correcta —no hay nada
vencido—. Mientras las cifras no han llegado no se pinta el indicador: un
"0 activas · 0 en SLA rojo" provisional es una afirmación falsa sobre la
carga de trabajo, y en el caso del rojo es justo la que haría bajar la
guardia.

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

Dos botones, con reglas de visibilidad distintas cada uno.

  ---------------------------------------------------------------------------
  **Botón**               **Comportamiento**
  ----------------------- ---------------------------------------------------
  Asignar Tasador         Visible **únicamente** mientras la solicitud no
                          tiene tasador asignado y su estado lo permite (no
                          cancelada, no cerrada). Abre el diálogo descrito en
                          §1.6, que exige los tres datos mínimos de RN-44 y
                          confirmación explícita. Al confirmar, el botón
                          **desaparece** de la barra --- no existe botón
                          "Reasignar Tasador" ni flujo de reasignación
                          formal. Modificar un tasador ya asignado se hace
                          desde "Editar solicitud" (§1.4), disponible
                          mientras el estado siga siendo creada.

  Documentos y Adjuntos   Siempre visible desde que la solicitud existe.
                          Abre un sheet lateral con el checklist de
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

  Decisión del motor  Regla ganadora, motivo de la        A_DecisionesMotor
  de reglas           elección y candidatas
                      descartadas. Resultado aplicado:
                      plantilla, fórmulas y flujo de
                      trabajo. No incluye tasador ni
                      visador (§1.6 · §6.2)
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

Bloque Coordinación — repuesto en v1.9.10. El bloque existió entre v1.9.4
y v1.9.8, se retiró en v1.9.9 por CI-012 y **vuelve en v1.9.10**: el cierre
de CI-012 del 19-ago-2026 reinstaura la coordinación por sistema. Muestra
el **último intento registrado** en TX_CoordinacionVisita —desenlace
(confirmada / rechazada), fecha de respuesta, fecha de visita acordada y
nota, o motivo y detalle si fue devuelta— dentro del bloque Contactos de
visita o como sub-bloque propio. Es la realización en la pestaña Datos de
lo que el punto 4 de Pantalla 2 del diseño v4 exige: que la ejecutiva vea
en su UI las respuestas del tasador. **La ejecutiva lee, no edita**: no hay
control de escritura de coordinación en IF-02. El reloj de la etapa 2 de
§5.2.4 sigue midiendo la actividad, y ahora además tiene quién lo cierre
(§5.2.4 · RF-TAS-03).

### **1.3.3 Pestaña Historial**

Timeline único que renderiza los eventos cronológicos de A_Eventos y los
cambios auditados de A_Cambios, e incorpora: el email de asignación
enviado al tasador (asunto, destinatario y fecha, expandible al cuerpo
completo), la confirmación de asignación con su timestamp y autor, las
ediciones registradas mientras la solicitud estuvo en estado creada
(RN-59), **los eventos de coordinación de la visita** y las cargas y
descargas de documentos registradas en TX_Adjuntos. No existe email de
reasignación --- v1.9 no tiene flujo de reasignación formal (§1.6).

Eventos de coordinación — repuestos en v1.9.10. Se retiraron en v1.9.9 por
CI-012 y vuelven con su cierre positivo del 19-ago-2026. Cada fila de
TX_CoordinacionVisita genera un evento en el timeline: coordinación
confirmada (con la fecha de visita acordada y la nota del tasador) o
devuelta a ejecutiva (con el motivo del catálogo y el detalle). Junto con
el bloque de §1.3.2, son los dos puntos donde la ejecutiva ve las
respuestas del tasador, según el punto 4 de Pantalla 2 del diseño v4.

Alcance implementado (v1.9.8, revisado en v1.9.9). El timeline se cablea
contra A_Eventos y A_Cambios reales; las dos tablas se referencian de
forma distinta y ambas hacen falta: A_Eventos por el campo Link —que
dentro de una fórmula se evalúa contra el código de la solicitud, no
contra el record ID— y A_Cambios por su par registro_id + tabla_origen,
porque esa tabla
audita varias entidades y no tiene Link a la solicitud. Dos contenidos
que esta sección enumera **quedan fuera por falta de origen de datos, no
por decisión de alcance**:

- **Descargas de documentos**: no se registran en ninguna tabla. Las
  cargas sí llegan al timeline como eventos de A_Eventos.
- **Autor del evento**: A_Eventos.actor_nombre está vacío en el 100% de
  las filas y actor guarda el clerk_user_id crudo. Mostrar un
  identificador técnico incumpliría §6.1, así que el autor se omite
  mientras los escenarios Make no pueblen actor_nombre.

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

Precisión v1.9.8 sobre qué se agrupa. La agrupación por versión recae
sobre **TX_DocumentosGenerados**, que es donde el pipeline PDF (E1/E2/E3)
registra cada informe emitido con su version_doc, su motivo_regeneracion
y su marca es_vigente. **No recae sobre TX_Adjuntos**, que no tiene campo
de versión: sus filas son antecedentes *de entrada* —certificados,
planos, escrituras— que no pertenecen a ninguna versión del informe.
Agruparlos exigiría inventar esa pertenencia. La pestaña presenta por
tanto dos secciones: "Documentos de la solicitud", lista plana de
TX_Adjuntos con su estado de extracción, y "Versiones del informe",
alimentada por TX_DocumentosGenerados y con estado vacío explícito
mientras el pipeline no haya generado nada para esa solicitud.

El **valor en UF por versión** queda pendiente. TX_DocumentosGenerados no
tiene columna que lo guarde, y el valor disponible en TX_Solicitudes y
TX_Calculos es el **actual**: mostrarlo junto a una versión emitida
semanas antes afirmaría algo falso, que es lo contrario de lo que RN-56
persigue. Recuperarlo exige un campo nuevo en esa tabla, con decisión de
negocio previa.

## **1.4 Modificación de detalles**

Editable únicamente en estado creada. El botón "Editar solicitud"
aparece sólo en ese estado. Mientras la solicitud esté en creada, la
Ejecutiva puede modificar todos los datos —Origen, Propiedad, Vendedor,
Unidades, Personas de la operación, Producto, Contactos de visita y
adjuntos— e incluso cambiar el tasador ya fijado, sin que eso dispare
por sí solo la transición de estado: la transición sólo ocurre al
confirmar explícitamente "Asignar Tasador" (§1.6). Cuando el estado deja
de ser creada y la solicitud tiene tasador asignado, todos los datos
quedan en modo consulta (RN-59) — no existe ningún flujo de
reasignación ni edición posterior; ambas condiciones (estado ≠ creada Y
tasador asignado) deben cumplirse para bloquear, no una sola.

**Excepción acotada a RN-59 — repuesta en v1.9.10.** Rigió entre v1.9.4 y
v1.9.8, se retiró en v1.9.9 al dar por fuera de alcance la coordinación por
sistema, y **vuelve a estar vigente** con el cierre positivo de CI-012 del
19-ago-2026. Su enunciado es el original, sin cambios: **TX_ContactosVisita
es editable en estado asignada exclusivamente mientras
coordinacion_vigente = rechazada**, para que la Ejecutiva pueda corregir un
teléfono equivocado y habilitar el segundo intento de coordinación. La
excepción cubre **sólo contactos de visita**: cliente, propiedad, RUT y
datos financieros siguen bloqueados, y toda edición se audita en A_Cambios
con before/after, autor y timestamp. Su condición de activación vuelve a
existir porque vuelve a existir el campo que la deriva
(coordinacion_vigente, sobre TX_CoordinacionVisita). Es la vía sin la cual
RF-TAS-04 no es implementable.

Esta regla sustituye a la de v1.8.2, que bloqueaba sólo los campos
críticos (cliente, propiedad, RUT) en estados posteriores a creada o
requiere_atencion, y también sustituye a la versión v1.9 que hacía de la
reasignación la única vía de corrección post-asignación. El motivo del
cambio es operativo: la solicitud llega incompleta y se completa por
partes durante horas o días, de modo que el hito que separa la
preparación de la producción no es la asignación en sí sino la salida
del estado creada.

La edición es inline sobre campos no-cálculo, disponible sólo dentro de
"Editar solicitud". Toda modificación queda auditada en A_Cambios con
before/after, autor (email del ejecutivo autenticado con Clerk) y
timestamp. Al guardar: se actualizan los datos, se registra un evento en
el historial ("Datos de la solicitud modificados"), se confirma con
toast y el formulario vuelve a modo consulta si el estado ya no es
creada, o queda editable si sigue siéndolo. Los campos en modo consulta
muestran tooltip explicativo con el motivo del bloqueo (RN-59) — ya no
hay acceso directo a "Reasignar Tasador" porque ese botón no existe.

  ---------------------------------------------------------------------------
  **RN-59**           **Modo consulta activado por estado y tasador
                      asignado**
  ------------------- -------------------------------------------------------
  **Precondición**    Existe una solicitud en IF-02.

  **Acción**          El sistema evalúa dos condiciones cada vez que se abre
                      el detalle: (1) el estado de la solicitud es distinto
                      de creada, y (2) la solicitud tiene tasador asignado.
                      El botón "Editar solicitud" sólo se muestra en estado
                      creada. Mientras el estado sea creada, todos los
                      campos son editables desde "Editar solicitud" —
                      incluido el tasador ya fijado— y cada cambio se audita
                      en A_Cambios y en el historial ("Datos de la solicitud
                      modificados"). **RN-59 admite una única excepción
                      acotada, repuesta en v1.9.10**: TX_ContactosVisita
                      es editable en estado asignada exclusivamente
                      mientras coordinacion_vigente = rechazada, y sólo
                      sobre contactos de visita. Rigió entre v1.9.4 y
                      v1.9.8, se retiró en v1.9.9 y vuelve con el cierre
                      positivo de CI-012 (19-ago-2026), que devuelve al
                      modelo el campo del que depende.

  **Postcondición**   El modo consulta (solo lectura) se activa únicamente
                      cuando **ambas** condiciones se cumplen a la vez:
                      estado ≠ creada Y tasador asignado. No depende de una
                      sola de las dos — una solicitud sin tasador permanece
                      editable aunque su estado ya no sea creada, y una
                      solicitud con tasador pero todavía en creada sigue
                      siendo editable. No existe ninguna vía de reasignación
                      ni edición posterior al modo consulta, **salvo
                      la excepción acotada de contactos de visita**: el
                      bloqueo alcanza a todos los bloques del formulario
                      excepto TX_ContactosVisita cuando
                      coordinacion_vigente = rechazada, caso en que esos
                      contactos —y sólo ellos— vuelven a ser editables
                      para habilitar el segundo intento (§2.3 ·
                      RF-TAS-04).

  **Trazabilidad**    Definición del cliente en el levantamiento operativo
                      v1.9. Sustituye a la regla de bloqueo por campos
                      críticos vigente hasta v1.8.2 y a la versión previa de
                      v1.9 que ataba el bloqueo solo a la confirmación de
                      asignación. La excepción acotada incorporada en
                      v1.9.4 se retiró en v1.9.9 y **se repone en
                      v1.9.10** con el cierre positivo de CI-012
                      (19-ago-2026 · revisión Héctor diseño v4, Pantalla 2
                      puntos 1-4); RN-59 no se renumera ni se sustituye
                      por una regla nueva en ninguno de los dos
                      movimientos. Ver §1.3.1, §1.4 y §1.6.
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

Deshabilitación temporal del modo "En base a documentos adjuntos"
(v1.9.8). La opción se muestra en la Fase 1 pero **no es seleccionable**:
aparece atenuada, no responde al clic y expone el tooltip "No disponible
en esta versión". "Manual" queda como único modo operativo.

El motivo es de dependencia, no de diseño: el modo requiere la
extracción documental con Claude API (§4), cuyo escenario Make no está
provisionado y cuyo disparador desde Airtable falla hoy al invocar el
webhook (CI-002 abierta). Ofrecer el modo sin extracción llevaría a la
Ejecutiva a subir documentos y encontrarse un formulario en blanco.

La deshabilitación es de superficie: el código del modo —zona de carga,
marca visual "extraído", sugerencia asistida de Nuevo/Usado y
confirmación de continuar sin documentos— **se conserva íntegro**. La
condición de reactivación es una sola: que RF-09 quede operativo end to
end y CI-002 cerrada. Nada de lo descrito arriba en esta sección se
retira de la especificación.

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

**Validación al intentar crear (doble superficie de error).** Si algún
dato impide crear la solicitud, ésta no se crea y el sistema informa en
dos superficies simultáneas:

1. Toast: encabezado con el número de campos con problema, detalle de
   los primeros y un contador "+N más" si excede el espacio visible.
2. Alert destructivo al inicio del formulario: lista **todos** los
   campos con problema, cada uno con su etiqueta legible y el motivo
   exacto del error, nombrando con precisión los bloques repetibles
   afectados —por ejemplo "Unidad 2 · Superficie construida: …" o
   "Contacto 1 · Teléfono: …", nunca un mensaje genérico agregado por
   sección.

El N° de operación cliente duplicado es un caso aparte: no es un error
de formato sino un conflicto de negocio (ya existe otra solicitud con
ese número). Cuando ocurre, el campo se marca con `setError` y el
motivo específico se informa igual en las dos superficies de arriba.

### **1.5.1.1 Documentos requeridos (checklist)**

El checklist deja de vivir en el formulario de creación y pasa al botón
Documentos y Adjuntos del panel de detalle (§1.3.1). El sheet lateral
que abre ese botón tiene dos bloques: el checklist de documentos
requeridos, alimentado por el catálogo D_TipoDocumento (§4.2.1), y la
zona de carga reutilizable (§1.5.1.2), que sube directo a Dropbox y
registra en TX_Adjuntos. Está disponible en cualquier momento después de
crear la solicitud y en cualquier orden respecto de la asignación del
tasador.

La lista se construye leyendo D_TipoDocumento (§4.2.1) filtrado por el
`tipo_propiedad` de la solicitud —de modo que la Ejecutiva sólo ve los
tipos aplicables al inmueble que está gestionando— y se presenta
**ordenada alfabéticamente** por nombre del tipo de documento. El orden
es alfabético y no por momento de llegada ni por criticidad: es el único
criterio estable cuando el catálogo crece, y evita que la posición de una
fila cambie al agregarse tipos nuevos.

Cada fila expone el tipo de documento, la entidad emisora y la vigencia
por defecto. La lógica de marcado se conserva sin cambios: la solicitud
puede crearse sin adjuntar documentos; sólo cuando el usuario marca
explícitamente un documento del checklist, el sistema exige el archivo
correspondiente.

**Invariante de único archivo por tipo (v1.9.5).** Para cada par
(solicitud, tipo_documento) existe a lo sumo **un** adjunto en
TX_Adjuntos. El checklist no es un repositorio acumulativo: cada fila
representa un documento, no una carpeta de versiones. La consecuencia es
que subir un archivo a un tipo que ya lo tiene no agrega, sino que
sustituye.

De ese invariante se derivan tres comportamientos de subida, y sólo tres:

1. **Tipo sin archivo previo → alta normal.** El binario va a Dropbox y
   se indexa una fila nueva en TX_Adjuntos.
2. **Tipo con archivo previo, mismo binario (mismo `hash_md5`) →
   reutilización.** El sistema reconoce el hash contra el par
   (hash_md5, solicitud) y no crea fila ni sube archivo: devuelve el
   adjunto existente. Es la garantía de idempotencia: reintentar una
   subida tras un timeout de red nunca duplica. No requiere confirmación
   del usuario porque el estado final es idéntico al inicial.
3. **Tipo con archivo previo, binario distinto (`hash_md5` distinto) →
   reemplazo.** El adjunto anterior se elimina —binario en Dropbox y
   fila en TX_Adjuntos— y el nuevo ocupa su lugar. Por ser destructivo e
   irreversible, exige **confirmación explícita** del usuario mediante
   AlertDialog previo a la subida, que nombra el archivo que se va a
   perder.

La detección del caso —alta, reutilización o reemplazo— es
responsabilidad del **backend**, no del cliente. La interfaz no compara
hashes ni consulta si existe un adjunto previo para decidir qué llamada
hacer: envía siempre la misma petición de subida, y el escenario de
integración resuelve cuál de los tres caminos corresponde (§8.4 f y g).
El cliente es responsable únicamente de la UX de confirmación. Esto
mantiene el principio rector de la consola: la UI muestra y captura,
nunca decide.

**Desmarcar es distinto de reemplazar.** Si el usuario desmarca un
documento que ya tenía archivo, se abre un AlertDialog de confirmación
—distinto del anterior— y, al confirmar, el adjunto se elimina sin
sustituto: el tipo vuelve a quedar vacío en el checklist. El diálogo de
reemplazo advierte que un archivo cede su lugar a otro; el de desmarcado
advierte que un archivo desaparece y nada ocupa su lugar. Son dos flujos
con dos confirmaciones y dos consecuencias, y no deben presentarse con el
mismo texto.

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

Resolución del destino desde IF-02 (v1.9.6). El segmento `{Unidad}` del
path sale de la unidad vinculada en `TX_Adjuntos.unidad`, y los tres
casos en que no hay una unidad única que resuelva el destino tienen
carpeta propia al nivel de la solicitud:

- **Fase 1 del wizard (§1.5.0) e IF-01**: las unidades todavía no
  existen —de hecho la extracción de esos mismos documentos es lo que las
  crea (§1.5.2)—, así que el archivo va a `_ingreso/` y **se queda ahí de
  forma permanente**. No se reubica cuando después se declaran las
  unidades: mover el binario invalidaría el `url_dropbox` ya persistido en
  la fila de `TX_Adjuntos`, que es la referencia que la UI y los correos
  ya entregaron.
- **Documento que cubre varias unidades** (una escritura de departamento
  + estacionamiento + bodega): va a `comun/`, como **un solo binario** con
  N links en `TX_Adjuntos.unidad`. Subir una copia por unidad no es
  alternativa: `SC-Adjuntos-Upload` es idempotente por
  (`hash_md5`, solicitud) y ante el mismo hash responde `reused: true` sin
  volver a subir (§8.6), de modo que las copias por unidad simplemente no
  se producirían.
- **PDF del informe** generado por SC09: va a `informe/` (§7.1 paso 4).

En el resto de los casos —el flujo normal del checklist documental de
§1.5.1.1, con la solicitud ya con unidades declaradas— el destino es la
carpeta de la unidad correspondiente.

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

## **1.6 Asignación de Tasador**

Un flujo único y no repetible, accesible desde el botón "Asignar
Tasador" de la barra de acciones (§1.3.1), visible sólo mientras la
solicitud no tiene tasador. La asignación es siempre manual y siempre de
la Ejecutiva: el sistema ordena, informa y advierte, pero no decide. No
existe flujo de reasignación formal en v1.9 — si la solicitud sigue en
estado creada, cambiar el tasador se hace desde "Editar solicitud"
(§1.4), no reabriendo este diálogo.

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
  **RN-44**           **Botón "Asignar Tasador": visibilidad, datos mínimos
                      y efecto**
  ------------------- -------------------------------------------------------
  **Precondición**    Una solicitud existe en IF-02.

  **Acción**          El botón "Asignar Tasador" **sólo se muestra** cuando
                      la solicitud no tiene tasador asignado y su estado lo
                      permite (no cancelada, no cerrada). El sistema
                      verifica que `datosMinimosFaltantes` esté vacío: en
                      particular, dirección de la propiedad, al menos un
                      contacto de visita con teléfono, y rol SII (admite la
                      marca "en trámite" únicamente cuando el tipo de
                      propiedad es Nuevo). Si falta algo, el botón se
                      deshabilita con tooltip que enumera exactamente qué
                      falta.

  **Postcondición**   Al confirmar: se fija el tasador, el estado transiciona
                      de creada a asignada, se registra `fecha_asignacion`,
                      se marca el correo de asignación como enviado, y se
                      agregan dos eventos al historial (correo de asignación
                      + asignación manual). El botón **desaparece** de la
                      barra de acciones — no vuelve a mostrarse ni como
                      "Reasignar Tasador" ni en ninguna otra forma. Ninguna
                      solicitud sale al tasador con datos mínimos
                      incompletos; la regla no condiciona la creación, sólo
                      la asignación (§1.5.1).

  **Trazabilidad**    Levantamiento operativo v1.9. Ver §1.5.1 (captura),
                      §1.6.2 (diálogo) y §1.4/RN-59 (edición posterior vía
                      "Editar solicitud", no vía reasignación).
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

El campo motivo es opcional. Antes de guardar, el sistema exige
confirmación explícita en un diálogo que enuncia las consecuencias: la
solicitud pasará a estado asignada, se registrará la fecha y hora de
asignación y los datos quedarán en modo consulta (salvo que el estado
siga siendo creada, en cuyo caso "Editar solicitud" sigue disponible).
Dos botones: Confirmar asignación y Cancelar.

Al confirmar se ejecutan de forma atómica los cuatro pasos de RN-44:
registro de `fecha_asignacion` con hora de servidor, cambio de estado a
asignada, disparo de SC13 con la plantilla `email_asignacion_tasador`
(§1.6.3) y desaparición del botón "Asignar Tasador" de la barra de
acciones. A_Eventos registra evento_tipo='asignacion_manual' con autor,
tasador, motivo y timestamp; el panel de detalle se refresca y aparece
un toast de éxito.

No existe ningún flujo posterior de reasignación: si la asignación
resultó equivocada, la corrección se hace desde "Editar solicitud"
mientras el estado siga siendo creada (§1.4 · RN-59); fuera de esa
ventana, la solicitud queda en modo consulta y el dato de tasador ya no
se modifica desde IF-02.

Nota v0 · la Ejecutiva no reasigna Visador desde la barra de acciones:
el dato del visador se conserva visible en la pestaña Datos del panel de
detalle y su reasignación es responsabilidad del rol
Visador/Administrador desde su propia consola.

  -------------------------------------------------------------------------
  **RF-06**         **Asignación manual de tasador**
  ----------------- -------------------------------------------------------
  **Descripción**   La ejecutiva asigna el tasador desde un botón único,
                    visible sólo sin tasador asignado, que desaparece al
                    confirmar. Exige los tres datos mínimos de RN-44 y
                    confirmación explícita; el motivo es opcional. No
                    existe reasignación formal — corregir el tasador
                    mientras la solicitud siga en creada se hace desde
                    "Editar solicitud" (§1.4), no desde este flujo.

  **Criterio de     El sistema impide asignar si falta cualquiera de los
  aceptación**      tres datos mínimos. La asignación aparece en A_Eventos
                    en menos de un segundo desde su confirmación, la
                    notificación por correo al tasador sale en el mismo
                    acto, y el botón "Asignar Tasador" desaparece de la
                    barra de acciones inmediatamente después.
  -------------------------------------------------------------------------

### **1.6.3 Correo de asignación al tasador (SC13)**

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
  La Ejecutiva confirma la asignación (única,  Automático
  RF-06)

  La Ejecutiva presiona Reenviar en el bloque  Manual; queda registrado en
  Asignación (§1.3.2)                          A_Eventos
  ---------------------------------------------------------------------------

No hay trigger de reasignación --- v1.9 no tiene ese flujo (§1.6).

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
                      posterior sobre esa solicitud —el reenvío manual— se
                      emite dentro del mismo hilo. No se admite agrupar dos
                      o más tasaciones en un mismo correo.

  **Postcondición**   Las respuestas del tasador (fecha de visita, problemas
                      de contacto, informe) y las del cliente quedan
                      asociadas de forma inequívoca a una sola solicitud, y
                      son recuperables desde la pestaña Historial (§1.3.3).

  **Trazabilidad**    Regla operativa firme del negocio, levantamiento v1.9.
                      Ver §1.6.3 y §5.3.
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
                                  asignación         tasador con la plantilla
                                  (única, §1.6),     email_asignacion_tasador.
                                  reenvío manual,    Destinatarios en
                                  cambio de          C_NotificacionesConfig.
                                  prioridad, pausa   No hay trigger de
                                                     reasignación (sin ese
                                                     flujo en v1.9).
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
del diálogo "Asignar Tasador" (v1.9: sin flujo de reasignación),
next-themes requerido por sonner. Formularios y validación:
react-hook-form 7.80 + \@hookform/resolvers 5.4 + zod 4 (sheet Nueva
solicitud interna, diálogo de asignación y formulario de Editar
solicitud).
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
              post-entrega                            TX_Reprocesos y
                                                      catálogo cerrado de
                                                      motivos. El SLA
                                                      propio ya está
                                                      especificado en
                                                      §5.2.5 (RN-55).

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

*Actualización v1.9.4.* FUT-EJ-06 deja de estar diferido en su parte
estructurada: §2.3 especifica la pantalla de coordinación de IF-03, el
tasador registra la fecha propuesta en TX_CoordinacionVisita (§2.12) y
la Ejecutiva la lee en las pestañas Datos e Historial de IF-02 (§1.3.2,
§1.3.3 · RF-TAS-05). Sigue diferida la respuesta automática al correo
original del cliente, que continúa siendo manual.

**Contacto no logrado (FUT-EJ-07).** Segundo desenlace posible de la
llamada: nadie contesta o el teléfono está malo. El tasador reporta el
problema por el hilo; la Ejecutiva pide al cliente validar o entregar un
teléfono nuevo y, al recibirlo, edita los contactos de la solicitud y
reenvía el correo al tasador. La edición de contactos ya está soportada
mientras la solicitud no esté asignada (§1.4); lo que se difiere es la
marca de bloqueo, su vista dedicada en la bandeja y la pausa automática
del reloj SLA (RN-54).

*Actualización v1.9.4.* El desenlace pasa a estar soportado de forma
estructurada: el tasador devuelve la coordinación con motivo obligatorio
desde §2.3 y la solicitud queda con coordinacion_vigente = rechazada. En
consecuencia, la frase anterior sobre la edición de contactos queda
matizada: además del estado creada, TX_ContactosVisita es editable en
estado asignada mientras la coordinación esté rechazada (excepción
acotada a RN-59 · §1.4). Editar un contacto reabre la pantalla del
tasador (RF-TAS-04), de modo que el reenvío manual del correo deja de
ser necesario. Siguen diferidas la marca de bloqueo por contacto no
logrado, su vista dedicada en la bandeja y la pausa automática del reloj
SLA (RN-54).

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
tarde (RN-55). La matriz completa del reproceso —R1 registro y acuse, R2
ejecución, R3 visación y envío— y la regla "reproceso limpio" con sus
cortes horarios se especifican en §5.2.5; aquí queda sólo el
levantamiento de motivos y frecuencia que la origina. En v1.9 se gestiona
fuera del sistema, en el hilo de correo original.

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
post-visita y SLA de reproceso en C_SLA. Desde v1.9.7 esos tres plazos
están especificados en §5.2.4 y §5.2.5, junto con la ventana hábil sobre
la que se calculan (§5.2.1): lo que sigue diferido es su parametrización
en C_SLA y los campos de timestamp por etapa que la sostienen, no su
definición.

# VProperty · IF-03 Interfaz Tasador · Requerimientos Funcionales de UI v2.0

**Fecha** — 13-ago-2026 *(v1.0 · 25-jul-2026)*
**Alcance** — Release v1.9 · IF-03 Tasador
**Origen** — Consolidación del `VProperty_ADR_IF_Tasador_v3_v2.md` reorganizada por requerimientos funcionales, siguiendo el patrón de presentación de la §1 (Interfaz Ejecutiva) del `VProperty_Especificacion_Proyecto_v1_9_2.md`. Desde v2.0, la **fuente de verdad visual** es `docs/_md/Imagenes_IF_Tasador_v4.pdf`: donde el texto de esta sección contradiga al diseño v4, manda el diseño y la divergencia queda registrada como CI en `docs/CODE_INCONSISTENCIES.md`.
**Estado** — Fuente única para el próximo prompt de v0.dev y para las tareas de schema, Make y frontend de IF-03.
**Equipo redactor** — Product Manager · UX/UI Lead · Enterprise Architect · Frontend Lead · Data Engineer

---

# 2. Interfaz Tasador

App móvil (PWA) para que el tasador coordine la visita, documente la captura en terreno y confirme el envío del informe generado. Materializa la Capacidad C-3 (captura de visita en terreno) y parte de la Capacidad C-7 (overrides al motor de cálculo). Corresponde a IF-03 del Blueprint de Interfaces (Tipo A · Next.js · Clerk · mobile-first, PWA). La descripción funcional que sigue refleja las siete pantallas del insumo `Imagenes_IF_Tasador_v4.pdf`, que desde v1.9.9 sucede a `Imagenes_IF_Tasador_v3.docx` como fuente de verdad visual; no se transcriben imágenes en el cuerpo del texto: sólo se especifica el comportamiento que reflejan.

**Contexto operacional.** El tasador nunca accede a Airtable directamente; toda operación transacciona vía API Route con validación server-side. Diseño mobile-first tolerante a conectividad intermitente.

**Alcance funcional v1.9.** Cuatro decisiones capitales atraviesan toda la sección:

1. **Sin ciclo de devolución visador ↔ tasador estructurado en la UI.** Se elimina la franja roja de card devuelta, el contador de tres re-visitas y la alerta de "último intento". El tasador conserva un botón "Rechazar" en el preview del informe cuya semántica cambia a "no envío este informe, sigo en borrador", persiste la observación y despliega un mensaje que dirige al visador por canal habitual (§2.10). La conversación tasador ↔ visador sigue ocurriendo por canales alternos al sistema.
2. **Coordinación de visita entra en alcance con modelo estructurado.** Se agrega la pantalla de coordinación (§2.3) con dos acciones (Confirmar / Devolver a ejecutiva), persistencia en `TX_CoordinacionVisita`, envío automático de correo en el mismo hilo (RN-52) reutilizando SC13, y visibilidad para la ejecutiva en su UI existente (pestañas Datos e Historial de IF-02, sin construir vista dedicada nueva).
3. **Vocabulario de estados según máquina oficial.** Estados backend: `creada → asignada → visitada → calculada → pdf_listo → aprobada → (pendiente_final?) → entregada → cerrada`. Se retira el estado `devuelta` y `capturada` (este último se reemplaza por `visitada`). El botón que dispara el cálculo se llama **"Calcular Tasación"** y sólo produce la transición `asignada → visitada`; el resto es automático.
4. **Coordinación mínima con RN-59.** `TX_ContactosVisita` es editable en estado `asignada` **exclusivamente** cuando `coordinacion_vigente = rechazada`, para habilitar el segundo intento de coordinación (§2.3). La excepción cubre sólo contactos de visita; cliente, propiedad, RUT y datos financieros siguen bloqueados.

**Herencias desde IF-02 (v1.9).** Se preservan las tres herencias ya establecidas en el spec §2: estado de conservación heredado con catálogo cerrado de seis valores (RN-49), superficies con origen y adjunto de respaldo (RN-45), y ampliaciones con marca de regularizable (RN-50).

**Fuera de alcance de v1.9 en IF-03.** La gestión de reprocesos post-entrega y la notificación por WhatsApp al tasador. La captura estructurada de la fecha de visita y el reporte de contacto no logrado **entran en alcance** en esta versión bajo el modelo de §2.3 (coordinación).

---

## 2.1 Vista de sus solicitudes (Pantalla 1 · Inicio del Tasador)

Cola personal filtrada por `clerk_user_id`: solicitudes asignadas al tasador en `TX_Solicitudes.tasador` con estado en `{asignada, visitada, calculada}`. Header sticky con logo VPROPERTY y nombre + avatar del usuario. Bajo el header, el título **"Mis tasaciones"** con el contador **"N en curso"**, la fila de chips de filtro y las cards de tasación (TasacionCard).

**Chips de filtro de la cola.** Son **tres**, mutuamente excluyentes, y el primero está activo por defecto:

- **Todas** — la cola completa del tasador. Es el chip por defecto.
- **Hoy** — la agenda del día: lo que el tasador debe resolver en la jornada en curso. Su composición exacta está pendiente de definición (**A-12**) y hasta cerrarla no se implementa.
- **Por coordinar** — solicitudes sin coordinación vigente, en estado `asignada` y con `now() - fecha_asignacion < 4h`, ordenadas por menor tiempo restante. El reloj de esta categoría se **detiene** cuando la coordinación queda rechazada (el tasador hizo su parte y la solicitud queda esperando a la ejecutiva), y la solicitud sale del chip.

El chip "SLA en riesgo" que enumeraban las versiones anteriores **no existe** en el diseño v4: el estado del SLA viaja en la propia card y no necesita una vista aparte (CI-019).

**Contenido de la card.** Cada card muestra, en este orden: código VP-AAAA-NNNN; badge de SLA con punto de color y etiqueta —"En plazo · 20h", "Por vencer · 5h", "Por coordinar · 3h", "Vencido"—; comuna · tipo de propiedad; dirección; Rol SII cuando la solicitud lo tiene; cliente institucional · producto; teléfono del contacto de prioridad 1 como enlace accionable (`tel:`); y fecha de visita cuando ya está coordinada. La card **no** muestra la versión del informe, que en esta pantalla no aporta decisión (CI-018).

**Llamada a la acción contextual.** La card cierra con un único botón, cuyo rótulo y estilo dependen de la situación de la solicitud: **"Coordinar visita"** en color de acento mientras falte coordinación; **"Abrir tasación"** en color primario una vez coordinada; y **"Ver coordinación"** deshabilitado, acompañado del badge **"Esperando contacto de ejecutiva"**, cuando la coordinación fue devuelta y la ejecutiva aún no actualiza los contactos. En este último caso la solicitud permanece visible en "Todas" para que el tasador no la pierda de vista.

**Representación del SLA.** El semáforo verde/ámbar/rojo y las horas restantes se toman del control de SLA del proyecto (§2.2), no de una aritmética propia de esta pantalla.

Cualquier intento de acceso a solicitudes ajenas devuelve 403 (validación server-side, no cliente).

| **RF-09** | **Acceso autenticado a sus solicitudes** |
|---|---|
| **Descripción** | El tasador inicia sesión con Clerk (Google o email) y accede únicamente a las solicitudes asignadas a su `clerk_user_id` en `TX_Solicitudes.tasador`. Cualquier intento de acceso a otra solicitud devuelve 403. |
| **Criterio de aceptación** | Pruebas con dos tasadores distintos confirman que ninguno puede listar ni abrir solicitudes ajenas. La validación se hace server-side en la API Route, no en el cliente. |

| **RF-TAS-01** | **Filtros de cola: Todas, Hoy y Por coordinar** |
|---|---|
| **Descripción** | El sistema muestra tres chips mutuamente excluyentes: "Todas" (cola completa, activo por defecto), "Hoy" (agenda del día · **pendiente de A-12**, no se implementa hasta cerrarla) y "Por coordinar" (sin coordinación vigente, estado `asignada` y `now() - fecha_asignacion < 4h`, ordenadas por menor tiempo restante). El reloj de "Por coordinar" se detiene si la coordinación queda rechazada y la solicitud sale del chip. No existe chip "SLA en riesgo". |
| **Criterio de aceptación** | Los tres chips filtran la misma cola sin recargar la ruta y el chip activo se refleja en la URL, de modo que volver desde el detalle lo reactiva. Una solicitud con coordinación rechazada desaparece del chip "Por coordinar" sin afectar su presencia en "Todas". El chip "Hoy" no se libera a producción mientras A-12 siga abierta. |

| **RF-TAS-02** | **SLA de la cola alimentado por el control de SLA del proyecto** |
|---|---|
| **Descripción** | El badge de SLA de cada card se alimenta del control de SLA del proyecto (RF-53 · §5.2.4), tomando las etapas cuyo responsable es el tasador —etapa 2 "Coordinación de visita" y etapa 5 "Visita y envío de informe"—, y no de una aritmética propia de IF-03. Muestra el color del semáforo verde/ámbar/rojo y una etiqueta con el tiempo restante en horas: "En plazo · Xh", "Por vencer · Xh", "Por coordinar · Xh" o "Vencido". |
| **Criterio de aceptación** | El color y las horas que muestra la card coinciden con los que el control de SLA calcula para la etapa vigente de esa solicitud, sobre la ventana hábil de §5.2.1. IF-03 no define umbrales propios ni recalcula el plazo: los consume. |

| **RF-TAS-11** | **Contenido y llamada a la acción de la card de la cola** |
|---|---|
| **Descripción** | Cada card muestra código VP-AAAA-NNNN, badge de SLA (RF-TAS-02), comuna · tipo de propiedad, dirección, Rol SII cuando existe, cliente institucional · producto, teléfono del contacto de prioridad 1 como enlace accionable y fecha de visita cuando ya está coordinada. Cierra con un único botón contextual: "Coordinar visita" (acento) si falta coordinación, "Abrir tasación" (primario) si ya está coordinada, o "Ver coordinación" deshabilitado con badge "Esperando contacto de ejecutiva" si la coordinación fue devuelta y los contactos no se han actualizado. |
| **Criterio de aceptación** | Las tres variantes del botón son excluyentes: ninguna card presenta dos a la vez. Pulsar el teléfono abre el marcador del dispositivo sin salir de la aplicación. Una solicitud sin Rol SII o sin fecha de visita omite esa línea en vez de mostrarla vacía. |

---

## 2.2 Vista de SLA por Solicitud

El tasador **reutiliza el control de SLA del proyecto**; IF-03 no define un reloj propio. La aritmética del SLA se especifica una sola vez, en §5 Parametrización de Reglas de Negocio, y allí conviven dos lecturas: el plazo **agregado** por par (cliente, tipo de informe) en días (RN-04 · `C_SLA`), y el plazo **por etapa** del workflow en horas hábiles (RF-53 · §5.2.4), que es el que gobierna el trabajo del tasador.

De las siete etapas de §5.2.4, dos tienen al tasador como responsable y son las que alimentan su bandeja: la **etapa 2** (Coordinación de visita · 4 h ideal, 6 h máximo, alineada con RN-53) y la **etapa 5** (Visita y envío de informe · 24 h ideal, 48 h máximo). El semáforo y las horas restantes que muestra la card (RF-TAS-02) se leen de la etapa vigente, sobre la ventana hábil de §5.2.1 y excluyendo feriados.

Hasta v1.9.8 esta sección derivaba las horas restantes del plazo agregado en días, con una fórmula propia (`horas_restantes`). Esa derivación **se retira**: mezclaba las dos lecturas de §5.2 y producía un número que ningún otro punto del sistema podía reproducir. La divergencia entre lo que este documento pedía y lo que el control de SLA calcula queda registrada como **CI-021**.

**CI-021 confirmada en uso (v1.9.13).** Las pruebas del cliente sobre el sistema, en agosto de 2026, reportan exactamente el síntoma que CI-021 anticipaba: al ingresar una solicitud, la interfaz muestra días —*"apareció que quedaban dos horas y dos días"*— cuando lo que corresponde a ese momento son las horas de la etapa 1. La observación no abre inconsistencia nueva; ratifica que CI-021 es real y visible para el usuario final, y sube su prioridad de corrección.

---

## 2.3 Coordinar visita (Pantalla 2 · nueva en v1.9)

> ✅ **Reconciliada con §1 en v1.9.10 — CI-012 cerrada.** La inconsistencia que v1.9.9 declaraba entre esta sección y §1 **queda resuelta**: el 19-ago-2026, la revisión de Héctor sobre el diseño v4 (Pantalla 2, puntos 1 a 4) cerró **CI-012 en sentido positivo** y **anuló RO-29**. La coordinación por sistema **se reinstaura** en §1.3.2, §1.3.3, §1.4 y RN-59, de modo que §1 y §2 describen ahora lo mismo. `TX_CoordinacionVisita` **se crea** — su ausencia en la base pasa de ser el argumento del retiro a ser trabajo pendiente de P4-TAS. **RF-TAS-04 y RF-TAS-05 dejan de estar marcados como pendientes.**

Antes de iniciar la captura, el tasador ve una **pantalla resumen** con los datos que el correo de asignación entrega hoy (§1.6.3 del spec), organizados en cuatro bloques colapsables:

  ---------------------------------------------------------------------------
  **Bloque**          **Contenido**
  ------------------- -------------------------------------------------------
  Encabezado          Empresa (cliente institucional), fecha de solicitud y
                      código VP-AAAA-NNNN, este último con acción de copiar
                      al portapapeles

  Propiedad           Marca Nuevo/Usado, dirección, comuna, valor estimado y
                      tabla de unidades con su N°, dirección, Rol SII y
                      superficie en m²

  Personas            Vendedor con su RUT y los contactos de visita
                      ordenados por prioridad —cada uno con su número de
                      orden, nombre, rol, teléfono y email—, más las
                      observaciones de la solicitud

  Adjuntos            Los cargados en TX_Adjuntos, con nombre y tamaño,
                      como enlace a Dropbox
  ---------------------------------------------------------------------------

Bajo los bloques, la pantalla abre el registro **Resultado del contacto**, encabezado por la instrucción de llamar al contacto de prioridad 1 nombrándolo. El registro es en dos pasos y no en dos botones sueltos: el tasador **elige primero un desenlace** y sólo entonces se le piden los datos de ese desenlace. Mientras no haya elegido, el botón de envío permanece deshabilitado con el rótulo "Selecciona un resultado".

- **Contacto exitoso · Coordiné la fecha de visita** — despliega "Fecha planificada de visita" (obligatoria) y "Nota de la coordinación" (opcional). Confirma con el botón **"Confirmar coordinación"**.
- **No pude contactar · Devolver a la ejecutiva** — despliega "Motivo" (obligatorio, catálogo cerrado de seis valores) y "Detalle" (obligatorio, mínimo 20 caracteres, con contador visible). Confirma con el botón **"Devolver a ejecutiva"**, en color destructivo.

**El catálogo de motivos tiene doble destinatario.** Lo que el tasador elige acá no se queda en el sistema: es lo que Control y Seguimiento le comunica al ejecutivo del cliente en la etapa 4 de §5.2.4. Por eso el catálogo se amplía en v1.9.13 de cuatro a seis valores, incorporando los dos desenlaces que la operación reporta con frecuencia y que antes caían en `Otro`, donde eran invisibles para los reportes de §5.2.9:

  -------------------------------------------------------------------------
  **Motivo**                     **Situación que describe**
  ------------------------------ ------------------------------------------
  Teléfono no contesta           Se llamó sin respuesta. La práctica del
                                 área agrega envío de WhatsApp antes de
                                 devolver.

  Teléfono equivocado            El número no corresponde al contacto. Se
                                 solicita otro a la ejecutiva.

  Cliente rechaza visita         El contacto se niega a recibir la visita.

  El contacto no reconoce la     El contacto atiende pero no sabe de qué
  solicitud                      solicitud se trata.

  El contacto coordina con el    El dueño o corredor no controla el acceso y
  ocupante                       debe acordar la visita con quien ocupa la
                                 propiedad.

  Otro                           Cualquier situación no cubierta. El detalle
                                 deja de ser complemento y pasa a ser la
                                 única descripción del caso.
  -------------------------------------------------------------------------

**Valor**: seis motivos · **Fuente**: audios `p1` y `p2` · **Estado**: **ratificado** por el product owner el 23-ago-2026 · catálogo cerrado (**A-25** cerrada). `Cliente rechaza visita` se conserva pese a no figurar en `p1`, y las etiquetas sirven a los dos destinatarios —el tasador que elige y el ejecutivo del cliente al que §5.2.4 · etapa 4 le reproduce el mismo valor—, de modo que no se acuña una redacción externa aparte.

Los dos motivos nuevos no son variantes de los anteriores: el contacto respondió, de modo que el teléfono es correcto y no hubo rechazo, pero la visita no quedó agendada. Agruparlos bajo `Otro` impedía distinguir un dato de contacto malo —que se corrige pidiendo otro número— de una coordinación que simplemente necesita un paso más.

Cada acción persiste una fila en `TX_CoordinacionVisita` (§2.12) y dispara SC13 con una plantilla dedicada, dentro del mismo hilo `email_thread_id` de la solicitud (RN-52). La coordinación **no cambia el estado backend**: la solicitud permanece `asignada` antes, durante y después de la coordinación. Sólo cambia de estado al presionarse "Calcular Tasación" (§2.8).

**Segundo intento de coordinación (Decisión S-6 del ADR).** Al devolver a ejecutiva, la solicitud sale del chip "Por coordinar", el reloj SLA de 4 h se detiene y la card muestra el badge "Esperando contacto de ejecutiva". Cuando la ejecutiva edita los contactos de visita (excepción acotada a RN-59), la Pantalla 2 se reabre para el tasador con Confirmar / Devolver disponibles de nuevo; el nuevo intento se registra como fila con `intento_numero += 1`.

**Visibilidad para la ejecutiva.** El resultado del último intento se muestra en la pestaña **Datos** del expediente de IF-02 (dentro del bloque *Contactos de visita* o en un sub-bloque *Coordinación*) y como evento en la pestaña **Historial**. No se construye vista dedicada nueva; se reutilizan las pestañas existentes. La ejecutiva **lee**, no edita coordinación.

| **RF-TAS-03** | **Pantalla resumen de coordinación y registro del resultado** |
|---|---|
| **Descripción** | Antes de iniciar captura, el tasador ve una pantalla resumen (ruta `app/tasaciones/[id]/coordinar/`) con los cuatro bloques colapsables Encabezado, Propiedad, Personas y Adjuntos, alimentados por los mismos datos del correo de asignación (§1.6.3), y con el código VP copiable al portapapeles. Bajo ellos registra el resultado del contacto en dos pasos: elegir desenlace y completar sus datos. El botón de envío permanece deshabilitado con el rótulo "Selecciona un resultado" mientras no haya desenlace elegido. Cada confirmación persiste una fila en `TX_CoordinacionVisita` y dispara SC13 con plantilla dedicada. |
| **Criterio de aceptación** | Cada acción crea exactamente una fila en `TX_CoordinacionVisita` con el estado correcto (`confirmada` / `rechazada`), autor `clerk_user_id`, `fecha_respuesta` en hora de servidor y `email_enviado_status = pendiente`. La ejecutiva recibe el correo dentro del mismo `email_thread_id` de la solicitud. La tabla de unidades muestra un Rol SII por unidad, no uno por solicitud. |

| **RF-TAS-12** | **Catálogo de motivos de contacto no logrado y detalle mínimo** |
|---|---|
| **Descripción** | El desenlace "No pude contactar" exige un motivo tomado de un catálogo cerrado de seis valores —`Teléfono no contesta`, `Teléfono equivocado`, `Cliente rechaza visita`, `El contacto no reconoce la solicitud`, `El contacto coordina con el ocupante`, `Otro`— y un detalle en texto libre de al menos 20 caracteres, con contador visible del avance. El desenlace "Contacto exitoso" exige fecha planificada de visita y admite una nota opcional. El catálogo alimenta además el aviso al cliente de la etapa 4 (§5.2.4) y los reportes de desviaciones de §5.2.9. Si el catálogo debe ser paramétrico en Airtable o fijo en la aplicación está pendiente de definición (**A-17**); la composición de los seis valores quedó **ratificada** el 23-ago-2026 (**A-25** cerrada). |
| **Criterio de aceptación** | El botón "Devolver a ejecutiva" permanece deshabilitado mientras falte el motivo o el detalle no alcance los 20 caracteres, y el contador refleja el largo real en cada pulsación. El motivo persistido en `TX_CoordinacionVisita.motivo` es uno de los seis valores del catálogo; ningún texto libre entra en ese campo. Un corte de los motivos registrados permite distinguir los casos de dato de contacto inválido de los casos en que el contacto respondió sin agendar. |

| **RF-TAS-13** | **Contenido mínimo de los correos de coordinación a la ejecutiva** |
|---|---|
| **Descripción** | Al confirmar la coordinación, SC13 envía a la ejecutiva un correo con la fecha de visita acordada y la nota del tasador si la escribió. Al devolver a la ejecutiva, envía un correo con el motivo del catálogo y el detalle escrito. Ambos identifican la solicitud por su código VP-AAAA-NNNN y la propiedad por su dirección, y viajan dentro del hilo `email_thread_id` de la solicitud (RN-52). |
| **Criterio de aceptación** | Los dos correos se emiten con las plantillas `email_coordinacion_confirmada` y `email_coordinacion_rechazada` de `C_Plantillas`, ninguna de las cuales se envía con un campo obligatorio vacío. La ejecutiva puede identificar solicitud y propiedad sin abrir el sistema. |

| **RF-TAS-04** | **Reapertura para segundo intento tras rechazo** |
|---|---|
| **Descripción** | Cuando la coordinación vigente está rechazada, la pantalla resumen queda cerrada para el tasador. Al editar la ejecutiva un contacto de visita, la pantalla se reabre con ambos desenlaces disponibles; la nueva fila se registra con `intento_numero += 1`. La vía de edición que lo habilita es la excepción acotada a RN-59, repuesta en §1.4 y RN-59 en v1.9.10. |
| **Criterio de aceptación** | Un segundo intento genera una segunda fila en `TX_CoordinacionVisita` con `intento_numero = 2`. Mientras la coordinación esté rechazada, el estado backend de la solicitud permanece `asignada` y no se puede iniciar captura. |
| **Desbloqueo** | Desbloqueado por revisión Héctor diseño v4 · Pantalla 2 puntos 1-4 · `docs/_md/Imagenes_IF_Tasador_v4.pdf` |

| **RF-TAS-05** | **Visibilidad de coordinación para la ejecutiva (IF-02)** |
|---|---|
| **Descripción** | El diseño v4 exige, en su punto 4, que la ejecutiva vea en su UI tanto las confirmaciones como las devoluciones del tasador. La realización es la pestaña Datos del expediente de IF-02 (§1.3.2) para el último intento y la pestaña Historial (§1.3.3) como evento, sin UI de escritura. Ambos encargos, retirados de §1 en v1.9.9, quedan repuestos en v1.9.10. |
| **Criterio de aceptación** | Un cambio en `TX_CoordinacionVisita` se refleja en las pestañas Datos e Historial de IF-02 con latencia menor a un minuto. La ejecutiva no puede editar el resultado de coordinación desde IF-02. |
| **Desbloqueo** | Desbloqueado por revisión Héctor diseño v4 · Pantalla 2 puntos 1-4 · `docs/_md/Imagenes_IF_Tasador_v4.pdf` |

---

## 2.4 Detalle de Solicitud

**No existe como pantalla propia.** Hasta v1.9.8 esta sección describía un detalle intermedio con un botón "Iniciar captura" que abría el organizador de fotos. El diseño v4 no lo tiene: el recorrido va de la cola (§2.1) a la coordinación (§2.3) y de ahí directamente al organizador de fotos (§2.6), y la ruta `app/tasaciones/[id]/` renderiza el **formulario de captura** de §2.8, no un detalle. La divergencia queda registrada como **CI-020**.

Los contenidos que esta sección enumeraba no se pierden, sino que se reparten donde el diseño los ubica: los datos de cliente, propiedad, contactos y adjuntos viven en la pantalla de coordinación (§2.3); los documentos legales ya procesados, en la sección F del formulario (§2.8); y los adjuntos de la solicitud son consultables desde el preview del informe con "Ver expediente" (§2.10 · RF-TAS-10).

**Gate de coordinación.** Lo que sí se conserva es la precedencia: mientras la coordinación no esté confirmada, el tasador no entra a la captura. El gate ya no vive en un botón "Iniciar captura", sino en la llamada a la acción de la card (RF-TAS-11), que ofrece "Coordinar visita" en lugar de "Abrir tasación".

---

## 2.5 Modificación de detalles

El tasador puede editar sólo los campos designados como suyos (ocho secciones de acordeón detalladas en §2.8). No puede modificar cliente, propiedad, propietario, RUT ni datos financieros de la solicitud original —esos campos son exclusivos de la Ejecutiva o del solicitante externo (IF-01). Cualquier edición fuera del alcance permitido es bloqueada server-side con tooltip explicativo.

**Excepción acotada a RN-59 — repuesta en §1.4 y RN-59 (v1.9.10).** El segundo intento de coordinación de §2.3 se apoya en que `TX_ContactosVisita` sea editable desde IF-02 en estado `asignada` mientras la coordinación esté rechazada, cubriendo exclusivamente contactos de visita y nunca cliente, propiedad, RUT ni datos financieros, con auditoría en `A_Cambios`. v1.9.9 retiró esa excepción al dar por fuera de alcance la coordinación por sistema; **el cierre positivo de CI-012 (19-ago-2026) la reinstaura**, y §1.4 y RN-59 la enuncian de nuevo de forma explícita. RF-TAS-04 vuelve a tener la vía de edición que necesita.

---

## 2.6 Ingreso de fotos (Pantalla 3)

Categorías predefinidas con mínimos ligados a los dormitorios, baños y estacionamientos declarados en la sección Datos de la propiedad. Cada categoría muestra un contador en vivo (ej. 3/3 ✓) y el header agrega el total consolidado en la forma **"N fotos · N docs"**. Bajo la cabecera de la propiedad —comuna · tipo y dirección— la pantalla recuerda que cada foto se asocia a una categoría y que los mínimos siguen lo declarado. El pie ofrece "Volver" y "Continuar con datos de la visita".

**Catálogo de categorías del diseño v4:**

  ---------------------------------------------------------------------------
  **Categoría**            **Mínimo**   **Origen del mínimo**
  ------------------------ ------------ -------------------------------------
  Ofertas / Comparables    3            Fijo. Coincide con el mínimo de
                                        comparables que exige RF-12

  Habitaciones             2            Dormitorios declarados

  Baños                    2            Baños declarados

  Estacionamientos         1            Estacionamientos declarados

  Mapa de Ubicación        1            Fijo

  Fachada / Exterior       1            Fijo

  Cocina                   1            Fijo

  Living / Comedor         1            Fijo
  ---------------------------------------------------------------------------

Los mínimos de Habitaciones, Baños y Estacionamientos que muestra el diseño (2 · 2 · 1) corresponden a la propiedad de ejemplo. Si esas tres categorías conservan el mínimo dinámico que esta sección declara, o si el diseño los fija, está pendiente de definición (**A-16**).

Además del catálogo, el tasador puede crear **categorías personalizadas** escribiendo un nombre y pulsando "Crear categoría". El diseño v4 no pide mínimo para ellas.

**Cambios respecto de la v1.8.2 del spec:**

- La categoría **"Documentos"** del organizador de fotos se **elimina**. En su lugar, un botón **"Cargar documentos de la propiedad"**, ubicado sobre el listado de categorías, abre el **sheet documental de la ejecutiva** reutilizado tal cual: el mismo checklist de documentos requeridos de §1.5.1.1 —con su entidad emisora, su vigencia por defecto, su marca de "No incluido" y su contador "N/N con archivo"— sobre la misma zona de carga **FileUploadZone** de §1.5.1.2, sin librerías nuevas. Al reutilizarlo hereda también el invariante de único archivo por tipo y sus tres comportamientos de subida (alta, reutilización y reemplazo con confirmación explícita).
- El sheet documental **filtra** el listado de documentos por el nuevo campo `tipo_propiedad` de `D_TipoDocumento` (dominio `{nuevo, usado, ambos}`, ver §2.12), según si la solicitud es Nueva o Usada. **No** se usa la columna `cuándo`, que carga semántica de fase (`Reproceso`, `Cliente tipo 2`) y condición (`Depto con gas`) ortogonal al tipo de propiedad.

Guardado en Dropbox por API Route con retry offline (cola local IndexedDB) en `{Unidad}/{seccion}/` —el subnivel de sección vive **dentro** de la carpeta de la unidad, no en un árbol `/captura/` paralelo—, con la estructura de carpetas definida en §8 del spec. Las tomas que no pertenecen a una unidad habitable en particular (fachada, áreas comunes) van a la unidad `edificacion` u `oo_cc` según corresponda; cuál de las dos es criterio del tasador en terreno. El campo `TX_Adjuntos.seccion` se sigue escribiendo aunque la sección ya aparezca en el path: es lo que permite filtrar por sección en Airtable sin parsear el string.

| **RF-TAS-06** | **Organizador de fotos sin categoría Documentos** |
|---|---|
| **Descripción** | La categoría "Documentos" del organizador de fotos se elimina. El botón "Cargar documentos de la propiedad" abre el mismo sheet documental que usa la ejecutiva —checklist de §1.5.1.1 sobre FileUploadZone de §1.5.1.2, con su contador de completitud y su invariante de único archivo por tipo—, filtrado por `tipo_propiedad` según si la solicitud es Nueva o Usada. No se genera un componente propio de IF-03. |
| **Criterio de aceptación** | El sheet abierto desde IF-03 lista únicamente documentos cuyo `tipo_propiedad` coincida con el de la solicitud o sea `ambos`, y es el mismo componente que abre IF-02: un cambio en el checklist de la ejecutiva se refleja en el del tasador sin tocar código de IF-03. Los documentos con `cuándo = Reproceso`, `Cliente tipo 2` o `Depto con gas` no se filtran incorrectamente. |

| **RF-TAS-14** | **Catálogo de categorías de fotos con mínimos y contadores** |
|---|---|
| **Descripción** | El organizador presenta las ocho categorías del catálogo —Ofertas / Comparables, Habitaciones, Baños, Estacionamientos, Mapa de Ubicación, Fachada / Exterior, Cocina y Living / Comedor— cada una con su contador "X/N", su acción "Agregar a {categoría}" y una marca visible mientras el mínimo no se cumple. El header agrega el total en la forma "N fotos · N docs". El tasador puede crear categorías personalizadas indicando un nombre. El carácter fijo o dinámico de los mínimos de Habitaciones, Baños y Estacionamientos está pendiente de definición (**A-16**). |
| **Criterio de aceptación** | El contador de cada categoría y el total del header se actualizan en la misma interacción en que se agrega o elimina una foto. Una categoría personalizada aparece en el listado inmediatamente después de crearse y admite fotos sin exigir mínimo. |

---

## 2.7 Avance lectura de datos (Pantalla 4)

Muestra el progreso asincrónico de la extracción SC07 sobre los documentos subidos en §2.6, con un **stepper de tres pasos**: *Archivos listos → Procesando archivos → Datos listos*. Reglas transversales:

- **Sin lenguaje de IA** en la UI: el tasador ve "Leyendo datos de la visita" y "Procesando archivos de la visita…", nunca una mención al medio técnico con que se resuelve. Política transversal del proyecto.
- **Mientras procesa**, la pantalla muestra el indicador de actividad, el stepper con el paso en curso resaltado, un tiempo estimado y una barra de avance.
- **Al terminar**, el título cambia a "Datos listos" con el mensaje "Los datos están listos para completar el formulario" y el stepper queda íntegramente completo.
- **Botón "Continuar con datos de la visita"** — deshabilitado mientras el stepper no llegue a "Datos listos"; a partir de ahí abre §2.8. Hasta v1.9.8 esta sección permitía continuar sin esperar; el diseño v4 lo bloquea, y la divergencia queda registrada como **CI-013**.
- **Botón "Volver"** — regresa a Fotos en cualquier momento. SC07 sigue en background y no se cancela desde la UI.
- Los datos extraídos se pueblan según `D_TipoDocumentoAtributo` (comportamiento vigente en §4 del spec).

| **RF-TAS-15** | **Progreso de lectura con stepper y continuación bloqueada** |
|---|---|
| **Descripción** | La pantalla de avance muestra un stepper de tres pasos (Archivos listos · Procesando archivos · Datos listos) con tiempo estimado y barra de avance mientras procesa, y el mensaje "Datos listos" al completarse. El botón "Continuar con datos de la visita" permanece deshabilitado hasta que el tercer paso se complete; "Volver" está disponible en todo momento y no cancela el proceso en background. Ningún texto de esta pantalla menciona el medio técnico de la extracción. |
| **Criterio de aceptación** | Con la extracción en curso, el botón de continuar no es accionable ni por teclado ni por doble toque. Al completarse el tercer paso queda habilitado sin recargar la pantalla. Pulsar "Volver" y regresar encuentra el progreso donde estaba, no reiniciado. |

---

## 2.8 Ingreso de datos (Pantalla 5)

Formulario multi-sección con autosave localStorage cada 30 s (patrón P3 Formulario en acordeón, Blueprint §5.4). Los datos ya persistidos en `TX_DatosTasacion` y tablas hijas se **precargan** al abrir la pantalla.

**Cabecera de la pantalla.** Muestra el código VP-AAAA-NNNN, el porcentaje de completitud del formulario con su barra de avance, un bloque con comuna · tipo, dirección y cliente institucional, y un acceso directo "N fotos ingresadas · Editar fotos" que devuelve a §2.6 sin perder lo capturado. Bajo la cabecera, una alerta ámbar enumera cuántos datos obligatorios faltan, y el pie repite el primero de ellos junto al recuento de los restantes, de modo que el tasador conoce su deuda desde cualquier punto del scroll.

**Las ocho secciones colapsables (A–H).** Hasta v1.9.8 esta sección declaraba siete, alineadas con Origen de Datos del Informe v1.1 §3.3. El diseño v4 presenta ocho, separando los overrides del resto; la divergencia queda registrada como **CI-014**:

  ---------------------------------------------------------------------------
  **Sección**                              **Contenido**
  ---------------------------------------- ----------------------------------
  A · Visita                               Fecha planificada de visita, fecha
                                           real de visita y observaciones del
                                           tasador

  B · Datos de la propiedad                Superficies, año, materialidad,
                                           calidad, estado de conservación y
                                           recintos

  C · Cuadro de valoración                 Ítems con sus m² y su aporte a
                                           garantía, con contador de ítems

  D · Comparables                          Grilla de comparables con su
                                           contador "N/3"

  E · Niveles · Terminaciones ·            Características constructivas,
  Comodidades                              terminaciones por recinto y
                                           amenities

  F · Documentos legales                   Antecedentes legales con lo
                                           extraído de los documentos
                                           cargados

  G · Overrides (CU-007)                   Ajustes manuales del tasador sobre
                                           el resultado del motor, con su
                                           motivo

  H · Rentabilidad (opcional)              Cap rate y datos de renta; no
                                           bloquea el cálculo
  ---------------------------------------------------------------------------

**Reglas de captura:**

- Separación estricta fotos ↔ datos: la pantalla de datos no recibe fotos; sólo campos estructurados.
- **Fecha real de visita.** La sección A distingue dos fechas que hasta v1.9.8 el documento trataba como una sola: la **planificada**, que llega pre-llenada desde la coordinación (§2.3) con el badge "Pre-llenado · editable", y la **real**, que el tasador registra en terreno y es **obligatoria**. Las visitas se reprograman en terreno con frecuencia, y el informe debe declarar cuándo ocurrió la visita, no cuándo se pensó hacerla.
- Campos obligatorios para el motor marcados con asterisco (*); su ausencia bloquea "Calcular Tasación".
- Al presionar "Calcular Tasación" con datos faltantes, el sistema muestra una alerta enumerada (destructiva) que lista exactamente qué falta y lleva al primer campo faltante. La misma validación y el mismo salto aplican a cualquier acción que abra el informe.
- **Autosave y cálculo por composición** (no hay AlertDialog dual): el autosave localStorage cada 30 s cumple la función de "solo guardar" sin cambio de estado, y "Calcular Tasación" cumple la función de "guardar y calcular".
- El botón **"Calcular Tasación"** queda **bloqueado** en Pantalla 5 mientras el estado backend sea `visitada` o `calculada`, con tooltip "Cálculo en curso". La comprobación se hace por polling sobre el estado backend (mitigación R-1 del ADR).

**Layout de la categoría D.Comparables (Decisión §8.1 del ADR).**

> ✅ **La sección D es de sólo lectura (A-13 cerrada, 23-ago-2026).** El diseño v4 anotaba que esta categoría *"debe ser cambiado su diseño, por sólo mostrar datos, antes leídos"* y no decía de dónde salían los datos. Ya está respondido: **salen de la extracción documental**. El tasador **fotografía el cuadro de comparables** de la plantilla operativa vigente, la funcionalidad de lectura (§4) puebla la base a partir de esa foto, y la grilla **muestra los comparables sin posibilidad de modificarlos**. La captura manual descrita hasta v1.9.14 **queda derogada**.

**Origen de los comparables.** La foto corresponde al rango `[Excel: Portada!B28:AX44]` del libro `Formato Informe VProperty Enero2026.xlsm`; el ejemplo canónico de esa foto está versionado en `docs/_referencias/ejemplo-comparables-cuadro.JPG`. El cuadro trae dos bloques —**REF. OFERTAS** y **REF. C.B.R.**—, cada uno con sus filas de muestra y sus renglones de `PROMEDIO DE LA MUESTRA`, `TASACION` y `TASACION V/S PROMEDIO DE LA MUESTRA`.

- Grilla tabular densa **de sólo lectura**, no formulario acordeón. Una fila por comparable, columnas por atributo.
- Header fijo y scroll horizontal en móvil, con la primera columna (N° / dirección) sticky. El scroll horizontal vive dentro de la grilla; el body de la página nunca scrollea en horizontal.
- Orden de columnas, espejando el cuadro de origen: N°, dirección, comuna, `sup_terreno_m2`, `sup_construccion_m2`, `precio_uf`, `uf_m2` (calculado), año, tipo de referencia (badge Oferta / CBR).
- Campos condicionales: en Oferta se muestra `telefono_contacto`; en CBR, `foja` y `numero`.
- Fila resumen final con el promedio de `uf_m2_construccion` que alimenta el cálculo.
- **No hay botón "Agregar comparable" ni acción de eliminar por fila.** El tasador no captura, no corrige y no borra: si el conjunto extraído está mal o incompleto, vuelve a fotografiar el cuadro.
- La validación de mínimo 3 de **RF-12** se conserva y **pasa a recaer sobre el origen**, no sobre la captura.

**Valores por defecto (Decisión §8.4 del ADR) — se retira el conjunto de factores.** Con la sección D en sólo lectura **no queda ningún campo de factor que el tasador teclee**, y un campo que no se captura no se puede precargar. Los factores de homogeneización (`factor_sup`, `factor_edad`, `factor_distancia`) y los coeficientes por defecto de la tabla de referencia **salen de RF-TAS-08**, que conserva únicamente el conjunto de defaults constructivos y de terminaciones especificado en §2.8.1. `GET /api/tasaciones/config/defaults` deja de ser necesaria para los factores y **no se construye**.

> ✅ **A-18 cierra por disolución del requisito (23-ago-2026 · D-24).** La cifra que A-18 pedía —el valor por defecto de cada factor— **nunca se respondió**, y `C_FactoresHomogeneizacion.valor_referencia` sigue vacío en sus 15 filas. Lo que desapareció es la pregunta, no la respuesta. `C_FactoresHomogeneizacion` (`tblep24N9gPMrDPIN`) queda como **tabla sin consumidor en IF-03**: no se borra —es trabajo de schema con su propia compuerta— pero sale de la ruta crítica. **Si una versión futura reintroduce captura o cálculo de homogeneización, A-18 revive con su pregunta intacta.**
>
> ⚠ **Y queda una contradicción registrada (A-44 · D-23).** **D-21** ratificó el 22-ago-2026 que los tres factores *"se aplican en la práctica"*, atribuyendo su ausencia en la planilla a una propiedad del artefacto y no del método. Pero el cuadro que el tasador fotografía —y que desde A-13 es la **única** entrada de comparables— tampoco los contiene: calcula el valor unitario de forma directa, como `(total UF − UF/m² de terreno × superficie de terreno − obras complementarias) / superficie construida` `[Excel: Portada!AX29]`, sin columnas de homogeneización. **Si los tres factores se usan, no es en este flujo.** Aclararlo es **A-44**, no bloqueante.
>
> **Observación pendiente sobre `D. F.` y `F. M.` (A-35 · D-22).** El cuadro de **valoración** —distinto del de comparables— aplica dos factores multiplicativos, `D. F.` y `F. M.` `[Excel: Portada!AX50 · BA50]`, ambos con valor por defecto `1` `[Excel: Portada!AX51:AX53 · BA51:BA53]`, como `F. M. × D. F. × UF/m² nuevo` `[Excel: Portada!BD51]`. Su nombre desarrollado no está escrito en el libro y Héctor no los mencionó al ratificar los tres factores: **quedan como observación**, probablemente factores adicionales o históricos del cuadro de valoración. Aclararlos es **A-35**, y puede salir del mismo movimiento que A-44.

**Defaults de características constructivas y terminaciones (v1.9.9 · fuente identificada en v1.9.13).** El diseño v4 incorpora un segundo conjunto de valores por defecto, que alimenta la sección E y el cuadro de características constructivas del informe: materialidad y estado de los elementos fundamentales —estructura soportante, divisiones interiores, entrepisos, cubierta, revestimiento exterior, cierros exteriores, obras complementarias y construcción anexa—, de los elementos "otros" —aire acondicionado, calefacción, clóset mural, muebles de cocina, sanitarios, grifería, puerta principal y ventanas— y de las terminaciones por recinto —estar, dormitorios, espacios de circulación, cocina y baños, cada uno con tipo de pavimento, material o marca, revestimiento de muros, terminación de cielo, iluminación y estado—. Se precargan con el mismo badge "Pre-llenado · editable" y el tasador los sobrescribe donde la propiedad difiera, que es el caso minoritario.

Hasta v1.9.12 este conjunto no tenía origen declarado y **A-14** lo bloqueaba entero. La revisión de la plantilla operativa vigente cambió el estado del problema: **los valores existen, están completos y llevan años en producción** dentro de la hoja de antecedentes del libro `Formato Informe VProperty Enero2026.xlsm`. Y desde el 22-ago-2026 está decidido también **cómo se particionan** (**A-27**, cerrada). **A-14 queda cerrada en ambas mitades.** El §2.8.1 que sigue especifica los valores y su clave; crear la tabla que los aloje es trabajo de schema con su propia aprobación.

### 2.8.1 Pre-llenado de la hoja de antecedentes

El cliente formula esta regla desde el modo de falla que la originó: *"a veces me pasaba que si va en blanco no le colocaba nada"*. Un campo vacío tiende a quedarse vacío; un campo con un valor plausible se corrige cuando está mal. Por eso la hoja de antecedentes **nunca se despacha en blanco**: el tasador la recibe completa, con lo más característico de una propiedad chilena ya puesto, y su trabajo en terreno es corregir lo que no calce.

**Los defaults no son constantes: son función de dos interruptores.** Ningún valor de esta sección es fijo para toda propiedad. La plantilla ramifica sobre dos campos que la solicitud ya trae resueltos antes de que el tasador abra el formulario:

  ---------------------------------------------------------------------------
  **Interruptor**     **Origen en la plantilla**     **Efecto**
  ------------------- ------------------------------ ------------------------
  Tipo de propiedad   `[Excel: FICHA SOLIC!K35]`     Casi todos los defaults
                      (nombre definido                constructivos ramifican
                      `tipoPropiedad`), ocho          entre Departamento y el
                      valores                         resto

  Estado de uso       `[Excel: FICHA SOLIC!K36]`     Gobierna calidad y estado
                      (nombre definido `estadoUso`),  de conservación de todos
                      Nuevo · Usado                   los elementos
  ---------------------------------------------------------------------------

En IF-03 los dos llegan desde `TX_Solicitudes`: `tipo_propiedad` y `tipo_propiedad_nuevo_usado`. La consecuencia de diseño es que el conjunto de defaults **se resuelve server-side al abrir la Pantalla 5**, no en el cliente, y viaja ya resuelto: el frontend recibe valores, nunca reglas.

**La partición del catálogo es por tipo de propiedad × estado de uso (v1.9.14).** Los dos interruptores no son sólo la lógica de los valores: son la **clave** con que el catálogo se almacena. Decidido por Héctor el 22-ago-2026, cerrando **A-27**.

Es la partición que replica el modelo que la operación ya usa, y la única de las candidatas que no pierde comportamiento. Una clave **global** habría aplanado todo lo que ramifica —cubierta, tipo de adosamiento, estado de conservación, obras complementarias— obligando a elegir una rama y descartar la otra. Una clave **por comuna**, que A-14 llegó a plantear, no tiene respaldo en ningún artefacto: la plantilla no ramifica por territorio en ninguna de sus 21 hojas.

  ---------------------------------------------------------------------------
  **Eje**             **Dominio**                    **Cardinalidad**
  ------------------- ------------------------------ ------------------------
  Tipo de propiedad   `ListaTipoPropiedad`           8 valores
                      `[Excel: FICHA SOLIC!AD25:AD32]`

  Estado de uso       Nuevo · Usado                  2 valores
                      `[Excel: FICHA SOLIC!K36]`
  ---------------------------------------------------------------------------

El producto cartesiano da **16 combinaciones**, de las cuales la plantilla distingue hoy dos ramas explícitas por eje —Departamento frente al resto, Nuevo frente a Usado—. Que el dominio admita 16 y la plantilla use 4 **no es una contradicción**: la clave se declara completa para que agregar una rama nueva sea alta de datos y no cambio de estructura, que es la propiedad que esta partición existe para dar.

Dos consecuencias que la implementación debe respetar:

- **Una combinación sin fila cargada no es un error de datos, es un vacío legítimo.** El comportamiento es presentar el campo sin valor, nunca caer a una combinación vecina: heredar de "la más parecida" produciría defaults plausibles y falsos, que es el modo de fallo que el pre-llenado viene a evitar.
- **La granularidad de fila —un registro por campo, o uno por combinación con todos los campos— es decisión de la tanda de schema.** Ninguna de las dos altera la clave ni el comportamiento observable; sí cambian el costo de agregar un campo nuevo frente al de leer el catálogo de un vistazo.

**Elementos fundamentales.** Ocho campos, cada uno con su materialidad, su calidad y su estado `[Excel: Antecedentes!B36:BP44]`:

  ---------------------------------------------------------------------------------------------
  **Campo**                 **Default Departamento**    **Default resto**   **Catálogo**
  ------------------------- --------------------------- ------------------- -------------------
  Estructura soportante     HORMIGON ARMADO             HORMIGON ARMADO     36 valores
                                                                            `[Excel:
                                                                            Antecedentes!BZ45:BZ80]`

  Divisiones interiores     ACERO VOLCANITA             ACERO VOLCANITA     mismo catálogo

  Entrepisos                LOSA DE HORMIGON ARMADO     LOSA DE HORMIGON    6 valores
                                                        ARMADO, salvo casa
                                                        de un piso, que va
                                                        vacío

  Cubierta                  FE GALVANIZADO              PLANCHA METALICA    19 valores
                                                                            `[Excel:
                                                                            Antecedentes!CE45:CE63]`

  Revestimiento exterior    ESTUCO Y PINTURA            ESTUCO Y PINTURA    10 valores
                                                                            `[Excel:
                                                                            Antecedentes!CH45:CH54]`

  Cierros exteriores        REJA METALICA               REJA METALICA       6 valores
                                                                            `[Excel:
                                                                            Antecedentes!CK45:CK50]`

  Obras complementarias     PISCINA                     *(vacío)*           mismo catálogo

  Construcción anexo        *(vacío)*                   *(vacío)*           ---
  ---------------------------------------------------------------------------------------------

La **calidad** de los ocho toma el valor `BUENA` y el **estado** toma `BUENO` en propiedad usada y `NUEVO S/USO` en propiedad nueva `[Excel: Antecedentes!Y37:Y44 · AF37:AF44]`. El catálogo de calidad es `DEFICIENTE · INFERIOR · REGULAR · CORRIENTE · BUENA · SUPERIOR`; el de estado, `MUY BUENO · NUEVO S/USO · BUENO · REGULAR · DEFICIENTE · OBRA GUESA · TERMINACIONES`.

**Elementos "otros".** Ocho campos más `[Excel: Antecedentes!AL37:BE44]`:

  ---------------------------------------------------------------------------
  **Campo**                 **Default**                    **Catálogo**
  ------------------------- ------------------------------ ------------------
  Aire acondicionado        NO PRESENTA                    3 valores

  Calefacción               LOSA RADIANTE si la propiedad  8 valores
                            declara calefacción; si no,
                            NO PRESENTA

  Clóset mural              MELAMINA                       ---

  Muebles de cocina         MELAMINA Y POSTFORMADO         13 valores
                                                           `[Excel:
                                                           Antecedentes!CO44:CO56]`

  Sanitarios                LOSA NACIONAL CORRIENTE        ---

  Grifería                  NACIONAL CORRIENTE             ---

  Puerta principal          MADERA                         9 valores
                                                           `[Excel:
                                                           Antecedentes!BV54:BV62]`

  Ventanas                  ALUMINIO                       11 valores
                                                           `[Excel:
                                                           Antecedentes!BX54:BX64]`
  ---------------------------------------------------------------------------

**Terminaciones por recinto.** Cinco recintos fijos por cuatro atributos capturables `[Excel: Antecedentes!B45:BE50]`:

  ---------------------------------------------------------------------------------------------
  **Recinto**               **Pavimento**   **Revest. muros**  **Cielo**            **Ilum.**
  ------------------------- --------------- ------------------ -------------------- -----------
  Estar                     PISO FLOTANTE   ESMALTE            ENLUCIDO / PINTURA   BUENA

  Dormitorios               PISO FLOTANTE   ESMALTE            ENLUCIDO / PINTURA   BUENA

  Espacios de circulación   PISO FLOTANTE   ESMALTE            ENLUCIDO / PINTURA   BUENA

  Cocina                    CERAMICO        CERAMICO           ENLUCIDO / PINTURA   BUENA

  Baños                     CERAMICO        CERAMICO           ENLUCIDO / PINTURA   BUENA
  ---------------------------------------------------------------------------------------------

El quinto atributo de cada recinto, **material o marca**, no es capturable: se **deriva** del pavimento elegido `[Excel: Antecedentes!W46:W50]` —`PISO FLOTANTE → TIPO LAMINADO`, `CERAMICO → TIPO CORDILLERA`, `ALFOMBRA → ALFOMBRA`, `ENMADERADO → MADERA`—. La UI lo muestra como campo calculado y de sólo lectura; capturarlo por separado abriría la posibilidad de que contradiga al pavimento.

**Anexo de estado de conservación.** Treinta y ocho filas de inspección, todas pre-llenadas con la misma terna `Bueno / Ninguno / Funcionando` `[Excel: Estado Conservación!A7:W46]`, sobre los catálogos `Bueno · Normal · Regular · Deficiente · Malo`, `Ninguno · Leve · Mediano · Grave · Total` y `Funcionando · Media Función · No Operativo`. La materialidad de cada fila no se captura: se hereda de los elementos fundamentales y de los elementos "otros" ya declarados arriba.

**Un default que no es regla.** La orientación de la construcción figura en la plantilla como constante literal `NOROESTE` `[Excel: Antecedentes!Z17]`, sin ramificar por ningún interruptor, a diferencia de todos los demás campos de su bloque. Es con toda probabilidad un residuo de la última propiedad tasada sobre la plantilla y no un valor característico. **No se implementa como default**: el campo se presenta vacío, con su catálogo de ocho rumbos `[Excel: Antecedentes!CD1:CD8]` disponible.

  -------------------------------------------------------------------------
  **RF-TAS-23**     **Pre-llenado de la hoja de antecedentes**
  ----------------- -------------------------------------------------------
  **Descripción**   La sección E de la Pantalla 5 y el anexo de estado de
                    conservación se presentan al tasador con sus valores
                    por defecto ya puestos, resueltos server-side en
                    función del tipo de propiedad y del estado de uso de la
                    solicitud, y marcados con el badge "Pre-llenado ·
                    editable". El tasador sobrescribe donde la propiedad
                    difiera. Ningún campo del conjunto se presenta vacío,
                    con la única excepción de los que la plantilla deja
                    deliberadamente sin valor —construcción anexo, obras
                    complementarias fuera de departamento y orientación de
                    la construcción—. Los valores y sus catálogos son los
                    de §2.8.1 y no viven en el código de IF-03 (RF-TAS-08).

  **Criterio de     Dos solicitudes que difieran sólo en el tipo de
  aceptación**      propiedad reciben conjuntos de defaults distintos en
                    cubierta y tipo de adosamiento, sin intervención del
                    tasador. Dos que difieran sólo en el estado de uso
                    reciben estados de conservación distintos. Un campo
                    sobrescrito por el tasador conserva su valor tras
                    recargar la pantalla y no vuelve al default. El
                    conjunto completo llega resuelto desde el servidor: la
                    inspección del payload no revela ninguna regla de
                    ramificación en el cliente. Una combinación de (tipo de
                    propiedad, estado de uso) sin fila cargada presenta los
                    campos **vacíos**: no hereda de ninguna otra
                    combinación ni cae a un conjunto por defecto.
  -------------------------------------------------------------------------

| **RF-12** | **Mínimo de comparables antes de calcular** *(preservado del spec · sujeto redefinido en v1.9.15 por el cierre de A-13)* |
|---|---|
| **Descripción** | El botón "Calcular Tasación" se habilita únicamente cuando la grilla de comparables contiene al menos 3 filas válidas y todos los campos obligatorios están completos. Desde v1.9.15, con la sección D en **sólo lectura** (A-13 cerrada), la validación **se conserva y cambia de sujeto**: deja de recaer sobre la captura del tasador y recae sobre el origen que los provea —la extracción de la foto del cuadro—. El tasador no puede completar un conjunto insuficiente campo a campo; su única acción correctiva es volver a fotografiar el cuadro. El mensaje de bloqueo debe decirlo así, sin pedirle que agregue comparables. |
| **Criterio de aceptación** | Con menos de 3 comparables, el botón permanece deshabilitado con tooltip explicativo. Al presionarlo con datos faltantes, se muestra la alerta enumerada y el foco salta al primer campo faltante. |

| **RF-TAS-16** | **Formulario de ocho secciones con progreso y resumen de faltantes** |
|---|---|
| **Descripción** | El formulario presenta ocho secciones colapsables (A · Visita, B · Datos de la propiedad, C · Cuadro de valoración, D · Comparables, E · Niveles · Terminaciones · Comodidades, F · Documentos legales, G · Overrides (CU-007), H · Rentabilidad (opcional)). La cabecera muestra el porcentaje de completitud con su barra, el resumen de la propiedad y el acceso "N fotos ingresadas · Editar fotos"; una alerta ámbar declara cuántos obligatorios faltan y el pie repite el primero con el recuento de los restantes. Las secciones C y D exponen su contador propio ("N items", "N/3"). |
| **Criterio de aceptación** | El porcentaje y el recuento de faltantes se recalculan en la misma interacción en que se completa un campo, sin recargar. Volver desde "Editar fotos" recupera el formulario con lo escrito, no en blanco. La sección H no incide en el porcentaje de obligatorios. |

| **RF-TAS-17** | **Fecha real de visita obligatoria frente a la planificada** |
|---|---|
| **Descripción** | La sección A distingue "Fecha planificada de visita", precargada desde la coordinación (§2.3) con badge "Pre-llenado · editable", de "Fecha real de visita", que el tasador registra en terreno y es obligatoria para calcular. Ambas se persisten por separado y el informe declara la real. |
| **Criterio de aceptación** | Una solicitud cuya visita se reprogramó en terreno conserva las dos fechas distintas y el informe muestra la real. La ausencia de fecha real cuenta entre los obligatorios faltantes y bloquea "Calcular Tasación". |

| **RF-TAS-18** | **Validación de obligatorios del motor con salto al primer faltante** |
|---|---|
| **Descripción** | Todo dato que consume el motor de cálculo se marca con asterisco. Al pulsar "Calcular Tasación" —o cualquier acción que abra el informe— con obligatorios pendientes, el sistema enumera exactamente cuáles faltan y desplaza el foco al primero de la lista, abriendo la sección que lo contiene si estaba colapsada. El botón permanece deshabilitado mientras falte alguno. |
| **Criterio de aceptación** | El listado de faltantes nombra los campos por su rótulo visible, no por su nombre de base. El foco aterriza en el primer campo faltante en orden de aparición, con su sección desplegada. Ninguna de las dos acciones permite avanzar con obligatorios pendientes. |

| **RF-TAS-07** | **Bloqueo de "Calcular Tasación" durante cálculo en curso** |
|---|---|
| **Descripción** | Mientras el estado backend sea `visitada` o `calculada`, el botón "Calcular Tasación" queda bloqueado con tooltip "Cálculo en curso". La comprobación se hace por polling sobre el estado backend. |
| **Criterio de aceptación** | Un doble tap del tasador durante `EN_CALCULO` no produce doble ejecución de AT03. Un retorno a Pantalla 5 durante `EN_CALCULO` encuentra el botón bloqueado. |

| **RF-TAS-08** | **Valores por defecto parametrizados** *(reducido en v1.9.15 al conjunto constructivo · el conjunto de factores se retira con el cierre de A-13 y A-18)* |
|---|---|
| **Descripción** | Los valores por defecto de características constructivas y terminaciones se precargan desde la capa de configuración vía API Route, no desde constantes del frontend. Los campos precargados muestran badge "Pre-llenado · editable" y el tasador puede sobrescribirlos. Quedan **especificados valor por valor en §2.8.1**, con su clave de partición decidida —tipo de propiedad × estado de uso, A-27 cerrada— y su domicilio en `C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`); lo que resta es sembrar la tabla, que es trabajo de schema. **Desde v1.9.15 el requisito no cubre los factores de homogeneización.** Con la sección D en sólo lectura (A-13) no hay campo de factor que el tasador teclee, de modo que no hay nada que precargar: `factor_sup`, `factor_edad` y `factor_distancia` salen del alcance de este RF junto con los coeficientes de la tabla de referencia, y `GET /api/tasaciones/config/defaults` no se construye. **A-18 cierra por disolución** (D-24) sin que la cifra se haya respondido nunca; **A-44** registra que los tres factores ratificados por D-21 no aparecen en el flujo real. |
| **Criterio de aceptación** | Un cambio en la tabla de configuración se refleja en la próxima carga de Pantalla 5 sin deploy. Ningún valor por defecto vive en el código de IF-03, ni siquiera de forma transitoria: ni los factores, ni los defaults constructivos de §2.8.1, cuyas cifras y catálogos son datos y se cargan como tales. |

---

## 2.9 Avance cálculo tasación (Pantalla 6)

Muestra el cálculo en curso mientras el estado transita de `visitada` a `calculada` (dispara SC08 → AT03), con un **stepper de tres pasos**: *Datos listos → Calculando tasación → Informe listo*. Reglas:

- **Skeletons con animación pulse** durante `EN_CALCULO` (§2.5.4 del spec).
- **Sin lenguaje de IA**: ningún texto de la pantalla menciona el medio técnico del cálculo. El motor es AT03, un DAG determinista.
- **Al completarse**, el título pasa a "Informe listo" con el mensaje "Tu informe está listo para revisión" y el stepper queda íntegramente completo.
- **"Continuar a vista previa"** queda deshabilitado hasta que el estado transite a `INFORME_DISPONIBLE`; es la acción primaria de la pantalla.
- **"Volver atrás"** sólo permite regresar a Pantalla 5 en modo consulta; AT03 sigue corriendo y no se cancela desde la UI.
- El botón "Calcular Tasación" de Pantalla 5 queda bloqueado durante toda esta pantalla (RF-TAS-07).

| **RF-TAS-19** | **Progreso de cálculo con stepper y avance a vista previa** |
|---|---|
| **Descripción** | La pantalla de cálculo muestra un stepper de tres pasos (Datos listos · Calculando tasación · Informe listo) y ofrece exactamente dos acciones: "Continuar a vista previa", deshabilitada hasta que el tercer paso se complete, y "Volver atrás", que devuelve al formulario en modo consulta sin cancelar el cálculo. Ningún texto de la pantalla menciona el medio técnico con que se calcula. |
| **Criterio de aceptación** | El stepper avanza siguiendo el estado backend, no un temporizador local: una recarga durante el cálculo recupera el paso real. "Continuar a vista previa" no es accionable antes de `INFORME_DISPONIBLE`. |

---

## 2.10 Preview del informe (Pantalla 7 · Muestra tasación)

Ruta `/tasaciones/[id]/informe`. Preview con los datos reales capturados renderizando las 8 secciones canónicas del informe. La cabecera fija muestra el rótulo "INFORME DE TASACIÓN" con el código VP-AAAA-NNNN y la **versión del informe** (`v1`, `v2`, …). Cuando el estado local es `EN_CALCULO`, la vista muestra skeletons; en cuanto transita a `INFORME_DISPONIBLE`, aparecen los datos definitivos. Se destaca el valor de tasación (usa el override manual del tasador si existe, o el valor de referencia del motor) y el cap rate calculado.

**Orden canónico para lectura móvil (Decisión §8.2 del ADR).** Optimizado para columna única. Cada bloque se presenta **numerado y rotulado** en el orden que sigue, de modo que el tasador pueda referirse a uno por su número al hablar con el visador:

1. **Cabecera** — marca Nuevo/Usado, código VP-AAAA-NNNN, cliente institucional, dirección, comuna y fecha de visita.
2. **Valor de tasación destacado** — monto en UF en tipografía grande, con cap rate calculado inmediatamente debajo.
3. **Antecedentes de la propiedad** — superficies (terreno, construida, primer piso), año de construcción, materialidad, calidad de construcción, estado de conservación, dormitorios, baños y estacionamientos.
4. **Datos SII / avalúo** — códigos SII, avalúo fiscal por unidad y total, contribución.
5. **Cuadro de valoración** — resumen de ítems (edificación, terreno, OO.CC., etc.) con sus m² y su aporte a garantía.
6. **Comparables** — con la grilla de §2.8 y el promedio homogeneizado UF/m².
7. **Registro fotográfico** — total de fotografías y conteo real por categoría.
8. **Observaciones y overrides** — ajustes manuales del tasador con su motivo; con estado vacío explícito cuando no hay ninguno.

Se permite optimizar la distribución (colapsar secciones densas en acordeones) siempre que se preserven este orden de lectura y la numeración visible.

**Footer de acciones.** Cuatro acciones fijas al pie, visibles desde cualquier punto del scroll:

- **Descargar PDF** — genera el informe con **Carbone**, usando la plantilla que el motor de reglas asignó a esa solicitud (§7). No hay impresión alternativa: hasta v1.9.8 esta sección admitía `window.print()` como respaldo cuando el PDF aún no estaba depositado, lo que producía un documento sin la plantilla del cliente. La divergencia queda registrada como **CI-016**.
- **Ver expediente** — modal/sheet lateral, **no ruta nueva**. Reutiliza el visor de adjuntos de sólo lectura ya especificado para la Ejecutiva (§1.3.4 del spec) y el Visador (§3.5.3 del spec): se titula "Expediente · VP-AAAA-NNNN", declara el número de archivos y su condición de sólo lectura, y lista los adjuntos de `TX_Adjuntos` vinculados con su nombre, tamaño y acción de descarga desde Dropbox. No permite alta ni baja de archivos.
- **Rechazar** (rojo) — semántica: "no envío este informe, sigo en borrador". Abre el diálogo **"Rechazar borrador"**, que explica que el informe quedará como borrador hasta resolverlo con el visador y que la observación queda registrada, y pide bajo el rótulo "¿Qué necesitas resolver?" un texto de al menos 20 caracteres con contador visible. Se confirma con "Guardar observación" o se descarta con "Cancelar". Al confirmarse: (a) persiste la observación en `TX_Solicitudes.observacion_rechazo_tasador`; (b) muestra el mensaje que dirige al tasador a comunicarse con el visador; (c) **no cambia el estado**.
- **Confirmar** (verde) — abre el diálogo **"¿Enviar este informe al visador?"**, que advierte que una vez enviado el informe pasará a revisión del visador y dejará de aparecer en la lista de tasaciones, con las acciones "Cancelar" y "Enviar informe". Al confirmarse, la solicitud transita a `visitada` (y luego automáticamente a `calculada → pdf_listo`), sale del filtro `{asignada, visitada, calculada}` al llegar a `pdf_listo`, y la aplicación muestra una **pantalla de acuse** —"Informe enviado", con el mensaje de que el visador lo revisará y ya no aparecerá en su lista— cuya única acción es "Volver al inicio". No hay redirección automática: el acuse espera al tasador (CI-017).

| **RF-TAS-09** | **Rechazo del informe con observación persistida y mensaje al tasador** *(canal de aviso al visador pendiente de A-15)* |
|---|---|
| **Descripción** | El botón Rechazar del footer del preview abre el diálogo "Rechazar borrador", que declara que el informe queda como borrador hasta resolverlo con el visador, pide bajo el rótulo "¿Qué necesitas resolver?" un texto de al menos 20 caracteres con contador visible, y se confirma con "Guardar observación". Al confirmar, persiste la observación en `TX_Solicitudes.observacion_rechazo_tasador` y muestra un mensaje que dirige al tasador al visador. No cambia el estado backend. **Si además se emite un aviso al visador está pendiente de definición (A-15):** el diseño v4 anuncia al tasador que se le hará saber al visador, y esta sección declara que no hay notificación in-app. |
| **Criterio de aceptación** | El botón "Guardar observación" permanece deshabilitado hasta los 20 caracteres y el contador refleja el largo real. La observación queda disponible en la pestaña Historial de IF-04 para que el visador la lea. El estado backend de la solicitud es el mismo antes y después del rechazo. |

| **RF-TAS-10** | **"Ver expediente" como modal reutilizado** |
|---|---|
| **Descripción** | El botón "Ver expediente" del preview abre un modal/sheet lateral que reutiliza el visor de adjuntos de sólo lectura ya especificado para IF-02 y IF-04. Se titula "Expediente · VP-AAAA-NNNN", declara el número de archivos y su condición de sólo lectura, y lista los adjuntos de `TX_Adjuntos` vinculados con nombre, tamaño y acción de descarga desde Dropbox. No es una ruta nueva. |
| **Criterio de aceptación** | El modal no requiere librerías nuevas y no ofrece ninguna acción de alta, reemplazo ni baja de archivos. Cerrarlo devuelve el preview en la misma posición de scroll. |

| **RF-TAS-20** | **Informe en ocho bloques numerados con versión visible** |
|---|---|
| **Descripción** | El preview renderiza los ocho bloques canónicos numerados y rotulados en el orden de §2.10, en columna única, con skeletons mientras el estado sea `EN_CALCULO`. La cabecera fija muestra el rótulo "INFORME DE TASACIÓN", el código VP-AAAA-NNNN y la versión del informe. Los bloques sin contenido muestran estado vacío explícito en vez de omitirse. |
| **Criterio de aceptación** | Los ocho bloques aparecen siempre en el mismo orden y con el mismo número, colapsados o no. Un informe sin observaciones ni overrides muestra el bloque 8 con su texto de estado vacío. La versión de la cabecera coincide con la del registro de `TX_DocumentosGenerados` vigente para esa solicitud. |

| **RF-TAS-21** | **Descarga del informe con la plantilla Carbone asignada** |
|---|---|
| **Descripción** | "Descargar PDF" genera el informe con Carbone usando la plantilla que el motor de reglas resolvió para esa solicitud (§7), sin ruta alternativa de impresión. Si el PDF todavía no está disponible, la acción informa la espera en vez de producir un documento sin plantilla. |
| **Criterio de aceptación** | El documento descargado desde IF-03 es idéntico al que entrega el pipeline PDF para esa solicitud y versión. En ningún estado la aplicación produce un PDF que no provenga de Carbone. |

| **RF-TAS-22** | **Confirmación de envío al visador y acuse explícito** |
|---|---|
| **Descripción** | "Confirmar" abre el diálogo "¿Enviar este informe al visador?", que advierte que el informe pasará a revisión y dejará de aparecer en la lista de tasaciones, con las acciones "Cancelar" y "Enviar informe". Confirmado el envío, la solicitud transita a `visitada` y la aplicación muestra una pantalla de acuse "Informe enviado" cuya única acción es "Volver al inicio". No hay redirección automática por temporizador. |
| **Criterio de aceptación** | Cancelar el diálogo deja la solicitud sin cambio de estado. Confirmarlo produce exactamente una transición, aunque el tasador pulse dos veces. El acuse permanece hasta que el tasador pulse "Volver al inicio", y al hacerlo la solicitud ya no figura en su cola. |

| **RF-17** | **Rol del visador en la aprobación** *(preservado del spec, con efecto acotado en IF-03)* |
|---|---|
| **Descripción** | RF-17 sigue vigente para IF-04 (el visador puede aprobar o devolver desde su consola). El efecto sobre IF-03 se limita a la transición backend `pdf_listo → asignada` cuando el visador devuelve, sin UI que la comunique al tasador. |
| **Criterio de aceptación** | Una devolución del visador reingresa la solicitud a la cola del tasador como `asignada`, sin franja roja, sin contador de intentos y sin notificación in-app. |

---

## 2.11 Máquina de estados y automatizaciones

**Máquina de estados oficial** (fuente única: `VProperty_Maquina_Estados.html`):

```
creada → asignada → visitada → calculada → pdf_listo → aprobada → (pendiente_final?) → entregada → cerrada
```

Estados de excepción: `cancelada`, `requiere_atencion`. **El estado `devuelta` queda deprecado**: cuando el visador devuelve desde IF-04, la solicitud transita directamente a `asignada`.

**Mapeo UI local ↔ backend:**

| UI local | Backend | Detalle |
|---|---|---|
| `BORRADOR` | `asignada` | Mientras se llena el form; autosave localStorage cada 30 s |
| Click "Calcular Tasación" | Transición a `visitada` | Dispara SC06 → SC08 |
| `EN_CALCULO` | Backend transita `visitada → calculada` | Skeletons con pulse en UI |
| `INFORME_DISPONIBLE` | `calculada` o `pdf_listo` | Preview local vía `window.print()`; PDF final vía §7 Carbone del spec |

**La coordinación no agrega estados** a la máquina backend: ocurre íntegramente dentro de `asignada`. Los estados de coordinación (`confirmada` / `rechazada`) viven en `TX_CoordinacionVisita`, no en `TX_Solicitudes.estado`.

**Tabla de automatizaciones actualizada:**

| **ID** | **Nombre** | **Trigger desde IF-03** | **Efecto observable** |
|---|---|---|---|
| SC06 | Transición a `visitada` | Click "Calcular Tasación" | Escribe `estado = visitada` en `TX_Solicitudes`; audita en `A_Eventos` |
| SC07 | Extracción de documentos (Claude API) | Upload documento en §2.6 | Extrae atributos según `D_TipoDocumentoAtributo`; guarda JSON en `TX_Adjuntos.atributos_obtenidos`; propaga por cardinalidad a `TX_DatosTasacion` o `TX_Unidades` (§4 del spec) |
| SC08 | Motor de cálculo | `estado = visitada` | Ejecuta AT03 (DAG de ~15 cálculos); escribe `TX_Calculos`; transita a `calculada` |
| AT03 | Ejecutar DAG de fórmulas | `estado = visitada` | Corre cálculos en orden topológico con snapshot |
| AT04 | Validar rangos de valor (fuera de scope IF-03) | `TX_Calculos` insert | Compara con rangos por zona (`M_Comunas`); marca `flag_revision` si sale de rango; puede llevar a `requiere_atencion` |
| SC09 | Generación de PDF (Carbone) | `estado = calculada` | Genera PDF final; deposita en Dropbox; transita a `pdf_listo` |
| AT05 / SC13 | Notificar visador | `estado = pdf_listo` | SC13 envía email al visador con plantilla `email_asignacion_visador`. Aplica constraint blanda `(solicitud_id, fecha_respuesta_truncada_al_minuto)` para evitar doble disparo (mitigación R-2 del ADR) |
| SC13 (coord. confirmada) | Email coordinación confirmada | Fila en `TX_CoordinacionVisita` con `estado_coordinacion = confirmada` y `email_enviado_status = pendiente` | Envía correo a la ejecutiva con plantilla `email_coordinacion_confirmada` dentro del hilo `email_thread_id` |
| SC13 (coord. rechazada) | Email coordinación rechazada | Fila en `TX_CoordinacionVisita` con `estado_coordinacion = rechazada` y `email_enviado_status = pendiente` | Envía correo a la ejecutiva con plantilla `email_coordinacion_rechazada` dentro del hilo `email_thread_id` |

**Escenarios Make retirados o renombrados:**

- `SC02` — fusionado en SC01 (entrada única).
- `SC04` — retirado. En v1.9 la asignación de tasador es manual (§1.5.5 del spec); no hay escenario Make dedicado.
- `SC05` — renombrado a SC08.
- `SC15` — retirado. Su función (consumir Mindicador para valor UF) se resuelve como automatización Airtable AT08 o similar.

**Coordinación:** NO se crea escenario nuevo; SC13 dispara los correos usando las dos plantillas nuevas de `C_Plantillas`.

*Acción del Data Engineer:* Validar la numeración canónica contra `Z_EscenariosMake` existente antes del próximo prompt v0.dev.

---

## 2.12 Delta de schema (modelo de datos)

**Tabla nueva `TX_CoordinacionVisita`:**

| Campo | Tipo | Descripción |
|---|---|---|
| `coordinacion_key` | singleLineText (**campo primario**) | Clave legible del intento, con el formato `VP-2026-0530 · intento 1`. **La escribe el Route Handler en el insert** (cambio de tipo en v1.9.12): §2.12 la declaraba como `id` PK `autoNumber`, tipo que **no está soportado por las tools MCP** de creación de schema —ni `create_table` ni `create_field`— y la regla operativa del proyecto prohíbe crear campos desde la UI de Airtable. Un primario `singleLineText` sigue además el patrón de la casa (`TX_ContactosVisita` usa `nombre`) y deja la grilla legible para la ejecutiva, que es quien consulta esta tabla. Ver `docs/schema-airtable.md` §26.6 |
| `solicitud_id` | FK → `TX_Solicitudes` | Solicitud a la que pertenece el intento |
| `estado_coordinacion` | singleSelect | Enum: `confirmada`, `rechazada` |
| `motivo` | singleSelect | Obligatorio si `rechazada`, vacío si `confirmada`. Catálogo cerrado de seis valores: `Teléfono no contesta`, `Teléfono equivocado`, `Cliente rechaza visita`, `El contacto no reconoce la solicitud`, `El contacto coordina con el ocupante`, `Otro` (RF-TAS-12 · ampliado de cuatro a seis en v1.9.13 · paramétrico o fijo pendiente de A-17 · composición **ratificada** el 23-ago-2026, A-25 cerrada). Los dos valores nuevos se agregan al `singleSelect` existente; no se renombra ni se elimina ninguno de los cuatro anteriores, de modo que las filas ya escritas conservan su valor |
| `detalle` | Texto largo | Obligatorio si `rechazada`, mínimo 20 caracteres. Es el texto libre que acompaña al motivo |
| `nota` | Texto largo | Opcional si `confirmada`. Nota de la coordinación escrita por el tasador |
| `fecha_visita_propuesta` | Date | Obligatorio si `confirmada` |
| `fecha_respuesta` | Timestamp | Momento de la acción del tasador (hora de servidor) |
| `autor_clerk_id` | Texto | `clerk_user_id` del tasador que realizó la acción |
| `email_thread_id` | Texto (lookup) | Traído por lookup desde `TX_Solicitudes` (preserva RN-52) |
| `email_enviado_at` | Timestamp | Momento en que SC13 envió el correo (nullable) |
| `email_enviado_status` | singleSelect | `pendiente`, `enviado`, `error` |
| `intento_numero` | Number (precision 0) | Ordinal del intento. **Lo escribe el Route Handler en el insert, no es fórmula** (cambio de tipo en v1.9.11): una fórmula de Airtable sólo evalúa sobre su propio registro y no puede contar hermanos por Link, y la base no tiene ningún `rollup`. Ver `docs/schema-airtable.md` §26.6 |

Constraint blanda de unicidad `(solicitud_id, fecha_respuesta_truncada_al_minuto)` para evitar doble disparo por doble tap (mitigación R-2).

**Campos nuevos en `TX_Solicitudes`:**

- `coordinacion_vigente` (**singleSelect**: `confirmada` · `rechazada`; vacío si no hay intentos) = estado del último intento registrado. **Lo escribe el Route Handler de coordinación en la misma operación que inserta la fila, no es fórmula** (cambio de tipo en v1.9.11): Airtable no tiene `LAST(... ORDER BY ...)`, y la alternativa por `rollup` con `MAX()` sobre una clave concatenada se descartó por diseño. Ver `docs/schema-airtable.md` §26.6. Alimenta el chip "Por coordinar", el badge "Esperando contacto de ejecutiva" y la excepción acotada a RN-59, repuesta en §1.4 en v1.9.10 (ver §2.5).
- `observacion_rechazo_tasador` (texto largo, nullable) — observación persistida por RF-TAS-09.
- `fecha_real_visita` (date) — fecha en que la visita efectivamente ocurrió, distinta de la planificada en la coordinación. Obligatoria para calcular y es la que declara el informe (RF-TAS-17).

**Campo retirado en v1.9.9.** `horas_restantes`, declarado entre v1.9.4 y v1.9.8 como `(sla_aplicable * 24) - horas_desde_solicitud`, **no se crea**. Derivaba horas del plazo agregado en días y producía una cifra que ningún otro punto del sistema reproduce; el badge de la card se alimenta del control de SLA por etapa (§2.2 · RF-TAS-02 · CI-021).

**Origen de los defaults constructivos.** RF-TAS-08 exige que los valores por defecto de características constructivas y terminaciones vivan en la capa de configuración. Ninguna tabla actual los alberga y esta versión **no inventa una**: el destino queda pendiente de definición (**A-14**).

**Deprecación en `TX_Solicitudes.estado`:** el valor `devuelta` se conserva en el enum para compatibilidad con solicitudes históricas pero no admite nuevas transiciones. Script one-off de migración transiciona las `devuelta` existentes a `asignada` con evento en `A_Eventos` (mitigación R-3).

**Campo nuevo en `D_TipoDocumento`:** `tipo_propiedad` singleSelect `{nuevo, usado, ambos}`. Alta sin DDL ni deploy (RN-31). Poblado inicial mapeando desde `cuándo`: `Nuevo→nuevo`, `Usado→usado`, `Ambos→ambos`; para valores que no expresan tipo de propiedad (`Reproceso`, `Cliente tipo 2`, `Depto con gas`, `---`) se asigna `ambos` salvo indicación distinta del negocio (P-4).

**Plantillas nuevas en `C_Plantillas`:** `email_coordinacion_confirmada` y `email_coordinacion_rechazada`.

---

## 2.13 Front-end (base v0.dev)

Rutas del repositorio v0 de IF-03:

- `app/tasaciones/` — cola personal (Pantalla 1, §2.1).
- `app/tasaciones/[id]/coordinar/` — coordinación (Pantalla 2, §2.3).
- `app/tasaciones/[id]/fotos/` — organizador (Pantalla 3, §2.6).
- `app/tasaciones/[id]/lectura/` — progreso de lectura (Pantalla 4, §2.7).
- `app/tasaciones/[id]/` — formulario acordeón (Pantalla 5, §2.8).
- `app/tasaciones/[id]/estado/` — progreso de cálculo (Pantalla 6, §2.9).
- `app/tasaciones/[id]/informe/` — preview (Pantalla 7, §2.10).

Son **siete rutas, no ocho**. Hasta v1.9.8 esta lista declaraba `[id]/` como detalle de solicitud y añadía `[id]/captura/` y `[id]/calculo/`; en el diseño v4 la raíz del identificador **es** el formulario de captura y el progreso de cálculo vive en `[id]/estado/`. La divergencia queda registrada como **CI-020**.

**Componentes reutilizados sin regeneración:** TasacionCard, EstadoBadge, SLABadge, FileUploadZone (sheet documental), visor de adjuntos de IF-02/IF-04 (para "Ver expediente"). Sin librerías nuevas.

**Hook `use-estado-tasador`:** se elimina la coletilla "y el control de 3 intentos". El polling sobre el estado backend gobierna el bloqueo de "Calcular Tasación" (RF-TAS-07).

**Traza legacy del contador de intentos.** La maqueta de referencia todavía renderiza en la cabecera del formulario un indicador "N de 3 usados" y conserva la constante que lo alimenta. Es residuo del ciclo de devolución que la decisión capital 1 de §2 retiró: **no se especifica y debe eliminarse del código**, junto con la lógica del hook que ya nadie consume. Registrado como **CI-015**.

**Stack — punto abierto P-3 (versión de Next.js).** El spec §1.8 y RT-01 fijan Next.js 14; §2.7 y §3.7 miden Next.js 16 en los repos reales. Recomendación del equipo: adoptar la realidad medida (16) y actualizar el blueprint y RT-01. Requiere sign-off de PM + Enterprise Architect + Frontend Lead antes de cerrar el DoD.

---

## 2.14 Ediciones puntuales al spec §2 del proyecto

Cambios a aplicar sobre `VProperty_Especificacion_Proyecto_v1_9_2.md` en su próxima versión:

| Sección | Cambio |
|---|---|
| §2 encabezado | Retirar la frase *"Fuera de alcance de v1.9 en IF-03: la devolución estructurada de la fecha de visita y el reporte de contacto no logrado"*. La coordinación entra en alcance con el modelo de §2.3 |
| §2.1 | Filtro pasa a `{asignada, visitada, calculada}`. Eliminar franja roja de devueltas. Agregar chips "Hoy" y "Por coordinar", SLA con semáforo + horas, badge "Esperando contacto de ejecutiva" |
| §2.3 | Agregar vista resumen de coordinación (§2.3 de este documento) |
| §2.5.3 | Reescritura completa según §2.11 (vocabulario oficial de estados) |
| §2.5.4 | Botón "Rechazar" con nueva semántica y mensaje; eliminar RN-16bis y control de 3 intentos |
| §2.5.2 | Eliminar categoría "Documentos" del organizador de fotos; abrir sheet documental filtrado por `tipo_propiedad` |
| §2.6 tabla automatizaciones | AT03 trigger `estado=visitada` (antes `capturada`); agregar SC08 y SC09 con sus triggers |
| §2.7 | Ruta nueva `app/tasaciones/[id]/coordinar/`; eliminar coletilla de 3 intentos del hook; reconciliar Next.js (P-3) |
| §1.3.2 / §1.3.3 (IF-02) | Agregar lectura de `TX_CoordinacionVisita` en Datos e Historial |
| §1.9.1 / §1.4 / RN-59 | Documentar excepción acotada: `TX_ContactosVisita` editable en `asignada` cuando `coordinacion_vigente = rechazada` |
| §4.2.1 | Agregar campo `tipo_propiedad` a `D_TipoDocumento`; corregir la implicación de que `cuándo` sirve de proxy de tipo de propiedad |

**Estado de aplicación al 25-jul-2026 (v1.9.4).** Las ocho primeras filas ya estaban aplicadas dentro de §2 al redactarse v1.9.3. Las tres últimas —§1.3.2/§1.3.3, §1.9.1/§1.4/RN-59 y §4.2.1— apuntaban a secciones fuera de §2 y quedaron sin aplicar en v1.9.3, que por tanto se contradecía consigo mismo. Se aplican en esta versión, junto con dos correcciones que la tabla no anticipaba: el trigger de AT03 en §6.2, que seguía diciendo `estado=capturada` pese a la fila 7 (la fila cita "§2.6 tabla automatizaciones", numeración del §2 anterior; en v1.9.3 esa tabla vive en **§6.2**), y la cita de Origen de Datos del Informe en §2.8, que decía v1.0 cuando el repositorio tiene v1.1. Trazabilidad por rol firmante en `docs/_sync_ifTasador_v1/SYNC_LOG.md`.

**Nota sobre el documento base de esta tabla (A-04).** El encabezado dice que los cambios se aplican sobre `VProperty_Especificacion_Proyecto_v1_9_2.md`. Ese archivo **no está presente en el árbol de trabajo**: v1.9.3 lo sucedió sin conservarlo como copia versionada, y la decisión del sync fue no restaurarlo (desviación C-8, registrada). Se recupera cuando se lo necesite con:

```
git show 03e8053:docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md
```

La cadena vigente es v1.9.2 → v1.9.3 `[SUPERSEDED]` → **v1.9.4**.

---

## 2.15 Puntos abiertos y riesgos

Los riesgos R-1, R-2 y R-3 del ADR se cerraron como requisitos firmes (RF-TAS-07 y schema §2.12).

**Ambigüedades abiertas por el diseño v4 (v1.9.9).** Seis puntos del diseño no pueden especificarse sin decisión de negocio. Se registran en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`, que es su archivo canónico, y se listan aquí sólo como índice de lo que bloquea a esta sección:

| ID | Punto | Bloquea |
|---|---|---|
| **A-12** | Composición del chip "Hoy": qué debe hacer el tasador en el día | RF-TAS-01 |
| **A-13** ✅ | Origen de los comparables si la sección D pasa a sólo lectura — **CERRADA 23-ago-2026**: extracción documental desde la foto del cuadro. Ya no bloquea | RF-12 · §2.8 |
| **A-14** | Tabla de configuración donde viven los defaults constructivos | RF-TAS-08 · §2.12 |
| **A-15** | Si el rechazo del informe emite o no un aviso al visador | RF-TAS-09 |
| **A-16** | Si los mínimos de fotos de Habitaciones, Baños y Estacionamientos son fijos o dinámicos | RF-TAS-14 |
| **A-17** | Si el catálogo de motivos de contacto no logrado es paramétrico o fijo | RF-TAS-12 |

Y siguen abiertos los puntos previos:

- **P-3 · Versión de Next.js.** Requiere sign-off de PM + Enterprise Architect + Frontend Lead. Ver §2.13.
- **P-4 · Poblado de `tipo_propiedad` para valores de fase.** El mapeo de `Reproceso`, `Cliente tipo 2`, `Depto con gas` y `---` a `tipo_propiedad = ambos` es asunción del equipo. Validar con la ejecutiva si algún documento de reproceso o condicional aplica sólo a Nuevo o sólo a Usado. Impacto bajo.
- **P-5 · Género del dominio de `tipo_propiedad` y vocabulario de negocio** *(nuevo en v1.9.4)*. §2.12 declara el dominio en masculino (`{nuevo, usado, ambos}`); la base real tiene `D_TipoDocumento.tipo_propiedad` (`fldIfdcjsr8KeNRCx`) en femenino (`{nueva, usada, ambas}`), mientras que `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`) está en masculino (`{nuevo, usado}`). RF-TAS-06 compara ambos: **con los dominios actuales la comparación literal nunca coincide y el sheet documental sale vacío.** No es sólo un typo a corregir en Airtable: falta decidir la convención de vocabulario de negocio —"propiedad nueva/usada" frente a "inmueble nuevo/usado"—, que fija cuál de los dos dominios se alinea con cuál. Requiere confirmación del negocio + sign-off DE. **Impacto alto:** bloquea la implementación de RF-TAS-06. Alinear el dominio es trabajo en Airtable, fuera del repositorio; la documentación se limita a registrar la divergencia.

---

## 2.16 Otras funcionalidades no cubiertas

| ID | Funcionalidad | Estado | Decisión requerida |
|---|---|---|---|
| FUT-TAS-01 | Firma digital sobre foto (marca de agua con RUT tasador + hora) | Backlog | Elevado como D-06 (valor legal de la evidencia) |
| FUT-TAS-02 | OCR sobre documentos capturados en terreno (respaldo) | Ya cubierto por SC07 | Cerrado; ver §4 del spec |
| FUT-TAS-03 | Modo offline completo (todo el formulario, no sólo fotos) | Parcialmente cubierto | RF-14 cubre las fotos; el resto queda como mejora incremental |
| FUT-TAS-04 | Geolocalización automática con validación de comuna | Backlog | Requiere permisos explícitos; escalable |

**Dependencias y entidades.** Tablas escritas: `TX_CoordinacionVisita` (nueva), `TX_DatosTasacion`, `TX_ItemsCuadroValoracion`, `TX_Adjuntos`, `TX_Comparables`, `TX_ObrasComplementarias`, `TX_Ampliaciones`, `TX_HabitacionesPorNivel`, `TX_TerminacionesPorRecinto`, `TX_Amenities`, `TX_DocumentosLegales`, `TX_Solicitudes` (overrides y campos nuevos), `A_Cambios`. Tablas leídas: `TX_Solicitudes`, `M_TiposPropiedad`, `M_Comunas`, `M_TiposDeBien`, `D_TipoDocumento` (con `tipo_propiedad` nuevo), `D_TipoDocumentoAtributo`. Reglas de negocio implicadas: RN-05 a RN-14 (motor de cálculo), RN-21, RN-23, RN-38, RN-39, RN-42, RN-43, RN-45 (superficies con origen), RN-49 (estado de conservación heredado), RN-50 (ampliaciones regularizables), RN-52 (hilo de correo), RN-53 (política de primer contacto), RN-59 (con excepción acotada §2.5). Ver §5 y §6 del spec para el desarrollo de las reglas.

---

## Trazabilidad de este documento

| Documento fuente | Rol |
|---|---|
| `VProperty_ADR_IF_Tasador_v3_v2.md` | Fuente de todas las decisiones consolidadas aquí (C-1, C-2, C-3, S-1 a S-8, especificaciones UX §8) |
| `VProperty_Especificacion_Proyecto_v1_9_2.md` | Baseline técnico y patrón de presentación de RF (§1 Interfaz Ejecutiva) |
| `VProperty_Maquina_Estados.html` | Fuente única de la máquina de estados |
| `Imagenes_IF_Tasador_v4.pdf` | **Fuente de verdad visual** de las siete pantallas desde v1.9.9. Sucede a `Imagenes_IF_Tasador_v3.docx` |
| `Imagenes_IF_Tasador_v3.docx` | Origen de las siete pantallas en v1.9.3--v1.9.8. Superado por el v4; ausente del repositorio (A-02) |

**Cambios respecto del ADR v2.** Este documento reorganiza el contenido del ADR sin agregar decisiones nuevas: mismas decisiones, presentadas como requerimientos funcionales por pantalla, con formato de tabla RF/Descripción/Criterio de aceptación consistente con la §1 (Interfaz Ejecutiva) del spec del proyecto.

**Cambios en v1.9.9.** La sección se contrasta contra `Imagenes_IF_Tasador_v4.pdf` y se alinea con él. Se agregan RF-TAS-11 a RF-TAS-22 y se modifican RF-TAS-01 a RF-TAS-10 y RF-12. Las divergencias entre lo que este documento pedía y lo que el diseño resuelve quedan registradas como CI-013 a CI-021 en `docs/CODE_INCONSISTENCIES.md`; los puntos que exigen decisión de negocio, como A-12 a A-17 en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`. Ningún RF se resuelve por criterio propio: los que dependen de una ambigüedad abierta se emiten marcados como pendientes.

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
como sla_revision separado del sla_aplicable global. Ese sub-SLA
corresponde a la etapa 7 de la matriz operacional: 30 minutos por
informe, con una capacidad de referencia de 20 informes diarios por
visador (§5.2.4, §5.2.7).

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

Cualquier archivo modificado o subido por el Visador queda en la carpeta
de la unidad a la que se refiere, y en `comun/` cuando cubre varias
unidades o la solicitud entera, según la estructura de §8, preservando
historial (nunca sobrescritura destructiva). La subcarpeta `/revision/`
de v1.9.5 desaparece con la reestructuración de v1.9.6: el origen de la
carga se sigue distinguiendo por `TX_Adjuntos.origen_interfaz = IF-04`,
que es el dato con el que se consultaba, no por el segmento del path.
Revisión fotográfica (RF-06): la UI presenta
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

Esta acción es el envío manual del expediente y convive con el envío
automático al cierre del visado (etapa 7 de §5.2.4), que no pasa por esta
pantalla: lo dispara el sistema con el texto tipo y los adjuntos que
correspondan al perfil del cliente según §5.2.6. El PDF es el adjunto
base en ambos casos; los perfiles con resumen ejecutivo o con hoja de
resumen embebida sólo aplican al envío automático.

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

Precisión v1.9.4 sobre la columna cuándo. El párrafo anterior se
mantiene en lo que afirma sobre temporalidad, pero hasta v1.9.3 se
prestaba a leer cuándo como proxy del tipo de propiedad. No lo es: esa
columna mezcla cuatro dimensiones distintas en un solo valor —fase del
proceso (Reproceso), segmento de cliente (Cliente tipo 2), condición de
la propiedad (Depto con gas) y tipo de propiedad propiamente tal
(Nuevo / Usado / Ambos)—, además del marcador --- para los documentos
que no se piden. Filtrar el sheet documental por esta columna produciría
resultados incorrectos. El tipo de propiedad se modela en un campo
propio, descrito a continuación.

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

**Campo tipo_propiedad.** §2.12 lo declara como alta nueva. **No lo es:
ya existe en la base** (`fldIfdcjsr8KeNRCx`), verificado vía MCP el
25-jul-2026. Lo que aporta v1.9.4 no es su creación sino la
documentación de su uso. Es el único criterio válido para filtrar el
catálogo por condición de la propiedad, y alimenta el sheet documental
que el tasador abre desde el organizador de fotos (§2.6 · RF-TAS-06):
ese sheet deja de listar el catálogo completo y pasa a mostrar sólo los
documentos aplicables a la propiedad en curso.

  ---------------------------------------------------------------------------
  **Campo**           **Tipo**            **Valores reales en la base**
  ------------------- ------------------- -----------------------------------
  tipo_propiedad      singleSelect        nueva · usada · ambas
  ---------------------------------------------------------------------------

**Divergencia de dominio --- punto abierto P-5.** §2.12 escribe este
dominio en masculino (nuevo / usado / ambos); la base lo tiene en
femenino (nueva / usada / ambas), y el campo de la solicitud que debe
compararse contra él —tipo_propiedad_nuevo_usado, `fldHxx1P1ao33PWrl`—
está en masculino (nuevo / usado). **Tal como está hoy, la comparación
literal de RF-TAS-06 no encuentra coincidencias y el sheet documental
saldría vacío.** Detrás de la discrepancia hay una decisión de
vocabulario de negocio que no está tomada: si la convención es
"propiedad nueva / usada" o "inmueble nuevo / usado". Se registra como
P-5 en §2.15. **No se resuelve en la documentación**: alinear el dominio
es trabajo en Airtable, fuera del repositorio.

**Poblado inicial --- asunción P-4, no decisión.** El mapeo desde la
columna cuándo es directo para los tres valores que sí expresan
condición de la propiedad: Nuevo→nueva, Usado→usada, Ambos→ambas. Para
los valores que expresan otra dimensión —Reproceso, Cliente tipo 2,
Depto con gas y el marcador ---— se asigna ambas de forma provisoria.
Esto es una asunción del equipo y está registrada como punto abierto P-4
en §2.15: falta validar con la ejecutiva si algún documento de reproceso
o condicional aplica sólo a Nuevo o sólo a Usado. Impacto bajo; el campo
es editable sin deploy si la validación cambia el mapeo. La forma
definitiva de los valores queda supeditada a P-5.

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
servicio —tanto el plazo agregado de C_SLA como los plazos por etapa del
workflow y su calendario hábil (§5.2)—, notificaciones
(C_NotificacionesConfig), precios
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

## **5.2 SLA operacional del servicio (C_SLA + H_Feriados)**

Esta sección es la fuente única del reloj del servicio. §1.2, §2.2 y §3.2
describen cómo cada interfaz lo muestra; la aritmética, los umbrales y el
calendario se declaran acá y en ningún otro lugar.

VProperty compromete el plazo en dos niveles complementarios, que no son
intercambiables. El **plazo agregado** vive en C_SLA por par (cliente,
tipo_informe), se expresa en días y gobierna el semáforo de bandeja que
consumen las tres interfaces (RN-04 · RF-35). El **plazo por etapa** es el
compromiso operacional del workflow: siete tramos entre la recepción del
correo del cliente y el envío del informe visado, expresados en horas
hábiles, que gobiernan el control diario del área (RF-53 · §5.2.4). El
primero responde cuándo vence la solicitud; el segundo, dónde se está
atrasando ahora. Ningún umbral del segundo modifica al primero: una
solicitud puede tener una etapa en rojo con el semáforo agregado en
verde, y eso no es una inconsistencia sino la lectura correcta de ambos.

C_SLA define el plazo en días por cada par (cliente, tipo_informe),
entre 1 y 30 días. Modificar un SLA no altera las solicitudes en curso
(RN-04); aplica a nuevas solicitudes. Feriados chilenos H_Feriados (15
fechas anuales) se aplican al cálculo WORKDAY. La regla RN-04 formaliza
el cálculo.

Unidad de cómputo común. RN-04 calcula el plazo agregado en días con
WORKDAY sobre H_Feriados. La matriz por etapa se calcula en horas sobre
ese mismo calendario, acotado además a la ventana hábil de §5.2.1.
H_Feriados sigue siendo la fuente única de feriados para ambos cómputos:
§5.2.1 no introduce un segundo calendario, sólo declara la ventana
horaria que RN-04 no declaraba.

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

El plazo por etapa se especifica en las nueve subsecciones que siguen y
se resume en el requisito RF-53, que las toma en conjunto como su
contenido normativo.

  -------------------------------------------------------------------------
  **RF-53**         **Workflow y control de SLA operacional**
  ----------------- -------------------------------------------------------
  **Descripción**   El sistema mide cada solicitud contra la matriz de SLA
                    por etapa de §5.2.4, calculada sobre el calendario
                    hábil de §5.2.1 y con el hito de inicio de §5.2.2.
                    Registra timestamp de entrada y salida de cada etapa,
                    compara el transcurrido contra el SLA ideal y el SLA
                    máximo, expone el resultado como semáforo por etapa y
                    emite las alertas de §5.2.8. El reproceso se mide con
                    su matriz propia (§5.2.5), en paralelo al flujo
                    principal y sin interrumpirlo.

  **Criterio de     Toda solicitud cerrada permite reconstruir el tiempo
  aceptación**      consumido en cada una de las siete etapas y su
                    cumplimiento contra ambos umbrales. Una etapa que
                    alcanza el SLA ideal sin completarse queda en ámbar;
                    una que supera el SLA máximo queda en roja y notifica
                    al responsable de área. El tiempo transcurrido fuera de
                    la ventana hábil no suma. Los reportes de §5.2.9 se
                    obtienen sin cálculo manual.
  -------------------------------------------------------------------------

### **5.2.1 Horario hábil y calendario de aplicación**

Regla base de todo el cómputo de esta sección. Toda medición de tiempos
que sigue —matriz principal, reproceso, alertas y reportes— se calcula
sobre este calendario y no sobre horas corridas.

- **Ventana de aplicación:** lunes a viernes, de 9:00 a 18:00 hrs.
- **Días excluidos:** sábados, domingos y feriados oficiales chilenos.
  Los tiempos de SLA no corren durante esos días. La fuente de feriados
  es H_Feriados, la misma que usa RN-04.
- **Pausa del reloj:** el conteo se detiene fuera de la ventana hábil y
  se reanuda al abrir la jornada siguiente. Los buzones institucionales
  reciben correo 24x5, pero la recepción fuera de ventana no adelanta el
  inicio del cómputo.

Esta pausa es distinta de la de RN-54, que detiene el reloj por contacto
no logrado: aquélla depende del calendario y aplica siempre; ésta depende
del estado de la solicitud y es excepcional.

### **5.2.2 Recepción del correo como hito de inicio**

Los clientes envían sus solicitudes a dos buzones institucionales,
`info@valueproperty` y `contacto@valueproperty`; la asignación de cada
cliente a un buzón ya está definida en configuración. El hito que arranca
el reloj de la etapa 1 se define así:

- **No constituye recepción** la llegada del correo al buzón.
- **Sí constituye recepción** el momento en que Control y Seguimiento
  abre el correo —deja de estar en negrita— e ingresa la solicitud al
  sistema. Sólo Control y Seguimiento tiene esa responsabilidad.
- **Acuse formal:** al ingresar la solicitud, el sistema envía al
  ejecutivo del cliente un acuse con el texto tipo *"Estimado, acusamos
  recepción, informamos que el proceso ya está en curso y le comentaremos
  a la brevedad."*

La definición es deliberada: mide lo que VProperty controla. Un correo
que entra a las 22:00 de un viernes no consume SLA hasta las 9:00 del
lunes, y el compromiso de la etapa 1 se cuenta desde que la Ejecutiva lo
toma, no desde que el servidor lo recibe.

### **5.2.3 Actores y responsabilidad sobre el reloj**

  -------------------------------------------------------------------------
  **Actor**                      **Rol en el proceso**
  ------------------------------ ------------------------------------------
  Cliente (ejecutivo de la       Solicita la tasación por correo.
  empresa mandante)

  Control y Seguimiento          Registra, coordina y comunica.
  (Ejecutiva VProperty · IF-02)

  Tasador (IF-03)                Llama al contacto, visita la propiedad y
                                 emite el informe.

  Visado (Visador · IF-04)       Revisa el informe, lo aprueba y cierra el
                                 proceso con el envío del entregable final
                                 al cliente.
  -------------------------------------------------------------------------

Cada etapa de §5.2.4 tiene un único responsable de los cuatro. El
semáforo de una etapa en rojo escala al responsable de esa área, no al
dueño de la solicitud completa (§5.2.8).

### **5.2.4 Matriz de SLA del flujo principal (solicitud nueva)**

Aplica a la solicitud nueva. Cada etapa registra timestamp automático de
inicio y de fin, y se mide contra ambos umbrales sobre el calendario de
§5.2.1.

  ---------------------------------------------------------------------------------------------------------------
  **#** **Etapa**                    **Responsable**        **De → A**                 **SLA        **SLA
                                                                                       ideal**      máximo**
  ----- ---------------------------- ---------------------- -------------------------- ------------ -------------
  1     Ingreso de solicitud         Control y Seguimiento  Cliente (ejecutivo) →      2 h          3 h
                                                            Tasador

  2     Coordinación de visita       Tasador                Tasador → Contacto de la   4 h          6 h
        (llamado)                                           propiedad

  3     Informe post-llamado         Tasador                Tasador → Control y        30 min       30 min
                                                            Seguimiento                (inmediato)

  4     Aviso de coordinación al     Control y Seguimiento  Control y Seguimiento →    2 h          3 h
        cliente                                             Cliente (ejecutivo)

  5     Visita y envío de informe    Tasador                Tasador → Control y        24 h         48 h
                                                            Seguimiento

  6     Disponible para visado       Control y Seguimiento  Control y Seguimiento →    2 h          3 h
                                                            Visado

  7     Visación y envío final       Visado                 Visado → Cliente           30 min por   30 min por
                                                            (ejecutivo), automático    informe      informe
  ---------------------------------------------------------------------------------------------------------------

Precisiones por etapa:

- **Etapa 1** — el inicio del cómputo es la recepción según §5.2.2, no la
  llegada del correo al buzón.
- **Etapa 2** — las 4 h del SLA ideal son la política interna de primer
  contacto ya declarada en RN-53: diferenciador comercial, no compromiso
  contractual con el cliente. Las 6 h son el máximo tolerado antes de que
  la etapa entre en rojo. El registro estructurado de la coordinación
  ocurre en TX_CoordinacionVisita (§2.3, §2.12). Desde v1.9.14, las 4 h
  del SLA ideal son además el instante del **recordatorio automático al
  tasador** (§5.2.8): el mismo momento, con dos destinatarios distintos
  —ámbar escala visualmente al área, el recordatorio le escribe al
  ejecutor—. El **tope de respuesta al cliente** sigue siendo un mecanismo
  aparte y también vive en §5.2.8.
- **Etapa 3** — el tasador debe registrar uno de dos desenlaces: día y
  hora de la visita coordinada, o uno de los seis motivos del catálogo
  cerrado de §2.3 (teléfono no contesta, teléfono equivocado, cliente
  rechaza visita, el contacto no reconoce la solicitud, el contacto
  coordina con el ocupante, otro). El segundo desenlace activa RN-54 y
  detiene el reloj mientras la solicitud está bloqueada por contacto no
  logrado. El motivo registrado aquí es el que viaja al cliente en la
  etapa 4 y el que alimenta los reportes de desviaciones de §5.2.9.
- **Etapa 5** — las 48 h del SLA máximo coinciden con la regla que la
  plantilla operativa vigente ya aplica: la fecha de entrega se calcula
  como `WORKDAY(fecha_visita, 2)` a las 09:00
  `[Excel: FICHA SOLIC!K11 · N11]`. La planilla excluye sábado y domingo
  pero no feriados; el cómputo de §5.2.1 excluye ambos, de modo que el
  sistema es más estricto que la práctica actual, no más laxo. Un audio de
  la tanda de agosto de 2026 menciona 24 h para este tramo en lugar de 48;
  se registra como observación pendiente de aclaración y **no** modifica
  la matriz, que conserva 24 h de ideal y 48 h de máximo.
- **Etapa 6** — al subir el informe se dispara la extracción automática de
  documentos descrita en §4 (escenario SC07 → Claude API) y la solicitud
  queda en cola para visación. En la máquina de estados oficial (§2.11)
  ese punto corresponde al estado `pdf_listo`; "en cola para visación" es
  la etiqueta operacional de la bandeja del visador, no un estado nuevo.
- **Etapa 7** — el envío al cliente es automático y su contenido depende
  del perfil del cliente (§5.2.6). El sub-SLA de revisión del visador
  sigue siendo `sla_revision` en C_SLA (§3.2).

  -------------------------------------------------------------------------
  **Métrica**                                    **Valor**
  ---------------------------------------------- --------------------------
  Tiempo total end-to-end (caso ideal)           ~30 horas hábiles

  Tiempo total end-to-end (SLA máximo)           ~62 horas hábiles
  -------------------------------------------------------------------------

### **5.2.5 Reproceso con SLA propio**

Hay reproceso cuando el ejecutivo del cliente devuelve un informe ya
entregado para incorporar información faltante (permiso de recepción
final, RUT o apellido del vendedor, certificado de profesión), modificar
contenido o solicitar un aumento de valor (por ejemplo, +5%). El
reproceso corre en paralelo al flujo principal, con su propia matriz, y
no consume ni suspende los plazos de §5.2.4. La frecuencia observada de
cada motivo está en §1.9.1.

**El reproceso conserva el código de la solicitud original.** No se crea
una solicitud nueva: es el mismo caso, que vuelve. Esto gobierna la
trazabilidad, el conteo de los reportes de §5.2.9 y la relación con el
informe ya entregado.

**Catálogo de motivos.** El levantamiento de agosto de 2026 cierra el
catálogo que §5.2.5 daba por no elicitado. Son siete motivos, ordenados
por frecuencia observada:

  ---------------------------------------------------------------------------
  **#** **Motivo**                          **Antecedente que acompaña**
  ----- ----------------------------------- ---------------------------------
  1     Incorporar permiso de recepción     Los certificados que lo acreditan
        final

  2     Corregir la dirección según el      El certificado de número
        certificado de número

  3     Solicitud de revisión por aumento   La justificación del ejecutivo
        de valor

  4     Incorporar regularización de        Los certificados de regularización
        ampliación

  5     Corrección de forma (nombre, RUT y  El dato corregido
        equivalentes)

  6     Cambio de cliente destinatario del  El cliente al que se reemite, con
        informe                             su código y su logo

  7     Pronunciamiento sobre afectación    El certificado que la acredita,
        de utilidad pública                 solicitado por el abogado
  ---------------------------------------------------------------------------

**Valor**: siete motivos · **Fuente**: audio `p3` · **Estado**: **ratificado**
por el product owner el 23-ago-2026 como **dominio cerrado**, no como muestra
(**A-26** cerrada). Las etiquetas de la tabla son las del `singleSelect`. El
reproceso sigue diferido en §1.9 · FUT-EJ-08 **por alcance, no por falta de
definición**: la versión que lo implemente no tiene que volver a elicitarlo.

**Quién ejecuta el reproceso depende de su naturaleza.** Los motivos 3, 5
y 6 —valor, forma y destinatario— los resuelve el **perfil de visación**,
que es el único con permiso sobre las tres dimensiones del informe:
forma, fondo y valores (§3.4). Los motivos 1, 2, 4 y 7 incorporan
antecedentes que pueden exigir revisar la propiedad y vuelven al tasador.
La matriz R1–R3 nombra al tasador como responsable de R2 porque era el
caso supuesto; con el catálogo cerrado, el responsable de R2 es **quien
corresponda según el motivo**, y el plazo no cambia.

  ---------------------------------------------------------------------------------------------------------------
  **#** **Etapa**                              **Responsable**        **SLA ideal**        **SLA máximo**
  ----- -------------------------------------- ---------------------- -------------------- ----------------------
  R1    Registro del reproceso y acuse al      Control y Seguimiento  2 h                  2 h
        cliente

  R2    Ejecución del reproceso                Tasador                Según tipo           Regla "reproceso
                                                                                           limpio"

  R3    Visación y envío del reproceso         Visado                 2 h                  3 h
  ---------------------------------------------------------------------------------------------------------------

En R1 la solicitud se marca en reproceso con motivo tipificado y se
conserva la trazabilidad del informe original: el reproceso no reemplaza
al informe entregado, lo sucede.

**Regla operativa "reproceso limpio"** (enunciada como RN-55):

- Reprocesos ingresados a última hora del día anterior (18:00–19:00) o
  durante la mañana → despachados antes de las 12:00–14:00.
- Reprocesos ingresados después de las 14:00–15:00 → despachados en la
  tarde del mismo día.
- Objetivo: iniciar cada día hábil sin reprocesos pendientes de la
  jornada anterior.

Estado de implementación. La marca de reproceso y la tabla TX_Reprocesos
siguen diferidas (§1.9 · FUT-EJ-08); en v1.9 el reproceso se gestiona
fuera del sistema, en el hilo de correo original. Lo que cambia en
v1.9.13 es el fundamento del diferimiento: el catálogo cerrado de motivos
**ya está elicitado** y figura arriba, de modo que el reproceso se
posterga por decisión de alcance y no por falta de definición. La versión
que lo implemente no tiene que volver a preguntarlo.

**Visibilidad, cuando se implemente.** El cliente es explícito en que las
solicitudes en reproceso deben poder aislarse: *"tienen que estar súper
identificados vía un filtro o algo, porque ellos están escriturando"*. Un
reproceso demorado detiene una firma ante notario, lo que lo hace más
urgente que su lugar en la matriz sugiere. El requisito es un filtro
propio en la bandeja y el primer bloque del tablero diario de §5.2.9.

### **5.2.6 Entregable por perfil de cliente**

Configura la etapa 7. El correo automático al cierre del visado lleva
siempre el texto tipo *"Estimado, se adjunta el informe de la
referencia."*; lo que cambia entre clientes es el adjunto.

  -------------------------------------------------------------------------
  **Perfil de cliente**      **Entregable adjunto**
  -------------------------- ----------------------------------------------
  Estándar (la mayoría)      PDF del informe: carátula seguida del informe.

  Con resumen ejecutivo      PDF del informe más un archivo Excel con el
                             resumen del PDF, en formato tipo, idéntico
                             para todos los clientes de esta categoría.

  Unidad de Vivienda         PDF con una primera hoja de resumen embebida,
  Habitacional               seguida de la carátula y el informe. El
                             resumen va dentro del mismo PDF, no como
                             archivo separado.
  -------------------------------------------------------------------------

Al cerrar el visado, el sistema sube el o los archivos a Dropbox según la
estructura de §8.1 y dispara el correo automático con los adjuntos que
correspondan al perfil. El perfil es un atributo del cliente y se
parametriza junto al resto de sus variables en M_Clientes y
C_VariablesCliente (§5.4); el envío manual del expediente desde IF-04
sigue rigiéndose por §3.5.5.

Pendiente D-16 (§15). §7 especifica hoy la generación de un PDF único con
Carbone. Cómo se producen el Excel de resumen del segundo perfil y la
hoja de resumen embebida del tercero —dentro de Carbone o fuera de él—
queda por definir con el cliente. Los tres perfiles quedan especificados
como compromiso de servicio; su mecanismo de generación, no.

### **5.2.7 Capacidad de visación**

- **Capacidad de referencia:** 20 informes por día y por visador.
- **Base de cálculo:** ~400 tasaciones mensuales sobre 20 días hábiles.

Es un parámetro operativo, no un límite del sistema: alimenta el
dimensionamiento del área y los reportes de carga de §5.2.9, y queda
referenciable desde esta sección de parametrización. Se deriva del SLA de
30 minutos por informe de la etapa 7 aplicado a la jornada hábil de
§5.2.1.

### **5.2.8 Métricas y alertas de SLA**

Cada solicitud registra automáticamente:

- Timestamp de cada transición de estado.
- Tiempo transcurrido por etapa, contra el SLA ideal y contra el SLA
  máximo.
- Indicador visual verde / ámbar / rojo según cumplimiento, con la misma
  paleta operacional del semáforo agregado (RN-04).
- Marca de reproceso, motivo tipificado y avance de su SLA propio
  (R1–R3).

Alertas:

- **Ámbar:** al alcanzar el SLA ideal de una etapa sin haberla
  completado.
- **Rojo:** al superar el SLA máximo de la etapa.
- Notificación al responsable del área correspondiente cuando una
  solicitud entra en rojo, por los canales y destinatarios que declara
  C_NotificacionesConfig (§5.3).
- Alerta de fin de jornada para los reprocesos que sigan abiertos, en
  cumplimiento de la regla "reproceso limpio" (§5.2.5).

**Recordatorios al ejecutor — un mecanismo distinto de la escalada.** Las
alertas de arriba avisan al **responsable del área** de que un plazo se
está perdiendo, para que escale. Los recordatorios que siguen le insisten
al **ejecutor** de la etapa para que actúe, antes de que haya nada que
escalar. Los dos coexisten, se disparan en momentos distintos y no se
sustituyen: confundirlos deja al tasador esperando un correo que estaba
dirigido a su jefatura.

  ---------------------------------------------------------------------------
  **Recordatorio**    **Cuándo**                     **A quién**
  ------------------- ------------------------------ ------------------------
  Coordinación        Al cumplirse el umbral sin     Al tasador asignado
  pendiente           desenlace registrado de la
                      etapa 3

  Informe pendiente   A las 24 h hábiles desde la    Al tasador asignado
                      fecha real de visita, sin
                      informe recibido
  ---------------------------------------------------------------------------

**Valor del umbral de coordinación**: **4 horas hábiles** desde la
asignación · **Fuente**: decisión de Héctor, 22-ago-2026 · **Estado**:
**ratificado** (cierra **A-22** · **D-17**).

**El umbral no introduce un instante nuevo, y esto gobierna su
implementación.** Cuatro horas hábiles es el SLA ideal de la etapa 2, que
§5.2.4 ya fijaba, y el motor materializa ese instante al entrar a la
etapa. El recordatorio se dispara **en el mismo momento en que la etapa 2
pasa a ámbar**: no hay un segundo reloj que configurar, ni un plazo
paralelo que mantener sincronizado, ni un campo nuevo que crear. Un
sistema que almacenara este umbral por separado tendría dos fuentes para
el mismo número, que es lo que la unidad de cómputo común de §5.2 existe
para evitar.

Lo que separa al recordatorio de la escalada no es **cuándo** se
disparan, sino a quién van y qué se espera de cada uno:

  -------------------------------------------------------------------------
  **Momento**       **Qué ocurre**            **A quién**   **Para qué**
  ----------------- ------------------------- ------------- ---------------
  4 h hábiles       La etapa 2 pasa a ámbar ·  Tasador       Que actúe
                    recordatorio               (ejecutor)

  6 h hábiles       La etapa 2 pasa a rojo ·   Responsable   Que intervenga
                    escalada                   del área
  -------------------------------------------------------------------------

*Nota de unidad.* Umbral en horas hábiles, coincidente con el ámbar de la
etapa 2. Pendiente confirmación explícita con Héctor de que la intención
fue hábiles y no reloj (se agrega a la próxima consulta). Si fuese de
reloj, el recordatorio dejaría de coincidir con el ámbar, exigiría
cómputo propio y podría emitirse un sábado.

**Canales. Correo, único** (v1.9.15 · **A-24** cerrada en negativo · D-19).
El cliente había pedido WhatsApp como segundo canal —*"que le llegue un
nuevo mail y un nuevo whatsapp"*— y **retiró la petición** el 23-ago-2026:
por ahora, sólo correo. No se contrata proveedor, no se registran
plantillas ante Meta, no se define número emisor ni se administra opt-in.
La notificación por WhatsApp al tasador sigue registrada como fuera de
alcance de v1.9 en §1.9 · FUT-EJ-10, ahora por decisión explícita y no por
falta de definición, y con ella el campo `M_Tasadores.notificar_whatsapp`,
que queda sin consumidor. **Lo que sí se conserva del contrato** es la
neutralidad de canal del diseño del recordatorio: agregar WhatsApp más
adelante no debe obligar a reescribirlo.

**Tope de respuesta al cliente.** Con independencia de cómo avance la
coordinación, VProperty se compromete a responderle al ejecutivo del
cliente con una fecha de visita —o con el motivo por el cual no la hay—
dentro de las **24 horas hábiles** desde el ingreso de la solicitud. No
es una etapa nueva de la matriz: es una restricción que atraviesa las
etapas 2, 3 y 4, y puede incumplirse con las tres individualmente en
verde.

**Cómo se modela: sólo como corte del reporte de §5.2.9** (v1.9.15 ·
**A-23** cerrada · D-18). El tope se materializa como **reporte diario**,
sin semáforo agregado propio y **sin alerta en pantalla**: ni la bandeja de
§1.1 ni el detalle emiten aviso cuando una solicitud lo supera. Queda
descartado el umbral agregado sobre las etapas 2+3+4 —el motor sigue
midiendo etapas y no gana cómputo nuevo— y queda descartado el atributo
derivado de la etapa 4. No se agrega píldora, banner ni badge de "24 h" a
ninguna pantalla.

*Riesgo asumido, registrado a propósito.* Esta realización no alerta:
alguien tiene que abrir el reporte. Se acepta sobre la base de que el
tablero de §5.2.9 se revisa a diario —el cliente lo describe como
*"vital"* y dice mirarlo *"a cada rato"*—. Si esa práctica cambia, el tope
vuelve a incumplirse sin que nadie lo advierta, y el umbral agregado
vuelve a estar sobre la mesa.

### **5.2.9 Reportes de cumplimiento**

- Cumplimiento de SLA por etapa y por actor, en corte diario, semanal y
  mensual.
- Volumen procesado por visador, contra la capacidad de referencia de
  §5.2.7.
- Volumen y tipología de reprocesos, por cliente y por tasador, sobre el
  catálogo de siete motivos de §5.2.5.
- Desviaciones y sus causas, sobre el catálogo de seis motivos de §2.3.

**El tablero de control diario.** Los reportes de arriba miden el
servicio hacia atrás. Lo que el área usa para trabajar es otra cosa: un
tablero que hoy vive fuera del sistema, en una planilla compartida, y que
el cliente describe como *"vital"* y revisa *"a cada rato"*. Tiene
exactamente dos bloques y ambos son requisito:

  ---------------------------------------------------------------------------
  **Bloque**          **Contenido**                  **Por qué encabeza**
  ------------------- ------------------------------ ------------------------
  Reprocesos          Fecha, código y qué se está    El cliente ya está
  abiertos            pidiendo, sobre el catálogo    escriturando la
                      de §5.2.5                      operación: un reproceso
                                                     demorado detiene una
                                                     firma

  Vencimientos por    Solicitudes agrupadas por      Permite ver cuántos
  antigüedad desde    días transcurridos desde la    informes deben salir hoy
  la visita           fecha real de visita: 4, 3, 2  y por qué uno de cuatro
                      y 1 día                        días no salió al tercero
  ---------------------------------------------------------------------------

**El bloque queda con cuatro grupos, sin día 0** (v1.9.15 · **A-32**
cerrada en negativo). El cliente había planteado incluir las visitas del
propio día y lo descartó el 23-ago-2026: incluirlas convertiría el bloque
de *"lo que está por vencer"* en *"todo lo que está en vuelo"* y diluiría
la señal de urgencia que lo hace útil. Agregar el quinto grupo más
adelante sigue siendo aditivo y no obliga a rehacer nada.

**El reporte que hoy no existe.** No hay forma de saber cuántas
solicitudes llevan más de 24 horas sin fecha de visita. El cliente lo
enuncia sin rodeos: *"yo hoy día no sé de todos los informes cuántos no
tienen fecha de visita"*. Es el reporte que hace verificable el tope de
respuesta al cliente de §5.2.8, y su ausencia es la razón por la que ese
tope se incumple sin que nadie lo advierta hasta que el ejecutivo
reclama. **Desde v1.9.15 es además su única materialización** (A-23 ·
D-18): el tope no tiene semáforo propio ni alerta en pantalla, de modo
que este corte es lo único que lo hace visible. Se especifica en dos
superficies, que consultan lo mismo: un
filtro de la bandeja de §1.1 —solicitudes sin `fecha_visita_programada`,
ordenadas por antigüedad desde el ingreso— y un corte diario que lista
las que superan el tope.

## **5.3 Notificaciones (C_NotificacionesConfig)**

Fuente única de destinatarios, plantillas y canales para todas las
notificaciones automáticas (SC13). Consumida por AT05, AT08 y AT06,
entre otras. El operador puede cambiar destinatario o plantilla sin
tocar código.

Canal al tasador (v1.9): correo, único. La plantilla
`email_asignacion_tasador` se registra en C_Plantillas con las variables
de cabecera, propiedad, personas, reglas de trabajo y adjuntos
detalladas en §1.6.3, y se dispara desde la confirmación manual de
asignación (única, sin reasignación) y desde el reenvío manual. El
aviso por WhatsApp queda fuera de alcance, y con él el campo
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

  AT03     AT03_ejecutar_dag_formulas       estado=visitada    C_Formulas,              TX_Calculos,
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

*[Fuera de scope IF-03 · 27-ago-2026] AT04 (validar rangos de valor) no se implementa en este proyecto; su fila en la tabla de automations anterior se conserva como referencia histórica.*

Nota v1.9.4 sobre AT03. El trigger de AT03_ejecutar_dag_formulas era
`estado=capturada` hasta v1.9.3. Se corrige a `estado=visitada` conforme
a la máquina de estados oficial de §2.11: el estado `capturada` queda
retirado del vocabulario y su rol lo asume `visitada`, que es el estado
al que transiciona la solicitud al presionarse "Calcular Tasación"
(§2.7). El Motor de Cálculo AT01--AT10 v2.6 ya declaraba el trigger
correcto; la divergencia era interna de esta Especificación.

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
  **RF-27**         **Validación de rangos por zona (fuera de scope IF-03)**
  ----------------- -------------------------------------------------------
  **⛔ Alcance**    FUERA DE SCOPE IF-03 · decisión 27-ago-2026: AT04 no se
                    implementa en el proyecto. La descripción siguiente se
                    conserva como referencia histórica; ningún componente de
                    IF-03 la ejecuta.

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

  4        Persistencia del   SC09 → Dropbox →         Sube a Dropbox la carpeta
           PDF                TX_DocumentosGenerados   /informe/ al nivel de la
                                                       solicitud —hermana de las
                                                       carpetas de unidad, no dentro
                                                       de ninguna: el informe cubre la
                                                       solicitud completa (ver §8.1);
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
                    detectar cualquier alteración posterior. El binario vive
                    en
                    /Test_ValueProperty/INFORMES\_{AAAA}/{Cliente}/{codigo_solicitud}/informe/
                    (§8.1): una sola copia por versión, nunca duplicada por
                    unidad, porque duplicarla rompería la correspondencia
                    uno-a-uno entre hash y archivo de la que depende este
                    requisito.

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

**Nota de diseño (v1.9.6) — el path es un snapshot inmutable.** Con la
estructura anterior los cuatro segmentos derivaban de datos que no
cambian una vez creada la solicitud (cliente, año, código). El nivel
`{Unidad}` rompe esa propiedad: `TX_Unidades.subtipo` es un singleSelect
editable por la Ejecutiva mientras la solicitud está en estado creada
(RN-59). Se resuelve declarando que **`TX_Adjuntos.dropbox_path` es un
snapshot del momento de la subida y no se recalcula**: si el subtipo de
una unidad se corrige después de subir un adjunto, el binario **no se
mueve** y el path guardado deja de coincidir con el estado vigente de la
unidad, sin que nada falle ni avise. Se prefiere esta divergencia sobre
la alternativa —mover el binario y reescribir `url_dropbox`—, que
invalidaría las referencias ya entregadas y exigiría un módulo Dropbox de
movimiento no probado en la instancia Make del proyecto. La deuda queda
registrada como **CI-004** en `docs/CODE_INCONSISTENCIES.md`.

## **8.1 Estructura de carpetas**

La estructura de carpetas es descriptiva, jerárquica y coherente con el
resto del proyecto: raíz única, año de la solicitud, cliente
institucional, código de solicitud y **unidad tasada**. Un único árbol
para toda la operación. El nivel Unidad se incorpora en v1.9.6: una
solicitud con N unidades produce N carpetas hermanas al mismo nivel, más
las tres carpetas especiales descritas abajo.

Plantilla canónica:

```
/Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/{archivo}
```

Ejemplos válidos:

```
/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/departamento/certificado_avaluo__20260803-141207__cert_avaluo_depto.pdf
/Test_ValueProperty/INFORMES_2026/AFIANZA/VP-2026-0053/bodega/certificado_avaluo__20260803-141355__cert_avaluo_bodega.pdf
```

  --------------------------------------------------------------------------------------------------------------------
  **Nivel**              **Path**                                              **Contenido**   **Origen del valor**
  ---------------------- ----------------------------------------------------- --------------- -----------------------
  Raíz                   /Test_ValueProperty/                                  Contenedor      Literal fijo. Cuenta
                                                                               único de todos  corporativa Dropbox
                                                                               los archivos    del proyecto

  Año                    /Test_ValueProperty/INFORMES_{AAAA}/                  Segmentación    Prefijo literal
                                                                               anual para      "INFORMES\_" + año
                                                                               retención y     calendario de
                                                                               archivado       TX_Solicitudes.
                                                                                               fecha_solicitud
                                                                                               interpretada en
                                                                                               America/Santiago

  Cliente                /Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/        Segmentación    M_Clientes.nombre
                                                                               por cliente     normalizado según la
                                                                               institucional   regla de §8.5 (p. ej.
                                                                               (p. ej.         AFIANZA,
                                                                               AFIANZA)        BANCO_ESTADO, VALON)

  Solicitud              .../{Cliente}/{codigo_solicitud}/                      Carpeta por     TX_Solicitudes.
                                                                               solicitud       codigo_solicitud
                                                                               (código         (fldDXEE1ejMNVDlpB)
                                                                               VP-AAAA-NNNN)   

  {Unidad}               .../{codigo_solicitud}/{Unidad}/                       Adjuntos que    TX_Unidades.subtipo,
                                                                               pertenecen a    normalizado según la
                                                                               una unidad      tabla de mapeo de esta
                                                                               concreta de la  misma sección. La
                                                                               solicitud       unidad se resuelve por
                                                                                               TX_Adjuntos.unidad
                                                                                               (fldnyrl4M3VGnA51n)

  {Unidad}/{seccion}/    .../{Unidad}/{seccion}/                                Fotos del       IF-03 (§2.5.2).
                                                                               tasador         Secciones: fachada,
                                                                               organizadas por living, cocina, baños,
                                                                               sección dentro  dormitorios, áreas
                                                                               de la unidad    comunes, etc.

  /informe/              .../{codigo_solicitud}/informe/                        PDF final       SC09 → Carbone (§7.1).
                                                                               generado por    Carpeta hermana de las
                                                                               Carbone         unidades: el informe
                                                                               (versiones      cubre la solicitud
                                                                               sucesivas       completa, no una
                                                                               nombradas por   unidad
                                                                               hash)           

  /comun/                .../{codigo_solicitud}/comun/                          Documentos que  IF-01, IF-02 (§1.5.3),
                                                                               cubren varias   IF-04. Un binario, N
                                                                               unidades a la   links en
                                                                               vez (p. ej. una TX_Adjuntos.unidad
                                                                               escritura de    
                                                                               depto +         
                                                                               estacionamiento 
                                                                               + bodega)       

  /\_ingreso/            .../{codigo_solicitud}/\_ingreso/                      Adjuntos        IF-01 y Fase 1 del
                                                                               cargados antes  wizard de IF-02
                                                                               de que existan  (§1.5.0)
                                                                               unidades        
                                                                               declaradas      
  --------------------------------------------------------------------------------------------------------------------

**Mapeo de {Unidad}.** El segmento sale del singleSelect
`TX_Unidades.subtipo` (`fldNU8ee30AvvRWHZ`) y **no** del link `tipo_bien`
→ M_TiposDeBien, que es una taxonomía paralela sin uso en el path. La
normalización es lowercase + snake_case, con la tabla de equivalencia
declarada aquí de forma cerrada:

| `TX_Unidades.subtipo` | Segmento `{Unidad}` |
|---|---|
| Departamento | `departamento` |
| Casa | `casa` |
| Bodega | `bodega` |
| Estacionamiento | `estacionamiento` |
| Terreno | `terreno` |
| Local | `local` |
| Terraza | `terraza` |
| Piscina | `piscina` |
| OO.CC. | `oo_cc` |
| Servidumbre | `servidumbre` |
| Edificacion | `edificacion` |
| *(vacío)* | `sin_subtipo` |

`sin_subtipo` es una excepción documentada, no un valor de negocio:
`subtipo` es un singleSelect no obligatorio y una unidad puede quedar sin
él durante la carga. Su presencia en un path es señal de dato incompleto
y debe poder auditarse como tal.

**Desambiguación de unidades del mismo subtipo.** Una solicitud puede
tener dos estacionamientos, o dos bodegas, y ambos producirían el mismo
segmento. Cuando la solicitud tiene **dos o más unidades del mismo
subtipo**, cada carpeta lleva el sufijo `_{numero_unidad}`
(`TX_Unidades.numero_unidad`, `fldJGXS8jGDKZDdWM`):
`estacionamiento_1/`, `estacionamiento_2/`. Cuando el subtipo es único
dentro de la solicitud, la carpeta va **sin sufijo**: `departamento/`.
La regla es contextual a la solicitud, no global.

**Carpetas especiales.** `informe/`, `comun/` y `_ingreso/` son hermanas
de las unidades, al nivel de `{codigo_solicitud}/`, y quedan reservadas:
ninguna unidad puede normalizar a esos nombres, porque ninguno de los
once valores de `subtipo` los produce.

Convenciones de naming de archivos: prefijo con tipo_adjunto en
snake_case + timestamp UTC en formato AAAAMMDD-HHMMSS + nombre original
saneado. Ejemplo:
escritura\_\_20260702-143012\_\_doc_escritura_prop_los_leones.pdf. Esto
evita colisiones y facilita ordenamiento cronológico natural. El
timestamp del nombre de archivo va en **UTC**; la zona America/Santiago
aplica sólo al cálculo del año del segmento `INFORMES_{AAAA}`. La
reestructuración de v1.9.6 cambia el **path** y no el nombre del
archivo: un ejemplo del tipo `certificado_de_evaluo_departamento.pdf` es
ilustrativo de la ruta, no un nombre de archivo conforme.

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
                                     \'documentos_legales\' para escrituras).
                                     Desde v1.9.6 el valor aparece también
                                     como segmento del path
                                     ({Unidad}/{seccion}/); la redundancia
                                     es deliberada, para poder filtrar en
                                     Airtable sin parsear el string del path

  dropbox_url       URL              URL firmada Dropbox de la última
                                     versión

  dropbox_path      Texto            Path completo en la estructura
                                     /Test_ValueProperty/\... (auditable).
                                     **Snapshot inmutable**: se fija al
                                     subir y no se recalcula si cambia
                                     TX_Unidades.subtipo (ver nota de
                                     diseño de §8 y CI-004)

  unidad            FK →             Unidad a la que pertenece el adjunto.
                    TX_Unidades      Resuelve el segmento {Unidad} del path
                                     (§8.1). Campo real
                                     `TX_Adjuntos.unidad`
                                     (fldnyrl4M3VGnA51n). **No** confundir
                                     con el link de respaldo de superficie
                                     (fldbuwozOajok69sS, inverso de
                                     TX_Unidades.respaldo_adjunto), que
                                     cumple otra función (§1.5.1 Sección B)
                                     y no participa del path. Un mismo
                                     binario puede tener N links cuando el
                                     documento cubre varias unidades, y en
                                     ese caso vive en /comun/

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
                                     para auditoría. ⚠ **Nunca se creó en
                                     Airtable** --- ver nota abajo
  --------------------------------------------------------------------------

Notas de diseño: el campo tipo_adjunto es un Select tipado con enum
acotado para agilidad operativa; cuando el tipo tiene atributos
declarados en D_TipoDocumentoAtributo, el resultado de la extracción
(RN-25 · SC07) se guarda como JSON en el propio adjunto en el campo
`atributos_obtenidos`, evitando tablas intermedias en el dominio D\_ y
preservando el desacople de RN-33 (cero FK cruzada).

Idempotencia por (hash_md5 + solicitud) --- precisión v1.9.5. El hash_md5
evita almacenar duplicados, pero la unidad de comparación **no es el hash
solo**: es el par (hash_md5, solicitud). Un mismo binario puede existir
legítimamente en dos solicitudes distintas —dos operaciones sobre la misma
propiedad comparten escritura o certificado— y cada una necesita su propia
fila. Cuando se sube un binario que ya está indexado **en esa misma
solicitud**, el escenario de subida no crea fila, no vuelve a subir el
archivo a Dropbox y **responde `reused: true` devolviendo el adjunto
existente**. La redacción anterior decía que el sistema "linkea a la fila
existente": es inexacto en dos sentidos --- no se crea vínculo alguno, y
la comparación nunca fue global sino por solicitud. Contrato completo en
§8.6.

**RN-60 --- Unicidad de tipo de documento por solicitud (nueva v1.9.5).**
Formaliza como regla de negocio el invariante ya enunciado en §1.5.1.1 y
§8.2 y consolidado en RF-51 (§8.3) y RF-52 (§8.6.4).

- *Precondición:* una subida desde el checklist declara `tipo_documento`
  (persistido en `clave_adjunto`, `fldaLLtzAaEn1O8IW`) no vacío para una
  `solicitud`.
- *Acción:* el par (`clave_adjunto`, `solicitud`) es único en
  TX_Adjuntos. El backend resuelve el desenlace de la subida --- alta,
  reutilización o reemplazo --- sin que el cliente lo decida (§1.5.1.1,
  §8.6.2). Si ya existe un adjunto de ese tipo con `hash_md5` distinto, el
  previo se elimina de Dropbox y de TX_Adjuntos y el nuevo ocupa su lugar,
  previa confirmación explícita del usuario (RF-52).
- *Postcondición:* para cada par (`clave_adjunto`, `solicitud`) queda a lo
  sumo un adjunto. La idempotencia por (`hash_md5`, `solicitud`) tiene
  **precedencia**: un binario idéntico responde `reused` sin diálogo ni
  reemplazo. Con `tipo_documento` vacío (adjuntos sueltos, fuera del
  checklist) el invariante no aplica.
- *Enforcement lógico, no físico.* El constraint no se implementa como
  índice único en Airtable, que no soporta esa restricción, ni por
  soft-delete sobre un campo `activo` --- que no existe en el schema real
  (§8.2). La unicidad la garantizan el escenario SC-Adjuntos-Upload v1.2
  (módulos 2 y 3, §8.6.2) y los diálogos de confirmación de la interfaz
  (§1.5.1.1). No hay enforcement en la capa de datos: una escritura que
  eludiera esos dos escenarios podría romper el invariante sin que Airtable
  lo impida. Es la contraparte del principio "cero writes directos a
  Airtable desde la aplicación" (RT-03): al no haber otra vía de escritura,
  el escenario Make es el punto único donde el invariante se hace cumplir.

Sobre el campo `activo` --- hallazgo v1.9.5. La tabla de arriba lo declara
desde v1.3, pero **no existe en el schema real de Airtable**: verificado
vía MCP el 02-ago-2026, `TX_Adjuntos` tiene 26 campos y ninguno se llama
`activo`. La consecuencia es que el soft-delete de §8.4 (d) es hoy letra
muerta para esta tabla: no hay campo que poner en FALSE, y por tanto el
borrado duro no es sólo la opción elegida en §8.6 sino la única semántica
implementable. Dos implicaciones operativas: (1) ninguna fórmula de
búsqueda puede filtrar por `{activo} = TRUE()` --- Airtable devuelve
`INVALID_FILTER_BY_FORMULA` y falla la petición completa, no la degrada;
(2) el rastro de auditoría de un adjunto eliminado queda exclusivamente en
`A_Eventos` (§8.6). Crear el campo es prerrequisito de cualquier
soft-delete real y queda como decisión abierta.

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
                    los índices nunca residen fuera de Airtable. El
                    escenario de subida es idempotente por (hash_md5,
                    solicitud) y garantiza el invariante de único adjunto
                    por (solicitud, tipo_documento) mediante reemplazo
                    backend-driven (§1.5.1.1, §8.4 f y g).

  **Criterio de     Auditoría de schema: cero binarios en tablas Airtable
  aceptación**      (todas las URLs apuntan a Dropbox). Auditoría de path
                    (reformulada en v1.9.6, ver cláusula de corte abajo):
                    cero archivos en Dropbox fuera de la estructura
                    /Test_ValueProperty/INFORMES\_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/\...,
                    donde {Unidad} es o bien un segmento derivado de una
                    unidad realmente existente en TX_Unidades para esa
                    solicitud, o bien una de las tres carpetas reservadas
                    informe/, comun/ y \_ingreso/. Test: subir un PDF desde
                    IF-02 crea una fila en TX_Adjuntos con dropbox_url
                    resolvible y dropbox_path conforme. Subir dos veces el
                    mismo archivo al mismo tipo no crea filas duplicadas.
                    Subir un archivo con hash distinto para un tipo que ya
                    tiene adjunto reemplaza el anterior (borra Dropbox +
                    TX_Adjuntos) tras confirmación explícita del usuario.
  -------------------------------------------------------------------------

**Cláusula de corte de la auditoría de path (v1.9.6).** El criterio
anterior era estático —un patrón sobre el string bastaba— porque los
cuatro segmentos salían de datos fijos. El nuevo es relacional: el
segmento `{Unidad}` sólo se puede validar cruzando el path contra las
unidades que la solicitud tiene en `TX_Unidades`, de modo que la
auditoría deja de ser un barrido del árbol y pasa a ser una verificación
cruzada archivo ↔ Airtable.

Además, la estructura nueva no es la que produce hoy la implementación
viva: el escenario `SC-Adjuntos-Upload` en producción y el helper
`lib/adjuntos.ts` escriben `/VProperty/Tasaciones/{codigo_ext}/…`
(registrado como **CI-003**). Aplicar el criterio retroactivamente daría
100% de incumplimiento el primer día sobre archivos que están
correctamente guardados según la norma vigente cuando se subieron. Por
eso:

- La auditoría de path aplica **sólo a solicitudes con
  `fecha_solicitud >= 2026-08-06`**, fecha del merge del commit que
  incorpora esta v1.9.6. El corte se evalúa sobre `fecha_solicitud`
  convertida a America/Santiago, con el mismo criterio de zona que el
  segmento `INFORMES_{AAAA}` (§8.5).
- Las solicitudes anteriores quedan *grandfathered* en la estructura
  `/VProperty/Tasaciones/{codigo_ext}/…` y **no cuentan** para el
  criterio, ni a favor ni en contra.
- La migración del contenido histórico y el alineamiento de los
  escenarios Make quedan diferidos a una tanda posterior, sin fecha
  comprometida (CI-003).

## **8.4 Requisitos técnicos**

\(a\) Upload directo cliente → Dropbox vía API Route Next.js con
streaming (nunca a través de Airtable Attachments). (b) Retry automático
con backoff exponencial ante fallos de red (5 intentos,
30s/2m/5m/15m/60m). (c) Modo offline en IF-03 (RF-14): cola local
IndexedDB para fotos que se suben al recuperar señal. (d) Soft-delete:
TX_Adjuntos.activo=FALSE nunca elimina el archivo de Dropbox; el binario
se conserva por auditoría. (e) URLs firmadas con expiración de 4 horas
para los previews embebidos; renovación transparente vía API Route. (f)
Idempotencia por hash+solicitud implementada en SC-Adjuntos-Upload
(Router con filtros exist/notexist en ambas rutas). (g) Reemplazo
backend-driven: el mismo escenario detecta adjunto previo del mismo tipo
con distinto hash y ejecuta borrado del previo (Dropbox + Airtable) antes
de subir el nuevo. El cliente sólo responsable de la UX de confirmación.

Sobre el filtro de ambas rutas en (f). En Make, una ruta de Router sin
filtro **no** es la rama "si no" de las anteriores: se ejecuta siempre y
en paralelo a ellas. Dejar sin filtro la ruta de alta hace que un
duplicado detectado responda "reutilizado" y, aun así, suba el archivo y
cree la fila. Por eso el requisito exige el par complementario
exist/notexist explícito en las dos rutas, y no sólo en la de detección.

Alcance del soft-delete de (d) frente a (f) y (g). El soft-delete sigue
siendo la regla general del sistema: `activo=FALSE` conserva el binario
por auditoría. Los dos flujos del checklist descritos en §1.5.1.1
—reemplazo por hash distinto y desmarcado explícito— son la **excepción
acotada**: ejecutan borrado duro de la fila y del binario. El motivo es
que el invariante de único archivo por tipo sería indistinguible de su
violación si las versiones sustituidas siguieran presentes con
`activo=FALSE`, y porque en ambos casos media una confirmación explícita
del usuario sobre un documento que él mismo cargó y decide descartar. La
excepción no se extiende a ninguna otra interfaz ni a los documentos
generados por el sistema (SC09), que conservan el soft-delete íntegro.

Refuerzo de la acotación (v1.9.5). El campo `activo` que (d) presupone
**nunca se creó en Airtable** (§8.2). Mientras no exista, el soft-delete
no es implementable en `TX_Adjuntos` y el borrado duro de (g) no compite
con una alternativa: es la única semántica disponible. La compensación de
auditoría es obligatoria y vive en `A_Eventos` (§8.6). Si se decidiera
crear el campo, (d) recupera su alcance general y (g) sigue siendo la
excepción acotada de los dos flujos del checklist.

\(h\) Variables de entorno de los escenarios de adjuntos. La subida usa
**`MAKE_WEBHOOK_URL_ADJUNTOS`** ---nombre real en el repositorio, no
`MAKE_WEBHOOK_URL_ADJUNTOS_UPLOAD`---, que no cambia de valor al
desplegar la v1.2 porque el escenario reutiliza el mismo hook y el mismo
endpoint. El borrado exige una variable nueva,
`MAKE_WEBHOOK_URL_ADJUNTOS_DELETE`. Ambas se leen server-side; ninguna
admite prefijo `NEXT_PUBLIC_`. La firma HMAC de las dos usa el mismo
`MAKE_HMAC_SECRET` (§8.6).

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
TX_DocumentosGenerados. Tablas leídas: TX_Solicitudes
(`codigo_solicitud`, `fecha_solicitud`, `cliente`), M_Clientes
(`nombre`), TX_Unidades (`subtipo`, `numero_unidad`), D_TipoDocumento
(referencia soft). Servicio externo: Dropbox API v2 (upload, thumbnail
opcional, temporary link).

**Corrección de v1.9.6.** Hasta v1.9.5 esta lista declaraba
`TX_Solicitudes.cliente_slug` y `M_Clientes.slug_url` como fuentes del
segmento de cliente. **Ninguno de los dos campos existe** en
`app9G7lLkIV3CpeLa` —verificado vía MCP el 06-ago-2026—, de modo que la
dependencia era ficticia. La fuente real es `M_Clientes.nombre`
(`fldDGR9WLhOtIbikW`, singleLineText), alcanzado desde
`TX_Solicitudes.cliente` (`fldttL5myzLohDwHv`, link).

Las dos subsecciones siguientes desarrollan esa lista de dependencias y
aplican a toda la Sección 8, no sólo a SC10.

### Fuente y normalización del segmento {Cliente} (Sección 8)

`M_Clientes.nombre` es texto libre y contiene mayúsculas inconsistentes,
acentos, espacios y símbolos: conviven `AFIANZA` y `Afianza` como
registros distintos, `VALÓN Hipotecaria`, `Banco Estado`, `M&V`,
`La Construcción Hipotecaria`. El segmento del path se obtiene aplicando
esta normalización, declarada aquí para que cualquier implementación
—Route Handler, escenario Make o script de auditoría— produzca
exactamente el mismo string:

```
normalizarCliente(nombre):
    s = nombre
    s = quitarDiacriticos(s)        # NFD + strip de marcas combinantes: VALÓN → VALON
    s = mayusculas(s)               # UPPERCASE completo
    s = reemplazar(s, "&", "_Y_")   # M&V → M_Y_V
    s = eliminar(s, ".")            # los puntos se borran, no se sustituyen
    s = reemplazar(s, " ", "_")     # Banco Estado → BANCO_ESTADO
    s = colapsar(s, "__" → "_")     # repetir hasta que no queden dobles
    s = recortarBordes(s, "_")      # sin guion bajo inicial ni final
    devolver s
```

Casos verificados contra datos reales: `AFIANZA` → `AFIANZA`;
`Afianza` → `AFIANZA`; `VALÓN Hipotecaria` → `VALON_HIPOTECARIA`;
`Banco Estado` → `BANCO_ESTADO`; `M&V` → `M_Y_V`;
`La Construcción Hipotecaria` → `LA_CONSTRUCCION_HIPOTECARIA`.

Consecuencia aceptada: la normalización **colapsa registros duplicados**
de `M_Clientes` que difieren sólo en capitalización o acentuación
(`AFIANZA`/`Afianza`, las dos filas de `VALÓN Hipotecaria`). Dos
solicitudes con clientes formalmente distintos en Airtable comparten
carpeta. Se prefiere así: la alternativa —una carpeta por registro—
fragmentaría el árbol de un mismo cliente institucional por un defecto de
datos maestros. La deduplicación de `M_Clientes` es tarea aparte.

### Zona horaria del segmento {AAAA} (Sección 8)

`TX_Solicitudes.fecha_solicitud` (`fldvkn9CsORy4eU0Z`) es de tipo
**dateTime y se almacena en UTC**. El año de `INFORMES_{AAAA}` se calcula
sobre esa marca **convertida a America/Santiago**, no sobre el valor UTC
crudo. Sin esa conversión, toda solicitud creada entre las 21:00 del 31
de diciembre y la medianoche local caería en la carpeta del año
siguiente. La zona es fija: el proyecto opera en Chile y no admite
configuración por cliente.

## **8.6 Escenarios Make de adjuntos (SC-Adjuntos-Upload v1.2 · SC-Adjuntos-Delete)**

Esta subsección especifica los dos escenarios Make que materializan el
invariante de único archivo por tipo de §1.5.1.1 y los requisitos (f) y
(g) de §8.4. Incorporada en v1.9.5.

El invariante —para cada par (solicitud, tipo_documento) existe a lo sumo
un adjunto en TX_Adjuntos— convierte la subida en una operación con tres
desenlaces en vez de uno. El borrado deja de ser un flujo independiente y
pasa a ser, en el caso más frecuente, una fase interna de la subida. De
ahí el reparto:

| Escenario | Cuándo corre | Estado |
|---|---|---|
| **SC-Adjuntos-Upload v1.2** | Toda subida desde el checklist. Resuelve alta / reemplazo / reutilización | Evolución de v1.1 (activo) |
| **SC-Adjuntos-Delete** | Sólo cuando el usuario desmarca un documento y confirma | Por construir |

**Decisión arquitectónica.** El reemplazo lo detecta y ejecuta el
backend. El cliente no compara hashes, no consulta si hay adjunto previo
y no envía flags: emite siempre la misma petición, y el escenario decide
el camino. La interfaz sólo es responsable de la UX de confirmación. Esto
sostiene el principio rector —la UI muestra y captura, nunca decide— y
evita el modo de fallo del reparto contrario: un cliente que cree que no
hay previo, porque su lista está desactualizada, manda un alta y rompe el
invariante en silencio.

**Plan Make: Pro.** Sin restricción de escenarios activos. Los cinco
—SC01, SC-Edicion, SC-Asignar, SC-Adjuntos-Upload v1.2 y
SC-Adjuntos-Delete— conviven activos, y desaparece la rotación manual que
hasta ahora era fuente de fallos de prueba difíciles de diagnosticar: un
escenario apagado se ve igual que un escenario roto.

### **8.6.1 Contrato del webhook SC-Adjuntos-Upload v1.2**

Payload de entrada: **ningún campo nuevo respecto de v1.1, ningún flag**.
El contrato es idéntico al que ya emite el Route Handler de subida, lo
que permite desplegar v1.2 sin tocar código.

```json
{
  "solicitud_id":     "recIEvKCbe7J8TDaB",
  "codigo_ext":       "VP-2026-0053",
  "tipo_documento":   "foto_ofertas_comparables",
  "nombre_archivo":   "Foto REF Ofertas y REF CBR del inf.JPG",
  "mime_type":        "image/jpeg",
  "tamanio_kb":       155,
  "hash_md5":         "6a37495c2c7b5f324ab966b254067308",
  "subido_por":       "Ejecutivo",
  "contenido_base64": "…"
}
```

`tipo_documento` es el `codigo` de D_TipoDocumento; se persiste en
`clave_adjunto` (`fldaLLtzAaEn1O8IW`) y es la clave por la que el
escenario localiza al adjunto previo. **No** se usa `tipo`
(`fldUYBO3LeOHxiIGW`): es un singleSelect heredado con opciones
incoherentes que ningún escenario escribe.

Header: `X-VP-Signature: hmac-sha256(body, MAKE_HMAC_SECRET)`. Sin
cambios respecto de los demás escenarios.

Respuesta, con el campo nuevo `modo`:

```jsonc
// alta
{ "ok": true, "modo": "nuevo", "adjunto_id": "24", "url_dropbox": "/Test_ValueProperty/…", "nombre_archivo": "…", "tamanio_kb": 155, "reused": false }

// mismo binario, ya existía en esta solicitud
{ "ok": true, "modo": "reused", "adjunto_id": "24", "url_dropbox": "/Test_ValueProperty/…", "nombre_archivo": "…", "tamanio_kb": 155, "reused": true }

// binario distinto para un tipo que ya tenía archivo
{ "ok": true, "modo": "reemplazo", "adjunto_id": "25", "adjunto_previo_id": "recn0UEsUU6FHHvgx", "url_dropbox": "/Test_ValueProperty/…", "nombre_archivo": "…", "tamanio_kb": 210, "reused": false }

// error
{ "ok": false, "error": "…", "reintentable": true }
```

`modo` ∈ { `nuevo`, `reemplazo`, `reused` }. `adjunto_previo_id` sólo
viaja en `reemplazo` y es el **record ID** del adjunto eliminado, que
alimenta el evento de auditoría (§8.6.5). El campo `reused` se conserva
por compatibilidad con el cliente actual, que ya lo consume; es
redundante con `modo` y queda marcado para retiro cuando el cliente
migre.

### **8.6.2 Blueprint conceptual de SC-Adjuntos-Upload v1.2**

Módulos, no JSON. El blueprint ejecutable se deriva del de v1.1, que
conserva las conexiones de Airtable y Dropbox.

**Módulo 1 · Webhook custom.** Mismo hook y mismo endpoint que v1.1. No
se reprovisiona: el despliegue de v1.2 es transparente para la aplicación.

**Módulo 2 · Search Records por (hash + solicitud).** Tabla TX_Adjuntos,
límite 1, fórmula ya en producción desde v1.1:
`AND({hash_md5} = "{{1.hash_md5}}", ARRAYJOIN({solicitud}) = "{{1.codigo_ext}}")`.
Si encuentra, responde `reused: true`, `modo: "reused"` y termina, sin
tocar Dropbox ni crear filas.

> **Dependencia frágil a vigilar.** `ARRAYJOIN({solicitud})` rinde el
> *primary field* del registro vinculado, que es `codigo_solicitud`
> (`fldDXEE1ejMNVDlpB`, fórmula) --- **no** `codigo_ext`
> (`fldSuJx1fDNYYwDcD`). Hoy coinciden (verificado vía MCP el
> 02-ago-2026: ambos `VP-2026-0053` para `recIEvKCbe7J8TDaB`). Son campos
> distintos que casualmente coinciden; si divergen, esta comparación y la
> del módulo 3 fallan a la vez y en silencio.

Este chequeo es por (hash, solicitud) y **no** por tipo: si el mismo
binario ya está cargado en otro tipo de la misma solicitud, se devuelve
`reused`. Es deliberado —el binario ya está en Dropbox y volver a subirlo
no aporta— pero implica que un archivo no puede figurar en dos tipos a la
vez. Si el negocio llegara a exigirlo, este módulo pasa a (hash +
solicitud + tipo).

**Módulo 3 · Search Records por (solicitud + tipo_documento).** Sólo se
ejecuta si el módulo 2 no encontró nada. Tabla TX_Adjuntos, límite 1,
fórmula
`AND(ARRAYJOIN({solicitud}) = "{{1.codigo_ext}}", {clave_adjunto} = "{{1.tipo_documento}}")`.
Si encuentra, hay adjunto previo del mismo tipo con distinto hash —el
mismo hash ya se descartó en el módulo 2— y corresponde la rama de
reemplazo. Si no encuentra, corresponde la rama de alta.

La fórmula **no** filtra por `{activo} = TRUE()`: ese campo no existe en
el schema real (§8.2) y su uso devolvería `INVALID_FILTER_BY_FORMULA`,
haciendo fallar toda subida y no sólo los reemplazos.

Salvaguarda: `tipo_documento` puede llegar vacío —los adjuntos sueltos no
vienen del checklist—. Con `tipo_documento` vacío **el invariante no
aplica** y la rama de reemplazo debe quedar inhibida: si no,
`{clave_adjunto} = ""` haría match contra los adjuntos sueltos de la
solicitud y el primero sería borrado. La rama exige `tipo_documento` no
vacío como condición explícita.

**Rama de reemplazo.** (1) Get record del previo, recuperando
`url_dropbox` y `hash_md5`. (2) Dropbox · Delete a file del previo. (3)
Airtable · Delete record del previo. (4) Continúa el flujo normal de
subida: upload del nuevo binario y creación de la fila. (5) Responde
`modo: "reemplazo"` con `adjunto_previo_id`.

> `url_dropbox` (`fldEccoUrOjV7oKZ5`) **no es una URL** pese a ser de tipo
> `url` en Airtable: el escenario escribe ahí el `path_display`, la ruta
> dentro de Dropbox. Es exactamente lo que `Delete a file` espera; no debe
> normalizarse al visor web. El valor observado en producción sigue el
> path de la implementación viva —`/VProperty/Tasaciones/VP-2026-0053/Foto
> REF Ofertas.JPG`—, que a partir de v1.9.6 diverge de la estructura
> normativa de §8.1 hasta que se ejecute la migración diferida (CI-003).

> `airtable:ActionDeleteRecord` exige el record ID en la clave **`id`**
> del mapper, **no** en `record`. Ponerlo en `record` deja `id` sin
> definir y produce `[422] "records" must be a non-empty array of record
> IDs` --- la causa raíz del fallo F-1 de SC-Edicion. El plural del
> mensaje no implica que el módulo sea plural.

**Rama de alta.** Sin previo: upload a Dropbox y creación de fila, como
en v1.1. Responde `modo: "nuevo"`.

**Filtro explícito en todas las ramas.** En Make, una ruta de Router sin
filtro se ejecuta siempre y en paralelo a las demás; no es un "si no".
Con tres ramas el riesgo se triplica respecto del defecto corregido en
v1.1: cada una lleva su filtro explícito y mutuamente excluyente,
construido con el par `exist` / `notexist` sobre los identificadores de
los dos Search Records.

**Log.** Escritura en LogEscenarios con el mapper poblado, registrando el
`modo` resuelto. Los módulos de log de v1.1 tienen el mapper vacío y
crean filas en blanco en cada ejecución: ruido, no observabilidad. Es
deuda preexistente que no debe replicarse.

### **8.6.3 Contrato y blueprint de SC-Adjuntos-Delete**

Se usa exclusivamente cuando el usuario desmarca un documento del
checklist y confirma la eliminación. No participa del reemplazo, que es
interno a v1.2.

**Identificador: record ID, no `adjunto_id`.** Conviven dos y sólo uno
sirve:

| Identificador | Campo | Tipo | Quién lo tiene |
|---|---|---|---|
| `adjunto_id` | `fldVt7Lk1ptvmgbtT` | autoNumber (ej. 24) | Lo devuelve el escenario de subida; el cliente lo guarda en el estado del checklist |
| record ID | — | `rec…` | Lo expone la lectura de adjuntos por solicitud |

El contrato usa el record ID: es lo que `ActionDeleteRecord` exige,
permite reutilizar el guard de validación de record ID y evita un Search
adicional sólo para resolver el autoNumber. En consecuencia, el checklist
debe casar su fila con el adjunto persistido por `clave_adjunto` para
obtener el record ID; el autoNumber que hoy guarda el estado del
componente no sirve para borrar.

Payload:

```json
{
  "adjunto_record_id": "recn0UEsUU6FHHvgx",
  "solicitud_id":      "recIEvKCbe7J8TDaB",
  "codigo_ext":        "VP-2026-0053",
  "hash_md5":          "6a37495c2c7b5f324ab966b254067308",
  "subido_por":        "Ejecutivo"
}
```

Header `X-VP-Signature` idéntico al de subida. Respuestas:

```jsonc
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": true,  "airtable_borrado": true }
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": false, "airtable_borrado": true,  "aviso": "huerfano_dropbox" }
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": false, "airtable_borrado": false, "ya_no_existia": true }
{ "ok": false, "error": "…", "reintentable": true }
```

El campo `error` viaja para el log del servidor, **nunca al usuario**: la
interfaz emite el literal humano canónico.

**Blueprint conceptual.** (1) Webhook custom, con la URL registrada en
Z_Webhooks. (2) Airtable Get record sobre TX_Adjuntos, con `url_dropbox`,
`hash_md5` y `solicitud` entre los campos de salida, y tres salvaguardas
antes de destruir nada: que el registro exista —si no, se responde
`ya_no_existia`—; que su `hash_md5` coincida con el del payload, para
borrar el archivo que el usuario vio y no otro que ocupe ese record ID
tras una carrera; y que su `solicitud` corresponda al `codigo_ext`
recibido, lo que impide que un identificador manipulado borre adjuntos de
otra solicitud. (3) Dropbox · Delete a file, con manejo de error que
continúa ante `path_not_found` —el binario ya no estaba, se borra la fila
igual y se responde `dropbox_borrado: false`— y que corta antes del paso
siguiente ante cualquier otro fallo, porque es preferible no borrar nada
a crear un huérfano invisible. (4) Airtable Delete record, con el record
ID en la clave `id`. (5) Respuesta del webhook. (6) Log en LogEscenarios
con mapper poblado.

Las opciones `ADJUNTOS_DELETE` y `ADJUNTOS_UPLOAD_V2` deben crearse
primero como valores del singleSelect `Escenario` de LogEscenarios y
recién después declararse en el cliente de Make: el helper degrada a
`Escenario` vacío si la opción no existe, y la traza se pierde a medias.

### **8.6.4 RF-52 · Eliminación y reemplazo de adjuntos del checklist**

  -------------------------------------------------------------------------
  **RF-52**         **Eliminación y reemplazo de adjuntos del checklist**
  ----------------- -------------------------------------------------------
  **Descripción**   La Ejecutiva puede sustituir el archivo de un tipo de
                    documento del checklist por otro distinto, y puede
                    eliminarlo sin sustituto al desmarcar el tipo. Ambas
                    operaciones eliminan el binario en Dropbox y la fila en
                    TX_Adjuntos, se ejecutan íntegramente en escenarios Make
                    (§8.6.2 y §8.6.3) sin escritura directa desde la
                    aplicación, y exigen confirmación explícita del usuario
                    mediante diálogos distintos y no intercambiables
                    (§1.5.1.1). Quedan deshabilitadas en modo consulta
                    (RN-59).

  **Criterio de     Reemplazo: subir un archivo con hash distinto a un tipo
  aceptación**      que ya tiene adjunto deja exactamente una fila para ese
                    par (solicitud, tipo_documento), con el binario anterior
                    ausente de Dropbox y un evento `adjunto_reemplazado` en
                    A_Eventos con ambos identificadores. Desmarcado: al
                    confirmar, el tipo queda sin archivo, la fila desaparece
                    de TX_Adjuntos, el binario de Dropbox y se registra
                    `adjunto_eliminado`. Idempotencia: repetir la
                    eliminación de un adjunto ya eliminado devuelve éxito
                    sin efectos. Modo consulta: la petición de borrado o
                    reemplazo sobre una solicitud asignada con tasador es
                    rechazada por el servidor con 409, con independencia del
                    estado de los controles de la interfaz.
  -------------------------------------------------------------------------

Requisitos de interfaz asociados, vinculados a §1.5.1.1:

**Diálogo de reemplazo.** Al pulsar subir sobre un tipo que ya tiene
adjunto, se muestra confirmación **antes** de abrir el selector de
archivo, con el literal: *"El documento [Tipo de documento] ya tiene un
archivo cargado ([nombre_archivo previo]). Si continúas con un archivo
distinto, se reemplazará el anterior de forma permanente. Solo se
conserva un archivo por tipo de documento. ¿Deseas continuar?"* Botones:
destructivo "Reemplazar" y "Cancelar". El diálogo se dispara por *tener
adjunto previo*, no por *saber que el hash difiere*: el cliente no conoce
el hash hasta que el usuario elige archivo. Si acaba eligiendo el mismo
binario, el backend responde `reused` y no se reemplaza nada; la
confirmación habrá sido innecesaria pero nunca engañosa, porque advirtió
de un riesgo que no llegó a materializarse.

**Diálogo de desmarcado.** El literal pasa a: *"El archivo será eliminado
permanentemente de la solicitud y del almacenamiento. Esta acción no se
puede deshacer."* Botón destructivo "Eliminar definitivamente". El texto
vigente hasta v1.9.5 —que el archivo se mantiene en los adjuntos— deja de
ser cierto y no debe conservarse.

**Feedback de progreso.** Ambas confirmaciones disparan escritura, así
que aplican la regla de progreso: botón deshabilitado mientras la
operación está en vuelo, indicador de carga, y el texto en gerundio
("Eliminando…", "Reemplazando…"). El reset del estado va en la cláusula
`finally`, nunca sólo en el manejo de error.

**Endpoint de borrado.** Ruta nueva `app/api/adjuntos/[id]` con método
DELETE, que espeja al de subida: rechaza sin sesión; degrada con aviso si
faltan las variables de entorno en lugar de romper la consola; valida el
segmento `[id]` con el guard de record ID; valida el cuerpo con esquema,
incluido `solicitud_id`; revalida RN-59 server-side devolviendo 409; y
delega en Make con firma HMAC. El tiempo de espera es menor que el de
subida —30 segundos frente a 45— porque no viaja binario. Los errores
técnicos sólo se registran en el log del servidor.

**Lectura de adjuntos.** La lectura por solicitud debe incorporar
`hash_md5` a los campos recuperados y al tipo expuesto: es el dato que
alimenta la salvaguarda de §8.6.3.

**Refresco tras la mutación.** Tras `modo: "nuevo"`, `modo: "reemplazo"`
o un borrado confirmado, la lista de adjuntos se relee desde Airtable. No
se confía en el estado local: si el borrado fue parcial o el reemplazo
abortó, el checklist debe reflejar la verdad de la base y no el optimismo
del cliente. En el desmarcado, el tipo sólo se marca como vacío si la
relectura confirma la desaparición. Tras `reused` el refresco es
innecesario —nada cambió— pero inofensivo.

**Mensajes de resultado.** Reemplazo: "Documento reemplazado". Desmarcado:
"Documento eliminado". Fallo: "No pudimos completar la acción. Intenta
nuevamente en unos segundos." Éxito parcial con `dropbox_borrado: false`:
se trata como éxito de cara al usuario, porque el huérfano en Dropbox es
un problema de operación que la Ejecutiva no puede resolver ni necesita
entender; queda registrado en LogEscenarios.

Variables de entorno: §8.4 (h).

### **8.6.5 Consistencia, fallos parciales y trazabilidad**

**Orden de operaciones.** Dentro del reemplazo: Delete en Dropbox, Delete
en Airtable, y sólo entonces subida del nuevo binario. Si el Delete de
Dropbox falla, se **aborta el reemplazo completo**: no se borra la fila,
no se sube el archivo nuevo, y se responde error reintentable. El estado
queda exactamente como estaba antes de la petición, que es el único
estado seguro. **Nunca debe quedar el previo borrado sin reemplazo real**:
un tipo que pierde su archivo y no recibe el sustituto es peor que un
reemplazo que no ocurrió, porque el usuario ya confirmó y asume que hay
documento.

El orden Dropbox→Airtable responde a que, de los dos estados
inconsistentes alcanzables, sólo uno es recuperable:

| Escenario | Estado resultante | Recuperable |
|---|---|---|
| Dropbox OK, Airtable falla | Fila apuntando a un archivo inexistente | **Sí** — visible en la interfaz y auditable; el usuario reintenta y el Delete de Dropbox falla benignamente mientras el de Airtable completa |
| Airtable OK, Dropbox falla | Binario huérfano en Dropbox, sin fila que lo referencie | **No** — nadie lo ve nunca desde la aplicación |

**No hay rollback transaccional.** Make no lo ofrece entre aplicaciones
distintas y no se simulará re-subiendo binarios. La estrategia es orden,
aborto temprano e idempotencia; no compensación.

**Sin reintento automático.** Un reintento ciego sobre una operación
destructiva con tiempo de espera agotado es la receta para borrar dos
veces lo que la primera vez sí funcionó. El reintento lo decide la
persona, con el botón, sobre una lista ya recargada. El campo
`reintentable` es señal para el texto del aviso, no instrucción de
reintento automático.

Matriz de fallos parciales:

| Fallo | Respuesta | Airtable | Dropbox | Acción |
|---|---|---|---|---|
| Delete Dropbox del previo (reemplazo) | `ok: false` | previo intacto | previo intacto | abortar; nada cambió |
| Delete Airtable del previo (reemplazo) | `ok: false` | previo vivo, apunta a nada | previo borrado | visible y auditable; el reintento del usuario lo resuelve |
| Upload del nuevo, tras borrar el previo | `ok: false` | tipo vacío | previo borrado | **peor caso**; el usuario ve el tipo vacío y vuelve a subir |
| Delete Dropbox (desmarcado), `path_not_found` | `ok: true` + aviso | fila borrada | ya no estaba | ninguna |
| Delete Dropbox (desmarcado), otro error | `ok: false` | fila intacta | archivo intacto | reintento manual |

El peor caso —tercera fila— es el precio de no tener transacción. Se
mitiga con el orden, que deja la subida del nuevo en último lugar cuando
ya no queda nada que deshacer, y es visible: el tipo queda vacío en el
checklist, no en un estado engañoso.

**Idempotencia del borrado.** Dos defensas, ninguna suficiente sola. En
el cliente, el botón deshabilitado en vuelo cubre el doble clic pero no
la doble pestaña ni el reintento tras un tiempo de espera agotado. En el
escenario, el Get record es el guard real: si el registro ya no existe,
no corre ni el borrado en Dropbox ni el de Airtable, y se responde éxito
con `ya_no_existia`. **Un borrado repetido devuelve éxito, no 404**: el
estado final deseado ya se cumple, y devolver 404 obligaría al cliente a
distinguir dos casos que para el usuario son el mismo. En el reemplazo la
idempotencia la da el módulo 2: reintentar la misma subida encuentra el
hash ya cargado y devuelve `reused`, sin volver a borrar nada.

**RN-59 en dos capas.** Con la solicitud en modo consulta —estado
distinto de creada y con tasador asignado, §1.4— quedan deshabilitados
los tres flujos: subir, reemplazar y desmarcar. La interfaz deshabilita
controles como feedback rápido; el servidor revalida y devuelve 409. La
interfaz no decide reglas de negocio: deshabilitar un botón es feedback,
no control de acceso.

**Trazabilidad en A_Eventos.** Ambos flujos destructivos registran evento
(`tipo_evento` es texto libre):

| Flujo | `tipo_evento` | Contenido |
|---|---|---|
| Reemplazo | `adjunto_reemplazado` | `adjunto_previo_id` + `adjunto_nuevo_id` + `tipo_documento` + `subido_por` |
| Desmarcado | `adjunto_eliminado` | `adjunto_id` + `tipo_documento` + `subido_por` |

Sin esto, el borrado duro deja un hueco de auditoría: el binario ya no
está, la fila tampoco, y no queda rastro de que existieron. Como
TX_Adjuntos no tiene campo `activo` (§8.2), **el evento es lo único que
sobrevive al borrado**, y es lo que hace aceptable la excepción al
soft-delete de §8.4 (d). Se escribe desde el escenario Make, nunca desde
la aplicación.

**Consumo del plan.** Un reemplazo son unos siete módulos frente a los
cuatro de un alta. No es preocupante al volumen actual del plan Pro, pero
conviene medirlo antes de extender el patrón a IF-03, donde el volumen de
fotografías es de otro orden de magnitud.

### **8.6.6 Prerrequisitos de construcción**

Dos decisiones bloquean el inicio de la construcción:

1. **Guard de RN-59 server-side.** No existe hoy en el repositorio un
   helper de editabilidad ni constante equivalente, pese a que la guía de
   construcción lo cita como si existiera. Debe decidirse si se implementa
   el helper o si el guard se resuelve leyendo estado y tasador en cada
   Route Handler.
2. **Campo `activo`.** Debe decidirse si se crea en TX_Adjuntos —lo que
   devolvería vigencia al soft-delete de §8.4 (d)— o si se asume
   formalmente el borrado duro como semántica única.

Resto de la lista de construcción: crear las opciones de escenario en
LogEscenarios; evolucionar el blueprint de subida a v1.2, reimportarlo y
verificar el nombre del escenario en Make; escribir, importar, registrar
y activar el blueprint de borrado; declarar la variable de entorno nueva
en el entorno local, en Railway y en la guía del repositorio; incorporar
`hash_md5` a la lectura de adjuntos; crear el endpoint DELETE; ajustar el
checklist con los dos diálogos y el feedback de progreso; emitir los
eventos de auditoría; verificar el orden alfabético del checklist exigido
por §1.5.1.1, hoy sin garantía explícita en el cliente; y cubrir con
pruebas el guard de record ID, el borrado repetido, los tres valores de
`modo` y los literales humanos.

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

  RN-44    Botón "Asignar Tasador": visibilidad,    §1.6.1
           datos mínimos y efecto (nueva v1.9,
           reescrita v1.9.1)

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

  RN-52    Una tasación, un hilo de correo (nueva  §1.6.3, §5.3
           v1.9)

  RN-53    Las 4 h de primer contacto son política §1.9, §1.9.1,
           interna configurable (nueva v1.9)       §5.2.4

  RN-54    El reloj del SLA se detiene con la      §1.9.1, §2.3,
           solicitud bloqueada por contacto no     §5.2.1
           logrado (nueva v1.9, diferida)

  RN-55    El reproceso tiene SLA propio: mañana → §1.9.1, §5.2.5
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

  RN-59    Modo consulta activado por estado y     §1.4, §1.6.2,
           tasador asignado (nueva v1.9, reescrita §2.3, §2.5
           v1.9.1; excepción acotada a
           TX_ContactosVisita en v1.9.4)

  RN-60    Unicidad de tipo de documento por       §1.5.1.1, §8.2, §8.3
           solicitud (nueva v1.9.5)                (RF-51), §8.6.4 (RF-52)
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
  Cierra FUT-EJ-04 y responde el pendiente D-05. Desde v1.9.7 es el SLA
  ideal de la etapa 2 de §5.2.4, con 6 h como máximo tolerado antes de que
  la etapa entre en rojo.
- RN-54 · El reloj del SLA se detiene mientras la solicitud está
  bloqueada por contacto no logrado. Es una pausa por estado y es
  excepcional; no debe confundirse con la pausa por calendario de §5.2.1,
  que aplica a toda solicitud fuera de la ventana hábil. El catálogo de
  motivos con que el tasador declara el contacto no logrado se especifica
  en §2.3 (RF-TAS-12); la marca de bloqueo y la pausa automática del reloj
  siguen diferidas.
- RN-55 · El reproceso tiene SLA propio: lo que llega en la mañana se
  entrega al mediodía; lo que llega al mediodía, en la tarde. Desde v1.9.7
  queda enunciada con sus cortes horarios completos y su matriz R1–R3 en
  §5.2.5, bajo el nombre operativo "reproceso limpio".
- RN-56 · Una tasación produce un solo archivo Excel de cálculo y hasta
  tres PDF versionados; los valores del PDF deben coincidir con los del
  Excel que lo originó.
- RN-57 · El honorario del tasador y la comisión al cliente se gatillan
  con el envío del informe al cliente, no con su recepción.
- RN-58 · El sello verde no aplica a casas ni a departamentos full
  eléctricos; en esos casos se registra "no aplica" y no se deja vacío.
- RN-59 · Enunciada con precondición, acción y postcondición en §1.4.
  La excepción acotada —TX_ContactosVisita editable en estado asignada
  mientras la coordinación esté rechazada— rigió entre v1.9.4 y v1.9.8,
  se retiró en v1.9.9 y **queda repuesta en v1.9.10** con el cierre
  positivo de CI-012 (19-ago-2026 · revisión Héctor diseño v4). RN-59
  admite hoy esa única excepción, y sólo sobre contactos de visita.
  RF-TAS-04 depende de ella y por eso vuelve a ser implementable.

Tres de estas reglas —RN-54, RN-55 y RN-57— describen comportamiento que
v1.9 no implementa. Se declaran igualmente para que la versión que
implemente los flujos diferidos de §1.9.1 no tenga que volver a
definirlas. v1.9.7 profundiza esa declaración para RN-53, RN-54 y RN-55
al incorporar los SLA operacionales en §5.2, sin cambiar su estado de
implementación: siguen diferidas.

Nota v1.9.7 sobre RF-53 (nuevo). Es el único identificador que agrega
esta versión. Se enuncia en §5.2 con las nueve subsecciones §5.2.1 a
§5.2.9 como contenido normativo, y proviene del insumo
`VProperty_SLA_Negocio_v1.1`. No renumera ningún RF previo: el último
asignado era RF-52 (§8.6.4), y RF-13 y RF-28 siguen reservados sin
reasignar, conforme a la regla de trazabilidad histórica.

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

  Capacidad de visación  Número de informes que un visador procesa por jornada hábil: 20, derivado de
  (v1.9.7)               ~400 tasaciones mensuales sobre 20 días hábiles y del SLA de 30 minutos por
                         informe. Parámetro operativo de dimensionamiento, no límite del sistema
                         (§5.2.7).

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

  Fecha planificada      Fecha que el tasador acuerda con el contacto de visita al coordinar
  de visita (v1.9.9)     (§2.3). Llega pre-llenada al formulario de captura y es editable.

  Fecha real de          Fecha en que la visita efectivamente ocurrió, registrada por el tasador en
  visita (v1.9.9)        terreno (§2.8 · RF-TAS-17). Es obligatoria para calcular y es la que declara
                         el informe. Se reprograma con frecuencia respecto de la planificada, por lo
                         que las dos se persisten por separado y no deben usarse indistintamente.

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

  Dropbox path           Ruta jerárquica
  (v1.3 · reestructurado /Test_ValueProperty/INFORMES\_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/{archivo}.
  en v1.9.6)             Raíz literal, año calendario de fecha_solicitud en America/Santiago
                         con prefijo INFORMES\_, cliente normalizado desde M_Clientes.nombre
                         (§8.5), código VP-AAAA-NNNN y unidad derivada de
                         TX_Unidades.subtipo. Tres carpetas hermanas reservadas al nivel de
                         la solicitud —informe/, comun/ y \_ingreso/— cubren lo que no
                         pertenece a una unidad concreta. Descrita en §8.1. Se persiste en
                         TX_Adjuntos.dropbox_path como snapshot inmutable, para
                         auditabilidad. Sustituye a la ruta
                         /VProperty/{ClienteSlug}/{AAAA}/{codigo_solicitud}/{subcarpeta}/
                         vigente hasta v1.9.5.

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

  Horario hábil (v1.9.7) Ventana en que corre el reloj del SLA: lunes a viernes de 9:00 a 18:00,
                         excluidos sábados, domingos y feriados de H_Feriados. Fuera de ella el
                         conteo se pausa, aunque los buzones reciban correo 24x5 (§5.2.1).

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

  Recepción del correo   Hito que inicia el SLA. No es la llegada del correo al buzón institucional,
  (v1.9.7)               sino el momento en que Control y Seguimiento lo abre e ingresa la solicitud
                         al sistema, con acuse formal al ejecutivo del cliente (§5.2.2).

  Regla wildcard         Regla del motor con casi todos los filtros vacíos. Garantiza que cualquier
                         solicitud resuelva al menos a una regla (RN-19, RF-24).

  Renta perpetua         V = ingreso anual neto / cap rate.

  Reproceso (v1.9)       Devolución de un informe ya entregado, solicitada por el cliente semanas
                         después del envío, cuando está escriturando y detecta que falta un
                         antecedente. Motivos de forma: nombre o RUT incompletos de comprador o
                         vendedor, dirección que no coincide con el certificado de número, permiso de
                         edificación o recepción final faltantes. Motivo de fondo: antecedente que
                         exige reanálisis. Tiene SLA propio (RN-55), especificado con su matriz
                         R1--R3 en §5.2.5. Documentado en §1.9.1; su gestión en el sistema se
                         difiere (FUT-EJ-08).

  Reproceso limpio       Regla operativa de despacho de reprocesos: lo ingresado la tarde anterior o
  (v1.9.7)               en la mañana sale antes de las 12:00--14:00; lo ingresado después de las
                         14:00--15:00, en la tarde del mismo día. Objetivo: abrir cada jornada sin
                         reprocesos pendientes (RN-55, §5.2.5).

  Rol SII                Identificador catastral asignado por el SII. Formato NNNNN-N.

  RUT                    Rol Único Tributario. Formato N.NNN.NNN-D. Validado con módulo 11 (RN-02).

  Saneamiento            Capa previa al cálculo que normaliza valores no-numéricos sin abortar el
                         flujo (RN-24). Conserva el valor crudo en \*\_raw.

  SLA                    Compromiso de tiempo del servicio, en dos niveles: el plazo agregado por
                         cliente y tipo de informe (1 a 30 días, C_SLA), que alimenta el semáforo
                         verde/ámbar/rojo de bandeja (RN-04); y el plazo por etapa del workflow, en
                         horas hábiles (§5.2.4, RF-53). Ambos excluyen feriados chilenos.

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
emergentes de la reestructuración v1.3, los D-10 a D-15 emergentes del
levantamiento operativo v1.9, D-16, emergente de la incorporación de los
SLA operacionales del negocio en v1.9.7, y D-17 a D-22, emergentes de la
segunda tanda de audios del cliente y de la revisión de la plantilla
operativa vigente en v1.9.13. **D-17, D-20 y D-21 quedan cerradas en
v1.9.14** con las respuestas de Héctor del 22-ago-2026; D-22 entra en esa
misma versión.

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

  D-10       ⚠ SUPERSEDED (v1.9.1, 22-jul-2026): Héctor + Ejecutiva 31-ago-2026
  (v1.9)     la maqueta implementada no tiene    comercial
             flujo de reasignación formal (REGLA
             A) — no hay "reasignaciones" que
             limitar. Pregunta original: límite
             de reasignaciones por
             indisponibilidad del tasador,
             ¿bloqueo o advertencia a partir de
             la segunda?

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

  D-16       Perfiles de entregable en           Héctor + Ingeniero 30-sep-2026
  (v1.9.7)   generación documental (Carbone):    de Integraciones
             §5.2.6 define tres perfiles         (Carbone.io)
             —Estándar (PDF), Resumen ejecutivo
             (PDF + Excel) y Unidad de Vivienda
             Habitacional (PDF con hoja de
             resumen embebida)—, pero §7
             especifica hoy un PDF único. Falta
             definir cómo Carbone genera el
             Excel de resumen y el PDF con hoja
             embebida, o si esa generación
             ocurre fuera de Carbone. Origen:
             insumo VProperty_SLA_Negocio_v1.1,
             incorporado en v1.9.7. Impacto: §7
             y §5.2.6. Abierta.

  D-17       Umbral del recordatorio automático  Héctor Martínez    **CERRADA**
  (v1.9.13)  de coordinación al tasador          (product owner)    22-ago-2026
             (§5.2.8). **Resuelta: 4 horas
             hábiles**, que coinciden con el
             SLA ideal de la etapa 2 y con el
             instante que el motor ya calcula,
             de modo que el recordatorio no
             introduce reloj ni campo nuevos.
             Los 8 h que declaraban los audios
             no se sostienen. Cierra A-22.
             Queda pendiente, como confirmación
             menor, que la unidad sea hábil y
             no de reloj. Impacto: §5.2.8,
             §5.2.4.

  D-18       Modelado del tope de 24 horas para  Héctor Martínez +  **CERRADA**
  (v1.9.13)  responder al cliente con fecha de   Arquitecto de      23-ago-2026
             visita (§5.2.8). **Resuelta: sólo   Software
             corte del reporte de §5.2.9** —sin
             semáforo agregado propio y sin
             alerta en pantalla—. Quedan
             descartados el umbral agregado
             sobre las etapas 2 a 4 y el
             atributo derivado de la etapa 4.
             Riesgo asumido: esta realización no
             alerta, y depende de que el tablero
             se revise a diario. Cierra A-23.
             Impacto: §5.2.4, §5.2.8, §5.2.9.

  D-19       Proveedor y contrato del canal      Héctor + Ingeniero **CERRADA**
  (v1.9.13)  WhatsApp para los recordatorios al  Make               23-ago-2026
             tasador (§5.2.8). **Resuelta en
             negativo: no por ahora, sólo
             correo.** El cliente retira la
             petición; no se contrata proveedor
             ni se registran plantillas. §1.9 ·
             FUT-EJ-10 se mantiene, ahora por
             decisión explícita. El diseño del
             recordatorio conserva su
             neutralidad de canal. Cierra A-24.
             Impacto: §5.2.8, §5.3.

  D-20       Domicilio de los defaults           Arquitecto de      **CERRADA**
  (v1.9.13)  constructivos de §2.8.1.            Datos + Héctor     22-ago-2026
             **Resuelta: partición por tipo de
             propiedad × estado de uso**,
             replicando los dos interruptores
             de la plantilla vigente. Cierra
             A-27 y, con ella, A-14. Crear la
             tabla sigue exigiendo aprobación
             explícita: es trabajo de schema,
             no ambigüedad. Impacto: §2.8,
             §2.8.1, RF-TAS-08, RF-TAS-23.

  D-21       Composición real de los factores    Héctor + Visador   **CERRADA**
  (v1.9.13)  de homogeneización (§2.8).          titular            22-ago-2026
             **Resuelta: los tres factores
             —superficie, edad y distancia— se
             usan en la práctica y RF-TAS-08
             queda ratificado tal como está.**
             La ausencia en la plantilla es
             propiedad del artefacto, no del
             método. Cierra A-28. **No cierra
             A-18**, que pide el valor por
             defecto de cada factor. Impacto:
             §2.8, RF-TAS-08. **Contradicha en
             parte por v1.9.15**: el cuadro que
             el tasador fotografía tampoco trae
             los tres factores. Ver D-23.

  D-22       Qué son `D. F.` y `F. M.`, los dos  Héctor + Visador   31-oct-2026
  (v1.9.14)  factores multiplicativos del        titular
             cuadro de valoración
             `[Excel: Portada!AX50 · BA50]`,
             ambos con default 1. Su nombre
             desarrollado no figura en el libro
             y no fueron mencionados al
             ratificar D-21, de modo que dejan
             de ser un posible reemplazo de los
             tres factores. Falta determinar si
             siguen vivos o son arrastre
             histórico, y si el motor debe
             replicarlos. Registrada como A-35.
             **No bloqueante.** Impacto: §2.8,
             §6. Abierta.

  D-23       Los tres factores de                Héctor + Visador   31-oct-2026
  (v1.9.15)  homogeneización ratificados por     titular            
             D-21 no aparecen en el flujo real
             (§2.8). Desde el cierre de A-13 la
             única entrada de comparables es la
             foto del cuadro, y ese cuadro no
             trae columnas de factor. Falta
             determinar dónde se aplican hoy,
             si el motor debe replicarlos y qué
             relación tienen con `D. F.` y
             `F. M.`. Registrada como A-44.
             **No bloqueante.** Ligada a D-22.
             Impacto: §2.8, RF-TAS-08, §6.

  D-24       Valor por defecto de los factores   Héctor + Óscar     **CERRADA**
  (v1.9.15)  de homogeneización (§2.8).                             23-ago-2026
             **Cerrada por disolución del
             requisito, no por respuesta.** Con
             la sección D en sólo lectura no
             hay campo que precargar: RF-TAS-08
             pierde su conjunto de factores y
             `GET /api/tasaciones/config/
             defaults` no se construye.
             `C_FactoresHomogeneizacion` queda
             sin consumidor en IF-03. La cifra
             nunca se respondió: si vuelve la
             captura, A-18 revive. Cierra A-18.
             Impacto: §2.8, RF-TAS-08.
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
informe (§7) no se modifican. La estructura Dropbox (§8) **sí se
modifica desde v1.9.6**: se reestructura la ruta de adjuntos, se
introduce el nivel Unidad y §7.1 paso 4 cambia de `/informe_final/` a
`/informe/` en consecuencia.

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
