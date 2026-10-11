from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "cliente" / "shots"
OUT = ROOT / "cliente" / "propuesta-invitacion-xv-delfi.pdf"

INK = HexColor("#1a1a1a")
VOID = HexColor("#050505")
CREAM = HexColor("#f4f2ef")
MUTED = HexColor("#6b6560")
LINE = HexColor("#d8d3cd")
PRICE = HexColor("#111111")

MODULES = [
    {
        "n": "01",
        "shot": "hero.png",
        "name": "Portada",
        "lead": "La primera pantalla. Es lo que se ve al abrir el link.",
        "body": "Fondo negro, bolas disco y destellos. Aparece el nombre de la festejada y la fecha de la noche. Es la tapa de la invitación: tiene que emocionar en el primer segundo, igual que una tarjeta impresa, pero en el celular.",
        "edit": "Nombre, fecha y textos de apertura.",
    },
    {
        "n": "02",
        "shot": "countdown.png",
        "name": "Cuenta regresiva",
        "lead": "“Falta muy poco”, con el tiempo en vivo.",
        "body": "Los números bajan solos (días, horas, minutos y segundos) hasta el sábado 7 de noviembre a las 21 hs. Le da urgencia y ganas de guardar la fecha. No hay que actualizar nada: corre solo.",
        "edit": "La fecha y hora del evento.",
    },
    {
        "n": "03",
        "shot": "agenda.png",
        "name": "Agendá la fecha",
        "lead": "Un toque y la fiesta queda en el calendario del invitado.",
        "body": "Muestra el día y la hora, con botones para Google Calendar y para iPhone. Evita el “¿cuándo era?” y baja las ausencias por olvido.",
        "edit": "Día, hora y el evento que se guarda en el calendario.",
    },
    {
        "n": "04",
        "shot": "fiesta.png",
        "name": "La fiesta",
        "lead": "Dónde es, a qué hora y cómo llegar.",
        "body": "Tarjeta negra con el salón, la dirección y el horario. El botón “Cómo llegar” abre Google Maps. Hoy está de demo (“a confirmar”); el día que tengan salón se completa y queda listo.",
        "edit": "Nombre del salón, dirección y link de Maps.",
    },
    {
        "n": "05",
        "shot": "dress.png",
        "name": "Dress code",
        "lead": "Cómo vestirse, sin vueltas.",
        "body": "El look de la noche: Elegante, con íconos a los costados del título. Un texto corto invita a ir con su mejor versión. Claro para ellas y ellos, sin etiquetas.",
        "edit": "El código de vestimenta y el texto.",
    },
    {
        "n": "06",
        "shot": "regalos.png",
        "name": "Un detallito",
        "lead": "Si quieren hacer un regalo, transferís al alias.",
        "body": "Deja claro que lo importante es que estén, y ofrece el alias para una transferencia. Al tocar el alias se copia solo: no hay que tipear. El alias de la demo se cambia por el real.",
        "edit": "Alias, titular y el texto del módulo.",
    },
    {
        "n": "07",
        "shot": "urna.png",
        "name": "La urna",
        "lead": "No es para regalos: es para palabras.",
        "body": "Explica que en la fiesta va a haber una urna para escribirle una palabra, una frase o un recuerdo de esa noche. También se puede dejar una frase al confirmar. Es el gesto íntimo de la celebración.",
        "edit": "El texto que explica la urna.",
    },
    {
        "n": "08",
        "shot": "playlist.png",
        "name": "La playlist",
        "lead": "Los invitados piden el tema que no puede faltar.",
        "body": "Buscan una canción o un artista y tocan Pedir. Hay un botón para abrir la playlist de Spotify de la festejada. Los pedidos llegan por mail a los organizadores para armar la noche.",
        "edit": "El link de la playlist y el mail donde caen los pedidos.",
    },
    {
        "n": "09",
        "shot": "confirmar.png",
        "name": "Confirmación",
        "lead": "¿Venís? Nombre, cantidad de personas y una frase.",
        "body": "Formulario corto: nombre, si va o no, cuántos son (de 1 a 8) y una palabra o frase opcional para ella. Al confirmar, la respuesta llega por mail. Sin app, sin usuario: un toque y listo.",
        "edit": "El mail donde quieren recibir las confirmaciones.",
    },
]


def styles():
    return {
        "kicker": ParagraphStyle(
            "kicker",
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=MUTED,
            tracking=1.4,
            alignment=TA_LEFT,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=30,
            textColor=white,
            alignment=TA_LEFT,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=INK,
        ),
        "lead": ParagraphStyle(
            "lead",
            fontName="Helvetica-Oblique",
            fontSize=11,
            leading=15,
            textColor=INK,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=INK,
            alignment=TA_JUSTIFY,
        ),
        "small": ParagraphStyle(
            "small",
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=MUTED,
        ),
        "cover_kicker": ParagraphStyle(
            "cover_kicker",
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=HexColor("#c8c8c8"),
            alignment=TA_CENTER,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=34,
            textColor=white,
            alignment=TA_CENTER,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName="Helvetica",
            fontSize=12,
            leading=17,
            textColor=HexColor("#f2f2f2"),
            alignment=TA_CENTER,
        ),
        "price": ParagraphStyle(
            "price",
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=36,
            textColor=PRICE,
            alignment=TA_CENTER,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=INK,
            leftIndent=12,
            bulletIndent=0,
        ),
    }


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(VOID)
    canvas.rect(0, A4[1] - 18 * mm, A4[0], 18 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, A4[1] - 11 * mm, "INVITACION DIGITAL  ·  MIS XV — DELFI")
    canvas.drawRightString(A4[0] - 18 * mm, A4[1] - 11 * mm, "PROPUESTA")
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], 14 * mm, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 6 * mm, "https://cjespelet.github.io/xv-delfi/")
    canvas.drawRightString(A4[0] - 18 * mm, 6 * mm, f"{doc.page}")
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(VOID)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(HexColor("#c8c8c8"))
    canvas.setLineWidth(0.4)
    canvas.line(30 * mm, 40 * mm, A4[0] - 30 * mm, 40 * mm)
    canvas.setFillColor(HexColor("#c8c8c8"))
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 28 * mm, "DEMO EN LINEA")
    canvas.setFillColor(white)
    canvas.setFont("Helvetica", 9)
    canvas.drawCentredString(A4[0] / 2, 22 * mm, "https://cjespelet.github.io/xv-delfi/")
    canvas.restoreState()


def module_block(s, item):
    shot = SHOTS / item["shot"]
    img = Image(str(shot))
    max_w, max_h = 78 * mm, 118 * mm
    ratio = min(max_w / img.imageWidth, max_h / img.imageHeight)
    img.drawWidth = img.imageWidth * ratio
    img.drawHeight = img.imageHeight * ratio

    text = [
        Paragraph(f"MODULO {item['n']}", s["kicker"]),
        Spacer(1, 2 * mm),
        Paragraph(item["name"], s["h2"]),
        Spacer(1, 3 * mm),
        Paragraph(item["lead"], s["lead"]),
        Spacer(1, 3 * mm),
        Paragraph(item["body"], s["body"]),
        Spacer(1, 4 * mm),
        Paragraph(f"<b>Se personaliza:</b> {item['edit']}", s["small"]),
    ]
    table = Table([[img, text]], colWidths=[88 * mm, 86 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (0, 0), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 6 * mm),
                ("LEFTPADDING", (1, 0), (1, 0), 4 * mm),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return KeepTogether([Spacer(1, 8 * mm), table])


def main():
    s = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=26 * mm,
        bottomMargin=20 * mm,
        title="Propuesta — Invitación digital XV Delfi",
        author="Invitación digital",
        subject="Propuesta comercial y recorrido de módulos",
    )

    story = []
    story.append(Spacer(1, 62 * mm))
    story.append(Paragraph("PROPUESTA COMERCIAL", s["cover_kicker"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Invitación digital<br/>Mis XV — Delfi", s["cover_title"]))
    story.append(Spacer(1, 8 * mm))
    story.append(
        Paragraph(
            "Sábado 7 de noviembre de 2026 · 21 hs<br/>Una invitación para compartir por WhatsApp, con confirmación, playlist y todos los datos de la noche.",
            s["cover_sub"],
        )
    )
    story.append(PageBreak())

    story.append(Paragraph("Recorrido de la invitación", s["h2"]))
    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            "Abajo está cada módulo, con una captura real de la demo y una explicación de para qué sirve. Los textos, la fecha, el salón y el alias se cambian por los datos oficiales. La URL de la demo ya está online.",
            s["body"],
        )
    )

    for item in MODULES:
        story.append(module_block(s, item))
        story.append(Spacer(1, 6 * mm))

    story.append(PageBreak())
    story.append(Paragraph("Presupuesto", s["h2"]))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("$ 190.000", s["price"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Incluye", s["h2"]))
    story.append(Spacer(1, 3 * mm))
    included = [
        "Diseño completo (portada disco, tipografías y todos los módulos de esta propuesta).",
        "Personalización de nombre, fecha, salón, dirección, Maps, alias, textos y mail de confirmaciones.",
        "Confirmación de asistencia: las respuestas llegan por mail.",
        "Pedidos de canciones (buscador + Pedir) y link a la playlist de Spotify.",
        "Publicación online con URL para compartir.",
        "Una ronda de cambios de textos y datos, una vez enviada la info oficial.",
    ]
    for line in included:
        story.append(Paragraph(f"•  {line}", s["bullet"]))
        story.append(Spacer(1, 1.5 * mm))

    def first_page(canvas, doc):
        cover_page(canvas, doc)

    def later(canvas, doc):
        header_footer(canvas, doc)

    doc.build(story, onFirstPage=first_page, onLaterPages=later)
    print(OUT)


if __name__ == "__main__":
    main()
