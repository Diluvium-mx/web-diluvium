// Piezas de la página Nosotros de C y D (25-nov-2026):
//   «c-historia» / «d-historia»: la historia por capítulos (piezas «chapter»: línea chica, título, texto con **negritas**,
//     foto o «video automático» y enlace opcional). C: foto arriba y texto grande, alternando lados en computadora.
//     D: línea de tiempo con un punto amarillo por capítulo.
//   «c-premios» / «d-premios»: reconocimientos (piezas «award»: foto, título y de quién es). C: renglones con la foto a
//     la izquierda. D: tarjetas con borde.
//   «c-cita» / «d-cita»: un mensaje grande con firma. C: tarjeta azul muy clara. D: banda azul marino con comillas
//     amarillas.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { tieneSonido } from "@/lib/videos";
import { textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { VideoAutomatico } from "../landing/VideoAutomatico";
import { Arriba, Raya, claseFondo, ESTILOS, Flecha, type Estilo } from "./estilo";

/** Párrafos separados por una línea en blanco; dentro de cada uno, los saltos de línea se respetan. */
function Parrafos({ valor, clase }: { valor: string; clase: string }) {
  return valor
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p, i) => (
      <p key={i} className={`m-0 ${clase}`}>
        {formato(p.trim())}
      </p>
    ));
}

export function HistoriaCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const capitulos = seccion.bloques.filter((b) => b.tipo === "chapter");
  const titulo = textoVersion(a, "heading");
  return (
    <section data-seccion={seccion.tipo} aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} aria-label={titulo ? undefined : "Nuestra historia"} className={`${claseFondo(estilo, texto(a, "fondo") || "blanco")} ${e.seccion}`}>
      <div className="marco-version">
        {titulo && (
          <div className="mb-10 md:mb-14">
            <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
            <h2 id={`titulo-${seccion.id}`} className={`${e.h2} max-w-[44rem]`}>
              {formato(titulo)}
            </h2>
            <Raya estilo={estilo} />
          </div>
        )}
        <ol className={`m-0 grid list-none p-0 ${d ? "gap-12 border-l-[3px] border-[#d9e2ec] pl-6 md:ml-3 md:pl-10" : "gap-14 md:gap-20"}`}>
          {capitulos.map((b, i) => {
            const ba = b.ajustes;
            const foto = texto(ba, "image");
            const video = texto(ba, "video");
            return (
              <li key={b.id} data-pieza={b.id} className={`relative grid items-center gap-6 md:grid-cols-2 md:gap-12`}>
                {d && <span className="absolute top-1 -left-[35px] size-5 rounded-full border-4 border-white bg-[#ffc83d] shadow md:-left-[51px]" aria-hidden="true" />}
                {(foto || video) && (
                  <div className={`relative aspect-[4/3] overflow-hidden ${e.foto} bg-[#f3f8fd] ${!d && i % 2 === 1 ? "md:order-2" : ""} ${d ? "border border-[#d9e2ec]" : ""}`}>
                    {video ? (
                      <VideoAutomatico src={video} poster={foto} alt={texto(ba, "alt")} estilo={estiloFoto(ba, "video")} marca={marcaEditar(seccion.id, b.id, "video")} tocaParaOir={tx(a, "sound_hint", "Toca para oír")} sinSonido={!tieneSonido(video)} />
                    ) : (
                      <Image src={foto} alt={texto(ba, "alt")} fill sizes="(min-width: 1200px) 600px, (min-width: 768px) 46vw, calc(100vw - 32px)" style={estiloFoto(ba)} {...marcaEditar(seccion.id, b.id, "image")} className="object-cover" />
                    )}
                  </div>
                )}
                <div className={`grid gap-4 ${d ? "md:order-first" : ""}`}>
                  {texto(ba, "subheading") &&
                    (d ? (
                      <p className="m-0 justify-self-start rounded-full bg-[#fff4d1] px-3.5 py-1 text-[16px] font-bold text-[#0b2545]">{formato(textoVersion(ba, "subheading"))}</p>
                    ) : (
                      <Arriba estilo="c">{formato(textoVersion(ba, "subheading"))}</Arriba>
                    ))}
                  {texto(ba, "heading") && <h3 className={e.h3}>{formato(textoVersion(ba, "heading"))}</h3>}
                  <Parrafos valor={textoVersion(ba, "text")} clase={e.texto} />
                  {texto(ba, "link_text") && texto(ba, "link") && (
                    <a
                      href={texto(ba, "link")}
                      {...(/^https?:/.test(texto(ba, "link")) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`inline-flex min-h-12 items-center gap-2 justify-self-start text-[18px] ${e.enlace}`}
                    >
                      {formato(textoVersion(ba, "link_text"))}
                      <Flecha />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function PremiosCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const premios = seccion.bloques.filter((b) => b.tipo === "award");
  return (
    <section data-seccion={seccion.tipo} aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(estilo, texto(a, "fondo") || (d ? "gris" : "claro"))} ${e.seccion}`}>
      <div className="marco-version">
        <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
        <h2 id={`titulo-${seccion.id}`} className={`${e.h2} max-w-[40rem]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        <Raya estilo={estilo} />
        {texto(a, "text") && <p className={`m-0 mt-3 max-w-[40rem] ${e.texto}`}>{formato(textoVersion(a, "text"))}</p>}
        <ul className={`m-0 mt-8 grid list-none p-0 ${d ? "gap-5 sm:grid-cols-2 lg:grid-cols-3" : "gap-4 md:grid-cols-2"}`}>
          {premios.map((b) => {
            const ba = b.ajustes;
            const foto = texto(ba, "image");
            return (
              <li key={b.id} data-pieza={b.id} className={`overflow-hidden ${d ? e.tarjeta : `${e.tarjeta} flex items-center gap-4 p-4`}`}>
                {foto && (
                  <div className={`relative shrink-0 overflow-hidden bg-[#f3f8fd] ${d ? "aspect-[4/3]" : "size-28 rounded-2xl"}`}>
                    <Image src={foto} alt={texto(ba, "alt")} fill sizes={d ? "(min-width: 1024px) 400px, (min-width: 640px) 50vw, calc(100vw - 32px)" : "112px"} style={estiloFoto(ba)} {...marcaEditar(seccion.id, b.id, "image")} className="object-cover" />
                  </div>
                )}
                <div className={d ? "p-5" : "min-w-0"}>
                  <h3 className="m-0 font-titulo text-[20px] leading-tight font-semibold text-[#06182f]">{formato(textoVersion(ba, "heading"))}</h3>
                  {texto(ba, "text") && <p className={`m-0 mt-1.5 text-[17px] leading-[1.45] ${e.suave}`}>{formato(textoVersion(ba, "text"))}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function CitaCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const d = estilo === "d";
  const foto = texto(a, "image");
  const boton = textoVersion(a, "button_text");
  return (
    <section data-seccion={seccion.tipo} aria-label={tx(a, "label", "Mensaje del equipo")} className={`${d ? "bg-[#0b2545] text-white" : "bg-white"} ${e.seccion}`}>
      <div className={`marco-version max-w-[60rem] ${d ? "" : ""}`}>
        <div className={d ? "grid gap-6 md:text-center" : "grid gap-6 rounded-3xl bg-[#f3f8fd] p-6 md:p-12 md:text-center"}>
          {foto && (
            <div className={`relative mx-auto aspect-[16/9] w-full overflow-hidden ${e.foto}`}>
              <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 960px, calc(100vw - 32px)" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} className="object-cover" />
            </div>
          )}
          {texto(a, "text") && <p className={`m-0 text-[19px] leading-[1.6] ${d ? "text-white/90" : "text-[#1f2d3d]"}`}>{formato(textoVersion(a, "text"))}</p>}
          <blockquote className="m-0">
            {d && (
              <span className="block font-titulo text-[72px] leading-[0.6] text-[#ffc83d]" aria-hidden="true">
                “
              </span>
            )}
            <p className={`m-0 font-titulo text-[28px] leading-[1.25] font-semibold md:text-[38px] ${d ? "mt-4 text-white" : "text-[#06182f]"}`}>{formato(textoVersion(a, "heading"))}</p>
            {texto(a, "signature") && <footer className={`mt-5 text-[18px] font-bold ${d ? "text-[#ffc83d]" : "text-[#1663a8]"}`}>{formato(textoVersion(a, "signature"))}</footer>}
          </blockquote>
          {boton && (
            <a href={texto(a, "button_link") || "/"} className={`${e.boton} md:mx-auto`}>
              {boton}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
