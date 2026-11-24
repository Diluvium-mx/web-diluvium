"use client";

// Muro de reseñas en dos columnas, como en la tienda de hoy (Producto › B1-P3, 21-nov-2026): foto completa arriba,
// estrellas, nombre y el texto (cortado con «… Mostrar más» solo si es muy largo). Al tocar una reseña se abre en grande con su
// número («Reseña 3 de 6») y flechas (o deslizar, o ← →) para pasar a la anterior o a la siguiente, en el orden en
// que están puestas en la sección.
//
// Las tarjetas se reparten a la izquierda y a la derecha una y una (1 izq., 2 der., 3 izq.…), así se leen de izquierda
// a derecha igual que el orden de las flechas. data-el conserva los números del mapa que tenían antes.
//
// Todas las reseñas de la tienda (21-nov-2026, dueño): primero las 6 elegidas en la sección y abajo «Ver más», que
// agrega 6 más cada vez hasta llegar a todas (como el «Ver más» de las reseñas de la tienda de hoy). En la reseña en
// grande se cuenta sobre el total («Reseña 7 de 238») y, al llegar a la última que está a la vista, «Siguiente» dice
// «Ver 6 más» y las agrega. Las reseñas sin foto se ven solo con sus estrellas, nombre y texto.
//
// Más cómodo (21-nov-2026, dueño):
//   - con 18 o más reseñas abiertas aparece una flecha flotante que lleva a la siguiente parte (B1-P4), para no bajar
//     todas a mano;
//   - la reseña en grande siempre mide lo mismo: «Anterior» y «Siguiente» no se mueven de lugar aunque cambie la foto.
//     La foto se ve completa en un cuadro fijo y lo que sobra se llena con la misma foto difuminada, sin oscurecer y
//     con el difuminado que se elige en el editor (solo CSS: es la
//     misma imagen, no baja nada de más ni pesa en Cloudflare).
//
// Reseñas con varias fotos (dueño, 24-nov-2026; la ventana para escribir una deja subir hasta 5): la tarjeta lleva
// arriba a la derecha cuántas fotos son y, en la reseña en grande, las fotos se pasan con flechas (o deslizando sobre
// la foto) y arriba a la derecha dice cuál es («2/5»). Deslizar fuera de la foto sigue pasando de reseña.

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { conValores, TEXTOS_MURO, type TextosMuro, type TextosResenaNueva } from "./textos";
import { TarjetaInvitar, type ProductoResena } from "./EscribirResenaVersion";

const PARA_FLECHA = 18;

// En computadora el muro va en 3 columnas a lo ancho (24-nov-2026: en 2 columnas de 760 px quedaba media pantalla
// vacía). Las tarjetas se reparten en orden (1, 2, 3 arriba; 4, 5, 6 abajo…), igual que en 2 columnas en celular.
const COMPU = "(min-width: 1024px)";
const suscribirCompu = (avisar: () => void) => {
  const m = window.matchMedia(COMPU);
  m.addEventListener("change", avisar);
  return () => m.removeEventListener("change", avisar);
};



export type FotoResena = { src: string; ancho: number; alto: number };

/** Ícono de «varias fotos» (dos cuadros encimados), como el de la app de reseñas de la tienda de hoy. */
function IconoFotos({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="7.5" y="3.5" width="13" height="13" rx="2.5" />
      <path d="M16.5 20.5h-10a3 3 0 0 1-3-3v-10" strokeLinecap="round" />
    </svg>
  );
}

export type TarjetaMuro = {
  id: string;
  nombre: string;
  calificacion: number;
  texto: string;
  /** Vacío si la reseña no trae foto. */
  foto: string;
  ancho: number;
  alto: number;
  /** Todas las fotos de la reseña, la de la tarjeta primero (para pasarlas con flechas en la reseña en grande). */
  fotos?: FotoResena[];
  estilo?: CSSProperties;
  marca?: Record<string, string>;
};

// Cuándo se corta el texto (Producto/Portada B1-P3, dueño 24-nov-2026): las reseñas de hasta 200 letras se ven
// completas (9 de cada 10: la mitad mide 121 o menos); solo las más largas se cortan en una palabra cerca de las 150
// letras, con «… Mostrar más».
const COMPLETA_HASTA = 200;
const CORTE = 150;
const DE_A = 6;

/** El texto cortado en la última palabra completa antes de CORTE, sin puntuación colgando. */
function cortar(texto: string): string {
  const pedazo = texto.slice(0, CORTE);
  const espacio = pedazo.lastIndexOf(" ");
  return (espacio > CORTE * 0.6 ? pedazo.slice(0, espacio) : pedazo).replace(/[\s,;:.\-–—]+$/, "");
}

function Estrellas({ n, tamano = "size-4" }: { n: number; tamano?: string }) {
  return (
    <span className="flex text-estrella" role="img" aria-label={`${n} de 5 estrellas`} data-el="Ícono:1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${tamano} ${i <= n ? "" : "opacity-25"}`} fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8 4.7 17.7l1.2-5.9L1.4 7.7l6-.7L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Tarjeta({ t, alAbrir, leerMas }: { t: TarjetaMuro; alAbrir: () => void; leerMas: string }) {
  const texto = t.texto.trim();
  const cortado = texto.length > COMPLETA_HASTA;
  return (
    // Las que llegan con «Ver más» no llevan número en el mapa (serían cientos): solo las 6 elegidas de la sección.
    <li data-pieza={t.id} data-sin-numero={t.marca ? undefined : ""} onClick={alAbrir} className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-[1px_1px_8px_rgb(0_0_0/0.12)]">
      {t.foto && (
        <div className="relative overflow-hidden bg-niebla">
          <Image src={t.foto} alt={`Compuerta de ${t.nombre} puesta en su entrada`} width={t.ancho} height={t.alto} sizes="(min-width: 768px) 360px, 50vw" className="block h-auto w-full" style={t.estilo} {...t.marca} />
          {(t.fotos?.length ?? 0) > 1 && (
            <span data-sin-numero="" className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-tinta/70 px-2 py-1 text-[12.5px] leading-none font-semibold text-white tabular-nums">
              <IconoFotos className="size-3.5" />
              {t.fotos!.length}
              <span className="sr-only"> fotos</span>
            </span>
          )}
        </div>
      )}
      <div className="px-3.5 pt-3.5 pb-4">
        <Estrellas n={t.calificacion} />
        <p className="m-0 mt-2.5 text-[15px] leading-5 font-bold text-tinta" data-el="Texto:2">
          {t.nombre}
        </p>
        <p className="m-0 mt-2 text-[15px] leading-[1.45] break-words text-tinta" data-el="Texto:1">
          {cortado ? cortar(texto) : texto}
          {cortado && <span className="font-semibold text-texto-suave">{leerMas}</span>}
        </p>
        {/* Para teclado y lectores de pantalla (la tarjeta completa se toca con el dedo). */}
        <button type="button" onClick={alAbrir} className="sr-only">
          Leer la reseña completa de {t.nombre}
        </button>
      </div>
    </li>
  );
}

/** Difuminado del fondo de la reseña en grande, de 0 a 100 % (100 % = 40 px de desenfoque). Se cambia en el editor
 *  («Difuminado de las fotos», dueño 24-nov-2026). */
export const DIFUMINADO_INICIAL = 35;

export function MuroResenas({
  tarjetas: elegidas,
  mas = [],
  textos = TEXTOS_MURO,
  difuminado = DIFUMINADO_INICIAL,
  invitar,
}: {
  tarjetas: TarjetaMuro[];
  mas?: TarjetaMuro[];
  textos?: TextosMuro;
  difuminado?: number;
  /** Tarjeta «¿Ya tienes tu compuerta?» para escribir una reseña (24-nov-2026): va en el hueco de la columna más corta. */
  invitar?: { producto: ProductoResena; textos: TextosResenaNueva; prueba?: boolean };
}) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [cuantas, setCuantas] = useState(elegidas.length);
  const ventana = useRef<HTMLDialogElement>(null);
  const muro = useRef<HTMLDivElement>(null);
  const inicioDedo = useRef<number | null>(null);
  const [aLaVista, setALaVista] = useState(false);
  const todas = [...elegidas, ...mas];
  const total = todas.length;
  const tarjetas = todas.slice(0, cuantas);
  const verMas = () => setCuantas((c) => Math.min(total, c + DE_A));

  useEffect(() => {
    const d = ventana.current;
    if (!d) return;
    if (abierta !== null && !d.open) d.showModal();
    if (abierta === null && d.open) d.close();
  }, [abierta]);

  // La flecha flotante solo mientras el muro está en pantalla.
  useEffect(() => {
    const el = muro.current;
    if (!el || cuantas < PARA_FLECHA) return;
    const obs = new IntersectionObserver(([e]) => setALaVista(e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, [cuantas]);

  /** Lleva a la parte que sigue después de las reseñas (B1-P4), justo debajo del encabezado fijo. */
  function saltar() {
    let siguiente = muro.current?.closest("section")?.nextElementSibling ?? null;
    while (siguiente && !(siguiente as HTMLElement).dataset.seccion) siguiente = siguiente.nextElementSibling;
    if (!siguiente) return;
    const cabeza = document.querySelector<HTMLElement>("[data-seccion='landing-encabezado']")?.getBoundingClientRect().height ?? 64;
    window.scrollTo({ top: siguiente.getBoundingClientRect().top + window.scrollY - cabeza, behavior: "smooth" });
  }

  const [fotoDe, setFotoDe] = useState({ resena: -1, i: 0 });
  const ir = (i: number) => {
    const n = Math.min(total - 1, Math.max(0, i));
    // Pasar de la última a la vista agrega las siguientes 6 al muro.
    if (n >= cuantas) setCuantas((c) => Math.min(total, Math.max(c + DE_A, n + 1)));
    setAbierta(n);
    setFotoDe({ resena: -1, i: 0 });
  };
  const t = abierta === null ? null : todas[abierta];
  // Fotos de la reseña abierta y cuál se ve (cada vez que se abre o se pasa a una reseña, empieza en la primera).
  const fotosT: FotoResena[] = t ? (t.fotos?.length ? t.fotos : t.foto ? [{ src: t.foto, ancho: t.ancho, alto: t.alto }] : []) : [];
  const fi = abierta !== null && fotoDe.resena === abierta ? Math.min(fotoDe.i, fotosT.length - 1) : 0;
  const irFoto = (i: number) => abierta !== null && setFotoDe({ resena: abierta, i: Math.max(0, Math.min(fotosT.length - 1, i)) });
  const inicioDedoFoto = useRef<number | null>(null);
  const siguienteAgrega = abierta !== null && abierta === cuantas - 1 && cuantas < total;
  const enCompu = useSyncExternalStore(suscribirCompu, () => window.matchMedia(COMPU).matches, () => false);
  const n = enCompu ? 3 : 2;
  const columnas = Array.from({ length: n }, (_, c) => tarjetas.filter((_, i) => i % n === c));

  // La tarjeta para escribir una reseña va al final de la columna que termina más arriba (el hueco que dejan las fotos
  // y los textos de distinto largo). Se vuelve a medir al cargar las fotos, al abrir «Ver más» y al cambiar el ancho;
  // se mide sin contarla a ella, así no brinca de una columna a otra.
  const columnasEl = useRef<(HTMLUListElement | null)[]>([]);
  const [colInvitar, setColInvitar] = useState<number | null>(null);
  useEffect(() => {
    if (!invitar) return;
    const medir = () => {
      const fines = columnasEl.current.slice(0, n).map((ul) => {
        if (!ul) return Infinity;
        let fin = 0;
        for (const li of ul.children) {
          const e = li as HTMLElement;
          if (e.dataset.invitar === undefined) fin = Math.max(fin, e.offsetTop + e.offsetHeight);
        }
        return fin;
      });
      // La más corta; si dos terminan casi igual, la de más a la derecha.
      let elegida = 0;
      fines.forEach((f, i) => {
        if (f <= fines[elegida] + 2) elegida = i;
      });
      setColInvitar((antes) => (antes === elegida ? antes : elegida));
    };
    medir();
    const vigia = new ResizeObserver(medir);
    columnasEl.current.slice(0, n).forEach((ul) => ul && vigia.observe(ul));
    return () => vigia.disconnect();
  }, [invitar, n, cuantas]);
  const dondeInvitar = Math.min(colInvitar ?? n - 1, n - 1);

  return (
    <>
      <div ref={muro} className="grid max-w-[760px] grid-cols-2 items-start gap-3 md:gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-5">
        {columnas.map((col, c) => (
          <ul
            key={c}
            ref={(el) => {
              columnasEl.current[c] = el;
            }}
            className="m-0 grid list-none gap-3 p-0 md:gap-4"
          >
            {col.map((x) => (
              <Tarjeta key={x.id} t={x} leerMas={textos.leerMas} alAbrir={() => {
                  setAbierta(tarjetas.indexOf(x));
                  setFotoDe({ resena: -1, i: 0 });
                }} />
            ))}
            {invitar && c === dondeInvitar && <TarjetaInvitar producto={invitar.producto} textos={invitar.textos} prueba={invitar.prueba} />}
          </ul>
        ))}
      </div>
      {cuantas >= PARA_FLECHA && aLaVista && (
        <button
          type="button"
          onClick={saltar}
          aria-label="Ir a la siguiente parte (dejar de ver reseñas)"
          className="fixed right-4 bottom-[96px] z-30 flex size-14 cursor-pointer items-center justify-center rounded-full bg-marino text-white shadow-[0_10px_24px_-8px_rgba(12,30,51,0.6)] md:right-8 md:bottom-8"
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 4v15M6 13l6 6 6-6" />
          </svg>
        </button>
      )}
      {cuantas < total && (
        <div className="mt-6 flex max-w-[760px] flex-col items-center gap-2 lg:mt-8 lg:max-w-none">
          <button
            type="button"
            onClick={verMas}
            data-evento="ver_mas_resenas"
            className="flex min-h-13 w-full max-w-[340px] cursor-pointer items-center justify-center rounded-2xl border-[2.5px] border-marino bg-white px-6 font-titulo text-[17px] font-medium text-marino transition-colors hover:bg-marino hover:text-white"
          >
            {textos.verMas}
          </button>
          <p className="m-0 text-[14px] text-texto-suave tabular-nums">{conValores(textos.viendo, { n: cuantas, total })}</p>
        </div>
      )}

      <dialog
        ref={ventana}
        onClose={() => setAbierta(null)}
        onClick={(e) => e.target === ventana.current && setAbierta(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && abierta !== null) ir(abierta + 1);
          if (e.key === "ArrowLeft" && abierta !== null) ir(abierta - 1);
        }}
        aria-label={t ? conValores(textos.resena, { n: abierta! + 1, total }) : "Reseña"}
        className="version m-auto h-[min(90dvh,760px)] max-h-none w-[min(94vw,560px)] max-w-none overflow-hidden rounded-2xl bg-white p-0 text-tinta backdrop:bg-tinta/70"
      >
        {t && abierta !== null && (
          <div
            className="flex h-full flex-col"
            onPointerDown={(e) => (inicioDedo.current = e.clientX)}
            onPointerUp={(e) => {
              // Deslizar a la izquierda: la siguiente; a la derecha: la anterior.
              const d = inicioDedo.current === null ? 0 : e.clientX - inicioDedo.current;
              inicioDedo.current = null;
              if (Math.abs(d) > 50) ir(abierta + (d < 0 ? 1 : -1));
            }}
          >
            <div className="flex items-center gap-2 border-b border-linea px-4 py-2.5">
              <strong className="flex-1 font-titulo font-medium text-[16px] text-marino">
                {conValores(textos.resena, { n: abierta + 1, total })}
              </strong>
              <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[24px] leading-none hover:bg-niebla">
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {fotosT.length > 0 && (
                // Cuadro fijo: la foto completa encima y la misma foto difuminada de fondo, entera (sin oscurecer) y un poco
                // más grande para que la orilla del desenfoque no deje ver otro color (dueño, 24-nov-2026: el fondo casi
                // del mismo color que la foto, sin franjas oscuras). Con varias fotos: flechas, deslizar y «2/5».
                <div
                  key={`${t.id}-${fi}`}
                  className="relative h-[42dvh] max-h-[380px] overflow-hidden bg-niebla"
                  onPointerDown={(e) => {
                    if (fotosT.length < 2) return;
                    e.stopPropagation();
                    inicioDedoFoto.current = e.clientX;
                  }}
                  onPointerUp={(e) => {
                    if (fotosT.length < 2) return;
                    e.stopPropagation();
                    const d = inicioDedoFoto.current === null ? 0 : e.clientX - inicioDedoFoto.current;
                    inicioDedoFoto.current = null;
                    if (Math.abs(d) > 40) irFoto(fi + (d < 0 ? 1 : -1));
                  }}
                >
                  <Image
                    src={fotosT[fi].src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="560px"
                    className="scale-125 object-cover"
                    style={{ filter: `blur(${Math.round((Math.min(100, Math.max(0, difuminado)) / 100) * 40)}px)` }}
                  />
                  <Image
                    src={fotosT[fi].src}
                    alt={fotosT.length > 1 ? `Foto ${fi + 1} de ${fotosT.length} de la compuerta de ${t.nombre}` : `Compuerta de ${t.nombre} puesta en su entrada`}
                    fill
                    sizes="560px"
                    className="object-contain"
                  />
                  {fotosT.length > 1 && (
                    <>
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-tinta/75 px-2.5 py-1.5 text-[13.5px] leading-none font-semibold text-white tabular-nums" aria-live="polite">
                        <IconoFotos className="size-4" />
                        {fi + 1}/{fotosT.length}
                      </span>
                      {[
                        { dir: -1, etiqueta: "Foto anterior", lado: "left-2.5", trazo: "M15 5l-7 7 7 7" },
                        { dir: 1, etiqueta: "Foto siguiente", lado: "right-2.5", trazo: "M9 5l7 7-7 7" },
                      ].map((f) => {
                        const fin = f.dir < 0 ? fi === 0 : fi === fotosT.length - 1;
                        return (
                          <button
                            key={f.dir}
                            type="button"
                            aria-label={f.etiqueta}
                            onClick={() => irFoto(fi + f.dir)}
                            disabled={fin}
                            className={`absolute top-1/2 ${f.lado} flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-marino shadow-[0_4px_14px_-4px_rgba(12,30,51,0.5)] transition-opacity disabled:pointer-events-none disabled:opacity-0`}
                          >
                            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                              <path d={f.trazo} />
                            </svg>
                          </button>
                        );
                      })}
                      <span className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
                        {fotosT.map((_, i) => (
                          <span key={i} className={`size-2 rounded-full ${i === fi ? "bg-white" : "bg-white/50"} shadow-[0_0_3px_rgba(0,0,0,0.4)]`} />
                        ))}
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="px-5 pt-4 pb-5">
                <Estrellas n={t.calificacion} tamano="size-5" />
                <p className="m-0 mt-2.5 text-[17px] font-bold">{t.nombre}</p>
                <p className="m-0 mt-2 text-[16px] leading-[1.55] break-words whitespace-pre-line">{t.texto.trim()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-linea px-3 py-2.5">
              <button type="button" onClick={() => ir(abierta - 1)} disabled={abierta === 0} className="h-11 flex-1 cursor-pointer rounded-xl border-2 border-marino font-titulo text-[15px] font-medium text-marino disabled:cursor-not-allowed disabled:opacity-30">
                ← {textos.anterior}
              </button>
              <span className="w-16 text-center text-[14px] font-semibold text-texto-suave tabular-nums">
                {abierta + 1}/{total}
              </span>
              <button
                type="button"
                onClick={() => ir(abierta + 1)}
                disabled={abierta === total - 1}
                className={`h-11 flex-1 cursor-pointer rounded-xl border-2 border-marino font-titulo text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-30 ${siguienteAgrega ? "bg-marino text-white" : "text-marino"}`}
              >
                {siguienteAgrega ? textos.verSeisMas : textos.siguiente} →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
