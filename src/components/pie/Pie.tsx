// Pie de página (sección «footer»): datos de la tienda, menú, boletín, redes y enlaces legales.

import Image from "next/image";
import Link from "next/link";
import menus from "@contenido/menus.json";
import type { Seccion } from "@/lib/contenido";
import { bloquesDe, esquema, texto } from "@/lib/contenido";
import { IconoFacebook, IconoInstagram, IconoLinkedin, IconoYoutube } from "@/components/comunes/Iconos";
import { TextoRico } from "@/components/comunes/Texto";
import { BotonArriba } from "./BotonArriba";
import { FormularioBoletin } from "./FormularioBoletin";

const ICONOS = { facebook: IconoFacebook, youtube: IconoYoutube, instagram: IconoInstagram, linkedin: IconoLinkedin };
const NOMBRES = { facebook: "Facebook", youtube: "Youtube", instagram: "Instagram", linkedin: "LinkedIn" };

export function Pie({ seccion }: { seccion: Seccion }) {
  const tienda = bloquesDe(seccion, "store_information")[0];
  const boletin = bloquesDe(seccion, "newsletter")[0];
  const logo = tienda ? texto(tienda.ajustes, "footer_image") : "";

  return (
    <footer className={`${esquema(seccion.ajustes, "scheme-3")} pb-[81px] pt-[var(--aire)] md:pb-20`} data-seccion="footer">
      <div className="contenedor">
        <BotonArriba />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-6 xl:grid-cols-4 xl:gap-x-[28.8px]">
          <div className="flex flex-col md:col-span-2 xl:col-span-1">
            {logo && <Image src={logo} alt="Diluvium" width={200} height={49} className="h-auto w-[140px] xl:w-[200px]" />}
            {tienda && (
              <TextoRico
                html={texto(tienda.ajustes, "description")}
                className="pie-direccion mt-[68px] text-white"
              />
            )}
            <ul className="mt-10 flex gap-2">
              {menus.redes.map((r) => {
                const Icono = ICONOS[r.red as keyof typeof ICONOS];
                return (
                  <li key={r.red}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={NOMBRES[r.red as keyof typeof NOMBRES]}
                      className="flex h-9 w-9 items-center justify-center xl:h-10 xl:w-10"
                    >
                      <Icono className="h-4 w-4 xl:h-5 xl:w-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="m-0 py-2 font-titulo text-[19.2px] font-medium leading-6">{menus.principal.titulo}</p>
            <ul>
              {menus.principal.enlaces.map((e, i) => (
                <li key={e.url}>
                  <Link href={e.url} className={`inline-block pb-2 pt-4 ${i === 0 ? "text-naranja" : ""}`}>
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {boletin && (
            <div className="self-start rounded-3xl border border-white/30 px-4 pb-4 pt-2 md:col-span-2 xl:px-6 xl:pb-6">
              <p className="m-0 py-2 font-titulo text-[19.2px] font-medium leading-6">{texto(boletin.ajustes, "newsletter_heading")}</p>
              <FormularioBoletin boton={texto(boletin.ajustes, "submit_button")} />
            </div>
          )}

          {menus.pie.enlaces.map((e) => (
            <Link key={e.url} href={e.url} className="block py-2 font-titulo text-[19.2px] font-medium leading-6 md:py-3 xl:py-2">
              {e.texto}
            </Link>
          ))}
        </div>

        <p className="mt-16 pt-8 text-center text-[13.6px] leading-[17px] text-white/60 xl:py-3 xl:text-right">
          <small className="text-[13.6px]">
            © <Link href="/">Diluvium</Link>
          </small>
        </p>
      </div>
    </footer>
  );
}
