// Sección «c-ayuda»: «Te atiende una persona». La foto del equipo, quiénes somos y dos botones grandes: WhatsApp y
// llamar. Para el cliente de 40-60 años, saber que hay alguien del otro lado quita el miedo a comprar en línea.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_C_SEC, BOTON_WHATSAPP_C, claseFondoC, Etiqueta, IconoTelefono, TITULO_C } from "./comun";

export function AyudaC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "blanco";
  const foto = texto(a, "image");
  const whatsapp = texto(a, "whatsapp_link");
  const telefono = texto(a, "phone_link");
  return (
    <section data-seccion="c-ayuda" id="ayuda" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version grid gap-7 lg:grid-cols-2 lg:items-center lg:gap-16">
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
        <div>
          <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.6]">{formato(textoVersion(a, "text"))}</p>}
          <div className="mt-6 grid gap-3">
            {whatsapp && (
              <a href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, quiero hablar con alguien de Diluvium."))} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={BOTON_WHATSAPP_C}>
                <IconoWhatsapp className="size-6" />
                {tx(a, "whatsapp_text", "Escríbenos por WhatsApp")}
              </a>
            )}
            {telefono && (
              <a href={telefono} data-evento="toca_telefono" className={BOTON_C_SEC}>
                <IconoTelefono />
                {tx(a, "phone_text", "Llámanos al (668) 241 9579")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
