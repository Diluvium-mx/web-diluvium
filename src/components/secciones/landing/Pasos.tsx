// Sección «landing-pasos»: «Protegida en 3 pasos, sin albañiles». Cada paso con su número, dibujo, título y texto;
// abajo, el botón que abre la tabla de medidas (cuenta como «abre_tabla»).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion } from "./datos";
import { TablaMedidas } from "./TablaMedidas";

export function PasosVersion({ seccion }: PropsSeccion) {
  const pasos = seccion.bloques.filter((b) => b.tipo === "step");
  const boton = texto(seccion.ajustes, "button_text");
  return (
    <section data-seccion="landing-pasos" id="como-funciona" aria-labelledby="titulo-pasos" className="bg-niebla py-14 text-marino md:py-20">
      <div className="marco-version">
        <h2 id="titulo-pasos" className="titulo-ancho m-0 mb-8 max-w-[40rem] text-[28px] md:mb-10 md:text-[38px]">
          {textoVersion(seccion.ajustes, "heading")}
        </h2>
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3 lg:gap-6">
          {pasos.map((p, i) => (
            <li key={p.id} className="flex gap-4 rounded-2xl bg-white p-4 md:flex-col md:p-6">
              {texto(p.ajustes, "image") && (
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-white md:aspect-[4/3] md:w-full">
                  <Image
                    src={texto(p.ajustes, "image")}
                    alt={texto(p.ajustes, "alt")}
                    fill
                    sizes="(min-width: 1200px) 365px, (min-width: 768px) 30vw, 96px"
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <span className="titulo-ancho mb-1 block text-[15px] text-marino-2" aria-hidden="true">
                  Paso {i + 1}
                </span>
                <h3 className="m-0 mb-1.5 font-titulo text-[19px] leading-tight font-bold md:text-[21px]">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {textoVersion(p.ajustes, "heading")}
                </h3>
                <p className="m-0 text-[16px] leading-[1.5] text-texto-suave">{textoVersion(p.ajustes, "text")}</p>
              </div>
            </li>
          ))}
        </ol>
        {boton && (
          <div className="mt-6 flex justify-center md:mt-8">
            <TablaMedidas
              texto={boton}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-marino bg-white px-6 font-titulo font-bold text-marino transition-colors hover:bg-marino hover:text-white"
            />
          </div>
        )}
      </div>
    </section>
  );
}
