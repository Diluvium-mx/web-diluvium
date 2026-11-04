// Bloque de texto (sección «text»): subtítulo, títulos, textos con formato y botones, uno debajo del otro, en el
// orden de sus bloques. Centrado o a la izquierda según «content_position_mobile» (celular y tableta) y
// «content_position_desktop» (desde 1025 px). Medido en Nosotros, Instalación y Distribuidor.

import Link from "next/link";
import type { Bloque } from "@/lib/contenido";
import { esquema, texto } from "@/lib/contenido";
import type { PropsSeccion } from "./registro";
import { clasesAire } from "./aire";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "@/components/producto/estilos";

// Tamaños de título: «headline» es un paso más grande que h1 (×1.125 en celular, ×1.2 desde tableta).
const TAMANOS: Record<string, string> = {
  headline: "text-[calc(var(--h1)*1.125)]! md:text-[calc(var(--h1)*1.2)]!",
  h1: "text-[length:var(--h1)]!",
  h2: "text-[length:var(--h2)]!",
  h3: "text-[length:var(--h3)]!",
  h4: "text-[length:var(--h4)]!",
  h5: "text-[length:var(--h5)]!",
  h6: "text-[length:var(--h6)]!",
};

// Aire de abajo de cada bloque (el último bloque visible o no, sin aire, como en vivo).
const AIRE_TEXTO = "mb-6 min-[1025px]:mb-12 last:mb-0";

// Formato del texto («!» porque globals.css fija los párrafos de .texto-rico fuera de capas): párrafos con 32 px entre ellos y títulos con 32 px arriba y 16 abajo (como el texto de páginas).
const FORMATO =
  "max-w-[650px] [&_p]:mb-8! [&_p+p]:mt-0! [&_p:last-child]:mb-0! [&_:is(h1,h2,h3,h4,h5,h6)]:mt-8 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-4 " +
  "[&_ul]:mb-8 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:pl-4";

/** Botón «btn-outline» del tema: con filo del color del texto y relleno al pasar el mouse. */
const BOTON_CONTORNO =
  "relative isolate inline-flex items-center justify-center overflow-hidden border border-[var(--texto)] font-titulo " +
  "font-medium leading-6 text-[var(--texto)] transition-colors duration-[400ms] after:absolute after:inset-x-0 " +
  "after:top-0 after:bottom-full after:-z-10 after:bg-[var(--texto)] after:transition-[bottom] after:duration-[400ms] " +
  "after:ease-[cubic-bezier(0.7,0,0.3,1)] hover:text-[var(--fondo)] hover:after:bottom-0";

/** «center-xs middle-xs ta-center» → ¿centrado? */
function centrado(valor: string): boolean {
  return /\bta-center/.test(valor);
}

function Pieza({ bloque }: { bloque: Bloque }) {
  const a = bloque.ajustes;
  if (bloque.tipo === "subheading") {
    const t = texto(a, "subheading");
    if (!t) return <div className="hidden" />;
    return <div className="mb-3 font-titulo text-[19.2px] leading-6 font-medium last:mb-0">{t}</div>;
  }
  if (bloque.tipo === "heading") {
    const t = texto(a, "heading");
    if (!t) return <div className="hidden" />;
    // El aire de abajo va en el título mismo: se queda aunque sea el último bloque.
    return (
      <div className="max-w-[1280px] last:mb-0">
        <Titulo
          texto={t}
          className={`mb-[13.5px]! break-words md:mb-[14.4px]! min-[1025px]:mb-[28.8px]! ${TAMANOS[texto(a, "heading_size")] ?? TAMANOS.h2}`}
        />
      </div>
    );
  }
  if (bloque.tipo === "description") {
    const html = texto(a, "description");
    if (!html) return <div className="hidden" />;
    return (
      <div className={`flow-root ${AIRE_TEXTO}`}>
        <TextoRico html={html} className={FORMATO} />
      </div>
    );
  }
  if (bloque.tipo === "button") {
    const botones = [
      { t: texto(a, "button_main_text"), e: texto(a, "button_main_link"), s: texto(a, "button_main_style") },
      { t: texto(a, "button_sub_text"), e: texto(a, "button_sub_link"), s: texto(a, "button_sub_style") },
    ].filter((x) => x.t);
    if (botones.length === 0) return <div className="hidden" />;
    return (
      <div className={`flex flex-wrap gap-3 ${AIRE_TEXTO}`}>
        {botones.map((x) => (
          <Link
            key={x.t}
            href={x.e || "#"}
            className={`${x.s === "btn-outline" ? BOTON_CONTORNO : BOTON_PRIMARIO} ${BOTON_GRANDE}`}
          >
            {x.t}
          </Link>
        ))}
      </div>
    );
  }
  return null;
}

export function Texto({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const cel = centrado(texto(a, "content_position_mobile") || "center-xs middle-xs ta-center");
  const compu = centrado(texto(a, "content_position_desktop") || "center-md middle-md ta-center-md");
  const alineacion = `${cel ? "items-center text-center" : "items-start text-left"} ${
    compu ? "min-[1025px]:items-center min-[1025px]:text-center" : "min-[1025px]:items-start min-[1025px]:text-left"
  }`;
  return (
    <section className={esquema(a)} data-seccion="text">
      <div className={`contenedor ${clasesAire(seccion, producto)}`}>
        <div className={`flex flex-col ${alineacion}`}>
          {seccion.bloques.map((b) => (
            <Pieza key={b.id} bloque={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
