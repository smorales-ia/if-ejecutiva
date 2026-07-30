import type { ContactoVisita, Solicitud, Unidad } from "@/lib/console-data"
import {
  MATERIAL_POR_ETIQUETA,
  ORIGEN_SUPERFICIE_POR_ETIQUETA,
  SUBTIPO_POR_TIPO_BIEN,
  type UnidadPayload,
} from "@/lib/mappers/crear-solicitud"

/**
 * Mapper UI → contrato `cambios` de SC-Edicion (E-078).
 *
 * El modelo `Solicitud` de la consola es **anidado** (`comprador.nombre`,
 * `vendedor.correo`, `financiero.valorTotalUf`); SC-Edicion consume un objeto
 * **plano en camelCase** bajo `cambios.*` y resuelve los Link fields buscando
 * por nombre (módulos 6-11: Cliente · TipoInforme · TipoPropiedad · Producto ·
 * Comuna · BancoFinancista). Este mapper traduce entre ambos.
 *
 * Tres reglas que no son obvias y que motivan el archivo:
 *
 * 1. `mapRecord` (`lib/solicitudes.ts`) rellena los campos vacíos con el
 *    placeholder `'—'` para la vista. Reenviarlo a Make escribiría el guion
 *    literal en Airtable, así que `limpiar()` lo colapsa a `undefined`.
 * 2. `montoUf` llega formateado para lectura (`"4.200 UF"`). SC-Edicion aplica
 *    `parseNumber()`, que no entiende el separador de miles es-CL: se envía
 *    normalizado a número plano.
 * 3. SC-Edicion es un transportador puro (RT-03) y escribe **todos** los campos
 *    que mapea en cada ejecución, incluidos los que esta pantalla no edita. Por
 *    eso los campos de sólo lectura se rescatan del registro `original` en vez
 *    de omitirse — ver la nota sobre pérdida de datos al final del archivo.
 */

const PLACEHOLDER = "—"

/** Colapsa vacíos y placeholders de presentación a `undefined`. */
function limpiar(valor: string | undefined | null): string | undefined {
  if (valor == null) return undefined
  const t = valor.trim()
  return t === "" || t === PLACEHOLDER ? undefined : t
}

/**
 * Normaliza un monto de presentación a número plano para `parseNumber()`.
 * Acepta `"4.200 UF"`, `"4.200,50"`, `"4200.5"` y `"4200"`.
 */
function numeroPlano(valor: string | undefined | null): string | undefined {
  const t = limpiar(valor)
  if (!t) return undefined

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

/** Contacto de visita en el formato snake_case que crea el módulo 17. */
export interface ContactoVisitaPayload {
  nombre: string
  telefono: string
  email: string
  rol: string
  orden_prioridad: number
  estado_contacto: string
}

function mapearContacto(
  c: ContactoVisita,
  index: number,
): ContactoVisitaPayload {
  return {
    nombre: limpiar(c.nombre) ?? "",
    telefono: limpiar(c.telefono) ?? "",
    email: limpiar(c.email) ?? "",
    rol: limpiar(c.rol) ?? "",
    // El primer contacto del array es el principal (misma convención que la UI).
    orden_prioridad: index + 1,
    estado_contacto: limpiar(c.estado) ?? "",
  }
}

/**
 * Traduce una unidad del **modelo de lectura** (`Unidad` de console-data) al
 * shape que SC-Edicion escribe en `TX_Unidades`.
 *
 * Gemelo de `mapearUnidad` (crear-solicitud.ts), pero parte de un tipo distinto:
 * el del alta viene del formulario (todo string, `rolModo` como enum), y este
 * viene de lo que `hydrateUnidades` leyó de Airtable (números ya tipados,
 * `conRol` booleano). Las tablas de traducción de vocabulario **sí** se
 * comparten —se importan de crear-solicitud— porque duplicarlas garantizaría
 * que diverjan.
 */
function mapearUnidadEdicion(u: Unidad, index: number): UnidadPayload {
  const anio = Number(u.anioConstruccion)
  return {
    numero_unidad: limpiar(u.ubicacion) ?? "",
    modelo: limpiar(u.modelo) ?? "",
    subtipo: SUBTIPO_POR_TIPO_BIEN[u.tipoBien] ?? "",
    // Aquí el eje con-rol/uso-y-goce ya viene resuelto como booleano por
    // `hydrateUnidades`, así que no hace falta la tabla del enum del formulario.
    con_rol_o_uso_y_goce: u.conRol ? "con_rol" : "uso_y_goce",
    rol_sii: limpiar(u.rolSii) ?? "",
    rol_sii_en_tramite: u.rolEnTramite,
    sup_m2: Number.isFinite(u.supConstruida) ? u.supConstruida : null,
    superficie_terraza_m2: u.supTerraza ?? null,
    sup_terreno_m2: u.supTerreno ?? null,
    anio_construccion: Number.isFinite(anio) && anio > 0 ? anio : null,
    tipo_material: MATERIAL_POR_ETIQUETA[u.material] ?? "",
    ampliacion_m2: u.m2Ampliacion ?? null,
    // `regularizable` es booleano opcional: `undefined` no es "no", es "no
    // declarado", y Airtable lo modela como `no_aplica`.
    ampliacion_regularizable:
      u.regularizable === true ? "si" : u.regularizable === false ? "no" : "no_aplica",
    origen_superficie: ORIGEN_SUPERFICIE_POR_ETIQUETA[u.origenSuperficie] ?? "",
    detalle_item: limpiar(u.detalleItem) ?? "",
    orden: index + 1,
  }
}

/** Payload plano que viaja como `cambios` en el PATCH. */
export type CambiosEdicion = Record<string, unknown>

/**
 * Traduce la solicitud editada al contrato `cambios` de SC-Edicion.
 *
 * @param actualizada Estado del formulario al presionar "Guardar cambios".
 * @param original    Solicitud tal como vino del servidor. Se usa para
 *                    preservar los campos que SC-Edicion escribe pero esta
 *                    pantalla no expone (`origenCanal`, `prioridad`, …).
 */
export function mapearEdicionSolicitud(
  actualizada: Solicitud,
  original: Solicitud,
): CambiosEdicion {
  const d = actualizada
  const esNuevo = d.tipoPropiedadNuevoUsado === "nuevo"
  const esInmobiliaria = d.vendedor.esInmobiliaria

  const cambios: Record<string, unknown> = {
    // — Cliente y tipo (resueltos a Link por búsqueda de nombre) —
    cliente: limpiar(d.cliente),
    tipoInforme: limpiar(d.tipoInforme),
    tipoPropiedad: limpiar(d.tipoPropiedad),
    tipoPropiedadNuevoUsado: d.tipoPropiedadNuevoUsado,
    producto: limpiar(d.producto),
    bancoFinancista: limpiar(d.banco),

    // — Propiedad —
    // La spec lo describe como "sólo Nuevo" (§1.3.2, bloque Propiedad), pero
    // viaja siempre: SC-Edicion reescribe la fila completa, así que omitirlo en
    // una solicitud Usado que ya lo tenga poblado lo borraría. Misma doctrina
    // que `origenCanal` y los campos preservados más abajo.
    proyecto: limpiar(d.proyecto),
    direccion: limpiar(d.direccion),
    region: limpiar(d.region),
    comuna: limpiar(d.comuna),
    estadoConservacion: limpiar(d.estadoConservacion),

    // — Comprador / cliente final —
    clienteFinalNombre: limpiar(d.comprador.nombre),
    clienteFinalRut: limpiar(d.comprador.rut),
    emailContacto: limpiar(d.comprador.email),
    solicitanteTelefono: limpiar(d.comprador.telefono),

    // — Vendedor —
    // `vendedor_tipo_persona` distingue la rama del formulario; el nombre y el
    // RUT viajan por un único par de campos según esa rama.
    vendedorTipoPersona: esInmobiliaria ? "juridica" : "natural",
    vendedorRazonSocialONombre: esInmobiliaria
      ? limpiar(d.vendedor.razonSocial)
      : limpiar(d.vendedor.nombre),
    vendedorRut: esInmobiliaria
      ? limpiar(d.vendedor.rutInmobiliaria)
      : limpiar(d.vendedor.rut),
    vendedorEmail: limpiar(d.vendedor.correo),
    vendedorTelefono: limpiar(d.vendedor.telefono),
    vendedorOrigenDato: limpiar(d.vendedor.origenDato),

    // — Observaciones y canal —
    observaciones: limpiar(d.observaciones),
    // `canal` alimenta `canal_contacto_original` (el select de la pantalla);
    // `origen_canal` conserva su semántica de canal de ingreso al sistema y no
    // es editable aquí, así que se preserva tal como vino.
    //
    // ⚠ Hasta el 27-jul-2026 `origenCanal` se leía de `original.canal`, que en
    // ese momento venía poblado con `origen_canal`: el select de la pantalla
    // mostraba vacío y, al guardar, escribía `ingreso_manual` dentro de
    // `canal_contacto_original`. Ahora son dos campos distintos en el modelo de
    // lectura y cada uno viaja por su clave (E-089).
    canal: limpiar(d.canal),
    origenCanal: limpiar(original.origenCanal),

    // — Campos que SC-Edicion escribe pero esta pantalla no edita —
    prioridad: limpiar(original.prioridad),
    montoEstimadoUf: numeroPlano(original.montoUf),
    solicitanteNombre: limpiar(original.propietario),
    ejecutivoSolicitante: limpiar(original.modificadoPor),
    ejecutivoFormalizador: limpiar(original.ejecFormalizador),
    modoCreacion: limpiar(original.modoCreacion),
    tipoClienteOrigen: limpiar(original.tipoClienteOrigen),
    origenDireccion: limpiar(original.origenDireccion),
    emailThreadId: limpiar(original.emailThreadId),

    // — Claves que SC-Edicion ya mapeaba y este mapper no enviaba (D-02) —
    // No se enviaban porque `mapRecord` no leía sus campos, así que el modelo
    // `Solicitud` no los tenía y no había de dónde reconstruirlos. Al ampliar
    // `SOLICITUD_FIELDS` en la misma tanda pasaron a estar disponibles. El
    // contrato con Make ya existía: no hubo que tocar el blueprint.
    //
    // ⚠ Importa que viajen aunque la pantalla no los edite: SC-Edicion
    // reescribe la fila completa, así que una clave ausente puede interpretarse
    // como borrado. Se devuelven intactos, igual que `origenCanal`.
    // Los tres primeros sí los edita la pantalla (Regla C), así que se leen de
    // la copia editada `d`. `fechaAsignacion` la escribe SC-Asignar, no la
    // Ejecutiva: se devuelve intacta desde `original`.
    nOperacionCliente: d.nOperacionCliente,
    sucursalOriginadora: limpiar(d.sucursalOriginadora),
    correoClienteRef: limpiar(d.correoClienteRef),
    fechaAsignacion: limpiar(original.fechaAsignacion),
  }

  // — Financiero (sólo propiedades nuevas) —
  if (esNuevo && d.financiero) {
    const f = d.financiero
    Object.assign(cambios, {
      financieroValorTotalUf: numeroPlano(f.valorTotalUf),
      financieroPrecioVentaUf: numeroPlano(f.precioVenta),
      financieroSubsidioUf: numeroPlano(f.subsidio),
      financieroAhorroUf: numeroPlano(f.ahorro),
      financieroMutuoUf: numeroPlano(f.mutuo),
      financieroPagoContadoUf: numeroPlano(f.pagoContado),
      financieroBonoCaptacionUf: numeroPlano(f.bonoCaptacion),
      financieroBonoIntegracionUf: numeroPlano(f.bonoIntegracion),
    })
  }

  // Descarta las claves sin valor: una clave ausente y una clave en `""` no son
  // equivalentes para el módulo de Airtable de Make.
  const payload: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(cambios)) {
    if (v !== undefined) payload[k] = v
  }

  // — Unidades: helper local, ver `mapearUnidadEdicion` al pie del archivo —

  // — Contactos de visita (borrar + recrear en TX_ContactosVisita) —
  // Sólo el string JSON. La forma array se retiró en D-02: SC-Edicion no la
  // lee —sus únicas referencias son `{{1.contactosVisitaJson}}`— y dejarla
  // viajar hace que el webhook memorice una estructura anidada que nadie
  // consume, que es exactamente lo que corrompió SC01 en [[E-092]].
  //
  // El Route Handler la iza fuera de `cambios` antes de enviarla a Make; ver
  // la nota en app/api/solicitudes/[id]/route.ts.
  //
  // Un array vacío haría que SC-Edicion borre los contactos existentes sin
  // recrear ninguno. La pantalla siempre mantiene al menos uno, así que un
  // array vacío indica que la hidratación falló: en ese caso no se tocan.
  if (d.contactosVisita.length > 0) {
    payload.contactosVisitaJson = JSON.stringify(d.contactosVisita.map(mapearContacto))
  }

  // — Unidades (borrar + recrear en TX_Unidades) —
  // Misma topología que los contactos y, sobre todo, **la misma guarda**: sólo
  // se envían si hay al menos una.
  //
  // La guarda no es cosmética. SC-Edicion borra y recrea, así que un array
  // vacío se traduciría en "borra todas las unidades y no crees ninguna". Y el
  // array puede venir vacío por una razón que no es "el usuario las borró":
  // `hydrateUnidades` degrada silenciosamente a `[]` si Airtable falla
  // (lib/unidades.ts). Sin esta guarda, una caída de Airtable durante la
  // hidratación seguida de un Guardar destruiría las unidades de la solicitud
  // sin ningún error visible. Decisión explícita de Sergio, 29-jul-2026:
  // nunca borrar con vacío, aunque eso impida borrar la última unidad desde
  // la pantalla — el borrado total se hace en Airtable, a mano y a conciencia.
  if (d.unidades.length > 0) {
    payload.unidadesJson = JSON.stringify(d.unidades.map(mapearUnidadEdicion))
  }

  return payload
}

/**
 * Cobertura de este mapper contra el módulo 2 (Update Records) de SC-Edicion,
 * al 29-jul-2026: **47 campos**, 40 directos bajo `cambios.*` + 7 Link fields
 * que el escenario resuelve por búsqueda (módulos 6-11 por nombre, y el 24 —
 * `ejecutiva_asignada` — por `clerk_user_id`).
 *
 * `ejecutiva_asignada` es el único que **no** sale de aquí: viaja como
 * `ejecutivaClerkId` en la raíz del PATCH, puesto server-side desde la sesión
 * Clerk (`app/api/solicitudes/[id]/route.ts`). No se expone en el formulario —
 * la Ejecutiva no se auto-reasigna a mano.
 *
 * Las dos advertencias que vivían aquí quedaron obsoletas y se retiran para que
 * no induzcan a error:
 *  - `n_operacion_cliente`, `sucursal_originadora`, `correo_cliente_ref` y
 *    `fechaAsignacion` ya no se omiten: se envían desde `d`/`original` (D-02,
 *    al ampliarse `SOLICITUD_FIELDS`). El módulo 2 además protege
 *    `n_operacion_cliente` con `if(…; parseNumber(…); emptystring)`, igual que
 *    SC01, para que un valor ausente no llegue como `parseNumber("")`.
 *  - El bloque "Unidades" sí tiene destino: la rama 1 del Router las borra y
 *    recrea en `TX_Unidades` a partir de `unidadesJson`.
 */
