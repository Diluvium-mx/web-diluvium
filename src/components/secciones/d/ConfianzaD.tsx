// Sección «d-confianza»: confianza como en Andafacil. Arriba, Shark Tank México: la foto en el set, el título, el texto
// y el enlace al video en YouTube. Luego «Dónde más nos encuentras»: Mercado Libre y Amazon con su logo y su enlace
// (piezas «marketplace»). Al final, la garantía en un recuadro con su ícono.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { medidasImagen } from "../ImagenBanner";
import { claseFondoD, EtiquetaD, IconoD, TARJETA_D, TituloD } from "./comun";

function medidas(src: string) {
  if (/\.svg$/i.test(src)) return { width: 64, height: 64, unoptimized: true };
  const m = medidasImagen(src);
  return { width: m.ancho, height: m.alto };
}

export function ConfianzaD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const tiendas = seccion.bloques.filter((b) => b.tipo === "marketplace" && texto(b.ajustes, "name"));
  const fotoShark = texto(a, "image_shark");
  const enlaceShark = texto(a, "shark_link");
  return (
    <section data-seccion="d-confianza" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "blanco")} py-12 md:py-20`}>
      <div className="marco-version">
        <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading"))}</TituloD>
        {texto(a, "text") && <p className="m-0 mt-4 max-w-[44rem] text-[18px] leading-[1.6]">{formato(textoVersion(a, "text"))}</p>}

        {texto(a, "shark_heading") && (
          <div className={`${TARJETA_D} mt-8 grid overflow-hidden md:grid-cols-2`}>
            {fotoShark && (
              <div className="relative aspect-[4/3] bg-[#0b2545] md:aspect-auto md:min-h-[320px]">
                <Image src={fotoShark} alt={texto(a, "alt_shark")} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" style={estiloFoto(a, "image_shark")} {...marcaEditar(seccion.id, "", "image_shark")} />
              </div>
            )}
            <div className="flex flex-col justify-center p-6 md:p-10">
              {texto(a, "shark_logo") && (
                <span className="mb-4 block w-[120px]">
                  <Image src={texto(a, "shark_logo")} alt="Shark Tank México" {...medidas(texto(a, "shark_logo"))} sizes="120px" className="h-auto w-full" {...marcaEditar(seccion.id, "", "shark_logo")} />
                </span>
              )}
              <p className="m-0 font-titulo text-[26px] leading-tight font-semibold text-[#0b2545] md:text-[30px]">{formato(textoVersion(a, "shark_heading"))}</p>
              {texto(a, "shark_text") && <p className="m-0 mt-3 text-[18px] leading-[1.6]">{formato(textoVersion(a, "shark_text"))}</p>}
              {enlaceShark && (
                <a href={enlaceShark} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center gap-2.5 self-start rounded-xl bg-[#0b2545] px-5 text-[17px] font-semibold text-white hover:bg-[#13345e]">
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {tx(a, "shark_link_text", "Ver el video en YouTube")}
                </a>
              )}
            </div>
          </div>
        )}

        {tiendas.length > 0 && (
          <>
            <p className="m-0 mt-10 font-titulo text-[22px] font-semibold text-[#0b2545]">{tx(a, "stores_heading", "Dónde más nos encuentras")}</p>
            <ul className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
              {tiendas.map((b) => {
                const logo = texto(b.ajustes, "image");
                const enlace = texto(b.ajustes, "link");
                const dentro = (
                  <>
                    {logo && (
                      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 ring-1 ring-[#dde2e8]">
                        <Image src={logo} alt="" {...medidas(logo)} sizes="64px" className="h-auto max-h-full w-auto max-w-full object-contain" {...marcaEditar(seccion.id, b.id, "image")} />
                      </span>
                    )}
                    <span className="flex-1">
                      <span className="block font-titulo text-[20px] leading-tight font-semibold text-[#0b2545]">{textoVersion(b.ajustes, "name")}</span>
                      {texto(b.ajustes, "text") && <span className="mt-1 block text-[17px] leading-snug text-[#4a5568]">{textoVersion(b.ajustes, "text")}</span>}
                    </span>
                    {enlace && (
                      <span aria-hidden="true" className="text-[26px] text-[#9a6700]">
                        ›
                      </span>
                    )}
                  </>
                );
                const clase = `${TARJETA_D} flex min-h-[96px] items-center gap-4 p-4`;
                return (
                  <li key={b.id} data-pieza={b.id}>
                    {enlace ? (
                      <a href={enlace} target="_blank" rel="noopener noreferrer" className={`${clase} hover:border-[#0b2545]`}>
                        {dentro}
                      </a>
                    ) : (
                      <div className={clase}>{dentro}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {texto(a, "guarantee_heading") && (
          <div className="mt-6 flex items-start gap-4 rounded-xl bg-[#0b2545] p-5 text-white md:p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#ffc83d] text-[#0b2545]">
              <IconoD nombre="garantia" className="size-7" />
            </span>
            <div>
              <p className="m-0 font-titulo text-[22px] font-semibold">{formato(textoVersion(a, "guarantee_heading"))}</p>
              {texto(a, "guarantee_text") && <p className="m-0 mt-1 text-[18px] leading-[1.55] text-white/90">{formato(textoVersion(a, "guarantee_text"))}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
