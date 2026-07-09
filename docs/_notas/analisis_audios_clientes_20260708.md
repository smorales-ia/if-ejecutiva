# Análisis de audios de clientes — VProperty (proyecto completo)

Fecha: 2026-07-08

**Archivos .md leídos como contexto** (lectura completa salvo donde se indica lo contrario):

`CLAUDE.md` · `README.md` · `docs/diseno.md` · `docs/construccion.md` · `docs/schema-airtable.md` · `docs/NOTAS_DIVERGENCIA_v1_2.md` · `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` · `docs/CHECKLIST_PRE_EJECUCION.md` · `docs/ROADMAP_PRE_EJECUCION.md` · `docs/AUDITORIA_ALINEAMIENTO_v1_2.md` · `docs/CLAUDE_MD_ADENDA.md` · `docs/DIAGNOSTICO_ESTADO_ACTUAL.md` · `docs/aprendizajes.md` · `docs/make/SC01_import_instrucciones.md` · `docs/_notas/gap_solicitud_persistencia.md` · `docs/_notas/paso1_terminado.md` · `docs/_notas/reinicio_construccion_7.md` · `docs/_notas/resumen_paso1.md` · `docs/_archivo/texto_diagnostico_INICIAL_obsoleto_20260706.md` · `docs/_archivo/texto_para_docConsistentes_obsoleto_20260706.md` · `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_2.md` (8.625 líneas, lectura completa) · `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_5.md` (lectura completa) · `docs/_md/VProperty_Origen_Datos_Informe_v1.0.md` (lectura completa).

**Cobertura parcial (búsqueda dirigida, no lectura secuencial completa)**: `docs/_md/VProperty_Blueprint_Interfaces_v2_7.md` (verificado: catálogo de interfaces IF-01 a IF-15, IF-01, IF-02, IF-14, IF-15 completos, catálogo de escenarios Make, autocontradicción de conteo de interfaces) · `docs/_md/VProperty_Especificacion_Proyecto_v1_4.md` (verificado: trigger de AT03, definición de SC13). **No leído directamente en esta sesión**: `docs/_md/Arquitectura_Enterprise_VProperty_v2_6.md` — su contenido relevante para IF-02 llega indirectamente vía las citas textuales con número de línea en `NOTAS_DIVERGENCIA_v1_2.md` (H-02, H-03, H-06) y `AUDITORIA_ALINEAMIENTO_v1_2.md`. Se declara como límite de esta sesión, no como omisión silenciosa.

También revisados: árbol completo de `app/` y `components/`, `package.json`.

**Nota metodológica**: ya existía un archivo con este mismo nombre (`docs/_notas/analisis_audios_clientes_20260708.md`, sin rastrear en git) con un análisis previo completo. Este documento lo reemplaza por completo: se releyeron los 4 audios íntegros y la documentación de forma independiente, y se verificaron puntualmente varias de las afirmaciones del borrador anterior contra los documentos canónicos (`_md/`) en vez de darlas por ciertas. Varios hallazgos del borrador se confirmaron con cita exacta; otros se corrigieron o enriquecieron — ver notas inline.

**Audios analizados** (4, todos con transcripción utilizable, ninguno vacío/ilegible):
- `Hector_RevMaquetaV1_20260623_1022.txt`
- `Hector_RevMaquetaV2_20260624_1319.txt`
- `Hector RevMaquetaV3 20260705 1705.txt`
- `Hector RevMaquetaV3 20260705 1706.txt`

Los cuatro son notas de voz del mismo interlocutor (Héctor, dueño/gerente de la operación de tasaciones de VProperty) dirigidas a Sergio, en tres sesiones (23-jun, 24-jun, 05-jul-2026). Describen el **proceso manual real** (Excel "Planilla Madre" + Dropbox + Drive), en paralelo al sistema que se está construyendo.

---

## 1. Resumen ejecutivo

El negocio opera hoy sobre una "Planilla Madre" Excel que hace de ERP de facto (ingreso, workflow SLA, honorarios, cobros), con un ciclo solicitud→visita→informe→visado→entrega y reprocesos diarios de fin de mes. El Escenario A de foto-only (mismo edificio → reutilizar ficha) **se confirma directamente** como práctica informal ya vigente; ni B ni C aparecen mencionados. El hallazgo más fuerte de Eje 3 es que el negocio real ya usa automatización no oficial (scraping TocToc "para que no lo detectaran") para lo mismo que el diseño canónico resuelve con captura 100% manual del tasador en IF-03 — brecha entre diseño y práctica, no solo entre sistema y Excel. Se verificó y confirmó una tabla de honorarios (`C_TramosHonorarios`, reparto 90/10 tasador/empresa) ya diseñada y sin conectar a ningún flujo de IF-02, que resuelve directamente el proceso de pago descrito en audio. `M_Zonificacion` existe pero **no** tiene el campo "altura máxima" que el audio atribuye a la hoja oculta del Excel — solo coeficiente de ocupación de suelo y plan regulador por sector; haría falta agregar el campo antes de reemplazar el Excel. Se confirmaron por cita exacta tres divergencias documentales adicionales a H-02/H-03/H-06/H-07 (trigger de AT03, autocontradicción de conteo de interfaces del Blueprint, y una doble definición de SC07). No hay contradicciones entre los audios entre sí.

---

## 2. Situación actual end-to-end (Eje 1)

### Ingreso
Tres tipos de cliente por canal: (1) mail simple con datos mínimos —nombre, a veces RUT y celular— desde áreas comerciales desestructuradas; (2) mail con área de operaciones centralizada que adjunta certificados y datos completos; (3) extranet propia del cliente (hoy solo MetLife), con un ID de solicitud. Llegan por dos correos corporativos (`contacto@` e `info@`) revisados cada mañana a las 9-10h *(fuente: `Hector_RevMaquetaV1_20260623_1022.txt`, líneas 12-16)*. El área de control y seguimiento digita manualmente en la Planilla Madre y asigna tasador por comuna/región. Esto coincide con lo que IF-01 (Blueprint v2.7 §7.1, formulario externo Tipo A) y el alta interna de IF-02 buscan formalizar — el canal (3) extranet es el precedente real de IF-01; los canales (1) y (2) son el precedente de la alta interna de IF-02.

### Asignación
Al asignar, el sistema Excel dispara un mail automático al tasador; adicionalmente, para tasadores "más pro" (o "los más remolones"), el área de control y seguimiento envía un WhatsApp **manual** desde celulares de la empresa *(fuente: V1, líneas 19-20)*. El tasador tiene **4 horas** para devolver la fecha de visita *(fuente: V1, línea 19; V2, línea 13)*. **Verificado contra `Diseno_Capa_Datos_v2_6_2.md` (búsqueda exhaustiva de "4 horas", "24 horas", "sla_horas", "confirmar visita")**: no existe ningún campo ni tabla que module un SLA en horas — `C_SLA` solo trabaja en granularidad de días (`sla_dias`, `sla_dias_alerta`, `sla_dias_vencido`). El SLA de 4h es una regla operativa 100% informal, no digitalizada en ningún documento canónico.

### Visita
La visita real ocurre en promedio +2 días tras la coordinación por saturación de ruta del tasador *(fuente: V1, línea 22)*. El máximo operativo tolerado son 3 días desde la visita hasta el envío del informe, controlado con semáforo de colores en Drive (3/2/1 días) revisado cada mañana *(fuente: V1, V2)*. Esto corresponde a la transición `asignada → visitada` de IF-03 en el diseño — aunque, ver más abajo, **Especificación v1.4 y Motor de Cálculo v2.5 no coinciden en qué estado sigue a la visita** (divergencia nueva, ver sección de divergencias).

### Extracción de datos / fuentes
El informe se arma con múltiples fuentes manuales *(fuente: `Hector RevMaquetaV3 20260705 1705.txt`)*: UF y dólar (web); metros cuadrados/tipo constructivo/año desde una base comprada "Servicios Puestos Internos" (SII) con ~6-7 millones de roles de Chile, **excepto propiedades nuevas de <6 meses**, donde se usa la ficha/carta oferta de la inmobiliaria; permiso de edificación y recepción final desde certificados municipales (fuente frecuente de reprocesos); avalúo fiscal desde el sitio del SII, bloqueado por **captcha manual**; deuda de tesorería (sin captcha); comparables de oferta vía scraping de TocToc con un programa a medida "para que no lo detectaran"; y un Excel oculto con planes reguladores nacionales por comuna que se pega automáticamente en el informe.

**Cruce verificado contra `Origen_Datos_Informe_v1.0.md` y `Motor_Calculo_AT01_AT10_v2_5.md`** (ambos leídos completos): el diseño canónico **no describe ninguna automatización de scraping** para SII, CBR, DOM, TGR, SEC, SERVIU ni comparables de oferta. Todo el flujo documentado pasa por (a) subida manual de PDF/certificado + extracción Claude vía SC07, o (b) captura 100% manual del tasador en IF-03 (`TX_Comparables`, 3 a 10 filas, incluyendo URL de la publicación). El "programita" de TocToc mencionado en el audio (V3-1705) **no tiene equivalente ni sustituto en ningún documento canónico** — es una automatización informal del negocio actual que ni siquiera el diseño futuro contempla reemplazar por algo mejor; el diseño futuro es, de hecho, un paso atrás en automatización respecto a la práctica real (vuelve a captura manual). Esto es un hallazgo nuevo no capturado por ningún `.md` de roadmap.

**Cruce verificado contra `Diseno_Capa_Datos_v2_6_2.md`**: `M_Zonificacion` (tabla ya migrada, 2.744 filas desde el Excel legacy) sí tiene `prc_sector` (plan regulador del sector) y `coef_ocupacion_suelo_max`, pero **no tiene ningún campo de altura máxima** — el audio atribuye "altura máxima" a la misma hoja oculta que el coeficiente de constructibilidad (V3-1705, línea 15). Antes de usar `M_Zonificacion` para reemplazar el Excel oculto (ver funcionalidad Eje 3 #4), hay que agregar el campo faltante o confirmar que "altura máxima" no se necesita en el informe.

### Cálculo / informe
El tasador trabaja sobre un Excel en blanco por operación y tiene **2 días** tras la visita para enviarlo por la misma cadena de mail de la solicitud original *(fuente: V1, líneas 28-29)*.

### Visado
El área de control y seguimiento descarga el Excel, lo guarda en Dropbox y Drive; el área de visado revisa **forma** (fecha, UF, dólar, nombre, RUT) y **fondo** (valores). Héctor u Oscar hacen la revisión final de fondo antes de generar el PDF *(fuente: V1, líneas 32-37)*. Héctor menciona un **incentivo perverso**: el ejecutivo del banco pierde su comisión si la tasación no "llega al valor" del crédito, lo que presiona al alza; dice mitigarlo con criterio conservador pero lo reconoce como riesgo estructural *(fuente: V1, líneas 34-35)*.

### Entrega
El PDF final se guarda en la misma carpeta Dropbox creada al llegar la solicitud y se envía por el canal de origen *(fuente: V1, líneas 45-47)*.

### Reprocesos (post-entrega, sin estado formal hoy)
6-7 reprocesos diarios llegan a las 6-7am, gatillados por el proceso de escrituración del cliente: dirección debe coincidir con "certificado de número", RUT del vendedor faltante, segundo apellido, u otros documentos no disponibles al momento de tasar *(fuente: V1, líneas 17-18; V3-1706)*. Se conserva **un solo Excel** por operación pero pueden generarse hasta 3 versiones de PDF. Héctor valora explícitamente la rapidez de respuesta a reprocesos como ventaja competitiva *(fuente: V1, línea 49; V3-1706)*.

**Verificado contra `Diseno_Capa_Datos_v2_6_2.md`**: no existe ningún identificador estructurado de edificio/torre en `TX_Solicitudes` — solo `direccion` (texto libre) y `rol_sii`. La única función de historial por dirección que existe en el diseño es el botón "Ver historial de la propiedad" del visador contra `H_Solicitudes_Cerradas`, y es búsqueda de texto libre sin FK. Los permisos de edificación y recepción final **no viven en `TX_DocumentosLegales`** (esa tabla modela CBR/Notaría/Cert. No Expropiación/Cert. Hipoteca/TGR/Cert. Línea Oficial) sino como campos sueltos `permiso_edif_num` y `recepcion_final` en `TX_DatosTasacion`. Esto corrige un supuesto del borrador anterior de esta sesión (que asumía reutilización vía `TX_DocumentosLegales`) — lo reutilizable en la práctica sería el valor de esos dos campos de una solicitud cerrada anterior con la misma dirección, no un documento adjunto vinculado.

### Honorarios y cobros (función no digitalizada, con infraestructura ya diseñada y sin conectar)
La Planilla Madre gatilla el honorario al tasador cuando VProperty **envía el informe al cliente** (no cuando el tasador entrega su Excel) y el cobro a clientes es un proceso manual mensual (día 5) con una marca "comisión cobrada"/"no cobrada" que puede desfasarse varios meses del envío real *(fuente: V2, líneas 16-19)*.

**Hallazgo nuevo, verificado contra `Diseno_Capa_Datos_v2_6_2.md` líneas 1798-1837**: existe `C_TramosHonorarios` (tabla de configuración, ~10-20 filas), con `uf_min`/`uf_max` (rango de UF tasada), `honorario_uf` (monto a cobrar al cliente), `pct_tasador` (default 0.90) y `pct_empresa` (default 0.10) — el reparto 90/10 que describe el audio ya tiene un modelo de datos completo diseñado, y no está conectada a ningún flujo de IF-02 ni mencionada en `schema-airtable.md`. Es un hallazgo más fuerte que el campo `comision_ov` (TBD-09) que ya estaba documentado como pendiente de semántica — `C_TramosHonorarios` resuelve directamente el "yo le pago al tasador" del audio.

### Top 5 dolores priorizados por frecuencia
1. **Reprocesos de fin de mes** — 6-7 diarios, sin flujo formal en la máquina de estados de `TX_Solicitudes` (termina en `cerrada` sin ciclo de retorno).
2. **Coordinación de visita 100% manual con WhatsApp** — repetido cada asignación, sin trazabilidad más allá del celular de la empresa, y sin ningún SLA en horas modelado en Airtable.
3. **Captcha del SII para avalúo fiscal** — bloquea cualquier automatización de ese dato específico, y el diseño canónico tampoco lo automatiza (todo pasa por certificado subido + Claude).
4. **Scraping informal de comparables (TocToc) sin respaldo en el diseño** — el negocio ya automatizó esto de forma no oficial; el diseño futuro (`TX_Comparables` 100% manual en IF-03) no lo sustituye, retrocede en automatización.
5. **Incentivo perverso del tasador** — riesgo de calidad/sesgo mencionado explícitamente por el propio dueño del negocio, sin control formal más allá de su revisión personal.

### Contradicciones detectadas entre audios
Ninguna. Los cuatro audios son del mismo narrador en sesiones consecutivas y son complementarios.

### Divergencias documentales verificadas (no vienen de los audios; cruces entre `.md` canónicos)

Estas complementan — no reemplazan — `NOTAS_DIVERGENCIA_v1_2.md` (H-02, H-03, H-06, H-07). Todas fueron verificadas con cita textual en esta sesión, no asumidas:

1. **Trigger de AT03 — divergencia real confirmada.** `Motor_Calculo_AT01_AT10_v2_5.md` usa `estado=visitada` consistentemente (líneas 35, 672, 929, 1099; sin ninguna mención de "capturada" en todo el documento). `Especificacion_Proyecto_v1_4.md` usa `estado=capturada` consistentemente (líneas 794, 834, 1606) y además describe una transición `asignada → capturada` (línea 794) que **no aparece en la máquina de 11 estados** de `Capa_Datos_v2_6_2.md` ni en `diseno.md` §2 de IF-02 (que va `asignada → visitada` directo). Esto sugiere que Especificación v1.4 modela un estado intermedio (`capturada`, probablemente "el tasador subió los datos pero aún no se ejecutó el cálculo") que las otras dos fuentes canónicas colapsaron en `visitada`. No bloquea IF-02 (que no opera esos estados), pero si una sesión futura de IF-03 usa `Especificacion_Proyecto_v1_4.md` como referencia sin cruzarla contra Capa Datos, puede introducir un estado que no existe en el schema real.
2. **Autocontradicción de conteo de interfaces en Blueprint v2.7 — confirmada.** Línea 363: "Quince interfaces (IF-01 a IF-15, con IF-14 e IF-15 añadidas en v2.6...)". Línea 4062 (§13.1, tabla de entregables): "Catálogo de **13** interfaces con tipo A/B, propósito, entradas, acciones y salidas — §2". El documento sí desarrolla IF-01 a IF-15 completas en §7 (verificado: IF-14 "Administración paramétrica de documentos" y IF-15 "Captura de documentos opcionales por la ejecutiva", líneas 3232-3430) — el catálogo resumen de §2/§13.1 quedó desactualizado tras la adenda v2.6 que agregó IF-14/IF-15.
3. **Códigos Make SC15, SC16, SC19 — huérfanos, confirmado.** Aparecen una única vez en todo Blueprint v2.7, línea 3491-3492: *"...las automatizaciones por AT01--AT10 (Airtable Scripts) y SC01, SC05, SC06, SC07, SC09, SC13, SC15, SC16, SC19 (Make)."* Ningún desarrollo posterior en el documento. Posible funcionalidad Make prevista y nunca documentada en detalle.
4. **SC07 — doble definición contradictoria, hallazgo nuevo (no estaba en H-06).** `Origen_Datos_Informe_v1.0.md` define SC07 consistentemente como extracción Claude sobre PDFs adjuntos (líneas 26, 160, 275-280, 1059). `Motor_Calculo_AT01_AT10_v2_5.md` usa "SC07+SC09" para la **generación del PDF final** (líneas 225-226, 258, 345, 916, 938, 1110) — función completamente distinta. H-06 en `NOTAS_DIVERGENCIA_v1_2.md` ya registra que RF-09 (IF-02) no debe usar el código "SC07" por colisión con IF-03; este hallazgo muestra que la colisión es más profunda: ni siquiera los propios documentos fuente están de acuerdo en qué hace SC07.
5. **`TX_Adjuntos.tipo`** (ya parcialmente documentado en el borrador anterior de esta sesión): `Diseno_Capa_Datos_v2_6_2.md` línea 3028-3030 define el enum exactamente como `foto · plano · sii · cbr · permiso · recepcion · email_cliente · titulo_dominio · otro` — confirmado por cita exacta, coincide con lo ya registrado en `schema-airtable.md` como divergente del schema real (11+ valores mixtos).

---

## 3. Escenarios foto-only (Eje 2)

| Escenario | Evidencia en audios | Viabilidad | Interfaces impactadas | Escenarios Make impactados | Bloqueadores | Próximo paso de validación |
|---|---|---|---|---|---|---|
| **A. Mismo edificio → clonar ficha + fotos del depto** | **Confirma directamente**: *"si tenemos el permiso y la recepción no es necesario pedirlo porque ya lo tenemos"* (V3-1706) | **Alta** — ya es práctica informal | IF-02 (alta, banner), IF-03 (precarga tasador), IF-04 (visador ve procedencia) | Extiende SC01 (Search Records adicional contra `TX_Solicitudes`/`H_Solicitudes_Cerradas` por dirección) | No existe campo de edificio/torre en el schema (confirmado, ver §2); lo reutilizable son los campos `permiso_edif_num`/`recepcion_final` de `TX_DatosTasacion`, no un documento de `TX_DocumentosLegales` | Definir criterio de "mismo edificio" (pregunta abierta #1) y probar matching por dirección normalizada sobre datos reales de Planilla Madre |
| **B. Propiedades +8 años → SII/CBR/DOM + fotos, visador arma ficha** | **No mencionado directamente.** Evidencia indirecta: la base SII cubre "todo Chile" salvo <6 meses (V3-1705) | **Media** — el insumo remoto existe y se usa hoy vía certificado subido + Claude, pero el diseño no contempla saltarse la visita | IF-02, IF-03, IF-04 | RF-09 ya cubre extracción documental; no requiere escenario nuevo | Sin umbral de antigüedad ni criterio de "visita reducida" en ningún documento | Entrevistar a un tasador sobre qué puede omitir en terreno para propiedad antigua |
| **C. Solo-fotos universal (Claude arma 90% desde 15-20 fotos guiadas)** | **No mencionado ni respaldado ni contradicho** | **Baja** — sin respaldo en audios; el diseño de extracción Claude (SC07/RF-09) procesa PDFs de certificados, no fotos estructurales; `TX_Comparables` e IF-03 asumen visita presencial en todo el diseño revisado | IF-03 (checklist fotos: `M_TiposPropiedad.num_fotos_minimas`) | Requeriría escenario Make de visión, fuera del alcance descrito en Origen Datos v1.0/Motor Cálculo v2.5 | Ningún documento canónico define flujo solo-fotos; sería capacidad nueva del motor, no solo de captura | Entrevista a tasadores/visadores sobre qué % del informe depende de medición presencial |

### Escenario D — no considerado antes

**Nombre**: Reproceso post-entrega con control de versión formal (patrón operativo maduro, no cubierto por ningún estado del diseño actual).

**Descripción**: el negocio opera un ciclo de "revisión posterior a la entrega" disparado por la escrituración del cliente, que reabre un expediente formalmente `cerrado` sin ser un caso nuevo ni requerir visita: ajusta datos (dirección vs. certificado, RUT, apellido faltante) o incorpora un documento legal no disponible al tasar. Hoy se resuelve 100% en Excel/Dropbox con la disciplina "un Excel, múltiples PDF versionados" y respuesta el mismo día.

**Audios que lo sugieren**: `Hector_RevMaquetaV1_20260623_1022.txt` (líneas 17-19, describe volumen y versionado) y `Hector RevMaquetaV3 20260705 1706.txt` (caso concreto: certificado de número, títulos en paralelo).

**Flujo end-to-end propuesto**:
- **Interfaz**: IF-02 (inicia la ejecutiva o el visador) e IF-04 (re-valida antes de re-emitir).
- **Disparador**: acción "Solicitar reproceso" sobre solicitud `entregada`/`cerrada`, con motivo obligatorio (catálogo cerrado: dirección≠certificado, RUT/apellido faltante, documento adicional, otro).
- **Estado**: estado lateral `en_reproceso` (análogo a `requiere_atencion`) que vuelve a `entregada` al cerrar, incrementando `veces_reprocesada`.
- **Tablas Airtable**: `TX_Solicitudes` (nuevo campo `veces_reprocesada` + `pdf_final_url` versionado), `A_Eventos` (`reproceso_solicitado`/`reproceso_resuelto`).
- **Make**: ninguno nuevo — reutiliza el pipeline Carbone (E1/E2/E3) ya activo.
- **Rol que firma**: el visador re-aprueba antes de reenvío.

---

## 4. Funcionalidades no consideradas (Eje 3)

| # | Funcionalidad | Interfaz destino | Problema que resuelve (con cita) | Tablas Airtable reutilizadas | Componentes UI existentes | Escenario Make | Esfuerzo | Valor | RF sugerido |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Alerta de SLA de 4h para coordinación de visita | IF-02 | *"tiene cuatro horas para devolver la fecha de visita"* (V1) — sin campo de horas en ningún documento canónico (verificado) | `TX_Solicitudes`, `C_SLA` (requiere extensión a granularidad horas), `A_Eventos`, `TX_Notificaciones` | `SLABadge`, `TabsVistas` (nueva vista "Por confirmar visita") | No requiere (Airtable Automation nueva, patrón AT08) | S | A | RF-10 |
| 2 | Reapertura formal de solicitudes cerradas (reproceso, Escenario D) | IF-02 / IF-04 | *"esos reprocesos nos quitan tiempo"* + *"les piden juntar el permiso y la recepción"* (V1, V3-1706) | `TX_Solicitudes` (campo nuevo `veces_reprocesada`), `A_Eventos` | `BarraAccionesDetalle`, `StateBadge` | No requiere | M | A | RF-11 |
| 3 | Detección "mismo edificio" + reutilización de `permiso_edif_num`/`recepcion_final` | IF-02 (alta) | *"si tenemos el permiso y la recepción no es necesario pedirlo"* (V3-1706) | `TX_Solicitudes`, `TX_DatosTasacion` (campos reutilizables — corregido vs. supuesto de `TX_DocumentosLegales`), `H_Solicitudes_Cerradas` | `AddressField`, `NewRequestSheet` | Existe — extiende SC01 (Search Records adicional) | M | A | RF-12 |
| 4 | Conectar `C_TramosHonorarios` al ciclo de pago a tasadores | Nueva (F5/admin) o extensión IF-02 | *"cuando nosotros le enviamos al cliente, ahí le pagamos el honorario... 90/10"* (V2) — tabla con `pct_tasador=0.90`/`pct_empresa=0.10` **ya diseñada y sin conectar a ningún flujo** (hallazgo nuevo, más fuerte que `comision_ov`) | `C_TramosHonorarios` (existe, sin uso), `TX_Solicitudes.estado=entregada` como trigger | Ninguno existente — tab nuevo | No requiere inicialmente (lectura + automation de marcado) | M | A | RF-14 |
| 5 | Activar `M_Zonificacion` para reemplazar el Excel oculto de plan regulador (con gap de campo) | IF-02 / IF-03 | *"esa hoja oculta tiene los planes reguladores... coeficiente de constructibilidad, altura máxima"* (V3-1705) — tabla existe (`prc_sector`, `coef_ocupacion_suelo_max`) pero **sin campo de altura máxima** (verificado, gap real) | `M_Zonificacion` (existe, sin consumidor; requiere campo nuevo `altura_maxima`), `M_Comunas` | `RegionComunaSelector`, `TabDatos` | No requiere (solo lectura Airtable) | S | M | RF-13 |
| 6 | Formalizar comparables sustituyendo el scraping informal de TocToc por `H_Comparables_Historico` + captura manual asistida | IF-03 / motor de cálculo | *"vamos a Toc Toc... un programita... para que no lo detectaran"* (V3-1705) — el diseño canónico ya asume captura 100% manual en `TX_Comparables` (verificado en Origen Datos v1.0), sin scraping; `H_Comparables_Historico` acumula `portal_toc`·`cbr`·`solicitud_anterior` como fuente | `H_Comparables_Historico` (existe, sin uso), `TX_Comparables` | Ninguno aún | No requiere inicialmente (fase 1: solo lectura/acumulación) | L | M | RF-15 |
| 7 | Vista "Mi cartera" segmentada por calidad de canal de origen | IF-02 | *"el cliente más básico... un mail con texto"* vs. *"área centralizada... nos envía más información"* (V1) | `TX_Solicitudes.canal_contacto_original` (existe, creado 08-jul-2026, sin uso pleno en UI) | `TabsVistas`, `FiltrosBar` | No requiere | S | M | RF-16 |
| 8 | Exponer captura de documentos vía IF-14/IF-15 para reducir dependencia de `observaciones_internas` | IF-02 (evaluar reutilizar IF-15 en vez de construir uno nuevo) | Combinación V3-1706 (reutilización de certificados) + gap real: `TX_Solicitudes` no tiene campo propio para varios documentos legales | `D_TipoDocumento`, `D_Documento`, `D_DocumentoValorAtributo` (dominio ya diseñado, 8 tablas, **sin link a `TX_Solicitudes`** — verificado) | Ninguno (IF-14/IF-15 son Airtable Interfaces nativas, no Next.js) | No requiere | M | B | RF-17 |
| 9 | Badge de "avalúo fiscal pendiente por captcha SII" con recordatorio de captura manual | IF-02 / IF-03 | *"el avalúo tiene un captcha... uno tiene que colocar abajo y aceptar"* (V3-1705) — confirmado que ni el diseño canónico lo automatiza | `TX_DatosTasacion`, `TX_Adjuntos` | `ExtraccionStatusBadge` (extender con estado `requiere_captura_manual`) | No requiere | S | B | RF-18 |
| 10 | Notificación WhatsApp automatizada a tasadores (extiende notificación al tasador) | IF-02 | *"también le mandásemos un WhatsApp y eso lo hacemos manual"* (V1) | `C_NotificacionesConfig` (contempla canal `whatsapp` en diseño) | Ninguno | **Nuevo** — consumiría un 3er escenario Make activo; marcar como bloqueador de plan Free | L | M | RF-19 |

---

## 5. Top 3 priorizadas

### 1. Alerta de SLA de 4h para coordinación de visita (RF-10)
Hoy el control y seguimiento revisa manualmente cada mañana si los tasadores respondieron dentro de las 4 horas pactadas; no hay alerta automática ni vista dedicada, y se confirmó que ningún documento canónico modela un SLA en horas (solo días en `C_SLA`). Es el gap más barato de cerrar.

**User story**: Como ejecutiva comercial, quiero ver en una vista dedicada las solicitudes `asignada` sin `fecha_visita_programada` hace más de 4 horas hábiles, para escalar al tasador antes de que se acumule el atraso.

**Pasos técnicos**:
1. Crear campo `sla_confirmacion_visita_horas` (Number) en `C_SLA` o constante en runtime.
2. Airtable Automation (patrón AT08): cron horario, filtra `estado=asignada` y `fecha_visita_programada` vacío hace >4h hábiles.
3. Escribe fila en `TX_Notificaciones` y evento en `A_Eventos`.
4. Vista Airtable "Por confirmar visita" con `filterByFormula`.
5. Tab en `TabsVistas` de IF-02 vía Route Handler existente.
6. Badge visual reutilizando `SLABadge`.

**Gap de datos en Airtable**: no existe campo con la hora exacta de paso a `asignada` (solo `fecha_asignacion`, tipo Date sin hora) — usar timestamp de un evento en `A_Eventos` como proxy.

**Riesgo principal**: el SLA de 4h es política verbal, no contractual — construir la alerta sin validarla con el negocio genera ruido.

### 2. Reapertura formal de solicitudes cerradas — reproceso (RF-11)
Dolor de mayor frecuencia (6-7 diarios), sin soporte en la máquina de estados (termina en `cerrada` sin retorno). Formalizarlo mide un problema hoy invisible para el sistema.

**User story**: Como ejecutiva o visador, quiero reabrir una solicitud `entregada`/`cerrada` con motivo tipificado, para volver a emitir un PDF corregido sin perder historial ni duplicar la solicitud.

**Pasos técnicos**:
1. Campo `veces_reprocesada` (Number) + estado lateral `en_reproceso`.
2. Botón "Solicitar reproceso" en `BarraAccionesDetalle`, visible solo si `estado ∈ {entregada, cerrada}`.
3. Modal con motivo obligatorio, reutiliza patrón de `ReasignarTasadorDialog`.
4. Route Handler `POST /api/webhooks/reproceso` → `estado=en_reproceso`, incrementa contador, `A_Eventos(tipo=reproceso_solicitado)`.
5. Al resolver, Automation vuelve `estado=entregada` y regenera PDF vía pipeline Carbone activo (E1/E2/E3).
6. `EventTimeline` refleja el ciclo sin alterar historial previo.

**Gap de datos**: no existe `en_reproceso` ni `veces_reprocesada`; modificar el enum de `estado` toca AT01-AT10, requiere validación del Enterprise Architect.

**Riesgo principal**: cambio de arquitectura transversal, no aislado a IF-02.

### 3. Conectar `C_TramosHonorarios` al ciclo de pago a tasadores (RF-14)
La tabla de honorarios (reparto 90/10, tramos por UF tasada) ya está diseñada y verificada en `Diseno_Capa_Datos_v2_6_2.md`, pero no está conectada a ningún flujo — hoy el cálculo y marcado "comisión cobrada" es 100% manual en Excel (V2). Es la funcionalidad con mayor infraestructura ya construida y menor esfuerzo relativo dado su valor.

**User story**: Como administrador/Héctor, quiero que al pasar una solicitud a `entregada` el sistema calcule automáticamente el honorario del tasador según `C_TramosHonorarios`, para eliminar el cálculo manual mensual y el desfase de meses entre envío y cobro.

**Pasos técnicos**:
1. Confirmar semántica real de `comision_ov` (TBD-09) vs. el propósito de `C_TramosHonorarios` — pueden ser el mismo concepto con nombres distintos (pregunta abierta).
2. Airtable Automation: al `estado→entregada`, busca tramo aplicable en `C_TramosHonorarios` por `monto_estimado_uf`, calcula `honorario_uf × pct_tasador`.
3. Nuevo campo `honorario_calculado` + `honorario_pagado` (checkbox) en `TX_Solicitudes` o tabla auxiliar.
4. Vista/tab (F5 o extensión IF-02) para marcar pagado/cobrado, análogo al botón manual descrito en V2.
5. `A_Eventos` registra el cálculo para auditoría.
6. No tocar UI de IF-02 más allá de mostrar el dato — el cálculo vive en Airtable (principio rector del proyecto).

**Gap de datos**: falta confirmar si `C_TramosHonorarios` está poblada con tramos reales o es solo estructura; falta el campo de "cobro a cliente" (distinto del honorario al tasador) que describe V2.

**Riesgo principal**: tocar el ciclo de pago es sensible financieramente — requiere validación explícita de Héctor antes de automatizar cualquier cálculo de honorarios, no solo aprobación técnica.

---

## 6. Descartadas con razón

- **Automatización completa del avalúo fiscal SII**: bloqueada por captcha manual explícito (V3-1705); confirmado que ni el propio diseño canónico lo automatiza. Resolverlo requeriría OCR/resolución de captcha, infraestructura nueva fuera del stack permitido y riesgo de violar términos de uso del SII.
- **Ampliar o formalizar el scraping de TocToc**: el propio audio señala que el programa actual está hecho "para que no lo detectaran" (V3-1705) — práctica de riesgo legal/contractual que no debe replicarse. Alternativa recomendada (funcionalidad #6, Eje 3): sustituir progresivamente por `H_Comparables_Historico` + captura manual asistida, no reforzar el scraping.
- **WhatsApp automatizado a tasadores (RF-19)**: viable en el diseño (`C_NotificacionesConfig.canal` contempla `whatsapp`), pero requiere cuenta/conexión WhatsApp Business nueva en Make y un 3er escenario activo, superando el plan Free. Se mantiene en Eje 3 como candidata, no se prioriza.
- **Sistema de facturación/cobro completo a clientes**: el proceso de cobro mensual manual (V2) sugiere una necesidad real, pero construir un módulo de facturación completo excede "reutilizar infraestructura existente" — requeriría modelo contable nuevo. Se prioriza en su lugar solo conectar `C_TramosHonorarios` (funcionalidad #4).

---

## 7. Preguntas abiertas para próxima entrevista

1. ¿Cuál es el criterio exacto para "mismo edificio" — calle y número, o existe ya un identificador de torre/rol que el negocio usa internamente?
2. ¿El SLA de 4 horas para coordinar la visita es política interna de VProperty o exigencia contractual de algún cliente específico (y varía por cliente)?
3. ¿Existe un catálogo real de motivos de reproceso, o hay que construirlo desde cero a partir de casos históricos en Dropbox/Drive?
4. ¿`comision_ov` (TBD-09) y `C_TramosHonorarios` son el mismo concepto, o son dos mecanismos de honorarios distintos que conviven?
5. Más allá del criterio conservador personal de Héctor, ¿existe algún control de calidad o auditoría formal de valores tasados que mitigue el "incentivo perverso" que él mismo describe?
6. ¿Hay apetito del negocio para migrar de scraping de TocToc a una fuente de datos con licencia/API oficial, o es un costo que hoy no se justifica?
7. ¿El envío de WhatsApp a tasadores debe automatizarse, o el negocio prefiere mantenerlo manual por relación personal con los tasadores "más remolones"?
8. ¿La base "Servicios Puestos Internos" (SII) que compra VProperty incluye algún identificador de edificio/torre que permita automatizar "mismo edificio" sin comparar direcciones en texto libre?
9. ¿`C_TramosHonorarios` está poblada con tramos reales hoy, o es solo la estructura de tabla sin datos de negocio cargados?
