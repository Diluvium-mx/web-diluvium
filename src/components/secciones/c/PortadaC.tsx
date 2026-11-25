// Sección «c-portada»: primera pantalla de C, para 40-60 años en el celular. Fondo claro, el título grande, la
// calificación, una foto real de la compuerta deteniendo el agua, el precio con envío gratis y los meses sin
// intereses, tres razones en renglones grandes con palomita (piezas «point») y dos botones grandes: ver tamaños y
// precios, y preguntar por WhatsApp.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, conMensaje, datosVenta, pesos, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_C, BOTON_WHATSAPP_C, EstrellaC, Etiqueta, PalomitaC } from "./comun";

export function PortadaC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const venta = datosVenta();
  const puntos = seccion.bloques.filter((b) => b.tipo === "point" && texto(b.ajustes, "text"));
  const foto = texto(a, "image");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-portada" aria-labelledby="titulo-portada-c" className="bg-[#f3f8fd] text-[#1f2d3d]">
      <div className="marco-version grid gap-6 pt-6 pb-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pt-14 lg:pb-16">
        <div>
          <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h1 id="titulo-portada-c" className="titulo-version m-0 mt-2 text-[36px] leading-[1.1] text-[#06182f] md:text-[54px]">
            {formato(textoVersion(a, "heading"))}
          </h1>
          <p className="m-0 mt-3 flex flex-wrap items-center gap-2 text-[17px] font-semibold text-[#06182f]">
            <span className="flex text-estrella">
              {[0, 1, 2, 3, 4].map((i) => (
                <EstrellaC key={i} />
              ))}
            </span>
            {calificacion()} de 5 · {tx(a, "rating_text", "más de 200 reseñas")}
          </p>
          {texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.55]">{formato(textoVersion(a, "text"))}</p>}
        </div>
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-28px_rgba(6,24,47,0.55)] lg:row-span-2 lg:aspect-square">
            <Image src={foto} alt={texto(a, "alt")} fill priority sizes="(min-width: 1024px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
        <div>
          {venta && (
            <div className="rounded-3xl bg-white p-5 shadow-[0_14px_40px_-30px_rgba(6,24,47,0.6)]">
              <p className="m-0 text-[17px] text-[#45566a]">{tx(a, "price_prefix", "Cualquier tamaño, desde")}</p>
              <p className="m-0 mt-1 flex flex-wrap items-baseline gap-x-3 font-titulo text-[40px] leading-none font-semibold text-[#06182f]">
                {pesos(venta.precio)}
                {venta.precioAntes && <s className="text-[20px] font-normal text-[#45566a]">{pesos(venta.precioAntes)}</s>}
              </p>
              <p className="m-0 mt-2 text-[17px] font-semibold text-[#1a7f37]">{tx(a, "price_note", "Envío gratis a todo México · hasta 6 meses sin intereses")}</p>
            </div>
          )}
          {puntos.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-3 p-0">
              {puntos.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-center gap-3 text-[19px] leading-snug font-semibold text-[#06182f]">
                  <PalomitaC />
                  {textoVersion(b.ajustes, "text")}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 grid gap-3">
            <a href={tx(a, "button_link", "#tamanos")} data-evento="boton_portada" className={BOTON_C}>
              {tx(a, "button_text", "Ver tamaños y precios")}
            </a>
            {whatsapp && (
              <a href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, vi su página y quiero información sobre la compuerta."))} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={BOTON_WHATSAPP_C}>
                <IconoWhatsapp className="size-6" />
                {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
