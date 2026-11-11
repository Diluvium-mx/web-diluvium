// Cómo se pasa una plantilla del tema (contenido/tema/<archivo>.json) a las secciones del administrador. Lo usan
// sembrar.ts (carga todo con la base vacía) y agregar-plantillas.ts (agrega las plantillas nuevas sin borrar nada).

import { type CampoEsquema } from "../secciones";
import { esMedio, seccionPorTipo } from "./comun";

export type Dic = Record<string, unknown>;
export type SeccionTema = { id: string; tipo: string; ajustes: Dic; bloques: { id: string; tipo: string; ajustes: Dic }[] };
/** Regresa el id en «Fotos y videos» de un archivo de public/ (subiéndolo si hace falta), o null si no hay. */
export type Medio = (ruta: unknown, alt?: string) => Promise<number | null>;

/** Ajustes del tema → datos del bloque: fotos y videos como referencia; el orden original va en «claves». */
export async function ajustesAdmin(valores: Dic, campos: CampoEsquema[], medio: Medio) {
  const tipos = new Map(campos.map((c) => [c.clave, c.tipo]));
  const datos: Dic = { claves: Object.keys(valores) };
  for (const [clave, valor] of Object.entries(valores)) {
    datos[clave] = esMedio(tipos.get(clave) ?? "") ? await medio(valor) : valor;
  }
  return datos;
}

/** Nombre corto de cada sección en la lista del administrador: su primer título o texto (sin formato). */
export function nombreCorto(s: { ajustes: Dic; bloques?: { ajustes: Dic }[] }): string | undefined {
  for (const fuente of [s.ajustes, ...(s.bloques ?? []).map((b) => b.ajustes)]) {
    for (const clave of ["heading", "title", "subheading", "text", "description", "content", "button_label"]) {
      const v = fuente[clave];
      if (typeof v === "string" && v.trim()) {
        const limpio = v.replace(/<[^>]+>/g, " ").replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
        if (limpio) return limpio.length > 50 ? `${limpio.slice(0, 50)}…` : limpio;
      }
    }
  }
  return undefined;
}

/** Secciones de una plantilla del tema, listas para guardarse en «Plantillas de páginas». */
export async function seccionesAdmin(secciones: SeccionTema[], medio: Medio) {
  const salida = [];
  for (const s of secciones) {
    const esquema = seccionPorTipo(s.tipo);
    const bloques = [];
    for (const b of s.bloques) {
      const eb = esquema.bloques.find((x) => x.tipo === b.tipo)!;
      bloques.push({ blockType: eb.slug, blockName: nombreCorto({ ajustes: b.ajustes }), idTema: b.id, ...(await ajustesAdmin(b.ajustes, eb.campos, medio)) });
    }
    salida.push({
      blockType: esquema.slug,
      blockName: nombreCorto(s),
      idTema: s.id,
      ...(await ajustesAdmin(s.ajustes, esquema.campos, medio)),
      ...(esquema.bloques.length ? { bloques } : {}),
    });
  }
  return salida;
}
