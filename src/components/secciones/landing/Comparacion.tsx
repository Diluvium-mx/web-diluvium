// Sección «landing-comparacion»: «Lo de siempre contra Diluvium». Dos columnas: el dolor (costales, trapear, miedo) y
// la solución, cada una con su foto real de la misma entrada. En celular van una debajo de la otra.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion } from "./datos";
import { IconoPalomita, IconoTache } from "./piezas";

const TAMANO = "(min-width: 1200px) 600px, (min-width: 768px) 46vw, calc(100vw - 32px)";

export function ComparacionVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const antes = seccion.bloques.filter((b) => b.tipo === "before").map((b) => textoVersion(b.ajustes, "text")).filter(Boolean);
  const despues = seccion.bloques.filter((b) => b.tipo === "after").map((b) => textoVersion(b.ajustes, "text")).filter(Boolean);

  return (
    <section data-seccion="landing-comparacion" aria-labelledby="titulo-comparacion" className="bg-niebla py-14 text-marino md:py-20">
      <div className="marco-version">
        <h2 id="titulo-comparacion" className="titulo-ancho m-0 mb-8 max-w-[40rem] text-[28px] md:mb-10 md:text-[38px]">
          {textoVersion(a, "heading")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          <div className="overflow-hidden rounded-2xl border border-linea bg-white">
            {texto(a, "image_before") && (
              <div className="relative aspect-[16/10] lg:aspect-[2/1]">
                <Image src={texto(a, "image_before")} alt={texto(a, "alt_before")} fill sizes={TAMANO} className="object-cover grayscale-[35%]" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="m-0 mb-4 font-titulo text-xl font-bold text-texto-suave md:text-2xl">{textoVersion(a, "heading_before")}</h3>
              <ul className="m-0 grid list-none gap-3 p-0">
                {antes.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[17px] text-tinta">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fde8e7] text-[#b42318]">
                      <IconoTache className="size-4" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="fondo-oscuro overflow-hidden rounded-2xl bg-marino text-white">
            {texto(a, "image_after") && (
              <div className="relative aspect-[16/10] lg:aspect-[2/1]">
                <Image src={texto(a, "image_after")} alt={texto(a, "alt_after")} fill sizes={TAMANO} className="object-cover" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h3 className="m-0 mb-4 font-titulo text-xl font-bold md:text-2xl">{textoVersion(a, "heading_after")}</h3>
              <ul className="m-0 grid list-none gap-3 p-0">
                {despues.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[17px] font-semibold">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-marino">
                      <IconoPalomita className="size-4" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
