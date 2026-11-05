import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { metadatos } from "@/lib/seo";

// Lista de colecciones, con la misma dirección que en Shopify: /collections.

export const metadata: Metadata = metadatos("/collections");

export default function PaginaColecciones() {
  return <Secciones secciones={plantilla("list-collections").secciones} />;
}
