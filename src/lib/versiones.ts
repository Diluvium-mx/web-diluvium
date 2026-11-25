// Versiones de la portada para las pruebas A/B (/v/<versión>). Aquí se arma y se revisa cada versión antes de que el
// dueño apruebe cuál va a la prueba real en Shopify. Nunca se indexan (metadatos, robots.txt y X-Robots-Tag).
//
// El contenido de cada versión vive en contenido/tema/index.<versión>.json y se edita en el administrador (Diseño de
// páginas › Plantillas › «Portada · versión …»). La A es la portada de hoy, sin cambios.
// Para agregar una versión: docs/administrador.md › «Versiones de la portada».

import type { NombrePlantilla } from "@/lib/contenido";

export type Version = {
  /** Lo que va en la dirección: /v/<clave>. */
  clave: string;
  /** Lo que se manda a Clarity como «version» (A, B1…). */
  etiqueta: string;
  nombre: string;
  plantilla: NombrePlantilla;
  /** Ficha nueva de la compuerta de esta versión (/v/<clave>/products/compuerta-anti-inundaciones). La A usa la de hoy. */
  ficha?: NombrePlantilla;
  /** Ficha de cada uno de los demás productos en esta versión (23-nov-2026). Los que no están aquí usan «ficha». */
  fichas?: Partial<Record<string, NombrePlantilla>>;
  /** Las demás páginas de la versión (23-nov-2026): /v/<clave>/pages/contact, /pages/nosotros, /blogs/blog,
   *  /blogs/blog/<artículo> y /collections/all-products. La A no las tiene: sus enlaces van a la tienda de hoy. */
  paginas?: { contacto: NombrePlantilla; nosotros: NombrePlantilla; blog: NombrePlantilla; articulo: NombrePlantilla; coleccion: NombrePlantilla };
  /** Qué cambia en la ficha del producto (para la página /v). */
  cambiaFicha: string;
  recomendada?: boolean;
  /** Para la página /v: qué cambia, qué prueba y sus pros y contras (de la maqueta del 28-oct-2026). */
  cambia: string;
  prueba: string;
  aFavor: string;
  enContra: string;
};

/** Productos que tienen ficha propia en las versiones. Los enlaces a ellos dentro de una versión se quedan en la versión.
 *  La compuerta va primero (es la ficha que se prueba); los demás se agregaron el 23-nov-2026 con sus páginas de B1. */
export const PRODUCTOS_VERSION = [
  "compuerta-anti-inundaciones",
  "compuerta-anti-inundaciones-hecha-a-la-medida",
  "mini-compuerta",
  "tapon-inflable-anti-inundaciones",
  "funda-de-repuesto-compuerta-anti-inundaciones",
  "accesorio-tira-de-hule-de-repuesto",
  "accesorio-plastilina-de-secado-rapido",
];

/** Páginas de la tienda que tienen su versión en las versiones con «paginas» (para que los enlaces no se salgan). */
export const PAGINAS_VERSION: Record<string, keyof NonNullable<Version["paginas"]>> = {
  "/pages/contact": "contacto",
  "/pages/nosotros": "nosotros",
  "/blogs/blog": "blog",
  "/collections/all-products": "coleccion",
};

/** Nombre del experimento en Clarity («experiment»). */
export const EXPERIMENTO = "landing-b";

export const VERSIONES: Version[] = [
  {
    clave: "a",
    etiqueta: "A",
    nombre: "La página de hoy",
    plantilla: "portada",
    cambiaFicha: "Nada: es la página de producto de hoy (la galería llena la primera pantalla del celular).",
    cambia: "Nada: es la portada actual, con las 2 barras de arriba, el carrusel de logos y el de reseñas.",
    prueba: "Sirve de comparación.",
    aFavor: "Es la que hoy vende.",
    enContra: "El precio aparece hasta la 4.ª pantalla del celular.",
  },
  {
    clave: "b1",
    etiqueta: "B1",
    nombre: "Antes y después",
    plantilla: "portada.b1",
    recomendada: true,
    ficha: "producto.b1",
    fichas: {
      "compuerta-anti-inundaciones-hecha-a-la-medida": "producto.b1.medida",
      "mini-compuerta": "producto.b1.mini",
      "tapon-inflable-anti-inundaciones": "producto.b1.tapon",
      "funda-de-repuesto-compuerta-anti-inundaciones": "producto.b1.funda",
      "accesorio-tira-de-hule-de-repuesto": "producto.b1.tira",
      "accesorio-plastilina-de-secado-rapido": "producto.b1.plastilina",
    },
    paginas: { contacto: "contacto.b1", nosotros: "nosotros.b1", blog: "blog.b1", articulo: "articulo.b1", coleccion: "coleccion.b1" },
    cambiaFicha: "Página de producto nueva. La primera foto de la galería es el antes y después que se arrastra.",
    cambia: "Una foto que se desliza con el dedo: de un lado la entrada con costales y del otro la misma entrada con la compuerta.",
    prueba: "Que ver el resultado real, y tocarlo, convence más que leerlo.",
    aFavor: "Muestra la realidad sin video, se mueve con la mano y usa material propio.",
    enContra: "Si la foto de «antes» no se entiende rápido, pierde fuerza.",
  },
];

VERSIONES.push({
  clave: "c1",
  etiqueta: "C1",
  nombre: "Clara y con ayuda",
  plantilla: "portada.c1",
  ficha: "producto.c1",
  cambiaFicha: "Ficha para 40-60 años: fotos grandes con flechas, escribir la medida y elegir el tamaño de una lista grande, la fecha en que llegaría y WhatsApp o llamar siempre a la mano.",
  cambia: "Pensada para el cliente ideal (40 a 60 años, en el celular): fondo claro, letra y botones grandes, nada que se mueva solo, «Te atiende una persona», confianza (Shark Tank, Mercado Libre, Amazon) y barra fija de WhatsApp y teléfono.",
  prueba: "Que una página fácil de leer y con ayuda humana a la mano convenza más a quien de verdad compra.",
  aFavor: "Se lee sin lentes, se compra desde la portada y siempre hay a quién preguntar.",
  enContra: "Es más larga; está en revisión.",
});

export function version(clave: string): Version | undefined {
  return VERSIONES.find((v) => v.clave === clave);
}

/** Ficha de un producto dentro de una versión B (la propia del producto o, si no tiene, la de la compuerta). */
export function fichaDe(v: Version, producto: string): NombrePlantilla | undefined {
  return v.fichas?.[producto] ?? v.ficha;
}
