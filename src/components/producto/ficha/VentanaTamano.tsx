"use client";

// Ventana «¿Qué tamaño necesito?» (bloque «popup_content»): el enlace naranja abre un panel que sale por la derecha
// (abajo en celular) con la guía para medir la entrada. Se cierra con la ×, con Esc o tocando fuera.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconoCerrar } from "./Iconos";

// Contenido de la página «preguntas-frecuentes» de la tienda, que es lo que muestra esta ventana (3-nov-2026).
function GuiaTamanos() {
  return (
    <div className="[&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[length:var(--h2)] [&_h4]:mt-8 [&_h4]:mb-4 [&_h4]:text-[length:var(--h4)] [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:rounded-[16px] [&_p]:mb-8 [&_p:last-child]:mb-0">
      <h2>1. Mide la anchura de tu entrada</h2>
      <blockquote className="m-0 mb-8 rounded-[10px] bg-[rgba(10,85,154,0.04)] p-6">
        <h4>Elige un marco firme donde pueda hacer presión la compuerta</h4>
      </blockquote>
      <p>
        <Image src="/media/files/puerta_buena.jpg" alt="" width={436} height={469} sizes="(min-width: 768px) 352px, calc(100vw - 96px)" />
      </p>
      <h2>
        <strong>2. Encuentra tu tamaño en la siguiente tabla:</strong>
      </h2>
      <p>
        <Image src="/media/files/Frame_767.jpg" alt="" width={511} height={876} sizes="(min-width: 768px) 352px, calc(100vw - 96px)" />
      </p>
    </div>
  );
}

export function VentanaTamano({ titulo }: { titulo: string }) {
  const [abierta, setAbierta] = useState(false);
  const abrir = useRef<HTMLButtonElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierta) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Se enfoca la × cuando la ventana ya empezó a verse (antes sigue oculta y no recibe el foco).
    const marco = window.setTimeout(() => cerrar.current?.focus({ preventScroll: true }), 50);
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("keydown", alTeclear);
    const boton = abrir.current;
    return () => {
      window.clearTimeout(marco);
      document.body.style.overflow = antes;
      document.removeEventListener("keydown", alTeclear);
      boton?.focus({ preventScroll: true });
    };
  }, [abierta]);

  return (
    <>
      <button
        ref={abrir}
        type="button"
        onClick={() => setAbierta(true)}
        aria-haspopup="dialog"
        className="relative z-[1] inline-flex min-h-10 cursor-pointer items-center justify-center py-1.5 font-titulo leading-[normal] font-medium text-naranja underline decoration-1 transition-all duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
      >
        {titulo}
      </button>
      <div
        className={`fixed inset-0 z-[9] flex items-end justify-end overflow-hidden bg-[rgba(23,22,26,0.5)] p-6 transition-all duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] md:items-center md:p-12 min-[1025px]:p-16 ${
          abierta ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={(e) => e.target === e.currentTarget && setAbierta(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          className={`h-full max-w-full overflow-x-hidden overflow-y-auto bg-white transition-[width] delay-[250ms] duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            abierta ? "w-full md:w-[400px]" : "w-0"
          }`}
        >
          <div className="flex h-full w-[calc(100vw-48px)] max-w-full flex-col md:w-[400px]">
            <div className="sticky top-0 z-[4] flex items-center justify-between gap-2 bg-white py-3 pr-3 pl-6 md:gap-3 min-[1025px]:gap-4">
              <h3
                className={`m-0 flex-1 text-[length:var(--h6)] transition-opacity duration-[250ms] ${abierta ? "opacity-100 delay-500" : "opacity-0"}`}
              >
                {titulo}
              </h3>
              <button
                ref={cerrar}
                type="button"
                onClick={() => setAbierta(false)}
                aria-label="Cerrar Modal"
                className={`relative z-[1] flex size-10 cursor-pointer items-center justify-center transition-opacity duration-[250ms] min-[1025px]:size-11 ${
                  abierta ? "opacity-100 delay-500" : "opacity-0"
                }`}
              >
                <IconoCerrar ancho={20} className="min-[1025px]:size-6" />
              </button>
            </div>
            <div className={`px-6 py-3 transition-opacity duration-[250ms] ${abierta ? "opacity-100 delay-500" : "opacity-0"}`}>
              <GuiaTamanos />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
