// Tarjeta de producto de las listas (pestañas de productos, colecciones, relacionados): foto que cambia por la
// segunda al pasar el mouse, título, estrellas, precio y botón «Ver producto».

import Image from "next/image";
import Link from "next/link";
import type { Producto } from "./catalogo";
import { enlaceProducto, resenas, resumenPrecio } from "./catalogo";
import { BOTON_CHICO, BOTON_PRIMARIO } from "./estilos";
import { Estrellas } from "./Estrellas";
import { Precio } from "./Precio";

export function TarjetaProducto({
  producto,
  sizes = "(min-width: 1025px) 374px, 50vw",
  className = "",
}: {
  producto: Producto;
  /** Ancho de la foto en cada vista (para que el navegador baje el tamaño justo). */
  sizes?: string;
  className?: string;
}) {
  const enlace = enlaceProducto(producto);
  const precio = resumenPrecio(producto);
  const calificacion = resenas(producto);
  const [primera, segunda] = producto.imagenes;

  return (
    <div className={`relative flex h-full min-w-0 flex-col rounded-[4px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] ${className}`}>
      {precio.antes && precio.rebajaPorciento > 0 && (
        <div className="absolute top-2 left-2 z-[2] flex flex-col items-start gap-1 min-[1025px]:top-4 min-[1025px]:left-4">
          <span className="rounded-[64px] bg-oferta-fondo px-3 py-1 text-xs leading-[15px] font-bold text-oferta-texto min-[1025px]:text-sm min-[1025px]:leading-[17.5px]">
            Rebaja hasta {precio.rebajaPorciento}%
          </span>
        </div>
      )}

      <div className="group/foto relative aspect-square overflow-hidden rounded-[4px] p-5">
        {primera && (
          <div className="relative size-full overflow-hidden">
            <Image
              src={primera.src}
              alt={primera.alt || producto.titulo}
              fill
              sizes={sizes}
              className={`object-contain transition-all duration-150 ${segunda ? "group-hover/foto:scale-110 group-hover/foto:opacity-0" : ""}`}
            />
          </div>
        )}
        {segunda && (
          <div className="absolute inset-0 overflow-hidden p-8">
            <div className="relative size-full">
              <Image
                src={segunda.src}
                alt=""
                fill
                sizes={sizes}
                className="object-contain opacity-0 transition-all duration-150 group-hover/foto:scale-110 group-hover/foto:opacity-100"
              />
            </div>
          </div>
        )}
        <Link href={enlace} className="absolute inset-0 z-[1]" tabIndex={-1} aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 px-5 py-4 text-center min-[1025px]:py-6">
        <div>
          {/* Tamaño en style: las reglas base de h1…h6 de globals.css (sin capa) les ganan a las clases. Peso 700:
              la tienda pide 600 pero solo carga Archivo 500 y 700, así que el navegador dibuja 700. */}
          <h3 className="text-[#313131]" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 700 }}>
            <Link href={enlace}>{producto.titulo}</Link>
          </h3>
          {calificacion && <Estrellas promedio={calificacion.promedio} total={calificacion.total} />}
          <Precio precio={precio.precio} antes={precio.antes} desde={precio.desde} className="justify-center" />
        </div>
        <Link href={enlace} className={`${BOTON_PRIMARIO} ${BOTON_CHICO} self-center`}>
          Ver producto
        </Link>
      </div>
    </div>
  );
}
