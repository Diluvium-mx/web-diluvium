import type { Metadata } from "next";
import productos from "@contenido/productos.json";
import PaginaProducto, { generateMetadata as metadatosProducto } from "@/app/products/[nombre]/page";
import { todasLasColecciones } from "@/components/producto/colecciones";

// Ficha de producto abierta desde una colección (/collections/<colección>/products/<producto>), como en Shopify:
// es la misma página de /products/<producto>, con la dirección principal (canonical) apuntando a esa.

type Props = { params: Promise<{ nombre: string; producto: string }> };

export function generateStaticParams() {
  return todasLasColecciones().flatMap((c) => productos.productos.map((p) => ({ nombre: c.nombre, producto: p.nombre })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { producto } = await params;
  const datos = await metadatosProducto({ params: Promise.resolve({ nombre: producto }) });
  return { ...datos, alternates: { canonical: `/products/${producto}` } };
}

export default async function ProductoEnColeccion({ params }: Props) {
  const { producto } = await params;
  return <PaginaProducto params={Promise.resolve({ nombre: producto })} />;
}
