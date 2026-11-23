// Sección «landing-cita»: un mensaje grande con firma (cierre de la página Nosotros de B1: «Porque al final, no se trata
// solo de vender un producto…», «Con cariño, Equipo Diluvium»). Puede llevar un texto antes, una foto chica y un botón.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { textoVersion } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { CLASE_BOTON, IconoFlecha } from "./piezas";

export function CitaVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "blanco");
  const foto = texto(a, "image");
  const boton = textoVersion(a, "button_text");
  return (
    <section data-seccion="landing-cita" aria-label="Mensaje del equipo" className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version grid max-w-[60rem] gap-6 md:text-center">
        {foto && (
          <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-2xl bg-niebla">
            <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 960px, calc(100vw - 32px)" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} className="object-cover" />
          </div>
        )}
        {texto(a, "text") && <p className="m-0 text-[18px] leading-[1.6] text-tinta md:text-[20px]">{formato(textoVersion(a, "text"))}</p>}
        <blockquote className="m-0">
          <p className="titulo-version m-0 text-[28px] md:text-[40px]">{formato(textoVersion(a, "heading"))}</p>
          {texto(a, "signature") && (
            <footer className="mt-5 text-[17px] leading-[1.5] font-semibold text-texto-suave">{formato(textoVersion(a, "signature"))}</footer>
          )}
        </blockquote>
        {boton && (
          <a href={texto(a, "button_link") || "/"} className={`${CLASE_BOTON} mt-2 w-full sm:w-auto md:mx-auto`}>
            {boton}
            <IconoFlecha />
          </a>
        )}
      </div>
    </section>
  );
}
