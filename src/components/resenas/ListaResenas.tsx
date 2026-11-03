"use client";

// Parte que se mueve de las reseñas del producto (la arma ResenasProducto en el servidor):
// - Resumen con promedio, estrellas y barras por calificación; «Escriba un comentario» y el menú «Ordenar por».
// - Tarjetas en columnas (2 en celular, 3 en tableta, 4 y 5 en computadora) acomodadas como en la app: cada tarjeta
//   va a la columna más corta. Se muestran de 13 en 13 con «Ver más reseñas».
// - Los textos de más de 100 letras (200 desde tableta) se cortan a 75 (175) con «...Mostrar reseña completa».
// - La foto abre la reseña en grande (Esc o la ✕ la cierran; la flecha pasa a la siguiente).
// Todo el texto de clientes va como texto plano.

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BOTON_RESENAS, BotonEscribir, EstrellasResena, IconoOrdenar } from "./piezas";

export type ResenaTarjeta = {
  id: number;
  nombre: string;
  calificacion: number;
  texto: string;
  foto: { src: string; ancho: number; alto: number } | null;
  variasFotos: boolean;
};

const POR_PAGINA = 13;
const SEPARACION_X = 12;
const SEPARACION_Y = 16;

const ORDENES = [
  { clave: "destacados", texto: "Destacados" },
  { clave: "foto", texto: "Prioridad de foto" },
  { clave: "nuevo", texto: "El más nuevo" },
  { clave: "altas", texto: "Calificaciones más altas" },
  { clave: "bajas", texto: "Calificaciones más bajas" },
] as const;
type Orden = (typeof ORDENES)[number]["clave"];

function ordenar(lista: ResenaTarjeta[], orden: Orden): ResenaTarjeta[] {
  const copia = [...lista];
  // «Destacados» y «El más nuevo» quedan en el orden publicado: las reseñas guardadas no traen fecha ni destacado.
  if (orden === "foto") copia.sort((a, b) => Number(Boolean(b.foto)) - Number(Boolean(a.foto)) || a.id - b.id);
  if (orden === "altas") copia.sort((a, b) => b.calificacion - a.calificacion || a.id - b.id);
  if (orden === "bajas") copia.sort((a, b) => a.calificacion - b.calificacion || a.id - b.id);
  return copia;
}

function columnasPara(ancho: number): number {
  if (ancho < 768) return 2;
  if (ancho < 1025) return 3;
  if (ancho < 1200) return 4;
  return 5;
}

function IconoVariasFotos() {
  return (
    <svg viewBox="0 0 22 22" width={22} height={22} aria-hidden="true" focusable="false">
      <rect x="6.5" y="3.5" width="12" height="12" rx="2.5" fill="#fff" stroke="#fff" />
      <path d="M4 7v9.5A2.5 2.5 0 0 0 6.5 19H16" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Flecha({ izquierda = false }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 14 24" width={14} height={24} fill="none" aria-hidden="true" focusable="false" className={izquierda ? "rotate-180" : ""}>
      <path d="m2 2 10 10L2 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tarjeta({
  resena,
  corte,
  completa,
  alExpandir,
  alAbrirFoto,
  estilo,
  refTarjeta,
}: {
  resena: ResenaTarjeta;
  corte: number;
  completa: boolean;
  alExpandir: () => void;
  alAbrirFoto: () => void;
  estilo?: React.CSSProperties;
  refTarjeta: (el: HTMLDivElement | null) => void;
}) {
  // La app corta cuando el texto pasa de «corte + 25» letras (lo que mide «...Mostrar reseña completa»).
  const cortado = !completa && resena.texto.length > corte + 25;
  return (
    <div
      ref={refTarjeta}
      style={estilo}
      className="relative overflow-hidden rounded-lg bg-white pb-4 shadow-[1px_1px_6px_rgb(0_0_0/0.1)]"
    >
      {resena.foto && (
        <button
          type="button"
          onClick={alAbrirFoto}
          aria-label={`Ver la foto de la reseña de ${resena.nombre}`}
          className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          <Image
            src={resena.foto.src}
            alt=""
            width={resena.foto.ancho}
            height={resena.foto.alto}
            sizes="(min-width: 1200px) 270px, (min-width: 768px) 235px, 50vw"
            className="block h-auto w-full rounded-t-lg"
          />
          {resena.variasFotos && (
            <span className="absolute top-2 right-2">
              <IconoVariasFotos />
            </span>
          )}
        </button>
      )}
      <div className="mt-4 px-4">
        <EstrellasResena valor={resena.calificacion} tamano={14} className="h-4 items-center" />
        <div className="my-3 text-sm leading-[18px] font-bold text-black">{resena.nombre}</div>
      </div>
      <p className="m-0 px-4 text-sm leading-[19.6px] break-words text-black">
        {cortado ? resena.texto.slice(0, corte) : resena.texto}
        {cortado && (
          // Va en línea con el texto (un <button> se iría completo al siguiente renglón).
          <span
            role="button"
            tabIndex={0}
            onClick={alExpandir}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                alExpandir();
              }
            }}
            className="cursor-pointer text-[#606060]"
          >
            ...Mostrar reseña completa
          </span>
        )}
      </p>
    </div>
  );
}

function Detalle({
  resena,
  alCerrar,
  alAnterior,
  alSiguiente,
}: {
  resena: ResenaTarjeta | null;
  alCerrar: () => void;
  alAnterior: (() => void) | null;
  alSiguiente: (() => void) | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (resena && !d.open) d.showModal();
    if (!resena && d.open) d.close();
  }, [resena]);
  return (
    <dialog
      ref={ref}
      onClose={alCerrar}
      onClick={(e) => e.target === ref.current && alCerrar()}
      aria-label="Reseña"
      className="m-auto max-h-none max-w-none overflow-hidden rounded bg-white p-0 backdrop:bg-black/60"
    >
      {resena && (
        <div className="flex h-[100dvh] w-screen flex-col md:h-[600px] md:w-[875px] md:max-w-[calc(100vw-32px)] md:flex-row">
          <div className="relative flex h-[60%] items-center justify-center bg-[#2c2f31] md:h-full md:w-[500px] md:shrink-0">
            {resena.foto && (
              <Image
                src={resena.foto.src}
                alt={`Foto de la reseña de ${resena.nombre}`}
                width={resena.foto.ancho}
                height={resena.foto.alto}
                sizes="500px"
                className="max-h-full w-full object-contain"
              />
            )}
            <button
              type="button"
              onClick={alCerrar}
              aria-label="Cerrar"
              className="absolute top-6 left-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-black/50 text-white"
            >
              <svg viewBox="0 0 18 18" width={18} height={18} aria-hidden="true" focusable="false">
                <path d="m3 3 12 12M15 3 3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {alAnterior && (
              <button type="button" onClick={alAnterior} aria-label="Reseña anterior" className="absolute inset-y-0 left-0 flex w-[46px] cursor-pointer items-center justify-center">
                <Flecha izquierda />
              </button>
            )}
            {alSiguiente && (
              <button type="button" onClick={alSiguiente} aria-label="Reseña siguiente" className="absolute inset-y-0 right-0 flex w-[46px] cursor-pointer items-center justify-center">
                <Flecha />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-[26px] pt-6 pb-4 text-black md:w-[375px]">
            <EstrellasResena valor={resena.calificacion} tamano={20} />
            <div className="my-3 text-base leading-5 font-bold">{resena.nombre}</div>
            <p className="m-0 text-base leading-6 break-words">{resena.texto}</p>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function ListaResenas({
  resenas,
  promedio,
  conteo,
}: {
  resenas: ResenaTarjeta[];
  promedio: number;
  conteo: { estrellas: number; total: number }[];
}) {
  const [orden, setOrden] = useState<Orden>("foto");
  const [menu, setMenu] = useState(false);
  const [cuantas, setCuantas] = useState(POR_PAGINA);
  const [completas, setCompletas] = useState<Set<number>>(() => new Set());
  const [abierta, setAbierta] = useState<number | null>(null);
  const [ancho, setAncho] = useState<number | null>(null);
  const [alturas, setAlturas] = useState<Record<number, number>>({});
  const lista = useRef<HTMLDivElement>(null);
  const tarjetas = useRef(new Map<number, HTMLDivElement>());
  const menuRef = useRef<HTMLDivElement>(null);
  const [anchoVentana, setAnchoVentana] = useState(1440);

  const ordenadas = useMemo(() => ordenar(resenas, orden), [resenas, orden]);
  const visibles = ordenadas.slice(0, cuantas);
  const conFoto = ordenadas.filter((r) => r.foto);
  const corte = anchoVentana < 768 ? 75 : 175;
  const total = resenas.length;

  // Ancho de la lista y de la ventana (para columnas y corte del texto).
  useLayoutEffect(() => {
    const el = lista.current;
    if (!el) return;
    const medir = () => {
      setAncho(el.clientWidth);
      setAnchoVentana(window.innerWidth);
    };
    // ResizeObserver avisa una vez al empezar a observar: ahí se toma la primera medida.
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Alto de cada tarjeta (cambia al abrir el texto completo o al cargar la foto).
  const medirTarjetas = useCallback(() => {
    const nuevas: Record<number, number> = {};
    tarjetas.current.forEach((el, id) => (nuevas[id] = el.offsetHeight));
    setAlturas((antes) => {
      const iguales = Object.keys(nuevas).length === Object.keys(antes).length && Object.entries(nuevas).every(([k, v]) => antes[Number(k)] === v);
      return iguales ? antes : nuevas;
    });
  }, []);
  useLayoutEffect(() => {
    const obs = new ResizeObserver(medirTarjetas);
    tarjetas.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [medirTarjetas, cuantas, orden, completas, ancho, corte]);

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
  const columnas = ancho ? columnasPara(anchoVentana) : 0;
  const anchoColumna = ancho && columnas ? (ancho - SEPARACION_X * (columnas - 1)) / columnas : 0;
  const listas = ancho !== null && visibles.every((r) => alturas[r.id] !== undefined);
  const posiciones = new Map<number, { left: number; top: number }>();
  let altoLista = 0;
  if (listas) {
    const altos = new Array<number>(columnas).fill(0);
    for (const r of visibles) {
      const c = altos.indexOf(Math.min(...altos));
      posiciones.set(r.id, { left: c * (anchoColumna + SEPARACION_X), top: altos[c] });
      altos[c] += alturas[r.id] + SEPARACION_Y;
    }
    // Como en la app, la lista deja 16 px debajo de la columna más alta (32 px si ninguna reseña trae foto).
    altoLista = Math.max(...altos) + (resenas.some((r) => r.foto) ? 0 : SEPARACION_Y);
  }

  const indiceAbierta = abierta === null ? -1 : conFoto.findIndex((r) => r.id === abierta);
  const etiquetaPromedio = (Math.floor(promedio * 10) / 10).toFixed(1);

  return (
    <div className="bg-white px-5 pb-5 text-black md:pb-0 min-[1025px]:pb-5">
      <div className="flex flex-col border-b border-black/[0.09] pt-10 pb-5 md:pb-[30px]">
        <p className="m-0 text-center text-xl leading-6 font-semibold md:leading-5 min-[1025px]:text-left">Reseñas</p>
        <div className="flex flex-wrap md:mt-10 md:justify-center md:gap-5 min-[1025px]:flex-nowrap min-[1025px]:items-center min-[1025px]:justify-between">
          <div className="w-full md:flex md:w-auto md:items-center md:gap-2">
            <div className="mb-5 flex justify-center p-px md:w-[152px] min-[1025px]:mb-0 min-[1025px]:w-[150px] min-[1025px]:p-0">
              <div className="mt-5 w-[110px] text-center md:flex md:h-[100px] md:w-[150px] md:flex-col md:justify-between min-[1025px]:mt-0">
                <p className="m-0 text-sm leading-[normal]">
                  <span className="text-[32px] leading-[normal] font-bold md:leading-8">{etiquetaPromedio}</span>
                </p>
                <EstrellasResena valor={promedio} tamano={20} className="mb-2 justify-center md:my-2 min-[1025px]:mb-0" />
                <p className="m-0 text-sm leading-[18px] md:mt-2">
                  {total} <span>reseñas</span>
                </p>
              </div>
            </div>
            <div className="hidden h-[110px] w-px bg-black/[0.09] min-[1025px]:mx-[62.5px] min-[1025px]:block" />
            <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-y-2.5 text-sm leading-[14px] md:mx-9 md:w-[300px] md:grid-cols-[auto_auto_45px] min-[1025px]:mx-0 min-[1025px]:w-[240px] min-[1025px]:grid-cols-[auto_1fr_45px]">
              {conteo.map((c) => (
                <div key={c.estrellas} className="contents">
                  <span className="block [word-break:break-word]">
                    <span className="inline-block w-[9px]">{c.estrellas}</span> <span>estrella</span>
                  </span>
                  <span className="mx-2.5 block h-2 w-[42.5vw] overflow-hidden rounded-[10px] bg-[#d9d9d9] min-[1025px]:w-auto">
                    <span className="block h-full rounded-[10px] bg-[#fdab01]" style={{ width: `${total ? (100 * c.total) / total : 0}%` }} />
                  </span>
                  <span className="block">{c.total}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex w-full gap-2.5 md:justify-end md:py-[30px] min-[1025px]:mt-0 min-[1025px]:w-auto min-[1025px]:gap-2 min-[1025px]:py-0">
            <BotonEscribir className="h-10 flex-1 px-[5px] py-1 text-sm font-semibold md:w-[260px] md:flex-none md:px-6 min-[1025px]:w-[200px]" />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Ordenar reseñas"
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
                className={`${BOTON_RESENAS} flex h-10 w-10 items-center justify-center`}
              >
                <IconoOrdenar />
              </button>
              {menu && (
                <ul className="absolute top-[calc(100%+4px)] right-0 z-10 m-0 w-[222px] list-none rounded-lg bg-white px-4 py-3 text-sm text-black shadow-[0_0_6px_rgb(0_0_0/0.15)]">
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
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div
          ref={lista}
          className={listas ? "relative" : "grid grid-cols-2 items-start gap-x-3 gap-y-4 md:grid-cols-3 min-[1025px]:grid-cols-4 min-[1200px]:grid-cols-5"}
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
                estilo={p ? { position: "absolute", left: p.left, top: p.top, width: anchoColumna } : undefined}
                refTarjeta={(el) => {
                  if (el) tarjetas.current.set(r.id, el);
                  else tarjetas.current.delete(r.id);
                }}
              />
            );
          })}
        </div>
        <div className="px-[30px] pt-5">
          {cuantas < total && (
            <button
              type="button"
              onClick={() => setCuantas((n) => n + POR_PAGINA)}
              className={`${BOTON_RESENAS} mx-auto block h-10 border-0 px-[15px] text-xs`}
            >
              Ver más reseñas
            </button>
          )}
        </div>
      </div>

      <Detalle
        resena={indiceAbierta >= 0 ? conFoto[indiceAbierta] : null}
        alCerrar={() => setAbierta(null)}
        alAnterior={indiceAbierta > 0 ? () => setAbierta(conFoto[indiceAbierta - 1].id) : null}
        alSiguiente={indiceAbierta >= 0 && indiceAbierta < conFoto.length - 1 ? () => setAbierta(conFoto[indiceAbierta + 1].id) : null}
      />
    </div>
  );
}
