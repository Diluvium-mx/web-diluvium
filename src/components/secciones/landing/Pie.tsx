// Sección «landing-pie»: pie de las versiones B, más limpio que el de la tienda pero con el mismo contenido (logo,
// dirección, teléfono, correo, redes, menú y políticas), que sale del pie de la tienda (contenido/tema/footer-group.json)
// y de los menús (contenido/menus.json).

import Image from "next/image";
import menus from "@contenido/menus.json";
import type { PropsSeccion } from "../registro";
import { plantilla, texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { medidasImagen } from "../ImagenBanner";
import { IconoFacebook, IconoInstagram, IconoLinkedin, IconoYoutube } from "@/components/comunes/Iconos";
import { textoVersion, tx } from "./datos";
import { formato } from "./formato";

const REDES: Record<string, { nombre: string; Icono: typeof IconoFacebook }> = {
  facebook: { nombre: "Facebook", Icono: IconoFacebook },
  youtube: { nombre: "YouTube", Icono: IconoYoutube },
  instagram: { nombre: "Instagram", Icono: IconoInstagram },
  linkedin: { nombre: "LinkedIn", Icono: IconoLinkedin },
};

export function PieVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const tienda = plantilla("pie").secciones.find((s) => s.tipo === "footer")?.bloques.find((b) => b.tipo === "store_information");
  // El logo de la sección («logo», se cambia en el editor; 24-nov-2026) o, sin él, el del pie de la tienda.
  const logo = texto(a, "logo") || (tienda ? texto(tienda.ajustes, "footer_image") : "");
  const medidas = logo ? medidasImagen(logo) : null;
  // La dirección, el teléfono y el correo vienen como renglones (<h5>) en el pie de la tienda.
  const renglones = tienda
    ? [...texto(tienda.ajustes, "description").matchAll(/<h5>(.*?)<\/h5>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean)
    : [];
  const anio = new Date().getFullYear();

  const enlacesPie = [...menus.principal.enlaces, ...menus.pie.enlaces.filter((e) => e.url !== "/search")];
  return (
    <footer data-seccion="landing-pie" className="fondo-oscuro bg-marino-hondo pt-12 pb-8 text-white md:pt-16 md:pb-12">
      <div className="marco-version grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {logo && medidas && (
            <span className="mb-4 block w-[168px] overflow-hidden">
              <Image
                src={logo}
                alt="Diluvium"
                width={medidas.ancho}
                height={medidas.alto}
                sizes="168px"
                className="h-auto w-full"
                style={estiloFoto(a, "logo")}
                {...("logo" in a ? marcaEditar(seccion.id, "", "logo") : {})}
              />
            </span>
          )}
          {texto(seccion.ajustes, "text") && <p className="m-0 max-w-[26rem] text-[15px] leading-[1.6] text-white/85">{formato(textoVersion(seccion.ajustes, "text"))}</p>}
          <ul className="m-0 mt-5 flex list-none gap-1 p-0">
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
        </div>
        <address className="not-italic">
          <p className="m-0 mb-3 font-titulo text-[15px] font-medium tracking-wide uppercase">{formato(tx(a, "contact_heading", "Contacto"))}</p>
          <ul className="m-0 grid list-none gap-2 p-0 text-[15px] leading-[1.5] text-white/85">
            {renglones.map((r) =>
              /@/.test(r) ? (
                <li key={r}>
                  <a href={`mailto:${r}`} className="underline-offset-4 hover:underline">{r}</a>
                </li>
              ) : /^\(?\d/.test(r) ? (
                <li key={r}>
                  <a href={`tel:+52${r.replace(/\D/g, "")}`} className="underline-offset-4 hover:underline">{r}</a>
                </li>
              ) : (
                <li key={r}>{r}</li>
              ),
            )}
          </ul>
        </address>
        <nav aria-label="Pie de página">
          <p className="m-0 mb-3 font-titulo text-[15px] font-medium tracking-wide uppercase">{formato(tx(a, "store_heading", "Tienda"))}</p>
          {/* Dos columnas (Producto 205-212, dueño 24-nov-2026): la tienda a la izquierda y el blog con las políticas a la
              derecha, para que no sea una lista larga y el pie quede más corto. Se llenan de arriba abajo, columna por columna. */}
          <ul
            className="m-0 grid list-none grid-flow-col grid-cols-2 gap-x-6 gap-y-1 p-0 text-[15px] text-white/85"
            style={{ gridTemplateRows: `repeat(${Math.ceil(enlacesPie.length / 2)}, auto)` }}
          >
            {enlacesPie.map((e) => (
              <li key={e.url}>
                <a href={e.url} className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="marco-version">
        <p className="m-0 mt-10 border-t border-white/15 pt-6 text-[14px] text-white/70">© {anio} Diluvium</p>
      </div>
    </footer>
  );
}
