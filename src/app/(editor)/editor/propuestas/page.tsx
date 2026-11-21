import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { leerPlantilla } from "@/lib/editor/archivos";
import { texto } from "@/lib/contenido";
import { datosVenta } from "@/components/secciones/landing/datos";
import { PasosMedir, type VariantePasos } from "@/components/secciones/landing/PasosMedir";

// Las 3 propuestas de «pasos clave» (21-nov-2026) para que el dueño elija una: cada una como se vería en la ventana
// de «¿Cómo medir?» (Ver pasos clave) y en la parte de pasos de la página (B1-P5), a tamaño de celular.
// Solo en esta Mac: http://localhost:3100/editor/propuestas (no se publica).

export const dynamic = "force-dynamic";

const PROPUESTAS: { v: VariantePasos; nombre: string; idea: string }[] = [
  { v: "a", nombre: "A · Tarjetas", idea: "Cada paso en su tarjeta, uno debajo del otro: número, título y dibujo. Se lee de un vistazo bajando la página." },
  { v: "b", nombre: "B · Camino", idea: "Los 3 números unidos por una línea naranja, como un camino de arriba abajo. Marca que es un orden: primero, luego, al final." },
  { v: "c", nombre: "C · Deslizable", idea: "Un paso por pantalla: se desliza con el dedo o con «Siguiente». Ocupa menos alto; hay que tocar para ver los 3." },
];

export default async function Propuestas() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  const venta = datosVenta();
  const tamanos = (venta?.tamanos ?? []).filter((t) => t.medidas).map((t) => ({ nombre: t.nombre, medidas: t.medidas }));
  const pasos = leerPlantilla("product.b1").secciones.find((s) => s.tipo === "landing-pasos");
  const titulo = pasos ? texto(pasos.ajustes, "heading") : "Protegida en 3 pasos, sin albañiles";
  const boton = pasos ? texto(pasos.ajustes, "button_text") : "";

  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <h1 className="titulo-ancho m-0 text-[30px]">Pasos clave · 3 propuestas</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Cada propuesta se ve a tamaño de celular: a la izquierda en la ventana de <strong>«¿Cómo medir?» → Ver pasos clave</strong> (Producto 66) y a la derecha en la parte de
        pasos de la página (<strong>B1-P5</strong>), ya sin los textos grises. La flecha de la tabla baja tamaño por tamaño y vuelve a empezar. Dime cuál: «Propuesta A», «B» o «C».
      </p>
      <div className="mt-8 grid gap-12">
        {PROPUESTAS.map((p) => (
          <section key={p.v} aria-labelledby={`propuesta-${p.v}`}>
            <h2 id={`propuesta-${p.v}`} className="titulo-ancho m-0 text-[24px]">
              {p.nombre}
            </h2>
            <p className="m-0 mt-1 mb-4 max-w-3xl text-[15px] text-tinta">{p.idea}</p>
            <div className="flex flex-wrap items-start gap-8">
              <figure className="m-0">
                <figcaption className="mb-2 text-[13px] font-bold text-texto-suave">En la ventana de «¿Cómo medir?»</figcaption>
                <div className="w-[375px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-20px_rgba(12,30,51,0.45)]">
                  <div className="flex items-center justify-between border-b border-linea py-2.5 pr-2 pl-5">
                    <span className="titulo-ancho text-[20px]">3 pasos clave</span>
                    <span aria-hidden="true" className="flex size-11 items-center justify-center text-[22px]">
                      ×
                    </span>
                  </div>
                  <div className="p-4">
                    <PasosMedir variante={p.v} tamanos={tamanos} />
                    <p className="m-0 mt-4 text-center font-titulo text-[16px] font-bold underline decoration-2 underline-offset-4">← Volver al video</p>
                  </div>
                </div>
              </figure>
              <figure className="m-0">
                <figcaption className="mb-2 text-[13px] font-bold text-texto-suave">En la página (B1-P5)</figcaption>
                <div className="w-[375px] overflow-hidden rounded-2xl bg-niebla px-4 py-10 shadow-[0_20px_50px_-20px_rgba(12,30,51,0.45)]">
                  <h3 className="titulo-ancho m-0 mb-6 text-[28px]">{titulo}</h3>
                  <PasosMedir variante={p.v} tamanos={tamanos} />
                  {boton && (
                    <div className="mt-6 flex justify-center">
                      <span className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-marino bg-white px-6 font-titulo font-bold">{boton}</span>
                    </div>
                  )}
                </div>
              </figure>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
