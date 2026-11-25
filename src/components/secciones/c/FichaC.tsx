// Sección «c-ficha»: la ficha del producto de C, para 40-60 años en el celular (25-nov-2026). Fotos grandes con flechas
// y «Foto 1 de 5», calificación, nombre grande, «Envío gratis» y «hasta 6 meses sin intereses» con su ícono, la fecha en que llegaría si
// compra hoy, las puertas dibujadas a su tamaño con su precio (ElegirTamanoC, propuesta T3), «Añadir al
// carrito», WhatsApp, las garantías en renglones grandes y los puntos fuertes.
// Fotos: piezas «image» de la plantilla (se cambian en el editor). En los demás productos (que usan esta misma ficha),
// las fotos del catálogo de ese producto. Desde el 25-nov-2026 cada producto tiene su plantilla (product.c1.mini…):
// «show_description» muestra la descripción del catálogo (repuestos y accesorios), «show_delivery» en falso quita la
// fecha de llegada (la XXL se fabrica bajo pedido) y «shipping_text» o «months_text» vacíos quitan ese renglón.

import type { PropsSeccion } from "../registro";
import { texto, type Ajustes } from "@/lib/contenido";
import { limpiarHtml } from "@/components/comunes/Texto";
import { resenas } from "@/components/producto/catalogo";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, conMensaje, datosVenta, PRODUCTO_PRINCIPAL, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { IconoWhatsapp } from "../landing/piezas";
import { BOTON_WHATSAPP_C, CalificacionC, DatosConIcono, PalomitaC } from "./comun";
import { GaleriaC } from "./GaleriaC";
import { EntregaC } from "./EntregaC";
import { ElegirTamanoC } from "./ElegirTamanoC";
import { logoPuerta, textosTamano, whatsappAncha, whatsappAngosta } from "./TamanosC";

/** Un texto de la plantilla que se puede dejar vacío para quitarlo; si la plantilla no lo trae, el de siempre. */
function opcional(a: Ajustes, clave: string, porDefecto: string) {
  return Object.hasOwn(a, clave) ? (texto(a, clave) ? textoVersion(a, clave) : "") : porDefecto;
}

export function FichaC({ seccion, producto }: PropsSeccion) {
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
  const confianza = seccion.bloques.filter((b) => b.tipo === "trust" && texto(b.ajustes, "text"));
  const puntos = seccion.bloques.filter((b) => b.tipo === "point" && texto(b.ajustes, "text"));
  const titulo = esPropio && texto(a, "heading") ? textoVersion(a, "heading", venta) : (producto?.titulo ?? venta?.nombre ?? "");
  const whatsapp = texto(a, "whatsapp_link");
  // La compuerta lleva la calificación de toda la tienda («más de 200 reseñas»); los demás productos, la suya (o ninguna).
  const deProducto = producto && producto.nombre !== PRODUCTO_PRINCIPAL ? resenas(producto) : undefined;
  const nota =
    producto && producto.nombre !== PRODUCTO_PRINCIPAL
      ? deProducto && { numero: deProducto.promedio.toFixed(1), texto: `${deProducto.total} ${tx(a, "reviews_text", "reseñas")}` }
      : { numero: calificacion(), texto: tx(a, "rating_text", "más de 200 reseñas") };
  return (
    <section data-seccion="c-ficha" aria-labelledby="titulo-ficha-c" className="bg-white pb-12 text-[#1f2d3d] lg:pt-10 lg:pb-16">
      <div className="marco-version px-0 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:px-[var(--margen-version)]">
        <div className="lg:sticky lg:top-24">
          <GaleriaC fotos={fotos} />
        </div>
        <div className="marco-version pt-5 lg:px-0 lg:pt-0">
          {nota && <CalificacionC numero={nota.numero} texto={nota.texto} />}
          <h1 id="titulo-ficha-c" className="titulo-version m-0 mt-2 text-[32px] leading-[1.12] text-[#06182f] md:text-[42px]">
            {formato(titulo)}
          </h1>
          {esPropio && texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.55]">{formato(textoVersion(a, "text", venta))}</p>}
          <DatosConIcono
            className="mt-3"
            datos={[
              { icono: "envio", texto: opcional(a, "shipping_text", "Envío gratis a todo México") },
              { icono: "meses", texto: opcional(a, "months_text", "Hasta 6 meses sin intereses") },
            ]}
          />
          {a.show_delivery !== false && <EntregaC prefijo={tx(a, "delivery_text", "Si la pides hoy, llega entre el")} y={tx(a, "delivery_and", "y el")} />}
          <div className="mt-5 rounded-3xl bg-[#f3f8fd] p-5">
            {venta && <ElegirTamanoC tamanos={venta.tamanos} textos={textosTamano(a)} enlaceMasAncha={esPropio ? whatsappAncha(a) : undefined} enlaceWhatsapp={whatsappAngosta(a)} logo={logoPuerta(a)} altoCompuerta={Number(a.gate_height) || 60} />}
          </div>
          {a.show_description === true && (producto?.descripcionHtml ?? "").trim() && (
            <div className="mt-5 rounded-3xl border-2 border-[#dbe7f3] p-5">
              {texto(a, "description_heading") && <p className="m-0 mb-2 font-titulo text-[20px] font-medium text-[#06182f]">{formato(textoVersion(a, "description_heading"))}</p>}
              <div className="descripcion-version descripcion-grande" dangerouslySetInnerHTML={{ __html: limpiarHtml(producto?.descripcionHtml ?? "") }} />
            </div>
          )}
          {whatsapp && (
            <a
              href={conMensaje(whatsapp, tx(a, "whatsapp_message", "Hola, estoy viendo la {producto} en su página, ¿me ayudan con una duda antes de comprar?").replace("{producto}", venta?.nombre ?? "compuerta"))}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="toca_whatsapp"
              className={`${BOTON_WHATSAPP_C} mt-3 sm:w-full`}
            >
              <IconoWhatsapp className="size-6" />
              {tx(a, "whatsapp_text", "Pregúntanos por WhatsApp")}
            </a>
          )}
          {confianza.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {confianza.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-center gap-3.5 rounded-2xl border-2 border-[#dbe7f3] px-4 py-3">
                  <PalomitaC />
                  <span>
                    <span className="block text-[18px] font-bold text-[#06182f]">{textoVersion(b.ajustes, "text")}</span>
                    {texto(b.ajustes, "subtext") && <span className="block text-[16px] leading-snug text-[#45566a]">{textoVersion(b.ajustes, "subtext")}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {esPropio && puntos.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {puntos.map((b) => (
                <li key={b.id} data-pieza={b.id} className="flex items-start gap-3 text-[18px] leading-[1.5]">
                  <PalomitaC className="mt-0.5 size-7" />
                  {textoVersion(b.ajustes, "text")}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
