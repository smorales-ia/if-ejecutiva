"use client"

import * as React from "react"
import { Loader2, Plus, Save, Trash2, X } from "lucide-react"

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
  ORIGENES_DIRECCION,
  ORIGENES_SUPERFICIE,
  REGIONES,
  ROLES_CONTACTO_VISITA,
  TIPOS_BIEN,
  TIPOS_CLIENTE_ORIGEN,
  type ContactoVisita,
  type Solicitud,
  type Unidad,
} from "@/lib/console-data"
import { useCatalogos } from "@/lib/use-catalogos"
import { desdeSantiago, partesEnSantiago } from "@/lib/sla-habil"

let uid = 0
const nextId = (p: string) => `${p}-${Date.now()}-${uid++}`

const dosDigitos = (n: number) => String(n).padStart(2, "0")

/**
 * ISO 8601 → valor de un `<input type="datetime-local">`, en reloj de pared de
 * **Santiago**.
 *
 * El input trabaja siempre en la zona del navegador, y aunque hoy la Ejecutiva
 * esté en Chile, dejar que el navegador decida convierte la zona en una
 * propiedad del equipo de quien edita. El hito de §5.2.2 es un instante de la
 * oficina de Santiago: se descompone con `partesEnSantiago` y se recompone con
 * `desdeSantiago`, nunca con un offset fijo —Chile alterna −03/−04 dos veces al
 * año—. Es la misma regla que ya rige el motor (`lib/sla-habil.ts`), aplicada a
 * la única superficie de la app donde ese instante se escribe a mano.
 */
function isoAInputSantiago(iso: string | undefined): string {
  if (!iso) return ""
  const instante = new Date(iso)
  if (Number.isNaN(instante.getTime())) return ""
  const p = partesEnSantiago(instante)
  return `${p.anio}-${dosDigitos(p.mes)}-${dosDigitos(p.dia)}T${dosDigitos(p.hora)}:${dosDigitos(p.minuto)}`
}

/** Vuelta del input a ISO. `undefined` si está vacío o a medio escribir. */
function inputSantiagoAIso(valor: string): string | undefined {
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!m) return undefined
  return desdeSantiago(
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
  ).toISOString()
}

/**
 * Valor de un `<Input type="number">` a partir de un número opcional.
 * `String(null)` daría el literal `"null"` dentro del campo; vacío es lo que
 * corresponde a "sin declarar" (C-3).
 */
function numeroInput(valor: number | null | undefined): string {
  return valor == null ? "" : String(valor)
}

/**
 * Vuelta del input al modelo. Campo vacío → `null` ("sin declarar"), **no 0**:
 * un 0 se escribe en Airtable como una superficie real de cero metros, que es
 * el bug que C-3 corrige. Un texto no numérico también es `null`.
 */
function numeroDesdeInput(texto: string): number | null {
  const t = texto.trim()
  if (t === "") return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/**
 * `Unidad.regularizable` es un tri-estado (`true` · `false` · `undefined`) y el
 * `<Select>` de Base UI trabaja con strings. Estas dos tablas hacen el ida y
 * vuelta sin colapsar "no declarado" con "no" — Airtable los distingue
 * (`no_aplica` vs `no`) y perder la diferencia es perder información.
 */
const REGULARIZABLE_VALOR: Record<string, string> = {
  true: "si",
  false: "no",
  undefined: "no_declarado",
}
const REGULARIZABLE_ESTADO: Record<string, boolean | undefined> = {
  si: true,
  no: false,
  no_declarado: undefined,
}

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
  guardando = false,
}: {
  solicitud: Solicitud
  onGuardar: (actualizada: Solicitud) => void
  onCancelar: () => void
  /**
   * PATCH en vuelo (Regla D · CLAUDE.md). Lo posee el contenedor, que es quien
   * hace el fetch: este formulario sólo refleja el progreso. Deshabilita los
   * dos botones "Guardar cambios" —el de la barra pegajosa y el del pie— más
   * todos los campos, para que no haya doble submit ni edición sobre datos que
   * ya están viajando.
   */
  guardando?: boolean
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
          tipoBien: "Departamento",
          conRol: true,
          rolSii: "",
          rolEnTramite: false,
          // `null` = sin declarar. Un 0 acá se escribiría en Airtable como una
          // superficie real de cero metros (C-3).
          supConstruida: null,
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
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelar}
            disabled={guardando}
          >
            <X data-icon="inline-start" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => onGuardar(d)}
            disabled={guardando}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {guardando ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      {/* Regla D · punto 4: un `fieldset` deshabilitado apaga de una vez todos
          los campos de abajo, sin tener que repetir `disabled` en cada uno de
          los ~60 controles del formulario. Queda fuera la barra pegajosa de
          arriba y las acciones del pie, que gestionan su propio `disabled`.
          `min-w-0` neutraliza el `min-width: min-content` que los navegadores
          aplican a `fieldset` y que, sin él, rompe el truncado de los hijos
          flex. */}
      <fieldset
        disabled={guardando}
        className="flex min-w-0 flex-col gap-6"
      >

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
        {/* Hito de inicio del SLA · §5.2.2 · RF-53 (C-7).
            El wizard lo estampa al abrirse, pero el caso real es la ejecutiva
            que abrió el correo a las 9:10 y terminó de cargar la solicitud a
            las 11:40: sin este control, esas dos horas y media se le cobran a
            la etapa 1 y el semáforo miente desde el primer día. Editable sólo
            en estado `creada`, como todo este formulario (REGLA C), y el
            servidor lo revalida.
            La hora se muestra y se guarda en reloj de Santiago, no en el del
            navegador — ver `isoAInputSantiago`. */}
        <EditField label="Inicio del SLA (ingreso de la solicitud)">
          <Input
            type="datetime-local"
            value={isoAInputSantiago(d.slaE1InicioTs)}
            onChange={(e) => set("slaE1InicioTs", inputSantiagoAIso(e.target.value))}
          />
        </EditField>
        {/* V-2 · §1.4 "Origen". Los cuatro viajaban preservados desde
            `original.*` en el mapper: se guardaban intactos pero la ejecutiva no
            podía cambiarlos, y §1.4 los pide editables en estado `creada`.
            Ahora salen de la copia editada `d`.

            "Comercializador" se sumó el 30-jul-2026 al crearse el campo destino
            `ejecutivo_comercializador` (`fldDP232hBLsZ0PWJ`, singleLineText),
            que cierra el bloqueo V-4: §1.4 pedía el control pero el schema no
            tenía dónde escribirlo. Con eso la Sección A queda completa. */}
        <EditField label="Tipo de cliente de origen">
          <Select
            value={d.tipoClienteOrigen ?? ""}
            onValueChange={(v) => set("tipoClienteOrigen", v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TIPOS_CLIENTE_ORIGEN.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Origen de la dirección">
          <Select
            value={d.origenDireccion ?? ""}
            onValueChange={(v) =>
              set("origenDireccion", (v ?? "") as Solicitud["origenDireccion"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Origen de la dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ORIGENES_DIRECCION.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditField>
        <EditField label="Ejecutivo solicitante">
          <Input
            // El modelo lo llama `modificadoPor` por historia, pero `mapRecord`
            // lo lee de `ejecutivo_solicitante` (`lib/solicitudes.ts`) y el
            // mapper lo devuelve por la clave `ejecutivoSolicitante`.
            value={d.modificadoPor === "—" ? "" : d.modificadoPor}
            onChange={(e) => set("modificadoPor", e.target.value)}
          />
        </EditField>
        <EditField label="Ejecutivo formalizador">
          <Input
            value={d.ejecFormalizador ?? ""}
            onChange={(e) => set("ejecFormalizador", e.target.value)}
          />
        </EditField>
        <EditField label="Comercializador">
          <Input
            value={d.ejecutivoComercializador ?? ""}
            onChange={(e) => set("ejecutivoComercializador", e.target.value)}
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
        {/* V-3 · `monto_estimado_uf` (fldKZW799xIqMFN1I) es `number` plano en
            Airtable, no fórmula: es un dato que declara la ejecutiva, no un
            cálculo del motor AT01, así que la regla dura de §1.4 lo alcanza.
            Ya viajaba en cada guardado preservado desde `original`; lo único
            que faltaba era poder corregirlo.

            `prioridad` NO entra acá a propósito: tiene acción dedicada
            (`/api/webhooks/prioridad`) con su propio evento en `A_Eventos`.
            Dos caminos de escritura para un mismo campo harían que la traza de
            auditoría dependa de cuál usó el usuario.

            El valor viaja como texto de presentación ("4.200 UF"); `numeroPlano`
            lo normaliza en el mapper, que es lo que ya hacía. */}
        <EditField label="Monto estimado (UF)">
          <Input
            inputMode="decimal"
            placeholder="Ej.: 4.200"
            value={d.montoUf === "—" ? "" : d.montoUf}
            onChange={(e) => set("montoUf", e.target.value)}
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
                    placeholder="Sin declarar"
                    // `String(null)` daría el literal "null" dentro del input.
                    value={numeroInput(u.supConstruida)}
                    onChange={(e) =>
                      setUnidad(i, { supConstruida: numeroDesdeInput(e.target.value) })
                    }
                  />
                </EditField>
                <EditField label="Superficie terraza (m²)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Sin declarar"
                    value={numeroInput(u.supTerraza)}
                    onChange={(e) =>
                      setUnidad(i, {
                        supTerraza: numeroDesdeInput(e.target.value) ?? undefined,
                      })
                    }
                  />
                </EditField>
                <EditField label="Superficie terreno (m²)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Sin declarar"
                    value={numeroInput(u.supTerreno)}
                    onChange={(e) =>
                      setUnidad(i, {
                        supTerreno: numeroDesdeInput(e.target.value) ?? undefined,
                      })
                    }
                  />
                </EditField>
                <EditField label="Año de construcción">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Ej.: 2018"
                    value={u.anioConstruccion}
                    onChange={(e) =>
                      setUnidad(i, { anioConstruccion: e.target.value })
                    }
                  />
                </EditField>
                <EditField label="Modelo">
                  <Input
                    value={u.modelo ?? ""}
                    placeholder="Sólo propiedades nuevas"
                    onChange={(e) =>
                      setUnidad(i, { modelo: e.target.value || undefined })
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
                <EditField label="Ampliación (m²)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Sin ampliación"
                    value={numeroInput(u.m2Ampliacion)}
                    onChange={(e) =>
                      setUnidad(i, {
                        m2Ampliacion: numeroDesdeInput(e.target.value) ?? undefined,
                      })
                    }
                  />
                </EditField>
                <EditField label="Ampliación regularizable">
                  <Select
                    // Tri-estado: "" es "no declarado" y Airtable lo modela como
                    // `no_aplica`. No colapsar a "no" — son cosas distintas.
                    value={REGULARIZABLE_VALOR[String(u.regularizable)]}
                    onValueChange={(v) =>
                      setUnidad(i, { regularizable: REGULARIZABLE_ESTADO[v ?? ""] })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No declarado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="no_declarado">No declarado</SelectItem>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </EditField>
              </div>
              <EditField label="Detalle del ítem">
                <Textarea
                  rows={2}
                  value={u.detalleItem ?? ""}
                  placeholder="Requerido en obras complementarias"
                  onChange={(e) =>
                    setUnidad(i, { detalleItem: e.target.value || undefined })
                  }
                />
              </EditField>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={u.conRol}
                    onCheckedChange={(v) => setUnidad(i, { conRol: v === true })}
                  />
                  Unidad con rol SII (desmarca para “uso y goce”)
                </label>
                <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={u.rolEnTramite}
                    disabled={!u.conRol}
                    onCheckedChange={(v) =>
                      setUnidad(i, { rolEnTramite: v === true })
                    }
                  />
                  Rol SII en trámite
                </label>
              </div>
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

      </fieldset>

      {/* Acciones al pie */}
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelar}
          disabled={guardando}
        >
          <X data-icon="inline-start" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => onGuardar(d)}
          disabled={guardando}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {guardando ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {guardando ? "Guardando…" : "Guardar cambios"}
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
