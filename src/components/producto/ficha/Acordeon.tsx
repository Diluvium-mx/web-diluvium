"use client";

// Pestaña que se abre y se cierra (bloque «collapsible_item»): ícono, título en negritas y flecha que gira. El
// contenido baja en 0.15 s, como en la tienda; cada pestaña se abre por su cuenta.

import { useId, useRef, useState, type ReactNode } from "react";
import { IconoFlechaAbajo } from "./Iconos";

export function Acordeon({
  titulo,
  icono,
  abierto: abiertoInicial = false,
  children,
}: {
  titulo: string;
  icono?: ReactNode;
  abierto?: boolean;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const [alto, setAlto] = useState<number | null>(null);
  const contenido = useRef<HTMLDivElement>(null);
  const id = useId();

  function alternar() {
    setAlto(contenido.current?.scrollHeight ?? null);
    setAbierto((a) => !a);
  }

  return (
    <div className="overflow-hidden rounded-[16px] px-4 py-2 transition-all duration-[250ms]">
      <div className="break-words">
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={alternar}
          className="relative flex h-10 w-full cursor-pointer items-center gap-3 p-0 text-left text-azul transition-all duration-150 focus-visible:outline-2 focus-visible:outline-azul"
        >
          <span className="flex flex-1 items-start">
            {icono && <span className="inline-block pr-1">{icono}</span>}
            <span className="flex-1 leading-[normal] font-bold">{titulo}</span>
          </span>
          <span className="relative flex size-10 items-center justify-center p-2.5">
            <IconoFlechaAbajo ancho={20} className={`transition-transform duration-150 ${abierto ? "rotate-180" : ""}`} />
          </span>
        </button>
      </div>
      <div
        id={id}
        ref={contenido}
        role="region"
        className={`overflow-hidden transition-all duration-150 ${abierto ? "visible mt-2 md:mt-3 min-[1025px]:mt-4" : "invisible mt-0"}`}
        style={{ maxHeight: abierto ? (alto ?? "none") : 0 }}
      >
        {children}
      </div>
    </div>
  );
}
