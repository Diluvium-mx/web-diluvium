// Sección «c-tamanos» (portada de C): «Elige tu tamaño». A un lado la foto de la compuerta puesta; al otro, escribir
// cuánto mide la entrada y la lista de tamaños con su precio (ElegirTamanoC), para comprar ahí mismo. Abajo, la ayuda:
// «¿No sabes cómo medir? Te ayudamos por WhatsApp».

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { conMensaje, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { claseFondoC, Etiqueta, TITULO_C } from "./comun";
import { ElegirTamanoC, type TextosTamano } from "./ElegirTamanoC";

export function textosTamano(a: Record<string, unknown>): TextosTamano {
  return {
    pregunta: tx(a, "size_question", "¿Cuánto mide tu entrada?"),
    ayuda: tx(a, "size_help", "Mide el ancho de marco a marco, en centímetros."),
    teQueda: tx(a, "size_result", "Te queda la"),
    lista: tx(a, "size_list", "Elige tu tamaño"),
    anadir: tx(a, "add_button", "Añadir al carrito"),
    agotado: tx(a, "sold_out", "Agotado"),
    masAncha: tx(a, "wider_text", "Tu entrada mide más de 120 cm."),
    masAnchaEnlace: tx(a, "wider_link_text", "Mira la compuerta XXL a tu medida"),
    masAngosta: tx(a, "narrower_text", "Tu entrada es más angosta que el tamaño más chico."),
    masAngostaEnlace: tx(a, "narrower_link_text", "Escríbenos y te decimos qué hacer"),
  };
}

/** WhatsApp para entradas más angostas que el tamaño más chico. */
export function whatsappAngosta(a: Record<string, unknown>) {
  const w = texto(a, "whatsapp_link");
  return w ? conMensaje(w, tx(a, "narrower_message", "Hola, mi entrada es más angosta que el tamaño más chico. ¿Qué opción tengo?")) : undefined;
}

export function TamanosC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const venta = datosVenta(texto(a, "producto") || undefined);
  const foto = texto(a, "image");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-tamanos" id="tamanos" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div className="lg:order-2">
          <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[18px] leading-[1.6]">{formato(textoVersion(a, "text", venta))}</p>}
          <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_14px_40px_-30px_rgba(6,24,47,0.6)] md:p-6">
            {venta && <ElegirTamanoC tamanos={venta.tamanos} textos={textosTamano(a)} enlaceMasAncha={texto(a, "wider_link") || undefined} enlaceWhatsapp={whatsappAngosta(a)} />}
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "measure_message", "Hola, no sé cómo medir mi entrada. ¿Me ayudan?"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className="mt-4 inline-flex min-h-12 items-center gap-2.5 text-[18px] font-semibold text-[#06182f] underline underline-offset-4"
            >
              <IconoWhatsapp className="size-6 text-[#1a7f37]" />
              {tx(a, "measure_text", "¿No sabes cómo medir? Te ayudamos por WhatsApp")}
            </a>
          )}
        </div>
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:order-1 lg:aspect-[4/5]">
            <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
      </div>
    </section>
  );
}
