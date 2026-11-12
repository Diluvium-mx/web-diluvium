import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTOS_VERSION, VERSIONES } from "@/lib/versiones";

// /v: lista de las versiones (portada y ficha de la compuerta) para revisarlas antes de decidir cuál va a la prueba.

export const metadata: Metadata = { title: "Versiones de la página" };

export default function ListaVersiones() {
  return (
    <div className="version min-h-dvh bg-niebla text-marino">
      <header className="border-b border-linea bg-white">
        <div className="marco-version flex h-16 items-center md:h-[76px]">
          <Image src="/media/files/Logo_Diluvium_horizontal_sin_fondo.png" alt="Diluvium" width={1572} height={413} sizes="168px" className="h-auto w-[132px] md:w-[168px]" />
        </div>
      </header>
      <main className="marco-version py-8 md:py-12">
        <h1 className="titulo-ancho m-0 text-[32px] md:text-[44px]">Versiones de la página</h1>
        <ul className="m-0 mt-6 grid list-none gap-4 p-0 lg:grid-cols-2 md:mt-8">
          {VERSIONES.map((v) => (
            <li
              key={v.clave}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-4 rounded-2xl border border-linea bg-white p-5 sm:gap-x-6 sm:p-6"
            >
              <div className="min-w-0">
                <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="titulo-ancho text-[28px]">{v.etiqueta}</span>
                  <span className="font-titulo text-[19px] font-bold">{v.nombre}</span>
                  {v.recomendada && <span className="text-[14px] font-semibold text-texto-suave">(recomendada)</span>}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/v/${v.clave}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-marino px-5 font-titulo font-bold text-white hover:bg-marino-hondo"
                  >
                    Portada
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href={`/v/${v.clave}/products/${PRODUCTOS_VERSION[0]}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-marino px-5 font-titulo font-bold text-marino hover:bg-niebla"
                  >
                    Producto
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              {/* Primera pantalla en celular (herramientas/capturar-versiones.mjs). Lleva a la portada. */}
              <Link
                href={`/v/${v.clave}`}
                aria-label={`Ver la portada ${v.etiqueta} (así abre en el celular)`}
                className="row-span-1 block w-[104px] self-start overflow-hidden rounded-[18px] border-[5px] border-tinta bg-tinta shadow-[0_10px_24px_-14px_rgba(12,30,51,0.7)] sm:row-span-2 sm:w-[150px] xl:w-[164px]"
              >
                <Image
                  src={`/media/versiones/portada-${v.clave}.webp`}
                  alt=""
                  width={390}
                  height={844}
                  unoptimized
                  className="block h-auto w-full rounded-[13px]"
                />
              </Link>
              <dl className="col-span-2 m-0 grid gap-3 text-[15.5px] leading-[1.5] text-tinta sm:col-span-1">
                {[
                  ["Qué cambia en la portada", v.cambia],
                  ["Qué cambia en el producto", v.cambiaFicha],
                  ["Qué prueba", v.prueba],
                  ["A favor", v.aFavor],
                  ["En contra", v.enContra],
                ].map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-bold text-marino">{t}</dt>
                    <dd className="m-0">{d}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
