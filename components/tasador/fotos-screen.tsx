"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Camera, CloudOff, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  resolverInforme,
  type Tasacion,
  type FotoAdjunta,
  type InformeData,
  type FotoCategoriaCustom,
} from "@/lib/tasaciones"
import { readPayload, writePayload } from "@/lib/tasador/tasador-store"
import {
  eliminarFotoDeVisita,
  leerFotosDeVisita,
  subirFotoDeVisita,
} from "@/lib/tasador/fotos"
import { repartirFotos } from "@/lib/tasador/reparto-fotos"
import {
  archivoDeCola,
  drenarCola,
  eliminarDeCola,
  encolarFoto,
  esIdDeCola,
  listarPendientes,
  type FotoEnCola,
} from "@/lib/tasador/cola-fotos"
import { Button } from "@/components/ui/button"
import {
  FotosCategorizadas,
  evaluarCategorias,
  evaluarCustom,
} from "@/components/tasador/fotos-categorizadas"
import { DocumentosAdjuntosSheet } from "@/components/console/documentos-adjuntos-sheet"
import { aSolicitudParaSheet } from "@/lib/tasador/adaptador-solicitud"
import {
  desdeTipoPropiedadNuevoUsado,
  documentoAplicaA,
} from "@/lib/tasador/tipo-propiedad"
import { useAdjuntosSolicitud } from "@/lib/use-adjuntos-solicitud"
import type { TipoDocumento } from "@/lib/use-tipos-documento"

/** Literal §6.1 para el fallo que no sabemos explicar al usuario. */
const MSG_ERROR_RED =
  "No pudimos completar la acción. Intenta nuevamente en unos segundos."
const MSG_SIN_CONEXION =
  "Sin conexión. La foto queda guardada y se sube cuando vuelvas a tener señal."
const MSG_SIN_ALMACENAMIENTO =
  "Tu navegador no permite guardar la foto para reintentarla. Vuelve a tomarla con señal."

/** Una foto de la cola, proyectada a la forma que pinta la pantalla. */
function desdeCola(registro: FotoEnCola): FotoAdjunta {
  return {
    id: registro.id,
    categoria: registro.categoria,
    nombre: registro.nombre,
    url: null,
    thumbnailUrl: null,
    hashMd5: null,
    pendiente: true,
  }
}

export function FotosScreen({ tasacion }: { tasacion: Tasacion }) {
  const router = useRouter()
  const d = tasacion.datos

  const [form, setForm] = useState<InformeData>(
    () => readPayload(tasacion.id) ?? resolverInforme(tasacion),
  )

  // Sincroniza los cambios de fotos con el store compartido.
  useEffect(() => {
    writePayload(tasacion.id, form)
  }, [tasacion.id, form])

  const fotos = form.fotosPredefinidas
  const setCustom: Dispatch<SetStateAction<FotoCategoriaCustom[]>> = useCallback(
    (action) => {
      setForm((prev) => {
        const next =
          typeof action === "function"
            ? (action as (p: FotoCategoriaCustom[]) => FotoCategoriaCustom[])(
                prev.categoriasCustom,
              )
            : action
        return { ...prev, categoriasCustom: next }
      })
    },
    [],
  )

  /* --- Persistencia de fotos (P5-TAS · B2/B3/B4) ------------------------ */

  const [subiendoEn, setSubiendoEn] = useState<string | null>(null)
  const [borrandoId, setBorrandoId] = useState<string | null>(null)
  const [pendientes, setPendientes] = useState(0)

  /**
   * Relee la verdad —`GET /fotos` más la cola— y la proyecta al formulario.
   *
   * Es **la única** vía por la que el listado de fotos cambia. No hay
   * actualización optimista: una foto que la pantalla muestra es una foto que
   * está en `TX_Adjuntos` o en la cola local, nunca una que "debería" estar. Es
   * más lento y es lo correcto para una pantalla cuyo propósito es acreditar
   * que la evidencia de terreno quedó guardada.
   */
  const refrescar = useCallback(async () => {
    let subidas: FotoAdjunta[] = []
    try {
      subidas = await leerFotosDeVisita(tasacion.id)
    } catch (err) {
      // Un fallo de lectura no puede vaciar la pantalla: se conserva lo que ya
      // se mostraba y se sale sin tocar el estado.
      console.error("[FotosScreen] no se pudieron leer las fotos", err)
      return
    }

    const enCola = await listarPendientes(tasacion.id)
    setPendientes(enCola.length)

    setForm((prev) => {
      const { fotosPredefinidas, categoriasCustom } = repartirFotos(
        [...subidas, ...enCola.map(desdeCola)],
        prev.categoriasCustom,
      )
      return { ...prev, fotosPredefinidas, categoriasCustom }
    })
  }, [tasacion.id])

  /**
   * Hidratación al montar y drenaje de la cola al recuperar la conexión.
   *
   * `drenarCola` con la cola vacía es una lectura y nada más, así que este mismo
   * efecto cubre los dos casos sin duplicar la carga inicial.
   */
  useEffect(() => {
    let vivo = true

    const drenar = async () => {
      const resultado = await drenarCola(tasacion.id, async (registro) => {
        const res = await subirFotoDeVisita({
          file: archivoDeCola(registro),
          solicitudId: registro.solicitudId,
          codigoExt: registro.codigoExt,
          categoria: registro.categoria,
        })
        return { ok: res.ok, reintentable: res.ok ? false : res.reintentable }
      })

      if (!vivo) return
      if (resultado.subidas > 0) {
        toast.success(
          resultado.subidas === 1
            ? "Se subió 1 foto que estaba pendiente"
            : `Se subieron ${resultado.subidas} fotos que estaban pendientes`,
        )
      }
      await refrescar()
    }

    void drenar()
    window.addEventListener("online", drenar)
    return () => {
      vivo = false
      window.removeEventListener("online", drenar)
    }
  }, [tasacion.id, refrescar])

  /** Guarda la foto en la cola y avisa. Devuelve `false` si ni eso se pudo. */
  const encolar = useCallback(
    async (categoria: string, file: File, mensaje: string) => {
      const encolada = await encolarFoto({
        solicitudId: tasacion.id,
        codigoExt: tasacion.codigo,
        categoria,
        file,
      })
      if (!encolada) {
        toast.error(MSG_SIN_ALMACENAMIENTO)
        return false
      }
      toast.info(mensaje)
      await refrescar()
      return true
    },
    [tasacion.id, tasacion.codigo, refrescar],
  )

  /**
   * Regla D · el reset de `subiendoEn` va en el `finally`.
   *
   * Sin él, cualquier salida que no pase por el `catch` —un throw síncrono, un
   * fallo de parseo, un timeout— dejaría el botón de esa categoría deshabilitado
   * y con el spinner encendido para el resto de la sesión, y el tasador tendría
   * que recargar en terreno.
   */
  const agregarFoto = useCallback(
    async (categoria: string, file: File) => {
      setSubiendoEn(categoria)
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          await encolar(categoria, file, MSG_SIN_CONEXION)
          return
        }

        const res = await subirFotoDeVisita({
          file,
          solicitudId: tasacion.id,
          codigoExt: tasacion.codigo,
          categoria,
        })

        if (res.ok) {
          await refrescar()
          return
        }

        // Un fallo reintentable en terreno es casi siempre la señal yéndose: la
        // foto va a la cola en vez de perderse. Uno definitivo —archivo
        // demasiado grande, path irresoluble— se informa con su propio literal,
        // que ya explica qué hacer.
        if (res.reintentable) {
          await encolar(categoria, file, MSG_SIN_CONEXION)
          return
        }

        toast.error(res.mensaje)
      } finally {
        setSubiendoEn(null)
      }
    },
    [tasacion.id, tasacion.codigo, encolar, refrescar],
  )

  const borrarFoto = useCallback(
    async (_categoria: string, foto: FotoAdjunta) => {
      setBorrandoId(foto.id)
      try {
        // Una foto que nunca llegó a subir se descarta de la cola: no hay nada
        // que borrar en Dropbox ni en Airtable.
        if (esIdDeCola(foto.id)) {
          await eliminarDeCola(foto.id)
          await refrescar()
          return
        }

        const ok = await eliminarFotoDeVisita({
          adjuntoId: foto.id,
          solicitudId: tasacion.id,
          codigoExt: tasacion.codigo,
          hashMd5: foto.hashMd5,
        })
        if (!ok) {
          toast.error(MSG_ERROR_RED)
          return
        }
        await refrescar()
      } finally {
        setBorrandoId(null)
      }
    },
    [tasacion.id, tasacion.codigo, refrescar],
  )

  /**
   * Eliminar una categoría personalizada borra también sus fotos.
   *
   * Dejarlas huérfanas en `TX_Adjuntos` sería peor que no borrar la categoría:
   * volverían a aparecer en la siguiente hidratación, recreando la categoría que
   * el tasador acaba de quitar. Si algún borrado falla, el refresco final las
   * repone —la pantalla dice la verdad de la base, no la del clic.
   */
  const eliminarCategoria = useCallback(
    async (categoriaId: string) => {
      const cat = form.categoriasCustom.find((c) => c.id === categoriaId)
      if (!cat) return

      for (const foto of cat.fotos) {
        if (esIdDeCola(foto.id)) {
          await eliminarDeCola(foto.id)
          continue
        }
        await eliminarFotoDeVisita({
          adjuntoId: foto.id,
          solicitudId: tasacion.id,
          codigoExt: tasacion.codigo,
          hashMd5: foto.hashMd5,
        })
      }

      setCustom((prev) => prev.filter((c) => c.id !== categoriaId))
      await refrescar()
    },
    [form.categoriasCustom, tasacion.id, tasacion.codigo, setCustom, refrescar],
  )

  /**
   * Sheet documental de la ejecutiva, **reutilizado tal cual** (R7 · RF-TAS-06).
   * Hasta P5-TAS esta pantalla abría una copia de 242 líneas en
   * `components/tasador/sheet-documentos.tsx`, que se eliminó.
   */
  const [docsOpen, setDocsOpen] = useState(false)

  /**
   * Conteo real de documentos para el "N docs" de la cabecera.
   *
   * `activo = !docsOpen` no es un truco: hace que la lectura ocurra al montar y
   * **se repita cuando el sheet se cierra**, que es justo cuando el número pudo
   * cambiar. Mientras el sheet está abierto, el suyo es el que manda; duplicar
   * la consulta ahí sólo sumaría presión sobre el límite de 5 req/s de Airtable
   * que ya documenta `GET /api/solicitudes/[id]/adjuntos`.
   */
  const { adjuntos } = useAdjuntosSolicitud(tasacion.id, !docsOpen)
  const totalDocumentos = adjuntos.length

  /**
   * Filtro de RF-TAS-06: sólo los documentos cuyo `tipo_propiedad` case con la
   * condición de la solicitud, o sea `ambas`.
   *
   * El predicado vive en `lib/tasador/tipo-propiedad.ts` — **paliativo de P-5**,
   * porque los dos dominios de Airtable difieren en género (`nuevo`/`usado` en
   * `TX_Solicitudes`, `nueva`/`usada`/`ambas` en `D_TipoDocumento`) y la
   * comparación literal no casa nunca. Ningún literal de género aparece acá.
   */
  const condicion = useMemo(
    () => desdeTipoPropiedadNuevoUsado(tasacion.tipoPropiedad),
    [tasacion.tipoPropiedad],
  )
  const filtroTipos = useCallback(
    (t: TipoDocumento) => documentoAplicaA(t.tipo_propiedad, condicion),
    [condicion],
  )

  const solicitudParaSheet = useMemo(() => aSolicitudParaSheet(tasacion), [tasacion])

  const declarados = useMemo(
    () => ({
      dorm: Number(form.dormitorios) || 0,
      banos: Number(form.banos) || 0,
      estac: Number(form.estacionamientos) || 0,
    }),
    [form.dormitorios, form.banos, form.estacionamientos],
  )

  const estadosFoto = evaluarCategorias(fotos, declarados)
  const estadosCustom = evaluarCustom(form.categoriasCustom)
  const todas = [...estadosFoto, ...estadosCustom]
  const totalFotos = todas.reduce((a, e) => a + e.count, 0)
  const faltan = todas.filter((e) => !e.completa)
  const completas = faltan.length === 0

  const continuar = () => {
    writePayload(tasacion.id, form)
    router.push(`/tasaciones/${tasacion.id}/lectura`)
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-vp-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/tasaciones"
              aria-label="Volver a mis tasaciones"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-vp-surface"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {tasacion.codigo}
              </span>
              <span className="text-xs text-vp-text-secondary">Fotos de la visita</span>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              completas ? "bg-emerald-50 text-vp-success" : "bg-amber-50 text-vp-warning"
            }`}
          >
            {totalFotos} fotos · {totalDocumentos} docs
          </span>
        </div>
      </header>

      <main className="px-4 pb-32 pt-4">
        <div className="rounded-xl bg-background p-4">
          <p className="text-base font-medium text-foreground">
            {d.comuna.valor} · {d.tipo.valor}
          </p>
          <p className="mt-0.5 text-base text-foreground">{d.direccion.valor}</p>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDocsOpen(true)}
            className="min-h-12 w-full border-vp-primary text-base font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
          >
            <FileText className="h-4 w-4" />
            Cargar documentos de la propiedad
          </Button>
          {/* `readOnly={false}` es obligatorio y no redundante: sin él, el sheet
              degrada a consulta con cualquier estado distinto de `creada`, y una
              tasación siempre está en `asignada` o posterior — el tasador vería
              el checklist sin poder subir nada. */}
          <DocumentosAdjuntosSheet
            open={docsOpen}
            onOpenChange={setDocsOpen}
            solicitud={solicitudParaSheet}
            readOnly={false}
            filtroTipos={filtroTipos}
          />
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-sm text-vp-text-secondary">
          <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
          Cada foto se asocia a una categoría. Mínimos según lo declarado.
        </p>

        {pendientes > 0 && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-vp-warning">
            <CloudOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            {pendientes === 1
              ? "1 foto está guardada en este dispositivo y se subirá cuando vuelvas a tener señal."
              : `${pendientes} fotos están guardadas en este dispositivo y se subirán cuando vuelvas a tener señal.`}
          </p>
        )}

        <div className="mt-3">
          <FotosCategorizadas
            fotos={fotos}
            declarados={declarados}
            custom={form.categoriasCustom}
            setCustom={setCustom}
            onAgregar={agregarFoto}
            onBorrarFoto={borrarFoto}
            onEliminarCategoria={eliminarCategoria}
            subiendoEn={subiendoEn}
            borrandoId={borrandoId}
          />
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl items-center gap-3 border-t border-border bg-background px-4 py-3 shadow-lg">
        <Button
          render={<Link href="/tasaciones" />}
          nativeButton={false}
          variant="outline"
          className="min-h-12 border-vp-primary px-4 text-base font-semibold text-vp-primary hover:bg-blue-50 hover:text-vp-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button
          type="button"
          onClick={continuar}
          className="min-h-12 flex-1 bg-vp-primary text-base font-semibold text-white hover:bg-vp-primary-dark"
        >
          Continuar con datos de la visita
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  )
}
