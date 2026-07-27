# Auditoría RF-04 · Creación de solicitud incompleta

> **Fecha**: 27-jul-2026 · **Alcance**: cadena completa UI → Route Handler → Make SC01 → `TX_Solicitudes`
> **Modo**: sólo diagnóstico. No se modificó código, ni schema, ni Airtable, ni Make.
> **Panel**: Enterprise Architect · Next.js Engineer · Integrations Engineer · Data Designer · QA Lead

**Fuentes leídas**
1. `docs/diseno.md` §3bis (wizard v1.9), §11 (contrato `POST /api/webhooks/crear-solicitud`). *Nota: `diseno.md` no usa la numeración §1.5.x; el contrato funcional §1.5.1 se leyó de `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` líneas 800-975.*
2. `docs/schema-airtable.md` · `TX_Solicitudes`.
3. Repo: `components/console/new-request-sheet.tsx` (2.000+ líneas), `lib/validators/nueva-solicitud-interna.ts`, `app/api/webhooks/crear-solicitud/route.ts`.
4. Schema real: leído vía **meta API REST** (`GET /v0/meta/bases/{baseId}/tables`, sólo lectura, token de `.env.local`) en vez de `get_table_schema` del MCP, porque ese tool exige conocer los `fieldIds` de antemano. **134 campos** en `TX_Solicitudes`, con IDs reales.
5. Blueprint SC01: **existen dos copias** — `docs/_artefactos/make/SC01 - Crear solicitud.blueprint.json` (27-jul 09:13) y `docs/make/SC01_-_Crear_solicitud_blueprint.json` (27-jul 00:04). Se diffearon: **el mapping del módulo 7 es idéntico en ambas** (46 campos, sólo cambia el orden de las claves), así que la ambigüedad no afecta este diagnóstico. No se pudo verificar cuál está realmente desplegada en Make.

---

## 1. Resumen ejecutivo

**El cuello de botella no está en el mapping: está en el primer eslabón.** `onSubmit` del formulario de creación (`new-request-sheet.tsx:943-974`) es un **mock**: un `setTimeout(800)` que muestra el toast verde "Solicitud interna creada" y cierra el sheet, sin ningún `fetch`. `POST /api/webhooks/crear-solicitud` tiene **cero consumidores** en todo el repo — ninguna solicitud creada desde IF-02 llega jamás a Airtable. Es el mismo defecto de [[E-078]] repetido en la pantalla de creación.

Por debajo hay un **segundo corte independiente**: el mapper del módulo 7 de SC01 espera claves `snake_case` (`1.nombre`, `1.estado_conservacion`, `1.financiero_valor_total_uf`) mientras el payload del Route Handler emite el `camelCase` del schema zod (`compradorNombre`, `estadoConservacion`, `valorTotalUf`). Conectar el submit **no** arreglaría el bug: llegarían ~15 campos de ~47.

Conteo (estado *condicional a que el submit se conecte*, ver nota metodológica): **15 ✅ · 2 ⚠️ · 30 ❌ · 6 🔵**, más el bloque **Unidades completo perdido** (16 subcampos, ningún módulo Make lo escribe) y 2 subcampos rotos en Contactos de visita.

> **Nota metodológica.** Si se puntuara la cadena tal como está hoy, las 47 filas serían ❌ sin excepción y la tabla no diría nada útil. Por eso la columna Estado evalúa el tramo **payload → Make → Airtable**, asumiendo el submit ya conectado. El corte de la UI se trata aparte, como Hipótesis 1.

---

## 2. Tabla comparativa

Leyenda: ✅ OK · ⚠️ PARCIAL · ❌ PERDIDO · 🔵 NO CAPTURADO

### Sección A · Origen

| Campo UI (etiqueta · zod) | Payload API Route | Mapping Make SC01 (módulo 7) | Campo Airtable (`fld…`) | Estado |
|---|---|---|---|---|
| Canal de origen · `canal` | `canal` | `{{1.canal}}` | `canal_contacto_original` `fldca1Uza4eicBXL4` | ✅ |
| Cliente · `cliente` | `cliente` | Search id=2 `UPPER({nombre})={{1.cliente}}` → `{{2.id}}` | `cliente` `fldttL5myzLohDwHv` (link) | ✅ |
| Tipo de cliente de origen · `tipoClienteOrigen` | `tipoClienteOrigen` | `{{1.tipo_cliente_origen}}` | `tipo_cliente_origen` `fldbxZh45lFTB7yVJ` | ❌ nombre |
| Tipo de informe · `tipoInforme` | `tipoInforme` | Search id=3 → `{{3.id}}` | `tipo_informe` `fldJO4JtsDEeMmjdi` (link) | ✅ |
| Banco (originador) · `banco_id` | **`bancoOriginador`** (renombrado en el route) | `{{1.banco_id}}` | `banco` `fldAgTlFXeXWfGTdI` (text) | ❌ renombre |
| N° de operación cliente · `n_operacion_cliente` | `n_operacion_cliente` | `{{if(1.n_operacion_cliente; parseNumber(…); emptystring)}}` | `n_operacion_cliente` `fldb1vmKk7y3hi4uY` (number) | ⚠️ `emptystring` a campo number |
| Ejec. Comercializador · `ejec_comercializador` | `ejec_comercializador` | *(sin mapping)* | *(no existe el campo)* | ❌ + deuda schema |
| Ejec. Formalizador · `ejec_formalizador` | `ejec_formalizador` | `{{1.ejecutivo_formalizador}}` | `ejecutivo_formalizador` `fldM9ELuMvgRwbmUn` | ❌ nombre |
| Sucursal originadora · `sucursal_originadora` | `sucursal_originadora` | `{{1.sucursal_originadora}}` | `sucursal_originadora ` `fldd56pLZyKYoi2Vi` ⚠ espacio final (D-08) | ✅ |
| Ejecutivo solicitante · `ejecutivo_solicitante` | `ejecutivo_solicitante` | `{{1.ejecutivo_solicitante}}` | `ejecutivo_solicitante` `fldRweQyq3tTQGmPR` | ✅ |
| **Contactos de visita** (repetible) · `contactosVisita[]` | `contactosVisita` | Iterator id=17 `{{1.contactosVisita}}` → Create id=18 → `TX_ContactosVisita` `tblW3SSbKo6vRjwBJ` | tabla aparte, link `fldSQAKu5ooRgF5uw` ← `{{7.id}}` | ⚠️ 2 de 6 rotos |
| ├ Rol · `rol` | `rol` | `{{17.rol}}` | `fldeTuIlU6uxDYwHY` | ✅ |
| ├ Nombre · `nombre` | `nombre` | `{{17.nombre}}` | `fldOTpkaWOkkxzJoc` | ✅ |
| ├ Teléfono · `telefono` | `telefono` | `{{17.telefono}}` | `fld8Rai7BCgfKS8F8` | ✅ |
| ├ Email · `email` | `email` | `{{17.email}}` | `fldHTPcQgIvAP6QlP` | ✅ |
| ├ Estado del contacto · `estado` | `estado` | `{{17.estado_contacto}}` | `fldMerAz4OCNhwn4X` | ❌ nombre |
| └ *(orden de la lista)* | *(no se emite)* | `{{17.orden_prioridad}}` | `fldL93B1kOZZ1pNFs` | ❌ el ítem no trae esa clave |

### Sección B · Propiedad

| Campo UI (etiqueta · zod) | Payload API Route | Mapping Make SC01 | Campo Airtable | Estado |
|---|---|---|---|---|
| *(wizard Fase 2)* Nuevo/Usado · `tipoPropiedadNuevoUsado` | `tipoPropiedadNuevoUsado` | `{{1.tipo_propiedad_nuevo_usado}}` | `tipo_propiedad_nuevo_usado` `fldHxx1P1ao33PWrl` | ❌ nombre |
| Proyecto o condominio · `proyecto` | `proyecto` | *(sin mapping)* | `proyecto_condominio` `fldbmGmyMHOtfX2Az` **existe y no se usa** | ❌ |
| Dirección · `direccion` | `direccion` | `{{1.direccion}}` | `direccion` `fldKP0yxwQkSdrFuZ` | ✅ |
| Origen dirección · `origenDireccion` | `origenDireccion` | `{{1.origen_direccion}}` | `origen_direccion` `fldiwBMHujptXHr2D` | ❌ nombre |
| Región · `region` | `region` | `{{1.region}}` | `region` `fldy8081DUFzVXe01` | ✅ |
| Comuna · `comuna` | `comuna` | Search id=6 → `{{6.id}}` | `comuna` `fldJTjjzCPBHMOWZv` (link) | ✅ |
| Tipo de propiedad · `tipoPropiedad` | `tipoPropiedad` | Search id=4 → `{{4.id}}` | `tipo_propiedad` `fld701TB0LXovvQmt` (link) | ✅ |
| Estado de conservación · `estadoConservacion` | `estadoConservacion` | `{{1.estado_conservacion}}` | `estado_conservacion` `flde0ExWfB1dhkp4t` | ❌ nombre |
| Razón social (vendedor) · `vendedorRazonSocial` | `vendedorRazonSocial` | `{{1.vendedor_razon_social_o_nombre}}` | `vendedor_razon_social_o_nombre` `fldNkFwB5p3Mljtrg` | ❌ nombre + fusión 2→1 |
| RUT inmobiliaria · `vendedorRutInmobiliaria` | `vendedorRutInmobiliaria` | `{{1.vendedor_rut}}` (compartido) | `vendedor_rut` `fldrITDFkbk95Da00` | ❌ nombre + colisión |
| Nombre completo propietario · `vendedorNombre` | `vendedorNombre` | *(sin destino propio)* | `vendedor_nombre` `fldfUXb9vzxklu8ES` **existe y no se usa** | ❌ |
| RUT propietario · `vendedorRut` | `vendedorRut` | `{{1.vendedor_rut}}` (compartido) | `vendedor_rut` `fldrITDFkbk95Da00` | ❌ nombre + colisión |
| Correo contacto · `vendedorCorreo` | `vendedorCorreo` | `{{1.vendedor_email}}` | `vendedor_email` `flduBKof3x45EpTNW` | ❌ nombre |
| Teléfono contacto · `vendedorTelefono` | `vendedorTelefono` | `{{1.vendedor_telefono}}` | `vendedor_telefono` `flduslI2FNAdcPchK` | ❌ nombre (camel vs snake) |
| Origen del dato · `vendedorOrigenDato` | `vendedorOrigenDato` | `{{1.vendedor_origen_dato}}` | `vendedor_origen_dato` `fldcjrl80Vv1WBmmY` | ❌ nombre |
| *(sin captura en UI)* | — | `{{1.vendedor_tipo_persona}}` | `vendedor_tipo_persona` `fldMRFFXv9rOVfQlf` | 🔵 |
| **Unidades** (repetible) · `unidades[]` | `unidades` | **ningún módulo lo consume** | `TX_Unidades` `fldeKGmoB97e5J3yX` (link) | ❌ **bloque entero** |
| └ 16 subcampos: `ubicacion` · `modelo` · `tipoBien` · `rolModo` · `rolSii` · `rolEnTramite` · `supConstruida` · `supTerraza` · `supTerreno` · `anioConstruccion` · `material` · `m2Ampliacion` · `regularizable` · `origenSuperficie` · `respaldo` · `detalleItem` (+ `subItems[]`) | viajan en el payload | — | — | ❌ todos |

### Sección C · Personas de la operación

| Campo UI (etiqueta · zod) | Payload API Route | Mapping Make SC01 | Campo Airtable | Estado |
|---|---|---|---|---|
| Nombre completo (comprador) · `compradorNombre` | `compradorNombre` | `{{1.nombre}}` | `cliente_final_nombre` `fld7jxcbmMYz6kmbj` | ❌ nombre |
| RUT · `compradorRut` | `compradorRut` | `{{1.rut}}` | `cliente_final_rut` `fldwNEPL8fXkWwUBd` | ❌ nombre |
| Email · `compradorEmail` | `compradorEmail` | `{{1.email}}` | `email_contacto` `fldjzUZsACA0vDlUq` | ❌ nombre |
| Teléfono · `compradorTelefono` | `compradorTelefono` | `{{1.telefono}}` | `solicitante_telefono` `fldzHrLeO3Fe0xtvn` | ❌ nombre |
| Vendedor coincide con comprador · `vendedorCoincideComprador` | `vendedorCoincideComprador` | *(sin mapping)* | *(sin campo destino)* | ❌ |

### Sección D · Producto y observaciones

| Campo UI (etiqueta · zod) | Payload API Route | Mapping Make SC01 | Campo Airtable | Estado |
|---|---|---|---|---|
| Producto · `producto` | `producto` | Search id=5 → `{{5.id}}` | `producto` `fldp64U99lsLf7HlV` (link) | ✅ |
| Banco financista · `banco` | **`bancoFinancista`** (renombrado) | Search id=9 `UPPER({nombre})={{1.banco}}` → `{{9.id}}` | `banco_financista` `fldxcfdKRctHCgwmB` (link) | ❌ renombre |
| Observaciones · `observaciones` | `observaciones` | `{{1.observaciones}}` | `observaciones_internas` `fldjmx9pLOyJKx1Mw` | ✅ |
| Valor total UF · `valorTotalUf` | `valorTotalUf` | `{{parseNumber(1.financiero_valor_total_uf)}}` | `financiero_valor_total_uf` `fldp4XCnx8jsfAzZx` | ❌ nombre |
| Subsidio habitacional · `subsidio` | `subsidio` | `{{parseNumber(1.financiero_subsidio_uf)}}` | `financiero_subsidio_uf` `fldRmC7IjhRUf1UPk` | ❌ nombre |
| Ahorro · `ahorro` | `ahorro` | `{{parseNumber(1.financiero_ahorro_uf)}}` | `financiero_ahorro_uf` `fld5WjnkIN9DYs7vX` | ❌ nombre |
| Mutuo hipotecario · `mutuo` | `mutuo` | `{{parseNumber(1.financiero_mutuo_uf)}}` | `financiero_mutuo_uf` `fldEbxQzz5g0Knupv` | ❌ nombre |
| Pago contado · `pagoContado` | `pagoContado` | `{{parseNumber(1.financiero_pago_contado_uf)}}` | `financiero_pago_contado_uf` `fldDFfws74GaHO4oV` | ❌ nombre |
| Bono captación · `bonoCaptacion` | `bonoCaptacion` | `{{parseNumber(1.financiero_bono_captacion_uf)}}` | `financiero_bono_captacion_uf` `fldAcyXYAppvBlXIt` | ❌ nombre |
| Bono integración · `bonoIntegracion` | `bonoIntegracion` | `{{parseNumber(1.financiero_bono_integracion_uf)}}` | `financiero_bono_integracion_uf` `fld9TnWG2OJFx1hiW` | ❌ nombre |
| Precio de venta · `precioVenta` | `precioVenta` | `{{parseNumber(1.financiero_precio_venta_uf)}}` | `financiero_precio_venta_uf` `fld1RBNe63iotfyqE` | ❌ nombre |

### Campos automáticos (sin captura en UI)

| Origen | Payload API Route | Mapping Make SC01 | Campo Airtable | Estado |
|---|---|---|---|---|
| Constante server-side | `origen_canal: 'ingreso_manual'` | `{{1.origen_canal}}` | `origen_canal` `fldPphw1FWfYdZI2Z` | ✅ |
| Sesión Clerk | `ejecutivaClerkId` | Search id=15 `UPPER({clerk_user_id})` → `{{15.id}}` | `ejecutiva_asignada` `fldv1XDfP7EgYC3km` | ✅ |
| Literal en el mapper | — | `"creada"` | `estado` `fld2H2r0GMeVfNO26` | ✅ |
| Literal en el mapper | — | `{{formatDate(now; "YYYY-MM-DD")}}` | `fecha_solicitud` `fldvkn9CsORy4eU0Z` (dateTime) | ✅ |
| — | — | `{{1.valorUf}}` → `parseNumber` | `monto_estimado_uf` `fldKZW799xIqMFN1I` | 🔵 nadie lo envía |
| — | — | `{{1.modo_creacion}}` | `modo_creacion` `fldBJovAv2RpsaupH` | 🔵 el wizard lo decide pero no lo emite |
| — | — | `{{1.email_thread_id}}` | `email_thread_id` `fldhy81fNSE5CF2Tc` | 🔵 |
| — | — | `{{1.correo_cliente_ref}}` | `correo_cliente_ref` `fldcKVbfRBo8J7gtg` | 🔵 |
| — | — | `{{if(1.fecha_asignacion; parseDate(…))}}` | `fecha_asignacion_ts` `fldf8BS8nv2vtOmu0` | 🔵 correcto en un alta |

---

## 3. Deuda de schema

Campos del spec §1.5.1 sin destino limpio en `TX_Solicitudes`:

1. **Ejec. Comercializador** — el spec lo pide explícitamente separado del Formalizador ("no fundido con él"). En Airtable sólo existen `ejecutivo_solicitante` y `ejecutivo_formalizador`. **Falta crear el campo.**
2. **Vendedor: dos representaciones solapadas.** Coexisten `vendedor_nombre` (`fldfUXb9vzxklu8ES`) y `vendedor_razon_social_o_nombre` (`fldNkFwB5p3Mljtrg`). SC01 sólo escribe el segundo, y la UI captura los cuatro campos por separado (razón social + RUT inmobiliaria para Nuevo; nombre + RUT para Usado). Hay que decidir cuál es canónico — hoy `vendedorNombre` y `vendedorRutInmobiliaria` no tienen a dónde ir sin pisarse.
3. **Familia financiera duplicada.** Existen **dos** juegos de 8 campos: `fin_*_uf` (`flds7QBY7a9aRF72g`, `fldReMWm5b8exMkBe`, `fldMtcBhmuimJf3rB`, `fldr5PcTPRf75kfEr`, `fldBXQzGeGs6j8aAX`, `flds7Oge6EXFErCqh`, `fldYTsFhrRcXZ5Qgc`, `fldfXAxzrtT4uMBb2`) y `financiero_*_uf`. SC01 escribe la segunda familia; la primera queda muerta. 8 campos huérfanos.
4. **`nuevo_usado` (`fld24mFTP2pmh2qDK`) vs `tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`).** El primero está deprecado según [[E-076]] pero sigue existiendo.
5. **Unidades.** `TX_Unidades` existe y `TX_Solicitudes` tiene el link `fldeKGmoB97e5J3yX`, pero **SC01 no tiene ningún módulo que cree unidades** — el escenario sólo itera `contactosVisita`. Toda la Sección B.3 del spec (16 subcampos por unidad, RN-45/RN-49/RN-50, respaldo obligatorio) no tiene camino de escritura.
6. **`vendedorCoincideComprador`** (refinanciamiento, §1.5.1 Sección C) no tiene campo destino.

## 4. Deuda de UI

Campos que Airtable/SC01 esperan y la UI no llena:

| Campo | `fld…` | Comentario |
|---|---|---|
| `monto_estimado_uf` | `fldKZW799xIqMFN1I` | El mapper lee `1.valorUf`, clave que no existe en el zod schema. Probable residuo del formulario v1.8.2. |
| `modo_creacion` | `fldBJovAv2RpsaupH` | La Fase 1 del wizard **sí** decide documentos/manual, pero el valor no entra al schema zod ni al payload. Recuperable barato. |
| `email_thread_id` | `fldhy81fNSE5CF2Tc` | Sin captura. Relevante para el tipo de cliente de origen 1 y 3. |
| `correo_cliente_ref` | `fldcKVbfRBo8J7gtg` | Sin captura. Ya identificado como hueco en la auditoría de SC-Edicion ([[E-078]]). |
| `vendedor_tipo_persona` | `fldMRFFXv9rOVfQlf` | Derivable de `tipoPropiedadNuevoUsado` (Nuevo → jurídica, Usado → natural); hoy no se deriva ni se emite. |
| `prioridad` | `fld9FKZ9siAeSsH54` | Fuera de RF-04 por diseño (RF-07/08), se anota para completitud. |
| `rol_sii` (nivel solicitud) | `fldznAL2SuCpfUUtg` | La UI captura rol SII **por unidad**; el campo de cabecera queda vacío. Decidir si se hereda de la unidad principal. |

## 5. Hipótesis de causa raíz

**H1 · El formulario nunca llama al backend (probabilidad: certeza).**
`new-request-sheet.tsx:943-974` — `onSubmit` es un `setTimeout(800)` que emite `toast.success("Solicitud interna creada")`, hace `resetAll()` y cierra el sheet. No hay `fetch`. `grep -rn "crear-solicitud" app components lib` devuelve **sólo el propio Route Handler**: cero consumidores. Consecuencia: **ninguna fila de `TX_Solicitudes` proviene de IF-02**. Las filas incompletas que se observan tienen otro origen (alta manual en Airtable, pruebas de Make disparadas a mano, o carga previa). Es el mismo patrón de [[E-078]] en la pantalla de creación, y confirma la regla [[E-082]]. Corolario para QA: el mock incluso simula la validación de duplicados contra un `Set` en memoria (`OPERACIONES_REGISTRADAS`), lo que hace que la pantalla se sienta funcional de punta a punta.

**H2 · Contrato camelCase (payload) vs snake_case (mapper módulo 7) (probabilidad: alta, verificada por lectura).**
El Route Handler emite el `...spread` literal de `parsed.data`, es decir los nombres del schema zod en camelCase. El módulo 7 de SC01 lee `1.nombre`, `1.rut`, `1.estado_conservacion`, `1.financiero_valor_total_uf`, etc. **La evidencia de que es un desfase histórico y no un diseño**: los 7 módulos `Search` (ids 2,3,4,5,6,15) **sí** usan camelCase — `{{1.cliente}}`, `{{1.tipoInforme}}`, `{{1.tipoPropiedad}}`, `{{1.producto}}`, `{{1.comuna}}`, `{{1.ejecutivaClerkId}}` — y funcionan. Alguien actualizó los Search al contrato nuevo y dejó el módulo 7 en el contrato anterior. Efecto medido: **30 campos de primer nivel + los 16 de cada unidad llegarían vacíos** aun con H1 resuelto.

**H3 · Renombres del Route Handler que Make desconoce (probabilidad: alta, verificada).**
`route.ts:57-65` desestructura `banco_id` → `bancoOriginador` y `banco` → `bancoFinancista`. Make busca `{{1.banco_id}}` (módulo 7) y `{{1.banco}}` (Search id=9). Ambos bancos quedarían vacíos incluso resolviendo H1 y H2. El propio comentario del handler (líneas 16-19) admite que el originador "queda sin mapear en el módulo Solicitud hasta que se agregue" — pero el mapper **sí** tiene la línea, apuntando a la clave vieja, lo que es peor que no tenerla: parece cableado y no lo está.

---

## 6. Siguiente paso recomendado

Decidir el **contrato canónico de nombres** (camelCase del zod o snake_case del mapper) y congelarlo en un solo documento antes de tocar nada, porque de esa decisión dependen H2 y H3 y el orden en que se arreglan H1 → mapper → unidades.

---

*Auditoría read-only. No se modificó código, schema de Airtable ni escenarios de Make. Sin commit.*
