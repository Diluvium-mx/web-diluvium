"use client";

// Todas las reseñas de D, por páginas (propuesta R3, 25-nov-2026): el resumen arriba (el número, las estrellas,
// cuántas reseñas y cuántas de 5 estrellas), tres filtros grandes (Todas, Con foto, 5 estrellas), la lista de 6 en 6
// con su foto chica y, abajo, «Anterior», «3 de 40» y «Siguiente». La foto se toca para verla en grande.

import Image from "next/image";
import { useRef, useState } from "react";
import { IconoTache } from "../landing/piezas";
import { EstrellaD } from "./comun";

export type ResenaD = { id: string; nombre: string; texto: string; estrellas: number; fotos: string[] };
export type TextosResenasD = {
  total: string;
  cinco: string;
  todas: string;
  conFoto: string;
  cincoFiltro: string;
  anterior: string;
  siguiente: string;
  pagina: string;
  leer: string;
  cerrar: string;
};

const POR_PAGINA = 6;

export function ResenasDCliente({ resenas, numero, textos }: { resenas: ResenaD[]; numero: string; textos: TextosResenasD }) {
  const [filtro, setFiltro] = useState<"todas" | "foto" | "5">("todas");
  const [pagina, setPagina] = useState(1);
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const [foto, setFoto] = useState<{ src: string; nombre: string } | null>(null);
  const ventana = useRef<HTMLDialogElement>(null);
  const arriba = useRef<HTMLDivElement>(null);
  const lista = resenas.filter((r) => (filtro === "foto" ? r.fotos.length > 0 : filtro === "5" ? r.estrellas === 5 : true));
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const cinco = resenas.filter((r) => r.estrellas === 5).length;
  const irA = (p: number) => {
    setPagina(p);
    arriba.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const filtros = [
    ["todas", textos.todas, resenas.length],
    ["foto", textos.conFoto, resenas.filter((r) => r.fotos.length).length],
    ["5", textos.cincoFiltro, cinco],
  ] as const;

  return (
    <div ref={arriba} className="scroll-mt-28">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-[#0b2545] p-5 text-white">
        <span className="font-titulo text-[56px] leading-none font-bold">{numero}</span>
        <div>
          <span className="flex text-estrella" role="img" aria-label={`${numero} de 5 estrellas`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <EstrellaD key={i} className="size-7" />
            ))}
          </span>
          <p className="m-0 mt-1 text-[17px]">{textos.total.replace("{n}", String(resenas.length))}</p>
          <p className="m-0 text-[17px] text-white/85">{textos.cinco.replace("{n}", String(cinco))}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Filtrar reseñas">
        {filtros.map(([v, t, n]) => (
          <button
            key={v}
            type="button"
            aria-pressed={filtro === v}
            onClick={() => {
              setFiltro(v);
              setPagina(1);
            }}
            className={`flex min-h-[60px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-1 text-[16px] leading-tight font-bold ${filtro === v ? "border-[#0b2545] bg-[#0b2545] text-white" : "border-[#c9d1db] bg-white text-[#0b2545]"}`}
          >
            {t}
            <span className={`text-[14px] font-semibold ${filtro === v ? "text-white/80" : "text-[#4a5568]"}`}>({n})</span>
          </button>
        ))}
      </div>
      <ul className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
        {lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map((r) => {
          const largo = r.texto.length > 220 && !abiertas.includes(r.id);
          return (
            <li key={r.id} className="flex gap-4 rounded-xl border border-[#dde2e8] bg-white p-4">
              {r.fotos[0] && (
                <button
                  type="button"
                  onClick={() => {
                    setFoto({ src: r.fotos[0], nombre: r.nombre });
                    ventana.current?.showModal();
                  }}
                  aria-label={`Ver en grande la foto de ${r.nombre}`}
                  className="relative size-24 shrink-0 cursor-zoom-in overflow-hidden rounded-lg bg-[#f4f6f8]"
                >
                  <Image src={r.fotos[0]} alt="" fill sizes="96px" className="object-cover" />
                  {r.fotos.length > 1 && <span className="absolute right-1 bottom-1 rounded bg-[#0b2545]/85 px-1.5 text-[13px] font-bold text-white">+{r.fotos.length - 1}</span>}
                </button>
              )}
              <figure className="m-0 min-w-0">
                <span className="flex text-estrella" role="img" aria-label={`${r.estrellas} de 5 estrellas`}>
                  {Array.from({ length: r.estrellas }, (_, k) => (
                    <EstrellaD key={k} className="size-5" />
                  ))}
                </span>
                <blockquote className="m-0 mt-2 text-[17px] leading-[1.55] text-[#1f2a37]">«{largo ? `${r.texto.slice(0, 200).replace(/\s+\S*$/, "")}…` : r.texto}»</blockquote>
                {largo && (
                  <button type="button" onClick={() => setAbiertas((a) => [...a, r.id])} className="min-h-11 cursor-pointer text-[16px] font-semibold text-[#0b2545] underline underline-offset-2">
                    {textos.leer}
                  </button>
                )}
                <figcaption className="mt-1.5 text-[17px] font-bold text-[#0b2545]">{r.nombre}</figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      {paginas > 1 && (
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button type="button" disabled={pagina === 1} onClick={() => irA(pagina - 1)} className="min-h-14 cursor-pointer rounded-xl border-2 border-[#0b2545] bg-white px-2 text-[17px] font-bold whitespace-nowrap text-[#0b2545] disabled:cursor-not-allowed disabled:opacity-30">
            ← {textos.anterior}
          </button>
          <span className="text-center text-[17px] font-semibold whitespace-nowrap text-[#4a5568]" aria-live="polite">
            {textos.pagina.replace("{n}", String(pagina)).replace("{total}", String(paginas))}
          </span>
          <button type="button" disabled={pagina === paginas} onClick={() => irA(pagina + 1)} className="min-h-14 cursor-pointer rounded-xl bg-[#0b2545] px-2 text-[17px] font-bold whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-30">
            {textos.siguiente} →
          </button>
        </div>
      )}
      <dialog ref={ventana} aria-label={foto ? `Foto de ${foto.nombre}` : textos.cerrar} onClose={() => setFoto(null)} className="version m-auto w-[min(92vw,640px)] rounded-xl bg-white p-0 backdrop:bg-black/70">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="m-0 text-[17px] font-bold text-[#0b2545]">{foto?.nombre}</p>
          <button type="button" onClick={() => ventana.current?.close()} className="flex h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-[17px] font-semibold text-[#0b2545] hover:bg-[#f4f6f8]">
            <IconoTache className="size-6" />
            {textos.cerrar}
          </button>
        </div>
        {foto && (
          <div className="relative aspect-square w-full bg-[#f4f6f8]">
            <Image src={foto.src} alt={`Foto de ${foto.nombre}`} fill sizes="640px" className="object-contain" />
          </div>
        )}
      </dialog>
    </div>
  );
}
