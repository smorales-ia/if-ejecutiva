"use client"

/**
 * Cola offline de fotos de la visita — **IndexedDB**, no `localStorage`.
 *
 * Plan IF-03 §6.1 (*"retry offline (cola local IndexedDB)"*) · §0.2 · spec
 * §2.6. Creada en **P5-TAS (B4)**.
 *
 * ## Por qué IndexedDB y por qué esto no contradice a `tasador-store`
 *
 * `localStorage` guarda **strings** y tiene un techo de ~5 MB por origen: una
 * sola foto de teléfono en base64 lo llena. IndexedDB guarda `Blob` sin
 * convertir a texto y no tiene ese techo. §0.2 lo pide por escrito y ésta es la
 * razón material.
 *
 * `lib/tasador/tasador-store.ts` **sí** usa `localStorage` y está bien: guarda
 * el borrador del formulario, que son campos de texto, y es una excepción
 * declarada. Son dos almacenes con dos contenidos distintos, no una
 * inconsistencia.
 *
 * ## Qué garantiza y qué no
 *
 * Garantiza que una foto tomada sin señal **no se pierde**: queda en disco del
 * navegador con todo lo necesario para reintentarla. No garantiza entrega —
 * nada del lado del cliente puede—, y por eso la pantalla muestra las
 * pendientes como tales en vez de contarlas como subidas.
 *
 * ## Degradación
 *
 * Todo el módulo devuelve valores neutros —`null`, `[]`, `false`— cuando
 * IndexedDB no está disponible (modo privado, almacenamiento bloqueado, SSR).
 * Nunca lanza: una foto que no se puede encolar es una foto que no se sube, y
 * eso lo dice la interfaz; no puede además tumbar la pantalla.
 */

const DB_NOMBRE = "vp-tasador-fotos"
const DB_VERSION = 1
const STORE = "pendientes"
const INDICE_SOLICITUD = "por-solicitud"

/** Una foto esperando su turno de subida. */
export interface FotoEnCola {
  /** Id local `cola-<uuid>`. Se sustituye por el record ID al subir. */
  id: string
  solicitudId: string
  codigoExt: string
  categoria: string
  nombre: string
  mimeType: string
  /** El binario tal cual. IndexedDB almacena `Blob` sin serializar a texto. */
  blob: Blob
  creadoEn: string
  /** Reintentos ya consumidos. Sólo informativo: no hay tope de descarte. */
  intentos: number
}

function idLocal(): string {
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `cola-${aleatorio}`
}

/** `true` mientras la foto vive sólo en la cola (§ id local, no record ID). */
export function esIdDeCola(id: string): boolean {
  return id.startsWith("cola-")
}

function abrir(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null)
      return
    }

    let peticion: IDBOpenDBRequest
    try {
      peticion = indexedDB.open(DB_NOMBRE, DB_VERSION)
    } catch (err) {
      console.warn("[cola-fotos] IndexedDB no disponible", err)
      resolve(null)
      return
    }

    peticion.onupgradeneeded = () => {
      const db = peticion.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" })
        // El índice existe para no barrer toda la cola cuando el tasador tiene
        // varias tasaciones abiertas: cada pantalla drena sólo lo suyo.
        store.createIndex(INDICE_SOLICITUD, "solicitudId", { unique: false })
      }
    }

    peticion.onsuccess = () => resolve(peticion.result)
    peticion.onerror = () => {
      console.warn("[cola-fotos] no se pudo abrir la base", peticion.error)
      resolve(null)
    }
    // Otra pestaña bloqueando un upgrade: no se espera indefinidamente.
    peticion.onblocked = () => resolve(null)
  })
}

function conTransaccion<T>(
  modo: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return abrir().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) {
          resolve(null)
          return
        }
        try {
          const tx = db.transaction(STORE, modo)
          const peticion = fn(tx.objectStore(STORE))
          peticion.onsuccess = () => resolve(peticion.result)
          peticion.onerror = () => {
            console.warn("[cola-fotos] operación fallida", peticion.error)
            resolve(null)
          }
          tx.oncomplete = () => db.close()
        } catch (err) {
          console.warn("[cola-fotos] transacción fallida", err)
          resolve(null)
        }
      }),
  )
}

/**
 * Guarda una foto para subirla más tarde. Devuelve su id local, o `null` si el
 * almacenamiento no está disponible — en cuyo caso la foto **no** se encoló y
 * el llamador debe decirlo.
 */
export async function encolarFoto(entrada: {
  solicitudId: string
  codigoExt: string
  categoria: string
  file: File
}): Promise<FotoEnCola | null> {
  const registro: FotoEnCola = {
    id: idLocal(),
    solicitudId: entrada.solicitudId,
    codigoExt: entrada.codigoExt,
    categoria: entrada.categoria,
    nombre: entrada.file.name,
    mimeType: entrada.file.type || "application/octet-stream",
    blob: entrada.file,
    creadoEn: new Date().toISOString(),
    intentos: 0,
  }

  const guardado = await conTransaccion("readwrite", (store) => store.put(registro))
  return guardado === null ? null : registro
}

/** Pendientes de una tasación, en orden de llegada. */
export async function listarPendientes(solicitudId: string): Promise<FotoEnCola[]> {
  const todas = await conTransaccion<FotoEnCola[]>("readonly", (store) =>
    store.index(INDICE_SOLICITUD).getAll(solicitudId),
  )
  if (!todas) return []
  return [...todas].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
}

export async function eliminarDeCola(id: string): Promise<void> {
  await conTransaccion("readwrite", (store) => store.delete(id))
}

/** Suma un intento fallido, para que la interfaz pueda decir «reintentando». */
export async function marcarIntento(registro: FotoEnCola): Promise<void> {
  await conTransaccion("readwrite", (store) =>
    store.put({ ...registro, intentos: registro.intentos + 1 }),
  )
}

export interface ResultadoDrenaje {
  subidas: number
  pendientes: number
}

/**
 * Las tres operaciones que el drenaje necesita del almacén.
 *
 * Existe como parámetro —con las de IndexedDB por defecto— para que la política
 * de drenaje se pueda ejercitar sin un navegador. La decisión de qué hacer ante
 * cada desenlace es la parte que puede equivocarse; abrir una base de datos no.
 */
export interface AlmacenCola {
  listar: (solicitudId: string) => Promise<FotoEnCola[]>
  eliminar: (id: string) => Promise<void>
  marcar: (registro: FotoEnCola) => Promise<void>
}

const ALMACEN_INDEXEDDB: AlmacenCola = {
  listar: listarPendientes,
  eliminar: eliminarDeCola,
  marcar: marcarIntento,
}

/**
 * Intenta subir todo lo encolado de una tasación.
 *
 * ## Secuencial a propósito
 *
 * Se sube de a una. La cola existe porque la conexión es mala; lanzar cinco
 * subidas en paralelo sobre un enlace que apenas sostiene una las hace fallar a
 * todas y multiplica los reintentos. `uploadEnLotes` con concurrencia 3 es lo
 * correcto en la oficina, no en terreno.
 *
 * ## Un fallo reintentable detiene el drenaje
 *
 * Casi siempre significa que la conexión volvió a caerse, y seguir intentando
 * con las demás sólo gasta batería. Las que ya subieron salieron de la cola, así
 * que reanudar no repite trabajo.
 *
 * Un fallo **no** reintentable descarta esa foto de la cola —si el archivo
 * excede el límite o el path es irresoluble, reintentarlo eternamente no lo
 * arregla— y el drenaje continúa con las siguientes.
 */
export async function drenarCola(
  solicitudId: string,
  subir: (registro: FotoEnCola) => Promise<{ ok: boolean; reintentable: boolean }>,
  almacen: AlmacenCola = ALMACEN_INDEXEDDB,
): Promise<ResultadoDrenaje> {
  const pendientes = await almacen.listar(solicitudId)
  let subidas = 0

  for (let i = 0; i < pendientes.length; i++) {
    const registro = pendientes[i]
    const resultado = await subir(registro)

    if (resultado.ok) {
      await almacen.eliminar(registro.id)
      subidas += 1
      continue
    }

    if (!resultado.reintentable) {
      await almacen.eliminar(registro.id)
      continue
    }

    await almacen.marcar(registro)
    // Quedan `i` en adelante, incluida ésta: las anteriores ya salieron de la
    // cola, por subida o por descarte.
    return { subidas, pendientes: pendientes.length - i }
  }

  return { subidas, pendientes: 0 }
}

/** Reconstruye el `File` que se encoló, para volver a pasarlo al uploader. */
export function archivoDeCola(registro: FotoEnCola): File {
  return new File([registro.blob], registro.nombre, { type: registro.mimeType })
}
