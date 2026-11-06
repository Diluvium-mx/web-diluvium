"use client";

// Grupo de opciones con botón redondo (forma de pago, dirección de facturación, método de envío), como en vivo: renglones
// con borde gris; el elegido lleva borde azul y fondo azul muy claro, y si tiene contenido (los campos de la tarjeta, el
// aviso de PayPal) se abre debajo en gris. Las flechas del teclado cambian de opción (botones de radio nativos).

import type { ReactNode } from "react";
import { Redondo } from "./Campos";

export type Opcion<T extends string> = {
  valor: T;
  etiqueta: string;
  /** Logotipos o precio a la derecha. */
  derecha?: ReactNode;
  /** Alto del renglón (sin bordes), medido en vivo. */
  alto: number;
  /** Lo que se abre debajo al elegirla. */
  contenido?: ReactNode;
};

export function GrupoOpciones<T extends string>({
  nombre,
  titulo,
  opciones,
  elegido,
  alElegir,
  className = "",
}: {
  nombre: string;
  /** id del título que nombra al grupo. */
  titulo?: string;
  opciones: Opcion<T>[];
  elegido: T;
  alElegir: (valor: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={titulo} className={className}>
      {opciones.map((o, i) => {
        const marcado = o.valor === elegido;
        const abierto = marcado && Boolean(o.contenido);
        const ultima = i === opciones.length - 1;
        const anterior = opciones[i - 1];
        // El elegido sin contenido ya dibuja su borde de abajo en azul: el siguiente renglón no repite la línea.
        const sinBordeArriba = !marcado && anterior && anterior.valor === elegido && !anterior.contenido;
        const id = `${nombre}-${o.valor}`;
        return (
          <div key={o.valor}>
            <label
              htmlFor={id}
              className={[
                "flex cursor-pointer items-center gap-[10px] border-x px-[14px]",
                marcado ? "border-y border-acento bg-elegido" : "border-borde bg-white",
                !marcado && !sinBordeArriba ? "border-t" : "",
                i === 0 ? "rounded-t-[12px]" : "",
                ultima && !abierto ? "rounded-b-[12px]" : "",
                ultima && !abierto && !marcado ? "border-b" : "",
              ].join(" ")}
            >
              <span className="flex w-full items-center gap-[10px]" style={{ height: o.alto }}>
                <Redondo id={id} name={nombre} marcado={marcado} alElegir={() => alElegir(o.valor)} />
                <span className="min-w-0 flex-1 text-[14px] leading-[18.9px] font-semibold">{o.etiqueta}</span>
                {o.derecha}
              </span>
            </label>
            {abierto && (
              <div className={`border-x border-borde bg-gris ${ultima ? "rounded-b-[12px] border-b" : ""}`}>{o.contenido}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Aviso dentro de una opción abierta («Se te redirigirá a PayPal…»). */
export function AvisoOpcion({ children }: { children: ReactNode }) {
  return <p className="px-[14px] py-[13.5px] text-center text-[14px] leading-[18.9px]">{children}</p>;
}
