// Contenido de la página, sacado del tema publicado de Shopify (npm run contenido → contenido/tema/*.json).
// En el paso 2 este archivo cambia para leer del administrador; las secciones no se enteran.

import ajustesTema from "@contenido/tema/ajustes.json";
import encabezado from "@contenido/tema/header-group.json";
import pie from "@contenido/tema/footer-group.json";
import portada from "@contenido/tema/index.json";
import productoGeneral from "@contenido/tema/product.json";
import productoCompuerta from "@contenido/tema/product.compuerta-estandar-2.json";
import productoMedida from "@contenido/tema/product.medida-especial.json";
import productoMini from "@contenido/tema/product.mini-compuerta.json";
import productoTapon from "@contenido/tema/product.tapon-inflable.json";

export type Ajustes = Record<string, unknown>;
export type Bloque = { id: string; tipo: string; ajustes: Ajustes };
export type Seccion = { id: string; tipo: string; ajustes: Ajustes; bloques: Bloque[] };
export type Plantilla = { fuente: string; secciones: Seccion[] };

const PLANTILLAS = {
  portada: portada as Plantilla,
  encabezado: encabezado as Plantilla,
  pie: pie as Plantilla,
  product: productoGeneral as Plantilla,
  "product.compuerta-estandar-2": productoCompuerta as Plantilla,
  "product.medida-especial": productoMedida as Plantilla,
  "product.mini-compuerta": productoMini as Plantilla,
  "product.tapon-inflable": productoTapon as Plantilla,
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
