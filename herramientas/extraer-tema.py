"""Saca la ficha de cada página del tema publicado de Shopify (solo lectura).

Lee el repo local del tema en el commit del tema publicado sin cambios y escribe, por plantilla, la lista de
secciones con sus textos, imágenes, videos y enlaces en docs/sitio-actual/paginas/. También escribe la lista de
medios (medios.md) y los colores y fuentes (diseno.md).

Uso: python3 -I herramientas/extraer-tema.py
"""

import html
import json
import re
import subprocess
from pathlib import Path

TEMA = Path.home() / "Documents/Diluvium CRM/tienda-tema/prueba-b"
COMMIT = "69d5993"  # copia original del tema publicado (antes de la prueba B)
SALIDA = Path(__file__).resolve().parent.parent / "docs/sitio-actual"

CLAVES_UTILES = re.compile(
    r"(title|heading|text|subtitle|description|content|label|caption|button|link|url|image|video|icon|logo|"
    r"question|answer|quote|author|name|subheading|tag|badge|number|percent|before|after|html|liquid|product|"
    r"collection|blog|menu|placeholder|message|code)",
    re.I,
)


def git_show(ruta: str) -> str:
    return subprocess.run(
        ["git", "-C", str(TEMA), "show", f"{COMMIT}:{ruta}"], capture_output=True, text=True, check=True
    ).stdout


def git_ls(carpeta: str) -> list[str]:
    salida = subprocess.run(
        ["git", "-C", str(TEMA), "ls-tree", "--name-only", f"{COMMIT}", f"{carpeta}/"],
        capture_output=True, text=True, check=True,
    ).stdout
    return [l for l in salida.splitlines() if l.endswith(".json")]


def cargar_json(ruta: str) -> dict:
    texto = re.sub(r"^\s*/\*.*?\*/", "", git_show(ruta), flags=re.S)
    return json.loads(texto)


def limpiar(valor: str) -> str:
    valor = re.sub(r"<br\s*/?>", " / ", valor)
    valor = re.sub(r"<[^>]+>", " ", valor)
    valor = html.unescape(re.sub(r"\s+", " ", valor)).strip()
    return valor[:400] + ("…" if len(valor) > 400 else "")


def ajustes_utiles(ajustes: dict, medios: set) -> list[str]:
    lineas = []
    for clave, valor in ajustes.items():
        if not isinstance(valor, str) or not valor.strip():
            continue
        if valor.startswith(("shopify://shop_images/", "shopify://files/")) or "cdn.shopify.com" in valor:
            medios.add(valor)
        if clave == "color_scheme" or CLAVES_UTILES.search(clave):
            if re.fullmatch(r"[a-z0-9_\-]+", valor) and not valor.startswith("shopify") and clave not in (
                "product", "collection", "blog", "menu", "icon",
            ):
                if clave != "color_scheme":
                    continue
            lineas.append(f"`{clave}`: {limpiar(valor)}")
    return lineas


def guardar_codigo_propio(plantilla: str, numero: int, sec: dict) -> str | None:
    """Las secciones custom-liquid / custom-html son código escrito para Diluvium: se guardan completas."""
    codigo = next(
        (v for k, v in sec.get("settings", {}).items() if isinstance(v, str) and k in ("liquid_code", "custom_liquid", "html", "liquid")),
        None,
    )
    if not codigo:
        return None
    carpeta = SALIDA / "paginas/codigo-propio"
    carpeta.mkdir(parents=True, exist_ok=True)
    archivo = carpeta / f"{plantilla}-{numero:02d}-{sec['type']}.liquid"
    archivo.write_text(codigo, encoding="utf-8")
    return f"Código completo: `paginas/codigo-propio/{archivo.name}`"


def ficha(nombre: str, datos: dict, medios: set) -> str:
    secciones = datos.get("sections", {})
    orden = datos.get("order", list(secciones))
    plantilla = Path(nombre).name.replace(".json", "")
    partes = [f"# {nombre}\n", f"Fuente: `{nombre}` del tema publicado (commit `{COMMIT}`).\n"]
    numero = 0
    for clave in orden:
        sec = secciones[clave]
        oculta = sec.get("disabled", False)
        if not oculta:
            numero += 1
        marca = "(OCULTA en el sitio — no se replica)" if oculta else f"{numero}."
        partes.append(f"\n## {marca} `{sec['type']}`\n")
        if not oculta and sec["type"] in ("custom-liquid", "custom-html"):
            nota = guardar_codigo_propio(plantilla, numero, sec)
            if nota:
                partes.append(f"- {nota}")
        for linea in ajustes_utiles(sec.get("settings", {}), medios):
            partes.append(f"- {linea}")
        bloques = sec.get("blocks", {})
        for bclave in sec.get("block_order", list(bloques)):
            bloque = bloques.get(bclave)
            if not bloque:
                continue
            boculto = " (oculto)" if bloque.get("disabled") else ""
            lineas = ajustes_utiles(bloque.get("settings", {}), medios)
            partes.append(f"- Bloque `{bloque['type']}`{boculto}" + (":" if lineas else ""))
            for linea in lineas:
                partes.append(f"  - {linea}")
    return "\n".join(partes) + "\n"


def diseno() -> str:
    datos = cargar_json("config/settings_data.json")
    actual = datos["current"]
    actual = datos["presets"][actual] if isinstance(actual, str) else actual
    partes = ["# Diseño global del tema publicado\n", f"Fuente: `config/settings_data.json` (commit `{COMMIT}`).\n"]
    partes.append("\n## Esquemas de color\n")
    partes.append("| Esquema | Fondo | Texto | Botón sólido | Texto del botón | Botón con borde |")
    partes.append("|---|---|---|---|---|---|")
    for sid, esquema in actual.get("color_schemes", {}).items():
        s = esquema["settings"]
        partes.append(
            f"| {sid} | {s.get('color_background')} | {s.get('color_body_text')} | {s.get('background_solid_button')} "
            f"| {s.get('color_solid_button')} | {s.get('color_outline_button')} |"
        )
    partes.append("\n## Resto de ajustes\n")
    for clave, valor in actual.items():
        if clave in ("color_schemes", "sections", "content_for_index", "blocks"):
            continue
        if isinstance(valor, (str, int, float, bool)) and str(valor) != "":
            partes.append(f"- `{clave}`: {valor}")
    return "\n".join(partes) + "\n"


def main() -> None:
    destino = SALIDA / "paginas"
    destino.mkdir(parents=True, exist_ok=True)
    medios: set = set()
    plantillas = git_ls("templates") + [f for f in git_ls("sections") if f.endswith("-group.json")]
    for ruta in plantillas:
        datos = cargar_json(ruta)
        nombre = Path(ruta).name.replace(".json", "")
        (destino / f"{nombre}.md").write_text(ficha(ruta, datos, medios), encoding="utf-8")
    (SALIDA / "diseno.md").write_text(diseno(), encoding="utf-8")
    lista = "\n".join(f"- {m}" for m in sorted(medios))
    (SALIDA / "medios.md").write_text(
        "# Imágenes y videos que usa el tema publicado\n\n"
        "Se descargan del CDN de Shopify en la fase 1. Son de Diluvium (fotos, videos, logos).\n\n" + lista + "\n",
        encoding="utf-8",
    )
    print(f"{len(plantillas)} fichas, {len(medios)} medios")


if __name__ == "__main__":
    main()
