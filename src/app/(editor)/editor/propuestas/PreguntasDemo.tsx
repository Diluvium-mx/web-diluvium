"use client";

// 4 propuestas para la caja de preguntas al final de las preguntas frecuentes de B1-P6 (dueño, 21-nov-2026), al estilo
// del video que compartió (preguntas en tarjetas; la respuesta se va escribiendo y debajo sale la siguiente pregunta).
// Sin IA: contestan con el banco (las preguntas de la sección + preguntas-banco.ts; al construir, también la guía de
// Angela del CRM). Se pueden probar aquí escribiendo de verdad.

import { useEffect, useMemo, useRef, useState } from "react";
import { buscar, indexar, medidaEscrita, tamanoPara, type EntradaBanco, type TamanoBuscador } from "@/components/secciones/landing/buscarPregunta";

type Datos = { faqs: EntradaBanco[]; banco: EntradaBanco[]; tamanos: TamanoBuscador[] };

/** La respuesta se va escribiendo (rápido: menos de 1 s), como en el video. */
function Escribiendo({ texto }: { texto: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const paso = Math.max(2, Math.ceil(texto.length / 40));
    let actual = 0;
    const t = setInterval(() => {
      actual = Math.min(texto.length, actual + paso);
      setN(actual);
      if (actual >= texto.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [texto]);
  return <>{texto.slice(0, n)}</>;
}

/** Respuesta para lo que escribió: el tamaño si escribió una medida; si no, la mejor del banco. */
function responder(indice: ReturnType<typeof indexar>, tamanos: TamanoBuscador[], q: string): EntradaBanco | null {
  const cm = medidaEscrita(q);
  if (cm) {
    const m = tamanoPara(cm, tamanos);
    return {
      pregunta: `Para una entrada de ${cm} cm`,
      respuesta: "tamano" in m ? `Te queda la ${m.tamano.nombre} (${m.tamano.medidas}). Elígela arriba, en «Elige tu tamaño».` : m.fuera === "grande" ? "Es más ancha que los tamaños estándar: la hacemos a la medida." : "Es más angosta que el tamaño más chico: escríbenos por WhatsApp y vemos tu caso.",
    };
  }
  return buscar(indice, q)[0] ?? null;
}

const Chispa = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-boton" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  </svg>
);
const Flechita = ({ abierta }: { abierta: boolean }) => (
  <svg viewBox="0 0 24 24" className={`size-5 shrink-0 transition-transform ${abierta ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function SinRespuesta({ q }: { q: string }) {
  return (
    <a
      href={`https://api.whatsapp.com/send?phone=526682419579&text=${encodeURIComponent(`Hola, tengo una pregunta: ${q}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-[#e9f7ee] p-3.5 text-[15px] font-semibold text-[#14532d]"
    >
      Todavía no tenemos esa respuesta escrita. <span className="underline underline-offset-4">Mándanos tu pregunta por WhatsApp</span> y te contestamos.
    </a>
  );
}

function Caja({ alPreguntar, valor, setValor, placeholder = "Escribe aquí tu pregunta…" }: { alPreguntar: (q: string) => void; valor: string; setValor: (v: string) => void; placeholder?: string }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valor.trim().length >= 3) alPreguntar(valor.trim());
      }}
      className="flex gap-2"
    >
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="send"
        className="h-12 min-w-0 flex-1 rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] text-tinta placeholder:text-texto-suave focus:border-marino focus:outline-none"
      />
      <button type="submit" className="h-12 cursor-pointer rounded-xl bg-marino px-4 font-titulo text-[15px] font-bold text-white">
        Preguntar
      </button>
    </form>
  );
}

// ── 1 · Como el video: tarjetas; al abrir, la respuesta se escribe y debajo sale la siguiente pregunta ──
function Tarjeta({ e, siguiente, profundidad = 0 }: { e: EntradaBanco; siguiente: (e: EntradaBanco) => EntradaBanco | null; profundidad?: number }) {
  const [abierta, setAbierta] = useState(false);
  const otra = abierta && profundidad < 3 ? siguiente(e) : null;
  return (
    <div>
      <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(12,30,51,0.12),0_0_0_1px_rgba(12,30,51,0.06)]">
        <button type="button" onClick={() => setAbierta(!abierta)} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-3 text-left font-titulo text-[15.5px] leading-snug font-bold text-marino">
          <Chispa />
          <span className="flex-1">{e.pregunta}</span>
          <Flechita abierta={abierta} />
        </button>
        {abierta && (
          <p className="m-0 px-3.5 pb-3.5 text-[15px] leading-[1.55] text-tinta">
            <Escribiendo texto={e.respuesta} />
          </p>
        )}
      </div>
      {otra && (
        <div className="relative mt-2 ml-5 pl-4 before:absolute before:top-0 before:bottom-5 before:left-0 before:w-px before:bg-linea">
          <span className="absolute top-5 left-0 h-px w-3 bg-linea" />
          <Tarjeta e={otra} siguiente={siguiente} profundidad={profundidad + 1} />
        </div>
      )}
    </div>
  );
}

export function Preguntas1({ faqs, banco, tamanos }: Datos) {
  const indice = useMemo(() => indexar(banco), [banco]);
  const [hechas, setHechas] = useState<{ q: string; r: EntradaBanco | null }[]>([]);
  const [valor, setValor] = useState("");
  const siguiente = (e: EntradaBanco) => buscar(indice, e.pregunta).find((x) => x.pregunta !== e.pregunta) ?? null;
  return (
    <div className="grid gap-2.5">
      {faqs.map((e) => (
        <Tarjeta key={e.pregunta} e={e} siguiente={siguiente} />
      ))}
      {hechas.map((h, i) => (
        <div key={i} className="rounded-xl bg-white p-3.5 shadow-[0_1px_3px_rgba(12,30,51,0.12),0_0_0_1px_rgba(12,30,51,0.06)]">
          <p className="m-0 flex items-center gap-2 font-titulo text-[15.5px] font-bold text-marino">
            <Chispa />
            {h.q}
          </p>
          {h.r ? (
            <p className="m-0 mt-1.5 text-[15px] leading-[1.55] text-tinta">
              <Escribiendo texto={h.r.respuesta} />
            </p>
          ) : (
            <div className="mt-2">
              <SinRespuesta q={h.q} />
            </div>
          )}
        </div>
      ))}
      <Caja
        valor={valor}
        setValor={setValor}
        alPreguntar={(q) => {
          setHechas((x) => [...x, { q, r: responder(indice, tamanos, q) }]);
          setValor("");
        }}
      />
    </div>
  );
}

// ── 2 · Acordeón de siempre y la caja al final; la respuesta sale debajo con 2 preguntas relacionadas ──
export function Preguntas2({ faqs, banco, tamanos }: Datos) {
  const indice = useMemo(() => indexar(banco), [banco]);
  const [valor, setValor] = useState("");
  const [r, setR] = useState<{ q: string; e: EntradaBanco | null; mas: EntradaBanco[] } | null>(null);
  const preguntar = (q: string) => {
    const e = responder(indice, tamanos, q);
    setR({ q, e, mas: buscar(indice, q).filter((x) => x.pregunta !== e?.pregunta).slice(0, 2) });
  };
  return (
    <div>
      <div className="border-t border-linea">
        {faqs.map((e) => (
          <details key={e.pregunta} name="p2" className="group border-b border-linea">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 font-titulo text-[16.5px] leading-snug font-bold text-marino">
              {e.pregunta}
              <span className="text-[22px] leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="m-0 pb-4 text-[15px] leading-[1.55] text-tinta">{e.respuesta}</p>
          </details>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-niebla p-3.5">
        <p className="m-0 mb-2 font-titulo text-[16px] font-bold text-marino">¿Tienes otra pregunta?</p>
        <Caja valor={valor} setValor={setValor} alPreguntar={preguntar} />
        {r && (
          <div className="mt-3 grid gap-2">
            {r.e ? (
              <div className="rounded-xl bg-white p-3.5">
                <p className="m-0 font-titulo text-[15.5px] font-bold text-marino">{r.e.pregunta}</p>
                <p className="m-0 mt-1 text-[15px] leading-[1.55] text-tinta">{r.e.respuesta}</p>
              </div>
            ) : (
              <SinRespuesta q={r.q} />
            )}
            {r.mas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="w-full text-[13px] font-semibold text-texto-suave">También te puede servir:</span>
                {r.mas.map((m) => (
                  <button key={m.pregunta} type="button" onClick={() => setR({ q: m.pregunta, e: m, mas: [] })} className="cursor-pointer rounded-full border border-linea bg-white px-3 py-1.5 text-[13.5px] font-semibold text-marino">
                    {m.pregunta}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3 · Sugerencias mientras escribe: debajo de la caja salen las preguntas que se parecen; al tocar una, su respuesta ──
export function Preguntas3({ faqs, banco, tamanos }: Datos) {
  const indice = useMemo(() => indexar(banco), [banco]);
  const [valor, setValor] = useState("");
  const [elegida, setElegida] = useState<{ q: string; e: EntradaBanco | null } | null>(null);
  const sugerencias = valor.trim().length >= 3 && !elegida ? buscar(indice, valor) : [];
  const cm = valor.trim().length >= 2 && !elegida ? medidaEscrita(valor) : null;
  return (
    <div>
      <div className="border-t border-linea">
        {faqs.map((e) => (
          <details key={e.pregunta} name="p3" className="group border-b border-linea">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 font-titulo text-[16.5px] leading-snug font-bold text-marino">
              {e.pregunta}
              <span className="text-[22px] leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="m-0 pb-4 text-[15px] leading-[1.55] text-tinta">{e.respuesta}</p>
          </details>
        ))}
      </div>
      <div className="relative mt-5">
        <p className="m-0 mb-2 font-titulo text-[16px] font-bold text-marino">¿No está tu pregunta? Escríbela</p>
        <input
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setElegida(null);
          }}
          placeholder="Ej. ¿Llega a Monterrey?"
          className="h-12 w-full rounded-xl border-2 border-linea bg-white px-3.5 text-[16px] text-tinta placeholder:text-texto-suave focus:border-marino focus:outline-none"
        />
        {(sugerencias.length > 0 || cm) && (
          <ul className="m-0 mt-1 list-none overflow-hidden rounded-xl border border-linea bg-white p-0 shadow-lg">
            {cm && (
              <li>
                <button type="button" onClick={() => setElegida({ q: valor, e: responder(indice, tamanos, valor) })} className="block w-full cursor-pointer px-3.5 py-3 text-left text-[15px] font-semibold text-marino hover:bg-niebla">
                  📏 ¿Qué tamaño me queda con {cm} cm?
                </button>
              </li>
            )}
            {sugerencias.map((s) => (
              <li key={s.pregunta} className="border-t border-linea first:border-t-0">
                <button type="button" onClick={() => setElegida({ q: s.pregunta, e: s })} className="block w-full cursor-pointer px-3.5 py-3 text-left text-[15px] font-semibold text-marino hover:bg-niebla">
                  {s.pregunta}
                </button>
              </li>
            ))}
          </ul>
        )}
        {valor.trim().length >= 6 && !elegida && sugerencias.length === 0 && !cm && (
          <div className="mt-2">
            <SinRespuesta q={valor} />
          </div>
        )}
        {elegida?.e && (
          <div className="mt-3 rounded-xl bg-niebla p-3.5">
            <p className="m-0 font-titulo text-[15.5px] font-bold text-marino">{elegida.e.pregunta}</p>
            <p className="m-0 mt-1 text-[15px] leading-[1.55] text-tinta">
              <Escribiendo texto={elegida.e.respuesta} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 4 · Con temas: debajo de la caja, botones de tema (Precio, Envío…) que llenan la pregunta; y «¿Te sirvió?» ──
const TEMAS = [
  ["💲", "Precio", "¿Cuánto cuesta?"],
  ["🚚", "Envío", "¿Envían a mi ciudad?"],
  ["🔧", "Instalación", "¿Ustedes la instalan?"],
  ["📏", "Medidas", "¿Hacen compuertas más anchas?"],
  ["🛡️", "Garantía", "¿Qué garantía tiene?"],
  ["💳", "Pagos", "¿Puedo pagar a meses?"],
];
export function Preguntas4({ faqs, banco, tamanos }: Datos) {
  const indice = useMemo(() => indexar(banco), [banco]);
  const [valor, setValor] = useState("");
  const [r, setR] = useState<{ q: string; e: EntradaBanco | null } | null>(null);
  const [sirvio, setSirvio] = useState<boolean | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const preguntar = (q: string) => {
    setR({ q, e: responder(indice, tamanos, q) });
    setSirvio(null);
  };
  return (
    <div>
      <div className="border-t border-linea">
        {faqs.map((e) => (
          <details key={e.pregunta} name="p4" className="group border-b border-linea">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 font-titulo text-[16.5px] leading-snug font-bold text-marino">
              {e.pregunta}
              <span className="text-[22px] leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="m-0 pb-4 text-[15px] leading-[1.55] text-tinta">{e.respuesta}</p>
          </details>
        ))}
      </div>
      <div ref={caja} className="mt-5">
        <p className="m-0 mb-2 font-titulo text-[16px] font-bold text-marino">Pregúntanos lo que quieras</p>
        <Caja valor={valor} setValor={setValor} alPreguntar={preguntar} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TEMAS.map(([icono, tema, q]) => (
            <button
              key={tema}
              type="button"
              onClick={() => {
                setValor(q);
                preguntar(q);
              }}
              className="cursor-pointer rounded-full border border-linea bg-white px-3 py-1.5 text-[14px] font-semibold text-marino"
            >
              {icono} {tema}
            </button>
          ))}
        </div>
        {r && (
          <div className="mt-3 grid gap-2">
            {r.e ? (
              <div className="rounded-xl bg-niebla p-3.5">
                <p className="m-0 font-titulo text-[15.5px] font-bold text-marino">{r.e.pregunta}</p>
                <p className="m-0 mt-1 text-[15px] leading-[1.55] text-tinta">
                  <Escribiendo texto={r.e.respuesta} />
                </p>
                {sirvio === null ? (
                  <p className="m-0 mt-2.5 flex items-center gap-2 text-[14px] font-semibold text-texto-suave">
                    ¿Te sirvió?
                    <button type="button" onClick={() => setSirvio(true)} className="cursor-pointer rounded-full bg-white px-3 py-1 text-marino">
                      Sí
                    </button>
                    <button type="button" onClick={() => setSirvio(false)} className="cursor-pointer rounded-full bg-white px-3 py-1 text-marino">
                      No
                    </button>
                  </p>
                ) : sirvio ? (
                  <p className="m-0 mt-2.5 text-[14px] font-semibold text-[#13834a]">¡Gracias! 🙌</p>
                ) : (
                  <div className="mt-2.5">
                    <SinRespuesta q={r.q} />
                  </div>
                )}
              </div>
            ) : (
              <SinRespuesta q={r.q} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
