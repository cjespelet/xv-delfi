from pathlib import Path
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "cliente" / "shots"
OUT = ROOT / "cliente"

GROUPS = {
    "01-arriba.jpg": ["hero", "countdown", "agenda", "fiesta", "dress"],
    "02-abajo.jpg": ["regalos", "urna", "playlist", "confirmar", "footer"],
}

GAP = 0
BG = (244, 242, 239)


def stack(names: list[str]) -> Image.Image:
    imgs = [Image.open(SHOTS / f"{n}.png").convert("RGB") for n in names]
    width = max(im.width for im in imgs)
    height = sum(im.height for im in imgs) + GAP * (len(imgs) - 1)
    canvas_im = Image.new("RGB", (width, height), BG)
    y = 0
    for im in imgs:
        x = (width - im.width) // 2
        canvas_im.paste(im, (x, y))
        y += im.height + GAP
    return canvas_im


def save_jpeg(im: Image.Image, path: Path) -> None:
    im.save(path, "JPEG", quality=88, optimize=True, progressive=True)


pages = []
for filename, names in GROUPS.items():
    im = stack(names)
    path = OUT / filename
    save_jpeg(im, path)
    pages.append(path)
    print(path.name, im.size)

pdf_path = OUT / "preview-xv-delfi.pdf"
pw, ph = A4
c = canvas.Canvas(str(pdf_path), pagesize=A4)
margin = 10 * mm
for path in pages:
    im = Image.open(path)
    max_w = pw - 2 * margin
    max_h = ph - 2 * margin
    scale = min(max_w / im.width, max_h / im.height)
    w, h = im.width * scale, im.height * scale
    x = (pw - w) / 2
    y = (ph - h) / 2
    c.drawImage(str(path), x, y, width=w, height=h, preserveAspectRatio=True, mask="auto")
    c.showPage()
c.save()
print(pdf_path.name)
