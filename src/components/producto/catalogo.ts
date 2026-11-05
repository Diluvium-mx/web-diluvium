// Catálogo de productos (contenido/productos.json) y datos de la tienda que no vienen en esa exportación.
// Solo para mostrar: el precio que vale para cobrar lo calcula el servidor en el paso 3 (docs/seguridad.md §2).

import datos from "@contenido/productos.json";
import { calificacionProducto, redondear } from "@/components/resenas/calificaciones";

export type ImagenProducto = { src: string; alt: string; ancho: number; alto: number };
export type Variante = {
  id: number;
  titulo: string;
  precio: number;
  precioAntes: number | null;
  opcion1: string;
  codigoBarras?: string;
  existencias?: number | null;
};
export type Producto = {
  id: number;
  nombre: string;
  titulo: string;
  descripcionHtml: string;
  opciones: { nombre: string; valores: string[] }[];
  variantes: Variante[];
  imagenes: ImagenProducto[];
  proveedor: string;
  /** Videos de la galería y en qué lugar van entre las fotos. */
  videos: { posicion: number; src: string; poster: string }[];
};

const PRODUCTOS = (datos as { productos: Producto[] }).productos;

/** «compuerta-anti-inundaciones» o «/products/compuerta-anti-inundaciones» → producto. */
export function producto(nombreOEnlace: string): Producto | undefined {
  const nombre = nombreOEnlace.replace(/^\/products\//, "");
  return PRODUCTOS.find((p) => p.nombre === nombre);
}

export function enlaceProducto(p: Producto): string {
  return `/products/${p.nombre}`;
}

// Qué productos tiene cada colección, en el orden en que salen en la tienda. La exportación no trae la membresía:
// se leyó de la portada en vivo (sección «multiple-product-tabs», 3-nov-2026).
const COLECCIONES: Record<string, string[]> = {
  "coleccion-para-escritorio": [
    "compuerta-anti-inundaciones-hecha-a-la-medida",
    "tapon-inflable-anti-inundaciones",
    "funda-de-repuesto-compuerta-anti-inundaciones",
  ],
};

export function productosDeColeccion(nombre: string, cuantos?: number): Producto[] {
  const lista = (COLECCIONES[nombre.replace(/^\/collections\//, "")] ?? [])
    .map((n) => producto(n))
    .filter((p): p is Producto => Boolean(p));
  return cuantos ? lista.slice(0, cuantos) : lista;
}

/** Proveedor que la tienda muestra en las tarjetas (ajuste «show_vendor»), tal como está en el catálogo. */
export function proveedor(p: Producto): string {
  return p.proveedor;
}

// Calificación que sale en las tarjetas (estrellas y número de reseñas): se calcula con las reseñas publicadas.
// El promedio va con 2 decimales, que es lo que mide el ancho de la estrella parcial en vivo (82 % en la XXL).
export function resenas(p: Producto) {
  const { promedio, total } = calificacionProducto(p.nombre);
  return total ? { promedio: redondear(promedio, 2), total } : undefined;
}

export type Medio =
  | ({ tipo: "imagen" } & ImagenProducto)
  | { tipo: "video"; src: string; poster: string; alt: string };


/** Fotos y videos de la galería, en el orden de la tienda. */
export function mediosProducto(p: Producto): Medio[] {
  const medios: Medio[] = p.imagenes.map((i) => ({ tipo: "imagen", ...i }));
  for (const v of p.videos) {
    medios.splice(v.posicion, 0, { tipo: "video", src: v.src, poster: v.poster, alt: p.titulo });
  }
  return medios;
}

// Formato de moneda en archivo aparte: también lo usa el carrito, que va en todas las páginas.
export { precioTexto } from "./formato-precio";

/** Precio que muestra una tarjeta: el menor, «Desde» si las variantes cuestan distinto, y el precio anterior. */
export function resumenPrecio(p: Producto) {
  const precios = p.variantes.map((v) => v.precio);
  const minimo = Math.min(...precios);
  const variante = p.variantes.find((v) => v.precio === minimo) ?? p.variantes[0];
  const antes = variante.precioAntes && variante.precioAntes > variante.precio ? variante.precioAntes : null;
  // «Rebaja hasta N %»: la mayor rebaja entre las variantes, redondeada como la tienda.
  const rebaja = Math.max(
    0,
    ...p.variantes.map((v) => (v.precioAntes && v.precioAntes > v.precio ? (v.precioAntes - v.precio) / v.precioAntes : 0)),
  );
  return {
    precio: minimo,
    antes,
    desde: new Set(precios).size > 1,
    rebajaPorciento: Math.round(rebaja * 100),
  };
}
