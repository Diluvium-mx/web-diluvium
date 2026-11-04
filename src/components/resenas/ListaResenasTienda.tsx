"use client";

// Parte que se mueve de la página de todas las reseñas (la arma ResenasTienda en el servidor), medida en vivo:
// - Resumen centrado («Reseñas», promedio, estrellas, barras por calificación) y «Escribir una reseña de la tienda».
// - Pestañas «Reseñas (n)» y «Reseñas de la tienda(0)» (esta última sin comentarios) y el menú de ordenar.
// - Tarjetas en columnas (2 si la lista mide menos de 500 px, si no 3), cada una en la columna más corta. Llegan de
//   15 en 15 al bajar la página, como en la app.
// - La foto abre la reseña en grande; el texto largo se corta con «...Mostrar reseña completa».
// Todo el texto de clientes va como texto plano.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Detalle, ORDENES, ordenar, SEPARACION_X, SEPARACION_Y, Tarjeta, type Orden, type ResenaTarjeta } from "./ListaResenas";
import { BOTON_RESENAS, EstrellasResena } from "./piezas";

const POR_PAGINA = 15;

function Flechita() {
  return (
    <svg viewBox="0 0 10 6" width={10} height={6} fill="none" aria-hidden="true" focusable="false">
      <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function ListaResenasTienda({
  resenas,
  promedio,
  conteo,
}: {
  resenas: ResenaTarjeta[];
  promedio: number;
  conteo: { estrellas: number; total: number }[];
}) {
  const [pestana, setPestana] = useState<"productos" | "tienda">("productos");
  const [orden, setOrden] = useState<Orden>("foto");
  const [menu, setMenu] = useState(false);
  const [cuantas, setCuantas] = useState(POR_PAGINA);
  const [completas, setCompletas] = useState<Set<number>>(() => new Set());
  const [abierta, setAbierta] = useState<number | null>(null);
  const [ancho, setAncho] = useState<number | null>(null);
  const [anchoVentana, setAnchoVentana] = useState(1440);
  const [alturas, setAlturas] = useState<Record<number, number>>({});
  const lista = useRef<HTMLDivElement>(null);
  const final = useRef<HTMLDivElement>(null);
  const tarjetas = useRef(new Map<number, HTMLDivElement>());
  const menuRef = useRef<HTMLDivElement>(null);

  // «Prioridad de foto» es el orden en que la app publica la lista (el guardado), que no pone todas las fotos primero.
  const ordenadas = useMemo(() => (orden === "foto" ? resenas : ordenar(resenas, orden)), [resenas, orden]);
  const visibles = ordenadas.slice(0, cuantas);
  const conFoto = ordenadas.filter((r) => r.foto);
  const corte = anchoVentana < 768 ? 75 : 175;
  const total = resenas.length;
  const redondeado = Math.floor(promedio * 10) / 10;

  // Ancho de la lista y de la ventana (columnas y corte del texto).
  useLayoutEffect(() => {
    const el = lista.current;
    if (!el) return;
    const medir = () => {
      setAncho(el.clientWidth);
      setAnchoVentana(window.innerWidth);
    };
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [pestana]);

  // Alto de cada tarjeta (cambia al abrir el texto completo o al cargar la foto).
  const medirTarjetas = useCallback(() => {
    const nuevas: Record<number, number> = {};
    tarjetas.current.forEach((el, id) => (nuevas[id] = el.getBoundingClientRect().height));
    setAlturas((antes) => {
      const iguales =
        Object.keys(nuevas).length === Object.keys(antes).length &&
        Object.entries(nuevas).every(([k, v]) => antes[Number(k)] === v);
      return iguales ? antes : nuevas;
    });
  }, []);
  useLayoutEffect(() => {
    const obs = new ResizeObserver(medirTarjetas);
    tarjetas.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [medirTarjetas, cuantas, orden, completas, ancho, corte, pestana]);

  // Al acercarse al final de la lista llegan 15 reseñas más.
  useEffect(() => {
    const el = final.current;
    if (!el || pestana !== "productos" || cuantas >= total) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) setCuantas((n) => Math.min(total, n + POR_PAGINA));
      },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cuantas, total, pestana]);

  // Cierra el menú de ordenar al hacer clic afuera.
  useEffect(() => {
    if (!menu) return;
    const fuera = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("click", fuera);
    return () => document.removeEventListener("click", fuera);
  }, [menu]);

  // Posiciones: cada tarjeta a la columna más corta (empate: la de la izquierda).
  const columnas = ancho ? (ancho < 500 ? 2 : 3) : 0;
  const anchoColumna = ancho && columnas ? (ancho - SEPARACION_X * (columnas - 1)) / columnas : 0;
  // Ya hay columnas en cuanto alguna tarjeta está medida. Las que acaban de llegar (al bajar o con «Ver más») se
  // dibujan ocultas hasta tener su alto, para que las demás no se reacomoden ni parpadeen.
  const listas = ancho !== null && visibles.some((r) => alturas[r.id] !== undefined);
  const posiciones = new Map<number, { left: number; top: number }>();
  let altoLista = 0;
  if (listas) {
    const altos = new Array<number>(columnas).fill(0);
    for (const r of visibles) {
      if (alturas[r.id] === undefined) continue;
      const c = altos.indexOf(Math.min(...altos));
      posiciones.set(r.id, { left: c * (anchoColumna + SEPARACION_X), top: altos[c] });
      altos[c] += alturas[r.id] + SEPARACION_Y;
    }
    // Como en la app, la lista deja 16 px debajo de la columna más alta.
    altoLista = Math.max(...altos);
  }
  const indiceAbierta = abierta === null ? -1 : conFoto.findIndex((r) => r.id === abierta);
  const nombreOrden = ORDENES.find((o) => o.clave === orden)?.texto ?? "";

  return (
    <div className="px-5 pb-5 text-left text-xs leading-[normal] text-black md:px-2">
      {/* Resumen */}
      <div className="flex flex-col pt-10 pb-5 md:pb-[30px]">
        <p className="m-0 mb-8 text-center text-xl leading-[normal] font-semibold md:mb-0 md:leading-5">Reseñas</p>
        <div className="flex flex-col md:mt-10 md:gap-5 min-[1025px]:items-center">
          <div className="md:mx-auto md:flex md:w-[532px] md:flex-col md:items-center md:gap-8">
            <div className="mb-5 flex justify-center p-px min-[1025px]:mb-0 min-[1025px]:p-0">
              <div className="mt-5 w-[110px] text-center md:flex md:h-[100px] md:w-[150px] md:flex-col md:justify-between min-[1025px]:mt-0">
                <p className="m-0 mb-8 text-sm leading-[normal] md:h-8 md:leading-8">
                  <span className="text-[32px] leading-[normal] font-bold md:leading-8">{redondeado.toFixed(1)}</span>
                </p>
                <EstrellasResena valor={redondeado} tamano={20} className="mb-2 justify-center md:mt-2 md:mb-0" />
                <p className="m-0 text-sm leading-[normal] md:mt-2">
                  {total} <span>reseñas</span>
                </p>
              </div>
            </div>
            <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-y-2.5 text-sm leading-[14px] md:mx-auto md:w-[300px] md:grid-cols-[auto_auto_45px] min-[1025px]:w-[240px] min-[1025px]:grid-cols-[auto_1fr_45px]">
              {conteo.map((c) => (
                <div key={c.estrellas} className="contents">
                  <span className="block [word-break:break-word]">
                    <span className="inline-block w-[9px]">{c.estrellas}</span> <span>estrella</span>
                  </span>
                  <span className="mx-2.5 block h-2 w-[42.5vw] overflow-hidden rounded-[10px] bg-[#d9d9d9] min-[1025px]:w-auto">
                    <span
                      className="block h-full rounded-[10px] bg-[#fdab01]"
                      style={{ width: `${total ? (100 * c.total) / total : 0}%` }}
                    />
                  </span>
                  <span className="block">{c.total}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex py-4 md:justify-end md:pb-2.5 min-[1025px]:mt-0 min-[1025px]:justify-center">
            {/* Paso 3: abrir el formulario para escribir una reseña de la tienda (guardar en la base de datos, con revisión antes de publicar). */}
            <button
              type="button"
              className={`${BOTON_RESENAS} h-10 w-full px-[5px] py-1 text-sm font-semibold md:w-[260px] md:px-6 min-[1025px]:w-[256.4px]`}
            >
              Escribir una reseña de la tienda
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      {/* Una sola línea: en celular su ancho manda el de toda la lista (así mide en vivo). */}
      <div className="h-[30px] border-b border-[#e6e6e6] whitespace-nowrap" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={pestana === "productos"}
          onClick={() => setPestana("productos")}
          // 107.19 px: lo que mide en vivo (con su letra queda 1 px más angosta y en celular cambia el ancho de las tarjetas).
          className={`mr-5 inline-block min-w-[107.19px] cursor-pointer pb-1.5 text-left text-base leading-5 ${pestana === "productos" ? "border-b-[3px] border-black font-semibold" : ""}`}
        >
          Reseñas ({total})
        </button>{" "}
        <button
          type="button"
          role="tab"
          aria-selected={pestana === "tienda"}
          onClick={() => setPestana("tienda")}
          className={`mr-5 inline-block cursor-pointer pb-1.5 text-base leading-5 ${pestana === "tienda" ? "border-b-[3px] border-black font-semibold" : ""}`}
        >
          Reseñas de la tienda(0)
        </button>
      </div>

      {pestana === "tienda" ? (
        <div className="mt-4 text-center">
          <EstrellasResena valor={0} tamano={20} separacion={3} vacia="#dedede" className="justify-center" />
          <p className="m-0 mt-1 text-xl leading-6">aún no hay comentarios</p>
        </div>
      ) : (
        <>
          <div className="relative mt-3 text-right" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menu}
              aria-label={`Ordenar por: ${nombreOrden}`}
              onClick={() => setMenu((m) => !m)}
              className="inline-flex cursor-pointer items-center gap-2 text-sm leading-[18px]"
            >
              {nombreOrden}
              <Flechita />
            </button>
            {menu && (
              <ul className="absolute top-[calc(100%+4px)] right-0 z-10 m-0 w-[222px] list-none rounded-lg bg-white px-4 py-3 text-left text-sm text-black shadow-[0_0_6px_rgb(0_0_0/0.15)]">
                <li className="pb-2 text-base">Ordenar por</li>
                {ORDENES.map((o) => (
                  <li key={o.clave}>
                    <button
                      type="button"
                      onClick={() => {
                        setOrden(o.clave);
                        setCuantas(POR_PAGINA);
                        setMenu(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between py-2 text-left"
                      aria-pressed={orden === o.clave}
                    >
                      {o.texto}
                      {orden === o.clave && (
                        <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true" focusable="false">
                          <path d="m2 8.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            ref={lista}
            data-lista-resenas
            className={`mt-4 ${listas ? "relative" : "grid grid-cols-2 items-start gap-x-3 gap-y-4 md:grid-cols-3"}`}
            style={listas ? { height: altoLista } : undefined}
          >
            {visibles.map((r) => {
              const p = posiciones.get(r.id);
              return (
                <Tarjeta
                  key={r.id}
                  resena={r}
                  corte={corte}
                  completa={completas.has(r.id)}
                  alExpandir={() => setCompletas((s) => new Set(s).add(r.id))}
                  alAbrirFoto={() => setAbierta(r.id)}
                  estilo={
                  p
                    ? { position: "absolute", left: p.left, top: p.top, width: anchoColumna }
                    : listas
                      ? { position: "absolute", left: 0, top: 0, width: anchoColumna, visibility: "hidden" }
                      : undefined
                }
                  refTarjeta={(el) => {
                    if (el) tarjetas.current.set(r.id, el);
                    else tarjetas.current.delete(r.id);
                  }}
                />
              );
            })}
          </div>
          <div ref={final} aria-hidden="true" />
        </>
      )}

      <Detalle
        resena={indiceAbierta >= 0 ? conFoto[indiceAbierta] : null}
        alCerrar={() => setAbierta(null)}
        alAnterior={indiceAbierta > 0 ? () => setAbierta(conFoto[indiceAbierta - 1].id) : null}
        alSiguiente={
          indiceAbierta >= 0 && indiceAbierta < conFoto.length - 1 ? () => setAbierta(conFoto[indiceAbierta + 1].id) : null
        }
      />
    </div>
  );
}
