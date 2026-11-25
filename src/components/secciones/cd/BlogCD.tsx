// Blog y artículo de C y D (25-nov-2026). Los artículos salen de contenido/blog.json, del más nuevo al más viejo.
//   «c-blog» / «d-blog»: las tarjetas. La foto de cada una es una pieza «article_card» con el nombre del artículo (se
//     cambia en el editor). C: tarjetas grandes una abajo de otra. D: el más nuevo grande y los demás en renglones con
//     la foto a la izquierda.
//   «c-articulo» / «d-articulo»: el artículo con letra de 19 px, «Volver al blog», fecha y autor con su ícono (sin «·»),
//     la foto de arriba y las de dentro del texto (pieza «article_photos», como en B), «Sigue leyendo» y, si la
//     sección trae WhatsApp, un recuadro «¿Tienes dudas?» al final.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { articuloBlog, articulosBlog, limpiarCuerpo } from "../Articulo";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { enlacesSinProtocolo, fotoDe, fotosDelCuerpo, nombrarEnlacesDeFoto, sinVaciosArriba } from "../landing/ArticuloVersion";
import { Arriba, Raya, claseFondo, ESTILOS, Flecha, type Estilo } from "./estilo";

function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

function IconoPersona() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function BlogCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const titulo = textoVersion(a, "heading");
  const articulos = articulosBlog();
  return (
    <section data-seccion={seccion.tipo} aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} aria-label={titulo ? undefined : "Artículos"} className={`${claseFondo(estilo, texto(a, "fondo") || (d ? "gris" : "blanco"))} ${e.seccion}`}>
      <div className="marco-version">
        {titulo && (
          <div className="mb-8">
            <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
            <h2 id={`titulo-${seccion.id}`} className={`${e.h2} max-w-[40rem]`}>
              {formato(titulo)}
            </h2>
            <Raya estilo={estilo} />
          </div>
        )}
        {texto(a, "text") && <p className={`m-0 mb-8 max-w-[40rem] ${e.texto}`}>{formato(textoVersion(a, "text"))}</p>}
        <ul className={`m-0 grid list-none p-0 ${d ? "gap-4 lg:grid-cols-2" : "gap-6 md:grid-cols-2 lg:grid-cols-3"}`}>
          {articulos.map((art, i) => {
            const pieza = seccion.bloques.find((b) => b.tipo === "article_card" && b.id === art.slug);
            const foto = (pieza && texto(pieza.ajustes, "image")) || art.imagen?.src;
            const grande = !d || i === 0;
            return (
              <li key={art.slug} className={`flex ${d && i === 0 ? "lg:row-span-3" : ""}`}>
                <a href={art.url} className={`group flex w-full overflow-hidden text-[#06182f] ${e.tarjeta} ${grande ? "flex-col" : "flex-row"}`}>
                  {foto && (
                    <div className={`relative shrink-0 overflow-hidden bg-[#f3f8fd] ${grande ? "aspect-[16/9]" : "w-[38%] md:w-48"}`}>
                      <Image
                        src={foto}
                        alt=""
                        fill
                        priority={i === 0}
                        sizes={grande ? "(min-width: 1024px) 600px, (min-width: 768px) 50vw, calc(100vw - 32px)" : "(min-width: 768px) 192px, 38vw"}
                        className="object-cover"
                        style={pieza ? estiloFoto(pieza.ajustes) : undefined}
                        {...(pieza ? marcaEditar(seccion.id, pieza.id, "image") : {})}
                      />
                    </div>
                  )}
                  <div className={`flex flex-1 flex-col ${grande ? "p-5 md:p-6" : "p-4"}`}>
                    <p className={`m-0 flex items-center gap-2 text-[16px] font-semibold ${e.suave}`}>
                      <IconoCalendario />
                      <time dateTime={art.publicado}>{art.fecha}</time>
                    </p>
                    <h3 className={`m-0 mt-2 font-titulo leading-tight font-semibold ${grande ? "text-[23px] md:text-[26px]" : "text-[19px]"}`}>{art.titulo}</h3>
                    {grande && <p className={`m-0 mt-2 line-clamp-3 text-[17px] leading-[1.5] ${e.suave}`}>{art.resumen}</p>}
                    <span className={`mt-auto inline-flex min-h-12 items-center gap-1.5 pt-3 text-[18px] ${e.enlace}`}>
                      {tx(a, "read_more", "Leer artículo")}
                      <Flecha />
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

export function ArticuloCD({ seccion, slugArticulo, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const art = slugArticulo ? articuloBlog(slugArticulo) : undefined;
  if (!art) return null;
  const otros = articulosBlog().filter((x) => x.slug !== art.slug);
  const foto = fotoDe(art, seccion.bloques);
  const piezaArticulo = seccion.bloques.find((b) => b.tipo === "article_photos" && b.id === art.slug);
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <article data-seccion={seccion.tipo} aria-labelledby="titulo-articulo" className="bg-white py-8 md:py-14">
      <div className="marco-version max-w-[50rem]">
        {/* Enlace normal y no <Link>: EnlacesVersion le pone la dirección de la versión. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/blogs/blog" className={`inline-flex min-h-12 items-center gap-2 text-[18px] ${e.enlace}`}>
          <Flecha className="size-5 rotate-180" />
          {tx(a, "back_text", "Volver al blog")}
        </a>
        <h1 id="titulo-articulo" className={`${e.h1} mt-4`}>
          {art.titulo}
        </h1>
        <Raya estilo={estilo} />
        <p className={`m-0 mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[17px] font-semibold ${e.suave}`}>
          <span className="flex items-center gap-2">
            <IconoCalendario />
            <time dateTime={art.publicado}>{art.fecha}</time>
          </span>
          {art.autor && (
            <span className="flex items-center gap-2">
              <IconoPersona />
              {tx(a, "author_prefix", "Por")} {art.autor}
            </span>
          )}
        </p>
      </div>
      {foto && (
        <div className="marco-version mt-7 max-w-[62rem] md:mt-10">
          <div className={`overflow-hidden ${e.foto}`}>
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
        <div
          className={`articulo-version articulo-grande text-[#1f2d3d] ${d ? "articulo-d" : ""}`}
          dangerouslySetInnerHTML={{ __html: nombrarEnlacesDeFoto(enlacesSinProtocolo(fotosDelCuerpo(sinVaciosArriba(limpiarCuerpo(art.cuerpo)), seccion.id, piezaArticulo))) }}
        />
        {whatsapp && (
          <aside className={`mt-12 p-6 md:p-8 ${d ? "rounded-xl bg-[#0b2545] text-white" : "rounded-3xl bg-[#f3f8fd]"}`}>
            <p className={`m-0 font-titulo text-[24px] leading-tight font-semibold ${d ? "text-white" : "text-[#06182f]"}`}>{formato(tx(a, "help_heading", "¿Tienes dudas sobre cómo proteger tu casa?"))}</p>
            <p className={`m-0 mt-2 text-[18px] leading-[1.5] ${d ? "text-white/85" : "text-[#45566a]"}`}>{formato(tx(a, "help_text", "Te atiende una persona por WhatsApp, sin compromiso."))}</p>
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, leí el artículo «{articulo}» y quiero proteger mi casa, ¿qué me recomiendan?").replace("{articulo}", art.titulo))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className={`${e.whatsapp} mt-5`}
            >
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
            </a>
          </aside>
        )}
      </div>
      {otros.length > 0 && (
        <nav aria-labelledby="titulo-otros" className="marco-version mt-14 max-w-[62rem] border-t border-[#d9e2ec] pt-10 md:mt-20">
          <h2 id="titulo-otros" className={e.h3}>
            {tx(a, "related_heading", "Sigue leyendo")}
          </h2>
          <Raya estilo={estilo} />
          <ul className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-2">
            {otros.map((o) => {
              const mini = fotoDe(o, seccion.bloques);
              return (
                <li key={o.slug}>
                  <a href={o.url} className={`group flex h-full items-center gap-4 p-3 pr-5 text-[#06182f] ${d ? e.borde : "rounded-3xl bg-[#f3f8fd]"}`}>
                    {mini && (
                      <span className={`relative block aspect-[4/3] w-28 shrink-0 overflow-hidden bg-white ${d ? "rounded-lg" : "rounded-2xl"}`}>
                        <Image src={mini.src} alt="" fill sizes="112px" className="object-cover" />
                      </span>
                    )}
                    <span className="font-titulo text-[18px] leading-tight font-semibold group-hover:underline">{o.titulo}</span>
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
