import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { editorDisponible, hostLocal } from "@/lib/editor/guardia";
import { leerPlantilla } from "@/lib/editor/archivos";
import { armarBanco, tamanosBuscador } from "@/components/secciones/landing/Preguntas";
import { Barra1, Barra2, Barra3, Barra4, Barra5, Barra6 } from "./BarrasVideo";
import { Preguntas1, Preguntas2, Preguntas3, Preguntas4 } from "./PreguntasDemo";

// Propuestas para que el dueño elija (editor local; solo en esta Mac: http://localhost:3100/editor/propuestas).
// 21-nov-2026 (segunda tanda): la barra de avance del video de «¿Cómo medir?» (214/215) y la caja de preguntas al final
// de las preguntas frecuentes (B1-P6). Ya elegidos y puestos: pasos clave A, botones 217/224 diseño 1 y carrito 2.

export const dynamic = "force-dynamic";

// (Las listas van aquí, en el servidor: un módulo de cliente solo puede pasar componentes, no listas.)
const BARRAS = [
  { id: "1", nombre: "1 · Línea al borde", idea: "Una línea azul pegada abajo, siempre a la vista (como TikTok o Reels). Al tocarla crece y se arrastra; el minuto sale grande al centro.", Muestra: Barra1 },
  { id: "2", nombre: "2 · Controles al tocar", idea: "Como YouTube en el celular: al tocar el video salen el botón al centro y la barra con bolita y tiempos; a los 3 s se esconden y queda la línea fina.", Muestra: Barra2 },
  { id: "3", nombre: "3 · Píldora flotante", idea: "Una cápsula translúcida abajo con pausa, tiempo y barra, siempre a la vista. Casi no tapa el video y todo se entiende sin explicar.", Muestra: Barra3 },
  { id: "4", nombre: "4 · ±10 segundos", idea: "Al tocar salen tres botones grandes: regresar 10 s, pausa y adelantar 10 s, más la barra abajo. Fácil para regresar a lo que no se alcanzó a ver.", Muestra: Barra4 },
  { id: "5", nombre: "5 · Por partes", idea: "La barra dividida en las partes del video (qué entrada sirve, dónde se coloca, medir y elegir, ventanas, contacto). Tocar una parte salta a ella.", Muestra: Barra5 },
  { id: "6", nombre: "6 · Burbuja con el tiempo", idea: "Barra fina con bolita; al arrastrar, una burbuja azul encima de la bolita dice el minuto exacto al que va a saltar.", Muestra: Barra6 },
];

const PREGUNTAS = [
  { id: "1", nombre: "1 · Como el video", idea: "Cada pregunta es una tarjeta. Al abrirla, la respuesta se va escribiendo y debajo aparece la siguiente pregunta que suele seguir, unida con una línea. Lo que escriben en la caja se agrega como otra tarjeta.", Muestra: Preguntas1 },
  { id: "2", nombre: "2 · Acordeón y caja al final", idea: "Las preguntas como están hoy y, al final, la caja. La respuesta sale debajo con 2 preguntas relacionadas para tocar.", Muestra: Preguntas2 },
  { id: "3", nombre: "3 · Sugerencias al escribir", idea: "Mientras escriben, debajo de la caja salen las preguntas que se parecen (y el tamaño si escriben una medida); tocan la suya y sale la respuesta.", Muestra: Preguntas3 },
  { id: "4", nombre: "4 · Con temas y «¿Te sirvió?»", idea: "Debajo de la caja, botones de tema (precio, envío, instalación…) para quien no sabe qué escribir. Si la respuesta no le sirvió, la manda por WhatsApp.", Muestra: Preguntas4 },
];


export default async function Propuestas() {
  if (!editorDisponible() || !hostLocal((await headers()).get("host"))) notFound();
  const seccion = leerPlantilla("product.b1").secciones.find((s) => s.tipo === "landing-preguntas");
  const preguntas = seccion?.bloques.filter((b) => b.tipo === "question") ?? [];
  const banco = armarBanco(preguntas);
  const datos = { faqs: banco.slice(0, preguntas.length), banco, tamanos: tamanosBuscador() };

  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-marino">
      <h1 className="titulo-version m-0 text-[30px]">Propuestas para elegir</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Todas se pueden probar aquí mismo: dale play al video, arrastra la barra o escribe una pregunta. Dime cuál de cada una: por ejemplo «Barra 3» y «Preguntas 1».
      </p>

      <section aria-labelledby="t-barras" className="mt-10">
        <h2 id="t-barras" className="titulo-version m-0 text-[24px]">
          Barra de avance del video (214 y 215)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Ninguna achica el video: todo va encima. La barra es azul para que se vea sobre cualquier parte del video. Se ven a tamaño de la ventana en el celular.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {BARRAS.map(({ id, nombre, idea, Muestra }) => (
            <figure key={id} className="m-0 w-[343px]">
              <figcaption className="mb-2 min-h-[92px]">
                <strong className="block font-titulo text-[19px]">{nombre}</strong>
                <span className="text-[14px] text-tinta">{idea}</span>
              </figcaption>
              <div className="rounded-2xl bg-white p-3 shadow-[0_20px_50px_-20px_rgba(12,30,51,0.45)]">
                <Muestra />
              </div>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-preguntas" className="mt-14">
        <h2 id="t-preguntas" className="titulo-version m-0 text-[24px]">
          Caja de preguntas al final de las preguntas frecuentes (B1-P6)
        </h2>
        <p className="m-0 mt-1 mb-5 max-w-3xl text-[15px] text-tinta">
          Al estilo del video que compartiste. Sin IA: contestan con lo que ya está escrito (aquí, las preguntas de la sección y el banco de hoy; al construirla, también toda la guía de
          Angela del CRM). Si no hay respuesta, ofrece mandar la pregunta por WhatsApp. Prueba escribir, por ejemplo: «¿llega a Monterrey?» o «mi puerta mide 95 cm».
        </p>
        <div className="flex flex-wrap items-start gap-8">
          {PREGUNTAS.map(({ id, nombre, idea, Muestra }) => (
            <figure key={id} className="m-0 w-[375px]">
              <figcaption className="mb-2 min-h-[92px]">
                <strong className="block font-titulo text-[19px]">{nombre}</strong>
                <span className="text-[14px] text-tinta">{idea}</span>
              </figcaption>
              <div className="rounded-2xl bg-white p-4 shadow-[0_20px_50px_-20px_rgba(12,30,51,0.45)]">
                <Muestra {...datos} />
              </div>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
