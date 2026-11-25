// Sección «c-ficha»: la ficha del producto de C. Galería que deja asomar la siguiente foto (se desliza con el dedo),
// calificación, nombre, la fecha en que llegaría si compra hoy (se calcula con la fecha del día), la regla de tamaños
// para elegir y agregar al carrito, el WhatsApp y las garantías como fichas. En computadora, la galería se queda fija a
// la izquierda mientras se baja.
// Fotos: piezas «image» de la plantilla (se cambian en el editor). En los demás productos (que usan esta misma ficha),
// las fotos del catálogo de ese producto.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, conMensaje, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { EstrellaC, Etiqueta } from "./comun";
import { GaleriaC } from "./GaleriaC";
import { EntregaC } from "./EntregaC";
import { ReglaTamanos } from "./ReglaTamanos";
import { textosRegla } from "./TamanosC";

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
    <section data-seccion="c-ficha" aria-labelledby="titulo-ficha-c" className="bg-white pb-12 text-tinta lg:pt-10 lg:pb-16">
      <div className="marco-version px-0 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:px-[var(--margen-version)]">
        <div className="lg:sticky lg:top-24">
          <GaleriaC fotos={fotos} />
        </div>
        <div className="marco-version pt-5 lg:px-0 lg:pt-0">
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] font-semibold text-[#06182f]">
            <span className="flex text-estrella">
              {[0, 1, 2, 3, 4].map((i) => (
                <EstrellaC key={i} />
              ))}
            </span>
            {calificacion()} · {tx(a, "rating_text", "+200 reseñas")}
            {texto(a, "sold_text") && <span className="rounded-full bg-[#eef5fc] px-2.5 py-0.5 text-[13px] text-[#1b5f99]">{textoVersion(a, "sold_text")}</span>}
          </p>
          <h1 id="titulo-ficha-c" className="titulo-version m-0 mt-2 text-[32px] leading-[1.1] text-[#06182f] md:text-[42px]">
            {formato(titulo)}
          </h1>
          {esPropio && texto(a, "text") && <p className="m-0 mt-3 text-[16.5px] leading-[1.55] text-texto-suave">{formato(textoVersion(a, "text", venta))}</p>}
          <EntregaC prefijo={tx(a, "delivery_text", "Si lo pides hoy, llega entre el")} y={tx(a, "delivery_and", "y el")} />
          <div className="mt-5 rounded-[28px] bg-[#eef5fc] p-5">
            <Etiqueta>{tx(a, "sizes_heading", "Elige tu tamaño")}</Etiqueta>
            <div className="mt-3">{venta && <ReglaTamanos tamanos={venta.tamanos} textos={textosRegla(a)} enlaceMasAncha={esPropio ? texto(a, "wider_link") || undefined : undefined} />}</div>
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, estoy viendo la {producto} en su página y tengo una pregunta.").replace("{producto}", venta?.nombre ?? "compuerta"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className="mt-3 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-[#06182f] font-titulo text-[16px] font-medium text-[#06182f] hover:bg-[#06182f] hover:text-white"
            >
              <IconoWhatsapp className="size-5 text-[#1a7f37]" />
              {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
            </a>
          )}
          {confianza.length > 0 && (
            <ul className="m-0 mt-5 grid list-none grid-cols-2 gap-2 p-0">
              {confianza.map((b) => (
                <li key={b.id} data-pieza={b.id} className="rounded-2xl border border-[#d8ecfd] px-3.5 py-3">
                  <p className="m-0 text-[14.5px] font-bold text-[#06182f]">{textoVersion(b.ajustes, "text")}</p>
                  {texto(b.ajustes, "subtext") && <p className="m-0 mt-0.5 text-[13px] leading-snug text-texto-suave">{textoVersion(b.ajustes, "subtext")}</p>}
                </li>
              ))}
            </ul>
          )}
          {esPropio && puntos.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-2.5 p-0">
              {puntos.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-start gap-3 text-[15.5px] leading-[1.45]">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3fa9f5] text-[13px] font-bold text-white">✓</span>
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
