// Sección «c-portada»: primera pantalla de C. Fondo de noche con lluvia que cae (solo CSS), el título grande, la
// compuerta sola sobre un círculo de luz y tres cifras enormes (piezas «stat»: 50 cm · 10 min · 0 obras). Distinta de
// B (foto de antes y después en blanco) y de la tienda (foto con texto encima).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, datosVenta, pesos, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { BOTON_C, BOTON_C_CLARO, EstrellaC, Etiqueta } from "./comun";

export function PortadaC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const venta = datosVenta();
  const cifras = seccion.bloques.filter((b) => b.tipo === "stat");
  const foto = texto(a, "image");
  return (
    <section data-seccion="c-portada" aria-labelledby="titulo-portada-c" className="lluvia-c relative overflow-hidden bg-[#06182f] text-white">
      <div className="marco-version relative grid gap-8 pt-8 pb-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14 lg:pt-16 lg:pb-20">
        <div>
          <Etiqueta oscuro>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h1 id="titulo-portada-c" className="titulo-version m-0 mt-3 text-[42px] leading-[1.05] md:text-[64px]">
            {formato(textoVersion(a, "heading"))}
          </h1>
          <p className="m-0 mt-4 max-w-[34rem] text-[17.5px] leading-[1.55] text-white/80 md:text-[19px]">{formato(textoVersion(a, "text"))}</p>
          <p className="m-0 mt-4 flex items-center gap-2 text-[15px] font-semibold">
            <span className="flex text-estrella">
              {[0, 1, 2, 3, 4].map((i) => (
                <EstrellaC key={i} />
              ))}
            </span>
            {calificacion()} · {tx(a, "rating_text", "más de 200 reseñas")}
          </p>
        </div>
        {foto && (
          <div className="relative mx-auto w-full max-w-[420px] lg:row-span-2">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(63,169,245,0.55),rgba(63,169,245,0)_70%)]" aria-hidden="true" />
            <div className="relative aspect-square overflow-hidden rounded-full bg-white/95 shadow-[0_30px_80px_-30px_rgba(63,169,245,0.8)]">
              <Image src={foto} alt={texto(a, "alt")} fill priority sizes="(min-width: 1024px) 420px, 80vw" className="object-contain p-6 mix-blend-multiply" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
            </div>
            {venta && (
              <p className="absolute -bottom-2 left-1/2 m-0 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-center font-titulo text-[15px] font-semibold whitespace-nowrap text-[#06182f] shadow-lg">
                {tx(a, "price_prefix", "Desde")} {pesos(venta.precio)}
                {venta.precioAntes && <s className="ml-2 text-[13px] font-normal text-texto-suave">{pesos(venta.precioAntes)}</s>}
              </p>
            )}
          </div>
        )}
        <div>
          {cifras.length > 0 && (
            <dl className="m-0 grid grid-cols-3 gap-2 border-y border-white/15 py-5">
              {cifras.map((b) => (
                <div key={b.id} data-pieza={b.id} className="text-center">
                  <dt className="font-titulo text-[34px] leading-none font-semibold text-[#7cc4fa] md:text-[44px]">{texto(b.ajustes, "number")}</dt>
                  <dd className="m-0 mt-1.5 text-[13.5px] leading-tight text-white/75">{texto(b.ajustes, "label")}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-6 grid gap-3 sm:flex">
            <a href={tx(a, "button_link", "/products/compuerta-anti-inundaciones")} data-evento="boton_portada" className={BOTON_C}>
              {tx(a, "button_text", "Elegir mi tamaño")} →
            </a>
            {texto(a, "button2_text") && (
              <a href={tx(a, "button2_link", "#historias")} className={BOTON_C_CLARO}>
                {textoVersion(a, "button2_text")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
