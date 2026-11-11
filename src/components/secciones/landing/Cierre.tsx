// Sección «landing-cierre»: mini portada final con urgencia de temporada, 3 viñetas, la calificación, el botón
// principal y WhatsApp para quien duda de su medida. En B4 el botón regresa a los tamaños.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion } from "./datos";
import { CLASE_BOTON, CLASE_ENLACE, Calificacion, IconoFlecha, IconoPalomita, IconoWhatsapp } from "./piezas";

export function CierreVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const puntos = seccion.bloques.filter((b) => b.tipo === "point").map((b) => textoVersion(b.ajustes, "text")).filter(Boolean);
  const whatsapp = texto(a, "whatsapp_link");
  const boton = textoVersion(a, "button_text");
  return (
    <section data-seccion="landing-cierre" aria-labelledby="titulo-cierre" className="fondo-oscuro bg-marino py-16 text-white md:py-24">
      <div className="marco-version flex flex-col items-start gap-6 md:items-center md:text-center">
        <Calificacion texto={textoVersion(a, "rating_text")} />
        <h2 id="titulo-cierre" className="titulo-ancho m-0 max-w-[44rem] text-[32px] md:text-[48px]">
          {textoVersion(a, "heading")}
        </h2>
        {texto(a, "text") && <p className="m-0 text-[18px] text-white/85">{textoVersion(a, "text")}</p>}
        {puntos.length > 0 && (
          <ul className="m-0 grid list-none gap-3 p-0 md:flex md:flex-wrap md:justify-center md:gap-x-8">
            {puntos.map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[17px] font-semibold">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-marino">
                  <IconoPalomita className="size-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        )}
        {boton && (
          <a href={texto(a, "button_link") || "#"} data-evento="boton_portada" className={`${CLASE_BOTON} mt-2 w-full sm:w-auto sm:min-w-[320px]`}>
            {boton}
            <IconoFlecha />
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={`${CLASE_ENLACE} text-white`}>
            <IconoWhatsapp className="size-5" />
            {textoVersion(a, "whatsapp_text") || "Escríbenos por WhatsApp"}
          </a>
        )}
      </div>
    </section>
  );
}
