/**
 * Adaptador `Tasacion` → la forma que consume el sheet documental de IF-02.
 *
 * Plan IF-03 §6.1 · **R7** · RF-TAS-06. Creado en **P5-TAS**.
 *
 * ## Por qué existe
 *
 * §2.6 pide que "Cargar documentos de la propiedad" abra **el mismo componente
 * que usa la ejecutiva**, no una copia: *"un cambio en el checklist de la
 * ejecutiva se refleja en el del tasador sin tocar código de IF-03"*. Ese
 * componente habla `Solicitud` (IF-02) y el tasador tiene `Tasacion` (IF-03).
 * Este módulo es el único punto de traducción entre los dos vocabularios.
 *
 * Hasta P5-TAS el problema se había resuelto **duplicando** el sheet en
 * `components/tasador/sheet-documentos.tsx`, 242 líneas que reimplementaban
 * checklist, zona de carga y contador. Esa copia se eliminó en esta tanda.
 *
 * ## Lo que este adaptador NO hace
 *
 * **No inventa campos.** El sheet declara en
 * `SolicitudParaSheetDocumentos` los cinco que realmente lee, y acá se mapean
 * esos cinco. No se rellenan `rut`, `montoUf` ni los otros treinta de
 * `Solicitud` con cadenas vacías: un dato fabricado es indistinguible de uno
 * real, y el fallo aparecería lejos de acá.
 */

import type { Unidad } from '@/lib/console-data'
import type { Tasacion } from '@/lib/tasador/tasaciones'
import type { SolicitudParaSheetDocumentos } from '@/components/console/documentos-adjuntos-sheet'

/**
 * Traduce las unidades de la tasación a la forma que resuelve el segmento
 * `{Unidad}` del path de Dropbox (§8.1).
 *
 * `TX_Unidades` es la misma tabla en las dos interfaces, pero cada una proyecta
 * los campos que su pantalla necesita: `UnidadSii` trae lo del cuadro de
 * valoración, `Unidad` lo del detalle de la ejecutiva. **Sólo `id` importa acá**
 * — es lo que `DocumentChecklist` manda como `unidad_id` cuando hay dos o más y
 * el tasador elige destino.
 *
 * ⚠ `UnidadSii` **no tiene `id`**: es una proyección de lectura, sin record ID.
 * Por eso el mapeo devuelve `[]` mientras esa proyección no lo incluya, y no un
 * id inventado. La consecuencia está declarada abajo, en {@link aSolicitudParaSheet}.
 */
function unidadesParaPath(): Unidad[] {
  return []
}

/**
 * Proyecta una `Tasacion` a lo que el sheet documental necesita.
 *
 * ## Dos decisiones que conviene tener presentes
 *
 * **1 · `unidades` va vacío, deliberadamente.** Con cero unidades el backend
 * auto-deriva la carpeta `_ingreso/` (`CI-003b`), que es el comportamiento
 * correcto para un documento de la propiedad que el tasador sube en terreno sin
 * atribuirlo a una unidad concreta. Con dos o más, `DocumentChecklist` exigiría
 * elegir destino y el tasador no tiene ese dato a mano en Pantalla 3. Si más
 * adelante `UnidadSii` incorpora el record ID y el negocio quiere la elección
 * por unidad también en IF-03, el cambio vive en {@link unidadesParaPath} y en
 * ningún otro sitio.
 *
 * **2 · `estado` viaja tal cual.** El sheet lo usa sólo para su degradación de
 * sólo-lectura (`readOnly ?? estado !== "creada"`), y una tasación siempre está
 * en `asignada` o posterior. Por eso el llamador de IF-03 **debe pasar
 * `readOnly={false}` explícitamente**: sin eso el tasador vería el checklist en
 * consulta y no podría subir nada, que es justo lo contrario de RF-TAS-06.
 */
export function aSolicitudParaSheet(tasacion: Tasacion): SolicitudParaSheetDocumentos {
  return {
    id: tasacion.id,
    codigoExt: tasacion.codigo,
    cliente: tasacion.cliente,
    estado: tasacion.estado,
    unidades: unidadesParaPath(),
  }
}
