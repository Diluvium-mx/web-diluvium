"use client";

// Galería de la ficha de las versiones. Sale del mapa de calor (11-nov-2026): en el celular la galería de hoy ocupa
// toda la primera pantalla y la mitad de la gente se va sin ver el precio; quien se queda toca mucho las flechas y las
// fotos (son de lo más tocado de la página). Aquí:
// - se desliza con el dedo (scroll-snap, sin código que mueva nada) y tiene flechas grandes y un contador «2 / 9»;
// - en el celular es más baja (4:3), para que título, precio y tamaños entren en la primera pantalla;
// - en computadora lleva miniaturas debajo;
// - el video tiene su propio reproductor (VideoGaleria.tsx): corre solo al llegar a él y se pausa con un toque;
// - la foto de antes y después (B1) se arrastra desde su línea; el resto de esa foto desliza la galería como las demás.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Comparador } from "./Comparador";
import { VideoGaleria } from "./VideoGaleria";

/** estilo: encuadre y acercamiento elegidos en el editor · marca: para que el editor sepa de qué campo es la foto. */
type Ajuste = { estilo?: CSSProperties; marca?: Record<string, string> };
export type MedioGaleria =
  | ({ tipo: "imagen"; src: string; alt: string } & Ajuste)
  | ({ tipo: "video"; src: string; poster: string; alt: string } & Ajuste)
  | {
      tipo: "antesDespues";
      antes: { src: string; alt: string; etiqueta: string } & Ajuste;
      despues: { src: string; alt: string; etiqueta: string } & Ajuste;
    };

const TAMANO = "(min-width: 1200px) 640px, (min-width: 1024px) 52vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 32px)";

/** «sección|pieza|campo» → «pieza» (para que cada cuadro conserve su número en el mapa aunque cambie de lugar). */
function piezaDe(m: MedioGaleria): string | undefined {
  const marca = m.tipo === "antesDespues" ? m.antes.marca : m.marca;
  return marca?.["data-editar"]?.split("|")[1] || undefined;
}

function miniatura(m: MedioGaleria): { src: string; alt: string } {
  if (m.tipo === "imagen") return m;
  if (m.tipo === "video") return { src: m.poster, alt: m.alt };
  return m.despues;
}

function Flecha({ lado, onClick, disabled }: { lado: "antes" | "despues"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-evento="mira_galeria"
      aria-label={lado === "antes" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 z-[2] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-marino shadow-[0_4px_14px_-6px_rgba(12,30,51,0.55)] transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0 ${
        lado === "antes" ? "left-2.5 md:left-3" : "right-2.5 md:right-3"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d={lado === "antes" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

export function Galeria({
  medios,
  forma = "normal",
  pie,
  pista,
  tocaParaOir,
}: {
  medios: MedioGaleria[];
  forma?: "normal" | "baja";
  pie?: string;
  /** Pista del antes y después («← Arrastra la línea →»). */
  pista?: string;
  tocaParaOir?: string;
}) {
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);

  // La foto a la vista se calcula con lo que se desplazó la tira (cuenta igual con el dedo, las flechas o el teclado).
  useEffect(() => {
    const el = tira.current;
    if (!el) return;
    let pendiente = 0;
    const revisar = () => {
      pendiente = 0;
      if (el.clientWidth) setActual(Math.round(el.scrollLeft / el.clientWidth));
    };
    const alMover = () => {
      if (!pendiente) pendiente = requestAnimationFrame(revisar);
    };
    el.addEventListener("scroll", alMover, { passive: true });
    return () => {
      el.removeEventListener("scroll", alMover);
      cancelAnimationFrame(pendiente);
    };
  }, []);

  const ir = useCallback((i: number) => {
    const el = tira.current;
    if (!el) return;
    const destino = Math.max(0, Math.min(medios.length - 1, i));
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: destino * el.clientWidth, behavior: suave ? "smooth" : "auto" });
  }, [medios.length]);

  if (!medios.length) return null;
  const alto = forma === "baja" ? "aspect-[16/10] md:aspect-[16/10] lg:aspect-square" : "aspect-[4/3] md:aspect-[16/10] lg:aspect-square";

  return (
    <div className="min-w-0">
      <div
        role="region"
        aria-roledescription="galería"
        aria-label="Fotos y video de la compuerta"
        className={`relative overflow-hidden rounded-2xl bg-niebla md:rounded-3xl ${alto}`}
      >
        <div
          ref={tira}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") ir(actual + 1);
            else if (e.key === "ArrowLeft") ir(actual - 1);
            else return;
            e.preventDefault();
          }}
          className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {medios.map((m, i) => (
            <div
              key={i}
              // Para el mapa de elementos: la pieza de la plantilla a la que pertenece este cuadro.
              data-pieza={piezaDe(m)}
              role="group"
              aria-roledescription="foto"
              aria-label={`${i + 1} de ${medios.length}`}
              // overflow-hidden: una foto acercada no se sale de su cuadro.
              className="relative size-full shrink-0 snap-start snap-always overflow-hidden"
            >
              {m.tipo === "imagen" && (
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes={TAMANO}
                  // La primera es la foto más grande de la pantalla: va primero. La 2 y la 3 también cargan de una vez
                  // (al deslizar rápido en iPhone no asoma un cuadro vacío); las demás, cuando se acercan.
                  preload={i === 0}
                  loading={i < 3 ? "eager" : "lazy"}
                  // Encuadre y acercamiento elegidos en el editor.
                  style={m.estilo}
                  {...m.marca}
                  className="object-cover"
                />
              )}
              {m.tipo === "video" && <VideoGaleria src={m.src} poster={m.poster} alt={m.alt} activo={i === actual} estilo={m.estilo} marca={m.marca} tocaParaOir={tocaParaOir} />}
              {m.tipo === "antesDespues" && <Comparador antes={m.antes} despues={m.despues} sizes={TAMANO} forma="size-full" arrastre="linea" desvanecerEtiquetas repetirCada={6000} pista={pista} />}
            </div>
          ))}
        </div>
        {medios.length > 1 && (
          <>
            <Flecha lado="antes" onClick={() => ir(actual - 1)} disabled={actual === 0} />
            <Flecha lado="despues" onClick={() => ir(actual + 1)} disabled={actual >= medios.length - 1} />
            <span
              aria-live="polite"
              className="pointer-events-none absolute top-3 right-3 z-[2] rounded-full bg-tinta/75 px-2.5 py-1 text-[13px] leading-4 font-semibold text-white tabular-nums"
            >
              {actual + 1} / {medios.length}
            </span>
          </>
        )}
      </div>
      {pie && <p className="m-0 mt-2 text-[14px] leading-5 text-texto-suave">{pie}</p>}
      {medios.length > 1 && (
        <ul className="m-0 mt-3 hidden list-none grid-cols-6 gap-2 p-0 lg:grid">
          {medios.slice(0, 12).map((m, i) => {
            const t = miniatura(m);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => ir(i)}
                  data-evento="mira_galeria"
                  aria-label={`Ver foto ${i + 1}${m.tipo === "video" ? " (video)" : ""}`}
                  aria-current={i === actual ? "true" : undefined}
                  className={`relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 bg-niebla ${
                    i === actual ? "border-marino" : "border-transparent hover:border-linea"
                  }`}
                >
                  <Image src={t.src} alt="" fill sizes="96px" className="object-cover" />
                  {m.tipo === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-tinta/30 text-white">
                      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
