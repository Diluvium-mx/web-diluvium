// Números fijos del mapa de elementos (editor local, solo en esta Mac). Recibe los elementos que ve la pestaña Mapa
// (firma, nombre, parte), da el siguiente número libre a los nuevos, actualiza nombres y guarda
// contenido/mapa-elementos.json. Un número nunca se reusa: si un elemento desaparece, su número queda apartado.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { revisarPedido } from "@/lib/editor/guardia";
import { RAIZ } from "@/lib/editor/archivos";
import { esArchivoMapa } from "@/lib/mapa";

export const dynamic = "force-dynamic";

const ARCHIVO = path.join(RAIZ, "contenido/mapa-elementos.json");

type Registro = Record<string, { siguiente: number; elementos: Record<string, { n: number; nombre: string; parte: string; visto: string }> }>;

function leer(): Registro {
  return existsSync(ARCHIVO) ? (JSON.parse(readFileSync(ARCHIVO, "utf8")) as Registro) : {};
}

export async function POST(request: Request) {
  const bloqueo = revisarPedido(request, { cambia: true });
  if (bloqueo) return bloqueo;
  const cuerpo = (await request.json().catch(() => null)) as { archivo?: unknown; elementos?: unknown } | null;
  if (!cuerpo || !esArchivoMapa(cuerpo.archivo) || !Array.isArray(cuerpo.elementos)) return Response.json({ ok: false, mensaje: "Datos no válidos." }, { status: 400 });

  const registro = leer();
  const pagina = (registro[cuerpo.archivo] ??= { siguiente: 1, elementos: {} });
  const hoy = new Date().toISOString().slice(0, 10);
  let cambio = false;
  for (const x of cuerpo.elementos as { firma?: unknown; nombre?: unknown; parte?: unknown }[]) {
    if (typeof x.firma !== "string" || x.firma.length > 300 || typeof x.nombre !== "string" || typeof x.parte !== "string") continue;
    const actual = pagina.elementos[x.firma];
    const nombre = x.nombre.slice(0, 120);
    const parte = x.parte.slice(0, 80);
    if (!actual) {
      pagina.elementos[x.firma] = { n: pagina.siguiente++, nombre, parte, visto: hoy };
      cambio = true;
    } else if (actual.nombre !== nombre || actual.parte !== parte || actual.visto !== hoy) {
      Object.assign(actual, { nombre, parte, visto: hoy });
      cambio = true;
    }
  }
  if (cambio) writeFileSync(ARCHIVO, JSON.stringify(registro, null, 1) + "\n");
  return Response.json({ ok: true, numeros: Object.fromEntries(Object.entries(pagina.elementos).map(([f, e]) => [f, e.n])) });
}
