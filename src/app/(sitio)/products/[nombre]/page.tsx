import type { Metadata } from "next";
import { notFound } from "next/navigation";
import productos from "@contenido/productos.json";
import { plantillaProducto } from "@/lib/contenido";
import { producto } from "@/components/producto/catalogo";
import { Secciones } from "@/components/secciones/registro";
import { ResenasProducto } from "@/components/resenas/ResenasProducto";
import { DatosEstructurados, MetaProducto, datosProducto, metadatos } from "@/lib/seo";

// Páginas de producto con las mismas direcciones que en Shopify: /products/<nombre>.

export function generateStaticParams() {
  return productos.productos.map((p) => ({ nombre: p.nombre }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ nombre: string }> }): Promise<Metadata> {
  return metadatos(`/products/${(await params).nombre}`);
}

export default async function PaginaProducto({ params }: { params: Promise<{ nombre: string }> }) {
  const nombre = (await params).nombre;
  const p = producto(nombre);
  const datos = productos.productos.find((x) => x.nombre === nombre);
  if (!p || !datos) notFound();
  // Las reseñas (hoy las pone la app Trustoo) van justo después de la ficha principal, fuera de las secciones del tema.
  const secciones = plantillaProducto(datos.plantilla).secciones;
  const corte = secciones.findIndex((s) => s.tipo === "main-product") + 1;
  return (
    <>
      <MetaProducto producto={p} />
      <DatosEstructurados datos={datosProducto(p)} />
      <Secciones secciones={secciones.slice(0, corte)} producto={p} />
      <ResenasProducto producto={p} />
      <Secciones secciones={secciones.slice(corte)} producto={p} />
    </>
  );
}
