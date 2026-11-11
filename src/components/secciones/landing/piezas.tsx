// Piezas chicas que comparten las secciones de las versiones: botón principal, estrellas e íconos.

import Image from "next/image";
import { medidasImagen } from "../ImagenBanner";

/** Botón principal (naranja de la marca con texto tinta: 6.2:1). */
export const CLASE_BOTON =
  "inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-boton px-7 py-3 text-center font-titulo text-[17px] leading-tight font-bold text-tinta [font-stretch:110%] shadow-[0_8px_20px_-10px_rgba(222,140,17,0.9)] transition-[background-color,transform] duration-200 hover:bg-boton-encima active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

/** Enlace de texto (WhatsApp, «¿Cómo medir?»…): subrayado y con área de toque de 44 px. */
export const CLASE_ENLACE =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4";

export function Estrellas({ className = "size-[18px]" }: { className?: string }) {
  return (
    <span className="inline-flex text-estrella" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={className} fill="currentColor" focusable="false">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/** «★★★★★ 4.9 · más de 200 reseñas»: las estrellas son adorno, el texto lo dice todo. */
export function Calificacion({ texto, className = "" }: { texto: string; className?: string }) {
  if (!texto) return null;
  return (
    <p className={`m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] leading-5 font-semibold ${className}`}>
      <Estrellas />
      <span>{texto}</span>
    </p>
  );
}

export function IconoFlecha({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconoPalomita({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconoTache({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

export function IconoWhatsapp({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

/** Foto con su proporción real (reserva el espacio: sin saltos al cargar). Los SVG van sin optimizar. */
export function Foto({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (!src) return null;
  const { ancho, alto } = medidasImagen(src);
  const svg = /\.svg$/i.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      width={svg ? 128 : ancho}
      height={svg ? 128 : alto}
      sizes={sizes}
      unoptimized={svg}
      className={className}
    />
  );
}

/** ¿El enlace sale a WhatsApp? (para medirlo como «toca_whatsapp»). */
export function esWhatsapp(enlace: string): boolean {
  return /whatsapp|wa\.me/i.test(enlace);
}
