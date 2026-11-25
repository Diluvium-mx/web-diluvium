// Sección «c-pie»: pie compacto de C, todo centrado sobre el azul de noche: logo, una frase, los enlaces en un solo
// renglón que se acomoda, el WhatsApp, el teléfono y el correo como botones redondos, y las redes.

import Image from "next/image";
import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { marcaEditar } from "@/lib/mapa";
import { IconoFacebook, IconoInstagram, IconoLinkedin, IconoYoutube } from "@/components/comunes/Iconos";
import { textoVersion } from "../landing/datos";
import { formato } from "../landing/formato";

const REDES: Record<string, { nombre: string; Icono: typeof IconoFacebook }> = {
  facebook: { nombre: "Facebook", Icono: IconoFacebook },
  youtube: { nombre: "YouTube", Icono: IconoYoutube },
  instagram: { nombre: "Instagram", Icono: IconoInstagram },
  linkedin: { nombre: "LinkedIn", Icono: IconoLinkedin },
};

export function PieC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const enlaces = [...menus.principal.enlaces, ...menus.pie.enlaces.filter((e) => e.url !== "/search")];
  const contacto = seccion.bloques.filter((b) => b.tipo === "contact" && texto(b.ajustes, "link"));
  return (
    <footer data-seccion="c-pie" className="bg-[#041122] pt-12 pb-8 text-center text-white">
      <div className="marco-version">
        {texto(a, "logo") && (
          <span className="mx-auto block w-[150px] overflow-hidden">
            <Image src={texto(a, "logo")} alt="Diluvium" width={742} height={181} sizes="150px" className="h-auto w-full" {...marcaEditar(seccion.id, "", "logo")} />
          </span>
        )}
        {texto(a, "text") && <p className="m-0 mx-auto mt-3 max-w-[30rem] text-[15px] leading-[1.6] text-white/70">{formato(textoVersion(a, "text"))}</p>}
        {contacto.length > 0 && (
          <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-2 p-0">
            {contacto.map((b) => (
              <li key={b.id} data-pieza={b.id}>
                <a href={texto(b.ajustes, "link")} target={texto(b.ajustes, "link").startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-white/10 px-4 text-[14.5px] font-semibold hover:bg-white/20">
                  {textoVersion(b.ajustes, "text")}
                </a>
              </li>
            ))}
          </ul>
        )}
        <nav aria-label="Pie de página" className="mt-8">
          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-5 gap-y-2 p-0 text-[14.5px] text-white/75">
            {enlaces.map((e) => (
              <li key={e.url}>
                <a href={e.url} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="m-0 mt-4 flex list-none justify-center gap-1 p-0">
          {menus.redes.map((r) => {
            const red = REDES[r.red];
            if (!red) return null;
            return (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${red.nombre} (se abre en otra pestaña)`} className="flex size-11 items-center justify-center rounded-full hover:bg-white/10">
                  <red.Icono className="size-5" />
                </a>
              </li>
            );
          })}
        </ul>
        <p className="m-0 mt-6 border-t border-white/10 pt-6 text-[13px] text-white/50">© {new Date().getFullYear()} Diluvium</p>
      </div>
    </footer>
  );
}
