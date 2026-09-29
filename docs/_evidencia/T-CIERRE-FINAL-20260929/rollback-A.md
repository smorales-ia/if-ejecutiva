# Rollback AGENTE A — T-CIERRE-FINAL-20260929 (densidad vertical página 1)

> 29-sep-2026 · Alcance: SOLO layout/espaciado vertical de la página 1 (portada)
> de la plantilla Carbone. Sin cambios de datos, imágenes ni otras hojas.

## Estado original (pre-cambios, verificado con md5sum)

| Artefacto | Valor original |
|---|---|
| `docs/_artefactos/carbone/PLANTILLA_MET_v2.docx` | md5 `debe05352545ea8a7c0897b07927bec6` |
| `docs/_artefactos/carbone/generar_plantilla_met_v2.py` | md5 `32ef2ff4e59913f16db85854ba75a6af` |
| templateId productivo (Carbone, usado por E2) | `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d` |
| Escenario E2 (Make 5750023) | blueprint pre-tanda en `blueprint-pre-5750023-redacted.json` (esta carpeta); módulo Carbone apunta a `POST /render/517ddc62…434d` |

## Cambios previstos y cómo revertir cada uno

1. **`generar_plantilla_met_v2.py`** — ajustes de espaciado vertical en `portada()`
   (top_margin sección 0 y/o spacers `parrafo()` antes del logo, de ANTECEDENTES,
   de la ficha y del pie). Revertir: `git checkout -- docs/_artefactos/carbone/generar_plantilla_met_v2.py`
   (o restaurar hasta que md5 = `32ef2ff4e59913f16db85854ba75a6af`).
2. **`PLANTILLA_MET_v2.docx`** — regenerado desde el .py. Revertir:
   `git checkout -- docs/_artefactos/carbone/PLANTILLA_MET_v2.docx`
   (md5 objetivo `debe05352545ea8a7c0897b07927bec6`) o re-ejecutar el .py revertido.
3. **Plantilla nueva en Carbone producción** (si se publica): anotar aquí el nuevo
   templateId. Revertir: `DELETE /template/{nuevoId}` con `Authorization: Bearer <CARBONE_PROD>`
   + `carbone-version: 4`. El templateId viejo `517ddc62…434d` NO se borra.
4. **E2 (scenario 5750023)** re-apuntado al nuevo templateId + bump de name a v2.2.
   Revertir: `PATCH $MAKE_BASE_URL/scenarios/5750023` con el blueprint previo
   (obtenible de `GET /scenarios/5750023/blueprint`; estructura de referencia en
   `blueprint-pre-5750023-redacted.json`), restaurando la URL
   `https://api.carbone.io/render/517ddc62…434d` en el módulo Carbone y el name previo.
   En Make el header Authorization vigente se conserva si no se toca.

## Resultado (se completa al cierre)

- Nuevo templateId publicado: `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
  (verificado `GET /template/{id}` → 200). Nuevos md5: docx `25e1c773e9cd9cf678c3e78ebdf8a363`,
  py `3ecde96a5162c059c832b19ffd10d690`.
- E2 (5750023): **SIN CAMBIO** — el clasificador de permisos del entorno denegó el
  acceso al escenario (regla CLAUDE.md E1/E2/E3). Sigue v2.1 → templateId
  `517ddc62…434d`; producción intacta. Si se desea revertir del todo, basta
  `DELETE /template/31f3bfab…08e32` (id completo arriba) y `git checkout` de los
  dos archivos de plantilla.
