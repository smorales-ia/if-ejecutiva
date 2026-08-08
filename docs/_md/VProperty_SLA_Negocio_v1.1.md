# VProperty — SLA Operacionales del Negocio

*Tiempos de servicio comprometidos por etapa del workflow de tasación y soporte del sistema para su cumplimiento y medición.*

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 7 de agosto de 2026 |
| **Propósito** | Consolidación con respuestas del cliente (Héctor). Base para incorporación a la especificación oficial. |
| **Fuentes** | Audio explicativo del cliente ("sla del negocio.txt") y audio de validación ("sla parte 2 de 2.txt"). |
| **Cambios vs. v1.0** | Capacidad de visación ajustada a 20 informes/día. SLA de reproceso incorporado. Definición operativa de "recepción del correo". Horario hábil formalizado. Entregables por tipo de cliente detallados. |

---

## 1. Contexto

El proceso de tasación involucra cuatro actores principales:

| Actor | Rol en el proceso |
|---|---|
| **Cliente (ejecutivo de la empresa mandante)** | Solicita la tasación por correo. |
| **Área de Control y Seguimiento (Ejecutiva VProperty)** | Registra, coordina y comunica. |
| **Tasador** | Llama al contacto, visita la propiedad y emite el informe. |
| **Área de Visado (Visador)** | Revisa el informe, lo aprueba y cierra el proceso enviando el PDF final al cliente. |

Cada etapa tiene un tiempo ideal (objetivo) y un tiempo máximo tolerado (SLA).

---

## 2. Descripción narrativa del flujo

1. Llega un correo del cliente solicitando la tasación a los buzones institucionales (`info@` o `contacto@` según el cliente).
2. El área de Control y Seguimiento detecta el correo no leído, lo abre e ingresa la solicitud al sistema, enviándola al tasador. Todo lo recibido en la mañana debe estar ingresado al mediodía; lo recibido al mediodía, ingresado en la tarde. Máximo 3 horas entre recepción del correo y recepción por el tasador.
3. El tasador recibe la solicitud y tiene 4 a 6 horas máximo para llamar al contacto de la propiedad y coordinar la visita.
4. Inmediatamente después del llamado (idealmente en media hora), el tasador informa a Control y Seguimiento el resultado: día y hora de visita coordinada, o incidencia (foro malo, no contestan, etc.).
5. Control y Seguimiento recibe la información del tasador y la comunica al ejecutivo del cliente en un plazo de 2 a 3 horas.
6. El tasador realiza la visita y envía el informe. Plazo máximo 48 horas, con objetivo de bajarlo a 24 horas.
7. Control y Seguimiento baja el informe a Dropbox (o el sistema recibe la carga) y lo pone a disposición del área de visado en 2 a 3 horas.
8. El Visado revisa cada informe en máximo 30 minutos. Con esa capacidad se procesan aproximadamente 20 informes/día por visador (basado en ~400 tasaciones mensuales y 20 días hábiles).
9. Una vez visado, el sistema genera el entregable (PDF y, según cliente, Excel de resumen) y envía automáticamente el correo al cliente final, cerrando el proceso.

---

## 3. Matriz de SLA

### 3.1 Flujo principal (solicitud nueva)

| # | Etapa | Actor responsable | De → A | SLA ideal | SLA máximo |
|---|---|---|---|---|---|
| 1 | Ingreso de solicitud | Control y Seguimiento | Cliente (ejecutivo) → Tasador | **2 h** | **3 h** |
| 2 | Coordinación de visita (llamado) | Tasador | Tasador → Contacto de propiedad | **4 h** | **6 h** |
| 3 | Informe post-llamado | Tasador | Tasador → Control y Seguimiento | **30 min (inmediato)** | **30 min** |
| 4 | Aviso de coordinación al cliente | Control y Seguimiento | Control y Seguimiento → Cliente (ejecutivo) | **2 h** | **3 h** |
| 5 | Visita y envío de informe | Tasador | Tasador → Control y Seguimiento | **24 h** | **48 h** |
| 6 | Bajada de informe a Dropbox / disponible para visado | Control y Seguimiento | Control y Seguimiento → Visado | **2 h** | **3 h** |
| 7 | Visación y envío final | Visado | Visado → Cliente (ejecutivo) — automático | **30 min/informe** | **30 min/informe** |

| Métrica | Valor |
|---|---|
| **Tiempo total end-to-end (caso ideal)** | **~30 horas** |
| **Tiempo total end-to-end (SLA máximo)** | **~62 horas** |

### 3.2 Reproceso (informe ya entregado que vuelve para modificación)

Se considera reproceso cuando el ejecutivo del cliente devuelve un informe ya entregado solicitando incorporar información faltante (ej.: permiso de recepción final, RUT o apellido del vendedor, certificado de profesión), modificar contenido o solicitar aumento de valor (ej.: +5%). El caso más frecuente es incorporar el permiso de recepción final en viviendas usadas.

| # | Etapa | Actor responsable | De → A | SLA ideal | SLA máximo |
|---|---|---|---|---|---|
| R1 | Registro del reproceso y acuse de recibo al cliente | Control y Seguimiento | Cliente (ejecutivo) → RAID de seguimiento | **2 h** | **2 h** |
| R2 | Ejecución del reproceso (tasador realiza el cambio) | Tasador | Tasador → Control y Seguimiento | **Según tipo** | **Ver regla operativa** |
| R3 | Visación y envío del reproceso | Visado | Visado → Cliente (ejecutivo) — automático | **2 h** | **3 h** |

**Regla operativa "reproceso limpio":**

- Reprocesos ingresados a última hora del día anterior (18:00–19:00) o durante la mañana → deben salir despachados antes de las 12:00–14:00.
- Reprocesos ingresados después de las 14:00–15:00 → deben salir despachados en la tarde del mismo día.
- Objetivo: iniciar cada día hábil sin reprocesos pendientes de la jornada anterior.

---

## 4. Cómo el sistema VProperty soporta cada SLA

| Etapa | Soporte en el sistema |
|---|---|
| **1. Ingreso** | IF-02 (Consola Ejecutiva) permite creación de solicitud con carga de documento o entrada manual. El timestamp de "recepción" se registra en el momento en que la Ejecutiva abre el correo e inicia el ingreso (ver sección 6.2). Notificación automática al tasador. |
| **2. Coordinación (llamada)** | El tasador recibe la solicitud en su bandeja. Sistema registra timestamp de asignación. Alerta si supera 4 h sin gestión. |
| **3. Informe post-llamado** | Tasador registra en el sistema el resultado del llamado (fecha/hora de visita o incidencia). Timestamp automático. |
| **4. Aviso al cliente** | Notificación automática o gestionada por Ejecutiva al ejecutivo del cliente con estado "Visita coordinada". |
| **5. Visita e informe** | Tasador sube el informe. Sistema registra fecha real de visita y fecha de subida del informe. |
| **6. Disponibilidad para visado** | Al subir el informe, se dispara la extracción automática (RF-09 con Claude API) y el estado cambia a "En cola para visación". |
| **7. Visación y envío** | Visador aprueba en el sistema. Se genera el entregable según configuración del cliente (ver sección 4.1) y se dispara envío automático de correo. Timestamp de cierre. |
| **R. Reproceso** | IF-02 permite marcar la solicitud como "En reproceso" con motivo tipificado. Se conserva la trazabilidad del informe original y del cambio solicitado. Los SLA de reproceso corren en paralelo a los del flujo principal. |

### 4.1 Configuración de entregable por tipo de cliente

El correo automático final incluye el texto tipo: *"Estimado, se adjunta el informe de la referencia."* El(los) archivo(s) adjunto(s) dependen de la configuración del cliente:

| Tipo de cliente | Entregable adjunto | Observación |
|---|---|---|
| **Estándar (mayoría)** | PDF del informe (parte con carátula y luego el informe). | Configuración base. |
| **Cliente con resumen ejecutivo** | PDF + archivo Excel con resumen del PDF (formato tipo). | El Excel se genera con el mismo formato para todos los clientes de esta categoría. |
| **Cliente Unidad de Vivienda Habitacional** | PDF con primera hoja de resumen embebida, seguida de carátula e informe. | El resumen está dentro del mismo PDF, no como archivo separado. |

El proceso operativo actual: al cierre del visado se sube el(los) archivo(s) a Dropbox y se dispara el correo automático con los adjuntos correspondientes al perfil del cliente.

---

## 5. Métricas y alertas

**Cada solicitud registrará automáticamente:**

- Timestamp de cada transición de estado.
- Tiempo transcurrido por etapa vs. SLA ideal y SLA máximo.
- Indicador visual (verde / amarillo / rojo) según cumplimiento.
- Marca de reproceso, motivo tipificado y SLA propio (R1–R3).

**Alertas:**

- Amarillo al llegar al SLA ideal sin completarse la etapa.
- Rojo al superar el SLA máximo.
- Notificación al responsable de área cuando una solicitud entra en rojo.
- Alerta de fin de jornada para reprocesos aún abiertos (regla "reproceso limpio").

**Reportes:**

- Cumplimiento de SLA por etapa y por actor (diario / semanal / mensual).
- Volumen procesado por visador (capacidad de referencia: ~20 informes/día).
- Volumen y tipología de reprocesos por cliente y por tasador.
- Desviaciones y causas (foro malo, no contesta, reproceso, etc.).

---

## 6. Definiciones operativas validadas con el cliente

Los siguientes puntos fueron validados por Héctor y se incorporan como reglas operativas del sistema.

### 6.1 Horario hábil y calendario de aplicación

- **Aplicación de SLA:** lunes a viernes, de 9:00 a 18:00 hrs.
- **Días excluidos:** sábados, domingos y feriados oficiales. Los tiempos de SLA no corren durante estos días.
- **Recepción de correos:** 24x5 (los buzones reciben las 24 horas, pero el conteo de SLA comienza sólo dentro del horario hábil).

### 6.2 Definición de "recepción del correo"

Los clientes envían solicitudes a dos buzones institucionales: `info@valueproperty` y `contacto@valueproperty` (la asignación por cliente ya está definida). El punto de partida del SLA se define así:

- **NO se considera recepción:** la llegada del correo al buzón.
- **SÍ se considera recepción:** el momento en que Control y Seguimiento abre el correo (deja de estar en "negrita") e ingresa la solicitud al sistema. Sólo Control y Seguimiento tiene esa responsabilidad.
- **Acuse formal:** al ingresar la solicitud, Control y Seguimiento responde al ejecutivo con el mensaje tipo: *"Estimado, acusamos recepción, informamos que el proceso ya está en curso y le comentaremos a la brevedad."*
- **SLA aplicable:** 2 a 3 horas desde el envío del ejecutivo hasta el ingreso al sistema y la generación de la solicitud para el tasador (etapa 1 de la matriz).

### 6.3 Capacidad de visación

- **Capacidad de referencia:** 20 informes/día por visador (ajustado desde 15).
- **Base de cálculo:** ~400 tasaciones mensuales / 20 días hábiles = 20 visaciones/día promedio.

### 6.4 Entregable al cliente

El PDF es el entregable base para todos los clientes. Detalle por perfil de cliente en la sección 4.1.

### 6.5 Reproceso

El reproceso tiene SLA propio y no forma parte de la matriz principal. Se registra en el sistema con motivo tipificado y sigue la regla operativa "reproceso limpio". Ver sección 3.2 para la matriz específica y la regla de despacho diario.

---

*Documento consolidado con las respuestas del cliente. Los SLA aquí definidos se incorporarán a la especificación oficial de VProperty y se implementarán como reglas y alertas del sistema.*
