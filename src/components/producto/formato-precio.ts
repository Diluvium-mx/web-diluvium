// Formato de moneda de la tienda. Archivo aparte y sin dependencias: lo usan las tarjetas, la ficha y el carrito.

/** 5500 → «$ 5,500.00 MXN», como el formato de moneda de la tienda. */
export function precioTexto(cantidad: number): string {
  const numero = cantidad.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$ ${numero} MXN`;
}
