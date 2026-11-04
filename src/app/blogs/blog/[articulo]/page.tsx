import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { Articulo, articuloBlog, articulosBlog } from "@/components/secciones/Articulo";
import { MigasDePan } from "@/components/secciones/MigasDePan";

// Cada artículo del blog con la misma dirección que en Shopify: /blogs/blog/<artículo>.

export function generateStaticParams() {
  return articulosBlog().map((a) => ({ articulo: a.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ articulo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = articuloBlog((await params).articulo);
  if (!a) return {};
  const titulo = a.seo.titulo || a.titulo;
  const descripcion = a.seo.descripcion || a.resumen;
  const imagenes = a.imagen ? [{ url: a.imagen.src, width: a.imagen.ancho, height: a.imagen.alto }] : undefined;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: a.url },
    openGraph: {
      type: "article",
      siteName: "Diluvium",
      url: a.url,
      title: a.titulo,
      description: descripcion,
      images: imagenes,
      publishedTime: a.publicado || undefined,
      authors: a.autor ? [a.autor] : undefined,
    },
    twitter: { card: "summary_large_image", title: a.titulo, description: descripcion },
  };
}

export default async function PaginaArticulo({ params }: Props) {
  const a = articuloBlog((await params).articulo);
  if (!a) notFound();
  return plantilla("article").secciones.map((s) => {
    if (s.tipo === "breadcrumb") {
      return <MigasDePan key={s.id} seccion={s} pasos={[{ texto: "Blog", url: "/blogs/blog" }, { texto: a.titulo }]} />;
    }
    if (s.tipo === "main-article") return <Articulo key={s.id} seccion={s} articulo={a} />;
    return <Secciones key={s.id} secciones={[s]} />;
  });
}
