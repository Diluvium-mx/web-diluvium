// Sección «landing-articulo»: un artículo del blog con el aspecto de B1 (/v/b1/blogs/blog/<artículo>). La página dice
// qué artículo es; el contenido sale de contenido/blog.json, limpio como en la tienda (limpiarCuerpo). Lleva «Volver al
// blog», fecha y autor, la foto, el texto a lo ancho cómodo para leer y, al final, los otros artículos.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { articuloBlog, articulosBlog, limpiarCuerpo } from "../Articulo";
import { tx } from "./datos";
import { claseFondo, fondoPropio } from "./Olas";
import { IconoFlecha } from "./piezas";

/** Quita los párrafos vacíos del principio («<p>&nbsp;</p>», que traen algunos artículos y dejan un hueco). */
function sinVaciosArriba(html: string): string {
  return html.replace(/^(\s*<p[^>]*>(\s|&nbsp;|<br>)*<\/p>)+/, "");
}

export function ArticuloVersion({ seccion, slugArticulo }: PropsSeccion) {
  const a = seccion.ajustes;
  const art = slugArticulo ? articuloBlog(slugArticulo) : undefined;
  if (!art) return null;
  const fondo = fondoPropio(a, "blanco");
  const otros = articulosBlog().filter((x) => x.slug !== art.slug);
  return (
    <article data-seccion="landing-articulo" aria-labelledby="titulo-articulo" className={`${claseFondo(fondo)} py-8 md:py-14`}>
      <div className="marco-version max-w-[50rem]">
        {/* Enlace normal y no <Link>: EnlacesVersion le pone la dirección de la versión y <Link> la ignoraría. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/blogs/blog" className="inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4">
          <IconoFlecha className="size-[18px] rotate-180" />
          {tx(a, "back_text", "Volver al blog")}
        </a>
        <p className="m-0 mt-5 text-[15px] font-semibold text-texto-suave">
          <time dateTime={art.publicado}>{art.fecha}</time>
          {art.autor && (
            <>
              {" · "}
              {tx(a, "author_prefix", "Por")} {art.autor}
            </>
          )}
        </p>
        <h1 id="titulo-articulo" className="titulo-version m-0 mt-3 text-[32px] md:text-[46px]">
          {art.titulo}
        </h1>
      </div>
      {art.imagen && (
        <div className="marco-version mt-7 max-w-[62rem] md:mt-10">
          <Image
            src={art.imagen.src}
            alt={art.imagen.alt}
            width={art.imagen.ancho}
            height={art.imagen.alto}
            priority
            sizes="(min-width: 1060px) 992px, calc(100vw - 32px)"
            className="h-auto w-full rounded-2xl"
          />
        </div>
      )}
      <div className="marco-version mt-8 max-w-[50rem] md:mt-12">
        <div className="articulo-version text-tinta" dangerouslySetInnerHTML={{ __html: sinVaciosArriba(limpiarCuerpo(art.cuerpo)) }} />
      </div>
      {otros.length > 0 && (
        <nav aria-labelledby="titulo-otros" className="marco-version mt-14 max-w-[62rem] border-t border-linea pt-10 md:mt-20">
          <h2 id="titulo-otros" className="titulo-version m-0 text-[24px] md:text-[30px]">
            {tx(a, "related_heading", "Sigue leyendo")}
          </h2>
          <ul className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-2">
            {otros.map((o) => (
              <li key={o.slug}>
                <a href={o.url} className="group flex h-full items-center gap-4 rounded-2xl bg-niebla p-3 pr-5 text-marino">
                  {o.imagen && (
                    <span className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image src={o.imagen.src} alt="" fill sizes="112px" className="object-cover" />
                    </span>
                  )}
                  <span className="font-titulo text-[17px] leading-tight font-medium group-hover:underline">{o.titulo}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
