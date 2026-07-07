"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

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
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  FileUploadZone,
  type ArchivoSubido,
} from "@/components/console/file-upload-zone"
import { DocumentChecklist } from "@/components/console/document-checklist"
import {
  nuevaSolicitudInternaDefaults,
  nuevaSolicitudInternaSchema,
  type NuevaSolicitudInternaValues,
} from "@/lib/validators/nueva-solicitud-interna"
import {
  BANCOS,
  CANALES_ORIGEN,
  CLIENTES,
  COMUNAS_POR_REGION,
  M_BANCOS,
  PRODUCTO_LABELS,
  PRODUCTOS_CON_BANCO,
  PRODUCTOS_POR_CLIENTE,
  REGIONES,
  TIPOS_INFORME_POR_CLIENTE,
  TIPOS_PROPIEDAD,
  formatearRut,
} from "@/lib/console-data"

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5" data-invalid={error ? "" : undefined}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
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

export function NewRequestSheet() {
  const [open, setOpen] = React.useState(false)
  const [adjuntos, setAdjuntos] = React.useState<ArchivoSubido[]>([])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NuevaSolicitudInternaValues>({
    resolver: zodResolver(nuevaSolicitudInternaSchema),
    defaultValues: nuevaSolicitudInternaDefaults,
    mode: "onChange",
  })

  const cliente = watch("cliente")
  const region = watch("region")
  const producto = watch("producto")
  const documentos = watch("documentos")

  // Documentos marcados como requeridos pero aún sin archivo en estado success.
  const docsFaltantes = (documentos ?? []).filter(
    (d) => d.requerido_por_ejecutiva && d.archivo === null
  ).length

  // Catálogos dependientes.
  const tiposInforme = cliente ? TIPOS_INFORME_POR_CLIENTE[cliente] ?? [] : []
  const productos = cliente ? PRODUCTOS_POR_CLIENTE[cliente] ?? [] : []
  const comunas = region ? COMUNAS_POR_REGION[region] ?? [] : []
  const requiereBanco = PRODUCTOS_CON_BANCO.includes(producto)

  // Limpia campos dependientes cuando cambia el padre.
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

  function resetAll() {
    reset(nuevaSolicitudInternaDefaults)
    setAdjuntos([])
  }

  async function onSubmit(values: NuevaSolicitudInternaValues) {
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("submit falló")

      const nDocs = values.documentos.filter(
        (d) => d.archivo !== null
      ).length
      toast.success(
        `Solicitud creada con ${nDocs} documento${
          nDocs === 1 ? "" : "s"
        } adjunto${nDocs === 1 ? "" : "s"}.`,
        {
          description: `${values.cliente} · ${values.comuna} · Op. ${values.n_operacion_cliente}`,
          duration: 3000,
        }
      )
      resetAll()
      setOpen(false)
    } catch {
      toast.error(
        "No pudimos completar la acción. Intenta nuevamente en unos segundos.",
        { duration: 3000 }
      )
    }
  }

  function onInvalid() {
    toast.error("Revisa el formulario", {
      description: "Hay campos obligatorios sin completar o con errores.",
      duration: 3000,
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
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
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Nueva solicitud interna</SheetTitle>
          <SheetDescription>
            Ingresa los datos que normalmente entrega el solicitante. Los campos
            con <span className="text-destructive">*</span> son obligatorios.
          </SheetDescription>
        </SheetHeader>

        <form
          id="nueva-solicitud-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
          noValidate
        >
          {/* Sección A · Origen */}
          <section className="flex flex-col gap-4">
            <SectionTitle>Origen de la solicitud</SectionTitle>
            <Controller
              control={control}
              name="canal"
              render={({ field }) => (
                <Field
                  label="Canal de origen"
                  htmlFor="canal"
                  required
                  error={errors.canal?.message}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="canal"
                      className="w-full"
                      aria-invalid={!!errors.canal}
                    >
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
                <Field
                  label="Cliente"
                  htmlFor="cliente"
                  required
                  error={errors.cliente?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(v) => handleClienteChange(v ?? '', field.onChange)}
                  >
                    <SelectTrigger
                      id="cliente"
                      className="w-full"
                      aria-invalid={!!errors.cliente}
                    >
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
              name="tipoInforme"
              render={({ field }) => (
                <Field
                  label="Tipo de informe"
                  htmlFor="tipoInforme"
                  required
                  error={errors.tipoInforme?.message}
                  hint={!cliente ? "Selecciona primero un cliente." : undefined}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!cliente}
                  >
                    <SelectTrigger
                      id="tipoInforme"
                      className="w-full"
                      aria-invalid={!!errors.tipoInforme}
                    >
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
                  <Field
                    label="Banco"
                    htmlFor="banco_id"
                    required
                    error={errors.banco_id?.message}
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="banco_id"
                        className="w-full"
                        aria-invalid={!!errors.banco_id}
                      >
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
                    htmlFor="n_operacion_cliente"
                    required
                    error={errors.n_operacion_cliente?.message}
                  >
                    <Input
                      id="n_operacion_cliente"
                      placeholder="Ej. 900158881"
                      maxLength={20}
                      aria-invalid={!!errors.n_operacion_cliente}
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="sucursal_originadora"
                render={({ field }) => (
                  <Field label="Sucursal originadora" htmlFor="sucursal_originadora">
                    <Input
                      id="sucursal_originadora"
                      placeholder="Ej. Sucursal Providencia"
                      {...field}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="ejecutivo_solicitante"
                render={({ field }) => (
                  <Field
                    label="Ejecutivo solicitante"
                    htmlFor="ejecutivo_solicitante"
                  >
                    <Input
                      id="ejecutivo_solicitante"
                      placeholder="Nombre del ejecutivo del banco"
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>
          </section>

          <Separator />

          {/* Sección B · Propiedad */}
          <section className="flex flex-col gap-4">
            <SectionTitle>Datos de la propiedad</SectionTitle>
            <Controller
              control={control}
              name="direccion"
              render={({ field }) => (
                <Field
                  label="Dirección"
                  htmlFor="direccion"
                  required
                  error={errors.direccion?.message}
                >
                  <Input
                    id="direccion"
                    placeholder="Calle, número, depto / oficina"
                    aria-invalid={!!errors.direccion}
                    {...field}
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
                    htmlFor="region"
                    required
                    error={errors.region?.message}
                  >
                    <Select
                      value={field.value}
                      onValueChange={(v) => handleRegionChange(v ?? '', field.onChange)}
                    >
                      <SelectTrigger
                        id="region"
                        className="w-full"
                        aria-invalid={!!errors.region}
                      >
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
                    htmlFor="comuna"
                    required
                    error={errors.comuna?.message}
                    hint={!region ? "Selecciona una región." : undefined}
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!region}
                    >
                      <SelectTrigger
                        id="comuna"
                        className="w-full"
                        aria-invalid={!!errors.comuna}
                      >
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
                    htmlFor="tipoPropiedad"
                    required
                    error={errors.tipoPropiedad?.message}
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="tipoPropiedad"
                        className="w-full"
                        aria-invalid={!!errors.tipoPropiedad}
                      >
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
                name="valorUf"
                render={({ field }) => (
                  <Field label="Valor estimado (UF)" htmlFor="valorUf">
                    <Input
                      id="valorUf"
                      inputMode="numeric"
                      placeholder="Ej: 4.500"
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>
          </section>

          <Separator />

          {/* Sección C · Solicitante final */}
          <section className="flex flex-col gap-4">
            <SectionTitle>Solicitante final</SectionTitle>
            <Controller
              control={control}
              name="nombre"
              render={({ field }) => (
                <Field
                  label="Nombre completo"
                  htmlFor="nombre"
                  required
                  error={errors.nombre?.message}
                >
                  <Input
                    id="nombre"
                    placeholder="Nombre y apellidos"
                    aria-invalid={!!errors.nombre}
                    {...field}
                  />
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="rut"
                render={({ field }) => (
                  <Field
                    label="RUT"
                    htmlFor="rut"
                    required
                    error={errors.rut?.message}
                  >
                    <Input
                      id="rut"
                      placeholder="12.345.678-9"
                      aria-invalid={!!errors.rut}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(formatearRut(e.target.value))
                      }
                      onBlur={field.onBlur}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="telefono"
                render={({ field }) => (
                  <Field label="Teléfono" htmlFor="telefono">
                    <Input
                      id="telefono"
                      inputMode="tel"
                      placeholder="+56 9 ..."
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field
                  label="Email"
                  htmlFor="email"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@dominio.cl"
                    aria-invalid={!!errors.email}
                    {...field}
                  />
                </Field>
              )}
            />
          </section>

          <Separator />

          {/* Sección D · Producto y observaciones */}
          <section className="flex flex-col gap-4">
            <SectionTitle>Producto y observaciones</SectionTitle>
            <Controller
              control={control}
              name="producto"
              render={({ field }) => (
                <Field
                  label="Producto"
                  htmlFor="producto"
                  required
                  error={errors.producto?.message}
                  hint={!cliente ? "Selecciona primero un cliente." : undefined}
                >
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v ?? '')
                      if (!PRODUCTOS_CON_BANCO.includes(v ?? ''))
                        setValue("banco", "", { shouldValidate: false })
                    }}
                    disabled={!cliente}
                  >
                    <SelectTrigger
                      id="producto"
                      className="w-full"
                      aria-invalid={!!errors.producto}
                    >
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
                    htmlFor="banco"
                    required
                    error={errors.banco?.message}
                    hint="Requerido para productos hipotecarios y de refinanciamiento."
                  >
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="banco"
                        className="w-full"
                        aria-invalid={!!errors.banco}
                      >
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
                <Field label="Observaciones" htmlFor="observaciones">
                  <Textarea
                    id="observaciones"
                    rows={3}
                    placeholder="Notas de coordinación, accesos, contactos..."
                    {...field}
                  />
                </Field>
              )}
            />
          </section>

          <Separator />

          {/* Sección · Documentos requeridos */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <SectionTitle>Documentos requeridos</SectionTitle>
              <p className="text-xs text-muted-foreground">
                Marca los documentos que vienen con la solicitud y adjunta el
                archivo de cada uno. La solicitud sólo puede crearse cuando
                todos los marcados tengan archivo.
              </p>
            </div>
            <Controller
              control={control}
              name="documentos"
              render={({ field }) => (
                <DocumentChecklist
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </section>

          <Separator />

          {/* Sección E · Adjuntos */}
          <section className="flex flex-col gap-3">
            <SectionTitle>Adjuntos (opcional)</SectionTitle>
            <FileUploadZone
              variant="compact"
              onUploaded={(nuevos) =>
                setAdjuntos((prev) => [...prev, ...nuevos])
              }
            />
            {adjuntos.length > 0 && (
              <ul className="flex flex-col gap-1">
                {adjuntos.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                  >
                    <span className="truncate font-medium text-foreground">
                      {a.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAdjuntos((prev) =>
                          prev.filter((x) => x.id !== a.id)
                        )
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
        </form>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <SheetClose
            render={
              <Button variant="outline" className="flex-none" type="button">
                Cancelar
              </Button>
            }
          />
          {docsFaltantes > 0 ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span tabIndex={0} className="flex-none">
                    <Button
                      type="submit"
                      form="nueva-solicitud-form"
                      disabled
                      className="bg-brand text-brand-foreground hover:bg-brand/90"
                    >
                      Crear solicitud
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {`Faltan ${docsFaltantes} documento${
                  docsFaltantes === 1 ? "" : "s"
                } marcado${docsFaltantes === 1 ? "" : "s"} sin archivo.`}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="submit"
              form="nueva-solicitud-form"
              disabled={isSubmitting}
              className="flex-none bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isSubmitting ? "Creando…" : "Crear solicitud"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
