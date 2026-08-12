# -*- coding: utf-8 -*-
"""
Genera docs/_md/Manual_Usuario_Prueba1_v2.pdf — guía de pruebas premium de la
Consola Ejecutiva (IF-02 · CU-002).

Stack: reportlab (composición) + imágenes ya extraídas con PyMuPDF.
Dos pasadas: la primera resuelve el número de página de cada ancla para que el
índice pueda mostrarlos; la segunda escribe el archivo final.
"""

import io
import os
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, Image, KeepTogether, NextPageTemplate,
    PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

# ─────────────────────────────────────────────────────────────────────────────
# Rutas
# ─────────────────────────────────────────────────────────────────────────────
REPO = "/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva"
IMG_DIR = os.path.join(REPO, "docs/_artefactos/manual_imgs")
OUT = os.path.join(REPO, "docs/_md/Manual_Usuario_Prueba1_v2.pdf")

FECHA = "12 de agosto de 2026"
VERSION = "v2.0"

# ─────────────────────────────────────────────────────────────────────────────
# Tokens VProperty
# ─────────────────────────────────────────────────────────────────────────────
BRAND = colors.HexColor("#075899")
BRAND_HOVER = colors.HexColor("#0064B4")
BRAND_DEEP = colors.HexColor("#053F6E")
ACCENT = colors.HexColor("#F5A213")
BG = colors.HexColor("#F5F7FA")
BORDER = colors.HexColor("#DCE3EA")
TEXT = colors.HexColor("#1F2933")
MUTED = colors.HexColor("#5B6B7B")
GREEN = colors.HexColor("#15803D")
AMBER = colors.HexColor("#D97706")
RED = colors.HexColor("#B91C1C")

TINT_BRAND = colors.HexColor("#EAF2F9")
TINT_MUTED = colors.HexColor("#F2F5F8")
TINT_ACCENT = colors.HexColor("#FEF5E6")
TINT_GREEN = colors.HexColor("#EDF6F0")
TINT_RED = colors.HexColor("#FBEEEE")

# ─────────────────────────────────────────────────────────────────────────────
# Tipografía
# ─────────────────────────────────────────────────────────────────────────────
DEJA = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("VP", os.path.join(DEJA, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("VP-Bold", os.path.join(DEJA, "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFontFamily("VP", normal="VP", bold="VP-Bold", italic="VP", boldItalic="VP-Bold")
F, FB = "VP", "VP-Bold"

# ─────────────────────────────────────────────────────────────────────────────
# Geometría
# ─────────────────────────────────────────────────────────────────────────────
PW, PH = A4
LM = RM = 18 * mm
TOP = 26 * mm       # espacio reservado al header
BOT = 20 * mm       # espacio reservado al footer
CW = PW - LM - RM   # ancho de contenido
BAR = 3 * mm        # barra de color del callout
PAD = 4.5 * mm      # padding interno del callout
IW = CW - BAR - 2 * PAD   # ancho útil dentro del callout

# ─────────────────────────────────────────────────────────────────────────────
# Estilos
# ─────────────────────────────────────────────────────────────────────────────
def st(name, **kw):
    base = dict(name=name, fontName=F, fontSize=9.4, leading=13.6, textColor=TEXT,
                alignment=TA_LEFT, spaceBefore=0, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(**base)


S_BODY = st("body", spaceAfter=3)
S_BODY_SM = st("body_sm", fontSize=8.6, leading=12.4)
S_MUTED = st("muted", fontSize=8.4, leading=12, textColor=MUTED)
S_LEAD = st("lead", fontSize=10.4, leading=15.6, textColor=MUTED, spaceAfter=5)
S_H1 = st("h1", fontName=FB, fontSize=17, leading=21, textColor=BRAND, spaceAfter=4)
S_H2 = st("h2", fontName=FB, fontSize=11.5, leading=15, textColor=BRAND_DEEP,
          spaceBefore=6, spaceAfter=4)
S_CASE_T = st("case_t", fontName=FB, fontSize=11.6, leading=14.4,
              textColor=colors.white)
S_CASE_REF = st("case_ref", fontSize=7.8, leading=10.4, textColor=MUTED)
S_LABEL = st("label", fontName=FB, fontSize=7.6, leading=10, textColor=BRAND)
S_STEP_N = st("step_n", fontName=FB, fontSize=9.4, leading=13.6, textColor=BRAND,
              alignment=TA_RIGHT)
S_BADGE = st("badge", fontName=FB, fontSize=7, leading=9)
S_CAP = st("cap", fontSize=8, leading=11, textColor=MUTED)
S_TOC = st("toc", fontSize=9.4, leading=15)
S_TOC_N = st("toc_n", fontSize=9.4, leading=15, textColor=MUTED, alignment=TA_RIGHT)
S_TH = st("th", fontName=FB, fontSize=8.4, leading=11.4, textColor=colors.white)
S_TD = st("td", fontSize=8.6, leading=12)


def bullets(items, style=S_BODY, color=None):
    """Lista con viñetas que respeta el ancho del callout."""
    stl = ParagraphStyle("b", parent=style, leftIndent=9, bulletIndent=0,
                         spaceAfter=2.5, bulletFontName=F,
                         bulletFontSize=(style.fontSize or 9.4))
    if color is not None:
        stl.bulletColor = color
    return [Paragraph(t, stl, bulletText="•") for t in items]


# ─────────────────────────────────────────────────────────────────────────────
# Flowables auxiliares
# ─────────────────────────────────────────────────────────────────────────────
PAGEMAP = {}      # clave de ancla -> número de página (resuelto en la 1ª pasada)
STATE = {"section": ""}


class Anchor(Flowable):
    """Destino interno + entrada en el panel de marcadores del lector."""

    def __init__(self, key, title=None, level=0, section=None):
        Flowable.__init__(self)
        self.key, self.title, self.level, self.section = key, title, level, section

    def wrap(self, aw, ah):
        return (0, 0)

    def draw(self):
        self.canv.bookmarkPage(self.key)
        if self.title:
            self.canv.addOutlineEntry(self.title, self.key, self.level, 0)
        PAGEMAP[self.key] = self.canv.getPageNumber()
        if self.section is not None:
            STATE["section"] = self.section


class SectionMark(Flowable):
    """Actualiza el texto del encabezado corrido."""

    def __init__(self, text):
        Flowable.__init__(self)
        self.text = text

    def wrap(self, aw, ah):
        return (0, 0)

    def draw(self):
        STATE["section"] = self.text


class Rule(Flowable):
    def __init__(self, width=CW, thickness=0.6, color=BORDER, space=2):
        Flowable.__init__(self)
        self.width, self.thickness, self.color, self.space = width, thickness, color, space

    def wrap(self, aw, ah):
        return (self.width, self.thickness + self.space)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space, self.width, self.space)


# ─────────────────────────────────────────────────────────────────────────────
# Componentes visuales
# ─────────────────────────────────────────────────────────────────────────────
def badge(text, color, tint):
    t = Table([[Paragraph(f'<font color="{color.hexval()}">{text}</font>', S_BADGE)]],
              colWidths=[36 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), tint),
        ("BOX", (0, 0), (-1, -1), 0.5, color),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def callout(label, flows, color, tint):
    """Bloque con barra de color a la izquierda y fondo tenue."""
    inner = [Paragraph(label.upper(), ParagraphStyle("l", parent=S_LABEL, textColor=color)),
             Spacer(1, 2.5)] + flows
    t = Table([["", inner]], colWidths=[BAR, CW - BAR])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("BACKGROUND", (1, 0), (1, 0), tint),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 0),
        ("TOPPADDING", (0, 0), (0, 0), 0),
        ("BOTTOMPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), PAD),
        ("RIGHTPADDING", (1, 0), (1, 0), PAD),
        ("TOPPADDING", (1, 0), (1, 0), 5),
        ("BOTTOMPADDING", (1, 0), (1, 0), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def steps_table(items):
    rows = []
    for i, txt in enumerate(items, 1):
        rows.append([Paragraph(f"{i}", S_STEP_N),
                     Paragraph(txt, ParagraphStyle("s", parent=S_BODY, spaceAfter=0))])
    t = Table(rows, colWidths=[6.5 * mm, IW - 6.5 * mm])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, -1), 4),
        ("LEFTPADDING", (1, 0), (1, -1), 0),
        ("RIGHTPADDING", (1, 0), (1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def case_header(cid, title, ref, estado):
    lbl, color, tint = estado
    band = Table(
        [[Paragraph(f"{cid} · {title}", S_CASE_T), badge(lbl, color, tint)]],
        colWidths=[CW - 40 * mm, 40 * mm])
    band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND),
        ("LEFTPADDING", (0, 0), (0, 0), PAD),
        ("RIGHTPADDING", (-1, 0), (-1, 0), PAD),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (-1, 0), (-1, 0), "RIGHT"),
    ]))
    refrow = Table([[Paragraph(f"Referencia: {ref}", S_CASE_REF)]], colWidths=[CW])
    refrow.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TINT_BRAND),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), PAD),
        ("RIGHTPADDING", (0, 0), (-1, -1), PAD),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return [band, refrow]


def figure(fname, caption):
    path = os.path.join(IMG_DIR, fname)
    iw, ih = ImageReader(path).getSize()
    w = 148 * mm            # deja respirar la caja y permite que la figura
    h = w * ih / iw         # comparta página con el caso al que ilustra
    img = Image(path, width=w, height=h)
    cap = Paragraph(caption, S_CAP)
    t = Table([[img], [cap]], colWidths=[w])
    t.hAlign = "CENTER"
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (0, 0), 0.7, BORDER),
        ("BACKGROUND", (0, 1), (0, 1), BG),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (0, 0), 0),
        ("BOTTOMPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (0, 1), (0, 1), 5),
        ("RIGHTPADDING", (0, 1), (0, 1), 5),
        ("TOPPADDING", (0, 1), (0, 1), 4),
        ("BOTTOMPADDING", (0, 1), (0, 1), 4),
    ]))
    return t


def nota(texto, color=AMBER, tint=TINT_ACCENT, titulo="Nota"):
    return callout(titulo, [Paragraph(texto, S_BODY_SM)], color, tint)


# ─────────────────────────────────────────────────────────────────────────────
# Portada, encabezado y pie
# ─────────────────────────────────────────────────────────────────────────────
def cover_page(cnv, doc):
    cnv.saveState()
    band_h = 128 * mm
    cnv.setFillColor(BRAND)
    cnv.rect(0, PH - band_h, PW, band_h, stroke=0, fill=1)
    # Sutil bloque más oscuro a la derecha, para dar profundidad
    cnv.setFillColor(BRAND_DEEP)
    cnv.rect(PW - 46 * mm, PH - band_h, 46 * mm, band_h, stroke=0, fill=1)
    cnv.setFillColor(ACCENT)
    cnv.rect(PW - 46 * mm, PH - band_h, 2.2 * mm, band_h, stroke=0, fill=1)

    cnv.setFillColor(colors.white)
    cnv.setFont(FB, 20)
    cnv.drawString(LM, PH - 30 * mm, "VProperty")
    cnv.setFont(F, 8.6)
    cnv.setFillColor(colors.HexColor("#BBD3E6"))
    cnv.drawString(LM, PH - 36 * mm, "Tasaciones · Bienes Raíces")

    cnv.setFillColor(ACCENT)
    cnv.rect(LM, PH - 48 * mm, 34 * mm, 2.4 * mm, stroke=0, fill=1)

    cnv.setFillColor(colors.white)
    cnv.setFont(FB, 27)
    cnv.drawString(LM, PH - 66 * mm, "Guía de pruebas")
    cnv.setFont(FB, 27)
    cnv.drawString(LM, PH - 79 * mm, "Consola Ejecutiva")
    cnv.setFont(F, 12)
    cnv.setFillColor(colors.HexColor("#CFE0EE"))
    cnv.drawString(LM, PH - 92 * mm, "Manual de usuario para validar la interfaz")
    cnv.drawString(LM, PH - 99.5 * mm, "de la Ejecutiva Comercial")

    cnv.setFont(F, 9)
    cnv.setFillColor(colors.HexColor("#9EC0DC"))
    cnv.drawString(LM, PH - 114 * mm, f"IF-02 · CU-002 · {VERSION} · {FECHA}")

    # Tarjeta de datos
    card_y = 74 * mm
    card_h = 78 * mm
    cnv.setFillColor(BG)
    cnv.setStrokeColor(BORDER)
    cnv.setLineWidth(0.7)
    cnv.rect(LM, card_y, CW, card_h, stroke=1, fill=1)
    cnv.setFillColor(ACCENT)
    cnv.rect(LM, card_y + card_h - 2.2 * mm, CW, 2.2 * mm, stroke=0, fill=1)

    filas = [
        ("Para quién", "Ejecutiva Comercial · Control y Seguimiento"),
        ("Qué es", "Una guía para probar la consola paso a paso y anotar qué funciona"),
        ("Qué contiene", "15 casos de prueba con pasos, resultado esperado y qué hacer si falla"),
        ("Documento base", "Manual_Usuario_Prueba1.pdf (se conservan todas sus imágenes)"),
        ("No necesitas", "Conocimientos técnicos: sólo el navegador y tu cuenta de acceso"),
    ]
    y = card_y + card_h - 14 * mm
    for k, v in filas:
        cnv.setFillColor(BRAND)
        cnv.setFont(FB, 8.4)
        cnv.drawString(LM + 7 * mm, y, k.upper())
        cnv.setFillColor(TEXT)
        cnv.setFont(F, 9.4)
        cnv.drawString(LM + 7 * mm, y - 5.6 * mm, v)
        y -= 14 * mm

    cnv.setFillColor(MUTED)
    cnv.setFont(F, 8)
    cnv.drawString(LM, 58 * mm,
                   "Las capturas de pantalla provienen del ambiente de pruebas; los datos que")
    cnv.drawString(LM, 53.5 * mm,
                   "aparecen en ellas son de ejemplo y pueden diferir de lo que veas hoy.")

    cnv.setFillColor(BRAND)
    cnv.rect(0, 0, PW, 8 * mm, stroke=0, fill=1)
    cnv.setFillColor(ACCENT)
    cnv.rect(0, 8 * mm, PW, 1.6 * mm, stroke=0, fill=1)
    cnv.setFillColor(colors.white)
    cnv.setFont(F, 7.6)
    cnv.drawString(LM, 3 * mm, "Documento interno · VProperty")
    cnv.drawRightString(PW - RM, 3 * mm, f"{VERSION} · {FECHA}")
    cnv.restoreState()


def body_chrome(cnv, doc):
    """Encabezado y pie. Se dibuja al cerrar la página (onPageEnd) para que el
    título corrido corresponda a la sección efectivamente compuesta."""
    cnv.saveState()
    # Header
    cnv.setFillColor(BRAND)
    cnv.setFont(FB, 8.2)
    cnv.drawString(LM, PH - 15 * mm, "VProperty · Guía de pruebas de la Consola Ejecutiva")
    cnv.setFillColor(MUTED)
    cnv.setFont(F, 8.2)
    cnv.drawRightString(PW - RM, PH - 15 * mm, STATE.get("section", ""))
    cnv.setStrokeColor(BORDER)
    cnv.setLineWidth(0.7)
    cnv.line(LM, PH - 18 * mm, PW - RM, PH - 18 * mm)
    cnv.setStrokeColor(ACCENT)
    cnv.setLineWidth(1.6)
    cnv.line(LM, PH - 18 * mm, LM + 22 * mm, PH - 18 * mm)
    # Footer (la paginación la escribe NumberedCanvas)
    cnv.setStrokeColor(BORDER)
    cnv.setLineWidth(0.7)
    cnv.line(LM, 14 * mm, PW - RM, 14 * mm)
    cnv.setFillColor(MUTED)
    cnv.setFont(F, 7.6)
    cnv.drawString(LM, 10 * mm, f"IF-02 · CU-002 · {VERSION}")
    cnv.restoreState()


class NumberedCanvas(pdfcanvas.Canvas):
    """Segunda pasada sobre las páginas ya compuestas para escribir 'Página X de Y'."""

    def __init__(self, *a, **kw):
        pdfcanvas.Canvas.__init__(self, *a, **kw)
        self._saved = []

    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved)
        for state in self._saved:
            self.__dict__.update(state)
            n = self._pageNumber
            if n > 1:  # la portada no lleva paginación
                self.setFont(F, 7.6)
                self.setFillColor(MUTED)
                self.drawRightString(PW - RM, 10 * mm, f"Página {n} de {total}")
            pdfcanvas.Canvas.showPage(self)
        pdfcanvas.Canvas.save(self)


# ─────────────────────────────────────────────────────────────────────────────
# Contenido: casos de prueba
# ─────────────────────────────────────────────────────────────────────────────
OK = ("Listo para probar", GREEN, TINT_GREEN)
LIM = ("Con limitación", AMBER, TINT_ACCENT)
NOD = ("No disponible aún", RED, TINT_RED)

CASOS = [
    dict(
        id="CP-01", key="cp01", titulo="Entrar a la Consola",
        ref="§1.0 Navegación principal", estado=OK,
        que="Que puedes identificarte con tu cuenta y que la Consola se abre completa.",
        pre=[
            "Tener a mano la dirección de la consola de pruebas que te entregó el equipo.",
            "Tener tu correo de trabajo autorizado para entrar.",
            "Usar Google Chrome o Microsoft Edge actualizado, en una ventana normal.",
        ],
        pasos=[
            "Abre el navegador y escribe la dirección de la consola, terminada en <b>/consola</b>.",
            "Observa que la pantalla cambia sola a una ventana de acceso con el título "
            "<b>Continue to aisolution</b>.",
            "Pulsa <b>Continue with Google</b> si tu correo es de Google; si no, escribe tu "
            "correo en <b>Email address</b> y pulsa <b>Continue</b>.",
            "Completa la clave o el código si te lo pide.",
            "Espera a que la pantalla vuelva sola a la consola.",
        ],
        esperado=[
            "Vuelves automáticamente a la consola, sin tener que escribir la dirección otra vez.",
            "Arriba a la izquierda aparece <b>VProperty</b> y las tres entradas <b>Consola</b>, "
            "<b>Cola operativa</b> y <b>Expediente</b>.",
            "Arriba al centro está el buscador y arriba a la derecha un círculo azul con "
            "iniciales.",
            "A la izquierda se carga la lista de solicitudes y a la derecha el detalle de la "
            "primera.",
        ],
        falla=[
            "Anota el correo con el que intentaste entrar, la hora exacta y el mensaje que "
            "aparece en pantalla, tal cual está escrito.",
            "Saca una captura de pantalla completa (tecla <b>Impr Pant</b>) y adjúntala.",
            "Avisa a Sergio. Si la ventana de acceso muestra la palabra "
            "<b>Development mode</b>, eso es normal en el ambiente de pruebas: no es una falla.",
        ],
        img=("img_001.png", "Figura 1 · Pantalla de acceso. La consola no se abre "
                            "hasta que te identificas."),
    ),
    dict(
        id="CP-02", key="cp02", titulo="Recorrer la lista de solicitudes",
        ref="§1.1 Vista de Solicitudes · §1.3 Detalle · RF-05", estado=OK,
        que="Que la bandeja muestra tus solicitudes, con sus pestañas, sus contadores y el "
            "detalle a la derecha.",
        pre=["Haber entrado a la Consola (CP-01).",
             "Que existan solicitudes de prueba cargadas en el ambiente."],
        pasos=[
            "Mira la columna de la izquierda: es la lista de solicitudes.",
            "Recorre las pestañas de arriba: <b>Mi cartera</b>, <b>SLA en riesgo</b>, "
            "<b>Por asignar</b>, <b>Aprobadas</b> y <b>Todas</b>. Anota el número que muestra "
            "cada una.",
            "Pulsa una pestaña y cuenta si la cantidad de tarjetas se corresponde con el "
            "número que anunciaba.",
            "Fíjate en una tarjeta: debe traer el código <b>VP-AAAA-NNNN</b>, el cliente, la "
            "comuna, el estado, la prioridad, la etapa del plazo y el tasador (o "
            "<b>Sin asignar</b>).",
            "Pulsa una tarjeta cualquiera y observa el panel de la derecha.",
            "Baja hasta el final de la lista y usa <b>Siguiente</b> y <b>Anterior</b>.",
            "Pulsa <b>Cola operativa</b> en la barra de arriba y comprueba que la lista se "
            "reduce a lo que aún no tiene tasador.",
            "Pasa el mouse sobre <b>Expediente</b> sin hacer clic.",
        ],
        esperado=[
            "Al pulsar una tarjeta, ésta queda resaltada y el panel derecho muestra el "
            "detalle de esa misma solicitud.",
            "Al pie de la lista se lee <b>Página 1 de N · X solicitudes</b> y los botones de "
            "avance funcionan.",
            "<b>Expediente</b> se ve apagado y no se puede pulsar; muestra el aviso "
            "<b>No disponible en esta versión</b>.",
            "Si en <b>Mi cartera</b> aparece el texto «La vista Mi cartera aún no está "
            "disponible», anótalo: significa que tu usuario todavía no está enlazado a la "
            "cartera.",
        ],
        falla=[
            "Anota la pestaña, el número que mostraba y cuántas tarjetas contaste realmente.",
            "Anota el código de una solicitud que aparezca donde no corresponde.",
            "Adjunta captura de la lista completa y avisa a Sergio.",
        ],
        img=("img_002.png", "Figura 2 · Consola: lista de solicitudes a la izquierda y "
                            "detalle de la solicitud seleccionada a la derecha."),
    ),
    dict(
        id="CP-03", key="cp03", titulo="Filtrar, ordenar y limpiar filtros",
        ref="§1.1 Filtros y estado en la dirección del navegador", estado=OK,
        que="Que los filtros acotan la lista y que siempre puedes volver atrás sin perder "
            "el trabajo.",
        pre=["Estar en la pestaña <b>Todas</b> con varias solicitudes a la vista."],
        pasos=[
            "Pulsa <b>Filtros</b> para desplegar la fila de filtros.",
            "Elige un <b>Cliente</b> y observa cómo cambia la lista.",
            "En <b>Tasador</b> elige <b>Sin asignar</b>.",
            "Prueba también <b>Estado</b>, <b>Prioridad</b> y el semáforo de plazo.",
            "Escribe un rango de fechas en <b>desde</b> y <b>hasta</b>.",
            "Cambia el desplegable <b>Orden</b> y observa cómo se reordenan las tarjetas.",
            "Copia la dirección que quedó en la barra del navegador y pégala en una pestaña "
            "nueva.",
            "Vuelve a la primera pestaña y pulsa la flecha <b>atrás</b> del navegador.",
            "Pulsa <b>Limpiar filtros</b>.",
        ],
        esperado=[
            "Cada filtro reduce la lista sin recargar la pantalla completa.",
            "La dirección del navegador va cambiando a medida que filtras.",
            "La pestaña nueva abre exactamente la misma lista filtrada.",
            "La flecha atrás devuelve el filtro anterior.",
            "<b>Limpiar filtros</b> deja la lista completa otra vez.",
            "Si ningún resultado coincide, aparece <b>No hay solicitudes que coincidan</b> con "
            "un acceso para limpiar los filtros.",
        ],
        falla=[
            "Anota qué combinación de filtros usaste y qué esperabas ver.",
            "Copia la dirección completa del navegador: es la forma más rápida de que el "
            "equipo reproduzca lo que viste.",
            "Adjunta captura y avisa a Sergio.",
        ],
    ),
    dict(
        id="CP-04", key="cp04", titulo="Buscar una solicitud desde el encabezado",
        ref="§1.1 Buscador global", estado=OK,
        que="Que el único buscador de la pantalla encuentra por código, por RUT y por "
            "dirección.",
        pre=["Tener a mano el código de una solicitud de prueba (por ejemplo VP-2026-0057), "
             "el RUT de un comprador y una dirección conocida."],
        pasos=[
            "Haz clic en el campo del centro del encabezado: <b>Buscar por código "
            "VP-AAAA-NNNN, RUT o dirección</b>.",
            "Escribe un código completo y espera un segundo sin pulsar nada.",
            "Borra y escribe sólo una parte del código; pulsa <b>Enter</b>.",
            "Repite con un RUT y luego con parte de una dirección.",
            "Escribe algo inventado, por ejemplo <b>zzzz</b>.",
            "Pulsa la <b>X</b> del campo para limpiar la búsqueda.",
            "Recorre la pantalla y comprueba que no haya un segundo buscador.",
        ],
        esperado=[
            "La lista se actualiza sola al dejar de escribir, y de inmediato al pulsar Enter.",
            "El resultado aparece en pocos segundos.",
            "Con un texto inventado aparece <b>No hay solicitudes que coincidan</b>.",
            "Al limpiar, vuelve la lista completa.",
            "Hay un solo buscador en toda la interfaz.",
        ],
        falla=[
            "Anota el texto exacto que buscaste y el código de la solicitud que esperabas "
            "encontrar.",
            "Indica si la solicitud existe y aparece cuando buscas de otra manera.",
            "Avisa a Sergio con esos dos datos.",
        ],
    ),
    dict(
        id="CP-05", key="cp05", titulo="Leer el semáforo de plazos y el indicador de cartera",
        ref="§1.2 Vista de SLA · RF-08 · RF-53", estado=OK,
        que="Que los colores de plazo se entienden y que el resumen de arriba a la derecha "
            "coincide con la lista.",
        pre=["Tener solicitudes con distinta antigüedad, de modo que se vean varios colores."],
        pasos=[
            "Mira arriba a la derecha: debe leerse <b>En tu cartera: X activas · Y en SLA "
            "rojo</b>. Anota ambos números.",
            "Fíjate en las tarjetas: cada una trae un indicador de días y una etiqueta de "
            "etapa (por ejemplo <b>E1 · Vencida hace 1d</b>).",
            "Identifica una tarjeta verde, una ámbar y una roja.",
            "Pulsa el número que está en rojo del indicador de cartera.",
            "Cuenta las tarjetas que quedaron en la lista.",
            "Abre una solicitud vencida y lee la franja de aviso que aparece sobre las "
            "pestañas del detalle.",
        ],
        esperado=[
            "Verde significa dentro de plazo, ámbar cerca del límite y rojo fuera de plazo.",
            "Al pulsar el número rojo, la lista queda filtrada por tu cartera y por plazo "
            "vencido.",
            "La cantidad de tarjetas coincide con el número que anunciaba el indicador.",
            "En el detalle de una solicitud vencida se lee un aviso rojo indicando qué etapa "
            "se pasó de plazo y quién es responsable.",
        ],
        falla=[
            "Si el número del indicador no coincide con la cantidad de tarjetas, anota los "
            "dos números y la hora.",
            "Si un color no calza con los días mostrados, anota el código de la solicitud.",
            "Adjunta captura del encabezado y de la lista, y avisa a Sergio.",
        ],
    ),
    dict(
        id="CP-06", key="cp06", titulo="Asistente de creación · Paso 1: modo de creación",
        ref="§1.5.0 Wizard de creación (tres fases)", estado=LIM,
        que="Que el asistente se abre en tres pasos y que el primer paso deja claro cómo se "
            "va a crear la solicitud.",
        pre=["Estar en la Consola, con la lista visible."],
        pasos=[
            "Pulsa el botón azul <b>+ Nueva solicitud interna</b>, sobre la lista.",
            "Observa el panel que se abre por la derecha: <b>Nueva solicitud interna</b>, con "
            "el texto <b>Asistente en 3 pasos</b> y los pasos <b>1 Modo</b>, <b>2 Tipo</b> y "
            "<b>3 Formulario</b>.",
            "Intenta seleccionar <b>En base a documentos adjuntos</b>.",
            "Deja el mouse encima de esa opción, sin hacer clic, y lee el aviso que aparece.",
            "Selecciona <b>Ingreso manual</b>.",
            "Pulsa <b>Continuar</b>.",
        ],
        esperado=[
            "El panel se abre por el costado derecho y el resto de la pantalla queda atenuado.",
            "<b>En base a documentos adjuntos</b> se ve apagada, no se puede seleccionar y "
            "muestra el aviso <b>No disponible en esta versión</b>.",
            "<b>Ingreso manual</b> sí se puede seleccionar y queda marcada.",
            "Al pulsar <b>Continuar</b> se habilita el paso 2.",
        ],
        falla=[
            "Si la opción apagada sí se deja seleccionar, anótalo: es justamente lo que no "
            "debe ocurrir en esta versión.",
            "Si el botón <b>Continuar</b> no responde, anota qué opción tenías marcada.",
            "Adjunta captura del panel y avisa a Sergio.",
        ],
        nota="La creación a partir de documentos está desactivada a propósito en esta "
             "versión: la lectura automática de los archivos todavía no está en servicio, y "
             "habilitarla te dejaría con un formulario en blanco después de subir los "
             "documentos. Se probará cuando esa lectura esté disponible.",
    ),
    dict(
        id="CP-07", key="cp07", titulo="Asistente de creación · Paso 2: propiedad nueva o usada",
        ref="§1.5.0 Fase 2 · Tipo de propiedad", estado=OK,
        que="Que elegir Nuevo o Usado cambia realmente el formulario que viene después.",
        pre=["Haber completado el paso 1 con <b>Ingreso manual</b> (CP-06)."],
        pasos=[
            "En el paso 2 lee las dos opciones y elige <b>Nuevo</b>.",
            "Pulsa <b>Continuar</b> y recorre el formulario del paso 3 de arriba abajo, sin "
            "llenarlo.",
            "Anota si ves el campo <b>Proyecto o condominio</b>, el bloque <b>Financiero</b> "
            "y un vendedor con <b>Razón social</b> y <b>RUT inmobiliaria</b>.",
            "Pulsa <b>Volver</b> hasta el paso 2 y cambia la elección a <b>Usado</b>.",
            "Vuelve a entrar al formulario y recorre otra vez los mismos bloques.",
        ],
        esperado=[
            "Con <b>Nuevo</b>: aparecen <b>Proyecto o condominio</b> (obligatorio, marcado "
            "con asterisco), el bloque <b>Financiero</b> y el vendedor como empresa.",
            "Con <b>Usado</b>: desaparecen el proyecto y el bloque financiero, y el vendedor "
            "pasa a pedir <b>Nombre completo propietario</b> y <b>RUT propietario</b>.",
            "El cambio se refleja de inmediato, sin cerrar y volver a abrir el panel.",
        ],
        falla=[
            "Anota qué elegiste (Nuevo o Usado) y qué bloque apareció o faltó.",
            "Adjunta captura del formulario mostrando el bloque en cuestión.",
            "Avisa a Sergio indicando el paso en que ocurrió.",
        ],
    ),
    dict(
        id="CP-08", key="cp08", titulo="Asistente de creación · Paso 3: completar y crear",
        ref="§1.5.1 Ingreso de datos · §1.5.1 Habilitación del botón Crear solicitud",
        estado=OK,
        que="Que el formulario avisa con claridad lo que falta y que la solicitud se crea.",
        pre=["Estar en el paso 3 del asistente.",
             "Tener a mano datos de prueba: cliente, tipo de informe, dirección, comuna, RUT "
             "del comprador y un teléfono de contacto."],
        pasos=[
            "Sin llenar nada, baja hasta el final y pulsa <b>Crear solicitud</b>.",
            "Lee el aviso que salta en pantalla y el recuadro rojo que aparece al comienzo "
            "del formulario.",
            "Ahora completa la sección <b>A · Origen y cliente</b>: canal de contacto, "
            "cliente, tipo de cliente de origen, tipo de informe, banco y N° de operación.",
            "Elige un cliente y abre el desplegable <b>Tipo de informe</b>: comprueba que "
            "sólo ofrece los tipos de ese cliente.",
            "En la sección <b>B · Propiedad</b> elige una <b>Región</b> y luego abre "
            "<b>Comuna</b>.",
            "Completa la sección <b>C · Personas de la operación</b> con un RUT válido y otro "
            "inválido, para ver la diferencia.",
            "En <b>D · Producto y observaciones</b> elige un producto hipotecario y observa "
            "el campo <b>Banco financista</b>.",
            "Completa lo que falte y pulsa <b>Crear solicitud</b>.",
        ],
        esperado=[
            "Con el formulario vacío no se crea nada: aparece un aviso con el número de "
            "campos con problema y, arriba del formulario, la lista completa de esos campos "
            "con el motivo de cada uno.",
            "Los bloques repetibles se nombran con precisión, por ejemplo <b>Unidad 2 · "
            "Superficie construida</b> o <b>Contacto 1 · Teléfono</b>.",
            "El desplegable de comunas sólo ofrece las comunas de la región elegida.",
            "Un RUT mal escrito muestra el mensaje «Necesitamos el RUT del propietario con su "
            "dígito verificador. Ej.: 12.345.678-9».",
            "Con producto hipotecario, el banco financista pasa a ser obligatorio.",
            "Al crear, el botón se bloquea y muestra <b>Creando…</b>; luego aparece un aviso "
            "verde <b>Solicitud creada · VP-2026-NNNN</b> y la solicitud nueva queda abierta.",
        ],
        falla=[
            "Anota el mensaje exacto del recuadro rojo y qué campo creías tener bien.",
            "Si el botón queda bloqueado en <b>Creando…</b> más de un minuto, anota la hora y "
            "no vuelvas a pulsarlo: recarga la página y comprueba en la lista si la "
            "solicitud se creó igual.",
            "Adjunta captura del formulario con el recuadro rojo visible y avisa a Sergio.",
        ],
        img=("img_003.png", "Figura 3 · Paso 3 del asistente: formulario de creación con sus "
                            "secciones A, B, C y D, y el botón Crear solicitud abajo a la "
                            "derecha."),
    ),
    dict(
        id="CP-09", key="cp09", titulo="Contactos de visita: agregar, ordenar y quitar",
        ref="§1.5.1 Sección A · Contactos de visita", estado=OK,
        que="Que puedes registrar varios contactos y que el orden define a quién llama "
            "primero el tasador.",
        pre=["Estar en el formulario de creación, o en <b>Editar solicitud</b> de una "
             "solicitud en estado <b>Creada</b>."],
        pasos=[
            "Busca el bloque <b>Contactos de visita</b> dentro de la sección A.",
            "Completa el primer contacto: rol o relación, nombre, teléfono, email y estado "
            "del contacto.",
            "Pulsa <b>+ Agregar contacto</b> y completa un segundo contacto.",
            "Agrega un tercero.",
            "Usa las flechas <b>Subir contacto</b> y <b>Bajar contacto</b> para cambiar el "
            "orden.",
            "Pulsa <b>Eliminar contacto</b> en el del medio.",
            "Intenta dejar la lista sin ningún contacto.",
        ],
        esperado=[
            "El rol se elige de una lista cerrada: propietario, corredor, arrendatario, "
            "conserje u otro.",
            "Los contactos se numeran y el primero de la lista es el contacto principal.",
            "Al subir o bajar, la numeración se reordena de inmediato.",
            "Al eliminar, los demás contactos conservan sus datos.",
            "La lista no permite quedarse sin contactos: debe haber al menos uno.",
        ],
        falla=[
            "Anota cuántos contactos tenías y qué operación hiciste (subir, bajar, eliminar).",
            "Anota si algún dato se cambió solo de fila: es la falla más importante de este "
            "bloque.",
            "Adjunta captura antes y después del movimiento, y avisa a Sergio.",
        ],
    ),
    dict(
        id="CP-10", key="cp10", titulo="Unidades de la propiedad: agregar y describir",
        ref="§1.5.1 Sección B · Unidades · RN-45 · RN-50", estado=OK,
        que="Que una misma solicitud admite varias unidades (departamento, estacionamiento, "
            "bodega) con sus datos propios.",
        pre=["Estar en el formulario de creación, en la sección <b>B · Propiedad</b>."],
        pasos=[
            "Completa la primera unidad: ubicación, tipo de bien, superficies, año y material.",
            "Abre el desplegable <b>Tipo de bien</b> y revisa que ofrezca los ocho valores "
            "(edificación, terreno, los tres tipos de estacionamiento, bodega, piscina y "
            "obras complementarias).",
            "Marca <b>Con rol</b> y escribe un rol con el formato NNNNN-N.",
            "Pulsa <b>+ Agregar unidad</b> y registra un estacionamiento; marca esta vez "
            "<b>Uso y goce</b>.",
            "Agrega una tercera unidad como bodega.",
            "Elige el tipo de bien <b>Obras complementarias</b> en una unidad y deja el "
            "<b>Detalle del ítem</b> vacío.",
            "En <b>Origen de la superficie</b> elige una opción y observa el campo "
            "<b>Respaldo</b>.",
            "Si la propiedad es <b>Usado</b>, revisa que aparezcan los campos de "
            "<b>Ampliación (m²)</b> y <b>Ampliación regularizable</b>; si es <b>Nuevo</b>, "
            "que aparezca <b>Modelo</b>.",
        ],
        esperado=[
            "Cada unidad se numera y se puede plegar y desplegar sin perder lo escrito.",
            "Con <b>Uso y goce</b> marcado, el rol deja de ser exigido.",
            "La marca <b>En trámite</b> del rol sólo se ofrece cuando la propiedad es Nueva.",
            "Si el tipo de bien es <b>Obras complementarias</b>, el detalle del ítem pasa a "
            "ser obligatorio y se avisa al intentar crear.",
            "Los campos de ampliación aparecen sólo en propiedad Usada y <b>Modelo</b> sólo "
            "en propiedad Nueva.",
        ],
        falla=[
            "Anota el número de unidad y el campo exacto donde ocurrió el problema.",
            "Si un campo aparece donde no corresponde (por ejemplo Modelo en una propiedad "
            "usada), anótalo: es un error de configuración del formulario.",
            "Adjunta captura de la unidad completa y avisa a Sergio.",
        ],
    ),
    dict(
        id="CP-11", key="cp11", titulo="Documentos y Adjuntos de una solicitud",
        ref="§1.3.1 Barra de acciones · §1.5.1.1 Checklist de documentos", estado=LIM,
        que="Que puedes marcar los documentos que corresponden y adjuntar archivos después "
            "de crear la solicitud.",
        pre=["Tener una solicitud abierta en el panel derecho, en estado <b>Creada</b>.",
             "Tener a mano dos archivos distintos en PDF o imagen, de menos de 10 MB cada uno."],
        pasos=[
            "En la barra del detalle pulsa <b>Documentos y Adjuntos</b>.",
            "Recorre la lista de documentos: comprueba que estén ordenados alfabéticamente.",
            "Marca un documento del listado.",
            "Arrastra el primer archivo a la zona de carga, o pulsa para elegirlo desde tu "
            "equipo.",
            "Espera a que termine la barra de progreso.",
            "Vuelve a subir exactamente el mismo archivo al mismo documento.",
            "Ahora sube el segundo archivo, distinto, al mismo documento, y lee el mensaje de "
            "confirmación antes de aceptar.",
            "Desmarca ese documento y lee el mensaje de confirmación que aparece.",
            "Intenta subir un archivo de más de 10 MB o de otro formato (por ejemplo Word).",
            "Cierra el panel y abre la pestaña <b>Adjuntos</b> del detalle.",
        ],
        esperado=[
            "El panel se abre por la derecha con el título <b>Documentos y adjuntos</b>.",
            "Sólo se aceptan PDF, JPG y PNG de hasta 10 MB; con otro archivo aparece un aviso "
            "de formato o de tamaño y no se sube nada.",
            "Al subir dos veces el mismo archivo, el sistema avisa que ya estaba adjunto y no "
            "lo duplica.",
            "Al subir uno distinto sobre un documento que ya tenía archivo, primero pide "
            "confirmación y nombra el archivo que se va a perder.",
            "Al desmarcar un documento con archivo, el mensaje es distinto: advierte que el "
            "archivo desaparece y nada ocupa su lugar.",
            "El archivo subido aparece luego en la pestaña <b>Adjuntos</b> del detalle.",
        ],
        falla=[
            "Anota el nombre y el tamaño del archivo, y el documento del listado al que lo "
            "asociaste.",
            "Si un archivo se pierde sin haberte pedido confirmación, anótalo de inmediato: "
            "es la falla más grave de esta pantalla.",
            "Adjunta captura del panel con el listado visible y avisa a Sergio.",
        ],
        nota="En esta versión los archivos se guardan y se pueden ver y descargar, pero la "
             "lectura automática de su contenido aún no está en servicio: los documentos "
             "quedarán marcados como no procesados y no rellenarán campos por sí solos. Es "
             "un pendiente conocido del equipo, no una falla que debas reportar.",
    ),
    dict(
        id="CP-12", key="cp12", titulo="Revisar el detalle de una solicitud",
        ref="§1.3 Detalle de Solicitud · §1.3.2 · §1.3.3 · §1.3.4", estado=OK,
        que="Que el panel derecho reúne todo lo que se sabe de una solicitud, en tres "
            "pestañas.",
        pre=["Tener una solicitud seleccionada en la lista."],
        pasos=[
            "Mira la cabecera del panel derecho: código, estado, días, prioridad y etapa de "
            "plazo.",
            "Lee la línea que indica cuándo se modificó por última vez.",
            "En la pestaña <b>Datos</b>, recorre los bloques: <b>Operación</b>, <b>Cliente y "
            "tipo</b>, <b>Propiedad</b>, <b>Vendedor</b>, <b>Unidades</b>, <b>Personas de la "
            "operación</b>, <b>Contactos de visita</b>, <b>Asignación</b> y el resto.",
            "Comprueba que los datos que aún no existen se muestren con una raya (—) y no en "
            "blanco.",
            "Pulsa la pestaña <b>Historial</b> y recorre la cronología.",
            "Pulsa la pestaña <b>Adjuntos</b> y comprueba que estén los archivos que subiste "
            "en CP-11.",
            "Vuelve a la lista, elige otra solicitud y comprueba que el panel cambia entero.",
        ],
        esperado=[
            "Las tres pestañas cargan sin recargar la página completa.",
            "El <b>Historial</b> muestra los hechos en orden de tiempo: creación, cambios "
            "guardados, asignación y cargas de documentos.",
            "En <b>Adjuntos</b> se puede ver o descargar cada archivo.",
            "Los datos que la solicitud no tiene aún se muestran con una raya, no como error.",
        ],
        falla=[
            "Anota el código de la solicitud y el bloque donde falta un dato que tú sabes que "
            "existe.",
            "Si el panel muestra datos de otra solicitud, anota los dos códigos: el que "
            "pulsaste y el que apareció.",
            "Adjunta captura y avisa a Sergio.",
        ],
        img=("img_002.png", "Figura 4 · Detalle de la solicitud: cabecera con estado y "
                            "plazos, barra de acciones y pestañas Datos, Historial y "
                            "Adjuntos."),
    ),
    dict(
        id="CP-13", key="cp13", titulo="Asignar tasador",
        ref="§1.6 Asignación de Tasador · §1.6.1 · §1.6.2 · RF-06 · RN-44", estado=OK,
        que="Que la solicitud sólo sale al tasador cuando está en condiciones, y que la "
            "asignación queda registrada.",
        pre=["Tener una solicitud en estado <b>Creada</b>, sin tasador.",
             "Para la primera parte: una solicitud a la que le falte algún dato (dirección, "
             "contacto con teléfono o rol).",
             "Para la segunda parte: una solicitud completa."],
        pasos=[
            "Abre la solicitud incompleta y observa el botón <b>Asignar Tasador</b> en la "
            "barra de acciones.",
            "Deja el mouse encima del botón sin pulsarlo y lee la lista que aparece.",
            "Completa lo que falta desde <b>Editar solicitud</b> y vuelve a mirar el botón.",
            "Ahora abre una solicitud completa y pulsa <b>Asignar Tasador</b>.",
            "En el buscador del diálogo escribe parte de un nombre o un RUT.",
            "Fíjate en cada tasador de la lista: si dice <b>En cobertura</b> o <b>Fuera</b>, "
            "y cuánta carga tiene.",
            "Elige a propósito un tasador marcado como fuera de cobertura y lee el aviso "
            "ámbar que aparece.",
            "Escribe un motivo (es opcional) y pulsa el botón de confirmar.",
            "Lee el texto del último aviso de confirmación antes de aceptar.",
            "Confirma y espera.",
        ],
        esperado=[
            "Si falta algún dato, el botón está apagado y el globito enumera exactamente qué "
            "falta: dirección de la propiedad, al menos un contacto de visita con teléfono y "
            "el rol de cada unidad.",
            "Al completar los datos, el botón se enciende.",
            "El diálogo ordena primero a los tasadores que cubren la comuna de la solicitud.",
            "Elegir uno fuera de cobertura no bloquea: sólo advierte, y queda registrado.",
            "El aviso final explica que la solicitud pasará a estado asignada y que se "
            "registrará la fecha y hora.",
            "Al confirmar, el botón muestra <b>Asignando…</b>, luego aparece un aviso verde "
            "<b>Solicitud asignada a {nombre del tasador}</b>.",
            "El botón <b>Asignar Tasador</b> desaparece de la barra, el estado pasa a "
            "<b>Asignada</b> y el <b>Historial</b> registra la asignación.",
        ],
        falla=[
            "Anota el código de la solicitud, el tasador elegido y la hora exacta.",
            "Si el botón sigue visible después de asignar, o si el estado no cambia, recarga "
            "la página y anota si el cambio quedó guardado o no.",
            "No vuelvas a asignar una segunda vez: anótalo y avisa a Sergio.",
        ],
        nota="En esta versión la asignación se hace una sola vez y no existe pantalla de "
             "reasignación. Si te equivocaste de tasador y la solicitud todavía está en "
             "estado <b>Creada</b>, corrígelo desde <b>Editar solicitud</b>. Si ya pasó a "
             "<b>Asignada</b>, avisa al equipo: la corrección no se hace desde la consola.",
    ),
    dict(
        id="CP-14", key="cp14", titulo="Editar una solicitud y comprobar el bloqueo",
        ref="§1.4 Modificación de detalles · RN-59", estado=OK,
        que="Que puedes corregir los datos mientras la solicitud está en estado Creada, y "
            "que después queda protegida.",
        pre=["Tener una solicitud en estado <b>Creada</b> y otra en estado <b>Asignada</b>."],
        pasos=[
            "Abre la solicitud en estado <b>Creada</b> y pulsa <b>Editar solicitud</b>.",
            "Cambia la dirección, agrega un contacto de visita y corrige una superficie.",
            "Pulsa <b>Guardar cambios</b> y observa el botón mientras guarda.",
            "Abre la pestaña <b>Historial</b> y busca el registro del cambio.",
            "Vuelve a <b>Editar solicitud</b>, cambia algo y pulsa <b>Cancelar</b>.",
            "Ahora abre la solicitud en estado <b>Asignada</b> y busca el botón <b>Editar "
            "solicitud</b>.",
            "Intenta modificar cualquier campo de la pestaña <b>Datos</b>.",
        ],
        esperado=[
            "Mientras guarda, el botón se bloquea y muestra <b>Guardando…</b>.",
            "Al terminar aparece el aviso <b>Cambios guardados en la solicitud.</b>",
            "El cambio queda registrado en el <b>Historial</b>.",
            "<b>Cancelar</b> descarta lo escrito y no cambia nada.",
            "En la solicitud ya asignada no existe el botón <b>Editar solicitud</b> y los "
            "datos están sólo para leer.",
        ],
        falla=[
            "Anota el código de la solicitud, el campo que editaste, el valor anterior y el "
            "nuevo.",
            "Si un cambio no queda guardado, recarga la página antes de reportarlo: así se "
            "distingue un problema de guardado de uno de refresco de pantalla.",
            "Si puedes editar una solicitud ya asignada, anótalo: no debería permitirse.",
        ],
    ),
    dict(
        id="CP-15", key="cp15", titulo="Cerrar la sesión y comprobar el acceso protegido",
        ref="§1.0 Navegación principal · acceso", estado=NOD,
        que="Que nadie pueda entrar a la consola sin identificarse, y qué ocurre hoy al "
            "intentar cerrar la sesión.",
        pre=["Estar dentro de la Consola con tu cuenta."],
        pasos=[
            "Mira el círculo azul con iniciales, arriba a la derecha, y haz clic sobre él.",
            "Anota si se abre algún menú y si aparece la opción <b>Cerrar sesión</b>.",
            "Cierra la pestaña y luego el navegador completo.",
            "Abre una ventana de navegación privada o de incógnito.",
            "Pega la dirección de la consola terminada en <b>/consola</b> y pulsa Enter.",
            "Observa qué pantalla aparece.",
        ],
        esperado=[
            "Hoy el círculo con iniciales no abre ningún menú y no existe la opción "
            "<b>Cerrar sesión</b>: es una limitación conocida de esta versión, ya reportada "
            "al equipo.",
            "En la ventana de incógnito, la consola no se abre: la pantalla cambia sola a la "
            "ventana de acceso.",
            "Mientras no exista el botón de cerrar sesión, la forma segura de terminar es "
            "cerrar el navegador completo cuando compartas el equipo.",
        ],
        falla=[
            "Si en la ventana de incógnito la consola se abre sin pedirte identificación, "
            "avisa de inmediato a Sergio: es un problema de acceso, no un detalle de "
            "pantalla.",
            "Anota la hora y la dirección exacta que usaste.",
            "Adjunta captura de lo que apareció en la ventana de incógnito.",
        ],
        nota="No hace falta que reportes la ausencia del botón <b>Cerrar sesión</b>: ya está "
             "registrada. Lo que sí interesa de este caso es la segunda parte, la que "
             "comprueba que la consola queda protegida.",
    ),
]


# ─────────────────────────────────────────────────────────────────────────────
# Composición de la historia
# ─────────────────────────────────────────────────────────────────────────────
def bloque_caso(c):
    flows = []
    cab = case_header(c["id"], c["titulo"], c["ref"], c["estado"])
    # El ancla va DENTRO del grupo: si el caso se desplaza a la página
    # siguiente, el ancla —y con ella el número del índice— se desplaza también.
    primero = [Anchor(c["key"], f'{c["id"]} · {c["titulo"]}', 1,
                      section=f'{c["id"]} · {c["titulo"]}'),
               cab[0], cab[1], Spacer(1, 5)]
    # La figura va arriba, junto a la cabecera: el lector ve primero la pantalla
    # que va a probar, y así comparte página con el caso en vez de quedar sola.
    if c.get("img"):
        fn, cap = c["img"]
        primero += [figure(fn, cap), Spacer(1, 6)]
    primero += [
        callout("1 · Qué se prueba", [Paragraph(c["que"], S_BODY)], BRAND, TINT_BRAND),
        Spacer(1, 4),
        callout("2 · Precondición", bullets(c["pre"]), MUTED, TINT_MUTED),
    ]
    flows.append(KeepTogether(primero))
    flows.append(Spacer(1, 4))
    flows.append(callout("3 · Pasos", [steps_table(c["pasos"])], ACCENT, TINT_ACCENT))
    flows.append(Spacer(1, 4))
    flows.append(callout("4 · Resultado esperado", bullets(c["esperado"]), GREEN, TINT_GREEN))
    flows.append(Spacer(1, 4))
    cierre = [callout("5 · Si falla", bullets(c["falla"]), RED, TINT_RED)]
    if c.get("nota"):
        # La nota viaja pegada al bloque 5: si no cabe, se mueven los dos juntos
        # y ninguna página queda con una nota suelta.
        cierre += [Spacer(1, 4), nota(c["nota"])]
    flows.append(KeepTogether(cierre))
    flows.append(Spacer(1, 10))
    return flows


TOC = [
    ("intro", "Cómo usar esta guía", 0),
    ("antes", "Antes de empezar", 0),
]
TOC += [(c["key"], f'{c["id"]} · {c["titulo"]}', 1) for c in CASOS]
TOC += [("planilla", "Planilla de resultados", 0),
        ("reportar", "Cómo reportar una falla", 0)]


def tabla_toc():
    rows = []
    for key, label, lvl in TOC:
        pg = PAGEMAP.get(key, "")
        sangria = "" if lvl == 0 else "&nbsp;&nbsp;&nbsp;&nbsp;"
        estilo = ParagraphStyle("t", parent=S_TOC,
                                fontName=FB if lvl == 0 else F,
                                textColor=BRAND_DEEP if lvl == 0 else TEXT)
        rows.append([
            Paragraph(f'{sangria}<link href="#{key}" color="{(BRAND_DEEP if lvl == 0 else TEXT).hexval()}">'
                      f'{label}</link>', estilo),
            Paragraph(f'<link href="#{key}">{pg}</link>', S_TOC_N),
        ])
    t = Table(rows, colWidths=[CW - 16 * mm, 16 * mm])
    style = [
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i, (_, _, lvl) in enumerate(TOC):
        style.append(("LINEBELOW", (0, i), (-1, i), 0.4,
                      BORDER if lvl else colors.HexColor("#C4D3E0")))
    t.setStyle(TableStyle(style))
    return t


def leyenda_bloques():
    datos = [
        ("1 · Qué se prueba", "La funcionalidad que estás validando, en una línea.", BRAND, TINT_BRAND),
        ("2 · Precondición", "Lo que debe estar listo antes de empezar.", MUTED, TINT_MUTED),
        ("3 · Pasos", "Qué hacer, en orden y numerado.", ACCENT, TINT_ACCENT),
        ("4 · Resultado esperado", "Lo que deberías ver si todo funciona.", GREEN, TINT_GREEN),
        ("5 · Si falla", "Qué anotar y a quién avisar.", RED, TINT_RED),
    ]
    rows = []
    for titulo, desc, color, tint in datos:
        rows.append([
            "",
            Paragraph(f'<font color="{color.hexval()}"><b>{titulo}</b></font>', S_BODY_SM),
            Paragraph(desc, S_BODY_SM),
        ])
    t = Table(rows, colWidths=[BAR, 42 * mm, CW - BAR - 42 * mm])
    style = [
        ("LEFTPADDING", (0, 0), (0, -1), 0), ("RIGHTPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (-1, -1), 5), ("RIGHTPADDING", (1, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    for i, (_, _, color, tint) in enumerate(datos):
        style += [("BACKGROUND", (0, i), (0, i), color),
                  ("BACKGROUND", (1, i), (-1, i), tint)]
    t.setStyle(TableStyle(style))
    return t


def leyenda_badges():
    rows = [[badge(*OK), Paragraph("La funcionalidad está construida: se prueba completa.", S_BODY_SM)],
            [badge(*LIM), Paragraph("Se prueba, pero hay una parte que todavía no está en "
                                    "servicio. La guía te dice cuál, para que no la reportes "
                                    "como error.", S_BODY_SM)],
            [badge(*NOD), Paragraph("La funcionalidad no está disponible en esta versión. Se "
                                    "prueba lo que sí existe alrededor.", S_BODY_SM)]]
    t = Table(rows, colWidths=[40 * mm, CW - 40 * mm])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
    ]))
    return t


def tabla_planilla():
    head = [Paragraph("Caso", S_TH), Paragraph("Qué se prueba", S_TH),
            Paragraph("Resultado", S_TH), Paragraph("Observación", S_TH)]
    rows = [head]
    for c in CASOS:
        rows.append([
            Paragraph(c["id"], ParagraphStyle("x", parent=S_TD, fontName=FB, textColor=BRAND)),
            Paragraph(c["titulo"], S_TD),
            Paragraph("OK  /  Obs.  /  Falla", ParagraphStyle("y", parent=S_TD, textColor=MUTED)),
            Paragraph("", S_TD),
        ])
    t = Table(rows, colWidths=[15 * mm, 62 * mm, 30 * mm, CW - 107 * mm], repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(rows)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), BG))
    t.setStyle(TableStyle(style))
    return t


def build_story():
    s = []
    # Portada
    s += [Spacer(1, 1), NextPageTemplate("body"), PageBreak()]

    # Índice
    s.append(SectionMark("Índice"))
    s.append(Anchor("indice", "Índice", 0))
    s.append(Paragraph("Índice", S_H1))
    s.append(Paragraph("Pulsa cualquier línea para ir directamente a esa sección.", S_LEAD))
    s.append(Spacer(1, 4))
    s.append(tabla_toc())
    s.append(PageBreak())

    # Cómo usar esta guía
    s.append(SectionMark("Cómo usar esta guía"))
    s.append(Anchor("intro", "Cómo usar esta guía", 0))
    s.append(Paragraph("Cómo usar esta guía", S_H1))
    s.append(Paragraph(
        "Esta guía no describe la consola: te propone probarla. Cada sección es un caso de "
        "prueba independiente que puedes hacer en cinco o diez minutos, anotando al final si "
        "funcionó, si funcionó con observaciones o si falló.", S_LEAD))
    s.append(Paragraph("Los cinco bloques de cada caso", S_H2))
    s.append(Paragraph(
        "Todos los casos tienen la misma estructura, siempre en el mismo orden y siempre con "
        "el mismo color:", S_BODY))
    s.append(Spacer(1, 5))
    s.append(leyenda_bloques())
    s.append(Spacer(1, 9))
    s.append(Paragraph("Las etiquetas de estado", S_H2))
    s.append(Paragraph(
        "Junto al título de cada caso hay una etiqueta que te adelanta con qué te vas a "
        "encontrar:", S_BODY))
    s.append(Spacer(1, 5))
    s.append(leyenda_badges())
    s.append(Spacer(1, 9))
    s.append(Paragraph("Tres recomendaciones", S_H2))
    s += bullets([
        "<b>Haz los casos en orden.</b> Varios se apoyan en lo que dejó el anterior: la "
        "solicitud que creas en CP-08 es la que usarás en CP-11, CP-13 y CP-14.",
        "<b>Anota mientras pruebas, no después.</b> Al final de esta guía hay una planilla "
        "para marcar el resultado de cada caso.",
        "<b>Una captura vale por media página de explicación.</b> Con la tecla "
        "<b>Impr Pant</b> capturas la pantalla completa; pégala en un correo o en un "
        "documento junto con la hora.",
    ])
    s.append(PageBreak())

    # Antes de empezar
    s.append(SectionMark("Antes de empezar"))
    s.append(Anchor("antes", "Antes de empezar", 0))
    s.append(Paragraph("Antes de empezar", S_H1))
    s.append(Paragraph(
        "Reúne esto antes del primer caso; te evita interrumpir la prueba a la mitad.", S_LEAD))
    s.append(Spacer(1, 3))
    s.append(callout("Lo que necesitas tener a mano", bullets([
        "La dirección de la consola de pruebas y tu cuenta de acceso autorizada.",
        "Google Chrome o Microsoft Edge actualizado. La consola está pensada para pantalla de "
        "computador, no de teléfono.",
        "Dos archivos de prueba distintos, en PDF o imagen, de menos de 10 MB cada uno.",
        "Datos de una solicitud de ejemplo: cliente, tipo de informe, dirección, comuna, RUT "
        "del comprador y un teléfono de contacto de visita.",
        "Un cuaderno o un documento abierto para anotar, además de la planilla del final.",
    ]), BRAND, TINT_BRAND))
    s.append(Spacer(1, 6))
    s.append(callout("Lo que conviene saber antes", bullets([
        "<b>Estás en un ambiente de pruebas.</b> Puedes crear solicitudes, subir archivos y "
        "asignar tasadores sin miedo: no afecta a la operación real.",
        "<b>Hay funciones que todavía no están.</b> La guía las señala con una etiqueta "
        "ámbar o roja y te explica el motivo. No hace falta que las reportes.",
        "<b>Nada de lo que hagas se pierde por equivocarte.</b> La única acción que no tiene "
        "vuelta atrás es asignar un tasador: por eso el sistema te pide confirmarla.",
        "<b>Si algo se ve raro, la primera prueba es recargar la página.</b> Si tras recargar "
        "sigue raro, es una falla que vale la pena anotar.",
    ]), MUTED, TINT_MUTED))
    s.append(Spacer(1, 6))
    s.append(nota(
        "Un aviso sobre los tiempos: la consola trabaja contra un servicio en la nube, así que "
        "algunas acciones tardan un par de segundos. Mientras tanto, los botones se bloquean y "
        "muestran su acción en curso —<b>Creando…</b>, <b>Guardando…</b>, <b>Asignando…</b>—. "
        "Ese bloqueo es intencional: evita que una acción se ejecute dos veces. Espera a que "
        "termine antes de volver a pulsar.",
        titulo="Nota sobre los tiempos de respuesta"))
    s.append(PageBreak())

    # Casos
    # Los casos fluyen uno tras otro. Una página por caso dejaría medias páginas
    # en blanco cada vez que un caso trae figura; la banda azul de cabecera ya
    # separa visualmente un caso del siguiente.
    for i, c in enumerate(CASOS):
        s += bloque_caso(c)
        if i < len(CASOS) - 1:
            s.append(Spacer(1, 14))
    s.append(PageBreak())

    # Planilla
    s.append(SectionMark("Planilla de resultados"))
    s.append(Anchor("planilla", "Planilla de resultados", 0))
    s.append(Paragraph("Planilla de resultados", S_H1))
    s.append(Paragraph(
        "Marca el resultado de cada caso a medida que lo pruebas. Puedes imprimir esta página "
        "y rellenarla a mano, o anotar sobre el archivo.", S_LEAD))
    s.append(Spacer(1, 4))
    s.append(tabla_planilla())
    s.append(Spacer(1, 8))
    s.append(Paragraph(
        "<b>OK</b>: ocurrió todo lo del bloque «Resultado esperado». &nbsp; "
        "<b>Obs.</b>: funcionó, pero algo no se entendía o costó encontrarlo. &nbsp; "
        "<b>Falla</b>: algo del resultado esperado no ocurrió.", S_MUTED))
    s.append(PageBreak())

    # Cómo reportar
    s.append(SectionMark("Cómo reportar una falla"))
    s.append(Anchor("reportar", "Cómo reportar una falla", 0))
    s.append(Paragraph("Cómo reportar una falla", S_H1))
    s.append(Paragraph(
        "Un reporte útil se responde el mismo día; uno incompleto obliga a volver a "
        "preguntarte. Con estos cinco datos basta.", S_LEAD))
    s.append(Spacer(1, 3))
    s.append(callout("Los cinco datos de un buen reporte", [steps_table([
        "<b>El caso y el paso.</b> Por ejemplo: «CP-13, paso 8».",
        "<b>El código de la solicitud</b> con la que estabas trabajando (VP-AAAA-NNNN).",
        "<b>La hora exacta</b> en que ocurrió, con minutos.",
        "<b>Qué esperabas y qué pasó</b>, en una línea cada uno.",
        "<b>Una captura de pantalla completa</b>, incluyendo la barra de direcciones del "
        "navegador.",
    ])], BRAND, TINT_BRAND))
    s.append(Spacer(1, 6))
    s.append(callout("Antes de reportar, dos comprobaciones rápidas", bullets([
        "<b>Recarga la página</b> y repite el último paso. Muchas veces la pantalla se quedó "
        "atrás y el dato sí se guardó.",
        "<b>Comprueba en la lista</b> si la solicitud quedó creada o modificada igual: "
        "distinguir «no se guardó» de «no se refrescó la pantalla» ahorra medio día de "
        "revisión.",
    ]), MUTED, TINT_MUTED))
    s.append(Spacer(1, 6))
    s.append(callout("Avisa de inmediato, sin esperar a terminar la guía, si:", bullets([
        "La consola se abre sin pedir identificación en una ventana de incógnito (CP-15).",
        "Un archivo adjunto desaparece sin que el sistema te haya pedido confirmación (CP-11).",
        "Una solicitud ya asignada permite editarse (CP-14).",
        "Aparecen datos de una solicitud distinta a la que abriste (CP-12).",
    ]), RED, TINT_RED))
    s.append(Spacer(1, 8))
    s.append(Rule())
    s.append(Spacer(1, 4))
    s.append(Paragraph(
        f"VProperty · Consola Ejecutiva Comercial (IF-02 · CU-002) · Guía de pruebas {VERSION} · "
        f"{FECHA}. Este documento reemplaza al manual de prueba anterior y conserva sus "
        f"imágenes. Las funcionalidades descritas corresponden a la especificación del "
        f"proyecto v1.9.8.", S_MUTED))
    return s


# ─────────────────────────────────────────────────────────────────────────────
# Documento
# ─────────────────────────────────────────────────────────────────────────────
def make_doc(target):
    doc = BaseDocTemplate(
        target, pagesize=A4,
        leftMargin=LM, rightMargin=RM, topMargin=TOP, bottomMargin=BOT,
        title="Guía de pruebas · Consola Ejecutiva Comercial (IF-02)",
        author="VProperty · Tasaciones y Bienes Raíces",
        subject="Manual de usuario orientado a pruebas de la UI Ejecutiva · CU-002",
        creator="VProperty",
    )
    frame_cover = Frame(0, 0, PW, PH, id="cover", showBoundary=0,
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frame_body = Frame(LM, BOT, CW, PH - TOP - BOT, id="body", showBoundary=0,
                       leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame_cover], onPage=cover_page),
        PageTemplate(id="body", frames=[frame_body], onPageEnd=body_chrome),
    ])
    return doc


def main():
    # 1ª pasada: resolver los números de página del índice.
    buf = io.BytesIO()
    make_doc(buf).build(build_story(), canvasmaker=NumberedCanvas)
    # 2ª pasada: documento final, ya con el índice paginado.
    make_doc(OUT).build(build_story(), canvasmaker=NumberedCanvas)
    print("OK ->", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
