// Datos de la ficha de producto que la exportación del catálogo no trae. Leídos de la tienda en vivo el 3-nov-2026;
// en el paso 2 salen del administrador y del inventario real. Solo para mostrar.

import type { Producto, Variante } from "../catalogo";

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
export function existencias(v: Variante): number | null {
  return EXISTENCIAS[v.id] ?? null;
}

export function disponible(v: Variante): boolean {
  const n = existencias(v);
  return n === null || n > 0;
}

// Calificación del widget de reseñas de la ficha (Trustoo): promedio con un decimal y número de reseñas.
const CALIFICACION: Record<string, { promedio: number; total: number }> = {
  "compuerta-anti-inundaciones": { promedio: 4.9, total: 204 },
  "compuerta-anti-inundaciones-hecha-a-la-medida": { promedio: 4.8, total: 22 },
  "mini-compuerta": { promedio: 0, total: 0 },
  "tapon-inflable-anti-inundaciones": { promedio: 5, total: 10 },
  "funda-de-repuesto-compuerta-anti-inundaciones": { promedio: 5, total: 2 },
  "accesorio-tira-de-hule-de-repuesto": { promedio: 0, total: 0 },
  "accesorio-plastilina-de-secado-rapido": { promedio: 0, total: 0 },
};

export function calificacion(p: Producto) {
  return CALIFICACION[p.nombre] ?? { promedio: 0, total: 0 };
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
