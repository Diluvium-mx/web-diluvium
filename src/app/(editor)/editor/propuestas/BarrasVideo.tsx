"use client";

// 6 propuestas de barra de avance para el video de «¿Cómo medir?» (Producto 214/215, dueño 21-nov-2026). Ninguna
// achica el video: todo va encima de él. Cada una funciona de verdad con el video para probarla aquí (editor local).

import { useEffect, useRef, useState, type ReactNode } from "react";

const SRC = "/media/videos/donde-medir.mp4";
const POSTER = "/media/videos/donde-medir-poster.jpg";
const AZUL = "#3d8ef0";
// Partes del video (aproximadas, viendo el video; se ajustan si se elige esta propuesta).
const PARTES = [
  { desde: 0, nombre: "Qué entrada sirve" },
  { desde: 36, nombre: "Dónde se coloca" },
  { desde: 60, nombre: "Medir y elegir tamaño" },
  { desde: 96, nombre: "Ventanas" },
  { desde: 120, nombre: "Contacto" },
];

const reloj = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function Icono({ d, className = "size-7" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}
const PLAY = "M8 5.5v13l10.5-6.5L8 5.5z";
const PAUSA = "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z";

/** Estado del video compartido por las 6 propuestas. */
function useVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(133);
  const [andando, setAndando] = useState(false);
  useEffect(() => {
    if (!andando) return;
    let c = 0;
    const paso = () => {
      if (video.current) setT(video.current.currentTime);
      c = requestAnimationFrame(paso);
    };
    c = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(c);
  }, [andando]);
  const alternar = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const ir = (s: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.min(dur, Math.max(0, s));
    setT(v.currentTime);
  };
  const props = {
    ref: video,
    src: SRC,
    poster: POSTER,
    playsInline: true,
    preload: "metadata" as const,
    onPlay: () => setAndando(true),
    onPause: () => setAndando(false),
    onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => setDur(e.currentTarget.duration),
    onSeeked: (e: React.SyntheticEvent<HTMLVideoElement>) => setT(e.currentTarget.currentTime),
    className: "absolute inset-0 size-full object-contain",
  };
  return { props, t, dur, andando, alternar, ir, f: dur ? t / dur : 0 };
}

/** Pista que se toca o se arrastra para ir a otro punto. */
function Pista({ alIr, dur, t = 0, children, className, alArrastrar }: { alIr: (s: number) => void; dur: number; t?: number; children: ReactNode; className: string; alArrastrar?: (a: boolean) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const tomado = useRef(false);
  const mover = (x: number) => {
    const r = caja.current?.getBoundingClientRect();
    if (r) alIr(Math.min(1, Math.max(0, (x - r.left) / r.width)) * dur);
  };
  return (
    <div
      ref={caja}
      role="slider"
      tabIndex={0}
      aria-label="Avance del video"
      aria-valuemin={0}
      aria-valuemax={Math.round(dur)}
      aria-valuenow={Math.round(t)}
      className={`touch-none ${className}`}
      onPointerDown={(e) => {
        e.stopPropagation();
        tomado.current = true;
        alArrastrar?.(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        mover(e.clientX);
      }}
      onPointerMove={(e) => tomado.current && mover(e.clientX)}
      onPointerUp={() => {
        tomado.current = false;
        alArrastrar?.(false);
      }}
      onPointerCancel={() => {
        tomado.current = false;
        alArrastrar?.(false);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function Marco({ children, alTocar }: { children: ReactNode; alTocar?: () => void }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-tinta" onClick={alTocar}>
      {children}
    </div>
  );
}

/** Controles que aparecen al tocar y se esconden solos a los 3 s mientras corre. */
function useAlTocar(andando: boolean) {
  const [visible, setVisible] = useState(true);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mostrar = () => {
    setVisible(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setVisible(false), 3000);
  };
  useEffect(() => () => clearTimeout(t.current), []);
  return { visible: visible || !andando, mostrar };
}

// 1 · Línea al borde: siempre a la vista, pegada abajo; al tocarla crece y se arrastra.
export function Barra1() {
  const v = useVideo();
  const [arrastra, setArrastra] = useState(false);
  return (
    <Marco alTocar={v.alternar}>
      <video {...v.props} />
      {!v.andando && <BotonCentro andando={false} />}
      {arrastra && <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 rounded-xl bg-tinta/70 px-4 py-2 text-[22px] font-bold text-white tabular-nums">{reloj(v.t)}</span>}
      <Pista dur={v.dur} t={v.t} alIr={v.ir} alArrastrar={setArrastra} className="absolute inset-x-0 bottom-0 flex h-7 items-end">
        <div className={`relative w-full bg-white/35 transition-[height] ${arrastra ? "h-2" : "h-1"}`}>
          <div className="h-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
          <span className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-opacity ${arrastra ? "opacity-100" : "opacity-0"}`} style={{ left: `${v.f * 100}%`, background: AZUL }} />
        </div>
      </Pista>
    </Marco>
  );
}

function BotonCentro({ andando }: { andando: boolean }) {
  return (
    <span className="pointer-events-none absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-white/95 text-marino shadow-lg">
      <Icono d={andando ? PAUSA : PLAY} className={`size-8 ${andando ? "" : "ml-1"}`} />
    </span>
  );
}

// 2 · Controles al tocar: tocar el video muestra el botón al centro y la barra con su bolita y los tiempos; a los 3 s
// se esconden y queda la línea fina.
export function Barra2() {
  const v = useVideo();
  const c = useAlTocar(v.andando);
  return (
    <Marco
      alTocar={() => {
        if (c.visible) v.alternar();
        c.mostrar();
      }}
    >
      <video {...v.props} />
      {c.visible ? (
        <>
          <span className="pointer-events-none absolute inset-0 bg-tinta/25" />
          <BotonCentro andando={v.andando} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/80 to-transparent px-3 pt-6 pb-1.5">
            <Pista dur={v.dur} t={v.t} alIr={(s) => (v.ir(s), c.mostrar())} className="relative flex h-6 items-center">
              <div className="relative h-1.5 w-full rounded-full bg-white/35">
                <div className="h-full rounded-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white" style={{ left: `${v.f * 100}%`, background: AZUL }} />
              </div>
            </Pista>
            <p className="m-0 flex justify-between text-[12.5px] font-semibold text-white tabular-nums">
              <span>{reloj(v.t)}</span>
              <span>{reloj(v.dur)}</span>
            </p>
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/35">
          <div className="h-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
        </div>
      )}
    </Marco>
  );
}

// 3 · Píldora flotante: una cápsula translúcida abajo con play, tiempo y barra; casi no tapa nada.
export function Barra3() {
  const v = useVideo();
  return (
    <Marco alTocar={v.alternar}>
      <video {...v.props} />
      <div className="absolute inset-x-2.5 bottom-2.5 flex h-10 items-center gap-2 rounded-full bg-tinta/60 pr-3.5 pl-1 text-white backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={v.alternar} aria-label={v.andando ? "Pausar" : "Reproducir"} className="flex size-8 cursor-pointer items-center justify-center rounded-full">
          <Icono d={v.andando ? PAUSA : PLAY} className="size-5" />
        </button>
        <span className="w-9 text-[12px] font-semibold tabular-nums">{reloj(v.t)}</span>
        <Pista dur={v.dur} t={v.t} alIr={v.ir} className="relative flex h-8 flex-1 items-center">
          <div className="relative h-1 w-full rounded-full bg-white/35">
            <div className="h-full rounded-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
            <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${v.f * 100}%` }} />
          </div>
        </Pista>
        <span className="w-9 text-right text-[12px] font-semibold text-white/80 tabular-nums">{reloj(v.dur)}</span>
      </div>
    </Marco>
  );
}

function Salto({ s, alTocar, children }: { s: number; alTocar: (s: number) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        alTocar(s);
      }}
      aria-label={s < 0 ? "Regresar 10 segundos" : "Adelantar 10 segundos"}
      className="flex size-12 cursor-pointer flex-col items-center justify-center rounded-full bg-tinta/55 text-[11px] leading-none font-bold text-white"
    >
      {children}
    </button>
  );
}

// 4 · ±10 segundos: al tocar salen tres botones grandes (regresar 10 s, pausa, adelantar 10 s) y la barra.
export function Barra4() {
  const v = useVideo();
  const c = useAlTocar(v.andando);
  const saltar = (s: number) => {
    v.ir(v.t + s);
    c.mostrar();
  };
  return (
    <Marco
      alTocar={() => {
        if (c.visible) v.alternar();
        c.mostrar();
      }}
    >
      <video {...v.props} />
      {c.visible && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-6 bg-tinta/25 [&>*]:pointer-events-auto">
          <Salto s={-10} alTocar={saltar}>
            <span className="text-[18px]">↺</span>10
          </Salto>
          <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-marino shadow-lg">
            <Icono d={v.andando ? PAUSA : PLAY} className={`size-8 ${v.andando ? "" : "ml-1"}`} />
          </span>
          <Salto s={10} alTocar={saltar}>
            <span className="text-[18px]">↻</span>10
          </Salto>
        </div>
      )}
      <Pista dur={v.dur} t={v.t} alIr={v.ir} className="absolute inset-x-0 bottom-0 flex h-6 items-end">
        <div className="h-1 w-full bg-white/35">
          <div className="h-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
        </div>
      </Pista>
    </Marco>
  );
}

// 5 · Por partes: la barra dividida en las partes del video; al tocar una parte va al inicio de esa parte y arriba se
// lee en cuál va («Medir y elegir tamaño»).
export function Barra5() {
  const v = useVideo();
  const actual = [...PARTES].reverse().find((p) => v.t >= p.desde) ?? PARTES[0];
  return (
    <Marco alTocar={v.alternar}>
      <video {...v.props} />
      {!v.andando && <BotonCentro andando={false} />}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/80 to-transparent px-2.5 pt-7 pb-2" onClick={(e) => e.stopPropagation()}>
        <p className="m-0 mb-1 text-[12.5px] font-bold text-white">{actual.nombre}</p>
        <div className="flex gap-1">
          {PARTES.map((p, i) => {
            const hasta = PARTES[i + 1]?.desde ?? v.dur;
            const lleno = Math.min(1, Math.max(0, (v.t - p.desde) / (hasta - p.desde)));
            return (
              <button
                key={p.nombre}
                type="button"
                onClick={() => v.ir(p.desde + 0.1)}
                aria-label={`Ir a: ${p.nombre}`}
                className="flex h-6 cursor-pointer items-center"
                style={{ flex: `${hasta - p.desde} 1 0` }}
              >
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/35">
                  <span className="block h-full" style={{ width: `${lleno * 100}%`, background: AZUL }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Marco>
  );
}

// 6 · Burbuja con el tiempo: barra fina con bolita; al arrastrar, una burbuja encima de la bolita dice el minuto.
export function Barra6() {
  const v = useVideo();
  const [arrastra, setArrastra] = useState(false);
  return (
    <Marco alTocar={v.alternar}>
      <video {...v.props} />
      {!v.andando && <BotonCentro andando={false} />}
      <Pista dur={v.dur} t={v.t} alIr={v.ir} alArrastrar={setArrastra} className="absolute inset-x-3 bottom-1.5 flex h-8 items-center">
        <div className="relative h-1.5 w-full rounded-full bg-white/40">
          <div className="h-full rounded-full" style={{ width: `${v.f * 100}%`, background: AZUL }} />
          <span className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-[width,height] ${arrastra ? "size-5" : "size-3.5"}`} style={{ left: `${v.f * 100}%`, background: AZUL }} />
          {arrastra && (
            <span className="absolute bottom-4 -translate-x-1/2 rounded-lg px-2 py-1 text-[13px] font-bold text-white tabular-nums shadow" style={{ left: `${v.f * 100}%`, background: AZUL }}>
              {reloj(v.t)}
            </span>
          )}
        </div>
      </Pista>
    </Marco>
  );
}
