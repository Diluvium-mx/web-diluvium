// Migas de pan de la página de producto (sección «breadcrumb»): «Inicio › Nombre del producto». Si el nombre no cabe,
// baja al siguiente renglón como en la tienda.

import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" aria-hidden="true" focusable="false">
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function MigasDePan({ seccion, producto }: PropsSeccion) {
  return (
    <div className={esquema(seccion.ajustes)} data-seccion="breadcrumb">
      <nav aria-label="Migas de pan" className="contenedor py-4 md:py-6 min-[1025px]:py-8">
        <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-[13.6px] leading-6 break-words">
          <li>
            <Link href="/" className="leading-[17px]">
              Inicio
            </Link>
          </li>
          {producto && (
            <>
              <li className="flex">
                <Flecha />
              </li>
              <li>
                <span aria-current="page" className="leading-[17px] opacity-60">
                  {producto.titulo}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
}
