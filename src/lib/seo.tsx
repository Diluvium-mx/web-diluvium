// Lo que leen Google y las redes en cada página, igual que en la tienda en vivo: título, descripción, dirección
// canónica, Open Graph, Twitter y datos estructurados (JSON-LD). Los textos salen de contenido/seo.json (sacado de las
// capturas por herramientas/extraer-seo.py); la ficha de producto para Google se arma con el catálogo, para que el
// precio y la disponibilidad siempre coincidan con lo que se vende. En el paso 2 todo esto se edita en el administrador.

import type { Metadata } from "next";
import seo from "@contenido/seo.json";
import resenas from "@contenido/resenas.json";
import type { Seccion } from "@/lib/contenido";
import { resumenPrecio, type Producto } from "@/components/producto/catalogo";
import { disponible } from "@/components/producto/ficha/datos";
import { calificacionProducto, redondear } from "@/components/resenas/calificaciones";

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

// Lo que Google y los chats de IA deben saber de la empresa, además de lo que ya trae la tienda en vivo (logo, redes):
// teléfono, correo, dirección (los de la página Contacto) y LinkedIn (del pie). Plan de SEO, 25-nov-2026
// (docs/seo-y-chats-ia.md, fuera de git).
const ORGANIZACION_EXTRA = {
  description: "Fabricantes mexicanos de compuertas anti-inundaciones para puertas de casas y negocios: detienen hasta 50 cm de agua, se ponen en 10 minutos sin obras y se envían gratis a todo México.",
  telephone: "+52 668 241 9579",
  email: "contacto@diluvium.com.mx",
  address: { "@type": "PostalAddress", streetAddress: "Calle Morelos #254", addressLocality: "Los Mochis", addressRegion: "Sinaloa", addressCountry: "MX" },
  contactPoint: [{ "@type": "ContactPoint", telephone: "+52 668 241 9579", email: "contacto@diluvium.com.mx", contactType: "customer service", areaServed: "MX", availableLanguage: ["es"] }],
  extraSameAs: ["https://mx.linkedin.com/company/grupodiluvium"],
};

export function datosOrganizacion(): object {
  const { extraSameAs, ...extra } = ORGANIZACION_EXTRA;
  const sameAs = [...((seo.organizacion as { sameAs?: string[] }).sameAs ?? []), ...extraSameAs];
  return { ...seo.organizacion, ...extra, sameAs };
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

type ResenaPublicada = { nombre: string; calificacion: number | string; texto: string; producto?: { url: string } | null };

/** Envío gratis a todo México en 3 a 5 días hábiles (lo que dice cada ficha). No va en la hecha a la medida (se fabrica
 *  bajo pedido) ni en lo que cuesta menos de $499 (desde ahí es gratis). */
function envioGratis(p: Producto, precio: number): object | undefined {
  if (p.nombre === "compuerta-anti-inundaciones-hecha-a-la-medida" || precio < 499) return undefined;
  const dias = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "MXN" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "MX" },
    deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: dias(0, 0), transitTime: dias(3, 5) },
  };
}

/** Calificación y algunas reseñas del producto (las publicadas, las mismas que se ven en su página), para que Google
 *  muestre las estrellas en los resultados. */
function datosResenas(p: Producto): object {
  const { promedio, total } = calificacionProducto(p.nombre);
  if (!total) return {};
  const enlace = `/products/${p.nombre}`;
  const lista = (resenas.pagina as ResenaPublicada[]).filter((r) => r.producto?.url === enlace && r.texto.trim()).slice(0, 5);
  return {
    aggregateRating: { "@type": "AggregateRating", ratingValue: redondear(promedio, 2), reviewCount: total, bestRating: 5, worstRating: 1 },
    review: lista.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.nombre },
      reviewRating: { "@type": "Rating", ratingValue: Number(r.calificacion), bestRating: 5, worstRating: 1 },
      reviewBody: r.texto.trim(),
    })),
  };
}

/** Migas de pan para Google: «Inicio › Productos › Compuerta…». */
export function datosMigas(pasos: { nombre: string; ruta: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pasos.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.nombre, item: SITIO + p.ruta })),
  };
}

/** Las preguntas frecuentes que se ven en la página (sección «faqs» del tema), como preguntas y respuestas para Google y
 *  los chats de IA. Sin preguntas, nada. */
export function datosPreguntas(secciones: Seccion[]): object | undefined {
  const preguntas = secciones
    .filter((s) => s.tipo === "faqs")
    .flatMap((s) => s.bloques)
    .filter((b) => b.tipo === "faq_item")
    .map((b) => ({ pregunta: String(b.ajustes.heading_faq_item ?? "").trim(), respuesta: textoPlano(String(b.ajustes.description_faq_item ?? "")) }))
    .filter((x) => x.pregunta && x.respuesta);
  if (!preguntas.length) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((x) => ({ "@type": "Question", name: x.pregunta, acceptedAnswer: { "@type": "Answer", text: x.respuesta } })),
  };
}

/** Ficha de producto para Google (Product con una oferta por tamaño), armada con el catálogo. Desde el 25-nov-2026 lleva
 *  también la calificación y reseñas publicadas, y el envío gratis con sus días (plan de SEO). */
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
    ...datosResenas(p),
    offers: p.variantes.map((v) => ({
      "@type": "Offer",
      ...(v.codigoBarras ? { gtin13: Number(v.codigoBarras) } : {}),
      availability: disponible(v) ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
      price: v.precio,
      priceCurrency: "MXN",
      url: `${url}?variant=${v.id}`,
      ...(envioGratis(p, v.precio) ? { shippingDetails: envioGratis(p, v.precio) } : {}),
    })),
  };
}
