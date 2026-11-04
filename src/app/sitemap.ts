import type { MetadataRoute } from "next";
import paginas from "@contenido/paginas.json";
import productos from "@contenido/productos.json";
import { articulosBlog } from "@/components/secciones/Articulo";
import { SITIO } from "@/lib/seo";

// Mapa del sitio para Google (/sitemap.xml, la misma dirección que en Shopify): las mismas direcciones que lista hoy la
// tienda en vivo (portada, productos, páginas, colecciones, blog y artículos). Shopify lo parte en varios archivos;
// aquí va en uno solo, que Google lee igual.

// Colecciones que la tienda publica en su mapa (las demás, como «all», existen pero no se listan).
const COLECCIONES = ["frontpage", "all-products", "los-mas-vendidos", "coleccion-para-mobile", "coleccion-para-escritorio", "a-compuerta"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (ruta: string) => SITIO + ruta;
  return [
    { url: url("/"), changeFrequency: "daily" },
    ...productos.productos.map((p) => ({
      url: url(`/products/${p.nombre}`),
      changeFrequency: "daily" as const,
      images: p.imagenes.slice(0, 1).map((i) => url(i.src)),
    })),
    ...paginas.paginas.map((p) => ({ url: url(`/pages/${p.nombre}`), changeFrequency: "weekly" as const })),
    ...COLECCIONES.map((c) => ({ url: url(`/collections/${c}`), changeFrequency: "daily" as const })),
    { url: url("/blogs/blog"), changeFrequency: "weekly" },
    ...articulosBlog().map((a) => ({
      url: url(`/blogs/blog/${a.slug}`),
      changeFrequency: "weekly" as const,
      ...(a.publicado ? { lastModified: a.publicado } : {}),
    })),
  ];
}
