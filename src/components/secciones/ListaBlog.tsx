// Lista de artículos del blog («Tips de prevención») (sección «blog-post-list»). Carrusel que se desliza con el
// dedo: una tarjeta por pantalla en celular, dos en tableta y tres en computadora. Los artículos salen de
// contenido/blog.json (herramientas/extraer-resenas-blog.py), del más nuevo al más viejo.

import Image from "next/image";
import Link from "next/link";
import blog from "@contenido/blog.json";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { Titulo } from "@/components/comunes/Texto";

type Articulo = {
  titulo: string;
  url: string;
  fecha: string;
  resumen: string;
  imagen?: { src: string; alt: string; ancho: number; alto: number };
};

const ARTICULOS: Articulo[] = blog.articulos;

export function ListaBlog({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const articulos = ARTICULOS.slice(0, numero(a, "items_to_show", 8));
  const boton = texto(a, "button_text");
  const conFoto = siNo(a, "show_featured_image");
  const conFecha = siNo(a, "show_published_date");
  const conResumen = siNo(a, "show_excerpt");

  return (
    <section className={`lista-blog ${esquema(a)} overflow-hidden`} data-seccion="blog-post-list">
      <style>{`
        .lista-blog .blog-fila { scrollbar-width: none; }
        .lista-blog .blog-fila::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="contenedor flex flex-col gap-[var(--hueco)] py-[var(--aire)]">
        <div className="flex flex-col">
          <Titulo texto={texto(a, "heading")} className="break-words" />
        </div>

        <ul
          className="blog-fila -mx-[var(--margen)] flex snap-x snap-mandatory list-none gap-[3.6vw] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] md:gap-6 min-[1025px]:gap-[2vw]"
          aria-label={texto(a, "heading") || "Artículos"}
        >
          {articulos.map((art) => (
            <li
              key={art.url}
              className="esquema-6 relative w-full shrink-0 snap-start rounded-2xl md:w-[calc((100%-24px)/2)] md:rounded-3xl min-[1025px]:w-[calc((100%-4vw)/3)] min-[1025px]:rounded-[32px]"
            >
              {conFoto && art.imagen && (
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
                  <Link href={art.url} aria-label={art.titulo} className="absolute inset-0 z-[3]" tabIndex={-1} />
                  <Image
                    src={art.imagen.src}
                    alt={art.imagen.alt}
                    fill
                    sizes="(min-width: 1025px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4 min-[1025px]:p-6">
                <h3 className="!mb-2 break-words font-titulo !text-[19.2px] font-medium !leading-6">
                  <Link href={art.url}>{art.titulo}</Link>
                </h3>
                {conFecha && art.fecha && (
                  <div className="mb-3 text-[13.6px] leading-[17px] text-[rgb(0_66_136/0.6)]">{art.fecha}</div>
                )}
                {conResumen && art.resumen && <p className="m-0 overflow-hidden">{art.resumen}</p>}
              </div>
            </li>
          ))}
        </ul>

        {siNo(a, "show_view_all_button") && boton && (
          <div className="text-left">
            <Link
              href="/blogs/blog"
              className="inline-flex h-10 items-center justify-center bg-white px-5 py-1.5 font-titulo font-medium leading-6 text-azul shadow-[inset_0_0_0_1px_rgb(10_85_154/0.12)]"
            >
              {boton}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
