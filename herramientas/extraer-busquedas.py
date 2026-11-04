"""Resultados de la búsqueda de la tienda en vivo para las palabras del catálogo → contenido/busquedas.json.

Uso: python3 -I herramientas/extraer-busquedas.py [palabra …]

La búsqueda de Shopify no es una simple coincidencia de texto (usa sinónimos y parecidos: «zzzzqq» devuelve 4
productos), así que no se puede calcular igual en la réplica. Este script guarda, para cada palabra de los títulos
de productos, colecciones, artículos y páginas (más las que se pasen), lo que la tienda contesta:
- «rapida»: el buscador del encabezado (/search/suggest, los mismos parámetros que usa el tema).
- «pagina»: la página /search?q=… (productos, páginas y artículos en el orden en que salen).
La réplica usa estas respuestas cuando la búsqueda coincide y, para lo demás, una búsqueda local por texto.
Solo datos públicos de la tienda.
"""

import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "contenido/busquedas.json"
TIENDA = "https://www.diluvium.com.mx"
EXTRA = ["inundacion", "inundaciones", "agua", "puerta", "lluvia", "proteccion", "accesorio", "repuesto"]


def normal(texto: str) -> str:
    sin_acentos = "".join(c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9ñ ]", " ", sin_acentos)).strip()


def pedir(url: str) -> str:
    for intento in range(6):
        time.sleep(2 + 10 * intento)  # La tienda corta con «429» si se le pide muy seguido.
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30) as r:
                return r.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
    raise RuntimeError(f"La tienda no respondió: {url}")


def palabras() -> list[str]:
    titulos = [p["titulo"] for p in json.loads((RAIZ / "contenido/productos.json").read_text())["productos"]]
    titulos += [c["titulo"] for c in json.loads((RAIZ / "contenido/colecciones.json").read_text())["colecciones"]]
    titulos += [a["titulo"] for a in json.loads((RAIZ / "contenido/blog.json").read_text())["articulos"]]
    titulos += [p["titulo"] for p in json.loads((RAIZ / "contenido/paginas.json").read_text())["paginas"]]
    vistas: list[str] = []
    for t in titulos + EXTRA:
        for w in normal(t).split():
            if len(w) >= 3 and not w.isdigit() and w not in vistas:
                vistas.append(w)
    return vistas


def rapida(q: str) -> dict[str, list[str]]:
    url = (f"{TIENDA}/search/suggest.json?q={urllib.parse.quote(q)}&resources[type]=product,article,page,collection"
           "&resources[limit]=10&resources[limit_scope]=each")
    datos = json.loads(pedir(url))["resources"]["results"]
    return {
        "productos": [x["handle"] for x in datos.get("products", [])],
        "colecciones": [x["handle"] for x in datos.get("collections", [])],
        "articulos": [x["handle"] for x in datos.get("articles", [])],
        "paginas": [x["handle"] for x in datos.get("pages", [])],
    }


def pagina(q: str) -> list[dict[str, str]]:
    html = pedir(f"{TIENDA}/search?q={urllib.parse.quote(q)}&options%5Bprefix%5D=last")
    resultados: dict[int, dict[str, str]] = {}
    for tipo, patron in (
        ("producto", r'href="/products/([^"?]+)\?_pos=(\d+)'),
        ("pagina", r'href="/pages/([^"?]+)\?_pos=(\d+)'),
        ("articulo", r'href="/blogs/[^/"]+/([^"?]+)\?_pos=(\d+)'),
    ):
        for nombre, pos in re.findall(patron, html):
            resultados.setdefault(int(pos), {"tipo": tipo, "nombre": nombre})
    return [resultados[k] for k in sorted(resultados)]


def main() -> None:
    lista = [normal(w) for w in sys.argv[1:]] or palabras()
    anterior = json.loads(SALIDA.read_text()) if SALIDA.exists() else {"consultas": {}}
    consultas = anterior["consultas"]
    for q in lista:
        consultas[q] = {"rapida": rapida(q), "pagina": pagina(q)}
        print(f"  {q}: {len(consultas[q]['pagina'])} resultados", flush=True)
    datos = {
        "fuente": "Tienda en vivo: /search/suggest.json y /search (herramientas/extraer-busquedas.py)",
        "consultas": dict(sorted(consultas.items())),
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n")
    print("Listo:", SALIDA.relative_to(RAIZ))


if __name__ == "__main__":
    main()
