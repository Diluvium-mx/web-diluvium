import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { BOTONES, BotonAzul, BotonBorde, BotonTarjeta, CARRITOS } from "./Muestras";

// Propuestas para que el dueño elija (editor local; solo en esta Mac: http://localhost:3100/editor/propuestas).
// 21-nov-2026: los botones «Ver pasos clave» (Producto 217) y «Volver al video» (224), y el carrito. Los «pasos clave»
// ya se eligieron (propuesta A) y están puestos en la ventana de «¿Cómo medir?» y en B1-P5.

export const dynamic = "force-dynamic";

const PROPUESTAS_BOTON = [
  { id: "1", nombre: "1 · Botón azul", idea: "Lleno, de lado a lado, con letra blanca. La flecha va debajo del texto y se mueve suave hacia donde lleva.", Muestra: BotonAzul },
  { id: "2", nombre: "2 · Botón con borde", idea: "Blanco con borde azul (no compite con el naranja de comprar). La flecha va debajo, en un círculo azul.", Muestra: BotonBorde },
  { id: "3", nombre: "3 · Tarjeta con dibujo", idea: "A la izquierda un dibujo de lo que se va a ver (la lista de pasos o el video); a la derecha el texto y debajo la flecha naranja.", Muestra: BotonTarjeta },
];

export default async function Propuestas() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <style>{`
        @keyframes empuje-der { 0%, 100% { transform: translateX(-3px) } 50% { transform: translateX(4px) } }
        @keyframes empuje-izq { 0%, 100% { transform: translateX(3px) } 50% { transform: translateX(-4px) } }
      `}</style>
      <h1 className="titulo-ancho m-0 text-[30px]">Propuestas para elegir</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Dime cuál de cada una: por ejemplo «Botón 2» y «Carrito 4». (Los pasos clave ya quedaron con la propuesta A.)
      </p>

      <section aria-labelledby="t-botones" className="mt-10">
        <h2 id="t-botones" className="titulo-ancho m-0 text-[24px]">
          Botones de la ventana «¿Cómo medir?» (217 y 224)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Botón de verdad, no enlace: sin subrayado y la flecha ya no es una letra del texto. Así se ven en la ventana, a tamaño de celular.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {PROPUESTAS_BOTON.map(({ id, nombre, idea, Muestra }) => (
            <figure key={id} className="m-0 w-[375px]">
              <figcaption className="mb-2">
                <strong className="block font-titulo text-[19px]">{nombre}</strong>
                <span className="text-[14px] text-tinta">{idea}</span>
              </figcaption>
              <div className="grid gap-4 rounded-2xl bg-white p-4 shadow-[0_20px_50px_-20px_rgba(12,30,51,0.45)]">
                <div aria-hidden="true" className="flex aspect-video items-center justify-center rounded-xl bg-tinta text-[13px] text-white/60">
                  (video)
                </div>
                {BOTONES.map((b) => (
                  <div key={b.texto}>
                    <p className="m-0 mb-1.5 text-[12px] font-bold text-texto-suave">{b.lado === "derecha" ? "217 · debajo del video" : "224 · al final de los pasos"}</p>
                    <Muestra b={b} />
                  </div>
                ))}
              </div>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-carrito" className="mt-14">
        <h2 id="t-carrito" className="titulo-ancho m-0 text-[24px]">
          Carrito (6 propuestas)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Lo que más se usa hoy en las tiendas que mejor venden, hecho simple para nuestro cliente (30 a 50 años, en el celular): letra grande, un solo botón para pagar, «Envío gratis» a
          la vista y nada de notas de pedido ni letras chiquitas. Todas quitan el 250 («Envío calculados al finalizar la compra»).
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {CARRITOS.map(({ id, nombre, idea, Muestra }) => (
            <figure key={id} className="m-0 w-[375px]">
              <figcaption className="mb-2 min-h-[96px]">
                <strong className="block font-titulo text-[19px]">{nombre}</strong>
                <span className="text-[14px] text-tinta">{idea}</span>
              </figcaption>
              <Muestra />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
