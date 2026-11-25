// Piezas comunes de la versión C. Desde el 25-nov-2026 C está pensada para el cliente ideal de Diluvium: personas de
// 40 a 60 años que la abren desde el celular (estudio de andafacil.com, docs/estudio-andafacil.md). Por eso:
//   - fondo claro y mucho contraste (azul marino casi negro sobre blanco o azul muy claro);
//   - letra de 18 px para leer y títulos grandes; etiquetas sin mayúsculas forzadas;
//   - botones de 60 px de alto, a todo lo ancho en el celular;
//   - nada que se mueva solo ni que haya que arrastrar con precisión;
//   - WhatsApp y teléfono siempre a la mano (te contesta una persona).
// Se le habla de «tú» (dueño, 25-nov-2026). Formas de pago: las mismas de B (tarjeta de crédito o débito con hasta 6
// meses sin intereses, PayPal, y transferencia o depósito por WhatsApp); no hay pago contra entrega.

export const TINTA_C = "#06182f";

/** Botón principal (comprar): naranja de la marca, grande, a todo lo ancho en el celular. */
export const BOTON_C =
  "inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-boton px-7 text-center font-titulo text-[19px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(248,160,29,0.9)] transition-colors hover:bg-boton-encima active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

/** Botón de contorno azul marino. */
export const BOTON_C_SEC =
  "inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-[2.5px] border-[#06182f] bg-white px-7 text-center font-titulo text-[18px] font-medium text-[#06182f] transition-colors hover:bg-[#06182f] hover:text-white sm:w-auto";

/** Botón verde de WhatsApp (letra blanca: contraste alto). */
export const BOTON_WHATSAPP_C =
  "inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#1a7f37] px-7 text-center font-titulo text-[18px] font-medium text-white transition-colors hover:bg-[#156c2e] sm:w-auto";

/** Etiqueta arriba del título: corta, en azul, sin mayúsculas forzadas (se lee mejor). */
export function Etiqueta({ children, oscuro = false }: { children: React.ReactNode; oscuro?: boolean }) {
  return <p className={`m-0 font-titulo text-[16px] font-semibold ${oscuro ? "text-[#9fd2fb]" : "text-[#1663a8]"}`}>{children}</p>;
}

/** Título de cada parte de C. */
export const TITULO_C = "titulo-version m-0 mt-1.5 text-[30px] leading-[1.15] md:text-[42px]";

/** Fondo de una parte de C: «claro» (azul muy claro, por omisión), «blanco» o «noche» (azul marino). */
export function claseFondoC(fondo: unknown): string {
  return fondo === "noche" ? "bg-[#06182f] text-white" : fondo === "blanco" ? "bg-white text-[#1f2d3d]" : "bg-[#f3f8fd] text-[#1f2d3d]";
}

/** Una estrella llena (para calificaciones). */
export function EstrellaC({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
    </svg>
  );
}

/** Ícono de teléfono. */
export function IconoTelefono({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

/** Palomita en círculo (para listas de beneficios). */
export function PalomitaC({ className = "size-7" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#1663a8] text-white ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
