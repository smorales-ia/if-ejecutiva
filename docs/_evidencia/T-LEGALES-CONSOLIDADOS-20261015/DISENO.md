# T-LEGALES-CONSOLIDADOS-20261015 · Sección F «Documentos legales» lista desde los documentos

> Nota operativa con fecha, no spec. **Aprobada por Sergio el 15-oct-2026 («Apruebo todo», con Sello
> SEC) y aplicada en Airtable** — ver `README.md`. Lecturas y escrituras por REST — motivo RO-30: el MCP
> de Airtable está sin autenticar en esta sesión.

Pedido de Sergio (15-oct-2026, réplica MET-6283 · VP-2026-0079): la sección F llega lista con lo que
se pueda obtener de los documentos del checklist; el tasador sólo revisa, corrige o completa. Guardado
idempotente, el mismo valor en todos los lugares, siempre el dato más actualizado.

## 1. Diagnóstico (VP-2026-0079 · `rec6XubOR92X6gnOH`)

| Campo F | Dónde se guarda | Valor hoy | De dónde vino | Esperado (original) |
|---|---|---|---|---|
| CBR Foja / Número / Año | `TX_DocumentosLegales.fojas` · `numero_inscripcion` · `ano_inscripcion` | 13291 / 21565 / 2006 | foto SII (inscripción antigua) | **3312 / 4663 / 2020** |
| N° / fecha permiso | `TX_DocumentosLegales.permiso_edificacion_numero` · `_fecha` | 319-2020 · 2020-09-09 | permiso de edificación | PDF imprime `N°319  09/09/2020` |
| N° / fecha recepción | `TX_DocumentosLegales.recepcion_final_numero` · `_fecha` | 210-2024 · 2024-07-18 | certificado de recepción final | PDF imprime `N°210  18/07/2024` |
| N° cert. no expropiación | `TX_DatosTasacion.n_cert_no_expropiacion` | 3444743 | informe SERVIU | 3444743 ✓ |
| Lat / Lng | `TX_DatosTasacion.lat` · `long` | vacías | — | -33.234583 / -70.675083 |
| Sello SEC (+ID, vencimiento) | **ninguna columna** (`CAMPOS_SIN_DESTINO`) | — | — | «No aplica» (casa · RN-58) |
| Vendedor · Comprador · Notaría · Repertorio · Afecto expropiación | **ninguna columna** | — | — | (no están en la tabla del pedido) |

Causas:

1. **La escritura «Fojas 3312» (`rec2p6QpeesQ0w2SW`, `escritura_compraventa`) quedó en `error`**:
   LogEscenarios 18:43:48 «Claude no extrajo ningún atributo». Su tipo sólo declara el par permiso y
   el par recepción (4 atributos); la imagen es la nota de inscripción del CBR, que no trae ninguno.
   Nadie le pide la foja/número/año de la inscripción.
2. **`mapa_sii` sí leyó las coordenadas** (`latitud = -33.23458`, `longitud = -70.675087`) pero el tipo no
   tiene filas en `D_TipoDocumentoAtributo`: AT03-Ext las descartó como «no declarado» (log 18:57:42).
   El informe SERVIU declara lat/long → `TX_DatosTasacion`, pero el documento de 0079 no las imprime.
3. **Política «el primero que llega gana»** (AT03-Ext v4/v5 fuera de la consolidación): la foto SII
   llegó primero y fijó la terna 2006; ninguna lectura posterior la habría corregido.
4. **`TX_DocumentosLegales` no tiene `origen_dato`**: no hay candado que distinga lo que guardó el
   tasador de lo que escribió la lectura.
5. **Bug latente (afecta también a las superficies de la sección B):** el PATCH `/datos` escribe
   `origen_dato = tipeado` en `TX_DatosTasacion` **sólo al crear** la fila. Si la fila la creó la
   lectura (`extraido_rf09`, caso 0079), guardar el formulario no pone el candado y una lectura
   posterior puede pisar lo que guardó el tasador.
6. El PDF imprime `legales.permisoEdificacion` / `recepcionFinal` = sólo el número («319-2020»); el
   original compone `N°319  09/09/2020`.

## 2. Diseño propuesto

### 2.1 Regla de «dato más actualizado» (AT03-Ext v6, data-driven)

Se extiende la consolidación de v5 (hoy sólo numérica y campo a campo) a **grupos**: los campos de un
grupo se escriben juntos **desde un solo documento ganador** (nunca la foja de uno con el año de otro).

Orden total para elegir el ganador del grupo:
1. **vigencia más reciente** (el atributo del grupo marcado como vigencia: año de inscripción, fecha
   del permiso, fecha de la recepción) — mayor gana;
2. `prioridad_destino` (menor gana) — naturaleza del documento;
3. el adjunto subido más reciente; 4. adjuntoId (desempate total ⇒ independiente del orden).

| Grupo (`grupo_destino`) | Campos destino | Vigencia | Documentos · prioridad |
|---|---|---|---|
| `inscripcion_dominio` | `TX_DocumentosLegales.fojas` · `numero_inscripcion` · `ano_inscripcion` | año | certificado_dominio_vigente 10 · inscripcion_dominio_cbr 20 · escritura_compraventa 30 · foto_fuente_sii 40 |
| `permiso_edificacion` | `…permiso_edificacion_numero` · `…_fecha` | fecha | permiso_edificacion 10 · escritura_compraventa 20 |
| `recepcion_final` | `…recepcion_final_numero` · `…_fecha` | fecha | certificado_recepcion_final 10 · escritura_compraventa 20 |
| `no_expropiacion` | `TX_DatosTasacion.n_cert_no_expropiacion` | — | informe_no_expropiacion_serviu 10 (varios ⇒ el subido más reciente) |
| `coordenadas` | `TX_DatosTasacion.lat` · `long` | — | mapa_sii 10 · informe_no_expropiacion_serviu 20 · sólo si vienen las dos y en rango (lat ±90, long ±180) |

En 0079: escritura 2020 vence a foto SII 2006 ⇒ **3312 / 4663 / 2020**. Coordenadas del mapa SII
⇒ -33.23458 / -70.675087 (difieren < 1 m de las del original, que se tomaron de otra fuente; el
tasador puede afinarlas).

Idempotencia y candado, igual que v5: cada corrida recalcula sobre **todos** los adjuntos `listo` de la
solicitud y escribe sólo si el grupo cambia; re-leer = 0 escrituras. Con `origen_dato = tipeado` en la
fila no se escribe nada; un valor distinto sin `origen_dato` no se pisa; sólo se corrige lo que escribió
la propia lectura (`extraido_rf09`). Un documento **más reciente** (mayor año/fecha, o el mismo tipo
subido después) sí actualiza el grupo mientras el tasador no haya guardado.

### 2.2 Cambios en Airtable (requieren tu aprobación)

1. `D_TipoDocumentoAtributo`: 2 campos nuevos — `grupo_destino` (texto) y `vigencia_destino` (checkbox).
2. `D_TipoDocumentoAtributo`: completar `prioridad_destino` / `grupo_destino` / `vigencia_destino` en las
   17 filas existentes de la tabla de arriba (foto SII ×3, inscripción CBR ×3, escritura ×4, permiso ×2,
   recepción ×2, SERVIU ×3). Respaldo previo en JSON.
3. `D_TipoDocumentoAtributo`: 8 filas nuevas —
   `escritura_compraventa__{foja_inscripcion, numero_inscripcion, ano_inscripcion}` (la nota de
   inscripción del CBR al pie de la escritura: «Inscrita a fojas 3312 número 4663 … año 2020»),
   `certificado_dominio_vigente__{foja, numero, ano}` (hoy 0 atributos) y
   `mapa_sii__{latitud, longitud}` (hoy 0 atributos; ya las lee).
   Efecto en SC-RF09: el prompt de esos tres tipos pide esos atributos (se arma desde esta tabla; no se
   toca el escenario).
4. `TX_DocumentosLegales`: campo nuevo `origen_dato` (singleSelect `tipeado · extraido_rf09`) + backfill
   de las filas existentes (`tipeado` si `A_Cambios` registra un guardado de antecedentes legales de esa
   solicitud; si no, `extraido_rf09`).
5. Pegar a mano AT03-Ext **v6** en la automation (como la v5).
6. Para 0079: releer la escritura (`estado_extraccion = idle`) y re-disparar AT03-Ext del mapa SII.

7. (Decisión del panel, 15-oct-2026) `D_TipoDocumentoAtributo`: `obligatorio = false` en
   `inscripcion_dominio_cbr__notaria` (`recFQMPeD6ow4ikeq`) y `__comprador` (`recLMXwCxkSfOFcJe`),
   para que la pantalla de lectura no los marque como faltantes ahora que el formulario no los pide.

**Opcional (dime si va):** Sello SEC persistido — `TX_DocumentosLegales.sello_sec` (singleSelect
`vigente · vencido · no_aplica`), `sello_sec_id` (texto), `sello_sec_vencimiento` (fecha); filas
`sello_verde_sec__numero_sello_sec → sello_sec_id` y `__fecha_vencimiento → sello_sec_vencimiento`; y
«No aplica» precargado para casas (RN-58), editable. Sin esto el Sello SEC sigue sin guardarse en ningún
lado (hoy se pierde al recargar).

Fuera de esta tanda: vendedor / comprador (decisión H4: su destino canónico es
`TX_Solicitudes.vendedor_*`), notaría, repertorio y «afecto a expropiación» (no tienen columna).

### 2.3 Cambios de código (sin aprobación de schema, van en el mismo commit)

- `docs/_artefactos/airtable/AT03-Ext_script.js` v6 (+ test que ejecuta el bloque puro del propio script).
- `app/api/tasaciones/[id]/datos/route.ts`: el PATCH pone `origen_dato = tipeado` también al **actualizar**
  `TX_DatosTasacion`, y en `TX_DocumentosLegales` al crear/actualizar (corrige el bug 5).
- `lib/tasador/lectura-datos.ts`: badge «Pre-llenado · editable» en los campos F que vienen de la lectura.
- `lib/tasador/lectura-informe.ts`: el PDF compone `N°319  09/09/2020` y `N°210  18/07/2024` (quita el
  sufijo «-AAAA» cuando coincide con el año de la fecha); el dato guardado no cambia.
- ~~`lib/adjuntos-doc-campos.ts`: los campos consolidados salen del cascade de borrado~~ — **diferido**
  (15-oct-2026, al implementar): cambia la política Q1 de Héctor y reescribe ~15 tests, uno de ellos de
  regresión de un bug de borrado; no se mete durante la réplica. Mientras tanto, borrar un documento del
  grupo limpia los campos del grupo (Q1, como hoy) y la siguiente lectura de cualquier documento del
  grupo los vuelve a consolidar. Queda como tanda propia.
- Spec §2.8 (sección F) + `docs/schema-airtable.md` §28.4 + `aprendizajes.md`.

## 3. Rollback

Volver a pegar v5; vaciar `grupo_destino` / `vigencia_destino` y la `prioridad_destino` nueva de las
17 filas (respaldo JSON); borrar las 8 filas nuevas; los campos nuevos se borran desde la UI (la API no
borra campos). Con v5 pegada los campos nuevos son inocuos.
