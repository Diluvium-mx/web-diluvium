import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { MigasDePan } from "@/components/secciones/MigasDePan";
import { metadatos } from "@/lib/seo";

// Lista del blog con la misma dirección que en Shopify: /blogs/blog.

export const metadata: Metadata = metadatos("/blogs/blog");

export default function PaginaBlog() {
  return plantilla("blog").secciones.map((s) =>
    s.tipo === "breadcrumb" ? (
      <MigasDePan key={s.id} seccion={s} pasos={[{ texto: "Blog" }]} />
    ) : (
      <Secciones key={s.id} secciones={[s]} />
    ),
  );
}
