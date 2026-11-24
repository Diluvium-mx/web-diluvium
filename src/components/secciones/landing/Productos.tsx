// Sección «landing-productos»: los productos de la tienda en tarjetas (página Productos de B1, /collections/all-products).
// Cada pieza «product» es un producto, en el orden en que se acomodan en la plantilla: foto, etiqueta opcional («La más
// vendida»), nombre, una línea de para qué sirve, estrellas si tiene reseñas y precio. Precio y reseñas salen del
// catálogo y de las reseñas publicadas, nunca se escriben a mano. En el celular cada tarjeta va a lo ancho, con la foto
// a la izquierda (toda la tarjeta lleva al producto); de tableta en adelante, foto arriba y botón «Ver producto».

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { producto as buscarProducto, resenas, resumenPrecio } from "@/components/producto/catalogo";
import { pesos, textoVersion, tx } from "./datos";
import { formato } from "./formato";
import { claseFondo, fondoPropio } from "./Olas";
import { Estrellas, IconoFlecha } from "./piezas";

export function ProductosVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const fondo = fondoPropio(a, "niebla");
  const tarjetas = seccion.bloques
    .filter((b) => b.tipo === "product")
    .map((b) => ({ b, p: buscarProducto(texto(b.ajustes, "producto")) }))
    .filter((x): x is { b: (typeof x)["b"]; p: NonNullable<(typeof x)["p"]> } => Boolean(x.p));
  const titulo = textoVersion(a, "heading");
  return (
    <section data-seccion="landing-productos" aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} className={`${claseFondo(fondo)} py-14 md:py-20`}>
      <div className="marco-version">
        {titulo && (
          <h2 id={`titulo-${seccion.id}`} className="titulo-version m-0 max-w-[40rem] text-[28px] md:text-[38px]">
            {formato(titulo)}
          </h2>
        )}
        {texto(a, "text") && <p className="m-0 mt-3 max-w-[40rem] text-[17px] leading-[1.55] text-tinta">{formato(textoVersion(a, "text"))}</p>}
        <ul className={`m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 ${titulo ? "mt-8 md:mt-10" : ""}`}>
          {tarjetas.map(({ b, p }) => {
            const ba = b.ajustes;
            const foto = texto(ba, "image") || p.imagenes[0]?.src || "";
            const precio = resumenPrecio(p);
            const calif = resenas(p);
            const etiqueta = textoVersion(ba, "badge");
            return (
              <li key={b.id} data-pieza={b.id} className="flex">
                <a
                  href={`/products/${p.nombre}`}
                  className="group flex w-full flex-row overflow-hidden rounded-2xl sm:flex-col bg-white text-marino shadow-[0_18px_40px_-28px_rgba(12,30,51,0.6)] ring-1 ring-linea transition-shadow hover:shadow-[0_22px_50px_-24px_rgba(12,30,51,0.6)]"
                >
                  <div className="relative w-[38%] shrink-0 overflow-hidden bg-white sm:aspect-square sm:w-auto">
                    {foto && (
                      <Image
                        src={foto}
                        alt={texto(ba, "alt") || p.titulo}
                        fill
                        sizes="(min-width: 1200px) 397px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 38vw"
                        style={estiloFoto(ba)}
                        {...marcaEditar(seccion.id, b.id, "image")}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                    {etiqueta && (
                      <span className="absolute top-2 left-2 rounded-full bg-marino px-2.5 py-1 text-[12px] leading-4 font-semibold text-white sm:top-3 sm:left-3 sm:px-3 sm:text-[13px]">{formato(etiqueta)}</span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <h3 className="m-0 font-titulo text-[18px] leading-tight font-medium sm:text-[20px]">{formato(textoVersion(ba, "heading") || p.titulo)}</h3>
                    {texto(ba, "text") && <p className="m-0 mt-1.5 line-clamp-3 text-[14.5px] leading-[1.45] text-texto-suave sm:mt-2 sm:line-clamp-none sm:text-[15.5px] sm:leading-[1.5]">{formato(textoVersion(ba, "text"))}</p>}
                    {calif && (
                      <p className="m-0 mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13.5px] font-semibold sm:mt-3 sm:text-[14px]">
                        <Estrellas className="size-4" />
                        <span>
                          {calif.promedio.toFixed(1)} · {calif.total} {tx(a, "reviews_text", "reseñas")}
                        </span>
                      </p>
                    )}
                    <p className="m-0 mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 sm:pt-4">
                      {precio.desde && <span className="text-[15px] text-texto-suave">{tx(a, "from_text", "Desde")}</span>}
                      <span className="text-[21px] leading-none font-bold sm:text-[24px]">{pesos(precio.precio)}</span>
                      {precio.antes && <span className="text-[15px] text-texto-suave line-through sm:text-[16px]">{pesos(precio.antes)}</span>}
                      {/* El mismo descuento que la ficha del producto (Producto 61; Productos 4, 6, 8 y 9, dueño 24-nov-2026). */}
                      {precio.antes && precio.antes > precio.precio && (
                        <span className="rounded-md bg-[#e3f5e8] px-2 py-0.5 text-[13px] font-bold text-[#1a7f37] sm:text-[14px]">
                          {tx(a, "discount_text", "-{porcentaje}% en descuento").replace(
                            "{porcentaje}",
                            String(Math.round(((precio.antes - precio.precio) / precio.antes) * 100)),
                          )}
                        </span>
                      )}
                    </p>
                    <span className="mt-4 hidden min-h-12 items-center sm:inline-flex justify-center gap-2 rounded-xl border-2 border-marino px-5 font-titulo text-[16px] font-medium transition-colors group-hover:bg-marino group-hover:text-white">
                      {tx(a, "button_text", "Ver producto")}
                      <IconoFlecha className="size-[18px]" />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
