// Sección «landing-ficha»: la ficha del producto de las versiones B (/v/<versión>/products/<producto>). Nace del mapa
// de calor de Clarity (11-nov-2026, reporte en Diluvium CRM/reportes/pruebas-abc-web/clarity-2026-11-11.md):
// - casi todas las visitas caen directo en la compuerta, desde el celular dentro de Facebook o Instagram;
// - con la ficha de hoy la mitad se va sin ver título, precio ni tamaños (la galería llena la primera pantalla);
// - hay más clics a Mercado Libre y Amazon que a «Añadir al carrito».
// Por eso, en el celular: galería baja que se desliza, y luego título, precio, tamaños con su medida, el botón con el
// precio, WhatsApp y la confianza (envío, garantía, pago, meses) junto al botón.
//
// Lo propio de cada versión sale de sus piezas y ajustes:
//   «before_after»      → B1, la primera foto de la galería es el antes y después que se arrastra;
//   «image» / «video»   → fotos propias de la versión, antes de las del producto (B3: clientes reales);
//   «review»            → B3, una reseña publicada junto al botón;
//   «Ayuda para medir»  → B4 y B6, se escribe el ancho de la entrada y se elige solo el tamaño;
//   «Título de confianza» → B5, la confianza va en un recuadro propio («Compra aquí, directo con Diluvium»);
//   «Galería» = baja y «Barra de compra» = siempre → B6, la ficha más corta.

import Image from "next/image";
import resenas from "@contenido/resenas.json";
import type { PropsSeccion } from "../registro";
import type { Bloque } from "@/lib/contenido";
import { texto } from "@/lib/contenido";
import { mediosProducto } from "@/components/producto/catalogo";
import { producto as buscarProducto } from "@/components/producto/catalogo";
import { BarraCompra } from "./BarraCompra";
import { CompraFicha } from "./CompraFicha";
import { Galeria, type MedioGaleria } from "./Galeria";
import { datosVenta, pesos, rellenar, PRODUCTO_PRINCIPAL } from "./datos";
import { Estrellas, Foto, IconoPalomita } from "./piezas";
import { estiloFoto, marcaEditar } from "@/lib/mapa";

type Resena = { nombre: string; calificacion: number; texto: string; fotos: string[] };
const PUBLICADAS = resenas.pagina as Resena[];

/** Íconos de la confianza (el nombre se escribe en la pieza: envio, garantia, pago, meses, devolucion, factura). */
const ICONOS: Record<string, string> = {
  envio: "M3 6h11v9H3zM14 9h4l3 3v3h-7zM6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  garantia: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM8.5 12l2.5 2.5 4.5-5",
  pago: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v2",
  meses: "M3 6h18v12H3zM3 10h18M7 15h4",
  devolucion: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
  factura: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
};

function IconoConfianza({ nombre }: { nombre: string }) {
  const d = ICONOS[nombre] ?? ICONOS.garantia;
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-marino" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

function medios(seccionId: string, bloques: Bloque[], incluirProducto: boolean, nombreProducto: string, alt: string): MedioGaleria[] {
  const propios: MedioGaleria[] = [];
  for (const b of bloques) {
    const a = b.ajustes;
    if (b.tipo === "before_after" && texto(a, "image_before") && texto(a, "image_after")) {
      propios.push({
        tipo: "antesDespues",
        antes: { src: texto(a, "image_before"), alt: texto(a, "alt_before"), etiqueta: texto(a, "label_before"), estilo: estiloFoto(a, "image_before"), marca: marcaEditar(seccionId, b.id, "image_before") },
        despues: { src: texto(a, "image_after"), alt: texto(a, "alt_after"), etiqueta: texto(a, "label_after"), estilo: estiloFoto(a, "image_after"), marca: marcaEditar(seccionId, b.id, "image_after") },
      });
    } else if (b.tipo === "image" && texto(a, "image")) {
      propios.push({ tipo: "imagen", src: texto(a, "image"), alt: texto(a, "alt") || alt, estilo: estiloFoto(a), marca: marcaEditar(seccionId, b.id, "image") });
    } else if (b.tipo === "video" && texto(a, "video")) {
      propios.push({ tipo: "video", src: texto(a, "video"), poster: texto(a, "poster"), alt: texto(a, "alt") || alt, estilo: estiloFoto(a, "video"), marca: marcaEditar(seccionId, b.id, "video") });
    }
  }
  if (!incluirProducto) return propios;
  const p = buscarProducto(nombreProducto);
  if (!p) return propios;
  // Las fotos del producto que la versión ya puso arriba no se repiten.
  const usadas = new Set(propios.flatMap((m) => (m.tipo === "imagen" ? [m.src] : m.tipo === "video" ? [m.src] : [])));
  const delProducto: MedioGaleria[] = mediosProducto(p)
    .filter((m) => !usadas.has(m.src))
    .map((m) =>
      m.tipo === "video"
        ? { tipo: "video", src: m.src, poster: m.poster, alt: `Video de la ${p.titulo.toLowerCase()} frenando el agua` }
        : { tipo: "imagen", src: m.src, alt: m.alt },
    );
  return [...propios, ...delProducto];
}

function ResenaCorta({ foto }: { foto: string }) {
  const r = PUBLICADAS.find((x) => x.fotos.includes(foto));
  if (!r) return null;
  return (
    <figure className="m-0 mt-4 grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-linea p-3">
      <div className="relative size-16 overflow-hidden rounded-lg bg-niebla">
        <Image src={foto} alt={`Compuerta de ${r.nombre} puesta en su entrada`} fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <span className="flex items-center gap-2">
          <Estrellas className="size-4" />
          <span className="sr-only">{r.calificacion} de 5 estrellas</span>
        </span>
        <blockquote className="m-0 mt-1 line-clamp-3 text-[14.5px] leading-[1.45] text-tinta">«{r.texto.trim()}»</blockquote>
        <figcaption className="mt-1 text-[14px] font-bold">{r.nombre}</figcaption>
      </div>
    </figure>
  );
}

export function FichaVersion({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const nombre = producto?.nombre ?? (texto(a, "producto") || PRODUCTO_PRINCIPAL);
  const venta = datosVenta(nombre);
  if (!venta) return null;
  const r = (clave: string) => rellenar(texto(a, clave), venta);

  const galeria = medios(seccion.id, seccion.bloques, a.include_product_media !== false, nombre, venta.nombre);
  const confianza = seccion.bloques.filter((b) => b.tipo === "trust");
  const puntos = seccion.bloques.filter((b) => b.tipo === "point" && texto(b.ajustes, "text"));
  const tiendas = seccion.bloques.filter((b) => b.tipo === "marketplace" && texto(b.ajustes, "link"));
  const resena = seccion.bloques.find((b) => b.tipo === "review");
  const tituloConfianza = r("trust_heading");

  const precio = pesos(venta.precio);
  const precioAntes = venta.precioAntes ? pesos(venta.precioAntes) : null;
  const ahorro = venta.precioAntes ? pesos(venta.precioAntes - venta.precio) : null;
  const titulo = r("heading") || venta.nombre;
  const vendidas = r("sold_text");

  const listaConfianza = confianza.length > 0 && (
    <ul className={`m-0 grid list-none grid-cols-2 gap-x-3 gap-y-3 p-0 ${tituloConfianza ? "" : "mt-5 border-t border-linea pt-4"}`}>
      {confianza.map((c) => (
        <li key={c.id} data-pieza={c.id} className="flex items-start gap-2.5">
          <IconoConfianza nombre={texto(c.ajustes, "icon")} />
          <span className="text-[14.5px] leading-[1.35]">
            <strong className="block font-bold text-marino">{rellenar(texto(c.ajustes, "heading"), venta)}</strong>
            <span className="text-texto-suave">{rellenar(texto(c.ajustes, "text"), venta)}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section data-seccion="landing-ficha" aria-labelledby="titulo-ficha" className="bg-white pt-3 pb-10 text-marino md:pt-6 md:pb-14 lg:pt-10 lg:pb-16">
      <div className="marco-version grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Galeria medios={galeria} forma={texto(a, "gallery_style") === "baja" ? "baja" : "normal"} pie={r("media_caption")} />
        </div>

        <div className="min-w-0">
          {(r("rating_text") || vendidas) && (
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] leading-5 font-semibold">
              <Estrellas className="size-4" />
              {r("rating_text") && (
                <a href="#resenas" className="underline decoration-linea decoration-2 underline-offset-4 hover:decoration-marino">
                  {r("rating_text")}
                </a>
              )}
              {vendidas && <span className="border-l-2 border-linea pl-2 text-texto-suave">{vendidas}</span>}
            </p>
          )}
          <h1 id="titulo-ficha" className="titulo-ancho m-0 mt-1.5 text-[26px] md:text-[36px] lg:text-[40px]">
            {titulo}
          </h1>
          {r("subheading") && <p className="m-0 mt-2 hidden text-[17px] leading-[1.5] text-texto-suave md:block">{r("subheading")}</p>}

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1" data-precio="">
            <span className="titulo-ancho text-[30px] md:text-[34px]">{precio}</span>
            {precioAntes && (
              <span className="text-[17px] text-texto-suave">
                <span className="sr-only">Antes</span>
                <s>{precioAntes}</s>
              </span>
            )}
            {ahorro && <span className="rounded-md bg-[#fdf1dd] px-2 py-0.5 text-[14px] font-bold text-[#8a4b00]">Ahorras {ahorro}</span>}
          </div>
          {r("price_note") && <p className="m-0 mt-0.5 text-[15px] text-texto-suave">{r("price_note")}</p>}

          {resena && <ResenaCorta foto={texto(resena.ajustes, "image")} />}

          <div className="mt-4">
            <CompraFicha
              titulo={r("size_heading") || "Elige tu tamaño"}
              tamanos={venta.tamanos}
              textoMedir={r("measure_text")}
              textoAyuda={r("helper_text")}
              textoMedida={r("custom_text")}
              textoEnlaceMedida={r("custom_link_text")}
              enlaceMedida={texto(a, "custom_link")}
              textoBoton={r("button_text") || "Añadir al carrito"}
              textoError={r("error_text")}
              whatsapp={texto(a, "whatsapp_link")}
            />
          </div>

          {tituloConfianza ? (
            <div className="mt-5 rounded-2xl border-2 border-marino/15 bg-niebla p-4">
              <p className="m-0 mb-3 font-titulo text-[17px] font-bold">{tituloConfianza}</p>
              {listaConfianza}
            </div>
          ) : (
            listaConfianza
          )}

          {puntos.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-1.5 p-0 text-[15.5px] text-tinta">
              {puntos.map((p) => (
                <li key={p.id} data-pieza={p.id} className="flex items-start gap-2">
                  <IconoPalomita className="mt-0.5 size-5 shrink-0 text-marino" />
                  {rellenar(texto(p.ajustes, "text"), venta)}
                </li>
              ))}
            </ul>
          )}

          {tiendas.length > 0 && (
            // Logos grandes, siempre (dueño, 18-nov-2026): se reconocen de un vistazo.
            <div className="mt-5 border-t border-linea pt-4">
              {r("marketplace_text") && <p className="m-0 font-titulo text-[16px] font-bold">{r("marketplace_text")}</p>}
              <ul className="m-0 mt-2.5 grid list-none grid-cols-2 gap-2.5 p-0">
                {tiendas.map((t) => (
                  <li key={t.id} data-pieza={t.id}>
                    <a
                      href={texto(t.ajustes, "link")}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-evento="toca_marketplace"
                      className="flex min-h-[68px] items-center justify-center gap-2.5 rounded-xl border-2 border-linea bg-white px-3 text-[16px] font-bold text-tinta hover:border-marino"
                    >
                      {texto(t.ajustes, "image") && (
                        <Foto src={texto(t.ajustes, "image")} alt="" sizes="96px" className="size-12 shrink-0 object-contain" />
                      )}
                      <span className="leading-tight">{texto(t.ajustes, "name")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <BarraCompra
        precio={precio}
        precioAntes={precioAntes}
        boton={r("button_text") || "Añadir al carrito"}
        enlace="#tamanos"
        conTamanos={venta.tamanos.length > 1}
        textoElegir={r("sticky_text") || "Elegir mi tamaño"}
        siempre={texto(a, "sticky_bar") === "siempre"}
      />
    </section>
  );
}
