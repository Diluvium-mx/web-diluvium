"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type Historia = { id: string; foto: string; alt: string; titulo: string; texto: string; estilo?: CSSProperties; marca?: Record<string, string> };

const DURA = 5000;

export function HistoriasCCliente({ historias }: { historias: Historia[] }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [visible, setVisible] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const n = historias.length;

  // Solo corre mientras está a la vista y si la persona no pidió menos movimiento.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const vigia = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    vigia.observe(el);
    return () => vigia.disconnect();
  }, []);
  const corre = visible && !pausa && n > 1 && typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (!corre) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), DURA);
    return () => clearTimeout(t);
  }, [corre, i, n]);

  if (!n) return null;
  const h = historias[i];
  return (
    <div
      ref={caja}
      role="group"
      aria-roledescription="historias"
      aria-label={`${i + 1} de ${n}: ${h.titulo}`}
      className="relative mx-auto aspect-[9/14] w-full max-w-[420px] overflow-hidden rounded-[28px] bg-[#06182f] text-white shadow-[0_30px_70px_-30px_rgba(6,24,47,0.8)] select-none"
      onPointerDown={() => setPausa(true)}
      onPointerUp={() => setPausa(false)}
      onPointerLeave={() => setPausa(false)}
    >
      {historias.map((x, k) => (
        <Image
          key={x.id}
          src={x.foto}
          alt={k === i ? x.alt : ""}
          fill
          sizes="420px"
          loading={k < 2 ? "eager" : "lazy"}
          className={`object-cover transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`}
          style={x.estilo}
          {...x.marca}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" aria-hidden="true" />
      {/* Barras de avance */}
      <div className="absolute inset-x-3 top-3 flex gap-1.5" aria-hidden="true">
        {historias.map((x, k) => (
          <span key={x.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
            <span
              key={`${i}-${k}`}
              className="block h-full bg-white"
              style={k < i ? { width: "100%" } : k === i ? { width: "100%", animation: corre ? `avance-c ${DURA}ms linear` : undefined, animationPlayState: pausa ? "paused" : "running" } : { width: 0 }}
            />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="m-0 font-titulo text-[13px] font-semibold tracking-[0.14em] text-[#7cc4fa] uppercase">
          {i + 1} / {n}
        </p>
        <p className="titulo-version m-0 mt-1 text-[26px] leading-tight">{h.titulo}</p>
        <p className="m-0 mt-1.5 text-[16px] leading-[1.5] text-white/85">{h.texto}</p>
      </div>
      {/* Tocar a la izquierda regresa; a la derecha, avanza. */}
      <button type="button" aria-label="Anterior" onClick={() => setI((x) => (x - 1 + n) % n)} className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" />
      <button type="button" aria-label="Siguiente" onClick={() => setI((x) => (x + 1) % n)} className="absolute inset-y-0 right-0 w-2/3 cursor-pointer" />
    </div>
  );
}
