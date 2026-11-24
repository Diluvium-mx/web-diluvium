// Sección «landing-blog»: los artículos del blog en tarjetas (página Blog de B1, /blogs/blog). Los artículos salen de
// contenido/blog.json, del más nuevo al más viejo, igual que en la tienda: foto, fecha, título, resumen y «Leer».
// La foto de cada tarjeta es una pieza de la sección («article_card», con el nombre del artículo; 24-nov-2026): así se
// cambia y se acomoda en el editor local. Sin pieza, la del artículo.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { articulosBlog } from "../Articulo";
import { textoVersion, tx } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { IconoFlecha } from "./piezas";

export function BlogVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "niebla");
  const titulo = textoVersion(a, "heading");
  const articulos = articulosBlog();
  return (
    <section data-seccion="landing-blog" aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} aria-label={titulo ? undefined : "Artículos"} className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version">
        {titulo && (
          <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 mb-8 max-w-[40rem] text-[28px] md:mb-10 md:text-[38px]">
            {formato(titulo)}
          </h2>
        )}
        {texto(a, "text") && <p className="m-0 -mt-4 mb-8 max-w-[40rem] text-[17px] leading-[1.55] text-tinta">{formato(textoVersion(a, "text"))}</p>}
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 lg:grid-cols-3">
          {articulos.map((art, i) => {
            const pieza = seccion.bloques.find((b) => b.tipo === "article_card" && b.id === art.slug);
            const foto = (pieza && texto(pieza.ajustes, "image")) || art.imagen?.src;
            return (
            <li key={art.slug} className="flex">
              <a
                href={art.url}
                className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-marino ring-1 ring-linea transition-shadow hover:shadow-[0_22px_50px_-28px_rgba(12,30,51,0.6)]"
              >
                {foto && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-niebla">
                    {/* El acercamiento al pasar el ratón va en el marco: la foto ya lleva el suyo (el del editor). */}
                    <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                      <Image
                        src={foto}
                        alt=""
                        fill
                        priority={i === 0}
                        sizes="(min-width: 1200px) 397px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 32px)"
                        className="object-cover"
                        style={pieza ? estiloFoto(pieza.ajustes) : undefined}
                        {...(pieza ? marcaEditar(seccion.id, pieza.id, "image") : {})}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="m-0 text-[14px] font-semibold text-texto-suave">
                    <time dateTime={art.publicado}>{art.fecha}</time>
                  </p>
                  <h3 className="m-0 mt-2 font-titulo text-[20px] leading-tight font-medium">{art.titulo}</h3>
                  <p className="m-0 mt-2 line-clamp-3 text-[15.5px] leading-[1.5] text-texto-suave">{art.resumen}</p>
                  <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 font-semibold underline decoration-2 underline-offset-4 group-hover:decoration-4">
                    {tx(a, "read_more", "Leer artículo")}
                    <IconoFlecha className="size-[18px]" />
                  </span>
                </div>
              </a>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
