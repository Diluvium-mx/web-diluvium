// Guarda lo que se cambió en el editor local: la plantilla en contenido/tema/ (con respaldo) y en el administrador.
// Solo en esta Mac (src/lib/editor/guardia.ts).

import { revisarPedido } from "@/lib/editor/guardia";
import { guardarPlantilla, leerEsquema, revisarPlantilla } from "@/lib/editor/archivos";
import { esArchivoMapa, type PlantillaTema } from "@/lib/mapa";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const bloqueo = revisarPedido(request, { cambia: true });
  if (bloqueo) return bloqueo;
  const cuerpo = (await request.json().catch(() => null)) as { archivo?: unknown; plantilla?: unknown } | null;
  if (!cuerpo || !esArchivoMapa(cuerpo.archivo)) return Response.json({ ok: false, mensaje: "Página no válida." }, { status: 400 });
  const problema = revisarPlantilla(cuerpo.archivo, cuerpo.plantilla, leerEsquema());
  if (problema) return Response.json({ ok: false, mensaje: problema }, { status: 400 });
  const { administrador, detalle } = await guardarPlantilla(cuerpo.archivo, cuerpo.plantilla as PlantillaTema);
  return Response.json({ ok: true, administrador, mensaje: detalle });
}
