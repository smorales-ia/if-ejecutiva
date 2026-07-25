# Ficha de brecha — `README.md`

- **Familia** — H · Documentos operativos
- **Ruta** — `README.md` (raíz del repo)
- **Última modificación** — 2026-07-06 · `b3add9f` · 96 líneas
- **Versión declarada** — sin versión
- **Decisión** — **ACTUALIZAR** (alcance mínimo)
- **Prioridad** — **P2**

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `SC05` | 2 | 22, 38 | ❌ renombrar a SC08 |
| `WhatsApp` | 1 | 16 | ✅ **falso positivo** — canal de creación de solicitud interna |
| `capturada` / `devuelta` / `Enviar visita` | 0 | — | ✅ |

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Principio rector (22) | *"Toda regla de negocio vive en Airtable (AT01/AT02/AT08) y en Make (SC01/**SC05**/RF-09)"* → **SC01/SC08/RF-09** | §2.11 (1837) | INT |
| Tabla de stack (38) | *"Automatización · Make (org 1594725 · `eu1.make.com`) · escenarios SC01 y **SC05**"* → **SC01 y SC08** *(ex-SC05)* | §2.11 (1837) | INT |
| Línea 16 | **No tocar.** *"Crear solicitudes internas (canal: email, teléfono, WhatsApp, presencial)"* — es el canal de origen de IF-02, vocabulario vigente | — (falso positivo C-6) | — |

## Nota de alcance

Es el documento más antiguo del inventario (06-jul-2026, 19 días sin tocar) y el de menor
superficie de los que requieren cambio. Dos renombres, nada estructural.

**Observación del PM.** El README describe el repo como IF-02 (Consola Ejecutiva) y no
menciona IF-03. Este sync **no** amplía su alcance: agregar IF-03 al README sería una
decisión de producto fuera del mandato de sincronización documental. Se deja constancia
y no se actúa.
