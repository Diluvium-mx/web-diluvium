"""Pasa el contenido del tema publicado a datos JSON que lee la página nueva (solo lectura del tema).

Por plantilla: secciones visibles en orden, con todos sus ajustes y bloques visibles. Las direcciones de Shopify se
convierten a direcciones locales: imágenes → /media/files/…, productos → /products/…, etc. Los videos subidos a
Shopify («shopify://files/videos/…») se resuelven con herramientas/videos-tema.json (nombre del tema → archivo).

Uso: npm run contenido
Salida: contenido/tema/<plantilla>.json y contenido/tema/ajustes.json
"""

import json
import re
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEMA = Path.home() / "Documents/Diluvium CRM/tienda-tema/prueba-b"
COMMIT = "69d5993"
SALIDA = RAIZ / "contenido/tema"
VIDEOS = RAIZ / "herramientas/videos-tema.json"


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(TEMA), *args], capture_output=True, text=True, check=True).stdout


def cargar(ruta: str) -> dict:
    return json.loads(re.sub(r"^\s*/\*.*?\*/", "", git("show", f"{COMMIT}:{ruta}"), flags=re.S))


def convertir(valor, videos: dict):
    if isinstance(valor, dict):
        return {k: convertir(v, videos) for k, v in valor.items()}
    if isinstance(valor, list):
        return [convertir(v, videos) for v in valor]
    if not isinstance(valor, str):
        return valor
    if valor.startswith("shopify://shop_images/"):
        return "/media/files/" + valor.removeprefix("shopify://shop_images/")
    if valor.startswith("shopify://files/videos/"):
        nombre = valor.removeprefix("shopify://files/videos/")
        return videos.get(nombre, "video-sin-resolver:" + nombre)
    for tipo in ("products", "collections", "pages", "blogs"):
        if valor.startswith(f"shopify://{tipo}/"):
            return f"/{tipo}/" + valor.removeprefix(f"shopify://{tipo}/")
    return valor


def visibles(datos: dict, videos: dict) -> list[dict]:
    secciones = datos.get("sections", {})
    salida = []
    for clave in datos.get("order", list(secciones)):
        sec = secciones[clave]
        if sec.get("disabled"):
            continue
        bloques = sec.get("blocks", {})
        salida.append({
            "id": clave,
            "tipo": sec["type"],
            "ajustes": convertir(sec.get("settings", {}), videos),
            "bloques": [
                {"id": b, "tipo": bloques[b]["type"], "ajustes": convertir(bloques[b].get("settings", {}), videos)}
                for b in sec.get("block_order", list(bloques))
                if b in bloques and not bloques[b].get("disabled")
            ],
        })
    return salida


def main() -> None:
    videos = json.loads(VIDEOS.read_text()) if VIDEOS.exists() else {}
    SALIDA.mkdir(parents=True, exist_ok=True)
    rutas = [l for l in git("ls-tree", "--name-only", COMMIT, "templates/").splitlines() if l.endswith(".json")]
    rutas += [l for l in git("ls-tree", "--name-only", COMMIT, "sections/").splitlines() if l.endswith("-group.json")]
    for ruta in rutas:
        nombre = Path(ruta).name.removesuffix(".json")
        datos = {"fuente": f"{ruta}@{COMMIT}", "secciones": visibles(cargar(ruta), videos)}
        (SALIDA / f"{nombre}.json").write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    ajustes = cargar("config/settings_data.json")
    actual = ajustes["current"]
    actual = ajustes["presets"][actual] if isinstance(actual, str) else actual
    actual = {k: v for k, v in actual.items() if k not in ("sections", "content_for_index", "blocks")}
    (SALIDA / "ajustes.json").write_text(json.dumps(convertir(actual, videos), ensure_ascii=False, indent=1), encoding="utf-8")
    sin = sorted({m for f in SALIDA.glob("*.json") for m in re.findall(r"video-sin-resolver:[^\"]+", f.read_text())})
    print(f"{len(rutas)} plantillas · videos sin resolver: {len(sin)}")
    for s in sin:
        print("  ", s)


if __name__ == "__main__":
    main()
