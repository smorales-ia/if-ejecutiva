import SparkMD5 from 'spark-md5'

/**
 * Utilidades de subida de adjuntos (Fase Adjuntos 1, D-11 a D-14). No importa
 * nada de Next/React — server-safe y testeable en aislamiento.
 */

export interface UploadResult {
  ok: boolean
  adjunto_id?: string | number
  url_dropbox?: string
  nombre_archivo?: string
  tamanio_kb?: number
  reused?: boolean
  error?: string
  reintentable?: boolean
}

export interface UploadUnArchivoParams {
  file: File
  solicitud_id: string
  codigo_ext: string
  /** Código de D_TipoDocumento (ej. "permiso_edificacion") si el archivo viene del checklist; vacío si es un adjunto suelto. */
  tipo_documento?: string
  subido_por?: string
  onProgress?: (pct: number) => void
  signal?: AbortSignal
}

const MENSAJE_ERROR_RED =
  'No pudimos completar la acción. Intenta nuevamente en unos segundos.'

/** SubtleCrypto no expone MD5 nativo — spark-md5 calcula por chunks sin cargar todo el archivo en un solo string. */
export function calcularMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    let cursor = 0

    reader.onerror = () => reject(new Error('No se pudo leer el archivo para calcular el hash.'))
    reader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer)
      cursor += 1
      if (cursor < chunks) {
        leerSiguiente()
      } else {
        resolve(spark.end())
      }
    }

    function leerSiguiente() {
      const start = cursor * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(start, end))
    }

    leerSiguiente()
  })
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.onload = () => {
      const result = reader.result as string
      // data:<mime>;base64,<contenido> -- solo interesa lo que viene tras la coma.
      const base64 = result.slice(result.indexOf(',') + 1)
      resolve(base64)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Sube un archivo vía XMLHttpRequest (no fetch) para tener progreso real de
 * upload (`upload.onprogress`) — fetch no expone progreso de subida nativo.
 */
export async function uploadUnArchivo(params: UploadUnArchivoParams): Promise<UploadResult> {
  const {
    file,
    solicitud_id,
    codigo_ext,
    tipo_documento,
    subido_por = 'Ejecutivo',
    onProgress,
    signal,
  } = params

  if (signal?.aborted) {
    return { ok: false, error: 'Subida cancelada.', reintentable: false }
  }

  let hash_md5: string
  let contenido_base64: string
  try {
    ;[hash_md5, contenido_base64] = await Promise.all([calcularMD5(file), fileToBase64(file)])
  } catch {
    return { ok: false, error: MENSAJE_ERROR_RED, reintentable: true }
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/adjuntos/upload')
    xhr.setRequestHeader('Content-Type', 'application/json')

    const onAbort = () => {
      xhr.abort()
    }
    signal?.addEventListener('abort', onAbort)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort)
      let data: UploadResult | undefined
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        data = undefined
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.ok) {
        onProgress?.(100)
        resolve(data)
      } else {
        resolve(
          data ?? { ok: false, error: MENSAJE_ERROR_RED, reintentable: xhr.status !== 413 }
        )
      }
    }

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve({ ok: false, error: MENSAJE_ERROR_RED, reintentable: true })
    }

    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve({ ok: false, error: 'Subida cancelada.', reintentable: false })
    }

    xhr.send(
      JSON.stringify({
        solicitud_id,
        codigo_ext,
        tipo_documento,
        nombre_archivo: file.name,
        mime_type: file.type || 'application/octet-stream',
        tamanio_kb: Math.round(file.size / 1024),
        hash_md5,
        subido_por,
        contenido_base64,
      })
    )
  })
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const BACKOFF_MS = [0, 2000, 5000]

/** 3 intentos con backoff 0s / 2s / 5s (D-14.2). Corta de inmediato si el error no es reintentable. */
export async function uploadConReintentos(
  params: UploadUnArchivoParams,
  maxIntentos = 3
): Promise<UploadResult> {
  let ultimoResultado: UploadResult = { ok: false, error: MENSAJE_ERROR_RED, reintentable: true }

  for (let intento = 0; intento < maxIntentos; intento++) {
    if (params.signal?.aborted) {
      return { ok: false, error: 'Subida cancelada.', reintentable: false }
    }

    const espera = BACKOFF_MS[Math.min(intento, BACKOFF_MS.length - 1)]
    if (espera > 0) await esperar(espera)

    if (params.signal?.aborted) {
      return { ok: false, error: 'Subida cancelada.', reintentable: false }
    }

    ultimoResultado = await uploadUnArchivo(params)
    if (ultimoResultado.ok) return ultimoResultado
    if (ultimoResultado.reintentable === false) return ultimoResultado
  }

  return ultimoResultado
}

export interface ProgresoGlobal {
  archivosCompletados: number
  totalArchivos: number
  errores: number
}

export interface ArchivoEnLote {
  file: File
  solicitud_id: string
  codigo_ext: string
  tipo_documento?: string
  subido_por?: string
  signal?: AbortSignal
  onProgress?: (pct: number) => void
}

export interface ResultadoLote {
  file: File
  resultado: UploadResult
}

/** Cola con concurrencia limitada (D-14.1) — nunca Promise.all sin control. */
export async function uploadEnLotes(
  archivos: ArchivoEnLote[],
  concurrencia = 3,
  onProgresoGlobal?: (progreso: ProgresoGlobal) => void
): Promise<ResultadoLote[]> {
  const resultados: ResultadoLote[] = new Array(archivos.length)
  let siguiente = 0
  let completados = 0
  let errores = 0

  async function worker() {
    while (true) {
      const idx = siguiente++
      if (idx >= archivos.length) return
      const item = archivos[idx]
      const resultado = await uploadConReintentos({
        file: item.file,
        solicitud_id: item.solicitud_id,
        codigo_ext: item.codigo_ext,
        tipo_documento: item.tipo_documento,
        subido_por: item.subido_por,
        signal: item.signal,
        onProgress: item.onProgress,
      })
      resultados[idx] = { file: item.file, resultado }
      completados += 1
      if (!resultado.ok) errores += 1
      onProgresoGlobal?.({
        archivosCompletados: completados,
        totalArchivos: archivos.length,
        errores,
      })
    }
  }

  const workers = Array.from({ length: Math.min(concurrencia, archivos.length) }, () => worker())
  await Promise.all(workers)
  return resultados
}
