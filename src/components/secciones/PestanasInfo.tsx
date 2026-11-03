"use client";

// Pestañas de información («Protege tu hogar en 3 pasos») (sección «info-tab»). Cada paso tiene foto, título y
// texto. Cambian solas cada «auto_play_time» segundos (el anillo del número se va llenando) mientras la sección
// está en pantalla; al tocar un paso se muestra ese y el conteo vuelve a empezar.
// Celular y tableta: foto arriba, botones 1-2-3 y el paso elegido abajo. Computadora: foto a la izquierda y la
// lista de pasos a la derecha.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { TextoRico, Titulo } from "@/components/comunes/Texto";
import type { Producto } from "@/components/producto/catalogo";
import { clasesAire } from "./aire";

/** Número dentro de un círculo; el círculo de encima se dibuja poco a poco mientras el paso está activo. */
function Anillo({ numero: n, activo, corriendo, segundos, vuelta }: { numero: number; activo: boolean; corriendo: boolean; segundos: number; vuelta: number }) {
  const anillos = [
    { tam: 40, clase: "min-[1025px]:hidden" },
    { tam: 44, clase: "hidden min-[1025px]:block" },
  ];
  return (
    <>
      {anillos.map(({ tam, clase }) => {
        const r = tam / 2;
        const largo = 2 * Math.PI * r;
        return (
          <svg key={tam} className={`h-full w-full overflow-visible ${clase}`} viewBox={`0 0 ${tam} ${tam}`} aria-hidden="true">
            <circle cx={r} cy={r} r={r} fill="none" strokeWidth={2} stroke="rgb(10 85 154 / 0.12)" />
            {activo && (
              <circle
                key={vuelta}
                cx={r}
                cy={r}
                r={r}
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                className="pasos-progreso"
                style={{
                  strokeDasharray: largo,
                  strokeDashoffset: largo,
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                  animation: corriendo ? `pasos-llenar ${segundos}s linear forwards` : "none",
                  ["--largo" as string]: `${largo}px`,
                }}
              />
            )}
          </svg>
        );
      })}
      <span className="absolute z-[1]">{n}</span>
    </>
  );
}

export function PestanasInfo({ seccion, producto }: { seccion: Seccion; producto?: Producto }) {
  const pasos = seccion.bloques;
  const automatico = siNo(seccion.ajustes, "enable_autoplay");
  const segundos = numero(seccion.ajustes, "auto_play_time", 7);
  const [activo, setActivo] = useState(0);
  const [enPantalla, setEnPantalla] = useState(false);
  // Sube cada vez que se elige un paso, para reiniciar la animación del anillo.
  const [vuelta, setVuelta] = useState(0);
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !automatico) return;
    // El conteo corre solo mientras la sección se ve; al volver a entrar empieza de nuevo.
    const observador = new IntersectionObserver(([e]) => {
      setEnPantalla(e.isIntersecting);
      if (e.isIntersecting) setVuelta((v) => v + 1);
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, [automatico]);

  useEffect(() => {
    if (!automatico || !enPantalla || pasos.length < 2) return;
    const t = window.setTimeout(() => {
      setActivo((a) => (a + 1) % pasos.length);
      setVuelta((v) => v + 1);
    }, segundos * 1000);
    return () => window.clearTimeout(t);
  }, [automatico, enPantalla, activo, vuelta, segundos, pasos.length]);

  const elegir = useCallback((i: number) => {
    setActivo(i);
    setVuelta((v) => v + 1);
  }, []);

  const corriendo = automatico && enPantalla;
  const idBase = `pasos-${seccion.id}`;

  return (
    <section ref={raiz} className={`pasos ${esquema(seccion.ajustes)}`} data-seccion="info-tab" aria-labelledby={`${idBase}-titulo`}>
      <style>{`
        @keyframes pasos-llenar { to { stroke-dashoffset: 0; } }
        .pasos .pasos-foto { transition: opacity 0.3s ease; }
        .pasos .pasos-texto { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.2s cubic-bezier(0.5, 0, 0.1, 1); }
        .pasos .pasos-texto > div { overflow: hidden; min-height: 0; }
        .pasos .pasos-texto[data-abierto="false"] > div { padding-top: 0; }
        .pasos .pasos-texto p { opacity: 0; transform: translateY(-24px); transition: opacity 0.2s cubic-bezier(0.5, 0, 0.1, 1) 0.1s, transform 0.2s cubic-bezier(0.5, 0, 0.1, 1) 0.1s; }
        .pasos .pasos-texto[data-abierto="true"] { grid-template-rows: 1fr; }
        .pasos .pasos-texto[data-abierto="true"] p { opacity: 1; transform: none; }
        .pasos .texto-rico a { text-decoration: none; }
        @media (prefers-reduced-motion: reduce) {
          .pasos .pasos-progreso { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
      <div className={`contenedor grid gap-[var(--hueco)] ${clasesAire(seccion, producto)}`}>
        <div className="flex flex-col items-center text-center">
          <Titulo texto={texto(seccion.ajustes, "heading")} className="max-w-[1280px] break-words" />
        </div>

        <div className="flex flex-col-reverse gap-[var(--hueco)] min-[1025px]:flex-row-reverse min-[1025px]:gap-[2vw]">
          {/* Pasos */}
          <div className="flex flex-col min-[1025px]:max-w-[50%] min-[1025px]:flex-1">
            {/* Botones 1-2-3 (celular y tableta) */}
            <div className="mb-4 flex gap-2 md:mb-6 md:gap-3 min-[1025px]:hidden" role="tablist" aria-label="Pasos">
              {pasos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  id={`${idBase}-boton-${i}`}
                  aria-selected={i === activo}
                  aria-controls={`${idBase}-paso-${i}`}
                  onClick={() => elegir(i)}
                  className="relative z-[1] flex h-10 w-10 cursor-pointer items-center justify-center bg-white font-titulo font-medium leading-[normal] text-azul"
                >
                  <Anillo numero={i + 1} activo={i === activo} corriendo={corriendo} segundos={segundos} vuelta={vuelta} />
                </button>
              ))}
            </div>

            <div className="relative flex flex-col min-[1025px]:gap-8">
              {pasos.map((p, i) => {
                const abierto = i === activo;
                return (
                  <div key={p.id} id={`${idBase}-paso-${i}`} className={abierto ? "" : "hidden min-[1025px]:block"}>
                    {/* Celular y tableta: solo el título del paso elegido */}
                    <h3 className="m-0 text-left font-titulo !text-base font-medium !leading-5 text-azul min-[1025px]:hidden">
                      {texto(p.ajustes, "heading")}
                    </h3>
                    {/* Computadora: cada paso es un botón con su número */}
                    <button
                      type="button"
                      aria-expanded={abierto}
                      aria-controls={`${idBase}-texto-${i}`}
                      onClick={() => elegir(i)}
                      className={`hidden w-full cursor-pointer items-center gap-6 bg-transparent p-0 text-center leading-[normal] transition-colors duration-[400ms] min-[1025px]:flex ${abierto ? "text-azul" : "text-azul/60"}`}
                    >
                      <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center bg-white font-titulo font-medium text-azul">
                        <Anillo numero={i + 1} activo={abierto} corriendo={corriendo} segundos={segundos} vuelta={vuelta} />
                      </span>
                      <span className="flex-1 break-words text-left font-titulo text-base font-medium leading-5">
                        {texto(p.ajustes, "heading")}
                      </span>
                    </button>
                    <div id={`${idBase}-texto-${i}`} className="pasos-texto min-[1025px]:pl-16" data-abierto={abierto}>
                      <div className="pt-2 md:pt-3 min-[1025px]:pt-4">
                        <TextoRico html={texto(p.ajustes, "description")} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fotos: una encima de otra; se ve la del paso elegido */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:rounded-3xl min-[1025px]:flex-1 min-[1025px]:rounded-[32px]">
            {pasos.map((p, i) => {
              const foto = texto(p.ajustes, "image");
              if (!foto) return null;
              return (
                <Image
                  key={p.id}
                  src={foto}
                  alt={texto(p.ajustes, "heading")}
                  fill
                  sizes="(min-width: 1025px) 50vw, 100vw"
                  className={`pasos-foto object-cover ${i === activo ? "opacity-100" : "opacity-0"}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
