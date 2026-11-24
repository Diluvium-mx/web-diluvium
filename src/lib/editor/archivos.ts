// Lectura y escritura de lo que cambia el editor local: las plantillas de contenido/tema/ y la biblioteca de fotos.
// Solo se usa en el servidor de desarrollo (src/lib/editor/guardia.ts).

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Ajustes, ArchivoMapa, BloqueTema, Esquema, PlantillaTema } from "@/lib/mapa";

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

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Lo del disco más solo lo que cambió el editor (comparado con lo que tenía al abrirse). */
function combinarAjustes(disco: Ajustes, cliente: Ajustes, base: Ajustes): Ajustes {
  const r: Ajustes = { ...disco };
  for (const k of new Set([...Object.keys(cliente), ...Object.keys(base)])) {
    if (igual(cliente[k], base[k])) continue;
    if (cliente[k] === undefined) delete r[k];
    else r[k] = cliente[k];
  }
  return r;
}

/**
 * Guardar sin pisar lo que cambió en el archivo mientras el editor estaba abierto (21-nov-2026): el editor manda la
 * plantilla completa y la que tenía al abrirse («base»). Se aplica solo lo que el editor cambió (encuadres, fotos,
 * textos, piezas agregadas, quitadas o movidas); lo demás se queda como está en el archivo (por ejemplo, un texto o
 * un ajuste nuevo que se puso desde el código después de abrir el editor).
 */
export function combinarConBase(disco: PlantillaTema, cliente: PlantillaTema, base: PlantillaTema): PlantillaTema {
  return {
    ...disco,
    secciones: disco.secciones.map((sd) => {
      const sc = cliente.secciones.find((x) => x.id === sd.id);
      const sb = base.secciones.find((x) => x.id === sd.id);
      if (!sc || !sb) return sd;
      const idsC = sc.bloques.map((b) => b.id);
      const idsB = sb.bloques.map((b) => b.id);
      const mezclar = (bd: BloqueTema | undefined, bc: BloqueTema, bb: BloqueTema | undefined) =>
        bd && bb ? { ...bd, ajustes: combinarAjustes(bd.ajustes, bc.ajustes, bb.ajustes) } : bc;
      let bloques: BloqueTema[];
      if (igual(idsC, idsB)) {
        // Mismas piezas y en el mismo orden: las del archivo con lo que cambió el editor.
        bloques = sd.bloques.map((bd) => {
          const bc = sc.bloques.find((x) => x.id === bd.id);
          return bc ? mezclar(bd, bc, sb.bloques.find((x) => x.id === bd.id)) : bd;
        });
      } else {
        // El editor agregó, quitó o movió piezas: manda su orden; cada pieza conserva lo del archivo que no tocó.
        bloques = sc.bloques.map((bc) => mezclar(sd.bloques.find((x) => x.id === bc.id), bc, sb.bloques.find((x) => x.id === bc.id)));
        for (const bd of sd.bloques) if (!idsB.includes(bd.id) && !idsC.includes(bd.id)) bloques.push(bd);
      }
      return { ...sd, ajustes: combinarAjustes(sd.ajustes, sc.ajustes, sb.ajustes), bloques };
    }),
  };
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

/** ¿Los videos nuevos tienen sonido? (contenido/videos-sonido.json): al «video automático» sin sonido no le sale el
 *  botón de sonido. */
export async function medirVideos() {
  await correr(process.execPath, [path.join(RAIZ, "herramientas/videos-sonido.mjs")], { cwd: RAIZ, timeout: 120_000 });
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
// (21-nov-2026: guardar sin pisar cambios del archivo)
