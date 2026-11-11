import type { Metadata } from "next";
import { notFound } from "next/navigation";
import productos from "@contenido/productos.json";
import { plantilla, plantillaProducto } from "@/lib/contenido";
import { EXPERIMENTO, PRODUCTOS_VERSION, VERSIONES, version } from "@/lib/versiones";
import { producto as buscarProducto } from "@/components/producto/catalogo";
import { PiezasTienda } from "@/components/MarcoSitio";
import { Secciones } from "@/components/secciones/registro";
import { ResenasProducto } from "@/components/resenas/ResenasProducto";
import { Medicion } from "@/components/secciones/landing/Medicion";
import { EnlacesVersion } from "@/components/secciones/landing/EnlacesVersion";
import { PastillaVersion } from "../../../../PastillaVersion";

// La ficha del producto dentro de una versión: /v/a/products/<producto> es la ficha de hoy con el marco de la tienda;
// /v/b1/products/<producto>… es la ficha nueva de cada versión (contenido/tema/product.<versión>.json), que nace del
// mapa de calor del 11-nov-2026. Las dos llevan la medición con la etiqueta de su versión. Nunca se indexan.

export function generateStaticParams() {
  return VERSIONES.flatMap((v) => PRODUCTOS_VERSION.map((producto) => ({ version: v.clave, producto })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ version: string; producto: string }> }): Promise<Metadata> {
  const { version: clave, producto } = await params;
  const v = version(clave);
  const p = buscarProducto(producto);
  return v && p ? { title: `${p.titulo} · versión ${v.etiqueta}` } : {};
}

export default async function FichaVersion({ params }: { params: Promise<{ version: string; producto: string }> }) {
  const { version: clave, producto } = await params;
  const v = version(clave);
  const p = buscarProducto(producto);
  const datos = productos.productos.find((x) => x.nombre === producto);
  if (!v || !p || !datos || !PRODUCTOS_VERSION.includes(producto)) notFound();

  if (!v.ficha) {
    // A: la ficha de hoy, igual que /products/<producto> (las reseñas van justo después de la ficha principal).
    const secciones = plantillaProducto(datos.plantilla).secciones;
    const corte = secciones.findIndex((s) => s.tipo === "main-product") + 1;
    return (
      <>
        <PiezasTienda>
          <Secciones secciones={secciones.slice(0, corte)} producto={p} />
          <ResenasProducto producto={p} />
          <Secciones secciones={secciones.slice(corte)} producto={p} />
        </PiezasTienda>
        <PastillaVersion etiqueta={v.etiqueta} />
        <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
        <EnlacesVersion clave={v.clave} />
      </>
    );
  }

  const secciones = plantilla(v.ficha).secciones;
  const encabezado = secciones.filter((s) => s.tipo === "landing-encabezado");
  const pie = secciones.filter((s) => s.tipo === "landing-pie");
  const cuerpo = secciones.filter((s) => s.tipo !== "landing-encabezado" && s.tipo !== "landing-pie");

  return (
    <div className="version bg-white text-marino">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-marino focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Secciones secciones={encabezado} producto={p} />
      <main id="contenido">
        <Secciones secciones={cuerpo} producto={p} />
      </main>
      <Secciones secciones={pie} producto={p} />
      <PastillaVersion etiqueta={v.etiqueta} />
      <Medicion experimento={EXPERIMENTO} version={v.etiqueta} />
      <EnlacesVersion clave={v.clave} />
    </div>
  );
}
