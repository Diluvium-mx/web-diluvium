// «c-titulo» y «d-titulo»: el arranque de las páginas secundarias de C y D (Productos, Contacto, Nosotros, Blog).
// C: banda azul muy clara con la etiqueta azul, el título grande, el texto y, si trae, la foto y un botón.
// D: blanco, migas de pan («Inicio › Contacto»), la raya amarilla, el título y lo mismo.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { esWhatsapp } from "../landing/piezas";
import { Arriba, Raya, claseFondo, ESTILOS, Flecha, type Estilo } from "./estilo";

export function TituloCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const foto = texto(a, "image");
  const boton = textoVersion(a, "button_text");
  const enlace = texto(a, "button_link");
  const titulo = textoVersion(a, "heading");
  return (
    <section data-seccion={seccion.tipo} aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(estilo, texto(a, "fondo"))} pt-8 pb-10 md:pt-12 md:pb-16`}>
      <div className={`marco-version ${foto ? "grid items-center gap-7 md:grid-cols-2 md:gap-12" : ""}`}>
        <div className={foto ? "" : "max-w-[46rem]"}>
          {estilo === "d" && (
            <nav aria-label={tx(a, "breadcrumb_label", "Estás en")} className="mb-5">
              <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[16px] text-[#4a5a6c]">
                <li>
                  {/* Enlace normal y no <Link>: EnlacesVersion lo deja dentro de la versión. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a href="/" className="font-semibold text-[#0b2545] underline underline-offset-4">
                    {tx(a, "home_text", "Inicio")}
                  </a>
                </li>
                <li aria-hidden="true">
                  <Flecha className="size-4" />
                </li>
                <li aria-current="page">{tx(a, "breadcrumb_text", titulo.replace(/<[^>]+>/g, ""))}</li>
              </ol>
            </nav>
          )}
          <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
          <h1 id={`titulo-${seccion.id}`} className={e.h1}>
            {formato(titulo)}
          </h1>
          <Raya estilo={estilo} />
          {texto(a, "text") && <p className={`m-0 mt-4 max-w-[40rem] ${e.texto}`}>{formato(textoVersion(a, "text"))}</p>}
          {boton && enlace && (
            <a
              href={esWhatsapp(enlace) && texto(a, "whatsapp_message") ? conMensaje(enlace, textoVersion(a, "whatsapp_message")) : enlace}
              {...(esWhatsapp(enlace) ? { target: "_blank", rel: "noopener noreferrer", "data-evento": "toca_whatsapp" } : {})}
              className={`${esWhatsapp(enlace) ? e.whatsapp : e.boton} mt-6`}
            >
              {boton}
            </a>
          )}
        </div>
        {foto && (
          <div className={`relative aspect-[4/3] overflow-hidden ${e.foto} bg-[#f3f8fd] ${estilo === "d" ? "border border-[#d9e2ec]" : "shadow-[0_20px_50px_-28px_rgba(6,24,47,0.55)]"}`}>
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
