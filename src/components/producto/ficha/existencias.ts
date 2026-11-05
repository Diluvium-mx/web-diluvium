// Piezas en existencia de cada variante, tal como están en el catálogo (contenido/productos.json, que se edita en el
// administrador). Archivo aparte y ligero: lo usan la ficha de producto y el carrito, que va en todas las páginas.
// La tienda las muestra como «Disponibles: N» / «Pocas unidades: N» / «Agotado».

import datos from "@contenido/productos.json";

const EXISTENCIAS = new Map<number, number | null>();
for (const p of datos.productos) {
  for (const v of p.variantes as { id: number; existencias?: number | null }[]) EXISTENCIAS.set(v.id, v.existencias ?? null);
}

/** Piezas en existencia; sin dato (p. ej. la compuerta hecha a la medida) cuenta como disponible sin número. */
export function existenciasVariante(id: number): number | null {
  return EXISTENCIAS.get(id) ?? null;
}
