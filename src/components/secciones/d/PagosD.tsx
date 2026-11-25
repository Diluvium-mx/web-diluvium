// Sección «d-pagos»: «Formas de pago». Las mismas de B (dueño, 25-nov-2026; no hay pago contra entrega): los logos de
// las tarjetas, Mercado Pago y PayPal en un renglón, y cada forma de pago en su tarjeta con su ícono (piezas «method»:
// ícono, título y texto). Abajo, pagar por transferencia por WhatsApp y la factura.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { LogoMastercard, LogoMercadoPago, LogoPaypal, LogoVisa } from "@/components/pago/Iconos";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { claseFondoD, EtiquetaD, IconoD, TARJETA_D, TituloD } from "./comun";

export function PagosD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const formas = seccion.bloques.filter((b) => b.tipo === "method" && texto(b.ajustes, "heading"));
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="d-pagos" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "blanco")} py-12 md:py-20`}>
      <div className="marco-version">
        <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading"))}</TituloD>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#dde2e8] bg-[#f4f6f8] px-4 py-3" aria-label="Visa, Mastercard, Mercado Pago y PayPal">
          <LogoVisa className="h-9 w-14" />
          <LogoMastercard className="h-9 w-14" />
          <LogoMercadoPago className="h-9 w-14" />
          <LogoPaypal className="text-[20px]" />
        </div>
        <ul className="m-0 mt-5 grid list-none gap-3 p-0 md:grid-cols-3">
          {formas.map((b) => (
            <li key={b.id} data-pieza={b.id} className={`${TARJETA_D} p-5`}>
              <span className="flex size-12 items-center justify-center rounded-full bg-[#0b2545] text-[#ffc83d]">
                <IconoD nombre={texto(b.ajustes, "icon") || "pago"} className="size-6" />
              </span>
              <span className="mt-3 block font-titulo text-[21px] leading-tight font-semibold text-[#0b2545]">{textoVersion(b.ajustes, "heading")}</span>
              {texto(b.ajustes, "text") && <span className="mt-1.5 block text-[17px] leading-snug text-[#4a5568]">{textoVersion(b.ajustes, "text")}</span>}
            </li>
          ))}
        </ul>
        {whatsapp && (
          <a
            href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, quiero pagar mi compuerta por transferencia o depósito, ¿me pasan los datos?"))}
            target="_blank"
            rel="noopener noreferrer"
            data-evento="toca_whatsapp"
            className="mt-5 inline-flex min-h-12 items-center gap-2.5 text-[18px] font-semibold text-[#0b2545] underline underline-offset-4"
          >
            <IconoWhatsapp className="size-6 text-[#15803d]" />
            {tx(a, "whatsapp_text", "Pagar por transferencia o depósito")}
          </a>
        )}
        {texto(a, "invoice_text") && (
          <p className="m-0 mt-3 flex items-center gap-2.5 text-[17px] text-[#4a5568]">
            <IconoD nombre="factura" className="size-6 text-[#0b2545]" />
            {textoVersion(a, "invoice_text")}
          </p>
        )}
      </div>
    </section>
  );
}
