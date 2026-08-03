# Tanda 1.5 — Contraste `D_TipoDocumento` vs Especificación §4.2.1

> **Fecha**: 02-ago-2026
> **Fuentes**: `D_TipoDocumento` (`tblkPhBnpdDmUWOl3`, 20 filas activas, leídas vía MCP)
> vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` §4.2.1 (15 documentos).
> **Alcance**: sólo reporte. No se creó, modificó ni eliminó ningún registro en Airtable.

## Resumen numérico

| Métrica | Valor |
|---|---|
| Filas activas en el catálogo | 20 |
| Documentos listados en §4.2.1 | 15 |
| **Filas del catálogo que NO aparecen en §4.2.1** | **7** |
| **Documentos de §4.2.1 que NO están en el catálogo** | **2** (ambos correctos: marcados `---` = no se piden) |
| **Coincidencias con divergencia** | **2** (ambas en `tipo_propiedad`) |
| Coincidencias limpias | 11 |

---

## 1. Filas del catálogo que NO aparecen en §4.2.1 (7)

| `codigo` | `entidad_emisora` | `tipo_propiedad` | Origen |
|---|---|---|---|
| `certificado_dominio_vigente` | CBR | ambas | **Creado 02-ago-2026** (Tanda previa) |
| `certificado_hipotecas_gravamenes` | CBR | ambas | **Creado 02-ago-2026** |
| `certificado_deuda_gastos_comunes` | Administración | usada | **Creado 02-ago-2026** |
| `certificado_informaciones_previas` | DOM | ambas | **Creado 02-ago-2026** |
| `consulta_antecedentes_bien_raiz` | SII | ambas | Preexistente (30-jun-2026) |
| `informe_no_expropiacion_serviu` | SERVIU | ambas | Preexistente (30-jun-2026) |
| `foto_ofertas_comparables` | Corredoras / Portales / CBR | ambas | Preexistente (23-jul-2026) |

### ⚠ Hallazgo H-1 — Los 4 creados hoy vienen de la lista que §4.2.1 declara superada

§4.2.1, párrafo de apertura:

> *"`D_TipoDocumento` se puebla con el catálogo real levantado con el cliente, **que sustituye a la lista `TIPOS_DOCUMENTO` usada hasta v1.8.2** en el checklist de creación."*

Los 4 registros creados el 02-ago-2026 salieron exactamente de esa lista `TIPOS_DOCUMENTO`
(el mock de `lib/console-data.ts`), bajo la hipótesis de que su ausencia en Airtable era un
vacío de datos. **La Especificación dice lo contrario**: la ausencia era deliberada — el
catálogo real se levantó con el cliente y no los incluye.

No los borro, porque la instrucción de crearlos fue explícita y borrar datos de producción
excede este reporte. Queda como decisión de Sergio:

- **Opción A** — desactivar los 4 (`activo = FALSE`, soft-delete de la Capa de Datos v2.6.5).
  Deja de ofrecerlos sin perder trazabilidad. Devuelve el catálogo a 16 activos.
- **Opción B** — mantenerlos y registrar la divergencia como decisión de negocio
  (el cliente los pide aunque §4.2.1 no los liste), actualizando §4.2.1 en la próxima
  revisión de la Espec.

Los 3 preexistentes (`consulta_antecedentes_bien_raiz`, `informe_no_expropiacion_serviu`,
`foto_ofertas_comparables`) son anteriores a esta sesión y su divergencia ya existía; se
reportan aquí por completitud, no como consecuencia de Tanda 1.

### ⚠ Hallazgo H-2 — `inscripcion_dominio_cbr` se reactivó contra lo que dice §4.2.1

Esa fila era la **única** de las 16 con `activo` sin marcar, y se reactivó el 02-ago-2026
por instrucción explícita (Tarea B). §4.2.1, consecuencia de diseño nº 2:

> *"La inscripción de dominio CBR es de **baja prioridad: no se adjunta ni se revisa**."*

Y en la tabla de §4.2.1 aparece con **Cuándo = `---`** y **Extracción automática = `---`**,
los dos marcadores de "no se pide".

Es decir: el `activo = FALSE` no era un olvido, era el soft-delete correcto según la
Especificación. Recomiendo revertirlo a `FALSE`. No lo hago aquí por la misma razón que
H-1 — este documento no escribe en Airtable.

---

## 2. Documentos de §4.2.1 que NO están en el catálogo (2)

| Documento §4.2.1 | Cuándo | Extracción | ¿Correcto que falte? |
|---|---|---|---|
| Plano de tasación | `---` | No | ✅ Sí — *"lo hace el tasador en el 99% de los casos"* |
| Informe de inspección | `---` | `---` | ✅ Sí — *"Fuera de alcance: no se pide"* |

**Ninguna acción requerida.** Ambos están marcados con `---` en la columna *Cuándo*, que
§4.2.1 define como el marcador de los documentos que no se piden. Su ausencia del catálogo
es coherente.

---

## 3. Coincidencias con divergencia (2)

Ambas en `tipo_propiedad`. No se detectó ninguna divergencia en `entidad_emisora`
(las 11 coincidencias usan siglas consistentes con el emisor descrito) ni en
`vigencia_dias` (§4.2.1 no documenta vigencias, así que no hay contra qué contrastar).

| `codigo` | Catálogo | §4.2.1 *Cuándo* | Esperado | Divergencia |
|---|---|---|---|---|
| `plano_cuadro_superficies` | `ambas` | **Nuevo** | `nueva` | Mapeo directo Nuevo→nueva no aplicado |
| `certificado_numero` | `usada` | **Reproceso** | `ambas` | Regla P-4 asigna `ambas` a las dimensiones que no son condición de propiedad |

Criterio de contraste — §4.2.1, *Poblado inicial · asunción P-4*:

> *"El mapeo desde la columna `cuándo` es directo para los tres valores que sí expresan
> condición de la propiedad: Nuevo→nueva, Usado→usada, Ambos→ambas. Para los valores que
> expresan otra dimensión —Reproceso, Cliente tipo 2, Depto con gas y el marcador `---`—
> se asigna `ambas` de forma provisoria."*

Bajo esa regla, las 9 coincidencias restantes están correctas, incluidas
`sello_verde_sec` (Depto con gas → `ambas`), `solicitud_tasacion` (Cliente tipo 2 →
`ambas`) e `inscripcion_dominio_cbr` (`---` → `ambas`).

---

## 4. Coincidencias limpias (11)

| `codigo` | §4.2.1 | *Cuándo* → `tipo_propiedad` |
|---|---|---|
| `ficha_inmobiliaria_nueva` | Carta oferta / ficha de la inmobiliaria | Nuevo → `nueva` ✓ |
| `permiso_edificacion` | Certificado de permiso de edificación | Ambos → `ambas` ✓ |
| `certificado_recepcion_final` | Certificado de recepción final | Ambos → `ambas` ✓ |
| `escritura_compraventa` | Escritura de compraventa original | Usado → `usada` ✓ |
| `certificado_municipal` | Certificado municipal (vivienda social, número) | Usado → `usada` ✓ |
| `certificado_avaluo_fiscal` | Certificado de avalúo fiscal | Ambos → `ambas` ✓ |
| `foto_fuente_sii` | Captura de la base interna SII | Usado → `usada` ✓ |
| `certificado_deuda_tgr` | Certificado de deuda de Tesorería | Usado → `usada` ✓ |
| `sello_verde_sec` | Sello verde | Depto con gas → `ambas` (P-4) ✓ |
| `solicitud_tasacion` | Solicitud de tasación del cliente | Cliente tipo 2 → `ambas` (P-4) ✓ |
| `inscripcion_dominio_cbr` | Inscripción de dominio CBR | `---` → `ambas` (P-4) ✓ |

---

## 5. Punto abierto que afecta a tandas futuras

**P-5 · divergencia de dominio (ya registrada en §2.15 de la Espec, se repite aquí porque
bloquea cualquier filtrado por condición de propiedad):**

- `D_TipoDocumento.tipo_propiedad` (`fldIfdcjsr8KeNRCx`) → **femenino**: `nueva · usada · ambas`
- `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`) → **masculino**: `nuevo · usado`

§4.2.1 lo dice sin rodeos:

> *"**Tal como está hoy, la comparación literal de RF-TAS-06 no encuentra coincidencias y
> el sheet documental saldría vacío.**"*

Consecuencia para IF-02: **hoy el checklist muestra los 20 tipos sin filtrar por condición
de propiedad**, y eso es lo correcto mientras P-5 siga abierto. Si en una tanda futura se
quisiera filtrar (mostrar sólo los aplicables a la propiedad en curso), habría que alinear
primero los dominios en Airtable — trabajo fuera del repositorio, y una decisión de
vocabulario de negocio que no está tomada.

---

## 6. Conclusión

El catálogo **no está alineado** con §4.2.1: 7 filas de más (4 introducidas hoy), 2
divergencias de `tipo_propiedad` y 1 reactivación que contradice una consecuencia de
diseño explícita. Las 2 ausencias respecto de §4.2.1 sí son correctas.

Acciones sugeridas, todas en Airtable y todas de Sergio:

1. Decidir H-1 (Opción A o B) sobre los 4 tipos creados hoy.
2. Revertir `inscripcion_dominio_cbr` a `activo = FALSE` (H-2).
3. Corregir `plano_cuadro_superficies.tipo_propiedad` → `nueva`.
4. Corregir `certificado_numero.tipo_propiedad` → `ambas`.
5. Dejar P-5 como está hasta que exista decisión de vocabulario.

Ninguna de las cinco bloquea el funcionamiento de Tanda 2: el checklist lee lo que haya
activo en la tabla, sea cual sea la decisión.
