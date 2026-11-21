// Números fijos del mapa de elementos (editor local, solo en esta Mac). Recibe los elementos que ve la pestaña Mapa
// (firma, nombre, parte), da el siguiente número libre a los nuevos, actualiza nombres y guarda
// contenido/mapa-elementos.json. Un número nunca se reusa: si un elemento desaparece, su número queda apartado.
//
// Cómo se decide el número de cada elemento (en este orden):
//   1. misma firma → el mismo número;
//   2. firma nueva, pero en la misma parte y la misma pieza desapareció un elemento con el mismo texto (p. ej. porque
//      se rehízo el código de la pieza) → hereda su número;
//   3. si no → el siguiente número libre.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { revisarPedido } from "@/lib/editor/guardia";
import { RAIZ } from "@/lib/editor/archivos";
import { esArchivoMapa } from "@/lib/mapa";

export const dynamic = "force-dynamic";

const ARCHIVO = path.join(RAIZ, "contenido/mapa-elementos.json");

type Registro = Record<string, { siguiente: number; elementos: Record<string, { n: number; nombre: string; parte: string; visto: string }> }>;

/** «Texto «Hola»» y «Texto ««Hola»»» cuentan igual (sin comillas ni espacios de más). */
const normal = (nombre: string) => nombre.replace(/[«»"“”]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const piezaDe = (firma: string) => firma.split("|")[1] ?? "";

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
  const validos = (cuerpo.elementos as { firma?: unknown; nombre?: unknown; parte?: unknown }[]).filter(
    (x): x is { firma: string; nombre: string; parte: string } =>
      typeof x.firma === "string" && x.firma.length <= 300 && typeof x.nombre === "string" && typeof x.parte === "string",
  );
  // Elementos que ya no están en la página (con su firma de antes): pueden heredar su número a uno igual.
  const presentes = new Set(validos.map((x) => x.firma));
  const desaparecidos = Object.entries(pagina.elementos)
    .filter(([f]) => !presentes.has(f))
    .sort((a, b) => a[1].n - b[1].n);
  for (const x of validos) {
    const actual = pagina.elementos[x.firma];
    const nombre = x.nombre.slice(0, 120);
    const parte = x.parte.slice(0, 80);
    if (!actual) {
      const i = desaparecidos.findIndex(([f, e]) => e.parte === parte && piezaDe(f) === piezaDe(x.firma) && normal(e.nombre) === normal(nombre));
      if (i >= 0) {
        const [firmaVieja, e] = desaparecidos.splice(i, 1)[0];
        delete pagina.elementos[firmaVieja];
        pagina.elementos[x.firma] = { ...e, nombre, parte, visto: hoy };
      } else {
        pagina.elementos[x.firma] = { n: pagina.siguiente++, nombre, parte, visto: hoy };
      }
      cambio = true;
    } else if (actual.nombre !== nombre || actual.parte !== parte || actual.visto !== hoy) {
      Object.assign(actual, { nombre, parte, visto: hoy });
      cambio = true;
    }
  }
  if (cambio) writeFileSync(ARCHIVO, JSON.stringify(registro, null, 1) + "\n");
  return Response.json({ ok: true, numeros: Object.fromEntries(Object.entries(pagina.elementos).map(([f, e]) => [f, e.n])) });
}
