"use client";

// Galería de la ficha de D (25-nov-2026): una foto grande con flechas a los lados, «Foto 1 de 5» y el botón «Ampliar»,
// que abre la foto a pantalla completa (con sus flechas y «Cerrar»). Abajo, las miniaturas en un renglón para saltar a
// cualquier foto. También se puede deslizar con el dedo.

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { IconoTache } from "../landing/piezas";

type Foto = { src: string; alt: string; estilo?: CSSProperties; marca?: Record<string, string> };

function Flecha({ lado, etiqueta, alTocar, oculta, grande = false }: { lado: "izq" | "der"; etiqueta: string; alTocar: () => void; oculta: boolean; grande?: boolean }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={alTocar}
      disabled={oculta}
      className={`absolute top-1/2 ${lado === "izq" ? "left-3" : "right-3"} flex ${grande ? "size-16" : "size-14"} -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#0b2545] shadow-[0_6px_18px_rgba(11,37,69,0.35)] disabled:opacity-0`}
    >
      <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d={lado === "izq" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

export function GaleriaD({ fotos, textos }: { fotos: Foto[]; textos: { contador: string; ampliar: string; cerrar: string } }) {
  const tira = useRef<HTMLDivElement>(null);
  const ventana = useRef<HTMLDialogElement>(null);
  const [actual, setActual] = useState(0);
  const ir = (i: number) => {
    const n = Math.max(0, Math.min(fotos.length - 1, i));
    setActual(n);
    const el = tira.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };
  if (!fotos.length) return null;
  const contador = textos.contador.replace("{n}", String(actual + 1)).replace("{total}", String(fotos.length));
  const foto = fotos[actual];
  return (
    <div>
      <div className="relative">
        <div
          ref={tira}
          onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:rounded-xl lg:border lg:border-[#dde2e8] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((f, i) => (
            <div key={f.src + i} className="relative aspect-square w-full shrink-0 snap-start overflow-hidden bg-[#f4f6f8]">
              <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 620px, 100vw" preload={i === 0} loading={i < 2 ? "eager" : "lazy"} className="object-cover" style={f.estilo} {...f.marca} />
            </div>
          ))}
        </div>
        {fotos.length > 1 && (
          <>
            <p className="absolute top-3 left-3 m-0 rounded-md bg-[#0b2545] px-3 py-1.5 text-[16px] font-semibold text-white" aria-live="polite">
              {contador}
            </p>
            <Flecha lado="izq" etiqueta="Foto anterior" alTocar={() => ir(actual - 1)} oculta={actual === 0} />
            <Flecha lado="der" etiqueta="Foto siguiente" alTocar={() => ir(actual + 1)} oculta={actual === fotos.length - 1} />
          </>
        )}
        <button
          type="button"
          onClick={() => ventana.current?.showModal()}
          className="absolute right-3 bottom-3 flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-[17px] font-semibold text-[#0b2545] shadow-[0_6px_18px_rgba(11,37,69,0.3)]"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          {textos.ampliar}
        </button>
      </div>
      {fotos.length > 1 && (
        <div className="marco-version mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
          {fotos.map((f, i) => (
            <button
              key={f.src + i}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ver la foto ${i + 1}`}
              aria-current={i === actual || undefined}
              className={`relative size-[68px] shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${i === actual ? "border-[#0b2545]" : "border-transparent opacity-75"}`}
            >
              <Image src={f.src} alt="" fill sizes="68px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <dialog ref={ventana} aria-label={textos.ampliar} className="version m-0 h-dvh max-h-none w-full max-w-none bg-[#0b2545] p-0 text-white backdrop:bg-black/70">
        <div className="flex h-16 items-center justify-between px-4">
          <p className="m-0 text-[17px] font-semibold">{contador}</p>
          <button type="button" onClick={() => ventana.current?.close()} className="flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 text-[17px] font-semibold">
            <IconoTache className="size-6" />
            {textos.cerrar}
          </button>
        </div>
        <div className="relative h-[calc(100dvh-64px)]">
          <Image src={foto.src} alt={foto.alt} fill sizes="100vw" className="object-contain" />
          {fotos.length > 1 && (
            <>
              <Flecha lado="izq" etiqueta="Foto anterior" alTocar={() => ir(actual - 1)} oculta={actual === 0} grande />
              <Flecha lado="der" etiqueta="Foto siguiente" alTocar={() => ir(actual + 1)} oculta={actual === fotos.length - 1} grande />
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
