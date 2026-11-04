// Lo que el carrito necesita saber de cada variante, leído del catálogo (contenido/productos.json) y de las
// existencias. El carrito guarda solo «variante y piezas»: precio, título y foto se buscan siempre aquí, nunca se
// guardan. Solo para mostrar: el precio que vale para cobrar lo calcula el servidor en el paso 3 (docs/seguridad.md §2).
//
// No importa ../producto/catalogo.ts a propósito: ese archivo trae las reseñas y el carrito va en todas las páginas.

import datos from "@contenido/productos.json";
import type { Producto } from "@/components/producto/catalogo";
import { existenciasVariante } from "@/components/producto/ficha/existencias";

export type ArticuloCatalogo = {
  id: number;
  /** Nombre del producto en la dirección: /products/<nombre>. */
  producto: string;
  titulo: string;
  /** Tamaño elegido; null en productos sin opciones («Default Title»). */
  opcion: string | null;
  precio: number;
  /** Precio anterior tachado, solo si es mayor que el actual. */
  precioAntes: number | null;
  imagen: { src: string; alt: string } | null;
  /** Piezas en existencia; null: sin control de inventario. */
  existencias: number | null;
};

type VarianteCruda = Producto["variantes"][number] & { imagen?: string | null };

const PRODUCTOS = (datos as { productos: Producto[] }).productos;

const ARTICULOS = new Map<number, ArticuloCatalogo>();
for (const p of PRODUCTOS) {
  const sinOpciones = p.variantes.length === 1 && p.variantes[0].titulo === "Default Title";
  for (const v of p.variantes as VarianteCruda[]) {
    // La foto de la variante si tiene; si no, la primera del producto (como la tienda).
    const foto = (v.imagen && p.imagenes.find((i) => i.src === v.imagen)) || p.imagenes[0];
    ARTICULOS.set(v.id, {
      id: v.id,
      producto: p.nombre,
      titulo: p.titulo,
      opcion: sinOpciones ? null : v.titulo,
      precio: v.precio,
      precioAntes: v.precioAntes && v.precioAntes > v.precio ? v.precioAntes : null,
      imagen: foto ? { src: foto.src, alt: p.titulo } : null,
      existencias: existenciasVariante(v.id),
    });
  }
}

export function articulo(id: number): ArticuloCatalogo | undefined {
  return ARTICULOS.get(id);
}

/** Variantes de un producto en el orden de la tienda (para la ventana «Quick add»). */
export function articulosDeProducto(nombre: string): ArticuloCatalogo[] {
  return [...ARTICULOS.values()].filter((a) => a.producto === nombre);
}

/** Enlace de la línea del carrito: la ficha con la variante elegida, como en vivo. */
export function enlaceArticulo(a: ArticuloCatalogo): string {
  return `/products/${a.producto}?variant=${a.id}`;
}

/** Monto para el envío gratis (ajuste del tema «cart_minimum_order_price_for_free_shipping»). */
export const ENVIO_GRATIS_DESDE = 499;
