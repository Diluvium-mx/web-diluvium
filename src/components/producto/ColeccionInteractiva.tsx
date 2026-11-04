"use client";

// Parte que se mueve de la página de colección: orden («Filtrar por»), columnas, filtros (barra en computadora y
// panel lateral en celular y tableta), etiquetas de filtros activos y la rejilla. Igual que la tienda, el orden y los
// filtros viajan en la dirección (?sort_by=…&filter.v.price.gte=…) y el servidor arma la lista.

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Filtros } from "./colecciones";
import { direccion } from "./colecciones";
import { IconoColumnas, IconoEquis, IconoFiltro, IconoFlechaAbajo } from "./IconosColeccion";

type Props = {
  base: string;
  titulo: string;
  conteo: string;
  filtros: Filtros;
  precioMax: number;
  ordenes: { valor: string; texto: string }[];
  tarjetas: { clave: string; nodo: ReactNode }[];
};

const dinero = (n: number) => `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dosDecimales = (n: number) => n.toFixed(2);

// Separador vertical de 24 px a la izquierda de cada botón de columnas.
const SEPARADOR =
  "before:absolute before:top-1/2 before:left-0 before:h-6 before:w-px before:-translate-y-1/2 before:bg-azul-oscuro/40";

export function ColeccionInteractiva({ base, titulo, conteo, filtros, precioMax, ordenes, tarjetas }: Props) {
  const router = useRouter();
  const [colsPc, setColsPc] = useState(4);
  const [colsCel, setColsCel] = useState(2);
  const [barraVisible, setBarraVisible] = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const hayResultados = tarjetas.length > 0;
  const activos = filtros.soloExistencia || filtros.desde !== null || filtros.hasta !== null;

  const ir = (f: Filtros) => router.replace(direccion(base, f), { scroll: false });
  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);

  const etiquetaPrecio =
    filtros.desde !== null && filtros.hasta !== null
      ? `${dinero(filtros.desde)} - ${dinero(filtros.hasta)}`
      : filtros.desde !== null
        ? `${dinero(filtros.desde)} -`
        : filtros.hasta !== null
          ? `- ${dinero(filtros.hasta)}`
          : "";

  return (
    <div className="contenedor grid gap-6 md:gap-9 min-[1025px]:gap-x-12 min-[1025px]:gap-y-4">
      <div className="flex flex-col gap-4 md:gap-6 min-[1025px]:flex-row min-[1025px]:items-center min-[1025px]:justify-between min-[1025px]:gap-0">
        <div className="flex-1 font-bold">
          {titulo} <span>{conteo}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between min-[1025px]:flex-nowrap min-[1025px]:gap-6">
          <button
            type="button"
            className="inline-flex h-10 items-center py-1.5 font-titulo font-medium min-[1025px]:hidden"
            aria-haspopup="dialog"
            aria-expanded={panelAbierto}
            onClick={() => setPanelAbierto(true)}
          >
            Filtrar
            <IconoFiltro className="ml-2 size-5" />
          </button>
          <button
            type="button"
            className="hidden h-10 items-center py-2 font-titulo leading-[normal] font-medium min-[1025px]:inline-flex"
            aria-expanded={barraVisible}
            onClick={() => setBarraVisible((v) => !v)}
          >
            {barraVisible ? "Ocultar Filtro" : "Mostrar Filtro"}
            <IconoFiltro className="ml-2 size-6" />
          </button>

          <div className="relative flex after:absolute after:top-1/2 after:right-0 after:h-6 after:w-px after:-translate-y-1/2 after:bg-azul-oscuro/40" role="group" aria-label="Productos por renglón">
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

          <div className="flex w-full items-center gap-2 min-[1025px]:w-auto">
            <label htmlFor="orden-coleccion">Filtrar por:&nbsp;</label>
            <div className="relative flex h-10 items-center">
              <select
                id="orden-coleccion"
                value={filtros.orden}
                onChange={(e) => ir({ ...filtros, orden: e.target.value })}
                className="h-10 cursor-pointer appearance-none bg-transparent py-2 pr-7 font-[Arial,sans-serif] font-bold text-azul-oscuro outline-none focus-visible:outline-2 focus-visible:outline-azul"
              >
                {ordenes.map((o) => (
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

      <div>
        {hayResultados && barraVisible && (
          <div className="hidden min-[1025px]:block">
            <div className="flex flex-wrap items-center gap-x-12 gap-y-2 rounded-2xl border border-azul/12 px-8 py-2">
              <FiltroExistencia filtros={filtros} ir={ir} />
              <FiltroPrecio key={`${filtros.desde}-${filtros.hasta}`} base={base} filtros={filtros} precioMax={precioMax} ir={ir} desplegable />
            </div>
          </div>
        )}

        {panelAbierto && (
          <PanelFiltros
            cerrar={cerrarPanel}
            base={base}
            filtros={filtros}
            precioMax={precioMax}
            ir={ir}
            conFiltros={hayResultados}
            textoBorrar="Restaurar"
            textoListo="Aplicar"
            clase="min-[1025px]:hidden"
          />
        )}

        {hayResultados ? (
          <div className={barraVisible ? "min-[1025px]:mt-12" : ""}>
            {activos && (
              <div className="flex flex-wrap gap-2 min-[1025px]:gap-4">
                {filtros.soloExistencia && (
                  <EtiquetaFiltro href={direccion(base, { ...filtros, soloExistencia: false })} texto="En existencia" />
                )}
                {etiquetaPrecio && (
                  <EtiquetaFiltro href={direccion(base, { ...filtros, desde: null, hasta: null })} texto={etiquetaPrecio} />
                )}
                <div className="h-12">
                  <Link href={base} scroll={false} className="inline-flex py-1 font-titulo font-medium underline">
                    Borrar todo
                  </Link>
                </div>
              </div>
            )}
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
          </div>
        ) : (
          <div className="flex h-full flex-col items-center gap-12 p-24 text-center">
            <span className="flex-1">No se encontraron productos</span>
            <Link
              href="/"
              className="flex min-h-10 items-center justify-center bg-white px-6 py-1.5 font-titulo font-medium shadow-[inset_0_0_0_1px_rgba(0,66,136,0.12)] min-[1025px]:min-h-11"
            >
              Back to home page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/** Panel lateral «Filtrar» (sale por la izquierda): en las colecciones solo en celular y tableta; en la búsqueda,
 *  en todas las vistas. */
export function PanelFiltros({
  cerrar,
  base,
  filtros,
  precioMax,
  ir,
  conFiltros,
  textoBorrar,
  textoListo,
  clase = "",
  restablecerALaDerecha = false,
  colorTexto = "text-azul-oscuro",
}: {
  cerrar: () => void;
  base: string;
  filtros: Filtros;
  precioMax: number;
  ir: (f: Filtros) => void;
  conFiltros: boolean;
  textoBorrar: string;
  textoListo: string;
  clase?: string;
  restablecerALaDerecha?: boolean;
  /** Las colecciones usan el azul oscuro del esquema 5; la búsqueda, el azul del esquema 1. */
  colorTexto?: string;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tecla);
    };
  }, [cerrar]);

  return (
    <div className={`fixed inset-0 z-50 p-6 md:p-12 min-[1025px]:p-16 ${clase}`} role="dialog" aria-modal="true" aria-label="Filtro de búsqueda">
      <button type="button" className="absolute inset-0 bg-[rgba(23,22,26,0.5)]" aria-label="Cerrar" onClick={cerrar} />
      <div className={`relative flex h-full w-full max-w-[400px] flex-col bg-white ${colorTexto}`}>
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <h2 className="mr-4" style={{ fontSize: "var(--h4)" }}>
            Filtrar
          </h2>
          <button type="button" className="flex size-10 items-center justify-center rounded-full min-[1025px]:size-11" aria-label="Cerrar" onClick={cerrar}>
            <IconoEquis className="size-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {conFiltros && (
            <div className="grid gap-6">
              <FiltroExistencia filtros={filtros} ir={ir} separado />
              <FiltroPrecio
                key={`${filtros.desde}-${filtros.hasta}`}
                base={base}
                filtros={filtros}
                precioMax={precioMax}
                ir={ir}
                restablecerALaDerecha={restablecerALaDerecha}
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5">
          <Link
            href={base}
            scroll={false}
            className="flex min-h-10 flex-1 items-center justify-center bg-white px-6 py-1.5 font-titulo font-medium text-azul shadow-[inset_0_0_0_1px_rgba(10,85,154,0.12)] min-[1025px]:min-h-11"
          >
            {textoBorrar}
          </Link>
          <button
            type="button"
            className="flex min-h-10 flex-1 items-center justify-center border border-naranja bg-naranja px-6 py-1.5 font-titulo font-medium text-white min-[1025px]:min-h-11"
            onClick={cerrar}
          >
            {textoListo}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EtiquetaFiltro({ href, texto }: { href: string; texto: string }) {
  return (
    <div className="h-12">
      <Link
        href={href}
        scroll={false}
        className="inline-flex items-center border border-azul-oscuro/12 bg-white px-3 py-1 text-sm leading-[17.5px]"
      >
        {texto}
        <IconoEquis className="ml-2 size-4" />
        <span className="sr-only">Borrar filtro</span>
      </Link>
    </div>
  );
}

export function FiltroExistencia({ filtros, ir, separado = false }: { filtros: Filtros; ir: (f: Filtros) => void; separado?: boolean }) {
  return (
    <span className={`flex items-center font-bold ${separado ? "justify-between gap-1" : "h-10 gap-2"}`}>
      <label htmlFor={separado ? "existencia-panel" : "existencia-barra"} className="cursor-pointer">
        Solo en stock
      </label>
      <input
        id={separado ? "existencia-panel" : "existencia-barra"}
        type="checkbox"
        checked={filtros.soloExistencia}
        onChange={(e) => ir({ ...filtros, soloExistencia: e.target.checked })}
        className="relative h-6 w-[42px] cursor-pointer appearance-none rounded-full bg-azul/40 transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-[18px] before:rounded-full before:bg-white before:transition-transform checked:bg-azul checked:before:translate-x-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
      />
    </span>
  );
}

export function FiltroPrecio({
  base,
  filtros,
  precioMax,
  ir,
  desplegable = false,
  restablecerALaDerecha = false,
}: {
  base: string;
  filtros: Filtros;
  precioMax: number;
  ir: (f: Filtros) => void;
  /** En la búsqueda, en computadora, «Restablecer» va a la derecha. */
  restablecerALaDerecha?: boolean;
  /** En computadora el rango sale en un recuadro flotante; en el panel lateral va abierto debajo del título. */
  desplegable?: boolean;
}) {
  const [abierto, setAbierto] = useState(!desplegable);
  const [desde, setDesde] = useState(filtros.desde !== null ? dosDecimales(filtros.desde) : "0");
  const [hasta, setHasta] = useState(dosDecimales(filtros.hasta ?? precioMax));
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  const caja = useRef<HTMLDivElement>(null);

  // Cierra el recuadro flotante al tocar fuera de él.
  useEffect(() => {
    if (!desplegable || !abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("click", fuera);
    return () => document.removeEventListener("click", fuera);
  }, [desplegable, abierto]);

  useEffect(() => () => {
    if (espera.current) clearTimeout(espera.current);
  }, []);

  const aplicar = (d: string, h: string) => {
    if (espera.current) clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      const nd = Number(d);
      const nh = Number(h);
      ir({
        ...filtros,
        desde: d.trim() !== "" && Number.isFinite(nd) && nd > 0 ? nd : null,
        hasta: h.trim() !== "" && Number.isFinite(nh) && nh < precioMax ? nh : null,
      });
    }, 600);
  };

  const numDesde = Math.min(Number(desde) || 0, precioMax);
  const numHasta = Math.max(Math.min(Number(hasta) || 0, precioMax), numDesde);
  const pct = (n: number) => (precioMax > 0 ? (n / precioMax) * 100 : 0);
  const deslizador =
    "pointer-events-none absolute inset-x-0 top-0 h-0 w-full -translate-y-1/2 appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] " +
    "[&::-webkit-slider-thumb]:border-azul-oscuro [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto " +
    "[&::-moz-range-thumb]:size-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] " +
    "[&::-moz-range-thumb]:border-azul-oscuro [&::-moz-range-thumb]:bg-white";
  const campo = "h-[38px] w-full rounded-[64px] border border-azul/12 bg-transparent py-2 pr-4 pl-8 text-right text-azul outline-none [appearance:textfield] focus:border-azul [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  const contenido = (
    <>
      <div className="flex flex-col gap-5">
        <div className="relative mt-4 h-0">
          <div className="absolute inset-x-0 -top-0.5 h-1 rounded-[5px] bg-azul/12">
            <div className="absolute inset-y-0 bg-azul-oscuro" style={{ left: `${pct(numDesde)}%`, right: `${100 - pct(numHasta)}%` }} />
          </div>
          <label className="sr-only" htmlFor={`rango-desde-${desplegable}`}>Desde</label>
          <input
            id={`rango-desde-${desplegable}`}
            type="range"
            min={0}
            max={precioMax}
            value={numDesde}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), numHasta);
              setDesde(String(v));
              aplicar(String(v), hasta);
            }}
            className={deslizador}
          />
          <label className="sr-only" htmlFor={`rango-hasta-${desplegable}`}>A</label>
          <input
            id={`rango-hasta-${desplegable}`}
            type="range"
            min={0}
            max={precioMax}
            value={numHasta}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), numDesde);
              setHasta(String(v));
              aplicar(desde, String(v));
            }}
            className={deslizador}
          />
        </div>
        <div className="flex items-center gap-4 font-normal">
          <div className="relative mt-1 flex-1">
            <label className="sr-only" htmlFor={`precio-desde-${desplegable}`}>Desde</label>
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-azul">$</span>
            <input
              id={`precio-desde-${desplegable}`}
              type="number"
              min={0}
              max={precioMax}
              placeholder="0"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                aplicar(e.target.value, hasta);
              }}
              className={campo}
            />
          </div>
          <span className="text-azul">A</span>
          <div className="relative mt-1 flex-1">
            <label className="sr-only" htmlFor={`precio-hasta-${desplegable}`}>A</label>
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-azul">$</span>
            <input
              id={`precio-hasta-${desplegable}`}
              type="number"
              min={0}
              max={precioMax}
              placeholder={dosDecimales(precioMax)}
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                aplicar(desde, e.target.value);
              }}
              className={campo}
            />
          </div>
        </div>
      </div>
      <div className={`flex ${desplegable ? "mt-4" : "my-6"} ${restablecerALaDerecha ? "min-[1025px]:justify-end" : ""}`}>
        <Link
          href={direccion(base, { ...filtros, desde: null, hasta: null })}
          scroll={false}
          className="inline-flex py-2 font-titulo font-medium text-naranja underline"
        >
          Restablecer
        </Link>
      </div>
    </>
  );

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className={`flex h-10 w-full items-center justify-between gap-3 py-2 font-bold ${abierto ? "text-naranja" : ""}`}
      >
        Precio
        <span className="flex size-6 items-center justify-center">
          <IconoFlechaAbajo className={`size-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
        </span>
      </button>
      {abierto &&
        (desplegable ? (
          <div className="absolute top-[calc(100%+8px)] left-1/2 z-10 w-[350px] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(10,85,154,0.12)]">
            {contenido}
          </div>
        ) : (
          contenido
        ))}
    </div>
  );
}
