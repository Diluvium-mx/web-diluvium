import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/seo";

// /robots.txt con las mismas reglas que tiene hoy la tienda para las partes que existen aquí: se puede leer todo lo
// público y no se leen el administrador, el carrito con artículos, el pago, los pedidos ni las listas con orden o
// varios filtros (son la misma página repetida). Las reglas propias de Shopify (/cdn/wpm, /services, …) se quitan.

export default function robots(): MetadataRoute.Robots {
  // Copia de prueba (SITIO_PRUEBA=1 al construir): Google no lee nada, para que no compita con la tienda de Shopify.
  if (process.env.SITIO_PRUEBA === "1") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart/",
        "/checkout",
        "/checkouts/",
        "/orders",
        "/account",
        "/collections/*sort_by*",
        "/collections/*filter*&*filter*",
        "/collections/*+*",
        "/collections/*%2B*",
        "/blogs/*+*",
        "/blogs/*%2B*",
      ],
    },
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
