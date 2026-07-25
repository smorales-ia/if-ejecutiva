# Ficha de brecha — `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md`

- **Familia** — D · Capa de Datos
- **Ruta** — `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md`
- **Última modificación** — 2026-07-23 · `03e8053` · 8508 líneas
- **Versión declarada** — v2.6.4 *(el prompt asumía v2.6.3 — ver C-2)*
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P0** · es el único destino posible del delta de schema §2.12

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas |
|---|---|---|
| `devuelta` / `devueltas` | 7 | 938, 2018, 5473, 5608, 5782, 5893 |
| `SC15` | 8 | 3490, 5982, 6022, 6048, 6235, 6964, 7240, 7340 |
| `SC04` | 4 | 1998, 5707, 5944, 7006 |
| `SC02` | 2 | 3619, 4820 |
| `SC05` | 2 | 5043, 6243 |
| `WhatsApp` / `whatsapp` | 6 | 1599, 3189, 4754, 4762, 4770, 4847 |
| `3 intentos` | 1 | 6122 |
| `TX_ContactosVisita` | 2 | 52, 8490 |
| `TX_CoordinacionVisita` | **0** | — |

**Falsos positivos a preservar:** `whatsapp` como valor del enum `canal` (1599, 3189) y como
canal de origen de solicitud (4754, 4762, 4770); `3 intentos` en 6122 es backoff de Make.
**A revisar caso a caso:** 4847 (*"el tasador recibe el link por email/WhatsApp al ser asignado"*)
— contradice el canal único de §2; candidato a corrección.

## Referencias al spec v1.9.3 § afectada

§2.11 (automatizaciones) · §2.12 (delta de schema completo) · §2.3 · RN-59 · RF-TAS-02/03/04/06/09

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| §19 · Tablas nuevas (8482–8508) | **Alta de `TX_CoordinacionVisita`** como §19.x nuevo, con los **11 campos** de §2.12: `id`, `solicitud_id`, `estado_coordinacion`, `motivo`, `fecha_visita_propuesta`, `fecha_respuesta`, `autor_clerk_id`, `email_thread_id` (lookup), `email_enviado_at`, `email_enviado_status`, `intento_numero`. Ancla natural: junto a §19.3 `TX_ContactosVisita` y §19.4 `TX_Vendedor`, que ya siguen este patrón de "tabla nueva" | §2.12 (1848–1864) | DE + EA |
| §19 · idem | Documentar la **constraint blanda de unicidad** `(solicitud_id, fecha_respuesta_truncada_al_minuto)` como mitigación **R-2** (doble tap). Anotar que Airtable no la ofrece como primitiva — ver A-09 | §2.12 (1864) · §2.11 (1829) | DE |
| §19.1 · `TX_Solicitudes` campos nuevos (8482–8484) | **Alta de 3 campos**: `coordinacion_vigente` (formula, `LAST(...)` o null), `observacion_rechazo_tasador` (texto largo, nullable), `horas_restantes` (formula, `(sla_aplicable*24) - horas_desde_solicitud` redondeado) | §2.12 (1866–1870) · RF-TAS-02/09 | DE |
| §19.1 · idem | Agregar nota de desambiguación de **A-05**: tres campos llamados `tipo_propiedad` en dos tablas. El aviso de colisión ya existe en 8484; ampliarlo para incluir el de `D_TipoDocumento` | §2.12 (1874) | DE + EA |
| Ficha `D_TipoDocumento` | **Alta de `tipo_propiedad`** singleSelect `{nuevo, usado, ambos}`. Poblado inicial `Nuevo→nuevo`, `Usado→usado`, `Ambos→ambos`; los valores de fase (`Reproceso`, `Cliente tipo 2`, `Depto con gas`, `---`) → `ambos` **como asunción P-4, no decisión** | §2.12 (1874) · §2.6 (1683) · RF-TAS-06 | DE + PM |
| `TX_Solicitudes.estado` · enum (2018) | Marcar `devuelta` **DEPRECATED** sin borrarla del enum, con la nota canónica: *"El visador ahora devuelve desde IF-04 con transición backend `pdf_listo → asignada`. Se conserva en el enum para solicitudes históricas y no admite nuevas transiciones. Ver §2.11 y §2.12 del spec v1.9.3."* Registrar el script one-off de migración (mitigación R-3) | §2.11 (1806) · §2.12 (1872) | DE + EA + PM |
| §12.2 · Estructura de `C_Plantillas` (6303–6360) | **Registrar dos plantillas nuevas**: `email_coordinacion_confirmada` y `email_coordinacion_rechazada`. Ambas se disparan desde **SC13** dentro del hilo `email_thread_id` (RN-52) | §2.3 (1639) · §2.11 (1830–1831) · §2.12 (1876) | INT + DE |
| §10.4 · Diagrama de estados de `TX_Solicitudes` (5871–5900) | Alinear el diagrama con la máquina oficial. `devuelta` (5893) pasa a rama histórica marcada DEPRECATED; el flujo vivo es `pdf_listo → asignada` | §2.11 (1800–1806) | EA + DE |
| Escenarios Make · SC02 (3619, 4820) | Marcar **retirado — fusionado en SC01 (entrada única)**, sin borrar | §2.11 (1835) | INT |
| Escenarios Make · SC04 (1998, 5707, 5944, 7006) | Marcar **retirado — en v1.9 la asignación de tasador es manual (§1.5.5)**. Especial atención a 1998, que declara el campo `tasador` como *"Asignado automáticamente por SC04"* — afirmación de schema, no sólo de proceso | §2.11 (1836) | INT + DE |
| Escenarios Make · SC05 (5043, 6243) | **Renombrar a SC08** con nota histórica *(ex-SC05)*. Ver lote C-5 | §2.11 (1837) | INT |
| Escenarios Make · SC15 (3490, 5982, 6022, 6048, 6235, 6964, 7240, 7340) | Marcar **retirado — su función (Mindicador → valor UF) se resuelve como automatización Airtable AT08 o similar**. Ojo: 6964 y 7340 usan SC15 para *backups nocturnos*, función distinta del cruce UF; verificar si son dos usos homónimos antes de marcar | §2.11 (1838) | INT + EA |
| Tabla de automatizaciones | Agregar **SC08** (motor de cálculo · trigger `estado = visitada`) y **SC09** (generación PDF Carbone · trigger `estado = calculada`) con sus triggers y efectos | §2.11 (1825, 1828) | INT + DE |
| 4847 | Revisar *"el tasador recibe el link por email/WhatsApp al ser asignado"* — §2 fija canal único correo | §2 (1589) · §1 (1284) | INT + UX |

## Riesgos de esta intervención

1. **Volumen.** 8508 líneas y 29 hits. Es el documento de mayor superficie; conviene sub-lotes: (a) altas de schema §2.12, (b) enum `devuelta`, (c) escenarios Make, (d) `C_Plantillas`.
2. **SC15 homónimo.** Aparece con dos funciones distintas (UF y backups). §2.11 sólo retira la del UF. **No marcar en bloque.**
3. **Formato pandoc.** Tablas con `+---+` y `| |`. Las altas de campo deben respetar el ancho de columna del bloque donde se insertan.
