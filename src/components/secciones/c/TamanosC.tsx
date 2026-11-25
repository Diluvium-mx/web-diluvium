// Sección «c-tamanos» (portada de C): «Elige tu tamaño». A un lado la foto de la compuerta puesta; al otro, las puertas
// dibujadas a su tamaño con su precio (ElegirTamanoC, propuesta T3), para comprar ahí mismo. Abajo, la ayuda:
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
    pregunta: tx(a, "size_question", "¿Cuál se parece a tu entrada?"),
    ayuda: tx(a, "size_help", "Cada puerta está dibujada a su tamaño real. Mide de marco a marco."),
    elegida: tx(a, "chosen_text", "Elegida"),
    teQueda: tx(a, "size_result", "Elegiste la"),
    lista: tx(a, "size_list", "Primero elige tu tamaño"),
    anadir: tx(a, "add_button", "Añadir al carrito"),
    agotado: tx(a, "sold_out", "Agotado"),
    masAncha: texto(a, "wider_text") ? textoVersion(a, "wider_text") : "",
    masAngosta: tx(a, "narrower_text", "¿Tu entrada mide menos de {desde} cm?"),
    masAngostaEnlace: tx(a, "narrower_link_text", "Escríbenos por WhatsApp"),
  };
}

/** WhatsApp para entradas más angostas que el tamaño más chico. */
export function whatsappAngosta(a: Record<string, unknown>) {
  const w = texto(a, "whatsapp_link");
  return w ? conMensaje(w, tx(a, "narrower_message", "Hola, mi entrada mide menos de 69 cm, ¿qué compuerta me recomiendan?")) : undefined;
}

/** WhatsApp para entradas más anchas que el tamaño más grande (el cuadro «¿Más de 120cm?…»; sin texto, no sale). */
export function whatsappAncha(a: Record<string, unknown>) {
  const w = texto(a, "whatsapp_link");
  return w && texto(a, "wider_text") ? conMensaje(w, tx(a, "wider_message", "Hola, mi entrada mide más de 120 cm, ¿qué compuerta me recomiendan?")) : undefined;
}

/** Logo blanco que va sobre la compuerta de cada puerta dibujada. */
export function logoPuerta(a: Record<string, unknown>) {
  return texto(a, "door_logo") || "/media/files/logo-compuerta-blanco.png";
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
            {venta && <ElegirTamanoC tamanos={venta.tamanos} textos={textosTamano(a)} enlaceMasAncha={whatsappAncha(a)} enlaceWhatsapp={whatsappAngosta(a)} logo={logoPuerta(a)} altoCompuerta={Number(a.gate_height) || 60} />}
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "measure_message", "Hola, ¿me ayudan a medir mi entrada para elegir el tamaño de la compuerta?"))}
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
