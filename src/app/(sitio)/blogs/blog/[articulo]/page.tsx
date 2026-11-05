import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { Articulo, articuloBlog, articulosBlog } from "@/components/secciones/Articulo";
import { MigasDePan } from "@/components/secciones/MigasDePan";
import { DatosEstructurados, datosArticulo, metadatos } from "@/lib/seo";

// Cada artículo del blog con la misma dirección que en Shopify: /blogs/blog/<artículo>.

export function generateStaticParams() {
  return articulosBlog().map((a) => ({ articulo: a.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ articulo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return metadatos(`/blogs/blog/${(await params).articulo}`);
}

export default async function PaginaArticulo({ params }: Props) {
  const a = articuloBlog((await params).articulo);
  if (!a) notFound();
  const datos = datosArticulo(`/blogs/blog/${a.slug}`);
  const secciones = plantilla("article").secciones.map((s) => {
    if (s.tipo === "breadcrumb") {
      return <MigasDePan key={s.id} seccion={s} pasos={[{ texto: "Blog", url: "/blogs/blog" }, { texto: a.titulo }]} />;
    }
    if (s.tipo === "main-article") return <Articulo key={s.id} seccion={s} articulo={a} />;
    return <Secciones key={s.id} secciones={[s]} />;
  });
  return (
    <>
      {datos && <DatosEstructurados datos={datos} />}
      {secciones}
    </>
  );
}
