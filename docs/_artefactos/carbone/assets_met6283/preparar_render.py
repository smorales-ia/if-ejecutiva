#!/usr/bin/env python3
"""Prepara los assets para el render Carbone → subdirectorio `render/`.

Carbone v4 escala la imagen al ANCHO del placeholder preservando el aspecto
DE ORIGEN (ignora el alto del placeholder), así que cada asset debe llegar
pre-recortado al aspecto de su ranura o la página desborda. El dict CROPS
replica exactamente el de `build-payload-prueba-v2.py` (render de prueba
validado el 28-sep-2026). Además normaliza todo a JPEG q80 con lado mayor
<= 1300 px para que el payload total quede en pocos MB.

Uso: python3 docs/_artefactos/carbone/assets_met6283/preparar_render.py
Salida: render/<stem>.jpg por cada asset consumido por lib/informe/imagenes.ts
Los originales no se tocan.
"""
import base64
from pathlib import Path

import pymupdf

ASSETS = Path(__file__).resolve().parent
OUT = ASSETS / "render"

# (aspecto_objetivo, anchor) — idéntico a build-payload-prueba-v2.py
CROPS = {
    "h1_fachada.jpg": (1.99, "center"),
    "h4_01_ubicacion.png": (1.545, "center"),
    "h4_03_fachada.jpg": (1.545, "center"), "h4_04_sector.jpg": (1.545, "center"),
    "h4_05_living.jpg": (1.545, "center"), "h4_06_comedor.jpg": (1.545, "center"),
    "h4_07_cocina.jpg": (1.545, "center"), "h4_08_bano_visitas.jpg": (1.545, "center"),
    "h5_01_dormitorio_principal.jpg": (1.545, "center"),
    "h5_02_bano_principal.jpg": (1.545, "center"),
    "h5_03_dormitorio_a.jpg": (1.545, "center"), "h5_04_dormitorio_b.jpg": (1.545, "center"),
    "h5_05_sala_estar.jpg": (1.545, "center"), "h5_06_piscina.jpg": (1.545, "center"),
    "h5_07_terraza_quincho.jpg": (1.545, "center"),
    "h5_08_fachada_posterior_patio.jpg": (1.545, "center"),
    "h2_ref1.jpg": (1.22, "center"), "h2_ref2.jpg": (1.22, "center"),
    "h2_ref3.jpg": (1.15, "center"),
    "anexo1_mapa_sii.jpg": (2.17, "center"), "anexo1_info_sii.jpg": (1.44, "top"),
    "anexo2_rol_avaluo.jpg": (1.77, "top"), "anexo2_permiso_edificacion.jpg": (0.71, "top"),
    "anexo2_tgr_deuda.jpg": (2.15, "top"), "anexo2_escritura_fojas.jpg": (1.01, "top"),
    "anexo2_no_expropiacion.jpg": (1.35, "top"), "anexo2_recepcion_final.jpg": (1.52, "top"),
}

# Assets sin recorte (aspecto ya correcto) que igual se normalizan a JPEG/1300px
SIN_CROP = [
    "h1_mapa_ubicacion.jpg", "firma.jpg", "h2_mapa_referencias.jpg",
    "anexo1_plano.jpg", "anexo1_esquema_superficies.jpg",
    "anexo1_cuadro_superficie.jpg", "anexo1_emplazamiento.jpg", "anexo1_aerea.jpg",
]


def preparar(nombre: str, quality: int = 80) -> Path:
    src = ASSETS / nombre
    doc = pymupdf.open(str(src))
    pg = doc[0]
    r = pg.rect
    crop = CROPS.get(nombre)
    clip = r
    if crop:
        objetivo, anchor = crop
        actual = r.width / r.height
        if abs(actual - objetivo) / objetivo > 0.02:
            if actual > objetivo:  # demasiado ancho → recortar lados
                w = r.height * objetivo
                x0 = r.x0 + (r.width - w) / 2
                clip = pymupdf.Rect(x0, r.y0, x0 + w, r.y1)
            else:  # demasiado alto → conservar borde superior o centro
                h = r.width / objetivo
                y0 = r.y0 if anchor == "top" else r.y0 + (r.height - h) / 2
                clip = pymupdf.Rect(r.x0, y0, r.x1, y0 + h)
    zoom = min(2.0, 1300 / max(clip.width, clip.height))
    pix = pg.get_pixmap(clip=clip, matrix=pymupdf.Matrix(zoom, zoom))
    if pix.alpha:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    dest = OUT / (Path(nombre).stem + ".jpg")
    dest.write_bytes(pix.tobytes("jpg", jpg_quality=quality))
    return dest


def main() -> None:
    OUT.mkdir(exist_ok=True)
    total = 0
    for nombre in list(CROPS) + SIN_CROP:
        if not (ASSETS / nombre).exists():
            print(f"FALTA {nombre}")
            continue
        dest = preparar(nombre)
        kb = dest.stat().st_size / 1024
        total += kb
        print(f"{dest.name:42s} {kb:7.1f} KB")
    print(f"total render/: {total / 1024:.1f} MB")


if __name__ == "__main__":
    main()
