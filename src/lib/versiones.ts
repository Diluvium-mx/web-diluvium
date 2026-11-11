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
    cambiaFicha: "Nada: es la ficha de hoy (la galería llena la primera pantalla del celular).",
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
    cambiaFicha: "Ficha nueva. La primera foto de la galería es el antes y después que se arrastra.",
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
    cambiaFicha: "Ficha nueva, sin agregados: mide cuánto gana la ficha sola.",
    cambia: "Una foto grande de la compuerta frenando la inundación en una entrada real, con un acercamiento lento.",
    prueba: "Que una página limpia, con el producto en grande, da más confianza.",
    aFavor: "La más sencilla y elegante. El producto se entiende en 1 segundo.",
    enContra: "Es la más parecida a A: si gana, gana por poco y tarda más en verse.",
  },
  {
    clave: "b3",
    etiqueta: "B3",
    nombre: "Clientes reales primero",
    plantilla: "portada.b3",
    ficha: "producto.b3",
    cambiaFicha: "Ficha nueva. La galería abre con clientes reales y junto al botón va una reseña con foto.",
    cambia: "Fondo azul marino con un mosaico de 4 clientes con su compuerta puesta, junto al título.",
    prueba: "Que ver a gente como uno quita el miedo más rápido que el producto solo.",
    aFavor: "Prueba social desde el primer segundo, lo que más pesa según el método.",
    enContra: "El producto se ve más chico. El muro de reseñas usa otras fotos para no repetir.",
  },
  {
    clave: "b4",
    etiqueta: "B4",
    nombre: "Elige tu tamaño aquí",
    plantilla: "portada.b4",
    ficha: "producto.b4",
    cambiaFicha: "Ficha nueva con «¿Cuánto mide tu entrada?»: escriben el ancho y se elige solo su tamaño.",
    cambia: "Los 5 tamaños con sus medidas, el precio y «Añadir al carrito» en la misma portada.",
    prueba: "Que quitar un paso (la página del producto) hace que más gente agregue al carrito.",
    aFavor: "Lleva directo a la compra: un primer paso pequeño (elegir tamaño).",
    enContra: "Infla la cifra «elige tamaño»; en esta se decide por «Añadir al carrito».",
  },
  {
    clave: "b5",
    etiqueta: "B5",
    nombre: "Compra aquí con confianza",
    plantilla: "portada.b5",
    ficha: "producto.b5",
    cambiaFicha: "Ficha nueva con un recuadro «Compra aquí, directo con quien la fabrica»: envío, garantía, pago seguro, meses, devolución y factura junto al botón. Mercado Libre y Amazon quedan abajo, en chico.",
    cambia: "La portada de B2 sin los logos de Amazon y Mercado Libre; junto al botón, «Pago seguro con Mercado Pago».",
    prueba: "Que dar aquí la misma confianza que en Mercado Libre y Amazon hace que compren en la página (hoy hay más clics a esas tiendas que a «Añadir al carrito»).",
    aFavor: "Ataca la fuga más clara del mapa de calor: más clics a otras tiendas que al carrito.",
    enContra: "Si la gente prefiere su cuenta de Mercado Libre por costumbre, puede bajar la venta total.",
  },
  {
    clave: "b6",
    etiqueta: "B6",
    nombre: "Todo en la primera pantalla",
    plantilla: "portada.b6",
    ficha: "producto.b6",
    cambiaFicha: "La ficha más corta: galería más baja, ayuda para medir, la barra de compra siempre a la vista y solo reseñas y 5 preguntas abajo.",
    cambia: "La portada de B4 (tamaños y carrito arriba) con solo reseñas y preguntas debajo.",
    prueba: "Que para quien llega desde Facebook o Instagram (la mayoría de las visitas) una página corta y directa vende más.",
    aFavor: "Más de la mitad de quien entra a la compuerta casi no baja: lo importante tiene que estar arriba.",
    enContra: "Quien necesita convencerse encuentra menos pruebas (sin comparación, beneficios ni pasos).",
  },
];

export function version(clave: string): Version | undefined {
  return VERSIONES.find((v) => v.clave === clave);
}
