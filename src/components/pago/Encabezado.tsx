import Image from "next/image";
import Link from "next/link";
import { IconoBolsa } from "./Iconos";

// Encabezado de la pantalla de pago: el logotipo al centro (lleva a la tienda) y la bolsa a la derecha (al carrito). A
// la izquierda va otra bolsa invisible para que el logotipo quede centrado, como en vivo. En computadora lleva una
// línea gris abajo; en celular y tableta, la barra gris del resumen va pegada.

export function EncabezadoPago() {
  return (
    <header className="bg-white c:border-b c:border-borde">
      <div className="mx-auto grid h-[118px] max-w-[580px] grid-cols-[24px_minmax(0,1fr)_24px] items-center gap-x-10 px-[14px] t:h-[120px] c:max-w-[1008px]">
        <span className="invisible flex" aria-hidden="true">
          <IconoBolsa />
        </span>
        <Link href="/" className="mx-auto block w-full max-w-[239px] outline-acento focus-visible:outline-2">
          <Image
            src="/media/files/Logo_Diluvium_chico_x320.png"
            alt="Diluvium"
            width={239}
            height={80}
            priority
            sizes="239px"
            className="h-auto max-h-20 w-full object-contain"
          />
          <span className="solo-lector">Ir a la tienda online</span>
        </Link>
        <Link href="/cart" aria-label="Carrito" className="flex text-acento outline-acento focus-visible:outline-2">
          <IconoBolsa />
        </Link>
      </div>
    </header>
  );
}
