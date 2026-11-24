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
//     La foto se ve completa en un cuadro fijo y lo que sobra se llena con la misma foto difuminada (solo CSS: es la
//     misma imagen, no baja nada de más ni pesa en Cloudflare).

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { conValores, TEXTOS_MURO, type TextosMuro } from "./textos";

const PARA_FLECHA = 18;



export type TarjetaMuro = {
  id: string;
  nombre: string;
  calificacion: number;
  texto: string;
  /** Vacío si la reseña no trae foto. */
  foto: string;
  ancho: number;
  alto: number;
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

export function MuroResenas({ tarjetas: elegidas, mas = [], textos = TEXTOS_MURO }: { tarjetas: TarjetaMuro[]; mas?: TarjetaMuro[]; textos?: TextosMuro }) {
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

  const ir = (i: number) => {
    const n = Math.min(total - 1, Math.max(0, i));
    // Pasar de la última a la vista agrega las siguientes 6 al muro.
    if (n >= cuantas) setCuantas((c) => Math.min(total, Math.max(c + DE_A, n + 1)));
    setAbierta(n);
  };
  const t = abierta === null ? null : todas[abierta];
  const siguienteAgrega = abierta !== null && abierta === cuantas - 1 && cuantas < total;
  const columnas = [tarjetas.filter((_, i) => i % 2 === 0), tarjetas.filter((_, i) => i % 2 === 1)];

  return (
    <>
      <div ref={muro} className="grid max-w-[760px] grid-cols-2 items-start gap-3 md:gap-4">
        {columnas.map((col, c) => (
          <ul key={c} className="m-0 grid list-none gap-3 p-0 md:gap-4">
            {col.map((x) => (
              <Tarjeta key={x.id} t={x} leerMas={textos.leerMas} alAbrir={() => setAbierta(tarjetas.indexOf(x))} />
            ))}
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
        <div className="mt-6 flex max-w-[760px] flex-col items-center gap-2">
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
              {t.foto && (
                // Cuadro fijo: la foto completa encima y la misma foto difuminada de fondo.
                <div key={t.id} className="relative h-[42dvh] max-h-[380px] overflow-hidden bg-tinta">
                  <Image src={t.foto} alt="" aria-hidden="true" fill sizes="560px" className="scale-110 object-cover opacity-60 blur-2xl" />
                  <Image src={t.foto} alt={`Compuerta de ${t.nombre} puesta en su entrada`} fill sizes="560px" className="object-contain" />
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
