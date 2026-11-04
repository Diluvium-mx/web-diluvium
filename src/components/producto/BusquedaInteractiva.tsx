"use client";

// Parte que se mueve de la página de búsqueda: «Filtrar» (panel lateral en todas las vistas), columnas, orden y la
// rejilla de resultados. Como en la tienda, el orden y los filtros viajan en la dirección.

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import type { Filtros } from "./colecciones";
import { direccion } from "./colecciones";
import { EtiquetaFiltro, PanelFiltros } from "./ColeccionInteractiva";
import { IconoColumnas, IconoFiltro, IconoFlechaAbajo } from "./IconosColeccion";

const SEPARADOR =
  "before:absolute before:top-1/2 before:left-0 before:h-6 before:w-px before:-translate-y-1/2 before:bg-azul-oscuro/40";

const ORDENES = [
  { valor: "relevance", texto: "Relevancia" },
  { valor: "price-ascending", texto: "Precio, menor a mayor" },
  { valor: "price-descending", texto: "Precio, mayor a menor" },
];

const dinero = (n: number) => `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function BusquedaInteractiva({
  base,
  conteo,
  filtros,
  precioMax,
  tarjetas,
}: {
  base: string;
  conteo: string;
  filtros: Filtros;
  precioMax: number;
  tarjetas: { clave: string; nodo: ReactNode }[];
}) {
  const router = useRouter();
  const [colsPc, setColsPc] = useState(4);
  const [colsCel, setColsCel] = useState(1);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);
  const ir = (f: Filtros) => router.replace(direccion(base, { ...f, orden: f.orden === "relevance" ? null : f.orden }), { scroll: false });
  const activos = filtros.soloExistencia || filtros.desde !== null || filtros.hasta !== null;
  const etiquetaPrecio =
    filtros.desde !== null && filtros.hasta !== null
      ? `${dinero(filtros.desde)} - ${dinero(filtros.hasta)}`
      : filtros.desde !== null
        ? `${dinero(filtros.desde)} -`
        : filtros.hasta !== null
          ? `- ${dinero(filtros.hasta)}`
          : "";
  const sinOrden = { ...filtros, orden: filtros.orden === "relevance" ? "" : filtros.orden };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:gap-6 min-[1025px]:mb-10 min-[1025px]:flex-row min-[1025px]:items-center min-[1025px]:justify-between min-[1025px]:gap-0">
        <h2 className="font-titulo text-base leading-5 font-medium">{conteo}</h2>
        <div className="flex flex-wrap items-center justify-between min-[1025px]:flex-nowrap min-[1025px]:gap-6">
          <button
            type="button"
            className="inline-flex h-10 items-center py-1.5 font-titulo leading-[normal] font-medium"
            aria-haspopup="dialog"
            aria-expanded={panelAbierto}
            onClick={() => setPanelAbierto(true)}
          >
            Filtrar
            <IconoFiltro className="ml-2 size-5 min-[1025px]:size-6" />
          </button>

          <div
            className="relative flex after:absolute after:top-1/2 after:right-0 after:h-6 after:w-px after:-translate-y-1/2 after:bg-azul-oscuro/40"
            role="group"
            aria-label="Resultados por renglón"
          >
            {[1, 2].map((n) => (
              <button
                key={`cel-${n}`}
                type="button"
                aria-pressed={colsCel === n}
                aria-label={`${n} por renglón`}
                onClick={() => setColsCel(n)}
                className={`relative flex h-9 items-center justify-center px-4 py-2 min-[1025px]:hidden ${SEPARADOR} ${colsCel === n ? "" : "text-azul-oscuro/40"}`}
              >
                <IconoColumnas columnas={n} className="h-5 w-5" />
              </button>
            ))}
            {[3, 4, 6].map((n) => (
              <button
                key={`pc-${n}`}
                type="button"
                aria-pressed={colsPc === n}
                aria-label={`${n} por renglón`}
                onClick={() => setColsPc(n)}
                className={`relative hidden h-10 items-center justify-center px-4 py-2 min-[1025px]:flex ${SEPARADOR} ${colsPc === n ? "" : "text-azul-oscuro/40"}`}
              >
                <IconoColumnas columnas={n} className={n === 6 ? "h-6 w-7" : "size-6"} />
              </button>
            ))}
          </div>

          <div className="flex w-full items-center min-[1025px]:w-auto">
            <label htmlFor="orden-busqueda">Filtrar por:&nbsp;</label>
            <div className="relative flex h-10 items-center">
              <select
                id="orden-busqueda"
                value={filtros.orden}
                onChange={(e) => ir({ ...filtros, orden: e.target.value })}
                className="h-10 cursor-pointer appearance-none bg-transparent py-2 pr-7 font-[Arial,sans-serif] font-bold text-azul-oscuro outline-none focus-visible:outline-2 focus-visible:outline-azul"
              >
                {ORDENES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.texto}
                  </option>
                ))}
              </select>
              <IconoFlechaAbajo className="pointer-events-none absolute right-0 size-6" />
            </div>
          </div>
        </div>
      </div>

      {panelAbierto && (
        <PanelFiltros
          cerrar={cerrarPanel}
          base={base}
          filtros={sinOrden}
          precioMax={precioMax}
          ir={ir}
          conFiltros
          textoBorrar="Borrar todo"
          textoListo="Hecho"
          restablecerALaDerecha
          colorTexto="text-azul"
        />
      )}

      {activos && (
        <div className="flex flex-wrap gap-3">
          {filtros.soloExistencia && <EtiquetaFiltro href={direccion(base, { ...sinOrden, soloExistencia: false })} texto="En existencia" />}
          {etiquetaPrecio && <EtiquetaFiltro href={direccion(base, { ...sinOrden, desde: null, hasta: null })} texto={etiquetaPrecio} />}
        </div>
      )}

      {tarjetas.length > 0 ? (
        <div
          className="grid grid-cols-[repeat(var(--cols-cel),minmax(0,1fr))] gap-[3.6vw] md:gap-[3.125vw] min-[1025px]:grid-cols-[repeat(var(--cols-pc),minmax(0,1fr))] min-[1025px]:gap-[2vw]"
          style={{ "--cols-cel": colsCel, "--cols-pc": colsPc } as React.CSSProperties}
        >
          {tarjetas.map((t) => (
            <div key={t.clave} className="min-w-0">
              {t.nodo}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-24 text-center">No se encontraron productos</p>
      )}
    </div>
  );
}
