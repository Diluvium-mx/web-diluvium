"use client";

// Franja de texto que corre (sección «running-content»: encabezado y varias páginas). Velocidad en píxeles por
// segundo, como el ajuste «speed» del tema; se pausa al pasar el mouse.

import { useEffect, useRef } from "react";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, texto } from "@/lib/contenido";
import { IconoPuntos } from "@/components/comunes/Iconos";
import { TextoRico } from "@/components/comunes/Texto";

const COPIAS = 6;

export function FranjaMensajes({ seccion }: { seccion: Seccion }) {
  const pista = useRef<HTMLDivElement>(null);
  const velocidad = numero(seccion.ajustes, "speed", 50);

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

  const elementos = seccion.bloques.map((b) =>
    b.tipo === "icon" ? (
      <IconoPuntos key={b.id} className="h-[1.25em] w-[1.25em] shrink-0" />
    ) : (
      <TextoRico
        key={b.id}
        html={texto(b.ajustes, "promotion_text")}
        className="shrink-0 whitespace-nowrap text-center font-titulo font-medium [&_p]:m-0"
      />
    ),
  );

  return (
    <div
      className={`franja ${esquema(seccion.ajustes, "scheme-3")} overflow-hidden py-[21.33px] text-[length:var(--h6)] leading-[1.25] md:py-[22.75px]`}
      data-seccion="running-content"
    >
      <div ref={pista} className="flex w-max">
        {Array.from({ length: COPIAS }, (_, i) => (
          <div key={i} className="franja-pista flex shrink-0 items-center gap-4 pr-4 md:gap-8 md:pr-8" aria-hidden={i > 0}>
            {elementos}
          </div>
        ))}
      </div>
    </div>
  );
}
