// Datos de la ficha de producto que la exportación del catálogo no trae. Las existencias se leyeron de la tienda en
// vivo el 3-nov-2026 y en el paso 2 salen del administrador y del inventario real. Solo para mostrar.

import type { Producto, Variante } from "../catalogo";
import { calificacionProducto, redondear } from "@/components/resenas/calificaciones";
// Existencias de un archivo aparte: también las lee el carrito, que va en todas las páginas, sin cargar las reseñas.
import { existenciasVariante } from "./existencias";

/** Piezas en existencia; sin dato (p. ej. la compuerta hecha a la medida) cuenta como disponible sin número. */
export function existencias(v: Variante): number | null {
  return existenciasVariante(v.id);
}

export function disponible(v: Variante): boolean {
  const n = existencias(v);
  return n === null || n > 0;
}

// Calificación del widget de reseñas de la ficha (Trustoo): promedio con un decimal y número de reseñas, calculados
// con las reseñas publicadas del producto.
export function calificacion(p: Producto) {
  const { promedio, total } = calificacionProducto(p.nombre);
  return { promedio: redondear(promedio, 1), total };
}

/** La tienda abre la ficha en la primera variante que se puede comprar. */
export function varianteInicial(p: Producto): number {
  const i = p.variantes.findIndex(disponible);
  return i < 0 ? 0 : i;
}

/** Producto con una sola variante «Default Title»: no lleva selector de tamaño. */
export function sinOpciones(p: Producto): boolean {
  return p.variantes.length === 1 && p.variantes[0].titulo === "Default Title";
}
