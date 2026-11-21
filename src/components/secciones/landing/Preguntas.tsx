// Sección «landing-preguntas»: los miedos reales en acordeón (<details>, se abren con teclado y lectores de
// pantalla sin código extra; abrir una cierra la otra). En computadora el título y el WhatsApp van a la izquierda.
// Con «search_heading» (Producto de B1, 21-nov-2026): las preguntas en tarjetas y al final una caja para escribir otra y
// ver la respuesta ahí mismo (PreguntasTarjetas.tsx, propuesta 1 que eligió el dueño), con las de la sección más
// preguntas-banco.ts (incluye la guía de Angela del CRM).

import type { PropsSeccion } from "../registro";
import { texto, type Bloque } from "@/lib/contenido";
import type { EntradaBanco } from "./buscarPregunta";
import { TextoRico } from "@/components/comunes/Texto";
import { datosVenta, pesos, textoVersion, rellenar } from "./datos";
import { CLASE_ENLACE, IconoWhatsapp } from "./piezas";
import { PreguntasTarjetas } from "./PreguntasTarjetas";
import { BANCO_EXTRA } from "./preguntas-banco";
import { producto as buscarProducto } from "@/components/producto/catalogo";

const ENLACE_MEDIDA = "/products/compuerta-anti-inundaciones-hecha-a-la-medida";

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

/** Las preguntas de la sección (con su respuesta en texto plano) más las del banco, con los precios del catálogo. */
export function armarBanco(preguntas: Bloque[]): EntradaBanco[] {
  const medida = buscarProducto(ENLACE_MEDIDA.split("/").pop() ?? "");
  const precioMedida = medida?.variantes[0] ? pesos(medida.variantes[0].precio) : "un precio según la medida";
  return [
    ...preguntas.map((p) => ({ pregunta: textoVersion(p.ajustes, "heading"), respuesta: plano(rellenar(texto(p.ajustes, "description"))), pieza: p.id })),
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
    <section data-seccion="landing-preguntas" id="preguntas" aria-labelledby="titulo-preguntas" className="bg-white py-14 text-marino md:py-20">
      <div className="marco-version grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="titulo-preguntas" className="titulo-ancho m-0 text-[28px] md:text-[38px]">
            {textoVersion(a, "heading")}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[17px] text-texto-suave">{textoVersion(a, "text")}</p>}
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
          />
        ) : (
        <div>
          <div className="border-t border-linea">
          {preguntas.map((p) => (
            <details key={p.id} data-pieza={p.id} name="preguntas-version" className="group border-b border-linea">
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
        )}
      </div>
    </section>
  );
}
