# Diagnóstico — Brechas de la Base de Datos VProperty vs Contenido del Proyecto

> **Insumo**: Base Airtable `VProperty_Tasaciones` (46 tablas activas al 16-jul-2026) contrastada con `VProperty_Especificacion_Proyecto_v1_5.md`, `Diagnostico_Lectura_Documentos_v1.md` y transcripciones de audio de Héctor (ld1-4, df1, 6, 7, WhatsApp Ptt, RevMaqueta V1-V4).
> **Equipo**: Arquitecto Enterprise · Diseñador de Datos · Analista Funcional · Ingeniero de Integraciones (Claude/Dropbox) · Especialista UX.
> **Metodología**: identificar preguntas del negocio que la base actual NO puede responder o NO considera.

---

## 🔴 ALTA — bloquean operación o cierre de diseño

### 1. "¿Cuántas veces se reajustó el valor de esta tasación y por qué?"
Héctor lo describe: envío 1.200 UF, piden aumento a 1.300 UF, después otro. Hoy `TX_DocumentosGenerados` guarda versiones del PDF, pero no guarda el valor UF por versión ni el motivo del ajuste.
**Solución**: agregar en `TX_DocumentosGenerados` los campos `valor_comercial_uf_snapshot`, `motivo_ajuste` y `solicitado_por`.

### 2. "¿Qué otras tasaciones hicimos en el mismo edificio/proyecto?"
Héctor: "San Martín 2040 y San Martín 2050 son el mismo edificio nuevo". Hoy `TX_Comparables` compara por texto libre en `direccion`; no hay identificador de edificio ni de proyecto inmobiliario.
**Solución**: nueva tabla `M_Edificios` (nombre_proyecto, inmobiliaria, direccion_matriz) + link desde `TX_Solicitudes` y `TX_Comparables`.

### 3. "¿Es propiedad nueva o usada? ¿De qué inmobiliaria?"
Detección clave para el flujo. Hoy `TX_Solicitudes` no tiene `es_nueva`, `nombre_proyecto` ni `inmobiliaria`. Se pierde el heurístico del arroba corporativo (@cagua vs @gmail).
**Solución**: agregar en `TX_Solicitudes` los campos `es_nueva` (checkbox), `nombre_proyecto`, `inmobiliaria`, `email_dominio_origen`.

### 4. TBD-08 sin cerrar: prompt versionado de Claude API
Sin esto, la lectura automática de documentos (SC07 / RF-09) no se puede construir con contrato estable. Fecha límite 31-jul-2026.
**Solución**: definir y guardar el prompt + schema JSON en `C_VariablesCliente` o en una nueva tabla `C_PromptsClaude` con `version`, `vigente_desde/hasta`, `contenido`.

---

## 🟡 MEDIA — mejoran calidad y control

### 5. "¿Cuál es el reproceso más común por cliente?"
Héctor tipifica los reprocesos (falta permiso edificación, falta recepción final, falta nombres, expropiación). Hoy no hay catálogo ni registro de reprocesos.
**Solución**: nueva tabla `C_MotivosReproceso` + tabla `TX_Reprocesos` (fecha, motivo, solicitud, resuelto_en).

### 6. "¿Este valor está dentro del rango razonable para este tramo?"
Héctor tiene manual: si la casa vale 1.000 UF, la construcción no puede valer entre X y Y. Esa matriz no vive en la base.
**Solución**: nueva tabla `C_MatricesValidacion` (tipo_propiedad, comuna_grupo, tramo_uf_min, tramo_uf_max, uf_m2_construccion_min, uf_m2_construccion_max).

### 7. "Muéstrame el promedio UF/m² últimos 6 meses en la comuna X, tamaño 30–40 m²"
Estudio histórico interno. `H_Solicitudes_Cerradas` no tiene `sup_construccion_m2`, `tipo_propiedad_id` ni vista de agregación.
**Solución**: completar `H_Solicitudes_Cerradas` con `sup_construccion_m2`, `uf_m2_calculado`, y crear vista/rollup por comuna+rango.

### 8. Canal WhatsApp para tasadores "remolones"
Héctor lo hace manual hoy. `C_NotificacionesConfig.canal` es un singleSelect pero no está declarado el flujo WhatsApp, y `M_Tasadores` no tiene `prefiere_whatsapp`.
**Solución**: agregar opción `whatsapp` a `canal`, campo `prefiere_whatsapp` en `M_Tasadores`, y plantilla WhatsApp en `C_NotificacionesConfig` (cuadradito "nueva solicitud, código, nombre, contacto").

### 9. Tabla de tramos de honorarios vacía
`C_TramosHonorarios` existe con estructura pero sin datos reales. Héctor: "esa tengo que cargarla, no sé cuál es".
**Solución**: pedir a Héctor la matriz Excel actual y poblarla (pendiente input de él).

---

## 🟢 BAJA — completar cobertura

### 10. Sello verde SEC
Mencionado por Héctor como dato del informe. No existe campo en `TX_DatosTasacion`.
**Solución**: agregar `tiene_sello_verde` y `fuente_sello_verde` (SEC / foto tasador / no aplica) en `TX_DatosTasacion`.

### 11. Cobranza de comisión al cliente
Héctor marca manual "OK comisión cobrada" cada mes 5. La base tiene `comision_ov` pero no marca de cobrada ni mes.
**Solución**: agregar en `TX_Solicitudes` los campos `comision_cobrada` (checkbox), `fecha_cobro_comision`, `mes_cobro_comision`.

### 12. Reglas RN-31 a RN-36 sin redactar formalmente
El diagnóstico las marca como vacío de trazabilidad en `VProperty_Especificacion_Proyecto_v1_5.md` §13.
**Solución**: redactar las 6 reglas (precondición/acción/postcondición) en el mismo documento → nueva versión v1.6 del `.md`.

---

## Resumen ejecutivo

| Prioridad | Hallazgos | Acción principal |
|-----------|-----------|------------------|
| 🔴 Alta | 1, 2, 3, 4 | Cambios estructurales en Airtable + cierre TBD-08 |
| 🟡 Media | 5, 6, 7, 8, 9 | Nuevas tablas de catálogo + poblamiento |
| 🟢 Baja | 10, 11, 12 | Campos complementarios + redacción de reglas |

**Próximo paso recomendado**: cerrar TBD-08 (prompt Claude API) antes del 31-jul-2026 para desbloquear la lectura automática de documentos; en paralelo abordar los hallazgos 1-3 que Héctor mencionó explícitamente como necesidades operativas.

---

*Diagnóstico generado el 16-jul-2026 por IA Solution.*
