// Sección «c-cierre»: el último empujón. Una tarjeta azul marino (letra blanca: contraste alto) con un sello («1 año de garantía · envío gratis»,
// dibujado con texto en círculo), el título, el botón de comprar y el WhatsApp.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_C } from "./comun";

export function CierreC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const sello = tx(a, "seal_text", "1 AÑO DE GARANTÍA • ENVÍO GRATIS • PAGO SEGURO • ");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-cierre" aria-labelledby={`titulo-${seccion.id}`} className="bg-[#f3f8fd] px-4 py-12 md:py-20">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_80%_0%,#16467d,#06182f_60%)] px-6 pt-36 pb-10 text-center text-white md:px-16 md:pt-16 md:pb-14 md:text-left">
        <svg viewBox="0 0 200 200" className="absolute top-4 left-1/2 size-28 -translate-x-1/2 md:top-1/2 md:right-12 md:left-auto md:size-40 md:-translate-y-1/2 md:translate-x-0" aria-hidden="true">
          <defs>
            <path id={`circulo-${seccion.id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <text fontSize="15" fontWeight="700" letterSpacing="3" fill="#7cc4fa">
            <textPath href={`#circulo-${seccion.id}`}>{sello}</textPath>
          </text>
          <text x="100" y="112" textAnchor="middle" fontSize="40" fill="#fff">
            🛡️
          </text>
        </svg>
        <div className="md:max-w-[34rem]">
          <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 text-[32px] md:text-[46px]">
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.6] text-white">{formato(textoVersion(a, "text"))}</p>}
          <div className="mt-7 grid gap-3 md:flex md:items-center md:gap-6">
            <a href={tx(a, "button_link", "/products/compuerta-anti-inundaciones")} data-evento="boton_cierre" className={BOTON_C}>
              {tx(a, "button_text", "Proteger mi casa")} →
            </a>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className="inline-flex min-h-11 items-center justify-center gap-2 min-h-12 text-[18px] font-semibold text-white underline underline-offset-4">
                <IconoWhatsapp className="size-5 text-[#4ade80]" />
                {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
