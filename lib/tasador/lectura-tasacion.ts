/**
 * Lectura de una tasación en la forma `Tasacion` — **módulo server-only**.
 *
 * Tanda P2-TAS.B · capa cliente. Es la contraparte de lectura que las pantallas
 * de IF-03 necesitan, y la fuente única de la proyección que sirven
 * `GET /api/tasaciones` y `GET /api/tasaciones/[id]`.
 *
 * ## Por qué no vive en `lib/tasaciones.ts` — enmienda a OV-4
 *
 * OV-4 fijó `@/lib/tasaciones` como hogar de los **tipos y catálogos** de IF-03,
 * para preservar la ruta de import del v0. Ese argumento no alcanza a un módulo
 * que lee Airtable: `lib/tasaciones.ts` lo importan componentes cliente
 * (`OPCIONES`, `CATEGORIAS_FOTO`, los tipos), así que meterle una lectura con
 * `AIRTABLE_TOKEN` arrastraría el token y el cliente REST al bundle del
 * navegador. OV-4 no cerró la ubicación de módulos server-only nuevos porque no
 * existían cuando se escribió.
 *
 * **Regla:** en `lib/tasaciones.ts` sólo entra lo que un componente cliente
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
import { etapaVigente } from '@/lib/sla-etapas'
import type { DatoPrellenado, EstadoBackend, Tasacion } from '@/lib/tasaciones'
import { autorizarSolicitud, type SolicitudFields } from './auth-guard'
import { TABLE_IDS } from './field-ids'
import { getUsuarioTasador, mockTasadorConfigurado } from './mock-user'

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
  const [comunas, catalogos] = await Promise.all([
    mapaComunas().catch((err) => {
      console.error('[lectura-tasacion] no se pudo leer M_Comunas', err)
      return new Map<string, string>()
    }),
    fetchCatalogos().catch((err) => {
      console.error('[lectura-tasacion] no se pudieron leer los catálogos', err)
      return null
    }),
  ])

  return {
    comunas,
    clientes: catalogos ? aMapa(catalogos.clientes) : new Map(),
    productos: catalogos ? aMapa(catalogos.productos) : new Map(),
    tiposPropiedad: catalogos ? aMapa(catalogos.tiposPropiedad) : new Map(),
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
 */
function fechaVisible(valor: unknown, sinFecha = 'Por agendar'): string {
  const crudo = typeof valor === 'string' ? valor.trim() : ''
  if (!crudo) return sinFecha

  const fecha = new Date(crudo)
  if (Number.isNaN(fecha.getTime())) return sinFecha

  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Envuelve un valor ya resuelto como dato pre-llenado desde la solicitud. */
function desdeSolicitud(valor: string): DatoPrellenado {
  return { valor: valor === VACIO ? '' : valor, fuente: 'solicitud' }
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
  maestros: MaestrosTasacion
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
     * proyecto. Mismo criterio que `lib/solicitudes.ts:717` en IF-02.
     */
    tipoPropiedad: f['tipo_propiedad_nuevo_usado'] === 'nuevo' ? 'nuevo' : 'usado',
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
       * ⚠ **Asunción declarada.** Sale de `vendedor_telefono` de
       * `TX_Solicitudes`, no de `TX_ContactosVisita`. Con RO-29 la coordinación
       * es telefónica y fuera del sistema, así que este número es el dato
       * operativo de la card — pero la tabla dedicada de contactos existe y
       * tiene varios por solicitud con su `ordenPrioridad`. Leerla por cada
       * card serían N lecturas extra en la cola. **P3-TAS decide** si la card
       * muestra el contacto prioritario real; hasta entonces, éste.
       */
      contactoTelefono: texto(f['vendedor_telefono'], ''),
      rolSii,
    },
    horasRestantes: undefined,
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
     * ⚠ En retirada — CI-012 cerrado por RO-29. Queda en `null` porque la
     * coordinación no se soporta por sistema: no hay tabla de la que leerlo.
     * `app/tasaciones/page.tsx` y `tasacion-card.tsx` todavía lo indexan;
     * P3-TAS lo elimina del tipo y de sus consumidores.
     */
    coordinacionVigente: null,
  }
}

/**
 * Lee una tasación por id, con el guard de RF-09 aplicado.
 *
 * Devuelve `null` tanto si no existe como si no es del tasador: la pantalla la
 * traduce a `notFound()` y así **no** distingue una de otra, que es la misma
 * garantía que da el guard en las rutas HTTP.
 */
export async function leerTasacion(id: string): Promise<Tasacion | null> {
  const guard = await autorizarSolicitud(id)
  if (!guard.ok) {
    if (guard.status === 500 || guard.status === 502) {
      console.error('[leerTasacion] fallo de infraestructura al leer', id, guard.status)
    }
    return null
  }

  const maestros = await leerMaestros()
  return proyectarTasacion(guard.solicitudId, guard.fields, maestros)
}

/** Una tasación de la cola, con la etapa de SLA que resolvió el motor. */
export interface TasacionEnCola extends Tasacion {
  /**
   * Etapa vigente según `lib/sla-etapas.ts`. `null` = el motor no pudo
   * resolverla y la UI pinta el badge neutro (CI-021). **IF-03 no calcula
   * plazos**: acá no hay aritmética de horas.
   */
  slaEtapa: ReturnType<typeof etapaVigente>
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
export async function leerCola(): Promise<TasacionEnCola[]> {
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

  return registros
    .filter(
      (r) => Array.isArray(r.fields.tasador) && r.fields.tasador.includes(usuario.recordId)
    )
    .map((r) => ({
      ...proyectarTasacion(r.id, r.fields, maestros),
      slaEtapa: etapaVigente(r.fields),
    }))
}
