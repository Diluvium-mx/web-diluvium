// Sección «c-preguntas»: preguntas frecuentes en tarjetas grandes que se abren al tocarlas (25-nov-2026, para 40-60
// años: se reconocen al instante y se leen con calma; reemplaza el chat). Letra de 19 px, un «+» grande que cambia a
// «−» y, al final, un botón verde para preguntar por WhatsApp. Piezas «question»: pregunta y respuesta.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { conMensaje, rellenar, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_WHATSAPP_C, claseFondoC, Etiqueta, TITULO_C } from "./comun";

export function PreguntasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "blanco";
  const preguntas = seccion.bloques.filter((b) => b.tipo === "question");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-preguntas" id="preguntas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version max-w-[880px]">
        <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
        <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        <div className="mt-7 grid gap-3">
          {preguntas.map((p) => (
            <details key={p.id} data-pieza={p.id} name={`preguntas-${seccion.id}`} className="group rounded-2xl border-2 border-[#dbe7f3] bg-white open:border-[#1663a8]">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-titulo text-[19px] leading-snug font-medium text-[#06182f]">
                {formato(textoVersion(p.ajustes, "heading"))}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f8fd] text-[26px] leading-none text-[#1663a8]" aria-hidden="true">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <TextoRico html={rellenar(texto(p.ajustes, "description"))} className="px-5 pb-5 text-[18px] leading-[1.6] text-[#1f2d3d]" />
            </details>
          ))}
        </div>
        {whatsapp && (
          <div className="mt-8 rounded-3xl bg-[#f3f8fd] p-5 text-center md:p-7">
            <p className="m-0 font-titulo text-[21px] font-medium text-[#06182f]">{tx(a, "other_question", "¿Tienes otra pregunta?")}</p>
            <p className="m-0 mt-1 text-[17px]">{tx(a, "other_text", "Escríbenos: te contesta una persona del equipo.")}</p>
            <a href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, tengo una pregunta sobre la compuerta que no encontré en su página, ¿me pueden ayudar?"))} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={`${BOTON_WHATSAPP_C} mt-4`}>
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Preguntar por WhatsApp")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
