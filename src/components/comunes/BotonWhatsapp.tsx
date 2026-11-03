"use client";

// Botón flotante de WhatsApp con su ventanita (hoy lo pone la app SeedGrow en Shopify). Medidas, textos y enlace
// tomados del sitio en vivo el 3-nov-2026; sin la marca «Powered by» de la app.

import Image from "next/image";
import { useState } from "react";
import { IconoCerrar } from "./Iconos";

const ENLACE =
  "https://api.whatsapp.com/send?phone=526682419579&text=Me%20interesa%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20producto%20Diluvium%20M%C3%A9xico";

function LogoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function BotonWhatsapp() {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="fixed bottom-[65px] right-[30px] z-50 font-[Arial,sans-serif]">
      {abierto && (
        <div
          role="dialog"
          aria-label="Escríbenos por WhatsApp"
          className="absolute bottom-[72px] right-0 w-[340px] overflow-hidden rounded-lg bg-white shadow-[0_8px_25px_rgba(0,0,0,0.25)] min-[1025px]:w-[351px]"
        >
          <div className="flex gap-4 bg-[#2db742] px-[18px] pb-[18px] pt-[15px] text-[#d9ebc6]">
            <LogoWhatsapp className="mt-1 h-10 w-10 shrink-0 text-white" />
            <div>
              <p className="m-0 text-[18px] leading-[26px] text-white">Escríbenos por aqui</p>
              <p className="m-0 text-[12px] leading-[22px]">Hi! Click one of our member below to chat on WhatsApp</p>
            </div>
          </div>
          <div className="px-[19px] pb-6 pt-[13px]">
            <p className="m-0 text-[11px] font-medium leading-6 text-[#a5abb7]">Te respondemos tan proto como sea posible</p>
            <a
              href={ENLACE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex items-center gap-3.5 rounded-[2px_4px] border-l-2 border-[#2db742] bg-[#f5f7f9] px-3 py-3 text-[#0a559a]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png" alt="" width={40} height={40} />
              </span>
              <span className="flex-1">
                <span className="block text-[14px] leading-[17px] text-[#363c47]">Diluvium</span>
                <span className="block text-[11px] leading-[14px] text-[#989b9f]">Mensaje de WhatsApp</span>
              </span>
              <LogoWhatsapp className="h-6 w-6 text-[#2db742]" />
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label={abierto ? "Cerrar chat de WhatsApp" : "Abrir chat de WhatsApp"}
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2db742] text-white shadow-[0_6px_8px_2px_rgba(0,0,0,0.14)]"
      >
        {abierto ? <IconoCerrar tamano={26} /> : <LogoWhatsapp className="h-8 w-8" />}
      </button>
    </div>
  );
}
