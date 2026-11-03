// Barra con teléfono y correo debajo de la franja (sección «extra-info-header»).

import type { Seccion } from "@/lib/contenido";
import { texto } from "@/lib/contenido";
import { IconoTelefono } from "@/components/comunes/Iconos";

export function BarraContacto({ seccion }: { seccion: Seccion }) {
  const telefono = texto(seccion.ajustes, "phone_number");
  const correo = texto(seccion.ajustes, "email");
  return (
    <div className="border-b border-azul-borde bg-white" data-seccion="extra-info-header">
      <div className="contenedor flex items-center justify-between gap-2.5 py-4 text-[12px] leading-6 text-azul md:text-base">
        <div className="flex items-center gap-2.5">
          {telefono && (
            <a href={`tel:${telefono}`} className="flex items-center gap-1">
              <IconoTelefono className="h-2.5 w-2.5 md:h-[15px] md:w-[14px]" />
              {telefono}
            </a>
          )}
          {telefono && correo && <span className="h-3 w-px bg-azul md:h-4" aria-hidden="true" />}
          {correo && <a href={`mailto:${correo}`}>{correo}</a>}
        </div>
        <div>🇲🇽MXN</div>
      </div>
    </div>
  );
}
