"""Saca del HTML capturado del sitio actual los artículos del blog completos (para /blogs/blog y cada artículo).

Por artículo guarda lo que la página muestra al público: título, dirección, fecha, resumen, foto principal, autor,
etiquetas, el cuerpo (HTML del artículo), los enlaces «Anterior» / «Siguiente» y los datos para buscadores (título,
descripción, foto). Las fotos del cuerpo se descargan a public/media/articles/ y el cuerpo apunta a esas copias; los
enlaces a la tienda quedan como rutas propias (/products/…).

Uso: python3 -I herramientas/extraer-articulos.py [--sin-fotos]
Entrada: docs/sitio-actual/capturas/2026-11-03/blog.html y blog-*.html (los artículos, por su dirección canónica)
Salida: contenido/blog.json (mismos campos que usa la portada + los del artículo) y public/media/articles/
"""

import html
import json
import re
import struct
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

RAIZ = Path(__file__).resolve().parent.parent
CAPTURAS = RAIZ / "docs/sitio-actual/capturas/2026-11-03"
FOTOS = RAIZ / "public/media/articles"
SALIDA = RAIZ / "contenido/blog.json"
SITIO = "https://www.diluvium.com.mx"
# Solo se descargan fotos de la tienda.
SERVIDORES = {"www.diluvium.com.mx", "cdn.shopify.com"}


def limpio(texto: str) -> str:
    """Texto plano: sin etiquetas, entidades resueltas y espacios normalizados."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", texto))).strip()


def descargar(url: str, destino: Path, sin_fotos: bool) -> None:
    if destino.exists() or sin_fotos:
        return
    if urlparse(url).hostname not in SERVIDORES:
        raise ValueError(f"servidor no permitido: {url}")
    destino.parent.mkdir(parents=True, exist_ok=True)
    peticion = urllib.request.Request(url, headers={"User-Agent": "web-diluvium-extractor/1.0"})
    with urllib.request.urlopen(peticion, timeout=30) as r:
        tipo = r.headers.get("Content-Type", "")
        if not tipo.startswith("image/"):
            raise ValueError(f"no es imagen ({tipo}): {url}")
        destino.write_bytes(r.read())


def medidas(ruta: Path) -> tuple[int, int] | None:
    """Ancho y alto de una foto PNG, JPG o GIF leyendo su cabecera."""
    if not ruta.exists():
        return None
    datos = ruta.read_bytes()
    if datos[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", datos[16:24])
    if datos[:6] in (b"GIF87a", b"GIF89a"):
        return struct.unpack("<HH", datos[6:10])
    if datos[:2] == b"\xff\xd8":
        i = 2
        while i < len(datos) - 9:
            if datos[i] != 0xFF:
                i += 1
                continue
            marca = datos[i + 1]
            largo = struct.unpack(">H", datos[i + 2 : i + 4])[0]
            if 0xC0 <= marca <= 0xCF and marca not in (0xC4, 0xC8, 0xCC):
                alto, ancho = struct.unpack(">HH", datos[i + 5 : i + 9])
                return ancho, alto
            i += 2 + largo
    return None


def url_absoluta(url: str) -> str:
    url = html.unescape(url)
    return "https:" + url if url.startswith("//") else url


def ruta_propia(href: str) -> str:
    """Los enlaces a la tienda quedan como rutas de este sitio («https://www.diluvium.com.mx/products/x» → «/products/x»)."""
    for base in (SITIO, "http://www.diluvium.com.mx", "https://diluvium.com.mx"):
        if href == base or href.startswith(base + "/"):
            return href[len(base) :] or "/"
    return href


def cuerpo_local(cuerpo: str, sin_fotos: bool) -> str:
    """Cuerpo del artículo con las fotos copiadas a public/media/articles/ y sin etiquetas que no muestran nada."""

    def foto(m: re.Match[str]) -> str:
        etiqueta = m.group(0)
        src = re.search(r'src="([^"]+)"', etiqueta)
        if not src:
            return ""
        original = url_absoluta(src.group(1)).split("?")[0]
        nombre = Path(urlparse(original).path).name
        descargar(original, FOTOS / nombre, sin_fotos)
        etiqueta = etiqueta.replace(src.group(0), f'src="/media/articles/{nombre}"')
        tam = medidas(FOTOS / nombre)
        if tam and "width=" not in etiqueta:
            # El tamaño natural de la foto (el que muestra la tienda) para que no brinque al cargar.
            etiqueta = etiqueta.replace("<img ", f'<img width="{tam[0]}" height="{tam[1]}" ', 1)
        return etiqueta

    cuerpo = re.sub(r"<img\b[^>]*>", foto, cuerpo)
    cuerpo = re.sub(r'href="([^"]*)"', lambda m: f'href="{ruta_propia(html.unescape(m.group(1)))}"', cuerpo)
    cuerpo = re.sub(r"<meta[^>]*>\n?", "", cuerpo)
    return cuerpo.strip()


def tarjetas_blog(sin_fotos: bool) -> list[dict]:
    """Tarjetas de /blogs/blog en el orden del sitio (más nuevo primero), con los mismos campos que usa la portada."""
    h = (CAPTURAS / "blog.html").read_text(encoding="utf-8")
    salida = []
    for tarjeta in re.split(r'<div class="sht-card card', h)[1:]:
        enlace = re.search(r'<h3[^>]*card__heading[^>]*>\s*<a href="([^"]+)">([\s\S]*?)</a>', tarjeta)
        if not enlace:
            continue
        imagen = re.search(r'<img src="([^"]+)" alt="([^"]*)"[^>]*?width="(\d+)" height="(\d+)"', tarjeta)
        fecha = re.search(r'<span class="d-inline-block">([\s\S]*?)</span>', tarjeta)
        resumen = re.search(r'class="card__excerpt[^"]*">([\s\S]*?)</p>', tarjeta)
        articulo = {
            "titulo": limpio(enlace.group(2)),
            "url": enlace.group(1),
            "fecha": limpio(fecha.group(1)) if fecha else "",
            "resumen": limpio(resumen.group(1)) if resumen else "",
        }
        if imagen:
            original = url_absoluta(imagen.group(1)).split("?")[0]
            nombre = Path(urlparse(original).path).name
            descargar(original, FOTOS / nombre, sin_fotos)
            articulo["imagen"] = {
                "src": f"/media/articles/{nombre}",
                "alt": limpio(imagen.group(2)),
                "ancho": int(imagen.group(3)),
                "alto": int(imagen.group(4)),
            }
        salida.append(articulo)
    return salida


def capturas_por_url() -> dict[str, str]:
    """HTML de cada artículo capturado, por su dirección («/blogs/blog/…»)."""
    salida = {}
    for archivo in sorted(CAPTURAS.glob("blog-*.html")):
        h = archivo.read_text(encoding="utf-8")
        canonica = re.search(r'<link rel="canonical" href="([^"]+)"', h)
        if canonica:
            salida[urlparse(canonica.group(1)).path] = h
    return salida


def meta(h: str, nombre: str) -> str:
    m = re.search(rf'<meta (?:name|property)="{re.escape(nombre)}" content="([^"]*)"', h)
    return html.unescape(m.group(1)) if m else ""


def detalle(h: str, sin_fotos: bool) -> dict:
    """Lo que trae la página de un artículo además de la tarjeta."""
    inicio = h.index('itemprop="articleBody"')
    inicio = h.index(">", inicio) + 1
    fin = h.index('<ul class="mt-32', inicio)
    cuerpo = h[inicio:fin].strip()
    if not cuerpo.endswith("</div>"):
        raise ValueError("no se encontró el final del cuerpo del artículo")
    cuerpo = cuerpo[: -len("</div>")]

    etiquetas_html = re.search(r'<ul class="mt-32[^"]*">([\s\S]*?)</ul>', h[fin:])
    etiquetas = [
        {"nombre": limpio(t.group(2)), "url": t.group(1)}
        for t in re.finditer(r'<a href="([^"]+)"[^>]*>([\s\S]*?)</a>', etiquetas_html.group(1) if etiquetas_html else "")
    ]
    autor = re.search(r'<span class="[^"]*d-inline-block">\s*Por ([^<]+?)\s*</span>', h)
    publicado = re.search(r'"datePublished": "([^"]+)"', h)
    navegacion = re.search(r'<div class="d-flex mt-32[^"]*">([\s\S]*?)</div>', h[fin:])
    anterior = siguiente = None
    for enlace in re.finditer(r'<a href="([^"]*)"[^>]*>([\s\S]*?)</a>', navegacion.group(1) if navegacion else ""):
        href = enlace.group(1)
        if href in ("", "#"):
            continue  # la tienda lo deja vacío y lo esconde
        if "Anterior" in enlace.group(2):
            anterior = href
        elif "Siguiente" in enlace.group(2):
            siguiente = href
    titulo_pagina = re.search(r"<title>([\s\S]*?)</title>", h)
    titulo_seo = limpio(titulo_pagina.group(1)).removesuffix("– Diluvium").strip() if titulo_pagina else ""
    return {
        "autor": autor.group(1).strip() if autor else "",
        "publicado": publicado.group(1) if publicado else "",
        "etiquetas": etiquetas,
        "anterior": anterior,
        "siguiente": siguiente,
        "seo": {"titulo": titulo_seo, "descripcion": re.sub(r"\s+", " ", meta(h, "description")).strip()},
        "cuerpo": cuerpo_local(cuerpo, sin_fotos),
    }


def main() -> None:
    sin_fotos = "--sin-fotos" in sys.argv
    paginas = capturas_por_url()
    articulos = []
    for tarjeta in tarjetas_blog(sin_fotos):
        h = paginas.get(tarjeta["url"])
        if not h:
            raise SystemExit(f"falta la captura del artículo {tarjeta['url']}")
        articulos.append({**tarjeta, "slug": tarjeta["url"].rsplit("/", 1)[-1], **detalle(h, sin_fotos)})
    blog = {
        "fuente": "Artículos de /blogs/blog y sus páginas, sacados del HTML capturado por herramientas/extraer-articulos.py",
        "articulos": articulos,
    }
    SALIDA.write_text(json.dumps(blog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for a in articulos:
        print(f"{a['slug']}: {len(a['cuerpo'])} caracteres de cuerpo, {a['cuerpo'].count('<img')} fotos")


if __name__ == "__main__":
    main()
