// Piezas comunes de la versión C (24-nov-2026): una página completamente nueva, distinta de la tienda de hoy (A) y de
// B1. Estilo «tormenta de noche»: azul marino muy oscuro, azul agua para los acentos y el naranja de la marca solo en
// los botones de comprar. Tarjetas muy redondeadas y etiquetas en mayúsculas. Sin las olas entre partes de B.

export const C = {
  noche: "#06182f",
  noche2: "#0b2546",
  agua: "#3fa9f5",
  aguaClara: "#d8ecfd",
};

/** Botón principal (comprar): naranja, ancho completo en celular. */
export const BOTON_C =
  "inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-boton px-8 text-center font-titulo text-[17px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(248,160,29,0.9)] transition-[background-color,transform] hover:bg-boton-encima active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

/** Botón secundario sobre fondo oscuro. */
export const BOTON_C_CLARO =
  "inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-white/30 px-7 text-center font-titulo text-[16px] font-medium text-white transition-colors hover:border-white hover:bg-white/10";

/** Etiqueta de sección: pequeña, en mayúsculas, azul agua. */
export function Etiqueta({ children, oscuro = false }: { children: React.ReactNode; oscuro?: boolean }) {
  return <p className={`m-0 font-titulo text-[13px] font-semibold tracking-[0.16em] uppercase ${oscuro ? "text-[#7cc4fa]" : "text-[#1b7fd1]"}`}>{children}</p>;
}

/** Fondo de una parte de C: «noche» (oscuro) o «claro» (blanco azulado). */
export function claseFondoC(fondo: unknown): string {
  return fondo === "noche" ? "bg-[#06182f] text-white" : fondo === "blanco" ? "bg-white text-tinta" : "bg-[#eef5fc] text-tinta";
}

/** Una estrella llena (para calificaciones). */
export function EstrellaC({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
    </svg>
  );
}
