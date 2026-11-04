"""Saca del HTML capturado del sitio actual el título y el texto de las páginas de Shopify y de las políticas.

El texto de las páginas (Preguntas frecuentes, Reseñas, Compartir carrito…) y de las políticas no viene en el tema:
vive en el administrador de Shopify. Aquí se toma de la página ya dibujada, se limpia (solo etiquetas de formato,
fotos y enlaces; nada de estilos, scripts ni código de apps) y las fotos de la tienda pasan a /media/files/.

Uso: python3 -I herramientas/extraer-paginas.py
Salida: contenido/paginas.json y contenido/politicas.json (si falta alguna foto, se descarga en public/media/files/).
"""

import html
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlparse

RAIZ = Path(__file__).resolve().parent.parent
CAPTURAS = RAIZ / "docs/sitio-actual/capturas/2026-11-03"
FOTOS = RAIZ / "public/media/files"
SERVIDORES = {"cdn.shopify.com", "www.diluvium.com.mx"}

PAGINAS = ["nosotros", "contacto", "instalacion", "distribuidor", "preguntas-frecuentes", "resenas", "compartir-carrito"]
POLITICAS = ["politica-privacidad", "politica-reembolso", "terminos"]

# Etiquetas que se conservan y atributos permitidos en cada una.
ETIQUETAS = {
    "p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "img", "div", "table", "thead", "tbody", "tr", "td", "th", "hr",
}
ATRIBUTOS = {"a": {"href"}, "img": {"src", "alt", "width", "height"}, "div": {"id"}}
# Estilos en línea que sí cambian cómo se ve (fotos centradas).
ESTILOS = {"display: block", "margin-left: auto", "margin-right: auto"}


def foto_local(url: str) -> str:
    """URL de la tienda → /media/files/<archivo> (descarga el archivo si no está)."""
    if url.startswith("//"):
        url = "https:" + url
    partes = urlparse(url)
    if partes.hostname not in SERVIDORES or "/files/" not in partes.path:
        return url
    nombre = unquote(partes.path.split("/")[-1])
    destino = FOTOS / nombre
    if not destino.exists():
        print("descargando", nombre)
        with urllib.request.urlopen(f"https://{partes.hostname}{partes.path}", timeout=30) as r:
            destino.write_bytes(r.read())
    return f"/media/files/{nombre}"


def limpiar(fragmento: str) -> str:
    fragmento = re.sub(r"<(script|style|svg|noscript)[\s\S]*?</\1>", "", fragmento, flags=re.I)
    fragmento = re.sub(r"<!--[\s\S]*?-->", "", fragmento)

    def etiqueta(m: re.Match) -> str:
        cierre, nombre, atributos = m.group(1), m.group(2).lower(), m.group(3)
        if nombre not in ETIQUETAS:
            return ""
        if cierre:
            return f"</{nombre}>"
        salida = []
        for clave, valor in re.findall(r'([a-zA-Z-]+)="([^"]*)"', atributos):
            clave = clave.lower()
            valor = html.unescape(valor)
            if clave == "style" and nombre == "img":
                propios = [e.strip() for e in valor.split(";") if e.strip() in ESTILOS]
                if propios:
                    salida.append(f'style="{"; ".join(propios)}"')
                continue
            if clave not in ATRIBUTOS.get(nombre, set()):
                continue
            if clave == "src":
                valor = foto_local(valor)
            if clave == "href" and not re.match(r"^(https?://|/|#|tel:|mailto:)", valor):
                continue
            salida.append(f'{clave}="{html.escape(valor, quote=True)}"')
        return f"<{nombre}{(' ' + ' '.join(salida)) if salida else ''}>"

    fragmento = re.sub(r"<(/?)([a-zA-Z0-9]+)([^>]*)>", etiqueta, fragmento)
    return fragmento.strip()


def datos_generales(h: str) -> dict:
    titulo = html.unescape(re.search(r"<title>(.*?)</title>", h, re.S).group(1)).strip().split("\n")[0].strip()
    titulo = re.sub(r"\s*–\s*Diluvium$", "", titulo)
    canonica = re.search(r'<link rel="canonical" href="([^"]+)"', h).group(1)
    return {"ruta": urlparse(canonica).path, "titulo": titulo}


def bloque(h: str, inicio: int) -> str:
    """HTML desde la etiqueta que empieza en «inicio» hasta su cierre (cuenta los <div> anidados)."""
    nivel = 0
    for m in re.finditer(r"<(/?)div\b[^>]*>", h[inicio:]):
        nivel += -1 if m.group(1) else 1
        if nivel == 0:
            return h[inicio:inicio + m.end()]
    return h[inicio:]


def pagina(nombre: str) -> dict:
    h = (CAPTURAS / f"{nombre}.html").read_text()
    datos = datos_generales(h)
    datos["nombre"] = datos["ruta"].split("/")[-1]
    principal = re.search(r'data-ui-component="Main Page Section"', h)
    titulo_visible, cuerpo = "", ""
    if principal:
        seccion = bloque(h, h.rfind("<div", 0, principal.start()))
        t = re.search(r'<h2 class="s-header__title[^"]*">(.*?)</h2>', seccion, re.S)
        titulo_visible = html.unescape(t.group(1)).strip() if t else ""
        c = re.search(r'<div class="s-content[^"]*">', seccion)
        if c:
            contenido = bloque(seccion, c.start())
            contenido = contenido[contenido.find(">") + 1:contenido.rfind("</div>")]
            # La lista de reseñas la dibuja la app Trustoo: la réplica la arma con contenido/resenas.json.
            cuerpo = "" if "vstar-all-reviews" in contenido else limpiar(contenido)
    datos["tituloVisible"] = titulo_visible
    datos["cuerpo"] = cuerpo
    return datos


def politica(nombre: str) -> dict:
    h = (CAPTURAS / f"{nombre}.html").read_text()
    datos = datos_generales(h)
    datos["nombre"] = datos["ruta"].split("/")[-1]
    t = re.search(r'<div class="shopify-policy__title">\s*<h1>(.*?)</h1>', h, re.S)
    datos["tituloVisible"] = html.unescape(t.group(1)).strip() if t else datos["titulo"]
    c = re.search(r'<div class="shopify-policy__body">\s*<div class="rte">', h)
    cuerpo = bloque(h, c.end() - len('<div class="rte">'))
    datos["cuerpo"] = limpiar(cuerpo[cuerpo.find(">") + 1:cuerpo.rfind("</div>")])
    return datos


def main() -> None:
    paginas = [pagina(n) for n in PAGINAS]
    politicas = [politica(n) for n in POLITICAS]
    nota = "Sacado de docs/sitio-actual/capturas/2026-11-03 con herramientas/extraer-paginas.py"
    (RAIZ / "contenido/paginas.json").write_text(
        json.dumps({"fuente": nota, "paginas": paginas}, ensure_ascii=False, indent=1) + "\n")
    (RAIZ / "contenido/politicas.json").write_text(
        json.dumps({"fuente": nota, "politicas": politicas}, ensure_ascii=False, indent=1) + "\n")
    for p in paginas + politicas:
        print(f"{p['ruta']}: «{p['titulo']}» · {len(p['cuerpo'])} caracteres")


if __name__ == "__main__":
    main()
