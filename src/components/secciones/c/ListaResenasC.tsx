"use client";

// Reseñas de C por tema (25-nov-2026, propuesta R2): botones grandes con cada tema y cuántas reseñas lo dicen, y la lista
// de reseñas (con su foto, estrellas, el texto en letra grande y el nombre), 5 al abrir y de 10 en 10 con «Ver 10 reseñas
// más». Nada se mueve solo ni hay que deslizar.

import Image from "next/image";
import { useState } from "react";
import { EstrellaC } from "./comun";

type R = { id: string; nombre: string; texto: string; estrellas: number; foto: string; temas: string[] };
type Textos = { temas: string; todas: string; verMas: string; faltan: string; leer: string };

const AL_ABRIR = 5;
const DE_A = 10;

export function ListaResenasC({ resenas, temas, textos }: { resenas: R[]; temas: { id: string; nombre: string }[]; textos: Textos }) {
  const [tema, setTema] = useState<string | null>(null);
  const [cuantas, setCuantas] = useState(AL_ABRIR);
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const lista = tema ? resenas.filter((r) => r.temas.includes(tema)) : resenas;
  const elegir = (t: string | null) => {
    setTema(t);
    setCuantas(AL_ABRIR);
  };
  const chip = (activo: boolean) =>
    `min-h-12 cursor-pointer rounded-full border-2 px-4 text-[16.5px] font-bold transition-colors ${activo ? "border-[#06182f] bg-[#06182f] text-white" : "border-[#c9d9ea] bg-white text-[#06182f] hover:border-[#06182f]"}`;
  return (
    <div>
      {temas.length > 0 && (
        <>
          <p className="m-0 font-titulo text-[18px] font-medium text-[#06182f]">{textos.temas}</p>
          <div className="mt-3 flex flex-wrap gap-2.5" role="group" aria-label={textos.temas}>
            <button type="button" aria-pressed={!tema} onClick={() => elegir(null)} className={chip(!tema)}>
              {textos.todas} ({resenas.length})
            </button>
            {temas.map((t) => {
              const n = resenas.filter((r) => r.temas.includes(t.id)).length;
              return n ? (
                <button key={t.id} type="button" aria-pressed={tema === t.id} onClick={() => elegir(t.id)} className={chip(tema === t.id)}>
                  {t.nombre} ({n})
                </button>
              ) : null;
            })}
          </div>
        </>
      )}
      <ul className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {lista.slice(0, cuantas).map((r) => {
          const largo = r.texto.length > 260 && !abiertas.includes(r.id);
          return (
            <li key={r.id} className="flex flex-col overflow-hidden rounded-3xl border-2 border-[#dbe7f3] bg-white">
              {r.foto && (
                <div className="relative aspect-[4/3] bg-[#f3f8fd]">
                  <Image src={r.foto} alt={`Compuerta de ${r.nombre} puesta en su entrada`} fill sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 32px)" className="object-cover" />
                </div>
              )}
              <figure className="m-0 p-5">
                <span className="flex text-estrella" role="img" aria-label={`${r.estrellas} de 5 estrellas`}>
                  {Array.from({ length: r.estrellas }, (_, k) => (
                    <EstrellaC key={k} className="size-6" />
                  ))}
                </span>
                <blockquote className="m-0 mt-3 text-[18px] leading-[1.6] text-[#1f2d3d]">«{largo ? `${r.texto.slice(0, 240).replace(/\s+\S*$/, "")}…` : r.texto}»</blockquote>
                {largo && (
                  <button type="button" onClick={() => setAbiertas((a) => [...a, r.id])} className="mt-1 min-h-11 cursor-pointer text-[17px] font-semibold text-[#1663a8] underline underline-offset-2">
                    {textos.leer}
                  </button>
                )}
                <figcaption className="mt-3 text-[18px] font-bold text-[#06182f]">{r.nombre}</figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      {cuantas < lista.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setCuantas((c) => c + DE_A)}
            data-evento="ver_mas_resenas"
            className="inline-flex min-h-[60px] w-full cursor-pointer flex-wrap items-center justify-center gap-x-2 rounded-2xl border-[2.5px] border-[#06182f] bg-white px-7 font-titulo text-[18px] font-medium text-[#06182f] hover:bg-[#06182f] hover:text-white sm:w-auto"
          >
            {textos.verMas}
            <span className="text-[16px] font-normal">({textos.faltan.replace("{n}", String(lista.length - cuantas))})</span>
          </button>
        </div>
      )}
    </div>
  );
}
