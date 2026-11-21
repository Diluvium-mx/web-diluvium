"use client";

// «¿No está tu pregunta? Escríbela aquí» (B1-P6, 21-nov-2026, dueño): el cliente escribe su pregunta y la respuesta
// aparece ahí mismo mientras escribe, sin IA (buscarPregunta.ts: banco de respuestas ya escritas + temas + medida).
// Si ninguna respuesta se parece, no inventa: ofrece mandar esa misma pregunta por WhatsApp, ya escrita, y una persona
// la contesta. A la medición solo llega que se usó (nunca lo que escribió).

import { useEffect, useMemo, useRef, useState } from "react";
import { buscar, indexar, medidaEscrita, tamanoPara, type EntradaBanco, type TamanoBuscador } from "./buscarPregunta";
import { IconoWhatsapp } from "./piezas";

function medir(nombre: string) {
  document.dispatchEvent(new CustomEvent("dlv-evento", { detail: nombre }));
}

export function PreguntaLibre({
  titulo,
  banco,
  tamanos,
  whatsapp,
  enlaceMedida,
}: {
  titulo: string;
  banco: EntradaBanco[];
  tamanos: TamanoBuscador[];
  /** Número de WhatsApp en formato https://api.whatsapp.com/send?phone=… (se le pone la pregunta). */
  whatsapp: string;
  enlaceMedida: string;
}) {
  const [texto, setTexto] = useState("");
  const indice = useMemo(() => indexar(banco), [banco]);
  const avisado = useRef({ usa: false, sin: false });
  const limpio = texto.trim();

  const cm = limpio.length >= 2 ? medidaEscrita(limpio) : null;
  const medida = cm ? tamanoPara(cm, tamanos) : null;
  // Con una medida, su tamaño ya es la respuesta: a lo más otra respuesta debajo.
  const resultados = limpio.length >= 3 ? buscar(indice, limpio).slice(0, medida ? 1 : 3) : [];
  const sinRespuesta = limpio.length >= 6 && !medida && resultados.length === 0;

  const telefono = whatsapp.match(/phone=(\d+)/)?.[1] ?? "";
  const aWhatsapp = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(`Hola, tengo una pregunta: ${limpio}`)}`;

  function cambiar(v: string) {
    setTexto(v);
    if (!avisado.current.usa && v.trim().length >= 3) {
      avisado.current.usa = true;
      medir("escribe_pregunta");
    }
  }
  useEffect(() => {
    if (sinRespuesta && !avisado.current.sin) {
      avisado.current.sin = true;
      medir("pregunta_sin_respuesta");
    }
  }, [sinRespuesta]);

  return (
    <div className="mb-6 rounded-2xl bg-niebla p-4 md:p-5">
      <label htmlFor="pregunta-libre" className="block font-titulo text-[18px] leading-snug font-bold text-marino">
        {titulo}
      </label>
      <div className="relative mt-2.5">
        <input
          id="pregunta-libre"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={texto}
          maxLength={200}
          onChange={(e) => cambiar(e.target.value)}
          placeholder="Ej. ¿Llega a Monterrey? · Mi puerta mide 95 cm"
          aria-describedby="pregunta-libre-respuestas"
          className="h-13 w-full rounded-xl border-2 border-linea bg-white pr-3 pl-11 text-[17px] text-tinta placeholder:text-[15px] placeholder:text-texto-suave focus:border-marino focus:outline-none"
        />
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-texto-suave" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </div>

      <div id="pregunta-libre-respuestas" aria-live="polite" className="grid gap-2.5 [&:not(:empty)]:mt-3">
        {medida && cm && (
          <div className="rounded-xl bg-white p-4 shadow-[inset_0_0_0_1.5px_var(--color-linea)]">
            <p className="m-0 font-titulo text-[16px] font-bold text-marino">Para una entrada de {cm} cm</p>
            <p className="m-0 mt-1 text-[16px] leading-[1.55] text-tinta">
              {"tamano" in medida ? (
                <>
                  Te queda la <strong>{medida.tamano.nombre}</strong> ({medida.tamano.medidas}). Elígela arriba, en «Elige tu tamaño».
                </>
              ) : medida.fuera === "grande" ? (
                <>
                  Tu entrada es más ancha que los tamaños estándar:{" "}
                  <a href={enlaceMedida} className="font-semibold text-marino underline decoration-2 underline-offset-4">
                    la hacemos a la medida
                  </a>
                  .
                </>
              ) : (
                <>Tu entrada es más angosta que el tamaño más chico. Escríbenos por WhatsApp y vemos tu caso.</>
              )}
            </p>
          </div>
        )}
        {resultados.map((r) => (
          <div key={r.pregunta} className="rounded-xl bg-white p-4 shadow-[inset_0_0_0_1.5px_var(--color-linea)]">
            <p className="m-0 font-titulo text-[16px] font-bold text-marino">{r.pregunta}</p>
            <p className="m-0 mt-1 text-[16px] leading-[1.55] text-tinta">{r.respuesta}</p>
            {r.enlace && (
              <a href={r.enlace.href} className="mt-1.5 inline-flex min-h-10 items-center font-semibold text-marino underline decoration-2 underline-offset-4">
                {r.enlace.texto}
              </a>
            )}
          </div>
        ))}
        {(sinRespuesta || resultados.length > 0 || medida) && (
          <a
            href={aWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-evento="toca_whatsapp"
            className={`flex items-center gap-3 rounded-xl p-4 text-[16px] leading-snug font-semibold ${sinRespuesta ? "bg-[#e9f7ee] text-[#14532d] shadow-[inset_0_0_0_1.5px_#9fd8b4]" : "text-marino"}`}
          >
            <IconoWhatsapp className="size-6 shrink-0 text-[#1a7f37]" />
            <span>
              {sinRespuesta ? (
                <>
                  No tenemos esa respuesta escrita todavía. <span className="underline decoration-2 underline-offset-4">Mándanos tu pregunta por WhatsApp</span> y te contestamos.
                </>
              ) : (
                <span className="underline decoration-2 underline-offset-4">¿No es lo que buscabas? Pregúntanos por WhatsApp</span>
              )}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
