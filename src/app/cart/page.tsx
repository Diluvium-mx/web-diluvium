import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";

// Carrito, con la misma dirección que en Shopify: /cart. Paso 3: carrito (hoy siempre vacío, como se ve en vivo).

export const metadata: Metadata = {
  title: "Tu carrito",
  // En vivo el carrito no lleva descripción.
  description: null,
  alternates: { canonical: "/cart" },
};

export default function PaginaCarrito() {
  return <Secciones secciones={plantilla("cart").secciones} />;
}
