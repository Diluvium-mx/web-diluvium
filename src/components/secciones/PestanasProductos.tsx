// Pestañas de productos (sección «multiple-product-tabs»): título opcional y una pestaña por colección con sus
// tarjetas. En celular y tableta las tarjetas van en carrusel («columns_per_row_mobile» por vista); en computadora,
// en rejilla de «columns_per_row_desktop» columnas o, con «carousel_desktop», en carrusel que asoma la siguiente.

import type { CSSProperties } from "react";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, plantilla, texto } from "@/lib/contenido";
import { Titulo } from "@/components/comunes/Texto";
import { producto as buscarProducto, productosDeColeccion, type Producto } from "@/components/producto/catalogo";
import { Pestanas } from "@/components/producto/Pestanas";
import { TarjetaProducto } from "@/components/producto/TarjetaProducto";
import { sinAireArriba } from "./aire";

// Nombres de las colecciones para las pestañas (solo se ven si hay más de una).
const NOMBRES: Record<string, string> = {
  "coleccion-para-escritorio": "Colección para escritorio",
  "los-mas-vendidos": "Los más vendidos",
};

// Colecciones que el catálogo todavía no trae (leídas de las páginas de producto en vivo, 3-nov-2026).
const OTRAS_COLECCIONES: Record<string, string[]> = {
  "los-mas-vendidos": [
    "compuerta-anti-inundaciones",
    "compuerta-anti-inundaciones-hecha-a-la-medida",
    "tapon-inflable-anti-inundaciones",
    "funda-de-repuesto-compuerta-anti-inundaciones",
  ],
};

const COLUMNAS: Record<number, string> = {
  2: "min-[1025px]:grid-cols-2",
  3: "min-[1025px]:grid-cols-3",
  4: "min-[1025px]:grid-cols-4",
  5: "min-[1025px]:grid-cols-5",
};

function productosDe(coleccion: string, cuantos: number): Producto[] {
  const lista = productosDeColeccion(coleccion, cuantos);
  if (lista.length > 0) return lista;
  return (OTRAS_COLECCIONES[coleccion] ?? [])
    .map((n) => buscarProducto(n))
    .filter((p): p is Producto => Boolean(p))
    .slice(0, cuantos);
}

// Plantillas de páginas sueltas (/pages/…): ahí las estrellas de la tarjeta quedan más separadas del título.
const PAGINAS = ["page", "page.nosotros", "page.contact", "page.instalacion", "page.distribuidor"] as const;

export function PestanasProductos({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const a = seccion.ajustes;
  const enPagina = PAGINAS.some((n) => plantilla(n).secciones.some((s) => s.id === seccion.id));
  const colecciones = Array.isArray(a.collection_list) ? a.collection_list.filter((c): c is string => typeof c === "string") : [];
  const cuantos = numero(a, "items_to_show", 4);
  const titulo = texto(a, "heading");
  const tamanoTitulo = texto(a, "heading_size") || "h2";
  const porVistaCel = Math.max(1, numero(a, "columns_per_row_mobile", 2));
  const columnasCompu = Math.max(1, numero(a, "columns_per_row_desktop", 3));
  const carruselCompu = texto(a, "carousel_desktop") === "true";
  const alinear = `${texto(a, "content_align_mobile") === "ta-left" ? "items-start text-left" : "items-center text-center"} ${
    texto(a, "content_align_desktop").includes("ta-left") ? "min-[1025px]:items-start min-[1025px]:text-left" : "min-[1025px]:items-center min-[1025px]:text-center"
  }`;

  // Ancho de cada tarjeta: celular/tableta según «por vista»; computadora, según las columnas.
  const anchos = {
    "--tarjeta-cel": `calc((100% - ${porVistaCel - 1} * min(3.6vw, 24px)) / ${porVistaCel})`,
    "--tarjeta-compu": `calc((100% - ${columnasCompu - 1} * 2vw) / ${columnasCompu})`,
  } as CSSProperties;
  const fila = carruselCompu
    ? "min-[1025px]:gap-[2vw]"
    : "min-[1025px]:mx-0 min-[1025px]:grid min-[1025px]:gap-[2vw] min-[1025px]:overflow-visible min-[1025px]:px-0";
  const columnas = carruselCompu ? "" : (COLUMNAS[columnasCompu] ?? COLUMNAS[3]);

  return (
    <div className={`${esquema(a)} overflow-hidden`} data-seccion="multiple-product-tabs">
      <div
        className={`contenedor flex flex-col gap-[var(--hueco)] pb-[var(--aire)] ${sinAireArriba(seccion, producto) ? "" : "pt-[var(--aire)]"}`}
      >
        {titulo && (
          <div className={`flex flex-col ${alinear}`}>
            <Titulo texto={titulo} className="break-words" style={{ fontSize: `var(--${tamanoTitulo})` }} />
          </div>
        )}
        <Pestanas titulos={colecciones.map((c) => NOMBRES[c] ?? c)}>
          {colecciones.map((c) => (
            <div
              key={c}
              style={anchos}
              className={`-mx-[var(--margen)] flex snap-x snap-mandatory gap-[min(3.6vw,24px)] overflow-x-auto scroll-px-[var(--margen)] px-[var(--margen)] py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${fila} ${columnas}`}
            >
              {productosDe(c, cuantos).map((p) => (
                <div
                  key={p.nombre}
                  className={`min-w-0 shrink-0 basis-[var(--tarjeta-cel)] snap-start ${carruselCompu ? "min-[1025px]:basis-[var(--tarjeta-compu)]" : ""}`}
                >
                  <TarjetaProducto
                    producto={p}
                    vendedor={a.show_vendor === true}
                    muestrasColor={a.show_color_swatch === true}
                    precioApilado={Boolean(producto)}
                    estrellasSeparadas={enPagina}
                    sizes={`(min-width: 1025px) ${Math.round(1300 / columnasCompu)}px, ${porVistaCel > 1 ? "calc(50vw - 64px)" : "calc(100vw - 96px)"}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </Pestanas>
      </div>
    </div>
  );
}
