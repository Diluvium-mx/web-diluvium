"use client";

// Encabezado de D (25-nov-2026): arriba una franja azul marino con los avisos (envío gratis, meses sin intereses,
// garantía), cada uno con su ícono, que corre despacio como en Andafacil (se queda quieta si el teléfono pide menos
// movimiento y se detiene al pasar el dedo o el ratón). Abajo, blanco: el logo, en la computadora los enlaces
// principales, el botón de WhatsApp, el carrito y «Menú» escrito, que abre un panel con todos los productos y las
// páginas en letra grande.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { alAbrirCarrito, useCarrito } from "@/components/carrito/estado";
import { IconoBolsa } from "@/components/comunes/Iconos";
import { CarritoHoja } from "../landing/CarritoHoja";
import { TEXTOS_CARRITO_CD } from "../c/comun";
import { IconoTache, IconoWhatsapp } from "../landing/piezas";
import { BOTON_D_WHATSAPP, IconoD } from "./comun";

type Enlace = { id: string; texto: string; url: string; grupo: string };

const ANIMACION = "@keyframes cinta-d{from{transform:translateX(0)}to{transform:translateX(-50%)}}";

export function EncabezadoDCliente({
  logo,
  logoMarca,
  avisos,
  enlaces,
  whatsapp,
  textos,
}: {
  logo: string;
  logoMarca?: Record<string, string>;
  avisos: { id: string; icono: string; texto: string }[];
  enlaces: Enlace[];
  whatsapp: string;
  textos: { menu: string; cerrar: string; whatsapp: string; whatsappMenu: string; productos: string; ayuda: string };
}) {
  const [carrito, setCarrito] = useState<{ anadido: boolean } | null>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const { piezas } = useCarrito();
  const cerrarCarrito = useCallback(() => setCarrito(null), []);
  useEffect(() => alAbrirCarrito(({ anadido }) => setCarrito({ anadido })), []);
  const principales = enlaces.filter((e) => e.grupo !== "productos");
  const productos = enlaces.filter((e) => e.grupo === "productos");
  // En el menú no se repite lo que ya está en «Productos» (p. ej. «Productos» y «Todos los productos»).
  const paginasMenu = principales.filter((e) => !productos.some((p) => p.url === e.url));
  const tira = (copia: boolean) => (
    <ul className="m-0 flex shrink-0 list-none items-center gap-10 p-0 pr-10" aria-hidden={copia || undefined}>
      {avisos.map((a) => (
        <li key={a.id} data-pieza={copia ? undefined : a.id} className="flex items-center gap-2 text-[16px] font-semibold whitespace-nowrap">
          <IconoD nombre={a.icono} className="size-5 text-[#ffc83d]" />
          {a.texto}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {avisos.length > 0 && (
        <div className="overflow-hidden bg-[#0b2545] text-white motion-reduce:overflow-x-auto">
          <style>{ANIMACION}</style>
          <div className="group flex h-11 w-max items-center motion-safe:animate-[cinta-d_38s_linear_infinite] hover:[animation-play-state:paused] lg:mx-auto lg:w-auto lg:justify-center lg:motion-safe:animate-none">
            {tira(false)}
            <span className="contents lg:hidden">{tira(true)}</span>
          </div>
        </div>
      )}
      <header data-seccion="d-encabezado" className="sticky top-0 z-40 border-b border-[#dde2e8] bg-white text-[#0b2545] shadow-[0_4px_16px_-12px_rgba(11,37,69,0.5)]">
        <div className="marco-version flex h-[68px] items-center gap-2">
          {/* Enlace normal y no <Link>: EnlacesVersion le pone la dirección de la versión. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="mr-auto flex items-center" aria-label="Diluvium, ir al inicio">
            {logo && <Image src={logo} alt="Diluvium" width={1572} height={413} preload sizes="150px" className="h-auto w-[128px] md:w-[150px]" {...logoMarca} />}
          </a>
          <nav aria-label="Principal" className="mr-4 hidden lg:block">
            <ul className="m-0 flex list-none gap-1 p-0">
              {principales.map((e) => (
                <li key={e.id}>
                  <a href={e.url} className="inline-flex min-h-11 items-center rounded-lg px-3 text-[17px] font-semibold hover:bg-[#f4f6f8]">
                    {e.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className="hidden h-12 items-center gap-2 rounded-xl bg-[#15803d] px-4 font-titulo text-[16px] font-semibold text-white hover:bg-[#116932] md:inline-flex">
              <IconoWhatsapp className="size-5" />
              {textos.whatsapp}
            </a>
          )}
          <button type="button" onClick={() => setCarrito({ anadido: false })} aria-label={`Carrito, ${piezas} artículos`} className="relative flex size-12 cursor-pointer items-center justify-center rounded-full hover:bg-[#f4f6f8]">
            <IconoBolsa className="size-7" />
            {piezas > 0 && <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-boton text-[12px] font-bold text-white">{piezas}</span>}
          </button>
          <button
            type="button"
            onClick={() => menu.current?.showModal()}
            aria-haspopup="dialog"
            className="flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#0b2545] px-3.5 font-titulo text-[17px] font-semibold text-white hover:bg-[#13345e]"
          >
            <span className="flex flex-col gap-[4px]" aria-hidden="true">
              <span className="h-[2.5px] w-5 rounded bg-current" />
              <span className="h-[2.5px] w-5 rounded bg-current" />
              <span className="h-[2.5px] w-5 rounded bg-current" />
            </span>
            {textos.menu}
          </button>
        </div>

        <dialog ref={menu} aria-label={textos.menu} className="version m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-[#0b2545] backdrop:bg-transparent lg:ml-auto lg:max-w-[480px] lg:shadow-2xl">
          <div className="flex h-[68px] items-center justify-between border-b border-[#dde2e8] bg-[#0b2545] px-4 text-white">
            <p className="m-0 font-titulo text-[20px] font-semibold">{textos.menu}</p>
            <button type="button" onClick={() => menu.current?.close()} className="flex h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-[17px] font-semibold hover:bg-white/10">
              <IconoTache className="size-7" />
              {textos.cerrar}
            </button>
          </div>
          <nav className="px-4 pt-4 pb-10">
            {productos.length > 0 && (
              <>
                <p className="m-0 font-titulo text-[15px] font-bold tracking-[0.06em] text-[#9a6700] uppercase">{textos.productos}</p>
                <ul className="m-0 mt-1 grid list-none p-0">
                  {productos.map((e) => (
                    <li key={e.id}>
                      <a href={e.url} onClick={() => menu.current?.close()} className="flex min-h-14 items-center justify-between border-b border-[#eef1f4] text-[20px] font-semibold hover:text-[#13345e]">
                        {e.texto}
                        <span aria-hidden="true" className="text-[24px] text-[#9a6700]">
                          ›
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {paginasMenu.length > 0 && (
              <>
                <p className="m-0 mt-6 font-titulo text-[15px] font-bold tracking-[0.06em] text-[#9a6700] uppercase">{textos.ayuda}</p>
                <ul className="m-0 mt-1 grid list-none p-0">
                  {paginasMenu.map((e) => (
                    <li key={e.id}>
                      <a href={e.url} onClick={() => menu.current?.close()} className="flex min-h-14 items-center justify-between border-b border-[#eef1f4] text-[20px] font-semibold hover:text-[#13345e]">
                        {e.texto}
                        <span aria-hidden="true" className="text-[24px] text-[#9a6700]">
                          ›
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className={`${BOTON_D_WHATSAPP} mt-8 sm:w-full`}>
                <IconoWhatsapp className="size-6" />
                {textos.whatsappMenu}
              </a>
            )}
          </nav>
        </dialog>
        {carrito && <CarritoHoja cerrar={cerrarCarrito} anadido={carrito.anadido} textos={TEXTOS_CARRITO_CD} />}
      </header>
    </>
  );
}
