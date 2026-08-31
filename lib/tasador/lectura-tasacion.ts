/**
 * Lectura de una tasación en la forma `Tasacion` — **módulo server-only**.
 *
 * Tanda P2-TAS.B · capa cliente. Es la contraparte de lectura que las pantallas
 * de IF-03 necesitan, y la fuente única de la proyección que sirven
 * `GET /api/tasaciones` y `GET /api/tasaciones/[id]`.
 *
 * ## Por qué no vive en `lib/tasador/tasaciones.ts` — enmienda a OV-4
 *
 * OV-4 fijó ese módulo como hogar de los **tipos y catálogos** de IF-03, para
 * preservar la ruta de import del v0. Ese argumento no alcanza a un módulo
 * que lee Airtable: `tasaciones.ts` lo importan componentes cliente
 * (`OPCIONES`, `CATEGORIAS_FOTO`, los tipos), así que meterle una lectura con
 * `AIRTABLE_TOKEN` arrastraría el token y el cliente REST al bundle del
 * navegador. OV-4 no cerró la ubicación de módulos server-only nuevos porque no
 * existían cuando se escribió.
 *
 * **Regla:** en `lib/tasador/tasaciones.ts` sólo entra lo que un componente cliente
 * puede importar sin riesgo. Todo lo que toque Airtable vive acá.
 *
 * ⚠ La separación es **por convención, no por `import 'server-only'`**: ese
 * paquete no está en `package.json` —sólo aparece como dependencia transitiva
 * de Next en el lockfile— y declararlo habría roto el «cero dependencias
 * nuevas» de la tanda. Es la misma garantía que tiene hoy `lib/solicitudes.ts`,
 * que lleva meses en producción: quien importe esto desde un componente
 * cliente rompe el build al arrastrar `lib/airtable-client`. Si algún día entra
 * `server-only` al proyecto, este archivo es el primero que debería usarlo.
 *
 * ## Una sola proyección, dos consumidores
 *
 * Los Server Components llaman `leerTasacion()` / `leerCola()` directo, que es
 * la convención probada de IF-02 (`app/(ejecutiva)/consola/page.tsx` llama
 * `fetchSolicitudes` de `lib/solicitudes.ts`, no su propia ruta HTTP). Los
 * Route Handlers llaman las mismas funciones. Así la pantalla y el API no
 * pueden divergir: es el mismo mapeo o ninguno.
 */

import { listRecords } from '@/lib/airtable-client'
import { fetchCatalogos } from '@/lib/catalogos'
import type { SlaTonoEtapa } from '@/lib/console-data'
import { obtenerMatrizEtapas } from '@/lib/sla-etapas'
import { etiquetaEtapa, nombresDeEtapas } from '@/lib/solicitudes'
import {
  direccionUnidad,
  SIN_FECHA_VISITA,
  type AdjuntoDropbox,
  type ContactoVisita,
  type DatoPrellenado,
  type EstadoBackend,
  type EstadoCoordinacion,
  type SlaEtapaSolicitud,
  type Tasacion,
  type UnidadSii,
} from '@/lib/tasador/tasaciones'
import { autorizarSolicitud, type SolicitudFields } from './auth-guard'
import { telefonosPrioritarios } from './contactos-cola'
import { TABLE_IDS } from './field-ids'
import { getUsuarioTasador, mockTasadorConfigurado } from './mock-user'
// CI-070 Fase 1: normalización de género del eje nuevo/usado (paliativo P-5).
import { normalizarTipoPropiedad } from './tipo-propiedad'

/**
 * Estados que el tasador ve en su cola.
 *
 * `pdf_listo` en adelante ya salió de sus manos; `creada` todavía no llegó.
 * `devuelta` no se incluye: está deprecado y ninguna pantalla lo renderiza.
 */
export const ESTADOS_EN_COLA = ['asignada', 'visitada', 'calculada'] as const

/** `M_Comunas`. No está en `fetchCatalogos()`, que cubre los otros cuatro maestros. */
const TABLA_COMUNAS = 'tblyggAfQfq682XHK'

const TTL_COMUNAS_MS = 5 * 60 * 1000

let cacheComunas: { valor: Map<string, string>; expira: number } | null = null

/**
 * recordId → nombre de comuna.
 *
 * Hace falta porque estas rutas **no** leen con `cellFormat: 'string'`. IF-02 sí
 * lo usa y por eso recibe los Link ya resueltos a texto; acá los campos llegan
 * como arrays de recordIds, y cambiar el `cellFormat` ahora convertiría en
 * string todo lo numérico que `/datos` y `/informe` ya mapean con su tipo real.
 * Resolver los cuatro maestros a mano es el cambio contenido; migrar el
 * `cellFormat` sería un refactor de la capa server entera.
 */
async function mapaComunas(): Promise<Map<string, string>> {
  const ahora = Date.now()
  if (cacheComunas && cacheComunas.expira > ahora) return cacheComunas.valor

  const registros = await listRecords<{ nombre?: string }>(TABLA_COMUNAS, {
    fields: ['nombre'],
  })

  const valor = new Map<string, string>()
  for (const r of registros) {
    const nombre = r.fields.nombre?.trim()
    if (nombre) valor.set(r.id, nombre)
  }

  cacheComunas = { valor, expira: ahora + TTL_COMUNAS_MS }
  return valor
}

/** Invalida la caché de comunas. Sólo para tests. */
export function _resetCacheComunas(): void {
  cacheComunas = null
}

/** Los cuatro maestros que hacen falta para resolver los Link de una solicitud. */
export interface MaestrosTasacion {
  comunas: Map<string, string>
  clientes: Map<string, string>
  productos: Map<string, string>
  tiposPropiedad: Map<string, string>
  /**
   * Rótulos de §5.2.4 por número de etapa, leídos de `C_SLA_Etapas`.
   *
   * **Ningún nombre de etapa se escribe en el repo** (RO-05): la píldora de la
   * card y la de la bandeja de IF-02 rotulan el mismo dato con el mismo texto
   * porque salen de la misma tabla. Vacío → `Etapa {n}`, que es feo y honesto.
   */
  nombresEtapa: ReadonlyMap<number, string>
}

function aMapa(opciones: { id: string; nombre: string }[]): Map<string, string> {
  return new Map(opciones.map((o) => [o.id, o.nombre]))
}

/**
 * Lee los maestros una vez por request. Ambos consumidores los comparten, así
 * que una cola de 20 solicitudes cuesta las mismas 4 lecturas que una sola —
 * y con la caché de 5 min de `fetchCatalogos()`, normalmente ninguna.
 *
 * Si un maestro falla, se degrada a mapa vacío en vez de tumbar la pantalla: el
 * campo sale como `—` y el resto de la tasación sigue siendo legible.
 */
export async function leerMaestros(): Promise<MaestrosTasacion> {
  const [comunas, catalogos, nombresEtapa] = await Promise.all([
    mapaComunas().catch((err) => {
      console.error('[lectura-tasacion] no se pudo leer M_Comunas', err)
      return new Map<string, string>()
    }),
    fetchCatalogos().catch((err) => {
      console.error('[lectura-tasacion] no se pudieron leer los catálogos', err)
      return null
    }),
    obtenerMatrizEtapas()
      .then(nombresDeEtapas)
      .catch((err) => {
        console.warn('[lectura-tasacion] C_SLA_Etapas ilegible; etapa sin rótulo', err)
        return new Map<number, string>()
      }),
  ])

  return {
    comunas,
    clientes: catalogos ? aMapa(catalogos.clientes) : new Map(),
    productos: catalogos ? aMapa(catalogos.productos) : new Map(),
    tiposPropiedad: catalogos ? aMapa(catalogos.tiposPropiedad) : new Map(),
    nombresEtapa,
  }
}

/** Placeholder de campo sin dato. Mismo literal que usa la consola de IF-02. */
const VACIO = '—'

/**
 * Resuelve un campo Link a su nombre.
 *
 * Un Link llega como array de recordIds. Cuando el maestro no tiene la fila
 * —catálogo inactivo, o la lectura del maestro falló— se devuelve el
 * placeholder en vez del `recXXXXXXXXXXXXXX` crudo: un recordId en pantalla es
 * ruido que el tasador no puede interpretar.
 */
function nombreDeLink(valor: unknown, maestro: Map<string, string>): string {
  if (!Array.isArray(valor) || valor.length === 0) return VACIO

  const nombres = valor
    .map((id) => (typeof id === 'string' ? maestro.get(id) : undefined))
    .filter((n): n is string => Boolean(n))

  return nombres.length > 0 ? nombres.join(', ') : VACIO
}

function texto(valor: unknown, porDefecto = VACIO): string {
  if (valor === null || valor === undefined) return porDefecto
  const s = String(valor).trim()
  return s === '' ? porDefecto : s
}

/**
 * Fecha para mostrar, en formato chileno. Devuelve el literal de §6 cuando no
 * hay fecha — la ausencia de visita agendada es un estado normal, no un error.
 *
 * ## Por qué el mediodía y no la medianoche
 *
 * `fecha_visita_programada` es un campo `date` de Airtable: llega como
 * `"2026-08-18"`, sin hora. `new Date("2026-08-18")` lo interpreta como
 * **medianoche UTC**, y al formatearlo en un huso al oeste de Greenwich —el de
 * Chile, sin ir más lejos— retrocede al día anterior: la visita del 18 se
 * mostraba **17-08-2026**. Es un bug de los que no se ven en el código sino en
 * la pantalla, y en esta pantalla manda al tasador a la propiedad el día
 * equivocado.
 *
 * Anclar a las 12:00 **locales** (sin `Z`) deja el día a salvo de cualquier
 * huso entre −12 y +12. Es la misma solución que `parseDate` de
 * `lib/solicitudes.ts:419` en IF-02, que resolvió lo mismo antes: se copia el
 * criterio, no se inventa otro.
 */
function fechaVisible(valor: unknown, sinFecha: string = SIN_FECHA_VISITA): string {
  const crudo = typeof valor === 'string' ? valor.trim() : ''
  if (!crudo) return sinFecha

  const soloFecha = /^\d{4}-\d{2}-\d{2}/.exec(crudo)
  const fecha = soloFecha ? new Date(`${soloFecha[0]}T12:00:00`) : new Date(crudo)
  if (Number.isNaN(fecha.getTime())) return sinFecha

  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Sólo para el test del desfase de huso. No tiene otros consumidores. */
export const _fechaVisible = fechaVisible

/**
 * Desenlace de la última coordinación (`TX_Solicitudes.coordinacion_vigente`,
 * `fldI4Dv0jpRQvbdHl`). Es el discriminante de `AccionCard` (gate T-A · §2.4) y
 * del chip "Por coordinar" (CI-045 · CI-048).
 *
 * ⚠ **No es fórmula**: lo escribe el Route Handler de coordinación en el mismo
 * PATCH que cierra el intento (`coordinacion/route.ts`), con valores
 * `confirmada`/`rechazada`/`""`. Acá **no se recalcula ni se deriva de los
 * intentos** — sólo se normaliza lo que la base guardó.
 *
 * La normalización es **cerrada a propósito**: sólo los dos literales del
 * contrato pasan; `""`, ausente o cualquier otra cosa → `null`. Igual criterio
 * que `proyectarSlaEtapa` con el tono (RO-05 · RO-13): un valor fuera del
 * contrato se trata como "no hay dato", no como un estado inventado que dejaría
 * entrar a la captura una solicitud sin coordinar.
 */
function coordinacionVigente(valor: unknown): EstadoCoordinacion | null {
  return valor === 'confirmada' || valor === 'rechazada' ? valor : null
}

/** Sólo para el test de normalización del gate. No tiene otros consumidores. */
export const _coordinacionVigente = coordinacionVigente

/** Envuelve un valor ya resuelto como dato pre-llenado desde la solicitud. */
function desdeSolicitud(valor: string): DatoPrellenado {
  return { valor: valor === VACIO ? '' : valor, fuente: 'solicitud' }
}

/* -------------------------------------------------------------------------
 * Reloj por etapa (RF-53 · CI-021)
 * ---------------------------------------------------------------------- */

const TONOS_ETAPA: readonly SlaTonoEtapa[] = ['verde', 'ambar', 'rojo', 'sin_dato']

/**
 * Lee el tono **tal cual** lo emitió la fórmula `sla_semaforo_etapa`
 * (`fldB6gJ3clZUPgaZk`), por igualdad literal contra los cuatro valores del
 * contrato. No normaliza, no baja a minúsculas y **no recalcula**: si la
 * fórmula emitiera otra cosa, lo correcto es que se note como `sin_dato` y no
 * que el mapper lo disimule. Recalcular el tono acá sería la segunda fuente de
 * verdad que RO-05 prohíbe.
 *
 * Es el mismo criterio de `lib/solicitudes.ts` (RO-13 · §9.6-R5). Se reescribe
 * en vez de importarse porque allá es privado y la autorización R5-E de esta
 * tanda alcanzó a una sola función; el tipo `SlaTonoEtapa` es compartido, así
 * que una divergencia de dominio la caza `tsc`.
 */
function tonoDeFormula(valor: unknown): SlaTonoEtapa {
  const v = typeof valor === 'string' ? valor.trim() : ''
  return (TONOS_ETAPA as readonly string[]).includes(v) ? (v as SlaTonoEtapa) : 'sin_dato'
}

/** Instante ISO del formato JSON de Airtable. Cualquier otra cosa es `null`. */
function instante(valor: unknown): Date | null {
  if (typeof valor !== 'string' || valor.trim() === '') return null
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

function esNumeroEtapa(n: unknown): n is SlaEtapaSolicitud['numero'] {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 7
}

/**
 * Proyecta el reloj por etapa de una solicitud. **Pura y sin aritmética de
 * plazos**: los catorce umbrales viven en `C_SLA_Etapas` y el motor ya los
 * materializó en `sla_etapa_alerta_ts` y `sla_etapa_vence_ts`; acá sólo se
 * formatea la distancia a un instante ya calculado.
 *
 * Devuelve `undefined` —y no un objeto neutro— cuando `sla_etapa_actual` está
 * vacío. La señal de "hay dato de etapa" es ese campo, no el semáforo: sin él
 * la card no pinta píldora, que es distinto de pintarla gris. Es la misma regla
 * que la bandeja de IF-02, y la razón por la que la cartera de v1.9 —donde sólo
 * e1 y e2 tienen escritor— no muestra verdes que la base no respalda.
 *
 * Cuando **sí** hay etapa pero sus umbrales no están materializados, el tono
 * viaja como `sin_dato`: «estoy en la etapa 3 y no sé su plazo» es información
 * distinta de «no sé nada de esta solicitud».
 *
 * @param ahora Inyectable para que el test no dependa del reloj de pared.
 */
export function proyectarSlaEtapa(
  f: SolicitudFields,
  nombresEtapa: ReadonlyMap<number, string>,
  ahora: Date = new Date()
): SlaEtapaSolicitud | undefined {
  const numero = f['sla_etapa_actual']
  if (!esNumeroEtapa(numero)) return undefined

  const alerta = instante(f['sla_etapa_alerta_ts'])
  const vence = instante(f['sla_etapa_vence_ts'])

  return {
    numero,
    nombre: nombresEtapa.get(numero) ?? `Etapa ${numero}`,
    tono: tonoDeFormula(f['sla_semaforo_etapa']),
    etiqueta: etiquetaEtapa(vence, ahora),
    alertaTs: alerta ? alerta.toISOString() : null,
    venceTs: vence ? vence.toISOString() : null,
  }
}

/**
 * Mapea una fila de `TX_Solicitudes` a la forma que consumen las pantallas.
 *
 * Es pura: recibe los maestros ya leídos. Eso permite proyectar una cola entera
 * sin una lectura de catálogo por fila.
 */
export function proyectarTasacion(
  id: string,
  f: SolicitudFields,
  maestros: MaestrosTasacion,
  contactoTelefono: string | null = null
): Tasacion {
  const comuna = nombreDeLink(f['comuna'], maestros.comunas)
  const tipo = nombreDeLink(f['tipo_propiedad'], maestros.tiposPropiedad)
  const cliente = nombreDeLink(f['cliente'], maestros.clientes)
  const direccion = texto(f['direccion'])
  const rolSii = texto(f['rol_sii'], '')

  return {
    id,
    codigo: texto(f['codigo_solicitud'], ''),
    estado: (f['estado'] as EstadoBackend) ?? 'asignada',
    comuna,
    tipo,
    /**
     * `tipo_propiedad_nuevo_usado` decide la forma del formulario. El dominio
     * real es `nuevo · usado`; cualquier otra cosa —vacío incluido— cae a
     * `usado`, que es el caso mayoritario y el que no muestra el bloque de
     * proyecto. Mismo criterio que `lib/solicitudes.ts` en IF-02.
     *
     * CI-070: el DTO habla femenino canónico; `normalizarTipoPropiedad` sanea la
     * entrada (ya no traduce género tras Fase 3). El default a 'usada' preserva
     * la semántica previa de «no declarado → usado» (el tratamiento fino del null
     * es alcance de CI-069).
     */
    tipoPropiedad:
      normalizarTipoPropiedad(f['tipo_propiedad_nuevo_usado']) === 'nueva' ? 'nueva' : 'usada',
    direccion,
    cliente,
    producto: nombreDeLink(f['producto'], maestros.productos),
    /** Regla T-B: es la fecha **planificada**, nunca la real. */
    visita: fechaVisible(f['fecha_visita_programada']),
    /**
     * ⚠ **Sin origen — CI-024.** La versión del informe vive en
     * `TX_DocumentosGenerados`, cuyo Link `solicitud` está vacío en todas las
     * filas, así que no hay forma de casarla con esta solicitud. `GET /informe`
     * ya devuelve `versionVigente: null` por la misma razón. Se deja en 0 —el
     * valor que el v0 mostraba antes de existir el pipeline— y P9-TAS lo cablea
     * cuando el dueño de E1/E2/E3 pueble el Link.
     */
    version: 0,
    datos: {
      comuna: desdeSolicitud(comuna),
      tipo: desdeSolicitud(tipo),
      direccion: desdeSolicitud(direccion),
      cliente: desdeSolicitud(cliente),
    },
    datosEjecutiva: {
      /**
       * ✅ **CI-035 cerrada en P3-TAS.A.** Es el contacto de prioridad 1 de
       * `TX_ContactosVisita`, resuelto por `telefonosPrioritarios()` en **una**
       * lectura para toda la cola gracias al lookup `solicitud_record_id`. Ya
       * no es `vendedor_telefono`, que era una aproximación sin respaldo en
       * ningún RF y que en el único caso real de la cola venía vacío.
       */
      contactoTelefono,
      rolSii,
    },
    slaEtapa: proyectarSlaEtapa(f, maestros.nombresEtapa),
    fechaAsignacion: typeof f['fecha_asignacion_ts'] === 'string' ? f['fecha_asignacion_ts'] : undefined,
    fechaSolicitud: typeof f['fecha_solicitud'] === 'string' ? f['fecha_solicitud'] : undefined,
    proyecto: texto(f['proyecto_condominio'], ''),
    observaciones: texto(f['observaciones_internas'], ''),
    valorEstimadoUf:
      typeof f['monto_estimado_uf'] === 'number' ? f['monto_estimado_uf'] : undefined,
    pdfUrl: typeof f['pdf_final_url'] === 'string' ? f['pdf_final_url'] : undefined,
    vendedor: {
      nombre: texto(f['vendedor_razon_social_o_nombre'], ''),
      rut: texto(f['vendedor_rut'], ''),
    },
    /**
     * Discriminante del gate de coordinación (Regla T-A · §2.4) y del chip
     * "Por coordinar" (CI-045). `leerCola()` no restringe `fields`, así que el
     * campo llega en `f` sin pedirlo aparte.
     */
    coordinacionVigente: coordinacionVigente(f['coordinacion_vigente']),
  }
}

/**
 * Lee una tasación por id, con el guard de RF-09 aplicado.
 *
 * Devuelve `null` tanto si no existe como si no es del tasador: la pantalla la
 * traduce a `notFound()` y así **no** distingue una de otra, que es la misma
 * garantía que da el guard en las rutas HTTP.
 */
/* -------------------------------------------------------------------------
 * Detalle de la solicitud · sólo Pantalla 2 (§2.3)
 *
 * Las tres lecturas de abajo alimentan los bloques Propiedad, Personas y
 * Adjuntos de la pantalla de coordinación. **No entran en `proyectarTasacion`**
 * y por tanto **no las paga `leerCola()`**: son tres requests más por
 * solicitud, y la cola es la pantalla que más se abre del flujo. Multiplicarlas
 * por cada card sería exactamente el coste que `contactos-cola.ts` evitó al
 * resolver toda la cola en una sola lectura.
 *
 * Las tres degradan a lista vacía ante un fallo, nunca a excepción: la pantalla
 * de coordinación sigue siendo usable —el tasador tiene que poder registrar el
 * resultado del llamado— aunque no se haya podido pintar un bloque de resumen.
 * ---------------------------------------------------------------------- */

/**
 * Filtro por el lookup `solicitud_record_id`, con el recordId delimitado por
 * comas a ambos lados.
 *
 * Es el patrón de `telefonosPrioritarios`: el **Link** se evalúa contra el
 * primary field de la tabla destino, no contra el recordId (lección E-018), así
 * que se filtra por el lookup. Las comas evitan el match parcial el día que dos
 * identificadores compartan prefijo.
 */
function filtroPorSolicitud(solicitudId: string): string {
  return `FIND(",${solicitudId},", "," & ARRAYJOIN({solicitud_record_id}, ",") & ",") > 0`
}

interface UnidadFields {
  subtipo?: string
  rol_sii?: string
  sup_m2?: number
  numero_unidad?: string
  orden?: number
}

/**
 * Unidades tasables de la solicitud, ordenadas por `orden` (§2.3).
 *
 * El criterio de aceptación de RF-TAS-03 es explícito: *"la tabla de unidades
 * muestra un Rol SII por unidad, no uno por solicitud"*. Antes de P4-TAS la
 * pantalla caía a `datosEjecutiva.rolSii`, que es uno solo.
 *
 * `direccion` **se deriva**, no se lee: `TX_Unidades` no tiene ese campo.
 */
async function leerUnidades(solicitudId: string): Promise<UnidadSii[]> {
  let registros
  try {
    registros = await listRecords<UnidadFields>(TABLE_IDS.unidades, {
      fields: ['subtipo', 'rol_sii', 'sup_m2', 'numero_unidad', 'orden'],
      filterByFormula: filtroPorSolicitud(solicitudId),
    })
  } catch (err) {
    console.error('[leerUnidades] no se pudo leer TX_Unidades', solicitudId, err)
    return []
  }

  return registros
    .slice()
    .sort((a, b) => (a.fields.orden ?? Infinity) - (b.fields.orden ?? Infinity))
    .map(({ fields }) => ({
      numero: (fields.numero_unidad ?? '').trim(),
      rolSii: (fields.rol_sii ?? '').trim(),
      superficieM2: typeof fields.sup_m2 === 'number' ? fields.sup_m2 : 0,
      direccion: direccionUnidad(fields.subtipo, fields.numero_unidad),
    }))
}

interface ContactoDetalleFields {
  nombre?: string
  rol?: string
  telefono?: string
  email?: string
  estado_contacto?: string
  orden_prioridad?: number
}

/**
 * Contactos de visita de la solicitud, ordenados por `orden_prioridad`.
 *
 * ⚠ **No es lo mismo que `telefonosPrioritarios`** y por eso no lo reutiliza:
 * aquélla resuelve **un teléfono** para toda una cola y descarta los contactos
 * marcados `telefono_erroneo`. Acá hace falta la **lista completa** —nombre,
 * rol, teléfono y email de cada uno—, y un contacto con teléfono erróneo
 * **sigue mostrándose**: es justamente al que el tasador no debe llamar, y
 * ocultarlo le haría buscarlo. La card de la cola y esta pantalla responden dos
 * preguntas distintas sobre la misma tabla.
 */
async function leerContactos(solicitudId: string): Promise<ContactoVisita[]> {
  let registros
  try {
    registros = await listRecords<ContactoDetalleFields>(TABLE_IDS.contactosVisita, {
      fields: ['nombre', 'rol', 'telefono', 'email', 'estado_contacto', 'orden_prioridad'],
      filterByFormula: filtroPorSolicitud(solicitudId),
    })
  } catch (err) {
    console.error('[leerContactos] no se pudo leer TX_ContactosVisita', solicitudId, err)
    return []
  }

  return registros
    .slice()
    .sort(
      (a, b) =>
        (a.fields.orden_prioridad ?? Infinity) - (b.fields.orden_prioridad ?? Infinity)
    )
    .map(({ id, fields }) => ({
      id,
      nombre: (fields.nombre ?? '').trim(),
      rol: (fields.rol ?? '').trim(),
      telefono: (fields.telefono ?? '').trim(),
      email: (fields.email ?? '').trim(),
      estado: (fields.estado_contacto ?? '').trim(),
      ordenPrioridad:
        typeof fields.orden_prioridad === 'number' ? fields.orden_prioridad : undefined,
    }))
}

interface AdjuntoFields {
  nombre_archivo?: string
  url_dropbox?: string
  tamanio_kb?: number
}

/**
 * Adjuntos de la solicitud, por recordId.
 *
 * ⚠ **No usa `solicitud_record_id`: `TX_Adjuntos` no tiene ese lookup.** En su
 * lugar recibe los recordIds del Link `TX_Adjuntos` de la propia solicitud —que
 * el guard ya leyó— y filtra por `RECORD_ID()`. Es exacto y no depende del
 * primary field, que es la trampa de E-018. La alternativa sería crear el
 * lookup en Airtable; no se hizo porque esta vía no lo necesita.
 */
async function leerAdjuntos(adjuntoIds: readonly string[]): Promise<AdjuntoDropbox[]> {
  const ids = [...new Set(adjuntoIds)].filter((id) => id.startsWith('rec'))
  if (ids.length === 0) return []

  let registros
  try {
    registros = await listRecords<AdjuntoFields>(TABLE_IDS.adjuntos, {
      fields: ['nombre_archivo', 'url_dropbox', 'tamanio_kb'],
      filterByFormula: `OR(${ids.map((id) => `RECORD_ID()="${id}"`).join(', ')})`,
    })
  } catch (err) {
    console.error('[leerAdjuntos] no se pudo leer TX_Adjuntos', err)
    return []
  }

  return registros
    .filter(({ fields }) => (fields.nombre_archivo ?? '').trim() !== '')
    .map(({ fields }) => ({
      nombre: (fields.nombre_archivo ?? '').trim(),
      url: (fields.url_dropbox ?? '').trim(),
      /**
       * `tamanio_kb` está en **kilobytes** y `AdjuntoDropbox.sizeBytes` en
       * bytes. La conversión va acá y no en la vista: el tipo dice `Bytes` y
       * tiene que ser cierto.
       */
      sizeBytes:
        typeof fields.tamanio_kb === 'number' ? Math.round(fields.tamanio_kb * 1024) : 0,
    }))
}

/** recordIds del Link `TX_Adjuntos` de la solicitud, si vinieron en la lectura. */
function idsDeLink(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === 'string') : []
}

export async function leerTasacion(id: string): Promise<Tasacion | null> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) {
    if (guard.status === 500 || guard.status === 502) {
      console.error('[leerTasacion] fallo de infraestructura al leer', id, guard.status)
    }
    return null
  }

  const [maestros, telefonos, unidades, contactos, adjuntosDropbox] = await Promise.all([
    leerMaestros(),
    telefonosPrioritarios([guard.solicitudId]),
    leerUnidades(guard.solicitudId),
    leerContactos(guard.solicitudId),
    leerAdjuntos(idsDeLink(guard.fields['TX_Adjuntos'])),
  ])

  const tasacion = proyectarTasacion(
    guard.solicitudId,
    guard.fields,
    maestros,
    telefonos.get(guard.solicitudId) ?? null
  )

  /**
   * El detalle se añade **sobre** la proyección compartida en vez de dentro de
   * ella: `leerCola()` usa la misma `proyectarTasacion` y no debe pagar estas
   * tres lecturas. Las claves ausentes quedan como arrays vacíos, que es lo que
   * la pantalla ya sabe renderizar.
   */
  return { ...tasacion, unidades, contactos, adjuntosDropbox }
}

/**
 * Cola personal del tasador.
 *
 * La pertenencia se comprueba sobre el array de recordIds y no en la fórmula:
 * el Link `tasador` se evalúa contra el primary field de `M_Tasadores`, no
 * contra el recordId (lección E-018).
 *
 * Devuelve `[]` si el mock no está configurado, tras loguearlo. La cola vacía
 * es un estado que la pantalla ya sabe renderizar; una excepción acá tumbaría
 * el Server Component entero.
 */
export async function leerCola(): Promise<Tasacion[]> {
  const usuario = getUsuarioTasador()

  if (!mockTasadorConfigurado()) {
    console.error(
      '[leerCola] TASADOR_MOCK_RECORD_ID no está definida. ' +
        'Definirla en .env.local con un registro real de M_Tasadores.'
    )
    return []
  }

  const filtroEstados = ESTADOS_EN_COLA.map((e) => `{estado}="${e}"`).join(',')

  const [registros, maestros] = await Promise.all([
    listRecords<SolicitudFields>(TABLE_IDS.solicitudes, {
      filterByFormula: `OR(${filtroEstados})`,
      'sort[0][field]': 'fecha_asignacion_ts',
      'sort[0][direction]': 'desc',
    }),
    leerMaestros(),
  ])

  const mias = registros.filter(
    (r) => Array.isArray(r.fields.tasador) && r.fields.tasador.includes(usuario.recordId)
  )

  /**
   * Una sola lectura de `TX_ContactosVisita` para toda la cola, después de
   * filtrar por pertenencia: no se piden los contactos de solicitudes ajenas.
   */
  const telefonos = await telefonosPrioritarios(mias.map((r) => r.id))

  return mias.map((r) =>
    proyectarTasacion(r.id, r.fields, maestros, telefonos.get(r.id) ?? null)
  )
}
