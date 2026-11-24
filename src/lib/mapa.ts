// Mapa de la página: el nombre corto de cada parte, para pedir cambios en una línea (como el mapa del CRM), y lo que
// usa el editor local para mostrar y cambiar cada campo. Los nombres salen solos del contenido (contenido/tema/*.json)
// y del esquema del administrador, así que siempre coinciden con la página.
//
//   B1-P3        versión B1 › Producto › sección 3 (contando desde arriba; el encabezado es la 1)
//   B1-P3.4      el campo 4 de esa sección (en el orden en que está en el archivo)
//   B1-P3.b2     la pieza 2 de esa sección (una foto de la galería, una reseña, un beneficio…)
//   B1-P3.b2.1   el campo 1 de esa pieza
//   «I» es la portada (Inicio) y «P» el producto.
//
// Para encontrar un nombre: contenido/tema/<archivo>.json › secciones[3-1] › ajustes (clave 4 en orden) o
// › bloques[2-1] › ajustes. docs/mapa-pagina.md lo explica para el dueño.

import type { CSSProperties } from "react";

export type Ajustes = Record<string, unknown>;
export type BloqueTema = { id: string; tipo: string; ajustes: Ajustes };
export type SeccionTema = { id: string; tipo: string; ajustes: Ajustes; bloques: BloqueTema[] };
export type PlantillaTema = { fuente: string; secciones: SeccionTema[] };

type CampoEsquema = { clave: string; tipo: string; etiqueta: string; diseno: boolean };
export type Esquema = {
  secciones: { tipo: string; etiqueta: string; campos: CampoEsquema[]; bloques: { tipo: string; etiqueta: string; campos: CampoEsquema[] }[] }[];
};

/** Páginas que tienen mapa y se editan en el editor local. */
export const PAGINAS_MAPA = {
  "index.b1": { version: "B1", letra: "I", nombre: "Portada", ruta: "/v/b1" },
  "product.b1": { version: "B1", letra: "P", nombre: "Producto", ruta: "/v/b1/products/compuerta-anti-inundaciones" },
  // Las demás páginas de B1 (23-nov-2026).
  "collection.b1": { version: "B1", letra: "L", nombre: "Productos", ruta: "/v/b1/collections/all-products" },
  "product.b1.mini-compuerta": { version: "B1", letra: "M", nombre: "Mini", ruta: "/v/b1/products/mini-compuerta" },
  "product.b1.medida-especial": { version: "B1", letra: "X", nombre: "XXL", ruta: "/v/b1/products/compuerta-anti-inundaciones-hecha-a-la-medida" },
  "product.b1.tapon-inflable": { version: "B1", letra: "T", nombre: "Tapón", ruta: "/v/b1/products/tapon-inflable-anti-inundaciones" },
  "product.b1.funda": { version: "B1", letra: "F", nombre: "Funda", ruta: "/v/b1/products/funda-de-repuesto-compuerta-anti-inundaciones" },
  "product.b1.tira": { version: "B1", letra: "H", nombre: "Tira de hule", ruta: "/v/b1/products/accesorio-tira-de-hule-de-repuesto" },
  "product.b1.plastilina": { version: "B1", letra: "S", nombre: "Plastilina", ruta: "/v/b1/products/accesorio-plastilina-de-secado-rapido" },
  "page.contact.b1": { version: "B1", letra: "C", nombre: "Contacto", ruta: "/v/b1/pages/contact" },
  "page.nosotros.b1": { version: "B1", letra: "N", nombre: "Nosotros", ruta: "/v/b1/pages/nosotros" },
  "blog.b1": { version: "B1", letra: "B", nombre: "Blog", ruta: "/v/b1/blogs/blog" },
  "article.b1": { version: "B1", letra: "A", nombre: "Artículo", ruta: "/v/b1/blogs/blog/por-que-aumentan-las-inundaciones-en-nuestras-ciudades" },
} as const;
export type ArchivoMapa = keyof typeof PAGINAS_MAPA;

export function esArchivoMapa(x: unknown): x is ArchivoMapa {
  return typeof x === "string" && Object.hasOwn(PAGINAS_MAPA, x);
}

export type CampoMapa = {
  codigo: string;
  clave: string;
  etiqueta: string;
  /** texto, textoLargo, html, imagen, video, siNo, numero, json */
  tipo: string;
  diseno: boolean;
  valor: unknown;
  resumen: string;
};
export type BloqueMapa = { codigo: string; indice: number; tipo: string; etiqueta: string; campos: CampoMapa[] };
export type SeccionMapa = { codigo: string; indice: number; id: string; tipo: string; etiqueta: string; campos: CampoMapa[]; bloques: BloqueMapa[] };

const IMAGEN = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i;
const VIDEO = /\.(mp4|webm|mov)(\?.*)?$/i;

/** Texto corto para mostrar el valor de un campo (sin HTML; las fotos, por su nombre de archivo). */
export function resumir(valor: unknown, largo = 90): string {
  if (valor === null || valor === undefined || valor === "") return "(vacío)";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor !== "string") return JSON.stringify(valor).slice(0, largo);
  if (IMAGEN.test(valor) || VIDEO.test(valor)) return valor.split("/").pop() ?? valor;
  const limpio = valor.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return limpio.length > largo ? `${limpio.slice(0, largo - 1)}…` : limpio;
}

function tipoPorValor(clave: string, valor: unknown): string {
  if (typeof valor === "boolean") return "siNo";
  if (typeof valor === "number") return "numero";
  if (typeof valor === "string" && IMAGEN.test(valor)) return "imagen";
  if (typeof valor === "string" && VIDEO.test(valor)) return "video";
  if (/(^|_)(image|poster)(_|$)/.test(clave)) return "imagen";
  if (/^focal/.test(clave)) return "focal";
  if (/^zoom/.test(clave)) return "zoom";
  if (typeof valor === "string" && /<[a-z][^>]*>/i.test(valor)) return "html";
  if (typeof valor === "string" && (valor.length > 90 || valor.includes("\n"))) return "textoLargo";
  return "texto";
}

const ETIQUETAS_EXTRA: Record<string, string> = {
  focal: "Encuadre de la foto",
  focal_before: "Encuadre de la foto de antes",
  focal_after: "Encuadre de la foto de después",
  video: "Video",
  poster: "Foto antes de reproducir",
  zoom: "Acercamiento de la foto",
  zoom_before: "Acercamiento de la foto de antes",
  zoom_after: "Acercamiento de la foto de después",
};

function campos(base: string, ajustes: Ajustes, esquema: CampoEsquema[] | undefined): CampoMapa[] {
  return Object.entries(ajustes).map(([clave, valor], j) => {
    const e = esquema?.find((c) => c.clave === clave);
    const tipo = /^focal/.test(clave) ? "focal" : /^zoom/.test(clave) ? "zoom" : e?.tipo && e.tipo !== "texto" ? e.tipo : tipoPorValor(clave, valor);
    return {
      codigo: `${base}.${j + 1}`,
      clave,
      etiqueta: ETIQUETAS_EXTRA[clave] ?? e?.etiqueta ?? clave,
      tipo,
      diseno: e?.diseno ?? false,
      valor,
      resumen: resumir(valor),
    };
  });
}

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** El mapa de una plantilla: secciones, campos y piezas con su nombre corto. */
export function mapaPlantilla(archivo: ArchivoMapa, plantilla: PlantillaTema, esquema: Esquema): SeccionMapa[] {
  const { version, letra } = PAGINAS_MAPA[archivo];
  return plantilla.secciones.map((s, i) => {
    const codigo = `${version}-${letra}${i + 1}`;
    const es = esquema.secciones.find((x) => x.tipo === s.tipo);
    return {
      codigo,
      indice: i,
      id: s.id,
      tipo: s.tipo,
      etiqueta: mayuscula((es?.etiqueta ?? s.tipo).replace(/^Versión: /, "")),
      campos: campos(codigo, s.ajustes, es?.campos),
      bloques: s.bloques.map((b, k) => {
        const eb = es?.bloques.find((x) => x.tipo === b.tipo);
        const cb = `${codigo}.b${k + 1}`;
        return { codigo: cb, indice: k, tipo: b.tipo, etiqueta: eb?.etiqueta ?? b.tipo, campos: campos(cb, b.ajustes, eb?.campos) };
      }),
    };
  });
}

/** «50% 30%» → { x: 50, y: 30 } (centro si no se entiende). */
export function leerFocal(valor: unknown): { x: number; y: number } {
  const m = typeof valor === "string" ? valor.match(/^(\d{1,3})%\s+(\d{1,3})%$/) : null;
  return m ? { x: Math.min(100, +m[1]), y: Math.min(100, +m[2]) } : { x: 50, y: 50 };
}

/** Lo que va en style.objectPosition para una foto con encuadre («50% 30%»), o nada si no tiene. */
export function posicionFoto(valor: unknown): string | undefined {
  return typeof valor === "string" && /^\d{1,3}%\s+\d{1,3}%$/.test(valor) ? valor : undefined;
}

/** Las claves del encuadre y del acercamiento de un campo de foto o video:
 *  image → focal / zoom · image_before → focal_before / zoom_before · video → focal_video / zoom_video. */
export function clavesEncuadre(clave: string): { focal: string; zoom: string } {
  const sufijo = clave === "image" ? "" : clave.startsWith("image_") ? clave.slice(5) : `_${clave}`;
  return { focal: `focal${sufijo}`, zoom: `zoom${sufijo}` };
}

/** Lo menos que se puede alejar una foto (0.5 = la foto completa dentro de su marco). */
export const ZOOM_MINIMO = 0.5;

/** Estilo de una foto con su encuadre («x% y%») y acercamiento (0.5 a 3), elegidos en el editor. El marco de la foto
 *  debe recortar lo que sobra (overflow-hidden). Sin ajustes: nada (la foto queda centrada, como siempre).
 *  Abajo de 1 la foto se aleja (Portada 92, dueño 24-nov-2026): se ve más de ella, hasta completa en 0.5. Como cuánto
 *  hay que achicarla depende del tamaño del marco en cada pantalla, la página lo calcula al verla (AlejarFotos.tsx) con
 *  «--alejar»; lo que queda libre se llena con el color de la orilla de la foto. */
export function estiloFoto(ajustes: Record<string, unknown>, clave = "image"): CSSProperties | undefined {
  const { focal, zoom } = clavesEncuadre(clave);
  const posicion = posicionFoto(ajustes[focal]);
  const z = typeof ajustes[zoom] === "number" ? Math.min(3, Math.max(ZOOM_MINIMO, ajustes[zoom] as number)) : 1;
  if (!posicion && z === 1) return undefined;
  if (z < 1) {
    return {
      objectPosition: posicion ?? "50% 50%",
      objectFit: "contain",
      transform: "scale(var(--alejar-escala, 1))",
      transformOrigin: posicion ?? "50% 50%",
      ["--alejar" as string]: String(z),
    } as CSSProperties;
  }
  return {
    objectPosition: posicion,
    ...(z > 1 ? { transform: `scale(${z})`, transformOrigin: posicion ?? "50% 50%" } : {}),
  };
}

/** Marca invisible para que el editor local sepa de qué campo es cada foto: «sección|pieza|campo». */
export function marcaEditar(seccionId: string, piezaId: string, clave: string): { "data-editar": string } {
  return { "data-editar": `${seccionId}|${piezaId}|${clave}` };
}
