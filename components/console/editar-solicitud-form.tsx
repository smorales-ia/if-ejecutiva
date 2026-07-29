"use client"

import * as React from "react"
import { Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  CANALES_ORIGEN,
  COMUNAS_POR_REGION,
  ESTADOS_CONSERVACION,
  ESTADOS_CONTACTO,
  MATERIALES,
  ORIGENES_DATO_VENDEDOR,
  ORIGENES_SUPERFICIE,
  REGIONES,
  ROLES_CONTACTO_VISITA,
  TIPOS_BIEN,
  type ContactoVisita,
  type Solicitud,
  type Unidad,
} from "@/lib/console-data"
import { useCatalogos } from "@/lib/use-catalogos"

let uid = 0
const nextId = (p: string) => `${p}-${Date.now()}-${uid++}`

/** Copia editable de la solicitud (independiente del original hasta Guardar). */
function clonar(s: Solicitud): Solicitud {
  return {
    ...s,
    comprador: { ...s.comprador },
    vendedor: { ...s.vendedor },
    financiero: s.financiero ? { ...s.financiero } : undefined,
    unidades: s.unidades.map((u) => ({
      ...u,
      subItems: u.subItems ? u.subItems.map((si) => ({ ...si })) : undefined,
    })),
    contactosVisita: s.contactosVisita.map((c) => ({ ...c })),
  }
}

export function EditarSolicitudForm({
  solicitud,
  onGuardar,
  onCancelar,
}: {
  solicitud: Solicitud
  onGuardar: (actualizada: Solicitud) => void
  onCancelar: () => void
}) {
  const [d, setD] = React.useState<Solicitud>(() => clonar(solicitud))
  const esNuevo = d.tipoPropiedadNuevoUsado === "nuevo"

  const comunasRegion = COMUNAS_POR_REGION[d.region] ?? []

  // Mismos catálogos maestros que el alta interna: la edición escribe en los
  // mismos links de `TX_Solicitudes` vía SC-Edicion, así que un nombre que no
  // exista en la tabla maestra deja el link vacío igual que en SC01.
  const { catalogos, cargando: catalogosCargando } = useCatalogos()

  /**
   * Une el valor ya persistido con el catálogo vivo.
   *
   * Una solicitud vieja puede tener un `cliente` que hoy está inactivo o que
   * quedó escrito con otro nombre. Si el select no lo incluye, Base UI lo
   * renderiza como vacío y "Guardar cambios" lo borraría sin que la Ejecutiva
   * lo haya tocado. Mantenerlo como opción hace que editar otro campo no
   * destruya éste.
   */
  function conValorActual(
    opciones: { id: string; nombre: string }[],
    actual: string,
  ): { id: string; nombre: string }[] {
    if (!actual || opciones.some((o) => o.nombre === actual)) return opciones
    return [{ id: `__actual__${actual}`, nombre: actual }, ...opciones]
  }

  function set<K extends keyof Solicitud>(key: K, value: Solicitud[K]) {
    setD((prev) => ({ ...prev, [key]: value }))
  }

  function setComprador(key: keyof Solicitud["comprador"], value: string) {
    setD((prev) => ({ ...prev, comprador: { ...prev.comprador, [key]: value } }))
  }

  function setVendedor(key: keyof Solicitud["vendedor"], value: unknown) {
    setD((prev) => ({ ...prev, vendedor: { ...prev.vendedor, [key]: value } }))
  }

  function setFinanciero(key: string, value: string) {
    setD((prev) => ({
      ...prev,
      financiero: { ...(prev.financiero ?? {}), [key]: value },
    }))
  }

  function setUnidad(index: number, patch: Partial<Unidad>) {
    setD((prev) => ({
      ...prev,
      unidades: prev.unidades.map((u, i) =>
        i === index ? { ...u, ...patch } : u,
      ),
    }))
  }

  function agregarUnidad() {
    setD((prev) => ({
      ...prev,
      unidades: [
        ...prev.unidades,
        {
          id: nextId("u"),
          ubicacion: "",
          tipoBien: "Edificación",
          conRol: true,
          rolSii: "",
          rolEnTramite: false,
          supConstruida: 0,
          anioConstruccion: "",
          material: "Hormigón",
          origenSuperficie: "Carta o ficha inmobiliaria",
          respaldo: null,
        },
      ],
    }))
  }

  function eliminarUnidad(index: number) {
    setD((prev) => ({
      ...prev,
      unidades: prev.unidades.filter((_, i) => i !== index),
    }))
  }

  function setContacto(index: number, patch: Partial<ContactoVisita>) {
    setD((prev) => ({
      ...prev,
      contactosVisita: prev.contactosVisita.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    }))
  }

  function agregarContacto() {
    setD((prev) => ({
      ...prev,
      contactosVisita: [
        ...prev.contactosVisita,
        {
          id: nextId("c"),
          // Slugs de `TX_ContactosVisita`, no etiquetas: viajan intactos a
          // SC-Edicion. Ver `ESTADOS_CONTACTO` en lib/console-data.ts.
          rol: "propietario",
          nombre: "",
          telefono: "",
          email: "",
          estado: "valido",
        },
      ],
    }))
  }

  function eliminarContacto(index: number) {
    setD((prev) => ({
      ...prev,
      contactosVisita: prev.contactosVisita.filter((_, i) => i !== index),
    }))
  }

  function handleRegion(v: string) {
    const comunas = COMUNAS_POR_REGION[v] ?? []
    setD((prev) => ({
      ...prev,
      region: v,
      comuna: comunas.includes(prev.comuna) ? prev.comuna : (comunas[0] ?? ""),
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de edición */}
      <div className="sticky top-0 z-10 -mx-6 -mt-5 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-6 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Editando solicitud
          </p>
          <p className="text-xs text-muted-foreground">
            Solicitud en estado “Creada”: puedes modificar todos los datos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancelar}>
            <X data-icon="inline-start" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => onGuardar(d)}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Save data-icon="inline-start" />
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Operación (D-02 · Regla C).
          Sólo los tres campos que el escenario SC-Edicion desplegado sabe
          escribir (`cambios.nOperacionCliente`, `cambios.sucursalOriginadora`,
          `cambios.correoClienteRef`). El resto de los campos que D-02 sumó al
          detalle —rol SII, superficies, avalúo, año, velocidad de venta, notas,
          n° interno— se muestran en modo lectura y NO se editan aquí: Make no
          los mapea todavía, y ofrecerlos editables sería prometer un guardado
          que no ocurre. Ver el bloqueo anotado en el reporte de D-02. */}
      <FormSection title="Operación">
        <EditField label="N° de operación del cliente">
          <Input
            inputMode="numeric"
            value={d.nOperacionCliente ?? ""}
            onChange={(e) =>
              set(
                "nOperacionCliente",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </EditField>
        <EditField label="Sucursal originadora">
          <Input
            value={d.sucursalOriginadora ?? ""}
            onChange={(e) => set("sucursalOriginadora", e.target.value)}
          />
        </EditField>
        <EditField label="Correo de referencia del cliente">
          <Input
            type="email"
            value={d.correoClienteRef ?? ""}
            onChange={(e) => set("correoClienteRef", e.target.value)}
          />
        </EditField>
      </FormSection>

      {/* Cliente y tipo */}
      <FormSection title="Cliente y tipo">
        <EditField label="Cliente">
          <Select
            value={d.cliente}
            onValueChange={(v) => set("cliente", v ?? "")}
            disabled={catalogosCargando}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {conValorActual(catalogos.clientes, d.cliente).map((c) => (
                  <SelectItem key={c.id} value={c.nombre}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Tipo de informe">
          <Select
            value={d.tipoInforme}
            onValueChange={(v) => set("tipoInforme", v ?? "")}
            disabled={catalogosCargando}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el tipo de informe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {conValorActual(catalogos.tiposInforme, d.tipoInforme).map(
                  (t) => (
                    <SelectItem key={t.id} value={t.nombre}>
                      {t.nombre}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Tipo de propiedad">
          <Select
            value={d.tipoPropiedad}
            onValueChange={(v) => set("tipoPropiedad", v ?? "")}
            disabled={catalogosCargando}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {conValorActual(catalogos.tiposPropiedad, d.tipoPropiedad).map(
                  (t) => (
                    <SelectItem key={t.id} value={t.nombre}>
                      {t.nombre}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Banco">
          <Input
            value={d.banco}
            onChange={(e) => set("banco", e.target.value)}
          />
        </EditField>
        <EditField label="Producto">
          <Input
            value={d.producto}
            onChange={(e) => set("producto", e.target.value)}
          />
        </EditField>
        <EditField label="Canal de contacto">
          <Select value={d.canal} onValueChange={(v) => set("canal", v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CANALES_ORIGEN.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
      </FormSection>

      <Separator />

      {/* Propiedad */}
      <FormSection title="Propiedad">
        <EditField label="Proyecto o condominio">
          <Input
            value={d.proyecto ?? ""}
            onChange={(e) => set("proyecto", e.target.value)}
          />
        </EditField>
        <EditField label="Dirección">
          <Input
            value={d.direccion}
            onChange={(e) => set("direccion", e.target.value)}
          />
        </EditField>
        <EditField label="Región">
          <Select value={d.region} onValueChange={(v) => handleRegion(v ?? "")}>
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
        </EditField>
        <EditField label="Comuna">
          <Select value={d.comuna} onValueChange={(v) => set("comuna", v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Comuna" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {comunasRegion.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Estado de conservación">
          <Select
            value={d.estadoConservacion ?? ""}
            onValueChange={(v) => set("estadoConservacion", v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado de conservación" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ESTADOS_CONSERVACION.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
      </FormSection>

      <Separator />

      {/* Comprador */}
      <FormSection title="Comprador (cliente final evaluado)">
        <EditField label="Nombre">
          <Input
            value={d.comprador.nombre}
            onChange={(e) => setComprador("nombre", e.target.value)}
          />
        </EditField>
        <EditField label="RUT">
          <Input
            value={d.comprador.rut}
            onChange={(e) => setComprador("rut", e.target.value)}
          />
        </EditField>
        <EditField label="Email">
          <Input
            type="email"
            value={d.comprador.email}
            onChange={(e) => setComprador("email", e.target.value)}
          />
        </EditField>
        <EditField label="Teléfono">
          <Input
            value={d.comprador.telefono}
            onChange={(e) => setComprador("telefono", e.target.value)}
          />
        </EditField>
      </FormSection>

      <Separator />

      {/* Vendedor */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Vendedor
          </h2>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={d.vendedor.esInmobiliaria}
              onCheckedChange={(v) => setVendedor("esInmobiliaria", v === true)}
            />
            Es inmobiliaria
          </label>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {d.vendedor.esInmobiliaria ? (
            <>
              <EditField label="Razón social">
                <Input
                  value={d.vendedor.razonSocial ?? ""}
                  onChange={(e) => setVendedor("razonSocial", e.target.value)}
                />
              </EditField>
              <EditField label="RUT inmobiliaria">
                <Input
                  value={d.vendedor.rutInmobiliaria ?? ""}
                  onChange={(e) =>
                    setVendedor("rutInmobiliaria", e.target.value)
                  }
                />
              </EditField>
            </>
          ) : (
            <>
              <EditField label="Nombre">
                <Input
                  value={d.vendedor.nombre ?? ""}
                  onChange={(e) => setVendedor("nombre", e.target.value)}
                />
              </EditField>
              <EditField label="RUT">
                <Input
                  value={d.vendedor.rut ?? ""}
                  onChange={(e) => setVendedor("rut", e.target.value)}
                />
              </EditField>
            </>
          )}
          <EditField label="Correo">
            <Input
              type="email"
              value={d.vendedor.correo}
              onChange={(e) => setVendedor("correo", e.target.value)}
            />
          </EditField>
          <EditField label="Teléfono">
            <Input
              value={d.vendedor.telefono}
              onChange={(e) => setVendedor("telefono", e.target.value)}
            />
          </EditField>
          <EditField label="Origen del dato">
            <Select
              value={d.vendedor.origenDato}
              onValueChange={(v) => setVendedor("origenDato", v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Origen del dato" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ORIGENES_DATO_VENDEDOR.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </EditField>
        </div>
      </section>

      <Separator />

      {/* Unidades */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Unidades ({d.unidades.length})
          </h2>
          <Button variant="outline" size="sm" onClick={agregarUnidad}>
            <Plus data-icon="inline-start" />
            Agregar unidad
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {d.unidades.map((u, i) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Unidad {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarUnidad(i)}
                  disabled={d.unidades.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 data-icon="inline-start" />
                  Quitar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <EditField label="Ubicación (depto / torre / piso)">
                  <Input
                    value={u.ubicacion}
                    onChange={(e) =>
                      setUnidad(i, { ubicacion: e.target.value })
                    }
                  />
                </EditField>
                <EditField label="Tipo de bien">
                  <Select
                    value={u.tipoBien}
                    onValueChange={(v) => setUnidad(i, { tipoBien: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo de bien" />
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
                </EditField>
                <EditField label="Rol SII">
                  <Input
                    value={u.rolSii}
                    placeholder={u.conRol ? "Ej: 1234-56" : "Uso y goce"}
                    disabled={!u.conRol}
                    onChange={(e) => setUnidad(i, { rolSii: e.target.value })}
                  />
                </EditField>
                <EditField label="Superficie construida (m²)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={String(u.supConstruida)}
                    onChange={(e) =>
                      setUnidad(i, {
                        supConstruida: Number(e.target.value) || 0,
                      })
                    }
                  />
                </EditField>
                <EditField label="Material predominante">
                  <Select
                    value={u.material}
                    onValueChange={(v) => setUnidad(i, { material: v ?? "" })}
                  >
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
                </EditField>
                <EditField label="Origen de la superficie">
                  <Select
                    value={u.origenSuperficie}
                    onValueChange={(v) =>
                      setUnidad(i, { origenSuperficie: v ?? "" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Origen" />
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
                </EditField>
              </div>
              <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={u.conRol}
                  onCheckedChange={(v) => setUnidad(i, { conRol: v === true })}
                />
                Unidad con rol SII (desmarca para “uso y goce”)
              </label>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Contactos de visita */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Contactos de visita ({d.contactosVisita.length})
          </h2>
          <Button variant="outline" size="sm" onClick={agregarContacto}>
            <Plus data-icon="inline-start" />
            Agregar contacto
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {d.contactosVisita.map((c, i) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Contacto {i + 1}
                  {i === 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (principal)
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarContacto(i)}
                  disabled={d.contactosVisita.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 data-icon="inline-start" />
                  Quitar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <EditField label="Rol">
                  <Select
                    value={c.rol}
                    onValueChange={(v) => setContacto(i, { rol: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLES_CONTACTO_VISITA.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </EditField>
                <EditField label="Nombre">
                  <Input
                    value={c.nombre}
                    onChange={(e) => setContacto(i, { nombre: e.target.value })}
                  />
                </EditField>
                <EditField label="Teléfono">
                  <Input
                    value={c.telefono}
                    onChange={(e) =>
                      setContacto(i, { telefono: e.target.value })
                    }
                  />
                </EditField>
                <EditField label="Email">
                  <Input
                    type="email"
                    value={c.email}
                    onChange={(e) => setContacto(i, { email: e.target.value })}
                  />
                </EditField>
                <EditField label="Estado">
                  <Select
                    value={c.estado}
                    onValueChange={(v) => setContacto(i, { estado: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ESTADOS_CONTACTO.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </EditField>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Financiero — sólo propiedades nuevas */}
      {esNuevo && (
        <>
          <Separator />
          <FormSection title="Financiero">
            <EditField label="Valor total UF">
              <Input
                value={d.financiero?.valorTotalUf ?? ""}
                onChange={(e) => setFinanciero("valorTotalUf", e.target.value)}
              />
            </EditField>
            <EditField label="Precio de venta">
              <Input
                value={d.financiero?.precioVenta ?? ""}
                onChange={(e) => setFinanciero("precioVenta", e.target.value)}
              />
            </EditField>
            <EditField label="Subsidio">
              <Input
                value={d.financiero?.subsidio ?? ""}
                onChange={(e) => setFinanciero("subsidio", e.target.value)}
              />
            </EditField>
            <EditField label="Ahorro">
              <Input
                value={d.financiero?.ahorro ?? ""}
                onChange={(e) => setFinanciero("ahorro", e.target.value)}
              />
            </EditField>
            <EditField label="Mutuo hipotecario">
              <Input
                value={d.financiero?.mutuo ?? ""}
                onChange={(e) => setFinanciero("mutuo", e.target.value)}
              />
            </EditField>
            <EditField label="Pago contado">
              <Input
                value={d.financiero?.pagoContado ?? ""}
                onChange={(e) => setFinanciero("pagoContado", e.target.value)}
              />
            </EditField>
            <EditField label="Bono captación">
              <Input
                value={d.financiero?.bonoCaptacion ?? ""}
                onChange={(e) => setFinanciero("bonoCaptacion", e.target.value)}
              />
            </EditField>
            <EditField label="Bono integración">
              <Input
                value={d.financiero?.bonoIntegracion ?? ""}
                onChange={(e) =>
                  setFinanciero("bonoIntegracion", e.target.value)
                }
              />
            </EditField>
          </FormSection>
        </>
      )}

      <Separator />

      {/* Observaciones */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Observaciones
        </h2>
        <Textarea
          value={d.observaciones}
          rows={4}
          onChange={(e) => set("observaciones", e.target.value)}
        />
      </section>

      {/* Acciones al pie */}
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="outline" size="sm" onClick={onCancelar}>
          <X data-icon="inline-start" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => onGuardar(d)}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Save data-icon="inline-start" />
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}

function EditField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
