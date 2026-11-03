// Collage de fotos con texto (sección «image-collage-with-text»): de una a cuatro fotos en dos columnas junto a un
// bloque de subtítulo, título, texto y botones. En celular y tableta va una cosa arriba de la otra; desde 1025 px
// lado a lado, con el ancho de las fotos según «collage_width» (de 12). Al pasar el mouse la foto se acerca.

import Image from "next/image";
import Link from "next/link";
import type { Bloque, Seccion } from "@/lib/contenido";
import { esquema, numero, texto } from "@/lib/contenido";
import type { PropsSeccion } from "./registro";
import { clasesAire } from "./aire";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import { BOTON_GRANDE } from "@/components/producto/estilos";
import { medidasImagen } from "./ImagenBanner";

// Relleno que baja desde arriba al pasar el mouse, con los colores del esquema de la sección.
const RELLENO =
  "relative isolate overflow-hidden transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 " +
  "after:bottom-full after:-z-10 after:transition-[bottom] after:duration-[400ms] after:ease-[cubic-bezier(0.7,0,0.3,1)] " +
  "hover:after:bottom-0 focus-visible:after:bottom-0 focus-visible:outline-2 focus-visible:outline-offset-2";
const BOTONES: Record<string, string> = {
  "btn-primary":
    `${RELLENO} inline-flex items-center justify-center border border-[var(--boton-fondo)] bg-[var(--boton-fondo)] ` +
    "font-titulo font-medium leading-6 text-[var(--boton-texto)] after:bg-white hover:text-[var(--boton-fondo)] " +
    "focus-visible:text-[var(--boton-fondo)]",
  "btn-outline":
    `${RELLENO} inline-flex items-center justify-center border border-[var(--texto)] bg-transparent font-titulo ` +
    "font-medium leading-6 text-[var(--texto)] after:bg-[var(--texto)] hover:text-[var(--fondo)]",
};

/** Ordenes del tema: en celular «fd-column-reverse» pone las fotos arriba; en computadora «fd-row-reverse-md» a la izquierda. */
export function ordenDeContenido(seccion: Seccion): string {
  const cel = texto(seccion.ajustes, "content_ordering_mobile");
  const compu = texto(seccion.ajustes, "content_ordering_desktop");
  return `${cel === "fd-column-reverse" ? "flex-col-reverse" : "flex-col"} ${
    compu === "fd-row-reverse-md" ? "min-[1025px]:flex-row-reverse" : "min-[1025px]:flex-row"
  }`;
}

/** Subtítulo, título, texto y botones de las secciones «… with text», en el orden de sus bloques. */
export function BloqueTexto({
  bloques,
  className = "",
  centradoCel = false,
}: {
  bloques: Bloque[];
  className?: string;
  /** «content_position_mobile: ta-center»: centrado en celular y tableta; a la izquierda desde 1025 px. */
  centradoCel?: boolean;
}) {
  const alineacion = centradoCel
    ? "items-center text-center min-[1025px]:items-start min-[1025px]:text-left"
    : "items-start text-left";
  return (
    <div className={`flex flex-col ${alineacion} ${className}`}>
      {bloques.map((b) => {
        const a = b.ajustes;
        // Cada pieza deja aire abajo, menos la última. (Los títulos llevan «!» porque globals.css fija h1–h6 fuera de capas.)
        if (b.tipo === "subheading") {
          const t = texto(a, "subheading");
          return t ? (
            <div key={b.id} className="mb-3 max-w-[650px] font-titulo text-[19.2px] leading-6 font-medium last:mb-0">
              {t}
            </div>
          ) : null;
        }
        if (b.tipo === "heading") {
          const t = texto(a, "heading");
          const tam = texto(a, "heading_size") || "h2";
          const clase = tam === "h1" ? "text-[length:var(--h1)]!" : tam === "h3" ? "text-[length:var(--h3)]!" : "text-[length:var(--h2)]!";
          return t ? (
            <Titulo
              key={b.id}
              texto={t}
              className={`mb-[13.5px]! max-w-[1280px] break-words ${clase} md:mb-[14.4px]! min-[1025px]:mb-[28.8px]! last:mb-0!`}
            />
          ) : null;
        }
        if (b.tipo === "description") {
          return (
            <TextoRico
              key={b.id}
              html={texto(a, "description")}
              className="mb-6 max-w-[650px] [&_p+p]:mt-8! [&_p+ul]:mt-8 [&_ul]:mb-8 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:pl-4 [&_li+li]:mt-2 min-[1025px]:mb-12 last:mb-0"
            />
          );
        }
        if (b.tipo === "button") {
          const botones = [
            { t: texto(a, "button_main_text"), e: texto(a, "button_main_link"), s: texto(a, "button_main_style") },
            { t: texto(a, "button_sub_text"), e: texto(a, "button_sub_link"), s: texto(a, "button_sub_style") },
          ].filter((x) => x.t);
          // Sin botones el tema deja el bloque vacío, y el texto de arriba conserva su aire de abajo.
          if (botones.length === 0) return <div key={b.id} />;
          return (
            <div key={b.id} className="flex max-w-[650px] flex-wrap items-start gap-3">
              {botones.map((x) => (
                <Link key={x.t} href={x.e || "#"} className={`${BOTONES[x.s] ?? BOTONES["btn-primary"]} ${BOTON_GRANDE}`}>
                  {x.t}
                </Link>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function Foto({ src, sizes }: { src: string; sizes: string }) {
  const { ancho, alto } = medidasImagen(src);
  return (
    <div className="group overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
      <div className="transition-transform duration-150 group-hover:scale-110">
        <Image
          src={src}
          alt=""
          width={ancho}
          height={alto}
          sizes={sizes}
          className="block h-auto w-full object-cover transition-transform duration-150 group-hover:scale-110"
        />
      </div>
    </div>
  );
}

export function CollageImagenTexto({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const columna1 = [texto(a, "primary_image"), texto(a, "tertiary_image")].filter(Boolean);
  const columna2 = [texto(a, "secondary_image"), texto(a, "quaternary_image")].filter(Boolean);
  const columnas = [columna1, columna2].filter((c) => c.length > 0);
  const anchoFotos = numero(a, "collage_width", 6) / 12;
  const alineacion = texto(a, "collage_alignment");
  const pegajoso = alineacion === "media-sticky";
  const alinear = pegajoso ? "items-start" : alineacion === "bottom-xs" ? "items-end" : alineacion === "middle-xs" ? "items-center" : "items-start";
  // Ancho aproximado de cada foto en la pantalla, para que el navegador baje el tamaño justo.
  const vwCompu = Math.round((anchoFotos * 90) / columnas.length);
  const sizes = `(min-width: 1025px) ${vwCompu}vw, ${columnas.length > 1 ? 50 : 100}vw`;
  const estilo = { "--ancho-fotos": anchoFotos } as React.CSSProperties;

  return (
    <section className={esquema(a)} data-seccion="image-collage-with-text">
      <div className={`contenedor ${clasesAire(seccion, producto)}`}>
        <div className={`flex justify-center gap-[var(--hueco)] min-[1025px]:gap-[28.8px] ${ordenDeContenido(seccion)}`} style={estilo}>
          <BloqueTexto
            bloques={seccion.bloques}
            className="min-w-0 min-[1025px]:flex-1"
            centradoCel={texto(a, "content_position_mobile") === "ta-center"}
          />
          {columnas.length > 0 && (
            <div className="min-w-0 shrink-0 min-[1025px]:w-[calc((100%_-_28.8px)_*_var(--ancho-fotos))]">
              <div className={`flex gap-[14.04px] md:gap-6 min-[1025px]:gap-[28.8px] ${alinear}`}>
                {columnas.map((fotos, i) => (
                  <div
                    key={i}
                    className={`flex min-w-0 flex-1 flex-col gap-[14.04px] md:gap-6 min-[1025px]:gap-[28.8px] ${
                      pegajoso ? "sticky top-6 min-[1025px]:top-16" : ""
                    }`}
                  >
                    {fotos.map((src) => (
                      <Foto key={src} src={src} sizes={sizes} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
