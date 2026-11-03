"use client";

import { IconoFlechaArriba } from "@/components/comunes/Iconos";

export function BotonArriba() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex h-10 items-center gap-1 border border-white/30 bg-azul-oscuro px-5 py-1.5 font-titulo text-base font-medium text-white"
    >
      Volver arriba
      <IconoFlechaArriba tamano={16} />
    </button>
  );
}
