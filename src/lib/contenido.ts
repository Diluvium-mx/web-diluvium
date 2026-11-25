// Contenido de la página, sacado del tema publicado de Shopify (npm run contenido → contenido/tema/*.json).
// En el paso 2 este archivo cambia para leer del administrador; las secciones no se enteran.

import ajustesTema from "@contenido/tema/ajustes.json";
import encabezado from "@contenido/tema/header-group.json";
import pie from "@contenido/tema/footer-group.json";
import portada from "@contenido/tema/index.json";
// Versiones de la portada para pruebas (/v/<versión>, sin indexar; src/lib/versiones.ts).
import portadaB1 from "@contenido/tema/index.b1.json";
// Ficha nueva de la compuerta en cada versión (/v/<versión>/products/<producto>; mapa de calor del 11-nov-2026).
import productoB1 from "@contenido/tema/product.b1.json";
import portadaC1 from "@contenido/tema/index.c1.json";
import productoC1 from "@contenido/tema/product.c1.json";
// Las demás páginas de C1 y todas las de D1 (25-nov-2026).
import t_coleccion_c1 from "@contenido/tema/collection.c1.json";
import t_producto_c1_mini from "@contenido/tema/product.c1.mini-compuerta.json";
import t_producto_c1_medida from "@contenido/tema/product.c1.medida-especial.json";
import t_producto_c1_tapon from "@contenido/tema/product.c1.tapon-inflable.json";
import t_producto_c1_funda from "@contenido/tema/product.c1.funda.json";
import t_producto_c1_tira from "@contenido/tema/product.c1.tira.json";
import t_producto_c1_plastilina from "@contenido/tema/product.c1.plastilina.json";
import t_contacto_c1 from "@contenido/tema/page.contact.c1.json";
import t_nosotros_c1 from "@contenido/tema/page.nosotros.c1.json";
import t_blog_c1 from "@contenido/tema/blog.c1.json";
import t_articulo_c1 from "@contenido/tema/article.c1.json";
import t_portada_d1 from "@contenido/tema/index.d1.json";
import t_producto_d1 from "@contenido/tema/product.d1.json";
import t_coleccion_d1 from "@contenido/tema/collection.d1.json";
import t_producto_d1_mini from "@contenido/tema/product.d1.mini-compuerta.json";
import t_producto_d1_medida from "@contenido/tema/product.d1.medida-especial.json";
import t_producto_d1_tapon from "@contenido/tema/product.d1.tapon-inflable.json";
import t_producto_d1_funda from "@contenido/tema/product.d1.funda.json";
import t_producto_d1_tira from "@contenido/tema/product.d1.tira.json";
import t_producto_d1_plastilina from "@contenido/tema/product.d1.plastilina.json";
import t_contacto_d1 from "@contenido/tema/page.contact.d1.json";
import t_nosotros_d1 from "@contenido/tema/page.nosotros.d1.json";
import t_blog_d1 from "@contenido/tema/blog.d1.json";
import t_articulo_d1 from "@contenido/tema/article.d1.json";
// Las demás páginas de B1 (23-nov-2026): Contacto, Nosotros, Blog, artículo, Productos y las fichas de los demás productos.
import contactoB1 from "@contenido/tema/page.contact.b1.json";
import nosotrosB1 from "@contenido/tema/page.nosotros.b1.json";
import blogB1 from "@contenido/tema/blog.b1.json";
import articuloB1 from "@contenido/tema/article.b1.json";
import coleccionB1 from "@contenido/tema/collection.b1.json";
import miniB1 from "@contenido/tema/product.b1.mini-compuerta.json";
import medidaB1 from "@contenido/tema/product.b1.medida-especial.json";
import taponB1 from "@contenido/tema/product.b1.tapon-inflable.json";
import fundaB1 from "@contenido/tema/product.b1.funda.json";
import tiraB1 from "@contenido/tema/product.b1.tira.json";
import plastilinaB1 from "@contenido/tema/product.b1.plastilina.json";
import productoGeneral from "@contenido/tema/product.json";
import productoCompuerta from "@contenido/tema/product.compuerta-estandar-2.json";
import productoMedida from "@contenido/tema/product.medida-especial.json";
import productoMini from "@contenido/tema/product.mini-compuerta.json";
import productoTapon from "@contenido/tema/product.tapon-inflable.json";
import paginaGeneral from "@contenido/tema/page.json";
import paginaNosotros from "@contenido/tema/page.nosotros.json";
import paginaContacto from "@contenido/tema/page.contact.json";
import paginaInstalacion from "@contenido/tema/page.instalacion.json";
import paginaDistribuidor from "@contenido/tema/page.distribuidor.json";
import blog from "@contenido/tema/blog.json";
import articulo from "@contenido/tema/article.json";
import coleccion from "@contenido/tema/collection.json";
import listaColecciones from "@contenido/tema/list-collections.json";
import carrito from "@contenido/tema/cart.json";
import busqueda from "@contenido/tema/search.json";
import noEncontrada from "@contenido/tema/404.json";

export type Ajustes = Record<string, unknown>;
export type Bloque = { id: string; tipo: string; ajustes: Ajustes };
export type Seccion = { id: string; tipo: string; ajustes: Ajustes; bloques: Bloque[] };
export type Plantilla = { fuente: string; secciones: Seccion[] };

const PLANTILLAS = {
  portada: portada as Plantilla,
  "portada.b1": portadaB1 as Plantilla,
  "producto.b1": productoB1 as Plantilla,
  "portada.c1": portadaC1 as Plantilla,
  "producto.c1": productoC1 as Plantilla,
  "coleccion.c1": t_coleccion_c1 as Plantilla,
  "producto.c1.mini": t_producto_c1_mini as Plantilla,
  "producto.c1.medida": t_producto_c1_medida as Plantilla,
  "producto.c1.tapon": t_producto_c1_tapon as Plantilla,
  "producto.c1.funda": t_producto_c1_funda as Plantilla,
  "producto.c1.tira": t_producto_c1_tira as Plantilla,
  "producto.c1.plastilina": t_producto_c1_plastilina as Plantilla,
  "contacto.c1": t_contacto_c1 as Plantilla,
  "nosotros.c1": t_nosotros_c1 as Plantilla,
  "blog.c1": t_blog_c1 as Plantilla,
  "articulo.c1": t_articulo_c1 as Plantilla,
  "portada.d1": t_portada_d1 as Plantilla,
  "producto.d1": t_producto_d1 as Plantilla,
  "coleccion.d1": t_coleccion_d1 as Plantilla,
  "producto.d1.mini": t_producto_d1_mini as Plantilla,
  "producto.d1.medida": t_producto_d1_medida as Plantilla,
  "producto.d1.tapon": t_producto_d1_tapon as Plantilla,
  "producto.d1.funda": t_producto_d1_funda as Plantilla,
  "producto.d1.tira": t_producto_d1_tira as Plantilla,
  "producto.d1.plastilina": t_producto_d1_plastilina as Plantilla,
  "contacto.d1": t_contacto_d1 as Plantilla,
  "nosotros.d1": t_nosotros_d1 as Plantilla,
  "blog.d1": t_blog_d1 as Plantilla,
  "articulo.d1": t_articulo_d1 as Plantilla,
  "contacto.b1": contactoB1 as Plantilla,
  "nosotros.b1": nosotrosB1 as Plantilla,
  "blog.b1": blogB1 as Plantilla,
  "articulo.b1": articuloB1 as Plantilla,
  "coleccion.b1": coleccionB1 as Plantilla,
  "producto.b1.mini": miniB1 as Plantilla,
  "producto.b1.medida": medidaB1 as Plantilla,
  "producto.b1.tapon": taponB1 as Plantilla,
  "producto.b1.funda": fundaB1 as Plantilla,
  "producto.b1.tira": tiraB1 as Plantilla,
  "producto.b1.plastilina": plastilinaB1 as Plantilla,
  encabezado: encabezado as Plantilla,
  pie: pie as Plantilla,
  product: productoGeneral as Plantilla,
  "product.compuerta-estandar-2": productoCompuerta as Plantilla,
  "product.medida-especial": productoMedida as Plantilla,
  "product.mini-compuerta": productoMini as Plantilla,
  "product.tapon-inflable": productoTapon as Plantilla,
  "page": paginaGeneral as Plantilla,
  "page.nosotros": paginaNosotros as Plantilla,
  "page.contact": paginaContacto as Plantilla,
  "page.instalacion": paginaInstalacion as Plantilla,
  "page.distribuidor": paginaDistribuidor as Plantilla,
  "blog": blog as Plantilla,
  "article": articulo as Plantilla,
  "collection": coleccion as Plantilla,
  "list-collections": listaColecciones as Plantilla,
  "cart": carrito as Plantilla,
  "search": busqueda as Plantilla,
  "404": noEncontrada as Plantilla,
};

export type NombrePlantilla = keyof typeof PLANTILLAS;

/** Plantilla del tema que usa un producto («compuerta-estandar-2» → «product.compuerta-estandar-2»). */
export function plantillaProducto(sufijo: string): Plantilla {
  const nombre = (sufijo ? `product.${sufijo}` : "product") as NombrePlantilla;
  return PLANTILLAS[nombre] ?? PLANTILLAS.product;
}

export function plantilla(nombre: NombrePlantilla): Plantilla {
  return PLANTILLAS[nombre];
}

export const ajustesGlobales = ajustesTema as Ajustes;

export function texto(ajustes: Ajustes, clave: string): string {
  const valor = ajustes[clave];
  return typeof valor === "string" ? valor : "";
}

export function numero(ajustes: Ajustes, clave: string, porDefecto = 0): number {
  const valor = ajustes[clave];
  if (typeof valor === "number") return valor;
  if (typeof valor === "string" && valor.trim() !== "" && !Number.isNaN(Number(valor))) return Number(valor);
  return porDefecto;
}

export function siNo(ajustes: Ajustes, clave: string): boolean {
  const valor = ajustes[clave];
  return valor === true || valor === "true";
}

/** «scheme-3» → «esquema-3» (clases de globals.css). */
export function esquema(ajustes: Ajustes, porDefecto = "scheme-1"): string {
  const valor = texto(ajustes, "color_scheme") || porDefecto;
  return valor.replace("scheme-", "esquema-");
}

export function bloquesDe(seccion: Seccion, tipo: string): Bloque[] {
  return seccion.bloques.filter((b) => b.tipo === tipo);
}
