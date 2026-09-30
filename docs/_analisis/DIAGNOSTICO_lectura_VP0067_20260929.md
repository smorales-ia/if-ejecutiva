# DIAGNÓSTICO — Naranjos "Sin los datos" en /lectura de VP-2026-0067

> Tanda T-VP0067-LECTURA-DIAG-20260929 · FASE 1 (solo lectura, nada modificado).
> Equipo: 5 agentes (vista · pipeline · estado real · oráculo · product owner).
> Vista: https://if-ejecutiva-production.up.railway.app/tasaciones/recmMzeu3eWGxyXsf/lectura

## §1 · Resumen ejecutivo

Los naranjos aparecen porque la vista lista los atributos del catálogo
`D_TipoDocumentoAtributo` marcados `obligatorio=true` que NO figuran en `items[]` de
`atributos_obtenidos` del adjunto (route.ts:130-137). El pipeline RF-09 pidió los 13
campos a Claude (EXTRAÍBLE_OK, sin mapeo roto): 8 de 13 no existen en los documentos
fuente (foto SII de sitio eriazo, TGR recortado, notaría cortada en el escaneo) — esos
naranjos son el producto diciendo la verdad — y 5 (todos del CBR) sí están legibles en
el documento pero la corrida se degradó porque el docx viajó a la API como bloque
"image" con mime docx (bug del blueprint). No bloquean nada: los 8 adjuntos están
`listo` y el dato de verdad del informe viaja por otras tablas.

## §2 · Tabla por campo faltante

Mecánica: naranjo nace en `lib/tasador/mensaje-datos-faltantes.ts:15` +
`estado-procesando.tsx:315-319`; server `app/api/tasaciones/[id]/lectura/route.ts:130-137`;
catálogo vía `lib/tipos-documento.ts:195-226` (tbldI86ieVKpjpL7E, caché 5 min). La UI
solo mira `items[].codigo_atributo` del JSON `TX_Adjuntos.atributos_obtenidos`
(fldeCH15RrL8f4TZk); los opcionales jamás se listan (por eso los otros 5 docs van en verde).

| Doc | Campo (código) | ¿Lo pide RF-09? | ¿Está en el archivo? | Causa raíz | Valor espejo (fuente) |
|---|---|---|---|---|---|
| CBR | vendedor | Sí (no_extraidos) | **Sí** (imagen en docx) | **(a)** corrida degradada docx→image | RAUL FERNANDO VALENZUELA PEREZ (imagen docx) |
| CBR | comprador | Sí | **Sí** | (a) | FCO. JOSÉ VERGARA UNDURRAGA + MARÍA LUISA ORELLANA FERNANDEZ (imagen) |
| CBR | nombre_propietario | Sí | **Sí** (compradores "por partes iguales") | (a) | ídem compradores (imagen) |
| CBR | fecha_inscripcion | Sí | **Sí** | (a) | 13-ene-2020 · Fojas 3312 · N°4663 (imagen; ⚠ el informe usa la terna SII 13291/21565/2006) |
| CBR | comuna ("Comuna del CBR") | Sí | Parcial (predio: Colina; jurisdicción: Santiago) | (a) con semántica ambigua (catálogo sin etiqueta/ejemplo) | Colina (predio) o Santiago (CBR) — definir |
| CBR | notaria | Sí | **No** (texto cortado; Escritura.pdf es de OTRA operación) | **(b)** | NO_EXISTE_EN_FUENTE |
| CBR | nombre_cbr | Sí | No explícito ("Santiago" como plaza) | (b) | CBR de Santiago (inferido, confianza media) |
| Foto SII | sup_m2 | Sí | **No** — sitio eriazo, tabla edificación vacía | (b) honesto | 249,91 pero del XLSM (FICHA SOLIC L38), NO del SII |
| Foto SII | tipo_material | Sí | **No** | (b) | ALBAÑILERÍA LADRILLO (XLSM Portada D12, no SII) |
| Foto SII | anio_construccion | Sí | **No** | (b) | 2024 (XLSM Portada AE8, no SII) |
| TGR | fecha_emision | Sí | **No** — certificado recortado | (b) del archivo actual | NO_EXISTE_EN_FUENTE |
| TGR | avaluo_afecto_clp | Sí | **No** en TGR; **SÍ en la Consulta SII de la misma carpeta** (ya extraído) | (b) por-documento | $279.778.719 (consulta_antecedentes) |
| TGR | contribucion_total_clp | Sí | Derivable (2×679.162); directo en Consulta SII (ya extraído) | (b) por-documento | $679.162/trimestre (consulta SII) |

Causa (c) desajuste de mapeo: **0 casos**. Hallazgo transversal: los 7 obligatorios
del CBR no tienen `uso_tabla_destino` — "Completar a mano" promete una captura que el
producto no ofrece (incoherencia de catálogo: obligatorio ⇒ debería implicar destino o UI).

Hallazgos laterales del oráculo: `docs/_referencias/Escritura.pdf` y
`docs/_referencias/foto_fuente_sii.jpg` (raíz) NO pertenecen a MET-6283 (otras
operaciones); y el desatasco manual del 29-sep dejó en el adjunto CBR la terna del SII
(13291/21565/2006, la que imprime el informe gold master) — el documento CBR real dice
3312/4663/2020. La discrepancia adjunto-vs-informe es un rasgo del expediente ORIGINAL
(la tasadora usó la terna del SII), no un bug nuestro.

## §3 · ¿VP-0066 muestra estos naranjos?

**No comparable: VP-2026-0066 tiene CERO adjuntos en TX_Adjuntos** (verificado con
filtro y scan completo de la tabla). Su /lectura daría lista vacía y `completo: true` —
sus datos "poblados" entraron por otra vía, no por el pipeline de extracción. El cruce
(i)/(iii) no es demostrable con ella; el dictamen se sostiene en los documentos fuente.

## §4 · Propuesta consensuada

**Para VP-0067 (espejo fiel):**
- **R0 — No tocar nada (co-recomendada)**: los naranjos son verídicos, no bloquean, el
  PDF sale igual. Elimina 0.
- **R1b — Poblar solo lo verbatim del documento (co-recomendada si molestan los
  evitables)**: PATCH de `atributos_obtenidos` del CBR agregando los 5 clase-(a)
  (vendedor, comprador, propietario, fecha 13-ene-2020, comuna Colina). Elimina 5 de 13;
  quedan 8 honestos. Esfuerzo S, riesgo bajo (los 5 no tienen destino → cascada no-op),
  reversible con snapshot. **Terna intacta** (ver §5-D3).
- **R1a — Precarga total desde el oráculo (NO recomendada)**: eliminaría 12-13 pero
  `items[]` afirmaría que los documentos contienen datos que no contienen — maquilla el
  extractor; solo defendible como demo documentada.
- R1c — Desmarcar obligatorios como parche: DESCARTADA (palanca estructural, no parche).

**Estructural multi-cliente (prioridad del equipo):**
1. **E3 · Satisfacción por carpeta (S/M, solo código)**: en /lectura, no reclamar un
   obligatorio que ya está en `items[]` de OTRO adjunto de la misma solicitud
   (caso canónico: avalúo afecto y contribución ya extraídos de la Consulta SII).
   Elimina la clase de naranjo más injusta.
2. **E2-A · Vetar docx en upload (S, solo código)**: hoy el blueprint manda docx como
   bloque "image" (causa raíz de los 5 CBR). Alternativa E2-B: convertir docx→PDF en
   Make (M, toca blueprint activo).
3. **E1 · Recalibrar `obligatorio` del catálogo (S a M-L, decisión de negocio)**:
   regla "obligatorio ⇒ destino o captura" + obligatoriedad condicional (no exigir
   construcción a un sitio eriazo). Afecta a TODOS los clientes.
4. **E4 · Flujo "Reemplazar archivo" + re-extracción (M)** y **E5 · semántica de
   atributos ambiguos en catálogo (S)**: deuda/tanda posterior.

Advertencia técnica: re-disparar RF-09 con los MISMOS archivos exige resetear
`estado_extraccion=idle`, sobrescribe `atributos_obtenidos` SIN merge y con 0 items
marca error/delegado_visador — ganancia casi nula; no hacerlo.

## §5 · Esfuerzo, riesgos y decisiones de Sergio

R0: nulo · R1b: S (1 PATCH con snapshot) · E3: S/M código + test · E2-A: S código ·
E1: decisión de negocio + catálogo productivo (afecta a todos) · E4/E2-B: M, CU posterior.

**Decisiones (7 preguntas):**
1. Espejo: ¿(A) pantalla verídica con naranjos honestos (R0/R1b) o (B) limpia para demo (R1a)?
2. Si R1b/R1a: ¿autorizás PATCH de `atributos_obtenidos` en producción (snapshot previo)?
3. Terna CBR: ¿ratificás mantener 13291/21565/2006 (la del informe, recomendado) documentando que el documento dice 3312/4663/2020? (Un "No" obliga a re-cascada y re-validar el PDF.)
4. Catálogo foto SII: ¿(A) desmarcar obligatorios ya (todos los clientes), (B) diseñar obligatoriedad condicional, (C) dejar?
5. docx en RF-09: ¿(A) vetar en upload (barato) o (B) convertir docx→PDF en Make?
6. E3 (satisfacción por carpeta): ¿aprobás la tanda de código? Sí/No.
7. E4 (reemplazo de archivo): ¿este CU o deuda registrada? A/B.

## §6 · Prompt sugerido para FASE 2 (si Sergio aprueba)

```
Arrancamos TANDA T-VP0067-LECTURA-FIX — ejecutar las decisiones del diagnóstico
docs/_analisis/DIAGNOSTICO_lectura_VP0067_20260929.md (leerlo primero).
DECISIONES DE SERGIO: [pegar respuestas 1-7].
Alcance según decisiones:
- Si R1b: PATCH de atributos_obtenidos SOLO en rec7t6MPxKu10WniF (TX_Adjuntos
  tblur71x1oItbmKZc) agregando a items[] los 5 campos verbatim del documento
  (vendedor/comprador/nombre_propietario/fecha_inscripcion/comuna, valores en §2),
  terna 13291/21565/2006 INTACTA, no_extraidos ajustado; snapshot previo a
  docs/_evidencia/T-VP0067-LECTURA-FIX/rollback.md; verificar en /lectura que el
  naranjo del CBR queda solo con notaría y CBR (u oculto si E3 aprobado).
- Si E3: modificar app/api/tasaciones/[id]/lectura/route.ts para satisfacer
  obligatorios por carpeta (mismo codigo_atributo en items[] de otro adjunto de la
  solicitud), con test unitario co-ubicado y pnpm build limpio. NO commit/push.
- Si E2-A: validación de mime en el upload (UI + Route Handler) con mensaje humano §6.
- Si 4A: desmarcar obligatorio en D_TipoDocumentoAtributo para sup_m2/tipo_material/
  anio_construccion de foto_fuente_sii (snapshot de los flags antes).
Reglas: rollback antes de cada cambio · auditor ciego al final (verificar /lectura
data-driven) · sin secretos · cierre en claude-out.txt.
```
