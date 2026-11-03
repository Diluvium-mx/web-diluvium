"use client";

// Galería de fotos y videos de un producto. Celular y tableta: carrusel que se desliza con contador «1 / 11»,
// flechas y miniaturas abajo. Computadora (1025 px o más): miniaturas en columna a la izquierda con flechas que las
// recorren, y la foto elegida a la derecha.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Medio } from "./catalogo";
import { BOTON_ICONO } from "./estilos";

const PASO_MINIATURAS = 72; // 64 px de miniatura + 8 px de espacio
const ESCRITORIO = "(min-width: 1025px)";

function Flecha({ className, girar = 0 }: { className?: string; girar?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={{ rotate: `${girar}deg` }} aria-hidden="true" focusable="false">
      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

function IconoPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function GaleriaProducto({ medios, titulo }: { medios: Medio[]; titulo: string }) {
  const [activo, setActivo] = useState(0);
  const [reproducir, setReproducir] = useState<number | null>(null);
  const [miniaturas, setMiniaturas] = useState({ inicio: true, fin: false });
  const pista = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const total = medios.length;

  // Celular y tableta: el contador sigue al carrusel cuando se desliza con el dedo.
  const alDeslizar = useCallback(() => {
    const el = pista.current;
    if (!el || el.clientWidth === 0 || window.matchMedia(ESCRITORIO).matches) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActivo((previo) => (previo === i ? previo : Math.min(total - 1, Math.max(0, i))));
  }, [total]);

  const revisarMiniaturas = useCallback(() => {
    const el = lista.current;
    if (!el) return;
    const vertical = window.matchMedia(ESCRITORIO).matches;
    const pos = vertical ? el.scrollTop : el.scrollLeft;
    const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    setMiniaturas({ inicio: pos <= 1, fin: pos >= max - 1 });
  }, []);

  useEffect(() => {
    revisarMiniaturas();
    window.addEventListener("resize", revisarMiniaturas);
    return () => window.removeEventListener("resize", revisarMiniaturas);
  }, [revisarMiniaturas]);

  // La miniatura activa siempre a la vista dentro de su tira.
  useEffect(() => {
    const el = lista.current;
    const boton = el?.children[activo] as HTMLElement | undefined;
    if (!el || !boton) return;
    if (window.matchMedia(ESCRITORIO).matches) {
      if (boton.offsetTop < el.scrollTop || boton.offsetTop + boton.offsetHeight > el.scrollTop + el.clientHeight) {
        el.scrollTo({ top: boton.offsetTop, behavior: "smooth" });
      }
    } else if (boton.offsetLeft < el.scrollLeft || boton.offsetLeft + boton.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: boton.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }
  }, [activo]);

  function ir(i: number) {
    const destino = Math.min(total - 1, Math.max(0, i));
    setActivo(destino);
    const el = pista.current;
    if (el && !window.matchMedia(ESCRITORIO).matches) el.scrollTo({ left: destino * el.clientWidth, behavior: "smooth" });
    // En computadora el video empieza solo al elegirlo, como en la tienda.
    if (medios[destino]?.tipo === "video" && window.matchMedia(ESCRITORIO).matches) setReproducir(destino);
  }

  function moverMiniaturas(direccion: 1 | -1) {
    lista.current?.scrollBy({ top: direccion * PASO_MINIATURAS, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 min-[1025px]:grid min-[1025px]:grid-cols-[64px_minmax(0,1fr)] min-[1025px]:gap-8">
      {/* Foto o video principal */}
      <div className="relative min-w-0 min-[1025px]:col-start-2 min-[1025px]:row-start-1">
        <div
          ref={pista}
          onScroll={alDeslizar}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] min-[1025px]:overflow-hidden [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carrusel"
          aria-label={`Galería de ${titulo}`}
        >
          {medios.map((m, i) => (
            <div
              key={m.src}
              className={`relative aspect-square w-full shrink-0 snap-start overflow-hidden rounded-[16px] md:rounded-[24px] min-[1025px]:rounded-[32px] ${i === activo ? "" : "min-[1025px]:hidden"}`}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={i !== activo}
            >
              {m.tipo === "imagen" ? (
                <Image
                  src={m.src}
                  alt={m.alt || titulo}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1025px) 540px, calc(100vw - 2 * var(--margen))"
                  className="object-contain"
                />
              ) : reproducir === i ? (
                <video
                  src={m.src}
                  poster={m.poster}
                  className="size-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  aria-label={m.alt}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setReproducir(i)}
                  className="group/play relative block size-full cursor-pointer"
                  aria-label={`Reproducir video de ${titulo}`}
                  tabIndex={i === activo ? 0 : -1}
                >
                  <Image src={m.poster} alt="" fill sizes="(min-width: 1025px) 540px, 100vw" className="object-contain" />
                  <span className={`${BOTON_ICONO} absolute top-1/2 left-1/2 z-[1] size-10 -translate-1/2 group-hover/play:text-white group-hover/play:after:bottom-0`}>
                    <IconoPlay className="size-5" />
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Controles del carrusel (celular y tableta) */}
        <div className="min-[1025px]:hidden">
          {activo > 0 && (
            <button
              type="button"
              onClick={() => ir(activo - 1)}
              className={`${BOTON_ICONO} absolute top-1/2 left-4 z-[1] size-9 -translate-y-1/2`}
              aria-label="Anterior"
            >
              <Flecha className="size-4" girar={180} />
            </button>
          )}
          <div className="pointer-events-none absolute bottom-4 left-4 z-[1] border border-[rgba(10,85,154,0.12)] bg-white px-4 py-1 text-base leading-6 text-azul" aria-live="polite">
            <span>{activo + 1}</span> <span aria-hidden="true">/</span> <span className="sr-only">de</span> <span>{total}</span>
          </div>
          {activo < total - 1 && (
            <button
              type="button"
              onClick={() => ir(activo + 1)}
              className={`${BOTON_ICONO} absolute top-1/2 right-4 z-[1] size-9 -translate-y-1/2`}
              aria-label="Siguiente"
            >
              <Flecha className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Miniaturas: tira abajo en celular y tableta; columna con flechas en computadora */}
      <div className="relative -mx-[var(--margen)] min-[1025px]:col-start-1 min-[1025px]:row-start-1 min-[1025px]:mx-0 min-[1025px]:flex min-[1025px]:items-center min-[1025px]:py-12">
        <div className="relative min-[1025px]:w-16">
          <div
            ref={lista}
            onScroll={revisarMiniaturas}
            className="flex gap-2 overflow-x-auto pl-[var(--margen)] [scrollbar-width:none] min-[1025px]:h-[352px] min-[1025px]:flex-col min-[1025px]:overflow-x-hidden min-[1025px]:overflow-y-auto min-[1025px]:pl-0 [&::-webkit-scrollbar]:hidden"
          >
            {medios.map((m, i) => (
              <button
                key={m.src}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ver ${m.tipo === "video" ? "video" : "foto"} ${i + 1} de ${total}`}
                aria-current={i === activo}
                className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-[16px] border ${i === activo ? "border-azul" : "border-[rgba(10,85,154,0.12)]"}`}
              >
                <Image src={m.tipo === "video" ? m.poster : m.src} alt="" fill sizes="64px" className="object-cover" />
                {m.tipo === "video" && (
                  <span className="absolute top-1 left-1 z-[1] flex size-4 items-center justify-center rounded-full bg-white text-azul">
                    <IconoPlay className="size-4 p-[2px]" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {!miniaturas.inicio && (
            <button
              type="button"
              onClick={() => moverMiniaturas(-1)}
              className={`${BOTON_ICONO} absolute -top-12 left-1/2 z-[1] size-10 -translate-x-1/2 max-[1024px]:invisible`}
              aria-label="Miniaturas anteriores"
            >
              <Flecha className="size-5" girar={-90} />
            </button>
          )}
          {!miniaturas.fin && (
            <button
              type="button"
              onClick={() => moverMiniaturas(1)}
              className={`${BOTON_ICONO} absolute -bottom-12 left-1/2 z-[1] size-10 -translate-x-1/2 max-[1024px]:invisible`}
              aria-label="Más miniaturas"
            >
              <Flecha className="size-5" girar={90} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
