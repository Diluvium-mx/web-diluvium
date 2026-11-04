// Colecciones de la tienda (contenido/colecciones.json, sale de herramientas/extraer-colecciones.py): título, foto,
// productos y su orden con cada opción de «Filtrar por», más el filtrado por existencia y precio como en Shopify.

import datos from "@contenido/colecciones.json";
import type { Producto } from "./catalogo";
import { producto } from "./catalogo";

export type Coleccion = {
  nombre: string;
  titulo: string;
  descripcionHtml: string;
  imagenCompartir: string;
  imagen?: string;
  orden: string;
  productos: string[];
  ordenes: Record<string, string[]>;
};

const COLECCIONES = (datos as { colecciones: Coleccion[] }).colecciones;

/** Orden de las tarjetas en /collections (como la tienda: alfabético, sin «Productos»). */
export const LISTA_COLECCIONES: string[] = (datos as { lista: string[] }).lista;

/** Opciones de «Filtrar por» con los textos de la tienda. */
export const ORDENES: { valor: string; texto: string }[] = [
  { valor: "manual", texto: "Características" },
  { valor: "most-relevant", texto: "Más relevantes" },
  { valor: "best-selling", texto: "Más vendidos" },
  { valor: "title-ascending", texto: "Alfabéticamente, A-Z" },
  { valor: "title-descending", texto: "Alfabéticamente, Z-A" },
  { valor: "price-ascending", texto: "Precio, menor a mayor" },
  { valor: "price-descending", texto: "Precio, mayor a menor" },
  { valor: "created-ascending", texto: "Fecha: antiguo(a) a reciente" },
  { valor: "created-descending", texto: "Fecha: reciente a antiguo(a)" },
];

export function coleccion(nombre: string): Coleccion | undefined {
  return COLECCIONES.find((c) => c.nombre === nombre);
}

export function todasLasColecciones(): Coleccion[] {
  return COLECCIONES;
}

function lista(nombres: string[]): Producto[] {
  return nombres.map((n) => producto(n)).filter((p): p is Producto => Boolean(p));
}

/** Filtros de la dirección, con los mismos nombres que Shopify (?filter.v.availability=1&filter.v.price.gte=…). */
export type Filtros = { orden: string; soloExistencia: boolean; desde: number | null; hasta: number | null };

type Parametros = Record<string, string | string[] | undefined>;

function valor(p: Parametros, clave: string): string {
  const v = p[clave];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function cantidad(texto: string): number | null {
  if (texto.trim() === "") return null;
  const n = Number(texto.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function leerFiltros(p: Parametros, ordenPorDefecto: string, validos = ORDENES.map((o) => o.valor)): Filtros {
  const orden = valor(p, "sort_by");
  return {
    orden: validos.includes(orden) ? orden : ordenPorDefecto,
    soloExistencia: valor(p, "filter.v.availability") === "1",
    desde: cantidad(valor(p, "filter.v.price.gte")),
    hasta: cantidad(valor(p, "filter.v.price.lte")),
  };
}

/** Precio más alto de la colección (tope del filtro de precio). */
export function precioMaximo(productos: Producto[]): number {
  return Math.max(0, ...productos.flatMap((p) => p.variantes.map((v) => v.precio)));
}

/** Productos de la colección en el orden pedido. */
export function productosOrdenados(c: Coleccion, orden: string): Producto[] {
  return lista(c.ordenes[orden] ?? c.ordenes[c.orden] ?? c.productos);
}

/** Como Shopify: un producto pasa el filtro de precio si alguna de sus variantes cae en el rango. Hoy todos los
 *  productos de la tienda tienen existencia, así que «Solo en stock» no quita ninguno. */
export function aplicarFiltros(productos: Producto[], f: Filtros): Producto[] {
  return productos.filter((p) =>
    p.variantes.some((v) => (f.desde === null || v.precio >= f.desde) && (f.hasta === null || v.precio <= f.hasta)),
  );
}

export function hayFiltros(f: Filtros): boolean {
  return f.soloExistencia || f.desde !== null || f.hasta !== null;
}

/** Dirección con los filtros dados (en el orden en que la arma la tienda). */
export function direccion(base: string, f: Omit<Partial<Filtros>, "orden"> & { orden?: string | null }): string {
  const q: string[] = [];
  if (f.soloExistencia) q.push("filter.v.availability=1");
  if (f.desde !== null && f.desde !== undefined) q.push(`filter.v.price.gte=${f.desde}`);
  if (f.hasta !== null && f.hasta !== undefined) q.push(`filter.v.price.lte=${f.hasta}`);
  if (f.orden) q.push(`sort_by=${f.orden}`);
  if (!q.length) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${q.join("&")}`;
}
