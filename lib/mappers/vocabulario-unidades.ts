/**
 * Vocabulario de los `singleSelect` de `TX_Unidades`: **una sola declaración**
 * de los pares etiqueta-de-UI ↔ slug-de-Airtable, y las dos direcciones
 * derivadas de ella.
 *
 * ── Por qué existe este archivo (C-1, 30-jul-2026) ────────────────────────
 *
 * Hasta esta tanda había *una* tabla por campo, en `crear-solicitud.ts`,
 * indexada por etiqueta de UI:
 *
 *     SUBTIPO_POR_TIPO_BIEN["Edificación"] === "Edificacion"
 *
 * Correcta para el alta, donde `tipoBien` sale de un `<Select>` y por lo tanto
 * es una etiqueta. Pero la pantalla de **edición** hidrata desde Airtable, así
 * que su `tipoBien` es un *slug* (`"Departamento"`), y aplicarle la misma tabla
 * daba `undefined`:
 *
 *     SUBTIPO_POR_TIPO_BIEN["Departamento"] === undefined → ?? "" → ""
 *
 * Ese `""` viajaba a Make, `typecast: true` lo aceptaba y Airtable **creaba una
 * opción de nombre vacío** en el catálogo maestro. Una edición que sólo tocaba
 * "Proyecto o condominio" vaciaba `subtipo`, `tipo_material` y
 * `origen_superficie` de todas las unidades, con toast verde de confirmación.
 * Diagnóstico completo en `docs/aprendizajes.md` (30-jul-2026).
 *
 * El comentario que justificaba compartir la tabla —"duplicarlas garantizaría
 * que diverjan"— tenía razón en el diagnóstico y se equivocaba en el remedio:
 * el problema no era duplicar, era usar una tabla cuyo dominio es el espacio de
 * etiquetas para traducir un valor del espacio de slugs. Acá los pares se
 * declaran una vez y los dos diccionarios se construyen solos, así que no
 * pueden divergir.
 *
 * ── Contrato ──────────────────────────────────────────────────────────────
 *
 * `aSlug` y `aEtiqueta` devuelven `undefined` —nunca `""`— cuando no hay
 * traducción, y el llamador **omite la clave** del payload. Un campo ausente
 * deja el valor sin tocar; un `""` inventa una opción. Ver la nota sobre el
 * guard pendiente en Make al pie del archivo.
 */

/** Diccionario bidireccional de un `singleSelect`. */
export interface VocabularioCampo {
  /** Nombre del campo Airtable, sólo para los mensajes de warning. */
  readonly campo: string
  /** etiqueta de UI → slug de Airtable. */
  readonly aSlug: Readonly<Record<string, string>>
  /** slug de Airtable → etiqueta de UI. */
  readonly aEtiqueta: Readonly<Record<string, string>>
}

/**
 * Construye los dos sentidos a partir de la lista de pares.
 *
 * Varias etiquetas pueden colapsar al mismo slug (las tres variantes de
 * estacionamiento). La ida es total; la vuelta es necesariamente ambigua, y se
 * resuelve con **la primera etiqueta declarada gana**. Es una regla explícita y
 * no un accidente del orden de las claves: mover una fila de `PARES_SUBTIPO`
 * cambia lo que la pantalla muestra al hidratar.
 */
function construir(
  campo: string,
  pares: ReadonlyArray<readonly [etiqueta: string, slug: string]>,
): VocabularioCampo {
  const aSlug: Record<string, string> = {}
  const aEtiqueta: Record<string, string> = {}
  for (const [etiqueta, slug] of pares) {
    aSlug[etiqueta] = slug
    if (!(slug in aEtiqueta)) aEtiqueta[slug] = etiqueta
  }
  return { campo, aSlug, aEtiqueta }
}

/**
 * `TX_Unidades.subtipo` (`fldNU8ee30AvvRWHZ`) — 11 opciones reales verificadas
 * vía `get_table_schema` el 30-jul-2026.
 *
 * ⚠ Las tres variantes de estacionamiento colapsan a `Estacionamiento`: el eje
 * cubierto/descubierto/uso-y-goce no existe en Airtable y el de uso y goce ya
 * viaja por `con_rol_o_uso_y_goce`. Al hidratar, cualquiera de las tres vuelve
 * como **"Estacionamiento cubierto"** por la regla de la primera fila. Es una
 * pérdida conocida y aceptada: el dato autoritativo es el slug.
 */
export const SUBTIPO = construir("subtipo", [
  ["Departamento", "Departamento"],
  ["Casa", "Casa"],
  ["Edificación", "Edificacion"],
  ["Terreno", "Terreno"],
  ["Local", "Local"],
  ["Terraza", "Terraza"],
  ["Bodega", "Bodega"],
  ["Piscina", "Piscina"],
  ["Servidumbre", "Servidumbre"],
  ["Obras complementarias", "OO.CC."],
  ["Estacionamiento cubierto", "Estacionamiento"],
  ["Estacionamiento descubierto", "Estacionamiento"],
  ["Estacionamiento uso y goce", "Estacionamiento"],
])

/** `TX_Unidades.tipo_material` (`fldnG1nEod0V1IkKZ`) — 5 opciones reales. */
export const MATERIAL = construir("tipo_material", [
  ["Albañilería", "albanileria"],
  ["Madera", "madera"],
  ["Hormigón", "hormigon"],
  ["Mixto", "mixto"],
  ["Perfiles metálicos", "perfiles_metalicos"],
])

/** `TX_Unidades.origen_superficie` (`fldbDPpHhkuWjOTvQ`) — 5 opciones reales. */
export const ORIGEN_SUPERFICIE = construir("origen_superficie", [
  ["Carta o ficha inmobiliaria", "carta_ficha_inmobiliaria"],
  ["Plano", "plano"],
  ["Base interna SII", "base_interna_sii"],
  ["Certificado de avalúo", "certificado_avaluo"],
  ["Medición del tasador", "medicion_tasador"],
])

/**
 * `TX_Unidades.con_rol_o_uso_y_goce` (`fldcVpzYmK3FWscmD`) — 2 opciones reales.
 *
 * Éste no traduce etiqueta↔slug sino el **enum del formulario de alta**
 * (`rolModo: "con_rol" | "uso_goce"`) al slug. La pantalla de edición no lo usa:
 * ahí el eje ya viene resuelto como booleano (`Unidad.conRol`) y se serializa
 * con `slugRolModo()`.
 */
export const ROL_MODO = construir("con_rol_o_uso_y_goce", [
  ["con_rol", "con_rol"],
  ["uso_goce", "uso_y_goce"],
])

/**
 * `TX_Unidades.ampliacion_regularizable` (`flddSP96ivTrAdcXW`) — 3 opciones.
 *
 * Tri-estado real: `no_aplica` no es "no", es "no declarado". El modelo de
 * lectura lo representa como `boolean | undefined` y el formulario de alta como
 * `"si" | "no" | ""`; las dos formas convergen acá.
 */
export const REGULARIZABLE = construir("ampliacion_regularizable", [
  ["si", "si"],
  ["no", "no"],
  ["", "no_aplica"],
])

/**
 * Etiqueta de UI → slug de Airtable.
 *
 * @returns el slug, o `undefined` si el valor está vacío o no tiene traducción.
 *          El llamador **debe omitir la clave** en ese caso.
 */
export function aSlug(
  vocabulario: VocabularioCampo,
  etiqueta: string | undefined | null,
): string | undefined {
  return traducir(vocabulario.aSlug, etiqueta, vocabulario.campo, "etiqueta")
}

/**
 * Slug de Airtable → etiqueta de UI.
 *
 * @returns la etiqueta, o `undefined` si el valor está vacío o es un slug que
 *          no está en el catálogo (típicamente una opción basura que `typecast`
 *          creó antes de este fix).
 */
export function aEtiqueta(
  vocabulario: VocabularioCampo,
  slug: string | undefined | null,
): string | undefined {
  return traducir(vocabulario.aEtiqueta, slug, vocabulario.campo, "slug")
}

/**
 * Núcleo compartido de las dos direcciones.
 *
 * Distingue tres casos y sólo uno es un problema:
 *  - vacío / nulo → `undefined` en silencio. "No declarado" es un estado
 *    legítimo de todos estos campos.
 *  - presente y traducible → el valor traducido.
 *  - presente y desconocido → `undefined` **con warning**. Es un catálogo
 *    desalineado o una opción basura, y hay que verlo en los logs; lo que no
 *    puede es escribirse en Airtable.
 */
function traducir(
  diccionario: Readonly<Record<string, string>>,
  valor: string | undefined | null,
  campo: string,
  direccion: "etiqueta" | "slug",
): string | undefined {
  if (valor == null) return undefined
  const clave = valor.trim()
  // `REGULARIZABLE` mapea "" → "no_aplica" a propósito, así que el vacío se
  // consulta antes de descartarlo.
  if (clave in diccionario) return diccionario[clave]
  if (clave === "") return undefined

  console.warn(
    `[vocabulario-unidades] ${campo}: ${direccion} "${clave}" sin traducción — ` +
      `se omite la clave del payload en vez de escribir un valor vacío`,
  )
  return undefined
}

/** Serializa el eje con-rol/uso-y-goce del modelo de lectura (booleano). */
export function slugRolModo(conRol: boolean): string {
  return conRol ? "con_rol" : "uso_y_goce"
}

/**
 * Serializa `Unidad.regularizable` (`boolean | undefined`) al slug tri-estado.
 * `undefined` es "no declarado" → `no_aplica`, que es lo que Airtable modela.
 */
export function slugRegularizable(regularizable: boolean | undefined): string {
  if (regularizable === true) return "si"
  if (regularizable === false) return "no"
  return "no_aplica"
}

/**
 * ⚠ Deuda ligada a C-5 — la barrera de este archivo es necesaria pero **no
 * suficiente**.
 *
 * Omitir la clave impide que la app mande `""`. Pero el módulo `Create` de
 * SC-Edicion mapea `"fldNU8ee30AvvRWHZ": "{{22.subtipo}}"`, y una clave ausente
 * en el JSON hace que Make resuelva la referencia a vacío. Que el módulo de
 * Airtable omita el campo o mande `""` con `typecast: true` **no está
 * verificado**: exige leer el escenario desplegado, que no es accesible por
 * MCP.
 *
 * El guard definitivo va en el blueprint —`{{if(empty(22.subtipo); ignore;
 * 22.subtipo)}}`— y se aplica en C-5, junto con el diff contra el export
 * desplegado. Hasta entonces, la protección real de este fix es que los valores
 * legítimos **sí traducen** (`Departamento` → `Departamento`), así que la ruta
 * que producía el `""` deja de ejecutarse con datos normales.
 */
