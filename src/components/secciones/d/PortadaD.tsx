// Sección «d-portada»: primera pantalla de D, como la de una tienda grande. Una etiqueta amarilla (con «badge_link»
// es un enlace, p. ej. a Shark Tank en Nosotros, y con «badge_logo» lleva ese logo a un lado), el título grande,
// la calificación (el número primero), el texto, la foto real de la compuerta, el precio enorme con el de antes
// tachado y el descuento, los datos con su ícono (piezas «chip»), dos botones grandes: «Comprar ahora» y «Ayúdame a
// elegir mi tamaño» (lleva al asistente), y la franja de 3 datos grandes (piezas «fact»).

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { calificacion, datosVenta, textoVersion, tx } from "../landing/datos";
import { formato } from "../landing/formato";
import { BOTON_D, BOTON_D_MARINO, CalificacionD, ChipsD, DatosGrandesD } from "./comun";
import { PrecioD } from "./ElegirTamanoD";

export function PortadaD({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const venta = datosVenta(texto(a, "producto") || undefined);
  const foto = texto(a, "image");
  const chips = seccion.bloques.filter((b) => b.tipo === "chip").map((b) => ({ id: b.id, icono: texto(b.ajustes, "icon"), texto: textoVersion(b.ajustes, "text") }));
  const datos = seccion.bloques.filter((b) => b.tipo === "fact").map((b) => ({ id: b.id, valor: textoVersion(b.ajustes, "value"), texto: textoVersion(b.ajustes, "text") }));
  return (
    <section data-seccion="d-portada" aria-labelledby="titulo-portada-d" className="bg-white text-[#1f2a37]">
      <div className="marco-version grid gap-6 pt-6 pb-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pt-12 lg:pb-14">
        <div>
          {texto(a, "badge") && <Etiqueta a={a} />}
          <h1 id="titulo-portada-d" className="titulo-version m-0 mt-3 text-[36px] leading-[1.08] text-[#0b2545] md:text-[56px]">
            {formato(textoVersion(a, "heading"))}
          </h1>
          {texto(a, "rating_text") && (
            <div className="mt-3">
              <CalificacionD numero={calificacion()} texto={textoVersion(a, "rating_text")} />
            </div>
          )}
          {texto(a, "text") && <p className="m-0 mt-3 text-[19px] leading-[1.55]">{formato(textoVersion(a, "text"))}</p>}
        </div>
        {foto && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#dde2e8] bg-[#f4f6f8] lg:row-span-2 lg:aspect-square">
            <Image src={foto} alt={texto(a, "alt")} fill priority sizes="(min-width: 1024px) 600px, calc(100vw - 32px)" className="object-cover" style={estiloFoto(a)} {...marcaEditar(seccion.id, "", "image")} />
          </div>
        )}
        <div>
          {venta && (
            <div>
              {texto(a, "price_prefix") && <p className="m-0 mb-1.5 text-[17px] font-semibold text-[#4a5568]">{textoVersion(a, "price_prefix")}</p>}
              <PrecioD precio={venta.precio} antes={venta.precioAntes} grande />
            </div>
          )}
          <ChipsD className="mt-4" datos={chips} />
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <a href={tx(a, "button_link", "/products/compuerta-anti-inundaciones")} data-evento="boton_portada" className={BOTON_D}>
              {tx(a, "button_text", "Comprar ahora")}
            </a>
            <a href={tx(a, "help_link", "#asistente")} data-evento="boton_asistente" className={BOTON_D_MARINO}>
              {tx(a, "help_text", "Ayúdame a elegir mi tamaño")}
            </a>
          </div>
        </div>
      </div>
      {datos.length > 0 && (
        <div className="marco-version pb-10 lg:pb-14">
          <DatosGrandesD datos={datos} />
        </div>
      )}
    </section>
  );
}

/** La etiqueta de arriba: el logo (si hay) y el texto en amarillo; con enlace, toda es un botón con su flecha. */
function Etiqueta({ a }: { a: PropsSeccion["seccion"]["ajustes"] }) {
  const enlace = texto(a, "badge_link");
  const logo = texto(a, "badge_logo");
  const contenido = (
    <>
      {logo && (
        <span className="flex h-11 w-[58px] shrink-0 items-center justify-center rounded-md border border-[#dde2e8] bg-white p-1.5">
          <Image src={logo} alt="" width={160} height={128} className="h-full w-auto object-contain" />
        </span>
      )}
      <span className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-[#ffc83d] px-3 py-1 text-[15px] leading-tight font-bold text-[#0b2545]">
        {textoVersion(a, "badge")}
        {enlace && (
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M9 6l6 6-6 6" />
          </svg>
        )}
      </span>
    </>
  );
  return enlace ? (
    <a href={enlace} data-evento="etiqueta_portada" className="group inline-flex items-center gap-2 no-underline">
      {contenido}
    </a>
  ) : (
    <p className="m-0 inline-flex items-center gap-2">{contenido}</p>
  );
}
