// Lo que comparten el que carga el contenido al administrador (sembrar.ts) y el que lo vuelve a escribir (exportar.ts):
// qué archivos hay, con qué sangría se escriben y cómo se llaman las plantillas en español.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ESQUEMA, type SeccionEsquema } from "../secciones";

export const RAIZ = path.resolve(import.meta.dirname, "../../..");
export const CONTENIDO = path.join(RAIZ, "contenido");

// Sangría con la que está escrito cada archivo (para que exportar no cambie nada que no se editó).
export const SANGRIA: Record<string, number> = {
  "blog.json": 2,
  "menus.json": 2,
  "resenas.json": 2,
  "seo.json": 2,
};

export function leer<T = unknown>(archivo: string): T {
  return JSON.parse(readFileSync(path.join(CONTENIDO, archivo), "utf8")) as T;
}

export function escribir(carpeta: string, archivo: string, datos: unknown) {
  const destino = path.join(carpeta, archivo);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, JSON.stringify(datos, null, SANGRIA[archivo] ?? 1) + "\n");
}

// Plantillas del tema (contenido/tema/<archivo>.json) y cómo se ven en el administrador.
export const PLANTILLAS: Record<string, string> = {
  index: "Portada",
  "header-group": "Encabezado (todas las páginas)",
  "footer-group": "Pie (todas las páginas)",
  "product.compuerta-estandar-2": "Producto: Compuerta estándar 2",
  "product.compuerta-estandar": "Producto: Compuerta estándar",
  "product.medida-especial": "Producto: Medida especial",
  "product.mini-compuerta": "Producto: Mini compuerta",
  "product.tapon-inflable": "Producto: Tapón inflable",
  product: "Producto: básica",
  "product.quick-add": "Producto: agregar rápido",
  "product.quick-view": "Producto: vista rápida",
  collection: "Colección",
  "list-collections": "Lista de colecciones",
  "page.nosotros": "Página: Nosotros",
  "page.contact": "Página: Contacto",
  "page.instalacion": "Página: Instalación",
  "page.distribuidor": "Página: Distribuidor",
  "page.about-us": "Página: About us",
  page: "Página: básica",
  blog: "Blog",
  article: "Artículo del blog",
  cart: "Carrito",
  search: "Búsqueda",
  "404": "Página no encontrada (404)",
  password: "Contraseña",
  // Versiones de la portada para pruebas (/v/<versión>, sin indexar; src/lib/versiones.ts).
  "index.b1": "Portada · versión B1 (prueba)",
  "index.b2": "Portada · versión B2 (prueba)",
  "index.b3": "Portada · versión B3 (prueba)",
  "index.b4": "Portada · versión B4 (prueba)",
};

const POR_TIPO = new Map(ESQUEMA.secciones.map((s) => [s.tipo, s]));
const POR_SLUG = new Map(ESQUEMA.secciones.map((s) => [s.slug, s]));

export function seccionPorTipo(tipo: string): SeccionEsquema {
  const s = POR_TIPO.get(tipo);
  if (!s) throw new Error(`Tipo de sección sin esquema: ${tipo} (correr npm run admin:esquema)`);
  return s;
}

export function seccionPorSlug(slug: string): SeccionEsquema {
  const s = POR_SLUG.get(slug);
  if (!s) throw new Error(`Bloque desconocido: ${slug}`);
  return s;
}

/** Campos de foto o video (guardan una referencia a «Fotos y videos» en lugar del texto de la dirección). */
export function esMedio(tipo: string) {
  return tipo === "imagen" || tipo === "video";
}

/** Nombre del producto como lo guardan las reseñas: recortado a 50 letras con «...». */
export function tituloResena(titulo: string) {
  return titulo.length > 50 ? `${titulo.slice(0, 50)}...` : titulo;
}
