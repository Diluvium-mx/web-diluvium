"""Saca de las capturas del sitio en vivo lo que lee Google y las redes en cada página (título, descripción, dirección
canónica, Open Graph, Twitter y datos estructurados) para que la réplica diga exactamente lo mismo.

Uso: python3 -I herramientas/extraer-seo.py
Lee: docs/sitio-actual/capturas/2026-11-03/<pagina>.html (las páginas de herramientas/capturar-sitio.mjs)
Sale: contenido/seo.json
"""

import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

RAIZ = Path(__file__).resolve().parent.parent
CAPTURAS = RAIZ / "docs/sitio-actual/capturas/2026-11-03"
MAPA_MEDIOS = json.loads((RAIZ / "herramientas/mapa-medios.json").read_text())
SITIO = "https://www.diluvium.com.mx"


def paginas() -> dict[str, str]:
    """Nombre de captura → ruta, tomado de la lista de capturar-sitio.mjs (una sola fuente)."""
    texto = (RAIZ / "herramientas/capturar-sitio.mjs").read_text()
    bloque = texto.split("const PAGINAS = {", 1)[1].split("};", 1)[0]
    return {a or b: r for a, b, r in re.findall(r'(?:"([^"]+)"|(\w[\w-]*)):\s*"([^"]+)"', bloque)}


def medio_local(url: str) -> str:
    """Dirección del CDN de Shopify → la misma foto ya descargada en public/media (sin el ?v=… ni el tamaño)."""
    partes = urlsplit(url if url.startswith("http") else "https:" + url)
    limpia = f"https://www.diluvium.com.mx{partes.path}"
    local = MAPA_MEDIOS.get(limpia, {}).get("local")
    if not local:
        raise SystemExit(f"Falta en mapa-medios.json: {limpia}")
    return "/" + local.removeprefix("public/")


def meta(cabeza: str, clave: str) -> str | None:
    m = re.search(rf'<meta\s+(?:name|property)="{re.escape(clave)}"\s+content="([^"]*)"', cabeza)
    return html.unescape(m.group(1)) if m else None


def main() -> None:
    salida: dict = {"paginas": {}, "articulos": {}, "codigosBarras": {}, "organizacion": None, "sitioWeb": None}
    for nombre, ruta in paginas().items():
        archivo = CAPTURAS / f"{nombre}.html"
        if not archivo.exists():
            continue
        doc = archivo.read_text()
        cabeza = doc.split("</head>", 1)[0]
        titulo = re.sub(r"\s+", " ", html.unescape(re.search(r"<title>(.*?)</title>", cabeza, re.S).group(1))).strip()
        canonica = re.search(r'<link rel="canonical" href="([^"]+)"', cabeza)
        imagen = meta(cabeza, "og:image:secure_url")
        pagina = {
            "titulo": titulo,
            "descripcion": meta(cabeza, "description"),
            "canonica": canonica.group(1).removeprefix(SITIO) or "/" if canonica else None,
            "og": {
                "tipo": meta(cabeza, "og:type"),
                "titulo": meta(cabeza, "og:title"),
                "descripcion": meta(cabeza, "og:description"),
                "imagen": medio_local(imagen) if imagen else None,
                "ancho": int(meta(cabeza, "og:image:width") or 0) or None,
                "alto": int(meta(cabeza, "og:image:height") or 0) or None,
            },
            "twitter": {
                "tarjeta": meta(cabeza, "twitter:card"),
                "titulo": meta(cabeza, "twitter:title"),
                "descripcion": meta(cabeza, "twitter:description"),
            },
        }
        # La búsqueda con texto y la página que no existe no llevan ficha propia: se arman en su ruta.
        if "?" not in ruta and nombre != "no-existe-404":
            salida["paginas"][ruta] = pagina
        elif nombre == "no-existe-404":
            salida["paginas"]["404"] = pagina

        for bloque in re.findall(r'<script type="application/ld\+json">(.*?)</script>', doc, re.S):
            try:
                datos = json.loads(bloque)
            except json.JSONDecodeError:
                continue
            tipo = datos.get("@type")
            if tipo == "Organization":
                datos["logo"] = SITIO + medio_local(datos["logo"])
                # En vivo la lista de redes trae huecos vacíos (redes sin llenar en el tema); Google los marca como error.
                datos["sameAs"] = [u for u in datos.get("sameAs", []) if u]
                salida["organizacion"] = datos
            elif tipo == "WebSite":
                salida["sitioWeb"] = datos
            elif tipo == "Article":
                if isinstance(datos.get("image"), list):
                    datos["image"] = [SITIO + medio_local(u) for u in datos["image"]]
                if isinstance(datos.get("publisher", {}).get("logo"), dict):
                    datos["publisher"]["logo"]["url"] = SITIO + medio_local(datos["publisher"]["logo"]["url"])
                salida["articulos"][ruta] = datos
            elif tipo == "Product":
                # El precio, el nombre y las fotos salen del catálogo; de aquí solo se guarda el código de barras de
                # cada tamaño, que el catálogo público no trae.
                for oferta in datos.get("offers", []):
                    variante = re.search(r"variant=(\d+)", oferta.get("url", ""))
                    if variante and oferta.get("gtin13"):
                        salida["codigosBarras"][variante.group(1)] = str(oferta["gtin13"])

    destino = RAIZ / "contenido/seo.json"
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(salida['paginas'])} páginas, {len(salida['articulos'])} artículos, "
          f"{len(salida['codigosBarras'])} códigos de barras → {destino.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
