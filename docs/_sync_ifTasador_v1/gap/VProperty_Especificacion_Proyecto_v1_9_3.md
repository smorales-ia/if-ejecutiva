# Ficha de brecha — `VProperty_Especificacion_Proyecto_v1_9_3.md`

- **Familia** — A · Especificación de proyecto
- **Ruta** — `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md`
- **Última modificación** — untracked (nunca commiteado) · 4977 líneas
- **Versión declarada** — v1.9.3 · §2 fechada 25-jul-2026
- **Decisión** — **ACTUALIZAR → produce `v1_9_4.md`** (ver C-3 en `00b_correcciones_al_prompt.md`)
- **Prioridad** — **P0** · es la fuente única; ningún otro doc puede sincronizarse contra un original que se contradice

---

## Referencias al vocabulario obsoleto

| Término | Hits | Clasificación |
|---|---|---|
| `capturada` | **1** (línea 2974) | ❌ **violación real** — §6.2 tabla AT01–AT10 |
| `devuelta` | 4 (1582, 1794, 1806, 1872) | ✅ correcto — todas enuncian la deprecación |
| `WhatsApp` | 13 | ✅ falso positivo (canal de origen) + fuera-de-alcance correctamente declarado |
| `franja roja` | 3 (1582, 1794, 1908) | ✅ correcto — enuncian su eliminación |
| `AlertDialog dual` | 1 (1714) | ✅ correcto — enuncia que no existe |
| `3 intentos` / `tres intentos` | 3 (1582, 1895, 1911, 1914) | ✅ correcto — enuncian su eliminación |
| `RN-16bis` | 1 (1911) | ✅ correcto — ordena eliminarlo |
| `IA extrayendo` | 1 (1698) | ✅ correcto — es la prohibición |
| `Enviar visita` | 0 | ✅ limpio |
| `Iniciar captura` | 1 (1664) | ✅ **legítimo** — botón de navegación §2.4→§2.6, no dispara transición (ver C-7) |

**Resultado:** una sola violación real de vocabulario, en la línea 2974.

## Referencias al spec v1.9.3 § afectada

§1.3.2 · §1.3.3 · §1.4 · §1.9.1 · §4.2.1 · §6.2 · §13 (índice RN)

## Estado de la tabla §2.14 · once filas

| Fila §2.14 | Objetivo | Estado |
|---|---|---|
| §2 encabezado — retirar frase de fuera de alcance | §2 de este archivo | ✅ **aplicada** (línea 1589 declara que coordinación *entra* en alcance) |
| §2.1 — filtros, chips, franja roja, SLA con horas | §2 | ✅ aplicada (1597–1606, RF-TAS-01/02) |
| §2.3 — nueva pantalla coordinación | §2 | ✅ aplicada (1632–1658) |
| §2.5.3 — máquina de estados oficial | §2 | ✅ aplicada (§2.11, 1798–1842) |
| §2.5.4 — Rechazar sin RN-16bis ni 3 intentos | §2 | ✅ aplicada (1779, RF-TAS-09) |
| §2.5.2 — organizador sin "Documentos" | §2 | ✅ aplicada (1682–1683, RF-TAS-06) |
| §2.6 tabla automatizaciones — AT03 `visitada`, SC08/SC09 | §2 **y §6.2** | ⚠ **parcial** — §2.11 correcta; **§6.2 línea 2974 sigue con `estado=capturada`** |
| §2.7 — ruta coordinar, hook sin 3 intentos, Next.js P-3 | §2 | ✅ aplicada (§2.13, 1885/1895/1897) |
| **§1.3.2 / §1.3.3 IF-02 — lectura `TX_CoordinacionVisita`** | §1 | ❌ **NO aplicada** |
| **§1.9.1 / §1.4 / RN-59 — excepción acotada** | §1, §13 | ❌ **NO aplicada** |
| **§4.2.1 — campo `tipo_propiedad` en `D_TipoDocumento`** | §4 | ❌ **NO aplicada** |

Evidencia de las tres no aplicadas:

- `TX_CoordinacionVisita` aparece **25 veces, todas entre las líneas 1564 y 1953**. Cero fuera de §2.
- `tipo_propiedad` aparece sólo en 1683, 1874, 1917 — todas dentro de §2. §4.2.1 (2319–2419) no lo menciona.
- La ficha RN-59 (línea 635) enuncia precondición/acción/postcondición **sin** excepción alguna.

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| §1.3.2 · Pestaña Datos (489–570) | Agregar fila al cuadro de bloques: **Coordinación** — resultado del último intento (`estado_coordinacion`, `fecha_visita_propuesta`, `motivo`, `intento_numero`), se llena desde *IF-03 · lectura de `TX_CoordinacionVisita`*, **sólo lectura**. Puede alojarse dentro del bloque *Contactos de visita* o como sub-bloque propio | §2.3 (1643) · RF-TAS-05 (1655–1658) · §2.14 fila 9 | UX + FE + PM |
| §1.3.3 · Pestaña Historial (570–579) | Incorporar al timeline los eventos de coordinación (confirmada / rechazada, con autor y timestamp), junto a los ya listados de `A_Eventos` y `A_Cambios` | §2.3 (1643) · RF-TAS-05 | UX + DE |
| §1.4 · Modificación de detalles (601–632) | Insertar la **excepción acotada a RN-59**: en estado `asignada` y sólo cuando `coordinacion_vigente = rechazada`, `TX_ContactosVisita` es editable. Cubre **exclusivamente** contactos de visita; cliente, propiedad, RUT y datos financieros siguen bloqueados. Auditada en `A_Cambios`; habilita la reapertura de RF-TAS-04. El texto actual afirma sin matiz *"todos los datos quedan en modo consulta (RN-59) — no existe ningún flujo de reasignación ni edición posterior"* | §2.5 (1672) · §2.3 (1641) · RF-TAS-04 · §2.14 fila 10 | EA + PM + DE |
| Ficha **RN-59** (635–660) | Agregar la excepción a la **Acción** y a la **Postcondición**. Sin renumerar RN-59 ni crear RN nueva | §2 (1585) · §2.14 fila 10 | PM + EA |
| §1.9.1 · Procesos documentados no implementados (1463–1563) | Revisar si la coordinación de visita figuraba aquí como no implementada; si es así, moverla a alcance con puntero a §2.3 | §2 (1589) · §2.14 fila 10 | PM |
| §4.2.1 · Catálogo operativo de tipos de documento (2319–2419) | (a) Agregar el campo **`tipo_propiedad` singleSelect `{nuevo, usado, ambos}`**; (b) **corregir** la afirmación de la línea 2322 *"El dato de negocio más relevante de esta tabla no es la lista en sí, sino la columna cuándo"* — `cuándo` **no** es proxy de tipo de propiedad: mezcla fase (`Reproceso`), segmento (`Cliente tipo 2`) y condición (`Depto con gas`) con tipo (`Nuevo`/`Usado`/`Ambos`); (c) registrar el poblado inicial como **asunción P-4**, no como decisión | §2.6 (1683) · §2.12 (1874) · RF-TAS-06 · §2.14 fila 11 | DE + PM |
| §6.2 · Automations AT01–AT10 (2962–2993) | **`AT03_ejecutar_dag_formulas`: trigger `estado=capturada` → `estado=visitada`** (línea 2974). Única violación literal de vocabulario del archivo | §2.11 (1826) · §2.14 fila 7 | EA + DE |
| §13 · Índice de Reglas de Negocio (4409, 4511) | Reflejar la excepción en la entrada de índice de RN-59 (4409) y en la nota de enunciado (4511). Sin renumerar | §2.14 fila 10 | PM |

## Notas de ejecución

1. **Precisión de numeración.** La fila §2.14 dice *"§2.6 tabla automatizaciones"*, numeración del §2 **anterior**. En v1.9.3 la tabla con el trigger obsoleto vive en **§6.2**, no en §2.6. Se corrige donde realmente está.
2. **§2 no se toca.** Las ocho filas ya aplicadas están correctas. La Fase 3 sobre este archivo se limita a §1, §4, §6.2 y §13.
3. **Formato heterogéneo.** §2 es markdown nativo; el resto es pandoc-desde-docx con tablas de guiones y `**negrita**` como encabezado. **Cada edición debe respetar el formato de su sección** — no convertir tablas pandoc a markdown ni al revés.
4. **Salida.** `VProperty_Especificacion_Proyecto_v1_9_4.md` + bloque `[SUPERSEDED]` en la cabecera de v1.9.3.
