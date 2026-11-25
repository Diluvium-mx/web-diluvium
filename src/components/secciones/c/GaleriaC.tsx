"use client";

// Galería de la ficha de C (25-nov-2026, para 40-60 años): una foto grande a la vez con flechas grandes a los lados
// (también en el celular) y «Foto 1 de 5» arriba; también se puede deslizar con el dedo.

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";

type Foto = { src: string; alt: string; estilo?: CSSProperties; marca?: Record<string, string> };

export function GaleriaC({ fotos }: { fotos: Foto[] }) {
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const ir = (i: number) => {
    const el = tira.current;
    const n = Math.max(0, Math.min(fotos.length - 1, i));
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };
  if (!fotos.length) return null;
  return (
    <div className="relative">
      <div
        ref={tira}
        onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:rounded-3xl [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <div key={f.src + i} className="relative aspect-square w-full shrink-0 snap-start overflow-hidden bg-[#f3f8fd]">
            <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 620px, 100vw" preload={i === 0} loading={i < 2 ? "eager" : "lazy"} className="object-cover" style={f.estilo} {...f.marca} />
          </div>
        ))}
      </div>
      {fotos.length > 1 && (
        <>
          <p className="absolute top-3 left-3 m-0 rounded-full bg-[#06182f]/85 px-3.5 py-1.5 text-[16px] font-semibold text-white" aria-live="polite">
            Foto {actual + 1} de {fotos.length}
          </p>
          {[
            { d: -1, t: "Foto anterior", p: "M15 5l-7 7 7 7", lado: "left-3" },
            { d: 1, t: "Foto siguiente", p: "M9 5l7 7-7 7", lado: "right-3" },
          ].map((b) => (
            <button
              key={b.d}
              type="button"
              aria-label={b.t}
              onClick={() => ir(actual + b.d)}
              disabled={b.d < 0 ? actual === 0 : actual === fotos.length - 1}
              className={`absolute top-1/2 ${b.lado} flex size-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#06182f] shadow-[0_6px_18px_rgba(6,24,47,0.35)] disabled:opacity-0`}
            >
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d={b.p} />
              </svg>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
