"use client";

// Los 3 pasos para comprar la compuerta (21-nov-2026, dueño): 1 «Mide el ancho de tu entrada» con el dibujo,
// 2 «Elige tu tamaño» con la tabla de tamaños y una flecha que la recorre de arriba abajo, y 3 «Recíbela y colócala».
// Va en la ventana de «¿Cómo medir?» (Ver pasos clave) y, cuando el dueño elija diseño, en la parte de pasos (B1-P5).
// Tres diseños para elegir: «a» tarjetas, «b» línea de pasos, «c» deslizable. La tabla sale del catálogo (siempre
// con las medidas reales).

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { formato } from "./formato";

export type TamanoPaso = { nombre: string; medidas: string };
/** La tabla de tamaños como foto (Mini de B1, 24-nov-2026: su tabla A–G), en lugar de la tabla con la flecha. */
export type FotoTabla = { src: string; alt: string; ancho: number; alto: number; estilo?: CSSProperties; marca?: Record<string, string> };
export type VariantePasos = "a" | "b" | "c";
/** Un paso: su título y su dibujo (o la tabla de tamaños). En la página (B1-P5) salen de la plantilla. */
export type PasoMedir = {
  titulo: string;
  imagen?: string;
  alt?: string;
  tabla?: boolean;
  /** Con foto, la tabla es esa foto. */
  fotoTabla?: FotoTabla;
  estilo?: CSSProperties;
  marca?: Record<string, string>;
  /** Id de la pieza en la plantilla (para el mapa y el editor). */
  pieza?: string;
};

// Los dibujos traen mucho blanco alrededor: se acercan para que la puerta y la palabra ANCHO se lean bien.
const ACERCAR_PUERTA: CSSProperties = { transform: "scale(1.3)", transformOrigin: "50% 50%" };
const ACERCAR_COMPUERTA: CSSProperties = { transform: "scale(1.22)", transformOrigin: "50% 53%" };

export const PASOS_MEDIR: PasoMedir[] = [
  { titulo: "Mide el ancho de tu entrada", imagen: "/media/files/puerta_buena.jpg", alt: "Puerta con una flecha que marca el ancho, de marco a marco", estilo: ACERCAR_PUERTA },
  { titulo: "Elige tu tamaño", tabla: true },
  { titulo: "Recíbela y colócala", imagen: "/media/files/Frame_603.jpg", alt: "La compuerta Diluvium puesta en la parte de abajo de una puerta", estilo: ACERCAR_COMPUERTA },
];

/** Tabla de tamaños con una flecha que baja de tamaño en tamaño y vuelve a empezar arriba (ligera: solo se mueve
 *  mientras está a la vista y solo con transform/opacity). */
export function TablaAnimada({ tamanos, columnas = ["Tamaño", "Ancho de entrada"] }: { tamanos: TamanoPaso[]; columnas?: [string, string] }) {
  const [fila, setFila] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLTableSectionElement>(null);
  const flecha = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setInterval> | undefined;
    const obs = new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (e.isIntersecting) t = setInterval(() => setFila((f) => (f + 1) % tamanos.length), 1200);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearInterval(t);
    };
  }, [tamanos.length]);

  // La flecha se desliza a la fila elegida; al volver a la primera, desaparece y aparece arriba (siempre baja).
  useEffect(() => {
    const tr = cuerpo.current?.rows[fila];
    const f = flecha.current;
    const c = caja.current;
    if (!tr || !f || !c) return;
    const y = tr.getBoundingClientRect().top - c.getBoundingClientRect().top + (tr.offsetHeight - f.offsetHeight) / 2;
    if (fila === 0 && f.dataset.y) {
      f.style.opacity = "0";
      const t = setTimeout(() => {
        f.style.transition = "none";
        f.style.transform = `translateY(${y}px)`;
        void f.offsetHeight;
        f.style.transition = "";
        f.style.opacity = "1";
      }, 220);
      f.dataset.y = String(y);
      return () => clearTimeout(t);
    }
    f.style.transform = `translateY(${y}px)`;
    f.dataset.y = String(y);
  }, [fila]);

  return (
    <div ref={caja} className="relative mx-auto w-full max-w-[320px] pl-8">
      <span
        ref={flecha}
        aria-hidden="true"
        className="absolute top-0 -left-0.5 flex h-8 w-8 items-center justify-center text-boton transition-[transform,opacity] duration-500 ease-out will-change-transform motion-reduce:transition-none"
        style={{ transform: "translateY(44px)" }}
      >
        <svg viewBox="0 0 24 24" className="size-8" fill="currentColor" focusable="false">
          <path d="M3 9.5h10V4.5l8.5 7.5-8.5 7.5v-5H3z" />
        </svg>
      </span>
      <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-linea text-[16px]">
        <thead>
          <tr className="bg-marino text-white">
            <th className="h-10 px-2.5 text-left font-titulo text-[15px] font-medium whitespace-nowrap">{columnas[0]}</th>
            <th className="h-10 px-2.5 text-left font-titulo text-[15px] font-medium whitespace-nowrap">{columnas[1]}</th>
          </tr>
        </thead>
        <tbody ref={cuerpo}>
          {tamanos.map((t, i) => (
            <tr key={t.nombre} className={`transition-colors duration-500 ${i === fila ? "bg-[#fdf1dd]" : "bg-white"}`}>
              <td className={`h-10 border-t border-linea px-2.5 whitespace-nowrap text-tinta ${i === fila ? "font-bold" : ""}`}>{t.nombre}</td>
              <td className={`h-10 border-t border-linea px-2.5 whitespace-nowrap text-tinta tabular-nums ${i === fila ? "font-bold" : ""}`}>{t.medidas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dibujo({ paso }: { paso: PasoMedir }) {
  if (!paso.imagen) return null;
  return (
    // Sin recuadro (dueño, 21-nov-2026): el dibujo ya trae fondo blanco, el mismo de la tarjeta.
    <div className="relative mx-auto aspect-square w-full max-w-[250px] overflow-hidden bg-white">
      <Image src={paso.imagen} alt={paso.alt ?? ""} fill sizes="250px" className="object-contain" style={paso.estilo} {...paso.marca} />
    </div>
  );
}

/** La tabla de tamaños hecha foto, completa y a lo ancho (en su marco, para el acercamiento del editor). Sin esquinas
 *  redondeadas: la tabla trae sus orillas cuadradas y el redondeo se comía las de abajo (dueño, 24-nov-2026). */
export function TablaFoto({ foto }: { foto: FotoTabla }) {
  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden">
      <Image src={foto.src} alt={foto.alt} width={foto.ancho} height={foto.alto} sizes="360px" className="h-auto w-full" style={foto.estilo} {...foto.marca} />
    </div>
  );
}

function Visual({ paso, tamanos, columnas }: { paso: PasoMedir; tamanos: TamanoPaso[]; columnas?: [string, string] }) {
  if (paso.tabla) return paso.fotoTabla ? <TablaFoto foto={paso.fotoTabla} /> : <TablaAnimada tamanos={tamanos} columnas={columnas} />;
  return <Dibujo paso={paso} />;
}

/** «a» · Tarjetas: cada paso en su tarjeta, número grande, título y dibujo. Con «enFila» (la parte de pasos en
 *  computadora, 24-nov-2026) las tres van una junto a otra y del mismo alto; en la ventana y en celular, una abajo de otra. */
function Tarjetas({ pasos, tamanos, columnas, enFila }: { pasos: PasoMedir[]; tamanos: TamanoPaso[]; columnas?: [string, string]; enFila?: boolean }) {
  return (
    <ol className={`m-0 grid list-none gap-3 p-0 ${enFila ? "lg:grid-cols-3 lg:gap-5" : ""}`}>
      {pasos.map((p, i) => (
        <li key={i} data-pieza={p.pieza} className={`rounded-2xl border border-linea bg-white p-4 ${enFila ? "lg:flex lg:flex-col lg:p-6" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-marino font-titulo text-[20px] font-medium text-white">{i + 1}</span>
            <h3 className="m-0 font-titulo text-[20px] leading-tight font-medium text-marino">{formato(p.titulo)}</h3>
          </div>
          <div className={`mt-3 ${enFila ? "lg:mt-5 lg:flex lg:w-full lg:flex-1 lg:items-center" : ""}`}>
            <Visual paso={p} tamanos={tamanos} columnas={columnas} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** «b» · Línea de pasos: los números unidos por una línea, como un camino de arriba abajo. */
function Linea({ pasos, tamanos }: { pasos: PasoMedir[]; tamanos: TamanoPaso[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {pasos.map((p, i) => (
        <li key={i} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
          {i < pasos.length - 1 && <span aria-hidden="true" className="absolute top-11 bottom-0 left-[20px] w-1 rounded bg-boton/30" />}
          <span className="relative z-[1] flex size-11 items-center justify-center rounded-full border-4 border-white bg-boton font-titulo text-[20px] font-medium text-white shadow">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1.5">
            <h3 className="m-0 font-titulo text-[20px] leading-tight font-medium text-marino">{formato(p.titulo)}</h3>
            <div className="mt-3">
              <Visual paso={p} tamanos={tamanos} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** «c» · Deslizable: un paso por pantalla; se desliza con el dedo o con «Siguiente». */
function Deslizable({ pasos, tamanos }: { pasos: PasoMedir[]; tamanos: TamanoPaso[] }) {
  const tira = useRef<HTMLOListElement>(null);
  const [actual, setActual] = useState(0);
  const ir = (i: number) => {
    const el = tira.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, Math.min(pasos.length - 1, i)) * el.clientWidth, behavior: "smooth" });
  };
  return (
    <div>
      <ol
        ref={tira}
        onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="m-0 flex list-none snap-x snap-mandatory overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pasos.map((p, i) => (
          <li key={i} className="w-full shrink-0 snap-start px-1">
            <div className="rounded-2xl border border-linea bg-white p-4">
              <p className="m-0 font-titulo text-[15px] font-medium text-boton">
                Paso {i + 1} de {pasos.length}
              </p>
              <h3 className="m-0 mt-1 font-titulo text-[22px] leading-tight font-medium text-marino">{formato(p.titulo)}</h3>
              <div className="mt-3 flex min-h-[270px] items-center">
                <Visual paso={p} tamanos={tamanos} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {pasos.map((p, i) => (
            <span key={i} className={`h-2.5 rounded-full transition-all ${i === actual ? "w-7 bg-marino" : "w-2.5 bg-linea"}`} />
          ))}
        </div>
        <button type="button" onClick={() => ir(actual - 1)} disabled={actual === 0} className="h-11 cursor-pointer rounded-xl border-2 border-marino px-3 font-titulo text-[15px] font-medium text-marino disabled:opacity-30">
          ←
        </button>
        <button type="button" onClick={() => ir(actual + 1)} disabled={actual === pasos.length - 1} className="h-11 cursor-pointer rounded-xl bg-marino px-4 font-titulo text-[15px] font-medium text-white disabled:opacity-30">
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export function PasosMedir({
  variante = "a",
  tamanos,
  pasos = PASOS_MEDIR,
  columnas,
  enFila,
}: {
  variante?: VariantePasos;
  tamanos: TamanoPaso[];
  pasos?: PasoMedir[];
  /** Encabezados de la tabla de tamaños. */
  columnas?: [string, string];
  /** En computadora, las tarjetas una junto a otra (solo la parte de pasos, no la ventana). */
  enFila?: boolean;
}) {
  if (variante === "b") return <Linea pasos={pasos} tamanos={tamanos} />;
  if (variante === "c") return <Deslizable pasos={pasos} tamanos={tamanos} />;
  return <Tarjetas pasos={pasos} tamanos={tamanos} columnas={columnas} enFila={enFila} />;
}
