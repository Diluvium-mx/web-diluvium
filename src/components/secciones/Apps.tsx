// Bloque de app de la portada (sección «apps»). En Shopify es el carrusel de reseñas de Trustoo; aquí se rehace
// con las reseñas publicadas (contenido/resenas.json, sacado por herramientas/extraer-resenas-blog.py): el resumen
// «4.9 estrellas basadas en 238 reseñas» y dos filas de tarjetas que corren solas hacia la izquierda a la misma
// velocidad que en el sitio (una tarjeta cada 5 segundos). La segunda fila va recorrida 200px.

import Image from "next/image";
import resenas from "@contenido/resenas.json";
import type { Seccion } from "@/lib/contenido";
import { esquema } from "@/lib/contenido";

type Resena = { nombre: string; calificacion: number; texto: string; fotos: string[] };

const CARRUSEL = resenas.carrusel;
const FILAS: Resena[][] = CARRUSEL.filas;
// Cada tarjeta mide 452px más 32px de separación y avanza 484px cada 5 s.
const PASO = 484;
const SEGUNDOS_POR_TARJETA = 5;

function Estrella() {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" focusable="false" className="mr-[2px] shrink-0" fill="#ff9900">
      <path d="m8 .6 2.26 4.9 5.34.64-3.95 3.66 1.05 5.29L8 12.45 3.3 15.09l1.05-5.29L.4 6.14l5.34-.64L8 .6Z" />
    </svg>
  );
}

function Tarjeta({ resena, oculta }: { resena: Resena; oculta: boolean }) {
  const foto = resena.fotos[0];
  const estrellas = Math.max(0, Math.min(5, Math.round(resena.calificacion)));
  return (
    <li className="mr-8 w-[452px] shrink-0 text-[#303030]" aria-hidden={oculta || undefined}>
      <div className="flex gap-3 rounded-[20px] bg-[rgb(255_253_253/0.914)] p-3 shadow-[0_0_10px_rgb(0_0_0/0.05)]">
        {foto && (
          <div className="h-[54px] shrink-0 overflow-hidden">
            <Image src={foto} alt="" width={52} height={52} sizes="52px" className="block h-[52px] w-[52px] rounded-[33px] object-cover" />
          </div>
        )}
        <div className="h-[54px] min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <div className="font-bold leading-[normal]">{resena.nombre}</div>
            <div className="flex" role="img" aria-label={`${estrellas} de 5 estrellas`}>
              {Array.from({ length: estrellas }, (_, i) => (
                <Estrella key={i} />
              ))}
            </div>
          </div>
          <p className="m-0 mt-1 line-clamp-2 text-sm leading-4">{resena.texto}</p>
        </div>
      </div>
    </li>
  );
}

export function Apps({ seccion }: { seccion: Seccion }) {
  const { calificacion, total } = CARRUSEL.resumen;
  return (
    <div className={`apps-resenas ${esquema(seccion.ajustes)}`} data-seccion="apps">
      <style>{`
        .apps-resenas .apps-pista { animation: correr var(--duracion) linear infinite; }
        @media (prefers-reduced-motion: reduce) { .apps-resenas .apps-pista { animation: none; } }
      `}</style>
      <div className="relative mx-auto flex max-w-[1440px] gap-[15px] bg-white px-[15px] py-8 md:px-5">
        <div className="relative min-w-0 flex-1">
          <p className="m-0 mt-3 text-center font-[650] leading-4 text-[#303030]">
            {calificacion} estrellas basadas en <span>{total}</span> reseñas
          </p>
          <div className="relative flex flex-col justify-start gap-4 overflow-hidden py-6 md:gap-8">
            {FILAS.map((fila, f) => (
              <div key={f} className={`flex ${f % 2 === 1 ? "-ml-[200px]" : ""}`}>
                <div className="flex w-max" style={{ ["--duracion" as string]: `${fila.length * SEGUNDOS_POR_TARJETA}s` }}>
                  {[0, 1].map((copia) => (
                    <ul key={copia} className="apps-pista m-0 flex shrink-0 list-none p-0" style={{ width: fila.length * PASO }}>
                      {fila.map((r, i) => (
                        <Tarjeta key={`${copia}-${i}`} resena={r} oculta={copia > 0} />
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
