"use client";

// Contenido de /cart (sección «main-cart»). Vacío: «Su carrito (0)», «Su carrito está vacío» y «Seguir comprando».
// Con productos: las líneas (foto, título, tamaño, piezas, quitar y precio), notas del pedido y el recuadro con envío
// gratis, total, «Finalizar compra», el botón de PayPal, «Seguir comprando» y la nota de impuestos. Medidas de la
// tienda en vivo (docs/sitio-actual/medidas/carrito-1-*.json, carrito-2-*.json).

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { precioTexto } from "@/components/producto/formato-precio";
import { enlaceArticulo } from "./catalogo";
import { avisoExistencias, cambiar, quitar, useCarrito, type LineaCompleta } from "./estado";
import { AvisoError, BarraEnvioGratis, CampoCantidad, IconoBasura, NotaImpuestos, NotasPedido } from "./piezas";

const TEXTO_CHICO = "text-[13.6px] leading-[17px]";

// Botón blanco con filo tenue («btn-outline»): al pasar el mouse se llena de azul desde arriba.
const BOTON_BLANCO =
  "relative isolate inline-flex min-h-10 items-center justify-center overflow-hidden bg-white px-5 font-titulo font-medium shadow-[inset_0_0_0_1px_rgba(0,66,136,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-azul-oscuro after:transition-[bottom] after:duration-[400ms] hover:text-white hover:after:bottom-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul";

function Linea({ linea, numero }: { linea: LineaCompleta; numero: number }) {
  const { articulo: a, cantidad } = linea;
  const [aviso, setAviso] = useState<string | null>(null);
  const poner = (n: number) => {
    const { tope } = cambiar(a.id, n);
    setAviso(tope === null ? null : avisoExistencias(tope));
  };
  const enlace = enlaceArticulo(a);
  return (
    <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-x-3 py-4 [grid-template-areas:'producto_producto_precio'_'._cantidad_.'] md:grid-cols-[80px_minmax(0,1fr)_auto] md:gap-x-[18px] md:py-6 min-[1025px]:grid-cols-4 min-[1025px]:gap-x-[28.8px] min-[1025px]:py-8 min-[1025px]:[grid-template-areas:'producto_producto_cantidad_precio']">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 [grid-area:producto] md:grid-cols-[80px_minmax(0,1fr)] md:gap-[18px] min-[1025px]:gap-6">
        <div className="relative h-20 w-12 overflow-hidden rounded-2xl md:w-20">
          {a.imagen && <Image src={a.imagen.src} alt={a.imagen.alt} fill sizes="80px" className="object-cover" />}
        </div>
        <div className="break-words">
          <Link href={enlace} className="mb-2 block font-titulo text-[19.2px] leading-6 font-medium md:mb-3 min-[1025px]:mb-4">
            {a.titulo}
          </Link>
          {a.opcion && (
            <dl className={`m-0 break-words text-current/60 ${TEXTO_CHICO}`}>
              <div>
                <span>{a.opcion}</span>
              </div>
            </dl>
          )}
        </div>
      </div>
      <div className="[grid-area:cantidad]">
        <div className="mt-4 flex items-center min-[1025px]:mt-0 min-[1025px]:justify-end">
          <CampoCantidad cantidad={cantidad} titulo={a.titulo} cambiar={poner} tamano="pagina" id={`cantidad-${numero}`} />
          <button
            type="button"
            onClick={() => quitar(a.id)}
            aria-label="Borrar"
            className="relative inline-flex size-10 cursor-pointer items-center justify-center"
          >
            <IconoBasura className="size-6" />
          </button>
        </div>
        {aviso && (
          <AvisoError className="mt-4">
            <small className="text-[13.6px] leading-6">{aviso}</small>
          </AvisoError>
        )}
      </div>
      <div className="text-right [grid-area:precio]">
        <div className="flex flex-col gap-2 break-words">
          <span className="block">{precioTexto(a.precio * cantidad)}</span>
          {a.precioAntes && <s className={`block text-current/60 ${TEXTO_CHICO}`}>{precioTexto(a.precioAntes * cantidad)}</s>}
        </div>
      </div>
    </div>
  );
}

/**
 * Botón de PayPal (pago acelerado de la tienda). Paso 3: pago (Mercado Pago, precio calculado en el servidor);
 * mientras tanto se ve igual y no hace nada.
 */
function BotonPaypal() {
  return (
    <div className="mt-2 h-[54px] w-full md:h-[42px] min-[1025px]:h-[54px]">
      <button
        type="button"
        aria-label="PayPal"
        onClick={() => {
          // Paso 3: pago (Mercado Pago, precio calculado en el servidor)
        }}
        className="flex h-full w-full cursor-pointer items-center justify-center rounded-[4px] bg-[#ffc439] hover:brightness-95"
      >
        <span className="text-[21px] leading-none font-bold tracking-[-0.5px] italic [font-family:Verdana,Helvetica,Arial,sans-serif]">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009cde]">Pal</span>
        </span>
      </button>
    </div>
  );
}

export function PaginaCarrito() {
  const { lineas, piezas, total } = useCarrito();
  const vacio = lineas.length === 0;

  return (
    <div className="flex flex-col gap-[var(--hueco)]">
      <div>
        <h1 className="text-center" style={{ fontSize: "var(--h4)" }}>
          Su carrito (<span>{piezas}</span>)
        </h1>
      </div>
      {vacio ? (
        <div className="p-4 text-center md:p-6 min-[1025px]:p-8">
          <h6 className="pb-4 md:pb-6 min-[1025px]:pb-8">Su carrito está vacío</h6>
          <Link href="/collections/all" className={`${BOTON_BLANCO} py-1.5`}>
            Seguir comprando
          </Link>
        </div>
      ) : (
        <div className="justify-between gap-[28.8px] min-[1025px]:flex">
          <div className="flex min-w-0 flex-1 flex-col gap-[var(--hueco)]">
            <div>
              {lineas.map((l, i) => (
                <Linea key={l.id} linea={l} numero={i + 1} />
              ))}
            </div>
            <div className="md:max-w-[62.5%]">
              <NotasPedido
                id="nota-carrito"
                claseResumen="inline-block leading-6"
                claseTexto="text-[13.6px] leading-[17px] font-bold underline decoration-1 underline-offset-[5px]"
                claseContenido=""
                titulo={<span className="mt-2 mb-3 block font-bold">Order note</span>}
              />
            </div>
          </div>
          <div className="min-[1025px]:w-[480px] min-[1025px]:shrink-0">
            <div className="sticky top-0 mt-5 rounded-2xl border border-current/12 p-4 md:mx-9 md:mt-9 md:max-w-[600px] md:rounded-3xl md:p-6 min-[1025px]:m-0 min-[1025px]:rounded-[32px] min-[1025px]:p-8">
              <div className="mb-4">
                <BarraEnvioGratis total={total} />
              </div>
              <div className="mb-4 flex items-center justify-between gap-6">
                <p className="m-0">Total</p>
                <p className="m-0 text-right font-bold">{precioTexto(total)}</p>
              </div>
              <div className="w-full">
                <div className="mb-3">
                  <button
                    type="button"
                    name="checkout"
                    onClick={() => {
                      // Paso 3: pago (Mercado Pago, precio calculado en el servidor)
                    }}
                    className="relative isolate inline-flex min-h-10 w-full cursor-pointer items-center justify-center overflow-hidden border border-azul-oscuro bg-azul-oscuro px-5 py-2 font-titulo leading-[normal] font-medium text-[#fff7ec] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-white after:transition-[bottom] after:duration-[400ms] hover:text-azul-oscuro hover:after:bottom-0"
                  >
                    Finalizar compra
                  </button>
                  <BotonPaypal />
                </div>
                <div className="text-center">
                  <Link href="/collections/all" className={`${BOTON_BLANCO} w-full py-2 leading-[normal]`}>
                    Seguir comprando
                  </Link>
                </div>
              </div>
              <NotaImpuestos className="mt-3 text-current/60" claseEnlace="text-azul-oscuro" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
