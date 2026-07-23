**IA SOLUTION**

*Consultoría de Automatización con IA*

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**ARQUITECTURA**

**ENTERPRISE**

**Versión 2.8**

**VProperty --- Sistema Configurable de Tasaciones**

*Make ejecuta · Airtable decide · Carbone presenta*

+-----------------------------------------------------------------------+
| **PRINCIPIOS NO NEGOCIABLES**                                         |
|                                                                       |
| Cero lógica hardcodeada en Make                                       |
|                                                                       |
| Cero dependencia de Excel para fórmulas                               |
|                                                                       |
| Cero modificaciones para agregar clientes                             |
|                                                                       |
| Cero deuda técnica: configuración \> código                           |
+-----------------------------------------------------------------------+

  --------------------- -------------------------------------------------
  **Cliente**           VProperty --- Tasaciones Bienes Raíces

  **Preparado por**     IA Solution · Consultoría de Automatización con
                        IA

  **Fecha**             Julio 2026

  **Versión**           2.8 --- Arquitectura Enterprise Configurable
                        (sucede a 2.7 · sincroniza la definición de
                        TX_Comparables con el schema real de Airtable
                        leído vía MCP el 23-jul-2026: 38 campos con sus
                        fórmulas reales; `uf_m2` queda sustituido por
                        `uf_m2_terreno` y `uf_m2_construccion`. Mantiene
                        de 2.7: AT02 no se invoca automáticamente desde
                        IF-02 — asignación de tasador es manual, única,
                        vía botón "Asignar Tasador"; no existe
                        reasignación formal)

  **Stack**             Next.js 14/16 (App Router · Turbopack · Railway)
                        · React 19 · TypeScript 5.7 · Tailwind v4
                        (@theme) · shadcn/ui v4 sobre \@base-ui/react 1.5
                        · lucide-react · react-hook-form + zod · sonner ·
                        cmdk · Clerk · v0.dev → Claude Code · Airtable ·
                        Make · Claude API · Carbone.io · Dropbox · Gmail
                        · Mindicador · pnpm

  **Clasificación**     Confidencial --- Uso interno VProperty
  --------------------- -------------------------------------------------

# Índice del documento

Este documento describe una arquitectura **enterprise, configurable y
mantenible a largo plazo** para el sistema de tasaciones de VProperty.
La premisa de fondo es simple: *todo lo que pueda ser dato, será dato*.
Nada de lógica viviendo dentro de un escenario de Make o de una fórmula
de Excel. La configuración se centraliza en Airtable; Make solo
orquesta; Carbone solo presenta.

**1.** El equipo de 9 especialistas4

**2.** Principios arquitectónicos no negociables6

**3.** Arquitectura en 5 capas8

**4.** Modelo completo de base de datos Airtable11

**5.** Motor de reglas de negocio21

**6.** Diseño de formularios25

**7.** Automatizaciones Make30

**8.** Generación documental con Carbone.io34

**9.** Flujo end-to-end completo37

**10.** Auditoría y trazabilidad total39

**11.** Escalabilidad, permisos y mantenibilidad42

**12.** Próximos pasos y plan de implementación45

**13.** Auditoría XLSM y actualizaciones al modelo48

**14.** Adenda v2.2 --- Segunda auditoría forense y evolución
arquitectónica78

**Nota editorial**

Esta versión 2.6 reemplaza al documento de arquitectura v2.5 (mayo 2026)
y queda alineada a la Especificación del Proyecto v1.4 (Julio 2026), a
la Capa de Datos v2.6.2 y al Blueprint de Interfaces v2.8. Los cambios
más relevantes respecto a v2.5: (a) se incorpora el stack tecnológico
real medido en los repositorios v0 de las tres interfaces productivas
(IF-02 Ejecutiva, IF-03 Tasador, IF-04 Visador): Next.js 16 (App Router
· Turbopack · Railway), React 19, TypeScript 5.7, Tailwind v4
configurado vía \@theme (sin tailwind.config.js), shadcn/ui v4 sobre
\@base-ui/react 1.5 (base-ui, nunca Radix), lucide-react,
react-hook-form + zod, sonner, cmdk y pnpm como gestor; RT-01 de la
Especificación conserva la referencia a Next.js 14 como piso mínimo
compatible; (b) se renombra el flag D_Atributo.uso_interfaz_tasador a
uso_interfaz_negocio (RN-34 revisada) para reflejar vocación transversal
de todas las interfaces que reciben documentos; (c) se incorporan los
campos D_Atributo.version (snapshot de parametría para reproducibilidad
histórica) y D_Documento.extraccion_incompleta (fallo parcial de SC07
sin bloquear la máquina de estados); (d) se agrega el escenario Make
SC10_generar_thumbnails para miniaturas de imágenes en TX_Adjuntos; (e)
las tres interfaces v0.dev quedan documentadas como base preservada, con
las restricciones técnicas transversales del §4.4 del Blueprint v2.8
(Tailwind v4 sin config, base-ui en lugar de Radix, importaciones
nombradas explícitas de shadcn sin sustitución, evitar sticky bottom bar
en presencia de portales Select). Los cambios de v2.4 → v2.5 permanecen
vigentes: (a\') las cuatro UIs principales ---Cliente externo,
Ejecutiva, Tasador y Visador--- se implementan en una app Next.js (App
Router) + Clerk + Railway, generada con v0.dev y construida con Claude
Code; (b\') las demás UIs internas (IF-05 a IF-13) continúan en Airtable
Interfaces; (c\') Softr queda fuera del stack del proyecto; (d\') Make
conserva su rol de transportista puro. Respecto al cambio histórico v1.0
→ v2.0: **(i)** la generación de PDF migra de plantilla HTML a
Carbone.io, **(ii)** se descarta Softr y se adopta una app Next.js 14 +
Clerk (desplegada en Railway) como capa de presentación oficial para las
UIs principales (Cliente, Ejecutiva, Tasador, Visador), generada con
v0.dev y mantenida con Claude Code; el resto de las UIs internas vive en
Airtable Interfaces, **(iii)** se elimina el \"equipo de monitoreo\" ---
el sistema se auto-monitorea desde Airtable, **(iv)** toda la lógica de
negocio se externaliza a tablas de configuración en Airtable, de manera
que Make queda como ejecutor puro, sin condicionales propias.

# 1. El equipo de 9 especialistas

Diseñar un sistema enterprise que sobreviva años no es trabajo de una
sola disciplina. **Nueve perfiles** aportaron simultáneamente a este
diseño. Cada decisión arquitectónica que aparece en el documento pasó
por los nueve filtros antes de quedar firme.

![Blueprint técnico](media/image1.png "Blueprint"){width="6.875in"
height="4.583333333333333in"}

*Figura 1.1 --- Equipo multidisciplinario que respalda esta
arquitectura.*

## Qué aporta cada perfil al diseño

  -----------------------------------------------------------------------
  **Perfil**            **Aporte específico al sistema**
  --------------------- -------------------------------------------------
  **Arquitecto de       Define la separación de responsabilidades entre
  Software Enterprise** capas. Garantiza acoplamiento bajo: cambiar la
                        app Next.js no debe romper Carbone. Aplica el
                        principio Open/Closed: agregar funcionalidad sin
                        modificar lo existente.

  **Diseñador de Bases  Construye el modelo normalizado. Separa maestros,
  de Datos              transacciones, configuración, históricos, logs y
  Relacionales**        auditoría en dominios independientes. Define
                        claves, índices lógicos y reglas de integridad
                        referencial.

  **Especialista en     Traduce el modelo lógico a tablas reales: tipos
  Airtable**            de campo, vistas, filtros, lookups, rollups y
                        fórmulas. Diseña las vistas operativas
                        (dashboard, alertas, cola de trabajo) sin
                        acoplarlas a la lógica de negocio.

  **Ingeniero de        Construye escenarios idempotentes que leen su
  Automatización Make** comportamiento desde Airtable. Implementa manejo
                        de errores, reintentos, backups y colas. Make
                        queda como ejecutor: cero condicionales propios.

  **Analista Funcional  Traduce las reglas implícitas del XLSM y de la
  Senior**              operación actual en reglas declarativas y
                        configurables. Documenta cada caso de uso, sus
                        actores, sus precondiciones y sus efectos.

  **Ingeniero de        Modela el flujo end-to-end y los estados por los
  Procesos**            que pasa cada solicitud. Define las transiciones
                        válidas (state machine) y los puntos donde se
                        requiere intervención humana.

  **Arquitecto de       Diseña el catálogo de plantillas Carbone, el
  Sistemas              versionamiento de los informes generados, las
  Documentales**        convenciones de nombres y la política de
                        retención. Garantiza que cualquier informe pasado
                        pueda reproducirse exactamente.

  **Especialista en     Extrae fórmula por fórmula del XLSM, las
  Migración Legacy      reescribe en formato declarativo en C_Formulas,
  Excel**               las prueba contra resultados históricos del Excel
                        y solo aprueba la migración cuando coinciden al
                        100%.

  **Diseñador del Motor Construye la tabla C_ReglasNegocio y el algoritmo
  de Reglas**           de resolución (filtrado por contexto,
                        ordenamiento por prioridad y especificidad).
                        Define el lenguaje declarativo con el que el
                        negocio configurará el sistema sin código.
  -----------------------------------------------------------------------

## Cómo trabajan en conjunto

- **Decisiones técnicas con doble visado:** cada decisión sobre
  estructura de datos pasa por el Diseñador BD y el Especialista
  Airtable. Cada decisión sobre lógica de negocio pasa por el Analista
  Funcional y el Diseñador del Motor de Reglas.

- **Nadie diseña en solitario:** el Ingeniero Make y el Especialista
  Airtable acuerdan juntos qué consulta Airtable cada escenario. Esto
  evita escenarios Make con lógica de negocio incrustada.

- **Reglas pasan por dos firmas:** el Analista Funcional escribe la
  regla, el Arquitecto Enterprise valida que respeta los principios.
  Solo entonces se carga a C_ReglasNegocio.

- **Migración Excel no se delega:** el Especialista en Migración Legacy
  es la única persona que toca el XLSM. Cualquier hallazgo sobre cómo
  \"realmente\" funciona una fórmula queda documentado antes de
  migrarse.

+-----------------------------------------------------------------------+
| **Principio operativo del equipo**                                    |
|                                                                       |
| Ningún perfil tiene poder de veto solo. Cualquier decisión            |
| arquitectónica se discute. Pero una vez firmada por los nueve, no se  |
| vuelve a abrir salvo evidencia nueva. Esto es lo que permite que el   |
| sistema avance sin oscilaciones.                                      |
+-----------------------------------------------------------------------+

# 2. Principios arquitectónicos no negociables

Antes de modelar tablas o diseñar escenarios, el equipo acordó **siete
principios** que no se rompen. Si una propuesta concreta del documento
se contradice con alguno de ellos, gana el principio. Esto es lo que
hace al sistema mantenible a largo plazo.

+-----------------------------------------------------------------------+
| **PRINCIPIO #1**                                                      |
|                                                                       |
| **Configuración antes que código**                                    |
|                                                                       |
| Si una decisión puede expresarse como un dato (una fila en una        |
| tabla), nunca se expresará como código en Make. Cero condicionales    |
| hardcodeados, cero rutas estáticas, cero valores mágicos. Esto        |
| incluye: a qué cliente pertenece una solicitud, qué fórmulas aplican, |
| qué plantilla se usa, a quién se notifica.                            |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PRINCIPIO #2\                                                       |
| Make es transportista, Airtable es el cerebro**                       |
|                                                                       |
| Make es un transportista de datos entre aplicaciones. Su único rol es |
| mover información desde una fuente externa hacia Airtable, o desde    |
| Airtable hacia un servicio externo. Toda lógica, todo cálculo, toda   |
| decisión, toda validación y toda orquestación de estado vive en       |
| Airtable mediante Automations, Scripts y fórmulas. Si un escenario    |
| Make contiene algo que no sea leer de una fuente y escribir en otra,  |
| está mal diseñado.                                                    |
|                                                                       |
| Anti-patrón explícitamente prohibido: Un escenario Make que resuelve  |
| el motor de reglas, ejecuta la cadena de fórmulas, asigna el tasador, |
| valida rangos del valor calculado o gestiona la cola de reintentos.   |
| Estas son responsabilidades exclusivas de Airtable Automations y      |
| Scripts.                                                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PRINCIPIO #3**                                                      |
|                                                                       |
| **Una sola fuente de verdad por concepto**                            |
|                                                                       |
| Cada dato vive en un solo lugar. Las plantillas viven en              |
| C_Plantillas. Las fórmulas en C_Formulas. Los clientes en M_Clientes. |
| Si un dato aparece en dos lugares, uno es lookup del otro --- nunca   |
| dos versiones que puedan divergir. El XLSM deja de ser fuente de      |
| verdad para fórmulas el día que C_Formulas las reproduce al 100%.     |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PRINCIPIO #4**                                                      |
|                                                                       |
| **Open/Closed: abierto a extensión, cerrado a modificación**          |
|                                                                       |
| Agregar un nuevo cliente, una nueva plantilla, una nueva fórmula o un |
| nuevo workflow nunca requiere modificar lo que ya está construido.    |
| Solo se agregan filas a tablas de configuración. Esto es lo que       |
| garantiza que el sistema pueda crecer durante años sin acumular deuda |
| técnica.                                                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PRINCIPIO #5**                                                      |
|                                                                       |
| **Auditoría es ciudadana de primera clase**                           |
|                                                                       |
| Cada acción del sistema --- humana o automática --- deja un evento en |
| A_Eventos. Cada decisión del motor de reglas queda en                 |
| A_DecisionesMotor con la regla ganadora y las descartadas. Cada       |
| cambio en cualquier dato queda en A_Cambios. La pregunta \"¿por qué   |
| este informe salió así?\" siempre tiene respuesta reconstruible.      |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **PRINCIPIO #6**                                                      |
|                                                                       |
| **Idempotencia en todas las automatizaciones**                        |
|                                                                       |
| Ejecutar el mismo escenario Make dos veces produce el mismo           |
| resultado, no duplicados. Cada escenario verifica el estado antes de  |
| actuar. Si un paso ya fue ejecutado, lo salta. Esto permite           |
| reintentos automáticos seguros y recuperación ante fallos sin temor a |
| corrupción de datos.                                                  |
+-----------------------------------------------------------------------+

+-------------------------------------------------------------------------+
| **PRINCIPIO #7**                                                        |
|                                                                         |
| **Reversibilidad permanente**                                           |
|                                                                         |
| En ninguna etapa de la operación el sistema bloquea el camino de        |
| vuelta. El XLSM convive como rollback durante la migración. Cualquier   |
| cambio en configuración queda versionado en H_PlantillasAnteriores y    |
| H_FormulasAnteriores. Si una nueva versión rompe algo, se restaura la   |
| anterior con un campo \"activa = true\".                                |
+-------------------------------------------------------------------------+
| **Qué pasa cuando una propuesta concreta choca con un principio**       |
|                                                                         |
| Gana el principio. Sin excepciones. Si la propuesta es necesaria, se    |
| rediseña hasta que cumpla. Esto es lo que distingue una arquitectura    |
| enterprise de un parche bonito: la consistencia ante la presión.        |
+-------------------------------------------------------------------------+

## Anti-patrones que están explícitamente prohibidos

- **IF dentro de Make sobre el negocio.** Si necesitas saber qué cliente
  es o qué tipo de informe pidieron para decidir un siguiente paso, lo
  consultas en Airtable, no lo hardcodeas en Make.

- **Fórmulas en Excel que el sistema use.** El XLSM solo se mantiene
  como respaldo histórico. Cualquier cálculo que el sistema necesite
  vive en C_Formulas y se ejecuta en Airtable o en Make consultando
  C_Formulas.

- **Plantillas dentro del código.** Cero HTML en Make. Cero strings de
  Word incrustados. Las plantillas son .docx en Dropbox referenciadas
  desde C_Plantillas.

- **Lista de emails hardcodeados.** Los destinatarios viven en
  C_NotificacionesConfig. Si el visador cambia, se edita una fila, no se
  abre un escenario.

- **Pasos sin registrar.** Cualquier acción del sistema que no escriba
  en A_Eventos es un bug. La auditoría no es opcional.

# 3. Arquitectura en 5 capas

El sistema se organiza en **cinco capas estrictamente separadas**. Cada
capa solo conoce a sus vecinas; cambiar una herramienta dentro de una
capa no afecta a las demás. Esto es lo que permite que el sistema
sobreviva a cambios de proveedores, de equipo y de requerimientos
durante años.

![Blueprint técnico](media/image2.png "Blueprint"){width="6.875in"
height="4.583333333333333in"}

*Figura 3.1 --- Las 5 capas del sistema. Cada una con responsabilidades
únicas y bien definidas.*

## Capa 1 --- Presentación

Captura datos del mundo real y muestra resultados. **No contiene lógica
de negocio bajo ninguna circunstancia.**

- **Formularios en la app Next.js + Clerk:** externo (solicitud),
  tasador (visita en terreno), revisión y aprobación.

- **Vistas Airtable:** dashboard operativo, vistas filtradas por rol,
  vistas de configuración.

- **Emails Gmail:** el destinatario, el contenido y el momento están en
  C_NotificacionesConfig. Gmail solo envía.

- **PDFs entregados:** son artefactos de presentación; la lógica de su
  contenido vive en datos + plantilla.

**Stack real de las UIs Next.js (medido en repositorios v0 · adenda
v2.6).** Las tres interfaces productivas (IF-02 Ejecutiva, IF-03
Tasador, IF-04 Visador) se construyen sobre Next.js 16.2.6 con App
Router y Turbopack, React 19 y TypeScript 5.7, empaquetadas con pnpm. La
UI usa Tailwind CSS v4 configurado exclusivamente vía \@theme en
app/globals.css (sin tailwind.config.js), shadcn/ui v4 montado sobre
\@base-ui/react 1.5 como librería de primitivos accesibles (base-ui,
nunca Radix; se usan render prop y nativeButton en lugar de asChild),
lucide-react como sistema de iconos, class-variance-authority + clsx +
tailwind-merge para el helper cn, tw-animate-css para animaciones y
next-themes cuando aplica. Formularios y validación con
react-hook-form + zod; toasts con sonner; command palette con cmdk
(usado en el buscador del diálogo "Asignar Tasador" de IF-02 — v1.9 no
tiene flujo de reasignación formal, sólo asignación manual única).
Estas piezas
son responsabilidad de Capa 1; ninguna toca reglas de negocio.

**Restricciones técnicas transversales (recordatorio operativo).**
Tokens Tailwind se consumen como custom properties en :root vía
arbitrary value syntax; jamás Radix (todos los primitivos vienen de
\@base-ui/react); las importaciones nombradas de shadcn son explícitas y
no se sustituyen; el sticky action bar se evita cuando conviven portales
Select en la misma pantalla (se recurre a botones inline). Estas
restricciones están recogidas en el Blueprint de Interfaces v2.8 §4.4 y
son de aplicación obligatoria en las tres interfaces v0.dev.

## Capa 2 --- Integración de servicios externos

**Make conecta Airtable con el mundo exterior: webhooks desde la app
Next.js (Cliente, Ejecutiva, Tasador, Visador), APIs de generación
documental (Carbone.io), APIs de extracción IA (Claude API),
almacenamiento (Dropbox), email (Gmail), indicadores económicos
(Mindicador). No orquesta pasos del flujo de negocio interno. La
orquestación vive en Airtable Automations. Cuando una transición de
estado requiere cruzar hacia un servicio externo, una Airtable
Automation dispara el escenario Make correspondiente. Make ejecuta el
transporte y deposita el resultado de vuelta en Airtable.**

## Capa 3 --- Motor de reglas

Es **el cerebro del sistema**. Recibe un contexto (cliente + tipo +
propiedad + banco + comuna) y devuelve qué plantilla usar, qué fórmulas
aplicar, qué workflow ejecutar y a quién notificar. Vive en la tabla
C_ReglasNegocio y se evalúa con fórmulas Airtable o Scripts Airtable
según complejidad.

## Capa 4 --- Datos

Único punto de verdad. Modelo relacional normalizado en 6 dominios:
**Maestros · Configuración · Transacciones · Históricos · Auditoría ·
Automatizaciones**. Cualquier dato que el sistema use vive en alguna de
estas tablas; nada flota en un escenario Make o en un Excel suelto.

## Capa 5 --- Generación

Convierte datos en documentos. Hoy es Carbone.io + Dropbox; mañana
podría ser otra herramienta sin afectar al resto del sistema, porque la
única interfaz es *\"recibir un JSON y devolver un PDF\"*.

## Reglas de comunicación entre capas

+---------------------------------------+-------------------+-----------------------------------+
| **Desde**                             | **Hacia**         | **Qué viaja**                     |
+=======================================+===================+===================================+
| **Presentación**                      | Orquestación      | Eventos crudos (submit de         |
|                                       |                   | formulario, webhook entrante).    |
|                                       |                   | Sin lógica.                       |
+---------------------------------------+-------------------+-----------------------------------+
| **Orquestación**                      | Motor de reglas   | Contexto de la solicitud (IDs de  |
|                                       |                   | cliente, tipo, propiedad...).     |
+---------------------------------------+-------------------+-----------------------------------+
| **Motor de reglas**                   | Datos             | Consultas a tablas de             |
|                                       |                   | configuración. Solo lectura.      |
+---------------------------------------+-------------------+-----------------------------------+
| **Datos**                             | Motor de reglas   | Filas que matchean las            |
|                                       |                   | condiciones (plantilla_id,        |
|                                       |                   | formulas\[\], workflow_id).       |
+---------------------------------------+-------------------+-----------------------------------+
| **Orquestación**                      | Datos             | Inserts en transacciones y        |
|                                       |                   | auditoría. Lecturas a maestros.   |
+---------------------------------------+-------------------+-----------------------------------+
| **Orquestación**                      | Generación        | JSON estructurado + ID de         |
|                                       |                   | plantilla.                        |
+---------------------------------------+-------------------+-----------------------------------+
| **Generación**                        | Datos             | Registro del documento generado   |
|                                       |                   | (URL, hash, versión).             |
+---------------------------------------+-------------------+-----------------------------------+
| **Orquestación**                      | Presentación      | Emails, notificaciones,           |
|                                       |                   | actualizaciones de estado         |
|                                       |                   | visibles.                         |
+---------------------------------------+-------------------+-----------------------------------+
| **Lo que NUNCA debe ocurrir entre capas**                                                     |
|                                                                                               |
| Presentación NO conoce a Datos directamente para escrituras de negocio. La app Next.js puede  |
| leer Airtable directamente (lecturas idempotentes), pero toda escritura que dispara una       |
| transición de estado pasa por Make como integrador. Esto preserva la trazabilidad y la        |
| auditoría.                                                                                    |
|                                                                                               |
| Motor de reglas NO escribe en Datos. Solo lee. Las escrituras las hace Orquestación.          |
|                                                                                               |
| Generación NO consulta el Motor de reglas. Recibe ya el ID de plantilla resuelto.             |
|                                                                                               |
| Datos NO inicia procesos. Es pasiva. Solo responde a consultas y registra escrituras.         |
+-----------------------------------------------------------------------------------------------+

## Cómo se materializa cada capa en el stack

  ---------------------------------------------------------------------------
  **Capa**           **Herramientas concretas**   **Reemplazable por**
  ------------------ ---------------------------- ---------------------------
  **Presentación**   Next.js + Clerk (UIs         Typeform · Jotform ·
                     principales) · Airtable      cualquier email provider
                     Interfaces (UIs internas) ·  
                     Gmail                        

  **Orquestación**   Make · Webhooks              n8n · Zapier (con
                                                  limitaciones)

  **Motor de         Airtable (tabla + fórmulas + Cualquier motor declarativo
  reglas**           scripts)                     / DB con CASE

  **Datos**          Airtable (15+ tablas en 6    Postgres · MySQL · Notion
                     dominios)                    (con limitaciones)

  **Generación**     Carbone.io · Dropbox         DocuPilot · PDFMonkey ·
                                                  cualquier API doc→PDF
  ---------------------------------------------------------------------------

La columna \"Reemplazable por\" no es teoría: es **la prueba de que la
arquitectura está bien hecha**. Si mañana se decide reemplazar la app
Next.js por otra tecnología, o Make sube de precio, se reemplaza solo
esa capa, sin tocar las demás.

# 4. Modelo completo de base de datos Airtable

El modelo está organizado en 6 dominios independientes: maestros,
configuración, transacciones, auditoría, históricos y automatizaciones.
El diseño original definió 30 tablas base; las adendas v2.1, v2.2 y v2.3
sumaron 15 tablas adicionales (catálogos de cálculo, casos de regresión,
y las cuatro tablas hijas detectadas en la auditoría operacional contra
plantilla_calculo.xlsm), llevando el total a 46 tablas. Todas se
relacionan únicamente por foreign keys explícitas. Ninguna tabla
pertenece a \"más de un dominio\"; ninguna tiene lógica que cruce
dominios. El detalle implementable completo con DDL por campo vive en el
documento de capa de datos (§6).

![Blueprint técnico](media/image3.png "Blueprint"){width="6.875in"
height="4.645833333333333in"}

*Figura 4.1 --- Los 6 dominios de la base de datos y sus tablas
principales.*

## Vista de relaciones del dominio Configuración

El dominio Configuración es donde vive el comportamiento del sistema.
Vale la pena ver cómo sus tablas se relacionan entre sí.
**C_ReglasNegocio es el centro:** consulta C_Plantillas, C_Formulas y
C_Workflows para producir el resultado de una decisión.

![Blueprint
técnico](media/image4.png "Blueprint"){width="6.979166666666667in"
height="4.364583333333333in"}

*Figura 4.2 --- ERD del dominio Configuración: tablas, campos clave y
relaciones.*

## Dominio 1 --- Maestros

Entidades estables del negocio que cambian poco. **Son referenciadas por
todas las demás tablas**. Por convención su prefijo es M\_.

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Clientes**                                                        |
|                                                                       |
| *Catálogo de instituciones que solicitan tasaciones (MetLife,         |
| Security, BCI...).*                                                   |
+-----------------------------------------------------------------------+
| Tabla central de clientes finales del servicio. Cada solicitud        |
| entrante se asocia a un cliente. Las plantillas, fórmulas y workflows |
| del motor de reglas se filtran por este campo.                        |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------------------
  **Campo**                **Tipo          **Clave**   **Detalle / relación**
                           Airtable**                  
  ------------------------ --------------- ----------- ------------------------------
  **cliente_id**           autonumber      PK          Identificador único interno.

  **nombre**               single line     ---         Razón social (MetLife Chile,
                           text                        Banco Security...).

  **tipo**                 single select   ---         Banco · Compañía de seguros ·
                                                       Mutuaria · Caja.

  **rut**                  single line     ---         RUT formateado del cliente.
                           text                        

  **contacto_principal**   single line     ---         Nombre del referente.
                           text                        

  **email_contacto**       email           ---         Email para acuse y entregas.

  **sla_dias**             number          ---         Días máximos desde recepción a
                                                       entrega.

  **productos**            link →          FK          Múltiple: qué tipos de
                           M_Productos                 crédito/seguro maneja.

  **activo**               checkbox        ---         Solo clientes activos aparecen
                                                       en formularios.

  **creado_en**            created time    ---         Auditoría.
  -----------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Bancos**                                                          |
|                                                                       |
| *Bancos con los que se trabaja, incluso si no son cliente directo.*   |
+-----------------------------------------------------------------------+
| Algunos clientes son bancos directos (BCI). Otros son compañías de    |
| seguros que a su vez trabajan con varios bancos. Esta tabla desacopla |
| \"el cliente que paga\" de \"el banco involucrado en la operación\".  |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------
  **Campo**         **Tipo          **Clave**   **Detalle / relación**
                    Airtable**                  
  ----------------- --------------- ----------- ------------------------------
  **banco_id**      autonumber      PK          PK.

  **nombre**        single line     ---         BCI · Santander · Estado...
                    text                        

  **codigo_sbif**   single line     ---         Código oficial SBIF.
                    text                        

  **activo**        checkbox        ---         
  ----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Tasadores**                                                       |
|                                                                       |
| *Catálogo del equipo de tasadores (arquitectos en terreno).*          |
+-----------------------------------------------------------------------+
| Cada tasador tiene zona de cobertura y capacidad activa. Make         |
| consulta esta tabla para asignar automáticamente la solicitud al      |
| tasador adecuado.                                                     |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------
  **Campo**              **Tipo          **Clave**   **Detalle / relación**
                         Airtable**                  
  ---------------------- --------------- ----------- ------------------------------
  **tasador_id**         autonumber      PK          PK.

  **nombre**             single line     ---         
                         text                        

  **email**              email           ---         Para envío del link a la app
                                                     Next.js · IF-03 (Tasador).

  **telefono**           phone           ---         

  **zonas_cobertura**    link →          FK          Comunas que cubre.
                         M_Comunas                   
                         (multi)                     

  **capacidad_activa**   number          ---         N° máximo de solicitudes
                                                     concurrentes.

  **casos_en_curso**     rollup          ƒ           COUNT de TX_Solicitudes con
                                                     estado en proceso.

  **disponible**         formula         ƒ           casos_en_curso \<
                                                     capacidad_activa

  **activo**             checkbox        ---         
  ---------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Visadores**                                                       |
|                                                                       |
| *Equipo que revisa y aprueba el informe antes del envío al cliente.*  |
+-----------------------------------------------------------------------+
| Separado de M_Tasadores porque el visador tiene rol y permisos        |
| diferentes. Un visador puede atender múltiples clientes.              |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------------
  **Campo**          **Tipo          **Clave**   **Detalle / relación**
                     Airtable**                  
  ------------------ --------------- ----------- ------------------------------
  **visador_id**     autonumber      PK          

  **nombre**         single line     ---         
                     text                        

  **email**          email           ---         

  **especialidad**   multiple select ---         Residencial · comercial ·
                                                 agrícola.

  **activo**         checkbox        ---         
  -----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_TiposPropiedad**                                                  |
|                                                                       |
| *Catálogo de tipos: Casa · Departamento · Terreno · Local · Bodega ·  |
| Industrial · Agrícola.*                                               |
+-----------------------------------------------------------------------+
| Catálogo cerrado. El motor de reglas filtra por este campo para       |
| elegir plantilla y fórmulas (un depto no usa las mismas fórmulas que  |
| un terreno agrícola).                                                 |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------
  **Campo**               **Tipo          **Clave**   **Detalle / relación**
                          Airtable**                  
  ----------------------- --------------- ----------- ------------------------------
  **tipo_propiedad_id**   autonumber      PK          

  **nombre**              single line     ---         
                          text                        

  **categoria**           single select   ---         Residencial · Comercial ·
                                                      Industrial · Rural.

  **requiere_plano**      checkbox        ---         Si exige plano además de
                                                      fotos.

  **activo**              checkbox        ---         
  ----------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_TiposInforme**                                                    |
|                                                                       |
| *Catálogo de tipos: Hipotecario · Leasing · Seguro · Remate · Estudio |
| de mercado...*                                                        |
+-----------------------------------------------------------------------+
| Determina qué se entrega al cliente. Distinto del tipo de propiedad:  |
| una casa puede tener un informe hipotecario o uno de remate, son      |
| productos diferentes.                                                 |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------
  **Campo**             **Tipo          **Clave**   **Detalle / relación**
                        Airtable**                  
  --------------------- --------------- ----------- ------------------------------
  **tipo_informe_id**   autonumber      PK          

  **nombre**            single line     ---         
                        text                        

  **descripcion**       long text       ---         

  **activo**            checkbox        ---         
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Comunas**                                                         |
|                                                                       |
| *Catálogo geográfico de comunas chilenas.*                            |
+-----------------------------------------------------------------------+
| Sirve para validar direcciones, asignar tasadores por zona, calcular  |
| UF/m² promedio por comuna y aplicar reglas geográficas.               |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------
  **Campo**            **Tipo          **Clave**   **Detalle / relación**
                       Airtable**                  
  -------------------- --------------- ----------- ------------------------------
  **comuna_id**        autonumber      PK          

  **nombre**           single line     ---         
                       text                        

  **region**           single select   ---         

  **provincia**        single line     ---         
                       text                        

  **uf_m2_promedio**   number          ---         Referencia para validar
                                                   valoraciones.

  **activo**           checkbox        ---         
  -------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| MAESTROS                                                              |
|                                                                       |
| **M_Productos**                                                       |
|                                                                       |
| *Productos comerciales: crédito hipotecario, leasing, seguro de       |
| incendio...*                                                          |
+-----------------------------------------------------------------------+
| Un cliente puede ofrecer varios productos. El producto influye en qué |
| información se incluye en el informe (un crédito necesita valor de    |
| remate; un seguro necesita costo de reconstrucción).                  |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------
  **Campo**         **Tipo          **Clave**   **Detalle / relación**
                    Airtable**                  
  ----------------- --------------- ----------- ------------------------------
  **producto_id**   autonumber      PK          

  **nombre**        single line     ---         
                    text                        

  **categoria**     single select   ---         Crédito · Leasing · Seguro ·
                                                Inversión.

  **activo**        checkbox        ---         
  ----------------------------------------------------------------------------

## Dominio 2 --- Configuración

Aquí vive **el comportamiento del sistema**: qué plantillas existen, qué
fórmulas se calculan, qué reglas deciden, qué workflows se ejecutan, qué
notificaciones se envían. Es la única tabla donde el negocio puede
editar el comportamiento sin tocar código. Prefijo: C\_.

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_Plantillas**                                                      |
|                                                                       |
| *Catálogo versionado de plantillas Carbone (.docx) usadas para        |
| generar informes.*                                                    |
+-----------------------------------------------------------------------+
| Cada plantilla es un archivo .docx con tags Carbone, alojado en       |
| Dropbox. Esta tabla referencia la versión activa y mantiene el        |
| histórico. El motor de reglas selecciona la plantilla correcta según  |
| el cliente y tipo de informe.                                         |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable**  **Clave**   **Detalle / relación**
  ------------------------- ------------------ ----------- ------------------------------
  **plantilla_id**          autonumber         PK          

  **nombre**                single line text   ---         Ej: \"MetLife Hipotecario
                                                           Residencial v3.2\".

  **cliente**               link → M_Clientes  FK          Cliente al que pertenece (o
                                                           \"Genérica\").

  **tipo_informe**          link →             FK          
                            M_TiposInforme                 

  **tipo_propiedad**        link →             FK          Tipos que esta plantilla
                            M_TiposPropiedad               cubre.
                            (multi)                        

  **version**               single line text   ---         Ej: \"v3.2\".

  **archivo_docx_url**      url                ---         Link directo al .docx en
                                                           Dropbox.

  **variables_esperadas**   long text (JSON)   ---         Esquema JSON que Carbone
                                                           necesita.

  **activa**                checkbox           ---         Solo una versión activa por
                                                           combinación.

  **vigente_desde**         date               ---         

  **vigente_hasta**         date               ---         Vacío = vigente.

  **cambios_version**       long text          ---         Changelog para auditoría.
  ---------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_Formulas**                                                        |
|                                                                       |
| *Catálogo de fórmulas de cálculo. Reemplaza la lógica del XLSM.*      |
+-----------------------------------------------------------------------+
| Cada fórmula tiene un nombre, una expresión declarativa, variables de |
| entrada y un nombre de variable de salida. Make las ejecuta           |
| consultando esta tabla; no hay ninguna fórmula incrustada en código.  |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------------
  **Campo**                **Tipo Airtable**  **Clave**   **Detalle / relación**
  ------------------------ ------------------ ----------- ------------------------------
  **formula_id**           autonumber         PK          

  **nombre**               single line text   ---         Ej: \"Valor remate hipotecario
                                                          65%\".

  **categoria**            single select      ---         Valoración · UF/m² · Seguro ·
                                                          Avalúo.

  **expresion**            long text          ƒ           Ej: \"valor_comercial \*
                                                          0.65\".

  **variables_input**      long text (JSON    ---         \[\"valor_comercial\"\].
                           array)                         

  **variable_output**      single line text   ---         Ej: \"valor_remate\".

  **aplica_a_tipo_inf**    link →             FK          Tipos donde se usa.
                           M_TiposInforme                 
                           (multi)                        

  **aplica_a_tipo_prop**   link →             FK          
                           M_TiposPropiedad               
                           (multi)                        

  **version**              single line text   ---         

  **activa**               checkbox           ---         

  **origen_xlsm**          long text          ---         Documenta de qué celda XLSM se
                                                          migró.
  --------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN --- MOTOR                                               |
|                                                                       |
| **C_ReglasNegocio**                                                   |
|                                                                       |
| *El corazón del sistema: cada fila es una regla que mapea contexto →  |
| configuración aplicable.*                                             |
+-----------------------------------------------------------------------+
| El motor de reglas consulta esta tabla con el contexto de una         |
| solicitud (cliente + tipo + propiedad + banco + comuna) y obtiene de  |
| vuelta la plantilla, fórmulas y workflow que deben aplicarse. Es la   |
| única tabla que define el comportamiento del sistema.                 |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable**  **Clave**   **Detalle / relación**
  ------------------------- ------------------ ----------- ------------------------------
  **regla_id**              autonumber         PK          

  **nombre**                single line text   ---         Ej: \"MetLife · Hipotec ·
                                                           Depto Las Condes\".

  **descripcion**           long text          ---         Por qué existe esta regla.

  **cliente_filter**        link → M_Clientes  FK          Vacío = aplica a todos.
                            (multi)                        

  **tipo_informe_filter**   link →             FK          
                            M_TiposInforme                 
                            (multi)                        

  **tipo_prop_filter**      link →             FK          
                            M_TiposPropiedad               
                            (multi)                        

  **banco_filter**          link → M_Bancos    FK          
                            (multi)                        

  **comuna_filter**         link → M_Comunas   FK          
                            (multi)                        

  **plantilla_resultado**   link →             FK          La plantilla a usar.
                            C_Plantillas                   

  **formulas_resultado**    link → C_Formulas  FK          Lista de fórmulas a aplicar.
                            (multi)                        

  **workflow_resultado**    link → C_Workflows FK          Flujo de ejecución.

  **prioridad**             number             ---         A mayor número, gana ante
                                                           empate.

  **especificidad**         formula            ƒ           Cuántos filters no están
                                                           vacíos.

  **activa**                checkbox           ---         

  **vigente_desde**         date               ---         

  **vigente_hasta**         date               ---         
  ---------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_Workflows**                                                       |
|                                                                       |
| *Catálogo de flujos de ejecución (secuencias de pasos                 |
| automatizados).*                                                      |
+-----------------------------------------------------------------------+
| Cada workflow es una secuencia ordenada de pasos. Make lee esta tabla |
| para saber qué pasos ejecutar y en qué orden. Permite tener flujos    |
| diferentes por cliente sin duplicar escenarios Make.                  |
+-----------------------------------------------------------------------+

  ------------------------------------------------------------------------------
  **Campo**         **Tipo Airtable** **Clave**   **Detalle / relación**
  ----------------- ----------------- ----------- ------------------------------
  **workflow_id**   autonumber        PK          

  **nombre**        single line text  ---         Ej: \"Hipotecario estándar\".

  **pasos**         link →            FK          Secuencia ordenada.
                    C_WorkflowPasos               
                    (multi)                       

  **sla_dias**      number            ---         Días totales que toma el
                                                  workflow.

  **activa**        checkbox          ---         
  ------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_WorkflowPasos**                                                   |
|                                                                       |
| *Pasos individuales que componen un workflow. Catálogo de acciones    |
| disponibles.*                                                         |
+-----------------------------------------------------------------------+
| Cada paso describe una acción atómica que Make sabe ejecutar:         |
| \"asignar_tasador\", \"notif_email\", \"claude_extract\",             |
| \"aplicar_formulas\", \"carbone_pdf\". Make tiene un escenario por    |
| cada acción; el workflow las encadena.                                |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------
  **Campo**             **Tipo          **Clave**   **Detalle / relación**
                        Airtable**                  
  --------------------- --------------- ----------- ------------------------------
  **paso_id**           autonumber      PK          

  **workflow**          link →          FK          
                        C_Workflows                 

  **orden**             number          ---         1, 2, 3...

  **accion**            single select   ---         Catálogo cerrado de acciones
                                                    disponibles.

  **parametros**        long text       ---         Parámetros específicos del
                        (JSON)                      paso.

  **requiere_humano**   checkbox        ---         Si el paso pausa hasta acción
                                                    humana.

  **timeout_horas**     number          ---         Tiempo máximo antes de
                                                    alertar.
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_VariablesCliente**                                                |
|                                                                       |
| *Variables específicas que cada cliente quiere ver inyectadas en su   |
| informe (logo, textos legales, firma...).*                            |
+-----------------------------------------------------------------------+
| Cuando Carbone genera el PDF, además de los datos de la tasación      |
| necesita variables del cliente. Esta tabla las centraliza.            |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------
  **Campo**         **Tipo          **Clave**   **Detalle / relación**
                    Airtable**                  
  ----------------- --------------- ----------- ------------------------------
  **variable_id**   autonumber      PK          

  **cliente**       link →          FK          
                    M_Clientes                  

  **clave**         single line     ---         Ej: \"logo_url\",
                    text                        \"pie_legal\".

  **valor**         long text       ---         El valor a inyectar.

  **tipo**          single select   ---         string · number · url · image.

  **activa**        checkbox        ---         
  ----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_NotificacionesConfig**                                            |
|                                                                       |
| *Define qué notificaciones se disparan en qué momento del workflow, y |
| a quién.*                                                             |
+-----------------------------------------------------------------------+
| Sin esta tabla, los destinatarios y los textos de los emails vivirían |
| incrustados en Make. Aquí cada notificación es una fila editable.     |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------
  **Campo**              **Tipo          **Clave**   **Detalle / relación**
                         Airtable**                  
  ---------------------- --------------- ----------- ------------------------------
  **notif_id**           autonumber      PK          

  **evento**             single select   ---         solicitud_creada ·
                                                     tasador_asignado · pdf_listo ·
                                                     sla_vencido...

  **workflow**           link →          FK          O vacío = aplica a todos.
                         C_Workflows                 

  **cliente_filter**     link →          FK          Opcional.
                         M_Clientes                  
                         (multi)                     

  **destinatarios_to**   long text       ---         Lista de emails o referencias
                                                     dinámicas.

  **destinatarios_cc**   long text       ---         

  **plantilla_asunto**   single line     ---         Con variables.
                         text                        

  **plantilla_cuerpo**   long text       ---         Cuerpo del email con
                                                     variables.

  **canal**              single select   ---         gmail · slack · whatsapp.

  **activa**             checkbox        ---         
  ---------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| CONFIGURACIÓN                                                         |
|                                                                       |
| **C_SLA**                                                             |
|                                                                       |
| *Acuerdos de nivel de servicio por cliente y tipo de informe.*        |
+-----------------------------------------------------------------------+
| Permite definir SLA diferentes por combinación. Make verifica estos   |
| valores en cada paso para emitir alertas tempranas.                   |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------
  **Campo**            **Tipo Airtable**  **Clave**   **Detalle / relación**
  -------------------- ------------------ ----------- ------------------------------
  **sla_id**           autonumber         PK          

  **cliente**          link → M_Clientes  FK          

  **tipo_informe**     link →             FK          
                       M_TiposInforme                 

  **tipo_propiedad**   link →             FK          
                       M_TiposPropiedad               

  **dias_totales**     number             ---         

  **dias_alerta**      number             ---         A qué día emitir alerta
                                                      amarilla.

  **activa**           checkbox           ---         
  ----------------------------------------------------------------------------------

## Dominio 3 --- Transacciones

Una fila por evento operacional. Esta es la zona \"caliente\" del
sistema, donde hay alta tasa de inserts y updates. Prefijo: TX\_.

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_Solicitudes**                                                    |
|                                                                       |
| *Registro central de cada tasación. Cada fila es una solicitud        |
| única.*                                                               |
+-----------------------------------------------------------------------+
| La tabla más activa del sistema. Cada solicitud nueva crea una fila   |
| aquí, que progresa a través de estados hasta cerrarse. Todas las      |
| demás tablas transaccionales referencian a esta.                      |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------------
  **Campo**                  **Tipo Airtable**  **Clave**   **Detalle / relación**
  -------------------------- ------------------ ----------- ------------------------------
  **solicitud_id**           autonumber         PK          Ej: 524.

  **codigo_ext**             formula            ƒ           Formato externo
                                                            \"VP-{año}-{padded id}\".

  **fecha_solicitud**        date               ---         Cuándo se recibió.

  **cliente**                link → M_Clientes  FK          

  **banco**                  link → M_Bancos    FK          Si aplica.

  **tipo_informe**           link →             FK          
                             M_TiposInforme                 

  **tipo_propiedad**         link →             FK          
                             M_TiposPropiedad               

  **producto**               link → M_Productos FK          

  **comuna**                 link → M_Comunas   FK          

  **direccion**              single line text   ---         

  **rol_sii**                single line text   ---         Si llega en la solicitud.

  **cliente_final_nombre**   single line text   ---         

  **cliente_final_rut**      single line text   ---         

  **tasador**                link → M_Tasadores FK          Asignado automáticamente.

  **visador**                link → M_Visadores FK          

  **regla_aplicada**         link →             FK          Qué regla seleccionó la
                             C_ReglasNegocio                config.

  **plantilla**              lookup (regla)     ƒ           Vista desde la regla.

  **workflow**               lookup (regla)     ƒ           

  **estado**                 single select      ---         creada · asignada · visitada ·
                                                            calculada · pdf_listo ·
                                                            aprobada · entregada ·
                                                            cerrada.

  **fecha_visita**           date               ---         

  **fecha_entrega**          date               ---         

  **dias_desde_visita**      formula            ƒ           DATEDIFF(NOW, fecha_visita).

  **sla_estado**             formula            ƒ           verde / amarillo / rojo según
                                                            SLA.

  **pdf_final_url**          url                ---         Link al PDF generado.
  ----------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_DatosTasacion**                                                  |
|                                                                       |
| *Datos extraídos por Claude desde PDFs (SII, CBR, permiso, recepción) |
| y desde el formulario de la app Next.js del tasador (IF-03).*         |
+-----------------------------------------------------------------------+
| Separado de TX_Solicitudes porque son muchos campos y por temas de    |
| auditoría: queda claro qué viene del cliente, qué del tasador y qué   |
| extrajo la IA.                                                        |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------------
  **Campo**                  **Tipo           **Clave**   **Detalle / relación**
                             Airtable**                   
  -------------------------- ---------------- ----------- ------------------------------
  **dato_id**                autonumber       PK          

  **solicitud**              link →           FK          
                             TX_Solicitudes               

  **rol_sii**                single line text ---         Claude extrae.

  **avaluo_total**           currency (CLP)   ---         Claude extrae.

  **avaluo_exento**          currency         ---         

  **contribucion**           currency         ---         

  **deuda_contrib**          currency         ---         

  **sup_terreno_m2**         number           ---         Del tasador / Claude.

  **sup_construccion_m2**    number           ---         

  **anio_construccion**      number           ---         

  **permiso_edif**           single line text ---         

  **recepcion_final**        single line text ---         

  **estado_conservacion**    single select    ---         bueno · regular · malo.

  **sintesis_descriptiva**   long text        ---         Claude redacta.

  **descripcion_sector**     long text        ---         Claude redacta.

  **observaciones_ia**       long text        ---         Para el visador.

  **fuente_dato**            multiple select  ---         sii · cbr · permiso · tasador
                                                          · claude.

  **extraido_en**            datetime         ---         
  --------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_Calculos**                                                       |
|                                                                       |
| *Resultados de la aplicación de fórmulas para una solicitud.*         |
+-----------------------------------------------------------------------+
| Cada fila es una fórmula ejecutada para una solicitud. Permite ver el |
| detalle (qué fórmula, qué inputs, qué resultado) y reproducir el      |
| cálculo años después aunque la fórmula haya cambiado.                 |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------
  **Campo**             **Tipo           **Clave**   **Detalle / relación**
                        Airtable**                   
  --------------------- ---------------- ----------- ------------------------------
  **calculo_id**        autonumber       PK          

  **solicitud**         link →           FK          
                        TX_Solicitudes               

  **formula**           link →           FK          
                        C_Formulas                   

  **formula_version**   single line text ---         Versión usada (snapshot).

  **inputs_json**       long text (JSON) ---         Valores de entrada usados.

  **resultado**         number           ---         

  **unidad**            single select    ---         UF · CLP · USD · m².

  **calculado_en**      datetime         ---         
  ---------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_Comparables**                                                    |
|                                                                       |
| *Comparables usados para sustentar la valoración de una solicitud.*   |
+-----------------------------------------------------------------------+
| Una solicitud puede tener N comparables. Algunos los aporta el        |
| tasador desde el Portal Toc; otros los sugiere automáticamente el     |
| sistema desde H_Comparables_Histórico.                                |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------------------------------------
  **Campo**                   **Tipo Airtable**  **Clave**   **Detalle / relación**
  --------------------------- ------------------ ----------- ----------------------------------------------------
  **clave_natural**           single line text   ---         Campo primario de Airtable.

  **comp_id**                 autonumber         PK

  **solicitud**               link →             FK
                              TX_Solicitudes

  **comuna**                  link → M_Comunas   FK

  **tipo_propiedad**          link →             FK
                              M_TiposPropiedad

  **fuente**                  single select      ---         tasador · portal_toc ·
                                                             historico_sistema · cliente ·
                                                             Portal Inmobiliario · Yapo · Toctoc ·
                                                             Ofert. · CBR.

  **direccion**               single line text   ---

  **sup_terreno_m2**          number (2)         ---

  **sup_construccion_m2**     number (2)         ---

  **precio_uf**               number (3)         ---

  **fecha_transaccion**       date (ISO)         ---

  **uf_m2_terreno**           formula            ƒ           IF({sup_terreno_m2}>0,
                                                             {precio_uf}/{sup_terreno_m2},0)

  **uf_m2_construccion**      formula            ƒ           IF({sup_construccion_m2}>0,
                                                             {precio_uf}/{sup_construccion_m2},0)

  **antiguedad_meses**        formula            ƒ           DATETIME_DIFF(TODAY(),
                                                             {fecha_transaccion},'months')

  **factor_sup**              number (4)         ---         Ajuste por superficie.

  **factor_edad**             number (4)         ---         Ajuste por antigüedad.

  **factor_distancia**        number (4)         ---         Ajuste por distancia/zona.

  **aporta_a_historico**      checkbox           ---         Pasa a H_Comparables_Historico
                                                             tras aprobación del visador.

  **clave_comparable**        single line text   ---

  **direccion_comparable**    single line text   ---

  **comuna_comparable**       single line text   ---

  **valor_uf**                number (2)         ---

  **sup_m2**                  number (2)         ---

  **factor_homogeneizacion**  number (4)         ---

  **fecha_comparable**        date (ISO)         ---

  **valor_uf_m2**             formula            ƒ           IF({sup_m2}>0, {valor_uf} / {sup_m2}, 0)

  **valor_ajustado_uf**       formula            ƒ           {valor_uf} * {factor_homogeneizacion}

  **tipo_referencia**         single select      ---         Oferta · CBR.

  **fecha_publicacion**       date (D/M/YYYY)    ---

  **anio**                    number (0)         ---         Año de construcción del comparable.

  **telefono_contacto**       phone number       ---         Sólo si tipo_referencia = Oferta.

  **foja**                    single line text   ---         Sólo si tipo_referencia = CBR.

  **numero**                  single line text   ---         Sólo si tipo_referencia = CBR.

  **oo_cc_uf**                number (2)         ---         Obras complementarias en UF.

  **uf_m2_terreno_f**         number (2)         ---         UF/m² terreno crudo de la fuente.

  **uf_m2_construccion_f**    number (2)         ---         UF/m² construcción crudo de la fuente.

  **notas**                   multiline text     ---

  **ultima_modificacion**     last modified time ---
  ---------------------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_Adjuntos**                                                       |
|                                                                       |
| *Índice de archivos que viven en Dropbox para una solicitud.*         |
+-----------------------------------------------------------------------+
| Airtable no aloja los archivos pesados (fotos, PDFs); apunta a        |
| Dropbox. Esta tabla mantiene el inventario: qué archivo, de qué tipo, |
| subido por quién, procesado por IA o no.                              |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------
  **Campo**              **Tipo           **Clave**   **Detalle / relación**
                         Airtable**                   
  ---------------------- ---------------- ----------- ------------------------------
  **adjunto_id**         autonumber       PK          

  **solicitud**          link →           FK          
                         TX_Solicitudes               

  **tipo**               single select    ---         foto · plano · sii · cbr ·
                                                      permiso · recepcion ·
                                                      email_cliente · otro.

  **nombre_archivo**     single line text ---         

  **url_dropbox**        url              ---         

  **tamanio_kb**         number           ---         

  **subido_por**         single select    ---         tasador · ejecutiva · sistema.

  **subido_en**          datetime         ---         

  **procesado_por_ia**   checkbox         ---         Claude lo leyó.

  **hash_md5**           single line text ---         Integridad.
  ----------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_DocumentosGenerados**                                            |
|                                                                       |
| *Cada PDF generado por Carbone queda registrado aquí, con versión.*   |
+-----------------------------------------------------------------------+
| Si una solicitud se reabre y se regenera el PDF, la versión anterior  |
| NO se borra: se marca como obsoleta y se crea una nueva fila.         |
| Trazabilidad documental completa.                                     |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------
  **Campo**                 **Tipo           **Clave**   **Detalle / relación**
                            Airtable**                   
  ------------------------- ---------------- ----------- ------------------------------
  **doc_id**                autonumber       PK          

  **solicitud**             link →           FK          
                            TX_Solicitudes               

  **plantilla_usada**       link →           FK          
                            C_Plantillas                 

  **plantilla_version**     single line text ---         Snapshot.

  **url_pdf**               url              ---         En Dropbox.

  **hash_pdf**              single line text ---         Integridad.

  **tamanio_kb**            number           ---         

  **version_doc**           number           ---         1, 2, 3...

  **es_vigente**            checkbox         ---         Solo el último.

  **generado_en**           datetime         ---         

  **tiempo_generacion_s**   number           ---         Métrica de performance
                                                         Carbone.
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| TRANSACCIONES                                                         |
|                                                                       |
| **TX_Notificaciones**                                                 |
|                                                                       |
| *Cada email/notificación enviado queda registrado.*                   |
+-----------------------------------------------------------------------+
| Quién, cuándo, qué, a quién, con qué plantilla. Si el cliente reclama |
| \"no me llegó nada\", aquí está la prueba.                            |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------------
  **Campo**                **Tipo Airtable**        **Clave**   **Detalle / relación**
  ------------------------ ------------------------ ----------- -----------------------------
  **notif_id**             autonumber               PK          

  **solicitud**            link → TX_Solicitudes    FK          

  **config_origen**        link →                   FK          
                           C_NotificacionesConfig               

  **evento**               single select            ---         

  **canal**                single select            ---         

  **destinatarios**        long text                ---         

  **asunto**               single line text         ---         

  **cuerpo_renderizado**   long text                ---         Tras inyectar variables.

  **enviado_en**           datetime                 ---         

  **estado_envio**         single select            ---         enviado · fallido ·
                                                                pendiente.

  **mensaje_error**        long text                ---         Si falló.
  -------------------------------------------------------------------------------------------

### Tablas hijas de TX_Solicitudes incorporadas en adendas posteriores

**Las auditorías sucesivas del XLSM revelaron que ciertos bloques del
informe necesitan ser tablas hijas normalizadas y no campos planos en
TX_DatosTasacion. La adenda v2.1 incorporó las dos primeras (relativas
al cuadro de valoración); la adenda v2.3 sumó otras cuatro tras cruzar
el modelo con plantilla_calculo.xlsm y el caso piloto METLIFE-6283.
Todas siguen siendo dominio TX\_ y mantienen el principio de
normalización. El DDL completo está en el documento de capa de datos.**

  ---------------------------------------------------------------------------------------------------
  **Tabla hija (TX\_)**            **Adenda**       **Cardinalidad**   **Qué resuelve en el PDF**
  -------------------------------- ---------------- ------------------ ------------------------------
  **TX_ItemsCuadroValoracion**     v2.1             3-15 por solicitud Cuadro de valoración por ítem
                                                                       con flags de regularización,
                                                                       estado y garantía. Habilita
                                                                       las validaciones cruzadas de
                                                                       m² (RB-21, RB-42), el factor
                                                                       0.5 de terraza (RB-38), la
                                                                       denegación de bienes (RB-39) y
                                                                       el SUMIF de leasing (RB-30).

  **TX_ObrasComplementarias**      v2.1             0-5 por solicitud  Piscina · Quincho · Cierro ·
                                                                       Pavimentos · Portón eléctrico.
                                                                       Se suman al valor comercial
                                                                       sin depreciar (RB-6).

  **TX_Ampliaciones**              v2.3             0-3 por solicitud  N° permiso edif. · N° RIF · m²
                                                                       regulados · año · código
                                                                       material por ampliación
                                                                       declarada. Cubre filas
                                                                       AS28-AS30 de Antecedentes del
                                                                       XLSM.

  **TX_HabitacionesPorNivel**      v2.3             hasta 56 por       Matriz del programa
                                                    solicitud (4       arquitectónico que el PDF
                                                    niveles × 14       imprime como tabla resumen.
                                                    tipos)             Habilita validación cruzada
                                                                       del n° de dormitorios.

  **TX_TerminacionesPorRecinto**   v2.3             \~5 por solicitud  Pavimento · revestimiento
                                                                       muros · cielo · iluminación ·
                                                                       estado por agrupación de
                                                                       recinto. Llena la sección
                                                                       \'Terminaciones\' del PDF.

  **TX_DocumentosLegales**         v2.3             1-3 por solicitud  CBR
                                                                       (foja/número/año/repertorio) ·
                                                                       Notaría · Cert. No
                                                                       Expropiación SERVIU · Cert.
                                                                       Hipoteca · TGR. Se prellena
                                                                       por Claude desde el PDF del
                                                                       CBR (SC07).
  ---------------------------------------------------------------------------------------------------

**Por qué se mantienen en dominio TX\_: cada una tiene una fila por
instancia operacional (ítem, ampliación, recinto, documento) y se crea
junto con la solicitud --- son datos transaccionales, no maestros ni
configuración. Carbone itera sobre las colecciones al renderizar el PDF,
sin saber cuántas filas vendrán.**

## Dominio 4 --- Auditoría y logs

Trazabilidad total del sistema. **Append-only, nunca se actualiza ni se
borra**. Si A_Eventos está completa, cualquier estado del sistema es
reconstruible. Prefijo: A\_.

+-----------------------------------------------------------------------+
| AUDITORÍA                                                             |
|                                                                       |
| **A_Eventos**                                                         |
|                                                                       |
| *Log central de eventos: cada acción del sistema (humana o            |
| automática) deja una fila aquí.*                                      |
+-----------------------------------------------------------------------+
| Inmutable, append-only. Es la fuente para reconstruir qué pasó con    |
| una solicitud. Si A_Eventos está completa, todo lo demás es           |
| derivable.                                                            |
+-----------------------------------------------------------------------+

  ------------------------------------------------------------------------------
  **Campo**          **Tipo           **Clave**   **Detalle / relación**
                     Airtable**                   
  ------------------ ---------------- ----------- ------------------------------
  **evento_id**      autonumber       PK          

  **timestamp**      datetime         ---         Con milisegundos.

  **solicitud**      link →           FK          Si aplica.
                     TX_Solicitudes               

  **tipo_evento**    single select    ---         solicitud_creada ·
                                                  paso_iniciado ·
                                                  paso_completado · paso_fallido
                                                  · regla_evaluada ·
                                                  pdf_generado ·
                                                  email_enviado...

  **actor_tipo**     single select    ---         humano · sistema · ia ·
                                                  cliente.

  **actor_id**       single line text ---         User ID, scenario ID, etc.

  **detalle_json**   long text (JSON) ---         Payload del evento.

  **severidad**      single select    ---         info · warning · error ·
                                                  critical.

  **duracion_ms**    number           ---         Si aplica.
  ------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUDITORÍA                                                             |
|                                                                       |
| **A_DecisionesMotor**                                                 |
|                                                                       |
| *Cada vez que el motor de reglas decide algo, queda aquí: contexto,   |
| regla ganadora, reglas descartadas.*                                  |
+-----------------------------------------------------------------------+
| Permite responder con precisión: \"¿por qué este informe usó la       |
| plantilla X y no la Y?\". La respuesta siempre es trazable a esta     |
| tabla.                                                                |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------
  **Campo**                **Tipo Airtable** **Clave**   **Detalle / relación**
  ------------------------ ----------------- ----------- ------------------------------
  **decision_id**          autonumber        PK          

  **timestamp**            datetime          ---         

  **solicitud**            link →            FK          
                           TX_Solicitudes                

  **contexto_json**        long text (JSON)  ---         cliente, tipo, propiedad,
                                                         banco, comuna.

  **reglas_candidatas**    long text (JSON)  ---         Array de regla_ids que
                                                         matchearon.

  **regla_ganadora**       link →            FK          
                           C_ReglasNegocio               

  **razon_ganadora**       long text         ---         Mayor especificidad · mayor
                                                         prioridad...

  **resultado_aplicado**   long text (JSON)  ---         plantilla, fórmulas, workflow
                                                         finales.
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUDITORÍA                                                             |
|                                                                       |
| **A_Cambios**                                                         |
|                                                                       |
| *Audit trail de cualquier modificación a registros sensibles          |
| (configuración, transacciones).*                                      |
+-----------------------------------------------------------------------+
| Cada update que cambie configuración o estados deja aquí \"antes /    |
| después + autor + razón\". Permite revertir cambios con precisión.    |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------------
  **Campo**              **Tipo          **Clave**   **Detalle / relación**
                         Airtable**                  
  ---------------------- --------------- ----------- ------------------------------
  **cambio_id**          autonumber      PK          

  **timestamp**          datetime        ---         

  **tabla_origen**       single line     ---         Nombre de la tabla.
                         text                        

  **registro_id**        single line     ---         PK del registro modificado.
                         text                        

  **campo_modificado**   single line     ---         
                         text                        

  **valor_anterior**     long text       ---         

  **valor_nuevo**        long text       ---         

  **modificado_por**     last modified   ---         
                         by                          

  **razon_cambio**       long text       ---         Si el usuario lo justificó.
  ---------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUDITORÍA                                                             |
|                                                                       |
| **A_ErroresMake**                                                     |
|                                                                       |
| *Errores capturados por escenarios Make, con stack trace y            |
| resolución.*                                                          |
+-----------------------------------------------------------------------+
| Cuando un escenario falla (Claude no responde, Carbone timeout,       |
| webhook caído), aquí queda el detalle. Make reintenta                 |
| automáticamente; si todos los reintentos fallan, escala vía           |
| A_Eventos.                                                            |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------
  **Campo**            **Tipo           **Clave**   **Detalle / relación**
                       Airtable**                   
  -------------------- ---------------- ----------- ------------------------------
  **error_id**         autonumber       PK          

  **timestamp**        datetime         ---         

  **solicitud**        link →           FK          Si aplica.
                       TX_Solicitudes               

  **escenario_make**   single line text ---         

  **modulo_falla**     single line text ---         En qué módulo del escenario.

  **mensaje_error**    long text        ---         

  **stack_trace**      long text        ---         

  **reintentos**       number           ---         

  **estado**           single select    ---         resuelto · pendiente ·
                                                    escalado · ignorado.

  **resolucion**       long text        ---         Si se resolvió.
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUDITORÍA                                                             |
|                                                                       |
| **A_Accesos**                                                         |
|                                                                       |
| *Quién accedió a qué formulario o vista, desde dónde.*                |
+-----------------------------------------------------------------------+
| Permite saber quién vio una solicitud sensible, quién intentó         |
| modificarla, desde qué dispositivo. Esencial para auditoría de        |
| seguridad.                                                            |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------
  **Campo**        **Tipo          **Clave**   **Detalle / relación**
                   Airtable**                  
  ---------------- --------------- ----------- ------------------------------
  **acceso_id**    autonumber      PK          

  **timestamp**    datetime        ---         

  **usuario**      single line     ---         Email o ID.
                   text                        

  **accion**       single select   ---         vio · edito · creo · elimino.

  **recurso**      single line     ---         Tabla + registro_id.
                   text                        

  **origen_ip**    single line     ---         
                   text                        

  **user_agent**   single line     ---         Navegador / app.
                   text                        
  ---------------------------------------------------------------------------

## Dominio 5 --- Históricos

Memoria larga del sistema. Datos que se mueven aquí cuando ya no son
operacionales pero deben conservarse. Prefijo: H\_.

+-----------------------------------------------------------------------+
| HISTÓRICOS                                                            |
|                                                                       |
| **H_Solicitudes_Cerradas**                                            |
|                                                                       |
| *Snapshot de las solicitudes cerradas hace más de 90 días.*           |
+-----------------------------------------------------------------------+
| Una vez que una solicitud lleva 90 días cerrada, se mueve a esta      |
| tabla para mantener TX_Solicitudes ágil. La información queda         |
| completa para consultas futuras.                                      |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------
  **Campo**             **Tipo          **Clave**   **Detalle / relación**
                        Airtable**                  
  --------------------- --------------- ----------- ------------------------------
  **sol_id_original**   number          PK          ID que tenía en TX.

  **codigo_ext**        single line     ---         
                        text                        

  **cliente**           single line     ---         Denormalizado (no FK).
                        text                        

  **direccion**         single line     ---         
                        text                        

  **pdf_final_url**     url             ---         

  **fecha_cierre**      date            ---         

  **snapshot_json**     long text       ---         Estado completo en el cierre.
                        (JSON)                      
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| HISTÓRICOS                                                            |
|                                                                       |
| **H_PreciosUF**                                                       |
|                                                                       |
| *Histórico diario del valor UF en pesos chilenos.*                    |
+-----------------------------------------------------------------------+
| Para reproducir valoraciones pasadas necesitamos el valor UF de cada  |
| día. Make actualiza esta tabla diariamente desde la fuente oficial.   |
+-----------------------------------------------------------------------+

  ---------------------------------------------------------------------------
  **Campo**        **Tipo          **Clave**   **Detalle / relación**
                   Airtable**                  
  ---------------- --------------- ----------- ------------------------------
  **fecha**        date            PK          

  **valor_clp**    currency        ---         

  **fuente**       single select   ---         bcentral · mindicador.
  ---------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| HISTÓRICOS                                                            |
|                                                                       |
| **H_Comparables_Histórico**                                           |
|                                                                       |
| *Base de datos creciente de comparables usados en tasaciones          |
| pasadas.*                                                             |
+-----------------------------------------------------------------------+
| Cada comparable que aprueba el visador se acumula aquí. El motor      |
| puede sugerir comparables automáticamente buscando coincidencias por  |
| comuna, tipo y rango de superficie.                                   |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------
  **Campo**               **Tipo Airtable**  **Clave**   **Detalle / relación**
  ----------------------- ------------------ ----------- ------------------------------
  **comp_hist_id**        autonumber         PK          

  **direccion**           single line text   ---         

  **comuna**              link → M_Comunas   FK          

  **tipo_propiedad**      link →             FK          
                          M_TiposPropiedad               

  **sup_m2**              number             ---         

  **precio_uf**           number             ---         

  **uf_m2**               number             ---         

  **fecha_transaccion**   date               ---         

  **fuente_original**     single select      ---         portal_toc · cbr ·
                                                         solicitud_anterior.

  **aporto_solicitud**    link →             FK          Solicitud que originó este
                          TX_Solicitudes                 comparable.
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| HISTÓRICOS                                                            |
|                                                                       |
| **H_PlantillasAnteriores**                                            |
|                                                                       |
| *Versiones anteriores de las plantillas Carbone.*                     |
+-----------------------------------------------------------------------+
| Cuando se sube una versión nueva de una plantilla, la versión         |
| anterior NO se borra: se mueve aquí. Si un PDF antiguo necesita       |
| regenerarse, se encuentra la plantilla exacta que se usó.             |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------------
  **Campo**                   **Tipo          **Clave**   **Detalle / relación**
                              Airtable**                  
  --------------------------- --------------- ----------- ------------------------------
  **hist_id**                 autonumber      PK          

  **plantilla_original_id**   number          ---         

  **nombre**                  single line     ---         
                              text                        

  **version**                 single line     ---         
                              text                        

  **archivo_docx_url**        url             ---         

  **vigente_hasta**           date            ---         

  **reemplazada_por**         number          ---         ID en C_Plantillas que la
                                                          sustituyó.
  --------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| HISTÓRICOS                                                            |
|                                                                       |
| **H_FormulasAnteriores**                                              |
|                                                                       |
| *Versiones anteriores de las fórmulas.*                               |
+-----------------------------------------------------------------------+
| Igual que con las plantillas: si una fórmula cambia (ej. el           |
| coeficiente de remate pasa de 65% a 70%), la versión anterior queda   |
| aquí para reproducir cálculos pasados con exactitud.                  |
+-----------------------------------------------------------------------+

  ------------------------------------------------------------------------------------
  **Campo**                 **Tipo          **Clave**   **Detalle / relación**
                            Airtable**                  
  ------------------------- --------------- ----------- ------------------------------
  **hist_id**               autonumber      PK          

  **formula_original_id**   number          ---         

  **nombre**                single line     ---         
                            text                        

  **expresion**             long text       ---         

  **version**               single line     ---         
                            text                        

  **vigente_hasta**         date            ---         
  ------------------------------------------------------------------------------------

## Dominio 6 --- Automatizaciones

El metadato del propio sistema: **qué escenarios Make hay, cómo se
invocan, cuándo se ejecutan**. Esto permite que un nuevo integrante
entienda el sistema sin abrir Make. Prefijo: Z\_.

+-----------------------------------------------------------------------+
| AUTOMATIZACIONES                                                      |
|                                                                       |
| **Z_EscenariosMake**                                                  |
|                                                                       |
| *Catálogo de los escenarios Make existentes con su propósito y        |
| endpoint.*                                                            |
+-----------------------------------------------------------------------+
| Documenta qué escenarios Make hay, qué hacen y cómo se invocan. Es el |
| catálogo que cualquier nuevo miembro del equipo lee primero para      |
| entender qué hay desplegado.                                          |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------------------
  **Campo**                **Tipo          **Clave**   **Detalle / relación**
                           Airtable**                  
  ------------------------ --------------- ----------- ------------------------------
  **escenario_id**         autonumber      PK          

  **nombre**               single line     ---         
                           text                        

  **accion_asociada**      single select   ---         Coincide con
                                                       C_WorkflowPasos.accion.

  **webhook_url**          url             ---         Si es disparado por webhook.

  **descripcion**          long text       ---         

  **inputs_esperados**     long text       ---         Schema de entrada.
                           (JSON)                      

  **outputs_producidos**   long text       ---         
                           (JSON)                      

  **activo**               checkbox        ---         

  **ultima_ejecucion**     datetime        ---         

  **tasa_exito_30d**       rollup          ƒ           De Z_EjecucionesMake.
  -----------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUTOMATIZACIONES                                                      |
|                                                                       |
| **Z_EjecucionesMake**                                                 |
|                                                                       |
| *Registro de cada ejecución de un escenario Make.*                    |
+-----------------------------------------------------------------------+
| Métricas operativas: cuándo se ejecutó, cuánto tardó, si funcionó.    |
| Permite identificar escenarios con tasa de fallo elevada para         |
| optimizarlos.                                                         |
+-----------------------------------------------------------------------+

  --------------------------------------------------------------------------------------
  **Campo**                **Tipo Airtable**  **Clave**   **Detalle / relación**
  ------------------------ ------------------ ----------- ------------------------------
  **ejec_id**              autonumber         PK          

  **escenario**            link →             FK          
                           Z_EscenariosMake               

  **solicitud**            link →             FK          Si aplica.
                           TX_Solicitudes                 

  **inicio**               datetime           ---         

  **fin**                  datetime           ---         

  **duracion_ms**          formula            ƒ           fin - inicio.

  **resultado**            single select      ---         ok · error · timeout ·
                                                          cancelado.

  **modulos_ejecutados**   number             ---         Para costo Make.
  --------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUTOMATIZACIONES                                                      |
|                                                                       |
| **Z_ColaPendientes**                                                  |
|                                                                       |
| *Cola de pasos pendientes de ejecutar, cuando hay procesos asíncronos |
| o esperas largas.*                                                    |
+-----------------------------------------------------------------------+
| Cuando un workflow tiene un paso de \"esperar respuesta del           |
| visador\", el sistema crea una fila aquí. Un scheduler la revisa cada |
| X minutos para reactivar el flujo cuando corresponde.                 |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------------------
  **Campo**              **Tipo Airtable** **Clave**   **Detalle / relación**
  ---------------------- ----------------- ----------- ------------------------------
  **cola_id**            autonumber        PK          

  **solicitud**          link →            FK          
                         TX_Solicitudes                

  **paso_pendiente**     link →            FK          
                         C_WorkflowPasos               

  **esperando_evento**   single select     ---         respuesta_visador ·
                                                       respuesta_tasador · timeout...

  **creado_en**          datetime          ---         

  **reactivar_en**       datetime          ---         Cuándo el scheduler debe
                                                       reintentar.

  **estado**             single select     ---         pendiente · activado ·
                                                       cancelado · timeout.
  -----------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUTOMATIZACIONES                                                      |
|                                                                       |
| **Z_Webhooks**                                                        |
|                                                                       |
| *Catálogo de webhooks que disparan escenarios Make.*                  |
+-----------------------------------------------------------------------+
| Documenta qué webhook hace qué. Si una herramienta nueva (la app      |
| Next.js, Typeform, un partner externo) debe disparar el sistema, se   |
| registra aquí.                                                        |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------
  **Campo**               **Tipo Airtable**  **Clave**   **Detalle / relación**
  ----------------------- ------------------ ----------- ------------------------------
  **webhook_id**          autonumber         PK          

  **nombre**              single line text   ---         Ej: \"Next.js formulario
                                                         solicitud externa (IF-01)\".

  **url**                 url                ---         

  **escenario_destino**   link →             FK          
                          Z_EscenariosMake               

  **token_seguridad**     single line text   ---         Para validar origen.

  **activo**              checkbox           ---         
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| AUTOMATIZACIONES                                                      |
|                                                                       |
| **Z_Schedulers**                                                      |
|                                                                       |
| *Jobs programados (cron) que ejecuta Make periódicamente.*            |
+-----------------------------------------------------------------------+
| Verificación de SLA diaria, backups semanales, sincronización del     |
| valor UF cada mañana, limpieza de logs antiguos. Cada job es una fila |
| aquí, no una configuración escondida en Make.                         |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------------
  **Campo**                  **Tipo Airtable**  **Clave**   **Detalle / relación**
  -------------------------- ------------------ ----------- ------------------------------
  **sched_id**               autonumber         PK          

  **nombre**                 single line text   ---         

  **cron_expression**        single line text   ---         Ej: \"0 8 \* \* \*\" (todos
                                                            los días 8 AM).

  **escenario_a_ejecutar**   link →             FK          
                             Z_EscenariosMake               

  **ultima_ejecucion**       datetime           ---         

  **proxima_ejecucion**      datetime           ---         

  **activo**                 checkbox           ---         
  ----------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **AUTOMATIZACIONES C_AutomationsAirtable**                            |
|                                                                       |
| *Inventario de Automations y Scripts internos de Airtable*            |
|                                                                       |
| C_AutomationsAirtable es análoga a Z_EscenariosMake pero para la      |
| inteligencia interna de Airtable. Completa el principio de            |
| documentación viva: cualquier integrante puede entender TODO lo que   |
| el sistema ejecuta consultando Z_EscenariosMake +                     |
| C_AutomationsAirtable.                                                |
+-----------------------------------------------------------------------+

  ------------------------ ------------------ ----------- -------------------------------
  **Campo**                **Tipo Airtable**  **Clave**   **Detalle**

  automation_id            Autonumber         PK          Identificador único

  nombre                   Single line text   UQ          Formato
                                                          AT##\_descripcion_snake. Ej:
                                                          AT01_resolver_motor_reglas

  tipo                     Single select      ---         Automation · Script · Scheduled
                                                          · Formula

  disparador               Single line text   ---         Condición exacta. Ej:
                                                          TX_Solicitudes.estado = creada

  descripcion              Long text          ---         Qué hace, lenguaje de negocio

  tablas_lee               Multi select       ---         Tablas Airtable que consulta
                                                          esta automation

  tablas_escribe           Multi select       ---         Tablas Airtable que modifica
                                                          esta automation

  escenario_make_destino   Link →             FK          Si esta automation dispara un
                           Z_EscenariosMake               escenario Make, cuál

  activa                   Checkbox           IDX         Solo activas corren

  ultima_ejecucion         Datetime           ---         Última corrida registrada
  ------------------------ ------------------ ----------- -------------------------------

*Nota de implementación: C_AutomationsAirtable es análoga a
Z_EscenariosMake pero para la inteligencia interna de Airtable. Completa
el principio de documentación viva: cualquier integrante puede entender
TODO lo que el sistema ejecuta consultando Z_EscenariosMake +
C_AutomationsAirtable.*

## Resumen del modelo

+---------------------------------------+-------------------+---------------------------------------------+
| **Dominio**                           | **Tablas**        | **Volumen esperado**                        |
+=======================================+===================+=============================================+
| **Maestros**                          | 8                 | Bajo. Decenas a cientos de filas. Cambios   |
|                                       |                   | ocasionales.                                |
+---------------------------------------+-------------------+---------------------------------------------+
| **Configuración**                     | 9                 | Medio. Cientos de reglas, decenas de        |
|                                       |                   | plantillas y fórmulas.                      |
+---------------------------------------+-------------------+---------------------------------------------+
| **Transacciones**                     | 7                 | Alto. \~500 solicitudes/mes × varias filas  |
|                                       |                   | por solicitud.                              |
+---------------------------------------+-------------------+---------------------------------------------+
| **Auditoría**                         | 5                 | Muy alto. Cada acción del sistema genera 1+ |
|                                       |                   | filas. Append-only.                         |
+---------------------------------------+-------------------+---------------------------------------------+
| **Históricos**                        | 5                 | Crece linealmente. Datos archivados,        |
|                                       |                   | consulta esporádica.                        |
+---------------------------------------+-------------------+---------------------------------------------+
| **Automatizaciones**                  | 5                 | Bajo. Catálogo más logs de ejecución.       |
+---------------------------------------+-------------------+---------------------------------------------+
| **Política de tamaño**                                                                                  |
|                                                                                                         |
| Airtable tiene límites por base. Si TX_Solicitudes supera 50.000 filas, se mueven las cerradas a        |
| H_Solicitudes_Cerradas. Si A_Eventos supera 100.000 filas, las antiguas (\>1 año) se exportan a un      |
| bucket de archivado externo y se purgan. Esto se hace con Z_Schedulers, sin intervención humana.        |
+---------------------------------------------------------------------------------------------------------+

# 5. Motor de reglas de negocio

El motor de reglas es **la pieza arquitectónica más importante del
sistema**. Es lo que permite que toda la lógica de negocio viva en datos
editables y no en código. Sin él, esta arquitectura sería una más; con
él, el sistema se mantiene durante años sin tocar Make.

![Blueprint
técnico](media/image5.png "Blueprint"){width="6.979166666666667in"
height="4.645833333333333in"}

*Figura 5.1 --- Cómo el motor resuelve plantilla + fórmulas + workflow
para cada solicitud.*

## Estructura de una regla

Cada regla tiene tres partes: **filtros de entrada** (qué contextos
matchea), **resultado** (qué entrega) y **metadatos** (prioridad,
vigencia, autor). Una regla escrita correctamente se entiende sin
programadores.

### Anatomía declarativa

+-----------------------------------------------------------------------+
| // Regla #47 --- almacenada como una fila en C_ReglasNegocio          |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"nombre\": \"MetLife · Hipotecario · Depto en Las Condes\",          |
|                                                                       |
| \"filtros\": {                                                        |
|                                                                       |
| \"cliente\": \[\"MetLife Chile\"\],                                   |
|                                                                       |
| \"tipo_informe\": \[\"Hipotecario\"\],                                |
|                                                                       |
| \"tipo_propiedad\": \[\"Departamento\"\],                             |
|                                                                       |
| \"comuna\": \[\"Las Condes\", \"Vitacura\", \"Lo Barnechea\"\]        |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"resultado\": {                                                      |
|                                                                       |
| \"plantilla\": \"C_Plantillas/12 (MetLife Hipotec. Depto v3.2)\",     |
|                                                                       |
| \"formulas\": \[\"F_UFm2_terreno\", \"F_UFm2_construccion\",          |
|                                                                       |
| \"F_ValorComercial\", \"F_ValorRemate_65\"\],                         |
|                                                                       |
| \"workflow\": \"WF_Hipotecario_Estandar\"                             |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"prioridad\": 100,                                                   |
|                                                                       |
| \"especificidad\": 4, // 4 filtros activos (cliente, tipo, prop,      |
| comuna)                                                               |
|                                                                       |
| \"activa\": true                                                      |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

## Cómo se evalúa una solicitud contra el motor

El algoritmo es deliberadamente simple --- la complejidad vive en los
datos, no en el algoritmo:

- **Paso 1 --- Recoger contexto:** cuando entra una solicitud nueva,
  Make junta cliente + tipo_informe + tipo_propiedad + banco + comuna en
  un objeto.

- **Paso 2 --- Filtrar candidatas:** una vista de Airtable filtra las
  reglas donde cada filtro o está vacío (matchea cualquier valor) o
  contiene el valor del contexto.

- **Paso 3 --- Ordenar por especificidad:** gana la regla con más
  filtros no vacíos (más específica). Una regla \"para MetLife\" pierde
  ante una regla \"para MetLife + Las Condes\".

- **Paso 4 --- Desempatar por prioridad:** si dos reglas tienen igual
  especificidad, gana la de mayor prioridad. Permite forzar excepciones
  temporales sin reescribir el catálogo.

- **Paso 5 --- Devolver resultado:** Make recibe plantilla_id,
  formulas\[\] y workflow_id. Y registra en A_DecisionesMotor cuál ganó,
  cuáles compitieron y por qué.

### La regla wildcard

Siempre debe existir una regla con **todos los filtros vacíos** (la
\"regla genérica\"). Esta es la red de seguridad: si una solicitud no
matchea ninguna regla específica, se aplica esta. Sin la regla wildcard,
el sistema podría quedar sin saber qué hacer ante un caso nuevo.

## Ejemplos completos

### Ejemplo 1 --- Tres reglas para el mismo cliente

MetLife pide tasaciones de varios tipos. El catálogo declara:

  ------------------------------------------------------------------------------------
  **\#**   **Nombre**       **Filtros**          **Plantilla**   **Workflow**
  -------- ---------------- -------------------- --------------- ---------------------
  **45**   MetLife ·        cliente=MetLife      MetLife         WF_Estándar
           Genérica                              Genérica v2     

  **46**   MetLife ·        cliente=MetLife,     MetLife         WF_Hipotec_Estándar
           Hipotecario      tipo=Hipotec.        Hipotec. v3     

  **47**   MetLife ·        cliente=MetLife,     MetLife         WF_Hipotec_Premium
           Hipotec · Depto  tipo=Hipotec.,       Hipotec.        
           Las Condes       prop=Depto,          Premium v1      
                            comuna=Las                           
                            Condes/Vitacura/Lo                   
                            Barnechea                            
  ------------------------------------------------------------------------------------

Para una solicitud de MetLife · Hipotecario · Depto en Vitacura, las
tres reglas matchean, pero **la #47 gana** porque tiene 4 filtros no
vacíos contra 2 y 1 de las otras. Si en cambio fuera un depto en Maipú,
ganaría la #46 porque la #47 no matchea (Maipú no está en su lista de
comunas).

### Ejemplo 2 --- Excepción temporal con prioridad

Imaginemos que Security cambia su plantilla por un mes para una campaña.
Se agrega:

+-----------------------------------------------------------------------+
| {                                                                     |
|                                                                       |
| \"nombre\": \"Security · Campaña Octubre 2026\",                      |
|                                                                       |
| \"filtros\": { \"cliente\": \[\"Banco Security\"\] },                 |
|                                                                       |
| \"resultado\": {                                                      |
|                                                                       |
| \"plantilla\": \"Security_Campaña_Oct26_v1\",                         |
|                                                                       |
| \"formulas\": \[\"F_UFm2_terreno\", \"F_UFm2_construccion\",          |
| \"F_ValorComercial\"\],                                               |
|                                                                       |
| \"workflow\": \"WF_Estándar\"                                         |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"prioridad\": 999, // muy alta                                       |
|                                                                       |
| \"vigente_desde\": \"2026-10-01\",                                    |
|                                                                       |
| \"vigente_hasta\": \"2026-10-31\",                                    |
|                                                                       |
| \"activa\": true                                                      |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

Esta regla gana ante cualquier otra de Security durante octubre. El 1 de
noviembre se desactiva sola (vigencia) y vuelve a aplicarse el catálogo
normal. **Cero intervención de Make. Cero código modificado. Solo
datos.**

## Casos límite y cómo los maneja el motor

  -----------------------------------------------------------------------
  **Caso**                 **Comportamiento del motor**
  ------------------------ ----------------------------------------------
  **Ninguna regla          Se aplica la regla wildcard (todos los filtros
  matchea**                vacíos). Se registra en A_Eventos con
                           severidad warning para revisar después.

  **Múltiples reglas con   Se elige la más reciente (por regla_id). Se
  la misma especificidad y registra el conflicto en A_DecisionesMotor
  prioridad**              para que el administrador lo resuelva.

  **Una fórmula            El paso correspondiente se salta. Se registra
  referenciada no existe / en A_Eventos severidad warning. El flujo
  está desactivada**       continúa con las fórmulas restantes.

  **La plantilla           El flujo se detiene en el paso de generación
  referenciada no existe** PDF. Se crea entrada en A_ErroresMake con
                           severidad critical. El visador recibe alerta.

  **Una regla está marcada Nunca se considera. Permite \"deshabilitar sin
  como activa=false**      borrar\" para revisión histórica.

  **La regla está vigente  No se considera todavía. Se activará
  desde el futuro**        automáticamente en su fecha.
  -----------------------------------------------------------------------

## Cómo se construye una regla en la práctica

El proceso operativo para agregar una regla nueva no requiere
programador:

- **1.** El analista funcional identifica la necesidad (\"MetLife pide
  ahora un cálculo extra para departamentos sobre piso 15\").

- **2.** Verifica si la plantilla y las fórmulas necesarias ya existen
  en C_Plantillas y C_Formulas. Si no, las crea (sin tocar nada más).

- **3.** Crea la nueva fila en C_ReglasNegocio con los filtros
  correctos.

- **4.** Marca activa = false y prueba con una solicitud de simulación.

- **5.** Verifica en A_DecisionesMotor que la regla ganó.

- **6.** Activa con un check. A partir de ahí, las próximas solicitudes
  que matcheen usan la regla nueva.

+-----------------------------------------------------------------------+
| **Por qué este motor es enterprise-grade**                            |
|                                                                       |
| Declarativo: las reglas se escriben como datos, no como código.       |
|                                                                       |
| Auditable: cada decisión queda registrada con la regla ganadora y las |
| descartadas.                                                          |
|                                                                       |
| Reversible: cambiar una regla no rompe las pasadas --- los snapshots  |
| están en TX_Calculos y TX_DocumentosGenerados.                        |
|                                                                       |
| Extensible: agregar un nuevo eje de decisión (ej. monto de avalúo) es |
| agregar una columna, no rehacer Make.                                 |
|                                                                       |
| Auto-documentado: la tabla C_ReglasNegocio es la documentación del    |
| comportamiento del sistema.                                           |
+-----------------------------------------------------------------------+

# 6. Diseño de formularios

Ocho formularios cubren todos los puntos de interacción con el sistema.
**Cinco son operacionales** (alimentan transacciones) y **tres son
administrativos** (modifican configuración). Esta separación es
deliberada: los formularios administrativos requieren validaciones más
estrictas porque sus cambios afectan al comportamiento futuro del
sistema.

![Blueprint técnico](media/image6.png "Blueprint"){width="6.875in"
height="4.583333333333333in"}

*Figura 6.1 --- Catálogo de formularios. Color azul/verde/naranja:
operacionales. Color púrpura/teal/amarillo: administrativos.*

## Diseño formulario por formulario

Para cada formulario detallamos: propósito, usuario, canal, campos
obligatorios, campos opcionales, validaciones, lógica condicional y UX
recomendada.

+-----------------------------------------------------------------------+
| F1 · FORMULARIO                                                       |
|                                                                       |
| **Solicitud externa**                                                 |
|                                                                       |
| **Usuario:** Cliente / Institución (MetLife, Security, etc.) **·      |
| Canal:** App Next.js + Clerk (portal público con URL única por        |
| cliente, sin login obligatorio)                                       |
+-----------------------------------------------------------------------+

**Propósito**

Recibir el pedido inicial de tasación con los datos absolutamente
mínimos.

Es el punto de entrada al sistema. La premisa de diseño es brutal: pedir
lo mínimo y dejar que el sistema resuelva el resto. Cuanto menos
información obligatoria, mayor adopción.

**Campos obligatorios**

> **•** Institución solicitante (autoseleccionada por URL --- una ruta o
> sub-dominio Next.js por cliente)
>
> **•** Tipo de informe (lista filtrada según el cliente)
>
> **•** Tipo de propiedad (lista cerrada: Casa · Depto · Terreno · Local
> · Bodega)
>
> **•** Dirección de la propiedad (con sugerencia de Google Places)
>
> **•** Comuna (autocompletada desde la dirección, editable)
>
> **•** Nombre del propietario o solicitante final
>
> **•** RUT del propietario o solicitante
>
> **•** Email de contacto operativo

**Campos opcionales**

> **•** Rol SII (si lo tienen a la mano)
>
> **•** Banco involucrado (si aplica)
>
> **•** Producto comercial específico
>
> **•** PDFs adjuntos (consulta SII, CBR, permisos)
>
> **•** Observaciones especiales

**Validaciones**

> **•** RUT con dígito verificador correcto (validación en tiempo real)
>
> **•** Email con formato válido
>
> **•** Dirección con al menos calle + número
>
> **•** Comuna existente en M_Comunas

**Dependencias y lógica condicional**

> **•** El tipo de informe se filtra según los productos del cliente
> (M_Clientes.productos)
>
> **•** Si el tipo de propiedad requiere plano, se habilita un campo
> adicional para subirlo
>
> **•** Si el cliente tiene C_VariablesCliente.formato_solicitud
> distinto, se muestran campos extra específicos

**Experiencia de usuario**

> **•** Una sola página, sin scroll innecesario
>
> **•** Confirmación visual inmediata al enviar
>
> **•** Email automático de acuse a los 2 segundos con el código
> VP-AAAA-NNNN
>
> **•** Tiempo objetivo de completado: menos de 90 segundos

+-----------------------------------------------------------------------+
| F2 · FORMULARIO                                                       |
|                                                                       |
| **Creación / edición interna**                                        |
|                                                                       |
| **Usuario:** Ejecutiva VProperty **· Canal:** Vista de formulario     |
| Airtable                                                              |
+-----------------------------------------------------------------------+

**Propósito**

Completar los datos que el cliente externo no aportó, o crear una
solicitud manualmente cuando llega por email/teléfono.

No todo cliente usa la app Next.js externa. Algunos siguen enviando por
email. La ejecutiva crea acá la solicitud (en la consola Next.js que
comparte stack), completa lo que el cliente envió, y el motor de reglas
hace el resto.

**Campos obligatorios**

> **•** Los mismos del F1, en formato Airtable
>
> **•** Tasador asignado (sugerencia automática según comuna + capacidad
> disponible)
>
> **•** Fecha estimada de visita (opcional al inicio, obligatoria al
> pasar a estado \"asignada\")

**Campos opcionales**

> **•** Notas internas para el tasador
>
> **•** Notas del visador asignado

**Validaciones**

> **•** No se puede pasar a estado \"asignada\" sin tasador
>
> **•** No se puede pasar a estado \"visitada\" sin fecha_visita
>
> **•** No se puede pasar a estado \"pdf_listo\" sin TX_DatosTasacion
> completo

**Dependencias y lógica condicional**

> **•** El campo \"tasador\" muestra solo tasadores activos con
> disponible=true y zona de cobertura compatible
>
> **•** El campo \"visador\" muestra solo visadores con especialidad
> coincidente con tipo_propiedad
>
> **•** Si la solicitud está cerrada, todos los campos son read-only

**Experiencia de usuario**

> **•** Vista con campos agrupados por bloques: Cliente · Propiedad ·
> Asignación · Documentos
>
> **•** Botón \"Replicar de solicitud anterior\" para casos repetidos
> del mismo edificio
>
> **•** Indicador visual SLA: verde / amarillo / rojo en tiempo real

+-----------------------------------------------------------------------+
| F3 · FORMULARIO                                                       |
|                                                                       |
| **Visita del tasador**                                                |
|                                                                       |
| **Usuario:** Tasador en terreno **· Canal:** App Next.js + Clerk (PWA |
| mobile-first, link enviado por email tras la asignación)              |
+-----------------------------------------------------------------------+

**Propósito**

Capturar todos los datos de la visita: fotos, medidas, documentos
SII/CBR, observaciones.

El tasador recibe un link único al llegar el aviso de Make. Abre la app
Next.js en su celular, hace login con Clerk en el primer acceso, llena
los datos y sube los archivos. La API Route de la app sube los archivos
a Dropbox y dispara el webhook SC06; Make recibe la submission y dispara
el resto del flujo (Claude, fórmulas, PDF).

**Campos obligatorios**

> **•** Fecha real de la visita
>
> **•** Fotos (mínimo 8): fachada, accesos, todos los ambientes
> principales, baños, cocina, exteriores
>
> **•** Superficie de terreno (m²)
>
> **•** Superficie construida (m²)
>
> **•** Año de construcción aproximado
>
> **•** Estado de conservación (Bueno / Regular / Malo)
>
> **•** Adjunto: PDF de consulta SII
>
> **•** Adjunto: PDF de CBR (si aplica al tipo de propiedad)
>
> **•** Adjunto: PDF de recepción final (vivienda nueva)

**Campos opcionales**

> **•** Permiso de edificación
>
> **•** Planos disponibles
>
> **•** Comparables observados en terreno
>
> **•** Observaciones (acceso difícil, estado de los servicios, riesgos
> visibles)

**Validaciones**

> **•** Al menos 8 fotos cargadas
>
> **•** Superficies \> 0
>
> **•** Año entre 1900 y año actual
>
> **•** Tamaño máximo total: 100 MB

**Dependencias y lógica condicional**

> **•** Si tipo_propiedad = Departamento → se piden además: piso, N°
> departamento, edificio
>
> **•** Si tipo_propiedad = Terreno → no se piden datos de construcción
>
> **•** Si tipo_informe = Seguro → se piden datos de reconstrucción
> (materiales, instalaciones)

**Experiencia de usuario**

> **•** Diseño mobile-first (la mayoría se llena en celular)
>
> **•** Subida de fotos con compresión automática (no obligar al tasador
> a esperar)
>
> **•** Guardado automático cada 30 segundos
>
> **•** Indicador de progreso visible

+-----------------------------------------------------------------------+
| F4 · FORMULARIO                                                       |
|                                                                       |
| **Revisión del visador**                                              |
|                                                                       |
| **Usuario:** Visador **· Canal:** Vista filtrada en Airtable +        |
| interface de revisión                                                 |
+-----------------------------------------------------------------------+

**Propósito**

Revisar el PDF generado, los datos extraídos por Claude, y aprobar o
devolver con notas.

Cuando Carbone genera el PDF, llega a la cola del visador. El visador ve
los datos lado a lado con el PDF y decide. Si aprueba, el flujo
continúa. Si devuelve, vuelve al tasador con notas.

**Campos obligatorios**

> **•** Decisión (Aprobar · Devolver al tasador · Revisar con admin)
>
> **•** Si devuelve: motivo (lista cerrada) + observación libre

**Campos opcionales**

> **•** Ajustes finos al texto de síntesis descriptiva
>
> **•** Ajustes al estado de conservación
>
> **•** Comparables a agregar o quitar

**Validaciones**

> **•** No se puede aprobar sin haber abierto el PDF al menos una vez
> (rastreado en A_Accesos)
>
> **•** Si la decisión es \"devolver\", el motivo es obligatorio

**Dependencias y lógica condicional**

> **•** Si el visador edita un campo de TX_DatosTasacion, se regenera
> automáticamente el PDF (nueva versión en TX_DocumentosGenerados)
>
> **•** Si el visador aprueba con observaciones, se notifica a Héctor
> además

**Experiencia de usuario**

> **•** Vista de dos paneles: izquierda los datos editables, derecha el
> PDF embebido
>
> **•** Botones grandes y claros: Aprobar (verde) · Devolver (naranja) ·
> Escalar (rojo)
>
> **•** Atajos de teclado para revisores frecuentes

+-----------------------------------------------------------------------+
| F5 · FORMULARIO                                                       |
|                                                                       |
| **Aprobación final / habilitación de envío**                          |
|                                                                       |
| **Usuario:** Héctor / Gerencia **· Canal:** Vista Airtable (puede ser |
| desde móvil)                                                          |
+-----------------------------------------------------------------------+

**Propósito**

Última puerta antes del envío al cliente externo. Útil para casos
sensibles, clientes nuevos o montos altos.

No todas las solicitudes pasan por aquí: solo las que el motor de reglas
marca como \"requiere aprobación final\" (ej. valor \> 10.000 UF,
cliente nuevo, primera tasación con esa plantilla). El resto se envía
automáticamente al cliente tras la aprobación del visador.

**Campos obligatorios**

> **•** Decisión: Enviar al cliente · Devolver para ajustes

**Campos opcionales**

> **•** Comentario interno para el equipo

**Validaciones**

> **•** Solo solicitudes en estado \"aprobada\" llegan acá

**Dependencias y lógica condicional**

> **•** Si aprueba: dispara escenario Make \"Enviar al cliente\" → email
> automático con PDF
>
> **•** Si devuelve: revierte estado a \"asignada\", notifica al tasador

**Experiencia de usuario**

> **•** Una sola pantalla, todo visible
>
> **•** Botón \"Ver historial completo\" que muestra A_Eventos de esta
> solicitud
>
> **•** Disponible en móvil sin pérdida de funcionalidad

+-----------------------------------------------------------------------+
| F6 · FORMULARIO                                                       |
|                                                                       |
| **Administración de clientes**                                        |
|                                                                       |
| **Usuario:** Administrador del sistema **· Canal:** Vistas de         |
| Airtable en M_Clientes                                                |
+-----------------------------------------------------------------------+

**Propósito**

Alta, baja y edición de clientes/instituciones. Cambios en SLA,
productos habilitados, contactos.

Sin tocar Make. Sin tocar Carbone. Solo editando filas en M_Clientes y
eventualmente en C_VariablesCliente. La próxima solicitud del cliente
usa la configuración actualizada.

**Campos obligatorios**

> **•** Nombre, RUT, tipo (banco/seguros/etc), email de contacto, SLA
> días

**Campos opcionales**

> **•** Productos habilitados, contacto secundario, observaciones

**Validaciones**

> **•** RUT único en la tabla
>
> **•** SLA entre 1 y 30 días

**Dependencias y lógica condicional**

> **•** Si activo cambia a false: aviso de cuántas solicitudes en curso
> tiene
>
> **•** Si SLA disminuye: aviso de impacto en solicitudes activas

**Experiencia de usuario**

> **•** Lista con búsqueda por nombre/RUT
>
> **•** Vista de tarjeta para edición rápida
>
> **•** Botón \"Clonar\" para crear cliente parecido a uno existente

+-----------------------------------------------------------------------+
| F7 · FORMULARIO                                                       |
|                                                                       |
| **Administración de plantillas Carbone**                              |
|                                                                       |
| **Usuario:** Administrador del sistema **· Canal:** Vistas de         |
| Airtable en C_Plantillas + Dropbox                                    |
+-----------------------------------------------------------------------+

**Propósito**

Subir nuevas plantillas .docx, versionar las existentes, marcar cuáles
están activas.

Cuando un cliente pide cambios en su informe, se edita el .docx (Word
normal), se sube a Dropbox, se crea una nueva fila en C_Plantillas con
la nueva versión, y se desactiva la anterior. La versión anterior se
mueve automáticamente a H_PlantillasAnteriores.

**Campos obligatorios**

> **•** Nombre descriptivo, cliente, tipo_informe, tipo_propiedad,
> versión, URL del .docx en Dropbox

**Campos opcionales**

> **•** Notas de cambios respecto a la versión anterior
>
> **•** Variables esperadas (JSON)

**Validaciones**

> **•** URL apunta a un .docx existente en Dropbox
>
> **•** Versión sigue el patrón \"vN.M\"
>
> **•** No puede haber dos plantillas activas para la misma combinación
> cliente + tipo_informe + tipo_propiedad

**Dependencias y lógica condicional**

> **•** Al marcar una nueva como activa, la anterior se mueve a
> H_PlantillasAnteriores y se desactiva
>
> **•** Antes de activar, el sistema corre una prueba con datos dummy y
> muestra una vista previa

**Experiencia de usuario**

> **•** Botón \"Subir nueva versión\" que abre flujo guiado
>
> **•** Vista de comparación lado a lado: versión anterior vs nueva
>
> **•** Indicador visual: cuántas solicitudes en curso usan la plantilla
> anterior

+-----------------------------------------------------------------------+
| F8 · FORMULARIO                                                       |
|                                                                       |
| **Configuración de reglas de negocio**                                |
|                                                                       |
| **Usuario:** Administrador del sistema / Analista funcional **·       |
| Canal:** Vistas de Airtable en C_ReglasNegocio                        |
+-----------------------------------------------------------------------+

**Propósito**

Crear, editar y desactivar reglas del motor. Cambiar el comportamiento
del sistema sin abrir Make.

Es el formulario más delicado del sistema. Cambios aquí cambian cómo se
procesan las próximas solicitudes. Tiene el mayor nivel de validación
previo y siempre incluye un paso de prueba antes de activar.

**Campos obligatorios**

> **•** Nombre descriptivo de la regla
>
> **•** Al menos un filtro definido (no se permite una regla sin filtros
> excepto la wildcard)
>
> **•** plantilla_resultado, formulas_resultado, workflow_resultado
> (todos deben existir en sus tablas)
>
> **•** Prioridad (entre 1 y 999)

**Campos opcionales**

> **•** Descripción funcional (recomendada --- sirve como documentación)
>
> **•** Vigencia: vigente_desde / vigente_hasta

**Validaciones**

> **•** Solo una regla wildcard activa (filtros vacíos)
>
> **•** La plantilla referenciada está activa
>
> **•** Las fórmulas referenciadas están activas
>
> **•** El workflow referenciado está activo
>
> **•** No se puede activar sin pasar el \"test seco\" del paso
> siguiente

**Dependencias y lógica condicional**

> **•** Test seco: el sistema ejecuta el motor contra 10 solicitudes
> recientes que matchearían la nueva regla y muestra qué hubiera
> cambiado
>
> **•** Solo después del test seco se permite marcar activa = true
>
> **•** Cualquier cambio queda en A_Cambios con autor y razón

**Experiencia de usuario**

> **•** Editor visual de filtros: chips multi-select por cada dimensión
>
> **•** Vista de \"competencia\": qué otras reglas matchean los mismos
> contextos
>
> **•** Botón \"Test seco\" obligatorio antes de activar
>
> **•** Historial visible: quién creó, quién modificó cuándo

## Política transversal de formularios

  -----------------------------------------------------------------------
  **Aspecto**           **Política**
  --------------------- -------------------------------------------------
  **Datos mínimos**     F1 es la regla de oro: pedir lo mínimo, el
                        sistema completa lo demás. Cuanto menos friction,
                        más adopción.

  **Validaciones**      En cliente cuando es posible (UX), en Airtable
                        como red de seguridad (integridad).

  **Errores**           Mensajes claros, no técnicos. \"Faltan 2 fotos\"
                        en lugar de \"validation_error: photos \< 8\".

  **Confirmaciones**    Siempre. Ningún submit silencioso. Toast visual +
                        email cuando aplica.

  **Audit trail**       Cada submit deja una fila en A_Eventos. Cada
                        edición administrativa, una en A_Cambios.

  **Reversibilidad**    Los formularios administrativos siempre tienen
                        \"preview\" antes de aplicar. Los operacionales
                        permiten editar mientras el estado lo permita.

  **Accesibilidad**     Las páginas Next.js generadas con v0.dev y
                        Airtable Interfaces cumplen WCAG AA por defecto
                        cuando se respetan los componentes base. Probar
                        con teclado solamente al menos una vez.
  -----------------------------------------------------------------------

# 7. Automatizaciones Make

Make es el **orquestador del sistema**, pero --- siguiendo el principio
#2 --- *no contiene lógica de negocio*. Cada escenario tiene una forma
canónica: consultar Airtable para saber qué hacer, hacerlo, registrar el
resultado. Esta sección detalla el catálogo de escenarios y los patrones
que todos siguen.

## Forma canónica de un escenario Make

Todos los escenarios Make del sistema siguen el mismo patrón
estructural. **Conocer este patrón es conocer todo el sistema de
automatización**.

+-----------------------------------------------------------------------+
| // Patrón canónico de cualquier escenario Make                        |
|                                                                       |
| 1\. TRIGGER                                                           |
|                                                                       |
| webhook / scheduler / watch table                                     |
|                                                                       |
| 2\. LOG INICIAL                                                       |
|                                                                       |
| insertar fila en A_Eventos: tipo=paso_iniciado                        |
|                                                                       |
| 3\. CARGAR CONTEXTO                                                   |
|                                                                       |
| leer TX_Solicitudes + tablas relacionadas necesarias                  |
|                                                                       |
| 4\. CONSULTAR CONFIGURACIÓN                                           |
|                                                                       |
| leer C_Workflows / C_Formulas / C_Plantillas / C_NotificacionesConfig |
|                                                                       |
| (esta es la decisión: dónde el negocio \"vive\")                      |
|                                                                       |
| 5\. EJECUTAR ACCIÓN                                                   |
|                                                                       |
| el trabajo real (llamar Claude, llamar Carbone, enviar email...)      |
|                                                                       |
| 6\. PERSISTIR RESULTADO                                               |
|                                                                       |
| actualizar TX_Solicitudes + insertar en                               |
| TX_Calculos/TX_Documentos/TX_Notif                                    |
|                                                                       |
| 7\. LOG FINAL                                                         |
|                                                                       |
| insertar fila en A_Eventos: tipo=paso_completado + duración           |
|                                                                       |
| 8\. MANEJO DE ERROR (rama paralela)                                   |
|                                                                       |
| capturar excepción → A_ErroresMake → reintento configurable → escalar |
| si falla                                                              |
+-----------------------------------------------------------------------+

## Catálogo de escenarios

Cada escenario corresponde a una acción declarada en
C_WorkflowPasos.accion. Para agregar un paso nuevo al sistema, se agrega
un escenario Make con esta forma y se registra como una nueva opción del
catálogo.

### **LISTA A --- ESCENARIOS MAKE ACTIVOS (transportistas puros)**

  ------------ --------------------------- -------------------------------- --------------------
  **Código**   **Nombre**                  **Transporte**                   **Trigger**

  SC01         webhook_solicitud_externa   Next.js IF-01 → TX_Solicitudes   Webhook Next.js

  SC06         webhook_nextjs_visita       Next.js IF-03 →                  Webhook Next.js
                                           TX_DatosTasacion + TX_Adjuntos + 
                                           Dropbox                          

  SC07         claude_extract              PDFs Dropbox ← → Claude API →    Airtable dispara
                                           TX_DatosTasacion                 (estado=visitada)

  SC09         generar_pdf_carbone         JSON Airtable → Carbone.io →     Airtable dispara
                                           TX_DocumentosGenerados + Dropbox (estado=calculada)

  SC13         entregar_al_cliente         Payload Airtable → Gmail →       Airtable dispara
                                           TX_Notificaciones                (estado=aprobada)

  SC15         scheduler_actualizar_uf     Mindicador → H_PreciosUF (UF +   Cron diario 09:00
                                           USD)                             

  SC16         scheduler_backup            Airtable → Dropbox export        Cron semanal domingo

  SC19         webhook_banco_externo       Banco externo → Airtable         Webhook banco

  SC10         generar_thumbnails          TX_Adjuntos.mime_type=image/\* → Airtable dispara
                                           resize service → Dropbox         
  ------------ --------------------------- -------------------------------- --------------------

*Adenda v2.6 · SC10_generar_thumbnails. Escenario Make nuevo introducido
por la Especificación v1.4 (§8.5): dispara al insertarse una fila en
TX_Adjuntos cuyo mime_type comience por image/, llama al servicio de
resize (Cloudinary, sharp en Railway function o Dropbox thumbnail API a
definir) y escribe el thumbnail_url en la fila de origen. Es
idempotente: no re-genera si thumbnail_url ya está poblado. La LISTA B
más abajo mapea los códigos internos de Airtable Scripts SC03..SC18 a la
numeración canónica AT01..AT10 de la Especificación v1.4; el nuevo SC10
vive en LISTA A (escenarios Make) y no colisiona con la Automation
Airtable Script SC10=notif visador de LISTA B (=AT05 en la
Especificación).*

*Nota: El JSON enviado a SC09 (Carbone) es ensamblado íntegramente por
un Airtable Script antes de disparar Make. Make solo transporta el
paquete.*

### **LISTA B --- MIGRADO A AIRTABLE AUTOMATIONS/SCRIPTS**

  --------------------- ------------------ -------------- ---------------------------------
  **Escenario           **Migra a**        **Automation   **Trigger**
  eliminado**                              ID**           

  SC03 resolver motor   Airtable Script    AT01           TX_Solicitudes.estado = creada
  de reglas                                               

  SC04 asignar tasador  Airtable Script    AT02           TX_Solicitudes.estado = creada
                                                          (post AT01) ---
                                                          ⚠ v1.9: AT02
                                                          sigue existiendo
                                                          en el catálogo
                                                          pero NO se
                                                          invoca desde
                                                          IF-02. La
                                                          asignación de
                                                          tasador es
                                                          manual, única,
                                                          vía botón
                                                          "Asignar
                                                          Tasador" en la
                                                          UI (fuera del
                                                          alcance de
                                                          IF-02: no hay
                                                          reasignación
                                                          formal)

  SC05 ejecutar cadena  Airtable Script    AT03           TX_Solicitudes.estado = visitada
  DAG fórmulas                                            

  SC08 validar rangos   Airtable Formula + AT04           TX_Calculos insert
  valor calculado       Automation                        

  SC10 notif visador    Airtable           AT05           TX_Solicitudes.estado = pdf_listo
                        Automation                        

  SC11 webhook revisión Airtable           AT06           TX_Solicitudes.decision_visador
  visador               Automation                        

  SC12 chequear         Airtable           AT07           TX_Solicitudes.estado = aprobada
  aprobación final      Automation                        

  SC14 alertas SLA      Airtable Scheduled AT08           Cron diario 08:00
                        Automation                        

  SC17 reintentos cola  Airtable Scheduled AT09           Cron cada 15 min
  Z_ColaPendientes      Automation +                      
                        Script                            

  SC18 archivado        Airtable Scheduled AT10           Cron nocturno
  nocturno              Automation                        
  --------------------- ------------------ -------------- ---------------------------------

  -----------------------------------------------------------------------
  **Regla de oro Make v2.4: Si al describir un escenario Make debes
  mencionar Airtable más de dos veces (origen + destino), el escenario
  tiene lógica que no le pertenece. Refactorizar a Airtable Script.**

  -----------------------------------------------------------------------

## Manejo de errores

La política es **fail safe, never silent**. Toda excepción tiene un
lugar a donde ir. Toda excepción crítica tiene un humano que la verá. El
sistema nunca se queda en silencio ante un fallo.

### Estrategia de reintentos

  --------------------------------------------------------------------------------
  **Tipo de error**     **Reintentos**   **Espera**   **Acción tras agotamiento**
  --------------------- ---------------- ------------ ----------------------------
  **Timeout HTTP        3                30s, 2m, 5m  A_ErroresMake
  (Claude / Carbone)**                                severidad=error. Notif
                                                      admin.

  **Rate limit**        5                backoff exp. Espera hasta próximo
                                                      intervalo. No escala.

  **Webhook caído**     ∞                1m fija      Z_ColaPendientes. Se
                                                      reactiva al volver.

  **Validación de       0                ---          A_ErroresMake
  datos**                                             severidad=warning. Solicitud
                                                      queda en estado \"requiere
                                                      atención\".

  **Plantilla / fórmula 0                ---          A_ErroresMake
  no encontrada**                                     severidad=critical. Notif
                                                      admin INMEDIATA.

  **Error de cuota      0                ---          Z_ColaPendientes. Notif
  Make**                                              admin con urgencia.
  --------------------------------------------------------------------------------

### Idempotencia obligatoria

Cada escenario verifica al inicio si ya fue ejecutado para esa solicitud
y ese paso. Si sí, retorna sin hacer nada (excepto registrar el intento
duplicado). Esto permite reintentos masivos sin crear duplicados, y
permite reactivar manualmente flujos congelados con seguridad.

+-----------------------------------------------------------------------+
| // Idempotencia: primer bloque de cualquier escenario                 |
|                                                                       |
| const yaEjecutado = await airtable.query({                            |
|                                                                       |
| tabla: \"A_Eventos\",                                                 |
|                                                                       |
| filtro: {                                                             |
|                                                                       |
| solicitud: \$input.solicitud_id,                                      |
|                                                                       |
| tipo_evento: \"paso_completado\",                                     |
|                                                                       |
| actor_id: \"SC09\" // este escenario                                  |
|                                                                       |
| }                                                                     |
|                                                                       |
| });                                                                   |
|                                                                       |
| if (yaEjecutado.length \> 0) {                                        |
|                                                                       |
| // registrar intento duplicado, no hacer nada más                     |
|                                                                       |
| await airtable.insert(\"A_Eventos\", {                                |
|                                                                       |
| tipo_evento: \"intento_duplicado\",                                   |
|                                                                       |
| severidad: \"info\",                                                  |
|                                                                       |
| detalle_json: { motivo: \"Ya ejecutado en \" +                        |
| yaEjecutado\[0\].timestamp }                                          |
|                                                                       |
| });                                                                   |
|                                                                       |
| return { skipped: true };                                             |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

## Backups y respaldo

- **Diario:** Airtable mantiene snapshots automáticos. Configurado para
  retención de 30 días.

- **Semanal:** SC16 exporta todas las tablas a Dropbox en formato CSV +
  JSON, particionado por dominio.

- **Plantillas:** Dropbox mantiene historial completo de versiones de
  archivos por defecto (Business plan).

- **PDFs generados:** Dropbox + hash MD5 en TX_DocumentosGenerados. Si
  un archivo se corrompe, el hash lo delata.

## Sincronizaciones externas

- **UF diaria:** SC15 actualiza H_PreciosUF desde mindicador.cl cada
  mañana.

- **Portal Toc:** Si se contrata API o se hace scraping, se construye un
  escenario SC19 que actualiza H_Comparables_Histórico semanalmente. Hoy
  es manual; mañana puede automatizarse sin tocar nada más.

- **SBIF:** Listado oficial de bancos sincronizado anualmente con SC20.

+-----------------------------------------------------------------------+
| **Por qué Make queda \"tonto\" en esta arquitectura**                 |
|                                                                       |
| Porque cada escenario hace SIEMPRE lo mismo: consultar config →       |
| ejecutar → registrar.                                                 |
|                                                                       |
| Porque ningún escenario tiene un IF sobre cliente o tipo de informe.  |
| Esa decisión la toma el motor de reglas.                              |
|                                                                       |
| Porque los emails no tienen su contenido en Make. Lo tienen en        |
| C_NotificacionesConfig.                                               |
|                                                                       |
| Porque las fórmulas no viven en Make. Viven en C_Formulas.            |
|                                                                       |
| Porque cuando se agrega un cliente, Make NO se modifica. La           |
| configuración cambia en Airtable.                                     |
|                                                                       |
| Esto es lo que permite que Make pueda reemplazarse por n8n (o lo que  |
| venga) sin reescribir el sistema.                                     |
+-----------------------------------------------------------------------+

# 8. Generación documental con Carbone.io

Esta sección explica por qué la generación de PDFs se hace con
Carbone.io y no con HTML→PDF, cómo se estructuran las plantillas, cómo
el sistema selecciona la correcta y cómo se versionan. **Carbone es la
pieza que materializa el principio \"configuración antes que código\"**
en el plano documental.

![Blueprint
técnico](media/image7.png "Blueprint"){width="6.979166666666667in"
height="4.1875in"}

*Figura 8.1 --- Plantilla .docx + datos JSON → PDF. Carbone aplica
formatos automáticamente.*

## Por qué Carbone.io y no HTML→PDF

  ------------------------------------------------------------------------
  **Criterio**             **HTML → PDF**          **Carbone.io**
  ------------------------ ----------------------- -----------------------
  **Quién edita la         Programador (HTML/CSS)  Cualquiera (Word)
  plantilla**                                      

  **Curva de aprendizaje** Alta (CSS print, page   Mínima (tags {d.x})
                           breaks)                 

  **Cambios estéticos**    Requieren despliegue    Subir nuevo .docx

  **Fidelidad con Word     Requiere recrear todo   Se parte del .docx
  actual**                                         original VProperty

  **Repetidores (fotos,    Lógica en código        Sintaxis declarativa:
  comp.)**                                         {d.fotos\[i\].url}

  **Formatos (UF, fecha)** Manual en código        Built-in:
                                                   {d.valor:formatN(2)}

  **Coste mantenimiento**  Alto (acopla código y   Bajo (totalmente
                           diseño)                 desacoplado)

  **Reemplazo futuro**     Difícil                 Cualquier herramienta
                                                   tipo \"docx + datos →
                                                   pdf\"
  ------------------------------------------------------------------------

La conclusión es directa: **Carbone permite que el equipo de VProperty
pueda editar sus propios informes sin depender de programadores**. Si
MetLife pide cambiar un párrafo, abrir el .docx en Word, cambiarlo,
subir la nueva versión y activarla. Sin tickets, sin despliegues, sin
código.

## Cómo se estructura una plantilla Carbone

Una plantilla Carbone es un archivo .docx normal, abierto en Word, con
tags especiales donde van los datos. Los tags tienen el formato:

+-----------------------------------------------------------------------+
| {d.variable}                                                          |
|                                                                       |
| // Ejemplos reales del informe VProperty:                             |
|                                                                       |
| Cliente: {d.cliente.nombre}                                           |
|                                                                       |
| RUT: {d.cliente.rut}                                                  |
|                                                                       |
| Dirección: {d.propiedad.direccion}, {d.propiedad.comuna}              |
|                                                                       |
| Rol SII: {d.datos.rol_sii}                                            |
|                                                                       |
| Avalúo fiscal: \$ {d.datos.avaluo_total:formatN(0)}                   |
|                                                                       |
| Valor comercial: UF {d.calculos.valor_comercial:formatN(2)}           |
|                                                                       |
| Valor remate: UF {d.calculos.valor_remate:formatN(2)}                 |
|                                                                       |
| Fecha visita: {d.fecha_visita:formatD(DD/MM/YYYY)}                    |
|                                                                       |
| // Repetidores (un bloque por elemento del array):                    |
|                                                                       |
| {d.fotos\[i\].url} ← inserta cada foto                                |
|                                                                       |
| {d.comparables\[i\].direccion} ← cada fila de la tabla                |
|                                                                       |
| {d.comparables\[i\].uf_m2_construccion:formatN(2)}                    |
|                                                                       |
| // Condicionales:                                                     |
|                                                                       |
| {d.tipo_propiedad = Departamento:show(Edificio:                       |
| {d.propiedad.edificio})}                                              |
+-----------------------------------------------------------------------+

## Cómo Make construye el JSON para Carbone

En el paso SC09 --- generar_pdf_carbone, Un Airtable Script ensambla un
objeto JSON que reúne todos los datos necesarios. Este JSON tiene una
estructura **estable y documentada** (vive en
C_Plantillas.variables_esperadas), de modo que cualquier plantilla nueva
sabe qué esperar.

+-----------------------------------------------------------------------+
| // Estructura del JSON que recibe Carbone                             |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"solicitud\": {                                                      |
|                                                                       |
| \"codigo\": \"VP-2026-0524\",                                         |
|                                                                       |
| \"fecha_solicitud\": \"2026-05-15\",                                  |
|                                                                       |
| \"fecha_visita\": \"2026-05-17\",                                     |
|                                                                       |
| \"fecha_entrega\": \"2026-05-19\"                                     |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"cliente\": {                                                        |
|                                                                       |
| \"nombre\": \"MetLife Chile\",                                        |
|                                                                       |
| \"rut\": \"97.030.000-7\",                                            |
|                                                                       |
| \"logo_url\": \"https://dropbox.com/\.../metlife_logo.png\" ← de      |
| C_VariablesCliente                                                    |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"cliente_final\": { \"nombre\": \"Luis Rodríguez\", \"rut\":         |
| \"12.345.678-9\" },                                                   |
|                                                                       |
| \"propiedad\": {                                                      |
|                                                                       |
| \"direccion\": \"Av. Apoquindo 5230, depto 1502\",                    |
|                                                                       |
| \"comuna\": \"Las Condes\",                                           |
|                                                                       |
| \"tipo\": \"Departamento\",                                           |
|                                                                       |
| \"edificio\": \"Edificio Centauro\"                                   |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"datos\": { ← de TX_DatosTasacion                                    |
|                                                                       |
| \"rol_sii\": \"1234-56\",                                             |
|                                                                       |
| \"avaluo_total\": 95000000,                                           |
|                                                                       |
| \"sup_terreno_m2\": null,                                             |
|                                                                       |
| \"sup_construccion_m2\": 95,                                          |
|                                                                       |
| \"anio_construccion\": 2018,                                          |
|                                                                       |
| \"estado_conservacion\": \"Bueno\",                                   |
|                                                                       |
| \"sintesis_descriptiva\": \"Departamento ubicado en torre...\",       |
|                                                                       |
| \"descripcion_sector\": \"Sector consolidado con excelente...\"       |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"calculos\": { ← de TX_Calculos                                      |
|                                                                       |
| \"uf_m2_construccion\": 95.30,                                        |
|                                                                       |
| \"valor_comercial\": 9054,                                            |
|                                                                       |
| \"valor_remate\": 5885,                                               |
|                                                                       |
| \"seguro_incendio_uf\": 2200                                          |
|                                                                       |
| },                                                                    |
|                                                                       |
| \"fotos\": \[ ← de TX_Adjuntos tipo=foto                              |
|                                                                       |
| { \"url\": \"https://dropbox.com/\.../IMG_001.jpg\", \"descripcion\": |
| \"Fachada\" },                                                        |
|                                                                       |
| { \"url\": \"https://dropbox.com/\.../IMG_002.jpg\", \"descripcion\": |
| \"Living\" }                                                          |
|                                                                       |
| \],                                                                   |
|                                                                       |
| \"comparables\": \[ ← de TX_Comparables                               |
|                                                                       |
| { \"direccion\": \"Apoquindo 5100\",                                  |
| \"sup_construccion_m2\": 92, \"precio_uf\": 9100,                     |
| \"uf_m2_construccion\": 98.91 },                                      |
|                                                                       |
| { \"direccion\": \"El Bosque Norte 200\",                             |
| \"sup_construccion_m2\": 88, \"precio_uf\": 8800,                     |
| \"uf_m2_construccion\": 100 }                                         |
|                                                                       |
| \],                                                                   |
|                                                                       |
| \"tasador\": { \"nombre\": \"Roberto Pérez\", \"rut\":                |
| \"8.234.567-K\" },                                                    |
|                                                                       |
| \"visador\": { \"nombre\": \"María Soto\" }                           |
|                                                                       |
| }                                                                     |
+-----------------------------------------------------------------------+

## Selección automática de la plantilla

Make no decide qué plantilla usar. **El motor de reglas ya lo hizo**
(paso SC03). Lo único que Make hace es:

- **1.** Leer TX_Solicitudes.plantilla → lookup de
  C_ReglasNegocio.plantilla_resultado.

- **2.** Leer la URL del .docx desde C_Plantillas.archivo_docx_url.

- **3.** Descargar el .docx desde Dropbox.

- **4.** Llamar Carbone con el .docx + el JSON construido.

- **5.** Recibir el PDF, subirlo a Dropbox y registrar en
  TX_DocumentosGenerados.

## Versionamiento documental

+-----------------------------------------------------------------------+
| **POLÍTICA**                                                          |
|                                                                       |
| **Cada plantilla mantiene su histórico completo**                     |
|                                                                       |
| Cuando se sube una nueva versión de una plantilla (ej. MetLife pide   |
| cambiar el pie de página), la fila en C_Plantillas se actualiza con   |
| la nueva URL y version, pero la fila completa anterior se duplica en  |
| H_PlantillasAnteriores antes del cambio. Resultado: si un cliente     |
| pide regenerar un PDF de hace 6 meses, el sistema encuentra           |
| exactamente la plantilla que se usó originalmente, y produce un PDF   |
| idéntico al entregado entonces.                                       |
+-----------------------------------------------------------------------+

Lo mismo aplica a TX_DocumentosGenerados: **cada generación crea una
nueva fila con version_doc incremental**. La versión anterior queda
marcada con es_vigente=false. Nadie pierde nada nunca.

## Llamada técnica a Carbone

+-----------------------------------------------------------------------+
| POST https://api.carbone.io/render/{templateId}                       |
|                                                                       |
| Authorization: Bearer \${CARBONE_API_KEY}                             |
|                                                                       |
| Content-Type: application/json                                        |
|                                                                       |
| {                                                                     |
|                                                                       |
| \"data\": { \... el JSON descrito antes \... },                       |
|                                                                       |
| \"convertTo\": \"pdf\",                                               |
|                                                                       |
| \"lang\": \"es-cl\",                                                  |
|                                                                       |
| \"complement\": {                                                     |
|                                                                       |
| \"fecha_emision\": \"2026-05-19\",                                    |
|                                                                       |
| \"version_plantilla\": \"v3.2\"                                       |
|                                                                       |
| }                                                                     |
|                                                                       |
| }                                                                     |
|                                                                       |
| // Respuesta: { renderId, url }                                       |
|                                                                       |
| // Make descarga el PDF, lo sube a Dropbox y lo registra en           |
| TX_DocumentosGenerados                                                |
+-----------------------------------------------------------------------+

## Política de variables esperadas

Cada plantilla declara, en C_Plantillas.variables_esperadas, el **schema
JSON** que necesita. Esto permite que antes de activar una nueva
plantilla, el sistema valide:

- Que el JSON producido por Make contiene todas las variables que la
  plantilla espera.

- Que no haya tags huérfanos en la plantilla (que Carbone no podría
  llenar).

- Que la nueva plantilla no rompa solicitudes en curso.

+-----------------------------------------------------------------------+
| **Garantía de retrocompatibilidad**                                   |
|                                                                       |
| Si una plantilla nueva necesita variables nuevas, esas variables      |
| deben agregarse primero al JSON que Make produce (en SC09). Solo      |
| después se activa la plantilla. Si una variable existente cambia de   |
| nombre o estructura, la plantilla queda incompatible y no se permite  |
| activar. Esta validación corre automáticamente en F7.                 |
+-----------------------------------------------------------------------+

# 9. Flujo end-to-end completo

Esta sección une todas las piezas anteriores en **un solo recorrido**:
de la solicitud entrante al PDF entregado al cliente. La clave es notar
que *el número de pasos no cambia con cliente nuevo, plantilla nueva o
fórmula nueva*. Lo único que cambia son las filas que el motor de reglas
consulta.

![Blueprint
técnico](media/image8.png "Blueprint"){width="6.979166666666667in"
height="4.791666666666667in"}

*Figura 9.1 --- Flujo end-to-end mostrando las 4 capas en acción
simultánea.*

## Recorrido paso a paso

  --------------------------------------------------------------------------------
  **\#**   **Acción**      **Capa**         **Detalle**
  -------- --------------- ---------------- --------------------------------------
  **1**    Cliente envía   Presentación     Cliente externo completa el formulario
           formulario                       con datos mínimos.
           Next.js (IF-01)                  

  **2**    Webhook a Make  Orquestación     SC01 recibe el payload del webhook
                                            Next.js.

  **3**    Crear           Datos            Make inserta fila en TX_Solicitudes
           TX_Solicitud                     con estado=creada.

  **4**    Motor de reglas Reglas + Datos   Airtable Script AT01 carga el contexto
                                            de la solicitud, consulta
                                            C_ReglasNegocio aplicando el algoritmo
                                            de especificidad+prioridad, escribe
                                            regla_aplicada en TX_Solicitudes y
                                            registra en A_DecisionesMotor. No
                                            interviene Make.

  **5**    Cargar workflow Orquestación     Make lee C_Workflows y C_WorkflowPasos
                                            para saber qué pasos ejecutar.

  **6**    Asignar tasador Orquestación     ⚠ v1.9: este paso automático
                                            (Airtable Script AT02 lee
                                            M_Tasadores filtrando por zona y
                                            disponibilidad, selecciona al de
                                            menor carga y actualiza
                                            TX_Solicitudes) NO se invoca
                                            desde IF-02. AT02 permanece en
                                            el catálogo de automatizaciones
                                            pero fuera de alcance de IF-02:
                                            la asignación es manual, única,
                                            hecha por la Ejecutiva vía botón
                                            "Asignar Tasador" en la UI. No
                                            interviene Make ni hay
                                            reasignación formal.

  **7**    Aplicar         Reglas + Datos   Airtable Script AT03 resuelve el DAG
           fórmulas                         de C_Formulas (sort topológico, \~11
                                            pasos), ejecuta la cadena y escribe
                                            TX_Calculos fila por fila con snapshot
                                            de versión. Al completar, el estado
                                            cambia a calculada y una Airtable
                                            Automation dispara SC09 en Make para
                                            generar el PDF.

  **8**    Claude extract  Orquestación +   SC07 envía los PDFs SII/CBR/permisos a
                           IA               Claude. Recibe estructurado en
                                            TX_DatosTasacion.

  **9**    Generar PDF     Orquestación     Una Airtable Automation ensambla el
                                            JSON completo mediante Airtable Script
                                            y dispara SC09 en Make. SC09 solo
                                            transporta: recibe el JSON, llama
                                            Carbone, recibe el PDF, sube a Dropbox
                                            y registra en TX_DocumentosGenerados.
                                            Make no construye el JSON.

  **10**   Carbone genera  Generación       SC09 transporta: recibe PDF de
           PDF                              Carbone, sube a Dropbox y registra en
                                            TX_DocumentosGenerados con hash y
                                            versión.

  **11**   Guardar y       Datos + Storage  PDF a Dropbox + fila en
           versionar                        TX_DocumentosGenerados con hash.

  **12**   Notificar       Orquestación     SC10 lee C_NotificacionesConfig y
           visador                          envía email al visador asignado.

  **13**   Visador revisa  Presentación     Visador abre el PDF, decide en F4. Si
                                            aprueba: SC12. Si devuelve: vuelve al
                                            paso 6.

  **14**   Aprobación      Presentación     SC12 chequea la regla. Si requiere F5,
           final (si                        espera; si no, salta al 15.
           aplica)                          

  **15**   Enviar al       Generación +     SC13 envía email al cliente con el PDF
           cliente         Pres.            adjunto. Estado=entregada.

  **16**   Cerrar y        Datos            A los 90 días, SC17 mueve a
           archivar                         H_Solicitudes_Cerradas.
  --------------------------------------------------------------------------------

## Estados de una solicitud (state machine)

La columna TX_Solicitudes.estado es una máquina de estados explícita.
Solo se permiten ciertas transiciones, y cada cambio se registra en
A_Eventos. Esto evita que una solicitud quede en un estado
inconsistente.

  ------------------------------------------------------------------------------------
  **Estado**              **Próximos          **Significado y disparador**
                          posibles**          
  ----------------------- ------------------- ----------------------------------------
  **creada**              asignada ·          Acaba de entrar al sistema. SC04 corre y
                          cancelada           la lleva a asignada.

  **asignada**            visitada ·          Tasador notificado. Espera la visita.
                          cancelada           

  **visitada**            calculada ·         Tasador hizo submission del F3. SC07 y
                          requiere_atencion   SC08 procesan.

  **calculada**           pdf_listo ·         Fórmulas aplicadas, datos completos.
                          requiere_atencion   SC09 genera el PDF.

  **pdf_listo**           aprobada · devuelta Visador notificado. Espera su decisión
                                              en F4.

  **devuelta**            asignada            Visador devolvió al tasador con notas.
                                              Se reactiva el ciclo.

  **aprobada**            entregada ·         Si la regla requiere F5, va a
                          pendiente_final     pendiente_final.

  **pendiente_final**     entregada ·         Esperando aprobación de Héctor.
                          devuelta            

  **entregada**           cerrada             PDF en manos del cliente. Tras 7 días
                                              sin reclamos, pasa a cerrada.

  **cerrada**             (estado terminal)   Tras 90 días se archiva en
                                              H_Solicitudes_Cerradas.

  **cancelada**           (estado terminal)   Cancelada por el cliente o por el equipo
                                              VProperty.

  **requiere_atencion**   (cualquiera previo) Error en algún paso. Un humano debe
                                              intervenir.
  ------------------------------------------------------------------------------------

## Ejemplo concreto: el día a día de una solicitud

+-------------------------------------------------------------------------+
| MIÉRCOLES 14:23 --- Cliente MetLife envía formulario Next.js (IF-01).   |
|                                                                         |
| Datos: Av. Apoquindo 5230 depto 1502, Las Condes, Hipotecario.          |
|                                                                         |
| MIÉRCOLES 14:23:01 --- TX_Solicitudes #1234 creada (estado=creada).     |
|                                                                         |
| A_Eventos: solicitud_creada por cliente externo (MetLife).              |
|                                                                         |
| MIÉRCOLES 14:23:02 --- Motor de reglas evalúa.                          |
|                                                                         |
| Candidatas: regla #45 (Genérica MetLife), #46 (Hipotec MetLife),        |
|                                                                         |
| #47 (Hipotec Depto Las Condes).                                         |
|                                                                         |
| Ganadora: #47 (mayor especificidad).                                    |
|                                                                         |
| A_DecisionesMotor #5678 con detalle completo.                           |
|                                                                         |
| MIÉRCOLES 14:23:05 --- SC04 asigna tasador.                             |
|                                                                         |
| Roberto Pérez (zona Las Condes, capacidad libre 3/5).                   |
|                                                                         |
| Estado → asignada.                                                      |
|                                                                         |
| MIÉRCOLES 14:23:08 --- SC05 envía email a Roberto.                      |
|                                                                         |
| TX_Notificaciones #890 registrada.                                      |
|                                                                         |
| JUEVES 16:40 --- Roberto visita y completa el formulario Next.js        |
| (IF-03) en su celular.                                                  |
|                                                                         |
| Webhook → SC06 sube 12 fotos + 3 PDFs a Dropbox.                        |
|                                                                         |
| Estado → visitada.                                                      |
|                                                                         |
| JUEVES 16:41 --- SC07 llama Claude con los PDFs SII/CBR.                |
|                                                                         |
| Claude extrae: rol 1234-56, avalúo \$95M, sup 95m², año 2018.           |
|                                                                         |
| TX_DatosTasacion completo en 22 segundos.                               |
|                                                                         |
| JUEVES 16:41 --- SC08 aplica las 4 fórmulas de la regla #47.            |
|                                                                         |
| TX_Calculos #4567..#4570 insertadas.                                    |
|                                                                         |
| Estado → calculada.                                                     |
|                                                                         |
| JUEVES 16:42 --- SC09 construye JSON, llama Carbone.                    |
|                                                                         |
| Plantilla \"MetLife Hipotec. Premium v1\" → PDF de 24 páginas.          |
|                                                                         |
| TX_DocumentosGenerados #1234 v1 registrada.                             |
|                                                                         |
| Estado → pdf_listo.                                                     |
|                                                                         |
| JUEVES 16:42 --- SC10 notifica al visador María.                        |
|                                                                         |
| VIERNES 09:15 --- María revisa, ajusta un texto, aprueba.               |
|                                                                         |
| Carbone regenera. TX_DocumentosGenerados #1234 v2.                      |
|                                                                         |
| Estado → aprobada.                                                      |
|                                                                         |
| VIERNES 09:16 --- SC12 chequea regla: no requiere F5 (monto \< 10000    |
| UF).                                                                    |
|                                                                         |
| Salta directo a SC13.                                                   |
|                                                                         |
| VIERNES 09:16 --- SC13 envía al cliente.                                |
|                                                                         |
| Email con PDF a contacto MetLife.                                       |
|                                                                         |
| Estado → entregada.                                                     |
|                                                                         |
| Tiempo total: 1 día 19 horas. Cero intervención humana excepto          |
|                                                                         |
| la visita del tasador y la aprobación del visador.                      |
+-------------------------------------------------------------------------+
| **Lo que este flujo demuestra**                                         |
|                                                                         |
| El sistema procesa una tasación completa con dos intervenciones         |
| humanas: visita del tasador y revisión del visador.                     |
|                                                                         |
| Cada decisión (qué plantilla, qué fórmulas, qué workflow, a quién       |
| notificar) sale de Airtable.                                            |
|                                                                         |
| Cada acción queda auditada con timestamps en A_Eventos y                |
| A_DecisionesMotor.                                                      |
|                                                                         |
| Si mañana MetLife pide otra plantilla, se cambia en C_Plantillas y la   |
| próxima solicitud usa la nueva. Cero código modificado.                 |
+-------------------------------------------------------------------------+

# 10. Auditoría y trazabilidad total

Un sistema enterprise que no puede responder \"¿qué pasó exactamente y
por qué?\" no es un sistema enterprise. **La auditoría no es opcional ni
un extra: es ciudadana de primera clase desde el día uno**. Toda acción,
humana o automática, deja huella. Toda decisión del motor de reglas se
registra con sus competidoras descartadas. Toda versión de un documento
queda accesible.

![Blueprint
técnico](media/image9.png "Blueprint"){width="6.979166666666667in"
height="4.1875in"}

*Figura 10.1 --- Las seis tablas de auditoría que orbitan alrededor de
cada solicitud.*

## Las 6 tablas que sostienen la trazabilidad

  -------------------------------------------------------------------------------
  **Tabla**                    **Qué responde**
  ---------------------------- --------------------------------------------------
  **A_Eventos**                Qué pasó, cuándo, por quién o qué. Es el log
                               completo del sistema. Append-only.

  **A_DecisionesMotor**        Por qué el sistema eligió la plantilla X, las
                               fórmulas Y, el workflow Z. Con las reglas
                               descartadas.

  **A_Cambios**                Quién modificó qué configuración, cuándo, y cuál
                               era el valor anterior. Permite revertir cambios.

  **A_ErroresMake**            Qué falló en Make, en qué módulo, qué reintentos
                               se hicieron, cómo se resolvió.

  **A_Accesos**                Quién vio qué solicitud, desde dónde, cuándo.
                               Auditoría de seguridad y privacidad.

  **TX_DocumentosGenerados**   Todas las versiones de PDF generadas para cada
                               solicitud, con hash de integridad.
  -------------------------------------------------------------------------------

## Preguntas que el sistema responde sin esfuerzo

### \"¿Por qué este informe usó esta plantilla y no otra?\"

Consulta a A_DecisionesMotor para la solicitud. La fila contiene: el
contexto evaluado, todas las reglas candidatas (con sus IDs), la regla
ganadora y la razón (mayor especificidad / mayor prioridad / vigencia)).
**En menos de 5 segundos hay respuesta auditable.**

### \"¿Quién cambió el SLA de Banco Security la semana pasada?\"

Consulta a A_Cambios filtrando por tabla_origen=M_Clientes,
registro_id=Security, campo_modificado=sla_dias. Aparece quién, cuándo,
valor anterior (5), valor nuevo (7), razón si la dejó.

### \"¿Por qué la solicitud #1234 está demorada?\"

Consulta a A_Eventos filtrando por solicitud=1234, ordenado por
timestamp. Se ve la secuencia exacta: cuándo se creó, cuándo se asignó,
cuándo se notificó al tasador, qué pasos faltan, si hubo errores.
**Reconstrucción cronológica completa.**

### \"¿El PDF que el cliente recibió hace 6 meses se puede regenerar idéntico?\"

Sí. TX_DocumentosGenerados guardó la versión exacta. Pero además:
C_Plantillas movió la versión anterior a H_PlantillasAnteriores cuando
se cambió. C_Formulas hizo lo mismo. **Con los datos congelados en
TX_Calculos y la plantilla congelada en H_PlantillasAnteriores, se
reproduce el PDF al byte.**

### \"¿Hubo intentos de acceso no autorizado?\"

A_Accesos registra cada acceso con usuario, IP y user-agent. Una vista
filtrada por accesos a solicitudes que el usuario no debería ver (por
permisos) responde la pregunta.

## Política de retención y purga

Auditoría no significa \"guardar todo para siempre\" --- Airtable tiene
límites. La política es:

  -------------------------------------------------------------------------------
  **Tabla**                    **Retención     **Tras vencimiento**
                               online**        
  ---------------------------- --------------- ----------------------------------
  **A_Eventos**                12 meses        Export semanal a Dropbox
                                               /archivos/eventos/AAAA-MM.json +
                                               purga.

  **A_DecisionesMotor**        24 meses        Export anual a Dropbox + purga.

  **A_Cambios**                Indefinido      Importante para compliance. No se
                                               purga.

  **A_ErroresMake**            6 meses         Tras resolución, purga después de
                                               6 meses.

  **A_Accesos**                12 meses        Export semestral + purga.

  **TX_DocumentosGenerados**   Indefinido      Las URLs apuntan a Dropbox que
                                               conserva todo.
  -------------------------------------------------------------------------------

## Auto-monitoreo (no hay equipo de monitoreo)

El sistema se auto-monitorea **desde las tablas de auditoría**, con
vistas y alertas en Airtable. No hace falta un humano dedicado a
vigilar.

### Vistas de monitoreo en Airtable

- Vista \"Errores recientes\" en A_ErroresMake: filtra
  severidad=critical o estado=pendiente, ordena por timestamp desc.

- Vista \"SLA en riesgo\" en TX_Solicitudes: filtra sla_estado=amarillo
  o rojo, ordena por dias_desde_visita desc.

- Vista \"Reglas en conflicto\" en A_DecisionesMotor: muestra decisiones
  donde hubo más de 1 regla candidata con misma especificidad.

- Vista \"Documentos sin entregar\" en TX_Solicitudes: estado=pdf_listo
  más de 24h.

- Vista \"Escenarios Make con tasa de fallo \> 5%\" en Z_EscenariosMake.

### Alertas automáticas (escenario Make SC18)

- Cada hora: si hay errores con severidad=critical sin resolver, email
  al administrador.

- Cada mañana 8 AM: resumen del día anterior --- solicitudes nuevas,
  entregadas, en SLA rojo.

- Cada lunes: reporte semanal con métricas: tiempo promedio, tasa de
  devolución del visador, escenarios con más fallos.

- En tiempo real: si un escenario crítico (SC09 - generar PDF) falla más
  de 3 veces seguidas, alerta inmediata.

## Cómo se reconstruye el \"expediente\" completo de una solicitud

Si un cliente pregunta \"¿cómo llegaron a este valor?\", el equipo puede
generar en 2 minutos un dossier completo con:

- Cronología completa de la solicitud (A_Eventos)

- Datos de entrada del cliente (TX_Solicitudes original)

- Datos extraídos por IA con sus fuentes (TX_DatosTasacion)

- Cada cálculo realizado con su fórmula, versión y valores de entrada
  (TX_Calculos)

- Comparables usados (TX_Comparables)

- La regla aplicada con justificación (A_DecisionesMotor)

- Todos los PDFs generados con sus versiones (TX_DocumentosGenerados)

- Todas las notificaciones enviadas (TX_Notificaciones)

- Cualquier cambio que un humano haya hecho con su razón (A_Cambios)

+-----------------------------------------------------------------------+
| **Compliance y respaldo legal**                                       |
|                                                                       |
| Este nivel de trazabilidad cumple sobradamente los estándares de      |
| auditoría exigibles a un servicio de tasación. Ante un litigio o      |
| requerimiento regulatorio, el equipo VProperty puede presentar el     |
| expediente completo en minutos, no en semanas.                        |
+-----------------------------------------------------------------------+

# 11. Escalabilidad, permisos y mantenibilidad

Esta sección responde la pregunta que importa al CTO: **¿este sistema va
a sobrevivir tres años?** La respuesta es sí, y aquí está el por qué.

![Blueprint
técnico](media/image10.png "Blueprint"){width="6.979166666666667in"
height="4.1875in"}

*Figura 11.1 --- Cómo agregar un cliente nuevo. Solo se editan datos en
Airtable.*

## Operaciones cotidianas sin programador

Estas cinco operaciones son las que el equipo va a hacer todas las
semanas. **Ninguna requiere abrir Make ni Carbone ni tocar código**.
Todas se hacen editando filas en Airtable.

+---------------------------------------+-------------------+-----------------------------------------+
| **Operación**                         | **Tiempo**        | **Qué tablas se tocan**                 |
+=======================================+===================+=========================================+
| **Agregar nuevo cliente**             | 30--60 min        | M_Clientes (insert) → eventualmente     |
|                                       |                   | C_VariablesCliente (insert) →           |
|                                       |                   | C_ReglasNegocio (insert con             |
|                                       |                   | cliente_filter)                         |
+---------------------------------------+-------------------+-----------------------------------------+
| **Subir nueva versión de plantilla**  | 10 min            | Dropbox (upload .docx) → C_Plantillas   |
|                                       |                   | (insert nueva versión, desactivar       |
|                                       |                   | anterior). La anterior se mueve a       |
|                                       |                   | H_PlantillasAnteriores.                 |
+---------------------------------------+-------------------+-----------------------------------------+
| **Cambiar una fórmula**               | 10 min            | C_Formulas (insert nueva versión,       |
|                                       |                   | desactivar anterior). Va a              |
|                                       |                   | H_FormulasAnteriores. Las solicitudes   |
|                                       |                   | en curso conservan la versión vieja     |
|                                       |                   | porque TX_Calculos guarda               |
|                                       |                   | formula_version.                        |
+---------------------------------------+-------------------+-----------------------------------------+
| **Crear regla de excepción temporal** | 5 min             | C_ReglasNegocio (insert con prioridad   |
|                                       |                   | alta y vigente_desde/hasta). Se         |
|                                       |                   | desactiva sola.                         |
+---------------------------------------+-------------------+-----------------------------------------+
| **Agregar nuevo tipo de propiedad o   | 15 min            | M_TiposPropiedad o M_TiposInforme       |
| informe**                             |                   | (insert). Luego ajustar reglas          |
|                                       |                   | existentes si aplica.                   |
+---------------------------------------+-------------------+-----------------------------------------+
| **Esto es lo que cambia respecto a un sistema \"tradicional\"**                                     |
|                                                                                                     |
| En un sistema tradicional, \"agregar un cliente nuevo\" implica: pedir una cotización al            |
| programador, esperar a que esté disponible, modificar código, hacer testing, desplegar, y rezar. En |
| este sistema: el equipo de VProperty lo hace en menos de una hora, sin esperar a nadie. Esto NO es  |
| teoría: es consecuencia directa de los principios arquitectónicos.                                  |
+-----------------------------------------------------------------------------------------------------+

## Permisos y roles

Airtable Team permite hasta 5 colaboradores en el plan estándar. **Cada
uno tiene un rol con permisos específicos**, diseñados según el
principio de mínimo privilegio.

  ----------------------------------------------------------------------------
  **Rol**             **Acceso de lectura**        **Acceso de escritura**
  ------------------- ---------------------------- ---------------------------
  **Administrador**   Todas las tablas             Todas las tablas (incluido
                                                   motor de reglas).

  **Ejecutiva**       M\_\*, TX\_\*, vistas        TX_Solicitudes (alta y
                      filtradas de A\_\*           campos no-cálculo).
                                                   C_VariablesCliente. NUNCA
                                                   C_ReglasNegocio.

  **Tasador**         Solo sus propias solicitudes Solo el F3 (vía la app
                      (TX_Solicitudes)             Next.js + Clerk). No accede
                                                   a Airtable.

  **Visador**         Sus solicitudes asignadas +  TX_Solicitudes (campo
                      TX_DocumentosGenerados       decision_visador).
                                                   TX_DatosTasacion (ajustes
                                                   finos).

  **Solo lectura**    TX\_\*, M\_\*, H\_\* (para   Ninguno. Para auditores
                      reportes)                    externos.
  ----------------------------------------------------------------------------

Los tasadores **no acceden a Airtable directamente**. Solo usan la app
Next.js autenticada con Clerk; cada API Route filtra por clerk_user_id y
valida el JWT antes de operar. Esto reduce drásticamente la superficie
de error: no pueden ver datos de otros, no pueden modificar nada que no
sea su submission, y no tienen forma de saltarse el flujo establecido.

## Performance y crecimiento

### Capacidad actual del sistema

- Airtable Team: hasta 50.000 registros por base, 100.000 con Pro.

- 500 tasaciones/mes × 12 = 6.000 al año. En 5 años: 30.000. Holgura
  suficiente.

- A_Eventos crece más rápido (\~30 filas por solicitud). 30 × 500 × 12 =
  180.000/año. Por eso se purga a 12 meses.

- Carbone.io: plan profesional soporta 10.000 documentos/mes. Estamos
  en 500. Holgura 20x.

- Make: cuotas de operaciones suficientes con plan Pro. Cada solicitud
  consume \~30 operaciones; 500 × 30 = 15.000/mes.

### Cuándo y cómo escalar

  -----------------------------------------------------------------------
  **Cuándo**               **Qué hacer**
  ------------------------ ----------------------------------------------
  **Si TX_Solicitudes pasa Acelerar la política de archivado: bajar el
  30K filas**              umbral de 90 a 30 días.

  **Si A_Eventos pasa 80K  Acortar retención online a 6 meses. El export
  filas**                  sigue conservando todo.

  **Si Make queda corto de Optimizar SC07 (Claude) en batch. Subir al
  operaciones**            plan Teams si persiste.

  **Si Airtable queda      Migrar la auditoría a una base separada
  corto**                  (Airtable permite múltiples bases). Cambio
                           aislado.

  **Si Carbone queda       Caché de plantillas pre-procesadas.
  corto**                  Renderización asíncrona en horas valle.

  **Si el equipo crece \>  Plan Airtable Business. Permite 25
  5 personas**             colaboradores y roles más granulares.
  -----------------------------------------------------------------------

## Mantenibilidad: cómo se preserva la calidad del sistema

### Checks automáticos diarios

- Existe al menos una regla wildcard activa (red de seguridad del
  motor).

- Cada plantilla activa tiene su .docx en Dropbox accesible (Make
  verifica con HEAD request).

- Las fórmulas activas referenciadas por reglas activas existen.

- Ningún tasador tiene casos_en_curso \> capacidad_activa (rebalanceo
  automático).

- Ninguna solicitud está más de 24h en estado pdf_listo (alerta al
  visador).

### Convenciones de naming inquebrantables

- Prefijos por dominio: M\_, C\_, TX\_, A\_, H\_, Z\_. Cualquier tabla
  nueva debe respetarlos.

- Plantillas: nombre = \"{Cliente} {TipoInforme} {TipoPropiedad}
  v{N.M}\". Sin excepción.

- Reglas: nombre descriptivo que el negocio entienda al leerlo.

- Escenarios Make: SC{NN} --- {accion_snake_case}. Coincide con
  C_WorkflowPasos.accion.

### Documentación viva

La principal documentación del sistema es **el propio Airtable**. Las
descripciones de los campos, las notas en C_ReglasNegocio.descripcion y
C_Plantillas.cambios_version, las vistas con sus filtros visibles ---
todo eso es documentación que no se desactualiza porque vive en el
sistema. *No hay un Wiki paralelo que mantener.*

## Continuidad y bus factor

El sistema está diseñado para que **ningún individuo sea
irremplazable**. El \"bus factor\" --- la pregunta \"si X se va,
¿colapsa el sistema?\" --- debería ser alto.

+-----------------------------------------------------+---------------------------------------------+
| **Riesgo de continuidad**                           | **Mitigación**                              |
+=====================================================+=============================================+
| **Pierde al implementador inicial**                 | El sistema vive en dos planos: (a)          |
|                                                     | componentes no-code estándar (Airtable,     |
|                                                     | Make, Carbone) que cualquier integrador     |
|                                                     | puede tomar; (b) una app Next.js + Clerk    |
|                                                     | desplegada en Railway, con código en GitHub |
|                                                     | y CLAUDE.md como memoria del proyecto ---   |
|                                                     | cualquier desarrollador familiar con        |
|                                                     | Next.js + TypeScript la puede mantener con  |
|                                                     | Claude Code. La documentación viva en       |
|                                                     | Airtable acelera la transferencia.          |
+-----------------------------------------------------+---------------------------------------------+
| **Make cambia de modelo o sube precios**            | Cada escenario Make es reemplazable por un  |
|                                                     | equivalente en n8n. Como Make no contiene   |
|                                                     | lógica, la migración es traducción 1:1.     |
+-----------------------------------------------------+---------------------------------------------+
| **Carbone.io discontinúa el servicio**              | Las plantillas son .docx estándar. Se       |
|                                                     | pueden usar con DocuPilot, PDFMonkey o      |
|                                                     | cualquier herramienta similar. Cambia el    |
|                                                     | escenario SC09; nada más.                   |
+-----------------------------------------------------+---------------------------------------------+
| **Airtable deja de cumplir requisitos**             | El modelo relacional es estándar. Se puede  |
|                                                     | migrar a Postgres + un frontend custom. La  |
|                                                     | estructura es la misma; cambia el motor.    |
+-----------------------------------------------------+---------------------------------------------+
| **Cliente nuevo demanda cosas exóticas**            | El motor de reglas absorbe cualquier        |
|                                                     | combinación de filtros. Si requiere lógica  |
|                                                     | realmente nueva, se agrega un paso al       |
|                                                     | catálogo (C_WorkflowPasos) y un escenario   |
|                                                     | Make correspondiente. Cero impacto en lo    |
|                                                     | existente.                                  |
+-----------------------------------------------------+---------------------------------------------+
| **El compromiso final**                                                                           |
|                                                                                                   |
| Este sistema debería poder funcionar correctamente con un equipo de VProperty rotando, con un     |
| implementador distinto al original, y con cambios en las herramientas que lo componen. Esto no es |
| accidente: es el resultado de aplicar los siete principios arquitectónicos en cada decisión. Si   |
| el sistema no cumple esto, algo se hizo mal y se corrige.                                         |
+---------------------------------------------------------------------------------------------------+

# 12. Próximos pasos y plan de implementación

Esta sección traduce todo lo anterior en un plan concreto: **qué se
construye, en qué orden, en qué plazos**. La estrategia es *incremental
y con convivencia con el XLSM*: nada de \"apagar el viejo sistema el
lunes\". El sistema nuevo opera en paralelo, demuestra paridad y solo
entonces se confía la operación.

## Roadmap por fases

Cinco fases de 4 semanas cada una. **Cada fase entrega valor por sí
sola** --- no hay \"fase 5 o nada\". Si por alguna razón el proyecto se
pausa en la fase 3, lo construido hasta ese momento es funcional y útil.

  -------------------------------------------------------------------------------
  **Fase**           **Duración**    **Entregable concreto**
  ------------------ --------------- --------------------------------------------
  **Fase 1 ---       Semanas 1--4    Modelo de datos en Airtable (las 46 tablas
  Cimientos**                        finales tras adendas v2.1/v2.3), maestros
                                     poblados con los clientes actuales, motor de
                                     reglas con 3 reglas iniciales y plantilla
                                     genérica funcional. Sistema receptor del
                                     webhook del formulario Next.js (IF-01).

  **Fase 2 ---       Semanas 5--8    Formulario F3 del tasador, escenarios Make
  Captura y                          SC01--SC07, integración Claude. Una
  extracción**                       solicitud puede entrar, asignarse y
                                     capturarse en terreno. Los datos extraídos
                                     quedan en TX_DatosTasacion.

  **Fase 3 ---       Semanas 9--12   Migración completa de fórmulas del XLSM a
  Cálculo y                          C_Formulas. Integración Carbone con la
  generación**                       primera plantilla real (1 cliente piloto).
                                     Una solicitud genera PDF automáticamente al
                                     final del flujo.

  **Fase 4 ---       Semanas 13--16  Formularios F4 y F5, escenarios SC10--SC13,
  Revisión y                         política de versionamiento documental,
  entrega**                          notificaciones configurables. El flujo
                                     completo extremo a extremo opera para el
                                     cliente piloto.

  **Fase 5 ---       Semanas 17--20  Migración del resto de clientes, formularios
  Escalamiento y                     administrativos F6--F8, auto-monitoreo,
  auto-monitoreo**                   alertas, backups automáticos. El XLSM queda
                                     como respaldo histórico únicamente.
  -------------------------------------------------------------------------------

## Quick wins de las primeras 2 semanas

Antes incluso de terminar la fase 1, **hay valor entregable en 2
semanas** que el equipo puede usar de inmediato:

- **Día 3:** modelo de datos básico funcionando en Airtable. El equipo
  puede empezar a usar la base como CRM de tasaciones aunque el flujo
  automático no esté listo.

- **Día 7:** Formulario Next.js (IF-01) público y disparando Make
  básico. Las solicitudes nuevas ya llegan estructuradas, no por email.

- **Día 10:** App Next.js del tasador (IF-03) en producción. Los
  tasadores dejan de mandar fotos por WhatsApp.

- **Día 14:** dashboard operativo con SLA en tiempo real. Héctor sabe en
  cualquier momento qué hay en curso.

## Plan de migración del XLSM

El XLSM no se apaga. **Convive con el sistema nuevo durante todo el
proyecto**. La estrategia tiene tres etapas claras:

### Etapa A --- Reverse engineering (semanas 9--10)

- El Especialista en Migración Legacy abre el XLSM y cataloga cada
  fórmula relevante.

- Para cada fórmula identifica: nombre lógico, expresión, inputs
  requeridos, output producido.

- Carga cada fórmula como una fila en C_Formulas con origen_xlsm
  documentando de qué celda viene.

- Marca activa = false en todas inicialmente.

### Etapa B --- Validación paralela (semanas 11--12)

- Para cada solicitud que entra al sistema nuevo, en paralelo se
  mantiene el cálculo en el XLSM.

- Make compara automáticamente los resultados de C_Formulas vs. los
  esperados del XLSM.

- Cualquier diferencia se registra en A_Eventos con severidad=warning y
  se revisa antes de activar la fórmula.

- Solo cuando una fórmula logra 100% de coincidencia en 20+ casos, se
  marca activa = true en C_Formulas.

### Etapa C --- Apagado controlado (semana 17 en adelante)

- Una vez activadas todas las fórmulas, el XLSM se mantiene como archivo
  de consulta histórica, no operacional.

- Los archivos antiguos del XLSM se preservan en Dropbox
  /archivo/xlsm_legado/.

- Si alguna vez aparece un caso límite no cubierto, se vuelve al XLSM,
  se identifica la fórmula faltante y se agrega a C_Formulas. El XLSM
  queda como red de seguridad permanente.

+-----------------------------------------------------------------------+
| **Por qué esta estrategia funciona**                                  |
|                                                                       |
| Es la única forma seria de migrar un sistema vivo. Apagar el XLSM     |
| \"el lunes\" sería irresponsable: hay casos límite que solo aparecen  |
| en producción real. La convivencia con validación cruzada elimina ese |
| riesgo y construye confianza progresiva.                              |
+-----------------------------------------------------------------------+

## Métricas de éxito del proyecto

Cómo sabremos que el sistema cumple lo prometido. **Cinco KPIs que se
reportan automáticamente desde Airtable**, sin necesidad de armar
planillas ni reportes manuales.

  --------------------------------------------------------------------------
  **KPI**                   **Meta**        **Cómo se mide**
  ------------------------- --------------- --------------------------------
  **Tiempo desde solicitud  \< 48 h en el   TX_Solicitudes.fecha_entrega −
  a entrega**               80% de los      fecha_solicitud (rollup).
                            casos           

  **Tasa de devolución del  \< 10%          COUNT(estado=devuelta) /
  visador**                                 COUNT(total) sobre 30 días.

  **Cero                    0 reclamos/mes  Cada envío queda en
  \"no-llegó-el-email\"**                   TX_Notificaciones con
                                            estado_envio.

  **Tiempo de \"agregar     \< 1 hora       Cronometrado por el
  cliente nuevo\"**                         administrador. Reportable en
                                            A_Cambios.

  **Disponibilidad del      \> 99.5%        Z_EjecucionesMake.resultado=ok /
  sistema**                                 total mensual.
  --------------------------------------------------------------------------

## Riesgos identificados y mitigación

  -----------------------------------------------------------------------
  **Riesgo**               **Mitigación**
  ------------------------ ----------------------------------------------
  **Migración de fórmulas  La etapa B (validación paralela) está diseñada
  Excel descubre lógica    exactamente para esto. Cualquier diferencia
  oculta no documentada**  entre cálculo nuevo y viejo se detecta y
                           revisa antes de migrar la fórmula. Se reservan
                           2 semanas adicionales por contingencia.

  **Resistencia al cambio  F3 está pensado mobile-first y más cómodo que
  del equipo de            el WhatsApp + email actual. Capacitación
  tasadores**              incremental con un tasador piloto antes del
                           rollout.

  **Cuota de Make          Optimización de SC07 en batch desde la fase 3.
  insuficiente bajo carga  Plan Make Teams contratable inmediatamente si
  real**                   se necesita.

  **Claude API cambia de   Los prompts están versionados en escenarios
  modelo / precios**       Make. Migración a otro modelo (incluso
                           open-source si se quisiera) es cambiar un
                           componente, no rediseñar.

  **Carbone.io tiene caída Make detecta el fallo y encola la solicitud en
  prolongada**             Z_ColaPendientes. Reintento automático cada 5
                           min. Si dura más de 1 hora, alerta al admin
                           con la opción de generar manualmente.

  **El equipo VProperty no Documentación visual en cada vista. Sesiones
  se siente cómodo         de capacitación específicas. El analista
  editando                 funcional acompaña los primeros 3 cambios para
  C_ReglasNegocio**        validar.
  -----------------------------------------------------------------------

## Capacitación y transferencia

El proyecto incluye capacitación al equipo VProperty estructurada por
roles:

- **Para Héctor y administrador:** 2 sesiones de 2h sobre el modelo de
  datos, el motor de reglas y los formularios administrativos. Incluye
  ejercicios prácticos: \"agregar un cliente nuevo desde cero\".

- **Para la ejecutiva:** 1 sesión de 2h sobre los formularios
  operacionales, el flujo de estados y el dashboard. Acompañamiento las
  primeras 2 semanas.

- **Para visadores:** 1 sesión de 1h sobre F4 y la vista de revisión. Lo
  más importante: cómo aprobar / devolver / ajustar.

- **Para tasadores:** 30 minutos en grupo + tutorial en video. Solo
  necesitan saber usar F3 desde el celular.

## Soporte post-implementación

IA Solution acompaña a VProperty durante **60 días después del go-live**
con:

- Canal directo de soporte (Slack o WhatsApp) con respuesta en menos de
  4 horas en horario hábil.

- Ajustes y refinamientos de reglas y plantillas sin costo adicional.

- Una reunión semanal de seguimiento durante el primer mes; quincenal el
  segundo.

- Documentación final actualizada con cualquier cambio que haya surgido.

- Transferencia formal al equipo VProperty con sesión de cierre y
  entrega de artefactos.

## Y después de los 60 días

El sistema queda completamente en manos de VProperty. Está diseñado para
vivir sin la presencia continua de quien lo construyó. Si en algún
momento se necesita una mejora mayor --- un nuevo eje del motor de
reglas, una integración con un sistema externo nuevo, una migración a
otra herramienta --- **IA Solution sigue disponible bajo modalidad de
proyecto puntual**. Pero la operación cotidiana, el mantenimiento, los
cambios habituales: todo eso lo hace VProperty sin depender de nadie
externo.

+-----------------------------------------------------------------------+
| **Compromiso final de IA Solution**                                   |
|                                                                       |
| Lo que hemos diseñado aquí no es un sistema bonito para mostrar. Es   |
| una arquitectura pensada para durar. Si dentro de tres años VProperty |
| sigue procesando tasaciones con esta misma estructura --- habiendo    |
| agregado clientes, plantillas y reglas sin haber tocado código ---    |
| habremos hecho el trabajo bien. Ese es el único criterio que nos      |
| importa.                                                              |
+-----------------------------------------------------------------------+

# 13. Auditoría XLSM y actualizaciones al modelo

Esta sección se incorpora como adenda v2.1 posterior a la publicación
inicial del documento. Es el resultado de la auditoría forense del
archivo Excel legacy (Formato_Informe_VProperty_Enero2026.xlsm)
realizada por el Especialista en Migración Legacy del equipo. La
auditoría catalogó las 50 reglas de negocio implícitas en el XLSM y cada
una fue cruzada contra el modelo de Airtable descrito en este documento.

+-----------------------------------------------------------------------+
| **Por qué esta sección importa**                                      |
|                                                                       |
| El modelo original cubrió correctamente el 52% del catálogo de reglas |
| (24% directamente + 28% parcialmente). El 42% restante reveló GAPs    |
| que deben cerrarse antes del go-live. NOTA v2.2: un segundo pase      |
| forense, validado contra 5 casos reales, ajustó la cobertura REAL     |
| ponderada por criticidad de cálculo a \~58% y detectó 9 hallazgos     |
| críticos adicionales (ver Adenda v2.2, §14). La probabilidad de       |
| reproducción 100%-idéntica HOY es del orden del 55-65%, alcanzable al |
| 90%+ tras cerrar esos hallazgos.                                      |
|                                                                       |
| Buena noticia: ninguno de los GAPs requiere rediseñar la              |
| arquitectura. Todos se resuelven agregando filas, columnas o tablas   |
| dentro de los 6 dominios ya definidos.                                |
+-----------------------------------------------------------------------+

## Resumen de cobertura del catálogo

  -----------------------------------------------------------------------------
  **Estado**    **Cantidad**   **%**   **Significado**
  ------------- -------------- ------- ----------------------------------------
  Cubierto      12             24%     El modelo actual ya resuelve la regla
                                       sin cambios

  Parcial       14             28%     El modelo cubre el grueso pero falta
                                       agregar campo / cargar datos

  GAP nuevo     21             42%     Falta tabla, campo o estructura completa

  Fuera de      3              6%      Bug VBA, lógica de impresión Excel, no
  scope                                aplica
  -----------------------------------------------------------------------------

## Los 23 GAPs únicos consolidados

Los 21 GAPs nuevos y los 14 parciales colapsan a 23 GAPs únicos (varios
GAPs resuelven múltiples reglas). Se organizan en cuatro grupos según el
dominio del modelo que tocan.

+-----------------------------------------------------------------------+
| **Grupo M\_ · Maestros · 7 GAPs**                                     |
|                                                                       |
| M-G1 Expandir M_TiposPropiedad con 11 columnas (pronombre, etiquetas, |
| vida útil default, layouts, coef. valoración, requiere_subtipo,       |
| subtipos_validos). Resuelve RB-1, RB-2, RB-18, RB-40.                 |
|                                                                       |
| M-G2 Separar uf_m2_terreno y uf_m2_construccion en M_Comunas.         |
| Resuelve RB-4.                                                        |
|                                                                       |
| M-G3 Crear tabla M_Zonificacion (\~2.744 filas, 31 columnas, lookup   |
| por comuna + zona). Resuelve RB-3, RB-33, RB-41.                      |
|                                                                       |
| M-G4 Agregar firma_url en M_Visadores para inyección Carbone.         |
| Resuelve RB-28.                                                       |
|                                                                       |
| M-G5 Agregar marcador es_leasing en M_Clientes. Resuelve RB-16,       |
| RB-36.                                                                |
|                                                                       |
| M-G6 Agregar factor_seguro_incendio en M_Clientes (valores 0.8 /      |
| 1.0). Resuelve RB-35 nivel 2.                                         |
|                                                                       |
| M-G7 Cargar subtipos de exclusión seguro (U/Goce, Descubierto,        |
| Terreno, S/Reg No Regularizable) en M_TiposPropiedad. Resuelve RB-35  |
| nivel 1.                                                              |
+-----------------------------------------------------------------------+
| **Grupo C\_ · Configuración · 8 GAPs**                                |
|                                                                       |
| C-G1 Crear tabla C_PreciosUnitarios (UF/m² nuevo por tipo × material  |
| × calidad). Resuelve RB-5, RB-9.                                      |
|                                                                       |
| C-G2 Crear tabla C_VidaUtil con tramos por año de construcción.       |
| Resuelve RB-7.                                                        |
|                                                                       |
| C-G3 Crear tabla C_Feriados (feriados Chile, actualización anual).    |
| Resuelve RB-15, RB-45.                                                |
|                                                                       |
| C-G4 Crear tabla C_TramosHonorarios (tramos UF). Resuelve RB-11,      |
| RB-26.                                                                |
|                                                                       |
| C-G5 Crear tabla C_TramosBienComun (tramos m² para depto leasing).    |
| Resuelve RB-32.                                                       |
|                                                                       |
| C-G6 Crear tabla C_FactoresHomogeneizacion (ajustes para              |
| comparables). Resuelve RB-24.                                         |
|                                                                       |
| C-G7a Cargar coeficientes de estado_conservacion en C_Factores.       |
| Resuelve RB-10.                                                       |
|                                                                       |
| C-G7b Cargar 9 tramos de velocidad_venta en C_Factores. Resuelve      |
| RB-37.                                                                |
+-----------------------------------------------------------------------+
| **Grupo TX\_ · Transaccionales · 5 GAPs**                             |
|                                                                       |
| TX-G1 ★ EL GAP MÁS CRÍTICO. Crear tabla TX_ItemsCuadroValoracion con  |
| una fila por ítem del cuadro (terreno, edificación, OO.CC., piscina,  |
| terraza, bodega, estacionamiento), con flags: regularizable, estado,  |
| garantía, subtipo. Resuelve 6 reglas: RB-21, RB-30, RB-38, RB-39,     |
| RB-42, RB-43.                                                         |
|                                                                       |
| TX-G2 Capturar lista de roles SII por bodega y estacionamiento        |
| (subform en F3). Resuelve RB-17, RB-46.                               |
|                                                                       |
| TX-G3 Capturar obras complementarias (subform en F3). Resuelve RB-6.  |
|                                                                       |
| TX-G4a Agregar agrupacion_propiedad (Aislada / Edificio / Condominio) |
| en F3. Resuelve RB-20.                                                |
|                                                                       |
| TX-G4b Agregar en F3: servidumbre_m2, sup_primer_piso_m2, prc_sector. |
| Resuelve RB-44.                                                       |
|                                                                       |
| TX-G5 Agregar velocidad_venta_estimada en F3 (Single Select, 9        |
| tramos). Resuelve RB-37 nivel 2.                                      |
+-----------------------------------------------------------------------+
| **Grupo E\_ · Equivalencias · 2 GAPs (cargas en C_Equivalencias)**    |
|                                                                       |
| E-G1 Cargar 13 códigos de materialidad XLSM → ULH en C_Equivalencias. |
| Resuelve RB-31.                                                       |
|                                                                       |
| E-G2 Cargar 12 códigos de materialidad ULH en C_Equivalencias.        |
| Resuelve RB-47.                                                       |
+-----------------------------------------------------------------------+

## El GAP estructural más crítico: TX_ItemsCuadroValoracion

De los 23 GAPs, uno se destaca por su impacto: la nueva tabla
TX_ItemsCuadroValoracion. Sin ella no se pueden replicar las
validaciones cruzadas del XLSM (consistencia de m², roles por ítem,
terrazas que valen 50%, bienes denegados como garantía). Esta tabla es
el esqueleto granular de la valoración. Detalle completo del diseño de
campos en el documento de capa de datos, sección 6.3.

## Plan de cierre por fase del roadmap

Los 23 GAPs se cubren dentro del roadmap original de 20 semanas sin
extenderlo. La distribución por fase es:

  -----------------------------------------------------------------------------
  **Fase**       **Semanas**   **GAPs a cubrir**         **Por qué en esta
                                                         fase**
  -------------- ------------- ------------------------- ----------------------
  Fase 1 ·       1-4           M-G1 a M-G7, C-G1, C-G2,  Estructuras maestras y
  Fundación                    C-G3, C-G7a, C-G7b, E-G1, de configuración:
                               E-G2                      deben existir antes
                                                         que los formularios.

  Fase 2 ·       5-8           TX-G1, TX-G2, TX-G3,      Ampliaciones a F3 más
  Captura                      TX-G4a, TX-G4b, TX-G5,    la tabla granular del
                               M-G4                      cuadro de valoración.

  Fase 3 ·       9-12          C-G6                      Comparables, una vez
  Cálculo                                                que F3 ya los captura.

  Fase 4 ·       13-16         ---                       Sin GAPs nuevos.
  Revisión                                               

  Fase 5 ·       17-20         C-G4, C-G5                Honorarios + bien
  Escalamiento                                           común, operación
                                                         interna no crítica
                                                         para piloto.
  -----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Implicancia para el go-live**                                       |
|                                                                       |
| Ningún GAP queda fuera del alcance del proyecto. Todos se cubren      |
| dentro de las 20 semanas del roadmap original. La fase 1 absorbe el   |
| grueso (13 GAPs) porque son cargas y extensiones de tablas, trabajo   |
| del Administrador sin tocar formularios ni Make. Las fases 2 y 3      |
| cubren los GAPs que requieren ampliar F3 y crear la tabla granular    |
| crítica TX_ItemsCuadroValoracion.                                     |
+-----------------------------------------------------------------------+

## 3 reglas fuera de scope

Tres reglas del catálogo XLSM no se replican en el sistema nuevo:

**RB-48 · Bug VBA en TraducirNumero ---** el XLSM tiene un bug conocido:
la función VBA devuelve \'cinco\' para los valores 6 y 7. El nuevo
sistema NO replica este bug.

**RB-49 · Auto-imprimir Tapa + ULH ---** lógica de impresión de Excel.
No aplica donde la entrega es PDF generado por Carbone.

**RB-50 · Workflow paralelo BICE Mutuos ---** export externo a planilla
BICE. Se cubre con un workflow dedicado en C_Workflows, sin GAP nuevo.

## Próximo paso

El cierre de los 23 GAPs queda como acción 0 de la fase 1 del roadmap.
Una vez completada la fase 1, el sistema queda en condiciones de
absorber las 47 reglas que sí se replican, con trazabilidad completa
contra el XLSM original.

# 14. Adenda v2.2 --- Segunda auditoría forense y evolución arquitectónica

Esta sección se incorpora como **adenda v2.2**, posterior a la adenda
v2.1 (sección 13). Mientras la v2.1 auditó el XLSM y abrió 23 GAPs
estructurales, este segundo pase forense valida el diseño ---ya
enriquecido--- contra **cinco tasaciones reales** verificadas
matemáticamente celda a celda. La conclusión es importante para el
responsable de implementación: el diseño es arquitectónicamente sólido,
pero su probabilidad de reproducción 100%-idéntica HOY es del orden del
**55-65%**, y alcanza el **90%+** tras cerrar los 9 hallazgos críticos
de esta adenda. Ninguno obliga a rediseñar las 5 capas: se resuelven
incorporando componentes y capas dentro de la arquitectura existente.

+-----------------------------------------------------------------------+
| **▌ Dónde estaba el riesgo (y dónde no)**                             |
|                                                                       |
| El riesgo NO está en las fórmulas individuales ---están bien          |
| migradas--- sino en la ORQUESTACIÓN. Cuatro frentes lo concentran:    |
| (a) una cadena de \~15 cálculos secuenciales interdependientes sin    |
| orden de ejecución definido; (b) los overrides manuales que el        |
| tasador ejerce sobre celdas-fórmula del XLSM; (c) la generación de    |
| texto descriptivo legalmente vinculante, hoy hecha con InputBox de    |
| VBA y 41KB de ExportarBICE.bas; y (d) la ausencia de casos de prueba  |
| que ejerciten tramos distintos al único observado. La arquitectura    |
| v2.2 ataca los cuatro.                                                |
+-----------------------------------------------------------------------+

## 14.1 Las seis decisiones arquitectónicas del segundo pase

Para alcanzar reproducción idéntica antes del go-live se adoptan seis
modificaciones de alto nivel. Las tres primeras son nuevos
componentes/capas; las tres últimas son disciplinas de calidad. Cada una
se detalla en su subsección.

  ----------------------------------------------------------------------------------
  **Decisión         **Motivo**        **Prio.**   **Impacto técnico**       **§**
  arquitectónica**                                                           
  ------------------ ----------------- ----------- ------------------------- -------
  Motor de Ejecución La cadena de \~15 P1          Nuevo módulo lógico entre 14.2
  de Fórmulas        cálculos necesita             Motor de Reglas y Datos;  
  explícito          un ejecutor con               resuelve el DAG de        
                     orden topológico              C_Formulas                

  Capa de            Valores NO        P1          Paso previo al cálculo    14.3
  saneamiento de     REGISTRA, N/D,                que normaliza y marca     
  datos              RUT 0 rompen                  campos no disponibles     
                     tipos numéricos                                         

  Capa de override   Reproducir        P1          Campos \*\_override en    14.4
  auditable          overrides                     TX_Solicitudes + registro 
                     manuales del                  obligatorio en A_Cambios  
                     tasador (tasa,                                          
                     vida útil, valor)                                       

  Contrato Claude    El texto          P1          Prompt versionado;        14.5
  (prompt + schema + descriptivo es                validación de campos      
  validación)        legalmente                    contra TX\_; gate humano  
                     vinculante; no                en F4                     
                     puede alucinar                                          

  Suite de regresión Garantizar        P1          Pipeline: cargar caso →   14.6
  / golden master    reproducción al               ejecutar cadena → diff vs 
                     céntimo antes del             PDF (tolerancia 0)        
                     go-live                                                 

  Reconciliación     Reducir el riesgo P2          Comparar valores          14.7
  Claude vs tasador  de extracción IA              extraídos por IA con los  
  (doble fuente)     errónea que se                del tasador; flag de      
                     propaga                       divergencias              
  ----------------------------------------------------------------------------------

## 14.2 El Motor de Ejecución de Fórmulas (nuevo componente lógico)

**Hallazgo crítico #1.** El PASO 7 del flujo original decía 'lee LA
fórmula' (singular). El motor real ejecuta una CADENA de \~15 cálculos
donde el output de cada uno es input del siguiente. C_Formulas es un
catálogo declarativo PLANO: no hay grafo de dependencias ni orden de
ejecución. Si Make tuviera que inferir el orden, reintroduciría lógica
---violando el Principio No-2 (Make ejecuta, Airtable decide).

+-----------------------------------------------------------------------+
| **▌ Resolución de la tensión: la SECUENCIA es dato, no código**       |
|                                                                       |
| Se reconoce un componente lógico nuevo, el **Motor de Ejecución de    |
| Fórmulas**, que vive entre el Motor de Reglas (capa 3) y la capa de   |
| Datos (capa 4). No contiene lógica de negocio: lee el orden desde     |
| C_Formulas (campos depende_de y orden_topologico), hace sort          |
| topológico, detecta ciclos y ejecuta la cadena. Así el encadenamiento |
| existe como DATO en Airtable, no como IFs en Make. El principio se    |
| respeta sin negar que la cadena secuencial es real.                   |
+-----------------------------------------------------------------------+

**Ubicación del componente en las 5 capas**

+-----------------------------------------------------------------------+
| CAPA 3 CAPA 3.5 (NUEVA) CAPA 4                                        |
|                                                                       |
| ────── ──────────────── ──────                                        |
|                                                                       |
| Motor de ──► Motor de Ejecución ──► Datos                             |
|                                                                       |
| Reglas de Fórmulas (C_Formulas, TX_Calculos)                          |
|                                                                       |
| (qué fórmulas) (en qué ORDEN; resuelve DAG) (resultados con snapshot) |
|                                                                       |
| El Motor de Reglas dice QUÉ fórmulas aplican.                         |
|                                                                       |
| El Motor de Ejecución dice EN QUÉ ORDEN y las corre.                  |
|                                                                       |
| Cada paso escribe su resultado + snapshot de expresión en             |
| TX_Calculos.                                                          |
+=======================================================================+

El detalle de los campos del DAG (depende_de, orden_topologico,
es_terminal, grupo_calculo) y el orden topológico verificado de los 11
pasos están en el documento de capa de datos, §18.2. La cadena completa
queda reproducible y auditable: dadas las mismas entradas y la misma
versión de fórmulas, el resultado es determinista (Principio No-6,
idempotencia).

## 14.3 Capa de saneamiento de datos

**Hallazgo crítico #5.** Los datos reales no siempre son numéricos
limpios. El avalúo fiscal puede llegar como texto 'NO REGISTRA' (caso
Exequiel); el RUT del propietario puede ser 0 (rompe el módulo 11 de
validación); hay campos N/D. En el XLSM esto se tolera con T()/IF. En el
modelo, un campo Currency que recibe texto aborta el flujo. Se introduce
una capa de saneamiento que corre ANTES del Motor de Ejecución.

- **Posición en el flujo.** Entre el paso 8 (Claude extract) y el paso 7
  (cálculo): la salida cruda de Claude y del formulario Next.js del
  tasador pasa por saneamiento antes de tocar campos tipados.

- **Comportamiento.** Si un valor no es del tipo esperado, se normaliza
  a null y se activa un flag de 'dato no disponible'
  (avaluo_no_registra, rut_no_disponible). El cálculo trata el dato como
  ausente, no como error, y el informe imprime el literal
  correspondiente.

- **Trazabilidad.** El valor crudo se conserva en un campo \*\_raw y la
  bitácora de normalización queda visible en F4. Reglas de saneamiento y
  campos en el documento de capa de datos, §18.3.

## 14.4 Capa de override auditable

**Hallazgo crítico #2.** El caso Las Rejas es imposible de reproducir
hoy: el tasador HARDCODEÓ la tasa exigida a 5,5% en la celda BJ41,
sobrescribiendo la fórmula que solo produce 4,5%/6,0%. El modelo
declarativo prohíbe editar fórmulas, pero la operación real incluye
overrides por solicitud. Se introduce una capa de override que NO toca
el versionado de fórmulas.

+-----------------------------------------------------------------------+
| **▌ El override vive en la solicitud, no en la fórmula**              |
|                                                                       |
| La fórmula en C_Formulas permanece intacta y versionada (Principio    |
| No-3 y No-7). El override se registra en la SOLICITUD (campos         |
| \*\_override en TX_Solicitudes). Cuando el Motor de Ejecución         |
| encuentra un override no vacío, usa ese valor en lugar del derivado y |
| escribe el hecho en A_Cambios con motivo y autor obligatorios. La     |
| auditoría (Principio No-5) responde siempre 'por qué este informe usa |
| 5,5%'.                                                                |
+-----------------------------------------------------------------------+

Además, el segundo pase corrigió un modelado erróneo: el cap rate NO es
booleano. Caspana (leasing) usa 4,5% y Agencia Habitacional usa 6,0%. La
tasa depende del cliente exacto, no de si el nombre dice 'leasing'. El
campo es_leasing se conserva solo como alerta; la tasa migra a
M_Clientes.tasa_cap_rate (documento de datos, §18.4).

## 14.5 Contrato Claude para el texto descriptivo

**Hallazgo crítico #3.** La síntesis descriptiva y el programa
arquitectónico ---hoy producidos por InputBox de VBA y 41KB de
ExportarBICE.bas--- se delegan a Claude/Carbone, pero el texto es
legalmente parte del informe. Sin contrato, Claude podría alucinar
superficies, orientación o número de dormitorios en un documento
vinculante. Se define un contrato estricto.

  -----------------------------------------------------------------------
  **Cláusula del        **Garantía que aporta**
  contrato**            
  --------------------- -------------------------------------------------
  Fuente restringida    El prompt SOLO usa campos de TX_DatosTasacion y
                        TX_ItemsCuadroValoracion. Prohibido inventar
                        cifras.

  Schema JSON fijo      Salida con claves {sintesis, programa,
                        descripcion_sector}. Estructura validable, no
                        texto libre.

  Validación numérica   Toda cifra (m², dorm., baños, pisos) se contrasta
                        contra el campo de origen. Discrepancia →
                        reintento.

  Insumos estructurados ascensores, espacios comunes, elementos
                        interiores, orientación pasan a ser campos de F3
                        (no InputBox).

  Gate humano F4        El visador DEBE aprobar el texto antes de que el
                        PDF sea final. No hay entrega sin revisión.

  Prompt versionado     Cada texto guarda prompt_version.
                        Reproducibilidad alineada con el Principio No-7.
  -----------------------------------------------------------------------

## 14.6 Suite de regresión: golden master con los 5 casos

**Hallazgo #4.** Sin un criterio objetivo de éxito, la migración es
ciega. Los 5 casos reales se cargan como solicitudes de prueba y sus
valores verificados se comparan contra el output del sistema con
tolerancia CERO. Es el gate de calidad que bloquea el go-live hasta
lograr 100% de coincidencia.

+-----------------------------------------------------------------------+
| **▌ La cobertura de prueba debe ampliarse**                           |
|                                                                       |
| Los 5 casos son TODOS departamentos, TODOS con velocidad de venta '8  |
| a 10 meses'. Ninguno ejercita Casa, Terreno o Local; otro tramo de    |
| velocidad; bien no regularizable; cliente 13 (redondeo FIXED); ni     |
| leasing con bien común por tramos. Antes del rollout total, la suite  |
| debe ampliarse con casos sintéticos que recorran esos caminos, y      |
| pilotear con 2-3 tasadores. NOTA v2.3: la auditoría operacional v2.3  |
| incorporó el caso piloto METLIFE-6283 (Vergara · Casa Colina ·        |
| 13-04-2026) como 6° caso del golden master --- el primero de tipo     |
| Casa. Su cierre obligó a crear las 4 tablas hijas adicionales         |
| (TX_Ampliaciones, TX_HabitacionesPorNivel,                            |
| TX_TerminacionesPorRecinto, TX_DocumentosLegales) y a elevar          |
| TX_Adjuntos + H_PreciosUF a prioridad P0. La cobertura matricial      |
| sigue incompleta para Terreno, Local, Oficina e Industria; el plan de |
| rollout las introduce escalonadamente.                                |
+-----------------------------------------------------------------------+

## 14.7 Reconciliación de doble fuente (Claude vs tasador)

Si Claude extrae mal un m² o un avalúo desde el PDF, el error se propaga
silenciosamente por toda la cadena hasta el valor final. Para mitigarlo,
los datos críticos tienen DOS orígenes: lo que Claude extrae y lo que el
tasador ingresa en terreno. El sistema los reconcilia: si divergen más
de un umbral, levanta un flag de revisión y no continúa el cálculo en
automático. Cada dato lleva un origen (fuente_dato) y un score de
confianza (confianza_ia_pct) ya presentes en TX_DatosTasacion.

## 14.8 Impacto en las 5 capas

Resumen de cómo cada capa de la arquitectura cambia con la adenda v2.2.
La estructura de 5 capas se mantiene; se añade una capa lógica
intermedia y se enriquecen las existentes.

  -----------------------------------------------------------------------
  **Capa**        **Cambio introducido por v2.2**
  --------------- -------------------------------------------------------
  1 ·             F3 incorpora subform de comparables con factores, ítems
  Presentación    con material/valoración, tasa editable con override,
                  datos de rentabilidad, velocidad de venta, vida útil
                  remanente y campos estructurados de texto (reemplazan
                  InputBox VBA).

  2 ·             Make invoca el Motor de Ejecución de Fórmulas y la Capa
  Orquestación    de Saneamiento como pasos del workflow. Sigue sin IFs
                  de negocio: solo orquesta los nuevos componentes.

  3 · Motor de    Sin cambios estructurales. El cap rate deja de
  reglas          derivarse de un booleano y pasa a leerse de
                  M_Clientes.tasa_cap_rate.

  3.5 · Ejecución Motor de Ejecución de Fórmulas: resuelve el DAG de
  (NUEVA)         C_Formulas, aplica overrides y escribe TX_Calculos con
                  snapshots. Capa lógica, no nueva herramienta.

  4 · Datos       Nuevos campos (DAG, override, saneamiento,
                  rentabilidad, USD, materiales), confirmación de flags
                  en TX_ItemsCuadroValoracion y nueva entidad
                  TX_CasosRegresion. Detalle en el documento de datos,
                  §18.

  5 · Generación  Carbone recibe el texto generado bajo contrato Claude
                  (validado y visado). Sin cambio de proveedor; la
                  interfaz JSON→PDF se mantiene.
  -----------------------------------------------------------------------

## 14.9 Problemas arquitectónicos detectados y su resolución

  -------------------------------------------------------------------------------
  **Debilidad detectada**   **Severidad**   **Resolución en v2.2**
  ------------------------- --------------- -------------------------------------
  C_Formulas plano sin      Crítica         DAG explícito (depende_de + orden) +
  grafo de dependencias                     Motor de Ejecución con sort
                                            topológico (§14.2).

  Tensión 'cero lógica en   Alta            La secuencia se modela como DATO en
  Make' vs cadena                           C_Formulas; el orquestador no decide
  secuencial                                el orden, lo lee.

  Texto legal por IA sin    Crítica         Contrato Claude: prompt restringido +
  guardarraíles                             schema + validación numérica + gate
                                            F4 (§14.5).

  Override manual no        Crítica         Capa de override por solicitud,
  contemplado                               auditada en A_Cambios, sin romper el
                                            versionado (§14.4).

  Acoplamiento Claude →     Alta            Reconciliación de doble fuente con
  exactitud del cálculo                     flag de confianza y validación de
                                            rangos (§14.7).

  Idempotencia vs           Media           Snapshot completo de inputs + versión
  regeneración por edición                  de fórmulas por documento generado.
  de F4                                     

  Dependencia de Carbone    Media           Plantilla de fallback + cola de
  como único proveedor                      reintentos (en roadmap).

  Volumen de M_Zonificacion Media           Monitoreo de límites Airtable; plan
  y comparables                             de migración a Postgres si supera
                                            umbral.
  -------------------------------------------------------------------------------

## 14.10 Riesgos de implementación y mitigaciones

  ------------------------------------------------------------------------------------
  **Riesgo**              **Prob.**   **Impacto**   **Mitigación**
  ----------------------- ----------- ------------- ----------------------------------
  Cálculos no reproducen  Media       Crítico       Suite golden master; tolerancia 0;
  el XLSM al céntimo                                bloquear go-live hasta 100% match.

  Claude alucina datos en Media       Crítico       Contrato Claude: prompt
  texto legal                                       restringido + validación +
                                                    revisión humana F4.

  Overrides manuales      Alta        Alto          Capa de override en Fase 1; no es
  rompen casos reales                               opcional.

  Orden de ejecución mal  Media       Alto          DAG explícito + test de ciclos;
  resuelto                                          ejecución determinista.

  Tasador no adopta F3    Media       Alto          UX móvil-first, autoguardado,
  (más campos que antes)                            subform inteligente; piloto con
                                                    2-3 tasadores.

  Migración de            Media       Alto          Validar UF/m² de los 5 casos
  C_PreciosUnitarios                                (40/78/34/32/38) antes de cargar
  incompleta                                        el resto.

  Datos no-numéricos      Alta        Medio         Capa de saneamiento; flags 'no
  cortan el flujo                                   disponible'; tests con caso
                                                    Exequiel.

  Lógica BICE (41KB VBA)  Media       Medio         Tratar BICE como workflow propio
  subestimada                                       con su paso Claude; estimar
                                                    aparte.

  Dependencia de Carbone  Media       Crítico       Cola de reintentos + proveedor de
  (caída)                                           respaldo (en roadmap).
  ------------------------------------------------------------------------------------

## 14.11 Roadmap de cierre priorizado

Orden de implementación recomendado para alcanzar reproducción idéntica
antes del go-live. Se integra al roadmap de 20 semanas de la sección 12
sin extenderlo: estos pasos refinan las Fases 1 a 3.

  ----------------------------------------------------------------------------
  **\#**   **Acción recomendada**                        **Depende de**
  -------- --------------------------------------------- ---------------------
  1        Construir la suite golden master con los 5    Ninguna --- primer
           casos reales                                  paso

  2        Implementar la capa de saneamiento (NO        Suite de tests
           REGISTRA / N/D / RUT 0)                       

  3        Modelar el DAG de C_Formulas y el Motor de    Saneamiento
           Ejecución                                     

  4        Reemplazar es_leasing por tasa_cap_rate +     DAG
           factor_garantia + factor_seguro               

  5        Implementar la capa de override por solicitud DAG
           (tasa, vida útil, valor)                      

  6        Cargar y validar C_PreciosUnitarios y         DAG
           C_VidaUtil contra los 5 casos                 

  7        Confirmar TX_ItemsCuadroValoracion con flags  Saneamiento
           y factor 0,5 terraza                          

  8        Especificar el contrato Claude (prompt +      Ítems + saneamiento
           schema + validación)                          

  9        Agregar fórmulas de rentabilidad (renta       DAG
           perpetua) y conversión USD                    

  10       Extender F3 (comparables, ítems, material,    Modelo de datos listo
           velocidad, rentabilidad)                      

  11       Ejecutar regresión completa: 5 casos → 100%   Todo lo anterior
           match antes de go-live                        

  12       Pilotear con 2-3 tasadores y un cliente antes Regresión OK
           del rollout total                             
  ----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **▌ Implicancia para el go-live**                                     |
|                                                                       |
| Los nueve hallazgos críticos son cerrables dentro del roadmap         |
| original sin extenderlo. La capa de override, la capa de saneamiento  |
| y el Motor de Ejecución son trabajo de Fase 1; los refinamientos de   |
| cálculo y F3, de Fases 2-3. El go-live queda condicionado a un único  |
| gate objetivo: la suite golden master en 100%.                        |
+-----------------------------------------------------------------------+

**--- Fin de la adenda v2.2 ---**

*--- Fin del documento ---*

**IA Solution · Julio 2026**

iasolution.cl
