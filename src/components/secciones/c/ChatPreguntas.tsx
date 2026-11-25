"use client";

import { useEffect, useRef, useState } from "react";
import { IconoWhatsapp } from "../landing/piezas";

type P = { id: string; pregunta: string; respuesta: string };

export function ChatPreguntas({ preguntas, whatsapp, textos }: { preguntas: P[]; whatsapp: string; textos: { diluvium: string; otra: string; elige: string } }) {
  // La conversación empieza con la primera pregunta ya contestada, para que se entienda cómo funciona.
  const [hechas, setHechas] = useState<string[]>(preguntas[0] ? [preguntas[0].id] : []);
  const [escribiendo, setEscribiendo] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  const preguntar = (id: string) => {
    if (escribiendo) return;
    setHechas((h) => [...h.filter((x) => x !== id), id]);
    setEscribiendo(id);
  };
  useEffect(() => {
    if (!escribiendo) return;
    const t = setTimeout(() => setEscribiendo(null), 700);
    return () => clearTimeout(t);
  }, [escribiendo]);
  useEffect(() => {
    if (hechas.length > 1) fin.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [hechas, escribiendo]);

  const pendientes = preguntas.filter((p) => !hechas.includes(p.id));
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#eef5fc] ring-1 ring-[#d8ecfd]">
      <div className="flex items-center gap-3 bg-[#06182f] px-4 py-3 text-white">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#3fa9f5] font-titulo text-[17px] font-semibold">D</span>
        <div>
          <p className="m-0 font-titulo text-[16px] font-medium">{textos.diluvium}</p>
          <p className="m-0 flex items-center gap-1.5 text-[12.5px] text-white/70">
            <span className="size-2 rounded-full bg-[#4ade80]" /> Responde al momento
          </p>
        </div>
      </div>
      <div className="grid max-h-[460px] gap-3 overflow-y-auto p-4" aria-live="polite">
        {hechas.map((id) => {
          const p = preguntas.find((x) => x.id === id);
          if (!p) return null;
          return (
            <div key={id} className="grid gap-2" data-pieza={id}>
              <p className="m-0 max-w-[85%] justify-self-end rounded-[20px] rounded-br-md bg-[#3fa9f5] px-4 py-2.5 text-[15.5px] font-semibold text-white">{p.pregunta}</p>
              {escribiendo === id ? (
                <p className="m-0 flex w-16 justify-center gap-1 justify-self-start rounded-[20px] rounded-bl-md bg-white px-4 py-3.5" aria-label="Escribiendo">
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="size-2 animate-bounce rounded-full bg-texto-suave" style={{ animationDelay: `${k * 120}ms` }} />
                  ))}
                </p>
              ) : (
                <p className="m-0 max-w-[88%] justify-self-start rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-[15.5px] leading-[1.5] whitespace-pre-line text-tinta shadow-sm">{p.respuesta}</p>
              )}
            </div>
          );
        })}
        <div ref={fin} />
      </div>
      <div className="border-t border-[#d8ecfd] bg-white p-4">
        {pendientes.length > 0 && (
          <>
            <p className="m-0 mb-2 text-[13.5px] font-semibold text-texto-suave">{textos.elige}</p>
            <div className="flex flex-wrap gap-2">
              {pendientes.map((p) => (
                <button key={p.id} type="button" onClick={() => preguntar(p.id)} className="min-h-10 cursor-pointer rounded-full border-2 border-[#3fa9f5] px-3.5 text-left text-[14.5px] font-semibold text-[#1b5f99] hover:bg-[#d8ecfd]">
                  {p.pregunta}
                </button>
              ))}
            </div>
          </>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-evento="toca_whatsapp" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-[#06182f] underline underline-offset-4">
            <IconoWhatsapp className="size-5 text-[#1a7f37]" />
            {textos.otra}
          </a>
        )}
      </div>
    </div>
  );
}
