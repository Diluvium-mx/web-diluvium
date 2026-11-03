// Aire de arriba de las secciones. Regla medida en vivo (3-nov-2026): cuando la sección anterior tiene el mismo color
// de fondo, el tema le quita el aire de arriba (para que dos secciones del mismo color no dejen doble hueco). Las
// secciones sin color propio (banners, franjas, espaciadores, logos, el producto principal) no cuentan como anterior.
// Además, cada sección puede quitar su aire de arriba o de abajo con «remove_padding_top» / «remove_padding_bottom».

import productos from "@contenido/productos.json";
import type { Producto } from "@/components/producto/catalogo";
import type { Seccion } from "@/lib/contenido";
import { plantilla, plantillaProducto, siNo, texto } from "@/lib/contenido";

// Fondo de cada esquema de color (los mismos de globals.css). Esquemas con el mismo fondo cuentan como iguales.
const FONDOS: Record<string, string> = {
  "scheme-1": "#ffffff",
  "scheme-2": "#ecf0f3",
  "scheme-3": "#004288",
  "scheme-4": "#004288",
  "scheme-5": "transparent",
  "scheme-6": "#ffffff",
};

// Tipos que no le pasan su fondo a la sección siguiente.
const SIN_FONDO_PROPIO = new Set([
  "main-product",
  "image-banner",
  "running-content",
  "spacer",
  "logos",
  "scrolling-logos",
  "whatsapp-form",
]);

/** Secciones de la página donde está la sección: la plantilla del producto o, si no hay producto, la portada. */
function seccionesDeLaPagina(producto?: Producto): Seccion[] {
  if (producto) {
    const datos = productos.productos.find((p) => p.nombre === producto.nombre);
    return plantillaProducto(datos?.plantilla ?? "").secciones;
  }
  return plantilla("portada").secciones;
}

function fondo(seccion: Seccion): string {
  return FONDOS[texto(seccion.ajustes, "color_scheme") || "scheme-1"] ?? FONDOS["scheme-1"];
}

/** ¿La sección va sin aire arriba? (por su ajuste o porque la anterior tiene el mismo fondo) */
export function sinAireArriba(seccion: Seccion, producto?: Producto): boolean {
  if (siNo(seccion.ajustes, "remove_padding_top")) return true;
  const lista = seccionesDeLaPagina(producto);
  const i = lista.findIndex((s) => s.id === seccion.id);
  const anterior = i > 0 ? lista[i - 1] : undefined;
  if (!anterior || SIN_FONDO_PROPIO.has(anterior.tipo)) return false;
  return fondo(anterior) === fondo(seccion);
}

/** Clases de aire de arriba y abajo de una sección (var(--aire): 64 px celular, 96 px desde tableta). */
export function clasesAire(seccion: Seccion, producto?: Producto): string {
  const arriba = sinAireArriba(seccion, producto) ? "pt-0" : "pt-[var(--aire)]";
  const abajo = siNo(seccion.ajustes, "remove_padding_bottom") ? "pb-0" : "pb-[var(--aire)]";
  return `${arriba} ${abajo}`;
}
