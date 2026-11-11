"use client";

// Encabezado de las versiones B: logo a la izquierda; WhatsApp, carrito, «Comprar» en naranja y «Menú» a la derecha.
// Se queda fijo arriba y gana una sombra al bajar. El menú es una ventana (<dialog>: atrapa el foco y se cierra con
// Esc); el carrito es el mismo carrito lateral de la tienda.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { alAbrirCarrito, useCarrito } from "@/components/carrito/estado";
import { PanelCarrito } from "@/components/encabezado/PanelCarrito";
import { IconoBolsa } from "@/components/comunes/Iconos";
import { IconoTache, IconoWhatsapp } from "./piezas";

export type EnlaceMenu = { texto: string; url: string };

function IconoMenu() {
  // Dos líneas delgadas, la de abajo más corta.
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M3.5 9h17M3.5 15h11" />
    </svg>
  );
}

export function EncabezadoCliente({
  logo,
  botonTexto,
  botonEnlace,
  menuTexto,
  whatsapp,
  enPagina,
  tienda,
}: {
  logo: string;
  botonTexto: string;
  botonEnlace: string;
  menuTexto: string;
  whatsapp: string;
  enPagina: EnlaceMenu[];
  tienda: EnlaceMenu[];
}) {
  const [conSombra, setConSombra] = useState(false);
  const [carrito, setCarrito] = useState<{ anadido: boolean } | null>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const { piezas } = useCarrito();
  const cerrarCarrito = useCallback(() => setCarrito(null), []);

  useEffect(() => alAbrirCarrito(({ anadido }) => setCarrito({ anadido })), []);

  useEffect(() => {
    const alBajar = () => setConSombra(window.scrollY > 8);
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    return () => window.removeEventListener("scroll", alBajar);
  }, []);

  const cerrarMenu = () => menu.current?.close();

  return (
    <header
      data-seccion="landing-encabezado"
      // Fondo blanco sólido: un «backdrop-filter» aquí volvería al encabezado el marco de lo fijo y el carrito lateral
      // (que va adentro) quedaría encerrado en él.
      // Con el carrito abierto el encabezado sube sobre la barra de compra del celular (el carrito va dentro de él).
      className={`sticky top-0 border-b bg-white text-marino transition-shadow duration-300 ${carrito ? "z-[60]" : "z-30"} ${
        conSombra ? "border-linea shadow-[0_6px_20px_-12px_rgba(12,30,51,0.35)]" : "border-transparent"
      }`}
    >
      <div className="marco-version flex h-16 items-center gap-1 md:h-[76px] md:gap-3">
        <Link href="/" className="mr-auto flex shrink-0 items-center" aria-label="Diluvium, ir a la tienda">
          {logo && (
            <Image
              src={logo}
              alt="Diluvium"
              width={1572}
              height={413}
              preload
              sizes="(min-width: 768px) 168px, 104px"
              className="h-auto w-[104px] min-[400px]:w-[112px] md:w-[168px]"
            />
          )}
        </Link>

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-evento="toca_whatsapp"
            aria-label="Escríbenos por WhatsApp (se abre en otra pestaña)"
            className="flex size-9 items-center justify-center rounded-full text-[#1a7f37] hover:bg-niebla md:size-11"
          >
            <IconoWhatsapp className="size-6" />
          </a>
        )}

        <a
          href="/cart"
          role="button"
          aria-haspopup="dialog"
          aria-label={`Carrito, ${piezas} ${piezas === 1 ? "artículo" : "artículos"}`}
          onClick={(e) => {
            e.preventDefault();
            setCarrito({ anadido: false });
          }}
          className="relative flex size-9 items-center justify-center rounded-full hover:bg-niebla md:size-11"
        >
          <IconoBolsa className="size-6" />
          {piezas > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-0.5 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-marino px-1 text-[12px] leading-none font-bold text-white"
            >
              {piezas}
            </span>
          )}
        </a>

        {botonTexto && (
          <a
            href={botonEnlace || "#"}
            data-evento="boton_portada"
            className="ml-0.5 inline-flex h-10 items-center justify-center rounded-lg bg-boton px-3.5 font-titulo text-[15px] font-bold text-tinta [font-stretch:110%] transition-colors hover:bg-boton-encima md:ml-1 md:h-11 md:px-5 md:text-base"
          >
            {botonTexto}
          </a>
        )}

        <button
          type="button"
          onClick={() => menu.current?.showModal()}
          aria-haspopup="dialog"
          className="flex h-10 cursor-pointer items-center gap-1 rounded-lg px-1 font-titulo text-[15px] font-semibold hover:bg-niebla md:h-11 md:px-2.5 md:text-base"
        >
          <IconoMenu />
          <span>{menuTexto || "Menú"}</span>
        </button>
      </div>

      <dialog
        ref={menu}
        aria-label="Menú"
        onClick={(e) => e.target === e.currentTarget && cerrarMenu()}
        className="version m-0 ml-auto h-dvh max-h-dvh w-[min(88vw,380px)] max-w-none bg-white p-0 text-marino open:flex open:flex-col"
      >
        <div className="flex items-center justify-between border-b border-linea px-6 py-4">
          <p className="m-0 font-titulo text-lg font-bold">{menuTexto || "Menú"}</p>
          <button type="button" onClick={cerrarMenu} aria-label="Cerrar menú" className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-niebla">
            <IconoTache className="size-6" />
          </button>
        </div>
        <nav aria-label="En esta página" className="px-6 pt-4">
          <p className="m-0 mb-1 text-[13px] font-semibold tracking-wide text-texto-suave uppercase">En esta página</p>
          <ul className="m-0 list-none p-0">
            {enPagina.map((e) => (
              <li key={e.url}>
                <a href={e.url} onClick={cerrarMenu} className="block border-b border-linea py-3.5 font-titulo text-lg font-semibold">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tienda" className="px-6 pt-6">
          <p className="m-0 mb-1 text-[13px] font-semibold tracking-wide text-texto-suave uppercase">Tienda</p>
          <ul className="m-0 list-none p-0">
            {tienda.map((e) => (
              <li key={e.url}>
                <Link href={e.url} className="block border-b border-linea py-3.5 text-[17px]">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {whatsapp && (
          <div className="mt-auto p-6">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-marino px-4 font-semibold"
            >
              <IconoWhatsapp className="size-5 text-[#1a7f37]" />
              Escríbenos por WhatsApp
            </a>
          </div>
        )}
      </dialog>

      {carrito && <PanelCarrito cerrar={cerrarCarrito} anadido={carrito.anadido} />}
    </header>
  );
}
