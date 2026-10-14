# Réplica manual MET-6283 en producción · VP-2026-0079 · avance

> Nota operativa con fecha, no spec. Guía de origen:
> `C:\Users\Sergio\Downloads\Replicar Tasaciones\Guia_Carga_Manual_MET6283_iapro.docx` (v2, 09-oct-2026).
> Esta nota la reemplaza donde difieren: la pantalla de fotos cambió el 14-oct-2026.

| Dato | Valor |
|---|---|
| Solicitud | **VP-2026-0079** · record `rec6XubOR92X6gnOH` |
| Tasador | Sergio (nutricionsaludketo) · entrar con `nutricionsaludketo@gmail.com` |
| Consola | https://if-ejecutiva-production.up.railway.app/consola?solicitud=rec6XubOR92X6gnOH |
| Formulario | https://if-ejecutiva-production.up.railway.app/tasaciones/rec6XubOR92X6gnOH |
| Fotos | https://if-ejecutiva-production.up.railway.app/tasaciones/rec6XubOR92X6gnOH/fotos |
| Informe | https://if-ejecutiva-production.up.railway.app/tasaciones/rec6XubOR92X6gnOH/informe |
| Archivos | `docs/_artefactos/carbone/assets_met6283/` y `docs/_referencias/Met_6283/` |

## Estado al cerrar (14-oct-2026, ~20:30)

| Etapa | Estado |
|---|---|
| 1 · Crear solicitud | ✅ (13-oct) |
| 2 · Asignar tasador | ✅ (13-oct) · regla del motor corregida a `REGLA_REFI_CASA_V32` |
| 3 · Coordinar visita | ✅ confirmada · visita 13/04/2026 |
| 4 · 13 documentos | ✅ 13/13 en el checklist |
| 5 · 21 fotos | ✅ 21 fotos (detalle abajo) |
| 6 · Lectura | ✅ «Datos listos» · 7 comparables leídos y correctos |
| 7 · Formulario A–H | 🟡 **en curso** · A hecha (sólo en el borrador local), B sin empezar |
| 8 · Calcular | ⏳ |
| 9 · Informe y PDF | ⏳ |

**Qué está en el servidor y qué no.** Documentos, fotos, comparables y coordinación están en
Airtable. El formulario (Etapa 7) se guarda **sólo en el navegador** (`localStorage`
`vp.tasador.informe.rec6XubOR92X6gnOH`) hasta presionar «Calcular Tasación». Al volver, si la
pantalla muestra «Tienes cambios guardados en este dispositivo que aún no se enviaron», presionar
**Recuperar** (nunca «Descartar»). Si el borrador no está, basta reescribir la fecha real de visita.

## Cómo retomar

1. Abrir el formulario (URL arriba) con la cuenta del tasador. Si aparece el aviso, **Recuperar**.
2. Comprobar en la sección A que «Fecha real de visita» diga `13/04/2026`; si no, escribir `13042026`.
3. Seguir con la sección B (abajo). Pedirle a Claude que verifique cada sección antes de pasar a la siguiente.

## Etapa 7 · valores que faltan (de la guía, ya ajustados)

Los campos numéricos del tasador van con **punto decimal** (`249.91`). Las fechas se escriben
`ddmmaaaa` y el campo agrega las barras.

**A · Visita** — Fecha planificada `13/04/2026` (ya está) · Fecha real `13/04/2026` · Observaciones vacío.

**B · Datos de la propiedad**

| Campo | Valor | Ya trae |
|---|---|---|
| Sup. terreno | 5024.86 | ✓ |
| Sup. construida * | 249.91 | |
| Sup. primer piso | 249.91 | |
| Año construcción * | 2024 | ✓ |
| Estado conservación * | Bueno | |
| Agrupación * | Condominio | |
| Material predominante * | Albañilería | ✓ |
| Calidad de construcción | 4 estrellas (Buena) | |
| N° pisos | 1 | |
| Subterráneos | 0 | |
| Nombre edificio | (vacío) | |
| Nombre condominio | LAS BRISAS DE CHICUREO | |
| Orientación | N | |
| N° de ascensores | 0 | |
| Dormitorios | 4 | |
| Baños | 3 | |
| Medios baños | 1 | |
| Baño de servicio | 1 | |
| Estacionamientos | 0 | |
| Roles SII estac. / Bodegas / Roles bodegas | (vacío) / 0 / (vacío) | |
| Servidumbre (m²) | 3622.51 | |
| DFL2 | apagado | |
| Velocidad de venta | 8 a 10 meses | |
| Tipo de zona | **IPB(Colina)** | trae «rural»: reemplazar |

**C · Cuadro de valoración** — «Agregar ítem» hasta 6. Total esperado **UF 20.125,86**.

| Campo | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Descripción | Terreno | Servidumbre | Piso 1 | Piscina | Quincho, terrazas, bodega | Cierros, pavimento exterior |
| Subtipo / Tipo | Terreno | Terreno | Edificación | Piscina | Obras complementarias | Obras complementarias |
| Rol SII | N°882-40 | N°882-40 | N°882-40 | — | — | — |
| Año | — | 2024 | 2024 | — | — | — |
| Situación municipal | Regularizado | Regularizado | Regularizado | — | — | — |
| Estado | — | — | Bueno | — | — | — |
| Origen superficie | Plano | Plano | Plano | — | — | — |
| Superficie (m²) | 1402.35 | 3622.51 | 249.91 | 1 | 1 | 1 |
| Material | — | — | Albañilería | — | — | — |
| UF/m² unitario | 8 | 0 | 34 | 350 | 250 | 150 |
| Factor D.F. | 1 | 1 | 0.96 | 1 | 1 | 1 |
| Aporta a garantía | Sí | Sí | Sí | Sí | Sí | Sí |
| → Valor UF | 11.218,80 | 0,00 | 8.157,06 | 350,00 | 250,00 | 150,00 |

**D · Comparables** — sólo lectura · ✅ 7 (5 ofertas + 2 CBR), verificados.

**E · Niveles, terminaciones y comodidades**
- E.1 Ampliaciones: ninguna.
- E.2 Nivel 1: Living 1 · Estar 1 · Cocina 1 · Comedor 1 · Dorm. simples 3 · Suites 1 · Baños 3 · Walk-in 1 · Escritorio 0 · Loggia 1.
- E.3 Terminaciones: Living/Dormitorios/Circulación → ENMADERADO · TIPO PISO DE INGENIERÍA · ENLUCIDO / PINTURA · ESMALTE · Bueno. Cocina/Baños → CERAMICO · TIPO PORCELANATO · CERAMICO · ENLUCIDO / PINTURA · Bueno.
- E.4/E.6: Estructura ALBAÑILERÍA LADRILLO · Divisiones ACERO VOLCANITA · Entrepisos (vacío) · Cubierta PLANCHA METALICA · Revest. exterior ESTUCO Y PINTURA · Cierros REJA METALICA · Ventanas Marco de PVC (termopanel) · Sanitarios LOSA NACIONAL CORRIENTE · Grifería NACIONAL CORRIENTE · Muebles de cocina MELAMINA Y CUARZO · Puerta principal MADERA · Closet mural encendido · Protecciones/rejas apagado.
- E.5 Encender: Piscina, Quincho, Corrientes débiles, Jardín conformado. El resto apagado.

**F · Documentos legales** (la lectura trajo valores que hay que corregir)

| Campo | Valor | Trae |
|---|---|---|
| CBR Foja * | 3312 | 13291 → cambiar |
| CBR Número * | 4663 | 21565 → cambiar |
| CBR Año * | 2020 | 2006 → cambiar |
| Vendedor / Comprador / Notaría / Repertorio | opcionales | Vendedor trae el nombre: dejar |
| N° permiso edificación | `N°319  09/09/2020` (dos espacios) | 319-2020 → cambiar |
| Fecha permiso | 09/09/2020 | ✓ |
| N° recepción final | `N°210  18/07/2024` (dos espacios) | 210-2024 → cambiar |
| Fecha recepción | 18/07/2024 | ✓ |
| Sello SEC | No aplica | |
| Afecto a expropiación | apagado | ✓ |
| N° certificado no expropiación | 3444743 | ✓ |
| Coordenadas Lat * | -33.234583 | |
| Coordenadas Lng * | -70.675083 | |

**G · Overrides** — Vida útil `70` · Motivo `Vida útil según informe MET-6283: albañilería, año 2024.` · el resto vacío.

**H · Rentabilidad** — Arriendo bruto mensual `3300000` · Gasto anual `3300000`.

## Etapas 8 y 9

- **8 · Calcular Tasación** bloquea el formulario: revisar C, F y la fecha real antes.
  Esperado (±1 %): valor UF 20.125,86 ($802.913.431) · reposición UF 9.246,94 · seguro UF 8.907,06 ·
  avalúo fiscal $339.809.429 (ya corregido en la base) · remate 65 % UF 13.081,81 ·
  liquidación 82,5 % UF 16.603,84 · renta perpetua $806.666.667 · UF del día $39.894,61.
- **9 · Informe**: revisar los 13 anexos y las 21 fotos; «Confirmar» → «Enviar informe» genera el PDF
  (1 a 3 min) y saca la solicitud de la cola. Descargar desde `/informe` y comparar con el original.

## Diferencias ya conocidas respecto de la guía y del original

- **Pantalla de fotos (14-oct-2026)**: referencias arriba; «Datos de Comparables» es la categoría del
  cuadro (F21) y la única que dispara la lectura; fijas de la propiedad: Fachada, Sector, Dormitorio y
  Baño. Las fotos de la grilla van en categorías personalizadas con el rótulo exacto del original.
- **Grilla del PDF**: «Planificación» (F02) saldrá en la posición 1 y el mapa de ubicación en la 2,
  porque F02 reutilizó la fila del documento D08 (mismo archivo). No borrar esa foto: borraría el anexo.
- **Fachadas de referencia** (`h2_ref1..3`): se les quitó la clave del cuadro (respaldo en
  `refs-antes.json` / `refs-despues.json` de esta carpeta).
- Las de la sección «Diferencias esperadas» de la guía siguen vigentes (N° interno, tasador, visador,
  firma, región, hoja 3, textos).
