// Sección «landing-historia»: la historia de Diluvium por capítulos (página Nosotros de B1). Cada pieza «chapter» lleva
// una línea chica, su título, el texto (con **negritas** y ==naranja==) y una foto; en computadora la foto va a un lado y
// al otro en cada capítulo, y en el celular arriba del texto. Puede llevar un «video automático» en lugar de la foto (corre
// solo y sin sonido, como el de la galería de la compuerta; la foto queda de portada) y un enlace
// al final («link_text» y «link»; si sale de la página, se abre en otra pestaña).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion, tx } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { IconoFlecha } from "./piezas";
import { VideoAutomatico } from "./VideoAutomatico";
import { tieneSonido } from "@/lib/videos";

/** Párrafos separados por una línea en blanco; dentro de cada uno, los saltos de línea se respetan. */
function Parrafos({ valor }: { valor: string }) {
  return valor
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p, i) => (
      <p key={i} className="m-0 text-[17px] leading-[1.65] text-tinta md:text-[18px]">
        {formato(p.trim())}
      </p>
    ));
}

export function HistoriaVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "blanco");
  const capitulos = seccion.bloques.filter((b) => b.tipo === "chapter");
  const titulo = textoVersion(a, "heading");
  return (
    <section data-seccion="landing-historia" aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version">
        {titulo && (
          <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 mb-10 max-w-[44rem] text-[28px] md:mb-14 md:text-[40px]">
            {formato(titulo)}
          </h2>
        )}
        <div className="grid gap-14 md:gap-20">
          {capitulos.map((b, i) => {
            const ba = b.ajustes;
            const foto = texto(ba, "image");
            const video = texto(ba, "video");
            return (
              <article key={b.id} data-pieza={b.id} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                {(foto || video) && (
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-niebla ${i % 2 === 1 ? "md:order-2" : ""}`}>
                    {video ? (
                      // «Video automático»: corre solo y sin sonido al llegar a él, como el de la galería de la compuerta.
                      <VideoAutomatico src={video} poster={foto} alt={texto(ba, "alt")} estilo={estiloFoto(ba, "video")} marca={marcaEditar(seccion.id, b.id, "video")} tocaParaOir={tx(a, "sound_hint", "Toca para oír")} sinSonido={!tieneSonido(video)} />
                    ) : (
                      <Image
                        src={foto}
                        alt={texto(ba, "alt")}
                        fill
                        sizes="(min-width: 1200px) 600px, (min-width: 768px) 46vw, calc(100vw - 32px)"
                        style={estiloFoto(ba)}
                        {...marcaEditar(seccion.id, b.id, "image")}
                        className="object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="grid gap-4">
                  {texto(ba, "subheading") && (
                    <p className="m-0 text-[14px] font-semibold tracking-[0.08em] text-boton uppercase">{formato(textoVersion(ba, "subheading"))}</p>
                  )}
                  {texto(ba, "heading") && (
                    <h3 className="titulo-version m-0 text-[25px] md:text-[32px]">{formato(textoVersion(ba, "heading"))}</h3>
                  )}
                  <Parrafos valor={textoVersion(ba, "text")} />
                  {texto(ba, "link_text") && texto(ba, "link") && (
                    <a
                      href={texto(ba, "link")}
                      {...(/^https?:/.test(texto(ba, "link")) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold underline decoration-2 underline-offset-4 hover:decoration-4"
                    >
                      {formato(textoVersion(ba, "link_text"))}
                      <IconoFlecha className="size-[18px]" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
