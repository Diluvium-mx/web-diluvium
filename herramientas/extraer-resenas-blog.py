"""Saca del HTML capturado del sitio actual las reseñas publicadas (Trustoo).

Solo guarda lo que la página muestra al público: nombre como aparece, estrellas, texto y fotos de cada reseña.
Nada de pedidos, correos ni teléfonos. Los artículos del blog ya no salen de aquí: contenido/blog.json lo genera
herramientas/extraer-articulos.py (con más campos; este script no lo toca).

Uso: python3 -I herramientas/extraer-resenas-blog.py [--sin-fotos]
Salida: contenido/resenas.json y las fotos de reseñas en public/media/resenas/
"""

import html
import json
import re
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

RAIZ = Path(__file__).resolve().parent.parent
PORTADA = RAIZ / "docs/sitio-actual/capturas/2026-11-03/portada.html"
RESENAS = RAIZ / "docs/sitio-actual/capturas/2026-10-31/resenas.html"
FOTOS_RESENAS = RAIZ / "public/media/resenas"
# Solo se descargan fotos de estos servidores (las de Trustoo y las de la tienda).
SERVIDORES = {"img.trustoo.io", "www.diluvium.com.mx", "cdn.shopify.com"}


def limpio(texto: str) -> str:
    """Texto plano: sin etiquetas, entidades resueltas y espacios normalizados."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", texto))).strip()


def texto_completo(parrafo: str) -> str:
    """Texto de una reseña larga: quita el «... Mostrar reseña completa» y une el resto que Trustoo esconde."""
    parrafo = re.sub(r'<span class="display-text"[^>]*>[\s\S]*?</span>\s*</span>', "", parrafo)
    return limpio(re.sub(r"<span hidden[^>]*>", "", parrafo))


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


def foto_resena(url: str, sin_fotos: bool) -> str:
    """Descarga la foto de Trustoo y devuelve su ruta local. El estilo (tamaño) va en el nombre."""
    url = html.unescape(url)
    ruta = urlparse(url)
    estilo = re.search(r"style/trustoo_([a-z_]+)", ruta.query or "")
    base = Path(ruta.path).stem
    extension = Path(ruta.path).suffix.lower() or ".jpg"
    nombre = f"{base}-{estilo.group(1).replace('_', '-') if estilo else 'original'}{extension}"
    descargar(url, FOTOS_RESENAS / nombre, sin_fotos)
    return f"/media/resenas/{nombre}"


def estrellas(bloque: str) -> int:
    return len(re.findall(r'class="star-item"', bloque)) or 5


def carrusel_portada(sin_fotos: bool) -> dict:
    """Carrusel de Trustoo de la portada: dos filas de tarjetas y el resumen «4.9 estrellas basadas en 238»."""
    h = PORTADA.read_text(encoding="utf-8")
    inicio = h.find('id="trustoo-barrage-carousel"')
    fin = h.find('class="shopify-section', inicio)
    zona = h[inicio:fin if fin > 0 else None]
    resumen = re.search(r'id="tt-carousel-desc">([\s\S]*?)</div>', zona)
    texto_resumen = limpio(resumen.group(1)) if resumen else ""
    numeros = re.match(r"([\d.]+)\D+(\d+)", texto_resumen)
    filas = []
    for fila in re.split(r'<div [^>]*?class="tt-carousel-row', zona)[1:]:
        vistas: dict[str, dict] = {}
        for tarjeta in re.split(r'<div class="swiper-slide', fila)[1:]:
            indice = re.search(r'data-swiper-slide-index="(\d+)"', tarjeta)
            clave = indice.group(1) if indice else str(len(vistas))
            if clave in vistas:
                continue  # copias que agrega el carrusel para dar la vuelta
            autor = re.search(r'class="tt-card-author">([\s\S]*?)</div>', tarjeta)
            texto = re.search(r'class="tt-card-review">([\s\S]*?)</div>', tarjeta)
            fotos = re.findall(r'class="resource-item[^"]*">\s*<img[^>]*?src="([^"]+)"', tarjeta)
            vistas[clave] = {
                "nombre": limpio(autor.group(1)) if autor else "",
                "calificacion": estrellas(tarjeta.split('class="tt-card-review"')[0]),
                "texto": limpio(texto.group(1)) if texto else "",
                "fotos": [foto_resena(u, sin_fotos) for u in fotos],
            }
        filas.append([vistas[k] for k in sorted(vistas, key=int)])
    return {
        "resumen": {
            "texto": texto_resumen,
            "calificacion": float(numeros.group(1)) if numeros else None,
            "total": int(numeros.group(2)) if numeros else None,
        },
        "filas": filas,
    }


def pagina_resenas(sin_fotos: bool) -> list[dict]:
    """Todas las reseñas de la página /pages/resenas (cuadrícula de Trustoo)."""
    h = RESENAS.read_text(encoding="utf-8")
    lista = h[h.find('class="tt-review-list"'):]
    salida = []
    for bloque in re.split(r'<div class="grid-review column\d"', lista)[1:]:
        bloque = bloque.split('<div class="grid-review column')[0]
        calificacion = re.search(r'data-rating="(\d)"', bloque)
        autor = re.search(r'class="author-name">([\s\S]*?)</span>', bloque)
        texto = re.search(r'class="reviews-text">([\s\S]*?)</p>', bloque)
        fotos = re.findall(r'class="resource-item"[^>]*>\s*<img[^>]*?data-original="([^"]+)"', bloque)
        producto = re.search(r'class="related-product"[^>]*href="([^"]+)"[\s\S]*?class="product-name">([\s\S]*?)</div>', bloque)
        resena = {
            "nombre": limpio(autor.group(1)) if autor else "",
            "calificacion": int(calificacion.group(1)) if calificacion else 5,
            "texto": texto_completo(texto.group(1)) if texto else "",
            "fotos": [foto_resena(u, sin_fotos) for u in fotos],
        }
        # Trustoo muestra solo la primera foto en la cuadrícula y un ícono cuando la reseña trae más.
        if "multi-photo-wrapper" in bloque:
            resena["variasFotos"] = True
        if producto:
            resena["producto"] = {"titulo": limpio(producto.group(2)), "url": urlparse(html.unescape(producto.group(1))).path}
        salida.append(resena)
    return salida


def main() -> None:
    sin_fotos = "--sin-fotos" in sys.argv
    carrusel = carrusel_portada(sin_fotos)
    resenas = {
        "fuente": "Reseñas publicadas en diluvium.com.mx (Trustoo), sacadas del HTML capturado por herramientas/extraer-resenas-blog.py",
        "carrusel": carrusel,
        "pagina": pagina_resenas(sin_fotos),
    }
    (RAIZ / "contenido" / "resenas.json").write_text(json.dumps(resenas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    filas = carrusel["filas"]
    print(f"carrusel: {len(filas)} filas, {sum(len(f) for f in filas)} reseñas · página: {len(resenas['pagina'])} reseñas")


if __name__ == "__main__":
    main()
