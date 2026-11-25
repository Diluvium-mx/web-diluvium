// Sección «c-pagos»: «Paga como prefieras». Las mismas formas de pago que B (dueño, 25-nov-2026; no hay pago contra
// entrega): los logos de las tarjetas, Mercado Pago y PayPal, y tres renglones grandes: tarjeta de crédito o débito con
// hasta 6 meses sin intereses, PayPal, y transferencia o depósito por WhatsApp. Al final, que también hay factura.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { LogoMastercard, LogoMercadoPago, LogoPaypal, LogoVisa } from "@/components/pago/Iconos";
import { conMensaje, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { claseFondoC, Etiqueta, PalomitaC, TITULO_C } from "./comun";

export function PagosC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "blanco";
  const formas = seccion.bloques.filter((b) => b.tipo === "method");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="c-pagos" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-12 md:py-20`}>
      <div className="marco-version max-w-[880px]">
        <Etiqueta>{formato(textoVersion(a, "subheading"))}</Etiqueta>
        <h2 id={`titulo-${seccion.id}`} className={`${TITULO_C} text-[#06182f]`}>
          {formato(textoVersion(a, "heading"))}
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3" aria-label="Visa, Mastercard, Mercado Pago y PayPal">
          <LogoVisa className="h-9 w-14" />
          <LogoMastercard className="h-9 w-14" />
          <LogoMercadoPago className="h-9 w-14" />
          <LogoPaypal className="text-[20px]" />
        </div>
        <ul className="m-0 mt-6 grid list-none gap-3 p-0">
          {formas.map((b) => (
            <li key={b.id} data-pieza={b.id} className="flex items-start gap-4 rounded-2xl border-2 border-[#dbe7f3] bg-white p-4">
              <PalomitaC className="mt-0.5 size-8" />
              <span>
                <span className="block font-titulo text-[20px] leading-tight font-medium text-[#06182f]">{textoVersion(b.ajustes, "heading")}</span>
                {texto(b.ajustes, "text") && <span className="mt-1 block text-[17px] leading-snug text-[#45566a]">{textoVersion(b.ajustes, "text")}</span>}
              </span>
            </li>
          ))}
        </ul>
        {whatsapp && (
          <a
            href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, quiero pagar mi compuerta por transferencia o depósito."))}
            target="_blank"
            rel="noopener noreferrer"
            data-evento="toca_whatsapp"
            className="mt-5 inline-flex min-h-12 items-center gap-2.5 text-[18px] font-semibold text-[#06182f] underline underline-offset-4"
          >
            <IconoWhatsapp className="size-6 text-[#1a7f37]" />
            {tx(a, "whatsapp_text", "Pagar por transferencia o depósito")}
          </a>
        )}
        {texto(a, "invoice_text") && <p className="m-0 mt-3 text-[17px] text-[#45566a]">{textoVersion(a, "invoice_text")}</p>}
      </div>
    </section>
  );
}
