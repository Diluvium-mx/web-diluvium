// Sección «c-ficha»: la ficha del producto de C, para 40-60 años en el celular (25-nov-2026). Fotos grandes con flechas
// y «Foto 1 de 5», calificación, nombre grande, «Envío gratis · hasta 6 meses sin intereses», la fecha en que llegaría si
// compra hoy, escribir la medida y elegir el tamaño de una lista grande con su precio (ElegirTamanoC), «Añadir al
// carrito», WhatsApp, las garantías en renglones grandes y los puntos fuertes.
// Fotos: piezas «image» de la plantilla (se cambian en el editor). En los demás productos (que usan esta misma ficha),
// las fotos del catálogo de ese producto.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, conMensaje, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_WHATSAPP_C, EstrellaC, PalomitaC } from "./comun";
import { GaleriaC } from "./GaleriaC";
import { EntregaC } from "./EntregaC";
import { ElegirTamanoC } from "./ElegirTamanoC";
import { textosTamano, whatsappAngosta } from "./TamanosC";

export function FichaC({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const propio = texto(a, "producto") || "compuerta-anti-inundaciones";
  const nombre = producto?.nombre ?? propio;
  const esPropio = nombre === propio;
  const venta = datosVenta(nombre);
  const fotos = esPropio
    ? seccion.bloques
        .filter((b) => b.tipo === "image" && texto(b.ajustes, "image"))
        .map((b) => ({ src: texto(b.ajustes, "image"), alt: texto(b.ajustes, "alt") || venta?.nombre || "", estilo: estiloFoto(b.ajustes), marca: marcaEditar(seccion.id, b.id, "image") }))
    : (producto?.imagenes ?? []).map((i) => ({ src: i.src, alt: i.alt || producto?.titulo || "" }));
  const confianza = seccion.bloques.filter((b) => b.tipo === "trust" && texto(b.ajustes, "text"));
  const puntos = seccion.bloques.filter((b) => b.tipo === "point" && texto(b.ajustes, "text"));
  const titulo = esPropio && texto(a, "heading") ? textoVersion(a, "heading", venta) : (producto?.titulo ?? venta?.nombre ?? "");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-ficha" aria-labelledby="titulo-ficha-c" className="bg-white pb-12 text-[#1f2d3d] lg:pt-10 lg:pb-16">
      <div className="marco-version px-0 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:px-[var(--margen-version)]">
        <div className="lg:sticky lg:top-24">
          <GaleriaC fotos={fotos} />
        </div>
        <div className="marco-version pt-5 lg:px-0 lg:pt-0">
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[17px] font-semibold text-[#06182f]">
            <span className="flex text-estrella">
              {[0, 1, 2, 3, 4].map((i) => (
                <EstrellaC key={i} />
              ))}
            </span>
            {calificacion()} de 5 · {tx(a, "rating_text", "más de 200 reseñas")}
          </p>
          <h1 id="titulo-ficha-c" className="titulo-version m-0 mt-2 text-[32px] leading-[1.12] text-[#06182f] md:text-[42px]">
            {formato(titulo)}
          </h1>
          {esPropio && texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.55]">{formato(textoVersion(a, "text", venta))}</p>}
          {texto(a, "price_note") && <p className="m-0 mt-3 text-[18px] font-semibold text-[#1a7f37]">{textoVersion(a, "price_note")}</p>}
          <EntregaC prefijo={tx(a, "delivery_text", "Si la pides hoy, llega entre el")} y={tx(a, "delivery_and", "y el")} />
          <div className="mt-5 rounded-3xl bg-[#f3f8fd] p-5">
            {venta && <ElegirTamanoC tamanos={venta.tamanos} textos={textosTamano(a)} enlaceMasAncha={esPropio ? texto(a, "wider_link") || undefined : undefined} enlaceWhatsapp={whatsappAngosta(a)} />}
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, estoy viendo la {producto} en su página y tengo una pregunta.").replace("{producto}", venta?.nombre ?? "compuerta"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className={`${BOTON_WHATSAPP_C} mt-3 sm:w-full`}
            >
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
            </a>
          )}
          {confianza.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {confianza.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-center gap-3.5 rounded-2xl border-2 border-[#dbe7f3] px-4 py-3">
                  <PalomitaC />
                  <span>
                    <span className="block text-[18px] font-bold text-[#06182f]">{textoVersion(b.ajustes, "text")}</span>
                    {texto(b.ajustes, "subtext") && <span className="block text-[16px] leading-snug text-[#45566a]">{textoVersion(b.ajustes, "subtext")}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {esPropio && puntos.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {puntos.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-start gap-3 text-[18px] leading-[1.5]">
                  <PalomitaC className="mt-0.5 size-7" />
                  {textoVersion(b.ajustes, "text")}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
