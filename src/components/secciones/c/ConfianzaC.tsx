// Sección «c-confianza»: «Compra con confianza». Renglones grandes con lo que el cliente reconoce: salimos en Shark Tank
// México, también vendemos en Mercado Libre y Amazon, 1 año de garantía y envío gratis. Piezas «reason»: foto o logo
// (opcional), título, texto y enlace (opcional).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { marcaEditar } from "@/lib/mapa";
import { textoVersion } from "../landing/datos";
import { formato } from "../landing/formato";
import { medidasImagen } from "../ImagenBanner";
import { claseFondoC, Etiqueta, PalomitaC, TITULO_C } from "./comun";

export function ConfianzaC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const razones = seccion.bloques.filter((b) => b.tipo === "reason");
  return (
    <section data-seccion="c-confianza" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version">
        <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
        <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        <ul className="m-0 mt-7 grid list-none gap-3 p-0 md:grid-cols-2">
          {razones.map((b) => {
            const logo = texto(b.ajustes, "image");
            const enlace = texto(b.ajustes, "link");
            const dentro = (
              <>
                {logo ? (
                  <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 ring-1 ring-[#dbe7f3]">
                    <Image src={logo} alt="" {...(() => { const m = medidasImagen(logo); return /\.svg$/i.test(logo) ? { width: 64, height: 64, unoptimized: true } : { width: m.ancho, height: m.alto }; })()} sizes="64px" className="h-auto max-h-full w-auto max-w-full object-contain" {...marcaEditar(seccion.id, b.id, "image")} />
                  </span>
                ) : (
                  <PalomitaC className="size-12" />
                )}
                <span>
                  <span className="block font-titulo text-[20px] leading-tight font-medium text-[#06182f]">{textoVersion(b.ajustes, "heading")}</span>
                  {texto(b.ajustes, "text") && <span className="mt-1 block text-[17px] leading-snug text-[#45566a]">{textoVersion(b.ajustes, "text")}</span>}
                </span>
              </>
            );
            return (
              <li key={b.id} data-pieza={b.id}>
                {enlace ? (
                  <a href={enlace} target="_blank" rel="noopener noreferrer" className="flex min-h-[92px] items-center gap-4 rounded-2xl border-2 border-[#dbe7f3] bg-white p-4 hover:border-[#1663a8]">
                    {dentro}
                  </a>
                ) : (
                  <div className="flex min-h-[92px] items-center gap-4 rounded-2xl border-2 border-[#dbe7f3] bg-white p-4">{dentro}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
