# Commit sugerido (sin hacer · Sergio)

⚠ **Desplegar DESPUÉS de que Sergio presione «Calcular Tasación» en la réplica de VP-2026-0079.**

Airtable ya está aplicado (campos, filas, backfill) y AT03-Ext v6 ya está pegada; la relectura de
VP-2026-0079 dio 3312 / 4663 / 2020 y lat/long del mapa SII. El código de abajo es lo que falta desplegar.

Verificación: `tsc` 0 · `vitest run lib app components` 1283/1283 · `next build` 0.

Archivos (stagear sólo estos):

- `components/tasador/form-sections/seccion-documentos.tsx` · `components/tasador/tasacion-form.tsx`
- `lib/tasador/tasaciones.ts` · `lib/tasador/validators/index.ts` · `lib/tasador/use-guardado.ts`
- `lib/tasador/legales.ts` (nuevo) + `lib/tasador/legales.test.ts` (nuevo)
- `lib/tasador/lectura-datos.ts` + `lib/tasador/lectura-datos.test.ts`
- `lib/tasador/lectura-informe.ts` + `lib/tasador/lectura-informe.test.ts`
- `app/api/tasaciones/[id]/datos/route.ts` + `route.test.ts`
- `lib/tasador/recuperacion-borrador.test.ts` · `lib/tasador/tasador-store.test.ts`
- `docs/_artefactos/airtable/AT03-Ext_script.js` (v6) + `lib/tasador/at03-ext-consolidacion.test.ts`
- `docs/_md/VProperty_Especificacion_Proyecto_v1_9_18.md` (§2.8.3 + cabecera) · `docs/schema-airtable.md`
  (§21.3, §28.4) · `docs/CODE_INCONSISTENCIES.md` (CI-023 §1) · `docs/aprendizajes.md`
- `docs/_evidencia/T-LEGALES-CONSOLIDADOS-20261015/`

```
feat(cu-002): sección F lista desde los documentos, con la inscripción vigente y sin comprador/notaría/repertorio

La sección F del formulario del tasador llega con lo que traen los documentos
adjuntos y el tasador sólo revisa, corrige o completa. AT03-Ext v6 consolida
por grupos que se escriben juntos desde un solo documento (inscripción de
dominio, permiso, recepción, no expropiación, coordenadas, sello SEC) y elige
el más reciente; después, la jerarquía del documento (prioridad_destino) y el
subido más reciente. Es idempotente y no pisa lo que guardó el tasador. En
VP-2026-0079 la escritura de 2020 reemplaza la inscripción de 2006 de la foto
SII y las coordenadas salen del mapa SII.

- Campos con badge «Pre-llenado · editable» mientras los escribió la lectura.
- Sello SEC persistido en TX_DocumentosLegales; «No aplica» sugerido para
  casas (RN-58) o vigente/vencido según el vencimiento leído.
- Guardar deja origen_dato = tipeado en TX_DatosTasacion también al
  actualizar (antes sólo al crear) y en TX_DocumentosLegales.
- El informe imprime permiso y recepción como la planilla: «N°319  09/09/2020».
- Se retiran Comprador, Notaría y Repertorio (la planilla del cliente no los
  usa). La ruta los sigue aceptando e ignorando para pestañas con el bundle
  viejo; salen del schema tras cerrar la réplica. VERSION_BORRADOR no cambia.

Airtable (aprobado por Sergio y aplicado el 15-oct-2026): grupo_destino y
vigencia_destino en D_TipoDocumentoAtributo, 8 atributos nuevos, 21 filas
actualizadas; origen_dato y sello_sec* en TX_DocumentosLegales.

Desplegar después de «Calcular Tasación» en la réplica de VP-2026-0079.

Refs: spec §2.8.3 · schema §28.4 · CI-023 §1 · RN-58 · T-LEGALES-CONSOLIDADOS-20261015 · réplica MET-6283
```
