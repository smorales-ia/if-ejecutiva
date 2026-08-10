import type {
  ContactoVisitaFormulario,
  NuevaSolicitudInternaValues,
  UnidadFormulario,
} from "@/lib/validators/nueva-solicitud-interna"
import {
  aSlug,
  MATERIAL,
  ORIGEN_SUPERFICIE,
  REGULARIZABLE,
  ROL_MODO,
  SUBTIPO,
} from "@/lib/mappers/vocabulario-unidades"

/**
 * Mapper UI → contrato del webhook de SC01 (RF-04 · Tanda B, 27-jul-2026).
 *
 * ## Por qué existe este archivo
 *
 * El schema zod está en **camelCase** (idiomático JS) y `TX_Solicitudes` está
 * en **snake_case** (inmutable). Hasta el 27-jul-2026 el Route Handler enviaba
 * el `...spread` literal de `parsed.data`, así que el módulo 7 de SC01 —que
 * lee `{{1.nombre}}`, `{{1.estado_conservacion}}`, `{{1.financiero_*_uf}}`—
 * recibía claves que no existían y escribía ~30 campos vacíos.
 *
 * **Decisión de contrato congelada (27-jul-2026)**: el payload que viaja al
 * webhook es snake_case sin excepciones. El zod no se toca; la traducción
 * ocurre aquí, en una función pura, justo antes del POST. Tras el delta
 * `docs/_notas/DELTA-SC01_20260727.md`, cada `{{1.x}}` del blueprint es
 * literalmente una clave de lo que devuelve `toMakeSnakePayload()`.
 *
 * ## Reglas que no son obvias
 *
 * 1. **Claves vacías se omiten.** Una clave ausente y una clave en `""` no son
 *    equivalentes para el conector de Airtable de Make: `{{parseNumber(1.x)}}`
 *    sobre `""` puede escribir basura en un campo `number`. Como esto es un
 *    *create* (no hay valor previo que pisar), omitir es siempre seguro. Misma
 *    convención que `mapearEdicionSolicitud`.
 * 2. **Los montos se normalizan a número plano.** Los inputs son de texto y la
 *    Ejecutiva escribe en formato es-CL (`"4.200"`, `"4.200,50"`). La función
 *    `parseNumber()` de Make no entiende el separador de miles es-CL y
 *    devolvería `4` en vez de `4200`.
 * 3. **El vendedor viaja por un único par de campos.** Airtable tiene un solo
 *    `vendedor_razon_social_o_nombre` y un solo `vendedor_rut`; el formulario
 *    captura dos pares distintos según la rama nuevo/usado. La rama se
 *    reconstruye en Airtable desde `vendedor_tipo_persona`.
 * 4. **`orden_prioridad` se genera desde el índice, base 1.** El zod no lo
 *    captura; el orden de la lista en la UI *es* la prioridad. El primer
 *    contacto del array es el principal.
 * 5. **Este mapper traduce forma, no vocabulario.** Los valores de los campos
 *    que caen en un `singleSelect` de Airtable (`tipo_cliente_origen`,
 *    `estado_conservacion`, `origen_direccion`, `vendedor_origen_dato`,
 *    `canal`, y `rol`/`estado_contacto` de cada contacto) llegan aquí ya como
 *    el slug exacto de la opción, porque los catálogos de
 *    `lib/console-data.ts` los definen como `{ value, label }` y los
 *    `<SelectItem>` usan el `value`. Lo mismo vale para los campos que Make
 *    resuelve con un `Search Records` (`cliente`, `tipo_informe`,
 *    `tipo_propiedad`, `producto`, `banco_financista_nombre`): esos nombres
 *    salen de `/api/catalogos`, o sea de la propia tabla maestra. **No agregar
 *    tablas de traducción aquí**: duplicarían la fuente de verdad y volverían a
 *    divergir. Si un valor no existe en Airtable, el create muere con
 *    `Insufficient permissions to create new select option` (Tanda D,
 *    27-jul-2026) o —peor, porque es silencioso— el Search devuelve cero
 *    bundles y el link queda vacío (Tanda E). El arreglo es el catálogo o el
 *    schema, nunca el mapper.
 *
 *    **Excepción acotada: los cuatro selects de `TX_Unidades`** (`subtipo`,
 *    `tipo_material`, `origen_superficie`, `con_rol_o_uso_y_goce`). Ahí la
 *    premisa de la regla no se cumple: `TIPOS_BIEN`, `MATERIALES` y
 *    `ORIGENES_SUPERFICIE` son arrays de **etiquetas humanas** (`"Albañilería"`,
 *    `"Obras complementarias"`) declarados en `lib/console-data.ts`, no pares
 *    `{value,label}` ni catálogos servidos desde Airtable — así que no hay
 *    fuente de verdad compartida que duplicar, y ninguna de las dos puntas
 *    puede adoptar la otra sin romperse (Airtable usa slugs; la UI, texto con
 *    tildes). Las tablas viven abajo, junto a `mapearUnidad`, y son el único
 *    sitio donde se traduce vocabulario en este archivo. Si algún día esos
 *    catálogos pasan a servirse desde Airtable, hay que borrarlas.
 *
 * ## Campos del zod que este mapper descarta deliberadamente
 *
 * | Campo zod | Motivo |
 * |---|---|
 * | ~~`unidades[]`~~ | **Ya no se descarta**: viaja como `unidades_json` desde la tanda de cierre (29-jul-2026) |
 * | `ejec_comercializador` | No existe el campo en `TX_Solicitudes` (deuda de schema) |
 * | `vendedorCoincideComprador` | Sin campo destino |
 * | `id` de contactos y unidades | Identificadores de cliente para React, no de negocio |
 *
 * @see docs/_notas/DELTA-SC01_20260727.md — delta del blueprint que fija el contrato
 * @see docs/_notas/AUDIT-RF04-solicitud-incompleta_20260727.md — diagnóstico
 */

/** Contacto tal como lo consume el Iterator (módulo 17) de SC01. */
export interface ContactoVisitaPayload {
  nombre: string
  telefono: string
  email: string
  rol: string
  orden_prioridad: number
  estado_contacto: string
}

/**
 * Unidad tal como la consume el módulo Parse JSON de unidades de SC01.
 *
 * Los cuatro `singleSelect` son **opcionales a propósito** (C-1, 30-jul-2026):
 * cuando el vocabulario no puede traducir un valor, la clave se omite en vez de
 * viajar como `""`. Un `""` con `typecast: true` no falla — crea una opción de
 * nombre vacío en el catálogo maestro de Airtable. Ver
 * `lib/mappers/vocabulario-unidades.ts`.
 */
export interface UnidadPayload {
  numero_unidad: string
  modelo: string
  subtipo?: string
  con_rol_o_uso_y_goce?: string
  rol_sii: string
  rol_sii_en_tramite: boolean
  sup_m2: number | null
  superficie_terraza_m2: number | null
  sup_terreno_m2: number | null
  anio_construccion: number | null
  tipo_material?: string
  ampliacion_m2: number | null
  ampliacion_regularizable?: string
  origen_superficie?: string
  detalle_item: string
  orden: number
}

/**
 * Las traducciones de vocabulario de `TX_Unidades` vivían acá como cinco tablas
 * de una sola dirección (etiqueta → slug). Se mudaron a
 * `lib/mappers/vocabulario-unidades.ts`, que declara los pares una vez y deriva
 * los dos sentidos, porque la pantalla de edición necesita la vuelta y aplicarle
 * la tabla de ida vaciaba los cuatro selects en cada guardado (C-1, 30-jul-2026).
 * El archivo nuevo explica el bug completo.
 */

/** Payload plano snake_case listo para `postToMake`. */
export type PayloadSC01 = Record<string, unknown>

export interface OpcionesPayloadSC01 {
  /**
   * `userId` de la sesión Clerk activa. Se resuelve server-side en el Route
   * Handler y nunca llega desde el cliente. Alimenta el Search del módulo 15
   * (`AUTH_Usuarios.clerk_user_id`) que resuelve `ejecutiva_asignada`.
   */
  ejecutivaClerkId: string
}

/**
 * Normaliza un monto escrito a mano a número plano, para que `parseNumber()`
 * de Make lo interprete bien. Acepta `"4.200 UF"`, `"4.200,50"`, `"4200.5"` y
 * `"4200"`. Devuelve `undefined` si no hay número.
 *
 * Gemelo deliberado del helper homónimo en `lib/mappers/editar-solicitud.ts`.
 * Se duplica en vez de compartirse para no tocar la ruta de edición, que ya
 * está en producción; unificar ambos es tarea de RF-04 fase 2.
 */
function numeroPlano(valor: string | undefined | null): string | undefined {
  if (valor == null) return undefined
  const t = valor.trim()
  if (t === "") return undefined

  const soloNumero = t.replace(/[^\d,.-]/g, "")
  if (soloNumero === "") return undefined

  let normalizado: string
  if (soloNumero.includes(",")) {
    // Formato es-CL: "." son miles y "," es el decimal.
    normalizado = soloNumero.replace(/\./g, "").replace(",", ".")
  } else {
    const puntos = soloNumero.split(".")
    // "4.200" → miles (último grupo de 3 dígitos); "4200.5" → decimal.
    const sonMiles =
      puntos.length > 1 && puntos.slice(1).every((g) => g.length === 3)
    normalizado = sonMiles ? puntos.join("") : soloNumero
  }

  const n = Number(normalizado)
  return Number.isFinite(n) ? String(n) : undefined
}

/** Colapsa vacíos a `undefined` para que la clave se omita del payload. */
function texto(valor: string | undefined | null): string | undefined {
  if (valor == null) return undefined
  const t = valor.trim()
  return t === "" ? undefined : t
}

/**
 * Traduce un contacto del formulario al formato del Iterator.
 *
 * Dos renombres: el zod llama `estado` a lo que Airtable llama
 * `estado_contacto`, y `orden_prioridad` no existe en el formulario — se
 * deriva de la posición en la lista, empezando en 1.
 *
 * A diferencia del resto del payload, aquí **siempre se emiten las 6 claves**
 * aunque vengan vacías: el Iterator recorre objetos de forma homogénea y un
 * ítem con menos claves que sus hermanos produce mapeos inconsistentes entre
 * iteraciones.
 */
function mapearContacto(
  contacto: ContactoVisitaFormulario,
  index: number,
): ContactoVisitaPayload {
  return {
    nombre: contacto.nombre.trim(),
    telefono: contacto.telefono.trim(),
    email: contacto.email.trim(),
    rol: contacto.rol.trim(),
    orden_prioridad: index + 1,
    estado_contacto: contacto.estado.trim(),
  }
}

/**
 * Igual que `numeroPlano` pero devuelve un `number` de verdad y no su
 * representación en texto. Los campos de `TX_Unidades` son `number`, y mandar
 * un número real evita depender del `typecast` del módulo de Airtable para
 * algo tan básico como una superficie.
 */
function numeroReal(valor: string | undefined | null): number | null {
  const plano = numeroPlano(valor)
  if (plano === undefined) return null
  const n = Number(plano)
  return Number.isFinite(n) ? n : null
}

/**
 * Traduce una unidad del formulario al shape que escribe SC01 en `TX_Unidades`.
 *
 * Las superficies llegan como string del `<input>` y van a campos `number`:
 * `null` cuando no hay dato, nunca 0 — un 0 se leería como una superficie real
 * de cero metros.
 */
function mapearUnidad(unidad: UnidadFormulario, index: number): UnidadPayload {
  return {
    numero_unidad: unidad.ubicacion.trim(),
    modelo: unidad.modelo.trim(),
    rol_sii: unidad.rolSii.trim(),
    rol_sii_en_tramite: unidad.rolEnTramite,
    sup_m2: numeroReal(unidad.supConstruida),
    superficie_terraza_m2: numeroReal(unidad.supTerraza),
    sup_terreno_m2: numeroReal(unidad.supTerreno),
    anio_construccion: numeroReal(unidad.anioConstruccion),
    ampliacion_m2: numeroReal(unidad.m2Ampliacion),
    detalle_item: unidad.detalleItem.trim(),
    orden: index + 1,
    // Los cinco selects se agregan sólo si el vocabulario los traduce, para no
    // mandar `""` a un singleSelect con typecast (C-1). `soloDefinidos` es lo
    // que hace que la clave desaparezca del JSON en vez de quedar en
    // `undefined`, que `JSON.stringify` sí omite pero deja el tipo sucio.
    ...soloDefinidos({
      subtipo: aSlug(SUBTIPO, unidad.tipoBien),
      con_rol_o_uso_y_goce: aSlug(ROL_MODO, unidad.rolModo),
      tipo_material: aSlug(MATERIAL, unidad.material),
      ampliacion_regularizable: aSlug(REGULARIZABLE, unidad.regularizable),
      origen_superficie: aSlug(ORIGEN_SUPERFICIE, unidad.origenSuperficie),
    }),
  }
}

/** Descarta las claves cuyo valor es `undefined`, conservando el resto. */
function soloDefinidos(
  campos: Record<string, string | undefined>,
): Record<string, string> {
  const salida: Record<string, string> = {}
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor !== undefined) salida[clave] = valor
  }
  return salida
}

/**
 * Traduce los datos validados del formulario al payload snake_case de SC01.
 *
 * Función pura: no lee entorno, no hace I/O, no depende de la request. Todo lo
 * que no viene del formulario entra por `opciones` o es una constante
 * documentada.
 *
 * @param datos    Salida de `nuevaSolicitudInternaSchema.parse()` (camelCase).
 * @param opciones Contexto server-side (sesión Clerk).
 */
export function toMakeSnakePayload(
  datos: NuevaSolicitudInternaValues,
  opciones: OpcionesPayloadSC01,
): PayloadSC01 {
  const esNuevo = datos.tipoPropiedadNuevoUsado === "nuevo"

  const campos: Record<string, unknown> = {
    // ── Constantes de canal y autoría ──────────────────────────────────────
    // El alta nace en la consola de la Ejecutiva, nunca desde el portal ni el
    // correo del cliente.
    origen_canal: "ingreso_manual",
    // `subido_por` pertenece al contrato de TX_Adjuntos y hoy SC01 no lo mapea;
    // viaja inerte por acuerdo explícito, para no cambiar el contrato cuando
    // la fase de adjuntos lo consuma.
    subido_por: "Ejecutivo",
    ejecutiva_clerk_id: opciones.ejecutivaClerkId,
    // Hito de inicio del SLA por etapa (§5.2.2 · RF-53 · §9.6.2 C-7). La clave
    // lleva el nombre del campo destino de `TX_Solicitudes` porque el módulo 7
    // de SC01 la mapea directo, sin Search ni transformación. Si el wizard no
    // alcanzó a estamparla, `texto()` la deja en `undefined` y el filtro del
    // final la omite: SC01 no escribe el campo y la solicitud nace en
    // `sin_dato`, en vez de nacer con un instante inventado.
    sla_e1_inicio_ts: texto(datos.slaInicioTs),
    // El motor no puede correr en Make —la aritmética hábil de §5.2.1 no cabe
    // en una fórmula— así que la etapa de arranque es una constante: toda alta
    // nace en e1 · Ingreso de solicitud. Los umbrales de e1 los materializa el
    // Route Handler antes de postear (ver `crear-solicitud/route.ts`).
    sla_etapa_actual: 1,

    // ── Sección A · Origen y cliente ───────────────────────────────────────
    canal: texto(datos.canal),
    cliente: texto(datos.cliente),
    tipo_cliente_origen: texto(datos.tipoClienteOrigen),
    tipo_informe: texto(datos.tipoInforme),
    // Banco ORIGINADOR: slug de M_BANCOS (`banco_estado`, `santander`, …) que
    // se persiste tal cual en el campo de texto `banco`. NO confundir con
    // `banco` de la Sección D, que es el financista y sí se resuelve a link
    // vía Search (módulo 9). Ver A3 del delta.
    banco_id: texto(datos.banco_id),
    sucursal_originadora: texto(datos.sucursal_originadora),
    ejecutivo_solicitante: texto(datos.ejecutivo_solicitante),
    ejecutivo_formalizador: texto(datos.ejec_formalizador),
    n_operacion_cliente: texto(datos.n_operacion_cliente),

    // ── Sección B · Propiedad ──────────────────────────────────────────────
    tipo_propiedad_nuevo_usado: datos.tipoPropiedadNuevoUsado,
    proyecto: texto(datos.proyecto),
    direccion: texto(datos.direccion),
    origen_direccion: texto(datos.origenDireccion),
    region: texto(datos.region),
    comuna: texto(datos.comuna),
    tipo_propiedad: texto(datos.tipoPropiedad),
    estado_conservacion: texto(datos.estadoConservacion),

    // ── Sección B.2 · Vendedor ─────────────────────────────────────────────
    // Un solo par de campos en Airtable para las dos ramas del formulario;
    // `vendedor_tipo_persona` es lo que permite reconstruir cuál se usó.
    vendedor_tipo_persona: esNuevo ? "juridica" : "natural",
    vendedor_razon_social_o_nombre: esNuevo
      ? texto(datos.vendedorRazonSocial)
      : texto(datos.vendedorNombre),
    vendedor_rut: esNuevo
      ? texto(datos.vendedorRutInmobiliaria)
      : texto(datos.vendedorRut),
    vendedor_email: texto(datos.vendedorCorreo),
    vendedor_telefono: texto(datos.vendedorTelefono),
    vendedor_origen_dato: texto(datos.vendedorOrigenDato),

    // ── Sección C · Personas de la operación ───────────────────────────────
    // Claves cortas por decisión histórica del módulo 7: `nombre`/`rut`/
    // `email`/`telefono` sin prefijo son SIEMPRE el comprador (cliente final).
    nombre: texto(datos.compradorNombre),
    rut: texto(datos.compradorRut),
    email: texto(datos.compradorEmail),
    telefono: texto(datos.compradorTelefono),

    // ── Sección D · Producto y observaciones ───────────────────────────────
    producto: texto(datos.producto),
    // Banco FINANCISTA: nombre de `M_Bancos.nombre` que el Search del módulo 9
    // resuelve al link `banco_financista` (`fldxcfdKRctHCgwmB`).
    //
    // La clave se llamaba `banco` a secas y convivía con `banco_id`, que es el
    // banco ORIGINADOR y se escribe en el campo de texto `banco`
    // (`fldAgTlFXeXWfGTdI`). Dos claves con el mismo nombre semántico y destinos
    // distintos: leer `{{1.banco}}` en el blueprint no dejaba ver cuál de los
    // dos bancos era. El nombre explícito hace el contrato autodescriptivo.
    // Requiere el módulo 9 apuntando a `{{1.banco_financista_nombre}}`.
    banco_financista_nombre: texto(datos.banco),
    observaciones: texto(datos.observaciones),
  }

  // ── Bloque financiero (sólo propiedades nuevas) ──────────────────────────
  // El formulario sólo muestra estos campos cuando la propiedad es nueva; el
  // guard evita arrastrar valores residuales si la Ejecutiva cambió de rama.
  if (esNuevo) {
    Object.assign(campos, {
      financiero_valor_total_uf: numeroPlano(datos.valorTotalUf),
      financiero_subsidio_uf: numeroPlano(datos.subsidio),
      financiero_ahorro_uf: numeroPlano(datos.ahorro),
      financiero_mutuo_uf: numeroPlano(datos.mutuo),
      financiero_pago_contado_uf: numeroPlano(datos.pagoContado),
      financiero_bono_captacion_uf: numeroPlano(datos.bonoCaptacion),
      financiero_bono_integracion_uf: numeroPlano(datos.bonoIntegracion),
      financiero_precio_venta_uf: numeroPlano(datos.precioVenta),
      // `valor_uf` alimenta `monto_estimado_uf` (fldKZW799xIqMFN1I), que la
      // consola lee y muestra como `montoUf` (lib/solicitudes.ts:209,292).
      // Duplica `financiero_valor_total_uf` a sabiendas: es la misma familia
      // de deuda que `fin_*_uf` vs `financiero_*_uf` y se cierra en fase 2.
      // Decisión de Sergio, 27-jul-2026 (hallazgo 3 de la Tanda A).
      valor_uf: numeroPlano(datos.valorTotalUf),
    })
  }

  // Descarta las claves sin valor — ver regla 1 de la cabecera.
  const payload: PayloadSC01 = {}
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor !== undefined) payload[clave] = valor
  }

  // ── Contactos de visita ─────────────────────────────────────────────────
  // Se envía **serializado y bajo una clave nueva**, no como array bajo
  // `contactos_visita`. Dos razones, en este orden:
  //
  // 1. El webhook de Make deriva su estructura del último payload recibido
  //    ("Determine data structure automatically"). Mientras `contactos_visita`
  //    siga viajando como array de objetos, el hook conserva la estructura
  //    memorizada que producía filas corruptas en TX_ContactosVisita. Una clave
  //    nueva de tipo `text` no tiene estructura que memorizar, así que no puede
  //    heredar la corrupción.
  // 2. El blueprint la consume con un módulo `json:ParseJSON` dedicado, que con
  //    raíz array emite un bundle por contacto — sin Iterator. Es la misma
  //    topología que SC-Edicion usa contra esta misma tabla (`contactosVisitaJson`,
  //    editar-solicitud.ts:199), ya verificada en producción.
  //
  // El Router 16 filtra por `exist` sobre esta clave. El zod garantiza al menos
  // un contacto, así que el array nunca va vacío — si lo estuviera, el filtro
  // descartaría la rama y no se crearía ninguna fila sin error visible en Make.
  //
  // ⚠ El escenario desplegado debe importar el blueprint nuevo antes de que
  // esta versión llegue a producción: el SC01 viejo lee `contactos_visita` y
  // dejaría de crear contactos, reportando Success igualmente.
  payload.contactos_visita_json = JSON.stringify(
    datos.contactosVisita.map(mapearContacto),
  )

  // ── Unidades ────────────────────────────────────────────────────────────
  // Misma topología y por las mismas razones que los contactos: clave nueva,
  // tipo texto, consumida por un módulo `json:ParseJSON` dedicado en su propia
  // ruta del Router 16. Hasta la tanda de cierre (29-jul-2026) SC01 no tenía
  // ningún módulo que creara unidades y el zod las descartaba aquí, así que
  // `TX_Unidades` estaba vacía — y con ella RN-44 nunca se cumplía y el botón
  // "Asignar Tasador" quedaba permanentemente deshabilitado (Regla A).
  //
  // El zod exige al menos una unidad, así que el array nunca va vacío.
  payload.unidades_json = JSON.stringify(datos.unidades.map(mapearUnidad))

  return payload
}
