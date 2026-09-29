# Checklist de diseño hoja por hoja — PDF v2 vs referencia

> 28-sep-2026 · comparaciones lado a lado en `comparacion-p1..p8.png`
> (izquierda = referencia, derecha = generado v2). Guardarraíl pixel-diff
> (T5, 100 dpi, umbral 35%): p1 20% · **p2 42% FAIL** · p3 20% · p4 26% ·
> p7 26% · p8 31% (p5/p6 sólo ocular por contenido fotográfico).
> El top-10 del análisis de diseño de Fase 1 quedó aplicado COMPLETO
> (8 páginas, ranuras nuevas, cajas sin grilla negra, lado-a-lado, matrices,
> rojos/cian corporativos).

| Pág. | Hoja | Estado | Diferencias residuales observadas |
|---|---|---|---|
| 1 | Portada | ✅ | Distribución vertical algo más compacta hacia arriba que la referencia; el logo va sin la caja de borde fino; labels con espacio antes de ":" ("Numero Solicitud :"). Severidad BAJA-MEDIA. |
| 2 | Hoja 1 | ⚠ 42% | Todos los bloques presentes y en posición (mapa arriba-derecha, identificación, REF.OFERTAS con N°+Fecha, CBR ↔ Rentabilidad lado a lado, Comentarios con cabecera roja, cuadro ordenado, fachada + VALOR TASACIÓN + firma). El diff alto viene de densidad: la referencia comprime más filas por cm (4,8pt reales) y el generado respira más, desplazando verticalmente cada bloque. Un tasador nota una Hoja 1 "más aireada", no una distinta. Severidad MEDIA. |
| 3 | Hoja 2 | ✅ | Mapa full-width con marcadores + 3 fotos + fichas con Teléfono. Las fichas del generado van en tabla continua bajo las fotos (la referencia las pega a cada foto). Severidad BAJA. |
| 4 | Hoja 3 | ✅ | Completa: cajas PROPIEDAD ACOGIDA A / CUMPLE PLAN REGULADOR, "HABITACIONAL" rojo, matriz % uso de terrenos, banda azul Arteria, constructivas 2 columnas, matriz habitaciones 15 col con totales 16/4/4/249,91. |
| 5 | Hoja 4 | ✅ | Grilla 2×4 con captions grises (Ubicación, Planificación, Fachada, Sector, Living, Comedor, Cocina, Baño de visitas). Fotos pre-recortadas al aspecto de celda. |
| 6 | Hoja 5 | ✅ | Grilla 2×4 (Dormitorio Principal → Fachada posterior). |
| 7 | Anexo 1 | ✅ | 7 imágenes posicionadas (plano, esquema, cuadro superficie, emplazamiento, aérea, SII ×2). Diff 26%. |
| 8 | Anexo 2 | ✅ | 6 escaneados en columnas, incluida la escritura Fojas 3312 que el diagnóstico original no listaba. Diff 31%. |

**Pendiente residual único**: densidad vertical de la Hoja 1 (p2). Ajustarla más exigiría
bajar la tipografía por debajo de 4,8pt o recortar altos de fila a valores que python-docx
redondea — relación costo/beneficio a decisión de Sergio en el OK visual final.
