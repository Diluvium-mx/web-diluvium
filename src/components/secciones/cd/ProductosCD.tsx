// «c-productos» y «d-productos»: los productos de la tienda (página Productos de C y D, /collections/all-products).
// Cada pieza «product» es un producto, en el orden de la plantilla: foto (se cambia en el editor), etiqueta opcional
// («La más vendida»), nombre, para qué sirve, la calificación (el número primero) y el precio, que salen del catálogo y
// de las reseñas publicadas. C: tarjetas grandes una abajo de otra en el celular. D: renglones con la foto a la
// izquierda en el celular (como una tienda grande) y botón naranja «Ver producto».

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { producto as buscarProducto, resenas, resumenPrecio } from "@/components/producto/catalogo";
import { pesos, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { Arriba, Raya, Calificacion, claseFondo, ESTILOS, Flecha, type Estilo } from "./estilo";

export function ProductosCD({ seccion, estilo }: PropsSeccion & { estilo: Estilo }) {
  const a = seccion.ajustes;
  const e = ESTILOS[estilo];
  const tarjetas = seccion.bloques
    .filter((b) => b.tipo === "product")
    .map((b) => ({ b, p: buscarProducto(texto(b.ajustes, "producto")) }))
    .filter((x): x is { b: (typeof x)["b"]; p: NonNullable<(typeof x)["p"]> } => Boolean(x.p));
  const titulo = textoVersion(a, "heading");
  const d = estilo === "d";
  return (
    <section data-seccion={seccion.tipo} aria-labelledby={titulo ? `titulo-${seccion.id}` : undefined} aria-label={titulo ? undefined : "Productos"} className={`${claseFondo(estilo, texto(a, "fondo") || (d ? "gris" : "blanco"))} ${e.seccion}`}>
      <div className="marco-version">
        {titulo && (
          <>
            <Arriba estilo={estilo}>{texto(a, "subheading") ? formato(textoVersion(a, "subheading")) : null}</Arriba>
            <h2 id={`titulo-${seccion.id}`} className={e.h2}>
              {formato(titulo)}
            </h2>
            <Raya estilo={estilo} />
          </>
        )}
        {texto(a, "text") && <p className={`m-0 mt-3 max-w-[40rem] ${e.texto}`}>{formato(textoVersion(a, "text"))}</p>}
        <ul className={`m-0 grid list-none p-0 ${d ? "gap-4 md:grid-cols-2 lg:grid-cols-4" : "gap-6 md:grid-cols-2 lg:grid-cols-3"} ${titulo ? "mt-8" : ""}`}>
          {tarjetas.map(({ b, p }, i) => {
            const ba = b.ajustes;
            const foto = texto(ba, "image") || p.imagenes[0]?.src || "";
            const precio = resumenPrecio(p);
            const calif = resenas(p);
            const etiqueta = textoVersion(ba, "badge");
            const descuento = precio.antes && precio.antes > precio.precio ? Math.round(((precio.antes - precio.precio) / precio.antes) * 100) : 0;
            return (
              <li key={b.id} data-pieza={b.id} className="flex">
                <a href={`/products/${p.nombre}`} className={`group flex w-full overflow-hidden text-[#06182f] ${e.tarjeta} ${d ? "flex-row lg:flex-col" : "flex-col"}`}>
                  <div className={`relative shrink-0 overflow-hidden bg-white ${d ? "w-[40%] lg:aspect-square lg:w-auto" : "aspect-[4/3]"}`}>
                    {foto && (
                      <Image
                        src={foto}
                        alt={texto(ba, "alt") || p.titulo}
                        fill
                        sizes={d ? "(min-width: 1024px) 300px, 40vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 32px)"}
                        preload={i === 0}
                        loading={i < 3 ? "eager" : "lazy"}
                        style={estiloFoto(ba)}
                        {...marcaEditar(seccion.id, b.id, "image")}
                        className="object-cover"
                      />
                    )}
                    {etiqueta && <span className={`absolute top-2.5 left-2.5 rounded-full px-3 py-1 text-[14px] font-bold ${e.insignia}`}>{formato(etiqueta)}</span>}
                  </div>
                  <div className={`flex min-w-0 flex-1 flex-col ${d ? "p-4" : "p-5"}`}>
                    <h3 className={`m-0 font-titulo leading-tight font-semibold ${d ? "text-[19px]" : "text-[23px]"}`}>{formato(textoVersion(ba, "heading") || p.titulo)}</h3>
                    {texto(ba, "text") && <p className={`m-0 mt-1.5 leading-[1.45] ${e.suave} ${d ? "line-clamp-3 text-[16px] lg:line-clamp-none" : "text-[17.5px]"}`}>{formato(textoVersion(ba, "text"))}</p>}
                    {calif && (
                      <span className="mt-2">
                        <Calificacion numero={calif.promedio.toFixed(1)} texto={`${calif.total} ${tx(a, "reviews_text", "reseñas")}`} chica={d} />
                      </span>
                    )}
                    <p className="m-0 mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-3">
                      {precio.desde && <span className={`text-[16px] ${e.suave}`}>{tx(a, "from_text", "Desde")}</span>}
                      <span className={`font-titulo leading-none font-semibold ${d ? "text-[24px]" : "text-[28px]"}`}>{pesos(precio.precio)}</span>
                      {precio.antes && <s className={`text-[16px] ${e.suave}`}>{pesos(precio.antes)}</s>}
                      {descuento > 0 && (
                        <span className="rounded-md bg-[#e3f5e8] px-2 py-0.5 text-[15px] font-bold text-[#1a7f37]">{tx(a, "discount_text", "-{porcentaje}%").replace("{porcentaje}", String(descuento))}</span>
                      )}
                    </p>
                    <span className={`mt-4 inline-flex items-center justify-center gap-1.5 font-titulo font-semibold ${d ? "min-h-12 rounded-xl bg-boton px-4 text-[17px] text-white" : "min-h-14 rounded-2xl border-[2.5px] border-[#06182f] px-5 text-[18px] group-hover:bg-[#06182f] group-hover:text-white"}`}>
                      {tx(a, "button_text", "Ver producto")}
                      <Flecha className="size-5" />
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
