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
      <main className="marco-version py-10 md:py-14">
        <h1 className="titulo-ancho m-0 text-[32px] md:text-[44px]">Versiones de la página</h1>
        <p className="m-0 mt-3 max-w-[46rem] text-[17px] leading-[1.6] text-texto-suave">
          La página de hoy (A) y 6 versiones de la B, cada una con su portada y su ficha de la compuerta (la página a la
          que llega casi toda la gente desde los anuncios). La ficha nueva sale del mapa de calor de Clarity: precio,
          tamaños y botón en la primera pantalla del celular. Se editan en el administrador (Plantillas › «Portada ·
          versión …» y «Producto · versión …»). Estas páginas no aparecen en Google.
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
                  ["Qué cambia en la portada", v.cambia],
                  ["Qué cambia en la ficha", v.cambiaFicha],
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
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Link
                  href={`/v/${v.clave}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-marino px-5 font-titulo font-bold text-white hover:bg-marino-hondo"
                >
                  Portada {v.etiqueta}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={`/v/${v.clave}/products/${PRODUCTOS_VERSION[0]}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-marino px-5 font-titulo font-bold text-marino hover:bg-niebla"
                >
                  Ficha {v.etiqueta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="m-0 mt-8 max-w-[46rem] text-[15px] leading-[1.6] text-texto-suave">
          Cada versión manda a Clarity (cuando esté instalado) la etiqueta «version» y los mismos eventos que la prueba de
          Shopify: boton_portada, elige_tamano, abre_tabla, agrega_carrito, toca_whatsapp, ve_precio e interaccion_util.
          La ficha nueva agrega mira_galeria, mira_video, usa_medida y toca_marketplace (ir a Mercado Libre o Amazon).
        </p>
      </main>
    </div>
  );
}
