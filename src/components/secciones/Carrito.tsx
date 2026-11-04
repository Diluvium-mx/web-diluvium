// Página del carrito (sección «main-cart»). El contenido (líneas, totales, vacío) vive en el navegador: lo dibuja
// PaginaCarrito con el carrito guardado en localStorage.

import type { PropsSeccion } from "./registro";
import { esquema } from "@/lib/contenido";
import { PaginaCarrito } from "@/components/carrito/PaginaCarrito";

export function Carrito({ seccion }: PropsSeccion) {
  return (
    <div className={`${esquema(seccion.ajustes)} my-[var(--aire)]`} data-seccion="main-cart">
      <div className="contenedor">
        <PaginaCarrito />
      </div>
    </div>
  );
}
