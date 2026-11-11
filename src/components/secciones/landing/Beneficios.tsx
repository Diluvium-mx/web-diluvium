// Sección «landing-beneficios»: cada beneficio con su foto real; el título junta la característica con lo que gana
// el cliente. 1 columna en celular, 2 en tableta y 3 en computadora.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion } from "./datos";

export function BeneficiosVersion({ seccion }: PropsSeccion) {
  const items = seccion.bloques.filter((b) => b.tipo === "benefit");
  return (
    <section data-seccion="landing-beneficios" aria-labelledby="titulo-beneficios" className="bg-white py-14 text-marino md:py-20">
      <div className="marco-version">
        <h2 id="titulo-beneficios" className="titulo-ancho m-0 mb-8 max-w-[40rem] text-[28px] md:mb-10 md:text-[38px]">
          {textoVersion(seccion.ajustes, "heading")}
        </h2>
        <ul className="m-0 grid list-none gap-x-6 gap-y-10 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
          {items.map((b) => (
            <li key={b.id}>
              {texto(b.ajustes, "image") && (
                <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-niebla">
                  <Image
                    src={texto(b.ajustes, "image")}
                    alt={texto(b.ajustes, "alt")}
                    fill
                    sizes="(min-width: 1200px) 397px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 32px)"
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="m-0 mb-2 font-titulo text-[21px] leading-tight font-bold md:text-[22px]">{textoVersion(b.ajustes, "heading")}</h3>
              <p className="m-0 text-[16.5px] leading-[1.55] text-texto-suave">{textoVersion(b.ajustes, "text")}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
