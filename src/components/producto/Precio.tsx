// Precio de un producto: precio anterior tachado, precio actual y, si se pide, la etiqueta de oferta.

import { precioTexto } from "./catalogo";

export function Precio({
  precio,
  antes,
  desde = false,
  grande = false,
  etiquetaOferta,
  className = "",
}: {
  precio: number;
  antes: number | null;
  desde?: boolean;
  /** «price--large» de la ficha destacada: 16 px; en tarjetas, 14 px. Todo en 700: la tienda pide 600 en tarjetas
   *  pero solo carga Instrument Sans 400 y 700, así que se ve en 700. */
  grande?: boolean;
  etiquetaOferta?: string;
  className?: string;
}) {
  const actual = `${desde ? "Desde " : ""}${precioTexto(precio)}`;
  const peso = grande ? "text-base font-bold" : "text-sm font-bold";
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {antes ? (
        <span className="flex flex-wrap items-center justify-center gap-2">
          <span className="sr-only">Precio normal</span>
          <s className={`text-[13.6px] leading-[17px] text-[rgba(49,49,49,0.63)] ${grande ? "" : "font-bold"}`}>
            {precioTexto(antes)}
          </s>
          <span className="sr-only">Precio de venta</span>
          <span className={`leading-6 text-azul ${peso}`}>{actual}</span>
        </span>
      ) : (
        <span className={`leading-6 text-azul ${peso}`}>
          <span className="sr-only">Precio normal</span>
          {actual}
        </span>
      )}
      {antes && etiquetaOferta && (
        <span className="rounded-[64px] bg-oferta-fondo px-3 py-1 text-xs leading-[15px] font-bold text-oferta-texto min-[1025px]:text-sm min-[1025px]:leading-[17.5px]">
          {etiquetaOferta}
        </span>
      )}
    </div>
  );
}
