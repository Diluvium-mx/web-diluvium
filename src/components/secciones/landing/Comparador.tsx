"use client";

// B1: foto de antes y después que se desliza. Se arrastra desde cualquier punto de la foto (mouse o dedo), se puede
// tocar para saltar ahí y se mueve con las flechas del teclado (Inicio/Fin a los extremos). Al primer movimiento se
// esconde la pista «Desliza».

import Image from "next/image";
import { useRef, useState } from "react";

type Lado = { src: string; alt: string; etiqueta: string };

export function Comparador({ antes, despues, sizes }: { antes: Lado; despues: Lado; sizes: string }) {
  const [pos, setPos] = useState(50);
  const [movido, setMovido] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  function mover(clientX: number) {
    const r = caja.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    setMovido(true);
  }

  const redondo = Math.round(pos);

  return (
    <div
      ref={caja}
      className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-2xl bg-niebla select-none md:aspect-[16/9] md:rounded-3xl lg:aspect-square"
      onPointerDown={(e) => {
        arrastrando.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        mover(e.clientX);
      }}
      onPointerMove={(e) => arrastrando.current && mover(e.clientX)}
      onPointerUp={() => (arrastrando.current = false)}
      onPointerCancel={() => (arrastrando.current = false)}
    >
      <Image src={antes.src} alt={antes.alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Image src={despues.src} alt={despues.alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-cover" draggable={false} />
      </div>

      {antes.etiqueta && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-tinta/80 px-2.5 py-1 text-[13px] font-semibold text-white md:bottom-4 md:left-4 md:text-sm">
          {antes.etiqueta}
        </span>
      )}
      {despues.etiqueta && (
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-marino px-2.5 py-1 text-[13px] font-semibold text-white md:right-4 md:bottom-4 md:text-sm">
          {despues.etiqueta}
        </span>
      )}

      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(12,30,51,0.15)]" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={redondo}
        aria-valuetext={`${redondo} % de la foto de antes a la vista`}
        aria-orientation="horizontal"
        className="absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-marino shadow-[0_6px_18px_-6px_rgba(12,30,51,0.6)] active:cursor-grabbing"
        style={{ left: `${pos}%` }}
        onKeyDown={(e) => {
          const paso = e.shiftKey ? 10 : 4;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") setPos((p) => Math.max(0, p - paso));
          else if (e.key === "ArrowRight" || e.key === "ArrowUp") setPos((p) => Math.min(100, p + paso));
          else if (e.key === "Home") setPos(0);
          else if (e.key === "End") setPos(100);
          else return;
          e.preventDefault();
          setMovido(true);
        }}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      </div>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-white/90 px-2.5 py-1 text-[13px] font-semibold text-marino transition-opacity duration-300 md:top-4 ${
          movido ? "opacity-0" : "opacity-100"
        }`}
      >
        ← Desliza →
      </span>
    </div>
  );
}
