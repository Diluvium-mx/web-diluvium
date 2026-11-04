import type { Metadata } from "next";
import { notFound } from "next/navigation";
import politicas from "@contenido/politicas.json";
import { ESTILO_TEXTO_PAGINA } from "@/components/secciones/ContenidoPagina";

// Políticas de la tienda con las mismas direcciones que en Shopify: /policies/<nombre>. No son secciones del tema:
// solo el título y el texto (contenido/politicas.json, sacado con herramientas/extraer-paginas.py).

function politica(nombre: string) {
  return politicas.politicas.find((p) => p.nombre === nombre);
}

export function generateStaticParams() {
  return politicas.politicas.map((p) => ({ nombre: p.nombre }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ nombre: string }> }): Promise<Metadata> {
  const p = politica((await params).nombre);
  return p ? { title: p.titulo } : {};
}

export default async function PaginaPolitica({ params }: { params: Promise<{ nombre: string }> }) {
  const p = politica((await params).nombre);
  if (!p) notFound();
  return (
    <div className="grid gap-5 p-6 md:gap-[30px] md:p-12 min-[1025px]:gap-10 min-[1025px]:p-16">
      <div className="text-center">
        <h1 className="text-[length:var(--h2)]!">{p.tituloVisible}</h1>
      </div>
      {/* Texto ya limpiado al sacarlo: solo formato y enlaces. */}
      <div
        className={`mx-auto w-full max-w-[650px] break-words ${ESTILO_TEXTO_PAGINA}`}
        dangerouslySetInnerHTML={{ __html: p.cuerpo }}
      />
    </div>
  );
}

