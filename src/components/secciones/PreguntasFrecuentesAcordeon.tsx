"use client";

// Lista de preguntas que se abren y cierran (la usa PreguntasFrecuentes). La respuesta baja en 0.15 s y aparece
// desvanecida; la flecha da media vuelta. Al cerrar, la respuesta queda oculta también para el teclado.

import { useId, useState } from "react";

export type Pregunta = { id: string; pregunta: string; respuestaHtml: string };

function Flecha({ abierta }: { abierta: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`transition-transform duration-150 ${abierta ? "rotate-180" : ""}`}
    >
      <path d="m5.5 8.5 6.5 6.5 6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function Acordeon({
  preguntas,
  unaALaVez,
  primeraAbierta,
}: {
  preguntas: Pregunta[];
  unaALaVez: boolean;
  primeraAbierta: boolean;
}) {
  const base = useId();
  const [abiertas, setAbiertas] = useState<string[]>(primeraAbierta && preguntas[0] ? [preguntas[0].id] : []);

  const alternar = (id: string) =>
    setAbiertas((antes) =>
      antes.includes(id) ? antes.filter((x) => x !== id) : unaALaVez ? [id] : [...antes, id],
    );

  return (
    <div className="mx-auto flex w-full max-w-[650px] flex-col gap-3 md:gap-6">
      {preguntas.map((p) => {
        const abierta = abiertas.includes(p.id);
        const boton = `${base}-${p.id}-boton`;
        const panel = `${base}-${p.id}-panel`;
        return (
          <div key={p.id} className="rounded-2xl px-4 py-2">
            <button
              type="button"
              id={boton}
              aria-expanded={abierta}
              aria-controls={panel}
              onClick={() => alternar(p.id)}
              className="flex min-h-10 w-full cursor-pointer items-center gap-3 text-left text-base leading-5 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="min-w-0 flex-1">{p.pregunta}</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                <Flecha abierta={abierta} />
              </span>
            </button>
            <div
              id={panel}
              role="region"
              aria-labelledby={boton}
              className={`grid transition-all duration-150 ${
                abierta ? "visible mt-4 grid-rows-[1fr]" : "invisible mt-0 grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`texto-rico transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.3,1)] ${
                    abierta ? "opacity-100" : "opacity-0"
                  }`}
                  dangerouslySetInnerHTML={{ __html: p.respuestaHtml }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
