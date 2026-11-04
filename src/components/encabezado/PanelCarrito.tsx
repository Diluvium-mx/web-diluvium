"use client";

// Carrito lateral que abre la bolsa del encabezado (sale por la derecha). Hoy siempre está vacío, igual que se ve en
// vivo sin productos: «Carrito 0», «Su carrito está vacío» y «Seguir comprando». Paso 3: carrito (artículos,
// cantidades, totales y pago).

import Link from "next/link";
import { useEffect } from "react";
import { IconoEquis } from "@/components/producto/IconosColeccion";
import { useAparecer } from "./useAparecer";

// Paso 3: carrito. Mientras no exista, siempre está vacío.
const ARTICULOS = 0;

export function PanelCarrito({ cerrar }: { cerrar: () => void }) {
  const visible = useAparecer();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  return (
    <div
      className={`fixed inset-0 z-50 p-6 text-azul transition-opacity duration-250 md:p-12 min-[1025px]:p-16 ${visible ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito"
    >
      <button type="button" className="fixed inset-0 bg-[rgba(23,22,26,0.5)]" aria-label="Cerrar" tabIndex={-1} onClick={cerrar} />
      <div className="flex h-full w-full justify-end">
        <div
          className={`relative grid h-full grid-rows-[auto_1fr] overflow-hidden bg-white transition-[width] delay-250 duration-250 ease-[cubic-bezier(0.2,0.7,0.1,1)] ${visible ? "w-full md:w-[400px]" : "w-0"}`}
        >
          <div className="grid min-w-[294px] grid-cols-[1fr_auto] items-center gap-3 py-3 pr-3 pl-6">
            <div className="flex items-center gap-x-2.5">
              <h2 className="m-0" style={{ fontSize: "var(--h6)" }}>
                Carrito
              </h2>
              <span className="flex size-8 items-center justify-center bg-azul text-white">{ARTICULOS}</span>
            </div>
            <button type="button" className="flex size-9 items-center justify-center min-[1025px]:size-10" aria-label="Cerrar" onClick={cerrar}>
              <IconoEquis className="size-4 min-[1025px]:size-5" />
            </button>
          </div>
          <div className="flex min-w-[294px] overflow-y-auto px-6 py-3">
            <div className="flex w-full flex-col items-center justify-center text-center">
              <p className="mb-8">Su carrito está vacío</p>
              <Link
                href="/collections/all"
                onClick={cerrar}
                className="flex min-h-10 items-center justify-center border border-naranja bg-naranja px-6 py-1.5 font-titulo font-medium text-white min-[1025px]:min-h-11"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
