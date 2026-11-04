import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";

// Lista de colecciones, con la misma dirección que en Shopify: /collections.

export const metadata: Metadata = { title: "Colecciones", alternates: { canonical: "/collections" } };

export default function PaginaColecciones() {
  return <Secciones secciones={plantilla("list-collections").secciones} />;
}
