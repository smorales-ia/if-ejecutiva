"""Mapa celda de Impresion → texto con etiquetas Carbone (plantilla v8, réplica MET-6283).

Rutas del contexto: `lib/informe/tipos.ts` (InformeContexto) y la plantilla v7 (vocabulario vigente).
Una celda que no aparece aquí queda con el texto fijo que muestra el xlsm (rótulos).
`VACIAR` lista celdas con fórmula cuyo valor es del caso MET-6283 y no tiene fuente en el contexto:
quedan en blanco (ver la lista de pendientes en el informe de la tanda).
"""
from openpyxl.utils import column_index_from_string


def rc(ref):
    col = "".join(ch for ch in ref if ch.isalpha())
    return int(ref[len(col):]), column_index_from_string(col)


def N(path, dec):
    return f"{{d.{path}:formatN({dec})}}"


def N_sin0(path, dec):
    """Número que se deja en blanco si es 0 (la hoja tiene «mostrar ceros» apagado)."""
    return f"{{d.{path}:ifNE(0):showBegin}}{{d.{path}:formatN({dec})}}{{d.{path}:showEnd}}"


def T_sin0(path):
    return f"{{d.{path}:ifNE(0):showBegin}}{{d.{path}}}{{d.{path}:showEnd}}"


def N_guion(path, dec):
    """Formato contable: «-» si no hay dato (filas vacías de referencias)."""
    return f"{{d.{path}:ifEM:show(-):elseShow()}}{{d.{path}:formatN({dec})}}"


E = {}

# ---------------------------------------------------------------- Hoja 1 (filas 1–85)
E.update({
    "O5": "{d.meta.numeroSolicitudCliente}",
    "I7": "{d.partes.propietario}", "I8": "{d.partes.rut}",
    "I9": "{d.partes.propietario}", "I10": "{d.partes.rut}",
    "I11": "{d.partes.ejecutivo}", "I12": "{d.partes.tasador.nombre}",
    "I13": "{d.propiedad.objetivo}", "I14": "{d.propiedad.tipoPropiedad}",
    "I15": "{d.partes.fechaVisita:formatD(DD-MM-YYYY)}",
    "I16": "{d.sii.destinoSii}",
    "I19": "{d.meta.nOperacionCliente}",
    "AC7": "{d.propiedad.calle}",
    "AC8": "{d.cualitativa.detallePropiedad.casaNumero}",
    "AC9": "{d.propiedad.comuna}", "AC10": "{d.propiedad.region}",
    "AC11": "{d.propiedad.rolImpreso}", "AC12": "{d.propiedad.proyectoCondominio}",
    "AA13": "{d.propiedad.pisos}",
    "AL13": "{d.cualitativa.detallePropiedad.subterraneos}",
    "AH14": "{d.cualitativa.detallePropiedad.sitioLote}",
    "X15": "{d.cualitativa.detallePropiedad.zona}",
    "AE16": "{d.propiedad.estacionamientos}", "AE17": "{d.propiedad.estacionamientos}",
    "AE18": "{d.propiedad.bodegas}",
    "AE19": "{d.cualitativa.detallePropiedad.mansarda}",
    "AZ7": "{d.propiedad.dfl2}", "AZ8": "{d.propiedad.anioConstruccion}",
    "AZ9": "{d.propiedad.vidaUtil}",
    "AZ10": "{d.legales.permisoEdificacion}", "AZ11": "{d.legales.recepcionFinal}",
    "AZ12": "{d.cualitativa.detallePropiedad.ampliacion}",
    "AZ13": "{d.propiedad.estadoConservacion:upperCase}",
    "AZ14": "{d.cualitativa.detallePropiedad.selloSec}",
    "AZ15": "{d.cualitativa.detallePropiedad.afectoExpropiacion}",
    "AZ16": "{d.cualitativa.detallePropiedad.fuenteInformacion}",
    "AQ18": "{d.textosIA.textoExpropiacion}",
    "C22": "{d.textosIA.sintesisPropiedad}",
    "C28": "{d.textosIA.descripcionSector}",
})
# Referencias: ofertas (filas 31–35) y CBR (40–43)
for n, fila in enumerate(range(31, 36)):
    p = f"comparablesInforme.ofertas.filas[i={n}]"
    E.update({
        f"D{fila}": f"{{d.{p}.fecha}}", f"I{fila}": f"{{d.{p}.direccion}}", f"Y{fila}": f"{{d.{p}.anio}}",
        f"AA{fila}": f"{{d.{p}.telefono}}",
        f"AE{fila}": N(f"{p}.precioUf", 0), f"AI{fila}": N(f"{p}.supTerreno", 2), f"AN{fila}": N(f"{p}.supConstruida", 2),
        f"AS{fila}": N(f"{p}.oocc", 0), f"AV{fila}": N(f"{p}.ufM2Terreno", 2), f"AY{fila}": N(f"{p}.ufM2Construccion", 2),
    })
for n, fila in enumerate(range(40, 44)):
    p = f"comparablesInforme.cbr.filas[i={n}]"
    E.update({
        f"D{fila}": f"{{d.{p}.fecha}}", f"I{fila}": f"{{d.{p}.direccion}}", f"Y{fila}": f"{{d.{p}.anio}}",
        f"AA{fila}": f"{{d.{p}.fojaNumero}}",
        f"AE{fila}": N_guion(f"{p}.precioUf", 0), f"AI{fila}": N_guion(f"{p}.supTerreno", 2),
        f"AN{fila}": N_guion(f"{p}.supConstruida", 2), f"AS{fila}": N_guion(f"{p}.oocc", 0),
        f"AV{fila}": N(f"{p}.ufM2Terreno", 2), f"AY{fila}": N(f"{p}.ufM2Construccion", 2),
    })
for fila, grupo in ((36, "ofertas.promedio"), (44, "cbr.promedio"), (37, "tasacionFila"), (45, "tasacionFila")):
    p = f"comparablesInforme.{grupo}"
    E.update({
        f"AE{fila}": N(f"{p}.totalUf", 0), f"AI{fila}": N(f"{p}.supTerreno", 0), f"AN{fila}": N(f"{p}.supConstruida", 0),
        f"AS{fila}": N(f"{p}.oocc", 0), f"AV{fila}": N(f"{p}.ufM2Terreno", 2), f"AY{fila}": N(f"{p}.ufM2Construccion", 2),
    })
E["AY38"] = "{d.comparablesInforme.ofertas.tasacionVsPct:formatN(0)}%"
E["AY46"] = "{d.comparablesInforme.cbr.tasacionVsPct:formatN(0)}%"
# Rentabilidad
E.update({
    "BK39": "{d.propiedad.vidaUtil} años",
    "BK40": N("rentabilidad.arriendoBrutoMensualClp", 0),
    "BK41": N("rentabilidad.arriendoUfMes", 1),
    "BK42": N("rentabilidad.gastoAnualClp", 0),
    "BK43": "{d.rentabilidad.tasaCapRate:mul(100):formatN(1)}%",
    "BK44": "{d.rentabilidad.tiempoRentaAnios} años",
    "BK45": N("rentabilidad.ingresoLiquidoAnualClp", 0),
    "BK46": N("rentabilidad.rentaPerpetuaClp", 0),
})
# Cuadro de valoración: 8 renglones (54–61) = items[0..7]
for n, fila in enumerate(range(54, 62)):
    p = f"cuadro.items[i={n}]"
    E.update({
        f"C{fila}": f"{{d.{p}.tipoImpreso}}", f"G{fila}": f"{{d.{p}.numeroEnTipo}}", f"H{fila}": f"{{d.{p}.descripcion}}",
        f"P{fila}": f"{{d.{p}.rolSii}}", f"U{fila}": f"{{d.{p}.anio}}", f"W{fila}": f"{{d.{p}.codigoMaterial}}",
        f"Z{fila}": f"{{d.{p}.situacionMunicipal}}", f"AF{fila}": f"{{d.{p}.codigoEstado}}",
        f"AH{fila}": f"{{d.{p}.garantia}}", f"AK{fila}": f"{{d.{p}.origenSuperficie}}",
        f"AO{fila}": N(f"{p}.supM2", 2), f"AU{fila}": N_sin0(f"{p}.ufM2Aplicado", 2),
        f"AY{fila}": N(f"{p}.factorAplicado", 2), f"BB{fila}": N_sin0(f"{p}.ufM2", 2),
        f"BF{fila}": N_sin0(f"{p}.ufTotalItem", 2), f"BJ{fila}": N(f"{p}.valorSeguroUf", 2),
        f"BP{fila}": N_sin0(f"{p}.valorLiquidacionUf", 2),
    })
for fila, t in ((62, "edificacion"), (63, "obrasComplementarias"), (64, "terreno")):
    p = f"cuadro.totales.{t}"
    E.update({
        f"AH{fila}": f"{{d.{p}.cantidad}}", f"AO{fila}": N(f"{p}.supM2", 2),
        f"AU{fila}": N_sin0(f"{p}.ufM2Nuevo", 2), f"AY{fila}": N_sin0(f"{p}.factor", 2), f"BB{fila}": N_sin0(f"{p}.ufM2", 2),
        f"BF{fila}": f"{{d.{p}.ufTotal:ifGT(0):show(UF):elseShow()}}",
        f"BJ{fila}": N(f"{p}.seguroUf", 2), f"BP{fila}": N(f"{p}.liquidacionUf", 2),
    })
    # Filas de totales con formato 0,00 (sin separador de miles) en la planilla.
    E[f"BH{fila}"] = N(f"{p}.ufTotal", 2)
E["U62"] = "{d.cuadro.totales.edificacion.anio}"
for ref in ("BH63", "BH64", "BJ63", "BJ64", "BP63", "BP64"):
    E[ref] = E[ref].replace(":formatN(2)}", ":formatN(2):replace(.,)}")
E.update({
    "BH65": N("terminales.valorComercialUf", 2), "BJ65": N("terminales.seguroIncendioUf", 2),
    "BP65": N("terminales.valorLiquidacionUf", 2),
    # Valor tasación
    "AQ72": N("terminales.valorComercialUf", 2), "AZ72": N("terminales.valorComercialClp", 0),
    "BJ72": "{d.partes.fechaVisita:formatD(DD-MM-YYYY)}",
    "BG73": "{d.propiedad.velocidadVentaEstimada:upperCase}",
    "AR74": "$ {d.terminales.ufDia:formatN(2)}", "BP74": "$ {d.terminales.usdDia:formatN(2)}",
    "BA75": N("terminales.valorReposicionUsd", 0), "BH75": N("terminales.valorReposicionUf", 2), "BM75": N("terminales.valorReposicionClp", 0),
    "BA76": N("terminales.seguroIncendioUsd", 0), "BH76": N("terminales.seguroIncendioUf", 2), "BM76": N("terminales.seguroIncendioClp", 0),
    "BA77": N("terminales.avaluoFiscalUsd", 0), "BH77": N("terminales.avaluoFiscalUf", 2), "BM77": N("sii.avaluoTotal", 0),
    "BA78": N("terminales.valorRemateUsd", 0), "BH78": N("terminales.valorRemateUf", 2), "BM78": N("terminales.valorRemateClp", 0),
    "BA79": N("terminales.valorLiquidacionUsd", 0), "BH79": N("terminales.valorLiquidacionUf", 2), "BM79": N("terminales.valorLiquidacionClp", 0),
    # Firmas
    "I80": "{d.partes.tasador.nombre}", "I81": "{d.partes.visador.nombre}",
    "I82": "{d.partes.fechaVisita:formatD('DD [de] MMMM [de] YYYY')}",
    "I83": "{d.partes.fechaVisado:formatD('DD [de] MMMM [de] YYYY')}",
    "I84": "{d.clienteInforme.nombreRevisor}",
})
VACIAR = {"AH15"}   # Manzana: el original la deja en blanco (dato del tasador, no del SII) — decisión pendiente

# ---------------------------------------------------------------- encabezado de las hojas 2–7
for f in (87, 145, 220, 304, 388, 472):
    E.update({f"K{f}": "{d.partes.propietario}", f"K{f + 1}": "{d.partes.rut}",
              f"AX{f}": "{d.propiedad.direccion}", f"AX{f + 1}": "{d.meta.numeroSolicitudCliente}"})

# ---------------------------------------------------------------- Hoja 2: referencias 1–3
for n, col in enumerate(("H", "AE", "BB")):
    p = f"comparablesInforme.ofertas.filas[i={n}]"
    E.update({
        f"{col}137": f"{{d.{p}.direccion}}", f"{col}138": N(f"{p}.precioUf", 0), f"{col}139": N(f"{p}.anio", 0),
        f"{col}140": N(f"{p}.supConstruida", 2) + " m²", f"{col}141": N(f"{p}.supTerreno", 2) + " m²",
        f"{col}142": f"{{d.{p}.telefono}}",
    })

# ---------------------------------------------------------------- Hoja 3
q = "cualitativa"
E.update({
    "K148": f"{{d.{q}.normativa.supPredialMinimo}}", "K149": f"{{d.{q}.normativa.frentePredialMinimo}}",
    "K150": f"{{d.{q}.normativa.ocupacionSuelo}}", "K151": f"{{d.{q}.normativa.sistemaAgrupamiento}}",
    "AB148": f"{{d.{q}.normativa.coefConstructibilidad}}", "AB149": f"{{d.{q}.normativa.alturaEdificacion}}",
    "AB150": f"{{d.{q}.normativa.distanciaMedianero}}",
    "AW149": f"{{d.{q}.normativa.dfl2}}", "AW150": f"{{d.{q}.normativa.ley6071}}",
    "AW151": f"{{d.{q}.normativa.ley9135}}", "AW152": f"{{d.{q}.normativa.ley19537}}",
    "BL149": f"{{d.{q}.normativa.cumpleUsoActual}}", "BL150": f"{{d.{q}.normativa.cumpleTipoConstruccion}}",
    "BL151": f"{{d.{q}.normativa.usoMasProbable}}", "BL152": f"{{d.{q}.normativa.cambiosPlanRegulador}}",
    "J154": f"{{d.{q}.sector.demanda}}", "W154": f"{{d.{q}.sector.tendencia}}", "AJ154": f"{{d.{q}.sector.densidad}}",
    "AU154": f"{{d.{q}.sector.mercado}}", "BM154": f"{{d.{q}.sector.abc1}}",
    "J156": f"{{d.{q}.sector.destinoBarrio}}", "J157": f"{{d.{q}.sector.tipoZona}}", "J158": f"{{d.{q}.sector.calzada}}",
    "J159": f"{{d.{q}.sector.acera}}", "J160": f"{{d.{q}.sector.solera}}",
    "AD156": f"{{d.{q}.sector.antejardin}}", "AD157": f"{{d.{q}.sector.redElectrica}}",
    "AD158": f"{{d.{q}.sector.aguaPotable}}", "AD159": f"{{d.{q}.sector.gas}}", "AD160": f"{{d.{q}.sector.proyUsoTerrenos}}",
    "AV157": T_sin0(f"{q}.sector.pctCasas"), "AV158": T_sin0(f"{q}.sector.pctDeptos"),
    "AV159": T_sin0(f"{q}.sector.pctCondominios"), "AV160": T_sin0(f"{q}.sector.pctEquipComercial"),
    "BJ157": T_sin0(f"{q}.sector.pctIndustrial"), "BJ158": T_sin0(f"{q}.sector.pctComercial"),
    "BJ159": T_sin0(f"{q}.sector.pctSitiosEriazos"), "BJ160": T_sin0(f"{q}.sector.pctOtros"),
    "AH165": f"{{d.{q}.sector.arteriaPrincipal}}",
    "I167": N("propiedad.supTerrenoM2", 2) + " m²",
    "I168": f"{{d.{q}.geometriaTerreno.forma}}", "I169": f"{{d.{q}.geometriaTerreno.pendiente}}",
    "I170": f"{{d.{q}.geometriaTerreno.orientacion}}",
    "AV167": f"{{d.{q}.geometriaTerreno.frente}}", "AV168": f"{{d.{q}.geometriaTerreno.contrafrente}}",
    "AV169": f"{{d.{q}.geometriaTerreno.deslindeNorte}}", "AV170": f"{{d.{q}.geometriaTerreno.deslindeSur}}",
    "L172": f"{{d.{q}.emplazamiento.tipoAgrupamiento}}", "L173": f"{{d.{q}.emplazamiento.disenoArquitectonico}}",
    "L174": f"{{d.{q}.emplazamiento.utilidadFuncional}}", "L175": f"{{d.{q}.emplazamiento.tipoAdosamiento}}",
    "L176": f"{{d.{q}.emplazamiento.calidadConstructiva}}",
    "AY172": f"{{d.{q}.emplazamiento.estadoConservacion}}", "AY173": f"{{d.{q}.emplazamiento.predioVista}}",
    "AY174": f"{{d.{q}.emplazamiento.orientacionConstruccion}}", "AY175": f"{{d.{q}.emplazamiento.relacionTerrenoConstruccion}}",
    "AY176": f"{{d.{q}.emplazamiento.iluminacionNatural}}",
})
VACIAR |= {"AZ169", "AZ170"}   # relación frente/fondo (0,599): sin fuente en el contexto
izq = ["estructura", "divisiones", "entrepisos", "cubierta", "revestimientoExterior", "cierros", "obrasComplementarias", "construccionAnexo"]
der = ["aireAcondicionado", "calefaccion", "closet", "mueblesCocina", "sanitarios", "griferia", "puertaPrincipal", "ventanas"]
for n, fila in enumerate(range(180, 188)):
    a, b = izq[n], der[n]
    E.update({
        f"J{fila}": f"{{d.{q}.constructivas.{a}}}", f"Z{fila}": f"{{d.{q}.constructivas.{a}Calidad}}",
        f"AG{fila}": f"{{d.{q}.constructivas.{a}Estado}}",
        f"AV{fila}": f"{{d.{q}.constructivas.{b}}}", f"BI{fila}": f"{{d.{q}.constructivas.{b}Calidad}}",
        f"BP{fila}": f"{{d.{q}.constructivas.{b}Estado}}",
    })
for n, fila in enumerate(range(190, 195)):
    p = f"recintos.terminacionesPorRecinto[i={n}]"
    E.update({f"I{fila}": f"{{d.{p}.categoria}}", f"X{fila}": f"{{d.{p}.descripcion}}", f"AJ{fila}": f"{{d.{p}.revMuros}}",
              f"AT{fila}": f"{{d.{p}.cielo}}", f"BF{fila}": f"{{d.{p}.iluminacion}}", f"BM{fila}": f"{{d.{p}.calidad}}"})
E.update({
    "I196": f"{{d.{q}.servicios.alcantarillado}}", "I197": f"{{d.{q}.servicios.aguaPotable}}",
    "I198": f"{{d.{q}.servicios.electricidad}}", "AU196": f"{{d.{q}.servicios.gas}}", "AU197": f"{{d.{q}.servicios.otros}}",
})
# Habitaciones por nivel (filas 201–204) · columnas de la planilla → tipoRecinto del contexto
HAB = [("L", "Comedor"), ("O", "Living"), ("R", "Sala"), ("V", "Hall"), ("Y", "Suite"), ("AC", "D.Simple"),
       ("AG", "D.Servicio"), ("AK", "Cocina"), ("AO", "Escritorio"), ("AT", "Bano"), ("AW", "MedioBano"),
       ("BA", "BanoServicio"), ("BE", "Lavadero"), ("BJ", "Otro")]
for fila, nivel in ((201, "Subterraneo"), (202, "Piso1"), (203, "Piso2"), (204, "Piso3")):
    for col, tipo in HAB:
        E[f"{col}{fila}"] = T_sin0(f"recintos.habitacionesPorNivel[nivel='{nivel}',tipoRecinto='{tipo}'].cantidad")
E["BO202"] = N("propiedad.supPrimerPisoM2", 2)
E.update({
    "O205": "{d.recintos.totalRecintos}", "AB205": "{d.propiedad.dormitorios}", "AJ205": "{d.propiedad.banos}",
    "AS205": "{d.recintos.habitacionesPorNivel[nivel='Piso1',tipoRecinto='D.Servicio'].cantidad}",
    "BB205": "{d.recintos.habitacionesPorNivel[nivel='Piso1',tipoRecinto='BanoServicio'].cantidad}",
    "BN205": N("propiedad.supConstruccionM2", 2) + " m²",
})
com = [("L", ["mueblesCocina", "comedorDiario", "patioServicio", "estacionamiento"]),
       ("AB", ["piscina", "gimnasio", "sauna", "bodega"]),
       ("AW", ["jardin", "calefaccion", "alarma", "protecciones"]),
       ("BN", ["aspiracion", "climatizacion", "purificador", "corrientesDebiles"])]
for col, campos in com:
    for n, campo in enumerate(campos):
        E[f"{col}{208 + n}"] = f"{{d.{q}.comodidades.{campo}}}"

# ---------------------------------------------------------------- Hojas 4–5: leyendas de las fotos
FOTOS = [("C242", 0), ("AN242", 1), ("C262", 2), ("AN262", 3), ("C282", 4), ("AN282", 5), ("C302", 6), ("AN302", 7),
         ("C326", 8), ("AN326", 9), ("C346", 10), ("AN346", 11), ("C366", 12), ("AN366", 13), ("C386", 14), ("AN386", 15)]
for ref, i in FOTOS:
    E[ref] = f"{{d.fotos.fotos[i={i}].categoria}}"

ETIQUETAS = {rc(k): v for k, v in E.items()}
ETIQUETAS.update({rc(k): "" for k in VACIAR})

# ---------------------------------------------------------------- imágenes: (nombre COM, celda) → (ruta, ajuste)
IMAGENES = {
    ("Picture 73", "BH7"): ("imagenes.mapaUbicacion", "contain"),
    ("Picture 74", "G66"): ("imagenes.fachada", "fill"),
    ("FirmaHectorImp", "AA80"): ("imagenes.firma", "contain"),
    ("Picture 73", "C92"): ("imagenes.refMapa", "fill"),
    ("Picture 95", "E118"): ("imagenes.ref1", "fill"),
    ("Picture 96", "AC118"): ("imagenes.ref2", "fill"),
    ("Picture 97", "AZ118"): ("imagenes.ref3", "fill"),
    ("Picture 124", "C395"): ("imagenes.anexo1Plano", "fill"),
    ("Picture 123", "AV394"): ("imagenes.anexo1Emplazamiento", "fill"),
    ("Picture 126", "C432"): ("imagenes.anexo1Esquema", "fill"),
    ("Picture 122", "AB430"): ("imagenes.anexo1CuadroSup", "fill"),
    ("Picture 121", "AV433"): ("imagenes.anexo1Aerea", "fill"),
    ("Picture 125", "C453"): ("imagenes.anexo1MapaSii", "fill"),
    ("Picture 127", "AV453"): ("imagenes.anexo1InfoSii", "fill"),
    ("Picture 143", "C480"): ("imagenes.anexo2RolAvaluo", "fill"),
    ("Picture 140", "AL480"): ("imagenes.anexo2Permiso", "fill"),
    ("Picture 141", "C499"): ("imagenes.anexo2Recepcion", "fill"),
    ("Picture 139", "AL510"): ("imagenes.anexo2Escritura", "fill"),
    ("Picture 142", "AM534"): ("imagenes.anexo2NoExpropiacion", "fill"),
    ("Picture 144", "C540"): ("imagenes.anexo2Tgr", "fill"),
}
for (nombre, celda), i in [(("Picture 106", "C223"), 0), (("Picture 98", "AU223"), 1), (("Picture 103", "C243"), 2),
                           (("Picture 105", "AN242"), 3), (("Picture 99", "C263"), 4), (("Picture 100", "AN263"), 5),
                           (("Picture 101", "C283"), 6), (("Picture 102", "AN283"), 7), (("Picture 111", "C307"), 8),
                           (("Picture 110", "AN307"), 9), (("Picture 108", "C327"), 10), (("Picture 109", "AN327"), 11),
                           (("Picture 107", "C347"), 12), (("Picture 113", "AN347"), 13), (("Picture 112", "C367"), 14),
                           (("Picture 114", "AN367"), 15)]:
    IMAGENES[(nombre, celda)] = (f"fotos.fotos[i={i}].url", "fill")

# Imágenes del xlsm que quedan fuera (duplicados ocultos bajo la visible, o del caso MET-6283).
EXCLUIR_EXTRA = {"FirmaGloriaImp", "Picture 21", "Picture 22", "Picture 24", "Picture 25", "Picture 26", "Picture 27",
                 "Picture 28", "Picture 29", "Picture 30", "Picture 31", "Picture 32", "Picture 39", "Picture 41",
                 "Picture 42", "Picture 43", "Picture 44", "Picture 45", "Picture 46"}

# Ajustes puntuales de celdas fijas. «OO.CC.» lleva 12 espacios delante y está centrado en una celda
# angosta: Excel lo dibuja desbordando sobre las vecinas, con la palabra empezando 1,25 pt después del
# margen de la celda (medido en el PDF original, x = 346,2 pt).
SOBRE = {rc("AS30"): {"texto": "OO.CC.", "h": "left", "indent_pt": 1.25},
         rc("AS39"): {"texto": "OO.CC.", "h": "left", "indent_pt": 1.25}}
