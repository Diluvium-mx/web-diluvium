// Partes del resumen del pedido (columna gris en computadora, plegado arriba en celular y tableta, y la página de
// «gracias»): líneas con foto y piezas, renglones de subtotal, descuento, envío y total. Solo muestran lo que calculó
// el servidor (cotizar / el pedido guardado); aquí no se suma nada.

import Image from "next/image";
import type { ReactNode } from "react";
import { IconoAyuda, IconoEtiqueta } from "./Iconos";

/** 5500 → «$5,500.00», como los montos de la pantalla de pago. */
export function dinero(cantidad: number): string {
  return `$${cantidad.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type LineaVista = { id: number; titulo: string; opcion: string | null; cantidad: number; precio: number; imagen: string | null };

/** Foto de 64 px con marco blanco y el número de piezas en un globo negro. */
function Foto({ imagen, titulo, cantidad }: { imagen: string | null; titulo: string; cantidad: number }) {
  return (
    <div className="relative size-[66px] shrink-0 rounded-[13px] border border-black/10 bg-white">
      {imagen && (
        <Image
          src={imagen}
          alt={titulo}
          width={64}
          height={64}
          sizes="64px"
          className="size-16 rounded-[12px] border-2 border-white object-cover"
        />
      )}
      <span className="absolute -top-[5px] -right-[5px] flex h-[21px] min-w-[21px] items-center justify-center rounded-full border-2 border-white bg-black px-[5px] text-[12px] leading-[16.2px] font-semibold text-white">
        <span className="solo-lector">Cantidad</span>
        {cantidad}
      </span>
    </div>
  );
}

export function Lineas({ lineas }: { lineas: LineaVista[] }) {
  return (
    <section aria-label="Carrito">
      <h3 className="solo-lector">Carrito</h3>
      <div className="flex flex-col gap-[14px]">
        {lineas.map((l) => (
          <div key={l.id} className="flex items-center gap-[14px]">
            <Foto imagen={l.imagen} titulo={l.titulo} cantidad={l.cantidad} />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-[14px]">
              <div className="min-w-0">
                <p className="text-[14px] leading-[18.9px]">{l.titulo}</p>
                {l.opcion && <p className="text-[12px] leading-[16.2px] text-tenue-2">{l.opcion}</p>}
              </div>
              <span className="shrink-0 text-[14px] leading-[18.9px]">{dinero(l.precio * l.cantidad)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type PropsCostos = {
  subtotal: number;
  descuento: { codigo: string; monto: number } | null;
  /** null: todavía no hay dirección completa. */
  envio: { nombre: string; costo: number } | null;
  total: number;
  /** En la página de «gracias» el envío ya no lleva el «?» ni el texto de espera. */
  extra?: ReactNode;
};

/** Subtotal, descuento, envío y total («MXN» chico y el monto en negritas). */
export function Costos({ subtotal, descuento, envio, total, extra }: PropsCostos) {
  return (
    <section aria-label="Resumen de costos">
      <h3 className="solo-lector">Resumen de costos</h3>
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between gap-4 leading-[17px]">
          <span>Subtotal</span>
          <span>{dinero(subtotal)}</span>
        </div>
        {descuento && (
          <div className="flex justify-between gap-4 leading-[19px]">
            <span className="flex items-center gap-[6px]">
              Descuento
              <span className="flex items-center gap-1 text-[12px] text-tenue-2">
                <IconoEtiqueta className="size-3" />
                {descuento.codigo}
              </span>
            </span>
            <span>−{dinero(descuento.monto)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 leading-[19px]">
          <span className="flex items-center gap-1">
            Envío
            {!envio && (
              <span className="flex text-tenue-2" aria-hidden="true">
                <IconoAyuda className="size-3.5" />
              </span>
            )}
          </span>
          {envio ? (
            <span>{envio.costo === 0 ? "Gratis" : dinero(envio.costo)}</span>
          ) : (
            <span className="text-right text-tenue-2">Introducir la dirección de envío</span>
          )}
        </div>
        {extra}
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <span className="text-[18px] leading-[24.3px] font-semibold">Total</span>
          <span className="flex items-baseline gap-[6px]">
            <span className="text-[12px] leading-[15px] text-tenue-2">MXN</span>
            <strong className="text-[18px] leading-[24.3px] font-semibold">{dinero(total)}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
