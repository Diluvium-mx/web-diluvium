// Sección «landing-preguntas»: los miedos reales en acordeón (<details>, se abren con teclado y lectores de
// pantalla sin código extra; abrir una cierra la otra). En computadora el título y el WhatsApp van a la izquierda.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { textoVersion, rellenar } from "./datos";
import { CLASE_ENLACE, IconoWhatsapp } from "./piezas";

export function PreguntasVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const preguntas = seccion.bloques.filter((b) => b.tipo === "question");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="landing-preguntas" id="preguntas" aria-labelledby="titulo-preguntas" className="bg-white py-14 text-marino md:py-20">
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="titulo-preguntas" className="titulo-ancho m-0 text-[28px] md:text-[38px]">
            {textoVersion(a, "heading")}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[17px] text-texto-suave">{textoVersion(a, "text")}</p>}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={`${CLASE_ENLACE} mt-2 text-marino`}>
              <IconoWhatsapp className="size-5 text-[#1a7f37]" />
              Escríbenos por WhatsApp
            </a>
          )}
        </div>
        <div className="border-t border-linea">
          {preguntas.map((p) => (
            <details key={p.id} name="preguntas-version" className="group border-b border-linea">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-titulo text-[18px] leading-snug font-bold md:text-[19px]">
                {textoVersion(p.ajustes, "heading")}
                <svg viewBox="0 0 24 24" className="giro size-6 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <TextoRico html={rellenar(texto(p.ajustes, "description"))} className="pb-5 text-[16.5px] leading-[1.6] text-tinta" />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
