// Sección «d-cierre»: el último empujón. Una franja azul marino con la foto de la compuerta puesta a un lado, el título
// con su rayita amarilla, el texto, los datos con su ícono (piezas «chip») y dos botones: comprar y WhatsApp.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_D, BOTON_D_WHATSAPP, ChipsD, TituloD } from "./comun";

export function CierreD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const foto = texto(a, "image");
  const whatsapp = texto(a, "whatsapp_link");
  const chips = seccion.bloques.filter((b) => b.tipo === "chip").map((b) => ({ id: b.id, icono: texto(b.ajustes, "icon"), texto: textoVersion(b.ajustes, "text") }));
  return (
    <section data-seccion="d-cierre" aria-labelledby={`titulo-${seccion.id}`} className="bg-[#0b2545] text-white">
      <div className={`marco-version grid gap-8 py-12 md:py-16 ${foto ? "lg:grid-cols-2 lg:items-center lg:gap-14" : ""}`}>
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:order-2">
            <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 560px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
        <div>
          <TituloD id={`titulo-${seccion.id}`} oscuro>
            {formato(textoVersion(a, "heading"))}
          </TituloD>
          {texto(a, "text") && <p className="m-0 mt-4 text-[19px] leading-[1.6] text-white/90">{formato(textoVersion(a, "text"))}</p>}
          <ChipsD className="mt-5" datos={chips} oscuro />
          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <a href={tx(a, "button_link", "/products/compuerta-anti-inundaciones")} data-evento="boton_cierre" className={BOTON_D}>
              {tx(a, "button_text", "Comprar ahora")}
            </a>
            {whatsapp && (
              <a href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, tengo una duda antes de comprar, ¿me pueden ayudar?"))} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={BOTON_D_WHATSAPP}>
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
