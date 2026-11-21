// Sección «landing-pasos»: «Protegida en 3 pasos, sin albañiles». Cada paso con su número, dibujo, título y texto;
// abajo, el botón que abre la tabla de medidas (cuenta como «abre_tabla»).
// Con «layout» = tarjetas (Producto de B1, 21-nov-2026, propuesta A que eligió el dueño): los mismos pasos clave de la
// ventana «¿Cómo medir?», sin los textos grises; el paso 2 es la tabla de tamaños con la flecha que la recorre.

import Image from "next/image";
import type { PropsSeccion } from "../registro";
import { texto } from "@/lib/contenido";
import { estiloFoto, marcaEditar } from "@/lib/mapa";
import { datosVenta, textoVersion, tx } from "./datos";
import { PasosMedir, type PasoMedir } from "./PasosMedir";
import { TablaMedidas } from "./TablaMedidas";
import { VentanaTabla } from "./VentanaTabla";

export function PasosVersion({ seccion }: PropsSeccion) {
  const pasos = seccion.bloques.filter((b) => b.tipo === "step");
  const boton = texto(seccion.ajustes, "button_text");
  if (texto(seccion.ajustes, "layout") === "tarjetas") {
    const tamanos = (datosVenta()?.tamanos ?? []).filter((t) => t.medidas).map((t) => ({ nombre: t.nombre, medidas: t.medidas }));
    const columnas: [string, string] = [tx(seccion.ajustes, "table_size", "Tamaño"), tx(seccion.ajustes, "table_width", "Ancho de entrada")];
    const tarjetas: PasoMedir[] = pasos.map((p, i) => ({
      titulo: textoVersion(p.ajustes, "heading"),
      tabla: i === 1,
      imagen: texto(p.ajustes, "image") || undefined,
      alt: texto(p.ajustes, "alt"),
      estilo: estiloFoto(p.ajustes),
      marca: marcaEditar(seccion.id, p.id, "image"),
      pieza: p.id,
    }));
    return (
      <section data-seccion="landing-pasos" id="como-funciona" aria-labelledby="titulo-pasos" className="bg-niebla py-14 text-marino md:py-20">
        <div className="marco-version max-w-[560px]">
          <h2 id="titulo-pasos" className="titulo-ancho m-0 mb-6 text-[28px] md:mb-8 md:text-[38px]">
            {textoVersion(seccion.ajustes, "heading")}
          </h2>
          <PasosMedir variante="a" tamanos={tamanos} pasos={tarjetas} columnas={columnas} />
          {boton && (
            <div className="mt-6 flex justify-center md:mt-8">
              <VentanaTabla
                tamanos={tamanos}
                titulo={tx(seccion.ajustes, "table_heading", "Tabla de tamaños")}
                nota={tx(seccion.ajustes, "table_note", "Mide el ancho de tu entrada de marco a marco.")}
                columnas={columnas}
                texto={boton}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-marino bg-white px-6 font-titulo font-bold text-marino transition-colors hover:bg-marino hover:text-white"
              />
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <section data-seccion="landing-pasos" id="como-funciona" aria-labelledby="titulo-pasos" className="bg-niebla py-14 text-marino md:py-20">
      <div className="marco-version">
        <h2 id="titulo-pasos" className="titulo-ancho m-0 mb-8 max-w-[40rem] text-[28px] md:mb-10 md:text-[38px]">
          {textoVersion(seccion.ajustes, "heading")}
        </h2>
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3 lg:gap-6">
          {pasos.map((p, i) => (
            <li key={p.id} data-pieza={p.id} className="flex gap-4 rounded-2xl bg-white p-4 md:flex-col md:p-6">
              {texto(p.ajustes, "image") && (
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-white md:aspect-[4/3] md:w-full">
                  <Image
                    src={texto(p.ajustes, "image")}
                    alt={texto(p.ajustes, "alt")}
                    style={estiloFoto(p.ajustes)}
                    {...marcaEditar(seccion.id, p.id, "image")}
                    fill
                    sizes="(min-width: 1200px) 365px, (min-width: 768px) 30vw, 96px"
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <span className="titulo-ancho mb-1 block text-[15px] text-marino-2" aria-hidden="true">
                  Paso {i + 1}
                </span>
                <h3 className="m-0 mb-1.5 font-titulo text-[19px] leading-tight font-bold md:text-[21px]">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {textoVersion(p.ajustes, "heading")}
                </h3>
                <p className="m-0 text-[16px] leading-[1.5] text-texto-suave">{textoVersion(p.ajustes, "text")}</p>
              </div>
            </li>
          ))}
        </ol>
        {boton && (
          <div className="mt-6 flex justify-center md:mt-8">
            <TablaMedidas
              texto={boton}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-marino bg-white px-6 font-titulo font-bold text-marino transition-colors hover:bg-marino hover:text-white"
            />
          </div>
        )}
      </div>
    </section>
  );
}
