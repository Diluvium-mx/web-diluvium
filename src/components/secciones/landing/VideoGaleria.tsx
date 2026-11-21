"use client";

// Video de la galería de la ficha (18-nov-2026, a pedido del dueño): en vez de los controles de siempre del navegador
// (chiquitos y distintos en cada teléfono), un reproductor propio, pensado para el dedo:
// - llena el cuadro de la galería como las fotos (el video es cuadrado; se recorta un poco arriba y abajo);
// - al llegar a él se reproduce solo y sin sonido, como en Facebook e Instagram (no si el teléfono pide ahorrar datos
//   o menos movimiento); al pasar a otra foto se pausa;
// - tocar cualquier parte del video lo pausa o lo sigue; un botón grande al centro dice qué va a pasar;
// - botón de sonido abajo a la derecha y una barra fina con el avance.
// No baja nada hasta que llegan a él (preload="none"): la página abre igual de rápido.

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  src: string;
  poster: string;
  alt: string;
  activo: boolean;
  estilo?: CSSProperties;
  marca?: Record<string, string>;
  /** Empieza con sonido (cuando la persona lo pidió con un toque, p. ej. «¿Cómo medir?»). Si el teléfono no lo deja,
   *  empieza sin sonido y queda el botón para activarlo. */
  conSonido?: boolean;
  /** Ajuste de la foto antes de reproducir y del video: cover (llena el cuadro) o contain (se ve completo). */
  ajuste?: "cover" | "contain";
};

function Icono({ d, className = "size-8" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

const PLAY = "M8 5.5v13l10.5-6.5L8 5.5z";
const PAUSA = "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z";
const SIN_SONIDO = "M4 9v6h4l5 4V5L8 9H4zm12.6 3l2.7-2.7-1.1-1.1-2.7 2.7-2.7-2.7-1.1 1.1 2.7 2.7-2.7 2.7 1.1 1.1 2.7-2.7 2.7 2.7 1.1-1.1z";
const CON_SONIDO = "M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM13 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z";

export function VideoGaleria({ src, poster, alt, activo, estilo, marca, conSonido = false, ajuste = "cover" }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const [andando, setAndando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mudo, setMudo] = useState(!conSonido);
  const [destello, setDestello] = useState<"play" | "pausa" | null>(null);
  // Si la persona lo pausó, ya no se vuelve a reproducir solo al regresar a esta foto.
  const pausadoPorUsuario = useRef(false);

  // Se reproduce solo al llegar (sin sonido) y se pausa al irse.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!activo) {
      v.pause();
      return;
    }
    const ahorro =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (pausadoPorUsuario.current || (ahorro && !conSonido)) return;
    v.muted = !conSonido;
    v.play().catch(() => {
      // El teléfono no dejó reproducir con sonido: sin sonido, con el botón para activarlo.
      v.muted = true;
      setMudo(true);
      v.play().catch(() => {});
    });
  }, [activo, conSonido]);

  // La barra de avance se mueve una vez por cuadro mientras corre (transform: no repinta nada más).
  useEffect(() => {
    if (!andando) return;
    let cuadro = 0;
    const pintar = () => {
      const v = video.current;
      if (v && barra.current && v.duration) barra.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      cuadro = requestAnimationFrame(pintar);
    };
    cuadro = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(cuadro);
  }, [andando]);

  useEffect(() => {
    if (!destello) return;
    const t = setTimeout(() => setDestello(null), 650);
    return () => clearTimeout(t);
  }, [destello]);

  function alternar() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      pausadoPorUsuario.current = false;
      v.play().catch(() => {});
      setDestello("play");
    } else {
      pausadoPorUsuario.current = true;
      v.pause();
      setDestello("pausa");
    }
  }

  function sonido() {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    if (v.paused) {
      pausadoPorUsuario.current = false;
      v.play().catch(() => {});
    }
  }

  return (
    <div className="absolute inset-0 bg-tinta">
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label={alt}
        className={`absolute inset-0 size-full ${ajuste === "contain" ? "object-contain" : "object-cover"}`}
        style={estilo}
        {...marca}
        onPlay={() => setAndando(true)}
        onPause={() => setAndando(false)}
        onWaiting={() => setCargando(true)}
        onPlaying={() => setCargando(false)}
        onCanPlay={() => setCargando(false)}
      />

      {/* Toda la superficie: tocar pausa o reproduce. Deslizar sigue pasando de foto (un toque no es un deslizar). */}
      <button
        type="button"
        onClick={alternar}
        data-evento="mira_video"
        aria-label={andando ? "Pausar el video" : "Reproducir el video"}
        className="absolute inset-0 z-[1] flex cursor-pointer items-center justify-center"
      >
        {!andando && !cargando && (
          <span className="flex size-[72px] items-center justify-center rounded-full bg-white/95 text-marino shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
            <Icono d={PLAY} className="ml-1 size-9" />
          </span>
        )}
        {andando && destello && (
          <span className="animate-[video-destello_650ms_ease-out_forwards] flex size-[72px] items-center justify-center rounded-full bg-tinta/55 text-white">
            <Icono d={destello === "play" ? PLAY : PAUSA} className={`size-9 ${destello === "play" ? "ml-1" : ""}`} />
          </span>
        )}
        {cargando && (
          <span aria-hidden="true" className="size-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        )}
      </button>

      <button
        type="button"
        onClick={sonido}
        data-evento="mira_video"
        aria-label={mudo ? "Activar el sonido" : "Quitar el sonido"}
        aria-pressed={!mudo}
        className="absolute right-3 bottom-4 z-[3] flex size-11 cursor-pointer items-center justify-center rounded-full bg-tinta/70 text-white"
      >
        <Icono d={mudo ? SIN_SONIDO : CON_SONIDO} className="size-6" />
      </button>
      {mudo && andando && (
        <span className="pointer-events-none absolute right-16 bottom-6 z-[3] rounded-full bg-tinta/70 px-2.5 py-1 text-[13px] leading-4 font-semibold text-white">
          Toca para oír
        </span>
      )}

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[2] h-1 bg-white/30">
        <div ref={barra} className="h-full origin-left scale-x-0 bg-white will-change-transform" />
      </div>
    </div>
  );
}
