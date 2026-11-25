"use client";

// Todas las reseñas de D (dueño, 25-nov-2026: propuesta S1 con el efecto E3 «mazo de páginas»). Arriba solo la barra
// con el número, las estrellas y cuántas reseñas hay (sin filtros). Abajo, páginas de 6 reseñas en renglones
// compactos (en la computadora, 9 en 3 columnas por 3 filas), primero las que traen foto y al final las que no. Las
// páginas son un mazo de cartas: la de arriba se va con el dedo, con el mouse, con dos dedos de lado en el trackpad o
// con las flechas, y debajo esperan las demás, asomando a los dos lados y al fondo; da la vuelta (después de la última
// sigue la primera) y la página nunca salta. Debajo, «Página 3 de 40» con su barra de avance.
// Al tocar una reseña se lee completa con sus fotos en grande. (Antes, «Anterior» y «Siguiente» te regresaban hasta
// arriba de las reseñas.) Las maquetas de los otros efectos siguen en /editor/propuestas-d.

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { IconoTache } from "../landing/piezas";
import { EstrellaD } from "./comun";

export type ResenaD = { id: string; nombre: string; texto: string; estrellas: number; fotos: string[] };
export type TextosResenasD = { total: string; anterior: string; siguiente: string; pagina: string; cerrar: string };

/** Reseñas por página (dueño, 25-nov-2026): 6 en el celular (1 columna) y la tableta (2 columnas por 3 filas); 9 en la
 *  computadora (3 columnas por 3 filas). */
const COMPU = "(min-width: 1024px)";
function usePorPagina(): number {
  return useSyncExternalStore(
    (avisar) => {
      const m = matchMedia(COMPU);
      m.addEventListener("change", avisar);
      return () => m.removeEventListener("change", avisar);
    },
    () => (matchMedia(COMPU).matches ? 9 : 6),
    () => 6,
  );
}
/** Páginas que se dibujan detrás, a cada lado de la de arriba (las demás no se ven). */
const VECINAS = 3;
const ENTRE = 14;

function Estrellas({ n, clase = "size-5" }: { n: number; clase?: string }) {
  return (
    <span className="flex shrink-0 text-estrella" role="img" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: n }, (_, k) => (
        <EstrellaD key={k} className={clase} />
      ))}
    </span>
  );
}

function Flecha({ izquierda = false }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={izquierda ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/** Dónde va cada página del mazo según qué tan lejos está de la de arriba (rel) y cuánto se ha arrastrado (a, en
 *  páginas; negativo hacia la izquierda): la de arriba sigue al dedo y se va; las demás esperan detrás, cada vez más
 *  chicas, asomando a su lado (las anteriores a la izquierda y las siguientes a la derecha) y hacia el fondo, con un
 *  velo claro para que se vean como hojas de atrás y no como texto cortado. La inclinación (--giro) es menor en la
 *  computadora, donde la página es ancha. */
function acomodo(rel: number, a: number): { estilo: CSSProperties; velo: number } {
  if (rel === 0) return { estilo: { transform: `translateX(${a * 112}%) rotate(calc(var(--giro) * ${a * 9}deg))`, zIndex: 20 }, velo: 0 };
  const llega = (rel === 1 && a < 0) || (rel === -1 && a > 0) ? Math.min(Math.abs(a), 1) : 0;
  const k = Math.abs(rel) - llega;
  const lado = Math.sign(rel);
  return {
    estilo: {
      transform: `translateX(${lado * (26 * k - 4 * k * k)}px) translateY(${k * 11}px) scale(${1 - k * 0.045}) rotate(calc(var(--giro) * ${lado * k * 2.2}deg))`,
      opacity: Math.abs(rel) > VECINAS ? 0 : 1 - Math.max(0, k - 2) * 0.5,
      zIndex: 10 - Math.abs(rel),
    },
    velo: k <= 1 ? k * 0.55 : Math.min(0.8, 0.55 + (k - 1) * 0.12),
  };
}

/** Una página: 6 renglones (9 en la computadora; foto chica o la inicial, nombre, estrellas y el principio de la reseña). */
function Pagina({ resenas, abrir }: { resenas: ResenaD[]; abrir: (r: ResenaD) => void }) {
  return (
    <ul className="m-0 grid list-none gap-2 rounded-2xl border border-[#dde2e8] bg-[#f4f6f8] p-2 shadow-[0_14px_30px_-18px_rgba(11,37,69,0.55)] md:grid-cols-2 lg:grid-cols-3">
      {resenas.map((r) => (
        <li key={r.id}>
          <button type="button" onClick={() => abrir(r)} className="flex h-[92px] w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-[#dde2e8] bg-white p-2.5 text-left hover:border-[#0b2545]">
            {r.fotos[0] ? (
              <span className="relative size-[70px] shrink-0 overflow-hidden rounded-lg bg-[#f4f6f8]">
                <Image src={r.fotos[0]} alt="" fill sizes="70px" className="object-cover" draggable={false} />
                {r.fotos.length > 1 && <span className="absolute right-1 bottom-1 rounded bg-[#0b2545]/85 px-1 text-[12px] font-bold text-white">+{r.fotos.length - 1}</span>}
              </span>
            ) : (
              <span aria-hidden="true" className="flex size-[70px] shrink-0 items-center justify-center rounded-lg bg-[#fff4d1] font-titulo text-[28px] font-bold text-[#9a6700]">
                {r.nombre.charAt(0)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <strong className="truncate text-[16px] text-[#0b2545]">{r.nombre}</strong>
                <Estrellas n={r.estrellas} clase="size-4" />
              </span>
              <span className="mt-1 line-clamp-2 text-[15px] leading-snug text-[#1f2a37]">«{r.texto}»</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ResenasDCliente({ resenas, numero, textos }: { resenas: ResenaD[]; numero: string; textos: TextosResenasD }) {
  // Primero las que traen foto y al final las que no (dueño), cada grupo en el orden de la tienda.
  const ordenadas = [...resenas.filter((r) => r.fotos.length), ...resenas.filter((r) => !r.fotos.length)];
  const porPagina = usePorPagina();
  const paginas = Array.from({ length: Math.ceil(ordenadas.length / porPagina) }, (_, p) => ordenadas.slice(p * porPagina, (p + 1) * porPagina));
  const n = paginas.length;

  const caja = useRef<HTMLDivElement>(null);
  const inicio = useRef<{ x: number; y: number; t: number; ancho: number; lado: boolean | null } | null>(null);
  const movio = useRef(false);
  const [activo, setActivo] = useState(0);
  const [arrastre, setArrastre] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const actual = ((activo % n) + n) % n;
  const ir = (paso: number) => {
    setArrastre(0);
    setActivo((x) => x + paso);
  };

  const ventana = useRef<HTMLDialogElement>(null);
  const [leida, setLeida] = useState<ResenaD | null>(null);
  const [foto, setFoto] = useState(0);
  const abrir = (r: ResenaD) => {
    setLeida(r);
    setFoto(0);
    ventana.current?.showModal();
  };

  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    const el = caja.current;
    const arriba = el?.querySelector<HTMLElement>("[data-arriba]");
    inicio.current = { x: e.clientX, y: e.clientY, t: performance.now(), ancho: (arriba?.offsetWidth ?? el?.offsetWidth ?? 320) + ENTRE, lado: null };
    movio.current = false;
  };
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const s = inicio.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.lado === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      // Más de lado que hacia abajo: es para pasar de página; si no, se deja bajar la página.
      s.lado = Math.abs(dx) > Math.abs(dy);
      if (!s.lado) return;
      try {
        caja.current?.setPointerCapture(e.pointerId);
      } catch {
        // Sin captura sigue funcionando mientras el dedo no se salga del mazo.
      }
      movio.current = true;
      setArrastrando(true);
    }
    if (s.lado) setArrastre(dx / s.ancho);
  };
  const alSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const s = inicio.current;
    inicio.current = null;
    if (!s?.lado) return;
    const dx = e.clientX - s.x;
    const rapidez = dx / Math.max(1, performance.now() - s.t);
    // Pasa de página si se arrastró una quinta parte (en la computadora, donde la página es ancha, basta con 90 px) o
    // si fue un jalón rápido.
    const tope = Math.min(s.ancho * 0.2, 90);
    setArrastrando(false);
    ir(dx < -tope || rapidez < -0.45 ? 1 : dx > tope || rapidez > 0.45 ? -1 : 0);
  };

  // Trackpad de la computadora (dueño, 25-nov-2026): dos dedos de lado llegan como rueda horizontal. La página de
  // arriba sigue a los dedos y, en cuanto pasa el tope, cambia una sola página; el resto del mismo gesto (la inercia)
  // se ignora. Se escucha a mano para poder frenar el «atrás» del navegador que hace ese mismo gesto.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let acumulado = 0;
    let bloqueado = false;
    let fin: ReturnType<typeof setTimeout> | undefined;
    const alRodar = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      clearTimeout(fin);
      // Cuando los dedos se detienen un momento, termina el gesto: si no llegó al tope, la página regresa a su lugar.
      fin = setTimeout(() => {
        bloqueado = false;
        acumulado = 0;
        setArrastrando(false);
        setArrastre(0);
      }, 180);
      if (bloqueado) return;
      const ancho = (el.querySelector<HTMLElement>("[data-arriba]")?.offsetWidth ?? el.offsetWidth) + ENTRE;
      acumulado += e.deltaX;
      if (Math.abs(acumulado) > Math.min(ancho * 0.2, 90)) {
        bloqueado = true;
        setArrastrando(false);
        setArrastre(0);
        setActivo((x) => x + Math.sign(acumulado));
        return;
      }
      setArrastrando(true);
      setArrastre(-acumulado / ancho);
    };
    el.addEventListener("wheel", alRodar, { passive: false });
    return () => {
      el.removeEventListener("wheel", alRodar);
      clearTimeout(fin);
    };
  }, [n]);

  const vecinas = n > 1 ? Array.from({ length: VECINAS * 2 + 1 }, (_, i) => activo - VECINAS + i) : [0];

  return (
    <div>
      <div className="flex items-center gap-5 rounded-xl bg-[#0b2545] p-5 text-white">
        <span className="font-titulo text-[56px] leading-none font-bold">{numero}</span>
        <div>
          <Estrellas n={5} clase="size-7" />
          <p className="m-0 mt-1 text-[17px]">{textos.total.replace("{n}", String(resenas.length))}</p>
        </div>
      </div>

      {n === 1 ? (
        <div className="mt-4">
          <Pagina resenas={paginas[0]} abrir={abrir} />
        </div>
      ) : (
        <>
          <div
            ref={caja}
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={() => {
              inicio.current = null;
              setArrastrando(false);
              setArrastre(0);
            }}
            onClickCapture={(e) => {
              // Al terminar de arrastrar no se abre la reseña que quedó bajo el dedo.
              if (movio.current) {
                e.stopPropagation();
                e.preventDefault();
                movio.current = false;
              }
            }}
            className="relative mx-auto mt-4 h-[650px] touch-pan-y overscroll-x-contain select-none [--giro:1] md:h-[355px] md:cursor-grab md:[--giro:0.3] md:active:cursor-grabbing lg:[--giro:0.2]"
            role="region"
            aria-roledescription="carrusel"
            aria-label={textos.pagina.replace("{n}", String(actual + 1)).replace("{total}", String(n))}
          >
            {vecinas.map((k) => {
              const { estilo, velo } = acomodo(k - activo, arrastre);
              const mover = arrastrando ? "" : "duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none";
              return (
                <div
                  key={k}
                  data-arriba={k === activo ? "" : undefined}
                  aria-hidden={k !== activo}
                  inert={k !== activo}
                  className={`absolute top-0 left-[7%] w-[86%] origin-center will-change-transform md:left-[5%] md:w-[90%] lg:left-[3%] lg:w-[94%] ${arrastrando ? "" : "transition-[transform,opacity]"} ${mover}`}
                  style={estilo}
                >
                  <Pagina resenas={paginas[((k % n) + n) % n]} abrir={abrir} />
                  <div aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-2xl bg-[#e9edf2] ${arrastrando ? "" : "transition-opacity"} ${mover}`} style={{ opacity: velo }} />
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-3 grid max-w-[520px] grid-cols-[56px_1fr_56px] items-center gap-3">
            <button type="button" aria-label={textos.anterior} onClick={() => ir(-1)} className="flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-[#0b2545] bg-white text-[#0b2545] hover:bg-[#f4f6f8]">
              <Flecha izquierda />
            </button>
            <div>
              <p className="m-0 text-center text-[17px] font-bold whitespace-nowrap text-[#0b2545]" aria-live="polite">
                {textos.pagina.replace("{n}", String(actual + 1)).replace("{total}", String(n))}
              </p>
              <div className="mx-auto mt-2 h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-[#dde2e8]" aria-hidden="true">
                <div className="h-full rounded-full bg-[#ffc83d] transition-[width] duration-300" style={{ width: `${((actual + 1) / n) * 100}%` }} />
              </div>
            </div>
            <button type="button" aria-label={textos.siguiente} onClick={() => ir(1)} className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#0b2545] text-white hover:bg-[#13345e]">
              <Flecha />
            </button>
          </div>
        </>
      )}

      <dialog ref={ventana} aria-label={leida ? `Reseña de ${leida.nombre}` : textos.cerrar} onClose={() => setLeida(null)} className="version m-auto max-h-[92dvh] w-[min(92vw,560px)] overflow-y-auto rounded-xl bg-white p-0 backdrop:bg-black/70">
        {leida && (
          <div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="m-0 text-[17px] font-bold text-[#0b2545]">{leida.nombre}</p>
              <button type="button" onClick={() => ventana.current?.close()} className="flex h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-[17px] font-semibold text-[#0b2545] hover:bg-[#f4f6f8]">
                <IconoTache className="size-6" />
                {textos.cerrar}
              </button>
            </div>
            {leida.fotos[foto] && (
              <div className="relative aspect-square w-full bg-[#f4f6f8]">
                <Image src={leida.fotos[foto]} alt={`Foto de ${leida.nombre}`} fill sizes="560px" className="object-contain" />
              </div>
            )}
            {leida.fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 pt-3">
                {leida.fotos.map((f, i) => (
                  <button key={f} type="button" onClick={() => setFoto(i)} aria-label={`Foto ${i + 1} de ${leida.fotos.length}`} aria-pressed={i === foto} className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${i === foto ? "border-[#0b2545]" : "border-transparent"}`}>
                    <Image src={f} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="p-5">
              <Estrellas n={leida.estrellas} />
              <p className="m-0 mt-2 text-[18px] leading-[1.6] text-[#1f2a37]">«{leida.texto}»</p>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
