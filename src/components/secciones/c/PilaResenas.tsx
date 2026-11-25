"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { EstrellaC } from "./comun";

type R = { id: string; nombre: string; texto: string; estrellas: number; foto: string; ancho: number; alto: number };

export function PilaResenas({ resenas, oscuro, textos }: { resenas: R[]; oscuro: boolean; textos: { anterior: string; siguiente: string; de: string } }) {
  const [i, setI] = useState(0);
  const [completa, setCompleta] = useState(false);
  const dedo = useRef<number | null>(null);
  const n = resenas.length;
  const ir = (k: number) => {
    setI((k + n) % n);
    setCompleta(false);
  };
  const r = resenas[i];
  const largo = r.texto.length > 160;
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div
        className="relative h-[520px] select-none"
        onPointerDown={(e) => (dedo.current = e.clientX)}
        onPointerUp={(e) => {
          const d = dedo.current === null ? 0 : e.clientX - dedo.current;
          dedo.current = null;
          if (Math.abs(d) > 50) ir(i + (d < 0 ? 1 : -1));
        }}
      >
        {/* Las dos que siguen asoman detrás, giradas. */}
        {[2, 1].map((k) => {
          const s = resenas[(i + k) % n];
          return (
            <div
              key={`${s.id}-${k}`}
              aria-hidden="true"
              className="absolute inset-x-4 top-0 bottom-6 overflow-hidden rounded-[28px] bg-white shadow-lg"
              style={{ transform: `rotate(${k === 1 ? 4 : -5}deg) translateY(${k * 6}px)`, opacity: k === 1 ? 0.9 : 0.6 }}
            >
              <Image src={s.foto} alt="" fill sizes="440px" className="object-cover" />
            </div>
          );
        })}
        <article key={r.id} className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] bg-white text-tinta shadow-[0_30px_60px_-25px_rgba(6,24,47,0.7)]">
          <div className="relative min-h-0 flex-1 bg-[#eef5fc]">
            <Image src={r.foto} alt={`Compuerta de ${r.nombre} puesta en su entrada`} fill sizes="440px" className="object-cover" />
            <span className="absolute top-3 left-3 rounded-full bg-[#06182f]/80 px-3 py-1 text-[13px] font-semibold text-white tabular-nums">{textos.de.replace("{n}", String(i + 1)).replace("{total}", String(n))}</span>
          </div>
          <div className="px-5 pt-4 pb-5">
            <span className="flex text-estrella" role="img" aria-label={`${r.estrellas} de 5 estrellas`}>
              {Array.from({ length: r.estrellas }, (_, k) => (
                <EstrellaC key={k} className="size-[18px]" />
              ))}
            </span>
            <p className={`m-0 mt-2 text-[16px] leading-[1.5] ${completa ? "" : "line-clamp-3"}`}>«{r.texto}»</p>
            {largo && !completa && (
              <button type="button" onClick={() => setCompleta(true)} className="mt-1 cursor-pointer text-[14.5px] font-semibold text-[#1b7fd1] underline">
                Leer completa
              </button>
            )}
            <p className="m-0 mt-2 text-[15px] font-bold text-[#06182f]">{r.nombre}</p>
          </div>
        </article>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        {[
          { d: -1, t: textos.anterior, p: "M15 5l-7 7 7 7" },
          { d: 1, t: textos.siguiente, p: "M9 5l7 7-7 7" },
        ].map((b) => (
          <button
            key={b.d}
            type="button"
            onClick={() => ir(i + b.d)}
            aria-label={b.t}
            className={`flex size-14 cursor-pointer items-center justify-center rounded-full ${oscuro ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#06182f] text-white hover:bg-[#0b2546]"}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d={b.p} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
