#!/usr/bin/env python3
"""Payload de prueba v2 (T-PDF-IDENTICO): base payload-carbone-0067.json + contrato v2
+ data-URIs de assets_met6283. Guarda docs/_evidencia/T-PDF-IDENTICO-20260927/payload-prueba-v2.json"""
import base64, json, sys
from pathlib import Path
import pymupdf

REPO = Path("/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva")
ASSETS = REPO / "docs/_artefactos/carbone/assets_met6283"
OUT = REPO / "docs/_evidencia/T-PDF-IDENTICO-20260927/payload-prueba-v2.json"

# Aspecto objetivo por asset (medido en el PDF de referencia). Carbone escala al
# ancho del placeholder preservando el aspecto DE ORIGEN, así que el recorte al
# aspecto de la ranura es obligatorio para que el alto no desborde la página.
# anchor: "top" conserva el borde superior (escaneados), "center" el centro.
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


def datauri(name, quality=80):
    p = ASSETS / name
    crop = CROPS.get(name)
    if crop is None and p.suffix.lower() != ".png":
        return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode()
    doc = pymupdf.open(str(p))
    pg = doc[0]
    r = pg.rect
    if crop:
        objetivo, anchor = crop
        actual = r.width / r.height
        if abs(actual - objetivo) / objetivo > 0.02:
            if actual > objetivo:      # demasiado ancho → recortar lados
                w = r.height * objetivo
                x0 = r.x0 + (r.width - w) / 2
                clip = pymupdf.Rect(x0, r.y0, x0 + w, r.y1)
            else:                       # demasiado alto → recortar abajo (o centro)
                h = r.width / objetivo
                y0 = r.y0 if anchor == "top" else r.y0 + (r.height - h) / 2
                clip = pymupdf.Rect(r.x0, y0, r.x1, y0 + h)
        else:
            clip = r
    else:
        clip = r
    zoom = min(2.0, 1300 / max(clip.width, clip.height))
    pix = pg.get_pixmap(clip=clip, matrix=pymupdf.Matrix(zoom, zoom))
    if pix.alpha:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    jpg = pix.tobytes("jpg", jpg_quality=quality)
    return "data:image/jpeg;base64," + base64.b64encode(jpg).decode()

d = json.load(open(REPO / "docs/_evidencia/T-PDF-IMPRENTA-20260927/payload-carbone-0067.json"))

# ---- datos exactos XLSM (oráculo A3)
d["meta"]["numeroSolicitudCliente"] = "METLIFE -6283"
d["meta"]["nOperacionCliente"] = 900159638
d["propiedad"].update({
    "direccion": "LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO",
    "anioConstruccion": 2024, "vidaUtil": 70, "estadoConservacion": "Bueno",
})
d["partes"]["tasador"]["nombre"] = "Maria Eugenia Soto"
d["partes"]["visador"] = {"nombre": "Héctor Martínez C."}
d["partes"]["ejecutivo"] = "MONICA REYES PINTO"
d["partes"]["fechaVisita"] = "2026-04-13"
d["partes"]["fechaVisado"] = "2026-04-15"
d["legales"]["permisoEdificacion"] = "N°319  09/09/2020"
d["legales"]["recepcionFinal"] = "N°210  18/07/2024"
d["sii"]["rolSii"] = "N°882-40"
d["terminales"].update({
    "ufDia": 39894.61, "usdDia": 890.33,
    "valorReposicionUsd": 414344, "seguroIncendioUsd": 399115,
    "avaluoFiscalUsd": 381667, "valorRemateUsd": 586180, "valorLiquidacionUsd": 743998,
})
d["rentabilidad"]["arriendoUfMes"] = 82.7
d["rentabilidad"]["tiempoRentaAnios"] = 65

# ---- comparables v2 (bloques ofertas/cbr con aritmética XLSM)
of_dat = [
    ("Las Brisas de Chicureo - Los Boldos", 20000, 5051, 239, 750, 2.20, 34.049372, 2015),
    ("Las Brisas de Chicureo - Sta Emilia", 24900, 5077, 239, 750, 3.10, 35.193724, 2016),
    ("Las Brisas de Chicureo - Los Maitenes", 19500, 5001, 252, 500, 2.00, 35.706349, 2018),
    ("Las Brisas de Chicureo - El Alba", 23900, 5012, 258, 750, 3.00, 31.449612, 2017),
    ("Las Brisas de Chicureo - Los Nogales", 18900, 5000, 264, 500, 2.00, 31.818182, 2019),
]
cbr_dat = [
    ("Las Brisas de Chicureo - Pie Andino", 20500, 5002, 250, 700, 2.70, 25.178400, 2020),
    ("Las Brisas de Chicureo - Sta Filomena", 18000, 5013, 360, 700, 1.80, 22.990556, 2021),
]
viejas = d["comparablesInforme"].get("filas", [])
def fila(i, tipo, t):
    dire, uf, st, sc, oocc, uft, ufc, anio = t
    base = viejas[i]["direccion"] if i < len(viejas) else dire
    return {"fecha": "abr-26", "tipoReferencia": tipo, "direccion": base or dire,
            "comuna": "Colina", "anio": anio, "telefono": "", "fojaNumero": "",
            "precioUf": uf, "supTerreno": st, "supConstruida": sc, "oocc": oocc,
            "ufM2Terreno": uft, "ufM2Construccion": ufc, "comentarios": ""}
d["comparablesInforme"] = {
    "ofertas": {
        "filas": [fila(i, "Oferta", t) for i, t in enumerate(of_dat)],
        "promedio": {"totalUf": 21440, "supTerreno": 5028.2, "supConstruida": 250.4,
                     "oocc": 650, "ufM2Terreno": 2.46, "ufM2Construccion": 33.643448},
        "tasacionVsPct": -2.98260,
    },
    "cbr": {
        "filas": [fila(5 + i, "CBR", t) for i, t in enumerate(cbr_dat)],
        "promedio": {"totalUf": 19250, "supTerreno": 5007.5, "supConstruida": 305,
                     "oocc": 700, "ufM2Terreno": 2.25, "ufM2Construccion": 24.084478},
        "tasacionVsPct": 35.52297,
    },
    "tasacionFila": {"totalUf": 20125.8624, "supTerreno": 5024.86, "supConstruida": 249.91,
                     "oocc": 750, "ufM2Terreno": 2.2327, "ufM2Construccion": 32.64},
}

# ---- cuadro ordenado como la referencia
d["cuadro"]["items"] = [
    {"tipoItem": "Terreno", "descripcion": "Terreno", "situacionMunicipal": "Regularizado",
     "aportaAGarantia": True, "supM2": 1402.35, "ufM2Aplicado": 8, "factorAplicado": 1,
     "ufTotalItem": 11218.80},
    {"tipoItem": "Terreno", "descripcion": "Servidumbre", "situacionMunicipal": "Regularizado",
     "aportaAGarantia": False, "supM2": 3622.51, "ufM2Aplicado": 0, "factorAplicado": 1,
     "ufTotalItem": 0},
    {"tipoItem": "Edificacion", "descripcion": "Piso 1", "situacionMunicipal": "Regularizado",
     "aportaAGarantia": True, "supM2": 249.91, "ufM2Aplicado": 34.0, "factorAplicado": 0.96,
     "ufTotalItem": 8157.0624},
    {"tipoItem": "Piscina", "descripcion": "Piscina", "situacionMunicipal": "Regularizado",
     "aportaAGarantia": False, "supM2": 1, "ufM2Aplicado": 350, "factorAplicado": 1,
     "ufTotalItem": 350},
    {"tipoItem": "OO.CC.", "descripcion": "Quincho", "situacionMunicipal": "Regularizado",
     "aportaAGarantia": False, "supM2": 1, "ufM2Aplicado": 250, "factorAplicado": 1,
     "ufTotalItem": 250},
    {"tipoItem": "OO.CC.", "descripcion": "Cierros, pavimento exterior",
     "situacionMunicipal": "Regularizado", "aportaAGarantia": False, "supM2": 1,
     "ufM2Aplicado": 150, "factorAplicado": 1, "ufTotalItem": 150},
]

# ---- cualitativa (contrato de claves v2 — valores oráculo A3)
d["cualitativa"] = {
    "normativa": {"supPredialMinimo": "PRMS", "frentePredialMinimo": "PRMS",
                  "ocupacionSuelo": "PRMS", "coefConstructibilidad": "PRMS",
                  "alturaEdificacion": "OGUC", "distanciaMedianero": "OGUC",
                  "sistemaAgrupamiento": "OGUC", "antejardin": "SI",
                  "dfl2": "NO", "ley6071": "NO", "ley9135": "NO", "ley19537": "SI",
                  "cumpleUsoActual": "SI", "cumpleTipoConstruccion": "SI",
                  "usoMasProbable": "HABITACIONAL", "cambiosPlanRegulador": "NO CONTEMPLA"},
    "sector": {"demanda": "Medio", "tendencia": "Estable", "densidad": "Baja",
               "mercado": "Estrato Medio Alto", "abc1": "SI/No Homogéneo",
               "destinoBarrio": "Habitacional", "tipoZona": "Rural", "calzada": "Asfalto",
               "acera": "Tierra", "solera": "Solerilla", "antejardin": "Sí",
               "redElectrica": "Red Subterránea", "aguaPotable": "Matriz Pública",
               "gas": "Red Pública", "proyUsoTerrenos": "Estacionario",
               "pctCasas": 10, "pctDeptos": 0, "pctCondominios": 45, "pctEquipComercial": 1,
               "pctIndustrial": 0, "pctComercial": 1, "pctSitiosEriazos": 35, "pctOtros": 8,
               "arteriaPrincipal": "Caletera Oriente Gral San Martín"},
    "geometriaTerreno": {"forma": "REGULAR", "pendiente": "PLANO", "orientacion": "NORTE",
                         "frente": "29,95", "contrafrente": "29,95",
                         "deslindeNorte": "50", "deslindeSur": "50"},
    "emplazamiento": {"tipoAgrupamiento": "CONDOMINIO", "disenoArquitectonico": "TIPICO",
                      "utilidadFuncional": "ADECUADA", "tipoAdosamiento": "AISLADA",
                      "calidadConstructiva": "BUENA", "estadoConservacion": "BUENO",
                      "predioVista": "BUENO", "orientacionConstruccion": "NORTE",
                      "relacionTerrenoConstruccion": "ADECUADO",
                      "iluminacionNatural": "ADECUADA"},
    "constructivas": {"estructura": "ALBAÑILERÍA LADRILLO", "estructuraCalidad": "BUENA",
                      "estructuraEstado": "BUENO", "divisiones": "ACERO VOLCANITA",
                      "divisionesCalidad": "BUENA", "divisionesEstado": "BUENO",
                      "entrepisos": "", "entrepisosCalidad": "", "entrepisosEstado": "",
                      "cubierta": "PLANCHA METALICA", "cubiertaCalidad": "BUENA",
                      "cubiertaEstado": "BUENO", "revestimientoExterior": "ESTUCO Y PINTURA",
                      "revestimientoExteriorCalidad": "BUENA",
                      "revestimientoExteriorEstado": "BUENO", "cierros": "REJA METALICA",
                      "cierrosCalidad": "BUENA", "cierrosEstado": "BUENO",
                      "obrasComplementarias": "TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA",
                      "obrasComplementariasCalidad": "BUENA",
                      "obrasComplementariasEstado": "BUENO", "construccionAnexo": "0",
                      "construccionAnexoCalidad": "", "construccionAnexoEstado": "",
                      "aireAcondicionado": "RADIADOR MURAL", "calefaccion": "NO PRESENTA",
                      "closet": "MELAMINA", "mueblesCocina": "MELAMINA Y CUARZO",
                      "sanitarios": "LOSA NACIONAL CORRIENTE", "griferia": "NACIONAL CORRIENTE",
                      "puertaPrincipal": "MADERA", "ventanas": "PVC TERMOPANEL"},
    "servicios": {"alcantarillado": "Colector", "aguaPotable": "Matriz Pública",
                  "electricidad": "Red Subterránea", "gas": "Red Pública", "otros": ""},
    "comodidades": {"mueblesCocina": "SI", "comedorDiario": "SI", "patioServicio": "SI",
                    "estacionamiento": "SI", "piscina": "SI", "gimnasio": "NO", "sauna": "NO",
                    "bodega": "SI", "jardin": "SI", "calefaccion": "NO", "alarma": "NO",
                    "protecciones": "NO", "aspiracion": "NO", "climatizacion": "NO",
                    "purificador": "NO", "corrientesDebiles": "SI"},
    "detallePropiedad": {"casaNumero": "N°2100", "sitioLote": "A 40", "zona": "IPB(Colina)",
                         "subterraneos": "NO", "mansarda": "NO", "selloSec": "SI",
                         "afectoExpropiacion": "NO", "fuenteInformacion": "DOM, Plano Catastro",
                         "ampliacion": "No"},
}
d["textosIA"]["textoExpropiacion"] = ("De acuerdo al DOM, Plano Catastro de la Municipalidad "
                                      "de Colina la propiedad NO cuenta con expropiación.")

# ---- recintos: matriz completa Piso1 + terminaciones con columnas nuevas
d["recintos"]["habitacionesPorNivel"] = [
    {"nivel": "Piso1", "tipoRecinto": t, "cantidad": c} for t, c in
    [("Comedor", 1), ("Living", 1), ("Sala", 1), ("Hall", 1), ("Suite", 1), ("D.Simple", 3),
     ("D.Servicio", 1), ("Cocina", 1), ("Escritorio", 0), ("Bano", 3), ("MedioBano", 1),
     ("BanoServicio", 1), ("Lavadero", 1), ("Otro", 0)]
]
d["recintos"]["totalRecintos"] = 16
d["recintos"]["terminacionesPorRecinto"] = [
    {"nombre": "Estar - Dormitorios - Circulación", "categoria": "ENMADERADO",
     "descripcion": "TIPO PISO DE INGENIERÍA", "revMuros": "ESMALTE",
     "cielo": "ENLUCIDO / PINTURA", "iluminacion": "BUENA", "calidad": "BUENO"},
    {"nombre": "Cocina - Baños - Loggia", "categoria": "CERAMICO",
     "descripcion": "TIPO PORCELANATO", "revMuros": "CERAMICO",
     "cielo": "ENLUCIDO / PINTURA", "iluminacion": "BUENA", "calidad": "BUENO"},
]

# ---- fotos (16, orden de las grillas) + imagenes nombradas
grid = [
    ("Ubicación", "h4_01_ubicacion.png"), ("Planificación", "anexo1_plano.jpg"),
    ("Fachada", "h4_03_fachada.jpg"), ("Sector", "h4_04_sector.jpg"),
    ("Living", "h4_05_living.jpg"), ("Comedor", "h4_06_comedor.jpg"),
    ("Cocina", "h4_07_cocina.jpg"), ("Baño de visitas", "h4_08_bano_visitas.jpg"),
    ("Dormitorio Principal", "h5_01_dormitorio_principal.jpg"),
    ("Baño Principal", "h5_02_bano_principal.jpg"), ("Dormitorio", "h5_03_dormitorio_a.jpg"),
    ("Dormitorio", "h5_04_dormitorio_b.jpg"), ("Sala de estar", "h5_05_sala_estar.jpg"),
    ("Piscina", "h5_06_piscina.jpg"), ("Terraza + Quincho", "h5_07_terraza_quincho.jpg"),
    ("Fachada posterior - Patio trasero", "h5_08_fachada_posterior_patio.jpg"),
]
d["fotos"] = {"total": 16, "porCategoria": {},
              "fotos": [{"id": f"f{i}", "nombre": a, "categoria": c, "url": datauri(a)}
                        for i, (c, a) in enumerate(grid)]}
d["imagenes"] = {
    "mapaUbicacion": datauri("h1_mapa_ubicacion.jpg"),
    "fachada": datauri("h1_fachada.jpg"),
    "firma": datauri("firma.jpg"),
    "refMapa": datauri("h2_mapa_referencias.png"),
    "ref1": datauri("h2_ref1.jpg"), "ref2": datauri("h2_ref2.jpg"),
    "ref3": datauri("h2_ref3.jpg"),
    "anexo1Plano": datauri("anexo1_plano.jpg"),
    "anexo1Emplazamiento": datauri("anexo1_emplazamiento.jpg"),
    "anexo1Esquema": datauri("anexo1_esquema_superficies.jpg"),
    "anexo1CuadroSup": datauri("anexo1_cuadro_superficie.jpg"),
    "anexo1Aerea": datauri("anexo1_aerea.jpg"),
    "anexo1MapaSii": datauri("anexo1_mapa_sii.jpg"),
    "anexo1InfoSii": datauri("anexo1_info_sii.jpg"),
    "anexo2RolAvaluo": datauri("anexo2_rol_avaluo.jpg"),
    "anexo2Permiso": datauri("anexo2_permiso_edificacion.jpg"),
    "anexo2Escritura": datauri("anexo2_escritura_fojas.jpg"),
    "anexo2NoExpropiacion": datauri("anexo2_no_expropiacion.jpg"),
    "anexo2Recepcion": datauri("anexo2_recepcion_final.jpg"),
    "anexo2Tgr": datauri("anexo2_tgr_deuda.jpg"),
}

OUT.write_text(json.dumps(d, ensure_ascii=False))
print(f"payload: {OUT} ({OUT.stat().st_size/1e6:.1f} MB)")
