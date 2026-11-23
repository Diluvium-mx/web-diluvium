"use client";

// Preguntas frecuentes de B1-P6 en tarjetas (propuesta 1 que eligió el dueño, 21-nov-2026, al estilo del video que
// compartió): cada pregunta es una tarjeta; al abrirla, la respuesta se va escribiendo (menos de 1 s). Al final, una caja
// para escribir otra pregunta: se agrega como otra tarjeta con su respuesta, sin IA (buscarPregunta.ts con el banco:
// las de la sección + preguntas-banco.ts, que trae la guía de Angela del CRM). Si escribe una medida, contesta el
// tamaño. Si no hay respuesta escrita: «Mándanos tu pregunta por WhatsApp y te contestamos.» con su pregunta ya escrita.
// La respuesta completa siempre está en la página (para lectores de pantalla y Google); lo que se «escribe» es solo
// lo que se ve. A la medición solo llega que se usó, nunca lo que escribió.

import { useEffect, useMemo, useRef, useState } from "react";
import { buscar, indexar, medidaEscrita, tamanoPara, type EntradaBanco, type TamanoBuscador } from "./buscarPregunta";
import { IconoWhatsapp } from "./piezas";
import { formato } from "./formato";

function medir(nombre: string) {
  document.dispatchEvent(new CustomEvent("dlv-evento", { detail: nombre }));
}

/** La respuesta se va escribiendo, rápido (unas 40 vueltas), como en el video. */
function Escribiendo({ texto }: { texto: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const c = requestAnimationFrame(() => setN(texto.length));
      return () => cancelAnimationFrame(c);
    }
    const paso = Math.max(2, Math.ceil(texto.length / 40));
    let actual = 0;
    const t = setInterval(() => {
      actual = Math.min(texto.length, actual + paso);
      setN(actual);
      if (actual >= texto.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [texto]);
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">{texto.slice(0, n)}</span>
    </>
  );
}

const Chispa = () => (
  <svg viewBox="0 0 24 24" className="size-[18px] shrink-0 text-boton" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  </svg>
);

const SOMBRA = "shadow-[0_1px_3px_rgba(12,30,51,0.12),0_0_0_1px_rgba(12,30,51,0.07)]";

function Tarjeta({ e }: { e: EntradaBanco }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <details data-pieza={e.pieza} className={`group rounded-xl bg-white ${SOMBRA}`} onToggle={(ev) => setAbierta(ev.currentTarget.open)}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2.5 px-4 py-3 font-titulo text-[17px] leading-snug font-bold text-marino [&::-webkit-details-marker]:hidden">
        <Chispa />
        <span className="flex-1">{formato(e.pregunta)}</span>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="px-4 pb-4 text-[16px] leading-[1.6] text-tinta">
        {abierta ? <Escribiendo texto={e.respuesta} /> : <span className="sr-only">{e.respuesta}</span>}
        {e.enlace && (
          <a href={e.enlace.href} className="mt-1.5 flex min-h-10 items-center font-semibold text-marino underline decoration-2 underline-offset-4">
            {e.enlace.texto}
          </a>
        )}
      </div>
    </details>
  );
}

type Hecha = { id: number; q: string; r: EntradaBanco | null };

export function PreguntasTarjetas({
  faqs,
  banco,
  tamanos,
  whatsapp,
  enlaceMedida,
  titulo,
  placeholder = "Ej. ¿Llega a Monterrey?",
  textoBoton = "Preguntar",
  textoSinRespuesta = "Mándanos tu pregunta por WhatsApp y te contestamos.",
  ejemplos = [],
}: {
  faqs: EntradaBanco[];
  banco: EntradaBanco[];
  tamanos: TamanoBuscador[];
  /** Enlace de WhatsApp de la sección (de ahí sale el número). */
  whatsapp: string;
  enlaceMedida: string;
  /** Lo que dice arriba de la caja («¿No está tu pregunta? Escríbela aquí»). */
  titulo: string;
  placeholder?: string;
  textoBoton?: string;
  textoSinRespuesta?: string;
  /** Ejemplos que van cambiando dentro del campo (Producto 347): preguntas que no están en las de arriba. */
  ejemplos?: string[];
}) {
  const indice = useMemo(() => indexar(banco), [banco]);
  const [hechas, setHechas] = useState<Hecha[]>([]);
  const [valor, setValor] = useState("");
  const [enfocado, setEnfocado] = useState(false);
  const [ejemplo, setEjemplo] = useState(0);
  // Los ejemplos van cambiando mientras nadie escribe ni está en el campo.
  useEffect(() => {
    if (ejemplos.length < 2 || enfocado || valor) return;
    const t = setInterval(() => setEjemplo((i) => i + 1), 2000);
    return () => clearInterval(t);
  }, [ejemplos.length, enfocado, valor]);
  const contador = useRef(0);
  const telefono = whatsapp.match(/phone=(\d+)/)?.[1] ?? "526682419579";

  function responder(q: string): EntradaBanco | null {
    const cm = medidaEscrita(q);
    if (cm) {
      const m = tamanoPara(cm, tamanos);
      return {
        pregunta: q,
        respuesta:
          "tamano" in m
            ? `Para una entrada de ${cm} cm te queda la ${m.tamano.nombre} (${m.tamano.medidas}). Elígela arriba, en «Elige tu tamaño».`
            : m.fuera === "grande"
              ? `Una entrada de ${cm} cm es más ancha que los tamaños estándar: la hacemos a la medida.`
              : `Una entrada de ${cm} cm es más angosta que el tamaño más chico: escríbenos por WhatsApp y vemos tu caso.`,
        enlace: "fuera" in m && m.fuera === "grande" ? { texto: "Ver la compuerta hecha a la medida", href: enlaceMedida } : undefined,
      };
    }
    return buscar(indice, q)[0] ?? null;
  }

  function preguntar() {
    const q = valor.trim();
    if (q.length < 3) return;
    const r = responder(q);
    medir(r ? "escribe_pregunta" : "pregunta_sin_respuesta");
    setHechas((x) => [...x, { id: ++contador.current, q, r }]);
    setValor("");
  }

  return (
    <div className="grid gap-2.5">
      {faqs.map((e) => (
        <Tarjeta key={e.pregunta} e={e} />
      ))}

      {hechas.map((h) => (
        <div key={h.id} className={`rounded-xl bg-white px-4 py-3.5 ${SOMBRA}`}>
          <p className="m-0 flex items-start gap-2.5 font-titulo text-[17px] leading-snug font-bold text-marino">
            <Chispa />
            <span className="flex-1 break-words">{h.q}</span>
          </p>
          <div className="mt-1.5 text-[16px] leading-[1.6] text-tinta">
            {h.r ? (
              <>
                {h.r.pregunta !== h.q && <p className="m-0 mb-1 text-[14px] font-semibold text-texto-suave">{h.r.pregunta}</p>}
                <Escribiendo texto={h.r.respuesta} />
                {h.r.enlace && (
                  <a href={h.r.enlace.href} className="mt-1.5 flex min-h-10 items-center font-semibold text-marino underline decoration-2 underline-offset-4">
                    {h.r.enlace.texto}
                  </a>
                )}
              </>
            ) : (
              <a
                href={`https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(`Hola, tengo una pregunta: ${h.q}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-evento="toca_whatsapp"
                className="inline font-semibold text-[#14532d] underline decoration-2 underline-offset-4"
              >
                {textoSinRespuesta}
                <IconoWhatsapp className="ml-1.5 inline size-5 align-[-4px] text-[#1a7f37]" />
              </a>
            )}
          </div>
        </div>
      ))}

      <form
        className="mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          preguntar();
        }}
      >
        <label htmlFor="pregunta-libre" className="mb-2 block font-titulo text-[17px] leading-snug font-bold text-marino">
          {formato(titulo)}
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              id="pregunta-libre"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onFocus={() => setEnfocado(true)}
              onBlur={() => setEnfocado(false)}
              maxLength={200}
              enterKeyHint="send"
              autoComplete="off"
              placeholder={ejemplos.length ? "" : placeholder}
              aria-describedby={ejemplos.length ? "pregunta-libre-ejemplos" : undefined}
              className="h-13 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[17px] text-tinta placeholder:text-[15.5px] placeholder:text-texto-suave focus:border-marino focus:outline-none"
            />
            {ejemplos.length > 0 && (
              <span id="pregunta-libre-ejemplos" className="sr-only">
                Por ejemplo: {ejemplos.join(", ")}
              </span>
            )}
            {ejemplos.length > 0 && !valor && (
              // Ejemplo que cambia cada 2 s (entra deslizándose); se queda quieto mientras la persona está en el campo.
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3.5 left-[16px] flex items-center overflow-hidden text-[15.5px] text-texto-suave">
                <span key={ejemplo} className="animate-[ejemplo-entra_450ms_ease-out] truncate motion-reduce:animate-none">
                  Ej. {ejemplos[ejemplo % ejemplos.length]}
                </span>
              </span>
            )}
          </div>
          <button type="submit" className="h-13 shrink-0 cursor-pointer rounded-xl bg-marino px-4 font-titulo text-[16px] font-bold text-white">
            {textoBoton}
          </button>
        </div>
      </form>
    </div>
  );
}
