// Sección «c-historias»: «Así funciona, paso a paso». Desde el 25-nov-2026 (40-60 años) ya no son historias que pasan
// solas: los 4 pasos van uno abajo de otro, cada uno con su foto, un número grande, el título y el texto, para leerlos
// con calma. En computadora, de dos en dos. Piezas «slide»: foto, título y texto.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, Etiqueta, TITULO_C } from "./comun";

export function HistoriasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "blanco";
  const pasos = seccion.bloques.filter((b) => b.tipo === "slide");
  return (
    <section data-seccion="c-historias" id="como-funciona" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version">
        <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
        <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        {texto(a, "text") && <p className="m-0 mt-3 max-w-[40rem] text-[18px] leading-[1.6]">{formato(textoVersion(a, "text"))}</p>}
        <ol className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2 lg:gap-8">
          {pasos.map((b, i) => (
            <li key={b.id} data-pieza={b.id} className="overflow-hidden rounded-3xl border-2 border-[#dbe7f3] bg-white">
              {texto(b.ajustes, "image") && (
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f8fd]">
                  <Image src={texto(b.ajustes, "image")} alt={texto(b.ajustes, "alt")} fill sizes="(min-width: 768px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(b.ajustes)} {...marcaEditar(seccion.id, b.id, "image")} />
                </div>
              )}
              <div className="flex gap-4 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#06182f] font-titulo text-[24px] font-semibold text-white" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="m-0 font-titulo text-[23px] leading-tight font-medium text-[#06182f]">
                    <span className="sr-only">Paso {i + 1}: </span>
                    {formato(textoVersion(b.ajustes, "heading"))}
                  </h3>
                  <p className="m-0 mt-2 text-[18px] leading-[1.55]">{formato(textoVersion(b.ajustes, "text"))}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
