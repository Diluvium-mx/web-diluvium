import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { metadatos } from "@/lib/seo";

// Carrito, con la misma dirección que en Shopify: /cart. Funciona en el navegador; el pago llega en el paso 3.

export const metadata: Metadata = metadatos("/cart");

export default function PaginaCarrito() {
  return <Secciones secciones={plantilla("cart").secciones} />;
}
