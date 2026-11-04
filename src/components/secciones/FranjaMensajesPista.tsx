"use client";

// Pista que corre de la franja de mensajes (la usa FranjaMensajes). Repite el contenido varias veces y ajusta la
// duración para que avance a «velocidad» píxeles por segundo, como el ajuste «speed» del tema.

import { useEffect, useRef } from "react";

const COPIAS = 6;

export function FranjaPista({ velocidad, children }: { velocidad: number; children: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const ajustar = () => {
      const ancho = el.firstElementChild?.getBoundingClientRect().width ?? 0;
      if (ancho > 0) el.style.setProperty("--duracion", `${ancho / velocidad}s`);
    };
    ajustar();
    const observador = new ResizeObserver(ajustar);
    observador.observe(el);
    return () => observador.disconnect();
  }, [velocidad]);

  return (
    <div ref={pista} className="flex w-max">
      {Array.from({ length: COPIAS }, (_, i) => (
        <div key={i} className="franja-pista flex shrink-0 items-center gap-4 pr-4 md:gap-6 md:pr-6 min-[1025px]:gap-8 min-[1025px]:pr-8" aria-hidden={i > 0}>
          {children}
        </div>
      ))}
    </div>
  );
}
