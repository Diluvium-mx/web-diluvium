"use client";

// Ventana con la guía para medir la entrada y la tabla de tamaños (la misma imagen que se manda por WhatsApp y que
// abre «¿Qué tamaño necesito?» en la ficha). Es un <dialog>: atrapa el foco, se cierra con Esc, con la × o tocando
// fuera, y regresa el foco al botón que la abrió. Abrirla cuenta como «abre_tabla».

import Image from "next/image";
import { useRef } from "react";
import { IconoTache } from "./piezas";

export function TablaMedidas({ texto, className }: { texto: string; className: string }) {
  const ventana = useRef<HTMLDialogElement>(null);
  const cerrar = () => ventana.current?.close();
  return (
    <>
      <button type="button" data-evento="abre_tabla" aria-haspopup="dialog" onClick={() => ventana.current?.showModal()} className={className}>
        {texto}
      </button>
      <dialog
        ref={ventana}
        aria-labelledby="tabla-medidas-titulo"
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="version m-auto max-h-[92dvh] w-[min(92vw,520px)] max-w-none overflow-y-auto rounded-2xl bg-white p-0 text-marino"
      >
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-linea bg-white py-3 pr-3 pl-6">
          <h2 id="tabla-medidas-titulo" className="titulo-ancho m-0 text-xl">
            ¿Qué tamaño necesito?
          </h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>
        <div className="grid gap-5 px-6 pt-5 pb-7 text-[16px] leading-6 text-tinta">
          <div>
            <h3 className="m-0 mb-1 font-titulo text-lg font-bold text-marino">1. Mide el ancho de tu entrada</h3>
            <p className="m-0">
              De marco a marco o de pared a pared. Elige un marco firme donde la compuerta pueda hacer presión y deja
              4 cm para su grosor.
            </p>
          </div>
          <Image
            src="/media/files/puerta_buena.jpg"
            alt="Puerta con la flecha que marca dónde medir el ancho, de marco a marco"
            width={1280}
            height={1376}
            sizes="(min-width: 640px) 472px, calc(92vw - 48px)"
            className="mx-auto h-auto w-full max-w-[360px] rounded-xl"
          />
          <h3 className="m-0 font-titulo text-lg font-bold text-marino">2. Encuentra tu tamaño en la tabla</h3>
          <Image
            src="/media/files/Frame_767.jpg"
            alt="Tabla de tamaños: XCH de 69 a 78 cm, CH de 79 a 90 cm, M de 91 a 100 cm, G de 101 a 110 cm y XG de 111 a 120 cm"
            width={549}
            height={941}
            sizes="(min-width: 640px) 472px, calc(92vw - 48px)"
            className="mx-auto h-auto w-full max-w-[360px] rounded-xl"
          />
        </div>
      </dialog>
    </>
  );
}
