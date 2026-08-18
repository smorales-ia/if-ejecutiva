/**
 * Comparables de la sección D · alta en blanco y homogeneización (RF-12).
 *
 * ## A-18 · este módulo **NO precarga**
 *
 * La precarga desde `GET /api/tasaciones/config/defaults` entra en **P7-TAS**
 * cuando Héctor y Óscar respondan. A-18 sigue abierta y bloqueante: hoy ninguna
 * tabla de configuración puede servir un factor de homogeneización
 * —`C_FactoresHomogeneizacion.valor_referencia` está vacío en las 15 filas,
 * `C_Factores` es otra cosa (coeficientes del motor) y `C_VariablesCliente`
 * está vacía—, así que **no hay valor por defecto que cargar**.
 *
 * Lo que sí se puede hacer sin esa respuesta es esto: dar la forma. Un
 * comparable nuevo nace con los tres factores **vacíos**, no en `1` ni en
 * ningún número plausible, y la homogeneización calcula sobre lo que el tasador
 * teclea. Cuando A-18 cierre, la precarga rellena esos tres campos antes de
 * pintarlos y **este módulo no cambia**.
 *
 * ⚠ **Por qué el vacío y no `1`.** Un `1` es matemáticamente inocuo —no altera
 * el producto— pero visualmente indistinguible de un factor que el tasador
 * revisó y decidió dejar neutro. Un campo vacío dice «esto falta»; un `1` dice
 * «esto ya está». La diferencia importa en un informe que después firma alguien.
 *
 * ⚠ **OV-6 · el nombre del archivo.** `factores-default` sugiere exactamente lo
 * que RF-TAS-08 prohíbe: defaults viviendo en un módulo del cliente. Se
 * conserva porque es la ruta que el v0 importa, pero **acá no hay ningún
 * default** — el nombre miente sobre el contenido. Si P7-TAS toca este archivo,
 * el rename a algo como `comparables.ts` es gratis y conviene.
 *
 * Ubicación: `lib/tasador/`, no `lib/` raíz — territorio de escritura de IF-03
 * según R5, mismo criterio que OV-9 aplicó al hook de estado.
 */

import type { Comparable } from '@/lib/tasaciones'

/** Contador local de ids, con el mismo patrón que el resto del formulario (`amp-N`, `it-new-N`). */
let comparableUid = 0

/**
 * Comparable en blanco.
 *
 * El `id` es local y efímero: sólo sirve como `key` de React y para el
 * `update`/`remove` de la grilla mientras el formulario vive en el navegador.
 * **No viaja como identidad a Airtable** — la ruta `/comparables` genera su
 * propia clave determinista server-side (RO-31).
 */
export function nuevoComparable(): Comparable {
  return {
    id: `cmp-new-${++comparableUid}`,
    direccionReferencia: '',
    comuna: '',
    supTerreno: '',
    supConstruida: '',
    totalUf: '',
    anio: '',
    /** Dominio cerrado `oferta · cbr`. `oferta` es el caso mayoritario. */
    fuente: 'oferta',
    /* Los tres factores de homogeneización · vacíos por A-18. Ver el encabezado. */
    factorSup: '',
    factorEdad: '',
    factorDistancia: '',
    telefonoContacto: '',
    foja: '',
    numero: '',
  }
}

/**
 * Lee un campo numérico del formulario.
 *
 * Todo llega como `string` porque son `value` de inputs controlados. Devuelve
 * `null` ante vacío o no-numérico: es la señal de «falta el dato», distinta de
 * un `0` legítimo.
 */
function numero(valor: string): number | null {
  const limpio = valor.trim()
  if (limpio === '') return null

  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

/**
 * Valor total del comparable homogeneizado: `totalUf × factorSup × factorEdad ×
 * factorDistancia`.
 *
 * Devuelve **UF totales**, no UF/m². Quien necesita el unitario divide por
 * `supConstruida` después — así lo hace `promedioHomogeneizado()` en
 * `seccion-comparables.tsx`.
 *
 * ## Por qué `null` en vez de omitir el factor que falta
 *
 * Tratar un factor vacío como `1` daría un número que parece una
 * homogeneización completa y no lo es: el promedio de la grilla lo promediaría
 * junto a los comparables sí homogeneizados y el sesgo quedaría invisible. Con
 * `null`, la fila se muestra sin valor y **queda fuera del promedio**, que es
 * lo que `promedioHomogeneizado()` ya hace al filtrar los `null`.
 *
 * Un `0` tecleado sí es un valor: se respeta y anula el producto. Es una
 * decisión del tasador, no un dato ausente.
 */
export function ufHomogeneizada(c: Comparable): number | null {
  const base = numero(c.totalUf)
  if (base === null) return null

  const sup = numero(c.factorSup)
  const edad = numero(c.factorEdad)
  const distancia = numero(c.factorDistancia)

  if (sup === null || edad === null || distancia === null) return null

  return base * sup * edad * distancia
}
