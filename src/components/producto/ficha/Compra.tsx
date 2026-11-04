"use client";

// Cantidad y botón «Añadir al carrito», como en la tienda: agrega la variante elegida al carrito y abre el carrito
// lateral. Si se piden más piezas de las que hay, agrega las que alcanzan, avisa arriba de la cantidad y no abre el
// carrito (igual que en vivo).

import { useState } from "react";
import { abrirCarrito, agregar, avisoExistencias } from "@/components/carrito/estado";
import { AvisoError } from "@/components/carrito/piezas";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "../estilos";
import { puedeComprarse, useFicha } from "./Estado";
import { IconoMas, IconoMenos } from "./Iconos";

const BOTON_CANTIDAD =
  "relative z-[1] flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-azul transition-colors " +
  "duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] hover:bg-[rgba(10,85,154,0.08)] focus-visible:outline-2 " +
  "focus-visible:outline-azul min-[1025px]:size-10";

export function Compra({ titulo }: { titulo: string }) {
  const { variantes, elegida, cantidad, setCantidad } = useFicha();
  const agotada = !puedeComprarse(variantes[elegida]);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (agotada) return;
        const { tope } = agregar(variantes[elegida].id, cantidad);
        if (tope === null) {
          setAviso(null);
          abrirCarrito({ anadido: true });
        } else {
          setAviso(avisoExistencias(tope));
        }
      }}
    >
      {aviso && (
        <AvisoError>
          <span>{aviso}</span>
        </AvisoError>
      )}
      <div className="flex w-full flex-col items-start">
        <div className="flex w-full flex-col gap-3">
          <div>
            <label htmlFor="cantidad-ficha" className="sr-only">
              Cantidad:
            </label>
            <div className="inline-flex items-center justify-center overflow-hidden border border-[rgba(10,85,154,0.12)] bg-white">
              <button type="button" className={BOTON_CANTIDAD} aria-label="Menos" onClick={() => setCantidad(Math.max(1, cantidad - 1))}>
                <IconoMenos ancho={16} className="min-[1025px]:size-5" />
              </button>
              <input
                id="cantidad-ficha"
                type="number"
                inputMode="numeric"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
                aria-label={`Cantidad de ${titulo}`}
                className="size-11 appearance-none border-0 bg-white px-0.5 py-px text-center text-base text-azul outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button type="button" className={BOTON_CANTIDAD} aria-label="Más" onClick={() => setCantidad(cantidad + 1)}>
                <IconoMas ancho={16} className="min-[1025px]:size-5" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            name="add"
            disabled={agotada}
            className={`${BOTON_PRIMARIO} ${BOTON_GRANDE} w-full rounded-[4px] leading-[normal] disabled:cursor-not-allowed disabled:border-0 disabled:bg-[rgba(0,0,0,0.12)] disabled:text-[rgba(255,255,255,0.4)] disabled:opacity-100 disabled:pointer-events-auto disabled:after:hidden`}
          >
            <span className="relative flex items-center justify-center text-center break-words">
              {agotada ? "Agotado" : "Añadir al carrito"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
