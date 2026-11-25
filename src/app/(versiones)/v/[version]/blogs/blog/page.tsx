import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { VERSIONES, version } from "@/lib/versiones";
import { MarcoVersion } from "../../../../MarcoVersion";

// Blog de una versión B (/v/b1/blogs/blog; 23-nov-2026): los artículos de contenido/blog.json con el aspecto de B1.

export function generateStaticParams() {
  return VERSIONES.filter((v) => v.paginas).map((v) => ({ version: v.clave }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ version: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = version((await params).version);
  return v ? { title: `Blog | versión ${v.etiqueta}` } : {};
}

export default async function BlogVersion({ params }: Props) {
  const v = version((await params).version);
  if (!v?.paginas) notFound();
  return <MarcoVersion v={v} secciones={plantilla(v.paginas.blog).secciones} archivoMapa={`blog.${v.clave}`} />;
}
