import type { Metadata } from "next";
import { notFound } from "next/navigation";
import paginas from "@contenido/paginas.json";
import { plantilla, type NombrePlantilla } from "@/lib/contenido";
import { Secciones } from "@/components/secciones/registro";
import { ContenidoPagina } from "@/components/secciones/ContenidoPagina";
import { MigasDePan } from "@/components/secciones/MigasDePan";
import { ResenasTienda } from "@/components/resenas/ResenasTienda";
import { metadatos } from "@/lib/seo";

// Páginas de Shopify con las mismas direcciones: /pages/<nombre>. Cada una usa su plantilla del tema; el título y el
// texto de la página (que no vienen en el tema) salen de contenido/paginas.json.

const PLANTILLAS: Record<string, NombrePlantilla> = {
  nosotros: "page.nosotros",
  contact: "page.contact",
  instalacion: "page.instalacion",
  distribuidor: "page.distribuidor",
};

function pagina(nombre: string) {
  return paginas.paginas.find((p) => p.nombre === nombre);
}

export function generateStaticParams() {
  return paginas.paginas.map((p) => ({ nombre: p.nombre }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ nombre: string }> }): Promise<Metadata> {
  return metadatos(`/pages/${(await params).nombre}`);
}

export default async function PaginaTienda({ params }: { params: Promise<{ nombre: string }> }) {
  const nombre = (await params).nombre;
  const p = pagina(nombre);
  if (!p) notFound();
  const secciones = plantilla(PLANTILLAS[nombre] ?? "page").secciones;
  // La lista de reseñas de la página «reviews» la ponía la app Trustoo dentro del texto de la página.
  const app = nombre === "reviews" ? <ResenasTienda /> : null;
  // El título y las migas de pan necesitan la página; las demás secciones se dibujan como en cualquier plantilla.
  return secciones.map((s) => {
    if (s.tipo === "main-page") {
      return (
        <ContenidoPagina key={s.id} seccion={s} pagina={p}>
          {app}
        </ContenidoPagina>
      );
    }
    if (s.tipo === "breadcrumb") return <MigasDePan key={s.id} seccion={s} actual={p.titulo} />;
    return <Secciones key={s.id} secciones={[s]} />;
  });
}

