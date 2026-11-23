import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { VERSIONES, version } from "@/lib/versiones";
import { articuloBlog, articulosBlog } from "@/components/secciones/Articulo";
import { MarcoVersionB } from "../../../../../MarcoVersionB";

// Un artículo del blog en una versión B (/v/b1/blogs/blog/<artículo>; 23-nov-2026). La plantilla trae la sección
// «landing-articulo», que pinta el artículo de la dirección.

export function generateStaticParams() {
  return VERSIONES.filter((v) => v.paginas).flatMap((v) => articulosBlog().map((a) => ({ version: v.clave, articulo: a.slug })));
}

export const dynamicParams = false;

type Props = { params: Promise<{ version: string; articulo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version: clave, articulo } = await params;
  const v = version(clave);
  const a = articuloBlog(articulo);
  return v && a ? { title: `${a.titulo} · versión ${v.etiqueta}` } : {};
}

export default async function ArticuloVersionPagina({ params }: Props) {
  const { version: clave, articulo } = await params;
  const v = version(clave);
  if (!v?.paginas || !articuloBlog(articulo)) notFound();
  return <MarcoVersionB v={v} secciones={plantilla(v.paginas.articulo).secciones} slugArticulo={articulo} archivoMapa={`article.${v.clave}`} />;
}
