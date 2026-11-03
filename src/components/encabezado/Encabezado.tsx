"use client";

// Encabezado con logo, menú, búsqueda y carrito (sección «header»). En celular y tableta el menú va en un panel
// que sale por la izquierda; en computadora, en línea junto al logo. Se queda pegado arriba al bajar.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import menus from "@contenido/menus.json";
import type { Seccion } from "@/lib/contenido";
import { numero, texto } from "@/lib/contenido";
import { IconoBolsa, IconoBuscar, IconoCerrar, IconoMenu } from "@/components/comunes/Iconos";

export function Encabezado({ seccion }: { seccion: Seccion }) {
  const ruta = usePathname();
  // El menú queda abierto solo en la ruta donde se abrió: al navegar se cierra solo.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === ruta;
  const setAbierto = (si: boolean) => setAbiertoEn(si ? ruta : null);
  const logo = texto(seccion.ajustes, "logo");
  const anchoLogo = numero(seccion.ajustes, "logo_width", 200);
  const anchoLogoCel = numero(seccion.ajustes, "logo_width_mobile", 140);
  const enlaces = menus.principal.enlaces;

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
  }, [abierto]);

  const activo = (url: string) => (url === "/" ? ruta === "/" : ruta.startsWith(url));

  return (
    <header className="sticky top-0 z-30 bg-white text-azul" data-seccion="header">
      <div
        className="contenedor encabezado-rejilla grid items-center gap-x-2 py-4 md:gap-x-6 xl:gap-x-8"
        style={{ "--logo": `${anchoLogo}px`, "--logo-cel": `${anchoLogoCel}px` } as React.CSSProperties}
      >
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center xl:hidden"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(true)}
        >
          <IconoMenu tamano={20} />
        </button>

        <Link href="/" className="flex justify-center xl:justify-start" aria-label="Diluvium, inicio">
          {logo && (
            <Image
              src={logo}
              alt="Diluvium"
              width={400}
              height={105}
              priority
              className="h-auto w-[var(--logo-cel)] xl:w-[var(--logo)]"
            />
          )}
        </Link>

        <nav className="hidden xl:block" aria-label="Menú principal">
          <ul className="flex items-center gap-8">
            {enlaces.map((e) => (
              <li key={e.url}>
                <Link
                  href={e.url}
                  className={`block py-2 font-titulo text-[19.2px] font-medium leading-6 hover:underline ${activo(e.url) ? "text-naranja" : ""}`}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-3.5">
          <Link href="/search" aria-label="Buscar" className="flex h-10 w-5 xl:h-11 items-center justify-center xl:w-6">
            <IconoBuscar className="h-5 w-5 xl:h-6 xl:w-6" />
          </Link>
          <Link href="/cart" aria-label="Carrito 0 artículos" className="flex h-10 w-5 xl:h-11 items-center justify-center xl:w-11">
            <IconoBolsa className="h-5 w-5 xl:h-6 xl:w-6" />
          </Link>
        </div>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-40 xl:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar menú" onClick={() => setAbierto(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-[400px] flex-col bg-white p-6 text-azul shadow-xl">
            <button type="button" className="mb-6 self-end" aria-label="Cerrar menú" onClick={() => setAbierto(false)}>
              <IconoCerrar />
            </button>
            <ul className="flex flex-col">
              {enlaces.map((e) => (
                <li key={e.url} className="border-b border-azul/15">
                  <Link
                    href={e.url}
                    className={`block py-4 font-titulo text-[19.2px] font-medium ${activo(e.url) ? "text-naranja" : ""}`}
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
