"use client";

// Carrito lateral que abre la bolsa del encabezado (sale por la derecha) y que se abre solo al agregar un producto.
// Vacío: «Carrito 0», «Su carrito está vacío» y «Seguir comprando». Con productos: aviso «Producto añadido al
// carrito» (solo al abrirse tras agregar), barra de envío gratis, las líneas (foto, título, precio, tamaño, piezas y
// quitar), total, notas del pedido, «Ver carrito», «Finalizar compra» y la nota de impuestos. Medidas de la tienda en
// vivo (docs/sitio-actual/medidas/carrito-lateral-*.json).

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconoEquis } from "@/components/producto/IconosColeccion";
import { IconoExistencias } from "@/components/producto/ficha/Iconos";
import { precioTexto } from "@/components/producto/formato-precio";
import { enlaceArticulo } from "@/components/carrito/catalogo";
import { avisoExistencias, cambiar, quitar, useCarrito, type LineaCompleta } from "@/components/carrito/estado";
import {
  AvisoError,
  BarraEnvioGratis,
  CampoCantidad,
  IconoBasura,
  NotaImpuestos,
  NotasPedido,
} from "@/components/carrito/piezas";
import { useAparecer } from "./useAparecer";

const TEXTO_CHICO = "text-[13.6px] leading-[17px]";

function Linea({ linea, numero, cerrar }: { linea: LineaCompleta; numero: number; cerrar: () => void }) {
  const { articulo: a, cantidad } = linea;
  const [aviso, setAviso] = useState<string | null>(null);
  const poner = (n: number) => {
    const { tope } = cambiar(a.id, n);
    setAviso(tope === null ? null : avisoExistencias(tope));
  };
  const enlace = enlaceArticulo(a);
  return (
    <li className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-4">
      <div className="relative">
        {a.imagen && (
          <Link href={enlace} onClick={cerrar} tabIndex={-1} className="relative block size-20 overflow-hidden rounded-2xl">
            <Image src={a.imagen.src} alt={a.imagen.alt} fill sizes="80px" className="object-cover" />
          </Link>
        )}
      </div>
      <div>
        <Link href={enlace} onClick={cerrar} className="mb-2 block font-bold break-words">
          {a.titulo}
        </Link>
        <div className="mb-2">
          <span className="mb-1 block">{precioTexto(a.precio * cantidad)}</span>
          {a.precioAntes && <s className={`block text-current/60 ${TEXTO_CHICO}`}>{precioTexto(a.precioAntes * cantidad)}</s>}
        </div>
        {a.opcion && (
          <div className="mb-2">
            <dl className={`m-0 text-current/60 ${TEXTO_CHICO}`}>
              <div>
                <span>{a.opcion}</span>
              </div>
            </dl>
          </div>
        )}
        <div className="mt-3 flex items-center">
          <CampoCantidad cantidad={cantidad} titulo={a.titulo} cambiar={poner} tamano="lateral" id={`cantidad-lateral-${numero}`} />
          <button
            type="button"
            onClick={() => quitar(a.id)}
            aria-label={`Eliminar ${a.titulo}${a.opcion ? ` - ${a.opcion}` : ""}`}
            className="relative inline-flex size-9 cursor-pointer items-center justify-center min-[1025px]:size-10"
          >
            <IconoBasura className="size-4 min-[1025px]:size-5" />
          </button>
        </div>
        {aviso && (
          <AvisoError className="mt-4 text-[#eb544a]">
            <small className="text-[13.6px] leading-6">{aviso}</small>
          </AvisoError>
        )}
      </div>
    </li>
  );
}

export function PanelCarrito({ cerrar, anadido = false }: { cerrar: () => void; anadido?: boolean }) {
  const visible = useAparecer();
  const { lineas, piezas, total } = useCarrito();
  const router = useRouter();
  const vacio = lineas.length === 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  return (
    <div
      className={`fixed inset-0 z-50 p-6 text-azul transition-opacity duration-250 md:p-12 min-[1025px]:p-16 ${visible ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Su carrito"
    >
      <button type="button" className="fixed inset-0 bg-[rgba(23,22,26,0.5)]" aria-label="Cerrar" tabIndex={-1} onClick={cerrar} />
      <div className="flex h-full w-full justify-end">
        <div
          data-carrito-lateral
          className={`relative grid h-full overflow-hidden bg-white transition-[width] delay-250 duration-250 ease-[cubic-bezier(0.2,0.7,0.1,1)] ${vacio ? "grid-rows-[auto_1fr]" : "grid-rows-[auto_minmax(0,1fr)_auto]"} ${visible ? "w-full md:w-[400px]" : "w-0"}`}
        >
          <div className="z-[4] grid min-w-[294px] grid-cols-[1fr_auto] items-center gap-3 bg-white py-3 pr-3 pl-6">
            <div className="flex items-center gap-x-2.5">
              <h2 className="m-0" style={{ fontSize: "var(--h6)" }}>
                Carrito
              </h2>
              <span className="flex size-8 items-center justify-center bg-azul text-white">{piezas}</span>
            </div>
            <button type="button" className="flex size-9 items-center justify-center min-[1025px]:size-10" aria-label="Cerrar" onClick={cerrar}>
              <IconoEquis className="size-4 min-[1025px]:size-5" />
            </button>
          </div>

          {vacio ? (
            <div className="flex min-w-[294px] overflow-y-auto px-6 py-3">
              <div className="flex w-full flex-col items-center justify-center text-center">
                <p className="mb-8">Su carrito está vacío</p>
                <Link
                  href="/collections/all"
                  onClick={cerrar}
                  className="flex min-h-10 items-center justify-center border border-naranja bg-naranja px-6 py-1.5 font-titulo font-medium text-white min-[1025px]:min-h-11"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="min-w-[294px] overflow-y-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {anadido && (
                  <div className={`flex items-center pb-6 text-[#04943d] ${TEXTO_CHICO}`}>
                    <span className="mr-2 flex size-8 shrink-0 items-center justify-center bg-[#04943d]">
                      <IconoExistencias tipo="hay" />
                    </span>
                    Producto añadido al carrito
                  </div>
                )}
                <div className="pb-6">
                  <BarraEnvioGratis total={total} />
                </div>
                <ul className="m-0 list-none p-0">
                  {lineas.map((l, i) => (
                    <Linea key={l.id} linea={l} numero={i + 1} cerrar={cerrar} />
                  ))}
                </ul>
              </div>

              <div className="relative z-[1] min-w-[294px] border-t border-current/12 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="m-0 text-base leading-5">Total</h2>
                  <p className="m-0">{precioTexto(total)}</p>
                </div>
                <NotasPedido
                  id="nota-lateral"
                  claseResumen="w-fit"
                  claseTexto={`relative inline-flex min-h-9 items-center py-2 font-titulo font-medium text-naranja underline decoration-1 ${TEXTO_CHICO}`}
                  claseContenido="absolute inset-x-0 bottom-full border border-current/12 bg-white px-6 pt-4 pb-6"
                  titulo={
                    <h3 className="mb-3" style={{ fontSize: "var(--h6)" }}>
                      Order note
                    </h3>
                  }
                />
                <div className="mt-3 flex gap-3">
                  <Link
                    href="/cart"
                    onClick={cerrar}
                    className="relative isolate flex min-h-10 w-full items-center justify-center overflow-hidden bg-white px-6 py-1.5 text-center font-titulo leading-6 font-medium shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-azul after:transition-[bottom] after:duration-[400ms] hover:text-white hover:after:bottom-0 min-[1025px]:min-h-11"
                  >
                    Ver carrito
                  </Link>
                  <button
                    type="button"
                    name="checkout"
                    onClick={() => {
                      // A la pantalla de pago (el precio lo vuelve a calcular el servidor).
                      cerrar();
                      router.push("/checkout");
                    }}
                    className="relative isolate flex min-h-10 w-full cursor-pointer items-center justify-center overflow-hidden border border-naranja bg-naranja px-6 py-1.5 font-titulo leading-[normal] font-medium text-white transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-white after:transition-[bottom] after:duration-[400ms] hover:text-naranja hover:after:bottom-0 min-[1025px]:min-h-11"
                  >
                    Finalizar compra
                  </button>
                </div>
                <NotaImpuestos className="mt-2 text-current/60" claseEnlace="text-naranja" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
