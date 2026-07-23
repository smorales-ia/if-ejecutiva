"use client"

import * as React from "react"
import { Controller, useFieldArray, useForm, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CircleAlert,
  FileText,
  Paperclip,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileUploadZone,
  type ArchivoSubido,
} from "@/components/console/file-upload-zone"
import {
  nuevaSolicitudInternaDefaults,
  nuevaSolicitudInternaSchema,
  nuevaUnidad,
  nuevoContacto,
  type NuevaSolicitudInternaValues,
} from "@/lib/validators/nueva-solicitud-interna"
import {
  BANCOS,
  CANALES_ORIGEN,
  CLIENTES,
  COMUNAS_POR_REGION,
  ESTADOS_CONSERVACION,
  ESTADOS_CONTACTO,
  M_BANCOS,
  MATERIALES,
  ORIGENES_DATO_VENDEDOR,
  ORIGENES_DIRECCION,
  ORIGENES_SUPERFICIE,
  PRODUCTO_LABELS,
  PRODUCTOS_CON_BANCO,
  PRODUCTOS_POR_CLIENTE,
  PRODUCTOS_VENDEDOR_COINCIDE,
  REGIONES,
  ROLES_CONTACTO_VISITA,
  TIPOS_BIEN,
  TIPOS_CLIENTE_ORIGEN,
  TIPOS_INFORME_POR_CLIENTE,
  TIPOS_PROPIEDAD,
  formatearRut,
} from "@/lib/console-data"

type Modo = "documentos" | "manual" | ""
type TipoNU = "nuevo" | "usado" | ""

// Campos que el mock "extrae" de los documentos, con el documento de origen.
const EXTRACCION_MOCK: Partial<Record<keyof NuevaSolicitudInternaValues, string>> =
  {
    direccion: "Av. Apoquindo 3500, Dpto 72",
    region: "Metropolitana",
    comuna: "Las Condes",
    proyecto: "Edificio Nueva Las Condes",
    compradorNombre: "Roberto Fuentes Díaz",
    compradorEmail: "rfuentes@correo.cl",
  }

const EXTRACCION_DOC: Partial<Record<keyof NuevaSolicitudInternaValues, string>> =
  {
    direccion: "certificado_numero.pdf",
    region: "certificado_avaluo.pdf",
    comuna: "certificado_avaluo.pdf",
    proyecto: "brochure_proyecto.pdf",
    compradorNombre: "cedula_identidad.pdf",
    compradorEmail: "correo_contacto.pdf",
  }

// N° de operación ya registrados (mock de conflicto de datos en el "servidor").
const OPERACIONES_REGISTRADAS = new Set(["12345", "99999", "00000"])

// Etiquetas legibles por campo, para nombrar el dato con problema.
const FIELD_LABELS: Record<string, string> = {
  canal: "Canal de origen",
  cliente: "Cliente",
  tipoClienteOrigen: "Tipo de cliente",
  tipoInforme: "Tipo de informe",
  banco_id: "Banco (originador)",
  n_operacion_cliente: "N° de operación",
  proyecto: "Proyecto / condominio",
  direccion: "Dirección",
  origenDireccion: "Origen de la dirección",
  region: "Región",
  comuna: "Comuna",
  tipoPropiedad: "Tipo de propiedad",
  estadoConservacion: "Estado de conservación",
  vendedorOrigenDato: "Origen del dato (vendedor)",
  unidades: "Unidades",
  compradorRut: "RUT del comprador",
  compradorNombre: "Nombre del comprador",
  compradorEmail: "Email del comprador",
  contactosVisita: "Contactos de visita",
  producto: "Producto",
  banco: "Banco financista",
}

const UNIDAD_LABELS: Record<string, string> = {
  ubicacion: "Ubicación (depto / torre / piso)",
  modelo: "Modelo",
  tipoBien: "Tipo de bien",
  rolSii: "Rol SII",
  supConstruida: "Superficie construida",
  material: "Material predominante",
  origenSuperficie: "Origen de la superficie",
  respaldo: "Respaldo adjunto",
  detalleItem: "Detalle del ítem",
}

const CONTACTO_LABELS: Record<string, string> = {
  rol: "Rol",
  nombre: "Nombre",
  telefono: "Teléfono",
  email: "Email",
  estado: "Estado",
}

type ErrorItem = { label: string; message: string }

/** Extrae un mensaje de error de un nodo de react-hook-form (campo o raíz). */
function mensajeDe(node: unknown): string | undefined {
  if (!node || typeof node !== "object") return undefined
  const n = node as { message?: unknown; root?: { message?: unknown } }
  if (typeof n.message === "string" && n.message) return n.message
  if (typeof n.root?.message === "string" && n.root.message)
    return n.root.message
  return undefined
}

/**
 * Aplana el objeto `errors` de react-hook-form en una lista legible de
 * { dato, motivo }, incluyendo los bloques repetibles (unidades y contactos).
 */
function recolectarErrores(errors: Record<string, unknown>): ErrorItem[] {
  const out: ErrorItem[] = []

  for (const key of Object.keys(errors)) {
    const val = errors[key] as Record<string, unknown> | undefined
    if (!val) continue

    if (key === "unidades" || key === "contactosVisita") {
      const grupo = key === "unidades" ? "Unidad" : "Contacto"
      const labels = key === "unidades" ? UNIDAD_LABELS : CONTACTO_LABELS
      // Error a nivel del arreglo (p. ej. "agrega al menos una unidad").
      const raiz = mensajeDe(val)
      if (raiz) out.push({ label: FIELD_LABELS[key], message: raiz })
      // Errores por índice del arreglo.
      for (const idxKey of Object.keys(val)) {
        const idx = Number(idxKey)
        if (Number.isNaN(idx)) continue
        const fila = val[idxKey] as Record<string, unknown> | undefined
        if (!fila) continue
        for (const campo of Object.keys(fila)) {
          const msg = mensajeDe(fila[campo])
          if (msg)
            out.push({
              label: `${grupo} ${idx + 1} · ${labels[campo] ?? campo}`,
              message: msg,
            })
        }
      }
      continue
    }

    const msg = mensajeDe(val)
    if (msg) out.push({ label: FIELD_LABELS[key] ?? key, message: msg })
  }

  return out
}

// ── Helpers de presentación ───────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  extraido,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  extraido?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5" data-invalid={error ? "" : undefined}>
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {extraido && (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
            <Sparkles className="size-2.5" />
            {`Extraído · ${extraido}`}
          </span>
        )}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function Collapsible({
  title,
  defaultOpen = true,
  children,
}: {
  title: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <section className="flex flex-col gap-0 rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border p-4">
          {children}
        </div>
      )}
    </section>
  )
}

/** Radio en formato de tarjetas seleccionables. */
function RadioCards({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; description?: string }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              selected
                ? "border-brand bg-brand/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-brand" : "border-muted-foreground/40",
              )}
            >
              {selected && <span className="size-2 rounded-full bg-brand" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {opt.label}
              </span>
              {opt.description && (
                <span className="text-xs text-muted-foreground">
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Radio horizontal compacto (con rol / uso y goce, sí / no). */
function SegmentedRadio({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              selected
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Stepper({ phase }: { phase: 1 | 2 | 3 }) {
  const steps = ["Modo", "Tipo", "Formulario"]
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const active = n === phase
        const done = n < phase
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                active
                  ? "bg-brand text-brand-foreground"
                  : done
                    ? "bg-brand/20 text-brand"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {n}
            </span>
            <span
              className={cn(
                "font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 text-muted-foreground">→</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ── Tarjeta de unidad (bloque repetible) ────────────────────────────────────

function UnidadCard({
  control,
  index,
  esNuevo,
  onRemove,
  canRemove,
  tipoBien,
  errors,
}: {
  control: Control<NuevaSolicitudInternaValues>
  index: number
  esNuevo: boolean
  onRemove: () => void
  canRemove: boolean
  tipoBien: string
  errors: Record<string, { message?: string }> | undefined
  // errors typed loosely to keep nested access simple
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const err = (name: string) => errors?.[name]?.message

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Unidad {index + 1}
        </span>
        {canRemove && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Eliminar unidad
            </Button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta unidad?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se descartarán los datos y el respaldo cargado de la unidad{" "}
                    {index + 1}. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Conservar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onRemove}>
                    Eliminar unidad
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name={`unidades.${index}.ubicacion`}
          render={({ field }) => (
            <Field label="Depto / Torre / Piso" required error={err("ubicacion")}>
              <Input placeholder="Ej. Torre B · Piso 7 · Depto 72" {...field} />
            </Field>
          )}
        />
        {esNuevo && (
          <Controller
            control={control}
            name={`unidades.${index}.modelo`}
            render={({ field }) => (
              <Field label="Modelo">
                <Input placeholder="Ej. Modelo tipo B" {...field} />
              </Field>
            )}
          />
        )}
      </div>

      <Controller
        control={control}
        name={`unidades.${index}.tipoBien`}
        render={({ field }) => (
          <Field label="Tipo de bien" required error={err("tipoBien")}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIPOS_BIEN.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Con rol / Uso y goce</Label>
          <Controller
            control={control}
            name={`unidades.${index}.rolModo`}
            render={({ field }) => (
              <SegmentedRadio
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "con_rol", label: "Con rol" },
                  { value: "uso_goce", label: "Uso y goce" },
                ]}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name={`unidades.${index}.rolModo`}
          render={({ field: rolModoField }) =>
            rolModoField.value === "con_rol" ? (
              <div className="flex flex-col gap-2">
                <Controller
                  control={control}
                  name={`unidades.${index}.rolSii`}
                  render={({ field }) => (
                    <Field label="Rol SII" error={err("rolSii")} hint="Formato NNNNN-N">
                      <Input placeholder="12345-6" {...field} />
                    </Field>
                  )}
                />
                {esNuevo && (
                  <Controller
                    control={control}
                    name={`unidades.${index}.rolEnTramite`}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                        Rol en trámite
                      </label>
                    )}
                  />
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Unidad en uso y goce · no requiere rol SII.
              </p>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Controller
          control={control}
          name={`unidades.${index}.supConstruida`}
          render={({ field }) => (
            <Field label="Sup. construida m²" required error={err("supConstruida")}>
              <Input inputMode="numeric" placeholder="0" {...field} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`unidades.${index}.supTerraza`}
          render={({ field }) => (
            <Field label="Sup. terraza m²">
              <Input inputMode="numeric" placeholder="0" {...field} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`unidades.${index}.supTerreno`}
          render={({ field }) => (
            <Field label="Sup. terreno m²">
              <Input inputMode="numeric" placeholder="0" {...field} />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name={`unidades.${index}.anioConstruccion`}
          render={({ field }) => (
            <Field label="Año de construcción">
              <Input inputMode="numeric" placeholder="Ej. 2019" {...field} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`unidades.${index}.material`}
          render={({ field }) => (
            <Field label="Material predominante" required error={err("material")}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MATERIALES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      {!esNuevo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name={`unidades.${index}.m2Ampliacion`}
            render={({ field }) => (
              <Field label="m² de ampliación">
                <Input inputMode="numeric" placeholder="0" {...field} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name={`unidades.${index}.regularizable`}
            render={({ field }) => (
              <Field label="¿Regularizable?">
                <SegmentedRadio
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={[
                    { value: "si", label: "Sí" },
                    { value: "no", label: "No" },
                  ]}
                />
              </Field>
            )}
          />
        </div>
      )}

      <Controller
        control={control}
        name={`unidades.${index}.origenSuperficie`}
        render={({ field }) => (
          <Field
            label="Origen de la superficie"
            required
            error={err("origenSuperficie")}
          >
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ORIGENES_SUPERFICIE.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {tipoBien === "Obras complementarias" && (
        <Controller
          control={control}
          name={`unidades.${index}.detalleItem`}
          render={({ field }) => (
            <Field
              label="Detalle del ítem"
              required
              error={err("detalleItem")}
            >
              <Textarea
                rows={2}
                placeholder="Describe las obras complementarias…"
                {...field}
              />
            </Field>
          )}
        />
      )}

      {/* Respaldo obligatorio */}
      <Controller
        control={control}
        name={`unidades.${index}.respaldo`}
        render={({ field }) => (
          <Field label="Respaldo" required error={err("respaldo")}>
            {field.value ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-brand">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">{field.value.nombre}</span>
                </span>
                <button
                  type="button"
                  onClick={() => field.onChange(null)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <FileUploadZone
                variant="compact"
                onUploaded={(arch: ArchivoSubido[]) => {
                  const a = arch[0]
                  if (a)
                    field.onChange({
                      nombre: a.nombre,
                      tamanio_kb: 0,
                      mime_type: "",
                      url_local: "",
                    })
                }}
              />
            )}
          </Field>
        )}
      />
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────

export function NewRequestSheet() {
  const [open, setOpen] = React.useState(false)
  const [phase, setPhase] = React.useState<1 | 2 | 3>(1)
  const [modo, setModo] = React.useState<Modo>("")
  const [tipoNU, setTipoNU] = React.useState<TipoNU>("")
  const [docs, setDocs] = React.useState<ArchivoSubido[]>([])
  const [procesando, setProcesando] = React.useState(false)
  const [extraidos, setExtraidos] = React.useState<Set<string>>(new Set())
  const [mostrarResumen, setMostrarResumen] = React.useState(false)
  // Confirmaciones del wizard (§4.1): continuar sin documentos · descartar en curso.
  const [confirmSinDocs, setConfirmSinDocs] = React.useState(false)
  const [confirmDescartar, setConfirmDescartar] = React.useState(false)
  const initialized = React.useRef(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NuevaSolicitudInternaValues>({
    resolver: zodResolver(nuevaSolicitudInternaSchema),
    defaultValues: nuevaSolicitudInternaDefaults,
    mode: "onChange",
  })

  const {
    fields: unidadFields,
    append: appendUnidad,
    remove: removeUnidad,
  } = useFieldArray({ control, name: "unidades" })

  const {
    fields: contactoFields,
    append: appendContacto,
    remove: removeContacto,
    move: moveContacto,
  } = useFieldArray({ control, name: "contactosVisita" })

  const cliente = watch("cliente")
  const region = watch("region")
  const producto = watch("producto")
  const tipoNuevoUsado = watch("tipoPropiedadNuevoUsado")
  const vendedorCoincide = watch("vendedorCoincideComprador")
  const unidadesWatch = watch("unidades")

  const esNuevo = tipoNuevoUsado === "nuevo"
  const tiposInforme = cliente ? TIPOS_INFORME_POR_CLIENTE[cliente] ?? [] : []
  const productos = cliente ? PRODUCTOS_POR_CLIENTE[cliente] ?? [] : []
  const comunas = region ? COMUNAS_POR_REGION[region] ?? [] : []
  const requiereBanco = PRODUCTOS_CON_BANCO.includes(producto)
  const vendedorCoincidePermitido =
    PRODUCTOS_VENDEDOR_COINCIDE.includes(producto)

  const extraidoDe = (key: keyof NuevaSolicitudInternaValues) =>
    modo === "documentos" && extraidos.has(key)
      ? EXTRACCION_DOC[key]
      : undefined

  function handleClienteChange(value: string, onChange: (v: string) => void) {
    onChange(value)
    setValue("tipoInforme", "", { shouldValidate: false })
    setValue("producto", "", { shouldValidate: false })
    setValue("banco", "", { shouldValidate: false })
  }

  function handleRegionChange(value: string, onChange: (v: string) => void) {
    onChange(value)
    setValue("comuna", "", { shouldValidate: false })
  }

  // Copia comprador → vendedor cuando se marca "vendedor coincide".
  function handleVendedorCoincide(next: boolean) {
    setValue("vendedorCoincideComprador", next)
    if (next) {
      setValue("vendedorNombre", getValues("compradorNombre"))
      setValue("vendedorRut", getValues("compradorRut"))
      setValue("vendedorCorreo", getValues("compradorEmail"))
      setValue("vendedorTelefono", getValues("compradorTelefono") ?? "")
    }
  }

  function resetAll() {
    reset({
      ...nuevaSolicitudInternaDefaults,
      unidades: [nuevaUnidad()],
      contactosVisita: [nuevoContacto()],
    })
    setPhase(1)
    setModo("")
    setTipoNU("")
    setDocs([])
    setProcesando(false)
    setExtraidos(new Set())
    setMostrarResumen(false)
    initialized.current = false
  }

  function irAFormulario(tipo: "nuevo" | "usado") {
    if (!initialized.current) {
      initialized.current = true
      const base: NuevaSolicitudInternaValues = {
        ...nuevaSolicitudInternaDefaults,
        tipoPropiedadNuevoUsado: tipo,
        unidades: [nuevaUnidad()],
        contactosVisita: [nuevoContacto()],
      }
      const keys = new Set<string>()
      if (modo === "documentos") {
        for (const k of Object.keys(EXTRACCION_MOCK) as (keyof NuevaSolicitudInternaValues)[]) {
          const val = EXTRACCION_MOCK[k]
          if (val != null) {
            // @ts-expect-error asignación dinámica de campos string del mock
            base[k] = val
            keys.add(k as string)
          }
        }
      }
      reset(base)
      setExtraidos(keys)
    } else {
      setValue("tipoPropiedadNuevoUsado", tipo)
    }
    setPhase(3)
  }

  // Simula el análisis de los documentos adjuntos (RF-09 real llega en P9).
  function procesarDocumentos() {
    setProcesando(true)
    setTimeout(() => {
      setProcesando(false)
      toast.success("Documentos procesados", {
        description: `${docs.length} archivo${docs.length === 1 ? "" : "s"} analizado${docs.length === 1 ? "" : "s"}.`,
        duration: 3000,
      })
      setPhase(2)
    }, 2000)
  }

  function continuarDesdeModo() {
    if (modo === "manual") {
      setPhase(2)
      return
    }
    if (modo === "documentos") {
      // §4.1: Continuar siempre habilitado; sin archivos, se confirma antes.
      if (docs.length === 0) {
        setConfirmSinDocs(true)
        return
      }
      procesarDocumentos()
    }
  }

  function onSubmit(values: NuevaSolicitudInternaValues) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Validación de negocio: N° de operación duplicado (conflicto de dato).
        const operacion = values.n_operacion_cliente.trim()
        if (OPERACIONES_REGISTRADAS.has(operacion)) {
          setError("n_operacion_cliente", {
            type: "server",
            message: `Ya existe una solicitud con el N° de operación ${operacion}.`,
          })
          setMostrarResumen(true)
          toast.error("No se pudo crear la solicitud", {
            description: `N° de operación: ya existe una solicitud registrada con el N° ${operacion}.`,
            duration: 5000,
          })
          resolve()
          return
        }

        toast.success("Solicitud interna creada", {
          description: `${values.cliente} · ${values.comuna} · ${values.unidades.length} unidad${values.unidades.length === 1 ? "" : "es"} · Op. ${values.n_operacion_cliente}`,
          duration: 3000,
        })
        resetAll()
        setOpen(false)
        resolve()
      }, 800)
    })
  }

  function onInvalid(formErrors: typeof errors) {
    setMostrarResumen(true)
    const lista = recolectarErrores(formErrors as Record<string, unknown>)
    const detalle =
      lista.length > 0
        ? lista
            .slice(0, 3)
            .map((e) => `${e.label}: ${e.message}`)
            .join(" · ") + (lista.length > 3 ? ` (+${lista.length - 3} más)` : "")
        : "Revisa los campos marcados en el formulario."
    toast.error(
      lista.length > 0
        ? `No se pudo crear · ${lista.length} dato${lista.length === 1 ? "" : "s"} con problemas`
        : "No se pudo crear la solicitud",
      { description: detalle, duration: 5000 },
    )
  }

  // §4.1: habilitado con sólo elegir modo. En "documentos" sin archivos, el
  // click abre el AlertDialog de confirmación (no se deshabilita el botón).
  const continuarModoHabilitado = modo !== "" && !procesando

  // Hay una solicitud en curso si el usuario avanzó o capturó algo (§4.1).
  const haySolicitudEnCurso =
    modo !== "" || tipoNU !== "" || docs.length > 0 || phase > 1

  const resumenErrores = recolectarErrores(errors as Record<string, unknown>)

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // §4.1: al cerrar con una solicitud en curso, confirmar antes de descartar.
        if (!next && haySolicitudEnCurso) {
          setConfirmDescartar(true)
          return
        }
        setOpen(next)
        if (!next) resetAll()
      }}
    >
      <SheetTrigger
        render={
          <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus data-icon="inline-start" />
            Nueva solicitud interna
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Nueva solicitud interna</SheetTitle>
          <SheetDescription>
            Asistente en 3 pasos. Completa cada fase para habilitar la siguiente.
          </SheetDescription>
          <div className="pt-2">
            <Stepper phase={phase} />
          </div>
        </SheetHeader>

        {/* ── Fase 1 · Modo de creación ── */}
        {phase === 1 && (
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
            <section className="flex flex-col gap-3">
              <SectionTitle>Modo de creación</SectionTitle>
              <RadioCards
                value={modo}
                onChange={(v) => setModo(v as Modo)}
                options={[
                  {
                    value: "documentos",
                    label: "En base a documentos adjuntos",
                    description:
                      "Sube los documentos y prellenaremos el formulario con los datos detectados.",
                  },
                  {
                    value: "manual",
                    label: "Ingreso manual",
                    description: "Completa el formulario desde cero.",
                  },
                ]}
              />
            </section>

            {modo === "documentos" && (
              <section className="flex flex-col gap-3">
                <SectionTitle>Documentos de origen</SectionTitle>
                <FileUploadZone
                  multiple
                  onUploaded={(nuevos) => setDocs((prev) => [...prev, ...nuevos])}
                />
                {docs.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate font-medium text-foreground">
                          {d.nombre}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDocs((prev) => prev.filter((x) => x.id !== d.id))
                          }
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}

        {/* ── Fase 2 · Tipo de propiedad ── */}
        {phase === 2 && (
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
            {modo === "documentos" && (
              <div className="flex items-start gap-3 rounded-lg border border-brand/30 bg-brand/5 p-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Sugerencia: Nuevo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Basado en: nombre de proyecto detectado, dominio del correo de
                    contacto. Confirma la clasificación correcta.
                  </p>
                </div>
              </div>
            )}
            <section className="flex flex-col gap-3">
              <SectionTitle>Tipo de propiedad</SectionTitle>
              <RadioCards
                value={tipoNU}
                onChange={(v) => setTipoNU(v as TipoNU)}
                options={[
                  {
                    value: "nuevo",
                    label: "Nuevo",
                    description:
                      "Propiedad de primera transferencia (proyecto inmobiliario).",
                  },
                  {
                    value: "usado",
                    label: "Usado",
                    description: "Propiedad de segunda o posterior transferencia.",
                  },
                ]}
              />
            </section>
          </div>
        )}

        {/* ── Fase 3 · Formulario ── */}
        {phase === 3 && (
          <form
            id="nueva-solicitud-form"
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
            noValidate
          >
            {/* Resumen de datos que impiden crear la solicitud */}
            {mostrarResumen && resumenErrores.length > 0 && (
              <Alert variant="destructive" className="border-destructive/40">
                <CircleAlert />
                <AlertTitle>
                  No se pudo crear la solicitud · {resumenErrores.length} dato
                  {resumenErrores.length === 1 ? "" : "s"} con problemas
                </AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 flex list-none flex-col gap-1">
                    {resumenErrores.map((e, i) => (
                      <li key={`${e.label}-${i}`} className="text-xs">
                        <span className="font-medium text-destructive">
                          {e.label}:
                        </span>{" "}
                        <span className="text-destructive/90">{e.message}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Sección A · Origen y cliente */}
            <Collapsible title="A · Origen y cliente">
              <Controller
                control={control}
                name="canal"
                render={({ field }) => (
                  <Field label="Canal de origen" required error={errors.canal?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CANALES_ORIGEN.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="cliente"
                render={({ field }) => (
                  <Field label="Cliente" required error={errors.cliente?.message}>
                    <Select
                      value={field.value}
                      onValueChange={(v) => handleClienteChange(v ?? "", field.onChange)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CLIENTES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="tipoClienteOrigen"
                render={({ field }) => (
                  <Field
                    label="Tipo de cliente de origen"
                    required
                    error={errors.tipoClienteOrigen?.message}
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {TIPOS_CLIENTE_ORIGEN.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="tipoInforme"
                render={({ field }) => (
                  <Field
                    label="Tipo de informe"
                    required
                    error={errors.tipoInforme?.message}
                    hint={!cliente ? "Selecciona primero un cliente." : undefined}
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!cliente}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {tiposInforme.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="banco_id"
                  render={({ field }) => (
                    <Field label="Banco" required error={errors.banco_id?.message}>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {M_BANCOS.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.nombre}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="n_operacion_cliente"
                  render={({ field }) => (
                    <Field
                      label="N° de operación cliente"
                      required
                      error={errors.n_operacion_cliente?.message}
                    >
                      <Input placeholder="Ej. 900158881" maxLength={20} {...field} />
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="ejec_comercializador"
                  render={({ field }) => (
                    <Field label="Ejec. Comercializador">
                      <Input placeholder="Nombre del ejecutivo" {...field} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="ejec_formalizador"
                  render={({ field }) => (
                    <Field label="Ejec. Formalizador">
                      <Input placeholder="Nombre del ejecutivo" {...field} />
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="sucursal_originadora"
                  render={({ field }) => (
                    <Field label="Sucursal originadora">
                      <Input placeholder="Ej. Sucursal Providencia" {...field} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="ejecutivo_solicitante"
                  render={({ field }) => (
                    <Field label="Ejecutivo solicitante">
                      <Input placeholder="Ejecutivo del banco" {...field} />
                    </Field>
                  )}
                />
              </div>
            </Collapsible>

            {/* Sección B · Propiedad */}
            <Collapsible title="B · Propiedad">
              {/* B.1 · Datos de la propiedad */}
              <SectionTitle>B.1 · Datos de la propiedad</SectionTitle>
              {esNuevo && (
                <Controller
                  control={control}
                  name="proyecto"
                  render={({ field }) => (
                    <Field
                      label="Proyecto o condominio"
                      required
                      error={errors.proyecto?.message}
                      extraido={extraidoDe("proyecto")}
                    >
                      <Input placeholder="Nombre del proyecto" {...field} />
                    </Field>
                  )}
                />
              )}
              <Controller
                control={control}
                name="direccion"
                render={({ field }) => (
                  <Field
                    label="Dirección"
                    required
                    error={errors.direccion?.message}
                    extraido={extraidoDe("direccion")}
                  >
                    <Input placeholder="Calle, número, depto / oficina" {...field} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="origenDireccion"
                render={({ field }) => (
                  <Field
                    label="Origen dirección"
                    required
                    error={errors.origenDireccion?.message}
                  >
                    <RadioCards
                      value={field.value}
                      onChange={field.onChange}
                      options={ORIGENES_DIRECCION.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                    />
                  </Field>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="region"
                  render={({ field }) => (
                    <Field
                      label="Región"
                      required
                      error={errors.region?.message}
                      extraido={extraidoDe("region")}
                    >
                      <Select
                        value={field.value}
                        onValueChange={(v) => handleRegionChange(v ?? "", field.onChange)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Región" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {REGIONES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="comuna"
                  render={({ field }) => (
                    <Field
                      label="Comuna"
                      required
                      error={errors.comuna?.message}
                      hint={!region ? "Selecciona una región." : undefined}
                      extraido={extraidoDe("comuna")}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!region}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Comuna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {comunas.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="tipoPropiedad"
                  render={({ field }) => (
                    <Field
                      label="Tipo de propiedad"
                      required
                      error={errors.tipoPropiedad?.message}
                    >
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {TIPOS_PROPIEDAD.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="estadoConservacion"
                  render={({ field }) => (
                    <Field
                      label="Estado de conservación"
                      required
                      error={errors.estadoConservacion?.message}
                    >
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ESTADOS_CONSERVACION.map((e) => (
                              <SelectItem key={e} value={e}>
                                {e}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>

              <Separator />

              {/* B.2 · Vendedor */}
              <SectionTitle>B.2 · Vendedor</SectionTitle>
              {esNuevo ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="vendedorRazonSocial"
                    render={({ field }) => (
                      <Field label="Razón social">
                        <Input placeholder="Inmobiliaria…" {...field} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name="vendedorRutInmobiliaria"
                    render={({ field }) => (
                      <Field label="RUT inmobiliaria">
                        <Input
                          placeholder="76.123.456-7"
                          value={field.value}
                          onChange={(e) => field.onChange(formatearRut(e.target.value))}
                        />
                      </Field>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="vendedorNombre"
                    render={({ field }) => (
                      <Field label="Nombre completo propietario">
                        <Input placeholder="Nombre y apellidos" {...field} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name="vendedorRut"
                    render={({ field }) => (
                      <Field label="RUT propietario">
                        <Input
                          placeholder="12.345.678-9"
                          value={field.value}
                          onChange={(e) => field.onChange(formatearRut(e.target.value))}
                        />
                      </Field>
                    )}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="vendedorCorreo"
                  render={({ field }) => (
                    <Field label="Correo contacto">
                      <Input type="email" placeholder="correo@dominio.cl" {...field} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="vendedorTelefono"
                  render={({ field }) => (
                    <Field label="Teléfono contacto">
                      <Input inputMode="tel" placeholder="+56 9 ..." {...field} />
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="vendedorOrigenDato"
                render={({ field }) => (
                  <Field
                    label="Origen del dato"
                    required
                    error={errors.vendedorOrigenDato?.message}
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el origen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ORIGENES_DATO_VENDEDOR.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Separator />

              {/* B.3 · Unidades */}
              <div className="flex items-center justify-between">
                <SectionTitle>B.3 · Unidades</SectionTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendUnidad(nuevaUnidad())}
                >
                  <Plus data-icon="inline-start" />
                  Agregar unidad
                </Button>
              </div>
              {typeof errors.unidades?.message === "string" && (
                <p className="text-xs text-destructive">{errors.unidades.message}</p>
              )}
              <div className="flex flex-col gap-3">
                {unidadFields.map((f, index) => (
                  <UnidadCard
                    key={f.id}
                    control={control}
                    index={index}
                    esNuevo={esNuevo}
                    onRemove={() => removeUnidad(index)}
                    canRemove={unidadFields.length > 1}
                    tipoBien={unidadesWatch?.[index]?.tipoBien ?? ""}
                    errors={
                      errors.unidades?.[index] as
                        | Record<string, { message?: string }>
                        | undefined
                    }
                  />
                ))}
              </div>
            </Collapsible>

            {/* Sección C · Personas de la operación */}
            <Collapsible title="C · Personas de la operación">
              <SectionTitle>Comprador (cliente final evaluado)</SectionTitle>
              <Controller
                control={control}
                name="compradorNombre"
                render={({ field }) => (
                  <Field
                    label="Nombre completo"
                    required
                    error={errors.compradorNombre?.message}
                    extraido={extraidoDe("compradorNombre")}
                  >
                    <Input placeholder="Nombre y apellidos" {...field} />
                  </Field>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="compradorRut"
                  render={({ field }) => (
                    <Field label="RUT" required error={errors.compradorRut?.message}>
                      <Input
                        placeholder="12.345.678-9"
                        value={field.value}
                        onChange={(e) => field.onChange(formatearRut(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="compradorTelefono"
                  render={({ field }) => (
                    <Field label="Teléfono">
                      <Input inputMode="tel" placeholder="+56 9 ..." {...field} />
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="compradorEmail"
                render={({ field }) => (
                  <Field
                    label="Email"
                    required
                    error={errors.compradorEmail?.message}
                    extraido={extraidoDe("compradorEmail")}
                  >
                    <Input type="email" placeholder="correo@dominio.cl" {...field} />
                  </Field>
                )}
              />

              {vendedorCoincidePermitido && (
                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  <Checkbox
                    checked={vendedorCoincide}
                    onCheckedChange={(v) => handleVendedorCoincide(v === true)}
                  />
                  Vendedor coincide con comprador (refinanciamiento)
                </label>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <SectionTitle>Contactos de visita</SectionTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendContacto(nuevoContacto())}
                >
                  <Plus data-icon="inline-start" />
                  Agregar contacto
                </Button>
              </div>
              {typeof errors.contactosVisita?.message === "string" && (
                <p className="text-xs text-destructive">
                  {errors.contactosVisita.message}
                </p>
              )}
              <div className="flex flex-col gap-3">
                {contactoFields.map((f, index) => {
                  const cErr = errors.contactosVisita?.[index] as
                    | Record<string, { message?: string }>
                    | undefined
                  return (
                    <div
                      key={f.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          Contacto {index + 1}
                          {index === 0 && (
                            <Badge className="bg-brand text-brand-foreground">
                              Principal
                            </Badge>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Subir contacto"
                            disabled={index === 0}
                            onClick={() => moveContacto(index, index - 1)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Bajar contacto"
                            disabled={index === contactoFields.length - 1}
                            onClick={() => moveContacto(index, index + 1)}
                          >
                            <ArrowDown />
                          </Button>
                          {contactoFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Eliminar contacto"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeContacto(index)}
                            >
                              <X />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                          control={control}
                          name={`contactosVisita.${index}.rol`}
                          render={({ field }) => (
                            <Field label="Rol" required error={cErr?.rol?.message}>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {ROLES_CONTACTO_VISITA.map((r) => (
                                      <SelectItem key={r} value={r}>
                                        {r}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`contactosVisita.${index}.nombre`}
                          render={({ field }) => (
                            <Field label="Nombre" required error={cErr?.nombre?.message}>
                              <Input placeholder="Nombre del contacto" {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`contactosVisita.${index}.telefono`}
                          render={({ field }) => (
                            <Field label="Teléfono">
                              <Input inputMode="tel" placeholder="+56 9 ..." {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`contactosVisita.${index}.email`}
                          render={({ field }) => (
                            <Field label="Email">
                              <Input type="email" placeholder="correo@dominio.cl" {...field} />
                            </Field>
                          )}
                        />
                      </div>
                      <Controller
                        control={control}
                        name={`contactosVisita.${index}.estado`}
                        render={({ field }) => (
                          <Field label="Estado del contacto" required error={cErr?.estado?.message}>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {ESTADOS_CONTACTO.map((e) => (
                                    <SelectItem key={e} value={e}>
                                      {e}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </Collapsible>

            {/* Sección D · Producto y observaciones */}
            <Collapsible title="D · Producto y observaciones">
              <Controller
                control={control}
                name="producto"
                render={({ field }) => (
                  <Field
                    label="Producto"
                    required
                    error={errors.producto?.message}
                    hint={!cliente ? "Selecciona primero un cliente." : undefined}
                  >
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v ?? "")
                        if (!PRODUCTOS_CON_BANCO.includes(v ?? ""))
                          setValue("banco", "", { shouldValidate: false })
                      }}
                      disabled={!cliente}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {productos.map((p) => (
                            <SelectItem key={p} value={p}>
                              {PRODUCTO_LABELS[p] ?? p}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              {requiereBanco && (
                <Controller
                  control={control}
                  name="banco"
                  render={({ field }) => (
                    <Field
                      label="Banco financista"
                      required
                      error={errors.banco?.message}
                      hint="Requerido para productos hipotecarios y de refinanciamiento."
                    >
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona el banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {BANCOS.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              )}
              <Controller
                control={control}
                name="observaciones"
                render={({ field }) => (
                  <Field label="Observaciones">
                    <Textarea
                      rows={3}
                      placeholder="Notas de coordinación, accesos, contactos..."
                      {...field}
                    />
                  </Field>
                )}
              />

              {esNuevo && (
                <Collapsible title="Financiero" defaultOpen={false}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["valorTotalUf", "Valor total UF"],
                        ["subsidio", "Subsidio habitacional"],
                        ["ahorro", "Ahorro"],
                        ["mutuo", "Mutuo hipotecario"],
                        ["pagoContado", "Pago contado"],
                        ["bonoCaptacion", "Bono captación"],
                        ["bonoIntegracion", "Bono integración"],
                        ["precioVenta", "Precio de venta"],
                      ] as const
                    ).map(([name, label]) => (
                      <Controller
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <Field label={label}>
                            <Input inputMode="numeric" placeholder="0" {...field} />
                          </Field>
                        )}
                      />
                    ))}
                  </div>
                </Collapsible>
              )}
            </Collapsible>
          </form>
        )}

        {/* ── Footer con navegación del wizard ── */}
        <SheetFooter className="flex-row justify-between gap-2 border-t border-border">
          {phase === 1 ? (
            <SheetClose
              render={
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              }
            />
          ) : (
            <Button
              variant="outline"
              type="button"
              onClick={() => setPhase((p) => (p === 3 ? 2 : 1))}
            >
              Volver
            </Button>
          )}

          {phase === 1 && (
            <Button
              type="button"
              onClick={continuarDesdeModo}
              disabled={!continuarModoHabilitado}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {procesando ? "Procesando…" : "Continuar"}
            </Button>
          )}
          {phase === 2 && (
            <Button
              type="button"
              onClick={() => irAFormulario(tipoNU as "nuevo" | "usado")}
              disabled={tipoNU === ""}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Continuar
            </Button>
          )}
          {phase === 3 && (
            <Button
              type="submit"
              form="nueva-solicitud-form"
              disabled={isSubmitting}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isSubmitting ? "Creando…" : "Crear solicitud"}
            </Button>
          )}
        </SheetFooter>

        {/* §4.1 · Confirmar continuar sin documentos (modo "documentos") */}
        <AlertDialog open={confirmSinDocs} onOpenChange={setConfirmSinDocs}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Continuar sin documentos?</AlertDialogTitle>
              <AlertDialogDescription>
                Elegiste crear la solicitud en base a documentos, pero no adjuntaste
                ninguno. Puedes continuar y completar el formulario manualmente, o
                volver y subir los documentos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver y adjuntar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setConfirmSinDocs(false)
                  setPhase(2)
                }}
              >
                Continuar sin documentos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* §4.1 · Confirmar descartar la solicitud en curso al cerrar el Sheet */}
        <AlertDialog open={confirmDescartar} onOpenChange={setConfirmDescartar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Descartar la solicitud en curso?</AlertDialogTitle>
              <AlertDialogDescription>
                Se perderán los datos capturados y los documentos adjuntados en este
                asistente. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Seguir editando</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setConfirmDescartar(false)
                  setOpen(false)
                  resetAll()
                }}
              >
                Descartar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
