"use client";

// Encabezado de C (25-nov-2026, para 40-60 años): blanco, con el logo a color, el carrito y «Menú» escrito (no solo el
// ícono de rayitas). El menú abre un panel a pantalla completa con las páginas en letra grande y, abajo, WhatsApp y
// teléfono. El WhatsApp y el teléfono también van fijos abajo en toda la página (BarraAyudaC).

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { alAbrirCarrito, useCarrito } from "@/components/carrito/estado";
import { IconoBolsa } from "@/components/comunes/Iconos";
import { CarritoHoja } from "../landing/CarritoHoja";
import { IconoTache, IconoWhatsapp } from "../landing/piezas";
import { BOTON_C_SEC, BOTON_WHATSAPP_C, IconoTelefono } from "./comun";

export function EncabezadoCCliente({
  logo,
  logoMarca,
  whatsapp,
  telefono,
  textoTelefono,
  textoMenu,
  paginas,
}: {
  logo: string;
  logoMarca?: Record<string, string>;
  whatsapp: string;
  telefono: string;
  textoTelefono: string;
  textoMenu: string;
  paginas: { texto: string; url: string }[];
}) {
  const [carrito, setCarrito] = useState<{ anadido: boolean } | null>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const { piezas } = useCarrito();
  const cerrarCarrito = useCallback(() => setCarrito(null), []);
  useEffect(() => alAbrirCarrito(({ anadido }) => setCarrito({ anadido })), []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#dbe7f3] bg-white text-[#06182f]">
      <div className="marco-version flex h-16 items-center gap-2">
        {/* Enlace normal y no <Link>: EnlacesVersion le pone la dirección de la versión y <Link> la ignoraría. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="mr-auto flex items-center" aria-label="Diluvium, ir al inicio">
          {logo && (
            <span className="block overflow-hidden">
              <Image src={logo} alt="Diluvium" width={1572} height={413} preload sizes="140px" className="h-auto w-[124px] md:w-[140px]" {...logoMarca} />
            </span>
          )}
        </a>
        <button type="button" onClick={() => setCarrito({ anadido: false })} aria-label={`Carrito, ${piezas} artículos`} className="relative flex size-12 cursor-pointer items-center justify-center rounded-full hover:bg-[#f3f8fd]">
          <IconoBolsa className="size-7" />
          {piezas > 0 && <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-boton text-[12px] font-bold text-white">{piezas}</span>}
        </button>
        <button
          type="button"
          onClick={() => menu.current?.showModal()}
          aria-haspopup="dialog"
          className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-[#06182f] px-3.5 font-titulo text-[17px] font-medium hover:bg-[#f3f8fd]"
        >
          <span className="flex flex-col gap-[4px]" aria-hidden="true">
            <span className="h-[2.5px] w-5 rounded bg-current" />
            <span className="h-[2.5px] w-5 rounded bg-current" />
            <span className="h-[2.5px] w-5 rounded bg-current" />
          </span>
          {textoMenu}
        </button>
      </div>

      <dialog ref={menu} aria-label={textoMenu} className="version m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-[#06182f] backdrop:bg-transparent">
        <div className="marco-version flex h-16 items-center justify-between border-b border-[#dbe7f3]">
          <p className="m-0 font-titulo text-[20px] font-medium">{textoMenu}</p>
          <button type="button" onClick={() => menu.current?.close()} className="flex h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-[17px] font-semibold hover:bg-[#f3f8fd]">
            <IconoTache className="size-7" />
            Cerrar
          </button>
        </div>
        <nav className="marco-version mt-2">
          <ul className="m-0 grid list-none p-0">
            {paginas.map((p) => (
              <li key={p.url}>
                <a href={p.url} onClick={() => menu.current?.close()} className="flex min-h-16 items-center justify-between border-b border-[#dbe7f3] font-titulo text-[24px] font-medium hover:text-[#1663a8]">
                  {p.texto}
                  <span aria-hidden="true" className="text-[#1663a8]">
                    ›
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={BOTON_WHATSAPP_C}>
                <IconoWhatsapp className="size-6" />
                Escríbenos por WhatsApp
              </a>
            )}
            {telefono && (
              <a href={telefono} data-evento="toca_telefono" className={BOTON_C_SEC}>
                <IconoTelefono />
                {textoTelefono}
              </a>
            )}
          </div>
        </nav>
      </dialog>
      {carrito && <CarritoHoja cerrar={cerrarCarrito} anadido={carrito.anadido} />}
    </header>
  );
}
