// Sección «d-pie»: pie de D en columnas (en el celular, una abajo de otra): el logo con una frase y los datos de
// contacto (piezas «contact»: texto y enlace), los productos y las páginas (piezas «link»: texto, dirección y grupo,
// «productos» o «ayuda»), las redes y las políticas de la tienda. Deja espacio abajo para el botón de WhatsApp.

import Image from "next/image";
import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { marcaEditar } from "@/lib/mapa";
import { IconoFacebook, IconoInstagram, IconoLinkedin, IconoYoutube } from "@/components/comunes/Iconos";
import { textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";

const REDES: Record<string, { nombre: string; Icono: typeof IconoFacebook }> = {
  facebook: { nombre: "Facebook", Icono: IconoFacebook },
  youtube: { nombre: "YouTube", Icono: IconoYoutube },
  instagram: { nombre: "Instagram", Icono: IconoInstagram },
  linkedin: { nombre: "LinkedIn", Icono: IconoLinkedin },
};

export function PieD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const contacto = seccion.bloques.filter((b) => b.tipo === "contact" && texto(b.ajustes, "text"));
  const enlaces = seccion.bloques.filter((b) => b.tipo === "link" && texto(b.ajustes, "text") && texto(b.ajustes, "url"));
  const grupos = [
    { titulo: tx(a, "products_heading", "Productos"), lista: enlaces.filter((b) => texto(b.ajustes, "group") === "productos") },
    { titulo: tx(a, "pages_heading", "Diluvium"), lista: enlaces.filter((b) => texto(b.ajustes, "group") !== "productos") },
  ].filter((g) => g.lista.length);
  const politicas = menus.pie.enlaces.filter((e) => e.url !== "/search");
  const columna = "m-0 font-titulo text-[15px] font-bold tracking-[0.06em] text-[#ffc83d] uppercase";
  return (
    <footer data-seccion="d-pie" className="border-t-4 border-[#ffc83d] bg-[#071a33] pt-12 pb-28 text-white lg:pb-12">
      <div className="marco-version grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          {texto(a, "logo") && (
            <span className="block w-[160px]">
              <Image src={texto(a, "logo")} alt="Diluvium" width={742} height={181} sizes="160px" className="h-auto w-full" {...marcaEditar(seccion.id, "", "logo")} />
            </span>
          )}
          {texto(a, "text") && <p className="m-0 mt-4 max-w-[26rem] text-[17px] leading-[1.6] text-white/90">{formato(textoVersion(a, "text"))}</p>}
          {contacto.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-1 p-0">
              {contacto.map((b) => {
                const enlace = texto(b.ajustes, "link");
                return (
                  <li key={b.id} data-pieza={b.id}>
                    {enlace ? (
                      <a href={enlace} target={enlace.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[17px] font-semibold underline-offset-4 hover:underline">
                        {textoVersion(b.ajustes, "text")}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center text-[17px] text-white/90">{textoVersion(b.ajustes, "text")}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {grupos.map((g) => (
          <nav key={g.titulo} aria-label={g.titulo}>
            <p className={columna}>{g.titulo}</p>
            <ul className="m-0 mt-2 grid list-none p-0">
              {g.lista.map((b) => (
                <li key={b.id} data-pieza={b.id}>
                  <a href={texto(b.ajustes, "url")} className="inline-flex min-h-11 items-center text-[17px] text-white/90 underline-offset-4 hover:text-white hover:underline">
                    {textoVersion(b.ajustes, "text")}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="marco-version mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 md:flex-row md:items-center md:justify-between">
        <ul className="m-0 flex list-none gap-1 p-0">
          {menus.redes.map((r) => {
            const red = REDES[r.red];
            if (!red) return null;
            return (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${red.nombre} (se abre en otra pestaña)`} className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                  <red.Icono className="size-5" />
                </a>
              </li>
            );
          })}
        </ul>
        <ul className="m-0 flex list-none flex-wrap gap-x-5 p-0 text-[15px] text-white/75">
          {politicas.map((e) => (
            <li key={e.url}>
              <a href={e.url} className="inline-flex min-h-11 items-center hover:text-white hover:underline">
                {e.texto}
              </a>
            </li>
          ))}
          <li className="inline-flex min-h-11 items-center">© {new Date().getFullYear()} Diluvium</li>
        </ul>
      </div>
    </footer>
  );
}
