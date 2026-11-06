import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pedidoConfirmado } from "@/lib/pago/acciones";
import { ESTADOS, type Direccion } from "@/lib/pago/tipos";
import { articulo } from "@/components/carrito/catalogo";
import { EncabezadoPago } from "@/components/pago/Encabezado";
import { IconoFlecha } from "@/components/pago/Iconos";
import { Costos, Lineas, dinero, type LineaVista } from "@/components/pago/Resumen";

// /checkout/gracias?pedido=<número>&clave=<clave>: la confirmación del pedido, como la página de «gracias» de Shopify
// («Pedido #… · ¡Gracias, …!», «Tu pedido está confirmado», contacto, direcciones, pago, envío y el resumen). Solo se
// muestra con el número Y la clave del pedido (pedidoConfirmado); si no, 404.

export const metadata: Metadata = {
  title: { absolute: "¡Gracias por tu compra! – Diluvium" },
  robots: { index: false, follow: false },
};

const METODOS: Record<string, string> = { tarjeta: "Tarjeta de crédito", paypal: "PayPal", mercadopago: "Mercado Pago" };

function nombreEstado(clave: string) {
  return ESTADOS.find((e) => e.clave === clave)?.nombre ?? clave;
}

function BloqueDireccion({ d }: { d: Direccion }) {
  return (
    <address className="not-italic text-tenue">
      {`${d.nombre} ${d.apellidos}`.trim()}
      <br />
      {d.direccion}
      {d.interior && (
        <>
          <br />
          {d.interior}
        </>
      )}
      <br />
      {`${d.codigoPostal} ${d.ciudad}`.trim()}, {nombreEstado(d.estado)}
      <br />
      México
      {d.telefono && (
        <>
          <br />
          {d.telefono}
        </>
      )}
    </address>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-[6px] text-[14px] leading-[18.9px] font-semibold">{titulo}</h3>
      {children}
    </div>
  );
}

export default async function PaginaGracias({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const numero = Number(typeof sp.pedido === "string" ? sp.pedido : NaN);
  const clave = typeof sp.clave === "string" ? sp.clave : "";
  const p = await pedidoConfirmado(numero, clave);
  if (!p) notFound();

  const lineas: LineaVista[] = p.articulos.map((a) => ({
    id: a.idVariante,
    titulo: a.titulo,
    opcion: a.opcion,
    cantidad: a.cantidad,
    precio: a.precio,
    imagen: articulo(a.idVariante)?.imagen?.src ?? null,
  }));
  const descuento = p.totales.descuento > 0 ? { codigo: p.totales.codigoDescuento, monto: p.totales.descuento } : null;
  const envio = { nombre: p.totales.metodoEnvio, costo: p.totales.envio };
  const resumen = (
    <>
      <Lineas lineas={lineas} />
      <div className="mt-[34px]">
        <Costos subtotal={p.totales.subtotal} descuento={descuento} envio={envio} total={p.total} />
      </div>
    </>
  );

  return (
    <>
      <EncabezadoPago />

      {/* Celular y tableta: el resumen plegado arriba. */}
      <details className="group bg-gris c:hidden">
        <summary className="mx-auto flex h-[63px] max-w-[580px] cursor-pointer list-none items-center justify-between gap-4 px-[14px] outline-acento focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-acento">
            Resumen del pedido
            <span className="group-open:rotate-180">
              <IconoFlecha />
            </span>
          </span>
          <strong className="text-[18px] leading-[24.3px] font-semibold">{dinero(p.total)}</strong>
        </summary>
        <div className="mx-auto max-w-[580px] px-[14px] pt-[16px] pb-5">{resumen}</div>
      </details>

      <div className="c:grid c:min-h-[calc(100vh-121px)] c:grid-cols-[calc(50%+50px)_calc(50%-50px)]">
        <div className="c:flex c:justify-end c:pr-10 c:pl-[14px]">
          <main className="mx-auto w-full max-w-[580px] px-[14px] pt-5 pb-10 c:mx-0 c:max-w-[500px] c:px-0 c:pt-10">
            <div className="flex items-center gap-[14px]">
              <svg viewBox="0 0 50 50" className="size-[50px] shrink-0 text-acento" aria-hidden="true" focusable="false">
                <circle cx="25" cy="25" r="23.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m15.5 25.5 6.5 6.5 13-14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-tenue">Pedido #{p.numero}</p>
                <h1 className="text-[24px] leading-[30px] font-semibold">¡Gracias{p.nombre ? `, ${p.nombre}` : ""}!</h1>
              </div>
            </div>

            <section className="mt-5 rounded-[12px] border border-borde p-[18px]">
              <h2 className="text-[16px] leading-[19.2px] font-semibold">Tu pedido está confirmado</h2>
              <p className="mt-[6px] text-tenue">Recibirás un correo electrónico de confirmación con tu número de pedido en breve.</p>
            </section>

            <section className="mt-5 rounded-[12px] border border-borde p-[18px]">
              <h2 className="text-[16px] leading-[19.2px] font-semibold">Detalles del pedido</h2>
              <div className="mt-[18px] grid gap-[18px] t:grid-cols-2">
                <Dato titulo="Información de contacto">
                  <p className="break-words text-tenue">{p.correo}</p>
                </Dato>
                <Dato titulo="Método de pago">
                  <p className="text-tenue">
                    {METODOS[p.metodo] ?? p.metodo} · {dinero(p.total)}
                  </p>
                  {p.estadoPago === "pendiente" && <p className="mt-[2px] text-[12px] leading-[16.2px] text-tenue">Pago pendiente</p>}
                </Dato>
                <Dato titulo="Dirección de envío">
                  <BloqueDireccion d={p.entrega} />
                </Dato>
                <Dato titulo="Dirección de facturación">
                  <BloqueDireccion d={p.facturacion} />
                </Dato>
                <Dato titulo="Método de envío">
                  <p className="text-tenue">{p.totales.metodoEnvio}</p>
                </Dato>
              </div>
            </section>

            <div className="mt-5 flex flex-col-reverse items-center gap-5 t:flex-row t:justify-between">
              <p>
                ¿Necesitas ayuda?{" "}
                <Link href="/pages/contact" className="text-acento underline underline-offset-2">
                  Ponte en contacto con nosotros
                </Link>
              </p>
              <Link
                href="/"
                className="flex h-[50px] w-full items-center justify-center rounded-[12px] bg-acento px-6 text-[16px] font-semibold text-white outline-acento hover:bg-[rgb(0,78,179)] focus-visible:outline-2 focus-visible:outline-offset-2 t:w-auto"
              >
                Seguir comprando
              </Link>
            </div>
          </main>
        </div>

        <div className="hidden bg-gris c:block c:pl-10">
          <aside aria-label="Resumen del pedido" className="sticky top-0 max-w-[400px] pt-10 pb-10">
            {resumen}
          </aside>
        </div>
      </div>
    </>
  );
}
