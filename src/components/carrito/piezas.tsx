"use client";

// Piezas que comparten el carrito lateral y la página /cart: barra de envío gratis, campo de piezas, aviso de
// existencias, notas del pedido y la nota de impuestos. Medidas tomadas de la tienda en vivo (4-nov-2026).

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { precioTexto } from "@/components/producto/formato-precio";
import { IconoMas, IconoMenos } from "@/components/producto/ficha/Iconos";
import { ENVIO_GRATIS_DESDE } from "./catalogo";

type PropsIcono = { className?: string };

/** Bote de basura (quitar la línea), trazo de 2 px en caja de 25×24 como los demás íconos de la página. */
export function IconoBasura({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 25 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true" focusable="false">
      <path d="M5 6.3h14.8M10.5 3h4" strokeLinecap="square" />
      <path d="M6.6 9.8V19a2.2 2.2 0 0 0 2.2 2.2h7.4a2.2 2.2 0 0 0 2.2-2.2V6.4" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M10.5 12.3v4M14.5 12.3v4" strokeLinecap="square" />
    </svg>
  );
}

/** «i» dentro de un círculo, blanco, para los avisos de error (16 px). */
export function IconoAviso({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.4} className={className} aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.2" />
      <path d="M8 7v4.2" />
      <circle cx="8" cy="4.9" r=".45" fill="currentColor" />
    </svg>
  );
}

/** Mensaje de envío gratis con su barra (se llena hasta $499). */
export function BarraEnvioGratis({ total }: { total: number }) {
  const falta = ENVIO_GRATIS_DESDE - total;
  return (
    <div>
      <span className="mb-2 block">
        {falta > 0 ? (
          <>
            Está a <b>{precioTexto(falta)}</b> de envío gratuito
          </>
        ) : (
          "¡Buenas noticias! Tu pedido califica para envío gratis."
        )}
      </span>
      <span className="flex w-full items-center">
        <progress
          value={Math.min(total, ENVIO_GRATIS_DESDE)}
          max={ENVIO_GRATIS_DESDE}
          aria-label="Envío gratis"
          className="mr-3 block h-3 min-w-0 flex-1 appearance-none overflow-hidden rounded-[10px] border-0 bg-current/12 [&::-moz-progress-bar]:rounded-[10px] [&::-moz-progress-bar]:bg-azul-oscuro [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-[10px] [&::-webkit-progress-value]:bg-azul-oscuro"
        />
        <span className="text-[13.6px] leading-[17px]">{precioTexto(ENVIO_GRATIS_DESDE)}</span>
      </span>
    </div>
  );
}

/**
 * Menos · número · más. El número se puede escribir: se aplica al salir del campo o con Enter (0 quita la línea).
 * Tamaños: «lateral» (cuadros de 40 px con 8 px entre ellos) y «pagina» (cuadros de 32 px, juntos).
 */
export function CampoCantidad({
  cantidad,
  titulo,
  cambiar,
  tamano,
  id,
}: {
  cantidad: number;
  titulo: string;
  cambiar: (n: number) => void;
  tamano: "lateral" | "pagina";
  id: string;
}) {
  const [borrador, setBorrador] = useState<string | null>(null);
  const lateral = tamano === "lateral";
  // Lateral: botones de 36 px con ícono de 16 (40 px y 20 desde 1025 px) y número de 40 px. Página: todo de 32 px.
  const cuadro = lateral ? "size-9 min-[1025px]:size-10" : "size-8";
  const icono = lateral ? "size-4 min-[1025px]:size-5" : "size-4";
  const boton = `${cuadro} relative flex shrink-0 cursor-pointer items-center justify-center font-titulo font-medium focus-visible:outline-2 focus-visible:outline-azul`;
  const aplicar = () => {
    if (borrador === null) return;
    const n = Math.floor(Number(borrador));
    setBorrador(null);
    if (Number.isFinite(n) && n >= 0 && n !== cantidad) cambiar(n);
  };
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        Cantidad
      </label>
      <div
        className={`mr-2 inline-flex items-center justify-center overflow-hidden border border-current/12 bg-white ${lateral ? "gap-2" : ""}`}
      >
        <button type="button" className={boton} name="minus" onClick={() => cambiar(cantidad - 1)} aria-label={lateral ? undefined : "Menos"}>
          {lateral && <span className="sr-only">disminuir</span>}
          <IconoMenos ancho={16} className={icono} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={borrador ?? cantidad}
          onChange={(e) => setBorrador(e.target.value)}
          onBlur={aplicar}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), aplicar())}
          aria-label={`Cantidad de ${titulo}`}
          className={`${lateral ? "size-10" : "size-8"} appearance-none border-0 bg-white px-0.5 py-px text-center text-base outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${lateral ? "bg-transparent" : ""}`}
        />
        <button type="button" className={boton} name="plus" onClick={() => cambiar(cantidad + 1)} aria-label={lateral ? undefined : "Más"}>
          {lateral && <span className="sr-only">aumentar</span>}
          <IconoMas ancho={16} className={icono} />
        </button>
      </div>
    </>
  );
}

/** Aviso rojo de una línea o de la ficha: «Debido a la disponibilidad, solo se añadieron N artículos…». */
export function AvisoError({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div role="alert" className={`flex items-center ${className}`}>
      <span className="mr-2 flex size-8 shrink-0 items-center justify-center bg-[#eb544a] text-white">
        <IconoAviso />
      </span>
      {children}
    </div>
  );
}

/** «Impuesto incluido. Envío calculados al finalizar la compra.» (con el enlace a la política de envíos). */
export function NotaImpuestos({ className, claseEnlace }: { className: string; claseEnlace: string }) {
  return (
    <small className={`block text-center text-[13.6px] leading-[17px] ${className}`}>
      Impuesto incluido.{" "}
      <Link href="/policies/shipping-policy" className={`underline ${claseEnlace}`}>
        Envío
      </Link>{" "}
      calculados al finalizar la compra.
    </small>
  );
}

/**
 * «Agregar notas de pedido»: abre el campo para escribir la nota. Paso 3: la tienda guarda la nota con el pedido en
 * el servidor; mientras tanto se puede escribir pero no se guarda.
 */
export function NotasPedido({
  claseResumen,
  claseTexto,
  claseContenido,
  titulo,
  id,
}: {
  claseResumen: string;
  claseTexto: string;
  claseContenido: string;
  titulo: ReactNode;
  id: string;
}) {
  return (
    <details>
      <summary className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${claseResumen}`}>
        <span className={claseTexto}>Agregar notas de pedido</span>
      </summary>
      <div className={claseContenido}>
        {titulo}
        <label className="sr-only" htmlFor={id}>
          Agregar notas de pedido
        </label>
        <textarea
          id={id}
          name="note"
          rows={5}
          placeholder="Agregar notas de pedido aquí..."
          // Paso 3: notas del pedido (se guardan en el servidor junto con el carrito).
          className="h-[120px] w-full rounded-[8px] border border-current/12 bg-white px-4 pt-2.5 pb-2 text-base leading-[normal] outline-none placeholder:text-current/40 hover:border-current/40 focus:border-current"
        />
      </div>
    </details>
  );
}
