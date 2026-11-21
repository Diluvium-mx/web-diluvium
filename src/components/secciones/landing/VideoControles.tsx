"use client";

// Reproductor del video «¿Cómo medir?» (Producto 214/215, propuesta 2 que eligió el dueño, 21-nov-2026, con sus
// cambios). Nada achica el video: los controles van encima.
// - Tocar el video lo pausa (o lo sigue) al instante y muestra los controles. En pausa se quedan a la vista; mientras
//   corre se esconden solos a los 2 s y queda una línea azul fina abajo con el avance.
// - Controles: regresar 10 s, pausa/reproducir, adelantar 10 s; abajo la barra azul (se toca o se arrastra) con los
//   tiempos y el botón de pantalla completa. Sonido arriba a la derecha.
// - Empieza solo y con sonido al abrir la ventana (la persona lo pidió con un toque); si el teléfono no deja, empieza
//   sin sonido con el botón para activarlo. Al cerrar la ventana se pausa y al volver sigue donde iba.

import { useCallback, useEffect, useRef, useState } from "react";

const AZUL = "#3d8ef0";
const PLAY = "M8 5.5v13l10.5-6.5L8 5.5z";
const PAUSA = "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z";
const SIN_SONIDO = "M4 9v6h4l5 4V5L8 9H4zm12.6 3l2.7-2.7-1.1-1.1-2.7 2.7-2.7-2.7-1.1 1.1 2.7 2.7-2.7 2.7 1.1 1.1 2.7-2.7 2.7 2.7 1.1-1.1z";
const CON_SONIDO = "M4 9v6h4l5 4V5L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM13 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z";
const COMPLETA = "M4 9V4h5v2H6v3H4zm10-5h6v5h-2V6h-4V4zM4 15h2v3h3v2H4v-5zm14 3v-3h2v5h-6v-2h4z";
const SALIR_COMPLETA = "M9 4v5H4V7h3V4h2zm6 0h2v3h3v2h-5V4zM4 15h5v5H7v-3H4v-2zm11 0h5v2h-3v3h-2v-5z";
const ESCONDER_MS = 2000;

const reloj = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function Icono({ d, className }: { d: string; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

export function VideoControles({ src, poster, alt, activo }: { src: string; poster: string; alt: string; activo: boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [andando, setAndando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [visibles, setVisibles] = useState(true);
  const [completa, setCompleta] = useState(false);

  /** Muestra los controles; mientras corre, se esconden solos a los 2 s. */
  const mostrar = useCallback((corriendo: boolean) => {
    setVisibles(true);
    clearTimeout(espera.current);
    if (corriendo) espera.current = setTimeout(() => !arrastrando.current && setVisibles(false), ESCONDER_MS);
  }, []);
  useEffect(() => () => clearTimeout(espera.current), []);

  // Al abrir la ventana: con sonido; si el teléfono no deja, sin sonido. Al cerrarla, en pausa.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!activo) {
      v.pause();
      return;
    }
    v.muted = false;
    v.play()
      .then(() => setMudo(false))
      .catch(() => {
        v.muted = true;
        setMudo(true);
        v.play().catch(() => {});
      });
  }, [activo]);

  // El avance se pinta una vez por cuadro mientras corre.
  useEffect(() => {
    if (!andando) return;
    let cuadro = 0;
    const paso = () => {
      if (video.current) setT(video.current.currentTime);
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [andando]);

  useEffect(() => {
    const cambio = () => setCompleta(document.fullscreenElement === caja.current);
    document.addEventListener("fullscreenchange", cambio);
    return () => document.removeEventListener("fullscreenchange", cambio);
  }, []);

  /** Tocar el video: pausa o sigue al instante y muestra los controles. */
  function alternar() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      mostrar(true);
    } else {
      v.pause();
      mostrar(false);
    }
  }

  function saltar(s: number) {
    const v = video.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + s));
    setT(v.currentTime);
    mostrar(!v.paused);
  }

  function irA(clientX: number) {
    const v = video.current;
    const r = pista.current?.getBoundingClientRect();
    if (!v || !r || !v.duration) return;
    v.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * v.duration;
    setT(v.currentTime);
  }

  function sonido() {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    mostrar(!v.paused);
  }

  function pantallaCompleta() {
    const c = caja.current;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!c || !v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (c.requestFullscreen) {
      c.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    } else {
      // iPhone: solo el video entra a pantalla completa (con los controles del teléfono).
      v.webkitEnterFullscreen?.();
    }
    mostrar(!v.paused);
  }

  const f = dur ? t / dur : 0;
  const parar = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div ref={caja} className="absolute inset-0 overflow-hidden bg-tinta select-none" onClick={alternar}>
      <video
        ref={video}
        src={src}
        poster={poster}
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label={alt}
        className="absolute inset-0 size-full object-contain"
        onPlay={() => {
          setAndando(true);
          mostrar(true);
        }}
        onPause={() => {
          setAndando(false);
          mostrar(false);
        }}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onSeeked={(e) => setT(e.currentTarget.currentTime)}
      />

      {/* Sonido: siempre a la vista. */}
      <button
        type="button"
        onClick={(e) => {
          parar(e);
          sonido();
        }}
        data-evento="mira_video"
        aria-label={mudo ? "Activar el sonido" : "Quitar el sonido"}
        aria-pressed={!mudo}
        className="absolute top-3 right-3 z-[3] flex size-11 cursor-pointer items-center justify-center rounded-full bg-tinta/65 text-white"
      >
        <Icono d={mudo ? SIN_SONIDO : CON_SONIDO} className="size-6" />
      </button>
      {mudo && andando && (
        <span className="pointer-events-none absolute top-5 right-16 z-[3] rounded-full bg-tinta/70 px-2.5 py-1 text-[13px] leading-4 font-semibold text-white">Toca para oír</span>
      )}

      {visibles ? (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-tinta/25" />
          {/* Centro: regresar 10 s, pausa/reproducir, adelantar 10 s. */}
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center gap-7">
            <button
              type="button"
              onClick={(e) => {
                parar(e);
                saltar(-10);
              }}
              aria-label="Regresar 10 segundos"
              className="pointer-events-auto flex size-13 cursor-pointer flex-col items-center justify-center rounded-full bg-tinta/55 text-[12px] leading-none font-bold text-white"
            >
              <span className="text-[19px] leading-none">↺</span>10
            </button>
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-marino shadow-lg">
              <Icono d={andando ? PAUSA : PLAY} className={`size-8 ${andando ? "" : "ml-1"}`} />
            </span>
            <button
              type="button"
              onClick={(e) => {
                parar(e);
                saltar(10);
              }}
              aria-label="Adelantar 10 segundos"
              className="pointer-events-auto flex size-13 cursor-pointer flex-col items-center justify-center rounded-full bg-tinta/55 text-[12px] leading-none font-bold text-white"
            >
              <span className="text-[19px] leading-none">↻</span>10
            </button>
          </div>
          {/* Abajo: tiempos, barra azul y pantalla completa. */}
          <div className="absolute inset-x-0 bottom-0 z-[2] flex items-center gap-2 bg-gradient-to-t from-tinta/80 to-transparent pt-6 pr-1.5 pl-3 text-[12.5px] font-semibold text-white tabular-nums" onClick={parar}>
            <span className="w-9">{reloj(t)}</span>
            <div
              ref={pista}
              role="slider"
              tabIndex={0}
              aria-label="Avance del video"
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(t)}
              aria-valuetext={`${reloj(t)} de ${reloj(dur)}`}
              className="relative flex h-10 flex-1 cursor-pointer touch-none items-center"
              onPointerDown={(e) => {
                arrastrando.current = true;
                clearTimeout(espera.current);
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // Sin captura: se sigue mientras el dedo esté encima.
                }
                irA(e.clientX);
              }}
              onPointerMove={(e) => arrastrando.current && irA(e.clientX)}
              onPointerUp={() => {
                arrastrando.current = false;
                mostrar(!video.current?.paused);
              }}
              onPointerCancel={() => {
                arrastrando.current = false;
                mostrar(!video.current?.paused);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") saltar(-5);
                else if (e.key === "ArrowRight") saltar(5);
                else return;
                e.preventDefault();
              }}
            >
              <div className="relative h-1.5 w-full rounded-full bg-white/35">
                <div className="h-full rounded-full" style={{ width: `${f * 100}%`, background: AZUL }} />
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white" style={{ left: `${f * 100}%`, background: AZUL }} />
              </div>
            </div>
            <span className="w-9 text-right">{reloj(dur)}</span>
            <button type="button" onClick={pantallaCompleta} aria-label={completa ? "Salir de pantalla completa" : "Pantalla completa"} className="flex size-10 cursor-pointer items-center justify-center rounded-full">
              <Icono d={completa ? SALIR_COMPLETA : COMPLETA} className="size-6" />
            </button>
          </div>
        </>
      ) : (
        // Escondidos: solo la línea azul fina con el avance.
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1 bg-white/30">
          <div className="h-full" style={{ width: `${f * 100}%`, background: AZUL }} />
        </div>
      )}
    </div>
  );
}
