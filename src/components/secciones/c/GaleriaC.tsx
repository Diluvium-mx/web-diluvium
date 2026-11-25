"use client";

// Galería de la ficha de C: las fotos en fila, cada una casi del ancho de la pantalla y la siguiente asomando (se
// entiende sola que se desliza). Abajo, puntos que dicen en cuál va. En computadora, flechas a los lados.

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";

type Foto = { src: string; alt: string; estilo?: CSSProperties; marca?: Record<string, string> };

export function GaleriaC({ fotos }: { fotos: Foto[] }) {
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const ir = (i: number) => {
    const el = tira.current;
    const hijo = el?.children[Math.max(0, Math.min(fotos.length - 1, i))] as HTMLElement | undefined;
    if (el && hijo) el.scrollTo({ left: hijo.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };
  if (!fotos.length) return null;
  return (
    <div className="relative">
      <div
        ref={tira}
        onScroll={(e) => {
          const el = e.currentTarget;
          const ancho = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
          setActual(Math.round(el.scrollLeft / (ancho + 10)));
        }}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-4 px-4 pt-3 [scrollbar-width:none] lg:px-0 lg:pt-0 [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <div key={f.src + i} className="relative aspect-[4/5] w-[86%] shrink-0 snap-start overflow-hidden rounded-[26px] bg-[#eef5fc] lg:w-full">
            <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 620px, 86vw" preload={i === 0} loading={i < 2 ? "eager" : "lazy"} className="object-cover" style={f.estilo} {...f.marca} />
          </div>
        ))}
      </div>
      {fotos.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {fotos.map((f, i) => (
              <span key={f.src + i} className={`h-2 rounded-full transition-all ${i === actual ? "w-6 bg-[#06182f]" : "w-2 bg-[#c8d8e8]"}`} />
            ))}
          </div>
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
              className={`absolute top-[45%] ${b.lado} hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#06182f] shadow-lg disabled:opacity-0 lg:flex`}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d={b.p} />
              </svg>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
