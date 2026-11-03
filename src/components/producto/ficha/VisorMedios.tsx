"use client";

// Visor a pantalla completa de las fotos del producto (se abre al tocar la foto principal). Celular y tableta: fotos
// que se deslizan con flechas y contador abajo. Computadora: la foto arriba y las miniaturas de 96 px abajo. Tocar
// la foto la acerca al doble en ese punto; tocar otra vez la regresa. Se cierra con la ×, con Esc.

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Medio } from "../catalogo";
import { BOTON_ICONO } from "../estilos";
import { IconoCerrar, IconoFlechaDerecha, IconoPlay } from "./Iconos";

const ESCRITORIO = "(min-width: 1025px)";

function FotoConZoom({ m, titulo, prioridad }: { m: Extract<Medio, { tipo: "imagen" }>; titulo: string; prioridad: boolean }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  function alternar(e: MouseEvent<HTMLButtonElement>) {
    if (zoom) return setZoom(null);
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={zoom ? "Alejar" : "Acercar"}
      className={`relative block size-full overflow-hidden ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
    >
      <Image
        src={m.src}
        alt={m.alt || titulo}
        fill
        priority={prioridad}
        sizes="100vw"
        className="object-contain transition-transform duration-300"
        style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
      />
    </button>
  );
}

export function VisorMedios({
  medios,
  inicial,
  titulo,
  alCerrar,
}: {
  medios: Medio[];
  inicial: number;
  titulo: string;
  alCerrar: () => void;
}) {
  const [activo, setActivo] = useState(inicial);
  const [videos, setVideos] = useState<Set<number>>(() => new Set());
  const [visible, setVisible] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const total = medios.length;

  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const enfocado = document.activeElement as HTMLElement | null;
    cerrar.current?.focus({ preventScroll: true });
    const el = pista.current;
    if (el && !window.matchMedia(ESCRITORIO).matches) el.scrollTo({ left: inicial * el.clientWidth });
    const marco = requestAnimationFrame(() => setVisible(true));
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    document.addEventListener("keydown", alTeclear);
    return () => {
      cancelAnimationFrame(marco);
      document.body.style.overflow = antes;
      document.removeEventListener("keydown", alTeclear);
      enfocado?.focus({ preventScroll: true });
    };
  }, [inicial, alCerrar]);

  function alDeslizar() {
    const el = pista.current;
    if (!el || el.clientWidth === 0 || window.matchMedia(ESCRITORIO).matches) return;
    setActivo(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  }

  function ir(i: number) {
    const destino = Math.min(total - 1, Math.max(0, i));
    setActivo(destino);
    const el = pista.current;
    if (el && !window.matchMedia(ESCRITORIO).matches) el.scrollTo({ left: destino * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div
      className={`fixed inset-0 z-[60] bg-[rgba(23,22,26,0.5)] transition-opacity duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${titulo}`}
    >
      <div className="relative flex size-full flex-col bg-white">
        <div className="absolute top-4 right-4 z-[2] md:top-6 md:right-6 min-[1025px]:top-8 min-[1025px]:right-8">
          <button ref={cerrar} type="button" onClick={alCerrar} aria-label="Cerrar Modal" className={`${BOTON_ICONO} relative size-10 min-[1025px]:size-11`}>
            <IconoCerrar ancho={20} className="min-[1025px]:size-6" />
          </button>
        </div>

        <div
          ref={pista}
          onScroll={alDeslizar}
          className="flex min-h-0 w-full flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] min-[1025px]:overflow-hidden [&::-webkit-scrollbar]:hidden"
        >
          {medios.map((m, i) => (
            <div key={m.src} className={`relative h-full w-full shrink-0 snap-start ${i === activo ? "" : "min-[1025px]:hidden"}`}>
              {m.tipo === "imagen" ? (
                <FotoConZoom m={m} titulo={titulo} prioridad={i === inicial} />
              ) : videos.has(i) ? (
                <video src={m.src} poster={m.poster} className="size-full object-contain" controls autoPlay playsInline aria-label={m.alt} />
              ) : (
                <button
                  type="button"
                  onClick={() => setVideos((v) => new Set(v).add(i))}
                  className="group/play relative block size-full cursor-pointer"
                  aria-label={`Reproducir video de ${titulo}`}
                >
                  <Image src={m.poster} alt="" fill sizes="100vw" className="object-contain" />
                  <span className={`${BOTON_ICONO} absolute top-1/2 left-1/2 z-[1] size-10 -translate-1/2 rounded-full group-hover/play:text-white group-hover/play:after:bottom-0`}>
                    <IconoPlay ancho={20} />
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Celular y tableta: flechas y contador abajo */}
        <div className="flex w-full items-center justify-between px-6 pt-3 pb-6 min-[1025px]:hidden">
          <button
            type="button"
            onClick={() => ir(activo - 1)}
            disabled={activo === 0}
            aria-label="Diapositiva izquierda"
            className={`${BOTON_ICONO} relative size-9 disabled:bg-[rgba(0,0,0,0.12)] disabled:text-[rgba(10,85,154,0.12)] disabled:shadow-none`}
          >
            <IconoFlechaDerecha ancho={16} className="rotate-180" />
          </button>
          <div className="border border-[rgba(10,85,154,0.12)] px-4 py-1 text-base leading-6 text-azul" aria-live="polite">
            <span>{activo + 1}</span> <span aria-hidden="true">/ </span>
            <span className="sr-only">de</span>
            <span>{total}</span>
          </div>
          <button
            type="button"
            onClick={() => ir(activo + 1)}
            disabled={activo === total - 1}
            aria-label="Deslizar a la derecha"
            className={`${BOTON_ICONO} relative size-9 disabled:bg-[rgba(0,0,0,0.12)] disabled:text-[rgba(10,85,154,0.12)] disabled:shadow-none`}
          >
            <IconoFlechaDerecha ancho={16} />
          </button>
        </div>

        {/* Computadora: miniaturas de 96 px */}
        <div className="relative hidden h-40 shrink-0 items-center py-12 min-[1025px]:flex">
          <div className="flex w-full justify-center-safe gap-2 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {medios.map((m, i) => (
              <button
                key={m.src}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Abrir medio ${i + 1} en vista de galería`}
                aria-current={i === activo}
                className={`relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-[16px] border bg-white ${
                  i === activo ? "border-azul" : "border-transparent"
                }`}
              >
                <Image src={m.tipo === "video" ? m.poster : m.src} alt="" fill sizes="96px" className="object-cover" />
                {m.tipo === "video" && (
                  <span className="absolute top-1 left-1 z-[2] flex size-4 items-center justify-center rounded-full bg-white text-azul">
                    <IconoPlay ancho={16} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
