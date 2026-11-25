// Sección «c-barra»: barra fija abajo en el celular con dos botones grandes, WhatsApp y Llamar, siempre a la mano
// mientras se baja la página (en computadora no se muestra: ahí están en el encabezado y en «Te atiende una persona»).

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { conMensaje, tx } from "../landing/datos";
import { IconoWhatsapp } from "../landing/piezas";
import { IconoTelefono } from "./comun";

export function BarraAyudaC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const whatsapp = texto(a, "whatsapp_link");
  const telefono = texto(a, "phone_link");
  if (!whatsapp && !telefono) return null;
  return (
    <div data-seccion="c-barra" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dbe7f3] bg-white/97 px-3 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(6,24,47,0.35)] lg:hidden">
      <div className="mx-auto flex max-w-[560px] gap-2.5">
        {whatsapp && (
          <a
            href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, vi su página, ¿me pueden dar información sobre la compuerta anti-inundaciones?"))}
            target="_blank"
            rel="noopener noreferrer"
            data-evento="toca_whatsapp"
            className="flex min-h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-[#1a7f37] font-titulo text-[17px] font-medium text-white"
          >
            <IconoWhatsapp className="size-6" />
            {tx(a, "whatsapp_text", "WhatsApp")}
          </a>
        )}
        {telefono && (
          <a href={telefono} data-evento="toca_telefono" className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-[2.5px] border-[#06182f] font-titulo text-[17px] font-medium text-[#06182f]">
            <IconoTelefono />
            {tx(a, "phone_text", "Llamar")}
          </a>
        )}
      </div>
    </div>
  );
}
