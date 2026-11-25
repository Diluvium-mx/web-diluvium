// Sección «d-barra»: el botón verde de WhatsApp flotando abajo a la derecha en todas las páginas de D (como en
// Andafacil), con su texto corto para que se entienda qué es. El mensaje ya dice desde qué página escriben.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { conMensaje, tx } from "../landing/datos";
import { IconoWhatsapp } from "../landing/piezas";

export function BarraD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const whatsapp = texto(a, "whatsapp_link");
  if (!whatsapp) return null;
  return (
    <a
      data-seccion="d-barra"
      href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, vi su página, ¿me pueden dar información sobre la compuerta anti-inundaciones?"))}
      target="_blank"
      rel="noopener noreferrer"
      data-evento="toca_whatsapp"
      className="fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 flex min-h-14 items-center gap-2 rounded-full bg-[#15803d] pr-5 pl-4 font-titulo text-[17px] font-semibold text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] ring-4 ring-white hover:bg-[#116932]"
    >
      <IconoWhatsapp className="size-7" />
      {tx(a, "whatsapp_text", "¿Dudas? Escríbenos")}
    </a>
  );
}
