"use client";

// Columnas de videos con texto («No necesitas confiar en nosotros, confía en ellos.») (sección
// «media-with-text-columns»). Cada video muestra su foto con un botón de reproducir; al tocarlo se cambia por el
// video con controles y con sonido, como en el sitio. Celular y tableta: carrusel que se desliza con el dedo;
// computadora: 4 columnas. Con «list_style» apagado (Nosotros: fotos de premios) va en cuadrícula: una columna en
// celular, dos en tableta y «columns_per_row» en computadora.

import Image from "next/image";
import { useState } from "react";
import type { Bloque, Seccion } from "@/lib/contenido";
import { esquema, texto } from "@/lib/contenido";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import type { Producto } from "@/components/producto/catalogo";
import { sinAireArriba } from "./aire";

function IconoReproducir({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M8 5.2v13.6L18.6 12 8 5.2Z" />
    </svg>
  );
}

function Video({ bloque, proporcion }: { bloque: Bloque; proporcion: string }) {
  const [cargado, setCargado] = useState(false);
  const archivo = texto(bloque.ajustes, "video_hosted");
  const foto = texto(bloque.ajustes, "video_thumbnail");
  const titulo = texto(bloque.ajustes, "heading");

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black md:rounded-3xl min-[1025px]:rounded-[32px]"
      style={{ aspectRatio: proporcion }}
    >
      {cargado && archivo ? (
        <video
          className="absolute inset-0 block h-full w-full object-contain"
          src={archivo}
          poster={foto || undefined}
          controls
          autoPlay
          playsInline
          preload="none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setCargado(true)}
          aria-label={titulo ? `Reproducir video: ${titulo}` : "Reproducir video"}
          className="group absolute inset-0 block h-full w-full cursor-pointer overflow-hidden border-0 bg-[#efefef] p-0"
        >
          {foto && (
            <Image
              src={foto}
              alt=""
              fill
              sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-150"
            />
          )}
          <span className="absolute left-1/2 top-1/2 z-[1] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[var(--fondo)] text-[var(--texto)] shadow-[inset_0_0_0_1px_rgb(0_66_136/0.12)] min-[1025px]:h-11 min-[1025px]:w-11">
            <IconoReproducir className="h-5 w-5 min-[1025px]:h-6 min-[1025px]:w-6" />
          </span>
        </button>
      )}
    </div>
  );
}

/** Foto cuadrada (o con «image_ratio») de un bloque «image», con las esquinas redondeadas del tema. */
function Foto({ src, proporcion, columnas }: { src: string; proporcion: string; columnas: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]" style={{ aspectRatio: proporcion }}>
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes={`(min-width: 1025px) ${Math.round(90 / columnas)}vw, (min-width: 768px) 45vw, 100vw`}
          className="object-cover"
        />
      )}
    </div>
  );
}

const COLUMNAS_COMPU: Record<number, string> = {
  2: "min-[1025px]:grid-cols-2",
  3: "min-[1025px]:grid-cols-3",
  4: "min-[1025px]:grid-cols-4",
};

// CSS propio que la sección trae en el tema («custom_css», no viene en el contenido): en la portada el espacio de
// abajo es de 20 px.
const ABAJO_PROPIO: Record<string, string> = { media_with_text_columns_cVz6pJ: "pb-5" };

const ALINEAR_CEL: Record<string, string> = { "ta-left": "items-start text-left", "ta-center": "items-center text-center", "ta-right": "items-end text-right" };
const ALINEAR_COMPU: Record<string, string> = {
  "ta-left-md": "min-[1025px]:items-start min-[1025px]:text-left",
  "ta-center-md": "min-[1025px]:items-center min-[1025px]:text-center",
  "ta-right-md": "min-[1025px]:items-end min-[1025px]:text-right",
};

export function MediosColumnas({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const subtitulo = texto(seccion.ajustes, "subheading");
  const abajo = ABAJO_PROPIO[seccion.id] ?? "pb-[var(--aire)]";
  const alinear = `${ALINEAR_CEL[texto(seccion.ajustes, "content_align_mobile")] ?? ""} ${ALINEAR_COMPU[texto(seccion.ajustes, "content_align_desktop")] ?? ""}`;
  const proporcion = (texto(seccion.ajustes, "image_ratio") || "2/3").replace("/", " / ");
  const columnas = Number(texto(seccion.ajustes, "columns_per_row")) || 4;
  const tamanoColumna = texto(seccion.ajustes, "column_heading_size") === "h4" ? "!text-[length:var(--h4)]" : "!text-[length:var(--h5)]";

  return (
    <section className={`medios-columnas ${esquema(seccion.ajustes, "scheme-2")}`} data-seccion="media-with-text-columns">
      <style>{`
        .medios-columnas .medios-fila { scrollbar-width: none; }
        .medios-columnas .medios-fila::-webkit-scrollbar { display: none; }
      `}</style>
      <div className={`contenedor flex flex-col gap-[var(--hueco)] ${sinAireArriba(seccion, producto) ? "pt-0" : "pt-[var(--aire)]"} ${abajo}`}>
        <div className={`flex flex-col ${alinear}`}>
          {subtitulo && (
            <span className="mb-3 inline-block font-titulo text-[19.2px] font-medium leading-6">{subtitulo}</span>
          )}
          <Titulo texto={texto(seccion.ajustes, "heading")} className="break-words" />
        </div>

        {texto(seccion.ajustes, "list_style") === "false" ? (
          <ul
            className={`m-0 grid list-none grid-cols-1 gap-[14.04px] p-0 md:grid-cols-2 md:gap-6 min-[1025px]:gap-[28.8px] ${
              COLUMNAS_COMPU[columnas] ?? COLUMNAS_COMPU[3]
            }`}
          >
            {seccion.bloques.map((b) => (
              <li key={b.id} className="flex min-w-0 flex-col">
                {b.tipo === "video" ? (
                  <Video bloque={b} proporcion={proporcion} />
                ) : (
                  <Foto src={texto(b.ajustes, "image")} proporcion={proporcion} columnas={columnas} />
                )}
                <div className="grid gap-3 break-words py-4 text-left min-[1025px]:py-6">
                  {texto(b.ajustes, "heading") && <h3 className={`m-0 ${tamanoColumna}`}>{texto(b.ajustes, "heading")}</h3>}
                  <TextoRico html={texto(b.ajustes, "description")} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
        <ul
          className="medios-fila -mx-[var(--margen)] flex snap-x snap-mandatory list-none gap-[3.6vw] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] md:gap-6 min-[1025px]:mx-0 min-[1025px]:grid min-[1025px]:grid-cols-4 min-[1025px]:gap-[2vw] min-[1025px]:overflow-visible min-[1025px]:px-0"
          aria-label="Videos de clientes"
        >
          {seccion.bloques.map((b) => (
            <li
              key={b.id}
              className="flex w-full shrink-0 snap-start flex-col md:w-[calc((100%-24px)/2)] min-[1025px]:w-auto"
            >
              <Video bloque={b} proporcion={proporcion} />
              <div className="grid gap-3 break-words py-4 text-left min-[1025px]:py-6">
                {texto(b.ajustes, "heading") && <h3 className="m-0 !text-[length:var(--h5)]">{texto(b.ajustes, "heading")}</h3>}
                <TextoRico html={texto(b.ajustes, "description")} />
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </section>
  );
}
