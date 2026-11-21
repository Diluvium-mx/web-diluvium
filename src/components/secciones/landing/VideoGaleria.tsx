"use client";

// Video de la galería de la ficha (18-nov-2026, a pedido del dueño): en vez de los controles de siempre del navegador
// (chiquitos y distintos en cada teléfono), un reproductor propio, pensado para el dedo:
// - llena el cuadro de la galería como las fotos (el video es cuadrado; se recorta un poco arriba y abajo);
// - al llegar a él se reproduce solo y sin sonido, como en Facebook e Instagram (no si el teléfono pide ahorrar datos
//   o menos movimiento); al pasar a otra foto se pausa;
// - tocar cualquier parte del video lo pausa o lo sigue; un botón grande al centro dice qué va a pasar;
// - botón de sonido abajo a la derecha y una barra fina con el avance.
// No baja nada hasta que llegan a él (preload="none"): la página abre igual de rápido.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

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
  /** Barra de avance azul que se toca o arrastra para regresar o adelantar, con el tiempo (Producto 214, dueño
   *  21-nov-2026). Sin ella, solo la línea fina blanca de avance. */
  conBarra?: boolean;
};

const reloj = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

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

export function VideoGaleria({ src, poster, alt, activo, estilo, marca, conSonido = false, ajuste = "cover", conBarra = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const relleno = useRef<HTMLDivElement>(null);
  const perilla = useRef<HTMLDivElement>(null);
  const tiempo = useRef<HTMLSpanElement>(null);
  const [duracion, setDuracion] = useState(0);
  const buscando = useRef(false);
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

  /** Pone la barra (y el tiempo) donde va el video. */
  const pintarAvance = useCallback(() => {
    const v = video.current;
    if (!v || !v.duration) return;
    const f = v.currentTime / v.duration;
    if (barra.current) barra.current.style.transform = `scaleX(${f})`;
    if (relleno.current) relleno.current.style.transform = `scaleX(${f})`;
    if (perilla.current) perilla.current.style.left = `${f * 100}%`;
    if (tiempo.current) tiempo.current.textContent = reloj(v.currentTime);
    pista.current?.setAttribute("aria-valuenow", String(Math.round(v.currentTime)));
    pista.current?.setAttribute("aria-valuetext", `${reloj(v.currentTime)} de ${reloj(v.duration)}`);
  }, []);

  // La barra de avance se mueve una vez por cuadro mientras corre (transform: no repinta nada más).
  useEffect(() => {
    if (!andando) return;
    let cuadro = 0;
    const pintar = () => {
      pintarAvance();
      cuadro = requestAnimationFrame(pintar);
    };
    cuadro = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(cuadro);
  }, [andando, pintarAvance]);

  /** Tocar o arrastrar la barra: el video va a ese punto. */
  function irA(clientX: number) {
    const v = video.current;
    const r = pista.current?.getBoundingClientRect();
    if (!v || !r || !v.duration) return;
    v.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * v.duration;
    pintarAvance();
  }

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
        className={`absolute inset-x-0 top-0 w-full ${conBarra ? "bottom-12 h-[calc(100%-3rem)]" : "bottom-0 h-full"} ${ajuste === "contain" ? "object-contain" : "object-cover"}`}
        style={estilo}
        {...marca}
        onPlay={() => setAndando(true)}
        onPause={() => setAndando(false)}
        onWaiting={() => setCargando(true)}
        onPlaying={() => setCargando(false)}
        onCanPlay={() => setCargando(false)}
        onLoadedMetadata={(e) => {
          setDuracion(e.currentTarget.duration);
          pintarAvance();
        }}
        onSeeked={pintarAvance}
      />

      {/* Toda la superficie: tocar pausa o reproduce. Deslizar sigue pasando de foto (un toque no es un deslizar). */}
      <button
        type="button"
        onClick={alternar}
        data-evento="mira_video"
        aria-label={andando ? "Pausar el video" : "Reproducir el video"}
        className={`absolute inset-x-0 top-0 z-[1] flex cursor-pointer items-center justify-center ${conBarra ? "bottom-12" : "bottom-0"}`}
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
        className={`absolute right-3 z-[3] flex size-11 cursor-pointer items-center justify-center rounded-full bg-tinta/70 text-white ${conBarra ? "top-3" : "bottom-4"}`}
      >
        <Icono d={mudo ? SIN_SONIDO : CON_SONIDO} className="size-6" />
      </button>
      {mudo && andando && (
        <span className={`pointer-events-none absolute right-16 z-[3] rounded-full bg-tinta/70 px-2.5 py-1 text-[13px] leading-4 font-semibold text-white ${conBarra ? "top-5" : "bottom-6"}`}>
          Toca para oír
        </span>
      )}

      {conBarra ? (
        // Barra de avance azul, debajo del video (no tapa sus letreros): se toca o se arrastra para regresar o adelantar;
        // con las flechas del teclado, 5 s.
        <div className="absolute inset-x-0 bottom-0 z-[3] flex h-12 items-center gap-2.5 bg-tinta px-3 text-[13px] font-semibold text-white tabular-nums">
          <span ref={tiempo} className="w-9 text-right">
            0:00
          </span>
          <div
            ref={pista}
            role="slider"
            tabIndex={0}
            aria-label="Avance del video"
            aria-valuemin={0}
            aria-valuemax={Math.round(duracion)}
            aria-valuenow={0}
            className="relative h-11 flex-1 cursor-pointer touch-none"
            onPointerDown={(e) => {
              buscando.current = true;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Sin captura: se sigue mientras el dedo esté encima.
              }
              irA(e.clientX);
            }}
            onPointerMove={(e) => buscando.current && irA(e.clientX)}
            onPointerUp={() => (buscando.current = false)}
            onPointerCancel={() => (buscando.current = false)}
            onKeyDown={(e) => {
              const v = video.current;
              if (!v || !v.duration) return;
              if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 5);
              else if (e.key === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 5);
              else return;
              e.preventDefault();
              pintarAvance();
            }}
          >
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/35">
              <div ref={relleno} className="h-full origin-left scale-x-0 rounded-full bg-[#3d8ef0] will-change-transform" />
            </div>
            <div ref={perilla} className="absolute top-1/2 left-0 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3d8ef0] ring-[3px] ring-white" />
          </div>
          <span className="w-9">{reloj(duracion)}</span>
        </div>
      ) : (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[2] h-1 bg-white/30">
          <div ref={barra} className="h-full origin-left scale-x-0 bg-white will-change-transform" />
        </div>
      )}
    </div>
  );
}
