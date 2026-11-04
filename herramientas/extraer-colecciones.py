"""Colecciones de la tienda (título, foto, productos y su orden) → contenido/colecciones.json.

Uso: python3 -I herramientas/extraer-colecciones.py [--sin-vivo]

- Título, foto para compartir, orden elegido y productos (en ese orden) salen del HTML guardado de cada colección
  (docs/sitio-actual/capturas/2026-11-03/coleccion-*.html); la foto de cada tarjeta y el orden de la lista de
  colecciones, de colecciones.html.
- El orden de los productos con cada opción de «Filtrar por» se lee de la tienda en vivo
  (/collections/<nombre>?sort_by=<orden>), porque la exportación no trae ventas ni fechas. Con --sin-vivo se
  conservan los órdenes que ya estaban en el archivo.
Solo datos públicos de la tienda: nada de ventas, clientes ni códigos.
"""

import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAPTURAS = RAIZ / "docs/sitio-actual/capturas/2026-11-03"
SALIDA = RAIZ / "contenido/colecciones.json"
TIENDA = "https://www.diluvium.com.mx"

# Página capturada → nombre de la colección en la dirección.
PAGINAS = {
    "coleccion-todos": "all-products",
    "coleccion-all": "all",
    "coleccion-compuerta": "a-compuerta",
    "coleccion-escritorio": "coleccion-para-escritorio",
    "coleccion-mobile": "coleccion-para-mobile",
    "coleccion-frontpage": "frontpage",
    "coleccion-mas-vendidos": "los-mas-vendidos",
}

ORDENES = [
    "manual", "most-relevant", "best-selling", "title-ascending", "title-descending",
    "price-ascending", "price-descending", "created-ascending", "created-descending",
]


def medio_local(url: str) -> str:
    """//www.diluvium.com.mx/cdn/shop/files/X.jpg?v=1 → /media/files/X.jpg (la copia que ya está en public/)."""
    m = re.search(r"/cdn/shop/(files|products|collections)/([^?\"]+)", url)
    if not m:
        return ""
    local = f"/media/{m.group(1)}/{m.group(2)}"
    if not (RAIZ / "public" / local.lstrip("/")).exists():
        print("  ! falta el archivo", local, file=sys.stderr)
    return local


def productos_en(fuente: str, nombre: str) -> list[str]:
    vistos: list[str] = []
    for p in re.findall(rf'href="/collections/{re.escape(nombre)}/products/([^"?#]+)"', fuente):
        if p not in vistos:
            vistos.append(p)
    return vistos


def leer_vivo(nombre: str, orden: str) -> list[str]:
    url = f"{TIENDA}/collections/{nombre}?sort_by={orden}"
    for intento in range(6):
        time.sleep(2 + 10 * intento)  # La tienda corta con «429» si se le pide muy seguido.
        try:
            pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(pedido, timeout=30) as r:
                return productos_en(r.read().decode("utf-8"), nombre)
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
    raise RuntimeError(f"La tienda no respondió: {url}")


def main() -> None:
    sin_vivo = "--sin-vivo" in sys.argv
    anterior = json.loads(SALIDA.read_text()) if SALIDA.exists() else {"colecciones": []}
    previas = {c["nombre"]: c for c in anterior["colecciones"]}

    colecciones = []
    for pagina, nombre in PAGINAS.items():
        fuente = (CAPTURAS / f"{pagina}.html").read_text()
        encabezado = re.search(r'collection-products-header--left[^>]*>\s*(.*?)\s*<span', fuente, re.S)
        titulo = html.unescape(encabezado.group(1).strip()) if encabezado else nombre
        og = re.search(r'property="og:image" content="([^"]+)"', fuente)
        orden = re.search(r'<option value="([^"]+)" selected', fuente)
        descripcion = re.search(r'class="[^"]*collection__description[^"]*"[^>]*>(.*?)</div>', fuente, re.S)
        tope = re.search(r'name="filter\.v\.price\.lte"[^>]*placeholder="([\d.]+)"', fuente) or re.search(
            r'placeholder="([\d.]+)"[^>]*name="filter\.v\.price\.lte"', fuente)
        c = {
            "nombre": nombre,
            "titulo": titulo,
            "descripcionHtml": descripcion.group(1).strip() if descripcion else "",
            "imagenCompartir": medio_local(og.group(1)) if og else "",
            "orden": orden.group(1) if orden else "manual",
            "precioMaximo": float(tope.group(1)) if tope else None,
            "productos": productos_en(fuente, nombre),
        }
        if sin_vivo:
            c["ordenes"] = previas.get(nombre, {}).get("ordenes", {})
        else:
            c["ordenes"] = {o: leer_vivo(nombre, o) for o in ORDENES}
            print(f"  {nombre}: {len(c['productos'])} productos, {len(ORDENES)} órdenes leídos en vivo")
        colecciones.append(c)

    # Lista de colecciones (/collections): orden y foto de cada tarjeta.
    lista = (CAPTURAS / "colecciones.html").read_text()
    tarjetas = re.findall(
        r'<a aria-label="[^"]*" href="/collections/([^"]+)" class="d-block collection-card__link.*?<img src="([^"]+)"',
        lista, re.S)
    por_nombre = {c["nombre"]: c for c in colecciones}
    for nombre, imagen in tarjetas:
        if nombre in por_nombre:
            por_nombre[nombre]["imagen"] = medio_local(imagen)
    datos = {
        "fuente": "docs/sitio-actual/capturas/2026-11-03 (coleccion-*.html, colecciones.html) + órdenes en vivo",
        "lista": [n for n, _ in tarjetas],
        "colecciones": colecciones,
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n")
    print("Listo:", SALIDA.relative_to(RAIZ))


if __name__ == "__main__":
    main()
