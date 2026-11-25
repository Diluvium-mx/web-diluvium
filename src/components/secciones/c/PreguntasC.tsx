// Sección «c-preguntas»: las preguntas como una conversación de chat (en A y B son acordeones): se toca una pregunta,
// aparece como mensaje de la persona y Diluvium «escribe» la respuesta. Piezas «question»: pregunta y respuesta.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { conMensaje, rellenar, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, Etiqueta } from "./comun";
import { ChatPreguntas } from "./ChatPreguntas";

const plano = (html: string) =>
  html
    .replace(/<\/p>\s*<p[^>]*>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

export function PreguntasC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "blanco";
  const preguntas = seccion.bloques
    .filter((b) => b.tipo === "question")
    .map((b) => ({ id: b.id, pregunta: textoVersion(b.ajustes, "heading"), respuesta: plano(rellenar(texto(b.ajustes, "description"))) }));
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-preguntas" id="preguntas" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-14 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <div>
          <Etiqueta oscuro={fondo === "noche"}>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`titulo-version m-0 mt-2 text-[32px] md:text-[44px] ${fondo === "noche" ? "text-white" : "text-[#06182f]"}`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[17px] text-texto-suave">{formato(textoVersion(a, "text"))}</p>}
        </div>
        <ChatPreguntas
          preguntas={preguntas}
          whatsapp={whatsapp ? conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, tengo una pregunta sobre la compuerta: ")) : ""}
          textos={{ diluvium: tx(a, "brand_name", "Diluvium"), otra: tx(a, "other_question", "¿Otra pregunta? Escríbenos por WhatsApp"), elige: tx(a, "choose_text", "Toca una pregunta:") }}
        />
      </div>
    </section>
  );
}
