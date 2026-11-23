import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { VERSIONES, version, type Version } from "@/lib/versiones";
import { MarcoVersionB } from "../../../../MarcoVersionB";

// Contacto y Nosotros de una versión B (/v/b1/pages/contact y /v/b1/pages/nosotros; 23-nov-2026). Misma dirección que
// en la tienda, dentro de la versión. Solo las versiones con «paginas»; nunca se indexan.

const PAGINAS: Record<string, { clave: "contacto" | "nosotros"; titulo: string }> = {
  contact: { clave: "contacto", titulo: "Contacto" },
  nosotros: { clave: "nosotros", titulo: "Nosotros" },
};


export function generateStaticParams() {
  return VERSIONES.filter((v) => v.paginas).flatMap((v) => Object.keys(PAGINAS).map((pagina) => ({ version: v.clave, pagina })));
}

export const dynamicParams = false;

type Props = { params: Promise<{ version: string; pagina: string }> };

function datos(v: Version | undefined, pagina: string) {
  const p = PAGINAS[pagina];
  return v?.paginas && p ? { plantilla: v.paginas[p.clave], titulo: p.titulo } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version: clave, pagina } = await params;
  const v = version(clave);
  const d = datos(v, pagina);
  return v && d ? { title: `${d.titulo} · versión ${v.etiqueta}` } : {};
}

export default async function PaginaVersion({ params }: Props) {
  const { version: clave, pagina } = await params;
  const v = version(clave);
  const d = datos(v, pagina);
  if (!v || !d) notFound();
  return <MarcoVersionB v={v} secciones={plantilla(d.plantilla).secciones} archivoMapa={`page.${pagina}.${v.clave}`} />;
}
