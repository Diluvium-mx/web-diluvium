// Sección «c-tamanos» (portada de C): «Mide tu entrada y listo». La foto de la compuerta puesta a un lado y la regla
// de tamaños (ReglaTamanos.tsx) para elegir y comprar ahí mismo, sin ir a la ficha.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoC, Etiqueta } from "./comun";
import { ReglaTamanos, type TextosRegla } from "./ReglaTamanos";

export function textosRegla(a: Record<string, unknown>): TextosRegla {
  return {
    mide: tx(a, "ruler_label", "Arrastra hasta el ancho de tu entrada"),
    teQueda: tx(a, "ruler_result", "Te queda la"),
    anadir: tx(a, "add_button", "Añadir al carrito"),
    agotado: tx(a, "sold_out", "Agotado por ahora"),
    masAncha: tx(a, "wider_text", "¿Mide más de 120 cm?"),
    masAngosta: tx(a, "wider_link_text", "Ve la XXL a tu medida"),
  };
}

export function TamanosC({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = texto(a, "fondo") || "claro";
  const venta = datosVenta(texto(a, "producto") || undefined);
  const foto = texto(a, "image");
  return (
    <section data-seccion="c-tamanos" id="tamanos" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoC(fondo)} py-14 md:py-20`}>
      <div className="marco-version grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="lg:order-2">
          <Etiqueta oscuro={fondo === "noche"}>{formato(textoVersion(a, "subheading"))}</Etiqueta>
          <h2 id={`titulo-${seccion.id}`} className={`titulo-version m-0 mt-2 text-[32px] md:text-[44px] ${fondo === "noche" ? "text-white" : "text-[#06182f]"}`}>
            {formato(textoVersion(a, "heading"))}
          </h2>
          {texto(a, "text") && <p className={`m-0 mt-3 text-[17px] leading-[1.55] ${fondo === "noche" ? "text-white/75" : "text-texto-suave"}`}>{formato(textoVersion(a, "text", venta))}</p>}
          <div className={`mt-6 rounded-[28px] p-5 md:p-6 ${fondo === "noche" ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-[0_20px_50px_-30px_rgba(6,24,47,0.5)]"}`}>
            {venta && <ReglaTamanos tamanos={venta.tamanos} textos={textosRegla(a)} oscuro={fondo === "noche"} enlaceMasAncha={texto(a, "wider_link") || undefined} />}
          </div>
        </div>
        {foto && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] lg:order-1">
            <Image src={foto} alt={texto(a, "alt")} fill sizes="(min-width: 1024px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
      </div>
    </section>
  );
}
