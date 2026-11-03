"use client";

// Galería de la ficha de producto (miniaturas abajo). Celular y tableta: carrusel de orilla a orilla que se desliza,
// con flechas, contador «1 / 11» y lupa; miniaturas en tira debajo. Computadora (1025 px o más): una foto a la vez
// con esquinas redondeadas, lupa, y la tira de miniaturas centrada con flechas que la recorren de una en una.
// Tocar la foto abre el visor a pantalla completa; el video se reproduce ahí mismo al tocar el botón ▶.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Medio } from "../catalogo";
import { BOTON_ICONO } from "../estilos";
import { IconoFlechaDerecha, IconoLupa, IconoPlay } from "./Iconos";
import { VisorMedios } from "./VisorMedios";

const ESCRITORIO = "(min-width: 1025px)";
const PASO_MINIATURA = 72; // 64 px + 8 px de espacio

export function GaleriaFicha({ medios, titulo }: { medios: Medio[]; titulo: string }) {
  const [activo, setActivo] = useState(0);
  const [videos, setVideos] = useState<Set<number>>(() => new Set());
  const [visor, setVisor] = useState<number | null>(null);
  const [tira, setTira] = useState({ inicio: true, fin: true });
  const pista = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const total = medios.length;
  const cerrarVisor = useCallback(() => setVisor(null), []);

  // Celular y tableta: el contador sigue al carrusel cuando se desliza con el dedo.
  const alDeslizar = useCallback(() => {
    const el = pista.current;
    if (!el || el.clientWidth === 0 || window.matchMedia(ESCRITORIO).matches) return;
    const i = Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)));
    setActivo((previo) => (previo === i ? previo : i));
  }, [total]);

  const revisarTira = useCallback(() => {
    const el = lista.current;
    if (!el) return;
    setTira({ inicio: el.scrollLeft <= 1, fin: el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 });
  }, []);

  useEffect(() => {
    revisarTira();
    window.addEventListener("resize", revisarTira);
    return () => window.removeEventListener("resize", revisarTira);
  }, [revisarTira]);

  // El video que deja de verse se pausa.
  useEffect(() => {
    pista.current?.querySelectorAll("video").forEach((v) => {
      if (Number(v.dataset.indice) !== activo) v.pause();
    });
  }, [activo]);

  // La miniatura activa siempre a la vista dentro de su tira.
  useEffect(() => {
    const el = lista.current;
    const boton = el?.children[activo] as HTMLElement | undefined;
    if (!el || !boton) return;
    const izquierda = boton.offsetLeft - el.offsetLeft;
    if (izquierda < el.scrollLeft || izquierda + boton.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: izquierda - (window.matchMedia(ESCRITORIO).matches ? 0 : el.offsetLeft), behavior: "smooth" });
    }
  }, [activo]);

  function ir(i: number) {
    const destino = Math.min(total - 1, Math.max(0, i));
    setActivo(destino);
    const el = pista.current;
    if (el && !window.matchMedia(ESCRITORIO).matches) el.scrollTo({ left: destino * el.clientWidth, behavior: "smooth" });
  }

  function reproducir(i: number) {
    setVideos((v) => new Set(v).add(i));
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 min-[1025px]:gap-8">
      {/* Foto o video principal */}
      <div className="relative -mx-[var(--margen)] min-w-0 min-[1025px]:mx-0">
        <div
          ref={pista}
          onScroll={alDeslizar}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] min-[1025px]:overflow-hidden [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carrusel"
          aria-label={`Galería de ${titulo}`}
        >
          {medios.map((m, i) => (
            <div
              key={m.src}
              className={`relative aspect-square w-full shrink-0 snap-start overflow-hidden bg-white min-[1025px]:rounded-[32px] ${
                i === activo ? "" : "min-[1025px]:hidden"
              }`}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
            >
              {m.tipo === "imagen" ? (
                <button
                  type="button"
                  onClick={() => setVisor(i)}
                  className="group/zoom relative block size-full cursor-zoom-in bg-white"
                  aria-label={`Abrir medios ${i + 1} en modal`}
                  tabIndex={i === activo ? 0 : -1}
                >
                  <Image
                    src={m.src}
                    alt={m.alt || titulo}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1025px) 636px, 100vw"
                    className="object-contain"
                  />
                  <span className="absolute right-3 bottom-4 z-[1]">
                    <span className={`${BOTON_ICONO} relative size-9 group-hover/zoom:text-white group-hover/zoom:after:bottom-0 min-[1025px]:size-10`}>
                      <IconoLupa ancho={16} className="min-[1025px]:size-5" />
                    </span>
                  </span>
                </button>
              ) : videos.has(i) ? (
                <video
                  data-indice={i}
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
                  onClick={() => reproducir(i)}
                  className="group/play relative block size-full cursor-pointer"
                  aria-label={`Reproducir video de ${titulo}`}
                  tabIndex={i === activo ? 0 : -1}
                >
                  <Image src={m.poster} alt="" fill sizes="(min-width: 1025px) 636px, 100vw" className="object-contain" />
                  <span
                    className={`${BOTON_ICONO} absolute top-1/2 left-1/2 z-[1] size-10 -translate-1/2 rounded-full group-hover/play:text-white group-hover/play:after:bottom-0`}
                  >
                    <IconoPlay ancho={20} />
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Flechas y contador del carrusel (celular y tableta) */}
        {total > 1 && (
          <div className="min-[1025px]:hidden">
            {activo > 0 && (
              <button
                type="button"
                onClick={() => ir(activo - 1)}
                className={`${BOTON_ICONO} absolute top-1/2 left-4 z-[1] size-9 -translate-y-1/2`}
                aria-label="Deslizar a la izquierda"
              >
                <IconoFlechaDerecha ancho={16} className="rotate-180" />
              </button>
            )}
            <div
              className="pointer-events-none absolute bottom-4 left-4 z-[1] border border-[rgba(10,85,154,0.12)] bg-white px-4 py-1 text-base leading-6 text-azul"
              aria-live="polite"
            >
              <span>{activo + 1}</span> <span aria-hidden="true">/</span> <span className="sr-only">de</span> <span>{total}</span>
            </div>
            {activo < total - 1 && (
              <button
                type="button"
                onClick={() => ir(activo + 1)}
                className={`${BOTON_ICONO} absolute top-1/2 right-4 z-[1] size-9 -translate-y-1/2`}
                aria-label="Deslizar a la derecha"
              >
                <IconoFlechaDerecha ancho={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      <div className="relative -mx-[var(--margen)] flex items-center min-[1025px]:mx-0">
        <div
          ref={lista}
          onScroll={revisarTira}
          role="list"
          aria-label="Deslizador"
          className="flex w-full items-center gap-2 overflow-x-auto pl-[var(--margen)] [scrollbar-width:none] min-[1025px]:mx-12 min-[1025px]:max-w-[calc(100%-96px)] min-[1025px]:justify-center-safe min-[1025px]:pl-0 [&::-webkit-scrollbar]:hidden"
        >
          {medios.map((m, i) => (
            <div key={m.src} role="listitem" className="relative flex max-w-16 shrink-0 items-center justify-center rounded-[16px]">
              <button
                type="button"
                onClick={() => ir(i)}
                aria-label={`Abrir medio ${i + 1} en vista de galería`}
                aria-current={i === activo}
                className={`relative size-16 cursor-pointer overflow-hidden rounded-[16px] border bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] ${
                  i === activo ? "border-azul" : "border-[rgba(10,85,154,0.12)]"
                }`}
              >
                <Image src={m.tipo === "video" ? m.poster : m.src} alt="" width={62} height={62} sizes="62px" className="block size-[62px] object-cover" />
                {m.tipo === "video" && (
                  <span className="absolute top-1 left-1 z-[2] flex size-4 items-center justify-center rounded-full bg-white text-azul">
                    <IconoPlay ancho={16} />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
        {!tira.inicio && (
          <button
            type="button"
            onClick={() => lista.current?.scrollBy({ left: -PASO_MINIATURA, behavior: "smooth" })}
            className={`${BOTON_ICONO} absolute top-1/2 left-0 z-[3] size-10 -translate-y-1/2 max-[1024px]:hidden!`}
            aria-label="Deslizar a la izquierda"
          >
            <IconoFlechaDerecha ancho={20} className="rotate-180" />
          </button>
        )}
        {!tira.fin && (
          <button
            type="button"
            onClick={() => lista.current?.scrollBy({ left: PASO_MINIATURA, behavior: "smooth" })}
            className={`${BOTON_ICONO} absolute top-1/2 right-0 z-[3] size-10 -translate-y-1/2 max-[1024px]:hidden!`}
            aria-label="Deslizar a la derecha"
          >
            <IconoFlechaDerecha ancho={20} />
          </button>
        )}
      </div>

      {visor !== null && <VisorMedios medios={medios} inicial={visor} titulo={titulo} alCerrar={cerrarVisor} />}
    </div>
  );
}
