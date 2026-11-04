// Calificación de cada producto calculada con sus reseñas publicadas (contenido/resenas.json), en lugar de copiarla a
// mano: el promedio y el total salen iguales a los que muestra la tienda en vivo (4.94 con 204 en la compuerta, 4.82
// con 22 en la XXL…). Al llegar una reseña nueva, la calificación se actualiza sola.

import resenas from "@contenido/resenas.json";

type Resena = { calificacion: number; producto?: { url: string } };
export type Calificacion = { promedio: number; total: number };

const PAGINA = resenas.pagina as Resena[];

function resumen(lista: Resena[]): Calificacion {
  if (!lista.length) return { promedio: 0, total: 0 };
  return { promedio: lista.reduce((s, r) => s + r.calificacion, 0) / lista.length, total: lista.length };
}

const POR_PRODUCTO = new Map<string, Calificacion>();
for (const url of new Set(PAGINA.map((r) => r.producto?.url).filter((u): u is string => Boolean(u)))) {
  POR_PRODUCTO.set(url.replace(/^\/products\//, ""), resumen(PAGINA.filter((r) => r.producto?.url === url)));
}

/** Promedio sin redondear y número de reseñas publicadas de un producto (por su nombre en la dirección). */
export function calificacionProducto(nombre: string): Calificacion {
  return POR_PRODUCTO.get(nombre) ?? { promedio: 0, total: 0 };
}

/** Todas las reseñas de la tienda juntas (el «4.9 estrellas basadas en 238 reseñas» de la portada). */
export function calificacionTienda(): Calificacion {
  return resumen(PAGINA);
}

/** Redondeo como lo muestra la tienda (1 decimal en el texto, 2 para el ancho de la estrella parcial). */
export function redondear(n: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
}
