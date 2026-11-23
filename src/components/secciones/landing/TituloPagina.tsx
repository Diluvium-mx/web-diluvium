// Sección «landing-titulo»: el arranque de las páginas nuevas de B1 (Contacto, Nosotros, Blog, Productos; 23-nov-2026,
// dueño: «vamos desarrollando las demás páginas»). Una línea chica arriba, el título de la página, un texto y, si trae,
// una foto (en el celular va debajo del texto; en computadora, a la derecha) y un botón.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { CLASE_BOTON, IconoFlecha, esWhatsapp } from "./piezas";

export function TituloVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const foto = texto(a, "image");
  const boton = textoVersion(a, "button_text");
  const enlace = texto(a, "button_link");
  const fondo = fondoPropio(a, "blanco");
  return (
    <section data-seccion="landing-titulo" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(fondo)} py-10 md:py-16`}>
      <div className={`marco-version ${foto ? "grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12" : ""}`}>
        <div className={foto ? "" : "max-w-[46rem]"}>
          {texto(a, "subheading") && (
            <p className="m-0 mb-3 text-[14px] font-semibold tracking-[0.08em] text-boton uppercase">{formato(textoVersion(a, "subheading"))}</p>
          )}
          <h1 id={`titulo-${seccion.id}`} className="titulo-version m-0 text-[34px] md:text-[50px]">
            {formato(textoVersion(a, "heading"))}
          </h1>
          {texto(a, "text") && (
            <p className="m-0 mt-4 max-w-[38rem] text-[17.5px] leading-[1.6] text-tinta md:mt-5 md:text-[19px]">{formato(textoVersion(a, "text"))}</p>
          )}
          {boton && enlace && (
            <a
              href={enlace}
              {...(esWhatsapp(enlace) ? { target: "_blank", rel: "noopener noreferrer", "data-evento": "toca_whatsapp" } : {})}
              className={`${CLASE_BOTON} mt-7 w-full sm:w-auto`}
            >
              {boton}
              <IconoFlecha />
            </a>
          )}
        </div>
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-niebla shadow-[0_24px_60px_-30px_rgba(12,30,51,0.55)]">
            <Image
              src={foto}
              alt={texto(a, "alt")}
              fill
              priority
              sizes="(min-width: 1200px) 600px, (min-width: 768px) 46vw, calc(100vw - 32px)"
              style={estiloFoto(a)}
              {...marcaEditar(seccion.id, "", "image")}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
