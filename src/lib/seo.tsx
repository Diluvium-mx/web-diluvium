// Lo que leen Google y las redes en cada página, igual que en la tienda en vivo: título, descripción, dirección
// canónica, Open Graph, Twitter y datos estructurados (JSON-LD). Los textos salen de contenido/seo.json (sacado de las
// capturas por herramientas/extraer-seo.py); la ficha de producto para Google se arma con el catálogo, para que el
// precio y la disponibilidad siempre coincidan con lo que se vende. En el paso 2 todo esto se edita en el administrador.

import type { Metadata } from "next";
import seo from "@contenido/seo.json";
import { resumenPrecio, type Producto } from "@/components/producto/catalogo";
import { disponible } from "@/components/producto/ficha/datos";

export const SITIO = "https://www.diluvium.com.mx";

type Ficha = {
  titulo: string;
  descripcion: string | null;
  canonica: string | null;
  og: { tipo: string | null; titulo: string | null; descripcion: string | null; imagen: string | null; ancho: number | null; alto: number | null };
  twitter: { tarjeta: string | null; titulo: string | null; descripcion: string | null };
};

const FICHAS = seo.paginas as Record<string, Ficha>;
const ARTICULOS = seo.articulos as Record<string, object>;

export function fichaSeo(ruta: string): Ficha | undefined {
  return FICHAS[ruta];
}

/** Metadatos de Next para una ruta (la de Shopify). `cambios` sirve para la búsqueda con texto. */
export function metadatos(ruta: string, cambios: { titulo?: string; tituloRedes?: string; canonica?: string } = {}): Metadata {
  const f = FICHAS[ruta];
  if (!f) return {};
  const canonica = cambios.canonica ?? f.canonica ?? ruta;
  // Next no conoce el tipo «product» de Open Graph: esas páginas lo ponen aparte (<MetaProducto>).
  const tipo = f.og.tipo === "website" || f.og.tipo === "article" ? f.og.tipo : undefined;
  return {
    title: { absolute: cambios.titulo ?? f.titulo },
    // Las páginas que en vivo no llevan descripción tampoco la llevan aquí.
    description: f.descripcion,
    alternates: { canonical: canonica },
    openGraph: {
      siteName: "Diluvium",
      url: canonica,
      title: cambios.tituloRedes ?? f.og.titulo ?? undefined,
      description: f.og.descripcion ?? undefined,
      ...(tipo ? { type: tipo } : {}),
      images: f.og.imagen
        ? [{ url: f.og.imagen, secureUrl: SITIO + f.og.imagen, width: f.og.ancho ?? undefined, height: f.og.alto ?? undefined }]
        : undefined,
    },
    twitter: {
      card: (f.twitter.tarjeta as "summary_large_image" | "summary" | null) ?? "summary_large_image",
      title: cambios.tituloRedes ?? f.twitter.titulo ?? undefined,
      description: f.twitter.descripcion ?? undefined,
    },
  };
}

/** Bloque de datos estructurados. `<` va escapado para que un texto nunca pueda cerrar la etiqueta. */
export function DatosEstructurados({ datos }: { datos: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}

/** og:type «product» y el precio, que Next no pone solo (React los sube al <head>). */
export function MetaProducto({ producto }: { producto: Producto }) {
  const precio = resumenPrecio(producto).precio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <>
      <meta property="og:type" content="product" />
      <meta property="og:price:amount" content={precio} />
      <meta property="og:price:currency" content="MXN" />
    </>
  );
}

export function datosOrganizacion(): object {
  return seo.organizacion;
}

export function datosSitioWeb(): object {
  return seo.sitioWeb;
}

export function datosArticulo(ruta: string): object | undefined {
  return ARTICULOS[ruta];
}

/** Texto de la descripción del producto sin etiquetas, con saltos de línea donde había bloques (como en vivo). */
function textoPlano(html: string): string {
  return html
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h\d|li|ul|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Ficha de producto para Google (Product con una oferta por tamaño), armada con el catálogo. */
export function datosProducto(p: Producto): object {
  const url = `${SITIO}/products/${p.nombre}`;
  return {
    "@context": "http://schema.org/",
    "@type": "Product",
    name: p.titulo,
    url,
    image: p.imagenes[0] ? [SITIO + p.imagenes[0].src] : [],
    description: textoPlano(p.descripcionHtml),
    brand: { "@type": "Brand", name: "Diluvium" },
    offers: p.variantes.map((v) => ({
      "@type": "Offer",
      ...(v.codigoBarras ? { gtin13: Number(v.codigoBarras) } : {}),
      availability: disponible(v) ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
      price: v.precio,
      priceCurrency: "MXN",
      url: `${url}?variant=${v.id}`,
    })),
  };
}
