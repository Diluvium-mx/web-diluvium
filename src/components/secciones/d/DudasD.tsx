// Sección «d-dudas»: «Las 12 dudas más comunes» (como en cada ficha de Andafacil). Preguntas numeradas en renglones
// grandes que se abren al tocarlas y, al final, preguntar por WhatsApp. Piezas «question»: pregunta y respuesta.
// Sin botón «Abrir todas» (dueño, 25-nov-2026: cada quien abre la que le interesa); en su lugar, la flecha de la
// primera pregunta se mueve hacia abajo (donde sale la respuesta) hasta que la persona abre alguna (.dudas-d en
// versiones.css).

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";
import { conMensaje, rellenar, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_D_WHATSAPP, claseFondoD, EtiquetaD, TituloD } from "./comun";

export function DudasD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const preguntas = seccion.bloques.filter((b) => b.tipo === "question" && texto(b.ajustes, "heading"));
  const whatsapp = texto(a, "whatsapp_link");
  const lista = `dudas-${seccion.id}`;
  return (
    <section data-seccion="d-dudas" id="preguntas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "gris")} py-12 md:py-20`}>
      <div className="marco-version max-w-[900px]">
        <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading").replace("{n}", String(preguntas.length)))}</TituloD>
        {texto(a, "text") && <p className="m-0 mt-6 text-[18px] leading-[1.5]">{formato(textoVersion(a, "text"))}</p>}
        <div id={lista} className="dudas-d mt-5 overflow-hidden rounded-xl border border-[#dde2e8] bg-white">
          {preguntas.map((p, i) => (
            <details key={p.id} data-pieza={p.id} name={lista} className="group border-b border-[#dde2e8] last:border-b-0">
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center gap-4 px-4 py-4 text-[#0b2545] hover:bg-[#f9fafb] md:px-6">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#0b2545] font-titulo text-[17px] font-bold text-[#ffc83d]">{i + 1}</span>
                <span className="flex-1 font-titulo text-[19px] leading-snug font-semibold">{formato(textoVersion(p.ajustes, "heading"))}</span>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff4d1] text-[#0b2545] group-open:bg-[#0b2545] group-open:text-[#ffc83d] ${i === 0 ? "flecha-duda" : ""}`}>
                  <svg viewBox="0 0 24 24" className="size-6 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <TextoRico html={rellenar(texto(p.ajustes, "description"))} className="px-4 pb-5 pl-[68px] text-[18px] leading-[1.6] text-[#1f2a37] md:px-6 md:pl-[76px]" />
            </details>
          ))}
        </div>
        {whatsapp && (
          <div className="mt-8 flex flex-col gap-4 rounded-xl border-2 border-[#0b2545] bg-white p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="m-0 font-titulo text-[21px] font-semibold text-[#0b2545]">{tx(a, "other_question", "¿No está tu duda?")}</p>
              <p className="m-0 mt-1 text-[17px]">{tx(a, "other_text", "Escríbenos: te contesta una persona del equipo.")}</p>
            </div>
            <a href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, tengo una pregunta que no encontré en su página, ¿me pueden ayudar?"))} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={BOTON_D_WHATSAPP}>
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Preguntar por WhatsApp")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
