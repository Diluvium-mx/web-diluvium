// Página no encontrada (sección «main-404»): subtítulo, título y texto centrados, buscador del sitio y dos botones.
// La plantilla no trae textos propios, así que en vivo salen los del tema tal cual (en inglés); aquí, iguales.

import Link from "next/link";
import type { PropsSeccion } from "./registro";
import type { Seccion } from "@/lib/contenido";
import { plantilla, siNo } from "@/lib/contenido";
import { IconoBuscar } from "@/components/comunes/Iconos";
import { BOTON_GRANDE, BOTON_ICONO } from "@/components/producto/estilos";

// Textos por omisión del tema (los mismos que muestra la tienda en vivo).
const TEXTOS = {
  subtitulo: "404 — Page not found",
  titulo: "We're sorry, this page is not available!",
  descripcion: "The page URL might be outdated or contains typo errors. Please contact us at Shine or select options below.",
  inicio: "Back to home page",
  catalogo: "Explore our catalogue",
};

/** En vivo la sección pega con la franja de arriba (mismo fondo blanco): sin aire arriba. */
function pegadaArriba(seccion: Seccion): boolean {
  if (siNo(seccion.ajustes, "remove_padding_top")) return true;
  const lista = plantilla("404").secciones;
  const i = lista.indexOf(seccion);
  return i > 0;
}

export function NoEncontrada({ seccion }: PropsSeccion) {
  const tipos = new Set(seccion.bloques.map((b) => b.tipo));
  const arriba = pegadaArriba(seccion) ? "pt-0" : "pt-[var(--aire)]";
  return (
    <section className="esquema-1" data-seccion="main-404" aria-labelledby="titulo-404">
      <div className={`contenedor pb-[var(--aire)] ${arriba}`}>
        <div className="mx-auto flex max-w-[650px] flex-col items-center text-center break-words">
          {tipos.has("subheading") && (
            <div className="mb-3 font-titulo text-[19.2px] leading-6 font-medium">{TEXTOS.subtitulo}</div>
          )}
          {tipos.has("heading") && (
            <h2 id="titulo-404" className="mb-[13.5px]! md:mb-[14.4px]! min-[1025px]:mb-[28.8px]!">
              {TEXTOS.titulo}
            </h2>
          )}
          {tipos.has("description") && <p className="m-0 mb-6 min-[1025px]:mb-12">{TEXTOS.descripcion}</p>}
          {tipos.has("search") && (
            <form action="/search" role="search" className="relative mb-6 w-full">
              <label htmlFor="buscar-404" className="sr-only">
                Buscar
              </label>
              <input
                id="buscar-404"
                type="text"
                name="q"
                placeholder="Buscar en el sitio"
                className="block h-10 w-full rounded-[64px] border border-[rgba(10,85,154,0.12)] bg-white py-2 pr-11 pl-5 text-base text-azul placeholder:text-[rgba(10,85,154,0.4)] focus:outline-2 focus:outline-azul min-[1025px]:h-11"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center min-[1025px]:h-11 min-[1025px]:w-11"
              >
                <IconoBuscar className="h-5 w-5 min-[1025px]:h-6 min-[1025px]:w-6" />
              </button>
            </form>
          )}
          {tipos.has("button") && (
            <div className="flex w-full flex-col gap-3 md:flex-row">
              <Link href="/" className={`${BOTON_ICONO} ${BOTON_GRANDE} relative flex-1 font-titulo font-medium leading-6`}>
                {TEXTOS.inicio}
              </Link>
              <Link
                href="/collections/all"
                className={`${BOTON_ICONO} ${BOTON_GRANDE} relative flex-1 font-titulo font-medium leading-6`}
              >
                {TEXTOS.catalogo}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
