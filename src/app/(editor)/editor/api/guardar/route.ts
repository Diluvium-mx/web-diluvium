// Guarda lo que se cambió en el editor local: la plantilla en contenido/tema/ (con respaldo) y en el administrador.
// Solo en esta Mac (src/lib/editor/guardia.ts).

import { revisarPedido } from "@/lib/editor/guardia";
import { combinarConBase, guardarPlantilla, leerEsquema, leerPlantilla, revisarPlantilla } from "@/lib/editor/archivos";
import { esArchivoMapa, type PlantillaTema } from "@/lib/mapa";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const bloqueo = revisarPedido(request, { cambia: true });
  if (bloqueo) return bloqueo;
  const cuerpo = (await request.json().catch(() => null)) as { archivo?: unknown; plantilla?: unknown; base?: unknown } | null;
  if (!cuerpo || !esArchivoMapa(cuerpo.archivo)) return Response.json({ ok: false, mensaje: "Página no válida." }, { status: 400 });
  const esquema = leerEsquema();
  const problema = revisarPlantilla(cuerpo.archivo, cuerpo.plantilla, esquema);
  if (problema) return Response.json({ ok: false, mensaje: problema }, { status: 400 });
  // Con «base» (lo que tenía el editor al abrirse) solo se aplica lo que cambió en el editor: no se pisa lo que cambió
  // en el archivo mientras tanto (archivos.ts, combinarConBase).
  let plantilla = cuerpo.plantilla as PlantillaTema;
  if (cuerpo.base && !revisarPlantilla(cuerpo.archivo, cuerpo.base, esquema)) {
    plantilla = combinarConBase(leerPlantilla(cuerpo.archivo), plantilla, cuerpo.base as PlantillaTema);
    const otro = revisarPlantilla(cuerpo.archivo, plantilla, esquema);
    if (otro) return Response.json({ ok: false, mensaje: otro }, { status: 400 });
  }
  const { administrador, detalle } = await guardarPlantilla(cuerpo.archivo, plantilla);
  return Response.json({ ok: true, administrador, mensaje: detalle });
}
// (21-nov-2026: guardar sin pisar cambios del archivo)
