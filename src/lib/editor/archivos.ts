// Lectura y escritura de lo que cambia el editor local: las plantillas de contenido/tema/ y la biblioteca de fotos.
// Solo se usa en el servidor de desarrollo (src/lib/editor/guardia.ts).

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { ArchivoMapa, Esquema, PlantillaTema } from "@/lib/mapa";

const correr = promisify(execFile);
export const RAIZ = process.cwd();
const TEMA = path.join(RAIZ, "contenido/tema");
const RESPALDOS = path.join(RAIZ, ".editor-respaldos");

export function leerPlantilla(archivo: ArchivoMapa): PlantillaTema {
  return JSON.parse(readFileSync(path.join(TEMA, `${archivo}.json`), "utf8")) as PlantillaTema;
}

export function leerEsquema(): Esquema {
  return JSON.parse(readFileSync(path.join(RAIZ, "src/payload/esquema-secciones.json"), "utf8")) as Esquema;
}

const PERMITIDO = /^[\w\-.À-ſ ]+$/;

/** Revisa que lo que manda el editor tenga la misma forma que la plantilla de hoy: las mismas secciones (no se agregan
 * ni se quitan desde el editor), piezas de tipos que existen en esa sección y valores simples (texto, número, sí/no). */
export function revisarPlantilla(archivo: ArchivoMapa, nueva: unknown, esquema: Esquema): string | null {
  const actual = leerPlantilla(archivo);
  const n = nueva as PlantillaTema;
  if (!n || !Array.isArray(n.secciones) || n.secciones.length !== actual.secciones.length) return "Las secciones no coinciden.";
  for (const [i, s] of n.secciones.entries()) {
    // Los nombres de las piezas no se repiten dentro de una sección (entre secciones sí pueden, como «point_1»).
    const ids = new Set<string>();
    const a = actual.secciones[i];
    if (s.id !== a.id || s.tipo !== a.tipo) return `La sección ${i + 1} no coincide.`;
    const permitidas = new Set(esquema.secciones.find((x) => x.tipo === s.tipo)?.bloques.map((b) => b.tipo) ?? []);
    for (const pieza of [s, ...s.bloques]) {
      if (!pieza.ajustes || typeof pieza.ajustes !== "object") return "Falta el contenido de una pieza.";
      for (const [clave, valor] of Object.entries(pieza.ajustes)) {
        if (!/^[a-z_0-9]{1,40}$/.test(clave)) return `Campo no válido: ${clave}`;
        if (!["string", "number", "boolean"].includes(typeof valor)) return `El campo ${clave} trae un valor no válido.`;
        if (typeof valor === "string" && valor.length > 6000) return `El campo ${clave} es demasiado largo.`;
      }
    }
    for (const b of s.bloques) {
      if (typeof b.id !== "string" || !PERMITIDO.test(b.id) || ids.has(b.id)) return `Pieza con nombre repetido o no válido: ${b.id}`;
      ids.add(b.id);
      if (!permitidas.has(b.tipo) && !a.bloques.some((x) => x.tipo === b.tipo)) return `Tipo de pieza no permitido aquí: ${b.tipo}`;
    }
  }
  return null;
}

/** Guarda la plantilla (con respaldo de la anterior) y la pasa al administrador para que no se desacomoden. */
export async function guardarPlantilla(archivo: ArchivoMapa, plantilla: PlantillaTema): Promise<{ administrador: boolean; detalle: string }> {
  const destino = path.join(TEMA, `${archivo}.json`);
  mkdirSync(RESPALDOS, { recursive: true });
  writeFileSync(path.join(RESPALDOS, `${archivo}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), readFileSync(destino));
  writeFileSync(destino, JSON.stringify(plantilla, null, 1) + "\n");
  await medirFotos();
  try {
    await correr("npm", ["run", "admin:agregar-plantillas", "--", `--reemplazar=${archivo}`], { cwd: RAIZ, timeout: 180_000 });
    return { administrador: true, detalle: "Guardado en la página y en el administrador." };
  } catch (error) {
    return { administrador: false, detalle: `Guardado en la página. El administrador no se pudo actualizar: ${(error as Error).message.slice(0, 200)}` };
  }
}

/** Ancho y alto de las fotos nuevas (contenido/medidas-imagenes.json), para que la página reserve su espacio. */
export async function medirFotos() {
  await correr(process.execPath, [path.join(RAIZ, "herramientas/medidas-imagenes.mjs")], { cwd: RAIZ, timeout: 60_000 });
}

export type MedioBiblioteca = { src: string; carpeta: string; nombre: string; video: boolean; fecha: number };

// «resenas»: las fotos de las reseñas publicadas (el muro de reseñas solo acepta esas).
const CARPETAS = ["editor", "files", "products", "videos", "articles", "collections", "resenas"];
const ES_MEDIO = /\.(jpe?g|png|webp|gif|avif|mp4|webm)$/i;

/** Fotos y videos que ya están en la página (public/media), los más nuevos primero. */
export function biblioteca(): MedioBiblioteca[] {
  const lista: MedioBiblioteca[] = [];
  for (const carpeta of CARPETAS) {
    const dir = path.join(RAIZ, "public/media", carpeta);
    if (!existsSync(dir)) continue;
    for (const nombre of readdirSync(dir)) {
      if (!ES_MEDIO.test(nombre) || /thumbnail/i.test(nombre)) continue;
      lista.push({
        src: `/media/${carpeta}/${nombre}`,
        carpeta,
        nombre,
        video: /\.(mp4|webm)$/i.test(nombre),
        fecha: statSync(path.join(dir, nombre)).mtimeMs,
      });
    }
  }
  return lista.sort((a, b) => (a.carpeta === "editor" ? -1 : 0) - (b.carpeta === "editor" ? -1 : 0) || b.fecha - a.fecha);
}
