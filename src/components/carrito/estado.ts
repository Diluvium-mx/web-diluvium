"use client";

// Carrito del navegador, compartido por el encabezado (número de la bolsa), el carrito lateral y /cart. Se guarda en
// localStorage solo como «variante y piezas»; precio, título y foto salen del catálogo (./catalogo.ts). Funciona
// como la tienda en vivo: lo último que se agrega va arriba y nunca pasa de las piezas en existencia.
// Paso 3: el pedido se arma en el servidor con estas líneas, recalculando precios (docs/seguridad.md §2).

import { useSyncExternalStore } from "react";
import { articulo, type ArticuloCatalogo } from "./catalogo";

export type Linea = { id: number; cantidad: number };
export type LineaCompleta = Linea & { articulo: ArticuloCatalogo };

const CLAVE = "diluvium-carrito";
const VACIO: Linea[] = [];

// Lo último leído: useSyncExternalStore necesita la misma referencia mientras no cambie el contenido guardado.
let leido: { crudo: string | null; lineas: Linea[] } = { crudo: null, lineas: VACIO };
const oyentes = new Set<() => void>();

/** Deja solo líneas válidas: variante que existe en el catálogo, piezas enteras y dentro de las existencias. */
function limpiar(datos: unknown): Linea[] {
  if (!Array.isArray(datos)) return VACIO;
  const lineas: Linea[] = [];
  for (const d of datos) {
    const id = Number((d as Linea)?.id);
    const cantidad = Math.floor(Number((d as Linea)?.cantidad));
    const a = articulo(id);
    if (!a || !(cantidad > 0) || lineas.some((l) => l.id === id)) continue;
    const tope = a.existencias === null ? cantidad : Math.min(cantidad, a.existencias);
    if (tope > 0) lineas.push({ id, cantidad: tope });
  }
  return lineas;
}

function leer(): Linea[] {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE);
  } catch {
    // Sin acceso al almacenamiento (modo privado estricto): el carrito vive solo en memoria.
    return leido.lineas;
  }
  if (crudo === leido.crudo) return leido.lineas;
  let lineas = VACIO;
  try {
    lineas = crudo ? limpiar(JSON.parse(crudo)) : VACIO;
  } catch {
    lineas = VACIO;
  }
  leido = { crudo, lineas };
  return lineas;
}

function guardar(lineas: Linea[]) {
  const crudo = JSON.stringify(lineas);
  leido = { crudo, lineas };
  try {
    window.localStorage.setItem(CLAVE, crudo);
  } catch {
    // Sin almacenamiento: queda en memoria hasta recargar.
  }
  for (const avisar of oyentes) avisar();
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  // Otra pestaña cambió el carrito.
  const alCambiar = (e: StorageEvent) => e.key === CLAVE && avisar();
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiar);
  };
}

/** Líneas del carrito (en el servidor y antes de hidratar, vacío). */
export function useLineas(): Linea[] {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

/** Líneas con los datos del catálogo, piezas totales y suma. */
export function useCarrito() {
  const lineas = useLineas();
  const completas: LineaCompleta[] = [];
  for (const l of lineas) {
    const a = articulo(l.id);
    if (a) completas.push({ ...l, articulo: a });
  }
  return {
    lineas: completas,
    piezas: completas.reduce((s, l) => s + l.cantidad, 0),
    total: completas.reduce((s, l) => s + l.articulo.precio * l.cantidad, 0),
  };
}

/** Resultado de agregar o cambiar piezas: si se topó con las existencias, cuántas hay (para el aviso). */
export type Resultado = { tope: number | null };

/** «Debido a la disponibilidad, solo se añadieron N artículos al carrito.», como el aviso de la tienda. */
export function avisoExistencias(tope: number): string {
  return tope === 1
    ? "Debido a la disponibilidad, solo se añadió un artículo al carrito."
    : `Debido a la disponibilidad, solo se añadieron ${tope} artículos al carrito.`;
}

/** Suma piezas de una variante. Si ya estaba, se queda en su lugar; si es nueva, va arriba (como en vivo). */
export function agregar(id: number, cantidad: number): Resultado {
  const a = articulo(id);
  if (!a || !(cantidad > 0)) return { tope: null };
  const lineas = leer();
  const antes = lineas.find((l) => l.id === id)?.cantidad ?? 0;
  const pedida = antes + Math.floor(cantidad);
  const final = a.existencias === null ? pedida : Math.min(pedida, a.existencias);
  if (final > antes) {
    guardar(antes ? lineas.map((l) => (l.id === id ? { id, cantidad: final } : l)) : [{ id, cantidad: final }, ...lineas]);
  }
  return { tope: final < pedida ? (a.existencias ?? null) : null };
}

/** Pone las piezas de una línea (0 la quita). */
export function cambiar(id: number, cantidad: number): Resultado {
  const a = articulo(id);
  const lineas = leer();
  if (!a || !lineas.some((l) => l.id === id)) return { tope: null };
  const pedida = Math.max(0, Math.floor(cantidad) || 0);
  if (pedida === 0) {
    guardar(lineas.filter((l) => l.id !== id));
    return { tope: null };
  }
  const final = a.existencias === null ? pedida : Math.min(pedida, a.existencias);
  guardar(lineas.map((l) => (l.id === id ? { id, cantidad: final } : l)));
  return { tope: final < pedida ? (a.existencias ?? null) : null };
}

export function quitar(id: number) {
  cambiar(id, 0);
}

/** Deja el carrito vacío (al terminar un pedido en la pantalla de pago). */
export function vaciar() {
  guardar(VACIO);
}

// Abrir el carrito lateral desde cualquier parte (la ficha, «Quick add»). El encabezado es quien lo dibuja.
type AlAbrir = (opciones: { anadido: boolean }) => void;
const abridores = new Set<AlAbrir>();

/** Abre el carrito lateral; «anadido» muestra «Producto añadido al carrito» arriba, como tras agregar en vivo. */
export function abrirCarrito(opciones: { anadido: boolean } = { anadido: false }) {
  for (const abrir of abridores) abrir(opciones);
}

export function alAbrirCarrito(abrir: AlAbrir) {
  abridores.add(abrir);
  return () => {
    abridores.delete(abrir);
  };
}
