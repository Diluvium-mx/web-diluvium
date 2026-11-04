// Piezas en existencia por variante, leídas de la tienda en vivo el 3-nov-2026 (en el paso 2 salen del inventario
// real). Archivo aparte y sin dependencias: lo usan la ficha de producto y el carrito.

// Piezas disponibles por variante (la tienda las muestra como «Disponibles: N» / «Pocas unidades: N» / «Agotado»).
const EXISTENCIAS: Record<number, number> = {
  // Compuerta Anti-Inundaciones
  46431147524316: 5,
  43039686131932: 4,
  43039686164700: 5,
  43039686197468: 10,
  43039686263004: 9,
  // Mini Compuerta: solo queda la F
  52105554002140: 0,
  52105554034908: 0,
  52105554067676: 0,
  52105554100444: 0,
  52105554133212: 0,
  52105554165980: 1,
  52262791741660: 0,
  // Tapón inflable
  43040043106524: 8,
  43040043139292: 18,
  43040043172060: 0,
  // Funda de repuesto
  46502739804380: 15,
  43040646594780: 13,
  43040646627548: 12,
  43040646660316: 12,
  43040646693084: 11,
  // Tira de hule y plastilina
  43060987920604: 27,
  43061007941852: 31,
};

/** Piezas en existencia; sin dato (p. ej. la compuerta hecha a la medida) cuenta como disponible sin número. */
export function existenciasVariante(id: number): number | null {
  return EXISTENCIAS[id] ?? null;
}
