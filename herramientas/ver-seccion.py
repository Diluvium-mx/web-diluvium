"""Muestra en corto las medidas de una sección y recorta su captura de referencia (para construirla igual).

Uso: python3 -I herramientas/ver-seccion.py <pagina|pagina-replica> <indice[,indice…]> [vistas=celular,compu] [carpeta-recortes]
(«pagina-replica» lee la última comparación de la réplica en comparaciones/)
Ejemplo: python3 -I herramientas/ver-seccion.py portada 0,1,2
Los recortes salen como <carpeta>/<pagina>-<indice>-<vista>.jpg (por omisión en /tmp).
"""

import json
import os
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MEDIDAS = RAIZ / "docs/sitio-actual/medidas"
CAPTURAS = RAIZ / "docs/sitio-actual/capturas/2026-10-31"


def linea(e: dict) -> str:
    partes = [e["tag"], "x{} y{} {}x{}".format(*e["caja"])]
    if "texto" in e:
        partes.append(repr(e["texto"][:70]))
        partes.append(f"{e.get('font')} {e.get('size')}/{e.get('lh', '-')} w{e.get('weight')} {e.get('color')}")
        if e.get("ls"):
            partes.append(f"ls {e['ls']}")
        if e.get("transform"):
            partes.append(e["transform"])
        if e.get("align") not in (None, "start", "left"):
            partes.append(f"align {e['align']}")
    for clave in ("bg", "radius", "border", "pad", "href", "src", "poster", "fit", "natural"):
        if e.get(clave) not in (None, "", []):
            partes.append(f"{clave}={e[clave]}")
    return " | ".join(str(p) for p in partes)


def main() -> None:
    pagina, indices = sys.argv[1], [int(i) for i in sys.argv[2].split(",")]
    vistas = (sys.argv[3] if len(sys.argv) > 3 else "celular,compu").split(",")
    recortes = Path(sys.argv[4]) if len(sys.argv) > 4 else Path("/tmp")
    recortes.mkdir(parents=True, exist_ok=True)
    for vista in vistas:
        if pagina.endswith("-replica"):
            base = pagina.removesuffix("-replica")
            salida = RAIZ / os.environ.get("COMPARAR_SALIDA", "comparaciones")
            datos = json.loads((salida / f"{base}-{vista}-replica.json").read_text())
            foto = salida / f"{base}-{vista}-replica.jpg"
        else:
            datos = json.loads((MEDIDAS / f"{pagina}-{vista}.json").read_text())
            foto = CAPTURAS / f"{pagina}-{vista}.jpg"
        for i in indices:
            s = datos["secciones"][i]
            x, y, w, h = s["caja"]
            print(f"\n=== {pagina} [{i}] {vista} · {s['tipo'] or s['id']} · y{y} alto {h} · fondo {s['bg']}")
            for l in s["layouts"][:12]:
                print("  [layout]", l["display"], l.get("dir") or "", "cols", l.get("cols") or "-", "gap", l["gap"],
                      "caja", l["caja"], "pad", l["pad"], "maxW", l.get("maxW") or "-")
            for e in s["elementos"][:60]:
                print("  ", linea(e))
            if len(s["elementos"]) > 60:
                print(f"   … {len(s['elementos']) - 60} elementos más")
            if foto.exists() and h > 0:
                salida = recortes / f"{pagina}-{i}-{vista}.jpg"
                subprocess.run(["magick", str(foto), "-crop", f"{w}x{min(h, 4000)}+0+{y}", "+repage", str(salida)],
                               capture_output=True)
                print("   recorte:", salida)


if __name__ == "__main__":
    main()
