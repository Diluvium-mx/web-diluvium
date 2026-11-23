"use client";

// Carrito de las versiones B (propuesta 2 que eligió el dueño, 21-nov-2026): una hoja que sube desde abajo, con los
// botones donde llega el pulgar. Se cierra con la × de arriba (o tocando fuera, o con Esc). Al abrirse después de
// agregar, una palomita verde confirma «Se agregó a tu carrito».
// Debajo del total: las formas de pago (VISA, Mastercard, Mercado Pago, PayPal) y, abajo, «IVA incluido · hasta 6
// meses sin intereses». Sin notas de pedido ni «Envío calculados al finalizar la compra» (Producto 250).
// El precio de cada línea sale del catálogo; el de verdad lo vuelve a calcular el servidor al pagar (/checkout).

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { enlaceArticulo } from "@/components/carrito/catalogo";
import { avisoExistencias, cambiar, quitar, useCarrito, type LineaCompleta } from "@/components/carrito/estado";
import { useAparecer } from "@/components/encabezado/useAparecer";
import { LogoMastercard, LogoMercadoPago, LogoPaypal, LogoVisa } from "@/components/pago/Iconos";
import { pesos } from "./datos";
import { TEXTOS_CARRITO, type TextosCarrito } from "./textos";
import { IconoTache } from "./piezas";


/** Desde este total el envío es gratis (como en la tienda: «Envío gratis a partir de $499»). */
const ENVIO_GRATIS_DESDE = 499;

function Palomita({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Linea({ linea, cerrar, quitarTexto }: { linea: LineaCompleta; cerrar: () => void; quitarTexto: string }) {
  const { articulo: a, cantidad } = linea;
  const [aviso, setAviso] = useState<string | null>(null);
  const poner = (n: number) => {
    const { tope } = cambiar(a.id, n);
    setAviso(tope === null ? null : avisoExistencias(tope));
  };
  const enlace = enlaceArticulo(a);
  return (
    <li className="flex gap-3 py-3">
      <Link href={enlace} onClick={cerrar} tabIndex={-1} className="relative size-[68px] shrink-0 overflow-hidden rounded-xl bg-niebla">
        {a.imagen && <Image src={a.imagen.src} alt={a.imagen.alt} fill sizes="68px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={enlace} onClick={cerrar} className="block font-titulo text-[16px] leading-tight font-medium text-marino">
          {a.titulo}
        </Link>
        {a.opcion && <p className="m-0 mt-0.5 text-[14.5px] text-texto-suave">{a.opcion}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-xl border-2 border-linea bg-white">
            <button type="button" onClick={() => poner(cantidad - 1)} aria-label={`Una pieza menos de ${a.titulo}`} className="flex size-10 cursor-pointer items-center justify-center text-[20px] font-bold text-marino">
              −
            </button>
            <span className="w-8 text-center text-[17px] font-bold text-tinta tabular-nums" aria-live="polite">
              {cantidad}
            </span>
            <button type="button" onClick={() => poner(cantidad + 1)} aria-label={`Una pieza más de ${a.titulo}`} className="flex size-10 cursor-pointer items-center justify-center text-[20px] font-bold text-marino">
              +
            </button>
          </span>
          <span className="text-right">
            {a.precioAntes && <s className="block text-[13px] text-texto-suave">{pesos(a.precioAntes * cantidad)}</s>}
            <strong className="text-[17px] text-tinta">{pesos(a.precio * cantidad)}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => quitar(a.id)}
          aria-label={`Quitar ${a.titulo}${a.opcion ? ` - ${a.opcion}` : ""}`}
          className="mt-1 inline-flex min-h-9 cursor-pointer items-center text-[14px] font-semibold text-texto-suave underline underline-offset-2"
        >
          {quitarTexto}
        </button>
        {aviso && <p className="m-0 mt-1 text-[14px] font-semibold text-[#b42318]">{aviso}</p>}
      </div>
    </li>
  );
}

export function CarritoHoja({ cerrar, anadido = false, textos = TEXTOS_CARRITO }: { cerrar: () => void; anadido?: boolean; textos?: TextosCarrito }) {
  const t = textos;
  const visible = useAparecer();
  const { lineas, piezas, total } = useCarrito();
  const router = useRouter();
  const equis = useRef<HTMLButtonElement>(null);
  const vacio = lineas.length === 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    equis.current?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Tu carrito" className="fixed inset-0 z-50">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar"
        onClick={cerrar}
        className={`absolute inset-0 bg-tinta/55 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-[520px] flex-col rounded-t-[26px] bg-white pb-[env(safe-area-inset-bottom)] text-tinta shadow-[0_-12px_40px_-12px_rgba(12,30,51,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.1,1)] will-change-transform ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 py-2 pr-2 pl-5">
          {anadido && !vacio ? (
            <p className="m-0 flex flex-1 items-center gap-2 font-titulo text-[18px] font-medium text-[#13834a]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#13834a] text-white">
                <Palomita />
              </span>
              {t.agregado}
            </p>
          ) : (
            <p className="m-0 flex-1 font-titulo text-[20px] font-medium text-marino">
              {t.titulo}
              {piezas > 0 ? ` (${piezas})` : ""}
            </p>
          )}
          <button ref={equis} type="button" onClick={cerrar} aria-label="Cerrar el carrito" className="flex size-11 cursor-pointer items-center justify-center rounded-full text-marino hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>

        {vacio ? (
          <div className="grid gap-3 px-5 pt-4 pb-6 text-center">
            <p className="m-0 text-[17px] text-tinta">{t.vacio}</p>
            <Link href="/products/compuerta-anti-inundaciones" onClick={cerrar} className="flex min-h-14 items-center justify-center rounded-2xl bg-boton font-titulo text-[18px] font-medium text-white">
              {t.vacioBoton}
            </Link>
          </div>
        ) : (
          <>
            <ul className="m-0 min-h-0 flex-1 list-none divide-y divide-linea overflow-y-auto overscroll-contain px-5 py-1">
              {lineas.map((l) => (
                <Linea key={l.articulo.id} linea={l} cerrar={cerrar} quitarTexto={t.quitar} />
              ))}
            </ul>
            <div className="border-t border-linea px-5 pt-3 pb-5">
              <p className="m-0 flex justify-between text-[15.5px] text-tinta">
                <span>{t.envio}</span>
                {total >= ENVIO_GRATIS_DESDE ? (
                  <strong className="text-[#13834a]">{t.gratis}</strong>
                ) : (
                  <span className="text-texto-suave">
                    {t.gratis} desde {pesos(ENVIO_GRATIS_DESDE)}
                  </span>
                )}
              </p>
              <p className="m-0 mt-1 flex items-baseline justify-between text-tinta">
                <span className="text-[15.5px] font-bold">{t.total}</span>
                <strong className="text-[26px]">{pesos(total)}</strong>
              </p>
              {/* Formas de pago: solo los logos (los mismos de la pantalla de pago), del mismo tamaño (Producto 330–333). */}
              <p className="m-0 mt-3 flex justify-center gap-2" role="list" aria-label="Formas de pago">
                <span role="listitem">
                  <LogoVisa className="h-7 w-11" />
                </span>
                <span role="listitem">
                  <LogoMastercard className="h-7 w-11" />
                </span>
                <span role="listitem">
                  <LogoMercadoPago className="h-7 w-11" />
                </span>
                <span role="listitem" className="flex h-7 w-11 items-center justify-center rounded-[3px] border border-linea bg-white">
                  <LogoPaypal className="text-[10.5px]" />
                </span>
              </p>
              <p className="m-0 mt-1.5 text-center text-[13px] text-texto-suave">{t.nota}</p>
              <div className="mt-4 grid gap-2.5">
                <button
                  type="button"
                  name="checkout"
                  data-evento="va_a_pagar"
                  onClick={() => {
                    // A la pantalla de pago (el precio lo vuelve a calcular el servidor).
                    cerrar();
                    router.push("/checkout");
                  }}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-boton font-titulo text-[18px] font-medium text-white shadow-[0_8px_20px_-10px_rgba(248,160,29,0.9)] transition-colors hover:bg-boton-encima"
                >
                  {t.pagar}
                </button>
                <button type="button" onClick={cerrar} className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-marino font-titulo text-[17px] font-medium text-marino">
                  {t.seguir}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
