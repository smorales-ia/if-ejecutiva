/**
 * Composición del path Dropbox de la spec v1.9.6 §8.1.
 *
 *     /Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/{archivo}
 *
 * Todo lo de este archivo es **puro**: no lee Airtable, no toca `process.env` y
 * no depende de Next. El contexto (nombre del cliente, fecha de la solicitud,
 * unidad de destino) lo resuelve `lib/dropbox-path-contexto.ts` y lo entrega ya
 * materializado. Así la regla normativa —que tiene que producir exactamente el
 * mismo string en el Route Handler, en un escenario Make y en un script de
 * auditoría (§8.5)— queda en un único lugar testeable sin red.
 *
 * Cierra **CI-003**: hasta este commit el path lo componía el mapper del módulo
 * Dropbox de `SC-Adjuntos-Upload` como `/VProperty/Tasaciones/{codigo_ext}`.
 * Desde aquí lo compone Next.js y Make sólo lo transporta (invariante RT-03).
 * Las solicitudes con `fecha_solicitud` anterior al 06-ago-2026 quedan
 * *grandfathered* en el path viejo (RF-51 §8.3, cláusula de corte): no se migra
 * nada, y sus adjuntos ya persistidos siguen resolviéndose por `url_dropbox`.
 */

/** Raíz literal fija de la cuenta corporativa Dropbox (§8.1). */
export const RAIZ_DROPBOX = '/Test_ValueProperty'

/**
 * Carpetas hermanas de las unidades, al nivel de `{codigo_solicitud}/`. Quedan
 * reservadas: ninguno de los once subtipos de `TX_Unidades` normaliza a estos
 * nombres, así que no pueden colisionar con una unidad real (§8.1).
 */
export const CARPETA_INFORME = 'informe'
export const CARPETA_COMUN = 'comun'
export const CARPETA_INGRESO = '_ingreso'

/**
 * Segmento de una unidad sin `subtipo` declarado. No es un valor de negocio:
 * `subtipo` es un singleSelect no obligatorio y una unidad puede quedar sin él
 * durante la carga. Su presencia en un path es señal de dato incompleto y debe
 * poder auditarse como tal (§8.1).
 */
export const SEGMENTO_SIN_SUBTIPO = 'sin_subtipo'

/**
 * Tabla de equivalencia **cerrada** `TX_Unidades.subtipo` → segmento `{Unidad}`
 * (§8.1). Las claves son los valores literales del singleSelect
 * `fldNU8ee30AvvRWHZ`, reverificados vía MCP el 06-ago-2026 — no las etiquetas
 * de UI de `lib/mappers/vocabulario-unidades.ts`, que son otro espacio de
 * valores (ahí "Obras complementarias" es la etiqueta de `OO.CC.`).
 *
 * Al agregar una opción al singleSelect hay que declarar acá su normalización,
 * o el path cae al fallback `sin_subtipo` con un warning en los logs.
 */
const SEGMENTO_POR_SUBTIPO: Readonly<Record<string, string>> = {
  Departamento: 'departamento',
  Casa: 'casa',
  Bodega: 'bodega',
  Estacionamiento: 'estacionamiento',
  Terreno: 'terreno',
  Local: 'local',
  Terraza: 'terraza',
  Piscina: 'piscina',
  'OO.CC.': 'oo_cc',
  Servidumbre: 'servidumbre',
  Edificacion: 'edificacion',
}

/** NFD + strip de marcas combinantes: `VALÓN` → `VALON`. */
function quitarDiacriticos(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Normaliza `M_Clientes.nombre` (`fldDGR9WLhOtIbikW`) para el segmento
 * `{Cliente}`, en el orden exacto del pseudocódigo de §8.5.
 *
 * Casos verificados contra datos reales de la base:
 *   `AFIANZA`                      → `AFIANZA`
 *   `Afianza`                      → `AFIANZA`
 *   `VALÓN Hipotecaria`            → `VALON_HIPOTECARIA`
 *   `Banco Estado`                 → `BANCO_ESTADO`
 *   `M&V`                          → `M_Y_V`
 *   `La Construcción Hipotecaria`  → `LA_CONSTRUCCION_HIPOTECARIA`
 *
 * Consecuencia aceptada (§8.5): la normalización **colapsa registros
 * duplicados** de `M_Clientes` que difieren sólo en capitalización o
 * acentuación. Dos clientes formalmente distintos en Airtable comparten
 * carpeta; se prefiere eso a fragmentar el árbol de un mismo cliente
 * institucional por un defecto de datos maestros.
 */
export function normalizarCliente(nombre: string): string {
  return quitarDiacriticos(nombre)
    .toUpperCase()
    .replace(/&/g, '_Y_')
    // Los puntos se **borran**, no se sustituyen: `S.A.` → `SA`.
    .replace(/\./g, '')
    .replace(/\s/g, '_')
    // Cualquier otro símbolo (`/`, `,`, comillas) rompería el path o el nombre
    // de carpeta en Dropbox. No está en el pseudocódigo porque los datos reales
    // no lo tienen, pero un nombre nuevo sí podría traerlo.
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Normaliza `TX_Unidades.subtipo` para el segmento `{Unidad}` (§8.1).
 *
 * Vacío, nulo o valor fuera de la tabla cerrada → `sin_subtipo`. El valor
 * desconocido se loguea porque significa que el catálogo de Airtable creció sin
 * que se actualizara §8.1; el vacío no, porque es un estado legítimo del dato.
 */
export function normalizarSubtipo(subtipo: string | null | undefined): string {
  const clave = subtipo?.trim() ?? ''
  if (clave === '') return SEGMENTO_SIN_SUBTIPO

  const segmento = SEGMENTO_POR_SUBTIPO[clave]
  if (segmento) return segmento

  console.warn(
    `[dropbox-path] subtipo "${clave}" no está en la tabla de mapeo de §8.1 — ` +
      `el adjunto va a ${SEGMENTO_SIN_SUBTIPO}/`
  )
  return SEGMENTO_SIN_SUBTIPO
}

/**
 * `TX_Solicitudes.fecha_solicitud` (`fldvkn9CsORy4eU0Z`) es dateTime y se
 * almacena en UTC. El año se calcula sobre esa marca **convertida a
 * America/Santiago** (§8.5): sin la conversión, toda solicitud creada entre las
 * 21:00 del 31 de diciembre y la medianoche local caería en la carpeta del año
 * siguiente. La zona es fija — el proyecto opera en Chile.
 */
const ANIO_SANTIAGO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago',
  year: 'numeric',
})

export function derivarSegmentoAnio(fechaSolicitud: Date): string {
  if (Number.isNaN(fechaSolicitud.getTime())) {
    throw new Error('[dropbox-path] fecha_solicitud inválida: no se puede derivar INFORMES_{AAAA}')
  }
  return `INFORMES_${ANIO_SANTIAGO.format(fechaSolicitud)}`
}

/**
 * Caso que resuelve el segmento `{Unidad}`. Es un tipo discriminado y no un
 * string libre para que el llamador no pueda inventar una carpeta hermana: las
 * tres reservadas son parte del tipo.
 */
export type CasoPath =
  | {
      tipo: 'unidad'
      /** Valor crudo de `TX_Unidades.subtipo`; `null` si la unidad no lo declara. */
      subtipoUnidad: string | null
      /**
       * `TX_Unidades.numero_unidad` (`fldJGXS8jGDKZDdWM`). Es **singleLineText**
       * en el schema real, no un número: los valores observados van de `"1"` y
       * `"105"` a `"D402"` y `"2100"`, y en la mayoría de las filas está vacío.
       */
      numeroUnidad?: string | null
      /**
       * `TX_Unidades.rol_sii` (`fldC5yUYC2wTTLJBV`). Segundo escalón de la
       * cascada de desambiguación: identifica la unidad de forma estable y
       * verificable contra el SII, a diferencia del ordinal.
       */
      rolSii?: string | null
      /** Cuántas unidades de la solicitud comparten este mismo subtipo. */
      totalDelMismoSubtipo: number
      /**
       * Posición 1-based de la unidad dentro de su grupo de mismo subtipo, en el
       * orden de `TX_Unidades.orden`. Último escalón de la cascada — ver
       * `sufijoDesambiguacion`.
       */
      ordinalEnGrupo?: number
    }
  | { tipo: 'comun' }
  | { tipo: 'ingreso' }
  | { tipo: 'informe' }

/** Sanea un valor de texto libre para usarlo como parte de un nombre de carpeta. */
function aSnakeCase(valor: string): string {
  return quitarDiacriticos(valor)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Sufijo `_{numero_unidad}` de la desambiguación de §8.1. Con un solo ejemplar
 * del subtipo en la solicitud la carpeta va **sin sufijo** (`departamento/`);
 * con dos o más, cada una lleva el suyo (`estacionamiento_1/`,
 * `estacionamiento_2/`). La regla es contextual a la solicitud, no global.
 *
 * ⚠ Borde que §8.1 no cubre: `numero_unidad` está **vacío en la mayoría de las
 * filas reales**, y dos estacionamientos sin número producirían la misma
 * carpeta —justo el choque que el sufijo existe para evitar—.
 *
 * **Cascada de identificadores (CI-003b, 07-ago-2026).** Se resuelve en tres
 * escalones, del más significativo al más frágil:
 *
 *   1. `numero_unidad` — lo que manda §8.1 y lo que un humano reconoce
 *      (`estacionamiento_105`).
 *   2. `rol_sii` — identificador estable, único y verificable contra el SII.
 *      No es cosmético: sobrevive a un reordenamiento de las unidades.
 *   3. ordinal dentro del grupo, **con warning**. Es posicional: si mañana se
 *      agrega o borra una unidad hermana, el ordinal de las demás se corre y el
 *      path ya escrito —que §8 declara inmutable— deja de corresponder. Sirve
 *      para no colisionar hoy, no para identificar mañana; el warning existe
 *      para que ese caso se vea en los logs y se corrija el dato maestro.
 *
 * La versión inicial de CI-003 saltaba directo de (1) a (3) e ignoraba
 * `rol_sii`, que estaba disponible en la misma lectura de `TX_Unidades`.
 */
function sufijoDesambiguacion(caso: Extract<CasoPath, { tipo: 'unidad' }>): string {
  if (caso.totalDelMismoSubtipo < 2) return ''

  const numero = aSnakeCase(caso.numeroUnidad?.trim() ?? '')
  if (numero) return `_${numero}`

  const rol = aSnakeCase(caso.rolSii?.trim() ?? '')
  if (rol) return `_${rol}`

  if (caso.ordinalEnGrupo) {
    console.warn(
      '[dropbox-path] unidades del mismo subtipo sin numero_unidad ni rol_sii — ' +
        `se desambigua por ordinal (_${caso.ordinalEnGrupo}), que es posicional y ` +
        'envejece mal (CI-004). Conviene poblar numero_unidad en TX_Unidades'
    )
    return `_${caso.ordinalEnGrupo}`
  }

  // Sin ninguno de los tres no hay forma de distinguirlas; se deja sin sufijo y
  // se avisa, porque un path colisionado es un problema de datos, no de código.
  console.warn(
    '[dropbox-path] dos o más unidades del mismo subtipo sin numero_unidad, ' +
      'rol_sii ni ordinal — las carpetas van a colisionar'
  )
  return ''
}

/** Resuelve el segmento `{Unidad}` (o la carpeta hermana reservada) del path. */
export function segmentoUnidad(caso: CasoPath): string {
  switch (caso.tipo) {
    case 'comun':
      return CARPETA_COMUN
    case 'ingreso':
      return CARPETA_INGRESO
    case 'informe':
      return CARPETA_INFORME
    case 'unidad':
      return `${normalizarSubtipo(caso.subtipoUnidad)}${sufijoDesambiguacion(caso)}`
  }
}

export interface EntradaPathDropbox {
  /** `M_Clientes.nombre` crudo, sin normalizar. */
  clienteNombre: string
  /** `TX_Solicitudes.fecha_solicitud` como `Date` (la marca UTC de Airtable). */
  fechaSolicitud: Date
  /** `TX_Solicitudes.codigo_solicitud` (`fldDXEE1ejMNVDlpB`), ej. `VP-2026-0053`. */
  codigoSolicitud: string
  caso: CasoPath
}

/**
 * Compone la **carpeta destino**, sin el nombre del archivo.
 *
 * Es lo que consume Make: `dropbox:uploadLargeFile` recibe la carpeta en `path`
 * y el nombre en `filename` por separado, y los concatena él. Mandarle el path
 * completo haría que Dropbox creara una carpeta con el nombre del archivo.
 */
export function componerCarpetaDropbox(entrada: EntradaPathDropbox): string {
  const cliente = normalizarCliente(entrada.clienteNombre)
  if (!cliente) {
    throw new Error('[dropbox-path] el nombre del cliente normaliza a vacío')
  }

  const codigo = entrada.codigoSolicitud.trim()
  if (!codigo) {
    throw new Error('[dropbox-path] falta codigo_solicitud')
  }

  return [
    RAIZ_DROPBOX,
    derivarSegmentoAnio(entrada.fechaSolicitud),
    cliente,
    codigo,
    segmentoUnidad(entrada.caso),
  ].join('/')
}

/**
 * Path completo, con archivo. `componerCarpetaDropbox` es lo que viaja a Make;
 * ésta es la forma auditable de §8.1 —la que se compara contra `url_dropbox` y
 * la que usan los tests— y la que necesitará SC09 cuando deposite el PDF de
 * Carbone en `informe/`.
 *
 * No aplica la convención de naming de §8.1
 * (`{tipo}__{AAAAMMDD-HHMMSS}__{nombre_saneado}`): hoy nadie la compone y el
 * nombre que llega es el original del archivo. Queda fuera de CI-003, que es
 * sobre el path.
 */
export function componerPathDropbox(
  entrada: EntradaPathDropbox & { nombreArchivo: string }
): string {
  const archivo = entrada.nombreArchivo.trim()
  if (!archivo) {
    throw new Error('[dropbox-path] falta nombre_archivo')
  }
  return `${componerCarpetaDropbox(entrada)}/${archivo}`
}
