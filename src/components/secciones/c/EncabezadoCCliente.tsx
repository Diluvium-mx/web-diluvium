"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { alAbrirCarrito, useCarrito } from "@/components/carrito/estado";
import { IconoBolsa } from "@/components/comunes/Iconos";
import { CarritoHoja } from "../landing/CarritoHoja";
import { IconoTache, IconoWhatsapp } from "../landing/piezas";

export function EncabezadoCCliente({
  logo,
  logoMarca,
  boton,
  enlaceBoton,
  whatsapp,
  textoMenu,
  paginas,
}: {
  logo: string;
  logoMarca?: Record<string, string>;
  boton: string;
  enlaceBoton: string;
  whatsapp: string;
  textoMenu: string;
  paginas: { texto: string; url: string }[];
}) {
  const [carrito, setCarrito] = useState<{ anadido: boolean } | null>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const { piezas } = useCarrito();
  const cerrarCarrito = useCallback(() => setCarrito(null), []);
  useEffect(() => alAbrirCarrito(({ anadido }) => setCarrito({ anadido })), []);

  return (
    <header className="sticky top-0 z-40 bg-[#06182f]/95 text-white backdrop-blur">
      <div className="marco-version flex h-14 items-center gap-2 md:h-16">
        {/* Enlace normal y no <Link>: EnlacesVersion le pone la dirección de la versión y <Link> la ignoraría. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="mr-auto flex items-center" aria-label="Diluvium, ir al inicio">
          {logo && (
            <span className="block overflow-hidden">
              <Image src={logo} alt="Diluvium" width={742} height={181} preload sizes="130px" className="h-auto w-[112px] md:w-[130px]" {...logoMarca} />
            </span>
          )}
        </a>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp" data-evento="toca_whatsapp" className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
            <IconoWhatsapp className="size-[22px] text-[#4ade80]" />
          </a>
        )}
        <button type="button" onClick={() => setCarrito({ anadido: false })} aria-label={`Carrito, ${piezas} artículos`} className="relative flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/10">
          <IconoBolsa className="size-[22px]" />
          {piezas > 0 && <span className="absolute top-0.5 right-0.5 flex size-[18px] items-center justify-center rounded-full bg-boton text-[11px] font-bold">{piezas}</span>}
        </button>
        <a href={enlaceBoton} data-evento="boton_encabezado" className="ml-1 inline-flex h-9 items-center rounded-full bg-boton px-4 font-titulo text-[14.5px] font-medium text-white hover:bg-boton-encima">
          {boton}
        </a>
        <button type="button" onClick={() => menu.current?.showModal()} aria-label={textoMenu} aria-haspopup="dialog" className="flex size-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full hover:bg-white/10">
          <span className="h-[2px] w-5 rounded bg-white" />
          <span className="h-[2px] w-5 rounded bg-white" />
        </button>
      </div>

      {/* Menú a pantalla completa, letras grandes sobre el azul de noche. */}
      <dialog ref={menu} aria-label={textoMenu} className="version m-0 h-dvh max-h-none w-full max-w-none bg-[#06182f] p-0 text-white backdrop:bg-transparent">
        <div className="marco-version flex h-14 items-center justify-end md:h-16">
          <button type="button" onClick={() => menu.current?.close()} aria-label="Cerrar" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-white/10">
            <IconoTache className="size-7" />
          </button>
        </div>
        <nav className="marco-version mt-4">
          <ul className="m-0 grid list-none gap-1 p-0">
            {paginas.map((p, i) => (
              <li key={p.url}>
                <a href={p.url} onClick={() => menu.current?.close()} className="flex items-baseline gap-4 border-b border-white/10 py-4 font-titulo text-[30px] font-medium hover:text-[#7cc4fa]">
                  <span className="text-[14px] text-[#7cc4fa] tabular-nums">0{i + 1}</span>
                  {p.texto}
                </a>
              </li>
            ))}
          </ul>
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 font-semibold text-[#4ade80] underline underline-offset-4">
              <IconoWhatsapp className="size-5" />
              Escríbenos por WhatsApp
            </a>
          )}
        </nav>
      </dialog>
      {carrito && <CarritoHoja cerrar={cerrarCarrito} anadido={carrito.anadido} />}
    </header>
  );
}
