import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { VERSIONES, version } from "@/lib/versiones";
import { MarcoVersionB } from "../../../../MarcoVersionB";

// Página Productos de una versión B (/v/b1/collections/all-products, el «Productos» del menú; 23-nov-2026).

const COLECCIONES = ["all-products"];

export function generateStaticParams() {
  return VERSIONES.filter((v) => v.paginas).flatMap((v) => COLECCIONES.map((coleccion) => ({ version: v.clave, coleccion })));
}

export const dynamicParams = false;

type Props = { params: Promise<{ version: string; coleccion: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = version((await params).version);
  return v ? { title: `Productos · versión ${v.etiqueta}` } : {};
}

export default async function ColeccionVersion({ params }: Props) {
  const { version: clave, coleccion } = await params;
  const v = version(clave);
  if (!v?.paginas || !COLECCIONES.includes(coleccion)) notFound();
  return <MarcoVersionB v={v} secciones={plantilla(v.paginas.coleccion).secciones} archivoMapa={`collection.${v.clave}`} />;
}
