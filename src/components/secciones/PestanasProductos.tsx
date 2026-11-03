// Pestañas de productos (sección «multiple-product-tabs»): una pestaña por colección con sus tarjetas. En celular y
// tableta las tarjetas van en carrusel (dos por vista); en computadora, en rejilla de 3 columnas.

import type { Seccion } from "@/lib/contenido";
import { esquema, numero } from "@/lib/contenido";
import { productosDeColeccion } from "@/components/producto/catalogo";
import { Pestanas } from "@/components/producto/Pestanas";
import { TarjetaProducto } from "@/components/producto/TarjetaProducto";

// Nombres de las colecciones para las pestañas (solo se ven si hay más de una).
const NOMBRES: Record<string, string> = {
  "coleccion-para-escritorio": "Colección para escritorio",
};

export function PestanasProductos({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const colecciones = Array.isArray(a.collection_list) ? a.collection_list.filter((c): c is string => typeof c === "string") : [];
  const cuantos = numero(a, "items_to_show", 4);

  return (
    <div className={`${esquema(a)} overflow-hidden`} data-seccion="multiple-product-tabs">
      <div className="contenedor pb-[var(--aire)]">
        <Pestanas titulos={colecciones.map((c) => NOMBRES[c] ?? c)}>
          {colecciones.map((c) => (
            <div
              key={c}
              className="-mx-[var(--margen)] flex snap-x snap-mandatory gap-[min(3.6vw,24px)] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] py-2.5 [scrollbar-width:none] min-[1025px]:mx-0 min-[1025px]:grid min-[1025px]:grid-cols-3 min-[1025px]:gap-[2vw] min-[1025px]:overflow-visible min-[1025px]:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {productosDeColeccion(c, cuantos).map((p) => (
                <div key={p.nombre} className="min-w-0 shrink-0 basis-[calc((100%-min(3.6vw,24px))/2)] snap-start">
                  <TarjetaProducto producto={p} sizes="(min-width: 1025px) 374px, calc(50vw - 64px)" />
                </div>
              ))}
            </div>
          ))}
        </Pestanas>
      </div>
    </div>
  );
}
