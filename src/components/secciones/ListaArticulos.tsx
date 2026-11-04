// Lista de artículos del blog (sección «main-blog», página /blogs/blog): título «Blog» al centro y una tarjeta por
// artículo (foto 3:2, título, fecha y resumen), una columna en celular, dos en tableta y las del ajuste en computadora.
// Los artículos salen de contenido/blog.json (herramientas/extraer-articulos.py), del más nuevo al más viejo.

import Image from "next/image";
import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema, numero, siNo } from "@/lib/contenido";
import { articulosBlog } from "./Articulo";

// Ancho de cada tarjeta en computadora según «columns_per_row».
const COLUMNAS: Record<number, string> = {
  1: "min-[1025px]:w-full",
  2: "min-[1025px]:w-1/2",
  3: "min-[1025px]:w-1/3",
  4: "min-[1025px]:w-1/4",
};

export function ListaArticulos({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const articulos = articulosBlog().slice(0, numero(a, "items_per_load", 20));
  const conFoto = siNo(a, "show_featured_image");
  const conFecha = siNo(a, "show_published_date");
  const conAutor = siNo(a, "show_author");
  const conResumen = siNo(a, "show_excerpt");
  const conEtiquetas = siNo(a, "show_blog_tags");
  const columnas = COLUMNAS[numero(a, "columns_per_row", 4)] ?? COLUMNAS[4];

  return (
    <div className={`${esquema(a)} my-[var(--aire)]`} data-seccion="main-blog">
      <div className="contenedor grid gap-[var(--hueco)]">
        <h1 className="text-center text-[length:var(--h2)]">Blog</h1>
        <ul className="-mx-[1.8vw] m-0 flex list-none flex-wrap gap-y-[3.6vw] p-0 md:-mx-3 md:gap-y-6 min-[1025px]:-mx-[1vw] min-[1025px]:gap-y-[2vw]">
          {articulos.map((art) => (
            <li key={art.url} className={`w-full px-[1.8vw] md:w-1/2 md:px-3 min-[1025px]:px-[1vw] ${columnas}`}>
              <article className="esquema-6 h-full rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
                {conFoto && art.imagen && (
                  <div className="group/foto relative aspect-[3/2] overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
                    <Link href={art.url} aria-label={art.titulo} className="absolute inset-0 z-[3]" tabIndex={-1} />
                    <Image
                      src={art.imagen.src}
                      alt={art.imagen.alt}
                      fill
                      sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-all duration-150 group-hover/foto:scale-110"
                    />
                  </div>
                )}
                <div className="p-4 min-[1025px]:p-6">
                  {conEtiquetas && art.etiquetas.length > 0 && (
                    <ul className="mb-2 flex list-none flex-wrap gap-x-2 gap-y-4 p-0 text-[13.6px] leading-[17px]">
                      {art.etiquetas.map((e) => (
                        <li key={e.url}>
                          <Link href={e.url}>{e.nombre}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <h3 className="mb-2 font-titulo text-[19.2px] leading-6 font-medium">
                    <Link href={art.url}>{art.titulo}</Link>
                  </h3>
                  {(conFecha || conAutor) && (
                    <div className="mb-3 text-[13.6px] leading-[17px] text-[rgb(0_66_136/0.6)]">
                      {conAutor && art.autor && <span className="mr-2">{art.autor}</span>}
                      {conFecha && <span className="inline-block">{art.fecha}</span>}
                    </div>
                  )}
                  {conResumen && art.resumen && <p className="m-0 overflow-hidden">{art.resumen}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
