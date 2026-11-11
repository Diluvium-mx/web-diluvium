import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VERSIONES } from "@/lib/versiones";

// /v: lista de las versiones de la portada para revisarlas antes de decidir cuál va a la prueba real en Shopify.

export const metadata: Metadata = { title: "Versiones de la portada" };

export default function ListaVersiones() {
  return (
    <div className="version min-h-dvh bg-niebla text-marino">
      <header className="border-b border-linea bg-white">
        <div className="marco-version flex h-16 items-center md:h-[76px]">
          <Image src="/media/files/Logo_Diluvium_horizontal_sin_fondo.png" alt="Diluvium" width={1572} height={413} sizes="168px" className="h-auto w-[132px] md:w-[168px]" />
        </div>
      </header>
      <main className="marco-version py-10 md:py-14">
        <h1 className="titulo-ancho m-0 text-[32px] md:text-[44px]">Versiones de la portada</h1>
        <p className="m-0 mt-3 max-w-[46rem] text-[17px] leading-[1.6] text-texto-suave">
          La página de hoy (A) y 4 versiones de la B. Todas comparten la misma base y solo cambia la primera pantalla.
          Se editan en el administrador (Plantillas › «Portada · versión …»). Estas páginas no aparecen en Google.
        </p>
        <ul className="m-0 mt-8 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
          {VERSIONES.map((v) => (
            <li key={v.clave} className="flex flex-col rounded-2xl border border-linea bg-white p-6">
              <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="titulo-ancho text-[28px]">{v.etiqueta}</span>
                <span className="font-titulo text-[19px] font-bold">{v.nombre}</span>
                {v.recomendada && <span className="text-[14px] font-semibold text-texto-suave">(recomendada)</span>}
              </p>
              <dl className="m-0 mt-4 grid gap-3 text-[15.5px] leading-[1.5] text-tinta">
                {[
                  ["Qué cambia arriba", v.cambia],
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
              <Link
                href={`/v/${v.clave}`}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-marino px-5 font-titulo font-bold text-white hover:bg-marino-hondo"
              >
                Ver versión {v.etiqueta}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-8 max-w-[46rem] text-[15px] leading-[1.6] text-texto-suave">
          Cada versión manda a Clarity (cuando esté instalado) la etiqueta «version» y los mismos eventos que la prueba de
          Shopify: boton_portada, elige_tamano, abre_tabla, agrega_carrito, toca_whatsapp, ve_precio e interaccion_util.
        </p>
      </main>
    </div>
  );
}
