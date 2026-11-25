// Sección «d-ficha»: la ficha del producto de D, como la de una tienda grande (Andafacil): galería con flechas, «Foto 1
// de 5» y «Ampliar»; la calificación (si trae texto), el nombre enorme, el texto, el precio enorme con el de antes
// tachado y el descuento, los datos con su ícono (piezas «chip»), los tamaños en botones grandes con su medida
// (ElegirTamanoD; sin escribir la medida), «Añadir al carrito», WhatsApp, un enlace a otro producto si hace falta
// («other_text» y «other_link»), la franja de 3 datos grandes (piezas «fact») y los puntos fuertes (piezas «point»).
// Fotos: piezas «image» de la plantilla cuando el producto de la página es el de la plantilla (se cambian en el
// editor); si no, las del catálogo de ese producto.

import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, conMensaje, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_D_WHATSAPP, CalificacionD, ChipsD, DatosGrandesD, IconoD } from "./comun";
import { GaleriaD } from "./GaleriaD";
import { ElegirTamanoD } from "./ElegirTamanoD";

export function FichaD({ seccion, producto }: PropsSeccion) {
  const a = seccion.ajustes;
  const propio = texto(a, "producto") || "compuerta-anti-inundaciones";
  const nombre = producto?.nombre ?? propio;
  const esPropio = nombre === propio;
  const venta = datosVenta(nombre);
  const fotos = esPropio
    ? seccion.bloques
        .filter((b) => b.tipo === "image" && texto(b.ajustes, "image"))
        .map((b) => ({ src: texto(b.ajustes, "image"), alt: texto(b.ajustes, "alt") || venta?.nombre || "", estilo: estiloFoto(b.ajustes), marca: marcaEditar(seccion.id, b.id, "image") }))
    : (producto?.imagenes ?? []).map((i) => ({ src: i.src, alt: i.alt || producto?.titulo || "" }));
  const chips = seccion.bloques.filter((b) => b.tipo === "chip").map((b) => ({ id: b.id, icono: texto(b.ajustes, "icon"), texto: textoVersion(b.ajustes, "text", venta) }));
  const datos = seccion.bloques.filter((b) => b.tipo === "fact").map((b) => ({ id: b.id, valor: textoVersion(b.ajustes, "value", venta), texto: textoVersion(b.ajustes, "text", venta) }));
  const puntos = seccion.bloques.filter((b) => b.tipo === "point" && texto(b.ajustes, "text"));
  const titulo = esPropio && texto(a, "heading") ? textoVersion(a, "heading", venta) : (producto?.titulo ?? venta?.nombre ?? "");
  const whatsapp = texto(a, "whatsapp_link");
  return (
    <section data-seccion="d-ficha" id="comprar" aria-labelledby="titulo-ficha-d" className="bg-white pb-12 text-[#1f2a37] lg:pt-10 lg:pb-16">
      <div className="marco-version px-0 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:px-[var(--margen-version)]">
        <div className="lg:sticky lg:top-28">
          <GaleriaD fotos={fotos} textos={{ contador: tx(a, "photo_text", "Foto {n} de {total}"), ampliar: tx(a, "zoom_text", "Ampliar"), cerrar: tx(a, "close_text", "Cerrar") }} />
        </div>
        <div className="marco-version pt-5 lg:px-0 lg:pt-0">
          {texto(a, "badge") && <p className="m-0 mb-3 inline-flex rounded-md bg-[#ffc83d] px-3 py-1 text-[15px] font-bold text-[#0b2545]">{textoVersion(a, "badge", venta)}</p>}
          {texto(a, "rating_text") && <CalificacionD numero={calificacion()} texto={textoVersion(a, "rating_text", venta)} />}
          <h1 id="titulo-ficha-d" className="titulo-version m-0 mt-2 text-[32px] leading-[1.1] text-[#0b2545] md:text-[44px]">
            {formato(titulo)}
          </h1>
          {esPropio && texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.55]">{formato(textoVersion(a, "text", venta))}</p>}
          <ChipsD className="mt-4" datos={chips} />
          <div className="mt-6 rounded-xl border-2 border-[#0b2545] p-5">
            {venta && (
              <ElegirTamanoD
                tamanos={venta.tamanos}
                enlaceMasAncha={texto(a, "wider_link") || undefined}
                textos={{
                  pregunta: tx(a, "size_question", "¿Qué tan ancha es tu entrada?"),
                  ayuda: tx(a, "size_help", "Mídela de marco a marco y toca la que corresponda."),
                  masAncha: tx(a, "wider_text", "Más de {hasta} cm"),
                  masAnchaTexto: tx(a, "wider_subtext", "Te la hacemos a la medida"),
                  elegiste: tx(a, "chosen_text", "Elegiste la"),
                  anadir: tx(a, "add_button", "Añadir al carrito"),
                  agotado: tx(a, "sold_out", "Agotado"),
                  falta: tx(a, "missing_text", "Primero elige tu tamaño."),
                }}
              />
            )}
          </div>
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, estoy viendo la {producto} en su página, ¿me ayudan con una duda antes de comprar?").replace("{producto}", venta?.nombre ?? "compuerta"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className={`${BOTON_D_WHATSAPP} mt-3 sm:w-full`}
            >
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
            </a>
          )}
          {texto(a, "other_link") && (
            <p className="m-0 mt-4 text-[18px] leading-snug">
              {textoVersion(a, "other_text", venta)}{" "}
              <a href={texto(a, "other_link")} className="font-semibold text-[#0b2545] underline underline-offset-4">
                {tx(a, "other_link_text", "Ver la compuerta")}
              </a>
            </p>
          )}
          <DatosGrandesD className="mt-6" datos={datos} />
          {esPropio && puntos.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {puntos.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-start gap-3 text-[18px] leading-[1.5]">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-[#0b2545] text-[#ffc83d]">
                    <IconoD nombre="palomita" className="size-5" />
                  </span>
                  {textoVersion(b.ajustes, "text", venta)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
