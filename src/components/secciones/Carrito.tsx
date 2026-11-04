// Página del carrito (sección «main-cart»). Hoy solo se ve vacío, igual que en vivo: «Su carrito (0)», «Su carrito
// está vacío» y el botón «Seguir comprando». Paso 3: carrito (artículos, cantidades, totales y pago).

import Link from "next/link";
import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";

// Paso 3: carrito. Mientras no exista, siempre está vacío.
const ARTICULOS = 0;

export function Carrito({ seccion }: PropsSeccion) {
  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)]`} data-seccion="main-cart">
      <div className="contenedor">
        <div className="flex flex-col gap-[var(--hueco)]">
          <div>
            <h1 className="text-center" style={{ fontSize: "var(--h4)" }}>
              Su carrito (<span>{ARTICULOS}</span>)
            </h1>
          </div>
          <div className="p-4 text-center md:p-6 min-[1025px]:p-8">
            <h6 className="pb-4 md:pb-6 min-[1025px]:pb-8">Su carrito está vacío</h6>
            <Link
              href="/collections/all"
              className="relative isolate inline-flex min-h-10 items-center justify-center overflow-hidden bg-white px-5 py-1.5 font-titulo font-medium shadow-[inset_0_0_0_1px_rgba(0,66,136,0.12)] transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-azul-oscuro after:transition-[bottom] after:duration-[400ms] hover:text-white hover:after:bottom-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
