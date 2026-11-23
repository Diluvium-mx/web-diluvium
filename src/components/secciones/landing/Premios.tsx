// Sección «landing-premios»: reconocimientos y premios (página Nosotros de B1). Cada pieza «award» lleva su foto, título
// y de quién es. 1 columna en celular, 2 en tableta y 3 en computadora (como los beneficios).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";

export function PremiosVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "niebla");
  const premios = seccion.bloques.filter((b) => b.tipo === "award");
  return (
    <section data-seccion="landing-premios" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version">
        {texto(a, "subheading") && (
          <p className="m-0 mb-3 text-[14px] font-semibold tracking-[0.08em] text-boton uppercase">{formato(textoVersion(a, "subheading"))}</p>
        )}
        <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 max-w-[40rem] text-[28px] md:text-[38px]">
          {formato(textoVersion(a, "heading"))}
        </h2>
        {texto(a, "text") && <p className="m-0 mt-3 max-w-[40rem] text-[17px] leading-[1.55] text-tinta">{formato(textoVersion(a, "text"))}</p>}
        <ul className="m-0 mt-8 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
          {premios.map((b) => {
            const ba = b.ajustes;
            return (
              <li key={b.id} data-pieza={b.id} className="overflow-hidden rounded-2xl bg-white text-marino ring-1 ring-linea">
                {texto(ba, "image") && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-niebla">
                    <Image
                      src={texto(ba, "image")}
                      alt={texto(ba, "alt")}
                      fill
                      sizes="(min-width: 1200px) 397px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, calc(100vw - 32px)"
                      style={estiloFoto(ba)}
                      {...marcaEditar(seccion.id, b.id, "image")}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="m-0 font-titulo text-[19px] leading-tight font-medium">{formato(textoVersion(ba, "heading"))}</h3>
                  {texto(ba, "text") && <p className="m-0 mt-1.5 text-[15.5px] leading-[1.5] text-texto-suave">{formato(textoVersion(ba, "text"))}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
