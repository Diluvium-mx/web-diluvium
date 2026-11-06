import Link from "next/link";
import { EncabezadoPago } from "@/components/pago/Encabezado";

// Pedido que no existe o enlace de «gracias» con la clave equivocada (pedidoConfirmado regresa null): 404 con el
// encabezado del pago, sin decir si el número de pedido existe.

export default function NoEncontradoPago() {
  return (
    <>
      <EncabezadoPago />
      <main className="mx-auto max-w-[580px] px-[14px] pt-10 pb-10 text-center">
        <h1 className="text-[20px] leading-[24px] font-semibold">No encontramos esta página</h1>
        <p className="mt-2 text-tenue">Revisa el enlace de tu pedido o vuelve a la tienda.</p>
        <Link href="/" className="mt-5 inline-flex h-[50px] items-center rounded-[12px] bg-acento px-6 text-[16px] font-semibold text-white">
          Seguir comprando
        </Link>
      </main>
    </>
  );
}
