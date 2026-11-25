// Estilos de las páginas secundarias de C y D (25-nov-2026). Las dos son para el cliente ideal (40 a 60 años, en el
// celular): letra de 18 px o más, botones de 56 px o más y mucho contraste. Se ven distintas:
//   C: fondos azul muy claro, esquinas muy redondas, etiqueta azul arriba del título (comun.tsx de C).
//   D: blanco con azul marino y una rayita amarilla debajo de cada título (como una tienda grande: andafacil.com),
//      tarjetas con borde fino y sombra suave, migas de pan arriba del título. Usa los botones y fondos de d/comun.tsx.
// En los dos, comprar es naranja (el de la marca) y WhatsApp verde.

import type { ReactNode } from "react";
import { BOTON_C, BOTON_C_SEC, BOTON_WHATSAPP_C, claseFondoC, Etiqueta, TITULO_C } from "../c/comun";
import type { ClasesFormulario } from "../landing/FormularioVersion";
import { BOTON_D, BOTON_D_MARINO, BOTON_D_WHATSAPP, claseFondoD, EtiquetaD } from "../d/comun";

export type Estilo = "c" | "d";

export const MARINO_D = "#0b2545";
export const AMARILLO_D = "#ffc83d";

/** Fondo de una parte. C: «claro» (por omisión), «blanco» o «noche». D: «blanco» (por omisión), «gris» o «marino». */
export function claseFondo(estilo: Estilo, fondo: unknown): string {
  if (estilo === "c") return claseFondoC(fondo || "claro");
  return claseFondoD(fondo === "azul" ? "marino" : fondo);
}

export const ESTILOS = {
  c: {
    seccion: "py-12 md:py-20",
    h1: "titulo-version m-0 mt-1.5 text-[36px] leading-[1.1] text-[#06182f] md:text-[52px]",
    h2: `${TITULO_C} text-[#06182f]`,
    h3: "titulo-version m-0 text-[25px] leading-[1.2] text-[#06182f] md:text-[30px]",
    texto: "text-[19px] leading-[1.6] text-[#1f2d3d]",
    suave: "text-[#45566a]",
    tarjeta: "rounded-3xl bg-white shadow-[0_14px_40px_-30px_rgba(6,24,47,0.6)]",
    borde: "rounded-3xl border-2 border-[#dbe7f3] bg-white",
    foto: "rounded-3xl",
    enlace: "font-semibold text-[#1663a8] underline decoration-2 underline-offset-4",
    boton: BOTON_C,
    botonSec: BOTON_C_SEC,
    whatsapp: BOTON_WHATSAPP_C,
    icono: "bg-[#eaf4fd] text-[#1663a8]",
    insignia: "bg-[#1663a8] text-white",
  },
  d: {
    seccion: "py-12 md:py-20",
    h1: "titulo-version m-0 mt-1.5 text-[36px] leading-[1.1] text-[#0b2545] md:text-[50px]",
    h2: "titulo-version m-0 mt-1.5 text-[30px] leading-[1.15] text-[#0b2545] md:text-[40px]",
    h3: "titulo-version m-0 text-[24px] leading-[1.2] text-[#0b2545] md:text-[28px]",
    texto: "text-[19px] leading-[1.6] text-[#1f2a37]",
    suave: "text-[#4a5568]",
    tarjeta: "rounded-xl border border-[#dde2e8] bg-white shadow-[0_10px_28px_-20px_rgba(11,37,69,0.45)]",
    borde: "rounded-xl border border-[#dde2e8] bg-white",
    foto: "rounded-xl",
    enlace: "font-semibold text-[#0b2545] underline decoration-[#ffc83d] decoration-[3px] underline-offset-4",
    boton: BOTON_D,
    botonSec: BOTON_D_MARINO,
    whatsapp: BOTON_D_WHATSAPP,
    icono: "bg-[#fff4d1] text-[#0b2545]",
    insignia: "bg-[#ffc83d] text-[#0b2545]",
  },
} as const;

/** Campos del formulario de contacto en C y D: grandes, con borde grueso. */
export function clasesFormulario(estilo: Estilo): ClasesFormulario {
  return {
    campo: `block w-full ${estilo === "c" ? "rounded-2xl" : "rounded-xl"} border-2 border-[#9fb3c8] bg-white px-4 text-[18px] text-[#06182f] focus:border-[#06182f] focus:outline-3 focus:outline-offset-1 focus:outline-[#1663a8]/40`,
    etiqueta: "mb-2 block text-[17px] font-bold text-[#06182f]",
    boton: ESTILOS[estilo].boton,
  };
}

/** Lo que va arriba del título: en C la etiqueta azul; en D la etiqueta en mayúsculas (la de las piezas de D). */
export function Arriba({ estilo, children, oscuro = false }: { estilo: Estilo; children?: ReactNode; oscuro?: boolean }) {
  if (!children) return null;
  return estilo === "c" ? <Etiqueta oscuro={oscuro}>{children}</Etiqueta> : <EtiquetaD oscuro={oscuro}>{children}</EtiquetaD>;
}

/** En D, la rayita amarilla debajo de cada título (como en las piezas de D); en C, nada. */
export function Raya({ estilo }: { estilo: Estilo }) {
  return estilo === "d" ? <span className="mt-3 block h-1.5 w-16 rounded-full bg-[#ffc83d]" aria-hidden="true" /> : null;
}

/** Flecha «›» para botones y migas de pan. */
export function Flecha({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Calificación de C y D: el número primero, luego las estrellas y el texto (dueño, 25-nov-2026). */
export function Calificacion({ numero, texto, chica = false }: { numero: string; texto: string; chica?: boolean }) {
  return (
    <span className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold text-[#06182f] ${chica ? "text-[15px]" : "text-[17px]"}`}>
      <strong className={`font-titulo leading-none ${chica ? "text-[18px]" : "text-[22px]"}`}>{numero}</strong>
      <span className="flex text-estrella" role="img" aria-label={`${numero} de 5 estrellas`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 20 20" className={chica ? "size-4" : "size-5"} fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
          </svg>
        ))}
      </span>
      <span className="font-normal text-[#45566a]">{texto}</span>
    </span>
  );
}
