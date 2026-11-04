import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { plantilla } from "@/lib/contenido";
import { coleccion, leerFiltros, todasLasColecciones } from "@/components/producto/colecciones";
import { Secciones } from "@/components/secciones/registro";
import { ProductosColeccion } from "@/components/secciones/ProductosColeccion";

// Páginas de colección con las mismas direcciones que en Shopify: /collections/<nombre>. El orden y los filtros van
// en la dirección (?sort_by=…&filter.v.availability=1&filter.v.price.gte=…&filter.v.price.lte=…).

type Props = {
  params: Promise<{ nombre: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return todasLasColecciones().map((c) => ({ nombre: c.nombre }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = coleccion((await params).nombre);
  if (!c) return {};
  return {
    title: c.titulo,
    // En vivo las colecciones no llevan descripción.
    description: null,
    alternates: { canonical: `/collections/${c.nombre}` },
    openGraph: { title: c.titulo, type: "website", images: c.imagenCompartir ? [c.imagenCompartir] : undefined },
  };
}

export default async function PaginaColeccion({ params, searchParams }: Props) {
  const c = coleccion((await params).nombre);
  if (!c) notFound();
  const filtros = leerFiltros(await searchParams, c.orden);
  return plantilla("collection").secciones.map((s) =>
    s.tipo === "main-collection-products" ? (
      <ProductosColeccion key={s.id} seccion={s} coleccion={c} filtros={filtros} />
    ) : (
      <Secciones key={s.id} secciones={[s]} />
    ),
  );
}
