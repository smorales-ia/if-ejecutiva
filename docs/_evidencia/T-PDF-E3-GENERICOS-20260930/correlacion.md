# Correlación 1:1 · 20 ranuras de imagen · VP-2026-0067 — T-PDF-E3-GENERICOS-20260930

**Verificador (Bloque 2 · Frente B) · 30-sep-2026.** Verificación a nivel lógica + datos
reales (producción Railway aún corre el código viejo; la UI en prod no aplica).

## Método

Script Node temporal (`/tmp/verif-correlacion-vp0067.mjs`, NO en el repo) contra la REST
API de Airtable (`AIRTABLE_TOKEN` de `.env.local`, sólo lectura, token jamás impreso):

- **Constantes reales, no transcritas**: `RANURAS_FOTO` y `RANURAS_ANEXO` se extrajeron en
  runtime del propio `lib/informe/imagenes.ts` (regex sobre el literal + eval), garantizando
  identidad con el código bajo prueba.
- **Réplica exacta** de la lógica: `filasDeSolicitud` (`{solicitud}="VP-2026-0067"`,
  `lib/tasador/lectura-informe.ts:220-225`), bloque 7 canónico (líneas 441-447 y 627-636),
  input de `resolverAnexos` (454-462), `leerFirmaTasador` (300-314), y
  `fuenteRenderizable`/`resolverAnexos`/`resolverImagenes` de `lib/informe/imagenes.ts`
  (149-151, 160-173, 258-312).
- Se construyó (a) el canónico de lectura (`anexosRanuras` + `firmaTasadorUrl` + fotos por
  categoría) y (b) el objeto `imagenes` del payload Carbone, y se compararon.

## Datos vivos leídos

- Solicitud `recmMzeu3eWGxyXsf` · `codigo_solicitud = VP-2026-0067` · tasador
  `recTJcV3BIvdcG4em`.
- `TX_Adjuntos` filtradas por solicitud: **36 filas** (20 fotos + 16 documentos; incluye el
  seed de la tanda más filas preexistentes).
- `M_Tasadores.firma_url` del tasador: **data-URI (6.835 chars), renderizable**.

## Evidencia por ranura (las 20)

Todas las fuentes son data-URI JPEG (chars = largo del data-URI).

### 6 ranuras fotográficas (categoría del bloque 7 + `orden` asc)

| Ranura | Record TX_Adjuntos | Fuente | Chars |
|---|---|---|---|
| mapaUbicacion | `recM3pvhvf42qe3cb` (mapa_ubicacion · orden 0 · h4_01_ubicacion.jpg) | thumbnail_url data-URI | 83.591 |
| fachada | `recTMcPu6X5GqMLdP` (fachada_exterior · orden 2, la 1ª de su categoría · h4_03_fachada.jpg) | thumbnail_url data-URI | 86.203 |
| refMapa | `recO1c5RxM4gAXfAa` (mapa_referencias · orden 16 · h2_mapa_referencias.jpg) | thumbnail_url data-URI | 94.351 |
| ref1 | `rec7KDUUpuPJ4ov06` (ofertas_comparables · orden 1 · h2_ref1.jpg) | thumbnail_url data-URI | 96.511 |
| ref2 | `recGuGlyh2WDHHxjr` (ofertas_comparables · orden 2 · h2_ref2.jpg) | thumbnail_url data-URI | 79.655 |
| ref3 | `recSSA0wfHsb8V2CN` (ofertas_comparables · orden 3 · h2_ref3.jpg) | thumbnail_url data-URI | 80.647 |

### 1 firma

| Ranura | Record | Fuente | Chars |
|---|---|---|---|
| firma | `recTJcV3BIvdcG4em` (M_Tasadores.`firma_url`) | data-URI | 6.835 |

### 13 ranuras de anexo (riel documental · `clave_adjunto` = código D_TipoDocumento)

| Ranura | Código | Record TX_Adjuntos | Archivo | Chars |
|---|---|---|---|---|
| anexo1Plano | foto_plano_cuadro_superficies | `recNktvt91eO41wo6` | foto_plano_cuadro_superficies_Met6283.jpg | 93.159 |
| anexo1Esquema | esquema_superficies | `recaNIeSLo5c4GuRp` | esquema_superficies_Met6283.jpg | 52.751 |
| anexo1CuadroSup | cuadro_superficies | `recyWOZY3faaDPbUj` | cuadro_superficies_Met6283.jpg | 85.011 |
| anexo1Emplazamiento | planta_emplazamiento | `recXsnwI5eLeWyrtw` | planta_emplazamiento_Met6283.jpg | 89.095 |
| anexo1Aerea | foto_aerea | `rechuTt7dJgQzsu84` | foto_aerea_Met6283.jpg | 94.147 |
| anexo1MapaSii | mapa_sii | `recSIYEtTs7yJ6FI8` | mapa_sii_Met6283.jpg | 92.627 |
| anexo1InfoSii | foto_fuente_sii | `recWdb4FAphNaTE0I` | foto_fuente_sii_Met6283.jpg | 84.803 |
| anexo2RolAvaluo | certificado_avaluo_fiscal | `rec30QF4gVWxj3Cfk` | certificado_avaluo_fiscal_Met6283.jpg | 86.623 |
| anexo2Permiso | permiso_edificacion | `rec95X1HPJB7ZUo5G` | permiso_edificacion_Met6283.pdf | 92.379 |
| anexo2Escritura | escritura_compraventa | `reccsOuryOiUsFAxL` | escritura_compraventa_Met6283.jpg | 95.331 |
| anexo2NoExpropiacion | informe_no_expropiacion_serviu | `recpI0wPyESJ0Etvs` | informe_no_expropiacion_serviu_Met6283.pdf | 96.547 |
| anexo2Recepcion | certificado_recepcion_final | `rectCtwDMT2mwN4GO` | certificado_recepcion_final_Met6283.pdf | 94.419 |
| anexo2Tgr | certificado_deuda_tgr | `rechQjmqpb3HMWyeb` | certificado_deuda_tgr_Met6283.pdf | 79.647 |

## Conclusiones

1. **¿Las 20 ranuras de VP-0067 tienen fuente viva? SÍ — 20/20 llenas**, todas desde
   `TX_Adjuntos.thumbnail_url` o `M_Tasadores.firma_url` (datos en Airtable, cero disco).
2. **¿UI y PDF leen LA MISMA fuente? SÍ, por construcción y por dato:**
   - Camino único: la UI (`app/tasaciones/[id]/informe/page.tsx:94-95` →
     `anexosCanonico`/`firmaCanonico`) y el PDF
     (`lib/informe/ensamblador.ts:305-307` → `construirInforme`, y `:473-477` →
     `resolverImagenes(informe.anexosRanuras, informe.firmaTasadorUrl)`) consumen el
     MISMO objeto que produce `construirInforme`
     (`lib/tasador/lectura-informe.ts:454-462` y `:656-657`).
   - Dato: el script comparó ranura a ranura la proyección (a) canónico vs (b) payload
     Carbone: **anexos 13/13 idénticos · firma idéntica** (0 mismatches).
3. Comparación (b) contra la UI de fotos: las ranuras fotográficas salen de las mismas
   filas del bloque 7 canónico que renderiza el preview (misma `descripcion`+`orden`).

## Observaciones no bloqueantes

- 3 documentos sin `thumbnail_url` en la base: `inscripcion_dominio_cbr` (.docx),
  `consulta_antecedentes_bien_raiz` (.pdf) y `foto_ofertas_comparables` (.jpg). **Ninguno
  mapea a las 13 ranuras de anexo** (`RANURAS_ANEXO` no incluye esos códigos), así que no
  afectan el 20/20. Coinciden con la deuda P2 documentada (PDF/docx sin thumbnail).
- Hay 20 fotos para 16 posiciones de grilla: entran las primeras 16 por `orden` asc
  (camino `grillaDesdeFotosReales` con warn, por diseño). Una foto tiene categoría custom
  «Planificación»: entra a la grilla con su nombre tal cual, no alimenta ranura fija —
  comportamiento contractual.
- La ranura `fachada` toma la foto con `orden=2` porque es la PRIMERA de la categoría
  `fachada_exterior` en orden ascendente (el índice de `RANURAS_FOTO` es por posición
  dentro de la categoría, no por valor absoluto de `orden`) — correcto según contrato.
