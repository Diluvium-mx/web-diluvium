// Búsqueda del catálogo propio: productos, colecciones, artículos del blog y páginas. La de Shopify usa sinónimos y
// parecidos (no se puede calcular igual), así que primero se usan sus respuestas guardadas para las palabras del
// catálogo (contenido/busquedas.json, herramientas/extraer-busquedas.py) y, si no hay, se busca por texto: todas las
// palabras tienen que aparecer (la última puede ir a medias, «comp» → «compuerta»).

import busquedas from "@contenido/busquedas.json";
import blog from "@contenido/blog.json";
import paginas from "@contenido/paginas.json";
import productos from "@contenido/productos.json";
import type { Producto } from "./catalogo";
import { producto, proveedor } from "./catalogo";
import type { Coleccion } from "./colecciones";
import { coleccion, todasLasColecciones } from "./colecciones";

export type Articulo = {
  titulo: string;
  url: string;
  fecha: string;
  resumen: string;
  autor: string;
  slug: string;
  imagen: { src: string; alt: string; ancho: number; alto: number } | null;
};
export type Pagina = { nombre: string; titulo: string; ruta: string };

export type Resultado =
  | { tipo: "producto"; producto: Producto }
  | { tipo: "pagina"; pagina: Pagina }
  | { tipo: "articulo"; articulo: Articulo };

type Guardada = {
  rapida: { productos: string[]; colecciones: string[]; articulos: string[]; paginas: string[] };
  pagina: { tipo: string; nombre: string }[];
};

const GUARDADAS = (busquedas as { consultas: Record<string, Guardada> }).consultas;
const ARTICULOS = (blog as unknown as { articulos: (Articulo & { cuerpo?: string })[] }).articulos;
const PAGINAS = (paginas as { paginas: (Pagina & { cuerpo?: string })[] }).paginas;
const PRODUCTOS = productos.productos.map((p) => producto(p.nombre)).filter((p): p is Producto => Boolean(p));

/** «Compuertá  XXL» → «compuerta xxl» (sin acentos ni signos, como compara la tienda). */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const sinEtiquetas = (html: string) => html.replace(/<[^>]+>/g, " ");

function coincide(texto: string, consulta: string): boolean {
  const palabras = normalizar(texto).split(" ");
  const buscadas = consulta.split(" ");
  return buscadas.every((b, i) =>
    i === buscadas.length - 1 ? palabras.some((w) => w.startsWith(b)) : palabras.includes(b) || palabras.some((w) => w.startsWith(b)),
  );
}

/** Más relevante: la palabra en el título; luego, cuántas veces sale en el texto. */
function puntos(titulo: string, texto: string, consulta: string): number {
  const t = normalizar(titulo);
  const resto = normalizar(texto);
  return consulta.split(" ").reduce((suma, b) => suma + (t.includes(b) ? 100 : 0) + resto.split(b).length - 1, 0);
}

function ordenar<T>(lista: { item: T; puntos: number }[]): T[] {
  return lista
    .map((x, i) => ({ ...x, i }))
    .sort((a, b) => b.puntos - a.puntos || a.i - b.i)
    .map((x) => x.item);
}

function textoProducto(p: Producto): string {
  return [p.titulo, proveedor(p), ...p.variantes.map((v) => v.titulo), sinEtiquetas(p.descripcionHtml)].join(" ");
}

function buscarLocal(q: string) {
  const prods = ordenar(
    PRODUCTOS.filter((p) => coincide(textoProducto(p), q)).map((p) => ({ item: p, puntos: puntos(p.titulo, textoProducto(p), q) })),
  );
  const pags = ordenar(
    PAGINAS.filter((p) => coincide(`${p.titulo} ${sinEtiquetas(p.cuerpo ?? "")}`, q)).map((p) => ({
      item: p as Pagina,
      puntos: puntos(p.titulo, sinEtiquetas(p.cuerpo ?? ""), q),
    })),
  );
  const arts = ordenar(
    ARTICULOS.filter((a) => coincide(`${a.titulo} ${a.resumen} ${sinEtiquetas(a.cuerpo ?? "")}`, q)).map((a) => ({
      item: a as Articulo,
      puntos: puntos(a.titulo, `${a.resumen} ${sinEtiquetas(a.cuerpo ?? "")}`, q),
    })),
  );
  const cols = todasLasColecciones().filter((c) => c.nombre !== "all" && coincide(c.titulo, q));
  return { prods, pags, arts, cols };
}

const articulo = (slug: string) => ARTICULOS.find((a) => a.slug === slug);
const pagina = (nombre: string) => PAGINAS.find((p) => p.nombre === nombre);

/** Resultados de la página /search, en el orden de la tienda (productos, luego páginas y artículos). */
export function buscarPagina(consulta: string): Resultado[] {
  const q = normalizar(consulta);
  if (!q) return [];
  const guardada = GUARDADAS[q];
  if (guardada) {
    return guardada.pagina.flatMap((r): Resultado[] => {
      if (r.tipo === "producto") {
        const p = producto(r.nombre);
        return p ? [{ tipo: "producto", producto: p }] : [];
      }
      if (r.tipo === "pagina") {
        const p = pagina(r.nombre);
        return p ? [{ tipo: "pagina", pagina: p }] : [];
      }
      const a = articulo(r.nombre);
      return a ? [{ tipo: "articulo", articulo: a }] : [];
    });
  }
  const { prods, pags, arts } = buscarLocal(q);
  // La tienda nunca deja la página vacía: aunque nada coincida («zzzzqq») muestra productos parecidos. Aquí, el
  // catálogo completo.
  if (!prods.length && !pags.length && !arts.length) return PRODUCTOS.map((p): Resultado => ({ tipo: "producto", producto: p }));
  return [
    ...prods.map((p): Resultado => ({ tipo: "producto", producto: p })),
    ...pags.map((p): Resultado => ({ tipo: "pagina", pagina: p })),
    ...arts.map((a): Resultado => ({ tipo: "articulo", articulo: a })),
  ];
}

export type Sugerencias = { productos: Producto[]; colecciones: Coleccion[]; articulos: Articulo[]; paginas: Pagina[] };

/** Resultados rápidos del buscador del encabezado (hasta 10 de cada tipo, como el tema). */
export function buscarRapido(consulta: string): Sugerencias {
  const q = normalizar(consulta);
  const vacio: Sugerencias = { productos: [], colecciones: [], articulos: [], paginas: [] };
  if (!q) return vacio;
  const guardada = GUARDADAS[q];
  if (guardada) {
    const r = guardada.rapida;
    return {
      productos: r.productos.map((n) => producto(n)).filter((p): p is Producto => Boolean(p)),
      colecciones: r.colecciones.map((n) => coleccion(n)).filter((c): c is Coleccion => Boolean(c)),
      articulos: r.articulos.map((n) => articulo(n)).filter((a): a is Articulo & { cuerpo?: string } => Boolean(a)),
      paginas: r.paginas.map((n) => pagina(n)).filter((p): p is Pagina & { cuerpo?: string } => Boolean(p)),
    };
  }
  const { prods, pags, arts, cols } = buscarLocal(q);
  return { productos: prods.slice(0, 10), colecciones: cols.slice(0, 10), articulos: arts.slice(0, 10), paginas: pags.slice(0, 10) };
}
