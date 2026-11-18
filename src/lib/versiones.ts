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
  /** Qué cambia en la ficha del producto (para la página /v). */
  cambiaFicha: string;
  recomendada?: boolean;
  /** Para la página /v: qué cambia, qué prueba y sus pros y contras (de la maqueta del 28-oct-2026). */
  cambia: string;
  prueba: string;
  aFavor: string;
  enContra: string;
};

/** Productos que tienen ficha propia en las versiones. Los enlaces a ellos dentro de una versión se quedan en la versión. */
export const PRODUCTOS_VERSION = ["compuerta-anti-inundaciones"];

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
    cambiaFicha: "Página de producto nueva. La primera foto de la galería es el antes y después que se arrastra.",
    cambia: "Una foto que se desliza con el dedo: de un lado la entrada con costales y del otro la misma entrada con la compuerta.",
    prueba: "Que ver el resultado real, y tocarlo, convence más que leerlo.",
    aFavor: "Muestra la realidad sin video, se mueve con la mano y usa material propio.",
    enContra: "Si la foto de «antes» no se entiende rápido, pierde fuerza.",
  },
  {
    clave: "b2",
    etiqueta: "B2",
    nombre: "Producto protagonista",
    plantilla: "portada.b2",
    ficha: "producto.b2",
    cambiaFicha: "Página de producto nueva, sin agregados: mide cuánto gana sola.",
    cambia: "Una foto grande de la compuerta frenando la inundación en una entrada real, con un acercamiento lento.",
    prueba: "Que una página limpia, con el producto en grande, da más confianza.",
    aFavor: "La más sencilla y elegante. El producto se entiende en 1 segundo.",
    enContra: "Es la más parecida a A: si gana, gana por poco y tarda más en verse.",
  },
];

export function version(clave: string): Version | undefined {
  return VERSIONES.find((v) => v.clave === clave);
}
