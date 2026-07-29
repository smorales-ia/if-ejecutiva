import type { ContactoVisita, Solicitud } from "@/lib/console-data"

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

  return payload
}

/**
 * ⚠ Campos de `TX_Solicitudes` que SC-Edicion mapea y que **no** son
 * reconstruibles desde el modelo `Solicitud`, porque `mapRecord` no los lee:
 * `n_operacion_cliente`, `sucursal_originadora`, `correo_cliente_ref` y
 * `fecha_asignacion`. Aquí se omiten para no enviarlos vacíos. Si el conector
 * de Airtable de Make interpreta una clave ausente como borrado, esos cuatro
 * campos se perderían al editar — verificarlo en el smoke test sobre un
 * registro de prueba antes de usar la edición en producción. El cierre
 * definitivo es ampliar `SOLICITUD_FIELDS`/`mapRecord` o proteger el módulo 2
 * con `ifempty()`.
 *
 * ⚠ El bloque "Unidades" del formulario no tiene destino en SC-Edicion (el
 * escenario no mapea ninguna tabla de unidades). Hoy sus ediciones no
 * persisten; requiere una tanda de escenario aparte.
 */
