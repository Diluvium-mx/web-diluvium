"use client";

// Reseñas de clientes que corren solas de derecha a izquierda (sección «customer-reviews»). Velocidad en píxeles
// por segundo, como el ajuste «speed» del tema. Cada tarjeta mide: celular el ancho del contenedor, tableta media
// pantalla y computadora un tercio del contenedor.

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Seccion } from "@/lib/contenido";
import { esquema, numero, siNo, texto } from "@/lib/contenido";
import { TextoRico } from "@/components/comunes/Texto";

// El sitio repite las tarjetas 4 veces en cada pista para que no se vea el corte en pantallas anchas.
const REPETICIONES = 4;

function Estrella({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 20" width={20} height={20} aria-hidden="true" focusable="false" fill={color}>
      <path d="m10 1.9 2.5 5.2 5.7.7-4.2 3.9 1.1 5.7-5.1-2.8-5.1 2.8 1.1-5.7-4.2-3.9 5.7-.7L10 1.9Z" />
    </svg>
  );
}

export function ResenasClientes({ seccion }: { seccion: Seccion }) {
  const pista = useRef<HTMLDivElement>(null);
  const velocidad = numero(seccion.ajustes, "speed", 100);
  const conEstrellas = siNo(seccion.ajustes, "show_rating");
  const colorEstrella = texto(seccion.ajustes, "color_star") || "#f8cc46";
  const reversa = texto(seccion.ajustes, "moving_direction") === "animation-direction-reverse";

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const ajustar = () => {
      const ancho = el.firstElementChild?.getBoundingClientRect().width ?? 0;
      if (ancho > 0) el.style.setProperty("--duracion", `${ancho / velocidad}s`);
    };
    ajustar();
    const observador = new ResizeObserver(ajustar);
    observador.observe(el);
    return () => observador.disconnect();
  }, [velocidad]);

  const tarjetas = (copia: number) =>
    Array.from({ length: REPETICIONES }, (_, r) =>
      seccion.bloques.map((b) => {
        const foto = texto(b.ajustes, "avatar");
        const calificacion = Math.max(0, Math.min(5, numero(b.ajustes, "star", 5)));
        return (
          <div
            key={`${r}-${b.id}`}
            className="resena-tarjeta shrink-0 px-[1.8vw] md:px-3 min-[1025px]:px-[1vw]"
            aria-hidden={copia > 0 || r > 0}
          >
            <div className="flex flex-col py-4 min-[1025px]:gap-6 min-[1025px]:py-6">
              <div className="flex items-center gap-2 md:gap-3 min-[1025px]:gap-4">
                {foto && (
                  <Image
                    src={foto}
                    alt={texto(b.ajustes, "author")}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 flex-1 break-words">
                  <span className="mb-1 block font-bold">{texto(b.ajustes, "author")}</span>
                  <span className="text-[13.6px] leading-[17px]">{texto(b.ajustes, "author_title")}</span>
                </div>
              </div>
              <div className="flex flex-col">
                {conEstrellas && (
                  <div className="mb-3 flex" role="img" aria-label={`${calificacion} de 5 estrellas`}>
                    {Array.from({ length: calificacion }, (_, i) => (
                      <Estrella key={i} color={colorEstrella} />
                    ))}
                  </div>
                )}
                <TextoRico
                  html={texto(b.ajustes, "description")}
                  className="break-words font-titulo font-medium [&_p]:m-0"
                />
              </div>
            </div>
          </div>
        );
      }),
    );

  return (
    <div
      className={`resenas-clientes ${esquema(seccion.ajustes, "scheme-2")} overflow-hidden`}
      data-seccion="customer-reviews"
    >
      <style>{`
        .resenas-clientes .resena-tarjeta { width: 100cqw; }
        @media (min-width: 768px) { .resenas-clientes .resena-tarjeta { width: 50vw; } }
        @media (min-width: 1025px) { .resenas-clientes .resena-tarjeta { width: calc(100cqw / 3); } }
        .resenas-clientes .resenas-pista { animation: correr var(--duracion, 68s) linear infinite; }
        .resenas-clientes .resenas-pista.reversa { animation-direction: reverse; }
        @media (prefers-reduced-motion: reduce) { .resenas-clientes .resenas-pista { animation: none; } }
      `}</style>
      <div className="contenedor pb-[var(--aire)]">
        <div className="flex w-full [container-type:inline-size]">
          <div ref={pista} className="flex w-max">
            {[0, 1].map((copia) => (
              <div key={copia} className={`resenas-pista flex shrink-0 ${reversa ? "reversa" : ""}`}>
                {tarjetas(copia)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
