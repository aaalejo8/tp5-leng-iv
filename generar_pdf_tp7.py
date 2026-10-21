"""Genera el PDF de entrega con reproducciones fieles del código actual."""

from pathlib import Path
import textwrap
import re

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'TP7_Lenguajes_IV_Almada_Alejo_Matias.pdf'
W, H = 1654, 2339  # A4 a 200 ppp
MARGIN = 120
BOTTOM = 2190
FONT_DIR = Path('C:/Windows/Fonts')
regular = ImageFont.truetype(str(FONT_DIR / 'arial.ttf'), 27)
bold = ImageFont.truetype(str(FONT_DIR / 'arialbd.ttf'), 29)
title_font = ImageFont.truetype(str(FONT_DIR / 'arialbd.ttf'), 68)
small = ImageFont.truetype(str(FONT_DIR / 'arial.ttf'), 23)
code_font = ImageFont.truetype(str(FONT_DIR / 'consola.ttf'), 21)
code_bold = ImageFont.truetype(str(FONT_DIR / 'consolab.ttf'), 21)

INK = '#17382a'
GREEN = '#237454'
MUTED = '#617468'
PAPER = '#fbfcfa'
DARK = '#111b23'
CODE = '#e7edf2'
pages = []


def new_page(number, section, heading, description=''):
    image = Image.new('RGB', (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W, 18), fill=GREEN)
    draw.text((MARGIN, 94), section.upper(), font=bold, fill=GREEN)
    draw.text((MARGIN, 151), heading, font=title_font, fill=INK)
    y = 252
    if description:
        y = paragraph(draw, description, MARGIN, y, W - 2 * MARGIN, small, MUTED, 36) + 24
    draw.line((MARGIN, H - 114, W - MARGIN, H - 114), fill='#dbe6dd', width=2)
    draw.text((MARGIN, H - 86), 'Lenguajes IV · TP N.º 7', font=small, fill=MUTED)
    draw.text((W - MARGIN - 32, H - 86), f'{number:02}', font=small, fill=MUTED)
    pages.append(image)
    return draw, y


def paragraph(draw, text, x, y, width, font, fill, line_height):
    words = text.split()
    line = ''
    for word in words:
        candidate = f'{line} {word}'.strip()
        if line and draw.textlength(candidate, font=font) > width:
            draw.text((x, y), line, font=font, fill=fill)
            y += line_height
            line = word
        else:
            line = candidate
    if line:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height
    return y


HIGHLIGHT = re.compile(r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"|\b(?:import|from|function|return|const|new|async|await|if|export|default|let|var)\b|\b\d+\b")


def code_panel(draw, y, filename, first, last):
    path = ROOT / filename
    source = path.read_text(encoding='utf-8').splitlines()
    assert 1 <= first <= last <= len(source), (filename, first, last)
    visual_lines = []
    for number in range(first, last + 1):
        line = source[number - 1].expandtabs(2)
        chunks = textwrap.wrap(line, width=99, break_long_words=True,
                               break_on_hyphens=False, replace_whitespace=False,
                               drop_whitespace=False) or ['']
        for index, chunk in enumerate(chunks):
            visual_lines.append((str(number) if index == 0 else '', chunk))

    height = 62 + len(visual_lines) * 29 + 19
    if y + height > BOTTOM:
        raise ValueError(f'El panel {filename}:{first}-{last} excede la página: {y + height} > {BOTTOM}')
    left, right = MARGIN, W - MARGIN
    draw.rounded_rectangle((left, y, right, y + height), radius=14, fill=DARK)
    draw.rounded_rectangle((left, y, right, y + 61), radius=14, fill='#1b2b33')
    draw.rectangle((left, y + 47, right, y + 61), fill='#1b2b33')
    draw.ellipse((left + 23, y + 23, left + 36, y + 36), fill='#f0837b')
    draw.ellipse((left + 45, y + 23, left + 58, y + 36), fill='#e6be68')
    draw.ellipse((left + 67, y + 23, left + 80, y + 36), fill='#72c99c')
    label = f'{filename}   ·   líneas {first}–{last}'
    draw.text((left + 107, y + 16), label, font=small, fill='#dce7e1')
    row_y = y + 73
    for number, line in visual_lines:
        draw.text((left + 20, row_y), number.rjust(3), font=code_font, fill='#73838d')
        x = left + 99
        position = 0
        for match in HIGHLIGHT.finditer(line):
            plain = line[position:match.start()]
            draw.text((x, row_y), plain, font=code_font, fill=CODE)
            x += draw.textlength(plain, font=code_font)
            value = match.group()
            color = '#a8dfac' if value[0] in ('\"', "'") else '#f2c47e' if value[0].isdigit() else '#d6a5ef'
            font = code_bold if color == '#d6a5ef' else code_font
            draw.text((x, row_y), value, font=font, fill=color)
            x += draw.textlength(value, font=font)
            position = match.end()
        remainder = line[position:]
        draw.text((x, row_y), remainder, font=code_font, fill=CODE)
        if x + draw.textlength(remainder, font=code_font) > right - 12:
            raise ValueError(f'Línea demasiado ancha en {filename}:{number}')
        row_y += 29
    return y + height + 24


# 1. Datos del alumno
draw, y = new_page(1, 'Lenguajes IV', 'Trabajo Práctico N.º 7')
draw.rounded_rectangle((MARGIN, 370, W - MARGIN, 1335), radius=24, fill='#edf5ef')
draw.text((MARGIN + 55, 440), 'DATOS DEL ALUMNO', font=bold, fill=GREEN)
details = [
    ('Alumno', 'Almada Alejo Matías'),
    ('DNI', '46055494'),
    ('Materia', 'Lenguajes IV'),
    ('Comisión', '1'),
]
row = 535
for label, value in details:
    draw.text((MARGIN + 55, row), label.upper(), font=small, fill=MUTED)
    draw.text((MARGIN + 55, row + 42), value, font=ImageFont.truetype(str(FONT_DIR / 'arialbd.ttf'), 43), fill=INK)
    row += 172
draw.text((MARGIN, 1460), 'React Router · API Blob · Diseño responsive', font=bold, fill=INK)
paragraph(draw, 'Proyecto React revisado y documentado con código extraído directamente de sus archivos.', MARGIN, 1524, W - 2 * MARGIN, regular, MUTED, 43)

# 2. Consigna completa
draw, y = new_page(2, 'Trabajo Práctico N.º 7', 'Consigna')
consigna = (
    'A partir de la imagen siguiente diseñar un proyecto en Visual Studio Code usando REACT, '
    'con el objetivo de utilizar el concepto de BLOB y Route. A ese proyecto en el Encabezado '
    'agregarle las rutas del NAV para acceder al Inicio, proyectoBlob, Acerca de nosotros y el Contacto. '
    'Si bien la imagen del presente TP es genérica se evaluará el diseño con sus respectivas hojas de estilos. '
    'Presentar el TP en la plataforma de trabajos prácticos con capturas de pantalla en Word o PDF el código realizado.'
)
draw.rounded_rectangle((MARGIN, 340, W - MARGIN, 760), radius=20, fill='#edf5ef')
paragraph(draw, consigna, MARGIN + 52, 406, W - 2 * MARGIN - 104, regular, INK, 48)

# 3. Desarrollo: rutas y encabezado
draw, y = new_page(3, 'Trabajo Práctico N.º 7', 'Desarrollo',
                   'Rutas y encabezado. Reproducciones del código real con formato de editor; no son capturas de Visual Studio Code.')
y = code_panel(draw, y, 'src/App.js', 80, 99)
y = code_panel(draw, y, 'src/components/Header.js', 1, 22)

# 4. Componentes de página
draw, y = new_page(4, 'Desarrollo', 'Páginas: Inicio y Acerca')
y = code_panel(draw, y, 'src/App.js', 7, 39)
y = code_panel(draw, y, 'src/App.js', 40, 61)

# 5. Contacto y montaje de Router
draw, y = new_page(5, 'Desarrollo', 'Contacto y BrowserRouter')
y = code_panel(draw, y, 'src/App.js', 62, 79)
y = code_panel(draw, y, 'src/index.js', 1, 15)

# 6. Creación del Blob
draw, y = new_page(6, 'Desarrollo', 'Creación del Blob')
y = code_panel(draw, y, 'src/components/BlobPage.js', 1, 25)

# 7. Descarga y slice()
draw, y = new_page(7, 'Desarrollo', 'Descarga y recorte con slice()')
y = code_panel(draw, y, 'src/components/BlobPage.js', 26, 46)
y = code_panel(draw, y, 'src/components/BlobPage.js', 47, 67)

# 8. Interfaz de Blob
draw, y = new_page(8, 'Desarrollo', 'Interfaz y resultados del Blob')
y = code_panel(draw, y, 'src/components/BlobPage.js', 68, 99)

# 9. Estilos principales
draw, y = new_page(9, 'Desarrollo', 'Estilos del encabezado e inicio')
y = code_panel(draw, y, 'src/App.css', 25, 46)
y = code_panel(draw, y, 'src/App.css', 65, 86)
y = code_panel(draw, y, 'src/App.css', 97, 108)

# 10. Estilos de la página Blob
draw, y = new_page(10, 'Desarrollo', 'Estilos del laboratorio Blob')
y = code_panel(draw, y, 'src/App.css', 385, 400)
y = code_panel(draw, y, 'src/App.css', 429, 450)
y = code_panel(draw, y, 'src/App.css', 461, 470)

# 11. Estilos responsive
draw, y = new_page(11, 'Desarrollo', 'Adaptación a móviles')
y = code_panel(draw, y, 'src/App.css', 504, 520)
y = code_panel(draw, y, 'src/App.css', 545, 567)
y = code_panel(draw, y, 'src/App.css', 604, 615)

pages[0].save(OUTPUT, 'PDF', resolution=200, save_all=True, append_images=pages[1:])
print(OUTPUT)
