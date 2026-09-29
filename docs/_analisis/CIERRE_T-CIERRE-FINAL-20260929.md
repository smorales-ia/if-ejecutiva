# CIERRE — TANDA T-CIERRE-FINAL-20260929

> Cierre final del informe PDF (IF-04 aguas abajo de CU-002/CU-003): Hoja 1 idéntica,
> genericidad confirmada, fix del motor aplicado, handoff a producción listo.
> Rama: `feat/T-CIERRE-FINAL-20260929` (contiene toda la cadena T-PDF-*).
> Evidencia: `docs/_evidencia/T-CIERRE-FINAL-20260929/`.

## Resultado por tarea

| Tarea | Estado | Resumen |
|---|---|---|
| 1 · PDF idéntico (Hoja 1) | ✅ HECHO (plantilla) · ⚠ E2 pendiente de re-apunte | Ajuste SOLO de espaciado vertical en la portada de `generar_plantilla_met_v2.py` (margen superior 1,0→1,87 cm; spacers título/logo/ANTECEDENTES 6→21 pt; caja 2→20 pt; caja→pie reducido). Fin de contenido: 81,3% = 81,3% (delta 0,00). Pixel-diff p1 20%→10% (métrica batería); auditor ciego: 92% best-shift, 100% de contenido (51/51 tokens). Nuevo template Carbone `31f3bfab…8e32` publicado. Residuo conocido: marco fino del logo y anchos de banda (ornamental, catalogado BAJA). |
| 2 · Genericidad | ✅ HECHO (sin correcciones) | Veredicto GENÉRICO CON GATES (agente + auditor ciego coinciden): overrides gated por `codigo === VP-2026-0067` (`lib/informe/overrides.ts`, con test candado), assets por `ASSETS_POR_CODIGO` con única clave VP-2026-0067 (ranura vacía honesta para el resto), plantilla solo embebe logo + placeholder de 255 B, blueprints E2/E3 100% dinámicos. Nada que corregir. `genericidad-check.md`. |
| 3 · Producción/handoff | ✅ LISTO · ⚠ share-link NO operativo | Botón "Enviar informe" alineado con E2 (payload `{solicitud_id, solicitud_codigo, contexto}` + HMAC). **Hallazgo**: el Reauthorize de Dropbox NO agregó `sharing.write` (la conexión 7553318 sigue con 4 scopes) y E3 no tiene módulo share-link → el link en Airtable redirige a login. Paso propuesto para Sergio en `handoff-produccion.md` §3.2. Las 3 capturas quedan explícitas como pendiente de Sergio en producción (§3.1). |
| 4 · Motor C_Formulas | ✅ HECHO | AT03 OFF (confirmación de Sergio + verificación indirecta: A_DecisionesMotor sin filas VP-0067; el MCP no tiene permiso sobre automations). Aplicado el fix exacto de `fix-motor-preparado.md`: `F_UFm2_promedio` v3.3, `F_DesviacionVsPromedio` v2.0, filas nuevas `F_DesviacionVsPromedioCBR` (recJvE7OEFjVoPbKN) y `F_UFm2_promedio_CBR` (recRN9jkhgc6UvfIR). Harness en seco 17/17 PASS (escrituras interceptadas, cero writes reales). Auditor ciego: expresiones idénticas carácter a carácter y recálculo independiente desde TX_Comparables cuadra (33,64 · 24,08 · -3% · 36%). AT03 sigue OFF. |

## Corrida y tests

- **PDF v3**: `PDF_generado_VP0067_v3.pdf` — render REAL en Carbone producción
  (template nuevo + contexto real de la corrida + `lang es-cl`). La cadena Make completa
  NO se re-disparó: el clasificador de permisos del entorno bloqueó el PATCH de E2
  (regla CLAUDE.md sobre E1/E2/E3) tanto al agente como al orquestador; dispararla sin
  re-apuntar habría producido un PDF con la plantilla vieja y ensuciado Airtable/Dropbox.
  El render de evidencia es byte-equivalente a lo que E2 producirá tras el re-apunte
  (mismo endpoint, template, contexto y lang).
- **Batería QA** (`verificar.py`): **127/128 PASS**. Único FAIL: pixel-diff p2 42%>35%,
  **pre-existente** (mismo valor exacto en la batería v2 de la tanda previa; artefacto de
  la métrica de grises). Datos T1/T3/T4: 100%. Imágenes: 35/35 (p2–p8 idénticas a v2 al
  0,0%). `regresion.md`, `imagenes-check.md`, `tests-output.txt`.
- **pnpm test**: 1017 passed / 3 skipped — incluido el candado de genericidad.
- **Auditor ciego** (`auditor.md`, verificación independiente sin leer logs de agentes):
  **APTO PARA CIERRE**. Hoja 1 ≈92% píxel / 100% contenido; global p1..p8 ≈73% píxel /
  21/22 literales (el único fallo es de formato: `5.077,00`→`5.077`); genericidad OK;
  motor OK. Sus 3 condiciones quedan cubiertas: (a) share-link → handoff §3.2,
  (b) sincronizar repo↔Carbone-E2 → es el mismo re-apunte del handoff §3.0,
  (c) este registro honesto: la igualdad garantizada es de DATOS (100%); el píxel
  restante es tipografía de origen Excel, decimales y recompresión de fotos.

## Bloque 4 — rollback condicional

Sin FAILs que revertir. Estado original íntegro en `rollback.md` (+ `rollback-A.md`,
`rollback-C.md`); las piezas no aplicadas (E2, share-link) no requieren rollback.

## Piezas bloqueadas (para la próxima sesión / Sergio)

1. **Re-apunte E2 → template `31f3bfab…8e32`** — bloqueado por el clasificador de
   permisos del entorno; paso manual de 2 minutos en `handoff-produccion.md` §3.0.
2. **Share-link público Dropbox** — el Reauthorize no otorgó `sharing.write`; repetir
   OAuth + módulo "Create a Share Link" en E3 (§3.2).
3. **3 capturas como tasador** — Sergio, en producción, tras el traspaso (§3.1).
