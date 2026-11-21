"use client";

// Botón «Ver tabla de medidas» de los pasos clave (Producto 156, dueño 21-nov-2026): abre una ventana solo con la tabla
// de tamaños y su flecha que baja tamaño por tamaño (la misma tabla de los pasos, 293). Abrirla cuenta como «abre_tabla».

import { useRef } from "react";
import { IconoTache } from "./piezas";
import { TablaAnimada, type TamanoPaso } from "./PasosMedir";

export function VentanaTabla({ texto, className, tamanos }: { texto: string; className: string; tamanos: TamanoPaso[] }) {
  const ventana = useRef<HTMLDialogElement>(null);
  const cerrar = () => ventana.current?.close();
  return (
    <>
      <button type="button" data-evento="abre_tabla" aria-haspopup="dialog" onClick={() => ventana.current?.showModal()} className={className}>
        {texto}
      </button>
      <dialog
        ref={ventana}
        aria-label="Tabla de tamaños"
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="version m-auto w-[min(94vw,420px)] max-w-none rounded-2xl bg-white p-0 text-marino backdrop:bg-tinta/70"
      >
        <div className="flex items-center justify-between border-b border-linea py-2.5 pr-2 pl-5">
          <h2 className="titulo-ancho m-0 text-[20px]">Tabla de tamaños</h2>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>
        <div className="px-4 pt-4 pb-5">
          <TablaAnimada tamanos={tamanos} />
          <p className="m-0 mt-3 text-center text-[15px] text-texto-suave">Mide el ancho de tu entrada de marco a marco.</p>
        </div>
      </dialog>
    </>
  );
}
