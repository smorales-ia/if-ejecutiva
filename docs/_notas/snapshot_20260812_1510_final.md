# Snapshot final · 12-ago-2026 15:10 — Manual de pruebas v2 generado

## Entregables

| Archivo | Detalle |
|---|---|
| `docs/_md/Manual_Usuario_Prueba1_v2.pdf` | 21 páginas · 0,89 MB · 15 casos de prueba |
| `docs/_artefactos/manual_imgs/img_001..003.png` | Imágenes extraídas del PDF original con PyMuPDF, en orden |
| `docs/_artefactos/manual_imgs/build_manual_v2.py` | Generador reportlab · reejecutable con `python3 build_manual_v2.py` |
| `docs/_notas/snapshot_20260812_1500.md` | Snapshot inicial |

`docs/_md/Manual_Usuario_Prueba1.pdf` no se tocó (365.045 bytes, intacto). No se ejecutó
ningún comando git (RG-08).

## Checklist de verificación

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Abre sin errores | ✅ 21 páginas, PDF 1.4, sin advertencias al abrir con PyMuPDF |
| 2 | Imágenes v2 ≥ imágenes del original | ✅ 3 extraídas · 4 colocadas (la captura de la consola ilustra dos casos) |
| 3 | Portada, índice, header, footer, paginación | ✅ portada con marca · índice con 20 enlaces internos y números de página correctos · header y "Página X de Y" en las 20 páginas de contenido · 20 marcadores en el panel del lector |
| 4 | Los 5 bloques de RG-03 en cada caso | ✅ 15/15 en los cinco bloques |
| 5 | Cobertura RG-04 | ✅ los 9 temas exigidos, repartidos en 15 casos |
| 6 | Tamaño razonable | ✅ 0,89 MB (límite 15 MB) |
| 7 | Lenguaje no técnico (RG-05) | ✅ 0 apariciones de endpoint, webhook, MCP, record ID, Airtable o Route Handler |

## Mapa de casos

CP-01 login · CP-02 lista y navegación · CP-03 filtros y orden · CP-04 buscador ·
CP-05 semáforo SLA e indicador de cartera · CP-06 wizard fase 1 · CP-07 wizard fase 2
(Nuevo/Usado) · CP-08 wizard fase 3 y creación · CP-09 contactos de visita ·
CP-10 unidades · CP-11 Documentos y Adjuntos · CP-12 detalle · CP-13 asignar tasador ·
CP-14 editar y modo consulta · CP-15 cierre de sesión y acceso protegido.

Imágenes: img_001 → CP-01 · img_002 → CP-02 y CP-12 · img_003 → CP-08.

## Decisiones que conviene que Sergio revise

1. **CP-15 se redactó como limitación, no como paso feliz.** No existe control de cerrar
   sesión en la UI (`app-header.tsx:41`, avatar con iniciales fijas "ME", sin `UserButton`).
   El caso valida lo que sí se puede validar —que `/consola` en incógnito redirige al
   login— y declara la ausencia del botón como conocida, para que la Ejecutiva no la
   reporte. Si prefieres que el manual no mencione la limitación, hay que quitar el caso.
2. **CI-002 se tradujo a lenguaje de negocio en dos casos.** En CP-06 ("la creación a
   partir de documentos está desactivada a propósito") y en CP-11 ("los documentos quedan
   sin procesar"). No se nombra la incidencia ni el escenario Make.
3. **Los casos fluyen seguidos, no una página por caso.** Con una página por caso, las
   cuatro capturas dejaban media página en blanco cada una. Si prefieres una página por
   caso para imprimir y repartir, es un cambio de una línea en el generador
   (`Spacer(1, 14)` → `PageBreak()`).
4. **La planilla de resultados va dentro del PDF** (página 20), no como archivo aparte,
   por RG-06.
5. **El generador quedó en `docs/_artefactos/manual_imgs/`** junto a las imágenes que
   consume. Si prefieres otro directorio (`scripts/`, por ejemplo), es un `mv`.

## Punto de reanudación

Trabajo cerrado. Para regenerar el PDF tras editar textos: editar `CASOS` en
`docs/_artefactos/manual_imgs/build_manual_v2.py` y ejecutar
`python3 docs/_artefactos/manual_imgs/build_manual_v2.py`. Requiere `pymupdf` y `reportlab`
instalados en modo usuario (ver snapshot inicial).
