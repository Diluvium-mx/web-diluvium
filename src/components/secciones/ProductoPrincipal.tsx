// Ficha principal del producto (sección «main-product»): galería con miniaturas abajo y, al lado (abajo en celular),
// los bloques de la plantilla en su orden: título, estrellas, textos, precio, ventajas, guía de tamaños, tamaños,
// compra, WhatsApp, entrega estimada, íconos con texto, descripción y pestañas. Cada plantilla de producto acomoda
// los bloques distinto; aquí solo se dibujan como vienen. Medidas tomadas en vivo el 3-nov-2026.

import Image from "next/image";
import productos from "@contenido/productos.json";
import type { Bloque } from "@/lib/contenido";
import { esquema, numero, plantillaProducto, texto } from "@/lib/contenido";
import { limpiarHtml } from "@/components/comunes/Texto";
import { mediosProducto, type Producto } from "@/components/producto/catalogo";
import { Acordeon } from "@/components/producto/ficha/Acordeon";
import { BotonRegresar } from "@/components/producto/ficha/BotonRegresar";
import { Calificacion } from "@/components/producto/ficha/Calificacion";
import { Compra } from "@/components/producto/ficha/Compra";
import { calificacion, existencias, sinOpciones, varianteInicial } from "@/components/producto/ficha/datos";
import { EntregaEstimada } from "@/components/producto/ficha/EntregaEstimada";
import { EstadoFicha, type VarianteFicha } from "@/components/producto/ficha/Estado";
import { GaleriaFicha } from "@/components/producto/ficha/GaleriaFicha";
import {
  IconoBarras,
  IconoCamion,
  IconoEstrella,
  IconoEtiqueta,
  IconoMas,
  IconoPalomaCirculo,
  IconoPalomaVerde,
  LogoWhatsapp,
} from "@/components/producto/ficha/Iconos";
import { LeerMas } from "@/components/producto/ficha/LeerMas";
import { PrecioFicha } from "@/components/producto/ficha/PrecioFicha";
import { Existencias, Variantes } from "@/components/producto/ficha/Variantes";
import { VentanaTamano } from "@/components/producto/ficha/VentanaTamano";
import type { PropsSeccion } from "./registro";

const ID_INFO = "info-producto";
const ID_RESENAS = "resenas-producto";

// Productos donde la app de entrega estimada se muestra (su plan no incluye la mini compuerta).
const CON_ENTREGA_ESTIMADA = new Set([
  "compuerta-anti-inundaciones",
  "tapon-inflable-anti-inundaciones",
  "compuerta-anti-inundaciones-hecha-a-la-medida",
  "funda-de-repuesto-compuerta-anti-inundaciones",
  "accesorio-tira-de-hule-de-repuesto",
  "accesorio-plastilina-de-secado-rapido",
]);

// Plantillas de compuerta: ahí el precio anterior tachado va en azul tenue; en las demás, en gris.
const TACHADO_AZUL = new Set(["compuerta-estandar-2", "mini-compuerta"]);

// Texto con formato de los bloques: párrafos separados 32 px, listas con número, enlaces naranjas subrayados.
const RTE =
  "[&_p]:mb-8 [&_p:last-child]:mb-0 [&_ol]:mb-8 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:mb-8 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:pl-4 " +
  "[&_li]:mb-2 [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-[length:var(--h3)] [&_a]:text-naranja [&_a]:underline " +
  "[&_a]:transition-all [&_a]:duration-[250ms] [&_strong]:font-bold";

/** HTML limpio y con los enlaces abriendo en la misma pestaña, como en la tienda. */
function html(contenido: string): string {
  const limpio = limpiarHtml(contenido).replaceAll(' target="_blank" rel="noopener noreferrer"', "");
  // Texto sin etiquetas (p. ej. la descripción de la plastilina) va en un párrafo.
  return /^\s*</.test(limpio) ? limpio : `<p>${limpio}</p>`;
}

function Rte({ contenido, className = "", color }: { contenido: string; className?: string; color?: string }) {
  return (
    <div
      className={`${RTE} ${className}`}
      style={color ? { color } : undefined}
      dangerouslySetInnerHTML={{ __html: html(contenido) }}
    />
  );
}

function IconoTema({ nombre, ancho, alto }: { nombre: string; ancho: number; alto: number }) {
  const props = { ancho, alto };
  switch (nombre) {
    case "truck":
      return <IconoCamion {...props} />;
    case "star-line":
      return <IconoEstrella {...props} />;
    case "check-circle":
      return <IconoPalomaCirculo {...props} />;
    case "plus":
      return <IconoMas {...props} />;
    case "discount":
      return <IconoEtiqueta {...props} />;
    case "drag":
      return <IconoBarras {...props} />;
    default:
      return null;
  }
}

function IconoConTexto({ b }: { b: Bloque }) {
  const a = b.ajustes;
  const conFondo = a.enable_background === true;
  const titulo = texto(a, "heading");
  const imagen = texto(a, "custom_img");
  return (
    <div className="mb-4 w-full max-w-[calc(50%-8px)] min-[1025px]:max-w-[calc(50%-14.4px)]">
      <div
        className={`flex h-full flex-col rounded-[16px] min-[1025px]:rounded-[32px] ${
          conFondo ? "border border-[rgba(10,85,154,0.12)] p-4 min-[1025px]:p-6" : "py-4 min-[1025px]:py-6"
        }`}
      >
        {texto(a, "icon_source") === "custom_img" && imagen ? (
          <div className="mb-3 size-12 pr-1">
            <Image src={imagen} alt="" width={44} height={48} sizes="44px" className="block h-12 w-11 object-cover" />
          </div>
        ) : (
          <div className="mb-3 size-8 pr-1">
            <IconoTema nombre={texto(a, "options_icon")} ancho={28} alto={32} />
          </div>
        )}
        <div className="flex flex-col">
          {titulo && <span className="mb-2 block font-titulo text-[19.2px] leading-6 font-medium break-words">{titulo}</span>}
          <Rte contenido={texto(a, "description")} />
        </div>
      </div>
    </div>
  );
}

function BloqueInfo({
  b,
  anterior,
  producto,
  plantilla,
}: {
  b: Bloque;
  anterior?: Bloque;
  producto: Producto;
  plantilla: string;
}) {
  const a = b.ajustes;
  if (b.tipo.includes("star-rating")) {
    const { promedio, total } = calificacion(producto);
    return (
      <div className="w-full">
        <div className="flex justify-start" style={{ marginTop: numero(a, "margin_top", 10), marginBottom: numero(a, "margin_bottom", 0) }}>
          <Calificacion promedio={promedio} total={total} destino={ID_RESENAS} />
        </div>
      </div>
    );
  }
  if (b.tipo.includes("estimated-delivery")) {
    return CON_ENTREGA_ESTIMADA.has(producto.nombre) ? (
      <div className="w-full">
        <EntregaEstimada />
      </div>
    ) : null;
  }

  switch (b.tipo) {
    case "title":
      return (
        <div className="mb-4 w-full">
          <h1 className="m-0">{producto.titulo}</h1>
        </div>
      );
    case "custom_text":
      return (
        <div className="mb-4 w-full">
          <Rte contenido={texto(a, "description")} color={texto(a, "color_content") || undefined} />
        </div>
      );
    case "price":
      return (
        <div className="mb-4 w-full">
          <PrecioFicha etiquetaOferta={texto(a, "show_sale_badge") !== "hidden"} tachadoGris={!TACHADO_AZUL.has(plantilla)} />
        </div>
      );
    case "checkmarks": {
      const lineas = [1, 2, 3, 4, 5].map((n) => texto(a, `checkmark_${n}`)).filter(Boolean);
      return (
        <ul className="m-0 mb-4 list-none p-0">
          {lineas.map((l) => (
            <li key={l} className="flex items-center gap-2 text-[#1f2020]">
              <IconoPalomaVerde className="shrink-0" />
              {l}
            </li>
          ))}
        </ul>
      );
    }
    case "popup_content":
      return (
        <div className="mb-8 w-full">
          <VentanaTamano titulo={texto(a, "title")} />
        </div>
      );
    case "variant": {
      const opcion = producto.opciones[0]?.nombre ?? "";
      return (
        <div className="mb-8 flex w-full flex-col gap-6">
          {!sinOpciones(producto) && <Variantes opcion={opcion} cuadros={a.enable_variant_swatches === true} />}
          <Existencias />
        </div>
      );
    }
    case "buy_buttons":
      return (
        <div className="mb-4 block w-full">
          <Compra titulo={producto.titulo} />
        </div>
      );
    case "whatsapp-button":
      return (
        <div className="mb-8 flex w-full">
          <a
            href={texto(a, "url")}
            target="_blank"
            rel="noopener noreferrer"
            className="relative isolate flex w-full items-center justify-center gap-1 overflow-hidden rounded-[4px] border border-[#53a537] bg-[#53a537] px-5 py-2 font-titulo leading-6 font-medium text-white transition-colors duration-[400ms] after:absolute after:inset-x-0 after:top-0 after:bottom-full after:-z-10 after:bg-white after:transition-[bottom] after:duration-[400ms] after:ease-[cubic-bezier(0.7,0,0.3,1)] hover:text-[#53a537] hover:after:bottom-0 focus-visible:text-[#53a537] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul focus-visible:after:bottom-0"
          >
            {texto(a, "text")}
            <LogoWhatsapp />
          </a>
        </div>
      );
    case "icon_with_text":
      return <IconoConTexto b={b} />;
    case "description":
      return (
        <div className="w-full">
          <span className="mb-2 block py-2 font-bold">{texto(a, "heading_description")}</span>
          <LeerMas>
            <Rte contenido={producto.descripcionHtml} />
          </LeerMas>
        </div>
      );
    case "collapsible_item": {
      const icono = a.show_icon === true ? texto(a, "theme_library_icon") : "";
      return (
        <div className={`mb-8 w-full ${anterior?.tipo === "collapsible_item" ? "-mt-7" : ""}`}>
          <Acordeon
            titulo={texto(a, "heading")}
            abierto={a.expand_default === true}
            icono={icono ? <IconoTema nombre={icono} ancho={16} alto={20} /> : undefined}
          >
            <Rte contenido={texto(a, "description")} />
          </Acordeon>
        </div>
      );
    }
    default:
      return null;
  }
}

export function ProductoPrincipal({ seccion, producto }: PropsSeccion) {
  if (!producto) return <div data-seccion="main-product" />;
  const plantilla = productos.productos.find((p) => p.nombre === producto.nombre)?.plantilla ?? "";
  // Si la ficha es lo primero de la plantilla (sin migas de pan arriba), en computadora lleva aire arriba.
  const primera = plantillaProducto(plantilla).secciones[0]?.id === seccion.id;
  const variantes: VarianteFicha[] = producto.variantes.map((v) => ({
    id: v.id,
    titulo: v.titulo,
    precio: v.precio,
    precioAntes: v.precioAntes,
    existencias: existencias(v),
  }));

  return (
    <section className={`${esquema(seccion.ajustes)} overflow-hidden min-[1025px]:overflow-visible`} data-seccion="main-product">
      <div
        className={`contenedor relative flex flex-col items-start gap-6 pb-[var(--aire)] md:gap-9 min-[1025px]:flex-row min-[1025px]:gap-[2vw] ${
          primera ? "min-[1025px]:pt-[var(--aire)]" : ""
        }`}
      >
        <div className="relative w-full max-w-full min-[1025px]:sticky min-[1025px]:top-0 min-[1025px]:max-w-[50%]" role="region" aria-label="Ver Galería">
          <a
            href={`#${ID_INFO}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-10 focus:bg-naranja focus:px-4 focus:py-2 focus:font-titulo focus:font-medium focus:text-white"
          >
            Ir a la información del producto
          </a>
          <GaleriaFicha medios={mediosProducto(producto)} titulo={producto.titulo} />
        </div>
        <EstadoFicha variantes={variantes} inicial={varianteInicial(producto)}>
          <div
            id={ID_INFO}
            className="flex w-full max-w-full flex-wrap content-start gap-x-[3.6vw] md:gap-x-6 min-[1025px]:max-w-[50%] min-[1025px]:gap-x-[2vw]"
          >
            {seccion.bloques.map((b, i) => (
              <BloqueInfo key={b.id} b={b} anterior={seccion.bloques[i - 1]} producto={producto} plantilla={plantilla} />
            ))}
          </div>
        </EstadoFicha>
        <BotonRegresar destino={ID_INFO} />
      </div>
      {/* Aquí termina la ficha: hasta aquí baja el enlace de «N Reseñas». */}
      <div id={ID_RESENAS} />
    </section>
  );
}
