/**
 * Validador anti-cifras del informe — RF-32 (Spec v1.9.17 §7, líneas 4927-4944).
 *
 * ## Qué es
 *
 * RF-32 delega los textos redactados del informe (síntesis · programa ·
 * descripción del sector) a Claude API bajo un contrato estricto: **prohibido
 * inventar cifras** — toda referencia numérica del texto debe coincidir con un
 * campo de origen (`TX_DatosTasacion`, `TX_ItemsCuadroValoracion`). Cualquier
 * discrepancia → **rechazo y reintento**. Este módulo es el juez de esa regla:
 * dado un texto generado y el conjunto de números que la base efectivamente
 * respalda, dictamina si el texto pasa o qué cifras quedaron huérfanas.
 *
 * ## Qué NO es
 *
 * - **No llama a ninguna API** (ni Anthropic ni Airtable): es TS puro, sin
 *   imports de red ni de entorno, testeable con vitest sin mocks.
 * - **No decide el reintento**: eso es del orquestador (SC-Textos / SC09). Aquí
 *   sólo se produce el veredicto `{ valido, cifrasNoRespaldadas }` que el
 *   orquestador usa para rechazar y volver a pedir.
 *
 * ## Formato numérico es-CL — reglas de extracción
 *
 * Los textos del informe vienen en español de Chile: **punto = separador de
 * miles, coma = separador decimal**. Reglas exactas de `extraerCifras`:
 *
 * 1. `5.024,86` → `5024.86` — miles con punto (grupos de 3) + decimal con coma.
 * 2. `5024,86` → `5024.86` — decimal con coma, sin separador de miles.
 * 3. `3.300.000` → `3300000` — múltiples grupos de miles, sin decimal.
 * 4. `N°2100` → `2100` — el prefijo `N°` no es parte del número; se toma el
 *    literal de dígitos que lo sigue.
 * 5. `2024` → `2024` — años y enteros sueltos se extraen tal cual.
 * 6. `4,5%` → `4.5` — el signo `%` se descarta; la cifra extraída es el número
 *    literal (no la fracción 0.045). El payload debe respaldar `4.5`.
 * 7. **Ambigüedad punto**: un punto seguido de un grupo que NO tiene exactamente
 *    3 dígitos **no** es separador de miles válido en es-CL y **corta** el
 *    token: `34.05` (estilo inglés) se lee como dos números, `34` y `5`. Es una
 *    limitación deliberada: preferimos partir un número mal formateado (que
 *    entonces exigirá respaldo para cada trozo) antes que adivinar un decimal
 *    inglés y validar en falso.
 * 8. Los signos (`-`, `+`) no se capturan: los textos del informe no redactan
 *    números negativos; un `-3%` se extrae como `3`.
 *
 * ## Enteros estructurales (`permitirEnterosHasta`)
 *
 * Frases como «3 dormitorios simples» o «4 vehículos» contienen enteros que no
 * salen de una cifra de la base sino del **conteo de recintos/elementos**
 * (`TX_HabitacionesPorNivel` y afines). Exigir respaldo literal para cada
 * conteo pequeño produciría falsos rechazos permanentes. Por eso los enteros
 * entre 1 y `permitirEnterosHasta` (default **20**, techo razonable para
 * cantidades de recintos/estacionamientos/pisos) se admiten sin respaldo — pero
 * **se reportan igual** en `cifrasEncontradas`, para que el revisor humano (el
 * visador F4 valida el texto antes de aprobar, criterio de aceptación RF-32)
 * los tenga a la vista.
 *
 * Origen: bloque 6 de T-INFORME-ENSAMBLADOR
 * (`docs/_analisis/ROADMAP_paridad_informe_20260924.md` §3.6 · hallazgos 7-8).
 * Fixtures de referencia: párrafos reales del gold master MET-6283
 * (ver `validador-cifras.test.ts`).
 */

/** Opciones de `validarTexto`. Ver doc del módulo para el porqué de cada una. */
export interface OpcionesValidacion {
  /**
   * Diferencia absoluta admitida entre la cifra del texto y una permitida,
   * **después** de redondear ambas a 2 decimales. Default `0` (coincidencia
   * exacta con redondeo a 2 decimales — así `5024.859` del payload respalda
   * `5024,86` del texto).
   */
  tolerancia?: number
  /**
   * Techo inclusivo de los enteros estructurales admitidos sin respaldo
   * (conteos de recintos: «3 dormitorios», «2 terrazas»). Default `20`.
   * Con `0` se exige respaldo para absolutamente toda cifra.
   */
  permitirEnterosHasta?: number
}

/** Veredicto de `validarTexto`. */
export interface ResultadoValidacion {
  /** `true` ⟺ `cifrasNoRespaldadas` está vacío. */
  valido: boolean
  /**
   * Cifras del texto sin respaldo en `cifrasPermitidas` ni amparo estructural.
   * Sin duplicados (una cifra inventada dos veces se reporta una vez).
   */
  cifrasNoRespaldadas: number[]
  /**
   * TODAS las cifras extraídas del texto, en orden de aparición y con
   * repeticiones — incluye las estructurales admitidas, para revisión humana.
   */
  cifrasEncontradas: number[]
}

/**
 * Token numérico es-CL: primero intenta la forma con miles (`\d{1,3}` seguido
 * de uno o más grupos `.\d{3}`, decimal `,\d+` opcional); si no, dígitos
 * corridos con decimal `,\d+` opcional. El orden de las alternativas importa:
 * la forma con miles debe ganar antes de que `\d+` se coma «5» de «5.024».
 */
const RE_CIFRA_ES_CL = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g

/** Redondeo a 2 decimales — la moneda de comparación de todo el módulo. */
function redondear2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Extrae todos los números de un texto en formato es-CL, en orden de aparición
 * y con repeticiones. Reglas exactas (miles con punto, decimal con coma,
 * ambigüedad del punto, `N°`, `%`, signos) documentadas en el doc del módulo.
 *
 * @param texto Texto libre (párrafo del informe).
 * @returns Números ya normalizados a `number` JS (`"5.024,86"` → `5024.86`).
 */
export function extraerCifras(texto: string): number[] {
  const tokens = texto.match(RE_CIFRA_ES_CL) ?? []
  return tokens.map((token) => Number(token.replace(/\./g, '').replace(',', '.')))
}

/**
 * Valida un texto generado contra el conjunto de cifras que la base respalda
 * (RF-32: «prohibido inventar cifras … cualquier discrepancia → rechazo»).
 *
 * Una cifra del texto queda **respaldada** si:
 * - alguna cifra permitida coincide con ella dentro de `tolerancia`
 *   (ambas redondeadas a 2 decimales), **o**
 * - es un entero estructural entre 1 y `permitirEnterosHasta` (conteo de
 *   recintos — ver doc del módulo; se reporta igual en `cifrasEncontradas`).
 *
 * @param texto            Párrafo a juzgar (síntesis, sector, programa).
 * @param cifrasPermitidas Números que la base respalda — normalmente el
 *                         resultado de `cifrasDePayload` sobre el
 *                         `InformeContexto` o el subconjunto relevante.
 * @param opciones         Ver {@link OpcionesValidacion}.
 */
export function validarTexto(
  texto: string,
  cifrasPermitidas: number[],
  opciones: OpcionesValidacion = {},
): ResultadoValidacion {
  const { tolerancia = 0, permitirEnterosHasta = 20 } = opciones

  const cifrasEncontradas = extraerCifras(texto)
  const permitidas2 = cifrasPermitidas.map(redondear2)

  const noRespaldadas = new Set<number>()
  for (const cifra of cifrasEncontradas) {
    const esEstructural =
      Number.isInteger(cifra) && cifra >= 1 && cifra <= permitirEnterosHasta
    if (esEstructural) continue

    const cifra2 = redondear2(cifra)
    const respaldada = permitidas2.some((p) => Math.abs(p - cifra2) <= tolerancia)
    if (!respaldada) noRespaldadas.add(cifra)
  }

  const cifrasNoRespaldadas = [...noRespaldadas]
  return {
    valido: cifrasNoRespaldadas.length === 0,
    cifrasNoRespaldadas,
    cifrasEncontradas,
  }
}

/**
 * Recorre recursivamente un payload (el `InformeContexto` de
 * `lib/informe/ensamblador.ts`, el modelo de `lib/tasador/lectura-informe.ts`
 * o cualquier subconjunto) y junta todos los `number` finitos.
 *
 * - Sólo recoge valores **de tipo `number`**: los strings numéricos («5.024,86»
 *   como texto) NO se interpretan — si un campo respaldante viaja como string,
 *   es responsabilidad del llamador convertirlo antes (con `numeroDe` de
 *   `lib/tasador/comparables.ts` o equivalente). Adivinar aquí abriría la
 *   puerta a respaldos fantasma.
 * - `null` / `undefined` / `NaN` / `±Infinity` se descartan (los huecos del
 *   contexto son `null` explícito por diseño del ensamblador).
 * - Ciclos protegidos con `WeakSet` — un payload con referencias circulares no
 *   cuelga el proceso.
 *
 * @returns Números únicos (sin duplicados), en orden de primer hallazgo.
 */
export function cifrasDePayload(payload: unknown): number[] {
  const encontradas = new Set<number>()
  const visitados = new WeakSet<object>()

  function visitar(valor: unknown): void {
    if (typeof valor === 'number') {
      if (Number.isFinite(valor)) encontradas.add(valor)
      return
    }
    if (valor === null || typeof valor !== 'object') return
    if (visitados.has(valor)) return
    visitados.add(valor)

    if (Array.isArray(valor)) {
      for (const item of valor) visitar(item)
      return
    }
    for (const clave of Object.keys(valor)) {
      visitar((valor as Record<string, unknown>)[clave])
    }
  }

  visitar(payload)
  return [...encontradas]
}
