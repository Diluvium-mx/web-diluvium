// Tarjeta de producto de las páginas de colección y de búsqueda: foto con esquinas redondas (sin sombra ni botón),
// título, estrellas y precio centrados. Al pasar el mouse aparece la segunda foto. Es otra tarjeta que la de la
// portada (TarjetaProducto): la tienda usa un diseño distinto en estas listas.

import Image from "next/image";
import Link from "next/link";
import type { Producto } from "./catalogo";
import { precioTexto, proveedor, resenas, resumenPrecio } from "./catalogo";
import { Estrellas } from "./Estrellas";

export function TarjetaColeccion({
  producto,
  enlace,
  sizes,
  vendedor = false,
  prioridad = false,
  estrellas = true,
  agregarRapido = false,
}: {
  producto: Producto;
  /** Dirección de la ficha: en una colección la tienda la arma como /collections/<colección>/products/<producto>. */
  enlace: string;
  sizes: string;
  /** Ajuste «show_product_vendor»: nombre del proveedor arriba del título (lo usa la búsqueda). */
  vendedor?: boolean;
  prioridad?: boolean;
  /** En la búsqueda la app de reseñas no pone estrellas. */
  estrellas?: boolean;
  /** Ajuste «quick_shop_action: quick_add» de la búsqueda: botón «Quick add» abajo de la tarjeta. */
  agregarRapido?: boolean;
}) {
  const precio = resumenPrecio(producto);
  const calificacion = estrellas ? resenas(producto) : undefined;
  const [primera, segunda] = producto.imagenes;
  const actual = `${precio.desde ? "Desde " : ""}${precioTexto(precio.precio)}`;
  const variasVariantes = producto.variantes.length > 1;

  return (
    <div className="relative flex h-full min-w-0 flex-col">
      {precio.antes && precio.rebajaPorciento > 0 && (
        <div className="absolute top-2 left-2 z-[2] flex gap-1 min-[1025px]:top-4 min-[1025px]:left-4">
          <span className="rounded-[64px] bg-oferta-fondo px-3 py-1 text-xs leading-[15px] font-bold text-oferta-texto min-[1025px]:text-sm min-[1025px]:leading-[17.5px]">
            {variasVariantes ? "Rebaja hasta" : "Rebaja"} {precio.rebajaPorciento}%
          </span>
        </div>
      )}

      <div className="group/foto relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:rounded-[32px]">
        {primera && (
          <Image
            src={primera.src}
            alt={primera.alt || producto.titulo}
            fill
            sizes={sizes}
            priority={prioridad}
            className={`object-contain transition-opacity duration-300 ${segunda ? "group-hover/foto:opacity-0" : ""}`}
          />
        )}
        {segunda && (
          <Image
            src={segunda.src}
            alt=""
            fill
            sizes={sizes}
            className="object-contain opacity-0 transition-opacity duration-300 group-hover/foto:opacity-100"
          />
        )}
        <Link href={enlace} className="absolute inset-0 z-[1]" tabIndex={-1} aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 py-4 text-center text-azul-oscuro min-[1025px]:py-6">
        <div>
          {vendedor && (
            <div className="mb-2 text-[13.6px] leading-[17px] text-azul-oscuro/60">
              <span className="sr-only">Proveedor:</span>
              <span>{proveedor(producto)}</span>
            </div>
          )}
          {/* Tamaño en style: las reglas base de h1…h6 de globals.css ganan a las clases de tamaño. */}
          <h3 className={calificacion ? "" : "mb-3"} style={{ fontSize: 19.2, lineHeight: "24px", fontWeight: 500 }}>
            <Link href={enlace} className="hover:underline">
              {producto.titulo}
            </Link>
          </h3>
          {calificacion && (
            <Estrellas
              promedio={calificacion.promedio}
              total={calificacion.total}
              claseTotal="font-texto text-sm text-azul-oscuro min-[1025px]:text-base"
            />
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {precio.antes && (
              <span className="inline-block leading-6">
                <span className="sr-only">Precio normal</span>
                <s className="text-[13.6px] leading-[17px] text-azul-oscuro/40">{precioTexto(precio.antes)}</s>
              </span>
            )}
            <span className="inline-block leading-6">
              <span className="sr-only">{precio.antes ? "Precio de venta" : "Precio normal"}</span>
              {actual}
            </span>
          </div>
          {/* Tira de muestras de variantes: en la tienda queda vacía a la vista, pero con más de 3 variantes guarda el
              contador («+2») escondido y deja 16 px abajo del precio. */}
          {producto.variantes.length > 3 && <div className="mt-4" aria-hidden="true" />}
        </div>
        {/* Paso 3: carrito. En vivo agrega el producto (o abre la ventana para elegir tamaño) y abre el carrito. */}
        {agregarRapido && (
          <button
            type="button"
            className="relative isolate flex min-h-10 w-full items-center justify-center overflow-hidden bg-white px-5 py-1.5 font-titulo leading-[normal] font-medium shadow-[inset_0_0_0_1px_rgba(0,66,136,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-azul-oscuro after:transition-[bottom] after:duration-[400ms] hover:text-white hover:after:bottom-0"
          >
            Quick add
          </button>
        )}
      </div>
    </div>
  );
}
