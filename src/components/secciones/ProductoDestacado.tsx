// Producto destacado (sección «featured-product», «Lo más vendido 🔥»): galería con miniaturas y, al lado, título,
// precio con el anterior tachado, texto libre y botón «Ver detalles». Los bloques salen en el orden del contenido.

import Link from "next/link";
import type { Bloque, Seccion } from "@/lib/contenido";
import { esquema, texto } from "@/lib/contenido";
import { Titulo, TextoRico } from "@/components/comunes/Texto";
import { enlaceProducto, mediosProducto, producto as buscarProducto, type Producto } from "@/components/producto/catalogo";
import { BOTON_GRANDE, BOTON_PRIMARIO } from "@/components/producto/estilos";
import { GaleriaProducto } from "@/components/producto/GaleriaProducto";
import { Precio } from "@/components/producto/Precio";

function BloqueInfo({ bloque, producto }: { bloque: Bloque; producto: Producto }) {
  const enlace = enlaceProducto(producto);
  // La ficha muestra la primera variante, como la tienda al abrir la página.
  const variante = producto.variantes[0];
  switch (bloque.tipo) {
    case "title":
      return (
        <div className="mb-4 w-full">
          <h2 style={{ fontSize: "var(--h1)" }}>
            <Link href={enlace}>{producto.titulo}</Link>
          </h2>
        </div>
      );
    case "price": {
      const antes = variante.precioAntes && variante.precioAntes > variante.precio ? variante.precioAntes : null;
      const oferta = texto(bloque.ajustes, "show_sale_badge") === "text_only" ? "Oferta" : undefined;
      return (
        <div className="mb-5 w-full">
          <Precio precio={variante.precio} antes={antes} grande etiquetaOferta={oferta} />
        </div>
      );
    }
    case "custom_text":
      return <TextoRico html={texto(bloque.ajustes, "description")} className="mb-8 w-full" />;
    case "view_detail":
      return (
        <div className="mb-8 w-full">
          <Link href={enlace} className={`${BOTON_PRIMARIO} ${BOTON_GRANDE} w-full`}>
            Ver detalles
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export function ProductoDestacado({ seccion }: { seccion: Seccion }) {
  const a = seccion.ajustes;
  const producto = buscarProducto(texto(a, "product"));
  if (!producto) return <div data-seccion="featured-product" />;
  const titulo = texto(a, "heading");

  return (
    <div className={`${esquema(a)}`} data-seccion="featured-product">
      <div className="contenedor grid grid-cols-1 gap-[var(--hueco)] py-[var(--aire)]">
        {titulo && (
          <div className="flex flex-col items-center text-center">
            <Titulo texto={titulo} />
          </div>
        )}
        <div className="flex flex-col gap-[var(--hueco)] min-[1025px]:flex-row min-[1025px]:items-start min-[1025px]:gap-[2vw]">
          <div className="relative w-full min-w-0 min-[1025px]:sticky min-[1025px]:top-0 min-[1025px]:flex-1">
            <a href="#info-producto-destacado" className="sr-only focus:not-sr-only">
              Ir a la información del producto
            </a>
            <GaleriaProducto medios={mediosProducto(producto)} titulo={producto.titulo} />
          </div>
          <div id="info-producto-destacado" className="flex w-full min-w-0 flex-wrap content-start min-[1025px]:flex-1">
            {seccion.bloques.map((b) => (
              <BloqueInfo key={b.id} bloque={b} producto={producto} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
