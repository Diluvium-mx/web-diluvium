import type { Metadata } from "next";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { MigasDePan } from "@/components/secciones/MigasDePan";

// Lista del blog con la misma dirección que en Shopify: /blogs/blog.

const DESCRIPCION =
  "Empresa mexicana especializada en prevención de inundaciones. Ofrecemos protecciones reutilizables, diseñadas para proteger hogares y negocios de la entrada de agua durante lluvias intensas.";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blogs/blog" },
  openGraph: {
    type: "website",
    siteName: "Diluvium",
    url: "/blogs/blog",
    title: "Blog",
    description: DESCRIPCION,
    images: [{ url: "/media/files/Portada_RS.jpg", width: 1200, height: 628 }],
  },
  twitter: { card: "summary_large_image", title: "Blog", description: DESCRIPCION },
};

export default function PaginaBlog() {
  return plantilla("blog").secciones.map((s) =>
    s.tipo === "breadcrumb" ? (
      <MigasDePan key={s.id} seccion={s} pasos={[{ texto: "Blog" }]} />
    ) : (
      <Secciones key={s.id} secciones={[s]} />
    ),
  );
}
