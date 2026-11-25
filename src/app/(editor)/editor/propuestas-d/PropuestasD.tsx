"use client";

// Reseñas de D: el dueño eligió la propuesta S1 (las mismas 6 por página, deslizando) el 25-nov-2026, sin los filtros
// (queda solo la barra del 4.9 con las reseñas publicadas), primero las que traen foto y al final las que no. Pidió
// que al deslizar se vea, al fondo y en ambos lados, que las reseñas son como infinitas: aquí van tres formas de ese
// efecto para que elija una; después se construye en la página. Las tres dan la vuelta (después de la última página
// sigue la primera). Cada cuadro va en <div data-propuesta="E1"…> (de ahí salen las imágenes). El dueño eligió E3
// (mazo), ya construido en src/components/secciones/d/ResenasDCliente.tsx.

import Image from "next/image";
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

export type ResenaPD = { id: number; nombre: string; texto: string; estrellas: number; fotos: string[] };
type Efecto = "lados" | "3d" | "mazo";

const POR_PAGINA = 6;
/** Las páginas que se dibujan a cada lado de la que se ve (las demás no hacen falta). */
const VECINAS = 3;

function Estrellas({ n, clase = "size-5" }: { n: number; clase?: string }) {
  return (
    <span className="flex text-estrella" role="img" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={clase} fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Flecha({ izquierda = false }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={izquierda ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function Marco({ id, titulo, idea, children }: { id: string; titulo: string; idea: string; children: ReactNode }) {
  return (
    <section className="w-[390px] shrink-0">
      <p className="m-0 font-titulo text-[13px] font-semibold tracking-[0.08em] text-[#9a6700] uppercase">Efecto {id}</p>
      <h2 className="titulo-version m-0 mt-1 text-[21px] text-[#0b2545]">{titulo}</h2>
      <p className="m-0 mt-1 mb-3 min-h-[80px] text-[14px] leading-snug text-tinta">{idea}</p>
      <div data-propuesta={id} className="overflow-hidden rounded-[22px] border border-[#dde2e8] bg-white p-4 text-[#1f2a37] shadow-[0_20px_50px_-24px_rgba(12,30,51,0.45)]">
        {children}
      </div>
    </section>
  );
}

/** Lo único que queda arriba (dueño): la barra con el 4.9, las estrellas y cuántas reseñas hay. */
function Resumen({ total, numero }: { total: number; numero: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#0b2545] p-4 text-white">
      <span className="font-titulo text-[46px] leading-none font-bold">{numero}</span>
      <div>
        <Estrellas n={5} clase="size-6" />
        <p className="m-0 mt-1 text-[16px]">{total} reseñas publicadas</p>
      </div>
    </div>
  );
}

/** Ventana para leer una reseña completa con su foto. */
function useVentana() {
  const ref = useRef<HTMLDialogElement>(null);
  const [r, setR] = useState<ResenaPD | null>(null);
  const abrir = (x: ResenaPD) => {
    setR(x);
    ref.current?.showModal();
  };
  const ventana = (
    <dialog ref={ref} onClose={() => setR(null)} aria-label={r ? `Reseña de ${r.nombre}` : "Reseña"} className="version m-auto w-[min(92vw,520px)] rounded-xl bg-white p-0 backdrop:bg-black/70">
      {r && (
        <div>
          {r.fotos[0] && (
            <div className="relative aspect-square w-full bg-[#f4f6f8]">
              <Image src={r.fotos[0]} alt={`Foto de ${r.nombre}`} fill sizes="520px" className="object-contain" />
            </div>
          )}
          <div className="p-5">
            <Estrellas n={r.estrellas} />
            <p className="m-0 mt-2 text-[18px] leading-[1.6]">«{r.texto}»</p>
            <p className="m-0 mt-2 text-[17px] font-bold text-[#0b2545]">{r.nombre}</p>
            <button type="button" onClick={() => ref.current?.close()} className="mt-4 min-h-14 w-full cursor-pointer rounded-xl bg-[#0b2545] text-[17px] font-bold text-white">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
  return { abrir, ventana };
}

/** Una página de S1: 6 renglones compactos (foto chica, nombre, estrellas y el principio de la reseña). */
function Pagina({ resenas, abrir }: { resenas: ResenaPD[]; abrir: (r: ResenaPD) => void }) {
  return (
    <ul className="m-0 grid list-none gap-2 rounded-2xl border border-[#dde2e8] bg-[#f4f6f8] p-2 shadow-[0_14px_30px_-18px_rgba(11,37,69,0.55)]">
      {resenas.map((r) => (
        <li key={r.id}>
          <button type="button" onClick={() => abrir(r)} className="flex h-[92px] w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-[#dde2e8] bg-white p-2.5 text-left">
            {r.fotos[0] ? (
              <span className="relative size-[70px] shrink-0 overflow-hidden rounded-lg bg-[#f4f6f8]">
                <Image src={r.fotos[0]} alt="" fill sizes="70px" className="object-cover" draggable={false} />
              </span>
            ) : (
              <span className="flex size-[70px] shrink-0 items-center justify-center rounded-lg bg-[#fff4d1] font-titulo text-[28px] font-bold text-[#9a6700]">{r.nombre.charAt(0)}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <strong className="truncate text-[16px] text-[#0b2545]">{r.nombre}</strong>
                <Estrellas n={r.estrellas} clase="size-4" />
              </span>
              <span className="mt-1 line-clamp-2 text-[15px] leading-snug">«{r.texto}»</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Cómo se acomoda cada página según qué tan lejos está de la que se ve (rel, en páginas) y cuánto se ha arrastrado
 *  con el dedo (a, en páginas; negativo hacia la izquierda). */
function acomodo(efecto: Efecto, rel: number, a: number): CSSProperties {
  const d = rel + a;
  const ad = Math.abs(d);
  if (efecto === "lados") {
    return {
      transform: `translateX(${d * 92}%) scale(${1 - Math.min(ad, 1) * 0.12})`,
      opacity: ad > 2.2 ? 0 : 1 - Math.min(ad, 1) * 0.4,
      zIndex: 10 - Math.round(ad * 2),
    };
  }
  if (efecto === "3d") {
    return {
      transform: `translateX(${d * 64}%) translateZ(${-Math.min(ad, 2) * 140}px) rotateY(${Math.max(-55, Math.min(55, -d * 42))}deg)`,
      opacity: ad > 2.4 ? 0 : 1,
      filter: `brightness(${1 - Math.min(ad, 1.5) * 0.16})`,
      zIndex: 10 - Math.round(ad * 2),
    };
  }
  // Mazo: la de arriba sigue al dedo y se va; las demás esperan detrás, asomando a los lados y al fondo.
  if (rel === 0) return { transform: `translateX(${a * 112}%) rotate(${a * 9}deg)`, zIndex: 20 };
  const llega = (rel === 1 && a < 0) || (rel === -1 && a > 0) ? Math.min(Math.abs(a), 1) : 0;
  const k = Math.abs(rel) - llega;
  const lado = Math.sign(rel);
  return {
    transform: `translateX(${lado * (26 * k - 4 * k * k)}px) translateY(${k * 11}px) scale(${1 - k * 0.045}) rotate(${lado * k * 2.2}deg)`,
    opacity: Math.abs(rel) > 3 ? 0 : 1 - Math.max(0, k - 2) * 0.5,
    zIndex: 10 - Math.abs(rel),
  };
}

const ANCHO: Record<Efecto, string> = { lados: "left-[10%] w-[80%]", "3d": "left-[11%] w-[78%]", mazo: "left-[7%] w-[86%]" };

/** El carrusel que da la vuelta: se arrastra con el dedo (o el ratón) o con las flechas, y nunca se acaba. */
function CarruselInfinito({ efecto, paginas, abrir }: { efecto: Efecto; paginas: ResenaPD[][]; abrir: (r: ResenaPD) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const inicio = useRef<{ x: number; y: number; t: number; ancho: number; lado: boolean | null } | null>(null);
  const movio = useRef(false);
  const [activo, setActivo] = useState(0);
  const [arrastre, setArrastre] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const n = paginas.length;
  const actual = ((activo % n) + n) % n;
  const ir = (paso: number) => {
    setArrastre(0);
    setActivo((x) => x + paso);
  };
  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    const el = caja.current;
    const pagina = el?.querySelector<HTMLElement>("[data-pagina]");
    inicio.current = { x: e.clientX, y: e.clientY, t: performance.now(), ancho: (pagina?.offsetWidth ?? el?.offsetWidth ?? 300) + 14, lado: null };
    movio.current = false;
  };
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const s = inicio.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.lado === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      // Si va más de lado que hacia abajo es para deslizar; si no, se deja bajar la página.
      s.lado = Math.abs(dx) > Math.abs(dy);
      if (!s.lado) return;
      try {
        caja.current?.setPointerCapture(e.pointerId);
      } catch {
        // Sin captura sigue funcionando mientras el dedo no se salga del carrusel.
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
    const a = dx / s.ancho;
    setArrastrando(false);
    ir(a < -0.2 || rapidez < -0.45 ? 1 : a > 0.2 || rapidez > 0.45 ? -1 : 0);
  };
  const vecinas = Array.from({ length: VECINAS * 2 + 1 }, (_, i) => activo - VECINAS + i);
  return (
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
        className={`relative mt-3 touch-pan-y select-none ${efecto === "mazo" ? "h-[650px]" : "h-[620px]"}`}
        style={efecto === "3d" ? { perspective: "1100px" } : undefined}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Reseñas de clientes"
      >
        {vecinas.map((k) => (
          <div
            key={k}
            data-pagina={k === activo ? "" : undefined}
            aria-hidden={k !== activo}
            inert={k !== activo}
            className={`absolute top-0 ${ANCHO[efecto]} origin-center will-change-transform ${arrastrando ? "" : "transition-[transform,opacity,filter] duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"}`}
            style={acomodo(efecto, k - activo, arrastre)}
          >
            <Pagina resenas={paginas[((k % n) + n) % n]} abrir={abrir} />
          </div>
        ))}
        {efecto === "lados" && (
          <>
            <div className="pointer-events-none absolute inset-y-0 -left-4 z-30 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 -right-4 z-30 w-10 bg-gradient-to-l from-white to-transparent" />
          </>
        )}
      </div>
      <div className="mt-3 grid grid-cols-[56px_1fr_56px] items-center gap-2">
        <button type="button" aria-label="Página anterior" onClick={() => ir(-1)} className="flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-[#0b2545] bg-white text-[#0b2545]">
          <Flecha izquierda />
        </button>
        <p className="m-0 text-center text-[17px] font-bold text-[#0b2545]" aria-live="polite">
          Página {actual + 1} de {n}
        </p>
        <button type="button" aria-label="Página siguiente" onClick={() => ir(1)} className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#0b2545] text-white">
          <Flecha />
        </button>
      </div>
      <p className="m-0 mt-2 text-center text-[14px] text-[#4a5568]">Desliza con el dedo a la derecha o a la izquierda</p>
    </>
  );
}

function Propuesta({ efecto, resenas, numero }: { efecto: Efecto; resenas: ResenaPD[]; numero: string }) {
  const { abrir, ventana } = useVentana();
  // Primero las que traen foto y al final las que no (dueño), cada grupo en el orden de la tienda.
  const ordenadas = [...resenas.filter((r) => r.fotos.length), ...resenas.filter((r) => !r.fotos.length)];
  const paginas = Array.from({ length: Math.ceil(ordenadas.length / POR_PAGINA) }, (_, p) => ordenadas.slice(p * POR_PAGINA, (p + 1) * POR_PAGINA));
  return (
    <>
      <Resumen total={resenas.length} numero={numero} />
      <CarruselInfinito efecto={efecto} paginas={paginas} abrir={abrir} />
      {ventana}
    </>
  );
}

export function PropuestasD({ resenas, numero }: { resenas: ResenaPD[]; numero: string }) {
  const conFoto = resenas.filter((r) => r.fotos.length).length;
  return (
    <main className="version min-h-dvh bg-[#e9edf2] px-6 py-8 text-[#0b2545]">
      <h1 className="titulo-version m-0 text-[30px]">Reseñas de D (S1): el efecto de reseñas infinitas</h1>
      <p className="m-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-tinta">
        Ya con lo que pediste: arriba solo la barra del {numero}, primero las {conFoto} reseñas con foto y al final las que no traen. Las tres dan la vuelta (después de la última página sigue la primera) y la página no se mueve. Cambia cómo se ven las demás páginas al fondo y a los lados. Deslízalas con el ratón o con el dedo y dime cuál quieres, por ejemplo «E2».
      </p>
      <div className="mt-6 flex flex-wrap items-start gap-8">
        <Marco id="E1" titulo="Asoman a los lados" idea="La página de en medio y, a cada lado, la orilla de la anterior y la siguiente, más chicas y clarito, perdiéndose en la orilla. Al deslizar pasan como una tira sin fin.">
          <Propuesta efecto="lados" resenas={resenas} numero={numero} />
        </Marco>
        <Marco id="E2" titulo="Carrusel en 3D" idea="Como una rueda: las páginas de los lados se ven de perfil y más atrás, y al deslizar giran hacia el frente. Es el que más se nota que hay muchas más.">
          <Propuesta efecto="3d" resenas={resenas} numero={numero} />
        </Marco>
        <Marco id="E3" titulo="Mazo de páginas" idea="Como un mazo de cartas: la página de arriba se va con el dedo y debajo esperan las demás, asomando a los dos lados y al fondo.">
          <Propuesta efecto="mazo" resenas={resenas} numero={numero} />
        </Marco>
      </div>
    </main>
  );
}
