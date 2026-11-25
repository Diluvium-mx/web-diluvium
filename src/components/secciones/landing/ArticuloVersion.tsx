// Sección «landing-articulo»: un artículo del blog con el aspecto de B1 (/v/b1/blogs/blog/<artículo>). La página dice
// qué artículo es; el contenido sale de contenido/blog.json, limpio como en la tienda (limpiarCuerpo). Lleva «Volver al
// blog», fecha y autor, la foto, el texto a lo ancho cómodo para leer y, al final, los otros artículos.
// Las fotos de cada artículo son una pieza de la sección («article_photos», con el nombre del artículo; 24-nov-2026):
// «image» la de arriba (también sale en «Sigue leyendo») e «image_1», «image_2»… las de dentro del texto, en orden.
// Así se cambian y se acomodan en el editor local; sin pieza, las del artículo.

import type { CSSProperties } from "react";
import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto, type Bloque } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { medidasImagen } from "../ImagenBanner";
import { articuloBlog, articulosBlog, limpiarCuerpo, type ArticuloBlog } from "../Articulo";
import { tx } from "./datos";
import { claseFondo, fondoPropio } from "./Olas";
import { IconoFlecha } from "./piezas";

/** Quita los párrafos vacíos del principio («<p>&nbsp;</p>», que traen algunos artículos y dejan un hueco). */
function sinVaciosArriba(html: string): string {
  return html.replace(/^(\s*<p[^>]*>(\s|&nbsp;|<br>)*<\/p>)+/, "");
}

const SRC_SEGURO = /^\/media\/[\w./-]+$/;

/** Estilo de React → texto para el atributo style («objectPosition» → «object-position: …»). */
function estiloEnTexto(e: CSSProperties | undefined): string {
  if (!e) return "";
  return Object.entries(e)
    .map(([k, v]) => `${k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${String(v)}`)
    .join("; ");
}

/** Las fotos de dentro del texto con la foto, el encuadre y la marca del editor de su pieza («image_1», «image_2»…).
 *  Cada una va en un marco que recorta lo que sobra al acercarla. */
function fotosDelCuerpo(html: string, seccionId: string, pieza: Bloque | undefined): string {
  if (!pieza) return html;
  let n = 0;
  return html.replace(/<img\b([^>]*)>/g, (_todo, resto: string) => {
    n += 1;
    const clave = `image_${n}`;
    let attrs = resto;
    const original = /src="([^"]*)"/.exec(resto)?.[1];
    const nueva = texto(pieza.ajustes, clave);
    if (nueva && nueva !== original && SRC_SEGURO.test(nueva) && !nueva.includes("..")) {
      // Mismo ancho que la de antes; el alto, el de la foto nueva.
      const m = medidasImagen(nueva);
      const ancho = Number(/width="(\d+)"/.exec(resto)?.[1]) || Math.min(480, m.ancho);
      attrs = attrs
        .replace(/src="[^"]*"/, `src="${nueva}"`)
        .replace(/\s(width|height)="\d+"/g, "")
        .concat(` width="${ancho}" height="${Math.round((ancho * m.alto) / m.ancho)}"`);
    }
    const centrada = /margin-left:\s*auto/.test(resto);
    const estilo = estiloEnTexto(estiloFoto(pieza.ajustes, clave));
    if (estilo) attrs = /style="/.test(attrs) ? attrs.replace(/style="([^"]*)"/, (_s, v: string) => `style="${v.replace(/;?\s*$/, ";")} ${estilo}"`) : `${attrs} style="${estilo}"`;
    const marca = marcaEditar(seccionId, pieza.id, clave)["data-editar"];
    // <picture> y no <span>: no mueve el lugar de los <span> de al lado (los números del mapa van por lugar).
    return `<picture class="foto-texto overflow-hidden${centrada ? " centrada" : ""}"><img${attrs} data-editar="${marca}"></picture>`;
  });
}

/** Enlaces escritos sin «https://» en el artículo («www.diluvium.com.mx»): el navegador los toma como una página dentro
 *  del blog que no existe (404). Los de Diluvium van al inicio; los de otros sitios, con https://. */
function enlacesSinProtocolo(html: string): string {
  return html.replace(/href="(www\.[^"]+)"/g, (_todo, dir: string) =>
    /^www\.diluvium\.com\.mx(\/|$)/.test(dir) ? `href="${dir.replace(/^www\.diluvium\.com\.mx/, "") || "/"}"` : `href="https://${dir}"`,
  );
}

/** Enlaces del texto que solo traen una foto sin descripción (los botones dibujados del artículo): se nombran por a
 *  dónde llevan, para los lectores de pantalla. Si ya tienen título, ese les da el nombre. */
function nombrarEnlacesDeFoto(html: string): string {
  return html.replace(/<a ([^>]*)>(\s*<picture[^>]*>\s*<img[^>]*alt=""[^>]*>\s*<\/picture>\s*)<\/a>/g, (todo, attrs: string, dentro: string) => {
    if (/\b(title|aria-label)=/.test(attrs)) return todo;
    const href = /href="([^"]*)"/.exec(attrs)?.[1] ?? "";
    const nombre = href === "/" ? "Ir al inicio" : href.startsWith("/products/") ? "Ver el producto" : "Abrir enlace";
    return `<a ${attrs} aria-label="${nombre}">${dentro}</a>`;
  });
}

/** La foto de arriba de un artículo: la de su pieza o, si no tiene, la del artículo. */
function fotoDe(art: ArticuloBlog, piezas: Bloque[]): { src: string; ancho: number; alto: number; pieza?: Bloque } | null {
  const pieza = piezas.find((b) => b.tipo === "article_photos" && b.id === art.slug);
  const src = (pieza && texto(pieza.ajustes, "image")) || art.imagen?.src;
  if (!src) return null;
  const m = src === art.imagen?.src ? { ancho: art.imagen.ancho, alto: art.imagen.alto } : medidasImagen(src);
  return { src, ...m, pieza };
}

export function ArticuloVersion({ seccion, slugArticulo }: PropsSeccion) {
  const a = seccion.ajustes;
  const art = slugArticulo ? articuloBlog(slugArticulo) : undefined;
  if (!art) return null;
  const fondo = fondoPropio(a, "blanco");
  const otros = articulosBlog().filter((x) => x.slug !== art.slug);
  const foto = fotoDe(art, seccion.bloques);
  const piezaArticulo = seccion.bloques.find((b) => b.tipo === "article_photos" && b.id === art.slug);
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
      {foto && (
        <div className="marco-version mt-7 max-w-[62rem] md:mt-10">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={foto.src}
              alt={art.imagen?.alt ?? art.titulo}
              width={foto.ancho}
              height={foto.alto}
              priority
              sizes="(min-width: 1060px) 992px, calc(100vw - 32px)"
              className="h-auto w-full"
              style={foto.pieza ? estiloFoto(foto.pieza.ajustes) : undefined}
              {...(foto.pieza ? marcaEditar(seccion.id, foto.pieza.id, "image") : {})}
            />
          </div>
        </div>
      )}
      <div className="marco-version mt-8 max-w-[50rem] md:mt-12">
        <div className="articulo-version text-tinta" dangerouslySetInnerHTML={{ __html: nombrarEnlacesDeFoto(enlacesSinProtocolo(fotosDelCuerpo(sinVaciosArriba(limpiarCuerpo(art.cuerpo)), seccion.id, piezaArticulo))) }} />
      </div>
      {otros.length > 0 && (
        <nav aria-labelledby="titulo-otros" className="marco-version mt-14 max-w-[62rem] border-t border-linea pt-10 md:mt-20">
          <h2 id="titulo-otros" className="titulo-version m-0 text-[24px] md:text-[30px]">
            {tx(a, "related_heading", "Sigue leyendo")}
          </h2>
          <ul className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-2">
            {otros.map((o) => {
              const mini = fotoDe(o, seccion.bloques);
              return (
              <li key={o.slug}>
                <a href={o.url} className="group flex h-full items-center gap-4 rounded-2xl bg-niebla p-3 pr-5 text-marino">
                  {mini && (
                    <span className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-white">
                      {/* La foto de arriba de ese artículo (se cambia en su página), sin marca: tocarla lleva al artículo. */}
                      <Image src={mini.src} alt="" fill sizes="112px" className="object-cover" />
                    </span>
                  )}
                  <span className="font-titulo text-[17px] leading-tight font-medium group-hover:underline">{o.titulo}</span>
                </a>
              </li>
              );
            })}
          </ul>
        </nav>
      )}
    </article>
  );
}
