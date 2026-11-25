"use client";

// Reseñas de C en lista (25-nov-2026, para 40-60 años; reemplaza la pila que se deslizaba): tres reseñas grandes, una
// abajo de otra, con su foto, estrellas, el texto completo en letra grande y el nombre. «Ver 3 reseñas más» agrega
// otras tres; nada se mueve solo ni hay que deslizar.

import Image from "next/image";
import { useState } from "react";
import { EstrellaC } from "./comun";

type R = { id: string; nombre: string; texto: string; estrellas: number; foto: string };

const DE_A = 3;

export function ListaResenasC({ resenas, textos }: { resenas: R[]; textos: { verMas: string; leer: string } }) {
  const [cuantas, setCuantas] = useState(DE_A);
  const [abiertas, setAbiertas] = useState<string[]>([]);
  return (
    <div>
      <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
        {resenas.slice(0, cuantas).map((r) => {
          const largo = r.texto.length > 260 && !abiertas.includes(r.id);
          return (
            <li key={r.id} className="overflow-hidden rounded-3xl border-2 border-[#dbe7f3] bg-white">
              <div className="relative aspect-[4/3] bg-[#f3f8fd]">
                <Image src={r.foto} alt={`Compuerta de ${r.nombre} puesta en su entrada`} fill sizes="(min-width: 768px) 400px, calc(100vw - 32px)" className="object-cover" />
              </div>
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
      {cuantas < resenas.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setCuantas((c) => c + DE_A)}
            data-evento="ver_mas_resenas"
            className="inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center rounded-2xl border-[2.5px] border-[#06182f] bg-white px-7 font-titulo text-[18px] font-medium text-[#06182f] hover:bg-[#06182f] hover:text-white sm:w-auto"
          >
            {textos.verMas}
          </button>
        </div>
      )}
    </div>
  );
}
