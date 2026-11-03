"use client";

// Selector de tamaño y aviso de existencias. Dos estilos, según la plantilla: cuadros de 72 px con el texto al centro
// (compuertas) o botones de texto (tapón, funda). Las variantes agotadas se ven tenues y cruzadas por una raya, pero
// se pueden elegir (como en la tienda: el botón de compra cambia a «Agotado»).

import { puedeComprarse, useFicha, type VarianteFicha } from "./Estado";
import { IconoExistencias } from "./Iconos";

const RAYA = "pointer-events-none absolute box-content h-[2px] rounded-[50px] border border-[rgba(10,85,154,0.12)] bg-white";

function Cuadro({ v, elegida, agotada }: { v: VarianteFicha; elegida: boolean; agotada: boolean }) {
  return (
    <span
      className={`relative flex size-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[8px] after:shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12)] ${
        elegida ? "shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12),0_0_0_2px_#fff,0_0_0_3px_#0a559a]" : ""
      }`}
    >
      <span
        className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13.6px] leading-[17px] ${
          agotada ? "text-[rgba(10,85,154,0.4)]" : "text-azul"
        }`}
      >
        {v.titulo}
      </span>
      {agotada && <span className={`${RAYA} top-[73px] -left-1 z-[2] w-[141.4%] origin-top-left -rotate-45`} />}
    </span>
  );
}

function Boton({ v, elegida, agotada }: { v: VarianteFicha; elegida: boolean; agotada: boolean }) {
  return (
    <span
      className={`relative block cursor-pointer overflow-hidden px-4 py-2 leading-5 transition-all duration-[250ms] ${
        agotada ? "bg-[rgba(10,85,154,0.12)]" : "bg-white"
      } ${elegida ? "shadow-[0_0_0_1px_#0a559a]" : "shadow-[0_0_0_1px_rgba(10,85,154,0.12)]"}`}
    >
      <span className={`leading-5 ${agotada ? "text-[rgba(10,85,154,0.4)]" : "text-azul"}`}>{v.titulo}</span>
      {agotada && <span className={`${RAYA} top-[calc(50%-1px)] -left-[2px] z-[1] w-[calc(100%+7px)] -rotate-30`} />}
    </span>
  );
}

/** «Disponibles: 5» (verde), «Pocas unidades: 4» (amarillo, de 4 para abajo) o «Agotado» (rojo). */
export function Existencias() {
  const { variantes, elegida } = useFicha();
  const n = variantes[elegida].existencias;
  if (n === null) return null;
  const tipo = n <= 0 ? "agotado" : n <= 4 ? "pocas" : "hay";
  const fondo = { hay: "bg-[#04943d]", pocas: "bg-[#ffa800]", agotado: "bg-[#eb544a]" }[tipo];
  const textoAviso = { hay: `Disponibles: ${n}`, pocas: `Pocas unidades: ${n}`, agotado: "Agotado" }[tipo];
  return (
    <div role="status">
      <span className="flex items-center gap-2 text-[13.6px] leading-[17px]">
        <span className={`flex size-6 shrink-0 items-center justify-center ${fondo}`}>
          <IconoExistencias tipo={tipo} />
        </span>
        <span>{textoAviso}</span>
      </span>
    </div>
  );
}

export function Variantes({ opcion, cuadros }: { opcion: string; cuadros: boolean }) {
  const { variantes, elegida, elegir } = useFicha();
  const nombre = `opcion-${opcion}`;
  return (
    <fieldset className="m-0 flex min-w-0 flex-wrap border-0 p-0">
      <legend className="mb-2 flex w-full items-center justify-between gap-2 p-0 md:mb-3 min-[1025px]:mb-4">
        <span className="flex flex-1">
          <span className="mr-2">{opcion}</span>
          <span className="font-bold">{variantes[elegida].titulo}</span>
        </span>
      </legend>
      <div className={`flex w-full flex-wrap ${cuadros ? "gap-2 md:gap-3 min-[1025px]:gap-4" : "gap-2"}`}>
        {variantes.map((v, i) => {
          const id = `${nombre}-${i}`;
          const agotada = !puedeComprarse(v);
          return (
            <div key={v.id} className="relative">
              <input
                type="radio"
                id={id}
                name={nombre}
                value={v.titulo}
                checked={i === elegida}
                onChange={() => elegir(i)}
                aria-label={opcion}
                className="peer absolute size-px appearance-none overflow-hidden opacity-0"
              />
              <label
                htmlFor={id}
                className="block rounded-[8px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul"
              >
                {cuadros ? (
                  <Cuadro v={v} elegida={i === elegida} agotada={agotada} />
                ) : (
                  <Boton v={v} elegida={i === elegida} agotada={agotada} />
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
