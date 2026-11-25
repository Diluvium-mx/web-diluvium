// Sección «landing-preguntas»: los miedos reales en acordeón (<details>, se abren con teclado y lectores de
// pantalla sin código extra; abrir una cierra la otra). En computadora el título y el WhatsApp van a la izquierda.
// Con «search_heading» (Producto de B1, 21-nov-2026): las preguntas en tarjetas y al final una caja para escribir otra y
// ver la respuesta ahí mismo (PreguntasTarjetas.tsx, propuesta 1 que eligió el dueño), con las de la sección más
// preguntas-banco.ts (incluye la guía de Angela del CRM).

import { Fragment } from "react";
import type { PropsSeccion } from "../registro";
import { texto, type Bloque } from "@/lib/contenido";
import type { EntradaBanco } from "./buscarPregunta";
import { TextoRico } from "@/components/comunes/Texto";
import { datosVenta, pesos, textoVersion, rellenar, tx } from "./datos";
import { formato, sinFormato } from "./formato";
import { CLASE_ENLACE, IconoWhatsapp } from "./piezas";
import { PreguntasTarjetas } from "./PreguntasTarjetas";
import { BANCO_EXTRA } from "./preguntas-banco";
import { producto as buscarProducto } from "@/components/producto/catalogo";
import { claseFondo, fondoPropio } from "./Olas";

const ENLACE_MEDIDA = "/products/compuerta-anti-inundaciones-hecha-a-la-medida";
// Ejemplos que van cambiando dentro de la caja (preguntas que no están en las de arriba y que el banco contesta).
const EJEMPLOS = ["¿Llega a Monterrey?", "¿Cuánto pesa?", "¿Hay para cochera?", "¿Puedo pagar a meses?", "Mi puerta mide 95 cm", "¿Hacen más altas?", "¿Algo para la coladera?", "¿Qué horario tienen?", "¿Tienen tienda física?"].join("\n");

/** Texto plano de una respuesta con formato («<p>Sí. …</p>» → «Sí. …»). */
const plano = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** Título con la mano 👇 (las preguntas van abajo): en computadora las preguntas van a la derecha y la mano apunta
 *  hacia ellas 👉 (24-nov-2026). Es adorno: los lectores de pantalla no la leen. */
function conMano(titulo: string) {
  // Con o sin tono de piel («👇🏻»): el tono se queda pegado a su mano (suelto se vería como un cuadrito de color).
  const partes = titulo.split(/(👇[\u{1F3FB}-\u{1F3FF}]?)/u);
  if (partes.length === 1) return formato(titulo);
  return partes.map((p, i) =>
    i % 2 === 1 ? (
      <span key={i} aria-hidden="true">
        <span className="lg:hidden">{p}</span>
        <span className="hidden lg:inline">{p.replace("👇", "👉")}</span>
      </span>
    ) : (
      <Fragment key={i}>{formato(p)}</Fragment>
    ),
  );
}

/** Las preguntas de la sección (con su respuesta en texto plano) más las del banco, con los precios del catálogo. */
export function armarBanco(preguntas: Bloque[]): EntradaBanco[] {
  const medida = buscarProducto(ENLACE_MEDIDA.split("/").pop() ?? "");
  const precioMedida = medida?.variantes[0] ? pesos(medida.variantes[0].precio) : "un precio según la medida";
  return [
    ...preguntas.map((p) => ({
      pregunta: textoVersion(p.ajustes, "heading"),
      respuesta: plano(rellenar(texto(p.ajustes, "description"))),
      pieza: p.id,
      // «whatsapp_message»: el mensaje ya escrito del enlace de WhatsApp debajo de la respuesta (solo si la respuesta pide escribir).
      whatsapp: texto(p.ajustes, "whatsapp_message") || undefined,
    })),
    ...BANCO_EXTRA.map((e) => ({ ...e, respuesta: rellenar(e.respuesta).replace("{precio_medida}", precioMedida) })),
  ];
}

/** Los tamaños con su rango de medidas (para contestar «mi puerta mide 95 cm»). */
export function tamanosBuscador() {
  return (datosVenta()?.tamanos ?? []).filter((t) => t.medidas).map((t) => ({ nombre: t.nombre, medidas: t.medidas }));
}

export function PreguntasVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const preguntas = seccion.bloques.filter((b) => b.tipo === "question");
  const whatsapp = texto(a, "whatsapp_link");
  const tituloBuscador = texto(a, "search_heading");
  const banco = tituloBuscador ? armarBanco(preguntas) : [];
  return (
    <section data-seccion="landing-preguntas" id="preguntas" aria-labelledby="titulo-preguntas" className={`${claseFondo(fondoPropio(seccion.ajustes, "blanco"))} py-14 text-marino md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="titulo-preguntas" className="titulo-version m-0 text-[28px] md:text-[38px]">
            {conMano(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[17px] text-texto-suave">{formato(textoVersion(a, "text"))}</p>}
          {/* El enlace acompaña al texto: sin texto, no se pone (Producto: el WhatsApp va al final, en 193). */}
          {whatsapp && texto(a, "text") && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={`${CLASE_ENLACE} mt-2 text-marino`}>
              <IconoWhatsapp className="size-5 text-[#1a7f37]" />
              Escríbenos por WhatsApp
            </a>
          )}
        </div>
        {tituloBuscador ? (
          <PreguntasTarjetas
            titulo={tituloBuscador}
            faqs={banco.slice(0, preguntas.length)}
            banco={banco}
            tamanos={tamanosBuscador()}
            whatsapp={whatsapp}
            enlaceMedida={ENLACE_MEDIDA}
            placeholder={tx(a, "search_placeholder", "Ej. ¿Llega a Monterrey?")}
            textoBoton={tx(a, "search_button", "Preguntar")}
            textoSinRespuesta={tx(a, "no_answer_text", "Mándanos tu pregunta por WhatsApp y te contestamos.")}
            textoWhatsapp={tx(a, "whatsapp_answer_text", "Escríbenos por WhatsApp")}
            mensajeSinRespuesta={tx(a, "no_answer_message", "Hola, tengo una pregunta que no encontré en su página: {pregunta}")}
            mensajeAngosta={tx(a, "narrow_message", "Hola, mi entrada mide {cm} cm, ¿qué compuerta me recomiendan?")}
            ejemplos={tx(a, "search_examples", EJEMPLOS)
              .split("\n")
              .map((e) => sinFormato(e).replace(/^Ej\.\s*/i, ""))
              .filter(Boolean)}
          />
        ) : (
        <div>
          <div className="border-t border-linea">
          {preguntas.map((p) => (
            <details key={p.id} data-pieza={p.id} name="preguntas-version" className="group border-b border-linea">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-titulo text-[18px] leading-snug font-medium md:text-[19px]">
                {formato(textoVersion(p.ajustes, "heading"))}
                <svg viewBox="0 0 24 24" className="giro size-6 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <TextoRico html={rellenar(texto(p.ajustes, "description"))} className="pb-5 text-[16.5px] leading-[1.6] text-tinta" />
            </details>
          ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
