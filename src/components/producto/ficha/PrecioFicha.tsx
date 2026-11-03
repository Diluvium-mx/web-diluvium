"use client";

// Precio de la variante elegida: con rebaja, el anterior tachado arriba y el actual en verde con la etiqueta
// «Oferta»; sin rebaja, solo el precio en azul. Si la variante está agotada se agrega la etiqueta «Agotado».
// Solo para mostrar: el precio que se cobra lo calcula el servidor (docs/seguridad.md §2).

import { precioTexto } from "../catalogo";
import { puedeComprarse, useFicha } from "./Estado";

export function PrecioFicha({ etiquetaOferta, tachadoGris }: { etiquetaOferta: boolean; tachadoGris: boolean }) {
  const { variantes, elegida } = useFicha();
  const v = variantes[elegida];
  const antes = v.precioAntes && v.precioAntes > v.precio ? v.precioAntes : null;
  const agotado = !puedeComprarse(v);

  return (
    <div className="flex flex-wrap items-center gap-2" role="status">
      {antes ? (
        <span className="flex flex-col items-start justify-center gap-2 text-center">
          <span className="sr-only">Precio normal</span>
          <span className="inline-block h-6">
            <s
              className={`text-[13.6px] leading-[17px] ${tachadoGris ? "text-[rgba(49,49,49,0.63)]" : "text-[rgba(10,85,154,0.4)]"}`}
            >
              {precioTexto(antes)}
            </s>
          </span>
          <span className="sr-only">Precio de venta</span>
          <span className="inline-block text-lg leading-6 font-bold text-[#13942c]">{precioTexto(v.precio)}</span>
        </span>
      ) : (
        <span className="block">
          <span className="sr-only">Precio normal</span>
          <span className="inline-block leading-6 font-bold text-azul">{precioTexto(v.precio)}</span>
        </span>
      )}
      {((antes && etiquetaOferta) || agotado) && (
        <div className="flex flex-wrap gap-2 self-end">
          {antes && etiquetaOferta && (
            <span className="relative inline-block rounded-[64px] bg-[#de8c11] px-3 py-1 text-xs leading-[15px] font-bold text-white">
              Oferta
            </span>
          )}
          {agotado && (
            <span className="inline-block rounded-[64px] bg-white px-3 py-1 text-xs leading-[15px] font-bold text-[#c54c44] min-[1025px]:text-sm min-[1025px]:leading-[17.5px]">
              Agotado
            </span>
          )}
        </div>
      )}
    </div>
  );
}
