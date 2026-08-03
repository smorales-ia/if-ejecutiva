import { redirect } from "next/navigation"

/**
 * Raíz de la app. Redirige a `/consola`, la ruta base real (CLAUDE.md).
 *
 * ## Por qué dejó de renderizar una consola propia (02-ago-2026)
 *
 * Hasta hoy esta página montaba `SolicitudList` + `SolicitudDetail` sobre el
 * mock `SOLICITUDES` de `lib/console-data.ts`, con ids `"1"`…`"8"`. Era el
 * remanente de la maqueta v0, inofensivo mientras la UI no escribía nada.
 *
 * Dejó de serlo cuando la Tanda 2 conectó la subida real de adjuntos: los
 * botones del sheet de documentos pasaron a llamar endpoints de producción con
 * el id del mock. `POST /api/adjuntos/upload` con `solicitud_id: "3"` llegaba a
 * Make, subía el archivo a Dropbox y **fallaba recién en el módulo 8** con
 * `[422] Value "3" is not a valid record ID` — dejando el archivo huérfano en
 * Dropbox sin fila en `TX_Adjuntos`. El mismo id rompía
 * `GET /api/solicitudes/3/adjuntos`, que devuelve 404 por `isValidRecordId` y
 * pintaba un banner de error en solicitudes que en realidad no existen.
 *
 * Dos pantallas casi idénticas, una con datos reales y otra con mocks, es una
 * trampa: el bug se reporta contra la consola real cuando la prueba ocurrió en
 * la demo. Se elimina la ambigüedad dejando una sola consola.
 */
export default function Page() {
  redirect("/consola")
}
