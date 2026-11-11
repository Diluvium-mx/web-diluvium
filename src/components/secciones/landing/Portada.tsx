// Sección «landing-portada»: la primera pantalla de las versiones B. La base es igual en todas (estrellas, título,
// dolor → solución, precio, botón, quita-miedos y la fila de confianza); lo propio de cada versión sale de sus piezas:
//   «before_after»  → B1, foto de antes y después que se desliza;
//   «image» (1)     → B2, la foto del producto en grande con un acercamiento lento;
//   «image» (2 o +) → B3, mosaico de clientes (con «Esquema de color» = marino, fondo azul);
//   «sizes»         → B4, los tamaños y «Añadir al carrito» aquí mismo (la foto, si hay, va a un lado).
// En celular el orden es: estrellas, título, subtítulo, lo de la versión, precio, botón (B3: el mosaico va primero).
// En computadora, dos columnas: el texto y lo de la versión.

import Image from "next/image";
import type { CSSProperties } from "react";
import type { PropsSeccion } from "../registro";
import type { Bloque } from "@/lib/contenido";
import { texto } from "@/lib/contenido";
import { Comparador } from "./Comparador";
import { SelectorTamano } from "./SelectorTamano";
import { BarraCompra } from "./BarraCompra";
import { datosVenta, pesos, rellenar } from "./datos";
import { CLASE_BOTON, Calificacion, Foto, IconoFlecha } from "./piezas";

const TAMANO_MEDIO = "(min-width: 1200px) 600px, (min-width: 1024px) 46vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 32px)";

function retraso(ms: number): CSSProperties {
  return { "--retraso": `${ms}ms` } as CSSProperties;
}

function Mosaico({ fotos }: { fotos: Bloque[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-2">
      {fotos.slice(0, 4).map((f, i) => (
        <div key={f.id} className="relative aspect-square overflow-hidden rounded-xl bg-marino-hondo md:aspect-[4/5] md:rounded-2xl">
          <Image
            src={texto(f.ajustes, "image")}
            alt={texto(f.ajustes, "alt")}
            fill
            sizes="(min-width: 1200px) 296px, (min-width: 1024px) 23vw, (min-width: 768px) calc(25vw - 24px), calc(50vw - 20px)"
            loading="eager"
            fetchPriority={i === 0 ? "high" : "auto"}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function FilaConfianza({ logos }: { logos: Bloque[] }) {
  if (!logos.length) return null;
  return (
    <div className="border-y border-linea bg-niebla text-marino">
      <ul className="marco-version m-0 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3.5 text-[15px] font-semibold md:gap-x-10 md:py-4">
        {logos.map((l) => {
          const etiqueta = texto(l.ajustes, "text");
          const nombre = texto(l.ajustes, "name");
          const imagen = texto(l.ajustes, "image");
          return (
            <li key={l.id} className="flex items-center gap-2">
              {etiqueta && <span className="text-texto-suave">{etiqueta}</span>}
              {imagen && (
                <Foto
                  src={imagen}
                  alt={texto(l.ajustes, "alt")}
                  sizes="96px"
                  className={/shark/i.test(imagen) ? "h-9 w-auto md:h-10" : "size-7 rounded-md object-contain md:size-8"}
                />
              )}
              {nombre && <span>{nombre}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PortadaVersion({ seccion }: PropsSeccion) {
  const a = seccion.ajustes;
  const venta = datosVenta(texto(a, "producto"));
  const r = (clave: string) => rellenar(texto(a, clave), venta);
  const marino = texto(a, "color_scheme") === "marino";

  const antesDespues = seccion.bloques.find((b) => b.tipo === "before_after");
  const fotos = seccion.bloques.filter((b) => b.tipo === "image" && texto(b.ajustes, "image"));
  const tamanos = seccion.bloques.find((b) => b.tipo === "sizes");
  const logos = seccion.bloques.filter((b) => b.tipo === "logo");
  const mosaico = !antesDespues && !tamanos && fotos.length > 1;

  const precio = venta ? pesos(venta.precio) : "";
  const precioAntes = venta?.precioAntes ? pesos(venta.precioAntes) : null;
  const boton = r("button_text");
  const enlace = texto(a, "button_link") || venta?.enlace || "#";
  const pie = r("media_caption");

  // Lo propio de la versión (la columna derecha en computadora).
  let medio: React.ReactNode = null;
  if (antesDespues) {
    const b = antesDespues.ajustes;
    medio = (
      <Comparador
        sizes={TAMANO_MEDIO}
        antes={{ src: texto(b, "image_before"), alt: texto(b, "alt_before"), etiqueta: texto(b, "label_before") }}
        despues={{ src: texto(b, "image_after"), alt: texto(b, "alt_after"), etiqueta: texto(b, "label_after") }}
      />
    );
  } else if (mosaico) {
    medio = <Mosaico fotos={fotos} />;
  } else if (fotos[0]) {
    medio = (
      <div className={`relative overflow-hidden rounded-2xl bg-niebla md:rounded-3xl ${tamanos ? "aspect-[16/10] md:aspect-[16/9] lg:aspect-square" : "aspect-[4/3] md:aspect-[16/9] lg:aspect-square"}`}>
        <Image
          src={texto(fotos[0].ajustes, "image")}
          alt={texto(fotos[0].ajustes, "alt")}
          fill
          sizes={TAMANO_MEDIO}
          preload
          className={`object-cover ${tamanos ? "" : "acercar"}`}
        />
      </div>
    );
  }

  const tonoSuave = marino ? "text-white/85" : "text-texto-suave";

  return (
    <section
      data-seccion="landing-portada"
      id="inicio"
      aria-labelledby="titulo-portada"
      className={marino ? "fondo-oscuro bg-marino text-white" : "bg-white text-marino"}
    >
      <div
        className={`marco-version grid gap-x-12 gap-y-4 pt-4 pb-7 md:gap-y-7 md:pt-10 md:pb-12 lg:items-center xl:gap-x-16 lg:py-14 ${
          mosaico
            ? "[grid-template-areas:'medio'_'cabeza'_'compra'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-areas:'cabeza_medio'_'compra_medio']"
            : tamanos
              ? "[grid-template-areas:'cabeza'_'medio'_'compra'] lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] lg:[grid-template-areas:'medio_cabeza'_'medio_compra']"
              : "[grid-template-areas:'cabeza'_'medio'_'compra'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-areas:'cabeza_medio'_'compra_medio']"
        }`}
      >
        <div className="flex flex-col gap-3 [grid-area:cabeza] md:gap-4 lg:self-end">
          <Calificacion texto={r("rating_text")} className={`entrar ${marino ? "text-white" : ""}`} />
          <h1 id="titulo-portada" className={`titulo-ancho entrar m-0 text-[34px] md:text-[48px] ${tamanos ? "" : "xl:text-[56px]"}`} style={retraso(60)}>
            {r("heading")}
          </h1>
          {texto(a, "subheading") && (
            <p className={`entrar m-0 max-w-[36rem] text-[17px] leading-[1.5] md:text-[19px] ${tonoSuave}`} style={retraso(140)}>
              {r("subheading")}
            </p>
          )}
        </div>

        {medio && (
          <figure className="m-0 [grid-area:medio]">
            {medio}
            {/* En B1 las etiquetas «Antes» y «Después» ya lo dicen: en celular el pie se guarda para lectores de pantalla. */}
            {pie && (
              <figcaption className={`mt-2 text-[14px] leading-5 ${tonoSuave} ${antesDespues ? "max-md:sr-only" : ""}`}>{pie}</figcaption>
            )}
          </figure>
        )}

        <div className="flex flex-col gap-4 [grid-area:compra] lg:self-start">
          {tamanos && venta && (
            <SelectorTamano
              titulo={rellenar(texto(tamanos.ajustes, "heading"), venta)}
              tamanos={venta.tamanos}
              textoMedir={texto(tamanos.ajustes, "measure_text")}
              textoMedida={rellenar(texto(tamanos.ajustes, "custom_text"), venta)}
              textoEnlaceMedida={texto(tamanos.ajustes, "custom_link_text")}
              enlaceMedida={texto(tamanos.ajustes, "custom_link")}
              textoBoton={rellenar(texto(tamanos.ajustes, "button_text"), venta)}
              textoError={texto(tamanos.ajustes, "error_text")}
              precio={precio}
            />
          )}

          {precio && (
            <p data-precio className={`m-0 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 ${tamanos ? "order-first" : ""}`}>
              <span className="titulo-ancho text-[34px] md:text-[40px]">{precio}</span>
              {precioAntes && (
                <span className={`text-[17px] ${tonoSuave}`}>
                  <span className="sr-only">Precio anterior: </span>
                  <s>{precioAntes}</s>
                </span>
              )}
              {texto(a, "price_note") && <span className={`basis-full text-[15px] ${tonoSuave}`}>{r("price_note")}</span>}
            </p>
          )}

          {!tamanos && boton && (
            <a id="boton-principal" href={enlace} data-evento="boton_portada" className={`${CLASE_BOTON} w-full sm:w-auto sm:self-start sm:min-w-[300px]`}>
              {boton}
              <IconoFlecha />
            </a>
          )}
          {tamanos && <span id="boton-principal" aria-hidden="true" className="-mt-4 h-0" />}

          {texto(a, "guarantees") && <p className={`m-0 text-[15px] font-medium ${tonoSuave} ${tamanos ? "" : "sm:-mt-1"}`}>{r("guarantees")}</p>}
        </div>
      </div>

      <FilaConfianza logos={logos} />

      {venta && (
        <BarraCompra
          precio={precio}
          precioAntes={precioAntes}
          boton={tamanos ? rellenar(texto(tamanos.ajustes, "button_text"), venta) : boton}
          enlace={enlace}
          conTamanos={Boolean(tamanos)}
          textoElegir={tamanos ? rellenar(texto(tamanos.ajustes, "heading"), venta) : boton}
        />
      )}
    </section>
  );
}
