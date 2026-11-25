// Sección «d-otros»: «Otros productos» en tarjetas (foto, nombre y precio del catálogo) que llevan a su ficha dentro
// de la versión. Piezas «product»: el producto (su dirección, sin /products/), su foto (se cambia en el editor) y un
// nombre corto. En la ficha de un producto no se muestra ese mismo producto.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { datosVenta, pesos, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { claseFondoD, EtiquetaD, TARJETA_D, TituloD } from "./comun";

export function OtrosD({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const tarjetas = seccion.bloques
    .filter((b) => b.tipo === "product" && texto(b.ajustes, "producto") && texto(b.ajustes, "producto") !== producto?.nombre)
    .map((b) => ({ b, venta: datosVenta(texto(b.ajustes, "producto")) }))
    .filter((x) => x.venta);
  if (!tarjetas.length) return null;
  return (
    <section data-seccion="d-otros" aria-labelledby={`titulo-${seccion.id}`} className={`${claseFondoD(texto(a, "fondo") || "gris")} py-12 md:py-20`}>
      <div className="marco-version">
        <EtiquetaD>{formato(textoVersion(a, "subheading"))}</EtiquetaD>
        <TituloD id={`titulo-${seccion.id}`}>{formato(textoVersion(a, "heading"))}</TituloD>
        <ul className="m-0 mt-7 grid list-none grid-cols-2 gap-3 p-0 md:gap-5 lg:grid-cols-4">
          {tarjetas.map(({ b, venta }) => {
            const foto = texto(b.ajustes, "image");
            const varios = new Set(venta!.tamanos.map((t) => t.precio)).size > 1;
            return (
              <li key={b.id} data-pieza={b.id}>
                <a href={venta!.enlace} className={`${TARJETA_D} flex h-full flex-col overflow-hidden hover:border-[#0b2545]`}>
                  <span className="relative block aspect-square bg-[#f4f6f8]">
                    {foto && <Image src={foto} alt={texto(b.ajustes, "alt") || venta!.nombre} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" style={estiloFoto(b.ajustes)} {...marcaEditar(seccion.id, b.id, "image")} />}
                  </span>
                  <span className="flex flex-1 flex-col p-3 md:p-4">
                    <span className="block font-titulo text-[17px] leading-snug font-semibold text-[#0b2545] md:text-[19px]">{textoVersion(b.ajustes, "heading") || venta!.nombre}</span>
                    <span className="mt-auto block pt-2 text-[15px] text-[#4a5568]">{varios ? tx(a, "from_text", "Desde") : " "}</span>
                    <span className="block font-titulo text-[22px] font-bold text-[#0b2545]">{pesos(venta!.precio)}</span>
                    <span className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b2545] px-3 text-[16px] font-semibold text-white">{tx(a, "button_text", "Ver producto")}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
