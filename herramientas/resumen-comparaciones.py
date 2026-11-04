"""Resume todas las comparaciones de comparaciones/*.md: alto de página y secciones fuera de meta.

Fuera de meta = alto distinto (más de 4 px) o más de 2 % de píxeles distintos en una sección que no se mueve sola.
Uso: python3 -I herramientas/resumen-comparaciones.py
"""

import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

for f in sorted((RAIZ / "comparaciones").glob("*.md")):
    t = f.read_text()
    alto = re.search(r"en vivo (\d+) px · réplica (\d+) px", t)
    filas = [l for l in t.splitlines() if l.startswith("| ") and not l.startswith(("| #", "|---"))]
    fuera = []
    for l in filas:
        c = [x.strip() for x in l.strip("|").split("|")]
        if len(c) < 6:
            continue
        pct = re.match(r"([\d.]+) %", c[5])
        if "alto distinto" in c[5] or "falta" in c[5] or "sobra" in c[5] or (pct and float(pct.group(1)) > 2 and "se mueve" not in c[5]):
            fuera.append(f"{c[0]} {c[1][:30]} {c[3]}/{c[4]} {c[5]}")
    dif = int(alto.group(2)) - int(alto.group(1)) if alto else 0
    print(f"{f.stem:30} página {alto.group(1) if alto else '?'}/{alto.group(2) if alto else '?'} ({dif:+d}) · {len(filas)} secciones · fuera de meta: {len(fuera)}")
    for x in fuera:
        print("      ", x)
